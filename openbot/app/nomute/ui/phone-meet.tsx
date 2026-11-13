// 폰 「회의」 탭 몸통 — 열린 회의 이어 받기 → 뜸 화상회의 칸(./cobrowse-pane meet) 그대로 · 없으면 「새 회의」 단추(형 11-13 22:05 · 22:14 「좋아」)
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { office } from "../data/office";
import { CobrowsePane } from "./cobrowse-pane";
import { MEET_KEY, type MeetLike, type TempRoom, openMeetOf, stillOpen } from "./phone-meet-logic";

const readMine = (): MeetLike | null => { try { const m = JSON.parse(localStorage.getItem(MEET_KEY) || "null"); return m && m.id ? m : null; } catch { return null; } };
const writeMine = (m: MeetLike | null) => { try { if (m) localStorage.setItem(MEET_KEY, JSON.stringify(m)); else localStorage.removeItem(MEET_KEY); } catch { /* 이번만 */ } };

export function PhoneMeet({ onClose }: { onClose: () => void }) {
  const [go, setGo] = useState(false);
  const q = useQuery({ queryKey: ["nomute", "temprooms", "meet"], queryFn: () => office<{ rooms?: TempRoom[] }>("temprooms").then((j) => j.rooms || []), staleTime: 10_000 });
  if (!go) {
    if (q.isPending) return <p className="nm-pmeet-note">회의 찾는 중…</p>;
    const now = Date.now(), rooms = q.data || [], mine = readMine();
    const open = stillOpen(mine, rooms, now) ? mine : openMeetOf(rooms, now);
    if (open) { writeMine(open); return <CobrowsePane mode="meet" onClose={onClose} />; }
    if (mine) writeMine(null);   // PC 에서 끝낸 회의
    return (
      <div className="nm-pmeet-empty">
        <p>지금 열린 회의가 없어요</p>
        <button type="button" className="nm-meet-btn" onClick={() => setGo(true)}>새 회의</button>
      </div>
    );
  }
  return <CobrowsePane mode="meet" onClose={onClose} />;
}
