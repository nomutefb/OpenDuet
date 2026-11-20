// 썸네일 미리보기 따옴표 들여쓰기 = 굽는 쪽 apps/thumbnail/quote_indent.py(천둥 editor #4598 · R0083) 새 판 그대로 옮김 · 미리보기 = 결과(시아 R0089 ②)
//   형 11-21(뜸 · 시아 옮김 R0083) 새 판: 줄 시작 또는 한두 어절 뒤에서 연 따옴표가 다음 줄로 이어지면 이어지는 줄을 그 따옴표 안쪽 첫 글자 아래로(들여쓰기 = 따옴표 앞 글 폭 + 따옴표 폭)
//   셋째 어절부터 연 따옴표 = 안 들여씀 · 따옴표 = 페어드 6쌍 + ASCII 2자(comp 14자와 같은 세트) · 폭 = adv(글자 진행폭 + 자간 · 1080 기준 px)
const PAIRS: Record<string, string> = { "“": "”", "‘": "’", "「": "」", "『": "』", "«": "»", "‹": "›" };
const OPEN = new Set(Object.keys(PAIRS)), CLOSE = new Set(Object.values(PAIRS)), ASCII = new Set(['"', "'"]);
/** *강조* 표 걷기(그리는 글자만 · 폭 기준 같게) */
export const stripEmph = (s: string): string => String(s || "").replace(/\*([^*]+)\*/g, "$1");
/** 줄마다 들여쓰기(1080 기준 px · 0 = 없음) */
export function quoteIndents(lines: string[], adv: (ch: string) => number): number[] {
  const stack: { k: "P" | "A"; ch: string; ind: number | null }[] = [];
  return lines.map((line) => {
    const carry = Math.max(0, ...stack.map((s) => s.ind ?? 0));   // 아직 열린 따옴표 가운데 가장 안쪽 들여쓰기
    let x = carry, words = 0, inWord = false;
    for (const ch of stripEmph(line)) {
      if (/\s/.test(ch)) { if (inWord) words++; inWord = false; x += adv(ch); continue; }
      if (OPEN.has(ch)) stack.push({ k: "P", ch, ind: words <= 2 ? x + adv(ch) : null });
      else if (CLOSE.has(ch)) { for (let j = stack.length - 1; j >= 0; j--) if (stack[j].k === "P") { stack.splice(j, 1); break; } }   // 가장 최근 페어드 하나(LIFO)
      else if (ASCII.has(ch)) {
        let hit = -1; for (let j = stack.length - 1; j >= 0; j--) if (stack[j].k === "A" && stack[j].ch === ch) { hit = j; break; }
        if (hit >= 0) stack.splice(hit, 1); else stack.push({ k: "A", ch, ind: words <= 2 ? x + adv(ch) : null });
      }
      inWord = true; x += adv(ch);
    }
    return carry;
  });
}
