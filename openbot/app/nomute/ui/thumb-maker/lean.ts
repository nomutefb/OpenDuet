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

// ── 결과 확인 박자(형 11-18 22:1x 「실제 러너가 도는 과정에서 포토 에디터 특히, 더 빠르게 할 수 있는 부분」) ──
//   엔진(p07 pollJob)은 「생성」 뒤 5초마다 결과 그림 주소를 한 번씩 두드림 = 결과가 올라온 뒤 알아채기까지 평균 2.5초 · 길면 5초
//   러너 기록(11-13 ~ 11-17 · 11건): 결과는 「생성」 뒤 20 ~ 30초에 뜸 → 그 앞뒤(12 ~ 45초)에만 2초마다 두드림 · 그 밖은 엔진 박자 그대로
//   엔진 손 0 — 엔진이 열어 둔 손잡이(job._tick · 엔진도 화면으로 돌아올 때 이걸 부름)를 밖에서 당김 · 한 번 더 두드리는 값 = 없는 그림 주소 물음 하나(그림은 뜬 뒤 그 물음으로 받은 걸 그대로 씀)
export const FAST_FROM_S = 12, FAST_TO_S = 45, FAST_EVERY_MS = 2000;
type Job = { status?: string; t0?: number; endpoint?: string; batch?: unknown; outs?: { path?: string }[]; done?: unknown[]; _tick?: () => void; _nmPolled?: number };
/** 이 잡을 지금 한 번 더 두드릴까(순수) — 카드 제작 잡(그림 주소를 두드리는 길)만 · 도는 중 · 12 ~ 45초 · 지난 두드림 뒤 2초 */
export function pollNow(j: Job | null | undefined, now: number): boolean {
  if (!j || j.status !== "run" || typeof j._tick !== "function" || typeof j.t0 !== "number") return false;
  if (!(j.endpoint === "/api/thumb" || j.endpoint === "/api/compose" || j.batch)) return false;   // 다른 잡(서버 문을 묻는 길)은 엔진 박자 그대로
  if (!Array.isArray(j.outs) || !j.outs.length) return false;   // 아직 접수 답을 못 받음(두드릴 주소 없음)
  const el = (now - j.t0) / 1000;
  return el >= FAST_FROM_S && el <= FAST_TO_S && now - (j._nmPolled || 0) >= FAST_EVERY_MS;
}
/** 엔진이 켜진 뒤 부름(jobs = 엔진 잡 목록을 주는 손 · ./index.tsx 가 S.JOBS 를 건넴) · 돌려주는 것 = 끄기 · 화면이 가려져 있으면 쉼(엔진도 돌아올 때 스스로 한 번 두드림) */
export function fastPoll(jobsOf: () => unknown): () => void {
  const iv = window.setInterval(() => {
    if (document.hidden) return;
    const got = jobsOf(), jobs = (Array.isArray(got) ? got : []) as Job[], now = Date.now();
    for (const j of jobs) if (pollNow(j, now)) { j._nmPolled = now; try { j._tick!(); } catch { /* 엔진 박자가 받침 */ } }
  }, 1000);
  return () => window.clearInterval(iv);
}
