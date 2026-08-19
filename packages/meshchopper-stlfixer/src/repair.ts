/**
 * Repair pipeline. Each step is small and independent; the CLI runs them
 * in this order and re-runs the cheap ones until the mesh stops changing.
 *
 *   weld -> drop degenerate -> drop duplicates -> cut non-manifold edges
 *        -> split bowtie vertices -> unify winding -> fill holes
 *        -> drop tiny shells -> flip inverted shells
 */

import { analyze, vertexFanGroups, type Diagnostics } from './analyze.js';
import {
  boundingBoxOfSoup,
  buildEdgeMap,
  compact,
  edgeEnds,
  faceComponents,
  facePointsForward,
  misorientedShells,
  keepFaces,
  signedVolume,
  triangleArea,
  weldVertices,
  type Mesh,
} from './mesh.js';
import { parseStl, type TriangleSoup } from './stl.js';

export interface RepairOptions {
  /** Vertex merge distance in mm. `'auto'` = bounding box diagonal * 1e-6. */
  tolerance?: number | 'auto';
  fillHoles?: boolean;
  /** Holes with more boundary edges than this are left open. */
  maxHoleEdges?: number;
  fixNonManifold?: boolean;
  fixWinding?: boolean;
  flipInverted?: boolean;
  /** Drop shells whose volume is below this fraction of the biggest one. */
  dropTinyShells?: number;
  keepLargestShell?: boolean;
  /** Passes of the cheap steps; more only helps on badly tangled meshes. */
  passes?: number;
}

export interface RepairActions {
  mergedVertices: number;
  removedDegenerate: number;
  removedDuplicates: number;
  removedNonManifold: number;
  splitVertices: number;
  flippedTriangles: number;
  filledHoles: number;
  addedTriangles: number;
  skippedHoles: number;
  removedShells: number;
  flippedShells: number;
}

export interface RepairResult {
  mesh: Mesh;
  before: Diagnostics;
  after: Diagnostics;
  actions: RepairActions;
  tolerance: number;
}

const DEFAULTS = {
  tolerance: 'auto',
  fillHoles: true,
  maxHoleEdges: 1000,
  fixNonManifold: true,
  fixWinding: true,
  flipInverted: true,
  dropTinyShells: 0,
  keepLargestShell: false,
  passes: 3,
} satisfies Required<RepairOptions>;

/**
 * Weld the triangle soup into an indexed mesh and report on it, without
 * changing any geometry. This is what `--check` runs.
 */
export function inspectSoup(
  soup: TriangleSoup,
  tolerance: number | 'auto' = 'auto',
): { mesh: Mesh; merged: number; tolerance: number; diagnostics: Diagnostics } {
  // STL stores float32, so coordinates carry ~1e-7 relative noise: the
  // default merge distance follows the model's own bounding box.
  const resolved =
    tolerance === 'auto'
      ? Math.max(boundingBoxOfSoup(soup.vertices).diagonal * 1e-6, 1e-9)
      : Math.max(tolerance, 0);
  const welded = weldVertices(soup.vertices, resolved);
  return {
    mesh: welded.mesh,
    merged: welded.merged,
    tolerance: resolved,
    diagnostics: analyze(welded.mesh),
  };
}

export function repairSoup(soup: TriangleSoup, options: RepairOptions = {}): RepairResult {
  const opts = { ...DEFAULTS, ...options };
  const welded = inspectSoup(soup, opts.tolerance);
  const tolerance = welded.tolerance;
  const mesh = welded.mesh;
  const before = welded.diagnostics;
  const actions: RepairActions = {
    mergedVertices: welded.merged,
    removedDegenerate: 0,
    removedDuplicates: 0,
    removedNonManifold: 0,
    splitVertices: 0,
    flippedTriangles: 0,
    filledHoles: 0,
    addedTriangles: 0,
    skippedHoles: 0,
    removedShells: 0,
    flippedShells: 0,
  };

  // Slivers and exact duplicates go first, once: every later step reads
  // the edge map, and these two only ever remove triangles.
  const areaEpsilon = tolerance * tolerance;
  actions.removedDegenerate = removeDegenerate(mesh, areaEpsilon);
  actions.removedDuplicates = removeDuplicateFaces(mesh);

  for (let pass = 0; pass < Math.max(opts.passes, 1); pass++) {
    let changed = 0;
    if (opts.fixNonManifold) {
      const cut = cutNonManifoldEdges(mesh);
      actions.removedNonManifold += cut;
      changed += cut;

      const split = splitBowtieVertices(mesh);
      actions.splitVertices += split;
      changed += split;
    }
    if (opts.fixWinding) {
      actions.flippedTriangles += unifyWinding(mesh);
    }
    if (opts.fillHoles) {
      // Sealing a slit-shaped hole can only be done with a zero-area
      // triangle; that is watertight and harmless, so it is kept.
      const filled = fillHoles(mesh, opts.maxHoleEdges);
      actions.filledHoles += filled.holes;
      actions.addedTriangles += filled.triangles;
      actions.skippedHoles = filled.skipped;
      changed += filled.holes;
    }
    if (changed === 0) break;
  }

  if (opts.keepLargestShell || opts.dropTinyShells > 0) {
    actions.removedShells += dropShells(mesh, opts.keepLargestShell, opts.dropTinyShells);
  }
  if (opts.flipInverted) {
    actions.flippedShells += flipInvertedShells(mesh);
  }

  compact(mesh);
  return { mesh, before, after: analyze(mesh), actions, tolerance };
}

export function repairStl(data: Uint8Array, options: RepairOptions = {}): RepairResult {
  return repairSoup(parseStl(data), options);
}

/** Zero-area and repeated-corner triangles. Returns how many went away. */
export function removeDegenerate(mesh: Mesh, areaEpsilon: number): number {
  return keepFaces(mesh, (f) => {
    const a = mesh.faces[f * 3];
    const b = mesh.faces[f * 3 + 1];
    const c = mesh.faces[f * 3 + 2];
    if (a === b || b === c || a === c) return false;
    return triangleArea(mesh, f) > areaEpsilon;
  });
}

/** Triangles covering the same three vertices; keeps the first one. */
export function removeDuplicateFaces(mesh: Mesh): number {
  const seen = new Set<string>();
  return keepFaces(mesh, (f) => {
    const key = [mesh.faces[f * 3], mesh.faces[f * 3 + 1], mesh.faces[f * 3 + 2]]
      .sort((x, y) => x - y)
      .join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * On an edge shared by 3+ triangles, keep the best opposing pair and drop
 * the rest — the holes that leaves are closed by `fillHoles()`.
 * Deleting a triangle can expose another over-used edge, so iterate.
 */
export function cutNonManifoldEdges(mesh: Mesh): number {
  let removedTotal = 0;
  for (let round = 0; round < 8; round++) {
    const edges = buildEdgeMap(mesh);
    const doomed = new Set<number>();
    for (const [key, faces] of edges) {
      if (faces.length <= 2) continue;
      const [a, b] = edgeEnds(key);
      const forward = faces.filter((f) => facePointsForward(mesh, f, a, b));
      const backward = faces.filter((f) => !facePointsForward(mesh, f, a, b));
      const byArea = (x: number, y: number): number => triangleArea(mesh, y) - triangleArea(mesh, x);
      forward.sort(byArea);
      backward.sort(byArea);
      const keep = new Set<number>();
      if (forward.length > 0) keep.add(forward[0]);
      if (backward.length > 0) keep.add(backward[0]);
      // No opposing partner: keep the two largest so the surface survives.
      for (const f of [...forward, ...backward].sort(byArea)) {
        if (keep.size >= 2) break;
        keep.add(f);
      }
      for (const f of faces) if (!keep.has(f)) doomed.add(f);
    }
    if (doomed.size === 0) break;
    removedTotal += keepFaces(mesh, (f) => !doomed.has(f));
  }
  return removedTotal;
}

/** Duplicate bowtie vertices so each surface fan gets its own copy. */
export function splitBowtieVertices(mesh: Mesh): number {
  const edges = buildEdgeMap(mesh);
  const facesByVertex = new Map<number, number[]>();
  for (let f = 0; f < mesh.faces.length / 3; f++) {
    for (let e = 0; e < 3; e++) {
      const v = mesh.faces[f * 3 + e];
      const list = facesByVertex.get(v);
      if (list) list.push(f);
      else facesByVertex.set(v, [f]);
    }
  }

  let split = 0;
  for (const [v, faces] of facesByVertex) {
    if (faces.length < 2) continue;
    const groups = vertexFanGroups(mesh, edges, v, faces);
    if (groups.length < 2) continue;
    split++;
    // First group keeps the original vertex; the others get clones.
    for (const group of groups.slice(1)) {
      const clone = mesh.positions.length / 3;
      mesh.positions.push(mesh.positions[v * 3], mesh.positions[v * 3 + 1], mesh.positions[v * 3 + 2]);
      for (const f of group) {
        for (let e = 0; e < 3; e++) {
          if (mesh.faces[f * 3 + e] === v) mesh.faces[f * 3 + e] = clone;
        }
      }
    }
  }
  return split;
}

/**
 * Make neighbouring triangles walk their shared edge in opposite
 * directions, flood-filling one connected patch at a time.
 */
export function unifyWinding(mesh: Mesh): number {
  const edges = buildEdgeMap(mesh);
  const faceCount = mesh.faces.length / 3;
  const neighbours = new Map<number, [number, number, number][]>(); // face -> [other, a, b]
  for (const [key, faces] of edges) {
    if (faces.length !== 2) continue;
    const [a, b] = edgeEnds(key);
    push(neighbours, faces[0], [faces[1], a, b]);
    push(neighbours, faces[1], [faces[0], a, b]);
  }

  const visited = new Uint8Array(faceCount);
  const flip = new Uint8Array(faceCount);
  let flipped = 0;

  for (let seed = 0; seed < faceCount; seed++) {
    if (visited[seed]) continue;
    visited[seed] = 1;
    const stack = [seed];
    while (stack.length > 0) {
      const f = stack.pop() as number;
      for (const [other, a, b] of neighbours.get(f) ?? []) {
        // Consistent means the two faces traverse a->b opposite ways.
        const dirF = facePointsForward(mesh, f, a, b) ? 1 : 0;
        const dirOther = facePointsForward(mesh, other, a, b) ? 1 : 0;
        const want = dirOther ^ (dirF ^ flip[f]) ^ 1;
        if (!visited[other]) {
          visited[other] = 1;
          flip[other] = want;
          stack.push(other);
        }
      }
    }
  }

  for (let f = 0; f < faceCount; f++) {
    if (!flip[f]) continue;
    const tmp = mesh.faces[f * 3 + 1];
    mesh.faces[f * 3 + 1] = mesh.faces[f * 3 + 2];
    mesh.faces[f * 3 + 2] = tmp;
    flipped++;
  }
  return flipped;
}

export interface FillResult {
  holes: number;
  triangles: number;
  skipped: number;
}

/** Close boundary loops with new triangles. */
export function fillHoles(mesh: Mesh, maxHoleEdges: number): FillResult {
  const edges = buildEdgeMap(mesh);

  // A boundary edge's missing neighbour would walk it the other way, so
  // collecting the reversed half-edges gives loops with correct winding.
  const next = new Map<number, number[]>();
  for (const [key, faces] of edges) {
    if (faces.length !== 1) continue;
    const [a, b] = edgeEnds(key);
    const [from, to] = facePointsForward(mesh, faces[0], a, b) ? [b, a] : [a, b];
    push(next, from, to);
  }

  const result: FillResult = { holes: 0, triangles: 0, skipped: 0 };
  while (next.size > 0) {
    const start = next.keys().next().value as number;
    const loop: number[] = [];
    let current = start;
    let ok = true;
    while (true) {
      const outgoing = next.get(current);
      if (!outgoing || outgoing.length === 0) {
        ok = false; // dangling chain, not a closed loop
        break;
      }
      const to = outgoing.pop() as number;
      if (outgoing.length === 0) next.delete(current);
      loop.push(current);
      if (to === start) break;
      current = to;
      if (loop.length > maxHoleEdges) {
        ok = false;
        break;
      }
    }

    if (!ok || loop.length < 3) {
      result.skipped++;
      continue;
    }
    const added = triangulateLoop(mesh, loop);
    result.holes++;
    result.triangles += added;
  }
  return result;
}

/**
 * Triangulate a boundary loop. Small loops get ear clipping in their
 * best-fit plane; bigger or awkward ones get a fan from a new centre
 * vertex, which is always watertight even when the loop is not planar.
 */
function triangulateLoop(mesh: Mesh, loop: number[]): number {
  if (loop.length === 3) {
    mesh.faces.push(loop[0], loop[1], loop[2]);
    return 1;
  }
  if (loop.length <= 8) {
    const ears = earClip(mesh, loop);
    if (ears) {
      for (const [a, b, c] of ears) mesh.faces.push(a, b, c);
      return ears.length;
    }
  }
  return centreFan(mesh, loop);
}

function centreFan(mesh: Mesh, loop: number[]): number {
  let cx = 0;
  let cy = 0;
  let cz = 0;
  for (const v of loop) {
    cx += mesh.positions[v * 3];
    cy += mesh.positions[v * 3 + 1];
    cz += mesh.positions[v * 3 + 2];
  }
  const centre = mesh.positions.length / 3;
  mesh.positions.push(cx / loop.length, cy / loop.length, cz / loop.length);
  for (let i = 0; i < loop.length; i++) {
    mesh.faces.push(centre, loop[i], loop[(i + 1) % loop.length]);
  }
  return loop.length;
}

function earClip(mesh: Mesh, loop: number[]): [number, number, number][] | null {
  const normal = newellNormal(mesh, loop);
  if (normal === null) return null;
  const [ux, uy, uz, vx, vy, vz] = planeBasis(normal);
  const pts = loop.map((v) => {
    const x = mesh.positions[v * 3];
    const y = mesh.positions[v * 3 + 1];
    const z = mesh.positions[v * 3 + 2];
    return [x * ux + y * uy + z * uz, x * vx + y * vy + z * vz] as [number, number];
  });

  const idx = pts.map((_, i) => i);
  const out: [number, number, number][] = [];
  let guard = idx.length * idx.length;
  while (idx.length > 3 && guard-- > 0) {
    let clipped = false;
    for (let i = 0; i < idx.length; i++) {
      const a = idx[(i + idx.length - 1) % idx.length];
      const b = idx[i];
      const c = idx[(i + 1) % idx.length];
      if (cross2(pts[a], pts[b], pts[c]) <= 0) continue; // reflex corner
      const contains = idx.some(
        (k) => k !== a && k !== b && k !== c && pointInTriangle(pts[k], pts[a], pts[b], pts[c]),
      );
      if (contains) continue;
      out.push([loop[a], loop[b], loop[c]]);
      idx.splice(i, 1);
      clipped = true;
      break;
    }
    if (!clipped) return null;
  }
  if (idx.length !== 3) return null;
  out.push([loop[idx[0]], loop[idx[1]], loop[idx[2]]]);
  return out;
}

function newellNormal(mesh: Mesh, loop: number[]): [number, number, number] | null {
  let nx = 0;
  let ny = 0;
  let nz = 0;
  for (let i = 0; i < loop.length; i++) {
    const a = loop[i] * 3;
    const b = loop[(i + 1) % loop.length] * 3;
    nx += (mesh.positions[a + 1] - mesh.positions[b + 1]) * (mesh.positions[a + 2] + mesh.positions[b + 2]);
    ny += (mesh.positions[a + 2] - mesh.positions[b + 2]) * (mesh.positions[a] + mesh.positions[b]);
    nz += (mesh.positions[a] - mesh.positions[b]) * (mesh.positions[a + 1] + mesh.positions[b + 1]);
  }
  const len = Math.hypot(nx, ny, nz);
  return len > 0 ? [nx / len, ny / len, nz / len] : null;
}

/** Two unit vectors spanning the plane, oriented so the loop reads CCW. */
function planeBasis(n: [number, number, number]): [number, number, number, number, number, number] {
  const helper: [number, number, number] = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  let ux = helper[1] * n[2] - helper[2] * n[1];
  let uy = helper[2] * n[0] - helper[0] * n[2];
  let uz = helper[0] * n[1] - helper[1] * n[0];
  const ulen = Math.hypot(ux, uy, uz);
  ux /= ulen;
  uy /= ulen;
  uz /= ulen;
  return [ux, uy, uz, n[1] * uz - n[2] * uy, n[2] * ux - n[0] * uz, n[0] * uy - n[1] * ux];
}

function cross2(a: [number, number], b: [number, number], c: [number, number]): number {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}

function pointInTriangle(
  p: [number, number],
  a: [number, number],
  b: [number, number],
  c: [number, number],
): boolean {
  const d1 = cross2(a, b, p);
  const d2 = cross2(b, c, p);
  const d3 = cross2(c, a, p);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
}

/**
 * Turn shells that face the wrong way right side out — the boundary of a
 * hollow cavity faces inwards on purpose and is left alone.
 */
export function flipInvertedShells(mesh: Mesh): number {
  const components = faceComponents(mesh, buildEdgeMap(mesh));
  const wrong = misorientedShells(mesh, components);
  for (const index of wrong) {
    for (const f of components[index]) {
      const tmp = mesh.faces[f * 3 + 1];
      mesh.faces[f * 3 + 1] = mesh.faces[f * 3 + 2];
      mesh.faces[f * 3 + 2] = tmp;
    }
  }
  return wrong.length;
}

/** Remove stray shells: everything but the biggest, or anything tiny. */
export function dropShells(mesh: Mesh, keepLargest: boolean, minRatio: number): number {
  const components = faceComponents(mesh, buildEdgeMap(mesh));
  if (components.length < 2) return 0;

  const volumes = components.map((members) => Math.abs(signedVolume(mesh, members)));
  const largest = Math.max(...volumes);
  const doomed = new Set<number>();
  let removed = 0;
  components.forEach((members, i) => {
    const tooSmall = minRatio > 0 && volumes[i] < largest * minRatio;
    const notLargest = keepLargest && volumes[i] < largest;
    if (!tooSmall && !notLargest) return;
    removed++;
    for (const f of members) doomed.add(f);
  });
  if (doomed.size > 0) keepFaces(mesh, (f) => !doomed.has(f));
  return removed;
}

function push<T>(map: Map<number, T[]>, key: number, value: T): void {
  const list = map.get(key);
  if (list) list.push(value);
  else map.set(key, [value]);
}
