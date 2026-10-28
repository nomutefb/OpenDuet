// 대화 글꼴 = YETA 설정 「글꼴」 칸 그대로(형 10-28 15:36 「대화 폰트를 예타에서처럼 설정」 · 「거기에 적용해놨던 체를 일단 적용」 · 장부 office-chat-read.md 6·7번)
//   원본 = nomutefb/YETA viewer/index.html yFontGet·yFontSet·yFontApply(1691~1700줄) · fontRow·ySetVal latin/hangul(3404·3342줄) · 탭 = 토글(3673줄) · 저장 열쇠 yeta_font_* 그대로(이 기기)
//   기본 = 영문 LEMONMILK · 한글 Paperlogy(YETA 운영자 260708 「기본값으로」) · 끄면 Pretendard 스택 · 라틴 글꼴을 스택 앞에 = 라틴 글자만 그 글꼴, 한글은 다음 글꼴로
//   적용 자리 = --app-font 를 html 에 · 대화창(.ychat · 말풍선·입력칸)만 그 스택을 씀(./yeta-chat.css) · 글꼴 파일 = YETA viewer/fonts 에서 쓰는 굵기만(./fonts · ./yeta-chat.css @font-face)
import { useState } from "react";
import { YICO } from "./yeta-icons";

type K = "latin" | "hangul";
const fontGet = (k: K) => { const d = k === "latin" ? "lemonmilk" : "paperlogy"; try { return localStorage.getItem(`yeta_font_${k}`) || d; } catch { return d; } };
const fontSet = (k: K, v: string) => { try { localStorage.setItem(`yeta_font_${k}`, v); } catch { /* 이번만 */ } };
export function applyChatFont() {
  const stack = [fontGet("latin") === "lemonmilk" ? "'LEMONMILK'" : null, fontGet("hangul") === "paperlogy" ? "'Paperlogy'" : null,
    "Pretendard", "-apple-system", "system-ui", "sans-serif"].filter(Boolean).join(",");
  document.documentElement.style.setProperty("--app-font", stack);
}
applyChatFont();   // 앱이 이 파일을 읽을 때 한 번(YETA 와 같음 · 설정 판을 안 열어도 먹음)

/** 값 라벨 + 기본값에서 벗어났나(YETA ySetVal) */
const valOf = (k: K): [string, boolean] => (k === "latin"
  ? [fontGet("latin") === "lemonmilk" ? "LEMON MILK" : "Pretendard", fontGet("latin") !== "lemonmilk"]
  : [fontGet("hangul") === "paperlogy" ? "Paperlogy" : "Pretendard", fontGet("hangul") !== "paperlogy"]);

/** 설정 판 「글꼴」 칸 행 둘(YETA fontRow 꼴 · 누름 = 켜고 끄기 · 바로 적용·저장) */
export function ChatFontRows() {
  const [, bump] = useState(0);
  const row = (k: K, t: string) => {
    const [v, mod] = valOf(k);
    return (
      <button key={k} type="button" className="yset-item" data-font={k}
        onClick={() => { fontSet(k, k === "latin" ? (fontGet("latin") === "lemonmilk" ? "sys" : "lemonmilk") : (fontGet("hangul") === "paperlogy" ? "sys" : "paperlogy")); applyChatFont(); bump((x) => x + 1); }}>
        <span className="si-ic" aria-hidden dangerouslySetInnerHTML={{ __html: YICO.type }} />
        <span className="si-lbl"><span className="si-t">{t}</span><span className="si-d">웨이트는 고정 — 폰트만 바뀜</span></span>
        <span className="si-v"><span className={`si-vt${mod ? " mod" : ""}`}>{v}</span><span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} /></span>
      </button>
    );
  };
  return <>{row("latin", "영문 폰트")}{row("hangul", "한글 폰트")}</>;
}
