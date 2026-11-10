import assert from "node:assert/strict";
import test from "node:test";
import { gridRows, gridSpans, pvCount, pvIndex } from "../ui/pic-grid-logic.ts";

// 사진 묶음(ui/pic-grid.tsx) — 카톡처럼 셋씩, 외톨이 한 칸 없이
test("줄 나눔", () => {
  assert.deepEqual(gridRows(0), []);
  assert.deepEqual(gridRows(1), [1]);
  assert.deepEqual(gridRows(2), [2]);
  assert.deepEqual(gridRows(3), [3]);
  assert.deepEqual(gridRows(4), [2, 2]);
  assert.deepEqual(gridRows(5), [3, 2]);
  assert.deepEqual(gridRows(7), [3, 2, 2]);
  assert.deepEqual(gridRows(8), [3, 3, 2]);
  assert.deepEqual(gridRows(15), [3, 3, 3, 3, 3]);
  for (let n = 2; n <= 30; n++) {
    const r = gridRows(n);
    assert.equal(r.reduce((a, b) => a + b, 0), n, `${n}장 다 들어감`);
    assert.ok(r.every((k) => k === 2 || k === 3), `${n}장 = 둘 · 셋 줄만`);
  }
});

test("칸 폭 = 6칸 판", () => {
  assert.deepEqual(gridSpans(5), [2, 2, 2, 3, 3]);
  assert.deepEqual(gridSpans(4), [3, 3, 3, 3]);
  for (let n = 2; n <= 30; n++) assert.equal(gridSpans(n).length, n);
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
