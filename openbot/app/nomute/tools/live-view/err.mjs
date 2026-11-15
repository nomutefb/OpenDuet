import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 412, height: 892 } });
pg.on('pageerror', (e) => console.log('오류:', String(e.stack || e).slice(0, 500))); pg.on('console', (m) => { if (m.type() === 'error') console.log('콘솔:', m.text().slice(0, 200)); });
await pg.goto('http://127.0.0.1:8899/garden-app/#/sched'); await pg.waitForTimeout(6000);
console.log('요소', await pg.evaluate(() => document.querySelectorAll('body *').length), '| 글', await pg.evaluate(() => document.body.innerText.slice(0, 120)));
await br.close();
