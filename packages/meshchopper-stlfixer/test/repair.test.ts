import assert from 'node:assert/strict';
import { test } from 'node:test';

import { analyze, isBroken, repairSoup, weldVertices } from '../dist/index.js';
import { cubeSoup, cubeTriangles, toSoup } from './helpers.ts';

const meshOf = (soup: ReturnType<typeof cubeSoup>) => weldVertices(soup.vertices, 1e-9).mesh;

test('a clean cube is left alone', () => {
  const result = repairSoup(cubeSoup());
  assert.equal(isBroken(result.after), false);
  assert.equal(result.after.triangles, 12);
  assert.equal(Math.round(result.after.volume), 1);
});

test('a hole is filled and the mesh becomes watertight', () => {
  const triangles = cubeTriangles();
  triangles.splice(0, 2); // remove the bottom face
  const before = analyze(meshOf(toSoup(triangles)));
  assert.equal(before.openEdges, 4);

  const result = repairSoup(toSoup(triangles));
  assert.equal(result.after.openEdges, 0);
  assert.ok(result.after.watertight);
  assert.equal(result.actions.filledHoles, 1);
  assert.equal(Math.round(result.after.volume), 1);
});

test('a big hole is filled with a fan from a new centre vertex', () => {
  const triangles = cubeTriangles();
  triangles.splice(0, 2);
  triangles.splice(0, 2); // now missing bottom and top: a 4-sided tube
  const result = repairSoup(toSoup(triangles));
  assert.ok(result.after.watertight);
  assert.equal(result.actions.filledHoles, 2);
});

test('a flipped triangle is re-wound', () => {
  const triangles = cubeTriangles();
  triangles[0] = [triangles[0][0], triangles[0][2], triangles[0][1]];
  const before = analyze(meshOf(toSoup(triangles)));
  assert.equal(before.flippedEdges, 3);

  const result = repairSoup(toSoup(triangles));
  assert.equal(result.after.flippedEdges, 0);
  assert.ok(result.actions.flippedTriangles > 0);
  assert.equal(Math.round(result.after.volume), 1);
});

test('a cube built inside out is turned right side out', () => {
  const triangles = cubeTriangles().map((t) => [t[0], t[2], t[1]] as typeof t);
  const before = analyze(meshOf(toSoup(triangles)));
  assert.equal(before.invertedShells, 1);

  const result = repairSoup(toSoup(triangles));
  assert.equal(result.after.invertedShells, 0);
  assert.equal(Math.round(result.after.volume), 1);
});

test('duplicate triangles are dropped', () => {
  const triangles = cubeTriangles();
  triangles.push(triangles[0], triangles[5]);
  const result = repairSoup(toSoup(triangles));
  assert.equal(result.actions.removedDuplicates, 2);
  assert.equal(result.after.triangles, 12);
  assert.ok(result.after.watertight);
});

test('zero-area triangles are dropped', () => {
  const triangles = cubeTriangles();
  triangles.push([[0, 0, 0], [1, 0, 0], [0.5, 0, 0]]);
  const result = repairSoup(toSoup(triangles));
  assert.equal(result.actions.removedDegenerate, 1);
  assert.ok(result.after.watertight);
});

test('a triangle glued to an edge makes it non-manifold, and is cut away', () => {
  const triangles = cubeTriangles();
  triangles.push([[0, 0, 0], [1, 0, 0], [0.5, -1, 0.5]]); // flap on the bottom-front edge
  const before = analyze(meshOf(toSoup(triangles)));
  assert.equal(before.nonManifoldEdges, 1);

  const result = repairSoup(toSoup(triangles));
  assert.equal(result.after.nonManifoldEdges, 0);
  assert.ok(result.actions.removedNonManifold >= 1);
  assert.ok(result.after.watertight);
});

test('two cubes touching at one corner are split into separate fans', () => {
  const shifted = cubeTriangles().map(
    (t) => t.map(([x, y, z]) => [x + 1, y + 1, z + 1]) as typeof t,
  );
  const soup = toSoup([...cubeTriangles(), ...shifted]);
  const before = analyze(meshOf(soup));
  assert.equal(before.nonManifoldVertices, 1);

  const result = repairSoup(soup);
  assert.equal(result.actions.splitVertices, 1);
  assert.equal(result.after.nonManifoldVertices, 0);
  assert.equal(result.after.shells, 2);
  assert.ok(result.after.watertight);
});

test('unwelded seams — the usual "open edges" complaint — are welded shut', () => {
  // Same cube, but every corner written with float32-level noise, the way
  // a sloppy exporter would.
  const soup = cubeSoup();
  const noisy = Float64Array.from(soup.vertices, (v, i) => v + (i % 3 === 0 ? 3e-7 : -2e-7) * (i % 2 ? 1 : -1));
  const before = analyze(weldVertices(noisy, 0).mesh);
  assert.ok(before.openEdges > 0);

  const result = repairSoup({ ...soup, vertices: noisy });
  assert.equal(result.after.openEdges, 0);
  assert.ok(result.actions.mergedVertices > 0);
});

test('tiny stray shells can be dropped', () => {
  const speck = cubeTriangles().map(
    (t) => t.map(([x, y, z]) => [x * 0.01 + 5, y * 0.01, z * 0.01]) as typeof t,
  );
  const soup = toSoup([...cubeTriangles(), ...speck]);
  assert.equal(repairSoup(soup).after.shells, 2);

  const cleaned = repairSoup(soup, { dropTinyShells: 1e-3 });
  assert.equal(cleaned.after.shells, 1);
  assert.equal(cleaned.actions.removedShells, 1);
});

test('a hollow cavity keeps its inward-facing boundary', () => {
  // A cube with a smaller cube-shaped void inside. The void's triangles
  // face into it, which is what makes it a void rather than material.
  const outer = cubeTriangles();
  const inner = cubeTriangles().map(
    (t) =>
      t
        .map(([x, y, z]) => [0.25 + x * 0.5, 0.25 + y * 0.5, 0.25 + z * 0.5])
        .reverse() as typeof t,
  );
  const soup = toSoup([...outer, ...inner]);

  const before = analyze(meshOf(soup));
  assert.equal(before.shells, 2);
  assert.equal(before.invertedShells, 0, 'the void is not an inverted shell');
  assert.equal(Math.round(before.volume * 1000) / 1000, 1 - 0.125);

  const result = repairSoup(soup);
  assert.equal(result.actions.flippedShells, 0);
  assert.equal(result.after.invertedShells, 0);
  assert.equal(Math.round(result.after.volume * 1000) / 1000, 1 - 0.125);
  assert.ok(result.after.watertight);
});

test('a genuinely inside-out separate part is still flipped', () => {
  const inverted = cubeTriangles().map(
    (t) => t.map(([x, y, z]) => [x + 3, y, z]).reverse() as typeof t,
  );
  const soup = toSoup([...cubeTriangles(), ...inverted]);

  assert.equal(analyze(meshOf(soup)).invertedShells, 1);
  const result = repairSoup(soup);
  assert.equal(result.actions.flippedShells, 1);
  assert.equal(result.after.invertedShells, 0);
  assert.equal(Math.round(result.after.volume), 2);
});
