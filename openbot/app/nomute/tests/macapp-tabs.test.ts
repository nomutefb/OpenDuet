// 맥 독 앱 안 탭 줄 = 늘 보임(형 11-16 12:3x 「상단에 탭 메뉴, 그리고 그 아래 메뉴는 계속 보이게 해줘」 · 「인앱에서는 사라져」 · 앞 판 숨김 걷음)
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
test("맥 앱 = 탭 줄 숨김 · 정원 판 고정 둘 다 없음 · 제목 줄 판도 없음", () => {
  const tb = readFileSync(new URL("../ui/tab-bar.css", import.meta.url), "utf8");
  assert.doesNotMatch(tb, /html\.nm-macapp \.nm-tabs \{ display:none; \}/);
  const tsx = readFileSync(new URL("../ui/tab-bar.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(tsx, /classList\.contains\("nm-macapp"\)/);
  assert.equal(existsSync(new URL("../ui/title-bar.ts", import.meta.url)), false);
});
