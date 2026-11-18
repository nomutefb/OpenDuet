// @ts-nocheck
/* 만든 파일 — 손으로 고치지 말 것(ui/old-pages/tools/gen.mjs · 옛 에디터 viewer 의 song.html 화면)
   원본 = song.html + tokens.css · nm-shared.css · nm-cards.css · nm-hist.css · nm-job.css · nm-clip.css · nm-scene-tokens.css · nm-scene.css + nm-wave.js · nm-scene.js · nm-svg.js · nm-ua.js · nm-rail.js · nm-jobs.js · nm-clip.js · nm-sync.js · nm-loader.js · nm-gauge.js · master.js · upload.js · cscroll.js */
import { SHEETS, FONTS } from "./css.gen";
import { LIB } from "./lib.gen";
function inline1(window, document, __nm) {
if (window.self !== window.top) document.documentElement.classList.add('inmodal');
}
function inline2(window, document, __nm) {
__nm.ex({"$":[()=>$],"$$":[()=>$$],"esc":[()=>esc],"PEND_KEY":[()=>PEND_KEY],"API":[()=>API],"API_VOICE":[()=>API_VOICE],"BUDGET":[()=>BUDGET],"BUDGETS":[()=>BUDGETS],"USER_ACT":[()=>USER_ACT,(v)=>{USER_ACT=v;}],"RES":[()=>RES,(v)=>{RES=v;}],"OPTS":[()=>OPTS,(v)=>{OPTS=v;}],"PICK":[()=>PICK,(v)=>{PICK=v;}],"SONG_ID":[()=>SONG_ID,(v)=>{SONG_ID=v;}],"FOCUS_ID":[()=>FOCUS_ID,(v)=>{FOCUS_ID=v;}],"GAUGE":[()=>GAUGE],"SONG_LEN_MIN":[()=>SONG_LEN_MIN],"SONG_LEN_MAX":[()=>SONG_LEN_MAX],"SONG_LEN_STEP":[()=>SONG_LEN_STEP],"SONG_LEN_DEF":[()=>SONG_LEN_DEF],"SONG_LEN_PTS":[()=>SONG_LEN_PTS],"songHook":[()=>songHook],"vocName":[()=>vocName],"vocLabel":[()=>vocLabel],"gaugeLive":[()=>gaugeLive],"SPEC_READY":[()=>SPEC_READY,(v)=>{SPEC_READY=v;}],"pendSet":[()=>pendSet],"pendGet":[()=>pendGet],"pendClear":[()=>pendClear],"closeSelPops":[()=>closeSelPops,(v)=>{closeSelPops=v;}],"selCtl":[()=>selCtl,(v)=>{selCtl=v;}],"getGen":[()=>getGen],"getMood":[()=>getMood],"getTheme":[()=>getTheme],"getExp":[()=>getExp],"AUTO_AXES":[()=>AUTO_AXES],"auto4":[()=>auto4],"AUTO_MEM":[()=>AUTO_MEM,(v)=>{AUTO_MEM=v;}],"setAuto4":[()=>setAuto4,(v)=>{setAuto4=v;}],"geniRailUpd":[()=>geniRailUpd,(v)=>{geniRailUpd=v;}],"geniRailSetup":[()=>geniRailSetup,(v)=>{geniRailSetup=v;}],"fmtT":[()=>fmtT],"btnErr":[()=>btnErr,(v)=>{btnErr=v;}],"_stTick":[()=>_stTick,(v)=>{_stTick=v;}],"statusWait":[()=>statusWait,(v)=>{statusWait=v;}],"WL":[()=>WL],"goFire":[()=>goFire,(v)=>{goFire=v;}],"goIdle":[()=>goIdle,(v)=>{goIdle=v;}],"fireApi":[()=>fireApi,(v)=>{fireApi=v;}],"fire":[()=>fire,(v)=>{fire=v;}],"pollSong":[()=>pollSong,(v)=>{pollSong=v;}],"updateGoSpec":[()=>updateGoSpec,(v)=>{updateGoSpec=v;}],"axL":[()=>axL],"axLv":[()=>axLv],"lenPct":[()=>lenPct],"drawLen":[()=>drawLen,(v)=>{drawLen=v;}],"setLen":[()=>setLen,(v)=>{setLen=v;}],"renderOptions":[()=>renderOptions,(v)=>{renderOptions=v;}],"showSuno":[()=>showSuno,(v)=>{showSuno=v;}],"showLyria":[()=>showLyria,(v)=>{showLyria=v;}],"CPV":[()=>CPV],"MA":[()=>MA],"MA_DEF":[()=>MA_DEF],"MA_SRCURL":[()=>MA_SRCURL,(v)=>{MA_SRCURL=v;}],"MA_BUF":[()=>MA_BUF,(v)=>{MA_BUF=v;}],"MA_OUTBUF":[()=>MA_OUTBUF,(v)=>{MA_OUTBUF=v;}],"MA_URL":[()=>MA_URL,(v)=>{MA_URL=v;}],"MA_ORIGSRC":[()=>MA_ORIGSRC,(v)=>{MA_ORIGSRC=v;}],"MA_FMT":[()=>MA_FMT],"MA_KEY":[()=>MA_KEY],"MA_UNIT":[()=>MA_UNIT],"maPaint":[()=>maPaint,(v)=>{maPaint=v;}],"maBind":[()=>maBind,(v)=>{maBind=v;}],"MA_MAC":[()=>MA_MAC],"MA_MAC_TINT":[()=>MA_MAC_TINT],"MA_BANDS":[()=>MA_BANDS],"maDrawEq":[()=>maDrawEq,(v)=>{maDrawEq=v;}],"maFold":[()=>maFold,(v)=>{maFold=v;}],"paintVoc":[()=>paintVoc,(v)=>{paintVoc=v;}],"setVoc":[()=>setVoc,(v)=>{setVoc=v;}],"MA_EQP":[()=>MA_EQP],"maPreCustom":[()=>maPreCustom,(v)=>{maPreCustom=v;}],"maLoad":[()=>maLoad,(v)=>{maLoad=v;}],"maDb":[()=>maDb],"PLIST":[()=>PLIST,(v)=>{PLIST=v;}],"PIDX":[()=>PIDX,(v)=>{PIDX=v;}],"hpop":[()=>hpop],"hRow":[()=>hRow,(v)=>{hRow=v;}],"renderList":[()=>renderList,(v)=>{renderList=v;}],"openHist":[()=>openHist,(v)=>{openHist=v;}],"_hSig":[()=>_hSig,(v)=>{_hSig=v;}],"pollHist":[()=>pollHist,(v)=>{pollHist=v;}],"playIdx":[()=>playIdx,(v)=>{playIdx=v;}],"VOICES":[()=>VOICES,(v)=>{VOICES=v;}],"VSEL":[()=>VSEL,(v)=>{VSEL=v;}],"VFILE":[()=>VFILE,(v)=>{VFILE=v;}],"VFNAME":[()=>VFNAME,(v)=>{VFNAME=v;}],"VRAW":[()=>VRAW,(v)=>{VRAW=v;}],"VR2":[()=>VR2,(v)=>{VR2=v;}],"vcRender":[()=>vcRender,(v)=>{vcRender=v;}],"vcLoad":[()=>vcLoad,(v)=>{vcLoad=v;}],"pollVoice":[()=>pollVoice,(v)=>{pollVoice=v;}],"edFocus":[()=>edFocus,(v)=>{edFocus=v;}],"PVZOOM":[()=>PVZOOM]});
const $ = s => document.querySelector(s),
  $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[c]);
const PEND_KEY = 'nm_song_pend';
const API = '/api/song';
const API_VOICE = '/api/voice';
const BUDGET = 1000;
const BUDGETS = {
  voice: 2600,
  'voice-train': 5400
};
let USER_ACT = false,
  RES = null,
  OPTS = [],
  PICK = null,
  SONG_ID = '',
  FOCUS_ID = '';
const GAUGE = {
  w: 50,
  s: 50,
  v: '',
  g: 0,
  t: 60
};
const SONG_LEN_MIN = 10,
  SONG_LEN_MAX = 60,
  SONG_LEN_STEP = 5,
  SONG_LEN_DEF = 60,
  SONG_LEN_PTS = [10, 20, 30, 40, 50, 60];
const songHook = sec => Math.max(3, Math.min(15, Math.round(sec / 4)));
const vocName = g => g < 0 ? '남성' : g > 0 ? '여성' : '중성';
const vocLabel = g => g === 0 ? '중성' : vocName(g) + ' ' + Math.abs(g) + '%';
const gaugeLive = () => GAUGE.w < 40 || GAUGE.w > 60 || GAUGE.s < 40 || GAUGE.s > 60 || !!GAUGE.v || GAUGE.t !== SONG_LEN_DEF;
let SPEC_READY = false;
const pendSet = o => {
  try {
    window.nmJobs.add(PEND_KEY, o);
  } catch (e) {}
};
const pendGet = () => {
  try {
    return window.nmJobs.list(PEND_KEY)[0] || null;
  } catch (e) {
    return null;
  }
};
const pendClear = id => {
  try {
    window.nmJobs.drop(PEND_KEY, id);
  } catch (e) {}
};
function closeSelPops(except) {
  $$('.selpop').forEach(p => {
    if (p !== except) p.classList.add('none');
  });
}
function selCtl(gridId, freeId, inId, def) {
  const grid = $(gridId),
    free = freeId ? $(freeId) : null,
    inp = inId ? $(inId) : null;
  const presets = () => [...grid.querySelectorAll('.geni-opt[data-v]')].map(b => b.dataset.v);
  let val = def,
    freeOpen = false;
  const paint = () => {
    const custom = freeOpen || !presets().includes(val);
    grid.querySelectorAll('.geni-opt').forEach(b => {
      const on = b.hasAttribute('data-free') ? custom : !custom && b.dataset.v === val;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (free) free.classList.toggle('none', !custom);
  };
  const set = (x, fromFree) => {
    val = ((x || '').trim() || def).slice(0, 40);
    if (!fromFree) freeOpen = false;
    paint();
    if (SPEC_READY) updateGoSpec();
  };
  set(val);
  grid.addEventListener('click', e => {
    const b = e.target.closest('.geni-opt');
    if (!b) return;
    if (b.hasAttribute('data-free')) {
      freeOpen = true;
      paint();
      if (inp) {
        if (!presets().includes(val) && val !== def) inp.value = val;
        inp.focus();
      }
      return;
    }
    set(b.dataset.v);
  });
  if (inp) {
    inp.addEventListener('input', () => set(inp.value, true));
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        inp.blur();
      }
    });
  }
  const get = () => val;
  get.set = v => set(v);
  return get;
}
const getGen = selCtl('#genPop', '#genFree', '#genreIn', '자동');
const getMood = selCtl('#moodPop', '#moodFree', '#moodIn', '자동');
const getTheme = selCtl('#themePop', '#themeFree', '#themeIn', '자동');
const getExp = selCtl('#expPop', '#expFree', '#expIn', '자동');
const AUTO_AXES = [getGen, getMood, getTheme, getExp];
const auto4 = () => AUTO_AXES.every(f => f() === '자동');
let AUTO_MEM = null;
function setAuto4(on) {
  if (on) {
    const cur = AUTO_AXES.map(f => f());
    if (cur.some(v => v !== '자동')) AUTO_MEM = cur;
    AUTO_AXES.forEach(f => f.set('자동'));
    return true;
  }
  if (!AUTO_MEM || !AUTO_MEM.some(v => v !== '자동')) return false;
  AUTO_AXES.forEach((f, i) => f.set(AUTO_MEM[i]));
  return true;
}
function geniRailUpd(rail) {
  if (!rail) return;
  const max = rail.scrollWidth - rail.clientWidth,
    sl = rail.scrollLeft;
  const atS = sl <= 1,
    atE = max <= 1 || sl >= max - 1;
  rail.classList.toggle('atStart', atS);
  rail.classList.toggle('atEnd', atE);
  const wrap = rail.closest('.geni-railwrap');
  if (wrap) {
    const nv = wrap.querySelectorAll('.geni-nav');
    if (nv[0]) nv[0].disabled = atS;
    if (nv[1]) nv[1].disabled = atE;
  }
}
function geniRailSetup(sel) {
  const rail = $(sel);
  if (!rail || rail._railSet) return;
  rail._railSet = true;
  let down = false,
    moved = false,
    sx = 0,
    sl = 0;
  rail.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    down = true;
    moved = false;
    sx = __nm.cx(e);
    sl = rail.scrollLeft;
    rail.classList.add('grabbing');
  });
  rail.addEventListener('pointermove', e => {
    if (!down) return;
    const dx = __nm.cx(e) - sx;
    if (Math.abs(dx) > 4) moved = true;
    rail.scrollLeft = sl - dx;
  });
  const end = () => {
    down = false;
    rail.classList.remove('grabbing');
  };
  rail.addEventListener('pointerup', end);
  rail.addEventListener('pointerleave', end);
  rail.addEventListener('click', e => {
    if (moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
  rail.addEventListener('scroll', () => geniRailUpd(rail), {
    passive: true
  });
  const wrap = rail.closest('.geni-railwrap');
  if (wrap) wrap.querySelectorAll('.geni-nav').forEach(btn => btn.addEventListener('click', () => rail.scrollBy({
    left: +btn.dataset.dir * Math.max(110, rail.clientWidth * 0.7),
    behavior: 'smooth'
  })));
  geniRailUpd(rail);
}
['#genPop', '#moodPop', '#themePop', '#expPop'].forEach(geniRailSetup);
window.addEventListener('resize', () => ['#genPop', '#moodPop', '#themePop', '#expPop'].forEach(s => geniRailUpd($(s))), {
  passive: true
});
document.addEventListener('pointerdown', e => {
  if (!e.target.closest('.selpop') && !e.target.closest('.selv')) closeSelPops();
}, {
  capture: true
});
const fmtT = s => {
  s = Math.max(0, Math.round(s));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
};
function btnErr(g, m) {
  if (!g) return;
  if (!g.dataset.label) g.dataset.label = g.textContent;
  window.clearTimeout(g._errT);
  window.clearTimeout(g._fT1);
  window.clearTimeout(g._fT2);
  window.clearTimeout(g._fT3);
  g.classList.remove('firing', 'okdone', 'checking');
  g.removeAttribute('aria-busy');
  g.textContent = m;
  g.setAttribute('aria-live', 'assertive');
  g.classList.add('err');
  g.classList.remove('shake');
  void g.offsetWidth;
  g.classList.add('shake');
  g._errT = window.setTimeout(() => {
    g.classList.remove('err', 'shake');
    g.textContent = g.dataset.label;
  }, 1700);
}
let _stTick = null;
function statusWait(on, t0, label, mode) {
  const st = $('#sstatus');
  window.clearInterval(_stTick);
  _stTick = null;
  if (on) {
    st.classList.remove('err');
    st.classList.add('wait');
    if (window.nmLoader) {
      st.innerHTML = __nm.h(window.nmLoader('solving', '제작중…') + '<span class="gtime nm-shim"></span>');
      const gt = st.querySelector('.gtime');
      const eta = window.nmEta ? window.nmEta.label(mode && /voice/.test(mode) ? 'song-voice' : 'song') : '';
      const paint = () => {
        if (gt) gt.textContent = fmtT((Date.now() - t0) / 1000) + eta;
      };
      paint();
      _stTick = window.setInterval(paint, 1000);
    } else {
      const paint = () => {
        st.innerHTML = __nm.h(esc(label || '생성 중') + '…<span class="gtime">' + fmtT((Date.now() - t0) / 1000) + '</span>');
      };
      paint();
      _stTick = window.setInterval(paint, 1000);
    }
  } else {
    st.classList.remove('wait');
  }
}
const WL = {
  options: '옵션 생성 중',
  suno: '프롬프트 생성 중',
  lyria: '곡 만드는 중',
  voice: '보이스 입히는 중'
};
function goFire(gb) {
  if (!gb.dataset.label) gb.dataset.label = gb.textContent;
  window.clearTimeout(gb._fT1);
  window.clearTimeout(gb._fT2);
  window.clearTimeout(gb._fT3);
  window.clearTimeout(gb._errT);
  gb.classList.remove('firing', 'okdone', 'checking', 'err', 'shake');
  void gb.offsetWidth;
  gb.classList.add('firing');
  gb.textContent = '전송 중…';
  gb.setAttribute('aria-busy', 'true');
  gb._fT1 = window.setTimeout(() => {
    gb.classList.remove('firing');
    gb.classList.add('okdone', 'checking');
    gb.innerHTML = __nm.h('<svg class="gck" viewBox="0 0 24 24" role="img" aria-label="전송됨"><path d="M5 13l4 4L19 7"/></svg>');
    gb.removeAttribute('aria-busy');
    gb._fT2 = window.setTimeout(() => {
      gb.classList.remove('checking');
      gb.textContent = '전송됨';
      gb._fT3 = window.setTimeout(() => {
        gb.classList.remove('okdone');
        gb.textContent = gb.dataset.label || '';
      }, 850);
    }, 560);
  }, 900);
}
function goIdle(gb) {
  if (!gb) return;
  window.clearTimeout(gb._fT1);
  window.clearTimeout(gb._fT2);
  window.clearTimeout(gb._fT3);
  gb.classList.remove('firing', 'okdone', 'checking');
  gb.removeAttribute('aria-busy');
  if (gb.dataset.label) gb.textContent = gb.dataset.label;
}
async function fireApi(gb, url, payload, onAccept) {
  USER_ACT = true;
  const status = $('#sstatus');
  status.classList.remove('err', 'wait');
  status.textContent = '';
  const t0 = Date.now();
  goFire(gb);
  try {
    const res = await window.fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const j = await res.json();
    if (!res.ok || j.error) {
      goIdle(gb);
      const _m = String(j.error || '서버 오류 ' + res.status + ' — 재시도');
      status.innerHTML = __nm.h(window.WARN_SVG + ' ' + esc(_m));
      status.classList.add('err');
      return _m;
    }
    onAccept(j, t0);
    return '';
  } catch (e) {
    goIdle(gb);
    const _au = e && e.name === 'TypeError' && /^(failed to fetch|load failed|networkerror when attempting to fetch resource)/i.test(String(e.message || '')) && window.nmSync && window.nmSync.probeNow ? (await window.nmSync.probeNow()) === 'auth' : false;
    status.innerHTML = __nm.h(window.WARN_SVG + ' ' + (_au ? '로그인이 만료됐어 — 도구 닫고 다시 로그인해줘' : '요청 실패 — 재시도 (' + esc(e.message) + ')'));
    status.classList.add('err');
    return '';
  }
}
function fire(mode, gb) {
  const story = $('#story').value.trim();
  if (!story) return btnErr(gb, '스토리(대사나 상황)를 적어줘');
  const _sln = (story.split('\n').find(s => s.trim()) || '').replace(/\s+/g, ' ').trim();
  const _slbl = _sln ? _sln.slice(0, 16) + (_sln.length > 16 ? '…' : '') : mode === 'options' ? '음원 옵션' : '음원';
  const payload = {
    mode,
    genre: getGen(),
    express: getExp(),
    mood: getMood(),
    theme: getTheme(),
    story: story.slice(0, 1500),
    lbl: _slbl
  };
  if (mode !== 'options' && PICK) payload.pick = PICK;
  if (mode !== 'options' && gaugeLive()) payload.opts = {
    w: GAUGE.w,
    s: GAUGE.s,
    v: GAUGE.v,
    vg: Math.abs(GAUGE.g),
    t: GAUGE.t
  };
  fireApi(gb, API, payload, (j, t0) => {
    pendSet({
      id: j.id,
      mode,
      t0,
      lbl: _slbl,
      story: story.slice(0, 1500)
    });
    pollSong(j.id, mode, t0, t0 - 90000, gb);
  });
}
$('#optGo').addEventListener('click', () => fire('options', $('#optGo')));
$('#sunoGo').addEventListener('click', () => fire('suno', $('#sunoGo')));
$('#lyriaGo').addEventListener('click', () => fire('lyria', $('#lyriaGo')));
window.nmJobOpen = function (id) {
  let p = null;
  try {
    p = window.nmJobs.get(PEND_KEY, id);
  } catch (e) {}
  if (!p) return false;
  const md = p.mode || 'suno',
    t0c = Math.max(p.t0 || 0, Date.now() - (BUDGETS[md] || BUDGET) * 1000);
  let busy = false;
  try {
    busy = window.nmJobs.busy(PEND_KEY, id);
  } catch (e) {}
  FOCUS_ID = id;
  if (md !== 'voice-train') SONG_ID = id;
  if (busy) statusWait(true, t0c, md === 'voice-train' ? '보이스 학습 중' : WL[md] || '생성 중', md);else if (md === 'voice-train') pollVoice(id, t0c, (p.t0 || 0) - 90000, true);else pollSong(id, md, t0c, (p.t0 || 0) - 90000, null, true);
  try {
    $('#sstatus').scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth',
      block: 'center'
    });
  } catch (e) {}
  return true;
};
function pollSong(id, mode, t0, minTs, gb, focus) {
  focus = focus !== false;
  try {
    if (window.nmJobs.busy(PEND_KEY, id)) return;
  } catch (e) {}
  if (focus) {
    SONG_ID = id;
    FOCUS_ID = id;
  }
  const mine = () => FOCUS_ID === id;
  const status = $('#sstatus');
  if (focus) statusWait(true, t0, WL[mode] || '생성 중', mode);
  const outPath = 'song_out/' + id + '/' + (mode === 'options' ? 'options.json' : 'song.json');
  const errPath = 'song_out/' + id + '/error.log';
  let live = true;
  const stop = () => {
    live = false;
    if (mine()) statusWait(false);
    try {
      window.nmJobs.free(PEND_KEY, id);
    } catch (e) {}
  };
  try {
    window.nmJobs.hold(PEND_KEY, id, stop);
  } catch (e) {}
  const need = mode === 'options' ? 'options' : mode === 'voice' ? 'url' : 'lyrics';
  const budget = BUDGETS[mode] || BUDGET;
  const tick = async () => {
    if (!live) return;
    if (Date.now() - t0 > budget * 2000) {
      const _m = mine();
      stop();
      pendClear(id);
      if (!_m) return;
      status.innerHTML = __nm.h(window.ERR_SVG + ' 시간 초과 — 완성되면 다음에 열 때 이어받아');
      status.classList.add('err');
      return;
    }
    try {
      const er = await window.fetch(errPath + '?t=' + Date.now());
      if (!live) return;
      if (er.ok) {
        const ect = (er.headers.get('content-type') || '').toLowerCase();
        const em = await er.text();
        if (!live) return;
        const eHtml = ect.includes('text/html') || /^\s*<!doctype/i.test(em) || /<html[\s>]/i.test(em.slice(0, 300));
        if (em && em.trim() && !eHtml) {
          const _m = mine();
          stop();
          pendClear(id);
          if (!_m) return;
          status.innerHTML = __nm.h(window.ERR_SVG + ' ' + esc(em.trim().slice(0, 300)));
          status.classList.add('err');
          return;
        }
      }
    } catch (e) {}
    try {
      const r = await window.fetch(outPath + '?t=' + Date.now());
      if (!live) return;
      if (r.ok) {
        const ct = (r.headers.get('content-type') || '').toLowerCase();
        const tx = await r.text();
        if (!live) return;
        const isHtml = ct.includes('text/html') || /^\s*<!doctype/i.test(tx) || /<html[\s>]/i.test(tx.slice(0, 300));
        if (tx && tx.trim() && !isHtml) {
          let d = null;
          try {
            d = JSON.parse(tx);
          } catch (e) {}
          if (d && d[need]) {
            const ts = Date.parse(d.ts || '');
            if (!isNaN(ts) && ts >= minTs) {
              const _m = mine();
              stop();
              pendClear(id);
              if (!_m) {
                try {
                  if (d.url && window.nmRail) window.nmRail.add({
                    url: String(d.url),
                    cap: '음원',
                    dlname: String(d.url).split('/').pop() || 'song.mp3'
                  });
                } catch (e) {}
                return;
              }
              if (window.nmEta) window.nmEta.done(mode && /voice/.test(mode) ? 'song-voice' : 'song', (Date.now() - t0) / 1000);
              try {
                if (d.url && window.nmRail) window.nmRail.add({
                  url: String(d.url),
                  cap: '음원',
                  dlname: String(d.url).split('/').pop() || 'song.mp3'
                });
              } catch (e) {}
              if (mode === 'options') renderOptions(d, Math.round((Date.now() - t0) / 1000));else if (d.engine === 'lyria' || d.engine === 'rvc' || d.url) showLyria(d, Math.round((Date.now() - t0) / 1000));else showSuno(d, Math.round((Date.now() - t0) / 1000));
              return;
            }
          }
        }
      }
    } catch (e) {}
    if (live) window.setTimeout(tick, 5000);
  };
  tick();
}
function updateGoSpec() {
  const gs = $('#goSpec');
  if (!gs) return;
  const v = (x, on) => '<span class="gs-v' + (on ? ' on' : '') + '">' + esc(x) + '</span>';
  const sep = '<span class="gs-sep">|</span>';
  const ge = getGen(),
    mo = getMood(),
    th = getTheme(),
    ex = getExp();
  const L = x => '<span class="gs-lbl">' + x + '</span> ';
  const tap = (txt, key, tip, on) => '<span class="gs-v' + (on ? ' on' : '') + ' gs-tog" data-tap="' + key + '" data-fk="tap|' + key + '" role="button" tabindex="0" title="' + esc(tip) + '">' + esc(txt) + '</span>';
  const AU = auto4();
  gs.innerHTML = __nm.h(L('자동') + tap('자동', 'auto', AU ? '켜짐 = 장르·분위기·테마·표현방식 4축 전부 자동' + (AUTO_MEM && AUTO_MEM.some(x => x !== '자동') ? ' · 탭=직전 수동 설정으로 되돌리기' : ' · 되돌릴 수동 설정 없음') : '꺼짐 = 아래 4축(장르·분위기·테마·표현방식) 설정을 따름 · 탭=4축 전부 자동으로', AU) + (PICK ? sep + L('스타일') + v(PICK.name, true) : '') + (PICK && PICK.vocal ? sep + L('보컬') + v(PICK.vocal, true) : sep + L('보컬') + tap(vocLabel(GAUGE.g), 'voc', '탭=보컬 성별 순환(남성 → 중성 → 여성) · 중간 강도는 아래 「고급」 보컬 게이지', GAUGE.g !== 0)) + (PICK && PICK.bpm ? sep + L('BPM') + v(PICK.bpm, true) : '') + (ge !== '자동' ? sep + L('장르') + v(ge, true) : '') + (mo !== '자동' ? sep + L('분위기') + v(mo, true) : '') + (th !== '자동' ? sep + L('테마') + v(th, true) : '') + (ex !== '자동' ? sep + L('표현방식') + v(ex, true) : '') + (GAUGE.w !== 50 ? sep + L('실험성') + v(GAUGE.w + '%', true) : '') + (GAUGE.s !== 50 ? sep + L('장르 충실') + v(GAUGE.s + '%', true) : '') + sep + L('길이') + tap(GAUGE.t + '초', 'len', '탭=길이 포인트 순환(10 → 20 → 30 → 40 → 50 → 60초) · 5초 단위는 아래 「설계」 길이 자(ruler)', GAUGE.t !== SONG_LEN_DEF) + sep + L('훅') + v('훅 ' + songHook(GAUGE.t) + '초', GAUGE.t !== SONG_LEN_DEF));
}
(function () {
  const host = $('#goSpec');
  if (!host) return;
  const doTap = k => {
    if (k === 'auto') setAuto4(!auto4());else if (k === 'voc') setVoc(GAUGE.g < 0 ? 0 : GAUGE.g === 0 ? 100 : -100);else if (k === 'len') {
      const nx = SONG_LEN_PTS.find(s => s > GAUGE.t);
      setLen(nx === undefined ? SONG_LEN_PTS[0] : nx);
    }
  };
  host.addEventListener('click', e => {
    const t = e.target.closest('.gs-tog[data-tap]');
    if (!t) return;
    e.stopPropagation();
    doTap(t.dataset.tap);
  });
  host.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const t = e.target.closest('.gs-tog[data-tap]');
    if (!t) return;
    e.preventDefault();
    e.stopPropagation();
    const k = t.dataset.tap;
    doTap(k);
    const n = host.querySelector('[data-fk="tap|' + k + '"]');
    if (n) try {
      n.focus({
        preventScroll: true
      });
    } catch (_) {}
  });
})();
const axL = $('#axLen'),
  axLv = $('#axLenV');
const lenPct = s => (s - SONG_LEN_MIN) / (SONG_LEN_MAX - SONG_LEN_MIN) * 100;
function drawLen() {
  if (!axL) return;
  const cur = GAUGE.t,
    n = (SONG_LEN_MAX - SONG_LEN_MIN) / SONG_LEN_STEP + 1,
    half = 100 / (n - 1) / 2;
  const lbls = SONG_LEN_PTS.map(s => '<i' + (s === cur ? ' class="on"' : '') + ' style="left:' + lenPct(s) + '%">' + s + '</i>').join('');
  let hits = '';
  for (let i = 0; i < n; i++) {
    const s = SONG_LEN_MIN + i * SONG_LEN_STEP,
      p = lenPct(s),
      l = Math.max(0, p - half),
      r = Math.min(100, p + half);
    hits += '<button type="button" data-s="' + s + '" aria-pressed="' + (s === cur) + '" style="left:' + l + '%;width:' + (r - l) + '%"' + ' title="' + s + '초 · 훅 ' + songHook(s) + '초 내" aria-label="길이 ' + s + '초 · 훅 ' + songHook(s) + '초 내"></button>';
  }
  const ph = 'calc(' + lenPct(cur) + '% - ' + (lenPct(cur) / 100).toFixed(2) + 'px)';
  axL.innerHTML = __nm.h('<div class="lenrule-lbls" aria-hidden="true">' + lbls + '</div>' + '<div class="lenrule-track"><i class="lenrule-fill" style="width:' + lenPct(cur) + '%"></i><i class="lenrule-ph" style="left:' + ph + '"></i></div>' + '<div class="lenrule-hit">' + hits + '</div>');
  if (axLv) axLv.textContent = cur + '초 · 훅 ' + songHook(cur) + '초';
}
function setLen(s) {
  GAUGE.t = Math.min(SONG_LEN_MAX, Math.max(SONG_LEN_MIN, Math.round(s / SONG_LEN_STEP) * SONG_LEN_STEP));
  drawLen();
  updateGoSpec();
}
if (axL) {
  axL.addEventListener('click', e => {
    const b = e.target.closest('button[data-s]');
    if (!b) return;
    setLen(+b.dataset.s);
  });
  axL.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const b = e.target.closest('button[data-s]');
    if (!b) return;
    e.preventDefault();
    const nx = Math.min(SONG_LEN_MAX, Math.max(SONG_LEN_MIN, +b.dataset.s + (e.key === 'ArrowRight' ? SONG_LEN_STEP : -SONG_LEN_STEP)));
    setLen(nx);
    const f = axL.querySelector('button[data-s="' + nx + '"]');
    if (f) try {
      f.focus({
        preventScroll: true
      });
    } catch (_) {}
  });
}
drawLen();
SPEC_READY = true;
updateGoSpec();
function renderOptions(d, sec) {
  OPTS = d.options || [];
  PICK = null;
  $('#out').hidden = true;
  $('#lout').hidden = true;
  $('#sstatus').classList.remove('err');
  $('#sstatus').innerHTML = __nm.h(window.OK_SVG + ' 옵션 ' + OPTS.length + '개' + (sec ? ' (' + sec + 's)' : '') + ' — 골라서 아래 버튼으로');
  $('#optgrid').innerHTML = __nm.h(OPTS.map((o, i) => '<button type="button" class="optcard" data-i="' + i + '"><div class="optname">' + esc(o.name || '') + '</div><div class="optwhy">' + esc(o.why || '') + '</div><div class="optmeta">' + esc(o.vocal || '') + (o.bpm ? ' · ' + o.bpm + ' bpm' : '') + '</div></button>').join(''));
  updateGoSpec();
  const ow = $('#optwrap');
  ow.hidden = false;
  try {
    ow.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  } catch (e) {}
}
$('#optgrid').addEventListener('click', e => {
  const b = e.target.closest('.optcard');
  if (!b) return;
  const i = +b.dataset.i;
  const was = b.classList.contains('on');
  $$('#optgrid .optcard').forEach(x => x.classList.remove('on'));
  if (was) {
    PICK = null;
    updateGoSpec();
    return;
  }
  b.classList.add('on');
  PICK = OPTS[i] || null;
  updateGoSpec();
});
function showSuno(d, sec) {
  RES = d;
  $('#lout').hidden = true;
  $('#sstatus').classList.remove('err');
  $('#sstatus').innerHTML = __nm.h(window.OK_SVG + ' 완료' + (sec ? ' (' + sec + 's)' : '') + ' — Suno 커스텀 모드에 칸별로 붙여넣기');
  $('#rTitle').textContent = d.title || '';
  $('#rStyle').textContent = d.style || '';
  $('#rLyrics').textContent = d.lyrics || '';
  $('#rExcl').textContent = d.exclude || '';
  $('#rMeta').textContent = (d.genre || '자동') + ' · ' + (d.express || '자동') + ' · 목표 ' + (d.target || '60초 미만');
  vcRender();
  const out = $('#out');
  out.hidden = false;
  try {
    out.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  } catch (e) {}
}
function showLyria(d, sec) {
  RES = d;
  $('#out').hidden = true;
  $('#sstatus').classList.remove('err');
  $('#sstatus').innerHTML = __nm.h(window.OK_SVG + ' 완성곡' + (sec ? ' (' + sec + 's)' : ''));
  $('#lTitle').textContent = d.title || '';
  const aud = $('#lAud');
  aud.src = __nm.u(d.url || '');
  $('#lLyr').textContent = d.sung || d.lyrics || '';
  $('#lMeta').textContent = (d.engine === 'rvc' ? '보이스 커버' + (d.voice_name ? ' · ' + d.voice_name : '') : 'Lyria 3' + (d.model ? ' · ' + d.model : '')) + (d.sung && d.lyrics && d.sung !== d.lyrics ? ' · 실제 부른 가사 기준' : '');
  $('#lDl').classList.remove('dl-done');
  vcRender();
  const lo = $('#lout');
  lo.hidden = false;
  try {
    lo.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  } catch (e) {}
}
$$('.cpy').forEach(b => {
  b.innerHTML = __nm.h(window.COPY_SVG);
});
const CPV = {
  title: () => RES && RES.title,
  style: () => RES && RES.style,
  lyrics: () => RES && RES.lyrics,
  exclude: () => RES && RES.exclude,
  llyr: () => RES && (RES.sung || RES.lyrics)
};
document.addEventListener('click', async e => {
  const b = e.target.closest('.cpy');
  if (!b) return;
  const get = CPV[b.dataset.k];
  const v = String(get && get() || '');
  if (!v) return;
  let ok = false;
  try {
    await window.navigator.clipboard.writeText(v);
    ok = true;
  } catch (err) {
    try {
      const ta = document.createElement('textarea');
      ta.value = v;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      ok = document.execCommand('copy');
      ta.remove();
    } catch (e2) {}
  }
  window.clearTimeout(b._t);
  b.innerHTML = __nm.h(ok ? window.CHECK_SVG : window.COPY_SVG);
  if (ok) {
    b._t = window.setTimeout(() => {
      b.innerHTML = __nm.h(window.COPY_SVG);
    }, 900);
  }
});
$('#lDl').innerHTML = __nm.h(window.DOWNLOAD_SVG);
$('#lDl').addEventListener('click', e => {
  const b = e.currentTarget,
    u = RES && RES.url || '';
  if (!u) return;
  const ext = /\.wav(\?|$)/i.test(u) ? '.wav' : '.mp3';
  const name = 'song_' + (SONG_ID || Date.now()) + ext;
  const a = document.createElement('a');
  if (/^https:\/\//i.test(u)) a.href = __nm.u('api/dl?u=' + encodeURIComponent(u) + '&n=' + encodeURIComponent(name));else {
    a.href = __nm.u(u);
    a.download = name;
  }
  document.body.appendChild(a);
  a.click();
  a.remove();
  b.classList.add('dl-done');
});
const MA = window.nmMaDefaults(),
  MA_DEF = window.nmMaDefaults();
let MA_SRCURL = '',
  MA_BUF = null,
  MA_OUTBUF = null,
  MA_URL = '',
  MA_ORIGSRC = '';
const MA_FMT = {
  maLufs: v => v.toFixed(1),
  maCeil: v => v.toFixed(1),
  maWid: v => v + '%',
  maGain: v => (v > 0 ? '+' : '') + v.toFixed(1)
};
const MA_KEY = {
  maLufs: 'targetLufs',
  maCeil: 'ceilingDb',
  maWid: 'width',
  maGain: 'gainDb'
};
const MA_UNIT = {
  maLufs: 'LUFS',
  maCeil: 'dBTP',
  maWid: '퍼센트',
  maGain: '데시벨'
};
function maPaint(el, out, key, txt, unit) {
  out.textContent = txt;
  const dflt = key == null ? false : typeof MA_DEF[key] === 'number' ? +el.value === MA_DEF[key] : false;
  out.classList.toggle('on', !dflt);
  el.setAttribute('aria-valuetext', txt + (unit ? ' ' + unit : '') + (dflt ? ' · 기본' : ''));
}
function maBind(id) {
  const el = $('#' + id),
    out = $('#' + id + 'V'),
    key = MA_KEY[id];
  const paint = () => {
    const v = +el.value;
    MA[key] = v;
    maPaint(el, out, key, MA_FMT[id](v), MA_UNIT[id]);
  };
  el.addEventListener('input', paint);
  paint();
}
Object.keys(MA_KEY).forEach(maBind);
const MA_MAC = [['clarity', '선명하게'], ['bass', '저음'], ['space', '공간감'], ['punch', '단단하게'], ['smooth', '부드럽게']];
const MA_MAC_TINT = {
  clarity: 'light',
  bass: 'warm',
  space: 'cool',
  punch: 'magenta',
  smooth: 'green'
};
$('#mamac').innerHTML = __nm.h(MA_MAC.map(([k, l]) => '<div class="lyopt-row"><span class="lyopt-k">' + esc(l) + '</span><input type="range" data-nmg="scrub" data-scrub-tint="' + MA_MAC_TINT[k] + '" id="mc_' + k + '" min="0" max="5" step="1" value="0" aria-label="' + esc(l) + ' — 0 안 함 · 5 가장 세게"><span class="lypv-fs" id="mc_' + k + 'V" aria-hidden="true">0</span></div>').join(''));
MA_MAC.forEach(([k]) => {
  const el = $('#mc_' + k),
    out = $('#mc_' + k + 'V');
  const paint = () => {
    const v = +el.value;
    MA[k] = v;
    maPaint(el, out, k, String(v), '단계');
    maDrawEq();
  };
  el.addEventListener('input', paint);
  paint();
});
const MA_BANDS = window.nmMaBands();
$('#maeqb').innerHTML = __nm.h(MA_BANDS.map((b, i) => '<div class="lyopt-row"><span class="lyopt-k">' + esc(b.label) + '</span><input type="range" data-nmg="scrub" data-scrub-tint="light" id="eq' + i + '" min="-12" max="12" step="0.5" value="0" aria-label="' + esc(b.label) + '헤르츠 대역 — 데시벨"><span class="lypv-fs" id="eq' + i + 'V" aria-hidden="true">0.0</span></div>').join(''));
function maDrawEq() {
  const s = window.nmMaDefaults();
  Object.assign(s, {
    eqBands: MA.eqBands.slice()
  });
  MA_MAC.forEach(([k]) => {
    s[k] = MA[k];
  });
  let final = MA.eqBands;
  try {
    final = (window.nmMaResolve ? window.nmMaResolve(s) : null) || MA.eqBands;
  } catch (e) {}
  const p = $('#maEqPath');
  if (p) p.setAttribute('d', window.nmEqCurve(final, 320, 88, 15));
}
MA_BANDS.forEach((b, i) => {
  const el = $('#eq' + i),
    out = $('#eq' + i + 'V');
  const paint = () => {
    const v = +el.value;
    MA.eqBands[i] = v;
    out.textContent = (v > 0 ? '+' : '') + v.toFixed(1);
    out.classList.toggle('on', v !== 0);
    el.setAttribute('aria-valuetext', (v > 0 ? '+' : '') + v.toFixed(1) + ' 데시벨' + (v ? '' : ' · 기본'));
    maDrawEq();
  };
  el.addEventListener('input', paint);
  paint();
});
function maFold(btnSel, bodySel) {
  const b = $(btnSel),
    body = $(bodySel);
  b.addEventListener('click', () => {
    const open = body.classList.contains('none');
    body.classList.toggle('none', !open);
    b.textContent = open ? '닫기' : '열기';
    b.classList.toggle('on', open);
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}
maFold('#maV', '#mabody');
maFold('#maAdvV', '#maadv');
maFold('#maEqV', '#maeq');
maFold('#advV', '#advbody');
[['gW', 'w'], ['gS', 's']].forEach(([id, k]) => {
  const el = $('#' + id),
    out = $('#' + id + 'V');
  const paint = () => {
    const v = +el.value;
    GAUGE[k] = v;
    out.textContent = v + '%';
    out.classList.toggle('on', v !== 50);
    el.setAttribute('aria-valuetext', v + '퍼센트' + (v === 50 ? ' · 기본' : ''));
    updateGoSpec();
  };
  el.addEventListener('input', paint);
  paint();
});
function paintVoc() {
  const el = $('#gV');
  if (!el) return;
  const g = Math.max(-100, Math.min(100, Math.round(+el.value / 10) * 10));
  GAUGE.g = g;
  GAUGE.v = g < 0 ? 'male' : g > 0 ? 'female' : '';
  const out = $('#gVV');
  if (out) {
    out.textContent = vocLabel(g);
    out.classList.toggle('on', g !== 0);
  }
  const lbl = $('#gVLbl');
  if (lbl) $$('#gVLbl i').forEach(i => {
    const a = +i.dataset.g;
    i.classList.toggle('on', a < 0 && g < 0 || a > 0 && g > 0 || a === 0 && g === 0);
  });
  el.setAttribute('aria-valuetext', vocLabel(g) + (g === 0 ? ' · 성별 지정 없음' : ''));
  if (SPEC_READY) updateGoSpec();
}
function setVoc(g) {
  const el = $('#gV');
  if (!el) return;
  el.value = String(Math.max(-100, Math.min(100, g)));
  paintVoc();
}
if ($('#gV')) {
  $('#gV').addEventListener('input', paintVoc);
  paintVoc();
}
$('#maTgls').addEventListener('click', e => {
  const b = e.target.closest('.spbtn');
  if (!b) return;
  const on = !b.classList.contains('on');
  b.classList.toggle('on', on);
  b.setAttribute('aria-pressed', on ? 'true' : 'false');
  MA[b.dataset.t] = on;
});
const MA_EQP = {
  flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  vocal: [0, 0, -2, -1, 0, 1.5, 3, 2, 1, 0],
  bass: [5, 3.5, -1, 0, 0, 0, 0, 0, 0, 0],
  bright: [0, 0, -1, 0, 0, 0, 0, 2, 3, 4],
  warm: [2, 2.5, 1.5, 0, 0, 0, 0, -1.5, -2, -2.5]
};
$('#maEqPre').addEventListener('click', e => {
  const b = e.target.closest('.spbtn');
  if (!b) return;
  const p = MA_EQP[b.dataset.p];
  if (!p) return;
  $$('#maEqPre .spbtn').forEach(x => {
    const on = x === b;
    x.classList.toggle('on', on);
    x.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  p.forEach((v, i) => {
    const el = $('#eq' + i);
    if (!el) return;
    el.value = v;
    el.dispatchEvent(new window.Event('input'));
  });
});
function maPreCustom() {
  $$('#maEqPre .spbtn').forEach(x => {
    x.classList.remove('on');
    x.setAttribute('aria-pressed', 'false');
  });
}
$('#maeqb').addEventListener('input', e => {
  if (e.target.type === 'range') maPreCustom();
});
$('#mamac').addEventListener('input', e => {
  if (e.target.type === 'range') maPreCustom();
});
$('#maFmt').addEventListener('click', e => {
  const b = e.target.closest('.spbtn');
  if (!b) return;
  const grp = b.dataset.sr ? 'sr' : b.dataset.bd ? 'bd' : '';
  if (!grp) return;
  $$('#maFmt .spbtn').forEach(x => {
    if (!x.dataset[grp]) return;
    const on = x === b;
    x.classList.toggle('on', on);
    x.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  if (grp === 'sr') MA.sampleRate = +b.dataset.sr;else MA.bitDepth = +b.dataset.bd;
});
async function maLoad() {
  const u = RES && RES.url || '';
  if (!u) throw new Error('완성곡이 있어야 다듬어');
  if (MA_SRCURL === u && MA_BUF) return MA_BUF;
  const src = /^https:\/\//i.test(u) ? 'api/dl?u=' + encodeURIComponent(u) + '&n=src' : u;
  const r = await window.fetch(src);
  if (!r.ok) throw new Error('곡을 못 불러왔어 (' + r.status + ')');
  const ab = await r.arrayBuffer();
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  try {
    MA_BUF = await ctx.decodeAudioData(ab);
  } finally {
    try {
      ctx.close();
    } catch (e) {}
  }
  MA_SRCURL = u;
  return MA_BUF;
}
const maDb = v => isFinite(v) ? v.toFixed(1) : '—';
$('#maGo').addEventListener('click', async () => {
  const gb = $('#maGo');
  if (!(RES && RES.url)) return btnErr(gb, '완성곡이 있어야 다듬어');
  if (!gb.dataset.label) gb.dataset.label = gb.textContent;
  gb.disabled = true;
  $('#maDl').disabled = true;
  gb.setAttribute('aria-busy', 'true');
  const met = $('#maMet');
  try {
    const step = m => {
      gb.textContent = String(m);
    };
    step('곡 읽는 중');
    met.textContent = '';
    const buf = await maLoad();
    const res = await window.nmMaster(buf, MA, step);
    MA_OUTBUF = res.buffer;
    if (MA_URL) window.URL.revokeObjectURL(MA_URL);
    MA_URL = window.URL.createObjectURL(window.nmEncodeWAV(res.buffer, MA.bitDepth));
    const aud = $('#lAud');
    if (!MA_ORIGSRC) MA_ORIGSRC = aud.src;
    aud.src = __nm.u(MA_URL);
    try {
      await aud.play();
    } catch (e) {}
    met.innerHTML = __nm.h('다듬기 전 <b>' + maDb(res.before.integratedLUFS) + '</b> LUFS · 후 <b>' + maDb(res.after.integratedLUFS) + '</b> LUFS' + ' · 트루피크 <b>' + maDb(res.truePeakDB) + '</b> dBTP · ' + MA.sampleRate / 1000 + 'kHz ' + MA.bitDepth + 'bit');
    $('#maDl').disabled = false;
  } catch (err) {
    met.innerHTML = __nm.h(window.WARN_SVG + ' ' + esc(err.message || '다듬기 실패'));
    btnErr(gb, '다듬기 실패');
  } finally {
    gb.disabled = false;
    gb.removeAttribute('aria-busy');
    if (!gb.classList.contains('err')) gb.textContent = gb.dataset.label;
  }
});
$('#maDl').addEventListener('click', () => {
  if (!MA_URL) return;
  const a = document.createElement('a');
  a.href = __nm.u(MA_URL);
  a.download = 'song_' + (SONG_ID || Date.now()) + '_master.wav';
  document.body.appendChild(a);
  a.click();
  a.remove();
});
let PLIST = [],
  PIDX = -1;
const hpop = $('#hpop');
function hRow(s, i) {
  const d = (s.ts || '').slice(5, 16).replace('T', ' ');
  return '<button class="hrow' + (i === PIDX ? ' on' : '') + '" data-i="' + i + '" type="button"><span class="t">' + esc(s.title || '(무제)') + '</span>' + (i === PIDX ? '<span class="eq">재생 중</span>' : '<span></span>') + '<span class="m">' + esc(d) + ' · ' + esc(s.engine === 'lyria' ? '구글' : s.engine === 'rvc' ? '보이스' : s.engine || '') + (s.genre ? ' · ' + esc(s.genre) : '') + '</span></button>';
}
function renderList() {
  $('#hlist').innerHTML = __nm.h(PLIST.map((s, i) => hRow(s, i)).join(''));
}
async function openHist() {
  hpop.hidden = false;
  renderList();
  let ok = false;
  try {
    const r = await window.fetch('song_out/index.json?t=' + Date.now());
    if (r.ok) {
      const ct = (r.headers.get('content-type') || '').toLowerCase();
      const tx = await r.text();
      if (tx && !ct.includes('text/html') && !/^\s*</.test(tx)) {
        const j = JSON.parse(tx);
        if (Array.isArray(j)) {
          PLIST = j;
          renderList();
          ok = true;
          _hSig = tx;
        }
      }
    }
  } catch (e) {}
  if (!ok && !PLIST.length) $('#hlist').innerHTML = __nm.h('<button class="hrow" type="button" data-retry="1"><span class="t">목록을 못 불러왔어</span><span></span><span class="m">다시 시도</span></button>');
}
$('#histBtn').addEventListener('click', () => {
  if (hpop.hidden) openHist();else hpop.hidden = true;
});
let _hSig = '';
async function pollHist() {
  try {
    const r = await window.fetch('song_out/index.json?t=' + Date.now());
    if (!r.ok) return;
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    const tx = await r.text();
    if (!tx || ct.includes('text/html') || /^\s*</.test(tx) || tx === _hSig) return;
    _hSig = tx;
    const j = JSON.parse(tx);
    if (Array.isArray(j)) {
      PLIST = j;
      renderList();
    }
  } catch (e) {}
}
window.nmRefresh = () => {
  if (!hpop.hidden) return pollHist();
};
window.setInterval(() => {
  if (!document.hidden && !hpop.hidden) pollHist();
}, 10000);
$('#hpopX').addEventListener('click', () => {
  hpop.hidden = true;
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!hpop.hidden) {
      e.stopImmediatePropagation();
      hpop.hidden = true;
    }
    closeSelPops();
  }
});
document.addEventListener('pointerdown', e => {
  if (!hpop.hidden && !e.target.closest('.hpop') && !e.target.closest('.histbtn')) hpop.hidden = true;
}, {
  capture: true
});
async function playIdx(i, autoplay) {
  const s = PLIST[i];
  if (!s) return;
  PIDX = i;
  renderList();
  let d = null;
  try {
    const r = await window.fetch('song_out/' + encodeURIComponent(s.id) + '/song.json?t=' + Date.now());
    if (r.ok) {
      const tx = await r.text();
      if (!/^\s*</.test(tx)) d = JSON.parse(tx);
    }
  } catch (e) {}
  if (!d || !d.url) d = {
    title: s.title,
    url: s.url,
    engine: s.engine,
    lyrics: ''
  };
  SONG_ID = s.id;
  showLyria(d, 0);
  if (autoplay) {
    try {
      await $('#lAud').play();
    } catch (e) {}
  }
}
$('#hlist').addEventListener('click', e => {
  const b = e.target.closest('.hrow');
  if (!b) return;
  if (b.dataset.retry) {
    openHist();
    return;
  }
  playIdx(+b.dataset.i, true);
});
$('#lAud').addEventListener('ended', () => {
  if (PIDX >= 0 && PIDX + 1 < PLIST.length) playIdx(PIDX + 1, true);
});
let VOICES = [],
  VSEL = null,
  VFILE = null,
  VFNAME = '';
let VRAW = null,
  VR2 = '';
function vcRender() {
  const cur = VOICES.find(x => x.id === VSEL) || null;
  if (!cur) VSEL = null;
  const v = $('#vcV');
  v.textContent = cur ? cur.name || '보이스' : '없음';
  v.classList.toggle('on', !!cur);
  $('#vcPop').innerHTML = __nm.h('<button type="button" class="spbtn' + (VSEL ? '' : ' on') + '" style="--i:0" aria-pressed="' + (VSEL ? 'false' : 'true') + '" data-v="">없음</button>' + VOICES.map((x, i) => '<button type="button" class="spbtn' + (x.id === VSEL ? ' on' : '') + '" style="--i:' + (i + 1) + '" aria-pressed="' + (x.id === VSEL ? 'true' : 'false') + '" data-v="' + esc(x.id) + '">' + esc(x.name || '보이스') + '</button>').join(''));
  $('#vApply').hidden = true;
}
async function vcLoad() {
  let ok = false;
  try {
    const r = await window.fetch('voice_out/index.json?t=' + Date.now());
    if (r.ok) {
      const ct = (r.headers.get('content-type') || '').toLowerCase();
      const tx = await r.text();
      if (tx && !ct.includes('text/html') && !/^\s*</.test(tx)) {
        const j = JSON.parse(tx);
        if (Array.isArray(j)) {
          VOICES = j;
          vcRender();
          ok = true;
        }
      }
    }
  } catch (e) {}
  if (!ok && !VOICES.length) $('#vcPop').innerHTML = __nm.h('<button type="button" class="spbtn" style="--i:0" data-retry="1">목록을 못 불러왔어 · 다시 시도</button>');
}
$('#vcV').addEventListener('click', () => {
  const pop = $('#vcPop');
  const opening = pop.classList.contains('none');
  closeSelPops(pop);
  pop.classList.toggle('none', !opening);
  if (opening) vcLoad();
});
$('#vcPop').addEventListener('click', e => {
  const b = e.target.closest('.spbtn');
  if (!b) return;
  if (b.dataset.retry) {
    vcLoad();
    return;
  }
  VSEL = b.dataset.v || null;
  vcRender();
  $('#vcPop').classList.add('none');
});
$('#consBtn').addEventListener('click', e => {
  const b = e.currentTarget;
  const on = !b.classList.contains('on');
  b.classList.toggle('on', on);
  b.setAttribute('aria-pressed', on ? 'true' : 'false');
});
$('#vFile').addEventListener('change', async e => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  if (VR2 && window.nmUpDrop) window.nmUpDrop(VR2);
  VR2 = '';
  VRAW = null;
  if (f.size > 2 * 1024 * 1024 * 1024) {
    e.target.value = '';
    return btnErr($('#trainGo'), '파일은 2GB까지');
  }
  const r2on = window.nmUpArm && (await window.nmUpArm());
  if (e.target.files && e.target.files[0] !== f) return;
  if (!r2on && f.size > 20 * 1024 * 1024) {
    e.target.value = '';
    return btnErr($('#trainGo'), window.nmUpWhyMsg && window.nmUpWhyMsg(1) || '파일은 ≤20MB — 1~5분 mp3/m4a');
  }
  if (r2on) {
    VRAW = f;
    try {
      const up = await window.nmUpload(f, p => {
        if (VRAW === f) $('#vfName').textContent = f.name + ' · ' + p + '%';
      });
      if (VRAW !== f) {
        window.nmUpDrop(up.key);
        return;
      }
      VR2 = up.key;
      VFILE = null;
      VFNAME = f.name;
      $('#vfName').textContent = f.name;
      $('#vfLab').classList.add('has');
      return;
    } catch (err) {
      if (f.size > 20 * 1024 * 1024) {
        VRAW = null;
        VR2 = '';
        VFNAME = '';
        $('#vfName').textContent = '';
        $('#vfLab').classList.remove('has');
        e.target.value = '';
        return btnErr($('#trainGo'), '업로드 실패 — 다시');
      }
      VRAW = null;
    }
  }
  try {
    await new Promise((res, rej) => {
      const r = new window.FileReader();
      r.onload = () => {
        VFILE = r.result;
        res();
      };
      r.onerror = () => rej(r.error || new Error('읽기 실패'));
      r.readAsDataURL(f);
    });
    VFNAME = f.name;
    $('#vfName').textContent = f.name;
    $('#vfLab').classList.add('has');
  } catch (err) {
    VFILE = null;
    VFNAME = '';
    $('#vfName').textContent = '';
    $('#vfLab').classList.remove('has');
    btnErr($('#trainGo'), '파일 읽기 실패 — 다시');
  }
});
$('#trainGo').addEventListener('click', async () => {
  const gb = $('#trainGo');
  if (!VFILE && !VR2 && !VRAW) return btnErr(gb, '보이스 소스(1~5분)를 올려줘');
  if (!$('#consBtn').classList.contains('on')) return btnErr(gb, '동의 먼저 — 본인·권리 보유 음성만');
  if (!VFILE && !VR2 && VRAW) {
    const f = VRAW;
    try {
      const up = await window.nmUpload(f, p => {
        if (VRAW === f) $('#vfName').textContent = f.name + ' · ' + p + '%';
      });
      if (VRAW !== f) {
        window.nmUpDrop(up.key);
        return;
      }
      VR2 = up.key;
      $('#vfName').textContent = f.name;
    } catch (err) {
      return btnErr(gb, '업로드 실패 — 파일 다시 선택');
    }
  }
  const pay = {
    mode: 'train',
    name: $('#vName').value.trim().slice(0, 24),
    consent: true,
    fname: VFNAME,
    lbl: $('#vName').value.trim().slice(0, 24) || '보이스 학습'
  };
  if (VR2) pay.r2key = VR2;else pay.fileB64 = VFILE;
  const _err = await fireApi(gb, API_VOICE, pay, (j, t0) => {
    pendSet({
      id: j.id,
      mode: 'voice-train',
      t0,
      lbl: pay.lbl
    });
    pollVoice(j.id, t0, t0 - 90000);
  });
  if (VR2 && /업로드 키|업로드 파일이 없어|업로드 미설정/.test(String(_err || ''))) {
    window.nmUpDrop(VR2);
    VR2 = '';
  }
});
$('#vApply').addEventListener('click', () => {
  const gb = $('#vApply');
  if (!(VSEL && SONG_ID && RES && RES.url)) return;
  fireApi(gb, API_VOICE, {
    mode: 'apply',
    src: SONG_ID,
    vid: VSEL,
    lbl: '보이스'
  }, (j, t0) => {
    pendSet({
      id: j.id,
      mode: 'voice',
      t0,
      lbl: '보이스'
    });
    pollSong(j.id, 'voice', t0, t0 - 90000, gb);
  });
});
function pollVoice(id, t0, minTs, focus) {
  focus = focus !== false;
  try {
    if (window.nmJobs.busy(PEND_KEY, id)) return;
  } catch (e) {}
  if (focus) FOCUS_ID = id;
  const mine = () => FOCUS_ID === id;
  const status = $('#sstatus');
  if (focus) statusWait(true, t0, '보이스 학습 중', 'voice-train');
  const outPath = 'voice_out/' + id + '/voice.json',
    errPath = 'voice_out/' + id + '/error.log';
  let live = true;
  const stop = () => {
    live = false;
    if (mine()) statusWait(false);
    try {
      window.nmJobs.free(PEND_KEY, id);
    } catch (e) {}
  };
  try {
    window.nmJobs.hold(PEND_KEY, id, stop);
  } catch (e) {}
  const budget = BUDGETS['voice-train'];
  const tick = async () => {
    if (!live) return;
    if (Date.now() - t0 > budget * 2000) {
      const _m = mine();
      stop();
      pendClear(id);
      if (!_m) return;
      status.innerHTML = __nm.h(window.ERR_SVG + ' 시간 초과 — 완성되면 다음에 열 때 이어받아');
      status.classList.add('err');
      return;
    }
    try {
      const er = await window.fetch(errPath + '?t=' + Date.now());
      if (!live) return;
      if (er.ok) {
        const ect = (er.headers.get('content-type') || '').toLowerCase();
        const em = await er.text();
        if (!live) return;
        const eHtml = ect.includes('text/html') || /^\s*<!doctype/i.test(em) || /<html[\s>]/i.test(em.slice(0, 300));
        if (em && em.trim() && !eHtml) {
          const _m = mine();
          stop();
          pendClear(id);
          if (!_m) return;
          status.innerHTML = __nm.h(window.ERR_SVG + ' ' + esc(em.trim().slice(0, 300)));
          status.classList.add('err');
          return;
        }
      }
    } catch (e) {}
    try {
      const r = await window.fetch(outPath + '?t=' + Date.now());
      if (!live) return;
      if (r.ok) {
        const ct = (r.headers.get('content-type') || '').toLowerCase();
        const tx = await r.text();
        if (!live) return;
        const isHtml = ct.includes('text/html') || /^\s*<!doctype/i.test(tx) || /<html[\s>]/i.test(tx.slice(0, 300));
        if (tx && tx.trim() && !isHtml) {
          let d = null;
          try {
            d = JSON.parse(tx);
          } catch (e) {}
          if (d && d.model_url) {
            const ts = Date.parse(d.ts || '');
            if (!isNaN(ts) && ts >= minTs) {
              const _m = mine();
              stop();
              pendClear(id);
              if (window.nmEta) window.nmEta.done('song-voice', (Date.now() - t0) / 1000);
              if (!_m) {
                VSEL = id;
                vcLoad();
                return;
              }
              status.classList.remove('err');
              status.innerHTML = __nm.h(window.OK_SVG + ' 보이스 학습 완료 — ' + esc(d.name || '보이스'));
              VSEL = id;
              vcLoad();
              return;
            }
          }
        }
      }
    } catch (e) {}
    if (live) window.setTimeout(tick, 10000);
  };
  tick();
}
vcLoad();
function edFocus(sel) {
  const el = $(sel);
  if (!el || el.hidden) return;
  try {
    el.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth',
      block: 'center'
    });
  } catch (e) {}
  el.classList.add('edfocus');
  window.setTimeout(() => el.classList.remove('edfocus'), 2200);
}
(function () {
  const id = (window.location.search.match(/[?&]done=([\w-]+)\b/) || [])[1] || (window.location.hash.match(/^#done=([\w-]+)$/) || [])[1];
  if (!id) return;
  USER_ACT = true;
  pendClear(id);
  (async () => {
    try {
      const r = await window.fetch('song_out/' + id + '/song.json?t=' + Date.now());
      if (r.ok) {
        const tx = await r.text();
        if (tx && !/^\s*</.test(tx)) {
          let d = null;
          try {
            d = JSON.parse(tx);
          } catch (e) {}
          if (d && d.url) {
            SONG_ID = id;
            showLyria(d, 0);
            edFocus('#lout');
            return;
          }
        }
      }
      const er = await window.fetch('song_out/' + id + '/error.log?t=' + Date.now());
      if (er.ok) {
        const em = await er.text();
        if (em && em.trim() && !/^\s*</.test(em)) {
          $('#sstatus').innerHTML = __nm.h(window.ERR_SVG + ' ' + esc(em.trim().slice(0, 160)));
          $('#sstatus').classList.add('err');
        }
      }
    } catch (e) {}
  })();
})();
(function () {
  let all = [];
  try {
    all = window.nmJobs.list(PEND_KEY);
  } catch (e) {
    all = [];
  }
  all.forEach((p, i) => {
    if (!p || !p.id) return;
    if (Date.now() - (p.t0 || 0) > 24 * 3600e3) {
      pendClear(p.id);
      return;
    }
    const focus = !USER_ACT && i === 0;
    if (focus && p.story && !$('#story').value) $('#story').value = p.story;
    if (p.mode === 'voice-train') {
      const t0c = Math.max(p.t0 || 0, Date.now() - BUDGETS['voice-train'] * 1000);
      pollVoice(p.id, t0c, (p.t0 || 0) - 90000, focus);
      return;
    }
    if (focus && p.mode !== 'options' && p.mode !== 'voice') {
      $('#optwrap').hidden = false;
      updateGoSpec();
    }
    const t0c = Math.max(p.t0 || 0, Date.now() - (BUDGETS[p.mode] || BUDGET) * 1000);
    pollSong(p.id, p.mode || 'suno', t0c, (p.t0 || 0) - 90000, null, focus);
  });
})();
const PVZOOM = {
  K: 'nm.pvzoom',
  get() {
    try {
      return window.localStorage.getItem(this.K) === '1';
    } catch (_) {
      return false;
    }
  },
  set(on) {
    try {
      on ? window.localStorage.setItem(this.K, '1') : window.localStorage.removeItem(this.K);
    } catch (_) {}
  }
};
(function () {
  const td = document.getElementById('topDock'),
    b = document.getElementById('cpZoom');
  if (!td || !b) return;
  const paint = on => {
    td.classList.toggle('dockzoom', on);
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.setAttribute('aria-label', on ? '미리보기 원상복귀' : '미리보기 확대');
    b.title = on ? '탭=원상복귀' : '탭=미리보기 확대 · 다시 탭=원상복귀';
  };
  paint(PVZOOM.get());
  b.addEventListener('click', () => {
    const on = !td.classList.contains('dockzoom');
    paint(on);
    PVZOOM.set(on);
  });
})();
}
function inline3(window, document, __nm) {
['story', 'genreIn', 'moodIn', 'themeIn', 'expIn', 'vName'].forEach(id => {
  const el = document.getElementById(id);
  if (el && window.attachCopyPaste) window.attachCopyPaste(el, true);
});
}
export const PAGE = {
  path: "/song.html",
  fonts: FONTS,
  css: [SHEETS["tokens.css"],
    SHEETS["nm-shared.css"],
    SHEETS["nm-cards.css"],
    SHEETS["nm-hist.css"],
    SHEETS["nm-job.css"],
    SHEETS["nm-clip.css"],
    `.nd-root{ --well:#0e0f11;   
    --bg:#121212; --pan:#16171a; --line:#2a2c31; --hist-accent:#FFE13D; --hist-rgb:255,225,61;    --line2:rgba(255,255,255,.06);    --fg:#eef7f0; --mut:#8fa697;
    --accent:#00EED2; --accent-rgb:0,238,210;
    --accent-4:#FFE13D; --accent-4-rgb:255,225,61;    --accent-dim:rgba(var(--accent-rgb),.13); --on-accent:#032322;
    --danger:#e23b2a; --danger-rgb:226,59,42;
    --press-pico:.72; --press-xs:.82; --press-s:.85; --press-m:.9; --press-l:.95;
  }
  @media (prefers-reduced-motion:reduce){ .nd-root{ --press-pico:1; --press-xs:1; --press-s:1; --press-m:1; --press-l:1; } }
  * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  nd-html .cscroll { display:none !important; }   
  nd-html { scrollbar-width:none; -ms-overflow-style:none; scrollbar-color:rgba(255,255,255,.05) transparent; }  * { scrollbar-width:none; }   
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.05); border-radius:999px;
    border:1px solid var(--bg); background-clip:padding-box; }  button:focus-visible, a:focus-visible, [tabindex]:focus-visible, [role=button]:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }   
  nd-body { margin:0; background:radial-gradient(125% 70% at 50% -8%, rgba(var(--accent-rgb),.06), transparent 55%) fixed, var(--bg); color:var(--fg); font:15px/1.6 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; letter-spacing:-.2px ; -webkit-font-smoothing:antialiased; }  nd-html.inmodal, nd-html.inmodal nd-body { background:transparent; }
  .wrap { max-width:600px; margin:0 auto; padding:18px 16px 40px; }   
  #story { display:block; resize:none; }   
  label { display:block; font-size:var(--fs-label); color:var(--fg); margin:16px 0 9px; }   
  .wrap > .selwrap:first-child label { margin-top:0; }   
  label.fl { font-weight:var(--fw-x); color:var(--fg); }
  label.fl::before { content:'•'; margin-right:6px; color:var(--accent); font-weight:var(--fw-b); }   
  textarea, input[type=text] { width:100%; padding:12px; background:var(--well); border:1px solid var(--line); border-radius:var(--r-s); color:var(--fg); font:inherit; font-size:16px; }   
  textarea { min-height:120px; resize:vertical; line-height:1.55; }
  textarea:focus, input:focus { border-color:rgba(var(--accent-rgb),.35); box-shadow:0 0 0 3px rgba(var(--accent-rgb),.08); outline:none; }
  textarea::placeholder, input::placeholder { color:var(--mut); }
  #optwrap[hidden], #out[hidden], #lout[hidden] { display:none; }
  .edfocus { animation:edfocus 2.2s ease both; border-radius:var(--r-m); }   
  @keyframes edfocus { 0%,100%{ box-shadow:0 0 0 0 rgba(var(--accent-rgb),0); } 18%,46%{ box-shadow:0 0 0 3px rgba(var(--accent-rgb),.55); } }
  @media (prefers-reduced-motion:reduce){ .edfocus { animation:none; } }
  .topdock { position:sticky; top:0; z-index:6; margin:-18px -16px 0 ; padding:var(--sp-2) 16px 0 ; background:rgba(18,18,18,1) ; border-bottom:1px solid rgba(var(--accent-rgb),.35) ; --line:rgba(255,255,255,.15) ; }         
  .topdock::after { content:none; }   
  .optstrip { margin:0 0 var(--sp-2); padding:8px 13px ; background:#000 ; border:1px solid var(--line); border-radius:var(--r-s); }
  .optstrip .gospec { margin:0; padding:0; font-size:11.25px ; line-height:1.9; text-align:left; color:var(--mut); white-space:nowrap; overflow-x:auto; scrollbar-width:none; -webkit-overflow-scrolling:touch; }   
  .optstrip .gospec::-webkit-scrollbar { display:none; }   
  .gospec .gs-lbl { color:var(--mut); font-weight:var(--fw-b); }
  .gospec .gs-v { color:var(--mut); }
  .gospec .gs-v.on { color:var(--accent); font-weight:var(--fw-b); }  
  .trailwrap > .trail-fire { margin:0; }
  .trailwrap > .trail-fire .go, .trailwrap > .trail-fire.go { margin:0; }
  .cpprev-box > .pvfire, .mon > .pvfire { position:absolute; left:var(--sp-2); right:var(--sp-2); bottom:var(--sp-2); width:auto ; z-index:4; margin:0; }
  .cpprev-box > .pvfire .go, .mon > .pvfire .go, .cpprev-box > .pvfire.go, .mon > .pvfire.go { margin:0; }   
  .firebar .go { margin:0; }   
  .topdock #optGo, .topdock #go, .topdock .go { border-radius:var(--r-s) ; min-height:30px ; backdrop-filter:blur(var(--blur-s)); -webkit-backdrop-filter:blur(var(--blur-s)); }   
  .pvsec { position:relative ; margin:0 0 var(--sp-2); --pvw:min(52%, 29cqh, 300px) ; }
  .topdock.dockzoom .pvsec { --pvw:min(100%, 58cqh, 620px); }   
  .cpprev-box { position:relative; width:var(--pvw); margin-inline:auto ; height:auto; aspect-ratio:1/1 ; contain:size ; min-height:0; background:#121212; border:1px solid transparent ; border-radius:var(--r-s); overflow:hidden; container-type:size ; }
  .cpv-empty { position:absolute; inset:0; display:grid; place-items:center; background-color:inherit ; }
  .cpv-empty .cpv-stage { width:min(100%, calc(100cqh * 16 / 9)) ; aspect-ratio:16/9; background-color:inherit; display:grid; place-items:center; }
  .cpv-photobtn { display:grid; place-items:center; width:var(--btn); height:var(--btn); padding:0; background:none; border:0; cursor:pointer; color:var(--accent); -webkit-tap-highlight-color:transparent; }   
  .cpv-photobtn svg { width:26px; height:26px; display:block; transition:transform var(--dur-fast) cubic-bezier(.2,.9,.3,1.25); }   
  .cpv-photobtn:active svg { transform:scale(var(--press-xs,.8)); }
  nd-html.nm-menuopen .cpv-empty { opacity:0; }   
  .pvsec .trailwrap { position:absolute; top:0; left:calc(50% + var(--pvw, 52%) / 2) ; margin-left:8px ; z-index:2 ; display:flex; flex-direction:column; align-items:stretch; width:var(--trailw, 70px ); gap:8px; }
  .topdock.dockzoom .pvsec .trailwrap { margin-left:0; transform:translateX(-100%); }   
  .pvsec .trail-v, .pvsec .trail-v .gospec { align-items:center; }   
  .pvsec #cpZoomRail { align-self:stretch; align-items:center; }   
  #cpZoom.on .cpz-v { display:none; }   
  .pvsec .trail .cpv-tool { position:static; width:100%; height:22px; display:grid; place-items:center; padding:0; color:var(--accent); background:none; border:0; border-radius:0; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:transform var(--dur-fast); }   
  .pvsec .trail .cpv-tool[hidden] { display:none; }   
  .pvsec .trail .cpv-tool:active { transform:scale(var(--press-xs,.82)); }
  .pvsec .trail .cpv-tool:disabled { opacity:.5; cursor:default; }   
  .pvsec .trail .cpv-tool:disabled:active { transform:none; }
  .cpprev-box .trail, .pvsec .trail { display:flex; flex-direction:column; flex-wrap:nowrap; gap:var(--sp-1); padding:5px 2px; border-radius:var(--r-s);
    border:1px solid rgba(255,255,255,.14); background:rgba(8,15,11,.54) ;
    backdrop-filter:blur(var(--blur-s)); -webkit-backdrop-filter:blur(var(--blur-s)); }
  .cpprev-box .trail-g, .pvsec .trail-g { display:flex; flex-direction:column; flex-wrap:nowrap; gap:2px ; flex:none; align-self:stretch; }
  .cpprev-box .trail-div, .pvsec .trail-div { width:14px; height:1px; margin:1px 0; flex:none; background:rgba(255,255,255,.16); }
  .pvsec .trail-div { align-self:center; }   
  .pvsec .trail-g:not(:has(button:not([hidden]))) { display:none; }
  .pvsec .trail-g:not(:has(button:not([hidden]))) + .trail-div { display:none; }
  .pvsec .trail:not(:has(button:not([hidden]))):not(:has(.trail-v:not(.none))) { display:none; }
  .cpprev-box .trail-v, .pvsec .trail-v { display:flex; flex-direction:column; gap:var(--sp-1); align-self:stretch; margin:0; padding:0; background:transparent; border:1px solid transparent ; border-radius:0; font-size:10.5px ; line-height:1; text-align:center; }
  .cpprev-box .trail-v.none, .pvsec .trail-v.none { display:none; }
  .cpprev-box .trail-v .gs-lbl, .cpprev-box .trail-v .gs-dot, .pvsec .trail-v .gs-lbl, .pvsec .trail-v .gs-dot { display:none; }      
  .pvsec .trail-v .gs-sep { display:block; width:14px; height:1px; margin:1px auto ; flex:none; background:rgba(255,255,255,.16); font-size:0; line-height:0; color:transparent; }   
  .pvsec .trail-v .gospec { display:flex; flex-direction:column; gap:var(--sp-1); margin:0; padding:0; font-size:10.5px; line-height:1; text-align:center; white-space:nowrap; overflow:visible; }
  .cpprev-box .trail-v .gs-v, .pvsec .trail-v .gs-v { position:relative ; display:grid; place-items:center; min-width:22px; height:22px; padding:0 5px; border:0; background:none; border-radius:var(--r-l); color:var(--mut); font-size:10.5px; font-weight:var(--fw-x); font-family:inherit; letter-spacing:-.2px; line-height:1; white-space:nowrap; -webkit-tap-highlight-color:transparent; transition:color var(--dur) ease; }
  .cpprev-box .trail-v .gs-v.gs-tog, .pvsec .trail-v .gs-v.gs-tog { cursor:pointer; }
  .cpprev-box .trail-v .gs-v, .pvsec .trail-v .gs-v, .cpprev-box .trail-v .ropt, .pvsec .trail-v .ropt { place-items:center; text-align:center; }   
  .pvsec .trail-v .gs-v.on { color:var(--accent); font-weight:var(--fw-x); }
  .pvsec .trail-i { position:relative; display:grid; place-items:center; width:22px; height:22px; padding:0; border:0; background:none; border-radius:50%; color:var(--mut); font-size:10.5px ; font-weight:var(--fw-x); font-family:inherit; cursor:pointer; -webkit-tap-highlight-color:transparent; }
  .pvsec .trail-i::after { content:''; position:absolute; inset:-6px -4px; }
  .pvsec .trail-i:active { transform:scale(var(--press-m)); }
  .pvsec .trail svg { width:12px; height:12px; display:block; }   
  .pvsec #cpRail:not(:has(.trail-g > button:not([hidden]))):not(:has(.trail-v:not(.none))) { display:none; }   
  .pvsec .trail-v .gs-v:active { transform:scale(var(--press-m)); }
  .pvsec .trail .histbtn { position:static; z-index:auto; width:100%; height:22px; display:grid; place-items:center; padding:0; color:var(--accent); background:none; border:0; border-radius:0;
    box-shadow:none; -webkit-backdrop-filter:none; backdrop-filter:none; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:transform var(--dur-fast); }   
  .pvsec .trail .histbtn:active { transform:scale(var(--press-xs,.82)); }   
  .pvsec .trail .histbtn svg { width:12px; height:12px; }   
  .cpv-wait { color:var(--mut); font-size:var(--fs-label); font-weight:var(--fw-b); letter-spacing:.02em; }   
  .cref-lbl { font-size:var(--fs-label); font-weight:var(--fw-x); color:var(--fg); }   
  .geni-sechead { display:flex; align-items:center; gap:8px ; width:100%; padding:var(--sp-2) 0 var(--sp-1); background:none; border:none; border-bottom:1px solid var(--line2); text-align:left; -webkit-tap-highlight-color:transparent; }
  .geni-sechead .cref-lbl::before { content:'•'; margin-right:6px ; color:var(--accent); font-weight:var(--fw-b); }   
  .geni-row { display:flex; align-items:baseline; justify-content:space-between; gap:var(--sp-2); padding:8px 0 ; }
  .pub-l { font-size:var(--fs-label); font-weight:var(--fw-b); color:var(--fg); white-space:nowrap; }   
  .geni-opts { display:flex; flex-wrap:wrap; gap:3px 4px ; justify-content:flex-end; min-width:0; }
  .geni-opt { background:none; border:none; padding:6px 7px ; font-family:inherit; font-size:var(--fs-label); font-weight:var(--fw-b); color:var(--mut); cursor:pointer; white-space:nowrap; transition:color var(--dur); -webkit-tap-highlight-color:transparent; }
  .geni-opt:active { transform:scale(var(--press-m)); }
  .geni-opt.on { color:var(--accent); font-weight:var(--fw-x); }  
  .geni-subit { display:inline-flex; align-items:center; gap:4px ; }
  .geni-sep { font-size:var(--fs-label); font-weight:var(--fw-b); color:var(--mut); opacity:.35; pointer-events:none; }   
  .geni-railwrap { flex:1 1 0; min-width:0; display:flex; align-items:center; }
  .geni-railwrap.edge { border-left:1px solid var(--line2); padding-left:var(--sp-1); }   
  .geni-railrow .pub-l { flex:0 0 max(80px, calc(4em + 12px)) ; }
  .geni-rail { flex:1 1 0; min-width:0; flex-wrap:nowrap; justify-content:flex-start; overflow-x:auto; overflow-y:hidden; -ms-overflow-style:none; scrollbar-width:none; cursor:grab; touch-action:pan-x pan-y ; --rail-fade:22px ; -webkit-mask-image:linear-gradient(90deg,transparent 0,black var(--rail-fade),black calc(100% - var(--rail-fade)),transparent 100%); mask-image:linear-gradient(90deg,transparent 0,black var(--rail-fade),black calc(100% - var(--rail-fade)),transparent 100%); }
  .geni-rail::-webkit-scrollbar { display:none; }
  .geni-rail.grabbing { cursor:grabbing; }
  .geni-rail.atStart { -webkit-mask-image:linear-gradient(90deg,black 0,black calc(100% - var(--rail-fade)),transparent 100%); mask-image:linear-gradient(90deg,black 0,black calc(100% - var(--rail-fade)),transparent 100%); }   
  .geni-rail.atEnd { -webkit-mask-image:linear-gradient(90deg,transparent 0,black var(--rail-fade),black 100%); mask-image:linear-gradient(90deg,transparent 0,black var(--rail-fade),black 100%); }
  .geni-rail.atStart.atEnd { -webkit-mask-image:none; mask-image:none; }   
  .geni-navs { display:none; flex:0 0 auto; align-items:center; margin-left:2px ; }
  @media (hover:hover) and (pointer:fine) { .geni-navs { display:flex; } }
  .geni-nav { width:17px; height:22px; display:grid; place-items:center; background:none; border:none; color:var(--mut); cursor:pointer; padding:0; border-radius:var(--r-s); transition:color .15s, background .15s; -webkit-tap-highlight-color:transparent; }   
  .geni-nav:hover { color:var(--accent); background:rgba(var(--accent-rgb),.08); }
  .geni-nav:active { transform:scale(var(--press-m)); }
  .geni-nav svg { width:11px; height:11px; }   
  .geni-nav[disabled] { opacity:.28; pointer-events:none; }
  .geni-rail.atStart.atEnd ~ .geni-navs { display:none; }   
  .ogrid .geni-railrow .pub-l::after { content:none; }   
  .ogrid .geni-railrow { flex-wrap:wrap; }   
  .ogrid .geni-railrow > .selin { flex-basis:100%; margin-top:6px ; }   
  .ogrid .selin.none { display:none; }   
  .selwrap { position:relative; }
  .selv { cursor:pointer; font:inherit; font-size:12px; font-weight:var(--fw-x); letter-spacing:.03em; color:var(--mut); background:none; border:0; padding:3px 5px; margin:-3px 0;
    -webkit-tap-highlight-color:transparent; -webkit-user-select:none; user-select:none; transition:color var(--dur), transform var(--dur-fast); }   
  .selv { position:relative; top:-.3px; }   
  .selv::before { content:''; position:absolute; inset:-8px 0; }   
  .selv.on { color:var(--accent); }
  .selv:active { transform:scale(var(--press-m,.92)); }
  .selpop { position:absolute; top:100%; left:0; margin-top:6px; z-index:9; display:flex; flex-wrap:wrap; gap:10px 6px; padding:7px; max-width:min(92cqw,360px);   
    background:linear-gradient(150deg, rgba(42,44,48,.7), rgba(12,13,15,.82)); backdrop-filter:blur(var(--blur-m)) saturate(1.2); -webkit-backdrop-filter:blur(var(--blur-m)) saturate(1.2);
    border:1px solid rgba(255,255,255,.12); border-radius:12px; box-shadow:0 12px 30px rgba(0,0,0,.4); }   
  .selpop.none { display:none; }
  .selpop:not(.none) { transform-origin:top left; animation:selpop-in .2s var(--ease); }
  @keyframes selpop-in { from { opacity:0; transform:translateY(-5px) scale(.9); } to { opacity:1; transform:none; } }
  .selpop:not(.none) .spbtn { animation:spbtn-in .26s both cubic-bezier(.2,.8,.3,1); }
  .selpop:not(.none) .spbtn { animation-delay:min(calc(.02s + var(--i,0)*.03s), .53s); }
  @keyframes spbtn-in { from { opacity:0; transform:translateX(-9px) scale(.78); } to { opacity:1; transform:none; } }
  @media (prefers-reduced-motion:reduce) { .selpop:not(.none), .selpop:not(.none) .spbtn { animation:none; } }
  .spbtn { min-width:auto; height:32px; padding:0 13px; display:grid; place-items:center; background:linear-gradient(165deg, rgba(44,46,50,.42), rgba(16,17,19,.52));
    border:1px solid rgba(255,255,255,.09); border-radius:var(--r-s); color:var(--mut); cursor:pointer; font:inherit; font-weight:600; font-size:12px; transition:border-color var(--dur), background var(--dur), color var(--dur); }   
  .spbtn:hover { color:var(--fg); border-color:rgba(255,255,255,.2); }
  .spbtn.on { border-color:rgba(var(--accent-rgb),.5); color:var(--accent); background:linear-gradient(165deg, rgba(var(--accent-rgb),.16), rgba(var(--accent-rgb),.05)); }
  .spbtn { position:relative; }
  .spbtn::before { content:''; position:absolute; inset:-4px 0; }   
  .spbtn:active { transform:scale(var(--press-m,.9)); }
  .selin { flex-basis:100%; }
  .selin input { padding:8px 11px; font-size:16px; }   
  .optgrid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .optcard { text-align:left; padding:10px 12px; border-radius:var(--r-s); border:1px solid var(--line); background:rgba(255,255,255,.04); color:var(--fg); font:inherit; cursor:pointer; transition:transform var(--dur-fast), border-color var(--dur), background var(--dur); }
  .optcard:active { transform:scale(var(--press-m)); }
  .optcard.on { border-color:rgba(var(--accent-rgb),.6); background:rgba(var(--accent-rgb),.08); }
  .optname { font-weight:var(--fw-x); font-size:14px; }
  .optcard.on .optname { color:var(--accent); }
  .optwhy { font-size:12px; color:var(--mut); margin-top:2px; }
  .optmeta { font-size:11px; color:var(--mut); margin-top:4px; font-variant-numeric:tabular-nums; }
  .go { width:100%; margin-top:16px; padding:12px; background:rgba(255,255,255,.02); color:var(--accent); border:1px solid var(--line); border-radius:var(--r-pill); font-weight:800; font-size:14px; font-family:inherit; line-height:1; cursor:pointer; position:relative; overflow:hidden; transition:transform var(--dur-fast) ease, background var(--dur) ease, border-color var(--dur) ease; }   
  #optGo, #sunoGo, #lyriaGo, #vApply { border-radius:var(--r-m); padding:var(--sp-1); font-size:var(--fs-label); overflow:visible; }   
  #optGo::before, #sunoGo::before, #lyriaGo::before, #vApply::before { content:''; position:absolute; left:0; right:0; top:-9px; bottom:-9px; }  .go:disabled { opacity:.5; cursor:default; transform:none; }
  .go.err { background:rgba(var(--danger-rgb),.14); color:var(--danger); border-color:var(--danger); }
  .go.shake { animation:shake .42s; }
  @keyframes shake { 20%{ transform:translateX(-5px);} 45%{ transform:translateX(4px);} 70%{ transform:translateX(-3px);} 90%{ transform:translateX(2px);} }
  @media (prefers-reduced-motion:reduce) { .go.shake { animation:none; } }  @keyframes goFill { from { background-size:0% 100%, 100% 100%; } to { background-size:100% 100%, 100% 100%; } }
  @media (prefers-reduced-motion:reduce) { .go.firing { animation-duration:.2s; } }
  .go.okdone { background:var(--accent); color:var(--on-accent); border-color:var(--accent); transition:none; }     
  :where(.topdock) .go { border-color:rgba(255,255,255,.2); }   
  .go .gck { width:26px; height:26px; margin:-6px 0; }   
  #optGo .gck, #sunoGo .gck, #lyriaGo .gck, #vApply .gck { margin:-6.5px 0; }  @keyframes goTick { to { stroke-dashoffset:0; } }
  @media (prefers-reduced-motion:reduce) { .go .gck path { animation:none; stroke-dashoffset:0; } }
  .footer .go { width:auto; flex:1; margin-top:0; padding:10px 15px; font-size:13px; }  .gdots i:nth-child(2) { animation-delay:.22s; } .gdots i:nth-child(3) { animation-delay:.44s; }
  @keyframes gdots { 0% { opacity:0; } 25%,70% { opacity:1; } 95%,100% { opacity:0; } }
  .erow { display:flex; gap:10px; }
  .erow .go { flex:1; margin-top:14px; }
  .status { margin-top:16px; font-size:13px; color:var(--mut); white-space:pre-wrap; text-align:center; }
  .status.wait { font-size:var(--fs-body); color:var(--accent); font-weight:var(--fw-x); }   
  .status .gtime { margin-left:7px; }   
  .status.err { color:var(--danger); }
  .status svg { vertical-align:-2px; }
  .rhead { display:flex; align-items:center; margin:18px 0 6px; }
  .rhead label { margin:0; flex:1; }
  .cpy { display:grid; place-items:center; width:26px; height:26px; padding:0; opacity:.6; position:relative;   
    border-radius:50%; border:1px solid rgba(255,255,255,.17); background:rgba(26,28,26,.3); color:var(--mut); cursor:pointer; box-shadow:inset 0 1px 0 rgba(255,255,255,.2);
     transition:transform var(--dur-fast), color var(--dur), border-color var(--dur); }
  .cpy::before { content:""; position:absolute; inset:-8px; }
  .cpy svg { display:block; width:13px; height:13px; }
  .cpy:hover { color:var(--fg); border-color:rgba(255,255,255,.27); }
  .cpy:active { transform:scale(var(--press-s)); color:var(--accent); border-color:rgba(var(--accent-rgb),.6); }
  .rbox { padding:12px; background:var(--well); border:1px solid var(--line); border-radius:var(--r-s); font-size:14px; line-height:1.6; white-space:pre-wrap; word-break:break-word; }
  .rbox.en { color:var(--mut); }   
  .rmeta { margin-top:14px; font-size:12px; color:var(--mut); text-align:center; }
  audio { width:100%; margin:10px 0 2px; }
  .lyopt-row { display:flex; align-items:center; flex-wrap:wrap; gap:var(--sp-1); margin:0 0 7px ; }
  .lyopt-k { flex:none; min-width:64px; color:var(--mut); font-size:var(--fs-xs); }   
  .lyopt-row input[type=range] { flex:1; min-width:60px; accent-color:var(--accent); height:24px ; }   
  .lypv-fs { flex:none; font:11px ui-monospace,SFMono-Regular,Menlo,monospace; min-width:44px; text-align:right; color:var(--mut); }   
  .lypv-fs.on { color:var(--accent); }
  .matgls { display:flex; flex-wrap:wrap; gap:10px var(--sp-1) ; margin:0 0 var(--sp-1); }
  .geni-opts.lenopts { flex:1 1 auto; flex-wrap:nowrap; align-items:center; gap:7px ; }
  .lenrule { position:relative; flex:1 1 auto; min-width:0; user-select:none; -webkit-user-select:none; }
  .lenrule-lbls { position:relative; height:calc(var(--fs-xs) * var(--lh-base)); margin-bottom:3px ; color:var(--mut); font-size:var(--fs-xs); font-variant-numeric:tabular-nums; }
  .lenrule-lbls i { position:absolute; top:0; white-space:nowrap ; font-style:normal; transform:translateX(-50%); transition:color var(--dur) ease; }
  .lenrule-lbls i:first-child { transform:none; }
  .lenrule-lbls i:last-child { transform:translateX(-100%); }
  .lenrule-lbls i.on { color:var(--accent); font-weight:var(--fw-x); }   
  .lenrule-track { position:relative; height:26px; overflow:hidden; border:1px solid var(--line); border-radius:var(--r-s); background:repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 1px, transparent 1px 10%), rgba(255,255,255,.03); }   
  .lenrule-fill { position:absolute; top:0; bottom:0; left:0; pointer-events:none; background:rgba(var(--accent-rgb),.10); }   
  .lenrule-ph { position:absolute; top:0; bottom:0; width:1px; pointer-events:none; background:var(--accent); box-shadow:0 0 6px rgba(var(--accent-rgb),.8); }   
  .lenrule-hit { position:absolute; inset:0; }   
  .lenrule-hit button { position:absolute; top:0; bottom:0; padding:0; background:none; border:0; color:inherit; font:inherit; cursor:pointer; -webkit-tap-highlight-color:transparent; }
  .lenrule-hit button:active { transform:scale(var(--press-pico)); }
  .lenrule-v { flex:none; min-width:8ch ; text-align:right; color:var(--accent); font-weight:var(--fw-x); font-size:var(--fs-label); font-variant-numeric:tabular-nums; }
  .vocgauge { flex:1; min-width:60px ; display:flex; flex-direction:column; }
  .vocgauge input[type=range] { width:100%; accent-color:var(--accent); height:24px ; }
  #masec[hidden], #mabody.none, #maadv.none, #maeq.none { display:none; }
  .maeqg { display:block; width:100%; height:88px ; margin:0 0 var(--sp-1); background:var(--well); border:1px solid var(--line); border-radius:var(--r-s); }
  .maeqg path { fill:none; stroke:var(--accent); stroke-width:1.8; }   
  .maeqg .zero { stroke:var(--line); stroke-width:1; }   
  #maMet { font-variant-numeric:tabular-nums; }
  #maMet b { color:var(--accent); font-weight:var(--fw-b); }
  .footer { display:flex; align-items:center; gap:12px; margin-top:10px; }
  .ghost { background:rgba(255,255,255,.04); border:1px solid var(--line); color:var(--fg); font-weight:var(--fw-b); font-size:13px; font-family:inherit; padding:9px 15px; border-radius:var(--r-pill); cursor:pointer; display:inline-flex; align-items:center; gap:7px; transition:transform var(--dur-fast); }
  .ghost:active { transform:scale(var(--press-l)); } .ghost svg { width:14px; height:14px; }
  .ghost.dlbtn { margin-left:auto; width:38px; height:38px; padding:0; justify-content:center; }
  .wrap { position:relative; }
  .histbtn { position:absolute; top:10px; right:12px; z-index:6; display:grid; place-items:center; width:var(--btn-sm); height:var(--btn-sm); padding:0;   
    border-radius:50%; border:1px solid rgba(255,255,255,.17); background:rgba(26,28,26,.3); color:var(--mut); cursor:pointer; box-shadow:inset 0 1px 0 rgba(255,255,255,.2);
    -webkit-backdrop-filter:blur(var(--blur-m)) saturate(1.3); backdrop-filter:blur(var(--blur-m)) saturate(1.3); transition:transform var(--dur-fast), color var(--dur), border-color var(--dur); }
  .histbtn:active { transform:scale(var(--press-s)); color:var(--accent); border-color:rgba(var(--accent-rgb),.6); }
  .histbtn svg { width:14px; height:14px; }
  .hpop { position:absolute; top:max(12px, env(safe-area-inset-top)); right:12px; width:min(86cqw,340px); max-height:min(70cqh,480px); max-height:min(70cqh,480px); z-index:30; border-radius:var(--r-l); border:1px solid rgba(255,255,255,.12);   
    background:linear-gradient(165deg,rgba(24,25,28,.9),rgba(16,17,19,.94)); -webkit-backdrop-filter:blur(var(--blur-l)) saturate(1.5); backdrop-filter:blur(var(--blur-l)) saturate(1.5);
    transform-origin:top right; animation:hUnfold .22s var(--gauge-ease); display:flex; flex-direction:column; overflow:hidden; }
  .hpop[hidden] { display:none; }
  @keyframes hUnfold { 0% { transform:scale(.6); opacity:0; } 100% { transform:scale(1); opacity:1; } }
  .hpop .hh { display:flex; align-items:center; gap:8px; padding:12px 12px 10px 14px; border-bottom:1px solid rgba(255,255,255,.08); }
  .hpop .ht { flex:1; font-size:var(--fs-label); font-weight:var(--fw-x); }
  .hpop .hx { display:grid; place-items:center; width:var(--btn-sm); height:var(--btn-sm); padding:0; border-radius:50%; border:1px solid rgba(255,255,255,.17); background:rgba(26,28,26,.3); color:var(--mut); cursor:pointer; }   
  .hpop .hx:active { transform:scale(var(--press-m)); }
  .hpop .hx svg { width:12px; height:12px; }
  .hpop .hl { overflow-y:auto; padding:6px 8px 10px; }
  .hrow { display:grid; grid-template-columns:1fr auto; gap:2px 8px; width:100%; text-align:left; padding:9px 10px; border:0; border-radius:var(--r-s); background:transparent; color:var(--fg); font:inherit; cursor:pointer; transition:background var(--dur); }
  .hrow:active { background:rgba(255,255,255,.05); }
  .hrow.on { background:rgba(var(--accent-rgb),.08); }
  .hrow .t { font-size:13px; font-weight:var(--fw-b); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .hrow.on .t { color:var(--accent); }
  .hrow .eq { color:var(--accent); font-size:10px; font-weight:var(--fw-x); align-self:center; }
  .hrow .m { grid-column:1/-1; font-size:10.5px; color:var(--mut); font-variant-numeric:tabular-nums; }
  .filerow { display:flex; gap:10px; align-items:stretch; margin-top:10px; }
  .filerow .file { flex:1.4 1 0; min-width:0; }
  .filerow .go { flex:1 1 0; width:auto; margin-top:0; white-space:nowrap; }
  .file { display:flex; align-items:center; justify-content:center; margin:0; padding:12px; border:1px dashed transparent; border-radius:var(--r-s); color:var(--accent); cursor:pointer; background:transparent; overflow:hidden; white-space:nowrap;
    -webkit-tap-highlight-color:transparent; -webkit-user-select:none; user-select:none; transition:transform var(--dur-fast) ease, border-color var(--dur) ease, color var(--dur) ease; }   
  .file svg { width:26px; height:26px; display:block; flex:none; transition:transform var(--dur-fast) cubic-bezier(.2,.9,.3,1.25); }
  .file:active svg { transform:scale(var(--press-xs,.8)); }   
  .file.has { border-color:var(--accent); border-style:solid; animation:fileIn .42s ease; }
  .file .fname { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; min-width:0; margin-left:8px; font-size:12px; font-weight:var(--fw-b); }
  .file .fname:empty { margin:0; }   
  @keyframes fileIn { 0% { transform:scale(.965); box-shadow:0 0 0 0 rgba(var(--accent-rgb),.45); } 45% { transform:scale(1.025); box-shadow:0 0 0 6px rgba(var(--accent-rgb),.10); } 100% { transform:scale(1); box-shadow:0 0 0 0 rgba(var(--accent-rgb),0); } }
  @media (prefers-reduced-motion:reduce) { .file.has { animation:none; } }
  #vName { margin-top:10px; }
  .consln { margin-top:10px; text-align:center; }   
  .consln .selv { margin:0; }
  nd-html.inmodal .wrap { max-width:none; }   
  @container nd (min-width:900px){
    nd-html.inmodal .wrap { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); column-gap:var(--sp-3); align-items:start; }
    nd-html.inmodal .wrap > * { grid-column:1; }
    nd-html.inmodal .wrap > #out { grid-column:2; grid-row:1 / span 99; align-self:start;
      position:sticky; top:var(--sp-3); max-height:calc(100cqh - var(--sp-3)); overflow-y:auto; overscroll-behavior:contain; }   
    nd-html.inmodal .topdock { margin-right:0; }
}`,
    `nd-html{scrollbar-width:thin}nd-html::-webkit-scrollbar,nd-body::-webkit-scrollbar{width:10px;height:10px;display:block}`,
    SHEETS["nm-scene-tokens.css"],
    SHEETS["nm-scene.css"]],
  scheme: "dark",
  htmlAttrs: {"lang":"ko"},
  bodyAttrs: {},
  html: `<div class="wrap">
  <div class="topdock" id="topDock">
    <div class="pvsec"><div class="cpprev-box"><div class="cpv-empty"><div class="cpv-stage"><button type="button" class="cpv-photobtn" id="pvPick" disabled aria-label="이미지 첨부 — 이 탭은 아직 첨부 소스가 없다" title="이미지 첨부 — 이 탭은 아직 첨부 소스가 없다"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="8.5" cy="9.5" r="1.5"></circle><path d="M21 16l-5-5L5 20"></path></svg></button></div></div></div><div class="trailwrap" id="cpRailWrap"><nav class="trail" id="cpZoomRail" aria-label="미리보기 확대"><button type="button" class="trail-i" id="cpZoom" aria-pressed="false" aria-label="미리보기 확대" title="탭=미리보기 확대 · 다시 탭=원상복귀"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/><path d="M8 11h6"/><path class="cpz-v" d="M11 8v6"/></svg></button></nav><nav class="trail trail-opts" id="cpRail" aria-label="미리보기 옵션"><span class="trail-g"><button type="button" class="cpv-tool" id="pvSwap" disabled aria-label="이미지 교체" title="이미지 교체"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></button><button type="button" class="cpv-tool" id="pvDel" disabled aria-label="이미지 삭제" title="이미지 삭제"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button><button class="histbtn" id="histBtn" type="button" aria-label="만든 노래 목록"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h11M3 12h11M3 18h7"/><circle cx="18.5" cy="16.5" r="2.5"/><path d="M21 16.5V7.5l-3 1"/></svg></button></span><span class="trail-div"></span><div class="optstrip trail-v" id="optStrip"><div class="gospec" id="goSpec"></div></div></nav><div class="firebar trail-fire"><div class="inner"><button class="go" id="optGo">생성</button></div></div></div></div>
  </div>
  <label class="fl" for="story">내용</label>
  <textarea id="story" placeholder="" aria-label="내용" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done"></textarea>
  <div class="geni-sechead"><span class="cref-lbl">설계</span></div>
  <div class="ogrid">
  <div class="geni-row geni-railrow"><span class="pub-l">장르</span><div class="geni-railwrap edge"><span class="geni-opts geni-rail" id="genPop" role="group" aria-label="장르"><span class="geni-subit"><button type="button" class="geni-opt on" data-v="자동">자동</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="발라드">발라드</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="힙합">힙합</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="록">록</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="R&amp;B">R&amp;B</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="댄스·EDM">댄스</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="트로트">트로트</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="재즈">재즈</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="어쿠스틱">어쿠스틱</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="OST·시네마틱">OST</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="시티팝">시티팝</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="신스팝">신스팝</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="로파이">로파이</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="인디 포크">포크</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="펑크·디스코">디스코</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="국악 퓨전">국악</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-free="1">직접</button></span></span><div class="geni-navs"><button type="button" class="geni-nav" data-dir="-1" aria-label="이전"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button><button type="button" class="geni-nav" data-dir="1" aria-label="다음"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button></div></div><span class="selin none" id="genFree"><input type="text" id="genreIn" placeholder="직접 입력 — 예: 시티팝" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done"></span></div>
  <div class="geni-row geni-railrow"><span class="pub-l">분위기</span><div class="geni-railwrap edge"><span class="geni-opts geni-rail" id="moodPop" role="group" aria-label="분위기"><span class="geni-subit"><button type="button" class="geni-opt on" data-v="자동">자동</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="신나는">신나는</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="잔잔한">잔잔한</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="웅장한">웅장한</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="몽환적">몽환적</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="어두운">어두운</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="따뜻한">따뜻한</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="쓸쓸한">쓸쓸한</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="긴장감">긴장감</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="희망찬">희망찬</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="새벽 감성">새벽</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="장난스러운">장난</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-free="1">직접</button></span></span><div class="geni-navs"><button type="button" class="geni-nav" data-dir="-1" aria-label="이전"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button><button type="button" class="geni-nav" data-dir="1" aria-label="다음"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button></div></div><span class="selin none" id="moodFree"><input type="text" id="moodIn" placeholder="직접 입력 — 예: 비 오는 밤" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done"></span></div>
  <div class="geni-row geni-railrow"><span class="pub-l">테마</span><div class="geni-railwrap edge"><span class="geni-opts geni-rail" id="themePop" role="group" aria-label="테마"><span class="geni-subit"><button type="button" class="geni-opt on" data-v="자동">자동</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="사랑">사랑</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="이별">이별</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="응원·위로">응원</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="추억·향수">추억</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="성장">성장</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="우정·가족">가족</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="사회 풍자">풍자</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="계절">계절</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="여행">여행</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="성공·야망">성공</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="일상">일상</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-free="1">직접</button></span></span><div class="geni-navs"><button type="button" class="geni-nav" data-dir="-1" aria-label="이전"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button><button type="button" class="geni-nav" data-dir="1" aria-label="다음"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button></div></div><span class="selin none" id="themeFree"><input type="text" id="themeIn" placeholder="직접 입력 — 예: 첫 출근" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done"></span></div>
  <div class="geni-row geni-railrow"><span class="pub-l">표현방식</span><div class="geni-railwrap edge"><span class="geni-opts geni-rail" id="expPop" role="group" aria-label="표현방식"><span class="geni-subit"><button type="button" class="geni-opt on" data-v="자동">자동</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="감성 서정">감성</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="유머·풍자">풍자</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="웅장·시네마틱">웅장</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="담담한 내레이션">담담</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="신나는 훅">신나는</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="몽환">몽환</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-v="분노·비판">분노</button></span><span class="geni-subit"><span class="geni-sep" aria-hidden="true">|</span><button type="button" class="geni-opt" data-free="1">직접</button></span></span><div class="geni-navs"><button type="button" class="geni-nav" data-dir="-1" aria-label="이전"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button><button type="button" class="geni-nav" data-dir="1" aria-label="다음"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button></div></div><span class="selin none" id="expFree"><input type="text" id="expIn" placeholder="직접 입력 — 예: 새벽 감성 위스퍼" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done"></span></div>
  <div class="geni-row"><span class="pub-l">길이</span><span class="geni-opts lenopts"><div class="lenrule" id="axLen" role="group" aria-label="길이 — 10초부터 60초까지 5초 눈금"></div><span class="lenrule-v" id="axLenV" aria-live="polite"></span></span></div>
  </div>
  <div class="selwrap">
    <label class="fl">고급 <button type="button" class="selv" id="advV" aria-expanded="false">열기</button></label>
    <div id="advbody" class="none">
      <div class="lyopt-row"><span class="lyopt-k">보컬</span><span class="vocgauge"><span class="lenrule-lbls" id="gVLbl" aria-hidden="true"><i data-g="-100" style="left:0">남성</i><i data-g="0" class="on" style="left:50%">중성</i><i data-g="100" style="left:100%">여성</i></span><input type="range" data-nmg="scrub" data-scrub-tint="cool magenta" id="gV" min="-100" max="100" step="10" value="0" aria-label="보컬 성별 — 왼쪽 남성 · 가운데 중성(지정 없음) · 오른쪽 여성"></span><span class="lypv-fs" id="gVV" aria-hidden="true">중성</span></div>
      <div class="lyopt-row"><span class="lyopt-k">실험성</span><input type="range" data-nmg="scrub" data-scrub-tint="chroma" id="gW" min="0" max="100" step="5" value="50" aria-label="실험성 — 0 안전하게 · 50 기본 · 100 파격적으로"><span class="lypv-fs" id="gWV" aria-hidden="true">50%</span></div>
      <div class="lyopt-row"><span class="lyopt-k">장르 충실</span><input type="range" data-nmg="scrub" data-scrub-tint="accent" id="gS" min="0" max="100" step="5" value="50" aria-label="장르 충실 — 0 느슨하게 · 50 기본 · 100 장르 관습 엄수"><span class="lypv-fs" id="gSV" aria-hidden="true">50%</span></div>
    </div>
  </div>
  <div id="optwrap" hidden>
    <label class="fl">스타일 옵션</label>
    <div class="optgrid" id="optgrid"></div>
    <div class="erow">
      <button class="go" id="sunoGo">Suno 프롬프트</button>
      <button class="go" id="lyriaGo">구글 곡 생성</button>
    </div>
  </div>
  <div class="status" id="sstatus" role="status"></div>
  <div id="out" hidden>
    <div class="rhead"><label class="fl">제목 (Title)</label><button class="cpy" type="button" data-k="title" aria-label="제목 복사"></button></div>
    <div class="rbox" id="rTitle"></div>
    <div class="rhead"><label class="fl">스타일 (Styles)</label><button class="cpy" type="button" data-k="style" aria-label="스타일 복사"></button></div>
    <div class="rbox en" id="rStyle"></div>
    <div class="rhead"><label class="fl">가사 (Lyrics)</label><button class="cpy" type="button" data-k="lyrics" aria-label="가사 복사"></button></div>
    <div class="rbox" id="rLyrics"></div>
    <div class="rhead"><label class="fl">제외 (Exclude Styles)</label><button class="cpy" type="button" data-k="exclude" aria-label="제외 스타일 복사"></button></div>
    <div class="rbox en" id="rExcl"></div>
    <div class="rmeta" id="rMeta"></div>
  </div>
  <div id="lout" hidden>
    <div class="rhead"><label class="fl">완성곡</label></div>
    <div class="rbox" id="lTitle"></div>
    <audio id="lAud" controls preload="metadata"></audio>
    <div class="footer"><button class="go" id="vApply" hidden>보이스 입히기</button><button class="ghost dlbtn" id="lDl" aria-label="곡 저장" title="곡 저장"></button></div>
    <div class="selwrap" id="masec">
      <label class="fl">마스터링 <button type="button" class="selv" id="maV" aria-expanded="false">열기</button></label>
      <div id="mabody" class="none">
        <div class="matgls" id="maEqPre">
          <button type="button" class="spbtn on" data-p="flat" aria-pressed="true">그대로</button>
          <button type="button" class="spbtn" data-p="vocal" aria-pressed="false">보컬 부스트</button>
          <button type="button" class="spbtn" data-p="bass" aria-pressed="false">베이스 부스트</button>
          <button type="button" class="spbtn" data-p="bright" aria-pressed="false">밝게</button>
          <button type="button" class="spbtn" data-p="warm" aria-pressed="false">따뜻하게</button>
        </div>
        <div id="mamac"></div>
        <label class="fl">세부 조정 <button type="button" class="selv" id="maAdvV" aria-expanded="false">열기</button></label>
        <div id="maadv" class="none">
          <div class="lyopt-row"><span class="lyopt-k">음량</span><input type="range" data-nmg="scrub" data-scrub-tint="light" id="maLufs" min="-20" max="-6" step="0.5" value="-14" aria-label="음량 목표 — LUFS(숫자가 클수록 크게)"><span class="lypv-fs" id="maLufsV" aria-hidden="true">-14</span></div>
          <div class="lyopt-row"><span class="lyopt-k">피크 천장</span><input type="range" data-nmg="scrub" data-scrub-tint="warm" id="maCeil" min="-3" max="0" step="0.1" value="-1" aria-label="트루피크 천장 — dBTP(찢어짐 방지 상한)"><span class="lypv-fs" id="maCeilV" aria-hidden="true">-1.0</span></div>
          <div class="lyopt-row"><span class="lyopt-k">스테레오</span><input type="range" data-nmg="scrub" data-scrub-tint="cool" id="maWid" min="0" max="200" step="5" value="100" aria-label="스테레오 폭 — 0% 모노 · 100% 원본 · 200% 확장"><span class="lypv-fs" id="maWidV" aria-hidden="true">100%</span></div>
          <div class="lyopt-row"><span class="lyopt-k">입력 게인</span><input type="range" data-nmg="scrub" data-scrub-tint="light" id="maGain" min="-12" max="12" step="0.5" value="0" aria-label="입력 게인 — dB"><span class="lypv-fs" id="maGainV" aria-hidden="true">0.0</span></div>
          <div class="matgls" id="maTgls">
            <button type="button" class="spbtn on" data-t="normalize" aria-pressed="true">음량 맞추기</button>
            <button type="button" class="spbtn on" data-t="limit" aria-pressed="true">찢어짐 방지</button>
            <button type="button" class="spbtn on" data-t="cleanLowEnd" aria-pressed="true">저역 정리</button>
            <button type="button" class="spbtn" data-t="centerBass" aria-pressed="false">베이스 가운데</button>
            <button type="button" class="spbtn" data-t="glue" aria-pressed="false">묶어주기</button>
            <button type="button" class="spbtn" data-t="cutMud" aria-pressed="false">탁함 빼기</button>
            <button type="button" class="spbtn" data-t="tameHarsh" aria-pressed="false">쏘는 소리 줄이기</button>
            <button type="button" class="spbtn" data-t="addAir" aria-pressed="false">공기감</button>
          </div>
          <div class="matgls" id="maFmt">
            <button type="button" class="spbtn on" data-sr="44100" aria-pressed="true">44.1kHz</button>
            <button type="button" class="spbtn" data-sr="48000" aria-pressed="false">48kHz</button>
            <button type="button" class="spbtn on" data-bd="16" aria-pressed="true">16bit</button>
            <button type="button" class="spbtn" data-bd="24" aria-pressed="false">24bit</button>
          </div>
        </div>
        <label class="fl">이퀄라이저 <button type="button" class="selv" id="maEqV" aria-expanded="false">열기</button></label>
        <div id="maeq" class="none">
          <svg class="maeqg" id="maEqG" viewBox="0 0 320 88" preserveAspectRatio="none" role="img" aria-label="이퀄라이저 응답 곡선"><path class="zero" d="M0 44H320"/><path id="maEqPath" d="M0 44H320"/></svg>
          <div id="maeqb"></div>
        </div>
        <div class="erow"><button class="go" id="maGo">다듬어 듣기</button><button class="go" id="maDl" disabled>WAV 저장</button></div>
        <div class="rmeta" id="maMet"></div>
      </div>
    </div>
    <div class="rhead"><label class="fl">가사</label><button class="cpy" type="button" data-k="llyr" aria-label="가사 복사"></button></div>
    <div class="rbox" id="lLyr"></div>
    <div class="rmeta" id="lMeta"></div>
  </div>
  <div class="selwrap" id="vcsec" hidden>
    <label class="fl">음성 클로닝 <button type="button" class="selv" id="vcV" aria-haspopup="true">없음</button></label>
    <div class="selpop none" id="vcPop"></div>
    <input type="text" id="vName" placeholder="" aria-label="보이스 이름" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done">
    <div class="filerow">
      <label class="file" id="vfLab" aria-label="보이스 소스 선택" title="보이스 소스 (1~5분 오디오)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4"/></svg><span class="fname" id="vfName"></span>
        <input type="file" accept="audio/*" id="vFile" style="display:none">
      </label>
      <button class="go" id="trainGo">보이스 학습</button>
    </div>
    <div class="consln"><button type="button" class="selv" id="consBtn" aria-pressed="false">동의 — 본인·권리 보유 음성만 (실존 타인 금지)</button></div>
  </div>
  <div class="hpop" id="hpop" hidden>
    <div class="hh"><div class="ht">만든 노래</div><button class="hx" id="hpopX" type="button" aria-label="닫기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6 18 18M18 6 6 18"/></svg></button></div>
    <div class="hl" id="hlist"></div>
  </div>
</div>
<script type="text/nm-off" data-nm-i="3" src="/nm-svg.js"></script><script type="text/nm-off" data-nm-i="4" src="/nm-ua.js"></script>
<script type="text/nm-off" data-nm-i="5" src="/nm-rail.js" data-scope="cap" data-dlname="song.mp3" data-jobkey="nm_song_pend" data-srv="api/caphist?recent=48"></script>
<script type="text/nm-off" data-nm-i="6" src="/nm-jobs.js"></script>
<script type="text/nm-off" data-nm-i="7" src="/nm-clip.js"></script>
<script type="text/nm-off" data-nm-i="8" src="/nm-sync.js"></script>
<script type="text/nm-off" data-nm-i="9" src="/nm-loader.js"></script>
<script type="text/nm-off" data-nm-i="10" src="/nm-gauge.js"></script>
<script type="text/nm-off" data-nm-i="11" src="/master.js"></script>
<script type="text/nm-off" data-nm-i="12" src="/upload.js"></script>
<script type="text/nm-off" data-nm-i="13"></script>
<script type="text/nm-off" data-nm-i="14" src="/cscroll.js"></script>
<script type="text/nm-off" data-nm-i="15"></script>`,
  headTags: `<script type="text/nm-off" data-nm-i="0"></script><script type="text/nm-off" data-nm-i="1" src="/nm-wave.js"></script><script type="text/nm-off" data-nm-i="2" src="/nm-scene.js"></script>`,
  scripts: [{ run: inline1 },
    { src: "nm-wave.js", defer: true, run: LIB["nm-wave.js"] },
    { src: "nm-scene.js", defer: true, run: LIB["nm-scene.js"] },
    { src: "nm-svg.js", run: LIB["nm-svg.js"] },
    { src: "nm-ua.js", defer: true, run: LIB["nm-ua.js"] },
    { src: "nm-rail.js", run: LIB["nm-rail.js"] },
    { src: "nm-jobs.js", run: LIB["nm-jobs.js"] },
    { src: "nm-clip.js", run: LIB["nm-clip.js"] },
    { src: "nm-sync.js", run: LIB["nm-sync.js"] },
    { src: "nm-loader.js", run: LIB["nm-loader.js"] },
    { src: "nm-gauge.js", run: LIB["nm-gauge.js"] },
    { src: "master.js", run: LIB["master.js"] },
    { src: "upload.js", run: LIB["upload.js"] },
    { run: inline2 },
    { src: "cscroll.js", run: LIB["cscroll.js"] },
    { run: inline3 }],
};
