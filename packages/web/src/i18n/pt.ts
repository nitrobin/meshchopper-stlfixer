import type { Dictionary } from './en.js';

export const pt: Dictionary = {
  'meta.title': 'Mesh Chopper - STL Fixer — reparar arquivos STL no navegador',
  'meta.description':
    'Solte um STL que o fatiador recusa: arestas non-manifold, arestas abertas, normais invertidas. Reparado localmente no navegador, nada é enviado.',

  'lang.label': 'Idioma',

  'tagline.lead':
    'Solte um STL que o seu fatiador recusa — arestas non-manifold, arestas abertas, normais invertidas.',
  'tagline.local': 'Tudo acontece nesta aba',
  'tagline.rest': '; nenhum arquivo sai do seu computador.',

  'drop.title.strong': 'Solte arquivos .stl aqui',
  'drop.title.rest': ' ou clique para escolher',
  'drop.hint': 'Binário ou ASCII · vários de uma vez · a cópia reparada é baixada como',
  'drop.aria': 'Escolher arquivos STL',

  'options.summary': 'Opções de reparo',
  'options.fill': 'Fechar buracos',
  'options.flip': 'Corrigir cascas invertidas',
  'options.largest': 'Manter apenas a maior casca',
  'options.ascii': 'Gravar STL ASCII',
  'options.tolerance': 'Tolerância de solda',
  'options.tiny.before': 'Descartar cascas abaixo de',
  'options.tiny.after': '× a maior',
  'options.manifold': 'passagem manifold3d',
  'manifold.off': 'desligada',
  'manifold.rebuild': 'reconstruir (mantém as peças)',
  'manifold.union': 'união (funde as peças)',
  'options.reset': 'Restaurar padrões',

  'help.aria': 'O que essa opção faz?',
  'help.fill':
    'Percorre a borda de cada buraco e a triangula: recorte de orelhas nos pequenos, leque a partir de um novo ponto central nos grandes ou tortos. Desligado, os buracos ficam e o arquivo continua não estanque.',
  'help.flip':
    'Calcula o volume com sinal de cada casca; negativo significa virada do avesso, e todos os triângulos dela são reorientados. Modelos saudáveis não são tocados.',
  'help.largest':
    'Mantém a casca de maior volume e apaga as demais. Bom contra sujeira que viaja junto da peça, mas um modelo feito de várias peças reais as perde — confira antes o número de cascas no relatório.',
  'help.ascii':
    'Grava a variante em texto do STL em vez da binária: cerca de cinco vezes maior, porém legível e comparável em diff. Os fatiadores aceitam as duas.',
  'help.manifold':
    'Uma segunda opinião do manifold3d, o núcleo geométrico por trás de várias ferramentas CAD. <code>rebuild</code> passa a malha por ele: o manifold3d só aceita um sólido válido, então a passagem valida o resultado e limpa sobras, mantendo contagem de cascas e volume. <code>union</code> ainda une o sólido consigo mesmo e recorta autointerseções — o mesmo tipo de reparo do botão “Fix model” do Windows — mas também solda peças que se sobrepõem: uma dobradiça impressa no lugar sai como um bloco só. Os dois modos baixam cerca de 0,5 MB de WebAssembly na primeira vez.',
  'help.tolerance':
    'Dois vértices mais próximos que esta distância, em milímetros, viram um só — é assim que se fecham as costuras que o fatiador aponta como arestas abertas. <code>auto</code> é a diagonal da caixa envolvente × 1e-6 (cerca de 0,0001 mm num modelo de 100 mm), o ruído float32 que o STL guarda. Aceita qualquer número a partir de 0; 0 junta apenas vértices idênticos e um valor grande demais engole detalhes finos.',
  'help.tiny':
    'Apaga cascas cujo volume esteja abaixo desta fração da maior. <code>0</code> mantém tudo; <code>0.001</code> descarta partículas menores que um milésimo do corpo principal. Faixa 0…1.',

  'card.working': 'processando…',
  'card.failed': 'falhou',
  'card.meta': 'triângulos: {triangles} · {ms} ms',
  'row.size': 'tamanho',
  'row.found': 'encontrado',
  'row.fixed': 'corrigido',
  'row.result': 'resultado',
  'row.error': 'erro',
  'row.preview': 'prévia',
  'size.value': '{size} mm · cascas: {shells}',
  'found.clean': 'nada a corrigir',
  'result.clean': 'estanque · triângulos: {triangles} · {volume} mm³',

  'defect.open': 'arestas abertas: {n}',
  'defect.nonManifold': 'arestas non-manifold: {n}',
  'defect.flipped': 'arestas mal orientadas: {n}',
  'defect.bowtie': 'vértices gravata-borboleta: {n}',
  'defect.duplicate': 'triângulos duplicados: {n}',
  'defect.zeroArea': 'triângulos sem área: {n}',
  'defect.inverted': 'cascas invertidas: {n}',

  'action.welded': 'vértices soldados: {n}',
  'action.zeroArea': 'triângulos sem área removidos: {n}',
  'action.duplicate': 'duplicados removidos: {n}',
  'action.nonManifold': 'non-manifold cortados: {n}',
  'action.bowtie': 'gravatas separadas: {n}',
  'action.rewound': 'triângulos reorientados: {n}',
  'action.filled': 'buracos fechados: {n} (+{triangles})',
  'action.skipped': 'buracos ignorados: {n}',
  'action.shells': 'cascas removidas: {n}',
  'action.flippedShells': 'cascas corrigidas: {n}',
  'action.manifold': 'reconstruído pelo manifold3d: {triangles} triângulos',

  'verdict.repaired': 'Reparado',
  'verdict.broken': 'Ainda quebrado',
  'button.download': 'Baixar',
  'button.preview': 'Prévia 3D',
  'button.hidePreview': 'Ocultar prévia',
  'button.building': 'Preparando prévia…',

  'preview.wireframe': 'Malha de arestas',
  'preview.defects': 'Destacar defeitos',
  'preview.next': 'Próximo problema',
  'preview.reset': 'Redefinir vista',
  'preview.counter': 'problema {index} de {total}',
  'preview.none': 'nenhum defeito para visitar',
  'preview.before': 'antes · {triangles} △',
  'preview.after': 'depois · {triangles} △',

  'legend.backface': 'face interna vista através da superfície — buraco ou casca invertida',
  'legend.open': 'aresta aberta',
  'legend.nonManifold': 'aresta non-manifold',
  'legend.flipped': 'aresta mal orientada',
  'legend.marker': 'gravata-borboleta / sem área',
  'legend.cursor': 'para onde “Próximo problema” pulou',

  'note.floating.title': '“Floating regions” não é defeito do arquivo.',
  'note.floating.body':
    'Esse aviso é sobre geometria sem nada embaixo durante a impressão — reoriente o modelo ou ligue os suportes. Nenhum reparo resolve isso.',
  'note.cli.title': 'O mesmo no terminal',
  'note.cli.rest': ', para lotes e CI:',
  'note.cli.comment1': '# grava cat-fixed.stl',
  'note.cli.comment2': '# sai com 1 se algo estiver quebrado',

  'footer.source': 'Código no GitHub',
  'error.noWorker':
    'A prévia 3D precisa de Web Workers; abra a página por http, não pelo disco.',
};
