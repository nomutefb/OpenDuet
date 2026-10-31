import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeReact } from "../data/react-merge.ts";

test("반응 하나를 남겨도 방의 다른 글 반응은 그대로 (No.22)", () => {
  const old = { quick: ["👍"], reactions: { "1-aaaaaa": { "❤️": ["윈터"] }, "2-bbbbbb": { "👍": ["봄"] } } };
  const next = mergeReact(old, "2-bbbbbb", { "👍": ["봄", "형"] });
  assert.deepEqual(next.reactions["1-aaaaaa"], { "❤️": ["윈터"] });
  assert.deepEqual(next.reactions["2-bbbbbb"], { "👍": ["봄", "형"] });
  assert.deepEqual(next.quick, ["👍"]);
});

test("빼기 뒤 빈 칸 · 처음 받은 방", () => {
  assert.deepEqual(mergeReact(undefined, "3-cccccc", {}).reactions, { "3-cccccc": {} });
  assert.deepEqual(mergeReact({ reactions: { "3-cccccc": { "👍": ["형"] } } }, "3-cccccc", undefined).reactions, { "3-cccccc": {} });
});
