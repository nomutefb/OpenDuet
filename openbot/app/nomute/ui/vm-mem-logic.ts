// 서랍 「VM 상태」 = 몸(VM)마다 램 24시간 한 장(형 11-16 16:4x 구름 맥 창 「정원에 각 vm 쓰는 애들 한테 이 자료받아서 vm 상태 그리게 할거야 공간 하나 만들어줘」 · 「이거 github nomutefb 에 보면 life 어쩌고 차트 도구있어」 · 「그거로 만들면돼.」)
//   순수(시험 tests/vm-mem.test.ts) — 받은 자료 거르기 · 셈(평균 · 최저 · 최고) · 그림 자리(가는 선 · 윤곽 · 계단) · 눈금
//   그림 꼴 = nomutefb/lieflat-charts F3 Hairline Area(templates/basics-gallery.html 「B3 · hairline area」): 채움 = 색 면이 아니라 잰 값마다 가는 선 하나(바닥 → 그 값) + 위 윤곽 한 줄 + 가장 높은 값에 점 · 숫자
//     · 우리 쪽에서 얹은 것 = 둘째 줄기(VM 이 쥔 램 = 계단 선) · VM 최소 · 최대 선 · 「다시 켜짐」 표 · 왼쪽 눈금(형이 붙인 그림의 읽을거리)
//     · 가는 선 288개(5분 칸 · 24시간)는 밝기 세 묶음 = 길(path) 셋으로 그림(원본 = 선마다 따로 · 눈엔 같고 그릴 것은 셋)
//   자료 문 = GET /api/office/vm-mem(깃 서버 · 몸들이 12시간마다 올림 · 빠르 11-16 16:43 회의실 「구름 GET 꼴 좋아 — 그대로 가자」)

export type VmMem = { who: string; host?: string; step_s: number; t0: number; used_gb: (number | null)[]; held_gb?: (number | null)[]; min_gb?: number; max_gb?: number; marks?: { t: number; label: string }[] };
export type VmMemRes = { at?: number; vms?: unknown };

const num = (x: unknown): number | null => (typeof x === "number" && Number.isFinite(x) && x >= 0 && x < 4096 ? x : null);
const series = (a: unknown, n = 2016): (number | null)[] => (Array.isArray(a) ? a.slice(-n).map(num) : []);

/** 받은 자료 → 그릴 수 있는 몸만(이름 · 칸 길이 · 값 하나 이상) · 이상한 값 = 빈 칸(null) */
export function vmClean(raw: unknown): VmMem[] {
  if (!Array.isArray(raw)) return [];
  const out: VmMem[] = [];
  for (const r of raw as Record<string, unknown>[]) {
    if (!r || typeof r !== "object" || typeof r.who !== "string" || !r.who) continue;
    const step = num(r.step_s), t0 = typeof r.t0 === "number" && Number.isFinite(r.t0) && r.t0 > 0 ? r.t0 : null, used = series(r.used_gb);
    if (!step || step < 10 || t0 === null || !used.some((v) => v !== null)) continue;
    const held = series(r.held_gb), cut = Array.isArray(r.used_gb) ? Math.max(0, (r.used_gb as unknown[]).length - used.length) : 0;
    const marks = Array.isArray(r.marks) ? (r.marks as Record<string, unknown>[]).filter((m) => m && typeof m.t === "number" && Number.isFinite(m.t) && typeof m.label === "string").slice(0, 12).map((m) => ({ t: m.t as number, label: (m.label as string).slice(0, 24) })) : undefined;
    out.push({ who: r.who.slice(0, 24), host: typeof r.host === "string" ? r.host.slice(0, 24) : undefined, step_s: step, t0: t0 + cut * step * 1000, used_gb: used, held_gb: held.some((v) => v !== null) ? held : undefined, min_gb: num(r.min_gb) ?? undefined, max_gb: num(r.max_gb) ?? undefined, marks });
  }
  return out.slice(0, 16);
}

export type VmStats = { n: number; avg: number; min: number; max: number; peak: number; last: number | null; heldLast: number | null; t1: number };
const lastOf = (a: (number | null)[] | undefined) => { if (a) for (let i = a.length - 1; i >= 0; i--) if (a[i] !== null) return a[i]; return null; };
/** 셈 — 쓴 램 평균 · 최저 · 최고(칸 번호) · 마지막 값 · 쥔 램 마지막 값 */
export function vmStats(v: VmMem): VmStats {
  let n = 0, sum = 0, min = Infinity, max = -Infinity, peak = -1;
  v.used_gb.forEach((x, i) => { if (x === null) return; n++; sum += x; if (x < min) min = x; if (x > max) { max = x; peak = i; } });
  return { n, avg: n ? sum / n : 0, min: n ? min : 0, max: n ? max : 0, peak, last: lastOf(v.used_gb), heldLast: lastOf(v.held_gb), t1: v.t0 + (v.used_gb.length - 1) * v.step_s * 1000 };
}

const p2 = (n: number) => String(n).padStart(2, "0");
export const gb = (x: number) => (Math.round(x * 10) / 10).toFixed(1);
export const hm = (t: number) => { const d = new Date(t); return `${p2(d.getHours())}:${p2(d.getMinutes())}`; };
export const mdhm = (t: number) => { const d = new Date(t); return `${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${hm(t)}`; };
export const everyKo = (s: number) => (s % 3600 === 0 ? `${s / 3600}시간마다` : s % 60 === 0 ? `${s / 60}분마다` : `${s}초마다`);

/** 「다시 켜짐」 = 서버가 marks 를 주면 그걸 씀 · 안 주면 빈 칸에서 셈: 값이 이어지다(3칸~) 비었다가 다시 이어지는(3칸~) 자리만
 *  (진짜 자료 11-16 실물 = 옛 기록 구간은 한 칸 건너 한 칸씩 비어 있어, 「빈 칸 뒤 첫 값」으로만 세면 표가 줄줄이 찍혔음 → 듬성듬성한 구간은 끊김으로 안 침) */
export function vmMarks(v: VmMem): { t: number; label: string }[] {
  if (v.marks && v.marks.length) return v.marks;   // 빈 목록 = 서버가 안 센 것으로 보고 아래에서 셈
  const a = v.used_gb, out: { t: number; label: string }[] = [], run = (i: number, d: 1 | -1) => { let k = 0; while (a[i + k * d] != null) k++; return k; };
  for (let i = 1; i < a.length; i++) if (a[i] !== null && a[i - 1] === null) { let p = i - 1; while (p >= 0 && a[p] === null) p--; if (p >= 0 && run(p, -1) >= 3 && run(i, 1) >= 3) out.push({ t: v.t0 + i * v.step_s * 1000, label: "다시 켜짐" }); }
  return out.slice(0, 12);
}

const rnd = (i: number, k: number) => Math.abs(((i * 73856093) ^ (k * 19349663)) % 1000) / 1000;   // lieflat gallery 의 rnd 그대로(선마다 밝기 흩기)
const r1 = (x: number) => Math.round(x * 10) / 10;

export type VmGeom = { w: number; h: number; l: number; r: number; base: number; top: number; yMax: number; hair: [string, string, string]; peakHair: string; outline: string; held: string; ticksY: { y: number; label: string }[]; ticksX: { x: number; label: string }[]; refs: { y: number; label: string }[]; marks: { x: number; label: string }[]; peak: { x: number; y: number; label: string } | null; end: { used: { y: number; label: string } | null; held: { y: number; label: string } | null } };
/** 그림 자리 — w × h 판 · 넓으면(560px~) 오른쪽 끝에 마지막 값 글 자리 */
export function vmGeom(v: VmMem, w: number, h: number): VmGeom {
  const wide = w >= 560, l = 36, r = wide ? 92 : 10, top = 26, base = h - 30, s = vmStats(v), n = v.used_gb.length;
  const hi = Math.max(2, v.max_gb || 0, s.max, ...(v.held_gb || []).map((x) => x ?? 0));
  const stepY = hi > 16 ? 8 : hi > 8 ? 4 : 2, yMax = Math.ceil(hi / stepY) * stepY;
  const x = (i: number) => r1(l + (n > 1 ? (i * (w - l - r)) / (n - 1) : 0)), y = (g: number) => r1(base - (g / yMax) * (base - top));
  const hair: [string, string, string] = ["", "", ""];
  let outline = "", pen = false, peakHair = "";
  v.used_gb.forEach((g, i) => {
    if (g === null) { pen = false; return; }
    if (i === s.peak) peakHair = `M${x(i)} ${base}V${y(g)}`; else hair[Math.min(2, Math.floor(rnd(i + 1, 7) * 3))] += `M${x(i)} ${base}V${y(g)}`;
    outline += `${pen ? "L" : "M"}${x(i)} ${y(g)}`; pen = true;
  });
  let held = "", hp = false;
  (v.held_gb || []).forEach((g, i) => { if (g === null) { hp = false; return; } held += hp ? `V${y(g)}H${x(Math.min(n - 1, i + 1))}` : `M${x(i)} ${y(g)}H${x(Math.min(n - 1, i + 1))}`; hp = true; });
  const ticksY = Array.from({ length: yMax / stepY + 1 }, (_, k) => ({ y: y(k * stepY), label: k * stepY === yMax ? `${yMax}GB` : String(k * stepY) }));
  const span = (n - 1) * v.step_s * 1000, hrs = span / 3_600_000, every = hrs > 36 ? 12 : hrs > 16 ? (wide ? 3 : 6) : hrs > 6 ? 2 : 1;
  const ticksX: { x: number; label: string }[] = [], d0 = new Date(v.t0); d0.setMinutes(0, 0, 0);
  for (let t = d0.getTime(); span > 0 && t <= v.t0 + span; t += 3_600_000) { if (t < v.t0 || new Date(t).getHours() % every) continue; ticksX.push({ x: r1(l + ((t - v.t0) / span) * (w - l - r)), label: `${p2(new Date(t).getHours())}시` }); }
  const refs = [v.min_gb ? { y: y(v.min_gb), label: `VM 최소 ${v.min_gb}GB` } : null, v.max_gb ? { y: y(v.max_gb), label: `VM 최대 ${v.max_gb}GB` } : null].filter((a): a is { y: number; label: string } => !!a);
  const marks = span > 0 ? vmMarks(v).filter((m) => m.t >= v.t0 && m.t <= v.t0 + span).map((m) => ({ x: r1(l + ((m.t - v.t0) / span) * (w - l - r)), label: `${hm(m.t)} ${m.label}` })) : [];
  const peak = s.peak >= 0 ? { x: x(s.peak), y: y(s.max), label: `최고 ${gb(s.max)}GB · ${hm(v.t0 + s.peak * v.step_s * 1000)}` } : null;
  let eu = s.last !== null ? { y: y(s.last), label: `쓴 램 ${gb(s.last)}GB` } : null, eh = s.heldLast !== null ? { y: y(s.heldLast), label: `쥔 램 ${gb(s.heldLast)}GB` } : null;
  if (eu && eh && Math.abs(eu.y - eh.y) < 13) { const mid = (eu.y + eh.y) / 2, up = eh.y <= eu.y; eh = { ...eh, y: r1(mid + (up ? -6.5 : 6.5)) }; eu = { ...eu, y: r1(mid + (up ? 6.5 : -6.5)) }; }   // 두 끝 글이 겹치면 벌림
  return { w, h, l, r, base, top, yMax, hair, peakHair, outline, held, ticksY, ticksX, refs, marks, peak, end: { used: wide ? eu : null, held: wide ? eh : null } };
}

/** 미리보기 자료(주소 꼬리표 ?vmdemo 일 때만 · 진짜 자료 아님 = 화면에 「견본」 표) — 형이 붙인 깃 그림 비슷한 꼴 넷 */
export function vmDemo(now: number): VmMem[] {
  const step = 300, n = 288, t0 = Math.floor(now / 300_000) * 300_000 - (n - 1) * step * 1000;
  return [["깃", "Lx A", 1.1, 3], ["빠르", "Win", 2.4, 5], ["번개", "Lx B", 1.6, 9], ["천둥", "Win", 3.1, 13]].map(([who, host, lvl, k]) => {
    const used: (number | null)[] = [], held: (number | null)[] = [], off = 6 + (k as number);
    for (let i = 0; i < n; i++) {
      if (i === off || i === off + 1) { used.push(null); held.push(null); continue; }
      const spike = rnd(i, k as number) > 0.972 ? 0.5 + rnd(i, 3) * 0.6 : 0, u = (lvl as number) + 0.08 * Math.sin(i / 17) + rnd(i, (k as number) + 1) * 0.08 + spike;
      used.push(Math.round(u * 100) / 100); held.push(i < off ? 7.8 : spike ? Math.round((4.6 + rnd(i, 5) * 1.2) * 10) / 10 : Math.max(3.8, Math.ceil(u * 1.25 * 10) / 10 > 3.8 ? Math.ceil(u * 1.4 * 10) / 10 : 3.8));
    }
    return { who: who as string, host: host as string, step_s: step, t0, used_gb: used, held_gb: held, min_gb: 4, max_gb: 10 };
  });
}
