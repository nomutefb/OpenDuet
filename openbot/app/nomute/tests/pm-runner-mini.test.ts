// 러너맵 축소판의 아이 한 줄 = 서버 활동 판정 그대로(형 11-14 「멈춤? 이렇게 뜨는거 없어야 함」)
import test from "node:test";
import assert from "node:assert/strict";
import { miniLine } from "../ui/pm-runner-mini-logic.ts";

test("쉬는 그록 · 카리나 = 쉼(멈춤? 아님) · 일하는 손 = 일함 · 대기 신호 = 받을 수 있음", () => {
  assert.deepEqual(miniLine({ name: "천둥", state: "쉼", value: "쉼" }), { name: "천둥", kind: "rest", label: "쉼", sub: "" });
  assert.deepEqual(miniLine({ name: "깃", state: "일", value: "일" }), { name: "깃", kind: "work", label: "일함", sub: "" });
  assert.deepEqual(miniLine({ name: "카리나", state: "쉼", value: "쉼 · 받을 수 있음", ready: true }), { name: "카리나", kind: "ready", label: "쉼", sub: "받을 수 있음" });
});

test("멈춤 = 서버가 멈춤으로 판정한 줄만 · 까닭을 옆에 · 모름은 모름", () => {
  assert.deepEqual(miniLine({ name: "뎅", state: "멈춤", value: "멈춤 · 신호 끊김" }), { name: "뎅", kind: "lost", label: "멈춤", sub: "신호 끊김" });
  assert.deepEqual(miniLine({ name: "누리", state: "모름", value: "모름" }), { name: "누리", kind: "unknown", label: "모름", sub: "" });
  for (const r of [{ name: "a", state: "쉼" }, { name: "b", state: "모름" }, { name: "c", state: "일" }]) assert.ok(!miniLine(r).label.includes("?"));
});
