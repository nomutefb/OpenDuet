// 위쪽 탭 줄 자료(빠르 11-09 · 형 05:16 · 시아 05:23)
import assert from "node:assert/strict";
import { test } from "node:test";
import { DASH, TABS_MAX, tabKey, tabsAdd, tabsClose, tabsLoad, tabsMove, tabsSave } from "../ui/tab-list.ts";

const S = (keys: string[]) => keys.join(" ");
const keysOf = (s: { tabs: Parameters<typeof tabKey>[0][] }) => S(s.tabs.map(tabKey));

test("불러오기 = 깨진 값 · 빈 값 → 대시보드 하나 · 대시보드는 늘 맨 앞 · 겹침·이상한 탭 뺌 · 방 → 화면 차례", () => {
  assert.deepEqual(tabsLoad(null), { tabs: [DASH], active: "dash" });
  assert.deepEqual(tabsLoad("{깨짐"), { tabs: [DASH], active: "dash" });
  const s = tabsLoad(JSON.stringify({ tabs: [{ k: "screen", who: "뜸", url: "https://eyes.x.ts.net/vnc.html" }, { k: "room", id: "guide" }, { k: "room", id: "guide" }, { k: "screen", who: "x", url: "javascript:1" }, { k: "dash" }], active: "r:guide" }));
  assert.equal(keysOf(s), "dash r:guide s:뜸");
  assert.equal(s.active, "r:guide");
  assert.equal(tabsLoad(JSON.stringify({ tabs: [], active: "r:nope" })).active, "dash");
});

test("붙이기 = 있으면 고르기만 · 방 탭은 방 끝 · 화면 탭은 맨 끝 · 넘치면 안 고른 앞 탭부터 뺌 · 저장 → 불러오기 같음", () => {
  let s = tabsLoad(null);
  s = tabsAdd(s, { k: "screen", who: "뜸", url: "https://eyes.x.ts.net/v" });
  s = tabsAdd(s, { k: "room", id: "guide" });
  s = tabsAdd(s, { k: "room", id: "dm-fast" }, false);
  assert.equal(keysOf(s), "dash r:guide r:dm-fast s:뜸");
  assert.equal(s.active, "r:guide");
  assert.equal(tabsAdd(s, { k: "room", id: "guide" }).tabs.length, 4);
  for (let i = 0; i < 20; i++) s = tabsAdd(s, { k: "room", id: "r" + i });
  assert.equal(s.tabs.length, TABS_MAX);
  assert.equal(tabKey(s.tabs[0]), "dash");
  assert.deepEqual(tabsLoad(tabsSave(s)), s);
});

test("닫기 = 대시보드 못 닫음 · 고른 탭 닫으면 오른쪽 → 왼쪽 → 대시보드", () => {
  let s = tabsAdd(tabsAdd(tabsAdd(tabsLoad(null), { k: "room", id: "a" }), { k: "room", id: "b" }), { k: "room", id: "c" });
  s = { ...s, active: "r:b" };
  assert.equal(tabsClose(s, "dash"), s);
  assert.equal(tabsClose(s, "r:b").active, "r:c");
  assert.equal(tabsClose({ ...s, active: "r:c" }, "r:c").active, "r:b");
  assert.equal(tabsClose(tabsClose(tabsClose(s, "r:a"), "r:b"), "r:c").active, "dash");
});

test("끌어서 순서 = 대시보드 자리 고정 · 방·화면 갈래 안에서만", () => {
  let s = tabsLoad(null);
  for (const id of ["a", "b", "c"]) s = tabsAdd(s, { k: "room", id });
  s = tabsAdd(s, { k: "screen", who: "뜸", url: "https://e.x.ts.net/v" });
  assert.equal(keysOf(tabsMove(s, "r:c", 1)), "dash r:c r:a r:b s:뜸");
  assert.equal(keysOf(tabsMove(s, "r:a", 9)), "dash r:b r:c r:a s:뜸");
  assert.equal(keysOf(tabsMove(s, "s:뜸", 0)), keysOf(s));
  assert.equal(tabsMove(s, "dash", 3), s);
});
