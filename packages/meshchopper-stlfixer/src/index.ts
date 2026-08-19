/**
 * meshchopper-stlfixer — repair broken STL meshes.
 *
 * The library half is pure computation (no Node APIs) so it also runs in
 * a browser; `cli.ts` is the only file that touches the filesystem.
 */

export { analyze, isBroken, type Diagnostics } from './analyze.js';
export { findDefects, type Defects } from './defects.js';
export {
  boundingBox,
  compact,
  signedVolume,
  weldVertices,
  type Mesh,
} from './mesh.js';
export {
  cutNonManifoldEdges,
  dropShells,
  fillHoles,
  flipInvertedShells,
  inspectSoup,
  removeDegenerate,
  removeDuplicateFaces,
  repairSoup,
  repairStl,
  splitBowtieVertices,
  unifyWinding,
  type RepairActions,
  type RepairOptions,
  type RepairResult,
} from './repair.js';
// The manifold3d pass is not re-exported here on purpose: it reaches for
// an optional package, so it lives behind `meshchopper-stlfixer/manifold`
// and only costs anything when imported.
export {
  isBinaryStl,
  parseStl,
  writeAsciiStl,
  writeBinaryStl,
  type TriangleSoup,
} from './stl.js';
