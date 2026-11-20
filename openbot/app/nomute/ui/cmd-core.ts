// 명령 팔레트 셈(DOM 0 = 노드 시험) — 화면 = ./cmd-palette.tsx · 키 = ./cmd-key.ts
//   형 11-17 「메뉴가 분산 … 좀 모아좌」 · 형 11-21 「바로 개선점을 적용해줄 수 있어?」(참고 = gr8rstudio/gr8r-studio 명령 팔레트 · stablyai/orca Jump Anywhere)
//   줄 = 화면(메뉴 줄과 같은 목록 · ./shell.tsx menuOf 한 곳) + 방(방 목록 캐시 · 최근 말한 차례) · 고르면 그 길로 감
//   찾기 = 이름에 든 글자(대소문자 안 가림) · 한글 첫소리만 쳐도(「ㅂㅅ」 → 밥상) · 차례 = 앞에서 맞음 → 가운데 맞음 → 첫소리 맞음

export type CmdItem = { id: string; label: string; to: string; kind: "screen" | "room"; ts?: number; icon?: string };

const CHO = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
/** 한글 글자마다 첫소리만(그 밖 글자는 그대로 · 소문자) */
export function chosung(s: string): string {
  let out = "";
  for (const ch of String(s || "")) { const c = ch.charCodeAt(0); out += c >= 0xac00 && c <= 0xd7a3 ? CHO[Math.floor((c - 0xac00) / 588)] : ch.toLowerCase(); }
  return out;
}
const onlyCho = (q: string) => /^[ㄱ-ㅎ\s]+$/.test(q);
const squash = (s: string) => String(s || "").toLowerCase().replace(/\s+/g, "");

/** 맞는 정도 — 0 = 앞에서 맞음 · 1 = 가운데 · 2 = 첫소리 앞 · 3 = 첫소리 가운데 · -1 = 안 맞음 · 빈 물음 = 0 */
export function rank(label: string, q: string): number {
  const n = squash(q); if (!n) return 0;
  const l = squash(label), i = l.indexOf(n);
  if (i === 0) return 0;
  if (i > 0) return 1;
  if (onlyCho(n)) { const j = squash(chosung(label)).indexOf(n); if (j === 0) return 2; if (j > 0) return 3; }
  return -1;
}

/** 거르고 차례 — 맞는 정도 → (물음이 비면 화면 먼저 · 있으면 섞음) → 방은 최근 말한 차례 · 화면은 메뉴 차례(받은 차례) */
export function pickItems(items: CmdItem[], q: string, max = 40): CmdItem[] {
  const empty = !squash(q);
  return items
    .map((it, i) => ({ it, i, r: rank(it.label, q) }))
    .filter((x) => x.r >= 0)
    .sort((a, b) => a.r - b.r
      || (empty ? (a.it.kind === b.it.kind ? 0 : a.it.kind === "screen" ? -1 : 1) : 0)
      || (a.it.kind === "room" && b.it.kind === "room" ? (b.it.ts || 0) - (a.it.ts || 0) : 0)
      || a.i - b.i)
    .slice(0, max)
    .map((x) => x.it);
}

/** 방 → 길 · 회의실만 #/group/all(./shell.tsx whereFor 와 같은 꼴) */
export const roomTo = (id: string) => (id === "all" ? "/group/all" : `/channels/${id}`);

/** 여는 키 = 맥 ⌘K · 그 밖 Ctrl+K(맥의 Ctrl+K = 글칸 줄 지우기라 안 건드림) · 한글 자판이어도(code) */
export const isOpenKey = (e: { key: string; code?: string; metaKey: boolean; ctrlKey: boolean; altKey: boolean; shiftKey: boolean }, mac: boolean) =>
  !e.altKey && !e.shiftKey && (mac ? e.metaKey && !e.ctrlKey : e.ctrlKey && !e.metaKey) && (e.code === "KeyK" || e.key === "k" || e.key === "K");
