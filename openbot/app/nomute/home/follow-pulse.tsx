// 홈 맨 위 팔로워 띠(형 10-31 09:5x 「웹에 보면 인스타 맨 위에 뜨는거 있잖아 에디터.노뮤트케이알 … 그거를 지금 웹앱 맨 상단에 나오게했으면 좋겠음. 애들 접수사항은 어짜피 다른데서 볼 수 있으니까」)
//   원본 = 에디터 첫 화면 #home-pulse(modern-home.js 885~990 · 운영자 261022 «카드 위에 인스타 팔로워 현재 수 · 메타 앱으로 자주 들어가서 확인») — 같은 데이터·같은 셈·같은 그림을 React+svg 로(그래프 라이브러리 0)
//   데이터 = `/api/chan?f=ig` → 안 되면 `/insta_data.json` · FB = `/api/chan?f=fb` → `/fb_data.json`(원본 get() 차례 그대로 · 같은 출처 edit.nomute.kr · 쿠키 그대로 · Access 벽 안 · read.ts 가 "/" 를 same-origin 으로 받는 것과 같은 길)
//   꼴 = IG · FB 총수 한 줄 + 「갱신 N분 전」 + 10일 증가율(%) 꺾은선 둘(IG 위 선 · FB 아래 선 · 0% 점선) + 날마다 ±명수 두 줄(IG 위 · FB 아래) · 색 = 오름 강조색 · 내림 금색 · 없음 회색(원본 규칙)
//   누르면 = 채널 요약(원본 «일단 홈 팔로워로» → 우리 앱은 #/web?u=/?tab=chan 한 겹) · 10분마다 다시 읽음(원본과 같음) · 접수사항(CheckOne)은 이 자리에서 뺌(파일은 그대로 · 안 부름)
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Row = { date: string; follower_net?: number | null; follows?: number | null; unfollows?: number | null };
type Chan = { profile: { followers_count: number }; generated_kst: string; daily_series?: Row[] };
type Pt = { date: string; net: number | null; count: number; pct: number };
const DAYS = 10, nf = new Intl.NumberFormat("ko-KR");
const kstDay = () => new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10);
const signed = (v: number) => (v > 0 ? "+" : v < 0 ? "−" : "") + nf.format(Math.abs(v));
const NET = {
  ig: (r: Row) => (r.follower_net != null ? r.follower_net : r.follows != null && r.unfollows != null ? r.follows - r.unfollows : null),
  fb: (r: Row) => (r.follower_net != null ? r.follower_net : r.follows != null ? r.follows : null),
};

async function get(key: "ig" | "fb", file: string): Promise<Chan | null> {
  for (const u of [`/api/chan?f=${key}`, `/${file}?ts=${Date.now()}`]) {
    try {
      const r = await fetch(u, { cache: "no-store", credentials: "same-origin" });
      if (!r.ok) continue;
      const t = await r.text();
      if (/^\s*</.test(t)) continue;   // 로그인 벽 HTML = 건너뜀
      const j = JSON.parse(t) as Chan;
      if (j && j.profile && typeof j.profile.followers_count === "number" && j.generated_kst) return j;
    } catch { /* 다음 길 */ }
  }
  return null;
}

/** 원본 series() 그대로 — 지난 DAYS 일(오늘 제외) · count = 그날 끝 팔로워 · pct = 창 시작 대비 % */
function series(j: Chan, key: "ig" | "fb"): Pt[] {
  const today = kstDay(), all = (j.daily_series || []).filter((r) => r && r.date), todayRow = all.find((r) => r.date === today);
  const days = all.filter((r) => r.date < today).slice(-DAYS), nets = days.map(NET[key]);
  let c = j.profile.followers_count - ((todayRow && NET[key](todayRow)) || 0);
  const counts: number[] = [];
  for (let k = days.length - 1; k >= 0; k--) { counts[k] = c; c -= nets[k] || 0; }
  const base = c > 0 ? c : counts[0] || 1;
  return days.map((r, k) => ({ date: r.date, net: nets[k], count: counts[k], pct: ((counts[k] - base) / base) * 100 }));
}

const ago = (iso: string) => { const t = Date.parse(iso); if (!Number.isFinite(t)) return ""; const m = Math.max(0, Math.floor((Date.now() - t) / 6e4)); return "갱신 " + (m < 1 ? "방금" : m < 60 ? `${m}분 전` : `${Math.floor(m / 60)}시간 전`); };
const smooth = (pts: [number, number][]) => pts.map((p, i) => { if (!i) return `M${p[0].toFixed(1)} ${p[1].toFixed(1)}`; const a = pts[i - 1], m = (a[0] + p[0]) / 2; return `C${m.toFixed(1)} ${a[1].toFixed(1)} ${m.toFixed(1)} ${p[1].toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`; }).join("");

export function FollowPulse() {
  const [ig, setIg] = useState<Chan | null>(null), [fb, setFb] = useState<Chan | null>(null), [, tick] = useState(0);
  // 그림 폭 = 화면 실제 폭(형 10-31 「이거 위에 찌그러지는거 좀 수정해줄래?」 · 300칸을 가로로 늘려서 글자·점이 찌그러졌음)
  const [wide, setWide] = useState(300), seen = useRef<ResizeObserver | null>(null);
  const chart = useCallback((el: SVGSVGElement | null) => {
    seen.current?.disconnect();
    if (!el) return;
    seen.current = new ResizeObserver(([e]) => { const w = Math.round(e.contentRect.width); if (w > 0) setWide(w); });
    seen.current.observe(el);
  }, []);
  useEffect(() => {
    let live = true;
    const load = () => Promise.all([get("ig", "insta_data.json"), get("fb", "fb_data.json")]).then(([a, b]) => { if (!live) return; if (a) setIg(a); setFb(b); }).catch(() => {});
    load();
    const t1 = window.setInterval(() => { if (!document.hidden) load(); }, 10 * 60e3), t2 = window.setInterval(() => tick((n) => n + 1), 60e3);   // 10분 다시 읽기 · 1분 「갱신 N분 전」
    return () => { live = false; clearInterval(t1); clearInterval(t2); };
  }, []);
  const view = useMemo(() => {
    if (!ig) return null;
    const W = wide, H = 64, P = W / DAYS, FS = 9.5, RH = FS + 6, RG = 3, FBY = H - RH, IGY = FBY - RG - RH, TOP = 4, BOT = IGY - 6;
    const lines: ["ig" | "fb", Pt[]][] = [["ig", series(ig, "ig")], ...(fb ? [["fb", series(fb, "fb")] as ["fb", Pt[]]] : [])];
    const all = lines.flatMap(([, s]) => s.map((p) => p.pct));
    const span = Math.max(0.5, ...all.map(Math.abs)), lo = Math.min(0, ...all), hi = Math.max(0, ...all);
    const top = hi - lo < span * 0.1 ? hi + span * 0.05 : hi, bot = hi - lo < span * 0.1 ? lo - span * 0.05 : lo;
    const Y = (v: number) => BOT - ((v - bot) / (top - bot || 1)) * (BOT - TOP);
    return { W, H, P, FS, RH, FBY, IGY, Y, lines };
  }, [ig, fb, wide]);
  if (!ig || !view) return null;   // 못 읽으면 자리 비움(홈이 그 자리만큼 올라옴)
  const { W, H, P, FS, RH, FBY, IGY, Y, lines } = view;
  const go = () => { window.location.hash = "#/web?u=" + encodeURIComponent("/?tab=chan"); };   // 원본 = 채널 요약로
  return (
    <button type="button" className="nm-pulse" aria-label="팔로워 — 누르면 채널 요약" onClick={go}>
      <div className="nm-pulse-row">
        <span className="nm-pulse-k ig">IG</span><b className="nm-pulse-v">{nf.format(ig.profile.followers_count)}</b>
        <i className="nm-pulse-sep" aria-hidden />
        <span className="nm-pulse-k fb">FB</span><b className="nm-pulse-v">{fb ? nf.format(fb.profile.followers_count) : "–"}</b>
        <span className="nm-pulse-at">{ago(ig.generated_kst)}</span>
      </div>
      <svg ref={chart} className="nm-pulse-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`최근 ${DAYS}일 팔로워 증가율`}>
        <defs><linearGradient id="nm-pulse-fade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopOpacity="0" /><stop offset=".25" stopOpacity="1" /><stop offset=".75" stopOpacity="1" /><stop offset="1" stopOpacity="0" /></linearGradient></defs>
        <rect className="nm-pulse-rowbg" x="0" y={IGY} width={W} height={RH} fill="url(#nm-pulse-fade)" />
        <line className="nm-pulse-base" x1="0" x2={W} y1={Y(0).toFixed(1)} y2={Y(0).toFixed(1)} strokeWidth="1" strokeDasharray="2 3" />
        {lines.map(([key, s]) => {
          const off = (DAYS - s.length) * P, pts = s.map((p, i) => [off + i * P + P / 2, Y(p.pct)] as [number, number]);
          return (
            <g key={key} className={key}>
              {pts.length > 1 ? <path d={smooth(pts)} fill="none" strokeWidth="1.6" strokeLinecap="round" strokeOpacity={key === "ig" ? 1 : 0.7} /> : null}
              {s.map((p, i) => {
                const [cx, cy] = pts[i], now = i === s.length - 1, cls = (p.net == null ? "flat" : p.net > 0 ? "up" : p.net < 0 ? "dn" : "flat") + (now ? " now" : "");
                return (
                  <g key={p.date}>
                    {p.net == null ? <circle className="x" cx={cx} cy={cy} r="2.2" strokeWidth=".8" strokeDasharray="1.2 1.4" fill="none" /> : <circle cx={cx} cy={cy} r={now ? 3.2 : 2.6} fillOpacity={key === "ig" ? 1 : 0.8} />}
                    <text className={cls} x={cx} y={((key === "ig" ? IGY : FBY) + RH / 2 + FS * 0.35).toFixed(1)} textAnchor="middle" fontSize={FS}>{p.net == null ? "–" : signed(p.net)}</text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </button>
  );
}
