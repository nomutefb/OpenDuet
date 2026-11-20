// 설정 「모델 · 노력도」 논리(./model-set.tsx) — 서버가 준 꼴을 그대로 받아 글자 · 「모두」 줄 값만 정함(판정 0)
export type Pick = { model: string; effort: string };
export type Job = { id: string; ko: string; where?: string; def: Pick; now: Pick };
export type Choice = { id: string; ko: string; menu?: string };   // menu = 고르는 목록에서만 앞에 붙는 말(「기본」) — 접힌 칸엔 ko(실제 값)만
export type Sheet = { jobs: Job[]; models: Choice[]; efforts: Choice[] };

export const koOf = (list: Choice[], id: string): string => list.find((c) => c.id === id)?.ko || id;
/** 서버 일 이름 → 앱에서 부르는 이름(형 11-21 05:44 dm-bom 봄 옮김 「일감 가르기 명칭 배분 서브」 · 열쇠 id 그대로 · 서버 표 이름은 안 고침) */
export const JOB_KO: Record<string, string> = { sort: "배분 서브" };
export const sheetKo = (s: Sheet): Sheet => ({ ...s, jobs: (s.jobs || []).map((j) => (JOB_KO[j.id] ? { ...j, ko: JOB_KO[j.id] } : j)) });
/** 모델 이름 = 정식 표기 그대로(형 11-15 「모델명을 정확히 표기되게」) — ID 에서 만듦: claude-opus-5-5 → 「Opus 5.5」 · 꼴이 다르면 받은 글자 그대로. */
export function modelName(id: string): string {
  const m = /^claude-([a-z]+)-(\d+)(?:-(\d+))?$/.exec(id || "");
  return m ? `${m[1][0].toUpperCase()}${m[1].slice(1)} ${m[2]}${m[3] ? "." + m[3] : ""}` : id;
}
/** 노력도 = CLI 에 뜨는 낱말 그대로(low · medium · high · xhigh · max · 형 11-15 「실제로 구분되는 그 표시되는걸로 cli에」). */
export const EFFORTS_CLI = ["low", "medium", "high", "xhigh", "max"] as const;
export const effortChoices = (): Choice[] => EFFORTS_CLI.map((id) => ({ id, ko: id }));
/** 모델 차례 = 높은 것부터(형 11-18 19:01 dm-gik 깃 옮김 「높은거부터 나오게해줘 미토스 부터」) — 갈래(미토스 → 오퍼스 → 페이블 → 소넷 → 하이쿠) · 같은 갈래 = 판 숫자 큰 것 먼저 · 모르는 갈래 = 맨 뒤(받은 차례 그대로). */
const FAM = ["mythos", "opus", "fable", "sonnet", "haiku"];
export function modelRank(id: string): [number, number] {
  const m = /^claude-([a-z]+)-(\d+)(?:-(\d+))?$/.exec(id || "");
  if (!m) return [FAM.length, 0];
  const f = FAM.indexOf(m[1]);
  return [f < 0 ? FAM.length : f, -(Number(m[2]) * 100 + Number(m[3] || 0))];
}
export const byRank = <T extends { id: string }>(list: T[]): T[] => list.map((c, i) => ({ c, i, r: modelRank(c.id) })).sort((a, b) => a.r[0] - b.r[0] || a.r[1] - b.r[1] || a.i - b.i).map((x) => x.c);
/** 서버가 준 모델 표 → 이름을 정식 표기로 바꾼 표 · 높은 것부터. */
export const modelChoices = (list: Choice[]): Choice[] => byRank(list.map((c) => ({ id: c.id, ko: modelName(c.id) })));
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
  return `${m ? koOf(models, m) : "섞임"} · ${e ? koOf(efforts, e) : "섞임"}`;
}

// ── 파이프라인 중분류(형 11-15 「파이프라인도 설정에 묶을게, 근데 중분류로 좀 변경해줘」) — 갈래 표 = 서버 저장소 shared/llm_groups.json 과 같은 이름
//   저장 = 앱 설정 한 장(/api/settings 의 llm 칸 {갈래: {tier?, effort?}}) · 칸이 없으면 = 그 갈래는 스크립트 기본 그대로
export const PIPE_GROUPS: Choice[] = [
  { id: "summary", ko: "뉴스 요약" }, { id: "card", ko: "카드" },   // summary 이름 = 「뉴스 요약」(형 11-21 05:46 dm-sia 시아 옮김 「요약 분석 용어 뉴스 요약」 · 앞 = 요약 · 분석 · 열쇠 id 는 그대로) { id: "judge", ko: "판정" }, { id: "create", ko: "창작" },
  { id: "video", ko: "영상 초안 · 자막" }, { id: "brief", ko: "브리프" }, { id: "read", ko: "분류 · 읽기" },
];
export const PIPE_DEF = "default";   // 고르는 칸의 「기본」 값(서버로는 빈 글 = 그 칸 지움)
export const PIPE_TIER_IDS = ["opus", "sonnet"] as const;
/** 갈래마다 스크립트가 원래 쓰는 값(안 고른 칸에 보여 줄 글 · 11-15 전수조사 기준 · tier 빈 글 = 그 갈래 안에서 호출마다 다름). */
export const PIPE_BASE: Record<string, { tier: string; effort: string }> = {
  summary: { tier: "opus", effort: "high" }, card: { tier: "", effort: "high" }, judge: { tier: "", effort: "high" }, create: { tier: "opus", effort: "high" },
  video: { tier: "opus", effort: "high" }, brief: { tier: "", effort: "high" }, read: { tier: "sonnet", effort: "high" },
};
/** 티어 이름 → 정식 모델 이름(서버 모델 표에서 그 계열을 찾음 · 못 찾으면 첫 글자만 대문자). */
export function tierName(tier: string, models: Choice[]): string {
  const hit = models.find((m) => m.id.includes(`-${tier}-`));
  return hit ? modelName(hit.id) : tier ? tier[0].toUpperCase() + tier.slice(1) : "";
}
/** 갈래 하나의 고르는 칸 표 — 첫 칸 = 「기본」(안 고름): 지금 실제로 쓰이는 값을 그대로 보여 줌(형 11-15 「선택된거가 기본적으로 저기에 나오고」). */
export function pipeChoices(gid: string, models: Choice[]): { tiers: Choice[]; efforts: Choice[] } {
  const b = PIPE_BASE[gid] || { tier: "", effort: "" };
  return {
    tiers: [{ id: PIPE_DEF, ko: b.tier ? tierName(b.tier, models) : "여러 값", menu: "기본" }, ...PIPE_TIER_IDS.map((t) => ({ id: t, ko: tierName(t, models) }))],
    efforts: [{ id: PIPE_DEF, ko: b.effort || "여러 값", menu: "기본" }, ...effortChoices()],
  };
}
/** 「모두」 줄의 고르는 칸 표(첫 칸 = 「기본」 = 일곱 갈래 다 안 고름). */
export const pipeAllChoices = (models: Choice[]): { tiers: Choice[]; efforts: Choice[] } => ({
  tiers: [{ id: PIPE_DEF, ko: "기본" }, ...PIPE_TIER_IDS.map((t) => ({ id: t, ko: tierName(t, models) }))],
  efforts: [{ id: PIPE_DEF, ko: "기본" }, ...effortChoices()],
});
const PIPE_TIERS: Choice[] = [{ id: PIPE_DEF, ko: "" }, ...PIPE_TIER_IDS.map((id) => ({ id, ko: id }))];
const PIPE_EFFORTS: Choice[] = [{ id: PIPE_DEF, ko: "" }, ...effortChoices()];
export type Llm = Record<string, { tier?: string; effort?: string; src?: Record<string, { tier?: string; effort?: string }> }>;   // src = 갈래 안 호출 하나만 따로(서버 settings.js · shared/llm_pick.py · 형 11-19)
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

// ── 갈래 안 호출 하나하나(형 11-19 「판정 < 여러값 나와있는데, 여러값인거는 애초에 카테고라이징해서 그 안에서 분류되어야할듯, 조금 들여쓰기를 더 하든지해서, 분류해줘」)
//   자료 = /token-usage.json 의 llm 칸(에디터 shared/token_report.py) — 갈래 표 + 호출 이름마다 마지막으로 실제 쓴 모델 · 노력도 · 때 · 워크플로
//   「지금 값」 = 재서 적힌 실제 값(형 「거기서 설정한게 실제로 반영도되어야하고」 = 고른 뒤 다음 호출의 계측 줄로 확인됨) · 화면이 지어내는 값 0
export type LlmLastRow = { model?: string; effort?: string; ts?: string; wf?: string; group?: string; ko?: string };
export type LlmUse = { groups?: { id: string; ko: string; sources: string[] }[]; last?: Record<string, LlmLastRow> };
export type SrcRow = { id: string; ko: string; model: string; effort: string; ts: number; wf: string; pick: Pick };
export const SRC_DAYS = 30;   // 이보다 오래 안 불린 호출 = 줄을 안 세움(옛 모델 이름이 「지금 값」처럼 보이지 않게)
/** 모델 id → 티어 낱말(opus · sonnet …) · 꼴이 다르면 빈 글 */
export const tierOf = (model?: string): string => /^claude-([a-z]+)-/.exec(model || "")?.[1] || "";
/** 호출 이름표 = 서버 이름표에서 끝 괄호(호출 이름)를 뗀 것 · 없으면 호출 이름 그대로 */
const SRC_KO: Record<string, string> = {   // 서버 이름표(shared/token_report.py SRC_LABEL)에 아직 없는 호출 = 그 호출을 내는 스크립트 · 러너 일 이름에서(봄 11-19 · 서버 표에 실리면 그쪽이 이김)
  group: "사건 묶기", "sns-sum": "SNS 요약", thumbcopy: "썸네일 문구", moreimg: "대표 이미지", genimg: "생성형 이미지", igcls: "인스타 분류", fbcls: "페북 분류", covocr: "표지 글자 읽기", askocr: "출처 글자 읽기",
  "chan-brief": "채널 브리프", "fb-brief": "페북 브리프", "sns-brief": "SNS 브리프", bundle_source: "묶음 공식 자료", chok: "촉 판단", teum: "틈 판단",
};
export const srcKo = (id: string, ko?: string): string => (ko || "").replace(/\s*\([^)]*\)\s*$/, "").trim() || SRC_KO[id] || id;
/** 한 갈래의 호출 줄 — 그 갈래에 든 호출 가운데 최근(SRC_DAYS) 불린 것 · 차례 = 갈래 표 차례 → 이름 · pick = 그 호출만 따로 고른 값(없는 칸 = 「기본」) */
export function srcRows(gid: string, use: LlmUse | undefined, llm: Llm | undefined, now = Date.now()): SrcRow[] {
  const last = use?.last || {}, order = use?.groups?.find((g) => g.id === gid)?.sources || [];
  const at = (id: string) => { const i = order.findIndex((p) => p === id || (p.endsWith("*") && id.startsWith(p.slice(0, -1)))); return i < 0 ? 999 : i; };
  const one = llm?.[gid]?.src || {};
  return Object.entries(last).filter(([, r]) => r.group === gid && !!r.model).map(([id, r]) => ({ id, r, ts: Date.parse(r.ts || "") || 0 }))
    .filter((x) => now - x.ts < SRC_DAYS * 86400e3)
    .sort((a, b) => at(a.id) - at(b.id) || a.id.localeCompare(b.id))
    .map(({ id, r, ts }) => ({ id, ko: srcKo(id, r.ko), model: r.model || "", effort: r.effort || "", ts, wf: r.wf || "",
      pick: { model: PIPE_TIERS.some((t) => t.id === one[id]?.tier) ? (one[id]!.tier as string) : PIPE_DEF, effort: PIPE_EFFORTS.some((e) => e.id === one[id]?.effort) ? (one[id]!.effort as string) : PIPE_DEF } }));
}
/** 호출들의 실제 값이 여럿인가(갈래 줄의 「여러 값」 = 이때만) */
export const mixedOf = (rows: SrcRow[], key: "model" | "effort"): boolean => new Set(rows.map((r) => r[key])).size > 1;
/** 갈래 줄의 고르는 칸 표 — 첫 칸 「기본」 글 = 그 갈래 호출들이 실제 쓰는 값(다 같으면 그 값 · 섞였으면 「여러 값」 · 잰 호출이 없으면 전수조사 표 PIPE_BASE) */
export function groupChoices(gid: string, rows: SrcRow[], models: Choice[]): { tiers: Choice[]; efforts: Choice[] } {
  const base = pipeChoices(gid, models);
  if (!rows.length) return base;
  const m = mixedOf(rows, "model") ? "여러 값" : modelName(rows[0].model), e = mixedOf(rows, "effort") ? "여러 값" : rows[0].effort || "여러 값";
  return { tiers: [{ id: PIPE_DEF, ko: m, menu: "기본" }, ...base.tiers.slice(1)], efforts: [{ id: PIPE_DEF, ko: e, menu: "기본" }, ...base.efforts.slice(1)] };
}
/** 호출 줄의 고르는 칸 표 — 첫 칸 「기본」 글 = 갈래에서 고른 값이 있으면 그 값(따라감) · 없으면 그 호출이 실제 쓴 마지막 값 */
export function srcChoices(r: SrcRow, group: Pick, models: Choice[]): { tiers: Choice[]; efforts: Choice[] } {
  return {
    tiers: [{ id: PIPE_DEF, ko: group.model !== PIPE_DEF ? tierName(group.model, models) : modelName(r.model), menu: "기본" }, ...PIPE_TIER_IDS.map((t) => ({ id: t, ko: tierName(t, models) }))],
    efforts: [{ id: PIPE_DEF, ko: group.effort !== PIPE_DEF ? group.effort : r.effort || "기본", menu: "기본" }, ...effortChoices()],
  };
}
/** 호출 하나만 따로 고른 것 → 서버로 보낼 바꾸기 · 「기본」 = 빈 글(그 칸만 지움 = 갈래 값 · 스크립트 기본으로) */
export function pipePatchSrc(gid: string, src: string, p: Partial<Pick>): Llm {
  const row: { tier?: string; effort?: string } = {};
  if (p.model !== undefined) row.tier = p.model === PIPE_DEF ? "" : p.model;
  if (p.effort !== undefined) row.effort = p.effort === PIPE_DEF ? "" : p.effort;
  return { [gid]: { src: { [src]: row } } };
}
/** 한 워크플로(러너 일)가 부르는 호출들 — 스케줄 나무의 그 일 판 「머리」가 이 줄들을 세움(형 11-19 「이게 스케쥴 표 안에 들어가야한다고 봐」) */
export function wfSources(wf: string, use: LlmUse | undefined, llm: Llm | undefined, now = Date.now()): (SrcRow & { group: string })[] {
  if (!wf) return [];
  const gids = [...new Set(Object.values(use?.last || {}).filter((r) => r.wf === wf && r.group).map((r) => r.group as string))];
  return gids.flatMap((g) => srcRows(g, use, llm, now).filter((r) => r.wf === wf).map((r) => ({ ...r, group: g })));
}

