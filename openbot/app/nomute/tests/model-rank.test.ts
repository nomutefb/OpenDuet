import assert from "node:assert/strict";
import test from "node:test";
import { byRank, modelChoices } from "../ui/model-set-logic.ts";

// 형 11-18 19:01 dm-gik(깃 옮김) 「높은거부터 나오게해줘 미토스 부터」 · 형 11-21 17:27 dm-eyes 「응 미토스 5.2 페이블 5.2 오퍼스 5.5 소넷 5.5 하이쿠 5.5 이렇게 다 고를수있어야한다고 pm에게 전해줘」
test("모델 고르기 차례 = 미토스 → 페이블 → 오퍼스 → 소넷 → 하이쿠 · 같은 갈래는 판 큰 것 먼저", () => {
  const ids = ["claude-haiku-5-5", "claude-sonnet-5-5", "claude-opus-5-5", "claude-mythos-5-2", "claude-fable-5-2", "claude-opus-4-8"];
  assert.deepEqual(byRank(ids.map((id) => ({ id }))).map((c) => c.id), ["claude-mythos-5-2", "claude-fable-5-2", "claude-opus-5-5", "claude-opus-4-8", "claude-sonnet-5-5", "claude-haiku-5-5"]);
  assert.deepEqual(modelChoices([{ id: "claude-haiku-5-5", ko: "" }, { id: "claude-mythos-5-2", ko: "" }]).map((c) => c.ko), ["Mythos 5.2", "Haiku 5.5"]);
});
