// 서랍 「계정 전환」 = 에디터 설정 ▸ 계정 전환(/?pop=account · viewer-src/41-toolRfVis.part loadAcct · paintAcctRow · ACCT_BTNS)을 앱 안으로(봄 11-01 · 형 「눌렀을때 웹으로 연결된 부분이 많아서 불편했어..」)
//   바꾸는 것 = 러너 잡이 쓰는 Claude 계정(저장소 변수 ACTIVE_ACCOUNT) · 같은 길 = GET /api/account(지금 칸) · POST {id} = account-selftest set_active 발사 → 러너가 1분 안쪽에 바꿈
//   원본처럼: 누른 칸 바로 점등 → 20초 뒤 실제 값으로 다시 칠함(발사 실패·체인 거절이면 원래 칸으로) · 같은 칸 다시 누름 = 발사 0 · 열 때마다 새로 읽음
import "./yeta-settings.css";
import "./chan.css";
import "./queue.css";
import "./msgs.css";
import "./memo.css";
import "./genopt.css";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Pane } from "./pane";
import { useQuery } from "@tanstack/react-query";
import { office } from "../data/office";
import "./acct-cards.css";
import { acctOrder } from "./acct-order";

const ACCTS: [string, string][] = [["CLD_01", "ems1130g"], ["CLD_02", "muteno"], ["CLD_03", "ems1130N(ems1130@naver.com) · 기본"]];   // 원본 ACCT_BTNS · title 그대로
// 카드 다발(형 11-09 05:20 임시방 「메인 claude 계정 고르는 선택지는 이거로 계장 값은ㅇ느낌」 · 96975.mp4 · 시아 05:21 꼴 · 봄 24) · 뜸) — 앞 카드 = 지금 러너 계정 · 뒤 카드 누름/‹ › /← → = 그 계정으로(원래 pick 길 그대로)
const CARD: Record<string, { mail: string; name: string; tint: string }> = {
  CLD_01: { mail: "ems1130g@gmail.com", name: "ems1130g", tint: "#1f5c45" },
  CLD_02: { mail: "muteno@pm.me", name: "muteno", tint: "#7a4a2a" },
  CLD_03: { mail: "ems1130@naver.com", name: "naver", tint: "#24306b" },
};
type Row = { key: string; name: string; value?: string; note?: string };
const pct = (note = "", w: "5시간" | "7일") => { const m = note.match(new RegExp(w + "\\s*(\\d+)%")); return m ? +m[1] : null; };
const refill = (note = "") => { const m = note.match(/7일[^(]*\(다시 참 ([^)]+)\)/); return m && m[1] !== "-" ? m[1] : ""; };
const maskMail = (m: string) => { const [u, d] = m.split("@"); return u.slice(0, 3) + "•••@" + (d || ""); };
function useAcctRows() {
  const q = useQuery({ queryKey: ["nomute", "status"], queryFn: () => office<{ cats: { id: string; rows: Row[] }[] }>("status"), refetchInterval: 60_000, retry: false });
  const rows = q.data?.cats?.find((c) => c.id === "acct")?.rows || [];
  return (mail: string) => rows.find((r) => r.key === "claude:" + mail);
}
function Bar({ label, v }: { label: string; v: number | null }) {
  return <span className="acx-bar"><i>{label}</i><b style={{ width: `${v ?? 0}%` }} data-low={v !== null && v < 10 ? "1" : undefined} data-mid={v !== null && v >= 10 && v < 30 ? "1" : undefined} /><em>{v === null ? "—" : `${v}%`}</em></span>;
}
function AcctCards({ id, busy, pick }: { id: string; busy: boolean; pick: (v: string) => void }) {
  const row = useAcctRows();
  const ids = ACCTS.map(([v]) => v), { known, front, order } = acctOrder(ids, id);   // 앞 → 뒤 · 「지금」 = known 일 때만(모루 09:13)
  const step = (d: number) => { if (!busy) pick(ids[(front + d + ids.length) % ids.length]); };
  return (
    <div className="acx" tabIndex={0} role="listbox" aria-label="러너 Claude 계정" onKeyDown={(e) => { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); }}>
      <div className="acx-stack">
        {order.slice().reverse().map((v) => {
          const k = order.indexOf(v), now = known && k === 0, c = CARD[v], r = row(c.mail), n = r?.note || "", w7 = pct(n, "7일");
          return (
            <button key={v} type="button" role="option" aria-selected={now} disabled={busy || now} className={`acx-card${k === 0 ? " front" : ""}${now ? " now" : ""}${w7 !== null && w7 < 10 ? " low" : ""}`} style={{ "--k": k, "--tint": c.tint } as CSSProperties} onClick={() => pick(v)} title={now ? "지금 러너 계정" : `${c.name} 으로`}>
              <span className="acx-top"><small>CLAUDE {v.slice(-2)}</small><span className="acx-ini">{c.name[0].toUpperCase()}</span></span>
              <b className="acx-name">{c.name}</b>
              <span className="acx-bars"><Bar label="5시간" v={pct(n, "5시간")} /><Bar label="7일" v={w7} /></span>
              <span className="acx-mail">{maskMail(c.mail)}</span>
              <span className="acx-foot"><span><small>쓰는 곳</small>러너{now ? " · 지금" : ""}</span><span><small>다시 참</small>{refill(n) || "—"}</span></span>
              {w7 !== null && w7 < 10 ? <span className="acx-tag">교대 때</span> : null}
            </button>
          );
        })}
      </div>
      <div className="acx-nav"><button type="button" aria-label="앞 계정" disabled={busy} onClick={() => step(-1)}>‹</button>{ids.map((v, i) => <i key={v} className={i === front ? "on" : ""} />)}<button type="button" aria-label="다음 계정" disabled={busy} onClick={() => step(1)}>›</button></div>
    </div>
  );
}

export function AcctModal() {
  const [id, setId] = useState(""), [now, setNow] = useState("러너 · 읽는 중"), [busy, setBusy] = useState(false);
  const live = useRef(true), tm = useRef(0);
  const load = useCallback(async () => {   // 원본 loadAcct
    try {
      const r = await fetch("/api/account", { cache: "no-store", credentials: "same-origin" });
      const j = await r.json();
      if (!live.current) return;
      if (!r.ok || j.error) { setNow("러너 · 못 읽음"); return; }
      setId(j.id || ""); setNow(j.id ? "러너" : "러너 · " + (j.acct || "?"));
    } catch { if (live.current) setNow("러너 · 못 읽음"); }
  }, []);
  useEffect(() => { live.current = true; void load(); return () => { live.current = false; window.clearTimeout(tm.current); }; }, [load]);
  const pick = async (v: string) => {   // 원본 ACCT_BTNS click
    if (busy || id === v) return;
    setBusy(true); const prev = id; setId(v); setNow("러너 · 바꾸는 중");
    try {
      const r = await fetch("/api/account", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: v }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) { setId(prev); setNow("러너 · 실패"); }
      else tm.current = window.setTimeout(() => void load(), 20000);   // 러너가 변수를 바꾼 뒤 실제 값으로 다시 칠함
    } catch { setId(prev); setNow("러너 · 실패"); }
    setBusy(false);
  };
  return (
    <Pane title="계정 전환">
      <div className="yeta-set mt-2">
        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo nm-gopt">
          <span className="ycd-nm yset-ttl">계정 전환</span>
          <div className="row">
            <span className="lab" aria-live="polite">{now}</span>
          </div>
          <AcctCards id={id} busy={busy} pick={(v) => void pick(v)} />
        </div>
      </div>
    </Pane>
  );
}
