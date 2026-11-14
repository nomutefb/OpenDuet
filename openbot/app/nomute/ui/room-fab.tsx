// 대화방 목록 우하단 「+」 = 누르면 바로 단톡방 만들기(형 11-15 대화방 사진 「이것도 여기서 + 누르면 단톡방 만들기 바로 되면 될듯」)
//   앞 판 = 「+」 → 펼침(「+ 단톡방」 · 「수리 접수」) → 한 번 더 누름 · 수리 접수는 메뉴에서 뺀 뒤(형 11-14 「수리접수는 이제 그냥 삭제 아예 메뉴 없애」)라 펼쳐도 하나뿐이었음 → 펼침 0 · 한 번에
//   꼴 · 자리 = 그대로(우리 유리 동그라미 · yeta-chat.css .nm-fab · 형 11-01 「저거를 네비 기능으로 우하단으로」 · 「살짝 투명해도 돼 글케 안크고」)
import { useState } from "react";
import { TempRoomDialog } from "./temp-room";

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
      {/* 첫 누름 전에 판·명단을 준비하고, 닫을 때 다음 빈 판을 준비한다. */}
      <TempRoomDialog key={session} open={making} onClose={close} />
    </>
  );
}
