// 서랍 「봇 현황」(./bot-desk.tsx)의 칸 글 — 서버 도표(editor functions/api/office/_botsheet.js sheetTable · GET status/bots 의 table)를 읽기만 함
//   판정 · 차례 셈은 서버 것 하나(PM 이 read room=bots 로 읽는 표와 같은 재료) · 여기선 칸 글과 색 갈래만
export type Turn = { n?: number; rank?: number; busy?: boolean; x?: string };
export type Lane = "lost" | "ready" | "work" | "rest" | "off" | "none";
export type BotRow = {
  who: string; brain?: string; lane: Lane; state: string; cause?: string; why?: string;
  last_at?: number; beat_at?: number; door_at?: number; ctx_pct?: number; work_min?: number; acct?: string; acct_left?: number;
  turn_at?: number | null;   // 이번 턴 시작(ms · 쉬면 null · 번개 서버 칸 · 시아 11-21 07:47) → 일감 시간 줄 「지금 N분째」
  work_24h_min?: number;   // 최근 24시간 누적 분(번개 서버 칸 · 11-21 08:02) → sumMin
  skills?: string[]; hw?: { ram?: string; cpu?: string; gpu?: string; os?: string }; note?: string; turn?: Record<string, Turn>;
  open?: { no: string; title?: string; code?: string; at?: number }[]; today?: number; pm?: boolean; rest?: boolean;   // 맡은 오더(받고 안 끝낸 것) · 오늘 받은 수 · PM 자리 · 쉼 지정
  jobs?: Job[];   // 오늘 오더 줄(안 끝낸 것 먼저 + 오늘 끝낸 것 · 서버 오더 장)
  trail?: { at?: number; text: string }[];   // 작업 줄(몸 보고가 창 원문 끝에서 뽑은 것 · editor #3953 · 없으면 칸 없음) — 일감 카드 펼침(./bot-inbox-logic.ts)
};
export type Job = { no: string; title?: string; code?: string; recv?: number; done?: number; ride?: number; sha?: string };   // ride = 태움 글을 올린 때(회의실 글에서 서버가 읽음 · 봇이 따로 남기는 것 0) · sha = 그 커밋
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

// ── 흐름 그림(폰에서 보기 쉽게 · 형 11-15 05:3x 사진 + 본보기 영상 셋 = 카드와 이음선 · 차례로 그려지는 흐름도 · 알약 탭) ──
export type Group = "lost" | "work" | "idle" | "held" | "quiet";
export const GROUP_KO: Record<Group, string> = { lost: "연결 끊김", work: "작업 중", idle: "쉬는 중", held: "차례 밖", quiet: "조용" };   // 낱말 = 형 11-16 19:5x 구름 맥 창 「노는 손 은 용어 변경 / 쉬는 중」 · 「일하는 중 용어 변경 작업 중」 · 「연결 끊김은 별개로 표기되어야 함」(앞 = 멈춤 · 일하는 중 · 노는 손)
export const GROUPS: Group[] = ["lost", "work", "idle", "held", "quiet"];
/** 흐름 묶음 — 멈춤 · 일하는 중 · 노는 손(쉬는데 맡은 일 없음) · 차례 밖(PM · 쉼 지정) · 조용(하루 넘게 · 줄 없음). 맡은 일이 있으면 쉬어 보여도 「일하는 중」 쪽(형 「누가 놀고잇나」). */
export function groupOf(r: BotRow): Group {
  if (r.lane === "lost") return "lost";
  if (r.pm || r.rest) return "held";
  if (r.lane === "off" || r.lane === "none") return "quiet";
  if (r.lane === "work" || (r.open && r.open.length)) return "work";
  return "idle";
}
// ── 직무 표기(형 11-16 18:4x 구름 맥 창 「저기에서 보이는 직무 표기 알려줄게 / Developer 천둥 번개 빠르 소나 / UX Design 구름 시아 / PM · Dev. 깃 / PM · UXD. 봄」 · 「너가 한전 보고 판단해봐 dev uxd」) ──
//   특기 코드(서버 손 표 _roles.js SKILLS) → 영문 직함 · 1특기가 관리 배분(M)이면 「PM · <2특기 줄임>」 · 그 밖 = 1특기 하나
//   형이 준 것 = D Developer(줄임 Dev.) · U UX Design(줄임 UXD.) · M PM / 나머지는 같은 결로 내가 정함 = R Research(R&D) · S Fixer · Xb Musician(형 「결 musician」) · Xc Storyteller(형 「뎅 결 윈터는 Storyteller」) · Xa 는 형이 정함 = Creator · Xd = Scoop Hunt.(슈왕 · 형 18:5x 구름 맥 창 「촉 이 아니라 이제 슈왕 / Scoop Hunter」 → 19:0x 「슈왕 Scoop Hunt.」)
const ROLE_LONG: Record<string, string> = { M: "PM", D: "Developer", O: "Operations", U: "UX Design", R: "Research", S: "Fixer", X: "Special", Xa: "Creator", Xb: "Musician", Xc: "Storyteller", Xd: "Scoop Hunt", Xe: "Secretary" };   // Xe = Secretary(형 11-19 「온은 secretary」 · 서버 SKILLS 「Secretary · 비서」 한글이 펼침에 새던 것 = 11-20 형 「누구는 한글로 비서」)   // Xa(사진·영상 제작) = Creator(형 11-16 18:5x 「뜸은 creator」 · 앞 = Media)
const ROLE_SHORT: Record<string, string> = { ...ROLE_LONG, D: "Dev.", O: "Ops.", U: "UXD.", R: "R&D" };   // O = Ops(다지기 · 시험 · 배포 · 운영 · 형 11-19 09:50 dm-bom 「옵스 데브 다 표현해줘」 · 서버 손 표 _roles.js SKILLS O · 봄 옮김)
/** 코드 하나 → 직함(short = 줄임) · 모르는 코드 = "" */
export const roleOf = (code: string | undefined, short = false): string => (code ? (short ? ROLE_SHORT : ROLE_LONG)[code] || "" : "");
/** 사람마다 따로 정한 직함(특기 코드보다 먼저) — 온 = Secretary(형 비서 · PM 11-16 18:52 옮김 = 「Fixer 아님」) */
const ROLE_WHO: Record<string, string> = { 온: "Secretary", 결: "Storyteller", 소나: "Fixer" };   // 소나 = Fixer 로만(형 11-16 21:06 구름 맥 창 「소나는 Fixer 로만」 · 앞 = Fixer · Dev.)   // 소나 = Fixer · Dev.(형 11-16 19:0x 「소나 Fixer · Dev」 · 줄임 점은 「PM · Dev.」와 같은 꼴로 붙임)   // 결 = Storyteller(형 11-16 18:5x 「뎅 결 윈터는 Storyteller」 · 바로 앞 말 「결 musician」 뒤에 온 말을 따름 · 작곡 갈래 Xb 의 이름 Musician 은 표에 남김) · 뎅 · 윈터 = 글짓기 갈래 Xc = Storyteller
/** 손 하나의 직함 한 줄 — 「Developer」 · 「UX Design」 · 「PM · Dev.」 · 「PM · UXD.」 … · 특기 없음 = "" · who 를 주면 사람마다 정한 직함 먼저 */
/** 특기 이름 한 곳(11-20 형 dm-gik 03:50~51 「그리구 애들 1특 2특 3특 용어 통일이 안되있다.」 「누구는 오퍼레이션 누구는 한글로 비서」 「누구는 직무 4개」 「누구는 스토리 탤러랫는데 누르니 뮤지션」 「등등 다 맞춰줘 참조하게 해야해」 · 깃 옮김)
 *  = 얼굴 밑 직함 · 펼침 칩 · 일 차례 표 · 관리 칸이 다 여기만 봄 · 영문 한 꼴(한글 설명은 풍선) · 사람마다 정한 직함(ROLE_WHO)은 그 사람 1특기 이름으로 어디서나 같게 · PM(M) = 직함 앞 「PM ·」 하나로만(칩엔 안 셈 = 특기 칩은 셋까지) */
export const workSkills = (skills?: string[]): string[] => (skills || []).filter((c) => c !== "M").slice(0, 3);
export function skillName(code: string, r?: { who?: string; skills?: string[] }, short = false): string {
  if (r?.who && ROLE_WHO[r.who] && code === workSkills(r.skills)[0]) return ROLE_WHO[r.who];   // 결 = 칸도 칩도 Storyteller · 온 = Secretary
  return roleOf(code, short) || code;
}
export function roleLabel(skills?: string[], who?: string): string {
  if (who && ROLE_WHO[who]) return ROLE_WHO[who];
  const a = skills?.[0], b = skills?.[1];
  if (a === "M") return roleOf(b, true) ? `PM · ${roleOf(b, true)}` : "PM";
  return roleOf(a, true);   // 줄임말이 있으면 줄임(형 11-16 21:06 「그리고 Dev. 로 줄이고 / UXD. 로 줄일게. / 비서는 줄임말 없으면 그대로 가 리서치 잇으면 줄여주고」 → Dev. · UXD. · R&D · 나머지는 그대로)
}

/** 특수 직군 = 1특기가 「특수」 갈래(X · Xa 사진·영상 제작 · Xb 작곡 · Xc 글짓기 · Xd 정보 수집 · 서버 손 표 _roles.js SKILLS) — 손 판에서 따로 묶음(형 11-16 17:5x 구름 맥 창 「아예 특수 직업군은 따로 분류되고」). */
export const isSpecial = (r: BotRow): boolean => /^X/.test(r.skills?.[0] || "");
/** 묶음마다 줄(묶음 안 차례 = 손 표 그대로). */
export function flowOf(rows: BotRow[]): { group: Group; rows: BotRow[] }[] {
  return GROUPS.map((g) => ({ group: g, rows: rows.filter((r) => groupOf(r) === g) })).filter((x) => x.rows.length);
}
/** 분류 하나의 차례 줄 — 서버 turn 칸을 차례대로: [{who, n, rank, busy}] + 못 맡는 손 [{who, why}]. */
export function turnList(rows: BotRow[], code: string): { order: { who: string; n: number; rank: number; busy: boolean }[]; out: { who: string; why: string }[] } {
  const order: { who: string; n: number; rank: number; busy: boolean }[] = [], out: { who: string; why: string }[] = [];
  for (const r of rows) { const t = r.turn?.[code]; if (!t) continue; if (t.x) out.push({ who: r.who, why: t.x }); else if (t.n) order.push({ who: r.who, n: t.n, rank: t.rank || 0, busy: !!t.busy }); }
  return { order: order.sort((a, b) => a.n - b.n), out };
}
/** 이음선 색 갈래 — 멈춤 = 빨강 · 일하는 중 = 라임 · 그 밖 = 흐림. */
export const wireTone = (g: Group): Tone => (g === "lost" ? "lost" : g === "work" ? "ok" : "dim");
/** 상태 표시(react-bits StatusMark)의 꼴 — 일하는 중 = 도는 고리 · 받을 수 있음 = 체크 · 쉼 = 점선 고리 · 멈춤 = 가위표 · 차례 밖 · 조용 = 그은 고리. */
/** 카드 머리 글 — 서버 글 그대로 · 다만 상태 줄이 없는 자리(lane none · 서버 글 「줄 없음」)는 손 판과 같이 「쉬는 중」(연결 끊김은 따로 = 부름이 실패했을 때만). */
export const stateWord = (r: BotRow): string => (r.lane === "none" && !r.pm && !r.rest ? "쉬는 중" : r.state);
export function markOf(r: BotRow): "pending" | "running" | "done" | "failed" | "cancelled" {
  if (r.lane === "lost") return "failed";
  if (r.pm || r.rest || r.lane === "off") return "cancelled";
  if (r.lane === "none") return "pending";   // 상태 줄을 안 올리는 자리(윈터 창 등) = 쉬는 중으로 봄(손 판 칸과 같은 셈 · 형 11-17 07:55 「윈터도 깻으니 쉬는 중이여야 되고」)
  return r.lane === "work" ? "running" : r.lane === "ready" ? "done" : "pending";
}

// ── 오늘 오더 카드(형 11-15 본보기 영상 「Tasks」 = 줄마다 도는 표시 → 체크 + 취소선 · 머리에 n/m · 다 끝나면 한 낱말) — 재료 = 서버 오더 장(접수 · 완료) 그대로 · 봇이 더 하는 일 0
/** 오더 줄 — 서버 jobs 칸(없으면 옛 open 칸으로 · 다 안 끝낸 것). */
export function jobsOf(r: BotRow): Job[] {
  return r.jobs && r.jobs.length ? r.jobs : (r.open || []).map((o) => ({ no: o.no, title: o.title, code: o.code, recv: o.at }));
}
const minKo = (ms: number) => { const m = Math.max(1, Math.round(ms / 60e3)); return m < 60 ? `${m}분` : `${Math.floor(m / 60)}시간 ${m % 60}분`; };
/** 오더 한 줄 → 표시 꼴(done = 체크 + 취소선 · running = 도는 고리(그 손이 일하는 중) · pending = 점선(받아 두고 쉬는 중)) + 글 + 오른쪽 작은 글(걸린 시간 · 받은 지). */
export function jobLine(j: Job, working: boolean, now: number): { status: "done" | "running" | "pending"; text: string; side: string; ride?: true } {
  const text = `${j.no}${j.title ? " " + j.title : ""}`;
  if (j.done) return { status: "done", text, side: j.recv && j.done >= j.recv ? minKo(j.done - j.recv) : "끝" };
  if (j.ride) return { status: "running", text, side: `태움 ${agoKo(now - j.ride)}`, ride: true };   // 만들기는 끝 · 기차(라이브) 기다림 = 손은 놓았어도 도는 고리
  return { status: working ? "running" : "pending", text, side: j.recv ? `${minKo(now - j.recv)}째` : "" };
}
/** 머리 셈 — 끝낸 수 / 오늘 오더 수 · all = 다 끝냄(오더가 있을 때만). */
export function jobCount(jobs: Job[]): { done: number; total: number; all: boolean } {
  const done = jobs.filter((j) => j.done).length;
  return { done, total: jobs.length, all: jobs.length > 0 && done === jobs.length };
}
/** 구슬(thinking-orbs)의 꼴 — 일하는 중 = working · 받을 수 있음 = listening(부름을 기다림) · 그 밖 = 구슬 없음(상태 표시로). */
export function orbOf(r: BotRow): "working" | "listening" | "" {
  if (r.pm || r.rest || r.lane === "lost" || r.lane === "off" || r.lane === "none") return "";
  return r.lane === "work" ? "working" : r.lane === "ready" ? "listening" : "";
}

// ── 맨 위 요약 막대(형 「누가 쉰다 이런개념이 아니라 도표 느낌으루」) — 묶음마다 몇인지 한 줄 막대로(0 인 묶음은 뺌)
export function mixOf(rows: BotRow[]): { group: Group; n: number }[] {
  return flowOf(rows).map((g) => ({ group: g.group, n: g.rows.length }));
}
/** 누적 작업(분) 셈 한 곳 — 애들 시간 줄(./bot-inbox-logic.ts timeRows) · 얼굴 카드 꼬리(tailOf)가 같이 씀
 *  형 11-21 07:54 dm-sia 시아 옮김 「24시간 직전 기준」 → 서버 work_24h_min(최근 24시간 누적 분 · 번개 editor fd400efca7 · 몸 보고 없는 손 = 칸 없음 = 「–」) · work_min(오늘 0시부터)은 안 씀 */
export const sumMin = (r: BotRow): number | undefined => (typeof r.work_24h_min === "number" && r.work_24h_min >= 0 ? Math.round(r.work_24h_min) : undefined);
/** 카드 상태 줄 꼬리 — 휴식 · 작업 · 누적 작업(짧게 · 없으면 빈 글)
 *  형 11-21 07:54 dm-sia 시아 옮김 「여기 누적도 뜨게해주고 24시간 직전 기준 손 명칭 변경 작업 대기 는 휴식 누적 작업 나오게 명칭은 누적 순서는 휴식 작업 누적 작업(시)」 「아니 (분)」
 *  = 앞 「손 N분 전 · 대기 N분 전」 → 「휴식 N분 전 · 작업 N분 전 · 누적 작업 N분」(대기 신호 = 휴식 · 마지막 손 = 작업 · 그록 「문 확인」은 그대로) */
export function tailOf(r: BotRow, now: number): string {
  const rest = r.beat_at ? `휴식 ${agoKo(now - r.beat_at)}` : r.door_at ? `문 확인 ${agoKo(now - r.door_at)}` : "", sum = sumMin(r);
  return [rest, r.last_at ? `작업 ${agoKo(now - r.last_at)}` : "", sum != null ? `누적 작업 ${sum}분` : ""].filter(Boolean).join(" · ");
}
