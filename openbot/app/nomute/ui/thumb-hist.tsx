// 서랍 「썸네일 이력」(형 11-01 「그 내 뉴스 에디터에서 쓰는 썸네일, 그리고 뉴스 요약 보는 것들. 그런것들 완전히 내재화 부탁해.」)
//   원본 = 에디터 썸네일 생성기 「이전 제작」(전 기기 공통 인덱스 /thumb-hist.json · build-viewer.mjs = [{url, dlname, cap, varStr, ts, src?}] 최신순 400장 · 포스트·릴스·카드뉴스·리사이즈·AI 생성·번역)
//   보기·받기만(에디터 규약도 읽기 전용) — 바둑판 · 누르면 크게(넘김 · 저장) · 만들기·수정 = 에디터 도구 창 한 겹
import "./yeta-settings.css";
import "./chan.css";
import "./news.css";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { abs, getJson, useGo } from "./news-data";
import { Pane } from "./pane";
import { type Pic, Zoom } from "./thumb-strip";
import { YICO } from "./yeta-icons";

type Hist = { url?: string; dlname?: string; cap?: string; varStr?: string; ts?: number };
const PAGE = 60;
const day = (ts?: number) => { if (!ts) return ""; const d = new Date(ts + 9 * 36e5); return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`; };

export function ThumbHist() {
  const go = useGo();
  const [n, setN] = useState(PAGE), [zoom, setZoom] = useState<number | null>(null), [bad, setBad] = useState<Set<string>>(() => new Set());   // bad = 못 읽은 사진(칸째 뺌 · 크게 보기 넘김에서도 뺌)
  const q = useQuery({
    queryKey: ["nomute", "thumb-hist"], staleTime: 60_000,
    queryFn: () => getJson<Hist[]>(`/thumb-hist.json?_=${Date.now()}`).then((d) => (Array.isArray(d) ? d : []).filter((x) => x && x.url).sort((a, b) => (b.ts || 0) - (a.ts || 0))),
  });
  const all = (q.data || []).filter((h) => !bad.has(h.url!)), shown = all.slice(0, n);
  const pics: Pic[] = shown.map((h) => { const src = abs(h.url); return { src, name: h.dlname || src.split("/").pop()?.split("?")[0] || "thumb.png", label: `${h.cap || "썸네일"}${h.varStr || ""}` }; });
  return (
    <Pane title="썸네일 이력">
      <div className="yeta-set mt-2">
        <div className="ycd-card card-left nm-chan nm-th-hist">
          <span className="ycd-nm yset-ttl"><span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.screen }} />썸네일 이력{q.data ? <i className="nm-chan-at">{all.length.toLocaleString("ko-KR")}장</i> : null}</span>
          {q.isPending ? <p className="nm-chan-msg">이력 읽는 중…</p> : q.isError ? <p className="nm-chan-msg" role="alert">{q.error.message === "404" || q.error.message === "html" ? "이력 파일이 아직 없어" : `이력을 못 읽었어 — ${q.error.message}`}</p> : !q.data.length ? <p className="nm-chan-msg">만든 썸네일이 아직 없어</p> : !all.length ? <p className="nm-chan-msg">사진을 못 읽었어 — 새로 고쳐 다시</p> : (
            <ul className="nm-th-grid">
              {shown.map((h, i) => (
                <li key={`${i}:${h.url}`}>
                  <button type="button" aria-label={`${pics[i].label} 크게`} onClick={() => setZoom(i)}>
                    <img src={pics[i].src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setBad((s) => new Set(s).add(h.url!))} />
                  </button>
                  <span className="nm-th-gcap"><b>{pics[i].label}</b><i>{day(h.ts)}</i></span>
                </li>
              ))}
            </ul>
          )}
          {all.length > n ? <button type="button" className="yset-chip nm-news-more" onClick={() => setN((v) => v + PAGE)}>더 보기 ({all.length - n})</button> : null}
          <div className="ypc-acts nm-chan-acts"><button type="button" className="ypc-go" onClick={() => go("/web?u=" + encodeURIComponent("/?tool=thumb&inapp=1"))}>에디터에서 만들기 <span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} /></button></div>
        </div>
      </div>
      {zoom != null ? <Zoom pics={pics} at={zoom} onClose={() => setZoom(null)} /> : null}
    </Pane>
  );
}
