// 서랍 「봇 현황」 칸 글 = 서버 도표를 읽기만(형 11-14 「누가 쉰다 이런개념이 아니라 도표 느낌으루」)
import test from "node:test";
import assert from "node:assert/strict";
import { agoKo, countOf, fireChips, flowOf, groupOf, hmKo, jobCount, jobLine, jobsOf, laneTone, markOf, mixOf, openText, orbOf, sigOf, tailOf, turnCell, turnList, wireTone } from "../ui/bot-desk-logic.ts";

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

test("오늘 오더 카드 = 끝난 줄 체크(걸린 시간) · 안 끝난 줄은 그 손이 일하는 중이면 도는 고리 · 아니면 점선 · 머리 n/m · 다 끝냄", () => {
  const NOW = Date.UTC(2026, 10, 14, 5, 2), MIN = 60e3;
  assert.deepEqual(jobLine({ no: "#-027", title: "새 회의 알약", recv: NOW - 40 * MIN, done: NOW - 28 * MIN }, true, NOW), { status: "done", text: "#-027 새 회의 알약", side: "12분" });
  assert.deepEqual(jobLine({ no: "#-030", title: "첨부", recv: NOW - 75 * MIN }, true, NOW), { status: "running", text: "#-030 첨부", side: "1시간 15분째" });
  assert.deepEqual(jobLine({ no: "#-031", recv: NOW - 5 * MIN }, false, NOW), { status: "pending", text: "#-031", side: "5분째" });
  assert.deepEqual(jobLine({ no: "#-032", done: NOW }, false, NOW), { status: "done", text: "#-032", side: "끝" });
  assert.deepEqual(jobCount([{ no: "a", done: 1 }, { no: "b" }, { no: "c", done: 2 }]), { done: 2, total: 3, all: false });
  assert.deepEqual(jobCount([{ no: "a", done: 1 }]), { done: 1, total: 1, all: true });
  assert.deepEqual(jobCount([]), { done: 0, total: 0, all: false });
  assert.deepEqual(jobsOf({ who: "뎅", lane: "work", state: "", jobs: [{ no: "#-1" }] }).map((j) => j.no), ["#-1"]);
  assert.deepEqual(jobsOf({ who: "뎅", lane: "work", state: "", open: [{ no: "#-2", title: "옛 서버", at: 9 }] }), [{ no: "#-2", title: "옛 서버", code: undefined, recv: 9 }]);   // 옛 서버(jobs 칸 없음) = open 칸으로
  const o = (x: object) => orbOf({ who: "a", state: "", ...x } as never);
  assert.deepEqual([o({ lane: "work" }), o({ lane: "ready" }), o({ lane: "rest" }), o({ lane: "lost" }), o({ lane: "work", pm: true }), o({ lane: "ready", rest: true })], ["working", "listening", "", "", "", ""]);
});

test("태움 올림 단계 = 안 끝난 오더에 태움 때가 있으면 손을 놓았어도 도는 고리 + 「태움 N분 전」 · 끝낸 오더는 그대로 체크", () => {
  const NOW = Date.UTC(2026, 10, 14, 5, 2), MIN = 60e3;
  assert.deepEqual(jobLine({ no: "#-030", title: "첨부", recv: NOW - 60 * MIN, ride: NOW - 8 * MIN, sha: "650975b" }, false, NOW), { status: "running", text: "#-030 첨부", side: "태움 8분 전", ride: true });
  assert.deepEqual(jobLine({ no: "#-029", recv: NOW - 70 * MIN, done: NOW - 2 * MIN, ride: NOW - 9 * MIN }, true, NOW), { status: "done", text: "#-029", side: "1시간 8분" });
});

test("맨 위 요약 막대 = 묶음마다 몇인지(0 인 묶음 뺌 · 흐름과 같은 차례) · 카드 상태 줄 꼬리 = 손 · 신호 짧게", () => {
  const NOW = 1_000_000_000_000, MIN = 60e3;
  const rows = [{ who: "a", lane: "work", state: "" }, { who: "b", lane: "work", state: "" }, { who: "c", lane: "ready", state: "" }, { who: "d", lane: "lost", state: "" }, { who: "e", lane: "ready", state: "", rest: true }] as never[];
  assert.deepEqual(mixOf(rows), [{ group: "lost", n: 1 }, { group: "work", n: 2 }, { group: "idle", n: 1 }, { group: "held", n: 1 }]);
  assert.deepEqual(mixOf([]), []);
  assert.equal(tailOf({ who: "a", lane: "work", state: "", last_at: NOW - 21 * MIN, beat_at: NOW - 3 * MIN }, NOW), "손 21분 전 · 대기 3분 전");
  assert.equal(tailOf({ who: "a", lane: "work", state: "" }, NOW), "");
});
