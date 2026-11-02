// @ts-nocheck
// 썸네일 생성기 엔진 · 카드뉴스 세그·헤더 잠금·안내문·옵션 줄·미리보기 확대·축약어 창·OPA 칩·사진 받기
//   원본 = 에디터 viewer/thumb.html 2167~2795줄(origin/main ee27c47b) — 줄 그대로 옮김 · 주석만 뺌(까닭·형 말은 원본 주석에 그대로)
//   바꾼 곳 = 화면 전역 let·var·표 const → S.<이름>(./state · 창 열 때마다 새로) · document·window·타이머 = ./rt(이 화면 뿌리 안으로 · 닫으면 다 걷음) · 함수는 그대로 내보내고 서로 가져옴
//   다시 맞출 땐 원본 줄을 통째로 다시 떼어 같은 codemod 로(손으로 고친 줄 0 · 원본 갈아 끼우는 함수 selApp·updateGoSpec = S 에 올림 · hoist())
import { S } from "./state";
import { Image, clearTimeout, document, setTimeout, window } from "./rt";
import { ERR_SVG, TRASH_SVG } from "./svg";
import { $, WARN_PRESETS, armAfterAttach, fillLabel, ieSrcSync, isEditApp, setPlat, syncCopyTog, syncCpFmt, syncGuide, updCphDef, upsLabel } from "./p01-core";
import { cpPanFit, cpPanRailSync, cpPanReset, cpPanStep, renderCpPrev } from "./p02-preview";
import { rszAspect, rszPreview } from "./p04-media";
import { studioRouteFn, trHandoff, trRouter } from "./p06-draft";
import { esc, renderEditChips } from "./p10-cards";
import { ABBR_BUILTIN, abbrCustom, headerActive, ovLayerActive } from "./p11-fit";

export function a2TextWrap() { const t = $('#cLines'); return (t && t.parentElement && t.parentElement !== t.closest('.covrow')) ? t.parentElement : t; }
export function updateA2Mount() {
  const cb = $('#cardBox'), slot = $('#a2ChipsSlot'), home = $('#cardHome');
  if (!cb || !slot || !home) return;
  if (S.APP === '2' && S.A2M === 'c') { if (cb.parentNode !== slot) slot.appendChild(cb); cb.classList.remove('none'); }
  else if (cb.parentNode === slot) { home.after(cb); if (S.APP !== '5') cb.classList.add('none'); }
}
export function syncCnTog() {
  const vis = S.APP === '2' && (S.A2M === 'c' || (S.ovFmt === 'post' && !headerActive()));
  ['#cnSep', '#cnTog'].forEach(s => { const el = $(s); if (el) el.classList.toggle('none', !vis); });
  const t = $('#cnTog'); if (t) { const on = S.A2M === 'c'; t.classList.toggle('on', on); t.setAttribute('aria-pressed', on); }
  syncHdrLock();
}
export function syncHdrLock() {
  const cn = S.A2M === 'c';
  [['#cSub', cn], ['#cTitle', cn]].forEach(([s, ro]) => {
    const el = $(s); if (!el) return;
    el.readOnly = ro;
    const w = el.closest('.iowrap'); (w || el).classList.toggle('hlock', cn);
  });
}
export function setA2Mode(m, anim) {
  if (m === 'c' && S.ovFmt !== 'post') m = 't';
  const was = S.A2M; S.A2M = m; const c = m === 'c';
  if (c) S.cpFocus = 'ov';
  const tw = a2TextWrap(), slot = $('#a2ChipsSlot');
  if (tw) tw.classList.toggle('a2hide', c);
  if (slot) slot.classList.toggle('a2on', c);
  const lt = $('#cLinesTrk'); if (lt) lt.classList.toggle('a2hide', c);
  updateA2Mount();
  if (c) { if (!S.edLines.length) S.edLines = [[]]; renderEditChips(); }
  if (anim !== false && was !== m) {
    const unit = c ? slot : tw;
    if (unit) { unit.classList.remove('a2in'); void unit.offsetWidth; unit.style.setProperty('--a2dx', c ? '44px' : '-44px'); unit.classList.add('a2in'); }
  }
  syncCnTog();
  S.updateGoSpec();
  renderCpPrev();
}
export function ceCaretEnd(el) { const r = document.createRange(); r.selectNodeContents(el); r.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
export function ceBlur(el) { const fn = el && el.blur; if (fn) fn.call(el); }
export function setGuide(gm) {
  S.guideMode = gm;
  if (S.guideMode && S.copyOn && S.APP === '3') { S.copyOn = false; syncCopyTog(); }
  if (S.guideMode === 'caution') { $('#warnLines').value = WARN_PRESETS.caution; $('#warnLines').dispatchEvent(new Event('input', { bubbles: true })); }
  else if (S.guideMode === 'ai') { $('#warnLines').value = WARN_PRESETS.ai; $('#warnLines').dispatchEvent(new Event('input', { bubbles: true })); }
  else if (S.guideMode === 'free') { $('#warnLines').value = ''; $('#warnLines').dispatchEvent(new Event('input', { bubbles: true })); }
  syncGuide();
  S.selApp(S.APP);
  if (S.guideMode) $('#warnLines').focus();
}
export function getOpas() {
  const out = [];
  document.querySelectorAll('#opaSeg button.on').forEach(b => {
    if (b.dataset.opa === 'custom') { const n = parseInt(S.opaNum.value, 10); if (Number.isFinite(n) && n >= 1) out.push(Math.min(99, n)); }
    else { const n = parseInt(b.dataset.opa, 10); if (Number.isFinite(n)) out.push(n); }
  });
  return out.length ? out : [58];
}
export function syncOnOff(id, on) { const e = $(id); if (e) { e.classList.toggle('on', !!on); e.setAttribute('aria-pressed', on ? 'true' : 'false'); } }
export function syncAbbrSpec(id) { syncOnOff(id, $('#abbr').checked); }
function updateGoSpec() {

  const strip = $('#optStrip'), spec = $('#goSpec'), esp = $('#editCol');
  const cmode = typeof S.A2M !== 'undefined' && S.A2M === 'c';
  const show2 = S.APP === '2' && !cmode && !S.SPX;
  const showE = isEditApp(S.APP);
  if (strip) strip.classList.toggle('none', !show2);
  { const td = $('#topDock'); if (td) td.dataset.lay = 'edit'; }
  const _or = $('#opaRow'); if (_or && S.APP === '2' && !S.SPX) _or.classList.toggle('none', cmode);
  if (spec) {
    spec.classList.toggle('none', !show2);
    if (show2) {
      const hdrOn = headerActive(), bgOn = hdrOn && $('#cBg').checked;
      { const gb = $('#gsBg'); if (gb) { gb.classList.toggle('on', bgOn); gb.setAttribute('aria-pressed', bgOn ? 'true' : 'false'); gb.classList.toggle('gs-locked', !hdrOn); gb.setAttribute('aria-disabled', !hdrOn ? 'true' : 'false'); gb.title = hdrOn ? '탭=배경(흰칸 없는 버전) 추가' : '헤더(부제+제목) 입력 시 활성 — 추가할 흰칸이 있어야 배경본 의미'; } }
      const ovo = $('#gsOvOnly'); if (ovo) { const noImg = !S.CIMG.b64, noLayer = !noImg && !ovLayerActive(); const lockMg = noImg || noLayer; const onMg = !lockMg && !S.ovOnly; ovo.classList.toggle('on', onMg); ovo.setAttribute('aria-pressed', onMg ? 'true' : 'false'); ovo.classList.toggle('gs-locked', lockMg); ovo.setAttribute('aria-disabled', lockMg ? 'true' : 'false'); ovo.title = noImg ? '사진 미첨부 = 합성할 사진 없음 → 배경 합성 OFF 고정' : noLayer ? '자막(오버레이) 미입력 = 사진이 실릴 장이 없음 → 배경 합성 OFF 고정 (헤더·저작권·안내문 산출물엔 사진이 안 들어간다)' : '탭=ON/OFF — ON=사진 위에 오버레이 레이어 합성 · OFF=사진이 있어도 오버레이 레이어만'; }
      cpPanRailSync();
      const ops = $('#gsOpas'), og = $('#gsOpaOg');
      if (ops) {
        if (og && S.cOpaSel.length < 2) og.classList.remove('opa-peek');
        const peek = !!(og && og.classList.contains('opa-peek'));
        const order = S.cOpaSel.map((v, i) => ({ v: v, i: i })).sort((a, b) => b.v - a.v || a.i - b.i);
        ops.innerHTML = (peek ? order : order.slice(0, 1)).map(s =>
          '<span class="opa-slot" data-i="' + s.i + '">'
          + '<span class="gs-v gs-tog gsop-step" role="button" tabindex="0" data-d="-' + S.OPA_STEP + '" title="탭=−' + S.OPA_STEP + '">−</span>'
          + '<span class="gs-v on gs-tog gs-opav" role="button" tabindex="0" data-v="' + s.v + '" title="휠·상하드래그·방향키=값 조절(' + S.OPA_STEP + '단위) · 낮은 짝과 겹치면 단일 · 더 낮추면 다시 2개 · 길게(0.55초)/우클릭=낮은 짝 ' + (peek ? '접기' : '펼치기') + ' · 탭=이 OPA 끄기(최소 1개)">' + s.v + '</span>'
          + '<span class="gs-v gs-tog gsop-step" role="button" tabindex="0" data-d="' + S.OPA_STEP + '" title="탭=+' + S.OPA_STEP + '">+</span>'
          + '</span>').join('');
      }
      syncAbbrSpec('#gsAbbr');
      { const w = $('#gsTrWrap'); if (w) w.hidden = !trRouter(); }
    }
  }
  if (esp) {
    esp.classList.toggle('none', !showE);
    if (showE) {
      if (S.EDIT_TAB_OFF) ['#esRsz', '#esUps', '#esLock'].forEach(sel => { const c = $(sel) && $(sel).closest('.scard'); if (c) c.classList.add('none'); });
      const setv = (el, t) => { const v = el && el.querySelector('.vv'); if (v) v.textContent = t; };
      const mosOn = S.APP === '8';
      const ie = $('#esIe'); if (ie) { ie.classList.toggle('on', mosOn); ie.setAttribute('aria-pressed', mosOn ? 'true' : 'false'); }
      const rz = $('#esRsz'); if (rz) { const a = rszAspect(); setv(rz, a === 'orig' ? '원본' : a); rz.classList.add('on'); }
      const up = $('#esUps'); if (up) { setv(up, upsLabel(S.upsV)); up.classList.add('on'); }
      const fl = $('#esFill'); if (fl) { setv(fl, fillLabel(S.fillV)); fl.classList.add('on'); }
      if (typeof edNavSync === 'function') edNavSync();
      const lk = $('#esLock'), lk0 = $('#rszLock'); if (lk && lk0) { const on = lk0.classList.contains('on'); lk.classList.toggle('on', on); lk.setAttribute('aria-pressed', on ? 'true' : 'false'); }

      const pr = $('#esPre'), pr0 = $('#iePrecise');
      if (pr) { const on = mosOn && pr0 && pr0.textContent.trim() === 'ON'; pr.classList.toggle('on', !!on); pr.setAttribute('aria-pressed', on ? 'true' : 'false');
        pr.classList.toggle('gs-locked', !mosOn); pr.setAttribute('aria-disabled', !mosOn ? 'true' : 'false');
        pr.title = mosOn ? '탭=윤곽에 딱 맞게(SAM2·느림)' : '모자이크 ON일 때만 — 가릴 피사체가 있어야 윤곽을 딴다'; }
      const op = $('#esOp'), op0 = $('#ieOp');
      if (op) { const cut = mosOn && op0 && op0.textContent.trim() === '떼기'; op.classList.toggle('on', !!cut); op.setAttribute('aria-pressed', cut ? 'true' : 'false');
        op.classList.toggle('gs-locked', !mosOn); op.setAttribute('aria-disabled', !mosOn ? 'true' : 'false');
        op.title = mosOn ? '탭=떼기(누끼 — 피사체만 남긴 투명 PNG) 켜기/끄기 · 꺼짐=가리기(모자이크)' : '모자이크 ON일 때만 — 뗄 피사체가 있어야 한다'; }

      ['#upsRow', '#ieTogRow', '#rszBox', '#fillRow'].forEach(sel => { const el = $(sel); if (el) el.classList.add('none'); });
    }
  }

  { const bx = document.querySelector('#cpPrev .cpprev-box');
    if (bx && bx.classList.contains('ocfit')) { bx.classList.remove('ocfit'); if (typeof rszPreview === 'function') setTimeout(rszPreview, 0); } }

  if (S.APP === '1') syncAbbrSpec('#psAbbr');
}
export const ED_ORD = { esRsz: { wrap: '#rszOpts', ord: ['orig', '4:5', '9:16', '16:9', '1:1'] }, esUps: { wrap: '#upsOpts', ord: ['FHD', '2K', '4K', '720p'] }, esFill: { wrap: '#fillOpts', ord: ['auto', 'solid', 'blur', 'ai'] } };
export function edCur(c) { const on = document.querySelector(c.wrap + ' .ropt.on'); const i = on ? c.ord.indexOf(on.dataset.v) : 0; return i < 0 ? 0 : i; }
export function edPick(c, j) { const t = [...document.querySelectorAll(c.wrap + ' .ropt')].find(b => b.dataset.v === c.ord[j]); if (t) t.click(); edNavSync(); }
export function edStep(id, dir) { const c = ED_ORD[id]; if (!c) return; const i = edCur(c); const j = Math.min(Math.max(i + dir, 0), c.ord.length - 1); if (j !== i) edPick(c, j); }
export function edCycleTap(id) { const c = ED_ORD[id]; if (!c) return; edPick(c, (edCur(c) + 1) % c.ord.length); }
export function pvZoomAuto(force) {
  if (!S.pvZoomPaint || force === S.pvZoomForced) return;
  S.pvZoomForced = force;
  S.pvZoomPaint(force || S.PVZOOM.get());
}
export function edNavSync() {
  Object.keys(ED_ORD).forEach(id => { const c = ED_ORD[id], i = edCur(c);
    document.querySelectorAll('.opt-nav[data-nav="' + id + '"]').forEach(b => { b.disabled = (+b.dataset.dir === -1) ? i <= 0 : i >= c.ord.length - 1; });
    const chip = document.getElementById(id); const w = chip && chip.closest('.rsz-opts');
    if (w) w.classList.toggle('ovfx', w.scrollWidth > w.clientWidth + 2);
  });
}
export function abbrRenumber() { document.querySelectorAll('#abbrTbl .abrow:not(.abhd)').forEach((r, i) => { const n = r.querySelector('.abno'); if (n) n.textContent = i + 1; }); }
export function abbrSaveRows() {
  const pairs = [];
  document.querySelectorAll('#abbrTbl .abrow:not(.abhd):not(.abfix)').forEach(r => { const f = r.querySelector('.abfrom').value, to = r.querySelector('.abto').value; if (f) pairs.push({ from: f, to: to }); });
  try { localStorage.setItem(S.ABBR_KEY, JSON.stringify(pairs)); } catch {}
}
export function abbrAddRow(from, to, fixed) {
  const tbl = $('#abbrTbl'); if (!tbl) return null;
  const row = document.createElement('div'); row.className = 'abrow' + (fixed ? ' abfix' : '');
  if (fixed) {
    row.innerHTML = '<span class="abno"></span><input class="abfrom" type="text" readonly tabindex="-1"><input class="abto" type="text" readonly tabindex="-1"><span class="abfixtag">기본</span>';
    row.querySelector('.abfrom').value = from; row.querySelector('.abto').value = to;
  } else {
    row.innerHTML = '<span class="abno"></span><input class="abfrom" type="text" placeholder="군 " autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false"><input class="abto" type="text" placeholder="軍 " autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false"><button class="abdel" type="button" aria-label="삭제"></button>';
    row.querySelector('.abfrom').value = from || ''; row.querySelector('.abto').value = to || '';
    row.querySelector('.abfrom').addEventListener('input', abbrSaveRows);
    row.querySelector('.abto').addEventListener('input', abbrSaveRows);
    row.querySelector('.abdel').innerHTML = ERR_SVG;
    row.querySelector('.abdel').addEventListener('click', () => { row.remove(); abbrRenumber(); abbrSaveRows(); });
  }
  tbl.appendChild(row); abbrRenumber(); return row;
}
export function abbrRenderRows() {
  const tbl = $('#abbrTbl'); if (!tbl) return;
  tbl.querySelectorAll('.abrow:not(.abhd)').forEach(r => r.remove());
  ABBR_BUILTIN.forEach(([f, t]) => abbrAddRow(f, t, true));
  const cur = abbrCustom();
  if (cur.length) cur.forEach(p => abbrAddRow(p.from, p.to)); else abbrAddRow('', '');
}
export function closeAbbrDlg(viaBack) {
  abbrSaveRows();
  const dlg = $('#abbrDlg'); if (dlg && dlg.open) { dlg.style.maxHeight = ''; dlg.style.marginTop = ''; dlg.close(); }
  if (S._abbrPushed && !viaBack) { S._abbrPushed = false; try { history.back(); } catch {} } else S._abbrPushed = false;
}
export function openAbbrDlg() {
  const dlg = $('#abbrDlg'); if (!dlg) return;
  abbrRenderRows();
  try { history.pushState({ abbrDlg: 1 }, ''); S._abbrPushed = true; } catch { S._abbrPushed = false; }
  dlg.showModal();
}
export function abbrVV() {
  const dlg = $('#abbrDlg'); if (!dlg || !dlg.open || !window.visualViewport) return;
  const vv = window.visualViewport;
  if (vv.height < window.innerHeight - 60) {
    dlg.style.maxHeight = Math.round(vv.height * 0.92) + 'px';
    dlg.style.marginTop = Math.round(vv.offsetTop + vv.height * 0.04) + 'px';
  } else { dlg.style.maxHeight = ''; dlg.style.marginTop = ''; }
}
export const OPA_CHIPS = [70, 60, 50, 40, 30, 20, 10, 0];
export function opaPaint() { document.querySelectorAll('#opaChips .ropt').forEach(b => b.classList.toggle('on', S.cOpaSel.includes(parseInt(b.dataset.v, 10)))); }
export function opaSet(vals) { S.cOpaSel = [...new Set((vals || []).map(v => parseInt(v, 10)).filter(v => Number.isFinite(v) && v >= 0 && v <= 70))].slice(0, 2); if (!S.cOpaSel.length) S.cOpaSel = [60]; opaPaint(); S.updateGoSpec(); }
export function opaHi() { return S.cOpaSel.length ? Math.max(...S.cOpaSel) : 60; }
export function getComboOpas() { const u = [...new Set(S.cOpaSel)]; return u.length ? u : [60]; }
export function _imgFromClipboard(e) {
  const items = (e.clipboardData || (e.originalEvent && e.originalEvent.clipboardData) || {}).items || [];
  for (const it of items) { if (it.type && it.type.indexOf('image/') === 0) { const f = it.getAsFile(); if (f) return f; } }
  return null;
}
export function bindImgPaste(el, onImg) {
  if (!el || el._imgPasteBound) return; el._imgPasteBound = true;
  el.addEventListener('paste', e => { const f = _imgFromClipboard(e); if (f) { e.preventDefault(); onImg(f); } });
}
export function bindFile(inp, lab, store) {

  const inpId = inp.id;
  const rebindInput = () => { const ni = lab.querySelector('input'); if (ni) { ni.onchange = handler; if (inpId) ni.id = inpId; } };
  const reset = () => {
    store.b64 = ''; store.name = '';
    lab.classList.remove('has');
    lab.innerHTML = '<span class="filepic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 16l-5-5L5 20"/></svg></span><input type="file" accept="image/*" style="display:none">';
    rebindInput();

  };
  const applyImg = (b64, name) => {
    store.b64 = b64; store.name = name || '';
    lab.innerHTML = '<div class="fileprev"><img src="' + b64 + '"><button type="button" class="filerm" aria-label="이미지 삭제" title="이미지 삭제">' + TRASH_SVG + '</button><span class="fn">' + (name || '') + '</span></div>' +
      '<input type="file" accept="image/*" style="display:none">';
    lab.classList.add('has');
    rebindInput();
    const rm = lab.querySelector('.filerm');
    if (rm) rm.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); reset(); };

  };
  const handler = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => normalizeImg(r.result, f.name).then(({ url, name }) => applyImg(url, name));
    r.readAsDataURL(f);
  };
  const applyRef = (url) => {
    store.b64 = ''; store.name = '';
    lab.innerHTML = '<div class="fileprev refonly"><img src="' + esc(url) + '"><span class="refhatch" aria-hidden="true"></span><span class="refbadge">참고</span><button type="button" class="filerm" aria-label="이미지 삭제" title="이미지 삭제">' + TRASH_SVG + '</button></div>' +
      '<input type="file" accept="image/*" style="display:none">';
    lab.classList.add('has');
    rebindInput();
    const rm = lab.querySelector('.filerm');
    if (rm) rm.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); reset(); };
  };
  inp.onchange = handler;
  document.addEventListener('paste', e => {
    if (!lab.offsetParent) return;
    const f = _imgFromClipboard(e); if (!f) return;
    e.preventDefault();
    const r = new FileReader(); r.onload = () => normalizeImg(r.result, f.name || '붙여넣기.png').then(({ url, name }) => applyImg(url, name)); r.readAsDataURL(f);
  });
  lab._reset = reset;
  lab._set = applyImg;
  lab._setRef = applyRef;
}
export function normalizeImg(dataURL, name) {
  return new Promise(resolve => {
    const keep = () => resolve({ url: dataURL, name });
    const m = /^data:image\/([a-z0-9.+-]+);base64,/i.exec(dataURL || '');
    const fmt = m ? m[1].toLowerCase() : '';
    const okFmt = fmt === 'jpeg' || fmt === 'jpg' || fmt === 'png' || fmt === 'webp';
    const tooBig = (dataURL || '').length >= 10_500_000;
    if (okFmt && !tooBig) return keep();
    const img = new Image();
    img.onload = () => {
      const sc = tooBig ? Math.min(1, 2560 / Math.max(img.naturalWidth, img.naturalHeight)) : 1;
      const w = Math.max(1, Math.round(img.naturalWidth * sc)), h = Math.max(1, Math.round(img.naturalHeight * sc));
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const cx = cv.getContext('2d'); if (!cx) return keep();
      cx.fillStyle = '#fff'; cx.fillRect(0, 0, w, h); cx.drawImage(img, 0, 0, w, h);
      let out; try { out = cv.toDataURL('image/jpeg', 0.9); } catch { return keep(); }
      resolve({ url: out, name: String(name || 'photo').replace(/\.[^.]+$/, '') + '.jpg' });
    };
    img.onerror = keep;
    img.src = dataURL;
  });
}
export function imgPendBegin() { S._imgPend++; let done = false; return () => { if (done) return; done = true; if (--S._imgPend <= 0) { S._imgPend = 0; while (S._imgPendQ.length) S._imgPendQ.shift()(); } }; }
export function imgPendWait(ms) { return S._imgPend <= 0 ? Promise.resolve() : new Promise(res => { const t = setTimeout(res, ms || 5000); S._imgPendQ.push(() => { clearTimeout(t); res(); }); }); }
export function bindSlotImg(slotSel, inputSel, store, onChange) {
  const slot = $(slotSel), inp = $(inputSel); if (!slot || !inp) return;
  const PHOTO = '<span class="covimg-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="8.5" cy="9.5" r="1.5"></circle><path d="M21 16l-5-5L5 20"></path></svg></span><span class="covimg-t">이미지</span>';
  const XS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6 18 18M18 6 6 18"/></svg>';
  const empty = (silent) => { slot.classList.remove('has', 'refonly'); slot.innerHTML = PHOTO; S.updateGoSpec(); if (onChange && !silent) onChange(false); };
  const filled = (url, kb) => { slot.classList.remove('refonly'); slot.classList.add('has'); slot.innerHTML = '<img src="' + url + '" alt=""><button type="button" class="covimg-x" aria-label="이미지 삭제">' + XS + '</button>' + (kb ? '<span class="covimg-kb">' + kb + 'KB</span>' : ''); S.updateGoSpec(); if (onChange) onChange(true); };
  slot.addEventListener('click', e => {
    if (e.target.closest('.covimg-x')) { e.preventDefault(); e.stopPropagation(); store.b64 = ''; store.name = ''; inp.value = ''; empty(); return; }
    if (!slot.classList.contains('has')) inp.click();
  });
  slot.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && !slot.classList.contains('has')) { e.preventDefault(); inp.click(); } });
  const read = (f) => {
    if (!f || !/^image\//.test(f.type || '')) return;
    const _pd = imgPendBegin();
    const r = new FileReader();
    r.onload = () => { normalizeImg(r.result, f.name || '붙여넣기.png').then(({ url, name }) => { store.b64 = url; store.name = name; filled(url, Math.round((url.length * 0.75) / 1024)); }).finally(_pd); };
    r.onerror = _pd;
    r.readAsDataURL(f);
  };
  inp.onchange = e => { const f = e.target.files[0]; if (f) read(f); e.target.value = ''; };
  bindImgPaste(slot, read);
  const _cr = slot.closest('.covrow'); const _ta = _cr && _cr.querySelector('textarea'); if (_ta) bindImgPaste(_ta, read);
  slot._reset = () => { store.b64 = ''; store.name = ''; inp.value = ''; empty(); };
  slot._read = read;
  slot._set = (b64, name) => { store.b64 = b64; store.name = name || ''; filled(b64); };
  slot._setRef = (url) => {
    store.b64 = ''; store.name = ''; inp.value = '';
    slot.classList.add('has', 'refonly');
    slot.innerHTML = '<img src="' + esc(url) + '" alt=""><span class="refhatch" aria-hidden="true"></span><span class="refbadge">참고</span><button type="button" class="covimg-x" aria-label="이미지 삭제">' + XS + '</button>';
    S.updateGoSpec();
    if (onChange) onChange(false);
  };
  empty(true);
}

/** 원본에서 나중에 갈아 끼우는 함수 = 맨 처음(모든 조각 start 전) S 에 올림 · 원본의 함수 끌어올림과 같은 때 */
export function hoist() {
  S.updateGoSpec = updateGoSpec;
}

export function start() {
S.A2M = 't';
(function () {
  const t = $('#cnTog');
  if (t) { const flip = () => setA2Mode(S.A2M === 'c' ? 't' : 'c'); t.addEventListener('click', flip); t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } }); }
  const ovt = $('#ovFmtTog');
  if (ovt) { const h = () => setTimeout(() => { if (S.ovFmt !== 'post' && S.A2M === 'c') setA2Mode('t'); else syncCnTog(); }, 0); ovt.addEventListener('click', h); ovt.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') h(); }); }
  ['#cSub', '#cTitle'].forEach(id => { const el = $(id); if (el) el.addEventListener('input', syncCnTog); });
  const _sel0 = S.selApp;
  S.selApp = function (a) { _sel0(a); if (a === '2') setA2Mode(S.A2M, false); else updateA2Mount(); };
  const ec = $('#edChips');
  if (ec) { ec.addEventListener('input', () => { if (S.APP === '2' && S.A2M === 'c') renderCpPrev(); }); ec.addEventListener('click', () => { if (S.APP === '2' && S.A2M === 'c') setTimeout(renderCpPrev, 0); }); }
})();
(function () {
  const t = $('#cpFmtTog'); if (!t) return;
  const tog = () => { S.cpFmt = (S.cpFmt === 'post') ? 'reels' : 'post'; syncCpFmt(); };
  t.addEventListener('click', tog);
  t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(); } });
})();
(function () {
  const t = $('#copyTog'); if (!t) return;
  const tog = () => { S.copyOn = !S.copyOn; syncCopyTog(); };
  t.addEventListener('click', tog);
  t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(); } });
})();
(function () {
  const yr = $('#cphYear');
  if (yr) yr.addEventListener('input', () => { const clean = yr.textContent.replace(/[^0-9.\-]/g, ''); if (clean !== yr.textContent) { yr.textContent = clean; if (clean) ceCaretEnd(yr); } });
  const nm = $('#cphName');
  if (nm) nm.addEventListener('input', () => { if (/[\n\r]/.test(nm.textContent)) { nm.textContent = nm.textContent.replace(/[\n\r]+/g, ' '); ceCaretEnd(nm); } });
  if (nm) {
    nm.addEventListener('blur', () => { if (!nm.textContent.trim()) nm.textContent = ''; });
  }
  [yr, nm].forEach(e => { if (e) e.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); ceBlur(e); } }); });
  [yr, nm].forEach(e => { if (e) ['input', 'blur'].forEach(ev => e.addEventListener(ev, updCphDef)); }); updCphDef();
  document.querySelectorAll('.iobtn, .ovfmt, .onoff, .file').forEach(el => { el.tabIndex = -1; });
})();
(function () {
  const trig = $('#guideTog'); if (!trig) return;
  const ORDER = ['', 'ai', 'caution', 'free'];
  const cyc = () => setGuide(ORDER[(ORDER.indexOf(S.guideMode) + 1) % ORDER.length]);
  trig.addEventListener('click', e => { e.stopPropagation(); cyc(); });
  trig.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cyc(); } });
})();
(function () {
  const trig = $('#cphPlat'); if (!trig) return;
  const ORDER = ['threads', 'youtube', 'X', 'instagram', 'none', 'custom'];
  const apply = (plat) => {
    setPlat(plat);
    updCphDef();
    if (plat === 'custom') $('#cplat').focus();
  };
  const cyc = () => { const i = (ORDER.indexOf(trig.dataset.plat) + 1) % ORDER.length; apply(ORDER[i]); };
  trig.addEventListener('click', e => { e.stopPropagation(); cyc(); });
  trig.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cyc(); } });
})();
S.opaNum = $('#opaNum');
document.querySelectorAll('#opaSeg button').forEach(b => b.onclick = () => {
  if (b.dataset.opa === 'custom') { b.classList.add('on'); S.opaNum.focus(); S.opaNum.select(); return; }
  const onCnt = document.querySelectorAll('#opaSeg button.on').length;
  if (b.classList.contains('on') && onCnt <= 1) return;
  b.classList.toggle('on');
});
S.opaNum.addEventListener('input', () => {
  let v = S.opaNum.value.replace(/[^0-9]/g, '').slice(0, 2);
  if (v !== '') v = String(Math.min(99, parseInt(v, 10)));
  if (v === '0') v = '';
  S.opaNum.value = v;
  if (v.length >= 2) S.opaNum.blur();
});
S.opaNum.addEventListener('blur', () => {
  if (!S.opaNum.value) $('#opaCustom').classList.remove('on');
});
$('#abbr').addEventListener('change', S.updateGoSpec);
(function () {
  const cycle = (wrap, skip, dir) => {
    const list = [...document.querySelectorAll(wrap + ' .ropt')].filter(b => !(skip || []).includes(b.dataset.v));
    if (!list.length) return;
    const cur = list.findIndex(b => b.classList.contains('on'));
    list[(cur + (dir || 1) + list.length) % list.length].click();
  };
  const acts = { esRsz: () => edCycleTap('esRsz'), esIe: () => { const t = $('#ieTog'); if (t) t.click(); }, esUps: () => edCycleTap('esUps'), esFill: () => edCycleTap('esFill'), esLock: () => { const t = $('#rszLock'); if (t) t.click(); },
    esPre: () => { if (S.APP !== '8') return; const t = $('#iePrecise'); if (t) t.click(); },
    esOp: () => { if (S.APP !== '8') return; const t = $('#ieOp'); if (t) t.click(); } }
  Object.keys(acts).forEach(id => {
    const el = $('#' + id); if (!el) return;
    el.addEventListener('click', e => { e.stopPropagation(); acts[id](); });
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); acts[id](); } });
  });

  document.querySelectorAll('#editCol .opt-nav').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); edStep(btn.dataset.nav, +btn.dataset.dir); });
  });

})();
S.PVZOOM = {
  h() { try { return (window.top && window.top.document) ? window.top : window; } catch (_) { return window; } },
  get() { return !!this.h().__nmPvZoom; },
  set(on) { this.h().__nmPvZoom = !!on; } };
S.pvZoomPaint = null;
S.pvZoomForced = false;
(function () {
  const btn = $('#cpZoom'), td = $('#topDock'); if (!btn || !td) return;
  const paint = on => { td.classList.toggle('dockzoom', on); btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? '미리보기 원상복귀' : '미리보기 확대'); btn.title = on ? '탭=원상복귀' : '탭=미리보기 확대 · 다시 탭=원상복귀'; };
  S.pvZoomPaint = paint;
  window.nmPvZoomSync = () => { if (!S.pvZoomForced) paint(S.PVZOOM.get()); };
  paint(S.PVZOOM.get());
  btn.addEventListener('click', () => {
    const on = !td.classList.contains('dockzoom');
    paint(on); S.PVZOOM.set(on);
    setTimeout(() => { if (typeof rszPreview === 'function') try { rszPreview(); } catch (_) {} }, 280);
  });
})();
window.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || e.defaultPrevented || S.pvZoomForced) return;
  const td = $('#topDock'), zb = $('#cpZoom');
  if (!td || !zb || !td.classList.contains('dockzoom') || document.querySelector('dialog[open]')) return;
  e.preventDefault(); e.stopPropagation();
  zb.click();
}, true);
(function () {
})();
(function () {
  const tog = cb => { if (cb) { cb.checked = !cb.checked; S.updateGoSpec(); } };
  const bind = (id, cb) => { const t = $(id); if (!t) return; t.addEventListener('click', () => tog(cb)); t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(cb); } }); };

  const bindAbbr = id => {
    const t = $(id); if (!t) return;
    let lpT = null, longed = false;
    const clr = () => { clearTimeout(lpT); lpT = null; };
    t.addEventListener('pointerdown', () => { longed = false; clr(); lpT = setTimeout(() => { longed = true; openAbbrDlg(); }, 550); });
    t.addEventListener('pointerup', clr); t.addEventListener('pointercancel', clr); t.addEventListener('pointerleave', clr);
    t.addEventListener('click', e => { if (longed) { e.preventDefault(); e.stopPropagation(); longed = false; return; } tog($('#abbr')); });
    t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog($('#abbr')); } });
    t.addEventListener('contextmenu', e => { e.preventDefault(); openAbbrDlg(); });
    t.title = '탭=ON/OFF · 길게/우클릭=축약어 등록';
  };
  bindAbbr('#gsAbbr');

  const bindBg = id => { const t = $(id); if (!t) return; const g = () => { if (!headerActive()) return; const cb = $('#cBg'); if (cb) { cb.checked = !cb.checked; S.updateGoSpec(); } }; t.addEventListener('click', g); t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); g(); } }); };
  bindBg('#gsBg');

  { const tap = (id, f) => { const e = $(id); if (!e) return; e.addEventListener('click', ev => { ev.stopPropagation(); f(); }); e.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); f(); } }); };
    tap('#gsMos', () => { const t = $('#ieTog'); if (t) t.click(); });
    tap('#gsTr', () => { if (armAfterAttach(trHandoff)) return; trHandoff(); });
    tap('#cpVidGo', () => { const r = studioRouteFn(); if (r) r('video'); });
    tap('#cpLinkGo', async () => { const r = studioRouteFn(); if (!r) return; let u = ''; try { u = ((await navigator.clipboard.readText()) || '').trim(); } catch (_) {} r('link', /^https?:\/\/\S+$/i.test(u) ? u : ''); });
  }
  { const cf = $('#cFile'); if (cf && studioRouteFn()) { cf.accept = 'image/*,video/*';
    cf.addEventListener('change', e => { const f = cf.files && cf.files[0]; if (!f || !/^video\//.test(f.type || '')) return; e.stopImmediatePropagation(); cf.value = ''; studioRouteFn()('video', f); }, true); } }
  bindAbbr('#psAbbr');
  const ovo = $('#gsOvOnly');
  if (ovo) { const f = () => { if (!S.CIMG.b64) return; S.ovOnly = !S.ovOnly; S.updateGoSpec(); }; ovo.addEventListener('click', f); ovo.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(); } }); }

  { const tap = (id, f) => { const e = $(id); if (!e) return; e.addEventListener('click', ev => { ev.stopPropagation(); f(); }); e.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); f(); } }); };
    tap('#gsPanDn', () => cpPanStep(-1)); tap('#gsPanUp', () => cpPanStep(1)); tap('#gsPanV', () => cpPanReset()); tap('#gsPanFit', () => cpPanFit()); tap('#gsPanFill', () => { S.cpFillWant = !S.cpFillWant; cpPanRailSync(); }); }

  const ops = $('#gsOpas');
  if (ops) {
    const hiIdx = () => { let k = 0; for (let j = 1; j < S.cOpaSel.length; j++) if (S.cOpaSel[j] > S.cOpaSel[k]) k = j; return k; };
    const isPeek = () => { const og = $('#gsOpaOg'); return !!(og && og.classList.contains('opa-peek')); };
    const tgt = el => { if (!isPeek()) return hiIdx(); const w = el && el.closest('.opa-slot'), i = w ? +w.dataset.i : NaN; return Number.isFinite(i) ? i : hiIdx(); };
    const flash = span => { if (!span) return; span.classList.add('opa-adjusting'); clearTimeout(span._at); span._at = setTimeout(() => span.classList.remove('opa-adjusting'), 420); };
    const adj = (d, i) => {
      if (!S.cOpaSel.length) return false;
      if (!Number.isFinite(i) || i < 0 || i >= S.cOpaSel.length) i = hiIdx();
      const nv = Math.max(0, Math.min(70, S.cOpaSel[i] + d));
      if (nv === S.cOpaSel[i]) return false;
      S.cOpaSel = S.cOpaSel.slice(); S.cOpaSel[i] = nv;
      if (isPeek()) { const s = ops.querySelector('.opa-slot[data-i="' + i + '"] .gs-opav'); if (s) { s.textContent = nv; s.dataset.v = nv; flash(s); } }
      else { const w = ops.querySelector('.opa-slot'), s = w && w.querySelector('.gs-opav'), hv = opaHi();
        if (w) w.dataset.i = hiIdx(); if (s) { s.textContent = hv; s.dataset.v = hv; flash(s); } }
      opaPaint(); renderCpPrev();
      return true;
    };
    const off = i => { if (S.cOpaSel.length > 1) { const k = Number.isFinite(i) ? i : hiIdx(); S.cOpaSel = S.cOpaSel.filter((_, j) => j !== k); opaPaint(); S.updateGoSpec(); } };
    const peekTog = () => { const og = $('#gsOpaOg'); if (!og || S.cOpaSel.length < 2) return; og.classList.toggle('opa-peek'); S.updateGoSpec(); };
    let lpT = null, longed = false;
    const clrLp = () => { clearTimeout(lpT); lpT = null; };
    ops.addEventListener('click', e => {
      if (longed) { longed = false; return; }
      const st = e.target.closest('.gsop-step'); if (st) { e.stopPropagation(); adj(+st.dataset.d, tgt(st)); return; }
      const v = e.target.closest('.gs-opav'); if (v) { if (v._moved) { v._moved = false; return; } off(tgt(v)); }
    });
    ops.addEventListener('contextmenu', e => { if (!e.target.closest('.gs-opav')) return; e.preventDefault(); peekTog(); });
    ops.addEventListener('keydown', e => {
      const st = e.target.closest('.gsop-step'); if (st && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); adj(+st.dataset.d, tgt(st)); return; }
      const v = e.target.closest('.gs-opav'); if (!v) return; const i = tgt(v);
      if (e.key === 'ArrowUp') { e.preventDefault(); adj(S.OPA_STEP, i); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); adj(-S.OPA_STEP, i); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); off(i); }
    });
    ops.addEventListener('wheel', e => { const v = e.target.closest('.gs-opav'); if (!v) return; e.preventDefault(); adj(e.deltaY < 0 ? S.OPA_STEP : -S.OPA_STEP, tgt(v)); }, { passive: false });
    let py = null, acc = 0, di = NaN;
    ops.addEventListener('pointerdown', e => {
      longed = false; clrLp();
      const v = e.target.closest('.gs-opav'); if (!v) return;
      lpT = setTimeout(() => { longed = true; peekTog(); }, 550);
      if (e.pointerType !== 'mouse') return;
      py = e.clientY; acc = 0; di = isPeek() ? tgt(v) : NaN; v._moved = false; try { v.setPointerCapture(e.pointerId); } catch (_) {}
    });
    ops.addEventListener('pointermove', e => {
      if (py === null) return; acc += (py - e.clientY); py = e.clientY;
      const v = ops.querySelector('.opa-slot[data-i="' + di + '"] .gs-opav') || ops.querySelector('.gs-opav');
      while (acc >= 12) { clrLp(); if (adj(S.OPA_STEP, di) && v) v._moved = true; acc -= 12; }
      while (acc <= -12) { clrLp(); if (adj(-S.OPA_STEP, di) && v) v._moved = true; acc += 12; }
    });
    const end = () => { py = null; di = NaN; clrLp(); };
    ops.addEventListener('pointerup', end); ops.addEventListener('pointercancel', end); ops.addEventListener('pointerleave', end);
    document.addEventListener('click', e => { if (e.target.closest('#gsOpaOg')) return; const og = $('#gsOpaOg'); if (og && og.classList.contains('opa-peek')) { og.classList.remove('opa-peek'); S.updateGoSpec(); } });
  }
})();
S._abbrPushed = false;
(function () {
  const dlg = $('#abbrDlg'); if (!dlg) return;
  const x = $('#abbrX'); if (x) x.addEventListener('click', () => closeAbbrDlg(false));
  const add = $('#abbrAdd'); if (add) add.addEventListener('click', () => { const r = abbrAddRow('', ''); const inp = r && r.querySelector('.abfrom'); if (inp) inp.focus(); });
  dlg.addEventListener('cancel', e => { e.preventDefault(); closeAbbrDlg(false); });
  dlg.addEventListener('click', e => { if (e.target === dlg) closeAbbrDlg(false); });
  window.addEventListener('popstate', () => { if (dlg.open) closeAbbrDlg(true); });
})();
if (window.visualViewport) { window.visualViewport.addEventListener('resize', abbrVV); window.visualViewport.addEventListener('scroll', abbrVV); }
$('#cBg').addEventListener('change', S.updateGoSpec);
(function () {
  const wrap = $('#opaChips'); if (!wrap) return;
  const pick = v => {
    v = parseInt(v, 10); if (!OPA_CHIPS.includes(v)) return;
    if (S.cOpaSel.includes(v)) { const rest = S.cOpaSel.filter(x => x !== v); if (rest.length) S.cOpaSel = rest; }
    else { S.cOpaSel = S.cOpaSel.length >= 2 ? [...S.cOpaSel.slice(1), v] : [...S.cOpaSel, v]; }
    opaPaint(); S.updateGoSpec();
  };
  wrap.addEventListener('click', e => { const b = e.target.closest('.ropt'); if (!b) return; e.stopPropagation(); pick(b.dataset.v); });
  wrap.addEventListener('keydown', e => { const b = e.target.closest('.ropt'); if (b && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(b.dataset.v); } });

  (function railSetup() {
    const rail = wrap; if (!rail || rail._railSet) return; rail._railSet = true;
    const navs = $('#opaRow .opa-navs');
    const upd = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      rail.classList.toggle('atStart', rail.scrollLeft <= 1);
      rail.classList.toggle('atEnd', max <= 1 || rail.scrollLeft >= max - 1);
      if (navs) { const nv = navs.querySelectorAll('.opa-nav'); if (nv[0]) nv[0].disabled = rail.scrollLeft <= 1; if (nv[1]) nv[1].disabled = max <= 1 || rail.scrollLeft >= max - 1; }
    };
    let down = false, moved = false, sx = 0, sl = 0;
    rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; rail.classList.add('grabbing'); });
    rail.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; rail.scrollLeft = sl - dx; });
    const end = () => { down = false; rail.classList.remove('grabbing'); };
    rail.addEventListener('pointerup', end); rail.addEventListener('pointerleave', end);
    rail.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    rail.addEventListener('scroll', upd, { passive: true });
    if (navs) navs.querySelectorAll('.opa-nav').forEach(btn => btn.addEventListener('click', () => rail.scrollBy({ left: (+btn.dataset.dir) * Math.max(110, rail.clientWidth * 0.7), behavior: 'smooth' })));
    rail._railUpd = upd; upd();
  })();
})();
bindFile($('#file'), $('#fileLab'), S.IMG);
S._imgPend = 0;
S._imgPendQ = [];
bindSlotImg('#cImgSlot', '#cFile', S.CIMG, ieSrcSync);
bindSlotImg('#pImgSlot', '#pFile', S.PIMG);
}
