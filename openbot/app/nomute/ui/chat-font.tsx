// 대화 글꼴 = YETA 설정 「글꼴」 칸 그대로(형 10-28 15:36 「대화 폰트를 예타에서처럼 설정」 · 「거기에 적용해놨던 체를 일단 적용」 · 장부 office-chat-read.md 6·7번)
//   원본 = nomutefb/YETA viewer/index.html yFontGet·yFontSet·yFontApply(1691~1700줄) · fontRow·ySetVal latin/hangul(3404·3342줄) · 탭 = 토글(3673줄) · 저장 열쇠 yeta_font_* 그대로(이 기기)
//   기본 = 영문 LEMONMILK(11-09 굵은 꼴 뺌 · Manrope 고를 수 있음) · 한글 Paperlogy(YETA 운영자 260708 「기본값으로」) · 끄면 Pretendard 스택 · 라틴 글꼴을 스택 앞에 = 라틴 글자만 그 글꼴, 한글은 다음 글꼴로
//   적용 자리 = --app-font 를 html 에 · 대화창(.ychat · 말풍선·입력칸)만 그 스택을 씀(./yeta-chat.css) · 글꼴 파일 = YETA viewer/fonts 에서 쓰는 굵기만(./fonts · ./yeta-chat.css @font-face)
//   앱 전체 Pretendard(형 11-04 10:40 「그것도 설정에서 선택할수잇게해줘. 하나의 옵션으루」 · 「전체 인앱에 일괄을 말하는거임」 · 에디터 카드 글꼴 = Pretendard Variable) = html[data-font-all] · 글꼴 파일 = 에디터와 같은 출처 /assets/fonts/pretendard.woff2(./font-all.css) · 저장 nm_font_all(이 기기)
import { useState } from "react";
import { YICO } from "./yeta-icons";
import "./font-all.css";

type K = "latin" | "hangul";
// 영문 = LEMON MILK 기본 그대로 · 굵은 꼴 뺌(형 11-09 13:21 dm-sia 「레몬밀크만큼 이쁜게 없는데」 · 「그럼 레몬밀크에서 볼디함좀 다 빼봐」 = ./yeta-chat.css 700 칸도 Regular 파일) ·
//   Manrope = 고를 수 있는 셋째 꼴(형 13:2x 시아 창 「manrope로 한번해봐」 · 시아) · 고르기 = LEMON MILK → Manrope → 기기 글꼴 → LEMON MILK · 저장 열쇠 nm_font_latin(옛 yeta_font_latin 「sys」 끈 기기도 새로 기본)
const LATIN = ["lemonmilk", "manrope", "sys"] as const;
const keyOf = (k: K) => (k === "latin" ? "nm_font_latin" : `yeta_font_${k}`);
const fontGet = (k: K) => { const d = k === "latin" ? "lemonmilk" : "paperlogy"; try { return localStorage.getItem(keyOf(k)) || d; } catch { return d; } };
const fontSet = (k: K, v: string) => { try { localStorage.setItem(keyOf(k), v); } catch { /* 이번만 */ } };
const latinFace = () => ({ manrope: "'Manrope'", lemonmilk: "'LEMONMILK'" } as Record<string, string>)[fontGet("latin")] || null;
const allOn = () => { try { return localStorage.getItem("nm_font_all") === "pretendard"; } catch { return false; } };
const PT = ["'Pretendard Variable'", "Pretendard", "-apple-system", "system-ui", "sans-serif"];
export function applyChatFont() {
  if (allOn()) { document.documentElement.dataset.fontAll = "pretendard"; document.documentElement.style.setProperty("--app-font", PT.join(",")); document.documentElement.style.setProperty("--app-font-text", PT.join(",")); return; }
  delete document.documentElement.dataset.fontAll;
  const rest = [fontGet("hangul") === "paperlogy" ? "'Paperlogy'" : null, "Pretendard", "-apple-system", "system-ui", "sans-serif"].filter(Boolean);
  const face = latinFace();
  const stack = [face, ...rest].filter(Boolean).join(",");
  document.documentElement.style.setProperty("--app-font", stack);
  document.documentElement.style.setProperty("--nm-latin-font", face || "inherit");   // 러너 판 제목·숫자처럼 영문 글꼴만 박던 자리(../runner/runner-board.css)
  //   글 본문(말풍선·입력칸) = 영문 글꼴 뺀 스택 — LEMONMILK 는 소문자 모양이 없는 대문자 글꼴이라 「vm」·주소가 「VM」·「HTTPS://…」로 보였다
  //   (저장 글자는 소문자 그대로 · 차이 기록 D9 · 형 10-28 21:16) · 이름·제목 같은 꾸밈 글자는 그대로 --app-font
  //   Manrope 는 소문자가 있어서 본문에도 씀(형이 본 비교 = 화면 전체에 입힌 꼴)
  document.documentElement.style.setProperty("--app-font-text", (fontGet("latin") === "manrope" ? [face, ...rest] : rest).join(","));
}
applyChatFont();   // 앱이 이 파일을 읽을 때 한 번(YETA 와 같음 · 설정 판을 안 열어도 먹음)

/** 값 라벨 + 기본값에서 벗어났나(YETA ySetVal) */
const valOf = (k: K): [string, boolean] => (k === "latin"
  ? [({ manrope: "Manrope", lemonmilk: "LEMON MILK" } as Record<string, string>)[fontGet("latin")] || "Pretendard", fontGet("latin") !== "lemonmilk"]
  : [fontGet("hangul") === "paperlogy" ? "Paperlogy" : "Pretendard", fontGet("hangul") !== "paperlogy"]);

/** 설정 판 「글꼴」 칸 행 둘(YETA fontRow 꼴 · 누름 = 켜고 끄기 · 바로 적용·저장) */
export function ChatFontRows() {
  const [, bump] = useState(0);
  const row = (k: K, t: string) => {
    const [v, mod] = valOf(k);
    return (
      <button key={k} type="button" className="yset-item" data-font={k}
        onClick={() => { fontSet(k, k === "latin" ? LATIN[(Math.max(0, LATIN.indexOf(fontGet("latin") as (typeof LATIN)[number])) + 1) % LATIN.length] : (fontGet("hangul") === "paperlogy" ? "sys" : "paperlogy")); applyChatFont(); bump((x) => x + 1); }}>
        <span className="si-ic" aria-hidden dangerouslySetInnerHTML={{ __html: YICO[k === "latin" ? "latin" : "hangul"] }} />
        <span className="si-lbl"><span className="si-t">{t}</span></span>
        <span className="si-v"><span className={`si-vt${mod ? " mod" : ""}`}>{v}</span><span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} /></span>
      </button>
    );
  };
  const all = allOn();
  return (
    <>
      <button type="button" className="yset-item" data-font="all" aria-pressed={all}
        onClick={() => { try { localStorage.setItem("nm_font_all", all ? "" : "pretendard"); } catch { /* 이번만 */ } applyChatFont(); bump((x) => x + 1); }}>
        <span className="si-ic" aria-hidden dangerouslySetInnerHTML={{ __html: YICO.type }} />
        <span className="si-lbl"><span className="si-t">앱 전체 글꼴</span></span>
        <span className="si-v"><span className={`si-vt${all ? " mod" : ""}`}>{all ? "Pretendard" : "기본"}</span><span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} /></span>
      </button>
      {all ? null : <>{row("latin", "영문 폰트")}{row("hangul", "한글 폰트")}</>}
    </>
  );
}
