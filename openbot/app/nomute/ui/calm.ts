// 형 손 2분 없으면 장식 움직임 쉼(html.nm-calm) · 손 대면 바로 다시 — 11-14 형 맥 뜨거움(형 09:13 봄 옮김 「코딩 방식에 문제가 있는게 아닌지? 비효율적으로」 · 시아 실측: 화면에 도는 게 하나라도 있으면 프레임마다 유리 흐림 122칸을 다시 셈)
//   멈추는 것 = 무지개 테 · 계기 돌기 · 반짝 글자 · 점 셋(./calm.css) · 조약돌 얼굴은 ./bloub.tsx 가 같은 2분으로 따로 쉼 · 꼴은 그대로(멈춘 자리에 그대로 서 있음)
export const CALM_MS = 120_000;
export const calmDue = (now: number, lastTouch: number, ms = CALM_MS) => now - lastTouch >= ms;
if (typeof window !== "undefined" && typeof document !== "undefined") {
  let touched = Date.now(), timer = 0;
  const root = document.documentElement;
  const arm = () => { window.clearTimeout(timer); timer = window.setTimeout(() => root.classList.add("nm-calm"), CALM_MS); };
  const wake = () => { touched = Date.now(); if (root.classList.contains("nm-calm")) root.classList.remove("nm-calm"); arm(); };
  for (const k of ["pointerdown", "pointermove", "keydown", "wheel", "touchstart"]) window.addEventListener(k, wake, { passive: true, capture: true });
  document.addEventListener("visibilitychange", () => { if (!document.hidden && !calmDue(Date.now(), touched)) wake(); });
  arm();
}
