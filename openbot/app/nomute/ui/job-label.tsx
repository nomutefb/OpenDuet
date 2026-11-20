// 직무 라벨 = 대화방 목록 이름 바로 뒤 그림 하나(형 확정 · 루미 시안 · 11-20 13:25 시아 옮김 「▶ 지금 반영: FIXER, MD, UXD (오빠 확정)」 ·
//   「▶ 규칙: 이모지 없음 · 직무 값은 따로 항목 칸에 있고, 그 값별로 라벨 이미지 하나 · 배경 투명 PNG」 · 「▶ 자리: 이름 바로 뒤, 이름 글자 세로 가운데에 맞춤(수평 맞춤)」 ·
//   「▶ 크기: FIXER·MD 높이 약 20px 기준, UXD는 그 60%(약 12px)」 · 「▶ 디자이너 라벨은 없앰어(디자이너 = UXD)」 · 「원본은 큰 해상도라 웹용으로 줄여서 써줘」)
//   그림 = 원본 투명 테 잘라 화면 높이 2배로 줄인 webp(public/job-*.webp · 2~5KB) · 보류(크리에이터 · MD 주인 미정 · PM 그림 기다림) = 그림 없음 → 옛 글 알약 그대로
export type Job = "FIXER" | "MD" | "UXD" | "DEV" | "OPS";
const IMG: Record<Job, { src: string; w: number; h: number }> = {
  FIXER: { src: "/garden-app/job-fixer.webp", w: 87, h: 40 },
  MD: { src: "/garden-app/job-md.webp", w: 49, h: 40 },
  UXD: { src: "/garden-app/job-uxd.webp", w: 77, h: 24 },
  DEV: { src: "/garden-app/job-dev.webp", w: 77, h: 40 },   // Dev · Ops = 루미 보류 시안 그대로 · 20px(시아 13:30 「FIXER · MD 와 같은 20px 꼴」)
  OPS: { src: "/garden-app/job-ops.webp", w: 79, h: 40 },
};
/** 직무 값 = 명부 job 칸(서버에 생기면 그것 먼저) · 없으면 이 표(형 13:28~13:29 dm-sia 시아 옮김 「응 uxd들은 다 uxd고, 픽서들은 다 픽서야. (소나-이슬-루미 라인)」 「uxd 라인 > (구름-하늘)」 · 루미 시안 「하늘·루미 = UXD」를 갈음)
 *  「pm 라인(봄-시아-깃)」 = 라벨 그림 오면 같은 꼴로 · MD 주인 = 아직 미정 */
//   Dev · Ops = 형 13:29 dm-sia 「dev랑 ops는 너가 배치해」 → 시아 배치(손 표 첫 특기) Dev = 천둥 · Ops = 빠르 · 번개
const JOB_OF: Record<string, Job> = { 구름: "UXD", 하늘: "UXD", 소나: "FIXER", 이슬: "FIXER", 루미: "FIXER", 천둥: "DEV", 빠르: "OPS", 번개: "OPS" };
export function jobOf(p?: { who: string; job?: string } | null): Job | undefined {
  if (!p) return undefined;
  const j = (p.job || "").trim().toUpperCase();
  return j in IMG ? (j as Job) : JOB_OF[p.who];
}
export function JobLabel({ job }: { job: Job }) {
  const g = IMG[job];
  return <img className="nm-job shrink-0" src={g.src} alt={job} width={g.w / 2} height={g.h / 2} decoding="async" draggable={false} />;
}
