/** Shared fixtures: hand-built triangle soups with known defects. */

import type { TriangleSoup } from '../dist/index.js';

const CORNERS: [number, number, number][] = [
  [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
  [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1],
];

/** Outward-facing triangles of a unit cube, as corner indices. */
const CUBE_FACES: [number, number, number][] = [
  [0, 2, 1], [0, 3, 2], // bottom
  [4, 5, 6], [4, 6, 7], // top
  [0, 1, 5], [0, 5, 4], // front
  [1, 2, 6], [1, 6, 5], // right
  [2, 3, 7], [2, 7, 6], // back
  [3, 0, 4], [3, 4, 7], // left
];

export function cubeTriangles(): [number, number, number][][] {
  return CUBE_FACES.map((f) => f.map((c) => CORNERS[c]) as [number, number, number][]);
}

export function toSoup(triangles: [number, number, number][][]): TriangleSoup {
  return {
    vertices: Float64Array.from(triangles.flat(2)),
    triangleCount: triangles.length,
    format: 'binary',
    name: 'test',
  };
}

export function cubeSoup(): TriangleSoup {
  return toSoup(cubeTriangles());
}
