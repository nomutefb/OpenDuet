// 영상 프레임 재기 — 형이 보낸 화면 녹화를 60 으로 풀어, 실제로 그림이 바뀐 프레임만 세서 간격을 봄(형 11-16 「내가 영상 보내면 그것도 알아서 재야해 항상 60으로」)
//   셈: ffmpeg 로 60프레임/초로 고르게 편 뒤 앞 프레임과 같은 그림은 뺌(mpdecimate) → 남은 프레임 시각의 간격 = 움직임의 실제 박자 · 잣대 · 통계 = ./frames.mjs(브라우저 재기와 같은 셈)
// 쓰기: node tools/live-view/vfps.mjs <영상> [w:h:x:y]      둘째 칸 = 볼 자리만 잘라서(움직이는 부품만 · 시계 · 깜빡이는 점 빼기)
//   --self = 도구 자체 시험(60 · 30 · 멈칫 영상을 만들어 잼)
// 읽는 법 · 한계:
//   · 녹화 자체가 60 밑이면(폰 30 녹화 등) 그 위는 못 봄 → 「녹화 N프레임」 줄 먼저 볼 것
//   · 화면이 가만한 동안은 프레임이 안 바뀌는 게 정상 → 100ms 넘는 멈춤은 「쉼」으로 빼고 셈(움직이다 100ms 넘게 선 것도 쉼으로 들어감 = 「긴 멈춤」 줄에 따로 적음)
//   · 압축이 센 녹화는 같은 그림도 조금씩 달라 「바뀜」으로 셀 수 있음 → 숫자가 이상하면 자리 잘라서 다시
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync, spawnSync } from 'node:child_process';
import { gapStats, line } from './frames.mjs';
const OUT = process.env.NM_OUT || path.join(process.env.TMPDIR || '/tmp', 'nm-live-view'); fs.mkdirSync(OUT, { recursive: true });
const r1 = (n) => (Math.round(n * 10) / 10).toFixed(1);
function measure(file, crop) {
  const info = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=avg_frame_rate,width,height,nb_frames,duration', '-of', 'json', file]).toString()).streams[0];
  const src = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'frame=best_effort_timestamp_time', '-of', 'csv=p=0', file], { maxBuffer: 64e6 }).toString().split(/\s+/).filter(Boolean).map(parseFloat).filter(Number.isFinite).map((s) => s * 1000);   // 첫 줄 끝 쉼표 · 끝 빈 줄 조심(빈 글 = 0 으로 읽힘)
  const sg = gapStats(src, { idle: 1e9, limit: 1e9 }), [a, b] = String(info.avg_frame_rate).split('/').map(Number), avg = b ? a / b : a;
  const vf = `${crop ? 'crop=' + crop + ',' : ''}fps=60,mpdecimate,showinfo`;
  const run = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-vf', vf, '-an', '-f', 'null', '-'], { maxBuffer: 256e6 });
  const kept = [...String(run.stderr).matchAll(/pts_time:\s*([\d.]+)/g)].map((m) => +m[1] * 1000);
  const g = gapStats(kept), ks = [...kept].sort((x, y) => x - y);
  const stops = ks.slice(1).map((t, i) => [t - ks[i], ks[i]]).filter(([d]) => d > 100 && d < 1500).sort((x, y) => y[0] - x[0]).slice(0, 3);
  console.log(`${path.basename(file)} | 녹화 ${info.width}×${info.height} · ${r1((src[src.length - 1] - src[0]) / 1000)}초 · ${src.length}프레임 · 평균 ${r1(avg)}프레임/초${sg.moving && sg.p95 > sg.p50 * 1.5 ? ' · 간격 들쭉날쭉(중앙 ' + r1(sg.p50) + ' · p95 ' + r1(sg.p95) + 'ms)' : ''}${crop ? ' · 자른 자리 ' + crop : ''}`);
  if (avg < 50) console.log(`   ⚠ 녹화 자체가 ${r1(avg)}프레임 — 60 판정은 못 함(이 녹화가 보여 줄 수 있는 위 = ${r1(avg)})`);
  console.log('   ' + line(g, ks[0] || 0));
  if (stops.length) console.log('   긴 멈춤(0.1~1.5초 · 움직이다 섰는지 그냥 쉰 건지는 영상으로): ' + stops.map(([d, t]) => `${r1((t - ks[0]) / 1000)}초 지점 ${Math.round(d)}ms`).join(' · '));
  return g;
}
if (process.argv[2] === '--self') {
  const mk = (name, x) => { const f = path.join(OUT, name); execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=black:s=320x180:r=60:d=2', '-f', 'lavfi', '-i', 'color=c=lime:s=24x24:r=60:d=2', '-filter_complex', `[0][1]overlay=x='${x}':y=78`, '-pix_fmt', 'yuv420p', '-crf', '18', f]); return f; };
  const a = measure(mk('vfps-self-60.mp4', 't*130')), b = measure(mk('vfps-self-30.mp4', 'floor(t*30)/30*130')), c = measure(mk('vfps-self-stall.mp4', 'if(between(t,1,1.07),130,t*130)'));
  const ok = a.keep >= 0.95 && Math.abs(a.fps - 60) < 2 && b.keep < 0.2 && Math.abs(b.fps - 30) < 2 && c.over >= 1 && c.max > 60;
  console.log(ok ? '자체 시험 ✓ (60 = ✓ · 30 = ✗ · 멈칫 = 넘김 잡힘)' : '자체 시험 ✗ — 셈이 기대와 다름'); process.exit(ok ? 0 : 1);
}
if (!process.argv[2]) { console.log('쓰기: node tools/live-view/vfps.mjs <영상> [w:h:x:y] | --self'); process.exit(1); }
measure(process.argv[2], process.argv[3]);
