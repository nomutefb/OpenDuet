// 5번 「애들」 위 탭 「살림」(./ops-desk.tsx)의 셈 — 화면 없는 순수 함수(시험 tests/ops-logic.test.ts)
//   자료 = /ops.json(에디터 metrics/ops-daily.jsonl 을 구운 것 · 칸 뜻 = nomutefb/editor docs/ops-daily.md)
//   형 11-19: 「누적되는 것들 … 차트화해서 항시 보고형태러」 · 「누수되는 지점 이나 개선 부분이 내 잣대 4개를 보고 되새김질이 가능하면」

export type OpsWf = {
  n: number; skipped: number; failed: number; empty: number; wall_min: number;
  job_s?: number; queue_s?: number; checkout_s?: number; setup_s?: number; work_s?: number; commit_s?: number; wait_s?: number;
  runner_min_est?: number; sampled?: number; top_steps?: [string, number][];
};
export type LensRow = { wf: string; min?: number; n?: number; per_s?: number; miss_pct?: number; wait_s?: number; queue_s?: number; skipped?: number; empty?: number };
export type OpsRow = {
  day: string;
  run?: { total: { runs: number; skipped: number; failed: number; cancelled: number; empty: number; wall_min: number; runner_min_est: number }; by_wf?: Record<string, [number, number]>; wf: Record<string, OpsWf>; together: [string, string, number][] } | null;
  lens?: { cart: LensRow[]; cart_together: [string, string, number][]; bulb: LensRow[]; post: LensRow[]; door: LensRow[] };
  new_wf?: string[];
  judge?: { usd: number; calls: number; by_src: Record<string, number> } | null;
  r2?: { a: number; b: number; buckets?: Record<string, [number, number]> } | null;
  gh?: { used_max_pct?: number; max_at?: string } | null;
};
export type OpsNow = {
  day?: string; at?: string;
  gh?: { limit: number; used_max: number; used_max_pct: number; last_pct?: number; max_at?: string; samples: number };
  r2?: R2Now;
  r2_more?: R2Now[];   // 둘째 Cloudflare 계정(nomute.kr · 형 11-19 「하나 더 받아봐 nomute.kr r2야」) — 시크릿이 있을 때만
};
export type R2Now = { name?: string; err?: string; month?: string; a?: number; b?: number; a_pct?: number; b_pct?: number; gb?: number; gb_pct?: number; objects?: number };
/** R2 에 닿는 손 · 그록 계정 귀속(에디터 metrics/ops-cli.json · 손으로 훑어 적는 표) */
export type CliBindRow = { who: string; note?: string } & Record<string, string[] | string | undefined>;
export type CliBindData = { at?: string; how?: string; accounts?: Record<string, string>; rows?: CliBindRow[]; grok?: { said?: string[]; accounts?: { name: string; via?: string; case?: string; note?: string }[]; todo?: string } };
export type OpsData = { rows: OpsRow[]; now: OpsNow | null; cli?: CliBindData | null };

/** 큰 수 = 만 · 억(한국어 읽기) */
export const man = (n: number): string => {
  const a = Math.abs(n);
  if (a >= 1e8) return `${(n / 1e8).toFixed(a >= 1e9 ? 0 : 1)}억`;
  if (a >= 1e4) return `${(n / 1e4).toFixed(a >= 1e6 ? 0 : 1)}만`;
  return String(Math.round(n));
};
/** 분 → 「3시간 20분」 · 한 시간 안이면 「45분」 */
export const hm = (min: number): string => {
  const m = Math.round(min);
  return m >= 60 ? `${Math.floor(m / 60)}시간${m % 60 ? ` ${m % 60}분` : ""}` : `${m}분`;
};
export const md = (day: string): string => `${+day.slice(5, 7)}-${day.slice(8)}`;

/** 눈금 끝 = 1 · 1.5 · 2 · 2.5 · 3 · 4 · 5 · 6 · 8 × 10^k 가운데 v 이상인 첫 값(막대가 틀의 반 넘게 차도록 촘촘히) */
export function niceMax(v: number): number {
  if (!(v > 0)) return 1;
  const k = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * k >= v) return m * k;
  return 10 * k;
}

export type Bar = { i: number; v: number | null; x: number; cx: number; y: number; w: number; h: number };
export type BarGeom = { l: number; r: number; top: number; base: number; max: number; ticks: { v: number; y: number }[]; bars: Bar[]; step: number };
/** 날짜별 막대 자리(왼쪽 눈금 l · 아래 날짜 줄 20px) — 값이 없는 날은 v = null(막대 없음) */
export function barGeom(vals: (number | null | undefined)[], w: number, h: number, l = 40, r = 10): BarGeom {
  const top = 16, base = h - 20, n = Math.max(1, vals.length);
  const max = niceMax(Math.max(0, ...vals.map((v) => (typeof v === "number" ? v : 0))));
  const slot = (w - l - r) / n, bw = Math.max(2, Math.min(26, slot * 0.62));
  const bars = vals.map((raw, i) => {
    const v = typeof raw === "number" ? raw : null, bh = v == null ? 0 : Math.max(v > 0 ? 1 : 0, (v / max) * (base - top));
    const cx = l + slot * i + slot / 2;
    return { i, v, x: cx - bw / 2, cx, y: base - bh, w: bw, h: bh };
  });
  const ticks = [0, max / 2, max].map((v) => ({ v, y: base - (v / max) * (base - top) }));
  const step = Math.max(1, Math.ceil(n / Math.max(1, Math.floor((w - l - r) / 46))));   // 날짜 글이 안 겹치게 몇 칸마다
  return { l, r, top, base, max, ticks, bars, step };
}
/** 둘째 값(선) — 제 최대에 맞춰 같은 틀 안에 · 값 없는 날은 끊음 */
export function lineOver(vals: (number | null | undefined)[], g: BarGeom): { d: string; max: number } {
  const max = niceMax(Math.max(0, ...vals.map((v) => (typeof v === "number" ? v : 0))));
  let d = "", pen = false;
  vals.forEach((v, i) => {
    if (typeof v !== "number" || !g.bars[i]) { pen = false; return; }
    d += `${pen ? "L" : "M"}${g.bars[i].cx.toFixed(1)},${(g.base - (v / max) * (g.base - g.top)).toFixed(1)}`;
    pen = true;
  });
  return { d, max };
}

/** 7일 전 줄(같은 요일) — 없으면 -1 */
export function weekBefore(rows: OpsRow[], i: number): number {
  const d = rows[i]?.day; if (!d) return -1;
  const t = new Date(`${d}T00:00:00Z`); t.setUTCDate(t.getUTCDate() - 7);
  const want = t.toISOString().slice(0, 10);
  return rows.findIndex((r) => r.day === want);
}
export type Delta = { kind: "none" } | { kind: "new" } | { kind: "same" } | { kind: "up" | "down"; by: number };
/** 잣대 한 줄이 7일 전보다 늘었나 줄었나(하루 분) — 7일 전 줄이 없으면 none · 그때 목록에 없던 것이면 new */
export function lensDelta(rows: OpsRow[], i: number, key: "cart" | "post" | "door", wf: string): Delta {
  const j = weekBefore(rows, i);
  if (j < 0 || !rows[j].lens) return { kind: "none" };
  const now = rows[i].lens?.[key].find((x) => x.wf === wf)?.min, was = rows[j].lens![key].find((x) => x.wf === wf)?.min;
  if (now == null) return { kind: "none" };
  if (was == null) return { kind: "new" };
  const by = Math.round((now - was) * 10) / 10;
  return Math.abs(by) < 1 ? { kind: "same" } : { kind: by > 0 ? "up" : "down", by: Math.abs(by) };
}

export const KINDS: { k: "checkout_s" | "setup_s" | "work_s" | "commit_s" | "wait_s"; cls: string; label: string }[] = [
  { k: "checkout_s", cls: "ck", label: "받기" }, { k: "setup_s", cls: "su", label: "채비" }, { k: "work_s", cls: "wk", label: "본일" },
  { k: "commit_s", cls: "cm", label: "커밋" }, { k: "wait_s", cls: "wt", label: "기다림" },
];
export type StepRow = { wf: string; n: number; job: number; segs: { cls: string; label: string; s: number; pct: number }[]; top: string };
/** 그날 돈 시간 큰 워크플로의 단계 띠 — 띠 길이 = 잡 시간(가장 긴 것 = 100%) · 조각 = 갈래별 초 */
export function stepRows(row: OpsRow, limit = 8): StepRow[] {
  const wf = row.run?.wf || {};
  const list = Object.entries(wf).filter(([, d]) => (d.job_s || 0) > 0).slice(0, limit);
  const longest = Math.max(1, ...list.map(([, d]) => KINDS.reduce((a, k) => a + (d[k.k] || 0), 0)));
  return list.map(([name, d]) => {
    const segs = KINDS.map((k) => ({ cls: k.cls, label: k.label, s: d[k.k] || 0, pct: (100 * (d[k.k] || 0)) / longest })).filter((s) => s.s > 0);
    const t = d.top_steps?.[0];
    return { wf: name, n: d.n - d.skipped, job: d.job_s || 0, segs, top: t ? `${t[0]} ${Math.round(t[1])}초` : "" };
  });
}
/** 평균(값 있는 날만) — 앞 n 일 */
export function avgBefore(vals: (number | null | undefined)[], i: number, n = 7): number | null {
  const xs = vals.slice(Math.max(0, i - n), i).filter((v): v is number => typeof v === "number");
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}
