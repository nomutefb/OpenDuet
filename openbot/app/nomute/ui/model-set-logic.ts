// 설정 「모델 · 노력도」 논리(./model-set.tsx) — 서버가 준 꼴을 그대로 받아 글자 · 「모두」 줄 값만 정함(판정 0)
export type Pick = { model: string; effort: string };
export type Job = { id: string; ko: string; where?: string; def: Pick; now: Pick };
export type Choice = { id: string; ko: string };
export type Sheet = { jobs: Job[]; models: Choice[]; efforts: Choice[] };

export const koOf = (list: Choice[], id: string): string => list.find((c) => c.id === id)?.ko || id;
export const EFFORT_KO: Record<string, string> = { low: "낮음", medium: "보통", high: "높음", xhigh: "아주 높음", max: "최대" };
/** 줄 오른쪽 글 = 「하이쿠 5.5 · 낮음」. */
export const pickKo = (models: Choice[], efforts: Choice[], p: Pick): string => `${koOf(models, p.model)} · ${koOf(efforts, p.effort)}`;
/** 「모두」 줄의 한 칸 값 = 다 같으면 그 값 · 섞였으면 빈 글(고르는 칸은 「섞임」을 보여 줌). */
export function sameOf(rows: Pick[], key: keyof Pick): string {
  if (!rows.length) return "";
  const v = rows[0][key];
  return rows.every((r) => r[key] === v) ? v : "";
}
/** 묶음 줄 오른쪽 한마디 = 봇 상자 쪽 · 서버 쪽을 한 줄로(다 같으면 그 값 · 섞였으면 「섞임」) · 아직 못 읽었으면 빈 글. */
export function sumKo(bots: Pick[] | undefined, models: Choice[], efforts: Choice[]): string {
  if (!bots || !bots.length) return "";
  const m = sameOf(bots, "model"), e = sameOf(bots, "effort");
  return `봇 ${m ? koOf(models, m) : "섞임"} · ${e ? koOf(efforts, e) : "섞임"}`;
}

// ── 파이프라인 중분류(형 11-15 「파이프라인도 설정에 묶을게, 근데 중분류로 좀 변경해줘」) — 갈래 표 = 서버 저장소 shared/llm_groups.json 과 같은 이름
//   저장 = 앱 설정 한 장(/api/settings 의 llm 칸 {갈래: {tier?, effort?}}) · 칸이 없으면 = 그 갈래는 스크립트 기본 그대로
export const PIPE_GROUPS: Choice[] = [
  { id: "summary", ko: "요약 · 분석" }, { id: "card", ko: "카드" }, { id: "judge", ko: "판정" }, { id: "create", ko: "창작" },
  { id: "video", ko: "영상 초안 · 자막" }, { id: "brief", ko: "브리프" }, { id: "read", ko: "분류 · 읽기" },
];
export const PIPE_DEF = "default";   // 고르는 칸의 「기본」 값(서버로는 빈 글 = 그 칸 지움)
export const PIPE_TIERS: Choice[] = [{ id: PIPE_DEF, ko: "기본" }, { id: "opus", ko: "오퍼스" }, { id: "sonnet", ko: "소넷" }];
export const PIPE_EFFORTS: Choice[] = [{ id: PIPE_DEF, ko: "기본" }, ...["low", "medium", "high", "xhigh", "max"].map((id) => ({ id, ko: EFFORT_KO[id] }))];
export type Llm = Record<string, { tier?: string; effort?: string }>;
/** 서버 값 → 갈래마다 고르는 칸 값(안 고른 칸 = 「기본」 · 표 밖 값도 「기본」). */
export function pipeRows(llm: Llm | undefined): Pick[] {
  return PIPE_GROUPS.map((g) => {
    const r = (llm && llm[g.id]) || {};
    return { model: PIPE_TIERS.some((t) => t.id === r.tier) ? (r.tier as string) : PIPE_DEF, effort: PIPE_EFFORTS.some((e) => e.id === r.effort) ? (r.effort as string) : PIPE_DEF };
  });
}
/** 고른 것 → 서버로 보낼 바꾸기(갈래 하나 · 또는 모두) · 「기본」 = 빈 글(그 칸 지움). */
export function pipePatch(gids: string[], p: Partial<Pick>): Llm {
  const row: { tier?: string; effort?: string } = {};
  if (p.model !== undefined) row.tier = p.model === PIPE_DEF ? "" : p.model;
  if (p.effort !== undefined) row.effort = p.effort === PIPE_DEF ? "" : p.effort;
  return Object.fromEntries(gids.map((g) => [g, { ...row }]));
}
