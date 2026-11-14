// 서랍 「봇 현황」 칸 글 = 서버 도표를 읽기만(형 11-14 「누가 쉰다 이런개념이 아니라 도표 느낌으루」)
import test from "node:test";
import assert from "node:assert/strict";
import { agoKo, countOf, fireChips, flowOf, groupOf, hmKo, laneTone, markOf, openText, sigOf, turnCell, turnList, wireTone } from "../ui/bot-desk-logic.ts";

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

test("흐름 묶음 = 멈춤 · 일하는 중 · 노는 손 · 차례 밖 · 조용 · 맡은 일이 있으면 쉬어 보여도 일하는 중 쪽", () => {
  const rows = [
    { who: "봄", lane: "ready", state: "", rest: true }, { who: "깃", lane: "work", state: "", pm: true }, { who: "시아", lane: "work", state: "" },
    { who: "뜸", lane: "ready", state: "", open: [{ no: "#-025" }] }, { who: "빠르", lane: "lost", state: "", open: [{ no: "#-032" }] },
    { who: "카리나", lane: "ready", state: "" }, { who: "결", lane: "rest", state: "" }, { who: "누리", lane: "off", state: "" },
  ] as never[];
  assert.deepEqual(rows.map((r) => groupOf(r)), ["held", "held", "work", "work", "lost", "idle", "idle", "quiet"]);
  assert.deepEqual(flowOf(rows).map((g) => [g.group, g.rows.map((r) => r.who)]), [["lost", ["빠르"]], ["work", ["시아", "뜸"]], ["idle", ["카리나", "결"]], ["held", ["봄", "깃"]], ["quiet", ["누리"]]]);
  assert.deepEqual(["lost", "work", "idle", "held", "quiet"].map((g) => wireTone(g as never)), ["lost", "ok", "dim", "dim", "dim"]);
});

test("분류 하나의 차례 줄 = 서버 turn 칸 차례대로 · 못 맡는 손은 따로", () => {
  const rows = [
    { who: "빠르", lane: "work", state: "", turn: { D: { n: 3, rank: 1, busy: true } } }, { who: "카리나", lane: "ready", state: "", turn: { D: { n: 1, rank: 1 } } },
    { who: "봄", lane: "ready", state: "", turn: { D: { x: "쉼 지정" } } }, { who: "천둥", lane: "rest", state: "", turn: { D: { n: 2, rank: 2 } } }, { who: "결", lane: "rest", state: "" },
  ] as never[];
  assert.deepEqual(turnList(rows, "D"), { order: [{ who: "카리나", n: 1, rank: 1, busy: false }, { who: "천둥", n: 2, rank: 2, busy: false }, { who: "빠르", n: 3, rank: 1, busy: true }], out: [{ who: "봄", why: "쉼 지정" }] });
  assert.deepEqual(turnList(rows, "U"), { order: [], out: [] });
});

test("상태 표시 꼴 = 일하는 중 running · 받을 수 있음 done · 쉼 pending · 멈춤 failed · 차례 밖 · 조용 cancelled", () => {
  const m = (x: object) => markOf({ who: "a", state: "", ...x } as never);
  assert.deepEqual([m({ lane: "work" }), m({ lane: "ready" }), m({ lane: "rest" }), m({ lane: "lost" }), m({ lane: "ready", rest: true }), m({ lane: "work", pm: true }), m({ lane: "off" })], ["running", "done", "pending", "failed", "cancelled", "cancelled", "cancelled"]);
});
