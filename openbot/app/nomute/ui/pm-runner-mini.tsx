// PM 방 오른쪽 위 러너맵 축소판(형 11-14 22:37 dm-gik 「그거 항상 pm으로 고정한 애 우상단에는 공지 고정처럼 애들 러너맵 ㄷ축소판뜨게해줘~」 · 깃 오더 #-008 · 뎅)
//   = 지금 PM(서버 pm 칸)의 1:1 방에서만 · 공지 고정 띠 자리(PinBar 밑) 오른쪽 위 알약 「러너맵」 · 누르면 위 = 애들 한 줄씩(봇 현황 · 일함 · 쉼 · 멈춤 · 까닭) · 아래 = 홈 러너 칸의 조약돌 · 러너 여섯 점(기계 계기는 가림 · 깃 23:03 「기계 계기는 빼도 돼」)
//   얼마를 먹나 = 닫힘 = 받아오기 0(PM 칸 5분 · 방 목록 10분만) · 열림 = 홈 러너 칸과 같은 자료 · 같은 캐시(status 60초 · schedule 120초 · 숨은 탭 멈춤 = react-query 기본)
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { jobBoard } from "./job-fold";
import { office } from "../data/office";
import { RunnerGauges } from "./runner-gauges";
import { ACT_QUERY_KEY, miniLine, type MiniRow } from "./activity-line";
import "./pm-runner-mini.css";

function usePmRoom(): string | null {
  const pm = useQuery({ queryKey: ["nomute", "pm"], queryFn: () => office<{ who?: string }>("pm"), staleTime: 300_000, refetchInterval: 300_000 }).data?.who;
  const rooms = useQuery({ queryKey: ["nomute", "rooms-lite"], queryFn: () => office<{ rooms?: { id: string; kind?: string; name?: string }[] }>("rooms"), staleTime: 600_000, enabled: !!pm }).data?.rooms;
  return pm && rooms ? rooms.find((r) => (r.kind === "dm" || r.id.startsWith("dm-")) && r.name === pm)?.id || null : null;
}

function Kids() {   // 봇 현황 = 서버 활동 판정 그대로(GET status/activity · 봇 현황 한 장 · 작동 표 활동 칸과 같은 줄 · 열렸을 때만 60초)
  //   옛 bots 자료(깸 · 잠 · 모름)는 쉬는 그록 · 카리나를 「멈춤?」으로, 일하는 클로드를 「쉼」으로 냈음(형 11-14 23:4x 클라우드 세션 창 「멈춤? 이렇게 뜨는거 없어야 함」)
  //   작업 알림(기차봇) = 활동 줄에 없는 자리라 안 나옴(형 「러너맵에 기차 는 나올 필요없음」)
  const q = useQuery({ queryKey: ACT_QUERY_KEY, queryFn: () => office<{ rows?: MiniRow[] }>("status/activity").then((j) => j.rows || []), refetchInterval: 60_000, staleTime: 30_000 });
  const rows = (q.data || []).map(miniLine);
  if (!rows.length) return null;
  return (
    <ul className="nm-pmrun-kids" aria-label="애들 지금">
      {rows.map((b) => <li key={b.name} className={`s-${b.kind}`}><b>{b.name}</b><span>{b.label}</span>{b.sub ? <small>{b.sub}</small> : null}</li>)}
    </ul>
  );
}

const when = (ts: number) => { const d = new Date(ts); return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`; };
function Jobs({ pmRoom }: { pmRoom: string }) {   // 접수 · 완료 = PM 1:1 글 중 작업 알림(relay job_recv · job_done) + 옛 작업 알림 방(dm-chaeng) · 열렸을 때만 60초 · 숨으면 멈춤
  const get = (room: string, n: number) => office<{ messages?: { id: string; ts: number; who: string; text: string; relay?: unknown }[] }>(`rooms/${encodeURIComponent(room)}/messages?n=${n}`).then((j) => j.messages || []).catch(() => []);
  const q = useQuery({ queryKey: ["nomute", "pm-jobs", pmRoom], queryFn: async () => [...(await get(pmRoom, 80)), ...(await get("dm-chaeng", 40))], refetchInterval: 60_000, staleTime: 30_000 });
  const rows = jobBoard(q.data || []);
  if (!q.data) return <p className="nm-pmrun-empty">불러오는 중…</p>;
  if (!rows.length) return <p className="nm-pmrun-empty">접수 · 완료 없음</p>;
  return (
    <ul className="nm-pmrun-jobs" aria-label="접수 · 완료">
      {rows.map((j) => <li key={j.no || j.id} className={j.kind}><span className="mk" aria-hidden>{j.kind === "done" ? "✓" : "↘"}</span>{j.no ? <b>{j.no}</b> : null}<span className="tt">{j.title}</span><small>{j.kind === "done" ? "완료" : "접수"} {when(j.ts)}</small></li>)}
    </ul>
  );
}

const GRID = <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>;
const CHECKS = <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 6l2 2 3-3" /><path d="M3 13l2 2 3-3" /><path d="M11 7h10" /><path d="M11 14h10" /><path d="M11 20h10" /></svg>;

/** PM 방 리모콘(깃 #-019) = 오른쪽 위 픽토그램 알약 줄 · ① 러너맵(#-008) ② 접수 · 완료 · 한 번에 하나만 펼침 · 판 밖 누르면 닫힘 · 늘 닫힌 채 시작(형 23:32 「다른 쪽 클릭하면 바로 닫히게」 · 「픽토그램으로 바꿔줘 얼굴모양 봇모양 말고」) */
export function PmRunnerMini({ room }: { room: string }) {
  const pmRoom = usePmRoom();
  const [open, setOpen] = useState<"" | "run" | "job">("");
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: PointerEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(""); };
    document.addEventListener("pointerdown", off, true);
    return () => document.removeEventListener("pointerdown", off, true);
  }, [open]);
  if (!pmRoom || room !== pmRoom) return null;
  const pill = (k: "run" | "job", label: string, icon: JSX.Element) => <button type="button" className={`nm-pmrun-h${open === k ? " on" : ""}`} onClick={() => setOpen((o) => (o === k ? "" : k))} aria-expanded={open === k} aria-label={label} title={label}>{icon}</button>;
  return (
    <div ref={box} className={`nm-pmrun${open ? " open" : ""}`}>
      <div className="nm-pmrun-row">{pill("run", "러너맵", GRID)}{pill("job", "접수 · 완료", CHECKS)}</div>
      {open === "run" ? <div className="nm-pmrun-b"><Kids /><div className="nm-pmrun-g"><RunnerGauges /></div></div> : null}
      {open === "job" ? <div className="nm-pmrun-b"><Jobs pmRoom={pmRoom} /></div> : null}
    </div>
  );
}
