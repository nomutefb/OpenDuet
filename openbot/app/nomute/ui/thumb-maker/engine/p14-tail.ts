// @ts-nocheck
// 썸네일 생성기 엔진 · 빠른 메뉴·이전 제작 접기 단추·nmTabReset
//   원본 = 에디터 viewer/thumb.html 6471~6557줄(origin/main c430e4c9f) — 줄 그대로 옮김 · 주석만 뺌(까닭·형 말은 원본 주석에 그대로)
//   바꾼 곳 = 화면 전역 let·var·표 const → S.<이름>(./state · 창 열 때마다 새로) · document·window·타이머 = ./rt(이 화면 뿌리 안으로 · 닫으면 다 걷음) · 함수는 그대로 내보내고 서로 가져옴
//   다시 맞출 땐 ../tools/codemod.mjs 로 원본 줄을 통째로 다시 뗌(손으로 고친 줄 0 · 원본 갈아 끼우는 함수 selApp·updateGoSpec = S 에 올림 · hoist())
import { S } from "./state";
import { MutationObserver, document, parent, setTimeout, window } from "./rt";
import { EDIT_TAB_OFF, isEditApp } from "./p01-core";
import { renderCpPrev } from "./p02-preview";
import { draftQueue } from "./p06-draft";
import { renderEditChips } from "./p10-cards";


export function start() {
(function(){
  var rfab = document.getElementById('rfab'); if (!rfab) return;
  var core = document.getElementById('rfabCore'), b2 = document.getElementById('rfab2'),
      b3 = document.getElementById('rfab3'), b4 = document.getElementById('rfab4'), gen = document.getElementById('rfabGen');
  function imgInput(){ if (S.APP === '1') return document.getElementById('pFile');
                       if (S.APP === '2') return document.getElementById('cFile');
                       if (S.APP === '5') return document.getElementById('file'); return null; }
  function curSlot(){ if (S.APP === '1') return document.getElementById('pImgSlot');
                      if (S.APP === '2') return document.getElementById('cImgSlot');
                      if (S.APP === '5') return document.getElementById('fileLab'); return null; }
  function refresh(){
    var s = curSlot(), imgMode = !!s;
    var refonly = !!(s && (s.classList.contains('refonly') || s.querySelector('.refonly')));
    var attached = !!(s && s.classList.contains('has') && !refonly);
    b3.classList.toggle('off', !imgMode);
    if (gen) { var swap = attached; b3.hidden = swap; gen.hidden = !swap; }
  }
  window._rfabSyncGen = refresh;
  ['fileLab','pImgSlot','cImgSlot'].forEach(function(id){ var el = document.getElementById(id); if (el) { try { new MutationObserver(refresh).observe(el, { attributes:true, attributeFilter:['class'] }); } catch(_){} } });
  core.addEventListener('click', function(e){ e.stopPropagation(); rfab.classList.toggle('open'); refresh(); });
  var rmin = document.getElementById('rfabMin');
  if (rmin) { if (window.parent === window) { rmin.style.display = 'none'; }
    else rmin.addEventListener('click', function(e){ e.stopPropagation(); try { if (parent.minimizeTool) parent.minimizeTool(); } catch (_) {} }); }
  var _rfabKeep = false;
  function keepFab(){ _rfabKeep = true; setTimeout(function(){ _rfabKeep = false; }, 0); }
  document.addEventListener('click', function(e){ if (!rfab.contains(e.target) && !_rfabKeep) rfab.classList.remove('open'); });
  function cyc(sel, filt){ var bs = [].slice.call(document.querySelectorAll(sel)); if (filt) bs = bs.filter(filt);
    if (!bs.length) return; var i = bs.findIndex(function(b){ return b.classList.contains('on'); });
    bs[(i + 1 + bs.length) % bs.length].click(); }
  b2.addEventListener('click', function(e){ e.stopPropagation(); keepFab();
    if (S.APP === '2' && !(typeof S.A2M !== 'undefined' && S.A2M === 'c')) { var c = document.getElementById('cSub'); if (c) { c.scrollIntoView({ behavior: 'smooth', block: 'center' }); try { c.focus(); } catch (_) {} } }
    else if (S.APP === '3') { var c3 = document.getElementById('cphName'); if (c3) { c3.scrollIntoView({ behavior: 'smooth', block: 'center' }); try { c3.focus(); } catch (_) {} } }
    else if (S.APP === '5' || S.APP === '2') { var box = document.getElementById('cardBox'); if (box) box.scrollIntoView({ behavior: 'smooth', block: 'center' });
           var eds = document.querySelectorAll('#edChips .ed-empty'), ed = eds.length ? eds[eds.length - 1] : null;
           if (ed) { try { ed.focus(); var sel = window.getSelection(), r = document.createRange(); r.selectNodeContents(ed); r.collapse(false); sel.removeAllRanges(); sel.addRange(r); } catch (_) {} } }
    else { var t = document.getElementById('lines');
           if (t) { t.scrollIntoView({ behavior: 'smooth', block: 'center' }); try { t.focus(); } catch (_) {} } }
  });
  b3.addEventListener('click', function(e){ e.stopPropagation(); keepFab();
    var slot = S.APP === '1' ? document.getElementById('pImgSlot') : S.APP === '2' ? document.getElementById('cImgSlot') : S.APP === '5' ? document.getElementById('fileLab') : null;
    if (slot) slot.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (S.APP === '5') { var fi = slot && slot.querySelector('input[type=file]'); if (fi) fi.click(); }
    else { var f = imgInput(); if (f) f.click(); } });
  if (gen) gen.addEventListener('click', function(e){ e.stopPropagation(); keepFab(); var g = document.getElementById('go'); if (g) g.click(); });
  b4.addEventListener('click', function(e){ e.stopPropagation(); keepFab(); var o = EDIT_TAB_OFF ? ['2'] : ['2','7','6'], i = o.indexOf(S.APP === '8' ? '7' : S.APP === '5' ? '2' : S.APP); S.selApp(o[(i + 1 + o.length) % o.length]); refresh();
    window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.querySelectorAll('.tab').forEach(function(t){ t.addEventListener('click', function(){ setTimeout(refresh, 0); }); });
  refresh();
})();
(function () {
  var rm = document.getElementById('histRemote'), hist = document.getElementById('hist'), hd = document.getElementById('histH');
  if (!rm || !hist || !hd) return;
  function sync() { var open = hist.classList.contains('open'); var past = hd.getBoundingClientRect().bottom < 36; rm.classList.toggle('show', !!(open && past)); }
  window.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  rm.addEventListener('click', function () {
    var b = document.getElementById('histBody');
    if (b && !b.hidden) { b.hidden = true; hd.setAttribute('aria-expanded', 'false'); hist.classList.remove('open'); }
    hd.scrollIntoView({ behavior: 'smooth', block: 'start' }); sync();
  });
  sync();
})();
window.nmTabReset = function () {
  try {
    if (S.APP === '2' || isEditApp(S.APP)) { const sl = document.getElementById('cImgSlot'); if (sl && sl._reset) sl._reset(); }
    if (S.APP === '2') {
      ['cSub', 'cTitle', 'cLines'].forEach(function (id) { const el = document.getElementById(id); if (el && el.value) { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); } });
      if (typeof S.A2M !== 'undefined' && S.A2M === 'c' && typeof S.edLines !== 'undefined') { S.edLines = [[]]; if (typeof renderEditChips === 'function') renderEditChips(); }
    }
    if (typeof renderCpPrev === 'function') renderCpPrev();
    if (typeof draftQueue === 'function') draftQueue();
  } catch (e) {}
};
}
