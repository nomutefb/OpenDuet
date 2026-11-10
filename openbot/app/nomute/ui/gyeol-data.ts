// 결과 함께(./gyeol.tsx)의 순수 칸 — 시험(tests/gyeol-data.test.ts)이 부를 수 있게 따로(원본 viewer/index.html gyPostKey · gyHook 와 같은 결과)
export type Mv = { url: string; poster?: string; at?: string; song?: string };
/** 원본 gyPostKey = 곡 트랙 id + 영상 파일 경로(?v= 꼬리 뺌 = 같은 파일을 다시 올려도 같은 편) */
export const postKey = (m: Mv) => { let p = ""; try { p = new URL(m.url).pathname; } catch { p = String(m.url || "").split("?")[0]; } return (String(m.song || "") + "|" + p).slice(0, 200); };
/** 원본 gyHook = 후렴 첫 덩이 4줄(없으면 첫 덩이) · [Verse] 같은 표지 줄 뺌 */
export function hookOf(ly?: string) {
  const ls = String(ly || "").split("\n"), ci = ls.findIndex((l) => /^\s*\[\s*(chorus|hook|후렴)[^\]]*\]\s*$/i.test(l)), out: string[] = [];
  for (const l of ci >= 0 ? ls.slice(ci + 1) : ls) {
    if (/^\s*\[[^\]]*\]\s*$/.test(l) || !l.trim()) { if (out.length) break; continue; }
    out.push(l.trim()); if (out.length === 4) break;
  }
  return { t: out.join("\n"), chorus: ci >= 0 && out.length > 0 };
}
