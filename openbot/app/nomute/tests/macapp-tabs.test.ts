// 맥 독 앱 안 = 웹 탭 줄 걷음 · 단추 셋만(형 11-16 08:2x 「아래에 탭을 없앤다는뜻이엿음」 · 봄 08:26)
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
test("맥 앱 = 웹 탭 줄 통째 숨김 · 늘 정원 판 · 제목 줄 판은 걷음(형 08:2x 「지금은 없어도돼」)", () => {
  const tb = readFileSync(new URL("../ui/tab-bar.css", import.meta.url), "utf8");
  assert.match(tb, /html\.nm-macapp \.nm-tabs \{ display:none; \}/);
  const tsx = readFileSync(new URL("../ui/tab-bar.tsx", import.meta.url), "utf8");
  assert.match(tsx, /classList\.contains\("nm-macapp"\)\) setS\(\(x\) => \(x\.active === "dash" \? x : \{ \.\.\.x, active: "dash" \}\)\)/);
  assert.equal(existsSync(new URL("../ui/title-bar.ts", import.meta.url)), false);
  const m = JSON.parse(readFileSync(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));
  assert.equal(m.display_override, undefined, "윈도우 PWA = 앞 꼴(봄 08:26 「손 0」)");
});
