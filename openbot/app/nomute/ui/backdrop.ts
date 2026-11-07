// 바탕 닫힘 = 누름과 뗌이 둘 다 바탕일 때만(뜸 11-07)
//   형 11-07 10:52 봄 1:1(봄 옮김) 「봄아 지침, 이거 계속 창에서 마우스 포인터 나가기만 해도 창이 꺼져서 개고생했는데, 창 나가도 창 꺼지지 않게 해줘.」 · 「저장안했는데 기록이 날아가서 당황스러운 경우넹」
//   까닭(봄 10:54 코드로 잼) = 창 안 글칸에서 끌어 고르다 손을 바탕 위에서 떼면 브라우저가 그 click 을 바탕(공통 조상)에 줘서 닫힘 · 「e.target === e.currentTarget」 만으로는 못 막음
//   → 누를 때(mousedown)도 바탕이었는지 그 바탕 칸에 적어 두고, click 때 둘 다 바탕이어야 닫음 · 부품 하나로 모든 창(공지 고치기 · 방 설정 · 방 꾸미기 · 프로필 · 방 색 · 방 메뉴 …)
import type React from "react";

export function backdrop(close: () => void) {
  return {
    onMouseDown: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.dataset.bdDown = e.target === e.currentTarget ? "1" : ""; },
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      const ok = e.currentTarget.dataset.bdDown === "1" && e.target === e.currentTarget;
      e.currentTarget.dataset.bdDown = "";
      if (ok) close();
    },
  };
}
