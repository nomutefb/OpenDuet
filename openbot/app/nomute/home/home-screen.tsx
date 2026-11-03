// 새 사무실 홈(형 10-28 11:27 「메인 대시보드에는 … 뉴스피드를 간소화해서 띄우고, 두번째로는 내가 체크해줘야할일. 도착한 메세지」 ·
//   11:29 「9대 16을 6분할 … 1/6 내가 체크할 일 · 2/6~4/6 뉴스피드 간소화 · 5/6 도착한 메세지 · 6/6 네비게이션」 · 「yeta로고는 없어도돼」 · 「우상단에 내 프로필도 없어도돼」) —
//   세로 6칸 = 1/6 확인할 일(check-one · 12:22 납작하게 = 제 높이만) · 2~4/6 뉴스 피드(news-feed) · 5/6 도착한 메시지(arrived · 12:22 「시작점 조금 위로」 = 남는 높이 3:2) ·
//   6/6 = 네비(껍데기 · 이 화면 밖 · 아래쪽 메시지는 네비 뒤로 가려져도 됨).
//   PC = 같은 차례를 가운데 기둥 하나로(폭 = 폰 꼴) · 꼴·토큰 = YETA 설정 판과 같은 범위(.yeta-set · ui/yeta-settings.css 그대로 씀) · 머리 로고·프로필 0 = 맨 위가 바로 1/6.
//   10-31 12:2x 형(홈 사진) 「도착한 메세지 좀 더 내리고 한 메세지만 보이게 하게 가정, 그리고 카드 더 많이 그만큼 보이게.」 → 줄 셋 = 띠(auto) · 카드(남는 높이 전부 1fr) · 도착한 메시지(auto · 한 방만 · arrived.tsx) — 옛 3fr:2fr 폐지
//   11-02 네비 자리 여백(86px)을 도착한 메시지 목록 → 홈 바닥으로 옮김 = 새 글 없을 때 「다 깸」 띠 아래쪽·「새로 온 글 없음」이 네비 뒤로 숨던 것.
//   11-02 19:16 형 「1의 하단부분 새로온 메세지 안보여도 되니까 그 부분 날리고 카드 더 많이 나오게 하고 네비게이션에 이름 아래가 반쯤 걸치도록 영상이 나오게」 · 「전면 부 메세지는 솔직히 안보는거 같고」 → 도착한 메시지 칸 뺌(arrived.tsx 는 그대로) · 줄 셋 = 띠 · 카드(1fr) · 「다 깸」(맨 아래 · 네비에 걸침 · ddk-band.css).
//   11-03 15:4x 형 「사무실 아래에 있는 영상 쪽 있잖아. 거기 최근 온 메세지로 다시 변경해줘. 영상 없애구.」 → 셋째 줄 = 도착한 메시지(arrived.tsx · 한 방만) 되살림 · 「다 깸」 띠 뺌(ddk-band.tsx 는 그대로).
//   11-03 16:48 형 「일단 도착한 메세지랑 우측 버튼, 네비는 나중에 나오는게 맞는거같고」 · 「상단에 그래프도 마찬가지야,」 → 앱 처음 열 때 한 번 = 카드 첫 판이 덱에 간 뒤(news-feed onShown · 한 박자 LAG) 그래프·오른쪽 단추·도착한 메시지·네비가 같이 스르륵(html[data-home-wait] → [data-home-in] · home-scene.css) · 못 받아도 SLOW 뒤엔 나옴 · 홈 칸 다시 누를 땐 안 숨김(네비 깜빡임 0).
//   길(라우트)·네비 「홈」 칸 = 이 폴더 밖(보조 01 · claude-state assign/2026-10-28/office-home.md 「바뀜」).
import { useEffect, useRef } from "react";
import "../ui/yeta-settings.css";
import "./follow-pulse.css";
import { Arrived } from "./arrived";   // 맨 아래 = 도착한 메시지 한 방(형 11-03 「거기 최근 온 메세지로 다시 변경해줘. 영상 없애구.」)
import { FollowPulse } from "./follow-pulse";   // 1/6 = 팔로워 띠(형 10-31 09:5x 「인스타 맨 위에 뜨는거 … 웹앱 맨 상단에」 · 접수사항 CheckOne 은 안 부름 「어짜피 다른데서 볼 수 있으니까」 · 파일은 그대로)
import { NewsFeed } from "./news-feed";

const LAG = 300, SLOW = 8000;   // 카드 첫 판 뒤 한 박자(덱이 그릴 틈) · 못 받아도 이만큼 뒤엔 다 보임
let firstHome = true;   // 앱 처음 열 때 한 번만

export function HomeScreen() {
  const shown = useRef<() => void>(() => {});
  useEffect(() => {
    const first = firstHome && performance.now() < 10_000;   // 앱을 다른 화면으로 열고 나중에 홈에 온 때 = 안 숨김
    firstHome = false;
    if (!first) return;
    const html = document.documentElement;
    let done = false;
    const reveal = () => { if (done) return; done = true; html.removeAttribute("data-home-wait"); html.setAttribute("data-home-in", ""); setTimeout(() => html.removeAttribute("data-home-in"), 1500); };
    html.setAttribute("data-home-wait", "");
    shown.current = () => { setTimeout(reveal, LAG); };
    const t = setTimeout(reveal, SLOW);
    return () => { clearTimeout(t); done = true; html.removeAttribute("data-home-wait"); };
  }, []);
  return (
    <div className="yeta-set mx-auto grid h-svh w-full max-w-[560px] grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto] gap-3 overflow-hidden px-4 pt-[max(12px,env(safe-area-inset-top))] pb-[calc(86px+env(safe-area-inset-bottom))]">
      <FollowPulse />
      <NewsFeed onShown={() => shown.current()} />
      <Arrived />
    </div>
  );
}
