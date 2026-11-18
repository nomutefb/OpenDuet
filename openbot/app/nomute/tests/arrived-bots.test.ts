// 「도착한 메시지」 = 애들이 보낸 것만 — 형 11-19 07:2x 「메인 화면에, 내가 쓴 원문이 글로 보인다 (메인 피드에) 애들이 보낸것만 보여야되는데」
import { test } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { byHyung } from "../home/arrived-core";

test("형 글 = 앱 글(human) · 바깥에서 쳐 거울로 실린 글(형(앱에서 씀) · 형(창에서 씀)) · 애들 글은 아님", () => {
  assert.equal(byHyung({ who: "형", kind: "human" }), true);
  assert.equal(byHyung({ who: "형(앱에서 씀)", kind: "system" }), true);
  assert.equal(byHyung({ who: "형(창에서 씀)", kind: "system" }), true);
  assert.equal(byHyung({ who: "깃", kind: "being" }), false);
  assert.equal(byHyung({ who: "소나", kind: "bot" }), false);
  assert.equal(byHyung({ who: "형준", kind: "bot" }), false);
  assert.equal(byHyung(null), false);
});
test("도착 칸 = 마지막 글이 형 글인 방을 뺌", () => {
  const src = readFileSync(new URL("../home/arrived.tsx", import.meta.url), "utf8");
  assert.match(src, /count\(r\) !== 0 && !byHyung\(lastOf\(r\)\)/);
});
