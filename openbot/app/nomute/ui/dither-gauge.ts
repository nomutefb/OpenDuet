// 게이지 = 채운 쪽 단색 · 남은 쪽 눈금 무늬 · 경계는 점점이 녹아듦(형 11-15 영상 「첨부3은 게이지 참고 60프레임으로 봐」 · 「nomutefb 에 이런것도 있으니 봐보고 … 가져다 써」)
//   영상(60프레임 실측) = 단색 막대가 값까지 · 그 앞 한 띠는 점이 성기게 흩어지며 무늬로 넘어감 · 빨리 움직일수록 띠가 길고 멈추면 0
//   재료(형 저장소) — 똑같은 부품은 16곳에 없어서 셋을 엮음:
//     · 점 흩기 차례 = paper-shaders packages/shaders/src/shaders/dithering.ts bayer4x4(4×4 차례 표 · 아래 BAYER4 = 그 값 그대로)
//     · 눈금 = bencho blocks/wake-slider(막대 3 · 사이 4 = BAR · GAP)
//     · 점 무늬를 띠로만 보이기 = kinetics 「43. Dither bloom」 결(무늬 + 가림)
//   움직임 = 옛 게이지 그대로 한 번(0.72초 · --gauge-ease) · 도는 것 0 · 표준 CSS 만(background-size · position) = 프레임마다 스크립트 0
export const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export const BAR = 3, GAP = 4;   // bencho WakeSlider
const COLS = 12, CELL = 3, BAND = COLS * CELL, ROWS = 4;

/** 띠 한 장 — 왼쪽(채운 쪽)은 촘촘 · 오른쪽으로 갈수록 성김(열마다 켜진 칸 수 = 차례 표가 정함) */
export function bandCells(): boolean[][] {
  return Array.from({ length: ROWS }, (_, r) => Array.from({ length: COLS }, (_, c) => (BAYER4[r * 4 + (c % 4)] + 0.5) / 16 < 1 - (c + 0.5) / COLS));
}
export function bandSvg(color: string): string {
  let d = "";
  bandCells().forEach((row, r) => row.forEach((on, c) => { if (on) d += `M${c * CELL} ${r * CELL}h${CELL}v${CELL}h-${CELL}z`; }));
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${BAND}' height='${ROWS * CELL}' viewBox='0 0 ${BAND} ${ROWS * CELL}' preserveAspectRatio='none' shape-rendering='crispEdges'><path fill='${color}' d='${d}'/></svg>`)}")`;
}
/** sel = 차오르는 단추(옛 .go.firing) · color = 시그니처 색(띠 그림은 CSS 변수를 못 읽어 글자로 넣음) · pre = 밝게/어둡게 가르는 앞머리 */
export function ditherGaugeCss(sel: string, color: string, pre = ""): string {
  const s = `${pre}${sel}`, H = ROWS * CELL;
  return `${s}{background:linear-gradient(var(--accent),var(--accent)) left/0% 100% no-repeat,${bandSvg(color)} 0% 0/${BAND}px ${H}px repeat-y,repeating-linear-gradient(90deg,rgba(var(--accent-rgb),.3) 0 ${BAR}px,transparent ${BAR}px ${BAR + GAP}px);animation:nmDgFill .72s var(--gauge-ease,cubic-bezier(.22,.61,.36,1)) forwards}`
    + `@keyframes nmDgFill{from{background-size:0% 100%,${BAND}px ${H}px,auto;background-position:left,0% 0,0 0}to{background-size:100% 100%,0px ${H}px,auto;background-position:left,100% 0,0 0}}`
    + `@media (prefers-reduced-motion:reduce){${s}{animation-duration:.2s}}`;
}
