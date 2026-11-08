import assert from "node:assert/strict";
import { test } from "node:test";
import { AV_MIN, type AvAct, type AvEvent, type AvState, avInit, avStep } from "../ui/auto-video.ts";

// 영상 자동 재생 결정(모루 11-09 05:33 · #2999 회귀 · 「사용자 정지 vs 화면 밖 자동 정지 가르기 + 100%→90% · 49%→복귀 시험」)
const run = (evs: AvEvent[], s0: AvState = avInit()): { s: AvState; acts: AvAct[] } => {
  let s = s0; const acts: AvAct[] = [];
  for (const e of evs) { const r = avStep(s, e); s = r.s; acts.push(r.act); }
  return { s, acts };
};

test("보이면 돎 · 화면 밖(49%)이면 우리가 멈춤 · 돌아오면 다시 돎", () => {
  const { acts } = run([{ t: "ratio", r: 1 }, { t: "play" }, { t: "ratio", r: 0.49 }, { t: "pause", byUs: true }, { t: "ratio", r: 0.6 }]);
  assert.deepEqual(acts, ["play", null, "pause", null, "play"]);
});

test("사용자가 멈춘 영상은 100%→90% 스크롤에도 안 돎(앞 판 회귀)", () => {
  const { s, acts } = run([{ t: "ratio", r: 1 }, { t: "play" }, { t: "pause", byUs: false }, { t: "ratio", r: 0.9 }, { t: "ratio", r: 1 }]);
  assert.deepEqual(acts, ["play", null, null, null, null]);
  assert.equal(s.userPaused, true);
});

test("사용자가 멈춘 뒤 화면 밖 → 복귀해도 안 돎 · 사용자가 다시 누르면 자동 재생 다시 삶", () => {
  const a = run([{ t: "ratio", r: 1 }, { t: "play" }, { t: "pause", byUs: false }, { t: "ratio", r: 0.1 }, { t: "ratio", r: 0.8 }]);
  assert.deepEqual(a.acts, ["play", null, null, null, null]);
  const b = run([{ t: "play" }, { t: "ratio", r: 0.2 }, { t: "pause", byUs: true }, { t: "ratio", r: 0.9 }], a.s);
  assert.deepEqual(b.acts, [null, "pause", null, "play"]);
  assert.equal(b.s.userPaused, false);
});

test("사용자가 화면 밖에서 눌러 돌린 건 그 자리에서 안 되돌림 · 더 나가면 우리가 멈춤", () => {
  const { acts } = run([{ t: "ratio", r: 0.3 }, { t: "play" }, { t: "ratio", r: 0.1 }]);
  assert.deepEqual(acts, [null, null, "pause"]);
});

test("탭 숨김이면 멈춤 · 돌아오면 보이는 것만 다시 돎", () => {
  const a = run([{ t: "ratio", r: 1 }, { t: "play" }, { t: "hidden", v: true }, { t: "pause", byUs: true }, { t: "hidden", v: false }]);
  assert.deepEqual(a.acts, ["play", null, "pause", null, "play"]);
  const b = run([{ t: "ratio", r: 0.2 }, { t: "hidden", v: true }, { t: "hidden", v: false }]);
  assert.deepEqual(b.acts, [null, null, null]);
});

test("「움직임 줄이기」 = 처음부터면 안 돎 · 도중 켜지면 멈춤 · 꺼지면 다시 돎", () => {
  const a = run([{ t: "ratio", r: 1 }], avInit(true));
  assert.deepEqual(a.acts, [null]);
  const b = run([{ t: "ratio", r: 1 }, { t: "play" }, { t: "reduce", v: true }, { t: "pause", byUs: true }, { t: "ratio", r: 0.9 }, { t: "reduce", v: false }]);
  assert.deepEqual(b.acts, ["play", null, "pause", null, null, "play"]);
});

test("문턱 = 0.5 하나 · 같은 쪽 알림이 거듭 와도 할 일 없음", () => {
  assert.equal(AV_MIN, 0.5);
  const { acts } = run([{ t: "ratio", r: 0.5 }, { t: "play" }, { t: "ratio", r: 0.7 }, { t: "ratio", r: 1 }, { t: "ratio", r: 0.51 }]);
  assert.deepEqual(acts, ["play", null, null, null, null]);
});
