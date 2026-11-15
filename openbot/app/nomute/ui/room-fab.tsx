// 대화방 목록 우하단 「+」 = 누르면 바로 단톡방 만들기(형 11-15 대화방 사진 「이것도 여기서 + 누르면 단톡방 만들기 바로 되면 될듯」)
//   앞 판 = 「+」 → 펼침(「+ 단톡방」 · 「수리 접수」) → 한 번 더 누름 · 수리 접수는 메뉴에서 뺀 뒤(형 11-14 「수리접수는 이제 그냥 삭제 아예 메뉴 없애」)라 펼쳐도 하나뿐이었음 → 펼침 0 · 한 번에
//   꼴 · 자리 = 그대로(우리 유리 동그라미 · yeta-chat.css .nm-fab · 형 11-01 「저거를 네비 기능으로 우하단으로」 · 「살짝 투명해도 돼 글케 안크고」)
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { faceOf, office } from "../data/office";
import { pmRoomId } from "./pm-set-logic";
import { TempRoomDialog } from "./temp-room";
import { PmOrb } from "./pm-orb";   // PM 얼굴 자리 = 살아 있는 구슬(형 11-16 영상 「그 프로필을 이거로 대체해줘」)

/** 「+」 바로 위 = PM 얼굴 단추 · 누르면 PM 1:1 방(형 11-15 13:0x 「대화 목록 우하단에 + 있는데 그 위에 항상 pm 픽토그램 있어서 누르면 pm 대화방 가게해줘 / 최상단이라 누르기 어려움」)
 *  PM = 서버 pm 칸 · 방 = 그 이름의 1:1 방(./pm-runner-mini.tsx usePmRoom 과 같은 셈 · 같은 캐시 열쇠 = 받아오기 0 더) · 못 찾으면 안 그림 */
function PmFab() {
  const nav = useNavigate(), [orb, setOrb] = useState(true);
  const pm = useQuery({ queryKey: ["nomute", "pm"], queryFn: () => office<{ who?: string }>("pm"), staleTime: 300_000, refetchInterval: 300_000 }).data?.who;
  const rooms = useQuery({ queryKey: ["nomute", "rooms-lite"], queryFn: () => office<{ rooms?: { id: string; kind?: string; name?: string; with?: string }[] }>("rooms"), staleTime: 600_000, enabled: !!pm }).data?.rooms;
  const room = pm && rooms ? pmRoomId(pm, rooms) || undefined : undefined;
  if (!pm || !room) return null;
  const src = faceOf(pm);   // 구슬을 못 그리는 기기에서만 씀(옛 얼굴)
  return (
    <button type="button" className="nm-pmfab" aria-label={`PM ${pm} 대화방`} title={`PM ${pm} 대화방`} onClick={() => void nav({ to: "/channels/$channelId", params: { channelId: room } })}>
      {orb ? <PmOrb onFail={() => setOrb(false)} /> : src ? <img src={src} alt="" decoding="async" /> : <b aria-hidden>{pm.slice(0, 1)}</b>}
    </button>
  );
}

export function RoomFab() {
  const [making, setMaking] = useState(false), [session, setSession] = useState(0);
  const close = () => { setMaking(false); setSession((n) => n + 1); };
  return (
    <>
      <div className="nm-fab">
        <button type="button" className="nm-fab-main" aria-haspopup="dialog" aria-label="단톡방 만들기" title="단톡방 만들기" onClick={() => setMaking(true)}>
          <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>
      </div>
      <PmFab />
      {/* 첫 누름 전에 판·명단을 준비하고, 닫을 때 다음 빈 판을 준비한다. */}
      <TempRoomDialog key={session} open={making} onClose={close} />
    </>
  );
}
