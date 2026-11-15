# 실제 자료로 앱 띄워 보기 (읽기만)

클라우드 세션에서 로그인 없이 정원 앱을 **실제 사무실 자료**로 띄워 사진을 찍는 도구.
형 11-15 「실제로 보려면 너네가 bearer 키도 있는데 볼 수 없을까」.

## 되는 까닭
- 클라우드 세션의 프록시가 `edit.nomute.kr` 요청에 열쇠를 알아서 붙인다(헤더를 손으로 넣지 말 것 · `request_credential` 을 다시 열지 말 것 = 열쇠가 덮임).
- 기계 문 `/api/office/m/…` 는 그 열쇠로 읽힌다 → 로컬 서버가 앱의 `/api/office/…` GET 을 그리로 넘긴다.
- 글꼴·그림(`/assets/…`)은 실제 사이트에서 그냥 받아진다(공개).

## 쓰는 법
```bash
cd openbot/app/nomute && npm ci --no-audit --no-fund && ln -sfn "$(readlink -f node_modules)" ../node_modules && npx vite build
node tools/live-view/serve.mjs 8899 &          # 로컬 서버(127.0.0.1:8899)
node tools/live-view/shot.mjs '[{"name":"home","hash":"#/"},{"name":"sched","hash":"#/sched","wait":8000},{"name":"pc","hash":"#/chan","w":1280,"h":800}]'
```
- 사진 = `$NM_OUT`(기본 `$TMPDIR/nm-live-view`)`/<name>.png` · 폰 412×892 @2x · `w` 700 넘으면 PC.
- 일거리 칸: `name` · `hash` · `w` · `h` · `wait`(ms) · `js`(화면 안에서 돌릴 글 · 누르기 등) · `after`(ms) · `full`.
- `NM_EDITOR=/path/to/editor` = 채널 요약 · SNS 자료 파일 자리(없으면 그 두 화면만 빔).
- `NM_AS_OWNER=1` = 스케줄 표를 형 자리처럼(나무 · 바꾸기 단추) 보이게 표시만 덧붙임. 쓰기는 그래도 막힘.

## 지킬 것
- **읽기만**: GET 이 아닌 요청은 로컬에서 403 으로 막는다. 이 도구로 쓰기 길을 열지 말 것.
- 열쇠 자리 = 봇 「자리2」 → 형 전용(`pins/all` · `seen` · `teams` · `seatvault`)은 403 이 정상.
- 스케줄 표(`schedule`)는 서버가 18~19초 걸린다 → 서버가 10분 기억해 둠. 첫 사진 전에 `curl localhost:8899/api/office/schedule` 한 번.
- 이 환경은 그래픽 장치가 없어 가만히 있어도 초당 10프레임쯤 → **프레임 수는 여기서 못 잰다**(모습 · 값 · 재생 여부만).
- 서비스 워커는 막고 찍는다(옛 판이 끼어드는 것 방지).

## 덧붙은 도구 (11-15)
| 파일 | 하는 일 | 쓰는 법 |
|---|---|---|
| `err.mjs` | 앱이 뜨는지 · 콘솔 오류 한 번 보기(**빌드 뒤 맨 먼저**) | `node tools/live-view/err.mjs` |
| `perf.mjs` | 화면마다 가만히 있을 때 일 양(메인 스레드 ms/초) · 끝없이 도는 움직임 · 흐림 개수 · 그림판 · 요청 수 | `node tools/live-view/perf.mjs ",drawer,sched,chan" [너비] [높이]` (맨 앞 빈 칸 = 홈) |
| `lshot.mjs` | 밝게/어둡게 21화면 한꺼번에 찍기(전후 비교용) | `node tools/live-view/lshot.mjs <폴더> light\|dark [길 목록]` |
| `cover.mjs` | 판을 열고 닫을 때 밑 화면 · 3D 장면 상태 재기 | `node tools/live-view/cover.mjs` |
| `idle_req.mjs` | 가만히 6초 동안 나가는 요청을 주소별로 세기 | `node tools/live-view/idle_req.mjs "meetlog,chan,"` |

## 속지 말 것 (실제 문제가 아니라 이 도구 탓인 것)
- `pulse` 는 서버가 25초 붙잡는 긴 요청이다. 로컬 서버가 바로 답하면 앱이 초당 수십 번 되묻는다 → `serve.mjs` 가 25초 뒤 빈 답을 준다.
- 스케줄 표는 18~19초 걸린다. 그 전에 찍으면 「표 읽는 중…」만 나온다.
- 그래픽 장치가 없어 3D 장면이 메인 스레드를 다 쓴다(일 ≈ 1000ms/초). 장면이 보이는 화면의 숫자는 비교용으로만.
- 쓰기(POST)는 403. 단추를 누르면 「못 보냄」 빨강이 정상. 누름 동작은 작은 시험 화면(esbuild 로 부품 하나만 묶기)으로 본다.
- 열쇠 자리가 봇 「자리2」라 스케줄 나무 · 바꾸기 단추는 `NM_AS_OWNER=1` 일 때만 보인다.
