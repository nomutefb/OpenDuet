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
