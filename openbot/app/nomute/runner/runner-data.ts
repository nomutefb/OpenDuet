// 러너 화면 자료(새 사무실 「러너」 · 형 10-28 09:31 「새 사무실을 정본으로 … 하나씩 넣은 다음 완성도가 생기면 대체」) —
//   원천 = 지금 웹판(nomutefb/editor viewer/runner.html)과 같은 GET /api/runner(위젯이 30초마다 올리는 저장소 변수 NM_TRAY_A·B · 맥 NM_TRAY_M ·
//   출력 신선도 out · 자리 감시 seat) — 새로 재지 않고 그대로 읽음. 숫자 규칙(단계 색·낡음·도는 잡 고르기·도는 Claude)은 웹판 규칙 그대로(정본 = 위젯 Model.cs·RowViews.cs).
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export type RunnerJob = {
  id: string; kind?: "L" | "S"; seat?: string; start?: number; workflow?: string; running?: boolean;
  expected?: number; title?: string; rx?: string; tx?: string;
};
export type RunnerRow = {
  pc: string; at: number; state?: string; line?: string; note?: string; fake?: boolean;
  cpu?: number; ram?: number; gpu?: number; run?: number; load?: number;
  cpuUsed?: number; cpuTotal?: number; ramUsed?: number; ramTotal?: number; gpuUsed?: number; gpuTotal?: number; cacheGB?: number;
  busy?: number; total?: number; down?: number; unread?: number;
  ag?: number; sub?: number; ags?: string[]; dbg?: string[]; jobs?: RunnerJob[];
  seats?: { n: string; L?: number; b?: number; d?: number }[];   // 자리마다 = 큰 자리(L) · 바쁨(b) · 멈춤(d)
  cache?: { cap?: number; end?: number; gb?: (number | null)[]; clr?: string; rest?: string };   // 60분 캐시(분마다 GB · 비운 분 clr · 쉼 rest)
  trend?: { step?: number; end?: number; cpu?: (number | null)[]; ram?: (number | null)[] };
};
export type RunnerOut = { summary?: string; verdict?: string; broken?: string[]; checked?: string; items?: Record<string, { ko?: string; st?: string; verdict?: string }> };
export type RunnerData = {
  ok?: boolean; now?: number; rows: Record<string, RunnerRow | null>; why: Record<string, string>;
  out?: RunnerOut | null; outWhy?: string; seat?: { ok?: boolean; items?: { code: string; pc: string; text: string; since?: string }[] } | null;
};

export const POLL_MS = 30_000, STALE_S = 90;
export type Level = "green" | "yellow" | "orange" | "red" | "off";

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
export { num };

/** 단계 색(운영자 261021 「빨강 90 · 주황 80 · 노랑 70 · 그 외 초록」) · 문제 줄·값 없음 = 꺼짐 회색. */
export const levelOf = (p: number | null, problem: boolean): Level => (problem || p == null ? "off" : p >= 90 ? "red" : p >= 80 ? "orange" : p >= 70 ? "yellow" : "green");

/** 머리 % = 그 PC 가 올린 load(자리 · CPU · 잡 램 중 큰 값 · GPU 뺌) · load 칸 없는 예전 판 = 넷 중 큰 값. */
export const loadOf = (d: RunnerRow) => ("load" in d ? num(d.load) : [d.cpu, d.ram, d.gpu, d.run].map(num).reduce<number | null>((a, b) => (b != null && (a == null || b > a) ? b : a), null));

const ago = (s: number) => (s < 120 ? `${Math.floor(s)}초 전` : s < 7200 ? `${Math.floor(s / 60)}분 전` : `${Math.floor(s / 3600)}시간 전`);
const agoStep = (s: number) => (s < 10 ? "방금" : s < 120 ? `${Math.floor(s / 10) * 10}초 전` : ago(s));

export type Look = { problem: boolean; when: string; note: string; load: number | null; running: boolean };
/** 줄 하나의 지금 꼴 — 없음·90초 넘게 낡음·VM 꺼짐·확인 실패 = 문제(회색) · 그 밖 = 받은 때 · 멈춘 자리 수. */
export function lookOf(d: RunnerRow | null, why: string, nowS: number): Look {
  const never = !d, age = d ? Math.max(0, nowS - d.at) : 1e9, stale = !never && age > STALE_S;
  const state = never ? "none" : d.state === "ok" || d.state === "off" ? d.state : "fail";
  const problem = never || stale || state !== "ok";
  let when = never ? (why ? "소식 없음" : "소식 확인 중") : stale ? ago(age) : state === "off" ? "VM 꺼짐" : state !== "ok" ? "확인 실패" : agoStep(age);
  if (d && !problem) { if ((d.down ?? 0) > 0) when += ` · ${d.down}대 멈춤`; if ((d.unread ?? 0) > 0) when += ` · ${d.unread}대 확인 실패`; }
  if (d?.fake) when += " · 시험";
  const note = never ? (why ? "소식 없음" : "소식 확인 중") : stale ? "소식 없음" : state === "off" ? "VM 꺼짐" : state !== "ok" ? "확인 실패" : "";
  return { problem, when, note, load: d ? loadOf(d) : null, running: !problem && (d?.jobs ?? []).some((j) => j.running) };
}

/** 펼친 목록 = 도는 잡만(위젯 Pick.Running · 큰 자리 잡 먼저 최대 2 + 작은 자리 최근 시작 3 · 보이는 차례 = 시작 오름). */
export function runningJobs(d: RunnerRow | null): RunnerJob[] {
  const jobs = (d?.jobs ?? []).filter((j) => j && j.running && num(j.start) != null);
  const large = jobs.filter((j) => j.kind === "L").sort((a, b) => a.start! - b.start!).slice(0, 2);
  const small = jobs.filter((j) => j.kind !== "L").sort((a, b) => b.start! - a.start!).slice(0, 3).sort((a, b) => a.start! - b.start!);
  return [...large, ...small];
}

/** 도는 Claude(위젯이 올린 ags 「모델:역할」 · o opus · f fable · c cloud · r 러너 잡) — 역할 자리(PM·사관·대기·보조·조수)는 늘 · 문제 줄 = 자리만. */
export type Agent = { key: string; model: "o" | "f" | "c" | "r"; role: string; seat: boolean; late: boolean; tip: string };
const ROLE_KO: Record<string, string> = { pm: "PM", sagwan: "사관", daegi: "대기", bojo: "보조", jo: "조수(대기·보조가 일하는 중)", runner: "러너 잡" };
const MODEL_KO = { o: "Opus", f: "Fable", c: "Cloud", r: "Claude" } as const;
export function agentsOf(d: RunnerRow | null, problem: boolean): Agent[] {
  if (!d) return [];
  const list = Array.isArray(d.ags) ? d.ags.map(String) : Array.from({ length: (num(d.ag) ?? 0) + (num(d.sub) ?? 0) }, () => "o:");
  const out = list.map((x, i) => {
    const [m, r = ""] = x.split(":"), model = (m in MODEL_KO ? m : "o") as Agent["model"];
    const seat = ["pm", "sagwan", "daegi", "bojo", "jo"].includes(r), late = seat && x.endsWith(":late"), what = seat ? "" : x.split(":").slice(2).join(":");
    return { key: `${i}:${x}`, model, role: r, seat, late, tip: `${ROLE_KO[r] || "하위·그 밖"} · ${what || MODEL_KO[model]}${late ? " · 늦음(마지막 기록이 오래됨)" : ""}` };
  });
  return problem ? out.filter((a) => a.seat) : out;
}

/** 디버그 세션 한 줄(윈A 위젯 Collector.SetDebug · 「이름|상태|값」). */
export const debugRows = (d: RunnerRow | null) =>
  (d?.dbg ?? []).map(String).map((x) => { const [name = "", st = "", v = ""] = x.split("|"); const s = st === "on" || st === "login" ? st : "off"; return { name, st: s, value: s === "off" ? `꺼짐${v ? " · " + v : ""}` : v }; });

/** 펼침 기억(PC 마다 · 웹판 runner.html 과 같은 열쇠 = 같은 주소라 같이 감 · 보조 03 초안에서 옮김) · 기억 못 하면 펼침. */
const OPEN_KEY = "nm_runner_open";
export function useOpen(): [Record<string, boolean>, (pc: string) => void] {
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    try { const o = JSON.parse(localStorage.getItem(OPEN_KEY) || "null"); if (o && typeof o === "object") return { A: o.A !== false, B: o.B !== false }; } catch { /* 저장소 없음 = 펼침 */ }
    return { A: true, B: true };
  });
  const flip = (pc: string) => setOpen((o) => {
    const n = { ...o, [pc]: !o[pc] };
    try { localStorage.setItem(OPEN_KEY, JSON.stringify({ ...JSON.parse(localStorage.getItem(OPEN_KEY) || "{}"), ...n })); } catch { /* 기억 못 해도 지금 화면은 바뀜 */ }
    return n;
  });
  return [open, flip];
}

/** GET /api/runner — 30초마다(위젯이 올리는 박자) · 화면이 숨으면 쉼(react-query 기본). */
export function useRunner() {
  return useQuery({
    queryKey: ["nomute", "runner"],
    queryFn: async (): Promise<RunnerData> => {
      const r = await fetch("/api/runner", { cache: "no-store", credentials: "same-origin" });
      const j = (await r.json().catch(() => null)) as (RunnerData & { error?: string; why?: unknown }) | null;
      if (!r.ok || !j || !j.rows) throw new Error((j && (j.error || (typeof j.why === "string" ? j.why : ""))) || `서버 응답 ${r.status}`);
      return { ...j, why: (j.why as Record<string, string>) || {} };
    },
    refetchInterval: POLL_MS,
  });
}
