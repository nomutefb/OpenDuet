// PM 방 오른쪽 위 러너맵 축소판(형 11-14 22:37 dm-gik 「그거 항상 pm으로 고정한 애 우상단에는 공지 고정처럼 애들 러너맵 ㄷ축소판뜨게해줘~」 · 깃 오더 #-008 · 뎅)
//   = 지금 PM(서버 pm 칸)의 1:1 방에서만 · 공지 고정 띠 자리(PinBar 밑) 오른쪽 위 알약 「러너맵」 · 누르면 홈 러너 칸(./runner-gauges)을 줄여 펼침
//   얼마를 먹나 = 닫힘 = 받아오기 0(PM 칸 5분 · 방 목록 10분만) · 열림 = 홈 러너 칸과 같은 자료 · 같은 캐시(status 60초 · schedule 120초 · 숨은 탭 멈춤 = react-query 기본)
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { office } from "../data/office";
import { RunnerGauges } from "./runner-gauges";
import "./pm-runner-mini.css";

function usePmRoom(): string | null {
  const pm = useQuery({ queryKey: ["nomute", "pm"], queryFn: () => office<{ who?: string }>("pm"), staleTime: 300_000, refetchInterval: 300_000 }).data?.who;
  const rooms = useQuery({ queryKey: ["nomute", "rooms-lite"], queryFn: () => office<{ rooms?: { id: string; kind?: string; name?: string }[] }>("rooms"), staleTime: 600_000, enabled: !!pm }).data?.rooms;
  return pm && rooms ? rooms.find((r) => (r.kind === "dm" || r.id.startsWith("dm-")) && r.name === pm)?.id || null : null;
}

export function PmRunnerMini({ room }: { room: string }) {
  const pmRoom = usePmRoom();
  const [open, setOpen] = useState(() => { try { return localStorage.getItem("nm-pm-runner") === "1"; } catch { return false; } });
  if (!pmRoom || room !== pmRoom) return null;
  const toggle = () => setOpen((o) => { const n = !o; try { localStorage.setItem("nm-pm-runner", n ? "1" : "0"); } catch { /* 이번만 */ } return n; });
  return (
    <div className={`nm-pmrun${open ? " open" : ""}`}>
      <button type="button" className="nm-pmrun-h" onClick={toggle} aria-expanded={open}>러너맵 <span aria-hidden>{open ? "▴" : "▾"}</span></button>
      {open ? <div className="nm-pmrun-b"><RunnerGauges /></div> : null}
    </div>
  );
}
