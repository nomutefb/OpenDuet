// 스케줄 공용 조각 = 차단기(형 「차단기로 내리고 키는」 · 위로 올림 켬 · 아래로 내림 끊김 · 위 칸이 내려가면 흐리게) · cron → 말
const CRON_H = "CRON_TZ=Asia/Seoul ";
const hoursKo = (h: string) => {
  if (h === "*") return "매시";
  const m = h.match(/^(\d+)-(\d+)(?:\/(\d+))?$/);
  if (m) return `${m[1]}~${m[2]}시${m[3] ? ` ${m[3]}시간마다` : ""}`;
  return `${h.split(",").join("·")}시`;
};
const oneCron = (c: string) => {   // 「0 11,15,19 * * *」 → 「매일 11·15·19시」 · 못 풀면 글자 그대로
  const p = c.replace(CRON_H, "").trim().split(/\s+/);
  if (p.length !== 5) return c;
  const [mi, h, dom, mon, dow] = p;
  const day = dom !== "*" && mon !== "*" ? `${mon}월 ${dom}일` : dow === "1-5" ? "평일" : dow === "0,6" || dow === "6,0" ? "주말" : dow === "*" ? "매일" : `요일 ${dow}`;
  if (/^\*\/\d+$/.test(mi)) return `${day} ${mi.slice(2)}분마다`;
  return `${day} ${hoursKo(h)}${mi === "0" ? "" : ` ${mi}분`}`;
};
export const cronKo = (l?: string[]) => (l || []).map(oneCron).join(" · ");
export function Breaker({ on, big, dim, label, disabled, onFlip }: { on: boolean; big?: boolean; dim?: boolean; label: string; disabled?: boolean; onFlip: () => void }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} className={`nm-brk${big ? " big" : ""}${dim ? " dim" : ""}`} disabled={disabled} onClick={(e) => { e.stopPropagation(); onFlip(); }}><i /></button>;
}
