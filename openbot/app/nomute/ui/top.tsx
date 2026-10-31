// 맨 위 가운데 동그라미 = 지금 대화 상대(형 10-28 10:18 「지금 대화하는 상대가 맨 위에 지금 동그라미에 떠있으니까 저거로 대체하면 될 듯」 · 10:22 「맨 위는 가운데 동그라미만」)
//   1:1 방 = 그 봇 얼굴 · 단체방(회의실 포함) = 그 방 사람 얼굴 셋 · 윈터 1:1 방·방 밖(할 일 등) = 원래 구슬(등불 · swap/mic-orb.tsx 그대로 = 상태 움직임)
//   원본 header.tsx 의 구슬 자리에 PATCH 로 끼움(overrides.ts) · 누르면 첫 화면(회의실) = 원본 그대로
import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import { type OfficeRoom, idOf, office, people, roomAgentIds } from "../data/office";
import { FaceImg } from "./faces";
import { RoomRoutineSheet, routineLabel, routineRoom, useRoomTimers } from "./room-routine";

/** 지금 대화 판의 방(주소 #/channels/<방> · #/group/<방>) · 명부 */
function useTopRoom() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const m = path.match(/^\/(?:channels|group)\/([^/]+)/);
  const room = m ? decodeURIComponent(m[1]) : "";   // 첫 화면("/") = 홈 · 회의실 = #/group/all
  const rooms = useQuery({ queryKey: ["nomute", "rooms"], queryFn: () => office<{ rooms: OfficeRoom[] }>("rooms").then((j) => j.rooms || []), staleTime: 15_000 }).data || [];
  const list = useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
  return { r: rooms.find((x) => x.id === room), list };
}

/** 사진 밑 이름(형 10-28 22:04 「그 아래에 각자 이름 나오면 좋겠어」) — 1:1 = 상대 이름 · 단체방 = 방 이름 · 방 밖 = 없음 */
export function NomuteName() {
  const { r, list } = useTopRoom();
  const [open, setOpen] = useState(false), [sheet, setSheet] = useState(false);
  const timers = useRoomTimers(open).data;
  useEffect(() => { setOpen(false); setSheet(false); }, [r?.id]);
  if (!r) return null;
  const p = r.with ? list.find((x) => x.who === r.with) : undefined;
  const name = r.with ? p?.name || r.with : r.name;
  const ids = r.with ? [] : roomAgentIds(r, list);
  const can = routineRoom(r);
  if (ids.length || can) return (   // 단톡 = 이름 옆 인원 · 누르면 누구인지(형 10-31 「들가면 확인할 수 잇으면 됨 방 상단에서」)
    <span className="nm-top-wrap">
      <button type="button" className="nm-top-name nm-top-btn" aria-expanded={open} aria-label={`${name} 사람 ${ids.length}명 보기`} onClick={() => setOpen((v) => !v)}>{name}{ids.length ? <> <i>{ids.length}</i></> : null}</button>
      {open ? (
        <span className="nm-top-crew nm-yeta">
          {ids.map((id) => { const x = list.find((y) => idOf(y.who, list) === id); return <span key={id} className="nm-top-one"><FaceImg id={id} size={24} />{x?.name || x?.who || id}</span>; })}
          {can ? <button type="button" className="nm-top-routine" onClick={() => { setOpen(false); setSheet(true); }}>{routineLabel(timers?.[r.id])}</button> : null}
        </span>
      ) : null}
      {sheet ? <RoomRoutineSheet room={r} onClose={() => setSheet(false)} /> : null}
    </span>
  );
  return <span className="nm-top-name">{name}{p?.mark ? <span className="ymark" aria-hidden>{p.mark}</span> : null}</span>;   // 1:1 머리 = 이름 옆 표지(형 10-31 09:12)
}

export function NomuteTop({ orb }: { size: number; orb: ReactNode }) {
  const { r } = useTopRoom();
  // 방 안 = 큰 원 없음(형 10-31 「위에를 전면 다 활용 가능하거든」) · 원은 대화 속 얼굴로(./orb-flight.tsx) · 표식 = 머리 꼴을 CSS 가 바꾸는 자리(shell.css)
  return r ? <span aria-hidden className="nm-room-mark" /> : <>{orb}</>;
}
