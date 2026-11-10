import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// 기사 한 장 「사진 5장 더」 · 「썸네일 다시」(ui/thumb-more.tsx) — 단추가 떠도 shim 통과 목록에 없으면 서버에 안 닿음(11-10 「요약 고치기」 revise 23분 사고)
const shim = readFileSync(new URL("../shim/install.ts", import.meta.url), "utf8");
const src = readFileSync(new URL("../ui/thumb-more.tsx", import.meta.url), "utf8");
const pass = (() => { const m = /\/\^\\\/api\\\/\(([^)]*)\)/.exec(shim); assert.ok(m, "shim 통과 목록 정규식"); return new RegExp(`^/api/(${m[1]})(/|$|\\?)`); })();

test("shim = moreimg · thumbredo 서버 그대로", () => {
  for (const p of ["/api/moreimg", "/api/thumbredo"]) assert.ok(pass.test(p), p);
});

test("보내는 글 = 옛 에디터와 같은 꼴(moreimg {file} · thumbredo {article} = sid 없이 4화풍 통째)", () => {
  assert.match(src, /post\("\/api\/moreimg", \{ file: stem \}\)/);
  assert.match(src, /post\("\/api\/thumbredo", \{ article: stem \}\)/);
});

test("4화풍 다시 = 돈 → 두 번 눌러야 나감", () => {
  assert.match(src, /armed \? void send\("redo"\) : setArmed\(true\)/);
  assert.match(src, /armed \? "한 번 더" : "썸네일 다시"/);   // 글자 폭 = 「썸네일 다시」보다 안 넓게(머리 줄이 두 줄로 안 튐 · 돈 안내는 아래 호박색 줄)
});
