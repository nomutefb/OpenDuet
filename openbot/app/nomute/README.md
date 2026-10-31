# 우리 사무실 — edit.nomute.kr/office-app/

형 10-28 04:54·05:04·07:53 「이 ui를 바탕으로 설계」·「카피말고 원본을 써야해 거기네 올리는거고」 — 이 저장소(형 포크) 앱 원본을 그대로 쓰고, 우리가 고친 것은 이 폴더 하나에 모은다.

## 짜임
- 원본 = `openbot/app`·`openbot/shared`·`openbot/tsconfig.base.json` — 고치지 않음(GitHub 「Sync fork」로 원본 새 판을 받아도 겹침 0).
- 이 폴더(`openbot/app/nomute`) = 우리 것 전부.
  - `overrides.ts` — 바꿔 끼우기 표(`SWAP` = 원본 모듈 → 우리 파일) · 글자 고치기 표(`PATCH` = 원본 파일의 정확한 글자 → 우리 글자 · 못 찾으면 빌드가 멈춤 = 원본이 바뀐 곳이 바로 드러남) · 빼는 화면(`DROP_ROUTES`).
  - `shim/` — 원본 앱의 `fetch('/api/…')`·채널 소켓·첨부를 우리 사무실 서버(`/api/office/*` · nomutefb/editor `functions/api/office`)로 잇는 곳 · 길 짝 정본 = 그 서버 쪽 짝 표.
  - `data/` — 우리 서버 읽기·쓰기 · 동기화(열린 방 = wait · 그 밖 = pulse).
  - `ui/` — 대화창(형 대화창 규칙) · 메뉴 · 오늘 카드 · 설정 판 · 얼굴 · `swap/` = 원본 자리에 끼우는 부품(구슬 등).
  - `public/` — 앱 설명서(PWA) · 서비스 워커 · 아이콘.

## 빌드
```bash
cd openbot/app/nomute
npm ci --ignore-scripts
ln -sfn "$PWD/node_modules" ../node_modules   # 원본 파일이 의존 꾸러미를 찾는 자리(openbot/app/node_modules) = 이 폴더 것
npx vite build                                 # → dist/
```
- 올리기 = nomutefb/editor 반영 길(`.github/workflows/pages-direct.yml`)이 `config/office_app.json` 에 적힌 이 저장소 커밋을 받아 위처럼 빌드해 `edit.nomute.kr/office-app/` 에 실음. 이 폴더를 고쳐 올린 뒤 그 파일의 커밋(sha)만 바꾸면 됨.

## 읽음 상태 회귀 검사

- 이 폴더에서 `npm test` (Node 26) 또는 `bun test tests/` (Bun 1.4.3). 서버 대신 격리된 전송 함수를 쓰며 실제 사무실에 글/파일/방을 만들지 않는다.
- 「안 읽음으로」는 열린 방에서도 유지한다. 새 글이나 모달 닫기는 이를 풀지 않으며, 방을 다시 선택/재입장하거나 「읽음으로」를 누르면 읽음으로 돌아간다.
- 읽음 표는 확인한 글 시각까지만 적용한다. 방 선택 직후 배지는 먼저 바꾸되, 대화창이 이전 seen을 잡은 뒤 저장해 「안 본 것부터」 기준을 보존한다. 실패하면 마지막 확인 상태로 되돌리고 목록/seen을 다시 조회한다.
- 요청 순서 보장은 이 탭 안에서만 적용된다. 서버에 명시적 unread 값이 없어 마지막 글이 형/시스템 글인 방의 강제 안 읽음 점은 이 탭의 기억이며, 새로고침 후에는 서버 셈을 따른다.
