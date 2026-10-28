// 방 카드(평의회 2 ⑨ · claude-state log/council/2026-10-28-회의실-맥락/decision2.md · 서버 = editor functions/api/office/_meetfix.js cardOf) —
//   자리 = 고정 띠 칸(./pins.tsx .nm-pin-slot) 띠 밑 오른쪽 알약 「부름 N · 결정 M」 · 누르면 10줄 판(열린 부름 · 형 원문 · 결정) · 줄 누름 = 그 글로(nm-jump · 고정 띠와 같은 길)
//   열린 부름·결정이 0 이면 안 보임(형 원문만 = 형 자기 글이라 뺌) · 공지·수리 접수 방 = 부름이 안 쌓여 안 보임 · LLM 0
import "./meet-card.css";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { office, peopleSync, type RoomCard } from "../data/office";

const SKIP = new Set(["notice", "repair"]);
const nm = (who?: string) => { const p = peopleSync().find((x) => x.who === who); return p ? p.name || p.who : who || "?"; };

export function MeetCard({ room }: { room: string }) {
  const [open, setOpen] = useState(false);
  const q = useQuery({ queryKey: ["nomute", "card", room], queryFn: () => office<RoomCard>(`rooms/${encodeURIComponent(room)}/card`),
    enabled: !!room && !SKIP.has(room), staleTime: 30_000, refetchInterval: 60_000 });
  const d = q.data, decide = (d?.lines || []).filter((l) => l.kind === "decide").length;
  if (!d || (!d.open_n && !decide)) return null;
  const go = (id: string) => { setOpen(false); window.dispatchEvent(new CustomEvent("nm-jump", { detail: { room, id } })); };   // 대화창(office-chat.tsx)이 받아 그 글로
  return (
    <div className="nm-card-wrap">
      <button type="button" className="nm-card-chip" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        부름 {d.open_n}{decide ? ` · 결정 ${decide}` : ""}<span aria-hidden>{open ? "▴" : "▾"}</span>
      </button>
      {open ? (
        <ul className="nm-card" aria-label="방 카드 — 열린 부름 · 형 원문 · 결정">
          {d.lines.map((l) => (
            <li key={`${l.kind}:${l.id}:${l.to || ""}`}>
              <button type="button" onClick={() => go(l.id)}>
                <b className={`k ${l.kind}`}>{l.kind === "open" ? `${nm(l.from)} → ${nm(l.to)}` : l.kind === "hyung" ? "형" : `⏳ ${nm(l.from)}`}</b>
                <span>{l.text || "(빈 글)"}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
