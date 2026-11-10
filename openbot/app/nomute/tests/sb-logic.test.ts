import assert from "node:assert/strict";
import { test } from "node:test";
import { sbPick, qFit, sbBody, refUrls, cutsOf, SB_DEF } from "../ui/sb-logic.ts";

// 정원 「스토리보드」 판 1(team-4 · 깃 11-11) — 원본 viewer/sb.html sbQFit · sbPayload · functions/api/sb.js 와 같은 값인지
test("화질 = 촬영 칸이 되는 값 중 넘지 않는 가장 높은 것(위로 안 튐)", () => {
  assert.equal(qFit("grok", "2K"), "720p"); assert.equal(qFit("seedance20", "2K"), "FHD"); assert.equal(qFit("seedance20", "4K"), "4K");
  assert.equal(qFit("motion", "2K"), "2K"); assert.equal(qFit("seedance", "720p"), "720p");
  assert.equal(cutsOf("30s"), 3);
});

test("기본 = 페이블 · Grok · 9:16 · 2K → 720p · 10s · 실사 · 세부 자동은 안 보냄", () => {
  const b = sbBody("  이야기  ", SB_DEF, "콘티").body!;
  assert.deepEqual(b, { story: "이야기", director: "fable", shoot: "grok", set: { "비율": "9:16", "화질": "720p", "프레임": "30fps", "길이": "10s", "화풍": "실사" }, ad: false, sound: true, ref: true, lbl: "콘티" });
  assert.ok(sbBody(" ", SB_DEF, "").error);
});

test("세부 화풍 = 상위 화풍 목록 안에서만 · 모션 = 레퍼런스 끔 · 소리는 Grok 만 고름", () => {
  const o = sbPick({ style: "webtoon", sub: "gekiga", shoot: "motion", snd: false, director: "opus", ad: true });
  assert.equal(o.director, "opus");
  const b = sbBody("x", o, "").body!;
  assert.deepEqual(b.set, { "비율": "9:16", "화질": "2K", "프레임": "30fps", "길이": "10s", "화풍": "극화", "세부 화풍": "게키카" });
  assert.equal(b.ref, false); assert.equal(b.sound, true); assert.equal(b.ad, true);
  assert.equal(sbPick({ style: "photo", sub: "gekiga" }).sub, "auto");
  assert.equal(sbBody("x", sbPick({ shoot: "grok", snd: false }), "").body!.sound, false);
});

test("레퍼런스 = urls 여럿 · url 하나(옛 꼴)", () => {
  assert.deepEqual(refUrls({ urls: ["https://a/1.jpg", 3, "x"] }), ["https://a/1.jpg"]);
  assert.deepEqual(refUrls({ url: "https://a/r.jpg" }), ["https://a/r.jpg"]); assert.deepEqual(refUrls(null), []);
});
