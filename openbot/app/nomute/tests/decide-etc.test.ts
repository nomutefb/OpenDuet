// [결정] 글 아래 단추 = 기타(주관식) 칸 · 「이미 대답함」 따로(형 11-14 10:34 봄 옮김 「기타가 왜 이미대닺함이여」 · 「주관식이없네」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
test("기타 = 직접 쓰기 칸 · 이미 대답함 단추 그대로", () => {
  const s = readFileSync(new URL("../ui/decide-pop.tsx", import.meta.url), "utf8");
  assert.match(s, /기타 · 직접 쓰기/);
  assert.match(s, /void send\(\{ text: t \}, `기타 · \$\{t\}`\)/);
  assert.match(s, /className="had" onClick=\{\(\) => void send\(\{ text: ALREADY \}, ALREADY\)\}/);
});
