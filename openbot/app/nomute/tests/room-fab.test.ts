// 대화방 목록 「+」 = 누르면 바로 단톡방 만들기(형 11-15 「이것도 여기서 + 누르면 단톡방 만들기 바로 되면 될듯」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
test("「+」 한 번 = 단톡방 만들기 창 · 펼침 0 · 자리 그대로", () => {
  const fab = rd("../ui/room-fab.tsx"), css = rd("../ui/yeta-chat.css"), ek = rd("../ui/ed-keep.css");
  assert.match(fab, /className="nm-fab-main" aria-haspopup="dialog" aria-label="단톡방 만들기" title="단톡방 만들기" onClick=\{\(\) => setMaking\(true\)\}/);
  assert.match(fab, /<TempRoomDialog key=\{session\} open=\{making\} onClose=\{close\} \/>/);
  assert.doesNotMatch(fab, /nm-fab-i|setOpen|aria-expanded/, "펼치는 단추 0");
  assert.match(css, /\.nm-fab \{[^}]*right:14px; bottom:calc\(var\(--duet-tab-space,86px\) \+ 8px\)/);
  assert.match(ek, /\.duet-face:has\(\.nm-pane\.on \.nm-dec\) > \.tool-restore \{ bottom:calc\(var\(--duet-tab-space,86px\) \+ 122px\); \}/, "결정 단추가 「+」 위에 뜬 화면 = 복원 ▲ 는 그 위로");
});
