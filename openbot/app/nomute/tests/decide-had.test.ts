// [결정] 보기에 「이미 대답함」 뜻이 있으면 앱 단추를 또 안 붙임(형 11-20 03:41 dm-gik 「그리구 애들 질의가 객관식이 이미 대답함이 1개 더 생겨버리는데 그러지않게 확인해주라」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { etcAt, hasHad } from "../ui/decide-had";

test("같은 뜻 보기 = 앱 단추 0 · 없으면 그대로", () => {
  for (const c of ["이미 응답", "이미 대답함", "이미 답했어", "이미 답변함", "이미 응답함(3번)", "이미대답"]) assert.equal(hasHad(["진행", c, "기타"]), true, c);
  for (const c of [["진행", "보류"], ["기타(직접 입력)"], ["지금 바로", "내일"], []]) assert.equal(hasHad(c), false, c.join(","));
  assert.equal(hasHad(undefined), false);
});

test("결정 창 · 글 아래 둘 다 같은 셈", () => {
  const s = readFileSync(new URL("../ui/decide-pop.tsx", import.meta.url), "utf8");
  assert.equal(s.match(/\{hasHad\(d\.choices\) \? null : <button/g)?.length, 2);
});

// 깃 11-20 03:52 「「④ 기타」 겹침도 같은 꼴로 걷어」 — 애들 보기 「기타」 줄이 앱 기타 노릇(같은 자리 입력칸) · 앱 「기타 · 직접 쓰기」 0
test("애들 보기 기타 = 그 줄이 직접 쓰기 칸 · 앱 기타 줄 0", () => {
  assert.equal(etcAt(["진행", "보류", "이미 응답", "기타(직접 입력)"]), 3);
  assert.equal(etcAt(["진행", "기타_주관식 입력"]), 1);
  assert.equal(etcAt(["진행", "직접 입력"]), 1);
  assert.equal(etcAt(["진행", "주관식"]), 1);
  assert.equal(etcAt(["진행", "보류"]), -1);
  assert.equal(etcAt(["기타리스트 부르기"]) >= 0, true);   // 앞머리 「기타」 = 기타로 셈(짐작 · 애들 보기에 드묾)
  const s = readFileSync(new URL("../ui/decide-pop.tsx", import.meta.url), "utf8");
  assert.match(s, /i === ei \? <Fragment key=\{i\}>\{etcRow\(d, p, i \+ 1, c\)\}<\/Fragment>/);
  assert.match(s, /\{ei < 0 \? etcRow\(d, p, d\.choices\.length \+ 1\) : null\}/);
  assert.match(s, /i === ei \? <Fragment key=\{i\}>\{etcLine\(i, c\)\}<\/Fragment>/);
  assert.match(s, /\{ei < 0 \? etcLine\(d\.choices\.length\) : null\}/);
});
