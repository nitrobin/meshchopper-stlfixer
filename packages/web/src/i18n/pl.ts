import type { Dictionary } from './en.js';

export const pl: Dictionary = {
  'meta.title': 'Mesh Chopper - STL Fixer — naprawa plików STL w przeglądarce',
  'meta.description':
    'Upuść STL odrzucany przez slicer: krawędzie non-manifold, otwarte krawędzie, odwrócone normalne. Naprawa działa lokalnie w przeglądarce, nic nie jest wysyłane.',

  'lang.label': 'Język',

  'tagline.lead':
    'Upuść plik STL, którego nie przyjmuje slicer — krawędzie non-manifold, otwarte krawędzie, odwrócone normalne.',
  'tagline.local': 'Wszystko dzieje się w tej karcie',
  'tagline.rest': '; żaden plik nie opuszcza twojego komputera.',

  'drop.title.strong': 'Upuść pliki .stl tutaj',
  'drop.title.rest': ' albo kliknij, aby wybrać',
  'drop.hint': 'Binarny lub ASCII · kilka naraz · naprawiona kopia pobiera się jako',
  'drop.aria': 'Wybierz pliki STL',

  'options.summary': 'Opcje naprawy',
  'options.fill': 'Zaklejaj dziury',
  'options.flip': 'Odwracaj wywrócone powłoki',
  'options.largest': 'Zostaw tylko największą powłokę',
  'options.ascii': 'Zapisuj STL w ASCII',
  'options.tolerance': 'Tolerancja zgrzewania',
  'options.tiny.before': 'Usuwaj powłoki poniżej',
  'options.tiny.after': '× największej',
  'options.manifold': 'przebieg manifold3d',
  'manifold.off': 'wyłączony',
  'manifold.rebuild': 'przebudowa (zachowuje części)',
  'manifold.union': 'suma (zlepia części)',
  'options.reset': 'Przywróć domyślne',

  'help.aria': 'Co robi ta opcja?',
  'help.fill':
    'Obchodzi brzeg każdej dziury i dzieli go na trójkąty: małe — metodą obcinania uszu, duże i pokręcone — wachlarzem z nowego punktu w środku. Wyłączone: dziury zostają, plik dalej nie jest szczelny.',
  'help.flip':
    'Liczy objętość ze znakiem każdej powłoki; ujemna oznacza wywróconą na lewą stronę, więc wszystkie jej trójkąty są przeorientowane. Zdrowe modele zostają bez zmian.',
  'help.largest':
    'Zostawia powłokę o największej objętości, resztę kasuje. Dobre na okruchy podróżujące razem z częścią, ale model złożony z kilku prawdziwych części je straci — sprawdź najpierw liczbę powłok w raporcie.',
  'help.ascii':
    'Zapisuje tekstową odmianę STL zamiast binarnej: około pięć razy większa, za to czytelna i porównywalna w diffie. Slicery przyjmują obie.',
  'help.manifold':
    'Druga opinia od manifold3d, jądra geometrycznego kilku narzędzi CAD. <code>rebuild</code> przepuszcza siatkę przez nie: manifold3d przyjmuje wyłącznie poprawną bryłę, więc przebieg zarazem potwierdza wynik i sprząta resztki, a liczba powłok i objętość zostają bez zmian. <code>union</code> dodatkowo sumuje bryłę ze sobą i przecina samoprzecięcia — ta sama klasa naprawy co przycisk „Fix model” w Windows — ale też zgrzewa nachodzące na siebie części, więc zawias drukowany w miejscu wyjdzie jako jedna bryła. Oba tryby przy pierwszym uruchomieniu pobierają około 0,5 MB WebAssembly.',
  'help.tolerance':
    'Dwa wierzchołki bliżej siebie niż ta odległość w milimetrach stają się jednym — tak zamykają się szwy, które slicer zgłasza jako otwarte krawędzie. <code>auto</code> to przekątna prostopadłościanu ograniczającego × 1e-6 (około 0,0001 mm przy modelu 100 mm), czyli poziom szumu float32 zapisanego w STL. Przyjmowana jest dowolna liczba od 0; 0 łączy tylko idealnie równe wierzchołki, a zbyt duża wartość zjada drobne detale.',
  'help.tiny':
    'Kasuje powłoki o objętości poniżej tego ułamka największej. <code>0</code> zostawia wszystko; <code>0.001</code> wyrzuca okruchy mniejsze niż tysięczna część głównej bryły. Zakres 0…1.',

  'card.working': 'przetwarzanie…',
  'card.failed': 'niepowodzenie',
  'card.meta': 'trójkątów: {triangles} · {ms} ms',
  'row.size': 'rozmiar',
  'row.found': 'znaleziono',
  'row.fixed': 'naprawiono',
  'row.result': 'wynik',
  'row.error': 'błąd',
  'row.preview': 'podgląd',
  'size.value': '{size} mm · powłok: {shells}',
  'found.clean': 'nic do poprawy',
  'result.clean': 'szczelny · trójkątów: {triangles} · {volume} mm³',

  'defect.open': 'otwartych krawędzi: {n}',
  'defect.nonManifold': 'krawędzi non-manifold: {n}',
  'defect.flipped': 'krawędzi źle zorientowanych: {n}',
  'defect.bowtie': 'wierzchołków typu muszka: {n}',
  'defect.duplicate': 'zduplikowanych trójkątów: {n}',
  'defect.zeroArea': 'trójkątów o zerowym polu: {n}',
  'defect.inverted': 'wywróconych powłok: {n}',

  'action.welded': 'zgrzanych wierzchołków: {n}',
  'action.zeroArea': 'usuniętych trójkątów zerowych: {n}',
  'action.duplicate': 'usuniętych duplikatów: {n}',
  'action.nonManifold': 'wyciętych non-manifold: {n}',
  'action.bowtie': 'rozdzielonych muszek: {n}',
  'action.rewound': 'przeorientowanych trójkątów: {n}',
  'action.filled': 'zaklejonych dziur: {n} (+{triangles})',
  'action.skipped': 'pominiętych dziur: {n}',
  'action.shells': 'usuniętych powłok: {n}',
  'action.flippedShells': 'odwróconych powłok: {n}',
  'action.manifold': 'przebudowane przez manifold3d: {triangles} trójkątów',

  'verdict.repaired': 'Naprawiono',
  'verdict.broken': 'Nadal uszkodzony',
  'button.download': 'Pobierz',
  'button.preview': 'Podgląd 3D',
  'button.hidePreview': 'Ukryj podgląd',
  'button.building': 'Przygotowanie podglądu…',

  'preview.wireframe': 'Siatka',
  'preview.defects': 'Podświetl usterki',
  'preview.next': 'Następny problem',
  'preview.reset': 'Zresetuj widok',
  'preview.counter': 'problem {index} z {total}',
  'preview.none': 'brak usterek do obejrzenia',
  'preview.before': 'przed · {triangles} △',
  'preview.after': 'po · {triangles} △',

  'legend.backface': 'spód widoczny przez powierzchnię — dziura albo wywrócona powłoka',
  'legend.open': 'otwarta krawędź',
  'legend.nonManifold': 'krawędź non-manifold',
  'legend.flipped': 'krawędź źle zorientowana',
  'legend.marker': 'muszka / zerowe pole',
  'legend.cursor': 'dokąd skoczył „Następny problem”',

  'note.floating.title': '„Floating regions” to nie usterka pliku.',
  'note.floating.body':
    'To ostrzeżenie dotyczy geometrii, pod którą nic nie ma podczas druku — obróć model albo włącz podpory. Żadna naprawa tego nie usunie.',
  'note.cli.title': 'To samo w terminalu',
  'note.cli.rest': ', do wsadów i CI:',
  'note.cli.comment1': '# tworzy cat-fixed.stl',
  'note.cli.comment2': '# kod wyjścia 1, gdy coś jest zepsute',

  'footer.source': 'Kod na GitHubie',
  'error.noWorker':
    'Podgląd 3D wymaga Web Workers; otwórz stronę przez http, a nie z dysku.',
};
