// @ts-nocheck
/* 만든 파일 — 손으로 고치지 말 것(ui/old-pages/tools/gen.mjs · 옛 에디터 viewer 의 같이 쓰는 스크립트)
   원본 = nm-wave.js · nm-scene.js · nm-svg.js · nm-ua.js · nm-rail.js · nm-jobs.js · nm-clip.js · nm-sync.js · nm-loader.js · nm-gauge.js · nm-snap.js · nm-alpha.js · upload.js · cscroll.js · nm-models.js · nm-styles.js · draft.js · master.js */
function nm_wave_js(window, document, __nm) {

}
function nm_scene_js(window, document, __nm) {
(function () {
  if (window.NMScene) return;
  var root = document.documentElement;
  var canvas = document.getElementById('wavebg');
  if (canvas) canvas.classList.add('off');
  root.classList.remove('nm-scene-ready');
  root.dataset.nmScene = 'inherited';
  window.NMScene = Object.freeze({
    version: '1',
    owner: 'host'
  });
})();
}
function nm_svg_js(window, document, __nm) {
__nm.ex({"CHECK_SVG":[()=>CHECK_SVG],"COPY_SVG":[()=>COPY_SVG],"PASTE_SVG":[()=>PASTE_SVG],"ERASE_SVG":[()=>ERASE_SVG],"UNDO_SVG":[()=>UNDO_SVG],"WAIT_SVG":[()=>WAIT_SVG],"ERR_SVG":[()=>ERR_SVG],"OK_SVG":[()=>OK_SVG],"DOWNLOAD_SVG":[()=>DOWNLOAD_SVG],"WARN_SVG":[()=>WARN_SVG],"SWAP_SVG":[()=>SWAP_SVG],"EYE_SVG":[()=>EYE_SVG],"ARROW_R_SVG":[()=>ARROW_R_SVG],"CHEV_L_SVG":[()=>CHEV_L_SVG],"CHEV_R_SVG":[()=>CHEV_R_SVG],"MERGE_SVG":[()=>MERGE_SVG],"FUNNEL_SVG":[()=>FUNNEL_SVG],"AI_SVG":[()=>AI_SVG],"EDIT_SVG":[()=>EDIT_SVG],"LAYERS_SVG":[()=>LAYERS_SVG],"RETRY_SVG":[()=>RETRY_SVG],"TRASH_SVG":[()=>TRASH_SVG],"NEWS_SVG":[()=>NEWS_SVG],"SUBS_SVG":[()=>SUBS_SVG],"G_SVG":[()=>G_SVG],"GEMINI_SVG":[()=>GEMINI_SVG]});
const CHECK_SVG = '<svg width="14" height="14" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d=" M8,-5.5 C8,-5.5 -3,5.5 -3,5.5 C-3,5.5 -8,0.5 -8,0.5" transform="matrix(1 0 0 1 16 15.5)"/></svg>';
const COPY_SVG = '<svg width="14" height="14" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M-3.5,6.5 C-3.5,6.5 -4.5,6.5 -4.5,6.5 C-5.6,6.5 -6.5,5.6 -6.5,4.5 C-6.5,4.5 -6.5,-4.5 -6.5,-4.5 C-6.5,-5.6 -5.6,-6.5 -4.5,-6.5 C-4.5,-6.5 4.5,-6.5 4.5,-6.5 C5.6,-6.5 6.5,-5.6 6.5,-4.5 C6.5,-4.5 6.5,-3.5 6.5,-3.5" transform="matrix(1 0 0 1 12.5 12.5)"/><path d=" M-4.5,-6.5 C-4.5,-6.5 4.5,-6.5 4.5,-6.5 C5.6,-6.5 6.5,-5.6 6.5,-4.5 C6.5,-4.5 6.5,4.5 6.5,4.5 C6.5,5.6 5.6,6.5 4.5,6.5 C4.5,6.5 -4.5,6.5 -4.5,6.5 C-5.6,6.5 -6.5,5.6 -6.5,4.5 C-6.5,4.5 -6.5,-4.5 -6.5,-4.5 C-6.5,-5.6 -5.6,-6.5 -4.5,-6.5z" transform="matrix(1 0 0 1 19.5 19.5)"/></svg>';
const PASTE_SVG = '<svg width="14" height="14" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M16,4 C16,4 18,4 18,4 C19.11,4 20,4.89 20,6 C20,6 20,20 20,20 C20,21.11 19.11,22 18,22 C18,22 6,22 6,22 C4.89,22 4,21.11 4,20 C4,20 4,6 4,6 C4,4.89 4.89,4 6,4 C6,4 8,4 8,4" transform="matrix(1 0 0 1 4 4)"/><path d=" M9,2 C9,2 15,2 15,2 C15.55,2 16,2.45 16,3 C16,3 16,5 16,5 C16,5.55 15.55,6 15,6 C15,6 9,6 9,6 C8.45,6 8,5.55 8,5 C8,5 8,3 8,3 C8,2.45 8.45,2 9,2z" transform="matrix(1 0 0 1 4 4)"/></svg>';
const ERASE_SVG = '<svg width="13" height="13" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M21,4 C21,4 8,4 8,4 C8,4 1,12 1,12 C1,12 8,20 8,20 C8,20 21,20 21,20 C22.11,20 23,19.11 23,18 C23,18 23,6 23,6 C23,4.89 22.11,4 21,4z" transform="matrix(1 0 0 1 4 4)"/><path d=" M12,9 C12,9 18,15 18,15 M18,9 C18,9 12,15 12,15" transform="matrix(1 0 0 1 4 4)"/></svg>';
const UNDO_SVG = '<svg width="13" height="13" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M20,20 C20,20 20,13 20,13 C20,10.79 18.21,9 16,9 C16,9 4,9 4,9 M9,14 C9,14 4,9 4,9 C4,9 9,4 9,4" transform="matrix(1 0 0 1 4 4)"/></svg>';
const WAIT_SVG = '<svg width="13" height="13" style="vertical-align:-2px" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M12,2 C17.52,2 22,6.48 22,12 C22,17.52 17.52,22 12,22 C6.48,22 2,17.52 2,12 C2,6.48 6.48,2 12,2z" transform="matrix(1 0 0 1 4 4)"/><path d=" M12,12 C12,12 16,14 16,14" transform="matrix(1 0 0 1 4 4)"/><path d=" M12,6 C12,6 12,12 12,12" transform="matrix(1 0 0 1 4 4)"/></svg>';
const ERR_SVG = '<svg width="13" height="13" style="vertical-align:-2px" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d=" M12,5 C12,5 12,19 12,19" transform="matrix(0.7 -0.71 0.71 0.7 -0.97 16.14)"/><path d=" M5,12 C5,12 19,12 19,12" transform="matrix(-0.7 0.71 -0.71 -0.7 32.97 15.94)"/></svg>';
const OK_SVG = '<svg width="13" height="13" style="vertical-align:-2px" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d=" M8,-5.5 C8,-5.5 -3,5.5 -3,5.5 C-3,5.5 -8,0.5 -8,0.5" transform="matrix(1 0 0 1 16 15.5)"/></svg>';
const DOWNLOAD_SVG = '<svg width="14" height="14" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M21,15 C21,15 21,19 21,19 C21,20.11 20.11,21 19,21 C19,21 5,21 5,21 C3.9,21 3,20.11 3,19 C3,19 3,15 3,15" transform="matrix(1 0 0 1 4 4)"/><path d=" M12,15 C12,15 12,3 12,3 M7,10 C7,10 12,15 12,15 C12,15 17,10 17,10" transform="matrix(1 0 0 1 4 4)"/></svg>';
const WARN_SVG = '<svg width="14" height="14" style="vertical-align:-2px" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M-1.57,-7.95 C-1.57,-7.95 -10.04,6.19 -10.04,6.19 C-10.6,7.15 -10.27,8.37 -9.31,8.93 C-9.01,9.1 -8.68,9.19 -8.33,9.19 C-8.33,9.19 8.61,9.19 8.61,9.19 C9.71,9.18 10.6,8.28 10.58,7.17 C10.58,6.83 10.49,6.49 10.32,6.19 C10.32,6.19 1.85,-7.95 1.85,-7.95 C1.27,-8.89 0.04,-9.19 -0.9,-8.62 C-1.18,-8.45 -1.41,-8.22 -1.57,-7.95z" transform="matrix(1 0 0 1 15.86 15.81)"/><path d=" M12,9 C12,9 12,13 12,13" transform="matrix(1 0 0 1 4 4)"/><path d=" M12,17 C12,17 12,17 12,17z" transform="matrix(1 0 0 1 4 4)"/></svg>';
const SWAP_SVG = '<svg width="14" height="14" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d=" M11,-7.9 C11,-7.9 11,-1.9 11,-1.9 C11,-1.9 5,-1.9 5,-1.9 M-11,8.1 C-11,8.1 -11,2.1 -11,2.1 C-11,2.1 -5,2.1 -5,2.1 M-8.5,-2.9 C-6.8,-7.6 -1.7,-10 3,-8.4 C4.3,-8 5.4,-7.2 6.4,-6.3 C6.4,-6.3 11,-1.9 11,-1.9 M-11,2.1 C-11,2.1 -6.4,6.5 -6.4,6.5 C-2.9,10 2.8,10 6.3,6.5 C7.2,5.6 8,4.4 8.4,3.1" transform="matrix(1 0 0 1 16 15.9)"/></svg>';
const EYE_SVG = '<svg width="16" height="16" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M-11,0 C-11,0 -7,-8 0,-8 C7,-8 11,0 11,0 C11,0 7,8 0,8 C-7,8 -11,0 -11,0z" transform="matrix(1 0 0 1 16 16)"/><path d=" M0,-3 C1.66,-3 3,-1.66 3,0 C3,1.66 1.66,3 0,3 C-1.66,3 -3,1.66 -3,0 C-3,-1.66 -1.66,-3 0,-3z" transform="matrix(1 0 0 1 16 16)"/></svg>';
const ARROW_R_SVG = '<svg viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d=" M12,5 C12,5 19,12 19,12 C19,12 12,19 12,19 M5,12 C5,12 19,12 19,12" transform="matrix(1 0 0 1 4 4)"/></svg>';
const CHEV_L_SVG = '<svg viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d=" M3,6 C3,6 -3,0 -3,0 C-3,0 3,-6 3,-6" transform="matrix(1 0 0 1 16 16)"/></svg>';
const CHEV_R_SVG = '<svg viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d=" M3,6 C3,6 -3,0 -3,0 C-3,0 3,-6 3,-6" transform="matrix(-1 0 0 -1 16 16)"/></svg>';
const MERGE_SVG = '<svg viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M21,15 C21,15 21,19 21,19 C21,20.11 20.11,21 19,21 C19,21 5,21 5,21 C3.9,21 3,20.11 3,19 C3,19 3,15 3,15" transform="matrix(1 0 0 1 4 4)"/><path d=" M12,3 C12,3 12,15 12,15 M17,8 C17,8 12,3 12,3 C12,3 7,8 7,8" transform="matrix(1 0 0 1 4 4)"/></svg>';
const FUNNEL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18l-7 8v5l-4 2v-7z"/></svg>';
const AI_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5l1.8 4.9 4.9 1.8-4.9 1.8L12 16.9l-1.8-4.9-4.9-1.8 4.9-1.8L12 3.5z"/><path d="M19.5 15l.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8.8-2.1z"/></svg>';
const EDIT_SVG = '<svg width="14" height="14" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M16.5,3.5 C17.33,2.67 18.67,2.67 19.5,3.5 C20.33,4.33 20.33,5.67 19.5,6.5 C19.5,6.5 7,19 7,19 C7,19 3,20 3,20 C3,20 4,16 4,16 C4,16 16.5,3.5 16.5,3.5z" transform="matrix(1 0 0 1 4 4)"/><path d=" M12,20 C12,20 21,20 21,20" transform="matrix(1 0 0 1 4 4)"/></svg>';
const LAYERS_SVG = '<svg width="14" height="14" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M2,17 C2,17 12,22 12,22 C12,22 22,17 22,17" transform="matrix(1 0 0 1 4 4)"/><path d=" M2,12 C2,12 12,17 12,17 C12,17 22,12 22,12" transform="matrix(1 0 0 1 4 4)"/><path d=" M12,2 C12,2 2,7 2,7 C2,7 12,12 12,12 C12,12 22,7 22,7 C22,7 12,2 12,2z" transform="matrix(1 0 0 1 4 4)"/></svg>';
const RETRY_SVG = '<svg width="16" height="16" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M3.51,15 C4.84,18.78 8.51,21.22 12.52,20.99 C16.52,20.76 19.89,17.91 20.77,14.01 C21.66,10.1 19.86,6.07 16.35,4.13 C12.85,2.19 8.48,2.81 5.64,5.64 C5.64,5.64 1,10 1,10 M1,4 C1,4 1,10 1,10 C1,10 7,10 7,10" transform="matrix(1 0 0 1 4 4)"/></svg>';
const TRASH_SVG = '<svg width="15" height="15" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M7,-8 C7,-8 7,6 7,6 C7,7.1 6.1,8 5,8 C5,8 -5,8 -5,8 C-6.1,8 -7,7.1 -7,6 C-7,6 -7,-8 -7,-8" transform="matrix(1 0 0 1 16 20.5)"/><path d=" M14,15 C14,15 14,21 14,21" transform="matrix(1 0 0 1 0 2.5)"/><path d=" M18,15 C18,15 18,21 18,21" transform="matrix(1 0 0 1 0 2.5)"/><path d=" M7,10 C7,10 9,10 9,10 C9,10 25,10 25,10" transform="matrix(1 0 0 1 0 1.5)"/><path d=" M-4,2 C-4,2 -4,0 -4,0 C-4,-1.1 -3.1,-2 -2,-2 C-2,-2 2,-2 2,-2 C3.1,-2 4,-1.1 4,0 C4,0 4,2 4,2" transform="matrix(1 0 0 1 16 9.5)"/></svg>';
const NEWS_SVG = '<svg width="14" height="14" viewBox="4 4 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d=" M14,2 C14,2 14,8 14,8 C14,8 20,8 20,8 M14,2 C14,2 6,2 6,2 C4.89,2 4,2.9 4,4 C4,4 4,20 4,20 C4,21.11 4.89,22 6,22 C6,22 18,22 18,22 C19.11,22 20,21.11 20,20 C20,20 20,8 20,8 C20,8 14,2 14,2z" transform="matrix(1 0 0 1 4 4)"/><path d=" M8,17 C8,17 16,17 16,17" transform="matrix(1 0 0 1 4 4)"/><path d=" M8,13 C8,13 16,13 16,13" transform="matrix(1 0 0 1 4 4)"/><path d=" M8,9 C8,9 10,9 10,9" transform="matrix(1 0 0 1 4 4)"/></svg>';
const SUBS_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 14.5h5M15 14.5h2"/></svg>';
const G_SVG = '<svg viewBox="2 2 20 20" fill="currentColor"><path d="M12.04 10.96v2.32h3.84c-.16 1-1.15 2.9-3.84 2.9-2.31 0-4.2-1.91-4.2-4.27s1.89-4.27 4.2-4.27c1.32 0 2.2.56 2.7 1.05l1.84-1.77c-1.18-1.1-2.68-1.77-4.54-1.77-3.74 0-6.74 3-6.74 6.76s3 6.76 6.74 6.76c3.89 0 6.47-2.74 6.47-6.59 0-.44-.05-.78-.11-1.12l-6.36.04z"/></svg>';
const GEMINI_SVG = G_SVG;
(function (g) {
  var EXPORTS = {
    NEWS_SVG: NEWS_SVG,
    CHECK_SVG: CHECK_SVG,
    COPY_SVG: COPY_SVG,
    PASTE_SVG: PASTE_SVG,
    ERASE_SVG: ERASE_SVG,
    DOWNLOAD_SVG: DOWNLOAD_SVG,
    EDIT_SVG: EDIT_SVG,
    RETRY_SVG: RETRY_SVG,
    TRASH_SVG: TRASH_SVG,
    WARN_SVG: WARN_SVG
  };
  Object.keys(EXPORTS).forEach(function (k) {
    if (g[k] === undefined) g[k] = EXPORTS[k];
  });
})(typeof window !== 'undefined' ? window : this);
}
function nm_ua_js(window, document, __nm) {
(() => {
  'use strict';

  if (window.NMUA) return;
  const MAP = {
    CHECK: 'checkmark',
    OK: 'checkmark',
    COPY: 'copy',
    PASTE: 'clipboard',
    ERASE: 'delete',
    UNDO: 'cornerUpLeft',
    WAIT: 'clock',
    ERR: 'plusToX',
    DOWNLOAD: 'download2',
    WARN: 'alertTriangle',
    SWAP: 'refresh',
    EYE: 'visibility',
    ARROW_R: 'arrowRight',
    CHEV_L: 'chevronLeft',
    CHEV_R: 'chevronRight',
    MERGE: 'upload',
    FUNNEL: 'filter',
    EDIT: 'edit3',
    LAYERS: 'layers',
    RETRY: 'rotateCcw',
    TRASH: 'trash2',
    NEWS: 'fileText'
  };
  const TOGGLE = new Set(['copy', 'trash2', 'visibility']);
  const SRC = () => ({
    CHECK: typeof window.CHECK_SVG === 'string' && window.CHECK_SVG,
    OK: typeof window.OK_SVG === 'string' && window.OK_SVG,
    COPY: typeof window.COPY_SVG === 'string' && window.COPY_SVG,
    PASTE: typeof window.PASTE_SVG === 'string' && window.PASTE_SVG,
    ERASE: typeof window.ERASE_SVG === 'string' && window.ERASE_SVG,
    UNDO: typeof window.UNDO_SVG === 'string' && window.UNDO_SVG,
    ERR: typeof window.ERR_SVG === 'string' && window.ERR_SVG,
    EYE: typeof window.EYE_SVG === 'string' && window.EYE_SVG,
    MERGE: typeof window.MERGE_SVG === 'string' && window.MERGE_SVG,
    NEWS: typeof window.NEWS_SVG === 'string' && window.NEWS_SVG,
    DOWNLOAD: typeof window.DOWNLOAD_SVG === 'string' && window.DOWNLOAD_SVG,
    WARN: typeof window.WARN_SVG === 'string' && window.WARN_SVG,
    SWAP: typeof window.SWAP_SVG === 'string' && window.SWAP_SVG,
    ARROW_R: typeof window.ARROW_R_SVG === 'string' && window.ARROW_R_SVG,
    CHEV_L: typeof window.CHEV_L_SVG === 'string' && window.CHEV_L_SVG,
    CHEV_R: typeof window.CHEV_R_SVG === 'string' && window.CHEV_R_SVG,
    FUNNEL: typeof window.FUNNEL_SVG === 'string' && window.FUNNEL_SVG,
    EDIT: typeof window.EDIT_SVG === 'string' && window.EDIT_SVG,
    LAYERS: typeof window.LAYERS_SVG === 'string' && window.LAYERS_SVG,
    RETRY: typeof window.RETRY_SVG === 'string' && window.RETRY_SVG,
    TRASH: typeof window.TRASH_SVG === 'string' && window.TRASH_SVG,
    WAIT: typeof window.WAIT_SVG === 'string' && window.WAIT_SVG
  });
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const tpl = document.createElement('template');
  let sigs = null,
    lib = null,
    libP = null;
  const inner = s => {
    tpl.innerHTML = __nm.h(s);
    const v = tpl.content.firstElementChild;
    return v ? v.innerHTML : '';
  };
  const nameOf = svg => {
    if (!sigs) {
      sigs = new Map();
      const src = SRC();
      for (const k in MAP) if (src[k]) sigs.set(inner(src[k]), MAP[k]);
    }
    return sigs.get(svg.innerHTML) || null;
  };
  const load = () => libP || (libP = Promise.all([import("../../home/deck/vendor/useanimations/player.js"), import("../../home/deck/vendor/useanimations/icons.js")]).then(([p, i]) => {
    lib = {
      loadAnimation: p.loadAnimation,
      icons: i.default
    };
    injectCss();
    return lib;
  }).catch(() => null));
  function injectCss() {
    if (document.getElementById('nm-ua-css')) return;
    const st = document.createElement('style');
    st.id = 'nm-ua-css';
    st.textContent = '.nm-ua{position:absolute;pointer-events:none;color:var(--accent);line-height:0}' + '.nm-ua svg{display:block;width:100%;height:100%;overflow:visible}' + '.nm-ua.sw path{stroke-width:var(--ua-sw)}' + '.nm-ua path[stroke^="rgb"]:not([stroke="rgb(255,255,255)"]){stroke:currentColor}' + '.nm-ua path[fill="rgb(0,0,0)"]{fill:currentColor}' + '.nm-ua path[stroke="rgb(255,255,255)"]{stroke:var(--bg,Canvas)}' + '.nm-ua path[fill="rgb(255,255,255)"]{fill:var(--bg,Canvas)}';
    document.head.appendChild(st);
  }
  const has = svg => !!(lib && svg && !reduce.matches && nameOf(svg));
  function place(box, svg, k) {
    const r = __nm.rect(svg);
    if (!r.width || !r.height) return false;
    const cb = box.offsetParent;
    let ox, oy;
    if (!cb || cb === document.body && window.getComputedStyle(cb).position === 'static') {
      ox = -window.scrollX;
      oy = -window.scrollY;
    } else {
      const c = __nm.rect(cb);
      ox = c.left + cb.clientLeft - cb.scrollLeft;
      oy = c.top + cb.clientTop - cb.scrollTop;
    }
    const w = r.width * k,
      h = r.height * k;
    box.style.width = w + 'px';
    box.style.height = h + 'px';
    box.style.left = r.left - ox - (w - r.width) / 2 + 'px';
    box.style.top = r.top - oy - (h - r.height) / 2 + 'px';
    return true;
  }
  const live = new WeakMap();
  function play(svg) {
    if (!has(svg) || !svg.parentElement) return false;
    const name = nameOf(svg),
      A = lib.icons[name];
    if (!A) return false;
    const prev = live.get(svg);
    if (prev) prev();
    const box = document.createElement('span');
    box.className = 'nm-ua';
    box.setAttribute('aria-hidden', 'true');
    const sw = svg.getAttribute('stroke-width');
    if (sw && sw !== '2') {
      box.classList.add('sw');
      box.style.setProperty('--ua-sw', sw);
    }
    svg.parentElement.appendChild(box);
    const k = (A.w || 24) / 24;
    if (!place(box, svg, k)) {
      box.remove();
      return false;
    }
    let p;
    try {
      p = lib.loadAnimation({
        container: box,
        animationData: A
      });
    } catch (_) {
      box.remove();
      return false;
    }
    const vis = svg.style.visibility;
    svg.style.visibility = 'hidden';
    let raf = 0,
      done = false,
      guard = 0;
    const end = () => {
      if (done) return;
      done = true;
      window.cancelAnimationFrame(raf);
      window.clearTimeout(guard);
      try {
        p.destroy();
      } catch (_) {}
      box.remove();
      if (svg.isConnected) svg.style.visibility = vis;
      live.delete(svg);
    };
    const watch = () => {
      if (!svg.isConnected || !box.isConnected || !place(box, svg, k)) {
        end();
        return;
      }
      raf = window.requestAnimationFrame(watch);
    };
    live.set(svg, end);
    p.addEventListener('complete', () => {
      if (TOGGLE.has(name) && !p._back) {
        p._back = true;
        p.setDirection(-1);
        p.play();
        return;
      }
      end();
    });
    p.goToAndStop(0);
    p.setDirection(1);
    p.play();
    raf = window.requestAnimationFrame(watch);
    guard = window.setTimeout(end, (A.op - A.ip) / (A.fr || 30) * 1000 * (TOGGLE.has(name) ? 2 : 1) * 2);
    return true;
  }
  function watchSwap(b, orig) {
    if (b._nmSwap) return;
    const stop = () => {
      mo.disconnect();
      window.clearTimeout(t);
      b._nmSwap = null;
    };
    const mo = new window.MutationObserver(() => {
      const s = b.querySelector('svg');
      if (!s || s === orig || s.closest('.nm-ua')) return;
      if (!s.classList.contains('ic-swap')) s.classList.add('ic-swap');
      if (s.innerHTML === orig.innerHTML) stop();
    });
    const t = window.setTimeout(stop, 10000);
    mo.observe(b, {
      childList: true,
      subtree: true
    });
    b._nmSwap = stop;
  }
  document.addEventListener('click', e => {
    if (e.defaultPrevented) return;
    const b = e.target.closest('button,a[href],[role="button"]');
    if (!b || b.disabled || b.matches('.dlbtn') || b.closest('#menu-host')) return;
    const svg = b.querySelector('svg');
    if (!svg || svg.closest('.nm-ua')) return;
    if (!reduce.matches && nameOf(svg) === 'copy') watchSwap(b, svg);
    if (lib) play(svg);
  }, true);
  const warm = () => {
    load();
  };
  if ('requestIdleCallback' in window) window.requestIdleCallback(warm, {
    timeout: 4000
  });else window.setTimeout(warm, 1200);
  window.NMUA = {
    has,
    play,
    load
  };
})();
}
function nm_rail_js(window, document, __nm) {
(function () {
  'use strict';

  if (window.nmRail) return;
  var KEYS = {
    img: 'nomute_thumb_hist',
    cap: 'nomute_cap_hist'
  };
  var HMS = 12 * 3600e3;
  var HMAX = 240;
  var T0 = Date.now();
  var mounts = [];
  function toText(s) {
    return String(s == null ? '' : s);
  }
  function keyOf(u) {
    return String(u || '').split('?')[0].replace(/^https?:\/\/[^/]+\//, '');
  }
  function load(scope) {
    try {
      var a = JSON.parse(window.localStorage.getItem(KEYS[scope]) || '[]');
      return Array.isArray(a) ? a : [];
    } catch (e) {
      return [];
    }
  }
  function save(scope, a) {
    try {
      window.localStorage.setItem(KEYS[scope], JSON.stringify(a));
      return true;
    } catch (e) {
      return false;
    }
  }
  var SRV = {
    img: [],
    cap: []
  };
  var srvSeen = {
    img: {},
    cap: {}
  };
  var srvBusy = {};
  function merged(scope) {
    var out = [],
      k = {};
    prune(load(scope)).concat(SRV[scope] || []).forEach(function (e) {
      if (!e || !e.url) return;
      var kk = keyOf(e.url);
      if (k[kk]) return;
      k[kk] = 1;
      out.push(e);
    });
    return out;
  }
  function srvSync(m) {
    var o = m.opt,
      scope = o.scope;
    if (!o.srv || srvBusy[scope]) return;
    srvBusy[scope] = 1;
    window.fetch(o.srv, {
      cache: 'no-store'
    }).then(function (r) {
      return r.ok ? r.json() : null;
    }).then(function (d) {
      var items = d && (Array.isArray(d) ? d : d.items);
      if (!Array.isArray(items)) return null;
      var have = {};
      load(scope).forEach(function (e) {
        if (e && e.url) have[String(e.url).split('/').slice(-2)[0]] = 1;
      });
      var todo = items.map(function (it) {
        return it && (it.id || it);
      }).filter(function (id) {
        return id && typeof id === 'string' && !srvSeen[scope][id] && !have[id];
      }).slice(0, 24);
      if (!o.srvstat) {
        items.forEach(function (it) {
          if (it && it.url && SAFE_URL.test(String(it.url))) addSrv(scope, it);
        });
        return null;
      }
      return Promise.all(todo.map(function (id) {
        srvSeen[scope][id] = 1;
        return window.fetch(o.srvstat + encodeURIComponent(id), {
          cache: 'no-store'
        }).then(function (r) {
          return r.ok ? r.json() : null;
        }, function () {
          delete srvSeen[scope][id];
          return null;
        }).then(function (v) {
          if (v && v.url) addSrv(scope, {
            id: id,
            url: v.url,
            ts: Date.parse(v.ts || '') || 0,
            cap: v.cap || ''
          });
        }).catch(function () {});
      }));
    }).catch(function () {}).then(function () {
      srvBusy[scope] = 0;
      mounts.forEach(function (x) {
        if (x.opt.scope === scope) {
          x.sig = null;
          render(x);
        }
      });
    });
  }
  function addSrv(scope, e) {
    if (!e || !e.url || !SAFE_URL.test(String(e.url))) return;
    var kk = keyOf(e.url);
    for (var i = 0; i < SRV[scope].length; i++) if (keyOf(SRV[scope][i].url) === kk) return;
    SRV[scope].push({
      url: e.url,
      ts: e.ts || 0,
      cap: e.cap || '',
      id: e.id || ''
    });
  }
  var SAFE_URL = /^(https?:|blob:|data:image\/)/i;
  var AV_RE = /\.(mp4|webm|mov|m4v|mp3|m4a|wav|aac|ogg|flac)(\?|#|$)/i;
  function isAV(u) {
    return AV_RE.test(String(u || ''));
  }
  function mkAV(u) {
    var v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.preload = 'metadata';
    v.src = __nm.u(u);
    return v;
  }
  function prune(a) {
    var cut = Date.now() - HMS;
    return a.filter(function (e) {
      return e && e.ts && e.ts >= cut;
    });
  }
  function histTime(ts) {
    var d = new Date(ts),
      h = d.getHours(),
      m = d.getMinutes(),
      ap = h < 12 ? 'AM' : 'PM';
    h = h % 12 || 12;
    var now = new Date();
    var dd = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000);
    var pre = dd === 0 ? '오늘 ' : dd === 1 ? '어제 ' : d.getMonth() + 1 + '/' + d.getDate() + ' ';
    return pre + h + ':' + String(m).padStart(2, '0') + ' ' + ap;
  }
  function dlBlob(url, name) {
    var a = document.createElement('a');
    a.href = __nm.u(/\/\/pub-[0-9a-fA-F]+\.r2\.dev\//.test(url) ? 'api/dl?u=' + encodeURIComponent(url) + '&n=' + encodeURIComponent(name || 'out') : url);
    a.download = name || 'out';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  var DL_SVG = function () {
    return window.DOWNLOAD_SVG || '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M5 21h14"/></svg>';
  };
  var CK_SVG = function () {
    return window.CHECK_SVG || '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';
  };
  var CHEV = '<svg class="hist-ar" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  function shellHTML(id) {
    return '<button class="hist-h car-h" id="' + id + 'ResH" type="button" aria-expanded="true" aria-controls="' + id + 'ResJobs ' + id + 'ResGrid">' + '<span class="hist-ttl"><span class="car-bul" aria-hidden="true">•</span>결과 <span class="hist-cnt" id="' + id + 'ResCnt">(0)</span></span>' + CHEV + '</button>' + '<div class="jobs" id="' + id + 'ResJobs"></div>' + '<div class="hist-grid" id="' + id + 'ResGrid"></div>' + '<div class="hist-empty" id="' + id + 'ResEmpty">아직 제작한 게 없습니다</div>' + '<div class="hist" id="' + id + 'Hist">' + '<button class="hist-h" id="' + id + 'PrevH" type="button" aria-expanded="false" aria-controls="' + id + 'PrevBody">' + '<span class="hist-ttl"><span class="hist-bul" aria-hidden="true">•</span>이전 제작 <span class="hist-cnt" id="' + id + 'PrevCnt">(0)</span></span>' + '<span class="hist-note">전 기기 제작 내역</span>' + CHEV + '</button>' + '<div class="hist-body" id="' + id + 'PrevBody" hidden>' + '<div class="hist-empty" id="' + id + 'PrevEmpty" hidden>아직 제작한 게 없습니다</div>' + '<div class="hist-grid" id="' + id + 'PrevGrid"></div></div></div>';
  }
  function tileEl(m, e, gridSel, cntSel) {
    var it = document.createElement('div');
    it.className = 'hist-it';
    var hd = document.createElement('div');
    hd.className = 'hist-hd';
    hd.textContent = histTime(e.ts);
    var th = document.createElement('div');
    th.className = 'hist-thumb';
    var dl = document.createElement('a');
    dl.className = 'imgdl dlbtn';
    dl.href = __nm.u(e.url);
    dl.setAttribute('aria-label', '다운로드');
    dl.innerHTML = __nm.h(DL_SVG());
    dl.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      dlBlob(e.url, e.dlname || m.opt.dlname);
    });
    var av = isAV(e.url);
    var img;
    if (av && !e.poster) {
      img = mkAV(e.url);
    } else {
      img = document.createElement('img');
      img.loading = 'lazy';
      img.alt = '';
      img.src = __nm.u(e.poster || e.url);
      img.onerror = function () {
        if (av) {
          try {
            img.replaceWith(mkAV(e.url));
          } catch (er) {
            it.remove();
          }
          return;
        }
        if (e.poster && img.src !== e.url && !img.dataset.rt) {
          img.dataset.rt = '1';
          img.src = __nm.u(e.url);
          return;
        }
        it.remove();
        m.dead[keyOf(e.url)] = 1;
        var cc = document.getElementById(cntSel);
        var g = document.getElementById(gridSel);
        if (cc && g) cc.textContent = '(' + g.children.length + ')';
      };
    }
    var cap = document.createElement('span');
    cap.className = 'hist-cap';
    cap.textContent = toText(e.cap);
    if (e.varStr) {
      var v = document.createElement('span');
      v.className = 'hist-cap-v';
      v.textContent = (cap.textContent ? ' ' : '') + e.varStr;
      cap.appendChild(v);
    }
    th.append(dl, img, cap);
    var onEd = typeof m.opt.onEdit === 'function' ? m.opt.onEdit : typeof window.nmJobEdit === 'function' ? window.nmJobEdit : null;
    if (e.src && e.src.app && onEd) {
      var ed = document.createElement('button');
      ed.type = 'button';
      ed.className = 'imgedit';
      ed.title = '이 설정으로 수정';
      ed.setAttribute('aria-label', '수정');
      if (window.EDIT_SVG) {
        ed.innerHTML = __nm.h(window.EDIT_SVG);
        ed.addEventListener('click', function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          onEd(e.src, e.url);
        });
        th.appendChild(ed);
      }
    }
    var onShow = typeof m.opt.onShow === 'function' ? m.opt.onShow : typeof window.nmJobShow === 'function' ? window.nmJobShow : null;
    if (onShow) {
      th.classList.add('hist-go');
      th.setAttribute('role', 'button');
      th.tabIndex = 0;
      th.title = '탭 = 이 제작물을 위 결과 창에서 보기';
      var goT = function (ev) {
        if (ev) ev.preventDefault();
        try {
          onShow(e.url, e);
        } catch (er) {}
      };
      th.addEventListener('click', goT);
      th.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') goT(ev);
      });
    }
    it.append(hd, th);
    return it;
  }
  function jobDur(s) {
    return s < 60 ? s + 's' : Math.floor(s / 60) + 'm ' + s % 60 + 's';
  }
  function pendList(m) {
    var k = m.opt.jobkey;
    if (!k) return [];
    var a = [];
    try {
      if (window.nmJobs && /_pend$/.test(k)) a = window.nmJobs.list(k) || [];else {
        var raw = JSON.parse(window.localStorage.getItem(k) || '[]');
        if (Array.isArray(raw)) a = raw.filter(function (x) {
          return x && x.status === 'run';
        });
      }
    } catch (e) {
      a = [];
    }
    return a.slice().sort(function (x, y) {
      return (+y.t0 || 0) - (+x.t0 || 0);
    });
  }
  function pendRows(m, host) {
    var a = pendList(m);
    var open = typeof window.nmJobOpen === 'function' ? window.nmJobOpen : null;
    a.forEach(function (j) {
      var row = document.createElement('div');
      row.className = 'job';
      var lab = document.createElement('span');
      lab.className = 'jlab';
      lab.textContent = toText(j.lbl || j.label || j.cap || '제작');
      var st = document.createElement('span');
      st.className = 'jst';
      var sec = +j.t0 ? Math.max(0, Math.round((Date.now() - +j.t0) / 1000)) : 0;
      st.innerHTML = __nm.h((window.nmOrbHTML ? window.nmOrbHTML('solving', 14) : '') + '<span class="nm-shim">제작중' + (sec ? ' · <b class="jsec">' + jobDur(sec) + '</b>' : '') + '</span>');
      row.append(lab, st);
      if (open) {
        row.className = 'job job-go';
        row.setAttribute('role', 'button');
        row.tabIndex = 0;
        row.title = '탭 = 이 작업의 제작 화면 열기';
        var go = function (ev) {
          if (ev) ev.preventDefault();
          try {
            open(j.id, j);
          } catch (e) {}
        };
        row.addEventListener('click', go);
        row.addEventListener('keydown', function (ev) {
          if (ev.key === 'Enter' || ev.key === ' ') go(ev);
        });
      }
      host.appendChild(row);
    });
    return a.length;
  }
  function pendTick(m) {
    var host = document.getElementById(m.id + 'ResJobs');
    if (!host) return;
    var rows = host.querySelectorAll('.job:not(.done)');
    var a = pendList(m);
    if (rows.length !== a.length) {
      m.sig = null;
      render(m);
      return;
    }
    for (var i = 0; i < rows.length; i++) {
      var sec = +a[i].t0 ? Math.max(0, Math.round((Date.now() - +a[i].t0) / 1000)) : 0;
      var b = rows[i].querySelector('.jsec');
      if (!b) {
        if (sec > 0) {
          m.sig = null;
          render(m);
          return;
        }
        continue;
      }
      var t = jobDur(sec);
      if (b.textContent !== t) b.textContent = t;
    }
  }
  var _tick = null;
  function tickSync() {
    var live = mounts.some(function (m) {
      return pendList(m).length;
    });
    if (!live) {
      if (_tick) {
        window.clearInterval(_tick);
        _tick = null;
      }
      return;
    }
    if (_tick) return;
    _tick = window.setInterval(function () {
      if (document.hidden) return;
      if (!mounts.some(function (m) {
        return pendList(m).length;
      })) {
        window.clearInterval(_tick);
        _tick = null;
        return;
      }
      mounts.forEach(pendTick);
    }, 1000);
  }
  function jobRow(m, a) {
    var host = document.getElementById(m.id + 'ResJobs');
    if (!host) return;
    host.innerHTML = __nm.h('');
    var np = pendRows(m, host);
    if (!a.length) return;
    var row = document.createElement('div');
    row.className = 'job done';
    var lab = document.createElement('span');
    lab.className = 'jlab';
    lab.textContent = toText(a[0].cap) || '결과';
    var st = document.createElement('span');
    st.className = 'jst';
    st.innerHTML = __nm.h(CK_SVG() + '<span>완료 · ' + a.length + '장 · ' + histTime(a[0].ts) + '</span>');
    row.append(lab, st);
    var sv = document.createElement('div');
    sv.className = 'jsave-row';
    if (a[0].src && a[0].src.app && typeof m.opt.onEdit === 'function') {
      var ed = document.createElement('button');
      ed.type = 'button';
      ed.className = 'imgedit';
      ed.title = '이 설정으로 수정';
      ed.setAttribute('aria-label', '수정');
      if (window.EDIT_SVG) {
        ed.innerHTML = __nm.h(window.EDIT_SVG);
        ed.addEventListener('click', function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          m.opt.onEdit(a[0].src, a[0].url);
        });
        sv.appendChild(ed);
      }
    }
    var dl = document.createElement('button');
    dl.type = 'button';
    dl.className = 'sbtn cref-dlall dlbtn';
    dl.title = '전체 다운로드';
    dl.setAttribute('aria-label', '전체 다운로드');
    dl.innerHTML = __nm.h((window.DLSEQ_IC || DL_SVG()) + '<span class="cref-dllbl">전체</span>');
    dl.addEventListener('click', function () {
      a.forEach(function (e, i) {
        window.setTimeout(function () {
          dlBlob(e.url, e.dlname || m.opt.dlname);
        }, i * 220);
      });
    });
    sv.appendChild(dl);
    row.appendChild(sv);
    host.appendChild(row);
  }
  function adoptCount(m) {
    var n = 0;
    (m.adopt || []).forEach(function (el) {
      if (el && el.parentNode) n += el.children.length;
    });
    return n;
  }
  function applyFold(m) {
    var rh = document.getElementById(m.id + 'ResH');
    if (!rh) return;
    var open = rh.getAttribute('aria-expanded') !== 'false';
    [m.id + 'ResJobs', m.id + 'ResGrid'].forEach(function (i) {
      var e = document.getElementById(i);
      if (e) e.hidden = !open;
    });
    var re = document.getElementById(m.id + 'ResEmpty');
    if (re) re.hidden = !open || re.dataset.has === '1';
  }
  function render(m) {
    var all = merged(m.opt.scope).filter(function (e) {
      return e && e.url && !m.dead[keyOf(e.url)];
    });
    all.sort(function (x, y) {
      return (y.ts || 0) - (x.ts || 0);
    });
    var pend = pendList(m);
    var sig = all.length + ':' + ((all[0] || {}).url || '') + ':' + ((all[all.length - 1] || {}).url || '') + ':' + pend.length + ':' + pend.map(function (j) {
      return j.id;
    }).join(',');
    if (m.sig === sig) {
      applyFold(m);
      return;
    }
    m.sig = sig;
    var res = all.filter(function (e) {
      return (e.ts || 0) >= T0;
    });
    var resK = {};
    res.forEach(function (e) {
      resK[keyOf(e.url)] = 1;
    });
    var prev = all.filter(function (e) {
      return !resK[keyOf(e.url)];
    });
    var rc = document.getElementById(m.id + 'ResCnt');
    if (rc) rc.textContent = '(' + (res.length + pend.length) + ')';
    var re = document.getElementById(m.id + 'ResEmpty');
    var rg = document.getElementById(m.id + 'ResGrid');
    if (rg) {
      rg.innerHTML = __nm.h('');
      res.forEach(function (e) {
        rg.appendChild(tileEl(m, e, m.id + 'ResGrid', m.id + 'ResCnt'));
      });
    }
    jobRow(m, res);
    var ext = adoptCount(m);
    var pc = document.getElementById(m.id + 'PrevCnt');
    if (pc) pc.textContent = '(' + (prev.length + ext) + ')';
    var pe = document.getElementById(m.id + 'PrevEmpty');
    if (pe) pe.hidden = !!(prev.length + ext);
    var pg = document.getElementById(m.id + 'PrevGrid');
    if (pg) {
      pg.innerHTML = __nm.h('');
      prev.forEach(function (e) {
        pg.appendChild(tileEl(m, e, m.id + 'PrevGrid', m.id + 'PrevCnt'));
      });
    }
    if (re) re.dataset.has = res.length || pend.length ? '1' : '0';
    applyFold(m);
    tickSync();
  }
  function bindFold(m) {
    var pairs = [[m.id + 'PrevH', m.id + 'PrevBody']];
    pairs.forEach(function (p) {
      var h = document.getElementById(p[0]),
        b = document.getElementById(p[1]);
      if (!h || !b) return;
      var t = null;
      h.addEventListener('click', function () {
        var open = b.hidden;
        window.clearTimeout(t);
        b.classList.remove('closing');
        h.setAttribute('aria-expanded', String(open));
        var hist = document.getElementById(m.id + 'Hist');
        if (hist) hist.classList.toggle('open', open);
        if (open) {
          b.hidden = false;
        } else if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
          b.hidden = true;
        } else {
          b.classList.add('closing');
          t = window.setTimeout(function () {
            b.hidden = true;
            b.classList.remove('closing');
          }, 270);
        }
      });
    });
    var rh = document.getElementById(m.id + 'ResH');
    if (rh) {
      var els = [m.id + 'ResJobs', m.id + 'ResGrid'];
      rh.addEventListener('click', function () {
        rh.setAttribute('aria-expanded', String(rh.getAttribute('aria-expanded') !== 'true'));
        applyFold(m);
      });
    }
  }
  var api = {
    mount: function (anchor, opt) {
      if (!anchor || !anchor.parentNode) return null;
      opt = opt || {};
      if (!Object.prototype.hasOwnProperty.call(KEYS, opt.scope)) return null;
      var scope = opt.scope;
      var m = {
        id: 'nmr' + (mounts.length ? mounts.length + 1 : ''),
        opt: {
          scope: scope,
          dlname: opt.dlname || 'out',
          onEdit: opt.onEdit,
          jobkey: opt.jobkey || '',
          srv: opt.srv || '',
          srvstat: opt.srvstat || ''
        },
        dead: {},
        sig: null
      };
      var wrap = document.createElement('div');
      wrap.className = 'out nm-rail';
      wrap.innerHTML = __nm.h(shellHTML(m.id));
      if (anchor.id === 'out' && anchor.parentNode.classList && anchor.parentNode.classList.contains('wrap')) {
        var col = document.createElement('div');
        col.className = 'out-col';
        anchor.parentNode.insertBefore(col, anchor);
        col.appendChild(anchor);
        col.appendChild(wrap);
      } else anchor.parentNode.insertBefore(wrap, anchor.nextSibling);
      m.el = wrap;
      mounts.push(m);
      bindFold(m);
      render(m);
      srvSync(m);
      return m;
    },
    add: function (e) {
      if (!e || !e.url || !SAFE_URL.test(String(e.url))) return false;
      var scopes = {},
        ok = false;
      mounts.forEach(function (m) {
        scopes[m.opt.scope] = m;
      });
      Object.keys(scopes).forEach(function (sc) {
        var a = prune(load(sc));
        var k = keyOf(e.url);
        if (a.some(function (x) {
          return keyOf(x.url) === k;
        })) {
          ok = true;
          return;
        }
        a.push({
          url: e.url,
          poster: e.poster || '',
          dlname: e.dlname || scopes[sc].opt.dlname,
          cap: e.cap || '',
          varStr: e.varStr || '',
          ts: e.ts || Date.now(),
          src: e.src || null
        });
        while (a.length > HMAX) a.shift();
        ok = save(sc, a) || ok;
      });
      mounts.forEach(function (m) {
        m.sig = null;
        render(m);
      });
      return ok;
    },
    adopt: function (el) {
      if (!el) return false;
      var m = mounts[0];
      if (!m) return false;
      var body = document.getElementById(m.id + 'PrevBody');
      if (!body) return false;
      if (el.parentNode !== body) body.appendChild(el);
      m.adopt = m.adopt || [];
      if (m.adopt.indexOf(el) < 0) m.adopt.push(el);
      m.sig = null;
      render(m);
      return true;
    },
    meta: function (url, varStr) {
      if (!url) return false;
      var k = keyOf(url),
        hit = false;
      var scopes = {};
      mounts.forEach(function (m) {
        scopes[m.opt.scope] = 1;
      });
      Object.keys(scopes).forEach(function (sc) {
        var a = load(sc),
          ch = false;
        a.forEach(function (e) {
          if (e && keyOf(e.url) === k && e.varStr !== varStr) {
            e.varStr = varStr || '';
            ch = true;
          }
        });
        if (ch) {
          save(sc, a);
          hit = true;
        }
      });
      if (hit) mounts.forEach(function (m) {
        m.sig = null;
        render(m);
      });
      return hit;
    },
    items: function () {
      var m = mounts[0];
      return m ? prune(load(m.opt.scope)) : [];
    },
    refresh: function () {
      mounts.forEach(render);
    }
  };
  window.nmRail = api;
  function autoMount() {
    if (document.querySelector('.nm-rail')) return;
    var tag = document.querySelector('script[src$="nm-rail.js"]');
    var scope = tag && tag.getAttribute('data-scope') || 'cap';
    var dln = tag && tag.getAttribute('data-dlname') || 'out';
    var want = tag && tag.getAttribute('data-anchor');
    var jkey = tag && tag.getAttribute('data-jobkey') || '';
    var rendered = window.innerWidth > 0 && __nm.rects(document.documentElement).length > 0;
    var shown = function (e) {
      for (var n = e; n && n !== document.documentElement; n = n.parentElement) {
        if (window.getComputedStyle(n).display === 'none') return false;
      }
      return true;
    };
    var vis = function (e) {
      return !!(e && (rendered ? e.offsetParent || __nm.rects(e).length : shown(e)));
    };
    var anchor = null;
    if (want) {
      var w = document.querySelector(want);
      if (vis(w)) anchor = w;
    }
    if (!anchor) ['out', 'jobs'].some(function (id) {
      var e = document.getElementById(id);
      if (vis(e)) {
        anchor = e;
        return true;
      }
      return false;
    });
    if (!anchor) ['.out', '.jobs'].some(function (q) {
      var e = document.querySelector(q);
      if (vis(e)) {
        anchor = e;
        return true;
      }
      return false;
    });
    if (!anchor) {
      var wrapEl = document.querySelector('.wrap') || document.body;
      anchor = document.createElement('div');
      anchor.className = 'nm-rail-anchor';
      wrapEl.appendChild(anchor);
    }
    api.mount(anchor, {
      scope: scope,
      dlname: dln,
      jobkey: jkey,
      srv: tag && tag.getAttribute('data-srv') || '',
      srvstat: tag && tag.getAttribute('data-srvstat') || ''
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoMount);else autoMount();
  var _kickT = null;
  function kick() {
    window.clearTimeout(_kickT);
    _kickT = window.setTimeout(function () {
      api.refresh();
      mounts.forEach(srvSync);
    }, 60);
  }
  window.addEventListener('storage', function (ev) {
    if (!ev || !ev.key) return;
    var mine = mounts.some(function (m) {
      return KEYS[m.opt.scope] === ev.key;
    });
    if (mine) kick();
  });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) kick();
  });
  window.addEventListener('focus', kick);
})();
}
function nm_jobs_js(window, document, __nm) {
(function () {
  var CAP = 6;
  var TTL = 24 * 3600e3;
  var POLL = {};
  function pk(key, id) {
    return String(key) + ' ' + String(id);
  }
  function read(key) {
    var a = [];
    try {
      var raw = JSON.parse(window.localStorage.getItem(key) || '[]');
      if (Array.isArray(raw)) a = raw;else if (raw && raw.id) a = [raw];
    } catch (e) {
      a = [];
    }
    var now = Date.now();
    return a.filter(function (j) {
      return j && j.id && now - (+j.t0 || 0) < TTL;
    });
  }
  function write(key, a) {
    try {
      if (a.length) window.localStorage.setItem(key, JSON.stringify(a.slice(0, CAP)));else window.localStorage.removeItem(key);
    } catch (e) {}
    try {
      if (window.nmRail && typeof window.nmRail.refresh === 'function') window.nmRail.refresh();
    } catch (e) {}
  }
  window.nmJobs = {
    add: function (key, job) {
      if (!job || !job.id) return 0;
      var j = {};
      for (var k in job) j[k] = job[k];
      if (!j.t0) j.t0 = Date.now();
      var a = read(key).filter(function (x) {
        return x.id !== j.id;
      });
      a.unshift(j);
      write(key, a);
      return Math.min(a.length, CAP);
    },
    list: function (key) {
      return read(key);
    },
    get: function (key, id) {
      return read(key).filter(function (x) {
        return x.id === id;
      })[0] || null;
    },
    drop: function (key, id) {
      if (id == null) {
        write(key, []);
        return;
      }
      write(key, read(key).filter(function (x) {
        return x.id !== id;
      }));
    },
    hold: function (key, id, stop) {
      var k = pk(key, id);
      if (POLL[k]) return false;
      POLL[k] = typeof stop === 'function' ? stop : function () {};
      return true;
    },
    free: function (key, id) {
      delete POLL[pk(key, id)];
    },
    stopOne: function (key, id) {
      var k = pk(key, id);
      if (!POLL[k]) return false;
      try {
        POLL[k]();
      } catch (e) {}
      delete POLL[k];
      return true;
    },
    busy: function (key, id) {
      return !!POLL[pk(key, id)];
    },
    absorb: function (key, ids) {
      if (!Array.isArray(ids) || !ids.length) return;
      var set = {};
      ids.forEach(function (i) {
        set[String(i)] = 1;
      });
      write(key, read(key).filter(function (x) {
        return !set[String(x.id)];
      }));
    },
    count: function (key) {
      var p = String(key) + ' ',
        n = 0;
      for (var k in POLL) {
        if (k.indexOf(p) === 0) n++;
      }
      return n;
    },
    stopAll: function (key) {
      var p = String(key) + ' ';
      for (var k in POLL) {
        if (k.indexOf(p) === 0) {
          try {
            POLL[k]();
          } catch (e) {}
          delete POLL[k];
        }
      }
    }
  };
})();
(function () {
  if (!window.nmJobs) return;
  var TTL = 24 * 3600e3;
  var GONE = 'nm_jobs_gone';
  var API = '/api/jobs';
  var KEY_OF = {
    thumb: 'nm_thumb_pend',
    imgedit: 'nm_thumb_pend',
    resize: 'nm_thumb_pend',
    upscale: 'nm_thumb_pend',
    genimg: 'nm_thumb_pend',
    compose: 'nm_thumb_pend',
    comp: 'nm_thumb_pend',
    thumbredo: 'nm_thumb_pend',
    framethumb: 'nm_thumb_pend',
    edit: 'nm_edit_pend',
    conv: 'nm_conv_pend',
    nb: 'nm_nb_pend',
    track: 'nm_track_pend',
    k: 'k_pend',
    song: 'nm_song_pend',
    voice: 'nm_song_pend',
    sb: 'sb_jobs',
    vd: 'vd_jobs',
    ys: 'ys_jobs'
  };
  var LBL_OF = {
    thumb: '카드 제작',
    imgedit: '사진 편집',
    resize: '비율 맞추기',
    upscale: '화질 올리기',
    genimg: 'AI 생성',
    compose: '합성',
    comp: '합성',
    thumbredo: '수정',
    framethumb: '베스트컷 큐레이션',
    edit: '영상 편집',
    conv: '변환',
    nb: '미디어 요약',
    track: '트래킹',
    k: '프롬프트',
    song: '음원',
    voice: '보이스',
    sb: '콘티',
    vd: '큐영상',
    ys: '유튜브'
  };
  var ARR_KEY = {
    sb_jobs: 1,
    vd_jobs: 1,
    ys_jobs: 1
  };
  function goneMap() {
    try {
      var g = JSON.parse(window.localStorage.getItem(GONE) || '{}');
      if (!g || typeof g !== 'object' || Array.isArray(g)) return {};
      var now = Date.now(),
        out = {};
      for (var k in g) {
        if (now - (+g[k] || 0) < TTL) out[k] = +g[k];
      }
      return out;
    } catch (e) {
      return {};
    }
  }
  function goneAdd(id) {
    if (!id) return;
    try {
      var g = goneMap();
      g[String(id)] = Date.now();
      var ks = Object.keys(g);
      if (ks.length > 200) {
        ks.sort(function (a, b) {
          return g[a] - g[b];
        });
        ks.slice(0, ks.length - 200).forEach(function (k) {
          delete g[k];
        });
      }
      window.localStorage.setItem(GONE, JSON.stringify(g));
    } catch (e) {}
  }
  function tellDone(id) {
    try {
      window.fetch(API, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        keepalive: true,
        body: JSON.stringify({
          done: [String(id)]
        })
      }).catch(function () {});
    } catch (e) {}
  }
  function arrRead(key) {
    try {
      var a = JSON.parse(window.localStorage.getItem(key) || '[]');
      return Array.isArray(a) ? a : [];
    } catch (e) {
      return [];
    }
  }
  function poke(key) {
    try {
      window.dispatchEvent(new window.StorageEvent('storage', {
        key: key
      }));
      return;
    } catch (e) {}
    try {
      var ev = document.createEvent('Event');
      ev.initEvent('storage', false, false);
      ev.key = key;
      window.dispatchEvent(ev);
    } catch (e2) {}
  }
  var syncing = false;
  function sync() {
    if (syncing) return Promise.resolve(0);
    syncing = true;
    return window.fetch(API + '?t=' + Date.now(), {
      cache: 'no-store'
    }).then(function (r) {
      return r.ok ? r.json() : null;
    }).then(function (d) {
      var items = d && Array.isArray(d.items) ? d.items : [];
      if (!items.length) return 0;
      var gone = goneMap(),
        byKey = {},
        n = 0;
      items.forEach(function (r) {
        if (!r || !r.id || gone[r.id]) return;
        if (Date.now() - (+r.t0 || 0) > TTL) return;
        var key = KEY_OF[r.kind];
        if (!key) return;
        (byKey[key] = byKey[key] || []).push(r);
      });
      Object.keys(byKey).forEach(function (key) {
        var add = 0;
        if (ARR_KEY[key]) {
          var a = arrRead(key),
            have = {};
          a.forEach(function (x) {
            if (x && x.id) have[x.id] = 1;
          });
          byKey[key].forEach(function (r) {
            if (have[r.id]) return;
            a.unshift({
              id: r.id,
              out: r.out || '',
              ts: +r.t0 || Date.now(),
              label: typeof r.lbl === 'string' && r.lbl ? String(r.lbl).slice(0, 80) : LBL_OF[r.kind] || '제작',
              status: 'run',
              _remote: 1
            });
            add++;
          });
          if (!add) return;
          try {
            window.localStorage.setItem(key, JSON.stringify(a.slice(0, 30)));
          } catch (e) {
            return;
          }
          try {
            if (window.nmRail && typeof window.nmRail.refresh === 'function') window.nmRail.refresh();
          } catch (e) {}
        } else {
          var have2 = {};
          try {
            (window.nmJobs.list(key) || []).forEach(function (x) {
              have2[x.id] = 1;
              (Array.isArray(x.thids) ? x.thids : []).forEach(function (t) {
                have2[String(t)] = 1;
              });
            });
          } catch (e) {}
          byKey[key].forEach(function (r) {
            if (have2[r.id]) return;
            var j = {
              id: r.id,
              t0: +r.t0 || Date.now(),
              lbl: typeof r.lbl === 'string' && r.lbl ? String(r.lbl).slice(0, 80) : LBL_OF[r.kind] || '제작',
              _remote: 1
            };
            if (r.out) j.out = r.out;
            if (r.outs) j.outs = r.outs;
            if (r.mode) j.mode = r.mode;
            if (typeof r.bid === 'string' && /^[A-Za-z0-9-]{1,40}$/.test(r.bid)) j.bid = r.bid;
            if (r.bi != null && isFinite(+r.bi)) j.bi = +r.bi;
            try {
              window.nmJobs.add(key, j);
              add++;
            } catch (e) {}
          });
          if (!add) return;
        }
        n += add;
        poke(key);
      });
      return n;
    }).catch(function () {
      return 0;
    }).then(function (n) {
      syncing = false;
      return n;
    });
  }
  window.nmJobs.sync = sync;
  window.nmJobs.gone = goneAdd;
  var _drop = window.nmJobs.drop;
  window.nmJobs.drop = function (key, id) {
    try {
      if (id == null) {
        (window.nmJobs.list(key) || []).forEach(function (x) {
          goneAdd(x.id);
          tellDone(x.id);
        });
      } else {
        goneAdd(id);
        tellDone(id);
      }
    } catch (e) {}
    return _drop.call(window.nmJobs, key, id);
  };
  var last = 0;
  function kick() {
    var t = Date.now();
    if (t - last < 5e3) return;
    last = t;
    sync();
  }
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) kick();
  });
  window.addEventListener('focus', kick);
  window.addEventListener('pageshow', function (e) {
    if (e && e.persisted) {
      last = 0;
      kick();
    }
  });
  window.setInterval(function () {
    if (!document.hidden) sync();
  }, 20000);
  sync();
})();
}
function nm_clip_js(window, document, __nm) {
__nm.ex({"ERASE_UNDO_MS":[()=>ERASE_UNDO_MS],"clipCopy":[()=>clipCopy,(v)=>{clipCopy=v;}],"clipPasteText":[()=>clipPasteText,(v)=>{clipPasteText=v;}],"clipPasteFallback":[()=>clipPasteFallback,(v)=>{clipPasteFallback=v;}],"attachCopyPaste":[()=>attachCopyPaste,(v)=>{attachCopyPaste=v;}]});
const ERASE_UNDO_MS = 10000;
async function clipCopy(text, btn, after) {
  try {
    await window.navigator.clipboard.writeText(text || '');
  } catch {}
  btn.innerHTML = __nm.h(window.CHECK_SVG);
  btn._icon = 'check';
  btn.classList.add('ok');
  window.setTimeout(() => {
    btn.classList.remove('ok');
    after();
  }, 1200);
}
async function clipPasteText() {
  try {
    if (window.navigator.clipboard && window.navigator.clipboard.readText) {
      const t = await window.navigator.clipboard.readText();
      if (t) return t;
    }
  } catch {}
  return await clipPasteFallback();
}
function clipPasteFallback() {
  return new Promise(resolve => {
    const ov = document.createElement('dialog');
    ov.className = 'pastefb';
    ov.innerHTML = __nm.h('<div class="pastefb-box"><div class="pastefb-msg">아래 칸을 <b>길게 눌러 “붙여넣기”</b> 하면 자동 반영돼</div>' + '<textarea class="pastefb-ta" placeholder="여기에 붙여넣기" autocapitalize="off" autocomplete="off" spellcheck="false"></textarea>' + '<div class="pastefb-row"><button type="button" class="pastefb-btn pastefb-cancel">취소</button><button type="button" class="pastefb-btn pastefb-ok">적용</button></div></div>');
    document.body.appendChild(ov);
    const ta = ov.querySelector('.pastefb-ta');
    let done = false;
    const finish = v => {
      if (done) return;
      done = true;
      try {
        ov.close();
      } catch {}
      ov.remove();
      resolve(v || null);
    };
    ta.addEventListener('paste', () => window.setTimeout(() => {
      if (ta.value) finish(ta.value);
    }, 30));
    ov.querySelector('.pastefb-ok').onclick = () => finish(ta.value);
    ov.querySelector('.pastefb-cancel').onclick = () => finish(null);
    ov.addEventListener('cancel', e => {
      e.preventDefault();
      finish(null);
    });
    ov.addEventListener('click', e => {
      if (e.target === ov) finish(null);
    });
    try {
      ov.showModal();
    } catch {
      ov.setAttribute('open', '');
    }
    window.setTimeout(() => {
      try {
        ta.focus();
      } catch {}
    }, 60);
  });
}
function attachCopyPaste(el, withErase) {
  if (!el || el._clipBound) return;
  el._clipBound = true;
  const wrap = document.createElement('div');
  wrap.style.position = 'relative';
  wrap.classList.add('iowrap');
  el.parentNode.insertBefore(wrap, el);
  wrap.appendChild(el);
  const split = true;
  const nBtn = (split ? 2 : 1) + (withErase ? 1 : 0);
  el.style.paddingRight = el.tagName !== 'TEXTAREA' || el.classList.contains('ta1l') ? 14 + nBtn * 32 + 'px' : '42px';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'iobtn iobtn-edge' + (withErase ? ' iobtn-pp' : '');
  wrap.appendChild(btn);
  let copyB = null;
  if (split) {
    copyB = document.createElement('button');
    copyB.type = 'button';
    copyB.className = 'iobtn iobtn-edge iobtn-copy' + (withErase ? ' iobtn-copy-e' : '') + ' iobtn-hide';
    copyB.innerHTML = __nm.h(window.COPY_SVG);
    copyB.setAttribute('aria-label', '복사');
    copyB.title = '복사';
    copyB.onclick = ev => {
      ev.preventDefault();
      clipCopy(el.value, copyB, refresh);
    };
    wrap.appendChild(copyB);
  }
  let eraser = null,
    undoTimer = null,
    undoVal = '',
    prog = false,
    armUndo = null;
  const setIcon = (b, svg, key) => {
    if (b._icon !== key) {
      b.innerHTML = __nm.h(svg);
      b._icon = key;
    }
  };
  const refresh = () => {
    const filled = (el.value || '').trim().length > 0;
    if (!btn.classList.contains('ok')) {
      setIcon(btn, window.PASTE_SVG, 'paste');
      btn.dataset.mode = 'paste';
      btn.setAttribute('aria-label', '붙여넣기');
      btn.title = '붙여넣기';
    }
    if (copyB && !copyB.classList.contains('ok')) {
      setIcon(copyB, window.COPY_SVG, 'copy');
      copyB.classList.toggle('iobtn-hide', !filled);
    }
    if (eraser) eraser.classList.toggle('iobtn-off', !filled && !eraser.classList.contains('iobtn-undo'));
  };
  if (withErase) {
    eraser = document.createElement('button');
    eraser.type = 'button';
    eraser.className = 'iobtn iobtn-edge iobtn-erase';
    eraser.innerHTML = __nm.h(window.ERASE_SVG);
    eraser.setAttribute('aria-label', '입력 지우기');
    eraser.title = '입력 지우기';
    const exitUndo = () => {
      if (undoTimer) {
        window.clearTimeout(undoTimer);
        undoTimer = null;
      }
      eraser.classList.remove('iobtn-undo');
      eraser.innerHTML = __nm.h(window.ERASE_SVG);
      eraser.setAttribute('aria-label', '입력 지우기');
      eraser.title = '입력 지우기';
      refresh();
    };
    armUndo = prev => {
      undoVal = prev;
      eraser.classList.remove('iobtn-off');
      eraser.classList.add('iobtn-undo');
      eraser.innerHTML = __nm.h(window.UNDO_SVG);
      eraser.setAttribute('aria-label', '되돌리기');
      eraser.title = '되돌리기 (직전 입력 복원)';
      if (undoTimer) window.clearTimeout(undoTimer);
      undoTimer = window.setTimeout(exitUndo, ERASE_UNDO_MS);
    };
    eraser.onclick = ev => {
      ev.preventDefault();
      if (el.disabled) return;
      if (eraser.classList.contains('iobtn-undo')) {
        prog = true;
        el.value = undoVal;
        el.dispatchEvent(new window.Event('input', {
          bubbles: true
        }));
        prog = false;
        try {
          el.focus();
        } catch {}
        exitUndo();
        return;
      }
      if (!(el.value || '').length) return;
      const prev = el.value;
      prog = true;
      el.value = '';
      el.dispatchEvent(new window.Event('input', {
        bubbles: true
      }));
      prog = false;
      try {
        el.focus();
      } catch {}
      armUndo(prev);
    };
    el.addEventListener('input', () => {
      if (!prog && undoTimer) exitUndo();
    });
    wrap.appendChild(eraser);
  }
  btn.onclick = async ev => {
    ev.preventDefault();
    if (el.disabled) return;
    const selS = el.selectionStart,
      selE = el.selectionEnd;
    const t = await clipPasteText();
    if (t) {
      const prev = el.value;
      prog = true;
      if (typeof el.setRangeText === 'function' && typeof selS === 'number') el.setRangeText(t, selS, selE, 'end');else el.value += t;
      el.dispatchEvent(new window.Event('input', {
        bubbles: true
      }));
      prog = false;
      if (armUndo && prev) armUndo(prev);
    }
    refresh();
  };
  el.addEventListener('input', refresh);
  refresh();
}
}
function nm_sync_js(window, document, __nm) {
(function () {
  'use strict';

  let visTs = Date.now();
  let lastKick = 0;
  let bootTag = null,
    tagInflight = false;
  const TAG = r => r && (r.headers.get('etag') || r.headers.get('last-modified')) || '';
  async function selfTag() {
    try {
      const r = await window.fetch(window.location.pathname, {
        method: 'HEAD',
        cache: 'no-store'
      });
      return r.ok ? TAG(r) : null;
    } catch (_) {
      return null;
    }
  }
  const busy = () => {
    try {
      if (typeof window.nmSyncBusy === 'function' && window.nmSyncBusy()) return true;
    } catch (_) {}
    const a = document.activeElement;
    return !!(a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable));
  };
  let probeP = null;
  function probeNow() {
    if (probeP) return probeP;
    probeP = (async () => {
      try {
        const r = await window.fetch('/nm-sync.js?_=' + Date.now(), {
          method: 'HEAD',
          redirect: 'manual',
          cache: 'no-store'
        });
        if (r.type === 'opaqueredirect' || r.status === 401 || r.status === 403 || r.status >= 300 && r.status < 400) {
          let last = 0;
          try {
            last = +window.sessionStorage.getItem('nm_sync_heal') || 0;
          } catch (_) {}
          if (Date.now() - visTs < 15e3 && Date.now() - last > 180e3) {
            try {
              window.sessionStorage.setItem('nm_sync_heal', String(Date.now()));
            } catch (_) {}
            window.console.log('[nm-sync] 자가치유 — 로그인 만료 감지 · 최상위 재진입(?nosw=1)');
            try {
              window.top.location.href = __nm.u('/?nosw=1');
            } catch (_) {
              window.location.reload();
            }
            return 'auth';
          }
          try {
            if (typeof window.nmSyncWarn === 'function') window.nmSyncWarn('auth');
          } catch (_) {}
          return 'auth';
        }
        if (!r.ok && r.status) {
          try {
            if (typeof window.nmSyncWarn === 'function') window.nmSyncWarn('srv');
          } catch (_) {}
          return 'srv';
        }
        return 'ok';
      } catch (_) {
        try {
          if (typeof window.nmSyncWarn === 'function') window.nmSyncWarn('net');
        } catch (_) {}
        return 'net';
      }
    })().finally(() => {
      probeP = null;
    });
    return probeP;
  }
  function softReload() {
    try {
      if (document.getElementById('nmSyncVeil')) return;
      const v = document.createElement('div');
      v.id = 'nmSyncVeil';
      v.setAttribute('aria-hidden', 'true');
      v.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:var(--z-lock,300);background:var(--bg,#070a12);opacity:0;transition:opacity .5s ease';
      (document.body || document.documentElement).appendChild(v);
      void v.offsetWidth;
      v.style.opacity = '1';
      window.setTimeout(() => window.location.reload(), 460);
      return;
    } catch (_) {}
    window.location.reload();
  }
  async function verCheck() {
    if (tagInflight || bootTag == null) return;
    tagInflight = true;
    try {
      const now = await selfTag();
      if (now && bootTag && now !== bootTag) {
        if (busy()) {
          window.console.log('[nm-sync] 새 배포 감지 — 작업 중이라 이월(다음 복귀 때 재시도)');
          return;
        }
        window.console.log('[nm-sync] 새 배포 감지 — 자동 리로드로 신규 코드 탑재');
        softReload();
      }
    } finally {
      tagInflight = false;
    }
  }
  function resumeNow() {
    const t = Date.now();
    if (t - lastKick < 5e3) return;
    lastKick = t;
    visTs = t;
    try {
      if (typeof window.nmRefresh === 'function') window.nmRefresh();
    } catch (_) {}
    probeNow();
    verCheck();
  }
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) resumeNow();
  });
  window.addEventListener('focus', () => resumeNow());
  window.addEventListener('pageshow', e => {
    if (e.persisted) {
      lastKick = 0;
      resumeNow();
    }
  });
  selfTag().then(t => {
    bootTag = t;
  });
  probeNow();
  window.nmSync = {
    probeNow,
    resumeNow,
    verCheck,
    softReload
  };
})();
}
function nm_loader_js(window, document, __nm) {
(function () {
  var EASE = 'var(--ease,cubic-bezier(.2,.7,.3,1))';
  if (!document.getElementById('nmld-css')) {
    var css = '' + '.nmld{--sz:7px;--gap:5px;--bnc:-6px;display:inline-flex;align-items:center;justify-content:center;gap:var(--gap,5px);line-height:0;color:var(--accent)}' + '.nmld i{width:var(--sz,7px);height:var(--sz,7px);border-radius:50%;background:currentColor;animation:nmldBounce .9s ' + EASE + ' infinite}' + '.nmld i:nth-child(2){animation-delay:.15s}.nmld i:nth-child(3){animation-delay:.3s}' + '@keyframes nmldBounce{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(var(--bnc,-6px));opacity:1}}' + '.ld-host{display:inline-flex;align-items:center;justify-content:center;line-height:0}' + '.ld-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-variant-numeric:tabular-nums;line-height:1}' + '@keyframes ldRot{to{transform:rotate(360deg)}}' + '@keyframes ldBars{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}' + '@keyframes ldMx{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1)}}' + '@keyframes ldDit{0%,100%{opacity:.1}50%{opacity:1}}' + '@keyframes ldMbA{0%,100%{cx:30px}50%{cx:70px}}' + '@keyframes ldMbB{0%,100%{cx:70px}50%{cx:30px}}' + '@keyframes ldNwL{0%{transform:translateX(0)}28%{transform:translateX(var(--nx))}50%,100%{transform:translateX(0)}}' + '@keyframes ldNwR{0%,50%{transform:translateX(0)}78%{transform:translateX(var(--nxr))}100%{transform:translateX(0)}}' + '@keyframes ldHxA{0%,100%{transform:translateX(var(--amp)) scale(1);opacity:1}50%{transform:translateX(var(--ampN)) scale(.5);opacity:.45}}' + '@keyframes ldHxB{0%,100%{transform:translateX(var(--ampN)) scale(.5);opacity:.45}50%{transform:translateX(var(--amp)) scale(1);opacity:1}}' + '@keyframes ldMorphT{0%,10%{transform:rotate(0deg) scale(1)}20%,30%{transform:rotate(72deg) scale(.88)}40%,50%{transform:rotate(144deg) scale(1)}60%,70%{transform:rotate(216deg) scale(.88)}80%,90%{transform:rotate(288deg) scale(1)}100%{transform:rotate(360deg) scale(1)}}' + '@media (prefers-reduced-motion:reduce){.nmld i{animation:none;opacity:.6}.ld-host *{animation:none!important}}';
    var st = document.createElement('style');
    st.id = 'nmld-css';
    st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  }
  window.nmLoaderHTML = function (o) {
    o = o || {};
    var s = o.size || 7,
      g = Math.max(2, Math.round(s * 0.72)),
      b = -Math.max(3, Math.round(s * 0.86));
    return '<span class="nmld" role="status" aria-label="' + (o.label || '불러오는 중') + '" style="--sz:' + s + 'px;--gap:' + g + 'px;--bnc:' + b + 'px"><i></i><i></i><i></i></span>';
  };
  var ASCII_SETS = {
    'ascii': ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    'ascii-line': ['|', '/', '-', '\\'],
    'ascii-braille': ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'],
    'ascii-blocks': ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█', '▇', '▆', '▅', '▄', '▃', '▂'],
    'ascii-bounce': ['⠁', '⠂', '⠄', '⡀', '⢀', '⠠', '⠐', '⠈']
  };
  var BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  var MORPH_POINTS = 24;
  function ngonRadius(ang, n, phase) {
    phase = phase || 0;
    var seg = 2 * Math.PI / n;
    var a = ang - phase;
    var local = (a % seg + seg) % seg - seg / 2;
    return Math.cos(Math.PI / n) / Math.cos(local);
  }
  function morphPath(radiusAt) {
    var parts = [];
    for (var i = 0; i < MORPH_POINTS; i++) {
      var ang = i / MORPH_POINTS * 2 * Math.PI - Math.PI / 2;
      var r = Math.min(1.05, radiusAt(ang));
      var x = (50 + Math.cos(ang) * 46 * r).toFixed(2),
        y = (50 + Math.sin(ang) * 46 * r).toFixed(2);
      parts.push((i === 0 ? 'M' : 'L') + x + ' ' + y);
    }
    return parts.join(' ') + ' Z';
  }
  var MORPH_PATHS = [morphPath(function () {
    return 1;
  }), morphPath(function (a) {
    return ngonRadius(a, 4, Math.PI / 4);
  }), morphPath(function (a) {
    return ngonRadius(a, 3);
  }), morphPath(function (a) {
    return ngonRadius(a, 6);
  }), morphPath(function (a) {
    return ngonRadius(a, 4);
  })];
  var MORPH_SEQ = [];
  MORPH_PATHS.forEach(function (p) {
    MORPH_SEQ.push(p, p);
  });
  MORPH_SEQ.push(MORPH_PATHS[0]);
  var SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(t, at) {
    var e = document.createElementNS(SVGNS, t);
    for (var k in at) e.setAttribute(k, at[k]);
    return e;
  }
  function dotsNode(diam) {
    var s = diam || 7,
      g = Math.max(2, Math.round(s * 0.72)),
      b = -Math.max(3, Math.round(s * 0.86));
    var h = document.createElement('span');
    h.className = 'nmld';
    h.style.cssText = '--sz:' + s + 'px;--gap:' + g + 'px;--bnc:' + b + 'px';
    h.innerHTML = __nm.h('<i></i><i></i><i></i>');
    return h;
  }
  window.mkLoader = function (v, size, speed, ease) {
    size = size || 24;
    speed = speed || 1;
    ease = ease || EASE;
    var s = size,
      sp = speed,
      i;
    if (v === 'dots' || !v) return dotsNode(Math.max(5, Math.round(s * 0.29)));
    var h = document.createElement('span');
    h.className = 'ld-host';
    if (v === 'spinner') {
      var stw = Math.max(2, s * .09),
        r = (s - stw) / 2;
      var sv = svgEl('svg', {
        width: s,
        height: s,
        viewBox: '0 0 ' + s + ' ' + s
      });
      sv.style.cssText = 'animation:ldRot ' + sp + 's linear infinite';
      sv.appendChild(svgEl('circle', {
        cx: s / 2,
        cy: s / 2,
        r: r,
        fill: 'none',
        stroke: 'currentColor',
        'stroke-opacity': '0.2',
        'stroke-width': stw
      }));
      sv.appendChild(svgEl('path', {
        d: 'M ' + s / 2 + ' ' + (s / 2 - r) + ' A ' + r + ' ' + r + ' 0 0 1 ' + (s / 2 + r) + ' ' + s / 2,
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': stw,
        'stroke-linecap': 'round'
      }));
      h.appendChild(sv);
    } else if (v === 'bars') {
      var bw = s * .16;
      h.style.cssText += 'gap:' + s * .1 + 'px;height:' + s + 'px';
      for (i = 0; i < 4; i++) {
        var b2 = document.createElement('span');
        b2.style.cssText = 'width:' + bw + 'px;height:' + s + 'px;border-radius:999px;background:currentColor;transform-origin:center bottom;animation:ldBars ' + sp + 's ' + ease + ' ' + i * sp * .12 + 's infinite';
        h.appendChild(b2);
      }
    } else if (v === 'dot-matrix') {
      var g2 = s * .14,
        dm = (s - g2 * 2) / 3;
      h.style.cssText += 'display:grid;grid-template-columns:repeat(3,' + dm + 'px);gap:' + g2 + 'px';
      for (i = 0; i < 9; i++) {
        var x = i % 3,
          y = Math.floor(i / 3),
          dl = (x + y) / 4 * sp;
        var c = document.createElement('span');
        c.style.cssText = 'width:' + dm + 'px;height:' + dm + 'px;border-radius:50%;background:currentColor;animation:ldMx ' + sp + 's ' + ease + ' ' + dl + 's infinite';
        h.appendChild(c);
      }
    } else if (v === 'dither') {
      var gp = Math.max(1, s * .05),
        cl = (s - gp * 3) / 4;
      h.style.cssText += 'display:grid;grid-template-columns:repeat(4,' + cl + 'px);gap:' + gp + 'px';
      BAYER4.forEach(function (ord) {
        var c = document.createElement('span');
        c.style.cssText = 'width:' + cl + 'px;height:' + cl + 'px;background:currentColor;animation:ldDit ' + sp + 's ' + ease + ' ' + ord / 16 * sp + 's infinite';
        h.appendChild(c);
      });
    } else if (v === 'morph') {
      var sv2 = svgEl('svg', {
        width: s,
        height: s,
        viewBox: '0 0 100 100'
      });
      var p = svgEl('path', {
        fill: 'currentColor',
        d: MORPH_PATHS[0]
      });
      p.style.cssText = 'transform-box:fill-box;transform-origin:center;animation:ldMorphT ' + sp * 5 + 's ' + ease + ' infinite';
      var kt = [],
        ks = [];
      for (i = 0; i <= 10; i++) kt.push((i / 10).toFixed(1));
      for (i = 0; i < 10; i++) ks.push('0.4 0 0.2 1');
      var an = svgEl('animate', {
        attributeName: 'd',
        values: MORPH_SEQ.join(';'),
        keyTimes: kt.join(';'),
        dur: sp * 5 + 's',
        repeatCount: 'indefinite',
        calcMode: 'spline',
        keySplines: ks.join(';')
      });
      p.appendChild(an);
      sv2.appendChild(p);
      h.appendChild(sv2);
    } else if (v === 'comet') {
      var head = s * .2,
        r2 = s / 2 - head / 2;
      var rot = document.createElement('span');
      rot.style.cssText = 'position:relative;display:block;width:' + s + 'px;height:' + s + 'px;animation:ldRot ' + sp + 's linear infinite';
      for (i = 0; i < 6; i++) {
        var sc = 1 - i * .13,
          sz = head * sc;
        var t = document.createElement('span');
        t.style.cssText = 'position:absolute;top:50%;left:50%;width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;background:currentColor;margin-left:' + -sz / 2 + 'px;margin-top:' + -sz / 2 + 'px;opacity:' + (1 - i * .16) + ';transform:rotate(' + -i * 15 + 'deg) translateY(' + -r2 + 'px)';
        rot.appendChild(t);
      }
      h.appendChild(rot);
    } else if (v === 'metaballs') {
      var id = 'mb' + Math.floor(Math.random() * 1e9);
      var sv3 = svgEl('svg', {
        width: s,
        height: s,
        viewBox: '0 0 100 100'
      });
      var df = svgEl('defs', {}),
        fl = svgEl('filter', {
          id: id
        });
      fl.appendChild(svgEl('feGaussianBlur', {
        'in': 'SourceGraphic',
        stdDeviation: '5',
        result: 'b'
      }));
      fl.appendChild(svgEl('feColorMatrix', {
        'in': 'b',
        values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8'
      }));
      df.appendChild(fl);
      sv3.appendChild(df);
      var gr = svgEl('g', {
        filter: 'url(#' + id + ')',
        fill: 'currentColor'
      });
      var c1 = svgEl('circle', {
          cy: '50',
          r: '15',
          cx: '30'
        }),
        c2 = svgEl('circle', {
          cy: '50',
          r: '15',
          cx: '70'
        });
      c1.style.cssText = 'animation:ldMbA ' + sp * 1.6 + 's ' + ease + ' infinite';
      c2.style.cssText = 'animation:ldMbB ' + sp * 1.6 + 's ' + ease + ' infinite';
      gr.appendChild(c1);
      gr.appendChild(c2);
      sv3.appendChild(gr);
      h.appendChild(sv3);
    } else if (v === 'newton') {
      var d2 = s * .2,
        out2 = d2 * 1.1;
      h.style.height = d2 + 'px';
      for (i = 0; i < 5; i++) {
        var bl = document.createElement('span');
        var base = 'width:' + d2 + 'px;height:' + d2 + 'px;border-radius:50%;background:currentColor;';
        if (i === 0) base += '--nx:' + -out2 + 'px;animation:ldNwL ' + sp * 1.5 + 's ' + ease + ' infinite';
        if (i === 4) base += '--nxr:' + out2 + 'px;animation:ldNwR ' + sp * 1.5 + 's ' + ease + ' infinite';
        bl.style.cssText = base;
        h.appendChild(bl);
      }
    } else if (v === 'helix') {
      var rows = 7,
        dt = s * .14,
        amp = s * .32;
      var rl = document.createElement('span');
      rl.style.cssText = 'position:relative;display:block;width:' + s + 'px;height:' + s + 'px';
      for (i = 0; i < rows; i++) {
        var top = i / (rows - 1) * (s - dt),
          dl2 = i / rows * sp;
        ['A', 'B'].forEach(function (k) {
          var dd = document.createElement('span');
          dd.style.cssText = 'position:absolute;width:' + dt + 'px;height:' + dt + 'px;border-radius:50%;background:currentColor;left:' + (s / 2 - dt / 2) + 'px;top:' + top + 'px;--amp:' + amp + 'px;--ampN:' + -amp + 'px;animation:ldHx' + k + ' ' + sp + 's ' + ease + ' ' + dl2 + 's infinite';
          rl.appendChild(dd);
        });
      }
      h.appendChild(rl);
    } else if (v === 'scramble') {
      var TG = 'LOADING',
        GL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/*#@';
      var sp1 = document.createElement('span');
      sp1.className = 'ld-mono';
      sp1.style.cssText = 'font-weight:500;letter-spacing:.2em;font-size:' + s * .42 + 'px';
      sp1.textContent = TG;
      h.appendChild(sp1);
      var tick = 0,
        total = TG.length + 4;
      var iv = window.setInterval(function () {
        if (!document.body.contains(h)) {
          window.clearInterval(iv);
          return;
        }
        var rev = tick % total,
          out = '';
        for (var j = 0; j < TG.length; j++) out += j < rev ? TG[j] : GL[Math.floor(Math.random() * GL.length)];
        sp1.textContent = out;
        tick++;
      }, sp / TG.length * 1000 * .55);
    } else if (v === 'percent') {
      var wrap = document.createElement('span');
      wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:' + s * .14 + 'px;width:' + s * 1.4 + 'px';
      var num = document.createElement('span');
      num.className = 'ld-mono';
      num.style.cssText = 'font-weight:500;font-size:' + s * .42 + 'px';
      num.textContent = '0%';
      var tr = document.createElement('span');
      tr.style.cssText = 'width:100%;overflow:hidden;border-radius:999px;height:' + Math.max(3, s * .1) + 'px;position:relative;background:transparent';
      var trBg = document.createElement('span');
      trBg.style.cssText = 'position:absolute;inset:0;background:currentColor;opacity:.15;border-radius:999px';
      var fill = document.createElement('span');
      fill.style.cssText = 'position:absolute;left:0;top:0;bottom:0;width:0%;background:currentColor;border-radius:999px';
      tr.appendChild(trBg);
      tr.appendChild(fill);
      wrap.appendChild(num);
      wrap.appendChild(tr);
      h.appendChild(wrap);
      var t2 = 0,
        dur = sp * 1000;
      var iv2 = window.setInterval(function () {
        if (!document.body.contains(h)) {
          window.clearInterval(iv2);
          return;
        }
        t2 += 40;
        var nx = Math.min(100, Math.round(t2 / dur * 100));
        num.textContent = nx + '%';
        fill.style.width = nx + '%';
        if (nx >= 100) t2 = 0;
      }, 40);
    } else if (ASCII_SETS[v]) {
      var fr = ASCII_SETS[v],
        f0 = 0;
      var sp2 = document.createElement('span');
      sp2.className = 'ld-mono';
      sp2.style.cssText = 'font-size:' + s + 'px';
      sp2.textContent = fr[0];
      h.appendChild(sp2);
      var iv3 = window.setInterval(function () {
        if (!document.body.contains(h)) {
          window.clearInterval(iv3);
          return;
        }
        f0 = (f0 + 1) % fr.length;
        sp2.textContent = fr[f0];
      }, sp / fr.length * 1000);
    } else {
      return dotsNode(Math.max(5, Math.round(s * 0.29)));
    }
    return h;
  };
})();
(function () {
  if (window.nmLoader) return;
  if (!document.getElementById('nm-orb-css')) {
    var css = '.nm-orb{display:inline-block;position:relative;vertical-align:middle;flex:0 0 auto}' + '.nm-orb svg{display:block;width:100%;height:100%;overflow:visible}' + '.nm-orb .nm-dot{fill:#e9eef0}' + '.nm-orb .nm-bd{transform-box:fill-box;transform-origin:center;animation:nmbd .92s var(--ease,cubic-bezier(.2,.7,.3,1)) infinite}' + '.nm-orb .nm-bd.b2{animation-delay:.15s}.nm-orb .nm-bd.b3{animation-delay:.3s}' + '@keyframes nmbd{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(-52%);opacity:1}}' + '.nm-load{display:inline-flex;align-items:center;gap:9px;vertical-align:middle}' + '.nm-load .nm-orb{width:22px;height:22px}' + '.nm-shim{background:linear-gradient(100deg,var(--mut,#8fa697) 0%,var(--mut,#8fa697) 38%,#ffffff 50%,var(--mut,#8fa697) 62%,var(--mut,#8fa697) 100%);' + 'background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;' + 'animation:nmshim 1.9s linear infinite;' + 'font-size:13.5px;font-weight:700;line-height:1;font-variant-numeric:tabular-nums;vertical-align:middle;transform:translateY(-.049em)}' + '.nm-load>.nm-shim{letter-spacing:0;display:inline-flex;align-items:center}' + '@keyframes nmshim{from{background-position:120% 0}to{background-position:-120% 0}}' + '@media(prefers-reduced-motion:reduce){.nm-shim{animation:none;color:var(--mut,#8fa697);-webkit-text-fill-color:var(--mut,#8fa697)}.nm-orb *{animation:none!important}}';
    var st = document.createElement('style');
    st.id = 'nm-orb-css';
    st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  }
  function dotsSVG() {
    return '<svg viewBox="0 0 100 100"><circle class="nm-dot nm-bd" cx="21" cy="50" r="9.5"/><circle class="nm-dot nm-bd b2" cx="50" cy="50" r="9.5"/><circle class="nm-dot nm-bd b3" cx="79" cy="50" r="9.5"/></svg>';
  }
  function orbType(t) {
    return 'solving';
  }
  function orbHTML(type, size) {
    var sz = size ? ' style="width:' + size + 'px;height:' + size + 'px"' : '';
    return '<span class="nm-orb" data-orb="' + orbType(type) + '"' + sz + '>' + dotsSVG() + '</span>';
  }
  function esc(x) {
    return String(x == null ? '' : x).replace(/[&<>"]/g, function (c) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[c];
    });
  }
  window.nmLoader = function (type, label, opts) {
    opts = opts || {};
    var g = opts.gap != null ? opts.gap : 9;
    var fs = opts.fs ? ' style="font-size:' + opts.fs + 'px"' : '';
    var orb = orbHTML(type, opts.size);
    return '<span class="nm-load" style="gap:' + g + 'px">' + orb + '<span class="nm-shim"' + fs + '>' + esc(label) + '</span></span>';
  };
  window.nmOrbHTML = orbHTML;
  function hydrate(root) {
    var els = (root || document).querySelectorAll('.nm-load[data-orb]:not([data-nm-done])'),
      i,
      e;
    for (i = 0; i < els.length; i++) {
      e = els[i];
      e.setAttribute('data-nm-done', '1');
      e.innerHTML = __nm.h(orbHTML(e.getAttribute('data-orb')) + '<span class="nm-shim">' + esc(e.getAttribute('data-label')) + '</span>');
    }
  }
  window.nmLoaderHydrate = hydrate;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () {
    hydrate();
  });else hydrate();
})();
(function () {
  if (window.nmEta) return;
  var KEY = 'nm-eta-v1',
    MIN = 2,
    W = 0.3,
    MAXS = 36000;
  var SEED = {
    'k-img': 180,
    'k-ref': 900,
    'sb': 180,
    'ly-burn': 180,
    'edit-burn': 180,
    'track-analyze': 360,
    'track-render': 900,
    'conv': 600,
    'song': 300,
    'song-voice': 900,
    'tr': 120,
    'edit-video': 600,
    'thumb-copy': 180,
    'img-gen': 120,
    'img-research': 120,
    'vidl': 330,
    'vidl-YT': 330,
    'vidl-IG': 330,
    'vidl-X': 330,
    'vidl-TT': 330,
    'vidl-FB': 330,
    'vidl-TH': 330,
    'vidl-subs': 120,
    'vidl-subs-YT': 120,
    'vidl-subs-IG': 120,
    'vidl-subs-X': 120,
    'vidl-subs-TT': 120,
    'vidl-subs-FB': 120,
    'vidl-subs-TH': 120,
    'ask-link': 500,
    'ask-link-stt-min': 90
  };
  function db() {
    try {
      return JSON.parse(window.localStorage.getItem(KEY)) || {};
    } catch (_) {
      return {};
    }
  }
  function save(d) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(d));
    } catch (_) {}
  }
  function seed(k) {
    return SEED[k] || 180;
  }
  function sec(k) {
    var e = db()[k];
    return e && e.n >= MIN && e.avg > 0 ? e.avg : seed(k);
  }
  function fmt(s) {
    s = Math.max(0, Math.round(s));
    return Math.floor(s / 60) + '분 ' + String(s % 60).padStart(2, '0') + '초';
  }
  function label(k) {
    return ' (예상 : ' + fmt(sec(k)) + ')';
  }
  function done(k, s) {
    s = Number(s);
    if (!(s > 0) || s > MAXS) return false;
    var d = db(),
      e = d[k] || {
        n: 0,
        avg: seed(k)
      };
    e.avg = e.n ? e.avg * (1 - W) + s * W : (seed(k) + s) / 2;
    e.n = e.n + 1;
    d[k] = e;
    save(d);
    return true;
  }
  function dump() {
    var d = db(),
      ks = Object.keys(SEED),
      i,
      k,
      e,
      live = 0;
    for (i = 0; i < ks.length; i++) {
      k = ks[i];
      e = d[k];
      window.console.log('[nmEta] ' + k + ' · 시드 ' + fmt(seed(k)) + ' · 표본 ' + (e && e.n || 0) + ' · 현재 ' + fmt(sec(k)));
      if (e && e.n) live++;
    }
    window.console.log('[nmEta] 학습된 축 ' + live + ' / 등록 ' + ks.length + ' · 미학습 ' + (ks.length - live) + '(표본 0 = done() 미배선이거나 아직 완료 이력 없음)');
    return {
      live: live,
      total: ks.length
    };
  }
  window.nmEta = {
    sec: sec,
    fmt: fmt,
    label: label,
    done: done,
    dump: dump,
    seed: seed,
    SEED: SEED
  };
})();
(function () {
  if (window.nmOrb) return;
  var TAU = Math.PI * 2,
    TILT = 0.26,
    CT = Math.cos(TILT),
    ST = Math.sin(TILT);
  var BAND = 0.09;
  function edge(phi, t) {
    return 0.02 + 0.42 * Math.sin(2 * phi - t * 1.1);
  }
  function dots(t, o) {
    o = o || {};
    var M = o.meridians || 24,
      K = o.rows || 16,
      out = [],
      m,
      k;
    for (m = 0; m < M; m++) {
      var phi = m / M * TAU + t * 0.35,
        e = edge(phi, t);
      for (k = 0; k < K; k++) {
        var lat = (k / (K - 1) - 0.5) * 2.7,
          cl = Math.cos(lat);
        var x = cl * Math.sin(phi),
          y = Math.sin(lat),
          z = cl * Math.cos(phi);
        var sy = y * CT + z * ST,
          sz = z * CT - y * ST,
          lit = y > e + BAND,
          gap = Math.abs(y - e) <= BAND;
        out.push({
          x: x,
          y: -sy,
          z: sz,
          lit: lit,
          a: gap ? 0.02 : lit ? sz > 0 ? 0.5 + 0.5 * sz : 0.3 : sz > 0 ? 0.16 : 0.07
        });
      }
    }
    return out.sort(function (p, q) {
      return p.z - q.z;
    });
  }
  function lattice(t, n, step) {
    var out = [],
      c = n / 2,
      R = n / 2 - 1.5,
      i,
      j;
    for (j = 1; j < n; j += step) for (i = 1; i < n; i += step) {
      var x = (i + 0.5 - c) / R,
        sy = (j + 0.5 - c) / R,
        rr = x * x + sy * sy;
      if (rr > 1) continue;
      var sz = Math.sqrt(1 - rr),
        y = -sy * CT + sz * ST,
        z = sz * CT + sy * ST;
      var e = edge(Math.atan2(x, z) - t * 0.35, t),
        lit = y > e + BAND,
        gap = Math.abs(y - e) <= BAND;
      out.push({
        x: i,
        y: j,
        lit: lit,
        a: gap ? 0.04 : lit ? 0.2 + 0.8 * sz * sz : 0.12 + 0.3 * sz * sz
      });
    }
    return out;
  }
  function draw(x, size, t, o) {
    o = o || {};
    var c = size / 2,
      R = size * (o.radius || 0.36),
      d = dots(t, o),
      i,
      p;
    if (o.tile) {
      var g = x.createLinearGradient(0, 0, size, size);
      g.addColorStop(0, '#1c222d');
      g.addColorStop(1, '#070a12');
      x.fillStyle = g;
      x.beginPath();
      x.arc(c, c, c, 0, TAU);
      x.fill();
    }
    for (i = 0; i < d.length; i++) {
      p = d[i];
      x.globalAlpha = p.a;
      x.fillStyle = p.lit ? o.fg || '#F0EEE9' : o.dim || '#41B6E7';
      x.beginPath();
      x.arc(c + p.x * R, c + p.y * R, size / 64 * (o.dot || 1.1) * (0.7 + 0.3 * (p.z + 1) / 2), 0, TAU);
      x.fill();
    }
    x.globalAlpha = 1;
  }
  window.nmOrb = {
    dots: dots,
    draw: draw,
    lattice: lattice
  };
})();
(function () {
  if (window.nmFavBusy || window.top !== window.self) return;
  var BUSY_SEL = '[aria-busy="true"], .firing, .picking, #jobs .job:not(.done):not(.err)';
  var ALERT_SEL = '.profile.hasmsg, .profile.haswarn';
  var ALERT_BODY = ['has-sysbad', 'has-freshbad'];
  var BLUE = 'favicon-orb-busy-261019.svg';
  var DANGER = '#e23b2a';
  var PX = 64,
    POLL = 1000;
  var img = null,
    ready = false,
    redPNG = null,
    kept = [],
    cur = '',
    link = null;
  function hit(sel) {
    try {
      if (document.querySelector(sel)) return true;
      var fr = document.getElementsByTagName('iframe'),
        i,
        d;
      for (i = 0; i < fr.length; i++) {
        d = null;
        try {
          d = fr[i].contentDocument;
        } catch (_) {}
        if (d && d.querySelector(sel)) return true;
      }
    } catch (_) {}
    return false;
  }
  function alerting() {
    try {
      for (var i = 0; i < ALERT_BODY.length; i++) if (document.body && document.body.classList.contains(ALERT_BODY[i])) return true;
    } catch (_) {}
    return hit(ALERT_SEL);
  }
  function state() {
    return alerting() ? 'alert' : hit(BUSY_SEL) ? 'busy' : '';
  }
  function red() {
    if (redPNG !== null) return redPNG;
    try {
      var c = document.createElement('canvas');
      c.width = c.height = PX;
      var x = c.getContext('2d');
      x.filter = 'grayscale(1) brightness(1.9)';
      x.drawImage(img, 0, 0, PX, PX);
      x.filter = 'none';
      x.globalCompositeOperation = 'multiply';
      x.fillStyle = DANGER;
      x.fillRect(0, 0, PX, PX);
      x.globalCompositeOperation = 'destination-in';
      x.drawImage(img, 0, 0, PX, PX);
      redPNG = c.toDataURL('image/png');
    } catch (_) {
      redPNG = '';
    }
    return redPNG;
  }
  var orbT = 0,
    orbC = null;
  function orbFrame() {
    try {
      if (!orbC) {
        orbC = document.createElement('canvas');
        orbC.width = orbC.height = PX;
      }
      var x = orbC.getContext('2d');
      x.clearRect(0, 0, PX, PX);
      orbT += 0.9;
      window.nmOrb.draw(x, PX, orbT, {
        tile: true,
        fg: '#41B6E7',
        dim: '#0762C8',
        radius: 0.38,
        dot: 1.5,
        meridians: 16,
        rows: 11
      });
      return orbC.toDataURL('image/png');
    } catch (_) {
      return BLUE;
    }
  }
  function show(st) {
    if (st === cur && st !== 'busy') return;
    var href = st === 'alert' ? red() : st === 'busy' ? orbFrame() : '';
    if (st && !href) st = '';
    if (!st) {
      if (link && link.parentNode) link.parentNode.removeChild(link);
      kept.forEach(function (l) {
        document.head.appendChild(l);
      });
      link = null;
      kept = [];
      cur = '';
      return;
    }
    if (!link) {
      kept = [].slice.call(document.querySelectorAll('link[rel~="icon"]'));
      link = document.createElement('link');
      link.setAttribute('rel', 'icon');
      kept.forEach(function (l) {
        if (l.parentNode) l.parentNode.removeChild(l);
      });
      document.head.appendChild(link);
    }
    var png = href.indexOf('data:image/png') === 0;
    link.setAttribute('type', png ? 'image/png' : 'image/svg+xml');
    if (png) link.setAttribute('sizes', PX + 'x' + PX);else link.removeAttribute('sizes');
    link.setAttribute('href', __nm.u(href));
    cur = st;
  }
  img = new window.Image();
  img.onload = function () {
    ready = true;
  };
  img.src = __nm.u(BLUE);
  window.setInterval(function () {
    if (!ready || document.hidden) return;
    show(state());
  }, POLL);
  window.addEventListener('pagehide', function () {
    show('');
  });
  window.nmFavBusy = {
    state: state,
    cur: function () {
      return cur;
    },
    busy: function () {
      return hit(BUSY_SEL);
    },
    alerting: alerting,
    start: function () {
      show(state() || 'busy');
    },
    stop: function () {
      show('');
    },
    on: function () {
      return !!cur;
    }
  };
})();
}
function nm_gauge_js(window, document, __nm) {
(function () {
  if (window.nmGauge) return;
  const K = 0.32;
  const D = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
  const num = (v, d) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : d;
  };
  const lim = el => {
    const mn = num(el.min, 0),
      mx = num(el.max, 100);
    return [mn, mx > mn ? mx : mn + 1, num(el.step, 1) || 1];
  };
  const frac = el => {
    const [mn, mx] = lim(el);
    return Math.min(1, Math.max(0, (num(D.get.call(el), mn) - mn) / (mx - mn)));
  };
  const signed = el => {
    const v = num(D.get.call(el), 0);
    return el._nmg.hasAttribute('data-bipolar') && v > 0 ? '+' + v : String(v);
  };
  const paint = (el, p) => {
    const w = el._nmg;
    if (!w) return;
    w.style.setProperty('--p', String(p === undefined ? frac(el) : p));
    if (w._v) w._v.textContent = signed(el);
  };
  const fire = (el, t) => el.dispatchEvent(new window.Event(t, {
    bubbles: true
  }));
  const snap = w => {
    w.classList.add('snap');
    window.clearTimeout(w._sn);
    w._sn = window.setTimeout(() => w.classList.remove('snap'), 520);
  };
  const modern = () => document.documentElement.classList.contains('modern-workspace');
  const valueOf = el => Object.defineProperty(el, 'value', {
    configurable: true,
    get() {
      return D.get.call(this);
    },
    set(v) {
      D.set.call(this, v);
      paint(this);
    }
  });
  const shiftStep = (el, w, e) => {
    if (!/^(Arrow|Home|End|Page)/.test(e.key)) return false;
    delete w.dataset.ptr;
    if (e.shiftKey && /^Arrow/.test(e.key)) {
      const [mn, mx, st] = lim(el),
        d = /Right|Up/.test(e.key) ? 1 : -1;
      e.preventDefault();
      D.set.call(el, String(Math.min(mx, Math.max(mn, num(D.get.call(el), mn) + d * st * 10))));
      paint(el);
      fire(el, 'input');
      fire(el, 'change');
    }
    return true;
  };
  const resetDef = el => {
    if (el.dataset.def === undefined || el.disabled) return false;
    D.set.call(el, el.dataset.def);
    paint(el);
    fire(el, 'input');
    fire(el, 'change');
    return true;
  };
  const ROWS = [['.lyopt-row', '.lyopt-k', '.lypv-fs'], ['.csec', '.nm', '.csec-d'], ['.geni-gg', '.geni-gg-name', '.geni-gg-val'], ['.axrow', 'label.fl', '.lenslide > b']];
  const GENI_TINT = {
    sat: 'chroma',
    bri: 'light',
    ct: 'cool magenta',
    sh: 'cool green',
    ew: 'cool warm',
    rr: 'accent warm'
  };
  const TINT = /^(warm|cool|green|magenta|accent|light|chroma)$/;
  const inside = el => {
    for (const [rs, ks, vs] of ROWS) {
      const row = el.closest(rs);
      if (!row || row.querySelectorAll('input[type=range]').length !== 1) continue;
      const k = row.querySelector(ks);
      if (!k || k.contains(el) || k.closest('.nm-scrub')) continue;
      const v = el.id && document.getElementById(el.id + 'V') || row.querySelector(vs);
      return {
        row,
        k,
        v: v && row.contains(v) && !v.contains(el) ? v : null
      };
    }
    return null;
  };
  const tint = (el, w) => {
    const gg = el.closest('.geni-gg[data-ax]');
    const want = el.dataset.scrubTint || gg && GENI_TINT[gg.dataset.ax] || (w.hasAttribute('data-bipolar') ? 'cool warm' : 'light');
    const t = want.trim().split(/\s+/).filter(x => TINT.test(x)).slice(0, 2);
    if (t.length === 2) {
      w.dataset.tint = 'pair';
      w.dataset.tl = t[0];
      w.dataset.tr = t[1];
      return;
    }
    w.dataset.tint = t[0] === 'chroma' ? 'chroma' : !t[0] || t[0] === 'light' ? 'wedge' : 'ramp';
    w.dataset.tr = t[0] || 'light';
  };
  function mountScrub(el) {
    const w = document.createElement('span');
    w.className = 'nm-scrub';
    w.innerHTML = __nm.h('<span class="nm-scrub-clip" aria-hidden="true"><span class="nm-scrub-tick"></span></span><span class="nm-scrub-ring" aria-hidden="true"></span>');
    const tapSet = el.dataset.nmgTap === 'set';
    const row = tapSet ? null : inside(el);
    if (!row) {
      const probe = el.cloneNode(false);
      probe.removeAttribute('id');
      probe.style.display = 'none';
      el.parentNode.insertBefore(probe, el);
      const cs = window.getComputedStyle(probe),
        fixed = cs.flexGrow === '0' && /px$/.test(cs.width) && parseFloat(cs.width) > 0 ? cs.width : '';
      probe.remove();
      if (fixed) w.style.flex = '0 0 ' + fixed;
    }
    el.parentNode.insertBefore(w, el);
    w.insertBefore(el, w.firstChild);
    el.classList.add('nm-scrub-in');
    el._nmg = w;
    const [mn0, mx0] = lim(el);
    if (el.hasAttribute('data-bipolar') || mn0 < 0 && mx0 > 0) w.dataset.bipolar = '';
    tint(el, w);
    if (row) {
      const ring = w.lastChild,
        homes = [row.k.parentElement];
      for (let a = w.parentElement; a && a !== row.row; a = a.parentElement) a.classList.add('nm-scrub-host');
      let v = row.v;
      if (v) homes.push(v.parentElement);else {
        v = document.createElement('span');
        v.setAttribute('aria-hidden', 'true');
        w._v = v;
      }
      row.k.classList.add('nm-scrub-k');
      v.classList.add('nm-scrub-v');
      w.insertBefore(row.k, ring);
      w.insertBefore(v, ring);
      homes.forEach(h => {
        if (h && h !== row.row && !h.contains(w) && !h.children.length && !h.textContent.trim()) h.classList.add('nm-scrub-gone');
      });
      w.dataset.in = '';
    }
    valueOf(el);
    let g = null;
    const at = x => {
      const r = __nm.rect(w),
        [mn, mx, st] = lim(el),
        c = Math.min(1, Math.max(0, (x - r.left) / (r.width || 1)));
      D.set.call(el, String(+Math.min(mx, Math.max(mn, mn + Math.round(c * (mx - mn) / st) * st)).toFixed(6)));
      paint(el);
    };
    const begin = e => {
      g.on = true;
      w.dataset.ptr = '1';
      w.classList.add('drag');
      try {
        w.setPointerCapture(e.pointerId);
      } catch (x) {}
      try {
        el.focus({
          preventScroll: true
        });
      } catch (x) {}
    };
    w.addEventListener('pointerdown', e => {
      if (el.disabled || e.pointerType === 'mouse' && e.button !== 0) return;
      g = {
        x: __nm.cx(e),
        y: __nm.cy(e),
        lx: __nm.cx(e),
        raw: num(D.get.call(el), mn0),
        v0: D.get.call(el),
        on: false,
        far: 0
      };
      if (e.pointerType === 'mouse') {
        e.preventDefault();
        begin(e);
      }
    });
    w.addEventListener('pointermove', e => {
      if (!g) return;
      g.far = Math.max(g.far, Math.abs(__nm.cx(e) - g.x), Math.abs(__nm.cy(e) - g.y));
      if (!g.on) {
        const dx = Math.abs(__nm.cx(e) - g.x);
        if (dx > 4 && dx > Math.abs(__nm.cy(e) - g.y)) begin(e);else return;
      }
      const [mn, mx, st] = lim(el),
        old = D.get.call(el);
      g.raw = Math.min(mx, Math.max(mn, g.raw + (__nm.cx(e) - g.lx) / (w.clientWidth || 1) * (mx - mn) * (e.altKey ? 0.1 : 1)));
      g.lx = __nm.cx(e);
      D.set.call(el, String(+Math.min(mx, Math.max(mn, mn + Math.round((g.raw - mn) / st) * st)).toFixed(6)));
      paint(el);
      if (D.get.call(el) !== old) fire(el, 'input');
    });
    const end = e => {
      if (!g) return;
      const v0 = g.v0,
        tap = tapSet && e.type === 'pointerup' && g.far <= 4;
      let changed = g.on && D.get.call(el) !== v0;
      g = null;
      w.classList.remove('drag');
      if (tap) {
        at(__nm.cx(e));
        changed = D.get.call(el) !== v0;
        if (changed) fire(el, 'input');
      }
      if (changed) fire(el, 'change');
    };
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => w.addEventListener(t, end));
    el.addEventListener('input', () => {
      if (!g || !g.on) paint(el);
    });
    el.addEventListener('keydown', e => shiftStep(el, w, e));
    w.addEventListener('dblclick', () => resetDef(el));
    paint(el);
  }
  function mount(el) {
    if (!el || el._nmg || el.type !== 'range' || !el.parentNode) return el ? el._nmg : undefined;
    if (el.dataset.nmg === 'scrub') {
      if (modern()) mountScrub(el);
      return el._nmg;
    }
    const w = document.createElement('span');
    w.className = 'nm-rbs';
    w.innerHTML = __nm.h('<span class="nm-rbs-track" aria-hidden="true"><span class="nm-rbs-fill"></span></span><span class="nm-rbs-knob" aria-hidden="true"></span>');
    el.parentNode.insertBefore(w, el);
    w.insertBefore(el, w.firstChild);
    el.classList.add('nm-rbs-in');
    el._nmg = w;
    Object.defineProperty(el, 'value', {
      configurable: true,
      get() {
        return D.get.call(this);
      },
      set(v) {
        D.set.call(this, v);
        paint(this);
      }
    });
    let on = false,
      wait = null,
      v0 = null;
    const at = x => {
      const r = __nm.rect(w),
        raw = (x - r.left) / (r.width || 1),
        c = Math.min(1, Math.max(0, raw));
      const [mn, mx, st] = lim(el),
        old = D.get.call(el);
      const v = Math.min(mx, Math.max(mn, mn + Math.round(c * (mx - mn) / st) * st));
      D.set.call(el, String(+v.toFixed(6)));
      w.style.setProperty('--p', String(c + (raw - c) * K));
      if (D.get.call(el) !== old) fire(el, 'input');
    };
    const start = e => {
      on = true;
      wait = null;
      w.dataset.ptr = '1';
      try {
        w.setPointerCapture(e.pointerId);
      } catch (x) {}
      try {
        el.focus({
          preventScroll: true
        });
      } catch (x) {}
      w.classList.remove('snap');
      w.classList.add('drag');
      at(__nm.cx(e));
    };
    w.addEventListener('pointerdown', e => {
      if (el.disabled || e.pointerType === 'mouse' && e.button !== 0) return;
      v0 = D.get.call(el);
      if (e.pointerType === 'mouse') {
        e.preventDefault();
        start(e);
      } else wait = {
        x: __nm.cx(e),
        y: __nm.cy(e)
      };
    });
    w.addEventListener('pointermove', e => {
      if (on) {
        at(__nm.cx(e));
        return;
      }
      if (wait && Math.abs(__nm.cx(e) - wait.x) > 4 && Math.abs(__nm.cx(e) - wait.x) > Math.abs(__nm.cy(e) - wait.y)) start(e);
    });
    const end = () => {
      if (!on) return;
      on = false;
      w.classList.remove('drag');
      snap(w);
      paint(el);
      if (D.get.call(el) !== v0) fire(el, 'change');
    };
    w.addEventListener('pointerup', e => {
      if (wait && !on) {
        start(e);
      }
      wait = null;
      end();
    });
    w.addEventListener('pointercancel', () => {
      wait = null;
      end();
    });
    el.addEventListener('input', () => {
      if (!on) paint(el);
    });
    el.addEventListener('keydown', e => {
      if (!/^(Arrow|Home|End|Page)/.test(e.key)) return;
      delete w.dataset.ptr;
      snap(w);
      if (e.shiftKey && /^Arrow/.test(e.key)) {
        const [mn, mx, st] = lim(el),
          d = /Right|Up/.test(e.key) ? 1 : -1;
        e.preventDefault();
        D.set.call(el, String(Math.min(mx, Math.max(mn, num(D.get.call(el), mn) + d * st * 10))));
        paint(el);
        fire(el, 'input');
        fire(el, 'change');
      }
    });
    w.addEventListener('dblclick', () => {
      if (el.dataset.def === undefined || el.disabled) return;
      D.set.call(el, el.dataset.def);
      snap(w);
      paint(el);
      fire(el, 'input');
      fire(el, 'change');
    });
    paint(el);
    return w;
  }
  function scan(root) {
    const r = root && root.querySelectorAll ? root : document;
    if (r.matches && r.matches('input[type=range][data-nmg]')) mount(r);
    r.querySelectorAll('input[type=range][data-nmg]').forEach(mount);
  }
  window.nmGauge = {
    mount,
    scan,
    paint
  };
  const go = () => {
    scan(document);
    new window.MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType === 1) scan(n);
    }))).observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);else go();
})();
}
function nm_snap_js(window, document, __nm) {
(function () {
  if (window.nmSnap) return;
  const last = new Map();
  const btns = el => [...el.children].filter(b => b.tagName === 'BUTTON');
  const isOn = b => b.classList.contains('on');
  function paint(el) {
    if (!el || !el._nms) return;
    const bs = btns(el),
      i = bs.findIndex(isOn);
    el._nmsBusy = true;
    bs.forEach((b, n) => {
      const on = n === i;
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(on));
      b.removeAttribute('aria-pressed');
      b.tabIndex = on || i < 0 && n === 0 ? 0 : -1;
    });
    el.style.setProperty('--n', String(Math.max(1, bs.length)));
    el.classList.toggle('none', i < 0);
    if (i >= 0) el.style.setProperty('--i', String(i));
    const k = el.dataset.nmsnap;
    if (k) last.set(k, i);
    el._nmsBusy = false;
  }
  function mount(el) {
    if (!el || el._nms || !el.parentNode) return;
    el._nms = true;
    el.classList.add('nm-snap');
    el.setAttribute('role', 'radiogroup');
    const k = el.dataset.nmsnap,
      bs = btns(el),
      i = bs.findIndex(isOn),
      was = k && last.has(k) ? last.get(k) : undefined;
    if (was !== undefined && was >= 0 && i >= 0 && was !== i) {
      el.style.setProperty('--n', String(Math.max(1, bs.length)));
      el.style.setProperty('--i', String(was));
      void el.offsetWidth;
    }
    paint(el);
    new window.MutationObserver(() => {
      if (!el._nmsBusy) paint(el);
    }).observe(el, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'aria-pressed'],
      childList: true
    });
  }
  document.addEventListener('keydown', e => {
    const b = e.target && e.target.closest && e.target.closest('[data-nmsnap] > button');
    if (!b) return;
    const d = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1
    }[e.key];
    if (!d) return;
    const bs = btns(b.parentElement).filter(x => !x.disabled);
    if (bs.length < 2) return;
    const nb = bs[(bs.indexOf(b) + d + bs.length) % bs.length];
    const k = b.parentElement.dataset.nmsnap,
      v = [...nb.parentElement.children].indexOf(nb);
    e.preventDefault();
    nb.click();
    if (nb.isConnected) {
      nb.focus();
      return;
    }
    const r = k ? document.querySelector('[data-nmsnap="' + window.CSS.escape(k) + '"]') : null;
    const t = r && r.children[v];
    if (t && t.tagName === 'BUTTON') t.focus();else window.requestAnimationFrame(() => {
      const r2 = k && document.querySelector('[data-nmsnap="' + window.CSS.escape(k) + '"]');
      const t2 = r2 && r2.children[v];
      if (t2) t2.focus();
    });
  });
  function scan(root) {
    const r = root && root.querySelectorAll ? root : document;
    if (r.matches && r.matches('[data-nmsnap]')) mount(r);
    r.querySelectorAll('[data-nmsnap]').forEach(mount);
  }
  window.nmSnap = {
    mount,
    scan,
    paint
  };
  const go = () => {
    scan(document);
    new window.MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType === 1) scan(n);
    }))).observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);else go();
})();
}
function nm_alpha_js(window, document, __nm) {
(function () {
  if (window.nmAlpha) return;
  const VS = 'attribute vec2 p;varying vec2 t;void main(){t=vec2((p.x+1.)*.5,(1.-p.y)*.5);gl_Position=vec4(p,0.,1.);}';
  const FS = '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\nuniform sampler2D s;uniform float h;varying vec2 t;' + 'void main(){vec3 c=texture2D(s,vec2(t.x,min(t.y*.5,.5-h))).rgb;float a=texture2D(s,vec2(t.x,max(.5+t.y*.5,.5+h))).g;' + 'a=clamp((a-.02)/.96,0.,1.);gl_FragColor=vec4(c*a,a);}';
  const PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  function gl0(cv) {
    let g = null;
    try {
      g = cv.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false
      }) || cv.getContext('experimental-webgl');
    } catch (e) {
      g = null;
    }
    if (!g) return null;
    const sh = (type, src) => {
      const s = g.createShader(type);
      g.shaderSource(s, src);
      g.compileShader(s);
      return g.getShaderParameter(s, g.COMPILE_STATUS) ? s : null;
    };
    const vs = sh(g.VERTEX_SHADER, VS),
      fs = sh(g.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return null;
    const pr = g.createProgram();
    g.attachShader(pr, vs);
    g.attachShader(pr, fs);
    g.linkProgram(pr);
    if (!g.getProgramParameter(pr, g.LINK_STATUS)) return null;
    g.useProgram(pr);
    const b = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, b);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(pr, 'p');
    g.enableVertexAttribArray(loc);
    g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const tx = g.createTexture();
    g.bindTexture(g.TEXTURE_2D, tx);
    [[g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE], [g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE], [g.TEXTURE_MIN_FILTER, g.LINEAR], [g.TEXTURE_MAG_FILTER, g.LINEAR]].forEach(([k, v]) => g.texParameteri(g.TEXTURE_2D, k, v));
    g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    g.clearColor(0, 0, 0, 0);
    return {
      g,
      uh: g.getUniformLocation(pr, 'h')
    };
  }
  function destroy(st) {
    if (!st || st.dead) return;
    st.dead = true;
    const orig = st.orig;
    if (orig._nma === st) {
      orig._nma = null;
      orig.style.display = st.disp;
    }
    try {
      st.mo.disconnect();
      st.mo2.disconnect();
    } catch (e) {}
    try {
      st.v.pause();
      st.v.removeAttribute('src');
      st.v.load();
    } catch (e) {}
    try {
      const x = st.g.getExtension('WEBGL_lose_context');
      if (x) x.loseContext();
    } catch (e) {}
    if (st.box.parentNode) st.box.parentNode.removeChild(st.box);
  }
  function unmount(orig) {
    if (orig && orig._nma) destroy(orig._nma);
  }
  function mount(orig, src, o) {
    if (!orig || !src || !orig.parentNode) return false;
    if (orig._nma && orig._nma.src === src && orig._nma.box.isConnected) return true;
    unmount(orig);
    const cv = document.createElement('canvas');
    const ctx = gl0(cv);
    if (!ctx) return false;
    const {
      g,
      uh
    } = ctx;
    const w0 = (o && +o.w) | 0,
      h0 = (o && +o.h) | 0;
    if (w0 > 1 && h0 > 1) {
      cv.width = w0;
      cv.height = h0;
    }
    const box = document.createElement('div');
    box.className = 'nm-alpha';
    box.innerHTML = __nm.h('<button type="button" class="monplay" aria-label="재생 — 탭=재생/일시정지">' + PLAY + '</button>' + '<div class="monseek" role="slider" tabindex="0" aria-label="진행 위치 — 탭·드래그=이동 · 스페이스=재생/일시정지" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>');
    box.insertBefore(cv, box.firstChild);
    const v = document.createElement('video');
    v.setAttribute('playsinline', '');
    v.playsInline = true;
    v.preload = 'auto';
    v.setAttribute('aria-hidden', 'true');
    v.tabIndex = -1;
    box.appendChild(v);
    const pb = box.querySelector('.monplay'),
      sk = box.querySelector('.monseek'),
      fill = sk.querySelector('i');
    const st = {
      src,
      orig,
      box,
      v,
      g,
      disp: orig.style.display,
      mo: null,
      mo2: null,
      dead: false,
      looping: false,
      priming: false
    };
    const alive = () => !st.dead && orig._nma === st;
    const fail = () => destroy(st);
    const draw = () => {
      if (!alive() || v.readyState < 2) return;
      if (!box.isConnected) {
        destroy(st);
        return;
      }
      const vw = v.videoWidth | 0,
        vh = v.videoHeight / 2 | 0;
      if (vw < 2 || vh < 2) return;
      if (cv.width !== vw || cv.height !== vh) {
        cv.width = vw;
        cv.height = vh;
      }
      try {
        g.viewport(0, 0, vw, vh);
        g.texImage2D(g.TEXTURE_2D, 0, g.RGB, g.RGB, g.UNSIGNED_BYTE, v);
        g.uniform1f(uh, 0.5 / v.videoHeight);
        g.clear(g.COLOR_BUFFER_BIT);
        g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
      } catch (e) {
        fail();
      }
    };
    const loop = () => {
      if (!alive() || v.paused || v.ended) {
        st.looping = false;
        draw();
        return;
      }
      draw();
      if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(loop);else window.requestAnimationFrame(loop);
    };
    cv.addEventListener('webglcontextlost', e => {
      e.preventDefault();
      fail();
    });
    v.addEventListener('error', fail);
    v.addEventListener('loadeddata', draw);
    v.addEventListener('seeked', () => {
      draw();
      if (v.paused && v.requestVideoFrameCallback) v.requestVideoFrameCallback(() => draw());
    });
    v.addEventListener('play', () => {
      if (!alive()) return;
      pb.hidden = true;
      if (!st.looping) {
        st.looping = true;
        loop();
      }
    });
    v.addEventListener('pause', () => {
      if (!alive()) return;
      pb.hidden = false;
      draw();
    });
    v.addEventListener('ended', () => {
      if (alive()) pb.hidden = false;
    });
    v.addEventListener('timeupdate', () => {
      if (!alive()) return;
      if (!box.isConnected) {
        destroy(st);
        return;
      }
      if (!v.duration) return;
      const p = v.currentTime / v.duration * 100;
      fill.style.width = p + '%';
      sk.setAttribute('aria-valuenow', String(Math.round(p)));
    });
    const toggle = () => {
      if (!alive()) return;
      if (st.priming) {
        st.priming = false;
        v.muted = false;
        if (v.paused) {
          const p = v.play();
          if (p && p.catch) p.catch(() => {});
        }
        return;
      }
      if (v.paused || v.ended) {
        v.muted = false;
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      } else v.pause();
    };
    cv.addEventListener('click', toggle);
    pb.addEventListener('click', toggle);
    const seek = p => {
      if (v.duration) {
        v.currentTime = Math.min(1, Math.max(0, p)) * v.duration;
      }
    };
    sk.onpointerdown = ev => {
      ev.stopPropagation();
      const at = e2 => {
        const r = __nm.rect(sk);
        seek((__nm.cx(e2) - r.left) / r.width);
      };
      at(ev);
      try {
        sk.setPointerCapture(ev.pointerId);
      } catch (e) {}
      sk.onpointermove = at;
      sk.onpointerup = () => {
        sk.onpointermove = null;
        sk.onpointerup = null;
      };
    };
    sk.onkeydown = ev => {
      if (ev.key === ' ' || ev.key === 'k') {
        ev.preventDefault();
        toggle();
        return;
      }
      if (!v.duration) return;
      if (ev.key === 'ArrowRight') {
        ev.preventDefault();
        seek(v.currentTime / v.duration + .05);
      } else if (ev.key === 'ArrowLeft') {
        ev.preventDefault();
        seek(v.currentTime / v.duration - .05);
      }
    };
    st.mo = new window.MutationObserver(() => {
      if (alive() && orig.hidden) destroy(st);
    });
    st.mo.observe(orig, {
      attributes: true,
      attributeFilter: ['hidden']
    });
    st.mo2 = new window.MutationObserver(() => {
      if (alive() && !box.isConnected) destroy(st);
    });
    st.mo2.observe(orig.parentNode, {
      childList: true
    });
    orig._nma = st;
    try {
      orig.pause();
    } catch (e) {}
    orig.style.display = 'none';
    orig.parentNode.insertBefore(box, orig.nextSibling);
    v.src = __nm.u(src);
    v.muted = true;
    st.priming = true;
    const pr = v.play();
    if (pr && pr.then) pr.then(() => {
      if (alive() && st.priming) {
        st.priming = false;
        v.pause();
        try {
          v.currentTime = 0;
        } catch (e) {}
        v.muted = false;
      }
    }).catch(() => {
      st.priming = false;
      v.muted = false;
    });else {
      st.priming = false;
      v.muted = false;
    }
    return true;
  }
  window.nmAlpha = {
    mount,
    unmount
  };
})();
}
function upload_js(window, document, __nm) {
(function () {
  let armed = null;
  function authWhy() {
    let p;
    try {
      p = window.nmSync && typeof window.nmSync.probeNow === 'function' ? Promise.resolve(window.nmSync.probeNow()) : window.fetch('/nm-sync.js?_=' + Date.now(), {
        method: 'HEAD',
        redirect: 'manual',
        cache: 'no-store'
      }).then(r => r.type === 'opaqueredirect' || r.status === 401 || r.status === 403 || r.status >= 300 && r.status < 400 ? 'auth' : r.ok ? 'ok' : 'srv');
    } catch (e) {
      return Promise.resolve('net');
    }
    return Promise.race([p.then(k => k || 'net', () => 'net'), new Promise(r => window.setTimeout(() => r('net'), 3000))]);
  }
  window.nmUpArm = async function () {
    if (armed !== null) return armed;
    window.nmUpArm.why = '';
    try {
      const r = await window.fetch('api/upload', typeof window.AbortSignal !== 'undefined' && window.AbortSignal.timeout ? {
        signal: window.AbortSignal.timeout(4000)
      } : undefined);
      const j = await r.json();
      armed = !!(r.ok && j.ok);
      window.nmUpArm.why = armed ? '' : 'off';
      return armed;
    } catch (e) {
      const w = await authWhy();
      if (armed === null) window.nmUpArm.why = w;
      return false;
    }
  };
  window.nmUpWhyMsg = function (short) {
    const w = window.nmUpArm && window.nmUpArm.why;
    if (w === 'auth') return short ? '로그인 만료' : '로그인이 만료됐어 — 새로고침해서 다시 로그인해줘';
    if (w === 'net') return short ? '연결 끊김' : '연결이 끊겨 대용량 업로드 준비 실패 — 연결 확인 후 다시 해줘';
    if (w === 'srv' || w === 'ok') return short ? '업로드 준비 실패' : '대용량 업로드 준비 실패 — 잠시 뒤 다시 해줘';
    return '';
  };
  const USED = new Set();
  window.nmUpUsed = function (key) {
    if (key) USED.add(key);
  };
  window.nmUpDrop = function (key) {
    if (!key || USED.has(key)) return;
    try {
      window.fetch('api/upload', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          action: 'delete',
          key
        })
      });
    } catch (e) {}
  };
  function putPart(url, blob, onLoaded) {
    return new Promise((res, rej) => {
      const x = new window.XMLHttpRequest();
      x.open('PUT', url);
      x.timeout = 180000;
      x.upload.onprogress = e => {
        if (e.lengthComputable && onLoaded) onLoaded(e.loaded);
      };
      x.onload = () => {
        try {
          const j = JSON.parse(x.responseText || '{}');
          x.status === 200 && j.etag ? res(j) : rej(new Error(j.error || 'HTTP ' + x.status));
        } catch (e) {
          rej(new Error('HTTP ' + x.status));
        }
      };
      x.onerror = () => rej(new Error('네트워크 오류'));
      x.ontimeout = () => rej(new Error('조각 시간 초과'));
      x.send(blob);
    });
  }
  window.nmUpload = async function (f, onPct) {
    const r0 = await window.fetch('api/upload', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        action: 'create',
        name: f.name,
        size: f.size
      })
    });
    const c = await r0.json();
    if (!r0.ok || !c.key) throw new Error(c.error || '업로드 시작 실패');
    const part = c.part || 33554432,
      total = f.size,
      parts = [];
    let done = 0;
    const pct = extra => {
      if (onPct) onPct(Math.min(99, Math.round((done + (extra || 0)) / total * 100)));
    };
    try {
      for (let i = 0, n = 1; i < total; i += part, n++) {
        const blob = f.slice(i, Math.min(i + part, total));
        let p = null,
          err = null;
        for (let t = 0; t < 2; t++) {
          try {
            p = await putPart('api/upload?key=' + encodeURIComponent(c.key) + '&uploadId=' + encodeURIComponent(c.uploadId) + '&n=' + n, blob, pct);
            err = null;
            break;
          } catch (e) {
            err = e;
          }
        }
        if (err) throw err;
        parts.push({
          n,
          etag: p.etag
        });
        done += blob.size;
        pct(0);
      }
      const r2 = await window.fetch('api/upload', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          action: 'complete',
          key: c.key,
          uploadId: c.uploadId,
          parts
        })
      });
      const j2 = await r2.json();
      if (!r2.ok || !j2.ok) throw new Error(j2.error || '업로드 마무리 실패');
      if (onPct) onPct(100);
      return {
        key: c.key,
        size: j2.size
      };
    } catch (e) {
      try {
        window.fetch('api/upload', {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            action: 'abort',
            key: c.key,
            uploadId: c.uploadId
          })
        });
      } catch (e2) {}
      throw e;
    }
  };
})();
}
function cscroll_js(window, document, __nm) {
(function () {
  if (window.__cscroll) return;
  window.__cscroll = 1;
  var doc = document,
    root = doc.documentElement;
  var st = doc.createElement('style');
  st.textContent = 'html{scrollbar-width:none;-ms-overflow-style:none;}' + 'html::-webkit-scrollbar,body::-webkit-scrollbar{width:0!important;height:0!important;display:none!important;}' + '.cscroll{position:fixed;top:0;right:2px;width:10px;height:100%;z-index:99999;pointer-events:none;opacity:0;transition:opacity .3s;}' + '.cscroll.on{opacity:1;}' + '.cscroll i{position:absolute;right:2px;top:0;width:4px;min-height:24px;border-radius:999px;' + 'background:#23252b;' + 'transition:background .25s,width .15s;will-change:transform;}' + '.cscroll.act i{background:#3a3d44;width:5px;}' + '.cscroll.cscroll-el{position:absolute;}' + '.cscroll-host{scrollbar-width:none;-ms-overflow-style:none;}' + '.cscroll-host::-webkit-scrollbar{width:0!important;height:0!important;display:none!important;}' + '@media (prefers-reduced-motion:reduce){.cscroll{transition:none;}}';
  (doc.head || root).appendChild(st);
  var bar = doc.createElement('div');
  bar.className = 'cscroll';
  var thumb = doc.createElement('i');
  bar.appendChild(thumb);
  function update() {
    var sh = root.scrollHeight,
      ch = window.innerHeight || root.clientHeight,
      sp = window.scrollY != null ? window.scrollY : root.scrollTop;
    if (sh <= ch + 2) {
      bar.classList.remove('on');
      return;
    }
    bar.classList.add('on');
    var th = Math.max(24, Math.min(64, ch * ch / sh));
    var top = sp / (sh - ch) * (ch - th);
    thumb.style.height = th + 'px';
    thumb.style.transform = 'translateY(' + Math.round(top) + 'px)';
  }
  var actT;
  function onScroll() {
    update();
    bar.classList.add('act');
    window.clearTimeout(actT);
    actT = window.setTimeout(function () {
      bar.classList.remove('act');
    }, 700);
  }
  function mount() {
    (doc.body || root).appendChild(bar);
    update();
  }
  if (doc.body) mount();else doc.addEventListener('DOMContentLoaded', mount);
  window.addEventListener('scroll', onScroll, {
    passive: true
  });
  window.addEventListener('resize', update);
  window.addEventListener('load', update);
  var _mq = 0;
  function _updQ() {
    if (_mq) return;
    _mq = window.requestAnimationFrame(function () {
      _mq = 0;
      update();
    });
  }
  try {
    new window.MutationObserver(_updQ).observe(root, {
      childList: true,
      subtree: true,
      characterData: true
    });
  } catch (e) {}
  window.setTimeout(update, 250);
  window.setTimeout(update, 800);
  window.cscrollAttach = function (el) {
    if (!el || el.__cscrollEl) return;
    el.__cscrollEl = 1;
    el.classList.add('cscroll-host');
    var b = doc.createElement('div');
    b.className = 'cscroll cscroll-el';
    var t = doc.createElement('i');
    b.appendChild(t);
    function upd() {
      var host = el.closest('.genihost') || el.closest('dialog') || el.parentElement;
      if (!host) return;
      if (b.parentNode !== host) host.appendChild(b);
      var sh = el.scrollHeight,
        ch = el.clientHeight,
        sp = el.scrollTop;
      if (!el.offsetParent || sh <= ch + 2) {
        b.classList.remove('on');
        return;
      }
      var er = __nm.rect(el),
        hr = __nm.rect(host);
      b.style.top = Math.round(er.top - hr.top) + 'px';
      b.style.height = Math.round(er.height) + 'px';
      b.classList.add('on');
      var th = Math.max(24, Math.min(64, ch * ch / sh));
      t.style.height = th + 'px';
      t.style.transform = 'translateY(' + Math.round(sp / (sh - ch) * (ch - th)) + 'px)';
    }
    var aT;
    el.addEventListener('scroll', function () {
      upd();
      b.classList.add('act');
      window.clearTimeout(aT);
      aT = window.setTimeout(function () {
        b.classList.remove('act');
      }, 700);
    }, {
      passive: true
    });
    window.addEventListener('resize', upd);
    doc.addEventListener('click', function () {
      window.setTimeout(upd, 60);
    }, true);
    try {
      new window.MutationObserver(upd).observe(el, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true
      });
    } catch (e) {}
    upd();
    window.setTimeout(upd, 250);
    window.setTimeout(upd, 800);
  };
})();
}
function nm_models_js(window, document, __nm) {
window.NM_MODELS = {
  fable: 'Opus 5.5',
  opus: 'Opus 5.5',
  gpt: 'GPT 6 Astra',
  kling: 'Kling 3.0 Omni',
  kling4: 'Kling 4.0',
  veo: 'Veo 3.1',
  seedance: 'Seedance 2.0',
  seedance_2_5: 'Seedance 2.5',
  seedance_2_0: 'Seedance 2.0',
  grok: 'Grok',
  motion: '모션그래픽',
  gemini: 'Gemini 3.1 Flash',
  gpt_image: 'GPT Image 2.0',
  suno: 'Suno',
  lyria: 'Lyria 3'
};
}
function nm_styles_js(window, document, __nm) {
__nm.ex({"GENI_SUB":[()=>GENI_SUB],"GENI_STYLE_MAIN":[()=>GENI_STYLE_MAIN],"GENI_STYLE_ETC":[()=>GENI_STYLE_ETC],"GENI_ALL_STYLES":[()=>GENI_ALL_STYLES]});
const GENI_SUB = {
  photo: [['auto', '기본'], ['film', '필름'], ['bw', '흑백'], ['cinedoc', '시네다큐'], ['newsreel', '뉴스릴']],
  webtoon: [['auto', '기본'], ['gekiga', '게키카'], ['hardboiled', '하드보일드'], ['jidai', '시대극'], ['sunjung', '순정'], ['chibi', '명랑']],
  cartoon: [['auto', '기본'], ['brush', '붓선'], ['flat', '플랫'], ['woodcut', '판화']],
  watercolor: [['auto', '기본'], ['bleed', '번짐'], ['fine', '세밀'], ['sumuk', '수묵'], ['gouache', '과슈'], ['oil', '유화']],
  cinematic: [['auto', '기본'], ['noir', '누아르'], ['neon', '네온'], ['film35', '35mm'], ['expressionism', '표현주의']],
  illust: [['auto', '기본'], ['riso', '리소'], ['paper', '페이퍼'], ['anime', '애니'], ['retro80', '레트로80']],
  iso3d: [['auto', '기본'], ['clay', '클레이'], ['lowpoly', '로우폴리'], ['diorama', '디오라마']],
  pictogram: [['auto', '기본'], ['line', '라인'], ['blueprint', '청사진']]
};
const GENI_STYLE_MAIN = [['webtoon', '극화'], ['watercolor', '수채'], ['photo', '실사']];
const GENI_STYLE_ETC = [['cartoon', '만평'], ['cinematic', '시네마틱'], ['illust', '일러스트'], ['iso3d', '3D'], ['pictogram', '픽토'], ['lego', '레고']];
const GENI_ALL_STYLES = [...GENI_STYLE_MAIN, ...GENI_STYLE_ETC];
window.GENI_SUB = GENI_SUB;
window.GENI_STYLE_MAIN = GENI_STYLE_MAIN;
window.GENI_STYLE_ETC = GENI_STYLE_ETC;
window.GENI_ALL_STYLES = GENI_ALL_STYLES;
}
function draft_js(window, document, __nm) {
(function (g) {
  'use strict';

  var MS = 30 * 60e3;
  g.NM_DRAFT_MS = MS;
  g.nmDraftSave = function (key, val) {
    try {
      var s = JSON.stringify(val),
        prev = null;
      try {
        prev = JSON.parse(window.localStorage.getItem(key) || 'null');
      } catch (e2) {
        prev = null;
      }
      var ts = prev && typeof prev === 'object' && prev.ts && JSON.stringify(prev.v) === s ? prev.ts : Date.now();
      window.localStorage.setItem(key, JSON.stringify({
        v: val,
        ts: ts
      }));
    } catch (e) {}
  };
  g.nmDraftLoad = function (key) {
    var d = null;
    try {
      d = JSON.parse(window.localStorage.getItem(key) || 'null');
    } catch (e) {
      d = null;
    }
    if (!d || typeof d !== 'object' || !(Date.now() - (d.ts || 0) <= MS)) {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {}
      return null;
    }
    return d.v;
  };
})(window);
}
function master_js(window, document, __nm) {
(function (g) {
  'use strict';
  const NM_MA = {
    TARGET_LUFS: -14,
    TARGET_TRUE_PEAK: -1,
    HIGHPASS_FREQ: 20,
    MUD_CUT_FREQ: 250,
    MUD_CUT_Q: 1.5,
    MUD_CUT_GAIN: -3,
    HARSH_1: 4000,
    HARSH_2: 6000,
    HARSH_Q: 4,
    HARSH_GAIN: -2,
    AIR_FREQ: 10000,
    AIR_GAIN: 2.5,
    BASS_MONO_FREQ: 120,
    GLUE_THRESHOLD: -18,
    GLUE_RATIO: 3,
    GLUE_ATTACK: 0.02,
    GLUE_RELEASE: 0.25,
    LIMITER_RATIO: 20,
    LIMITER_ATTACK: 0.001,
    LIMITER_RELEASE: 0.05
  };
  const BANDS = [{
    f: 62,
    type: 'lowshelf'
  }, {
    f: 110,
    type: 'peaking',
    q: 1.40
  }, {
    f: 250,
    type: 'peaking',
    q: 1.60
  }, {
    f: 370,
    type: 'peaking',
    q: 2.05
  }, {
    f: 650,
    type: 'peaking',
    q: 1.65
  }, {
    f: 1200,
    type: 'peaking',
    q: 1.65
  }, {
    f: 2130,
    type: 'peaking',
    q: 1.45
  }, {
    f: 4550,
    type: 'peaking',
    q: 1.70
  }, {
    f: 6850,
    type: 'peaking',
    q: 1.55
  }, {
    f: 16000,
    type: 'highshelf'
  }];
  const NB = BANDS.length;
  const bandAt = f => {
    let bi = 0,
      best = Infinity;
    BANDS.forEach((b, i) => {
      const d = Math.abs(Math.log2(b.f / f));
      if (d < best) {
        best = d;
        bi = i;
      }
    });
    return bi;
  };
  const MACRO = {
    clarity: {
      eq: {
        4550: 0.8,
        6850: 0.7,
        16000: 0.6,
        250: -0.5,
        370: -0.3
      }
    },
    bass: {
      eq: {
        62: 1.2,
        110: 0.8,
        250: -0.25
      },
      on: {
        3: ['centerBass'],
        4: ['cleanLowEnd']
      }
    },
    space: {
      eq: {
        16000: 0.3
      },
      width: 12,
      on: {
        3: ['centerBass']
      }
    },
    punch: {
      comp: true
    },
    smooth: {
      eq: {
        4550: -0.5,
        6850: -0.4
      }
    }
  };
  const MACRO_KEYS = Object.keys(MACRO);
  const PUNCH = [null, {
    t: -14,
    r: 2.0,
    a: 0.03,
    rel: 0.40
  }, {
    t: -16,
    r: 2.5,
    a: 0.025,
    rel: 0.32
  }, {
    t: -18,
    r: 3.0,
    a: 0.02,
    rel: 0.25
  }, {
    t: -20,
    r: 3.5,
    a: 0.01,
    rel: 0.20
  }, {
    t: -22,
    r: 4.0,
    a: 0.005,
    rel: 0.15
  }];
  const DEF = {
    gainDb: 0,
    targetLufs: -14,
    ceilingDb: -1,
    width: 100,
    normalize: true,
    limit: true,
    cleanLowEnd: true,
    centerBass: false,
    glue: false,
    cutMud: false,
    addAir: false,
    tameHarsh: false,
    sampleRate: 44100,
    bitDepth: 16,
    eqBands: new Array(NB).fill(0),
    clarity: 0,
    bass: 0,
    space: 0,
    punch: 0,
    smooth: 0
  };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, Number(v) || 0));
  function nmMaSettings(o) {
    const s = Object.assign({}, DEF, o || {});
    s.gainDb = clamp(s.gainDb, -12, 12);
    s.targetLufs = clamp(s.targetLufs, -20, -6);
    s.ceilingDb = clamp(s.ceilingDb, -3, 0);
    s.width = clamp(s.width, 0, 200);
    if (![44100, 48000].includes(+s.sampleRate)) s.sampleRate = 44100;
    if (![16, 24].includes(+s.bitDepth)) s.bitDepth = 16;
    const base = new Array(NB).fill(0);
    (Array.isArray(s.eqBands) ? s.eqBands : []).forEach((v, i) => {
      if (i < NB) base[i] = clamp(v, -12, 12);
    });
    const LEG = {
      eqLow: 200,
      eqLowMid: 500,
      eqMid: 2000,
      eqHighMid: 5000,
      eqHigh: 12000
    };
    for (const k in LEG) if (o && o[k]) base[bandAt(LEG[k])] += clamp(o[k], -12, 12);
    const add = new Array(NB).fill(0);
    MACRO_KEYS.forEach(k => {
      const v = clamp(s[k], 0, 5);
      s[k] = v;
      if (!v) return;
      const m = MACRO[k];
      if (m.eq) for (const f in m.eq) add[bandAt(+f)] += m.eq[f] * v;
      if (m.width) s.width = clamp(s.width + m.width * v, 0, 200);
      if (m.on) for (const step in m.on) if (v >= +step) m.on[step].forEach(t => {
        s[t] = true;
      });
      if (m.comp) {
        const p = PUNCH[v];
        if (p) {
          s.glue = true;
          s._punch = p;
        }
      }
    });
    s.eqBands = base.map((v, i) => clamp(v + add[i], -12, 12));
    s._macroOn = MACRO_KEYS.some(k => s[k] > 0);
    const gmax = Math.max(0, ...s.eqBands);
    s._trimDb = Math.max(-9, -Math.max(0, gmax - 3));
    return s;
  }
  const K_COEFFS = {
    48000: {
      hs: {
        b: [1.53512485958697, -2.69169618940638, 1.19839281085285],
        a: [1, -1.69065929318241, 0.73248077421585]
      },
      hp: {
        b: [1.0, -2.0, 1.0],
        a: [1, -1.99004745483398, 0.99007225036621]
      }
    },
    44100: {
      hs: {
        b: [1.53512485958697, -2.69169618940638, 1.19839281085285],
        a: [1, -1.69065929318241, 0.73248077421585]
      },
      hp: {
        b: [1.0, -2.0, 1.0],
        a: [1, -1.98916108609994, 0.98919185728498]
      }
    }
  };
  function biquad(samples, b, a) {
    const out = new Float32Array(samples.length);
    let x1 = 0,
      x2 = 0,
      y1 = 0,
      y2 = 0;
    for (let i = 0; i < samples.length; i++) {
      const x0 = samples[i];
      const y0 = (b[0] * x0 + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2) / a[0];
      out[i] = y0;
      x2 = x1;
      x1 = x0;
      y2 = y1;
      y1 = y0;
    }
    return out;
  }
  function kWeight(samples, sr) {
    const c = K_COEFFS[sr] || K_COEFFS[48000];
    return biquad(biquad(samples, c.hs.b, c.hs.a), c.hp.b, c.hp.a);
  }
  function meanSquare(s, from, to) {
    let sum = 0;
    for (let i = from; i < to; i++) sum += s[i] * s[i];
    return sum / (to - from);
  }
  function nmMeasureLUFS(buf) {
    const sr = buf.sampleRate,
      nch = buf.numberOfChannels,
      len = buf.length;
    const blockSize = Math.floor(sr * 0.4),
      hop = Math.floor(sr * 0.1);
    const kw = [];
    for (let ch = 0; ch < nch; ch++) kw.push(kWeight(buf.getChannelData(ch), sr));
    const blocks = [];
    for (let st = 0; st + blockSize <= len; st += hop) {
      let sq = 0;
      for (let ch = 0; ch < nch; ch++) sq += 1.0 * meanSquare(kw[ch], st, st + blockSize);
      const l = -0.691 + 10 * Math.log10(sq);
      if (isFinite(l)) blocks.push(l);
    }
    const empty = {
      integratedLUFS: -Infinity,
      truePeak: 0,
      truePeakDB: -Infinity
    };
    if (!blocks.length) return empty;
    const aboveAbs = blocks.filter(l => l > -70);
    if (!aboveAbs.length) return empty;
    const avgAbs = aboveAbs.reduce((a, b) => a + b, 0) / aboveAbs.length;
    const relThr = avgAbs - 10;
    const gated = blocks.filter(l => l > relThr);
    let integratedLUFS = -Infinity;
    if (gated.length) {
      const lin = gated.reduce((s, l) => s + Math.pow(10, (l + 0.691) / 10), 0) / gated.length;
      integratedLUFS = -0.691 + 10 * Math.log10(lin);
    }
    let peak = 0;
    for (let ch = 0; ch < nch; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < d.length; i++) {
        const a = Math.abs(d[i]);
        if (a > peak) peak = a;
      }
    }
    return {
      integratedLUFS,
      truePeak: peak,
      truePeakDB: peak > 0 ? 20 * Math.log10(peak) : -Infinity
    };
  }
  function nmNormGain(curLufs, targetLufs) {
    if (!isFinite(curLufs) || curLufs < -70) return 1.0;
    return Math.pow(10, ((targetLufs == null ? -14 : targetLufs) - curLufs) / 20);
  }
  function nmTruePeak(buf) {
    let peak = 0;
    for (let ch = 0; ch < buf.numberOfChannels; ch++) {
      const d = buf.getChannelData(ch),
        n = d.length;
      for (let i = 0; i < n; i++) {
        const a = d[i],
          b = i + 1 < n ? d[i + 1] : a,
          s = b - a;
        const m = Math.max(Math.abs(a), Math.abs(a + s * 0.25), Math.abs(a + s * 0.5), Math.abs(a + s * 0.75));
        if (m > peak) peak = m;
      }
    }
    return peak;
  }
  function nmTruePeakClip(buf, ceilingDb) {
    const ceil = Math.pow(10, ceilingDb / 20);
    const peak = nmTruePeak(buf);
    if (peak <= ceil || peak === 0) return peak;
    const k = ceil / peak;
    for (let ch = 0; ch < buf.numberOfChannels; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < d.length; i++) d[i] *= k;
    }
    return nmTruePeak(buf);
  }
  function buildChain(ctx, src, s) {
    let node = src;
    const link = n => {
      node.connect(n);
      node = n;
    };
    const g0 = ctx.createGain();
    g0.gain.value = Math.pow(10, s.gainDb / 20);
    link(g0);
    if (s.cleanLowEnd) {
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = NM_MA.HIGHPASS_FREQ;
      hp.Q.value = 0.7;
      link(hp);
    }
    const eq = (type, f, gain, q) => {
      if (!gain) return;
      const n = ctx.createBiquadFilter();
      n.type = type;
      n.frequency.value = f;
      n.gain.value = gain;
      if (q != null) n.Q.value = q;
      link(n);
    };
    BANDS.forEach((b, i) => eq(b.type, b.f, s.eqBands[i], b.q));
    if (s.cutMud) eq('peaking', NM_MA.MUD_CUT_FREQ, NM_MA.MUD_CUT_GAIN, NM_MA.MUD_CUT_Q);
    if (s.tameHarsh) {
      eq('peaking', NM_MA.HARSH_1, NM_MA.HARSH_GAIN, NM_MA.HARSH_Q);
      eq('peaking', NM_MA.HARSH_2, NM_MA.HARSH_GAIN, NM_MA.HARSH_Q);
    }
    if (s.addAir) eq('highshelf', NM_MA.AIR_FREQ, NM_MA.AIR_GAIN);
    if (s._trimDb) {
      const t = ctx.createGain();
      t.gain.value = Math.pow(10, s._trimDb / 20);
      link(t);
    }
    if (s.glue) {
      const p = s._punch || {
        t: NM_MA.GLUE_THRESHOLD,
        r: NM_MA.GLUE_RATIO,
        a: NM_MA.GLUE_ATTACK,
        rel: NM_MA.GLUE_RELEASE
      };
      const c = ctx.createDynamicsCompressor();
      c.threshold.value = p.t;
      c.ratio.value = p.r;
      c.knee.value = 6;
      c.attack.value = p.a;
      c.release.value = p.rel;
      link(c);
    }
    const needMS = (s.width !== 100 || s.centerBass) && ctx.destination.channelCount >= 2 && src.buffer && src.buffer.numberOfChannels > 1;
    if (needMS) {
      const sp = ctx.createChannelSplitter(2),
        mg = ctx.createChannelMerger(2);
      node.connect(sp);
      const mid = ctx.createGain(),
        side = ctx.createGain();
      mid.gain.value = 1;
      side.gain.value = s.width / 100;
      const half = v => {
        const n = ctx.createGain();
        n.gain.value = v;
        return n;
      };
      const mL = half(0.5),
        mR = half(0.5),
        sL = half(0.5),
        sR = half(-0.5);
      sp.connect(mL, 0);
      sp.connect(mR, 1);
      mL.connect(mid);
      mR.connect(mid);
      sp.connect(sL, 0);
      sp.connect(sR, 1);
      sL.connect(side);
      sR.connect(side);
      let sideOut = side;
      if (s.centerBass) {
        const shp = ctx.createBiquadFilter();
        shp.type = 'highpass';
        shp.frequency.value = NM_MA.BASS_MONO_FREQ;
        shp.Q.value = 0.7;
        side.connect(shp);
        sideOut = shp;
      }
      const outL = half(1),
        outR = half(1),
        sPos = half(1),
        sNeg = half(-1);
      mid.connect(outL);
      mid.connect(outR);
      sideOut.connect(sPos);
      sideOut.connect(sNeg);
      outL.connect(mg, 0, 0);
      sPos.connect(mg, 0, 0);
      outR.connect(mg, 0, 1);
      sNeg.connect(mg, 0, 1);
      node = mg;
    }
    return node;
  }
  async function renderPass(buf, s, withLimiter) {
    const frames = Math.ceil(buf.duration * s.sampleRate);
    const nch = Math.min(2, buf.numberOfChannels);
    const OAC = g.OfflineAudioContext || g.webkitOfflineAudioContext;
    const ctx = new OAC(nch, frames, s.sampleRate);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    let node = withLimiter ? src : buildChain(ctx, src, s);
    if (withLimiter) {
      const lim = ctx.createDynamicsCompressor();
      lim.threshold.value = s.ceilingDb;
      lim.ratio.value = NM_MA.LIMITER_RATIO;
      lim.knee.value = 0;
      lim.attack.value = NM_MA.LIMITER_ATTACK;
      lim.release.value = NM_MA.LIMITER_RELEASE;
      node.connect(lim);
      node = lim;
    }
    node.connect(ctx.destination);
    src.start();
    return ctx.startRendering();
  }
  async function nmMaster(buf, opts, onStep) {
    const s = nmMaSettings(opts);
    const step = m => {
      try {
        onStep && onStep(m);
      } catch (e) {}
    };
    step('처리 중');
    let out = await renderPass(buf, s, false);
    const before = nmMeasureLUFS(out);
    if (s.normalize) {
      step('라우드니스 맞추는 중');
      const k = nmNormGain(before.integratedLUFS, s.targetLufs);
      if (k !== 1) for (let ch = 0; ch < out.numberOfChannels; ch++) {
        const d = out.getChannelData(ch);
        for (let i = 0; i < d.length; i++) d[i] *= k;
      }
    }
    if (s.limit) {
      step('피크 잡는 중');
      out = await renderPass(out, s, true);
      nmTruePeakClip(out, s.ceilingDb);
    }
    const after = nmMeasureLUFS(out);
    return {
      buffer: out,
      settings: s,
      before,
      after,
      truePeakDB: (p => p > 0 ? 20 * Math.log10(p) : -Infinity)(nmTruePeak(out))
    };
  }
  function nmEncodeWAV(buf, bitDepth) {
    const bd = [16, 24].includes(+bitDepth) ? +bitDepth : 16;
    const nch = buf.numberOfChannels,
      len = buf.length,
      sr = buf.sampleRate;
    const bytes = bd / 8,
      dataLen = len * nch * bytes;
    const ab = new ArrayBuffer(44 + dataLen),
      dv = new DataView(ab);
    const str = (o, s) => {
      for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i));
    };
    str(0, 'RIFF');
    dv.setUint32(4, 36 + dataLen, true);
    str(8, 'WAVE');
    str(12, 'fmt ');
    dv.setUint32(16, 16, true);
    dv.setUint16(20, 1, true);
    dv.setUint16(22, nch, true);
    dv.setUint32(24, sr, true);
    dv.setUint32(28, sr * nch * bytes, true);
    dv.setUint16(32, nch * bytes, true);
    dv.setUint16(34, bd, true);
    str(36, 'data');
    dv.setUint32(40, dataLen, true);
    const ch = [];
    for (let c = 0; c < nch; c++) ch.push(buf.getChannelData(c));
    const max = bd === 16 ? 32767 : 8388607;
    const lsb = 1 / max;
    let o = 44;
    for (let i = 0; i < len; i++) {
      for (let c = 0; c < nch; c++) {
        let v = ch[c][i];
        if (bd === 16) v += (Math.random() + Math.random() - 1) * lsb;
        v = Math.max(-1, Math.min(1, v));
        const n = Math.round(v * max);
        if (bd === 16) {
          dv.setInt16(o, n, true);
          o += 2;
        } else {
          dv.setUint8(o, n & 255);
          dv.setUint8(o + 1, n >> 8 & 255);
          dv.setUint8(o + 2, n >> 16 & 255);
          o += 3;
        }
      }
    }
    return new window.Blob([ab], {
      type: 'audio/wav'
    });
  }
  let _VIZ = null;
  function vizCtx() {
    if (_VIZ) return _VIZ;
    const OAC = g.OfflineAudioContext || g.webkitOfflineAudioContext;
    const N = 160,
      F = new Float32Array(N);
    for (let i = 0; i < N; i++) F[i] = 20 * Math.pow(1000, i / (N - 1));
    _VIZ = {
      ctx: new OAC(1, 1, 44100),
      N,
      F,
      mag: new Float32Array(N),
      ph: new Float32Array(N)
    };
    return _VIZ;
  }
  function nmEqCurve(bands, W, H, dbRange) {
    const v = vizCtx(),
      R = dbRange || 15,
      sum = new Float32Array(v.N);
    BANDS.forEach((b, i) => {
      const gdb = bands && bands[i] || 0;
      if (!gdb) return;
      const n = v.ctx.createBiquadFilter();
      n.type = b.type;
      n.frequency.value = b.f;
      n.gain.value = gdb;
      if (b.q) n.Q.value = b.q;
      n.getFrequencyResponse(v.F, v.mag, v.ph);
      for (let k = 0; k < v.N; k++) sum[k] += 20 * Math.log10(Math.max(v.mag[k], 1e-6));
    });
    let d = '';
    for (let i = 0; i < v.N; i++) {
      const x = (W * i / (v.N - 1)).toFixed(1);
      const y = (H / 2 - Math.max(-R, Math.min(R, sum[i])) * (H / 2) / R).toFixed(1);
      d += (i ? 'L' : 'M') + x + ' ' + y;
    }
    return d;
  }
  g.nmMaster = nmMaster;
  g.nmMeasureLUFS = nmMeasureLUFS;
  g.nmEncodeWAV = nmEncodeWAV;
  g.nmEqCurve = nmEqCurve;
  g.nmMaResolve = o => nmMaSettings(o).eqBands;
  g.nmMaBands = () => BANDS.map(b => ({
    f: b.f,
    label: b.f >= 1000 ? (b.f / 1000).toFixed(b.f % 1000 ? 2 : 0).replace(/\.?0+$/, '') + 'k' : String(b.f)
  }));
  g.nmMaMacros = () => MACRO_KEYS.slice();
  g.nmMaDefaults = () => Object.assign({}, DEF, {
    eqBands: new Array(NB).fill(0)
  });
})(window);
}
export const LIB = {
  "nm-wave.js": nm_wave_js,
  "nm-scene.js": nm_scene_js,
  "nm-svg.js": nm_svg_js,
  "nm-ua.js": nm_ua_js,
  "nm-rail.js": nm_rail_js,
  "nm-jobs.js": nm_jobs_js,
  "nm-clip.js": nm_clip_js,
  "nm-sync.js": nm_sync_js,
  "nm-loader.js": nm_loader_js,
  "nm-gauge.js": nm_gauge_js,
  "nm-snap.js": nm_snap_js,
  "nm-alpha.js": nm_alpha_js,
  "upload.js": upload_js,
  "cscroll.js": cscroll_js,
  "nm-models.js": nm_models_js,
  "nm-styles.js": nm_styles_js,
  "draft.js": draft_js,
  "master.js": master_js,
};
