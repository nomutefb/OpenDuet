import { test } from "node:test";
import assert from "node:assert/strict";
import { exactAgent, filterAgents, onQuery, queryAt } from "../ui/call-query.ts";

// 형 11-13 22:13 「가나 랑 가다 가 있으면 @가 치면 둘로 좁아지는거지」 · 「@모두 하고 두 쓴담에 스페이스 누르면 창이 알아서 닫히고 @모두가 잡혀야 함」
const A = [{ id: "group-all", name: "모두" }, { id: "gana", name: "가나" }, { id: "gada", name: "가다" }, { id: "bom", name: "봄" }, { id: "dabom", name: "다봄" }];

test("@ 뒤 글자로 좁힘 · 앞이 같은 것 먼저", () => {
  assert.equal(queryAt("안녕 @가"), "가");
  assert.equal(queryAt("안녕"), null);
  assert.deepEqual(filterAgents(A, "가").map((a) => a.name), ["가나", "가다"]);
  assert.deepEqual(filterAgents(A, "봄").map((a) => a.name), ["봄", "다봄"]);
  assert.equal(filterAgents(A, "").length, A.length);
  assert.equal(exactAgent(A, "모두")?.id, "group-all");
});

test("딱 맞는 이름 + 띄어쓰기 = 확정 · 안 맞으면 닫힘 · 「@」 지우면 닫힘", () => {
  assert.deepEqual(onQuery(A, "@모두 "), { t: "confirm", agent: A[0], drop: 4 });
  assert.deepEqual(onQuery(A, "봐 @가나 "), { t: "confirm", agent: A[1], drop: 4 });
  assert.deepEqual(onQuery(A, "@가 "), { t: "close" });
  assert.deepEqual(onQuery(A, "@가"), { t: "query", q: "가" });
  assert.deepEqual(onQuery(A, "봐 "), { t: "close" });
  assert.deepEqual(onQuery(A, "@"), { t: "query", q: "" });
});
