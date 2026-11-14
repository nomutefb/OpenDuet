// 서랍 「에디터」 = 썸네일 생성기(에디터 카드 제작)를 앱 안으로(형 11-02 09:28 「이거 아예 이 디자인하고 배경 살려서 인앱 안으로 넣어줘. 그냥 가져온다고 생각하면 될듯」)
//   전엔 에디터 화면을 통째로 품었음(shell FRAME.edtool = /?tool=thumb&inapp=1 → index 도구 창 안 iframe thumb.html) → 이제 같은 판·같은 엔진·같은 배경을 앱 안에서 돌림
//   판 = ./markup.ts(원본 <body> 그대로) · 엔진 = ./engine(원본 <script> 줄 그대로 · 문서·창은 이 화면 틀로) · 옷 = ./thumb-maker.css(원본 CSS 를 .nm-tm 안으로 가둠) · 배경 = ./scene-bg.tsx(에디터 3D 판)
//   겉틀 = 앱이 품던 index 도구 창 그대로(머리 「✧ 에디터 · 카드 제작」 · ⟳ 입력 초기화 · 아래 흐려짐) — ./frame.css
//   요청 = 원본과 한 글자도 같음(/api/thumb·compose·resize·upscale·genimg·imgedit·spellcheck·jobs·thumb-clear·orig … · 고정 주소 thumb-hist.json 등) · 앱 shim 통과 목록에 더함
//   형 끝 기준 1~13(공통/문서/2026-11-01-뉴스-내재화/안.md 「3차」) = 원본 코드가 그대로 돌아서 같음 · 고친 것 하나 = 작은 화면에서 미리보기 도크 뒤로 옵션 줄이 비쳐 보이던 것(./frame.css 맨 아래)
import "./thumb-maker.css";
import "./frame.css";
import "./thin.css";   // 글자 한 단 얇게(형 11-11 06:15 「폰트는 굵기를 얇게」 · ./tools/thin-css.mjs 가 만듦 · 옛 굵기로 = 이 줄 뺌)
import { memo, useEffect, useRef } from "react";
import { startEngine } from "./engine";
import { THUMB_HTML } from "./markup";
import { SceneBg } from "./scene-bg";
import { RAIL_ICON_CSS, railIcons } from "./rail-icons";   // 옆 기둥 글자 → 그림 단추(영상 편집 꼴 · 형 11-14 11:29 · 봄 11:47 ④)
import { studioRoute } from "../studio-handoff";   // 「영상 편집으로」·「유튜브 링크로 숏폼」 = 옛 화면을 앱 안 한 겹으로(번개 11-08)
import { ToolButtons } from "../ed-keep";   // 머리 오른쪽 단추 = 옛 에디터 것 그대로(최소화 − · 입력 초기화 ⟳ · 닫기 × · 형 11-15)
import { ditherGaugeCss } from "../dither-gauge";   // 「생성」 게이지 = 눈금 바탕 + 점점이 녹아드는 경계(형 11-15 영상)
const GAUGE_CSS = ditherGaugeCss(".nm-tm .go.firing:not(.fy)", "#4f7a00") + ditherGaugeCss(".nm-tm .go.firing:not(.fy)", "#CFFF40", "html.dark ");

const HTML = { __html: THUMB_HTML };
const SPARK = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3.5l1.8 4.9 4.9 1.8-4.9 1.8L12 16.9l-1.8-4.9-4.9-1.8 4.9-1.8L12 3.5z" /><path d="M19.5 15l.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8.8-2.1z" /></svg>;

/** 머리 ⟳ = 원본 index 「입력 초기화」(그 세부 메뉴의 글자·사진 비우기 = thumb 의 window.nmTabReset) */
function reset() { (window as Window & { nmTabReset?: () => void }).nmTabReset?.(); }

export const ThumbMaker = memo(function ThumbMaker({ onBack, onMin }: { onBack?: () => void; onMin?: () => void }) {   // onMin = 최소화(창 접기 · 껍데기 ../ed-keep.tsx 가 숨겨 둔 채 살려 둠 · 형 11-15)
  const min = useRef(onMin); min.current = onMin;   // onBack = 앱 껍데기 닫기(위 챠콜 머리 줄을 뺀 뒤 ‹ 자리 · 형 11-13 02:24)
  const frame = useRef<HTMLDivElement>(null), scroller = useRef<HTMLDivElement>(null), root = useRef<HTMLDivElement>(null), body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!frame.current || !scroller.current || !root.current || !body.current) return;
    const w = window as Window & { __nmStudioRoute?: typeof studioRoute };
    w.__nmStudioRoute = studioRoute;   // 엔진이 켜질 때 studioRouteFn 이 보도록 먼저
    const stop = startEngine(root.current, body.current, frame.current, scroller.current);
    const offRail = railIcons(root.current);
    // 빠른 메뉴 위 「최소화」(#rfabMin) = 원본은 품은 창일 때만 부모 minimizeTool 을 부름 → 앱 안은 품은 창이 아니라 엔진이 숨김 · 여기서 다시 보이고 껍데기 접기로 이음(엔진 줄은 원본 그대로)
    const rmin = min.current ? root.current.querySelector<HTMLElement>("#rfabMin") : null;
    const doMin = (e: Event) => { e.stopPropagation(); min.current?.(); };
    if (rmin) { rmin.style.display = ""; rmin.addEventListener("click", doMin); }
    return () => { rmin?.removeEventListener("click", doMin); offRail(); if (w.__nmStudioRoute === studioRoute) delete w.__nmStudioRoute; stop?.(); };
  }, []);
  useEffect(() => {   // 내용이 미리보기 도크 밑으로 들어갔나 = data-stuck(./frame.css 맨 아래 · 비침 고침)
    const s = scroller.current, r = root.current;
    if (!s || !r) return;
    const on = () => r.toggleAttribute("data-stuck", s.scrollTop > 1);
    s.addEventListener("scroll", on, { passive: true }); on();
    return () => s.removeEventListener("scroll", on);
  }, []);
  return (
    <div className="tm-stage">
      {onBack ? null : <SceneBg />}   {/* 앱 안 = 제 장면 대신 웹앱 배경이 비침(형 11-13 02:26 「뒤에 지금 인앱 배경을 깔아버리면 될듯」 · 껍데기 .nm-modal.see) */}
      <style>{RAIL_ICON_CSS + GAUGE_CSS}</style>
      <div className="tm-head">
        <b className="tm-title">{SPARK}<span>에디터</span></b>
        <span className="tm-menu">카드 제작<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9L12 15L18 9" /></svg></span>
        <ToolButtons onMin={onMin} onReset={reset} onClose={onBack} />   {/* 앞 판 = 왼쪽 ‹ · ⟳ · ▽ → 옛 창 머리 꼴(− ⟳ ×) */}
      </div>
      <div className="tm-frame" ref={frame}>
        <div className="tm-scroll" ref={scroller}>
          <div className="nm-tm inmodal modern-workspace modern-ui-frame" data-nm-skin="on" data-nm-scene="inherited" ref={root}>
            <div className="nm-tm-body" ref={body} dangerouslySetInnerHTML={HTML} />
          </div>
        </div>
      </div>
    </div>
  );
});
export default ThumbMaker;
