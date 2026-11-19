// 말풍선 안 이름 알약 누르면 그 애 1:1 방으로(구름 11-19 · 형 13:01 dm-bom 봄 옮김 「봄아 이런곳에서 뜸 누르면 이동하게 해줘」)
import { test } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("이름 알약 = rooms 의 with 로 그 애 방 찾아 /channels/<방> · 형 칩 · 방 없는 이름 = 글자 그대로 · 길게 누름과 안 겹침", () => {
  const ui = readFileSync(new URL("../ui/office-chat.tsx", import.meta.url), "utf8"), css = readFileSync(new URL("../ui/yeta-chat.css", import.meta.url), "utf8");
  assert.match(ui, /const room = hy \? "" : \(qc\.getQueryData<OfficeRoom\[\]>\(\["nomute", "rooms"\]\) \|\| \[\]\)\.find\(\(r\) => r\.with === p\.who\)\?\.id \|\| "";/);
  assert.match(ui, /if \(!room\) return <span className=\{cls\} title=/);
  assert.match(ui, /e\.stopPropagation\(\); if \(justHeld\(\)\) return; void nav\(\{ to: "\/channels\/\$channelId", params: \{ channelId: room \} \}\);/);
  assert.match(css, /\.ychat button\.ycall \{ appearance:none; margin:0; font:inherit;/);
});
