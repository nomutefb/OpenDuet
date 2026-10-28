// 시간 꼴 하나(형 10-28 10:22 「그냥 3:50 PM 이면 될거같아, 오전 오후 유치한듯」) — 새 사무실 시간 칸 전부 이걸 씀 · 한국 시각
const kst = (ts: number) => new Date(ts + 9 * 3600e3);

/** 「3:50 PM」 */
export function t12(ts: number) {
  const d = kst(ts), h = d.getUTCHours();
  return `${h % 12 || 12}:${String(d.getUTCMinutes()).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** 목록 시각 = 오늘이면 「3:50 PM」 · 날짜가 다르면 날짜만 「10-27」 */
export function listWhen(ts?: number) {
  if (!ts) return "";
  const day = (t: number) => kst(t).toISOString().slice(0, 10);
  return day(ts) === day(Date.now()) ? t12(ts) : day(ts).slice(5);
}
