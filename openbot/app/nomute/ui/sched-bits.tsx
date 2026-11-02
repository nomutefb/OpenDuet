// 스케줄 공용 조각 = 차단기(형 「차단기로 내리고 키는」 · 위로 올림 켬 · 아래로 내림 끊김 · 위 칸이 내려가면 흐리게) · cron → 말
import "./sched-status.css";   // 상태 점 · 요약 띠 · 한 줄 줄 · 가로 체인
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

// 상태 점(뜸 연구 2026-11-02 「● 정상 · ▲ 지연 · ✕ 놓침 · ○ 확인 안 됨 · – 꺼짐」 · 형 「원활하게 다 미러링되는지도 확인해봐야하고」)
//   자료 = 서버 health(뜸 _sched.js healthOf · 줄마다 health{st, last_at, next_at, drift_min, missed} · 맨 위 health_sum) · 칸이 없으면 = ○ 확인 안 됨(보냄만 알고 돎은 모름)
export type HealthSt = "ok" | "late" | "miss" | "unknown" | "off";
export type Health = { st: HealthSt; last_at?: number; next_at?: number; drift_min?: number; missed?: number; src?: string };
export type HealthSum = Record<HealthSt, number> & { at?: number };
export const HEALTH_KO: Record<HealthSt, string> = { ok: "정상", late: "지연", miss: "놓침", unknown: "확인 안 됨", off: "꺼짐" };
export const ST_ORDER: HealthSt[] = ["ok", "late", "miss", "unknown", "off"];
export const stOf = (h: Health | undefined, off: boolean): HealthSt => (off ? "off" : h?.st || "unknown");
export const agoKo = (ts: number) => { const m = Math.round((Date.now() - ts) / 60e3); return m < 1 ? "방금" : m < 60 ? `${m}분 전` : m < 1440 ? `${Math.floor(m / 60)}시간 전` : `${Math.floor(m / 1440)}일 전`; };
/** 줄 오른쪽 한마디 = 놓침 n · n분 늦음 · 마지막 실제 실행 */
export const lastKo = (h?: Health) => (!h ? "" : h.st === "miss" ? `놓침 ${h.missed || 1}` : h.st === "late" && h.drift_min ? `${h.drift_min}분 늦음` : h.last_at ? `${h.st === "unknown" ? "마지막 " : ""}${agoKo(h.last_at)}` : "");   // ○ 줄 = 「마지막 3일 전」(사건으로만 도는 잡 · 뜸 11-02 「「안 돎 = 고장」으로 안 읽혀」)
export function StatusDot({ st }: { st: HealthSt }) {
  return <i className="nm-st" data-st={st} role="img" aria-label={HEALTH_KO[st]} title={HEALTH_KO[st]} />;
}
/** 묶음 하나의 셈 → 제일 나쁜 것 하나(놓침 > 지연 > 확인 안 됨 > 정상 · 다 꺼짐이면 꺼짐) */
export function sumOf(sts: HealthSt[]): HealthSum {
  const s = { ok: 0, late: 0, miss: 0, unknown: 0, off: 0 } as HealthSum;
  for (const x of sts) s[x]++;
  return s;
}
export const worstOf = (s: HealthSum): HealthSt => (s.miss ? "miss" : s.late ? "late" : s.unknown ? "unknown" : s.ok ? "ok" : "off");
