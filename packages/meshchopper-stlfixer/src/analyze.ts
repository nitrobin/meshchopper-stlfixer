/** Mesh quality scan — the numbers a slicer complains about. */

import {
  boundingBox,
  buildEdgeMap,
  faceComponents,
  facePointsForward,
  misorientedShells,
  signedVolume,
  triangleArea,
  type Mesh,
} from './mesh.js';

export interface Diagnostics {
  vertices: number;
  triangles: number;
  /** Edges used by exactly one triangle: holes in the surface. */
  openEdges: number;
  /** Edges used by three or more triangles. */
  nonManifoldEdges: number;
  /** Edges used by two triangles that walk them the same way. */
  flippedEdges: number;
  degenerateTriangles: number;
  duplicateTriangles: number;
  /** Vertices where two otherwise separate surface patches touch. */
  nonManifoldVertices: number;
  shells: number;
  /**
   * Shells facing the wrong way. A hollow cavity's boundary faces inwards
   * by design and is not counted; see `misorientedShells`.
   */
  invertedShells: number;
  watertight: boolean;
  /** mm^3, assuming the file is in mm (STL carries no units). */
  volume: number;
  /** mm^2 */
  area: number;
  bbox: { min: number[]; max: number[]; size: number[] };
}

export function analyze(mesh: Mesh): Diagnostics {
  const edges = buildEdgeMap(mesh);
  const faceCount = mesh.faces.length / 3;

  let openEdges = 0;
  let nonManifoldEdges = 0;
  let flippedEdges = 0;
  for (const [key, faces] of edges) {
    if (faces.length === 1) {
      openEdges++;
    } else if (faces.length > 2) {
      nonManifoldEdges++;
    } else {
      const a = Math.floor(key / 2 ** 26);
      const b = key % 2 ** 26;
      if (facePointsForward(mesh, faces[0], a, b) === facePointsForward(mesh, faces[1], a, b)) {
        flippedEdges++;
      }
    }
  }

  let degenerate = 0;
  let area = 0;
  const seen = new Set<string>();
  let duplicates = 0;
  for (let f = 0; f < faceCount; f++) {
    const a = mesh.faces[f * 3];
    const b = mesh.faces[f * 3 + 1];
    const c = mesh.faces[f * 3 + 2];
    if (a === b || b === c || a === c) degenerate++;
    else {
      const triArea = triangleArea(mesh, f);
      area += triArea;
      if (triArea === 0) degenerate++;
    }
    const key = [a, b, c].sort((x, y) => x - y).join(',');
    if (seen.has(key)) duplicates++;
    else seen.add(key);
  }

  const components = faceComponents(mesh, edges);
  const invertedShells = misorientedShells(mesh, components).length;

  const bbox = boundingBox(mesh);
  return {
    vertices: mesh.positions.length / 3,
    triangles: faceCount,
    openEdges,
    nonManifoldEdges,
    flippedEdges,
    degenerateTriangles: degenerate,
    duplicateTriangles: duplicates,
    nonManifoldVertices: countNonManifoldVertices(mesh, edges),
    shells: components.length,
    invertedShells,
    watertight: openEdges === 0 && nonManifoldEdges === 0 && flippedEdges === 0,
    volume: signedVolume(mesh),
    area,
    bbox: { min: bbox.min, max: bbox.max, size: bbox.size },
  };
}

/**
 * Whether a slicer would object. Zero-area triangles are deliberately
 * not counted: sealing a slit-shaped hole needs one, and they slice
 * fine — see `degenerateTriangles` if you want to know about them.
 */
export function isBroken(d: Diagnostics): boolean {
  return (
    !d.watertight || d.duplicateTriangles > 0 || d.nonManifoldVertices > 0 || d.invertedShells > 0
  );
}

/**
 * A vertex is non-manifold ("bowtie") when its incident triangles form
 * more than one fan — two cones meeting at a single point. Slicers can
 * trip over these even when every edge is fine.
 */
export function countNonManifoldVertices(mesh: Mesh, edges: Map<number, number[]>): number {
  const facesByVertex = new Map<number, number[]>();
  for (let f = 0; f < mesh.faces.length / 3; f++) {
    for (let e = 0; e < 3; e++) {
      const v = mesh.faces[f * 3 + e];
      const list = facesByVertex.get(v);
      if (list) list.push(f);
      else facesByVertex.set(v, [f]);
    }
  }

  let count = 0;
  for (const [v, faces] of facesByVertex) {
    if (faces.length < 2) continue;
    if (vertexFanGroups(mesh, edges, v, faces).length > 1) count++;
  }
  return count;
}

/**
 * Split a vertex's incident triangles into groups connected through
 * edges that also touch that vertex.
 */
export function vertexFanGroups(
  mesh: Mesh,
  edges: Map<number, number[]>,
  vertex: number,
  faces: number[],
): number[][] {
  const index = new Map<number, number>();
  faces.forEach((f, i) => index.set(f, i));
  const parent = faces.map((_, i) => i);

  const find = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  const union = (i: number, j: number): void => {
    const ri = find(i);
    const rj = find(j);
    if (ri !== rj) parent[ri] = rj;
  };

  for (const f of faces) {
    for (let e = 0; e < 3; e++) {
      const a = mesh.faces[f * 3 + e];
      const b = mesh.faces[f * 3 + ((e + 1) % 3)];
      if (a !== vertex && b !== vertex) continue;
      for (const other of edges.get(a < b ? a * 2 ** 26 + b : b * 2 ** 26 + a) ?? []) {
        const oi = index.get(other);
        if (oi !== undefined) union(index.get(f) as number, oi);
      }
    }
  }

  const groups = new Map<number, number[]>();
  faces.forEach((f, i) => {
    const root = find(i);
    const group = groups.get(root);
    if (group) group.push(f);
    else groups.set(root, [f]);
  });
  return [...groups.values()];
}
