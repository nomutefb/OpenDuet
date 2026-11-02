// 썸네일 카드(읽기만 · ① 판) — 에디터 녹기 「썸네일부터」(형 11-01 10:17 결정 단추) · 안 = claude-state 공통/문서/2026-11-02-썸네일-녹기/안.md(윈터)
//   자리 = 별 「[요약 완료]」 글 말풍선 바로 위 그림(형 11-02 11:32 「섬네일카드는 요약 대화 밖 이미지 처럼 주면 좋음」 · 11:44 「별 요약 과 함께 요약 바로 위에 오면 됨 이미지로」)
//   데이터 = GET /api/office/thumb(_thumb.js) · 글에 card:{kind:'thumb',day,stem} 이 있으면 그 초안 · 없으면 msg=<글 id> = 그 글 시각 바로 앞 초안(별은 글에 stem 을 안 실음)
//   그림 = 가로 480 판(image_small) 있으면 그것 · 누르면 원본 · 아래 작은 칩 = 「썸네일 초안」 + 걸린 줄(끝 잘림 등) · 고치기·2안·배경 고르기·다시 그리기 = 다음 판들(②~⑤)
import { useQuery } from "@tanstack/react-query";
import { office } from "../data/office";
import "./thumb-card.css";

export type ThumbRef = { kind: "thumb"; day: string; stem: string } | { kind: "thumb"; msg: string };
type Conflict = { line?: number; kind?: string; why?: string };
type Draft = { image?: string; image_small?: string; lines?: string[]; conflicts?: Conflict[] };

const WHY: Record<string, string> = { tail_cut: "끝이 잘림", hook_missing: "후킹 없음", num_conflict: "숫자 어긋남", head_cut: "앞이 잘림" };
const SUMMARY = /^\s*[-*]?\s*\[요약 완료\]/;

/** 이 글 위에 붙을 카드 — 서버가 박은 card 칸 · 없으면 별 「[요약 완료]」 글 */
export function thumbOf(m: { id: string; who?: string; text?: string; card?: ThumbRef }): ThumbRef | null {
  if (m.card?.kind === "thumb") return m.card;
  return m.who === "별" && SUMMARY.test(String(m.text || "")) ? { kind: "thumb", msg: m.id } : null;
}

export function ThumbCard({ card }: { card: ThumbRef }) {
  const qs = "msg" in card ? `msg=${encodeURIComponent(card.msg)}` : `day=${encodeURIComponent(card.day)}&stem=${encodeURIComponent(card.stem)}`;
  const q = useQuery({ queryKey: ["thumb-card", qs], queryFn: () => office<{ thumb: Draft | null }>(`thumb?${qs}`).then((j) => j.thumb), staleTime: 60e3, retry: 1 });
  const d = q.data, src = d?.image_small || d?.image;
  if (!d || !src) return null;   // 읽는 중·못 읽음·초안 없음 = 카드 없이(글은 그대로)
  const bad = (d.conflicts || []).map((c) => ({ n: (c.line ?? -1) + 1, why: WHY[c.kind || ""] || c.why || "확인 필요" }));
  return (
    <div className="nm-thumb" role="group" aria-label="썸네일 초안">
      <a className="nm-thumb-img" href={d.image || src} target="_blank" rel="noopener"><img src={src} alt={(d.lines || []).join(" / ").replace(/\*/g, "") || "썸네일 초안"} loading="lazy" decoding="async" /></a>
      <div className="nm-thumb-h">
        <i>썸네일 초안</i>
        {bad.map((b, i) => <span key={i} className="warn" title={b.why}><span className="dot" aria-hidden />{b.n > 0 ? `${b.n}줄 ` : ""}{b.why}</span>)}
      </div>
    </div>
  );
}
