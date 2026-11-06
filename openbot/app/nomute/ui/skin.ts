// 꾸밈 = 「지금」 / 「정원」(아이보리 + 봄의 정원 · 뜸 11-07 시안 · ./theme-garden.css)
//   형 11-07 08:01 뜸 1:1 「좋아 ㅋㅋ 지금테마랑 정원테마 고를 수 있게해줘」 · 기기마다(localStorage) · <html data-theme="garden">
//   밝음·어두움(테마 칸 · class "dark")과 따로 — 정원 CSS 는 :not(.dark) 에서만 먹고, 정원을 고르면 밝게로 같이 돌린다(yeta-settings).
//   첫 그림 전 붙이기 = index.html 안 스크립트(같은 열쇠 nomute-skin).
import { useSyncExternalStore } from "react";

export type Skin = "now" | "garden";
const KEY = "nomute-skin";
const subs = new Set<() => void>();

function read(): Skin {
  try { return window.localStorage.getItem(KEY) === "garden" ? "garden" : "now"; } catch { return "now"; }
}

function apply(skin: Skin) {
  if (skin === "garden") document.documentElement.dataset.theme = "garden";
  else delete document.documentElement.dataset.theme;
}

export function setSkin(skin: Skin) {
  try { if (skin === "garden") window.localStorage.setItem(KEY, "garden"); else window.localStorage.removeItem(KEY); } catch { /* 저장 못 해도 이 창에선 바뀜 */ }
  apply(skin);
  subs.forEach((f) => f());
}

export function useSkin(): Skin {
  return useSyncExternalStore(
    (f) => { subs.add(f); return () => { subs.delete(f); }; },
    read,
    () => "now",
  );
}
