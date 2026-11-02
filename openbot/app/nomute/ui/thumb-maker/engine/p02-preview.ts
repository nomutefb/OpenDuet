// @ts-nocheck
// 썸네일 생성기 엔진 · 합성 미리보기(renderCpPrev)·사진 자리 잡기(끌기·확대)
//   원본 = 에디터 viewer/thumb.html 1726~2166줄(origin/main c430e4c9f) — 줄 그대로 옮김 · 주석만 뺌(까닭·형 말은 원본 주석에 그대로)
//   바꾼 곳 = 화면 전역 let·var·표 const → S.<이름>(./state · 창 열 때마다 새로) · document·window·타이머 = ./rt(이 화면 뿌리 안으로 · 닫으면 다 걷음) · 함수는 그대로 내보내고 서로 가져옴
//   다시 맞출 땐 ../tools/codemod.mjs 로 원본 줄을 통째로 다시 뗌(손으로 고친 줄 0 · 원본 갈아 끼우는 함수 selApp·updateGoSpec = S 에 올림 · hoist())
import { S } from "./state";
import { Image, ResizeObserver, clearInterval, document, fetch, innerHeight, requestAnimationFrame, setInterval, setTimeout, window } from "./rt";
import { $, cpMergeOn, getName, getPlatform, getYear, isEditApp, rszPickHint } from "./p01-core";
import { opaHi, pvZoomAuto, syncOnOff } from "./p03-options";
import { rszJob, rszPreview, rszWait } from "./p04-media";
import { normEmph, renderEmph2, sensMask, stripStrayStars } from "./p05-text";
import { snapForm, studioRouteFn } from "./p06-draft";
import { TRK, buildEmphText, estTracking, prevLetterSpace } from "./p10-cards";
import { HDR, abbrOn, cTpl, effOvFmt, estHeaderTr, goFire, hdrFit, ovFit, ovTrkKey } from "./p11-fit";
import { a2Build, errStatus } from "./p13-fire";

export const CPV_WHITE = 'rgb(255,255,255)';
export const CPV_GREEN = '#0FFD02';
export const CP_PREV_FONT = 'Noto Sans KR';
export function cpPrevVariants() {
  const csub = abbrOn($('#cSub').value.trim()), ctitle = abbrOn($('#cTitle').value.trim());
  const lines = normEmph(stripStrayStars($('#cLines').value)).split('\n').map(s => abbrOn(s.trim())).filter(Boolean);
  const v = [];

  if (csub || ctitle) { v.push({ k: 'hdr', lbl: '흰칸', fmt: 'reels' }); if ($('#cBg').checked) v.push({ k: 'nobg', lbl: '기본', fmt: 'reels' }); }
  if (typeof S.A2M !== 'undefined' && S.A2M === 'c') { const cl = buildEmphText().split('\n').map(s => s.trim()).filter(Boolean); if (cl.length || S.CIMG.b64) v.push({ k: 'card', lbl: '카드뉴스', fmt: 'post', cl }); }
  else if (lines.length || S.CIMG.b64) v.push({ k: 'ov', lbl: '자막', fmt: effOvFmt() });
  const gpvOn = S.guideMode && ($('#warnLines').value || '').trim();
  const gpvFmt = S.cpThumb !== 'off' ? S.cpThumb : (effOvFmt() === 'post' ? 'post' : 'reels');
  if (S.cpThumb !== 'off' && !v.some(x => cpMergeOn(x, S.cpThumb))) v.push({ k: 'cr', lbl: gpvOn ? '저작권·안내문' : '저작권', fmt: S.cpThumb });
  else if (gpvOn && !v.some(x => cpMergeOn(x, gpvFmt))) v.push({ k: 'cr', lbl: '안내문', fmt: gpvFmt });
  return { v, csub, ctitle, lines };
}
export const CPAN_MIN = 0.3;
export const CPAN_MAX = 4;
export const CPAN_STEP = 0.1;
export function cpPanOn() { return S.CPAN.s !== 1 || S.CPAN.x !== 0 || S.CPAN.y !== 0; }
export function cpPanGeo(fmt) {
  const w = S.RSZ.w, h = S.RSZ.h; if (!w || !h) return null;
  const r = w / h, R = (fmt === 'reels' ? 1080 / 1920 : 1080 / 1350);
  const f = Math.max(r / R, R / r);
  const cw = r >= R ? 1 : r / R, ch = r >= R ? R / r : 1;
  return { r, R, f, wp: cw * f * S.CPAN.s, hp: ch * f * S.CPAN.s };
}
export function cpPanGap() { return !!(S.CIMG.b64 && S.RSZ.w && S.CPAN.s < 0.999); }
export function cpPanClamp() {
  const g = cpPanGeo(S.cpPanFmt); if (!g) return;
  const lx = Math.abs(g.wp - 1) / 2, ly = Math.abs(g.hp - 1) / 2;
  S.CPAN.x = Math.max(-lx, Math.min(lx, S.CPAN.x)); S.CPAN.y = Math.max(-ly, Math.min(ly, S.CPAN.y));
}
export function cpPanApply() {
  const st = $('#cpPrevStage'); if (!st) return;
  cpPanClamp();
  const g = cpPanGeo(S.cpPanFmt);

  const sp = (k, v) => { if (st.style.getPropertyValue(k) !== v) st.style.setProperty(k, v); };
  sp('--pnf', g ? g.f.toFixed(4) : '1');
  sp('--pns', S.CPAN.s.toFixed(4));
  sp('--pnx', (S.CPAN.x * 100).toFixed(3) + '%');
  sp('--pny', (S.CPAN.y * 100).toFixed(3) + '%');
  st.classList.toggle('cpv-grab', !!st.querySelector('.cpv-pan'));
  cpPanRailSync();
}
export function cpPanRailSync() {
  const st = $('#cpPrevStage');
  const onPhoto = !!(S.CIMG.b64 && st && st.querySelector('.cpv-pan'));
  const pw = $('#gsPanWrap'), fw = $('#gsFillWrap'), pv = $('#gsPanV');
  if (pw) pw.hidden = !onPhoto;
  const gap = onPhoto && cpPanGap();
  if (fw) fw.hidden = !gap;
  if (!gap) S.cpFillWant = false;
  syncOnOff('#gsPanFill', S.cpFillWant);
  if (pv) { const t = String(Math.round(S.CPAN.s * 100)); if (pv.textContent !== t) pv.textContent = t; }
}
export function cpPanReset() { S.CPAN.s = 1; S.CPAN.x = 0; S.CPAN.y = 0; cpPanApply(); }
export function cpPanFit() {
  const g = cpPanGeo(S.cpPanFmt); if (!g) return;
  S.CPAN.s = Math.max(CPAN_MIN, 1 / g.f); S.CPAN.x = 0; S.CPAN.y = 0; cpPanApply();
}
export function cpPanZoom(mul, cx, cy) {
  const s0 = S.CPAN.s, s1 = Math.max(CPAN_MIN, Math.min(CPAN_MAX, s0 * mul));
  if (s1 === s0) return;
  if (Number.isFinite(cx)) { S.CPAN.x = cx - (cx - S.CPAN.x) * (s1 / s0); S.CPAN.y = cy - (cy - S.CPAN.y) * (s1 / s0); }
  S.CPAN.s = s1; cpPanApply();
}
export function cpPanStep(d) { cpPanZoom(d > 0 ? 1 + CPAN_STEP : 1 / (1 + CPAN_STEP)); }
export const CP_BAKE_TOL = 0.005;
export async function cpBake(fmt) {

  if (!S.CIMG.b64) return null;
  const g = cpPanGeo(fmt); if (!g) return null;
  if (!cpPanOn() && Math.abs(g.r - g.R) / g.R < CP_BAKE_TOL) return null;
  try {
    const im = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('load')); i.src = S.CIMG.b64.startsWith('data:') ? S.CIMG.b64 : 'data:image/jpeg;base64,' + S.CIMG.b64; });
    const bh = fmt === 'reels' ? 1920 : 1350;
    const m = (im.naturalWidth > g.wp * 1080) ? 2 : 1;
    const TW = 1080 * m, TH = bh * m;
    const c = document.createElement('canvas'); c.width = TW; c.height = TH;
    const cx = c.getContext('2d'); cx.imageSmoothingQuality = 'high';
    cx.fillStyle = '#000'; cx.fillRect(0, 0, TW, TH);
    cx.drawImage(im, (0.5 + S.CPAN.x - g.wp / 2) * TW, (0.5 + S.CPAN.y - g.hp / 2) * TH, g.wp * TW, g.hp * TH);
    return c.toDataURL('image/jpeg', 0.9);
  } catch { return null; }
}
export const cpFillRunning = a => S.JOBS.some(jb => jb && jb.rid && jb.status === 'run' && jb.payload && jb.payload.box && (!a || jb.payload.aspect === a));
export async function cpFillSrc(fmt) {

  if (!S.CIMG.b64) return null;
  const g = cpPanGeo(fmt); if (!g) return null;
  const r5 = n => Math.round(n * 1e5) / 1e5;
  let bx = 0.5 + S.CPAN.x - g.wp / 2, by = 0.5 + S.CPAN.y - g.hp / 2, bw = g.wp, bh = g.hp;
  const x0 = Math.max(0, bx), y0 = Math.max(0, by), x1 = Math.min(1, bx + bw), y1 = Math.min(1, by + bh);
  const eps = 1e-6;
  if (x0 - bx < eps && y0 - by < eps && (bx + bw) - x1 < eps && (by + bh) - y1 < eps) return { b64: S.CIMG.b64, name: S.CIMG.name, box: { x: r5(bx), y: r5(by), w: r5(bw), h: r5(bh) } };
  try {
    const im = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('load')); i.src = S.CIMG.b64.startsWith('data:') ? S.CIMG.b64 : 'data:image/jpeg;base64,' + S.CIMG.b64; });
    const nw = im.naturalWidth, nh = im.naturalHeight;
    const sx = (x0 - bx) / bw * nw, sy = (y0 - by) / bh * nh, sw = (x1 - x0) / bw * nw, sh = (y1 - y0) / bh * nh;
    const k = Math.min(1, 4096 / Math.max(sw, sh));
    const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(sw * k)); c.height = Math.max(1, Math.round(sh * k));
    const cx = c.getContext('2d'); cx.imageSmoothingQuality = 'high';
    cx.drawImage(im, sx, sy, sw, sh, 0, 0, c.width, c.height);
    return { b64: c.toDataURL('image/jpeg', 0.9), name: 'crop.jpg', box: { x: r5(x0), y: r5(y0), w: r5(x1 - x0), h: r5(y1 - y0) } };
  } catch { return null; }
}
export async function cpFillGap() {
  if (!S.CIMG.b64) return errStatus('입력 필요', 'err', '.cpprev-box');
  if (!cpPanGap()) return errStatus('여백 없음', 'warn');
  const _fmt = S.cpPanFmt, _asp = _fmt === 'reels' ? '9:16' : '4:5';
  if (cpFillRunning(_asp)) return errStatus('진행중...', 'warn');
  const fs = await cpFillSrc(_fmt); if (!fs) return errStatus('재시도');
  const payload = { imageB64: fs.b64, name: fs.name, aspect: _asp, size: '1K', lock: true, fill: 'auto', box: fs.box };

  let _chain = null;
  try {
    const b = await a2Build(true);
    if (!b.err && b.items && b.items.some(it => it._needBg) && effOvFmt() === _fmt) _chain = { items: b.items, lbl: b.lbl, src: snapForm() };
  } catch (_) {   }

  goFire();
  try {
    const rq = await fetch('/api/resize', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const j = await rq.json().catch(() => ({}));
    if (!rq.ok || j.error) return errStatus('재시도');
    rszWait(true); rszJob(j.id, payload, true, { tpl: cTpl, chain: _chain });
    { const jb = $('#jobs'); if (jb) { const r = jb.getBoundingClientRect(); if (r.bottom < 40 || r.top > innerHeight - 40) jb.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }
  } catch { return errStatus('재시도'); }
}
export function renderCpPrev() {
  const pane = $('#cpPrev'); if (!pane) return;
  pvZoomAuto(S.APP === '8' && !!S.CIMG.b64 && S.IE.phase !== 'done');

  if (S.SPX) {

    pane.classList.remove('none'); const _st = $('#cpPrevStage'), _ip = $('#iePrev');
    if (S.CIMG.b64) { if (_ip) _ip.classList.remove('none'); if (_st) _st.classList.add('none'); rszPreview(); cpToolSync(false); return; }
    if (_ip) _ip.classList.add('none');
    if (_st) { _st.classList.remove('none'); _st.className = 'cpprev-stage post';
      if (!_st.querySelector('.cpv-photobtn')) {
        _st.innerHTML = '<div class="cpv-empty"><button type="button" class="cpv-photobtn" aria-label="사진 첨부 — 탭=파일 선택" title="사진 첨부 — 탭=파일 선택"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="8.5" cy="9.5" r="1.5"></circle><path d="M21 16l-5-5L5 20"></path></svg></button></div>';
        _st.querySelector('.cpv-photobtn').onclick = () => { const f = $('#cFile'); if (f) f.click(); };
      } }
    cpToolSync(true); return; }
  if (!(S.APP === '2' || isEditApp(S.APP))) { pane.classList.add('none'); return; }
  const ipv = $('#iePrev');
  if (isEditApp(S.APP)) {
    pane.classList.remove('none');
    const _bx = pane.querySelector('.cpprev-box');
    const st = $('#cpPrevStage');
    if (S.CIMG.b64) {
      if (ipv) ipv.classList.remove('none');
      st.classList.add('none');
      rszPreview();
      rszPickHint();
      cpToolSync(false);
    } else {
      if (ipv) ipv.classList.add('none');
      st.classList.remove('none');
      st.className = 'cpprev-stage post';
      if (!st.querySelector('.cpv-photobtn')) {
        st.innerHTML = '<div class="cpv-empty"><button type="button" class="cpv-photobtn" aria-label="사진 첨부 — 탭=파일 선택" title="사진 첨부 — 탭=파일 선택"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="8.5" cy="9.5" r="1.5"></circle><path d="M21 16l-5-5L5 20"></path></svg></button></div>';
        st.querySelector('.cpv-photobtn').onclick = () => { const f = $('#cFile'); if (f) f.click(); };
      }
      cpToolSync(true);
    }
    return;
  }
  if (ipv) ipv.classList.add('none');
  const { v, csub, ctitle, lines } = cpPrevVariants();
  if (!v.length) {
    pane.classList.remove('none');
    const st0 = $('#cpPrevStage'); st0.classList.remove('none'); st0.className = 'cpprev-stage post';
    if (!st0.querySelector('.cpv-photobtn')) {
      st0.innerHTML = '<div class="cpv-empty"><button type="button" class="cpv-photobtn" aria-label="사진 첨부 — 탭=파일 선택" title="사진 첨부 — 탭=파일 선택"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="8.5" cy="9.5" r="1.5"></circle><path d="M21 16l-5-5L5 20"></path></svg></button></div>';
      st0.querySelector('.cpv-photobtn').onclick = () => { const f = $('#cFile'); if (f) f.click(); };
    }
    cpToolSync(true);
    return;
  }
  pane.classList.remove('none');
  if (S.cpPrevSel >= v.length) S.cpPrevSel = 0;
  const _fi = S.cpFocus ? v.findIndex(x => S.cpFocus === 'hdr' ? (x.k === 'hdr' || x.k === 'nobg') : (x.k === 'ov' || x.k === 'card')) : -1;
  const cur = v[_fi >= 0 ? _fi : S.cpPrevSel];
  const st = $('#cpPrevStage');

  st.classList.toggle('reels', cur.fmt === 'reels'); st.classList.toggle('post', cur.fmt !== 'reels'); st.classList.remove('none');
  const W = st.offsetWidth || 1;
  const bh = cur.fmt === 'reels' ? 1920 : 1350;
  const px = n => (n / 1080 * W).toFixed(1) + 'px';
  const py = n => (n / bh * 100).toFixed(2) + '%';
  const esc = s => sensMask(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const emph = s => renderEmph2(s).map(([k, v]) => k === 'h' ? `<b style="color:${CPV_GREEN};font-weight:inherit">${esc(v)}</b>` : esc(v)).join('');
  let h = '';
  if (cur.k === 'hdr' || cur.k === 'nobg') {
    h += `<img class="cpv-bg" data-logo src="assets/brand/${S.cLogoOff ? 'reels2_base_nologo_preview' : 'reels2_base_preview'}.webp" alt="">`;
    if (cur.k === 'hdr') h += `<div class="cpv-band" style="top:${py(590)};bottom:${(100 - 1431 / bh * 100).toFixed(2)}%"></div>`;
    const fs2 = hdrFit(csub, HDR.sub), ft2 = hdrFit(ctitle, HDR.title);
    const trS = estHeaderTr(fs2, HDR.sub).tr, trT = estHeaderTr(ft2, HDR.title).tr;
    h += `<div class="cpv" style="left:0;right:0;top:${py(270)};margin-top:${px(9)};text-align:center;color:${CPV_WHITE};font-size:${px(66)};font-weight:700;line-height:1.15;white-space:pre;letter-spacing:${(trS / 1000).toFixed(4)}em">${esc(fs2)}</div>`;
    h += `<div class="cpv" style="left:0;right:0;top:${py(385)};margin-top:${px(15)};text-align:center;color:${CPV_GREEN};font-size:${px(90)};font-weight:800;line-height:1.15;white-space:pre;letter-spacing:${(trT / 1000).toFixed(4)}em">${esc(ft2)}</div>`;
  } else if (cur.k === 'ov') {
    if (S.CIMG.b64 && !S.ovOnly) h += CPV_PANSLOT;
    h += `<div class="cpv-scrim ${cur.fmt === 'reels' ? 'g-reels' : 'g-post'}" style="opacity:${(((v0 => Number.isFinite(v0) ? v0 : 60)(opaHi())) / 100).toFixed(2)}"></div>`;
    const lg = cur.fmt === 'reels' ? { x: 104, y: 1008, w: 139, h: 102 } : { x: 98, y: 720, w: 127, h: 93 };
    if (!S.cLogoOff) h += `<img class="cpv-logo" data-logo src="assets/brand/overlay_logo_preview.webp" alt="" style="left:${px(lg.x)};top:${py(lg.y)};width:${px(lg.w)};height:${py(lg.h)}">`;
    if (lines.length) {
      const sp = cur.fmt === 'reels' ? { fs: 78, lh: 96, lm: 101, ty: 1119 } : { fs: 76, lh: 89, lm: 85, ty: 822 };

      const ovKey = cur.fmt === 'reels' ? 'reels' : 'post';
      const fitLines = lines.map(l => ovFit(l, ovKey));
      const trimmed = fitLines.some((l, i) => l !== lines[i]);
      const trO = estTracking(fitLines, ovKey).tr;
      const ovClip = trimmed ? 'overflow:hidden;' : '';
      h += `<div class="cpv" style="${ovClip}left:${px(sp.lm)};right:${px(40)};top:${py(sp.ty)};margin-top:${px(cur.fmt === 'reels' ? 8 : 11)};color:${CPV_WHITE};font-size:${px(sp.fs)};font-weight:800;line-height:${(sp.lh / sp.fs).toFixed(3)};white-space:pre;letter-spacing:${(trO / 1000).toFixed(4)}em">${fitLines.map(l => { const ls = prevLetterSpace(l, trO, sp.fs, TRK[ovTrkKey()] ? TRK[ovTrkKey()].basis : 'adv'); return ls == null ? emph(l) : `<span style="letter-spacing:${px(ls)}">${emph(l)}</span>`; }).join('<br>')}</div>`;
    }
  } else if (cur.k === 'card') {
    if (S.CIMG.b64) h += CPV_PANSLOT;
    h += `<div class="cpv-scrim g-card"></div>`;
    const cl = cur.cl || [];
    if (cl.length) h += `<div class="cpv" style="left:${px(87)};right:${px(56)};top:${py(888)};color:${CPV_WHITE};font-size:${px(54)};font-weight:700;line-height:${(88 / 54).toFixed(3)};white-space:pre">${cl.map(emph).join('<br>')}</div>`;
  }
  const gfmtR = S.cpThumb !== 'off' ? S.cpThumb : (effOvFmt() === 'post' ? 'post' : 'reels');
  const showCR = (cur.k === 'cr') || (S.cpThumb !== 'off' && cpMergeOn(cur, S.cpThumb)) || (S.guideMode && cpMergeOn(cur, gfmtR));
  if (showCR) {
    let idx = 0;
    if (S.cpThumb !== 'off') {
      const _nm = getName(), _noP = $('#cphPlat').dataset.plat === 'none', _pl = _noP ? '' : (getPlatform() || 'threads');
      const _attr = (_nm && _pl) ? `${_nm}(${_pl})` : (_nm || _pl);
      const txt = _attr ? `ⓒ ${getYear()}. ${_attr}. all rights reserved.` : `ⓒ ${getYear()}. all rights reserved.`;
      h += `<div class="cpv" style="left:0;right:0;top:${py(100)};text-align:center;color:${CPV_WHITE};font-size:${px(29)};font-weight:400">${esc(txt)}</div>`;
      idx = 1;
    }
    if (S.guideMode) ($('#warnLines').value || '').split('\n').map(s => s.trim()).filter(Boolean).forEach((gl, i) => {
      h += `<div class="cpv" style="left:0;right:0;top:${py(100 + 46 * (i + idx))};text-align:center;color:${CPV_WHITE};font-size:${px(29)};font-weight:400">${esc(gl)}</div>`;
    });
  }
  cpvStagePaint(st, h);
  S.cpPanFmt = cur.fmt === 'reels' ? 'reels' : 'post'; cpPanApply();
  cpToolSync(false);
}
export const CPSW_ADD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="8.5" cy="9.5" r="1.5"></circle><path d="M21 16l-5-5L5 20"></path></svg>';
export const CPSW_SWAP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>';
export const CPV_PANSLOT = '<i data-panslot hidden></i>';
export function cpvPanSrc() { return S.CIMG.b64.startsWith('data:') ? S.CIMG.b64 : 'data:image/jpeg;base64,' + S.CIMG.b64; }
export function cpvPanNode() {
  const url = cpvPanSrc();
  if (!S._cpvPanEl || S._cpvPanSrc !== url) {
    S._cpvPanEl = new Image();
    S._cpvPanEl.className = 'cpv-bg cpv-pan'; S._cpvPanEl.draggable = false; S._cpvPanEl.alt = '';
    S._cpvPanEl.src = url; S._cpvPanSrc = url;
  }
  return S._cpvPanEl;
}
export function cpvStagePaint(st, h) {
  const wantPan = h.startsWith(CPV_PANSLOT);
  const rest = wantPan ? h.slice(CPV_PANSLOT.length) : h;
  const keep = wantPan && S._cpvPanEl && S._cpvPanEl.parentNode === st && S._cpvPanSrc === cpvPanSrc();
  if (!keep) {
    st.innerHTML = '';
    if (wantPan) st.appendChild(cpvPanNode());
    S._cpvRest = null;
  } else if (S._cpvRest === rest && (st.lastElementChild || !rest)) return;
  const tpl = document.createElement('template'); tpl.innerHTML = rest;
  const want = Array.from(tpl.content.children);
  const have = Array.from(st.children).filter(n => n !== S._cpvPanEl);
  for (let i = 0; i < want.length; i++) {
    if (!have[i]) st.appendChild(want[i]);
    else if (have[i].outerHTML !== want[i].outerHTML) have[i].replaceWith(want[i]);
  }
  for (let i = want.length; i < have.length; i++) have[i].remove();
  S._cpvRest = rest;
}
export function cpToolSync(empty) {
  const sw = $('#cpImgSwap'), dl = $('#cpImgDel');
  if (sw) { sw.hidden = false; sw.disabled = false;
    const m = S.CIMG.b64 ? 'swap' : 'add';
    if (sw.dataset.mode !== m) { sw.dataset.mode = m; sw.innerHTML = m === 'swap' ? CPSW_SWAP : CPSW_ADD;
      const lb = m === 'swap' ? '사진 교체' : '사진 첨부';
      sw.setAttribute('aria-label', lb + ' — 탭=파일 선택'); sw.title = lb; }
  }
  { const on = !!studioRouteFn() && S.APP === '2' && !S.SPX; ['#cpVidGo', '#cpLinkGo'].forEach(sel => { const b = $(sel); if (b) b.hidden = !on; }); }
  if (dl) { dl.hidden = false; dl.disabled = !S.CIMG.b64; }
  cpToolAnchor();
}
export function cpToolAnchor() {
  const box = document.querySelector('#cpPrev .cpprev-box'); if (!box) return;
  const sw = $('#cpImgSwap'), dl = $('#cpImgDel'); if (!sw || !dl) return;
  if (sw.closest('.trail')) { sw.style.top = dl.style.top = sw.style.right = dl.style.right = ''; return; }
  const art = box.querySelector('.rsz-canv') || box.querySelector('.rsz-orig');
  if (!art || sw.hidden) { sw.style.top = dl.style.top = ''; sw.style.right = dl.style.right = ''; return; }
  const br = box.getBoundingClientRect(), ar = art.getBoundingClientRect();
  if (!ar.width || !ar.height) return;
  const top = Math.max(0, ar.top - br.top) + 6, right = Math.max(0, br.right - ar.right) + 6;
  sw.style.top = dl.style.top = top + 'px';
  dl.style.right = right + 'px';
  sw.style.right = (right + 36) + 'px';
}
export function cpPrevWait(on) {
  const w = $('#cpPrevWait'); if (!w) return;
  if (on) {
    if ($('#cpPrev').classList.contains('none')) return;
    S._cpwT0 = Date.now(); w.hidden = false; $('#cpPrevSec').textContent = '';
    clearInterval(S._cpwT);
    S._cpwT = setInterval(() => {
      const s = Math.floor((Date.now() - S._cpwT0) / 1000);
      $('#cpPrevSec').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') + (window.nmEta ? nmEta.label('thumb-copy') : '');
      if (s > 480) cpPrevWait(false);
    }, 1000);
  } else { w.hidden = true; clearInterval(S._cpwT); S._cpwT = null; }
}

export function start() {
S.cpPrevSel = 0;
S.cpFocus = null;
S.CPAN = { s: 1, x: 0, y: 0 };
S.cpPanFmt = 'post';
S.cpFillWant = false;
(function cpPanBind() {
  const st = $('#cpPrevStage'); if (!st) return;
  const live = () => !!(S.CIMG.b64 && st.querySelector('.cpv-pan'));
  const pts = new Map(); let last = null, pinch = 0;
  const rect = () => st.getBoundingClientRect();
  const mid = () => { const a = [...pts.values()]; return { x: (a[0].x + a[1].x) / 2, y: (a[0].y + a[1].y) / 2, d: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) }; };
  st.addEventListener('pointerdown', e => {
    if (!live() || e.button > 0) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { st.setPointerCapture(e.pointerId); } catch {}
    if (pts.size === 2) { pinch = mid().d; last = null; } else { last = { x: e.clientX, y: e.clientY }; }
    st.classList.add('cpv-drag');
  });
  st.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const rc = rect(); if (!rc.width) return;
    if (pts.size >= 2) {
      const m = mid(); if (pinch > 0 && m.d > 0) { const c = { x: (m.x - rc.left) / rc.width - .5, y: (m.y - rc.top) / rc.height - .5 }; cpPanZoom(m.d / pinch, c.x, c.y); }
      pinch = m.d; e.preventDefault(); return;
    }
    if (!last) return;
    S.CPAN.x += (e.clientX - last.x) / rc.width; S.CPAN.y += (e.clientY - last.y) / rc.height;
    last = { x: e.clientX, y: e.clientY }; cpPanApply(); e.preventDefault();
  }, { passive: false });
  const up = e => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId); if (pts.size < 2) pinch = 0;
    if (!pts.size) { last = null; st.classList.remove('cpv-drag'); cpPanApply(); }
    else { const a = [...pts.values()][0]; last = { x: a.x, y: a.y }; }
  };
  st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up);
  st.addEventListener('dragstart', e => { if (live()) e.preventDefault(); });
  st.addEventListener('wheel', e => { if (!live()) return; e.preventDefault(); const rc = rect();
    cpPanZoom(e.deltaY < 0 ? 1.1 : 1 / 1.1, (e.clientX - rc.left) / rc.width - .5, (e.clientY - rc.top) / rc.height - .5); }, { passive: false });
  st.addEventListener('dblclick', e => { if (!live()) return; e.preventDefault(); cpPanReset(); });
})();
S._cpvPanEl = null;
S._cpvPanSrc = '';
S._cpvRest = null;
S._cpwT = null;
S._cpwT0 = 0;
(function () {
  const _ugs0 = S.updateGoSpec;
  S.updateGoSpec = function () { _ugs0(); renderCpPrev(); };

  const _mark = (ids, k) => ids.forEach(id => { const el = $(id); if (!el) return; ['focus', 'input'].forEach(ev => el.addEventListener(ev, () => { if (S.cpFocus === k) return; S.cpFocus = k; if (ev === 'focus') renderCpPrev(); })); });
  _mark(['#cSub', '#cTitle'], 'hdr');
  _mark(['#cLines'], 'ov');
  const _ecm = $('#edChips'); if (_ecm) ['focusin', 'input'].forEach(ev => _ecm.addEventListener(ev, () => { S.cpFocus = 'ov'; }));
  ['#cSub', '#cTitle', '#cLines', '#warnLines', '#cplat'].forEach(id => { const el = $(id); if (el) el.addEventListener('input', renderCpPrev); });
  const _sw = $('#cpImgSwap'), _dl = $('#cpImgDel');
  if (_sw) _sw.addEventListener('click', () => { const f = $('#cFile'); if (f) f.click(); });
  if (_dl) _dl.addEventListener('click', () => { const s = $('#cImgSlot'); if (s && s._reset) s._reset(); });
  const _bx = $('#cpPrev .cpprev-box');
  if (_bx) {
    _bx.addEventListener('dragover', e => { const t = e.dataTransfer; if (t && Array.from(t.types || []).includes('Files')) { e.preventDefault(); t.dropEffect = 'copy'; _bx.classList.add('dropping'); } });
    _bx.addEventListener('dragleave', e => { if (!_bx.contains(e.relatedTarget)) _bx.classList.remove('dropping'); });
    _bx.addEventListener('drop', e => { e.preventDefault(); _bx.classList.remove('dropping'); const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f && /^video\//.test(f.type || '') && studioRouteFn()) { studioRouteFn()('video', f); return; }     const s = $('#cImgSlot'); if (f && s && s._read) s._read(f); });
  }
  const ovt = $('#ovFmtTog');
  if (ovt) { ovt.addEventListener('click', () => setTimeout(renderCpPrev, 0)); ovt.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') setTimeout(renderCpPrev, 0); }); }
  window.addEventListener('resize', () => { if (S.APP === '2') renderCpPrev(); });

  if (window.ResizeObserver) { const stg = $('#cpPrevStage'); if (stg) { let pw = 0, lw = -1, r = 0;
    const settle = () => { r = 0; const w = stg.offsetWidth;
      if (S.APP !== '2' || !w) return;
      if (w !== lw) { lw = w; r = requestAnimationFrame(settle); return; }
      if (Math.abs(w - pw) < 0.5) return; pw = w; renderCpPrev(); };
    new ResizeObserver(() => { if (r) return; lw = -1; r = requestAnimationFrame(settle); }).observe(stg); } }
})();
}
