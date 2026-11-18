// 몸 화면 탭(형 11-16 16:2x 구름 맥 창 「ㅇㅇ 해줘」 ← 「애들 vm키면, pc에서는 새 탭으로 열리게 가능해?」 · 「가능함녀 구글 데스크톱도 링크화 하던지 해서 동일하게」)
//   들머리 = openScreenTab(프로필 카드 「몸 화면 열기」가 부름 · 탭으로 못 여는 곳이면 false = 부른 쪽이 앞 꼴 그대로)
//   판 = ScreenTabPane(위 탭 줄의 화면 탭 안 · ./tab-bar.tsx) — 처음 켤 때 표를 새로 받아 그 주소로 끼움(표 = 2분 · 한 번 · 앱을 다시 읽어도 탭은 남고 표만 새로)
//     · 다른 탭으로 가면 틀을 내리고(그 몸이 안 보는 화면을 보내느라 일하지 않게) 돌아오면 표를 새로 받아 다시 붙음 · 표를 못 받으면 「다시」 · 「새 창으로 열기」
//     · 구글 원격 데스크톱 = 끼워 넣기 막힘 → 탭 안엔 「화면 열기」 링크(새 창)
import { useCallback, useEffect, useRef, useState } from "react";
import { office } from "../data/office";
import { screenGoUrl, screenTicket } from "./screen-ticket";
import { SCREEN_TAB_EVENT, type ScreenTabAsk, isGrokBot, isOutside, screenTabWay } from "./screen-tab-logic";
import "./screen-tab.css";

/** 몸 화면을 탭으로 — 열었으면 true */
export function openScreenTab(ask: ScreenTabAsk, w: Window = window): boolean {
  const d = w.document, bar = d.querySelector<HTMLElement>(".nm-tabs:not(.nm-area)");
  const way = screenTabWay({ pc: !!d.querySelector(".nm-split-root"), macApp: d.documentElement.classList.contains("nm-macapp"), webTabs: !!bar && w.getComputedStyle(bar).display !== "none" });
  if (!way) return false;
  const crd = isOutside(ask.url);   // crd = 앱 안에 못 끼우는 화면(구글 원격 데스크톱 · 그록 컴퓨터 · ./screen-tab-logic.ts)
  if (way === "app") { w.open(crd ? ask.url : new URL(screenGoUrl(ask.url), w.location.href).href, "_blank", "noopener"); return true; }   // 맥 독 앱 = window.open 을 제 탭 줄 새 탭으로 받음(./inapp.ts macTab 과 같은 길) · 표는 서버 「바로 보내기」가 붙임
  w.dispatchEvent(new CustomEvent<ScreenTabAsk>(SCREEN_TAB_EVENT, { detail: ask }));
  if (crd) w.open(ask.url, "_blank", "noopener");   // 끼워 넣기 막힌 화면 = 탭(다시 여는 링크)을 만들고 이번 누름으로 바로 새 창도(누름 한 번 = 앞과 같음)
  return true;
}

export function ScreenTabPane({ url, name, on }: { url: string; name: string; on: boolean }) {
  const crd = isOutside(url);
  const [src, setSrc] = useState(""), [st, setSt] = useState<"idle" | "wait" | "ok" | "fail">("idle");
  const asked = useRef(false);
  const ask = useCallback(() => {
    setSt("wait");
    void screenTicket(url, (b) => office<{ url?: string }>("screen/ticket", { method: "POST", body: JSON.stringify(b) })).then((u) => { if (u) { setSrc(u); setSt("ok"); } else setSt("fail"); });
  }, [url]);
  useEffect(() => {   // 처음 보일 때 한 번(안 본 탭은 표를 안 씀) · 한 박자 뒤에 받음 = 탭 줄이 화면 칸 자리를 잡으며 이 판을 바로 다시 그릴 때(앱을 다시 읽은 직후) 표를 두 번 받지 않게(실물 = 다시 읽으면 표 응답 2번)
    if (crd || !on || asked.current) return undefined;
    const t = window.setTimeout(() => { asked.current = true; ask(); }, 80);
    return () => window.clearTimeout(t);
  }, [crd, on, ask]);
  useEffect(() => { if (on) return; asked.current = false; setSrc(""); setSt("idle"); }, [on]);   // 안 보이는 탭 = 틀을 내림(숨은 채 화면을 계속 받으면 그 몸이 쓸데없이 일함 · 탭이 쌓이면 연결도 쌓임 · 시아 11-16 16:41) → 다시 켜면 표를 새로 받아 다시 붙음(몸 화면 자체는 그대로)
  return (
    <div className="nm-scr-tab" hidden={!on}>
      {crd ? (
        <div className="nm-scr-msg"><b>{name}</b><span>{isGrokBot(url) ? "그록 컴퓨터 화면이라" : "구글 원격 데스크톱 화면이라"} 탭 안에 넣을 수 없어요.</span><a className="nm-scr-btn go" href={url} target="_blank" rel="noopener noreferrer">화면 열기</a></div>
      ) : st === "ok" ? (
        <iframe src={src} title={name} allow="clipboard-read; clipboard-write; fullscreen; keyboard-map" />
      ) : st === "fail" ? (
        <div className="nm-scr-msg" role="alert"><b>{name}</b><span>화면 표를 받지 못했습니다.</span><span className="row"><button type="button" className="nm-scr-btn go" onClick={ask}>다시</button><a className="nm-scr-btn" href={screenGoUrl(url)} target="_blank" rel="noopener noreferrer">새 창으로 열기</a></span></div>
      ) : (
        <div className="nm-scr-msg" aria-live="polite"><b>{name}</b><span>여는 중…</span></div>
      )}
    </div>
  );
}

export { SCREEN_TAB_EVENT, type ScreenTabAsk };
