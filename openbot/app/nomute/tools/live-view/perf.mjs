import fs from 'node:fs'; import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
const routes = process.argv[2].split(','); const W = +process.argv[3] || 412, H = +process.argv[4] || 892;
const br = await chromium.launch(); const rows = [];
for (const r of routes) {
  const ctx = await br.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: W < 700 ? 2 : 1, hasTouch: W < 700, isMobile: W < 700, colorScheme: 'dark', serviceWorkers: 'block' });
  const pg = await ctx.newPage(); const cdp = await ctx.newCDPSession(pg); await cdp.send('Performance.enable');
  let reqs = 0; pg.on('request', () => reqs++);
  const t0 = Date.now(); await pg.goto('http://127.0.0.1:8899/office-app/#/' + r, { waitUntil: 'load' }); await pg.waitForTimeout(7000);
  const get = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
  const a = await get(); const reqA = reqs; await pg.waitForTimeout(4000); const b = await get();
  const dom = await pg.evaluate(() => { const an = document.getAnimations().filter((x) => x.playState === 'running'); const inf = an.filter((x) => x.effect && x.effect.getComputedTiming().iterations === Infinity);
    const names = {}; for (const x of inf) { const n = (x.animationName || 'tr') + '@' + ((x.effect.target && String(x.effect.target.className).split(' ')[0]) || ''); names[n] = (names[n] || 0) + 1; }
    let bf = 0, nodes = 0; for (const e of document.querySelectorAll('body *')) { nodes++; const c = getComputedStyle(e); if ((c.backdropFilter && c.backdropFilter !== 'none') || (c.webkitBackdropFilter && c.webkitBackdropFilter !== 'none')) { const q = e.getBoundingClientRect(); if (q.width > 0 && q.height > 0 && c.visibility !== 'hidden') bf++; } }
    return { run: an.length, inf: inf.length, names: Object.entries(names).sort((p, q) => q[1] - p[1]).slice(0, 6).map(([k, v]) => k + '×' + v).join(' '), bf, nodes, canvas: [...document.querySelectorAll('canvas')].filter((c) => c.getBoundingClientRect().width > 0).map((c) => c.className || 'scene').join('+'), iframes: document.querySelectorAll('iframe').length }; });
  const ms = (k) => Math.round((b[k] - a[k]) * 1000 / 4);   // 1초당 ms
  rows.push({ r, task: ms('TaskDuration'), script: ms('ScriptDuration'), layout: ms('LayoutDuration'), style: ms('RecalcStyleDuration'), reqIdle: reqs - reqA, reqLoad: reqA, ...dom });
  console.log(r.padEnd(10), `일 ${String(ms('TaskDuration')).padStart(4)}ms/초 (글 ${ms('ScriptDuration')} · 배치 ${ms('LayoutDuration')} · 꼴 ${ms('RecalcStyleDuration')})`, `| 도는 움직임 ${dom.run}(끝없이 ${dom.inf})`, `| 흐림 ${dom.bf}`, `| 요소 ${dom.nodes}`, `| 그림판 ${dom.canvas}`, `| 틀 ${dom.iframes}`, `| 요청 처음 ${reqA} · 가만히 4초 ${reqs - reqA}`, dom.names ? '\n     ' + dom.names : '');
  await ctx.close();
}
fs.writeFileSync((process.env.NM_OUT || process.env.TMPDIR || '/tmp') + '/perf_' + W + '.json', JSON.stringify(rows)); await br.close();
