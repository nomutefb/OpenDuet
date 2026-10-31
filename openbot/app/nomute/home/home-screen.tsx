// 새 사무실 홈(형 10-28 11:27 「메인 대시보드에는 … 뉴스피드를 간소화해서 띄우고, 두번째로는 내가 체크해줘야할일. 도착한 메세지」 ·
//   11:29 「9대 16을 6분할 … 1/6 내가 체크할 일 · 2/6~4/6 뉴스피드 간소화 · 5/6 도착한 메세지 · 6/6 네비게이션」 · 「yeta로고는 없어도돼」 · 「우상단에 내 프로필도 없어도돼」) —
//   세로 6칸 = 1/6 확인할 일(check-one · 12:22 납작하게 = 제 높이만) · 2~4/6 뉴스 피드(news-feed) · 5/6 도착한 메시지(arrived · 12:22 「시작점 조금 위로」 = 남는 높이 3:2) ·
//   6/6 = 네비(껍데기 · 이 화면 밖 · 아래쪽 메시지는 네비 뒤로 가려져도 됨).
//   PC = 같은 차례를 가운데 기둥 하나로(폭 = 폰 꼴) · 꼴·토큰 = YETA 설정 판과 같은 범위(.yeta-set · ui/yeta-settings.css 그대로 씀) · 머리 로고·프로필 0 = 맨 위가 바로 1/6.
//   10-31 12:2x 형(홈 사진) 「도착한 메세지 좀 더 내리고 한 메세지만 보이게 하게 가정, 그리고 카드 더 많이 그만큼 보이게.」 → 줄 셋 = 띠(auto) · 카드(남는 높이 전부 1fr) · 도착한 메시지(auto · 한 방만 · arrived.tsx) — 옛 3fr:2fr 폐지
//   길(라우트)·네비 「홈」 칸 = 이 폴더 밖(보조 01 · claude-state assign/2026-10-28/office-home.md 「바뀜」).
import "../ui/yeta-settings.css";
import "./follow-pulse.css";
import { Arrived } from "./arrived";
import { FollowPulse } from "./follow-pulse";   // 1/6 = 팔로워 띠(형 10-31 09:5x 「인스타 맨 위에 뜨는거 … 웹앱 맨 상단에」 · 접수사항 CheckOne 은 안 부름 「어짜피 다른데서 볼 수 있으니까」 · 파일은 그대로)
import { NewsFeed } from "./news-feed";

export function HomeScreen() {
  return (
    <div className="yeta-set mx-auto grid h-svh w-full max-w-[560px] grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto] gap-3 overflow-hidden px-4 pt-[max(12px,env(safe-area-inset-top))]">
      <FollowPulse />
      <NewsFeed />
      <Arrived />
    </div>
  );
}
