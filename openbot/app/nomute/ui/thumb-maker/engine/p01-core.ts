// @ts-nocheck
// 썸네일 생성기 엔진 · 뼈대 — 확인 창·앱 전환(selApp)·해상도·채움·모자이크 토글·줄 수 한도·저작권·합성
//   원본 = 에디터 viewer/thumb.html 1304~1725줄(origin/main ee27c47b) — 줄 그대로 옮김 · 주석만 뺌(까닭·형 말은 원본 주석에 그대로)
//   바꾼 곳 = 화면 전역 let·var·표 const → S.<이름>(./state · 창 열 때마다 새로) · document·window·타이머 = ./rt(이 화면 뿌리 안으로 · 닫으면 다 걷음) · 함수는 그대로 내보내고 서로 가져옴
//   다시 맞출 땐 원본 줄을 통째로 다시 떼어 같은 codemod 로(손으로 고친 줄 0 · 원본 갈아 끼우는 함수 selApp·updateGoSpec = S 에 올림 · hoist())
import { S } from "./state";
import { clearTimeout, document, fetch, requestAnimationFrame, setTimeout, window } from "./rt";
import { renderCpPrev } from "./p02-preview";
import { jobUiPulse, rszApply, rszAspect, rszJob, rszMeasure, rszRunning, rszWait } from "./p04-media";
import { normEmph, stripStrayStars } from "./p05-text";
import { dlStamp, jobSeqIssue, renderJob } from "./p07-jobs";
import { carAppend, flashEl, jobNo, jobNo3 } from "./p08-results";
import { clearRestored } from "./p09-restore";
import { renderEditChips } from "./p10-cards";
import { effOvFmt, goFire, updateComboTrk, updateTrkHint } from "./p11-fit";
import { clearSpellReview, ieRender, ieSyncGo } from "./p12-spell";
import { errStatus, needClear } from "./p13-fire";

export const $ = s => document.querySelector(s);
export function askConfirm(msg) {
  return new Promise(resolve => {
    const dlg = $('#cfmdlg'); $('#cfmMsg').textContent = msg;
    const done = v => { dlg.close(); cleanup(); resolve(v); };
    const onYes = () => done(true), onNo = () => done(false);
    const onBackdrop = e => { if (e.target === dlg) done(false); };
    const onCancel = e => { e.preventDefault(); done(false); };

    const onKey = e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done(false); } };
    function cleanup() {
      $('#cfmYes').removeEventListener('click', onYes); $('#cfmNo').removeEventListener('click', onNo);
      dlg.removeEventListener('click', onBackdrop); dlg.removeEventListener('cancel', onCancel);
      document.removeEventListener('keydown', onKey, true);
    }
    $('#cfmYes').addEventListener('click', onYes); $('#cfmNo').addEventListener('click', onNo);
    dlg.addEventListener('click', onBackdrop); dlg.addEventListener('cancel', onCancel);
    document.addEventListener('keydown', onKey, true);
    dlg.showModal();
  });
}
export function appHidden(a) { return S.EDIT_TAB_OFF && ['6', '7', '9', 'sp'].includes(String(a || '')); }
export const isFam2 = a => a === '2' || a === '7' || a === '8' || a === '9';
export const isEditApp = a => a === '7' || a === '8' || a === '9';
export const UPS_ORDER = ['720p', 'FHD', '2K', '4K'];
export const SIZE_SHORT = { '720p': 720, 'FHD': 1080, '2K': 1440, '4K': 2160 };
export function upsScale() { return UPS_ORDER.indexOf(S.upsV) >= 0 ? S.upsV : 'FHD'; }
export function upsLabel(v) { return UPS_ORDER.indexOf(v) >= 0 ? v : 'FHD'; }
export function upsApply(v) { S.upsV = UPS_ORDER.indexOf(v) >= 0 ? v : 'FHD'; document.querySelectorAll('#upsOpts .ropt').forEach(b => b.classList.toggle('on', b.dataset.v === S.upsV)); if (typeof S.updateGoSpec === 'function') S.updateGoSpec(); }
export const FILL_ORDER = ['auto', 'solid', 'blur', 'ai'];
export const FILL_KO = { auto: '자동', solid: '단색', blur: '블러', ai: 'AI' };
export function fillLabel(v) { return FILL_KO[v] || '자동'; }
export function fillApply(v) { S.fillV = FILL_ORDER.indexOf(v) >= 0 ? v : 'auto'; document.querySelectorAll('#fillOpts .ropt').forEach(b => b.classList.toggle('on', b.dataset.v === S.fillV)); if (typeof S.updateGoSpec === 'function') S.updateGoSpec(); }
export async function upsLoad() {
  try {
    const sig = (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? AbortSignal.timeout(12000) : null;
    const r = await fetch('gen_out/upscale.json?t=' + Date.now(), sig ? { signal: sig } : undefined);
    if (!r.ok) return [];
    const tx = await r.text();
    if (/^\s*</.test(tx)) return [];
    const items = JSON.parse(tx);
    return Array.isArray(items) ? items : [];
  } catch (e) { return []; }
}
export function upsJob(rid, payload) {
  clearRestored();
  const o = { path: '', label: payload.size };
  const job = { n: jobSeqIssue(), label: '해상도 (' + payload.size + ')', t0: Date.now(), outs: [o], done: [false], status: 'run', msg: '', rid, payload, endpoint: '/api/upscale' };
  S.JOBS.unshift(job); renderJob(job); jobUiPulse(job);
  const SOFT_S = 150, HARD_S = 1200;
  const tick = async () => {
    if (job._timer) { clearTimeout(job._timer); job._timer = null; }
    if (job.status !== 'run' || job._polling) return;
    job._polling = 1;
    try {
      const el = Math.round((Date.now() - job.t0) / 1000);
      if (el > HARD_S) { job.status = 'err'; job.msg = '시간 초과(20분) — 러너 큐 혼잡/실패 가능, 재시도 가능'; renderJob(job); if (!rszRunning()) rszWait(false); return; }
      job._queued = el > SOFT_S;
      renderJob(job);
      const hit = (await upsLoad()).find(i => i && i.id === job.rid && i.url);
      if (job.status !== 'run') return;
      if (hit) {
        o.path = hit.url;
        job.done[0] = true; job.status = 'done';
        carAppend(hit.url + (hit.url.indexOf('?') < 0 ? '?t=' + Date.now() : ''), dlStamp(job.t0) + '_해상도_' + jobNo3(job) + '_' + payload.size + '.jpg', '해상도' + jobNo(job), job, ' · ' + payload.size, o, false, payload.name || ('해상도' + jobNo(job)));
        renderJob(job);
        if (!rszRunning()) rszWait(false);
        return;
      }
      job._timer = setTimeout(tick, 25000);
    } finally { job._polling = 0; }
  };
  job._tick = tick;
  tick();
}
export async function upsRefire(job) {
  goFire(); clearRestored();
  try {
    const r = await fetch('/api/upscale', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(job.payload) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.error) { job.msg = j.error || ('서버 ' + r.status); renderJob(job); return; }
    job.rid = j.id; job.t0 = Date.now(); job.status = 'run'; job.done = [false]; job.msg = ''; delete job._queued;
    job.outs[0].path = '';
    renderJob(job); jobUiPulse(job); rszWait(true); if (job._tick) job._tick();
  } catch (e) { job.msg = '요청 실패: ' + e.message; renderJob(job); }
}
export const SP_PRESETS = [{ ar: '4:5', nm: '포스트' }, { ar: '9:16', nm: '릴스' }];
export function spOnAspects() { return Array.from(document.querySelectorAll('#spSub .sp-slot .onoff')).map((t, i) => (t.classList.contains('on') && SP_PRESETS[i]) ? SP_PRESETS[i].ar : null).filter(Boolean); }
export async function spGo() {
  if (!S.CIMG.b64) return errStatus('입력 필요', 'err', '.cpprev-box', '사진을 넣어줘');
  const ars = spOnAspects();
  if (!ars.length) return errStatus('선택 필요', 'err', '#spSub .optcards', '프리셋을 골라줘');
  goFire();
  for (const ar of ars) {
    const payload = { imageB64: S.CIMG.b64, name: S.CIMG.name, aspect: ar, size: '1K', lock: true, fill: 'auto' };
    try {
      const r = await fetch('/api/resize', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.error) return errStatus('재시도');
      rszJob(j.id, payload);
    } catch (_) { return errStatus('재시도'); }
  }
}
function selApp(a) {
  needClear();
  const sp = a === 'sp'; if (sp) a = '2'; S.SPX = sp;
  S.APP = a;
  if (a === '2' && rszAspect() !== 'orig') rszApply('orig');

  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', sp ? t.dataset.app === 'sp' : (t.dataset.app === a || (isEditApp(a) && t.dataset.app === '7'))));

  const edit = isEditApp(a);
  $('#imgBox').classList.toggle('none', a !== '5');
  $('#linesBox').classList.toggle('none', a !== '1');
  $('#cardBox').classList.toggle('none', a !== '5');
  $('#reelsBox').classList.toggle('none', a !== '2' || sp);
  $('#copyBox').classList.toggle('none', a !== '3');
  $('#abbrBox').classList.add('none');
  $('#opaBox').classList.toggle('none', a !== '1');
  $('#rszBox').classList.toggle('none', !edit || a === '8');
  const _fr = $('#fillRow'); if (_fr) _fr.classList.toggle('none', !edit || a === '8');
  $('#imgeditBox').classList.toggle('none', a !== '8');
  $('#ieTogRow').classList.toggle('none', !edit);
  $('#upsRow').classList.toggle('none', !edit);
  $('#opaRow').classList.toggle('none', a !== '2' || sp);
  if (a === '2' && !sp) { const oc = $('#opaChips'); if (oc && oc._railUpd) requestAnimationFrame(oc._railUpd); }
  $('#rOptHead').classList.toggle('none', a !== '2' || sp);
  $('#spHead').classList.toggle('none', !sp); $('#spSub').classList.toggle('none', !sp);

  const _oc = $('#optCards'); if (_oc) _oc.classList.toggle('edit', edit);
  syncIeTog(); rszOrigSync(); iePrevSync();
  rszWait();
  if (S.IMG.b64 && a === '5' && $('#fileLab')._set) $('#fileLab')._set(S.IMG.b64, S.IMG.name);
  if (a === '8' && typeof ieRender === 'function') ieRender();
  if (a === '5') { if (!S.edLines.length) S.edLines = [[]]; renderEditChips(); }
  if (a === '1') updateTrkHint('lines', 'linesTrk', 'post');
  if (a === '2') updateComboTrk();
  if (a === '3') { syncCpFmt(); syncCopyTog(); syncGuide(); }
  $('#cpThumbRow').classList.toggle('none', a !== '2' || sp);
  $('#gdArea').classList.toggle('none', a !== '2' || sp);
  if (a === '2') { syncCpThumb(); syncGuide(); } else { updateCpMount(); }
  const _cp = $('#cpPrev'); if (_cp && !(a === '2' || edit)) _cp.classList.add('none'); else if (_cp) renderCpPrev();

  clearSpellReview();
  const gb = $('#go');
  if (gb) { const lbl = '생성'; gb.dataset.label = lbl;
    if (!gb.classList.contains('firing') && !gb.classList.contains('okdone') && !gb.classList.contains('spell-arm') && !gb.classList.contains('rszbusy')) gb.textContent = lbl; }
  if (a === '8' && typeof ieSyncGo === 'function') ieSyncGo();
  S.updateGoSpec();
}
export function iePrevSync() {
  const p = $('#iePrev'); if (!p) return;
  p.classList.toggle('none', !(isEditApp(S.APP) && S.CIMG.b64));
}
export const PEND_TTL = 120000;
export function armAfterAttach(run) {

  if (S.CIMG.b64) return false;
  errStatus('입력 필요', 'err', '.cpprev-box');
  S.PENDACT = { at: Date.now(), run: typeof run === 'function' ? run : null, app: S.APP };
  const f = $('#cFile'); if (f) f.click();
  return true;
}
export function editResetDefaults() {

  S.RSZ.w = S.RSZ.h = 0;
  S.PENDACT = null;
  rszApply('orig');
  upsApply('FHD');
  fillApply('auto');
}
export function ieSrcSync(has) {
  S.CPAN.s = 1; S.CPAN.x = 0; S.CPAN.y = 0;
  return ieSrcSync0(has);
}
export function ieSrcSync0(has) {
  if (has && S.CIMG.b64) { rszMeasure(S.CIMG.b64); if (S.NEED && S.NEED.t.classList.contains('cpprev-box')) needClear();
    if (S.PENDACT && Date.now() - S.PENDACT.at < PEND_TTL && (isEditApp(S.APP) || S.PENDACT.app === S.APP)) { const run = S.PENDACT.run; S.PENDACT = null; if (run) run(); }
  }
  else { editResetDefaults(); if (isEditApp(S.APP)) { S.selApp(S.EDIT_TAB_OFF ? '2' : '7'); return; }
  }
  iePrevSync();
  if (S.APP === '8' && typeof ieRender === 'function') ieRender();
  if (typeof renderCpPrev === 'function') renderCpPrev();
}
export function syncIeTog() { const t = $('#ieTog'); if (!t) return; const on = S.APP === '8'; t.classList.toggle('on', on); t.setAttribute('aria-pressed', on); }
export function rszPickHint() {
  const key = S.APP + '|' + (S.CIMG.name || '') + '|' + (S.CIMG.b64 || '').length;
  if (!S.CIMG.b64 || S._rszHintKey === key) return;
  S._rszHintKey = key;
  if (rszAspect() !== 'orig') return;
  setTimeout(() => { const el = $('#rszOpts'); if (el && el.offsetParent !== null && rszAspect() === 'orig') flashEl(el); }, 420);
}
export function rszOrigSync() {
  const orig = rszAspect() === 'orig';
  const sep = $('#rszSep'), lk = $('#rszLock'), ll = $('#rszLockLbl');
  const cardHide = isEditApp(S.APP);
  if (sep) sep.classList.toggle('none', orig || cardHide); if (lk) lk.classList.toggle('none', orig || cardHide); if (ll) ll.classList.toggle('none', orig || cardHide);
  const dk = $('#esLock'); if (dk) dk.classList.toggle('none', orig);
  const fc = $('#esFillCard'); if (fc) fc.classList.toggle('none', orig);
}
export function maxLinesFor(ta) {
  if (ta.id === 'lines') return S.APP === '1' ? 3 : S.APP === '5' ? 4 : 0;
  if (ta.id === 'cLines') return 3;
  if (ta.id === 'warnLines') return 2;
  return 0;
}
export const GLAB = { caution: '경고', ai: 'AI', free: '자유문구' };
export const WARN_PRESETS = {
  ai: '본 이미지는 생성형 AI로 제작·합성되었습니다.',
  caution: '공익적 목적의 사회 시사 콘텐츠입니다.\n민감한 내용이 포함될 수 있으니 유의 바랍니다.',
};
export function getYear() { return ($('#cphYear').textContent || '').replace(/[^0-9.\-]/g, '') || '2026'; }
export function setYear(v) { const s = String(v == null ? '' : v).replace(/[^0-9.\-]/g, ''); $('#cphYear').textContent = s || '2026'; }
export function getName() { return ($('#cphName').textContent || '').replace(/\s+/g, ' ').trim(); }
export function setName(v) { $('#cphName').textContent = v || ''; }
export function updCphDef() {
  const yr = $('#cphYear'), nm = $('#cphName'), pl = $('#cphPlat');
  if (yr) yr.classList.toggle('cph-def', (yr.textContent.trim() || '2026') === '2026');
  if (nm) nm.classList.toggle('cph-def', !nm.textContent.trim());
  if (pl) pl.classList.toggle('cph-def', (pl.dataset.plat || 'threads') === 'threads');
  renderCpPrev();
}
export function getPlatform() {
  const p = $('#cphPlat').dataset.plat;
  if (p === 'none') return '';
  return p === 'custom' ? $('#cplat').value.trim() : p;
}
export function setPlat(plat) {
  const t = $('#cphPlat'), custom = plat === 'custom', noP = plat === 'none';
  t.dataset.plat = plat;
  t.textContent = noP ? '플랫폼 없음' : (custom ? '직접' : plat);
  t.classList.toggle('cph-noplat', noP);
  $('#cplat').classList.toggle('none', !custom);
}
export function fitPlatWidth() {
  const t = $('#cphPlat'); if (!t) return;
  const cs = getComputedStyle(t);
  const c = t.cloneNode(false);
  c.style.cssText = 'position:absolute; visibility:hidden; min-width:0; white-space:pre; left:-9999px';
  c.style.fontSize = cs.fontSize; c.style.fontFamily = cs.fontFamily;
  document.body.appendChild(c);
  let w = 0;
  [['threads', 0], ['youtube', 0], ['X', 0], ['instagram', 0], ['플랫폼 없음', 1], ['직접', 0]].forEach(([lab, noP]) => {
    c.classList.toggle('cph-noplat', !!noP); c.textContent = lab;
    w = Math.max(w, c.getBoundingClientRect().width);
  });
  c.remove();
  const fs = parseFloat(cs.fontSize) || 14;
  if (w && w + 1 > fs * 5.2) t.style.minWidth = ((w + 1) / fs).toFixed(3) + 'em';
}
export function syncCpFmt() {
  const t = $('#cpFmtTog'); if (!t) return;
  t.textContent = S.cpFmt === 'post' ? '포스트' : '릴스';
  t.classList.toggle('post', S.cpFmt === 'post'); t.classList.toggle('reels', S.cpFmt === 'reels');
  t.setAttribute('aria-label', '포맷 ' + t.textContent + ' (탭=전환)');
}
export function syncCopyTog() {
  const t = $('#copyTog'); if (t) { t.classList.toggle('on', S.copyOn); t.setAttribute('aria-pressed', S.copyOn ? 'true' : 'false'); }
  $('#cphLine') && $('#cphLine').classList.toggle('off', !S.copyOn);
}
export function syncGuide() {
  const t = $('#guideTog'); if (t) { t.textContent = S.guideMode ? GLAB[S.guideMode] : 'OFF'; t.classList.toggle('on', !!S.guideMode); t.setAttribute('aria-pressed', S.guideMode ? 'true' : 'false'); }
  const wl = $('#warnLines'); if (!wl) return;
  const wrap = wl.parentNode, btn = wrap && wrap.querySelector('.iobtn');
  if (btn) {
    wl.classList.remove('none'); wrap.classList.toggle('none', !S.guideMode);

  } else { wl.classList.toggle('none', !S.guideMode); }
}
export function syncCpThumb() {
  const t = $('#cpThumbTog'); if (!t) return;
  const M = { off: ['OFF', 'cpoff'], reels: ['릴스', 'reels'], post: ['포스트', 'post'] };
  const [txt, cls] = M[S.cpThumb] || M.off;
  t.textContent = txt; t.className = 'ovfmt ' + cls;
  t.setAttribute('aria-label', '저작권 ' + txt + ' (탭=OFF↔릴스↔포스트)');
  updateCpMount();
  syncCpMerge(); renderCpPrev();
}
export function updateCpMount() {
  const blk = $('#cpBlock'); if (!blk) return;
  if (S.APP === '2' && S.cpThumb !== 'off') {
    if (blk.parentNode !== $('#cpThumbSlot')) $('#cpThumbSlot').appendChild(blk);
    $('#cphLine').classList.remove('off');
    syncGuide();
    requestAnimationFrame(() => blk.classList.add('cpshow'));
  } else {
    blk.classList.remove('cpshow');
    if (blk.parentNode !== $('#copyBox')) $('#copyBox').appendChild(blk);
  }
}
export function cpFireOk(k) {
  const csub = (($('#cSub') && $('#cSub').value) || '').trim(), ctitle = (($('#cTitle') && $('#cTitle').value) || '').trim();
  if (k === 'hdr' || k === 'nobg') return !!(csub && ctitle);
  if (k === 'ov') {
    if (typeof S.A2M !== 'undefined' && S.A2M === 'c') return false;
    return normEmph(stripStrayStars((($('#cLines') && $('#cLines').value) || ''))).split('\n').map(s => s.trim()).filter(Boolean).length > 0;
  }
  return false;
}
export function cpMergeOn(x, fmt) {
  if (!S.cpMerge || !x) return false;
  if (x.k === 'hdr' || x.k === 'nobg') return fmt === 'reels' && cpFireOk(x.k);
  if (x.k === 'ov') return effOvFmt() === fmt && cpFireOk('ov');
  return false;
}
export function syncCpMerge() {
  const w = $('#gsMergeWrap'); if (w) w.hidden = (S.cpThumb === 'off' && !S.guideMode);
  const t = $('#gsMerge'); if (t) { t.classList.toggle('on', S.cpMerge); t.setAttribute('aria-pressed', S.cpMerge ? 'true' : 'false'); }
}

/** 원본에서 나중에 갈아 끼우는 함수 = 맨 처음(모든 조각 start 전) S 에 올림 · 원본의 함수 끌어올림과 같은 때 */
export function hoist() {
  S.selApp = selApp;
}

export function start() {
S.APP = '1';
S.FMT = 'post';
S.OPA_STEP = 10;
S.cOpaSel = [60];
S.ovOnly = false;
S.ovFmt = 'post';
S._spellReview = null;
S._spellApplied = false;
S._applyingSpell = false;
S.IMG = { b64: '', name: '' };
S.CIMG = { b64: '', name: '' };
S.EDIT_TAB_OFF = true;
S.PIMG = { b64: '', name: '' };
S.upsV = 'FHD';
(function () {
  const wrap = $('#upsOpts'); if (!wrap) return;
  const pick = v => {
    const editing = isEditApp(S.APP);
    if (editing && armAfterAttach(() => pick(v))) return;
    upsApply(v);
    if (editing) { rszApply('orig'); if (S.APP !== '9') S.selApp('9'); }
  };
  wrap.addEventListener('click', e => { const b = e.target.closest('.ropt'); if (!b) return; e.stopPropagation(); pick(b.dataset.v); });
  wrap.addEventListener('keydown', e => { const b = e.target.closest('.ropt'); if (b && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(b.dataset.v); } });
})();
S.fillV = 'auto';
(function () {
  const wrap = $('#fillOpts'); if (!wrap) return;
  const pick = v => { if (armAfterAttach(() => pick(v))) return; fillApply(v); };
  wrap.addEventListener('click', e => { const b = e.target.closest('.ropt'); if (!b) return; e.stopPropagation(); pick(b.dataset.v); });
  wrap.addEventListener('keydown', e => { const b = e.target.closest('.ropt'); if (b && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(b.dataset.v); } });
})();
S.SPX = false;
document.querySelectorAll('.tab').forEach(t => t.onclick = () => { S.selApp(t.dataset.app); window.scrollTo({ top: 0, behavior: 'smooth' }); });
S.PENDACT = null;
S._rszHintKey = '';
(function () {
  const t = $('#ieTog'); if (!t) return;
  const flip = () => {
    if (S.APP === '8') { S.selApp(S.EDIT_TAB_OFF ? '2' : '7'); return; }

    if (armAfterAttach(() => { rszApply('orig'); S.selApp('8'); })) return;
    rszApply('orig');
    S.selApp('8');
  };
  t.addEventListener('click', flip); t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
})();
['lines', 'cLines', 'warnLines'].forEach(id => {
  const ta = document.getElementById(id);
  ta.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const m = maxLinesFor(ta); if (m && ta.value.split('\n').length >= m) e.preventDefault(); }
  });
  ta.addEventListener('input', () => {
    const m = maxLinesFor(ta); if (!m) return;
    const ls = ta.value.split('\n'); if (ls.length > m) ta.value = ls.slice(0, m).join('\n');
  });
});
S.cpFmt = 'reels';
S.copyOn = true;
S.guideMode = '';
S.cpThumb = 'off';
fitPlatWidth();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitPlatWidth);
(function () {
  const t = $('#cpThumbTog'); if (!t) return;
  const NEXT = { off: 'reels', reels: 'post', post: 'off' };
  const tog = () => { S.cpThumb = NEXT[S.cpThumb] || 'reels'; syncCpThumb(); };
  t.addEventListener('click', tog);
  t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(); } });
})();
S.cpMerge = false;
(function () {
  const t = $('#gsMerge'); if (!t) return;
  const tog = () => { S.cpMerge = !S.cpMerge; syncCpMerge(); renderCpPrev(); };
  t.addEventListener('click', tog);
  t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(); } });
})();
}
