// 창 부품(ui/use-modal.ts) — 창 쌓임(맨 위만 Esc) · Tab 가두기 다음 자리(빠르 11-08 · 형 01:31 「엔터프라이즈급 앱」)
import test from "node:test";
import assert from "node:assert/strict";
import { modalPush, modalTop, trapNext } from "../ui/use-modal.ts";

test("창 쌓임 — 늦게 연 창이 맨 위 · 닫으면 아래 창이 다시 맨 위", () => {
  const a = modalPush(), b = modalPush();
  assert.equal(modalTop(b.me), true);
  assert.equal(modalTop(a.me), false);
  b.pop();
  assert.equal(modalTop(a.me), true);
  a.pop();
});

test("창 쌓임 — 가운데 창이 먼저 닫혀도 맨 위는 그대로", () => {
  const a = modalPush(), b = modalPush(), c = modalPush();
  b.pop();
  assert.equal(modalTop(c.me), true);
  c.pop();
  assert.equal(modalTop(a.me), true);
  a.pop();
});

test("Tab 가두기 — 끝에서 Tab = 처음 · 처음에서 Shift+Tab = 끝 · 가운데 = 브라우저에 맡김", () => {
  const L = ["x", "y", "z"];
  assert.equal(trapNext(L, "z", true, false), "x");
  assert.equal(trapNext(L, "x", true, true), "z");
  assert.equal(trapNext(L, "y", true, false), null);
  assert.equal(trapNext(L, "y", true, true), null);
});

test("Tab 가두기 — 포커스가 창 밖이면 창 안 처음(Shift = 끝)으로 · 칸 없으면 null", () => {
  assert.equal(trapNext(["x", "y"], "밖", false, false), "x");
  assert.equal(trapNext(["x", "y"], "밖", false, true), "y");
  assert.equal(trapNext([], null, false, false), null);
});
