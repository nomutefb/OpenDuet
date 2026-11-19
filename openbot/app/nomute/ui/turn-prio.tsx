// 차례 탭 특기 펼침 = 순서도 둘 — 「지금」(일하는 손은 뒤로 · 서버 turn 그대로) · 「일 없을 때」(기준 차례 · 같은 특기 누구 먼저를 여기서 정함)
//   형 11-19 10:06~10:08 dm-bom(봄 옮김): 「같은 특기일때 누구먼저를 설정할수잇게할게.」 「상관없음 or 누구먼저. 이거를 러너에서 설정하게끔.」 「uxd 구름 > 시아 > 이슬 > 루미」
//     「직무가 들어간 애들끼리는 조정가능하게해주고, 근데 티어를 넘어가서 조정할 수는 없게해주면 될듯. ㅎㅎ 애초에 순서도로 표현되어 있으면 편할거같ㄴ애~」
//     10:11 「응 그 배치순서도 기존에 있던거 있는데, 그거는 지금 기준해서 잖아? 그거를 진짜 야무지게만들면. 일 아예 없을때 기준 순서도도 같이 나올수잇을듯한데, 잘탐구해보자. 어캐해야 ux가구성될지」
//   꼴: 두 순서도가 같은 그림(티어 = 1특기 → 2특기 → 3특기 · 세로 줄 + 아래 화살 · 번호는 티어를 이어 셈) · 고르는 줄 = 옛 에디터 영상 편집 줄(낱말 | 낱말 · 고른 것만 강조색)
//   일 없을 때 = 서버 GET prefer(천둥 editor #4352 · 층별 손 · 정한 차례 먼저) · 「상관없음 | 누구 먼저」 · 티어 안에서만 끌어 바꿈 · 저장 = POST prefer {code, mode, order}(형 · 지금 PM)
//   끌기 = 방 목록 고정 줄 손잡이와 같은 손(./room-list.tsx .nm-rgrip · 잡는 칸 따로 · 끄는 동안 리액트 0 · 그 줄 transform 만 · 티어 칸 밖으로 안 나감) · ↑ ↓ 키
//   저장 = 저장 → 게이지 → 체크(./go-button.tsx) · 셈 = ./turn-prio-logic.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type KeyboardEvent, type PointerEvent as RPE, type ReactNode, useRef, useState } from "react";
import { idOf, office } from "../data/office";
import { type BotRow, turnList } from "./bot-desk-logic";
import { FaceImg, usePeople } from "./faces";
import { GoButton } from "./go-button";
import { useMe } from "./pins";
import { type PrioSet, type Tier, dropAt, flatOf, moveIn, reorderable, sameSet, withOrder } from "./turn-prio-logic";
import "./turn-prio.css";

export type PreferRow = { code: string; name?: string; mode: "any" | "order"; source?: "saved" | "base"; order: string[]; tiers: Record<string, string[]> };
type PreferAns = { rows?: PreferRow[] };
export const PREFER_KEY = ["nomute", "prefer"] as const;
export const usePrefer = () => useQuery({ queryKey: PREFER_KEY, queryFn: () => office<PreferAns>("prefer"), retry: false, staleTime: 30_000 });

const tiersFrom = (t: Record<string, string[]> = {}): Tier[] => ["1", "2", "3"].map((k) => ({ rank: +k, who: t[k] || [] })).filter((x) => x.who.length);
const norm = (tiers: Tier[], s: PrioSet): PrioSet => ({ mode: s.mode, order: s.mode === "order" ? flatOf(withOrder(tiers, s.order)) : [] });

/** 손 한 줄(두 순서도 같은 꼴) — 번호 · 얼굴 · 이름 · 꼬리 글. */
function Hand({ w, n, dim, tail, grip }: { w: string; n: number; dim?: boolean; tail?: string; grip?: ReactNode }) {
  const people = usePeople();
  return (
    <li className={`nm-tp-hand${dim ? " dim" : ""}${grip ? "" : " still"}`}>
      {grip}
      <span className="n">{n}</span>
      <span className="face"><FaceImg id={idOf(w, people)} size={22} /></span>
      <b>{w}</b>
      {tail ? <small>{tail}</small> : null}
    </li>
  );
}

/** 지금 순서도 — 서버 turn 그대로(n = 지금 차례 · 일하는 중 = 뒤 · 특기 밖 = 끝 층). */
function NowFlow({ rows, code }: { rows: BotRow[]; code: string }) {
  const l = turnList(rows, code), ranks = [1, 2, 3, 0].map((k) => ({ rank: k, who: l.order.filter((o) => o.rank === k) })).filter((x) => x.who.length);
  if (!ranks.length) return <p className="nm-tp-note">지금 맡길 손이 없어</p>;
  return (
    <>
      <div className="nm-tp-flow" role="list">
        {ranks.map((t) => (
          <div key={t.rank} className="nm-tp-tier" role="listitem">
            <span className="nm-tp-rank">{t.rank ? `${t.rank}특기` : "밖"}</span>
            <ul>{t.who.map((o) => <Hand key={o.who} w={o.who} n={o.n} dim={o.busy || !o.rank} tail={o.busy ? "일하는 중" : ""} />)}</ul>
          </div>
        ))}
      </div>
      {l.out.length ? <p className="nm-tp-note">못 맡김 — {l.out.map((o) => `${o.who}(${o.why})`).join(" · ")}</p> : null}
    </>
  );
}

/** 일 없을 때 순서도 — 기준 차례 · 같은 특기 누구 먼저(상관없음 | 누구 먼저 · 티어 안 끌기 · 저장). */
function BaseFlow({ row, can }: { row: PreferRow; can: boolean }) {
  const qc = useQueryClient();
  const tiers = tiersFrom(row.tiers), base = norm(tiers, { mode: row.mode, order: row.order });
  const [draft, setDraft] = useState<PrioSet | null>(null);
  const cur = norm(tiers, draft || base), shown = withOrder(tiers, cur.order), dirty = !sameSet(cur, base), many = reorderable(tiers);
  const drag = useRef<{ rank: number; from: number; y0: number; el: HTMLElement; lo: number; hi: number } | null>(null);
  const put = (next: Tier[]) => setDraft({ mode: "order", order: flatOf(next) });
  const start = (rank: number, from: number) => (e: RPE<HTMLButtonElement>) => {
    if (!can) return;
    e.preventDefault(); e.stopPropagation();
    const el = e.currentTarget.closest("li") as HTMLElement | null, box = el?.parentElement;
    if (!el || !box) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* 그대로 */ }
    const a = el.getBoundingClientRect(), b = box.getBoundingClientRect();
    drag.current = { rank, from, y0: e.clientY, el, lo: b.top - a.top, hi: b.bottom - a.bottom };   // 티어 칸 밖으로는 안 나감(형 「티어를 넘어가서 조정할 수는 없게」)
    el.classList.add("on");
  };
  const move = (e: RPE<HTMLButtonElement>) => { const d = drag.current; if (d) d.el.style.transform = `translateY(${Math.max(d.lo, Math.min(d.hi, e.clientY - d.y0))}px)`; };
  const end = (e: RPE<HTMLButtonElement>) => {
    const d = drag.current; if (!d) return; drag.current = null;
    d.el.style.transform = ""; d.el.classList.remove("on");
    if (Math.abs(e.clientY - d.y0) < 6) return;   // 거의 안 움직임 = 그대로
    const mids = Array.from(d.el.parentElement?.children || []).map((x) => { const r = x.getBoundingClientRect(); return r.top + r.height / 2; });
    put(moveIn(shown, d.rank, d.from, dropAt(mids, e.clientY, d.from)));
  };
  const key = (rank: number, from: number, n: number) => (e: KeyboardEvent<HTMLButtonElement>) => {
    const to = e.key === "ArrowUp" ? from - 1 : e.key === "ArrowDown" ? from + 1 : -1;
    if (to < 0 || to >= n) return;
    e.preventDefault(); put(moveIn(shown, rank, from, to));
  };
  let no = 0;
  const order = cur.mode === "order";
  return (
    <>
      {many ? (
        <div className="nm-tp-row" role="group" aria-label="같은 특기일 때">
          <span className="lbl">같은 특기일 때</span>
          <span className="ws">
            <button type="button" className={`pc${!order ? " on" : ""}`} aria-pressed={!order} disabled={!can} onClick={() => setDraft({ mode: "any", order: cur.order })}>상관없음</button>
            <i aria-hidden>|</i>
            <button type="button" className={`pc${order ? " on" : ""}`} aria-pressed={order} disabled={!can} onClick={() => setDraft({ mode: "order", order: cur.order })}>누구 먼저</button>
          </span>
        </div>
      ) : null}
      <div className="nm-tp-flow" role="list" data-grip={order && many ? "" : undefined}>
        {shown.map((t) => (
          <div key={t.rank} className="nm-tp-tier" role="listitem">
            <span className="nm-tp-rank">{t.rank}특기</span>
            <ul data-any={!order && t.who.length > 1 ? "" : undefined}>
              {t.who.map((w, i) => (
                <Hand key={w} w={w} n={order || t.who.length < 2 ? ++no : (no += i === 0 ? 1 : 0)}
                  grip={order && t.who.length > 1 ? (
                    <button type="button" className="grip" disabled={!can} aria-label={`${w} 끌어서 차례 바꾸기(${t.rank}특기 안 · ↑ ↓)`}
                      onPointerDown={start(t.rank, i)} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onKeyDown={key(t.rank, i, t.who.length)}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M5 9h14M5 15h14" /></svg>
                    </button>
                  ) : undefined} />
              ))}
            </ul>
          </div>
        ))}
      </div>
      {dirty ? (
        <div className="nm-tp-go">
          <button type="button" className="pc" onClick={() => setDraft(null)}>되돌리기</button>
          <GoButton className="nm-nb-btn" busy="저장 중" disabled={!can}
            go={() => office<PreferAns>("prefer", { method: "POST", body: JSON.stringify(cur.mode === "order" ? { code: row.code, mode: "order", order: cur.order } : { code: row.code, mode: "any" }) })}
            done={(j) => { if (j?.rows) qc.setQueryData(PREFER_KEY, j); else void qc.invalidateQueries({ queryKey: PREFER_KEY }); void qc.invalidateQueries({ queryKey: ["nomute", "bots-sheet"] }); setDraft(null); }}>저장</GoButton>
        </div>
      ) : null}
    </>
  );
}

/** 특기 펼침 몸 — 「지금 | 일 없을 때」 두 순서도. */
export function TurnBody({ code, rows }: { code: string; rows: BotRow[] }) {
  const [view, setView] = useState<"now" | "base">("now");
  const pq = usePrefer(), me = useMe(), can = me?.kind === "human" && me.can_write !== false;
  const row = pq.data?.rows?.find((r) => r.code === code);
  return (
    <div className="nm-tp">
      <div className="nm-tp-row" role="group" aria-label="순서도">
        <span className="lbl">순서도</span>
        <span className="ws">
          <button type="button" className={`pc${view === "now" ? " on" : ""}`} aria-pressed={view === "now"} onClick={() => setView("now")}>지금</button>
          <i aria-hidden>|</i>
          <button type="button" className={`pc${view === "base" ? " on" : ""}`} aria-pressed={view === "base"} onClick={() => setView("base")}>일 없을 때</button>
        </span>
      </div>
      {view === "now" ? <NowFlow rows={rows} code={code} />
        : row ? <BaseFlow row={row} can={can} />
        : <p className="nm-tp-note">{pq.isError ? "기준 차례를 못 읽었어 — 곧 다시 읽어" : "기준 차례 읽는 중"}</p>}
    </div>
  );
}
