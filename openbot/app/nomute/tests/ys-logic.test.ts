import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { YT_RE, OPTS, optsPick, vidOf, durTxt, https } from "../ui/ys-logic.ts";

// 서버(functions/api/ys.js) 정본과 같은 값인지 — 정원 「유튜브」 서랍(team-4 · 깃 11-10)
test("유튜브 주소 = 서버 YT_RE 와 같은 판정", () => {
  for (const ok of ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "https://youtu.be/dQw4w9WgXcQ", "https://m.youtube.com/watch?feature=x&v=dQw4w9WgXcQ", "https://www.youtube.com/shorts/dQw4w9WgXcQ", "https://youtube.com/live/dQw4w9WgXcQ?si=1"])
    assert.ok(YT_RE.test(ok), ok);
  for (const bad of ["http://youtu.be/dQw4w9WgXcQ", "https://www.youtube.com/channel/UC123", "https://www.youtube.com/playlist?list=PL1", "https://vimeo.com/1", "https://youtu.be/short", ""])
    assert.ok(!YT_RE.test(bad), bad);
});

test("옵션 = 허용 값만 · 그 밖은 서버 기본(첫 값)", () => {
  const d = optsPick({});
  assert.deepEqual(d, { len: "60", ratio: "9:16", img: "codex", stt: "scribe", font: "pretendard", subbg: "on", grid: "4" });
  const o = optsPick({ len: "90", ratio: "16:9", img: "grok", stt: "nope", grid: "1" });
  assert.equal(o.len, "90"); assert.equal(o.ratio, "16:9"); assert.equal(o.img, "grok"); assert.equal(o.stt, "scribe"); assert.equal(o.grid, "1");
});

test("옵션 칸 = functions/api/ys.js OPTS 와 같은 값 · 같은 차례(첫 값 = 기본)", () => {
  let src = "";
  try { src = readFileSync(new URL("../../../../../editor/functions/api/ys.js", import.meta.url), "utf8"); } catch { /* editor 저장소가 옆에 없으면 건너뜀 */ }
  if (!src) return;
  for (const o of OPTS) {
    const m = src.match(new RegExp(`\\b${o.k}:\\s*\\[([^\\]]*)\\]`));
    assert.ok(m, "서버 OPTS 에 " + o.k + " 없음");
    const vals = [...m![1].matchAll(/'([^']*)'/g)].map((x) => x[1]);
    assert.deepEqual(o.vals.map(([v]) => v), vals, o.k);
  }
});

test("영상 id · 길이 · 주소 거름", () => {
  assert.equal(vidOf("https://youtu.be/dQw4w9WgXcQ?t=3"), "dQw4w9WgXcQ");
  assert.equal(vidOf("https://www.youtube.com/shorts/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(durTxt(61), "1:01"); assert.equal(durTxt(0), "");
  assert.ok(https("https://r2.example/v.mp4")); assert.ok(!https("javascript:alert(1)")); assert.ok(!https(undefined));
});
