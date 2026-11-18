import assert from "node:assert/strict";
import test from "node:test";
import { byRank, modelChoices } from "../ui/model-set-logic.ts";

// 형 11-18 19:01 dm-gik(깃 옮김) 「높은거부터 나오게해줘 미토스 부터」
test("모델 고르기 차례 = 미토스 → 오퍼스 → 페이블 → 소넷 → 하이쿠 · 같은 갈래는 판 큰 것 먼저", () => {
  const ids = ["claude-haiku-5-5", "claude-sonnet-5-5", "claude-opus-5-5", "claude-mythos-5-2", "claude-fable-5-2", "claude-opus-4-8"];
  assert.deepEqual(byRank(ids.map((id) => ({ id }))).map((c) => c.id), ["claude-mythos-5-2", "claude-opus-5-5", "claude-opus-4-8", "claude-fable-5-2", "claude-sonnet-5-5", "claude-haiku-5-5"]);
  assert.deepEqual(modelChoices([{ id: "claude-haiku-5-5", ko: "" }, { id: "claude-mythos-5-2", ko: "" }]).map((c) => c.ko), ["Mythos 5.2", "Haiku 5.5"]);
});
