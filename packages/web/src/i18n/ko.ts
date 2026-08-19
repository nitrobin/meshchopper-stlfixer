import type { Dictionary } from './en.js';

export const ko: Dictionary = {
  'meta.title': 'Mesh Chopper - STL Fixer — 브라우저에서 STL 복구',
  'meta.description':
    '슬라이서가 거부하는 STL을 올려놓으세요: 비다양체 모서리, 열린 모서리, 뒤집힌 노멀. 브라우저 안에서 처리하며 업로드하지 않습니다.',

  'lang.label': '언어',

  'tagline.lead': '슬라이서가 거부하는 STL을 올려놓으세요 — 비다양체 모서리, 열린 모서리, 뒤집힌 노멀.',
  'tagline.local': '모든 처리는 이 탭 안에서 이뤄집니다',
  'tagline.rest': '. 파일은 컴퓨터를 벗어나지 않습니다.',

  'drop.title.strong': '.stl 파일을 여기에 놓으세요',
  'drop.title.rest': ' 또는 클릭해서 선택하세요',
  'drop.hint': '바이너리 또는 ASCII · 여러 개 동시 처리 · 복구본은 다음 이름으로 저장됩니다',
  'drop.aria': 'STL 파일 선택',

  'options.summary': '복구 옵션',
  'options.fill': '구멍 메우기',
  'options.flip': '뒤집힌 셸 바로잡기',
  'options.largest': '가장 큰 셸만 남기기',
  'options.ascii': 'ASCII STL로 저장',
  'options.tolerance': '정점 병합 허용 오차',
  'options.tiny.before': '셸 제거 기준',
  'options.tiny.after': '× 가장 큰 셸',
  'options.manifold': 'manifold3d 처리',
  'manifold.off': '끄기',
  'manifold.rebuild': '재구성(부품 유지)',
  'manifold.union': '합집합(부품 융합)',
  'options.reset': '기본값으로 되돌리기',

  'help.aria': '이 옵션은 무엇을 하나요?',
  'help.fill':
    '구멍의 테두리를 따라가며 삼각형으로 메웁니다. 작은 테두리는 이어 클리핑, 크거나 뒤틀린 것은 새 중심점에서 부채꼴로 처리합니다. 끄면 구멍이 남고 파일은 계속 새는 상태입니다.',
  'help.flip':
    '셸마다 부호 있는 부피를 계산해 음수면 뒤집힌 것으로 보고 모든 삼각형의 방향을 바로잡습니다. 멀쩡한 모델은 건드리지 않습니다.',
  'help.largest':
    '부피가 가장 큰 셸만 남기고 나머지를 지웁니다. 부품에 딸려온 부스러기를 치울 때 좋지만, 실제로 여러 부품으로 이뤄진 모델은 잃게 됩니다. 먼저 보고서의 셸 개수를 확인하세요.',
  'help.ascii':
    '바이너리 대신 텍스트 형식 STL로 저장합니다. 크기는 약 다섯 배지만 사람이 읽고 diff를 뜰 수 있습니다. 슬라이서는 둘 다 받습니다.',
  'help.manifold':
    '여러 CAD 도구의 기반인 기하 커널 manifold3d의 두 번째 의견입니다. <code>rebuild</code>는 메시를 그쪽에 통과시킵니다. manifold3d는 유효한 솔리드가 아니면 받지 않으므로 결과를 입증하는 동시에 잔여물을 정리하며, 셸 개수와 부피는 그대로입니다. <code>union</code>은 솔리드를 자기 자신과 합집합해 자기 교차를 다시 잘라냅니다. 윈도우 “Fix model” 버튼과 같은 부류의 복구지만, 겹친 부품끼리 용접되어 제자리 인쇄 힌지가 한 덩어리로 나옵니다. 두 모드 모두 처음 실행할 때 약 0.5 MB의 WebAssembly를 내려받습니다.',
  'help.tolerance':
    '이 거리(밀리미터)보다 가까운 두 정점은 하나로 합쳐집니다. 슬라이서가 열린 모서리라고 알리는 이음매가 이렇게 닫힙니다. <code>auto</code>는 바운딩 박스 대각선 × 1e-6(100 mm 모델에서 약 0.0001 mm)으로, STL이 저장하는 float32 잡음 수준입니다. 0 이상 아무 값이나 넣을 수 있고, 0은 완전히 같은 정점만 합치며, 너무 크면 미세한 디테일이 사라집니다.',
  'help.tiny':
    '부피가 가장 큰 셸의 이 비율보다 작은 셸을 지웁니다. <code>0</code>은 전부 유지, <code>0.001</code>은 본체의 천분의 일보다 작은 티끌을 버립니다. 범위는 0…1입니다.',

  'card.working': '처리 중…',
  'card.failed': '실패',
  'card.meta': '삼각형: {triangles} · {ms} ms',
  'row.size': '크기',
  'row.found': '발견',
  'row.fixed': '복구',
  'row.result': '결과',
  'row.error': '오류',
  'row.preview': '미리보기',
  'size.value': '{size} mm · 셸: {shells}',
  'found.clean': '문제없음',
  'result.clean': '수밀 · 삼각형: {triangles} · {volume} mm³',

  'defect.open': '열린 모서리: {n}',
  'defect.nonManifold': '비다양체 모서리: {n}',
  'defect.flipped': '방향이 어긋난 모서리: {n}',
  'defect.bowtie': '나비넥타이 정점: {n}',
  'defect.duplicate': '중복 삼각형: {n}',
  'defect.zeroArea': '넓이 0인 삼각형: {n}',
  'defect.inverted': '뒤집힌 셸: {n}',

  'action.welded': '병합한 정점: {n}',
  'action.zeroArea': '넓이 0 삼각형 제거: {n}',
  'action.duplicate': '중복 삼각형 제거: {n}',
  'action.nonManifold': '비다양체 제거: {n}',
  'action.bowtie': '나비넥타이 분리: {n}',
  'action.rewound': '방향 정리한 삼각형: {n}',
  'action.filled': '메운 구멍: {n} (+{triangles})',
  'action.skipped': '건너뛴 구멍: {n}',
  'action.shells': '제거한 셸: {n}',
  'action.flippedShells': '뒤집은 셸: {n}',
  'action.manifold': 'manifold3d로 재구성: 삼각형 {triangles}개',

  'verdict.repaired': '복구됨',
  'verdict.broken': '아직 손상됨',
  'button.download': '내려받기',
  'button.preview': '3D 미리보기',
  'button.hidePreview': '미리보기 숨기기',
  'button.building': '미리보기 준비 중…',

  'preview.wireframe': '와이어프레임',
  'preview.defects': '결함 강조',
  'preview.next': '다음 문제',
  'preview.reset': '시점 초기화',
  'preview.counter': '문제 {index} / {total}',
  'preview.none': '살펴볼 결함이 없습니다',
  'preview.before': '이전 · {triangles} △',
  'preview.after': '이후 · {triangles} △',

  'legend.backface': '표면 너머로 보이는 뒷면 — 구멍이거나 뒤집힌 셸',
  'legend.open': '열린 모서리',
  'legend.nonManifold': '비다양체 모서리',
  'legend.flipped': '방향이 어긋난 모서리',
  'legend.marker': '나비넥타이 / 넓이 0',
  'legend.cursor': '“다음 문제”가 이동한 위치',

  'note.floating.title': '“Floating regions”는 파일 결함이 아닙니다.',
  'note.floating.body':
    '이 경고는 출력 중 아래에 아무것도 없는 형상에 대한 것입니다. 모델 방향을 바꾸거나 서포트를 켜세요. 파일 복구로는 없어지지 않습니다.',
  'note.cli.title': '터미널에서도 같은 작업',
  'note.cli.rest': ' — 일괄 처리와 CI용:',
  'note.cli.comment1': '# cat-fixed.stl 생성',
  'note.cli.comment2': '# 문제가 있으면 종료 코드 1',

  'footer.source': 'GitHub 소스',
  'error.noWorker': '3D 미리보기에는 Web Worker가 필요합니다. 디스크가 아니라 http로 페이지를 여세요.',
};
