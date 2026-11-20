// 1특기 방 「대기열」 알약(형 11-20 11:33 「그리고, 내가 뉴스 요약 부르면 지금 너 대기열 보이는것처럼, 1특기가 영상 제작이랑 뉴스수집으로 애들한테는 대기열이 목록이 보이게 해줘. (1특기가 영상제작)」 · 시아 12:44)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { makeRows, queueKindOf } from "../ui/queue-pill";

const ROOMS = [{ id: "dm-issueking", kind: "dm", with: "슈왕" }, { id: "dm-eyes", kind: "dm", with: "뜸" }, { id: "dm-bom", kind: "dm", with: "봄" }, { id: "all", kind: "group", name: "회의실" }];
test("방 → 갈래 = 슈왕 1:1 = 요약 · 뜸 1:1 = 제작 · 그 밖 = 없음", () => {
  assert.equal(queueKindOf("dm-issueking", ROOMS), "sum");
  assert.equal(queueKindOf("dm-eyes", ROOMS), "make");
  assert.equal(queueKindOf("dm-bom", ROOMS), null);
  assert.equal(queueKindOf("all", ROOMS), null);
  assert.equal(queueKindOf("dm-eyes", undefined), null);   // 방 목록 오기 전 = 안 그림
});

test("제작 줄 = 하루 안 · 새것 위 · 이름 = 서버 lbl 또는 갈래 이름", () => {
  const now = 1795146000000;
  const rows = makeRows([{ id: "a", kind: "edit", t0: now - 5 * 60e3 }, { id: "b", kind: "thumb", t0: now - 60e3, lbl: "카드 · 유재석" }, { id: "c", kind: "vd", t0: now - 2 * 86400e3 }, { kind: "x" }], now);
  assert.deepEqual(rows.map((r) => [r.id, r.name]), [["b", "카드 · 유재석"], ["a", "영상 편집"]]);
});

test("자리 · 꼴 = 러너맵 알약과 같음 · 요약 판은 누를 때만 받음 · 대화 머리줄에 꽂힘", () => {
  const src = readFileSync(new URL("../ui/queue-pill.tsx", import.meta.url), "utf8"), head = readFileSync(new URL("../ui/chat-head.tsx", import.meta.url), "utf8");
  assert.match(src, /const SumQueue = lazy\(\(\) => import\("\.\/queue-sum"\)\);/);
  assert.match(src, /import "\.\/pm-runner-mini\.css";/);
  assert.match(src, /aria-label="대기열"/);
  assert.match(head, /<QueuePill room=\{room\} \/>/);
});
