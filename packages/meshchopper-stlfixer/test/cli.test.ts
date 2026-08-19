import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { promisify } from 'node:util';

import { parseStl, weldVertices, writeBinaryStl } from '../dist/index.js';
import { cubeTriangles, toSoup } from './helpers.ts';

const run = promisify(execFile);
const CLI = new URL('../dist/cli.js', import.meta.url).pathname;

/** A cube missing its bottom face: 4 open edges, refilled as 2 triangles. */
async function brokenCube(dir: string, name = 'cube.stl'): Promise<string> {
  const triangles = cubeTriangles();
  triangles.splice(0, 2);
  const mesh = weldVertices(toSoup(triangles).vertices, 1e-9).mesh;
  const path = join(dir, name);
  await writeFile(path, writeBinaryStl(mesh, 'broken'));
  return path;
}

async function cli(args: string[]): Promise<{ code: number; stdout: string }> {
  try {
    const { stdout } = await run(process.execPath, [CLI, ...args]);
    return { code: 0, stdout };
  } catch (error) {
    const failure = error as { code?: number; stdout?: string };
    return { code: failure.code ?? 1, stdout: failure.stdout ?? '' };
  }
}

test('writes a -fixed copy next to the input and leaves the original alone', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'meshchopper-stlfixer-'));
  const input = await brokenCube(dir);
  const original = await readFile(input);

  const { code, stdout } = await cli([input]);
  assert.equal(code, 0);
  assert.match(stdout, /filled 1 holes/);
  assert.match(stdout, /clean, watertight/);

  assert.deepEqual(await readFile(input), original);
  const fixed = parseStl(await readFile(join(dir, 'cube-fixed.stl')));
  assert.equal(fixed.triangleCount, 12);
});

test('--check reports without writing and exits 1 on a broken file', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'meshchopper-stlfixer-'));
  const input = await brokenCube(dir);

  const { code, stdout } = await cli([input, '--check']);
  assert.equal(code, 1);
  assert.match(stdout, /4 open edges/);
  assert.match(stdout, /BROKEN/);
  await assert.rejects(readFile(join(dir, 'cube-fixed.stl')));
});

test('--check exits 0 once the file is repaired', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'meshchopper-stlfixer-'));
  const input = await brokenCube(dir);
  await cli([input]);
  const { code, stdout } = await cli([join(dir, 'cube-fixed.stl'), '--check']);
  assert.equal(code, 0);
  assert.match(stdout, /OK/);
});

test('--in-place overwrites and keeps a .bak of the original', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'meshchopper-stlfixer-'));
  const input = await brokenCube(dir);
  const original = await readFile(input);

  assert.equal((await cli([input, '--in-place'])).code, 0);
  assert.equal(parseStl(await readFile(input)).triangleCount, 12);
  assert.deepEqual(await readFile(`${input}.bak`), original);
});

test('--ascii writes a text STL', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'meshchopper-stlfixer-'));
  const input = await brokenCube(dir);
  await cli([input, '--ascii']);
  const text = await readFile(join(dir, 'cube-fixed.ascii.stl'), 'utf8');
  assert.match(text, /^solid meshchopper-stlfixer/);
  assert.equal(text.match(/facet normal/g)?.length, 12);
});

test('a directory input processes every stl inside', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'meshchopper-stlfixer-'));
  await brokenCube(dir, 'one.stl');
  await brokenCube(dir, 'two.stl');
  const { code, stdout } = await cli([dir, '--check']);
  assert.equal(code, 1);
  assert.match(stdout, /one\.stl/);
  assert.match(stdout, /two\.stl/);
});

test('--json prints a machine-readable report', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'meshchopper-stlfixer-'));
  const input = await brokenCube(dir);
  const { stdout } = await cli([input, '--json']);
  const parsed: unknown = JSON.parse(stdout);
  assert.ok(Array.isArray(parsed));
  const [report] = parsed as { after: { watertight: boolean }; actions: { filledHoles: number } }[];
  assert.equal(report.after.watertight, true);
  assert.equal(report.actions.filledHoles, 1);
});

test('--no-fill-holes leaves the mesh open', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'meshchopper-stlfixer-'));
  const input = await brokenCube(dir);
  const { code, stdout } = await cli([input, '--no-fill-holes']);
  assert.equal(code, 1);
  assert.match(stdout, /after: {2}4 open edges/);
  assert.equal(parseStl(await readFile(join(dir, 'cube-fixed.stl'))).triangleCount, 10);
});
