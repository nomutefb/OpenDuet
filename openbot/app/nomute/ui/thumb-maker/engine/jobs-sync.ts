// @ts-nocheck
// 서버 잡 맞추기 — 원본 = 에디터 viewer/nm-jobs.js 뒤 반(origin/main ee27c47b) 줄 그대로 · 주석만 뺌
//   바꾼 곳 = 한 번 도는 IIFE → startJobsSync()(화면 열 때) · document·window·타이머 = ./rt(닫으면 20초 맞추기·듣기 다 멈춤 = 원본 iframe 이 닫힌 것과 같음)
import { document, setInterval, window } from "./rt";

export function startJobsSync() {
(function () {
  if (!window.nmJobs) return;
  var TTL = 24 * 3600e3;
  var GONE = 'nm_jobs_gone';
  var API = '/api/jobs';

  var KEY_OF = {
    thumb: 'nm_thumb_pend', imgedit: 'nm_thumb_pend', resize: 'nm_thumb_pend', upscale: 'nm_thumb_pend',
    genimg: 'nm_thumb_pend', compose: 'nm_thumb_pend', comp: 'nm_thumb_pend', thumbredo: 'nm_thumb_pend',
    framethumb: 'nm_thumb_pend',
    edit: 'nm_edit_pend', conv: 'nm_conv_pend', nb: 'nm_nb_pend',
    track: 'nm_track_pend', k: 'k_pend', song: 'nm_song_pend', voice: 'nm_song_pend',
    sb: 'sb_jobs', vd: 'vd_jobs', ys: 'ys_jobs',
  };
  var LBL_OF = {
    thumb: '카드 제작', imgedit: '사진 편집', resize: '비율 맞추기', upscale: '화질 올리기',
    genimg: 'AI 생성', compose: '합성', comp: '합성', thumbredo: '수정', framethumb: '베스트컷 큐레이션',
    edit: '영상 편집', conv: '변환', nb: '미디어 요약', track: '트래킹',
    k: '프롬프트', song: '음원', voice: '보이스', sb: '콘티', vd: '큐영상', ys: '유튜브',
  };
  var ARR_KEY = { sb_jobs: 1, vd_jobs: 1, ys_jobs: 1 };

  function goneMap() {
    try {
      var g = JSON.parse(localStorage.getItem(GONE) || '{}');
      if (!g || typeof g !== 'object' || Array.isArray(g)) return {};
      var now = Date.now(), out = {};
      for (var k in g) { if (now - (+g[k] || 0) < TTL) out[k] = +g[k]; }
      return out;
    } catch (e) { return {}; }
  }
  function goneAdd(id) {
    if (!id) return;
    try {
      var g = goneMap(); g[String(id)] = Date.now();
      var ks = Object.keys(g);
      if (ks.length > 200) {
        ks.sort(function (a, b) { return g[a] - g[b]; });
        ks.slice(0, ks.length - 200).forEach(function (k) { delete g[k]; });
      }
      localStorage.setItem(GONE, JSON.stringify(g));
    } catch (e) {   }
  }
  function tellDone(id) {
    try {
      fetch(API, {
        method: 'POST', headers: { 'content-type': 'application/json' }, keepalive: true,
        body: JSON.stringify({ done: [String(id)] }),
      }).catch(function () {});
    } catch (e) {   }
  }

  function arrRead(key) { try { var a = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }

  function poke(key) {
    try { window.dispatchEvent(new StorageEvent('storage', { key: key })); return; } catch (e) {}
    try { var ev = document.createEvent('Event'); ev.initEvent('storage', false, false); ev.key = key; window.dispatchEvent(ev); } catch (e2) {}
  }

  var syncing = false;
  function sync() {
    if (syncing) return Promise.resolve(0);
    syncing = true;
    return fetch(API + '?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        var items = (d && Array.isArray(d.items)) ? d.items : [];
        if (!items.length) return 0;
        var gone = goneMap(), byKey = {}, n = 0;
        items.forEach(function (r) {
          if (!r || !r.id || gone[r.id]) return;
          if (Date.now() - (+r.t0 || 0) > TTL) return;
          var key = KEY_OF[r.kind]; if (!key) return;
          (byKey[key] = byKey[key] || []).push(r);
        });
        Object.keys(byKey).forEach(function (key) {
          var add = 0;
          if (ARR_KEY[key]) {

            var a = arrRead(key), have = {};
            a.forEach(function (x) { if (x && x.id) have[x.id] = 1; });
            byKey[key].forEach(function (r) {
              if (have[r.id]) return;
              a.unshift({ id: r.id, out: r.out || '', ts: +r.t0 || Date.now(), label: (typeof r.lbl === 'string' && r.lbl) ? String(r.lbl).slice(0, 80) : (LBL_OF[r.kind] || '제작'), status: 'run', _remote: 1 });
              add++;
            });
            if (!add) return;
            try { localStorage.setItem(key, JSON.stringify(a.slice(0, 30))); } catch (e) { return; }
            try { if (window.nmRail && typeof nmRail.refresh === 'function') nmRail.refresh(); } catch (e) {}
          } else {
            var have2 = {};
            try { (nmJobs.list(key) || []).forEach(function (x) { have2[x.id] = 1; (Array.isArray(x.thids) ? x.thids : []).forEach(function (t) { have2[String(t)] = 1; }); }); } catch (e) {}
            byKey[key].forEach(function (r) {
              if (have2[r.id]) return;
              var j = { id: r.id, t0: +r.t0 || Date.now(), lbl: (typeof r.lbl === 'string' && r.lbl) ? String(r.lbl).slice(0, 80) : (LBL_OF[r.kind] || '제작'), _remote: 1 };
              if (r.out) j.out = r.out;
              if (r.outs) j.outs = r.outs;
              if (r.mode) j.mode = r.mode;
              if (typeof r.bid === 'string' && /^[A-Za-z0-9-]{1,40}$/.test(r.bid)) j.bid = r.bid;
              if (r.bi != null && isFinite(+r.bi)) j.bi = +r.bi;
              try { nmJobs.add(key, j); add++; } catch (e) {}
            });
            if (!add) return;
          }
          n += add;
          poke(key);
        });
        return n;
      })
      .catch(function () { return 0; })
      .then(function (n) { syncing = false; return n; });
  }

  nmJobs.sync = sync;
  nmJobs.gone = goneAdd;

  var _drop = nmJobs.drop;
  nmJobs.drop = function (key, id) {
    try {
      if (id == null) { (nmJobs.list(key) || []).forEach(function (x) { goneAdd(x.id); tellDone(x.id); }); }
      else { goneAdd(id); tellDone(id); }
    } catch (e) {}
    return _drop.call(nmJobs, key, id);
  };

  var last = 0;
  function kick() { var t = Date.now(); if (t - last < 5e3) return; last = t; sync(); }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });
  window.addEventListener('focus', kick);
  window.addEventListener('pageshow', function (e) { if (e && e.persisted) { last = 0; kick(); } });
  setInterval(function () { if (!document.hidden) sync(); }, 20000);
  sync();
})();
}
