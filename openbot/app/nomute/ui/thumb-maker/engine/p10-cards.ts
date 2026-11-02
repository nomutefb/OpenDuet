// @ts-nocheck
// 썸네일 생성기 엔진 · 카드뉴스 칩 편집기
//   원본 = 에디터 viewer/thumb.html 4912~5327줄(origin/main ee27c47b) — 줄 그대로 옮김 · 주석만 뺌(까닭·형 말은 원본 주석에 그대로)
//   바꾼 곳 = 화면 전역 let·var·표 const → S.<이름>(./state · 창 열 때마다 새로) · document·window·타이머 = ./rt(이 화면 뿌리 안으로 · 닫으면 다 걷음) · 함수는 그대로 내보내고 서로 가져옴
//   다시 맞출 땐 원본 줄을 통째로 다시 떼어 같은 codemod 로(손으로 고친 줄 0 · 원본 갈아 끼우는 함수 selApp·updateGoSpec = S 에 올림 · hoist())
import { S } from "./state";
import { clearTimeout, document, requestAnimationFrame, setTimeout, window } from "./rt";
import { COPY_SVG, ERASE_SVG, PASTE_SVG, UNDO_SVG } from "./svg";
import { $ } from "./p01-core";
import { CP_PREV_FONT } from "./p02-preview";
import { clipCopy, clipPasteText } from "./p04-media";
import { curlyQ } from "./p05-text";
import { _inkChars, _ovCharW } from "./p11-fit";

export const EDLINE_HANGUL = 18;
export const EDLINE_WIDTH = 19.5;
export const EDLINE_SOFT = 14;
export const edHangul = s => (s.match(/[가-힣]/g) || []).length;
export const edWidth = s => { let w = 0; for (const ch of s) w += /[가-힣ㄱ-ㅎㅏ-ㅣ‘-‟…　-〿＀-￯]/.test(ch) ? 1 : 0.5; return w; };
export const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export function parseEmphLines(s) {
  const arr = [...s]; const plain = []; const ce = []; let on = false;
  for (let p = 0; p < arr.length; p++) {
    if (arr[p] === '*') { on = !on; continue; }
    plain.push(arr[p]); ce.push(on);
  }
  const lines = [[]]; let cur = lines[0]; let i = 0;
  while (i < plain.length) {
    const ch = plain[i];
    if (ch === '\n') { cur = []; lines.push(cur); i++; continue; }
    if (ch === ' ' || ch === '\t') { i++; continue; }
    let j = i, text = ''; const em = []; let allOn = true, allOff = true;
    while (j < plain.length && plain[j] !== ' ' && plain[j] !== '\t' && plain[j] !== '\n') {
      em.push(ce[j]); if (ce[j]) allOff = false; else allOn = false; text += plain[j]; j++;
    }
    if (allOn) cur.push({ text, on: true });
    else if (allOff) cur.push({ text, on: false });
    else cur.push({ text, on: false, em });
    i = j;
  }
  return lines.slice(0, S.MAX_LINES);
}
export function edMarkWarn() {
  for (const line of S.edLines) {
    let w = 0, hg = 0, over = false;
    line.forEach((wd, k) => {
      if (k) w += 0.5;
      const wasOver = over; let from = -1;
      const chars = [...wd.text];
      for (let ci = 0; ci < chars.length; ci++) {
        w += edWidth(chars[ci]); hg += edHangul(chars[ci]);
        if (!over && (w > EDLINE_WIDTH || hg > EDLINE_HANGUL)) { over = true; from = ci; }
      }
      if (wasOver) { wd._over = true; wd._overFrom = 0; }
      else if (over) { wd._over = true; wd._overFrom = from >= 0 ? from : 0; }
      else { wd._over = false; wd._overFrom = -1; }
    });
    let tw = 0; line.forEach((wd, k) => { if (k) tw += 0.5; tw += edWidth(wd.text); });
    const warn = tw > EDLINE_SOFT;
    line.forEach(wd => { wd._warn = warn && !wd._over; });
  }
}
export function edAnyOver() {
  for (const line of S.edLines) {
    let w = 0, hg = 0;
    for (let k = 0; k < line.length; k++) {
      if (k) w += 0.5;
      for (const ch of line[k].text) { w += edWidth(ch); hg += edHangul(ch); if (w > EDLINE_WIDTH || hg > EDLINE_HANGUL) return true; }
    }
  }
  return false;
}
export function lineWidthWith(li, wi, newText) {
  let w = 0, hg = 0;
  S.edLines[li].forEach((wd, k) => { if (k) w += 0.5; const t = k === wi ? newText : wd.text; w += edWidth(t); hg += edHangul(t); });
  return { w, hg };
}
export function lineFull(line) {
  let w = 0, hg = 0;
  line.forEach((wd, k) => { if (k) w += 0.5; w += edWidth(wd.text); hg += edHangul(wd.text); });
  return w >= EDLINE_WIDTH || hg >= EDLINE_HANGUL;
}
export function clipLineOver(li) {
  const line = S.edLines[li]; if (!line) return;
  let w = 0, hg = 0;
  for (let k = 0; k < line.length; k++) {
    if (k) w += 0.5;
    const chars = [...line[k].text];
    let cut = -1;
    for (let ci = 0; ci < chars.length; ci++) {
      w += edWidth(chars[ci]); hg += edHangul(chars[ci]);
      if (w > EDLINE_WIDTH || hg > EDLINE_HANGUL) { cut = ci; break; }
    }
    if (cut < 0) continue;
    const kept = chars.slice(0, cut).join('');
    if (kept) { line[k].text = kept; line[k].em = null; line.length = k + 1; }
    else { line.length = k; }
    for (let j = line.length - 1; j >= 0; j--) if (line[j].text === '') line.splice(j, 1);
    return;
  }
}
export function edReject(el) { el.classList.add('reject'); setTimeout(() => el.classList.remove('reject'), 600); }
export function renderEditChips() {
  S._edRendering = true;
  {

    const jl = S.edLines.map(l => l.map(w => w.text || '').join(' ')).join('\n');
    const cl = curlyQ(jl);
    if (cl !== jl) { let p = 0; S.edLines.forEach(l => l.forEach(w => { const L = (w.text || '').length; w.text = cl.slice(p, p + L); p += L + 1; })); }
  }
  const wrap = $('#edChips'); wrap.innerHTML = ''; wrap.classList.add('ed-building');
  S.edLines.forEach((line, li) => {
    for (let j = line.length - 1; j >= 0; j--) {
      const pending = S.PENDING_EDIT && S.PENDING_EDIT.li === li && S.PENDING_EDIT.wi === j;
      if (line[j].text === '' && !pending) {
        line.splice(j, 1);
        if (S.PENDING_EDIT && S.PENDING_EDIT.li === li && S.PENDING_EDIT.wi > j) S.PENDING_EDIT.wi--;
      }
    }
  });
  edMarkWarn();
  const full = S.edLines.length >= S.MAX_LINES;
  S.edLines.forEach((line, li) => {
    const row = document.createElement('div'); row.className = 'ed-line'; row.dataset.li = li;
    if (line.length === 0) {
      const e = document.createElement('span'); e.className = 'ed-chip ed-empty'; e.contentEditable = 'true'; e.spellcheck = true; e.lang = 'ko';
      e.oninput = ev => {
        const raw = e.textContent, si = raw.search(/\s/);
        if (si >= 0 && !ev.isComposing) {
          const left = raw.slice(0, si).trim(), right = raw.slice(si + 1).trim();
          if (left) { S.edLines[li] = [{ text: left, on: false }, { text: right, on: false }]; S.PENDING_EDIT = { li, wi: 1 }; renderEditChips(); return; }
          e.textContent = right;
          const sel = window.getSelection(), r = document.createRange(); r.selectNodeContents(e); r.collapse(false); sel.removeAllRanges(); sel.addRange(r);
        }
        fitEditLines(wrap);
      };
      e.onkeydown = ev => {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          const filled = !!e.textContent.replace(/\s+/g, ' ').trim();
          e.blur();
          if (filled) addLineAfter(li);
        }
      };
      e.onblur = () => {
        if (S._edRendering || !e.isConnected) return;
        const nt = e.textContent.replace(/\s+/g, ' ').trim();
        if (!nt) { dropLine(li); return; }
        S.edLines[li] = nt.split(/\s+/).map(t => ({ text: t, on: false }));
        clipLineOver(li);
        renderEditChips();
      };
      row.appendChild(e);
    } else {
      line.forEach((wd, wi) => {
        const chip = document.createElement('span');
        chip.className = 'ed-chip' + (wd.on ? ' on' : '') + (wd._warn ? ' warn' : '') + (wd._over ? ' over' : '');
        chip.dataset.li = li; chip.dataset.wi = wi;
        if (wd._over && wd._overFrom > 0) {
          const a = [...wd.text];
          chip.innerHTML = esc(a.slice(0, wd._overFrom).join('')) + '<span class="ovc">' + esc(a.slice(wd._overFrom).join('')) + '</span>';
        } else if (wd._over) { chip.innerHTML = '<span class="ovc">' + esc(wd.text) + '</span>'; }
        else if (wd.em) {
          const a = [...wd.text]; let h = '', run = null;
          a.forEach((c, ci) => { const e = !!wd.em[ci]; if (e !== run) { if (run !== null) h += '</span>'; h += e ? '<span class="emon">' : '<span>'; run = e; } h += esc(c); });
          if (run !== null) h += '</span>'; chip.innerHTML = h;
        }
        else { chip.textContent = wd.text; }
        chip.title = '탭=강조 / 더블탭=수정(비우면 삭제)';
        chip.onclick = () => { if (chip.isContentEditable) return; if (wd.em) { wd.em = null; wd.on = true; renderEditChips(); return; } wd.on = !wd.on; chip.classList.toggle('on'); };
        chip.ondblclick = () => { chip.textContent = wd.text; chip.contentEditable = 'true'; chip.spellcheck = true; chip.lang = 'ko'; chip.classList.add('editing'); chip.focus(); window.getSelection()?.selectAllChildren(chip); };
        chip.onkeydown = ev => {
          if (ev.key === 'Enter') {
            ev.preventDefault();
            const last = wi === S.edLines[li].length - 1, survive = !!chip.textContent.replace(/\s+/g, ' ').trim() || S.edLines[li].length > 1;
            chip.blur();
            if (last && survive) addLineAfter(li);
            return;
          }

          if (ev.key === 'Backspace' && !ev.isComposing && wi > 0 && !chip.textContent.replace(/[\s\u200b\uFEFF\u2060]/g, '')) {
            ev.preventDefault();
            S.edLines[li].splice(wi, 1);
            S.PENDING_EDIT = { li, wi: wi - 1 };
            renderEditChips();
          }
        };
        chip.oninput = ev => {
          const raw = chip.textContent, si = raw.search(/\s/);
          if (si >= 0 && !ev.isComposing) {
            const left = raw.slice(0, si).trim(), right = raw.slice(si + 1).trim();
            if (left) { S.edLines[li].splice(wi, 1, { text: left, on: wd.on }, { text: right, on: wd.on }); S.PENDING_EDIT = { li, wi: wi + 1 }; renderEditChips(); return; }
            chip.textContent = right;
          }
          fitEditLines(wrap);
          const { w, hg } = lineWidthWith(li, wi, raw.replace(/\s+/g, ' ').trim());
          chip.classList.toggle('over', w > EDLINE_WIDTH || hg > EDLINE_HANGUL);
        };
        chip.onblur = () => {
          if (S._edRendering || !chip.isConnected) return;
          chip.contentEditable = 'false'; chip.classList.remove('editing');
          const nt = chip.textContent.replace(/\s+/g, ' ').trim();
          if (nt === wd.text) { clipLineOver(li); renderEditChips(); return; }
          if (!nt) { S.edLines[li].splice(wi, 1); if (S.edLines[li].length === 0) { dropLine(li); return; } }
          else if (/\s/.test(nt)) { S.edLines[li].splice(wi, 1, ...nt.split(/\s+/).map(t => ({ text: t, on: wd.on }))); }
          else { wd.text = nt; wd.em = null; }
          clipLineOver(li);
          renderEditChips();
        };
        row.appendChild(chip);
      });
      if (!lineFull(line)) {
        const addw = document.createElement('span'); addw.className = 'ed-addw'; addw.textContent = '+'; addw.title = '이 줄에 어절 추가';
        addw.onclick = () => { S.edLines[li].push({ text: '', on: false }); S.PENDING_EDIT = { li, wi: S.edLines[li].length - 1 }; renderEditChips(); };
        row.appendChild(addw);
      }
    }
    const add = document.createElement('button'); add.type = 'button'; add.className = 'ed-add' + (full ? ' cap' : '') + (li === 0 ? ' ed-half' : ''); add.textContent = '+'; add.setAttribute('aria-label', '새 줄 추가'); add.title = full ? '최대 4줄' : '아래에 줄 추가';
    add.onclick = () => { if (full) { edReject(add); return; } addLineAfter(li); };
    row.appendChild(add);
    wrap.appendChild(row);
  });
  if (S.PENDING_FOCUS != null) {
    const e = wrap.querySelector(`.ed-line[data-li="${S.PENDING_FOCUS}"] .ed-empty`);
    if (e) e.focus();
    S.PENDING_FOCUS = null;
  }
  if (S.PENDING_EDIT) {
    const { li: pl, wi: pw } = S.PENDING_EDIT; S.PENDING_EDIT = null;
    const c = wrap.querySelector(`.ed-chip[data-li="${pl}"][data-wi="${pw}"]`), pwd = S.edLines[pl] && S.edLines[pl][pw];
    if (c && pwd) {
      c.textContent = pwd.text; c.contentEditable = 'true'; c.spellcheck = true; c.lang = 'ko'; c.classList.add('editing'); c.focus();
      const sel = window.getSelection(), r = document.createRange(); r.selectNodeContents(c); r.collapse(false); sel.removeAllRanges(); sel.addRange(r);
    }
  }
  S._edRendering = false;
  requestAnimationFrame(() => { wrap.classList.remove('ed-building'); fitEditLines(wrap); });
  if (S.cardIo) S.cardIo();
}
export function addLineAfter(li) {
  if (S.edLines.length >= S.MAX_LINES) return;
  S.edLines.splice(li + 1, 0, []);
  S.PENDING_FOCUS = li + 1;
  renderEditChips();
}
export function dropLine(li) {
  if (S.edLines.length <= 1) { S.edLines[0] = []; renderEditChips(); return; }
  S.edLines.splice(li, 1);
  renderEditChips();
}
export function fitEditLines(wrap) {
  if (!wrap) return;
  const rows = wrap.querySelectorAll('.ed-line');
  if (!rows.length) return;
  const cs = getComputedStyle(wrap);
  const avail = wrap.clientWidth - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0) - 2;
  if (avail <= 0) return;

  const ref = document.createElement('div'); ref.className = 'ed-line';
  ref.style.cssText = 'position:absolute; left:-9999px; top:0; visibility:hidden; width:max-content; --eds:1;';
  ['뉴스종합', '정치경제', '국제사회', '심층분석속보'].forEach(t => {
    const c = document.createElement('span'); c.className = 'ed-chip'; c.textContent = t; ref.appendChild(c);
  });
  { const aw = document.createElement('span'); aw.className = 'ed-addw'; aw.textContent = '+'; ref.appendChild(aw); }
  wrap.appendChild(ref);
  const refW = ref.getBoundingClientRect().width;
  wrap.removeChild(ref);
  let eds = refW > 0 ? Math.min(1.1, avail / refW) : 1;
  eds = Math.max(0.45, eds);
  const setEds = v => { const s = v.toFixed(3); if (wrap.style.getPropertyValue('--eds') !== s) wrap.style.setProperty('--eds', s); };
  setEds(eds);
  for (let pass = 0; pass < 4; pass++) {
    let maxw = 0; rows.forEach(r => { if (r.scrollWidth > maxw) maxw = r.scrollWidth; });
    if (maxw <= avail) break;
    eds = Math.max(0.4, eds * avail / maxw);
    setEds(eds);
  }
}
export function buildEmphText() {
  const charEm = (wd, ci) => wd.em ? !!wd.em[ci] : wd.on;
  return S.edLines.map(line => {
    const words = line.filter(wd => wd.text !== '');
    const seq = [];
    words.forEach((wd, k) => {
      const chars = [...wd.text];
      if (k) {
        const prev = words[k - 1], pc = [...prev.text];
        seq.push({ c: ' ', e: charEm(prev, pc.length - 1) && charEm(wd, 0) });
      }
      chars.forEach((c, ci) => seq.push({ c, e: charEm(wd, ci) }));
    });
    let out = '', on = false;
    seq.forEach(s => { if (s.e && !on) { out += '*'; on = true; } else if (!s.e && on) { out += '*'; on = false; } out += s.c; });
    if (on) out += '*';
    return out;
  }).filter(s => s !== '').join('\n');
}
export const TRK = {
  post:  { H: 70, S: 17, N: 48, fs: 76, limit: 920, start: 0,  floor: -45, basis: 'adv' },
  reels: { H: 72, S: 18, N: 48, fs: 78, limit: 844, start: -1, floor: -30, basis: 'adv' },

};
export function prevLetterSpace(line, tr, fs, basis) {
  if (basis === 'adv') return tr / 1000 * fs;
  const plain = String(line).replace(/\*/g, '');
  const n = plain.length - 1;
  if (n < 1) return null;
  let ink = 0, adv = 0;
  for (const ch of plain) {
    const i = S._trkChW(ch, fs, 'ink'), a = S._trkAdvW(ch, fs);
    if (i == null || a == null) return null;
    ink += i; adv += a;
  }
  return (ink - adv) / n + (tr / 1000 * fs);
}
export function lineWidthPx(text, tr, cfg) {

  const chars = _inkChars(text, false);
  let s = 0;
  for (const ch of chars) s += _ovCharW(ch, cfg);
  return s + (tr / 1000 * cfg.fs) * Math.max(chars.length - 1, 0) + 5;
}
export function estTracking(lines, fmt) {
  const cfg = TRK[fmt];
  const widest = tr => Math.max(0, ...lines.map(l => lineWidthPx(l, tr, cfg)));
  if (widest(cfg.start) <= cfg.limit) return { tr: cfg.start, swept: false, over: false };
  for (let x = cfg.start; x >= cfg.floor; x--) if (widest(x) <= cfg.limit) return { tr: x, swept: true, over: false };
  return { tr: cfg.floor, swept: true, over: true };
}

export function start() {
S.edLines = [];
S.PENDING_FOCUS = null;
S.PENDING_EDIT = null;
S._edRendering = false;
S.MAX_LINES = 4;
(function () {
  const wrap = $('#cardBox .edwrap'); if (!wrap) return;
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'iobtn iobtn-edge iobtn-pp'; wrap.appendChild(btn);
  const copyB = document.createElement('button'); copyB.type = 'button'; copyB.className = 'iobtn iobtn-edge iobtn-copy iobtn-hide';
  copyB.innerHTML = COPY_SVG; copyB.setAttribute('aria-label', '복사'); copyB.title = '복사'; wrap.appendChild(copyB);
  const eraser = document.createElement('button'); eraser.type = 'button'; eraser.className = 'iobtn iobtn-edge iobtn-erase';
  eraser.innerHTML = ERASE_SVG; eraser.setAttribute('aria-label', '입력 지우기'); eraser.title = '입력 지우기'; wrap.appendChild(eraser);
  let undoTimer = null, undoLines = null;
  const exitUndo = () => { if (undoTimer) { clearTimeout(undoTimer); undoTimer = null; } eraser.classList.remove('iobtn-undo'); eraser.innerHTML = ERASE_SVG; eraser.setAttribute('aria-label', '입력 지우기'); eraser.title = '입력 지우기'; if (S.cardIo) S.cardIo(); };
  const setIcon = (b, svg, key) => { if (b._icon !== key) { b.innerHTML = svg; b._icon = key; } };
  S.cardIo = () => {
    const filled = buildEmphText().trim().length > 0;
    if (!btn.classList.contains('ok')) { setIcon(btn, PASTE_SVG, 'paste'); btn.dataset.mode = 'paste'; btn.setAttribute('aria-label', '붙여넣기'); btn.title = '붙여넣기'; }
    if (!copyB.classList.contains('ok')) { setIcon(copyB, COPY_SVG, 'copy'); copyB.classList.toggle('iobtn-hide', !filled); }
    if (!eraser.classList.contains('iobtn-undo')) eraser.classList.toggle('iobtn-off', !filled);
  };
  copyB.onclick = ev => { ev.preventDefault(); clipCopy(buildEmphText(), copyB, S.cardIo); };
  btn.onclick = async ev => {
    ev.preventDefault();
    const t = await clipPasteText(); if (t) { S.edLines = parseEmphLines(t); if (!S.edLines.length) S.edLines = [[]]; renderEditChips(); } S.cardIo();
  };
  eraser.onclick = ev => {
    ev.preventDefault();
    if (eraser.classList.contains('iobtn-undo')) { if (undoLines) { S.edLines = undoLines; if (!S.edLines.length) S.edLines = [[]]; renderEditChips(); } exitUndo(); return; }
    if (buildEmphText().trim().length === 0) return;
    try { undoLines = JSON.parse(JSON.stringify(S.edLines)); } catch { undoLines = null; }
    S.edLines = [[]]; renderEditChips();
    eraser.classList.remove('iobtn-off'); eraser.classList.add('iobtn-undo'); eraser.innerHTML = UNDO_SVG; eraser.setAttribute('aria-label', '되돌리기'); eraser.title = '되돌리기 (직전 입력 복원)';
    if (undoTimer) clearTimeout(undoTimer); undoTimer = setTimeout(exitUndo, S.ERASE_UNDO_MS);
  };
  S.cardIo();
})();
S._trkFontOk = (() => {
  const ok = new Set(); let miss0 = -1e9;
  return (fs) => {
    if (ok.has(fs)) return true;
    const now = performance.now();
    if (now - miss0 < 250) return false;
    if (!document.fonts || !document.fonts.check('700 ' + fs + 'px "' + CP_PREV_FONT + '"')) { miss0 = now; return false; }
    ok.add(fs); return true;
  };
})();
S._trkChW = (() => {
  let cx = null; const cache = new Map();
  return (ch, fs, basis) => {
    try {
      const key = basis + fs + ch;
      if (cache.has(key)) return cache.get(key);
      if (!S._trkFontOk(fs)) return null;
      if (!cx) cx = document.createElement('canvas').getContext('2d');
      cx.font = '700 ' + fs + 'px "' + CP_PREV_FONT + '"';
      const m = cx.measureText(ch);

      const w = (basis === 'adv' || typeof m.actualBoundingBoxLeft !== 'number' || typeof m.actualBoundingBoxRight !== 'number')
        ? m.width
        : Math.max(0, m.actualBoundingBoxLeft + m.actualBoundingBoxRight);
      cache.set(key, w); return w;
    } catch (_) { return null; }
  };
})();
S._trkAdvW = (() => {
  let cx = null; const cache = new Map();
  return (ch, fs) => {
    try {
      const key = fs + ch;
      if (cache.has(key)) return cache.get(key);
      if (!S._trkFontOk(fs)) return null;
      if (!cx) cx = document.createElement('canvas').getContext('2d');
      cx.font = '700 ' + fs + 'px "' + CP_PREV_FONT + '"';
      const w = cx.measureText(ch).width;
      cache.set(key, w); return w;
    } catch (_) { return null; }
  };
})();
}
