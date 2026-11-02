// @ts-nocheck
// 썸네일 생성기 엔진 · 카드 제작 발사 짐·막힌 자리 표시·재개·부팅
//   원본 = 에디터 viewer/thumb.html 6097~6470줄(origin/main ee27c47b) — 줄 그대로 옮김 · 주석만 뺌(까닭·형 말은 원본 주석에 그대로)
//   바꾼 곳 = 화면 전역 let·var·표 const → S.<이름>(./state · 창 열 때마다 새로) · document·window·타이머 = ./rt(이 화면 뿌리 안으로 · 닫으면 다 걷음) · 함수는 그대로 내보내고 서로 가져옴
//   다시 맞출 땐 원본 줄을 통째로 다시 떼어 같은 codemod 로(손으로 고친 줄 0 · 원본 갈아 끼우는 함수 selApp·updateGoSpec = S 에 올림 · hoist())
import { S } from "./state";
import { clearTimeout, document, fetch, parent, requestAnimationFrame, setInterval, setTimeout, window } from "./rt";
import { $, appHidden, getName, getPlatform, getYear, spGo, upsJob, upsScale } from "./p01-core";
import { cpBake, cpFillGap, cpPanGap } from "./p02-preview";
import { getComboOpas, imgPendWait } from "./p03-options";
import { genJob, rszAspect, rszJob, rszWait } from "./p04-media";
import { buildParams, hasEmph2, normEmph, stripStrayStars } from "./p05-text";
import { draftRestore, idbPrune, snapForm } from "./p06-draft";
import { jobBid, jobHasId, joinLbl, pendPut, pollJob, renderJob } from "./p07-jobs";
import { THUMB_HMS, _syncCheck, loadServerHist, maybeOpenHist, pollR2Recent, pollServerHist, renderHist } from "./p08-results";
import { buildEmphText, edAnyOver, estTracking } from "./p10-cards";
import { HDR, abbr, dispatchBatch, dispatchJob, effOvFmt, estHeaderTr, goFire, jobLabel, ovTrkKey } from "./p11-fit";
import { applySpellReview, clearSpellReview, flushLearned, ieGo, paintGoReview, renderSpellChips, runSpellCheck, spellTargets } from "./p12-spell";

export async function a2Build(defer) {
  const E = (m, cls, at, hint, also) => ({ err: { m, cls, at, hint, also } });
  let csub = $('#cSub').value.trim(), ctitle = $('#cTitle').value.trim();
  let clines = S.A2M === 'c' ? [] : normEmph(stripStrayStars($('#cLines').value)).split('\n').map(s => s.trim()).filter(Boolean);
  const hasCard = S.A2M === 'c' && S.edLines.some(l => l.some(ch => (ch.text || '').trim()));
  const hasHeader = !!(csub && ctitle), partHeader = !!(csub || ctitle), hasOverlay = clines.length > 0;
  if (partHeader && !hasHeader) return E('입력 필요', 'err', csub ? '#cTitle' : '#cSub');
  if (!hasHeader && !hasOverlay && !hasCard && S.cpThumb === 'off' && !S.guideMode) return E('입력 필요', 'err', S.A2M === 'c' ? '#edChips' : '#cSub', S.A2M === 'c' ? '' : '부제·제목이나 자막을 넣어줘', '#cTitle, #cLines');
  if (hasCard && !S.CIMG.b64) return E('선택 필요', 'err', '.cpprev-box');
  if (hasCard && edAnyOver()) return E('글자 초과', 'err', '#edChips');
  if (hasOverlay && !clines.some(hasEmph2)) return E('강조 확인', 'warn', '#cLines');
  if ($('#abbr').checked) { csub = abbr(csub); ctitle = abbr(ctitle); clines = clines.map(abbr); }

  const _trkOver = [];
  if (hasHeader) { if (estHeaderTr(csub, HDR.sub).over) _trkOver.push('부제'); if (estHeaderTr(ctitle, HDR.title).over) _trkOver.push('제목'); }
  if (hasOverlay && estTracking(clines, ovTrkKey()).over) _trkOver.push('자막');
  if (_trkOver.length) return E('자간 초과', 'warn', _trkOver[0] === '자막' ? '#cLines' : (_trkOver[0] === '부제' ? '#cSub' : '#cTitle'));
  const items = [];
  const _nolg = S.cLogoOff;
  if (hasHeader) items.push({ endpoint: '/api/thumb', payload: { app: '2', params: { mode: 'header', sub: csub, title: ctitle, bothBg: $('#cBg').checked, tpl: S.cTpl, ...(_nolg ? { nologo: 1 } : {}) } }, label: '릴스 헤더', tag: '헤더' });
  const _opas = getComboOpas();
  if (hasOverlay) {

    const f = effOvFmt();
    const ovp = f === 'post'
      ? { app: '1', params: { fmt: 'post', lines: clines, opas: _opas, ...(_nolg ? { nologo: 1 } : {}) } }
      : { app: '2', params: { mode: 'overlay', lines: clines, opas: _opas, ...(_nolg ? { nologo: 1 } : {}) } };
    const it = { endpoint: '/api/thumb', payload: ovp, label: (f === 'post' ? '포스트' : '릴스') + ' OPA' + _opas.join('·'), tag: '자막' };
    if (S.CIMG.b64 && !S.ovOnly) { if (defer) it._needBg = 1; else { ovp.imageB64 = (await cpBake(f)) || S.CIMG.b64; ovp.name = S.CIMG.name; } }
    items.push(it);
  }

  const CFL = { post: '포스트', reels: '릴스' };
  const gl = S.guideMode ? ($('#warnLines').value || '').split('\n').map(s => s.trim()).filter(Boolean) : [];
  if (S.cpThumb !== 'off') {
    const cfmt = S.cpThumb;
    const crParam = { year: getYear(), name: getName(), platform: getPlatform() };
    const tg = S.cpMerge ? items.filter(it => (it.tag === '헤더' && cfmt === 'reels') || (it.tag === '자막' && effOvFmt() === cfmt)) : [];
    if (tg.length) tg.forEach(it => { it.payload.params.copyright = crParam; });
    else items.push({ endpoint: '/api/thumb', payload: { app: '3', params: { fmt: cfmt, year: crParam.year, name: crParam.name, platform: crParam.platform } }, label: '저작권 (' + CFL[cfmt] + ')', tag: '저작권' });
  }
  if (gl.length) {
    const gfmt = S.cpThumb !== 'off' ? S.cpThumb : (effOvFmt() === 'post' ? 'post' : 'reels');
    const tg = S.cpMerge ? items.filter(it => (it.tag === '헤더' && gfmt === 'reels') || (it.tag === '자막' && effOvFmt() === gfmt)) : [];
    if (tg.length) tg.forEach(it => { it.payload.params.guide = gl; });
    else items.push({ endpoint: '/api/thumb', payload: { app: '4', params: { fmt: gfmt, lines: gl } }, label: '안내문 (' + CFL[gfmt] + ')', tag: '안내문' });
  }

  const cpLbl = ['헤더', hasOverlay ? '자막(OPA' + _opas.join('·') + ')' : '자막', '저작권', '안내문'].filter((_, i) => [hasHeader, hasOverlay, S.cpThumb !== 'off', gl.length > 0][i]).join('·');
  const _bfmts = new Set();
  if (hasHeader) _bfmts.add('reels');
  if (hasOverlay) _bfmts.add(effOvFmt());
  if (S.cpThumb !== 'off') _bfmts.add(S.cpThumb);
  if (gl.length) _bfmts.add(S.cpThumb !== 'off' ? S.cpThumb : (effOvFmt() === 'post' ? 'post' : 'reels'));
  const _bpfx = _bfmts.size === 1 ? CFL[[..._bfmts][0]] : '';
  return { items, lbl: (_bpfx ? _bpfx + ' ' : '') + cpLbl, hasCard, cl: hasCard ? buildEmphText().split('\n').map(s => s.trim()).filter(Boolean) : null, hasOverlay };
}
export function needClear() {
  if (!S.NEED) return;
  try { S.NEED.ac.abort(); } catch (_) {}
  S.NEED.t.classList.remove('need', 'need-warn');
  if (S.NEED.p && S.NEED.p.parentNode) S.NEED.p.remove();
  S.NEED = null;
}
export function needHintFor(m, t) {
  const id = t.id || '';
  const long = m === '자간 초과' || m === '글자 초과';
  if (t.closest('#cpPrev') && !t.closest('.trail')) return '사진을 넣어줘';
  if (id === 'esRsz' || id === 'rszOpts') return '비율을 골라줘';
  if (t.closest('#spSub')) return '프리셋을 골라줘';
  if (id === 'cSub') return long ? '부제가 너무 길어 — 줄여줘' : '부제를 넣어줘';
  if (id === 'cTitle') return long ? '제목이 너무 길어 — 줄여줘' : '제목을 넣어줘';
  if (id === 'cLines' || id === 'lines') return m === '강조 확인' ? '강조할 말을 *별표*로 감싸줘' : long ? '너무 길어 — 줄이거나 줄을 나눠줘' : '자막을 넣어줘';
  if (id === 'edChips') return long ? '글자 수를 줄여줘' : '카드 문구를 넣어줘';
  return m;
}
export function needMark(t, msg, cls, also) {
  needClear();
  const ac = new AbortController();
  t.classList.remove('thfocus'); t.classList.add('need'); if (cls === 'warn') t.classList.add('need-warn');
  const p = document.createElement('p'); p.className = 'need-hint' + (cls === 'warn' ? ' warn' : ''); p.setAttribute('role', 'alert'); p.textContent = msg;
  const pv = t.closest('#cpPrev');
  const anchor = pv ? pv.querySelector('.cpprev-box') : (t.closest('.iowrap') || t.closest('.edwrap') || t);
  (anchor || t).after(p);
  S.NEED = { t, p, ac };
  if (also) document.querySelectorAll(also).forEach(el => { if (el !== t) el.addEventListener('input', needClear, { signal: ac.signal }); });
  if (/^(INPUT|TEXTAREA)$/.test(t.tagName)) t.addEventListener('input', needClear, { signal: ac.signal });
  else if (!t.classList.contains('cpprev-box')) t.addEventListener('click', needClear, { signal: ac.signal });
}
export function needScroll(t) {
  try {
    const dock = $('#topDock'), cs = dock && getComputedStyle(dock), sticky = !!cs && cs.position === 'sticky';
    if (dock && dock.contains(t)) { if (!sticky && dock.getBoundingClientRect().bottom < 0) window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const cover = sticky ? (parseFloat(cs.top) || 0) + dock.offsetHeight : 0;
    const gap = 2 * (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sp-3')) || 18);
    const r = t.getBoundingClientRect(), p = S.NEED && S.NEED.t === t && S.NEED.p ? S.NEED.p.getBoundingClientRect() : r;
    if (r.top >= cover + gap / 2 && p.bottom <= (window.innerHeight || 700)) return;
    window.scrollTo({ top: Math.max(0, r.top + window.pageYOffset - cover - gap), behavior: 'smooth' });
  } catch (_) { try { t.scrollIntoView({ block: 'center' }); } catch (_) {} }
}
export function errStatus(m, cls, at, hint, also) {

  cls = cls || 'err';
  try {
    const t = typeof at === 'string' ? Array.from(document.querySelectorAll(at)).find(e => e.offsetParent !== null) : at;
    if (t && t.offsetParent !== null) {
      needMark(t, hint || needHintFor(m, t), cls, also);
      requestAnimationFrame(() => needScroll(t));
      if (/^(INPUT|TEXTAREA)$/.test(t.tagName)) setTimeout(() => { try { t.focus({ preventScroll: true }); } catch (_) {} }, 60);
    }
  } catch (_) {   }
  const s = $('#status'); s.textContent = ''; s.classList.remove('err', 'ok');
  const g = document.getElementById('go'); if (!g) return;
  if (!g.dataset.label) g.dataset.label = g.textContent;
  clearTimeout(g._fT1); clearTimeout(g._fT2); clearTimeout(g._fT3); clearTimeout(g._errT);
  g.classList.remove('firing', 'okdone', 'checking', 'err', 'warn', 'fy', 'spell-arm', 'spelling'); g.removeAttribute('aria-busy');
  g.textContent = m; g.setAttribute('aria-live', 'assertive');
  g.classList.add(cls); g.classList.remove('shake'); void g.offsetWidth; g.classList.add('shake');
  g._errT = setTimeout(() => { g.classList.remove('err', 'warn', 'shake'); g.textContent = g.dataset.label || '생성'; }, 1700); }
export function restorePending() {
  let a = []; try { a = nmJobs.list(S.PEND_KEY) || []; } catch (e) { return; }
  a.slice().sort((x, y) => (Number(x && x.bi) || 0) - (Number(y && y.bi) || 0)).forEach(p => {
    if (!p || !p.id) return;
    if (S.JOBS.some(j => jobHasId(j, p.id))) return;
    try { if (nmJobs.busy(S.PEND_KEY, p.id)) return; } catch (e) {}

    if (Date.now() - (p.t0 || 0) > 720 * 1000) { try { nmJobs.drop(S.PEND_KEY, p.id); } catch (e) {} return; }

    if (p.mode === 'gfree') { genJob((p.outs || []).length || 1, (p.payload && p.payload.opts) || null, '', { jid: p.id, n: p.n, t0: p.t0 }); return; }
    if (!Array.isArray(p.outs) || !p.outs.length) return;

    const pbid = (typeof p.bid === 'string' && p.bid) ? p.bid : '';
    if (pbid) {
      const host = S.JOBS.find(j => j && j.status === 'run' && !j.gfree && !j.rid && jobBid(j) === pbid && Array.isArray(j.outs) && j.outs.length);
      if (host) {
        const have = new Set(host.outs.map(o => o && o.path)); const add = p.outs.filter(o => o && o.path && !have.has(o.path));
        if (add.length) { host.outs = host.outs.concat(add); host.done = host.done.concat(add.map(() => false)); }
        if (!Array.isArray(host.thids)) host.thids = host.thid ? [host.thid] : [];
        if (!host.thids.includes(p.id)) host.thids.push(p.id);
        host.label = joinLbl(host.label, p.lbl || p.label || '');
        try { nmJobs.hold(S.PEND_KEY, p.id, () => { host.status = 'cancel'; if (host._timer) { clearTimeout(host._timer); host._timer = null; } }); } catch (e) {}
        pendPut(host); renderJob(host); return;
      }
    }

    const job = { n: p.n, label: p.label || p.lbl || '제작', t0: p.t0 || Date.now(), outs: p.outs, done: new Array(p.outs.length).fill(false), status: 'run', msg: '', endpoint: p.endpoint, payload: p.payload, src: p.src, thid: p.id, thids: (Array.isArray(p.thids) && p.thids.length) ? p.thids.slice() : [p.id], bid: pbid, _resumed: true };
    S.JOBS.unshift(job); renderJob(job); pollJob(job);
  });
}

export function start() {
$('#go').onclick = async () => {

  if (S._goLock) return; S._goLock = true;
  try {

  const status = $('#status'); status.classList.remove('err'); status.textContent = '';
  needClear();
  await imgPendWait();
  if (S.APP === '6') { parent.postMessage({ nm: 'genfree' }, '*'); return; }
  if (S.APP === '8') { ieGo(); return; }
  if (S.SPX) { await spGo(); return; }
  if (S.APP === '2' && S.A2M !== 'c' && !S.SPX && S.cpFillWant && cpPanGap()) { await cpFillGap(); return; }

  S._spellApplied = false;
  if (spellTargets().length) {
    if (S._spellReview) { applySpellReview(); }
    else { const found = await runSpellCheck(); if (found) { renderSpellChips(); paintGoReview(); return; } }
  }
  const SRC = snapForm();
  if (S.APP === '7') {
    if (!S.CIMG.b64) return errStatus('선택 필요', 'err', '.cpprev-box');
    if (rszAspect() === 'orig') return errStatus('선택 필요', 'err', '#esRsz, #rszOpts');
    goFire();
    const payload = { imageB64: S.CIMG.b64, name: S.CIMG.name, aspect: rszAspect(), size: '1K', lock: $('#rszLock').classList.contains('on'), fill: S.fillV };
    try {
      const r = await fetch('/api/resize', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.error) return errStatus('재시도');
      rszWait(true);
      rszJob(j.id, payload);
    } catch (err) {
      return errStatus('재시도');
    }
    return;
  }
  if (S.APP === '9') {
    if (!S.CIMG.b64) return errStatus('선택 필요', 'err', '.cpprev-box');
    goFire();
    const payload = { imageB64: S.CIMG.b64, name: S.CIMG.name, size: upsScale() };
    try {
      const r = await fetch('/api/upscale', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.error) return errStatus('재시도');
      rszWait(true);
      upsJob(j.id, payload);
    } catch (err) {
      return errStatus('재시도');
    }
    return;
  }
  if (S.APP === '5') {
    if (!S.IMG.b64) return errStatus('선택 필요', 'err', '.cpprev-box');
    if (edAnyOver()) return errStatus('글자 초과', 'err', '#edChips');
    const clines = buildEmphText().split('\n').map(s => s.trim()).filter(Boolean);
    if (!clines.length) return errStatus('입력 필요', 'err', '#cLines');
    dispatchJob('/api/compose', { imageB64: S.IMG.b64, name: S.IMG.name, lines: clines }, '카드뉴스', SRC);
    return;
  }
  if (S.APP === '3') {
    const fmt = S.cpFmt, FL = { post: '포스트', reels: '릴스' };
    const guideLines = S.guideMode ? ($('#warnLines').value || '').split('\n').map(s => s.trim()).filter(Boolean) : [];
    if (!S.copyOn && !guideLines.length) return errStatus('선택 필요', 'err', '#cpThumbRow');

    const items = [];
    if (S.copyOn) items.push({ endpoint: '/api/thumb', payload: { app: '3', params: { fmt, year: getYear(), name: getName(), platform: getPlatform() } }, label: '저작권 (' + FL[fmt] + ')', tag: '저작권' });
    if (guideLines.length) items.push({ endpoint: '/api/thumb', payload: { app: '4', params: { fmt, lines: guideLines } }, label: '안내문 (' + FL[fmt] + ')', tag: '안내문' });

    dispatchBatch(items, '저작권·안내문 (' + FL[fmt] + ')', SRC);
    return;
  }
  if (S.APP === '2') {
    const b = await a2Build(false);
    if (b.err) return errStatus(b.err.m, b.err.cls, b.err.at, b.err.hint, b.err.also);
    if (b.hasCard) {
      dispatchJob('/api/compose', { imageB64: (await cpBake('post')) || S.CIMG.b64, name: S.CIMG.name, lines: b.cl }, '카드뉴스', SRC);
    }
    if (!b.items.length) { if (!b.hasCard) return errStatus('입력 필요', 'err', '#cSub', '부제·제목이나 자막을 넣어줘', '#cTitle, #cLines'); return; }
    dispatchBatch(b.items, b.lbl, SRC);
    return;
  }

  const params = buildParams();
  if (S.APP === '1' && Array.isArray(params.lines)) params.lines = normEmph(stripStrayStars($('#lines').value)).split('\n').map(s => s.trim()).filter(Boolean);
  if (S.APP === '1' && !(Array.isArray(params.lines) && params.lines.length)) return errStatus('입력 필요', 'err', '#lines');
  if (S.APP === '1' && $('#abbr').checked && Array.isArray(params.lines)) params.lines = params.lines.map(abbr);
  if (S.APP === '1' && !params.lines.some(hasEmph2)) return errStatus('강조 확인', 'warn', '#lines');
  if (S.APP === '1' && estTracking(params.lines, 'post').over) return errStatus('자간 초과', 'warn', '#lines');
  const payload = { app: S.APP, params };
  if (S.APP === '1' && S.PIMG.b64) { payload.imageB64 = S.PIMG.b64; payload.name = S.PIMG.name; }
  dispatchJob('/api/thumb', payload, jobLabel(), SRC);
  } finally { S._goLock = false; }
};
S.NEED = null;
document.addEventListener('click', e => {
  const b = e.target.closest('.dlbtn'); if (!b) return;
  if (!b.matches('.cref-dlall')) b.classList.add('dl-done');
  const o = document.createElement('span'); o.className = 'dl-ack';
  o.innerHTML = '<span class="dl-ring"></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';
  if (getComputedStyle(b).position === 'static') b.style.position = 'relative';
  b.appendChild(o); setTimeout(() => o.remove(), 700);
}, true);
['#lines', '#warnLines', '#cSub', '#cTitle', '#cLines'].forEach(id => { const el = $(id); if (el) el.addEventListener('input', () => { if (!S._applyingSpell && S._spellReview) clearSpellReview(); }); });
document.querySelectorAll('#tabs .tab').forEach(t => { if (appHidden(t.dataset.app)) t.hidden = true; if (S.EDIT_TAB_OFF && t.dataset.app === '7') t.textContent = '모자이크'; });
S.selApp('2');
draftRestore();
S._draftReady = true;
renderHist();
idbPrune(Date.now() - THUMB_HMS);
restorePending();
maybeOpenHist();
loadServerHist();
window.addEventListener('storage', e => { if (e && e.key === S.PEND_KEY) restorePending(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) restorePending(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) S._syncFails = 0; pollServerHist(); pollR2Recent(); });
window.addEventListener('focus', () => { pollServerHist(); pollR2Recent(); });
window.addEventListener('pageshow', e => { if (e.persisted) { S._syncFails = 0; pollServerHist(); pollR2Recent(); } });
setInterval(() => { pollServerHist(); pollR2Recent(); _syncCheck(); }, 10000);
pollR2Recent();
window.nmRefresh = () => { pollR2Recent(); try { flushLearned(); } catch {} return pollServerHist(); };
window.nmSyncBusy = () => S.JOBS.some(j => j && j.status !== 'done' && j.status !== 'err')
  || !!S.CIMG.b64
  || ['#lines', '#cSub', '#cTitle', '#cLines', '#warnLines'].some(s => { const el = $(s); return !!(el && el.value && el.value.trim()); })
  || (typeof S.A2M !== 'undefined' && S.A2M === 'c' && S.edLines.some(l => l.some(ch => (ch.text || '').trim())));
}
