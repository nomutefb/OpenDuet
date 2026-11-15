// 탭 줄 = 창 맨 위 제목 줄(형 11-16 07:56 「탭을 저 위로 붙일수도있는거야?」 · 07:58 「윈도우 화면이 맥에 맞춰지면」 · 뜸 맥 앱 약속 ①~④)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { okTabUrl } from "../ui/title-bar.ts";
test("맥 앱 새 창 링크 = http(s) 만 Browser 탭으로", () => {
  assert.equal(okTabUrl("https://www.youtube.com/watch?v=1"), true);
  assert.equal(okTabUrl("http://a.kr"), true);
  for (const u of ["javascript:alert(1)", "file:///etc/passwd", "", null, 3, "https://" + "x".repeat(5000)]) assert.equal(okTabUrl(u), false, String(u).slice(0, 20));
});
test("윈도우 PWA = 제목 줄 덮기 · 맥 앱 = 신호등 자리 · 탭 줄 왼쪽 · 시계 오른쪽이 비킴", () => {
  const m = JSON.parse(readFileSync(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));
  assert.deepEqual(m.display_override, ["window-controls-overlay", "standalone"]);
  const tb = readFileSync(new URL("../ui/tab-bar.css", import.meta.url), "utf8");
  assert.match(tb, /\.nm-tabs \{ position:fixed; top:0; left:max\(72px, calc\(var\(--nm-tb-l, 0px\) \+ 4px\)\);/);
  assert.match(tb, /html\.nm-macapp \{ --nm-tb-l: var\(--nm-mac-left, 80px\); \}/);
  assert.match(tb, /env\(titlebar-area-x, 0px\)/);
  const sh = readFileSync(new URL("../ui/shell.css", import.meta.url), "utf8");
  assert.match(sh, /\.nm-top-lights \{[^}]*right:calc\(16px \+ var\(--nm-tb-r, 0px\)\)/);
});
