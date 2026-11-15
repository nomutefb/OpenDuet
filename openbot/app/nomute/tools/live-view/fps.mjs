// 프레임 재기(브라우저 안 기록 = 트레이스) — 실제로 화면에 나간 프레임 · 반만 나간 것 · 빠진 것을 크롬이 적은 장부로 셈(rAF 카운터 아님 = 합성 스레드 움직임도 잡힘)
//   형 11-16 「이제 너가 로컬에서 하면 프레임수도 알아서 재야하고 … 항상 60으로」 · 잣대 · 셈 = ./frames.mjs
// 쓰기: node tools/live-view/fps.mjs '[{"name":"홈 넘김","hash":"#/","wait":6000,"js":"document.querySelector(\".nm-topswap-chev.r\").click()","ms":1500}]'
//   일거리 칸 = name · hash(또는 url) · w · h · wait(뜨기 기다림 ms) · js(잴 동안 돌릴 것 · 누르기 등) · ms(재는 길이 · 기본 2000)
//   NM_CDP=http://127.0.0.1:9272 = 떠 있는 브라우저에 붙어서 잼(맥 실제 화면 · 그래픽 장치 있음) · NM_TAB=<주소 일부> = 그 탭에서(없으면 새 탭 · 끝나면 닫음)
//     ⚠ 가려진 탭 · 뒤에 있는 탭은 크롬이 아예 안 그림 → 그 탭이 화면에 보여야 숫자가 나옴(프레임 0 이면 이것부터 의심)
//   NM_KEEP=1 = 트레이스 원본을 $NM_OUT/<name>.trace.json 으로(chrome://tracing · ui.perfetto.dev 에서 열림)
//   --self = 도구 자체 시험(60 으로 도는 작은 화면 · 일부러 막는 화면)
// ⚠ 클라우드 상자 = 그래픽 장치 없음 → 여기 숫자는 「도구가 도는지」·전후 비교용 · 진짜 60 판정은 맥에서(NM_CDP)
import fs from 'node:fs'; import path from 'node:path';
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { gapStats, line, PASS } from './frames.mjs';
const OUT = process.env.NM_OUT || path.join(process.env.TMPDIR || '/tmp', 'nm-live-view'); fs.mkdirSync(OUT, { recursive: true });
const base = 'http://127.0.0.1:8899/garden-app/', CDP = process.env.NM_CDP || '', self = process.argv[2] === '--self';
const demo = (jank) => 'data:text/html,' + encodeURIComponent(`<body style="margin:0;background:#111"><div id="b" style="width:60px;height:60px;background:#cf4;border-radius:12px"></div><script>b.animate([{transform:'translateX(0)'},{transform:'translateX(300px)'}],{duration:1500,iterations:Infinity,direction:'alternate',easing:'ease-in-out'});${jank ? "setInterval(()=>{const e=performance.now()+70;while(performance.now()<e);b.style.width=(60+Math.random())+'px'},200);b.animate([{marginTop:'0px'},{marginTop:'200px'}],{duration:1500,iterations:Infinity,direction:'alternate'});" : ''}</script>`);
const jobs = self ? [{ name: '자체 시험 · 매끈', url: demo(false), wait: 600, ms: 2000 }, { name: '자체 시험 · 일부러 막음', url: demo(true), wait: 600, ms: 2000 }] : JSON.parse(process.argv[2] || '[]');
if (!jobs.length) { console.log("쓰기: node tools/live-view/fps.mjs '[{\"name\":…,\"hash\":\"#/\",\"js\":…,\"ms\":1500}]' | --self"); process.exit(1); }
const CATS = ['disabled-by-default-devtools.timeline.frame', 'devtools.timeline', 'benchmark', 'cc', 'blink.user_timing'];
const br = CDP ? await chromium.connectOverCDP(CDP) : await chromium.launch();
for (const j of jobs) {
  const phone = (j.w || 412) < 700; let ctx, pg, mine = true;
  if (CDP) { ctx = br.contexts()[0]; pg = process.env.NM_TAB ? ctx.pages().find((p) => p.url().includes(process.env.NM_TAB)) : null; if (pg) mine = false; else pg = await ctx.newPage(); }
  else { ctx = await br.newContext({ viewport: { width: j.w || 412, height: j.h || 892 }, deviceScaleFactor: phone ? 2 : 1, hasTouch: phone, isMobile: phone, colorScheme: 'dark', serviceWorkers: 'block' }); pg = await ctx.newPage(); }
  if (mine) await pg.goto(j.url || base + (j.hash || '#/'), { waitUntil: 'load' });
  await pg.waitForTimeout(j.wait ?? 5000);
  const hidden = await pg.evaluate(() => document.visibilityState !== 'visible');
  await br.startTracing(pg, { categories: CATS });
  await pg.evaluate(() => performance.mark('nm-fps-a'));
  let out = ''; if (j.js) { try { out = await pg.evaluate(j.js); } catch (e) { out = 'js오류 ' + String(e).slice(0, 120); } }
  await pg.waitForTimeout(j.ms || 2000);
  await pg.evaluate(() => performance.mark('nm-fps-b'));
  const buf = await br.stopTracing(); if (process.env.NM_KEEP) fs.writeFileSync(path.join(OUT, j.name.replace(/[^\w가-힣-]+/g, '_') + '.trace.json'), buf);
  const tr = JSON.parse(buf.toString()), ev = tr.traceEvents || tr;
  const a = ev.find((e) => e.name === 'nm-fps-a'), b = ev.find((e) => e.name === 'nm-fps-b');
  if (!a || !b) { console.log(j.name, '| 표식을 못 찾음(트레이스가 이 탭을 못 담음)'); if (mine) await (CDP ? pg.close() : ctx.close()); continue; }
  const inWin = (e) => e.pid === a.pid && e.ts >= a.ts && e.ts <= b.ts;   // 이 탭 렌더러 · 잰 구간만
  const draws = ev.filter((e) => e.name === 'DrawFrame' && inWin(e)).map((e) => e.ts / 1000);
  const seen = new Set(), st = {}; let hit = 0;
  for (const e of ev) { const fr = e.name === 'PipelineReporter' && e.args && e.args.frame_reporter; if (!fr || !fr.state || !inWin(e)) continue; const k = String(fr.frame_sequence ?? e.id ?? e.ts); if (seen.has(k)) continue; seen.add(k); const s = fr.state.replace('STATE_', ''); st[s] = (st[s] || 0) + 1; if (s === 'DROPPED' && fr.affects_smoothness) hit++; }
  const g = gapStats(draws), want = (st.PRESENTED_ALL || 0) + (st.PRESENTED_PARTIAL || 0) + (st.DROPPED || 0);
  const whole = want ? (st.PRESENTED_ALL || 0) / want : 1;   // 온전히 나간 비율 — 합성 스레드만 그리고 메인이 못 따라온 프레임(반만 나감)은 간격으로는 안 보임
  console.log(`${j.name} | ${line(g, a.ts / 1000)}\n   프레임 장부 ${whole >= PASS ? '✓' : '✗'} 온전히 나감 ${(whole * 100).toFixed(1)}%: 다 나감 ${st.PRESENTED_ALL || 0} · 반만 나감 ${st.PRESENTED_PARTIAL || 0} · 빠짐 ${st.DROPPED || 0}(부드러움에 영향 ${hit}) · 그릴 것 없음 ${st.NO_UPDATE_DESIRED || 0}${want ? ` · 빠진 비율 ${((st.DROPPED || 0) / want * 100).toFixed(1)}%` : ''}${hidden ? '\n   ⚠ 이 탭이 가려져 있음(visibilityState ≠ visible) — 숫자를 믿지 말 것' : ''}${out ? '\n   js → ' + String(out).slice(0, 200) : ''}`);
  if (mine) await (CDP ? pg.close() : ctx.close());
}
if (CDP) process.exit(0); else await br.close();
