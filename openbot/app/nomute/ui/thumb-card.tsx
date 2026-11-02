// 썸네일 카드(읽기만 · ① 판) — 에디터 녹기 「썸네일부터」(형 11-01 10:17 결정 단추) · 안 = claude-state 공통/문서/2026-11-02-썸네일-녹기/안.md(윈터)
//   글에 card: {kind:'thumb', day, stem} 칸이 있으면 그 글 말풍선 밖 바로 아래에 그림으로 붙음(형 11-02 11:32 「섬네일카드는 요약 대화 밖 이미지 처럼 주면 좋음」 · 자리 = 별 방 요약 글 · 칸은 서버가 박음)
//   데이터 = GET /api/office/thumb?day=&stem=(봄 · 길 이름은 봄이 정함 · thumb_draft.json 그대로 + 그림 공개 주소) · 그림 = 가로 480 판 있으면 그것(윈터 · draft/thumbnail-480.webp) · 없으면 원본
//   고치기·2안 전환·배경 고르기·다시 그리기·이걸로 = 다음 판들(②~⑤)
import { useQuery } from "@tanstack/react-query";
import { office } from "../data/office";
import "./thumb-card.css";

export type ThumbRef = { kind: "thumb"; day: string; stem: string };
type Variant = { name?: string; lines?: string[]; note?: string };
type Conflict = { line?: number; kind?: string; why?: string };
type Draft = { image?: string; image_small?: string; lines?: string[]; variants?: Variant[]; title_rule?: string; conflicts?: Conflict[]; bg?: { kind?: string; reason?: string; src?: string } };

const WHY: Record<string, string> = { tail_cut: "끝이 잘림", hook_missing: "후킹 없음", num_conflict: "숫자 어긋남", head_cut: "앞이 잘림" };
const BG: Record<string, string> = { search_photo: "검색 사진", gen_image: "생성 그림", article_photo: "기사 사진" };

/** 「*강조*」 = 강조 칸 · 나머지는 글 그대로 */
function Line({ t }: { t: string }) {
  const parts = t.split(/(\*[^*]+\*)/g).filter(Boolean);
  return <>{parts.map((p, i) => (p.startsWith("*") && p.endsWith("*") ? <b key={i}>{p.slice(1, -1)}</b> : <span key={i}>{p}</span>))}</>;
}

export function ThumbCard({ card }: { card: ThumbRef }) {
  const q = useQuery({
    queryKey: ["thumb-card", card.day, card.stem],
    queryFn: () => office<Draft>(`thumb?day=${encodeURIComponent(card.day)}&stem=${encodeURIComponent(card.stem)}`),
    staleTime: 60e3,
  });
  const d = q.data;
  if (q.isLoading) return <div className="nm-thumb is-wait" aria-busy>썸네일 초안 읽는 중…</div>;
  if (!d) return null;   // 못 읽음 = 카드 없이(글은 그대로)
  const lines = d.lines || [], second = (d.variants || []).find((v) => v.name !== d.title_rule && v.lines?.length);
  const bad = new Map((d.conflicts || []).map((c) => [c.line ?? -1, WHY[c.kind || ""] || c.why || "확인 필요"]));
  const src = d.image_small || d.image;
  return (
    <div className="nm-thumb" role="group" aria-label="썸네일 초안">
      {src ? <a className="nm-thumb-img" href={d.image || src} target="_blank" rel="noopener"><img src={src} alt="썸네일 초안" loading="lazy" decoding="async" /></a> : null}
      <div className="nm-thumb-h"><span>썸네일 초안</span><i>1안</i></div>
      <ul className="nm-thumb-lines">
        {lines.map((t, i) => <li key={i} className={bad.has(i) ? "warn" : undefined}>{bad.has(i) ? <span className="dot" title={bad.get(i)} aria-label={bad.get(i)} /> : null}<Line t={t} />{bad.has(i) ? <em>{bad.get(i)}</em> : null}</li>)}
      </ul>
      {second ? <p className="nm-thumb-alt"><span>2안</span>{second.lines!.map((t, i) => <span key={i} className="l"><Line t={t} /></span>)}</p> : null}
      {d.bg?.kind ? <p className="nm-thumb-bg">배경 · {BG[d.bg.kind] || d.bg.kind}</p> : null}
    </div>
  );
}
