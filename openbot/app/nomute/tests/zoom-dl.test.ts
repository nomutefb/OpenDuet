// 사진 보기 받기 = 위에서 라임으로 또렷하게(형 11-16 20:23 「1234 그 내용이 묻혀 위에서 체크까지 잘 보이게해줘 라임으로 강조되도됨」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
test("받기 세기 · 체크 = 라임 박음 · 위 막대에선 라임 알약 · 바탕 .97", () => {
  const d = readFileSync(new URL("../ui/dl-seq.css", import.meta.url), "utf8");
  assert.match(d, /\.nm-dlseq\.is-done \.nm-dlseq-lbl \{ color:#CFFF40 !important; \}/);
  assert.match(d, /\.nm-zoom-bar button\.nm-dlseq\.is-busy, \.nm-zoom-bar button\.nm-dlseq\.is-done \{ background:rgba\(207,255,64,\.16\)/);
  const g = readFileSync(new URL("../ui/pic-grid.css", import.meta.url), "utf8");
  assert.match(g, /\.nm-zoom\.nm-pv \{ background:rgba\(0,0,0,\.97\);/);
});
