// 서랍 「뉴스 요약」 목록(서랍 차례 ④ · 윈터 10:12·10:34 「④ 뉴스 요약 목록 판 가도 돼」) — 에디터 넷째 탭 기본 착지 「뉴스 요약」(viewer/index.html load() 4796 · render() 4905 · 카드 = 분류·제목·요약·매체·편향·민감·진행바·긴급/이슈)을
//   목록만 네이티브로: 최신 20개(더 보기 +20) · 줄 = [분류] 제목 · 매체(+N) · 날짜 시각 · 요약 한 줄 · 긴급/이슈 표 · 누르면 그 기사 요약 창(에디터 딥링크 `/?a=<file>` 20682줄 → #/web 한 겹) · 머리 = 전체 수(count) · 피드 시각(generated) · 대기열 배지(api/pending)
//   데이터 = `/articles.json`(원본 그대로 · {articles:[{file,title,summary,media,url,date,time,cat?,breaking?,issue?,rev}], count, generated}) · 실시간 줄 `api/feedlive` 병합은 2차(원본은 4초 상한 병합) · 60초 다시 읽기(원본 폴) · 같은 출처 · HTML 응답 = 로그인 벽
//   원본 카드의 편향·민감 칩·진행바·카드 상태·검색·필터는 여기 없음(전체 보기) — 「읽기 중심 목록」만(설계-빠르.md ② 표)
import "./yeta-settings.css";
import "./chan.css";
import "./sns.css";
import "./news.css";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Pane } from "./pane";
import { YICO } from "./yeta-icons";

type Art = { file: string; title?: string; summary?: string; media?: string; url?: string; date?: string; time?: string; cat?: string; breaking?: boolean | number | string; issue?: boolean | number; rev?: number };
type Feed = { articles?: Art[]; count?: number; generated?: string };
const PAGE = 20;
const k12 = (iso?: string) => { const t = iso ? Date.parse(iso) : NaN; if (!Number.isFinite(t)) return ""; const d = new Date(t + 9 * 36e5); const h = d.getUTCHours(), m = String(d.getUTCMinutes()).padStart(2, "0"); return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${h % 12 || 12}:${m}${h < 12 ? "AM" : "PM"}`; };
/** 매체 = 첫 매체 + 「외 N」(원본 primaryMedia/outletShort 의 가벼운 판 · a.media 가 「동아일보, 조선일보 …」 꼴) */
const mediaOf = (m?: string) => { const xs = String(m || "").split(/[,·|/]/).map((s) => s.trim()).filter(Boolean); return xs.length ? xs[0].replace(/\s*\(.*?\)\s*/g, "") + (xs.length > 1 ? ` 외 ${xs.length - 1}` : "") : ""; };
/** 시각 = a.date(YYYY-MM-DD) + a.time(HH:MM) · 없으면 file(YYMMDD-HHMM)에서 */
const whenOf = (a: Art) => {
  const d = String(a.date || "").trim(), t = String(a.time || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return `${+d.slice(5, 7)}/${+d.slice(8, 10)}${/^\d{1,2}:\d{2}$/.test(t) ? " " + t : ""}`;
  const m = /^(\d{2})(\d{2})(\d{2})-(\d{2})(\d{2})/.exec(a.file || ""); return m ? `${+m[2]}/${+m[3]} ${m[4]}:${m[5]}` : "";
};

export function NewsModal() {
  const [n, setN] = useState(PAGE), [pending, setPending] = useState<number | null>(null);
  const q = useQuery({
    queryKey: ["nomute", "news-list"], staleTime: 60_000, refetchInterval: 60_000,
    queryFn: async () => {
      const r = await fetch(`/articles.json?_=${Date.now()}`, { credentials: "same-origin" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const t = await r.text(); if (/^\s*</.test(t)) throw new Error("로그인이 끝났어 — 새로 고쳐 다시 로그인");
      const j = JSON.parse(t) as Feed;
      const arts = (j.articles || []).filter((a) => a && a.file).sort((a, b) => (a.file < b.file ? 1 : a.file > b.file ? -1 : 0));   // 원본 = 파일명 최신순
      return { arts, count: j.count || arts.length, generated: j.generated || "" };
    },
  });
  useEffect(() => {
    let live = true;
    const load = () => fetch("/api/pending?_=" + Date.now(), { credentials: "same-origin" }).then((r) => (r.ok ? r.json() : null)).then((d: { items?: { status?: string }[] } | null) => { if (live && d) setPending((d.items || []).filter((it) => it && (it.status === "processing" || it.status === "retry")).length); }).catch(() => {});
    load(); const t = window.setInterval(load, 60_000);
    return () => { live = false; clearInterval(t); };
  }, []);
  const Svg = ({ k }: { k: keyof typeof YICO }) => <span aria-hidden dangerouslySetInnerHTML={{ __html: YICO[k] }} />;
  const goAll = () => { window.location.hash = "#/web?u=" + encodeURIComponent("/?tab=feed"); };
  const goOne = (a: Art) => { window.location.hash = "#/web?u=" + encodeURIComponent(`/?a=${encodeURIComponent(a.file)}`); };   // 원본 딥링크 = 그 기사 요약 창 자동 열림(20682)
  const arts = q.data?.arts || [], shown = arts.slice(0, n);
  return (
    <Pane title="뉴스 요약">
      <div className="yeta-set mt-2">
        <div className="ycd-card card-left nm-chan nm-sns nm-news">
          <span className="ycd-nm yset-ttl"><Svg k="chat" />뉴스 요약{pending ? <i className="nm-ask-badge" title="대기열 처리 중">{pending}</i> : null}{q.data ? <i className="nm-chan-at">{q.data.count.toLocaleString("ko-KR")}건{q.data.generated ? ` · ${k12(q.data.generated)}` : ""}</i> : null}</span>
          {q.isLoading ? <p className="nm-chan-msg">기사 읽는 중…</p> : q.isError ? <p className="nm-chan-msg" role="alert">{(q.error as Error).message || "뉴스 요약을 못 읽었어"}</p> : !arts.length ? <p className="nm-chan-msg">기사가 없어</p> : (
            <ul className="nm-news-list">
              {shown.map((a) => {
                const kind = a.breaking ? "brk" : a.issue ? "iss" : "";   // 원본 brkIssueKind 는 나이(<4h)까지 보지만 여기선 표만(짐작 · 전체 보기와 다를 수 있음)
                return (
                  <li key={a.file}>
                    <button type="button" onClick={() => goOne(a)}>
                      <span className="nm-news-top">{a.cat ? <b className="cat">{a.cat}</b> : null}{kind ? <b className={`urg ${kind}`}>{kind === "brk" ? "긴급" : "이슈"}</b> : null}<span className="meta">{[mediaOf(a.media), whenOf(a)].filter(Boolean).join(" · ")}</span></span>
                      <span className="nm-news-t">{a.title || "(제목 없음)"}</span>
                      {a.summary ? <span className="nm-news-s">{a.summary}</span> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {arts.length > n ? <button type="button" className="yset-chip nm-news-more" onClick={() => setN((v) => v + PAGE)}>더 보기 ({arts.length - n})</button> : null}
          <div className="ypc-acts nm-chan-acts"><button type="button" className="ypc-go" onClick={goAll}>전체 보기 <span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} /></button></div>
        </div>
      </div>
    </Pane>
  );
}
