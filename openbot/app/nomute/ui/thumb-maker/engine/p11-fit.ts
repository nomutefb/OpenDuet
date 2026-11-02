// @ts-nocheck
// 썸네일 생성기 엔진 · 자간 자동(estTracking·estHeaderTr)·잉크 글자·초과 끊기·축약·발사
//   원본 = 에디터 viewer/thumb.html 5328~5812줄(origin/main ee27c47b) — 줄 그대로 옮김 · 주석만 뺌(까닭·형 말은 원본 주석에 그대로)
//   바꾼 곳 = 화면 전역 let·var·표 const → S.<이름>(./state · 창 열 때마다 새로) · document·window·타이머 = ./rt(이 화면 뿌리 안으로 · 닫으면 다 걷음) · 함수는 그대로 내보내고 서로 가져옴
//   다시 맞출 땐 원본 줄을 통째로 다시 떼어 같은 codemod 로(손으로 고친 줄 0 · 원본 갈아 끼우는 함수 selApp·updateGoSpec = S 에 올림 · hoist())
import { S } from "./state";
import { clearTimeout, document, fetch, setTimeout } from "./rt";
import { WARN_SVG } from "./svg";
import { $ } from "./p01-core";
import { syncHdrLock } from "./p03-options";
import { rszBusyApp, rszPaintBusy } from "./p04-media";
import { jobSeqIssue, pendPut, pollJob, renderJob } from "./p07-jobs";
import { batchId, scrollQueue, thIdOf } from "./p08-results";
import { clearRestored } from "./p09-restore";
import { TRK, estTracking } from "./p10-cards";

export function _ovCharW(ch, cfg) {
  const w = S._trkChW(ch, cfg.fs, cfg.basis);
  return (w != null) ? w : (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(ch) ? cfg.H : ch === ' ' ? cfg.S : cfg.N);
}
export function _cutToFit(chars, cfg, limit, pad) {
  const n = chars.length; if (!n) return 0;
  const fl = cfg.floor / 1000 * cfg.fs;
  let s = 0, fit = 0;
  for (let m = 1; m <= n; m++) { s += _ovCharW(chars[m - 1], cfg); if (s + fl * (m - 1) + pad <= limit) fit = m; }
  return n - fit;
}
export function _inkScan(raw) {
  const s = String(raw), out = [];
  for (let i = 0; i < s.length;) {
    if (s[i] === '*') {
      let j = i; while (j < s.length && s[j] === '*') j++;
      const lit = (j - i) >= 3;
      for (let k = i; k < j; k++) out.push({ ch: '*', ink: lit });
      i = j; continue;
    }
    const cp = String.fromCodePoint(s.codePointAt(i));
    out.push({ ch: cp, ink: true }); i += cp.length;
  }
  return out;
}
export function _inkChars(raw, litStars) {
  const sc = _inkScan(raw);
  return (litStars ? sc : sc.filter(x => x.ink)).map(x => x.ch);
}
export function ovCut(lines, fmt) {
  const cfg = TRK[fmt];
  let cut = 0;
  for (const l of lines) cut = Math.max(cut, _cutToFit(_inkChars(l, false), cfg, cfg.limit, 5));
  return cut;
}
export function hdrCut(text, cfg) {
  return _cutToFit(_inkChars(text, true), cfg, cfg.avail, 0);
}
export function _fitPrefix(raw, cfg, limit, pad, litStars) {
  const sc = _inkScan(raw);
  const chars = (litStars ? sc : sc.filter(x => x.ink)).map(x => x.ch);
  const cut = _cutToFit(chars, cfg, limit, pad);
  if (!cut) return raw;
  const keep = chars.length - cut;
  let n = 0, dlm = 0, lastD = -1, out = '';
  for (const x of sc) {
    const counts = litStars || x.ink;
    if (counts) { if (n >= keep) break; n++; }
    else { dlm++; lastD = out.length; }
    out += x.ch;
  }
  if (dlm % 2 && lastD >= 0) out = out.slice(0, lastD) + out.slice(lastD + 1);
  return out;
}
export function ovFit(line, fmt) {
  const cfg = TRK[fmt];
  return _fitPrefix(line, cfg, cfg.limit, 5, false);
}
export function hdrFit(text, cfg) {
  return _fitPrefix(text, cfg, cfg.avail, 0, true);
}
export function ovTrkKey() { return effOvFmt() === 'post' ? 'post' : 'reels'; }
export function updateTrkHint(taId, hintId, fmt) {
  const el = $('#' + hintId); if (!el) return;
  const lines = ($('#' + taId).value || '').split('\n').map(s => abbrOn(s.trim())).filter(Boolean);
  const r = lines.length ? estTracking(lines, fmt) : null;
  if (!r || (!r.swept && !r.over)) { el.textContent = ''; el._icon = ''; el.classList.remove('on', 'over'); return; }
  if (r.over) { if (el._icon !== 'warn') { el.innerHTML = WARN_SVG + '<span class="trkmsg"></span>'; el._icon = 'warn'; } const c = ovCut(lines, fmt); el.querySelector('.trkmsg').textContent = c ? ` ${c}자 줄여줘 (자간 ${TRK[fmt].floor}로도 초과)` : ` 자간 ${TRK[fmt].floor}로도 초과 — 축약 필요`; el.classList.remove('on'); el.classList.add('over'); }
  else { el.textContent = `· 자간 ${r.tr} 적용`; el._icon = ''; el.classList.remove('over'); el.classList.add('on'); }
}
export const HDR = {
  sub:   { H: 60.72, S: 14.98, N: 38.94, fs: 66, avail: 960, floor: -45, basis: 'adv' },
  title: { H: 82.80, S: 20.44, N: 53.09, fs: 90, avail: 960, floor: -45, basis: 'adv' },
};
export function estHeaderTr(text, cfg) {
  if (!text) return { tr: 0, over: false };
  const chars = _inkChars(text, true);
  const w = tr => {
    let s = 0;
    for (const ch of chars) s += _ovCharW(ch, cfg);
    return s + (tr / 1000 * cfg.fs) * Math.max(chars.length - 1, 0);
  };
  const st = cfg.start ?? 0;
  if (w(st) <= cfg.avail) return { tr: st, over: false };
  for (let x = st - 1; x >= cfg.floor; x--) if (w(x) <= cfg.avail) return { tr: x, over: false };
  return { tr: cfg.floor, over: true };
}
export function renderHdrTrk(elSel, subSel, titleSel) {
  const el = $(elSel); if (!el) return;
  const s = estHeaderTr(abbrOn($(subSel).value.trim()), HDR.sub), t = estHeaderTr(abbrOn($(titleSel).value.trim()), HDR.title);
  const parts = [];

  if (s.over) { const c = hdrCut(abbrOn($(subSel).value.trim()), HDR.sub); parts.push(c ? `부제 ${c}자 줄여줘` : '부제 축약필요'); } else if (s.tr < 0) parts.push(`부제 자간${s.tr} 적용`);
  if (t.over) { const c = hdrCut(abbrOn($(titleSel).value.trim()), HDR.title); parts.push(c ? `제목 ${c}자 줄여줘` : '제목 축약필요'); } else if (t.tr < 0) parts.push(`제목 자간${t.tr} 적용`);
  el.textContent = parts.length ? '· ' + parts.join(' · ') : '';
  el._icon = '';

  el.classList.remove('on', 'over');
  if (s.over || t.over) el.classList.add('over'); else if (parts.length) el.classList.add('on');
}
export function headerActive() { return !!(($('#cSub') && $('#cSub').value.trim()) || ($('#cTitle') && $('#cTitle').value.trim())); }
export function ovLayerActive() {
  if (typeof S.A2M !== 'undefined' && S.A2M === 'c') return true;
  const t = $('#cLines'); return !!(t && t.value.split('\n').some(s => s.trim()));
}
export function effOvFmt() { return headerActive() ? 'reels' : S.ovFmt; }
export function renderOvFmt() {
  const t = $('#ovFmtTog'); if (!t) return; const f = effOvFmt(), hl = headerActive();
  t.textContent = f === 'post' ? '포스트' : '릴스';
  t.classList.toggle('post', f === 'post'); t.classList.toggle('reels', f === 'reels'); t.classList.toggle('forced', hl);
  t.setAttribute('aria-label', '오버레이 포맷 ' + t.textContent + (hl ? ' (헤더 입력 중 고정)' : ' (탭=전환)'));
  const w = $('#ovFmtWhy'); if (w && w.hidden === hl) w.hidden = !hl;
}
export function updateComboTrk() {
  renderHdrTrk('#cHdrTrk', '#cSub', '#cTitle');
  renderOvFmt();
  updateTrkHint('cLines', 'cLinesTrk', ovTrkKey());
  if (typeof S.updateGoSpec === 'function' && S.APP === '2') S.updateGoSpec();
}
export function _lineAt(v, i) {
  const s = i === 0 ? 0 : v.lastIndexOf('\n', i - 1) + 1;
  let e = v.indexOf('\n', i); if (e < 0) e = v.length;
  return v.slice(s, e);
}
export function _isOverLine(el, line) {
  const id = el.id, t = abbrOn(String(line).trim());
  if (id === 'cSub') return hdrCut(t, HDR.sub) > 0;
  if (id === 'cTitle') return hdrCut(t, HDR.title) > 0;
  return !!t && ovCut([t], (id === 'cLines') ? ovTrkKey() : 'post') > 0;
}
export function _rowOverText(el) { return _isOverLine(el, _lineAt(el.value, el.selectionStart ?? el.value.length)); }
export function _fitRow(el) {
  const v = el.value, i = el.selectionStart ?? v.length, id = el.id;
  const st = i === 0 ? 0 : v.lastIndexOf('\n', i - 1) + 1;
  let en = v.indexOf('\n', i); if (en < 0) en = v.length;
  const line = v.slice(st, en);
  if (!_isOverLine(el, line)) return v;

  let out = line;
  for (let guard = 0; guard < 64 && out.length && _isOverLine(el, out); guard++) out = out.slice(0, -1);
  return out === line ? v : v.slice(0, st) + out + v.slice(en);
}
export function _rowOverAfter(el, ins) {
  const v = el.value, a = el.selectionStart ?? v.length, b = el.selectionEnd ?? a;
  const t = String(ins), nv = v.slice(0, a) + t + v.slice(b);

  const s0 = a === 0 ? 0 : nv.lastIndexOf('\n', a - 1) + 1;
  let e0 = nv.indexOf('\n', a + t.length); if (e0 < 0) e0 = nv.length;
  for (const ln of nv.slice(s0, e0).split('\n')) if (_isOverLine(el, ln)) return true;
  return false;
}
export const _TRK_HINT_OF = { cSub: '#cHdrTrk', cTitle: '#cHdrTrk', cLines: '#cLinesTrk', lines: '#linesTrk' };
export const _PASTE_IT = { insertFromPaste: 1, insertFromPasteAsQuotation: 1, insertFromDrop: 1, insertReplacementText: 1 };
export const _PASTE_MIN_RUN = 2;
export function _blockNotice(el) {
  const sel = _TRK_HINT_OF[el.id]; if (!sel) return;
  const h = $(sel); if (!h) return;
  const MSG = ' 한도 초과';
  if (h._icon !== 'warn') { h.innerHTML = WARN_SVG + '<span class="trkmsg"></span>'; h._icon = 'warn'; }
  const m = h.querySelector('.trkmsg');

  if (m && m.textContent !== MSG) m.textContent = MSG;
  if (h.classList.contains('on')) h.classList.remove('on');
  if (!h.classList.contains('over')) h.classList.add('over');
}
export function bindOverClamp(sel) {
  const el = $(sel); if (!el) return;

  let composing = false, snap = el.value, preOver = false, pasteThru = false, pasteSeen = false;
  const sync = () => { snap = el.value; preOver = false; };
  el.addEventListener('focus', () => { composing = false; sync(); });

  ['paste', 'drop'].forEach(ev => el.addEventListener(ev, () => { pasteSeen = true; setTimeout(() => { pasteSeen = false; }, 0); }, true));
  el.addEventListener('compositionstart', () => { composing = true; snap = el.value; preOver = _rowOverText(el); });
  el.addEventListener('beforeinput', e => {

    if (pasteSeen || (e.inputType && _PASTE_IT[e.inputType]) || e.dataTransfer) { pasteThru = true; preOver = false; snap = el.value; return; }
    if (composing) return;
    if (!e.isTrusted || !e.inputType || !e.inputType.startsWith('insert')) return;
    if (e.inputType === 'insertLineBreak' || e.inputType === 'insertParagraph') { sync(); return; }
    snap = el.value;

    const ins = (e.data != null) ? e.data : (e.dataTransfer ? (e.dataTransfer.getData('text') || '') : '');
    preOver = _rowOverAfter(el, ins);
    if (preOver) {
      e.preventDefault(); _blockNotice(el);

      if (ins.length > 1) {
        const a = el.selectionStart ?? el.value.length, b = el.selectionEnd ?? a;
        let take = ins;
        for (let g = 0; g < 512 && take.length && _rowOverAfter(el, take); g++) take = take.slice(0, -1);
        if (take.length) {
          el.value = el.value.slice(0, a) + take + el.value.slice(b);
          try { el.setSelectionRange(a + take.length, a + take.length); } catch (_) {}
          el.dispatchEvent(new Event('input', { bubbles: true }));
          _blockNotice(el);
        }
      }
    }
  });
  const clamp = () => {

    if (el.value.length <= snap.length) { if (!composing) sync(); return; }

    if (el.value.length - snap.length >= _PASTE_MIN_RUN) { if (!composing) sync(); return; }

    if (el.value.split('\n').length > snap.split('\n').length) { if (!composing) sync(); return; }
    const fixed = _fitRow(el);

    const _p0 = Math.min(el.selectionStart ?? snap.length, snap.length);
    const target = _isOverLine(el, _lineAt(snap, _p0)) ? snap : fixed;
    if (target !== el.value) {
      const fixed2 = target;
      const p = Math.min(el.selectionStart ?? fixed2.length, fixed2.length);
      el.value = fixed2;
      try { el.setSelectionRange(p, p); } catch (_) {}
      preOver = false;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      _blockNotice(el);
      return;
    }
    if (!composing) sync();
  };

  el.addEventListener('input', e => {
    if (!e.isTrusted) { if (!composing) sync(); return; }
    if (pasteThru) { pasteThru = false; sync(); return; }
    clamp();
  });
  el.addEventListener('compositionend', () => { composing = false; clamp(); });
}
export function syncCTpl() {
  const t = $('#cTplTog'); if (!t) return;
  const _mut = S.cLogoOff;
  t.textContent = _mut ? '없음' : '노뮤트';
  t.classList.toggle('tplnm', !_mut); t.classList.toggle('tplmut', _mut);
  t.setAttribute('aria-label', '템플릿 ' + t.textContent);
  syncHdrLock();
  if (typeof updateComboTrk === 'function') updateComboTrk();
}
export function jobLabel() {
  if (S.APP === '1') return '포스트';
  if (S.APP === '2') return '릴스';
  if (S.APP === '3') return '저작권';
  if (S.APP === '5') return '카드뉴스';
  return '제작';
}
export const ABBR_BUILTIN = [['...', '⋯'], ['•', '·'], ['이,', '李,'], ['윤,', '尹,'], ['미,', '美,'], ['중,', '中,'], ['북,', '北,']];
export const ABBR_STANDALONE = new Set(['이,', '윤,', '미,']);
export const ABBR_LINESTART = new Set(['중,', '북,']);
export function abbrCustom() { try { const a = JSON.parse(localStorage.getItem(S.ABBR_KEY) || '[]'); return Array.isArray(a) ? a.filter(p => p && p.from) : []; } catch { return []; } }
export const _abbrEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function abbrStandalone(s, from, to) {
  const re = new RegExp('(^|[^가-힣])' + _abbrEsc(from), 'g'), rep = '$1' + to;
  let prev; do { prev = s; s = s.replace(re, rep); } while (s !== prev);
  return s;
}
export function abbrLineStart(s, from, to) {
  const re = new RegExp('(^|\n)(\\**)' + _abbrEsc(from), 'g');
  return String(s).replace(re, '$1$2' + to);
}
export function abbrOn(s) { try { const c = $('#abbr'); return (c && c.checked) ? abbr(s) : String(s); } catch (_) { return String(s); } }
export function abbr(s) {
  let out = String(s);
  for (const [from, to] of ABBR_BUILTIN) out = ABBR_LINESTART.has(from) ? abbrLineStart(out, from, to) : ABBR_STANDALONE.has(from) ? abbrStandalone(out, from, to) : out.split(from).join(to);
  for (const p of abbrCustom()) out = out.split(String(p.from)).join(String(p.to == null ? '' : p.to));
  return out;
}
export function goFire(yellow) {
  const gb = document.getElementById('go'); if (!gb) return;
  if (!gb.dataset.label) gb.dataset.label = gb.textContent;
  clearTimeout(gb._fT1); clearTimeout(gb._fT2); clearTimeout(gb._fT3); clearTimeout(gb._errT);
  gb.classList.remove('firing', 'okdone', 'checking', 'err', 'warn', 'shake', 'spelling', 'fy', 'spell-arm'); void gb.offsetWidth;
  gb.classList.add('firing'); if (yellow) gb.classList.add('fy'); gb.textContent = '전송중…'; gb.setAttribute('aria-busy', 'true');
  gb._fT1 = setTimeout(() => {
    gb.classList.remove('firing'); gb.classList.add('okdone', 'checking');
    gb.innerHTML = '<svg class="gck" viewBox="0 0 24 24" role="img" aria-label="전송됨"><path d="M5 13l4 4L19 7"/></svg>';
    gb.removeAttribute('aria-busy');
    gb._fT2 = setTimeout(() => {
      gb.classList.remove('checking', 'okdone', 'fy');
      if (gb._rszBusy && rszBusyApp()) { rszPaintBusy(gb); return; }
      gb.textContent = gb.dataset.label || '생성';
    }, 560);
  }, 900);
}
export function dispatchJob(endpoint, payload, label, src, reuse) {

  if (src && payload && payload.imageB64) src.bg = 1;
  if ((endpoint === '/api/thumb' || endpoint === '/api/compose') && src && payload && !payload.src) { const { imgKey, imgName, ...rest } = src; payload.src = label ? Object.assign(rest, { lbl: label }) : rest; }
  goFire(S._spellApplied);
  clearRestored();
  let job;
  if (reuse) { job = reuse; Object.assign(job, { t0: Date.now(), outs: [], done: [], status: 'run', msg: '', endpoint, payload, src }); delete job._queued; delete job.partErr; delete job._next; job._ready = {}; job.saves = []; renderJob(job); }
  else { job = { n: jobSeqIssue(), label: label || '제작', t0: Date.now(), outs: [], done: [], status: 'run', msg: '', endpoint, payload, src }; S.JOBS.unshift(job); renderJob(job); }
  if (payload && payload.src && job.n != null) payload.src.jn = job.n;
  if (!reuse) scrollQueue();
  (async () => {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await res.json();
      if (!res.ok || j.error) { job.status = 'err'; job.msg = (j.error || ('서버 ' + res.status)); renderJob(job); return; }
      job.outs = j.outs || (j.out ? [{ path: j.out, label: '' }] : []);
      job.thid = j.id || thIdOf((job.outs[0] || {}).path) || '';
      pendPut(job);
      job.done = job.outs.map(() => false);
      if (!job.outs.length) { job.status = 'err'; job.msg = '출력 경로 없음'; renderJob(job); return; }
      pollJob(job);
    } catch (e) { job.status = 'err'; job.msg = '요청 실패: ' + e.message; renderJob(job); }
  })();
}
export function dispatchBatch(items, batchLabel, src, reuse) {
  if (!items || !items.length) return;
  if (items.length === 1) { dispatchJob(items[0].endpoint, items[0].payload, items[0].label, src, reuse); return; }
  src = Object.assign({}, src || {}, { bid: batchId() });
  if (items.some(it => it && it.payload && it.payload.imageB64)) src.bg = 1;
  goFire(S._spellApplied); clearRestored();
  let job;
  if (reuse) { job = reuse; Object.assign(job, { t0: Date.now(), outs: [], done: [], status: 'run', msg: '', batch: items, src, thids: [], bid: src.bid }); delete job._queued; delete job.partErr; delete job.errTags; delete job._next; job._ready = {}; job.saves = []; renderJob(job); }
  else { job = { n: jobSeqIssue(), label: batchLabel, t0: Date.now(), outs: [], done: [], status: 'run', msg: '', batch: items, src, thids: [], bid: src.bid }; S.JOBS.unshift(job); renderJob(job); }
  if (!reuse) scrollQueue();
  const _bn = items.filter(x => x && x.endpoint === '/api/thumb').length;
  (async () => {
    const groups = await Promise.all(items.map(async (it, bi) => {
      const payload = it.payload;
      if ((it.endpoint === '/api/thumb' || it.endpoint === '/api/compose') && src && payload && !payload.src) { const { imgKey, imgName, ...rest } = src; payload.src = Object.assign(rest, { bi, jn: job.n }, it.label ? { lbl: it.label } : {}); }
      if (it.endpoint === '/api/thumb' && payload && payload.src) Object.assign(payload.src, { bid: src.bid, bn: _bn });
      try {
        const res = await fetch(it.endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
        const j = await res.json();
        if (!res.ok || j.error) return { err: (it.tag || it.label) + ': ' + (j.error || ('서버 ' + res.status)) };
        const outs = j.outs || (j.out ? [{ path: j.out, label: '' }] : []);
        if (!outs.length) return { err: (it.tag || it.label) + ': 출력 경로 없음' };
        if (j.id) { if (!job.thids.includes(j.id)) job.thids.push(j.id); if (!job.thid) job.thid = j.id; }
        return { id: j.id, outs: outs.map(o => ({ path: o.path, label: it.tag + (o.label ? ' ' + o.label : '') })) };
      } catch (e) { return { err: (it.tag || it.label) + ': 요청 실패 ' + e.message }; }
    }));
    const okGroups = groups.filter(g => g && g.outs);
    const errs = groups.filter(g => g && g.err).map(g => g.err);
    job.outs = okGroups.flatMap(g => g.outs);
    job.thids = groups.map(g => g && g.id).filter(Boolean);
    job.thid = job.thids[0] || thIdOf((job.outs[0] || {}).path) || '';
    job.done = job.outs.map(() => false);
    if (!job.outs.length) { job.status = 'err'; job.msg = errs.join(' · ') || '출력 경로 없음'; renderJob(job); return; }
    job.errTags = items.filter((it, bi) => groups[bi] && groups[bi].err).map(it => it.tag || it.label);
    if (errs.length) job.partErr = errs.join(' · ');
    pendPut(job);
    pollJob(job);
  })();
}

export function start() {
$('#lines').addEventListener('input', () => updateTrkHint('lines', 'linesTrk', 'post'));
try { document.fonts && document.fonts.ready.then(() => { try { if (typeof updateComboTrk === 'function') updateComboTrk(); updateTrkHint('lines', 'linesTrk', 'post'); } catch (_) {} }); } catch (_) {}
$('#cSub').addEventListener('input', updateComboTrk);
$('#cTitle').addEventListener('input', updateComboTrk);
$('#cLines').addEventListener('input', updateComboTrk);
['#cSub', '#cTitle', '#cLines', '#lines'].forEach(bindOverClamp);
(function () {
  const t = $('#ovFmtTog'); if (!t) return;
  const tog = () => { if (headerActive()) { t.classList.remove('shake'); void t.offsetWidth; t.classList.add('shake'); return; } S.ovFmt = (S.ovFmt === 'post') ? 'reels' : 'post'; updateComboTrk(); };
  t.addEventListener('animationend', () => t.classList.remove('shake'));
  t.addEventListener('click', tog);
  t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(); } });
})();
S.cTpl = 'nomute';
S.cLogoOff = false;
S._goLock = false;
S.ABBR_KEY = 'nomute_thumb_abbr';
}
