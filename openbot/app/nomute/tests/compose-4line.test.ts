// 정원 입력칸 4줄 덜컹 · 커서만 라임(형 11-15 08:48 「채팅이 4줄 이상 넘어가면 덜컹덜컹 … 4줄일때만 그러네」 · 08:57 「커서만 라임색 … 테두리를 라임으로 잡아줄 필요는 없어!」 · 깃 #-045)
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("compact 입력칸 높이 한계 = 꼭 4줄(줄 23px × 4 + 여백 13px)", () => {
  const src = rd("../../src/components/channels/composer/composer.tsx");
  assert.match(src, /const COMPACT_MAX_HEIGHT_PX = 23 \* 4 \+ 13;/);
  assert.match(src, /leading-\[1\.4375rem\]/);   // 23px 줄 상자(바뀌면 위 셈도 같이)
  assert.match(src, /py-\[6\.5px\]/);
});

test("정원 입력칸 = 쓰는 중 라임 테두리 0 · 커서만 라임", () => {
  const css = rd("../ui/yeta-chat.css");
  assert.doesNotMatch(css, /\.ychat-in form:focus-within \{ border-color:var\(--accent\)/);
  assert.match(css, /\.ychat-in \.duet-composer-editor \{[^}]*caret-color:var\(--accent/);
});
