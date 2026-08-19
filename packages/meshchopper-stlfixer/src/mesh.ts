/**
 * Indexed mesh + topology helpers shared by analysis and repair.
 *
 * Everything here is plain arrays and numbers — no Node APIs — so the
 * same code runs in a browser build.
 */

export interface Mesh {
  /** Flat vertex coordinates, 3 per vertex. */
  positions: number[];
  /** Flat vertex indices, 3 per triangle. */
  faces: number[];
}

/** Vertex index pair packed into one number, so edge maps key on numbers. */
const KEY_BASE = 2 ** 26;

export function edgeKey(a: number, b: number): number {
  return a < b ? a * KEY_BASE + b : b * KEY_BASE + a;
}

export function edgeEnds(key: number): [number, number] {
  return [Math.floor(key / KEY_BASE), key % KEY_BASE];
}

export function assertIndexable(vertexCount: number): void {
  if (vertexCount >= KEY_BASE) {
    throw new Error(`Mesh too large: ${vertexCount} vertices (limit ${KEY_BASE})`);
  }
}

export interface WeldResult {
  mesh: Mesh;
  /** How many duplicate corners collapsed into an existing vertex. */
  merged: number;
}

/**
 * Collapse coincident corners of a triangle soup into shared vertices.
 *
 * Slicers report "open edges" mostly because the exporter wrote the same
 * corner with slightly different float32 values on each side of a seam,
 * so this single step fixes the bulk of real-world breakage.
 *
 * Vertices are bucketed on a grid of `tolerance`; each lookup probes the
 * 27 surrounding cells so a pair straddling a cell border still merges.
 */
export function weldVertices(vertices: Float64Array, tolerance: number): WeldResult {
  const cell = Math.max(tolerance, Number.MIN_VALUE);
  const tol2 = tolerance * tolerance;
  // Buckets are keyed by a hash of the cell coordinates. Hash collisions
  // only add candidates to compare against, so they cost time, never
  // correctness — the distance check below is the real test.
  const grid = new Map<number, number[]>();
  const positions: number[] = [];
  const faces: number[] = [];
  let merged = 0;

  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const y = vertices[i + 1];
    const z = vertices[i + 2];
    const cx = Math.floor(x / cell);
    const cy = Math.floor(y / cell);
    const cz = Math.floor(z / cell);

    let found = -1;
    // Probe the 27 surrounding cells so a pair sitting on either side of
    // a cell border still merges.
    for (let dx = -1; dx <= 1 && found < 0; dx++) {
      for (let dy = -1; dy <= 1 && found < 0; dy++) {
        for (let dz = -1; dz <= 1 && found < 0; dz++) {
          const bucket = grid.get(cellHash(cx + dx, cy + dy, cz + dz));
          if (bucket === undefined) continue;
          for (const vi of bucket) {
            const ddx = positions[vi * 3] - x;
            const ddy = positions[vi * 3 + 1] - y;
            const ddz = positions[vi * 3 + 2] - z;
            if (ddx * ddx + ddy * ddy + ddz * ddz <= tol2) {
              found = vi;
              break;
            }
          }
        }
      }
    }

    if (found < 0) {
      found = positions.length / 3;
      positions.push(x, y, z);
      const key = cellHash(cx, cy, cz);
      const bucket = grid.get(key);
      if (bucket) bucket.push(found);
      else grid.set(key, [found]);
    } else {
      merged++;
    }
    faces.push(found);
  }

  assertIndexable(positions.length / 3);
  return { mesh: { positions, faces }, merged };
}

function cellHash(x: number, y: number, z: number): number {
  return (Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(z, 83492791)) >>> 0;
}

/** Bounding box of a raw triangle soup, before any welding. */
export function boundingBoxOfSoup(vertices: Float64Array): { size: number[]; diagonal: number } {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < vertices.length; i += 3) {
    for (let axis = 0; axis < 3; axis++) {
      const v = vertices[i + axis];
      if (v < min[axis]) min[axis] = v;
      if (v > max[axis]) max[axis] = v;
    }
  }
  if (vertices.length === 0) return { size: [0, 0, 0], diagonal: 0 };
  const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
  return { size, diagonal: Math.hypot(size[0], size[1], size[2]) };
}

/** Map of undirected edge -> indices of the triangles using it. */
export function buildEdgeMap(mesh: Mesh): Map<number, number[]> {
  const edges = new Map<number, number[]>();
  for (let f = 0; f < mesh.faces.length / 3; f++) {
    for (let e = 0; e < 3; e++) {
      const key = edgeKey(mesh.faces[f * 3 + e], mesh.faces[f * 3 + ((e + 1) % 3)]);
      const list = edges.get(key);
      if (list) list.push(f);
      else edges.set(key, [f]);
    }
  }
  return edges;
}

/** True when triangle `f` walks the edge in the a -> b direction. */
export function facePointsForward(mesh: Mesh, f: number, a: number, b: number): boolean {
  for (let e = 0; e < 3; e++) {
    if (mesh.faces[f * 3 + e] === a && mesh.faces[f * 3 + ((e + 1) % 3)] === b) return true;
  }
  return false;
}

export function triangleArea(mesh: Mesh, f: number): number {
  const p = mesh.positions;
  const a = mesh.faces[f * 3] * 3;
  const b = mesh.faces[f * 3 + 1] * 3;
  const c = mesh.faces[f * 3 + 2] * 3;
  const ux = p[b] - p[a];
  const uy = p[b + 1] - p[a + 1];
  const uz = p[b + 2] - p[a + 2];
  const vx = p[c] - p[a];
  const vy = p[c + 1] - p[a + 1];
  const vz = p[c + 2] - p[a + 2];
  return (
    0.5 * Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx)
  );
}

/** Signed volume of the closed surface formed by the given triangles. */
export function signedVolume(mesh: Mesh, faceIds?: Iterable<number>): number {
  const p = mesh.positions;
  const ids = faceIds ?? range(mesh.faces.length / 3);
  let volume = 0;
  for (const f of ids) {
    const a = mesh.faces[f * 3] * 3;
    const b = mesh.faces[f * 3 + 1] * 3;
    const c = mesh.faces[f * 3 + 2] * 3;
    volume +=
      p[a] * (p[b + 1] * p[c + 2] - p[b + 2] * p[c + 1]) +
      p[a + 1] * (p[b + 2] * p[c] - p[b] * p[c + 2]) +
      p[a + 2] * (p[b] * p[c + 1] - p[b + 1] * p[c]);
  }
  return volume / 6;
}

export function boundingBox(mesh: Mesh): { min: number[]; max: number[]; size: number[]; diagonal: number } {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < mesh.positions.length; i += 3) {
    for (let axis = 0; axis < 3; axis++) {
      const v = mesh.positions[i + axis];
      if (v < min[axis]) min[axis] = v;
      if (v > max[axis]) max[axis] = v;
    }
  }
  if (mesh.positions.length === 0) {
    return { min: [0, 0, 0], max: [0, 0, 0], size: [0, 0, 0], diagonal: 0 };
  }
  const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
  return { min, max, size, diagonal: Math.hypot(size[0], size[1], size[2]) };
}

/** Connected components of triangles, linked through shared edges. */
export function faceComponents(mesh: Mesh, edges: Map<number, number[]>): number[][] {
  const faceCount = mesh.faces.length / 3;
  const component = new Int32Array(faceCount).fill(-1);
  const byFace = new Map<number, number[]>();
  for (const faces of edges.values()) {
    for (const f of faces) {
      const list = byFace.get(f);
      if (list) list.push(...faces);
      else byFace.set(f, [...faces]);
    }
  }

  const components: number[][] = [];
  for (let seed = 0; seed < faceCount; seed++) {
    if (component[seed] >= 0) continue;
    const id = components.length;
    const stack = [seed];
    const members: number[] = [];
    component[seed] = id;
    while (stack.length > 0) {
      const f = stack.pop() as number;
      members.push(f);
      for (const n of byFace.get(f) ?? []) {
        if (component[n] < 0) {
          component[n] = id;
          stack.push(n);
        }
      }
    }
    components.push(members);
  }
  return components;
}

/**
 * Shells whose triangles face the wrong way.
 *
 * The sign of a shell's volume alone is not the answer: the boundary of a
 * hollow cavity faces inwards on purpose, and its volume is negative
 * because that is how the cavity subtracts from the solid around it.
 * Flipping it would fill the void with material.
 *
 * So a negative shell is only turned round when it is *not* enclosed by
 * another shell. Positive shells are always left alone: parity says a
 * point inside another shell's material means nesting, but in an assembly
 * whose parts interpenetrate — every print-in-place joint — that is a
 * normal state of affairs, and guessing there costs more than it wins.
 */
export function misorientedShells(mesh: Mesh, components: number[][]): number[] {
  if (components.length === 0) return [];

  const boxes = components.map((members) => shellBox(mesh, members));
  const wrong: number[] = [];

  components.forEach((members, index) => {
    if (signedVolume(mesh, members) >= 0) return;
    // Ray casting is only worth it where nesting is even possible, and a
    // shell can only sit inside another one whose box contains its own.
    const nestable = boxes.some((box, other) => other !== index && contains(box, boxes[index]));
    if (nestable && isEnclosed(mesh, components, index)) return; // a cavity
    wrong.push(index);
  });

  return wrong;
}

function shellBox(mesh: Mesh, members: number[]): { min: number[]; max: number[] } {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const f of members) {
    for (let corner = 0; corner < 3; corner++) {
      const v = mesh.faces[f * 3 + corner] * 3;
      for (let axis = 0; axis < 3; axis++) {
        const value = mesh.positions[v + axis];
        if (value < min[axis]) min[axis] = value;
        if (value > max[axis]) max[axis] = value;
      }
    }
  }
  return { min, max };
}

function contains(outer: { min: number[]; max: number[] }, inner: { min: number[]; max: number[] }): boolean {
  for (let axis = 0; axis < 3; axis++) {
    if (inner.min[axis] < outer.min[axis] || inner.max[axis] > outer.max[axis]) return false;
  }
  return true;
}

/** Odd number of crossings on the way out means the shell sits inside a void. */
function isEnclosed(mesh: Mesh, components: number[][], index: number): boolean {
  const origin = shellPoint(mesh, components[index]);
  if (!origin) return false;
  // A deliberately skew direction: axis-aligned rays hit shared edges of
  // axis-aligned models far too often.
  const direction = [0.5773502691896258, 0.3313063491, 0.7448243562];

  let crossings = 0;
  components.forEach((members, other) => {
    if (other === index) return;
    for (const f of members) {
      if (rayHitsTriangle(mesh, f, origin, direction)) crossings++;
    }
  });
  return crossings % 2 === 1;
}

/** Centre of the shell's first triangle that has any area. */
function shellPoint(mesh: Mesh, members: number[]): number[] | null {
  for (const f of members) {
    if (triangleArea(mesh, f) <= 0) continue;
    const point = [0, 0, 0];
    for (let corner = 0; corner < 3; corner++) {
      const v = mesh.faces[f * 3 + corner] * 3;
      for (let axis = 0; axis < 3; axis++) point[axis] += mesh.positions[v + axis] / 3;
    }
    return point;
  }
  return null;
}

/** Möller-Trumbore, counting hits strictly in front of the origin. */
function rayHitsTriangle(mesh: Mesh, face: number, origin: number[], direction: number[]): boolean {
  const p = mesh.positions;
  const a = mesh.faces[face * 3] * 3;
  const b = mesh.faces[face * 3 + 1] * 3;
  const c = mesh.faces[face * 3 + 2] * 3;

  const e1 = [p[b] - p[a], p[b + 1] - p[a + 1], p[b + 2] - p[a + 2]];
  const e2 = [p[c] - p[a], p[c + 1] - p[a + 1], p[c + 2] - p[a + 2]];
  const h = [
    direction[1] * e2[2] - direction[2] * e2[1],
    direction[2] * e2[0] - direction[0] * e2[2],
    direction[0] * e2[1] - direction[1] * e2[0],
  ];
  const det = e1[0] * h[0] + e1[1] * h[1] + e1[2] * h[2];
  if (Math.abs(det) < 1e-12) return false; // ray parallel to the triangle

  const invDet = 1 / det;
  const s = [origin[0] - p[a], origin[1] - p[a + 1], origin[2] - p[a + 2]];
  const u = invDet * (s[0] * h[0] + s[1] * h[1] + s[2] * h[2]);
  if (u < 0 || u > 1) return false;

  const q = [
    s[1] * e1[2] - s[2] * e1[1],
    s[2] * e1[0] - s[0] * e1[2],
    s[0] * e1[1] - s[1] * e1[0],
  ];
  const v = invDet * (direction[0] * q[0] + direction[1] * q[1] + direction[2] * q[2]);
  if (v < 0 || u + v > 1) return false;

  return invDet * (e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]) > 1e-9;
}

/** Drop unreferenced vertices and renumber the index buffer in place. */
export function compact(mesh: Mesh): void {
  const remap = new Int32Array(mesh.positions.length / 3).fill(-1);
  const positions: number[] = [];
  for (let i = 0; i < mesh.faces.length; i++) {
    const v = mesh.faces[i];
    let mapped = remap[v];
    if (mapped < 0) {
      mapped = positions.length / 3;
      remap[v] = mapped;
      positions.push(mesh.positions[v * 3], mesh.positions[v * 3 + 1], mesh.positions[v * 3 + 2]);
    }
    mesh.faces[i] = mapped;
  }
  mesh.positions = positions;
}

export function keepFaces(mesh: Mesh, keep: (face: number) => boolean): number {
  const faces: number[] = [];
  let removed = 0;
  for (let f = 0; f < mesh.faces.length / 3; f++) {
    if (keep(f)) faces.push(mesh.faces[f * 3], mesh.faces[f * 3 + 1], mesh.faces[f * 3 + 2]);
    else removed++;
  }
  mesh.faces = faces;
  return removed;
}

function* range(n: number): Generator<number> {
  for (let i = 0; i < n; i++) yield i;
}
