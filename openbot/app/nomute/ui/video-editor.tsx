// 서랍 「영상 편집」 · + 펼침 「비디오 에디터」 = 옛 비디오 에디터 화면 그대로(형 11-13 13:21 봄 옮김 「그 비디오 에디터, 그 화면도 예전 비디오 에디터 화면을 그대로 계승할거거든? 지금 포토 에디터처럼, 가능해?」)
//   원본 = editor viewer/edit.html · sb.html · ys.html · song.html — 이제 앱 안에서 직접 돎(형 11-19 00:45 「그거 다 지금 정원으로 제대로 이식해서 가져와」)
//     판 · 옷 · 엔진 = public/old-pages/<화면>.<지문>.js(./old-pages/tools/gen.mjs 가 옛 에디터에서 만듦 · 원본 코드를 사람이 안 고침 · 앱 묶음 밖 정적 파일) · 틀 = ./old-pages/frame.ts(그림자 뿌리 한 장)
//     앞 판 = 같은 출처 iframe 으로 원본 파일(/edit.html …)을 품음 → 옛 에디터 파일에 기댐 0 · 올리기 · 자르기 · 내보내기 · 서버 요청 = 원본 코드 그대로
//   겉틀 = 포토 에디터(./thumb-maker 「✧ 에디터 · 카드 제작」)와 같은 머리 「‹ ✦ 에디터 · 영상 편집」 · 위 챠콜 줄 없음 · 뒤 = 웹앱 배경(화면 바탕만 투명 · 형 11-13 02:24 · 02:26)
//   옛 셸만 받던 손 = 탭 넘김(화면의 parent.postMessage nmToolTab → 아는 일이면 그 일로 · 편집의 「트래킹」 넘김 단추는 원본에서 늘 숨김이라 닿는 길 없음 = 트래킹 화면은 안 옮김) · 카드 제작 「영상 편집으로」 = 이 화면으로 와서 영상 넣음(./studio-handoff deliverStudio)
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Chev } from "./chev";
import "./thumb-maker/frame.css";
import "./video-editor.css";
import { hookRoot, openInApp } from "./inapp";
import { type Frame, mountPage } from "./old-pages/frame";
import { loadPage } from "./old-pages/load";
import { deliverStudio, EDIT } from "./studio-handoff";
import { ditherGaugeCss } from "./dither-gauge";   // 「생성」 게이지 = 이미지 편집과 같은 꼴(형 11-15 영상)
import { ToolButtons } from "./ed-keep";   // 머리 오른쪽 단추 = 옛 에디터 것 그대로(최소화 − · 닫기 × · 형 11-15)

const SPARK = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3.5l1.8 4.9 4.9 1.8-4.9 1.8L12 16.9l-1.8-4.9-4.9-1.8 4.9-1.8L12 3.5z" /><path d="M19.5 15l.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8.8-2.1z" /></svg>;
/** 옛 화면 바탕 = 투명(앱 배경이 비침) · 제 장면 그림(nm-scene) 끔 — 원본은 안 고치고 덧씌우는 옷으로만(원본 문서 꼴로 씀 · 틀이 제 것으로 바꿔 넣음 = ./old-pages/scope-css.ts) */
export const SEE_CSS = "html,html.nm-scene-ready:not(:has(#wavebg)),body{background:transparent!important}.nm-scene-canvas{display:none!important}body::before{display:none!important}"
  // 한 배경(형 11-13 14:08 봄 옮김 「배경같은것도 원톤으로 그냥 한 배경이 쭉 깔려야되」) = 미리보기 고정 도크(#topDock · 원본 #121212)도 쉴 땐 투명 · 내용이 도크 밑으로 들어간 동안만 유리(포토 에디터 ./thumb-maker/frame.css data-stuck 과 같은 꼴)
  + "#topDock{background:transparent!important;transition:background-color .2s ease}html.nm-stuck #topDock{background:rgba(17,18,20,.96)!important}"
  // 도크 밑으로 들어간 글 = 안 비침 · 줄 아래에서 그라데이션으로 사라짐 · 흐림 0(형 11-15 01:12 dm-gik 「저 뒤로 넘어가면 안보여야 함 그라데이션으로 사라지고」 · 깃 #-025 · 뜸 · 앞 판 = 82% 유리 + blur 14px)
  + "html.nm-stuck #topDock::after{content:'';position:absolute;left:0;right:0;top:100%;height:28px;background:linear-gradient(rgba(17,18,20,.96),rgba(17,18,20,0));pointer-events:none}"
  // 도구 기둥(#cpRailWrap · 미리보기 창 밖 오른쪽 절대 자리)이 창보다 길면 도크 밖 「자막 설정」 위로 넘쳐 비침(형 11-13 22:05 봄 옮김 「글구 여기 뒷 배경 안보여여되는데 보이네」 · 폰 실측 기둥 288 > 칸 186) → 칸 최소 높이 = 기둥(--nm-railh · see() 가 잼) · 접힘(.fold)엔 안 걸림
  + ".topdock:not(.fold) #pvsec{min-height:var(--nm-railh,0px)}"
  // 폰 = 미리보기만 폭맞춤 고정 · 칸 최소 높이 = 기둥은 폰에도 다시 켬(형 11-15 01:12 「영상 편집 라인이랑 생성 겹치는 부분 해결해줘」 = 기둥 끝 「생성」이 도크 밑 줄에 걸림 · 늘어나는 키 = 기둥 − 미리보기 몇 px) · 앞 판 = 옆 기둥은 아래 설정에 겹쳐도 됨(형 11-14 07:06 dm-sia 「저 영상 편집기 네비게이션 부분은 아래 내용에 겹쳐도 되거든? 영상 미리보기 부분만 고정으로 폭맞춤 되게해주면 됨」 · 앞 판 칸 최소 높이는 폰에서 끔)
  + "@media (max-width:767px){#pvsec .cpprev-box{width:calc(100% - 82px)!important;max-width:none!important;margin-left:0!important;margin-right:0!important;max-height:min(58svh,620px)}}";
  // ↑ 미리보기 키 한도 = 그 칸(#pvsec) 한도와 같은 값(형 11-14 사진 「이런거 영상편집기에서 안넘어오게해줘」 — 앞 판 62vh 는 칸 한도 58svh 보다 커서 좁은 PC 창(폭 500~760)에서 미리보기가 구분선 아래 「설계」 위로 12~34px 넘어옴 · 실측)

/** 옆 기둥 글자 단추(해상도 · 배경음 · 음량 · 컷 편집 = 옛 #editSpec .gs-v) → 사진 에디터처럼 그림 단추(형 11-14 05:41 봄 옮김 「✓ ② 사진 에디터처럼 그림 단추로 바꿈」 · 05:23 「비디오 에디터 화면 사진 에디터 처럼 디자인을 구성한다고 생각하면 마음이 편함」)
 *  누름 · 켜짐(.on = 라임)은 옛 화면 그대로 · 해상도 값은 그림 밑 작은 글자 · 길게 누르면 이름 말풍선(see() · nm-tip) */
const ic = (d: string) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>${d}</svg>`)}")`;
export const RAIL_ICONS: Record<string, string> = {
  res: "<path d='M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2'/><rect x='7' y='8' width='10' height='8' rx='1'/>",
  bgm: "<path d='M9 18V5l12-2v13'/><circle cx='6' cy='18' r='3'/><circle cx='18' cy='16' r='3'/>",
  anorm: "<path d='M11 5L6 9H2v6h4l5 4V5z'/><path d='M15.54 8.46a5 5 0 0 1 0 7.07'/><path d='M19.07 4.93a10 10 0 0 1 0 14.14'/>",
  cutlv: "<circle cx='6' cy='6' r='3'/><circle cx='6' cy='18' r='3'/><path d='M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12'/>",
};
export const RAIL_CSS = "#editSpec .gs-sep{display:none!important}#optStrip,#editSpec{height:auto!important;min-height:0!important;flex:none!important;justify-content:flex-start!important}#editSpec{display:flex!important;flex-direction:column;align-items:center;gap:0}"
  // 기둥 단추 간격 = 다 같게(형 11-15 영상 편집 사진 「우측 네비 요소 간격이 너무 좁아서 버튼 누르기가 힘든데 일정 간격 유지해 줘」) — 닿는 칸 36 + 위아래 3 = 42 간격 · 위 묶음(바꾸기 · 지우기 = .cpv-tool 22 높이)도 같은 칸 · 그림 17
  + "#cpRailWrap .cpv-tool,#editSpec .gs-v{margin:3px 0!important}#cpRailWrap .cpv-tool{height:36px!important;min-height:36px!important}#cpRailWrap .cpv-tool svg{width:17px!important;height:17px!important}"
  // 「음량」(소리 크기 맞춤 켬/끔) = 뺌(형 같은 글 「볼륨은 뭘 나타내는거지? 크게 필요없는 거는 없앰」) · 숨기기만 = 값은 옛 화면 기본 그대로
  + "#editSpec .gs-v[data-cyc=anorm]{display:none!important}"
  + "#editSpec .gs-v{font-size:0!important;width:36px!important;min-width:36px!important;height:36px!important;padding:0!important;display:grid!important;place-items:center;color:rgba(232,234,232,.62)!important;position:relative}"
  + "#editSpec .gs-v.on{color:var(--accent)!important}#editSpec .gs-v:active{transform:scale(.86)}"
  + "#editSpec .gs-v::before{content:'';width:17px;height:17px;background:currentColor;-webkit-mask:var(--nm-ic) center/contain no-repeat;mask:var(--nm-ic) center/contain no-repeat}"
  + Object.entries(RAIL_ICONS).map(([k, d]) => `#editSpec .gs-v[data-cyc=${k}]{--nm-ic:${ic(d)}}`).join("")
  + "#editSpec .gs-v[data-nmv]{padding-bottom:9px!important}#editSpec .gs-v[data-nmv]::after{content:attr(data-nmv);position:absolute;bottom:2px;left:50%;transform:translateX(-50%);font-size:8px;line-height:1;font-weight:800;white-space:nowrap;letter-spacing:-.02em}"
  + ".nm-tip{position:fixed;z-index:2147483000;padding:5px 10px;border-radius:999px;background:rgba(14,15,14,.94);border:1px solid rgba(255,255,255,.16);color:#e8eae8;font:700 12px/1.2 Pretendard,system-ui,sans-serif;white-space:nowrap;pointer-events:none;transform:translate(calc(-100% - 10px),-50%)}";

/** 시그니처 색 = 포토 에디터와 같은 라임(형 11-13 14:06 봄 옮김 「이미지 에디터처럼 시그니처 색이 좀 일치되어야 되구」) · 옛 화면 청록(--accent #00EED2)만 덮음 · 값 = 앱 YETA 톤(./inapp yetaTone --modern-accent)과 같음 · 앱 밝게/어둡게 따라감 */
//   11-14 형 「기존 시안 라인을 라임으로 덮어씌웟는데 기존 시안은 없애서 깔끔하고 빨리뜨게」 → 다 읽은 뒤 덮던 것을 그려지기 전에 넣음(seeEarly) · 옛 화면 제 :root 가 뒤에 와도 이기게 !important = 청록이 한 번도 안 비침
export const accentCss = (dark: boolean) => (dark ? "" : "#editSpec .gs-v:not(.on){color:rgba(0,0,0,.5)!important}") + `:root{--accent:${dark ? "#CFFF40" : "#4f7a00"}!important;--accent-rgb:${dark ? "207,255,64" : "79,122,0"}!important}`;

/** 덧씌우는 옷 = 바탕 · 기둥 그림 단추 · 라임 · 「생성」 게이지 — 틀이 늘 맨 끝에 둠(옛 화면 제 옷보다 뒤) · 화면이 그려지기 전에 넣음(붙이는 그 자리에서 = 청록이 한 번도 안 비침) */
function tone(f: Frame) {
  const dark = document.documentElement.classList.contains("dark");
  f.tone(SEE_CSS + RAIL_CSS + accentCss(dark) + ditherGaugeCss(".go.firing:not(.fy)", dark ? "#CFFF40" : "#4f7a00"));
}
/** 화면에 붙이는 손(화면마다 한 번) = 기둥 키 재기 · 그림 단추 덧(해상도 값 글자 · 길게 누름 말풍선) · 도크 밑으로 들어감 표시 — 걷는 손을 돌려줌 */
function wire(f: Frame): () => void {
  const offs: (() => void)[] = [];
  let railOn = false, iconsOn = false, tries = 0, tm = 0;
  const arm = () => {
    const pv = f.root.getElementById("pvsec"), rail = f.root.getElementById("cpRailWrap"), spec = f.root.getElementById("editSpec");
    if (pv && rail && !railOn) {   // 기둥 키 = 칸 위끝부터 기둥 아래끝(탭 · 돋보기로 기둥이 바뀌면 따라감)
      railOn = true;
      // 기둥 틀(offsetHeight)은 칸 키에 묶여 있어 넘친 단추 키를 못 잼 → 안 단추 아래끝으로(형 11-14 05:23 봄 옮김 · 폰 단추 줄이 「자막 설정」 「컷·구간」 위를 덮음)
      //   틀 키 · scrollHeight 는 칸이 커지면 같이 커져 끝없이 자람 → 안 잎 요소(글자 · 그림) 아래끝(칸 위 기준)만 잼
      const fit = () => { const top = pv.getBoundingClientRect().top; let bot = 0; for (const c of Array.from(rail.querySelectorAll<HTMLElement>("*"))) { if (c.children.length) continue; const r = c.getBoundingClientRect(); if (r.height) bot = Math.max(bot, r.bottom - top); } pv.style.setProperty("--nm-railh", `${Math.ceil(bot) + 6}px`); };
      const ro = new ResizeObserver(fit);
      ro.observe(rail); for (const c of Array.from(rail.children)) ro.observe(c); fit();
      offs.push(() => ro.disconnect());
    }
    if (spec && rail && !iconsOn) {   // 그림 단추 덧(해상도 값 글자 · 길게 누름 말풍선)
      iconsOn = true;
      const val = () => spec.querySelectorAll<HTMLElement>(".gs-v[data-cyc=res]").forEach((e) => { const v = (e.textContent || "").replace(/^해상도\s*/, "").trim().slice(0, 4); if (e.getAttribute("data-nmv") !== v) e.setAttribute("data-nmv", v); });
      const mo = new MutationObserver(val); mo.observe(spec, { subtree: true, childList: true, characterData: true }); val();
      let tt = 0, tip: HTMLElement | null = null, eat = false;
      const hide = () => { window.clearTimeout(tt); if (tip) { const t = tip; tip = null; window.setTimeout(() => t.remove(), 700); } };
      const down = (ev: Event) => {
        const b = (ev.target as HTMLElement).closest<HTMLElement>(".gs-v, .cpv-tool, .trail-i"); if (!b) return;
        window.clearTimeout(tt);
        tt = window.setTimeout(() => {
          const r = b.getBoundingClientRect(), o = f.host.getBoundingClientRect(), nm = b.classList.contains("gs-v") ? `${b.getAttribute("aria-label") || ""}${b.dataset.cyc === "res" ? " · " + (b.getAttribute("data-nmv") || "") : b.classList.contains("on") ? " · 켬" : " · 끔"}` : b.getAttribute("aria-label") || b.title || "";
          tip = document.createElement("div"); tip.className = "nm-tip"; tip.textContent = nm; tip.style.left = `${r.left - o.left}px`; tip.style.top = `${r.top - o.top + r.height / 2}px`; f.body.appendChild(tip); eat = true;   // 붙박이 자리 = 틀 왼쪽 위 기준(옛 iframe 창 기준과 같음)
        }, 450);
      };
      const click = (ev: Event) => { if (eat) { eat = false; ev.preventDefault(); ev.stopPropagation(); } };
      const ctx = (ev: Event) => { if ((ev.target as HTMLElement).closest(".gs-v, .cpv-tool, .trail-i")) ev.preventDefault(); };
      rail.addEventListener("pointerdown", down);
      for (const k of ["pointerup", "pointercancel", "pointerleave"]) rail.addEventListener(k, hide);
      rail.addEventListener("click", click, true);
      rail.addEventListener("contextmenu", ctx);
      offs.push(() => { mo.disconnect(); window.clearTimeout(tt); rail.removeEventListener("pointerdown", down); for (const k of ["pointerup", "pointercancel", "pointerleave"]) rail.removeEventListener(k, hide); rail.removeEventListener("click", click, true); rail.removeEventListener("contextmenu", ctx); });
    }
    if ((!railOn || !iconsOn) && tries++ < 6) tm = window.setTimeout(arm, tries < 3 ? 60 : 400);   // 원본이 다 읽은 뒤(load)에 짓는 칸 = 조금 뒤 다시(편집 화면만 있는 칸 · 다른 화면은 여섯 번 보고 그만)
  };
  arm();
  offs.push(() => window.clearTimeout(tm));
  {   // 도크 밑으로 들어감 = html.nm-stuck
    // 붙음 = 도크 바로 아래 칸이 도크 밑으로 들어갔나(모양으로 잼) · 스크롤 = 화면 어디서 나든 잡음(capture) — 앞 판은 창 scrollTop 만 봐서 몸(body)이 스크롤하는 폰에선 안 켜져 뒤 글이 비침(형 11-15 05:14 dm-gik 「그리구 이 미리보기 구간 뒤로 넘어가면 아예 안보여야 함」 · 깃 #-025 다시 · 뜸)
    let raf = 0;
    const on = () => { raf = 0; const dock = f.root.getElementById("topDock"); let nx = dock?.nextElementSibling as HTMLElement | null; while (nx && !nx.offsetHeight) nx = nx.nextElementSibling as HTMLElement | null;   /* 바로 아래 「보이는」 칸(숨은 .srcwrap 등 건너뜀) */ const top = Math.max(f.html.scrollTop || 0, f.body.scrollTop || 0); const under = !!dock && !!nx && nx.getBoundingClientRect().top < dock.getBoundingClientRect().bottom - 1; f.html.classList.toggle("nm-stuck", under || top > 1); };
    const tick = () => { if (!raf) raf = requestAnimationFrame(on); };
    f.html.addEventListener("scroll", tick, { passive: true, capture: true });
    const ro = new ResizeObserver(tick); ro.observe(f.host); on();
    offs.push(() => { if (raf) cancelAnimationFrame(raf); f.html.removeEventListener("scroll", tick, true); ro.disconnect(); });
  }
  return () => { for (const x of offs) x(); };
}

/** 영상 편집 안에서 고르는 일(형 11-14 「영상 편집 안에서 트래킹이며 뭐며 그 안에서 내부에서 고르는 형태였는데, 합칠수있나 기능을? … 기본 영상 편집을 할건지, 트래킹을 할건지, 프롬프팅을 할건지 고르는거에 따라서 나오게 … 이미지 편집 1개, 영상 편집 1개 이렇게만 잇엇거든 … 옛날 버전이 github에 남아있으면 차라리 그걸 가져오는게 빠를거야」)
 *  옛 스튜디오 셸(editor viewer/index.html CAP_TABS = 편집 · 생성 · 프롬프팅 · 음원 · 큐영상 · 유튜브 + 편집 안 「트랙」 넘김)이 한 창에서 탭으로 고르던 그 화면들 = 저장소에 그대로 남아 있음 → 같은 틀 안에 그대로 품음(고친 글자 0)
 *  path = 옛 서랍 칸 주소(즐겨찾기 · 다른 화면의 링크가 안 끊기게 그대로 받음) · 한 번 연 화면은 안 버림(옛 「탭별 보존 프레임」 = 올리던 영상 · 쓰던 글이 고르는 사이에 안 날아감) */
//   걷음(형 11-18 12:03 「!깃 ✓ ① 다 지움(의류수거함)」 · 한 달 넘게 안 쓴 앱 기능) = 트래킹(track-make) · 프롬프팅(k-make) · 큐영상(vd-make) · 미디어 요약(nb-make) · 옛 주소 /edtrack · /edk · /edvd · /ednb = 편집으로(modeOfPath)
export const MODES = [
  { k: "edit", t: "편집", d: "자막 · 자르기 · 비율 · 소리", src: EDIT, path: "/edvid" },
  { k: "sb", t: "스토리보드", d: "이야기 → 콘티 · 참고 그림", src: "/sb.html", path: "/edsb" },
  { k: "ys", t: "유튜브", d: "영상 주소 → 짧은 영상", src: "/ys.html", path: "/edys" },
  { k: "song", t: "음원", d: "이야기 → 곡", src: "/song.html", path: "/edsong" },
] as const;
export type VMode = (typeof MODES)[number]["k"];
/** 주소 → 고른 일(모르는 길 = 편집) */
export const modeOfPath = (pathname: string): VMode => MODES.find((m) => m.path === (pathname.replace(/\/+$/, "") || "/"))?.k ?? "edit";
/** 품은 화면이 부모에게 「이 화면으로 넘겨 줘」 한 주소 → 그 일(옛 셸 nmToolTab · 편집 「트랙」) */
export const modeOfSrc = (src: string): VMode | null => MODES.find((m) => m.src === src.split("?")[0])?.k ?? null;

/** 화면이 가려는 주소 → 앱 길: 옛 에디터 그 기사(/?a=<파일>) = 뉴스 에디터 그 기사 · 그 밖 = 앱 안 한 겹 */
export const navOf = (url: string): string | null => { try { const u = new URL(url, location.origin + "/"); const a = u.pathname === "/" ? u.searchParams.get("a") : null; return a ? `/newsed?a=${encodeURIComponent(a)}` : null; } catch { return null; } };

function ModeFrame({ k, search, on, onTab }: { k: VMode; search: string; on: boolean; onTab: (src: string) => void }) {
  const ref = useRef<HTMLDivElement>(null), tab = useRef(onTab);
  const [again, setAgain] = useState(0);   // 화면이 저를 다시 읽으려 함(로그인이 끊겨 다시 읽기) = 새로 붙임
  tab.current = onTab;
  useEffect(() => {
    const at = ref.current;
    if (!at) return;
    let f: Frame | null = null, gone = false, unhook = () => {}, unwire = () => {};
    const mo = new MutationObserver(() => { if (f) tone(f); });   // 앱 밝게/어둡게 바뀌면 라임 값도 같이
    void loadPage(k).then((page) => {   // 화면 묶음 = 처음 고를 때 받음(옛 iframe 도 고를 때 읽었다 · 앱 묶음 밖 정적 파일 = ./old-pages/load.ts)
      if (gone) return;
      f = mountPage(at, page, {
        search,
        onUp: (d) => { const x = d as { nm?: string; src?: string }; if (x?.nm === "nmToolTab" && typeof x.src === "string" && x.src.startsWith("/")) tab.current(x.src); },   // 옛 셸 탭 넘김
        onNav: (u) => { const to = navOf(u); if (to) location.hash = "#" + to; else openInApp(u); },
        onReload: () => setAgain((n) => n + 1),
      });
      tone(f);
      const base = location.origin + page.path;
      f.win.open = ((u?: string | URL, t?: string, o?: string) => (u && openInApp(String(u), base) ? null : window.open(u, t, o))) as never;   // 화면이 여는 새 창 = 앱 안 한 겹(옛 hookFrame 과 같음)
      unhook = hookRoot(f.root, base);
      unwire = wire(f);
      if (k === "edit") deliverStudio(f);
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    });
    return () => { gone = true; mo.disconnect(); unhook(); unwire(); f?.dispose(); };
  }, [k, search, again]);
  return <div ref={ref} className="ved-if" data-on={on || undefined} aria-hidden={on ? undefined : true} />;   // 안 고른 화면 = 살려 둠(올리던 영상 · 쓰던 글 보존)
}

export function VideoEditor({ onBack, onMin, hold }: { onBack?: () => void; onMin?: () => void; hold?: boolean }) {   // hold = 접혀 있음(주소가 다른 화면 → 고르던 일을 그대로 붙듦)
  const nav = useNavigate();
  const loc = useRouterState({ select: (s) => ({ p: s.location.pathname, q: s.location.searchStr || "" }) });
  const held = useRef<VMode>(modeOfPath(loc.p));
  if (!hold) held.current = modeOfPath(loc.p);
  const mode = held.current;
  const [seen, setSeen] = useState<Partial<Record<VMode, string>>>({});   // 연 화면 = 그 화면이 받은 물음표(?u=… · 다시 넘겨받으면 새 번호 = 새로 붙임)
  const [menu, setMenu] = useState(false);
  const cur = MODES.find((m) => m.k === mode)!;
  useEffect(() => {   // 고른 일이 처음이면 그때 읽음 · 유튜브 = 넘겨받은 주소(?u=)째로
    if (hold) return;
    setSeen((s) => {
      const u = mode === "ys" ? new URLSearchParams(loc.q).get("u") : null;
      const q = u ? `?u=${encodeURIComponent(u)}` : "";
      return s[mode] != null && !u ? s : { ...s, [mode]: q };
    });
  }, [mode, loc.q, cur.src, hold]);
  useEffect(() => {
    if (!menu) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [menu]);
  const pick = (k: VMode) => { setMenu(false); if (k !== mode) void nav({ to: MODES.find((m) => m.k === k)!.path, replace: true }); };
  const onTab = (src: string) => {   // 품은 화면이 넘김 = 아는 일이면 그 일로(설정을 넘겨받게 새로 읽음) · 모르는 주소 = 옛대로 한 겹
    const k = modeOfSrc(src), q = src.includes("?") ? src.slice(src.indexOf("?")) : "";
    if (!k) { openInApp(src); return; }
    setSeen((s) => ({ ...s, [k]: `${q}${q ? "&" : "?"}nmk=${Date.now().toString(36)}` }));
    void nav({ to: MODES.find((m) => m.k === k)!.path, replace: true });
  };
  return (
    <div className="tm-stage ved-stage">
      <div className="tm-head">
        <b className="tm-title">{SPARK}<span>영상 편집</span></b>
        <button type="button" className="tm-menu ved-pick" aria-haspopup="menu" aria-expanded={menu} aria-label={`지금 ${cur.t} · 눌러서 다른 일 고르기`} onClick={() => setMenu((v) => !v)}>
          {cur.t}<Chev dir={menu ? "up" : "down"} size={14} />
        </button>
        <ToolButtons onMin={onMin} onClose={onBack} />
      </div>
      <div className="tm-frame ved-frame">
        {MODES.map((m) => seen[m.k] != null ? <ModeFrame key={m.k + "|" + seen[m.k]} k={m.k} search={seen[m.k]!} on={m.k === mode} onTab={onTab} /> : null)}
        {menu ? (
          <>
            <button type="button" className="ved-veil" aria-label="닫기" tabIndex={-1} onClick={() => setMenu(false)} />   {/* 얇은 가림막 = 바깥 누름 받음(화면 안 단추가 같이 눌리지 않게) */}
            <div className="ved-menu" role="menu" aria-label="영상 편집에서 할 일">
              {MODES.map((m, i) => (
                <button key={m.k} type="button" role="menuitemradio" aria-checked={m.k === mode} className="ved-mi" style={{ animationDelay: `${Math.min(i, 7) * 26}ms` }} onClick={() => pick(m.k)}>
                  <span className="ved-mi-t">{m.t}</span>   {/* 기능 설명 줄(m.d) 뺌 — 이름만(형 11-14 「영상 에디터에 설명글들 같은거 각 기능의 없어도 됨」) */}
                  <svg className="ved-mi-ok" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
export default VideoEditor;
