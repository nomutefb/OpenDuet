// GPU 쓰는 일 · GPU 우선 서버(형 11-05 09:43 dm-eyes 「GPU 쓰는 일만, 따로 스케줄러에 표기해놔봐. 그리고 그 스케줄러는 시아가 아까 따로 짜놨으니까
//   확인해서 표시해놓고, 거기서 우선순위 서버를 정하면 그대로 서버까지 일정시간 지나면 반영되게 설비해줘」 · 뜸)
//   읽기 = GET schedule 의 gpu 칸(editor functions/api/office/_gpupref.js gpuView) · 고르기 = POST schedule/gpu {host} (형 자리만 · 서버가 10분 뒤 nomute-gpu 꼬리표를 그 서버 러너로)
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { office } from "../data/office";
import { useMe } from "./pins";

export type GpuHost = { id: string; name: string; gpu: string; note?: string; runners: { name: string; status: string; busy: boolean; label: boolean }[] };
export type GpuPref = { host: string; prev?: string; at: number; by?: string; apply_at: number; state: "wait" | "done" | "hold" | "fail"; why?: string; applied_at?: number };
export type SchedGpu = { pref: GpuPref | null; hosts: GpuHost[]; jobs: { id: string; name: string; host?: string; gpu: string[] }[]; label: string; delay_min: number; now_on: string[] };

const hm = (ms?: number) => (ms ? new Date(ms).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false }) : "");

export function GpuPanel({ gpu, open }: { gpu: SchedGpu; open: (id: string) => void }) {
  const qc = useQueryClient(), me = useMe(), can = me?.kind === "human";
  const [busy, setBusy] = useState(""), [msg, setMsg] = useState("");
  const p = gpu.pref, nameOf = (id: string) => gpu.hosts.find((h) => h.id === id)?.name || id;
  const pick = async (host: string) => {
    if (!can || busy) return;
    setBusy(host); setMsg("");
    try {
      const j = await office<{ gpu_pref?: GpuPref; same?: boolean }>("schedule/gpu", { method: "POST", body: JSON.stringify({ host }) });
      setMsg(j.same ? "이미 그 서버야" : `${nameOf(host)} 로 바꿈 · ${hm(j.gpu_pref?.apply_at)} 반영 예정`);
      void qc.invalidateQueries({ queryKey: ["nomute", "schedule"] });
    } catch (e) { setMsg(`못 바꿈 · ${String((e as Error)?.message || e)}`); }
    setBusy("");
  };
  const stateKo = !p ? `지금 ${gpu.now_on.map(nameOf).join(" · ") || "없음"}(고른 적 없음)`
    : p.state === "wait" ? `${nameOf(p.host)} · ${hm(p.apply_at)} 반영 예정`
    : p.state === "done" ? `${nameOf(p.host)} · ${hm(p.applied_at)} 반영됨`
    : p.state === "hold" ? `${nameOf(p.host)} · 기다림 — ${p.why || ""}`
    : `${nameOf(p.host)} · 못 옮김 — ${p.why || ""}(5분마다 다시)`;
  return (
    <section className="nm-gpu" aria-label="GPU 쓰는 일">
      <div className="nm-gpu-head"><b>GPU 우선 서버</b><small data-st={p?.state || "none"}>{stateKo}</small></div>
      <div className="nm-gpu-hosts" role="radiogroup" aria-label="GPU 우선 서버 고르기">
        {gpu.hosts.map((h) => {
          const on = (p ? p.host : gpu.now_on[0]) === h.id, up = h.runners.filter((r) => r.status === "online").length;
          return (
            <button key={h.id} type="button" role="radio" aria-checked={on} disabled={!can || !!busy} onClick={() => void pick(h.id)} title={h.note || ""}>
              <b>{h.name}</b><small>{h.gpu}</small>
              <small>{h.runners.length ? `GPU 러너 ${up}/${h.runners.length}${h.runners.some((r) => r.label) ? " · 지금 받음" : ""}` : "GPU 러너 없음"}</small>
            </button>
          );
        })}
      </div>
      {msg ? <p className="nm-gpu-msg" role="status">{msg}</p> : null}
      {!can ? <p className="nm-gpu-msg">고르기는 형만 · 고르고 {gpu.delay_min}분 뒤 러너({gpu.label})에 반영</p> : <p className="nm-gpu-msg">고르고 {gpu.delay_min}분 뒤 러너 꼬리표({gpu.label})가 그 서버로 옮겨 가 · 그 서버에 GPU 러너가 없으면 안 옮기고 기다림</p>}
      <ul className="nm-gpu-jobs" aria-label={`GPU 쓰는 일 ${gpu.jobs.length}`}>
        {gpu.jobs.map((j) => (
          <li key={j.id}><button type="button" className="nm-sched-chip" onClick={() => open(j.id)}>{j.name}</button><small>{j.gpu.join(" · ")}</small></li>
        ))}
      </ul>
    </section>
  );
}
