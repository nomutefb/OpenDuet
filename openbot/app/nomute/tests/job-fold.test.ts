// 작업 알림 접힌 카드 · 리모콘 목록 셈(ui/job-fold-logic.ts · 깃 #-019 · 뎅)
import { test } from "node:test";
import assert from "node:assert/strict";
import { jobBoard, jobOf } from "../ui/job-fold-logic.ts";

const recv = { who: "기차봇", ts: 1, id: "a", text: "📥 접수 · #-019 PM 방 안 작업 알림 접힌 카드 · 시아" };
const done = { who: "기차봇", ts: 2, id: "b", text: "✅ 완료\n\n[11-14(토) 11:35PM]\n\n**#-008 PM 방 오른쪽 위에 애들 러너맵 축소판**\n\n• 뎅 (클로드) · 11:33PM → 11:35PM (약 2분)\n\n#3763" };

test("기차봇 접수 · 완료 글을 알아봄 · 번호 · 제목 · 누가", () => {
  assert.deepEqual([jobOf(recv)?.kind, jobOf(recv)?.no], ["recv", "#-019"]);
  const j = jobOf(done)!;
  assert.equal(j.no, "#-008"); assert.equal(j.title, "PM 방 오른쪽 위에 애들 러너맵 축소판"); assert.equal(j.by, "뎅 · 2분");
});
test("서버 relay.event 가 먼저 · 다른 화자의 ✅ 글은 아님", () => {
  assert.equal(jobOf({ who: "x", relay: { event: "job_done" }, text: "**#-1 a**" })?.kind, "done");
  assert.equal(jobOf({ who: "뎅", text: "✅ 완료" }), null);
});
test("목록 = 번호마다 하나 · 완료 뒤 접수가 와도 완료", () => {
  const b = jobBoard([recv, done, { ...recv, id: "c", ts: 3, text: "📥 접수 · #-008 x" }]);
  assert.equal(b.find((j) => j.no === "#-008")?.kind, "done");
  assert.equal(b.length, 2);
});
