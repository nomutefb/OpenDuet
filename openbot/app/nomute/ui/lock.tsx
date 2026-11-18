// 서랍 「잠금」 = 에디터 설정 ▸ 잠금 창(/?pop=lock · viewer-src/32-lkProdBusy.part openLockPop · lkSettingsRefresh · 31-lkMinRaw.part LK_STEPS)을 앱 안으로(봄 11-01 · 형 「눌렀을때 웹으로 연결된 부분이 많아서 불편했어..」)
//   원본 창 = 「자동 잠금(분)」 슬라이더 하나(1·2·3·4·5·10·15·30·60 아홉 칸 · 서버 설정 lockMin · PC·폰 한 값) · 잠금이 켜져 있을 때만(lockOn + PIN 있음 = lkActive)
//   켜기 · 끄기 · PIN 정하기 · 바꾸기 = 이 칸 안에서(11-18 · 원본은 설정 줄 #lockOnBtn · #pinChgBtn + PIN 창 #pindlg — 차례 · 해시 · 5회 잠김은 ./lock-pin.ts 가 그대로) · 저장 = 메모와 같은 길(api/settings patch+base)
//   잠금이 거는 화면 = 에디터(edit.nomute.kr) · 사생활 가림막(원본 주석 그대로 · 접근 보안은 CF Access)
import "./yeta-settings.css";
import "./chan.css";
import "./queue.css";
import "./msgs.css";
import "./memo.css";
import "./lock.css";
import "./notice-box.css";   // 작은 알약 단추(.nm-nb-btn) — 이 판이 서랍 창으로 따로 뜰 때도 꼴이 있게
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getJson } from "./news-data";
import { LK_LEN, lkCheck, lkClear, lkHash } from "./lock-pin";
import { Pane } from "./pane";
import { PinCells } from "./pin-cells";
import { RbsGauge } from "./rbs-gauge";   // 설정 게이지 하네스(에디터 nm-gauge.js 러버밴드 게이지 · 봄 11-18)
import { SrvNote } from "./srv-note";   // 못 받음 = 서버 안내 한 꼴(형 11-18 22:0x)
import { reading } from "./wait-text";   // 읽는 중 글 한 벌(형 11-15 「하네스 따로 노는 거」)

type Settings = { lockOn?: boolean; lockPinHash?: string; lockMin?: number | string; error?: string; code?: string; settings?: Settings };
const KEY = ["nomute", "settings"] as const;
const LK_STEPS = [1, 2, 3, 4, 5, 10, 15, 30, 60];   // 원본 LK_STEPS(운영자 260705 · 1 최소 · 60 최대)
const snap = (v: unknown) => { const n = parseInt(String(v), 10) || 2; return LK_STEPS.reduce((a, b) => (Math.abs(b - n) <= Math.abs(a - n) ? b : a), LK_STEPS[0]); };   // 원본 lkMinRaw = 가장 가까운 칸

export function LockModal() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: KEY, staleTime: 15_000, queryFn: () => getJson<Settings>(`/api/settings?_=${Date.now()}`) });
  const on = q.data ? q.data.lockOn !== false : false, hash = q.data?.lockPinHash || "", pin = !!hash, active = on && pin;   // 원본 lkOn · lkPinH · lkActive
  const cur = snap(q.data?.lockMin);
  const [drag, setDrag] = useState<number | null>(null), [busy, setBusy] = useState(false), [note, setNote] = useState("");
  const idx = drag ?? LK_STEPS.indexOf(cur), shown = LK_STEPS[idx] ?? cur;
  /** 서버 설정 한 번 고치기(원본 saveSettings · 하나짜리 값 = 빈 base) — true = 됨 · 못 했으면 까닭을 줄 아래 적고 false */
  const patch = async (p: Record<string, unknown>): Promise<boolean> => {
    setBusy(true); setNote("");
    try {
      const r = await fetch("/api/settings", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ patch: p, base: {} }) });
      const j = (await r.json().catch(() => ({}))) as Settings;
      if (r.ok && j.settings) { qc.setQueryData(KEY, j.settings); return true; }
      if (j.code === "settings-conflict" || j.code === "refresh-required") { await qc.invalidateQueries({ queryKey: KEY }); setNote("다른 기기에서 그새 바뀌어서 다시 불러왔어 — 한 번 더 해 줘"); }
      else setNote(j.error || "아직 저장 못 했어 — 잠시 뒤 다시");
    } catch { setNote("네트워크 오류 — 다시"); }
    finally { setBusy(false); }
    return false;
  };
  const save = async (min: number) => {   // 자동 잠금 분 = PIN 안 물음(원본 그대로 · 형 7-05)
    if (min === cur) { setDrag(null); return; }
    if (await patch({ lockMin: min })) setNote(`${min}분 동안 손대지 않으면 에디터가 잠겨`);
    setDrag(null);
  };
  // ── 잠금 켜고 끄기 · PIN 정하기 · 바꾸기 = 이 칸 안에서(형 11-18 「좋아, 다 반영해주라」 · 앞 = 「PIN 을 먼저 정해야 잠글 수 있어」에서 막힘 · 정할 길은 에디터 설정에만)
  //    차례 = 원본(에디터 32-lkProdBusy.part): 끄기 · 켜기 = 기존 PIN 한 번 확인 · PIN 없이 처음 켜기 = 새 PIN 두 번 · 바꾸기 = 기존 확인 → 새 PIN 두 번 · 다시 친 것이 다르면 글 없이 흔들림만
  type Step = null | { k: "old"; then: "on" | "off" | "new" } | { k: "new1"; on: boolean } | { k: "new2"; p1: string; on: boolean };
  const [step, setStep] = useState<Step>(null);
  const flip = () => { setNote(""); setStep(active ? { k: "old", then: "off" } : pin ? { k: "old", then: "on" } : { k: "new1", on: true }); };
  const full = async (p: string): Promise<true | false | string> => {
    if (!step) return true;
    if (step.k === "old") {
      const ok = await lkCheck(localStorage, p, hash, Date.now());
      if (ok !== true) return ok;
      if (step.then === "new") { setStep({ k: "new1", on: false }); return true; }
      const turnOn = step.then === "on";
      if (!(await patch({ lockOn: turnOn }))) return "저장하지 못했습니다.";
      if (!turnOn) { try { localStorage.setItem("nm_locked", "0"); } catch { /* 이번만 */ } }   // 지금 잠긴 것만 이 기기에서 풂(원본 그대로)
      setStep(null); setNote(turnOn ? "잠금을 켰어" : "잠금을 껐어 — PIN 은 그대로 둬"); return true;
    }
    if (step.k === "new1") { setStep({ k: "new2", p1: p, on: step.on }); return true; }
    if (p !== step.p1) return false;   // 다시 친 것이 다름 = 글 없이 흔들림만(형 7-05 「텍스트로 알려주지말고 흔들어」)
    let h = ""; try { h = await lkHash(p); } catch { /* 아래에서 알림 */ }
    if (!h) return "이 브라우저에선 PIN 을 못 만들어";
    if (!(await patch(step.on ? { lockPinHash: h, lockLen: LK_LEN, lockOn: true } : { lockPinHash: h, lockLen: LK_LEN }))) return "저장하지 못했습니다.";
    lkClear(localStorage); setStep(null); setNote(step.on ? "PIN 을 정하고 잠금을 켰어" : "PIN 을 바꿨어"); return true;
  };
  const stepTitle = !step ? "" : step.k === "old" ? "기존 PIN 4자리 입력" : step.k === "new1" ? "새 PIN 4자리 입력" : "같은 PIN 다시 입력";
  return (
    <Pane title="잠금">
      <div className="yeta-set mt-2">
        <div className="ycd-card card-left nm-chan nm-q nm-msg nm-memo nm-lock">
          <span className="ycd-nm yset-ttl">자동 잠금</span>
          {q.isPending ? <p className="nm-chan-msg">{reading("잠금 설정")}</p> : q.isError ? <SrvNote what="잠금 설정" detail={q.error instanceof Error ? q.error.message : undefined} className="tight" /> : (
            <>
              <div className="nm-lock-state">   {/* 칩 둘(잠금 꺼짐 · PIN 없음) → 스위치 + PIN 단추(누르면 이 자리에서 PIN 칸) */}
                <button type="button" role="switch" aria-checked={active} className="nm-sw" disabled={busy || !!step} onClick={flip}><span className="si-sw" aria-hidden />잠금</button>
                <button type="button" className="nm-nb-btn" disabled={busy || !!step} onClick={() => { setNote(""); setStep(pin ? { k: "old", then: "new" } : { k: "new1", on: false }); }}>{pin ? "PIN 바꾸기" : "PIN 정하기"}</button>
              </div>
              {step ? <PinCells title={stepTitle} len={LK_LEN} onFull={full} onCancel={() => setStep(null)} /> : null}
              <div className={`nm-lock-row${active ? "" : " off"}`}><span>자동 잠금(분)</span><b aria-live="polite">{shown}</b></div>
              <div className={`nm-lock-sld${active ? "" : " off"}`}>
                <span className="cap">1</span>
                <RbsGauge min={0} max={LK_STEPS.length - 1} step={1} value={idx < 0 ? 1 : idx} disabled={!active || busy} label="자동 잠금 분" valueText={`${shown}분`}
                  onInput={setDrag} onCommit={(i) => void save(LK_STEPS[i])} />   {/* 끄는 동안 = 숫자만 · 손을 뗀 뒤 한 번 저장(전 = pointerup · keyup · blur 셋으로 따로) */}
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
