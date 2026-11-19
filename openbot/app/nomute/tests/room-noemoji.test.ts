// 형 11-20 07:19~07:21 dm-gik(깃 옮김) — 대화 목록 애들 이모지 0 · 말풍선 이름 알약(라벨)은 그대로 · 메뉴 「봄의 정원」 뺌 · 「대화방」 탭 오른쪽 끝 옅은 「+」
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("목록 이름 뒤 이모지 0 · 말풍선 이름 알약 이모지 그대로", () => {
  const rl = readFileSync(new URL("../ui/room-list.tsx", import.meta.url), "utf8"), oc = readFileSync(new URL("../ui/office-chat.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(rl, /className="nm-rmark/);
  assert.match(oc, /<NameLabel tint=\{ring\} text=\{p\?\.name \|\| whoName\(m\.who\)\} mark=\{p\?\.mark\}/);
});

test("「대화방」 탭 오른쪽 끝 옅은 「+」 = 방 만들기 창(우하단 「+」 와 같은 창)", () => {
  const t = readFileSync(new URL("../ui/teams.tsx", import.meta.url), "utf8"), css = readFileSync(new URL("../ui/teams.css", import.meta.url), "utf8");
  assert.match(t, /mode === "office" \? <span role="button" tabIndex=\{0\} className="nm-tplus" aria-label="대화방 추가"/);
  assert.match(t, /<TempRoomDialog key=\{session\} open=\{making\}/);
  assert.match(css, /\.nm-ftab \.nm-tplus \{[^}]*opacity:\.42/);
});
