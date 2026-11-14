// 서랍 「채널 요약」(서랍 차례 ② · 윈터 10:12) — 에디터 넷째 탭 「채널 요약」(viewer/index.html loadChan 16842 · renderChan 17168 · 수백 줄: 타일·인구통계·차트·최근 게시물·결과 함께)을 통째 옮기지 않고
//   「한눈 요약」 한 장만 네이티브로: 소스(IG · FB · TH) · 팔로워(+창 신규) · 조회·도달·게시·상호작용 일평균(7일) · (AI 요약 뺌 · 형 10-31 「끄자!」 · 지표만) · 옛 AI 요약(chan_brief 총론 또는 첫 기간 · 「→」 줄 = 클로신의 제안) · 수집 시각 · 「전체 보기」= 원본 화면(#/web?u=/?tab=chan)
//   데이터 = 원본 chanGet 차례 그대로: `/api/chan?f=ig|fb|th` → 안 되면 `/insta_data.json`·`/fb_data.json`·`/threads_data.json`(유효 판별 키 = generated_kst / updated · HTML 응답 = 건너뜀) · 같은 출처라 쿠키 그대로
//   셈 = 원본 winAvg(마지막 실측일 앵커 · 결측 제외 · 7일 창) · winSum('follows' · 스레드 = follower_net) · 지표 사전 = CH_MET(ig·fb) / CH_MET_TH(th) 16233줄 · 5분 TTL 은 react-query 가 맡음
//   채널 전체(서랍 「채널 전체」 · full) = 에디터 /?tab=chan 통째 대신 조각으로 옮김(형 11-01 17:4x 「시아 도와가지구, 좀 더 많은게 들어올수잇게」 · 시아 2차 안 · 빠르 몫)
//     1조각 = 일일 추이(원본 39-chLiftChart 869줄 · 지표 칩 + 7·30·90일·전체 + 선 그래프 + 최근일 값) · 최근 게시물(936줄 · thumbs 12칸 · 릴스 ▶ · 조회수 = posts[permalink] · 경과 = iso+date_kst 시각 · relAge 사다리)
//     2조각 = TOP 게시물(926줄 · 최신 게시일 앵커 기간 · 같은 포맷 중앙값 대비 ×배수 순 · 조회 = views 없으면 eng) · 인구통계(776줄 audience_sample · 성별 남:여 정규화 · 나이 age_full 상위 4 · 도시·나라 상위 4 · 이어 쓴 값 = 「M/D 기준」)
//     3조각 = 잘 되는 조건 · 시간대별 반응(봄 · ./chan-charts.tsx)
//     4조각 = 주제별 반응(원본 884줄 · topics / topics_90d · 「기타」 뺌 · 표본 5개 미만 = 「표본부족」 맨 뒤 · 막대 = 조회 중앙값 · 믿을 칸 평균 대비 ×배수 · 위 둘 강조 · 90일 창 = signals.win_90d 있을 때만)
//     결과 함께 = 앱 안(./gyeol.tsx · 형 11-10 14:23 「응 밖에잇는거 다 옮길거야」 · 앞 판 = 형 11-01 「그건 내가 따로얘기할게」로 맨 아래 「나머지는 에디터에서」 한 단추 · 이제 뺌)
//     「지금 새로 수집 ↻」 = 앱 안(/api/chanretry?src= · 원본 CHANF · ./fresh-btn.tsx · 형 11-10 12:40 「봄 노는 작업실 있으면 에디터도 정원에 완벽하게 녹여」 · team-4 U3 뎅)
import "./yeta-settings.css";
import "./chan.css";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChanCharts } from "./chan-charts";
import { Pane } from "./pane";
import { YICO } from "./yeta-icons";
import { FreshBtn } from "./fresh-btn";
import { GyeolBoard } from "./gyeol";
import { sharedText } from "./news-data";   // 3초 안 같은 주소 = 한 번만(빠르 11-14)

type Row = Record<string, number | null | undefined> & { date: string };
type Thumb = { th?: string; u?: string; t?: string; r?: boolean };
type Post = { permalink?: string; views?: number | null; eng?: number | null; iso?: string; date_kst?: string; format?: string; name?: string };
type Pct = { k?: string; pct?: number | string };
type Aud = { gender?: { M?: number; F?: number; M_norm?: number; F_norm?: number }; age_full?: Pct[]; age_gender_top?: Pct[]; city_top?: Pct[]; country_top?: Pct[]; carried_kst?: string; as_of?: string };
type Chan = { profile?: { followers_count?: number | null; username?: string; name?: string }; generated_kst?: string; daily_series?: Row[]; src?: string; avg?: Record<string, { avg_7d?: number }>; thumbs?: Thumb[]; posts?: Post[]; posts_view_avg?: number; audience_sample?: Aud; topics?: Record<string, Topic>; topics_90d?: Record<string, Topic>; signals?: { win_90d?: { n?: number; from?: string; to?: string }; axes_90d?: unknown; n_posts?: number } };
type Topic = { n?: number; views_med?: number };
type Src = "ig" | "fb" | "th";
const SRC: { id: Src; t: string; file: string }[] = [
  { id: "ig", t: "인스타", file: "insta_data.json" },
  { id: "fb", t: "페이스북", file: "fb_data.json" },
  { id: "th", t: "스레드", file: "threads_data.json" },
];
const MET: Record<Src, [string, string, string][]> = {   // [키, 라벨, 단위] = 원본 CH_MET·CH_MET_TH 어휘(일평균 타일 넷)
  ig: [["views", "조회수", "회"], ["reach", "도달", "계정"], ["posts", "게시", "개"], ["interactions", "상호작용", "회"]],
  fb: [["views", "조회수", "회"], ["reach", "도달", "계정"], ["posts", "게시", "개"], ["interactions", "상호작용", "회"]],
  th: [["views", "조회수", "회"], ["likes", "좋아요", "회"], ["replies", "답글", "회"], ["reposts", "리포스트", "회"]],
};
const WIN = 7;
const fmtK = (n: number) => (n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e4 ? (n / 1e3).toFixed(0) + "K" : Math.round(n).toLocaleString("ko-KR"));
const rnd = (x: number) => (x >= 100 ? Math.round(x) : Math.round(x * 10) / 10);
const k12 = (iso?: string) => { const t = iso ? Date.parse(iso) : NaN; if (!Number.isFinite(t)) return ""; const d = new Date(t + 9 * 36e5); const h = d.getUTCHours(), m = String(d.getUTCMinutes()).padStart(2, "0"); return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${h % 12 || 12}:${m}${h < 12 ? "AM" : "PM"}`; };

async function getJ<T>(key: string, file: string, ok: string): Promise<T | null> {
  for (const u of [`/api/chan?f=${key}`, `/${file}`]) {   // 3초 안 같은 주소 = 한 번만(사무실 숫자 칸과 같이 뜸 · 빠르 11-14 · 새로 받기 = no-store)
    try {
      const r = await sharedText(u, { signal: AbortSignal.timeout(12000) });
      if (r.status < 200 || r.status >= 300) continue;
      const t = r.text; if (/^\s*</.test(t)) continue;
      const j = JSON.parse(t) as Record<string, unknown>; if (!j || !j[ok]) continue;
      return j as T;
    } catch { /* 다음 길 */ }
  }
  return null;
}
/** 원본 winAvg — 마지막 실측일을 앵커로 WIN 일 평균(결측 제외) */
function winAvg(series: Row[], key: string) {
  let end = -1; for (let i = series.length - 1; i >= 0; i--) if (series[i][key] != null) { end = i; break; }
  if (end < 0) return null;
  let sum = 0, n = 0; for (let i = end; i > end - WIN && i >= 0; i--) { const v = series[i][key]; if (v != null) { sum += v; n++; } }
  return n ? sum / n : null;
}
function winSum(series: Row[], key: string) {
  let end = -1; for (let i = series.length - 1; i >= 0; i--) if (series[i][key] != null) { end = i; break; }
  if (end < 0) return null;
  let t = 0, has = false; for (let i = end; i > end - WIN && i >= 0; i--) { const v = series[i][key]; if (v != null) { t += v; has = true; } }
  return has ? t : null;
}
const RANGES = [["7", "7일"], ["30", "30일"], ["90", "90일"], ["all", "전체"]] as const;
type Range = (typeof RANGES)[number][0];
/** 원본 _thAgeH — iso 날짜 + date_kst 「N시」로 KST 앵커(시각 없으면 정오) → 경과 시간 */
const ageH = (p?: Post) => {
  const s = String(p?.iso || ""); if (!s) return NaN;
  const hh = (String(p?.date_kst || "").match(/(\d{1,2})\s*시/) || [])[1];
  const t = new Date(/T/.test(s) ? s : `${s.slice(0, 10)}T${String(hh == null ? 12 : hh).padStart(2, "0")}:00:00+09:00`).getTime();
  return Number.isFinite(t) ? (Date.now() - t) / 3600e3 : NaN;
};
/** 원본 relAge 사다리(방금 · 30분 전 · N시간 전 · N일 전 · N주일 전 · …) */
const relAge = (h: number) => {
  if (!Number.isFinite(h) || h < 0 || h >= 9000) return "";
  if (h * 60 < 30) return "방금"; if (h < 1) return "30분 전"; if (h < 24) return `${Math.floor(h)}시간 전`;
  const d = Math.floor(h / 24); if (d < 7) return `${d}일 전`; if (d < 30) return `${Math.floor(d / 7)}주일 전`; if (d < 365) return `${Math.floor(d / 30)}달 전`; return `${Math.floor(d / 365)}년 전`;
};
const webOf = (u: string) => "#/web?u=" + encodeURIComponent(u);
const mv = (x: Post) => (x.views != null ? x.views : x.eng != null ? x.eng : null);   // 원본 _mv = views(IG) 없으면 eng(FB 반응)
const vwR = (n: number | null) => (n == null ? "—" : n >= 1e8 ? `${(n / 1e8).toFixed(1).replace(/\.0$/, "")}억` : n >= 1e4 ? `${Math.round(n / 1e4)}만` : String(Math.round(n)));   // 원본 chVwR
/** 원본 TOP 게시물 — 최신 게시일 앵커로 기간 거름 · 포맷별(릴스끼리·포스트끼리) 중앙값 대비 ×배수 내림차순 · 동률 = 지표 순 · 다섯 */
function topPosts(all: Post[], avgV: number | undefined, r: Range) {
  const anc = all.reduce((m, x) => { const i = String(x.iso || "").slice(0, 10); return i > m ? i : m; }, "");
  let cut = ""; if (r !== "all" && anc) { const dt = new Date(`${anc}T00:00:00Z`); dt.setUTCDate(dt.getUTCDate() - (Number(r) - 1)); cut = dt.toISOString().slice(0, 10); }
  const pf = cut ? all.filter((x) => String(x.iso || "") >= cut) : all;
  const mix = avgV || (all.length ? all.reduce((t, x) => t + (mv(x) || 0), 0) / all.length : 0);
  const med = (reel: boolean) => { const v = pf.filter((x) => (x.format === "릴스") === reel).map((x) => mv(x) || 0).sort((a, b) => a - b); if (!v.length) return 0; const h = v.length >> 1; return v.length % 2 ? v[h] : (v[h - 1] + v[h]) / 2; };
  const mR = med(true), mP = med(false), dev = (x: Post) => { const b = (x.format === "릴스" ? mR : mP) || mix, v = mv(x); return b > 0 && v ? v / b : 0; };
  return pf.slice().sort((a, b) => dev(b) - dev(a) || (mv(b) || 0) - (mv(a) || 0)).slice(0, 5).map((x) => ({ x, dev: dev(x) }));
}
const KCITY: Record<string, string> = { Seoul: "서울", Busan: "부산", Incheon: "인천", Daegu: "대구", Daejeon: "대전", Gwangju: "광주", Ulsan: "울산", Sejong: "세종", Suwon: "수원", Yongin: "용인", Hwaseong: "화성", Goyang: "고양", Changwon: "창원", Seongnam: "성남", Cheongju: "청주", Cheonan: "천안", Jeonju: "전주", Gimhae: "김해", Pohang: "포항", Jeju: "제주", Paju: "파주", Pyeongtaek: "평택", Anyang: "안양", Bucheon: "부천", Namyangju: "남양주", Ansan: "안산" };
const cityLab = (k?: string) => { const c = String(k || "").split(",")[0].trim(); return KCITY[c] || c; };
const ctryLab = (k?: string) => { const c = String(k || "").trim(); try { return new Intl.DisplayNames(["ko"], { type: "region" }).of(c) || c; } catch { return c; } };
/** 원본 demoTile — 성별 = 남:여 정규화(미지정 뺌) · 나이 = age_full 상위 4(없으면 age_gender_top 합산) · 지역 = city_top·country_top 상위 4 */
function demo(a?: Aud) {
  if (!a) return null;
  const G = a.gender, gN = G ? { M: G.M_norm != null ? +G.M_norm : (G.M || 0) + (G.F || 0) ? ((G.M || 0) / ((G.M || 0) + (G.F || 0))) * 100 : 0, F: G.F_norm != null ? +G.F_norm : (G.M || 0) + (G.F || 0) ? ((G.F || 0) / ((G.M || 0) + (G.F || 0))) * 100 : 0 } : null;
  let age: { lb: string; pct: number }[] = [];
  if (Array.isArray(a.age_full) && a.age_full.length) age = a.age_full.slice(0, 4).map((x) => ({ lb: String(x.k), pct: +(x.pct || 0) }));
  else { const am: Record<string, number> = {}; (a.age_gender_top || []).forEach((x) => { const m = /^(.+?)·[MFU]$/.exec(String(x.k || "")); if (m) am[m[1]] = (am[m[1]] || 0) + +(x.pct || 0); }); age = Object.keys(am).sort((p, q) => am[q] - am[p]).slice(0, 4).map((k) => ({ lb: k, pct: am[k] })); }
  const city = (a.city_top || []).slice(0, 4).map((x) => ({ lb: cityLab(x.k), pct: +(x.pct || 0) })), ctry = (a.country_top || []).slice(0, 4).map((x) => ({ lb: ctryLab(x.k), pct: +(x.pct || 0) }));
  return gN || age.length || city.length || ctry.length ? { gN, age, city, ctry, carried: a.carried_kst } : null;
}
const Bars = ({ t, rows }: { t: string; rows: { lb: string; pct: number }[] }) => (rows.length ? (
  <div className="nm-chan-bars"><span className="t">{t}</span>{rows.map((r) => <div key={r.lb} className="row"><span className="lb">{r.lb}</span><span className="bar"><i style={{ width: `${Math.max(2, Math.min(100, r.pct))}%` }} /></span><span className="v">{r.pct.toFixed(1)}%</span></div>)}</div>
) : null);

/** 일일 추이 = 고른 지표의 기간 선 그래프(원본 chChart 의 간단판 · 결측 = 끊김 없이 건너뜀) */
function DailyChart({ series, metric, unit }: { series: Row[]; metric: string; unit: string }) {
  const pts = series.map((r, i) => ({ i, v: r[metric], d: r.date })).filter((x): x is { i: number; v: number; d: string } => typeof x.v === "number");
  if (pts.length < 2) return <p className="nm-chan-msg">이 기간엔 그릴 값이 모자라</p>;
  const W = 320, H = 120, L = 6, R = 6, T = 10, B = 18, lo = Math.min(...pts.map((p) => p.v)), hi = Math.max(...pts.map((p) => p.v)), span = hi - lo || 1, n = series.length - 1 || 1;
  const xy = pts.map((p) => [L + ((W - L - R) * p.i) / n, T + (H - T - B) * (1 - (p.v - lo) / span)] as const);
  const line = xy.map(([x, y], k) => `${k ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${xy[xy.length - 1][0].toFixed(1)} ${H - B} L${xy[0][0].toFixed(1)} ${H - B} Z`;
  const md = (d: string) => `${+d.slice(5, 7)}/${+d.slice(8, 10)}`, last = pts[pts.length - 1];
  return (
    <figure className="nm-chan-chart" aria-label={`${metric} 일일 추이`}>
      <div className="top"><b>{last.v.toLocaleString("ko-KR")}</b><span>{unit} · 최근일 {md(last.d)}</span><span className="rng">최고 {fmtK(hi)} · 최저 {fmtK(lo)}</span></div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img">
        <path d={area} className="ar" /><path d={line} className="ln" vectorEffect="non-scaling-stroke" />
        <circle cx={xy[xy.length - 1][0]} cy={xy[xy.length - 1][1]} r="3" className="pt" />
      </svg>
      <div className="ax"><span>{md(series[0].date)}</span><span>{md(series[series.length - 1].date)}</span></div>
    </figure>
  );
}

const signed = (v: number, u: string) => (v > 0 ? "+" : v < 0 ? "−" : "±") + Math.abs(v).toLocaleString("ko-KR") + u;

export function ChanModal({ full = false }: { full?: boolean }) {
  const [gyOn, setGyOn] = useState(false);   // 「결과 함께」 칩(채널 전체만 · ./gyeol.tsx · 형 11-10 14:23 「응 밖에잇는거 다 옮길거야」)
  const [src, setSrc] = useState<Src>("ig"), [met, setMet] = useState("views"), [range, setRange] = useState<Range>("30"), [tpr, setTpr] = useState<Range>("7"), [rr, setRr] = useState<"90" | "all">("90");
  const q = useQuery({
    queryKey: ["nomute", "chan-brief"], staleTime: 300_000, refetchInterval: 300_000,   // 원본 TTL 5분
    queryFn: async () => {
      const [ig, fb, th] = await Promise.all([
        getJ<Chan>("ig", "insta_data.json", "generated_kst"), getJ<Chan>("fb", "fb_data.json", "generated_kst"), getJ<Chan>("th", "threads_data.json", "generated_kst"),
      ]);
      return { ig, fb, th };
    },
  });
  const Svg = ({ k }: { k: keyof typeof YICO }) => <span aria-hidden dangerouslySetInnerHTML={{ __html: YICO[k] }} />;
  const go = () => { window.location.hash = "#/chanfull"; };   // 「전체 보기」 = 앱 안 채널 전체(shell chanfull · 앞 판 = 에디터 /?tab=chan 한 겹)
  const d = q.data?.[src] ?? null;
  const have = SRC.filter((s) => q.data?.[s.id]);
  const series = (d?.daily_series || []).filter((r) => r && r.date);
  const flw = d?.profile?.followers_count, fsum = d ? winSum(series, src === "th" ? "follower_net" : "follows") : null;
  const mets = MET[src], m = mets.find((x) => x[0] === met) || mets[0], view = range === "all" ? series : series.slice(-Number(range));
  const rw = d?.signals?.win_90d, rrOk = !!(d?.topics_90d && d?.signals?.axes_90d && rw?.n), topics = (rrOk && rr === "90" ? d?.topics_90d : d?.topics) || {};
  const tok = (k: string) => (topics[k].n || 0) >= 5, tkeys = Object.keys(topics).filter((k) => k !== "기타" && (topics[k].n || 0) > 0).sort((x, y) => Number(tok(y)) - Number(tok(x)) || (topics[y].views_med || 0) - (topics[x].views_med || 0));
  const tsure = tkeys.filter(tok), tmax = tsure.length ? topics[tsure[0]].views_med || 1 : 1, tavg = tsure.length ? tsure.reduce((t, k) => t + (topics[k].views_med || 0), 0) / tsure.length : 0;
  const tops = full && d ? topPosts(d.posts || [], d.posts_view_avg, tpr) : [], dm = full ? demo(d?.audience_sample) : null;
  const postOf = new Map((d?.posts || []).filter((p) => p.permalink).map((p) => [String(p.permalink), p])), thumbs = (d?.thumbs || []).slice(0, 12);
  return (
    <Pane title={full ? "채널 전체" : "채널 요약"}>
      <div className="yeta-set mt-2">
        <div className="ycd-card card-left nm-chan">
          <span className="ycd-nm yset-ttl"><Svg k="data" />{full ? "채널 전체" : "채널 요약"}{d?.generated_kst ? <i className="nm-chan-at">{k12(d.generated_kst)}</i> : null}</span>
          {d?.generated_kst ? <i className="nm-chan-at nm-in-modal">{k12(d.generated_kst)} 기준</i> : null}
          {have.length > 1 || full ? <div className="yset-chips nm-chan-src" role="tablist">{have.map((s) => <button key={s.id} type="button" role="tab" aria-selected={!gyOn && src === s.id} className={`yset-chip${!gyOn && src === s.id ? " on" : ""}`} onClick={() => { setSrc(s.id); setGyOn(false); }}>{s.t}</button>)}{full ? <button type="button" role="tab" aria-selected={gyOn} className={`yset-chip${gyOn ? " on" : ""}`} onClick={() => setGyOn(true)}>결과 함께</button> : null}</div> : null}
          {full && gyOn ? <GyeolBoard /> : q.isLoading ? <p className="nm-chan-msg">채널 읽는 중…</p> : !d ? <p className="nm-chan-msg">{q.isError ? "채널 요약을 못 읽었어" : "이 소스는 지금 데이터가 없어"}</p> : (
            <>
              <div className="nm-chan-tiles">
                <div className="nm-chan-tile tall"><span className="k">팔로워</span><b>{flw != null ? flw.toLocaleString("ko-KR") : "—"}</b>{fsum != null ? <span className={`sub ${fsum > 0 ? "up" : fsum < 0 ? "dn" : ""}`}>{WIN}일 {signed(fsum, "명")}</span> : null}</div>
                {MET[src].map(([key, lb, u]) => { const a = winAvg(series, key); return <div key={key} className="nm-chan-tile"><span className="k">{lb}</span><b>{a == null ? "—" : fmtK(rnd(a))}<i>{u}/일</i></b><span className="sub">{WIN}일 평균</span></div>; })}
              </div>
              {full && series.length >= 2 ? (
                <section className="nm-chan-sec" aria-label="일일 추이">
                  <div className="yset-sec"><b>일일 추이</b>
                    <span className="nm-chan-seg" role="tablist">{RANGES.map(([k, t]) => <button key={k} type="button" role="tab" aria-selected={range === k} className={range === k ? "on" : ""} onClick={() => setRange(k)}>{t}</button>)}</span>
                  </div>
                  <div className="yset-chips nm-chan-mets">{mets.map(([k, lb]) => <button key={k} type="button" className={`yset-chip${m[0] === k ? " on" : ""}`} aria-pressed={m[0] === k} onClick={() => setMet(k)}>{lb}</button>)}</div>
                  <DailyChart series={view} metric={m[0]} unit={m[2]} />
                </section>
              ) : null}
              {full && thumbs.length ? (
                <section className="nm-chan-sec" aria-label="최근 게시물">
                  <div className="yset-sec"><b>최근 게시물</b></div>
                  <div className="nm-chan-grid">{thumbs.map((x, i) => { const p = postOf.get(String(x.u || "")), age = relAge(ageH(p)); return (
                    <a key={(x.u || "") + i} className={`nm-chan-th${x.th ? "" : " txt"}`} href={x.u ? webOf(x.u) : undefined} title={x.t || ""}>
                      {x.th ? <img loading="lazy" referrerPolicy="no-referrer" src={x.th} alt="" onError={(e) => { e.currentTarget.parentElement?.classList.add("txt"); e.currentTarget.remove(); }} /> : null}
                      <span className="cap">{x.t || ""}</span>
                      {x.r ? <i className="rl" aria-label="릴스">▶</i> : null}
                      {p && (p.views || age) ? <span className="meta">{p.views ? <span>{fmtK(p.views)}</span> : null}{age ? <span className={ageH(p) < 24 ? "fresh" : ""}>{age}</span> : null}</span> : null}
                    </a>
                  ); })}</div>
                </section>
              ) : null}
              {full && d ? <ChanCharts d={d} src={src} /> : null}   {/* 잘 되는 조건 · 시간대별 반응 = 봄 그래픽 손(./chan-charts.tsx · 그리는 몸 = 에디터 원본 줄 그대로) */}
              {full && tsure.length ? (
                <section className="nm-chan-sec" aria-label="주제별 반응">
                  <div className="yset-sec"><b>주제별 반응</b>
                    {rrOk ? <span className="nm-chan-seg" role="tablist">{([["90", "90일", `최근 90일 게시물 ${rw?.n || 0}개 안에서 비교`], ["all", "전체", `전 기간(표본 ${d?.signals?.n_posts || "—"}개)`]] as const).map(([k, t, tt]) => <button key={k} type="button" role="tab" title={tt} aria-selected={rr === k} className={rr === k ? "on" : ""} onClick={() => setRr(k)}>{t}</button>)}</span> : null}
                  </div>
                  <div className="nm-chan-bars topic">{tkeys.map((k, i) => { const v = topics[k], ok = tok(k); return (
                    <div key={k} className={`row${ok && i < 2 ? " top2" : ""}${ok ? "" : " few"}`}><span className="lb">{k}</span><span className="bar"><i style={{ width: `${Math.max(4, Math.min(100, Math.round(((v.views_med || 0) / tmax) * 100)))}%` }} /></span><span className="v">{vwR(v.views_med ?? null)} <b>({ok ? (tavg ? `×${((v.views_med || 0) / tavg).toFixed(1)}` : "—") : "표본부족"})</b></span></div>
                  ); })}</div>
                </section>
              ) : null}
              {full && tops.length ? (
                <section className="nm-chan-sec" aria-label="TOP 게시물">
                  <div className="yset-sec"><b>TOP 게시물</b>
                    <span className="nm-chan-seg" role="tablist">{RANGES.map(([k, t]) => <button key={k} type="button" role="tab" aria-selected={tpr === k} className={tpr === k ? "on" : ""} onClick={() => setTpr(k)}>{t}</button>)}</span>
                  </div>
                  <ol className="nm-chan-top">{tops.map(({ x, dev }, i) => { const rl = x.format === "릴스"; return (
                    <li key={(x.permalink || "") + i}><a href={x.permalink ? webOf(x.permalink) : undefined}>
                      <span className="rk">{i + 1}</span><span className={`fm ${rl ? "reels" : "post"}`}>{rl ? "릴스" : "포스트"}</span>
                      <span className="nm">{x.name || "(제목 없음)"}</span><span className={`dv ${rl ? "reels" : "post"}`}>{dev ? `×${dev.toFixed(1)}` : "—"}</span><span className="vw">{vwR(mv(x))}</span>
                    </a></li>
                  ); })}</ol>
                </section>
              ) : null}
              {dm ? (
                <section className="nm-chan-sec" aria-label="팔로워 구성">
                  <div className="yset-sec"><b>팔로워 구성</b>{dm.carried ? <i className="nm-chan-at">{k12(dm.carried)} 기준</i> : null}</div>
                  <div className="nm-chan-demo">
                    {dm.gN ? <div className="nm-chan-bars"><span className="t">성별</span><div className="gbar"><i className="m" style={{ width: `${dm.gN.M}%` }}>남 {dm.gN.M.toFixed(1)}%</i><i className="f" style={{ width: `${dm.gN.F}%` }}>여 {dm.gN.F.toFixed(1)}%</i></div></div> : null}
                    <Bars t="나이" rows={dm.age} /><Bars t="도시" rows={dm.city} /><Bars t="나라" rows={dm.ctry} />
                  </div>
                </section>
              ) : null}
            </>
          )}
          <div className="ypc-acts nm-chan-acts">{full && d && !gyOn ? <FreshBtn key={src} url={`/api/chanretry?src=${src}`} upd={String(d.generated_kst || "")} refetch={() => { void q.refetch(); }} noun="채널" /> : null}{full ? null : <button type="button" className="ypc-go" onClick={go}>전체 보기 <span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} /></button>}</div>
        </div>
      </div>
    </Pane>
  );
}
