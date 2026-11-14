// 무게 재기 스위치(봄 11-14 09:15 「한 줄씩 붙여 넣어 끌 수 있는 스위치 묶음 · 주소 꼬리표」 · 형 맥 뜨거움) — 앱 주소 ?perf=face,glass,… 로 하나씩 끔 · 이 창(탭)에만 · 꼬리표 빼고 열면 다시 켜짐
//   face = 조약돌 얼굴 모양 다시 그리기 · glass = 유리 흐림(backdrop-filter) · arc = 둥근 계기 돌기 · rainbow = 얼굴 무지개 테 · stripe = 「요약 중」 반짝 글자 · dots = 생각 중 점 셋
//   leds = 상태 띠 불빛(box-shadow 숨쉬기) · bg = 움직이는 배경 · all = 위 전부 + 나머지 애니메이션 · 전환
export const PERF_KEYS = ["face", "glass", "arc", "rainbow", "stripe", "dots", "leds", "bg", "all"] as const;
export function perfOff(search: string): string[] {
  const v = new URLSearchParams(search).get("perf") || "";
  const on = v.split(/[,\s]+/).filter((k) => (PERF_KEYS as readonly string[]).includes(k));
  return on.includes("all") ? [...PERF_KEYS] : on;
}
if (typeof location !== "undefined" && typeof document !== "undefined") {
  let off: string[] = [];
  try { off = perfOff(location.search); if (off.length) sessionStorage.setItem("nm-perf", off.join(",")); else off = (sessionStorage.getItem("nm-perf") || "").split(",").filter(Boolean); } catch { off = perfOff(location.search); }
  if (/[?&]perf=(?:&|$)/.test(location.search)) { off = []; try { sessionStorage.removeItem("nm-perf"); } catch { /* 이번만 */ } }   // ?perf= 빈 값 = 다 켬
  for (const k of off) document.documentElement.classList.add("perf-no-" + k);
  if (off.length) console.info("[perf] 끔 =", off.join(", "));
}
