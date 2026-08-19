/**
 * Browser front end. The repair itself is the library's, unchanged — this
 * file only moves bytes between a File, the pipeline and a download link.
 */

import {
  parseStl,
  repairSoup,
  writeAsciiStl,
  writeBinaryStl,
  type Diagnostics,
  type RepairActions,
  type RepairOptions,
} from 'meshchopper-stlfixer';

import {
  LOCALES,
  currentLocale,
  detectLocale,
  num,
  setLocale,
  t,
  type LocaleCode,
} from './i18n/index.js';
import type {
  ManifoldChoice,
  MeshView,
  PreviewRequest,
  RepairRequest,
  WorkerResponse,
} from './worker.js';
import type { PreviewHandle } from './preview.js';

interface Repaired {
  before: Diagnostics;
  after: Diagnostics;
  actions: RepairActions;
  manifold: { triangles: number; volume: number } | null;
  output: Uint8Array;
}

const drop = must<HTMLDivElement>('drop');
const picker = must<HTMLInputElement>('picker');
const results = must<HTMLDivElement>('results');
const languages = must<HTMLSelectElement>('lang');

const DEFAULT_OPTIONS = {
  fill: true,
  flip: true,
  largest: false,
  ascii: false,
  manifold: 'off',
  tolerance: 'auto',
  tiny: '0',
} as const;

setLocale(detectLocale(), false);
buildLanguagePicker();
buildOptionHelp();
translateStatic();

must<HTMLButtonElement>('reset-options').addEventListener('click', () => {
  must<HTMLInputElement>('fill').checked = DEFAULT_OPTIONS.fill;
  must<HTMLInputElement>('flip').checked = DEFAULT_OPTIONS.flip;
  must<HTMLInputElement>('largest').checked = DEFAULT_OPTIONS.largest;
  must<HTMLInputElement>('ascii').checked = DEFAULT_OPTIONS.ascii;
  must<HTMLSelectElement>('manifold').value = DEFAULT_OPTIONS.manifold;
  must<HTMLInputElement>('tolerance').value = DEFAULT_OPTIONS.tolerance;
  must<HTMLInputElement>('tiny').value = DEFAULT_OPTIONS.tiny;
});

function buildLanguagePicker(): void {
  for (const [code, { name }] of Object.entries(LOCALES)) {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = name;
    languages.append(option);
  }
  languages.value = currentLocale();
  languages.addEventListener('change', () => {
    setLocale(languages.value as LocaleCode);
    translateStatic();
    // Reports already on screen keep the wording they were built with;
    // re-running a file is cheap and the common case is picking a
    // language before dropping anything.
  });
}

/** Adds a "?" toggle and a hidden explanation to every repair option. */
function buildOptionHelp(): void {
  for (const option of document.querySelectorAll<HTMLElement>('.opt[data-help]')) {
    const key = option.dataset.help;
    if (!key) continue;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'help-toggle';
    toggle.textContent = '?';
    toggle.setAttribute('aria-expanded', 'false');

    const text = document.createElement('p');
    text.className = 'help-text';
    text.hidden = true;
    text.dataset.i18nHtml = key;

    toggle.addEventListener('click', () => {
      text.hidden = !text.hidden;
      toggle.setAttribute('aria-expanded', String(!text.hidden));
    });

    option.append(toggle, text);
  }
}

/** Re-renders every string that lives in the page itself. */
function translateStatic(): void {
  document.title = t('meta.title');
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', t('meta.description'));

  for (const node of document.querySelectorAll<HTMLElement>('[data-i18n]')) {
    const key = node.dataset.i18n;
    if (key) node.textContent = t(key as Parameters<typeof t>[0]);
  }
  // Help texts carry <code> markup, and their content is ours, not input.
  for (const node of document.querySelectorAll<HTMLElement>('[data-i18n-html]')) {
    const key = node.dataset.i18nHtml;
    if (key) node.innerHTML = t(key as Parameters<typeof t>[0]);
  }
  for (const node of document.querySelectorAll<HTMLElement>('[data-i18n-aria]')) {
    const key = node.dataset.i18nAria;
    if (key) node.setAttribute('aria-label', t(key as Parameters<typeof t>[0]));
  }
  for (const node of document.querySelectorAll<HTMLElement>('.help-toggle')) {
    node.setAttribute('aria-label', t('help.aria'));
  }
}

function must<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`missing #${id}`);
  return element as T;
}

function readOptions(): RepairOptions & { ascii: boolean; manifold: ManifoldChoice } {
  const tolerance = must<HTMLInputElement>('tolerance').value.trim();
  const tiny = Number.parseFloat(must<HTMLInputElement>('tiny').value);
  return {
    fillHoles: must<HTMLInputElement>('fill').checked,
    flipInverted: must<HTMLInputElement>('flip').checked,
    keepLargestShell: must<HTMLInputElement>('largest').checked,
    dropTinyShells: Number.isFinite(tiny) ? tiny : 0,
    tolerance: tolerance === '' || tolerance === 'auto' ? 'auto' : Number.parseFloat(tolerance),
    ascii: must<HTMLInputElement>('ascii').checked,
    manifold: must<HTMLSelectElement>('manifold').value as ManifoldChoice,
  };
}

drop.addEventListener('click', () => picker.click());
drop.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    picker.click();
  }
});
picker.addEventListener('change', () => {
  void handle([...(picker.files ?? [])]);
  picker.value = '';
});

for (const type of ['dragenter', 'dragover']) {
  drop.addEventListener(type, (event) => {
    event.preventDefault();
    drop.classList.add('over');
  });
}
for (const type of ['dragleave', 'drop']) {
  drop.addEventListener(type, () => drop.classList.remove('over'));
}
drop.addEventListener('drop', (event) => {
  event.preventDefault();
  const files = [...(event.dataTransfer?.files ?? [])].filter((f) => /\.stl$/i.test(f.name));
  void handle(files);
});

async function handle(files: File[]): Promise<void> {
  for (const file of files) {
    const card = pendingCard(file);
    results.prepend(card);
    // Let the browser paint the "working" row before anything heavy starts.
    await new Promise((resolve) => setTimeout(resolve, 16));
    try {
      const options = readOptions();
      const started = performance.now();
      const repaired = await repair(await file.arrayBuffer(), options);
      card.replaceWith(reportCard(file, repaired, options, performance.now() - started));
    } catch (error) {
      card.replaceWith(errorCard(file, error));
    }
  }
}

/**
 * Hand the bytes to the worker; fall back to running here if workers are
 * unavailable (opening the page straight off the filesystem, mostly).
 */
async function repair(
  buffer: ArrayBuffer,
  options: RepairOptions & { ascii: boolean; manifold: ManifoldChoice },
): Promise<Repaired> {
  const { ascii, manifold, ...repairOptions } = options;
  const worker = getWorker();
  if (!worker) {
    // Fallback path (no workers): the plain repair only — manifold3d is
    // loaded by the worker.
    const result = repairSoup(parseStl(new Uint8Array(buffer)), repairOptions);
    return {
      before: result.before,
      after: result.after,
      actions: result.actions,
      manifold: null,
      output: ascii
        ? writeAsciiStl(result.mesh, 'meshchopper-stlfixer')
        : writeBinaryStl(result.mesh, 'meshchopper-stlfixer'),
    };
  }

  const id = nextJob++;
  return new Promise<Repaired>((resolve, reject) => {
    const onMessage = (event: MessageEvent<WorkerResponse>): void => {
      const data = event.data;
      if (data.id !== id || data.kind !== 'repair') return;
      worker.removeEventListener('message', onMessage);
      if (!data.ok) reject(new Error(data.error));
      else resolve({ ...data, output: new Uint8Array(data.output) });
    };
    worker.addEventListener('message', onMessage);
    const request: RepairRequest = {
      kind: 'repair',
      id,
      buffer,
      ascii,
      manifold,
      options: repairOptions,
    };
    worker.postMessage(request, [buffer]);
  });
}

let nextJob = 1;
let worker: Worker | null | undefined;

function getWorker(): Worker | null {
  if (worker === undefined) {
    try {
      worker = new Worker('./worker.js', { type: 'module' });
    } catch {
      worker = null;
    }
  }
  return worker;
}

function pendingCard(file: File): HTMLElement {
  const card = element('section', 'card');
  card.append(cardHeader(file, t('card.working')));
  return card;
}

function errorCard(file: File, error: unknown): HTMLElement {
  const card = element('section', 'card');
  card.append(cardHeader(file, t('card.failed')));
  const rows = element('dl', 'rows');
  rows.append(term(t('row.error')), definition(message(error), 'bad'));
  card.append(rows);
  return card;
}

function reportCard(
  file: File,
  result: Repaired,
  options: RepairOptions & { ascii: boolean; manifold: ManifoldChoice },
  ms: number,
): HTMLElement {
  const { before, after, actions, output } = result;
  const { ascii } = options;
  const card = element('section', 'card');
  card.append(
    cardHeader(file, t('card.meta', { triangles: num(before.triangles), ms: Math.round(ms) })),
  );

  const rows = element('dl', 'rows');
  rows.append(
    term(t('row.size')),
    definition(
      t('size.value', {
        size: before.bbox.size.map((v) => num(v, 2)).join(' × '),
        shells: before.shells,
      }),
    ),
  );

  const found = problems(before);
  rows.append(term(t('row.found')));
  rows.append(found.length > 0 ? tags(found) : definition(t('found.clean'), 'ok'));

  const did = fixes(actions);
  if (result.manifold) {
    did.push(t('action.manifold', { triangles: num(result.manifold.triangles) }));
  }
  if (did.length > 0) {
    rows.append(term(t('row.fixed')), tags(did));
  }

  const left = problems(after);
  rows.append(term(t('row.result')));
  rows.append(
    left.length > 0
      ? tags(left)
      : definition(
          t('result.clean', { triangles: num(after.triangles), volume: num(after.volume, 2) }),
          'ok',
        ),
  );
  card.append(rows);

  const footer = element('footer');
  const verdict = element('span', `verdict ${after.watertight ? 'ok' : 'bad'}`);
  verdict.textContent = t(after.watertight ? 'verdict.repaired' : 'verdict.broken');
  footer.append(verdict);

  const preview = element('button', 'button ghost spacer') as HTMLButtonElement;
  preview.type = 'button';
  preview.textContent = t('button.preview');

  const link = document.createElement('a');
  link.className = 'button';
  link.textContent = t('button.download');
  link.download = file.name.replace(/\.stl$/i, '') + (ascii ? '-fixed.ascii.stl' : '-fixed.stl');
  link.href = URL.createObjectURL(new Blob([output as BlobPart], { type: 'model/stl' }));
  footer.append(preview, link);
  card.append(footer);

  attachPreview(card, preview, file, options);
  return card;
}

/**
 * Wires up the preview button: the panel is built on first click, and
 * three.js only downloads at that point.
 */
function attachPreview(
  card: HTMLElement,
  button: HTMLButtonElement,
  file: File,
  options: RepairOptions & { ascii: boolean; manifold: ManifoldChoice },
): void {
  let panel: HTMLElement | null = null;
  let handle: PreviewHandle | null = null;

  button.addEventListener('click', () => {
    if (panel) {
      const hidden = panel.hidden;
      panel.hidden = !hidden;
      button.textContent = t(hidden ? 'button.hidePreview' : 'button.preview');
      return;
    }
    void build();
  });

  async function build(): Promise<void> {
    button.disabled = true;
    button.textContent = t('button.building');
    try {
      const { ascii: _ascii, manifold, ...repairOptions } = options;
      const [views, module] = await Promise.all([
        previewData(await file.arrayBuffer(), repairOptions, manifold),
        import('./preview.js'),
      ]);
      panel = previewPanel(views.before.triangles, views.after.triangles);
      card.append(panel);
      handle = module.mountPreview(panel, views.before, views.after);
      wirePanel(panel, handle);
      button.textContent = t('button.hidePreview');
    } catch (error) {
      button.textContent = t('button.preview');
      const failed = element('div', 'rows');
      failed.append(term(t('row.preview')), definition(message(error), 'bad'));
      card.append(failed);
    } finally {
      button.disabled = false;
    }
  }
}

function wirePanel(panel: HTMLElement, handle: PreviewHandle): void {
  const wireframe = panel.querySelector('[data-wireframe]') as HTMLInputElement;
  const defects = panel.querySelector('[data-defects]') as HTMLInputElement;
  const jump = panel.querySelector('[data-jump]') as HTMLButtonElement;
  const reset = panel.querySelector('[data-reset]') as HTMLButtonElement;
  const counter = panel.querySelector('[data-counter]') as HTMLElement;

  wireframe.addEventListener('change', () => handle.setWireframe(wireframe.checked));
  defects.addEventListener('change', () => handle.setDefects(defects.checked));
  reset.addEventListener('click', () => handle.resetView());
  jump.addEventListener('click', () => {
    const { index, total } = handle.jumpToNextDefect();
    counter.textContent =
      total === 0 ? t('preview.none') : t('preview.counter', { index, total: num(total) });
  });
}

function previewPanel(beforeTriangles: number, afterTriangles: number): HTMLElement {
  const panel = element('div', 'preview');
  panel.innerHTML = `
    <div class="preview-bar">
      <label><input type="checkbox" data-wireframe> ${escape(t('preview.wireframe'))}</label>
      <label><input type="checkbox" data-defects checked> ${escape(t('preview.defects'))}</label>
      <button type="button" class="button ghost" data-jump>${escape(t('preview.next'))}</button>
      <button type="button" class="button ghost" data-reset>${escape(t('preview.reset'))}</button>
      <span class="counter" data-counter></span>
    </div>
    <div class="preview-stage">
      <canvas></canvas>
      <span class="preview-label left">${escape(t('preview.before', { triangles: num(beforeTriangles) }))}</span>
      <span class="preview-label right">${escape(t('preview.after', { triangles: num(afterTriangles) }))}</span>
    </div>
    <div class="legend">
      <span><i style="background:#d0453f"></i> ${escape(t('legend.backface'))}</span>
      <span><i style="background:#ff4d4d"></i> ${escape(t('legend.open'))}</span>
      <span><i style="background:#ff33cc"></i> ${escape(t('legend.nonManifold'))}</span>
      <span><i style="background:#ffb020"></i> ${escape(t('legend.flipped'))}</span>
      <span><i style="background:#ffe066"></i> ${escape(t('legend.marker'))}</span>
      <span><i style="background:#53ff9c"></i> ${escape(t('legend.cursor'))}</span>
    </div>`;
  return panel;
}

/** Asks the worker for drawable geometry of both meshes. */
async function previewData(
  buffer: ArrayBuffer,
  options: RepairOptions,
  manifold: ManifoldChoice,
): Promise<{ before: MeshView; after: MeshView }> {
  const worker = getWorker();
  if (!worker) throw new Error(t('error.noWorker'));
  const id = nextJob++;
  return new Promise((resolve, reject) => {
    const onMessage = (event: MessageEvent<WorkerResponse>): void => {
      const data = event.data;
      if (data.id !== id || data.kind !== 'preview') return;
      worker.removeEventListener('message', onMessage);
      if (!data.ok) reject(new Error(data.error));
      else resolve({ before: data.before, after: data.after });
    };
    worker.addEventListener('message', onMessage);
    const request: PreviewRequest = { kind: 'preview', id, buffer, manifold, options };
    worker.postMessage(request, [buffer]);
  });
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Translations go into a template literal here, so escape them. */
function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function cardHeader(file: File, meta: string): HTMLElement {
  const header = element('header');
  const name = element('span', 'name');
  name.textContent = file.name;
  const info = element('span', 'meta');
  info.textContent = meta;
  header.append(name, info);
  return header;
}

function problems(d: Diagnostics): string[] {
  const list: string[] = [];
  if (d.openEdges) list.push(t('defect.open', { n: num(d.openEdges) }));
  if (d.nonManifoldEdges) list.push(t('defect.nonManifold', { n: num(d.nonManifoldEdges) }));
  if (d.flippedEdges) list.push(t('defect.flipped', { n: num(d.flippedEdges) }));
  if (d.nonManifoldVertices) list.push(t('defect.bowtie', { n: num(d.nonManifoldVertices) }));
  if (d.duplicateTriangles) list.push(t('defect.duplicate', { n: num(d.duplicateTriangles) }));
  if (d.degenerateTriangles) list.push(t('defect.zeroArea', { n: num(d.degenerateTriangles) }));
  if (d.invertedShells) list.push(t('defect.inverted', { n: num(d.invertedShells) }));
  return list;
}

function fixes(a: RepairActions): string[] {
  const list: string[] = [];
  if (a.mergedVertices) list.push(t('action.welded', { n: num(a.mergedVertices) }));
  if (a.removedDegenerate) list.push(t('action.zeroArea', { n: num(a.removedDegenerate) }));
  if (a.removedDuplicates) list.push(t('action.duplicate', { n: num(a.removedDuplicates) }));
  if (a.removedNonManifold) list.push(t('action.nonManifold', { n: num(a.removedNonManifold) }));
  if (a.splitVertices) list.push(t('action.bowtie', { n: num(a.splitVertices) }));
  if (a.flippedTriangles) list.push(t('action.rewound', { n: num(a.flippedTriangles) }));
  if (a.filledHoles) {
    list.push(t('action.filled', { n: num(a.filledHoles), triangles: num(a.addedTriangles) }));
  }
  if (a.skippedHoles) list.push(t('action.skipped', { n: num(a.skippedHoles) }));
  if (a.removedShells) list.push(t('action.shells', { n: num(a.removedShells) }));
  if (a.flippedShells) list.push(t('action.flippedShells', { n: num(a.flippedShells) }));
  return list;
}

function tags(items: string[]): HTMLElement {
  const dd = element('dd');
  const wrap = element('div', 'tags');
  for (const item of items) {
    const tag = element('span', 'tag');
    tag.textContent = item;
    wrap.append(tag);
  }
  dd.append(wrap);
  return dd;
}

function term(text: string): HTMLElement {
  const dt = element('dt');
  dt.textContent = text;
  return dt;
}

function definition(text: string, className = ''): HTMLElement {
  const dd = element('dd', className);
  dd.textContent = text;
  return dd;
}

function element(tag: string, className = ''): HTMLElement {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}
