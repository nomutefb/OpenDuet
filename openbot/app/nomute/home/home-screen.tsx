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
//   그 다음 = 형 16:48 「차라리 로딩이 완료된 상태에서 저 창이 열리는건 어때? 그 전에 아예 메인 로고 창이나 그런거로 덮는게 어떤지.」 · 「그 다음에 내가 방금말한걸 조치해보자」 → 같은 기다림 동안 앱 아이콘(설치 아이콘 = 앱 켤 때 그림) 덮개 · 카드 첫 판 뒤 걷힘(.nm-home-splash · home-scene.css).
//   11-16 03:08 형(폰 홈 사진) 「이거 원래 상단에 인스타만 보이게 되어있는데 그걸 고정으로 하고 좌우 스냅 스위칭하면 러너 나오게 변경」 · 「좌우에 꺽쇠만 반투명 살짝」 → 첫 줄 = 한 칸(팔로워 띠 먼저 · 옆으로 밀면 러너 띠 · 양옆 옅은 꺽쇠 · ./top-swap.tsx) · 러너 띠 + 팔로워 띠 위아래 두 단(11-15 16:1x)은 걷음.
//   길(라우트)·네비 「홈」 칸 = 이 폴더 밖(보조 01 · claude-state assign/2026-10-28/office-home.md 「바뀜」).
import { useLayoutEffect, useRef, useState } from "react";
import "../ui/yeta-settings.css";
import "./follow-pulse.css";
import { Arrived } from "./arrived";   // 맨 아래 = 도착한 메시지 한 방(형 11-03 「거기 최근 온 메세지로 다시 변경해줘. 영상 없애구.」)
import { FollowPulse } from "./follow-pulse";   // 1/6 = 팔로워 띠(형 10-31 09:5x 「인스타 맨 위에 뜨는거 … 웹앱 맨 상단에」 · 접수사항 CheckOne 은 안 부름 「어짜피 다른데서 볼 수 있으니까」 · 파일은 그대로)
import { NewsFeed } from "./news-feed";
import { HotSwap } from "./kw-board";
import { useSplit } from "../ui/side";
import { RunnerGauges } from "../ui/runner-gauges";   // 폰 홈 맨 위 = PC 왼쪽 위 러너 띠 그대로(게이지 · 온도 · 조약돌 · 러너 번호 · 형 11-15 16:1x 「모바일에도 온도 나오게」 · 「그냥 그 웹앱에 나오는 상단 내용」)
import { SnsApps } from "./sns-apps";   // 첫 장 = SNS 큰 아이콘 셋(형 11-20 13:06 「✓ ② SNS 첫 장」 · 앞 판 = 셋째 장 · 봄 11:41 · 미토스 ②)
import { TopSwap } from "./top-swap";   // 폰 홈 맨 위 = 인스타(늘 여기서 시작) ↔ 러너 띠 옆 넘김(형 11-16 03:08 「그걸 고정으로 하고 좌우 스냅 스위칭하면 러너 나오게」)
import { IntroFace, pickIntro } from "./intro";

const LAG = 300, SLOW = 8000;   // 카드 첫 판 뒤 한 박자(덱이 그릴 틈) · 못 받아도 이만큼 뒤엔 다 보임
let firstHome = true;   // 앱 처음 열 때 한 번만

export function HomeScreen() {
  const split = useSplit();   // PC 반갈 = 오른쪽 Hot Issue 칸이 키워드 순위와 번갈아 뜸 → 왼쪽 홈 카드는 그대로
  const [first] = useState(() => firstHome && performance.now() < 10_000);
  const [intro] = useState(() => pickIntro("main"));   // 앱을 다른 화면으로 열고 나중에 홈에 온 때 = 안 숨김
  const shown = useRef<() => void>(() => {});
  useLayoutEffect(() => {   // 그리기 전에 = 뼈대 카드가 한 번도 안 비침
    firstHome = false;
    if (!first) return;
    const html = document.documentElement;
    let done = false;
    const reveal = () => { if (done) return; done = true; html.removeAttribute("data-home-wait"); html.setAttribute("data-home-in", ""); setTimeout(() => html.removeAttribute("data-home-in"), 1500); };
    html.setAttribute("data-home-wait", "");
    shown.current = () => { setTimeout(reveal, LAG); };
    const t = setTimeout(reveal, SLOW);
    return () => { clearTimeout(t); done = true; html.removeAttribute("data-home-wait"); };
  }, [first]);
  return (
    <div className={`nm-home-grid${first && split ? " dots-wait" : ""} yeta-set mx-auto grid h-svh w-full max-w-[560px] grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto] gap-3 overflow-hidden px-4 pt-[max(12px,env(safe-area-inset-top))] pb-[calc(86px+env(safe-area-inset-bottom))]`}>
      {split ? <FollowPulse /> : <div className="nm-home-top" style={{ gridRow: 1 }}><TopSwap pages={[{ node: <SnsApps />, label: "SNS" }, { node: <FollowPulse grow />, label: "팔로워" }, { node: <RunnerGauges />, label: "러너" }]} /></div>}   {/* 폰 = 첫 줄 한 칸에 팔로워 띠(늘 먼저) ↔ 러너 띠 · 옆으로 밀면 바뀜(./top-swap.tsx · 형 11-16 · 앞 판 11-15 = 둘을 위아래로 다 보임) · PC 반갈 = 러너 띠는 왼쪽 위(shell TopLeft)라 여긴 팔로워 띠만 */}
      {split ? <NewsFeed onShown={() => shown.current()} /> : <div className="nm-home-swap" style={{ gridRow: 2 }}><HotSwap label="뉴스"><NewsFeed onShown={() => shown.current()} /></HotSwap></div>}   {/* 폰 = 뉴스 카드 ↔ 키워드 순위(옆으로 넘기면 줄기 하나씩 · 형 11-14 「폰에서는 … 넘길때마다 차트가 나오게」) · PC 반갈 = 오른쪽 Hot Issue 칸이 번갈아 뜨니 여긴 그대로 */}
      <Arrived />
      {first && split ? <div className="nm-home-splash dots" aria-hidden><div className="nm-lazy"><i /><i /><i /></div></div>   /* PC 반갈 = 검정 새싹 덮개 대신 다른 화면과 같은 점 셋(형 11-20 09:11 dm-gik 깃 옮김 「그리고 처음에 키면 항상 저 메인화면 한쪽이 안드로이드 인앱화면처럼 검정으로 뜨는데 저거 저렇지 않고, 그냥 다른 화면처럼 로딩으로 뜨게해 점세개로」 · 덮개가 왼쪽 판 안에 갇혀 그 칸만 검정이던 것 · 점 셋 = shell LazyDots 와 같은 .nm-lazy) */
        : first ? <div className="nm-home-splash" aria-hidden style={intro.bg ? { background: intro.bg } : undefined}><IntroFace item={intro} /></div> : null}   {/* 진입 화면 = 목록 중 랜덤(./intro.tsx · 형 11-06 18:5x) */}
    </div>
  );
}
