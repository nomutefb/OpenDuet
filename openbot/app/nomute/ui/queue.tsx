// 서랍 「대기열」 = 에디터 대기열 창(/?pop=queue · viewer-src/33-openQueue.part)을 앱 안으로(봄 11-01 · 형 「눌렀을때 웹으로 연결된 부분이 많아서 불편했어..」)
//   원본 그대로 옮긴 것 = 줄 = 시간 | 제목(40자) | 상태 | 바로가기 · 5줄씩 넘김(창 5칸) · 줄 세우기(도는 것 먼저 · 그다음 최신) · 실효 상태 qEff(완료인데 피드에 아직 없으면 처리 중 · 20분 넘으면 「대기」)
//     · 이 기기 기록 셋 = 에디터와 같은 열쇠(같은 사이트라 같이 씀): 취소 nomute_q_cancelled · 내역 지우기 nomute_q_cleared · 픽 접수분 nomute_q_optimistic(15분 · 서버에 뜨면 회수)
//     · 회색(갈 곳 없음) 누름 = 취소 두 번 누름(1번 = 휴지통 3초 · 2번 = 확정 ✓ 1.2초 뒤 줄 회수) · 추적만 끊음(파이프라인 멈추는 길 없음 = 원본 한계 그대로)
//   다른 것 = 완료 「열기」 = 에디터 기사 창 대신 앱 안 기사 한 장(#/news?a=<file> · 시아 news-detail) · 원문 = 앱 안 한 겹(inapp)
//     · 실패 「재시도」(다시 분석 api/pick · 요약요청 전문 복원) = 돈 드는 쓰기라 에디터 대기열 한 겹(시아 뉴스 판과 같은 원칙 · 「에디터에서」)
import "./yeta-settings.css";
import "./chan.css";
import "./queue.css";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { inAppHref } from "./inapp";
import { getJson, newsListQuery, useGo } from "./news-data";
import { Pane } from "./pane";
import { YICO } from "./yeta-icons";

type QItem = { id?: string; t?: number; title?: string; via?: string; key?: string; alt1?: string; status?: string; tries?: number; preset?: Record<string, boolean>; _opt?: 1 };
type Opt = { id: string; url: string; title: string; t: number; retryOf?: string };

const PER = 5;   // 원본 QPER(창 5칸)
const LAG_MIN = 20;   // 원본 Q_LAG_MIN = api/pending STUCK_MIN
const OPT_TTL = 15 * 60000, OPT_SKEW = 2 * 60000;   // 원본 QOPT_TTL · QOPT_SKEW
const ED_QUEUE = "/web?u=" + encodeURIComponent("/?pop=queue&inapp=1");
const PP_LBL: Record<string, string> = { h24: "24h", fp: "외신", mj: "주요", og: "원본" };   // 원본 PP_LBL

const ls = <T,>(k: string, v: T): T => { try { const x = JSON.parse(localStorage.getItem(k) || "null"); return (x ?? v) as T; } catch { return v; } };
const lsSet = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 사생활 창 */ } };
const normU = (u?: string) => String(u || "").trim().replace(/\/+$/, "");   // 원본 _normU(api/pending key 와 같은 꼴)
const cxlId = (it: QItem) => String(it.id || it.key || it.t || "");   // 원본 qCxlId
const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };

/** 원본 qOptLive + qOptMerge — 서버가 아직 모르는 픽 접수분만 붙이고 착지·만료분은 기록에서 지움 */
function withOpt(items: QItem[]): QItem[] {
  const now = Date.now(), all = ls<Opt[]>("nomute_q_optimistic", []);
  const landed = (o: Opt) => items.some((it) => it.key && normU(it.key) === normU(o.url) && String(it.id) !== o.retryOf && (!it.t || it.t >= o.t - OPT_SKEW));
  const keep = (Array.isArray(all) ? all : []).filter((o) => o && o.url && now - o.t < OPT_TTL && !landed(o));
  if (keep.length !== all.length) lsSet("nomute_q_optimistic", keep);
  return items.concat(keep.map((o) => ({ id: o.id, t: o.t, status: "processing", via: "URL", key: o.url, title: o.title || host(o.url), _opt: 1 })));
}
/** 원본 qCxlFilter — 취소분 빼고 · 서버에서 사라진 취소 기록은 정리 */
function withoutCancelled(items: QItem[]): QItem[] {
  const s = new Set(ls<string[]>("nomute_q_cancelled", [])); if (!s.size) return items;
  const live = new Set(items.map(cxlId)), keep = [...s].filter((id) => live.has(id));
  if (keep.length !== s.size) lsSet("nomute_q_cancelled", keep);
  return items.filter((it) => !s.has(cxlId(it)));
}
const ago = (t?: number) => {   // 원본 qAgo(+ relAge 사다리)
  if (!t) return "?";
  const m = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (m < 1) return "방금"; if (m < 60) return `${m}분 전`;
  const h = m / 60; if (h < 24) return `${Math.floor(h)}시간 전`;
  const d = Math.floor(h / 24); return d < 7 ? `${d}일 전` : d < 30 ? `${Math.floor(d / 7)}주일 전` : `${Math.floor(d / 30)}개월 전`;
};

const queueQuery = queryOptions({
  queryKey: ["nomute", "queue-pending"], staleTime: 10_000,
  refetchInterval: (q) => ((q.state.data?.items || []).some((it) => it.status === "processing" || it.status === "retry") ? 20_000 : 60_000),
  queryFn: async () => { const d = await getJson<{ items?: QItem[] }>(`/api/pending?_=${Date.now()}`); return { items: (d.items || []).filter(Boolean) }; },
});

export function QueueModal() {
  const go = useGo();
  const q = useQuery(queueQuery), arts = useQuery(newsListQuery);
  const [page, setPage] = useState(0), [, bump] = useState(0), [arm, setArm] = useState(""), [done, setDone] = useState("");
  const armT = useRef(0);
  useEffect(() => () => clearTimeout(armT.current), []);
  const files = new Map((arts.data?.arts || []).filter((a) => a && a.file).map((a) => [String(a.file).replace(/\.md$/, ""), a]));
  const match = (id?: string) => (id ? files.get(String(id).replace(/\.md$/, "")) : undefined);   // 원본 qMatch(.md 있든 없든)
  const eff = (it: QItem) => {   // 원본 qEff
    if (it.status !== "succ" || match(it.id)) return it.status || "";
    return (it.t ? (Date.now() - it.t) / 60000 : 0) >= LAG_MIN ? "lag" : "processing";
  };
  const cut = ls<number>("nomute_q_cleared", 0) || 0;
  const prog = (it: QItem) => { const e = eff(it); return e === "processing" || e === "retry" ? 0 : 1; };
  const items = q.data ? withoutCancelled(withOpt(q.data.items)).filter((it) => !it.t || it.t > cut).sort((a, b) => prog(a) - prog(b) || (b.t || 0) - (a.t || 0)) : [];
  const pages = Math.max(1, Math.ceil(items.length / PER)), cur = Math.min(page, pages - 1), slice = items.slice(cur * PER, cur * PER + PER);
  const busy = items.filter((it) => { const e = eff(it); return e === "processing" || e === "retry"; }).length;
  const cancel = (it: QItem) => {   // 원본 qCancelTap — 1번 = 휴지통(3초) · 2번 = 확정
    const id = cxlId(it);
    if (arm !== id) { setArm(id); clearTimeout(armT.current); armT.current = window.setTimeout(() => setArm(""), 3000); return; }
    clearTimeout(armT.current); setArm(""); setDone(id);   // ✓ 잔상 1.2초 뒤 기록·줄 회수(원본 thumb 1200 동값 · 먼저 쓰면 그 자리에서 사라짐)
    window.setTimeout(() => { lsSet("nomute_q_cancelled", [...new Set([...ls<string[]>("nomute_q_cancelled", []), id])]); setDone(""); bump((n) => n + 1); }, 1200);
  };
  const Chev = () => <span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} />;
  return (
    <Pane title="대기열">
      <div className="yeta-set mt-2">
        <div className="ycd-card card-left nm-chan nm-q">
          <span className="ycd-nm yset-ttl">대기열{busy ? <i className="nm-q-busy">처리 중 {busy}</i> : null}</span>
          {q.isLoading ? <p className="nm-chan-msg">대기열 읽는 중…</p> : q.isError ? <p className="nm-chan-msg" role="alert">대기열 조회 실패 — 다시 열어 줘</p> : !items.length ? <p className="nm-chan-msg">최근 내역 없음</p> : (
            <div className="nm-q-list" role="list">
              {slice.map((it) => {
                const e = eff(it), id = cxlId(it), a = e === "succ" ? match(it.id) : undefined, url = /^https?:\/\//i.test(String(it.alt1 || it.key || "")) ? String(it.alt1 || it.key) : "";
                const title = (a?.title || it.title || (e === "succ" ? "분석 완료" : "(내용 없음)")), cp = [...title], short = cp.length > 40 ? cp.slice(0, 40).join("") + "…" : title;
                const am = it.t ? (Date.now() - it.t) / 60000 : 1e9, tc = am <= 60 ? " new" : am <= 240 ? " mid" : "";   // 원본 qt-new(≤1h) · qt-mid(1~4h)
                const pp = it.preset ? ["h24", "fp", "mj", "og"].filter((k) => it.preset?.[k]).map((k) => PP_LBL[k]).join(" · ") : "";
                const isDone = done === id, armed = arm === id;
                return (
                  <div key={id} role="listitem" className={`nm-q-row q-${isDone ? "cxl" : e}`}>
                    <span className={`qt${tc}`}>{ago(it.t)}</span>
                    <span className="qm" title={title}><i>{short}</i>{pp ? <span className="pp">{pp}</span> : null}</span>
                    <span className="qs">{isDone ? <b className="cxl">취소</b> : e === "succ" ? <b className="ok">완료</b> : e === "fail" ? <b className="bad">실패</b> : e === "lag" ? <b className="lag" title="분석 완료 · 피드 배포 반영 대기">대기</b>
                      : <span className={`spin${e === "retry" ? " re" : ""}`} title={e === "retry" ? `API 일시 과부하 — 자동 재시도 중${it.tries ? ` (${it.tries}회)` : ""}` : "분석 처리 중"} aria-label={e === "retry" ? "재시도 중" : "처리 중"} />}</span>
                    <span className="qa">
                      {isDone ? <span className="ok">✓</span>
                        : e === "succ" && a ? <button type="button" className="go ok" onClick={() => go(`/news?a=${encodeURIComponent(a.file)}`)}>열기</button>
                        : e === "fail" ? <button type="button" className="go arm" onClick={() => go(ED_QUEUE)} title={it.via === "요약요청" ? "요청 내용을 복원해 다시 요약 — 에디터 대기열에서" : "다시 분석 — 에디터 대기열에서"}>재시도</button>
                        : url ? <button type="button" className="go src" onClick={() => { const h = inAppHref(url); if (h) go(h); else window.open(url, "_blank", "noopener"); }} title={e === "lag" ? "원문 — 요약은 배포 반영 뒤 열림" : "원문"}>원문</button>
                        : <button type="button" className={`go ${armed ? "arm" : "gray"}`} onClick={() => cancel(it)} aria-label={armed ? "한 번 더 누르면 이 요청 취소" : "이 요청 취소"} title={armed ? "한 번 더 누르면 이 요청 취소" : "갈 곳 없음 · 누르면 이 요청 취소"}>{armed ? "취소?" : "—"}</button>}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          {pages > 1 ? (
            <div className="nm-q-pg" role="navigation" aria-label="대기열 쪽">
              <button type="button" disabled={cur === 0} onClick={() => setPage(cur - 1)} aria-label="앞 쪽">‹</button>
              {Array.from({ length: Math.min(5, pages) }, (_, k) => { const end = Math.min(pages, Math.max(0, cur - 2) + 5), i = Math.max(0, end - 5) + k; return <button key={i} type="button" className={i === cur ? "on" : ""} onClick={() => setPage(i)}>{i + 1}</button>; })}
              <button type="button" disabled={cur === pages - 1} onClick={() => setPage(cur + 1)} aria-label="다음 쪽">›</button>
            </div>
          ) : null}
          <div className="ypc-acts nm-chan-acts"><button type="button" className="ypc-go" onClick={() => go(ED_QUEUE)}>에디터 대기열 <Chev /></button></div>
        </div>
      </div>
    </Pane>
  );
}
