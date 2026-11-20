// 대화 목록 미리보기 — 마지막이 「메시지 보냄」 표시면 그 앞 진짜 대화(형 11-20 13:42 「그리고 최근 대화가 이렇게 끝났을경우, 대화가 첨부2처럼 비어버리는데, 내 대화로 최근 대화가 나와있어야돼. 확인해줭」)
import assert from "node:assert/strict";
import test from "node:test";
import { blankLast, talkPreview } from "../ui/room-preview";

test("빈 미리보기 = 「메시지 보냄」(kind sent) · 글 0", () => {
  assert.equal(blankLast({ kind: "sent", text: "" }), true);
  assert.equal(blankLast({ kind: "human", text: "  " }), true);
  assert.equal(blankLast({ kind: "human", text: "고마워" }), false);
  assert.equal(blankLast(null), false);
});

test("그 앞 진짜 대화 = 끝에서부터 sent 건너뜀 · 글 없으면 사진 · 파일", () => {
  assert.equal(talkPreview([{ kind: "bot", text: "앞 글" }, { kind: "human", text: "**형 글**\n둘째 줄" }, { kind: "sent", text: "" }, { kind: "sent", text: "" }]), "형 글 둘째 줄");
  assert.equal(talkPreview([{ kind: "human", text: "", files: ["a/b/20261120_x.jpg"] }, { kind: "sent" }]), "사진");
  assert.equal(talkPreview([{ kind: "human", text: "", files: ["a/b/doc.pdf"] }]), "파일");
  assert.equal(talkPreview([{ kind: "sent" }]), "");
});
