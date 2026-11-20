// 공지 칸 둘(「공지」 · 「그록봇 공지」)의 셈(순수 · 시험 tests/notice-box.test.ts) — 화면 = ./notice-box.tsx
//   형 11-17 06:56 dm-bom(봄 옮김 · 글자 그대로) 「그거로하고 너네 둘다 설정칸 외부에서 판이랑 변경 일자를 카운트 관리할게 이력관리느낌으로 땡큐! 둘다 그 말 빼서 반영해줘 감사.
//     지금은 고치기 인데 연 다음, 상단에 바로 수정 버튼 누르면 고침 상태로 전환되고 맨 아래에 닫기랑 저장이 같이 있고. 저장 누르면 부드럽게 닫히고 백단에서 처리하면 됨」
//   → 06:57 「이건 중요하니까 백단에서 처리말고 게이지 알약 체크 저장됨 까지 가자」(저장 = 알약 게이지 → 체크 → 「저장됨」 → 닫힘)
//   서버 문(editor functions/api/office): 공지 = GET/POST noticeset {notice:{ver,text,at,by}, history[], can_edit} · 그록봇 공지 = GET/POST grok-note {text, at, by, ver, seed, can_edit} · 보낼 몸 {text, base: ver}
export type NoteKind = "notice" | "grok";
export type NoteHist = { ver: number; at: number; by: string };
export type Note = { ver: number; text: string; at: number; by: string; can_edit: boolean; history: NoteHist[]; limit: number };   // limit = 바이트 한계(서버 칸 · 없으면 0 = 셈만 보임 · 형 11-20 19:31 「거기에 각각 지침에 바이트 수 한계를 넣어주면 될 것 같아」)
export const NOTE_PATH: Record<NoteKind, string> = { notice: "noticeset", grok: "grok-note" };
export const NOTE_NAME: Record<NoteKind, string> = { notice: "기본판", grok: "그록봇판" };   // 공지판 한 설정 안 두 칸(형 11-20 19:31 dm-gik 깃 옮김 「불편하더라도 내가 두번볼께. 기본판, 그록봇판 두개로 공간 만들어주라 / 공지판 으로 하나 설정 넣어서.」 · 앞 이름 = 공지 · 그록봇 공지)
export const NOTE_KINDS: NoteKind[] = ["notice", "grok"];
export const NOTE_MAX = 20000;

const ms = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && Number.isFinite(Date.parse(v)) ? Date.parse(v) : 0);
const int = (v: unknown): number => (typeof v === "number" && Number.isInteger(v) && v > 0 ? v : 0);
/** 서버 답 두 꼴 → 한 꼴(공지는 notice 안에 · 그록봇 공지는 맨 위에 · 판 · 날짜가 없으면 0). 글이 없는 답 = null. */
export function readNote(j: unknown): Note | null {
  const o = (j && typeof j === "object" ? j : {}) as Record<string, unknown>, n = (o.notice && typeof o.notice === "object" ? o.notice : o) as Record<string, unknown>;
  if (typeof n.text !== "string") return null;
  const history = (Array.isArray(o.history) ? o.history : []).map((h) => { const x = (h || {}) as Record<string, unknown>; return { ver: int(x.ver), at: ms(x.at), by: String(x.by || "") }; }).filter((h) => h.ver);
  const lim = [o.limit_bytes, n.limit_bytes, o.max_bytes, n.max_bytes, o.limit].map(int).find(Boolean) || 0;   // 서버 칸 이름이 정해지기 전 = 몇 꼴 다 받음(카리나 서버 판)
  return { ver: int(n.ver), text: n.text, at: ms(n.at) || ms(n.ts), by: String(n.by || ""), can_edit: o.can_edit === true, history, limit: lim };
}
/** 날짜(한국 시각) 「11-17」. */
export function dayKo(at: number): string { if (!at) return ""; const d = new Date(at + 9 * 3600e3), t = (x: number) => String(x).padStart(2, "0"); return `${t(d.getUTCMonth() + 1)}-${t(d.getUTCDate())}`; }
/** 칸 밖(닫힌 줄 오른쪽) 한 마디 — 「판 24 · 11-17」 · 판이 없으면 날짜만 · 둘 다 없으면 빈 글. */
export const metaKo = (n?: Pick<Note, "ver" | "at"> | null): string => (n ? [n.ver ? `판 ${n.ver}` : "", dayKo(n.at)].filter(Boolean).join(" · ") : "");
/** 지난 판 한 줄(지금 판 뺌 · 새 것부터 · 넷까지) — 「23 · 11-16 · 형」. */
export const histKo = (n: Note): string[] => n.history.filter((h) => h.ver !== n.ver).sort((a, b) => b.ver - a.ver).slice(0, 4).map((h) => [h.ver, dayKo(h.at), h.by].filter(Boolean).join(" · "));
/** 보낼 몸 — 글 + 내가 읽은 판(있을 때만 · 서버가 그 사이 바뀌었으면 거절). */
export const saveBody = (text: string, n: Pick<Note, "ver">): { text: string; base?: number } => ({ text, ...(n.ver ? { base: n.ver } : {}) });
/** 바이트(UTF-8 · 한글 3 · 영문 1) — 지침이 실릴 때 세는 단위 */
export const bytesOf = (s: string): number => new TextEncoder().encode(s).length;
/** 칸 밑 셈 한 줄 — 「3,812 / 8,000 바이트」 · 한계 없음 = 「3,812 바이트」 */
export const bytesKo = (b: number, limit: number): string => `${b.toLocaleString("en-US")}${limit ? ` / ${limit.toLocaleString("en-US")}` : ""} 바이트`;
/** 저장할 수 있나 — 바뀌었고 · 비지 않았고 · 길이 안 · 바이트 한계 안(서버가 한계를 주면). */
export const canSave = (draft: string, n: Pick<Note, "text"> & Partial<Pick<Note, "limit">>): boolean => draft !== n.text && draft.trim().length > 0 && draft.length <= NOTE_MAX && !(n.limit && bytesOf(draft) > n.limit);
/** 저장 실패 한마디 — 그 사이 다른 데서 바뀜(base 어긋남)은 따로. */
export const failKo = (m: string): string => (/changed|base|conflict|409/i.test(m) ? "다른 데서 바뀌었어 — 새 판을 읽었으니 다시 봐 줘" : m || "저장 못 했어");
