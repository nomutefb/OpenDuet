// @ts-nocheck
// 모던 겉옷 셋 — 원본 = 에디터 viewer/modern-ui.js · modern-fold.js · modern-copy.js(origin/main c430e4c9f) · 줄 그대로 · 주석만 뺌
//   원본에선 썸네일 iframe 이 모던 부모(index) 안에 열리면 modern-ui.js 가 스스로 붙고 fold·copy 를 불러 붙였다(앱 「에디터」 칸이 보여 주던 그 꼴)
//   바꾼 곳 = modern-ui 머리(부모 검사·스타일시트·스크립트 불러오기 → 겉옷 클래스·data-nm-skin 만 · CSS 는 ../thumb-maker.css 에 이미) · nm-gauge.js 불러오기 뺌
//            세 IIFE → start 함수(화면 열 때) · document·window·타이머 = ./rt(닫으면 듣기·관찰 다 걷고 window 표식도 지움 = 다음에 열면 다시 붙음)
import { MutationObserver, ResizeObserver, addEventListener, cancelAnimationFrame, clearTimeout, document, innerHeight, innerWidth, matchMedia, requestAnimationFrame, scrollY, setTimeout, window } from "./rt";

/** modern-ui.js — 겉옷 클래스 · 레일 자리 잡기(작은 화면 = 미리보기 도크가 화면을 너무 먹으면 흐름으로) · 포커스 칸 가림 피하기 */
export function startModernUI() {
(function () {
  'use strict';
  if (window.NMModernUI) return;
  var root = document.documentElement;
  root.classList.add('modern-workspace', 'modern-ui-frame');
  if (window.nmGauge) window.nmGauge.scan(document);
  root.setAttribute('data-nm-skin', 'on');

  var wide = matchMedia('(min-width:900px)'), reserved = new Map(), flowing = new Map(), padded = new Map(), queued = 0, view = '';
  var BASE = {marginBottom: 'data-nm-rail-base', paddingBottom: 'data-nm-rail-pad'}, FLOW = 0.8;
  var sized = window.ResizeObserver ? new ResizeObserver(function () { queueRail(); }) : null, watched = new WeakSet();
  function px(value) { return parseFloat(value) || 0; }
  function token(name) { return px(getComputedStyle(root).getPropertyValue(name)); }
  function size(el) { if (sized && el && !watched.has(el)) { watched.add(el); sized.observe(el); } }

  function baseOf(target, prop) {
    return target.hasAttribute(BASE[prop]) ? Number(target.getAttribute(BASE[prop])) : px(getComputedStyle(target)[prop]);
  }
  function release(target, prop) {
    target.style.removeProperty(prop === 'marginBottom' ? 'margin-bottom' : 'padding-bottom');
    target.removeAttribute(BASE[prop]); target.removeAttribute('data-nm-rail');
    reserved.delete(target);
  }

  function flow(dock, on, rec) {
    var sheet = on ? rec.sheet : (flowing.get(dock) || {}).sheet;
    if (on) { flowing.set(dock, rec); dock.style.position = 'relative'; dock.style.top = 'auto'; dock.setAttribute('data-nm-rail-flow', ''); }
    else { flowing.delete(dock); dock.style.removeProperty('position'); dock.style.removeProperty('top'); dock.removeAttribute('data-nm-rail-flow'); }
    if (!sheet) return;
    if (on) sheet.kept = sheet.sets.map(function (s) { return s[0].style.getPropertyValue(s[1]); });
    sheet.sets.forEach(function (s, i) { s[0].style.setProperty(s[1], on ? s[2] : sheet.kept[i]); });
  }

  function sheetOf(dock) {
    for (var col = dock.parentElement; col && col !== document.body; col = col.parentElement) {
      if (getComputedStyle(col).position !== 'fixed') continue;
      var sets = [[col, 'position', 'static'], [col, 'display', 'block'], [document.body, 'overflow', 'visible']];
      Array.prototype.forEach.call(col.children, function (el) {
        if (!el.contains(dock) && /auto|scroll/.test(getComputedStyle(el).overflowY)) sets.push([el, 'overflow', 'visible']);
      });
      return sets.length > 3 ? {col: col, sets: sets} : null;
    }
    return null;
  }

  function fixedCol(col) {
    var v = col.style.getPropertyValue('position');
    col.style.removeProperty('position');
    var fixed = getComputedStyle(col).position === 'fixed';
    col.style.setProperty('position', v);
    return fixed;
  }

  function scrollerOf(dock) {
    for (var el = dock.parentElement; el && el !== document.body; el = el.parentElement) {
      var cs = getComputedStyle(el);
      if (/auto|scroll|hidden|overlay/.test(cs.overflowY + cs.overflowX)) return el;
    }
    return root;
  }

  function scrolls(scroller) {
    var y = getComputedStyle(scroller).overflowY;
    if (scroller === root && y === 'visible') y = getComputedStyle(document.body).overflowY;
    return y !== 'hidden' && y !== 'clip';
  }

  function pad(scroller, value) {
    var v = value ? value + 'px' : '';
    if (scroller.style.getPropertyValue('--nm-hold') !== v) { if (v) scroller.style.setProperty('--nm-hold', v); else scroller.style.removeProperty('--nm-hold'); }
    if (value) padded.set(scroller, value); else padded.delete(scroller);
  }

  document.addEventListener('focusin', function (e) {
    var t = e.target;
    if (!padded.size || !t || t === document || !t.closest || t.closest('.topdock,.dock') || !t.getClientRects().length) return;
    padded.forEach(function (hold, scroller) {
      if (!scroller.contains(t)) return;
      var edge = scroller === root ? 0 : scroller.getBoundingClientRect().top;
      if (t.getBoundingClientRect().top < edge + hold) t.scrollIntoView({block: 'nearest', inline: 'nearest'});
    });
  }, true);
  function reserveRail() {
    queued = 0;

    if (!innerWidth || !root.getClientRects().length) return;
    var next = new Map(), docks = new Set(), gap = token('--modern-sp-3') || token('--sp-2');
    var staged = !!getComputedStyle(root).getPropertyValue('--stg-h').trim();
    document.querySelectorAll('.trailwrap').forEach(function (rail) {
      var stage = rail.offsetParent;
      if (!stage) return;
      var dock = rail.closest('.topdock,.dock'), bottom = rail.getBoundingClientRect().bottom, target, prop, base, want;
      size(rail); size(dock);
      if (dock) docks.add(dock);

      var box = staged && dock && !dock.classList.contains('dockzoom') && rail.parentElement.querySelector('.cpprev-box,.mon');
      if (box) {
        var opts = rail.querySelector(':scope > .trail-opts');
        if (opts) {
          size(opts); Array.prototype.forEach.call(opts.children, size);
          if (!opts.hasAttribute('data-nm-more')) { opts.setAttribute('data-nm-more', ''); opts.addEventListener('scroll', function () { railMore(opts); }, {passive: true}); }
          railMore(opts);
        }
        return;
      }
      if (wide.matches || !dock) {
        target = stage; prop = 'marginBottom'; base = baseOf(stage, prop);
        want = base + Math.max(0, Math.ceil(bottom - stage.getBoundingClientRect().bottom));
      } else {

        target = dock; prop = 'paddingBottom'; base = baseOf(dock, prop);
        var added = reserved.get(dock) === prop ? px(getComputedStyle(dock).paddingBottom) - base : 0;
        want = base + Math.max(0, Math.ceil(bottom + gap - (dock.getBoundingClientRect().bottom - added)));
      }
      if (want <= base) return;
      var had = next.get(target);
      if (!had || had[1] < want) next.set(target, [prop, want, base]);
    });
    reserved.forEach(function (prop, target) {
      var keep = next.get(target);
      if (!keep || keep[0] !== prop) release(target, prop);
    });
    next.forEach(function (w, target) {
      var value = w[1] + 'px';

      if (!target.hasAttribute(BASE[w[0]])) target.setAttribute(BASE[w[0]], w[2]);
      if (target.style[w[0]] !== value) target.style[w[0]] = value;
      target.setAttribute('data-nm-rail', ''); reserved.set(target, w[0]);
    });

    var room = token('--modern-hit') + 2 * gap, pads = new Map(), frame = innerWidth + 'x' + innerHeight;

    flowing.forEach(function (rec, dock) {
      if (!docks.has(dock) || (frame !== view && (!rec.sheet || !fixedCol(rec.sheet.col)))) flow(dock, false);
    });
    view = frame;
    docks.forEach(function (dock) {
      var rec = flowing.get(dock), cs = getComputedStyle(dock), box = dock.getBoundingClientRect();
      if (!rec && cs.position !== 'sticky') return;
      var scroller = rec ? rec.scroller : scrollerOf(dock), sheet = rec ? rec.sheet : !scrolls(scroller) && sheetOf(dock);
      if (!rec && !sheet && !scrolls(scroller)) return;

      var top = sheet ? Math.round(box.top + scrollY) : rec ? rec.top : px(cs.top), held = box.height + top;
      var height = scroller === root ? innerHeight : scroller.clientHeight;
      var short = held > height * FLOW || held + room > height;
      if (short !== !!rec) flow(dock, short, {top: top, scroller: scroller, sheet: sheet || null});
      if (short || sheet) return;
      pads.set(scroller, Math.max(pads.get(scroller) || 0, Math.ceil(held + gap)));
    });
    padded.forEach(function (_, scroller) { if (!pads.has(scroller)) pad(scroller, 0); });
    pads.forEach(function (value, scroller) { pad(scroller, value); });
  }

  function railMore(opts) {

    var low = -Infinity;
    Array.prototype.forEach.call(opts.children, function (el) { var r = el.getBoundingClientRect(); if (r.height) low = Math.max(low, r.bottom); });
    if (low === -Infinity) return;
    var cs = getComputedStyle(opts), top = opts.getBoundingClientRect().top + px(cs.borderTopWidth);
    var end = low - top + opts.scrollTop + px(cs.paddingBottom);
    var over = end - opts.clientHeight > 1, more = over && end - opts.scrollTop - opts.clientHeight > 1;
    if (over !== opts.hasAttribute('data-scroll')) opts.toggleAttribute('data-scroll', over);
    if (!over && opts.scrollTop) opts.scrollTop = 0;
    if (more !== opts.hasAttribute('data-more')) opts.toggleAttribute('data-more', more);
  }
  function queueRail() { if (!queued) queued = requestAnimationFrame(reserveRail); }

  var gaugeWaits = [];
  function withGauge(fn) {
    if (window.nmGauge) { fn(); return; }
    gaugeWaits.push(fn);
    if (gaugeWaits.length > 1) return;

    gaugeWaits.length = 0;   // 앱 안 = nm-gauge.js 를 따로 안 들임(이 화면엔 .lenrule 없음)
  }
  function lenScrub(rule) {
    if (rule.parentElement.classList.contains('nm-lenscrub') || !rule.querySelector('button[data-s]')) return;
    var row = rule.closest('.geni-row'), name = row && row.querySelector('.pub-l'), label = name ? name.textContent.trim() : '';
    var host = document.createElement('span'), range = document.createElement('input');
    host.className = 'nm-lenscrub';
    host.style.cssText = 'position:relative;display:block;flex:1 1 auto;min-width:0';
    rule.parentNode.insertBefore(host, rule);
    host.appendChild(rule);

    rule.inert = true;
    range.type = 'range'; range.min = '0'; range.step = '1'; range.value = '0';
    range.className = 'nm-lenscrub-in';

    range.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0';
    range.dataset.nmg = 'scrub'; range.dataset.nmgTap = 'set';
    range.setAttribute('aria-label', label || rule.getAttribute('aria-label') || '');
    host.appendChild(range);
    var cells = function () { return rule.querySelectorAll('button[data-s]'); };
    var said = function (cell) {
      var text = (cell.getAttribute('aria-label') || cell.title || cell.dataset.s || '').trim();
      return label && text.indexOf(label) === 0 ? text.slice(label.length).trim() : text;
    };
    function sync() {
      var all = cells(), on = -1;
      for (var i = 0; i < all.length; i++) if (all[i].getAttribute('aria-pressed') === 'true') on = i;
      var max = String(Math.max(0, all.length - 1));
      if (range.max !== max) { range.max = max; if (window.nmGauge) window.nmGauge.paint(range); }
      if (on >= 0 && Number(range.value) !== on) range.value = String(on);
      var cell = all[Number(range.value)];
      if (cell) range.setAttribute('aria-valuetext', said(cell));
    }
    range.addEventListener('input', function () {
      var cell = cells()[Number(range.value)];
      if (cell && cell.getAttribute('aria-pressed') !== 'true') cell.click();
      sync();
    });
    new MutationObserver(sync).observe(rule, {childList: true, subtree: true, attributes: true, attributeFilter: ['aria-pressed']});
    sync();
    withGauge(function () {
      var scrub = window.nmGauge.mount(range);
      if (!scrub) return;

      scrub.setAttribute('data-nm-len', '');
      scrub.style.cssText += ';position:absolute;inset:0;height:auto;min-height:var(--modern-hit);background:transparent;border-color:transparent';
      var tick = scrub.querySelector('.nm-scrub-tick');
      if (tick) tick.style.display = 'none';
      sync();
    });
  }
  function scanLen() { document.querySelectorAll('.lenrule').forEach(lenScrub); }

  function reveal(e) {
    var el = e.target;
    try { if (!el.getBoundingClientRect || !el.matches(':focus-visible')) return; } catch (_) { return; }
    for (var strip = el.parentElement; strip && strip !== document.body; strip = strip.parentElement) {
      if (strip.scrollWidth <= strip.clientWidth || !/auto|scroll/.test(getComputedStyle(strip).overflowX)) continue;
      var a = el.getBoundingClientRect(), left = strip.getBoundingClientRect().left + strip.clientLeft, right = left + strip.clientWidth;
      var edge = Math.max(0, Math.min(token('--modern-sp-3'), (strip.clientWidth - a.width) / 2));
      var by = a.left < left + edge ? a.left - left - edge : a.right > right - edge ? a.right - right + edge : 0;
      if (by) strip.scrollLeft += by;
    }
  }
  document.addEventListener('focusin', reveal);

  function watchRail() {
    new MutationObserver(function (records) {
      scanLen();

      if (records.some(function (r) {
        return r.type !== 'attributes' || r.attributeName !== 'style' || !r.target.closest('.nm-scrub,.nm-rbs');
      })) queueRail();
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'style'] });
    addEventListener('resize', queueRail);

    size(root);
    if (wide.addEventListener) wide.addEventListener('change', queueRail);
    scanLen();
    queueRail();
  }
  if (document.body) watchRail(); else document.addEventListener('DOMContentLoaded', watchRail, { once: true });
  window.NMModernUI = Object.freeze({ inherited: true });
}());

}

/** modern-fold.js — 접이 꺾쇠 모양 바뀜·열고 닫힘 움직임 */
export function startModernFold() {
(() => {
  'use strict';
  if (window.NMFold) return;
  const root = document.documentElement;
  const live = () => root.classList.contains('modern-workspace');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const OPEN_MS = 500, CLOSE_MS = 140, LIFT_IN = 8, LIFT_OUT = 7, FEATHER = 20, FRAME = 1000 / 60;
  const EXPO = 'linear(0, 0.06703 1%, 0.1296 2%, 0.1879 3%, 0.2682 4.5%, 0.3406 6%, 0.4261 8%, 0.5005 10%, 0.5801 12.5%, 0.6471 15%, 0.7135 18%, 0.7675 21%, 0.824 25%, 0.8759 30%, 0.9125 35%, 0.9465 42%, 0.9697 50%, 0.9853 60%, 0.9942 72%, 0.9984 86%, 1)';
  const QUAD_IN = 'linear(0, 0.01 10%, 0.04 20%, 0.09 30%, 0.16 40%, 0.25 50%, 0.36 60%, 0.49 70%, 0.64 80%, 0.81 90%, 1)';
  const easing = (() => {
    const ok = s => { try { document.createElement('i').animate(null, {easing: s}); return true; } catch (_) { return false; } };
    return ok(EXPO) ? {open: EXPO, close: QUAD_IN} : {open: 'cubic-bezier(.16,1,.3,1)', close: 'cubic-bezier(.11,0,.5,0)'};
  })();
  const expo = x => x >= 1 ? 1 : (1 - Math.pow(2, -10 * x)) / (1 - Math.pow(2, -10));

  const TOGGLE = '[aria-expanded],button,[role="button"],summary,.hist-h,.menu-item';
  const chevrons = new Map();
  let flying = 0, raf = 0;

  function points(shape) {
    let src = shape.tagName === 'polyline' ? 'M' + shape.getAttribute('points') : shape.getAttribute('d');
    if (!src || /[^MmLl0-9.,\s-]/.test(src)) return null;
    const tokens = src.match(/[MmLl]|-?\d*\.?\d+/g), out = [];
    let cmd = 'M', x = 0, y = 0;
    for (let i = 0; i < tokens.length;) {
      if (/[MmLl]/.test(tokens[i])) { cmd = tokens[i++]; continue; }
      const a = +tokens[i++], b = +tokens[i++];
      if (Number.isNaN(b)) return null;
      const rel = cmd === 'm' || cmd === 'l';
      x = rel && out.length ? x + a : a; y = rel && out.length ? y + b : b;
      out.push([x, y]);
      if (cmd === 'M') cmd = 'L'; else if (cmd === 'm') cmd = 'l';
    }
    return out.length === 3 ? out : null;
  }

  function geometry(svg) {
    const shapes = [...svg.children].filter(n => n.tagName !== 'title' && n.tagName !== 'desc');
    if (shapes.length !== 1 || !/^(path|polyline)$/.test(shapes[0].tagName)) return null;
    const p = points(shapes[0]);
    if (!p) return null;
    const [[x0, y0], [vx, vy], [x2, y2]] = p;
    if (Math.abs(y0 - y2) > .01 || Math.abs((x0 + x2) / 2 - vx) > .01 || Math.abs(vy - y0) < .5) return null;
    const half = Math.abs(x2 - x0) / 2, rise = Math.abs(vy - y0);
    return {shape: shapes[0], d0: shapes[0].getAttribute(shapes[0].tagName === 'path' ? 'd' : 'points'),
      vx, c: (vy + y0) / 2, L: Math.hypot(half, rise), th: Math.atan2(rise, half), s0: Math.sign(vy - y0)};
  }
  function draw(r) {
    const phi = r.v * r.th, hx = r.L * Math.cos(phi), dy = r.s0 * r.L * Math.sin(phi);
    const f = n => Math.round(n * 1000) / 1000, ey = f(r.c - dy / 2), vy = f(r.c + dy / 2);
    const d = 'M' + f(r.vx - hx) + ' ' + ey + 'L' + f(r.vx) + ' ' + vy + 'L' + f(r.vx + hx) + ' ' + ey;
    if (r.shape.tagName === 'path') r.shape.setAttribute('d', d);
    else r.shape.setAttribute('points', d.slice(1).replace(/L/g, ' '));
  }
  function release(r) {
    chevrons.delete(r.svg);
    r.shape.setAttribute(r.shape.tagName === 'path' ? 'd' : 'points', r.d0);
    r.svg.style.removeProperty('transform'); r.svg.style.removeProperty('transition');
  }

  function turned(list) {
    list.forEach(r => r.svg.style.removeProperty('transform'));
    const out = list.map(r => {
      const t = getComputedStyle(r.svg).transform;
      if (t === 'none') return 1;
      const m = t.match(/^matrix\(([^)]+)\)$/);
      if (!m) return 0;
      const [a, b, c, d, e, f] = m[1].split(',').map(Number);
      if (Math.abs(b) > .01 || Math.abs(c) > .01 || Math.abs(e) > .5 || Math.abs(f) > .5) return 0;
      if (a > .99 && d > .99) return 1;
      if (a < -.99 && d < -.99) return -1;
      return 0;
    });
    list.forEach((r, i) => { if (out[i]) r.svg.style.transform = 'none'; });
    return out;
  }
  function adopt(scope) {
    const fresh = [];
    const all = scope.querySelectorAll ? [...scope.querySelectorAll('svg')] : [];
    if (scope.tagName === 'svg') all.push(scope);
    for (const svg of all) {
      if (chevrons.has(svg) || svg.dataset.foldIgnore != null || !svg.closest(TOGGLE)) continue;
      const g = geometry(svg);
      if (!g) continue;
      const r = Object.assign({svg, v: 1, from: 1, to: 1, t0: 0}, g);
      svg.style.transition = 'none';
      chevrons.set(svg, r); fresh.push(r);
    }
    if (!fresh.length) return;
    turned(fresh).forEach((v, i) => {
      const r = fresh[i];
      if (!v) { release(r); return; }
      r.v = r.from = r.to = v; draw(r);
    });
  }
  function settle(list) {
    turned(list).forEach((v, i) => {
      const r = list[i];
      if (!v) { release(r); return; }
      if (v === r.to) return;
      if (reduce.matches) { r.v = r.from = r.to = v; draw(r); return; }
      r.from = r.v; r.to = v; r.t0 = null;
      if (!r.flying) { r.flying = true; flying++; }
    });
    if (flying && !raf) raf = requestAnimationFrame(tick);
  }
  function tick(now) {
    raf = 0;
    for (const r of chevrons.values()) {
      if (!r.flying) continue;

      if (r.t0 == null) r.t0 = now - FRAME;
      const p = expo(Math.max(0, now - r.t0) / OPEN_MS);
      r.v = r.from + (r.to - r.from) * p;
      draw(r);
      if (p >= 1) { r.flying = false; flying--; }
    }
    if (flying) raf = requestAnimationFrame(tick);
  }

  const handled = new WeakSet(), inner = new WeakMap(), last = new WeakMap();

  function opens(box, kid) {
    let t = box.id && document.querySelector('[aria-controls~="' + CSS.escape(box.id) + '"][aria-expanded]');
    if (!t) { const up = box.previousElementSibling; t = up && (up.matches('[aria-expanded]') ? up : up.querySelector('[aria-expanded]')); }
    if (t) return t.getAttribute('aria-expanded') === 'true';
    const was = last.get(box);
    if (was && was.running) return !was.opening;
    return box.getBoundingClientRect().height < kid.scrollHeight - 1;
  }
  function dress(box, opening, transition) {
    const kid = box.firstElementChild;
    const dur = opening ? OPEN_MS : CLOSE_MS, ease = opening ? easing.open : easing.close, delay = opening ? 0 : -FRAME;
    const was = inner.get(box);
    const from = was ? +getComputedStyle(kid).opacity : (opening ? 0 : 1);
    if (was) was.forEach(a => a.cancel());
    box.dataset.nmFolding = opening ? 'open' : 'close';
    const anims = [
      kid.animate([{opacity: from, translate: '0 ' + (opening ? -LIFT_IN : 0) + 'px'},
        {opacity: opening ? 1 : 0, translate: '0 ' + (opening ? 0 : -LIFT_OUT) + 'px'}], {duration: dur, easing: ease, delay, fill: 'forwards'}),
      box.animate([{'--nm-fold-feather': (opening ? FEATHER : 0) + 'px'}, {'--nm-fold-feather': (opening ? 0 : FEATHER) + 'px'}],
        {duration: dur, easing: ease, delay, fill: 'forwards'}),
    ];
    inner.set(box, anims);

    Promise.allSettled([anims[0].finished, transition.finished]).then(() => {
      if (inner.get(box) !== anims) return;
      anims.forEach(a => a.cancel()); inner.delete(box); delete box.dataset.nmFolding;
    });
  }

  function retime() {
    let list;
    try { list = document.getAnimations(); } catch (_) { return; }
    for (const a of list) {
      if (handled.has(a) || a.transitionProperty !== 'grid-template-rows' || !a.effect || !a.effect.target) continue;
      handled.add(a);
      const box = a.effect.target, kid = box.firstElementChild;

      if (!kid || !/hidden|clip/.test(getComputedStyle(kid).overflowY)) continue;
      const opening = opens(box, kid), mark = {opening, running: true};
      last.set(box, mark);
      a.finished.then(() => { mark.running = false; }, () => { mark.running = false; });
      if (reduce.matches) continue;

      try { a.effect.updateTiming({duration: opening ? OPEN_MS : CLOSE_MS, easing: opening ? easing.open : easing.close, delay: opening ? 0 : -FRAME}); } catch (_) {}
      dress(box, opening, a);
    }
  }

  function unhide(el) {
    if (reduce.matches || el.hidden || el.dataset.nmFolding) return;
    const h = el.getBoundingClientRect().height;
    if (h < 2) return;
    el.dataset.nmFolding = 'open';
    const grow = el.animate([{height: '0px', overflow: 'clip'}, {height: h + 'px', overflow: 'clip'}], {duration: OPEN_MS, easing: easing.open});
    const kid = el.animate([{opacity: 0, translate: '0 ' + -LIFT_IN + 'px'}, {opacity: 1, translate: '0 0'}], {duration: OPEN_MS, easing: easing.open});
    const fea = el.animate([{'--nm-fold-feather': FEATHER + 'px'}, {'--nm-fold-feather': '0px'}], {duration: OPEN_MS, easing: easing.open});
    grow.finished.then(() => { kid.cancel(); fea.cancel(); delete el.dataset.nmFolding; }, () => {});
  }

  let pending = null, scanned = false;
  function flush() {
    const {scopes, toggled, shown, states} = pending; pending = null;
    if (!live()) return;
    if (!scanned) { scanned = true; adopt(document.documentElement); } else scopes.forEach(adopt);
    const list = [];
    if (toggled.size) for (const r of chevrons.values()) {
      if (!r.svg.isConnected) { chevrons.delete(r.svg); if (r.flying) flying--; continue; }
      for (const t of toggled) if (t.contains(r.svg)) { list.push(r); break; }
    }
    if (list.length) settle(list);
    if (states) retime();
    shown.forEach(unhide);
  }
  function queue() {
    if (!pending) { pending = {scopes: new Set(), toggled: new Set(), shown: new Set(), states: false}; queueMicrotask(flush); }
    return pending;
  }
  const OPEN_WORD = /^(open|is-open|opened|expanded|is-expanded|collapsed|closed)$/;
  function opensOrCloses(before, after) {
    const a = new Set(String(before || '').split(/\s+/)), b = new Set(String(after || '').split(/\s+/));
    for (const w of a) if (!b.has(w) && OPEN_WORD.test(w)) return true;
    for (const w of b) if (!a.has(w) && OPEN_WORD.test(w)) return true;
    return false;
  }
  const watch = new MutationObserver(records => {
    const q = queue();
    for (const m of records) {
      if (m.type === 'childList') { m.addedNodes.forEach(n => { if (n.nodeType === 1) q.scopes.add(n); }); continue; }

      if (m.target === document.documentElement || m.target === document.body) continue;

      if (m.attributeName === 'class' && !opensOrCloses(m.oldValue, m.target.getAttribute('class'))) continue;
      q.toggled.add(m.target);
      if (m.attributeName === 'aria-expanded' || m.attributeName === 'data-panel' || m.attributeName === 'open') q.states = true;
      if (m.attributeName === 'hidden' && !m.target.hidden && m.oldValue !== null) {
        const id = m.target.id;
        if (id && document.querySelector('[aria-controls~="' + CSS.escape(id) + '"][aria-expanded="true"]')) q.shown.add(m.target);
      }
    }
  });
  function start() {
    watch.observe(document.documentElement, {subtree: true, childList: true, attributes: true, attributeOldValue: true,
      attributeFilter: ['aria-expanded', 'class', 'data-panel', 'hidden', 'open']});
    queue();

    document.addEventListener('transitionrun', e => { if (e.propertyName === 'grid-template-rows' && live()) retime(); }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true}); else start();
  window.NMFold = Object.freeze({count: () => chevrons.size, OPEN_MS, CLOSE_MS});
})();

}

/** modern-copy.js — 복사 단추 누름 느낌(풍선 「복사됨」·그림 바뀜) */
export function startModernCopy() {
(() => {
  'use strict';
  const W = typeof window !== 'undefined' ? window : globalThis;

  const copiedLabel = label => {
    const s = String(label || '').trim() || '복사';
    if (/됨$/.test(s)) return s;
    return /복사$/.test(s) ? s + '됨' : s.replace(/복사(?!.*복사).*$/, '복사됨');
  };
  const splitLabels = (a, b) => {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return {pre: a.slice(0, i), a: a.slice(i), b: b.slice(i)};
  };

  const T = {
    tintIn: 180, tipDelay: 163, tipIn: 112, tipLift: 5,
    tipOut: 180, tintOutDelay: 138, tintOut: 196,
    sufOutDelay: 12, sufOut: 62, shift: 262, sufInDelay: 96, sufIn: 112,
    iconOut: 133, iconInDelay: 133, iconIn: 142, iconScale: .5,

    hold: 8483, touchHold: 1800,
    rIconOut: 121, rShiftDelay: 37, rShift: 250, rSufOutDelay: 12, rSufOut: 62, rSufInDelay: 100, rSufIn: 100,
    rIconInDelay: 125, rIconIn: 138, touchTipOutDelay: 287,
    armWindow: 1500, failSettle: 60, failHold: 1300
  };
  const E = {
    tintIn: 'cubic-bezier(0,0,.58,1)', tipIn: 'cubic-bezier(0,0,.58,1)', tipOut: 'cubic-bezier(.2,0,0,1)',
    tintOut: 'cubic-bezier(.25,.1,.25,1)', sufOut: 'cubic-bezier(.25,.1,.25,1)', shift: 'cubic-bezier(.2,0,0,1)',
    sufIn: 'linear', iconOut: 'cubic-bezier(.25,1,.5,1)', iconIn: 'cubic-bezier(.42,0,.58,1)',
    rIconOut: 'cubic-bezier(.22,1,.36,1)', rShift: 'cubic-bezier(.33,1,.68,1)', rSufIn: 'cubic-bezier(0,0,.58,1)',
    rIconIn: 'cubic-bezier(.42,0,.58,1)'
  };
  W.nmCopy = {copiedLabel, splitLabels, T};
  if (typeof document === 'undefined' || W.__nmCopyLayer) return;
  try { if (new URLSearchParams(location.search).get('ui') === 'classic') return; } catch (_) {}
  W.__nmCopyLayer = true;
  const doc = document, root = doc.documentElement;
  const modern = () => root.classList.contains('modern-workspace');
  const rm = W.matchMedia ? W.matchMedia('(prefers-reduced-motion: reduce)') : {matches: false};
  const now = () => performance.now();
  const CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';

  const labelOf = b => (b.getAttribute('aria-label') || b.getAttribute('data-nmc-title') || b.getAttribute('title') || '').trim();
  const isCopyBtn = b => {
    if (!b || b.disabled || b.closest('.nmc-tip')) return false;
    const l = labelOf(b);
    if (/붙여넣기|복사본|복제/.test(l)) return false;
    if (/복사/.test(l)) return true;
    return !!b.querySelector('svg rect[x="9"][y="9"]') && !(b.textContent || '').trim();
  };
  const copyBtnOf = node => {
    const b = node && node.closest ? node.closest('button,[role="button"]') : null;
    return b && isCopyBtn(b) ? b : null;
  };
  const iconOnly = b => !!b.querySelector('svg') && !(b.textContent || '').trim();
  const TEXTY = 'textarea,input:not([type]),input[type="text"],input[type="search"],input[type="url"],pre,code,output,[data-copy-target]';
  function targetOf(b) {
    const id = b.getAttribute('aria-controls');
    if (id) { const t = doc.getElementById(id); if (t) return t; }
    const wrap = b.closest('.iowrap');
    if (wrap) { const t = wrap.querySelector('textarea,input'); if (t) return t; }
    let p = b.parentElement;
    for (let i = 0; p && i < 3 && p !== doc.body; i++, p = p.parentElement) {
      const hit = Array.from(p.querySelectorAll(TEXTY)).filter(el => !b.contains(el) && !el.closest('.nmc-tip'));
      if (hit.length === 1) return hit[0];
      if (hit.length > 1) return null;
    }
    return null;
  }

  const S = new WeakMap();
  const st = b => { let s = S.get(b); if (!s) { s = {hover: false, phase: 'idle', tint: null, timers: []}; S.set(b, s); } return s; };
  const later = (s, fn, ms) => { const id = setTimeout(fn, ms); s.timers.push(id); return id; };
  const clearTimers = s => { s.timers.forEach(clearTimeout); s.timers = []; };
  const ms = v => rm.matches ? 0 : v;

  function anim(el, frames, dur, delay, easing, at) {
    if (!el) return null;
    const last = frames[frames.length - 1];
    Object.keys(last).forEach(k => { el.style[k] = last[k]; });
    if (rm.matches || !el.animate) return null;
    const a = el.animate(frames, {duration: dur, delay, easing, fill: 'backwards'});
    if (at != null) a.startTime = at;
    return a;
  }

  const sig = () => getComputedStyle(root).getPropertyValue('--modern-accent').trim();
  const tinted = s => !!(s.tint && s.tint._nmcOn);
  function tintOn(b, s, at) {
    const t = s.tint || (s.tint = targetOf(b));
    if (!t || t._nmcOn || !t.animate) return;
    const from = getComputedStyle(t).color;
    if (t._nmcA) t._nmcA.cancel();
    t._nmcOn = true;
    t.classList.add('nmc-tint');
    t._nmcA = t.animate([{color: from}, {color: sig()}], {duration: ms(T.tintIn), easing: E.tintIn, fill: 'forwards'});
    if (at != null && !rm.matches) t._nmcA.startTime = at;
  }
  function tintOff(s, delay, at) {
    const t = s.tint;
    if (!t || !t._nmcOn) return;
    t._nmcOn = false;
    const from = getComputedStyle(t).color;
    if (t._nmcA) t._nmcA.cancel();
    const base = getComputedStyle(t).color;
    const a = t._nmcA = t.animate([{color: from}, {color: base}], {duration: ms(T.tintOut), delay: ms(delay), easing: E.tintOut, fill: 'backwards'});
    if (at != null && !rm.matches) a.startTime = at;
    a.onfinish = () => { if (!t._nmcOn && t._nmcA === a) { t._nmcA = null; t.classList.remove('nmc-tint'); } };
  }

  let tip = null;
  function tipEl() {
    if (tip && tip.el.isConnected) return tip;
    const el = doc.createElement('div');
    el.className = 'nmc-tip';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<span class="nmc-tip-l"></span><span class="nmc-tip-r"></span><span class="nmc-tip-tail"></span>' +
      '<span class="nmc-tip-row"><span class="nmc-tip-pre"></span><span class="nmc-tip-a"></span><span class="nmc-tip-b"></span></span>';
    doc.body.appendChild(el);
    const q = c => el.querySelector(c);
    tip = {el, l: q('.nmc-tip-l'), r: q('.nmc-tip-r'), row: q('.nmc-tip-row'), pre: q('.nmc-tip-pre'), a: q('.nmc-tip-a'), b: q('.nmc-tip-b'), owner: null, geo: null, shown: false};
    return tip;
  }

  function tipPlace(b, s) {
    const t = tipEl();
    const A = labelOf(b) || '복사', B = copiedLabel(A), p = splitLabels(A, B);
    t.pre.textContent = p.pre; t.a.textContent = p.a; t.b.textContent = p.b;
    t.el.style.width = ''; t.el.style.left = '0px'; t.el.style.top = '0px';
    const pad = parseFloat(getComputedStyle(t.row).paddingLeft) || 12, wp = t.pre.offsetWidth, wa = t.a.offsetWidth, wb = t.b.offsetWidth;
    const Wa = wp + wa + pad * 2, Wb = wp + wb + pad * 2, Wm = Math.max(Wa, Wb), H = t.el.offsetHeight;
    t.a.style.left = t.b.style.left = wp + 'px';
    t.el.style.width = Wm + 'px';
    const r = b.getBoundingClientRect(), vw = doc.documentElement.clientWidth;
    let x = r.left + r.width / 2 - Wm / 2;
    x = Math.max(6, Math.min(x, vw - Wm - 6));
    const below = r.top < H + 14;
    const y = below ? r.bottom + 9 : r.top - H - 9;
    t.el.style.left = Math.round(x) + 'px'; t.el.style.top = Math.round(y) + 'px';
    t.el.classList.toggle('nmc-tip-below', below);
    const tail = r.left + r.width / 2 - Math.round(x);
    t.el.style.setProperty('--nmc-tail-x', Math.round(tail) + 'px');
    t.geo = {A: (Wm - Wa) / 2, B: (Wm - Wb) / 2, lift: below ? -T.tipLift : T.tipLift};
    t.owner = b;
    return t;
  }
  const half = (t, side) => ({l: `translateX(${t.geo[side]}px)`, r: `translateX(${-t.geo[side]}px)`, row: `translateX(${t.geo[side]}px)`});
  function tipSet(t, side) {
    const h = half(t, side);
    t.l.style.transform = h.l; t.r.style.transform = h.r; t.row.style.transform = h.row;
    t.a.style.opacity = side === 'A' ? '1' : '0'; t.b.style.opacity = side === 'B' ? '1' : '0';
  }
  function tipShow(b, s, side, delay, at) {
    const t = tipPlace(b, s);
    t.el.getAnimations && t.el.getAnimations().forEach(a => a.cancel());
    tipSet(t, side);
    t.shown = true;
    anim(t.el, [{opacity: '0', transform: `translateY(${t.geo.lift}px)`}, {opacity: '1', transform: 'translateY(0px)'}], ms(T.tipIn), ms(delay), E.tipIn, at);
  }
  function tipHide(b, delay, at) {
    const t = tip;
    if (!t || t.owner !== b || !t.shown) return;
    t.shown = false;
    anim(t.el, [{opacity: '1', transform: 'translateY(0px)'}, {opacity: '0', transform: `translateY(${t.geo.lift}px)`}], ms(T.tipOut), ms(delay), E.tipOut, at);
  }

  function tipCross(b, to, rev, at) {
    const t = tip;
    if (!t || t.owner !== b) return;
    const from = to === 'B' ? 'A' : 'B', hf = half(t, from), ht = half(t, to);
    const outEl = to === 'B' ? t.a : t.b, inEl = to === 'B' ? t.b : t.a;
    const sh = rev ? [ms(T.rShift), ms(T.rShiftDelay), E.rShift, at] : [ms(T.shift), 0, E.shift, at];
    anim(t.l, [{transform: hf.l}, {transform: ht.l}], ...sh);
    anim(t.r, [{transform: hf.r}, {transform: ht.r}], ...sh);
    anim(t.row, [{transform: hf.row}, {transform: ht.row}], ...sh);
    anim(outEl, [{opacity: '1'}, {opacity: '0'}], ms(rev ? T.rSufOut : T.sufOut), ms(rev ? T.rSufOutDelay : T.sufOutDelay), E.sufOut, at);
    anim(inEl, [{opacity: '0'}, {opacity: '1'}], ms(rev ? T.rSufIn : T.sufIn), ms(rev ? T.rSufInDelay : T.sufInDelay), rev ? E.rSufIn : E.sufIn, at);
  }

  const mo = W.MutationObserver ? new MutationObserver(recs => recs.forEach(r => {
    const b = r.target, s = S.get(b);
    if (s && s.ico && !s.ico.isConnected) b.appendChild(s.ico);
  })) : null;
  function icoMount(b, s) {
    if (s.ico) return s.ico;
    const svg = b.querySelector('svg');
    const ico = doc.createElement('span');
    ico.className = 'nmc-ico';
    ico.setAttribute('aria-hidden', 'true');
    const ca = doc.createElement('span'), cb = doc.createElement('span');
    ca.className = 'nmc-ico-copy'; cb.className = 'nmc-ico-check';
    if (svg) ca.appendChild(svg.cloneNode(true));
    cb.innerHTML = typeof CHECK_SVG === 'string' ? CHECK_SVG : CHECK;
    const cs = cb.firstElementChild;
    if (svg && cs) { ['width', 'height'].forEach(k => { const v = svg.getAttribute(k); if (v) cs.setAttribute(k, v); }); }
    cb.style.opacity = '0';
    ico.append(ca, cb);
    if (getComputedStyle(b).position === 'static') b.classList.add('nmc-rel');
    b.classList.add('nmc-busy');
    b.appendChild(ico);
    if (mo) mo.observe(b, {childList: true});
    s.ico = ico; s.icoCopy = ca; s.icoCheck = cb;
    return ico;
  }
  function icoUnmount(b, s) {
    if (!s.ico) return;
    if (mo) { mo.disconnect(); doc.querySelectorAll('.nmc-busy').forEach(x => { if (x !== b) mo.observe(x, {childList: true}); }); }
    s.ico.remove(); s.ico = s.icoCopy = s.icoCheck = null;
    b.classList.remove('nmc-busy', 'nmc-rel');
  }
  const scaleT = v => `scale(${v})`;

  let live = null;
  function announce(text) {
    if (!live || !live.isConnected) {
      live = doc.createElement('div');
      live.className = 'nmc-live'; live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite'); live.setAttribute('aria-atomic', 'true');
      doc.body.appendChild(live);
    }
    live.textContent = text;
    clearTimeout(live._t); live._t = setTimeout(() => { live.textContent = ''; }, 1500);
  }

  function stashTitle(b) { const t = b.getAttribute('title'); if (t != null) { b.setAttribute('data-nmc-title', t); b.removeAttribute('title'); } }
  function restoreTitle(b) { const t = b.getAttribute('data-nmc-title'); if (t != null) { if (!b.hasAttribute('title')) b.setAttribute('title', t); b.removeAttribute('data-nmc-title'); } }
  function enter(b, at) {
    const s = st(b);
    if (s.hover) return;
    s.hover = true;
    stashTitle(b);
    if (s.phase !== 'copied') tintOn(b, s, at);
    if (iconOnly(b)) tipShow(b, s, s.phase === 'copied' ? 'B' : 'A', T.tipDelay, at);
  }
  function leave(b, at) {
    const s = S.get(b);
    if (!s || !s.hover) return;
    s.hover = false;
    tipHide(b, 0, at);
    restoreTitle(b);
    if (s.phase !== 'copied') { tintOff(s, T.tintOutDelay, at); return; }
    clearTimers(s); s.revertAt = at; revert(b);
  }
  function copied(b, at) {
    const s = st(b);
    const again = s.phase === 'copied';
    clearTimers(s);
    s.phase = 'copied';
    if (!tinted(s)) tintOn(b, s, at);
    if (iconOnly(b) && !again) {
      if (!tip || tip.owner !== b || !tip.shown) tipShow(b, s, 'A', 0, at);
      tipCross(b, 'B', false, at);
      anim(s.icoCopy, [{opacity: '1', transform: scaleT(1)}, {opacity: '0', transform: scaleT(T.iconScale)}], ms(T.iconOut), 0, E.iconOut, at);
      anim(s.icoCheck, [{opacity: '0', transform: scaleT(T.iconScale)}, {opacity: '1', transform: scaleT(1)}], ms(T.iconIn), ms(T.iconInDelay), E.iconIn, at);
    }
    b.classList.add('nmc-copied');
    announce(copiedLabel(labelOf(b) || '복사'));
    s.revertAt = at + (s.hover ? T.hold : T.touchHold);
    later(s, () => revert(b), Math.max(0, s.revertAt - now()));
  }
  function revert(b) {
    const s = S.get(b);
    if (!s || s.phase !== 'copied') return;
    const at = s.revertAt;
    s.phase = 'idle';
    b.classList.remove('nmc-copied');
    if (s.ico) {
      anim(s.icoCheck, [{opacity: '1', transform: scaleT(1)}, {opacity: '0', transform: scaleT(T.iconScale)}], ms(T.rIconOut), 0, E.rIconOut, at);
      anim(s.icoCopy, [{opacity: '0', transform: scaleT(T.iconScale)}, {opacity: '1', transform: scaleT(1)}], ms(T.rIconIn), ms(T.rIconInDelay), E.rIconIn, at);
      later(s, () => { if (s.phase === 'idle') icoUnmount(b, s); }, ms(T.rIconInDelay + T.rIconIn) + 40);
    }
    if (tip && tip.owner === b && tip.shown) tipCross(b, 'A', true, at);
    if (!s.hover) {
      tipHide(b, T.touchTipOutDelay, at);
      tintOff(s, T.touchTipOutDelay + T.tintOutDelay, at);
    }
  }
  function failed(b) {
    const s = S.get(b);
    if (!s) return;

    later(s, () => { if (s.phase !== 'copied') icoUnmount(b, s); }, T.failHold);
  }

  let armed = null;
  function settle(a, ok) {
    if (a.done) return;
    if (ok) { a.done = true; if (armed === a) armed = null; copied(a.b, a.t); return; }
    clearTimeout(a.failT);
    a.failT = setTimeout(() => { if (a.done) return; a.done = true; if (armed === a) armed = null; failed(a.b); }, T.failSettle);
  }
  const attempt = () => (armed && !armed.done && now() - armed.t <= T.armWindow ? armed : null);
  function watch(p) {
    const a = attempt();
    if (!a || !p || typeof p.then !== 'function') return;
    a.calls++;
    p.then(() => settle(a, true), () => settle(a, false));
  }
  const cb = W.navigator && navigator.clipboard;
  if (cb) {
    ['writeText', 'write'].forEach(k => {
      const orig = cb[k];
      if (typeof orig !== 'function') return;
      cb[k] = function () { const p = orig.apply(cb, arguments); try { watch(p); } catch (_) {} return p; };
    });
  }
  const exec = doc.execCommand;
  if (typeof exec === 'function') {
    doc.execCommand = function (cmd) {
      const r = exec.apply(doc, arguments);
      if (/^copy$/i.test(String(cmd))) { const a = attempt(); if (a) { a.calls++; settle(a, !!r); } }
      return r;
    };
  }

  const stamp = e => (e.timeStamp > 0 && e.timeStamp <= now() ? e.timeStamp : now());
  doc.addEventListener('click', e => {
    if (!modern()) return;
    const b = copyBtnOf(e.target);
    if (!b) return;
    const s = st(b);
    if (iconOnly(b) && s.phase !== 'copied') icoMount(b, s);
    const a = {b, t: now(), calls: 0, done: false};
    armed = a;
    setTimeout(() => {
      if (a.done || a.calls) return;
      a.done = true; if (armed === a) armed = null;
      if (s.phase !== 'copied') icoUnmount(b, s);
    }, 600);
  }, true);
  doc.addEventListener('pointerover', e => {
    if (e.pointerType === 'touch' || !modern()) return;
    const b = copyBtnOf(e.target);
    if (b && !(e.relatedTarget && b.contains(e.relatedTarget))) enter(b, stamp(e));
  }, true);
  doc.addEventListener('pointerout', e => {
    if (e.pointerType === 'touch') return;
    const b = copyBtnOf(e.target);
    if (b && !(e.relatedTarget && b.contains(e.relatedTarget))) leave(b, stamp(e));
  }, true);
  doc.addEventListener('focusin', e => {
    if (!modern()) return;
    const b = copyBtnOf(e.target);
    if (b && b.matches(':focus-visible')) enter(b, stamp(e));
  }, true);
  doc.addEventListener('focusout', e => { const b = copyBtnOf(e.target); if (b) leave(b, stamp(e)); }, true);
  W.addEventListener('scroll', () => { if (tip && tip.shown && tip.owner) { tipHide(tip.owner, 0); } }, {capture: true, passive: true});
})();

}
