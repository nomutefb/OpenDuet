// 뉴스 에디터 기사 한 장 = 옛 에디터 「기사 창」(viewer/index.html <dialog id="dlg"> · /?old&a=<file>)을 그 칸 안에 직접 붙임
//   형 11-15 「우측에 이내용, 예~전 뉴스요약 부분 혹시 찾을수있으면 그게 더 훌륭하거든? 그때 시안을 여기에 붙일 수 있나? 만약에 붙일수잇으면 그걸 여기에 가져오고 지금건 없애면될거같아.」 · (옛 창 사진에) 「어 저거맞음」 「맞어!!!」
//      「저게 시안대신 라임만 들어가면됨.」 · 「저기에 있는 거의 모든 카드뉴스 제작부터해가지고, 지금 안가져온게 있으면 더 가져와야해」
//   채널 · SNS(./index.tsx)와 같은 길 = 판 · 엔진 · 옷을 떼어 앱 코드로(품기 iframe 아님): 판 ./markup-art.ts · 엔진 ./engine-art.ts(원본 줄 그대로) · 옷 ./art.gen.css(.oa 안) — 셋 다 ./tools 가 만듦 · 앱에 맞춘 덧줄 ./art.css
//   채널 · SNS 조각과 따로 받는 조각(이 파일이 들머리) — 뉴스 에디터를 열면 뒤에서 미리 받음(../news-editor.tsx oldArt)
//   모달 아님 = 칸 안에 박힘(뒤 막 · 닫기 × 없음 · 뒤로 가기 기록 0 · 폰 = 뉴스 에디터 「목록」 단추) · 기사 바꿈 = 엔진을 살려 둔 채 그 기사만 다시 그림(목록 3.9MB 를 다시 안 읽음)
//   기사 목록 = 앱이 읽은 것(../news-data.ts newsListQuery · 15초 안 것은 그대로 씀) → 왼쪽 카드와 같은 자료 · 앱 목록이 새로 오면 열린 기사도 따라 고쳐 그림(원본 60초 폴 대신 = 따로 도는 타이머 0)
//   「+ AI」 = 앱 이미지 생성 창(../thumb-gen.tsx GenPane · 같은 /api/genimg) — 옛 #genidlg(스튜디오 탭과 한 몸)는 안 가져옴
import "./art.gen.css";
import "./art.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { Marked } from "marked";
import { type RefObject, memo, useEffect, useRef, useState } from "react";
import { feedLiveQuery } from "../feed";
import { type Art, newsListQuery } from "../news-data";
import { GenPane, PendSlot, usePendWatch } from "../thumb-gen";
import { startOldArt } from "./engine-art";
import { ART_HTML } from "./markup-art";

const HTML = { __html: ART_HTML };
const md = new Marked({ breaks: true });   // 옛 화면 = marked.setOptions({ breaks:true }) · 여기선 따로 만든 것(앱 다른 곳의 marked 설정을 안 건드림)
type Eng = { show: (file: string) => Promise<void>; refresh: () => unknown; stop: () => void };

/** 판 = 한 번 그리면 손 안 댐(엔진이 안을 채움 · 다시 그리면 채운 것이 지워짐) */
const Board = memo(function Board({ box }: { box: RefObject<HTMLDivElement | null> }) {
  return <div ref={box} className="oa" dangerouslySetInnerHTML={HTML} />;
});

/** 「+ AI」 = 앱 이미지 생성 창 · 만드는 중 칸(이 기기 · ../thumb-gen.tsx 그대로) */
function GenBox({ a, open, close }: { a: Art; open: boolean; close: () => void }) {
  const pend = usePendWatch(a).filter((p) => p.kind === "gen");
  if (!open && !pend.length) return null;
  return (
    <div className="yeta-set nm-oa-gen">
      <section className="ycd-card card-left nm-th" aria-label="AI 이미지 생성">
        {open ? (
          <>
            <div className="nm-th-top"><span className="nm-th-ttl">AI 이미지 생성</span><span className="nm-th-tools"><button type="button" className="yset-chip" onClick={close}>닫기</button></span></div>
            <GenPane a={a} onDone={close} />
          </>
        ) : null}
        {pend.length ? <div className="nm-oa-pend" role="list">{pend.map((p) => <PendSlot key={p.id} a={a} p={p} />)}</div> : null}
      </section>
    </div>
  );
}

export function ArtPane({ file }: { file: string }) {
  const qc = useQueryClient(), list = useQuery(newsListQuery), live = useQuery(feedLiveQuery);
  const eng = useRef<Eng | null>(null), el = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<"first" | "ok" | "miss">("first");   // first = 첫 기사를 그리기 전(빈 판 가림) · 그 뒤 기사 바꿈 = 앞 기사를 둔 채 다 받으면 바꿔 그림(깜빡임 0 · 원본 open() 과 같음)
  const [gen, setGen] = useState("");
  const want = useRef(file); want.current = file;
  useEffect(() => {
    if (!el.current) return;
    const host = {
      feed: async () => { const d = await qc.fetchQuery({ ...newsListQuery, staleTime: 15_000 }); return { articles: d.arts, count: d.count, generated: d.generated }; },
      miss: (f: string) => { if (f === want.current) setState("miss"); },
      gen: (f: string) => setGen(f),
      marked: md, purify: DOMPurify,
    };
    try { eng.current = startOldArt(el.current, host) as Eng; } catch (e) { console.error("[옛 기사 창] 시작 실패", e); }
    return () => { try { eng.current?.stop(); } catch { /* 이미 걷힘 */ } eng.current = null; };
  }, [qc]);
  useEffect(() => {
    let on = true;
    setGen(""); setState((s) => (s === "miss" ? "first" : s));
    void eng.current?.show(file).then(() => { if (on) setState((s) => (s === "miss" ? s : "ok")); }, (e) => { console.error("[옛 기사 창] 그리기 실패", e); if (on) setState("ok"); });
    return () => { on = false; };
  }, [file]);
  const at = list.dataUpdatedAt, first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } void eng.current?.refresh(); }, [at]);   // 앱 목록이 새로 옴 = 열린 기사도 따라(카드 상태 · 썸네일이 바뀌었으면 그 칸만 다시 그림 · 원본 load())
  const a = list.data?.arts.find((x) => x.file === file) || live.data?.find((x) => x.file === file);   // 「+ AI」 창이 쓸 그 기사 줄(빌드 전 새 요약 = live 줄)
  return (
    <div className={`nm-oa${state === "ok" ? "" : " " + state}`}>
      {a ? <GenBox a={a} open={gen === file} close={() => setGen("")} /> : null}
      {state === "miss" ? (
        <div className="nm-oa-msg" role="alert">
          <p>{list.isError ? (list.error as Error).message || "기사 목록을 못 읽었어" : "이 기사를 목록에서 못 찾았어 — 숨겨졌거나 지워졌을 수 있어"}</p>
          <button type="button" className="nm-ned-more" onClick={() => { setState("first"); void Promise.resolve(eng.current?.refresh()).then(() => eng.current?.show(file)).then(() => setState((s) => (s === "miss" ? s : "ok"))); }}>다시 읽기</button>
        </div>
      ) : state === "first" ? <p className="nm-oa-msg" role="status">기사 읽는 중…</p> : null}
      <Board box={el} />
    </div>
  );
}
