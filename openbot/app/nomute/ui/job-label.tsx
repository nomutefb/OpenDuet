// 직무 라벨 = 대화방 목록 이름 바로 뒤 그림 하나(형 확정 · 루미 시안 · 11-20 13:25 시아 옮김 「▶ 지금 반영: FIXER, MD, UXD (오빠 확정)」 ·
//   「▶ 규칙: 이모지 없음 · 직무 값은 따로 항목 칸에 있고, 그 값별로 라벨 이미지 하나 · 배경 투명 PNG」 · 「▶ 자리: 이름 바로 뒤, 이름 글자 세로 가운데에 맞춤(수평 맞춤)」 ·
//   「▶ 크기: FIXER·MD 높이 약 20px 기준, UXD는 그 60%(약 12px)」 · 「▶ 디자이너 라벨은 없앰어(디자이너 = UXD)」 · 「원본은 큰 해상도라 웹용으로 줄여서 써줘」)
//   그림 = 원본 투명 테 잘라 화면 높이 2배로 줄인 webp(public/job-*.webp · 2~5KB) · 짝 없는 애(MD · MusiC 주인 미정) = 그림 없음 → 옛 글 알약 그대로
import { useQuery } from "@tanstack/react-query";
import { office } from "../data/office";
export type Job = "FIXER" | "MD" | "UXD" | "DEV" | "OPS" | "PM" | "STORY" | "MUSIC" | "CREATOR" | "RND" | "SEC" | "SCOOP" | "TELLER";
const IMG: Record<Job, { src: string; w: number; h: number; dy?: number; dx?: number }> = {   // dx = 이름 쪽으로 당김(px · 음수 = 왼쪽)   // dy = 그림 속 글자 가운데가 위아래로 쏠린 만큼 내림(px · 이름 줄과 수평)
  FIXER: { src: "/garden-app/job-fixer.webp?v=10", w: 80, h: 37, dx: -1 },   // 92%(18.5px) · 이름 쪽 1px(그림 왼쪽 빈칸 1.5px) · 형 20:53 dm-sia 시아 옮김 「FIXER 8%만 줄여서 아 아 주 조금만 이름쪽에 붙여주러 미세한 작업이라 미안」
  MD: { src: "/garden-app/job-md.webp?v=9", w: 49, h: 40 },
  UXD: { src: "/garden-app/job-uxd.webp?v=9", w: 68, h: 21 },   // 10.5px = FIXER 폭 맞춤 13px 의 80%(형 16:47 dm-gik 깃 옮김 「uxd는 아까 80%크기로 줄이라고했는데 안됫네」 · 앞 판 14:13 「딱봐도 픽서빼고는 너무 큰데」 13px · 13:56 「uxd 80%크기로면될듯」)
  // DeV · OpS = 하늘 그림(형 13:43~13:44 dm-sia 시아 옮김 「루미말고 다른애한테 그대로 시켜」 「uxd에게 그대로 시켜서 디자인하고」 「저기에 보면 ba랑 y가 강하잖아. 그걸 활요해서 만들라고해.」 「OpS 도 그런느낌으로 하면된다고하고」 「DeV 도 마찬」)
  //   BATTLE ACADEMY 꼴 = 첫 · 끝 글자 크게(끝 글자는 더 크게 뻗음) · 가운데 작게 · 흰 글 + 검은 굵은 테 + 뒤 검은 리본 판(흰 테) · 위 색 띠(DeV 하늘 · OpS 분홍) · 20px · 원본 = claude-state beings/하늘/일/직무-라벨/label_*_하늘.png · lab-gen.mjs
  DEV: { src: "/garden-app/job-dev.webp?v=12", w: 77, h: 25, dy: -0.25 },   // 형 20:45 dm-sia 시아 옮김 「데브는 좀 올려도 될듯 아직 올리는거 반영 안된거면」 → 1px 더 위(0.75 → -0.25)
    // DEV = 시아 글리치 좁게 판(왼쪽 여백 줄임) · 지금의 90%(38.5×12.5) · dy 0.75 = 1.5 판에서 아주 조금 위(형 20:38 dm-sia 시아 옮김 「데브는 이미 충분히 내려가잇네」 「그대로 두고 지금의 90% 크기로. 조금만 아주 아주 조금만 올라오고 좌측 여백 좀만 줄이자」 · 앞 판 dy 3 은 갈음)
    // DEV = 시아 글리치 그림 · 다 대문자 판(정원 원본 · 앞 판 3aaecb6 = claude-state 옛 「DeV」 판을 잘못 씀)(형 20:19 dm-sia 시아 옮김 「DEV는 저대로 가자 다 대문자로해서 자간만 줄여서 도스창 말고 기존거로」 · 「데브 크기 65%로 줄여서 70%?」 「여튼좀 커」 = 시아 견줌 판 70% 줄 · 43×13px) · 반짝임 같이(sparkle.py)
  //   OPS = 시아 렌치 그림(형 20:31 · 20:34 dm-sia 시아 옮김 「이 ok저 항목꼴로 ops에 해당하는걸 왕관 대신 붙일수잇나? 심플하면서 명확한 픽토를」 → 렌치) · 글자 높이 = DEV 글자와 같게(12px · 렌치는 위로) · dy -2 = 글자 몸통이 그림 아래쪽(가운데 0.64) → DEV 와 수평
  OPS: { src: "/garden-app/job-ops.webp?v=12", w: 67, h: 46, dy: -4 },   // OPS = 렌치 좁게 판(왼쪽 번개 줄 걷어 이름 쪽으로) · 115%(23px) · dy -4 = 글자 몸통 가운데 0.64 → 앞 판과 같은 수평(형 20:45 dm-sia 시아 옮김 「ops 115퍼 키우고 좀만 이름쪽으로」 · 20:37 「OPS는 좀 더 위로 올라오고」)
  // 남은 직무 일곱(형 11-20 16:48 dm-gik 깃 옮김 「루미가 그릴거 아니야 ~ 그리고」 「하늘이랑 구름이 할거야」 · 나눔 = 구름 16:50 안)
  //   하늘 = PM · StorY · MusiC(DeV · OpS 꼴 · beings/하늘/일/직무-라벨/lab-gen2.mjs) · 구름 = Creator(형 13:42 「크리에이터 라벨은 이느낌으로 하나 만들어서 달아줘」 홀로그램 필기체) · R&D · SeC · ScooP
  //   크기 = 폭 ≈ 44px(FIXER 와 눈에 같게 · 형 14:13 「딱봐도 픽서빼고는 너무 큰데 사이즈좀맞춰줘」) · 높이 20px 안
  PM: { src: "/garden-app/job-pm.webp?v=9", w: 63, h: 40 },   // PM = MD 결 스티커(형 18:51 dm-haneul 「하늘 PM」 + UXD 그림 · 「PM」 + MD 그림 · 「이 스타일이거든?」 · 라임 · 남색 입체 · 보라 테 · 체크 꼬리표) · 20px(MD 와 같은 높이)
  STORY: { src: "/garden-app/job-story.webp?v=9", w: 88, h: 29 },
  MUSIC: { src: "/garden-app/job-music.webp?v=9", w: 87, h: 27 },
  CREATOR: { src: "/garden-app/job-creator.webp?v=9", w: 89, h: 37 },
  RND: { src: "/garden-app/job-rnd.webp?v=11", w: 75, h: 34, dy: 0 },   // 형 20:51 dm-sia 시아 옮김 「RND 조금만 올릴게」 → 1px 위(dy 1 → 0)
    // RND = 시아 홀로 비커 그림(형 20:34~20:37 dm-sia 시아 옮김 「여기 TEEL 저거로 그 비커 모형픽토까지 글자느낌 가능할까」 「너 맘대로해도잼」 · 「크기 85% 로 수평 맞춰주면댐」 = 20px 의 85% 17px) · 그림에 반짝임 이미 있음(sparkle 안 덧댐)
  SEC: { src: "/garden-app/job-sec.webp?v=9", w: 88, h: 32 },
  SCOOP: { src: "/garden-app/job-scoop.webp?v=9", w: 87, h: 26 },
  // TELLER = 시아 「once upon a time」 그림(형 21:04~21:05 dm-sia 시아 옮김 「텔러 하까?」 「음악쟁이 글쟁이 다 스토리텔런데」 「오케이 ㄱㄱ」 「애들꺼 보고」 「경향성이 잇을거야 수평 경향성」)
  //   = 결 · 뎅 · 윈터(StorY 갈음) · 글자 높이 12px(넷과 같은 줄) · dy -2.5 = 글자 가운데 0.575 → 넷처럼 이름 가운데보다 1px 위 · dx -1.5 = 왼쪽 빈칸 · 그림에 반짝임 이미 있음
  TELLER: { src: "/garden-app/job-teller.webp", w: 78, h: 40, dy: -2.5, dx: -1.5 },
};
/** 직무 값 = 명부 job 칸(서버에 생기면 그것 먼저) · 없으면 이 표(형 13:28~13:29 dm-sia 시아 옮김 「응 uxd들은 다 uxd고, 픽서들은 다 픽서야. (소나-이슬-루미 라인)」 「uxd 라인 > (구름-하늘)」 · 루미 시안 「하늘·루미 = UXD」를 갈음)
 *  「pm 라인(봄-시아-깃)」 = 라벨 그림 오면 같은 꼴로 · MD 주인 = 아직 미정 */
//   Dev · Ops = 형 13:29 dm-sia 「dev랑 ops는 너가 배치해」 → 시아 배치(손 표 첫 특기) Dev = 천둥 · Ops = 빠르 · 번개
//   새 일곱 짝(하늘 짐작 · 기록 근거) = PM 봄 · 시아 · 깃(형 13:29 「pm 라인(봄-시아-깃)」) · Creator 뜸(bot-desk-logic Xa) · StorY 결 · 뎅 · 윈터(형 「뎅 결 윈터는 Storyteller」 · bot-desk-logic)
//     ScooP 슈왕(Xd) · SeC 온(형 「온은 secretary」) · R&D 카리나 · 감(손 표 첫 특기 R · 시아 13:30) · MusiC = 아직 주인 없음(그림만)
const JOB_OF: Record<string, Job> = { 구름: "UXD", 하늘: "UXD", 소나: "FIXER", 이슬: "FIXER", 루미: "FIXER", 천둥: "DEV", 빠르: "OPS", 번개: "OPS",
  봄: "PM", 시아: "PM", 깃: "PM", 뜸: "CREATOR", 결: "TELLER", 뎅: "TELLER", 윈터: "TELLER", 슈왕: "SCOOP", 온: "SEC", 카리나: "RND", 감: "RND" };
export function jobOf(p?: { who: string; job?: string } | null): Job | undefined {
  if (!p) return undefined;
  const j = (p.job || "").trim().toUpperCase();
  return j in IMG ? (j as Job) : JOB_OF[p.who];
}
export function JobLabel({ job, who }: { job: Job; who?: string }) {
  if (job === "PM" && who) return <PmLabel who={who} />;
  const g = IMG[job];
  return <img className="nm-job shrink-0" src={g.src} alt={job} width={g.w / 2} height={g.h / 2} style={g.dy || g.dx ? { ...(g.dy ? { transform: `translateY(${g.dy}px)` } : {}), ...(g.dx ? { marginLeft: g.dx } : {}) } : undefined} decoding="async" draggable={false} />;
}
/** 지금 PM 만 무지개 판(형 11-20 19:18 dm-haneul 「현재 PM은 레인보우로 특별하게, 무지개 빛 할수있어?」) · 나머지 PM 라인 = 라임 스티커
 *  지금 PM = 서버 pm 칸(우하단 PM 구슬 ./room-fab.tsx 와 같은 캐시 열쇠 · 받기 0 더) · 교대되면 무지개도 따라감 · 그림 = 정지(움직임 0) */
const PM_NOW = { src: "/garden-app/job-pm-now.webp?v=9", w: 63, h: 40 };
function PmLabel({ who }: { who: string }) {
  const now = useQuery({ queryKey: ["nomute", "pm"], queryFn: () => office<{ who?: string }>("pm"), staleTime: 300_000, refetchInterval: 300_000 }).data?.who;
  const g = now === who ? PM_NOW : IMG.PM;
  return <img className="nm-job shrink-0" src={g.src} alt={now === who ? "지금 PM" : "PM"} width={g.w / 2} height={g.h / 2} decoding="async" draggable={false} />;
}
