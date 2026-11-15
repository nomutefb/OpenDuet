// 프레임 시각 줄(ms) → 간격 통계 · 60 잣대 판정 — fps.mjs(브라우저 트레이스) · vfps.mjs(영상)가 같이 씀
//   움직이는 구간만 셈: 간격이 idle(100ms) 넘으면 = 멈춰 있던 것(화면이 가만하면 프레임이 안 나오는 게 정상) → 빼고 셈
//   60 잣대 = 간격 20.8ms(16.7 × 1.25) 안 · 움직인 프레임의 95% 넘게 지키면 ✓(크로미움 rendering benchmark 「mostly_smooth = 95% 가 60fps」 꼴)
export const F60 = 1000 / 60, LIMIT = F60 * 1.25, IDLE = 100, PASS = 0.95;
export function gapStats(times, { idle = IDLE, limit = LIMIT } = {}) {
  const t = [...times].sort((a, b) => a - b), gaps = t.slice(1).map((x, i) => x - t[i]);
  const act = gaps.filter((g) => g > 0.5 && g <= idle), s = [...act].sort((a, b) => a - b);
  if (!s.length) return { frames: t.length, moving: 0 };
  const q = (p) => s[Math.min(s.length - 1, Math.floor(s.length * p))], sum = act.reduce((a, b) => a + b, 0), over = act.filter((g) => g > limit);
  let worstAt = 0, worst = 0; gaps.forEach((g, i) => { if (g <= idle && g > worst) { worst = g; worstAt = t[i]; } });
  return { frames: t.length, moving: act.length, movingMs: sum, fps: act.length / (sum / 1000), p50: q(0.5), p95: q(0.95), max: s[s.length - 1], over: over.length, keep: 1 - over.length / act.length, hz: Math.round(1000 / q(0.5)), worstAt };
}
const r1 = (n) => (Math.round(n * 10) / 10).toFixed(1);
export function line(g, t0 = 0) {
  if (!g.moving) return `움직인 프레임 0(프레임 ${g.frames}) — 그 사이 화면이 안 바뀜 · 판정 없음`;
  return `60 잣대 ${g.keep >= PASS ? '✓' : '✗'} 지킴 ${r1(g.keep * 100)}% | 움직인 구간 ${r1(g.movingMs / 1000)}초 · 평균 ${r1(g.fps)}프레임/초 | 간격 중앙 ${r1(g.p50)} · p95 ${r1(g.p95)} · 최대 ${r1(g.max)}ms(${r1((g.worstAt - t0) / 1000)}초 지점) | 20.8ms 넘김 ${g.over}/${g.moving}회 | 박자 ≈ ${g.hz}Hz`;
}
