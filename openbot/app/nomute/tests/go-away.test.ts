// 게이지 단추 away = 답이 늦으면 창 먼저 닫고 뒤에서 마무리(ui/go-button.tsx · 형 11-15 「그 창에서 기다릴게 아니라」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
const src = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), "utf8");

test("away = 0.5초 안에 답이 없으면 창 닫기부터 · 됐으면 done · 못 했으면 화면 아래 알림", () => {
  const s = src("ui/go-button.tsx");
  assert.match(s, /SOFT = 500/);
  assert.match(s, /Promise\.race\(\[job\.then\(\(r\) => \(\{ r \}\), \(e: unknown\) => \(\{ e \}\)\), later\(SOFT\)\.then\(\(\) => null\)\]\)/);
  assert.match(s, /away\(\);\s*\n\s*void job\.then\(\(r\) => \{ done\?\.\(r\); \}, \(e: unknown\) => \{[^\n]*flash\(/);
  assert.match(s, /if \("e" in first\) throw first\.e;/);   // 0.5초 안의 실패 = 창 그대로 빨강(쓰던 글 지킴)
});
test("창을 닫는 저장 · 만들기 · 지우기 단추는 away 를 건다", () => {
  for (const [f, n] of [["ui/temp-room.tsx", 5], ["ui/room-routine.tsx", 2], ["ui/sched-add.tsx", 1], ["ui/dm-rule.tsx", 1], ["ui/group-room.tsx", 1], ["ui/room-look.tsx", 1], ["ui/room-photo.tsx", 1], ["ui/ask.tsx", 1]] as [string, number][])
    assert.equal((src(f).match(/ away=\{/g) || []).length, n, f);
});
