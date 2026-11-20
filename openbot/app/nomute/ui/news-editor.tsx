// 네비 4번 「뉴스 에디터」(형 11-09 08:50 「뉴스 에디터가 4번 메뉴에 보이게 해주고 / 요약된 내용이 여기에 일제히 나오게 해줘 어떻게구성할지는 잘 싱각해봐」 · 시아 08:54 구성 안 · 봄 33) · 형 09:32 「뜸은 ui에 붙으면 돼」)
//   PC(넓음) = 두 칸: 왼쪽 58 목록 · 오른쪽 = 고른 기사 한 장 · 폰 = 한 줄 · 카드 누르면 기사 한 장이 화면 통째(「목록」 = 보던 자리로)
//     기사 한 장 = 옛 에디터 「기사 창」을 그 칸에 직접 붙인 것(./old-tabs/art.tsx · 형 11-15 「우측에 이내용, 예~전 뉴스요약 부분 … 그때 시안을 여기에 붙일 수 있나? … 그걸 여기에 가져오고 지금건 없애면될거같아.」 「저게 시안대신 라임만 들어가면됨.」)
//       앞 판 = 앱에서 다시 그린 기사 한 장(./news-detail.tsx · 서랍 「뉴스 요약」 ./news.tsx 는 그대로 그것을 씀)
//   왼쪽 위→아래: (① 「지금 뜨는 말」 띠 · ② 넣는 줄 「전송 · 픽」 = 걷음 · 11-11 형 · 요약 요청 = 오른쪽 아래 떠 있는 「요약」 단추 → #/ask · 픽 일 = ./ask.tsx 「외신 기반」 칩 저절로)
//     ③ 요약 대기열 판(./task-panel.tsx · 「뉴스 요약」과 같은 고르기) ④ 칩 = 전체 · 이슈 · 분야 여섯 · 찾기 ⑤ 요약 카드 = 옛 에디터 「뉴스 요약」 카드(./summary-desk.tsx SumCard) · 이슈·긴급 = 금빛 테 · 고른 카드 = 라임 테 · 내리면 10장씩 더
//   위 탭 셋(뉴스 · SNS · 채널 · ./ned-tabs.ts) = 대화방 위 탭(./teams.tsx TeamsSwitch)과 같은 폴더 탭 꼴(같은 옷 ./teams.css .nm-tswitch.fold) · 고른 탭만 이름 펼침
//     SNS · 채널 = 서랍에서 옮겨 옴(형 11-15 「서랍의 sns와 채널 … 불러오는 개념이 아니라 저기 박혀야 하고 자연스러워야함」) — 이 화면 안 판(./old-tabs) · 한 번 연 탭은 살려 둠(숨기기만 = 스크롤 · 받은 자료 그대로) · 탭 바꿈 = 기록 안 쌓음(replace)
//   자료 = 「뉴스 요약」(./feed.tsx)과 같은 것(/articles.json + /api/feedlive + /api/pending) · 서랍 「뉴스 요약」 칸은 여기로 합침(서랍 목록에서만 뺌 · #/feed 주소는 그대로)
import "./yeta-settings.css";
import "./chan.css";
import "./sns.css";
import "./news.css";
import "./summary-desk.css";
import "./teams.css";   // 폴더 탭 옷(.nm-tswitch.fold)
import { useFoldInk } from "./fold-ink";   // 고른 탭 바탕이 미끄러짐(형 11-16)
import "./news-editor.css";
import { PlusFan } from "./plus-fan";   // 오른쪽 아래 「+」 펼침 = 한 벌(홈 PC Digest 우하단도 같은 것 · 형 11-13 02:24)
import { useQuery } from "@tanstack/react-query";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { DuetIcon } from "@/components/duet/icons";
import { type FArt, byFile, feedLiveQuery, kindOf, pendQuery, pickQ } from "./feed";
import { newsListQuery, useGo } from "./news-data";
import { newsFileOf } from "./news";   // #/newsed?a=<file> = 그 기사로 바로 열기(k-4 U2)
import { useSplit } from "./side";
import { SumCard } from "./summary-desk";
import { type QItem, TaskPanel } from "./task-panel";
import { qRetry, qfSeenOne } from "./q-acts";
import { NED_TABS, type NedTab, nedTabOf } from "./ned-tabs";

const oldTabs = () => import("./old-tabs");   // SNS · 채널 판 코드(약 0.5MB) = 뉴스 에디터를 열면 뒤에서 미리 받음 → 탭을 누를 땐 이미 와 있음
const ChanTab = lazy(() => oldTabs().then((m) => ({ default: m.ChanTab })));
const SnsTab = lazy(() => oldTabs().then((m) => ({ default: m.SnsTab })));
const oldArt = () => import("./old-tabs/art");   // 기사 한 장(옛 기사 창 · 약 0.3MB) = 채널 · SNS 와 따로 받는 조각 · 같은 식으로 뒤에서 미리
const ArtPane = lazy(() => oldArt().then((m) => ({ default: m.ArtPane })));
const artWait = <div className="nm-lazy" role="status" aria-label="읽는 중"><i /><i /><i /></div>;

/** 위 탭 줄 — 대화방 「대화방 | 팀즈 | 회의」와 같은 폴더 탭 */
function NedTabs({ tab, pick }: { tab: NedTab; pick: (t: NedTab) => void }) {
  const bar = useFoldInk("ned", tab);
  return (
    <div className="nm-tswitch fold nm-ned-tabs" role="tablist" aria-label="뉴스 에디터 판 바꾸기" ref={bar}>
      <i className="nm-fold-ink" aria-hidden />   {/* 고른 탭 바탕 한 장 = 탭을 바꾸면 미끄러짐(./fold-ink.ts · 형 11-16) */}
      {NED_TABS.map((t) => (
        <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} aria-label={t.name} className={`nm-ftab${tab === t.id ? " on" : ""}`} onClick={() => pick(t.id)}>
          <DuetIcon name={t.icon} size={20} /><span className="nm-ftab-nm">{t.name}</span>
        </button>
      ))}
    </div>
  );
}

const CAP = 10;

// 「지금 뜨는 말」 줄(kwQuery · Ticker)은 걷음(형 11-11 09:02 「상단에 인기검색어 없어도 되고」) · 앞 판 = git

/** 기사 한 장에 갔다 돌아오면 보던 그대로(폰 · 칩·찾기·개수·스크롤) */
let keep: { n: number; top: number } | null = null;

export function NewsEditor() {
  const go = useGo(), wide = useSplit(), router = useRouter();
  const [mouse] = useState(() => { try { return matchMedia("(hover: hover) and (pointer: fine)").matches; } catch { return false; } });   // 마우스 = PC(창을 좁혀도 · enter-key.tsx · link-card.tsx 와 같은 셈) → 우하단 「+」 0
  const tab = nedTabOf(useRouterState({ select: (st) => st.location.pathname }));
  const alive = useRef(new Set<NedTab>());   // 한 번 연 SNS · 채널 판 = 이 화면에 있는 동안 살려 둠
  alive.current.add(tab);
  const pick = (t: NedTab) => { if (t !== tab) router.history.replace(NED_TABS.find((x) => x.id === t)!.to); };
  useEffect(() => { void oldArt().catch(() => undefined); const id = window.setTimeout(() => { void oldTabs().catch(() => undefined); }, 400); return () => window.clearTimeout(id); }, []);   // 기사 한 장 = 바로(PC 는 첫 화면에 보임) · SNS · 채널 = 조금 뒤 · 못 받으면 = 쓸 때 다시 받음
  const [init] = useState(() => keep || { n: CAP, top: 0 });
  const list = useQuery(newsListQuery), live = useQuery(feedLiveQuery), pend = useQuery(pendQuery);
  const [n, setN] = useState(init.n);   // 거르기(찾기 · 분야 · 이슈) 걷음(형 11-11 18:51) = 늘 전체
  const qa = newsFileOf(useRouterState({ select: (st) => st.location.searchStr }));   // 홈 Digest · 대기열 「열기」 · 스크랩이 넘긴 기사(#/newsed?a=<file>)
  const [sel, setSel] = useState(qa);   // PC = 오른쪽 칸 · 폰 = 화면 통째 기사 한 장
  useEffect(() => { if (qa) setSel(qa); }, [qa]);   // 이미 4번에 있을 때 다른 기사를 넘겨받아도 그 기사로
  const all = useMemo(() => {   // 정적 + 빌드 전 새 요약(「뉴스 요약」과 같은 합침)
    const st = (list.data?.arts || []) as FArt[], have = new Set(st.map((a) => a.file)), add = (live.data || []).filter((x) => !have.has(x.file));
    return add.length ? [...add, ...st].sort(byFile) : st;
  }, [list.data, live.data]);
  const byId = useMemo(() => new Map(all.map((a) => [a.file, a])), [all]);
  const rows = all;
  const shown = rows.slice(0, n);
  const [seenN, setSeenN] = useState(0);   // 실패 줄 「취소」 = 이 기기 확인 목록(./q-acts.ts qfSeenOne) → pickQ 가 거름 · 다시 셈
  const qs = useMemo(() => (pend.data ? pickQ(pend.data.items, byId, pend.data.qf) : []), [pend.data, byId, seenN]);   // eslint-disable-line react-hooks/exhaustive-deps
  const qRedo = (it: QItem) => qRetry(it, go).then((why) => { if (!why) { setSeenN((n) => n + 1); void pend.refetch(); } return why; });
  const qDrop = (it: QItem) => { qfSeenOne(it.id); setSeenN((n) => n + 1); };
  const cur = wide ? (sel && byId.has(sel) ? sel : shown[0]?.file || "") : sel;   // PC 처음 = 맨 위 카드

  const left = useRef<HTMLDivElement>(null), sent = useRef<HTMLDivElement>(null), restored = useRef(false);
  useEffect(() => { keep = null; }, []);
  useEffect(() => {   // 폰: 기사 한 장에서 「목록」 = 보던 자리 · 처음 = 남긴 자리
    if (sel && !wide) return;
    const el = left.current; if (!el) return;
    if (!restored.current && list.data) { restored.current = true; if (init.top) el.scrollTop = init.top; }
  }, [sel, wide, list.data]);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {   // 바닥 300px 전 = +10(「뉴스 요약」과 같음)
    const el = sent.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) setN((v) => v + CAP); }, { root: left.current, rootMargin: "300px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [shown.length, rows.length, sel, wide]);
  const topOf = useRef(0);
  const open = (a: FArt) => {
    // 빌드 전 새 요약(_live)도 앱 안 기사 한 장(본문 동봉 · 옛 기사 창 엔진이 /api/feedlive 줄을 같이 읽음) — 전엔 옛 에디터 그 기사 창으로 넘김(형 11-10 12:17 「기존 앱 화면으로 가서 받는게 아니라 자체로」)
    if (!wide) topOf.current = left.current?.scrollTop || 0;
    setSel(a.file);
  };
  const back = () => { setSel(""); if (qa) go("/newsed"); requestAnimationFrame(() => { if (left.current) left.current.scrollTop = topOf.current; }); };   // 넘겨받은 기사에서 「목록」 = 주소의 ?a 도 뗌(다시 그 기사로 안 튐)

  const body = (
    <div ref={left} className="nm-ned-l" hidden={!wide && !!sel}>
      {/* 맨 위 「지금 뜨는 말」 줄 뺌(형 11-11 09:02 봄 1:1 「상단에 인기검색어 없어도 되고 네비게이션 아이콘으로 누르면 뉴스 요약으로 이동만 가능하면 됨」) · 넣는 줄(링크·글 + 전송 + 픽)도 뺌(형 14:36 봄 1:1 「글 붙여넣기는 없어두대! 우하단에 버튼으로 요약만 잇으면 댐」) */}
      {pend.isError ? <p className="nm-chan-msg" role="status">대기열을 못 읽었어</p> : qs.length ? <TaskPanel qs={qs} eta={pend.data?.eta || null} onRetry={qRedo} onDismiss={qDrop} onOpen={() => go("/edq")} /> : null}
      {/* 알약 줄(전체 · 이슈 · 분야 여섯 · 찾기)과 찾기 칸 걷음(형 11-11 18:51 봄 1:1 「이거 필터 없어도 되고. 상단에 분류도 없어도 됨 바로 내용 나와도댐」) = 머리 막대 바로 밑부터 카드 · 앞 판 = git */}
      {list.isPending ? <p className="nm-chan-msg">기사 읽는 중…</p> : list.isError ? <p className="nm-chan-msg" role="alert">{(list.error as Error).message || "뉴스 요약을 못 읽었어"}</p> : !rows.length ? <p className="nm-chan-msg">기사가 없어</p> : (
        <ul className="nm-ned-list">{shown.map((a) => <li key={a.file}><SumCard a={a} lean kind={kindOf(a) || (a.issue ? "iss" : "")} on={wide && a.file === cur} onOpen={() => open(a)} /></li>)}</ul>
      )}
      {rows.length > shown.length ? <><div ref={sent} aria-hidden className="nm-feed-sent" /><button type="button" className="nm-ned-more" onClick={() => setN((v) => v + CAP)}>더 보기 +{Math.min(CAP, rows.length - shown.length)} · 남은 {rows.length - shown.length}건</button></> : null}
    </div>
  );
  const fab = wide || mouse || sel ? null : <PlusFan go={go} />;   // 오른쪽 아래 「+」 펼침 = 폰만(형 19:23 · 앞 판 = 「+ 요약」 알약 하나 · 형 14:36) · PC 두 칸 = 0(형 11-20 19:41 dm-gik 깃 옮김 「글구 우하단에 요거 없앨게. 그냥 피시에서」 · 요약 · 에디터는 메뉴 줄 그대로)
  const news = wide ? (
    <div className="nm-ned wide" hidden={tab !== "news"}>
      {body}
      {fab}
      <div className="nm-ned-r art">{cur ? <Suspense fallback={artWait}><ArtPane file={cur} /></Suspense> : <p className="nm-chan-msg">왼쪽 카드를 누르면 여기 기사 한 장이 떠</p>}</div>
    </div>
  ) : (
    <div className="nm-ned" hidden={tab !== "news"}>
      {body}
      {fab}
      {sel ? (
        <div className="nm-ned-one art">
          <button type="button" className="nm-ned-back" onClick={back}><DuetIcon name="chevronLeft" size={16} />목록</button>
          <Suspense fallback={artWait}><ArtPane file={sel} /></Suspense>
        </div>
      ) : null}
    </div>
  );
  return (
    <div className={`nm-ned-wrap${wide ? " wide" : ""}`}>
      {wide || (sel && tab === "news") ? null : <NedTabs tab={tab} pick={pick} />}   {/* 폰만 = 화면 안 폴더 탭(PC 는 맨 위 메인 탭 줄 · ./area-tabs.tsx · 형 11-15 「탭이 메인탭 라인으로 가는거지」) · 폰 기사 한 장 = 화면 통째 그대로(탭 줄 없이 · 「목록」으로 돌아옴) */}
      {news}
      {(["sns", "chan"] as const).map((k) => alive.current.has(k) ? (
        <div key={k} className="nm-scroll nm-ned-old" hidden={tab !== k}>   {/* nm-scroll = 옛 탭 엔진이 찾는 스크롤 판(./old-tabs/engine.ts __sc) */}
          <Suspense fallback={<div className="nm-lazy" role="status" aria-label="읽는 중"><i /><i /><i /></div>}>{k === "sns" ? <SnsTab /> : <ChanTab />}</Suspense>
        </div>
      ) : null)}
    </div>
  );
}
