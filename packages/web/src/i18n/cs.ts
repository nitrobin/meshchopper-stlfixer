import type { Dictionary } from './en.js';

export const cs: Dictionary = {
  'meta.title': 'Mesh Chopper - STL Fixer — oprava STL souborů v prohlížeči',
  'meta.description':
    'Přetáhněte STL, které slicer odmítá: non-manifold hrany, otevřené hrany, obrácené normály. Opraví se lokálně v prohlížeči, nic se nikam neodesílá.',

  'lang.label': 'Jazyk',

  'tagline.lead':
    'Přetáhněte STL, které váš slicer odmítá — non-manifold hrany, otevřené hrany, obrácené normály.',
  'tagline.local': 'Vše běží v této záložce',
  'tagline.rest': '; žádný soubor neopustí váš počítač.',

  'drop.title.strong': 'Sem přetáhněte soubory .stl',
  'drop.title.rest': ' nebo klikněte pro výběr',
  'drop.hint': 'Binární i ASCII · více najednou · opravená kopie se stáhne jako',
  'drop.aria': 'Vybrat soubory STL',

  'options.summary': 'Možnosti opravy',
  'options.fill': 'Zaplnit díry',
  'options.flip': 'Otočit obrácené skořepiny',
  'options.largest': 'Nechat jen největší skořepinu',
  'options.ascii': 'Zapsat ASCII STL',
  'options.tolerance': 'Tolerance svaření',
  'options.tiny.before': 'Zahodit skořepiny pod',
  'options.tiny.after': '× největší',
  'options.manifold': 'průchod manifold3d',
  'manifold.off': 'vypnuto',
  'manifold.rebuild': 'přestavba (zachová díly)',
  'manifold.union': 'sjednocení (slepí díly)',
  'options.reset': 'Obnovit výchozí',

  'help.aria': 'Co tato volba dělá?',
  'help.fill':
    'Obejde okraj každé díry a rozdělí ho na trojúhelníky — malé odstřihováním uší, velké nebo pokroucené vějířem z nového středového bodu. Vypnuto: díry zůstanou a soubor nebude vodotěsný.',
  'help.flip':
    'Spočítá znaménkový objem každé skořepiny; záporný objem znamená, že je obrácená naruby, takže se všechny její trojúhelníky přeorientují. Zdravé modely zůstanou beze změny.',
  'help.largest':
    'Nechá skořepinu s největším objemem a ostatní smaže. Hodí se proti drobtům, které cestují s dílem, ale model složený z několika skutečných dílů o ně přijde — nejdřív se podívejte na počet skořepin v přehledu.',
  'help.ascii':
    'Zapíše textovou variantu STL místo binární: zhruba pětkrát větší, zato čitelnou a porovnatelnou. Slicery berou obě.',
  'help.manifold':
    'Druhý názor od manifold3d, geometrického jádra několika CAD nástrojů. <code>rebuild</code> protáhne síť skrz něj: manifold3d přijme jen platné těleso, průchod tak výsledek potvrdí a uklidí zbytky, přičemž počet skořepin i objem zůstávají. <code>union</code> navíc sjednotí těleso samo se sebou a přeřeže samoprůniky — stejná třída opravy jako tlačítko „Fix model“ ve Windows — ale také svaří překrývající se díly, takže z kloubu tištěného na místě vznikne jeden kus. Oba režimy si při prvním spuštění stáhnou zhruba 0,5 MB WebAssembly.',
  'help.tolerance':
    'Dva vrcholy blíž než tato vzdálenost v milimetrech se sloučí v jeden — právě tím se zavírají švy, které slicer hlásí jako otevřené hrany. <code>auto</code> je úhlopříčka ohraničujícího kvádru × 1e-6 (asi 0,0001 mm u modelu 100 mm), což odpovídá šumu float32 uloženému v STL. Přijme se libovolné číslo od 0; 0 sloučí jen naprosto shodné vrcholy a příliš velká hodnota spolkne jemné detaily.',
  'help.tiny':
    'Maže skořepiny, jejichž objem je pod tímto zlomkem té největší. <code>0</code> nechá vše; <code>0.001</code> vyhodí drobty menší než tisícina hlavního tělesa. Rozsah 0…1.',

  'card.working': 'zpracování…',
  'card.failed': 'selhalo',
  'card.meta': 'trojúhelníků: {triangles} · {ms} ms',
  'row.size': 'rozměr',
  'row.found': 'nalezeno',
  'row.fixed': 'opraveno',
  'row.result': 'výsledek',
  'row.error': 'chyba',
  'row.preview': 'náhled',
  'size.value': '{size} mm · skořepin: {shells}',
  'found.clean': 'nic k opravě',
  'result.clean': 'vodotěsné · trojúhelníků: {triangles} · {volume} mm³',

  'defect.open': 'otevřených hran: {n}',
  'defect.nonManifold': 'non-manifold hran: {n}',
  'defect.flipped': 'špatně orientovaných hran: {n}',
  'defect.bowtie': 'motýlkových vrcholů: {n}',
  'defect.duplicate': 'duplicitních trojúhelníků: {n}',
  'defect.zeroArea': 'trojúhelníků s nulovou plochou: {n}',
  'defect.inverted': 'obrácených skořepin: {n}',

  'action.welded': 'svařených vrcholů: {n}',
  'action.zeroArea': 'odstraněno nulových trojúhelníků: {n}',
  'action.duplicate': 'odstraněno duplicit: {n}',
  'action.nonManifold': 'odříznuto non-manifold: {n}',
  'action.bowtie': 'rozdělených motýlků: {n}',
  'action.rewound': 'přeorientovaných trojúhelníků: {n}',
  'action.filled': 'zaplněných děr: {n} (+{triangles})',
  'action.skipped': 'přeskočených děr: {n}',
  'action.shells': 'odstraněných skořepin: {n}',
  'action.flippedShells': 'otočených skořepin: {n}',
  'action.manifold': 'přestavěno pomocí manifold3d: {triangles} trojúhelníků',

  'verdict.repaired': 'Opraveno',
  'verdict.broken': 'Stále rozbité',
  'button.download': 'Stáhnout',
  'button.preview': '3D náhled',
  'button.hidePreview': 'Skrýt náhled',
  'button.building': 'Příprava náhledu…',

  'preview.wireframe': 'Drátěný model',
  'preview.defects': 'Zvýraznit vady',
  'preview.next': 'Další problém',
  'preview.reset': 'Resetovat pohled',
  'preview.counter': 'problém {index} z {total}',
  'preview.none': 'žádné vady k prohlédnutí',
  'preview.before': 'před · {triangles} △',
  'preview.after': 'po · {triangles} △',

  'legend.backface': 'rub prosvítá povrchem — díra nebo obrácená skořepina',
  'legend.open': 'otevřená hrana',
  'legend.nonManifold': 'non-manifold hrana',
  'legend.flipped': 'špatně orientovaná hrana',
  'legend.marker': 'motýlek / nulová plocha',
  'legend.cursor': 'kam skočil „Další problém“',

  'note.floating.title': '„Floating regions“ není vada souboru.',
  'note.floating.body':
    'To varování se týká geometrie, pod kterou při tisku nic není — otočte model nebo zapněte podpory. Žádná oprava souboru to neodstraní.',
  'note.cli.title': 'Totéž v terminálu',
  'note.cli.rest': ', pro dávky a CI:',
  'note.cli.comment1': '# vytvoří cat-fixed.stl',
  'note.cli.comment2': '# skončí s kódem 1, když je něco rozbité',

  'footer.source': 'Zdrojový kód na GitHubu',
  'error.noWorker':
    '3D náhled potřebuje Web Workers; otevřete stránku přes http, ne z disku.',
};
