// PM 방 오른쪽 위 러너맵 축소판(형 11-14 22:37 dm-gik 「그거 항상 pm으로 고정한 애 우상단에는 공지 고정처럼 애들 러너맵 ㄷ축소판뜨게해줘~」 · 깃 오더 #-008 · 뎅)
//   = 지금 PM(서버 pm 칸)의 1:1 방에서만 · 공지 고정 띠 자리(PinBar 밑) 오른쪽 위 알약 「러너맵」 · 누르면 위 = 애들 한 줄씩(봇 현황 · 일함 · 쉼 · 멈춤 · 까닭) · 아래 = 홈 러너 칸의 조약돌 · 러너 여섯 점(기계 계기는 가림 · 깃 23:03 「기계 계기는 빼도 돼」)
//   얼마를 먹나 = 닫힘 = 받아오기 0(PM 칸 5분 · 방 목록 10분만) · 열림 = 홈 러너 칸과 같은 자료 · 같은 캐시(status 60초 · schedule 120초 · 숨은 탭 멈춤 = react-query 기본)
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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

export function PmRunnerMini({ room }: { room: string }) {
  const pmRoom = usePmRoom();
  const [open, setOpen] = useState(() => { try { return localStorage.getItem("nm-pm-runner") === "1"; } catch { return false; } });
  if (!pmRoom || room !== pmRoom) return null;
  const toggle = () => setOpen((o) => { const n = !o; try { localStorage.setItem("nm-pm-runner", n ? "1" : "0"); } catch { /* 이번만 */ } return n; });
  return (
    <div className={`nm-pmrun${open ? " open" : ""}`}>
      <button type="button" className="nm-pmrun-h" onClick={toggle} aria-expanded={open}>러너맵 <span aria-hidden>{open ? "▴" : "▾"}</span></button>
      {open ? <div className="nm-pmrun-b"><Kids /><div className="nm-pmrun-g"><RunnerGauges /></div></div> : null}
    </div>
  );
}
