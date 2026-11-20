// 우리 사무실 서버(/api/office/*) 읽기·쓰기 + 원본 앱 꼴로 바꾸기 — 화면 문(Cloudflare Access 쿠키) 그대로
/** 받는 이 기억 칸(평의회 2 ⑧ · 서버 _meetfix.js memoryOf) = 백지(웹훅 깸마다 새 회차) | 이어짐 | nowake(바로 깸 길 없음) | 모름 */
export type Memory = "백지" | "이어짐" | "nowake" | "모름";
export type OfficePerson = { pm?: boolean; nocard?: boolean; empty?: boolean; who: string; name?: string; role?: string; kind: "human" | "winter" | "bot"; face?: string; bot?: string; slug?: string; mark?: string; aka?: string[]; memory?: Memory; intro?: string; cls?: string; shelf?: string; root?: string; bubble?: string; gone?: boolean; screen?: string; grok_url?: string; job?: string };   // grok_url = 그록 애 컴퓨터(grok.com/bot/<id> · 서버 명부 · 깃 93d9ffa8 · screen 과 같이 형 자리에만 실림 · 번개 11-16 22:42)   // intro = 자기소개(본인이 채움 · 프로필 카드)   // screen = 그 아이 몸 화면(noVNC · 테일넷 안 주소 · 서버가 형 요청에만 실음 · 빠르 · 형 11-08 「프로필 누르면 본인의 vm이 배선되도록」)   // gone = 없어진 봇(서버 _conf · 별 · 형 11-05 「별은 아예 빼」) = 초대·멤버 후보에서 뺌 · 옛 글 이름·얼굴은 남김(빠르 11-08)
/** 방 카드(⑨ · GET rooms/<방>/card) — 열린 부름(open) · 형 원문(hyung) · 결정 표지(decide) · 10줄 */
export type CardLine = { kind: "open" | "hyung" | "decide"; id: string; from?: string; to?: string; text: string };
export type RoomCard = { room: string; lines: CardLine[]; open_n: number };
/** 계기판(⑩ · GET metrics?day=YYYYMMDD) — 받는 이 기억 종류별 셈 + 비율(%) · 부름 넘침(봇 → 넘친 수) */
export type MeterRow = { posts?: number; src?: number; relay_nosrc?: number; asks_back?: number; answered_calls?: number; wakes?: number;
  헛깸률: number | null; 형말출처율: number | null; 바꿔전하기율: number | null; 되묻기율: number | null };
export type Meter = { day: string; by: Record<string, MeterRow>; calls_over: Record<string, number> };
export type OfficeMsg = {
  id: string; room: string; ts: number; at?: string; who: string; kind: "human" | "winter" | "bot" | "system" | "sent"; text: string;
  pair?: string;   // kind sent = 그 둘의 방 id(뜸 #2331 · 누르면 읽기만으로 엶)
  route?: { state?: "pending" | "set"; to?: string[]; why?: string };   // 형 단체방 글 = 서버가 고른 담당(형 11-04 11:15 「누가 담당인지 파악중일때는 서버가 배분중입니다 뜨면 좋을듯. 그리고 누가 딱 선택된걸 픽스해주면 좋을듯. 그리고 애매하면 복수여도 돼.」 · 뜸 서버)
  to?: string;   // kind sent = who 가 봇 둘의 방으로 to 에게 보낸 흔적(내용 0 · 서버 뜸 · 형 11-03 17:52 「이런식으로 가려달라고했는데」)
  event?: { kind?: "left" | "back" | "invite" | "close" | string; who?: string | string[]; by?: string };   // 방 드나듦 줄(봄 서버 · 형 11-06 「00가 나갔습니다는 뜨게해줘」) = 가운데 흐린 글 한 줄
  closed?: boolean;   // 「/방파기」 답 = 방 닫힘(봄 서버 · 형 11-06 「목적 달성해서 나가게 되는거야」)
  mention?: string[]; urgent?: string[]; reply_to?: string; origin?: string; state?: "suggest" | "decide" | "verified"; files?: string[]; caption?: string; call_out?: string[]; call_unknown?: string[]; seq?: Record<string, number>;
};
export type OfficeRoom = {
  id: string; name: string; base?: string; kind: "group" | "dm"; color?: string; with?: string; members?: string[]; designated?: boolean; heard?: string[]; temp?: boolean; purpose?: string; exp?: number; from?: string; spawned?: boolean; last_ts?: number; act_ts?: number;
  left?: string[]; count?: number;   // left = 「!종료」로 나간 이(형이 나갔으면 「형」도) · count = 남은 사람 수(명단 − 나간 이 + 형 · 서버 셈 · 지정방 · 임시방만 옴) — 형 11-18 20:12 dm-gik 「나 포함 남은 사람만 세야해 … 깃이 나가면 2인거임」
  max?: number; task?: string; idle_min?: number; task_exp?: number;   // max = 멤버 최대 수(깃 · 없음 = 제한 없음 · 형은 안 셈) · task = 지금 일 · idle_min = 조용하면 일이 끝나는 분(켜져 있을 때만 옴) · task_exp = 끝나는 때(서버가 줄 때만) — 빠르 #4080 · 형 11-17 00:47 · 00:49
  last?: { who: string; kind: string; text: string; ts: number } | null; last_talk?: { who: string; kind: string; text: string; ts: number } | null;
  heard_ts?: number;   // 그 방에서 형한테 마지막으로 말한 때(서버 · 방 목록 차례 열쇠 · 형 11-19 13:27 「나한테 최근에 말을 한 사람이 위로」 · 없으면 화면이 갈음)
  look?: { icon?: string; fg?: string };   // 방 꾸미기(번개 서버 roomlook · 형만 · 아이콘 = Lucide 이름 · fg = #RRGGBB 또는 두 색)
  states?: Record<string, number>; faces?: string[];   // faces = 가장 최근 말한 이 · 그 전에 말한 이(서버 · 형 글·시스템 줄 빼고)
};

export const HYUNG_ID = "hyung";
export const WINTER_ID = "winter";

/** 쓰기(글 보내기 등 · 몸이 작은 글자)는 keepalive — 보내는 도중 화면이 다시 읽혀도(형이 새로고침 · 옛 판 저절로) 서버까지 감(형 11-02 07:20 「내 ㅁㅔ세지는 정확히 가고」) · 브라우저 keepalive 몸 한도 64KB 라 60KB 아래만 */
const keep = (init: RequestInit) => typeof init.body === "string" && init.body.length < 60_000 && !!init.method && init.method.toUpperCase() !== "GET";

export async function office<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/office/${path}`, { credentials: "same-origin", cache: "no-store", ...(keep(init) ? { keepalive: true } : {}), ...init, headers: { ...(init.body ? { "content-type": "application/json" } : {}), ...(init.headers || {}) } });
  const j = (await res.json().catch(() => ({}))) as T & { ok?: boolean; why?: string; error?: string };
  if (!res.ok || j.ok === false) throw new Error(j.why || j.error || `봄의 정원 서버 ${res.status}`);
  return keepOnly(path, j);
}

/** 사무실 정리 = 일곱 + 형만(형 11-09 「사무실에 있는 빠르 번개 뎅 뜸 깃 시아 봄 말고 자리 다 없애.」 · 105) — 이제 서버가 처음부터 거름(editor _listkeep.js · R2 office/listkeep.json) ·
 *   앱은 받은 그대로(봄 14:50 형 「깔끔했으면 좋겠어 내가 보는 눈이랑 싱크가」 = 앱·봇이 한 글자도 안 다르게 · 앞 판 = 앱 거름 7bfca76) */
export function keepOnly<T>(_path: string, j: T): T { return j; }

let peopleP: Promise<OfficePerson[]> | null = null;
let peopleNow: OfficePerson[] = [];
/** 명부(사람표) — 한 번 받아 두고 같이 씀(얼굴·이름 · 1분마다 새로) */
/** 기계 화자 얼굴(사람표 밖 · 앱에서만) — 촉 방 묶음 카드를 올리는 러너 = 「촉봇」 + 뜸이 만든 러너 파비콘 움짤(형 11-14 05:13 봄 옮김 「러너 파비콘 만든거 영상으로 만든거 하나 뜸에게 받아서 러너한테 이름을 촉봇 이라고 붙여주고」 · 「얘 이름하고 사진 글케 나오게해주셈」 · 뎅)
 *  gone = 「@」 명부 · 목록엔 안 뜸(부를 수 있는 이가 아님) · 얼굴 · 이름만 */
export const MACHINE_FACES: OfficePerson[] = [
  { who: "촉봇", name: "뉴스 알림", kind: "system", face: "/garden-app/chokbot.webp", gone: true },   // 화면 이름 = 뉴스 알림(형 11-16 18:07 dm-bom 「봇 촉봇 > 뉴스 알림」 · 기차봇 → 작업 알림 때 꼴 · who 「촉봇」 = 묶음 카드 화자 열쇠라 그대로 · pick-msg.ts)
  // 보안 서랍 자리(서버 명부에서 빠짐 = 빠르 11-16 02:58 · 형 02:47 「보안 서랍에 있는 친구들은 대화방이나 초대 등에서 안보여야 함」) — 글은 계속 쓰니 얼굴 · 이름만 여기서(형 11-16 07:54 dm-eyes 「작업알림이. 갱신되면서 프로필 로고가 빠졌더라. ‘작’으로 뜨는데 확인해줘.」 · 뜸)
  { who: "작업 알림", name: "작업 알림", kind: "system", face: "/office/work-alert.webp", gone: true },
  { who: "구름", name: "구름", kind: "system", face: "/office/gureum.webp", gone: true },
  // 예비 손님 셋 = 새싹 화분 얼굴(형 11-20 11:08 dm-sia 시아 옮김 「그리고 예비 애들 프로필 카드 하나씩 해줘」 · 그림 = 시아 · 카드 = ./ui/being-card spare01~03 · 하늘)
  { who: "예비01", name: "예비 1", kind: "bot", face: "/garden-app/spare-01.webp?v=1", gone: true },
  { who: "예비06", name: "예비 2", kind: "bot", face: "/garden-app/spare-02.webp?v=1", gone: true },
  { who: "예비07", name: "예비 3", kind: "bot", face: "/garden-app/spare-03.webp?v=1", gone: true },
] as unknown as OfficePerson[];

export function people(fresh = false): Promise<OfficePerson[]> {
  if (!peopleP || fresh) {
    // 예비 손님 이름 = 그 손님 1:1 방 이름(손님 「/이름 새 이름」 = 서버가 방 이름 · guestname 장에 같이 적음 · 천둥 #4483 · 형 11-20 12:14 시아 옮김 「예비 들은 방 이름을 임의로 /이름 으로 방 이름 및 이름 지정 가능하게ㅡ해줘」)
    //   = 말풍선 이름표 · 프로필 카드 · 목록 이름이 그 새 이름으로(빈 이름 = 서버가 「예비 N」 그대로) · 방 목록은 명부와 같은 1분에 한 번
    peopleP = Promise.all([office<{ people: OfficePerson[] }>("people"), office<{ rooms?: { with?: string; guest?: boolean; name?: string }[] }>("rooms").catch(() => ({ rooms: [] }))]).then(([j, r]) => {
      const guest = new Map((r.rooms || []).filter((x) => x.guest && x.with && x.name).map((x) => [x.with as string, x.name as string]));
      return (peopleNow = [...(j.people || []), ...MACHINE_FACES.filter((x) => !(j.people || []).some((y) => y.who === x.who)).map((x) => (guest.has(x.who) ? { ...x, name: guest.get(x.who) } : x))]);
    });
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

/** 방 사람 수 — 방 안 머리 · 대화 목록 · 방 정보가 이 셈 하나를 씀(형 11-16 19:42 dm-bom 「단톡방 안에서는 5라고 뜨는데 외부에선 4라고 떠.」 · 앞 = 머리만 형을 셈)
 *  서버가 남은 사람 수(count = 명단 − 나간 이 + 형)를 주면 그 숫자(형 11-18 20:12 dm-gik 「나 포함 남은 사람만 세야해. 예를들어, 봄, 깃, 나 이렇게 있는데, 깃이 나가면 2인거임.그다음에 봄 나가면 1, 나도 나가면 해체」)
 *  · 안 주면 옛 셈(든 봇 + 형 1) · 수를 안 내는 방(1:1 · 수리 접수 · 메모 · 요약실) · 아무도 없는 방 = 0 */
export function roomHeadCount(r: OfficeRoom, list: OfficePerson[]): number {
  if (r.with || r.id === "repair" || r.id === "memo" || r.id === "summary") return 0;
  if (typeof r.count === "number" && Number.isFinite(r.count)) return Math.max(0, Math.floor(r.count));
  const n = roomAgentIds(r, list).length;
  return n ? n + 1 : 0;
}
/** 그 방에서 나간 이름(서버 left) · 형이 나갔나 — 방 머리 명단 · 방 개요가 남은 사람과 나간 사람을 가름 */
export const roomLeftSet = (r: OfficeRoom): Set<string> => new Set(r.left || []);
export const hyungLeft = (r: OfficeRoom): boolean => (r.left || []).includes("형");

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

/** 빈 자리 1 · 2 · 3(명부 empty · LLM 없는 작업 알림 포함) = 사람 고르는 칸 · 멤버 칸에 안 보임(형 11-14 23:40 · 깃 #-016 덧 · 뜸) */
export const seatOff = (p?: { empty?: boolean } | null) => !!p?.empty;
