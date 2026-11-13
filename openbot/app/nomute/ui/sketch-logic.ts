// 화상회의 스케치 순수 판(.ts · node 시험 길) — 그리는 쪽 = ./sketch.tsx · 서버 = editor functions/api/office/_sketch.js(‰ 0~1000)
export type SkItem = { id: string; k: "free" | "rect" | "circle" | "arrow" | "text"; who: string; at: number; url?: string; text?: string; p?: [number, number][]; x?: number; y?: number; w?: number; h?: number; r?: number; x2?: number; y2?: number };

// 그린 사람 색(명세 「그린 사람 색」) — 형 = 라임 · 우리 = 제 얼굴 결 · 모르는 이 = 이름으로 고른 색
const SK: Record<string, string> = { 형: "#CFFF40", 봄: "#FF8FB8", 뜸: "#FFB07C", 시아: "#7FD4FF", 뎅: "#C9A7FF", 빠르: "#FF6B6B", 번개: "#FFD84D", 깃: "#5FE3C0", 챙: "#8FC45A", 카리나: "#9AA8FF", 촉: "#4D8BFF", 틈: "#E8B86B" };
const SPARE = ["#FF9F43", "#54A0FF", "#FF6B9A", "#1DD1A1", "#C8D6E5", "#F368E0"];
export function skColor(who: string): string {
  if (SK[who]) return SK[who];
  let h = 0; for (const ch of String(who || "")) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return SPARE[h % SPARE.length];
}

/** 자유선 · 화살표 = path d(‰ 그대로 · viewBox 0 0 1000 1000). */
export function pathOf(it: SkItem): string {
  if (it.k === "arrow") return `M${it.x ?? 0} ${it.y ?? 0}L${it.x2 ?? 0} ${it.y2 ?? 0}`;
  const p = it.p || [];
  return p.length ? `M${p[0][0]} ${p[0][1]}` + p.slice(1).map((q) => `L${q[0]} ${q[1]}`).join("") : "";
}
