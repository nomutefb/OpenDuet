// @ts-nocheck
// 썸네일 생성기 엔진 · 붙여넣기·복사·다운로드·AI 생성 잡·확장 미리보기(리사이즈)
//   원본 = 에디터 viewer/thumb.html 2796~3300줄(origin/main c430e4c9f) — 줄 그대로 옮김 · 주석만 뺌(까닭·형 말은 원본 주석에 그대로)
//   바꾼 곳 = 화면 전역 let·var·표 const → S.<이름>(./state · 창 열 때마다 새로) · document·window·타이머 = ./rt(이 화면 뿌리 안으로 · 닫으면 다 걷음) · 함수는 그대로 내보내고 서로 가져옴
//   다시 맞출 땐 ../tools/codemod.mjs 로 원본 줄을 통째로 다시 뗌(손으로 고친 줄 0 · 원본 갈아 끼우는 함수 selApp·updateGoSpec = S 에 올림 · hoist())
import { S } from "./state";
import { Image, ResizeObserver, clearInterval, clearTimeout, document, fetch, requestAnimationFrame, setInterval, setTimeout, window } from "./rt";
import { CHECK_SVG, COPY_SVG, DOWNLOAD_SVG, ERASE_SVG, PASTE_SVG, UNDO_SVG } from "./svg";
import { $, armAfterAttach, fillLabel, isEditApp, rszOrigSync, spOnAspects, upsApply } from "./p01-core";
import { cpPanApply, cpToolAnchor } from "./p02-preview";
import { dlStamp, jobSeqIssue, pendCut, pendPut, renderJob } from "./p07-jobs";
import { baseUrl, carAppend, dlBlob, jobNo, jobNo3, reattachSrc, scrollQueue } from "./p08-results";
import { clearRestored } from "./p09-restore";
import { dispatchBatch, goFire } from "./p11-fit";
import { ieBindBoxes, ieBoxesHTML } from "./p12-spell";

export const REUSE_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 16v-6M9 12.5 12 9.5l3 3"/></svg>';
export const _dlPersist = () => { try { localStorage.setItem('nomute_thumb_dled', JSON.stringify([...S.DLED].slice(-800))); } catch {} };
export const _dlKey = u => (u || '').split('?')[0].split('#')[0];
export const dlSeen = u => !!u && S.DLED.has(_dlKey(u));
export const dlMark = (u, btn) => { if (u) { S.DLED.add(_dlKey(u)); _dlPersist(); } if (btn) btn.classList.add('dl-done'); };
export async function freeLoad() {
  try {
    const sig = (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? AbortSignal.timeout(12000) : null;
    const r = await fetch('gen_out/free.json?t=' + Date.now(), sig ? { signal: sig } : undefined);
    if (!r.ok) return [];
    const tx = await r.text();
    if (/^\s*</.test(tx)) return [];
    const items = JSON.parse(tx);
    return Array.isArray(items) ? items : [];
  } catch (e) { return []; }
}
export function jobUiPulse(job) {
  clearInterval(job._ui);
  job._ui = setInterval(() => {
    if (job.status !== 'run') { clearInterval(job._ui); job._ui = 0; return; }
    job._queued = Math.round((Date.now() - job.t0) / 1000) > 150;
    renderJob(job);
  }, 5000);
}
export function genJob(count, opts, fireErr, meta) {
  meta = meta || {};
  const resume = meta.t0 != null;
  count = Math.max(1, Math.min(4, parseInt(count, 10) || 1));
  if (!resume) clearRestored();
  const job = { n: resume && meta.n != null ? meta.n : jobSeqIssue(), label: '생성', refThumb: (resume ? '' : (S._pendRefThumb || '')), t0: resume ? meta.t0 : Date.now(), outs: Array.from({ length: count }, () => ({ path: '', label: '' })), done: Array.from({ length: count }, () => false),
    status: 'run', msg: '', gfree: 1, thid: meta.jid || '', payload: opts ? { free: true, opts } : null, endpoint: opts ? '/api/genimg' : '', _snap: null,

    ...(resume ? { _tsFloor: meta.t0 - 5000, _resumed: 1 } : {}),
    src: opts ? { app: '6', gopts: opts } : null };

  S.JOBS.unshift(job); renderJob(job); jobUiPulse(job);
  if (!resume) scrollQueue();
  if (fireErr) {

    setTimeout(() => { if (job.status !== 'run') return; job.status = 'err'; job.msg = String(fireErr).slice(0, 120); renderJob(job); }, 1100);
    return;
  }
  const SOFT_S = 150, HARD_S = 720;
  const h8of = u => (String(u || '').match(/(?:genfree\/|genimg-)([0-9a-f]{8})-/) || [])[1] || '';
  const tick = async () => {
    if (job._timer) { clearTimeout(job._timer); job._timer = null; }
    if (job.status !== 'run' || job._polling) return;
    job._polling = 1;
    try {
      const el = Math.round((Date.now() - job.t0) / 1000);
      if (el > HARD_S) { job.status = 'err'; job.msg = '시간 초과(12분) — 러너 큐 혼잡/렌더 실패 가능, 재시도 가능'; renderJob(job); return; }
      job._queued = el > SOFT_S;
      renderJob(job);
      const items = await freeLoad();
      if (job.status !== 'run') return;
      if (!job._tsFloor && job._snap === null) {
        job._snap = new Set(items.map(i => baseUrl(i && i.url)));
        pendPut(job);
      } else {
        const inWin = i => job._tsFloor ? ((i.ts || 0) >= job._tsFloor) : !job._snap.has(baseUrl(i.url));
        const freshAll = items.filter(i => i && i.url && inWin(i) && !S.GEN_CLAIMED.has(baseUrl(i.url)));
        const fresh = freshAll.filter(i => !i.fail);
        const freshFail = freshAll.filter(i => i.fail);
        if (!fresh.length && freshFail.length) {
          const f = freshFail[freshFail.length - 1];
          S.GEN_CLAIMED.add(baseUrl(f.url));
          job.status = 'err'; job.msg = String(f.reason || '렌더 실패(사유 미상)').slice(0, 120);
          renderJob(job);
          return;
        }
        if (fresh.length) {
          const g = h8of(fresh[fresh.length - 1].url);
          const mine = (g ? fresh.filter(i => h8of(i.url) === g) : fresh).slice(-4).reverse();
          mine.forEach(m => S.GEN_CLAIMED.add(baseUrl(m.url)));
          job.outs = mine.map(() => ({ path: '', label: '' }));
          job.done = mine.map(() => true);
          if (mine.length < count) job.partErr = (count - mine.length) + '장 렌더 실패(재시도 가능)';
          job.status = 'done';
          mine.forEach((m, i) => {
            const o2 = job.outs[i]; o2.path = m.url;
            carAppend(m.url + (m.url.indexOf('?') < 0 ? '?t=' + Date.now() : ''), dlStamp(job.t0) + '_생성_' + jobNo3(job) + '_' + (i + 1) + '.jpg', '생성' + jobNo(job), job, '', o2);
          });
          renderJob(job);
          return;
        }
      }
      job._timer = setTimeout(tick, 25000);
    } finally { job._polling = 0; }
  };
  job._tick = tick;
  tick();
}
export async function genRefire(job) {
  goFire(); clearRestored();
  try {
    const r = await fetch('/api/genimg', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(job.payload) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.error) { job.msg = j.error || ('서버 ' + r.status); renderJob(job); return; }
    const count = (job.payload.opts && job.payload.opts.count) || job.outs.length || 1;
    pendCut(job);
    job.thid = j.id || '';
    job.t0 = Date.now(); job.status = 'run'; job.msg = ''; delete job._queued; delete job.partErr;
    delete job._tsFloor; delete job._resumed;
    job.outs = Array.from({ length: count }, () => ({ path: '', label: '' }));
    job.done = job.outs.map(() => false);
    job._snap = null;
    renderJob(job); jobUiPulse(job); if (job._tick) job._tick();
  } catch (e) { job.msg = '요청 실패: ' + e.message; renderJob(job); }
}
export const rszBusyApp = () => S.APP === '7' || S.APP === '9';
export function rszWait(on) {
  const gb = $('#go'); if (!gb) return;
  if (on !== undefined) gb._rszBusy = !!on;
  const busy = gb._rszBusy && rszBusyApp();
  if (busy) {
    if (!gb.classList.contains('firing') && !gb.classList.contains('okdone')) rszPaintBusy(gb);
  } else if (gb.classList.contains('rszbusy')) {
    gb.classList.remove('rszbusy'); gb.disabled = false;
    gb.textContent = gb.dataset.label || '생성';
  }
}
export function rszPaintBusy(gb) {
  clearTimeout(gb._fT3);
  gb.classList.remove('firing', 'okdone', 'checking', 'fy'); gb.removeAttribute('aria-busy');
  gb.classList.add('rszbusy'); gb.disabled = true;
  gb.textContent = '제작중…';
}
export const RSZ_ORDER = ['orig', '4:5', '9:16', '16:9', '1:1', 'custom'];
export function rszArFit(el) { if (el) el.style.width = Math.max(1, (el.value || '').length) + 'ch'; }
export function rszArVal() { const w = parseInt(($('#rszArW') || {}).value, 10), h = parseInt(($('#rszArH') || {}).value, 10); return (w >= 1 && w <= 99 && h >= 1 && h <= 99 && w / h >= 0.25 && w / h <= 4) ? w + ':' + h : null; }
export function rszAspect() { if (S.rszV === 'custom') { return rszArVal() || 'orig'; } return RSZ_ORDER.indexOf(S.rszV) >= 0 ? S.rszV : 'orig'; }
export function rszApply(v) {
  S.rszV = RSZ_ORDER.indexOf(v) >= 0 ? v : 'orig';
  document.querySelectorAll('#rszOpts .ropt').forEach(b => b.classList.toggle('on', b.dataset.v === S.rszV));
  const arw = $('#rszArWrap'); if (arw) arw.classList.toggle('none', S.rszV !== 'custom');
  rszOrigSync(); rszPreview();
  if (typeof S.updateGoSpec === 'function') S.updateGoSpec();
}
export function rszMeasure(b64) { const im = new Image(); im.onload = () => { S.RSZ.w = im.naturalWidth; S.RSZ.h = im.naturalHeight; rszPreview(); if (typeof cpPanApply === 'function') cpPanApply(); }; im.src = b64; }
export function rszPad(W, H, ar) { const [aw, ah] = ar.split(':').map(Number); let cw, ch;
  if (aw / ah >= W / H) { ch = H; cw = Math.round(H * aw / ah / 8) * 8; } else { cw = W; ch = Math.round(W * ah / aw / 8) * 8; }
  return { cw, ch, x: Math.floor((cw - W) / 2), y: Math.floor((ch - H) / 2) }; }
export function rszRatioOk(W, H, ar, tol = 0.02) { const [aw, ah] = ar.split(':').map(Number); return Math.abs(W / H - aw / ah) <= (aw / ah) * tol; }
export function rszPreview() {
  const stage = $('#rszStage'); if (!stage || !(isEditApp(S.APP) || S.SPX) || !S.CIMG.b64 || !S.RSZ.w) return;
  const W = S.RSZ.w, H = S.RSZ.h, ar = S.SPX ? (spOnAspects()[0] || 'orig') : rszAspect();
  if (ar === 'orig') {
    const mos = S.APP === '8' && S.IE.phase !== 'done';
    const zoomed = !!document.querySelector('#topDock.dockzoom');
    const cap = zoomed ? 'min(42vh,430px);max-height:min(42svh,430px)' : (rszCapH() - 10) + 'px';
    const img = '<img class="rsz-orig" src="' + S.CIMG.b64 + '" style="position:static;display:block;width:100%;max-width:100%;height:auto;object-fit:contain;max-height:' + cap + ';margin:0 auto;outline:1px solid rgba(var(--accent-rgb),.4)">';
    stage.innerHTML = mos ? '<div class="ie-wrap">' + img + ieBoxesHTML() + '</div>' : img;
    if (mos) ieBindBoxes(stage);
    const m0 = $('#rszMetric'); if (m0) m0.innerHTML = '원 <b>' + rszN(W) + ' × ' + rszN(H) + '</b>' + (S.APP === '7' ? ' <span class="n">· 변환 없음</span>' : '');
    cpToolAnchor();
    return;
  }
  const noop = rszRatioOk(W, H, ar);
  const { cw, ch, x, y } = rszPad(W, H, ar);

  const maxW = (stage.clientWidth || 280) - 8;
  const maxH = rszCapH() - 10;
  let scale = maxW / cw;
  if (ch * scale > maxH) scale = maxH / ch;
  const CW = cw * scale, CH = ch * scale, OX = x * scale, OY = y * scale, OW = W * scale, OH = H * scale;
  const lock = S.SPX || $('#rszLock').classList.contains('on');
  const horiz = OW < CW - 0.5;
  const strip = (L, T, Wd, Ht) => '<div class="rsz-strip" style="left:' + L + 'px;top:' + T + 'px;width:' + Wd + 'px;height:' + Ht + 'px"></div>';
  const strips = noop ? '' : (horiz ? strip(0, 0, OX, CH) + strip(OX + OW, 0, CW - OX - OW, CH)
                                    : strip(0, 0, CW, OY) + strip(0, OY + OH, CW, CH - OY - OH));
  const canvOutline = noop ? 'outline:1px solid rgba(var(--accent-rgb),.4);' : 'outline:2px dashed var(--mut);';
  const origBorder = lock ? 'outline:2px solid var(--accent);outline-offset:-1px;box-shadow:0 0 12px rgba(var(--accent-rgb),.4);'
                          : 'outline:2px dashed var(--mut);';

  const tagPos = 'left:calc(' + OX + 'px + var(--sp-1));top:calc(' + OY + 'px + var(--sp-1));transform:none;';
  const tag = noop ? '<div class="rsz-origtag" style="' + tagPos + 'color:var(--amber);box-shadow:0 0 0 1px rgba(var(--amber-rgb),.4)">원본 그대로</div>'
                   : '<div class="rsz-origtag" style="' + tagPos + '">원본</div>';
  stage.innerHTML = '<div class="rsz-canv" style="width:' + CW + 'px;height:' + CH + 'px;' + canvOutline + '">' + strips +
    '<img class="rsz-orig" src="' + S.CIMG.b64 + '" style="left:' + OX + 'px;top:' + OY + 'px;width:' + OW + 'px;height:' + OH + 'px;' + origBorder + '">' + tag + '</div>';
  const m = $('#rszMetric'); if (!m) return;
  if (noop) { m.innerHTML = '원 <b>' + rszN(W) + ' × ' + rszN(H) + '</b> <span class="n">· 이미 ' + ar + ' 비율, 확장 없음</span>'; m.removeAttribute('title'); cpToolAnchor(); return; }
  const gain = horiz ? (cw - W) / 2 : (ch - H) / 2, dir = horiz ? '좌우 각' : '상하 각', mult = horiz ? cw / W : ch / H;

  m.innerHTML = '원 <b>' + rszN(W) + ' × ' + rszN(H) + '</b> → 캔 <b class="g">' + rszN(cw) + ' × ' + rszN(ch) + '</b>';
  m.title = ar + ' 확장 — ' + dir + ' +' + rszN(gain) + 'px · ' + (horiz ? '폭 ' : '높이 ') + mult.toFixed(2) + '×';
  cpToolAnchor();
}
export function dockOptFade() {
  const c = document.querySelector('#editCol'); if (!c) return;
  const b = document.querySelector('#cpPrev .cpprev-box');
  if (b) { const h = b.getBoundingClientRect().height; if (h > 0) c.style.maxHeight = h + 'px'; }
  const ovf = c.scrollHeight - c.clientHeight > 1;
  c.classList.toggle('ovf', ovf);
  c.classList.toggle('atEnd', ovf && c.scrollTop + c.clientHeight >= c.scrollHeight - 1);
}
export function rszCapH() {
  const b = document.querySelector('#cpPrev .cpprev-box'); if (!b) return 198;
  const mh = parseFloat(getComputedStyle(b).maxHeight);
  if (b.classList.contains('ocfit')) return Number.isFinite(mh) ? mh : 198;
  const rh = b.getBoundingClientRect().height;
  if (rh > 0) return Number.isFinite(mh) ? Math.min(mh, rh) : rh;
  return Number.isFinite(mh) ? mh : 198;
}
export function rszN(n) { return Math.round(n).toLocaleString('en-US'); }
export async function rszLoad() {

  const sig = () => ((typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? AbortSignal.timeout(12000) : null);
  for (const u of ['/api/rszhist?t=' + Date.now(), 'gen_out/resize.json?t=' + Date.now()]) {
    try {
      const s = sig();
      const r = await fetch(u, s ? { signal: s } : undefined);
      if (!r.ok) continue;
      const tx = await r.text();
      if (/^\s*</.test(tx)) continue;
      const items = JSON.parse(tx);
      if (Array.isArray(items) && items.length) return items;
    } catch (e) {   }
  }
  return [];
}
export const rszRunning = () => S.JOBS.some(jb => jb && jb.rid && jb.status === 'run');
export function rszJob(rid, payload, autoAttach, meta) {
  clearRestored();
  const o = { path: '', label: payload.aspect + ' · ' + payload.size + (payload.lock ? ' · 보존' : ' · 확장') + (payload.fill && payload.fill !== 'auto' ? ' · ' + fillLabel(payload.fill) : '') };

  const _aiFill = !!(payload && payload.box);

  const _nm = _aiFill ? (payload.aspect === '9:16' ? '릴스' : '포스트') + ' #AI합성' : '리사이즈';
  const job = { n: jobSeqIssue(), label: _aiFill ? _nm : _nm + ' (' + payload.aspect + ')', t0: Date.now(), outs: [o], done: [false], status: 'run', msg: '', rid, payload, endpoint: '/api/resize' };
  if (meta && meta.tpl) job.tpl = meta.tpl;
  if (meta && meta.chain) job._chain = meta.chain;
  S.JOBS.unshift(job); renderJob(job); jobUiPulse(job);
  const SOFT_S = 150, HARD_S = 360;
  const tick = async () => {
    if (job._timer) { clearTimeout(job._timer); job._timer = null; }
    if (job.status !== 'run' || job._polling) return;
    job._polling = 1;
    try {
      const el = Math.round((Date.now() - job.t0) / 1000);
      if (el > HARD_S) { job.status = 'err'; job.msg = '시간 초과(6분) — 러너 큐 혼잡/변환 실패 가능, 재시도 가능'; renderJob(job); if (!rszRunning()) rszWait(false); return; }
      job._queued = el > SOFT_S;
      renderJob(job);
      const hit = (await rszLoad()).find(i => i && i.id === job.rid && i.url);
      if (job.status !== 'run') return;
      if (hit) {
        o.path = hit.url;

        const _R = { gemini: 'AI', solid_pad: '단색', blur_pad: '블러', seed_pad: 'AI 실패·원본 확장' }[hit.route];
        if (_R) o.label += ' · ' + _R;

        const _aiReal = _aiFill && (!hit.route || hit.route === 'gemini');
        if (_aiFill && !_aiReal) job.label = '리사이즈 (' + payload.aspect + ')';
        const _fin = (_aiReal ? _nm : '리사이즈') + jobNo(job);
        job.done[0] = true; job.status = 'done';
        carAppend(hit.url + (hit.url.indexOf('?') < 0 ? '?t=' + Date.now() : ''), dlStamp(job.t0) + '_' + (_aiReal ? 'ai합성' : '리사이즈') + '_' + jobNo3(job) + '_' + payload.aspect.replace(':', 'x') + '.jpg', _fin, job, ' · ' + payload.aspect, o, false, payload.name || _fin);
        renderJob(job);
        if (!rszRunning()) rszWait(false);
        if (autoAttach && hit.route !== 'seed_pad' && hit.route !== 'blur_pad') {
          reattachSrc(hit.url, payload.name, null).then(b64 => {
            const ch = job._chain; if (!ch || !ch.items || !b64) return; job._chain = null;
            if (ch.src && _aiReal) ch.src.aiBg = 1;
            ch.items.forEach(it => { if (it._needBg) { delete it._needBg; it.payload.imageB64 = b64; it.payload.name = payload.name || 'fill.jpg'; } });
            dispatchBatch(ch.items, ch.lbl, ch.src);
          });
        }
        return;
      }
      job._timer = setTimeout(tick, 25000);
    } finally { job._polling = 0; }
  };
  job._tick = tick;
  tick();
}
export async function rszRefire(job) {
  goFire(); clearRestored();
  try {
    const r = await fetch('/api/resize', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(job.payload) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.error) { job.msg = j.error || ('서버 ' + r.status); renderJob(job); return; }
    job.rid = j.id; job.t0 = Date.now(); job.status = 'run'; job.done = [false]; job.msg = ''; delete job._queued;
    job.outs[0].path = '';
    renderJob(job); jobUiPulse(job); rszWait(true); if (job._tick) job._tick();
  } catch (e) { job.msg = '요청 실패: ' + e.message; renderJob(job); }
}
export async function dlAllSeq(btn, urls, namer) {
  if (!btn || btn._dlbusy) return;
  urls = (urls || []).filter(Boolean);
  if (!urls.length) return;
  btn._dlbusy = 1; btn.style.pointerEvents = 'none';
  btn.style.minWidth = Math.ceil(btn.getBoundingClientRect().width) + 'px';
  const lbl = btn.querySelector('.cref-dllbl');
  const orig = lbl ? lbl.textContent : '';
  btn.classList.remove('dlseq-done', 'dlseq-release'); btn.classList.add('dlseq-busy');
  btn.style.setProperty('--p', '0');
  for (let i = 0; i < urls.length; i++) {
    dlBlob(urls[i], namer(i));
    if (lbl) lbl.textContent = `${i + 1}/${urls.length}`;
    btn.style.setProperty('--p', String((i + 1) / urls.length));
    await new Promise(r => setTimeout(r, 280));
  }
  if (lbl) lbl.textContent = '완료';
  btn.classList.remove('dlseq-busy'); btn.classList.add('dlseq-done', 'dl-done');
  urls.forEach(u => S.DLED.add(_dlKey(u))); _dlPersist();
  setTimeout(() => {
    btn.classList.add('dlseq-snap'); btn.classList.remove('dlseq-done');
    if (lbl) lbl.textContent = orig || '전체';
    btn.style.setProperty('--p', '0'); btn.style.minWidth = '';
    requestAnimationFrame(() => btn.classList.remove('dlseq-snap'));
    btn._dlbusy = 0; btn.style.pointerEvents = '';
  }, 1050);
}
export const PLUS_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>';
export const XCLOSE_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6 18 18M18 6 6 18"/></svg>';
export const ERASE_UNDO_MS = 10000;
export async function clipCopy(text, btn, after) {
  try { await navigator.clipboard.writeText(text || ''); } catch {}
  btn.innerHTML = CHECK_SVG; btn._icon = 'check'; btn.classList.add('ok');
  setTimeout(() => { btn.classList.remove('ok'); after(); }, 1200);
}
export async function clipPasteText() {
  try { if (navigator.clipboard && navigator.clipboard.readText) { const t = await navigator.clipboard.readText(); if (t) return t; } } catch {}
  return await clipPasteFallback();
}
export function clipPasteFallback() {
  return new Promise(resolve => {
    const ov = document.createElement('dialog'); ov.className = 'pastefb';
    ov.innerHTML = '<div class="pastefb-box"><div class="pastefb-msg">아래 칸을 <b>길게 눌러 “붙여넣기”</b> 하면 자동 반영돼</div>'
      + '<textarea class="pastefb-ta" placeholder="여기에 붙여넣기" autocapitalize="off" autocomplete="off" spellcheck="false"></textarea>'
      + '<div class="pastefb-row"><button type="button" class="pastefb-btn pastefb-cancel">취소</button><button type="button" class="pastefb-btn pastefb-ok">적용</button></div></div>';
    document.body.appendChild(ov);
    const ta = ov.querySelector('.pastefb-ta'); let done = false;
    const finish = v => { if (done) return; done = true; try { ov.close(); } catch {} ov.remove(); resolve(v || null); };
    ta.addEventListener('paste', () => setTimeout(() => { if (ta.value) finish(ta.value); }, 30));
    ov.querySelector('.pastefb-ok').onclick = () => finish(ta.value);
    ov.querySelector('.pastefb-cancel').onclick = () => finish(null);
    ov.addEventListener('cancel', e => { e.preventDefault(); finish(null); });
    ov.addEventListener('click', e => { if (e.target === ov) finish(null); });
    try { ov.showModal(); } catch { ov.setAttribute('open', ''); }
    setTimeout(() => { try { ta.focus(); } catch {} }, 60);
  });
}
export function attachCopyPaste(el, withErase) {
  const wrap = document.createElement('div'); wrap.style.position = 'relative'; wrap.classList.add('iowrap');
  if (el.classList.contains('covta')) { wrap.classList.add('covta'); el.classList.remove('covta'); }
  el.parentNode.insertBefore(wrap, el); wrap.appendChild(el);
  const split = true;
  const nBtn = (split ? 2 : 1) + (withErase ? 1 : 0);
  el.style.paddingRight = (el.tagName !== 'TEXTAREA' || el.classList.contains('ta1l')) ? (14 + nBtn * 32) + 'px' : '42px';
  const btn = document.createElement('button'); btn.type = 'button'; btn.tabIndex = -1; btn.className = 'iobtn iobtn-edge' + (withErase ? ' iobtn-pp' : ''); wrap.appendChild(btn);
  let copyB = null;
  if (split) {
    copyB = document.createElement('button'); copyB.type = 'button'; copyB.tabIndex = -1; copyB.className = 'iobtn iobtn-edge iobtn-copy' + (withErase ? ' iobtn-copy-e' : '') + ' iobtn-hide';
    copyB.innerHTML = COPY_SVG; copyB.setAttribute('aria-label', '복사'); copyB.title = '복사';
    copyB.onclick = ev => { ev.preventDefault(); clipCopy(el.value, copyB, refresh); };
    wrap.appendChild(copyB);
  }
  let eraser = null, undoTimer = null, undoVal = '', prog = false;
  const setIcon = (b, svg, key) => { if (b._icon !== key) { b.innerHTML = svg; b._icon = key; } };
  const refresh = () => {
    const filled = (el.value || '').trim().length > 0;
    if (split) {
      if (!btn.classList.contains('ok')) { setIcon(btn, PASTE_SVG, 'paste'); btn.dataset.mode = 'paste'; btn.setAttribute('aria-label', '붙여넣기'); btn.title = '붙여넣기'; }
      if (copyB && !copyB.classList.contains('ok')) { setIcon(copyB, COPY_SVG, 'copy'); copyB.classList.toggle('iobtn-hide', !filled); }
    } else if (!btn.classList.contains('ok')) {
      setIcon(btn, filled ? COPY_SVG : PASTE_SVG, filled ? 'copy' : 'paste'); btn.dataset.mode = filled ? 'copy' : 'paste'; btn.setAttribute('aria-label', filled ? '복사' : '붙여넣기');
    }
    if (eraser) eraser.classList.toggle('iobtn-off', !filled && !eraser.classList.contains('iobtn-undo'));
  };
  if (withErase) {
    eraser = document.createElement('button'); eraser.type = 'button'; eraser.tabIndex = -1; eraser.className = 'iobtn iobtn-edge iobtn-erase';
    eraser.innerHTML = ERASE_SVG; eraser.setAttribute('aria-label', '입력 지우기'); eraser.title = '입력 지우기';
    const exitUndo = () => {
      if (undoTimer) { clearTimeout(undoTimer); undoTimer = null; }
      eraser.classList.remove('iobtn-undo'); eraser.innerHTML = ERASE_SVG;
      eraser.setAttribute('aria-label', '입력 지우기'); eraser.title = '입력 지우기'; refresh();
    };
    eraser.onclick = ev => {
      ev.preventDefault();
      if (eraser.classList.contains('iobtn-undo')) {
        prog = true; el.value = undoVal; el.dispatchEvent(new Event('input', { bubbles: true })); prog = false;
        try { el.focus(); } catch {} exitUndo(); return;
      }
      if (!(el.value || '').length) return;
      undoVal = el.value;
      prog = true; el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); prog = false;
      try { el.focus(); } catch {}
      eraser.classList.remove('iobtn-off'); eraser.classList.add('iobtn-undo');
      eraser.innerHTML = UNDO_SVG; eraser.setAttribute('aria-label', '되돌리기'); eraser.title = '되돌리기 (직전 입력 복원)';
      if (undoTimer) clearTimeout(undoTimer); undoTimer = setTimeout(exitUndo, ERASE_UNDO_MS);
    };
    el.addEventListener('input', () => { if (!prog && undoTimer) exitUndo(); });
    wrap.appendChild(eraser);
  }
  btn.onclick = async ev => {
    ev.preventDefault();
    if (!split && btn.dataset.mode === 'copy') { clipCopy(el.value, btn, refresh); return; }
    const selS = el.selectionStart, selE = el.selectionEnd;
    const t = await clipPasteText();
    if (t) {
      if (typeof el.setRangeText === 'function' && typeof selS === 'number') el.setRangeText(t, selS, selE, 'end');
      else el.value += t;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
    refresh();
  };
  el.addEventListener('input', refresh); refresh();
}

export function start() {
S.SPIN_SVG = window.nmOrbHTML?nmOrbHTML('solving',14):'…';
S.DLSEQ_IC = '<span class="dlseq-ic">' + DOWNLOAD_SVG.replace('<svg ', '<svg class="dn" ') + CHECK_SVG.replace('<svg ', '<svg class="chk" ') + '</span>';
S.DLED = new Set();
try { const _dl = JSON.parse(localStorage.getItem('nomute_thumb_dled') || '[]'); if (Array.isArray(_dl)) _dl.forEach(u => S.DLED.add(u)); } catch {}
S._deadUrls = new Set();
S.GEN_CLAIMED = new Set();
window.addEventListener('message', e => {
  if (e.source !== window.parent || e.origin !== location.origin) return;
  if (!e.data || e.data.nm !== 'genfree-fired') return;
  S.selApp('6');
  S._pendRefThumb = e.data.refThumb || '';
  genJob(e.data.count, e.data.opts || null, e.data.fireErr || '', { jid: e.data.jid || '' });
});
S.rszV = 'orig';
S.RSZ = { w: 0, h: 0 };
(function () {
  const c = document.querySelector('#editCol'); if (!c) return;
  c.addEventListener('scroll', dockOptFade, { passive: true });
  if (window.ResizeObserver) { const ro = new ResizeObserver(dockOptFade); ro.observe(c); const b = document.querySelector('#cpPrev .cpprev-box'); if (b) ro.observe(b); }
  window.addEventListener('resize', dockOptFade);
  dockOptFade();
})();
(function () {
  const wrap = $('#rszOpts'); if (!wrap) return;
  const arm = () => {
    upsApply('FHD');
    if (S.APP !== '7') S.selApp('7');
  };
  const pick = v => {
    if (armAfterAttach(() => pick(v))) return;
    rszApply(v);
    if (v === 'custom') { ['#rszArW', '#rszArH'].forEach(sel => { const el = $(sel); if (el && !el.value) { el.value = '1'; } rszArFit(el); });
      const w = $('#rszArW'); if (w) { w.focus(); w.select(); } if (rszArVal()) arm(); }
    else if (v !== 'orig') arm();
    else if (S.APP === '8') {   }
  };
  wrap.addEventListener('click', e => { const b = e.target.closest('.ropt'); if (!b) return; e.stopPropagation(); pick(b.dataset.v); });
  wrap.addEventListener('keydown', e => { const b = e.target.closest('.ropt'); if (b && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(b.dataset.v); } });
  const upd = () => {
    ['rszArW', 'rszArH'].forEach(id => { const el = document.getElementById(id); if (el) { const c = el.value.replace(/[^0-9]/g, '').slice(0, 2); if (c !== el.value) el.value = c; rszArFit(el); } });
    const out = $('#rszArOut'), v = rszArVal();
    if (out) out.textContent = v ? ('= ' + v) : '';
    if (S.rszV === 'custom') { rszPreview(); if (typeof S.updateGoSpec === 'function') S.updateGoSpec(); if (v) arm(); }
  };
  ['rszArW', 'rszArH'].forEach(id => { const el = document.getElementById(id); if (el) { el.addEventListener('input', upd);
    el.addEventListener('focus', () => el.select());
    el.addEventListener('mouseup', e => e.preventDefault());
    el.addEventListener('blur', () => { if (!el.value) { el.value = '1'; rszArFit(el); upd(); } }); } });
})();
$('#rszLock').onclick = () => { if (isEditApp(S.APP) && armAfterAttach(() => { const t = $('#rszLock'); if (t) t.click(); })) return;
  const b = $('#rszLock'); const on = !b.classList.contains('on'); b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); rszPreview(); if (typeof S.updateGoSpec === 'function') S.updateGoSpec(); };
window.addEventListener('resize', () => { if (isEditApp(S.APP) || S.SPX) rszPreview(); });
}
