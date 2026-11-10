import assert from "node:assert/strict";
import test from "node:test";
import { GAUGE_DEF, applyPayload, deadKey, dlSrc, gaugeOpts, hardMs, notHtml, trainPayload, vocLabel, vocSnap, voiceDone } from "../ui/song-logic.ts";

// 서랍 「음원」 판 2(ui/song-more.tsx) — 원본 viewer/song.html 과 같은 값이 서버로 가는지
test("게이지 중립 = opts 안 실음 · 하나라도 움직이면 원본 꼴 그대로", () => {
  assert.equal(gaugeOpts(GAUGE_DEF), null);
  assert.equal(gaugeOpts({ ...GAUGE_DEF, w: 55 }), null, "40~60 안쪽은 중립");
  assert.deepEqual(gaugeOpts({ ...GAUGE_DEF, g: -30 }), { w: 50, s: 50, v: "male", vg: 30, t: 60 });
  assert.deepEqual(gaugeOpts({ ...GAUGE_DEF, t: 30 }), { w: 50, s: 50, v: "", vg: 0, t: 30 });
  assert.equal(vocLabel(0), "중성");
  assert.equal(vocLabel(70), "여성 70%");
  assert.equal(vocSnap(-104), -100);
  assert.equal(vocSnap(26), 30);
});

test("기다림 예산 = 원본 하드 ×2", () => {
  assert.equal(hardMs("lyria"), 2_000_000);
  assert.equal(hardMs("voice"), 5_200_000);
  assert.equal(hardMs("voice-train"), 10_800_000);
});

test("보이스 학습 · 입히기 = 원본 페이로드", () => {
  assert.deepEqual(trainPayload("  내 목소리  ", "a.m4a", { r2key: "up_src/x" }), { mode: "train", name: "내 목소리", consent: true, fname: "a.m4a", lbl: "내 목소리", r2key: "up_src/x" });
  assert.deepEqual(trainPayload("", "a.mp3", { fileB64: "data:x" }), { mode: "train", name: "", consent: true, fname: "a.mp3", lbl: "보이스 학습", fileB64: "data:x" });
  assert.equal(trainPayload("가".repeat(40), "f", { r2key: "k" }).name.length, 24);
  assert.deepEqual(applyPayload("s1", "v1"), { mode: "apply", src: "s1", vid: "v1", lbl: "보이스" });
});

test("학습 끝 = model_url + 발사 뒤 시각만", () => {
  const t = Date.parse("2026-11-10T14:00:00Z");
  assert.equal(voiceDone({ model_url: "u", ts: "2026-11-10T14:05:00Z" }, t), true);
  assert.equal(voiceDone({ model_url: "u", ts: "2026-11-10T13:00:00Z" }, t), false, "옛 결과");
  assert.equal(voiceDone({ ts: "2026-11-10T14:05:00Z" }, t), false);
  assert.equal(voiceDone(null, t), false);
});

test("죽은 키 판정 · SPA HTML 거름 · 받기 프록시", () => {
  assert.equal(deadKey("업로드 키가 만료됐어"), true);
  assert.equal(deadKey("서버 오류 503"), false);
  assert.equal(notHtml("<!doctype html><html>"), false);
  assert.equal(notHtml('{"a":1}', "application/json"), true);
  assert.equal(notHtml("에러", "text/html; charset=utf-8"), false);
  assert.equal(dlSrc("https://pub.r2.dev/s.mp3"), "/api/dl?u=https%3A%2F%2Fpub.r2.dev%2Fs.mp3&n=src");
  assert.equal(dlSrc("/song_out/x/a.mp3"), "/song_out/x/a.mp3");
});
