// 폰 = 파이프라인 서브 줄 두 단(형 11-21 05:48 dm-sia 시아 옮김 「이거 00(서브 기능) 00시간전 / 가로로 두고 그 아래에 모델 선택 둘게 좁아서 무너지니까 모바일은」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../ui/model-set.css", import.meta.url), "utf8");

test("폰(≤ 640) 서브 줄 = 윗단 이름 · N시간 전 가로 · 아랫단 모델 · 노력도 · PC 세 칸 꼴은 그대로", () => {
  const m = css.slice(css.indexOf("@media (max-width:640px) {\n  .nm-ms-row.sub"));
  assert.ok(m.length > 0);
  assert.match(m, /\.nm-ms-row\.sub \{ grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\); row-gap:4px;/);
  assert.match(m, /\.nm-ms-row\.sub \.who \{ grid-column:1 \/ -1; flex-wrap:wrap; \}/);
  assert.match(m, /\.nm-ms-row\.sub \.who b \{ overflow-wrap:normal; word-break:keep-all; \}/);
  assert.match(css, /\.nm-ms-row \{ display:grid; grid-template-columns:minmax\(0,1fr\) 122px 98px;/);
});
