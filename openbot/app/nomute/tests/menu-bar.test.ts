// 탭 줄 아래 메뉴 줄(형 11-16 08:3x 구름 맥 창 · 영상과 함께 「그거 끝나면 이거로 탭 아래 메뉴 만들어줘~ 네비게이션 들을 대체할거야」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const tsx = rd("../ui/menu-bar.tsx"), css = rd("../ui/menu-bar.css"), shell = rd("../ui/shell.tsx");
test("자리 = 위 탭 줄 바로 뒤 · PC 두 칸에서만 · 내용 = 지금 네비 그대로(이름 · 길은 한 곳에서)", () => {
  assert.match(shell, /\{split \? <TopTabBar room=\{room\} pane=\{pane\} \/> : null\}\n\s+\{split \? <MenuBar groups=\{menuOf\(chatHref\(room\)\)\} on=\{menuOn\(/);
  assert.match(shell, /items: NED_TABS\.map\(/); assert.match(shell, /items: DRAWER_TABS\.flatMap\(/);   // 뉴스 에디터 위 탭 셋 · 서랍 위 탭 여섯 = 그 정의를 그대로 읽음
  assert.match(css, /:root:has\(\.nm-menubar\) \.nm-split-root \{ padding-top:calc\(50px \+ var\(--nm-menu-h\)\); \}/);   // 줄 키만큼 아래 판을 내림
});
test("박자 = 영상에서 잰 값(판 0.45초 · 줄 0.56초 · 줄 사이 0.07초 · 닫힘 0.15초) · 줄 위 밝은 판은 하나가 미끄러짐", () => {
  assert.match(tsx, /const STAGGER_MS = 70, FIRST_MS = 80,/);
  assert.match(css, /\.nm-mb-group\[data-open="1"\] \.nm-mb-row \{ animation:nmMbRow \.56s /);
  assert.match(css, /\.nm-mb-group\[data-open="1"\] > \.nm-mb-panel \{[^}]*transition:opacity \.45s /);
  assert.match(css, /\.nm-mb-panel \{[^}]*transition:opacity \.15s linear/);
  assert.match(tsx, /<i className="nm-mb-hl" aria-hidden \/>/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/);
});
test("닫힌 판 = 눌리지도 읽히지도 않음 · Esc · 밖 누름 · 길 바뀜 = 닫힘", () => {
  assert.match(tsx, /inert=\{isOpen \? undefined : true\}/);
  assert.match(tsx, /e\.key === "Escape"/); assert.match(tsx, /addEventListener\("hashchange", shut\)/); assert.match(tsx, /addEventListener\("pointerdown", out, true\)/);
});
