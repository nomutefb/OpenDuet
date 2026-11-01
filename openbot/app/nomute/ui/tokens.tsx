// 서랍 「토큰」(형 11-01 「이런식으로 다 가져와주라」) — 에디터 토큰 사용량 화면(viewer/tokens.html)을 앱 네이티브로 · 전엔 에디터 화면을 통째로 품었음(shell FRAME.tokens)
//   데이터 = /token-usage.json(원본 ./token-usage.json = tokens.html 옆 = 같은 사이트 뿌리 · metrics-rollup.yml 2시간마다 집계) · 5분마다 다시 읽기(원본 setInterval 300000) · 못 받으면 「아직 없어」 글(원본 AGG=null)
//   규칙 = 원본 값 그대로: 창 6·12·24h(10분 버킷 = 시간당 6) · 분류 CATS · 소비처 이름 LABELS · 시간대 6구간(KST) · 진하기 5단(64·46·30·15) · 결론 한 줄 · 비중 <0.1% · 숫자 K
//   원본과 다른 점: 칸 첫 등장 움직임 0(원본도 도구 창 안에선 끔 · 운영자 10-25 「토큰 누를 때 처음에 애니메이션 안 떠도 됨」) · 뒤로·제목 = 앱 모달 머리
import "./yeta-settings.css";
import "./chan.css";
import "./ed-pages.css";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { type CSSProperties, type ReactNode, useState } from "react";
import { Pane } from "./pane";

type Use = { in?: number; out?: number };
type Bucket = { t?: string; iso?: string; by_src: Record<string, Use> };
type Agg = { as_of?: string; window_h?: number; buckets?: Bucket[]; totals?: { all?: Use; by_src?: Record<string, Use> }; labels?: Record<string, string> };

const fn = (n: number) => Number(n || 0).toLocaleString();
const fk = (n: number) => (n < 1000 ? String(n) : n < 10000 ? (n / 1000).toFixed(1) + "K" : Math.round(n / 1000) + "K");
const pc = (v: number, t: number) => { const p = t ? (v / t) * 100 : 0; return v && p < 0.1 ? "<0.1%" : (p < 10 ? p.toFixed(1) : Math.round(p)) + "%"; };
const HOURS_OPT = [6, 12, 24];   // 데이터 창 = 24h(token-usage.json window_h) — 더 긴 창은 같은 24h라 뺐다(원본)

// 소비처 이름 — shared/token_report.py SRC_LABEL 과 같은 말 + 거기 없는 것 · 모르는 건 원래 id 그대로(원본 LABELS)
const LABELS: Record<string, string> = { analyze: "기사 큐레이션", "analyze-repair": "요약 분량보강(큐레이션)", ask: "요약 요청", "ask-repair": "요약 분량보강(요청)",
  card: "카드 텍스트", "card-edit": "카드 수정", "card-cov": "카드 알맹이회수", revise: "요약 수정", "revise-cards": "카드 일괄수정",
  gate: "경중 채점", breaking: "속보 판정", autopick: "긴급 자동픽", recap: "긴급 되새김 검토", group: "사건 묶기",
  "chan-brief": "인스타 채널 요약", "fb-brief": "FB 채널 요약", "sns-sum": "SNS 트렌드 요약", covocr: "표지 제목 읽기",
  k: "영상 프롬프트", ly: "릴스 자막" };
// 분류 = 주제 묶음(행) — 못 찾으면 「기타」(원본 CATS)
const CATS: [string, string[]][] = [
  ["채널 분석", ["chan-brief", "fb-brief", "sns-brief", "bsky-brief", "sns-sum", "covocr", "fbcls"]],
  ["뉴스 판정", ["gate", "breaking", "brk", "group", "autopick", "recap", "pushdedup"]],
  ["요약·카드", ["analyze", "analyze-repair", "ask", "ask-repair", "askocr", "revise", "card", "card-edit", "card-cov", "revise-cards"]],
  ["영상·제작", ["k", "ly", "take", "sb", "nb-make", "tr", "track-cap", "genimg", "moreimg", "director", "teum", "bsky-tr"]],
];
const CAT_OF: Record<string, string> = {};
CATS.forEach(([c, l]) => l.forEach((s) => { CAT_OF[s] = c; }));
const catOf = (s: string) => CAT_OF[s] || (/^(ys-|song)/.test(s) ? "영상·제작" : "기타");
const BANDS: [string, number, number][] = [["새벽", 0, 6], ["오전", 6, 11], ["점심", 11, 14], ["오후", 14, 18], ["저녁", 18, 22], ["밤", 22, 24]];   // 에디터 SIG_ORD.hour_band 와 같은 경계(KST)
const bandOf = (h: number) => BANDS.findIndex(([, a, z]) => h >= a && h < z);
function kstHour(b: Bucket) {
  const d = new Date(b.iso || "");
  if (!Number.isNaN(+d)) return (d.getUTCHours() + 9) % 24;
  const m = /\s(\d{2}):/.exec(b.t || ""); return m ? +m[1] : 0;   // iso 없으면 t(「MM-DD HH:MM」 KST)
}
const tk = (a: Use) => (a.in || 0) + (a.out || 0);
function josa(w: string, a: string, b: string) { const c = w.charCodeAt(w.length - 1); return w + (c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 ? a : b); }
// G20 진하기 5단 — 값 / 가장 큰 칸 × 100 을 원본 문턱(64·46·30·15)에 대고 강조색 투명도로
const SHADE = (t: number) => (t > 64 ? 1 : t > 46 ? 0.72 : t > 30 ? 0.46 : t > 15 ? 0.28 : 0.14);

const tokQuery = queryOptions({
  queryKey: ["nomute", "token-usage"], staleTime: 0, refetchInterval: 300_000,
  queryFn: async (): Promise<Agg | null> => {   // 못 받으면 null(원본 catch → AGG=null) · HTML(앱 폴백) = 파일 없음
    try {
      const r = await fetch(`/token-usage.json?_=${Date.now()}`, { cache: "no-store", credentials: "same-origin" });
      if (!r.ok) return null;
      const t = await r.text();
      return /^\s*</.test(t) ? null : (JSON.parse(t) as Agg);
    } catch { return null; }
  },
});

/** 더 짧은 창 = 버킷을 뒤에서 자름(원본 withinWindow · 롤업은 window_h 로 구워짐) */
function withinWindow(agg: Agg, hours: number): Agg {
  if (!agg.buckets) return agg;
  if (hours >= (agg.window_h || 24)) return agg;
  const buckets = agg.buckets.slice(-Math.ceil(hours * 6));   // 10분 버킷 = 시간당 6
  const by: Record<string, { in: number; out: number }> = {}, all = { in: 0, out: 0 };
  for (const b of buckets) for (const [s, a] of Object.entries(b.by_src)) {
    by[s] = by[s] || { in: 0, out: 0 };
    for (const k of ["in", "out"] as const) { by[s][k] += a[k] || 0; all[k] += a[k] || 0; }
  }
  return { ...agg, window_h: hours, buckets, totals: { all, by_src: by } };
}

export function TokensModal() {
  const q = useQuery(tokQuery);
  const [hours, setHours] = useState(24);
  const AGG = q.data ?? null;
  const at = AGG && AGG.as_of ? AGG.as_of.slice(5, 16).replace("T", " ") + " 기준" : "";
  const seg = (
    <div className="tk-seg" role="group" aria-label="기간">
      {HOURS_OPT.map((h) => <button key={h} type="button" className={`num${h === hours ? " on" : ""}`} aria-pressed={h === hours} onClick={() => setHours(h)}>{h}h</button>)}
    </div>
  );
  let body: ReactNode;
  if (q.isPending) body = <div className="tk-card tk-empty">불러오는 중</div>;
  else if (!AGG) body = <div className="tk-card tk-empty">토큰 데이터 파일이 아직 없어.<br />계측 머지 후 첫 파이프라인 실행 + 롤업(≤2h)부터 채워져.</div>;
  else {
    const agg = withinWindow(AGG, hours);
    body = !agg.buckets || !agg.buckets.length
      ? <div className="tk-card tk-sum"><div className="tk-big num">0<small>토큰 · 최근 {hours}h</small></div>{seg}</div>
      : <Usage agg={agg} labels={AGG.labels} seg={seg} />;
  }
  return (
    <Pane title="토큰">
      <div className="yeta-set mt-2 nm-ep nm-tk">
        {at ? <p className="ep-at num" aria-live="polite">{at}</p> : null}
        {body}
      </div>
    </Pane>
  );
}

function Usage({ agg, labels, seg }: { agg: Agg; labels?: Record<string, string>; seg: ReactNode }) {
  const lab = (s: string) => LABELS[s] || (labels && labels[s]) || s;
  // 분류 × 시간대
  const M: Record<string, number[]> = {};
  for (const b of agg.buckets || []) {
    const bi = bandOf(kstHour(b)); if (bi < 0) continue;
    for (const [s, a] of Object.entries(b.by_src)) { const t = tk(a); if (!t) continue; (M[catOf(s)] = M[catOf(s)] || [0, 0, 0, 0, 0, 0])[bi] += t; }
  }
  const cats = Object.keys(M).map((c) => [c, M[c].reduce((x, y) => x + y, 0)] as [string, number]).sort((a, b) => b[1] - a[1]);
  const total = cats.reduce((x, c) => x + c[1], 0);
  const colTot = BANDS.map((_, i) => cats.reduce((x, [c]) => x + M[c][i], 0));
  const cmax = Math.max(1, ...cats.flatMap(([c]) => M[c]));
  // 결론 한 줄 = 가장 많이 쓴 분류 · 그 비중 · 그 분류가 가장 몰린 시간대
  let say = "";
  if (cats.length) { const [top, tv] = cats[0], row = M[top], pk = row.indexOf(Math.max(...row)); say = `${josa(top, "이", "가")} 토큰의 ${Math.round((tv / total) * 100)}%를 쓰고, ${BANDS[pk][0]}에 가장 몰린 상황이다.`; }
  // 소비처 표(분류별로 묶음 · 큰 순)
  const bySrc = Object.entries(agg.totals?.by_src || {}).map(([s, a]) => [s, tk(a)] as [string, number]).filter((x) => x[1] > 0);
  return (
    <>
      <div className="tk-card tk-sum">
        <div className="tk-big num">{fn(total)}<small>토큰 · 최근 {agg.window_h}h</small></div>
        {seg}
        {say ? <p className="tk-say">{say}</p> : null}
      </div>
      <section className="tk-sec">
        <h2 className="tk-name">시간대 × 분류</h2>
        <div className="tk-card tk-heat">
          <span />
          {BANDS.map(([n, a, z]) => <span key={n} className="ch">{n}<small className="num">{a}–{z}</small></span>)}
          {cats.map(([c]) => [
            <span key={c} className="rh">{c}</span>,
            ...M[c].map((v, i) => {
              const t = (v / cmax) * 100;
              return v
                ? <span key={c + i} className={`c num${t > 46 ? " dk" : ""}`} style={{ "--a": SHADE(t) } as CSSProperties} title={`${c} · ${BANDS[i][0]} ${BANDS[i][1]}–${BANDS[i][2]}시 · ${fn(v)} 토큰`}>{fk(v)}</span>
                : <span key={c + i} className="c z" aria-label={`${c} · ${BANDS[i][0]} 없음`}>–</span>;
            }),
          ])}
          <span className="ft rh">합</span>
          {colTot.map((v, i) => <span key={i} className="ft num">{v ? fk(v) : "–"}</span>)}
        </div>
      </section>
      <section className="tk-sec">
        <h2 className="tk-name">소비처</h2>
        <div className="tk-card">
          <table className="tk-tbl">
            <thead><tr><th>소비처</th><th className="r">토큰</th><th className="r">비중</th></tr></thead>
            <tbody>
              {cats.map(([c, cv]) => [
                <tr key={c} className="g"><td>{c}</td><td className="r num">{fn(cv)}</td><td className="r num">{pc(cv, total)}</td></tr>,
                ...bySrc.filter((x) => catOf(x[0]) === c).sort((a, b) => b[1] - a[1]).map(([s, v]) => (
                  <tr key={c + ":" + s} className="s"><td>{lab(s)}</td><td className="r num">{fn(v)}</td><td className="r num">{pc(v, total)}</td></tr>
                )),
              ])}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
