import type { Dictionary } from './en.js';

export const tr: Dictionary = {
  'meta.title': 'Mesh Chopper - STL Fixer — STL dosyalarını tarayıcıda onarın',
  'meta.description':
    'Dilimleyicinin kabul etmediği STL dosyasını bırakın: non-manifold kenarlar, açık kenarlar, ters normaller. Tarayıcınızda yerel olarak onarılır, hiçbir şey yüklenmez.',

  'lang.label': 'Dil',

  'tagline.lead':
    'Dilimleyicinizin kabul etmediği STL dosyasını bırakın — non-manifold kenarlar, açık kenarlar, içe dönük normaller.',
  'tagline.local': 'Her şey bu sekmede çalışır',
  'tagline.rest': '; hiçbir dosya bilgisayarınızdan çıkmaz.',

  'drop.title.strong': '.stl dosyalarını buraya bırakın',
  'drop.title.rest': ' ya da seçmek için tıklayın',
  'drop.hint': 'İkili veya ASCII · birkaç dosya birden · onarılmış kopya şu adla indirilir',
  'drop.aria': 'STL dosyalarını seç',

  'options.summary': 'Onarım seçenekleri',
  'options.fill': 'Delikleri kapat',
  'options.flip': 'Ters kabukları düzelt',
  'options.largest': 'Yalnızca en büyük kabuğu tut',
  'options.ascii': 'ASCII STL yaz',
  'options.tolerance': 'Kaynak toleransı',
  'options.tiny.before': 'Şu orandan küçük kabukları at',
  'options.tiny.after': '× en büyüğü',
  'options.manifold': 'manifold3d geçişi',
  'manifold.off': 'kapalı',
  'manifold.rebuild': 'yeniden kur (parçaları korur)',
  'manifold.union': 'birleşim (parçaları kaynatır)',
  'options.reset': 'Varsayılanlara dön',

  'help.aria': 'Bu seçenek ne yapar?',
  'help.fill':
    'Her deliğin kenarını izleyip üçgenlere böler: küçük kenarlarda kulak kesme, büyük ya da çarpık olanlarda yeni bir merkez noktadan yelpaze. Kapalıyken delikler kalır ve dosya sızdırmaya devam eder.',
  'help.flip':
    'Her kabuğun işaretli hacmini hesaplar; negatifse kabuk ters dönmüştür ve tüm üçgenleri yeniden yönlendirilir. Sağlam modellere dokunulmaz.',
  'help.largest':
    'En büyük hacimli kabuğu tutar, diğerlerini siler. Parçayla birlikte gelen kırıntılara karşı iyidir, ama gerçekten birkaç parçadan oluşan model bunları kaybeder — önce rapordaki kabuk sayısına bakın.',
  'help.ascii':
    'STL’in ikili değil metin sürümünü yazar: yaklaşık beş kat büyük, buna karşılık okunabilir ve diff alınabilir. Dilimleyiciler ikisini de kabul eder.',
  'help.manifold':
    'Birkaç CAD aracının arkasındaki geometri çekirdeği manifold3d’den ikinci bir görüş. <code>rebuild</code> ağı onun içinden geçirir: manifold3d geçerli olmayan hiçbir katıyı kabul etmez, dolayısıyla bu geçiş sonucu hem doğrular hem de artıkları toparlar; kabuk sayısı ve hacim değişmez. <code>union</code> ek olarak katıyı kendisiyle birleştirip kendiyle kesişmeleri yeniden keser — Windows’un “Fix model” düğmesiyle aynı sınıf onarım — ama üst üste binen parçaları da kaynatır, yani yerinde basılan bir menteşe tek parça çıkar. Her iki mod ilk çalışmada yaklaşık 0,5 MB WebAssembly indirir.',
  'help.tolerance':
    'Birbirine bu mesafeden (milimetre) yakın iki köşe tek köşeye iner — dilimleyicinin açık kenar diye bildirdiği dikişler böyle kapanır. <code>auto</code>, sınırlayıcı kutunun köşegeni × 1e-6 demektir (100 mm’lik modelde yaklaşık 0,0001 mm) ve STL’in sakladığı float32 gürültüsüne denk gelir. 0 ve üzeri her sayı kabul edilir; 0 yalnızca tümüyle aynı köşeleri birleştirir, çok büyük bir değer ince ayrıntıları yutar.',
  'help.tiny':
    'Hacmi en büyük kabuğun bu oranının altında kalan kabukları siler. <code>0</code> her şeyi tutar; <code>0.001</code> ana gövdenin binde birinden küçük zerreleri atar. Aralık 0…1.',

  'card.working': 'çalışıyor…',
  'card.failed': 'başarısız',
  'card.meta': 'üçgen: {triangles} · {ms} ms',
  'row.size': 'boyut',
  'row.found': 'bulunan',
  'row.fixed': 'onarılan',
  'row.result': 'sonuç',
  'row.error': 'hata',
  'row.preview': 'önizleme',
  'size.value': '{size} mm · kabuk: {shells}',
  'found.clean': 'sorun yok',
  'result.clean': 'su geçirmez · üçgen: {triangles} · {volume} mm³',

  'defect.open': 'açık kenar: {n}',
  'defect.nonManifold': 'non-manifold kenar: {n}',
  'defect.flipped': 'ters yönlü kenar: {n}',
  'defect.bowtie': 'papyon köşe: {n}',
  'defect.duplicate': 'yinelenen üçgen: {n}',
  'defect.zeroArea': 'sıfır alanlı üçgen: {n}',
  'defect.inverted': 'ters kabuk: {n}',

  'action.welded': 'kaynaklanan köşe sayısı: {n}',
  'action.zeroArea': 'silinen sıfır alanlı üçgen: {n}',
  'action.duplicate': 'silinen yinelenen üçgen: {n}',
  'action.nonManifold': 'kesilen non-manifold: {n}',
  'action.bowtie': 'ayrılan papyon: {n}',
  'action.rewound': 'yönü düzeltilen üçgen: {n}',
  'action.filled': 'kapatılan delik: {n} (+{triangles})',
  'action.skipped': 'atlanan delik: {n}',
  'action.shells': 'silinen kabuk: {n}',
  'action.flippedShells': 'çevrilen kabuk: {n}',
  'action.manifold': 'manifold3d ile yeniden kuruldu: {triangles} üçgen',

  'verdict.repaired': 'Onarıldı',
  'verdict.broken': 'Hâlâ bozuk',
  'button.download': 'İndir',
  'button.preview': '3B önizleme',
  'button.hidePreview': 'Önizlemeyi gizle',
  'button.building': 'Önizleme hazırlanıyor…',

  'preview.wireframe': 'Tel kafes',
  'preview.defects': 'Kusurları vurgula',
  'preview.next': 'Sonraki sorun',
  'preview.reset': 'Görünümü sıfırla',
  'preview.counter': 'sorun {index} / {total}',
  'preview.none': 'gidilecek kusur yok',
  'preview.before': 'önce · {triangles} △',
  'preview.after': 'sonra · {triangles} △',

  'legend.backface': 'yüzeyin içinden görünen arka yüz — delik ya da ters kabuk',
  'legend.open': 'açık kenar',
  'legend.nonManifold': 'non-manifold kenar',
  'legend.flipped': 'ters yönlü kenar',
  'legend.marker': 'papyon / sıfır alan',
  'legend.cursor': '“Sonraki sorun”un atladığı yer',

  'note.floating.title': '“Floating regions” dosya kusuru değildir.',
  'note.floating.body':
    'Bu uyarı, baskı sırasında altında hiçbir şey olmayan geometriyle ilgilidir — modeli döndürün ya da destekleri açın. Hiçbir onarım aracı bunu gidermez.',
  'note.cli.title': 'Aynısı terminalde',
  'note.cli.rest': ', toplu işler ve CI için:',
  'note.cli.comment1': '# cat-fixed.stl oluşturur',
  'note.cli.comment2': '# bozuk bir şey varsa 1 döner',

  'footer.source': 'GitHub’daki kaynak kodu',
  'error.noWorker':
    '3B önizleme Web Worker gerektirir; sayfayı diskten değil http üzerinden açın.',
};
