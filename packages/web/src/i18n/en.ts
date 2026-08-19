/**
 * The source of truth for every user-visible string. Other locales are
 * typed against this object, so a missing or stray key fails typecheck.
 *
 * Counts are written as "label: 12" rather than "12 labels" on purpose:
 * it sidesteps plural rules, which differ wildly across these languages,
 * and reads the same in the compact chips the report uses.
 */
export const en = {
  'meta.title': 'Mesh Chopper - STL Fixer — repair STL files in the browser',
  'meta.description':
    'Drop an STL your slicer rejects: non-manifold edges, open edges, flipped normals. Repaired locally in your browser, nothing is uploaded.',

  'lang.label': 'Language',

  'tagline.lead':
    'Drop an STL your slicer rejects — non-manifold edges, open edges, inside-out normals.',
  'tagline.local': 'Everything runs in this tab',
  'tagline.rest': '; no file ever leaves your machine.',

  'drop.title.strong': 'Drop .stl files here',
  'drop.title.rest': ' or click to choose',
  'drop.hint': 'Binary or ASCII · several at once · repaired copy downloads as',
  'drop.aria': 'Choose STL files',

  'options.summary': 'Repair options',
  'options.fill': 'Fill holes',
  'options.flip': 'Flip inside-out shells',
  'options.largest': 'Keep only the biggest shell',
  'options.ascii': 'Write ASCII STL',
  'options.tolerance': 'Weld tolerance',
  'options.tiny.before': 'Drop shells below',
  'options.tiny.after': '× biggest',
  'options.manifold': 'manifold3d pass',
  'manifold.off': 'off',
  'manifold.rebuild': 'rebuild (keeps parts)',
  'manifold.union': 'union (fuses parts)',
  'options.reset': 'Reset to defaults',

  'help.aria': 'What does this option do?',
  'help.fill':
    'Traces the rim of every hole and triangulates it — ear clipping for small rims, a fan from a new centre point for big or awkward ones. Switched off, holes stay open and the file stays leaky.',
  'help.flip':
    'Measures the signed volume of each shell; a negative one is inside out, so all of its triangles are re-wound. Healthy models are left alone.',
  'help.largest':
    'Keeps the shell with the biggest volume and deletes every other one. Handy when stray specks travel with the part — but a model that is legitimately several parts loses them, so check the shell count in the report first.',
  'help.ascii':
    'Writes the text flavour of STL instead of binary: roughly five times bigger, but readable and diffable. Slicers accept both.',
  'help.manifold':
    'A second opinion from manifold3d, the geometry kernel behind several CAD tools. <code>rebuild</code> feeds the mesh through it: manifold3d accepts nothing that is not a valid solid, so this both proves the result and tidies leftovers, while shell count and volume stay put. <code>union</code> additionally unions the solid with itself, which re-cuts self-intersections — the same class of repair as the Windows “Fix model” button — but it also welds together parts that overlap, so a print-in-place hinge comes out as one fused lump. Both modes download about 0.5 MB of WebAssembly the first time they run.',
  'help.tolerance':
    'Two vertices closer than this, in millimetres, become one — that is what closes seams a slicer reports as open edges. <code>auto</code> is the bounding box diagonal × 1e-6 (about 0.0001 mm on a 100 mm model), matching the float32 noise STL stores. Any number from 0 up is accepted; 0 merges only exactly equal vertices, and too large a value swallows fine detail.',
  'help.tiny':
    'Deletes shells whose volume is under this fraction of the biggest shell. <code>0</code> keeps everything; <code>0.001</code> drops specks smaller than a thousandth of the main body. Range 0…1.',

  'card.working': 'working…',
  'card.failed': 'failed',
  'card.meta': '{triangles} triangles · {ms} ms',
  'row.size': 'size',
  'row.found': 'found',
  'row.fixed': 'fixed',
  'row.result': 'result',
  'row.error': 'error',
  'row.preview': 'preview',
  'size.value': '{size} mm · shells: {shells}',
  'found.clean': 'nothing wrong',
  'result.clean': 'watertight · triangles: {triangles} · {volume} mm³',

  'defect.open': 'open edges: {n}',
  'defect.nonManifold': 'non-manifold edges: {n}',
  'defect.flipped': 'flipped edges: {n}',
  'defect.bowtie': 'bowtie vertices: {n}',
  'defect.duplicate': 'duplicate triangles: {n}',
  'defect.zeroArea': 'zero-area triangles: {n}',
  'defect.inverted': 'inverted shells: {n}',

  'action.welded': 'welded vertices: {n}',
  'action.zeroArea': 'dropped zero-area: {n}',
  'action.duplicate': 'dropped duplicates: {n}',
  'action.nonManifold': 'cut non-manifold: {n}',
  'action.bowtie': 'split bowties: {n}',
  'action.rewound': 're-wound triangles: {n}',
  'action.filled': 'holes filled: {n} (+{triangles})',
  'action.skipped': 'holes skipped: {n}',
  'action.shells': 'shells removed: {n}',
  'action.flippedShells': 'shells flipped: {n}',
  'action.manifold': 'rebuilt by manifold3d: {triangles} triangles',

  'verdict.repaired': 'Repaired',
  'verdict.broken': 'Still broken',
  'button.download': 'Download',
  'button.preview': '3D preview',
  'button.hidePreview': 'Hide preview',
  'button.building': 'Building preview…',

  'preview.wireframe': 'Wireframe',
  'preview.defects': 'Highlight defects',
  'preview.next': 'Next problem',
  'preview.reset': 'Reset view',
  'preview.counter': 'problem {index} of {total}',
  'preview.none': 'no defects to visit',
  'preview.before': 'before · {triangles} △',
  'preview.after': 'after · {triangles} △',

  'legend.backface': 'backface seen through the surface — hole or inverted shell',
  'legend.open': 'open edge',
  'legend.nonManifold': 'non-manifold edge',
  'legend.flipped': 'flipped edge',
  'legend.marker': 'bowtie / zero-area',
  'legend.cursor': 'where “Next problem” jumped',

  'note.floating.title': '“Floating regions” is not a file defect.',
  'note.floating.body':
    'That warning is about geometry with nothing under it while printing — re-orient the model or switch on supports. No repair tool can remove it.',
  'note.cli.title': 'Same thing in a terminal',
  'note.cli.rest': ', for batches and CI:',
  'note.cli.comment1': '# writes cat-fixed.stl',
  'note.cli.comment2': '# exits 1 if anything is broken',

  'footer.source': 'Source on GitHub',
  'error.noWorker': 'The 3D preview needs Web Workers; open the page over http, not from disk.',
} as const;

export type Dictionary = { [K in keyof typeof en]: string };
