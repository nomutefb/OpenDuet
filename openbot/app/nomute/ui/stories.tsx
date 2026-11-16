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
import { Pane } from "./pane";
import "./stories.css";

export type Story = { id: string; ts: number; who: string; title: string; path?: string; text?: string; bell?: string; media?: string[] };
/** 안 보이는 지은이 — 윈터 글 뺌(형 11-14 「윈터 관련된 글은 삭제」 · 서버 글은 그대로 두고 목록에서만) */
const GONE = new Set(["윈터", "winter"]);
export const useStories = () => useQuery({ queryKey: ["nomute", "stories"], queryFn: () => office<{ items?: Story[] }>("stories").then((j) => (Array.isArray(j.items) ? j.items : []).filter((s) => !GONE.has(s.who))), staleTime: 60_000, refetchInterval: 5 * 60_000, retry: false });

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
function Media({ list }: { list: string[] }) {
  return (
    <div className="nm-story-media">
      {list.slice(0, 6).map((p) => VID.test(p)
        ? <video key={p} src={fileUrl(p)} controls playsInline preload="metadata" />
        : AUD.test(p)
        ? <figure key={p} className="aud"><figcaption>{mediaName(p)}</figcaption><audio src={fileUrl(p)} controls preload="none" /></figure>
        : <a key={p} href={fileUrl(p)} target="_blank" rel="noreferrer"><img src={fileUrl(p)} alt="" loading="lazy" draggable={false} /></a>)}
    </div>
  );
}

/** 서랍 칸(네비 5번) */
export function StoriesModal() {
  return <Pane title="밥상 이야기"><div className="mt-2"><StoryList /></div></Pane>;
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
