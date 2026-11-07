// PC 오른쪽 위 = 인스타 · 페이스북 팔로워 띠(봄 11-08) — 형 dm 07:30 「위쪽에 인스타 페이스북 그 차트 그거가 나왔으면 하는데, 내가 채팅창 위쪽까지 잘 안보거든? pc웹앱을 말하거야」 ·
//   07:31 「거기에는 지금 원래 휴대폰 메인화면에 출력되어있던 차트를 알맞은 크기로 배치해서 나오게 하고 싶어. 그래야 내가 긴장감이 좀 생길것 같아서」 ·
//   「우측은 아예 뉴스 관련 내용, 좌측은 너네 관련으로 가는게 더 카테고라이징이 맞을것같네.」
//   부품 = 폰 홈 ../home/follow-pulse.tsx 그대로(같은 자료 /api/chan?f=ig·fb · 같은 셈 · 같은 그림 · 누르면 채널 요약) · fill = 칸 높이(shell --nm-top-h · 시아) 다 씀
//   머리줄 = 반갈 칸 모두 같은 꼴(.nm-card-h · 「몸 · 러너」와 나란히)
import "../home/follow-pulse.css";
import "./igfb-band.css";
import { FollowPulse } from "../home/follow-pulse";

export function IgFbBand() {
  return (
    <div className="nm-igfb flex flex-col" aria-label="인스타 · 페이스북 팔로워">
      <div className="nm-card-h"><i className="live" aria-hidden /><b>SNS</b></div>
      <div className="nm-igfb-body"><FollowPulse fill /></div>
    </div>
  );
}
