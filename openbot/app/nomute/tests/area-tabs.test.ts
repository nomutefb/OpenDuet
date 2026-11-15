// PC 메인 탭 줄 = 지금 네비 칸의 탭(형 11-15 「탭은 그러니까 아래 네비가 a b c d 이면 탭이 1 2 3 4면 탭 1234 는 a에 귀속임」 · 「그래서 지금 화상회의 팀즈 이런거는 1에 귀속된거야」 · 「뉴스 이런것도 그러니까 탭이 메인탭 라인으로 가는거지. css는 동일하게」 · 「설정만 탭이 지금 상황에서는 없는거구.」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("메인 탭 줄 옷 그대로(.nm-tabs · .nm-tab · 잉크) · 탭 바꿈은 기록 안 쌓음", () => {
  const a = rd("../ui/area-tabs.tsx"), s = rd("../ui/shell.tsx");
  assert.match(a, /<div ref=\{bar\} className="nm-tabs nm-area" role="tablist"/);
  assert.match(a, /<i ref=\{ink\} className="nm-tabs-ink"/);
  assert.match(a, /className=\{`nm-tab\$\{cur === t\.id \? " on" : ""\}`\}/);
  assert.match(s, /\{split && modal === "nedit" \? <AreaTabs label="뉴스 에디터 탭" items=\{NED_TABS\}/);
  assert.match(s, /\{split && isDrawerTab\(modal\) \? <AreaTabs label="서랍 탭"/);
  assert.equal((s.match(/replace: true \}\); \}\} \/> : null\}/g) || []).length, 2);
});

test("대화 칸 탭은 다른 칸에서 숨기기만(살려 둠) · 설정 = 탭 없음", () => {
  const s = rd("../ui/shell.tsx"), c = rd("../ui/shell.css");
  assert.match(s, /\{split \? <TopTabBar room=\{room\} pane=\{pane\} \/> : null\}/);   // 늘 살아 있음(열어 둔 방 탭 · 화상회의 판)
  assert.match(s, /modal === "nedit" \|\| modal === "settings" \|\| isDrawerTab\(modal\)\) \? " nm-area-on" : ""/);
  assert.match(c, /\.nm-area-on \.nm-tabs:not\(\.nm-area\) \{ display:none; \}/);
  assert.doesNotMatch(s, /modal === "settings" \? <AreaTabs/);
  assert.match(c, /\.nm-tabs\.nm-area \.nm-tab \{ container-type:normal;/);   // 이름이 접히지 않게(탭이 제 글자 폭)
});
