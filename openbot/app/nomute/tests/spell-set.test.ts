// #-061 설정 「맞춤법 교정(분류용)」 켬/끔(형 11-15 01:13 「부하가 안되면 설정에서 온오프 하는거로」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const g = readFileSync(new URL("../ui/spell-set.tsx", import.meta.url), "utf8"), s = readFileSync(new URL("../ui/yeta-settings.tsx", import.meta.url), "utf8");
test("봄의 정원 묶음 · 그록봇 지침 다음 · 켬/끔 한 번에 · 형만", () => {
  assert.ok(s.indexOf("<SpellSetRow />") > s.indexOf('row("groknote"'));
  assert.match(g, /office<SpellSet>\("spellset", \{ method: "POST", body: JSON\.stringify\(\{ on \}\) \}\)/);
  assert.match(g, /role="switch"/); assert.match(g, /can_edit === false/);
});
