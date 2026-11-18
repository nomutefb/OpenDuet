// 카드 제작 판을 가볍게 — 원본 옷이 :has() 로 묻던 것을 「그 상태를 아는 쪽이 다는 표시」로(../has-flags.ts 와 같은 길 · 표 = ./tools/lean-rules.mjs)
//   엔진(./engine p01~p14) · 판(./markup.ts)은 손 0 — 엔진이 클래스를 바꾸는 것을 밖에서 보고 표시만 닮

/** 판에 보이는 입력 칸이 하나도 없나 = 원본 줄 `.panel:has(#reelsBox.none):has(#rOptHead.none):has(#spHead.none):not(:has(#optCards > .scard:not(.none))):not(:has(#imgeditBox:not(.none)))` 와 같은 셈 */
export function isBare(panel: ParentNode): boolean {
  return !!panel.querySelector("#reelsBox.none") && !!panel.querySelector("#rOptHead.none") && !!panel.querySelector("#spHead.none")
    && !panel.querySelector("#optCards > .scard:not(.none)") && !panel.querySelector("#imgeditBox:not(.none)");
}

/** root = .nm-tm · 엔진이 판을 그린 뒤 부름 · 그 다섯 조건에 걸린 요소의 class 만 지켜봄(판 전체를 보지 않음) · 돌려주는 것 = 끄기 */
export function watchBare(root: HTMLElement): () => void {
  const panel = root.querySelector<HTMLElement>(".panel");
  if (!panel) return () => {};
  const sync = () => panel.toggleAttribute("data-nm-bare", isBare(panel));
  const cls = { attributes: true, attributeFilter: ["class"] };
  const mo = new MutationObserver((recs) => {
    for (const r of recs) for (const n of Array.from(r.addedNodes)) if (n instanceof HTMLElement && n.matches(".scard")) mo.observe(n, cls);   // 새로 꽂힌 옵션 칸(엔진이 칸을 옮겨 심음)도 지켜봄
    sync();
  });
  for (const el of Array.from(panel.querySelectorAll("#reelsBox, #rOptHead, #spHead, #imgeditBox, #optCards > .scard"))) mo.observe(el, cls);
  const cards = panel.querySelector("#optCards");
  if (cards) mo.observe(cards, { childList: true });
  sync();
  return () => { mo.disconnect(); panel.removeAttribute("data-nm-bare"); };
}
