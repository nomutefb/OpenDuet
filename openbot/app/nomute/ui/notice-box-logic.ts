// 공지 칸 둘(「공지」 · 「그록봇 공지」)의 셈(순수 · 시험 tests/notice-box.test.ts) — 화면 = ./notice-box.tsx
//   형 11-17 06:56 dm-bom(봄 옮김 · 글자 그대로) 「그거로하고 너네 둘다 설정칸 외부에서 판이랑 변경 일자를 카운트 관리할게 이력관리느낌으로 땡큐! 둘다 그 말 빼서 반영해줘 감사.
//     지금은 고치기 인데 연 다음, 상단에 바로 수정 버튼 누르면 고침 상태로 전환되고 맨 아래에 닫기랑 저장이 같이 있고. 저장 누르면 부드럽게 닫히고 백단에서 처리하면 됨」
//   → 06:57 「이건 중요하니까 백단에서 처리말고 게이지 알약 체크 저장됨 까지 가자」(저장 = 알약 게이지 → 체크 → 「저장됨」 → 닫힘)
//   서버 문(editor functions/api/office): 공지 = GET/POST noticeset {notice:{ver,text,at,by}, history[], can_edit} · 그록봇 공지 = GET/POST grok-note {text, at, by, ver, seed, can_edit} · 보낼 몸 {text, base: ver}
export type NoteKind = "notice" | "grok";
export type NoteHist = { ver: number; at: number; by: string };
export type Note = { ver: number; text: string; at: number; by: string; can_edit: boolean; history: NoteHist[] };
export const NOTE_PATH: Record<NoteKind, string> = { notice: "noticeset", grok: "grok-note" };
export const NOTE_NAME: Record<NoteKind, string> = { notice: "공지", grok: "그록봇 공지" };
export const NOTE_MAX = 20000;

const ms = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && Number.isFinite(Date.parse(v)) ? Date.parse(v) : 0);
const int = (v: unknown): number => (typeof v === "number" && Number.isInteger(v) && v > 0 ? v : 0);
/** 서버 답 두 꼴 → 한 꼴(공지는 notice 안에 · 그록봇 공지는 맨 위에 · 판 · 날짜가 없으면 0). 글이 없는 답 = null. */
export function readNote(j: unknown): Note | null {
  const o = (j && typeof j === "object" ? j : {}) as Record<string, unknown>, n = (o.notice && typeof o.notice === "object" ? o.notice : o) as Record<string, unknown>;
  if (typeof n.text !== "string") return null;
  const history = (Array.isArray(o.history) ? o.history : []).map((h) => { const x = (h || {}) as Record<string, unknown>; return { ver: int(x.ver), at: ms(x.at), by: String(x.by || "") }; }).filter((h) => h.ver);
  return { ver: int(n.ver), text: n.text, at: ms(n.at) || ms(n.ts), by: String(n.by || ""), can_edit: o.can_edit === true, history };
}
/** 날짜(한국 시각) 「11-17」. */
export function dayKo(at: number): string { if (!at) return ""; const d = new Date(at + 9 * 3600e3), t = (x: number) => String(x).padStart(2, "0"); return `${t(d.getUTCMonth() + 1)}-${t(d.getUTCDate())}`; }
/** 칸 밖(닫힌 줄 오른쪽) 한 마디 — 「판 24 · 11-17」 · 판이 없으면 날짜만 · 둘 다 없으면 빈 글. */
export const metaKo = (n?: Pick<Note, "ver" | "at"> | null): string => (n ? [n.ver ? `판 ${n.ver}` : "", dayKo(n.at)].filter(Boolean).join(" · ") : "");
/** 지난 판 한 줄(지금 판 뺌 · 새 것부터 · 넷까지) — 「23 · 11-16 · 형」. */
export const histKo = (n: Note): string[] => n.history.filter((h) => h.ver !== n.ver).sort((a, b) => b.ver - a.ver).slice(0, 4).map((h) => [h.ver, dayKo(h.at), h.by].filter(Boolean).join(" · "));
/** 보낼 몸 — 글 + 내가 읽은 판(있을 때만 · 서버가 그 사이 바뀌었으면 거절). */
export const saveBody = (text: string, n: Pick<Note, "ver">): { text: string; base?: number } => ({ text, ...(n.ver ? { base: n.ver } : {}) });
/** 저장할 수 있나 — 바뀌었고 · 비지 않았고 · 길이 안. */
export const canSave = (draft: string, n: Pick<Note, "text">): boolean => draft !== n.text && draft.trim().length > 0 && draft.length <= NOTE_MAX;
/** 저장 실패 한마디 — 그 사이 다른 데서 바뀜(base 어긋남)은 따로. */
export const failKo = (m: string): string => (/changed|base|conflict|409/i.test(m) ? "다른 데서 바뀌었어 — 새 판을 읽었으니 다시 봐 줘" : m || "저장 못 했어");
