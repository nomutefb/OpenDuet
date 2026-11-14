// 서랍 「봇 현황」(./bot-desk.tsx)의 칸 글 — 서버 도표(editor functions/api/office/_botsheet.js sheetTable · GET status/bots 의 table)를 읽기만 함
//   판정 · 차례 셈은 서버 것 하나(PM 이 read room=bots 로 읽는 표와 같은 재료) · 여기선 칸 글과 색 갈래만
export type Turn = { n?: number; rank?: number; busy?: boolean; x?: string };
export type Lane = "lost" | "ready" | "work" | "rest" | "off" | "none";
export type BotRow = {
  who: string; brain?: string; lane: Lane; state: string; cause?: string; why?: string;
  last_at?: number; beat_at?: number; door_at?: number; ctx_pct?: number; work_min?: number; acct?: string; acct_left?: number;
  skills?: string[]; hw?: { ram?: string; cpu?: string; gpu?: string; os?: string }; note?: string; turn?: Record<string, Turn>;
  open?: { no: string; title?: string; code?: string; at?: number }[]; today?: number; pm?: boolean; rest?: boolean;   // 맡은 오더(받고 안 끝낸 것) · 오늘 받은 수 · PM 자리 · 쉼 지정
};
export type First = { who: string; rank?: number; busy?: boolean };
export type Late = { no: string; who: string; code?: string; min: number };
export type BotTable = { codes: string[]; rows: BotRow[]; first?: Record<string, First>; late?: Late[] };
export type Tone = "ok" | "lost" | "dim" | "plain";

/** 지난 때 글 — 서버 글(agoKo)과 같은 꼴: 방금 · N분 전 · N시간 M분 전. */
export function agoKo(ms: number): string {
  const m = Math.trunc(Math.max(0, ms) / 60e3);
  return m < 1 ? "방금" : m < 60 ? `${m}분 전` : `${Math.floor(m / 60)}시간 ${m % 60}분 전`;
}
/** 시각(한국) HH:MM. */
export const hmKo = (ts: number): string => new Date(ts + 9 * 3600e3).toISOString().slice(11, 16);

/** 상태 칸 색 갈래 — 일하는 중 = 라임 · 멈춤 = 빨강 · 조용 · 줄 없음 = 흐림 · 그 밖 = 그대로. */
export const laneTone = (lane: Lane): Tone => (lane === "work" ? "ok" : lane === "lost" ? "lost" : lane === "off" || lane === "none" ? "dim" : "plain");

/** 일 차례 칸 — 서버 글과 같은 꼴: 숫자 = 줄 차례 · 「밖」 = 특기 밖 · (괄호) = 일하는 중이라 뒤 · × = 못 맡김 · 빈 칸 = –. */
export function turnCell(t?: Turn): { text: string; tone: Tone; title: string } {
  if (!t) return { text: "–", tone: "dim", title: "" };
  if (t.x) return { text: "×", tone: "dim", title: t.x };
  const core = `${t.n ?? ""}${t.rank ? "" : "밖"}`;
  if (t.busy) return { text: `(${core})`, tone: "dim", title: "일하는 중이라 뒤" };
  return { text: core, tone: t.rank ? (t.n === 1 ? "ok" : "plain") : "dim", title: t.rank ? `${t.rank}특기` : "특기 밖" };
}

/** 신호 칸 — 대기 신호(클로드 · 카리나) 또는 문 확인(그록). */
export function sigOf(r: BotRow, now: number): string {
  return r.beat_at ? `대기 ${agoKo(now - r.beat_at)}` : r.door_at ? `문 확인 ${agoKo(now - r.door_at)}` : "–";
}

/** 맨 위 셈 — 받을 수 있음 · 일하는 중 · 쉼 · 멈춤(조용 · 줄 없음 = 쉼 쪽에 안 셈). */
export function countOf(rows: BotRow[]): { ready: number; work: number; rest: number; lost: number } {
  const n = { ready: 0, work: 0, rest: 0, lost: 0 };
  for (const r of rows) if (r.lane === "ready" || r.lane === "work" || r.lane === "rest" || r.lane === "lost") n[r.lane]++;
  return n;
}

/** 불 칩 — 분류마다 지금 1번(서버 first 칸 그대로) → [{code, text, tone}] · 특기 밖 = 「밖」 · 다 일하는 중 = (괄호). */
export function fireChips(t: BotTable): { code: string; text: string; tone: Tone }[] {
  return (t.codes || []).filter((c) => t.first?.[c]).map((c) => { const f = t.first![c]; return { code: c, text: `${f.busy ? "(" : ""}${f.who}${f.rank ? "" : " 밖"}${f.busy ? ")" : ""}`, tone: f.busy || !f.rank ? "dim" : "ok" as Tone }; });
}
/** 맡은 일 칸 — 「#-024 제목」 줄들(없으면 빈 목록). */
export const openText = (r: BotRow): string[] => (r.open || []).map((o) => `${o.no}${o.title ? " " + o.title : ""}`);
