// 8천 자 넘는 입력 = 막지 않고 .md 파일로 붙여 보냄(형 11-20 03:41 dm-gik 「이거 8천자 넘으면 알아서 md로 되서 들어가거나 하게해줘」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { LONG_MAX, longText } from "../ui/long-text";

test("글 = 첫 줄(부름 표지 그대로) + 몇 자 · 파일 = 통째 .md", async () => {
  const raw = `@깃 긴 설명 시작\n${"가".repeat(9000)}`;
  const l = longText(raw, new Date(2026, 10, 20, 3, 41, 7));
  assert.equal(l.name, "긴글-1120-034107.md");
  assert.ok(l.body.startsWith("@깃 긴 설명 시작\n"));
  assert.ok(l.body.endsWith(`(긴 글 ${raw.length.toLocaleString("en-US")}자 → 파일 긴글-1120-034107.md)`));
  assert.ok(l.body.length < 300);
  assert.equal(l.file.name, l.name);
  assert.equal(l.file.type, "text/markdown");
  assert.equal(await l.file.text(), raw);
});

test("첫 줄이 길면 200자 + …", () => {
  const l = longText(`\n\n${"a".repeat(LONG_MAX + 1)}`);
  assert.ok(l.body.startsWith(`${"a".repeat(200)}…\n`));
});

test("입력칸 = 막던 줄 없음 · 긴 글이면 첨부 길로", () => {
  const s = readFileSync(new URL("../ui/office-chat.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(s, /8,000자 넘음 — 나눠서 보내 줘/);
  assert.match(s, /const long = raw\.length \+ re\.length > LONG_MAX \? longText\(raw\) : null;/);
  assert.match(s, /if \(attached\.length \|\| long\) \{/);
  assert.match(s, /if \(long\) originals\.push\(\{ id: long\.id, file: long\.file \}\);/);
});
