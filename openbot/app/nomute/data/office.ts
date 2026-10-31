// 우리 사무실 서버(/api/office/*) 읽기·쓰기 + 원본 앱 꼴로 바꾸기 — 화면 문(Cloudflare Access 쿠키) 그대로
/** 받는 이 기억 칸(평의회 2 ⑧ · 서버 _meetfix.js memoryOf) = 백지(웹훅 깸마다 새 회차) | 이어짐 | nowake(바로 깸 길 없음) | 모름 */
export type Memory = "백지" | "이어짐" | "nowake" | "모름";
export type OfficePerson = { who: string; name?: string; role?: string; kind: "human" | "winter" | "bot"; face?: string; bot?: string; slug?: string; mark?: string; aka?: string[]; memory?: Memory; intro?: string; cls?: string; bubble?: string };   // intro = 자기소개(본인이 채움 · 프로필 카드)
/** 방 카드(⑨ · GET rooms/<방>/card) — 열린 부름(open) · 형 원문(hyung) · 결정 표지(decide) · 10줄 */
export type CardLine = { kind: "open" | "hyung" | "decide"; id: string; from?: string; to?: string; text: string };
export type RoomCard = { room: string; lines: CardLine[]; open_n: number };
/** 계기판(⑩ · GET metrics?day=YYYYMMDD) — 받는 이 기억 종류별 셈 + 비율(%) · 부름 넘침(봇 → 넘친 수) */
export type MeterRow = { posts?: number; src?: number; relay_nosrc?: number; asks_back?: number; answered_calls?: number; wakes?: number;
  헛깸률: number | null; 형말출처율: number | null; 바꿔전하기율: number | null; 되묻기율: number | null };
export type Meter = { day: string; by: Record<string, MeterRow>; calls_over: Record<string, number> };
export type OfficeMsg = {
  id: string; room: string; ts: number; at?: string; who: string; kind: "human" | "winter" | "bot" | "system"; text: string;
  mention?: string[]; urgent?: string[]; reply_to?: string; origin?: string; state?: "suggest" | "decide" | "verified"; files?: string[]; caption?: string; seq?: Record<string, number>;
};
export type OfficeRoom = {
  id: string; name: string; kind: "group" | "dm"; color?: string; with?: string; members?: string[]; designated?: boolean; heard?: string[]; temp?: boolean; purpose?: string; exp?: number; last_ts?: number;
  last?: { who: string; kind: string; text: string; ts: number } | null; last_talk?: { who: string; kind: string; text: string; ts: number } | null;
  states?: Record<string, number>; faces?: string[];   // faces = 가장 최근 말한 이 · 그 전에 말한 이(서버 · 형 글·시스템 줄 빼고)
};

export const HYUNG_ID = "hyung";
export const WINTER_ID = "winter";

export async function office<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/office/${path}`, { credentials: "same-origin", cache: "no-store", ...init, headers: { ...(init.body ? { "content-type": "application/json" } : {}), ...(init.headers || {}) } });
  const j = (await res.json().catch(() => ({}))) as T & { ok?: boolean; why?: string; error?: string };
  if (!res.ok || j.ok === false) throw new Error(j.why || j.error || `사무실 서버 ${res.status}`);
  return j;
}

let peopleP: Promise<OfficePerson[]> | null = null;
let peopleNow: OfficePerson[] = [];
/** 명부(사람표) — 한 번 받아 두고 같이 씀(얼굴·이름 · 1분마다 새로) */
export function people(fresh = false): Promise<OfficePerson[]> {
  if (!peopleP || fresh) {
    peopleP = office<{ people: OfficePerson[] }>("people").then((j) => (peopleNow = j.people || []));
    setTimeout(() => { peopleP = null; }, 60_000);
  }
  return peopleP;
}
export const peopleSync = () => peopleNow;

/** 화자(who) → 앱 안 id(주소·부름에 쓰는 짧은 영문) */
export function idOf(who: string, list: OfficePerson[] = peopleNow): string {
  if (who === "형") return HYUNG_ID;
  const p = list.find((x) => x.who === who);
  if (!p) return who;
  if (p.kind === "winter") return WINTER_ID;
  return p.bot || p.slug || p.who;
}
export function personOf(id: string, list: OfficePerson[] = peopleNow): OfficePerson | undefined {
  if (id === HYUNG_ID) return list.find((x) => x.who === "형");
  return list.find((x) => idOf(x.who, list) === id || x.who === id);
}
export const nameOf = (id: string) => { const p = personOf(id); return p ? p.name || p.who : id; };
export const faceOf = (id: string) => personOf(id)?.face || "";

const iso = (ts?: number | null) => (ts ? new Date(ts).toISOString() : null);

/** 원본 AgentProfile 꼴 — 봇·윈터만(형 = 사람) */
export function toAgent(p: OfficePerson, list: OfficePerson[]) {
  const id = idOf(p.who, list);
  return {
    id, name: p.name || p.who, title: p.role || "", roleDescription: p.role || "", avatarSeed: id, visibility: "private",
    endpoint: null, builtIn: false, hasAuth: false, hasCallbackToken: false, hidden: false, pinned: false, systemOwned: false, canManage: false, mine: true,
  };
}

/** 방에 든 봇 id(1:1 = 그 봇 · 단체 = 지정 멤버 · 회의실 = 봇 전부) */
export function roomAgentIds(r: OfficeRoom, list: OfficePerson[]): string[] {
  if (r.with) return r.with === "형" ? [] : [idOf(r.with, list)];
  const names = r.members ? r.members : list.filter((p) => p.kind === "bot").map((p) => p.who);   // 빈 목록 = 아무도 없음(회의실 멤버 0 · 지정방 형만)
  return names.map((n) => idOf(n, list));
}

/** 원본 ChannelSummary 꼴 */
export function toChannel(r: OfficeRoom, list: OfficePerson[], seenTs?: number) {
  const last = r.last_talk !== undefined ? r.last_talk : r.last;
  return {
    id: r.id, name: r.name, agentIds: roomAgentIds(r, list), threadId: r.id, active: true,
    lastMessageAt: iso(r.last_ts), summary: null, lastMessage: last ? last.text : null,
    lastMessageAgentId: last && last.kind !== "human" ? idOf(last.who, list) : null,
    createdAt: iso(r.last_ts) || new Date(0).toISOString(), pinned: false, lastReadAt: seenTs ? new Date(seenTs).toISOString() : null,
  };
}
