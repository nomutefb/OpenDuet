import assert from "node:assert/strict";
import test from "node:test";
import { acctOrder, acctTag, leftKo, payEndAt, staleObs, weekCell, weekPace } from "../data/acct-time.ts";

test("같은 관측을 다음 날 그려도 평균·바닥 때가 그대로(모루 11-07 17:36)", () => {
  const reset = Date.parse("2026-11-12T19:00:00+09:00"), obs = Date.parse("2026-11-06T19:00:00+09:00");   // 주 시작 하루째에 잰 50%
  const a = weekPace(50, reset, obs)!, b = weekPace(50, reset, obs)!;
  assert.equal(a.perDay, 50);
  assert.deepEqual(a, b);   // 셈은 잰 때(obs)만 봄 · 그리는 때(now)는 안 들어감
  assert.equal(a.outAt, obs + 1 * 24 * 3_600_000);
  const nextDay = obs + 24 * 3_600_000;
  assert.equal(staleObs(obs, nextDay), true);   // 하루 지난 값 = 화면이 평균을 숨김
  assert.equal(staleObs(obs, obs + 10 * 60_000), false);
  assert.equal(staleObs(undefined, obs), true);
});

const H = 3_600_000, D = 24 * H;
const now = Date.parse("2026-11-07T17:20:00+09:00");

test("leftKo = 「2일 03시간」 꼴", () => {
  assert.equal(leftKo(now + 2 * D + 3 * H + 10 * 60_000, now), "2일 03시간");
  assert.equal(leftKo(now + 5 * H + 20 * 60_000, now), "5시간 20분");
  assert.equal(leftKo(now + 12 * 60_000, now), "12분");
  assert.equal(leftKo(now - 1, now), "");
  assert.equal(leftKo(undefined, now), "");
});

test("payEndAt = 그날 00:00 한국 시각", () => {
  assert.equal(payEndAt("2026-11-10"), Date.parse("2026-11-10T00:00:00+09:00"));
  assert.equal(payEndAt("11-10"), undefined);
});

test("weekPace = 이번 주 쓴 % ÷ 지난 날 · 바닥나는 때", () => {
  // naver 실물(11-07 17:2x): 7일 95% 남음 · 다시 참 11-12 19:00 → 주 시작 11-05 19:00 · 이틀 쯤 지남
  const reset = Date.parse("2026-11-12T19:00:00+09:00");
  const p = weekPace(95, reset, now)!;
  assert.ok(p.perDay >= 2.4 && p.perDay <= 2.7, String(p.perDay));   // 5% ÷ 1.93일 ≈ 2.6
  assert.equal(p.outAt, undefined);
  assert.ok(p.atReset > 80);
  // m 실물: 7일 5% 남음 · 다시 참 11-09 22:59 → 주 시작 11-02 22:59 · 바닥이 다시 참보다 먼저
  const r2 = Date.parse("2026-11-09T22:59:00+09:00");
  const q = weekPace(5, r2, now)!;
  assert.ok(q.perDay > 15, String(q.perDay));   // 95% ÷ 4.77일 ≈ 19.9
  assert.ok(q.outAt !== undefined && q.outAt < r2);
  assert.equal(q.atReset, 0);
  assert.equal(weekPace(undefined, reset, now), null);
  assert.equal(weekPace(50, now - 1, now), null);
});

test("weekCell = 7일·주간 칸", () => {
  assert.deepEqual(weekCell({ "5시간": { left_pct: 100 }, "7일": { left_pct: 95, reset_at: 1 } }), { left_pct: 95, reset_at: 1 });
  assert.equal(weekCell({ "5시간": { left_pct: 1 } }), undefined);
});

test("acctOrder = 결제 끝난 계정만 맨 아래 · 나머지는 서버 차례 그대로(형 11-18 「muteno가 제일 아래로 빠지게해」)", () => {
  const now = Date.parse("2026-11-18T18:41:00+09:00");
  const rows = [{ key: "muteno", pay_end: "2026-11-10" }, { key: "naver" }, { key: "m" }, { key: "gpt", pay_end: "2026-12-06" }];
  assert.deepEqual(acctOrder(rows, now).map((r) => r.key), ["naver", "m", "gpt", "muteno"]);
  assert.deepEqual(acctOrder(rows, Date.parse("2026-11-09T00:00:00+09:00")).map((r) => r.key), ["muteno", "naver", "m", "gpt"]);   // 결제 끝 전 = 서버 차례
});

test("acctTag = 클로드 C·N · C·G · C·M · 지피티 GPT · 그 밖은 앞 이름 그대로(형 11-18 18:45)", () => {
  assert.equal(acctTag("naver"), "C·N"); assert.equal(acctTag("ems1130@naver.com"), "C·N"); assert.equal(acctTag("ems1130n"), "C·N");
  assert.equal(acctTag("ems1130g"), "C·G"); assert.equal(acctTag("ems1130g@gmail.com"), "C·G");
  assert.equal(acctTag("ems1130m"), "C·M"); assert.equal(acctTag("ems1130m@gmail.com"), "C·M");
  assert.equal(acctTag("gpt muteno"), "GPT"); assert.equal(acctTag("muteno", "gpt"), "GPT");
  assert.equal(acctTag("muteno"), "C·T"); assert.equal(acctTag("muteno@pm.me"), "C·T"); assert.equal(acctTag("someone@x.kr"), "someone"); assert.equal(acctTag(undefined), "");
  // 그록 = 같은 꼴(형 11-21 05:44 dm-bom 봄 옮김 「그록 이슬 외 는 G 블릿 N 르미는 G 블릿 H」)
  assert.equal(acctTag("그록 이슬 외 5"), "G·N"); assert.equal(acctTag("그록 루미"), "G·H");
});

test("cliNoteItems = 몸 보고 비고를 rclone 줄들로(이름 · 종류 · 계정 또는 도메인)", async () => {
  const { cliNoteItems } = await import("../ui/crew-table-logic.ts");   // 셈 파일로 옮김(화면 파일은 css 를 실어 노드가 못 읽었음 = 이 시험이 건너뛰어졌음)
  assert.deepEqual(cliNoteItems("r2(s3 · abc.r2.cloudflarestorage.com) · gdrive(drive · a@b.kr)"), [{ name: "r2", type: "s3", domain: "abc.r2.cloudflarestorage.com" }, { name: "gdrive", type: "drive", user: "a@b.kr" }]);
  assert.deepEqual(cliNoteItems(""), []);
});

test("diaryCell = 「해당 없음」 칸은 올라온 시각으로 채움 · 시각 없으면 빈 칸(빨간 –) · 서버가 잰 칸은 그대로", async () => {
  const { diaryCell } = await import("../ui/crew-table-logic.ts");
  const na = { st: "unknown" as const, note: "해당 없음 · 창 없는 상주 · 이 단계 없음" }, m = { diary_ms: Date.now() - 60000, handoff_ms: Date.now() - 3600000 };
  assert.equal(diaryCell(na, "d40", m)?.st, "ok"); assert.equal(diaryCell(na, "end", m)?.st, "ok");
  assert.equal(diaryCell(na, "sketch", m), undefined);   // 습작 시각 없음 = 빨간 –
  assert.equal(diaryCell(na, "check", m), na);   // 시각으로 못 채우는 칸 = 그대로
  assert.deepEqual(diaryCell({ st: "miss", note: "원문 파일 없음" }, "raw", m), { st: "miss", note: "원문 파일 없음" });
  assert.equal(diaryCell(undefined, "d40", undefined), undefined);
});
