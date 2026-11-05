// 올리는 순간 파형(형 11-05 09:41) — 순수 셈만(그림·풀기는 브라우저) · 같은 셈 = editor tests/office_wave.test.mjs
import assert from "node:assert/strict";
import { test } from "node:test";
import { headLine, MEDIA_RE, mmss, mono, peaks, stats, tickStep } from "../shim/wave.ts";

test("숫자 = 길이·최고·평균·조용한 몫·터지는 자리(1초 창 · 3초 넘게 떨어진 큰 셋 · 시각 순)", () => {
  const sr = 100, x = new Float32Array(sr * 20);
  for (const [t, a] of [[5, 0.9], [12, 0.5], [13, 0.4], [17, 0.3]]) for (let i = 0; i < sr; i++) x[t * sr + i] = i % 2 ? a : -a;
  const st = stats(x, sr);
  assert.equal(st.dur, 20);
  assert.equal(st.peak_db, -0.9);
  assert.deepEqual(st.loud, ["0:05", "0:12", "0:17"]);
  assert.equal(st.quiet_pct, 80);
  assert.match(headLine(st), /^길이 0:20 · 최고 -0\.9 dBFS · 평균 -\d+\.\d dB · 조용함 80% · 터지는 자리 0:05 · 0:12 · 0:17$/);
});

test("무음 = 터지는 자리 0 · 칸 최소·최대 · 채널 평균 · 눈금 · 꼴", () => {
  assert.equal(headLine(stats(new Float32Array(300), 100)), "길이 0:03 · 최고 -∞ dBFS · 평균 -∞ dB · 조용함 100%");
  assert.deepEqual(peaks(Float32Array.from([0.1, -0.5, 0.3, 0.2]), 2).map(([a, b]) => [+a.toFixed(1), +b.toFixed(1)]), [[-0.5, 0.1], [0, 0.3]]);
  assert.deepEqual([...mono([Float32Array.from([1, 0]), Float32Array.from([0, 1])])], [0.5, 0.5]);
  assert.equal(tickStep(42), 5);
  assert.equal(mmss(3725), "1:02:05");
  assert.ok(MEDIA_RE.test("형.MP4") && MEDIA_RE.test("녹음.m4a") && !MEDIA_RE.test("사진.png"));
});
