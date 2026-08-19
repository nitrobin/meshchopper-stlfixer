import type { Dictionary } from './en.js';

export const ja: Dictionary = {
  'meta.title': 'Mesh Chopper - STL Fixer — ブラウザで STL を修復',
  'meta.description':
    'スライサーに弾かれる STL をドロップ：非多様体エッジ、開いたエッジ、裏返った法線。ブラウザ内でローカルに修復し、アップロードはしません。',

  'lang.label': '言語',

  'tagline.lead': 'スライサーが受け付けない STL をドロップ — 非多様体エッジ、開いたエッジ、裏返った法線。',
  'tagline.local': 'すべてこのタブ内で処理されます',
  'tagline.rest': '。ファイルが外に出ることはありません。',

  'drop.title.strong': '.stl ファイルをここにドロップ',
  'drop.title.rest': '、またはクリックして選択',
  'drop.hint': 'バイナリ／ASCII · 複数同時可 · 修復版は次の名前で保存されます',
  'drop.aria': 'STL ファイルを選択',

  'options.summary': '修復オプション',
  'options.fill': '穴を塞ぐ',
  'options.flip': '裏返ったシェルを直す',
  'options.largest': '最大のシェルだけ残す',
  'options.ascii': 'ASCII STL で書き出す',
  'options.tolerance': '頂点マージ許容値',
  'options.tiny.before': 'シェルを削除する下限',
  'options.tiny.after': '× 最大シェル',
  'options.manifold': 'manifold3d パス',
  'manifold.off': 'オフ',
  'manifold.rebuild': '再構築（部品を保持）',
  'manifold.union': 'ユニオン（部品を融合）',
  'options.reset': '既定値に戻す',

  'help.aria': 'この設定は何をしますか？',
  'help.fill':
    '各穴のふちをたどって三角形で塞ぎます。小さなふちは耳切り法、大きい・いびつなものは新しい中心点からの扇形で処理します。オフにすると穴は残り、ファイルは水密になりません。',
  'help.flip':
    'シェルごとに符号付き体積を求め、負なら裏返っているとみなして三角形の向きをすべて直します。健全なモデルはそのままです。',
  'help.largest':
    '体積が最大のシェルだけ残し、他をすべて削除します。部品にくっついてくるゴミには有効ですが、本当に複数部品からなるモデルは失われます。まずレポートのシェル数を確認してください。',
  'help.ascii':
    'バイナリではなくテキスト形式の STL を書き出します。サイズは約 5 倍ですが、目で読めて差分も取れます。スライサーはどちらも受け付けます。',
  'help.manifold':
    '複数の CAD ツールを支える幾何カーネル manifold3d によるセカンドオピニオンです。<code>rebuild</code> はメッシュをそこに通します。manifold3d は妥当なソリッド以外を受け付けないため、結果の裏付けになると同時に残りかすも片付き、シェル数と体積は変わりません。<code>union</code> はさらにソリッド同士を合成して自己交差を切り直します。Windows の「Fix model」ボタンと同種の修復ですが、重なり合った部品も溶接されるため、その場で印刷するヒンジは一塊になります。どちらのモードも初回に約 0.5 MB の WebAssembly をダウンロードします。',
  'help.tolerance':
    'この距離（ミリメートル）より近い 2 頂点は 1 つに統合されます。スライサーが「開いたエッジ」として報告する継ぎ目は、これで閉じます。<code>auto</code> はバウンディングボックスの対角線 × 1e-6（100 mm のモデルでおよそ 0.0001 mm）で、STL が保持する float32 の誤差に相当します。0 以上の任意の数値を指定でき、0 は完全に一致する頂点のみ統合、大きすぎる値は細部を潰します。',
  'help.tiny':
    '体積が最大シェルのこの割合を下回るシェルを削除します。<code>0</code> はすべて保持、<code>0.001</code> は本体の千分の一未満のかけらを捨てます。範囲は 0…1 です。',

  'card.working': '処理中…',
  'card.failed': '失敗',
  'card.meta': '三角形：{triangles} · {ms} ミリ秒',
  'row.size': 'サイズ',
  'row.found': '検出',
  'row.fixed': '修復',
  'row.result': '結果',
  'row.error': 'エラー',
  'row.preview': 'プレビュー',
  'size.value': '{size} mm · シェル：{shells}',
  'found.clean': '問題なし',
  'result.clean': '水密 · 三角形：{triangles} · {volume} mm³',

  'defect.open': '開いたエッジ：{n}',
  'defect.nonManifold': '非多様体エッジ：{n}',
  'defect.flipped': '向きが逆のエッジ：{n}',
  'defect.bowtie': '蝶ネクタイ頂点：{n}',
  'defect.duplicate': '重複した三角形：{n}',
  'defect.zeroArea': '面積ゼロの三角形：{n}',
  'defect.inverted': '裏返ったシェル：{n}',

  'action.welded': 'マージした頂点：{n}',
  'action.zeroArea': '面積ゼロの三角形を削除：{n}',
  'action.duplicate': '重複した三角形を削除：{n}',
  'action.nonManifold': '非多様体を除去：{n}',
  'action.bowtie': '蝶ネクタイを分離：{n}',
  'action.rewound': '向きを直した三角形：{n}',
  'action.filled': '塞いだ穴：{n}（+{triangles}）',
  'action.skipped': 'スキップした穴：{n}',
  'action.shells': '削除したシェル：{n}',
  'action.flippedShells': '反転したシェル：{n}',
  'action.manifold': 'manifold3d で再構築：三角形 {triangles} 個',

  'verdict.repaired': '修復済み',
  'verdict.broken': 'まだ壊れています',
  'button.download': 'ダウンロード',
  'button.preview': '3D プレビュー',
  'button.hidePreview': 'プレビューを隠す',
  'button.building': 'プレビューを生成中…',

  'preview.wireframe': 'ワイヤーフレーム',
  'preview.defects': '欠陥をハイライト',
  'preview.next': '次の問題へ',
  'preview.reset': '視点をリセット',
  'preview.counter': '問題 {index} / {total}',
  'preview.none': '表示する欠陥はありません',
  'preview.before': '修復前 · {triangles} △',
  'preview.after': '修復後 · {triangles} △',

  'legend.backface': '表面越しに見える裏面 — 穴、または裏返ったシェル',
  'legend.open': '開いたエッジ',
  'legend.nonManifold': '非多様体エッジ',
  'legend.flipped': '向きが逆のエッジ',
  'legend.marker': '蝶ネクタイ／面積ゼロ',
  'legend.cursor': '「次の問題へ」が移動した位置',

  'note.floating.title': '「Floating regions」はファイルの欠陥ではありません。',
  'note.floating.body':
    'この警告は印刷時に下に何もない形状についてのものです。モデルの向きを変えるか、サポートを有効にしてください。修復ツールでは消えません。',
  'note.cli.title': '同じことをターミナルで',
  'note.cli.rest': '（一括処理や CI 向け）：',
  'note.cli.comment1': '# cat-fixed.stl を書き出す',
  'note.cli.comment2': '# 壊れていれば終了コード 1',

  'footer.source': 'GitHub のソース',
  'error.noWorker':
    '3D プレビューには Web Worker が必要です。ローカルファイルとしてではなく http でページを開いてください。',
};
