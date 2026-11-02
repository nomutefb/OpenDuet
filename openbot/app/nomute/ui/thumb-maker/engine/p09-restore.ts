// @ts-nocheck
// 썸네일 생성기 엔진 · 최근 결과 복원·최신 추종
//   원본 = 에디터 viewer/thumb.html 4711~4911줄(origin/main c430e4c9f) — 줄 그대로 옮김 · 주석만 뺌(까닭·형 말은 원본 주석에 그대로)
//   바꾼 곳 = 화면 전역 let·var·표 const → S.<이름>(./state · 창 열 때마다 새로) · document·window·타이머 = ./rt(이 화면 뿌리 안으로 · 닫으면 다 걷음) · 함수는 그대로 내보내고 서로 가져옴
//   다시 맞출 땐 ../tools/codemod.mjs 로 원본 줄을 통째로 다시 뗌(손으로 고친 줄 0 · 원본 갈아 끼우는 함수 selApp·updateGoSpec = S 에 올림 · hoist())
import { S } from "./state";
import { clearTimeout, document, fetch, matchMedia, requestAnimationFrame, setInterval, setTimeout, window } from "./rt";
import { $ } from "./p01-core";
import { idbClear } from "./p06-draft";
import { carEmptySync, renderJob } from "./p07-jobs";
import { THUMB_HCLEAR_KEY, THUMB_HKEY, THUMB_HMS, THUMB_LAST_KEY, _twoCol, baseUrl, biOf, bidOf, carAppend, carStride, carUpdate, doneReq, histClearedCut, histKey, histLoad, histPrune, maybeOpenHist, renderCarGrid, renderHist, thIdOf } from "./p08-results";

export function saveLastResult(job) {
  try { if (!job || !(job.saves || []).length) return;
    let prev; try { prev = JSON.parse(localStorage.getItem(THUMB_LAST_KEY) || 'null'); } catch {}
    if (prev && (prev.ts || 0) > (job.t0 || 0)) return;
    localStorage.setItem(THUMB_LAST_KEY, JSON.stringify({ label: job.label, ts: job.t0, src: job.src,
      items: job.saves.map(s => ({ url: baseUrl(s.url), dlname: s.dlname, cap: s.cap || '', varStr: s.varStr || '' })) })); } catch {}
}
export function rmRestoredRow() { document.querySelectorAll('#jobs .job[data-rj]').forEach(r => r.remove()); }
export function clearRestored() {
  if (!S.RESTORED) return; S.RESTORED = false; S.RESTORED_BID = ''; S.RESTORED_URLS.clear();
  rmRestoredRow();
  S.CARSLIDES.length = 0; const tr = $('#cartrack'); if (tr) { tr.innerHTML = ''; tr.style.height = ''; }
  $('#carwrap').hidden = true; $('#carbar').hidden = true; carUpdate(); carHSync(); renderHist();
}
export function localLastResult() {
  let rec; try { rec = JSON.parse(localStorage.getItem(THUMB_LAST_KEY) || 'null'); } catch {}
  if (!rec || !Array.isArray(rec.items) || !rec.items.length) return null;
  return rec;
}
export function doRestore(pick, collapsed) {
  if (!pick || !Array.isArray(pick.items) || !pick.items.length) return false;
  const rjob = { n: (pick.src && pick.src.jn != null && pick.src.jn !== '') ? pick.src.jn : '', label: pick.label || '제작', t0: pick.ts, status: 'done', _restored: true, _saved: true, src: pick.src,
    outs: pick.items.map(it => ({ label: (it.varStr || '').replace(/^\s*·\s*/, '') })), done: pick.items.map(() => true), saves: [] };
  pick.items.forEach((it, i) => { S.RESTORED_URLS.add(histKey(it.url)); carAppend(it.url, it.dlname, it.cap || pick.label || '', rjob, it.varStr || '', rjob.outs[i], true, undefined, collapsed); });
  S.RESTORED = true; S.RESTORED_TS = pick.ts || 0; S.RESTORED_BID = (pick.src && typeof pick.src.bid === 'string') ? pick.src.bid : '';
  renderJob(rjob); renderHist();
  return true;
}
export function findResultById(id) {
  const loc = localLastResult();
  if (loc && Array.isArray(loc.items) && loc.items.some(it => thIdOf(it.url) === id)) return loc;
  if (Array.isArray(S.SRV_HIST)) {
    const hit = S.SRV_HIST.filter(e => e && e.url && thIdOf(e.url) === id);
    const bid = bidOf(hit.find(e => bidOf(e)));
    const arr = bid ? S.SRV_HIST.filter(e => e && e.url && bidOf(e) === bid) : hit;
    if (arr.length) {
      const sorted = arr.slice().sort((a, b) => (biOf(a) - biOf(b)) || String(a.dlname || '').localeCompare(String(b.dlname || '')));
      const withSrc = sorted.find(e => e.src && e.src.app);
      return { ts: Math.max(...arr.map(e => e.ts || 0)), label: sorted[0].cap || '제작', src: withSrc ? withSrc.src : undefined, items: sorted.map(e => ({ url: e.url, dlname: e.dlname, cap: e.cap || '', varStr: e.varStr || '' })) };
    }
  }
  return null;
}
export function restoreById(id) {
  if (!id) return false;
  if (S.RESTORED && [...S.RESTORED_URLS].some(u => thIdOf(u) === id)) return true;
  const pick = findResultById(id);
  if (!pick) return false;
  if (S.RESTORED) {
    S.RESTORED = false; S.RESTORED_BID = ''; S.RESTORED_URLS.clear();
    rmRestoredRow();
    S.CARSLIDES.length = 0; const tr = $('#cartrack'); if (tr) { tr.innerHTML = ''; tr.style.height = ''; }
  }
  return doRestore(pick);
}
export function reconcileRestoredBatch() {
  if (!S.RESTORED || !S.RESTORED_BID) return false;
  const sib = (S.SRV_HIST || []).filter(e => e && e.url && bidOf(e) === S.RESTORED_BID && (e.ts || 0) > S.SRV_CLEAR);
  if (!sib.some(e => !S.RESTORED_URLS.has(histKey(e.url)))) return false;
  const sorted = sib.slice().sort((a, b) => (biOf(a) - biOf(b)) || String(a.dlname || '').localeCompare(String(b.dlname || '')));
  const withSrc = sorted.find(e => e.src && e.src.app);
  const pick = { ts: Math.max(...sorted.map(e => e.ts || 0)), label: sorted[0].cap || '제작', src: withSrc ? withSrc.src : undefined,
    items: sorted.map(e => ({ url: e.url, dlname: e.dlname, cap: e.cap || '', varStr: e.varStr || '' })) };
  const collapsed = !!($('#carwrap') && $('#carwrap').hidden);
  S.RESTORED = false; S.RESTORED_BID = ''; S.RESTORED_URLS.clear();
  rmRestoredRow();
  S.CARSLIDES.length = 0; const tr = $('#cartrack'); if (tr) { tr.innerHTML = ''; tr.style.height = ''; }
  const ok = doRestore(pick, collapsed);
  console.log('[thumb] 묶음 재수렴 — bid=' + (pick.src && pick.src.bid || '?') + ' · 합류 ' + pick.items.length + '장');
  return ok;
}
export const directPick = e => ({ ts: e.ts || 0, label: e.cap || '제작', src: e.src, items: [{ url: e.url, dlname: e.dlname, cap: e.cap || '', varStr: e.varStr || '' }] });
export function followNewestRestored() {
  if (doneReq().on) return false;
  if (S.JOBS.some(j => j && j.status !== 'done' && j.status !== 'err')) return false;
  if (!S.RESTORED && S.CARSLIDES.length) return false;
  const cutMin = Math.max(histClearedCut(), S.SRV_CLEAR, S.RESTORED ? S.RESTORED_TS : 0);
  let newest = null;
  (S.SRV_HIST || []).concat(histPrune(histLoad())).forEach(e => { if (e && e.url && (e.ts || 0) > cutMin && (!newest || (e.ts || 0) > (newest.ts || 0))) newest = e; });
  if (!newest) return false;
  const pick = thIdOf(newest.url) ? findResultById(thIdOf(newest.url)) : directPick(newest);
  if (!pick || !Array.isArray(pick.items) || !pick.items.length) return false;
  const pbid = (pick.src && typeof pick.src.bid === 'string') ? pick.src.bid : '';
  if (S.RESTORED && pbid && pbid === S.RESTORED_BID) return false;
  if (S.RESTORED && !pick.items.some(it => !S.RESTORED_URLS.has(histKey(it.url)))) return false;
  const collapsed = !!($('#carwrap') && $('#carwrap').hidden);
  if (S.RESTORED) {
    S.RESTORED = false; S.RESTORED_BID = ''; S.RESTORED_URLS.clear();
    rmRestoredRow();
    S.CARSLIDES.length = 0; const tr = $('#cartrack'); if (tr) { tr.innerHTML = ''; tr.style.height = ''; }
  }
  const ok = doRestore(pick, collapsed);
  if (ok) console.log('[thumb] 결과 최신 추종 — ' + (pick.label || '제작') + ' · ' + pick.items.length + '장');
  return ok;
}
export function carHSync(open) { const h = $('#carH'); if (!h) return; h.hidden = false; const em = $('#carEmpty'); carEmptySync();
  renderCarGrid();
  const cg = $('#carGrid');
  if (!S.CARSLIDES.length) return;
  if (em) em.hidden = true;

  const _wasCollapsed = h.getAttribute('aria-expanded') === 'false';
  if (open || !_wasCollapsed) { if (cg) cg.hidden = false; h.setAttribute('aria-expanded', 'true'); $('#carwrap').hidden = false; $('#carbar').hidden = false; } }
export function resetHistClr() { const b = $('#histClr'); if (!b) return; S._histArm = false; clearTimeout(S._histArmT); b.classList.remove('arm', 'firing'); b.textContent = '기록 지우기'; }
export function pruneOldFails() { const cut = Date.now() - THUMB_HMS; for (let i = S.JOBS.length - 1; i >= 0; i--) { const j = S.JOBS[i]; if (j.status === 'err' && (j.t0 || 0) < cut) { const r = document.getElementById('job-' + j.uid); if (r) r.remove(); S.JOBS.splice(i, 1); } } }

export function start() {
S.RESTORED = false;
S.RESTORED_TS = 0;
S.RESTORED_BID = '';
S.RESTORED_URLS = new Set();
window.addEventListener('storage', e => { if (e && (e.key === THUMB_HKEY || e.key === THUMB_HCLEAR_KEY)) { if (!reconcileRestoredBatch() && !followNewestRestored()) renderHist(); } });
S._histCloseT = null;
$('#histH').addEventListener('click', () => { const b = $('#histBody'), open = b.hidden;
  clearTimeout(S._histCloseT); b.classList.remove('closing');
  $('#histH').setAttribute('aria-expanded', String(open)); $('#hist').classList.toggle('open', open);
  if (open) {
    b.hidden = false;
    if (!_twoCol()) requestAnimationFrame(() => $('#hist').scrollIntoView({ behavior: 'smooth', block: 'start' }));
  } else {
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) { b.hidden = true; }
    else { b.classList.add('closing'); S._histCloseT = setTimeout(() => { b.hidden = true; b.classList.remove('closing'); }, 270); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});
window.addEventListener('hashchange', () => maybeOpenHist());
S._carCloseT = null;
$('#carH').addEventListener('click', () => {
  if (!S.CARSLIDES.length) {
    const willOpen = $('#carH').getAttribute('aria-expanded') !== 'true';
    $('#carH').setAttribute('aria-expanded', willOpen ? 'true' : 'false'); carEmptySync(); return;
  }
  const cw = $('#carwrap'), cb = $('#carbar'), cg = $('#carGrid'), open = cw.hidden;
  clearTimeout(S._carCloseT); cw.classList.remove('closing'); cb.classList.remove('closing'); if (cg) cg.classList.remove('closing');
  if (open) {
    cw.hidden = false; cb.hidden = false; if (cg && S.CARSLIDES.length) cg.hidden = false; $('#carH').setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => { carUpdate(); if (_twoCol()) return; try { $('#carH').scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (_) {} });
  } else {
    $('#carH').setAttribute('aria-expanded', 'false');
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) { cw.hidden = true; cb.hidden = true; if (cg) cg.hidden = true; }
    else { cb.classList.add('closing'); cw.classList.add('closing'); if (cg) cg.classList.add('closing'); S._carCloseT = setTimeout(() => { cw.hidden = true; cb.hidden = true; if (cg) { cg.hidden = true; cg.classList.remove('closing'); } cw.classList.remove('closing'); cb.classList.remove('closing'); }, 270); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});
S._histArm = false;
S._histArmT = null;
$('#histClr').addEventListener('click', () => {
  const b = $('#histClr');
  if (!S._histArm) { S._histArm = true; b.classList.add('arm'); b.textContent = '재확인'; clearTimeout(S._histArmT); S._histArmT = setTimeout(resetHistClr, 3000); return; }
  clearTimeout(S._histArmT); S._histArm = false; b.classList.remove('arm'); b.classList.add('firing'); b.textContent = '지우는 중';
  setTimeout(() => {
    const now = Date.now();
    try { localStorage.setItem(THUMB_HCLEAR_KEY, String(now)); } catch {}
    S.SRV_CLEAR = Math.max(S.SRV_CLEAR, now);
    fetch('/api/thumb-clear', { method: 'POST' }).then(r => r.json()).then(d => { if (d && +d.ts) { S.SRV_CLEAR = Math.max(S.SRV_CLEAR, +d.ts); try { localStorage.setItem('nomute_thumb_srvclr', String(S.SRV_CLEAR)); } catch {} renderHist(); } }).catch(() => {});
    localStorage.removeItem(THUMB_HKEY); try { localStorage.removeItem(THUMB_LAST_KEY); } catch {}
    idbClear();
    resetHistClr(); clearRestored(); renderHist();
  }, 480);
});
$('#cartrack').addEventListener('scroll', carUpdate, { passive: true });
window.addEventListener('resize', carUpdate);
(() => {
  const track = $('#cartrack');
  track.addEventListener('mousedown', e => {
    if (e.button !== 0 || e.target.closest('.imgdl,.imgedit,.carnav')) return;
    const sl = track.scrollLeft, x0 = e.clientX; let moved = false;
    track.classList.add('dragging');
    const mv = ev => { track.scrollLeft = sl - (ev.clientX - x0); if (Math.abs(ev.clientX - x0) > 4) moved = true; };
    const up = () => {
      window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up);
      track.classList.remove('dragging'); track._dragged = moved;
      const w = carStride(); track.scrollTo({ left: Math.round(track.scrollLeft / w) * w, behavior: 'smooth' });
    };
    window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up); e.preventDefault();
  });
  track.addEventListener('click', e => { if (track._dragged) { e.stopPropagation(); e.preventDefault(); track._dragged = false; } }, true);
})();
setInterval(() => { if (document.hidden) return; S.JOBS.forEach(j => { if (j.status !== 'done' && j.status !== 'err') renderJob(j); }); }, 1000);
pruneOldFails();
setInterval(pruneOldFails, 60000);
}
