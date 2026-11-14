// 카드 제작 옆 기둥 글자 단추 → 그림 단추(형 11-14 11:29 봄 옮김 「이제 비디오 에디터가 더 잘만들어져 버렷거든? 구거 참고해서 다시 보완해줘.」 · 봄 11:47 「④로 가」)
//   = 영상 편집 기둥(../video-editor.tsx RAIL_CSS · 형 11-14 05:41 「✓ ② 사진 에디터처럼 그림 단추로 바꿈」)과 같은 꼴 · 원본 판(./markup.ts · 엔진) 손 0 — 글자는 그대로 두고 크기 0 · 그림은 mask(::after · ::before 는 원본이 누르는 넓이로 씀)
//   누름 · 켜짐(.on = 라임) · 잠김(.gs-locked)은 원본 그대로 · 길게 누르면 이름 말풍선(축약은 원본이 길게 = 축약어 등록이라 말풍선 안 띄움)
//   OPA(−60+) = 아래 옵션 칸 OPA 와 같은 값(S.cOpaSel)이라 기둥에선 숨김(봄 11:47 「같은 걸 두 군데 두는 거면 하나로」)
//   기둥이 「헤더 ⌃」 · 부제 칸을 덮지 않게 = 단추 두 줄 + 도크가 기둥 키를 품음(--nm-railh · 영상 편집 see() 와 같은 잼 · 봄 11:47 「덮으면 안 돼」)
const ic = (d: string) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>${d}</svg>`)}")`;

/** 단추 id → [이름, 그림] */
const ICONS: Record<string, [string, string]> = {
  gsBg: ["배경", "<path d='m12 2 9 5-9 5-9-5 9-5z'/><path d='m3 12 9 5 9-5'/><path d='m3 17 9 5 9-5'/>"],
  gsAbbr: ["축약", "<path d='m3 15 4-8 4 8'/><path d='M4 13h6'/><circle cx='18' cy='12' r='3'/><path d='M21 9v6'/>"],
  gsOvOnly: ["배경 합성", "<rect x='3' y='3' width='12' height='12' rx='2'/><rect x='9' y='9' width='12' height='12' rx='2'/>"],
  gsPanFit: ["맞춤", "<path d='M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3'/>"],
  gsPanFill: ["AI 채움", "<path d='M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z'/><path d='M19 16l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z'/>"],
  gsMerge: ["삽입구 합성", "<circle cx='12' cy='12' r='9'/><path d='M14.8 9.5a4 4 0 1 0 0 5'/>"],
  gsMos: ["모자이크", "<rect x='3' y='3' width='18' height='18' rx='2'/><path d='M3 9h18M3 15h18M9 3v18M15 3v18'/>"],
  gsTr: ["번역", "<path d='m5 8 6 6'/><path d='m4 14 6-6 2-3'/><path d='M2 5h12'/><path d='M7 2h1'/><path d='m22 22-5-10-5 10'/><path d='M14 18h6'/>"],
};
const LONG_OWN = new Set(["gsAbbr"]);   // 원본이 길게 누름을 쓰는 단추

const S = ".nm-tm.nm-tm .topdock:not(.dockzoom)";
export const RAIL_ICON_CSS =
  // 단추 두 줄(기둥 폭 70 = 30 × 2 + 사이) · 가름 줄 · OPA 숨김
  `${S} #goSpec{display:grid!important;grid-template-columns:repeat(2,30px);justify-content:center;gap:2px 4px}`
  + `${S} #goSpec .gs-sep,${S} #goSpec #gsOpaOg{display:none!important}`
  + `${S} #goSpec>span:not(.gs-v){display:contents}`   // 맞춤 · AI 채움 · 삽입구 합성 · 번역 감싼 칸 = 같은 격자로
  + `${S} #goSpec .gs-v{font-size:0!important;width:30px!important;min-width:30px!important;height:30px!important;padding:0!important;margin:0!important;display:grid!important;place-items:center;color:rgba(232,234,232,.62)!important;position:relative}`
  + `${S} #goSpec .gs-v[hidden],${S} #goSpec span[hidden]{display:none!important}`
  + `${S} #goSpec .gs-v.on{color:var(--modern-accent)!important}${S} #goSpec .gs-v.gs-locked{opacity:.38}${S} #goSpec .gs-v:active{transform:scale(.86)}`
  + `${S} #goSpec .gs-v::after{content:'';position:static;display:block;width:17px;height:17px;background:currentColor;-webkit-mask:var(--nm-ic) center/contain no-repeat;mask:var(--nm-ic) center/contain no-repeat}`
  + Object.entries(ICONS).map(([id, [, d]]) => `${S} #goSpec #${id}{--nm-ic:${ic(d)}}`).join("")
  // 사진 · 지우기 · 영상 · 링크 넷도 두 줄
  + `${S} #cpRail .trail-g{display:grid!important;grid-template-columns:repeat(2,30px);justify-content:center;gap:2px 4px}${S} #cpRail .trail-g>.cpv-tool{width:30px;height:30px}`
  // 기둥 = 잘리지 않음(스크롤 · 흐림 끔) · 도크가 기둥 키를 품음 = 아래 칸을 안 덮음
  + `${S} .cpprev>.trailwrap{height:auto!important}${S} .trailwrap>.trail-opts{flex:none!important;overflow:visible!important;-webkit-mask-image:none!important;mask-image:none!important}`
  + `${S} .cpprev{min-height:var(--nm-railh,0px)}`
  + ".nm-tm-tip{position:fixed;z-index:2147483000;padding:5px 10px;border-radius:999px;background:rgba(14,15,14,.94);border:1px solid rgba(255,255,255,.16);color:#e8eae8;font:700 12px/1.2 Pretendard,system-ui,sans-serif;white-space:nowrap;pointer-events:none;transform:translate(calc(-100% - 10px),-50%)}";

/** root = .nm-tm · 엔진이 판을 그린 뒤 부름 · 돌려주는 것 = 끄기 */
export function railIcons(root: HTMLElement): () => void {
  for (const [id, [name]] of Object.entries(ICONS)) root.querySelector(`#${id}`)?.setAttribute("aria-label", name);
  const pv = root.querySelector<HTMLElement>("#cpPrev"), rail = root.querySelector<HTMLElement>("#cpRailWrap");
  let ro: ResizeObserver | null = null;
  if (pv && rail) {   // 기둥 키 = 칸 위끝부터 안 잎 요소 아래끝(영상 편집 see() fit 과 같음 · 틀 키는 칸에 묶여 못 잼)
    const fit = () => { const top = pv.getBoundingClientRect().top; let bot = 0; for (const c of Array.from(rail.querySelectorAll<HTMLElement>("*"))) { if (c.children.length) continue; const r = c.getBoundingClientRect(); if (r.height) bot = Math.max(bot, r.bottom - top); } pv.style.setProperty("--nm-railh", `${Math.ceil(bot) + 6}px`); };
    ro = new ResizeObserver(fit); ro.observe(rail); for (const c of Array.from(rail.children)) ro.observe(c); fit();
  }
  let tm = 0, tip: HTMLElement | null = null, eat = false;
  const hide = () => { clearTimeout(tm); if (tip) { const t = tip; tip = null; setTimeout(() => t.remove(), 700); } };
  const down = (ev: PointerEvent) => {
    const b = (ev.target as HTMLElement).closest<HTMLElement>("#goSpec .gs-v[id], #cpRail .cpv-tool"); if (!b || LONG_OWN.has(b.id)) return;
    clearTimeout(tm);
    tm = window.setTimeout(() => {
      const r = b.getBoundingClientRect(), nm = ICONS[b.id]?.[0] || b.getAttribute("aria-label") || "";
      tip = document.createElement("div"); tip.className = "nm-tm-tip"; tip.textContent = b.classList.contains("gs-v") ? `${nm} · ${b.classList.contains("on") ? "켬" : "끔"}` : nm.split(" — ")[0];
      tip.style.left = `${r.left}px`; tip.style.top = `${r.top + r.height / 2}px`; document.body.appendChild(tip); eat = true;
    }, 450);
  };
  const click = (ev: MouseEvent) => { if (eat) { eat = false; ev.preventDefault(); ev.stopPropagation(); } };
  const menu = (ev: MouseEvent) => { const b = (ev.target as HTMLElement).closest<HTMLElement>("#goSpec .gs-v[id], #cpRail .cpv-tool"); if (b && !LONG_OWN.has(b.id)) ev.preventDefault(); };
  root.addEventListener("pointerdown", down);
  for (const k of ["pointerup", "pointercancel", "pointerleave"]) root.addEventListener(k, hide);
  root.addEventListener("click", click, true);
  root.addEventListener("contextmenu", menu);
  return () => {
    ro?.disconnect(); hide();
    root.removeEventListener("pointerdown", down);
    for (const k of ["pointerup", "pointercancel", "pointerleave"]) root.removeEventListener(k, hide);
    root.removeEventListener("click", click, true);
    root.removeEventListener("contextmenu", menu);
  };
}
