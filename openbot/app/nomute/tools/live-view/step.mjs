// 움직임을 1/60초씩 넘겨 찍기 — 애니메이션을 멈춰 놓고 시간을 손으로 넘기며 프레임마다 위치 · 크기 · 투명도를 읽고 사진을 찍음
//   = 실시간 녹화가 아님 → 그래픽 장치 없는 클라우드 상자에서도 프레임이 정확 · 샘플 영상과 「곡선끼리」 대조하는 쪽(형 11-16 「샘플을 주면 최대한 이에 가깝게 구현할 수 있는 방법」)
// 쓰기: node tools/live-view/step.mjs '[{"name":"홈넘김","hash":"#/","wait":6000,"js":"document.querySelector(\".nm-topswap-chev.r\").click()","sel":".nm-topswap-pane[data-on=\"1\"]","shots":4}]'
//   일거리 칸 = name · hash(또는 url) · w · h · wait · js(움직임을 시작시키는 것 · 누르기 등) · sel(따라갈 요소 · 없으면 첫 애니메이션 대상) · fps(기본 60)
//             shots(몇 프레임마다 사진 · 0 = 안 찍음) · clip([x,y,w,h]) · ref(견줄 곡선 csv 「t_ms,값」) · col(견줄 칸 x|y|w|h|op · 기본 x)
//   나오는 것 = 잡힌 애니메이션(길이 · 늦춤 · 이징) · 프레임 표 · $NM_OUT/<name>.csv(t_ms,x,y,w,h,op) · 사진 <name>-fNN.png · ref 가 있으면 프레임별 차이(최대 · 평균)
//   --self = 도구 자체 시험
// 한계: 멈추고 넘길 수 있는 건 선언형 움직임(CSS transition · CSS animation · element.animate)만 — 손가락을 따라오는 끌기 · 그림판 · 3D 장면처럼 코드가 매 프레임 셈하는 건 안 잡힘(잡힌 애니메이션 0 으로 나옴)
import fs from 'node:fs'; import path from 'node:path';
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
const OUT = process.env.NM_OUT || path.join(process.env.TMPDIR || '/tmp', 'nm-live-view'); fs.mkdirSync(OUT, { recursive: true });
const base = 'http://127.0.0.1:8899/garden-app/', self = process.argv[2] === '--self';
const demo = 'data:text/html,' + encodeURIComponent(`<body style="margin:0;background:#111"><div id="b" style="position:absolute;left:0;top:20px;width:60px;height:60px;background:#cf4;border-radius:12px"></div><script>window.go=()=>b.animate([{transform:'translateX(0)',opacity:.2},{transform:'translateX(300px)',opacity:1}],{duration:300,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'})</script>`);
const jobs = self ? [{ name: 'step-self', url: demo, wait: 300, js: 'go()', sel: '#b', shots: 6, clip: [0, 0, 412, 110] }] : JSON.parse(process.argv[2] || '[]');
if (!jobs.length) { console.log("쓰기: node tools/live-view/step.mjs '[{\"name\":…,\"hash\":\"#/\",\"js\":…,\"sel\":…}]' | --self"); process.exit(1); }
const safe = (n) => n.replace(/[^\w가-힣-]+/g, '_'), r1 = (n) => Math.round(n * 10) / 10;
const br = await chromium.launch();
for (const j of jobs) {
  const phone = (j.w || 412) < 700, fps = j.fps || 60;
  const ctx = await br.newContext({ viewport: { width: j.w || 412, height: j.h || 892 }, deviceScaleFactor: phone ? 2 : 1, hasTouch: phone, isMobile: phone, colorScheme: 'dark', serviceWorkers: 'block' });
  const pg = await ctx.newPage(); await pg.goto(j.url || base + (j.hash || '#/'), { waitUntil: 'load' }); await pg.waitForTimeout(j.wait ?? 5000);
  // 시작시키고 그 자리에서 멈춤(같은 일 안 = 한 프레임도 안 흘림) · 그 전부터 돌던 것(끝없이 도는 장식)은 빼고 새로 생긴 것만
  const got = await pg.evaluate(({ js, sel }) => {
    const before = new Set(document.getAnimations()); let err = '';
    try { (0, eval)(js); } catch (e) { err = String(e).slice(0, 120); }
    const as = document.getAnimations().filter((a) => !before.has(a) && a.effect); as.forEach((a) => a.pause()); window.__nmStep = as;
    const name = (el) => (el ? el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length ? '.' + [...el.classList].slice(0, 3).join('.') : '') : '?');
    window.__nmEl = (sel && document.querySelector(sel)) || (as[0] && as[0].effect.target) || null;
    return { err, track: name(window.__nmEl), list: as.map((a) => { const t = a.effect.getTiming(), k = a.effect.getKeyframes ? a.effect.getKeyframes() : []; return { on: name(a.effect.target), kind: a.constructor.name, dur: +t.duration || 0, delay: t.delay || 0, easing: (k[0] && k[0].easing !== 'linear' ? k[0].easing : t.easing), props: [...new Set(k.flatMap((x) => Object.keys(x)))].filter((x) => !['offset', 'easing', 'composite', 'computedOffset'].includes(x)).join(',') }; }) };
  }, { js: j.js || '', sel: j.sel || '' });
  console.log(`${j.name} | 잡힌 애니메이션 ${got.list.length}${got.err ? ' · js오류 ' + got.err : ''} · 따라가는 요소 = ${got.track}`);
  for (const a of got.list) console.log(`   ${a.on} · ${a.kind} · ${a.dur}ms${a.delay ? ' +늦춤 ' + a.delay : ''} · ${a.easing} · ${a.props}`);
  if (!got.list.length) { console.log('   → 멈추고 넘길 움직임이 없음(코드가 매 프레임 셈하는 움직임이거나 js 가 아무것도 안 일으킴)'); await ctx.close(); continue; }
  const total = Math.max(...got.list.map((a) => a.delay + a.dur)), n = Math.ceil(total / (1000 / fps)), rows = [];
  for (let f = 0; f <= n; f++) {
    const t = Math.min(total, f * 1000 / fps);
    const v = await pg.evaluate((t) => { window.__nmStep.forEach((a) => { a.currentTime = t; }); const el = window.__nmEl; if (!el) return null; const b = el.getBoundingClientRect(); return [b.left, b.top, b.width, b.height, +getComputedStyle(el).opacity]; }, t);
    rows.push([r1(t), ...(v || [0, 0, 0, 0, 0]).map((x, i) => (i === 4 ? Math.round(x * 1000) / 1000 : r1(x)))]);
    if (j.shots && f % j.shots === 0) await pg.screenshot({ path: path.join(OUT, `${safe(j.name)}-f${String(f).padStart(3, '0')}.png`), ...(j.clip ? { clip: { x: j.clip[0], y: j.clip[1], width: j.clip[2], height: j.clip[3] } } : {}) });
  }
  await pg.evaluate(() => { window.__nmStep.forEach((a) => { try { a.finish(); } catch { /* 끝없는 것 */ } }); });
  fs.writeFileSync(path.join(OUT, safe(j.name) + '.csv'), 't_ms,x,y,w,h,op\n' + rows.map((r) => r.join(',')).join('\n') + '\n');
  const col = { x: 1, y: 2, w: 3, h: 4, op: 5 }[j.col || 'x'] || 1;
  console.log(`   ${n + 1}프레임(${fps}프레임/초 · ${r1(total)}ms) · ${j.col || 'x'} = ${rows.map((r) => r[col]).join(' ')}`);
  console.log(`   표 = ${path.join(OUT, safe(j.name) + '.csv')}${j.shots ? ' · 사진 = ' + safe(j.name) + '-fNNN.png' : ''}`);
  if (j.ref) {   // 견줄 곡선(샘플 영상에서 뽑은 것 등) = 「t_ms,값」 줄 · 같은 시각으로 맞춰(사이 값은 곧게 이음) 프레임별 차이
    const ref = fs.readFileSync(j.ref, 'utf8').split(/\r?\n/).map((l) => l.split(',').map(Number)).filter((r) => r.length >= 2 && r.every(Number.isFinite));
    const at = (t) => { if (t <= ref[0][0]) return ref[0][1]; for (let i = 1; i < ref.length; i++) if (t <= ref[i][0]) { const [t0, v0] = ref[i - 1], [t1, v1] = ref[i]; return v0 + (v1 - v0) * (t - t0) / (t1 - t0 || 1); } return ref[ref.length - 1][1]; };
    const d = rows.map((r) => Math.abs(r[col] - at(r[0]))), mx = Math.max(...d);
    console.log(`   견줌(${path.basename(j.ref)}) = 최대 차이 ${r1(mx)}(${rows[d.indexOf(mx)][0]}ms 지점) · 평균 ${r1(d.reduce((a, b) => a + b, 0) / d.length)}`);
  }
  await ctx.close();
}
await br.close();
