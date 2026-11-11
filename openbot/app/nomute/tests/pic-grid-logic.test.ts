import assert from "node:assert/strict";
import test from "node:test";
import { pvCount, pvIndex, rowOf } from "../ui/pic-grid-logic.ts";

// 사진 묶음(ui/pic-grid.tsx) — 형 11-11 12:52 「1개는 크게 / 2개는 작게 가로로 / 3개는 작게 가로로 단 +n이 3번째 거에」
test("한 줄 · 셋까지 · 넷째부터 「+n」", () => {
  assert.deepEqual(rowOf(0), { show: 0, more: 0 });
  assert.deepEqual(rowOf(1), { show: 0, more: 0 }, "1장 = 묶음 아님(옛 꼴)");
  assert.deepEqual(rowOf(2), { show: 2, more: 0 });
  assert.deepEqual(rowOf(3), { show: 3, more: 0 });
  assert.deepEqual(rowOf(4), { show: 3, more: 1 });
  assert.deepEqual(rowOf(7), { show: 3, more: 4 });
  for (let n = 2; n <= 30; n++) { const r = rowOf(n); assert.equal(r.show + r.more, n, `${n}장 = 보이는 것 + 가린 것`); assert.ok(r.show <= 3); }
});

test("크게 보기 숫자 · 넘김 번호", () => {
  assert.equal(pvCount(12, 17), "17장 중 13번");
  assert.equal(pvIndex(780, 390, 5), 2);
  assert.equal(pvIndex(-10, 390, 5), 0);
  assert.equal(pvIndex(99999, 390, 5), 4);
  assert.equal(pvIndex(10, 0, 3), 0, "폭 0 이어도 안 깨짐");
});

test("캡처 파일 이름 = 글 시각", async () => {
  const { capName } = await import("../ui/capture.ts");
  assert.equal(capName(new Date(2026, 10, 11, 8, 5).getTime()), "캡처-20261111-0805.png");
});
