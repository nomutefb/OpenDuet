// 새 사무실 홈(형 10-28 11:27 「메인 대시보드에는 … 뉴스피드를 간소화해서 띄우고, 두번째로는 내가 체크해줘야할일. 도착한 메세지」 ·
//   11:29 「9대 16을 6분할 … 1/6 내가 체크할 일 · 2/6~4/6 뉴스피드 간소화 · 5/6 도착한 메세지 · 6/6 네비게이션」 · 「yeta로고는 없어도돼」 · 「우상단에 내 프로필도 없어도돼」) —
//   세로 6칸 = 1/6 확인할 일(check-one) · 2~4/6 뉴스 피드(news-feed) · 5/6 도착한 메시지(arrived · 아래쪽은 네비 뒤로 가려져도 됨) · 6/6 = 네비(껍데기 · 이 화면 밖).
//   PC = 같은 차례를 가운데 기둥 하나로(폭 = 폰 꼴) · 꼴·토큰 = YETA 설정 판과 같은 범위(.yeta-set · ui/yeta-settings.css 그대로 씀) · 머리 로고·프로필 0 = 맨 위가 바로 1/6.
//   길(라우트)·네비 「홈」 칸 = 이 폴더 밖(보조 01 · claude-state assign/2026-10-28/office-home.md 「바뀜」).
import "../ui/yeta-settings.css";
import { Arrived } from "./arrived";
import { CheckOne } from "./check-one";
import { NewsFeed } from "./news-feed";

export function HomeScreen() {
  return (
    <div className="yeta-set mx-auto grid h-svh w-full max-w-[560px] grid-cols-[minmax(0,1fr)] grid-rows-[1fr_3fr_2fr] gap-3 overflow-hidden px-4 pt-[max(12px,env(safe-area-inset-top))]">
      <CheckOne />
      <NewsFeed />
      <Arrived />
    </div>
  );
}
