import type { Dictionary } from './en.js';

export const de: Dictionary = {
  'meta.title': 'Mesh Chopper - STL Fixer — STL-Dateien im Browser reparieren',
  'meta.description':
    'Eine STL-Datei ablegen, die der Slicer ablehnt: non-manifold Kanten, offene Kanten, verdrehte Normalen. Wird lokal im Browser repariert, nichts wird hochgeladen.',

  'lang.label': 'Sprache',

  'tagline.lead':
    'Leg eine STL-Datei ab, die dein Slicer ablehnt — non-manifold Kanten, offene Kanten, nach innen zeigende Normalen.',
  'tagline.local': 'Alles läuft in diesem Tab',
  'tagline.rest': '; keine Datei verlässt deinen Rechner.',

  'drop.title.strong': '.stl-Dateien hier ablegen',
  'drop.title.rest': ' oder klicken zum Auswählen',
  'drop.hint': 'Binär oder ASCII · mehrere auf einmal · die reparierte Kopie landet als',
  'drop.aria': 'STL-Dateien auswählen',

  'options.summary': 'Reparaturoptionen',
  'options.fill': 'Löcher schließen',
  'options.flip': 'Umgestülpte Schalen umdrehen',
  'options.largest': 'Nur die größte Schale behalten',
  'options.ascii': 'ASCII-STL schreiben',
  'options.tolerance': 'Schweißtoleranz',
  'options.tiny.before': 'Schalen entfernen unter',
  'options.tiny.after': '× der größten',
  'options.manifold': 'manifold3d-Durchlauf',
  'manifold.off': 'aus',
  'manifold.rebuild': 'Neuaufbau (Teile bleiben)',
  'manifold.union': 'Union (Teile verschmelzen)',
  'options.reset': 'Auf Standard zurücksetzen',

  'help.aria': 'Was macht diese Option?',
  'help.fill':
    'Verfolgt den Rand jedes Lochs und trianguliert ihn — kleine Ränder per Ear Clipping, große oder schiefe als Fächer von einem neuen Mittelpunkt. Ausgeschaltet bleiben Löcher offen und die Datei undicht.',
  'help.flip':
    'Berechnet das vorzeichenbehaftete Volumen jeder Schale; ein negatives bedeutet umgestülpt, dann werden alle ihre Dreiecke umgedreht. Intakte Modelle bleiben unberührt.',
  'help.largest':
    'Behält die Schale mit dem größten Volumen und löscht alle anderen. Praktisch gegen mitreisende Krümel — ein Modell aus mehreren echten Teilen verliert sie aber, also erst die Schalenzahl im Bericht prüfen.',
  'help.ascii':
    'Schreibt die Textvariante von STL statt der binären: etwa fünfmal größer, dafür lesbar und diff-fähig. Slicer akzeptieren beides.',
  'help.manifold':
    'Eine zweite Meinung von manifold3d, dem Geometriekern hinter mehreren CAD-Werkzeugen. <code>rebuild</code> schickt das Mesh hindurch: manifold3d akzeptiert nur einen gültigen Körper, der Durchlauf bestätigt also das Ergebnis und räumt Reste auf, während Schalenzahl und Volumen bleiben. <code>union</code> vereinigt den Körper zusätzlich mit sich selbst und schneidet Selbstdurchdringungen neu — dieselbe Art Reparatur wie die Windows-Schaltfläche „Fix model“ —, verschweißt dabei aber überlappende Teile, sodass aus einem Print-in-Place-Gelenk ein Klumpen wird. Beide Modi laden beim ersten Lauf rund 0,5 MB WebAssembly.',
  'help.tolerance':
    'Zwei Punkte, die näher als dieser Abstand in Millimetern liegen, werden zu einem — genau so schließen sich Nähte, die der Slicer als offene Kanten meldet. <code>auto</code> ist die Bounding-Box-Diagonale × 1e-6 (etwa 0,0001 mm bei einem 100-mm-Modell) und entspricht dem float32-Rauschen in STL. Jede Zahl ab 0 ist erlaubt; 0 verschmilzt nur exakt gleiche Punkte, zu große Werte fressen feine Details.',
  'help.tiny':
    'Löscht Schalen, deren Volumen unter diesem Anteil der größten Schale liegt. <code>0</code> behält alles, <code>0.001</code> wirft Krümel unter einem Tausendstel des Hauptkörpers weg. Bereich 0…1.',

  'card.working': 'arbeitet…',
  'card.failed': 'fehlgeschlagen',
  'card.meta': 'Dreiecke: {triangles} · {ms} ms',
  'row.size': 'Größe',
  'row.found': 'gefunden',
  'row.fixed': 'behoben',
  'row.result': 'Ergebnis',
  'row.error': 'Fehler',
  'row.preview': 'Vorschau',
  'size.value': '{size} mm · Schalen: {shells}',
  'found.clean': 'nichts zu beanstanden',
  'result.clean': 'wasserdicht · Dreiecke: {triangles} · {volume} mm³',

  'defect.open': 'offene Kanten: {n}',
  'defect.nonManifold': 'non-manifold Kanten: {n}',
  'defect.flipped': 'falsch orientierte Kanten: {n}',
  'defect.bowtie': 'Bowtie-Punkte: {n}',
  'defect.duplicate': 'doppelte Dreiecke: {n}',
  'defect.zeroArea': 'Dreiecke ohne Fläche: {n}',
  'defect.inverted': 'umgestülpte Schalen: {n}',

  'action.welded': 'Punkte verschweißt: {n}',
  'action.zeroArea': 'ohne Fläche entfernt: {n}',
  'action.duplicate': 'Duplikate entfernt: {n}',
  'action.nonManifold': 'non-manifold entfernt: {n}',
  'action.bowtie': 'Bowties getrennt: {n}',
  'action.rewound': 'Dreiecke neu ausgerichtet: {n}',
  'action.filled': 'Löcher geschlossen: {n} (+{triangles})',
  'action.skipped': 'Löcher übersprungen: {n}',
  'action.shells': 'Schalen entfernt: {n}',
  'action.flippedShells': 'Schalen umgedreht: {n}',
  'action.manifold': 'von manifold3d neu aufgebaut: {triangles} Dreiecke',

  'verdict.repaired': 'Repariert',
  'verdict.broken': 'Weiterhin defekt',
  'button.download': 'Herunterladen',
  'button.preview': '3D-Vorschau',
  'button.hidePreview': 'Vorschau ausblenden',
  'button.building': 'Vorschau wird gebaut…',

  'preview.wireframe': 'Drahtgitter',
  'preview.defects': 'Defekte hervorheben',
  'preview.next': 'Nächstes Problem',
  'preview.reset': 'Ansicht zurücksetzen',
  'preview.counter': 'Problem {index} von {total}',
  'preview.none': 'keine Defekte vorhanden',
  'preview.before': 'vorher · {triangles} △',
  'preview.after': 'nachher · {triangles} △',

  'legend.backface': 'Rückseite durch die Oberfläche sichtbar — Loch oder umgestülpte Schale',
  'legend.open': 'offene Kante',
  'legend.nonManifold': 'non-manifold Kante',
  'legend.flipped': 'falsch orientierte Kante',
  'legend.marker': 'Bowtie / ohne Fläche',
  'legend.cursor': 'Sprungziel von „Nächstes Problem“',

  'note.floating.title': '„Floating regions“ ist kein Dateifehler.',
  'note.floating.body':
    'Diese Warnung betrifft Geometrie, unter der beim Drucken nichts liegt — Modell neu ausrichten oder Stützen einschalten. Keine Reparatur beseitigt das.',
  'note.cli.title': 'Dasselbe im Terminal',
  'note.cli.rest': ', für Stapel und CI:',
  'note.cli.comment1': '# schreibt cat-fixed.stl',
  'note.cli.comment2': '# Exit-Code 1, wenn etwas defekt ist',

  'footer.source': 'Quellcode auf GitHub',
  'error.noWorker':
    'Die 3D-Vorschau braucht Web Worker; die Seite über http öffnen, nicht von der Festplatte.',
};
