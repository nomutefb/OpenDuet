// 폰 홈 맨 위 한 칸 = 인스타(팔로워 띠) ↔ 러너 띠 · 옆으로 밀어 바꿈
//   형 11-16 03:08 클라우드 세션 창(폰 홈 사진) 「이거 원래 상단에 인스타만 보이게 되어있는데 그걸 고정으로 하고 좌우 스냅 스위칭하면 러너 나오게 변경」 · 「좌우에 꺽쇠만 반투명 살짝 미관상 보기 좋게 잇음 될가같아」
//   = 늘 인스타로 시작(「고정」 · 본 판을 기억하지 않음 = 홈에 다시 오면 · 앱을 1분 넘게 떠났다 오면 인스타) · 왼쪽 · 오른쪽 어느 쪽으로 밀어도 다른 판(둘뿐이라 한 바퀴) · 손가락을 따라오다 놓으면 가까운 쪽에 붙음(칸 폭 22% 넘김 · 빠른 튕김 = 넘어감)
//   양옆 꺽쇠 = 옅은 흰(ui/chev.tsx 한 벌 · 누르면 그 방향으로 넘어감) · 두 판을 한 칸에 겹쳐 둠 = 칸 키가 큰 쪽으로 고정 → 넘겨도 아래 뉴스 카드가 안 밀림(./top-swap.css)
//   앞 판(11-15 16:1x) = 러너 띠 + 팔로워 띠를 위아래로 다 보임 → 러너는 넘겨야 보임 · PC 반갈은 이 부품 안 씀(러너 = 왼쪽 위 · 팔로워 = 오른쪽 위 그대로)
import { still as lessStill } from "../ui/less-move";   // 움직임 줄이기 = 기기 설정 또는 앱 스위치(설정 › 화면)
import "./top-swap.css";
import { type PointerEvent as RPE, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Chev } from "../ui/chev";

const EASE = "cubic-bezier(.2,.8,.2,1)", MS = 320, START = 8, PASS = 0.22, FLING = 0.45, AWAY_MS = 60_000;   // 넘김 0.32초 · 8px 움직여야 넘김으로 봄(그 안 = 누름) · 폭 22% · 0.45px/ms · 앱을 1분 넘게 떠났다 오면 인스타
const calm = () => lessStill();
type Grab = { id: number; x: number; y: number; dx: number; lock: boolean; px: number; pt: number; v: number };

//   판 = 여럿(pages · 앞 판 = 둘) — 셋째 = SNS 큰 아이콘 셋(형 11-20 09:20 「…인스타그램이랑 스레드 … x 까지」 · 미토스 ② 「SNS 칸은 없애고 … 아이콘 3개만」 · 봄 11:41 「① 로 가 — 맨 위 넘김 셋째 장 「SNS」 · 큰 아이콘 셋 · 누르면 앱」)
//   한 바퀴 = 끝에서 밀면 처음으로 · 넘기는 동안 보이는 판 = 지금 판 + 들어오는 판 둘뿐(data-nx)
export type SwapPage = { node: ReactNode; label: string };
export function TopSwap({ pages }: { pages: SwapPage[] }) {
  const n = pages.length;
  const [view, setView] = useState(0);   // 0 = 첫 판(인스타) · 늘 여기서 시작
  const box = useRef<HTMLDivElement>(null), ps = useRef<(HTMLDivElement | null)[]>([]);
  const grab = useRef<Grab | null>(null), busy = useRef(false), ate = useRef(false);
  const pane = (i: number) => ps.current[((i % n) + n) % n] || null;
  const width = () => box.current?.clientWidth || 1;
  const at = (x: number) => `translate3d(${x.toFixed(1)}px,0,0)`;
  const rest = () => { for (const p of ps.current) if (p) { p.style.transform = ""; p.removeAttribute("data-nx"); } box.current?.removeAttribute("data-move"); busy.current = false; };
  const toward = (way: -1 | 1) => (((view - way) % n) + n) % n;   // 판이 왼쪽(−1)으로 움직임 = 다음 판 · 오른쪽(1) = 앞 판
  useLayoutEffect(rest, [view]);   // 판이 바뀐 그 그리기에 옮긴 값을 걷음(한 장도 안 튐)
  // 「고정」 = 홈을 다시 볼 땐 인스타 — 홈은 다른 판(#/chan …)이 덮어도 안 내려가서 러너에 남아 있었음(390 폭 실물: 러너 → 채널 요약 → 뒤로 = 러너)
  //   → 판이 덮거나 걷힐 때(hashchange) · 앱을 1분 넘게 떠났다 올 때 = 소리 없이 인스타로(넘기는 중이면 그대로 둠 · 잠깐 다른 앱 다녀온 건 보던 판 그대로)
  useEffect(() => {
    let hid = 0;
    const home = () => { if (!busy.current && !grab.current?.lock) setView(0); };
    const vis = () => { if (document.hidden) hid = Date.now(); else if (hid && Date.now() - hid >= AWAY_MS) home(); };
    window.addEventListener("hashchange", home); document.addEventListener("visibilitychange", vis);
    return () => { window.removeEventListener("hashchange", home); document.removeEventListener("visibilitychange", vis); };
  }, []);

  // dx = 지금 판이 밀린 만큼(왼쪽 −) · 다음 판 = 미는 반대쪽에서 따라 들어옴
  const place = (dx: number) => {
    const cur = pane(view), nxt = pane(toward(dx <= 0 ? -1 : 1)), w = width();
    if (!cur || !nxt || cur === nxt) return;
    box.current?.setAttribute("data-move", "");
    for (const p of ps.current) if (p && p !== nxt) p.removeAttribute("data-nx");
    nxt.setAttribute("data-nx", "");
    cur.style.transform = at(dx); nxt.style.transform = at(dx + (dx <= 0 ? w : -w));
  };
  // 놓음 · 꺽쇠 누름 = 끝자리까지 미끄러짐 · go = 넘어감(아니면 제자리로) · way = 판이 움직이는 쪽(−1 왼 · 1 오른)
  const settle = (dx: number, go: boolean, way: -1 | 1) => {
    const to1 = toward(way), cur = pane(view), nxt = pane(to1), w = width();
    if (!cur || !nxt || cur === nxt) return;
    busy.current = true;
    nxt.setAttribute("data-nx", "");
    box.current?.setAttribute("data-move", "");
    const from = [dx, dx - way * w], to = go ? [way * w, 0] : [0, -way * w];
    const left = Math.abs(to[0] - from[0]) / w, ms = calm() ? 0 : Math.round(MS * Math.max(0.45, Math.min(1, left)));   // 남은 길만큼만(다 밀어 놓고 놓으면 짧게)
    const done = () => { if (go) setView(to1); else rest(); };
    cur.style.transform = at(to[0]); nxt.style.transform = at(to[1]);
    if (!ms || typeof cur.animate !== "function") { done(); return; }
    nxt.animate([{ transform: at(from[1]) }, { transform: at(to[1]) }], { duration: ms, easing: EASE });
    const a = cur.animate([{ transform: at(from[0]) }, { transform: at(to[0]) }], { duration: ms, easing: EASE });
    a.onfinish = done; a.oncancel = done;
  };

  const down = (e: RPE<HTMLDivElement>) => {
    ate.current = false;
    if (busy.current || grab.current?.lock || (e.pointerType === "mouse" && e.button !== 0)) return;   // 넘기는 중 둘째 손가락 = 안 받음 · 안 넘긴 채 밖에서 뗀 옛 손길(마우스)은 새 손길이 덮음
    grab.current = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, lock: false, px: e.clientX, pt: e.timeStamp, v: 0 };
  };
  const move = (e: RPE<HTMLDivElement>) => {
    const g = grab.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x, dy = e.clientY - g.y;
    if (!g.lock) {
      if (Math.abs(dx) < START && Math.abs(dy) < START) return;
      if (Math.abs(dy) > Math.abs(dx)) { grab.current = null; return; }   // 위아래 = 넘김 아님
      g.lock = true; ate.current = true;   // 넘긴 손길 = 누름으로 안 침(팔로워 띠 누름 = 채널 요약)
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* 잡기 못 해도 */ }
    }
    const dt = e.timeStamp - g.pt;
    if (dt > 0) { g.v = 0.7 * ((e.clientX - g.px) / dt) + 0.3 * g.v; g.px = e.clientX; g.pt = e.timeStamp; }
    g.dx = dx; place(dx);
  };
  const up = (e: RPE<HTMLDivElement>) => {
    const g = grab.current;
    if (!g || g.id !== e.pointerId) return;
    grab.current = null;
    if (!g.lock) return;
    const way = g.dx < 0 ? -1 : 1, fling = Math.abs(g.v) > FLING && Math.sign(g.v) === way;
    settle(g.dx, e.type !== "pointercancel" && (Math.abs(g.dx) > width() * PASS || fling), way);
  };
  const flip = (way: -1 | 1) => { if (!busy.current && !grab.current?.lock) settle(0, true, way); };
  return (
    <div ref={box} className="nm-topswap" data-view={view} role="group" aria-label={`${pages.map((g) => g.label).join(" · ")} — 옆으로 밀어 바꿈`}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      onClickCapture={(e) => { if (ate.current) { ate.current = false; e.preventDefault(); e.stopPropagation(); } }}>
      <div className="nm-topswap-track">
        {pages.map((g, i) => <div key={g.label} ref={(el) => { ps.current[i] = el; }} className="nm-topswap-pane" data-on={view === i ? 1 : 0} aria-hidden={view === i ? undefined : true} inert={view === i ? undefined : true}>{g.node}</div>)}
      </div>
      <button type="button" className="nm-topswap-chev l" aria-label={`${pages[toward(1)]?.label} 보기`} onClick={() => flip(1)}><Chev dir="left" size={16} /></button>
      <button type="button" className="nm-topswap-chev r" aria-label={`${pages[toward(-1)]?.label} 보기`} onClick={() => flip(-1)}><Chev dir="right" size={16} /></button>
    </div>
  );
}
