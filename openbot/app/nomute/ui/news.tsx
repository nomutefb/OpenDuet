// 서랍 「뉴스 요약」 목록(서랍 차례 ④ · 윈터 10:12·10:34 「④ 뉴스 요약 목록 판 가도 돼」) — 에디터 넷째 탭 기본 착지 「뉴스 요약」(viewer/index.html load() 4796 · render() 4905 · 카드 = 분류·제목·요약·매체·편향·민감·진행바·긴급/이슈)을
//   목록만 네이티브로: 최신 20개(더 보기 +20) · 줄 = [분류] 제목 · 매체(+N) · 날짜 시각 · 요약 한 줄 · 긴급/이슈 표 · 오른쪽 작은 썸네일(AI 첫 장 · 없으면 검색 첫 장) · 머리 = 전체 수(count) · 피드 시각(generated) · 대기열 배지(api/pending)
//   누르면 = 앱 안 기사 한 장(#/news?a=<file> · ./news-detail.tsx · 형 11-01 「그 내 뉴스 에디터에서 쓰는 썸네일, 그리고 뉴스 요약 보는 것들. 그런것들 완전히 내재화 부탁해.」) · 전엔 에디터 딥링크(#/web)
//   데이터 = `/articles.json`(./news-data.ts · 분류 칸 = category · 전엔 cat 을 읽어 분류가 안 떴음) · 실시간 줄 `api/feedlive` 병합은 2차(원본은 4초 상한 병합) · 60초 다시 읽기(원본 폴) · 같은 출처 · HTML 응답 = 로그인 벽
//   필터 칩 = 원본 R 필터 칩(viewer/index.html renderChips · FILTERS · render 4912) 그대로: 전체 · 이슈(긴급 + 이슈) · 정치 · 사회 · 경제 · 문화 · 국제 · 테크 — 분류는 여러 개 = OR · 이슈는 분류와 같이(AND) · 이 화면에서만(원본도 저장 안 함)
//     (형 11-10 12:40 「봄 노는 작업실 있으면 에디터도 정원에 완벽하게 녹여」 · team-4 U3 뎅 · 전엔 「원본 카드의 검색·필터는 여기 없음」) · 검색은 여기 없음(전체 보기)
import "./yeta-settings.css";
import { pollOff } from "../data/poll-linux";
import "./chan.css";
import "./sns.css";
import "./news.css";
import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { type Art, catOf, mediaOf, newsListQuery, thumbOf, useGo, whenOf } from "./news-data";
import { NewsDetail } from "./news-detail";
import { Pane } from "./pane";
import { YICO } from "./yeta-icons";

const PAGE = 20;
const CHIP_CATS = ["정치", "사회", "경제", "문화", "국제", "테크"];   // 원본 CHIP_CATS(운영자 260621 · 정치 = 사회에서 나눔)
const k12 = (iso?: string) => { const t = iso ? Date.parse(iso) : NaN; if (!Number.isFinite(t)) return ""; const d = new Date(t + 9 * 36e5); const h = d.getUTCHours(), m = String(d.getUTCMinutes()).padStart(2, "0"); return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${h % 12 || 12}:${m}${h < 12 ? "AM" : "PM"}`; };
/** 기사 한 장이 열렸나(#/news?a=<file>) — 껍데기 「<」 도 이걸로 목록부터 돌아감(ui/shell.tsx closeModal) */
export const newsFileOf = (searchStr: string) => new URLSearchParams(searchStr).get("a") || "";

export function NewsModal() {
  const file = newsFileOf(useRouterState({ select: (s) => s.location.searchStr }));
  const [n, setN] = useState(PAGE), [pending, setPending] = useState<number | null>(null);
  const q = useQuery(newsListQuery);
  const go = useGo();
  const root = useRef<HTMLDivElement>(null), listTop = useRef(0);
  useLayoutEffect(() => {   // 스크롤 판(.nm-scroll)은 목록·한 장이 같이 씀 → 열 때 맨 위 · 돌아오면 보던 자리
    const sc = root.current?.closest(".nm-scroll");
    if (sc) sc.scrollTop = file ? 0 : listTop.current;
  }, [file]);
  useEffect(() => {
    let live = true;
    const load = () => fetch("/api/pending?_=" + Date.now(), { credentials: "same-origin" }).then((r) => (r.ok ? r.json() : null)).then((d: { items?: { status?: string }[] } | null) => { if (live && d) setPending((d.items || []).filter((it) => it && (it.status === "processing" || it.status === "retry")).length); }).catch(() => {});
    load(); const t = window.setInterval(() => { if (!pollOff()) load(); }, 60_000);   // 숨은 탭 = 조회 0(47) · 깃허브 한도 · 봄 11-09 10:59) · 리눅스 데스크톱도 쉼(../data/poll-linux.ts · 형 「보는 것도 리눅스면 그건 수동이여야하고」)
    return () => { live = false; clearInterval(t); };
  }, []);
  const Svg = ({ k }: { k: keyof typeof YICO }) => <span aria-hidden dangerouslySetInnerHTML={{ __html: YICO[k] }} />;
  const goAll = () => { go("/feed"); };   // 전체 = 앱 안 뉴스 전체(./feed.tsx · 시아 2c92a1c) — 옛 에디터 피드 탭 한 겹 대신(봄 11-01 · 형 「눌렀을때 웹으로 연결된 부분이 많아서 불편했어..」)
  const goOne = (a: Art) => { listTop.current = root.current?.closest(".nm-scroll")?.scrollTop || 0; go(`/news?a=${encodeURIComponent(a.file)}`); };
  const [fc, setFc] = useState<ReadonlySet<string>>(() => new Set()), [fi, setFi] = useState(false);   // 필터 칩(원본 FILTERS.cats · issue)
  const all = q.data?.arts || [];
  const arts = fc.size || fi ? all.filter((a) => (!fc.size || fc.has(catOf(a)?.[0] || "")) && (!fi || !!a.breaking || !!a.issue)) : all, shown = arts.slice(0, n);
  const flipCat = (c: string) => { setFc((old) => { const nx = new Set(old); if (nx.has(c)) nx.delete(c); else nx.add(c); return nx; }); setN(PAGE); };
  return (
    <Pane title={file ? "뉴스 요약 · 기사" : "뉴스 요약"}>
      <div ref={root} />
      {file ? <NewsDetail key={file} file={file} /> : (
        <div className="yeta-set mt-2">
          <div className="ycd-card card-left nm-chan nm-sns nm-news">
            <span className="ycd-nm yset-ttl"><Svg k="chat" />뉴스 요약{pending ? <i className="nm-ask-badge" title="대기열 처리 중">{pending}</i> : null}{q.data ? <i className="nm-chan-at">{q.data.count.toLocaleString("ko-KR")}건{q.data.generated ? ` · ${k12(q.data.generated)}` : ""}</i> : null}</span>
            {q.isLoading ? <p className="nm-chan-msg">기사 읽는 중…</p> : q.isError ? <p className="nm-chan-msg" role="alert">{(q.error as Error).message || "뉴스 요약을 못 읽었어"}</p> : !all.length ? <p className="nm-chan-msg">기사가 없어</p> : <>
              <div className="yset-chips nm-news-chips" role="group" aria-label="분류 필터">
                <button type="button" className={`yset-chip${!fc.size && !fi ? " on" : ""}`} aria-pressed={!fc.size && !fi} onClick={() => { setFc(new Set()); setFi(false); setN(PAGE); }}>전체</button>
                <button type="button" className={`yset-chip${fi ? " on" : ""}`} aria-pressed={fi} onClick={() => { setFi((v) => !v); setN(PAGE); }}>이슈</button>
                {CHIP_CATS.map((c) => <button key={c} type="button" className={`yset-chip${fc.has(c) ? " on" : ""}`} aria-pressed={fc.has(c)} onClick={() => flipCat(c)}>{c}</button>)}
              </div>
              {!arts.length ? <p className="nm-chan-msg">결과 없음</p> : (
              <ul className="nm-news-list">
                {shown.map((a) => {
                  const kind = a.breaking ? "brk" : a.issue ? "iss" : "";   // 원본 brkIssueKind 는 나이(<4h)까지 보지만 여기선 표만(짐작 · 전체 보기와 다를 수 있음)
                  const cat = catOf(a), th = thumbOf(a);
                  return (
                    <li key={a.file}>
                      <button type="button" onClick={() => goOne(a)}>
                        <span className="nm-news-txt">
                          <span className="nm-news-top">{cat ? <b className={`cat ${cat[1]}`}>{cat[0]}</b> : null}{kind ? <b className={`urg ${kind}`}>{kind === "brk" ? "긴급" : "이슈"}</b> : null}<span className="meta">{[mediaOf(a.media), whenOf(a)].filter(Boolean).join(" · ")}</span></span>
                          <span className="nm-news-t">{a.title || "(제목 없음)"}</span>
                          {a.summary ? <span className="nm-news-s">{a.summary}</span> : null}
                        </span>
                        {th ? <img className="nm-news-th" src={th} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.hidden = true; }} /> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
              )}
            </>}
            {arts.length > n ? <button type="button" className="yset-chip nm-news-more" onClick={() => setN((v) => v + PAGE)}>더 보기 ({arts.length - n})</button> : null}
            <div className="ypc-acts nm-chan-acts"><button type="button" className="ypc-go" onClick={goAll}>전체 보기 <span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} /></button></div>
          </div>
        </div>
      )}
    </Pane>
  );
}
