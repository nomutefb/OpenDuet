// 서랍 「봇 현황」 칸 글 = 서버 도표를 읽기만(형 11-14 「누가 쉰다 이런개념이 아니라 도표 느낌으루」)
import test from "node:test";
import assert from "node:assert/strict";
import { agoKo, countOf, fireChips, hmKo, laneTone, openText, sigOf, turnCell } from "../ui/bot-desk-logic.ts";

test("일 차례 칸 = 서버 글과 같은 꼴: 숫자 · 밖 · (괄호) · × · 빈 칸", () => {
  assert.deepEqual(turnCell({ n: 1, rank: 1, busy: false }), { text: "1", tone: "ok", title: "1특기" });
  assert.deepEqual(turnCell({ n: 3, rank: 2, busy: false }), { text: "3", tone: "plain", title: "2특기" });
  assert.deepEqual(turnCell({ n: 5, rank: 0, busy: false }), { text: "5밖", tone: "dim", title: "특기 밖" });
  assert.deepEqual(turnCell({ n: 6, rank: 1, busy: true }), { text: "(6)", tone: "dim", title: "일하는 중이라 뒤" });
  assert.deepEqual(turnCell({ n: 13, rank: 0, busy: true }), { text: "(13밖)", tone: "dim", title: "일하는 중이라 뒤" });
  assert.deepEqual(turnCell({ x: "개발 제외" }), { text: "×", tone: "dim", title: "개발 제외" });
  assert.deepEqual(turnCell(undefined), { text: "–", tone: "dim", title: "" });
});

test("때 글 · 신호 · 색 갈래 · 맨 위 셈", () => {
  const NOW = Date.UTC(2026, 10, 14, 5, 2), MIN = 60e3;
  assert.deepEqual([agoKo(20e3), agoKo(12 * MIN), agoKo(61 * MIN)], ["방금", "12분 전", "1시간 1분 전"]);
  assert.equal(hmKo(NOW), "14:02");
  assert.equal(sigOf({ who: "봄", lane: "ready", state: "", beat_at: NOW - 2 * MIN }, NOW), "대기 2분 전");
  assert.equal(sigOf({ who: "천둥", lane: "rest", state: "", door_at: NOW - 61 * MIN }, NOW), "문 확인 1시간 1분 전");
  assert.equal(sigOf({ who: "결", lane: "rest", state: "" }, NOW), "–");
  assert.deepEqual(["work", "lost", "off", "none", "ready", "rest"].map((l) => laneTone(l as never)), ["ok", "lost", "dim", "dim", "plain", "plain"]);
  assert.deepEqual(countOf([{ who: "a", lane: "ready", state: "" }, { who: "b", lane: "work", state: "" }, { who: "c", lane: "off", state: "" }, { who: "d", lane: "lost", state: "" }, { who: "e", lane: "rest", state: "" }]), { ready: 1, work: 1, rest: 1, lost: 1 });
});

test("불 칩 = 서버 first 칸 그대로 · 밖 · (괄호) · 맡은 일 글", () => {
  const t = { codes: ["M", "D", "Xc", "U"], rows: [], first: { M: { who: "결", rank: 2, busy: false }, D: { who: "카리나", rank: 1 }, Xc: { who: "천둥", rank: 0 }, U: { who: "시아", rank: 1, busy: true } } };
  assert.deepEqual(fireChips(t), [{ code: "M", text: "결", tone: "ok" }, { code: "D", text: "카리나", tone: "ok" }, { code: "Xc", text: "천둥 밖", tone: "dim" }, { code: "U", text: "(시아)", tone: "dim" }]);
  assert.deepEqual(fireChips({ codes: ["M"], rows: [] }), []);
  assert.deepEqual(openText({ who: "뎅", lane: "work", state: "", open: [{ no: "#-027", title: "새 회의 알약" }, { no: "#-030" }] }), ["#-027 새 회의 알약", "#-030"]);
  assert.deepEqual(openText({ who: "봄", lane: "rest", state: "" }), []);
});
