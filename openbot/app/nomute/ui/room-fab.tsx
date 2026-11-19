// 대화방 목록 우하단 「+」 = 누르면 바로 단톡방 만들기(형 11-15 대화방 사진 「이것도 여기서 + 누르면 단톡방 만들기 바로 되면 될듯」)
//   앞 판 = 「+」 → 펼침(「+ 단톡방」 · 「수리 접수」) → 한 번 더 누름 · 수리 접수는 메뉴에서 뺀 뒤(형 11-14 「수리접수는 이제 그냥 삭제 아예 메뉴 없애」)라 펼쳐도 하나뿐이었음 → 펼침 0 · 한 번에
//   꼴 · 자리 = 그대로(우리 유리 동그라미 · yeta-chat.css .nm-fab · 형 11-01 「저거를 네비 기능으로 우하단으로」 · 「살짝 투명해도 돼 글케 안크고」)
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { office } from "../data/office";
import { pmRoomId } from "./pm-set-logic";
import { TempRoomDialog } from "./temp-room";
import { PmOrb } from "./pm-orb";   // PM 얼굴 자리 = 살아 있는 구슬(형 11-16 영상 「그 프로필을 이거로 대체해줘」)

/** 「+」 바로 위 = PM 얼굴 단추 · 누르면 PM 1:1 방(형 11-15 13:0x 「대화 목록 우하단에 + 있는데 그 위에 항상 pm 픽토그램 있어서 누르면 pm 대화방 가게해줘 / 최상단이라 누르기 어려움」)
 *  PM = 서버 pm 칸 · 방 = 그 이름의 1:1 방(./pm-runner-mini.tsx usePmRoom 과 같은 셈 · 같은 캐시 열쇠 = 받아오기 0 더) · 못 찾으면 안 그림 */
function PmFab() {
  const nav = useNavigate();
  const pm = useQuery({ queryKey: ["nomute", "pm"], queryFn: () => office<{ who?: string }>("pm"), staleTime: 300_000, refetchInterval: 300_000 }).data?.who;
  const rooms = useQuery({ queryKey: ["nomute", "rooms-lite"], queryFn: () => office<{ rooms?: { id: string; kind?: string; name?: string; with?: string }[] }>("rooms"), staleTime: 600_000, enabled: !!pm }).data?.rooms;
  const room = pm && rooms ? pmRoomId(pm, rooms) || undefined : undefined;
  if (!pm || !room) return null;
  return (
    <button type="button" className="nm-pmfab" aria-label={`PM ${pm} 대화방`} title={`PM ${pm} 대화방`} onClick={() => void nav({ to: "/channels/$channelId", params: { channelId: room } })}>
      <PmOrb />   {/* 얼굴 사진으로 안 돌아감 = 못 그리면 css 진주 동그라미(형 11-18 18:08 「그 기하학 동그라미로 바뀌게래놧는데 적용 풀린듯」) */}
    </button>
  );
}

/** 방 만들기 단추 + 창 = PC 대화 칸 맨 위 줄 오른쪽 끝 옅은 「+」(폰 = 「대화방」 탭 오른쪽 끝 · ./teams.tsx) — 우하단 「+」 는 뺌(형 11-20 07:36 dm-gik 깃 옮김 「!깃 ✓ ① 응 빼(탭 「+」 하나만)」)
 *  창 = 앞과 같은 TempRoomDialog(첫 누름 전에 판·명단 준비 · 닫을 때 다음 빈 판) */
export function RoomMake({ className = "" }: { className?: string }) {
  const [making, setMaking] = useState(false), [session, setSession] = useState(0);
  const close = () => { setMaking(false); setSession((n) => n + 1); };
  return (
    <>
      <button type="button" className={className} aria-haspopup="dialog" aria-label="대화방 추가" title="대화방 추가" onClick={() => setMaking(true)}>
        <svg aria-hidden viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
      </button>
      <TempRoomDialog key={session} open={making} onClose={close} />
    </>
  );
}

/** 대화 목록 판 우하단 = PM 구슬만(「+」 뺌 · 형 11-20 07:36 「응 빼(탭 「+」 하나만)」 · 방 만들기 = 탭 「+」 · 위 RoomMake) */
export function RoomFab() {
  return <PmFab />;
}
