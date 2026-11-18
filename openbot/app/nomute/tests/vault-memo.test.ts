// 보안 서랍 예비 자리 이름표(빠르 11-18 13:38 · 형 13:32 dm-gik 「예비 02, 03에 예비 자리에는 아래에 기입해서 저장가능한 텍스트 박스 넣어주고」)
import { test } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("서버가 memo 칸을 준 자리만 한 줄 글칸 + 저장 · POST seatvault/memo {seat, memo} · 200자 · 바뀐 때만 저장 단추 · 저장 뒤 다시 받기", () => {
  const ui = readFileSync(new URL("../ui/settings-extra.tsx", import.meta.url), "utf8");
  assert.match(ui, /memo\?: string \};/);
  assert.match(ui, /\{s\.memo !== undefined \? \(\(\) => \{/);   // 칸이 없는 자리(자리 01~ · 옛 서버) = 글칸 0
  assert.match(ui, /office<[^>]*>\("seatvault\/memo", \{ method: "POST", body: JSON\.stringify\(\{ seat, memo: v \}\) \}\)/);
  assert.match(ui, /maxLength=\{200\}/);
  assert.match(ui, /disabled=\{!changed \|\| long\}/);
  assert.match(ui, /void qc\.invalidateQueries\(\{ queryKey: \["nomute", "seatvault"\] \}\); \}\} className="min-h-10 rounded-lg border border-border px-3 text-sm disabled:opacity-40">저장<\/GoButton>/);
  assert.match(ui, /type="text"[^>]*placeholder="이 자리 이름표\(계정 등\)"/);   // 이름표 = 보이는 글(열쇠 칸처럼 password 아님)
});
