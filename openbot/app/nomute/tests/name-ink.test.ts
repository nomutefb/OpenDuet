// #-044 글 안 봇 이름 = 말풍선 시그니처 색(투명도 0 · 다크 그 색 · 라이트 읽히게)
import assert from "node:assert/strict";
import test from "node:test";
import { nameInk } from "../ui/name-ink.ts";
test("투명도 뺌 · 바탕에 읽히는 색 = 그 색 그대로", () => {
  assert.equal(nameInk("#FFE606")!.dark, "#ffe606");   // 번개 노랑 · 다크
  assert.equal(nameInk("#0044AB4D")!.light, "#0044ab");   // 빠르 파랑(4D 뺌) · 라이트
  assert.equal(nameInk("#543202")!.light, "#543202");   // 뎅 갈색 · 라이트
});
test("묻히는 색만 같은 색상으로 밝기 옮김 · 못 읽는 꼴 = null", () => {
  assert.match(nameInk("#FFE606")!.light, /^hsl\(54 100% \d+%\)$/);   // 노랑 · 흰 바탕 = 어둡게
  assert.match(nameInk("#543202")!.dark, /^hsl\(35 /);   // 갈색 · 어두운 바탕 = 밝게
  assert.equal(nameInk(""), null); assert.equal(nameInk("red"), null);
});
import { readFileSync } from "node:fs";
test("글 안 이름 = .sig + 다크 --nm-ink · 라이트 --nm-ink-l(앱 두 자리 다)", () => {
  const css = readFileSync(new URL("../ui/yeta-chat.css", import.meta.url), "utf8"), s = readFileSync(new URL("../ui/office-chat.tsx", import.meta.url), "utf8");
  assert.match(css, /\.ychat \.yname-c\.sig \{ color:var\(--nm-ink-l\) !important; \}/);
  assert.match(css, /\.dark \.ychat \.yname-c\.sig \{ color:var\(--nm-ink\) !important; \}/);
  assert.equal((s.match(/nameProps\(/g) || []).length >= 3, true);
});
