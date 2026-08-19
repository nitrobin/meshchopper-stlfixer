/**
 * Bundles the page into ../../docs, which GitHub Pages serves as-is.
 * The library must be built first (npm run build -w meshchopper-stlfixer);
 * the root `npm run build` does both in workspace order.
 */
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import * as esbuild from 'esbuild';

const here = (path) => fileURLToPath(new URL(path, import.meta.url));
const outdir = here('../../../docs');

// Chunk names carry a content hash, so stale ones would pile up in git.
await rm(`${outdir}/chunks`, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });

const shared = {
  bundle: true,
  target: ['es2022'],
  minify: true,
  sourcemap: false, // the bundle is committed for Pages; keep the diff small
  logLevel: 'info',
};

// The page is a module so the 3D preview can be a dynamic import: three.js
// is the biggest thing here and only downloads when a preview is opened.
const pageConfig = {
  ...shared,
  entryPoints: [here('../src/main.ts')],
  outdir,
  entryNames: '[name]',
  chunkNames: 'chunks/[name]-[hash]',
  format: 'esm',
  splitting: true,
};

// The worker is a module too, so the optional manifold3d pass can be a
// dynamic import instead of riding along in every page load.
const workerConfig = {
  ...shared,
  entryPoints: [here('../src/worker.ts')],
  outdir,
  entryNames: '[name]',
  chunkNames: 'chunks/[name]-[hash]',
  format: 'esm',
  splitting: true,
  // manifold3d ships one glue file for both Node and the browser; its Node
  // branch never runs here, so leave those imports unresolved.
  external: ['node:*'],
};

async function copyStatic() {
  await copyFile(here('../src/index.html'), `${outdir}/index.html`);
  // manifold3d looks for its WASM next to the worker; resolve through the
  // package so a hoisted node_modules works too.
  const resolve = createRequire(import.meta.url).resolve;
  await copyFile(resolve('manifold-3d/manifold.wasm'), `${outdir}/manifold.wasm`);
  await writeFile(`${outdir}/.nojekyll`, ''); // keep Pages from touching the output
}

/**
 * The built page must run from this folder alone — no CDN, no remote
 * font, nothing to fetch at load time. Catch a stray reference here
 * rather than in someone's browser with no network.
 */
async function assertSelfContained() {
  const offsite =
    /(?:\bimport\(|importScripts\(|\bfetch\(|new Worker\(|<script[^>]+src=|<link[^>]+href=|@import\s+url\()\s*["'`]?https?:\/\//i;

  const files = await readdir(outdir, { recursive: true, withFileTypes: true });
  for (const file of files) {
    if (!file.isFile() || !/\.(js|html|css)$/.test(file.name)) continue;
    const path = `${file.parentPath}/${file.name}`;
    const match = offsite.exec(await readFile(path, 'utf8'));
    if (match) {
      throw new Error(`${path} loads something off-site: ${match[0]}`);
    }
  }
}

if (process.argv.includes('--watch')) {
  for (const config of [pageConfig, workerConfig]) {
    const context = await esbuild.context(config);
    await context.watch();
  }
  await copyStatic();
  console.log(`watching; serve with: npx serve ${outdir}`);
} else {
  await esbuild.build(pageConfig);
  await esbuild.build(workerConfig);
  await copyStatic();
  await assertSelfContained();
}
