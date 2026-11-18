// @ts-nocheck
/* 만든 파일 — 손으로 고치지 말 것(home/deck/tools/gen.mjs · 옛 에디터 viewer 의 홈 뉴스 덱 그대로)
   원본 = modern-home.html + modern-font.css · modern-tokens.css · modern-editor.css · modern-dark.css · modern-practical.css · modern-score.css · modern-card-motion.css · modern-card-content.css · modern-numerals.css · modern-morph-icons.css · modern-home.css + modern-icons.js · nm-ua.js · modern-score-scale.js · modern-gallery.js · modern-card-content.js · modern-home.js · modern-numerals.js · modern-morph-icons.js */
export const DECK_CSS = `/* modern-font.css */

/* modern-tokens.css */
/* 자동생성 — 직접 수정 금지. 값 정본 = viewer/index.html :root.
   생성: shared/build_design_mirror.py build. 승인된 modern 화면 전용 값. */
.nd-html {
  --modern-space-bg: #070a12;
  --modern-space-hi-rgb: 26,47,102;
  --modern-bias-l1: #41B6E7;
  --modern-bias-l2: #0762C8;
  --modern-fg: #F0EEE9;
  --modern-mut: #BBBCBC;
  --modern-accent: #71C5E8;
  --modern-accent-4: #FBE122;
  --modern-accent-5: #44D62C;
  --modern-age-warm: #FFA02E;
  --modern-neon-orange: #FFAA4D;
  --modern-neon-red: #FF7276;
  --modern-accent-6: #FF3EB5;
  --modern-accent-7: #d8ff3d;
  --modern-accent-rgb: 113,197,232;
  --modern-accent-dim: rgba(var(--modern-accent-rgb),.13);
  --modern-on-accent: #032322;
  --modern-line: rgba(255,255,255,.08);
  --modern-line2: rgba(255,255,255,.06);
  --modern-glass2: rgba(18,19,22,.55);
  --modern-modal-glass: rgba(17,18,20,.64);
  --modern-modal-glass-anchor: rgba(17,18,20,.42);
  --modern-modal-head-bg: rgba(24,25,28,.85);
  --modern-modal-tabs-bg: rgba(24,25,28,.5);
  --modern-blur-s: 10px;
  --modern-glass-saturate: 1.5;
  --modern-blur-m: 14px;
  --modern-blur-backdrop: 7px;
  --modern-ink: #F0EEE9;
  --modern-muted: #BBBCBC;
  --modern-well: rgba(255,255,255,.04);
  --modern-stage: #161616;
  --modern-card: rgba(18,19,22,.55);
  --modern-page: #070a12;
  --modern-sidebar: rgba(18,19,22,.55);
  --modern-silk-glass: linear-gradient(135deg,rgba(18,30,34,.18),rgba(11,19,23,.20));
  --modern-silk-blur: 12px;
  --modern-glass-edge: rgba(255,255,255,.12);
  --modern-glass-highlight: rgba(255,255,255,.04);
  --modern-control-glass: rgba(255,255,255,.05);
  --modern-r-sm: 9px;
  --modern-r-md: 16px;
  --modern-r-lg: 22px;
  --modern-sp-1: 4px;
  --modern-sp-2: 8px;
  --modern-sp-3: 12px;
  --modern-sp-4: 16px;
  --modern-sp-5: 24px;
  --modern-sp-6: 32px;
  --modern-press-s: .98;
  --modern-depth: .45;
  --modern-motion: .35;
  --modern-ambient: .30;
  --modern-dur: .18;
  --modern-action-symbol: #fff;
  --modern-panel-hairline: rgba(196,196,196,.08);
  --modern-panel-shadow: 0 1px 16px rgba(0,0,0,.4), inset 0 1px 0 var(--modern-glass-highlight), inset 0 0 0 1px var(--modern-panel-hairline);
  --modern-progress-rest: rgba(187,188,188,.7);
  --modern-scrim: rgba(7,10,18,.86);
  --modern-panel-inset: inset 0 1px 0 var(--modern-glass-highlight);
  --modern-menu-width: 286px;
  --modern-menu-height: 52px;
  --modern-menu-item: 44px;
  --modern-menu-radius: 28px;
  --modern-menu-item-radius: 24px;
  --modern-menu-inset: 3px;
  --modern-menu-pad: 11px;
  --modern-menu-icon: 22px;
  --modern-menu-label-gap: 8px;
  --modern-menu-viewport-pad: 24px;
  --modern-menu-dock-gap: 24px;
  --modern-menu-dock-gap-mobile: 18px;
  --modern-menu-highlight: rgba(255,255,255,.04);
  --modern-menu-control: rgba(255,255,255,.05);
  --modern-menu-spatial-bg: rgba(17,18,20,.05);
  --modern-menu-glow: rgba(255,255,255,.2);
  --modern-neon-glow: 0 0 var(--modern-sp-2) rgba(var(--modern-accent-rgb),.65);
  --modern-menu-label-offset: -3px;
  --modern-ask-width: 600px;
  --modern-type-caption: 12.41px;
  --modern-type-body: 14px;
  --modern-type-lead: 17.81px;
  --modern-type-title-s: 22.65px;
  --modern-type-title: 28.81px;
  --modern-type-display: 46.62px;
  --modern-lh-solid: 1;
  --modern-lh-ui: 1.309;
  --modern-lh-title: 1.39;
  --modern-lh-text: 1.618;
  --modern-track-caption: .005em;
  --modern-track-body: 0em;
  --modern-track-lead: -.01em;
  --modern-track-title-s: -.02em;
  --modern-track-title: -.03em;
  --modern-ease-out: cubic-bezier(.22,1,.36,1);
  --modern-spring-s: cubic-bezier(.28,1.3,.36,1);
  --modern-dur-s: 240ms;
  --modern-ease-size: cubic-bezier(.32,.72,0,1);
  --modern-dur-size: 320ms;
  --modern-ease-exit: cubic-bezier(.4,0,1,1);
  --modern-dur-exit: 160ms;
  --modern-ease-press: cubic-bezier(.3,1.12,.4,1);
  --modern-dur-press: 260ms;
  --modern-ease-press-in: cubic-bezier(.2,0,0,1);
  --modern-dur-press-in: 100ms;
  --modern-ease-reveal: cubic-bezier(.16,1,.3,1);
  --modern-dur-reveal: 400ms;
  --modern-reveal-shift: 8px;
  --modern-skeleton-dur: 1.4s;
  --modern-skeleton-size: 200%;
  --modern-skeleton-sheen: rgba(255,255,255,.06);
  --modern-focus-ring: 2px;
  --modern-focus-offset: 4px;
  --modern-hit: 44px;
  --modern-hit-pad: 11px;
}
/* modern-editor.css */
/* Modern home base: element resets, the structural aliases this frame uses, and
   the single type map. Every size, leading and tracking comes from the golden-ratio
   tokens in viewer/index.html :root (--modern-type-* · --modern-lh-* · --modern-track-*);
   tests/modern-design-harness.test.mjs keeps raw type values out of modern CSS. */
.nd-html{--r-sm:var(--modern-r-sm);--r-md:var(--modern-r-md);--r-lg:var(--modern-r-lg);--sp-1:var(--modern-sp-1);--sp-2:var(--modern-sp-2);--sp-3:var(--modern-sp-3);--sp-4:var(--modern-sp-4);--sp-5:var(--modern-sp-5);--sp-6:var(--modern-sp-6);--press-s:var(--modern-press-s);--depth:var(--modern-depth)}
*{box-sizing:border-box}
.nd-body{margin:0;color:var(--fg);font-family:'Pretendard Variable',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
button,a,input{-webkit-tap-highlight-color:transparent}
button,input{font:inherit}
button{color:inherit;cursor:pointer}
button:disabled{opacity:.35;cursor:default}
button:active:not(:disabled){transform:scale(var(--press-s))}
button:focus-visible,a:focus-visible,input:focus-visible{outline:var(--modern-focus-ring) solid var(--accent);outline-offset:var(--modern-focus-offset)}
a{color:inherit;text-decoration:none}
svg{width:18px;height:18px;display:block;flex-shrink:0}
[hidden]{display:none!important}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}

/* Type map — one place per text role. Scale: 14px × √φⁿ; leading: Pearson GRT
   at the card's measured reading width; tracking: −0.01em per √φ step. */
.nd-body{font-size:var(--modern-type-body);letter-spacing:var(--modern-track-body)}
.article-topline,.article-rank,.article-schedule,.article-label,.gallery-position,.article-image-note,.next-peek,.source-story small{font-size:var(--modern-type-caption);letter-spacing:var(--modern-track-caption)}
.article-topline,.article-rank,.article-label,.gallery-position,.article-image-note,.next-peek strong,.source-story small{line-height:var(--modern-lh-ui)}
.article-schedule,.article-schedule .ink-text{line-height:var(--modern-lh-solid)}
.practical-main .score-lead strong{font-size:var(--modern-type-display);line-height:var(--modern-type-display)}
.practical-main .score-lead.is-pending strong{font-size:var(--modern-type-title-s)}
.practical-main .article-title{font-size:var(--modern-type-title);line-height:var(--modern-lh-title);letter-spacing:var(--modern-track-title)}
.article-excerpt,.source-story a,.source-story p,.empty-state p{font-size:var(--modern-type-body);line-height:var(--modern-lh-text)}
.empty-state h3{font-size:var(--modern-type-lead);line-height:var(--modern-lh-title);letter-spacing:var(--modern-track-lead)}
.quiet-button,.pick-text{font-size:var(--modern-type-body);line-height:var(--modern-lh-ui);letter-spacing:var(--modern-track-body)}
/* Status: the reason (banner, ≥ caption) and the kind tag of a failed list. */
.home-status .status-text,.empty-state .status-kind{font-size:var(--modern-type-caption);line-height:var(--modern-lh-ui);letter-spacing:var(--modern-track-caption)}
@container nd (max-height:720px){.practical-main .article-card.long-title .article-title{font-size:var(--modern-type-title-s);letter-spacing:var(--modern-track-title-s)}}
@container nd (max-width:620px) or ((orientation:landscape) and (max-height:500px)){.practical-main .article-title{font-size:var(--modern-type-title-s);letter-spacing:var(--modern-track-title-s)}}
/* modern-dark.css */
/* Dark glass for the home frame. Names the frame's rules use are aliased onto the
   modern tokens (Pantone palette and glass recipe in viewer/index.html :root);
   no colour value is written here. */
.nd-html {
  color-scheme: dark;
  --space-bg:var(--modern-space-bg);
  --bias-l1:var(--modern-bias-l1);
  --bias-l2:var(--modern-bias-l2);
  --fg:var(--modern-fg);
  --mut:var(--modern-mut);
  --accent:var(--modern-accent);
  --accent-4:var(--modern-accent-4);
  --accent-5:var(--modern-accent-5);
  --age-warm:var(--modern-age-warm);
  --accent-6:var(--modern-accent-6);
  --accent-7:var(--modern-accent-7);
  --accent-rgb:var(--modern-accent-rgb);
  --accent-dim:var(--modern-accent-dim);
  --line:var(--modern-line);
  --line2:var(--modern-line2);
  --glass2:var(--modern-glass2);
  --modal-glass-anchor:var(--modern-modal-glass-anchor);
  --blur-s:var(--modern-blur-s);
  --well:var(--modern-well);
  --silk-glass:var(--modern-silk-glass);
  --silk-blur:var(--modern-silk-blur);
  --glass-edge:var(--modern-glass-edge);
  --glass-highlight:var(--modern-glass-highlight);
  --control-glass:var(--modern-control-glass);
  --glass-saturate:var(--modern-glass-saturate);
}

.nd-html,.nd-body { color: var(--fg); }

.article-rank, .article-label, .score, .next-peek > span, .next-peek strong,
.reader-action, .empty-state > span { color: var(--mut); }
.article-rank b { color: var(--fg); }

/* The reader stays clear; the article itself carries the canonical glass. */
.article-card {
  background: var(--silk-glass);
  border-color: var(--line);
  backdrop-filter: blur(var(--silk-blur));
  -webkit-backdrop-filter: blur(var(--silk-blur));
  box-shadow: var(--modern-panel-shadow);
}
.article-card.picked { border-color: var(--accent); }
.article-label > span { color: var(--mut); background: var(--well); }
.article-title { color: var(--fg); }
.article-excerpt, .empty-state p { color: var(--mut); }

/* The NEXT caption is a bare line under the card; the stack sheets are styled in modern-card-motion.css. */

/* Pill and dock controls: one recipe — hairline, faint fill, blur with saturation. */
.action-circle, .quiet-button {
  background: var(--control-glass);
  color: var(--fg);
  border-color: var(--glass-edge);
  box-shadow: inset 0 1px 0 var(--glass-highlight);
  backdrop-filter: blur(var(--blur-s)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--blur-s)) saturate(var(--glass-saturate));
}
.quiet-button:hover, .reader-action:hover .action-circle { background: var(--glass2); }

.empty-state {
  background: var(--silk-glass);
  border-color: var(--line);
  backdrop-filter: blur(var(--silk-blur));
  -webkit-backdrop-filter: blur(var(--silk-blur));
}
/* modern-practical.css */
/* Home layout: one glass card in the 760px reading column with the next card
   peeking beneath it. Fine-pointer screens keep PICK and next in a column at the
   card's right; touch and narrow screens have neither (swipe and double tap).
   Colours and glass live in modern-dark.css, type in modern-editor.css. */
.nd-body{isolation:isolate}
/* The card is the screen minus everything stacked with it: the top gap, the next-card strip,
   the clearance over the dock and the dock. */
.practical-main{
 --reader-top-gap:max(var(--sp-6),env(safe-area-inset-top,0px)); /* 24→32 · (261022) 운영자 «위에 여백 지금보다 확보 조금 더» */
 --reader-peek:var(--sp-4); /* 다음 카드 = 입술만(운영자 261022 «넥스트 솔직히 안 보여도 될 것 같아 · 안 봄») · 구 38 = 제목 줄 엿보기 */
 --reader-dock-clear:var(--sp-4);
 --hp-h:calc(var(--modern-sp-6) * 3.625); /* 띠 높이 116(구 96의 1.2배 · 운영자 261022 «지금보다 공간 20퍼 정도 더») = 총수 한 줄 + 간격 12 + 추세 그림(두 선 · 아래 IG ± 줄 · FB ± 줄) · 여기(부모)에 둔다: var()는 선언한 요소에서 풀려 자식에만 두면 아래 --home-pulse-h 가 무효 → 카드 높이 auto */
 --home-pulse-h:0px;
 --reader-card-height:calc(100cqh - var(--reader-top-gap) - var(--home-pulse-h) - var(--reader-peek) - var(--reader-dock-clear) - var(--menu-dock-gap) - var(--modern-menu-height) - env(safe-area-inset-bottom,0px));
}
/* The follower band above the card (operator 10-22 "카드가 쓸모없이 커서 줄이고 위에 인스타 팔로워"): the card gives up
   exactly the band's height plus one gap, so the stack still ends a step above the dock. */
.practical-main:has(.home-pulse:not([hidden])){--home-pulse-h:calc(var(--hp-h) + var(--sp-3))}
/* (261022 운영자 «ig 시작점 좌측 기준점은 좀 더 안쪽으로 · 안쪽으로 온 만큼 우측 애도 · 그 아래 차트랑 간격 조금 더 · 글자랑 카드랑 간격»)
   좌우 = 카드 안 글 시작선(카드 안쪽 여백 + 테두리 1 · 폭마다 아래 미디어 규칙이 같은 값) · 숫자↔차트 12 · 차트 글자↔카드 14(아래 띠 바깥 12 + 글자 아래 2) */
.practical-main .home-pulse{position:relative;height:var(--hp-h);margin:0 0 var(--sp-3);display:grid;grid-template-rows:auto minmax(0,1fr);row-gap:var(--sp-3);padding:0 calc(var(--sp-5) + 1px)} /* raw-ok: 1 = 카드 테두리 */
.home-pulse .hp-row{display:flex;align-items:baseline;gap:var(--sp-2);min-width:0}
/* 광학 잉크 정렬(운영자 261022 «광학 잉크 단위 사분할 기준점 수평») — 기준 = 레몬밀크 숫자 잉크(윗변·바닥선) · IG·FB 글자 = 같은 바닥선(행 baseline) ·
   구분선 = 숫자 잉크 높이 그대로(바닥선에 세우고 윗변까지 = 사분할 다섯 점 모두 일치) · 갱신 글 = 한글 잉크 윗변을 숫자 잉크 윗변에 */
.home-pulse .hp-at{margin-left:auto;align-self:flex-start;transform:translateY(.06em)} /* raw-ok: 한글 잉크 윗변이 숫자 잉크 윗변보다 0.75px 높다(Playwright 실측 · 12.41px × .06 = 0.74) */
.home-pulse .hp-sep{align-self:baseline;width:1px;font-size:var(--modern-type-lead);height:.786em;background:var(--modern-line)} /* raw-ok: .786em = 레몬밀크 숫자 잉크 높이 ÷ 글자 크기(14.0 ÷ 17.81 실측) */
.home-pulse .hp-chart{display:block;width:100%;height:100%;overflow:visible} /* 그림 아랫변 = 카드 윗변 바로 위(운영자 «카드 윗변을 받침 삼아서 곡선 차트») */
.practical-main{position:relative;z-index:1;max-width:760px;margin:0 auto;padding:var(--reader-top-gap) var(--sp-5) var(--sp-4)}
.practical-main .reader{position:relative;isolation:isolate;min-width:0;max-width:760px;margin:0 auto;padding:0;border:0;border-radius:0;background:transparent;overflow:visible}
.practical-main .deck{position:relative;min-width:0;width:100%;max-width:none;padding-bottom:var(--reader-peek);perspective:1200px}

.practical-main .article-card{position:relative;z-index:3;display:flex;flex-direction:column;width:100%;height:var(--reader-card-height);min-height:0;max-height:none;padding:var(--sp-5) var(--sp-5) var(--sp-4);border-width:1px;border-style:solid;border-radius:var(--r-lg);transform-origin:center 80%;overflow:hidden;touch-action:pan-y pinch-zoom}
/* Keyboard focus: the accent ring follows the card's radius at the focus offset (concentric). */
.practical-main .article-card:focus-visible{outline:var(--modern-focus-ring) solid var(--accent);outline-offset:var(--modern-focus-offset)}
.article-card.is-dragging{cursor:grabbing;user-select:none}
/* A settled PICK opens its news summary on a press. */
.practical-main .article-card[data-pick-state="settled"]:not(.is-dragging){cursor:pointer}

.practical-main .score-lead{margin:0;flex-shrink:0;text-align:left}
.practical-main .score-lead strong{display:block;margin:0;font-weight:500}
.article-rank b{font-weight:500}
.practical-main .article-label{display:flex;flex-wrap:wrap;align-items:center;gap:var(--sp-2);margin:0 0 var(--sp-4)}
.article-label>span{border-radius:4px;padding:3px 6px} /* raw-ok: 배지 4/3·6 = 승인 시안 원값 이동(구 modern-editor.css) */

/* The NEXT line under the card (DECK-SPEC 2): score dot · NEXT nn · title, one line. */
.next-peek{position:absolute;z-index:2;bottom:0;left:0;right:0;width:100%;height:var(--reader-peek);padding:0 var(--sp-2);display:flex;align-items:center;justify-content:center;gap:var(--sp-2);overflow:hidden;cursor:pointer}
.next-peek>span{white-space:nowrap}
.practical-main .next-peek>*{visibility:hidden} /* NEXT 제목 줄 숨김(운영자 261022) — 겹친 다음 장의 입술만 남긴다(짧은 가로 화면 규칙과 같은 꼴) */
.next-peek strong{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* PICK and next: two 48 circles, PICK above (the decision first), next below. */
.practical-main .reader-actions{display:none;width:48px;flex-direction:column;align-items:center;justify-content:center;margin:0;gap:var(--sp-4);transform:translateY(-19px)} /* raw-ok: -19 = 승인 시안 광학 정렬 원값 */
/* Nothing to PICK or turn (loading, empty, failed): the row steps out of sight, keeping its place. */
.practical-main .reader-actions[data-idle]{visibility:hidden}
.practical-main .reader-action{display:flex;flex-direction:column;align-items:center;gap:0;width:48px;min-width:0;padding:0;background:none;border:0}
.practical-main .action-circle{display:grid;place-items:center;width:48px;height:48px;border-width:1px;border-style:solid;border-radius:50%}
.action-circle svg{width:18px;height:18px;stroke-width:1.6} /* raw-ok: 다음 글리프 18 = 버튼 비평 P1(48 원의 37%) */
.pick-control{display:flex;flex-direction:column;align-items:center;gap:0;width:48px;color:var(--mut);cursor:pointer;user-select:none}
.pick-box{position:relative;display:flex;align-items:center;justify-content:center;gap:var(--sp-2);width:48px;height:48px} /* raw-ok: 48 = 다음과 같은 원(버튼 비평 P1) */
.pick-box input{position:absolute;inset:0;appearance:none;-webkit-appearance:none;width:100%;height:100%;margin:0;border:1px solid var(--glass-edge);border-radius:var(--modern-menu-radius);background:var(--control-glass);box-shadow:inset 0 1px 0 var(--glass-highlight);backdrop-filter:blur(var(--blur-s)) saturate(var(--glass-saturate));-webkit-backdrop-filter:blur(var(--blur-s)) saturate(var(--glass-saturate));cursor:pointer;transition:background-color var(--modern-dur-s) var(--modern-ease-out),border-color var(--modern-dur-s) var(--modern-ease-out)}
.pick-mark{position:relative;display:grid;place-items:center;pointer-events:none;color:var(--mut);transition:color var(--modern-dur-s) var(--modern-ease-out)}
.pick-mark svg{width:18px;height:18px}
.pick-text{position:relative;display:none;pointer-events:none;white-space:nowrap;font-weight:600;transition:color var(--modern-dur-s) var(--modern-ease-out)}
/* PICK taken: the control fills with the accent and its ink turns dark (filled checkmark). */
.pick-box input:checked{background:var(--accent);border-color:var(--accent)}
.pick-control:has(input:checked){color:var(--accent)}
.pick-box input:hover:not(:disabled):not(:checked){background:var(--glass2)}
.pick-control:has(input:disabled:not(:checked)){opacity:.35;cursor:default}
.pick-control:has(input:checked:disabled){cursor:default}
.pick-box input:disabled{cursor:default}

/* Loading, empty and failed states share the card's place and size. */
.empty-state{position:relative;z-index:4;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--sp-2);padding:var(--sp-5);text-align:center;border-width:1px;border-style:solid;border-radius:var(--r-lg);overflow:hidden}
.practical-main .empty-state{height:var(--reader-card-height);min-height:0}
.empty-icon svg{width:28px;height:28px} /* raw-ok: 28 = 빈·실패 카드 표지 글리프 */
.empty-state h3{margin:var(--sp-3) 0 0}
.empty-state p{margin:0;max-width:30em}
.status-kind{display:inline-flex;align-items:center;gap:var(--sp-1);font-weight:600}
.empty-state .status-kind{margin-top:var(--sp-2);padding:var(--sp-1) var(--sp-3);border:1px solid var(--glass-edge);border-radius:var(--modern-menu-radius)}
.empty-state .retry-button{margin-top:var(--sp-4)}
/* One retry control: a 44 glass pill with the retry glyph. */
.quiet-button{display:inline-flex;align-items:center;justify-content:center;gap:var(--sp-2);min-height:var(--modern-hit);padding:0 var(--sp-4);border-width:1px;border-style:solid;border-radius:var(--modern-menu-radius);white-space:nowrap}
.quiet-button svg{width:16px;height:16px} /* raw-ok: 16 글리프 = 버튼 글자(14) 한 단계 위 */
.quiet-button[aria-busy="true"] svg{animation:home-spin var(--modern-skeleton-dur) linear infinite}
@keyframes home-spin{to{transform:rotate(-360deg)}}

/* Loading silhouette: the card's own outline (score, rank, publisher, title, two lines),
   one sheen sweep moved by transform only, stopped under reduced motion (modern-editor.css). */
.home-skeleton{display:none}
.empty-state[data-state="loading"]>:not(.home-skeleton){position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);margin:0}
.empty-state[data-state="loading"]{align-items:stretch;justify-content:flex-start;padding:var(--sp-5) var(--sp-5) var(--sp-4);text-align:left}
.empty-state[data-state="loading"]>.home-skeleton,.home-skeleton.skeleton-exit{display:flex;flex-direction:column;gap:var(--sp-3)}
.empty-state[data-state="loading"]::after{content:'';position:absolute;top:0;bottom:0;left:0;width:var(--modern-skeleton-size);pointer-events:none;background:linear-gradient(100deg,transparent 30%,var(--modern-skeleton-sheen) 50%,transparent 70%);animation:home-sheen var(--modern-skeleton-dur) linear infinite}
@keyframes home-sheen{from{transform:translateX(-75%)}to{transform:translateX(25%)}}
/* First load only: the silhouette waits a beat, so a list that arrives at once meets the card entrance instead. */
.empty-state.is-booting[data-state="loading"]{animation:home-skeleton-in var(--modern-dur-s) var(--modern-ease-out) var(--modern-dur-s) backwards}
@keyframes home-skeleton-in{from{opacity:0}}
.home-skeleton .sk-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--sp-3)}
.home-skeleton .sk{display:block;border-radius:6px;background:var(--line)} /* raw-ok: 뼈대 막대 반경 6 = 글줄 높이의 절반 안팎 */
.home-skeleton .sk-score{width:132px;height:40px;border-radius:var(--r-sm)} /* raw-ok: 점수 숫자(46.62px LEMON MILK) 실루엣 */
.home-skeleton .sk-rank{width:56px;height:var(--sp-3)} /* raw-ok: 56 = 순위 '01 / 463'(캡션) 폭 */
.home-skeleton .sk-meta{width:148px;height:22px;border-radius:var(--r-sm)} /* raw-ok: 148×22 = 시각·출처 줄(실측 22.4) 실루엣 */
.home-skeleton .sk-title{width:88%;height:var(--sp-5)}
.home-skeleton .sk-line{width:100%;height:var(--sp-3)}
.home-skeleton .sk-short{width:58%}
.home-skeleton .sk-title+.sk-line{margin-top:var(--sp-3)}
/* Skeleton → content: the outline fades over the arriving card (modern-home.js, 400 ms · 8 px). */
.home-skeleton.skeleton-exit{position:absolute;z-index:5;top:0;left:0;padding:var(--sp-5) var(--sp-5) var(--sp-4);pointer-events:none}

/* Status banner on the card's lower edge: kind glyph, the reason once, one retry pill. It lies
   inside the card (modern-home.js; the body gains the same scroll room), so no part of the stack
   moves when a list turns stale or fresh again, and a swipe that starts on its words still turns
   the card (pan-y, like the card's text). */
.home-status{position:absolute;z-index:9;left:var(--sp-3);right:var(--sp-3);bottom:var(--sp-3);touch-action:pan-y;display:flex;align-items:center;gap:var(--sp-3);margin:0;padding:var(--sp-1) var(--sp-1) var(--sp-1) var(--sp-4);border:1px solid var(--glass-edge);border-radius:var(--modern-menu-radius);background:linear-gradient(var(--modern-modal-head-bg),var(--modern-modal-head-bg)),var(--modern-modal-head-bg);box-shadow:inset 0 1px 0 var(--glass-highlight);backdrop-filter:blur(var(--blur-s)) saturate(var(--glass-saturate));-webkit-backdrop-filter:blur(var(--blur-s)) saturate(var(--glass-saturate))}
/* Inside the card's own glass a second backdrop blur does not reach the card's text, so the banner
   carries the frosted header fill twice (≈.98) and the words under it never read through.
   Its words are a label, not text to copy: a mouse drag that starts on them turns the card
   instead of selecting them. */
.home-status{-webkit-user-select:none;user-select:none}
.home-status .status-kind{flex:none}
.home-status .status-kind svg{width:16px;height:16px} /* raw-ok: 16 글리프 = 다시 불러오기 글리프와 같은 크기 */
.home-status .status-text{flex:1;min-width:0;margin:0;word-break:keep-all;overflow-wrap:anywhere}
.home-status .retry-button{flex:none}
@container nd (max-width:480px){ /* raw-ok: 480 = 한 줄 배너에 사유가 세 줄 넘게 접히는 폭 */
  /* Narrow phones: the reason takes the banner's full width (two lines at most for the parent's
     wording), and the 44 retry pill sits under it at the trailing edge. */
  .home-status{flex-wrap:wrap;row-gap:var(--sp-1);padding-top:var(--sp-3)}
  .home-status .status-text{flex-basis:calc(100% - 16px - var(--sp-3))} /* raw-ok: 16 = 종류 글리프 폭 */
  .home-status .retry-button{margin-left:auto}}

@container nd (max-width:620px){
  .practical-main{padding-inline:var(--sp-4);--reader-top-gap:max(var(--sp-5),env(safe-area-inset-top,0px))} /* 16→24(위 여백 · 261022) */
  .practical-main .home-pulse{padding-inline:calc(var(--sp-4) + 1px)} /* raw-ok: 1 = 카드 테두리 · 띠 좌우 = 모바일 카드 글 시작선 */
  .practical-main .article-card{padding:var(--sp-4);border-radius:20px} /* raw-ok: 모바일 카드 반경 20 = 승인 시안 원값 */
  .empty-state[data-state="loading"],.home-skeleton.skeleton-exit{padding:var(--sp-4)}}
/* The 760px shell caps the tablet-sized reading area; fine-pointer computers
   retain the approved right-side controls. The card sits on the dock's centre line (operator
   10-19): an empty 48 column mirrors the controls on the left, so the 688 card keeps its width. */
@media (hover:hover) and (pointer:fine){
@container nd (min-width:621px){
  .practical-main .reader{max-width:calc(760px + 48px + var(--sp-5))} /* raw-ok: 48 = 오른쪽 버튼 기둥, 왼쪽 빈 기둥으로 대칭 */
  .practical-main .reader-stage{display:grid;grid-template-columns:48px minmax(0,1fr) 48px;column-gap:var(--sp-5);align-items:center}
  .practical-main .reader-stage>.deck{grid-column:2}
  .practical-main .reader-stage>.reader-actions{grid-column:3}
  .practical-main .home-pulse{margin-inline:calc(var(--modern-hit) + var(--modern-sp-1) + var(--sp-5));padding-inline:calc(var(--sp-6) + 1px)} /* 48 버튼 기둥 + 간격 = 띠가 카드 폭에 맞춰 선다 · 좌우 = PC 카드 글 시작선 · raw-ok: 1 = 카드 테두리 */
  .practical-main .article-card,.empty-state[data-state="loading"],.home-skeleton.skeleton-exit{padding:var(--sp-6) var(--sp-6) var(--sp-5)}
  .practical-main .reader-actions{display:flex}
  .pick-box input{border-radius:50%}}}
/* Touch and narrow screens: no PICK·next row on screen (operator 10-19) — a swipe turns the card
   and a double tap PICKs it, so the card takes the whole height above the dock. The two controls
   stay for screen readers (whose double tap is one click and whose swipes are their own), drawn
   nowhere (.sr-only, modern-editor.css). */
@container nd not (min-width:621px){
  .practical-main .reader-stage>.reader-actions{display:flex;position:absolute;width:1px;height:1px;margin:0;overflow:hidden;clip-path:inset(50%);transform:none} /* raw-ok: 1px = .sr-only 동값 */}
@media not ((hover:hover) and (pointer:fine)){
@container nd (min-width:621px){
  .practical-main .reader-stage>.reader-actions{display:flex;position:absolute;width:1px;height:1px;margin:0;overflow:hidden;clip-path:inset(50%);transform:none} /* raw-ok: 1px = .sr-only 동값 */}}
/* Short landscape screens: the stack keeps a lip of the next card instead of its title strip and leaves out the
   follower band (its 96 + gap would leave a sideways phone's card about half the column), so the card holds ≥85%
   of the height above the dock. Turning the phone upright brings the band back (resize repaints it). */
@container nd (orientation:landscape) and (max-height:500px){
  .practical-main{--reader-top-gap:max(var(--sp-3),env(safe-area-inset-top,0px));--reader-peek:var(--sp-4);--reader-dock-clear:var(--sp-3)}
  .practical-main:has(.home-pulse:not([hidden])){--home-pulse-h:0px}
  .practical-main .home-pulse{display:none}
  .next-peek>*{visibility:hidden}}
/* modern-score.css */
/* Score colors walk the Pantone wheel from cool to warm:
   298 C → 3255 C → lime → 107 C → 806 C (analogous run, 806 C closing as the
   split complement of the cool base). */
[data-score-tier="low"]{--score-color:var(--bias-l1)}
[data-score-tier="below"]{--score-color:var(--accent)}
[data-score-tier="above"]{--score-color:var(--accent-7)}
[data-score-tier="high"]{--score-color:var(--accent-4)}
[data-score-tier="peak"]{--score-color:var(--accent-6)}
[data-score-tier="pending"],[data-score-tier="neutral"]{--score-color:var(--fg)}
.practical-main .score-lead strong{
  color:var(--score-color,var(--fg));
  text-shadow:0 0 14px color-mix(in srgb,var(--score-color,var(--fg)) 22%,transparent);
}
.practical-main .score-lead.is-pending strong,
.practical-main .score-lead[data-score-tier="neutral"] strong{text-shadow:none}
/* modern-card-motion.css */
/* The supplied stacked-card reference stays one physical surface per article. */
.nd-body{overflow-x:clip}
.practical-main{max-width:none;overflow:clip}
.practical-main .reader-actions{position:relative;z-index:12}
/* A thrown card travels over the side buttons, never under them: the deck is a
   stacking context (perspective), so the whole deck lifts above them while turning. */
.practical-main .deck.is-turning{z-index:13}
/* modern-home.js moves these with transform and opacity only, promoted only while moving. */
.deck.is-turning>:is(.article-card,.next-peek,.card-lift),.deck.is-turning>.deck-fan>.fan-plate{will-change:transform,opacity}
/* The caption rises from its bottom edge with a drag toward the next card. */
.deck>.next-peek{transform-origin:50% 100%}
.deck>.next-peek>.caption-dot{flex:none;width:6px;height:6px;border-radius:50%;background:var(--score-color,var(--mut))}
/* Deck (operator 10-19 reference video, SPEC-60fps): blank sheets stacked right behind the card,
   the next at .886 with its centre .12 W lower and one more behind it; modern-home.js draws them
   only while the top card moves off them, so the glass card at rest is never darkened. */
.deck>.deck-fan{position:absolute;top:0;left:0;right:0;height:var(--reader-card-height);pointer-events:none}
.deck>.deck-fan>.fan-plate{position:absolute;inset:0;z-index:1;border-radius:var(--r-lg);border:1px solid var(--line);background:var(--card-solid);transform-origin:50% 100%}
.deck>.deck-fan>.fan-plate:nth-child(2){z-index:0}
/* The waiting card's own words, out of focus at 15% (reference σ 8 px, 15% contrast: on this
   rgb(47,54,60) sheet the title sits ΔL* 12 above it, the reference's black-on-white gives ΔL* 11). */
.deck>.deck-fan>.fan-plate{overflow:hidden;will-change:transform}   /* its fixed blur rasterises once; moving the plate only moves the layer */
.practical-main .deck>.deck-fan>.fan-plate>.plate-face{position:absolute;inset:0;z-index:auto;width:auto;height:auto;margin:0;
  border-color:transparent;background:none;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;
  opacity:.15;filter:blur(8px);pointer-events:none}
@container nd (max-width:620px){.deck>.deck-fan>.fan-plate{border-radius:20px}}
.deck.is-turning>.article-card.is-arriving>*{will-change:opacity,filter}
/* The incoming card moves as an opaque sheet; settled in front, the fill clears off its glass in 180 ms. */
.practical-main .deck>.article-card:not(.card-exit){box-shadow:inset 0 0 0 100cqmax transparent,var(--modern-panel-shadow);transition:box-shadow 180ms cubic-bezier(.2,0,0,1)}
.practical-main .deck>.article-card.is-arriving{box-shadow:inset 0 0 0 100cqmax var(--card-solid),var(--modern-panel-shadow);transition:none}
/* Under that opaque fill the backdrop blur shows nothing, yet a moving card would redo it every
   frame (a full-card blur at phone pixel ratios): it is off until the card has settled. */
.practical-main .deck>.article-card.is-arriving{backdrop-filter:none;-webkit-backdrop-filter:none}
/* The leaving card drops behind the incoming one at zero overlap and settles into the fan. */
/* The leaving card is a solid sheet in flight: a translucent glass copy let the
   arriving card's text read through it, two articles overlapping (operator report).
   Same measured fill as the light-glass path below, so the material does not jump. */
/* rgb(47,54,60) = median of the resting glass over the scene (QA 10-19, S6
   strip-material), fully opaque so nothing reads through the card in flight. */
.deck{--card-solid:rgb(47,54,60)}
.practical-main .article-card.card-exit{
  position:absolute;z-index:8;top:0;left:0;margin:0;
  min-height:0;max-height:none;pointer-events:none;will-change:transform,opacity;
  backdrop-filter:none;-webkit-backdrop-filter:none;background:var(--card-solid);
}
.deck>.next-peek.peek-exit{pointer-events:none;will-change:transform,opacity,filter}
/* Software or weak GPUs (modern-home.js decides): the glass trades its backdrop blur,
   redone every frame the card or the scene moves, for a solid fill measured from the
   blurred glass (median rgb 34,53,59 over the scene); the stack stays on its own layers
   so a gesture never starts with a software re-raster. */
.deck.glass-lite>.article-card{
  backdrop-filter:none;-webkit-backdrop-filter:none;background:var(--card-solid);
}
.deck.glass-lite>:is(.article-card,.card-lift),.deck.glass-lite>.deck-fan>.fan-plate{will-change:transform,opacity}
/* The held card's lift: an outer shadow only, so nothing darkens the glass above it. */
.deck>.card-lift{
  position:absolute;z-index:2;top:0;left:0;pointer-events:none;border-radius:var(--r-lg);
  box-shadow:0 22px 48px -18px rgba(0,0,0,calc(.2 + var(--depth) * .3));
}
/* Press: scale(--press-s) in 100 ms, release 260 ms with a slight settle (reference curves). */
.practical-main .reader-action,.practical-main .pick-box{transition:transform 260ms cubic-bezier(.3,1.12,.4,1)}
.practical-main .reader-action:active:not(:disabled),
.practical-main .pick-box:has(input:active:not(:disabled)){transition-duration:100ms;transition-timing-function:cubic-bezier(.2,0,0,1)}
.practical-main .pick-box:has(input:active:not(:disabled)){transform:scale(var(--press-s,.98))}
@media(prefers-reduced-motion:reduce){
  .deck.is-turning>*,.deck.is-turning>.deck-fan>.fan-plate,.practical-main .article-card.card-exit{will-change:auto}
  .practical-main .deck>.article-card:not(.card-exit){transition:none}
  .practical-main .reader-action,.practical-main .pick-box{transition:none}
}
/* modern-card-content.css */
/* Card content: one card on screen; longer source material scrolls inside its body.
   Type comes from the type map in modern-editor.css, colours from modern-dark.css;
   the card's height and the stack around it are laid out in modern-practical.css. */
.nd-html{--action-symbol:var(--modern-action-symbol)}
.article-topline{
  display:flex;justify-content:space-between;align-items:flex-start;
  gap:var(--sp-3);flex-shrink:0;margin-bottom:var(--sp-4);color:var(--mut);
}
.article-topline .article-rank{white-space:nowrap;padding-top:0}
/* 틈·촉 픽 칩(modern-card-content.js · 형 11-03 09:57) = 점수 바로 옆 · 시그니처 색 테 · 점수 글꼴을 안 물려받음 */
.meta-chip+.meta-chip::before{content:'·' / '';margin-right:var(--sp-1);color:var(--mut)}   /* 매체 뒤 픽 얼굴 = 매체 앞 점과 같은 점·간격(형 11-03 17:10 「블릿 그대로 유지하고 간격 유지하고 매체명 우측으로」) */
.article-pick{color:var(--accent);font-weight:600}   /* 얼굴 없는 봇 = 「X 픽」 글자 */
.article-pick.has-face{padding-block:0}
.article-pick{flex:none}
/* 얼굴이 있는 줄 = 안 꺾임(얼굴만 다음 줄로 떨어져 점만 남던 것 · 390 폭 실측) · 모자라면 매체 이름 끝이 「…」 · 시각 덩이는 안 줄어듦 */
.article-schedule:has(>.article-pick){flex-wrap:nowrap}
.article-schedule:has(>.article-pick) .meta-published{flex:none}
.article-schedule:has(>.article-pick) .article-publisher{flex:0 1 auto;overflow:hidden}
.article-schedule:has(>.article-pick) .article-publisher .ink-text{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.article-pick-face{flex:none;width:20px;height:20px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 1.5px var(--accent)}   /* 라임 테 또렷이(형 17:10 「얼굴 테두리 정상적으로 라임색으로 씌워서」) · 크기 = 이 줄 높이 안(기자 이름 자리) */
.article-schedule{display:flex;flex-wrap:wrap;align-items:center;gap:var(--sp-2);min-width:0;margin-bottom:var(--sp-1);color:var(--mut)}
.meta-chip{display:inline-flex;align-items:center;gap:var(--sp-1);padding:var(--sp-1) 0;border-block:1px solid transparent;font:inherit;font-weight:500;min-width:0;max-width:100%} /* the clear hairline keeps the line's height */
/* The publisher reads as provenance, not a control: no chip outline in the card's swipe and
   double-tap surface (the sources it summarises are in the same scroll). A dot parts it from the time. */
.meta-published+.meta-chip::before{content:'·' / '';margin-right:var(--sp-1);color:var(--mut)}
.article-schedule .ink-text{display:inline-block;transform:translateY(var(--ink-shift,0px));overflow-wrap:anywhere}
.meta-published{display:inline-flex;align-items:center;min-width:0;max-width:100%;font-weight:500}
.meta-published .ink-text{white-space:nowrap}
.article-publisher{color:var(--fg)}
.article-publisher .pub-more{display:inline-block;color:var(--mut);transform:translateY(.05em)} /* raw-ok: 광학 보정 — 한글은 기준선 아래로 내려오고 숫자·+ 는 기준선에서 끝나 「+3」 잉크 중심이 한글보다 .05em 높았다(390 폭 2배 실측 0.75px @13.5) · 숫자 덩어리만 그만큼 내린다 */
/* Elapsed time: 802 C → 107 C → warm → secondary ink, an analogous warm run. */
.publish-elapsed{color:var(--mut)}
.publish-elapsed[data-age-band="fresh"]{color:var(--accent-5)}
.publish-elapsed[data-age-band="recent"]{color:var(--accent-4)}
.publish-elapsed[data-age-band="aging"]{color:var(--age-warm)}
.article-schedule time{color:var(--accent);font-weight:700;font-variant-numeric:tabular-nums}
.article-body{
  flex:1;min-height:0;overflow:auto;overscroll-behavior-y:contain;
  scrollbar-width:thin;scrollbar-color:var(--glass-edge) transparent;
  padding:0 var(--sp-1) calc(var(--sp-1) + var(--home-banner-space,0px)) 0;touch-action:pan-y pinch-zoom;
}
.article-body:focus-visible{outline:1px solid var(--glass-edge);outline-offset:-1px}
/* auto lets the browser claim a horizontal drag and cancel the card swipe. */
.article-topline,.article-body>:not(.article-media,.article-lead),.article-lead>:not(.article-media){touch-action:pan-y}
.practical-main .article-title{margin:0 0 var(--sp-3);font-weight:600;word-break:keep-all;overflow-wrap:anywhere;text-wrap:pretty}
/* Korean reading text breaks between words, like the title. */
.article-excerpt,.source-story a,.source-story p{word-break:keep-all;overflow-wrap:anywhere}
.article-excerpt{margin:0;max-width:38em}
.article-details{margin:0 0 var(--sp-4)}
.article-details strong{font-weight:600;color:var(--fg)}
.article-details .article-excerpt+.article-excerpt{margin-top:var(--sp-2)}
.article-media{position:relative;margin:0 0 var(--sp-4);flex-shrink:0;--article-image-h:clamp(120px,20cqh,180px)} /* 종전 사진 높이 = 아래 채움 배치의 최소 높이 */
.article-image-frame{
  height:var(--article-image-h);position:relative;overflow:hidden;
  border:1px solid var(--line);border-radius:var(--r-sm);
  background:var(--control-glass);display:grid;place-items:center;
}
.article-image-frame img{
  position:absolute;inset:0;width:100%;height:100%;display:block;
  object-fit:contain;user-select:none;
}
.gallery-track{
  display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;
  overscroll-behavior-x:contain;touch-action:pan-y pinch-zoom;   /* sideways drags = JS (modern-gallery): photos move while they can, the card turns from either end */
  scrollbar-width:none;border-radius:var(--r-sm);cursor:grab;
}
.gallery-track::-webkit-scrollbar{display:none}
.gallery-track[data-count="1"]{cursor:default}
.gallery-track:focus-visible{outline:1px solid var(--glass-edge);outline-offset:var(--sp-1)}
.gallery-track.is-dragging{scroll-snap-type:none;cursor:grabbing;user-select:none}
.gallery-slide{flex:0 0 100%;width:100%;scroll-snap-align:start;scroll-snap-stop:always}
.card-exit .gallery-track{scroll-snap-type:none}
.gallery-position{
 position:absolute;right:var(--sp-2);bottom:var(--sp-2);
 padding:var(--sp-1) var(--sp-2);border-radius:var(--r-sm);
 background:var(--control-glass);color:var(--fg);
 font-variant-numeric:tabular-nums;pointer-events:none;
}
/* 짐작 그림 칩(형 11-03 「정확한 사진이 아니더라도, 그 이슈와 유사한 사진을 가져오는게 포인트야」 · 깃 「짐작 그림이 표시 없이 진짜 사진처럼 보여」) = 그 사진 왼쪽 아래 「검색 그림」 · 꼴 = 옆 「1 / 4」(.gallery-position) 그대로 */
.article-image-note{
 position:absolute;left:var(--sp-2);bottom:var(--sp-2);
 padding:var(--sp-1) var(--sp-2);border-radius:var(--r-sm);
 background:var(--control-glass);color:var(--fg);pointer-events:none;
}
/* 사진 위 두 알약(「검색 그림」 · 「1 / 4」) = 밝은 사진 위에서도 읽히게 어두운 머리 바탕(85%)을 깔고 뒤를 흐림(라이브 9222 실측 = 옅은 유리 5% 라 차트·하늘 위에서 글자가 묻힘) */
.article-image-note,.gallery-position{background:var(--modern-modal-head-bg);color:var(--modern-ink);backdrop-filter:blur(var(--silk-blur));-webkit-backdrop-filter:blur(var(--silk-blur))}   /* 밝게·어둡게 같은 값 = 사진 위에선 늘 어두운 바탕 · 밝은 글자 */
/* 사진이 출처 목록 자리를 채운다(운영자 261022 «카드 아래 1/3~1/2 출처 목록은 잘 안 읽는다 · 유관된 이미지로»).
   사진이 있는 카드는 머리 덩이(.article-lead = 시각·제목·내용·사진·표식)가 본문 높이를 채우되 출처 첫 줄이 보일 만큼
   (--article-source-peek = 누름 칸 2개 + 간격 · 이름 줄과 두 줄 제목 한 줄이 들어간다)을 남기고, 사진이 남는 높이를 받는다
   (가운데 · cover). 출처 목록은 사진 아래 그대로 = 본문을 내리면 전부 보인다. 머리가 길면 사진은 종전 높이까지만 줄고
   본문이 스크롤된다. 사진을 못 불러와 지우면(modern-card-content.js bindCardMedia) :has 가 풀려 종전 배치로 돌아간다.
   트랙은 사진 칸에 절대 배치 = 칸 높이가 정해진 뒤 채운다(늘어난 높이를 자식 백분율로 읽지 않는다). */
/* (261022) 사진 높이 상한 = 황금비(폭 ÷ 1.618 · 운영자 «카드 이미지 공간 높이를 30퍼 줄여 한계 · 차트와 글자가 안정적으로 · 황금비 유지») —
   구판은 사진이 카드에 남는 높이를 다 받았다(390 폭 실측 256). 이제 사진은 황금 직사각형까지만, 남는 자리는 아래 출처 줄이 쓴다. */
.article-lead:has(>.article-media){display:flex;flex-direction:column}
.article-lead>.article-media{flex:0 1 auto;aspect-ratio:1.618;min-height:var(--article-image-h)}
.article-lead>.article-media>.gallery-track{position:absolute;inset:0}
.article-lead>.article-media .article-image-frame{height:auto}
.article-lead>.article-media .article-image-frame img{object-fit:cover;object-position:center}
.article-sources{margin-bottom:0}
/* One source = one line of fixed height 44: [publisher] [title…] (operator 10-22 «매체랑 제목 가로로 한 줄 · 라인 높이 고정 ·
   매체랑 제목 간 간격은 유지(구 세로 간격 sp-1) · 제목은 한계점에선 … · 공유 버튼(↗) 없어도 됨 · 피시에선 호버 동작»).
   The title link answers a press over the whole 44 line; the publisher stays the card's double-tap surface for PICK.
   A press tints the whole row; a mouse over the link tints it too and underlines the title. */
.source-story{display:flex;align-items:center;gap:var(--sp-1);height:var(--modern-hit);padding:0;border-top:1px solid var(--line2);line-height:var(--modern-lh-ui);transition:background-color var(--modern-dur-press) var(--modern-ease-press)}
.source-story:has(a:active){background:var(--well);transition-duration:var(--modern-dur-press-in);transition-timing-function:var(--modern-ease-press-in)}
.source-story:first-child{border-top:0}
.source-story small{flex:none;max-width:40%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:var(--mut)}
.source-story a,.source-story p{position:relative;flex:1;min-width:0;display:flex;margin:0}
.source-story a::after{content:'';position:absolute;left:0;right:0;top:min(0px,calc((100% - var(--modern-hit)) / 2));bottom:min(0px,calc((100% - var(--modern-hit)) / 2))}
.source-story .st{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.source-story a:hover{color:var(--fg);text-decoration:underline;text-underline-offset:var(--sp-1)}
@media(hover:hover){.source-story:has(a:hover){background:var(--well)}}
.practical-main .reader-action .action-circle,
.practical-main .pick-mark,.practical-main .pick-text{color:var(--action-symbol);opacity:1}
.practical-main .reader-action .action-circle svg,.practical-main .pick-mark svg{stroke:var(--action-symbol)}
/* Taken: dark ink on the accent fill. */
.practical-main .pick-box input:checked~:is(.pick-mark,.pick-text){color:var(--modern-on-accent)}
.practical-main .pick-box input:checked~.pick-mark svg{stroke:var(--modern-on-accent)}
@container nd (max-width:620px){
 .article-topline{margin-bottom:var(--sp-3);gap:var(--sp-2)}
 .article-media{margin-bottom:var(--sp-3)}}
/* A card replaced in place by new data (modern-home.js fade-through) keeps the glass it sits in:
   its copy is not the solid sheet of a thrown card, so the surface does not change while its words
   fade, and the new card under it takes its place in the same frame. */
.practical-main .deck:not(.glass-lite)>.article-card.card-exit.is-swap{background:var(--silk-glass);backdrop-filter:blur(var(--silk-blur));-webkit-backdrop-filter:blur(var(--silk-blur))}
/* modern-numerals.css */
/* Operator-supplied LEMON MILK Medium Italic belongs to the main score and the home follower totals
   (operator 10-22 «숫자도 레몬밀크»). All other numerals, Korean, and Latin text use Pretendard. */

.nd-body,
.snapshot-date strong,
.stat strong,
.page-controls > span,
.article-rank,
.next-peek > span,
.panel-head h2 > span,
.selection-item > span,
.archive-summary #nav-picks,
.archive-tabs span,
.snapshot-date strong span,
.stat strong small,
.score strong {
  font-family: 'Pretendard Variable', system-ui, sans-serif;
}

.practical-main .score-lead strong {
  font-family: 'NM Lemon Decimal', 'Pretendard Variable', system-ui, sans-serif;
  letter-spacing: normal;
}

.home-pulse .hp-row .hp-v {
  font-family: 'NM Lemon Decimal', 'Pretendard Variable', system-ui, sans-serif;
  letter-spacing: normal;
}

.practical-main .score-lead.is-pending strong {
  font-family: 'Pretendard Variable', system-ui, sans-serif;
  letter-spacing: normal;
}

.practical-main .article-topline .score-lead strong {
  position: relative;
  display: inline-block;
  transform: translateX(var(--score-ink-x, 0px));
}

/* numericText (modern-numerals.js): while the score changes, the value stays in flow as
   transparent text (width, text and what assistive tech reads) and a decorative face draws
   each glyph at its kerned pen position, inheriting the score's colour and glow. The face is
   removed when the digits land, so the resting score is the plain text again. A card copy
   leaving the deck keeps its face too, so it goes on showing what the card showed. */
.practical-main .score-lead .nm-text {
  color: transparent;
  text-shadow: none;
}

.practical-main .score-lead .nm-face {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.practical-main .score-lead .nm-g {
  position: absolute;
  top: 0;
  white-space: pre;
}

.practical-main .score-lead .nm-g::before {
  content: attr(data-g);
  content: attr(data-g) / "";
}

/* Reduced motion and forced colours show the value itself: forced colours would repaint the
   transparent value in the system ink under the face, two values at once. */
@media (prefers-reduced-motion: reduce), (forced-colors: active) {
  .practical-main .score-lead .nm-face {
    display: none;
  }

  .practical-main .score-lead .nm-text {
    color: inherit;
    text-shadow: inherit;
  }
}

.article-topline > .article-rank {
  display: inline-block;
  padding-right: var(--sp-1);
  overflow: visible;
  transform: translateY(var(--rank-ink-shift, 0px));
}
/* modern-morph-icons.css */
/* Morphicons owns only SVG geometry. Existing colour, width and hit areas stay. */
svg[data-morph-icon] { overflow:visible; }
.morph-external-arrow {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:1em;
  height:1.7em;
}
.source-story .morph-external-arrow svg {
  width:1em;
  height:1em;
  display:block;
}
/* modern-home.css */
/* This iframe inherits the parent scene and the approved card dimensions. */
.nd-html{--menu-dock-gap:var(--modern-menu-dock-gap)}
.nd-html,.nd-body{background:transparent;min-height:100%;overflow:hidden}
[hidden]{display:none!important}
@container nd (max-width:620px){.nd-html{--menu-dock-gap:var(--modern-menu-dock-gap-mobile)}}
/* Status colours by kind: an outside failure (server, network, an old or missing file) in the
   warm ink, broken data in the pink of the palette; the words stay in the readable inks. */
.home-status,.empty-state .status-kind{color:var(--mut)}
.home-status .status-text strong{color:var(--fg)}
.home-status[data-kind="external"] .status-kind,.empty-state[data-kind="external"] .empty-icon{color:var(--age-warm)}
.home-status[data-kind="code"] .status-kind,.empty-state[data-kind="code"] .empty-icon{color:var(--accent-6)}
.empty-state .status-kind{color:var(--fg)}
/* Press: the shared token pair (in 100 ms, out 260 ms with a slight settle). Under reduced
   motion the press dims instead of scaling (transitions are off in modern-editor.css). */
.quiet-button{transition:transform var(--modern-dur-press) var(--modern-ease-press),background-color var(--modern-dur-press) var(--modern-ease-press)}
.quiet-button:active:not(:disabled){transition-duration:var(--modern-dur-press-in);transition-timing-function:var(--modern-ease-press-in)}
@media(prefers-reduced-motion:reduce){
  :is(.quiet-button,.reader-action):active:not(:disabled){transform:none;opacity:.7}
  .practical-main .pick-box:has(input:active:not(:disabled)){transform:none;opacity:.7}
}
/* Follower band (operator 10-22 «좌상단에 IG 얼마 │ FB 얼마 · 스레드는 패스 · 두 개가 추세선 · 증가율 % 기준 · 날마다 점은 ±명수 ·
   인스타를 위쪽에 페북을 아래에 표기» · «카드 윗변을 받침 삼아서 곡선 차트»): IG = accent, FB = the secondary ink — the platform's
   colour runs through its name, line, dots and numbers; a losing day's number turns gold. Only colours and type here (tokens);
   geometry is drawing data written by modern-home.js. */
.home-pulse[role="button"]{cursor:pointer} /* 누르면 채널 요약(운영자 10-25) */
.home-pulse[role="button"]:focus-visible{outline:var(--modern-focus-ring) solid var(--accent);outline-offset:var(--modern-focus-offset)} /* = modern-editor.css 버튼 포커스 규칙 계승 */
.home-pulse .hp-k{color:var(--modern-mut);font-size:var(--modern-type-caption);letter-spacing:var(--modern-track-caption)}
.home-pulse .hp-k.hp-ig{color:var(--modern-accent)} .home-pulse .hp-k.hp-fb{color:var(--modern-fg)}
.home-pulse .hp-v{color:var(--modern-fg);font-size:var(--modern-type-lead);font-weight:bold;font-variant-numeric:tabular-nums;letter-spacing:var(--modern-track-lead);line-height:var(--modern-lh-solid)}
.home-pulse .hp-at{color:var(--modern-mut);font-size:var(--modern-type-caption);letter-spacing:var(--modern-track-caption);font-variant-numeric:tabular-nums;line-height:var(--modern-lh-solid)}
.hp-chart path.ig{fill:none;stroke:var(--modern-accent)} .hp-chart path.fb{fill:none;stroke:var(--modern-fg)}
.hp-chart circle.ig{fill:var(--modern-accent)} .hp-chart circle.fb{fill:var(--modern-fg)}
.hp-chart text{font-weight:normal;font-variant-numeric:tabular-nums} .hp-chart text.now{font-weight:bold}
/* 날마다 ± = 두 플랫폼 같은 조건(운영자 261022 «증감 색 동일하게 조건») — 는 날 = 강조 · 준 날 = 금색 · 0·모름 = 2차 잉크 */
.hp-chart text.up{fill:var(--modern-accent)} .hp-chart text.dn{fill:var(--modern-accent-4)} .hp-chart text.flat{fill:var(--modern-mut)}
/* 차트 아래 ± 두 줄(IG 위 · FB 아래 · 운영자 261022 «인스타랑 페북 나란히 두 줄 · 아래로») — IG 줄만 시그니처색 직선 띠가 좌우로 옅어진다
   («둥그렇게 말지마 · 자연스럽게 페이드 아웃 직선 · 인스타 보라 말고 시그니처색 · 더 연해도») · FB 줄 = 음영 없음(«페북은 음영 아예 없어도») */
#hp-igfade stop{stop-color:var(--modern-accent)} .hp-chart .hp-rowbg{fill-opacity:.12}
.hp-chart .hp-base{stroke:var(--modern-line)} .hp-chart .hp-x{fill:none;stroke:var(--modern-mut)}
.hp-chart .hp-guide{stroke:var(--modern-glass-edge)}
/* 차트 호버 상세(마우스만 · 운영자 261022 «차트도 호버하면 상세 정보») — 도구 창 유리 말풍선 */
.home-pulse .hp-tip{position:absolute;z-index:2;left:0;top:0;pointer-events:none;padding:var(--modern-sp-1) var(--modern-sp-2);border:1px solid var(--modern-glass-edge);border-radius:var(--modern-r-sm);
  background:var(--modern-modal-glass);-webkit-backdrop-filter:blur(var(--modern-blur-s));backdrop-filter:blur(var(--modern-blur-s));color:var(--modern-fg);
  font-size:var(--modern-type-caption);line-height:var(--modern-lh-ui);font-variant-numeric:tabular-nums;white-space:nowrap;transform:translate(-50%,-100%)}
.home-pulse .hp-tip b{font-weight:bold} .home-pulse .hp-tip .up{color:var(--modern-accent)} .home-pulse .hp-tip .dn{color:var(--modern-accent-4)} .home-pulse .hp-tip .k{color:var(--modern-mut)}
/* Pull to refresh on the home card: the feed's ring (index #ptr) in the home frame's tokens. */
.home-pull{position:fixed;top:max(var(--sp-2),env(safe-area-inset-top));left:50%;z-index:20;display:grid;place-items:center;width:var(--modern-hit);height:var(--modern-hit);border-radius:50%;
  background:var(--modern-control-glass);border:1px solid var(--glass-edge);box-shadow:var(--modern-panel-shadow);opacity:0;pointer-events:none;transform:translate(-50%,-54px) scale(.9)}
.home-pull.show{opacity:1}
.home-pull.armed{box-shadow:var(--modern-panel-shadow),0 0 0 1px var(--modern-accent)}
.home-pull-ring{width:20px;height:20px;border-radius:50%;border:2px solid var(--modern-mut,var(--mut));border-top-color:var(--modern-accent)}
.home-pull.spin .home-pull-ring{animation:home-spin var(--modern-skeleton-dur) linear infinite}   /* = the refresh button's spin */
`;
export const DECK_HTML = `<main class="practical-main" aria-label="기사 목록">
    <section class="reader" aria-label="기사 카드">
      <header class="home-pulse" id="home-pulse" aria-label="팔로워" hidden>
        <div class="hp-row">
          <span class="hp-k hp-ig">IG</span><b class="hp-v" id="hp-ig"></b><i class="hp-sep" aria-hidden="true"></i><span class="hp-k hp-fb">FB</span><b class="hp-v" id="hp-fb"></b>
          <span class="hp-at" id="hp-at"></span>
        </div>
        <svg class="hp-chart" id="hp-chart" viewBox="0 0 300 64" role="img"></svg>
        <div class="hp-tip" id="hp-tip" aria-hidden="true" hidden></div>
      </header>
      <div class="reader-stage">
        <div class="deck" id="deck">
          <div class="deck-fan" aria-hidden="true"><i class="fan-plate" hidden></i><i class="fan-plate" hidden></i></div>
          <div class="next-peek deck-caption" id="peek" aria-hidden="true" title="다음 기사" hidden></div>
          <article class="article-card" id="article" tabindex="0" hidden></article>
          <div class="empty-state is-booting" id="empty" data-state="loading">
            <div class="home-skeleton" aria-hidden="true">
              <div class="sk-top"><span class="sk sk-score"></span><span class="sk sk-rank"></span></div>
              <span class="sk sk-meta"></span>
              <span class="sk sk-title"></span>
              <span class="sk sk-title sk-short"></span>
              <span class="sk sk-line"></span>
              <span class="sk sk-line"></span>
              <span class="sk sk-line sk-short"></span>
            </div>
            <span class="empty-icon" id="empty-icon" data-icon="NEWS"></span>
            <span class="status-kind" id="empty-kind" hidden></span>
            <h3 id="empty-title">기사를 불러오는 중이야</h3>
            <p id="empty-message">현재 기사 목록을 확인하고 있어.</p>
            <button class="quiet-button retry-button" id="refresh-home" type="button" data-refresh hidden><span data-icon="RETRY"></span><span class="retry-label">다시 불러오기</span></button>
          </div>
          <div id="home-status" class="home-status" hidden>
            <span class="status-kind" id="home-status-kind"></span>
            <p class="status-text" id="home-status-text" role="status"></p>
            <button class="quiet-button retry-button" id="home-retry" type="button" data-refresh><span data-icon="RETRY"></span><span class="retry-label">다시 불러오기</span></button>
          </div>
        </div>
        <div class="reader-actions" role="group" aria-label="기사 선택">
          <label class="pick-control" for="pick"><span class="pick-box"><input id="pick" type="checkbox" aria-label="PICK" title="이 기사 PICK" disabled><span class="pick-mark" data-icon="CHECK"></span><span class="pick-text" id="pick-text" aria-hidden="true">PICK</span></span></label>
          <button id="next" class="reader-action" type="button" aria-label="다음 기사" title="다음 기사" disabled><span class="action-circle" data-icon="ARROW_R"></span></button>
        </div>
      </div>
    </section>
  </main>
  <div class="sr-only" id="announcement" role="status"></div>`;
/** 덱이 쓰지만 스스로 안 정하는 변수(원본에선 없음) — 틀에서 비울 이름들 */
export const DECK_UNSET = ["--bg","--home-banner-space","--ink-shift","--rank-ink-shift","--score-ink-x","--ua-sw"];
/** 엔진 = 원본 스크립트를 한 몸으로(원본도 한 문서의 한 전역을 같이 씀) · window · document = 틀이 주는 것 · G = 가릴 맨이름들 */
export function runDeck(window, document, G) {
"use strict";
const { setTimeout, clearTimeout, setInterval, clearInterval, requestAnimationFrame, cancelAnimationFrame, requestIdleCallback, addEventListener, removeEventListener, ResizeObserver, MutationObserver, IntersectionObserver, fetch, parent, scrollX, scrollY } = G;
/* ── modern-icons.js ── */
// nm-svg.js — 노뮤트 뷰어 공유 아이콘 SSOT (운영자 260628 · "하나 바꾸면 관련된 거 다 바뀜")
// 뷰어 다수가 <script src="nm-svg.js"> 로 로드(로더 전수 = grep 실측이 정본 · 개수 열거 폐지 — 평의회 Q165, 구 '5뷰어' 표기는 comp 폐지·후속 뷰어 신설로 스테일). 여기 정의가 단일 정본 —
// 같은 아이콘을 뷰어마다 인라인 복제하지 말고 이 파일을 고친다(드리프트 차단·CII P1).
// classic script 전역 const = 이후 인라인 스크립트에서 그대로 참조(모듈 아님). currentColor 상속.
// 정본 선정: DOWNLOAD=14px(thumb는 CSS로 12px 재지정=무관) · WARN=index/ly/k 다수본(vertical-align).
// 261024 운영자 「C 다 적용」 = 21종(CHECK·OK·COPY·PASTE·ERASE·UNDO·WAIT·ERR·DOWNLOAD·WARN·SWAP·EYE·ARROW_R·CHEV_L/R·MERGE·EDIT·LAYERS·RETRY·TRASH·NEWS) 모양 =
//   useAnimations(MIT · viewer/vendor/useanimations) 쉬는 프레임 그대로(32 판 가운데 24 = viewBox "4 4 24 24" · 획 2) — 누름 재생(nm-ua.js)의 시작·끝과 같은 그림.
//   획 굵기 = 종전 값 유지(CHECK·OK 2.6 · ERR·SWAP 2.4 · ARROW_R·CHEV_L/R 2.2 · 나머지 2) — 재생 덮개도 이 값을 따른다(nm-ua.js).
//   다시 뽑기 = 아이콘 JSON 쉬는 프레임 렌더 → 경로+행렬(수작업 금지). FUNNEL(마스크 모양)·SUBS·AI·G/GEMINI = 종전. modern-icons.js = 이 파일 사본(같이 고친다).

const CHECK_SVG = '<svg width="14" height="14" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d=" M8,-5.5 C8,-5.5 -3,5.5 -3,5.5 C-3,5.5 -8,0.5 -8,0.5" transform="matrix(1 0 0 1 16 15.5)"/></svg>';
const COPY_SVG = '<svg width="14" height="14" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M-3.5,6.5 C-3.5,6.5 -4.5,6.5 -4.5,6.5 C-5.6,6.5 -6.5,5.6 -6.5,4.5 C-6.5,4.5 -6.5,-4.5 -6.5,-4.5 C-6.5,-5.6 -5.6,-6.5 -4.5,-6.5 C-4.5,-6.5 4.5,-6.5 4.5,-6.5 C5.6,-6.5 6.5,-5.6 6.5,-4.5 C6.5,-4.5 6.5,-3.5 6.5,-3.5" transform="matrix(1 0 0 1 12.5 12.5)"/><path d=" M-4.5,-6.5 C-4.5,-6.5 4.5,-6.5 4.5,-6.5 C5.6,-6.5 6.5,-5.6 6.5,-4.5 C6.5,-4.5 6.5,4.5 6.5,4.5 C6.5,5.6 5.6,6.5 4.5,6.5 C4.5,6.5 -4.5,6.5 -4.5,6.5 C-5.6,6.5 -6.5,5.6 -6.5,4.5 C-6.5,4.5 -6.5,-4.5 -6.5,-4.5 C-6.5,-5.6 -5.6,-6.5 -4.5,-6.5z" transform="matrix(1 0 0 1 19.5 19.5)"/></svg>';
const PASTE_SVG = '<svg width="14" height="14" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M16,4 C16,4 18,4 18,4 C19.11,4 20,4.89 20,6 C20,6 20,20 20,20 C20,21.11 19.11,22 18,22 C18,22 6,22 6,22 C4.89,22 4,21.11 4,20 C4,20 4,6 4,6 C4,4.89 4.89,4 6,4 C6,4 8,4 8,4" transform="matrix(1 0 0 1 4 4)"/><path d=" M9,2 C9,2 15,2 15,2 C15.55,2 16,2.45 16,3 C16,3 16,5 16,5 C16,5.55 15.55,6 15,6 C15,6 9,6 9,6 C8.45,6 8,5.55 8,5 C8,5 8,3 8,3 C8,2.45 8.45,2 9,2z" transform="matrix(1 0 0 1 4 4)"/></svg>';
const ERASE_SVG = '<svg width="13" height="13" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M21,4 C21,4 8,4 8,4 C8,4 1,12 1,12 C1,12 8,20 8,20 C8,20 21,20 21,20 C22.11,20 23,19.11 23,18 C23,18 23,6 23,6 C23,4.89 22.11,4 21,4z" transform="matrix(1 0 0 1 4 4)"/><path d=" M12,9 C12,9 18,15 18,15 M18,9 C18,9 12,15 12,15" transform="matrix(1 0 0 1 4 4)"/></svg>';
const UNDO_SVG = '<svg width="13" height="13" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M20,20 C20,20 20,13 20,13 C20,10.79 18.21,9 16,9 C16,9 4,9 4,9 M9,14 C9,14 4,9 4,9 C4,9 9,4 9,4" transform="matrix(1 0 0 1 4 4)"/></svg>';
const WAIT_SVG = '<svg width="13" height="13" style="vertical-align:-2px" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M12,2 C17.52,2 22,6.48 22,12 C22,17.52 17.52,22 12,22 C6.48,22 2,17.52 2,12 C2,6.48 6.48,2 12,2z" transform="matrix(1 0 0 1 4 4)"/><path d=" M12,12 C12,12 16,14 16,14" transform="matrix(1 0 0 1 4 4)"/><path d=" M12,6 C12,6 12,12 12,12" transform="matrix(1 0 0 1 4 4)"/></svg>';
const ERR_SVG = '<svg width="13" height="13" style="vertical-align:-2px" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d=" M12,5 C12,5 12,19 12,19" transform="matrix(0.7 -0.71 0.71 0.7 -0.97 16.14)"/><path d=" M5,12 C5,12 19,12 19,12" transform="matrix(-0.7 0.71 -0.71 -0.7 32.97 15.94)"/></svg>';
const OK_SVG = '<svg width="13" height="13" style="vertical-align:-2px" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d=" M8,-5.5 C8,-5.5 -3,5.5 -3,5.5 C-3,5.5 -8,0.5 -8,0.5" transform="matrix(1 0 0 1 16 15.5)"/></svg>';
const DOWNLOAD_SVG = '<svg width="14" height="14" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M21,15 C21,15 21,19 21,19 C21,20.11 20.11,21 19,21 C19,21 5,21 5,21 C3.9,21 3,20.11 3,19 C3,19 3,15 3,15" transform="matrix(1 0 0 1 4 4)"/><path d=" M12,15 C12,15 12,3 12,3 M7,10 C7,10 12,15 12,15 C12,15 17,10 17,10" transform="matrix(1 0 0 1 4 4)"/></svg>';
const WARN_SVG = '<svg width="14" height="14" style="vertical-align:-2px" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M-1.57,-7.95 C-1.57,-7.95 -10.04,6.19 -10.04,6.19 C-10.6,7.15 -10.27,8.37 -9.31,8.93 C-9.01,9.1 -8.68,9.19 -8.33,9.19 C-8.33,9.19 8.61,9.19 8.61,9.19 C9.71,9.18 10.6,8.28 10.58,7.17 C10.58,6.83 10.49,6.49 10.32,6.19 C10.32,6.19 1.85,-7.95 1.85,-7.95 C1.27,-8.89 0.04,-9.19 -0.9,-8.62 C-1.18,-8.45 -1.41,-8.22 -1.57,-7.95z" transform="matrix(1 0 0 1 15.86 15.81)"/><path d=" M12,9 C12,9 12,13 12,13" transform="matrix(1 0 0 1 4 4)"/><path d=" M12,17 C12,17 12,17 12,17z" transform="matrix(1 0 0 1 4 4)"/></svg>';
const SWAP_SVG = '<svg width="14" height="14" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d=" M11,-7.9 C11,-7.9 11,-1.9 11,-1.9 C11,-1.9 5,-1.9 5,-1.9 M-11,8.1 C-11,8.1 -11,2.1 -11,2.1 C-11,2.1 -5,2.1 -5,2.1 M-8.5,-2.9 C-6.8,-7.6 -1.7,-10 3,-8.4 C4.3,-8 5.4,-7.2 6.4,-6.3 C6.4,-6.3 11,-1.9 11,-1.9 M-11,2.1 C-11,2.1 -6.4,6.5 -6.4,6.5 C-2.9,10 2.8,10 6.3,6.5 C7.2,5.6 8,4.4 8.4,3.1" transform="matrix(1 0 0 1 16 15.9)"/></svg>';
const EYE_SVG = '<svg width="16" height="16" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M-11,0 C-11,0 -7,-8 0,-8 C7,-8 11,0 11,0 C11,0 7,8 0,8 C-7,8 -11,0 -11,0z" transform="matrix(1 0 0 1 16 16)"/><path d=" M0,-3 C1.66,-3 3,-1.66 3,0 C3,1.66 1.66,3 0,3 C-1.66,3 -3,1.66 -3,0 C-3,-1.66 -1.66,-3 0,-3z" transform="matrix(1 0 0 1 16 16)"/></svg>';   // 눈 = PIN 전체 표시 토글(.pin-eye · 설정/화면잠금 공유 · 운영자 260705) — on 상태는 색(accent)으로 표기(아이콘 교체 없음)
const ARROW_R_SVG = '<svg viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d=" M12,5 C12,5 19,12 19,12 C19,12 12,19 12,19 M5,12 C5,12 19,12 19,12" transform="matrix(1 0 0 1 4 4)"/></svg>';   // 수평 오른쪽 화살표 → = 문장 안 연결자(원문→요약 편향 흐름 .biasar · 유니코드 → 폐지 §🔒3-1 · 운영자 260705). 크기는 쓰는 쪽 CSS(.biasar svg)가 지정 · currentColor 상속(부모 색 따라감)
// chevron(캐러셀·페이저 이전/다음) = 표지판 도형이라 유니코드 ‹/› 문자 폐지 → SVG 픽토그램(폰트 글리프 편심 차단 · §🔒 3-1 · 분신술10 260704). 크기는 각 버튼 CSS(.feednav/.qpg-nav/.carnav svg)가 지정 = viewBox 24 대칭 정중앙.
const CHEV_L_SVG = '<svg viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d=" M3,6 C3,6 -3,0 -3,0 C-3,0 3,-6 3,-6" transform="matrix(1 0 0 1 16 16)"/></svg>';
const CHEV_R_SVG = '<svg viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d=" M3,6 C3,6 -3,0 -3,0 C-3,0 3,-6 3,-6" transform="matrix(-1 0 0 -1 16 16)"/></svg>';
const MERGE_SVG = '<svg viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M21,15 C21,15 21,19 21,19 C21,20.11 20.11,21 19,21 C19,21 5,21 5,21 C3.9,21 3,20.11 3,19 C3,19 3,15 3,15" transform="matrix(1 0 0 1 4 4)"/><path d=" M12,3 C12,3 12,15 12,15 M17,8 C17,8 12,3 12,3 C12,3 7,8 7,8" transform="matrix(1 0 0 1 4 4)"/></svg>';   // 병합(위 조각으로 합침) = 상단 바(대상)+위 화살표 — ly 자막 상세 편집기 조각 병합(260706). 크기는 쓰는 쪽 CSS 지정.
const FUNNEL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18l-7 8v5l-4 2v-7z"/></svg>';   // 깔때기(거르기) = ly 군더더기(필러 단어) 원클릭 빼기(평의회R2 E1 · 260706). 크기는 쓰는 쪽 CSS 지정.
const AI_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5l1.8 4.9 4.9 1.8-4.9 1.8L12 16.9l-1.8-4.9-4.9-1.8 4.9-1.8L12 3.5z"/><path d="M19.5 15l.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8.8-2.1z"/></svg>';   // AI 스파클(큰 별+작은 별) = 스튜디오 타이틀 픽토(운영자 260712 8차 "AI 픽토그램 + Image/Video Studio"). 크기·색은 쓰는 쪽 CSS 지정(#toolTitle .tt-ai 등).
const EDIT_SVG = '<svg width="14" height="14" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M16.5,3.5 C17.33,2.67 18.67,2.67 19.5,3.5 C20.33,4.33 20.33,5.67 19.5,6.5 C19.5,6.5 7,19 7,19 C7,19 3,20 3,20 C3,20 4,16 4,16 C4,16 16.5,3.5 16.5,3.5z" transform="matrix(1 0 0 1 4 4)"/><path d=" M12,20 C12,20 21,20 21,20" transform="matrix(1 0 0 1 4 4)"/></svg>';   // 연필 = 수정(index 카드 수정 · thumb 이전 제작 복원 · ly/edit 다시 입히기 — 구 index/thumb 인라인 2벌 → 260731 정본 승격 · thumb 사본은 경로 꼬리(12.5-12.5) 결손 드리프트 상태였음 = 통합으로 봉합)
const LAYERS_SVG = '<svg width="14" height="14" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M2,17 C2,17 12,22 12,22 C12,22 22,17 22,17" transform="matrix(1 0 0 1 4 4)"/><path d=" M2,12 C2,12 12,17 12,17 C12,17 22,12 22,12" transform="matrix(1 0 0 1 4 4)"/><path d=" M12,2 C12,2 2,7 2,7 C2,7 12,12 12,12 C12,12 22,7 22,7 C22,7 12,2 12,2z" transform="matrix(1 0 0 1 4 4)"/></svg>';   // 레이어(겹) = 오버레이 산출물 픽토(index '오버레이만 투명 PNG' + ly 자막 오버레이 영상 두 표면 공용 — 구 index 인라인 → 260731 정본 승격 · G_SVG 선례)
const RETRY_SVG = '<svg width="16" height="16" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M3.51,15 C4.84,18.78 8.51,21.22 12.52,20.99 C16.52,20.76 19.89,17.91 20.77,14.01 C21.66,10.1 19.86,6.07 16.35,4.13 C12.85,2.19 8.48,2.81 5.64,5.64 C5.64,5.64 1,10 1,10 M1,4 C1,4 1,10 1,10 C1,10 7,10 7,10" transform="matrix(1 0 0 1 4 4)"/></svg>';   // 재시도(반시계 화살) = 실패 잡 행 `.jretry` 픽토 — 값 = thumb.html 인라인 정본 exact 이관(신규 창작 0) · 승격 사유 = 번역 탭도 같은 실패 행을 그린다(운영자 260810 「'재시도'로 용어 변경」)
const TRASH_SVG = '<svg width="15" height="15" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M7,-8 C7,-8 7,6 7,6 C7,7.1 6.1,8 5,8 C5,8 -5,8 -5,8 C-6.1,8 -7,7.1 -7,6 C-7,6 -7,-8 -7,-8" transform="matrix(1 0 0 1 16 20.5)"/><path d=" M14,15 C14,15 14,21 14,21" transform="matrix(1 0 0 1 0 2.5)"/><path d=" M18,15 C18,15 18,21 18,21" transform="matrix(1 0 0 1 0 2.5)"/><path d=" M7,10 C7,10 9,10 9,10 C9,10 25,10 25,10" transform="matrix(1 0 0 1 0 1.5)"/><path d=" M-4,2 C-4,2 -4,0 -4,0 C-4,-1.1 -3.1,-2 -2,-2 C-2,-2 2,-2 2,-2 C3.1,-2 4,-1.1 4,0 C4,0 4,2 4,2" transform="matrix(1 0 0 1 16 9.5)"/></svg>';   // 휴지통(삭제) = 실패 잡 행 `.jdel` 픽토 — RETRY_SVG와 한 세트(그 행이 둘을 같이 단다)라 동반 승격 · 값 exact 이관
// 자막(캡션) = 판 + 글줄 2행(운영자 260802 "자막 있으면 자막 픽토그램 활성화") — 레포에 자막 픽토가 없어 신설(DOWNLOAD_SVG 짝).
//   문법 = LAYERS_SVG·EDIT_SVG 정본 그대로(14px · viewBox 24 · fill none · stroke currentColor · stroke-width 2 · round cap/join) = 다운로드 픽토와 나란히 놔도 같은 잉크 무게.
// 기사(참조 소재) — 접힌 신문 한 장. 형제 규격 그대로(viewBox 24 · stroke 2 · round · 14px 상자).
//   ⚠ 왜 새로 두나 = 기존 26종에 「글이 실린 종이」를 뜻하는 글리프가 없었다(SUBS 는 구독 카드,
//     PASTE 는 클립보드라 이미 붙여넣기 축이 쓴다). 인라인으로 그리면 아이콘이 갈리므로 정본에 둔다.
const NEWS_SVG = '<svg width="14" height="14" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M14,2 C14,2 14,8 14,8 C14,8 20,8 20,8 M14,2 C14,2 6,2 6,2 C4.89,2 4,2.9 4,4 C4,4 4,20 4,20 C4,21.11 4.89,22 6,22 C6,22 18,22 18,22 C19.11,22 20,21.11 20,20 C20,20 20,8 20,8 C20,8 14,2 14,2z" transform="matrix(1 0 0 1 4 4)"/><path d=" M8,17 C8,17 16,17 16,17" transform="matrix(1 0 0 1 4 4)"/><path d=" M8,13 C8,13 16,13 16,13" transform="matrix(1 0 0 1 4 4)"/><path d=" M8,9 C8,9 10,9 10,9" transform="matrix(1 0 0 1 4 4)"/></svg>';
const SUBS_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 14.5h5M15 14.5h2"/></svg>';
// G 광학 크기 = viewBox 24→20으로 좁혀 글리프 1.2배(운영자 260803 "살짝 키우는게 낫고") — 박스(12×12·15×15)는 무변경이라 레일 22/12 규격·히트존 무손상, 잉크만 커진다.
//   실측 근거(nm-svg 픽토 전수 · viewBox 24 기준 잉크 대각) = 스트로크형 22종 중앙값 23.43인데 G는 18.9로 혼자 작았다(fill 레터마크라 획이 얇다) → 1.2배 = 22.68로 그 결에 편입(나란히 서는 AI_SVG 24.32의 93%).
//   새 px·scale 창작 0 = viewBox 정수 한 값(2 2 20 20) · 중심 (12,12) 유지(G 잉크 중심 11.91 = Δ0.09 → 렌더 12px 환산 0.05px).
const G_SVG = '<svg viewBox="2 2 20 20" fill="currentColor"><path d="M12.04 10.96v2.32h3.84c-.16 1-1.15 2.9-3.84 2.9-2.31 0-4.2-1.91-4.2-4.27s1.89-4.27 4.2-4.27c1.32 0 2.2.56 2.7 1.05l1.84-1.77c-1.18-1.1-2.68-1.77-4.54-1.77-3.74 0-6.74 3-6.74 6.76s3 6.76 6.74 6.76c3.89 0 6.47-2.74 6.47-6.59 0-.44-.05-.78-.11-1.12l-6.36.04z"/></svg>';
// Gemini(모델) = 구글 G 레터마크 = 위 G_SVG 별칭(운영자 260727 "구글을 나타내는 G 그거 써서 표시" → 260803 재확인 「로고 써야되는데 · 기존에 이미 만들어놨음 · G라고 뉴스 요약한 부분에 보면 있음」 = 뉴스 카드 구글 이미지 검색 버튼(index gsrch)의 그 G).
//   ⚠ 별(스파클) 계열 회수 이력 2건 — ⓐ 260802 후보 ⑤ 쌍성(큰 별+작은 별)은 **GPT 자리 AI_SVG와 별 개수·배치가 겹쳐** 두 모델이 「쌍별」로 같이 읽혔다 ⓑ 260803 후보 ② 4점 별도 스파클 결이라 GPT 쪽으로 읽힌다(운영자 "지피티 이거아님").
//     → 판별 축 = **별이 아니라 레터마크**. 브랜드 자리에 별을 쓰면 어느 쪽이든 AI 스파클 관용구와 충돌한다.
//   값 복제 0 = 별칭 참조(G_SVG 한 곳만 고치면 두 표면 동시) · 두 표면 공용(제미나이 표기 + 구글 이미지 검색 버튼)은 260727 정본 그대로 복귀.
const GEMINI_SVG = G_SVG;

/* window 노출(운영자 260806 평의회7 실측 봉합) — classic script의 top-level `const`는 **window 프로퍼티가 되지 않는다**.
   같은 문서 인라인 스크립트는 bare 식별자로 잘 참조하지만, **분리 파일 모듈**(nm-rail.js 등)이 `window.X`로 찾으면 상시 undefined라
   폴백 인라인 SVG로 그려진다 = 아이콘 SSOT가 죽고 픽토가 갈린다(실측 = DOWNLOAD 밑변 `M5 21h14` 정본 vs 폴백 `M4 21h16`).
   ⚠ 값 복제 0 = 위 정본 상수를 그대로 내보내기만 한다(새 정의 금지) · 기존 bare 참조는 무영향. */
(function (g) {
  var EXPORTS = { NEWS_SVG: NEWS_SVG, CHECK_SVG: CHECK_SVG, COPY_SVG: COPY_SVG, PASTE_SVG: PASTE_SVG, ERASE_SVG: ERASE_SVG, DOWNLOAD_SVG: DOWNLOAD_SVG, EDIT_SVG: EDIT_SVG, RETRY_SVG: RETRY_SVG, TRASH_SVG: TRASH_SVG, WARN_SVG: WARN_SVG };
  Object.keys(EXPORTS).forEach(function (k) { if (g[k] === undefined) g[k] = EXPORTS[k]; });
})(typeof window !== 'undefined' ? window : this);

;
/* ── nm-ua.js ── */
// ═══ nm-ua.js — 아이콘 누름 재생(useAnimations · MIT) 단일정본 ═══════════════════
// 운영자 261024 「재생 좋은데? 가능한 재생 모두 적용 · 누를 때 색이 변하면서」 — 261023 평의회 기각(React·Lottie 런타임)을 운영자 명시로 뒤집음.
//   상속 = `<script src="nm-ua.js" defer></script>` 한 줄(nm-svg.js 뒤). 엔진·데이터 = vendor/useanimations/{player,icons}.js(MIT · 첫 유휴 때 미리 받음).
//   동작: 버튼·링크를 누르면(click 위임 1핸들러 · 캡처) 그 안 첫 아이콘이 아래 MAP 의 nm-svg 정본이면 같은 자리에 Lottie 판을 겹쳐
//   한 번 재생(색 = --accent) → 끝나면 걷고 원 아이콘 복귀. 원 아이콘은 재생 동안만 숨긴다.
//   판별 = svg 속 마크업이 nm-svg 상수와 같은가(크기·클래스 무관). 크기 = Lottie 판(32) ÷ nm 격자(24) 배 — useAnimations 는 24 아이콘을 32 판 가운데 둔다.
//   MAP = nm-svg 22종 ↔ useAnimations(운영자 261024 「C 다 적용」 = 아이콘 모양 자체를 useAnimations 쉬는 프레임으로 교체 → 재생 시작·끝이 원 아이콘과 같다).
//   짝 없는 것 = 자막(SUBS)·AI·G/GEMINI(브랜드) — 모양·재생 둘 다 종전. 깔때기(FUNNEL)는 마스크 모양이라 정적 교체만 빼고 재생은 한다.
//   빠지는 것: 동작 줄이기(prefers-reduced-motion) · 새 모듈 못 받음(종전 모션 그대로) · #menu-host(독 렌즈 모션) · .dlbtn(다운로드 표준 ✓ 팝) · 비활성 버튼.
//   복사 버튼은 ✓ 로 바뀌는 순간도 받는다(watchSwap · C1). 아이콘이 재생 중 사라지면(모달 닫힘·innerHTML 교체) 그 프레임에 걷는다. index 의 ic-* 모션(47-loadCardRevising)은 NMUA.has(svg) 면 안 붙는다(이중 모션 0).
(() => {
  'use strict';
  if (window.NMUA) return;
  const MAP = { CHECK: 'checkmark', OK: 'checkmark', COPY: 'copy', PASTE: 'clipboard', ERASE: 'delete', UNDO: 'cornerUpLeft', WAIT: 'clock', ERR: 'plusToX',
    DOWNLOAD: 'download2', WARN: 'alertTriangle', SWAP: 'refresh', EYE: 'visibility', ARROW_R: 'arrowRight', CHEV_L: 'chevronLeft', CHEV_R: 'chevronRight',
    MERGE: 'upload', FUNNEL: 'filter', EDIT: 'edit3', LAYERS: 'layers', RETRY: 'rotateCcw', TRASH: 'trash2', NEWS: 'fileText' };
  const TOGGLE = new Set(['copy', 'trash2', 'visibility']);   // 짧은 토글형(끝 프레임 = 열린 모양) = 앞으로 갔다 되돌아와 쉬는 모양에서 끝낸다
  // nm-svg.js 의 classic `const` 는 window 에 안 붙는다 → 같은 전역 렉시컬 범위에서 이름으로 읽는다(값 복제 0)
  const SRC = () => ({ CHECK: typeof CHECK_SVG === 'string' && CHECK_SVG, OK: typeof OK_SVG === 'string' && OK_SVG, COPY: typeof COPY_SVG === 'string' && COPY_SVG,
    PASTE: typeof PASTE_SVG === 'string' && PASTE_SVG, ERASE: typeof ERASE_SVG === 'string' && ERASE_SVG, UNDO: typeof UNDO_SVG === 'string' && UNDO_SVG,
    ERR: typeof ERR_SVG === 'string' && ERR_SVG, EYE: typeof EYE_SVG === 'string' && EYE_SVG, MERGE: typeof MERGE_SVG === 'string' && MERGE_SVG, NEWS: typeof NEWS_SVG === 'string' && NEWS_SVG, DOWNLOAD: typeof DOWNLOAD_SVG === 'string' && DOWNLOAD_SVG, WARN: typeof WARN_SVG === 'string' && WARN_SVG,
    SWAP: typeof SWAP_SVG === 'string' && SWAP_SVG, ARROW_R: typeof ARROW_R_SVG === 'string' && ARROW_R_SVG, CHEV_L: typeof CHEV_L_SVG === 'string' && CHEV_L_SVG,
    CHEV_R: typeof CHEV_R_SVG === 'string' && CHEV_R_SVG, FUNNEL: typeof FUNNEL_SVG === 'string' && FUNNEL_SVG, EDIT: typeof EDIT_SVG === 'string' && EDIT_SVG,
    LAYERS: typeof LAYERS_SVG === 'string' && LAYERS_SVG, RETRY: typeof RETRY_SVG === 'string' && RETRY_SVG, TRASH: typeof TRASH_SVG === 'string' && TRASH_SVG,
    WAIT: typeof WAIT_SVG === 'string' && WAIT_SVG });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const tpl = document.createElement('template');
  let sigs = null, lib = null, libP = null;
  const inner = s => { tpl.innerHTML = s; const v = tpl.content.firstElementChild; return v ? v.innerHTML : ''; };
  const nameOf = svg => {
    if (!sigs) { sigs = new Map(); const src = SRC(); for (const k in MAP) if (src[k]) sigs.set(inner(src[k]), MAP[k]); }
    return sigs.get(svg.innerHTML) || null;
  };
  const load = () => libP || (libP = Promise.all([import('./vendor/useanimations/player.js'), import('./vendor/useanimations/icons.js')])
    .then(([p, i]) => { lib = { loadAnimation: p.loadAnimation, icons: i.default }; injectCss(); return lib; })
    .catch(() => null));   // 못 받으면 조용히 종전 모션(has() = false)
  function injectCss() {
    if (document.getElementById('nm-ua-css')) return;
    const st = document.createElement('style'); st.id = 'nm-ua-css';
    // Lottie 잉크(진한 rgb 획·검정 채움) = currentColor · 흰 녹아웃 = 바탕(useAnimations styles.ts 문법 그대로)
    st.textContent = '.nm-ua{position:absolute;pointer-events:none;color:var(--accent);line-height:0}'
      + '.nm-ua svg{display:block;width:100%;height:100%;overflow:visible}'
      + '.nm-ua.sw path{stroke-width:var(--ua-sw)}'   // 원 아이콘 획이 2 가 아니면(체크 2.6 등) 재생도 같은 굵기
      + '.nm-ua path[stroke^="rgb"]:not([stroke="rgb(255,255,255)"]){stroke:currentColor}'
      + '.nm-ua path[fill="rgb(0,0,0)"]{fill:currentColor}'
      + '.nm-ua path[stroke="rgb(255,255,255)"]{stroke:var(--bg,Canvas)}'
      + '.nm-ua path[fill="rgb(255,255,255)"]{fill:var(--bg,Canvas)}';
    document.head.appendChild(st);
  }
  const has = svg => !!(lib && svg && !reduce.matches && nameOf(svg));
  // 겹칠 자리 = 원 아이콘 상자를 Lottie 판 배율만큼 넓힌 같은 중심(위치 기준 = 덮개의 실제 containing block)
  function place(box, svg, k) {
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const cb = box.offsetParent;
    let ox, oy;
    if (!cb || (cb === document.body && getComputedStyle(cb).position === 'static')) { ox = -scrollX; oy = -scrollY; }
    else { const c = cb.getBoundingClientRect(); ox = c.left + cb.clientLeft - cb.scrollLeft; oy = c.top + cb.clientTop - cb.scrollTop; }
    const w = r.width * k, h = r.height * k;
    box.style.width = w + 'px'; box.style.height = h + 'px';
    box.style.left = (r.left - ox - (w - r.width) / 2) + 'px'; box.style.top = (r.top - oy - (h - r.height) / 2) + 'px';
    return true;
  }
  const live = new WeakMap();   // svg → 진행 중 재생(같은 아이콘 연타 = 처음부터 다시)
  function play(svg) {
    if (!has(svg) || !svg.parentElement) return false;
    const name = nameOf(svg), A = lib.icons[name];
    if (!A) return false;
    const prev = live.get(svg); if (prev) prev();
    const box = document.createElement('span');
    box.className = 'nm-ua'; box.setAttribute('aria-hidden', 'true');
    const sw = svg.getAttribute('stroke-width'); if (sw && sw !== '2') { box.classList.add('sw'); box.style.setProperty('--ua-sw', sw); }
    svg.parentElement.appendChild(box);
    const k = (A.w || 24) / 24;
    if (!place(box, svg, k)) { box.remove(); return false; }
    let p;
    try { p = lib.loadAnimation({ container: box, animationData: A }); } catch (_) { box.remove(); return false; }
    const vis = svg.style.visibility;
    svg.style.visibility = 'hidden';
    let raf = 0, done = false, guard = 0;
    const end = () => { if (done) return; done = true; cancelAnimationFrame(raf); clearTimeout(guard); try { p.destroy(); } catch (_) {} box.remove(); if (svg.isConnected) svg.style.visibility = vis; live.delete(svg); };
    const watch = () => { if (!svg.isConnected || !box.isConnected || !place(box, svg, k)) { end(); return; } raf = requestAnimationFrame(watch); };
    live.set(svg, end);
    p.addEventListener('complete', () => {
      if (TOGGLE.has(name) && !p._back) { p._back = true; p.setDirection(-1); p.play(); return; }
      end();
    });
    p.goToAndStop(0); p.setDirection(1); p.play();
    raf = requestAnimationFrame(watch);
    guard = setTimeout(end, (A.op - A.ip) / (A.fr || 30) * 1000 * (TOGGLE.has(name) ? 2 : 1) * 2);   // 렌더 실패(player.fail = complete 안 옴) 안전판 = 제 길이의 2배 · raw-ok: 30 = Lottie fr 결측 폴백
    return true;
  }
  // 복사 → ✓ 바뀜(운영자 261024 C1 「복사 진행」 · 포트폴리오 contact-button 문법) — 복사 아이콘을 누른 그 버튼만 잠깐 지켜보다가
  // 페이지 코드가 아이콘을 갈아 끼우면(✓ 로, 다시 복사로) 새 아이콘에 .ic-swap(nm-shared.css · .5배·투명 → 제자리)을 붙인다.
  // 복사 코드는 화면마다 따로라(copyText·clipCopy·k/sb/edit… cp) 고치지 않고 여기 한 곳이 받는다. 원 아이콘으로 돌아오면 그만 본다.
  function watchSwap(b, orig) {
    if (b._nmSwap) return;
    const stop = () => { mo.disconnect(); clearTimeout(t); b._nmSwap = null; };
    const mo = new MutationObserver(() => {
      const s = b.querySelector('svg');
      if (!s || s === orig || s.closest('.nm-ua')) return;   // 원 아이콘 그대로(재생 덮개만 들어옴) = 아직 안 바뀜
      if (!s.classList.contains('ic-swap')) s.classList.add('ic-swap');
      if (s.innerHTML === orig.innerHTML) stop();   // 복사 아이콘으로 복귀 = 한 바퀴 끝
    });
    const t = setTimeout(stop, 10000);   // raw-ok: 안전 상한(✓ 유지 1.2~1.5s 뒤 복귀가 안 오는 화면 = 감시만 접음 · 1회성)
    mo.observe(b, { childList: true, subtree: true });
    b._nmSwap = stop;
  }
  document.addEventListener('click', e => {
    if (e.defaultPrevented) return;
    const b = e.target.closest('button,a[href],[role="button"]');
    if (!b || b.disabled || b.matches('.dlbtn') || b.closest('#menu-host')) return;
    const svg = b.querySelector('svg');
    if (!svg || svg.closest('.nm-ua')) return;
    if (!reduce.matches && nameOf(svg) === 'copy') watchSwap(b, svg);   // 재생 모듈 없이도 동작(CSS 만)
    if (lib) play(svg);
  }, true);
  const warm = () => { load(); };
  if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 4000 }); else setTimeout(warm, 1200);   // raw-ok: 유휴 미리받기 대기(첫 누름 지연 0 목적 · 1회성)
  window.NMUA = { has, play, load };
})();

;
/* ── modern-score-scale.js ── */
/* Presentation only: compare the current scored cards without changing their
   scores, ranking, or selection. The full list is the population, not a sample. */
(function(root){
  'use strict';
  const bands=Object.freeze([
    {key:'low',label:'낮음',min:-Infinity,max:-1,detail:'평균보다 1표준편차 넘게 낮음'},
    {key:'below',label:'평균 아래',min:-1,max:0,detail:'평균 − 1표준편차 이상, 평균 미만'},
    {key:'above',label:'평균 이상',min:0,max:1,detail:'평균 이상, 평균 + 1표준편차 미만'},
    {key:'high',label:'높음',min:1,max:2,detail:'평균 + 1표준편차 이상, 평균 + 2표준편차 미만'},
    {key:'peak',label:'매우 높음',min:2,max:Infinity,detail:'평균 + 2표준편차 이상'}
  ].map(Object.freeze));
  function create(values){
    let count=0,mean=0,m2=0;
    for(const value of values){
      if(typeof value!=='number'||!Number.isFinite(value))continue;
      count++;const delta=value-mean;mean+=delta/count;m2+=delta*(value-mean);
    }
    const deviation=count?Math.sqrt(Math.max(0,m2/count)):0;
    const comparable=count>=2&&deviation>0&&Number.isFinite(deviation);
    const boundaries=Object.freeze([mean-deviation,mean,mean+deviation,mean+2*deviation]);
    function classify(value){
      if(typeof value!=='number'||!Number.isFinite(value))return {key:'pending',label:'연결 대기',z:null};
      if(!comparable)return {key:'neutral',label:count<2?'비교 자료 부족':'모두 같은 점수',z:null};
      const z=(value-mean)/deviation;
      // Compare score boundaries directly: dividing again can turn exactly
      // mean - deviation into z=-1.0000000000000002 through rounding.
      const index=boundaries.findIndex(boundary=>value<boundary);
      return {...bands[index<0?bands.length-1:index],z};
    }
    return Object.freeze({count,mean:count?mean:null,deviation,boundaries,comparable,classify});
  }
  const api=Object.freeze({create,bands});
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ModernScoreScale=api;
})(typeof window==='object'?window:globalThis);

;
/* ── modern-gallery.js ── */
'use strict';
// Sideways drags on the photos (touch and mouse alike) move the track while there is a photo to
// move to; at either end the drag is not the photos' (the card turns instead: modern-home.js),
// so a swipe from the middle of the card works wherever the finger lands.
window.ModernGallery=(()=>{
 const positions=new Map();let cleanup=()=>{};
 function bind(paper,key){
  cleanup();const track=paper.querySelector('.gallery-track');if(!track)return;
  const slides=[...track.children],count=slides.length,output=paper.querySelector('.gallery-position');
  const controller=new AbortController(),options={signal:controller.signal};let drag=null;
  const clamp=n=>Math.max(0,Math.min(count-1,n));
  const index=()=>clamp(Math.round(track.scrollLeft/Math.max(1,track.clientWidth)));
  function remember(){
   const n=index();positions.set(key,n);track.dataset.index=String(n);
   if(output)output.textContent=(n+1)+' / '+count;
   slides.forEach((slide,i)=>slide.setAttribute('aria-label','사진 '+(i+1)+' / '+count));
  }
  function go(n,smooth=true){
   n=clamp(n);positions.set(key,n);
   track.scrollTo({left:n*track.clientWidth,behavior:smooth&&!matchMedia('(prefers-reduced-motion:reduce)').matches?'smooth':'instant'});
   if(!smooth)remember();
  }
  function release(cancel=false){
   if(!drag)return;const d=drag;drag=null;
   if(track.hasPointerCapture(d.id))track.releasePointerCapture(d.id);
   track.classList.remove('is-dragging');
   if(!d.active)return;
   const distance=d.x-d.lastX,step=Math.abs(distance)>Math.min(80,track.clientWidth*.2)?Math.sign(distance):0;
   const nearest=index();
   const target=step>0?Math.max(nearest,d.index+1):step<0?Math.min(nearest,d.index-1):d.index;
   go(cancel?d.index:target);
  }
  go(positions.get(key)||0,false);
  track.addEventListener('scroll',remember,{passive:true,...options});
  track.addEventListener('keydown',e=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
   e.preventDefault();e.stopPropagation();
   go(e.key==='Home'?0:e.key==='End'?count-1:index()+(e.key==='ArrowRight'?1:-1));
  },options);
  track.addEventListener('pointerdown',e=>{
   if(e.button!==0||count<2)return;
   drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,left:track.scrollLeft,index:index(),active:false};
  },options);
  track.addEventListener('pointermove',e=>{
   if(!drag||e.pointerId!==drag.id)return;
   if(e.buttons!==1){release(true);return}
   const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
   if(!drag.active){
    if(Math.abs(dy)>8&&Math.abs(dy)>Math.abs(dx)){drag=null;return}
    if(Math.abs(dx)<8)return;
    const at=index();
    if(dx>0?at===0:at===count-1){drag=null;return}
    // A touch is already captured by the track; capturing it again fires lostpointercapture,
    // which would cancel this drag on its first move.
    drag.active=true;track.classList.add('is-dragging');if(e.pointerType==='mouse')track.setPointerCapture(e.pointerId);track.focus({preventScroll:true});
   }
   drag.lastX=e.clientX;track.scrollLeft=drag.left-dx;e.preventDefault();
  },options);
  track.addEventListener('pointerup',()=>release(),options);
  window.addEventListener('pointerup',e=>{if(drag?.id===e.pointerId)release()},options);
  track.addEventListener('pointerleave',()=>{if(drag&&!drag.active)drag=null},options);
  track.addEventListener('pointercancel',()=>release(true),options);
  track.addEventListener('lostpointercapture',()=>release(true),options);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)release(true)},options);
  const observer=new ResizeObserver(()=>{release(true);go(positions.get(key)||0,false)});
  observer.observe(track);
  cleanup=()=>{remember();controller.abort();observer.disconnect();const d=drag;drag=null;if(d&&track.hasPointerCapture(d.id))track.releasePointerCapture(d.id);track.classList.remove('is-dragging');};
 }
 return{bind,cancel:()=>{cleanup();cleanup=()=>{}}};
})();

;
/* ── modern-card-content.js ── */
'use strict';
// The parent supplies verified source metadata; this file only renders it.
function articleSourceUrl(value){
  try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)&&!url.username&&!url.password?url.href:''}catch{return ''}
}
function articleSourceName(value){
  const name=srcName(value||'');
  return {'에스엘알클럽':'SLR','에펨코리아':'펨코','웃긴대학':'웃대','이토랜드':'이토'}[name]||name;
}
function articleMetadata(card){return card.meta&&typeof card.meta==='object'?card.meta:{}}
function articlePublisher(card,url){
  const meta=articleMetadata(card),safe=articleSourceUrl(url);if(!safe)return '';
  const item=card.items.find(it=>articleSourceUrl(it.url||it.link)===safe);
  const name=(safe===articleSourceUrl(meta.published?.sourceUrl)?meta.published.sourceName:'')||item?.src;
  return name?articleSourceName(name):new URL(safe).hostname.replace(/^www\./,'');
}
function articlePublisherSummary(card,url){
  const name=articlePublisher(card,url);if(!name)return '';
  const canonical=value=>articleSourceName(value).replace(/^X\s*[·・].*$/,'X');
  const primary=canonical(name),others=new Set(card.sites.map(canonical).filter(site=>site&&site!==primary));
  return primary+(others.size?' 외 +'+others.size:'');
}
// Relative age on the same ladder as the feed's relAge: minutes, then hours, then days.
function articleElapsed(minutes){
  if(minutes<1)return '방금';
  if(minutes<60)return minutes+'분 전';
  const hours=Math.floor(minutes/60);
  return hours<24?hours+'시간 전':Math.floor(hours/24)+'일 전';
}
function articleSchedule(card,now=Date.now()){
  const published=articleMetadata(card).published,timestamp=Date.parse(published?.at);
  const sourceUrl=articleSourceUrl(published?.sourceUrl)||card.urls[0],name=articlePublisherSummary(card,sourceUrl);
  // 「외 +N」의 +N = 숫자 상자로 따로 싼다(운영자 261022 «조선일보 외 +3 할 때 플러스 삼이 수평이 안 맞는디») — 아래 .pub-more 광학 보정
  const more=/^(.*) 외 \+(\d+)$/.exec(name);
  const publisher=name?'<span class="meta-chip article-publisher"><span class="ink-text">'+(more?esc(more[1])+' 외 <span class="pub-more">+'+more[2]+'</span>':esc(name))+'</span></span>':'';
  if(!Number.isFinite(timestamp)||timestamp>now)return publisher;
  const minutes=Math.floor((now-timestamp)/60000),when=new Date(timestamp);
  const ageHours=(now-timestamp)/3600000,band=ageHours<=3?'fresh':ageHours<=6?'recent':ageHours<=9?'aging':'stale';
  const seoulDay=value=>Math.floor((value+9*60*60*1000)/86400000),days=seoulDay(now)-seoulDay(timestamp);
  // Korean clock (오전/오후), Seoul time; older than yesterday carries its date. The dot before the
  // age spaces like the publisher dot (flex gap --sp-2 · chip gap --sp-1 + margin --sp-1), so the line reads in even steps.
  // Built by hand from Seoul time (UTC+9, no DST): ICU builds differ on the ko-KR day period (some print AM/PM).
  const seoul=new Date(timestamp+9*60*60*1000),hour=seoul.getUTCHours();
  const clock=(hour<12?'오전 ':'오후 ')+(hour%12||12)+':'+String(seoul.getUTCMinutes()).padStart(2,'0');
  const day=days===0?'오늘 ':days===1?'어제 ':(seoul.getUTCMonth()+1)+'월 '+seoul.getUTCDate()+'일 ';
  const absolute=seoul.getUTCFullYear()+'. '+(seoul.getUTCMonth()+1)+'. '+seoul.getUTCDate()+'. '+clock;
  const title=absolute+' · 한국 시간 · 확인한 원문의 등록 시각';
  return '<span class="meta-published" title="'+esc(title)+'"><span class="ink-text"><time datetime="'+esc(when.toISOString())+'" aria-label="'+esc(absolute)+'">'+day+clock+'</time><span aria-hidden="true" style="margin:0 var(--sp-2)">·</span><span class="publish-elapsed" data-age-band="'+band+'">'+articleElapsed(minutes)+'</span></span></span>'+publisher;
}
function articleMedia(card){
  const images=(Array.isArray(articleMetadata(card).images)?articleMetadata(card).images:[]).filter(it=>it&&articleSourceUrl(it.url));
  if(!images.length)return '';
  return '<figure class="article-media"><div class="gallery-track" tabindex="0" role="region" aria-label="관련 사진" data-count="'+images.length+'">'+images.map((media,i)=>'<div class="gallery-slide article-image-frame" role="group"><img src="'+esc(articleSourceUrl(media.url))+'" alt="'+esc(media.alt||card.title+' 관련 사진 '+(i+1))+'" draggable="false" decoding="async" referrerpolicy="no-referrer">'+(media.note?'<span class="article-image-note">'+esc(media.note)+'</span>':'')+'</div>').join('')+'</div>'+(images.length>1?'<span class="gallery-position" aria-hidden="true">1 / '+images.length+'</span>':'')+'</figure>';
}
// One row per (publisher, normalised title). The same story under one name at several
// addresses (re-sends, mobile links, cluster members) is one row: "N건" when every address is
// the same site, "등 N곳" when N sites carry it (not "외 +N": the publisher chip already uses
// that for other publishers). A row whose title is the card's own title keeps only the
// publisher and the link; the card already shows that title.
function articleSite(value){
  try{
    const parts=new URL(value).hostname.replace(/^(?:www|m|mobile)\./,'').split('.');
    const twoLevel=parts.length>2&&parts[parts.length-1].length===2&&/^(?:co|or|go|ne|ac|re|pe|com|net|org)$/.test(parts[parts.length-2]);
    return parts.slice(twoLevel?-3:-2).join('.');
  }catch{return ''}
}
function articleTitleKey(value){
  return String(value||'').normalize('NFKC').replace(/^(?:\s*\[[^\]]{1,12}\])+/u,'').replace(/[^\p{L}\p{N}]+/gu,'').toLowerCase();
}
function articleSourceGroups(card){
  const meta=articleMetadata(card),items=[...card.items];
  for(const media of Array.isArray(meta.images)?meta.images:[]){
    const url=articleSourceUrl(media?.sourceUrl);if(url&&!items.some(it=>articleSourceUrl(it.url||it.link)===url))items.unshift({src:media.sourceName,title:card.title,url});
  }
  for(const url of card.urls)if(!items.some(it=>articleSourceUrl(it.url||it.link)===url))items.push({url,title:card.title});
  const seen=new Set(),groups=new Map();
  for(const it of items){
    if(!it||typeof it!=='object')continue;
    const url=articleSourceUrl(it.url||it.link),title=String(it.title||card.title||'').trim();
    const address=url||String(it.src||'')+'|'+title;
    if(!address||seen.has(address))continue;seen.add(address);
    const name=articleSourceName(it.src)||(url?new URL(url).hostname.replace(/^www\./,''):'');
    const key=name.toLowerCase()+'|'+articleTitleKey(title),group=groups.get(key);
    if(!group){groups.set(key,{name,title,url,count:1,sites:new Set(url?[articleSite(url)]:[])});continue;}
    group.count++;if(url){group.sites.add(articleSite(url));group.url=group.url||url;}
  }
  return [...groups.values()];
}
function articleSources(card){
  const cardTitle=articleTitleKey(card.title);
  const rows=articleSourceGroups(card).map(group=>{
    const label=group.name+(group.count<2?'':group.sites.size>1?' 등 '+group.sites.size+'곳':' '+group.count+'건');
    const note=group.count<2?'':' title="'+esc(group.sites.size>1?'같은 제목 '+group.count+'건 · '+group.sites.size+'개 매체':'같은 매체·같은 제목 '+group.count+'건')+'"';
    const own=articleTitleKey(group.title)===cardTitle,text=own?label:group.title;
    if(!text)return '';
    // 한 줄 = [매체] [제목…](운영자 261022 «매체랑 제목 가로로 한 줄 · 라인 높이 고정 · 제목은 한계점에선 … · 공유 버튼(↗) 없어도 됨»)
    const link=group.url?'<a href="'+esc(group.url)+'" target="_blank" rel="noopener noreferrer"><span class="st">'+esc(text)+'</span></a>':'<p><span class="st">'+esc(text)+'</span></p>';
    return '<div class="source-story"'+note+'>'+(!own&&label?'<small>'+esc(label)+'</small>':'')+link+'</div>';
  }).join('');
  return rows?'<section class="article-sources" aria-label="관련 소스"><div class="source-stories">'+rows+'</div></section>':'';
}
// card.score_int = 정수로 찍음(앱 홈 카드판 = 뉴스 알고리즘 사건 점수 score100 · 형 11-11 08:53 「그거 점수마다 보여야 함 한 알고리즘 대로」 · 없으면 종전 소수 둘째 자리)
function buildCardContents(card,scoreTier,picked,position,total){
  const hasScore=Number.isFinite(card.score),meta=articleMetadata(card),text=value=>typeof value==='string'?value.trim():'';
  const reason=!card.needs_cause_news?text(card.x_why):'',description=text(meta.description),schedule=articleSchedule(card);
  const signals=Array.isArray(card.signals)?card.signals.filter(s=>typeof s==='string'&&s):[];   // 이슈 근거 = 수집이 센 숫자 그대로(modern-data issueSignals · 운영자 10-25 «왜 이슈인지»)
  const details=(reason?'<p class="article-excerpt article-reason"><strong>· 화제 유발 원인 :</strong> '+esc(reason)+'</p>':'')+(signals.length?'<p class="article-excerpt article-signals"><strong>· 이슈 근거 :</strong> '+esc(signals.join(' · '))+'</p>':'')+(description?'<p class="article-excerpt article-description"><strong>· 내용 :</strong> '+esc(description)+'</p>':'');
  const badges=(card.surge?'<span>급상승</span>':'')+(card.followup_dev?'<span>후속</span>':'');
  // 틈·촉 픽(형 11-03 09:57 「그 메인카드에 틈이나, 점수 반영된 이슈가 카드로 안뜨는거 같은데」) = 점수 옆 칩 「틈 픽」 · 키워드는 칩 이름표(modern-data project row.pick)
  const pickBy=card.pick&&typeof card.pick.by==='string'?card.pick.by.trim():'',pickKw=card.pick&&typeof card.pick.keyword==='string'?card.pick.keyword.trim():'';
  // 칩 앞 = 그 봇 프로필 얼굴(형 11-03 12:08 「촉 픽 틈 픽 각각 얼굴 붙게 해주라 프로필 얼굴」 · 얼굴 = viewer/office/<자리>.webp · 모르는 봇 = 얼굴 없이 글만)
  const PICK_FACE={'촉':'chok','틈':'teum'},face=PICK_FACE[pickBy]||'';
  // 자리 = 시각·몇 시간 전·매체 줄 맨 오른쪽(형 11-03 17:10 「틈, 촉 얼굴 테두리 정상적으로 라임색으로 씌워서 저기로 보내주라 블릿 그대로 유지하고 간격 유지하고 매체명 우측으로」 · 「기자 느낌으로 하면될듯」 = 기사 끝 기자 이름 자리) · 앞 점·간격 = 매체 앞 점과 같은 규칙(.meta-chip+.meta-chip)
  const pick=pickBy?'<span class="meta-chip article-pick'+(face?' has-face':'')+'" title="'+esc(pickBy+' 픽'+(pickKw?' · '+pickKw:''))+'">'+(face?'<img class="article-pick-face" src="/office/'+face+'.webp" alt="'+esc(pickBy+' 픽')+'" width="20" height="20" decoding="async">':'<span class="ink-text">'+esc(pickBy)+' 픽</span>')+'</span>':'';   // 얼굴 있으면 글자 없이(형 12:09 「얼굴 나오고 틈 픽 은 일단 글자 없이」)
  return '<div class="article-topline"><div class="score score-lead'+(hasScore?'':' is-pending')+'" data-score-tier="'+scoreTier.key+'"><strong'+(hasScore?'':' aria-label="점수 없음"')+'>'+(hasScore?(card.score_int?String(Math.round(card.score)):card.score.toFixed(2)):'—')+'</strong></div>'+
    '<span class="article-rank" aria-label="전체 '+total+'개 중 '+position+'번째"><b>'+String(position).padStart(2,'0')+'</b> / '+String(total).padStart(2,'0')+'</span></div>'+
    // 머리(시각·제목·내용·사진·표식)는 .article-lead 한 덩이(운영자 261022 «아래 출처 목록 자리를 유관 이미지로»): 사진이 있으면
    // 그 덩이가 본문 높이를 채우고 사진이 남는 높이를 받는다 · 출처 목록은 사진 아래(본문 스크롤) — modern-card-content.css.
    '<div class="article-body" tabindex="0" aria-label="기사 내용"><div class="article-lead">'+(schedule||pick?'<div class="article-schedule">'+schedule+pick+'</div>':'')+
    '<h2 id="article-title" class="article-title">'+esc(card.title)+'</h2>'+(details?'<section class="article-details" aria-label="세부 내용">'+details+'</section>':'')+
    articleMedia(card)+(badges?'<p class="article-label article-status">'+badges+'</p>':'')+'</div>'+articleSources(card)+'</div>';
}
function bindCardMedia(paper){
  for(const img of paper.querySelectorAll('.article-media img')){
    const fail=()=>{
      const frame=img.closest('.gallery-slide'),figure=img.closest('.article-media');if(!frame||!figure)return;
      ModernGallery.cancel();frame.remove();const track=figure.querySelector('.gallery-track'),count=track.children.length;
      if(!count)figure.remove();else{track.dataset.count=String(count);if(count===1)figure.querySelector('.gallery-position')?.remove();ModernGallery.bind(paper,paper.dataset.key);}
      window.alignArticleInk?.(paper);
    };
    img.addEventListener('error',fail,{once:true});if(img.complete&&!img.naturalWidth)fail();
  }
  ModernGallery.bind(paper,paper.dataset.key);
  window.alignArticleInk?.(paper);
}

;
/* ── modern-home.js ── */
'use strict';
// All article and PICK state comes from the parent editor. No local picks or fixture data.
const $ = selector => document.querySelector(selector);
const icons={LAYERS:LAYERS_SVG,NEWS:NEWS_SVG,CHECK:CHECK_SVG,WAIT:WAIT_SVG,EDIT:EDIT_SVG,SUBS:SUBS_SVG,EYE:EYE_SVG,CHEV_L:CHEV_L_SVG,ARROW_R:ARROW_R_SVG,RETRY:RETRY_SVG,ERR:ERR_SVG,WARN:WARN_SVG};
function iconize(root=document){root.querySelectorAll('[data-icon]').forEach(el=>{if(el.dataset.iconRendered!==el.dataset.icon||!el.querySelector('svg')){el.innerHTML=icons[el.dataset.icon]||'';el.dataset.iconRendered=el.dataset.icon;}el.setAttribute('aria-hidden','true')});window.ModernMorphIcons?.refresh();}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const srcName=s=>String(s).replace(/^tbs:/,'').replace('editor:candidates(RSS)','뉴스').replace('editor:social_candidates','커뮤니티').replace('editor:x_top10','X').replace('editor:sns.xspike','X').replace('editor:sns.gtrends','구글트렌드').replace('editor:sns.namu','나무위키').replace('editor:sns.signal','시그널').replace('editor:sns.youtube_news','유튜브 뉴스').replace('editor:sns.shorts','유튜브 쇼츠').replace('editor:sns.youtube','유튜브');

const CHANNEL='nomute-modern-home';
let cards=[],scoreScale=ModernScoreScale.create([]),snapshotVersion=-1,suspended=false;
let loadStatus={state:'loading',message:'현재 기사 목록을 확인하고 있어.'};
let receivedRanking=false,userChoseCard=false;
const requestedKeys=new Set();
const state={index:0,values:{depth:45,ambient:30,motion:35}};
let cardMoving=false;
const cardMotionPreference=matchMedia('(prefers-reduced-motion:reduce)');
const currentCards=()=>cards;
const currentCard=()=>cards[state.index];
const paper=$('#article'),deckEl=$('#deck'),peekEl=$('#peek'),fanEl=$('.deck-fan'),plates=[...fanEl.children],actionsEl=$('.reader-actions');
function send(type,detail={}){if(window.parent!==window)window.parent.postMessage({channel:CHANNEL,type,...detail},location.origin);}
function canPick(card){return !!card&&!suspended&&(card.pickState===null||card.pickState==='failed')&&!requestedKeys.has(card.key);}
function picked(card){return card?.pickState==='picking'||card?.pickState==='settled';}
function updatePickControl(){
 const card=currentCard(),input=$('#pick');input.disabled=!canPick(card);input.checked=picked(card);
 const pending=card?.pickState==='picking'||card?.pickState==='submitting'||!!card&&requestedKeys.has(card.key);
 input.setAttribute('aria-busy',String(pending));
 // The control's name says the state in a word (the circle shows the check only), so a voice
 // user can say what it answers to (WCAG 2.5.3); the longer wording is its description.
 const word=card?.pickState==='settled'?'PICK 완료':card?.pickState==='failed'?'다시 PICK':pending?'PICK 중':'PICK',text=$('#pick-text');
 if(text.textContent!==word)text.textContent=word;
 input.setAttribute('aria-label',word);
 input.title=card?.pickState==='failed'?'PICK 실패, 다시 시도':card?.pickState==='settled'?'PICK 완료':pending?'PICK 진행 중':'이 기사 PICK';
 input.closest('.pick-control').dataset.pick=card?.pickState==='settled'?'settled':card?.pickState==='failed'?'failed':pending?'pending':'none';
}
// Home status: the parent's status.message is the wording (ModernData.homeStatus), said once.
// kind tells an outside failure (server, network, an old or missing file) from broken data.
const KINDS={external:'연결 문제',code:'데이터 문제'};
const statusKind=status=>Object.hasOwn(KINDS,status?.kind)?status.kind:'';
let refreshAsked=0;
const refreshBusy=()=>!!loadStatus.refreshing||!!refreshAsked;
function setText(el,text){if(el.textContent!==text)el.textContent=text;}
function setIcon(el,name){if(el.dataset.icon!==name)el.dataset.icon=name;}
function renderEmpty(){
 const s=loadStatus,view=s.state==='loading'?'loading':s.state==='error'?'error':'empty',kind=view==='error'?statusKind(s):'',empty=$('#empty');
 empty.dataset.state=view;if(kind)empty.dataset.kind=kind;else delete empty.dataset.kind;
 setIcon($('#empty-icon'),view==='error'?'WARN':'NEWS');
 const tag=$('#empty-kind');tag.hidden=!kind;setText(tag,kind?KINDS[kind]:'');
 setText($('#empty-title'),view==='loading'?'기사를 불러오는 중이야':view==='error'?'기사를 불러오지 못했어':'표시할 기사가 없어');
 setText($('#empty-message'),s.message||(view==='loading'?'현재 기사 목록을 확인하고 있어.':view==='error'?'기사 목록을 받지 못했어.':'현재 기사 목록이 비어 있어.'));
 const retry=$('#refresh-home');retry.hidden=view==='loading';retry.disabled=refreshBusy();retry.setAttribute('aria-busy',String(refreshBusy()));
}
// With a card on screen a stale or failed list is a banner on the card's lower edge: the reason
// once, then one retry pill. It rides inside the card, so a swipe or a double tap that starts on
// its words still reaches the card (only the pill is a control), and the card body gains the
// banner's height as scroll room. Rebuilding the card's markup detaches it; it is put back here.
const statusBox=$('#home-status'),inStatus=selector=>statusBox.querySelector(selector);
function bannerSpace(){
 const h=statusBox.hidden||!statusBox.isConnected?0:statusBox.offsetHeight+(parseFloat(getComputedStyle(statusBox).bottom)||0);
 document.documentElement.style.setProperty('--home-banner-space',Math.ceil(h)+'px');
}
function renderStatus(card){
 const s=loadStatus,warn=!!card&&['stale','error'].includes(s.state);
 statusBox.hidden=!warn;
 if(!warn){bannerSpace();return;}
 if(statusBox.parentNode!==paper)paper.append(statusBox);
 const kind=statusKind(s);if(kind)statusBox.dataset.kind=kind;else delete statusBox.dataset.kind;
 const label=inStatus('#home-status-kind');label.hidden=!kind;
 if(kind&&label.dataset.kind!==kind){label.dataset.kind=kind;label.innerHTML='<span data-icon="WARN"></span>';}
 const text=inStatus('#home-status-text'),line=(kind?KINDS[kind]+' · ':'')+(s.message||'기사 목록을 새로 확인하지 못했어.');
 if(text.dataset.line!==line){text.dataset.line=line;text.innerHTML=(kind?'<strong>'+esc(KINDS[kind])+'</strong> ':'')+esc(s.message||'기사 목록을 새로 확인하지 못했어.');}
 const retry=inStatus('#home-retry');retry.disabled=refreshBusy();retry.setAttribute('aria-busy',String(refreshBusy()));
}
// Measured after layout (never inside render, which runs in input handlers during a turn).
new ResizeObserver(bannerSpace).observe(statusBox);
// Tokens read once per use from :root, so the home motion stays on the shared scale.
const token=name=>getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const tokenMs=name=>{const v=token(name);return /ms$/.test(v)?parseFloat(v):parseFloat(v)*1000||0;};
// Skeleton → content (H): when the loading silhouette was on screen it fades over the arriving
// card (opacity only). The session's first card still introduces itself with W1's entrance
// under it; a later card (after a retry) rises 8 px instead. One motion per element, never both.
function skeletonShown(){
 const empty=$('#empty');
 return !empty.hidden&&empty.dataset.state==='loading'&&!document.hidden&&canMoveCards()&&Number(getComputedStyle(empty).opacity)>.5;
}
function captureSkeleton(){
 const empty=$('#empty'),copy=empty.querySelector('.home-skeleton').cloneNode(true);
 copy.classList.add('skeleton-exit');copy.inert=true;
 Object.assign(copy.style,{width:empty.offsetWidth+'px',height:empty.offsetHeight+'px'});
 return copy;
}
function revealCard(copy){
 const duration=tokenMs('--modern-dur-reveal'),easing=token('--modern-ease-reveal')||'ease-out',shift=token('--modern-reveal-shift')||'0px';
 deckEl.append(copy);
 copy.animate([{opacity:1},{opacity:0}],{duration,easing,fill:'forwards'}).finished.then(()=>copy.remove(),()=>copy.remove());
 if(entranceAt){playEntrance();return;}
 for(const el of [paper.querySelector('.article-topline'),paper.querySelector('.article-body')])
  if(el)el.animate([{opacity:0,transform:'translateY('+shift+')'},{opacity:1,transform:'none'}],{duration,easing,fill:'backwards'});
}
// A settled PICK opens its news summary in the parent (the parent re-checks key, version and state).
function openCard(){
 const card=currentCard();if(!card||suspended||card.pickState!=='settled')return false;
 send('open',{key:card.key,version:snapshotVersion});return true;
}
function render(animate=false,direction=1){
 const list=currentCards();state.index=Math.max(0,Math.min(state.index,list.length-1));const card=list[state.index];
 const oldPaper=paper,previousKey=oldPaper.dataset.key,bodyScroll=oldPaper.querySelector('.article-body')?.scrollTop||0;
 const changed=previousKey!==card?.key,turning=animate&&!!card&&!oldPaper.hidden&&changed&&canMoveCards();
 // Focus inside the old card's markup would fall to <body> when it is replaced.
 const focused=document.activeElement,refocus=!!focused&&focused!==oldPaper&&(oldPaper.contains(focused)||focused===$('#next'));
 // A data refresh of the same card keeps a drag or a turn in flight; only a different card resets them.
 if(changed)cancelCardGesture();
 if(turning){settleFadeThrough();settleTurn();}
 const outgoing=turning?captureCard():null;
 if(changed&&!turning)cancelCardMotion();
 if(outgoing){cardMotion(true);if(entranceAt>0)entranceAt=0;}
 const reveal=!!card&&oldPaper.hidden&&!outgoing&&skeletonShown()?captureSkeleton():null;
 ModernGallery.cancel();liteGlass();
 $('#next').disabled=!card||state.index===list.length-1||suspended;updatePickControl();
 // No card, nothing to PICK or turn: the row steps out of sight (its place is kept, nothing moves).
 actionsEl.toggleAttribute('data-idle',!card);
 $('#empty').hidden=!!card;oldPaper.hidden=!card;peekEl.hidden=!card||state.index===list.length-1;layFan(list,card);
 oldPaper.removeAttribute('aria-labelledby');oldPaper.setAttribute('aria-keyshortcuts','ArrowRight ArrowLeft P Enter Space');
 if(!card){
  oldPaper.setAttribute('aria-label','표시할 기사가 없어');delete oldPaper.dataset.key;oldPaper.innerHTML='';
  renderEmpty();
 }else{
  const isPicked=picked(card),status=card.pickState==='settled'?'PICK 완료':card.pickState==='picking'||card.pickState==='submitting'?'PICK 진행 중':card.pickState==='failed'?'PICK 실패, 다시 시도할 수 있어':'PICK 선택 안 됨';
  oldPaper.dataset.key=card.key;oldPaper.dataset.pickState=card.pickState||'none';oldPaper.classList.toggle('picked',isPicked);oldPaper.classList.toggle('long-title',card.title.length>32);
  oldPaper.setAttribute('aria-label',card.title+'. '+status+'. 오른쪽으로 밀면 다음 기사, 왼쪽으로 밀면 이전 기사. '+(card.pickState==='settled'?'누르면 뉴스 요약을 열어.':'빠르게 두 번 누르거나 P로 PICK.'));
  oldPaper.innerHTML=buildCardContents(card,scoreScale.classify(card.score),isPicked,state.index+1,list.length);
  // A new body already starts at the top; writing 0 would force a layout inside the input handler.
  if(previousKey===card.key&&bodyScroll)oldPaper.querySelector('.article-body').scrollTop=bodyScroll;bindCardMedia(oldPaper);
  const next=list[state.index+1];if(next)peekEl.innerHTML='<i class="caption-dot" data-score-tier="'+scoreScale.classify(next.score).key+'"></i><span>NEXT '+String(state.index+2).padStart(2,'0')+'</span><strong>'+esc(next.title)+'</strong>';
 }
 renderStatus(card);
 if(!changed&&card){continueFadeThrough();riseTurnText();}
 // The boot fade-in belongs to the first load only; a later retry shows its skeleton at once.
 if(card||loadStatus.state!=='loading')$('#empty').classList.remove('is-booting');
 iconize();if(outgoing)turnCard(outgoing,direction);
 if(card&&refocus&&document.hasFocus()&&(!focused.isConnected||focused.disabled||!oldPaper.contains(focused)&&focused!==$('#next')))oldPaper.focus({preventScroll:true});
 if(reveal)revealCard(reveal);else if(card&&!outgoing)playEntrance();
}
function canMoveCards(){return !suspended&&!cardMotionPreference.matches&&state.values.motion>0}
const motionAmount=()=>canMoveCards()?state.values.motion/100:0;

/* card-physics:start — pure and DOM-free; tests/modern-card-motion.test.mjs runs this block in a VM. */
const CardPhysics=(()=>{
 // SwiftUI-style (response in s, damping ratio) or (stiffness, ratio) to unit-mass k and c.
 const spring=(response,damping)=>({k:(2*Math.PI/response)**2,c:4*Math.PI*damping/response});
 const byStiffness=(k,damping)=>({k,c:2*damping*Math.sqrt(k)});
 const SPRINGS={
  // Snap back: the reference "snappy" stiffness (k 420, response .31 s) at Material 3's
  // standard spatial damping ratio .9, so a released card settles without a visible wobble.
  settle:byStiffness(420,.9),
  // Incoming card and stack hand-off: the reference "smooth" spring (react-spring default, ζ≈1).
  smooth:{k:170,c:26},
  // Grab lift and the stack following the finger: Material 3 fast spatial stiffness, critically damped.
  quick:byStiffness(1400,1),
 };
 // iOS rubber band (UIScrollView): resistance grows with distance; c .55, d = card size.
 const RUBBER=.55,LIFT=.012;
 const rubber=(x,d,c=RUBBER)=>x<0?-rubber(-x,d,c):x*d*c/(d+c*x);
 const unrubber=(y,d,c=RUBBER)=>y<0?-unrubber(-y,d,c):y*d/(c*(d-Math.min(y,d*.999)));
 // Semi-implicit Euler in substeps of at most 4 ms: stable for these springs and the same
 // curve at 60, 120 or 144 Hz. Returns false once the channel has come to rest.
 function step(ch,dt){
  const n=Math.max(1,Math.ceil(dt/.004)),h=dt/n,{k,c}=ch.sp;
  for(let i=0;i<n;i++){ch.v+=(-k*(ch.x-ch.to)-c*ch.v)*h;ch.x+=ch.v*h}
  if(Math.abs(ch.x-ch.to)<ch.eps&&Math.abs(ch.v)<ch.eps*10){ch.x=ch.to;ch.v=0;return false}
  return true;
 }
 // Release velocity in px/s as Android's VelocityTracker (LSQ2, its default): a quadratic least
 // squares fit over the last 100 ms of (coalesced) moves, read at the last sample, so a finger
 // still speeding up as it lets go hands over its final speed (the reference card keeps 17 px a
 // frame at the release); a pointer that rested 40 ms before lifting has no velocity.
 function velocity(samples,upTime){
  const last=samples[samples.length-1];
  if(!last||upTime-last.t>40)return {x:0,y:0};
  const pts=samples.filter(p=>last.t-p.t<=100),n=pts.length;
  if(n<2||last.t-pts[0].t<4)return {x:0,y:0};
  let mt=0,mx=0,my=0;for(const p of pts){mt+=p.t/n;mx+=p.x/n;my+=p.y/n}
  let tt=0,tx=0,ty=0;for(const p of pts){const d=p.t-mt;tt+=d*d;tx+=d*(p.x-mx);ty+=d*(p.y-my)}
  const linear={x:tx/tt*1000,y:ty/tt*1000};
  if(n<3)return linear;
  // Quadratic fit in time centred on the last sample: v(last) = b of a + b·u + c·u².
  let s1=0,s2=0,s3=0,s4=0,sx=0,sux=0,su2x=0,sy=0,suy=0,su2y=0;
  for(const p of pts){const u=p.t-last.t,u2=u*u;s1+=u;s2+=u2;s3+=u2*u;s4+=u2*u2;sx+=p.x;sux+=u*p.x;su2x+=u2*p.x;sy+=p.y;suy+=u*p.y;su2y+=u2*p.y;}
  const det=n*(s2*s4-s3*s3)-s1*(s1*s4-s3*s2)+s2*(s1*s3-s2*s2);
  if(Math.abs(det)<1e-9)return linear;
  const b=(Sx,Sux,Su2x)=>(n*(Sux*s4-s3*Su2x)-Sx*(s1*s4-s3*s2)+s2*(s1*Su2x-Sux*s2))/det*1000;
  return {x:b(sx,sux,su2x),y:b(sy,suy,su2y)};
 }
 // Turn on a flick (24 px and 300 px/s the same way) or past the distance threshold,
 // unless the finger is flicking back toward the centre. Returns -1, 0 or 1.
 function decide(x,vx,w){
  const dir=Math.sign(x),fast=Math.abs(vx)>=300;
  if(!dir||fast&&Math.sign(vx)!==dir)return 0;
  return Math.abs(x)>Math.min(80,w*.2)||fast&&Math.abs(x)>=24?dir:0;
 }
 // A thrown card keeps its release speed, then speeds up (critically damped, τ 15 ms, so the
 // acceleration starts at zero) to the reference's 7.2 W/s — 17 → 23.5 → 32 → 36.6 px a frame
 // after a 3.3 W/s release, gone in ≈150 ms. Buttons and keys throw that release (3.3 W/s).
 // The leaving card is an opaque sheet over the arriving one and stays opaque until it has
 // cleared it (half a margin past its own width covers its tilt); only then does it fade, over
 // about 0.1 s of travel at cruise. A sheet fading while it still lay over the arriving card let
 // both articles read at once (operator 10-19: no frame with two text layers).
 const EXIT={speed:7.2,tau:.015,yTau:.2,margin:64,virtual:.46,fade:.1};
 function exitBody(x,y,vx,vy,w,dir){
  const cruise=dir*EXIT.speed*w,far=x*dir,cap=Math.abs(cruise)*.6,from=Math.max(far,w)+EXIT.margin/2;
  return {x,y,vx,ax:0,vy:Math.max(-cap,Math.min(cap,vy)),w,dir,cruise,from,end:from+Math.abs(cruise)*EXIT.fade};
 }
 function exitStep(b,dt){
  const n=Math.max(1,Math.ceil(dt/.004)),h=dt/n,k=1/EXIT.tau**2,c=2/EXIT.tau,ey=Math.exp(-h/EXIT.yTau);
  for(let i=0;i<n;i++){b.ax+=(k*(b.cruise-b.vx)-c*b.ax)*h;b.vx+=b.ax*h;b.x+=b.vx*h;b.y+=b.vy*h;b.vy*=ey;}
  return b.x*b.dir<b.end;
 }
 const smoothstep=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/Math.max(1e-6,b-a)));return t*t*(3-2*t)};
 const exitOpacity=b=>1-smoothstep(b.from,b.end,b.x*b.dir);
 // Dragging toward the next card raises it and the paper beneath; full advance at 70% of a width.
 const advance=(x,w)=>x>0&&w>0?Math.min(1,x/(w*.7)):0;
 const stackPose=a=>({peekY:-10*a,peekS:1+.02*a,backY:-6*a,backS:1+.015*a});
 // Deck (operator 10-19 reference video, measured frame by frame at 60 fps — SPEC-60fps): the next
 // card waits right behind the top one, .886 of its size with its centre .12 W lower (bottom
 // edges nearly together), hidden while the top card rests; one more behind it, .06 smaller and
 // .06 W lower. Slot k's pose (0 = front), linear between whole slots; slot 3 is the fade.
 const STACK={s1:.114,s2:.06,dy1:.12,dy2:.06,reveal:.08};
 function stackSlot(k){
  const a=Math.max(0,Math.min(3,k)),one=Math.min(a,1),more=Math.max(0,a-1);
  return {s:1-STACK.s1*one-STACK.s2*more,dy:STACK.dy1*one+STACK.dy2*more,o:a<=2?1:Math.max(0,3-a)};
 }
 // The next card comes forward from the release itself (operator 10-19: no wait between the
 // throw and the next card; the reference waited 8 frames): size and place close in
 // as two exponentials — a quick quarter (τ 25 ms) and the rest at τ 130 ms (fit to the size and
 // place columns: .95 at 67 ms, .974 at 167, .988 at 267, .995 at 367) — from .886 and +.12 W
 // down, .014 W toward the side it was thrown from; done at a .001 gap. Its words come in from 15% contrast and an 8 px blur on the measured
 // curves (FOCUS: ms → opacity, blur px) from the same moment. The leaving card is opaque and on
 // top all the way out, so the two never read through each other.
 const ARRIVE={quick:.266,tauQuick:25,tau:130,gap:.0015,dx:.0502,dxRise:.717};
 // Sideways it first drifts a little further out (+.0142 W → +.0275 W at 67 ms), then home with the rest.
 const arriveX=t=>ARRIVE.dx*(Math.exp(-t/ARRIVE.tau)-ARRIVE.dxRise*Math.exp(-t/ARRIVE.tauQuick));
 const arrive=t=>ARRIVE.quick*Math.exp(-t/ARRIVE.tauQuick)+(1-ARRIVE.quick)*Math.exp(-t/ARRIVE.tau);
 const FOCUS=[[0,.15,8],[33,.18,6],[50,.22,4],[67,.23,2],[133,.47,1.5],[200,.65,1.2],[267,.8,1],[300,.84,.4],[333,.89,0],[400,.96,0],[467,1,0]];
  // The held and thrown card turns in its plane, clockwise to the right: 8.6° per width of travel,
 // at most 6° (reference: top edge −0.8° at −.107 W … −5.7° at −.66 W, about 6° as it leaves).
 // pivot() is kept for the grab point; the turn itself is about the card's centre.
 const pivot=(y,h)=>{const d=1-2*Math.max(0,Math.min(1,y/Math.max(1,h)));return (d<0?-1:1)*(.3+.7*Math.abs(d))};
 const ROT={perWidth:8.6,max:6};
 const tilt=(x,w,p,m)=>w>0&&m>0?Math.max(-ROT.max,Math.min(ROT.max,x/w*ROT.perWidth)):0;
 return {SPRINGS,RUBBER,LIFT,EXIT,STACK,ROT,ARRIVE,FOCUS,arrive,arriveX,stackSlot,spring,byStiffness,rubber,unrubber,step,velocity,decide,exitBody,exitStep,exitOpacity,advance,stackPose,pivot,tilt};
})();
/* card-physics:end */

// One rAF loop writes every moving surface once per frame, with transform and opacity only.
const P=CardPhysics,SP=P.SPRINGS;
const channel=(x,sp,eps)=>({x,v:0,to:x,sp,eps});
const front={x:channel(0,SP.settle,.1),y:channel(0,SP.settle,.1),lift:channel(0,SP.quick,.0005),
 ey:channel(0,SP.smooth,.1),es:channel(1,SP.smooth,.0005),eo:channel(1,SP.smooth,.002),held:false,pivot:.6,w:0,h:0};
// The caption under the card rises with a drag toward the next card (stackPose); the stack behind
// steps forward one slot as the next card arrives (shift 1 → 0).
const stack={peekY:channel(0,SP.smooth,.05),peekS:channel(1,SP.smooth,.0005),peekO:channel(1,SP.smooth,.002),shift:0,shown:false,w:0,h:0};
const frontChannels=[front.lift,front.ey,front.es,front.eo],stackShape=[stack.peekY,stack.peekS],stackFade=[stack.peekO];
const restValues=new Map([[front.x,0],[front.y,0],[front.lift,0],[front.ey,0],[front.es,1],[front.eo,1],[stack.peekY,0],[stack.peekS,1],[stack.peekO,1]]);
let turnText=null,arrival=null,exits=[],fades=[],incoming=null,motionFrameId=0,lastMotionFrame=0,wokeAt=0,releaseFling=null;
const liftEl=document.createElement('div');liftEl.className='card-lift';liftEl.setAttribute('aria-hidden','true');liftEl.hidden=true;deckEl.insertBefore(liftEl,paper);
const written=new WeakMap();
function put(el,transform,opacity){
 const last=written.get(el)||{};
 if(last.t!==transform){el.style.transform=transform;last.t=transform}
 if(last.o!==opacity){el.style.opacity=opacity;last.o=opacity}
 written.set(el,last);
}
const cardPose=(x,y,r,s)=>'translate3d('+x.toFixed(2)+'px,'+y.toFixed(2)+'px,0) rotate('+r.toFixed(3)+'deg) scale('+s.toFixed(4)+')';
const stackTransform=(y,s)=>Math.abs(y)<.01&&Math.abs(s-1)<1e-4?'':'translate3d(0,'+y.toFixed(2)+'px,0) scale('+s.toFixed(4)+')';
const fade=o=>o>.999?'':Math.max(0,o).toFixed(3);
const stackPlates=plates;
// The stack behind: two blank sheets (the cards themselves stay one surface each), drawn only
// when there is another card and only once the top card moves off them, so the glass card at
// rest is never darkened from behind. The deck's perspective is two card widths (render only).
function layFan(list,card){
 stack.shown=!!card&&list.length>1;
 const at=card?list.indexOf(card):-1;
 stackPlates.forEach((p,i)=>{
  const next=at<0?null:list[at+1+i];p.hidden=!next;
  // The card waiting behind shows its own words out of focus (reference: σ 8 px, 15% contrast).
  if(!next){if(p.dataset.key){p.textContent='';delete p.dataset.key;}return;}
  if(p.dataset.key===next.key)return;p.dataset.key=next.key;
  const face=document.createElement('div');face.className='article-card plate-face';
  face.innerHTML=buildCardContents(next,scoreScale.classify(next.score),picked(next),at+2+i,list.length);
  for(const el of face.querySelectorAll('[id]'))el.removeAttribute('id');
  // 못 불러온 사진은 앞 카드(bindCardMedia)와 같이 지운다 = 뒤 장도 깨진 그림 대신 종전 배치(운영자 261022 카드 사진).
  for(const el of face.querySelectorAll('img')){el.loading='lazy';el.addEventListener('error',()=>{const figure=el.closest('.article-media');el.closest('.gallery-slide')?.remove();if(figure&&!figure.querySelector('img'))figure.remove();},{once:true});}
  p.replaceChildren(face);
 });
 stack.w=paper.offsetWidth||deckEl.offsetWidth;stack.h=paper.offsetHeight||stack.w*1.45;
 writeFan();
}
function writeFan(){
 if(!stack.shown)return;
 const w=stack.w||front.w||1,h=stack.h||w*1.45,reveal=arrival||exits.length?1:Math.min(1,Math.abs(front.x.x)/(w*P.STACK.reveal));
 // Sheets scale from their bottom edge: centre offset dy·W minus what the scaling already moved.
 // While the top card is glass (held, or snapping back) a sheet is drawn only beside it, never
 // under it: its backdrop blur would carry the sheet into the card's face.
 const clip=!arrival&&!exits.length&&Math.abs(front.x.x)>.5?topCardEdge(w,h,front.x.x>0):null;
 stackPlates.forEach((p,i)=>{const g=P.stackSlot(i+1+stack.shift),ty=g.dy*w-(1-g.s)*h/2;put(p,'translate3d(0,'+ty.toFixed(2)+'px,0) scale('+g.s.toFixed(4)+')',fade(g.o*reveal));
  const c=clip?plateClip(clip,g.s,ty,w,h):'';if(p.style.clipPath!==c)p.style.clipPath=c;});
}
// The top card's trailing edge (left when it moves right) as a line in the deck's coordinates.
function topCardEdge(w,h,right){
 const x=front.x.x,y=front.y.x+front.ey.x,s=front.es.x*(1+P.LIFT*front.lift.x),r=P.tilt(x,w,front.pivot,motionAmount())*Math.PI/180;
 const cos=Math.cos(r),sin=Math.sin(r),ex=right?-w/2:w/2,pt=ey=>({x:w/2+x+s*(ex*cos-ey*sin),y:h/2+y+s*(ex*sin+ey*cos)});
 return {a:pt(-h),b:pt(h),keep:right?-1:1};
}
// The part of a sheet (scaled s from its bottom centre, moved ty) on the kept side of that line, in
// its own coordinates.
function plateClip(edge,s,ty,w,h){
 const local=q=>({x:w/2+(q.x-w/2)/s,y:h+(q.y-h-ty)/s}),a=local(edge.a),b=local(edge.b);
 const side=q=>((b.x-a.x)*(q.y-a.y)-(b.y-a.y)*(q.x-a.x))*edge.keep*Math.sign(b.y-a.y||1);
 const box=[{x:0,y:0},{x:w,y:0},{x:w,y:h},{x:0,y:h}],out=[];
 for(let i=0;i<4;i++){
  const p=box[i],q=box[(i+1)%4],sp=-side(p),sq=-side(q);
  if(sp>=0)out.push(p);
  if((sp>=0)!==(sq>=0)){const t=sp/(sp-sq);out.push({x:p.x+(q.x-p.x)*t,y:p.y+(q.y-p.y)*t});}
 }
 return out.length?'polygon('+out.map(q=>q.x.toFixed(1)+'px '+q.y.toFixed(1)+'px').join(',')+')':'inset(50%)';
}
// While a card is dragged or turning, the parent's ambient scene holds still so the moving
// glass card is the only thing the GPU redraws every frame. It is held from the press that
// may become a drag, so the first drag frames do not share the GPU; a tap or a vertical
// scroll releases it at once.
let sceneHeld=false;
function holdScene(){const held=cardMoving||!!swipe;if(held!==sceneHeld){sceneHeld=held;send('motion',{active:held});}}
// Without a capable GPU (the parent scene's low tier) every frame of a moving card re-blurs
// the scene behind its glass, frames of 100 ms or more, and switching the blur off only while
// moving costs a full software repaint at each start. There, and after a motion that kept
// missing frames, the cards use a solid fill matched to the blurred glass. A real GPU keeps it.
let slowGlass=false,slowFrames=0,motionFrames=0;
function liteGlass(){
 let low=false;try{low=parent!==window&&parent.document.getElementById('ambient')?.dataset.quality==='low'}catch{}
 deckEl.classList.toggle('glass-lite',slowGlass||low);
}
function cardMotion(active){
 if(active===cardMoving)return;cardMoving=active;slowFrames=0;motionFrames=0;liteGlass();
 deckEl.classList.toggle('is-turning',active);deckEl.dataset.turning=String(active);holdScene();
}
function wakeMotion(){
 if(motionFrameId)return;
 wokeAt=performance.now();motionFrameId=requestAnimationFrame(motionFrame);cardMotion(true);
}
// The next card was waiting in slot 1 (blank, its words hidden); on the first frame of the throw
// it comes forward and its words come into focus.
function startArrival(now){
 if(!arrival||arrival.t0!==null)return;
 arrival.t0=now;
 if(turnText)turnText.start=now;
}
// The new words follow the measured focus curve frame by frame (the animations stay paused and
// this loop sets their time), never held back while the thrown card is still leaving.
function driveFocus(now){
 if(!turnText||turnText.start===null)return;
 turnText.time=Math.max(0,now-turnText.start);
 for(const a of turnText.anims)if(a.playState!=='finished')a.currentTime=Math.min(turnText.time,turnText.end);
}
function settleTurn(){
 for(const b of exits)b.el.remove();exits=[];
 if(arrival){finishArrival();Object.assign(front.x,{x:0,v:0,to:0});}
 writeMotion(motionAmount());
}
function finishArrival(){
 if(!arrival)return;arrival=null;stack.shift=0;
 for(const c of [front.es,front.ey])Object.assign(c,{x:c.to,v:0});
 if(turnText)for(const a of turnText.anims)a.finish();turnText=null;
 paper.classList.remove('is-arriving');
}
function stepArrival(now){
 if(!arrival)return false;
 startArrival(now);
 driveFocus(now);
 const t=now-arrival.t0,e=P.arrive(t);
 if(e*(1-arrival.s0)<P.ARRIVE.gap){finishArrival();Object.assign(front.x,{x:0,v:0,to:0});return false;}
 front.es.x=1-(1-arrival.s0)*e;front.ey.x=arrival.y0*e;front.x.x=arrival.x0*P.arriveX(t)/P.arriveX(0);front.x.v=0;stack.shift=e;
 return true;
}
function motionFrame(now){
 motionFrameId=0;
 // Real elapsed time keeps the release speed exact; a loop waking from rest starts gently.
 // Two frames in, layer promotion is done; three more missed frames in one motion mean the GPU can't keep up.
 if(++motionFrames>2&&lastMotionFrame&&now-lastMotionFrame>34&&++slowFrames>=3&&!slowGlass){slowGlass=true;liteGlass();}
 const dt=Math.min(1/30,Math.max(1/240,(now-(lastMotionFrame||wokeAt))/1000));lastMotionFrame=now;
 if(front.held&&!swipe?.active)front.held=false;
 const m=motionAmount();let moving=front.held;
 // A card grabbed while it is still arriving is the card in hand at once.
 if(front.held&&arrival)finishArrival();
 if(front.held&&swipe?.active){const p=dragPoint(swipe,swipe.cx,swipe.cy);front.x.x=p.x;front.y.x=p.y;}
 else{if(P.step(front.x,dt))moving=true;if(P.step(front.y,dt))moving=true;}
 if(stepArrival(now))moving=true;
 else for(const c of frontChannels)if(P.step(c,dt))moving=true;
 if(arrival)for(const c of [front.lift,front.eo])if(P.step(c,dt))moving=true;
 const drag=front.held&&m?front.x.x:0;
 const pose=P.stackPose(P.advance(drag,front.w)),follow=front.held?SP.quick:SP.smooth;
 stack.peekY.to=pose.peekY;stack.peekS.to=pose.peekS;
 for(const c of stackShape){c.sp=follow;if(P.step(c,dt))moving=true;}
 for(const c of stackFade)if(P.step(c,dt))moving=true;
 exits=exits.filter(b=>P.exitStep(b,dt)||(b.el.remove(),false));
 fades=fades.filter(f=>f.anim.playState==='running'||(f.el.remove(),f.done?.(),false));
 writeMotion(m);
 if(moving||exits.length||fades.length||arrival)motionFrameId=requestAnimationFrame(motionFrame);
 else{lastMotionFrame=0;writeFan();cardMotion(!!swipe?.active);}
}
function writeMotion(m){
 const x=front.x.x,y=front.y.x+front.ey.x,s=front.es.x*(1+P.LIFT*front.lift.x),o=front.eo.x,w=front.w;
 const still=!front.held&&!x&&Math.abs(y)<.01&&Math.abs(s-1)<1e-4&&o>.999;
 const transform=still?'':cardPose(x,y,arrival?0:P.tilt(x,w,front.pivot,m),s);
 put(paper,transform,fade(o));
 if(still&&paper.style.transformOrigin){paper.style.transformOrigin='';liftEl.style.transformOrigin='';front.pivot=.6;}
 const lift=front.lift.x*o;
 if(lift>.002){if(liftEl.hidden)liftEl.hidden=false;put(liftEl,transform||'none',lift.toFixed(3));}else if(!liftEl.hidden)liftEl.hidden=true;
 put(peekEl,stackTransform(stack.peekY.x,stack.peekS.x),fade(stack.peekO.x));
 for(const b of exits)put(b.el,cardPose(b.x,b.y,P.tilt(b.x,b.w,b.pivot,m),b.s),(b.o*P.exitOpacity(b)).toFixed(3));
 writeFan();
}
function cancelCardMotion(){
 if(motionFrameId)cancelAnimationFrame(motionFrameId);motionFrameId=0;lastMotionFrame=0;releaseFling=null;
 for(const item of [...exits,...fades])item.el.remove();exits=[];fades=[];incoming=null;
 finishArrival();turnText=null;
 for(const [c,rest] of restValues){c.x=rest;c.v=0;c.to=rest;}
 front.held=false;front.pivot=.6;paper.style.transformOrigin='';liftEl.style.transformOrigin='';liftEl.hidden=true;
 put(paper,'','');put(peekEl,'','');writeFan();
 cardMotion(!!swipe?.active);
}
function captureCard(){
 const copy=paper.cloneNode(true);
 // Duplicate markup is decorative; shared title classes preserve its typography.
 for(const el of [copy,...copy.querySelectorAll('*')]){
  el.removeAttribute('id');el.removeAttribute('aria-labelledby');el.removeAttribute('aria-describedby');
 }
 copy.inert=true;copy.setAttribute('aria-hidden','true');copy.removeAttribute('tabindex');
 copy.classList.remove('is-dragging','is-arriving');copy.classList.add('card-exit');
 let peek=null;
 if(!peekEl.hidden){peek=peekEl.cloneNode(true);peek.removeAttribute('id');peek.classList.add('peek-exit');}
 return {copy,peek,left:deckEl.getBoundingClientRect().left+paper.offsetLeft,width:paper.offsetWidth,height:paper.offsetHeight,
  scrollTop:paper.querySelector('.article-body')?.scrollTop||0,galleryLeft:paper.querySelector('.gallery-track')?.scrollLeft||0};
}
// Deck turn (operator 10-19 reference video): the top card is thrown toward the swipe — a
// finger's release speed exactly, a button or key a virtual flick — turning about its vertical
// axis as it goes; the next card waits in the stack right behind it and comes forward from the
// throw's first frame. Either swipe direction throws the top card that way (right = next,
// left = previous, the W1 contract); the card that comes forward is the one asked for.
// The new words come into focus while the old card is still leaving (no wait between them).
function turnCard(outgoing,direction){
 const dir=direction<0?-1:direction>0?1:0,copy=outgoing.copy,w=outgoing.width,h=outgoing.height,fling=releaseFling;releaseFling=null;
 copy.style.width=w+'px';copy.style.height=h+'px';
 deckEl.append(copy);const body=copy.querySelector('.article-body');if(body&&outgoing.scrollTop)body.scrollTop=outgoing.scrollTop;const gallery=copy.querySelector('.gallery-track');if(gallery&&outgoing.galleryLeft)gallery.scrollLeft=outgoing.galleryLeft;
 const y=front.y.x+front.ey.x,s=front.es.x*(1+P.LIFT*front.lift.x);
 if(!dir){replaceCard(outgoing);return;}
 // Rapid turns: render() has already ended the turn in flight (settleTurn), so at most one card
 // is ever in flight and it always carries its words.
 for(const b of exits)b.el.remove();exits=[];finishArrival();
 const virtual=P.EXIT.virtual*P.EXIT.speed*w;
 const vx=fling?fling.x:dir*Math.max(dir*front.x.v,virtual),vy=fling?fling.y:front.y.v;
 const lead=Object.assign(P.exitBody(front.x.x,y,vx,vy,w,dir),{el:copy,pivot:front.pivot,s,o:front.eo.x});
 // Gone (removed) once its turned outline has left the view; opaque until then, words and all.
 const off=(dir>0?window.innerWidth-outgoing.left:outgoing.left+w)+h*.06+4;lead.from=lead.end=Math.max(off,w);
 exits.push(lead);
 copy.style.transformOrigin=paper.style.transformOrigin||'';
 // The new card stands in slot 1 of the stack: .886, centre .12 W lower (the card scales about its
 // centre), .014 W toward the side the old card was thrown from.
 const g=P.stackSlot(1),x0=-dir*P.arriveX(0)*w;
 for(const c of [front.y,front.lift])Object.assign(c,{x:0,v:0,to:0});Object.assign(front.x,{x:x0,v:0,to:x0});
 Object.assign(front.es,{x:g.s,v:0,to:1});Object.assign(front.ey,{x:g.dy*w,v:0,to:0});Object.assign(front.eo,{x:1,v:0,to:1});
 front.held=false;front.pivot=.6;front.w=w;front.h=h;paper.style.transformOrigin='50% 50%';liftEl.style.transformOrigin='';liftEl.hidden=true;
 paper.classList.add('is-arriving');stack.shift=1;
 arrival={s0:g.s,y0:front.ey.x,x0,t0:null};
 turnText={start:null,time:0,end:P.FOCUS[P.FOCUS.length-1][0],anims:[],els:new WeakSet()};riseTurnText();
 // Caption: the old line blurs away (120 ms), then the new one comes into focus (280 ms).
 if(outgoing.peek){peekEl.after(outgoing.peek);const a=outgoing.peek.animate([{opacity:1,filter:'blur(0px)'},{opacity:0,filter:'blur(4px)'}],{duration:120,easing:'ease-in',fill:'forwards'});fades.push({el:outgoing.peek,anim:a});}
 if(!peekEl.hidden)for(const el of peekEl.children)el.animate([{opacity:0,filter:'blur(4px)'},{opacity:1,filter:'blur(0px)'}],{duration:280,delay:outgoing.peek?120:0,easing:'cubic-bezier(.215,.61,.355,1)',fill:'backwards'});
 for(const c of [stack.peekY,stack.peekS])Object.assign(c,{to:restValues.get(c)});
 writeMotion(motionAmount());wakeMotion();
}
// The arriving card's words: hidden while it waits in the stack, then into focus from the moment
// it comes forward (the opaque leaving card stays on top of them). A data refresh of the same card
// mid-turn puts its new markup on the same clock.
function riseTurnText(){
 if(!turnText)return;
 // Out of focus at 15% while it waits (as the sheet showed it), then the measured contrast and blur
 // curves; linear between keyframes.
 // On a touch phone the GPU re-blurs every frame of an animated filter; there the words come
 // into focus on the contrast curve alone (the waiting plate keeps its fixed blur), at full rate.
 const lite=matchMedia('(pointer: coarse)').matches;
 const end=P.FOCUS[P.FOCUS.length-1][0],frames=P.FOCUS.map(([t,o,b])=>lite?{offset:t/end,opacity:o}:{offset:t/end,opacity:o,filter:'blur('+b+'px)'});
 for(const el of paper.children){
  if(turnText.els.has(el))continue;turnText.els.add(el);
  const a=el.animate(frames,{duration:end,easing:'linear',fill:'backwards'});
  a.pause();a.currentTime=Math.min(turnText.time,turnText.end);
  turnText.anims.push(a);
 }
}
// Replaced by new data rather than turned by the reader (the first ranking, a removed row): a
// fade-through in place. The old card's words fade out first (--modern-dur-exit on
// --modern-ease-exit) on a copy that keeps the card's own glass, with the new card hidden under
// it; when the words are gone the copy and the new card change places in one frame (the same
// surface, nothing to see), and the new words come in (the rest of --modern-dur-size on
// --modern-ease-out, rising --modern-reveal-shift). Two articles never show at once (a cross-fade
// drew both) and the surface never changes. The strip under the card does the same with its next
// title. 320 ms in all.
function wordsIn(nodes){
 for(const el of nodes){
  if(!el||incoming.els.has(el))continue;
  const a=el.animate(incoming.rise,incoming.into);a.startTime=incoming.start;incoming.els.add(el);incoming.anims.push(a);
 }
}
function replaceCard(outgoing){
 const out=tokenMs('--modern-dur-exit'),total=Math.max(out,tokenMs('--modern-dur-size')),start=document.timeline.currentTime;
 incoming={start,end:start+total,els:new WeakSet(),anims:[],peek:false,keep:null,
  out:{duration:out,easing:token('--modern-ease-exit')||'ease-in',fill:'forwards'},
  into:{duration:total-out,delay:out,easing:token('--modern-ease-out')||'ease-out',fill:'backwards'},
  rise:[{opacity:0,transform:'translateY('+(token('--modern-reveal-shift')||'0px')+')'},{opacity:1,transform:'none'}]};
 // A copy leaves word by word (or, with nothing taking its place, as a whole); when it is done it
 // is removed and what it covered is shown again in the same frame (done).
 const leave=(el,{whole=false,stay=null,done=null}={})=>{
  let last=null;
  for(const part of whole?[el]:[...el.children].filter(c=>c!==stay)){last=part.animate([{opacity:whole?Number(el.style.opacity||1):1},{opacity:0}],incoming.out);last.startTime=start;}
  if(!last){last=el.animate([{opacity:1},{opacity:1}],incoming.out);last.startTime=start;}
  fades.push({el,anim:last,done});
 };
 const hide=(channel,el)=>{const o=channel.x;Object.assign(channel,{x:0,v:0,to:0});put(el,el.style.transform,'0');return ()=>Object.assign(channel,{x:o,v:0,to:1});};
 // A status banner that says the same before and after stays as it is through the swap.
 const copy=outgoing.copy,banner=copy.querySelector(':scope>.home-status');
 const same=!!banner&&!statusBox.hidden&&statusBox.parentNode===paper&&banner.textContent===statusBox.textContent;
 if(same)incoming.keep=statusBox;
 copy.classList.add('is-swap');
 leave(copy,{stay:same?banner:null,done:hide(front.eo,paper)});
 wordsIn([...paper.children].filter(el=>el!==incoming.keep));
 const peek=outgoing.peek;
 if(peek){
  peekEl.after(peek);
  if(!peekEl.hidden&&peek.textContent===peekEl.textContent)peek.remove();
  else if(peekEl.hidden)leave(peek,{whole:true});
  else{leave(peek,{done:hide(stack.peekO,peekEl)});incoming.peek=true;wordsIn([...peekEl.children]);}
 }else if(!peekEl.hidden)wordsIn([peekEl]);
 wakeMotion();
}
// The same card re-rendered mid fade-through (another snapshot right behind) keeps the timing.
function continueFadeThrough(){
 if(!incoming)return;
 if(document.timeline.currentTime>=incoming.end){incoming=null;return;}
 wordsIn([...paper.children].filter(el=>el!==incoming.keep));
 if(incoming.peek&&!peekEl.hidden)wordsIn([...peekEl.children]);
}
// A new turn or replacement first completes the last one, so the copy it takes is what shows.
function settleFadeThrough(){
 if(!fades.length&&!incoming)return;
 for(const f of fades){f.el.remove();f.done?.();}fades=[];
 if(incoming){for(const a of incoming.anims)a.finish();incoming=null;}
 put(paper,paper.style.transform,fade(front.eo.x));put(peekEl,peekEl.style.transform,fade(stack.peekO.x));
}
// Only the session's first card introduces itself (620 ms, 80 ms stagger, top to bottom);
// moving between cards uses the physics above. -1 = not yet shown, 0 = done, else start time.
const ENTRANCE={duration:620,stagger:80,easing:'cubic-bezier(.22,1,.36,1)'};
let entranceAt=-1;const entering=new WeakSet();
function playEntrance(){
 if(!entranceAt||paper.hidden||suspended||document.hidden)return;
 if(!canMoveCards()){entranceAt=0;return;}
 const now=performance.now(),first=entranceAt<0;if(first)entranceAt=now;
 const elapsed=now-entranceAt,body=paper.querySelector('.article-body');
 // 머리 덩이(.article-lead · 운영자 261022 카드 사진)는 감싸기만 한다 = 그 안의 조각이 종전처럼 차례로 들어온다.
 const groups=[[paper.querySelector('.article-topline')],[paper.querySelector('.article-schedule')],[paper.querySelector('.article-title')],
  body?[...body.querySelectorAll(':scope>*,:scope>.article-lead>*')].filter(el=>!el.matches('.article-lead,.article-schedule,.article-title')):[],first?[...document.querySelectorAll('.reader-actions>*')]:[]];
 if(elapsed>=ENTRANCE.duration+ENTRANCE.stagger*(groups.length-1)){entranceAt=0;return;}
 // A refresh of the same card mid-entrance continues the remaining time on the new markup.
 groups.forEach((group,i)=>{for(const el of group)if(el&&!entering.has(el)&&entering.add(el))el.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],
  {duration:ENTRANCE.duration,delay:i*ENTRANCE.stagger-elapsed,easing:ENTRANCE.easing,fill:'backwards'});});
}
function announceCard(){
 const card=currentCard(),out=$('#announcement');
 if(card&&out)out.textContent='기사 '+(state.index+1)+' / '+cards.length+'. '+card.title;
}

function navigate(delta){
 if(suspended)return false;
 const target=Math.max(0,Math.min(cards.length-1,state.index+delta));if(target===state.index)return false;
 userChoseCard=true;state.index=target;render(true,delta);announceCard();return true;
}
function act(){
 const card=currentCard();if(!canPick(card)){updatePickControl();return;}
 userChoseCard=true;requestedKeys.add(card.key);updatePickControl();send('pick',{key:card.key,version:snapshotVersion});
}
let swipe=null,suppressClickUntil=0,tapCandidate=null,lastCardTap=null,tapBlockedUntil=0,multiplePointers=false;
const cardPointers=new Set();
const cardTapLimits={duration:250,interval:350,travel:8,separation:24};
const interactiveCardTarget=target=>target instanceof Element&&!!target.closest('button,a,input,textarea,select,summary,[contenteditable],[role="button"],[role="link"]');
// Links in the card still start a swipe: past 12 px sideways the drag wins and the link's
// click is cancelled, while a short tap opens the link as before. Controls never swipe.
const swipeBlockedTarget=target=>target instanceof Element&&!!target.closest('button,input,textarea,select,summary,[contenteditable],[role="button"]');
function selectedCardText(){const selection=window.getSelection();return !!selection&&!selection.isCollapsed&&selection.toString().trim().length>0;}
function invalidateCardTap(block=false){
 tapCandidate=null;lastCardTap=null;
 if(block)tapBlockedUntil=Math.max(tapBlockedUntil,performance.now()+350);
}
function pointerPositionUnchanged(tap,e){return Math.hypot(e.clientX-tap.x,e.clientY-tap.y)<=cardTapLimits.travel;}
function tapSurfaceUnchanged(tap){
 return Math.abs((paper.querySelector('.article-body')?.scrollTop||0)-tap.bodyTop)<1&&
  Math.abs((paper.querySelector('.gallery-track')?.scrollLeft||0)-tap.photoLeft)<1&&
  Math.abs(window.scrollX-tap.pageX)<1&&Math.abs(window.scrollY-tap.pageY)<1;
}
function finishCardTap(e,cancel=false){
 const tap=tapCandidate;
 if(!tap||tap.id!==e.pointerId)return;
 tapCandidate=null;
 const now=performance.now();
 if(cancel||tap.moved||now-tap.started>cardTapLimits.duration||now<tapBlockedUntil||now<suppressClickUntil||
    multiplePointers||!pointerPositionUnchanged(tap,e)||!tapSurfaceUnchanged(tap)||selectedCardText()||
    !paper.contains(e.target)||interactiveCardTarget(e.target)||tap.key!==currentCard()?.key){lastCardTap=null;return;}
 // A settled card has nothing left to PICK: one tap opens its news summary instead.
 if(currentCard()?.pickState==='settled'){lastCardTap=null;tapBlockedUntil=now+400;suppressClickUntil=now+400;openCard();return;}
 const previous=lastCardTap;
 if(previous&&previous.key===tap.key&&previous.type===tap.type&&now-previous.ended<=cardTapLimits.interval&&
    Math.hypot(tap.x-previous.x,tap.y-previous.y)<=cardTapLimits.separation){
  // Consume this pair before requesting a PICK from the parent.
  // A trailing click must never create a second request.
  lastCardTap=null;tapBlockedUntil=now+400;suppressClickUntil=now+400;
  act();
 }else lastCardTap={key:tap.key,type:tap.type,x:tap.x,y:tap.y,ended:now};
}
function cancelCardGesture(){
 tapCandidate=null;lastCardTap=null;
 if(!swipe)return;
 const gesture=swipe;swipe=null;holdScene();
 paper.classList.remove('is-dragging');
 if(paper.hasPointerCapture(gesture.id))paper.releasePointerCapture(gesture.id);
 if(gesture.active){suppressClickUntil=performance.now()+350;tapBlockedUntil=suppressClickUntil;releaseCard({x:0,y:0});}
}
// The finger's card position: 1:1 horizontally, rubber-banded past the first and last card,
// and a heavier, rubber-banded follow vertically.
function edgeDrag(raw){return raw>0&&state.index>=currentCards().length-1||raw<0&&state.index===0;}
function dragPoint(s,clientX,clientY){
 const raw=s.bx+clientX-s.ox;
 return {x:edgeDrag(raw)?P.rubber(raw,s.w):raw,y:P.rubber(s.by+clientY-s.oy,s.h)};
}
function grabCard(s,e){
 // The drag's only layout read; every later frame writes transform and opacity.
 const deckBox=deckEl.getBoundingClientRect(),w=paper.offsetWidth,h=paper.offsetHeight,left=paper.offsetLeft,topEdge=paper.offsetTop,radius=getComputedStyle(paper).borderRadius;
 const resting=!front.x.x&&!front.x.v&&!front.y.x&&!front.lift.x&&Math.abs(front.es.x-1)<.002;
 front.w=w;front.h=h;
 Object.assign(liftEl.style,{width:w+'px',height:h+'px',left:left+'px',top:topEdge+'px',borderRadius:radius});
 if(resting){
  // The reference card turns about its own centre wherever it is held.
  const gy=s.y-deckBox.top-topEdge;front.pivot=P.pivot(gy,h);paper.style.transformOrigin='50% 50%';liftEl.style.transformOrigin='50% 50%';
 }
 // A resting card follows from the touch point; a moving one is caught where it is.
 if(resting)Object.assign(s,{ox:s.x,oy:s.y,bx:0,by:0});
 else Object.assign(s,{ox:e.clientX,oy:e.clientY,bx:edgeDrag(front.x.x)?P.unrubber(front.x.x,w):front.x.x,by:P.unrubber(front.y.x,h)});
 Object.assign(s,{w,h,cx:e.clientX,cy:e.clientY});
 front.held=true;front.x.v=0;front.y.v=0;front.lift.to=motionAmount()?1:0;
 wakeMotion();
}
function releaseCard(v){
 front.held=false;front.lift.to=0;
 if(!canMoveCards()){cancelCardMotion();return;}
 // Home again with the hand's own speed, near critically damped.
 Object.assign(front.x,{to:0,v:v.x,sp:SP.settle});Object.assign(front.y,{to:0,v:v.y,sp:SP.settle});
 wakeMotion();
}
document.addEventListener('pointerdown',e=>{
 cardPointers.add(e.pointerId);
 if(cardPointers.size>1||e.isPrimary===false){multiplePointers=true;invalidateCardTap(true);cancelCardGesture();}
 else if(!paper.contains(e.target)||swipeBlockedTarget(e.target))cancelCardGesture();
},true);
paper.addEventListener('pointerdown',e=>{
 const now=performance.now(),card=currentCard();
 if(suspended||!card||paper.hidden||e.button!==0||multiplePointers||cardPointers.size>1||e.isPrimary===false||
    swipeBlockedTarget(e.target)||selectedCardText())return;
 const onLink=interactiveCardTarget(e.target);
 if(!onLink&&now>=tapBlockedUntil&&now>=suppressClickUntil){
  // The second mouse press is our PICK gesture; prevent native word selection
  // only after the first short, stationary click has established this intent.
  if(e.pointerType==='mouse'&&lastCardTap?.key===card.key&&lastCardTap.type==='mouse'&&
     now-lastCardTap.ended<=cardTapLimits.interval&&Math.hypot(e.clientX-lastCardTap.x,e.clientY-lastCardTap.y)<=cardTapLimits.separation)e.preventDefault();
  tapCandidate={id:e.pointerId,key:card.key,type:e.pointerType,started:now,x:e.clientX,y:e.clientY,moved:false,
   bodyTop:paper.querySelector('.article-body')?.scrollTop||0,photoLeft:paper.querySelector('.gallery-track')?.scrollLeft||0,
   pageX:window.scrollX,pageY:window.scrollY};
 }
 // A photo can receive a stationary double tap. With several photos a sideways drag moves them
 // while it can (ModernGallery); from the first photo rightwards or the last leftwards, and on a
 // single photo, the drag turns the card like anywhere else on it.
 if(currentCards().length<2)return;
 const photos=e.target.closest('.article-media')?.querySelector('.gallery-track');
 // A mouse press on a link would otherwise begin the browser's link drag and cancel this pointer.
 if(onLink&&e.pointerType==='mouse')e.preventDefault();
 swipe={id:e.pointerId,key:card.key,x:e.clientX,y:e.clientY,active:false,samples:[],photos:photos&&photos.children.length>1?photos:null};holdScene();
});
window.addEventListener('pointermove',e=>{
 if(tapCandidate?.id===e.pointerId&&!pointerPositionUnchanged(tapCandidate,e)){tapCandidate.moved=true;lastCardTap=null;}
},{capture:true,passive:true});
paper.addEventListener('pointermove',e=>{
 if(!swipe||e.pointerId!==swipe.id)return;
 if(multiplePointers||swipe.key!==currentCard()?.key||(e.pointerType==='mouse'&&e.buttons!==1)){endSwipe(e,true);return;}
 const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;
 if(!swipe.active){
  if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)){swipe=null;holdScene();invalidateCardTap(true);return;}
  if(Math.abs(dx)<12)return;
  if(swipe.photos){const t=swipe.photos,at=Math.round(t.scrollLeft/Math.max(1,t.clientWidth));if(dx>0?at>0:at<t.children.length-1){swipe=null;holdScene();return;}}
  if(selectedCardText()){swipe=null;holdScene();invalidateCardTap(true);return;}
  swipe.active=true;invalidateCardTap(true);paper.setPointerCapture(e.pointerId);paper.classList.add('is-dragging');grabCard(swipe,e);
 }
 // Every hardware sample feeds the release velocity; the frame loop draws only the latest.
 const coalesced=e.getCoalescedEvents?.()||[];
 for(const p of coalesced.length?coalesced:[e]){const q=dragPoint(swipe,p.clientX,p.clientY);swipe.samples.push({t:p.timeStamp,x:q.x,y:q.y});}
 while(swipe.samples.length>2&&e.timeStamp-swipe.samples[0].t>120)swipe.samples.shift();
 swipe.cx=e.clientX;swipe.cy=e.clientY;wakeMotion();e.preventDefault();
});
function endSwipe(e,cancel=false){
 if(!swipe||e.pointerId!==swipe.id)return;
 const s=swipe;swipe=null;holdScene();
 paper.classList.remove('is-dragging');
 if(paper.hasPointerCapture(e.pointerId))paper.releasePointerCapture(e.pointerId);
 if(!s.active)return;
 suppressClickUntil=performance.now()+350;
 invalidateCardTap(true);
 // The card leaves (or returns) from where it was last drawn, at the finger's speed.
 const point=dragPoint(s,e.clientX,e.clientY),v=cancel?{x:0,y:0}:P.velocity(s.samples,e.timeStamp);
 releaseCard(v);
 const dir=cancel||s.key!==currentCard()?.key?0:P.decide(point.x,v.x,s.w);
 if(dir){releaseFling=v;if(navigate(dir))return;releaseFling=null;}
}
window.addEventListener('pointerup',e=>{
 endSwipe(e);finishCardTap(e);cardPointers.delete(e.pointerId);
 if(!cardPointers.size)multiplePointers=false;
});
window.addEventListener('pointercancel',e=>{
 endSwipe(e,true);finishCardTap(e,true);cardPointers.delete(e.pointerId);
 if(!cardPointers.size)multiplePointers=false;
});
paper.addEventListener('lostpointercapture',e=>{if(e.target===paper){endSwipe(e,true);finishCardTap(e,true)}});
paper.addEventListener('scroll',()=>{invalidateCardTap(true);if(swipe&&!swipe.active){swipe=null;holdScene();}},true);
paper.addEventListener('pointerleave',e=>{if(swipe?.id===e.pointerId&&!swipe.active){swipe=null;holdScene();}});
window.addEventListener('scroll',e=>{if(e.target===document||e.target===window)invalidateCardTap(true);},{capture:true,passive:true});
paper.addEventListener('contextmenu',()=>{invalidateCardTap(true);cancelCardGesture();});
paper.addEventListener('dragstart',e=>{if(swipe&&e.target instanceof Element&&e.target.closest('a'))e.preventDefault();});
paper.addEventListener('dblclick',e=>{if(!interactiveCardTarget(e.target))e.preventDefault();});
document.addEventListener('selectionchange',()=>{if(selectedCardText())invalidateCardTap();});
window.addEventListener('blur',()=>{invalidateCardTap(true);cancelCardGesture();cardPointers.clear();multiplePointers=false;});
document.addEventListener('click',e=>{if(performance.now()<suppressClickUntil&&e.target.closest('#article')){e.preventDefault();e.stopImmediatePropagation()}},true);

$('#next').onclick=()=>navigate(1);$('#pick').onchange=act;
// The NEXT strip under the card is a shortcut for the next button (the button stays the labelled control).
peekEl.addEventListener('click',()=>{if(!peekEl.hidden)navigate(1);});
// One request per press: a retry is busy from the press until the parent's refresh is under way
// (its status says refreshing) and then until that ends. A request the parent did not take (the
// home was covered) frees the retry again after a second.
function showRefresh(){const busy=refreshBusy();for(const b of document.querySelectorAll('[data-refresh]')){b.disabled=busy;b.setAttribute('aria-busy',String(busy));}}
document.addEventListener('click',event=>{
 const retry=event.target.closest('[data-refresh]');if(!retry||retry.disabled||refreshBusy())return;
 refreshAsked=setTimeout(()=>{refreshAsked=0;showRefresh();},1000);send('refresh');showRefresh();
});
document.addEventListener('keydown',e=>{
 if(suspended||e.repeat||e.target.closest('input:not(#pick),textarea,select,[contenteditable],button,a')||e.ctrlKey||e.metaKey||e.altKey)return;
 if(e.target.closest('.article-media')&&['ArrowLeft','ArrowRight'].includes(e.key))return;
 if(e.key==='ArrowRight'){e.preventDefault();navigate(1);}
 if(e.key==='ArrowLeft'){e.preventDefault();navigate(-1);}
 if(e.code==='KeyP'||e.key.toLowerCase()==='p'){e.preventDefault();act();}   // KeyP = 한글 자판(키 값 'ㅔ')에서도 PICK(부모 modern-data.js 와 같은 판정)
 else if(e.target===paper&&['Enter',' '].includes(e.key)){e.preventDefault();if(!openCard())act();}
});
function stopInteractions(block=true){cancelCardGesture();cancelCardMotion();ModernGallery.cancel();cardPointers.clear();multiplePointers=false;invalidateCardTap(block);}
cardMotionPreference.addEventListener('change',()=>{if(cardMotionPreference.matches)stopInteractions();});
window.addEventListener('resize',()=>{cancelCardGesture();cancelCardMotion();layFan(currentCards(),currentCard());});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopInteractions();else if(!suspended){ModernGallery.bind(paper,paper.dataset.key);refreshArticleAge();playEntrance();}});
function normaliseRows(rows){
 const seen=new Set();return rows.filter(row=>row&&typeof row.key==='string'&&articleSourceUrl(row.key)&&typeof row.title==='string'&&row.title.trim()&&!seen.has(row.key)&&(seen.add(row.key),true)).map(row=>({
  ...row,title:row.title.trim(),score:Number.isFinite(row.score)?row.score:null,
  items:Array.isArray(row.items)?row.items.filter(item=>item&&typeof item==='object'):[],
  urls:Array.isArray(row.urls)?row.urls.map(articleSourceUrl).filter(Boolean):[],
  sites:Array.isArray(row.sites)?row.sites.filter(value=>typeof value==='string'):[],
  meta:row.meta&&typeof row.meta==='object'?row.meta:{},
  pickState:row.pickState===null?null:['picking','settled','failed','submitting'].includes(row.pickState)?row.pickState:'submitting'
 }));
}
// The card in hand in the new rows. A ranking can group its article into a story led by another
// article (10-24: a later 연합뉴스 copy of the same 트럼프 기사 became the cluster's lead), so its own
// key is gone. The reader keeps that story, the first row holding one of its links, never the
// slot it left: that slot now holds an unrelated article (smoke «late ranking preserves a user-chosen card»).
function heldIndex(held){
 if(!held)return -1;
 const own=cards.findIndex(card=>card.key===held.key);if(own>=0)return own;
 const links=new Set([held.key,...held.urls]);
 return cards.findIndex(card=>links.has(card.key)||card.urls.some(link=>links.has(link)));
}
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==window.parent||window.parent===window)return;
 const message=event.data;if(!message||message.channel!==CHANNEL)return;
 if(message.type==='connect')send('ready');
 else if(message.type==='snapshot'){
  if(!Number.isSafeInteger(message.version)||message.version<snapshotVersion||!Array.isArray(message.rows))return;
  const held=currentCard(),key=held?.key;snapshotVersion=message.version;requestedKeys.clear();cards=normaliseRows(message.rows);
  loadStatus=message.status&&typeof message.status==='object'?message.status:{state:cards.length?'ready':'empty',message:''};
  if(loadStatus.refreshing&&refreshAsked){clearTimeout(refreshAsked);refreshAsked=0;}
  scoreScale=ModernScoreScale.create(cards.map(card=>card.score));
  // Candidates can arrive before scores. The first ranked snapshot starts at
  // the top unless the reader has already chosen a card; later updates keep it.
  const firstRanking=!receivedRanking&&!!message.status?.generated;
  receivedRanking=receivedRanking||!!message.status?.generated;
  const same=heldIndex(held);state.index=firstRanking&&!userChoseCard?0:same>=0?same:Math.min(state.index,Math.max(0,cards.length-1));
  // A PICK or data refresh for the card in hand must not drop the drag or turn in flight.
  const shown=!!key&&!paper.hidden;
  if(currentCard()?.key===key&&key){ModernGallery.cancel();invalidateCardTap(false);render();}
  else if(shown&&currentCard()&&canMoveCards()){invalidateCardTap(false);render(true,0);}
  else{stopInteractions(false);render();}
 }else if(message.type==='current'){
  // 앱 홈 「전송」 단추 = 지금 보이는 카드로 요약 요청 칸을 채움(형 10-31 「뉴스 요약은 우측에 전송 버튼을 만들면 될듯」)
  const card=currentCard();send('current',{card:card?{title:card.title,url:card.urls[0]||card.key,media:card.media||''}:null});
 }else if(message.type==='key'&&!suspended&&!document.hidden){
  // The parent hands ←, → and P to the card while nothing else on the page has focus.
  if(message.action==='next')navigate(1);else if(message.action==='previous')navigate(-1);else if(message.action==='pick')act();
 }else if(message.type==='suspend'&&typeof message.hidden==='boolean'){
  suspended=message.hidden;if(suspended)stopInteractions();else{ModernGallery.bind(paper,paper.dataset.key);refreshArticleAge();window.alignArticleInk?.(paper);playEntrance();}
  updatePickControl();$('#next').disabled=suspended||!currentCard()||state.index===cards.length-1;
 }
});
function refreshArticleAge(){
 if(suspended||document.hidden)return;
 const card=currentCard(),target=paper.querySelector('.article-schedule');if(card&&target){const content=articleSchedule(card);if(content)target.innerHTML=content;else target.remove();window.alignArticleInk?.(paper);}
}
setInterval(refreshArticleAge,60000);
for(const [name,value] of Object.entries(state.values))document.documentElement.style.setProperty('--'+name,String(value/100));
iconize();render();send('ready');
// Pull to refresh (operator 10-19): a downward pull that starts where nothing above can scroll
// (the article at its top) shows a ring that follows with rubber-band resistance; past 70 px it
// lights, and letting go there reloads the page (the parent's hard reload, as the feed's pull).
// Sideways drags stay the card's, an article scrolled down scrolls back first, a second finger
// gives way, and reduced motion keeps the ring still.
(()=>{
 if(!('ontouchstart' in window)||window.parent===window)return;
 const TRIG=70,MAXP=130,ring=document.createElement('div');
 ring.className='home-pull';ring.setAttribute('aria-hidden','true');ring.innerHTML='<span class="home-pull-ring"></span>';
 document.body.append(ring);
 const inner=ring.firstElementChild;
 let sy=0,sx=0,active=false,engaged=false,armed=false,firing=false,body=null;
 const atTop=()=>!body||body.scrollTop<=0;
 function reset(soft){
  active=engaged=armed=false;ring.classList.remove('show','armed','spin');
  ring.style.transition=soft?'transform .24s var(--modern-ease-out), opacity .24s var(--modern-ease-out)':'none';
  ring.style.transform='';inner.style.transform='';
 }
 addEventListener('touchstart',e=>{
  if(firing||e.touches.length!==1||document.querySelector('#deck')?.dataset.turning==='true')return;
  body=e.target instanceof Element?e.target.closest('.article-body'):null;
  if(!atTop())return;
  sy=e.touches[0].clientY;sx=e.touches[0].clientX;active=true;engaged=false;armed=false;ring.style.transition='none';
 },{passive:true});
 addEventListener('touchmove',e=>{
  if(!active)return;
  if(e.touches.length!==1){reset(true);return;}
  const dy=e.touches[0].clientY-sy,dx=e.touches[0].clientX-sx;
  if(!engaged){
   if(dy>8&&dy>Math.abs(dx)*1.3&&atTop())engaged=true;
   else if(Math.abs(dx)>10||dy<-6||!atTop()){active=false;return;}
   else return;
  }
  e.preventDefault();
  const dist=Math.min(dy,MAXP),pull=Math.min(dist*.62,80);
  ring.classList.add('show');
  ring.style.transform='translate(-50%,'+pull+'px) scale('+(.9+Math.min(dist/TRIG,1)*.1)+')';
  if(!matchMedia('(prefers-reduced-motion:reduce)').matches)inner.style.transform='rotate('+dist*2.6+'deg)';
  armed=dist>=TRIG;ring.classList.toggle('armed',armed);
 },{passive:false});
 function end(){
  if(!engaged){if(active)reset(false);return;}
  if(!armed){reset(true);return;}
  firing=true;active=engaged=false;
  ring.style.transition='transform .2s var(--modern-ease-out)';ring.style.transform='translate(-50%,42px) scale(1)';inner.style.transform='';
  ring.classList.add('spin');
  setTimeout(()=>send('reload'),360);
  setTimeout(()=>{firing=false;reset(true);},4000);   // the parent refused (a tool or modal opened meanwhile): the ring leaves
 }
 addEventListener('touchend',end,{passive:true});
 addEventListener('touchcancel',()=>{if(!firing)reset(true);},{passive:true});
 addEventListener('pageshow',e=>{if(e.persisted){firing=false;reset(false);}});
})();

// ── Follower band above the card (operator 10-22) ──
// «좌상단에 IG 얼마 │ FB 얼마 · 스레드는 패스» · «두 개가 추세선 · 증가율(%) 기준 · 날마다 점은 ±명수 · 인스타 위 · 페북 아래»
// · «카드 윗변을 받침 삼아서 곡선 차트». Source order = the channel summary's chanGet (viewer-src/39-chLiftChart.part): api/chan
// reads main directly, the static file is the fallback. Each platform's line = its follower count's growth (%) over the last
// DAYS finished days, rebuilt backwards from today's count with each day's net (IG follower_net · FB has only new follows, no
// unfollow number, so its line can only rise); one shared % scale so the two rates compare honestly. Each day's dot carries that
// day's ± in people in two glass rows under the lines, IG over FB (operator 10-22 «인스타랑 페북 나란히 두 줄 · 아래로»).
// Unknown or failed = the band stays hidden and the card keeps its height.
(()=>{
 const box=document.getElementById('home-pulse');if(!box)return;
 const NS='http://www.w3.org/2000/svg',nf=new Intl.NumberFormat('ko-KR'),DAYS=10;
 const kstDay=()=>new Date(Date.now()+9*36e5).toISOString().slice(0,10);
 const signed=v=>(v>0?'+':v<0?'−':'')+nf.format(Math.abs(v));
 const NET={ig:r=>r.follower_net!=null?r.follower_net:r.follows!=null&&r.unfollows!=null?r.follows-r.unfollows:null,
  fb:r=>r.follower_net!=null?r.follower_net:r.follows!=null?r.follows:null};
 async function get(key,file){
  for(const u of['api/chan?f='+key,file+'?ts='+Date.now()]){
   try{const r=await fetch(u,{cache:'no-store'});if(!r.ok)continue;const t=await r.text();if(/^\s*</.test(t))continue;
    const j=JSON.parse(t);if(j&&j.profile&&typeof j.profile.followers_count==='number'&&j.generated_kst)return j;}catch(_){}
  }
  return null;
 }
 function series(j,key){   // [{date, net, count, pct}] for the last DAYS finished days · count = end-of-day followers
  const today=kstDay(),all=(j.daily_series||[]).filter(r=>r&&r.date),todayRow=all.find(r=>r.date===today);
  const days=all.filter(r=>r.date<today).slice(-DAYS),nets=days.map(NET[key]);
  let c=j.profile.followers_count-((todayRow&&NET[key](todayRow))||0);
  const counts=[];for(let k=days.length-1;k>=0;k--){counts[k]=c;c-=nets[k]||0;}
  const base=c>0?c:counts[0]||1;
  return days.map((r,k)=>({date:r.date,net:nets[k],count:counts[k],pct:(counts[k]-base)/base*100}));
 }
 let last=null,genAt=NaN,guide=null,hov={days:[],P:1,W:1};
 // Hover detail (mouse · operator 10-22 «차트도 호버하면 상세 정보» · «날짜별 통계 노우» = no date): the day under the pointer — each platform's ± people and
 // its growth since the window began — in a glass tip over that day, with a guide line through it. Touch keeps the plain chart.
 const tipEl=document.getElementById('hp-tip'),chartEl=document.getElementById('hp-chart');
 const pct=v=>(v>=0?'+':'−')+Math.abs(v).toFixed(2)+'%';
 const cell=(k,p)=>p?'<span class="k">'+k+'</span> <span class="'+(p.net>0?'up':p.net<0?'dn':'')+'">'+(p.net==null?'–':signed(p.net)+'명')+'</span> <span class="k">'+pct(p.pct)+'</span>':'';
 function hideTip(){if(tipEl)tipEl.hidden=true;if(guide)guide.setAttribute('visibility','hidden');}
 if(chartEl&&tipEl){
  chartEl.addEventListener('pointermove',e=>{
   if(e.pointerType==='touch')return;
   const r=chartEl.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*hov.W,k=Math.max(0,Math.min(DAYS-1,Math.floor(x/hov.P))),d=hov.days[k];
   if(!d){hideTip();return;}
   const cx=k*hov.P+hov.P/2;
   if(guide){guide.setAttribute('x1',cx.toFixed(1));guide.setAttribute('x2',cx.toFixed(1));guide.setAttribute('visibility','visible');}
   tipEl.innerHTML=[cell('IG',d.ig),cell('FB',d.fb)].filter(Boolean).join(' · ');   // 날짜 없이 숫자만(운영자 261022 «날짜별 통계 노우»)
   tipEl.hidden=false;
   const box=box0(),half=tipEl.offsetWidth/2,left=r.left-box.left+cx/hov.W*r.width;
   tipEl.style.left=Math.max(half,Math.min(box.width-half,left)).toFixed(1)+'px';
   tipEl.style.top=(r.top-box.top-4).toFixed(1)+'px';
  });
  chartEl.addEventListener('pointerleave',hideTip);
 }
 function box0(){return box.getBoundingClientRect();}
 // Press = 채널 요약(operator 10-25 «일단 홈 팔로워로»): the original editor's channel page, where 「잘 되는 조건」 and the
 // daily-post barcode live, had no door in the new screen. The parent opens it (modern-workspace openChan); the place may change later.
 box.setAttribute('role','button');box.tabIndex=0;box.setAttribute('aria-label','팔로워 — 누르면 채널 요약');
 box.addEventListener('click',()=>send('chan'));
 box.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();send('chan');}});
 function paint(ig,fb){
  last=[ig,fb];
  document.getElementById('hp-ig').textContent=nf.format(ig.profile.followers_count);
  document.getElementById('hp-fb').textContent=fb?nf.format(fb.profile.followers_count):'–';
  genAt=Date.parse(String(ig.generated_kst));stamp();
  const svg=document.getElementById('hp-chart');svg.textContent='';
  const W=Math.max(150,svg.clientWidth||300),H=svg.clientHeight||64,P=W/DAYS;
  svg.setAttribute('viewBox','0 0 '+W.toFixed(1)+' '+H);
  const cap=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--modern-type-caption'))||12,FS=+(cap*.8).toFixed(1);
  const RH=FS+6,RG=3,FBY=H-RH,IGY=FBY-RG-RH;   // the two ± rows at the foot (IG over FB), each a pill RH tall
  const TOP=4,BOT=IGY-6;   // the lines draw above them
  const lines=[['ig',series(ig,'ig')]].concat(fb?[['fb',series(fb,'fb')]]:[]);
  hov={days:[],P,W};hideTip();
  const span=Math.max(.5,...lines.flatMap(([,s])=>s.map(p=>Math.abs(p.pct))));   // shared % scale (at least ±0.5 %)
  const lo=Math.min(0,...lines.flatMap(([,s])=>s.map(p=>p.pct))),hi=Math.max(0,...lines.flatMap(([,s])=>s.map(p=>p.pct)));
  const top=hi-lo<span*.1?hi+span*.05:hi,bot=hi-lo<span*.1?lo-span*.05:lo;
  const Y=v=>BOT-(v-bot)/((top-bot)||1)*(BOT-TOP);
  const add=(tag,a,tip)=>{const e=document.createElementNS(NS,tag);for(const k in a)e.setAttribute(k,a[k]);if(tip){const t=document.createElementNS(NS,'title');t.textContent=tip;e.appendChild(t);}svg.appendChild(e);return e;};
  // IG ± row = a straight band of the signature colour fading out to both sides · FB row bare (operator 10-22 «둥그렇게 말지마 · 좌우 페이드 · 페북은 음영 없어도»)
  const fade=add('linearGradient',{id:'hp-igfade',x1:0,x2:1,y1:0,y2:0});
  for(const [o,a] of [[0,0],[.25,1],[.75,1],[1,0]]){const st=document.createElementNS(NS,'stop');st.setAttribute('offset',o);st.setAttribute('stop-opacity',a);fade.appendChild(st);}
  add('rect',{class:'hp-rowbg',x:0,y:IGY,width:W.toFixed(1),height:RH,fill:'url(#hp-igfade)'});
  add('line',{class:'hp-base',x1:0,x2:W,y1:Y(0).toFixed(1),y2:Y(0).toFixed(1),'stroke-width':1,'stroke-dasharray':'2 3'});   // 0 % = where the window started
  guide=add('line',{class:'hp-guide',x1:0,x2:0,y1:0,y2:H,'stroke-width':1,visibility:'hidden'});   // hover guide (mouse)
  const smooth=pts=>pts.map((p,i)=>{if(!i)return'M'+p[0].toFixed(1)+' '+p[1].toFixed(1);const a=pts[i-1],m=(a[0]+p[0])/2;return'C'+m.toFixed(1)+' '+a[1].toFixed(1)+' '+m.toFixed(1)+' '+p[1].toFixed(1)+' '+p[0].toFixed(1)+' '+p[1].toFixed(1);}).join('');
  lines.forEach(([key,s])=>{
   const off=(DAYS-s.length)*P,pts=s.map((p,i)=>[off+i*P+P/2,Y(p.pct)]);
   if(pts.length>1)add('path',{class:key,d:smooth(pts),'stroke-width':1.6,'stroke-linecap':'round','stroke-opacity':key==='ig'?1:.7});
   // The latest day anchors the row (bold number, larger dot); earlier days are regular. Both rows colour each day's ±
   // by the same rule (operator 10-22 «증감 색 동일하게 조건»): up = accent, down = gold, none = the secondary ink.
   s.forEach((p,i)=>{
    const [cx,cy]=pts[i],now=i===s.length-1,slot=DAYS-s.length+i;
    (hov.days[slot]=hov.days[slot]||{date:p.date})[key]=p;
    if(p.net==null)add('circle',{class:'hp-x',cx,cy,r:2.2,'stroke-width':.8,'stroke-dasharray':'1.2 1.4'});
    else add('circle',{class:key,cx,cy,r:now?3.2:2.6,'fill-opacity':key==='ig'?1:.8});
    add('text',{class:(p.net>0?'up':p.net<0?'dn':'flat')+(now?' now':''),x:cx,y:((key==='ig'?IGY:FBY)+RH/2+FS*.35).toFixed(1),'text-anchor':'middle','font-size':FS}).textContent=p.net==null?'–':signed(p.net);
   });
  });
  hov.P=P;hov.W=W;
  svg.setAttribute('aria-label','최근 '+DAYS+'일 팔로워 증가율 — IG '+lines[0][1].slice(-1).map(p=>(p.pct>=0?'+':'')+p.pct.toFixed(2)+'%')+(fb?' · FB '+lines[1][1].slice(-1).map(p=>(p.pct>=0?'+':'')+p.pct.toFixed(2)+'%'):''));
  if(box.hidden){box.hidden=false;window.dispatchEvent(new Event('resize'));} // first show = the card just gave up the band's height: re-lay the fan (its plates measure the card)
 }
 function stamp(){const at=document.getElementById('hp-at');if(!at)return;if(!Number.isFinite(genAt)){at.textContent='';return;}
  const m=Math.max(0,Math.floor((Date.now()-genAt)/60000));at.textContent='갱신 '+(m<1?'방금':m<60?m+'분 전':Math.floor(m/60)+'시간 전');}
 setInterval(stamp,60e3);
 const load=()=>Promise.all([get('ig','insta_data.json'),get('fb','fb_data.json')]).then(([ig,fb])=>{if(ig)paint(ig,fb);}).catch(()=>{});
 addEventListener('resize',()=>{if(last)paint(last[0],last[1]);});
 load();
 setInterval(()=>{if(!document.hidden)load();},10*60e3); // both sources refresh about every 2 hours (sns-trends heartbeat)
})();

;
/* ── modern-numerals.js ── */
/* Score numerals of the home card.
   1. Optical alignment uses the visible glyph bounds, not a fixed offset guessed from the font
      name. A card change reads no layout and no style: each card is measured on a canvas from
      fonts and box offsets that were read once with the card at rest after a frame (again after
      a resize or a font load). Nothing is read inside an animation frame.
   2. A different card shows its own score as it is: a turn or a replaced card never rolls the
      previous card's digits into the new ones (two values in one place). Only when the score of
      the same card changes with new data do the changed places blur and slide, like SwiftUI's
      .contentTransition(.numericText()): up when the value grows, down when it falls, on
      .smooth(0.45) = k 195, c 27.93 (99% at 476 ms). The old digit leaves first and the new one
      arrives after it, so the two never read at once in the same place (their opacities add up to
      at most 1 and both are faint where they cross). It never starts under a finger (a change made
      while the card is held waits for the release), and it is instant with reduced motion, card
      motion off or forced colours. A card leaving the deck mid-change keeps showing its digits.
      The value stays in flow as text the whole time, so its width, its text and what assistive
      tech reads are the final value; the moving digits are a decorative face removed when they
      land.
   Layout and original Korean/Latin type styles stay owned by the article components. */
(() => {
  'use strict';
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  // Forced colours repaint the hidden in-flow value in the system ink, under the face (two images).
  const forcedColors = matchMedia('(forced-colors: active)');
  const px = value => Number.parseFloat(value) || 0;
  const round = value => Math.round(value * 1000) / 1000;
  const article = () => document.getElementById('article');
  const deck = () => document.getElementById('deck');
  const held = paper => paper.classList.contains('is-dragging');   // a finger is on the card
  const moving = paper => held(paper) || !!deck()?.classList.contains('is-turning') || !!paper.style.transform;

  /* ── Measurement: canvas metrics from cached fonts and box offsets ───────────────────── */
  const fonts = new Map();   // role → computed font settings, read only at rest after a frame
  const memo = new Map();    // font + text → canvas metrics
  let geometry = {};         // dx = title box left − score box left · dy = score box top − rank box top
  const titleRole = paper => paper.classList.contains('long-title') ? 'title-long' : 'title';
  const chipRole = element => 'chip:' + (element.parentElement?.className || '');

  function readFont(element) {
    const css = getComputedStyle(element);
    return {font:`${css.fontStyle} ${css.fontWeight} ${css.fontSize} ${css.fontFamily}`, size:px(css.fontSize),
      spacing:css.letterSpacing === 'normal' ? '0px' : css.letterSpacing, kerning:css.fontKerning, direction:css.direction,
      lineHeight:css.lineHeight === 'normal' ? null : px(css.lineHeight)};
  }
  function metrics(f, text) {
    const key = f.font + '|' + f.spacing + '|' + f.kerning + '|' + f.direction + '|' + f.lineHeight + '|' + text;
    let m = memo.get(key);
    if (m) return m;
    context.font = f.font;
    context.textBaseline = 'alphabetic';
    context.textAlign = 'left';
    context.direction = f.direction;
    if ('letterSpacing' in context) context.letterSpacing = f.spacing;
    if ('fontKerning' in context) context.fontKerning = f.kerning;
    const ink = context.measureText(text);
    const fontAscent = ink.fontBoundingBoxAscent, fontDescent = ink.fontBoundingBoxDescent;
    const lineHeight = f.lineHeight ?? fontAscent + fontDescent;
    const baseline = (lineHeight - fontAscent - fontDescent) / 2 + fontAscent;
    m = {width:ink.width, left:ink.actualBoundingBoxLeft, ascent:ink.actualBoundingBoxAscent, descent:ink.actualBoundingBoxDescent,
      fontAscent, fontDescent, topWithinLine:baseline - ink.actualBoundingBoxAscent};
    if (memo.size > 256) memo.clear();
    memo.set(key, m);
    return m;
  }
  // Pen position of every glyph, kerning included: the run up to and with it, less its own advance.
  const pens = (f, text) => [...text].map((ch, i) => metrics(f, text.slice(0, i + 1)).width - metrics(f, ch).width);

  // undefined = a font or an offset is not measured yet · null = nothing to align on this card.
  function scoreHeader(paper) {
    const scoreElement = paper.querySelector('.score-lead:not(.is-pending) strong');
    const titleElement = paper.querySelector('#article-title');
    if (!scoreElement || !titleElement) return null;
    const scoreFont = fonts.get('score'), titleFont = fonts.get(titleRole(paper));
    if (!scoreFont || !titleFont || geometry.dx == null) return undefined;
    const text = scoreElement.textContent.trim(), score = metrics(scoreFont, text);
    const title = metrics(titleFont, titleElement.textContent.trim());
    const header = {score:text, scoreX:round(geometry.dx - title.left + score.left)};
    const rankElement = paper.querySelector('.article-topline > .article-rank');
    if (rankElement) {
      const rankFont = fonts.get('rank');
      if (!rankFont || geometry.dy == null) return undefined;
      const rankText = rankElement.textContent.trim(), rank = metrics(rankFont, rankText);
      Object.assign(header, {rank:rankText, rankY:round(geometry.dy + score.topWithinLine - rank.topWithinLine)});
    }
    return header;
  }
  function write(element, name, value) {
    if (element.style.getPropertyValue(name) !== value) element.style.setProperty(name, value);
  }

  function alignArticleInk(paper = article()) {
    if (!paper || !paper.isConnected || paper.hidden || !context) return null;
    const updates = [], chips = [];
    let missing = false;
    for (const element of paper.querySelectorAll('.article-schedule .ink-text')) {
      const f = fonts.get(chipRole(element));
      if (!f) { missing = true; continue; }
      const text = element.textContent.trim(), m = text && metrics(f, text);
      if (!m || !Number.isFinite(m.fontAscent) || !Number.isFinite(m.fontDescent)) continue;
      // Centre of the ink on the centre of the line box (the line height cancels out).
      const shift = round((m.ascent - m.fontAscent + m.fontDescent - m.descent) / 2);
      updates.push([element, '--ink-shift', shift]);
      chips.push({text, shift, ascent:m.ascent, descent:m.descent, fontAscent:m.fontAscent, fontDescent:m.fontDescent});
    }
    const header = scoreHeader(paper);
    if (header === undefined) missing = true;
    else if (header) {
      updates.push([paper, '--score-ink-x', header.scoreX]);
      if ('rankY' in header) updates.push([paper, '--rank-ink-shift', header.rankY]);
    } else updates.push([paper, '--score-ink-x', 0], [paper, '--rank-ink-shift', 0]);
    for (const [element, name, value] of updates) write(element, name, value + 'px');
    if (missing) measureSoon();
    return {chips, header:header || null};
  }

  // Reads happen in a task after a painted frame, so layout is already clean: never forced.
  let measureQueued = false, waitingForRest = false;
  function measureSoon() {
    if (measureQueued) return;
    measureQueued = true;
    requestAnimationFrame(() => setTimeout(measureAtRest, 0));
  }
  function measureAtRest() {
    measureQueued = false;
    const paper = article();
    if (!paper || paper.hidden || !paper.isConnected) return;
    if (moving(paper)) { waitingForRest = true; return; }
    if (!paper.getClientRects().length) return;   // frame not rendered; a resize brings it back
    const score = paper.querySelector('.score-lead:not(.is-pending) strong');
    const title = paper.querySelector('#article-title'), rank = paper.querySelector('.article-topline > .article-rank');
    for (const element of paper.querySelectorAll('.article-schedule .ink-text')) fonts.set(chipRole(element), readFont(element));
    if (title) fonts.set(titleRole(paper), readFont(title));
    if (rank) fonts.set('rank', readFont(rank));
    if (score) {
      fonts.set('score', readFont(score));
      const s = score.getBoundingClientRect();
      if (title) geometry.dx = title.getBoundingClientRect().left - (s.left - px(paper.style.getPropertyValue('--score-ink-x')));
      if (rank) geometry.dy = s.top - (rank.getBoundingClientRect().top - px(paper.style.getPropertyValue('--rank-ink-shift')));
    }
    alignArticleInk(paper);
  }

  /* ── numericText: changed places blur and slide ─────────────────────────────────────── */
  // .smooth(0.45): unit mass, k 195, c 27.93 (ζ = 1.00005), in closed form. The animation ends at
  // the 0.5% settle (533 ms); 99% of the travel is reached at 476 ms.
  const SPRING = (() => {
    const k = 195, c = 27.93, w = Math.sqrt(k), z = c / (2 * w);
    const s = Math.sqrt(Math.max(0, z * z - 1)), r1 = -w * (z - s), r2 = -w * (z + s);
    const x = t => s < 1e-6 ? 1 - (1 + w * t) * Math.exp(-w * t) : 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
    let ms99 = 0, ms = 0;
    for (let t = 1; !ms && t < 3000; t++) {
      const v = x(t / 1000);
      if (!ms99 && v >= .99) ms99 = t;
      if (1 - v < .005) ms = t;
    }
    return {k, c, ms99, ms, at:t => t >= ms ? 1 : x(t / 1000)};
  })();
  // The spring as a CSS linear() easing (a point every ~8 ms), so each glyph needs only a few
  // keyframes placed in spring progress. Where linear() is missing: the reference bezier fit.
  const TIMING = (() => {
    const linear = 'linear(' + Array.from({length:65}, (_, i) => +SPRING.at(i / 64 * SPRING.ms).toFixed(5)).join(',') + ')';
    return window.CSS?.supports?.('animation-timing-function', linear) ? {duration:SPRING.ms, easing:linear}
      : {duration:506, easing:'cubic-bezier(.225,.172,.147,1.004)'};
  })();
  const STEPS = [0, .1, .2, .3, .35, .4, .5, .6, .75, 1];   // keyframe offsets = spring progress
  const TRAVEL = .5;        // vertical travel = half the digit height
  const BLUR = .1;          // em of blur at the far end
  // A changed place: the old digit is gone by half the spring, the new one starts at 30%. Where
  // they cross (30-50%) the fainter is at most .11 and both are blurred; together never past 1.
  const OUT_END = .5, IN_START = .3;
  const leave = p => Math.min(1, p / OUT_END);                          // the old digit's own progress
  const arrive = p => Math.max(0, (p - IN_START) / (1 - IN_START));    // the new digit's own progress
  const stats = {holds:0, starts:0, deferred:0, finishes:0, cancels:0, instant:0, carried:0};
  let roll = null, shown = null, serial = 0;

  // Card motion off in the home settings (or the home hidden) is the same gate the card physics uses.
  const cardsMove = () => typeof canMoveCards !== 'function' || canMoveCards();
  const motionAllowed = () => !reduceMotion.matches && !forcedColors.matches && !document.hidden && cardsMove();
  const scoreOf = strong => strong && !strong.closest('.score-lead')?.classList.contains('is-pending') ? strong.textContent.trim() || null : null;
  // The value the reader sees now: a held change still shows its old value, a running one is on its way.
  const onScreen = () => roll ? (roll.phase === 'hold' ? roll.from : roll.to) : shown?.text;

  function glyph(face, ch, endX) {
    const el = document.createElement('span');
    el.className = 'nm-g';
    el.dataset.g = ch;
    el.style.left = endX + 'px';
    face.append(el);
    return el;
  }
  // Slots pair the places by value (from the right, so the decimals stay paired); a place that
  // only one value has rides along with its neighbour's horizontal move.
  function prepare(paper, strong, key, from, to) {
    const f = fonts.get('score');
    if (!f) return null;
    const a = pens(f, from), b = pens(f, to), lift = metrics(f, '0123456789').ascent * TRAVEL;
    const delta = metrics(f, from).left - metrics(f, to).left;   // the old value's own ink alignment
    const face = document.createElement('span'), value = document.createElement('span'), id = String(++serial);
    face.className = 'nm-face';
    face.dataset.roll = id;
    face.setAttribute('aria-hidden', 'true');
    value.className = 'nm-text';
    value.textContent = to;
    const glyphs = [], slots = Math.max(from.length, to.length), common = Math.min(from.length, to.length) - 1;
    const startOf = j => a[from.length - 1 - j] + delta, endOf = j => b[to.length - 1 - j];
    const shift = startOf(common) - endOf(common);
    for (let j = 0; j < slots; j++) {
      const oldCh = from[from.length - 1 - j], newCh = to[to.length - 1 - j];
      const start = oldCh !== undefined ? startOf(j) : endOf(j) + shift;
      const end = newCh !== undefined ? endOf(j) : startOf(j) - shift;
      const sx = start - end;
      if (oldCh === newCh) { glyphs.push({el:glyph(face, newCh, end), kind:'same', sx}); continue; }
      if (oldCh !== undefined) glyphs.push({el:glyph(face, oldCh, end), kind:'out', sx});
      if (newCh !== undefined) glyphs.push({el:glyph(face, newCh, end), kind:'in', sx});
    }
    for (const g of glyphs) {   // hold: the old value, where the old card showed it
      if (g.kind === 'in') g.el.style.opacity = '0';
      else if (g.sx) g.el.style.transform = `translateX(${g.sx.toFixed(3)}px)`;
    }
    strong.replaceChildren(value, face);
    stats.holds++;
    return {id, paper, strong, key, from, to, face, glyphs, up:px(to) > px(from) ? 1 : -1, lift, blur:f.size * BLUR, phase:'hold'};
  }
  // Same places glide sideways only; a changed place leaves blurring and fading (faster than it
  // travels), then the new one arrives the opposite way, both on the one spring.
  function keyframes(g, r) {
    const x = p => (g.sx * (1 - p)).toFixed(3);
    if (g.kind === 'same') return [{transform:`translate(${x(0)}px,0px)`}, {transform:'translate(0px,0px)'}];
    return STEPS.map(p => {
      if (g.kind === 'in') { const q = arrive(p); return {offset:p, transform:`translate(${x(p)}px,${(r.up * r.lift * (1 - q)).toFixed(3)}px)`, opacity:+(1 - (1 - q) ** 2).toFixed(4), filter:`blur(${(r.blur * (1 - q)).toFixed(3)}px)`}; }
      const q = leave(p);
      return {offset:p, transform:`translate(${x(p)}px,${(-r.up * r.lift * q).toFixed(3)}px)`, opacity:+((1 - q) ** 2).toFixed(4), filter:`blur(${(r.blur * q).toFixed(3)}px)`};
    });
  }
  function start(r) {
    if (r !== roll || r.phase !== 'hold') return;
    if (held(r.paper)) { stats.deferred++; return; }   // onRest starts it when the finger lets go
    if (!motionAllowed() || !r.strong.isConnected) { finish(r); stats.instant++; return; }
    r.phase = 'run';
    stats.starts++;
    let last = null;
    for (const g of r.glyphs) {
      if (g.kind === 'same' && !g.sx) continue;
      // The resting style is the landing pose; the animation runs from the hold pose to it.
      g.el.style.transform = '';
      g.el.style.opacity = g.kind === 'out' ? '0' : '';
      last = g.anim = g.el.animate(keyframes(g, r), TIMING);
    }
    if (last) last.onfinish = () => finish(r); else finish(r);
  }
  function finish(r) {
    if (r !== roll) return;
    roll = null;
    for (const g of r.glyphs) g.anim?.cancel();
    if (r.strong.isConnected) r.strong.textContent = r.to;
    stats.finishes++;
    alignArticleInk(r.paper);
  }
  function cancel(r) {
    if (!r) return;
    for (const g of r.glyphs) g.anim?.cancel();
    if (r === roll) roll = null;
    stats.cancels++;
  }
  // home.js clones the card it turns away in the same task as the new markup, so the copy holds
  // this face in the pose of its last style: the hold pose, or the landing pose of a running
  // change. A running change goes on in the copy from the same moment, so the leaving card keeps
  // the digits it showed and finishes them in flight; the copy is removed with its animations.
  function carry(r) {
    if (r.phase !== 'run') return;
    const face = deck()?.querySelector(`:scope > .card-exit .nm-face[data-roll="${r.id}"]`);
    if (!face || face.children.length !== r.glyphs.length) return;
    r.glyphs.forEach((g, i) => {
      if (!g.anim || g.anim.playState === 'finished') return;
      // The same start time keeps both in step from the next frame on (no pending frame).
      const copy = face.children[i].animate(keyframes(g, r), TIMING);
      if (g.anim.startTime != null) copy.startTime = g.anim.startTime; else copy.currentTime = g.anim.currentTime ?? 0;
    });
    stats.carried++;
  }

  // A new card (or new markup for the same card) was written into the paper.
  function onCard(paper) {
    const strong = paper.hidden ? null : paper.querySelector('.score-lead strong');
    if (roll && strong === roll.strong) return;
    const key = paper.dataset.key, to = scoreOf(strong), from = onScreen(), fromKey = shown?.key;
    shown = strong ? {key, text:to} : null;
    // The same card re-rendered with the same value keeps its face and running motion.
    if (roll && to && roll.key === key && roll.to === to && strong) {
      const value = document.createElement('span');
      value.className = 'nm-text';
      value.textContent = to;
      strong.replaceChildren(value, roll.face);
      roll.strong = strong;
      return;
    }
    if (roll) { carry(roll); cancel(roll); }
    // A different card (turned to, or put in place by new data) shows its own value as is.
    if (!to || !from || from === to || fromKey !== key || !motionAllowed()) return;
    roll = prepare(paper, strong, key, from, to);
    if (roll) start(roll);
  }
  function onRest() {
    const paper = article();
    if (!paper) return;
    if (waitingForRest && !moving(paper)) { waitingForRest = false; measureSoon(); }
    if (roll?.phase === 'hold' && !held(paper)) start(roll);
  }

  window.alignArticleInk = alignArticleInk;
  window.ModernNumerals = {stats:() => ({...stats, phase:roll?.phase || null}), spring:{k:SPRING.k, c:SPRING.c, ms99:SPRING.ms99, ms:SPRING.ms, easing:TIMING.easing.slice(0, 6)}};
  const paper = article();
  if (paper) {
    shown = paper.hidden ? null : {key:paper.dataset.key, text:scoreOf(paper.querySelector('.score-lead strong'))};
    new MutationObserver(() => onCard(paper)).observe(paper, {childList:true});
    const rest = new MutationObserver(onRest);
    rest.observe(paper, {attributes:true, attributeFilter:['class']});
    if (deck()) rest.observe(deck(), {attributes:true, attributeFilter:['class']});
  }
  for (const query of [reduceMotion, forcedColors]) query.addEventListener?.('change', () => { if (query.matches && roll) finish(roll); });
  // A font load changes metrics, not the font settings; a resize can change both and the boxes.
  const remeasure = () => { memo.clear(); measureSoon(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', measureSoon, {once:true}); else measureSoon();
  document.fonts?.ready.then(remeasure);
  document.fonts?.addEventListener('loadingdone', remeasure);
  window.addEventListener('resize', () => { fonts.clear(); geometry = {}; remeasure(); }, {passive:true});
})();

;
/* ── modern-morph-icons.js ── */
/* Existing glyphs + the repository's local Morphicons 1.7.1 DOM renderer.
   This layer changes paths only; button actions, ARIA, colour, stroke and hit
   areas remain owned by the editor. No external runtime or icon-pack request.
   Every glyph shares one spring, k420 c30 (ζ .732, response .307 s, overshoot
   3.4 %): inside 0.5 % at 348 ms (ref-apple §5 ≈ UIKit accessory rise .30/.72).
   The layer runs that spring on the triggering event's clock and lands the
   canonical glyph once inside that band. */
(() => {
  'use strict';
  const scope = document.currentScript?.dataset.scope || '';
  // A scoped editor document morphs the dock (data-scope) and, in the new UI only, the
  // tool window's close and minimise glyphs. ⟳ (#toolRf) stays static: the undo toast
  // copies its markup, and a turning arrow would read as "refresh" (button critique #5).
  const HEADER = ['toolX','toolMin','dgX','dgMin'].map(id => 'html.modern-workspace #' + id).join(',');
  const SVGS = scope ? [...scope.split(','), ...HEADER.split(',')].map(s => s.trim() + ' svg').join(',') : 'svg';
  const NS = 'http://www.w3.org/2000/svg';
  const INTERACTIVE = 'button,a[href],label,[role="button"],[role="link"]';
  const SELECTED = '[aria-expanded="true"],[aria-current="page"],[aria-pressed="true"]';
  const GEOMETRY = {path:['d'], circle:['cx','cy','r'], ellipse:['cx','cy','rx','ry'], rect:['x','y','width','height','rx','ry'],
    line:['x1','y1','x2','y2'], polyline:['points'], polygon:['points']};
  const SPRING = Object.freeze({k:420, c:30, band:.005, vmax:14});
  const records = new Map(), failures = new Map(), mismatch = new Map(), handoffs = new Map(), flights = new Set();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const stats = {created:0, destroyed:0, retargeted:0, interrupted:0, settled:0, refreshes:0};
  let library = null, status = 'loading', loadError = '', queued = false, serial = 0, raf = 0;
  const round = x => Math.round(x * 10000) / 10000;

  // ── One spring ───────────────────────────────────────────────────────────
  // Closed form of x'' = k(1−x) − c·x' from x(0)=0, x'(0)=v0 (mass 1): [x, x'] at t seconds.
  const W = Math.sqrt(SPRING.k), Z = SPRING.c / (2 * W), WD = W * Math.sqrt(Math.max(0, 1 - Z * Z));
  function spring(t, v0) {
    const e = Math.exp(-Z * W * t);
    if (WD < 1e-9) { const b = v0 - W; return [1 + e * (b * t - 1), e * (b - W * (b * t - 1))]; }
    const b = (v0 - Z * W) / WD, cs = Math.cos(WD * t), sn = Math.sin(WD * t), err = e * (b * sn - cs);
    return [1 + err, e * (WD * (sn + b * cs)) - Z * W * err];
  }
  // Milliseconds after which the glyph stays inside the band for good (348 from rest).
  function settleMs(v0) {
    let last = 0;
    for (let ms = 1; ms <= 1500; ms++) if (Math.abs(1 - spring(ms / 1000, v0)[0]) > SPRING.band) last = ms;
    return last + 1;
  }
  const SETTLE = settleMs(0);

  // ── Which SVGs morph ─────────────────────────────────────────────────────
  // Morph only the glyph slot a component declares. A menu item owns one icon
  // (.menu-icon); everything else in it, such as the sub-menu chevron inside
  // .menu-text, keeps its own geometry. Chevrons never morph — their turn is CSS.
  // Any SVG opts out with data-morph-ignore on itself or an ancestor.
  function exclusion(svg) {
    if (scope && !svg.closest(scope) && !svg.closest(HEADER)) return 'outside scope';
    if (svg.closest('[data-morph-ignore]')) return 'data-morph-ignore';
    const item = svg.closest('[data-menu]'), glyph = svg.closest('.menu-icon');
    if (item && !(glyph && item.contains(glyph))) return 'menu cue outside .menu-icon';
    if (svg.matches('[class*="chev"]') || svg.closest('[data-icon^="CHEV"]')) return 'chevron cue';
    if (svg.closest('.card-exit, #ambient')) return 'decorative card exit / scene';
    return '';
  }
  const excluded = svg => !!exclusion(svg);

  function describe(svg) {
    const menu = svg.closest('[data-menu]')?.dataset.menu;
    if (menu) return 'menu-' + menu;
    if (svg.closest('#next')) return 'next';
    if (svg.closest('.pick-control')) return 'pick';
    if (svg.closest('#toolX,#dgX')) return 'close';
    if (svg.closest('#toolMin,#dgMin')) return 'minimize';
    if (svg.closest('a[href]')) return 'external';
    const holder = svg.closest('[data-icon]')?.dataset.icon;
    if (holder === 'NEWS') return 'news';
    if (holder === 'CHECK') return 'check';
    if (holder === 'WAIT') return 'history';
    return (holder || 'glyph').toLowerCase();
  }

  // The morph draws one <path> with the SVG's own stroke. A shape that carries its own
  // presentation (class, stroke, fill, transform …) would change on merge, so it keeps
  // its static glyph instead.
  function nodeOf(svg) {
    const shapes = [...svg.children].filter(node => Object.hasOwn(GEOMETRY, node.localName));
    if (!shapes.length || shapes.length !== svg.children.length) throw new Error('No supported SVG geometry');
    return shapes.map(node => {
      const own = [...node.attributes].find(a => !GEOMETRY[node.localName].includes(a.name));
      if (own) throw new Error('Shape keeps its own ' + own.name);
      return [node.localName, Object.fromEntries([...node.attributes].map(a => [a.name, a.value]))];
    });
  }

  function rotated(rest, degrees) {
    // canonicalD contains only absolute M/C/Z coordinates. Rotate the geometry,
    // rather than applying a CSS transform that would bypass Morphicons.
    const angle = degrees * Math.PI / 180, c = Math.cos(angle), s = Math.sin(angle);
    let x = 0, even = true;
    const d = library.canonicalD(rest).replace(/[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi, number => {
      if (even) { x = Number(number); even = false; return '__X__'; }
      const y = Number(number); even = true;
      return round(12 + (x-12)*s + (y-12)*c) + '@' + round(12 + (x-12)*c - (y-12)*s);
    }).replace(/__X__([ ,]*)([-\d.]+)@([-\d.]+)/g, (_,separator,y,nx) => nx + separator + y);
    return P(d);
  }

  // ── Glyph states ─────────────────────────────────────────────────────────
  // Each state keeps its rest glyph's stroke count and order: stroke meets stroke and
  // two strokes never fold into one mid-flight (a state that breaks this falls back to
  // rest and is listed in audit().mismatch). Shared objects are sampled and planned
  // once per page. selected:'hover' = a chosen dock tab holds its lifted glyph, the
  // same on all five.
  function P(d) { return [['path', {d}]]; }
  const NEWS = {
    hover:P('M4 4h13a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1z M18 7h3a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2 M7 8h7M7 12h7M7 16h6'),
    press:P('M4 5h13a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1z M18 8h1a1 1 0 0 1 1 1v8a2 2 0 0 1-2 2 M7 9h7M7 13h7M7 16h5')
  };
  const GLYPHS = {
    'menu-home':{...NEWS, selected:'hover'},
    news:NEWS,
    'menu-feed':{hover:P('M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z M13 2v5h7M8 12h8M8 17h8'),
      press:P('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6M10 13h4M10 17h4'), selected:'hover'},
    'menu-ask':{hover:P('M12 2l2 8L22 12l-8 2L12 22l-2-8L2 12l8-2z'), press:P('M12 5l3 4L19 12l-4 3L12 19l-3-4L5 12l4-3z'), selected:'hover'},
    'menu-thumb':{hover:[['rect',{x:3,y:3,width:18,height:18,rx:2}],['circle',{cx:8.5,cy:7.5,r:1.6}],['path',{d:'M21 15l-5-6L5 21'}]],
      press:[['rect',{x:3,y:3,width:18,height:18,rx:2}],['circle',{cx:9,cy:9,r:1.6}],['path',{d:'M21 17l-6-5L5 21'}]], selected:'hover'},
    'menu-cap':{hover:P('M19.2 4.2 3 11l-1-2.3c-.4-1 .1-2.2 1.1-2.6l12.7-5.3c1-.4 2.2.1 2.6 1.1Z M5.7 4.6l3.5 3.5 M11.5 2.2l3.5 3.6 M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z'),
      press:P('M21 7H3V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z M7 3l2 4 M13 3l2 4 M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z'), selected:'hover'},
    // 러너(gauge): the needle swings up on hover, back on press; the arc stays (two strokes = rest)
    'menu-run':{hover:P('M12 14l2-5.5 M3.34 19a10 10 0 1 1 17.32 0'), press:P('M12 14l5-2 M4.4 18.2a9 9 0 1 1 15.2 0'), selected:'hover'},
    history:{hover:[['circle',{cx:12,cy:12,r:9}],['path',{d:'M12 6v6l4-2'}]], press:[['circle',{cx:12,cy:12,r:9}],['path',{d:'M12 7v5h5'}]], selected:'hover'},
    next:{hover:P('M3 12h18M14 5l7 7-7 7'), press:P('M7 12h14M16 7l5 5-5 5')},
    pick:{hover:P('M5 12l4 5L19 6'), press:P('M7 12.5l2.5 3L17 8'), selected:P('M4.5 12.5 9 17.5 19.5 6')},
    close:{hover:P('M5 5 19 19M19 5 5 19'), press:P('M7 7 17 17M17 7 7 17')},
    minimize:{hover:P('M5 12h14'), press:P('M8 12h8')},
    external:{hover:P('M5 19 19 5M8 5h11v11'), press:P('M8 16 18 6M9 6h9v9')},
    retry:{turn:[-35, -100]}
  };
  const ALIAS = {arrow_r:'next', check:'pick', err:'close', reset:'retry'};
  const strokes = icon => (library.canonicalD(icon).match(/M/g) || []).length;

  function variants(kind, rest) {
    const glyph = GLYPHS[ALIAS[kind] || kind];
    let hover, press;
    if (!glyph) { hover = rotated(rest, 8); press = rotated(rest, -8); }
    else if (glyph.turn) { hover = rotated(rest, glyph.turn[0]); press = rotated(rest, glyph.turn[1]); }
    else ({hover, press} = glyph);
    const out = {rest, hover, press, selected:glyph?.selected === 'hover' ? hover : glyph?.selected || rest};
    const count = strokes(rest);
    for (const state of ['hover', 'press', 'selected']) {
      if (out[state] === rest || strokes(out[state]) === count) continue;
      mismatch.set(kind + ':' + state, {kind, state, rest:count, variant:strokes(out[state])});
      out[state] = rest;
    }
    return out;
  }

  // ── State ────────────────────────────────────────────────────────────────
  // Order: a disabled control shows only whether it is chosen; a press shows through
  // anything; a chosen control holds its chosen glyph (PICK confirms at once, a hover
  // never hides it); keyboard focus reads as hover. Mouse focus left behind by a click
  // or a tap is not hover, so a glyph never sticks after the pointer has gone.
  function visibleFocus(owner) {
    try { return owner.matches(':focus-visible') || !!owner.querySelector(':focus-visible'); }
    catch { return owner.contains(document.activeElement); }
  }
  function stateOf(record) {
    const owner = record.owner;
    if (!owner) return record.pulse ? 'hover' : 'rest';
    const chosen = owner.matches(SELECTED) || !!owner.querySelector('input:checked');
    if (owner.matches(':disabled,[aria-disabled="true"]') || owner.querySelector('input:disabled')) return chosen ? 'selected' : 'rest';
    if (record.pressed) return 'press';
    if (chosen) return 'selected';
    if (record.hover || record.focus || record.pulse) return 'hover';
    return 'rest';
  }

  // ── Motion ───────────────────────────────────────────────────────────────
  // Two ways to travel. States drawn with the same commands in the same order (every
  // authored pair today) interpolate their own coordinates, like a CSS d transition, so
  // a symmetric glyph such as × keeps stroke-to-stroke correspondence instead of
  // spinning through a +. Turning glyphs (⟳), a replacement by another glyph (NEWS →
  // WARN) and any pair drawn differently use Morphicons' polar plan.
  const forms = new WeakMap();
  function form(icon) {
    if (typeof icon === 'string') return {key:'string:' + icon, ops:[], nums:new Float64Array(0)};
    let f = forms.get(icon);
    if (!f) {
      // canonicalD = absolute M/C/Z only. ops: a command letter, or null for a number slot.
      const tokens = library.canonicalD(icon).match(/[MCZ]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi) || [];
      const ops = tokens.map(t => /^[MCZ]$/.test(t) ? t : null);
      f = {ops, key:ops.map(o => o || '#').join(''), nums:Float64Array.from(tokens.filter((_, i) => !ops[i]), Number)};
      forms.set(icon, f);
    }
    return f;
  }
  function draw(f, nums) {
    let d = '', i = 0, number = false;
    for (const op of f.ops) {
      if (op) { d += op; number = false; }
      else { d += (number ? ' ' : '') + Math.round(nums[i++] * 1000) / 1000; number = true; }
    }
    return d;
  }
  function fly(record, target, now) {
    const prior = record.flight;
    let v0 = 0;
    if (prior) {
      // Interrupted mid-flight: the glyph keeps its motion. Heading back maps the old
      // velocity onto the shorter return plan (value-space continuity); any other new
      // target keeps it as Morphicons' own morphTo does.
      v0 = target === prior.from ? -prior.v / Math.max(prior.x, .05) : prior.v;
      v0 = Math.max(-SPRING.vmax, Math.min(SPRING.vmax, v0));
      stats.interrupted++;
    }
    // Where the glyph is now, as coordinates when known: at rest, or mid-way through a
    // coordinate flight. A polar flight's frame is only known to Morphicons.
    const here = prior ? (prior.mode === 'lerp' ? {key:prior.to.key, nums:prior.cur} : null) : form(record.shown);
    const to = form(target);
    const lerp = !record.turn && !!here && here.key === to.key;
    if (!lerp && prior?.mode === 'lerp') record.controller.set(record.path.getAttribute('d'));
    record.flight = {target, from:prior ? prior.target : record.shown, mode:lerp ? 'lerp' : 'polar', to,
      a:lerp ? Float64Array.from(here.nums) : null, cur:lerp ? Float64Array.from(here.nums) : null,
      t0:now, v0, settle:v0 ? settleMs(v0) : SETTLE, ms:0, x:0, v:v0};
    record.shown = null;
    flights.add(record);
    stats.retargeted++;
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function land(record) {
    const flight = record.flight;
    record.flight = null; flights.delete(record);
    if (!flight) return;
    record.controller.set(flight.target);
    record.shown = flight.target;
    stats.settled++;
  }
  function tick(ts) {
    raf = 0;
    for (const record of flights) {
      const flight = record.flight;
      if (!flight) { flights.delete(record); continue; }
      const ms = Math.max(0, ts - flight.t0);
      try {
        if (ms >= flight.settle || !record.svg.isConnected) { land(record); continue; }
        flight.ms = ms;
        [flight.x, flight.v] = spring(ms / 1000, flight.v0);
        if (flight.mode === 'lerp') {
          const {a, cur, to:{nums:b}} = flight, x = flight.x;
          for (let i = 0; i < cur.length; i++) cur[i] = a[i] + (b[i] - a[i]) * x;
          record.path.setAttribute('d', draw(flight.to, cur));
        } else record.controller.seek(flight.target, flight.x);
      } catch (error) { fail(record, flight.target, error); }
    }
    if (flights.size) raf = requestAnimationFrame(tick);
  }
  function show(record, target) {
    record.flight = null; flights.delete(record);
    record.controller.set(target);
    record.shown = target;
  }
  function update(record, instant = false) {
    const state = stateOf(record), target = record.variants[state];
    if (state === record.state && !instant) return;
    record.state = state;
    record.svg.dataset.morphState = state;
    try {
      if (instant || document.hidden || reduce.matches) show(record, target);
      else if ((record.flight ? record.flight.target : record.shown) !== target) fly(record, target, performance.now());
    } catch (error) { fail(record, target, error); }
  }
  // A malformed endpoint leaves the original glyph and action intact: that state falls
  // back to rest, and a record that cannot even draw rest hands back its source SVG.
  function fail(record, target, error) {
    failures.set(record.svg, String(error?.message || error));
    for (const state of Object.keys(record.variants)) if (record.variants[state] === target && state !== 'rest') record.variants[state] = record.variants.rest;
    try { show(record, record.variants.rest); record.state = 'rest'; record.svg.dataset.morphState = 'rest'; }
    catch { destroy(record); }
  }

  // ── Records ──────────────────────────────────────────────────────────────
  function register(svg) {
    if (!library || records.has(svg) || excluded(svg)) return;
    const rest = nodeOf(svg), kind = describe(svg), targets = variants(kind, rest);
    const holder = svg.parentElement, owner = svg.closest(INTERACTIVE), glyph = GLYPHS[ALIAS[kind] || kind];
    // Replace: a holder whose glyph was just swapped (NEWS → WARN) springs from the
    // glyph it showed into the new one instead of cutting.
    const from = !reduce.matches && !document.hidden ? handoffs.get(holder) : null;
    const path = document.createElementNS(NS,'path');
    const controller = library.createMorph(path, from || rest, {reducedMotion:'user'});
    const original = [...svg.childNodes];
    svg.replaceChildren(path);
    svg.dataset.morphIcon = kind;
    svg.dataset.morphId = String(++serial);
    const abort = new AbortController();
    const record = {svg,path,owner,holder,kind,variants:targets,controller,original,abort,turn:!glyph || !!glyph.turn,
      hover:false,focus:false,pressed:false,pulse:false,state:null,timer:0,shown:from || rest,flight:null};
    records.set(svg,record); stats.created++;
    if (owner) {
      const on = (type,fn) => owner.addEventListener(type,fn,{signal:abort.signal});
      on('pointerenter',e => { if(e.pointerType !== 'touch'){record.hover=true;update(record);} });
      on('pointerleave',() => {record.hover=false;record.pressed=false;update(record);});
      on('pointerdown',e => {if(e.button===0){record.pressed=true;update(record);}});
      on('focusin',() => {record.focus=visibleFocus(owner);update(record);});
      on('focusout',() => {queueMicrotask(() => {record.focus=owner.contains(document.activeElement)&&visibleFocus(owner);record.pressed=false;if(svg.isConnected)update(record);});});
      on('keydown',e => {if(e.key==='Enter'||e.key===' '){record.pressed=true;update(record);}});
      on('keyup',e => {if(e.key==='Enter'||e.key===' '){record.pressed=false;update(record);}});
      on('change',() => update(record));
    }
    if (svg.closest('.empty-state')) visibility.observe(svg);
    if (from && from !== library.canonicalD(targets[stateOf(record)])) update(record);
    else update(record,true);
  }

  function destroy(record) {
    clearTimeout(record.timer);
    visibility.unobserve(record.svg);
    record.abort.abort();
    record.flight = null; flights.delete(record);
    record.controller.destroy();
    // A glyph that leaves the morph set (opted out, or detached and possibly
    // re-inserted) gets its source geometry back, never a mid-morph frame.
    if (record.svg.contains(record.path)) {
      record.svg.replaceChildren(...record.original);
      for (const key of ['morphIcon','morphId','morphState']) delete record.svg.dataset[key];
    }
    records.delete(record.svg); failures.delete(record.svg);
    stats.destroyed++;
  }

  function externalArrows(root = document) {
    root.querySelectorAll('.source-story a > span[aria-hidden="true"]').forEach(span => {
      if (scope && !span.closest(scope)) return;
      if (span.textContent.trim() !== '↗') return;
      span.classList.add('morph-external-arrow');
      // Preserve the existing ↗ meaning and its text-size slot with static SVG
      // even if the optional animation module cannot load.
      span.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>';
    });
  }

  function refresh() {
    queued = false; stats.refreshes++;
    for (const record of records.values()) {
      if (record.svg.isConnected && !excluded(record.svg) && record.svg.contains(record.path)) continue;
      const {holder, svg, path} = record;
      if (holder?.isConnected && !holder.contains(svg) && svg.contains(path)) handoffs.set(holder, path.getAttribute('d'));
      destroy(record);
    }
    for (const svg of failures.keys()) if (!svg.isConnected) failures.delete(svg);
    externalArrows();
    if (library) {
      document.querySelectorAll(SVGS).forEach(svg => {
        if (excluded(svg) || records.has(svg) || failures.has(svg)) return;
        try { register(svg); } catch(error) { failures.set(svg,String(error.message||error)); }
      });
      for (const record of records.values()) update(record);
    }
    handoffs.clear();
  }
  function schedule() {
    if (!queued) {queued=true;queueMicrotask(refresh);}
  }

  // An empty state's glyph greets once when it first comes into view.
  const visibility = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const record = records.get(entry.target);
      if (!record || !entry.isIntersecting || reduce.matches || record.revealed) continue;
      record.revealed=true;record.pulse=true;update(record);
      record.timer=setTimeout(() => {record.pulse=false;if(record.svg.isConnected)update(record);},220);
    }
  });
  function release() {
    for (const record of records.values()) if(record.pressed){record.pressed=false;update(record);}
  }
  document.addEventListener('pointerup',release,true);
  document.addEventListener('pointercancel',release,true);
  window.addEventListener('blur',release);
  document.addEventListener('visibilitychange',() => {if(document.hidden){release();for(const r of records.values())update(r,true);}});
  reduce.addEventListener('change',() => {for(const r of records.values())update(r,true);});
  // Re-writing the same class/ARIA value changes no glyph; a batch of only those skips the rescan.
  // Records come in write order, so only the first one per element+attribute holds the value from before
  // the batch: a write that is put back in the same batch (set then remove, open then close) changes nothing.
  const changed = list => {
    const first = new Map();
    return list.some(m => {
      if (m.type!=='attributes') return true;
      const names = first.get(m.target) || first.set(m.target,new Set()).get(m.target);
      if (names.has(m.attributeName)) return false;
      names.add(m.attributeName);
      return m.oldValue!==m.target.getAttribute(m.attributeName);
    });
  };
  const observer = new MutationObserver(list => {if(changed(list))schedule();});

  function audit() {
    const svgs=[...document.querySelectorAll('svg')];
    return {
      status,version:'1.7.1',...stats,
      spring:{k:SPRING.k,c:SPRING.c,zeta:round(Z),responseMs:Math.round(2000*Math.PI/W),band:SPRING.band,settleMs:SETTLE},
      total:svgs.filter(svg=>!excluded(svg)).length,
      registered:records.size,
      live:stats.created-stats.destroyed,
      leak:stats.created-stats.destroyed-records.size,
      flights:flights.size,
      eligible:svgs.filter(svg=>!excluded(svg)).length,
      excluded:svgs.filter(excluded).map(svg=>({kind:describe(svg),reason:exclusion(svg)})),
      missing:svgs.filter(svg=>!excluded(svg)&&!records.has(svg)).map(svg=>({kind:describe(svg),error:failures.get(svg)||'unregistered'})),
      errors:[...(loadError?[loadError]:[]),...[...failures].map(([svg,error])=>({kind:describe(svg),error}))],
      mismatch:[...mismatch.values()],
      textArrows:[...document.querySelectorAll('.source-story a > span')].filter(e=>(!scope||e.closest(scope))&&e.textContent.trim()==='↗').length,
      entries:[...records.values()].map(r=>({id:r.svg.dataset.morphId,kind:r.kind,state:r.state,connected:r.svg.isConnected,progress:r.flight?round(r.flight.x):1,flying:!!r.flight,visible:!!r.svg.getClientRects().length}))
    };
  }
  // One glyph's live motion, cheap enough to sample every frame.
  function inspect(svg) {
    const r = records.get(svg);
    const f = r?.flight;
    return r ? {kind:r.kind,state:r.state,flying:!!f,mode:f?f.mode:null,progress:f?f.x:1,velocity:f?f.v:0,elapsedMs:f?f.ms:0,settleMs:f?f.settle:0} : null;
  }
  const ready = import('./vendor/morphicons/dom.js').then(module => {
    library=module;status='ready';refresh();return true;
  }).catch(error => {status='static-fallback';loadError=String(error.message||error);console.warn('Morphicons unavailable; existing static icons retained.',error);return false;});
  window.ModernMorphIcons = {ready,refresh:schedule,audit,state:inspect};
  function start() {
    externalArrows();
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeOldValue:true,attributeFilter:['aria-expanded','aria-current','aria-pressed','checked','disabled','hidden','class','data-unread','data-pick','data-morph-ignore']});
    refresh();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

}
