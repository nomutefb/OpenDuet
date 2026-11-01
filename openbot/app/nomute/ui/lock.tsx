// 서랍 「잠금」 = 에디터 설정 ▸ 잠금 창(/?pop=lock · viewer-src/32-lkProdBusy.part openLockPop · lkSettingsRefresh · 31-lkMinRaw.part LK_STEPS)을 앱 안으로(봄 11-01 · 형 「눌렀을때 웹으로 연결된 부분이 많아서 불편했어..」)
//   원본 창 = 「자동 잠금(분)」 슬라이더 하나(1·2·3·4·5·10·15·30·60 아홉 칸 · 서버 설정 lockMin · PC·폰 한 값) · 잠금이 켜져 있을 때만(lockOn + PIN 있음 = lkActive)
//   켜기·끄기·PIN 바꾸기 = 원본에서도 이 창 밖(설정 줄 · PIN 확인이 필요) → 여기선 상태만 보여 줌 · 저장 = 메모와 같은 길(api/settings patch+base)
//   잠금이 거는 화면 = 에디터(edit.nomute.kr) · 사생활 가림막(원본 주석 그대로 · 접근 보안은 CF Access)
import "./yeta-settings.css";
import "./chan.css";
import "./queue.css";
import "./msgs.css";
import "./memo.css";
import "./lock.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getJson } from "./news-data";
import { Pane } from "./pane";

type Settings = { lockOn?: boolean; lockPinHash?: string; lockMin?: number | string; error?: string; code?: string; settings?: Settings };
const KEY = ["nomute", "settings"] as const;
const LK_STEPS = [1, 2, 3, 4, 5, 10, 15, 30, 60];   // 원본 LK_STEPS(운영자 260705 · 1 최소 · 60 최대)
const snap = (v: unknown) => { const n = parseInt(String(v), 10) || 2; return LK_STEPS.reduce((a, b) => (Math.abs(b - n) <= Math.abs(a - n) ? b : a), LK_STEPS[0]); };   // 원본 lkMinRaw = 가장 가까운 칸

export function LockModal() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: KEY, staleTime: 15_000, queryFn: () => getJson<Settings>(`/api/settings?_=${Date.now()}`) });
  const on = q.data ? q.data.lockOn !== false : false, pin = !!q.data?.lockPinHash, active = on && pin;   // 원본 lkOn · lkPinH · lkActive
  const cur = snap(q.data?.lockMin);
  const [drag, setDrag] = useState<number | null>(null), [busy, setBusy] = useState(false), [note, setNote] = useState("");
  const idx = drag ?? LK_STEPS.indexOf(cur), shown = LK_STEPS[idx] ?? cur;
  const save = async (min: number) => {   // 원본 saveSettings({lockMin}) — 하나짜리 값 = 빈 base(서버는 배열 칸만 3자 병합)
    if (min === cur) { setDrag(null); return; }
    setBusy(true); setNote("");
    try {
      const r = await fetch("/api/settings", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ patch: { lockMin: min }, base: {} }) });
      const j = (await r.json().catch(() => ({}))) as Settings;
      if (r.ok && j.settings) { qc.setQueryData(KEY, j.settings); setNote(`${min}분 동안 손대지 않으면 에디터가 잠겨`); }
      else if (j.code === "settings-conflict" || j.code === "refresh-required") { await qc.invalidateQueries({ queryKey: KEY }); setNote("다른 기기에서 그새 바뀌어서 다시 불러왔어 — 한 번 더 해 줘"); }
      else setNote(j.error || "아직 저장 못 했어 — 잠시 뒤 다시");
    } catch { setNote("네트워크 오류 — 다시"); }
    finally { setBusy(false); setDrag(null); }
  };
  const pct = (idx / (LK_STEPS.length - 1)) * 100;
  return (
    <Pane title="잠금">
      <div className="yeta-set mt-2">
        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo nm-lock">
          <span className="ycd-nm yset-ttl">자동 잠금</span>
          {q.isLoading ? <p className="nm-chan-msg">읽는 중…</p> : q.isError ? <p className="nm-chan-msg" role="alert">설정을 못 읽었어 — 다시 열어 줘</p> : (
            <>
              <div className="nm-lock-state">
                <span className={`chip${active ? " on" : ""}`}>{active ? "잠금 켜짐" : "잠금 꺼짐"}</span>
                <span className="chip">{pin ? "PIN 있음" : "PIN 없음"}</span>
              </div>
              {!active ? <p className="nm-chan-msg">{!pin ? "PIN 을 먼저 정해야 잠글 수 있어" : "잠금이 꺼져 있어"}</p> : null}   {/* 설명 꼬리 뺌(형 11-02 08:1x 「옆에 설명글은 빼줘」) */}
              <div className={`nm-lock-row${active ? "" : " off"}`}><span>자동 잠금(분)</span><b aria-live="polite">{shown}</b></div>
              <div className={`nm-lock-sld${active ? "" : " off"}`}>
                <span className="cap">1</span>
                <input type="range" min={0} max={LK_STEPS.length - 1} step={1} value={idx < 0 ? 1 : idx} disabled={!active || busy} aria-label="자동 잠금 분" aria-valuetext={`${shown}분`}
                  style={{ ["--p" as string]: pct + "%" }}
                  onChange={(e) => setDrag(+e.target.value)} onPointerUp={(e) => void save(LK_STEPS[+(e.target as HTMLInputElement).value])} onKeyUp={(e) => void save(LK_STEPS[+(e.target as HTMLInputElement).value])} onBlur={() => { if (drag != null) void save(LK_STEPS[drag]); }} />
                <span className="cap">60</span>
              </div>
              <div className="nm-lock-steps" aria-hidden>{LK_STEPS.map((s) => <i key={s} className={s === shown ? "on" : ""}>{s}</i>)}</div>
              {note ? <p className="nm-chan-msg" role="status">{note}</p> : null}
            </>
          )}
        </div>
      </div>
    </Pane>
  );
}
