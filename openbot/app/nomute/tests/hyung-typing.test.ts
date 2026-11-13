// 형 치는 중 · 올리는 중 = 보낸 뒤 60초 안에 칠 때만 2초에 한 번 · 올리는 동안 늘(형 11-13 17:57 · 17:59 · 18:02 「로직에 부하가 없어야해」 · 18:09 · 18:14)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("치는 중 = 보낸 뒤 60초 안 · 2초에 한 번 · 빈 칸 0 · 글자 0 · 올리는 동안 늘", () => {
  const s = readFileSync(new URL("../data/typing.ts", import.meta.url), "utf8");
  const m = /export const typingDue = \(sent: number, typed: number, now: number, text: string\) => ([^;]+);/.exec(s);
  assert.ok(m);
  const due = new Function("sent", "typed", "now", "text", `const TYPE_WINDOW = 60000, TYPE_EVERY = 2000; return ${m![1]};`) as (a: number, b: number, c: number, d: string) => boolean;
  const t = 1_800_000_000_000;
  assert.equal(due(t - 1000, 0, t, "그리고"), true);
  assert.equal(due(t - 1000, t - 500, t, "그리고"), false, "2초 안 = 안 보냄");
  assert.equal(due(t - 30000, 0, t, "그리고"), true, "30초 = 아직 60초 창 안");
  assert.equal(due(t - 61000, 0, t, "그리고"), false, "60초 넘음 = 서버가 이미 넘김");
  assert.equal(due(0, 0, t, "평소 타자"), false, "안 보낸 방 = 0");
  assert.equal(due(t - 1000, 0, t, "  "), false, "빈 칸 = 0");
  assert.match(s, /office\(`rooms\/\$\{encodeURIComponent\(room\)\}\/typing`, \{ method: "POST", body: "\{\}" \}\)/, "몸 = 빈 것(글자 0)");
  const oc = readFileSync(new URL("../ui/office-chat.tsx", import.meta.url), "utf8"), at = readFileSync(new URL("../data/attachment-state.ts", import.meta.url), "utf8");
  assert.match(oc, /typingPing\(room, t\);/);
  assert.match(oc, /markSent\(room\);/);
  assert.match(at, /const stopPing = uploadingPing\(attempt\.room\);/);
  assert.match(at, /\} finally \{ stopPing\(\); \}/);
});
