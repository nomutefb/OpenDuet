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
node tools/live-view/serve.mjs 8899 &          # 로컬 서버(127.0.0.1:8899 · 앱 자리 /garden-app/)
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

## 재는 도구 셋 (11-16 · 형 「이제 너가 로컬에서 하면 프레임수도 알아서 재야하고, 내가 영상 보내면 그것도 알아서 재야해 항상 60으로」 · 「샘플을 주면 최대한 이에 가깝게 구현할 수 있는 방법」)
| 파일 | 하는 일 | 쓰는 법 |
|---|---|---|
| `fps.mjs` | 프레임 재기 = 크롬 안 기록(트레이스)의 프레임 장부 — 실제로 나간 프레임 간격 · 다 나감 / 반만 나감 / 빠짐 | `node tools/live-view/fps.mjs '[{"name":"홈 넘김","hash":"#/","js":"document.querySelector(\".nm-topswap-chev.r\").click()","ms":1500}]'` · 맥 실제 화면 = `NM_CDP=http://127.0.0.1:9272` |
| `step.mjs` | 움직임을 1/60초씩 넘겨 찍기 = 프레임마다 위치 · 크기 · 투명도 표 + 사진 · 샘플 곡선(`ref`)과 프레임별 차이 | `node tools/live-view/step.mjs '[{"name":"홈넘김","hash":"#/","js":"…click()","sel":".nm-topswap-pane[data-on=\"1\"]","shots":4}]'` |
| `vfps.mjs` | 영상 프레임 재기 = 형이 보낸 화면 녹화를 60 으로 풀어 실제로 바뀐 프레임 간격 | `node tools/live-view/vfps.mjs <영상> [w:h:x:y]` |

- 셋 다 `--self` = 도구 자체 시험(실제 서버 · 열쇠 없이 돎). 잣대 = `frames.mjs` 한 곳(간격 20.8ms 안 · 움직인 프레임의 95%).
- **프레임 수(성능)는 그래픽 장치가 있는 데서만 참** — 클라우드 상자의 `fps.mjs` 숫자는 전후 비교 · 도구 점검용 · 60 판정은 맥에 붙어서(`NM_CDP`). 그 탭이 화면에 보여야 함(가려진 탭 = 크롬이 안 그림 → 프레임 0).
- **움직임의 꼴(곡선)은 클라우드에서도 참** — `step.mjs` 는 녹화가 아니라 시간을 손으로 넘김. 단 선언형 움직임(CSS transition · animation · element.animate)만 · 손가락 따라오는 끌기 · 그림판 · 3D 는 안 잡힘.
- 샘플 영상에 맞추는 차례: ① 샘플을 60 으로 풀어 요소 자리를 프레임마다 뽑음(`t_ms,값` csv) ② 그 곡선에 이징 맞춤(튕김 있으면 스프링 → CSS `linear()`) ③ `step.mjs` 로 내 것을 뽑아 `ref` 로 견줌 ④ 차이가 큰 프레임 사진을 나란히. ①② 도구는 아직 없음(샘플이 오면 그때 만듦).
- 120Hz 화면(맥 프로모션 등)에선 크롬이 120 으로 돎 → 「박자 ≈ 120Hz」로 나오고 60 잣대는 그대로 간격 20.8ms 로 봄.

