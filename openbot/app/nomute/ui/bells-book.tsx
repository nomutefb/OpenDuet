// 「종과 종 사이」 — 정원 글방 책(형 11-17 02:29 봄글 방 「아니면 너네 글방 하나 정원에 파서 거기를 책처럼 구성해~~~」 · 꼴 = 뎅 · 윈터 · 뜸 02:30 ~ 02:31 · 봄 모음 장 「종과-종-사이-책-꼴.md」)
//   자료 = GET /api/office/book/bells(깃 editor c6c1e39c · 한 번에 책 통째 · 원고 = 뎅 정원이야기 · 그림 = 뜸 · 토막마다 art)
//   꼴: 표지 → 차례 → 장(날) · 쪽(종 한 번) · 토막 하나 = 그림 + 글 한 벌(한 쪽에 토막 둘이면 넘김 둘) · 쪽 맨 아래 = 종 시각 한 줄 · 쉰 종 = 「쉴게」 얇은 쪽 · 장 끝 = 형 빈 쪽(나팔꽃 하나 · 형 한 줄)
//   폰 = 위 그림 · 아래 글 · 옆으로 밀면 다음 쪽 / PC = 왼쪽 그림 · 오른쪽 글(펼친 책) · 넘김 = 가로 스크롤 맞춤(scroll-snap · 스크롤 셈 0 · 가만히 둔 화면 먹는 것 0) · ←/→ 키
//   형 빈 쪽 = 책 안에서 바로 씀(봄 02:56 「형 빈 쪽은 책 안에서 바로 쓰는 쪽으로」 · POST book/bells/note · 형 자리만 · 빈 글 = 지움)
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { fileUrl } from "../data/file-cache";
import { idOf, office, people } from "../data/office";
import { FaceImg } from "./faces";
import { GoButton } from "./go-button";
import "./bells-book.css";

type Part = { who: string; title?: string; text?: string; art?: string };
type Page = { bell: string; label?: string; rest?: boolean; art?: string; parts?: Part[] };
type Day = { day: string; title?: string; pages?: Page[]; note?: { text?: string; at?: number } };
type Book = { title?: string; cover?: string; days?: Day[] };
type Leaf =
  | { k: "cover" }
  | { k: "toc" }
  | { k: "part"; day: string; label: string; who: string; title: string; text: string; art: string; first: boolean; chap: string }
  | { k: "rest"; day: string; label: string; who: string; text: string; first: boolean; chap: string }
  | { k: "note"; day: string; text: string; chap: string };

export const useBook = () => useQuery({ queryKey: ["nomute", "book", "bells"], queryFn: () => office<Book>("book/bells"), staleTime: 5 * 60_000, retry: 1 });

const dayName = (d: string) => { const m = /^\d{4}-(\d{2})-(\d{2})$/.exec(d); return m ? `${+m[1]}월 ${+m[2]}일` : d; };
const art = (p?: string) => (!p ? "" : /^https:\/\//i.test(p) ? p : fileUrl(p));

function leavesOf(b: Book): Leaf[] {
  const out: Leaf[] = [{ k: "cover" }, { k: "toc" }];
  for (const d of b.days || []) {
    const chap = d.title || "";
    let first = true;
    for (const pg of d.pages || []) {
      const label = pg.label || pg.bell || "";
      if (pg.rest) { const p0 = pg.parts?.[0]; out.push({ k: "rest", day: d.day, label, who: p0?.who || "", text: p0?.text || "쉴게", first, chap }); first = false; continue; }
      for (const p of pg.parts || []) { out.push({ k: "part", day: d.day, label, who: p.who, title: p.title || "", text: p.text || "", art: p.art || pg.art || "", first, chap }); first = false; }
    }
    out.push({ k: "note", day: d.day, text: d.note?.text || "", chap });
  }
  return out;
}

/** 나팔꽃 하나(장 끝 빈 쪽 · 뜸 「거기엔 작은 나팔꽃 하나만」) = 선 그림 · 움직임 0 */
const Glory = () => (
  <svg className="nm-bk-glory" viewBox="0 0 48 48" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M24 26c-7 0-12-5-12-11 4 1 8 0 12-4 4 4 8 5 12 4 0 6-5 11-12 11z" /><path d="M24 26v4" /><circle cx="24" cy="17" r="2.2" />
    <path d="M24 30c0 6-3 9-8 11" /><path d="M18 37c-3-1-5-3-5-6 3 0 5 2 5 6z" />
  </svg>
);

/** 밥상 이야기 맨 위 = 책 한 권(표지 그림 + 이름 + 장 · 쪽 수) · 누르면 책 · 서버에 책이 없으면 칸 0 */
export function BellsShelf({ onOpen }: { onOpen: () => void }) {
  const q = useBook();
  const b = q.data;
  if (!b?.days?.length) return null;
  const pages = b.days.reduce((n, d) => n + (d.pages?.length || 0), 0);
  const cover = b.cover || b.days[0]?.pages?.find((p) => p.art || p.parts?.some((x) => x.art))?.parts?.find((x) => x.art)?.art || "";
  return (
    <button type="button" className="nm-bk-shelf" onClick={onOpen} aria-label={`${b.title || "종과 종 사이"} 펼치기`}>
      <span className="nm-bk-shelf-art">{cover ? <img src={art(cover)} alt="" loading="lazy" draggable={false} /> : null}</span>
      <span className="nm-bk-shelf-t"><b>{b.title || "종과 종 사이"}</b><span>장 {b.days.length} · 쪽 {pages}</span></span>
      <svg className="nm-bk-shelf-chev" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
    </button>
  );
}

/** 장 끝 빈 쪽 — 형 한 줄이 있으면 보임 · 없으면 나팔꽃만 + 한 줄 남기는 칸(형 자리 · 쓰고 「남기기」) */
function NoteLeaf({ day, text }: { day: string; text: string }) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");
  return (
    <div className="nm-bk-note">
      <Glory />
      {text ? <p className="nm-bk-note-t" data-content>{text}</p> : (
        <div className="nm-bk-note-w">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={2} maxLength={200} placeholder="이 장에 한 줄 남기기" aria-label={`${dayName(day)} 장 끝에 한 줄`} />
          <GoButton className="nm-bk-note-go" disabled={!draft.trim()} busy="남기는 중" go={() => office("book/bells/note", { method: "POST", body: JSON.stringify({ day, text: draft.trim() }) })} done={() => { setDraft(""); void qc.invalidateQueries({ queryKey: ["nomute", "book", "bells"] }); }}>남기기</GoButton>
        </div>
      )}
    </div>
  );
}

/** 펼친 책 — 넘김 = 가로 scroll-snap(손가락 · 휠 · ←/→) · 표지/차례/쪽 한 줄 */
export function BellsBook({ onClose }: { onClose: () => void }) {
  const q = useBook();
  const list = useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
  const track = useRef<HTMLDivElement>(null);
  const b = q.data;
  const leaves = b ? leavesOf(b) : [];
  const go = (i: number) => { const t = track.current; if (t) t.scrollTo({ left: i * t.clientWidth, behavior: "smooth" }); };
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const t = track.current; if (!t || (e.target as HTMLElement)?.closest?.("textarea, input")) return;
      if (e.key === "ArrowRight") { e.preventDefault(); t.scrollBy({ left: t.clientWidth, behavior: "smooth" }); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); t.scrollBy({ left: -t.clientWidth, behavior: "smooth" }); }
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);
  const nm = (w: string) => list.find((x) => x.who === w)?.name || w;
  if (q.isPending) return <p className="nm-story-empty">책을 펴는 중…</p>;
  if (!b) return <p className="nm-story-empty">책을 못 불러왔어</p>;
  const cover = b.cover || leaves.find((l): l is Extract<Leaf, { k: "part" }> => l.k === "part" && !!l.art)?.art || "";
  return (
    <section className="nm-bk" aria-label={b.title || "종과 종 사이"}>
      <header className="nm-bk-h">
        <button type="button" onClick={onClose} aria-label="책 닫기"><svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg></button>
        <b>{b.title || "종과 종 사이"}</b>
        <button type="button" onClick={() => go(1)} aria-label="차례로">차례</button>
      </header>
      <div ref={track} className="nm-bk-track" tabIndex={0} aria-roledescription="책" aria-label="옆으로 넘겨 읽기">
        {leaves.map((l, i) => {
          const dayFirst = l.k !== "cover" && l.k !== "toc" && "first" in l && l.first;
          const chap = l.k === "part" || l.k === "rest" || l.k === "note" ? <p className="nm-bk-chap">{dayName(l.day)}{l.chap ? ` · ${l.chap}` : ""}</p> : null;
          return (
            <article key={i} className={`nm-bk-leaf k-${l.k}${dayFirst ? " day0" : ""}`} aria-label={`${i + 1}쪽`}>
              {l.k === "cover" ? (
                <div className="nm-bk-cover">{cover ? <img src={art(cover)} alt="" draggable={false} /> : null}<h2>{b.title || "종과 종 사이"}</h2><p>우리가 쓰는 때가 늘 종이 울린 그 사이라서</p></div>
              ) : l.k === "toc" ? (
                <div className="nm-bk-toc"><h3>차례</h3><ol>{(b.days || []).map((d) => {
                  const at = leaves.findIndex((x) => (x.k === "part" || x.k === "rest") && x.day === d.day);
                  return <li key={d.day}><button type="button" onClick={() => go(at < 0 ? 1 : at)}><span className="num">{dayName(d.day)}</span><span className="t">{d.title || "제목은 하루 끝에"}</span><span className="n num">{d.pages?.length || 0}쪽</span></button></li>;
                })}</ol></div>
              ) : l.k === "note" ? (<>{chap}<NoteLeaf day={l.day} text={l.text} /></>) : (
                <>
                  {chap}
                  <div className="nm-bk-sheet">
                    {l.k === "part" ? <figure className="nm-bk-art">{l.art ? <img src={art(l.art)} alt="" loading="lazy" draggable={false} /> : null}</figure> : null}
                    <div className="nm-bk-text">
                      <p className="nm-bk-by"><FaceImg id={idOf(l.who, list)} size={18} />{nm(l.who)}</p>
                      {l.k === "part" && l.title ? <h3>{l.title}</h3> : null}
                      <p className="nm-bk-body" data-content>{l.text}</p>
                    </div>
                  </div>
                  <p className="nm-bk-bell num">{l.label}</p>
                </>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
