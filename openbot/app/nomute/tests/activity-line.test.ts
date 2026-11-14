// 러너맵 축소판의 아이 한 줄 = 서버 활동 판정 그대로(형 11-14 「멈춤? 이렇게 뜨는거 없어야 함」)
import test from "node:test";
import assert from "node:assert/strict";
import { actCount, botLine, miniLine } from "../ui/activity-line.ts";

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

test("설정 「지금 봇」 한 줄 = 같은 판정 · 쉼은 마지막 손 때 · 활동 줄 없는 자리는 빈 글", () => {
  const ago = (ts?: number) => (ts ? "5분 전" : "활동 모름");
  assert.deepEqual(botLine({ name: "깃", state: "일" }, ago), { kind: "work", text: "일하는 중" });
  assert.deepEqual(botLine({ name: "봄", state: "쉼", ready: true }, ago), { kind: "ready", text: "받을 수 있음" });
  assert.deepEqual(botLine({ name: "천둥", state: "쉼", last_at: 1 }, ago), { kind: "rest", text: "쉼 · 5분 전" });
  assert.deepEqual(botLine({ name: "뎅", state: "멈춤", value: "멈춤 · 신호 끊김" }, ago), { kind: "lost", text: "멈춤 · 신호 끊김" });
  assert.deepEqual(botLine({ name: "누리", state: "모름" }, ago), { kind: "unknown", text: "활동 모름" });
  assert.deepEqual(botLine(undefined, ago), { kind: "none", text: "" });
  assert.deepEqual(actCount([{ name: "a", state: "일" }, { name: "b", state: "쉼", ready: true }, { name: "c", state: "쉼" }, { name: "d", state: "일" }]), { work: 2, ready: 1 });
});
