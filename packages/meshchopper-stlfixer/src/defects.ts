/**
 * Where the defects are, not just how many. `analyze()` answers "is this
 * broken"; this answers "show me", which is what a 3D preview needs.
 */

import { countNonManifoldVertices, vertexFanGroups } from './analyze.js';
import { buildEdgeMap, edgeEnds, triangleArea, type Mesh } from './mesh.js';

export interface Defects {
  /** Edges with a single triangle: the rim of a hole. */
  openEdges: [number, number][];
  /** Edges shared by three or more triangles. */
  nonManifoldEdges: [number, number][];
  /** Edges whose two triangles disagree about which way is out. */
  flippedEdges: [number, number][];
  /** Vertices where separate surface patches meet at a point. */
  bowtieVertices: number[];
  /** Triangles with no area. */
  degenerateFaces: number[];
}

export function findDefects(mesh: Mesh): Defects {
  const edges = buildEdgeMap(mesh);
  const defects: Defects = {
    openEdges: [],
    nonManifoldEdges: [],
    flippedEdges: [],
    bowtieVertices: [],
    degenerateFaces: [],
  };

  for (const [key, faces] of edges) {
    const ends = edgeEnds(key);
    if (faces.length === 1) defects.openEdges.push(ends);
    else if (faces.length > 2) defects.nonManifoldEdges.push(ends);
    else if (sameDirection(mesh, faces[0], faces[1], ends[0], ends[1])) {
      defects.flippedEdges.push(ends);
    }
  }

  for (let f = 0; f < mesh.faces.length / 3; f++) {
    const a = mesh.faces[f * 3];
    const b = mesh.faces[f * 3 + 1];
    const c = mesh.faces[f * 3 + 2];
    if (a === b || b === c || a === c || triangleArea(mesh, f) === 0) defects.degenerateFaces.push(f);
  }

  if (countNonManifoldVertices(mesh, edges) > 0) {
    const facesByVertex = new Map<number, number[]>();
    for (let f = 0; f < mesh.faces.length / 3; f++) {
      for (let e = 0; e < 3; e++) {
        const v = mesh.faces[f * 3 + e];
        const list = facesByVertex.get(v);
        if (list) list.push(f);
        else facesByVertex.set(v, [f]);
      }
    }
    for (const [v, faces] of facesByVertex) {
      if (faces.length > 1 && vertexFanGroups(mesh, edges, v, faces).length > 1) {
        defects.bowtieVertices.push(v);
      }
    }
  }

  return defects;
}

function sameDirection(mesh: Mesh, f: number, g: number, a: number, b: number): boolean {
  return forward(mesh, f, a, b) === forward(mesh, g, a, b);
}

function forward(mesh: Mesh, f: number, a: number, b: number): boolean {
  for (let e = 0; e < 3; e++) {
    if (mesh.faces[f * 3 + e] === a && mesh.faces[f * 3 + ((e + 1) % 3)] === b) return true;
  }
  return false;
}
