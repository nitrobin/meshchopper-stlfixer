import type { Dictionary } from './en.js';

export const zh: Dictionary = {
  'meta.title': 'Mesh Chopper - STL Fixer — 在浏览器里修复 STL 文件',
  'meta.description':
    '把切片软件拒绝的 STL 拖进来：非流形边、开放边、法线翻转。全部在浏览器本地修复，文件不会上传。',

  'lang.label': '语言',

  'tagline.lead': '把切片软件拒绝的 STL 拖进来 —— 非流形边、开放边、法线翻转。',
  'tagline.local': '全部在这个标签页里完成',
  'tagline.rest': '，文件不会离开你的电脑。',

  'drop.title.strong': '把 .stl 文件拖到这里',
  'drop.title.rest': '，或点击选择',
  'drop.hint': '二进制或 ASCII · 可一次多个 · 修复后的副本另存为',
  'drop.aria': '选择 STL 文件',

  'options.summary': '修复选项',
  'options.fill': '填补孔洞',
  'options.flip': '翻正内外颠倒的外壳',
  'options.largest': '只保留最大的外壳',
  'options.ascii': '输出 ASCII STL',
  'options.tolerance': '顶点焊接容差',
  'options.tiny.before': '丢弃体积小于',
  'options.tiny.after': '× 最大外壳的部件',
  'options.manifold': 'manifold3d 处理',
  'manifold.off': '关闭',
  'manifold.rebuild': '重建（保留各部件）',
  'manifold.union': '并集（融合部件）',
  'options.reset': '恢复默认',

  'help.aria': '这个选项有什么用？',
  'help.fill':
    '沿着每个孔的边界走一圈并三角化：小孔用耳切法，大孔或形状别扭的用新中心点做扇形。关闭后孔洞保留，文件仍然不封闭。',
  'help.flip':
    '计算每个外壳的有符号体积；为负说明它内外颠倒，于是把它所有三角面重新定向。正常模型不受影响。',
  'help.largest':
    '只保留体积最大的外壳，其余全部删除。适合清掉跟着零件跑的碎屑，但本来就由多个零件组成的模型会丢件——请先看报告里的外壳数量。',
  'help.ascii':
    '输出 STL 的文本格式而不是二进制：体积大约是五倍，但可读、可做 diff。切片软件两种都接受。',
  'help.manifold':
    '来自 manifold3d 的第二意见——多款 CAD 工具背后的几何内核。<code>rebuild</code> 把网格送进去处理：manifold3d 只接受合法实体，所以这一步既验证了结果又清掉了残留，外壳数量和体积保持不变。<code>union</code> 还会把实体与自身求并，重新切开自相交——与 Windows “Fix model” 按钮同一类修复——但同时也会把相互重叠的部件焊在一起，原地打印的活动关节会变成一整块。两种模式首次运行都会下载约 0.5 MB 的 WebAssembly。',
  'help.tolerance':
    '距离小于这个值（毫米）的两个顶点会被合并成一个——切片软件报告的“开放边”接缝正是这样闭合的。<code>auto</code> 表示包围盒对角线 × 1e-6（100 毫米模型上约 0.0001 毫米），与 STL 里 float32 的噪声相当。可填任何不小于 0 的数；0 只合并完全相同的顶点，数值过大则会吞掉细节。',
  'help.tiny':
    '删除体积低于最大外壳这一比例的外壳。<code>0</code> 保留全部；<code>0.001</code> 丢掉小于主体千分之一的碎屑。取值范围 0…1。',

  'card.working': '处理中…',
  'card.failed': '失败',
  'card.meta': '三角面：{triangles} · {ms} 毫秒',
  'row.size': '尺寸',
  'row.found': '发现',
  'row.fixed': '已修复',
  'row.result': '结果',
  'row.error': '错误',
  'row.preview': '预览',
  'size.value': '{size} 毫米 · 外壳：{shells}',
  'found.clean': '没有问题',
  'result.clean': '水密 · 三角面：{triangles} · {volume} 立方毫米',

  'defect.open': '开放边：{n}',
  'defect.nonManifold': '非流形边：{n}',
  'defect.flipped': '朝向不一致的边：{n}',
  'defect.bowtie': '蝴蝶结顶点：{n}',
  'defect.duplicate': '重复三角面：{n}',
  'defect.zeroArea': '零面积三角面：{n}',
  'defect.inverted': '内外颠倒的外壳：{n}',

  'action.welded': '焊接顶点：{n}',
  'action.zeroArea': '删除零面积三角面：{n}',
  'action.duplicate': '删除重复三角面：{n}',
  'action.nonManifold': '切除非流形：{n}',
  'action.bowtie': '拆分蝴蝶结：{n}',
  'action.rewound': '重新定向三角面：{n}',
  'action.filled': '填补孔洞：{n}（+{triangles}）',
  'action.skipped': '跳过孔洞：{n}',
  'action.shells': '删除外壳：{n}',
  'action.flippedShells': '翻正外壳：{n}',
  'action.manifold': '由 manifold3d 重建：{triangles} 个三角面',

  'verdict.repaired': '已修复',
  'verdict.broken': '仍有问题',
  'button.download': '下载',
  'button.preview': '3D 预览',
  'button.hidePreview': '隐藏预览',
  'button.building': '正在生成预览…',

  'preview.wireframe': '线框',
  'preview.defects': '高亮缺陷',
  'preview.next': '下一个问题',
  'preview.reset': '重置视角',
  'preview.counter': '第 {index} / {total} 个问题',
  'preview.none': '没有缺陷可查看',
  'preview.before': '修复前 · {triangles} △',
  'preview.after': '修复后 · {triangles} △',

  'legend.backface': '透过表面看到的背面 —— 孔洞或内外颠倒的外壳',
  'legend.open': '开放边',
  'legend.nonManifold': '非流形边',
  'legend.flipped': '朝向不一致的边',
  'legend.marker': '蝴蝶结 / 零面积',
  'legend.cursor': '“下一个问题”跳到的位置',

  'note.floating.title': '“Floating regions”（悬空区域）不是文件缺陷。',
  'note.floating.body':
    '该警告说的是打印时下方没有支撑的几何：请重新摆放模型或打开支撑。任何修复工具都消除不了它。',
  'note.cli.title': '在终端里做同样的事',
  'note.cli.rest': '，适合批量处理和 CI：',
  'note.cli.comment1': '# 生成 cat-fixed.stl',
  'note.cli.comment2': '# 有问题时返回 1',

  'footer.source': 'GitHub 源代码',
  'error.noWorker': '3D 预览需要 Web Worker：请通过 http 打开页面，而不是直接打开本地文件。',
};
