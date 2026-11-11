import assert from "node:assert/strict";
import test from "node:test";
import { DONE_SHOW, ENC_T0, STT_HOLD, doneShown, encOk, encQuiet, encWanted, gaugeOf, kindOf, nextAsk } from "../ui/enc-logic.ts";

// 미디어 게이지(형 11-11 08:14 「영상 00% / 파동 00% / 자막 00% / 다 공유되먼 완료」 · 「사진이면 사진」) — 서버 encstate 답 → 화면 줄
const T = ENC_T0 + 3600e3, D = "claude/light/office_files/";
const V = D + "20261111_0900_고양이.mp4", W = D + "20261111_0900_고양이.파형.png", P = D + "20261111_0900_사진.jpg", P2 = D + "20261111_0900_사진2.png";
const labels = (g: ReturnType<typeof gaugeOf>) => g?.lines.map((l) => (l.fail ? `${l.label} 멈춤` : `${l.label} ${l.pct}%`));

test("물을 경로 = 자리 사본의 영상 · 사진 · 파형 그림만 · 옛 글은 0", () => {
  assert.deepEqual(encWanted([V, W, D + "메모.pdf", "office/x.png", V], T), [V, W]);
  assert.deepEqual(encWanted([V], ENC_T0 - 1), []);
  assert.equal(kindOf(W), "wave");
  assert.equal(kindOf(P), "photo");
  assert.equal(kindOf(D + "a.m4a"), "");
});

test("영상 글 = 영상 · 파동 · 자막 세 줄 → 다 닿으면 완료", () => {
  const now = T + 5000;
  let g = gaugeOf([V, W], { [V]: { stage: "wait", pct: null, at: T }, [W]: { ready: true, stage: "done", pct: 100, at: T } }, now);
  assert.deepEqual(labels(g), ["영상 0%", "파동 100%", "자막 0%"], "자막 기록이 없어도 파형이 있으면 0% 로 먼저");
  assert.equal(g?.done, false);
  g = gaugeOf([V, W], { [V]: { stage: "enc", pct: 42, at: T }, [W]: { ready: true, stage: "done", at: T } }, now);
  assert.deepEqual(labels(g), ["영상 42%", "파동 100%", "자막 0%"]);
  g = gaugeOf([V, W], { [V]: { ready: true, stage: "done", pct: 100, at: T, parts: { stt: { stage: "run", pct: 30.6, at: T } } }, [W]: { ready: true, stage: "done", at: T } }, now);
  assert.deepEqual(labels(g), ["영상 100%", "파동 100%", "자막 31%"]);
  assert.equal(g?.done, false);
  g = gaugeOf([V, W], { [V]: { ready: true, stage: "done", at: T, parts: { stt: { ready: true, stage: "done", pct: 100, at: T + 9 } } }, [W]: { ready: true, stage: "done", at: T } }, now);
  assert.equal(g?.done, true);
  assert.equal(g?.at, T + 9);
});

test("가는 중 % 는 99 까지만(100 = 닿은 뒤에만)", () => {
  const g = gaugeOf([V], { [V]: { stage: "push", pct: 100, at: T } }, T);
  assert.deepEqual(labels(g), ["영상 99%"]);
});

test("소리 없는 영상(파형 · 자막 기록 없음) = 영상 한 줄", () => {
  const g = gaugeOf([V], { [V]: { ready: true, stage: "done", at: T } }, T + 1000);
  assert.deepEqual(labels(g), ["영상 100%"]);
  assert.equal(g?.done, true);
});

test("자막 기록이 끝내 안 서면 줄을 빼고 완료로(영상이 읽힌 뒤 STT_HOLD)", () => {
  const items = { [V]: { ready: true, stage: "done", at: T }, [W]: { ready: true, stage: "done", at: T } };
  assert.equal(gaugeOf([V, W], items, T + STT_HOLD - 1)?.done, false);
  const g = gaugeOf([V, W], items, T + STT_HOLD + 1);
  assert.deepEqual(labels(g), ["영상 100%", "파동 100%"]);
  assert.equal(g?.done, true);
});

test("사진이면 사진 한 줄 · 여러 장 = 평균 · 다 닿아야 완료", () => {
  let g = gaugeOf([P, P2], { [P]: { ready: true, stage: "done", at: T }, [P2]: { stage: "enc", pct: 50, at: T } }, T);
  assert.deepEqual(labels(g), ["사진 75%"]);
  assert.equal(g?.done, false);
  g = gaugeOf([P], { [P]: { ready: true, stage: "done", at: T } }, T);
  assert.equal(g?.done, true);
});

test("기록 없음(none · 옛 글) = 안 그림 · 멈춤 = 줄에 「멈춤」 + 까닭", () => {
  assert.equal(gaugeOf([P], { [P]: { ready: false, stage: "none", pct: null, at: 0 } }, T), null);
  assert.equal(gaugeOf([P], {}, T), null);
  const g = gaugeOf([V], { [V]: { ready: false, stage: "fail", pct: null, at: T, why: "러너가 30분째 안 돌았어" } }, T);
  assert.deepEqual(labels(g), ["영상 멈춤"]);
  assert.equal(g?.lines[0].why, "러너가 30분째 안 돌았어");
  assert.equal(g?.done, false);
});

test("「완료」 글 = 가는 걸 본 글이거나 갓 끝난 글만 · 테두리는 닿았으면 늘", () => {
  const g = gaugeOf([P], { [P]: { ready: true, stage: "done", at: T } }, T)!;
  assert.equal(doneShown(g, false, T + DONE_SHOW - 1), true);
  assert.equal(doneShown(g, false, T + DONE_SHOW + 1), false);
  assert.equal(doneShown(g, true, T + DONE_SHOW + 1), true);
  assert.equal(encOk({ ready: true }), true);
  assert.equal(encOk({ stage: "enc" }), false);
  assert.equal(encOk(undefined), false);
});

test("다시 묻기 = 가는 중 3초 · 멈춤 30초 · 다 되면 끝 · 영상은 자막까지", () => {
  const now = T + 10_000;
  assert.equal(nextAsk(undefined, "video", T, now), 1);
  assert.equal(nextAsk({ stage: "enc", pct: 3, at: T }, "video", T, now), 3000);
  assert.equal(nextAsk({ stage: "fail", at: T }, "video", T, now), 30_000);
  assert.equal(nextAsk({ stage: "fail", at: T }, "video", T, T + 7 * 3600e3), 0);
  assert.equal(nextAsk({ ready: true, stage: "done", at: T }, "photo", T, now), 0);
  assert.equal(nextAsk({ stage: "none" }, "photo", T, now), 5000, "갓 보낸 글은 기록이 늦게 설 수 있음");
  assert.equal(nextAsk({ stage: "none" }, "photo", T, T + 121e3), 0);
  assert.equal(nextAsk({ ready: true, stage: "done", at: T }, "video", T, now), 5000, "자막 줄 서는 사이");
  assert.equal(nextAsk({ ready: true, stage: "done", at: T }, "video", T, T + STT_HOLD + 1), 0);
  assert.equal(nextAsk({ ready: true, stage: "done", at: T, parts: { stt: { stage: "run", pct: 10, at: T } } }, "video", T, T + STT_HOLD + 1), 3000);
  assert.equal(nextAsk({ ready: true, stage: "done", at: T, parts: { stt: { ready: true, stage: "done", at: T } } }, "video", T, now), 0);
});

test("움직임 자세히 = 넷째 칸 프레임(셋째 자리 · 켠 영상만)", () => {
  const V = "claude/eyes/office_files/20261112_0720_a.mp4", W = "claude/eyes/office_files/20261112_0720_a.mp4.파형.png", T = Date.UTC(2026, 10, 11, 22, 20);
  const g = gaugeOf([V, W], { [V]: { stage: "run", pct: 40, at: T, parts: { frames: { stage: "wait", pct: 0, at: T }, stt: { stage: "wait", pct: 0, at: T } } }, [W]: { ready: true, stage: "done", at: T } }, T + 1000);
  assert.deepEqual(g?.lines.map((l) => `${l.label} ${l.pct}`), ["영상 40", "파동 100", "프레임 0", "자막 0"]);
  const g2 = gaugeOf([V], { [V]: { stage: "run", pct: 40, at: T } }, T + 1000);
  assert.deepEqual(g2?.lines.map((l) => l.label), ["영상"], "안 켠 영상 = 프레임 칸 없음");
  assert.equal(nextAsk({ ready: true, stage: "done", at: T, parts: { frames: { stage: "run", pct: 50, at: T } } }, "video", T, T + 1000), 3000);
});

test("형 1:1 에서 봇이 보낸 첨부만 게이지 · 테두리 0(형 11-12 07:44 「무조건 나랑 1대1대화일대만」)", () => {
  assert.equal(encQuiet("dm-chok", "bot"), true);
  assert.equal(encQuiet("dm-gik", "being"), true);
  assert.equal(encQuiet("dm-chok", "human"), false);   // 형 → 봇 = 그대로
  assert.equal(encQuiet("dm-chok", "system", "형"), false);   // 형이 앱에서 친 거울 글 = 형 글
  assert.equal(encQuiet("pair-bom-gik", "being"), false);   // 봇끼리 = 그대로
  assert.equal(encQuiet("tmp-mw8seuv1", "bot"), false);   // 단톡 = 그대로
  assert.equal(encQuiet("dm-hyung", "bot"), false);
});
