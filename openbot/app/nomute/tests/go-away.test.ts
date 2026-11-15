// 게이지 단추 away = 답이 늦으면 창 먼저 닫고 뒤에서 마무리(ui/go-button.tsx · 형 11-15 「그 창에서 기다릴게 아니라」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
const src = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), "utf8");

test("away = 0.5초 안에 답이 없으면 창 닫기부터 · 됐으면 done · 못 했으면 화면 아래 알림", () => {
  const s = src("ui/go-button.tsx");
  assert.match(s, /SOFT = 500/);
  assert.match(s, /Promise\.race\(\[job\.then\(\(r\) => \(\{ r \}\), \(e: unknown\) => \(\{ e \}\)\), later\(SOFT\)\.then\(\(\) => null\)\]\)/);
  assert.match(s, /away\(\);\s*\n\s*void job\.then\(\(r\) => \{ done\?\.\(r\); if \(name\) flash\(`「\$\{name\}」 됐어`, "ok"\); \}, \(e: unknown\) => \{[^\n]*flash\(/);   // 끝나면 알림 한 줄(형 09:00)
  assert.match(s, /if \("e" in first\) throw first\.e;/);   // 0.5초 안의 실패 = 창 그대로 빨강(쓰던 글 지킴)
});
test("창을 닫는 저장 · 만들기 · 지우기 단추는 away 를 건다", () => {
  for (const [f, n] of [["ui/temp-room.tsx", 3], ["ui/room-routine.tsx", 2], ["ui/sched-add.tsx", 1], ["ui/dm-rule.tsx", 1], ["ui/group-room.tsx", 1], ["ui/room-look.tsx", 1], ["ui/room-photo.tsx", 1], ["ui/ask.tsx", 1]] as [string, number][])
    assert.equal((src(f).match(/ away=\{/g) || []).length, n, f);
});

test("되묻는 창 = 아니오 라임(엔터 자리) · 예는 뒤에서(형 11-15 09:00 「아니오에 라임 … 예 누르고 백단에서 진행」)", () => {
  const y = src("ui/ask-yn.tsx");
  assert.match(y, /<button type="button" className="no" autoFocus onClick=\{onNo\}>\{no\}<\/button>\s*\n\s*<GoButton className="yes" go=\{yes\} done=\{done\} away=\{close\}/);
  assert.match(src("ui/go-button.css"), /\.nm-yn > button\.no \{ border-color:var\(--accent, #CFFF40\); background:var\(--accent, #CFFF40\); color:#141414; \}/);
  assert.equal((src("ui/temp-room.tsx").match(/<YesNo onNo=\{onClose\} yes=\{drop\} close=\{onClose\}/g) || []).length, 2);
  assert.match(src("ui/room-menu.tsx"), /<AskYN q="정말 내보내시겠습니까\?"/);
  assert.match(src("ui/save-ask.tsx"), /<button type="button" className="no" autoFocus onClick=\{onKeep\}>아니오<\/button>/);
});
