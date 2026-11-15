import fs from 'node:fs'; import path from 'node:path';
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
const S = process.env.NM_OUT || path.join(process.env.TMPDIR || '/tmp', 'nm-live-view'); fs.mkdirSync(S, { recursive: true }); const base = 'http://127.0.0.1:8899/garden-app/';
const jobs = JSON.parse(process.argv[2]);   // [{name, hash, w, h, wait, js}]
const br = await chromium.launch();
for (const j of jobs) {
  const phone = (j.w || 412) < 700;
  const ctx = await br.newContext({ viewport: { width: j.w || 412, height: j.h || 892 }, deviceScaleFactor: phone ? 2 : 1, hasTouch: phone, isMobile: phone, colorScheme: 'dark', serviceWorkers: 'block' });
  const pg = await ctx.newPage(); const errs = [], bad = [];
  pg.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
  pg.on('response', (r) => { if (r.status() >= 400 && !/favicon|\.map$/.test(r.url())) bad.push(r.status() + ' ' + r.url().replace('http://127.0.0.1:8899', '').slice(0, 70)); });
  await pg.goto(base + (j.hash || '#/'), { waitUntil: 'load' }); await pg.waitForTimeout(j.wait || 5000);
  let out = ''; if (j.js) { try { out = await pg.evaluate(j.js); } catch (e) { out = 'js오류 ' + String(e).slice(0, 120); } await pg.waitForTimeout(j.after || 1200); }
  await pg.screenshot({ path: path.join(S, j.name + '.png'), fullPage: !!j.full });
  console.log(j.name, '| 오류', errs.length, errs[0] || '', '| 실패 요청', bad.length, [...new Set(bad)].slice(0, 5).join(' ; '), out ? '| ' + String(out).slice(0, 300) : '');
  await ctx.close();
}
await br.close();
