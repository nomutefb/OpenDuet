// 쉴 때 화면 가림 = 10분 · PC 문턱 = 반갈 860 · 손 아닌 이동·코드 이벤트는 입력 아님(형 11-13 10:59 봄 옮김 「미 입력 10분이면 웹앱 보호기 있어야되는데 안되더라고」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("보호기 = 10분 · 860 · 자리 그대로 이동 · isTrusted 아님 = 안 셈", () => {
  const s = readFileSync(new URL("../ui/idle-blind.tsx", import.meta.url), "utf8");
  assert.match(s, /IDLE_MS = 10 \* 60_000/);
  assert.match(s, /window\.innerWidth >= 860/);
  assert.match(s, /m\.screenX === px && m\.screenY === py\) return/);
  assert.match(s, /if \(!e\.isTrusted\) return;/);
  assert.match(s, /on \? "10분" : "끔"/);
  const side = readFileSync(new URL("../ui/side.tsx", import.meta.url), "utf8");
  assert.match(side, /SPLIT = "\(min-width: 860px\)"/, "반갈 문턱이 바뀌면 보호기 문턱도 같이");
});
