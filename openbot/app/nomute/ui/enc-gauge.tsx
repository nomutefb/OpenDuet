// 미디어 게이지(형 11-11 08:14 번개 1:1 「셋다 가는 중일 땐 미디어 좌측에 간단하게 게이지로 표시되게 해줘 / 아주 작게 / 영상이면 / 영상 00% / 파동 00% / 자막 00% / 다 공유되먼 완료」 · 「사진이면 사진」)
//   + 라임 테두리(형 11-11 06:35 봄 1:1 「사진도 보내서 볼수잇게되면 테두리에 라임띄어줘」 · 봄이 옮김) = 봇이 읽을 수 있게 된 미디어
//   묻는 곳 = 화면에 떠 있는 글의 경로만 모아 한 번에(30 까지) · 가는 중인 것만 3초마다 다시 · 탭이 숨으면 쉼 · 셈 = ./enc-logic.ts(순수)
import { type CSSProperties, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { office } from "../data/office";
import { type EncCell, type EncItems, type Gauge, encOk, encWanted, gaugeOf, kindOf, nextAsk, encQuiet } from "./enc-logic";

const cells = new Map<string, EncCell>();                    // 경로 → 서버 답
const want = new Map<string, { n: number; ts: number }>();   // 화면에 떠 있는 경로(몇 군데서 · 그 글 때)
const due = new Map<string, number>();                       // 경로 → 다음 물을 때(0 = 더 안 물음)
const seen = new Set<string>();                              // 이 화면에서 가는 걸 본 경로(「완료」 글 · 퍼짐)
const okAt = new Map<string, number>();                      // 이 화면에서 닿는 순간을 본 때(퍼짐은 그때 한 번)
const subs = new Set<() => void>();
let ver = 0, timer = 0, busy = false;
const POP_MS = 2400;

const going = (c?: EncCell) => !!c && !c.ready && !!c.stage && c.stage !== "none";
function plan(ms = 1000) { if (!timer && want.size) timer = window.setTimeout(tick, ms); }
async function tick() {
  timer = 0;
  if (busy || document.visibilityState === "hidden") return plan();
  const now = Date.now();
  const ask = [...want.keys()].filter((p) => { const d = due.get(p); return d === undefined || (d > 0 && d <= now); }).slice(0, 30);
  if (ask.length) {
    busy = true;
    try {
      const j = await office<{ items?: EncItems }>(`encstate?${ask.map((p) => `p=${encodeURIComponent(p)}`).join("&")}`);
      const t = Date.now();
      let changed = false;
      for (const p of ask) {
        const c: EncCell = j.items?.[p] || { stage: "none" }, old = cells.get(p);
        if (going(c) || going(c.parts?.stt)) seen.add(p);
        if (c.ready && old && !old.ready && seen.has(p)) okAt.set(p, t);
        if (JSON.stringify(old) !== JSON.stringify(c)) { cells.set(p, c); changed = true; }
        const n = nextAsk(c, kindOf(p), want.get(p)?.ts || 0, t);
        due.set(p, n ? t + n : 0);
      }
      if (changed) { ver++; subs.forEach((f) => f()); }
    } catch { for (const p of ask) due.set(p, Date.now() + 10_000); }   // 서버가 잠깐 안 받음 = 10초 뒤 다시(화면엔 앞 값 그대로)
    busy = false;
  }
  if ([...want.keys()].some((p) => due.get(p) !== 0)) plan();
}
if (typeof document !== "undefined") document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") plan(200); });
const sub = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

export type EncView = { gauge: Gauge | null; done: boolean; ok: (p: string) => boolean; pop: (p: string) => boolean };
/** 글 하나의 게이지 · 미디어마다 「봇이 읽을 수 있음」 */
export function useEnc(m: { files?: string[]; ts: number; room?: string; kind?: string; mirror_by?: string }): EncView {
  const key = (m.files || []).join("|"), quiet = encQuiet(m.room || "", m.kind || "", m.mirror_by);
  const paths = useMemo(() => (quiet ? [] : encWanted(m.files, m.ts)), [key, m.ts, quiet]);   // 형 1:1 봇 글 = 묻지도 그리지도 않음(encQuiet)   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!paths.length) return undefined;
    for (const p of paths) want.set(p, { n: (want.get(p)?.n || 0) + 1, ts: m.ts });
    plan(50);
    return () => { for (const p of paths) { const w = want.get(p); if (w && w.n > 1) want.set(p, { ...w, n: w.n - 1 }); else want.delete(p); } };
  }, [paths, m.ts]);
  const v = useSyncExternalStore(sub, () => ver, () => 0);
  const [, setBeat] = useState(0);
  const now = Date.now();
  const view = useMemo(() => {
    const items: EncItems = Object.fromEntries(paths.map((p) => [p, cells.get(p)]));
    const g = paths.length ? gaugeOf(m.files, items, now) : null;
    // 다 닿음 = 「완료」 글 · 라임 테두리 대신 옆 라임 ✓ 하나를 늘(움짤 옆 ✓ 와 같은 꼴 · 형 11-12 16:42 봄 1:1 「그리고 이거 테두리가 씌일필요는없을거같고, 그 옆에 체크표시면될듯, 그 움짤이랑 동일하게. 완료 대신」)
    const done = !!g && g.done;
    return { gauge: g, done, wait: !!g && !g.done };
  }, [paths, v, Math.floor(now / 5000)]);   // eslint-disable-line react-hooks/exhaustive-deps
  // 때가 지나 바뀌는 것(자막 줄 빼기 · 「완료」 글 거두기 · 퍼짐 끝)만 5초마다 다시 그림 — 그릴 게 없으면 안 돎
  useEffect(() => { if (!view.wait) return undefined; const t = window.setInterval(() => setBeat((x) => x + 1), 5000); return () => window.clearInterval(t); }, [view.wait]);
  return { gauge: view.gauge, done: view.done, ok: (p) => encOk(cells.get(p)), pop: (p) => Date.now() - (okAt.get(p) || 0) < POP_MS };
}

/** 미디어 옆 아주 작은 글 줄 — 가는 중 = 「영상 42%」 줄들 + 가는 막대 · 다 닿음 = 「완료」 */
export function EncGauge({ e }: { e: EncView }) {
  const g = e.gauge;
  if (!g) return null;
  if (e.done) return <span className="nm-encg ok" role="img" aria-label="봇이 읽을 수 있음"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden><path d="M3.2 8.6l3 3 6.6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>;
  return (
    <span className="nm-encg" role="status" aria-label="봇에게 가는 중">
      {g.lines.map((l) => (
        <span key={l.k} className={`ln${l.done ? " d" : ""}${l.fail ? " f" : ""}`} title={l.why}>
          <b>{l.label}</b><em>{l.fail ? "멈춤" : `${l.pct}%`}</em><i style={{ "--p": `${l.pct}%` } as CSSProperties} />
        </span>
      ))}
    </span>
  );
}
/** 닿은 미디어 테두리 class — 형 11-12 16:42 「테두리가 씌일필요는없을거같고」 = 늘 빈 줄(닿음 표시는 EncGauge ✓ 하나 · 부르는 곳은 그대로 둠) */
export const encRing = (_e: EncView, _p: string) => "";
