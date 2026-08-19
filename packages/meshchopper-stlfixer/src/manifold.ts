/**
 * Optional pass through the manifold3d geometry kernel.
 *
 * 'rebuild' hands the mesh to Manifold and takes back what it emits. The
 * constructor accepts nothing that is not a valid solid, so the pass both
 * proves the result and tidies leftovers; shell count and volume come
 * back unchanged.
 *
 * 'union' additionally unions the solid with itself, which re-cuts every
 * self-intersection — the same class of repair as the Windows "Fix model"
 * button — but it also welds together parts that interpenetrate, turning
 * a print-in-place hinge into one lump.
 *
 * manifold-3d is an optional dependency and is imported only when asked
 * for, so a plain install of this package still pulls in nothing.
 */

import type { Mesh } from './mesh.js';

export type ManifoldMode = 'rebuild' | 'union';

export interface ManifoldOptions {
  /**
   * Absolute URL of manifold.wasm. Node finds it next to the package on
   * its own; a bundled browser build has to say where it put the file.
   */
  locateWasm?: () => string;
}

export interface ManifoldResult {
  mesh: Mesh;
  /** Volume as the kernel computes it, mm³. */
  volume: number;
}

export async function rebuildWithManifold(
  mesh: Mesh,
  mode: ManifoldMode,
  options: ManifoldOptions = {},
): Promise<ManifoldResult> {
  const wasm = await load(options);

  const input = new wasm.Mesh({
    numProp: 3,
    vertProperties: Float32Array.from(mesh.positions),
    triVerts: Uint32Array.from(mesh.faces),
  });
  input.merge(); // fills the merge vectors so coincident corners count as one

  const solid = wasm.Manifold.ofMesh(input);
  try {
    const status = solid.status();
    if (status !== 'NoError') {
      throw new Error(`manifold3d refused the mesh: ${status}`);
    }
    const healed = mode === 'union' ? wasm.Manifold.union(solid, solid) : solid;
    try {
      const output = healed.getMesh();
      return {
        mesh: {
          positions: Array.from(output.vertProperties),
          faces: Array.from(output.triVerts),
        },
        volume: healed.volume(),
      };
    } finally {
      if (healed !== solid) healed.delete();
    }
  } finally {
    solid.delete();
  }
}

type ManifoldModule = typeof import('manifold-3d');
type Toplevel = Awaited<ReturnType<ManifoldModule['default']>>;

let loading: Promise<Toplevel> | null = null;

function load(options: ManifoldOptions): Promise<Toplevel> {
  loading ??= import('manifold-3d')
    .catch(() => {
      throw new Error(
        'the manifold3d pass needs its optional package: npm install manifold-3d',
      );
    })
    .then(async (module) => {
      const locate = options.locateWasm;
      const wasm = await module.default(locate ? { locateFile: locate } : undefined);
      wasm.setup();
      return wasm;
    });
  return loading;
}
