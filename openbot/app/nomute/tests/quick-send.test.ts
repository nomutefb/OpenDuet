// 뉴스 줄 전송 · 픽 외신 판별(home/quick-send.ts) — 형 11-09 08:14 「외신기사면 외신 포함해서 찾게하고 외신 아니면 외신 안포함해서」 · 깃 29)
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FOREIGN_OUTLET_KEYS, isForeignUrl, presetFor } from "../home/quick-send.ts";

test("외신 주소 = fp 1 · 국내(.kr · 국내 .com · 포털) = fp 0", () => {
  for (const u of ["https://www.reuters.com/world/x", "https://www.nytimes.com/2026/11/09/a.html", "https://www3.nhk.or.jp/news/a.html", "https://www.bbc.co.uk/news/a"]) assert.equal(isForeignUrl(u), true, u);
  for (const u of ["https://www.yna.co.kr/view/AKR1", "https://n.news.naver.com/article/001/0012345678", "https://www.chosun.com/x", "https://www.hankyung.com/article/1", "https://v.daum.net/v/2026", "https://www.kukinews.com/article/view/kuk2026"]) assert.equal(isForeignUrl(u), false, u);
  assert.equal(isForeignUrl("이상한 주소"), false);
  assert.equal(presetFor("https://www.reuters.com/a").fp, 1);
  assert.equal(presetFor("https://www.yna.co.kr/a").fp, 0);
  assert.equal(presetFor("https://www.yna.co.kr/a").mj, 1);   // 주요 기사부터 = 창 기본 그대로
});

test("외신 목록 = news-data OUTLET 「// 외신」 묶음과 꼭 같음(모루 10:13 ① 한 출처) · 로이터커넥트 외신 · 쿠키뉴스 국내", () => {
  const src = readFileSync(new URL("../ui/news-data.ts", import.meta.url), "utf8");
  const body = src.slice(src.indexOf("const OUTLET"), src.indexOf("\n};", src.indexOf("const OUTLET")));
  const want = new Set<string>();
  let on = false;
  for (const ln of body.split("\n")) {
    const c = ln.match(/^\s*\/\/\s*(\S+)/);
    if (c) { on = c[1].startsWith("외신"); continue; }
    if (on) for (const m of ln.matchAll(/(?:^|[,{\s])(?:"([^"]+)"|([A-Za-z0-9_$]+))\s*:/g)) want.add(m[1] ?? m[2]);
  }
  assert.ok(want.size > 50, `외신 묶음 키 ${want.size}`);
  assert.deepEqual([...FOREIGN_OUTLET_KEYS].sort(), [...want].sort());
  assert.equal(isForeignUrl("https://www.reutersconnect.com/item/x"), true);
  assert.equal(isForeignUrl("https://www.kukinews.com/article/view/kuk1"), false);
});
