// 서랍 「채널 요약」(서랍 차례 ② · 윈터 10:12) — 에디터 넷째 탭 「채널 요약」(viewer/index.html loadChan 16842 · renderChan 17168 · 수백 줄: 타일·인구통계·차트·최근 게시물·결과 함께)을 통째 옮기지 않고
//   「한눈 요약」 한 장만 네이티브로: 소스(IG · FB · TH) · 팔로워(+창 신규) · 조회·도달·게시·상호작용 일평균(7일) · (AI 요약 뺌 · 형 10-31 「끄자!」 · 지표만) · 옛 AI 요약(chan_brief 총론 또는 첫 기간 · 「→」 줄 = 클로신의 제안) · 수집 시각 · 「전체 보기」= 원본 화면(#/web?u=/?tab=chan)
//   데이터 = 원본 chanGet 차례 그대로: `/api/chan?f=ig|fb|th` → 안 되면 `/insta_data.json`·`/fb_data.json`·`/threads_data.json`(유효 판별 키 = generated_kst / updated · HTML 응답 = 건너뜀) · 같은 출처라 쿠키 그대로
//   셈 = 원본 winAvg(마지막 실측일 앵커 · 결측 제외 · 7일 창) · winSum('follows' · 스레드 = follower_net) · 지표 사전 = CH_MET(ig·fb) / CH_MET_TH(th) 16233줄 · 5분 TTL 은 react-query 가 맡음
import "./yeta-settings.css";
import "./chan.css";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pane } from "./pane";
import { YICO } from "./yeta-icons";

type Row = Record<string, number | null | undefined> & { date: string };
type Chan = { profile?: { followers_count?: number | null; username?: string; name?: string }; generated_kst?: string; daily_series?: Row[]; src?: string; avg?: Record<string, { avg_7d?: number }> };
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
  for (const u of [`/api/chan?f=${key}`, `/${file}?ts=${Date.now()}`]) {
    try {
      const r = await fetch(u, { credentials: "same-origin", signal: AbortSignal.timeout(12000) });
      if (!r.ok) continue;
      const t = await r.text(); if (/^\s*</.test(t)) continue;
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
const signed = (v: number, u: string) => (v > 0 ? "+" : v < 0 ? "−" : "±") + Math.abs(v).toLocaleString("ko-KR") + u;

export function ChanModal() {
  const [src, setSrc] = useState<Src>("ig");
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
  const go = () => { window.location.hash = "#/web?u=" + encodeURIComponent("/?tab=chan"); };
  const d = q.data?.[src] ?? null;
  const have = SRC.filter((s) => q.data?.[s.id]);
  const series = (d?.daily_series || []).filter((r) => r && r.date);
  const flw = d?.profile?.followers_count, fsum = d ? winSum(series, src === "th" ? "follower_net" : "follows") : null;
  return (
    <Pane title="채널 요약">
      <div className="yeta-set mt-2">
        <div className="ycd-card card-left nm-chan">
          <span className="ycd-nm yset-ttl"><Svg k="data" />채널 요약{d?.generated_kst ? <i className="nm-chan-at">{k12(d.generated_kst)}</i> : null}</span>
          {have.length > 1 ? <div className="yset-chips nm-chan-src" role="tablist">{have.map((s) => <button key={s.id} type="button" role="tab" aria-selected={src === s.id} className={`yset-chip${src === s.id ? " on" : ""}`} onClick={() => setSrc(s.id)}>{s.t}</button>)}</div> : null}
          {q.isLoading ? <p className="nm-chan-msg">채널 읽는 중…</p> : !d ? <p className="nm-chan-msg">{q.isError ? "채널 요약을 못 읽었어" : "이 소스는 지금 데이터가 없어"}</p> : (
            <>
              <div className="nm-chan-tiles">
                <div className="nm-chan-tile tall"><span className="k">팔로워</span><b>{flw != null ? flw.toLocaleString("ko-KR") : "—"}</b>{fsum != null ? <span className={`sub ${fsum > 0 ? "up" : fsum < 0 ? "dn" : ""}`}>{WIN}일 {signed(fsum, "명")}</span> : null}</div>
                {MET[src].map(([key, lb, u]) => { const a = winAvg(series, key); return <div key={key} className="nm-chan-tile"><span className="k">{lb}</span><b>{a == null ? "—" : fmtK(rnd(a))}<i>{u}/일</i></b><span className="sub">{WIN}일 평균</span></div>; })}
              </div>
            </>
          )}
          <div className="ypc-acts nm-chan-acts"><button type="button" className="ypc-go" onClick={go}>전체 보기 <span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} /></button></div>
        </div>
      </div>
    </Pane>
  );
}
