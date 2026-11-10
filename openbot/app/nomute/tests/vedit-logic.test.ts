import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { SELS, optsPick, buildOpts, hasAction, fileWhy, partsOf, landed, absUrl, dlHref, PART } from "../ui/vedit-logic.ts";

// 정원 「영상 편집」 판 1(team-4 · 깃 11-10) — 원본 edit.html buildOpts · functions/api/edit.js 와 같은 값인지
test("기본 = 자막 켬(번역 같이 · 문어 · 깔끔 · 군말 빼기) · 소리 고르기 켬 · 나머지 안 보냄", () => {
  const o = buildOpts(optsPick({}));
  assert.deepEqual(o, { burn: true, lang: "dual", tone: "lit", style: "clean", filler: true, shtype: "none", aud_norm: true });
  assert.ok(hasAction(o));
});

test("자르기 · 비율 · 해상도 · 자막 끔", () => {
  const o = buildOpts({ subs: "off", cut: "hard", take: "on", bgm: "on", vid_ar: "9:16", vid_fit: "blur", vid_res: "1080", aud_norm: "off" });
  assert.deepEqual(o, { cut: true, cutlv: "hard", take: true, bgm: true, vid_ar: "9:16", vid_fit: "blur", vid_res: "1080", aud_norm: false });
  assert.ok(!("burn" in o));
  assert.ok(!hasAction(buildOpts({ subs: "off", aud_norm: "off" })), "할 일 0 = 서버 400 앞에서 막음");
  assert.equal(buildOpts({ style: "box" }).shtype, "box");
});

test("고르는 값 = 서버 STR 표 안", () => {
  let src = "";
  try { src = readFileSync(new URL("../../../../../editor/functions/api/edit.js", import.meta.url), "utf8"); } catch { /* editor 저장소가 옆에 없으면 건너뜀 */ }
  if (!src) return;
  for (const k of ["lang", "tone", "style", "cutlv", "vid_ar", "vid_fit", "vid_res"]) {
    const m = src.match(new RegExp(`\\b${k}:\\s*\\[([^\\]]*)\\]`)); assert.ok(m, k);
    const allow = [...m![1].matchAll(/'([^']*)'/g)].map((x) => x[1]);
    const sel = SELS.find((s) => s.k === (k === "cutlv" ? "cut" : k))!;
    for (const [v] of sel.vals) if (!["src", "off"].includes(v) || allow.includes(v)) assert.ok(allow.includes(v), `${k}=${v}`);
  }
});

test("파일 거름 · 조각 · 끝 판정 · 주소", () => {
  assert.equal(fileWhy("a.mp4", 10), ""); assert.ok(fileWhy("a.png", 10)); assert.ok(fileWhy("a.mov", 3 * 1024 ** 3));
  assert.equal(partsOf(1), 1); assert.equal(partsOf(PART + 1), 2);
  const t0 = Date.now();
  assert.ok(!landed(null, t0)); assert.ok(!landed({ url: "x", xtr_wait: true }, t0));
  assert.ok(landed({ url: "x", ts: Math.floor(t0 / 1000) }, t0)); assert.ok(!landed({ url: "x", ts: Math.floor((t0 - 600e3) / 1000) }, t0), "앞 판 결과 = 아직");
  assert.ok(landed({ error: "boom" }, t0));
  assert.equal(absUrl("ly_out/a/subbed.mp4"), "/ly_out/a/subbed.mp4"); assert.equal(absUrl("https://r2/x.mp4"), "https://r2/x.mp4");
  assert.ok(dlHref("https://r2/x.mp4", "a.mp4").startsWith("/api/dl?u=https%3A%2F%2Fr2%2Fx.mp4&n=a.mp4"));
});
