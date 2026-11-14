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
