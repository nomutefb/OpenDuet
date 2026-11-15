// CLI 계정 우선순위 = 손에 쥔 카드 다발(형 11-16 03:0x 클라우드 세션 · 영상 962a3255 「Switching cards」 120프레임을 장면마다 봄)
//   형 원문: 「내 계정 cli 4개인가 3개 카드도 이런식으로 고프레임.유지해서 우선순위 설정하는 모듈」 · 「실제러 그렇게 반영되게 해주고」 · 「각각 카드에 기한 갱신일 한도 나오면 됨 요금제랑」
//   맨 앞 카드 = 1순위 · 차례 바꾸기 = 앞 카드 끌어 넘기기(맨 뒤로) · 뒤 카드 누르기(맨 앞으로) · ‹ › · ← →
//   실제 반영 = 서버 profile/acctprio 에 차례를 적음(형만) → 몸의 계정 교대 도구(claude-state tools/몸이사/18-계정-교대.py)가 다음 계정을 고를 때 이 차례를 먼저 봄
//   고프레임 = 끄는 동안 리액트를 안 거치고 그 카드의 transform 만 바꿈 · 자리 옮김도 transform · opacity 뿐(합성 단계) · 그림자 · 색은 안 움직임
//   셈 = ./acct-prio-logic.ts(순수 · 시험 있음) · 재료 = 작동 표 「계정 상태」 줄(GET status)
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type CSSProperties, type KeyboardEvent, type PointerEvent as RPE, useEffect, useRef, useState } from "react";
import { office } from "../data/office";
import { type AcctRow, type PrioCard, cardsOf, lastToFront, maskMail, orderOf, payKo, resetKo, sameOrder, toBack, toFront, tone, usable } from "./acct-prio-logic";
import { flash } from "./flash";
import "./acct-prio.css";

type Prio = { ok?: boolean; me?: string; order?: string[]; default?: boolean; at?: number; by?: string };
const TINTS = ["#1f5c45", "#7a4a2a", "#24306b", "#6b2447", "#3d3d42", "#2a5560"];   // 카드마다 제 색(계정 전환 카드 다발의 색 + 영상의 넷째 색) · 계정 번호로 고름 = 차례가 바뀌어도 그 계정은 같은 색
const FLING = 84, FLY_MS = 190, SAVE_MS = 650;

export function AcctPrio() {
  const qc = useQueryClient();
  const st = useQuery({ queryKey: ["nomute", "status"], queryFn: () => office<{ cats: { id: string; rows: AcctRow[] }[] }>("status"), refetchInterval: 60_000, retry: false });
  const pq = useQuery({ queryKey: ["nomute", "acctprio"], queryFn: () => office<Prio>("profile/acctprio"), retry: false, staleTime: 30_000 });
  const cards = cardsOf(st.data?.cats?.find((c) => c.id === "acct")?.rows || []);
  const saved = pq.data?.order || [], base = orderOf(cards, saved), baseKey = base.join("|");
  const can = pq.data?.me === "형";   // 차례 바꾸기 = 형만(서버가 같은 것을 한 번 더 봄)
  const [order, setOrder] = useState<string[]>([]);
  const [save, setSave] = useState<"" | "wait" | "saving" | "ok" | "fail">("");
  const dirty = useRef(false), timer = useRef(0), seq = useRef(0);
  useEffect(() => { if (!dirty.current) setOrder(base); }, [baseKey]);   // eslint-disable-line react-hooks/exhaustive-deps -- 서버 차례가 바뀌면(내가 만지는 중이 아닐 때만) 따라감
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const by = new Map(cards.map((c) => [c.mail, c]));
  const list = (order.length ? order : base).filter((m) => by.has(m));

  // 저장 = 마지막 손 0.65초 뒤 한 번(여러 번 넘겨도 서버엔 끝 차례만) · 실패 = 서버 차례로 되돌리고 한 줄
  const commit = (next: string[]) => {
    setOrder(next); dirty.current = true; setSave("wait");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const mine = ++seq.current; setSave("saving");
      office<Prio>("profile/acctprio", { method: "POST", body: JSON.stringify({ order: next }) })
        .then((j) => { if (mine !== seq.current) return; dirty.current = false; qc.setQueryData<Prio>(["nomute", "acctprio"], (old) => ({ ...(old || {}), ...j, me: old?.me })); setSave("ok"); })
        .catch((e) => { if (mine !== seq.current) return; dirty.current = false; setOrder(base); setSave("fail"); flash(`계정 차례를 못 적었어 — ${e instanceof Error ? e.message : "서버 답 없음"}`); });
    }, SAVE_MS);
  };
  const move = (fn: (o: string[]) => string[]) => { if (!can || list.length < 2) return; const next = fn(list); if (!sameOrder(next, list)) commit(next); };

  // 앞 카드 끌기 — 끄는 동안은 그 카드 style 만(다시 그리기 0) · 놓을 때 멀리 갔으면 날려 보낸 뒤 맨 뒤로 · 아니면 제자리로 튕겨 돌아옴
  const drag = useRef<{ id: number; x: number; y: number; dx: number; dy: number; el: HTMLElement; moved: boolean } | null>(null);
  const flying = useRef(false);
  const settle = (el: HTMLElement) => { el.classList.remove("drag"); el.style.transform = ""; };
  const down = (e: RPE<HTMLButtonElement>) => {
    if (!can || flying.current || list.length < 2 || e.button !== 0) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, dy: 0, el: e.currentTarget, moved: false };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* 못 잡아도 끌기는 됨 */ }
  };
  const drift = (e: RPE<HTMLButtonElement>) => {
    const d = drag.current; if (!d || d.id !== e.pointerId) return;
    d.dx = e.clientX - d.x; d.dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(d.dx, d.dy) < 4) return;
    if (!d.moved) { d.moved = true; d.el.classList.add("drag"); }
    d.el.style.transform = `translate3d(${d.dx}px, ${d.dy}px, 0) rotate(${(d.dx * 0.06).toFixed(2)}deg)`;
  };
  const up = (e: RPE<HTMLButtonElement>) => {
    const d = drag.current; if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    try { d.el.releasePointerCapture(d.id); } catch { /* 이미 놓음 */ }
    if (!d.moved) return;
    if (e.type === "pointerup" && Math.hypot(d.dx, d.dy) > FLING) {   // 날려 보냄 → 맨 뒤로
      const k = 1.9, el = d.el; flying.current = true;
      el.classList.remove("drag"); el.classList.add("fly");
      el.style.transform = `translate3d(${d.dx * k}px, ${d.dy * k}px, 0) rotate(${(d.dx * 0.1).toFixed(2)}deg)`;
      window.setTimeout(() => { el.classList.remove("fly"); el.style.transform = ""; flying.current = false; move(toBack); }, FLY_MS);
    } else settle(d.el);   // 덜 끌었거나 끊긴 손(pointercancel) = 제자리
  };
  const key = (e: KeyboardEvent) => { if (e.key === "ArrowRight") { e.preventDefault(); move(toBack); } if (e.key === "ArrowLeft") { e.preventDefault(); move(lastToFront); } };

  if (st.isPending) return <p className="acp-note">읽는 중…</p>;
  if (!cards.length) return <p className="acp-note">{st.isError ? "계정 상태를 못 읽었어 — 잠깐 뒤 다시 열어 줘" : "계정 줄이 아직 없어(몸 보고를 기다리는 중)"}</p>;
  const front = by.get(list[0]);
  const firstUsable = list.map((m) => by.get(m)!).find(usable);
  return (
    <div className="acp" tabIndex={0} role="listbox" aria-label="CLI 계정 우선순위 — 앞 카드가 1순위" aria-orientation="horizontal" onKeyDown={key}>
      <div className="acp-stack" style={{ "--n": list.length } as CSSProperties}>
        {cards.map((c) => {
          const k = list.indexOf(c.mail), isFront = k === 0, t7 = tone(c.d7);
          return (
            <button key={c.mail} type="button" role="option" aria-selected={isFront} aria-label={`${k + 1}순위 ${c.name} · 요금제 ${c.plan || "모름"} · 한도 7일 ${c.d7 === null ? "모름" : c.d7 + "%"} · 갱신 ${resetKo(c)} · 기한 ${payKo(c)}${isFront ? "" : " · 누르면 1순위로"}`}
              className={`acp-card${isFront ? " front" : ""}${c.ended ? " ended" : ""}`} style={{ "--k": k, "--tint": TINTS[(c.no - 1 + TINTS.length * 9) % TINTS.length] } as CSSProperties}
              onPointerDown={isFront ? down : undefined} onPointerMove={isFront ? drift : undefined} onPointerUp={isFront ? up : undefined} onPointerCancel={isFront ? up : undefined} onLostPointerCapture={isFront ? up : undefined}
              onClick={() => { if (!isFront) move((o) => toFront(o, c.mail)); }}>
              <span className="acp-top"><small>CLAUDE · {k + 1}순위</small><i aria-hidden>{c.name[0].toUpperCase()}</i></span>
              <b className="acp-name">{c.name}</b>
              <span className="acp-plan"><svg viewBox="0 0 30 22" width="30" height="22" aria-hidden><rect x=".75" y=".75" width="28.5" height="20.5" rx="4" /><path d="M.75 8h9M.75 14h9M20.25 8h9M20.25 14h9M9.75.75v20.5M20.25.75v20.5" /></svg><span><small>요금제</small>{c.plan || "—"}</span></span>
              <span className="acp-mail">{maskMail(c.mail)}</span>
              <span className="acp-foot">
                <span data-t={t7}><small>한도</small>{c.d7 === null ? "—" : `7일 ${c.d7}%`}{c.h5 !== null && c.h5 < 20 ? <em> · 5시간 {c.h5}%</em> : null}{/* 5시간 창 = 모자라 교대 때 건너뛸 때만(늘 적으면 칸이 넘침) */}</span>
                <span><small>갱신일</small>{resetKo(c)}</span>
                <span data-t={c.ended ? "low" : undefined}><small>기한</small>{payKo(c)}</span>
              </span>
              <span className="acp-bar" aria-hidden><b data-t={t7} style={{ transform: `scaleX(${(c.d7 ?? 0) / 100})` }} /></span>
              {c.ended ? <span className="acp-tag">결제 끝</span> : t7 === "low" ? <span className="acp-tag">교대 때</span> : null}
            </button>
          );
        })}
      </div>
      <div className="acp-nav">
        <button type="button" aria-label="맨 뒤 카드를 앞으로" disabled={!can || list.length < 2} onClick={() => move(lastToFront)}>‹</button>
        {cards.map((c) => <i key={c.mail} className={c.mail === list[0] ? "on" : ""} />)}
        <button type="button" aria-label="앞 카드를 맨 뒤로" disabled={!can || list.length < 2} onClick={() => move(toBack)}>›</button>
      </div>
      <ol className="acp-rank" aria-label="지금 차례">{list.map((m, i) => { const c = by.get(m)!; return <li key={m} data-off={!usable(c) || undefined}><button type="button" disabled={!can || i === 0} title={usable(c) ? (i ? "누르면 1순위로" : "") : c.ended ? "결제가 끝나 교대 때 건너뜀" : "한도를 못 읽었거나 5시간 창이 모자라 지금은 건너뜀"} onClick={() => move((o) => toFront(o, m))}><b>{i + 1}</b>{c.name}</button></li>; })}</ol>
      <p className="acp-note" aria-live="polite">
        {!can ? (pq.isError ? "차례를 못 읽었어 · 보기만 돼" : "차례 바꾸기 = 형 자리에서만") : save === "saving" || save === "wait" ? "적는 중…" : save === "fail" ? "못 적었어 · 앞 차례로 되돌림" : `${save === "ok" ? "적었어 · " : ""}교대 때 ${firstUsable ? `${firstUsable.name} 부터` : "고를 계정이 없어"}${front && firstUsable && front.mail !== firstUsable.mail ? `(1순위 ${front.name} = ${front.ended ? "결제 끝" : "지금 못 씀"})` : ""}`}
      </p>
    </div>
  );
}

/** 설정 줄 옆 한 마디 = 지금 1순위 계정 이름. */
export function useAcctPrioSum(): string {
  const st = useQuery({ queryKey: ["nomute", "status"], queryFn: () => office<{ cats: { id: string; rows: AcctRow[] }[] }>("status"), refetchInterval: 60_000, retry: false, enabled: false });
  const pq = useQuery({ queryKey: ["nomute", "acctprio"], queryFn: () => office<Prio>("profile/acctprio"), retry: false, staleTime: 30_000, enabled: false });
  const cards: PrioCard[] = cardsOf(st.data?.cats?.find((c) => c.id === "acct")?.rows || []);
  const first = orderOf(cards, pq.data?.order || [])[0];
  return first ? `1순위 ${cards.find((c) => c.mail === first)?.name || ""}` : "";
}
