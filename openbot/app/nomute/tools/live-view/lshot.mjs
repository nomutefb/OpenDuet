import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
const S = process.env.NM_OUT || path.join(process.env.TMPDIR || '/tmp', 'nm-live-view'), out = path.join(S, process.argv[2]), mode = process.argv[3] || 'light'; fs.mkdirSync(out, { recursive: true });
const routes = (process.argv[4] || ',group/all,rooms,drawer,settings,sched,botdesk,meetlog,story,sns,chan,feed,tokens,newsed,ask,edkw,edsnsacc,edlock,status,edtool,edvid').split(',');
const br = await chromium.launch();
for (const r of routes) {
  const ctx = await br.newContext({ viewport: { width: 412, height: 892 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true, colorScheme: mode, serviceWorkers: 'block', reducedMotion: 'reduce' });
  await ctx.addInitScript((m) => { try { localStorage.setItem('openduet-theme', m); } catch {} }, mode);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(String(e).slice(0, 100)));
  await pg.goto('http://127.0.0.1:8899/office-app/#/' + r); await pg.waitForTimeout(7500);
  const dark = await pg.evaluate(() => document.documentElement.classList.contains('dark'));
  await pg.screenshot({ path: path.join(out, (r || 'home').replace('/', '_') + '.png') });
  console.log((r || 'home').padEnd(10), dark ? '어둡게' : '밝게', errs.length ? '오류 ' + errs[0] : '');
  await ctx.close();
}
await br.close();
