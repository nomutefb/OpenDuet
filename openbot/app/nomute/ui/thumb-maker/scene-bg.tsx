// 썸네일 생성기 뒤 장면 받침 — 에디터 모던 화면 배경(./scene.ts = modern-spatial.js 그대로)을 이 화면 뒤에 깐다
//   Three.js = 에디터와 같은 파일을 같은 출처에서 열 때 불러옴(/vendor/three/three.module.js · 앱 꾸러미 0) · 못 불러오면 받침 바탕(그라데이션)만 = 원본 css-fallback 과 같음
//   색 = 받침 요소 토큰(./frame.css .tm-ambient · 앱 밝게·어둡게 = 앱 「에디터」 칸이 에디터에 덧씌우던 YETA 톤 값) · 앱 톤이 바뀌면 다시 띄움(원본 장면은 색을 켤 때 한 번 읽음)
import { useEffect, useRef } from "react";
import { bootSpatialScene } from "./scene";

const THREE_URL = "/vendor/three/three.module.js";
type Handle = { dispose: () => void } | null;

export function SceneBg({ className = "tm-ambient" }: { className?: string } = {}) {   // className = 받침 색 토큰 자리(카드 제작 = tm-ambient · 홈 = nm-home-ambient 라임)
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let h: Handle = null, dead = false, ticket = 0;
    const boot = () => {
      const my = ++ticket;
      import(/* @vite-ignore */ THREE_URL)
        .then((THREE) => {
          if (dead || my !== ticket) return;
          try { h = bootSpatialScene(THREE, el, el.parentElement); } catch (e) { el.dataset.renderer = "css-fallback"; console.warn("[썸네일 생성기] 장면 대신 바탕만", e); }
        })
        .catch(() => { el.dataset.renderer = "css-fallback"; });
    };
    const ric = (window as Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const t0 = ric ? ric(boot, { timeout: 1200 }) : window.setTimeout(boot, 200);   // 원본 = 쉴 틈에(1.2초 상한)
    let tone = document.documentElement.classList.contains("dark");
    const mo = new MutationObserver(() => {
      const now = document.documentElement.classList.contains("dark");
      if (now === tone) return;
      tone = now; h?.dispose(); h = null; boot();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      dead = true; mo.disconnect();
      const cic = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
      if (ric && cic) cic(t0); else window.clearTimeout(t0);
      h?.dispose(); h = null;
    };
  }, []);
  return <div ref={host} className={className} aria-hidden />;
}
