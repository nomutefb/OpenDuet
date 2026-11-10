// 서랍 「뉴스 요약」 기사 한 장(앱 안 · 형 11-01 「그 내 뉴스 에디터에서 쓰는 썸네일, 그리고 뉴스 요약 보는 것들. 그런것들 완전히 내재화 부탁해.」)
//   원본 = 에디터 viewer/index.html open()(요약 창) — 머리(분류·매체·기자·시각) · AI 제목(본문 첫 H1) · 기자 제목(a.title 이 다를 때) · 원문 제목(title_orig) · 썸네일 후보 · 본문 마크다운 · 카드뉴스 · 원문
//   본문 = /detail/<file>.json(에디터 ensureDetail 과 같은 판 셈) · 그리기 = 대화창·이슈와 같은 streamdown · 다듬기 = 에디터 decorate 의 가벼운 판(썸네일 소절·머리 이모지·편향 색도형 뺌)
//   맨 아래 = 「요약 고치기」(앱 안 · ./summary-fix.tsx = 옛 요약 창 ✏️요약 수정 api/revise) — 전엔 「에디터에서 고치기」 = 옛 에디터 그 기사 창(형 11-10 12:17 「기존 앱 화면으로 가서 받는게 아니라 자체로」)
import { useQuery } from "@tanstack/react-query";
import { Streamdown } from "streamdown";
import { markdownComponents } from "@/lib/markdown";
import { feedLiveQuery } from "./feed";
import { type Art, Miss, biasOf, catOf, detailQuery, inAppClick, mediaOf, newsListQuery, progOf, sensOf, useGo, whenOf } from "./news-data";
import { SummaryFix } from "./summary-fix";
import { CardStrip, ThumbStrip } from "./thumb-strip";
import { YICO } from "./yeta-icons";

const MD_BOX = { lineNumbers: false, controls: { code: { copy: true, download: false } } } as const;   // 복사 창 = 대화창과 같은 꼴(초안 박스 복사)
const EMOJI0 = /^\s*\p{Extended_Pictographic}️?\s*/u;
const BIAS_SHAPES = /[🟥🟦🟩🟨🟧🟪🟫🔴🟠🟡🟢🔵🟣⬛⬜📊✅]/gu;
/** 본문 = 첫 H1(AI 제목)은 따로 빼고 · 「썸네일」 h3 소절(제목 후보 · 위 사진 칸이 대신) 뺌 · h2/h3 머리 이모지 뺌(시사점 빼고) · 편향 색도형 뺌 — 코드 칸(```) 안은 그대로(복사 초안) */
function shape(body: string) {
  let h1 = "", fence = false, skip = false;
  const out: string[] = [];
  for (const line of body.replace(/\r\n?/g, "\n").split("\n")) {
    const edge = /^\s*(```|~~~)/.test(line);
    const h = !fence && !edge ? /^(#{1,3})\s+(.*)$/.exec(line) : null;
    if (h) {
      skip = false;   // 썸네일 소절 끝 = 다음 h1~h3(에디터 decorate ①)
      if (h[1] === "#" && !h1) { h1 = h[2].replace(EMOJI0, "").trim(); continue; }
      if (h[1] === "###" && /썸네일/.test(h[2])) { skip = true; continue; }
      if (h[1] !== "#" && !/시사점/.test(h[2])) { out.push(`${h[1]} ${h[2].replace(EMOJI0, "")}`); continue; }
    }
    if (edge) fence = !fence;
    if (skip) continue;
    out.push(fence || edge ? line : line.replace(BIAS_SHAPES, ""));
  }
  return { h1, md: out.join("\n").trim() };
}
const key = (s: string) => s.replace(EMOJI0, "").replace(/\s+/g, "");

export function NewsDetail({ file }: { file: string }) {
  const list = useQuery(newsListQuery), live = useQuery(feedLiveQuery);   // 빌드 전 새 요약 = 정적 목록엔 아직 없고 live 행(본문 동봉)에만 있음 → 앱 안에서 그대로 읽음(형 11-10 12:17 「기존 앱 화면으로 가서 받는게 아니라 자체로」)
  const a = list.data?.arts.find((x) => x.file === file) || live.data?.find((x) => x.file === file);
  if (list.isPending || (!a && live.isPending)) return <p className="nm-news-msg">기사 읽는 중…</p>;
  if (!a) return (
    <div className="yeta-set nm-nd mt-2">
      <div className="ycd-card card-left">
        <p className="nm-news-msg" role="alert">{list.isError ? (list.error as Error).message || "기사 목록을 못 읽었어" : "이 기사를 목록에서 못 찾았어 — 숨겨졌거나 지워졌을 수 있어"}</p>
        <div className="ypc-acts nm-nd-acts"><button type="button" className="ypc-go" onClick={() => { void list.refetch(); void live.refetch(); }}>다시 읽기</button></div>
      </div>
    </div>
  );
  return <Detail a={a} />;
}

function Detail({ a }: { a: Art }) {
  const go = useGo();
  const d = useQuery(detailQuery(a));
  const { h1, md } = shape(d.data?.body || "");
  const title = h1 || a.title || "(제목 없음)";
  const cat = catOf(a), bias = biasOf(a), sens = sensOf(a), pr = progOf(a);
  const kind = a.breaking ? "brk" : a.issue ? "iss" : "";   // 원본 brkIssueKind 는 나이(<4h·<24h)·경중까지 봄 — 여기선 표만(짐작 · 목록과 같음)
  const err = d.error instanceof Miss ? "요약 본문이 아직 없어 — 배포 전이거나 로그인이 끝났을 수 있어" : d.error ? `요약 본문을 못 읽었어 — ${(d.error as Error).message}` : "";
  return (
    <div className="yeta-set nm-nd mt-2">
      <div className="ycd-card card-left nm-nd-head">
        <span className="nm-nd-meta">
          {cat ? <b className={`cat ${cat[1]}`}>{cat[0]}</b> : null}
          {kind ? <b className={`urg ${kind}`}>{kind === "brk" ? "긴급" : "이슈"}</b> : null}
          {a._live ? <b className="urg iss" title="목록 굽기 전 — 몇 분 뒤 썸네일 · 카드가 붙어">방금 요약</b> : null}
          <span>{[mediaOf(a.media), a.reporter, whenOf(a)].filter(Boolean).join(" · ")}</span>
        </span>
        <h1 className="nm-nd-t">{title}</h1>
        {a.title && key(a.title) !== key(title) ? <p className="nm-nd-orig"><i>기사 제목</i>{a.title}</p> : null}
        {a.title_orig ? <p className="nm-nd-orig"><i>원문 제목</i>{a.title_orig}</p> : null}
        {bias || sens.length || a.url ? (
          <span className="nm-nd-chips">
            {bias ? <span className={`nm-chip bias ${bias.cls}`}><i>편향</i>{bias.text}</span> : null}
            {sens.map((s) => <span key={s.t} className={`nm-chip${s.warn ? " warn" : ""}`} title={a.tags_why || undefined}>{s.t}</span>)}
            {a.url ? <a className="nm-chip link" href={a.url} target="_blank" rel="noopener" onClick={inAppClick(go)}>원문 <span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} /></a> : null}
          </span>
        ) : null}
        <span className="nm-nd-prog" aria-label={`진행 ${["요약", "프롬프트", "카드"].slice(0, pr.done).join("·")} 끝${pr.busy ? " · 만드는 중" : pr.fail ? " · 멈춤" : ""}`}>
          {["요약", "프롬프트", "카드"].map((s, i) => <i key={s} className={i < pr.done ? "done" : i === pr.done && pr.busy ? "cur" : i === pr.done && pr.fail ? "fail" : ""}>{s}</i>)}
        </span>
      </div>
      <ThumbStrip a={a} />
      <div className="ycd-card card-left">
        {d.isPending ? <><p className="nm-news-msg">요약 본문 읽는 중…</p>{a.summary ? <p className="nm-nd-sum">{a.summary}</p> : null}</>
          : err ? <><p className="nm-news-msg" role="alert">{err}</p>{a.summary ? <p className="nm-nd-sum">{a.summary}</p> : null}</>
          : md ? <div className="nm-issue-md nm-nd-md"><Streamdown {...MD_BOX} components={markdownComponents}>{md}</Streamdown></div>
          : <p className="nm-news-msg">{a.summary || "요약 본문이 비어 있어"}</p>}
      </div>
      <CardStrip a={a} />
      <SummaryFix a={a} />
    </div>
  );
}
