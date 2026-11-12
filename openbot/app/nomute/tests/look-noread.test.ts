// 찍기 탭(?look=1) = 형 「읽음」을 서버에 안 보냄(봄 11-12 11:04 「봇이 형 자리로 방을 열어 찍어도 형 읽음이 안 찍힘」 · 뎅)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("찍기 탭 = seen 쓰기 0 · 형이 직접 열면 그대로", () => {
  const src = readFileSync(new URL("../data/read-state.ts", import.meta.url), "utf8");
  assert.match(src, /new URLSearchParams\(location\.search\)\.has\("look"\)/);   // 주소 ?look=1
  assert.match(src, /sessionStorage/);   // 그 탭에만
  assert.match(src, /if \(LOOK_ONLY\) return marker;/);   // 서버 POST 앞에서 끊음
});
