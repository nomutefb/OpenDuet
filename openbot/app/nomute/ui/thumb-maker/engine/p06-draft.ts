// @ts-nocheck
// 썸네일 생성기 엔진 · 수정(이전 제작 → 작성기 복원)·드래프트 자동 보관
//   원본 = 에디터 viewer/thumb.html 3525~3767줄(origin/main ee27c47b) — 줄 그대로 옮김 · 주석만 뺌(까닭·형 말은 원본 주석에 그대로)
//   바꾼 곳 = 화면 전역 let·var·표 const → S.<이름>(./state · 창 열 때마다 새로) · document·window·타이머 = ./rt(이 화면 뿌리 안으로 · 닫으면 다 걷음) · 함수는 그대로 내보내고 서로 가져옴
//   다시 맞출 땐 원본 줄을 통째로 다시 떼어 같은 codemod 로(손으로 고친 줄 0 · 원본 갈아 끼우는 함수 selApp·updateGoSpec = S 에 올림 · hoist())
import { S } from "./state";
import { clearTimeout, document, fetch, setTimeout, window } from "./rt";
import { $, appHidden, getName, getYear, setName, setPlat, setYear, syncCopyTog, syncCpFmt, syncCpThumb, syncGuide, updCphDef } from "./p01-core";
import { OPA_CHIPS, getOpas, imgPendBegin, opaSet, setA2Mode } from "./p03-options";
import { thIdOf } from "./p08-results";
import { renderEditChips } from "./p10-cards";
import { syncCTpl, updateComboTrk, updateTrkHint } from "./p11-fit";
import { errStatus } from "./p13-fire";

export function idbOpen() { return new Promise((res, rej) => { let r; try { r = indexedDB.open(S.IDB_NAME, 1); } catch (e) { return rej(e); } r.onupgradeneeded = () => { const db = r.result; if (!db.objectStoreNames.contains(S.IDB_STORE)) db.createObjectStore(S.IDB_STORE); }; r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
export async function idbPut(key, b64) { try { const db = await idbOpen(); await new Promise((res, rej) => { const tx = db.transaction(S.IDB_STORE, 'readwrite'); tx.objectStore(S.IDB_STORE).put({ b64, ts: Date.now() }, key); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); }); return true; } catch { return false; } }
export async function idbGet(key) { try { const db = await idbOpen(); return await new Promise(res => { const tx = db.transaction(S.IDB_STORE, 'readonly'); const rq = tx.objectStore(S.IDB_STORE).get(key); rq.onsuccess = () => res(rq.result || null); rq.onerror = () => res(null); }); } catch { return null; } }
export function idbPrune(cut) { idbOpen().then(db => { const tx = db.transaction(S.IDB_STORE, 'readwrite'); const st = tx.objectStore(S.IDB_STORE); const rq = st.openCursor(); rq.onsuccess = e => { const c = e.target.result; if (!c) return; if (!c.value || (c.value.ts || 0) < cut) st.delete(c.key); c.continue(); }; }).catch(() => {}); }
export function idbClear() { idbOpen().then(db => { db.transaction(S.IDB_STORE, 'readwrite').objectStore(S.IDB_STORE).clear(); }).catch(() => {}); }
export function snapForm(draftKey) {
  const _opAlt = S.cOpaSel.find(v => v !== 60);
  const s = { app: S.APP, fmt: S.FMT, abbr: $('#abbr').checked, cBg: $('#cBg').checked, opaSel: [...S.cOpaSel], ovOnly: S.ovOnly, opa1: S.cOpaSel.includes(60), opa2: S.cOpaSel.some(v => v !== 60), opa2v: Number.isFinite(_opAlt) ? _opAlt : 30 };
  let img = null;
  if (S.APP === '1') { s.lines = $('#lines').value; s.opas = getOpas(); if (S.PIMG.b64) img = { b64: S.PIMG.b64, name: S.PIMG.name }; }
  else if (S.APP === '2') { s.cSub = $('#cSub').value; s.cTitle = $('#cTitle').value; s.cLines = $('#cLines').value; s.ovFmt = S.ovFmt; s.a2m = S.A2M; if (S.A2M === 'c') { try { s.edLines = JSON.parse(JSON.stringify(S.edLines)); } catch {} } if (S.CIMG.b64) img = { b64: S.CIMG.b64, name: S.CIMG.name };
    s.cpThumb = S.cpThumb; s.cpMerge = S.cpMerge;
    if (S.cpThumb !== 'off') { s.cyear = getYear(); s.cname = getName(); s.plat = $('#cphPlat').dataset.plat; s.cplat = $('#cplat').value; }
    s.guideMode = S.guideMode; s.warnLines = $('#warnLines').value;
    s.tpl = S.cTpl;
    s.nologo = S.cLogoOff;
  }
  else if (S.APP === '3') {
    s.cyear = getYear(); s.cname = getName();
    s.plat = $('#cphPlat').dataset.plat; s.cplat = $('#cplat').value;
    s.cpFmt = S.cpFmt; s.copyOn = S.copyOn; s.guideMode = S.guideMode; s.warnLines = $('#warnLines').value;
  } else if (S.APP === '5') { try { s.edLines = JSON.parse(JSON.stringify(S.edLines)); } catch {} if (S.IMG.b64) img = { b64: S.IMG.b64, name: S.IMG.name }; }
  if (img) {
    s.imgUsed = true; s.imgName = img.name || '';
    if (draftKey) { s.imgKey = draftKey; if (S._draftImgSaved[draftKey] !== img.b64) { S._draftImgSaved[draftKey] = img.b64; idbPut(draftKey, img.b64); } }
    else { s.imgKey = 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8); idbPut(s.imgKey, img.b64); }
  } else if (draftKey) delete S._draftImgSaved[draftKey];
  return s;
}
export function restoreOpaSeg(segSel, numEl, customBtn, vals) {
  const presets = [];
  document.querySelectorAll(segSel + ' button').forEach(b => { if (b.dataset.opa !== 'custom') presets.push(parseInt(b.dataset.opa, 10)); });
  document.querySelectorAll(segSel + ' button').forEach(b => { if (b.dataset.opa !== 'custom') b.classList.toggle('on', vals.includes(parseInt(b.dataset.opa, 10))); });
  const extra = vals.find(v => !presets.includes(v));
  if (extra != null) { if (numEl) numEl.value = String(extra); if (customBtn) customBtn.classList.add('on'); }
  else { if (numEl) numEl.value = ''; if (customBtn) customBtn.classList.remove('on'); }
}
export function importHint(msg, ok) {
  const s = $('#status'); if (!s) return;
  s.classList.remove('err'); s.classList.toggle('ok', ok !== false); s.textContent = msg;
  clearTimeout(s._hT); s._hT = setTimeout(() => { s.textContent = ''; s.classList.remove('ok'); }, 3200);
}
export async function fetchServerOrig(id) {
  if (!/^\d{12}-[a-f0-9]{6}$/.test(id || '')) return null;
  try {
    const r = await fetch('/api/orig?id=' + encodeURIComponent(id)); if (!r.ok) return null;
    if (!/^image\//.test(r.headers.get('content-type') || '')) return null;
    const blob = await r.blob();
    return await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(null); fr.readAsDataURL(blob); });
  } catch { return null; }
}
export function isOwnEditApp(app) { const a = String(app || ''); return a !== '6' && a !== 'tr'; }
export function parentStudioRouter() { try { return (window.parent !== window && window.parent.studioEditOpen) ? window.parent.studioEditOpen : null; } catch (_) { return null; } }
export function trRouter() { try { return (window.parent !== window && window.parent.studioTrOpen) ? window.parent.studioTrOpen : null; } catch (_) { return null; } }
export function studioRouteFn() { try { return (window.parent !== window && window.parent.studioRoute) ? window.parent.studioRoute : null; } catch (_) { return null; } }
export function trHandoff() { const r = trRouter(); if (r && S.CIMG.b64) r(S.CIMG.b64, S.CIMG.name); }
export function canEditSrc(src) { return !!(src && src.app) && !appHidden(src.app) && (isOwnEditApp(src.app) || !!parentStudioRouter()); }
export function editOpenSrc(src, url) {
  if (!src || !src.app) return;
  if (isOwnEditApp(src.app)) { importToEditor(src, url); return; }
  const r = parentStudioRouter(); if (r) r(src, url);
}
export function importToEditor(src, compUrl, quiet) {
  if (!src) return;
  if (src.app === '1') src = Object.assign({}, src, { app: '2', cLines: src.lines || '', ovFmt: 'post' });
  if (src.app === '4') src = Object.assign({}, src, { app: '3', _wasWarn: true });
  if (src.app === '3') {
    src = Object.assign({}, src, { app: '2',
      cpThumb: (src.cpFmt === 'post' || src.cpFmt === 'reels') ? src.cpFmt : ((Array.isArray(src.fmts) && src.fmts.length) ? src.fmts[0] : 'reels'),
      cyear: src.cyear != null ? src.cyear : (src.cySuf != null ? '202' + src.cySuf : null),
      plat: src.plat || src.platSel || 'threads',
      guideMode: src.guideMode || (Array.isArray(src.warnLit) && src.warnLit.length ? src.warnLit[0] : (src._wasWarn && src.warnLines ? 'free' : '')) });
  }
  S.selApp(src.app);
  if (src.fmt) S.FMT = src.fmt;
  $('#abbr').checked = !!src.abbr;
  if (src.app === '1') {
    $('#lines').value = src.lines || ''; $('#lines').dispatchEvent(new Event('input', { bubbles: true }));
    if (src.opas && src.opas.length) restoreOpaSeg('#opaSeg', $('#opaNum'), $('#opaCustom'), src.opas);
    if ($('#pImgSlot')._reset) $('#pImgSlot')._reset();
    updateTrkHint('lines', 'linesTrk', 'post');
  } else if (src.app === '2') {

    $('#cSub').value = src.cSub || src.sub || '';
    $('#cTitle').value = src.cTitle || src.title || '';
    $('#cLines').value = src.cLines || src.rLines || '';
    ['#cSub', '#cTitle', '#cLines'].forEach(s => $(s).dispatchEvent(new Event('input', { bubbles: true })));
    $('#cBg').checked = !!(src.cBg || src.rBg);
    if (Array.isArray(src.opaSel) && src.opaSel.length) opaSet(src.opaSel);
    else if (typeof src.opa1 === 'boolean') { const near = v => OPA_CHIPS.reduce((a, b) => Math.abs(b - v) < Math.abs(a - v) ? b : a); const arr = []; if (src.opa1) arr.push(60); if (src.opa2) arr.push(near(src.opa2v || 30)); opaSet(arr); }
    else { opaSet([60, (src.cOpa30 || (Array.isArray(src.reelsOpas) && src.reelsOpas.includes(30))) ? 30 : null].filter(Boolean)); }
    S.ovOnly = !!src.ovOnly;
    S.ovFmt = (src.ovFmt === 'reels') ? 'reels' : 'post';
    if ($('#cImgSlot')._reset) $('#cImgSlot')._reset();
    updateComboTrk();

    S.cLogoOff = false; syncCTpl();
    if (src.edLines) { try { S.edLines = JSON.parse(JSON.stringify(src.edLines)); } catch {} if (!S.edLines.length) S.edLines = [[]]; renderEditChips(); }
    if (src.a2m) setA2Mode(src.a2m, false);

    S.cpThumb = (src.cpThumb === 'reels' || src.cpThumb === 'post') ? src.cpThumb : 'off';
    S.cpMerge = !!src.cpMerge;
    if (S.cpThumb !== 'off') {
      setYear(src.cyear != null ? src.cyear : '2026'); setName(src.cname || '');
      const cP = src.plat || 'threads';
      setPlat(cP); if (cP === 'custom') $('#cplat').value = src.cplat || '';
      updCphDef();
    }
    S.guideMode = src.guideMode || '';
    $('#warnLines').value = src.warnLines || ''; $('#warnLines').dispatchEvent(new Event('input', { bubbles: true }));
    syncGuide();
    syncCpThumb();
  } else if (src.app === '3' || src.app === '4') {

    setYear(src.cyear != null ? src.cyear : (src.cySuf != null ? '202' + src.cySuf : '2026'));
    setName(src.cname || '');
    const plat = src.plat || src.platSel || 'threads';
    setPlat(plat); if (plat === 'custom') $('#cplat').value = src.cplat || '';
    updCphDef();

    S.copyOn = (src.copyOn != null) ? !!src.copyOn : !src._wasWarn;

    S.cpFmt = src.cpFmt || ((Array.isArray(src.fmts) && src.fmts.length === 1) ? src.fmts[0] : 'reels');

    S.guideMode = src.guideMode || (Array.isArray(src.warnLit) && src.warnLit.length ? src.warnLit[0] : (src._wasWarn && src.warnLines ? 'free' : ''));
    $('#warnLines').value = src.warnLines || ''; $('#warnLines').dispatchEvent(new Event('input', { bubbles: true }));
    syncCpFmt(); syncCopyTog(); syncGuide();
  } else if (src.app === '5') {
    if (src.a2m) S.A2M = src.a2m;
    S.cLogoOff = false; syncCTpl();
    if (src.edLines) { try { S.edLines = JSON.parse(JSON.stringify(src.edLines)); } catch {} if (!S.edLines.length) S.edLines = [[]]; renderEditChips(); }
    if ($('#fileLab')._reset) $('#fileLab')._reset();
  }
  S.updateGoSpec();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const hint = quiet ? (() => {}) : importHint;
  const _pd = imgPendBegin();
  const legacyRef = () => { if (src.imgUsed && compUrl) { setImportRef(src, compUrl); hint('설정 복원됨 · 이미지는 합성본(빗금)=참고용 · 다시 선택하면 교체'); } else hint(src.imgUsed ? '설정 복원됨 · 이미지/배경만 다시 선택해주세요' : '설정 복원됨'); _pd(); };
  const noImg = () => {
    const id = thIdOf(compUrl || '');
    if (src.imgUsed && id) fetchServerOrig(id).then(b64 => { if (b64) { setImportImg(src, b64, src.imgName); hint('설정·이미지 복원됨(서버 원본)'); _pd(); } else legacyRef(); }).catch(legacyRef);
    else legacyRef();
  };
  if (src.imgKey) {
    idbGet(src.imgKey).then(rec => {
      if (rec && rec.b64) { setImportImg(src, rec.b64, src.imgName); hint('설정·이미지 복원됨'); _pd(); }
      else noImg();
    }).catch(noImg);
  } else noImg();
}
export function setImportImg(src, b64, name) {
  if (src.app === '1') { if ($('#pImgSlot')._set) $('#pImgSlot')._set(b64, name); }
  else if (src.app === '5') { if ($('#fileLab')._set) $('#fileLab')._set(b64, name); }
  else if (src.app === '2') { if ($('#cImgSlot')._set) $('#cImgSlot')._set(b64, name); }
}
export function setImportRef(src, url) {
  const w = src.app === '1' ? $('#pImgSlot') : src.app === '2' ? $('#cImgSlot') : src.app === '5' ? $('#fileLab') : null;
  if (w && w._setRef) w._setRef(url);
}
export const _DRAFT_TXT = ['#lines', '#cSub', '#cTitle', '#cLines', '#warnLines'];
export function draftIdleArm(ms) {
  clearTimeout(S._draftIdleT);
  S._draftIdleT = setTimeout(draftIdleWipe, Math.max(1000, ms == null ? S.DRAFT_MS : ms));
}
export function draftIdleWipe() {
  let hit = false;
  S._draftWiping = true;
  try {
    _DRAFT_TXT.forEach(sel => { const el = $(sel); if (el && el.value) { hit = true; el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); } });
    if (hit) { clearTimeout(S._draftT); draftSave(); try { errStatus('내용 비움', 'warn'); } catch (_) {} }
  } catch (_) {} finally { S._draftWiping = false; }
}
export function draftSave() {
  if (!S._draftReady) return;
  let d; try { d = JSON.parse(localStorage.getItem(S.DRAFT_KEY) || 'null'); } catch { d = null; }
  if (!d || !d.apps) d = { apps: {}, at: {} };
  if (!d.at) d.at = {};
  const now = Date.now();
  Object.keys(d.apps).forEach(k => { if (!d.at[k]) d.at[k] = d.ts || now; });
  Object.keys(d.apps).forEach(k => { if (k !== S.APP && now - d.at[k] > S.DRAFT_MS) { delete d.apps[k]; delete d.at[k]; } });
  let snap; try { snap = snapForm('draft_img_' + S.APP); } catch { return; }
  const same = JSON.stringify(d.apps[S.APP] ?? null) === JSON.stringify(snap);
  d.apps[S.APP] = snap;
  if (!same || !d.at[S.APP]) { d.at[S.APP] = now; if (!S._draftWiping) draftIdleArm(S.DRAFT_MS); }
  d.app = S.APP; d.ts = now;
  try { localStorage.setItem(S.DRAFT_KEY, JSON.stringify(d)); } catch {}
}
export function draftQueue() { clearTimeout(S._draftT); S._draftT = setTimeout(draftSave, 800); }
export function draftRestore() {
  let d; try { d = JSON.parse(localStorage.getItem(S.DRAFT_KEY) || 'null'); } catch { d = null; }
  if (!d || !d.apps) { try { localStorage.removeItem(S.DRAFT_KEY); } catch {} return; }
  const now = Date.now(), at = d.at || {};
  const live = Object.keys(d.apps).filter(a => d.apps[a] && now - (at[a] || d.ts || 0) <= S.DRAFT_MS);
  if (!live.length) { try { localStorage.removeItem(S.DRAFT_KEY); } catch {} return; }
  if (live.length !== Object.keys(d.apps).length) {
    const na = {}, nt = {};
    live.forEach(a => { na[a] = d.apps[a]; nt[a] = at[a] || d.ts || now; });
    try { localStorage.setItem(S.DRAFT_KEY, JSON.stringify({ apps: na, at: nt, app: live.includes(d.app) ? d.app : live[0], ts: d.ts || now })); } catch {}
  }
  live.filter(a => a !== d.app).concat(live.includes(d.app) ? [d.app] : []).forEach(a => { try { importToEditor(d.apps[a], undefined, true); } catch {} });
  const newest = Math.max(...live.map(a => at[a] || d.ts || 0));
  draftIdleArm(S.DRAFT_MS - (now - newest));
}

export function start() {
S.IDB_NAME = 'nomute_thumb_img';
S.IDB_STORE = 'imgs';
S.DRAFT_KEY = 'nomute_thumb_draft';
S.DRAFT_MS = window.NM_DRAFT_MS;
S._draftImgSaved = {};
S._draftT = 0;
S._draftReady = false;
S._draftIdleT = 0;
S._draftWiping = false;
['input', 'change', 'click', 'focusout'].forEach(ev => document.addEventListener(ev, draftQueue, { passive: true, capture: true }));
document.addEventListener('visibilitychange', () => { if (document.hidden) { clearTimeout(S._draftT); draftSave(); } });
window.addEventListener('pagehide', () => { clearTimeout(S._draftT); draftSave(); });
}
