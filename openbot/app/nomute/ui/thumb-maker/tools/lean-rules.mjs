// 카드 제작 옷(../thumb-maker.css)에서 「큰 덩어리에 건 :has()」를 표시(속성)로 바꾸는 표 — scope-css.mjs 가 원본을 다시 뗄 때 맨 끝에 다시 입힘(손으로 한 번 고치고 잊는 일 0)
//   까닭(실측 11-18 · 맥 헤드리스 · cpu ÷4): :has() 가 걸린 요소는 그 밑 어디서 글자 · 요소 하나만 바뀌어도 브라우저가 「이 :has 가 바뀌었나」를 다시 따짐
//     판 뿌리(.nm-tm) · 판 몸(.panel)에 걸려 있으면 = 글 한 타 · 미리보기 한 번 그리기마다 판 전체가 대상 → 단추 · 입력 칸 꼴을 다시 셈하고 다시 배치함
//     작은 덩어리(.scard · .csec · 미리보기 무대 · 기둥)에 건 :has 는 그 안에서만 돌아 값이 작음 = 그대로 둠
//   쓰기: node ui/thumb-maker/tools/lean-rules.mjs  (지금 ../thumb-maker.css 에 입힘 · 이미 입혀져 있으면 「0 곳」)
import fs from "node:fs";

/** [원본 선택자 조각, 바꾼 조각, 몇 번 나와야 하나, 누가 그 표시를 다나] */
export const LEAN = [
  // 옛 셸의 도구 창(#tooldlg)이 닫히는 동안 뒤 화면을 숨기던 줄 — 앱엔 #tooldlg 가 없어 원래도 한 번도 안 걸림 · 표시는 아무도 안 닮(= 계속 안 걸림)
  ['.nm-tm.modern-workspace:has(#tooldlg[data-tool-phase="closing"]) ', ".nm-tm.modern-workspace[data-nm-tool-closing] ", 2, "아무도(옛 셸 전용 줄)"],
  // 미리보기 도크가 「흐름」으로 풀렸을 때만 빠른 메뉴(#rfab)를 보임 — 표시 = engine/modern.ts flow() 가 도크에 data-nm-rail-flow 를 달 때 판 뿌리에도 data-nm-flow
  [".nm-tm.modern-ui-frame:not(:has(.topdock[data-nm-rail-flow])) #rfab", ".nm-tm.modern-ui-frame:not([data-nm-flow]) #rfab", 1, "engine/modern.ts flow()"],
  // 판에 보이는 입력 칸이 하나도 없을 때 결과 칸 위 여백을 줄임 — 표시 = ../lean.ts watchBare() 가 다섯 조건을 보고 .panel 에 data-nm-bare
  [".nm-tm .panel:has(#reelsBox.none):has(#rOptHead.none):has(#spHead.none):not(:has(#optCards > .scard:not(.none))):not(:has(#imgeditBox:not(.none))) + .out", ".nm-tm .panel[data-nm-bare] + .out", 2, "lean.ts watchBare()"],
];

/** css 에 표를 입힘 · strict = 원본에서 다시 뗀 직후(횟수가 안 맞으면 멈춤 = 원본 줄이 바뀐 것 → 표를 다시 맞출 것) */
export function applyLean(css, strict = false) {
  let n = 0;
  for (const [from, to, want, who] of LEAN) {
    const got = css.split(from).length - 1;
    if (strict && got !== want) throw new Error(`lean-rules: 「${from.slice(0, 60)}…」 ${got}번(기대 ${want}) — 원본이 바뀜 · 표(표시 = ${who})를 다시 맞출 것`);
    if (got) { css = css.split(from).join(to); n += got; }
  }
  return { css, n };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const OUT = new URL("../thumb-maker.css", import.meta.url).pathname;
  const r = applyLean(fs.readFileSync(OUT, "utf8"));
  if (r.n) fs.writeFileSync(OUT, r.css);
  console.log(`lean-rules: ${r.n} 곳 바꿈`);
}
