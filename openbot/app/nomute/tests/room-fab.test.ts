// 대화방 목록 「+」 = 누르면 바로 단톡방 만들기(형 11-15 「이것도 여기서 + 누르면 단톡방 만들기 바로 되면 될듯」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
test("「+」 한 번 = 단톡방 만들기 창 · 펼침 0 · 자리 그대로", () => {
  const fab = rd("../ui/room-fab.tsx"), css = rd("../ui/yeta-chat.css"), ek = rd("../ui/ed-keep.css");
  // 우하단 「+」 = 뺌 · 방 만들기 = 탭 「+」 하나(형 11-20 07:36 dm-gik 깃 옮김 「!깃 ✓ ① 응 빼(탭 「+」 하나만)」) — 폰 「대화방」 탭(./teams.tsx) · PC 맨 위 줄(RoomMake)
  assert.doesNotMatch(fab, /nm-fab-main/);
  assert.match(fab, /export function RoomFab\(\) \{\n  return <PmFab \/>;\n\}/);
  // PM 구슬 = 오른쪽 아래 옛 「+」 자리(형 11-20 12:30 「지금 pm 동그라미 추상 심볼 위치 우하단 + 위치 말한거임!」) · 탭 줄엔 없음
  assert.match(css, /\.nm-pmfab \{ position:absolute; right:14px; bottom:calc\(var\(--duet-tab-space,86px\) \+ 24px\);/);
  assert.ok(!rd("../ui/teams.tsx").includes("PmFab"));
  assert.match(fab, /aria-haspopup="dialog" aria-label="대화방 추가" title="대화방 추가" onClick=\{\(\) => setMaking\(true\)\}/);
  assert.match(fab, /<TempRoomDialog key=\{session\} open=\{making\} onClose=\{close\} \/>/);
  assert.match(rd("../ui/room-list.tsx"), /\{teamsOn \? null : <RoomMake className="nm-rbar-b nm-rbar-plus" \/>\}/);
  assert.doesNotMatch(fab, /nm-fab-i|setOpen|aria-expanded/, "펼치는 단추 0");
  assert.match(css, /\.nm-fab \{[^}]*right:14px; bottom:calc\(var\(--duet-tab-space,86px\) \+ 24px\)/);   // 16px 위로(형 11-15 08:55 「우측 하단에 +는 조금만 더 위로」)
  assert.match(ek, /:root\[data-nm-dec\] \.duet-face\[data-pane="rooms"\] > \.tool-restore \{ bottom:calc\(var\(--duet-tab-space,86px\) \+ 122px\); \}/, "결정 단추가 「+」 위에 뜬 화면 = 복원 ▲ 는 그 위로(무대에 건 :has 대신 표시 · tests/lean-has.test.ts)");
});
