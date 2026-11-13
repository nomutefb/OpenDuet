import { test } from "node:test";
import assert from "node:assert/strict";
import { askPickOf } from "../ui/ask-pick-logic.ts";

test("촉 방 · 주소 있는 글 = 단추 · 글 통째 + 주소(형 11-13 02:45)", () => {
  const r = askPickOf("dm-chok", { text: "형, 젠슨 황이 물러났어.\n\nhttps://news.nate.com/view/20261112n38840" });
  assert.deepEqual(r, { text: "형, 젠슨 황이 물러났어.\n\nhttps://news.nate.com/view/20261112n38840", url: "https://news.nate.com/view/20261112n38840" });
});
test("러너 「[촉]」 글 = 주소 없어도 단추(러너가 자료 찾음 · 형 02:46)", () => {
  assert.deepEqual(askPickOf("dm-chok", { text: "[촉] 속보 엔비디아 칩 밀반입" }), { text: "[촉] 속보 엔비디아 칩 밀반입", url: "" });
  assert.deepEqual(askPickOf("dm-chok", { text: "**[촉보] 엔비디아 칩 밀반입**" }), { text: "**[촉보] 엔비디아 칩 밀반입**", url: "" });
});
test("안 다는 글 = 다른 방 · 첨부 · 잡담", () => {
  assert.equal(askPickOf("dm-teum", { text: "https://a.com/x" }), null);
  assert.equal(askPickOf("dm-chok", { text: "https://a.com/x", files: ["a.png"] }), null);
  assert.equal(askPickOf("dm-chok", { text: "응 알았어 형" }), null);
});
