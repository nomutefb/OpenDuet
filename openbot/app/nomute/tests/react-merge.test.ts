import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeReact, swapLock, swapReact } from "../data/react-merge.ts";

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

// 반응 바꾸기 두 번 부름(모루 #2910 ①) — 첫 성공 · 둘째 실패 · 다시 시도 · 같은 글 겹침
test("swapReact — 첫 부름 성공 · 둘째 실패 = 첫 답은 표에 남고 실패는 밖으로", async () => {
  const seen: Array<Record<string, string[]> | undefined> = [];
  const post = async (e: string) => { if (e === "B") throw new Error("503"); return { reactions: { A: [] } }; };
  await assert.rejects(swapReact(post, (one) => seen.push(one), { from: "A", to: "B", hasTo: false }), /503/);
  assert.deepEqual(seen, [{ A: [] }]);   // 화면 = 서버(A 빠짐) — 옛 판은 이 답을 버려 화면만 A 였음
});

test("swapReact — 다시 시도 = 서버 표 기준이라 A 가 되살지 않음(A 빠진 채 B 만 담음)", async () => {
  const server: Record<string, string[]> = { A: ["형"] };
  const post = async (e: string) => { const w = server[e] || []; server[e] = w.includes("형") ? w.filter((x) => x !== "형") : [...w, "형"]; return { reactions: { ...server } }; };
  let fail = true;
  const flaky = async (e: string) => { if (e === "B" && fail) { fail = false; throw new Error("503"); } return post(e); };
  let table: Record<string, string[]> | undefined;
  await assert.rejects(swapReact(flaky, (one) => { table = one; }, { from: "A", to: "B", hasTo: false }));
  assert.deepEqual(table, { A: [] });
  const has = (e: string) => (table?.[e] || []).includes("형");   // 다시 누를 때 화면이 보는 표 = 첫 답
  assert.equal(has("A"), false);   // A 를 「옛 것」으로 다시 빼지 않음 → 이번엔 B 담기만
  await post("B"); 
  assert.deepEqual(server, { A: [], B: ["형"] });
});

test("swapReact — 이미 담은 새 것(hasTo) = 빼기 한 번만", async () => {
  const calls: string[] = [];
  await swapReact(async (e) => { calls.push(e); return { reactions: {} }; }, () => {}, { from: "A", to: "B", hasTo: true });
  assert.deepEqual(calls, ["A"]);
});

test("swapLock — 같은 글은 한 번에 하나 · 끝나면(실패도) 다시 받음 · 다른 글은 따로", async () => {
  const busy = new Set<string>();
  let done!: () => void, fail!: (e: Error) => void;
  assert.equal(swapLock(busy, "m1", () => new Promise<void>((r) => { done = r; })), true);
  assert.equal(swapLock(busy, "m1", async () => {}), false);
  assert.equal(swapLock(busy, "m2", () => new Promise<void>((_, j) => { fail = j; })), true);
  done(); fail(new Error("x"));
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(busy.size, 0);
  assert.equal(swapLock(busy, "m1", async () => {}), true);
});
