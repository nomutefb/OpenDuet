import assert from "node:assert/strict";
import test from "node:test";
import { arCustom, arRatio, artCtx, artLabel, artRows, histItems, kstStamp, plain, trIdTs } from "../ui/tr-logic.ts";

// 서랍 「번역카드」 판 2(ui/trcard.tsx) — 원본 viewer/tr.html 과 같은 값이 화면 · 서버(functions/api/tr.js · trhist.js)로 가는지
test("비율 = 프리셋 · 직접 「가로:세로」 · 못 읽으면 4:5", () => {
  assert.equal(arRatio("4:5"), 5 / 4);
  assert.equal(arRatio("9:16"), 16 / 9);
  assert.equal(arRatio("16:9"), 9 / 16);
  assert.equal(arRatio("1:1"), 1);
  assert.equal(arRatio("3:2"), 2 / 3, "직접 3:2 = 세로/가로");
  assert.equal(arRatio("직접"), 5 / 4);
  assert.equal(arRatio("1:99"), 5 / 4, "너무 길쭉한 판은 기본으로");
  assert.equal(arCustom("3", "2"), "3:2");
  assert.equal(arCustom("", "2"), null);
  assert.equal(arCustom("0", "2"), null);
  assert.equal(arCustom("1", "4"), "1:4");
  assert.equal(arCustom("1", "5"), null, "1:4 밖");
  assert.equal(arCustom("99", "1"), null, "4:1 밖");
});

test("참고 기사 목록 = 요약 6 + 수집 6(새 글부터) · 서버 ctx.art 꼴", () => {
  const arts = { articles: Array.from({ length: 8 }, (_, i) => ({ title: `요약 ${i}`, media: "매체", file: `f${i}` })).concat([{ title: "", media: "", file: "x" }]) };
  const cands = [{ title: "옛 글", published: "2026-11-01", url: "https://a.example/1" }, { title: "새 글", published: "2026-11-10", url: "javascript:alert(1)", media: "통신" }, { published: "2026-11-11" }];
  const rows = artRows(arts, cands);
  assert.equal(rows.filter((r) => r.k === "요약").length, 6);
  assert.deepEqual(rows.filter((r) => r.k === "수집").map((r) => r.t), ["새 글", "옛 글"]);
  assert.equal(rows.find((r) => r.t === "새 글")!.u, undefined, "http(s) 아닌 주소는 안 실음");
  assert.equal(rows.find((r) => r.t === "옛 글")!.u, "https://a.example/1");
  assert.deepEqual(artRows([{ title: "배열 꼴" }], null).map((r) => r.t), ["배열 꼴"]);
  assert.deepEqual(artRows(null, "<!doctype html>"), []);
  const c = artCtx({ k: "요약", t: "가".repeat(300), m: "나".repeat(60), file: "f" }, `<p>본문  <b>굵게</b></p>${"다".repeat(1000)}`);
  assert.equal(c.t.length, 200); assert.equal(c.m.length, 40); assert.equal(c.b.length, 900); assert.ok(c.b.startsWith("본문 굵게"));
  assert.equal("u" in c, false);
  assert.equal(artCtx({ k: "수집", t: "t", m: "", u: "https://a.example/1" }).u, "https://a.example/1");
  assert.equal(artLabel({ t: "제목", m: "매체" }), "매체 · 제목");
  assert.equal(artLabel({ t: "제목", m: "" }), "제목");
  assert.equal(plain("<i>a</i>\n b"), "a b");
});

test("이전 제작 = id 앞 12자리가 KST 시각 · 새것부터 · 꼴 안 맞는 줄은 버림", () => {
  assert.equal(trIdTs("261111013000-ab12cd"), Date.parse("2026-11-11T01:30:00+09:00"));
  assert.equal(trIdTs("손으로-올린-키"), 0);
  assert.equal(kstStamp(Date.parse("2026-11-11T01:30:00+09:00")), "11-11 01:30");
  const items = histItems({ items: [
    { id: "261110120000-aaaaaa", url: "https://r2.example/trout/261110120000-aaaaaa.jpg" },
    { id: "261111013000-bbbbbb", url: "https://r2.example/trout/261111013000-bbbbbb.jpg" },
    { id: "261111013000-bbbbbb", url: "https://r2.example/dup.jpg" },
    { id: "bad id", url: "https://r2.example/x.jpg" },
    { id: "261111020000-cccccc", url: "http://r2.example/plain.jpg" },
    { id: "nodate-dddddd", url: "https://r2.example/y.jpg" },
    null,
  ] });
  assert.deepEqual(items.map((x) => x.id), ["261111013000-bbbbbb", "261110120000-aaaaaa"]);
  assert.deepEqual(histItems(null), []);
  assert.deepEqual(histItems({ items: [], reason: "r2-unbound" }), []);
});
