// @ts-nocheck
// 썸네일 생성기 엔진 · 맞춤법 자동 교정·자가 학습·모자이크(편집)
//   원본 = 에디터 viewer/thumb.html 5813~6096줄(origin/main c430e4c9f) — 줄 그대로 옮김 · 주석만 뺌(까닭·형 말은 원본 주석에 그대로)
//   바꾼 곳 = 화면 전역 let·var·표 const → S.<이름>(./state · 창 열 때마다 새로) · document·window·타이머 = ./rt(이 화면 뿌리 안으로 · 닫으면 다 걷음) · 함수는 그대로 내보내고 서로 가져옴
//   다시 맞출 땐 ../tools/codemod.mjs 로 원본 줄을 통째로 다시 뗌(손으로 고친 줄 0 · 원본 갈아 끼우는 함수 selApp·updateGoSpec = S 에 올림 · hoist())
import { S } from "./state";
import { clearInterval, clearTimeout, document, fetch, setInterval, setTimeout, window } from "./rt";
import { DOWNLOAD_SVG } from "./svg";
import { $, iePrevSync } from "./p01-core";
import { renderCpPrev } from "./p02-preview";
import { REUSE_SVG } from "./p04-media";
import { reattachSrc } from "./p08-results";
import { errStatus } from "./p13-fire";

export function spellTargets() {
  if (S.APP === '1') return [$('#lines')];
  if (S.APP === '2') return (S.A2M === 'c' ? [$('#cSub'), $('#cTitle')] : [$('#cSub'), $('#cTitle'), $('#cLines')]).concat(S.guideMode ? [$('#warnLines')] : []);
  if (S.APP === '3' && S.guideMode) return [$('#warnLines')];
  return [];
}
export function setSHC(healthy, reason) {
  try { localStorage.setItem('nomute_shc', JSON.stringify({ healthy: !!healthy, ts: Date.now(), reason: reason || '' })); } catch {}
}
export function clearSpellReview() {
  S._spellReview = null;
  const c = $('#spellChips'); if (c) { c.hidden = true; c.innerHTML = ''; }
  const gb = $('#go'); if (gb) gb.classList.remove('spell-arm');
}
export const spellAnyLit = () => !!(S._spellReview && S._spellReview.fields.some(f => f.corrections.some(c => c.lit)));
export const chipLabel = s => { let x = String(s).replace(/^\*+|\*+$/g, '').trim() || String(s); return x.length > 16 ? x.slice(0, 15) + '…' : x; };
export function paintGoReview() {
  const gb = $('#go'); if (!gb) return;
  const lit = spellAnyLit();
  gb.classList.toggle('spell-arm', lit);
  gb.textContent = lit ? '재확인' : '생성';
}
export function renderSpellChips() {
  const c = $('#spellChips'); if (!c) return;
  c.innerHTML = ''; let any = false;
  if (S._spellReview) S._spellReview.fields.forEach(f => f.corrections.forEach(cr => {
    any = true;
    const el = document.createElement('button'); el.type = 'button';
    el.className = 'spchip' + (cr.lit ? ' on' : ''); el.textContent = chipLabel(cr.to);
    el.addEventListener('click', () => { cr.lit = !cr.lit; el.classList.toggle('on', cr.lit); paintGoReview(); });
    c.appendChild(el);
  }));
  c.hidden = !any;
}
export const CONFUSE_PAIRS = [
  ['획정', '확정'],
];
export const _TERM_TAIL = /^[ \t]?(?:기본법|법안|법(?=[\s.,)·」』"'은는이가을를의에과와도]|$)|Act\b|안전연구소|연구소|연구원|협회|위원회|서밋|미래기획수석)/;
export const _TERM_KEEP_B = /(오픈|오픈 |엑스|스케일|미스트랄|미스트랄 |스태빌리티|캐릭터|퓨리오사|마음|갤럭시|갤럭시 |Meta |Google )$/i;
export const _termQuoted = (str, off, len) => { if ((str.match(/"/g) || []).length % 2) return true;
  const b = str.slice(0, off);
  for (const m of str.matchAll(/(^|[^A-Za-z0-9])('[^'\n]+'(?![A-Za-z0-9])|‘[^’\n]+’)/g)) { const s0 = m.index + m[1].length; if (s0 <= off && off + len <= s0 + m[2].length) return true; }
  const q = (b.match(/"/g) || []).length % 2 === 1; const open = (o, c) => b.lastIndexOf(o) > b.lastIndexOf(c); return q || open('“', '”') || open('『', '』') || open('「', '」'); };
export const TERM_SWAP_ON = false;
export const termSwap = (s, t) => String(s).replace(t.re, (m, p, off, str) => { const at = off + p.length; return (t.keep(str.slice(0, at), str.slice(off + m.length)) || _termQuoted(str, at, m.length - p.length)) ? m : p + t.to; });
export const termGuard = s => /조류\s?인플루엔자|조류\s?독감|고병원성\s?(?:AI|조류)|avian\s+influenza|bird\s+flu|H[57]N\d|초지능|[슈수]퍼\s?(?:지능|인텔리전스)|초인공지능|super\s*-?\s*intelligence/i.test(s) || /(^|[^A-Za-z0-9_.@/#\-])SI(?![A-Za-z0-9_@]|\.[A-Za-z0-9])(?![)）\]]?[ \t]*(?:업체|사업|기업|계열|단위|시스템))/.test(s.replace(/시스템\s?통합\s?[(（]SI[)）]|system\s+integration\s*[(（]SI[)）]/gi, ' '));
export const _LEARN_KEY = 'nomute_spell_learned';
export const _LEARN_CAP = 400;
export const _SPELL_FIELDS = ['lines', 'cSub', 'cTitle', 'cLines', 'warnLines'];
export function loadLearned() { try { const o = JSON.parse(localStorage.getItem(_LEARN_KEY) || '{}'); return (o && typeof o === 'object') ? o : {}; } catch { return {}; } }
export function saveLearned(m, delta) { try { const e = Object.entries(m); localStorage.setItem(_LEARN_KEY, JSON.stringify(e.length > _LEARN_CAP ? Object.fromEntries(e.slice(e.length - _LEARN_CAP)) : m)); } catch {} if (delta && Object.keys(delta).length) { const p = learnPend(); Object.keys(delta).forEach(k => { delete p[k]; p[k] = delta[k]; }); const ks = Object.keys(p); if (ks.length > _LEARN_CAP) ks.slice(0, ks.length - _LEARN_CAP).forEach(k => { delete p[k]; }); if (learnPendSave(p)) flushLearned(); else fetch('api/mapsync', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ file: 'spell', set: delta }) }).catch(() => {}); } }
export const _LEARN_PEND_KEY = 'nomute_spell_pend';
export function learnPend() { try { const o = JSON.parse(localStorage.getItem(_LEARN_PEND_KEY) || '{}'); return (o && typeof o === 'object' && !Array.isArray(o)) ? o : {}; } catch { return {}; } }
export function learnPendSave(p) { try { localStorage.setItem(_LEARN_PEND_KEY, JSON.stringify(p)); return true; } catch { return false; } }
export async function flushLearned() {
  if (S._learnFlushing) return; S._learnFlushing = true;
  try {
    const p = learnPend(), keys = Object.keys(p).slice(0, 50);
    if (!keys.length) return;
    const set = {}; keys.forEach(k => { set[k] = p[k]; });
    const sig = (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? AbortSignal.timeout(12000) : null;
    let r, j;
    try { r = await fetch('api/mapsync', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ file: 'spell', set }), ...(sig ? { signal: sig } : {}) }); j = await r.json().catch(() => ({})); }
    catch { return; }
    const perm = !r.ok && r.status >= 400 && r.status < 500 && r.status !== 401 && r.status !== 403 && r.status !== 408 && r.status !== 409 && r.status !== 429;
    if (!(r.ok && j && j.ok) && !perm) return;
    const cur = learnPend(); keys.forEach(k => { if (cur[k] === set[k]) delete cur[k]; }); learnPendSave(cur);
  } finally { S._learnFlushing = false; }
}
export function spellPairs() { const L = loadLearned(); return CONFUSE_PAIRS.concat(Object.keys(L).map(k => [k, L[k]])); }
export function _jamo(s) { const out = []; for (const ch of s) { const o = ch.charCodeAt(0) - 0xAC00; out.push((o >= 0 && o < 11172) ? [Math.floor(o / 588), Math.floor((o % 588) / 28), o % 28] : [ch]); } return out; }
export function _jamoDist(a, b) { if (a.length !== b.length) return 9; const ja = _jamo(a), jb = _jamo(b); let d = 0; for (let i = 0; i < ja.length; i++) { const x = ja[i], y = jb[i]; if (x.length !== 3 || y.length !== 3) { if (x[0] !== y[0]) d += 2; } else { for (let k = 0; k < 3; k++) if (x[k] !== y[k]) d++; } } return d; }
export function _learnFromEdit(before, after) {
  if (before == null || before === after) return;
  const A = before.match(/[가-힣]{2,}/g) || [], B = after.match(/[가-힣]{2,}/g) || [];
  if (!A.length || A.length !== B.length) return;
  let bad = null, good = null, n = 0;
  for (let i = 0; i < A.length; i++) if (A[i] !== B[i]) { bad = A[i]; good = B[i]; if (++n > 1) return; }
  if (!bad || bad.length !== good.length || bad.length < 2) return;
  const jd = _jamoDist(bad, good); if (jd === 0 || jd > 2) return;
  const m = loadLearned(); if (m[bad] === good) return; m[bad] = good; saveLearned(m, { [bad]: good });
  try { const st = $('#status'); if (st) { st.classList.add('ok'); st.classList.remove('err'); st.textContent = '맞춤법 기억: ‘' + bad + '’ → ‘' + good + '’'; setTimeout(() => { if (st.textContent.indexOf('맞춤법 기억') === 0) { st.textContent = ''; st.classList.remove('ok'); } }, 2600); } } catch {}
}
export async function runSpellCheck() {
  const els = spellTargets().filter(Boolean);
  els.forEach(el => { if (el._spSnap != null && el._spSnap !== el.value) { _learnFromEdit(el._spSnap, el.value); el._spSnap = el.value; } });
  const texts = els.map(el => el.value || '');
  if (!texts.some(t => t.trim())) return false;
  const gb = $('#go');
  if (gb) { if (!gb.dataset.label) gb.dataset.label = gb.textContent; gb.classList.add('spelling'); gb.setAttribute('aria-busy', 'true'); gb.textContent = '확인중…'; }
  let res;
  try {
    const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 12000);
    try { const r = await fetch('/api/spellcheck', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ texts }), signal: ctrl.signal }); if (r.ok) res = await r.json(); } finally { clearTimeout(to); }
  } catch {}
  finally { if (gb) { gb.classList.remove('spelling'); gb.removeAttribute('aria-busy'); gb.textContent = gb.dataset.label || '생성'; } }

  const naverOk = !!(res && res.ok && Array.isArray(res.corrected));
  if (res && res.ok === false) setSHC(false, res.error || 'backend');
  else if (naverOk) setSHC(true);
  const fields = [];
  els.forEach((el, i) => {
    const orig = texts[i]; if (!orig) return;
    let corrected = orig; const corrs = [];
    if (naverOk) {
      const nc = (typeof res.corrected[i] === 'string') ? res.corrected[i] : orig;
      const corr = (res.corrections && res.corrections[i]) || [];
      if (corr.length) { corr.forEach(c => corrs.push({ from: c.from, to: c.to, lit: true })); corrected = nc; }
      else if (nc !== orig) { corrs.push({ from: orig, to: nc, lit: true }); corrected = nc; }
    }

    for (const [bad, good] of spellPairs()) {
      if (orig.includes(bad) && !corrs.some(c => c.from === bad)) { corrs.push({ from: bad, to: good, lit: true }); corrected = corrected.split(bad).join(good); }
    }
    const base = corrected;
    if (TERM_SWAP_ON && el.id !== 'warnLines' && !termGuard(texts.join('\n'))) for (const t of S.TERM_PAIRS) {
      const nx = termSwap(corrected, t);
      if (nx !== corrected) { corrs.push({ from: t.from, to: t.to, lit: true, term: t }); corrected = nx; }
    }
    if (corrs.length) fields.push({ el, original: orig, base, corrected, corrections: corrs });
  });
  if (!fields.length) return false;
  S._spellReview = { fields };
  return true;
}
export function applySpellReview() {
  S._spellApplied = false;
  if (!S._spellReview) return;
  S._applyingSpell = true;
  S._spellReview.fields.forEach(f => {
    const lits = f.corrections.filter(c => c.lit);
    let val;
    if (!lits.length) val = f.original;
    else if (lits.length === f.corrections.length) val = f.corrected;
    else {
      const fixes = f.corrections.filter(c => !c.term), litFix = fixes.filter(c => c.lit);
      if (litFix.length === fixes.length) val = f.base; else { val = f.original; litFix.forEach(c => { val = val.replace(c.from, c.to); }); }
      lits.filter(c => c.term).forEach(c => { val = termSwap(val, c.term); });
    }
    if (lits.length) S._spellApplied = true;
    if (val !== f.el.value) { f.el.value = val; f.el.dispatchEvent(new Event('input', { bubbles: true })); }
  });
  S._applyingSpell = false;
  clearSpellReview();
}
export function ieReset() {
  S.IE.id = ''; S.IE.items = []; S.IE.sel.clear(); S.IE.meta = null; S.IE.phase = 'idle'; S.IE.busy = false; S.IE.autoFind = false;
  if (S.IE.poll) { clearInterval(S.IE.poll); S.IE.poll = null; }
  const rz = $('#ieResult'); if (rz) { rz.classList.add('none'); rz.innerHTML = ''; }
}
export function ieSyncGo() {
  if (S.APP !== '8') return;
  const gb = $('#go'); if (!gb) return;
  let lbl;

  if (S.IE.busy) lbl = '준비중…';
  else if (!S.CIMG.b64) lbl = '생성';
  else lbl = '제작';
  gb.dataset.label = lbl; gb.textContent = lbl;
  gb.classList.toggle('rszbusy', !!S.IE.busy);
}
export function ieBoxesHTML() {
  if (S.APP !== '8' || !S.IE.items.length) return '';
  const mw = (S.IE.meta && S.IE.meta.w) || 1, mh = (S.IE.meta && S.IE.meta.h) || 1;
  return S.IE.items.map(it => {
    const b = it.box, on = S.IE.sel.has(it.id);
    return '<button type="button" class="ie-box' + (on ? ' on' : '') + '" data-id="' + it.id + '" title="' + it.label + '" style="left:' + (b[0] / mw * 100).toFixed(2) + '%;top:' + (b[1] / mh * 100).toFixed(2) + '%;width:' + (b[2] / mw * 100).toFixed(2) + '%;height:' + (b[3] / mh * 100).toFixed(2) + '%"><span class="ie-bn">' + it.id + '</span></button>';
  }).join('');
}
export function ieBindBoxes(root) {
  root.querySelectorAll('.ie-box').forEach(el => el.onclick = () => { const id = +el.dataset.id; if (S.IE.sel.has(id)) S.IE.sel.delete(id); else S.IE.sel.add(id); ieRender(); });
}
export function ieRender() {
  if (S.APP !== '8') return;
  if (S.CIMG.b64 && S.CIMG.b64 !== S.IE.lastImg) {
    S.IE.lastImg = S.CIMG.b64; ieReset();
  }
  const stage = $('#ieStage'), hint = $('#ieHint'), opts = $('#ieOpts');
  if (hint) hint.classList.toggle('none', !!(S.CIMG.b64 && S.IE.items.length));
  if (stage) { stage.classList.add('none'); stage.innerHTML = ''; }
  opts.classList.toggle('none', !(S.CIMG.b64 && S.IE.items.length));
  iePrevSync(); renderCpPrev();
  ieSyncGo();

  if (S.CIMG.b64 && !S.IE.busy && !S.IE.autoFind && !S.IE.items.length) { S.IE.autoFind = true; ieFind(); }
}
export function ieBusy(on, phase) { S.IE.busy = on; if (phase) S.IE.phase = phase; ieSyncGo(); if (S.APP === '8') renderCpPrev(); }
export function ieGo() {
  if (S.IE.busy) return;
  if (!S.CIMG.b64) return errStatus('입력 필요', 'err', '.cpprev-box');
  if (!S.IE.items.length) return ieFind();
  return ieRenderGo();
}
export async function ieFind() {
  ieBusy(true, 'finding');
  try {
    const r = await fetch('/api/imgedit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fileB64: S.CIMG.b64, name: S.CIMG.name }) }).then(x => x.json());
    if (!r.ok) { ieBusy(false, 'idle'); return errStatus('재시도'); }
    S.IE.id = r.id; iePoll('boxes');
  } catch { ieBusy(false, 'idle'); errStatus('재시도'); }
}
export async function ieRenderGo() {
  if (!S.IE.sel.size && S.IE.op !== 'cutout') return errStatus('선택 필요', 'warn');
  ieBusy(true, 'rendering');

  S.IE.preTs = ''; S.IE.preErr = '';
  try { const pr = await fetch('imgedit_out/' + S.IE.id + '/result.json?t=' + Date.now()); if (pr.ok) { const pj = await pr.json(); S.IE.preTs = pj.ts || ''; } } catch {   }
  try { const pe = await fetch('imgedit_out/' + S.IE.id + '/error.log?t=' + Date.now()); if (pe.ok) { const t = (await pe.text()).trim(); if (t && t[0] !== '<') S.IE.preErr = t; } } catch {   }
  const opts = { pxw: S.IE.pxw, pxh: S.IE.pxw, size: 1.15, feather: 5, shape: S.IE.shape };
  try {
    const r = await fetch('/api/imgedit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ render: { id: S.IE.id, targets: [...S.IE.sel], opts, precise: S.IE.precise, op: S.IE.op } }) }).then(x => x.json());
    if (!r.ok) { ieBusy(false, 'found'); return errStatus('재시도'); }
    iePoll('result');
  } catch { ieBusy(false, 'found'); errStatus('재시도'); }
}
export function iePoll(kind) {
  if (S.IE.poll) clearInterval(S.IE.poll);
  const t0 = Date.now(), file = kind === 'boxes' ? 'boxes.json' : 'result.json';

  const limit = (kind !== 'boxes' && (S.IE.precise || S.IE.op === 'cutout')) ? 1200000 : 600000;
  S.IE.poll = setInterval(async () => {
    if (Date.now() - t0 > limit) { clearInterval(S.IE.poll); S.IE.poll = null; ieBusy(false, kind === 'boxes' ? 'idle' : 'found'); return errStatus('다시 시도'); }

    try { const er = await fetch('imgedit_out/' + S.IE.id + '/error.log?t=' + Date.now()); if (er.ok) { const tx = (await er.text()).trim(); if (tx && tx[0] !== '<' && (kind === 'boxes' || tx !== S.IE.preErr)) { clearInterval(S.IE.poll); S.IE.poll = null; ieBusy(false, kind === 'boxes' ? 'idle' : 'found'); return errStatus(tx.slice(0, 120)); } } } catch {   }
    try {
      const r = await fetch('imgedit_out/' + S.IE.id + '/' + file + '?t=' + Date.now()); if (!r.ok) return; const j = await r.json();
      if (kind === 'boxes') {
        if (!Array.isArray(j.items)) return;
        clearInterval(S.IE.poll); S.IE.poll = null;
        S.IE.items = j.items; S.IE.meta = j.meta || {}; S.IE.sel = new Set(j.items.filter(i => i.kind === 'face').map(i => i.id)); ieBusy(false, 'found');
        if (!S.IE.items.length && S.IE.op !== 'cutout') errStatus('인물 없음', 'warn');
        ieRender();
        if (S.IE.op === 'cutout') return ieRenderGo();
      } else {
        if (!j.ts || j.ts === S.IE.preTs) return;
        clearInterval(S.IE.poll); S.IE.poll = null;
        if (j.error) { ieBusy(false, 'found'); return errStatus(String(j.error).slice(0, 120)); }
        if (!j.url) { ieBusy(false, 'found'); return errStatus('재시도'); }
        ieBusy(false, 'done'); ieShowResult(j.url);
      }
    } catch {   }
  }, 5000);
}
export function ieShowResult(url) {
  const u = /^https?:/.test(url) ? url : (url + '?t=' + Date.now());
  const nm = S.IE.op === 'cutout' ? '누끼.png' : '모자이크.jpg', alt = S.IE.op === 'cutout' ? '누끼 결과' : '모자이크 결과';
  $('#ieResult').innerHTML = '<img class="ie-res-img" src="' + u + '" alt="' + alt + '"><button type="button" class="imgdl ie-res-use" aria-label="소스로 재첨부" title="이 결과를 소스로 재첨부">' + REUSE_SVG + '</button><a class="dlbtn imgdl ie-res-dl" href="' + u + '" download="' + nm + '" target="_blank" rel="noopener" aria-label="저장">' + DOWNLOAD_SVG + '</a>';
  const ub = $('#ieResult .ie-res-use'); if (ub) ub.onclick = e => { e.preventDefault(); e.stopPropagation(); reattachSrc(u, nm, ub); };
  $('#ieResult').classList.remove('none');
  $('#ieResult').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export function start() {
S.TERM_PAIRS = [
  { from: 'AI', to: 'SI', re: /(^|[^A-Za-z0-9_.@/#\-])AI(?![A-Za-z0-9_@]|\.[A-Za-z0-9]|타임스)/g, keep: (b, a) => _TERM_KEEP_B.test(b) || /(^|[^A-Za-z0-9])[A-Z][a-z]+[ \t]$/.test(b) || (/LG ?$/.test(b) && /^ ?연구원/.test(a)) || _TERM_TAIL.test(a) },
  { from: '인공지능', to: '초지능', re: /()인공지능/g, keep: (b, a) => /[초강약용#]$/.test(b) || _TERM_TAIL.test(a) },
];
S._learnFlushing = false;
window.addEventListener('online', () => flushLearned());
(async () => { try { const r = await fetch('spell-learned.json?_=' + Date.now()); if (!r.ok) return; const srv = await r.json(); if (!srv || typeof srv !== 'object' || Array.isArray(srv)) return; const local = loadLearned(); const merged = { ...srv, ...local }; if (JSON.stringify(merged) !== JSON.stringify(local)) saveLearned(merged); } catch {   } finally { flushLearned(); } })();
document.addEventListener('focusin', e => { const el = e.target; if (el && _SPELL_FIELDS.indexOf(el.id) >= 0) el._spSnap = el.value; }, true);
document.addEventListener('focusout', e => { const el = e.target; if (el && _SPELL_FIELDS.indexOf(el.id) >= 0) { _learnFromEdit(el._spSnap, el.value); el._spSnap = el.value; } }, true);
S.IE = { id: '', items: [], sel: new Set(), meta: null, phase: 'idle', busy: false, poll: null, lastImg: '', pxw: 9, shape: 'ellipse', precise: true, op: 'mosaic', autoFind: false };
(function () {
  document.querySelectorAll('.ie-px').forEach(el => el.addEventListener('click', () => { S.IE.pxw = +el.dataset.px; document.querySelectorAll('.ie-px').forEach(x => x.classList.toggle('on', x === el)); }));
  const sh = $('#ieShape'); if (sh) sh.addEventListener('click', () => { S.IE.shape = S.IE.shape === 'ellipse' ? 'rect' : 'ellipse'; sh.textContent = S.IE.shape === 'ellipse' ? '타원' : '네모'; sh.classList.toggle('on', S.IE.shape === 'ellipse'); });
  const pr = $('#iePrecise'); if (pr) pr.addEventListener('click', () => { S.IE.precise = !S.IE.precise; pr.classList.toggle('on', S.IE.precise);     if (typeof S.updateGoSpec === 'function') S.updateGoSpec(); });
  const opb = $('#ieOp'); if (opb) opb.addEventListener('click', () => { S.IE.op = S.IE.op === 'cutout' ? 'mosaic' : 'cutout'; opb.textContent = S.IE.op === 'cutout' ? '떼기' : '가리기'; opb.classList.toggle('on', S.IE.op === 'cutout'); ieSyncGo(); if (typeof S.updateGoSpec === 'function') S.updateGoSpec(); });

  document.querySelectorAll('.ie-px, #ieShape, #iePrecise, #ieOp').forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); } }));
})();
}
