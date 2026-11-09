// 언론사 칸 = 진짜 언론사만(빠르 11-09 · 형 「네이버 < 이거는 언론사가 아닌데 … 대체되게」 · 화면 3위 「네이버」 · 11위 「RSS 후보」)
import test from "node:test";
import assert from "node:assert/strict";
import { naverOutlet, notOutlet, outletOf, outletOfUrl } from "../home/outlet-name.ts";

const NAMES: Record<string, string> = { "chosun.com": "조선일보", "news.naver.com": "네이버", "jtbc.co.kr": "JTBC", "candidates(rss)": "RSS 후보" };
const nameOf = (h: string) => { const k = Object.keys(NAMES).find((d) => h === d || h.endsWith("." + d)); return k ? NAMES[k] : h; };

test("네이버 번호 → 언론사(11-09 더한 다섯 포함)", () => {
  assert.equal(naverOutlet("https://n.news.naver.com/article/654/0000210130"), "강원도민일보");
  assert.equal(naverOutlet("https://n.news.naver.com/mnews/article/119/0003152680?sid=100"), "데일리안");
  assert.equal(naverOutlet("https://n.news.naver.com/article/comment/023/0003900000"), "조선일보");
  assert.equal(naverOutlet("https://n.news.naver.com/article/999/1"), "");
});

test("포털 · 길 이름은 언론사 아님", () => {
  for (const n of ["네이버", "네이버뉴스", "RSS 후보", "커뮤 후보", "candidates(rss)", " 네이트"]) assert.equal(notOutlet(n), true, n);
  for (const n of ["조선일보", "JTBC", "강원도민일보", ""]) assert.equal(notOutlet(n), false, n);
});

test("주소 하나: 모르는 네이버 번호 = 빈 칸(「네이버」 안 냄)", () => {
  assert.equal(outletOfUrl("https://n.news.naver.com/article/999/1", nameOf), "");
  assert.equal(outletOfUrl("https://www.chosun.com/x", nameOf), "조선일보");
});

test("화면 3위 꼴: 틈 픽 outlets [null] + n.news 654 → 강원도민일보", () => {
  assert.equal(outletOf(undefined, ["https://n.news.naver.com/article/654/0000210130"], nameOf), "강원도민일보");
});

test("화면 11위 꼴: 받은 이름 「RSS 후보」 → 기사 주소 언론사 · 없으면 빈 칸", () => {
  assert.equal(outletOf("RSS 후보", ["https://news.jtbc.co.kr/article/1"], nameOf), "JTBC");
  assert.equal(outletOf("RSS 후보", [], nameOf), "");
  assert.equal(outletOf("네이버", ["https://n.news.naver.com/article/999/1", "https://www.chosun.com/y"], nameOf), "조선일보");
  assert.equal(outletOf("세계일보", ["https://www.chosun.com/y"], nameOf), "세계일보");
});
