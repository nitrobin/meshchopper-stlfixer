import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isBinaryStl, parseStl, weldVertices, writeAsciiStl, writeBinaryStl } from '../dist/index.js';
import { cubeSoup } from './helpers.ts';

const cube = weldVertices(cubeSoup().vertices, 1e-9).mesh;

test('binary round trip keeps every triangle', () => {
  const data = writeBinaryStl(cube, 'test');
  assert.ok(isBinaryStl(data));
  const parsed = parseStl(data);
  assert.equal(parsed.format, 'binary');
  assert.equal(parsed.triangleCount, 12);
  assert.equal(parsed.name, 'test');
  assert.deepEqual([...parsed.vertices].slice(0, 3), [0, 0, 0]);
});

test('ascii round trip keeps every triangle', () => {
  const data = writeAsciiStl(cube, 'cube');
  assert.equal(isBinaryStl(data), false);
  const parsed = parseStl(data);
  assert.equal(parsed.format, 'ascii');
  assert.equal(parsed.triangleCount, 12);
  assert.equal(parsed.name, 'cube');
});

test('a binary file whose header starts with "solid" is still read as binary', () => {
  const data = writeBinaryStl(cube, 'solid not really ascii');
  assert.ok(isBinaryStl(data));
  assert.equal(parseStl(data).triangleCount, 12);
});

test('welding collapses the shared corners of a triangle soup', () => {
  const soup = cubeSoup();
  assert.equal(soup.vertices.length / 3, 36);
  const welded = weldVertices(soup.vertices, 1e-9);
  assert.equal(welded.mesh.positions.length / 3, 8);
  assert.equal(welded.merged, 28);
});

test('welding merges near-coincident corners across grid cells', () => {
  const soup = cubeSoup();
  const nudged = Float64Array.from(soup.vertices, (v, i) => (i === 0 ? v + 1e-7 : v));
  assert.equal(weldVertices(nudged, 1e-6).mesh.positions.length / 3, 8);
  assert.equal(weldVertices(nudged, 1e-9).mesh.positions.length / 3, 9);
});
