import type { Dictionary } from './en.js';

export const it: Dictionary = {
  'meta.title': 'Mesh Chopper - STL Fixer — riparare file STL nel browser',
  'meta.description':
    'Trascina uno STL rifiutato dallo slicer: spigoli non-manifold, spigoli aperti, normali invertite. Riparato in locale nel browser, non viene caricato nulla.',

  'lang.label': 'Lingua',

  'tagline.lead':
    'Trascina uno STL che il tuo slicer rifiuta — spigoli non-manifold, spigoli aperti, normali invertite.',
  'tagline.local': 'Tutto avviene in questa scheda',
  'tagline.rest': '; nessun file lascia il tuo computer.',

  'drop.title.strong': 'Trascina qui i file .stl',
  'drop.title.rest': ' oppure clicca per sceglierli',
  'drop.hint': 'Binario o ASCII · più file insieme · la copia riparata viene scaricata come',
  'drop.aria': 'Scegli i file STL',

  'options.summary': 'Opzioni di riparazione',
  'options.fill': 'Chiudere i buchi',
  'options.flip': 'Raddrizzare i gusci invertiti',
  'options.largest': 'Tenere solo il guscio più grande',
  'options.ascii': 'Scrivere STL ASCII',
  'options.tolerance': 'Tolleranza di saldatura',
  'options.tiny.before': 'Eliminare i gusci sotto',
  'options.tiny.after': '× il più grande',
  'options.manifold': 'passaggio manifold3d',
  'manifold.off': 'disattivato',
  'manifold.rebuild': 'ricostruzione (mantiene i pezzi)',
  'manifold.union': 'unione (fonde i pezzi)',
  'options.reset': 'Ripristina i valori predefiniti',

  'help.aria': 'Che cosa fa questa opzione?',
  'help.fill':
    'Segue il bordo di ogni buco e lo triangola: ear clipping per i piccoli, ventaglio da un nuovo punto centrale per quelli grandi o storti. Disattivato, i buchi restano e il file non è stagno.',
  'help.flip':
    'Calcola il volume con segno di ogni guscio; se è negativo il guscio è rovesciato e tutti i suoi triangoli vengono riorientati. I modelli sani restano intatti.',
  'help.largest':
    'Tiene il guscio con il volume maggiore e cancella gli altri. Utile contro i frammenti che viaggiano con il pezzo, ma un modello composto da più pezzi veri li perde: controlla prima il numero di gusci nel rapporto.',
  'help.ascii':
    'Scrive la variante testuale dello STL invece della binaria: circa cinque volte più grande, ma leggibile e confrontabile. Gli slicer accettano entrambe.',
  'help.manifold':
    'Un secondo parere da manifold3d, il kernel geometrico dietro diversi strumenti CAD. <code>rebuild</code> fa passare la mesh attraverso di esso: manifold3d accetta solo un solido valido, quindi il passaggio convalida il risultato e ripulisce i residui, lasciando invariati numero di gusci e volume. <code>union</code> unisce inoltre il solido con sé stesso e ritaglia le autointersezioni — lo stesso tipo di riparazione del pulsante «Fix model» di Windows — ma salda anche i pezzi che si sovrappongono: una cerniera stampata in loco esce come un blocco unico. Entrambe le modalità scaricano circa 0,5 MB di WebAssembly al primo avvio.',
  'help.tolerance':
    'Due vertici più vicini di questa distanza, in millimetri, diventano uno — è così che si chiudono le cuciture che lo slicer segnala come spigoli aperti. <code>auto</code> è la diagonale del bounding box × 1e-6 (circa 0,0001 mm su un modello da 100 mm), pari al rumore float32 salvato nello STL. Si accetta qualsiasi numero da 0 in su; 0 unisce solo vertici identici e un valore troppo grande mangia i dettagli fini.',
  'help.tiny':
    'Elimina i gusci il cui volume è sotto questa frazione del più grande. <code>0</code> tiene tutto; <code>0.001</code> scarta i granelli sotto un millesimo del corpo principale. Intervallo 0…1.',

  'card.working': 'in corso…',
  'card.failed': 'non riuscito',
  'card.meta': 'triangoli: {triangles} · {ms} ms',
  'row.size': 'dimensioni',
  'row.found': 'trovato',
  'row.fixed': 'corretto',
  'row.result': 'risultato',
  'row.error': 'errore',
  'row.preview': 'anteprima',
  'size.value': '{size} mm · gusci: {shells}',
  'found.clean': 'nulla da correggere',
  'result.clean': 'stagno · triangoli: {triangles} · {volume} mm³',

  'defect.open': 'spigoli aperti: {n}',
  'defect.nonManifold': 'spigoli non-manifold: {n}',
  'defect.flipped': 'spigoli mal orientati: {n}',
  'defect.bowtie': 'vertici a farfalla: {n}',
  'defect.duplicate': 'triangoli duplicati: {n}',
  'defect.zeroArea': 'triangoli senza area: {n}',
  'defect.inverted': 'gusci invertiti: {n}',

  'action.welded': 'vertici saldati: {n}',
  'action.zeroArea': 'triangoli senza area rimossi: {n}',
  'action.duplicate': 'duplicati rimossi: {n}',
  'action.nonManifold': 'non-manifold tagliati: {n}',
  'action.bowtie': 'farfalle separate: {n}',
  'action.rewound': 'triangoli riorientati: {n}',
  'action.filled': 'buchi chiusi: {n} (+{triangles})',
  'action.skipped': 'buchi saltati: {n}',
  'action.shells': 'gusci rimossi: {n}',
  'action.flippedShells': 'gusci raddrizzati: {n}',
  'action.manifold': 'ricostruito da manifold3d: {triangles} triangoli',

  'verdict.repaired': 'Riparato',
  'verdict.broken': 'Ancora rotto',
  'button.download': 'Scarica',
  'button.preview': 'Anteprima 3D',
  'button.hidePreview': 'Nascondi anteprima',
  'button.building': 'Preparazione anteprima…',

  'preview.wireframe': 'Wireframe',
  'preview.defects': 'Evidenzia i difetti',
  'preview.next': 'Problema successivo',
  'preview.reset': 'Reimposta vista',
  'preview.counter': 'problema {index} di {total}',
  'preview.none': 'nessun difetto da visitare',
  'preview.before': 'prima · {triangles} △',
  'preview.after': 'dopo · {triangles} △',

  'legend.backface': 'faccia interna vista attraverso la superficie — buco o guscio invertito',
  'legend.open': 'spigolo aperto',
  'legend.nonManifold': 'spigolo non-manifold',
  'legend.flipped': 'spigolo mal orientato',
  'legend.marker': 'farfalla / senza area',
  'legend.cursor': 'dove è saltato «Problema successivo»',

  'note.floating.title': '«Floating regions» non è un difetto del file.',
  'note.floating.body':
    'Quell’avviso riguarda geometria senza nulla sotto durante la stampa: riorienta il modello o attiva i supporti. Nessuna riparazione lo elimina.',
  'note.cli.title': 'La stessa cosa nel terminale',
  'note.cli.rest': ', per lotti e CI:',
  'note.cli.comment1': '# crea cat-fixed.stl',
  'note.cli.comment2': '# esce con 1 se qualcosa è rotto',

  'footer.source': 'Sorgenti su GitHub',
  'error.noWorker':
    'L’anteprima 3D richiede i Web Worker; apri la pagina via http, non dal disco.',
};
