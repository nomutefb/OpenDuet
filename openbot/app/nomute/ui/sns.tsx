// 서랍 「SNS」(서랍 차례 ③ · 윈터 10:12) — 에디터 넷째 탭 「SNS」(viewer/index.html loadTrends 14645 · renderSnsTrends 14830 · 구글·유튜브·틱톡·쇼츠·레딧·X·브리프·화재 등 수백 줄)을 통째 안 옮기고
//   「한눈」 한 장: AI 요약(sns_brief text · 첫 8줄 · **굵게** 표지는 벗김) · 구글 트렌드 TOP 10(query · traffic) · 유튜브 인기 TOP 5(title · channel · views · 누르면 새 창) · 수집 시각 · 「전체 보기」= #/web?u=/?tab=trend
//   데이터 = 원본 차례 그대로: `/api/trends` → `/sns_trends.json`(유효 키 updated) · 브리프 `/api/trends?f=brief` → `/sns_brief.json`(updated) · HTML 응답 = 건너뜀 · 5분 TTL(원본 _trFetched) = react-query staleTime
//   국내 기본(원본 nm_trend_region 'kr' · gtrends 만 · gtrends_gl 병합 0) · 유튜브 게임(categoryId 20) 배제는 원본 규칙(260818) 그대로 가벼운 판: cat 이 있으면 20 빼기
import "./yeta-settings.css";
import "./chan.css";   // 타일·브리프 꼴 = 채널 요약 판과 같은 클래스(.nm-chan*) 재사용 · 아래 .nm-sns* 만 더함
import "./sns.css";
import { useQuery } from "@tanstack/react-query";
import { Pane } from "./pane";
import { YICO } from "./yeta-icons";

type GT = { query: string; traffic?: string | number };
type YT = { id?: string; title: string; url?: string; views?: number | string; channel?: string; cat?: string };
type Trends = { updated: string; gtrends?: GT[]; youtube?: YT[] };
type Brief = { updated: string; text?: string };
const k12 = (iso?: string) => { const t = iso ? Date.parse(iso) : NaN; if (!Number.isFinite(t)) return ""; const d = new Date(t + 9 * 36e5); const h = d.getUTCHours(), m = String(d.getUTCMinutes()).padStart(2, "0"); return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${h % 12 || 12}:${m}${h < 12 ? "AM" : "PM"}`; };
const fmtK = (n: number) => (n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e4 ? (n / 1e3).toFixed(0) + "K" : Math.round(n).toLocaleString("ko-KR"));
const views = (v?: number | string) => { const n = typeof v === "string" ? parseInt(v.replace(/[^\d]/g, ""), 10) : v; return n && Number.isFinite(n) ? fmtK(n) + "회" : ""; };
const plain = (s: string) => s.replace(/\*\*([^*\n]+)\*\*/g, "$1").replace(/\*([^*\n]+)\*/g, "$1").replace(/\[([^\]\n]+)\]\(https?:\/\/[^\s)]+\)/g, "$1");   // 원본 tbrief TOK(15425) 의 표지만 벗김

async function getJ<T>(urls: string[], ok: string): Promise<T | null> {
  for (const u of urls) {
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

export function SnsModal() {
  const q = useQuery({
    queryKey: ["nomute", "sns-brief"], staleTime: 300_000, refetchInterval: 300_000,
    queryFn: async () => {
      const [tr, br] = await Promise.all([
        getJ<Trends>(["/api/trends", `/sns_trends.json?t=${Date.now()}`], "updated"),
        getJ<Brief>(["/api/trends?f=brief", `/sns_brief.json?t=${Date.now()}`], "updated"),
      ]);
      return { tr, br };
    },
  });
  const Svg = ({ k }: { k: keyof typeof YICO }) => <span aria-hidden dangerouslySetInnerHTML={{ __html: YICO[k] }} />;
  const go = () => { window.location.hash = "#/web?u=" + encodeURIComponent("/?tab=trend"); };
  const tr = q.data?.tr ?? null, br = q.data?.br ?? null;
  const gt = (tr?.gtrends || []).filter((g) => g && g.query).slice(0, 10);
  const yt = (tr?.youtube || []).filter((v) => v && v.title && String(v.cat || "") !== "20").slice(0, 5);
  // 묵은 요약 숨김(윈터 10:34 「SNS AI 요약이 「9/9 1:57PM · 수요일」 글이야 … 2일 넘은 요약이면 안 보이게」) — sns_brief 가 멈추면 옛 글이 오늘 얘기처럼 보이니 updated 가 48시간 넘으면 통째로 뺌
  const BRIEF_MAX_H = 48;
  const briefAgeH = br?.updated ? (Date.now() - Date.parse(br.updated)) / 36e5 : NaN;
  const briefFresh = Number.isFinite(briefAgeH) && briefAgeH <= BRIEF_MAX_H;
  const lines = briefFresh ? plain(br?.text || "").split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 8) : [];
  return (
    <Pane title="SNS">
      <div className="yeta-set mt-2">
        <div className="ycd-card card-left nm-chan nm-sns">
          <span className="ycd-nm yset-ttl"><Svg k="radio" />SNS{tr?.updated ? <i className="nm-chan-at">{k12(tr.updated)}</i> : null}</span>
          {q.isLoading ? <p className="nm-chan-msg">트렌드 읽는 중…</p> : !tr ? <p className="nm-chan-msg">{q.isError ? "SNS 트렌드를 못 읽었어" : "지금 데이터가 없어"}</p> : (
            <>
              {lines.length ? <div className="nm-chan-brief"><span className="yset-sec">AI 요약{br?.updated ? <i className="nm-chan-at">{k12(br.updated)}</i> : null}</span>{lines.map((t, i) => <p key={i}>{t}</p>)}</div>
                : br?.updated && !briefFresh ? <p className="nm-chan-msg">AI 요약이 {Math.floor(briefAgeH / 24)}일 전({k12(br.updated)})에 멈춰 있어 — 숨김</p> : null}
              {gt.length ? (
                <div className="nm-sns-sec"><span className="yset-sec">구글 트렌드</span>
                  <ol className="nm-sns-gt">{gt.map((g, i) => <li key={g.query + i}><span className="n">{i + 1}</span><span className="t">{g.query}</span>{g.traffic ? <span className="v">{String(g.traffic)}</span> : null}</li>)}</ol>
                </div>
              ) : null}
              {yt.length ? (
                <div className="nm-sns-sec"><span className="yset-sec">유튜브 인기</span>
                  <ul className="nm-sns-yt">{yt.map((v, i) => { const href = v.url || (v.id ? `https://www.youtube.com/watch?v=${v.id}` : ""); const body = <><span className="n">{i + 1}</span><span className="tt"><span className="t">{v.title}</span>{v.channel || v.views ? <span className="d">{[v.channel, views(v.views)].filter(Boolean).join(" · ")}</span> : null}</span></>; return <li key={(v.id || v.title) + i}>{href ? <a href={href} target="_blank" rel="noopener">{body}</a> : body}</li>; })}</ul>
                </div>
              ) : null}
            </>
          )}
          <div className="ypc-acts nm-chan-acts"><button type="button" className="ypc-go" onClick={go}>전체 보기 <span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} /></button></div>
        </div>
      </div>
    </Pane>
  );
}
