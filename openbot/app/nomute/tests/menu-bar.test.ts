// 탭 줄 아래 메뉴 줄(형 11-16 08:3x 구름 맥 창 · 영상과 함께 「그거 끝나면 이거로 탭 아래 메뉴 만들어줘~ 네비게이션 들을 대체할거야」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const tsx = rd("../ui/menu-bar.tsx"), css = rd("../ui/menu-bar.css"), shell = rd("../ui/shell.tsx");
test("자리 = 위 탭 줄 바로 뒤 · PC 두 칸에서만 · 내용 = 지금 네비 그대로(이름 · 길은 한 곳에서)", () => {
  assert.match(shell, /\{split \? <TopTabBar room=\{room\} pane=\{pane\} \/> : null\}\n\s+\{split \? <MenuBar groups=\{menuOf\(talkNext\(/);
  assert.match(shell, /\{split \? null : <TabBar pane=/);   // 형 11-16 10:3x 「웅 빼고 츠리텐다드」 = PC 에선 아래 알약 네비 뺌(폰은 그대로)
  assert.match(css, /\.nm-menubar \{[^}]*font-family:'Pretendard Variable', Pretendard,/);
  assert.match(shell, /items: NED_TABS\.map\(/); assert.match(shell, /items: DRAWER_TABS\.flatMap\(/);
  assert.match(shell, /\{ id: "editor", label: "에디터", to: "\/edtool", items: \[\{ id: "edtool", label: "이미지 에디터"/);   // 형 11-16 「뉴스 우측에 에디터 칸 넣어서 … 이미지랑 비디오 에디터」 · 「에디터는 기본적으로 이미지 에디터」
  assert.match(shell, /\{ id: "drawer", label: "서랍", to: "\/drawer", items:/);   // 형 「서랍 > 기본적으로 러너」(#/drawer = 러너부터)
  assert.match(tsx, /if \(g\.to && fine\(\)\) \{ shut\(\); window\.location\.hash = g\.to; return; \}/);   // 이름 누름 = 기본 화면으로
  assert.match(css, /:root:has\(\.nm-menubar\) \.nm-area-on \.nm-tabs:not\(\.nm-area\) \{ display:flex; \}/);   // 형 11-16 「위에 탭 기존에 만든거는 살아잇어야햐ㅐ」 = PC 에선 위 탭 줄이 어느 칸에서나 보임
  assert.match(css, /:root:has\(\.nm-menubar\) \.nm-tabs\.nm-area \{ display:none; \}/);   // 뉴스 에디터 위 탭 셋 · 서랍 위 탭 여섯 = 그 정의를 그대로 읽음
  assert.match(css, /:root:has\(\.nm-menubar\) \.nm-split-root \{ padding-top:calc\(50px \+ var\(--nm-menu-h\)\); \}/);   // 줄 키만큼 아래 판을 내림
});
test("박자 = 차례로 뜨는 꼴 그대로 · 빠르기는 줄임(판 0.16초 · 줄 사이 0.03초 · 줄 0.26초 · 닫힘 0.12초) · 유리 판 · 줄 위 밝은 판은 하나가 미끄러짐", () => {
  assert.match(tsx, /const STAGGER_MS = 30, FIRST_MS = 20,/);   // 형 11-16 11:0x 「메뉴 좀 빠르게 켜져야할듯!」(앞 = 영상 박자 86 · 90)
  assert.match(css, /\.nm-mb-group\[data-open="1"\] \.nm-mb-row \{ animation:nmMbRow \.26s /);
  assert.match(css, /\.nm-mb-group\[data-open="1"\] > \.nm-mb-panel \{[^}]*transition:opacity \.16s linear/);
  assert.match(css, /\.nm-mb-panel \{[^}]*transition:opacity \.06s linear/);   // 닫힘 = 영상처럼 한두 프레임(형 11:2x 「내가 준 영상 한번만 다시 확인 ㄱ」)
  assert.match(css, /\.nm-mb-panel \{[^}]*border-radius:8px;/); assert.match(css, /gap:10px; padding:13px 10px; border-radius:6px;/);
  assert.match(css, /\.nm-mb-panel \{[^}]*backdrop-filter:blur\(22px\)/);   // 형 「조금 너무 볼록하는낌? 글래스모피즘과는 좀 동떨어진늒미이라」 = 유리 판(비치는 바탕 + 뒤 흐림 · 둘레 고리 그림자 없음)
  assert.doesNotMatch(css, /\.nm-mb-panel \{[^}]*box-shadow:0 0 0 1px/);
  assert.match(tsx, /<i className="nm-mb-hl" aria-hidden \/>/);
  assert.match(css, /\.nm-menubar > \* \+ \*::before \{[^}]*width:1px; height:12px;/);   // 형 11-16 11:1x 「메뉴간에 구분선도 살짜악잇고?」
  assert.match(css, /background:linear-gradient\(180deg, rgba\(20,21,23,\.52\), rgba\(10,11,12,\.60\)\)/);   // 형 「좀 더 검정인 느낌이여야 한달까?」
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/);
});
test("닫힌 판 = 눌리지도 읽히지도 않음 · Esc · 밖 누름 · 길 바뀜 = 닫힘", () => {
  assert.match(tsx, /inert=\{isOpen \? undefined : true\}/);
  assert.match(tsx, /e\.key === "Escape"/); assert.match(tsx, /addEventListener\("hashchange", shut\)/); assert.match(tsx, /addEventListener\("pointerdown", out, true\)/);
});
