// 서랍 「번역카드」 판 2 산수 — 원본 viewer/tr.html(trRatio · openArts · pickRef · trIdTs · pollR2RecentTr)과 functions/api/tr.js · trhist.js 계약을 한 곳에
export const AR_PRESETS = ["4:5", "9:16", "16:9"] as const;
const PRESET_RATIO: Record<string, number> = { "4:5": 5 / 4, "9:16": 16 / 9, "16:9": 9 / 16, "1:1": 1 };

/** 직접 비율 = 가로:세로 각 1~99(원본 = 숫자 두 자리) · 너무 길쭉한 판(1:4 · 4:1 밖)은 캔버스가 수만 px 가 되므로 안 받음 → null */
export function arCustom(w: string | number, h: string | number): string | null {
  const a = parseInt(String(w), 10), b = parseInt(String(h), 10);
  return a >= 1 && a <= 99 && b >= 1 && b <= 99 && a / b >= 0.25 && a / b <= 4 ? `${a}:${b}` : null;
}
/** 캔버스 세로 / 가로 — 프리셋 먼저 · 직접 「W:H」 · 못 읽으면 기본 4:5(원본 trRatio) */
export function arRatio(ar: string): number {
  if (PRESET_RATIO[ar]) return PRESET_RATIO[ar];
  const m = /^(\d{1,2}):(\d{1,2})$/.exec(ar), ok = m ? arCustom(m[1], m[2]) : null;
  return ok ? +m![2] / +m![1] : 5 / 4;
}

export type ArtRow = { k: "요약" | "수집"; t: string; m: string; file?: string; u?: string };
export type ArtCtx = { t: string; m: string; b: string; u?: string };
const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));
/** 참고 기사 목록 = 요약(articles.json) 최신 6 + 수집(candidates.json · 새 글부터) 6 — 원본 openArts */
export function artRows(articles: unknown, candidates: unknown): ArtRow[] {
  const rows: ArtRow[] = [];
  const a = Array.isArray(articles) ? articles : Array.isArray((articles as { articles?: unknown[] } | null)?.articles) ? (articles as { articles: unknown[] }).articles : [];
  (a as Record<string, unknown>[]).filter((x) => x && x.title).slice(0, 6).forEach((x) => rows.push({ k: "요약", t: str(x.title), m: str(x.media), file: str(x.file) || undefined }));
  const c = Array.isArray(candidates) ? (candidates as Record<string, unknown>[]) : [];
  c.filter((x) => x && x.title).sort((p, q) => str(q.published).localeCompare(str(p.published))).slice(0, 6)
    .forEach((x) => rows.push({ k: "수집", t: str(x.title), m: str(x.media), u: /^https?:\/\//.test(str(x.url)) ? str(x.url) : undefined }));
  return rows;
}
export const plain = (s: unknown) => str(s).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
/** 서버 ctx.art 꼴 — api/tr.js: t ≤200 · m ≤40 · b ≤900 · u = http(s) 만(본문 없으면 서버가 원문을 직접 읽음) */
export function artCtx(r: ArtRow, body = ""): ArtCtx {
  const o: ArtCtx = { t: r.t.slice(0, 200), m: r.m.slice(0, 40), b: plain(body).slice(0, 900) };
  if (r.u && /^https?:\/\//.test(r.u)) o.u = r.u.slice(0, 500);
  return o;
}
export const artLabel = (r: { t: string; m: string }) => (r.m ? r.m + " · " : "") + r.t.slice(0, 52);

/** trout id 앞 12자리 = KST 만든 때(api/trhist 발급 규칙) → epoch ms · 못 읽으면 0 */
export function trIdTs(id: string): number {
  const m = /^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})-/.exec(String(id || ""));
  if (!m) return 0;
  const t = Date.parse(`20${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}+09:00`);
  return Number.isFinite(t) ? t : 0;
}
export type HistIt = { id: string; url: string; ts: number };
/** GET /api/trhist?recent= 답 → 그릴 줄(새것부터 · id 꼴 · https 주소 · 시각 읽히는 것만 · 같은 id 한 번) */
export function histItems(j: unknown, cap = 24): HistIt[] {
  const items = Array.isArray((j as { items?: unknown[] } | null)?.items) ? (j as { items: Record<string, unknown>[] }).items : [];
  const seen = new Set<string>(), out: HistIt[] = [];
  for (const it of items) {
    const id = str(it?.id), url = str(it?.url), ts = trIdTs(id);
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(id) || !/^https:\/\//.test(url) || !ts || seen.has(id)) continue;
    seen.add(id); out.push({ id, url, ts });
  }
  return out.sort((a, b) => b.ts - a.ts).slice(0, cap);
}
/** 「11-11 01:30」 KST */
export function kstStamp(ts: number): string {
  const d = new Date(ts + 9 * 3600e3), p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}
