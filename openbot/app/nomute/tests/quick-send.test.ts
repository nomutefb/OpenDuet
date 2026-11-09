// 뉴스 줄 전송 · 픽 외신 판별(home/quick-send.ts) — 형 11-09 08:14 「외신기사면 외신 포함해서 찾게하고 외신 아니면 외신 안포함해서」 · 깃 29)
import test from "node:test";
import assert from "node:assert/strict";
import { isForeignUrl, presetFor } from "../home/quick-send.ts";

test("외신 주소 = fp 1 · 국내(.kr · 국내 .com · 포털) = fp 0", () => {
  for (const u of ["https://www.reuters.com/world/x", "https://www.nytimes.com/2026/11/09/a.html", "https://www3.nhk.or.jp/news/a.html", "https://www.bbc.co.uk/news/a"]) assert.equal(isForeignUrl(u), true, u);
  for (const u of ["https://www.yna.co.kr/view/AKR1", "https://n.news.naver.com/article/001/0012345678", "https://www.chosun.com/x", "https://www.hankyung.com/article/1", "https://v.daum.net/v/2026"]) assert.equal(isForeignUrl(u), false, u);
  assert.equal(isForeignUrl("이상한 주소"), false);
  assert.equal(presetFor("https://www.reuters.com/a").fp, 1);
  assert.equal(presetFor("https://www.yna.co.kr/a").fp, 0);
  assert.equal(presetFor("https://www.yna.co.kr/a").mj, 1);   // 주요 기사부터 = 창 기본 그대로
});
