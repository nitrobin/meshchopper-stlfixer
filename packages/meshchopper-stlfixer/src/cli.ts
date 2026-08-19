#!/usr/bin/env node
/** Command line front end: file I/O, options, report. */

import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

import { isBroken, type Diagnostics } from './analyze.js';
import { analyze } from './analyze.js';
import { rebuildWithManifold, type ManifoldMode } from './manifold.js';
import { inspectSoup, repairSoup, type RepairOptions, type RepairResult } from './repair.js';
import { parseStl, writeAsciiStl, writeBinaryStl } from './stl.js';

const USAGE = `meshchopper-stlfixer — repair broken STL files (non-manifold edges, holes, flipped normals)

Usage
  meshchopper-stlfixer <file.stl|dir> [more...] [options]

Options
  -o, --out <path>        Output file (single input) or output directory
      --in-place          Overwrite the input; keeps a .bak copy unless --no-backup
      --suffix <text>     Suffix for the default output name       (default "-fixed")
  -c, --check             Report only, write nothing; exit 1 if a file is broken
  -r, --recursive         Descend into subdirectories when given a directory
      --ascii             Write ASCII STL instead of binary
      --tolerance <mm>    Vertex merge distance; "auto" = bbox diagonal * 1e-6
      --no-fill-holes     Leave holes open
      --max-hole-edges <n>  Skip holes with more boundary edges     (default 1000)
      --keep-largest      Keep only the biggest shell
      --drop-tiny-shells <ratio>  Drop shells below ratio * biggest shell volume
      --no-flip-inverted  Do not turn inside-out shells right side out
      --manifold <mode>   Extra pass through manifold3d: off (default), rebuild
                          (validates and tidies, keeps shells and volume) or
                          union (also re-cuts self-intersections, but welds
                          overlapping parts together). Needs the optional
                          manifold-3d package.
      --json              Machine-readable report on stdout
  -q, --quiet             Only print problems
  -h, --help              This text
      --version           Print version

Examples
  meshchopper-stlfixer cat.stl               # writes cat-fixed.stl next to it
  meshchopper-stlfixer cat.stl -o clean.stl
  meshchopper-stlfixer models/ -r --in-place
  meshchopper-stlfixer cat.stl --check --json
  meshchopper-stlfixer cat.stl --manifold rebuild
`;

interface FileReport {
  input: string;
  output: string | null;
  before: Diagnostics;
  after: Diagnostics;
  actions: RepairResult['actions'] | null;
  tolerance: number;
  manifold: { mode: ManifoldMode; triangles: number; volume: number } | null;
  stillBroken: boolean;
}

async function main(argv: string[]): Promise<number> {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      out: { type: 'string', short: 'o' },
      'in-place': { type: 'boolean', default: false },
      'no-backup': { type: 'boolean', default: false },
      suffix: { type: 'string', default: '-fixed' },
      check: { type: 'boolean', short: 'c', default: false },
      recursive: { type: 'boolean', short: 'r', default: false },
      ascii: { type: 'boolean', default: false },
      tolerance: { type: 'string', default: 'auto' },
      'no-fill-holes': { type: 'boolean', default: false },
      'max-hole-edges': { type: 'string', default: '1000' },
      'keep-largest': { type: 'boolean', default: false },
      'drop-tiny-shells': { type: 'string', default: '0' },
      'no-flip-inverted': { type: 'boolean', default: false },
      manifold: { type: 'string', default: 'off' },
      json: { type: 'boolean', default: false },
      quiet: { type: 'boolean', short: 'q', default: false },
      help: { type: 'boolean', short: 'h', default: false },
      version: { type: 'boolean', default: false },
    },
  });

  if (values.version) {
    process.stdout.write(`${await readVersion()}\n`);
    return 0;
  }
  if (values.help || positionals.length === 0) {
    process.stdout.write(USAGE);
    return values.help ? 0 : 2;
  }

  const inputs = await collectInputs(positionals, values.recursive);
  if (inputs.length === 0) {
    process.stderr.write('No .stl files found\n');
    return 2;
  }
  if (values.out && inputs.length > 1 && !(await isDirectory(values.out))) {
    process.stderr.write('--out must be an existing directory when there are several inputs\n');
    return 2;
  }

  const manifoldMode = parseManifold(values.manifold);
  const options: RepairOptions = {
    tolerance: values.tolerance === 'auto' ? 'auto' : requireNumber(values.tolerance, '--tolerance'),
    fillHoles: !values['no-fill-holes'],
    maxHoleEdges: requireNumber(values['max-hole-edges'], '--max-hole-edges'),
    flipInverted: !values['no-flip-inverted'],
    keepLargestShell: values['keep-largest'],
    dropTinyShells: requireNumber(values['drop-tiny-shells'], '--drop-tiny-shells'),
  };

  const reports: FileReport[] = [];
  let failures = 0;
  for (const input of inputs) {
    const data = await readFile(input);
    const soup = parseStl(data);

    if (values.check) {
      const inspected = inspectSoup(soup, options.tolerance);
      const broken = isBroken(inspected.diagnostics);
      if (broken) failures++;
      reports.push({
        input,
        output: null,
        before: inspected.diagnostics,
        after: inspected.diagnostics,
        actions: null,
        tolerance: inspected.tolerance,
        manifold: null,
        stillBroken: broken,
      });
      continue;
    }

    const result = repairSoup(soup, options);
    let mesh = result.mesh;
    let after = result.after;
    let manifold: FileReport['manifold'] = null;
    if (manifoldMode) {
      const rebuilt = await rebuildWithManifold(mesh, manifoldMode);
      mesh = rebuilt.mesh;
      after = analyze(mesh);
      manifold = { mode: manifoldMode, triangles: after.triangles, volume: rebuilt.volume };
    }

    const output = await resolveOutput(input, values.out, values['in-place'], values.suffix, values.ascii);
    if (values['in-place'] && !values['no-backup']) {
      await writeFile(`${input}.bak`, data);
    }
    const encoded = values.ascii
      ? writeAsciiStl(mesh, 'meshchopper-stlfixer')
      : writeBinaryStl(mesh, `meshchopper-stlfixer ${await readVersion()}`);
    await writeFile(output, encoded);

    const stillBroken = isBroken(after);
    if (stillBroken) failures++;
    reports.push({
      input,
      output,
      before: result.before,
      after,
      actions: result.actions,
      tolerance: result.tolerance,
      manifold,
      stillBroken,
    });
  }

  if (values.json) {
    process.stdout.write(`${JSON.stringify(reports, null, 2)}\n`);
  } else {
    for (const report of reports) printReport(report, values.check, values.quiet);
  }
  return failures > 0 ? 1 : 0;
}

function printReport(report: FileReport, checkOnly: boolean, quiet: boolean): void {
  const { before, after } = report;
  const out = (line: string): void => void process.stdout.write(`${line}\n`);
  const problems = (d: Diagnostics): string[] => {
    const list: string[] = [];
    if (d.openEdges) list.push(`${d.openEdges} open edges`);
    if (d.nonManifoldEdges) list.push(`${d.nonManifoldEdges} non-manifold edges`);
    if (d.flippedEdges) list.push(`${d.flippedEdges} flipped edges`);
    if (d.nonManifoldVertices) list.push(`${d.nonManifoldVertices} bowtie vertices`);
    if (d.degenerateTriangles) list.push(`${d.degenerateTriangles} zero-area triangles`);
    if (d.duplicateTriangles) list.push(`${d.duplicateTriangles} duplicate triangles`);
    if (d.invertedShells) list.push(`${d.invertedShells} inverted shells`);
    return list;
  };

  if (quiet && !report.stillBroken && checkOnly) return;

  out(report.input);
  const size = before.bbox.size.map((v) => v.toFixed(2)).join(' x ');
  out(`  ${before.triangles} triangles, ${before.shells} shell(s), ${size} mm`);
  out(`  before: ${problems(before).join(', ') || 'clean'}`);
  const actions = report.actions;
  if (checkOnly || actions === null) {
    out(`  ${report.stillBroken ? 'BROKEN — run without --check to repair' : 'OK'}`);
    out('');
    return;
  }

  const did: string[] = [];
  if (actions.mergedVertices) did.push(`merged ${actions.mergedVertices} duplicate vertices`);
  if (actions.removedDegenerate) did.push(`dropped ${actions.removedDegenerate} degenerate triangles`);
  if (actions.removedDuplicates) did.push(`dropped ${actions.removedDuplicates} duplicate triangles`);
  if (actions.removedNonManifold) did.push(`cut ${actions.removedNonManifold} non-manifold triangles`);
  if (actions.splitVertices) did.push(`split ${actions.splitVertices} bowtie vertices`);
  if (actions.flippedTriangles) did.push(`re-wound ${actions.flippedTriangles} triangles`);
  if (actions.filledHoles) did.push(`filled ${actions.filledHoles} holes (+${actions.addedTriangles} triangles)`);
  if (actions.skippedHoles) did.push(`skipped ${actions.skippedHoles} holes`);
  if (actions.removedShells) did.push(`removed ${actions.removedShells} shells`);
  if (actions.flippedShells) did.push(`flipped ${actions.flippedShells} inverted shells`);
  if (report.manifold) {
    did.push(
      `manifold3d ${report.manifold.mode}: ${report.manifold.triangles} triangles, ` +
        `${report.manifold.volume.toFixed(2)} mm3`,
    );
  }
  out(`  fixed:  ${did.join(', ') || 'nothing to do'}`);
  out(`  after:  ${problems(after).join(', ') || 'clean, watertight'}`);
  out(`  volume: ${before.volume.toFixed(2)} -> ${after.volume.toFixed(2)} mm3, ${after.triangles} triangles`);
  out(`  wrote:  ${report.output}`);
  out('');
}

async function collectInputs(paths: string[], recursive: boolean): Promise<string[]> {
  const files: string[] = [];
  for (const path of paths) {
    const info = await stat(path).catch(() => null);
    if (!info) throw new Error(`No such file or directory: ${path}`);
    if (info.isDirectory()) {
      const entries = await readdir(path, { withFileTypes: true, recursive });
      for (const entry of entries) {
        if (!entry.isFile() || extname(entry.name).toLowerCase() !== '.stl') continue;
        files.push(join(entry.parentPath ?? path, entry.name));
      }
    } else {
      files.push(path);
    }
  }
  return [...new Set(files.map((f) => resolve(f)))].sort();
}

async function resolveOutput(
  input: string,
  out: string | undefined,
  inPlace: boolean,
  suffix: string,
  ascii: boolean,
): Promise<string> {
  if (inPlace) return input;
  if (out) return (await isDirectory(out)) ? join(out, basenameFixed(input, suffix, ascii)) : out;
  return join(resolve(input, '..'), basenameFixed(input, suffix, ascii));
}

function basenameFixed(input: string, suffix: string, ascii: boolean): string {
  const name = input.replace(/^.*[\\/]/, '');
  const ext = extname(name);
  return `${name.slice(0, name.length - ext.length)}${suffix}${ascii ? '.ascii.stl' : '.stl'}`;
}

async function isDirectory(path: string): Promise<boolean> {
  const info = await stat(path).catch(() => null);
  return info?.isDirectory() ?? false;
}

/** null means "do not run manifold3d at all". */
function parseManifold(value: string): ManifoldMode | null {
  if (value === 'off') return null;
  if (value === 'rebuild' || value === 'union') return value;
  throw new Error(`--manifold expects off, rebuild or union, got "${value}"`);
}

function requireNumber(value: string, flag: string): number {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) throw new Error(`${flag} expects a number, got "${value}"`);
  return parsed;
}

async function readVersion(): Promise<string> {
  const pkg = new URL('../package.json', import.meta.url);
  const parsed: unknown = JSON.parse(await readFile(pkg, 'utf8'));
  return typeof parsed === 'object' && parsed !== null && 'version' in parsed
    ? String((parsed as { version: unknown }).version)
    : '0.0.0';
}

try {
  process.exitCode = await main(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`meshchopper-stlfixer: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 2;
}
