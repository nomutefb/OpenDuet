// 직무 라벨 = 대화방 목록 이름 바로 뒤 그림 하나(형 확정 · 루미 시안 · 11-20 13:25 시아 옮김 「▶ 지금 반영: FIXER, MD, UXD (오빠 확정)」 ·
//   「▶ 규칙: 이모지 없음 · 직무 값은 따로 항목 칸에 있고, 그 값별로 라벨 이미지 하나 · 배경 투명 PNG」 · 「▶ 자리: 이름 바로 뒤, 이름 글자 세로 가운데에 맞춤(수평 맞춤)」 ·
//   「▶ 크기: FIXER·MD 높이 약 20px 기준, UXD는 그 60%(약 12px)」 · 「▶ 디자이너 라벨은 없앰어(디자이너 = UXD)」 · 「원본은 큰 해상도라 웹용으로 줄여서 써줘」)
//   그림 = 원본 투명 테 잘라 화면 높이 2배로 줄인 webp(public/job-*.webp · 2~5KB) · 짝 없는 애(MD · MusiC 주인 미정) = 그림 없음 → 옛 글 알약 그대로
import { useQuery } from "@tanstack/react-query";
import { office } from "../data/office";
export type Job = "FIXER" | "MD" | "UXD" | "DEV" | "OPS" | "PM" | "STORY" | "MUSIC" | "CREATOR" | "RND" | "SEC" | "SCOOP";
const IMG: Record<Job, { src: string; w: number; h: number }> = {
  FIXER: { src: "/garden-app/job-fixer.webp?v=9", w: 87, h: 40 },
  MD: { src: "/garden-app/job-md.webp?v=9", w: 49, h: 40 },
  UXD: { src: "/garden-app/job-uxd.webp?v=9", w: 68, h: 21 },   // 10.5px = FIXER 폭 맞춤 13px 의 80%(형 16:47 dm-gik 깃 옮김 「uxd는 아까 80%크기로 줄이라고했는데 안됫네」 · 앞 판 14:13 「딱봐도 픽서빼고는 너무 큰데」 13px · 13:56 「uxd 80%크기로면될듯」)
  // DeV · OpS = 하늘 그림(형 13:43~13:44 dm-sia 시아 옮김 「루미말고 다른애한테 그대로 시켜」 「uxd에게 그대로 시켜서 디자인하고」 「저기에 보면 ba랑 y가 강하잖아. 그걸 활요해서 만들라고해.」 「OpS 도 그런느낌으로 하면된다고하고」 「DeV 도 마찬」)
  //   BATTLE ACADEMY 꼴 = 첫 · 끝 글자 크게(끝 글자는 더 크게 뻗음) · 가운데 작게 · 흰 글 + 검은 굵은 테 + 뒤 검은 리본 판(흰 테) · 위 색 띠(DeV 하늘 · OpS 분홍) · 20px · 원본 = claude-state beings/하늘/일/직무-라벨/label_*_하늘.png · lab-gen.mjs
  DEV: { src: "/garden-app/job-dev.webp?v=10", w: 86, h: 26 },   // DEV = 시아 글리치 그림(형 20:19 dm-sia 시아 옮김 「DEV는 저대로 가자 다 대문자로해서 자간만 줄여서 도스창 말고 기존거로」 · 「데브 크기 65%로 줄여서 70%?」 「여튼좀 커」 = 시아 견줌 판 70% 줄 · 43×13px) · 반짝임 같이(sparkle.py)
  //   OpS = 아래 배틀 꼴 그대로(형 「OPS는 다른거로 새악좀해볼게 ㅋㅋㅋ」)
  OPS: { src: "/garden-app/job-ops.webp?v=9", w: 89, h: 32 },
  // 남은 직무 일곱(형 11-20 16:48 dm-gik 깃 옮김 「루미가 그릴거 아니야 ~ 그리고」 「하늘이랑 구름이 할거야」 · 나눔 = 구름 16:50 안)
  //   하늘 = PM · StorY · MusiC(DeV · OpS 꼴 · beings/하늘/일/직무-라벨/lab-gen2.mjs) · 구름 = Creator(형 13:42 「크리에이터 라벨은 이느낌으로 하나 만들어서 달아줘」 홀로그램 필기체) · R&D · SeC · ScooP
  //   크기 = 폭 ≈ 44px(FIXER 와 눈에 같게 · 형 14:13 「딱봐도 픽서빼고는 너무 큰데 사이즈좀맞춰줘」) · 높이 20px 안
  PM: { src: "/garden-app/job-pm.webp?v=9", w: 63, h: 40 },   // PM = MD 결 스티커(형 18:51 dm-haneul 「하늘 PM」 + UXD 그림 · 「PM」 + MD 그림 · 「이 스타일이거든?」 · 라임 · 남색 입체 · 보라 테 · 체크 꼬리표) · 20px(MD 와 같은 높이)
  STORY: { src: "/garden-app/job-story.webp?v=9", w: 88, h: 29 },
  MUSIC: { src: "/garden-app/job-music.webp?v=9", w: 87, h: 27 },
  CREATOR: { src: "/garden-app/job-creator.webp?v=9", w: 89, h: 37 },
  RND: { src: "/garden-app/job-rnd.webp?v=9", w: 89, h: 33 },
  SEC: { src: "/garden-app/job-sec.webp?v=9", w: 88, h: 32 },
  SCOOP: { src: "/garden-app/job-scoop.webp?v=9", w: 87, h: 26 },
};
/** 직무 값 = 명부 job 칸(서버에 생기면 그것 먼저) · 없으면 이 표(형 13:28~13:29 dm-sia 시아 옮김 「응 uxd들은 다 uxd고, 픽서들은 다 픽서야. (소나-이슬-루미 라인)」 「uxd 라인 > (구름-하늘)」 · 루미 시안 「하늘·루미 = UXD」를 갈음)
 *  「pm 라인(봄-시아-깃)」 = 라벨 그림 오면 같은 꼴로 · MD 주인 = 아직 미정 */
//   Dev · Ops = 형 13:29 dm-sia 「dev랑 ops는 너가 배치해」 → 시아 배치(손 표 첫 특기) Dev = 천둥 · Ops = 빠르 · 번개
//   새 일곱 짝(하늘 짐작 · 기록 근거) = PM 봄 · 시아 · 깃(형 13:29 「pm 라인(봄-시아-깃)」) · Creator 뜸(bot-desk-logic Xa) · StorY 결 · 뎅 · 윈터(형 「뎅 결 윈터는 Storyteller」 · bot-desk-logic)
//     ScooP 슈왕(Xd) · SeC 온(형 「온은 secretary」) · R&D 카리나 · 감(손 표 첫 특기 R · 시아 13:30) · MusiC = 아직 주인 없음(그림만)
const JOB_OF: Record<string, Job> = { 구름: "UXD", 하늘: "UXD", 소나: "FIXER", 이슬: "FIXER", 루미: "FIXER", 천둥: "DEV", 빠르: "OPS", 번개: "OPS",
  봄: "PM", 시아: "PM", 깃: "PM", 뜸: "CREATOR", 결: "STORY", 뎅: "STORY", 윈터: "STORY", 슈왕: "SCOOP", 온: "SEC", 카리나: "RND", 감: "RND" };
export function jobOf(p?: { who: string; job?: string } | null): Job | undefined {
  if (!p) return undefined;
  const j = (p.job || "").trim().toUpperCase();
  return j in IMG ? (j as Job) : JOB_OF[p.who];
}
export function JobLabel({ job, who }: { job: Job; who?: string }) {
  if (job === "PM" && who) return <PmLabel who={who} />;
  const g = IMG[job];
  return <img className="nm-job shrink-0" src={g.src} alt={job} width={g.w / 2} height={g.h / 2} decoding="async" draggable={false} />;
}
/** 지금 PM 만 무지개 판(형 11-20 19:18 dm-haneul 「현재 PM은 레인보우로 특별하게, 무지개 빛 할수있어?」) · 나머지 PM 라인 = 라임 스티커
 *  지금 PM = 서버 pm 칸(우하단 PM 구슬 ./room-fab.tsx 와 같은 캐시 열쇠 · 받기 0 더) · 교대되면 무지개도 따라감 · 그림 = 정지(움직임 0) */
const PM_NOW = { src: "/garden-app/job-pm-now.webp?v=9", w: 63, h: 40 };
function PmLabel({ who }: { who: string }) {
  const now = useQuery({ queryKey: ["nomute", "pm"], queryFn: () => office<{ who?: string }>("pm"), staleTime: 300_000, refetchInterval: 300_000 }).data?.who;
  const g = now === who ? PM_NOW : IMG.PM;
  return <img className="nm-job shrink-0" src={g.src} alt={now === who ? "지금 PM" : "PM"} width={g.w / 2} height={g.h / 2} decoding="async" draggable={false} />;
}
