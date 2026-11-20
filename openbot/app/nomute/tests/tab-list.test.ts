// 위쪽 탭 줄 자료(빠르 11-09 · 형 05:16 · 시아 05:23)
import assert from "node:assert/strict";
import { test } from "node:test";
import { DASH, STRIP_FIXED, TABS_MAX, dropIndex, stripMove, stripOrder, tabColors, tabKey, tabsAdd, tabsClose, tabsLoad, tabsMove, tabsSave, webTabOpen } from "../ui/tab-list.ts";
import { noFrameUrl, webTabUrl } from "../ui/inapp.ts";

const S = (keys: string[]) => keys.join(" ");
const keysOf = (s: { tabs: Parameters<typeof tabKey>[0][] }) => S(s.tabs.map(tabKey));

test("불러오기 = 깨진 값 · 빈 값 → 대시보드 하나 · 대시보드는 늘 맨 앞 · 겹침·이상한 탭 뺌 · 방 → 화면 차례", () => {
  assert.deepEqual(tabsLoad(null), { tabs: [DASH], active: "dash" });
  assert.deepEqual(tabsLoad("{깨짐"), { tabs: [DASH], active: "dash" });
  const s = tabsLoad(JSON.stringify({ tabs: [{ k: "screen", who: "뜸", url: "https://eyes.x.ts.net/vnc.html" }, { k: "room", id: "guide" }, { k: "room", id: "guide" }, { k: "screen", who: "x", url: "javascript:1" }, { k: "dash" }], active: "r:guide" }));
  assert.equal(keysOf(s), "dash r:guide s:뜸");
  assert.equal(s.active, "r:guide");
  assert.equal(tabsLoad(JSON.stringify({ tabs: [], active: "r:nope" })).active, "dash");
});

test("붙이기 = 있으면 고르기만 · 방 탭은 방 끝 · 화면 탭은 맨 끝 · 넘치면 안 고른 앞 탭부터 뺌 · 저장 → 불러오기 같음", () => {
  let s = tabsLoad(null);
  s = tabsAdd(s, { k: "screen", who: "뜸", url: "https://eyes.x.ts.net/v" });
  s = tabsAdd(s, { k: "room", id: "guide" });
  s = tabsAdd(s, { k: "room", id: "dm-fast" }, false);
  assert.equal(keysOf(s), "dash r:guide r:dm-fast s:뜸");
  assert.equal(s.active, "r:guide");
  assert.equal(tabsAdd(s, { k: "room", id: "guide" }).tabs.length, 4);
  for (let i = 0; i < 20; i++) s = tabsAdd(s, { k: "room", id: "r" + i });
  assert.equal(s.tabs.length, TABS_MAX);
  assert.equal(tabKey(s.tabs[0]), "dash");
  assert.deepEqual(tabsLoad(tabsSave(s)), s);
});

test("닫기 = 대시보드 못 닫음 · 고른 탭 닫으면 오른쪽 → 왼쪽 → 대시보드", () => {
  let s = tabsAdd(tabsAdd(tabsAdd(tabsLoad(null), { k: "room", id: "a" }), { k: "room", id: "b" }), { k: "room", id: "c" });
  s = { ...s, active: "r:b" };
  assert.equal(tabsClose(s, "dash"), s);
  assert.equal(tabsClose(s, "r:b").active, "r:c");
  assert.equal(tabsClose({ ...s, active: "r:c" }, "r:c").active, "r:b");
  assert.equal(tabsClose(tabsClose(tabsClose(s, "r:a"), "r:b"), "r:c").active, "dash");
});

test("끌어서 순서 = 대시보드 자리 고정 · 방·화면 갈래 안에서만", () => {
  let s = tabsLoad(null);
  for (const id of ["a", "b", "c"]) s = tabsAdd(s, { k: "room", id });
  s = tabsAdd(s, { k: "screen", who: "뜸", url: "https://e.x.ts.net/v" });
  assert.equal(keysOf(tabsMove(s, "r:c", 1)), "dash r:c r:a r:b s:뜸");
  assert.equal(keysOf(tabsMove(s, "r:a", 9)), "dash r:b r:c r:a s:뜸");
  assert.equal(keysOf(tabsMove(s, "s:뜸", 0)), keysOf(s));
  assert.equal(tabsMove(s, "dash", 3), s);
});

test("고른 탭 색 = 바탕 밝기로 글자 고름 · 투명·깨짐 = 테마 따라(뎅 06:43 ㉢ · 봄 26)", () => {
  assert.deepEqual(tabColors("rgb(246, 246, 248)", false), { bg: "rgb(246, 246, 248)", fg: "#161716" });
  assert.equal(tabColors("rgb(18, 19, 20)", false).fg, "#e8eae8");   // 라이트 몸인데 판이 어두우면(뎅 ㉢) = 밝은 글
  assert.equal(tabColors("rgba(0, 0, 0, 0)", false).bg, "#f6f6f8");
  assert.deepEqual(tabColors("", true), { bg: "#121314", fg: "#e8eae8" });
  assert.equal(tabColors("rgba(30, 32, 35, 0.9)", false).fg, "#e8eae8");
});

test("웹 탭(「+」 빈 탭 · 빠르 11-11 · 형 22:10 「+ 누르면 … 인앱안에서 그냥 빈 화면 페이지」)", async () => {
  const m = await import("../ui/tab-list.ts");
  const w = m.webTabNew(1794403200000);
  assert.deepEqual(w, { k: "web", id: (1794403200000).toString(36), url: "" });
  let s = m.tabsAdd(m.tabsLoad(null), w);
  assert.equal(s.active, "w:" + (1794403200000).toString(36));
  assert.equal(m.webTabName(""), "새 탭");
  s = m.tabsSetUrl(s, s.active, "https://www.example.com/a?b=1");
  assert.equal((s.tabs[1] as { url: string }).url, "https://www.example.com/a?b=1");
  assert.equal(m.webTabName("https://www.example.com/a"), "example.com/a");   // 링크 = 주소 + 길(형 11-20 11:35)
  assert.equal(m.webTabName("https://news.naver.com/"), "news.naver.com");
  assert.equal(m.webTabName("https://n.news.naver.com/mnews/article/001/0015123456?sid=100").length, 40);
  assert.equal(m.tabsSetUrl(s, "w:none", "https://x.com"), s, "없는 탭 = 그대로");
  // 저장 → 다시 읽기 = 웹 탭 그대로 · 잘못된 웹 탭(주소 꼴 · id 꼴) = 버림
  const back = m.tabsLoad(m.tabsSave(s));
  assert.deepEqual(back, s);
  const bad = m.tabsLoad(JSON.stringify({ tabs: [{ k: "web", id: "A B", url: "" }, { k: "web", id: "ok1", url: "javascript:alert(1)" }, { k: "web", id: "ok2", url: "" }], active: "w:ok2" }));
  assert.deepEqual(bad.tabs.map(m.tabKey), ["dash", "w:ok2"]);
  // 방 탭은 앞 · 화면 · 웹 탭은 섞여 끌림(같은 갈래)
  let t = m.tabsAdd(m.tabsLoad(null), { k: "screen", who: "fast", url: "https://fast2.x.ts.net/vnc.html" });
  t = m.tabsAdd(t, m.webTabNew(5));
  t = m.tabsAdd(t, { k: "room", id: "all" });
  assert.deepEqual(t.tabs.map(m.tabKey), ["dash", "r:all", "s:fast", "w:5"]);
  t = m.tabsMove(t, "w:5", 2);
  assert.deepEqual(t.tabs.map(m.tabKey), ["dash", "r:all", "w:5", "s:fast"]);
  assert.deepEqual(m.tabsMove(t, "w:5", 1).tabs.map(m.tabKey), ["dash", "r:all", "w:5", "s:fast"], "방 갈래로는 못 넘어감");
});

test("줄 차례 = 고정 넷도 끌어 옮김 · 저장된 차례에서 없어진 탭은 빠지고 새 탭은 끝 · 새 고정 탭은 제 앞 탭 뒤(형 11-17 「그 상단에 탭, 끌어서 쓰면 순서를 전환할 수 있게 해줘」)", () => {
  assert.deepEqual(STRIP_FIXED, ["dash", "teams", "meet", "co", "sns"]);   // 형 11-18 「애초에 순서가 팀즈 , 화상회의, 브라우저」 · sns = SNS 탭(형 11-20 09:20)
  assert.deepEqual(stripOrder(null, STRIP_FIXED, ["w:a"]), ["dash", "teams", "meet", "co", "sns", "w:a"]);   // 처음 = 기본 차례
  assert.deepEqual(stripOrder("깨짐", STRIP_FIXED, []), ["dash", "teams", "meet", "co", "sns"]);
  assert.deepEqual(stripOrder(["teams", "w:a", "dash", "co", "meet"], STRIP_FIXED, ["w:a", "s:뜸"]), ["teams", "w:a", "dash", "co", "sns", "meet", "s:뜸"]);   // 새 고정 sns = 제 앞 고정(co) 바로 뒤   // 옮긴 대로 · 새 탭 = 끝
  assert.deepEqual(stripOrder(["teams", "w:gone", "teams", 7, "dash"], STRIP_FIXED, []), ["teams", "meet", "co", "sns", "dash"]);   // 닫힌 탭 · 두 번 · 글 아닌 값 = 빠짐 · 빠져 있던 고정 탭 = 제 앞 탭(dash) 뒤로
  assert.deepEqual(stripOrder(["meet", "teams"], STRIP_FIXED, []), ["dash", "meet", "co", "sns", "teams"]);   // 앞 탭이 없으면 맨 앞부터
  const o = ["dash", "co", "meet", "teams", "w:a"];
  assert.deepEqual(stripMove(o, "teams", 0), ["teams", "dash", "co", "meet", "w:a"]);   // 봄의 정원 앞으로도
  assert.deepEqual(stripMove(o, "dash", 4), ["co", "meet", "teams", "w:a", "dash"]);
  assert.deepEqual(stripMove(o, "w:a", 1), ["dash", "w:a", "co", "meet", "teams"]);   // 연 탭이 고정 탭 사이로
  assert.deepEqual(stripMove(o, "co", 99), ["dash", "meet", "teams", "w:a", "co"]);   // 밖 = 끝으로 맞춤
  assert.equal(stripMove(o, "co", 1), o); assert.equal(stripMove(o, "없음", 2), o);   // 같은 자리 · 없는 키 = 그대로
});
test("갈 자리 = 끄는 탭의 가운데가 옆 탭 가운데를 넘을 때 · 폭이 달라도 바꾼 바로 뒤에 되돌아가지 않음", () => {
  const boxes = [[0, 100], [100, 60], [160, 200]] as const;   // 폭이 다른 탭 셋
  assert.equal(dropIndex(boxes, 0, 50), 0);    // 제자리
  assert.equal(dropIndex(boxes, 0, 129), 0);   // 옆 탭 가운데(130) 전
  assert.equal(dropIndex(boxes, 0, 131), 1);   // 넘음 = 한 칸
  assert.equal(dropIndex(boxes, 0, 261), 2);   // 셋째 가운데(260)도 넘음 = 끝
  assert.equal(dropIndex(boxes, 2, 129), 1); assert.equal(dropIndex(boxes, 2, 49), 0);   // 왼쪽으로
  assert.equal(dropIndex(boxes, 1, 130), 1); assert.equal(dropIndex(boxes, 1, 9999), 2);
  assert.equal(dropIndex([[0, 100]], 0, 500), 0);
  // 폭 다른 둘을 바꾼 바로 뒤에 되돌아가지 않음(떨림 없음): [A200, B80] 에서 A 를 오른쪽으로 → 바뀐 뒤 [B80, A200]
  assert.equal(dropIndex([[0, 200], [200, 80]], 0, 241), 1); assert.equal(dropIndex([[0, 80], [80, 200]], 1, 241), 1);
});
test("탭 줄 = 요소를 옮겨 꽂지 않고 order 값으로만 차례를 바꿈(뿌리 :has() 규칙 탓에 옮겨 꽂기 한 번 = 꼴 계산 45 ~ 70ms · 11-17 실물) · 끄는 동안 transform 만", async () => {
  const { readFileSync } = await import("node:fs");
  const tsx = readFileSync(new URL("../ui/tab-bar.tsx", import.meta.url), "utf8"), css = readFileSync(new URL("../ui/tab-bar.css", import.meta.url), "utf8");
  assert.match(tsx, /\{dom\.current\.map\(\(key\) => \{/); assert.match(tsx, /style=\{\{ order: at \}\}/);
  assert.doesNotMatch(tsx, /\{order\.map\(\(key\) =>/);   // 줄 차례대로 그리면 React 가 요소를 옮겨 꽂음
  const step = tsx.slice(tsx.indexOf("const step = () =>"), tsx.indexOf("const move = (e"));
  assert.doesNotMatch(step, /style\.(left|right|width)\b/); assert.match(step, /style\.transform = `translate3d\(/);   // 끄는 화면마다 = transform 만
  assert.match(tsx, /if \(!d\.raf\) d\.raf = requestAnimationFrame\(step\);/);   // 화면 한 장에 한 번
  assert.match(css, /\.nm-tab\[data-sep\]:not\(\.on\)::before/); assert.match(css, /\.nm-tab-plus \{ order:98; \}/);
});

test("바깥 링크 = 창 안 웹 탭으로(형 11-17 「내부에서 무조건 열려야해. 창 내부 탭(브라우저)」) · 같은 주소는 그 탭을 고름 · 우리 사이트 · 이슈 · 웹 아닌 주소는 앞 길", () => {
  const O = "https://edit.nomute.kr", B = O + "/garden-app/#/group/all";
  assert.equal(webTabUrl("https://www.naver.com/", B, O), "https://www.naver.com/");   // 품기를 막는 곳도 탭으로(앞 = 밖 새 창)
  assert.equal(webTabUrl("https://example.com/a?b=1#c", B, O), "https://example.com/a?b=1#c");
  assert.equal(webTabUrl("/news/deck", B, O), null);   // 우리 사이트 화면 = 앞 길(#/web 겹 · 톤 입히는 판)
  assert.equal(webTabUrl("https://github.com/nomutefb/editor/issues/12", B, O), null);   // 이슈 = 앱 안 「< 이슈」 판
  assert.equal(webTabUrl("mailto:a@b.c", B, O), null); assert.equal(webTabUrl("http://[", B, O), null);
  let s = tabsLoad(null);
  s = webTabOpen(s, "https://example.com/", 1000);
  assert.deepEqual(s.tabs.map(tabKey), ["dash", "w:rs"]); assert.equal(s.active, "w:rs");
  const again = webTabOpen({ ...s, active: "dash" }, "https://example.com/", 2000);
  assert.deepEqual(again.tabs, s.tabs); assert.equal(again.active, "w:rs");   // 같은 주소 = 탭 안 늘고 그 탭을 고름
  assert.equal(webTabOpen(s, "https://example.com/", 3000), s);   // 이미 그 탭을 보는 중 = 그대로(다시 안 그림)
  const two = webTabOpen(s, "https://www.naver.com/", 1000);   // 같은 순간(id 겹침) = 다음 번호
  assert.deepEqual(two.tabs.map(tabKey), ["dash", "w:rs", "w:rt"]); assert.equal(two.active, "w:rt");
  assert.equal(webTabOpen(s, "javascript:alert(1)", 1), s); assert.equal(webTabOpen(s, "", 1), s);
});

test("탭 줄 차례 저장 = 끌어 옮긴 뒤에만(기본 차례는 저장 안 함 = 기본이 바뀌면 바로 먹음) · 열쇠 v2 · 옛 v1 치움", async () => {
  const { readFileSync } = await import("node:fs");
  const tsx = readFileSync(new URL("../ui/tab-bar.tsx", import.meta.url), "utf8"), tl = readFileSync(new URL("../ui/tab-list.ts", import.meta.url), "utf8");
  assert.match(tl, /ORDER_KEY = "nm-tab-order-v2"/);
  assert.match(tsx, /useEffect\(\(\) => \{ if \(!ord\) return; try \{ localStorage\.setItem\(ORDER_KEY/);
  assert.match(tsx, /localStorage\.removeItem\("nm-tab-order-v1"\)/);
});

test("noFrameUrl = 품기를 막는 사이트만(새 맥 앱이 제 탭으로 여는 주소) · 그 밖 · 이슈 · 메일 = null", () => {
  const B = "https://edit.nomute.kr/garden-app/";
  assert.equal(noFrameUrl("https://www.naver.com/", B), "https://www.naver.com/");
  assert.equal(noFrameUrl("https://x.com/a", B), "https://x.com/a");
  assert.equal(noFrameUrl("https://example.com/", B), null);
  assert.equal(noFrameUrl("https://github.com/nomutefb/editor/issues/12", B), null);
  assert.equal(noFrameUrl("mailto:a@b.kr", B), null);
});
