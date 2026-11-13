// 서랍 「영상 편집」 · + 펼침 「비디오 에디터」 = 옛 비디오 에디터 화면 그대로(형 11-13 13:21 봄 옮김 「그 비디오 에디터, 그 화면도 예전 비디오 에디터 화면을 그대로 계승할거거든? 지금 포토 에디터처럼, 가능해?」)
//   원본 = editor viewer/edit.html(옛 스튜디오 셸 index.html 「에디터 · 영상 편집」 탭이 품던 화면) · 같은 출처라 원본을 그대로 품음 = 올리기 · 자르기 · 내보내기 · 서버 요청 = 원본 코드 그대로(고친 글자 0)
//   겉틀 = 포토 에디터(./thumb-maker 「✧ 에디터 · 카드 제작」)와 같은 머리 「‹ ✦ 에디터 · 영상 편집」 · 위 챠콜 줄 없음 · 뒤 = 웹앱 배경(품은 문서 바탕만 투명 · 형 11-13 02:24 · 02:26)
//   옛 셸만 받던 손 = 「트랙」 탭 넘김(edit.html parent.postMessage nmToolTab) → 앱 안 한 겹 · 카드 제작 「영상 편집으로」 = 이 화면으로 와서 영상 넣음(./studio-handoff deliverStudio)
//   다음 판(짐작) = 포토처럼 엔진을 앱 안으로(코드모드) — 이 판은 화면 · 움직임 · 단추가 이미 원본 그대로
import { useEffect, useRef } from "react";
import "./thumb-maker/frame.css";
import "./video-editor.css";
import { hookFrame, openInApp } from "./inapp";
import { deliverStudio, EDIT } from "./studio-handoff";

const SPARK = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3.5l1.8 4.9 4.9 1.8-4.9 1.8L12 16.9l-1.8-4.9-4.9-1.8 4.9-1.8L12 3.5z" /><path d="M19.5 15l.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8.8-2.1z" /></svg>;
/** 품은 옛 화면 바탕 = 투명(앱 배경이 비침) · 제 장면 그림(nm-scene) 끔 — 원본 파일은 안 고치고 품은 문서에만 덧씀 */
export const SEE_CSS = "html,html.nm-scene-ready:not(:has(#wavebg)),body{background:transparent!important}.nm-scene-canvas{display:none!important}body::before{display:none!important}";

function see(el: HTMLIFrameElement) {
  let doc: Document | null = null;
  try { doc = el.contentDocument; } catch { return; }
  if (!doc?.head || doc.getElementById("nm-ved-see")) return;
  const s = doc.createElement("style"); s.id = "nm-ved-see"; s.textContent = SEE_CSS; doc.head.appendChild(s);
}

export function VideoEditor({ onBack }: { onBack?: () => void }) {
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const unhook = hookFrame(el);
    const load = () => { see(el); deliverStudio(el); };
    el.addEventListener("load", load);
    load();
    const msg = (e: MessageEvent) => {   // 옛 셸 탭 넘김(edit.html 「트랙」 → /track.html) = 앱 안 한 겹
      if (e.source !== el.contentWindow || e.origin !== location.origin) return;
      const d = e.data as { nm?: string; src?: string } | null;
      if (d?.nm === "nmToolTab" && typeof d.src === "string" && d.src.startsWith("/")) openInApp(d.src);
    };
    window.addEventListener("message", msg);
    return () => { unhook(); el.removeEventListener("load", load); window.removeEventListener("message", msg); };
  }, []);
  return (
    <div className="tm-stage ved-stage">
      <div className="tm-head">
        {onBack ? <button type="button" className="tm-back" aria-label="닫기" onClick={onBack}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 18l-6-6 6-6" /></svg></button> : null}
        <b className="tm-title">{SPARK}<span>에디터</span></b>
        <span className="tm-menu">영상 편집</span>
      </div>
      <div className="tm-frame ved-frame">
        <iframe ref={ref} title="영상 편집" src={EDIT} className="ved-if" allow="autoplay; clipboard-write; fullscreen; picture-in-picture" />
      </div>
    </div>
  );
}
export default VideoEditor;
