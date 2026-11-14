// 실제 자료로 앱 띄우기(읽기만) — 앱 = 여기서 빌드한 dist · 사무실 자료 = 기계 문(/api/office/m/… · 열쇠는 프록시가 붙임) · 글꼴 = 실제 사이트 · 그 밖 = editor 저장소 viewer 파일
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { execFile } from 'node:child_process'; import crypto from 'node:crypto';
const PORT = +process.argv[2] || 8899, S = path.dirname(new URL(import.meta.url).pathname);
const APP = path.resolve(S, '../..'), ROOT = process.env.NM_EDITOR || '/home/user/editor';   // APP = 이 앱 폴더 · NM_EDITOR = editor 저장소(채널·SNS 자료 파일 · 없어도 사무실 화면은 뜸)
const DIST = process.env.NM_DIST || path.join(APP, 'dist'), VIEW = path.join(ROOT, 'viewer'), SITE = 'https://edit.nomute.kr';
const OUT = process.env.NM_OUT || path.join(process.env.TMPDIR || '/tmp', 'nm-live-view'); fs.mkdirSync(path.join(OUT, 'cache'), { recursive: true });
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.otf':'font/otf', '.png':'image/png', '.webp':'image/webp', '.jpg':'image/jpeg', '.ico':'image/x-icon', '.mp4':'video/mp4', '.webmanifest':'application/manifest+json' };
const log = fs.createWriteStream(path.join(OUT, 'req.log'), { flags: 'a' });
const mem = new Map();
function curl(url, ttl = 600000) {
  const hit = mem.get(url); if (hit && Date.now() - hit.at < ttl) return Promise.resolve(hit);
  const out = path.join(OUT, 'cache', crypto.createHash('md5').update(url).digest('hex'));
  return new Promise((res) => execFile('curl', ['-sS', '-m', '70', '-o', out, '-w', '%{http_code}\t%{content_type}', url], { maxBuffer: 1e6 }, (err, so) => {
    const [code, ct] = String(so || '').split('\t'); let body = Buffer.alloc(0); try { body = fs.readFileSync(out); } catch {}
    const r = { at: Date.now(), code: err ? 502 : +code || 502, ct: ct || 'application/octet-stream', body }; if (r.code === 200) mem.set(url, r); res(r);
  }));
}
const file = (res, f, code = 200) => fs.readFile(f, (e, b) => { if (e) { res.writeHead(404, { 'content-type': 'application/json' }); res.end('{"ok":false,"error":"not_found"}'); return; } res.writeHead(code, { 'content-type': mime[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' }); res.end(b); });
http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x'), p = decodeURIComponent(u.pathname);
  const done = (tag) => log.write(`${req.method} ${u.pathname}${u.search} → ${tag}\n`);
  try {
    if (p.startsWith('/office-app')) { let rel = p.slice('/office-app'.length) || '/'; if (rel === '/') rel = '/index.html'; const f = path.join(DIST, rel); done('dist'); return file(res, fs.existsSync(f) && fs.statSync(f).isFile() ? f : path.join(DIST, 'index.html')); }
    if (p.startsWith('/api/office/')) {
      if (req.method !== 'GET') { done('막음(읽기만)'); res.writeHead(403, { 'content-type': 'application/json' }); return res.end('{"ok":false,"error":"read_only","why":"로컬 확인 = 읽기만"}'); }
      const rest = p.slice('/api/office/'.length);
      if (/(^|\/)(wait|watch|beats|stream)(\/|$)/.test(rest)) { done('긴 기다림 = 빈 답'); return setTimeout(() => { res.writeHead(200, { 'content-type': 'application/json' }); res.end('{"ok":true,"messages":[],"events":[]}'); }, 25000); }
      const r = await curl(`${SITE}/api/office/m/${rest}${u.search}`); done('기계 문 ' + r.code);
      let body = r.body; if (process.env.NM_AS_OWNER && rest === 'schedule' && r.code === 200) { try { const j = JSON.parse(body); j.can_set = true; if (!j.runners) j.runners = { groups: [], forks: [], jobs: [] }; body = Buffer.from(JSON.stringify(j)); } catch {} }   // 화면 확인용 = 형 자리처럼 보이게(쓰기는 여전히 막힘)
      res.writeHead(r.code, { 'content-type': r.ct, 'cache-control': 'no-store' }); return res.end(body);
    }
    if (p.startsWith('/assets/')) { const r = await curl(SITE + p + u.search, 864e5); done('실제 사이트 ' + r.code); res.writeHead(r.code, { 'content-type': r.ct }); return res.end(r.body); }
    if (p === '/api/trends') { const f = u.searchParams.get('f'); const m = { xtop: ROOT + '/data/x_top10/latest.json', brief: VIEW + '/sns_brief.json', overlap: VIEW + '/overlap_latest.json', images: VIEW + '/rss_images.json' }; done('파일'); return file(res, f ? (m[f] || '/nonexistent') : VIEW + '/sns_trends.json'); }
    if (p === '/api/chan') { const f = u.searchParams.get('f') || 'ig'; const m = { ig: 'insta_data.json', fb: 'fb_data.json', brief: 'chan_brief.json', th: 'threads_data.json' }; done('파일'); return file(res, path.join(VIEW, m[f] || 'nonexistent')); }
    if (p.startsWith('/api/')) { done('없음'); res.writeHead(404, { 'content-type': 'application/json' }); return res.end('{"ok":false,"error":"local_none"}'); }
    const f = path.join(VIEW, p.endsWith('/') ? p + 'index.html' : p); done('viewer'); return file(res, f);
  } catch (e) { done('오류 ' + e.message); res.writeHead(500); res.end('{}'); }
}).listen(PORT, '127.0.0.1', () => console.log('listening', PORT));
