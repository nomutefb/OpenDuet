// PM 방 오른쪽 위 러너맵 축소판(형 11-14 22:37 dm-gik 「그거 항상 pm으로 고정한 애 우상단에는 공지 고정처럼 애들 러너맵 ㄷ축소판뜨게해줘~」 · 깃 오더 #-008 · 뎅)
//   = 지금 PM(서버 pm 칸)의 1:1 방에서만 · 공지 고정 띠 자리(PinBar 밑) 오른쪽 위 알약 「러너맵」 · 누르면 위 = 애들 한 줄씩(봇 현황 · 일함 · 쉼 · 멈춤 · 까닭) · 아래 = 홈 러너 칸의 조약돌 · 러너 여섯 점(기계 계기는 가림 · 깃 23:03 「기계 계기는 빼도 돼」)
//   얼마를 먹나 = 닫힘 = 받아오기 0(PM 칸 5분 · 방 목록 10분만) · 열림 = 홈 러너 칸과 같은 자료 · 같은 캐시(status 60초 · schedule 120초 · 숨은 탭 멈춤 = react-query 기본)
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { office } from "../data/office";
import { RunnerGauges } from "./runner-gauges";
import "./pm-runner-mini.css";

function usePmRoom(): string | null {
  const pm = useQuery({ queryKey: ["nomute", "pm"], queryFn: () => office<{ who?: string }>("pm"), staleTime: 300_000, refetchInterval: 300_000 }).data?.who;
  const rooms = useQuery({ queryKey: ["nomute", "rooms-lite"], queryFn: () => office<{ rooms?: { id: string; kind?: string; name?: string }[] }>("rooms"), staleTime: 600_000, enabled: !!pm }).data?.rooms;
  return pm && rooms ? rooms.find((r) => (r.kind === "dm" || r.id.startsWith("dm-")) && r.name === pm)?.id || null : null;
}

const ST: Record<string, string> = { awake: "일함", asleep: "쉼", unknown: "멈춤?" };   // 서버 bots state 실물 = awake · asleep · unknown(11-14 23:2x)
function Kids() {   // 봇 현황(설정 「지금 봇」과 같은 bots 자료 · 같은 캐시 열쇠 · 열렸을 때만 60초)
  const q = useQuery({ queryKey: ["nomute", "bots"], queryFn: () => office<{ bots: { who: string; state: string; why?: string }[] }>("bots").then((j) => j.bots || []), refetchInterval: 60_000, staleTime: 30_000 });
  const rows = q.data || [];
  if (!rows.length) return null;
  return (
    <ul className="nm-pmrun-kids" aria-label="애들 지금">
      {rows.map((b) => <li key={b.who} className={`s-${b.state}`}><b>{b.who}</b><span>{ST[b.state] || b.state}</span>{b.why ? <small>{b.why}</small> : null}</li>)}
    </ul>
  );
}

export function PmRunnerMini({ room }: { room: string }) {
  const pmRoom = usePmRoom();
  const [open, setOpen] = useState(false);   // 늘 닫힌 채 시작(형 23:32 「다른 쪽 클릭하면 바로 닫히게」 = 잠깐 보는 판)
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {   // 펼친 뒤 판 밖 아무 데나 누르면 바로 닫힘(형 11-14 23:32 dm-gik · 깃 #-008 덧)
    if (!open) return;
    const off = (e: PointerEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", off, true);
    return () => document.removeEventListener("pointerdown", off, true);
  }, [open]);
  if (!pmRoom || room !== pmRoom) return null;
  return (
    <div ref={box} className={`nm-pmrun${open ? " open" : ""}`}>
      <button type="button" className="nm-pmrun-h" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="러너맵" title="러너맵">
        {/* 픽토그램 = 칸 넷 격자(형 23:32 「저거 픽토그램으로 바꿔줘 얼굴모양 봇모양 말고」) */}
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
      </button>
      {open ? <div className="nm-pmrun-b"><Kids /><div className="nm-pmrun-g"><RunnerGauges /></div></div> : null}
    </div>
  );
}
