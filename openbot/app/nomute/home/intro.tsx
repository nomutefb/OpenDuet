// 진입 화면 랜덤(형 11-06 18:5x 봄 창 「응 봄아 메인화면 인트로 진입화면이랑 인앱 진입화면」 · 「내 생각엔 일단 랜덤하게 나오게 하고싶은데 그게 되는지 확인해보고」 · 「일단은 봄의 정원 컨셉으로」)
//   = 목록 중 하나를 앱 열 때마다 랜덤 · 같은 창(세션) 안에선 한 번 고른 거 유지(sessionStorage) · 윈터 얼굴(앱 아이콘)은 목록 한 장으로 남김(형 11-05 「로딩화면을 윈터 얼굴인데 치워버리지말라는거야」)
//   그림·영상 = 뜸(봄의 정원 · 정사각/16:9 · 짧은 영상 가능) → public/intro/ 에 넣고 아래 목록에 한 줄씩 더하면 끝
//   main = 홈 인트로(home-screen 첫 열림) · app = 앱 안 진입(홈 말고 다른 화면으로 처음 열 때 · shell)
import { useEffect, useState } from "react";
export type IntroItem = { src: string; kind?: "img" | "video"; fit?: "icon" | "cover"; bg?: string };

const ICON: IntroItem = { src: "/office-app/icon-192.png", fit: "icon", bg: "#08295e" };   // 윈터 얼굴 = 지금 그대로
export const INTRO_MAIN: IntroItem[] = [ICON];   // 뜸 그림 오면 예: { src: "/office-app/intro/garden-1.webp", fit: "cover" } · { src: "/office-app/intro/garden-2.mp4", kind: "video", fit: "cover" }
export const INTRO_APP: IntroItem[] = [ICON];

/** 이 창에서 한 번 고른 장(없으면 지금 고름) */
export function pickIntro(kind: "main" | "app"): IntroItem {
  const list = kind === "main" ? INTRO_MAIN : INTRO_APP, key = `nm-intro-${kind}`;
  try { const i = +(sessionStorage.getItem(key) ?? -1); if (i >= 0 && i < list.length) return list[i]; } catch { /* 이번만 */ }
  const i = Math.floor(Math.random() * list.length);
  try { sessionStorage.setItem(key, String(i)); } catch { /* 이번만 */ }
  return list[i];
}

/** 진입 화면 한 장 — 아이콘 = 가운데 작게 숨쉬기(지금 꼴) · cover = 화면 가득 */
export function IntroFace({ item }: { item: IntroItem }) {
  if (item.fit === "cover") {
    return item.kind === "video"
      ? <video className="nm-intro-cover" src={item.src} autoPlay muted playsInline loop />
      : <img className="nm-intro-cover" src={item.src} alt="" decoding="async" />;
  }
  return <img src={item.src} alt="" width={88} height={88} decoding="async" />;
}

/** 앱 안 진입 화면 — 홈 말고 다른 화면(대화방 등)으로 처음 열 때 한 번 · 0.9초 뒤 걷힘(홈은 home-screen 이 따로 덮음) */
export function AppIntro({ home }: { home: boolean }) {
  const [on, setOn] = useState(() => !home && performance.now() < 10_000);
  const [item] = useState(() => pickIntro("app"));
  const [out, setOut] = useState(false);
  useEffect(() => { if (!on) return undefined; const a = setTimeout(() => setOut(true), 900), b = setTimeout(() => setOn(false), 1400); return () => { clearTimeout(a); clearTimeout(b); }; }, [on]);
  if (!on) return null;
  return <div className={`nm-app-intro${out ? " out" : ""}`} aria-hidden style={item.bg ? { background: item.bg } : undefined}><IntroFace item={item} /></div>;
}
