// Hot Issue 오른쪽 칸 = 다른 기기에서 누른 요약도(구름 11-19 · 형 16:42~16:49 슈왕 · 깃 · 봄 옮김 「폰에서 요약눌렀는데, pc에서는 요약이 그대로 살아있어서 내가 안눌러서 저런가? 의구심이 드는게 문제야」)
import { test } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PEND_LIVE, urlKey, urlPathKey } from "../home/pending-query";

test("주소 맞춤 열쇠 = 앞머리 · 끝 / · # 뗌 · 물음표 뒤 그대로 · 길에 기사 번호 있으면 물음표 뒤 뗀 것도", () => {
  assert.equal(urlKey("https://www.Example.com/a/b/?x=1#top"), "example.com/a/b?x=1");
  assert.equal(urlKey("https://m.site.kr/news/123/"), "site.kr/news/123");
  assert.equal(urlPathKey("https://n.news.naver.com/mnews/article/025/0003566473?sid=102"), "n.news.naver.com/mnews/article/025/0003566473");
  assert.equal(urlPathKey("https://site.kr/news/articleView.html?idxno=12345"), "");   // 기사 번호가 물음표 뒤 = 뗀 열쇠 0(같은 매체 기사끼리 엉키지 않음)
  assert.ok(PEND_LIVE.has("processing") && !PEND_LIVE.has("succ") && !PEND_LIVE.has("fail"));
});

test("Digest · Hot Issue = 대기열 한 벌(같은 열쇠 · 한 번만 받음) · 요약중 = 대기열 key/src/alt1 · 요약됨 = articles url · 누르면 그 요약", () => {
  const nl = readFileSync(new URL("../home/news-list.tsx", import.meta.url), "utf8"), ns = readFileSync(new URL("../home/news-summary.tsx", import.meta.url), "utf8"), nc = readFileSync(new URL("../home/news-list.css", import.meta.url), "utf8");
  assert.match(ns, /const pend = useQuery\(pendingQuery\);/);
  assert.match(nl, /const pend = useQuery\(pendingQuery\), arts = useQuery\(newsListQuery\)\.data\?\.arts;/);
  assert.ok(!nl.includes('"hot-sum-pending"'));   // 따로 받던 대기열 = 걷음
  assert.match(nl, /for \(const u of \[it\.key, it\.src, it\.alt1\]\)/);
  assert.match(nl, /x\?\.k === "done" \? <span className="sm">요약됨<\/span>/);
  assert.match(nl, /goSum\(`\/newsed\?a=\$\{encodeURIComponent\(x\.file!\)\}`\)/);
  assert.match(nc, /\.done \.sm \{ color:rgba\(232,234,232,\.7\); \}/);
});
