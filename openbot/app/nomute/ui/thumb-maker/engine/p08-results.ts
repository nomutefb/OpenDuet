// @ts-nocheck
// 썸네일 생성기 엔진 · 라벨·결과 박스·캐러셀·섹션 접기·이전 제작·동기화
//   원본 = 에디터 viewer/thumb.html 4244~4710줄(origin/main c430e4c9f) — 줄 그대로 옮김 · 주석만 뺌(까닭·형 말은 원본 주석에 그대로)
//   바꾼 곳 = 화면 전역 let·var·표 const → S.<이름>(./state · 창 열 때마다 새로) · document·window·타이머 = ./rt(이 화면 뿌리 안으로 · 닫으면 다 걷음) · 함수는 그대로 내보내고 서로 가져옴
//   다시 맞출 땐 ../tools/codemod.mjs 로 원본 줄을 통째로 다시 뗌(손으로 고친 줄 0 · 원본 갈아 끼우는 함수 selApp·updateGoSpec = S 에 올림 · hoist())
import { S } from "./state";
import { clearTimeout, document, fetch, matchMedia, requestAnimationFrame, setTimeout, window } from "./rt";
import { CHEV_L_SVG, CHEV_R_SVG, DOWNLOAD_SVG, EDIT_SVG } from "./svg";
import { $ } from "./p01-core";
import { cpPrevWait, renderCpPrev } from "./p02-preview";
import { imgPendBegin } from "./p03-options";
import { REUSE_SVG, dlMark, dlSeen, rszApply } from "./p04-media";
import { canEditSrc, editOpenSrc } from "./p06-draft";
import { renderJob } from "./p07-jobs";
import { carHSync, directPick, doRestore, findResultById, followNewestRestored, localLastResult, reconcileRestoredBatch, restoreById, rmRestoredRow } from "./p09-restore";
import { errStatus } from "./p13-fire";

export const pad3 = n => String(n).padStart(3, '0');
export const dlSlug = s => String(s || '').replace(/#/g, '').replace(/[·()/\\:*?"<>|]/g, ' ').replace(/\s+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
export const jobNo = j => (j && j.n != null && j.n !== '') ? ' #' + j.n : '';
export const JFMT = { '4:5': ['포스트', 'post'], '9:16': ['릴스', 'reels'] };
export const stripOpa = s => (window.nmCap ? nmCap.text(s) : String(s == null ? '' : s));
export function jobFace(job) {
  const L = String(job.label || '');
  const R = { '포스트': '4:5', '릴스': '9:16' };
  let m, ratio = '', pieces = null, ai = !!(job.src && job.src.aiBg);
  if ((m = /^(포스트|릴스) #AI합성$/.exec(L))) { ratio = R[m[1]]; pieces = ''; ai = true; }
  else if ((m = /^(포스트|릴스)(?: (.+))?$/.exec(L))) {
    ratio = R[m[1]]; pieces = m[2] || '';
    if (/^OPA[\d·]+$/.test(pieces)) pieces = '오버레이(' + pieces + ')';
    if (!pieces && job.payload && job.payload.params && Array.isArray(job.payload.params.opas)) pieces = '오버레이(OPA' + job.payload.params.opas.join('·') + ')';
    if (!pieces) pieces = '오버레이';
  }
  else if ((m = /^(저작권·안내문|저작권|안내문) \((포스트|릴스)\)$/.exec(L))) { ratio = R[m[2]]; pieces = m[1]; }
  else if ((m = /^리사이즈 \(([\d:]+)\)$/.exec(L))) { ratio = m[1]; pieces = '리사이즈'; }
  else if (L === '카드뉴스') { ratio = '4:5'; pieces = '카드뉴스'; }
  else if (/^(헤더|자막\(|오버레이\()/.test(L) && L.indexOf('·') >= 0) { pieces = L; }
  if (pieces == null) return null;
  pieces = pieces.replace(/자막\(/g, '오버레이(').replace(/(^|·)자막(·|$)/g, '$1오버레이$2');
  const cmp = (job.src && job.src.aiBg) ? 'AI 합성' : (job.src && job.src.bg) ? '배경 합성' : '';
  if (cmp) pieces = cmp + (pieces ? '·' + pieces : '');
  return { ratio, ai, pieces: stripOpa(pieces), cmp: stripOpa(cmp) };
}
export const faceOf = e => (e && e.cap) ? jobFace({ label: e.cap, src: e.src }) : null;
export const faceTx = (f, withFmt) => !f ? '' : [withFmt ? (JFMT[f.ratio] ? JFMT[f.ratio][0] : f.ratio) : '', (f.ai && !/^AI(·|\s|$)/.test(f.pieces || '')) ? 'AI' : '', f.pieces].filter(Boolean).join(' · ');
export const jobNo3 = j => (j && j.n != null && j.n !== '') ? pad3(j.n) : '000';
export function dlBlob(url, name) {
  const a = document.createElement('a');
  a.href = /\/\/pub-[0-9a-fA-F]+\.r2\.dev\//.test(url) ? ('api/dl?u=' + encodeURIComponent(url) + '&n=' + encodeURIComponent(name || 'thumb.jpg')) : url;
  a.download = name || 'thumb.jpg';
  document.body.appendChild(a); a.click(); a.remove();
}
export async function reattachSrc(url, name, btn) {
  if (!url || (btn && btn._busy)) return;
  if (btn) { btn._busy = 1; btn.classList.add('busy'); }
  const _pd = imgPendBegin();
  try {
    const u = /\/\/pub-[0-9a-fA-F]+\.r2\.dev\//.test(url) ? ('api/dl?u=' + encodeURIComponent(url) + '&n=' + encodeURIComponent(name || 'edit.jpg')) : url;
    const r = await fetch(u); if (!r.ok) throw new Error('HTTP ' + r.status);
    let bl = await r.blob();
    if (bl.size > 9 * 1024 * 1024) throw new Error('9MB 초과');
    if (!/^image\//.test(bl.type)) bl = new Blob([bl], { type: /\.png(\?|$)/i.test(url) ? 'image/png' : 'image/jpeg' });
    const b64 = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => rej(new Error('디코드 실패')); fr.readAsDataURL(bl); });
    const slot = $('#cImgSlot'); if (!slot || !slot._set) throw new Error('슬롯 없음');
    slot._set(b64, name || 'edit.jpg');
    rszApply('orig'); if (S.APP !== '2') S.selApp('2');
    scrollMid(slot); flashEl(slot.closest('.covrow') || slot);
    return b64;
  } catch (e) { errStatus('재시도'); }
  finally { _pd(); if (btn) { btn._busy = 0; btn.classList.remove('busy'); } }
}
export function carAppend(url, dlname, cap, job, varStr, o, restore, histCap, noExpand) {
  if (window.nmEta && S._cpwT0) nmEta.done('thumb-copy', (Date.now() - S._cpwT0) / 1000);
  cpPrevWait(false);
  if (job && !(job.src && job.src.app)) { const _bs = srvSrcOf(url); if (_bs) job.src = _bs; }
  const slideIdx = S.CARSLIDES.length;
  S.CARSLIDES.push({ url, dlname: dlname || '', src: job && job.src, reuse: !!(job && (job.rid || job.gfree)), cap: histCap || cap || '', varStr: varStr || '', ts: (job && job._restored && job.t0) || Date.now() });
  if (!restore) histAdd({ url, dlname: dlname || '', cap: histCap || cap || '', varStr: varStr || '', ts: Date.now(), src: (job && job.src) || srvSrcOf(url) });
  if (o) { o._slide = slideIdx; o._url = url; o._dlname = dlname; }
  if (job) (job.saves || (job.saves = [])).push({ url, dlname, cap, varStr: varStr || '' });
  const _expand = (restore || !job || (job.saves || []).length === 1) && !noExpand;
  if (_expand) { $('#carwrap').hidden = false; $('#carbar').hidden = false; }
  const track = $('#cartrack');
  const slide = document.createElement('div'); slide.className = 'carslide'; slide.dataset.slide = slideIdx;
  slide.innerHTML = '<img src="' + url + '"><span class="cap"></span>';

  const capEl = slide.querySelector('.cap'), _cf = faceOf({ cap, src: job && job.src }), _ctx = faceTx(_cf, true);
  capEl.textContent = _ctx || cap || '';
  if (!_ctx && varStr) { const v = document.createElement('span'); v.className = 'cap-var'; v.textContent = stripOpa(varStr); capEl.appendChild(v); }

  const _sdl = document.createElement('a'); _sdl.className = 'imgdl dlbtn'; _sdl.href = url;
  _sdl.setAttribute('aria-label', '다운로드'); _sdl.innerHTML = DOWNLOAD_SVG; if (dlSeen(url)) _sdl.classList.add('dl-done');
  _sdl.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); dlBlob(url, dlname || ''); dlMark(url, _sdl); });
  slide.appendChild(_sdl);
  if (canEditSrc(job && job.src)) {
    const _sed = document.createElement('button'); _sed.type = 'button'; _sed.className = 'imgedit'; _sed.title = '이 설정으로 수정'; _sed.setAttribute('aria-label', '수정'); _sed.innerHTML = EDIT_SVG;
    _sed.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); editOpenSrc(job.src, url); });
    slide.appendChild(_sed);
  }
  if (job && (job.rid || job.gfree)) {
    const _sus = document.createElement('button'); _sus.type = 'button'; _sus.className = 'imgdl caruse'; _sus.title = '이 결과를 소스로 재첨부'; _sus.setAttribute('aria-label', '소스로 재첨부'); _sus.innerHTML = REUSE_SVG;
    _sus.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); reattachSrc(url, dlname || '', _sus); });
    slide.appendChild(_sus);
  }

  const _anc = job && job._lastSlide && job._lastSlide.isConnected ? job._lastSlide : null;
  if (_anc) _anc.after(slide); else track.prepend(slide);
  if (job) job._lastSlide = slide;
  const _im = slide.querySelector('img'); if (_im && !_im.complete) _im.addEventListener('load', carUpdate, { once: true });
  if (_im) _im.onerror = () => {
    const s = S.CARSLIDES[slideIdx]; if (s) s.dead = true;
    if (restore && S.CARSLIDES.length && S.CARSLIDES.every(x => x.dead)) {
      const gone = new Set(S.CARSLIDES.map(x => histKey(x.url)));
      try { localStorage.removeItem(THUMB_LAST_KEY); } catch {}
      histSave(histPrune(histLoad()).filter(e => !gone.has(histKey(e.url))));

      S.RESTORED = false; S.RESTORED_URLS.clear();
      rmRestoredRow();
      S.CARSLIDES.length = 0; const tr = $('#cartrack'); if (tr) { tr.innerHTML = ''; tr.style.height = ''; }
      $('#carwrap').hidden = true; $('#carbar').hidden = true; carUpdate(); carHSync(); renderHist();
    }
  };
  carUpdate();
  carHSync(_expand);
  if (!restore && job && (job.saves || []).length === 1) track.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
}
export function carStride() {
  const t = $('#cartrack'), c = t && t.children;
  return ((c && c[1] && c[0]) ? (c[1].offsetLeft - c[0].offsetLeft) : (t && t.clientWidth)) || 1;
}
export function carUpdate() {
  const track = $('#cartrack'), n = S.CARSLIDES.length;
  const idx = Math.round(track.scrollLeft / carStride());
  const _last = Math.min(idx + 2, n);
  $('#carcount').textContent = n > 1 ? (Math.min(idx + 1, n) + (_last > idx + 1 ? '-' + _last : '') + ' / ' + n + '장') : '';
  $('#carPrev').disabled = idx <= 0; $('#carNext').disabled = idx >= n - 2;
  let _fh = 0, _fit = false;
  for (let _k = Math.max(idx, 0); _k < Math.min(idx + 2, Math.max(n, 1)); _k++) {
    const _s = track.children[_k], _im = _s && _s.querySelector('img');
    if (_im && _im.complete && _im.naturalWidth && _s.offsetHeight > 4) { _fit = true; if (_s.offsetHeight > _fh) _fh = _s.offsetHeight; }
  }
  if (_fit && Math.abs((parseFloat(track.style.height) || 0) - _fh) > 1) track.style.height = _fh + 'px';
}
export function carJump(slideIdx) {
  const track = $('#cartrack');
  const slide = track.querySelector('.carslide[data-slide="' + slideIdx + '"]');
  if (slide) { $('#carwrap').hidden = false; track.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' }); }
}
export const THUMB_HKEY = 'nomute_thumb_hist';
export const THUMB_HMS = 12 * 3600e3;
export const THUMB_HMAX = 240;
export const THUMB_HCLEAR_KEY = 'nomute_thumb_hist_cleared';
export function histClearedCut() { try { return +localStorage.getItem(THUMB_HCLEAR_KEY) || 0; } catch { return 0; } }
export const THUMB_LAST_KEY = 'nomute_thumb_last';
export const baseUrl = u => String(u || '').split('?')[0];
export const histKey = u => baseUrl(u).replace(/^https?:\/\/[^/]+\//, '');
export const batchId = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
export const bidOf = e => { const s = e && e.src; return (s && typeof s === 'object' && typeof s.bid === 'string') ? s.bid : ''; };
export const biOf = e => { const s = e && e.src, n = s && +s.bi; return Number.isFinite(n) ? n : 99; };
export const thIdOf = u => { const m = String(u || '').match(/(?:thumb_out|comp_out|resize)\/([^/?#]+)/); return m ? m[1] : ''; };
export const doneReq = () => {
  try { const q = new URLSearchParams(location.search).get('done'); if (q != null) return { on: true, id: (String(q).match(/^[\w-]+$/) || [])[0] || '' }; } catch (_) {}
  if (/\bdone\b/.test(location.hash)) return { on: true, id: (location.hash.match(/done=([\w-]+)/) || [])[1] || '' };
  return { on: false, id: '' };
};
export const _twoCol = () => { try { return document.documentElement.classList.contains('inmodal') && matchMedia('(min-width:900px)').matches; } catch (_) { return false; } };
export const scrollMid = el => { if (!el) return; requestAnimationFrame(() => { try { const y = el.getBoundingClientRect().top + window.pageYOffset - Math.round((window.innerHeight || 700) * 0.18); window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' }); } catch (_) { try { el.scrollIntoView(); } catch (_) {} } }); };
export const scrollQueue = () => { const h = $('#carH'), el = (h && !h.hidden) ? h : $('#jobs'); if (!el) return; requestAnimationFrame(() => { try { const dk = $('#topDock'); const off = ((dk && getComputedStyle(dk).position === 'sticky') ? dk.getBoundingClientRect().height : 0) + (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sp-2')) || 0); const y = el.getBoundingClientRect().top + window.pageYOffset - off; window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' }); } catch (_) { try { el.scrollIntoView(); } catch (_) {} } }); };
export const flashEl = el => { if (!el) return; el.classList.add('thfocus'); setTimeout(() => el.classList.remove('thfocus'), 2200); };
export function _syncOk() { S._syncOkTs = Date.now(); S._syncFails = 0;
  if (S._syncWarned) { S._syncWarned = false; const s = $('#status'); if (s && s.textContent.indexOf('동기화 끊김') >= 0) { s.textContent = ''; s.classList.remove('err'); } console.log('[thumb] 서버 동기화 복구'); } }
export function _syncBad() { S._syncFails++; if (S._syncFails === 2 && window.nmSync) nmSync.probeNow(); }
export function _syncCheck() {
  if (document.hidden || S._syncFails < 3 || (S._syncOkTs && Date.now() - S._syncOkTs < 45e3)) return;
  const s = $('#status'); if (!s) return;
  const cur = s.textContent || '';
  if (cur && cur.indexOf('동기화 끊김') < 0) return;
  const m = S._syncOkTs ? Math.max(1, Math.round((Date.now() - S._syncOkTs) / 60e3)) + '분' : '';
  s.classList.add('err'); s.textContent = '⚠ 서버 동기화 끊김' + (m ? ' · ' + m : '') + ' — 새로고침, 지속되면 브라우저에서 재로그인';
  if (!S._syncWarned) console.log('[thumb] 서버 동기화 끊김 — 연속 실패 ' + S._syncFails + '회');
  S._syncWarned = true;
}
export async function loadServerHist() {
  try { const r = await fetch('thumb-hist.json?_=' + Date.now()); if (r.ok) { const d = await r.json(); if (Array.isArray(d)) S.SRV_HIST = d; _syncOk(); } else _syncBad(); } catch { _syncBad();   }
  try { const c = await fetch('thumb-clear.json?_=' + Date.now()); if (c.ok) { const j = await c.json(); if (j && +j.ts) { S.SRV_CLEAR = Math.max(S.SRV_CLEAR, +j.ts); try { localStorage.setItem('nomute_thumb_srvclr', String(S.SRV_CLEAR)); } catch {} } } } catch {   }
  renderHist();
  carPencilRetrofit();
  if (!S.CARSLIDES.length && !S.RESTORED && !doneReq().on && !S.JOBS.some(j => j && j.status !== 'done' && j.status !== 'err')) {
    const loc = localLastResult();
    const cut = Math.max(histClearedCut(), S.SRV_CLEAR);
    let pick = (loc && (loc.ts || 0) > cut) ? loc : null;
    let s = null; (S.SRV_HIST || []).filter(e => e && e.url && (e.ts || 0) > S.SRV_CLEAR)
      .concat(histPrune(histLoad()).filter(e => e && e.url && (e.ts || 0) > cut))
      .forEach(e => { if (!s || (e.ts || 0) > (s.ts || 0)) s = e; });
    if (s && (!pick || (s.ts || 0) > (pick.ts || 0))) { const sp = thIdOf(s.url) ? findResultById(thIdOf(s.url)) : directPick(s); if (sp && sp.items && sp.items.length) pick = sp; }
    if (pick) doRestore(pick, true);
  }
  maybeOpenHist();
  reconcileRestoredBatch();
}
export async function pollServerHist() {
  if (document.hidden || S._histPolling) return;
  reconcileRestoredBatch();
  S._histPolling = true;
  try {
    let hist = null, clr = S.SRV_CLEAR;
    try { const r = await fetch('thumb-hist.json?_=' + Date.now()); if (r.ok) { const d = await r.json(); if (Array.isArray(d)) hist = d; _syncOk(); } else _syncBad(); } catch { _syncBad(); }
    try { const c = await fetch('thumb-clear.json?_=' + Date.now()); if (c.ok) { const j = await c.json(); if (j && +j.ts) clr = Math.max(clr, +j.ts); } } catch {}
    const sig = (hist ? hist.length + ':' + ((hist[0] || {}).url || '') + ':' + ((hist[hist.length - 1] || {}).url || '') : 'x') + '|' + clr;
    if (sig === S._histSig) return;
    S._histSig = sig;
    if (hist) S.SRV_HIST = hist;
    if (clr > S.SRV_CLEAR) { S.SRV_CLEAR = clr; try { localStorage.setItem('nomute_thumb_srvclr', String(S.SRV_CLEAR)); } catch {} }
    if (!reconcileRestoredBatch() && !followNewestRestored()) renderHist();
    carPencilRetrofit();
  } finally { S._histPolling = false; }
}
export const thIdTs = id => { const m = String(id).match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/); if (!m) return 0; const t = Date.parse('20' + m[1] + '-' + m[2] + '-' + m[3] + 'T' + m[4] + ':' + m[5] + ':' + m[6] + '+09:00'); return Number.isFinite(t) ? t : 0; };
export const thMetaLabel = f => { const b = String(f).replace(/\.(png|jpe?g)$/i, ''); if (b === 'box') return '흰칸'; if (b === 'nobg' || b === 'out') return '기본'; const m = b.match(/^opa(\d+)$/i); return m ? 'OPA' + m[1] : b; };
export async function fetchMetaById(id, sig) {
  try {
    const r = await fetch('/api/thumb?meta=' + encodeURIComponent(id), sig ? { signal: sig } : undefined);
    if (!r.ok) return false;
    const m = await r.json();
    if (!Array.isArray(m) || !m.length) return false;

    let msrc = null;
    try { const rs = await fetch('/api/thumb?src=' + encodeURIComponent(id), sig ? { signal: sig } : undefined); if (rs.ok) { const s = await rs.json(); if (s && typeof s === 'object' && s.app) msrc = s; } } catch (_) {}
    const _mlbl = (msrc && typeof msrc.lbl === 'string' && msrc.lbl.trim()) || '';
    const ts = thIdTs(id) || Date.now();
    const have = new Set((S.SRV_HIST || []).map(e => e && e.url));
    const add = m.filter(p => Array.isArray(p) && p[1] && !have.has(p[1]))
      .map(p => { const e = { url: p[1], dlname: id + '_' + p[0], cap: _mlbl || thMetaLabel(p[0]), varStr: _mlbl ? ' · ' + thMetaLabel(p[0]) : '', ts }; if (msrc) e.src = msrc; return e; });
    if (add.length) S.SRV_HIST = add.concat(S.SRV_HIST || []);
    return add.length > 0 || m.some(p => Array.isArray(p) && have.has(p[1]));
  } catch (_) { return false; }
}
export async function pollR2Recent() {
  if (document.hidden || S._r2Polling) return; S._r2Polling = true;
  try {
    const r = await fetch('/api/thumb?recent=24'); if (!r.ok) { _syncBad(); return; } _syncOk();
    const d = await r.json(); const ids = (d && Array.isArray(d.ids)) ? d.ids : []; if (!ids.length) return;
    const have = new Set(); (S.SRV_HIST || []).forEach(e => { const i = e && thIdOf(e.url); if (i) have.add(i); });
    const cut = Math.max(histClearedCut(), S.SRV_CLEAR);
    let added = false;
    for (const id of ids) {
      if (!/^[A-Za-z0-9_-]{1,64}$/.test(id) || S._r2Known.has(id) || have.has(id)) continue;
      const ts = thIdTs(id);
      if (ts && ts <= cut) { S._r2Known.add(id); continue; }
      if (await fetchMetaById(id)) { added = true; S._r2Known.add(id); }
    }
    if (added && !reconcileRestoredBatch() && !followNewestRestored()) renderHist();
  } catch (_) { _syncBad();   } finally { S._r2Polling = false; }
}
export function maybeOpenHist(tries = 0) {
  const req = doneReq(); if (!req.on) return;
  const wantId = req.id;
  const hist = $('#hist');
  if (hist && !hist.hidden) { const b = $('#histBody'); if (b && b.hidden) { b.hidden = false; $('#histH').setAttribute('aria-expanded', 'true'); hist.classList.add('open'); } }
  const land = el => { S._histRetry = false; if (S._histTimer) { clearTimeout(S._histTimer); S._histTimer = 0; } try { const u = new URL(location.href); u.searchParams.delete('done'); const qs = u.searchParams.toString(); history.replaceState(null, '', u.pathname + (qs ? '?' + qs : '')); } catch (_) {} scrollMid(el); };
  if (wantId) {
    if (restoreById(wantId)) { const cw = $('#carwrap'); land(cw); flashEl(cw); return; }
    const tgt = document.querySelector('[data-thid="' + wantId + '"]');
    if (tgt) { land(tgt); flashEl(tgt); return; }
    if (tries < 15) {
      if (!S._histRetry) {
        S._histRetry = true;
        S._histTimer = setTimeout(async () => {
          S._histTimer = 0; S._histRetry = false;
          {
            const msig = (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? AbortSignal.timeout(6000) : null;
            if (await fetchMetaById(wantId, msig)) { renderHist(); maybeOpenHist(tries + 1); return; }
          }
          try {
            const sig = (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? AbortSignal.timeout(6000) : null;
            const r = await fetch('thumb-hist.json?_=' + Date.now(), sig ? { signal: sig } : undefined);
            if (r.ok) { const d = await r.json(); if (Array.isArray(d)) S.SRV_HIST = d; }
          } catch (_) {}
          renderHist(); maybeOpenHist(tries + 1);
        }, Math.min(2500 + tries * 1200, 8000));
      }
      return;
    }

    const s = $('#status'); if (s) { s.classList.remove('err'); s.textContent = '결과 준비 중 — 잠시 후 새로고침'; }
  }

  const cb = $('#carbar');
  const fb = (cb && !cb.hidden) ? cb : (($('#jobs') && $('#jobs').firstElementChild) || (hist && !hist.hidden ? hist : null));
  land(fb);
}
export function histLoad() { try { const a = JSON.parse(localStorage.getItem(THUMB_HKEY) || '[]'); return Array.isArray(a) ? a : []; } catch { return []; } }
export function histSave(a) { try { localStorage.setItem(THUMB_HKEY, JSON.stringify(a)); } catch {} }
export function histPrune(a) { const cut = Date.now() - THUMB_HMS; return a.filter(e => e && e.ts && e.ts >= cut); }
export function histAdd(e) { let a = histPrune(histLoad()); a.push(e); while (a.length > THUMB_HMAX) a.shift(); histSave(a); renderHist(); }
export function srvSrcOf(url) {
  if (!url || !(S.SRV_HIST && S.SRV_HIST.length)) return null;
  const k = histKey(url);
  for (const e of S.SRV_HIST) { if (e && e.url && e.src && e.src.app && histKey(e.url) === k) return e.src; }
  return null;
}
export function carPencilRetrofit() {
  S.JOBS.forEach(j => { if (j && j.status === 'done' && !(j.src && j.src.app) && srvSrcOf(((j.saves || [])[0] || {}).url)) renderJob(j); });
  document.querySelectorAll('#cartrack .carslide').forEach(sl => {
    if (sl.querySelector('.imgedit')) return;
    const s = S.CARSLIDES[+sl.dataset.slide]; if (!s || s.dead) return;
    if (!(s.src && s.src.app)) { const b = srvSrcOf(s.url); if (b) s.src = b; }
    if (!canEditSrc(s.src)) return;
    const _sed = document.createElement('button'); _sed.type = 'button'; _sed.className = 'imgedit'; _sed.title = '이 설정으로 수정'; _sed.setAttribute('aria-label', '수정'); _sed.innerHTML = EDIT_SVG;
    _sed.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); editOpenSrc(s.src, s.url); });
    sl.appendChild(_sed);
  });
}
export function histTime(ts) { const d = new Date(ts); let h = d.getHours(); const m = d.getMinutes(); const ap = h < 12 ? 'AM' : 'PM'; h = h % 12 || 12;
  const now = new Date(); const dayDiff = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000);
  const pre = dayDiff === 0 ? '오늘 ' : dayDiff === 1 ? '어제 ' : (d.getMonth() + 1) + '/' + d.getDate() + ' ';
  return pre + h + ':' + String(m).padStart(2, '0') + ' ' + ap; }
export function renderHist() {
  const local = histPrune(histLoad()); histSave(local);
  const localClr = histClearedCut();
  const cut = Math.max(localClr, S.SRV_CLEAR);
  const localF = local.filter(e => (e.ts || 0) > cut);
  const seen = new Set(localF.map(e => histKey(e.url)));
  const srv = (S.SRV_HIST || []).filter(e => e && e.url && !seen.has(histKey(e.url)) && (e.ts || 0) > S.SRV_CLEAR);
  let a = localF.concat(srv).sort((x, y) => (y.ts || 0) - (x.ts || 0));
  if (S.RESTORED_URLS.size) a = a.filter(e => !S.RESTORED_URLS.has(histKey(e.url)));
  if (S.CARSLIDES.length) { const carK = new Set(S.CARSLIDES.map(x => histKey(x.url))); a = a.filter(e => !carK.has(histKey(e.url))); }
  if (S._deadUrls.size) a = a.filter(e => !S._deadUrls.has(histKey(e.url)));
  a.forEach(e => { if (!(e.src && e.src.app)) { const s = srvSrcOf(e.url); if (s) e.src = s; } });
  const hist = $('#hist'); if (!hist) return;
  hist.hidden = false; $('#histCnt').textContent = '(' + a.length + ')';
  const grid = $('#histGrid'); grid.innerHTML = '';
  const _histEm = $('#histEmpty'), _histTools = $('#histTools');
  if (!a.length) { if (_histEm) _histEm.hidden = false; if (_histTools) _histTools.hidden = true; return; }
  if (_histEm) _histEm.hidden = true; if (_histTools) _histTools.hidden = false;
  if (window.nmSeq) nmSeq.tag(a);
  a.forEach(e => grid.appendChild(histTileEl(e, grid, '#histCnt')));
}
export function histTileEl(e, grid, cntSel) {
  const it = document.createElement('div'); it.className = 'hist-it'; it.dataset.thid = thIdOf(e.url);
  const _tf = faceOf(e);

  const hd = document.createElement('div'); hd.className = 'hist-hd';
  const _sq = (window.nmSeq && nmSeq.of) ? nmSeq.of(e.url) : 0;
  const _hn = (e.src && e.src.jn != null && e.src.jn !== '' && isFinite(+e.src.jn)) ? pad3(e.src.jn) : (_sq ? pad3(_sq) : '');
  hd.textContent = (_hn ? _hn + ' · ' : '') + histTime(e.ts);
  if (_tf && _tf.ratio) { const _hf = document.createElement('span'); _hf.className = 'hfmt'; _hf.textContent = JFMT[_tf.ratio] ? JFMT[_tf.ratio][0] : _tf.ratio; hd.appendChild(_hf); }
  const th = document.createElement('div'); th.className = 'hist-thumb';
  const dl = document.createElement('a'); dl.className = 'imgdl dlbtn'; dl.href = e.url;
  dl.setAttribute('aria-label', '다운로드'); dl.innerHTML = DOWNLOAD_SVG; if (dlSeen(e.url)) dl.classList.add('dl-done'); dl.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); dlBlob(e.url, e.dlname || 'thumb.jpg'); dlMark(e.url, dl); });
  const img = document.createElement('img'); img.loading = 'lazy'; img.alt = ''; img.src = e.url; img.onerror = () => { it.remove(); S._deadUrls.add(histKey(e.url)); const cc = $(cntSel); if (cc) cc.textContent = '(' + grid.children.length + ')'; };

  const cap = document.createElement('span'); cap.className = 'hist-cap'; const _ttx = faceTx(_tf, false);
  cap.textContent = _ttx || e.cap || '';
  if (!_ttx && e.varStr) { const v = document.createElement('span'); v.className = 'hist-cap-v'; v.textContent = stripOpa(e.varStr); cap.appendChild(v); }
  th.append(dl, img, cap);
  if (canEditSrc(e.src)) {
    const ed = document.createElement('button'); ed.type = 'button'; ed.className = 'imgedit'; ed.title = '이 설정으로 수정'; ed.setAttribute('aria-label', '수정');
    ed.innerHTML = EDIT_SVG;
    ed.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); if (cntSel === '#histCnt') carShowOne(e); editOpenSrc(e.src, e.url); });
    th.appendChild(ed);
  }

  if (cntSel === '#histCnt') {
    th.classList.add('hist-go'); th.setAttribute('role', 'button'); th.tabIndex = 0;
    th.title = '탭 = 이 제작물을 위 결과로 올리기';
    const goT = ev => { if (ev) ev.preventDefault(); if (carShowOne(e)) { scrollMid($('#carH')); flashEl($('#carwrap')); } };
    th.addEventListener('click', goT);
    th.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') goT(ev); });
  }
  it.append(hd, th);
  return it;
}
export function carShowOne(e) {
  if (!e || !e.url) return false;
  S.CARSLIDES.length = 0;
  const tr = $('#cartrack'); if (tr) { tr.innerHTML = ''; tr.style.height = ''; }
  carAppend(e.url, e.dlname || '', e.cap || '', { _restored: true, t0: e.ts, src: e.src }, e.varStr || '', null, true, e.cap || '');
  return true;
}
export function jobShowCar(job) {
  const svs = (job.saves || []).filter(s => s && s.url); if (!svs.length) return;
  S.CARSLIDES.length = 0;
  const tr = $('#cartrack'); if (tr) { tr.innerHTML = ''; tr.style.height = ''; }
  const rj = { _restored: true, t0: job.t0, src: job.src };
  svs.forEach((s, i) => carAppend(s.url, s.dlname || '', s.cap || '', rj, s.varStr || '', null, true, s.cap || '', i > 0));
  const ch = $('#carH'), cw = $('#carwrap');
  if (ch && cw && cw.hidden) ch.click(); else if (ch) ch.setAttribute('aria-expanded', 'true');
  scrollMid($('#carwrap'));
}
export function renderCarGrid() {
  const grid = $('#carGrid'); if (!grid) return;
  grid.innerHTML = '';
  const a = S.CARSLIDES.filter(e => !e.dead && !S._deadUrls.has(histKey(e.url))).reverse();
  if (window.nmSeq) nmSeq.tag(a);
  a.forEach(e => grid.appendChild(histTileEl(e, grid, '#carHCnt')));
  grid.hidden = !a.length;
}

export function start() {
document.addEventListener('click', e => {
  if (e.target.closest('button,[role="button"],a,input,select,textarea,label,[data-p],[data-cyc]')) return;
  const row = e.target.closest('.scard'); if (!row) return;
  const ctrls = [...row.querySelectorAll('button,[role="button"]')].filter(el => el.offsetParent !== null && !el.hasAttribute('hidden'));
  if (ctrls.length === 1) ctrls[0].click();
});
document.addEventListener('click', e => {
  const btn = e.target.closest('.cfold-chev'); if (!btn) return;
  const open = btn.getAttribute('aria-expanded') !== 'true';
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  const sub = document.getElementById(btn.getAttribute('aria-controls'));
  if (sub) sub.toggleAttribute('inert', !open);
});
document.querySelectorAll('.sp-slot .onoff').forEach(t => {
  const flip = () => { const on = !t.classList.contains('on'); t.classList.toggle('on', on); t.setAttribute('aria-pressed', String(on)); if (S.SPX) renderCpPrev(); };
  t.addEventListener('click', flip);
  t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
});
$('#carPrev').innerHTML = CHEV_L_SVG;
$('#carNext').innerHTML = CHEV_R_SVG;
$('#carPrev').onclick = () => { $('#cartrack').scrollBy({ left: -2 * carStride(), behavior: 'smooth' }); };
$('#carNext').onclick = () => { $('#cartrack').scrollBy({ left: 2 * carStride(), behavior: 'smooth' }); };
S.SRV_HIST = [];
S.SRV_CLEAR = 0;
S._syncOkTs = 0;
S._syncFails = 0;
S._syncWarned = false;
try { S.SRV_CLEAR = +localStorage.getItem('nomute_thumb_srvclr') || 0; } catch {}
S._histPolling = false;
S._histSig = '';
S._r2Polling = false;
S._r2Known = new Set();
S._histRetry = false;
S._histTimer = 0;
}
