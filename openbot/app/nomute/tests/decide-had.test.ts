// [결정] 보기에 「이미 대답함」 뜻이 있으면 앱 단추를 또 안 붙임(형 11-20 03:41 dm-gik 「그리구 애들 질의가 객관식이 이미 대답함이 1개 더 생겨버리는데 그러지않게 확인해주라」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { hasHad } from "../ui/decide-had";

test("같은 뜻 보기 = 앱 단추 0 · 없으면 그대로", () => {
  for (const c of ["이미 응답", "이미 대답함", "이미 답했어", "이미 답변함", "이미 응답함(3번)", "이미대답"]) assert.equal(hasHad(["진행", c, "기타"]), true, c);
  for (const c of [["진행", "보류"], ["기타(직접 입력)"], ["지금 바로", "내일"], []]) assert.equal(hasHad(c), false, c.join(","));
  assert.equal(hasHad(undefined), false);
});

test("결정 창 · 글 아래 둘 다 같은 셈", () => {
  const s = readFileSync(new URL("../ui/decide-pop.tsx", import.meta.url), "utf8");
  assert.equal(s.match(/\{hasHad\(d\.choices\) \? null : <button/g)?.length, 2);
});
