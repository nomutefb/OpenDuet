// 말풍선 반응 단추 왼쪽 = 글 복사 · 누르면 ✓ 바뀜(형 11-21 08:05 「웅 그리구 이모지 버튼 좌측에 복사 버튼 만등어주고 누르면 액티브 효과 적용시켜줘」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("반응 단추 바로 왼쪽 · 같은 동그라미 · 글 메뉴와 같은 글 · ✓ 바꿈 = transform · opacity", () => {
  const ui = rd("../ui/quick-react.tsx"), css = rd("../ui/quick-react.css"), oc = rd("../ui/office-chat.tsx");
  assert.match(oc, /<QuickCopy text=\{String\(m\.text \|\| ""\)\.replace\(QUOTE, ""\) \|\| firstLine\(m\)\} \/>[^\n]*\n\s*<QuickReact /);
  assert.match(ui, /className=\{`nm-qr-btn nm-qc-btn\$\{ok \? " ok" : ""\}`\} aria-label=\{ok \? "복사됨" : "글 복사"\}/);
  assert.match(ui, /await navigator\.clipboard\.writeText\(text\)/);
  assert.match(css, /\.nm-qc \{ position:absolute; top:-10px; right:20px;/);
  assert.match(css, /\.nm-qc-btn\.ok \.nm-qc-i\.b \{ opacity:1; transform:scale\(1\);/);
  assert.doesNotMatch(css.slice(css.indexOf(".nm-qc {")), /width:[^;]*transition|height[^;]*transition|@keyframes/);
});
