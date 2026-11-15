// CLI 계정 우선순위 카드 다발의 셈(형 11-16 「우선순위 설정하는 모듈 … 실제러 그렇게 반영되게」 · ../ui/acct-prio-logic.ts)
import { test } from "node:test";
import assert from "node:assert/strict";
import { cardsOf, lastToFront, maskMail, orderOf, payKo, resetKo, sameOrder, toBack, toFront, tone, usable } from "../ui/acct-prio-logic.ts";

const NOW = Date.parse("2026-11-16T03:00:00+09:00");
const rows = [
  { key: "claude:muteno@pm.me", name: "muteno", value: "muteno@pm.me", kind: "claude", no: 1, pay_end: "2026-11-10", plan: "Ultra", note: "한도 읽기 HTTP 429" },
  { key: "claude:ems1130@naver.com", name: "naver", value: "ems1130@naver.com", kind: "claude", no: 2, plan: "Ultra", left_pct: 57, next_at: 1795082399000, week_reset: "목 18:59", names: ["뜸", "번개"], cells: { "5시간": { left_pct: 100 }, "7일": { left_pct: 57, reset_at: 1795082399000 } } },
  { key: "claude:ems1130g@gmail.com", name: "ems1130g", value: "EMS1130G@gmail.com", kind: "claude", no: 4, plan: "Ultra", left_pct: 95, week_reset: "토 17:59", cells: { "5시간": { left_pct: 12 }, "7일": { left_pct: 95 } } },
  { key: "gpt:muteno@pm.me", name: "gpt muteno", value: "muteno@pm.me", kind: "gpt", no: 5, plan: "ChatGPT Pro", pay_end: "2026-12-06" },
];

test("카드 = 클로드 계정만 · 번호 차례 · 한도 · 갱신일 · 기한 · 요금제", () => {
  const cs = cardsOf(rows, NOW);
  assert.deepEqual(cs.map((c) => c.name), ["muteno", "naver", "ems1130g"]);
  const [m, n, g] = cs;
  assert.equal(m.ended, true); assert.equal(m.d7, null); assert.equal(payKo(m), "끝남"); assert.equal(resetKo(m, NOW), "—");
  assert.deepEqual([n.plan, n.d7, n.h5, n.reset, n.payEnd, n.ended], ["Ultra", 57, 100, "목 18:59", "", false]);
  assert.equal(payKo(n), "—"); assert.deepEqual(n.users, ["뜸", "번개"]);
  assert.equal(g.mail, "ems1130g@gmail.com");   // 메일 = 소문자로(서버 차례와 같은 꼴)
  assert.equal(payKo({ payEnd: "2026-12-06", ended: false }), "12-06");
});
test("고를 수 있는 계정 = 결제 끝 아님 · 7일 값 있음 · 5시간 20% 이상(교대 도구와 같은 조건)", () => {
  const [m, n, g] = cardsOf(rows, NOW);
  assert.deepEqual([usable(m), usable(n), usable(g)], [false, true, false]);
  assert.deepEqual([tone(null), tone(5), tone(15), tone(57)], ["none", "low", "mid", "ok"]);
});
test("차례 = 고른 것 먼저(표에 없는 계정 · 겹침은 버림) → 나머지는 번호 차례", () => {
  const cs = cardsOf(rows, NOW);
  assert.deepEqual(orderOf(cs, []), ["muteno@pm.me", "ems1130@naver.com", "ems1130g@gmail.com"]);
  assert.deepEqual(orderOf(cs, ["EMS1130G@gmail.com", "gone@x.kr", "ems1130g@gmail.com"]), ["ems1130g@gmail.com", "muteno@pm.me", "ems1130@naver.com"]);
});
test("넘기기 = 앞 → 맨 뒤 · 맨 뒤 → 앞 · 고른 카드 → 맨 앞(나머지 차례 그대로)", () => {
  const o = ["a", "b", "c", "d"];
  assert.deepEqual(toBack(o), ["b", "c", "d", "a"]);
  assert.deepEqual(lastToFront(o), ["d", "a", "b", "c"]);
  assert.deepEqual(toFront(o, "c"), ["c", "a", "b", "d"]);
  assert.deepEqual(toFront(o, "x"), o); assert.deepEqual(toBack(["a"]), ["a"]);
  assert.equal(sameOrder(o, [...o]), true); assert.equal(sameOrder(o, toBack(o)), false);
  assert.equal(maskMail("ems1130g@gmail.com"), "ems•••@gmail.com");
});
