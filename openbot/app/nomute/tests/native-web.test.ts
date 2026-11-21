// 웹 칸 다리(ui/native-web.ts) — 순수 부분 + 물린 자리(형 11-21 「웹엡에서 인스타 웹뷰붙여서 열기로 했는데 안되더라 되게해줘 마무리까지」 「거기사 인터넷도 다 열리게 하고싶음 뉴스등 클릭하면」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { boxOf, clipHoles, probePoints, webBridge } from "../ui/native-web.ts";
import { toAddress } from "../ui/web-pane-addr.ts";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("다리 = 맥은 처리기가 있을 때 · 윈도우는 표식이 있을 때만 · 그 밖 = 없음(끼움 그대로)", () => {
  const got: unknown[] = [];
  const mac = webBridge({ webkit: { messageHandlers: { nmWeb: { postMessage: (o: unknown) => got.push(o) } } } });
  assert.ok(mac); mac!({ t: "nm-web-hello" }); assert.deepEqual(got, [{ t: "nm-web-hello" }]);
  assert.equal(webBridge({ webkit: { messageHandlers: { nmSide: { postMessage() {} } } } }), null);   // 옛 맥 앱(SNS 칸만) = 웹 칸 없음
  assert.equal(webBridge({ chrome: { webview: { postMessage() {} } } }), null);                       // 옛 윈도우 앱 = 표식 없음
  assert.ok(webBridge({ chrome: { webview: { postMessage() {} } }, __nmWeb: 1 }));
  assert.equal(webBridge({}), null); assert.equal(webBridge(undefined), null);
});

test("자리 = 정수 · 화면 밖으로 넘친 쪽은 잘림", () => {
  assert.deepEqual(boxOf({ left: 64.4, top: 84.2, width: 1100.3, height: 859.9 }, 1164, 943), { x: 64, y: 84, w: 1100, h: 859 });
  assert.deepEqual(boxOf({ left: -5, top: 10, width: 2000, height: 2000 }, 1000, 800), { x: 0, y: 10, w: 1000, h: 790 });
  assert.deepEqual(boxOf({ left: 0, top: 0, width: 0, height: 0 }, 1000, 800), { x: 0, y: 0, w: 0, h: 0 });   // 숨은 칸 = 크기 없음
});

test("구멍 = 칸과 겹치는 조각만 · 칸 안으로 잘림 · 품긴 것 버림 · 자리순", () => {
  const R = { x: 64, y: 84, w: 1100, h: 860 };
  const hs = clipHoles(R, [
    { x: 300, y: 60, w: 268, h: 240, r: 8 },       // 메뉴 판 = 위에서 내려옴(칸 위로 24px 는 잘림)
    { x: 10, y: 10, w: 40, h: 40 },                // 칸 밖 = 버림
    { x: 400, y: 800, w: 300, h: 44, r: 14 },      // 알림
    { x: 420, y: 810, w: 20, h: 10 },              // 알림 안에 든 조각 = 버림
    { x: 1150, y: 900, w: 100, h: 100 },           // 오른쪽 아래로 넘침 = 잘림
    { x: 500, y: 500, w: 1, h: 1 },                // 너무 작음 = 버림
  ]);
  assert.deepEqual(hs, [{ x: 300, y: 84, w: 268, h: 216, r: 8 }, { x: 400, y: 800, w: 300, h: 44, r: 14 }, { x: 1150, y: 900, w: 14, h: 44 }]);
  assert.deepEqual(clipHoles(R, []), []);
  assert.equal(clipHoles(R, Array.from({ length: 30 }, (_, i) => ({ x: 100 + i * 30, y: 100 + i * 20, w: 20, h: 10 }))).length, 12);   // 최대 12
  const veil = clipHoles(R, [{ x: 0, y: 0, w: 2000, h: 2000 }, { x: 300, y: 300, w: 100, h: 100 }]);
  assert.deepEqual(veil, [{ x: 64, y: 84, w: 1100, h: 860 }]);   // 화면 덮개 = 칸 전체 하나
});

test("찍어 볼 점 = 다 칸 안 · 가장자리 띠가 촘촘 · 작은 칸 = 0", () => {
  const R = { x: 64, y: 84, w: 1100, h: 860 }, pts = probePoints(R);
  assert.ok(pts.length > 150 && pts.length < 420, String(pts.length));
  for (const [x, y] of pts) assert.ok(x >= R.x && x < R.x + R.w && y >= R.y && y < R.y + R.h, `${x},${y}`);
  const fab = { x: R.x + R.w - 96, y: R.y + R.h - 96, w: 56, h: 56 };   // 오른쪽 아래 둥근 단추(56px) = 띠 점이 하나는 걸림
  assert.ok(pts.some(([x, y]) => x >= fab.x && x < fab.x + fab.w && y >= fab.y && y < fab.y + fab.h));
  const menu = { x: R.x + 300, y: R.y, w: 268, h: 200 };               // 위에서 내려온 메뉴 판
  assert.ok(pts.some(([x, y]) => x >= menu.x && x < menu.x + menu.w && y >= menu.y && y < menu.y + menu.h));
  assert.deepEqual(probePoints({ x: 0, y: 0, w: 10, h: 10 }), []);
});

test("주소 = 진짜 웹뷰 칸에선 보통 구글(끼움용 igu=1 안 붙임) · 끼움은 앞 그대로", () => {
  assert.equal(toAddress("봄 날씨", true), "https://www.google.com/search?q=%EB%B4%84%20%EB%82%A0%EC%94%A8");
  assert.match(toAddress("봄 날씨"), /igu=1/);
  assert.equal(toAddress("naver.com", true), "https://naver.com");
});

test("물린 자리 — 웹 칸 · 탭 줄 · 바깥 링크 · SNS 칸", () => {
  const pane = rd("../ui/web-pane.tsx"), bar = rd("../ui/tab-bar.tsx"), inapp = rd("../ui/inapp.ts"), sns = rd("../ui/sns-side-pane.tsx"), shell = rd("../ui/shell.tsx");
  assert.match(pane, /const real = !!send && !!sid && \(cur \? !sameSite\(cur\) : isAdopted\(sid\)\)/);   // 같은 사이트(우리 화면) = 끼움 그대로
  assert.match(pane, /trackSpot\(el, \(sp\) => send\(sp \? \{ t: "nm-web", id: sid, on: true/);
  assert.match(pane, /if \(real\) \{ setCheck\(\{ state: "ok" \}\); return; \}/);                          // 품기 판정 서버 안 물음
  assert.match(bar, /<WebPane sid=\{t\.id\}/); assert.match(bar, /<WebPane sid="browser"/); assert.match(shell, /<WebPane key=\{u\} sid="layer"/);
  assert.match(bar, /send\(\{ t: "nm-web-hello" \}\)/); assert.match(bar, /cmd: "close"/);
  assert.match(inapp, /if \(nativeWeb\(\) && tabBarOn\(\) && webTab\(raw, base\)\) return true;/);
  assert.match(inapp, /NO_FRAME\.test\(u\.hostname\) && !nativeWeb\(\)/);
  assert.ok(inapp.indexOf("if (macApp() && macTab(raw, base)) return true;") < inapp.indexOf("if (nativeWeb() && tabBarOn()"));   // 옛 윈도우 앱(nm-macapp) 길이 먼저 = 그대로
  assert.match(sns, /holes: sp\.holes/);
});
