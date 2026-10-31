// 맨 위 가운데 동그라미 = 지금 대화 상대(형 10-28 10:18 「지금 대화하는 상대가 맨 위에 지금 동그라미에 떠있으니까 저거로 대체하면 될 듯」 · 10:22 「맨 위는 가운데 동그라미만」)
//   1:1 방 = 그 봇 얼굴 · 단체방(회의실 포함) = 그 방 사람 얼굴 셋 · 윈터 1:1 방·방 밖(할 일 등) = 원래 구슬(등불 · swap/mic-orb.tsx 그대로 = 상태 움직임)
//   원본 header.tsx 의 구슬 자리에 PATCH 로 끼움(overrides.ts) · 누르면 첫 화면(회의실) = 원본 그대로
import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import { DuetIcon } from "@/components/duet/icons";
import { type OfficeRoom, WINTER_ID, idOf, office, people, roomAgentIds } from "../data/office";
import { FaceImg, FaceStack } from "./faces";
import { MicOrb, ringOf } from "../swap/mic-orb";

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
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [r?.id]);
  if (!r) return null;
  const p = r.with ? list.find((x) => x.who === r.with) : undefined;
  const name = r.with ? p?.name || r.with : r.name;
  const ids = r.with ? [] : roomAgentIds(r, list);
  if (ids.length) return (   // 단톡 = 이름 옆 인원 · 누르면 누구인지(형 10-31 「들가면 확인할 수 잇으면 됨 방 상단에서」)
    <span className="nm-top-wrap">
      <button type="button" className="nm-top-name nm-top-btn" aria-expanded={open} aria-label={`${name} 사람 ${ids.length}명 보기`} onClick={() => setOpen((v) => !v)}>{name} <i>{ids.length}</i></button>
      {open ? (
        <span className="nm-top-crew nm-yeta">
          {ids.map((id) => { const x = list.find((y) => idOf(y.who, list) === id); return <span key={id} className="nm-top-one"><FaceImg id={id} size={24} />{x?.name || x?.who || id}</span>; })}
        </span>
      ) : null}
    </span>
  );
  return <span className="nm-top-name">{name}{p?.mark ? <span className="ymark" aria-hidden>{p.mark}</span> : null}</span>;   // 1:1 머리 = 이름 옆 표지(형 10-31 09:12)
}

export function NomuteTop({ size, orb }: { size: number; orb: ReactNode }) {
  const { r, list } = useTopRoom();
  const busy = useQuery<string>({ queryKey: ["nomute", "busy", r?.id || ""], queryFn: () => "", enabled: false, initialData: "" }).data || "";
  const busyAll = useQuery<string>({ queryKey: ["nomute", "busyAll", r?.id || ""], queryFn: () => "", enabled: false, initialData: "" }).data || "";
  if (!r) return <>{orb}</>;
  const ring = "grid shrink-0 place-items-center overflow-hidden rounded-full shadow-duet-glass";
  if (r.with) {
    const id = idOf(r.with, list);
    if (id === WINTER_ID) return <>{orb}</>;
    return <MicOrb size={size} state={busy === r.with ? "thinking" : "idle"} id={id} tint={ringOf(list.find((x) => x.who === r.with))} />;   // 테 = 모두(형 10-31 「윈터만잇고 다른애들없는거같은데」) · 전엔 응답 중에만
  }
  if (r.temp && r.members?.length) {   // 임시방 머리 = 인원을 펼쳐 얼굴 하나씩 · 말하는 이 테두리에 불(형 10-31 「상단에는 인원이 펼쳐져서 동그라미 원 하나씩 잇어서 얘기할때 테두리에 불 로딩 들어오면 좋을긋」)
    const on = busyAll.split("\n");
    return <span className="nm-top-crew">{r.members.map((w) => <MicOrb key={w} size={Math.round(size * 0.62)} state={on.includes(w) ? "thinking" : "idle"} id={idOf(w, list)} tint={ringOf(list.find((x) => x.who === w))} />)}</span>;
  }
  const ids = roomAgentIds(r, list).slice(0, 3);
  return (
    <span aria-hidden className={`duet-glass ${ring}`} style={{ width: size, height: size }}>
      {ids.length ? <FaceStack ids={ids} size={Math.round(size * 0.42)} /> : <DuetIcon name="chat" size={Math.round(size * 0.4)} />}
    </span>
  );
}
