// #-069 스케줄러 연결 = 「오늘 자동 n/회차」(형 11-15 15:18 「예전 자료가 이씀」 · 촉 02 웹훅 회차 빠짐이 보이게)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
test("오늘 자동 뒤 /회차(서버 today.planned 있을 때만)", () => {
  const s = readFileSync(new URL("../ui/settings-extra.tsx", import.meta.url), "utf8");
  assert.match(s, /오늘 자동 \$\{x\.today\.clock\}\$\{x\.today\.planned \? `\/\$\{x\.today\.planned\}` : ""\}/);
});
