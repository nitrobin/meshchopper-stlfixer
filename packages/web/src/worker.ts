/**
 * Repair runs here so a big model cannot freeze the page. The worker owns
 * the mesh; only the report, the finished file and — when the preview asks
 * for it — plain geometry buffers cross back.
 */

import {
  analyze,
  findDefects,
  inspectSoup,
  parseStl,
  repairSoup,
  writeAsciiStl,
  writeBinaryStl,
  type Defects,
  type Diagnostics,
  type Mesh,
  type RepairActions,
  type RepairOptions,
} from 'meshchopper-stlfixer';

/** 'off' skips manifold3d entirely; the rest are its two modes. */
export type ManifoldChoice = 'off' | 'rebuild' | 'union';

export interface RepairRequest {
  kind: 'repair';
  id: number;
  buffer: ArrayBuffer;
  ascii: boolean;
  manifold: ManifoldChoice;
  options: RepairOptions;
}

export interface PreviewRequest {
  kind: 'preview';
  id: number;
  buffer: ArrayBuffer;
  manifold: ManifoldChoice;
  options: RepairOptions;
}

/** One mesh, flattened into what a WebGL buffer wants. */
export interface MeshView {
  /** Non-indexed triangle corners, 9 floats per triangle. */
  positions: Float32Array;
  triangles: number;
  /** Line segment endpoints, 6 floats per segment. */
  openEdges: Float32Array;
  nonManifoldEdges: Float32Array;
  flippedEdges: Float32Array;
  /** Single points, 3 floats each. */
  bowties: Float32Array;
  degenerate: Float32Array;
  /** Centre of every defect above, in the order they are listed. */
  hotspots: Float32Array;
  bbox: { min: [number, number, number]; max: [number, number, number] };
}

export type WorkerResponse =
  | {
      kind: 'repair';
      id: number;
      ok: true;
      before: Diagnostics;
      after: Diagnostics;
      actions: RepairActions;
      /** Set when the manifold3d pass ran; null when it was not asked for. */
      manifold: { triangles: number; volume: number } | null;
      output: ArrayBuffer;
    }
  | { kind: 'preview'; id: number; ok: true; before: MeshView; after: MeshView }
  | { kind: 'repair' | 'preview'; id: number; ok: false; error: string };

self.addEventListener('message', (event: MessageEvent<RepairRequest | PreviewRequest>) => {
  void handle(event.data);
});

async function handle(request: RepairRequest | PreviewRequest): Promise<void> {
  try {
    if (request.kind === 'repair') {
      const result = repairSoup(parseStl(new Uint8Array(request.buffer)), request.options);
      let mesh = result.mesh;
      let after = result.after;
      let manifold: { triangles: number; volume: number } | null = null;

      if (request.manifold !== 'off') {
        const rebuilt = await rebuild(mesh, request.manifold);
        mesh = rebuilt.mesh;
        after = analyze(mesh);
        manifold = { triangles: mesh.faces.length / 3, volume: rebuilt.volume };
      }

      const written = request.ascii
        ? writeAsciiStl(mesh, 'meshchopper-stlfixer')
        : writeBinaryStl(mesh, 'meshchopper-stlfixer');
      const output = new ArrayBuffer(written.byteLength);
      new Uint8Array(output).set(written);
      post(
        {
          kind: 'repair',
          id: request.id,
          ok: true,
          before: result.before,
          after,
          actions: result.actions,
          manifold,
          output,
        },
        [output],
      );
      return;
    }

    // The preview needs the mesh as it was before any repair, so the soup
    // is welded twice: once left alone, once run through the pipeline.
    const soup = parseStl(new Uint8Array(request.buffer));
    const before = view(inspectSoup(soup, request.options.tolerance ?? 'auto').mesh);
    const repaired = repairSoup(soup, request.options);
    const after = view(
      request.manifold === 'off'
        ? repaired.mesh
        : (await rebuild(repaired.mesh, request.manifold)).mesh,
    );
    post({ kind: 'preview', id: request.id, ok: true, before, after }, transfers(before, after));
  } catch (error) {
    post({
      kind: request.kind,
      id: request.id,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/** Pulled in only when asked for: the WASM is megabytes. */
async function rebuild(
  mesh: Mesh,
  mode: Exclude<ManifoldChoice, 'off'>,
): Promise<{ mesh: Mesh; volume: number }> {
  const { rebuildWithManifold } = await import('meshchopper-stlfixer/manifold');
  // The bundler puts manifold.wasm next to the worker, not next to the chunk.
  return rebuildWithManifold(mesh, mode, {
    locateWasm: () => new URL('./manifold.wasm', location.href).href,
  });
}

function post(message: WorkerResponse, transfer: Transferable[] = []): void {
  postMessage(message, transfer);
}

function transfers(...views: MeshView[]): Transferable[] {
  return views.flatMap((v) => [
    v.positions.buffer,
    v.openEdges.buffer,
    v.nonManifoldEdges.buffer,
    v.flippedEdges.buffer,
    v.bowties.buffer,
    v.degenerate.buffer,
    v.hotspots.buffer,
  ]);
}

function view(mesh: Mesh): MeshView {
  const defects = findDefects(mesh);
  const positions = new Float32Array(mesh.faces.length * 3);
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];

  for (let i = 0; i < mesh.faces.length; i++) {
    const v = mesh.faces[i] * 3;
    for (let axis = 0; axis < 3; axis++) {
      const value = mesh.positions[v + axis];
      positions[i * 3 + axis] = value;
      if (value < min[axis]) min[axis] = value;
      if (value > max[axis]) max[axis] = value;
    }
  }

  const hotspots: number[] = [];
  const lines = (edges: [number, number][]): Float32Array => {
    const out = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], i) => {
      for (let axis = 0; axis < 3; axis++) {
        out[i * 6 + axis] = mesh.positions[a * 3 + axis];
        out[i * 6 + 3 + axis] = mesh.positions[b * 3 + axis];
        hotspots.push((mesh.positions[a * 3 + axis] + mesh.positions[b * 3 + axis]) / 2);
      }
    });
    return out;
  };
  const points = (vertices: number[]): Float32Array => {
    const out = new Float32Array(vertices.length * 3);
    vertices.forEach((v, i) => {
      for (let axis = 0; axis < 3; axis++) {
        out[i * 3 + axis] = mesh.positions[v * 3 + axis];
        hotspots.push(mesh.positions[v * 3 + axis]);
      }
    });
    return out;
  };

  const openEdges = lines(defects.openEdges);
  const nonManifoldEdges = lines(defects.nonManifoldEdges);
  const flippedEdges = lines(defects.flippedEdges);
  const bowties = points(defects.bowtieVertices);
  const degenerate = points(defects.degenerateFaces.map((f) => mesh.faces[f * 3]));

  return {
    positions,
    triangles: mesh.faces.length / 3,
    openEdges,
    nonManifoldEdges,
    flippedEdges,
    bowties,
    degenerate,
    hotspots: Float32Array.from(hotspots),
    bbox: { min, max },
  };
}
