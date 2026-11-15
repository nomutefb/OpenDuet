import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
const br = await chromium.launch();
for (const r of process.argv[2].split(',')) {
  const ctx = await br.newContext({ viewport: { width: 412, height: 892 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, colorScheme: 'dark', serviceWorkers: 'block' });
  const pg = await ctx.newPage(); let on = false; const m = {}; const st = {};
  pg.on('request', (q) => { if (on) { const k = q.url().replace('http://127.0.0.1:8899', '').replace(/[?].*/, '').replace(/\/[0-9a-f-]{16,}/g, '/…').slice(0, 60); m[k] = (m[k] || 0) + 1; } });
  pg.on('response', (q) => { if (on) { const k = q.url().replace('http://127.0.0.1:8899', '').replace(/[?].*/, '').slice(0, 60); st[k] = q.status(); } });
  await pg.goto('http://127.0.0.1:8899/garden-app/#/' + r); await pg.waitForTimeout(9000); on = true; await pg.waitForTimeout(6000);
  console.log('▶', r || '홈', '가만히 6초 요청', Object.values(m).reduce((a, b) => a + b, 0)); for (const [k, v] of Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log('   ', v, k, st[k] || '');
  await ctx.close();
}
await br.close();
