// 썸네일 미리보기 낱말 가림(구름 11-19 · 14:2x 되살림 = 형 「아냐 그건 숨진채 발견 으로 하고 넘으면 막아지게」 · 앞 판 13:55 끔 · 형 13:42~13:43 dm-eyes 뜸 옮김 「오케 자살이 잘못은아니잖아 글자가?」 「웅 그거 꺼주게 봄에게 요청해」 · 깃 부탁 · 에디터 = editor #4374)
//   엔진은 브라우저 전역에 기대서 불러오지 않고 글로 봄(다른 엔진 시험과 같은 꼴)
import { test } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("가림 표 = 되살림(「자살」 → 「*살」 · 형 14:19~14:20 인스타 18세 가림) · 배선(sensMask) 그대로", () => {
  const t = readFileSync(new URL("../ui/thumb-maker/engine/p05-text.ts", import.meta.url), "utf8");
  assert.match(t, /^export const SENS_MASK = \[\['자살', '\*살'\]\];/m);
  assert.match(t, /export function sensMask\(s\) \{ let o = String\(s == null \? '' : s\); for \(const \[a, b\] of SENS_MASK\) o = o\.split\(a\)\.join\(b\); return o; \}/);
});
