// 형이 바깥(그록봇 앱 · 클로드 창)에서 친 글 = 검정 차콜 말풍선(형 11-16 08:42 dm-bom 「그록봇애서 친 내 대화는 검정색 챠콜 배경으로 표기되어야하고」 · 봄 08:49)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
test("바깥 형 글 = 앱 · 창 둘 다 같은 꼴 · 검정 바탕(보통 형 말풍선 차콜보다 짙게)", () => {
  const tsx = readFileSync(new URL("../ui/office-chat.tsx", import.meta.url), "utf8");
  const m = tsx.match(/const hyungApp = \(m: [^)]*\) => ([^;]+);/);
  assert.ok(m, "hyungApp 있음");
  const hyungApp = new Function("m", "return " + m[1]) as (x: Record<string, string>) => boolean;
  assert.equal(hyungApp({ mirror_by: "형" }), true);
  assert.equal(hyungApp({ mirror: "window" }), true);
  assert.equal(hyungApp({ who: "형(앱에서 씀)" }), true);
  assert.equal(hyungApp({ who: "형(창에서 씀)" }), true);
  assert.equal(hyungApp({ who: "형" }), false);
  assert.equal(hyungApp({ who: "봄", mirror_by: "봄" }), false);
  const css = readFileSync(new URL("../ui/yeta-chat.css", import.meta.url), "utf8");
  assert.match(css, /\.ychat \.yb\.me\.app \{ background:#000; color:#fff; \}/);
});
