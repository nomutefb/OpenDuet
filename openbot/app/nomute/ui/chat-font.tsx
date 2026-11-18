// 대화 글꼴 = YETA 설정 「글꼴」 칸 그대로(형 10-28 15:36 「대화 폰트를 예타에서처럼 설정」 · 「거기에 적용해놨던 체를 일단 적용」 · 장부 office-chat-read.md 6·7번)
//   원본 = nomutefb/YETA viewer/index.html yFontGet·yFontSet·yFontApply(1691~1700줄) · fontRow·ySetVal latin/hangul(3404·3342줄) · 탭 = 토글(3673줄) · 저장 열쇠 yeta_font_* 그대로(이 기기)
//   기본 = 영문 LEMONMILK(11-09 굵은 꼴 뺌 · Manrope 고를 수 있음) · 한글 Paperlogy(YETA 운영자 260708 「기본값으로」) · 끄면 Pretendard 스택 · 라틴 글꼴을 스택 앞에 = 라틴 글자만 그 글꼴, 한글은 다음 글꼴로
//   적용 자리 = --app-font 를 html 에 · 대화창(.ychat · 말풍선·입력칸)만 그 스택을 씀(./yeta-chat.css) · 글꼴 파일 = YETA viewer/fonts 에서 쓰는 굵기만(./fonts · ./yeta-chat.css @font-face)
//   앱 전체 Pretendard(형 11-04 10:40 「그것도 설정에서 선택할수잇게해줘. 하나의 옵션으루」 · 「전체 인앱에 일괄을 말하는거임」 · 에디터 카드 글꼴 = Pretendard Variable) = html[data-font-all] · 글꼴 파일 = 에디터와 같은 출처 /assets/fonts/pretendard.woff2(./font-all.css) · 저장 nm_font_all(이 기기)
import { PickRow } from "./yset-rows";
import { useState } from "react";
import "./font-all.css";

type K = "latin" | "hangul";
// 영문 = LEMON MILK 기본 그대로 · 굵은 꼴 뺌(형 11-09 13:21 dm-sia 「레몬밀크만큼 이쁜게 없는데」 · 「그럼 레몬밀크에서 볼디함좀 다 빼봐」 = ./yeta-chat.css 700 칸도 Regular 파일) ·
//   Manrope = 고를 수 있는 셋째 꼴(형 13:2x 시아 창 「manrope로 한번해봐」 · 시아) · 고르기 = LEMON MILK → Manrope → 기기 글꼴 → LEMON MILK · 저장 열쇠 nm_font_latin(옛 yeta_font_latin 「sys」 끈 기기도 새로 기본)
const LATIN = ["lemonmilk", "manrope", "sys"] as const;
const keyOf = (k: K) => (k === "latin" ? "nm_font_latin" : `yeta_font_${k}`);
const fontGet = (k: K) => { const d = k === "latin" ? "lemonmilk" : "paperlogy"; try { return localStorage.getItem(keyOf(k)) || d; } catch { return d; } };
const fontSet = (k: K, v: string) => { try { localStorage.setItem(keyOf(k), v); } catch { /* 이번만 */ } };
const latinFace = () => ({ manrope: "'Manrope'", lemonmilk: "'LEMONMILK'" } as Record<string, string>)[fontGet("latin")] || null;
// PC 기본 = 앱 전체 Pretendard(형 11-16 10:5x 구름 맥 창 「피시는 기본 다 프리텐다드를 기본체로 디폭트하자」) — 이 기기에서 한 번도 안 고른 PC(저장 값 없음)는 켠 꼴 · 설정에서 끄면(빈 값 저장) 그대로 꺼짐 · 폰 기본은 앞과 같음(LEMON MILK · Paperlogy)
//   PC = 두 칸 잣대(./side.tsx SPLIT 860px 과 같은 값 · 창을 줄였다 늘리면 다시 셈)
const PC_Q = "(min-width: 860px)";
const pcNow = () => typeof matchMedia === "function" && matchMedia(PC_Q).matches;
/** 순수 — 저장 값 · PC 여부 → 앱 전체 Pretendard 켬인가(시험 가능) */
export const fontAllOn = (saved: string | null, pc: boolean) => saved === "pretendard" || (saved === null && pc);
const allOn = () => { let v: string | null = null; try { v = localStorage.getItem("nm_font_all"); } catch { return false; } return fontAllOn(v, pcNow()); };
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
if (typeof matchMedia === "function") { try { matchMedia(PC_Q).addEventListener("change", applyChatFont); } catch { /* 옛 브라우저 = 다음에 열 때 */ } }   // 창 폭이 PC ↔ 폰 잣대를 넘나들면 기본값도 따라감

/** 설정 판 「글꼴」 칸 줄 셋 — 하나 고르기 레일(./yset-rows · 형 11-18 · 앞 = 누를 때마다 다음 글꼴로 넘어감) · 고르면 바로 적용 · 저장 */
export function ChatFontRows() {
  const [, bump] = useState(0);
  const all = allOn(), go = () => { applyChatFont(); bump((x) => x + 1); };
  const latin = (LATIN as readonly string[]).includes(fontGet("latin")) ? fontGet("latin") : LATIN[0];
  return (
    <>
      <PickRow id="font-all" ic="type" t="앱 전체 글꼴" options={[{ v: "base", t: "기본" }, { v: "pretendard", t: "Pretendard" }]} value={all ? "pretendard" : "base"}
        onPick={(v) => { try { localStorage.setItem("nm_font_all", v === "pretendard" ? "pretendard" : ""); } catch { /* 이번만 */ } go(); }} />
      {all ? null : <>
        <PickRow id="font-latin" ic="latin" t="영문 폰트" options={LATIN.map((k) => ({ v: k as string, t: ({ manrope: "Manrope", lemonmilk: "LEMON MILK" } as Record<string, string>)[k] || "Pretendard" }))} value={latin}
          onPick={(v) => { fontSet("latin", v); go(); }} />
        <PickRow id="font-hangul" ic="hangul" t="한글 폰트" options={[{ v: "paperlogy", t: "Paperlogy" }, { v: "sys", t: "Pretendard" }]} value={fontGet("hangul") === "paperlogy" ? "paperlogy" : "sys"}
          onPick={(v) => { fontSet("hangul", v); go(); }} />
      </>}
    </>
  );
}
