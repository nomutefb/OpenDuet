// 서랍 「계정 전환」 = 에디터 설정 ▸ 계정 전환(/?pop=account · viewer-src/41-toolRfVis.part loadAcct · paintAcctRow · ACCT_BTNS)을 앱 안으로(봄 11-01 · 형 「눌렀을때 웹으로 연결된 부분이 많아서 불편했어..」)
//   바꾸는 것 = 러너 잡이 쓰는 Claude 계정(저장소 변수 ACTIVE_ACCOUNT) · 같은 길 = GET /api/account(지금 칸) · POST {id} = account-selftest set_active 발사 → 러너가 1분 안쪽에 바꿈
//   원본처럼: 누른 칸 바로 점등 → 20초 뒤 실제 값으로 다시 칠함(발사 실패·체인 거절이면 원래 칸으로) · 같은 칸 다시 누름 = 발사 0 · 열 때마다 새로 읽음
import "./yeta-settings.css";
import "./chan.css";
import "./queue.css";
import "./msgs.css";
import "./memo.css";
import "./genopt.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pane } from "./pane";

const ACCTS: [string, string][] = [["CLD_01", "ems1130g"], ["CLD_02", "muteno"], ["CLD_03", "ems1130N(ems1130@naver.com) · 기본"]];   // 원본 ACCT_BTNS · title 그대로

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
            <span className="opts">{ACCTS.map(([v, tip]) => <button key={v} type="button" className={`chip${id === v ? " on" : ""}`} aria-pressed={id === v} title={tip} disabled={busy} onClick={() => void pick(v)}>{v}</button>)}</span>
          </div>
        </div>
      </div>
    </Pane>
  );
}
