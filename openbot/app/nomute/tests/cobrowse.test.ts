// 같이 보기(봄 11-12 13:54 · 뜸)
import assert from "node:assert/strict";
import test from "node:test";
import { cobrowseSrc, reachable } from "../ui/cobrowse.ts";
import { tabKey, tabsAdd, tabsLoad, tabsSave } from "../ui/tab-list.ts";

test("서버 답 → 띄울 주소 = https · ts.net · 표 붙은 것만", () => {
  assert.equal(cobrowseSrc({ url: "https://mac.tail46034f.ts.net:7273/?t=abcdefghijklmnop" }), "https://mac.tail46034f.ts.net:7273/?t=abcdefghijklmnop");
  assert.equal(cobrowseSrc({ url: "https://mac.tail46034f.ts.net:7273/" }), "", "표 없음");
  assert.equal(cobrowseSrc({ url: "http://mac.tail46034f.ts.net:7273/?t=x" }), "", "http");
  assert.equal(cobrowseSrc({ url: "https://evil.example.com/?t=x" }), "");
  assert.equal(cobrowseSrc(null), "");
  assert.equal(cobrowseSrc({ via: "/api/office/co/?t=abcdefghijklmnop", url: "https://mac.tail46034f.ts.net:8443/?t=abcdefghijklmnop" }), "/api/office/co/?t=abcdefghijklmnop", "같은 집 길 먼저");
  assert.equal(cobrowseSrc({ via: "https://evil.example.com/api/office/co/?t=abcdefghij", url: "https://mac.tail46034f.ts.net:8443/?t=abcdefghijklmnop" }), "https://mac.tail46034f.ts.net:8443/?t=abcdefghijklmnop", "via 는 이 집 길만");
  assert.equal(cobrowseSrc({ via: "//evil.example.com/?t=abcdefghij" }), "");
});

test("닿나 재기 — 그물 끊김 = false · 닿음(403 도) = true", async () => {
  assert.equal(await reachable("https://a.b.ts.net:7273/?t=x", (async () => new Response("", { status: 403 })) as typeof fetch), true);
  assert.equal(await reachable("https://a.b.ts.net:7273/?t=x", (async () => { throw new TypeError("net"); }) as typeof fetch), false);
  assert.equal(await reachable("nope", fetch), false);
});

test("탭 줄 — 같이 보기 탭은 하나 · 저장 · 되읽기", () => {
  let s = tabsLoad(null);
  s = tabsAdd(s, { k: "co" }); s = tabsAdd(s, { k: "co" });
  assert.equal(s.tabs.filter((t) => t.k === "co").length, 1);
  assert.equal(s.active, "co");
  const back = tabsLoad(tabsSave(s));
  assert.equal(back.active, "co");
  assert.equal(tabKey(back.tabs[1]), "co");
});

test("로컬 네트워크 권한 — 물음 = 길게 기다림 · 못 물음 = 막지 않음", async () => {
  const { lnaState, reachWait } = await import("../ui/cobrowse.ts");
  assert.equal(await lnaState({ permissions: { query: async () => ({ state: "prompt" }) } }), "prompt");
  assert.equal(await lnaState({ permissions: { query: async () => { throw new TypeError("x"); } } }), "unknown");
  assert.equal(await lnaState({}), "unknown");
  assert.ok(reachWait("prompt") > reachWait("granted"));
});
