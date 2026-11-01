// 첨부 폰 사본(형 11-01 08:46 「파일 기록은 대화 안에 잇는덜 폰 내부 캐시로 7일 보관 이건 몇일 할지 생각래봐」 · 10:4x 결정 「7」)
//   = Cache Storage 한 칸(nm-files) · 받은 날부터 7일 · 합 200MB 넘으면 오래된 것부터 · 목록 표(at·bytes)는 localStorage
//   원본은 서버(저장소)에 늘 있음 → 지워져도 다시 누르면 서버에서 다시 받음 · 못 쓰면(사생활 창·막힘) = 서버 주소 그대로
const CACHE = "nm-files", IDX = "nm_files_idx", KEEP_MS = 7 * 864e5, CAP = 200 * 1024 * 1024;
type Idx = Record<string, { at: number; bytes: number }>;

export const fileUrl = (path: string) => `/api/office/file?path=${encodeURIComponent(path)}`;
const readIdx = (): Idx => { try { return JSON.parse(localStorage.getItem(IDX) || "{}") as Idx; } catch { return {}; } };
const writeIdx = (i: Idx) => { try { localStorage.setItem(IDX, JSON.stringify(i)); } catch { /* 표 못 씀 = 다음에 */ } };

/** 7일 지난 것 · 200MB 넘는 몫(오래된 것부터) 지움 */
export async function pruneFiles(now = Date.now()): Promise<void> {
  try {
    const c = await caches.open(CACHE), idx = readIdx();
    const keep = Object.entries(idx).filter(([, v]) => now - v.at < KEEP_MS).sort((a, b) => b[1].at - a[1].at);
    let sum = 0;
    const live = keep.filter(([, v]) => (sum += v.bytes) <= CAP);
    const liveSet = new Set(live.map(([p]) => p));
    await Promise.all(Object.keys(idx).filter((p) => !liveSet.has(p)).map((p) => c.delete(fileUrl(p))));
    writeIdx(Object.fromEntries(live));
  } catch { /* 캐시 못 씀 */ }
}

/** 그 파일을 폰 사본으로(있고 7일 안이면 그대로 · 없으면 받아서 넣음) → 화면 주소(blob:) · 못 하면 서버 주소 */
export async function cachedFile(path: string): Promise<string> {
  const url = fileUrl(path);
  try {
    const c = await caches.open(CACHE), idx = readIdx(), hit = idx[path] && Date.now() - idx[path].at < KEEP_MS ? await c.match(url) : undefined;
    if (hit) return URL.createObjectURL(await hit.blob());
    const r = await fetch(url, { credentials: "same-origin" });
    if (!r.ok) return url;
    const b = await r.clone().blob();
    await c.put(url, r);
    writeIdx({ ...readIdx(), [path]: { at: Date.now(), bytes: b.size } });
    void pruneFiles();
    return URL.createObjectURL(b);
  } catch { return url; }
}

/** 지금 폰 사본 합(바이트 · 개수) */
export function filesHeld(): { n: number; bytes: number } {
  const v = Object.values(readIdx()).filter((x) => Date.now() - x.at < KEEP_MS);
  return { n: v.length, bytes: v.reduce((s, x) => s + x.bytes, 0) };
}
