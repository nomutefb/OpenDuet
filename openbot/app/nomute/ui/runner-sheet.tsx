// 러너 잡 바꾸기 판(【3】 2단 · 형 11-09 08:12 「러너랑 스케줄러 그리고 각각 변경 가능하게」 · 시아 08:14 【3】 + 08:55 셋 · 봄 08:54 「이 꼴로 가」) —
//   블록 누름 → 폰 = 아래서 올라오는 판 · PC = 가운데 판(같은 칸) · 서버 POST schedule/runner(editor #3015 · 형만 · dry 먼저)
//   칸 = 상태(켜짐·꺼짐) · 켬끔 스위치 · 「지금 돌리기」 · 미리 보기 한 줄(끔 = 빨강 + 뒤따름 수) → 「적용」 · 최근 한 일 · 몸 안 잡 = 회색 글 + 주인 칩(스위치 없음)
//   3단(언제 · 모델 · 복사 · 검토로)은 여기 아님
import { useEffect, useState } from "react";
import { office } from "../data/office";
import { Breaker, StatusDot, stOf } from "./sched-bits";
import { type RunnerJob, nextShort } from "./settings-extra";
import { whenOf } from "./sched-runners";
import { ACTION_KO, type RunnerRes, ghJob, stateKo, toggleOf } from "./sched-flow-core";

const post = (file: string, action: string, dry: boolean) => office<RunnerRes>("schedule/runner", { method: "POST", body: JSON.stringify({ action, file, dry }) });
const whenKo = (ts: number) => { const d = new Date(ts); return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };

export function RunnerSheet({ job, can, phone, onClose, onRan }: { job: RunnerJob; can: boolean; phone: boolean; onClose: () => void; onRan: (id: string) => void }) {
  const gh = ghJob(job);
  const [res, setRes] = useState<RunnerRes | null>(null), [busy, setBusy] = useState(""), [msg, setMsg] = useState("");
  const [pre, setPre] = useState<{ action: "run" | "on" | "off"; would: string; red: boolean } | null>(null);   // dry 미리 보기 → 「적용」 기다리는 중
  useEffect(() => {   // 열면 지금 상태 한 번(깃허브 잡만 · 서버 = GET 하나)
    let live = true;
    setRes(null); setPre(null); setMsg("");
    if (!gh) return;
    post(job.file, "state", false).then((r) => { if (live) setRes(r); }).catch((e) => { if (live) setMsg(e instanceof Error ? e.message : String(e)); });
    return () => { live = false; };
  }, [job.file, gh]);
  const state = res?.state || "";
  const ask = async (action: "run" | "on" | "off") => {   // 먼저 dry = 「이렇게 돼」 한 줄
    setBusy(action); setMsg("");
    try { const r = await post(job.file, action, true); if (!r.ok) { setMsg(r.why || r.error || "안 됨"); setPre(null); } else setPre({ action, would: r.would || "", red: !!r.red }); }
    catch (e) { setMsg(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(""); }
  };
  const apply = async () => {   // 「적용」 = 진짜로
    if (!pre) return;
    setBusy("apply"); setMsg("");
    try {
      const r = await post(job.file, pre.action, false);
      if (!r.ok) { setMsg(r.why || r.error || "안 됨"); return; }
      setRes(r); setPre(null); setMsg(pre.action === "run" ? "띄웠어 — 끝은 상태 점으로" : `${ACTION_KO[pre.action]} 됐어`);
      if (pre.action === "run") onRan(job.id);
    } catch (e) { setMsg(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(""); }
  };
  const on = state === "active", st = stOf(job.health, job.on === false);
  return (
    <div className="nm-rsheet-back" role="presentation" onClick={onClose}>
      <section className="nm-rsheet" data-phone={phone || undefined} role="dialog" aria-modal="true" aria-label={`${job.name} 바꾸기`} onClick={(e) => e.stopPropagation()}>
        <header className="nm-rsheet-h">
          <b>{job.name}</b>
          <small>{whenOf(job)}{job.health?.next_at ? ` · 다음 ${nextShort(job.health.next_at)}` : ""} · <StatusDot st={st} />{job.file || job.id}</small>
          <button type="button" className="nm-rsheet-x" aria-label="닫기" onClick={onClose}>×</button>
        </header>
        {!gh ? (
          <div className="nm-rsheet-body">
            <p className="nm-rsheet-grey">이 잡은 {job.host || "그 몸"} 안 시계({(job.clock || []).join(" · ") || job.src || "?"}) · 바꾸기는 그 몸 주인{job.owner ? `(${job.owner})` : ""}</p>   {/* 시아 ③ · 눌러도 안 되는 단추는 안 그림 */}
            {job.owner ? <span className="nm-rsheet-chip">{job.owner}</span> : null}
          </div>
        ) : (
          <div className="nm-rsheet-body">
            <div className="nm-rsheet-row">
              <Breaker big on={on} label={`${job.name} 켬끔`} disabled={!can || !res?.ok || !!busy || !!pre} onFlip={() => void ask(toggleOf(state))} />
              <span className="min-w-0 flex-1"><b>{res ? stateKo(state) : msg ? "상태 못 읽음" : "상태 읽는 중"}</b><small>{res?.state_why ? res.state_why : res?.followers?.length ? `뒤따름 ${res.followers.length} · ${res.followers.join(" · ")}` : "뒤따르는 잡 없음"}</small></span>
              <button type="button" className="nm-sched-chip" disabled={!can || !res?.ok || !res.dispatch || !on || !!busy || !!pre} title={!res?.dispatch ? "손으로 못 띄움(workflow_dispatch 없음)" : !on ? "꺼져 있어 못 띄움" : "깃허브에 한 번 돌리기"} onClick={() => void ask("run")}>▶ 지금 돌리기</button>
            </div>
            {!can ? <p className="nm-rsheet-grey">바꾸기 = 형만(지금은 보기만)</p> : null}
            {pre ? (
              <div className="nm-rsheet-pre" data-red={pre.red || undefined}>
                <p>{pre.would}</p>
                <div className="nm-rsheet-btns">
                  <button type="button" className="nm-sched-chip" onClick={() => setPre(null)} disabled={busy === "apply"}>취소</button>
                  <button type="button" className="nm-sched-chip nm-rsheet-go" aria-pressed="true" onClick={() => void apply()} disabled={busy === "apply"}>{busy === "apply" ? "하는 중" : `적용 · ${ACTION_KO[pre.action]}`}</button>
                </div>
              </div>
            ) : null}
            {busy && busy !== "apply" ? <p className="nm-rsheet-grey">미리 보기 읽는 중</p> : null}
            {msg ? <p className="nm-rsheet-msg">{msg}</p> : null}
            {res?.acts?.length ? (
              <div className="nm-rsheet-acts">
                <small>최근 한 일</small>
                <ul>{res.acts.map((a) => <li key={a.at}>{whenKo(a.at)} · {a.who} · {ACTION_KO[a.action] || a.action}{a.from !== a.to && a.to ? ` · ${stateKo(a.from || "")} → ${stateKo(a.to)}` : ""}</li>)}</ul>
              </div>
            ) : null}
            <small className="nm-rsheet-foot">언제 · 모델 바꾸기는 다음 판(yml 고침) · 끄면 시간표 · 박자 · 수동이 다 멈추고 다시 켜면 돌아와</small>
          </div>
        )}
      </section>
    </div>
  );
}
