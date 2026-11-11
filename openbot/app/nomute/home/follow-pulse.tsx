// 홈 맨 위 팔로워 띠(형 10-31 09:5x 「웹에 보면 인스타 맨 위에 뜨는거 있잖아 에디터.노뮤트케이알 … 그거를 지금 웹앱 맨 상단에 나오게했으면 좋겠음. 애들 접수사항은 어짜피 다른데서 볼 수 있으니까」)
//   원본 = 에디터 첫 화면 #home-pulse(modern-home.js 885~990 · 운영자 261022 «카드 위에 인스타 팔로워 현재 수 · 메타 앱으로 자주 들어가서 확인») — 같은 데이터·같은 셈·같은 그림을 React+svg 로(그래프 라이브러리 0)
//   데이터 = `/api/chan?f=ig` → 안 되면 `/insta_data.json` · FB = `/api/chan?f=fb` → `/fb_data.json`(원본 get() 차례 그대로 · 같은 출처 edit.nomute.kr · 쿠키 그대로 · Access 벽 안 · read.ts 가 "/" 를 same-origin 으로 받는 것과 같은 길)
//   꼴 = IG · FB 총수 한 줄 + 「갱신 N분 전」 + 10일 증가율(%) 꺾은선 둘(IG 위 선 · FB 아래 선 · 0% 점선) + 날마다 ±명수 두 줄(IG 위 · FB 아래) · 색 = 오름 강조색 · 내림 금색 · 없음 회색(원본 규칙)
//   누르면 = 채널 요약(원본 «일단 홈 팔로워로» → 우리 앱은 앱 안 채널 요약 판 #/chan · 11-01 전엔 #/web?u=/?tab=chan 한 겹) · 10분마다 다시 읽음(원본과 같음) · 접수사항(CheckOne)은 이 자리에서 뺌(파일은 그대로 · 안 부름)
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { pollOff } from "../data/poll-linux";

type Row = { date: string; follower_net?: number | null; follows?: number | null; unfollows?: number | null; views?: number | null };   // views = 그날 노출(조회 · insta_data.json daily_series)
type Chan = { profile: { followers_count: number }; generated_kst: string; daily_series?: Row[] };
type Pt = { date: string; net: number | null; count: number; pct: number; views?: number | null };
const DAYS = 10, nf = new Intl.NumberFormat("ko-KR");
const kstDay = () => new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10);
const signed = (v: number) => (v > 0 ? "+" : v < 0 ? "−" : "") + nf.format(Math.abs(v));
/** 칸(P) 안에 안 들어가는 수 = 짧게(1.2k · 12k) · 글자 폭 ≈ 0.6em(숫자 고정폭) · 굵은 오늘 칸은 조금 더 넓게 셈 */
const mfmt = (n: number) => (n / 1e6).toFixed(n >= 1e6 ? 1 : 2) + "M";   // 노출 = M 단위(52,334 → 0.05M · 형 11-08 09:09 「그래프에 0.1M M단위로 나오게할거야 1M 단ㅇ위가 안되면 문제가 있는거임」)
const fit = (v: number, room: number, fs: number, bold: boolean) => {
  const full = signed(v);
  if (full.length * fs * (bold ? 0.66 : 0.6) <= room || Math.abs(v) < 1000) return full;
  const a = Math.abs(v), k = a >= 1e4 ? Math.round(a / 1e3) + "k" : (Math.round(a / 100) / 10).toString().replace(/\.0$/, "") + "k";
  return (v > 0 ? "+" : "−") + k;
};
const NET = {
  ig: (r: Row) => (r.follower_net != null ? r.follower_net : r.follows != null && r.unfollows != null ? r.follows - r.unfollows : null),
  fb: (r: Row) => (r.follower_net != null ? r.follower_net : r.follows != null ? r.follows : null),
};

async function get(key: "ig" | "fb" | "th", file: string): Promise<Chan | null> {
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

/** FB `follows` 가 그날 새 팔로우가 아니라 그날 끝 총수인 판(fb_data.json 실물 11-05 = 7,193 · 7,192 · 7,243 … · 총수 7,242)이면 = 앞날과의 차이가 그날 ±명
 *  (형 사진 「모바일 버전 해결점」 = FB 줄에 +7,192 +7,243 … 총수가 ±로 찍혀 칸끼리 붙었음) · 반 넘는 날이 총수의 절반을 넘으면 총수 판으로 봄 · follower_net 있는 날은 그 값 그대로 */
function netsOf(all: Row[], key: "ig" | "fb", total: number): (number | null)[] {
  const raw = all.map(NET[key]);
  if (key !== "fb" || total < 100) return raw;
  const fol = all.filter((r) => r.follower_net == null && r.follows != null).map((r) => r.follows as number);
  if (!fol.length || fol.filter((v) => v > total / 2).length * 2 <= fol.length) return raw;
  return all.map((r, i) => {
    if (r.follower_net != null) return r.follower_net;
    const a = i ? all[i - 1].follows : null, b = r.follows;
    return a != null && b != null ? b - a : null;
  });
}

/** 원본 series() 그대로 — 지난 DAYS 일(오늘 제외) · count = 그날 끝 팔로워 · pct = 창 시작 대비 % */
function series(j: Chan, key: "ig" | "fb"): Pt[] {
  const today = kstDay(), all = (j.daily_series || []).filter((r) => r && r.date), netAll = netsOf(all, key, j.profile.followers_count);
  const ti = all.findIndex((r) => r.date === today), idx = all.map((r, i) => (r.date < today ? i : -1)).filter((i) => i >= 0).slice(-DAYS);
  const days = idx.map((i) => all[i]), nets = idx.map((i) => netAll[i]);
  let c = j.profile.followers_count - ((ti >= 0 && netAll[ti]) || 0);
  const counts: number[] = [];
  for (let k = days.length - 1; k >= 0; k--) { counts[k] = c; c -= nets[k] || 0; }
  const base = c > 0 ? c : counts[0] || 1;
  return days.map((r, k) => ({ date: r.date, net: nets[k], count: counts[k], pct: ((counts[k] - base) / base) * 100, views: typeof r.views === "number" ? r.views : null }));
}

const ago = (iso: string) => { const t = Date.parse(iso); if (!Number.isFinite(t)) return ""; const m = Math.max(0, Math.floor((Date.now() - t) / 6e4)); return "갱신 " + (m < 1 ? "방금" : m < 60 ? `${m}분 전` : `${Math.floor(m / 60)}시간 전`); };
const smooth = (pts: [number, number][]) => pts.map((p, i) => { if (!i) return `M${p[0].toFixed(1)} ${p[1].toFixed(1)}`; const a = pts[i - 1], m = (a[0] + p[0]) / 2; return `C${m.toFixed(1)} ${a[1].toFixed(1)} ${m.toFixed(1)} ${p[1].toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`; }).join("");

// 폰 홈 그림 높이(형 11-11 18:48 봄 1:1 「상단에 차트 좀만 더 영역 세로가 길어도 될듯 카드가 좀 더 내려와도 될거같아 길어지고」 · 옛 웹앱 홈 #home-pulse 폰 390 실측 = 선 칸 ≈ 40px · 앞 판 64 = 선 칸 ≈ 20px 이라 납작)
//   + 스레드 총수 폰에도(형 18:48 「스레드도 나와도 될거같아. 팔로워수가 좀 적어져도. 여기 그 웹앱 뷰랑 동일하면 좋을듯」) · 「갱신」 말 뺀 「N시간 전」 = 숫자 줄 오른쪽 끝(형 18:51 「갱신 0시간전은 위치가 애매하면 그냥 0시간 전 이라는 말만 팔로워랑 수평맞춰서 우측 끝으로 더 조그마하게」 「마진은 유지」)
const PH = 108;
export function FollowPulse({ fill = false }: { fill?: boolean } = {}) {   // fill = 칸 높이를 다 씀(PC 오른쪽 위 · ../ui/igfb-band.tsx · 봄 11-08 · 형 07:31 「휴대폰 메인화면에 출력되어있던 차트를 알맞은 크기로」)
  const [ig, setIg] = useState<Chan | null>(null), [fb, setFb] = useState<Chan | null>(null), [th, setTh] = useState<Chan | null>(null), [, tick] = useState(0), [tried, setTried] = useState(false);   // tried = 첫 받기 끝(그 전엔 자리만 잡음)
  // 그림 폭 = 화면 실제 폭(형 10-31 「이거 위에 찌그러지는거 좀 수정해줄래?」 · 300칸을 가로로 늘려서 글자·점이 찌그러졌음)
  const [wide, setWide] = useState(300), [tall, setTall] = useState(64), [gcy, setGcy] = useState(0), seen = useRef<ResizeObserver | null>(null);   // gcy = 왼쪽 러너 게이지 가운데 y(이 그림 위 끝에서 · PC 칸만)
  const chart = useCallback((el: SVGSVGElement | null) => {
    seen.current?.disconnect();
    if (!el) return;
    seen.current = new ResizeObserver(([e]) => { const w = Math.round(e.contentRect.width), h = Math.round(e.contentRect.height); if (w > 0) setWide(w); if (fill && h > 0) setTall(Math.max(64, h));
      // 노출 평균 선 = 러너 게이지 가운데와 한 줄(형 11-08 09:49 「게이지 위치를 차의 노출평균 선이랑 맞춤」 · 시아 10:05 「고정 숫자 말고 같은 줄에 묶어야 화면마다 맞음」) · 게이지 viewBox 0 8 132 104 · 가운데 CY 62(runner/tick-gauge.tsx)
      if (fill) { const g = document.querySelector(".nm-split-top-l .nm-rg-gauge")?.getBoundingClientRect(); if (g && g.height > 0) setGcy(Math.round(g.top + ((62 - 8) * g.height) / 104 - el.getBoundingClientRect().top)); } });
    seen.current.observe(el);
  }, [fill]);
  useEffect(() => {
    let live = true;
    const load = () => Promise.all([get("ig", "insta_data.json"), get("fb", "fb_data.json"), get("th", "threads_data.json")]).then(([a, b, c]) => { if (!live) return; if (a) setIg(a); setFb(b); setTh(c); }).catch(() => {}).finally(() => { if (live) setTried(true); });
    load();
    const t1 = window.setInterval(() => { if (!pollOff()) load(); }, 10 * 60e3), t2 = window.setInterval(() => tick((n) => n + 1), 60e3);   // 10분 다시 읽기 · 1분 「갱신 N분 전」
    return () => { live = false; clearInterval(t1); clearInterval(t2); };
  }, [fill]);
  const view = useMemo(() => {
    if (!ig) return null;
    const W = wide, H = fill ? tall : PH, P = W / DAYS, FS = 9.5, RH = FS + 6, RG = 3, LOW = H - RH, HIGH = LOW - RG - RH;
    // ± 두 줄 차례: 폰 홈 = IG 위 · FB 아래 / PC 칸(fill) = FB 위 · IG 아래(형 11-08 08:51 「인스타를 아래로 깔아. 그래야 눈에 들어올듯. 페북이 위로」 · 「차트는 그대로인데, 2행<>1행 뒤바ㅣ꾸고」)
    // PC 칸(fill) = 차트와 ± 줄 사이를 더 띄움(10 · 폰 6) · 칸 자체도 아래로 5px 늘림(igfb-band.css) = 차트는 그대로 · 줄만 내려옴(형 11-08 09:00 dm-fast 「차트는 그대로두고 2행 라인을 차트로 부터 조금만 간격을 더 둬서 아래로 내려와 … 아래로 딱 붙으면안됨」 · 「둘사이는 그대로 두고.」)
    const IGY = fill ? LOW : HIGH, FBY = fill ? HIGH : LOW, TOP = 4, BOT = HIGH - (fill ? 17 : 6);   // PC 칸 = 차트 끝 ↔ ± 줄 17(형 10:06 사진 「빨갛게 표시한 저붑부분의 간격을 좀 넓혀달라는뜻. 아래 글자 행이 좀 더 아래로 조금만」 · 칸은 +12 로 늘림 = 차트 그대로)
    const lines: ["ig" | "fb", Pt[]][] = [["ig", series(ig, "ig")], ...(fb ? [["fb", series(fb, "fb")] as ["fb", Pt[]]] : [])];
    const all = lines.flatMap(([, s]) => s.map((p) => p.pct));
    const span = Math.max(0.5, ...all.map(Math.abs)), lo = Math.min(0, ...all), hi = Math.max(0, ...all);
    const top = hi - lo < span * 0.1 ? hi + span * 0.05 : hi, bot = hi - lo < span * 0.1 ? lo - span * 0.05 : lo;
    const Y = (v: number) => BOT - ((v - bot) / (top - bot || 1)) * (BOT - TOP);
    // 인스타 일일 노출 = 시안 꺾은선(PC 칸만) · 평균이 차트 높이 가운데 · 왼쪽 가운데에 「평균 0.05M · N일」(형 11-08 08:54 「일일 노출도도 표기되게 해줘 시안으로」 · 08:55 「인스타만 보이면돼」 · 09:09 「숫자로 나오는게 아니라 그래프로」 · 「차트 높이의 중앙 좌측에 노출수 평균이 나오게하고」 · 09:10 「그걸 기준해서 그래프만 꺽은선으로 ㅗ게하면됨. 아래에 숫자는 필요없어」 · 09:11 「1M을 목표로간다」)
    const vv = lines[0][1].map((p) => p.views).filter((v): v is number => v != null), vavg = vv.length ? vv.reduce((a, b) => a + b, 0) / vv.length : 0;
    const vspan = Math.max(1, ...vv.map((v) => Math.abs(v - vavg))), MID = fill && gcy > TOP + 8 && gcy < BOT - 8 ? gcy : (TOP + BOT) / 2, VY = (v: number) => MID - ((v - vavg) / vspan) * Math.min(MID - TOP, BOT - MID);   // 가운데가 게이지 줄로 옮겨져도 선이 칸 밖으로 안 나감
    return { W, H, P, FS, RH, FBY, IGY, MID, Y, VY, vv, vavg, lines };
  }, [ig, fb, wide, tall, fill, gcy]);
  if (!tried && !ig) return <div className="nm-pulse-wait" aria-hidden />;   // 받는 동안 = 띠 높이만큼 자리만(형 11-03 12:45 「첨에 위로 버튼이 보였다가 내려가」 = 띠가 늦게 생기며 아래 칸이 밀렸음)
  if (!ig || !view) return null;   // 못 읽으면 자리 비움(홈이 그 자리만큼 올라옴)
  const { W, H, P, FS, RH, FBY, IGY, MID, Y, VY, vv, vavg, lines } = view;
  const go = () => { window.location.hash = "#/chan"; };   // 원본 = 채널 요약로 → 앱 안 채널 요약 판(봄 11-01 · 형 「눌렀을때 웹으로 연결된 부분이 많아서 불편했어..」)
  return (
    <button type="button" className={`nm-pulse${fill ? " nm-pulse-fill" : ""}`} aria-label="팔로워 — 누르면 채널 요약" onClick={go}>
      <div className="nm-pulse-row">
        <span className="nm-pulse-k ig">IG</span><b className="nm-pulse-v">{nf.format(ig.profile.followers_count)}</b>
        <i className="nm-pulse-sep" aria-hidden />
        <span className="nm-pulse-k fb">FB</span><b className="nm-pulse-v">{fb ? nf.format(fb.profile.followers_count) : "–"}</b>
        <i className="nm-pulse-sep" aria-hidden /><span className="nm-pulse-k th">TH</span><b className="nm-pulse-v">{th ? nf.format(th.profile.followers_count) : "–"}</b>   {/* PC 칸 = 스레드 총수 하나 더(형 11-08 09:11 「저기 fB 옆에구분자 하나 더 둬서 스레드도 나오게해, FB가 시안으로 표기되고 th 는 fb 색으로」 · 자료 = /api/chan?f=th → threads_data.json) */}
        <span className="nm-pulse-at">{ago(ig.generated_kst).replace(/^갱신 /, "")}</span>   {/* PC 칸(fill) = 머리줄 오른쪽 「N시간 전」(Runner 칸과 같은 말 · 같은 자리 · 형 11-08 08:18) */}
      </div>
      <svg ref={chart} className="nm-pulse-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`최근 ${DAYS}일 팔로워 증가율`}>
        <defs><linearGradient id="nm-pulse-fade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopOpacity="0" /><stop offset=".25" stopOpacity="1" /><stop offset=".75" stopOpacity="1" /><stop offset="1" stopOpacity="0" /></linearGradient></defs>
        <rect className="nm-pulse-rowbg" x="0" y={IGY} width={W} height={RH} fill="url(#nm-pulse-fade)" />
        {fill && fb ? <rect className="nm-pulse-rowbg fb" x="0" y={FBY} width={W} height={RH} /> : null}
        {fill && vv.length ? (() => { const s = lines[0][1], off = (DAYS - s.length) * P, vp = s.map((p, i) => (p.views == null ? null : ([off + i * P + P / 2, VY(p.views)] as [number, number]))).filter((x): x is [number, number] => x != null); return (
          <g className="vw" aria-label={`인스타 일일 노출 · 평균 ${nf.format(Math.round(vavg))}`}>
            <line className="vavg" x1="0" x2={W} y1={MID.toFixed(1)} y2={MID.toFixed(1)} strokeWidth="1" />
            <text className="vlab" x={W - 3} y={(MID - 4).toFixed(1)} textAnchor="end" fontSize={FS}>{mfmt(vavg)}</text>   {/* 형 10:05 「노출평균 이거 없어도 됨. 설명 없어도되고 그냥 끝점 ---- 살짝 위에 0.9M 이렇게 00M만 나오면됨」 = 평균 점선 오른쪽 끝 살짝 위 · M 숫자만 */}
            {vp.length > 1 ? <path d={smooth(vp)} fill="none" strokeWidth="1.5" strokeLinecap="round" /> : null}
            {vp.map(([cx, cy], i) => <circle key={i} cx={cx.toFixed(1)} cy={cy.toFixed(1)} r={i === vp.length - 1 ? 2.4 : 1.8} />)}
          </g>); })() : null}   {/* 노출 꺾은선 = 팔로워 선 뒤(먼저 그림) · 평균 = 가운데 점선 */}
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
                    <text className={cls} x={cx} y={((key === "ig" ? IGY : FBY) + RH / 2 + FS * 0.35).toFixed(1)} textAnchor="middle" fontSize={FS}>{p.net == null ? "–" : fit(p.net, P - 4, FS, now)}</text>
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
