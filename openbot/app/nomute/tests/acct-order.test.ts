import { test } from "node:test";
import assert from "node:assert/strict";
import { acctOrder } from "../ui/acct-order.ts";

const ids = ["CLD_01", "CLD_02", "CLD_03"];
test("정상 id = 그 카드가 앞 · known", () => {
  const r = acctOrder(ids, "CLD_02");
  assert.equal(r.known, true); assert.deepEqual(r.order, ["CLD_02", "CLD_03", "CLD_01"]);
});
for (const bad of ["", "CLD_09", "러너 · 못 읽음"]) {
  test(`빈 값 · 모르는 id · 실패(${JSON.stringify(bad)}) = 차례만 첫 칸 · 「지금」 아님`, () => {
    const r = acctOrder(ids, bad);
    assert.equal(r.known, false); assert.equal(r.front, 0); assert.deepEqual(r.order, ids);
  });
}
