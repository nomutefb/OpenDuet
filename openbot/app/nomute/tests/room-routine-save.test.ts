import assert from "node:assert/strict";
import { test } from "node:test";
import { saveRoomRoutine, type RoomRoutineForm } from "../ui/room-routine-save.ts";

// 기차에서도 빌더·DOM 설치 없이 실제 저장 함수를 읽는다.
// 화면의 게이지·체크·닫힘은 이 단위 검사의 범위 밖이다.
const formOf = (more: Partial<RoomRoutineForm> = {}): RoomRoutineForm => ({
  mode: "days", every: 3, min: 15, days: 2, times: ["09:00", "18:00"],
  wd: [1, 3, 5], text: "  저장 실패 뒤에도 남길 글  ", on: true, ...more,
});

test("응답을 기다릴 때 잠그고 성공 뒤에도 체크가 끝나 닫힐 때까지 유지한다", async () => {
  const locks: boolean[] = [];
  const response = { ok: true };
  let finish!: (value: typeof response) => void;
  const pending = saveRoomRoutine(formOf(), [], () => {
    assert.deepEqual(locks, [true], "요청을 보내기 전에 입력이 잠겨야 한다");
    return new Promise((resolve) => { finish = resolve; });
  }, (value) => locks.push(value));
  await Promise.resolve();
  assert.deepEqual(locks, [true], "아직 응답이 없을 때 잠금을 풀지 않는다");
  finish(response);
  assert.equal(await pending, response);
  assert.deepEqual(locks, [true], "응답 성공이 체크 종료보다 먼저 잠금을 풀면 안 된다");
});

for (const [mode, cycle] of [
  ["hours", { every: 3, min: 15 }],
  ["days", { days: 2, times: ["09:00", "18:00"] }],
  ["week", { wd: [1, 3, 5], times: ["09:00", "18:00"] }],
] as const) {
  test(`${mode} 저장은 고른 주기·제외 명단·켜짐만 보내고 원래 입력을 보존한다`, async () => {
    const form = formOf({ mode, on: false }), skip = ["검사 멤버"];
    const before = structuredClone({ form, skip });
    const sent: Record<string, unknown>[] = [];
    await saveRoomRoutine(form, skip, async (body) => { sent.push(body); }, () => {});
    assert.deepEqual(sent, [{ mode, ...cycle, text: "저장 실패 뒤에도 남길 글", skip, on: false }]);
    assert.deepEqual({ form, skip }, before, "화면의 글과 선택을 저장 함수가 바꾸지 않는다");
  });
}

test("저장 거절은 잠금을 풀고 같은 오류를 넘기며 입력을 보존한다", async () => {
  const form = formOf({ mode: "hours" }), skip = ["검사 멤버"];
  const before = structuredClone({ form, skip });
  const locks: boolean[] = [], error = new Error("검사용 저장 거절");
  let reject!: (reason: unknown) => void;
  const pending = saveRoomRoutine(form, skip, () => new Promise((_resolve, fail) => {
    reject = fail;
  }), (value) => locks.push(value));
  const rejected = assert.rejects(pending, (actual) => actual === error);
  assert.deepEqual(locks, [true]);
  reject(error);
  await rejected;
  assert.deepEqual(locks, [true, false]);
  assert.deepEqual({ form, skip }, before);
});

test("요청이 즉시 실패해도 잠금을 풀고 오류를 그대로 넘긴다", async () => {
  const locks: boolean[] = [], error = new Error("요청 생성 실패");
  await assert.rejects(saveRoomRoutine(formOf(), [], () => { throw error; },
    (value) => locks.push(value)), (actual) => actual === error);
  assert.deepEqual(locks, [true, false]);
});

test("실패 뒤 수정은 자동 저장하지 않고 다시 누를 때 새 입력을 보낸다", async () => {
  const form = formOf(), locks: boolean[] = [], sent: Record<string, unknown>[] = [];
  const mutate = async (body: Record<string, unknown>) => {
    sent.push(body);
    if (sent.length === 1) throw new Error("첫 저장 거절");
    return { ok: true };
  };
  const saving = (value: boolean) => locks.push(value);
  await assert.rejects(saveRoomRoutine(form, [], mutate, saving), /첫 저장 거절/);
  form.mode = "hours";
  form.every = 6;
  form.text = "다시 고친 글";
  assert.equal(sent.length, 1);
  await saveRoomRoutine(form, [], mutate, saving);
  assert.deepEqual(locks, [true, false, true]);
  assert.deepEqual(sent[1], { mode: "hours", every: 6, min: 15, text: "다시 고친 글", skip: [], on: true });
});
