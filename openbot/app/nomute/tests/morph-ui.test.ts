// 형 11-16 02:2x 세 가지 — ① 재확인 단추 한 벌(붙은 알약 둘 · 번지며 갈라짐) ② 폴더 탭 줄 바탕이 미끄러짐 ③ 우하단 PM 얼굴 = 살아 있는 구슬
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const rd = (f: string) => readFileSync(new URL(`../ui/${f}`, import.meta.url), "utf8");

test("재확인 단추 = 한 벌(.nm-yn) · 아홉 자리가 같은 묶음을 씀 · 움직임은 transform · opacity · filter 만", () => {
  const css = rd("go-button.css");
  assert.match(css, /\.nm-yn\.nm-yn > button:is\(\.no, \.nm-no, \.pick\) \{ order:0; z-index:1;/);                 // 앞 알약 = 안전한 쪽 · 글 차례와 무관하게 왼쪽
  assert.match(css, /@keyframes nmYnFront \{ from \{ opacity:0; transform:scale\(\.92\); filter:blur\(6px\); \} \}/);
  assert.match(css, /@keyframes nmYnBack \{ 0% \{ opacity:0; transform:translateX\(-32%\) scale\(\.92\); filter:blur\(6px\); \}/);
  assert.match(css, /button:is\(:not\(\[data-stage\]\), \[data-stage="idle"\]\)/);                                    // 게이지 단추 단계 색은 안 덮음
  assert.match(css, /@media \(prefers-reduced-motion:reduce\) \{ \.nm-yn\.nm-yn > button \{ animation:none !important; transition:none; \}/);
  const body = css.slice(css.indexOf(".nm-yn.nm-yn {"), css.indexOf("/* 알림 한 줄 — 됐어"));
  assert.doesNotMatch(body, /transition:[^;]*(width|left|margin|padding|flex)/, "배치를 다시 세는 움직임 0");
  assert.match(rd("msg-menu.tsx"), /<div className="nm-yn nm-msgm-yn">/);
  assert.match(rd("meet.tsx"), /<div className="nm-yn sm nm-meet-yn">/);
  assert.match(rd("room-menu.tsx"), /<div className="nrc-acts nm-yn">/);
  assert.match(rd("task-panel.tsx"), /<span className="nm-yn sm"><button type="button" className="no"/);
  assert.match(rd("sched-desk.tsx"), /<span className="nm-yn sm">/);
  assert.match(rd("sched-review.tsx"), /<div className="nm-rv-row nm-yn sm">/);
  assert.match(rd("save-ask.tsx"), /<span className="nm-yn sm">[\s\S]*?<GoButton autoFocus className="pick" go=\{go\}/);
  assert.doesNotMatch(rd("yeta-chat.css"), /\.nm-msgm-yn button/);   // 자리마다 있던 옛 단추 줄 걷음
  assert.doesNotMatch(rd("meet.css"), /nm-meet-ask-ft/);
});

test("방 안 메뉴에서 body 로 띄운 지우기 창 = 대화창 색 칸(.nm-yeta) 안(「아니오」가 회색으로 보이던 것)", () => {
  const m = rd("room-menu.tsx");
  assert.match(m, /createPortal\(<div className="nm-yeta"><RoomGoneDialog r=\{gone\}/);
  assert.match(m, /createPortal\(<div className="nm-yeta"><TempDeleteDialog r=\{tempDel\}/);
});

test("폴더 탭 줄 세 군데 = 고른 탭 바탕 한 장이 미끄러짐(./fold-ink.ts) · 이름은 번지며 나타남", () => {
  const h = rd("fold-ink.ts"), css = rd("teams.css");
  for (const [f, n] of [["news-editor.tsx", '"ned"'], ["shell.tsx", '"drawer"'], ["teams.tsx", '"office-mode"']] as const) {
    const s = rd(f);
    assert.match(s, new RegExp(`useFoldInk\\(${n},`), f);
    assert.match(s, /<i className="nm-fold-ink" aria-hidden \/>/, f);
  }
  assert.match(h, /now\.ink\.animate\(\[\{ transform: `translateX\(\$\{was\.x\}px\)` \}, \{ transform: `translateX\(\$\{now\.snap\.x\}px\)` \}\], opt\)/);
  assert.match(h, /filter: "blur\(6px\)"/);
  assert.match(h, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(h, /setInterval|requestAnimationFrame/, "도는 고리 0(탭을 바꾼 그 한 번만)");
  assert.match(css, /\.nm-tswitch\.fold\[data-ink\] \.nm-ftab\.on \{ background:none; \}/);
  assert.match(css, /\.nm-fold-ink \{ display:none; \}/);   // 훅이 자리를 재기 전 = 옛 꼴 그대로
});

test("우하단 PM 단추 얼굴 = 구슬(./pm-orb.tsx) · 못 그리면 옛 얼굴 · 안 보일 때 · 손이 없을 때는 멈춤", () => {
  const fab = rd("room-fab.tsx"), orb = rd("pm-orb.tsx"), sh = rd("pm-orb-shader.ts");
  assert.match(fab, /\{orb \? <PmOrb onFail=\{\(\) => setOrb\(false\)\} \/> : src \? <img src=\{src\} alt="" decoding="async" \/> : <b aria-hidden>/);
  assert.match(orb, /const run = \(\) => live && seen && !document\.hidden && !still && Date\.now\(\) - touched < IDLE_MS;/);
  assert.match(orb, /IDLE_MS = 120_000/);
  assert.match(orb, /new IntersectionObserver/);
  assert.match(orb, /webglcontextlost/);
  assert.match(orb, /WEBGL_lose_context/);
  assert.doesNotMatch(orb + sh, /fetch\(|new Image|texImage2D/, "받아오는 것 · 텍스처 0");
  assert.match(sh, /uniform vec2 R;[\s\S]*uniform float T;/);
});
