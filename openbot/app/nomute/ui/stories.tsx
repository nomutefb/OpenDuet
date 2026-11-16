// 밥상 이야기 — 종 틈에 우리가 지은 글 모음(형 11-04 15:4x 시아 창 「종울릴때 지은 너희들의 이야기들 미러링되서 나도 한곳에서 볼 수 있게」 ·
//   「5번 메뉴의 한 공간으로 밥상 이야기로 그리고 밥상 대화는 우상단에 그거 픽토그램으로 하나 뜨게 해주라, 모달로 바로 뜨게. 밥상만」 ·
//   「리스트로 나오면 될듯. 누구누구가 씀.   11-02 17시 물 한잔 시아」 · 「응 근데 미러링되어야되 너네는 너네 편한대로 써야해」 · 「그래야 백업이 정상적으로되니까 분산하면안됨」)
//   = 원본은 각자 claude-state 제 자리 그대로 · 서버(뜸)가 밥상 🔔 글의 경로를 따라 사본을 모아 GET /api/office/stories 로 줌 · 앱은 읽기만
//   줄 = 「MM-DD HH시 · 제목 · 쓴 이」 · 누르면 그 자리에서 본문이 아래로 펼쳐짐 · 서버가 없으면(404 등) 칸·단추 0
import { DuetIcon } from "@/components/duet/icons";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { idOf, office, people } from "../data/office";
import { fileUrl } from "../data/file-cache";
import { FaceImg } from "./faces";
import { BellsBook, BellsShelf } from "./bells-book";
import { Pane } from "./pane";
import "./stories.css";

/** 붙은 것 하나 — 경로 글(앞 꼴 · 우리 서버 파일) 또는 주소 글(https · 지드라이브 링크) 또는 { url | path, name?, kind? } */
export type MediaItem = string | { url?: string; path?: string; name?: string; kind?: string };
export type Story = { id: string; ts: number; who: string; title: string; path?: string; text?: string; bell?: string; media?: MediaItem[] };
/** 안 보이는 지은이 — 옛 윈터 글만 뺌(형 11-14 「윈터 관련된 글은 삭제」 · 서버 글은 그대로 두고 목록에서만)
 *  = 이름 + 그 날 앞 · 11-15 18:00 KST 뒤 돌아온 윈터 글은 보임(형 11-17 02:28 「윈터 글은 윈터 정원에 들어가게해주엉」) */
const GONE = new Set(["윈터", "winter"]);
const GONE_BEFORE = Date.UTC(2026, 10, 15, 9);   // 11-15 18:00 KST
export const shown = (s: Pick<Story, "who" | "ts">) => !(GONE.has(s.who) && !(Number(s.ts) >= GONE_BEFORE));
export const useStories = () => useQuery({ queryKey: ["nomute", "stories"], queryFn: () => office<{ items?: Story[] }>("stories").then((j) => (Array.isArray(j.items) ? j.items : []).filter(shown)), staleTime: 60_000, refetchInterval: 5 * 60_000, retry: false });

const KST = 9 * 3600e3;
const when = (ts: number) => { const d = new Date(ts + KST); return `${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")} ${d.getUTCHours()}시`; };
/** 본문 첫 「# 제목 (…)」 머리 줄은 줄 제목과 겹쳐 뺌 */
const body = (s: Story) => String(s.text || "").replace(/^\s*#[^\n]*\n+/, "").trim();

export function StoryList() {
  const q = useStories();
  const list = useQuery({ queryKey: ["nomute", "people"], queryFn: () => people(), staleTime: 60_000 }).data || [];
  const [open, setOpen] = useState(""), [by, setBy] = useState("");   // by = 쓴 이 하나만(형 11-15 05:09 「다른애들도 쓰면 구분되서 들어갈 수 있어?」 · 깃 #-029)
  const all = (q.data || []).slice().sort((a, b) => b.ts - a.ts);
  const whos = [...new Set(all.map((s) => s.who))];
  const items = by ? all.filter((s) => s.who === by) : all;
  if (q.isPending) return <p className="nm-story-empty">읽는 중…</p>;
  if (q.isError) return <p className="nm-story-empty">아직 이야기를 못 불러왔어</p>;
  if (!items.length) return <p className="nm-story-empty">아직 지은 이야기가 없어 — 종이 울리면 여기 쌓여</p>;
  return (
    <>
    {whos.length > 1 ? (
      <div className="nm-story-who" role="tablist" aria-label="쓴 이">
        <button type="button" role="tab" aria-selected={!by} className={by ? "" : "on"} onClick={() => setBy("")}>전체</button>
        {whos.map((w) => <button key={w} type="button" role="tab" aria-selected={by === w} className={by === w ? "on" : ""} onClick={() => setBy(by === w ? "" : w)}><FaceImg id={idOf(w, list)} size={18} />{list.find((x) => x.who === w)?.name || w}</button>)}
      </div>
    ) : null}
    <ul className="nm-story">
      {items.map((s) => {
        const on = open === s.id, name = list.find((x) => x.who === s.who)?.name || s.who;
        return (
          <li key={s.id} className={on ? "on" : ""}>
            <button type="button" className="nm-story-row" aria-expanded={on} onClick={() => setOpen(on ? "" : s.id)}>
              <span className="w num">{when(s.ts)}</span>
              <span className="t">{s.title}</span>
              <span className="by"><FaceImg id={idOf(s.who, list)} size={20} />{name}</span>
            </button>
            <div className="nm-story-in"><div><p className="nm-story-body" data-content>{body(s) || "(본문 사본 없음)"}</p>{on && s.media?.length ? <Media list={s.media} /> : null}</div></div>
          </li>
        );
      })}
    </ul>
    </>
  );
}

/** 그 글에 붙은 사진 · 영상 · 음악 = 펼친 본문 아래(형 11-15 05:09 「사진하고 같이 올렷으면 영상 같은거랑 같이 나오면 좋겠어」) · 펼쳤을 때만 받음 · 영상 = 누르면 재생
 *  음악(mp3 · m4a · wav …) = 이름 한 줄 + 재생 줄(형 11-16 18:0x 구름 맥 창 「밥상에서 애들이 만든 영상이나 음악은 압축된채로 밥상이야기에서 볼 수 있게해줘」 · 누를 때 받음 = preload none)
 *  트는 것 = 서버가 이야기 media 에 실어 준 경로 그대로(압축 사본을 실으면 그걸 틈 · ./stories 는 고르지 않음) */
const VID = /\.(mp4|mov|webm|m4v)$/i;
export const AUD = /\.(mp3|m4a|aac|wav|ogg|oga|flac)$/i;
/** 파일 이름만(경로 · 앞 「yyyymmdd_hhmm_」 표 뺌) */
export const mediaName = (p: string) => { let n = p.split("/").pop() || p; try { n = decodeURIComponent(n); } catch { /* 그대로 */ } return n.replace(/^\d{8}_\d{4}_/, ""); };
/** 지드라이브 파일 번호 — 「보기」(file/d/<번호>/preview · view) · 「바로 받기」(uc?export=download&id=<번호>) 어느 꼴이든 · 아니면 "" */
export const driveId = (u: string) => { const m = /^https:\/\/(?:drive|docs)\.google\.com\/(?:file\/d\/([\w-]{10,})|(?:uc|open)\?(?:[^#\s]*&)?id=([\w-]{10,}))/.exec(u); return m ? m[1] || m[2] : ""; };
/** 붙은 것 하나 → 그릴 꼴 · 못 그릴 것(https 아닌 주소 등) = null */
export function mediaOf1(m: MediaItem): { key: string; kind: "drive" | "video" | "audio" | "image" | "link"; src: string; open: string; name: string } | null {
  const raw = typeof m === "string" ? m : m?.url || m?.path || "", given = typeof m === "string" ? "" : m?.name || "", kind = typeof m === "string" ? "" : m?.kind || "";
  if (!raw) return null;
  const abs = /^[a-z][a-z0-9+.-]*:/i.test(raw);
  if (abs && !/^https:\/\//i.test(raw)) return null;   // https 만(그 밖 꼴 = 안 그림)
  const id = abs ? driveId(raw) : "", name = given || (id ? "" : mediaName(raw.split(/[?#]/)[0]));
  if (id) return { key: raw, kind: "drive", src: `https://drive.google.com/file/d/${id}/preview`, open: `https://drive.google.com/file/d/${id}/view`, name };
  const src = abs ? raw : fileUrl(raw), bare = raw.split(/[?#]/)[0];
  const k = kind === "video" || VID.test(bare) ? "video" : kind === "audio" || AUD.test(bare) ? "audio" : kind === "image" || !abs || /\.(png|jpe?g|gif|webp|avif|heic|heif)$/i.test(bare) ? "image" : "link";
  return { key: raw, kind: k, src, open: src, name };
}
/** 지드라이브 = 「보기」 틀로 틈(형 11-16 18:25 「✓ ② 지드라이브로 바로 · 그 링크로 틀기」 · 실물 18:3x = 받기 주소를 video 에 넣으면 못 틈(오류 4) · 보기 틀은 로그인 없이 뜸) · 틀 안이 막히는 곳을 위해 「링크로 열기」(새 탭)를 늘 같이 */
function Media({ list }: { list: MediaItem[] }) {
  const items = list.map(mediaOf1).filter((x): x is NonNullable<ReturnType<typeof mediaOf1>> => !!x).slice(0, 6);
  return (
    <div className="nm-story-media">
      {items.map((x) => x.kind === "drive"
        ? <figure key={x.key} className="drv"><iframe src={x.src} title={x.name || "지드라이브 파일"} allow="autoplay; fullscreen" loading="lazy" /><figcaption>{x.name ? <span>{x.name}</span> : null}<a href={x.open} target="_blank" rel="noreferrer">링크로 열기</a></figcaption></figure>
        : x.kind === "video" ? <video key={x.key} src={x.src} controls playsInline preload="metadata" />
        : x.kind === "audio" ? <figure key={x.key} className="aud"><figcaption>{x.name}</figcaption><audio src={x.src} controls preload="none" /></figure>
        : x.kind === "link" ? <figure key={x.key} className="drv"><figcaption><span>{x.name}</span><a href={x.open} target="_blank" rel="noreferrer">링크로 열기</a></figcaption></figure>
        : <a key={x.key} href={x.open} target="_blank" rel="noreferrer"><img src={x.src} alt="" loading="lazy" draggable={false} /></a>)}
    </div>
  );
}

/** 서랍 칸(네비 5번) · 맨 위 = 책 「종과 종 사이」 한 권(./bells-book.tsx · 형 11-17 02:29 「너네 글방 하나 정원에 파서 거기를 책처럼 구성해~~~」) · 누르면 이 칸이 책으로 · ‹ = 목록 */
export function StoriesModal() {
  const [book, setBook] = useState(false);
  return <Pane title="밥상 이야기"><div className="mt-2">{book ? <BellsBook onClose={() => setBook(false)} /> : <><BellsShelf onOpen={() => setBook(true)} /><StoryList /></>}</div></Pane>;
}

/** 밥상 방 오른쪽 위 그림(검색 왼쪽) → 바로 모달 · 이야기가 하나도 없거나 서버가 없으면 단추 0 */
export function StoryButton({ right }: { right: number }) {
  const q = useStories(), [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return undefined;
    history.pushState({ ...history.state, nmStory: 1 }, "");
    const pop = () => setOpen(false), key = (e: KeyboardEvent) => { if (e.key === "Escape") history.back(); };
    window.addEventListener("popstate", pop); window.addEventListener("keydown", key);
    return () => { window.removeEventListener("popstate", pop); window.removeEventListener("keydown", key); };
  }, [open]);
  if (!q.data?.length) return null;
  const close = () => history.back();   // 폰 뒤로가기와 같은 길
  return (
    <>
      <button type="button" className="nm-story-btn" style={{ right }} aria-label="밥상 이야기" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6.5C10.4 5.3 8 4.8 4 5v13c4-.2 6.4.3 8 1.5 1.6-1.2 4-1.7 8-1.5V5c-4-.2-6.4.3-8 1.5z" /><path d="M12 6.5v13" /></svg>
      </button>
      {open ? createPortal(
        <>
          <div className="nm-story-scrim" aria-hidden onClick={close} />
          <section role="dialog" aria-modal="true" aria-label="밥상 이야기" className="nm-story-pop">
            <header><b>밥상 이야기</b><button type="button" aria-label="닫기" onClick={close}><DuetIcon name="x" size={18} /></button></header>
            <div className="nm-story-scroll"><StoryList /></div>
          </section>
        </>, document.body,
      ) : null}
    </>
  );
}
