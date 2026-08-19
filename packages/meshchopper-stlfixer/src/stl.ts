/**
 * STL reader / writer. Binary and ASCII, both directions.
 *
 * STL stores a triangle soup: three explicit vertices per facet, no
 * sharing. Parsing therefore yields a flat `Float64Array` of 9 numbers
 * per triangle; turning that into an indexed mesh is `weldVertices()`.
 */

const HEADER_SIZE = 80;
const TRI_SIZE = 50;

export interface TriangleSoup {
  /** Flat vertex coordinates, 9 per triangle (x,y,z * 3). */
  readonly vertices: Float64Array;
  readonly triangleCount: number;
  readonly format: 'binary' | 'ascii';
  /** Text of the 80-byte binary header / the ASCII `solid` name. */
  readonly name: string;
}

export function isBinaryStl(data: Uint8Array): boolean {
  if (data.byteLength < HEADER_SIZE + 4) return false;

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const declared = view.getUint32(HEADER_SIZE, true);
  if (HEADER_SIZE + 4 + declared * TRI_SIZE === data.byteLength) return true;

  // A binary header may textually start with "solid", so the size check
  // above wins when it matches. Otherwise look for ASCII keywords.
  const head = latin1(data.subarray(0, 512));
  if (/^\s*solid/.test(head) && /facet\s+normal/.test(head)) return false;

  // Trailing junk after the triangle data is common enough to tolerate.
  return HEADER_SIZE + 4 + declared * TRI_SIZE <= data.byteLength;
}

export function parseStl(data: Uint8Array): TriangleSoup {
  return isBinaryStl(data) ? parseBinary(data) : parseAscii(data);
}

function parseBinary(data: Uint8Array): TriangleSoup {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const declared = view.getUint32(HEADER_SIZE, true);
  const available = Math.floor((data.byteLength - HEADER_SIZE - 4) / TRI_SIZE);
  const triangleCount = Math.min(declared, Math.max(available, 0));
  if (triangleCount < declared) {
    process.emitWarning(
      `binary STL declares ${declared} triangles but only ${triangleCount} fit in the file; reading what is there`,
    );
  }

  const vertices = new Float64Array(triangleCount * 9);
  let offset = HEADER_SIZE + 4;
  for (let t = 0; t < triangleCount; t++) {
    offset += 12; // per-facet normal: recomputed on write, ignored here
    for (let v = 0; v < 9; v++) {
      vertices[t * 9 + v] = view.getFloat32(offset, true);
      offset += 4;
    }
    offset += 2; // legacy "attribute byte count"
  }

  return {
    vertices,
    triangleCount,
    format: 'binary',
    name: latin1(data.subarray(0, HEADER_SIZE)).replace(/\0.*$/s, '').trim(),
  };
}

function parseAscii(data: Uint8Array): TriangleSoup {
  const text = new TextDecoder('utf-8').decode(data);
  const coords: number[] = [];

  // Token walk rather than a regex of doom: tolerates any whitespace and
  // reports where a malformed file goes wrong.
  const tokens = text.split(/\s+/u);
  let i = 0;
  while (i < tokens.length) {
    if (tokens[i] !== 'vertex') {
      i++;
      continue;
    }
    for (let c = 1; c <= 3; c++) {
      const value = Number.parseFloat(tokens[i + c] ?? 'NaN');
      if (!Number.isFinite(value)) {
        throw new Error(`Malformed ASCII STL: non-numeric vertex near token ${i}`);
      }
      coords.push(value);
    }
    i += 4;
  }

  if (coords.length % 9 !== 0) {
    throw new Error(
      `Malformed ASCII STL: ${coords.length / 3} vertices is not a whole number of triangles`,
    );
  }

  const nameMatch = /^\s*solid\s+([^\r\n]*)/.exec(text.slice(0, 512));
  return {
    vertices: Float64Array.from(coords),
    triangleCount: coords.length / 9,
    format: 'ascii',
    name: nameMatch?.[1]?.trim() ?? '',
  };
}

/** Flat indexed mesh, as produced by `weldVertices()`. */
export interface IndexedMeshLike {
  readonly positions: readonly number[] | Float64Array;
  readonly faces: readonly number[] | Int32Array;
}

export function writeBinaryStl(mesh: IndexedMeshLike, header = 'meshchopper-stlfixer'): Uint8Array {
  const { positions, faces } = mesh;
  const triCount = faces.length / 3;
  const out = new Uint8Array(HEADER_SIZE + 4 + triCount * TRI_SIZE);
  const view = new DataView(out.buffer);

  for (let i = 0; i < header.length && i < HEADER_SIZE; i++) {
    out[i] = header.charCodeAt(i) & 0x7f;
  }
  view.setUint32(HEADER_SIZE, triCount, true);

  let offset = HEADER_SIZE + 4;
  for (let t = 0; t < triCount; t++) {
    const a = faces[t * 3] * 3;
    const b = faces[t * 3 + 1] * 3;
    const c = faces[t * 3 + 2] * 3;
    const n = faceNormal(positions, a, b, c);
    view.setFloat32(offset, n[0], true);
    view.setFloat32(offset + 4, n[1], true);
    view.setFloat32(offset + 8, n[2], true);
    offset += 12;
    for (const base of [a, b, c]) {
      view.setFloat32(offset, positions[base], true);
      view.setFloat32(offset + 4, positions[base + 1], true);
      view.setFloat32(offset + 8, positions[base + 2], true);
      offset += 12;
    }
    view.setUint16(offset, 0, true);
    offset += 2;
  }

  return out;
}

export function writeAsciiStl(mesh: IndexedMeshLike, name = 'meshchopper-stlfixer'): Uint8Array {
  const { positions, faces } = mesh;
  const lines: string[] = [`solid ${name}`];
  const num = (v: number): string => v.toPrecision(9);

  for (let t = 0; t < faces.length; t += 3) {
    const a = faces[t] * 3;
    const b = faces[t + 1] * 3;
    const c = faces[t + 2] * 3;
    const n = faceNormal(positions, a, b, c);
    lines.push(`  facet normal ${num(n[0])} ${num(n[1])} ${num(n[2])}`);
    lines.push('    outer loop');
    for (const base of [a, b, c]) {
      lines.push(
        `      vertex ${num(positions[base])} ${num(positions[base + 1])} ${num(positions[base + 2])}`,
      );
    }
    lines.push('    endloop');
    lines.push('  endfacet');
  }
  lines.push(`endsolid ${name}`, '');

  return new TextEncoder().encode(lines.join('\n'));
}

function faceNormal(
  p: readonly number[] | Float64Array,
  a: number,
  b: number,
  c: number,
): [number, number, number] {
  const ux = p[b] - p[a];
  const uy = p[b + 1] - p[a + 1];
  const uz = p[b + 2] - p[a + 2];
  const vx = p[c] - p[a];
  const vy = p[c + 1] - p[a + 1];
  const vz = p[c + 2] - p[a + 2];
  const nx = uy * vz - uz * vy;
  const ny = uz * vx - ux * vz;
  const nz = ux * vy - uy * vx;
  const len = Math.hypot(nx, ny, nz);
  return len > 0 ? [nx / len, ny / len, nz / len] : [0, 0, 0];
}

function latin1(bytes: Uint8Array): string {
  let s = '';
  for (const byte of bytes) s += String.fromCharCode(byte);
  return s;
}
