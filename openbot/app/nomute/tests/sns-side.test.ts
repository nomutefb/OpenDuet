// SNS 탭 오른쪽 칸 = 껍데기 앱 웹뷰 다리(형 11-20 09:20 dm-bom 봄 옮김 「SNS 탭을 누르면 대화는 유지되고, (좌측에) 우측에 인스타랑 그런거 뜨게해주라」 · 봄 ①)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { SNS_SITES, sideBridge, sideMsg, siteOf } from "../ui/sns-side";

test("다리 글 = 칸 자리(정수 · 화면 안으로 자름) + 곳 · 주소", () => {
  assert.deepEqual(sideMsg("threads", { left: 800.4, top: 120.6, width: 400.2, height: 711.1 }, 1440, 900), { t: "nm-side", on: true, site: "threads", url: "https://www.threads.com/", rect: { x: 800, y: 121, w: 400, h: 711 }, vw: 1440, vh: 900 });
  assert.deepEqual(sideMsg("x", { left: -5, top: 10, width: 2000, height: 2000 }, 1000, 800).rect, { x: 0, y: 10, w: 1000, h: 790 });
  assert.deepEqual(SNS_SITES.map((s) => s.id), ["instagram", "threads", "x"]);
  assert.equal(siteOf("x"), "x"); assert.equal(siteOf("tiktok"), "instagram"); assert.equal(siteOf(null), "instagram");
});

test("다리 찾기 = 맥 앱(webkit nmSide) 먼저 · 윈도우 앱(chrome.webview + __nmSide) · 없으면 null", () => {
  const got: unknown[] = [];
  sideBridge({ webkit: { messageHandlers: { nmSide: { postMessage: (o: unknown) => got.push(["mac", o]) } } } })!({ t: "nm-side", on: false });
  sideBridge({ chrome: { webview: { postMessage: (o: unknown) => got.push(["win", o]) } }, __nmSide: 1 })!({ t: "nm-side", on: false });
  assert.equal(sideBridge({ chrome: { webview: { postMessage: () => {} } } }), null, "옛 윈도우 앱(옆 칸 없음) = 다리 0");
  assert.deepEqual(got, [["mac", { t: "nm-side", on: false }], ["win", { t: "nm-side", on: false }]]);
  assert.equal(sideBridge({}), null); assert.equal(sideBridge(undefined), null);
});

test("탭 줄 = 고정 「SNS」 · 오른쪽 칸 = SnsSidePane · 떠나면 on:false", () => {
  const tb = readFileSync(new URL("../ui/tab-bar.tsx", import.meta.url), "utf8"), tl = readFileSync(new URL("../ui/tab-list.ts", import.meta.url), "utf8"), p = readFileSync(new URL("../ui/sns-side-pane.tsx", import.meta.url), "utf8");
  assert.match(tl, /STRIP_FIXED: readonly string\[\] = \["dash", "teams", "meet", "co", "sns"\]/);
  assert.match(tb, /\{s\.active === SNS \? <div className="nm-tab-sns"><SnsSidePane \/><\/div> : null\}/);
  assert.match(tb, /if \(pane !== "chat" && c\) go\(`#\/channels\/\$\{encodeURIComponent\(c\)\}`\);/);   // 왼쪽 = 대화 그대로 · 홈이면 마지막 대화
  assert.match(p, /useEffect\(\(\) => \(\) => \{ send\?\.\(\{ t: "nm-side", on: false \}\); \}, \[send\]\);/);
});
