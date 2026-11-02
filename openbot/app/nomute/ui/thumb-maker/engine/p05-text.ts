// @ts-nocheck
// 썸네일 생성기 엔진 · 한 줄 칸·자모 낱자·둥근 따옴표·별표 강조·드래프트 그림 보관
//   원본 = 에디터 viewer/thumb.html 3301~3524줄(origin/main ee27c47b) — 줄 그대로 옮김 · 주석만 뺌(까닭·형 말은 원본 주석에 그대로)
//   바꾼 곳 = 화면 전역 let·var·표 const → S.<이름>(./state · 창 열 때마다 새로) · document·window·타이머 = ./rt(이 화면 뿌리 안으로 · 닫으면 다 걷음) · 함수는 그대로 내보내고 서로 가져옴
//   다시 맞출 땐 원본 줄을 통째로 다시 떼어 같은 codemod 로(손으로 고친 줄 0 · 원본 갈아 끼우는 함수 selApp·updateGoSpec = S 에 올림 · hoist())
import { S } from "./state";
import { ResizeObserver, document, window } from "./rt";
import { $ } from "./p01-core";
import { getOpas } from "./p03-options";
import { attachCopyPaste } from "./p04-media";

export function attachOneLineGrow(el) {
  if (!el || el._g1l) return;
  const grow = () => {
    el.style.height = 'auto';
    const bd = el.offsetHeight - el.clientHeight;
    el.style.height = Math.min(el.scrollHeight + bd, S.TA1L_MAX) + 'px';
  };
  const flat = () => {
    if (!/[\r\n]/.test(el.value)) return;
    const s = el.selectionStart, e = el.selectionEnd;
    el.value = el.value.replace(/\r\n?|\n/g, ' ');
    try { el.setSelectionRange(s, e); } catch {}
  };
  el._g1l = () => { flat(); grow(); };
  el.addEventListener('keydown', ev => { if (ev.key === 'Enter' && !ev.isComposing) ev.preventDefault(); });
  el.addEventListener('input', el._g1l);
  let lastW = 0;
  try { new ResizeObserver(() => { if (el.clientWidth !== lastW) { lastW = el.clientWidth; grow(); } }).observe(el); } catch {}
}
export function normJamo(s) {
  if (!s) return s;
  const t = s.normalize('NFC');
  if (!/[ᄀ-ᇿ]/.test(t)) return t;
  return Array.from(t).map(c => S.JAMO_STD.get(c.codePointAt(0)) || c).join('');
}
export function attachJamoNorm(el) {
  if (!el || el._jmn) return;
  el._jmn = ev => {
    if (ev && ev.isComposing) return;
    const v = el.value, n = normJamo(v);
    if (n === v) return;
    const s = el.selectionStart;
    el.value = n;
    const c = normJamo(v.slice(0, s)).length;
    try { el.setSelectionRange(c, c); } catch {}
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };
  el.addEventListener('input', el._jmn);
}
export function curlyQ(s) {
  let dq = 0, sq = 0, out = '';
  for (const ch of s) {
    if (ch === '“') { dq = 1; out += ch; }
    else if (ch === '”') { dq = 0; out += ch; }
    else if (ch === '‘') { sq = 1; out += ch; }
    else if (ch === '’') { sq = 0; out += ch; }
    else if (ch === '"') { out += dq ? '”' : '“'; dq ^= 1; }
    else if (ch === "'") {
      const prev = out.slice(-1);

      if (!sq && prev && /[\p{L}\p{N}]/u.test(prev)) out += '’';
      else { out += sq ? '’' : '‘'; sq ^= 1; }
    } else out += ch;
  }
  return out;
}
export function attachCurlyQ(el) {
  if (!el || el._cq) return;
  el._cq = ev => {
    if (ev && ev.isComposing) return;
    const v = el.value, n = curlyQ(v);
    if (n === v) return;
    const s = el.selectionStart, e = el.selectionEnd;
    el.value = n;
    try { el.setSelectionRange(s, e); } catch {}
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };
  el.addEventListener('input', el._cq);
}
export function attachStarHL(ta) {
  const wrap = ta && ta.parentElement; if (!wrap || !wrap.classList.contains('iowrap') || wrap._starHL) return;
  wrap._starHL = true;
  const hl = document.createElement('div'); hl.className = 'ta-star'; hl.setAttribute('aria-hidden', 'true');
  wrap.insertBefore(hl, ta.nextSibling);
  const sync = () => { const cs = getComputedStyle(ta); ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'lineHeight', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'textIndent', 'textAlign'].forEach(k => { hl.style[k] = cs[k]; }); };
  const syncBox = () => { if (ta.offsetHeight) hl.style.height = ta.offsetHeight + 'px'; };
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const starOn = ta.id !== 'cTitle';
  const scrollSync = () => { hl.scrollTop = ta.scrollTop; };
  const paint = () => {
    const s = ta.value, on = starOn, cls = on ? classifyStars(s) : null; let h = '';
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === '*' && on) { const c = cls[i]; const mod = (c === 'x' || c === 'd' || c === 's') ? (' hs-' + c) : (typeof c === 'number' ? (' hs-p' + c) : ''); h += '<span class="hs' + mod + '">*</span>'; }
      else h += esc(ch);
    }
    hl.innerHTML = h; scrollSync();
  };
  ta.addEventListener('input', paint);
  ta.addEventListener('scroll', scrollSync);
  window.addEventListener('resize', () => { sync(); syncBox(); });
  try { new ResizeObserver(() => { sync(); syncBox(); }).observe(ta); } catch {}
  sync(); syncBox(); paint();
}
export function normEmph(text) {
  const src = String(text == null ? '' : text);
  let out = '', on = false, open = false;
  const flushClose = () => { if (open) { out += '*'; open = false; } };
  for (const p of src.split(/(\*+|\n)/)) {
    if (p === '') continue;
    if (/^\*+$/.test(p)) {
      if (p.length >= 3) { if (on && !open) { out += '*'; open = true; } out += p; }
      else { on = !on; }
    }
    else if (p === '\n') { flushClose(); out += '\n'; }
    else { if (on && !open) { out += '*'; open = true; } if (!on) flushClose(); out += p; }
  }
  flushClose();
  return out;
}
export const SENS_MASK = [['자살', '*살']];
export function sensMask(s) { let o = String(s == null ? '' : s); for (const [a, b] of SENS_MASK) o = o.split(a).join(b); return o; }
export function renderEmph2(line) {
  const segs = []; let on = false, buf = '';
  const push = () => { if (buf) { segs.push([on ? 'h' : 'n', buf]); buf = ''; } };
  for (let c = 0; c < line.length;) {
    if (line[c] === '*') { let j = c; while (j < line.length && line[j] === '*') j++;
      if (j - c >= 3) { buf += line.slice(c, j); }
      else { push(); on = !on; }
      c = j;
    } else { buf += line[c]; c++; }
  }
  push(); return segs;
}
export const hasEmph2 = line => renderEmph2(line).some(s => s[0] === 'h');
export const STAR_CYC = 4;
export function classifyStars(text) {
  const cls = new Array(text.length).fill(null);
  const ws = c => c == null || c === ' ' || c === '\t' || c === '\n' || c === '\r';
  const rs = []; for (let i = 0; i < text.length;) { if (text[i] === '*') { let j = i; while (j < text.length && text[j] === '*') j++; rs.push({ i, end: j, len: j - i }); i = j; } else i++; }
  const mark = (r, v) => { for (let k = r.i; k < r.end; k++) cls[k] = v; };
  const s1 = [], s2 = []; let ci = 0;
  const pair = (a, b) => { mark(a, ci % STAR_CYC); mark(b, ci % STAR_CYC); ci++; };
  for (const r of rs) {
    if (r.len >= 3) { mark(r, 'x'); continue; }
    const nn = k => { while (k < text.length && ws(text[k])) k++; return k < text.length; };
    const canOpen = nn(r.end), canClose = !ws(text[r.i - 1]);
    const stk = r.len === 1 ? s1 : s2;
    if (canClose && stk.length) pair(stk.pop(), r);
    else if (canOpen) stk.push(r);
    else mark(r, r.len === 1 ? 's' : 'd');
  }
  for (const r of s1) mark(r, 's');
  for (const r of s2) mark(r, 'd');
  return cls;
}
export function strayStars(text) {
  const cls = classifyStars(text), s = new Set();
  for (let i = 0; i < cls.length; i++) if (cls[i] === 's') s.add(i);
  return s;
}
export function stripStrayStars(text) {
  const s = strayStars(text); if (!s.size) return text;
  let out = ''; for (let i = 0; i < text.length; i++) if (!s.has(i)) out += text[i]; return out;
}
export function buildParams() {
  const linesArr = ($('#lines').value || '').split('\n').map(s => s.trim()).filter(Boolean);
  if (S.APP === '1') return { fmt: 'post', lines: linesArr, opas: getOpas() };

}

export function start() {
S.TA1L_MAX = 104;
['cSub', 'cTitle'].forEach(id => { const el = $('#' + id); if (el) attachOneLineGrow(el); });
S.JAMO_STD = (() => {
  const m = new Map();
  'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.split('').forEach((c, i) => m.set(0x1100 + i, c));
  for (let i = 0; i < 21; i++) m.set(0x1161 + i, String.fromCharCode(0x314F + i));
  'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'.split('').forEach((c, i) => m.set(0x11A8 + i, c));
  return m;
})();
['cSub', 'cTitle', 'cLines', 'lines', 'warnLines'].forEach(id => attachJamoNorm($('#' + id)));
['cSub', 'cTitle', 'cLines', 'lines', 'warnLines'].forEach(id => attachCurlyQ($('#' + id)));
['lines', 'warnLines', 'cSub', 'cTitle', 'cLines'].forEach(id => { const el = $('#' + id); if (el) attachCopyPaste(el, true); });
['cplat'].forEach(id => { const el = $('#' + id); if (el) attachCopyPaste(el, true); });
['lines', 'cLines', 'cTitle'].forEach(id => { const el = $('#' + id); if (el) attachStarHL(el); });
['cSub', 'cTitle'].forEach(id => { const el = $('#' + id); if (el && el._g1l) el._g1l(); });
(function () {
  if (typeof ResizeObserver === 'undefined') return;
  document.querySelectorAll('.covrow').forEach(row => {
    const ta = row.querySelector('textarea'), img = row.querySelector('.covimg');
    if (!ta || !img) return;
    const sync = () => { if (ta.offsetHeight) img.style.height = ta.offsetHeight + 'px'; };
    new ResizeObserver(sync).observe(ta); sync();
  });
})();
S.cardIo = null;
}
