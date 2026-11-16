// 러너 일 「머리」(그 일이 쓰는 서브 LLM = 모델 · 노력도)의 셈(순수 · 시험 tests/llm-head.test.ts) — 화면 = ./llm-head.tsx(러너 일 판 안 한 칸)
//   형 11-17 02:0x 구름 맥 창(설정 「일 모델 · 노력도」 사진) 「이런식으로 서브 llm들이 잇어 얘들도 아까 스케줄러 사이사이에 어떨게 녹일지 봄하고 협의해서 진행해줘」
//   봄 02:04 「가 — A · B 부터 · 값의 주인은 설정의 일 모델 · 노력도 하나 · 스케줄러 카드는 같은 값을 읽고 같은 길로 씀 · 머리를 바꾸면 갈래가 통째로 바뀌니까 같이 바뀌는 일 N 을 재확인 토글 안에 같이」
//   갈래 = ① 파이프라인 일곱(./model-set-logic.ts PIPE_GROUPS · /api/settings llm) ② 서버가 직접 부르는 일(modelset 의 일 id)
//   어느 러너 일이 어느 갈래를 읽나 = 서버 표의 llm_group 칸(빠르한테 부탁 · 아직 없음) — 올 때까지는 아래 작은 표 하나(일감 가르기)만
import { type Choice, type Job, type Llm, type Pick, PIPE_DEF, PIPE_GROUPS, koOf, modelChoices, effortChoices, pipeChoices, pipeRows, sameOf } from "./model-set-logic.ts";

export type HeadKey = { kind: "pipe"; id: string } | { kind: "ms"; ids: string[] };
export type HeadJob = { id: string; name: string; llm_group?: string | string[]; llm?: string | string[] };   // llm_group = 갈래(서버 러너 지도 · 빠르 #4092: judge · brief · create · video · modelset) · llm = 그 워크플로가 읽는 손잡이 이름(「modelset:audit·sort」 꼴이면 서버 일 id)
/** 서버 칸이 오기 전에 아는 것 — 정원 일감 가르기 · 점검 = 서버 일 「일감 가르기」 + 「안 닫힌 오더 판독」(서버 where 글 「한 번에 처리 · 두 설정 연동」). */
const KNOWN: Record<string, string[]> = { "wf.garden-judge": ["ms:sort", "ms:audit"] };
const PIPE_IDS = PIPE_GROUPS.map((g) => g.id);
const listOf = (raw: unknown): string[] => (Array.isArray(raw) ? raw : raw ? [raw] : []).map((x) => String(x).trim()).filter(Boolean);
/** 이 러너 일의 머리 갈래 — 서버 칸 먼저: 손잡이 「modelset:<id>·<id>」 · 갈래 「ms:<id>」 = 서버 일 / 갈래 id(judge · create …) = 파이프라인 · 칸이 없으면 아는 표 · 그것도 없으면 null(줄 안 그림). */
export function headKeyOf(job: HeadJob): HeadKey | null {
  const groups = listOf(job.llm_group), hands = listOf(job.llm), known = listOf(KNOWN[job.id]);
  const ms = [...new Set([...hands.filter((h) => h.startsWith("modelset:")).flatMap((h) => h.slice(9).split(/\s*[·,]\s*/)), ...[...groups, ...(groups.length ? [] : known)].filter((x) => x.startsWith("ms:")).map((x) => x.slice(3))].filter(Boolean))];
  if (ms.length) return { kind: "ms", ids: ms };
  if (groups.includes("modelset")) { const k = known.filter((x) => x.startsWith("ms:")).map((x) => x.slice(3)); return k.length ? { kind: "ms", ids: k } : null; }   // 갈래는 서버 일인데 어느 일인지 손잡이가 안 옴 = 아는 표
  const pipe = groups.find((x) => PIPE_IDS.includes(x));
  return pipe ? { kind: "pipe", id: pipe } : null;
}
const sameKey = (a: HeadKey | null, b: HeadKey | null) => !!a && !!b && a.kind === b.kind && (a.kind === "pipe" ? a.id === (b as typeof a).id : a.ids.some((x) => (b as typeof a).ids.includes(x)));
/** 같은 갈래를 읽는 러너 일 이름들(이 일 포함) — 머리를 바꾸면 같이 바뀌는 일. */
export const headMates = (jobs: HeadJob[], job: HeadJob): string[] => { const k = headKeyOf(job); return k ? jobs.filter((j) => sameKey(headKeyOf(j), k)).map((j) => j.name) : []; };

export type Head = { title: string; model: string; effort: string; models: Choice[]; efforts: Choice[]; dimModel: boolean; dimEffort: boolean };
/** 갈래의 지금 값 + 고를 낱말 — 설정 화면과 같은 표 · 같은 말(모델 = 정식 이름 · 노력도 = CLI 낱말) · 못 읽었으면 null. */
export function headOf(key: HeadKey, sheet: { jobs: Job[]; models: Choice[] } | undefined, llm: Llm | undefined, llmReady: boolean): Head | null {
  if (key.kind === "ms") {
    const js = (sheet?.jobs || []).filter((j) => key.ids.includes(j.id)); if (!sheet || !js.length) return null;
    const now = js.map((j) => j.now);
    return { title: js.map((j) => j.ko).join(" · "), model: sameOf(now, "model"), effort: sameOf(now, "effort"), models: modelChoices(sheet.models), efforts: effortChoices(), dimModel: js.every((j) => j.now.model === j.def.model), dimEffort: js.every((j) => j.now.effort === j.def.effort) };
  }
  if (!llmReady) return null;
  const i = PIPE_IDS.indexOf(key.id), row: Pick = pipeRows(llm)[i], c = pipeChoices(key.id, modelChoices(sheet?.models || []));
  return { title: `파이프라인 · ${koOf(PIPE_GROUPS, key.id)}`, model: row.model, effort: row.effort, models: c.tiers, efforts: c.efforts, dimModel: row.model === PIPE_DEF, dimEffort: row.effort === PIPE_DEF };
}
/** 재확인 토글 덧글 — 같이 바뀌는 일이 이 일 말고 더 있으면 「같이 바뀌는 일 N」 · 서버 일이 여럿 묶였으면 그 이름. */
export function headNote(mates: string[], head: Head, key: HeadKey): string {
  const n = mates.length > 1 ? `같이 바뀌는 일 ${mates.length}` : "";
  return [n, key.kind === "ms" && key.ids.length > 1 ? `${head.title} 같이` : ""].filter(Boolean).join(" · ");
}
