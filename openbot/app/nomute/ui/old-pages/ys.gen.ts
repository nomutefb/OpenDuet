// @ts-nocheck
/* 만든 파일 — 손으로 고치지 말 것(ui/old-pages/tools/gen.mjs · 옛 에디터 viewer 의 ys.html 화면)
   원본 = ys.html + tokens.css · nm-shared.css · nm-clip.css · nm-input.css · nm-cards.css · nm-job.css · nm-hist.css · nm-scene-tokens.css · nm-scene.css + nm-wave.js · nm-scene.js · nm-svg.js · nm-ua.js · nm-loader.js · nm-gauge.js · nm-snap.js · nm-clip.js · nm-rail.js · nm-jobs.js · cscroll.js · nm-sync.js */
import { SHEETS, FONTS } from "./css.gen";
import { LIB } from "./lib.gen";
function inline1(window, document, __nm) {
if (window.self !== window.top) document.documentElement.classList.add('inmodal');
}
function inline2(window, document, __nm) {
__nm.ex({"$":[()=>$],"esc":[()=>esc],"sleep":[()=>sleep],"RM":[()=>RM],"svgD":[()=>svgD],"D":[()=>D],"MORPH":[()=>MORPH,(v)=>{MORPH=v;}],"morphReady":[()=>morphReady],"mk":[()=>mk,(v)=>{mk=v;}],"DEF":[()=>DEF],"OKV":[()=>OKV],"FONTS":[()=>FONTS],"_gfPre":[()=>_gfPre,(v)=>{_gfPre=v;}],"loadPvFont":[()=>loadPvFont,(v)=>{loadPvFont=v;}],"railRow":[()=>railRow,(v)=>{railRow=v;}],"accCard":[()=>accCard,(v)=>{accCard=v;}],"GAUGE":[()=>GAUGE],"gaugeRow":[()=>gaugeRow,(v)=>{gaugeRow=v;}],"buildOpts":[()=>buildOpts,(v)=>{buildOpts=v;}],"OKEY":[()=>OKEY],"opts":[()=>opts,(v)=>{opts=v;}],"VID_RE":[()=>VID_RE],"SAVED_VOICE":[()=>SAVED_VOICE,(v)=>{SAVED_VOICE=v;}],"paintOpts":[()=>paintOpts,(v)=>{paintOpts=v;}],"paintSums":[()=>paintSums,(v)=>{paintSums=v;}],"FOLLOW":[()=>FOLLOW,(v)=>{FOLLOW=v;}],"followOpen":[()=>followOpen,(v)=>{followOpen=v;}],"VOICES":[()=>VOICES,(v)=>{VOICES=v;}],"PLAY_D":[()=>PLAY_D],"STOP_D":[()=>STOP_D],"loadVoices":[()=>loadVoices,(v)=>{loadVoices=v;}],"AUD":[()=>AUD],"AUD_ID":[()=>AUD_ID,(v)=>{AUD_ID=v;}],"stopPreview":[()=>stopPreview,(v)=>{stopPreview=v;}],"_vsig":[()=>_vsig,(v)=>{_vsig=v;}],"paintVoices":[()=>paintVoices,(v)=>{paintVoices=v;}],"saveOpts":[()=>saveOpts,(v)=>{saveOpts=v;}],"paintGauge":[()=>paintGauge,(v)=>{paintGauge=v;}],"SPEC_LBL":[()=>SPEC_LBL],"paintSpec":[()=>paintSpec,(v)=>{paintSpec=v;}],"ytCheck":[()=>ytCheck,(v)=>{ytCheck=v;}],"setMsg":[()=>setMsg,(v)=>{setMsg=v;}],"paintUrl":[()=>paintUrl,(v)=>{paintUrl=v;}],"paintUrlState":[()=>paintUrlState,(v)=>{paintUrlState=v;}],"paintGo":[()=>paintGo,(v)=>{paintGo=v;}],"pasteLink":[()=>pasteLink,(v)=>{pasteLink=v;}],"TYPE_ID":[()=>TYPE_ID,(v)=>{TYPE_ID=v;}],"TYPE_ON":[()=>TYPE_ON,(v)=>{TYPE_ON=v;}],"placeCaret":[()=>placeCaret,(v)=>{placeCaret=v;}],"typeUrl":[()=>typeUrl,(v)=>{typeUrl=v;}],"clearLink":[()=>clearLink,(v)=>{clearLink=v;}],"MAC":[()=>MAC],"macPoll":[()=>macPoll,(v)=>{macPoll=v;}],"paintMac":[()=>paintMac,(v)=>{paintMac=v;}],"paintImgNote":[()=>paintImgNote,(v)=>{paintImgNote=v;}],"_macT":[()=>_macT,(v)=>{_macT=v;}],"macArm":[()=>macArm,(v)=>{macArm=v;}],"JKEY":[()=>JKEY],"JOBS":[()=>JOBS,(v)=>{JOBS=v;}],"readJobs":[()=>readJobs,(v)=>{readJobs=v;}],"STORE_OK":[()=>STORE_OK,(v)=>{STORE_OK=v;}],"mutate":[()=>mutate,(v)=>{mutate=v;}],"HJOBS":[()=>HJOBS],"jobOf":[()=>jobOf],"t0Of":[()=>t0Of],"resumeRuns":[()=>resumeRuns,(v)=>{resumeRuns=v;}],"STEPS":[()=>STEPS],"ST_OK":[()=>ST_OK],"PROG":[()=>PROG],"getJSON":[()=>getJSON,(v)=>{getJSON=v;}],"POLL_MS":[()=>POLL_MS],"STALL_MS":[()=>STALL_MS],"LIMIT_MS":[()=>LIMIT_MS],"poll":[()=>poll,(v)=>{poll=v;}],"stepFailed":[()=>stepFailed,(v)=>{stepFailed=v;}],"failWhy":[()=>failWhy,(v)=>{failWhy=v;}],"compactSteps":[()=>compactSteps,(v)=>{compactSteps=v;}],"learn":[()=>learn,(v)=>{learn=v;}],"land":[()=>land,(v)=>{land=v;}],"failJob":[()=>failJob,(v)=>{failJob=v;}],"nextAct":[()=>nextAct,(v)=>{nextAct=v;}],"FOCUS":[()=>FOCUS,(v)=>{FOCUS=v;}],"SHOWURL":[()=>SHOWURL,(v)=>{SHOWURL=v;}],"pickFocus":[()=>pickFocus,(v)=>{pickFocus=v;}],"settleFocus":[()=>settleFocus,(v)=>{settleFocus=v;}],"EMPTY_MON":[()=>EMPTY_MON],"DL_ICON":[()=>DL_ICON],"_monSrc":[()=>_monSrc,(v)=>{_monSrc=v;}],"dlHref":[()=>dlHref,(v)=>{dlHref=v;}],"paintMonitor":[()=>paintMonitor,(v)=>{paintMonitor=v;}],"CARD":[()=>CARD,(v)=>{CARD=v;}],"_tick":[()=>_tick,(v)=>{_tick=v;}],"jobDur":[()=>jobDur],"normSteps":[()=>normSteps,(v)=>{normSteps=v;}],"cardState":[()=>cardState,(v)=>{cardState=v;}],"pctOf":[()=>pctOf,(v)=>{pctOf=v;}],"elapsedOf":[()=>elapsedOf,(v)=>{elapsedOf=v;}],"buildCard":[()=>buildCard,(v)=>{buildCard=v;}],"paintFold":[()=>paintFold,(v)=>{paintFold=v;}],"countTo":[()=>countTo,(v)=>{countTo=v;}],"paintCard":[()=>paintCard,(v)=>{paintCard=v;}],"kdur":[()=>kdur],"sec":[()=>sec],"paintTimes":[()=>paintTimes,(v)=>{paintTimes=v;}],"paintTkMsg":[()=>paintTkMsg,(v)=>{paintTkMsg=v;}],"armTick":[()=>armTick,(v)=>{armTick=v;}],"_resFor":[()=>_resFor,(v)=>{_resFor=v;}],"REPORT":[()=>REPORT,(v)=>{REPORT=v;}],"loadScript":[()=>loadScript,(v)=>{loadScript=v;}],"mdLib":[()=>mdLib,(v)=>{mdLib=v;}],"fetchText":[()=>fetchText,(v)=>{fetchText=v;}],"row":[()=>row,(v)=>{row=v;}],"fmtDur":[()=>fmtDur],"paintRes":[()=>paintRes,(v)=>{paintRes=v;}],"dlCheck":[()=>dlCheck,(v)=>{dlCheck=v;}],"X_SVG":[()=>X_SVG],"paintErrs":[()=>paintErrs,(v)=>{paintErrs=v;}],"scrollToCard":[()=>scrollToCard,(v)=>{scrollToCard=v;}],"HIST":[()=>HIST,(v)=>{HIST=v;}],"_hsig":[()=>_hsig,(v)=>{_hsig=v;}],"tsMs":[()=>tsMs],"histTime":[()=>histTime,(v)=>{histTime=v;}],"httpsOk":[()=>httpsOk],"loadHist":[()=>loadHist,(v)=>{loadHist=v;}],"paintHist":[()=>paintHist,(v)=>{paintHist=v;}],"openHist":[()=>openHist,(v)=>{openHist=v;}],"renderAll":[()=>renderAll,(v)=>{renderAll=v;}],"FIRING":[()=>FIRING,(v)=>{FIRING=v;}],"GO_M":[()=>GO_M,(v)=>{GO_M=v;}],"GO_T":[()=>GO_T,(v)=>{GO_T=v;}],"goFlash":[()=>goFlash,(v)=>{goFlash=v;}],"shake":[()=>shake,(v)=>{shake=v;}],"fire":[()=>fire,(v)=>{fire=v;}],"PVZOOM":[()=>PVZOOM]});
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[c]);
const sleep = ms => new Promise(r => window.setTimeout(r, ms));
const RM = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  } catch (e) {
    return false;
  }
};
const svgD = (s, fb) => {
  const m = String(s || '').match(/<path d="([^"]+)"/g);
  return m ? m.map(x => x.slice(9, -1)).join('') : fb;
};
const D = {
  check: svgD(window.CHECK_SVG, 'M5 13l4 4L19 7'),
  x: svgD(window.ERR_SVG, 'M6 6 18 18M18 6 6 18'),
  down: svgD(window.DOWNLOAD_SVG, 'M12 3v12M7 11l5 5 5-5M5 21h14'),
  chevDown: 'm6 9 6 6 6-6',
  chevUp: 'm18 15-6-6-6 6',
  dot: 'M11 12h2',
  dash: 'M8 12h8'
};
let MORPH = null;
const morphReady = import("../../home/deck/vendor/morphicons/dom.js").then(m => MORPH = m.createMorph).catch(() => null);
function mk(path, d) {
  const o = {
    d: d,
    m: null,
    to(nd) {
      if (!nd || o.d === nd) return;
      o.d = nd;
      if (o.m) {
        try {
          o.m.morphTo(nd, 'snappy');
          return;
        } catch (e) {}
      }
      path.setAttribute('d', nd);
    },
    set(nd) {
      if (!nd) return;
      o.d = nd;
      if (o.m) {
        try {
          o.m.set(nd);
          return;
        } catch (e) {}
      }
      path.setAttribute('d', nd);
    }
  };
  path.setAttribute('d', d);
  morphReady.then(fn => {
    if (fn && !o.m && path.isConnected) {
      try {
        o.m = fn(path, o.d, {
          reducedMotion: 'user'
        });
      } catch (e) {
        o.m = null;
      }
    }
  });
  return o;
}
const DEF = {
  voice: 'eleven',
  stt: 'scribe',
  img: 'codex',
  len: '60',
  font: 'pretendard',
  ratio: '9:16',
  subbg: 'on',
  subop: 100,
  cap: 65,
  grid: '4'
};
const OKV = {
  voice: ['eleven'],
  stt: ['subs', 'scribe'],
  img: ['motion', 'codex', 'depth', 'grok'],
  len: ['45', '60', '90'],
  font: ['pretendard', 'gothic', 'barun'],
  ratio: ['9:16', '16:9'],
  subbg: ['on', 'off'],
  grid: ['4', '1']
};
const FONTS = {
  pretendard: {
    lbl: '프리텐다드',
    ff: '"Pretendard Variable","Pretendard",sans-serif'
  },
  gothic: {
    lbl: '노토 산스',
    ff: '"Noto Sans KR","Noto Sans CJK KR",sans-serif',
    gf: 'Noto+Sans+KR:wght@700'
  },
  barun: {
    lbl: '나눔바른고딕',
    fam: 'NanumBarunGothic',
    ff: '"NanumBarunGothic",sans-serif',
    lf: 'https://hangeul.pstatic.net/hangeul_static/webfont/NanumBarunGothic/NanumBarunGothicWebBold.woff2',
    lw: '700 900'
  }
};
let _gfPre = false;
function loadPvFont(k) {
  const f = FONTS[k];
  if (!f || !(f.gf || f.lf) || f._l) return;
  f._l = true;
  if (f.lf) {
    try {
      const face = new window.FontFace(f.fam, 'url(' + f.lf + ')', {
        weight: f.lw || '400',
        display: 'swap'
      });
      face.load().then(x => document.fonts.add(x)).catch(() => {});
    } catch (e) {}
    return;
  }
  if (!_gfPre) {
    _gfPre = true;
    [['https://fonts.googleapis.com', ''], ['https://fonts.gstatic.com', 'anonymous']].forEach(([h, co]) => {
      const p = document.createElement('link');
      p.rel = 'preconnect';
      p.href = __nm.u(h);
      if (co) p.crossOrigin = co;
      document.head.appendChild(p);
    });
  }
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = __nm.u('https://fonts.googleapis.com/css2?family=' + f.gf + '&display=swap');
  document.head.appendChild(l);
}
function railRow(k, label, items) {
  const wide = items.length >= 4 || items.length >= 3 && items.some(it => String(it[1]).length >= 6);
  return '<div class="geni-row snaprow" data-n="' + items.length + '"' + (wide ? ' data-wide' : '') + '><span class="pub-l">' + esc(label) + '</span><div data-k="' + k + '" data-nmsnap="ys-' + k + '" aria-label="' + esc(label) + '">' + items.map(([v, t, x]) => '<button type="button" class="geni-opt" data-v="' + esc(v) + '"' + (x || '') + '>' + esc(t) + '</button>').join('') + '</div></div>';
}
function accCard(id, name, inner) {
  return '<div class="scard" id="' + id + 'Card" data-acc="' + id + '"><button type="button" class="hd" aria-expanded="false" aria-controls="' + id + 'Acc"><span class="nm">' + esc(name) + '</span><span class="sum" id="' + id + 'Sum"></span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path/></svg></button>' + '<div class="acc" id="' + id + 'Acc" inert><div class="acc-in"><div class="prm">' + inner + '</div></div></div></div>';
}
const GAUGE = {
  cap: {
    def: 65,
    fmt: v => v === 65 ? '중앙' : v + '%'
  },
  subop: {
    def: 100,
    fmt: v => v + '%'
  }
};
function gaugeRow(k, label) {
  return '<div class="geni-row rbrow"><span class="pub-l">' + esc(label) + '</span><input type="range" data-nmg data-k="' + k + '" data-def="' + GAUGE[k].def + '" min="0" max="100" step="1" value="' + GAUGE[k].def + '" aria-label="' + esc(label) + '">' + '<span class="rbs-val" data-for="' + k + '"></span></div>';
}
function buildOpts() {
  $('#opts').innerHTML = __nm.h(accCard('voc', '음성 설정', '<div id="elvBox" hidden><div class="vfold" id="elvFold"><button type="button" class="vfh" aria-expanded="false" aria-controls="elvAcc"><span class="pub-l">목소리 선택</span><span class="sum" id="elvSum"></span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path/></svg></button>' + '<div class="acc" id="elvAcc" inert><div class="acc-in"><div class="vlist" id="elvList" role="radiogroup" aria-label="ElevenLabs 목소리"></div></div></div></div><div class="status" id="elvMsg"></div></div>' + railRow('stt', '받아쓰기', [['subs', '유튜브 자막 우선'], ['scribe', '정밀 받아쓰기', ' title="ElevenLabs Scribe"']])) + accCard('scr', '화면 설정', railRow('img', '장면', [['motion', '모션 그래픽', ' title="장면 내용을 도식(비교·흐름·숫자·목록 등)으로 움직이는 그래픽"'], ['codex', 'GPT 이미지', ' title="PC Codex(ChatGPT 구독) — 꺼져 있으면 모션 그래픽으로 대체"'], ['depth', 'GPT 입체', ' title="GPT 그림을 2.5D 입체 시차로 움직인다(가까운 곳이 더 크게 움직임) — PC가 꺼져 있으면 모션 그래픽으로 대체"'], ['grok', '그록 영상', ' title="장면마다 그록 영상 · 9:16 전면 · 클립 안에서 카메라 2~4번 전환 — PC가 켜져 있으면 GPT 스토리보드·캐릭터 보드를 참조로"']]) + '<div class="macrow"><a class="ysmac" id="mac" data-st="wait" href="/ys-worker-guide.html" target="_blank" rel="noopener" title="그림 담당(PC) 설정 안내 열기"><i class="ysmac-dot" aria-hidden="true"></i><span class="tk-orbit" id="macSpin" hidden aria-hidden="true"></span><span id="macT" aria-live="polite">PC 확인 중…</span></a></div>' + railRow('len', '길이', [['45', '45초', ' data-num="1"'], ['60', '60초', ' data-num="1"'], ['90', '90초', ' data-num="1"']]) + railRow('ratio', '비율', [['9:16', '9:16', ' data-num="1"'], ['16:9', '16:9', ' data-num="1"']]) + railRow('grid', '고화질', [['1', '켬', ' title="장면마다 그림 한 장(확대하면 더 섬세 · 그림 시간 약 2배 · GPT 이미지·입체만)"'], ['4', '끔', ' title="장면 4개를 그림 한 장에 그려 칸별로 잘라 AI로 늘린다(기본 · 빠르고 구독 한도 절반 · 칸끼리 같은 사람)"']])) + accCard('sub', '자막 설정', railRow('font', '폰트', OKV.font.map(k => [k, FONTS[k].lbl, ' style="font-family:' + esc(FONTS[k].ff) + '"'])) + gaugeRow('cap', '위치') + '<div class="vfold" id="subFold"><button type="button" class="vfh" aria-expanded="false" aria-controls="subAcc"><span class="pub-l">세부 설정</span><span class="sum" id="subFoldSum"></span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path/></svg></button>' + '<div class="acc" id="subAcc" inert><div class="acc-in">' + gaugeRow('subop', '배경') + '</div></div></div>'));
}
buildOpts();
const OKEY = 'ys_opts';
let opts = Object.assign({}, DEF);
const VID_RE = /^[A-Za-z0-9]{16,32}$/;
let SAVED_VOICE = '';
try {
  const s = JSON.parse(window.localStorage.getItem(OKEY) || '{}');
  if (s.img === 'none') s.img = 'motion';
  for (const k in OKV) if (OKV[k].includes(String(s[k]))) opts[k] = String(s[k]);
  if (VID_RE.test(String(s.el_voice || ''))) SAVED_VOICE = String(s.el_voice);
} catch (e) {}
opts.subbg = DEF.subbg;
try {
  const s = JSON.parse(window.localStorage.getItem(OKEY) || '{}');
  for (const k in GAUGE) {
    const v = Number(s[k]);
    opts[k] = Number.isInteger(v) && v >= 0 && v <= 100 ? v : GAUGE[k].def;
  }
} catch (e) {}
opts.el_voice = '';
function paintOpts() {
  document.querySelectorAll('#opts [data-nmsnap]').forEach(g => {
    const k = g.dataset.k;
    const bs = [...g.querySelectorAll('.geni-opt')],
      i = bs.findIndex(b => b.dataset.v === opts[k]);
    bs.forEach((b, n) => b.classList.toggle('on', n === i));
  });
  paintSums();
  Object.keys(GAUGE).forEach(paintGauge);
  paintSpec();
  paintImgNote();
  paintVoices();
}
function paintSums() {
  const vn = '고급 · ' + (opts.el_voice ? (VOICES.find(v => v.id === opts.el_voice) || {}).name || '지정' : '자동');
  $('#vocSum').textContent = vn + ' · ' + (opts.stt === 'scribe' ? '정밀 받아쓰기' : '자막 우선');
  $('#elvSum').textContent = opts.el_voice ? (VOICES.find(v => v.id === opts.el_voice) || {}).name || '지정' : '자동 · 기본 남성';
  $('#scrSum').textContent = ({
    motion: '모션 그래픽',
    codex: 'GPT 이미지',
    depth: 'GPT 입체',
    grok: '그록 영상'
  }[opts.img] || '') + ' · ' + opts.len + '초 · ' + opts.ratio;
  $('#subSum').textContent = FONTS[opts.font].lbl + ' · ' + GAUGE.cap.fmt(+opts.cap);
  $('#subFoldSum').textContent = '배경 ' + GAUGE.subop.fmt(+opts.subop);
}
let FOLLOW = 0;
function followOpen(el) {
  const my = ++FOLLOW,
    acc = el.querySelector(':scope > .acc');
  let box = document.scrollingElement;
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const o = window.getComputedStyle(p).overflowY;
    if (o === 'auto' || o === 'scroll') {
      box = p;
      break;
    }
  }
  const doc = box === document.scrollingElement,
    pad = parseFloat(window.getComputedStyle(document.documentElement).getPropertyValue('--sp-2')) || 0;
  const cs = acc && window.getComputedStyle(acc),
    dur = cs ? (parseFloat(cs.transitionDuration) || 0) * 1000 : 0,
    end = window.performance.now() + dur + 50;
  const quit = () => {
    FOLLOW++;
  };
  window.addEventListener('wheel', quit, {
    once: true,
    passive: true
  });
  window.addEventListener('touchstart', quit, {
    once: true,
    passive: true
  });
  const tick = () => {
    if (my !== FOLLOW) return;
    const r = __nm.rect(el),
      v = doc ? {
        top: 0,
        bottom: window.innerHeight
      } : __nm.rect(box);
    const dy = Math.min(r.bottom + pad - v.bottom, r.top - pad - v.top);
    if (dy > 0.5) box.scrollTop += dy;
    if (window.performance.now() < end) window.requestAnimationFrame(tick);else {
      window.removeEventListener('wheel', quit);
      window.removeEventListener('touchstart', quit);
    }
  };
  window.requestAnimationFrame(tick);
}
document.querySelectorAll('#opts .scard[data-acc]').forEach(card => {
  const hd = card.querySelector('.hd'),
    acc = card.querySelector('.acc'),
    chev = mk(card.querySelector('.chev path'), D.chevDown);
  hd.addEventListener('click', () => {
    const open = !card.classList.contains('open');
    card.classList.toggle('open', open);
    hd.setAttribute('aria-expanded', String(open));
    chev.to(open ? D.chevUp : D.chevDown);
    if (open) {
      acc.removeAttribute('inert');
      followOpen(card);
    } else acc.setAttribute('inert', '');
  });
});
{
  const f = $('#elvFold'),
    h = f.querySelector('.vfh'),
    a = f.querySelector('.acc'),
    cv = mk(h.querySelector('.chev path'), D.chevDown);
  h.addEventListener('click', () => {
    const open = !f.classList.contains('open');
    f.classList.toggle('open', open);
    h.setAttribute('aria-expanded', String(open));
    cv.to(open ? D.chevUp : D.chevDown);
    if (open) {
      a.removeAttribute('inert');
      followOpen(f);
    } else a.setAttribute('inert', '');
  });
}
let VOICES = [];
const PLAY_D = 'M6 3l14 9-14 9z',
  STOP_D = 'M6 6h12v12H6z';
async function loadVoices() {
  const d = await getJSON('ys_out/_voices.json');
  const a = d && Array.isArray(d.voices) ? d.voices : [];
  VOICES = a.filter(v => v && VID_RE.test(String(v.id || '')) && v.name).slice(0, 200).map(v => ({
    id: String(v.id),
    name: String(v.name).slice(0, 40),
    sub: [v.lang, v.gender, v.desc].filter(x => x && typeof x === 'string').join(' · ').slice(0, 90),
    preview: /^https:\/\//.test(String(v.preview || '')) ? String(v.preview) : ''
  }));
  const want = opts.el_voice || SAVED_VOICE;
  opts.el_voice = VOICES.some(v => v.id === want) ? want : '';
  paintVoices(true);
  paintSums();
}
const AUD = new window.Audio();
AUD.preload = 'none';
let AUD_ID = '';
function stopPreview() {
  try {
    AUD.pause();
  } catch (e) {}
  AUD_ID = '';
  document.querySelectorAll('#elvList .vplay.on').forEach(b => {
    b.classList.remove('on');
    if (b._m) b._m.to(PLAY_D);
    b.setAttribute('aria-label', '미리듣기');
  });
}
AUD.addEventListener('ended', stopPreview);
AUD.addEventListener('error', () => {
  stopPreview();
  setMsg('#elvMsg', '미리듣기를 못 불러왔어 — 목소리 목록이 오래됐을 수 있어.', 'warn');
});
let _vsig = '';
function paintVoices(force) {
  const box = $('#elvBox'),
    on = opts.voice === 'eleven';
  box.hidden = !on;
  if (!on) {
    stopPreview();
    return;
  }
  const sig = VOICES.map(v => v.id).join(',');
  if (force || sig !== _vsig || !$('#elvList').children.length) {
    _vsig = sig;
    stopPreview();
    const rowH = (id, name, sub, prev) => '<div class="vrow" data-id="' + esc(id) + '"><button type="button" class="vpick" role="radio" aria-checked="false"><b>' + esc(name) + '</b><i>' + esc(sub) + '</i></button>' + (prev ? '<button type="button" class="vplay" data-src="' + esc(prev) + '" aria-label="미리듣기" title="미리듣기"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + PLAY_D + '"/></svg></button>' : '') + '</div>';
    $('#elvList').innerHTML = __nm.h(rowH('', '자동 · 기본 남성', '영상을 본 뒤 AI가 맞는 목소리로 바꿔', '') + VOICES.map(v => rowH(v.id, v.name, v.sub, v.preview)).join(''));
    $('#elvList').querySelectorAll('.vplay path').forEach(pth => {
      pth.closest('.vplay')._m = mk(pth, PLAY_D);
    });
  }
  $('#elvList').querySelectorAll('.vrow').forEach(r => {
    const sel = r.dataset.id === opts.el_voice;
    r.classList.toggle('on', sel);
    r.querySelector('.vpick').setAttribute('aria-checked', String(sel));
  });
  if (!VOICES.length) setMsg('#elvMsg', '한 번 만들면 계정 목소리 목록이 채워져.');else if ($('#elvMsg').className.indexOf('warn') < 0) setMsg('#elvMsg', '');
}
$('#elvList').addEventListener('click', e => {
  const pl = e.target.closest('.vplay');
  if (pl) {
    const id = pl.closest('.vrow').dataset.id;
    if (AUD_ID === id) {
      stopPreview();
      return;
    }
    stopPreview();
    AUD.src = __nm.u(pl.dataset.src);
    AUD_ID = id;
    pl.classList.add('on');
    if (pl._m) pl._m.to(STOP_D);
    pl.setAttribute('aria-label', '미리듣기 정지');
    const pr = AUD.play();
    if (pr && pr.catch) pr.catch(() => {
      stopPreview();
      setMsg('#elvMsg', '미리듣기 재생이 막혔어 — 한 번 더 눌러줘.', 'warn');
    });
    return;
  }
  const pk = e.target.closest('.vpick');
  if (!pk) return;
  opts.el_voice = pk.closest('.vrow').dataset.id || '';
  SAVED_VOICE = opts.el_voice;
  saveOpts();
  setMsg('#elvMsg', VOICES.length ? '' : '한 번 만들면 계정 목소리 목록이 채워져.');
  paintVoices();
  paintSums();
});
$('#opts').addEventListener('click', e => {
  const b = e.target.closest('.geni-opt');
  if (!b) return;
  const k = b.closest('[data-nmsnap]').dataset.k;
  if (!OKV[k] || !OKV[k].includes(b.dataset.v)) return;
  opts[k] = b.dataset.v;
  if (k === 'font') loadPvFont(opts.font);
  saveOpts();
  paintOpts();
});
function saveOpts() {
  try {
    window.localStorage.setItem(OKEY, JSON.stringify(opts));
  } catch (e) {}
}
function paintGauge(k) {
  const el = document.querySelector('#opts input[data-nmg][data-k="' + k + '"]');
  if (!el) return;
  const v = +opts[k],
    t = GAUGE[k].fmt(v);
  if (+el.value !== v) el.value = String(v);
  el.setAttribute('aria-valuetext', t);
  const lab = document.querySelector('#opts .rbs-val[data-for="' + k + '"]');
  if (lab) lab.textContent = t;
}
$('#opts').addEventListener('input', e => {
  const g = e.target.closest && e.target.closest('input[data-nmg][data-k]');
  if (!g || !GAUGE[g.dataset.k]) return;
  opts[g.dataset.k] = Math.max(0, Math.min(100, Math.round(+g.value)));
  paintGauge(g.dataset.k);
  paintSums();
});
$('#opts').addEventListener('change', e => {
  if (e.target.closest && e.target.closest('input[data-nmg][data-k]')) saveOpts();
});
{
  const f = $('#subFold'),
    h = f.querySelector('.vfh'),
    a = f.querySelector('.acc'),
    cv = mk(h.querySelector('.chev path'), D.chevDown);
  h.addEventListener('click', () => {
    const open = !f.classList.contains('open');
    f.classList.toggle('open', open);
    h.setAttribute('aria-expanded', String(open));
    cv.to(open ? D.chevUp : D.chevDown);
    if (open) {
      a.removeAttribute('inert');
      followOpen(f);
    } else a.setAttribute('inert', '');
  });
}
const SPEC_LBL = {
  voice: {
    eleven: '고급'
  },
  img: {
    motion: '모션',
    codex: 'GPT',
    depth: '입체',
    grok: '그록'
  }
};
function paintSpec() {
  const chip = (k, t) => '<span class="gs-v' + (opts[k] !== DEF[k] ? ' on' : '') + '">' + esc(t) + '</span>';
  $('#spec').innerHTML = __nm.h(chip('len', opts.len + '초'));
}
function ytCheck(raw) {
  const s = String(raw || '').trim();
  if (!s) return {
    ok: false,
    msg: '유튜브 주소를 붙여넣어줘.'
  };
  let u;
  try {
    u = new window.URL(/^https?:\/\//i.test(s) ? s : 'https://' + s);
  } catch (e) {
    u = null;
  }
  const BAD = '유튜브 영상 주소가 아니야 — youtube.com/watch · youtu.be · youtube.com/shorts 주소만 돼.';
  if (!u || !/^https?:$/.test(u.protocol)) return {
    ok: false,
    msg: BAD
  };
  const h = u.hostname.toLowerCase().replace(/^www\./, '');
  let id = '';
  if (h === 'youtu.be') id = decodeURIComponent(u.pathname.split('/')[1] || '');else if (h === 'youtube.com' || h === 'm.youtube.com') {
    const sh = u.pathname.match(/^\/shorts\/([^/]+)/);
    if (u.pathname === '/watch') id = u.searchParams.get('v') || '';else if (sh) id = decodeURIComponent(sh[1]);else return {
      ok: false,
      msg: '영상 하나의 주소가 필요해 — 채널·재생목록 주소는 안 돼.'
    };
  } else return {
    ok: false,
    msg: BAD
  };
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return {
    ok: false,
    msg: '영상 ID가 빠졌거나 잘렸어 — 주소를 다시 복사해 붙여넣어줘.'
  };
  return {
    ok: true,
    id: id,
    url: u.href
  };
}
function setMsg(sel, txt, kind) {
  const el = $(sel);
  el.textContent = txt || '';
  el.className = 'status' + (kind ? ' ' + kind : '');
}
function paintUrl(strict) {
  const v = $('#url').value;
  if (!v.trim()) {
    setMsg('#urlMsg', '');
    return;
  }
  const r = ytCheck(v);
  if (r.ok) setMsg('#urlMsg', '영상 ID ' + r.id + ' 확인');else if (strict) setMsg('#urlMsg', r.msg, 'err');else setMsg('#urlMsg', '');
}
function paintUrlState() {
  $('#pvDel').disabled = TYPE_ON || !$('#url').value.trim();
  paintGo();
  paintMonitor();
}
function paintGo() {
  const go = $('#go');
  if (!go) return;
  go.disabled = FIRING || TYPE_ON || !$('#url').value.trim();
}
async function pasteLink() {
  let t = '';
  try {
    if (window.navigator.clipboard && window.navigator.clipboard.readText) t = (await window.navigator.clipboard.readText()) || '';
  } catch (e) {
    t = null;
  }
  if (!t || !String(t).trim()) {
    setMsg('#urlMsg', t === null || !window.navigator.clipboard ? '클립보드를 못 읽었어 — 주소 칸을 길게 눌러 붙여넣기.' : '클립보드가 비어 있어 — 유튜브 링크를 먼저 복사해줘.', 'warn');
    return;
  }
  const r = ytCheck(t);
  if (!r.ok) {
    setMsg('#urlMsg', r.msg, 'err');
    return;
  }
  typeUrl(String(t).trim());
}
$('#mon').addEventListener('click', () => {
  if ($('#pvPick')) pasteLink();
});
let TYPE_ID = 0,
  TYPE_ON = false;
function placeCaret() {
  const inp = $('#url'),
    c = $('#urlCaret'),
    cs = window.getComputedStyle(inp);
  const ctx = placeCaret._c || (placeCaret._c = document.createElement('canvas').getContext('2d'));
  ctx.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
  const w = ctx.measureText(inp.value).width + (parseFloat(cs.letterSpacing) || 0) * inp.value.length;
  const x = Math.min(parseFloat(cs.paddingLeft) + w - inp.scrollLeft, inp.clientWidth - parseFloat(cs.paddingRight));
  c.style.transform = 'translateX(' + x.toFixed(1) + 'px)';
}
function typeUrl(txt) {
  const my = ++TYPE_ID,
    inp = $('#url'),
    caret = $('#urlCaret');
  const done = () => {
    if (my !== TYPE_ID) return;
    TYPE_ON = false;
    caret.hidden = true;
    paintUrlState();
    paintUrl(true);
  };
  inp.value = '';
  if (RM()) {
    inp.value = txt;
    done();
    return;
  }
  TYPE_ON = true;
  paintUrlState();
  caret.hidden = false;
  placeCaret();
  const n = txt.length;
  let i = 0;
  const step = () => {
    if (my !== TYPE_ID) return;
    i++;
    inp.value = txt.slice(0, i);
    inp.scrollLeft = inp.scrollWidth;
    placeCaret();
    if (i < n) window.setTimeout(step, 55);else done();
  };
  window.setTimeout(step, 55);
}
function clearLink() {
  TYPE_ID++;
  TYPE_ON = false;
  $('#urlCaret').hidden = true;
  $('#url').value = '';
  paintUrlState();
  setMsg('#urlMsg', '');
}
$('#pvDel').addEventListener('click', clearLink);
$('#pvReset').addEventListener('click', () => {
  clearLink();
  $('#ask').value = '';
  $('#askN').textContent = '';
  opts = Object.assign({}, DEF);
  opts.el_voice = '';
  SAVED_VOICE = '';
  saveOpts();
  loadPvFont(opts.font);
  paintOpts();
  setMsg('#elvMsg', '');
});
$('#url').addEventListener('input', () => {
  paintUrl(false);
  paintUrlState();
});
$('#url').addEventListener('paste', () => window.setTimeout(() => {
  paintUrlState();
  paintUrl(true);
}, 0));
$('#url').addEventListener('blur', () => paintUrl(true));
$('#url').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.isComposing) {
    e.preventDefault();
    fire();
  }
});
$('#ask').addEventListener('input', () => {
  const n = $('#ask').value.length;
  $('#askN').textContent = n ? n + '/300' : '';
});
try {
  window.attachCopyPaste($('#ask'), true);
} catch (e) {}
const MAC = {
  st: 'wait',
  busy: false,
  who: 'PC'
};
async function macPoll() {
  const h = await getJSON('ys_out/_mac/heartbeat.json');
  let st = 'off',
    busy = false;
  if (h && typeof h.ts === 'number') {
    const ts = h.ts > 1e12 ? h.ts / 1000 : h.ts;
    if (Date.now() / 1000 - ts <= 180) {
      st = h.codex === 'chatgpt' ? 'on' : 'login';
      busy = !!h.busy;
      MAC.who = 'PC';
    }
  }
  MAC.st = st;
  MAC.busy = busy;
  paintMac();
}
function paintMac() {
  const a = $('#mac'),
    st = MAC.st;
  a.dataset.st = st;
  $('#macSpin').hidden = !(st === 'on' && MAC.busy);
  paintImgNote();
}
function paintImgNote() {
  const st = MAC.st,
    w = MAC.who,
    macDown = st === 'off' || st === 'login';
  const head = st === 'on' ? MAC.busy ? w + ' 작업 중' : w + ' 켜짐' : st === 'login' ? w + ' 켜짐 · Codex 로그인 필요' : st === 'off' ? w + ' 꺼짐' : w + ' 확인 중…';
  const pic = {
    codex: 'GPT 이미지',
    depth: 'GPT 입체'
  }[opts.img];
  const tail = !macDown ? '' : pic ? pic + '는 모션 그래픽으로 만들어져' : opts.img === 'grok' ? '그록이 스토리보드 없이 바로 만들어(장면마다 화풍이 조금 흔들릴 수 있어)' : '';
  const txt = tail ? head + ' — ' + tail : head,
    t = $('#macT');
  if (t.textContent !== txt) t.textContent = txt;
  $('#mac').toggleAttribute('data-warn', !!tail);
  if ($('#optMsg').textContent !== (tail ? txt : '')) setMsg('#optMsg', tail ? txt : '', 'warn');
}
let _macT = null;
function macArm() {
  window.clearInterval(_macT);
  _macT = null;
  if (document.hidden) return;
  macPoll();
  _macT = window.setInterval(() => {
    if (!document.hidden) macPoll();
  }, 30000);
}
document.addEventListener('visibilitychange', macArm);
const JKEY = 'ys_jobs';
let JOBS = [];
function readJobs() {
  try {
    const a = JSON.parse(window.localStorage.getItem(JKEY) || '[]');
    return Array.isArray(a) ? a.filter(j => j && j.id).map(j => {
      if (!j.lbl && j.label) j.lbl = String(j.label);
      if (!j.out) j.out = 'ys_out/' + j.id + '/result.json';
      return j;
    }) : [];
  } catch (e) {
    return JOBS.slice();
  }
}
let STORE_OK = true;
function mutate(fn) {
  const a = readJobs();
  fn(a);
  JOBS = a.slice(0, 30);
  try {
    window.localStorage.setItem(JKEY, JSON.stringify(JOBS));
    STORE_OK = true;
  } catch (e) {
    STORE_OK = false;
  }
  try {
    if (window.nmRail && typeof window.nmRail.refresh === 'function') window.nmRail.refresh();
  } catch (e) {}
  return STORE_OK;
}
JOBS = readJobs();
const HJOBS = {};
const jobOf = id => JOBS.find(j => j.id === id) || HJOBS[id] || null;
const t0Of = j => +j.t0 || +j.ts || Date.now();
function resumeRuns() {
  JOBS.filter(j => j.status === 'run').forEach(j => {
    try {
      if (!(window.nmJobs && window.nmJobs.busy(JKEY, j.id))) poll(j.id);
    } catch (e) {
      poll(j.id);
    }
  });
}
window.addEventListener('storage', e => {
  if (e && e.key === JKEY) {
    JOBS = readJobs();
    renderAll();
    resumeRuns();
  }
});
const STEPS = [{
  k: 'meta',
  label: '영상 정보 확인',
  ing: '영상 정보 확인 중…'
}, {
  k: 'stt',
  label: '받아쓰기',
  ing: '받아쓰는 중…'
}, {
  k: 'plan',
  label: '인사이트 정리',
  ing: '인사이트 정리 중…'
}, {
  k: 'voice',
  label: '목소리 입히기',
  ing: '목소리 입히는 중…'
}, {
  k: 'img',
  label: '장면 그림',
  ing: '장면 그림 그리는 중…'
}, {
  k: 'vid',
  label: '장면 영상',
  ing: '장면 영상 만드는 중…'
}, {
  k: 'mgd',
  label: '모션 디자인',
  ing: 'Opus가 장면 연기 설계 중…'
}, {
  k: 'render',
  label: '영상 만들기',
  ing: '영상 만드는 중…'
}, {
  k: 'upload',
  label: '올리기',
  ing: '올리는 중…'
}];
const ST_OK = ['wait', 'run', 'done', 'skip', 'fail'];
const PROG = {};
async function getJSON(u) {
  try {
    const r = await window.fetch(u + (u.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now(), {
      cache: 'no-store'
    });
    const ct = r.headers.get('content-type') || '';
    if (!r.ok || ct.includes('text/html')) return null;
    return await r.json();
  } catch (e) {
    return null;
  }
}
const POLL_MS = 5000,
  STALL_MS = 50 * 60e3,
  LIMIT_MS = 135 * 60e3;
async function poll(id) {
  let stop = false;
  try {
    if (window.nmJobs && !window.nmJobs.hold(JKEY, id, () => {
      stop = true;
    })) return;
  } catch (e) {}
  const base = 'ys_out/' + encodeURIComponent(id) + '/';
  try {
    for (let n = 0; !stop; n++) {
      const j = jobOf(id);
      if (!j || j.status !== 'run') return;
      const p = await getJSON(base + 'progress.json');
      if (p && typeof p === 'object' && Array.isArray(p.steps)) {
        PROG[id] = p;
        learn(id, p);
        if (FOCUS === id) paintCard();
      }
      const pu = PROG[id] && +PROG[id].updated ? +PROG[id].updated > 1e12 ? +PROG[id].updated : +PROG[id].updated * 1000 : 0;
      const late = Date.now() - t0Of(j) > LIMIT_MS || Date.now() - Math.max(t0Of(j), pu) > STALL_MS;
      if (!PROG[id] && n > 0 && n % 12 === 0 && Date.now() - t0Of(j) > 60e3) {
        try {
          window.fetch('/api/ys?rescue=1', {
            cache: 'no-store'
          });
        } catch (e) {}
      }
      const ended = !!(p && (p.state === 'done' || p.state === 'fail'));
      if (n % 2 === 0 || ended || late) {
        const d = await getJSON(j.out || base + 'result.json');
        if (d && typeof d === 'object' && (d.error || d.video)) {
          land(id, d);
          return;
        }
      }
      if (p && p.state === 'fail') {
        failJob(id, failWhy(p), stepFailed(p));
        return;
      }
      if (late) {
        failJob(id, '오래 진행 소식이 없어 추적을 멈췄어 — 결과가 오면 완성작 목록에 올라오고, 끝내 안 오면 GitHub Actions 실행 기록 확인이 필요해.', 'timeout');
        return;
      }
      await sleep(POLL_MS);
    }
  } finally {
    try {
      if (window.nmJobs) window.nmJobs.free(JKEY, id);
    } catch (e) {}
  }
}
function stepFailed(p) {
  const s = (p.steps || []).find(x => x && x.st === 'fail');
  return s ? String(s.k || '') : '';
}
function failWhy(p) {
  const s = (p.steps || []).find(x => x && x.st === 'fail');
  return String(p.error || s && s.note || '진행 중 실패(사유 미기재)');
}
function compactSteps(p, failed) {
  return p && Array.isArray(p.steps) ? p.steps.map(s => ({
    k: s.k,
    st: failed && s.st === 'run' ? 'fail' : s.st,
    note: s.note || '',
    t0: +s.t0 || 0,
    t1: +s.t1 || 0,
    budget: +s.budget || 0
  })) : null;
}
function learn(id, p) {
  const t = p.title ? String(p.title).slice(0, 80) : '';
  const j = jobOf(id);
  if (!j || !t || j.title === t) return;
  mutate(a => {
    const x = a.find(y => y.id === id);
    if (x) {
      x.title = t;
      x.lbl = t;
    }
  });
}
function land(id, d) {
  if (d.error) {
    failJob(id, String(d.error), stepFailed(PROG[id] || {}));
    return;
  }
  const res = {
    title: d.title || '',
    channel: d.channel || '',
    src_url: d.src_url || '',
    dur: +d.dur || 0,
    video: d.video || '',
    poster: d.poster || '',
    infographic: d.infographic || '',
    report: d.report || '',
    scenes: +d.scenes || 0,
    voice: d.voice || '',
    img: d.img || '',
    img_used: +d.img_used || 0,
    vid_used: +d.vid_used || 0,
    depth_used: +d.depth_used || 0,
    mg_used: +d.mg_used || 0,
    design_used: +d.design_used || 0,
    ratio: d.ratio === '16:9' || d.ratio === '9:16' ? d.ratio : '',
    voice_name: d.voice_name ? String(d.voice_name).slice(0, 60) : '',
    voice_why: d.voice_why ? String(d.voice_why).slice(0, 160) : '',
    tr_src: d.tr_src || '',
    notes: Array.isArray(d.notes) ? d.notes.slice(0, 12).map(String) : [],
    generated: d.generated || ''
  };
  mutate(a => {
    const x = a.find(y => y.id === id);
    if (!x) return;
    x.status = 'done';
    x.t1 = Date.now();
    x.res = res;
    if (res.title) {
      x.title = res.title.slice(0, 80);
      x.lbl = x.title;
    }
    const p = PROG[id];
    if (p) {
      x.steps = compactSteps(p);
      x.pct = 100;
      x.el = elapsedOf(x, p);
      x.btot = +p.budget_total || 0;
    }
  });
  try {
    if (window.nmRail && res.video) window.nmRail.add({
      url: res.video,
      poster: res.poster,
      cap: '유튜브',
      dlname: 'short.mp4'
    });
  } catch (e) {}
  settleFocus(id);
  renderAll();
  window.setTimeout(loadHist, 4000);
}
function failJob(id, why, step) {
  mutate(a => {
    const x = a.find(y => y.id === id);
    if (!x) return;
    x.status = 'err';
    x.t1 = Date.now();
    x.error = String(why || '실패');
    x.errStep = step === 'timeout' ? '' : step || '';
    x.errKind = step === 'timeout' ? 'timeout' : '';
    const p = PROG[id];
    if (p) {
      x.steps = compactSteps(p, true);
      x.pct = pctOf(x, p);
      x.el = elapsedOf(x, p);
      x.btot = +p.budget_total || 0;
    }
  });
  settleFocus(id);
  renderAll();
}
function nextAct(j) {
  if (j.errKind === 'timeout') return 'GitHub Actions의 ys-make 실행 기록을 확인하고, 멈춰 있으면 다시 생성해줘.';
  if (j.errStep === 'stt') return '자막이 있는 영상으로 해보거나, 음성 설정의 받아쓰기를 「유튜브 자막 우선」으로 바꿔 다시 생성해줘.';
  return '위 사유대로 조치한 뒤 다시 생성해줘. 같은 사유가 반복되면 GitHub Actions의 ys-make 실행 기록을 확인해.';
}
let FOCUS = null,
  SHOWURL = null;
function pickFocus() {
  if (FOCUS && jobOf(FOCUS)) return FOCUS;
  const run = JOBS.find(j => j.status === 'run');
  FOCUS = (run || JOBS[0] || {}).id || null;
  return FOCUS;
}
function settleFocus(id) {
  const f = FOCUS && jobOf(FOCUS);
  if (!f || f.id === id || f.status !== 'run') {
    FOCUS = id;
    SHOWURL = null;
  }
}
const EMPTY_MON = $('#mon').innerHTML;
const DL_ICON = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + D.down + '"/></svg>';
let _monSrc = '';
function dlHref(u, name) {
  return /\/\/pub-[0-9a-fA-F]+\.r2\.dev\//.test(u) ? 'api/dl?u=' + encodeURIComponent(u) + '&n=' + encodeURIComponent(name) : u;
}
function paintMonitor() {
  const mon = $('#mon');
  const j = FOCUS && jobOf(FOCUS);
  const url = SHOWURL || j && j.status === 'done' && j.res && j.res.video || '';
  const poster = !SHOWURL && j && j.res && j.res.poster || '';
  const yt = !url && !TYPE_ON ? ytCheck($('#url').value) : {
    ok: false
  };
  const key = url || (yt.ok ? 'yt:' + yt.id : '');
  if (key === _monSrc) return;
  _monSrc = key;
  if (!url && yt.ok) {
    mon.innerHTML = __nm.h('<div class="ytpv"><div class="cpv-stage"><img alt="" decoding="async" src="https://i.ytimg.com/vi/' + encodeURIComponent(yt.id) + '/hqdefault.jpg"></div></div>');
    mon.querySelector('img').onerror = () => {
      _monSrc = '';
      mon.innerHTML = __nm.h(EMPTY_MON);
    };
    return;
  }
  if (!url) {
    mon.innerHTML = __nm.h(EMPTY_MON);
    return;
  }
  mon.innerHTML = __nm.h('<video src="' + esc(url) + '"' + (poster ? ' poster="' + esc(poster) + '"' : '') + ' playsinline loop preload="metadata"></video>' + '<button type="button" class="monplay" aria-label="재생 — 탭=재생/일시정지"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></button>' + '<a class="imgdl dlbtn" href="' + esc(dlHref(url, 'short.mp4')) + '" download="short.mp4" aria-label="숏폼 내려받기" title="숏폼 내려받기">' + DL_ICON + '</a>' + '<div class="monseek" role="slider" tabindex="0" aria-label="진행 위치 — 탭·드래그=이동" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>');
  const v = mon.querySelector('video'),
    pb = mon.querySelector('.monplay'),
    sk = mon.querySelector('.monseek'),
    fill = sk.querySelector('i');
  v.onclick = () => {
    if (v.paused) v.play();else v.pause();
  };
  v.onplay = () => {
    pb.hidden = true;
  };
  v.onpause = () => {
    pb.hidden = false;
  };
  v.ontimeupdate = () => {
    if (v.duration) {
      const p = v.currentTime / v.duration * 100;
      fill.style.width = p + '%';
      sk.setAttribute('aria-valuenow', String(Math.round(p)));
    }
  };
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
    if (!v.duration) return;
    if (ev.key === 'ArrowRight') {
      ev.preventDefault();
      seek(v.currentTime / v.duration + .05);
    } else if (ev.key === 'ArrowLeft') {
      ev.preventDefault();
      seek(v.currentTime / v.duration - .05);
    }
  };
}
let CARD = null,
  _tick = null;
const jobDur = s => s < 60 ? s + 's' : Math.floor(s / 60) + 'm ' + s % 60 + 's';
function normSteps(j, p) {
  const src = p && Array.isArray(p.steps) ? p.steps : Array.isArray(j.steps) ? j.steps : [];
  const by = {};
  src.forEach(s => {
    if (s && s.k) by[s.k] = s;
  });
  const mode = (j.opts && j.opts.img || DEF.img) === 'none' ? 'motion' : j.opts && j.opts.img || DEF.img;
  const off = k => k === 'img' && mode === 'motion' || k === 'vid' && mode !== 'grok' || k === 'mgd' && mode !== 'motion';
  return STEPS.map(d => {
    const s = by[d.k] || {};
    let st = ST_OK.includes(s.st) ? s.st : 'wait';
    if (j.status === 'err' && st === 'run') st = 'fail';
    if (!by[d.k] && off(d.k)) st = 'skip';
    if (j.status === 'done' && !by[d.k]) st = off(d.k) ? 'skip' : 'done';
    return {
      k: d.k,
      label: s.label || d.label,
      ing: d.ing,
      st: st,
      note: s.note ? String(s.note) : '',
      t0: +s.t0 || 0,
      t1: +s.t1 || 0,
      budget: +s.budget || 0
    };
  });
}
function cardState(j, p) {
  if (j.status === 'err' || p && p.state === 'fail') return 'fail';
  if (j.status === 'done' || p && p.state === 'done') return 'done';
  return p ? 'run' : 'queue';
}
function pctOf(j, p, steps) {
  if (j.status === 'done' || p && p.state === 'done') return 100;
  if (p && typeof p.pct === 'number' && isFinite(p.pct)) return Math.max(0, Math.min(100, Math.round(p.pct)));
  if (!p && typeof j.pct === 'number') return j.pct;
  const ss = steps || normSteps(j, p),
    eff = ss.filter(s => s.st !== 'skip');
  if (!eff.length) return 0;
  const got = eff.reduce((n, s) => n + (s.st === 'done' ? 1 : s.st === 'run' ? .5 : 0), 0);
  return Math.round(got / eff.length * 100);
}
function elapsedOf(j, p) {
  const t0 = p && +p.t0 ? +p.t0 * 1000 : t0Of(j);
  const end = j.status === 'run' && !(p && p.state !== 'run') ? Date.now() : p && +p.updated ? +p.updated * 1000 : +j.t1 || Date.now();
  return Math.max(0, Math.round((end - t0) / 1000));
}
function buildCard(j) {
  const host = $('#prog');
  host.innerHTML = __nm.h('<section class="tk" id="tk" data-st="queue">' + '<button type="button" class="tk-h" id="tkH" aria-expanded="true" aria-controls="tkB"><svg class="tk-chev" viewBox="0 0 24 24" aria-hidden="true"><path/></svg>' + '<span class="tk-orbit" id="tkSpin" aria-hidden="true"></span><span class="tk-t"><span id="tkT"></span></span>' + '<span class="tk-pill" id="tkEl"></span><span class="tk-n" id="tkN"></span><span class="tk-pill" id="tkEnd" hidden></span></button>' + '<div class="tk-body" id="tkB"><div class="tk-g"><div class="tk-bar"><i class="tk-fill" id="tkFill"></i></div>' + '<div class="tk-gl"><span>전체 진행률</span><b class="tk-pct" id="tkPct">0%</b></div></div>' + '<ol class="tk-rows">' + STEPS.map(d => '<li class="tk-row" data-k="' + d.k + '" data-st="wait"><span class="tk-ic" aria-hidden="true">' + '<svg class="tk-dash" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg><span class="tk-orbit"></span>' + '<svg class="tk-mk" viewBox="0 0 24 24"><path/></svg></span><span class="tk-l">' + esc(d.label) + '</span><span class="tk-note"></span><span class="tk-tm"></span></li>').join('') + '</ol></div></section>');
  const card = {
    id: j.id,
    el: host.querySelector('.tk'),
    rows: {},
    pct: -1,
    shown: 0,
    raf: 0,
    fold: j.status !== 'run',
    chev: mk(host.querySelector('.tk-chev path'), D.chevDown)
  };
  host.querySelectorAll('.tk-row').forEach(r => {
    card.rows[r.dataset.k] = {
      el: r,
      st: '',
      m: mk(r.querySelector('.tk-mk path'), D.dot)
    };
  });
  host.querySelector('#tkH').addEventListener('click', () => {
    card.fold = !card.fold;
    paintFold(card);
  });
  CARD = card;
  paintFold(card);
}
function paintFold(c) {
  c.el.classList.toggle('fold', c.fold);
  c.el.querySelector('#tkH').setAttribute('aria-expanded', String(!c.fold));
  c.chev.to(c.fold ? D.chevUp : D.chevDown);
}
function countTo(c, v) {
  const el = $('#tkPct');
  if (!el) return;
  window.cancelAnimationFrame(c.raf);
  if (RM() || c.shown === v) {
    c.shown = v;
    el.textContent = v + '%';
    return;
  }
  const a = c.shown,
    t0 = window.performance.now(),
    dur = 600;
  const step = t => {
    const k = Math.min(1, (t - t0) / dur),
      e = 1 - Math.pow(1 - k, 3);
    c.shown = Math.round(a + (v - a) * e);
    el.textContent = c.shown + '%';
    if (k < 1) c.raf = window.requestAnimationFrame(step);
  };
  c.raf = window.requestAnimationFrame(step);
}
function paintCard() {
  const host = $('#prog'),
    j = FOCUS && jobOf(FOCUS);
  if (!j || j.status === 'done' && !j.steps && !PROG[j.id]) {
    host.hidden = true;
    host.innerHTML = __nm.h('');
    CARD = null;
    paintTkMsg(j);
    armTick();
    return;
  }
  host.hidden = false;
  if (!CARD || CARD.id !== j.id || !CARD.el.isConnected) buildCard(j);
  const c = CARD,
    p = PROG[j.id] || null,
    steps = normSteps(j, p),
    st = cardState(j, p);
  c.el.dataset.st = st;
  const eff = steps.filter(s => s.st !== 'skip'),
    nd = eff.filter(s => s.st === 'done').length;
  const cur = steps.find(s => s.st === 'run');
  const tt = $('#tkT');
  const live = st === 'run' || st === 'queue';
  tt.textContent = st === 'queue' ? '러너 대기 중…' : st === 'run' ? cur ? cur.ing : '진행 중…' : '진행 상황';
  tt.className = live ? 'nm-shim' : '';
  $('#tkSpin').hidden = !live;
  $('#tkN').textContent = nd + '/' + eff.length;
  $('#tkN').hidden = st === 'done';
  const end = $('#tkEnd');
  end.hidden = !(st === 'done' || st === 'fail');
  end.textContent = st === 'done' ? '완료' : st === 'fail' ? '실패' : '';
  end.className = 'tk-pill' + (st === 'done' ? ' ok' : st === 'fail' ? ' bad' : '');
  steps.forEach(s => {
    const r = c.rows[s.k];
    if (!r) return;
    const prev = r.st;
    if (prev !== s.st) {
      r.el.dataset.st = s.st;
      const lab = r.el.querySelector('.tk-l');
      lab.className = 'tk-l' + (s.st === 'run' ? ' nm-shim' : '');
      const target = s.st === 'done' ? D.check : s.st === 'fail' ? D.x : D.dot;
      if (!prev) r.m.set(target);else r.m.to(target);
      r.st = s.st;
    }
    r.el.querySelector('.tk-l').textContent = s.label;
    r.el.querySelector('.tk-note').textContent = s.note;
  });
  paintTimes(j, p, steps);
  const pct = st === 'fail' ? typeof j.pct === 'number' && !p ? j.pct : pctOf(j, p, steps) : pctOf(j, p, steps);
  if (pct !== c.pct) {
    c.pct = pct;
    $('#tkFill').style.transform = 'scaleX(' + pct / 100 + ')';
    countTo(c, pct);
  }
  paintTkMsg(j);
  armTick();
}
const kdur = s => {
  s = Math.max(0, Math.round(s));
  if (s < 60) return s + '초';
  if (s < 3600) {
    const m = Math.floor(s / 60),
      r = s % 60;
    return m + '분' + (r ? ' ' + r + '초' : '');
  }
  const h = Math.floor(s / 3600),
    m = Math.floor(s % 3600 / 60);
  return h + '시간' + (m ? ' ' + m + '분' : '');
};
const sec = t => {
  t = +t || 0;
  return t > 1e12 ? t / 1000 : t;
};
function paintTimes(j, p, steps) {
  const c = CARD;
  if (!c) return;
  const now = Date.now() / 1000;
  const tot = j.status !== 'run' && typeof j.el === 'number' && !p ? j.el : elapsedOf(j, p);
  const bt = p && +p.budget_total || +j.btot || 0;
  const pill = $('#tkEl');
  if (pill) pill.innerHTML = __nm.h('<b' + (bt && tot > bt ? ' class="over"' : '') + '>총 ' + kdur(tot) + '</b>' + (bt ? '<i> / 예산 ' + kdur(bt) + '</i>' : ''));
  steps.forEach(s => {
    const r = c.rows[s.k];
    if (!r) return;
    const tm = r.el.querySelector('.tk-tm');
    if (!tm) return;
    const b = s.budget,
      bud = b ? '예상 ' + kdur(b) : '';
    let el = null;
    if (s.st === 'run' && s.t0) el = now - sec(s.t0);else if ((s.st === 'done' || s.st === 'fail') && s.t0 && s.t1) el = sec(s.t1) - sec(s.t0);
    const over = el != null && b && el > b;
    tm.classList.toggle('over', !!over);
    tm.innerHTML = __nm.h(s.st === 'skip' ? '<i>건너뜀</i>' : el != null ? '<b>' + kdur(el) + '</b>' + (bud ? '<i> / ' + bud + '</i>' : '') : bud ? '<i>' + bud + '</i>' : '');
  });
}
function paintTkMsg(j) {
  if (!j) {
    setMsg('#tkMsg', '');
    return;
  }
  const p = PROG[j.id];
  if (j.status === 'err') setMsg('#tkMsg', '실패 — ' + (j.error || '사유 미기재') + '\n다음: ' + nextAct(j), 'err');else if (j.status === 'run' && p && p.state === 'done') setMsg('#tkMsg', '제작 완료 — 결과 파일이 올라오는 중이야(배포 반영 대기).');else setMsg('#tkMsg', '');
}
function armTick() {
  const j = FOCUS && jobOf(FOCUS);
  const need = !!(j && j.status === 'run' && CARD && !document.hidden);
  if (need && !_tick) _tick = window.setInterval(() => {
    const x = FOCUS && jobOf(FOCUS);
    if (!x || x.status !== 'run' || document.hidden) {
      window.clearInterval(_tick);
      _tick = null;
      return;
    }
    const p = PROG[x.id] || null;
    paintTimes(x, p, normSteps(x, p));
  }, 1000);else if (!need && _tick) {
    window.clearInterval(_tick);
    _tick = null;
  }
}
document.addEventListener('visibilitychange', armTick);
let _resFor = '',
  REPORT = {
    id: '',
    text: ''
  };
function loadScript(src) {
  return new Promise((ok, no) => {
    if (document.querySelector('script[data-lz="' + src + '"]')) {
      ok();
      return;
    }
    const s = document.createElement('script');
    s.src = __nm.u(src);
    s.dataset.lz = src;
    s.onload = () => ok();
    s.onerror = () => no(new Error(src));
    document.head.appendChild(s);
  });
}
async function mdLib() {
  if (window.marked && window.DOMPurify) return true;
  try {
    await loadScript('marked.min.js');
    await loadScript('purify.min.js');
  } catch (e) {
    return false;
  }
  return !!(window.marked && window.DOMPurify);
}
async function fetchText(u) {
  try {
    const r = await window.fetch(u, {
      cache: 'no-store'
    });
    const ct = r.headers.get('content-type') || '';
    if (!r.ok || ct.includes('text/html')) return null;
    return await r.text();
  } catch (e) {
    return null;
  }
}
function row(lab, meta, url, name, openLbl) {
  return '<div class="job done"><span class="jlab">' + esc(lab) + '</span><span class="jvar">' + esc(meta) + '</span>' + '<span class="jst"><a class="jopen" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(openLbl || '열기') + '</a>' + '<button type="button" class="dlbtn jdl" data-u="' + esc(url) + '" data-n="' + esc(name) + '" aria-label="' + esc(lab) + ' 내려받기" title="' + esc(lab) + ' 내려받기"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + D.down + '"/></svg></button></span></div>';
}
const fmtDur = s => s ? Math.floor(s / 60) + ':' + String(Math.round(s % 60)).padStart(2, '0') : '';
async function paintRes() {
  const box = $('#res'),
    j = FOCUS && jobOf(FOCUS);
  if (!j || j.status !== 'done' || !j.res) {
    box.hidden = true;
    _resFor = '';
    return;
  }
  box.hidden = false;
  if (_resFor === j.id) return;
  _resFor = j.id;
  const r = j.res;
  $('#resMeta').textContent = [r.channel, fmtDur(r.dur)].filter(Boolean).join(' · ');
  $('#resT').textContent = r.title || j.title || '';
  $('#resVoice').textContent = r.voice_name ? '목소리: ' + r.voice_name + (r.voice_why ? ' · ' + r.voice_why : '') : '';
  const mgPart = r.mg_used ? ' · 모션 그래픽 ' + r.mg_used : '';
  const imgNote = r.img === 'grok' ? '그록 영상 ' + (r.vid_used || 0) + '/' + (r.scenes || '?') + '장면' + (r.img_used ? ' · 그림 대체 ' + r.img_used : '') + mgPart : r.img === 'depth' ? (r.depth_used ? 'GPT 입체 ' + r.depth_used : 'GPT 입체 0') + (r.img_used > r.depth_used ? ' · 정지 그림 대체 ' + (r.img_used - r.depth_used) : '') + mgPart : r.img === 'codex' ? (r.img_used ? 'GPT 이미지 ' + r.img_used : 'GPT 이미지 0') + mgPart : r.img === 'motion' || r.img === 'none' ? '모션 그래픽' + (r.design_used ? ' · Opus 설계 ' + r.design_used + '장면' : ' · 기본 도식') : '';
  const ratio = r.ratio || j.opts && j.opts.ratio || '9:16';
  $('#resRows').innerHTML = __nm.h((r.video ? row('숏폼', [ratio, imgNote].filter(Boolean).join(' · '), r.video, 'short.mp4') : '') + (r.infographic ? row('인포그래픽', 'PNG', r.infographic, 'infographic.png') : '') + (r.report ? row('리포트', 'Markdown', r.report, 'report.md', '원문') : ''));
  $('#resRows').querySelectorAll('.jdl').forEach(b => {
    b._m = mk(b.querySelector('path'), D.down);
  });
  const im = $('#resImg');
  im.hidden = !r.infographic;
  im.innerHTML = __nm.h(r.infographic ? '<img src="' + esc(r.infographic) + '" alt="인포그래픽" loading="lazy">' : '');
  $('#resNotes').innerHTML = __nm.h((r.notes || []).map(n => '<li>' + esc(n) + '</li>').join(''));
  const rep = $('#rep');
  rep.innerHTML = __nm.h('');
  REPORT = {
    id: j.id,
    text: ''
  };
  if (!r.report) return;
  rep.textContent = '리포트 불러오는 중…';
  const txt = (await fetchText('ys_out/' + encodeURIComponent(j.id) + '/report.md?t=' + Date.now())) || (await fetchText(r.report));
  if (_resFor !== j.id) return;
  if (txt == null) {
    rep.innerHTML = __nm.h('');
    rep.textContent = '리포트 본문을 못 불러왔어(파일 서버 교차출처 차단 또는 만료) — 위 「리포트 원문」으로 열어줘.';
    return;
  }
  REPORT = {
    id: j.id,
    text: txt
  };
  if (await mdLib()) {
    let html = '';
    try {
      html = window.DOMPurify.sanitize(window.marked.parse(txt, {
        gfm: true,
        breaks: false
      }), {
        FORBID_TAGS: ['img', 'picture', 'source', 'video', 'audio', 'iframe']
      });
    } catch (e) {
      html = '';
    }
    if (_resFor !== j.id) return;
    if (html) {
      rep.innerHTML = __nm.h(html);
      rep.querySelectorAll('a[href]').forEach(a => {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      });
      rep.querySelectorAll('table').forEach(t => {
        const w = document.createElement('div');
        w.className = 'tbl';
        t.parentNode.insertBefore(w, t);
        w.appendChild(t);
      });
      return;
    }
  }
  rep.innerHTML = __nm.h('<pre></pre>');
  rep.querySelector('pre').textContent = txt;
}
async function dlCheck(b) {
  const u = b.dataset.u,
    n = b.dataset.n,
    m = b._m;
  let ok = false;
  if (/\.md(\?|$)/i.test(n) || /\.md(\?|$)/i.test(u)) {
    const j = FOCUS && jobOf(FOCUS);
    const txt = REPORT.id === (j && j.id) && REPORT.text ? REPORT.text : j && (await fetchText('ys_out/' + encodeURIComponent(j.id) + '/report.md?t=' + Date.now())) || (await fetchText(u));
    if (txt != null) {
      const a = document.createElement('a');
      a.href = __nm.u(window.URL.createObjectURL(new window.Blob([txt], {
        type: 'text/markdown'
      })));
      a.download = n;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(a.href), 4000);
      ok = true;
    }
  } else {
    const href = dlHref(u, n);
    const a = document.createElement('a');
    a.href = __nm.u(href);
    a.download = n;
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (href === u) ok = true;else {
      try {
        const r = await window.fetch(href, {
          method: 'HEAD',
          cache: 'no-store'
        });
        ok = r.ok;
      } catch (e) {
        ok = false;
      }
    }
  }
  if (m) m.to(ok ? D.check : D.x);
  if (ok) b.classList.add('dl-done');else setMsg('#tkMsg', '내려받기 실패 — 파일이 만료됐거나 서버가 못 가져왔어. 「열기」로 직접 열어 저장해줘.', 'err');
  window.setTimeout(() => {
    if (m) m.to(D.down);
  }, 1200);
}
$('#resRows').addEventListener('click', e => {
  const b = e.target.closest('.jdl');
  if (b) {
    e.preventDefault();
    dlCheck(b);
  }
});
const X_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6 18 18M18 6 6 18"/></svg>';
function paintErrs() {
  const box = $('#errs'),
    a = JOBS.filter(j => j.status === 'err' && j.id !== FOCUS).slice(0, 6);
  box.hidden = !a.length;
  box.innerHTML = __nm.h(a.map(j => '<div class="job err" role="button" tabindex="0" data-jid="' + esc(j.id) + '" title="탭 = 이 작업 실패 사유 보기"><span class="jlab">' + esc(j.title || '유튜브') + '</span><span class="jst">실패</span>' + '<button type="button" class="jdel" aria-label="목록에서 지우기" title="목록에서 지우기">' + X_SVG + '</button><span class="jvar">' + esc(j.error || '') + '</span></div>').join(''));
}
$('#errs').addEventListener('click', e => {
  const rw = e.target.closest('.job');
  if (!rw) return;
  const id = rw.dataset.jid;
  if (e.target.closest('.jdel')) {
    mutate(a => {
      const i = a.findIndex(x => x.id === id);
      if (i >= 0) a.splice(i, 1);
    });
    try {
      if (window.nmJobs && window.nmJobs.gone) window.nmJobs.gone(id);
    } catch (e2) {}
    renderAll();
    return;
  }
  FOCUS = id;
  SHOWURL = null;
  renderAll();
  scrollToCard();
});
$('#errs').addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('job')) {
    e.preventDefault();
    FOCUS = e.target.dataset.jid;
    SHOWURL = null;
    renderAll();
    scrollToCard();
  }
});
function scrollToCard() {
  const el = $('#prog:not([hidden])') || $('#tkMsg');
  if (el) {
    try {
      el.scrollIntoView({
        behavior: RM() ? 'auto' : 'smooth',
        block: 'center'
      });
    } catch (e) {}
  }
}
let HIST = [],
  _hsig = '';
const tsMs = t => typeof t === 'number' ? t > 1e12 ? t : t * 1000 : Date.parse(t || '') || 0;
function histTime(ts) {
  const d = new Date(ts);
  let h = d.getHours();
  const m = d.getMinutes(),
    ap = h < 12 ? 'AM' : 'PM';
  h = h % 12 || 12;
  const now = new Date(),
    dd = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000);
  return (dd === 0 ? '오늘 ' : dd === 1 ? '어제 ' : d.getMonth() + 1 + '/' + d.getDate() + ' ') + h + ':' + String(m).padStart(2, '0') + ' ' + ap;
}
const httpsOk = u => /^https?:\/\//i.test(String(u || ''));
async function loadHist() {
  const d = await getJSON('ys_out/_hist.json');
  const a = d && Array.isArray(d.items) ? d.items : [];
  HIST = a.filter(it => it && it.id && httpsOk(it.video)).slice(0, 60).map(it => ({
    id: String(it.id),
    ts: tsMs(it.ts),
    title: String(it.title || ''),
    short: String(it.short_title || it.title || ''),
    channel: String(it.channel || ''),
    poster: httpsOk(it.poster) ? String(it.poster) : '',
    video: String(it.video),
    infographic: httpsOk(it.infographic) ? String(it.infographic) : '',
    report: httpsOk(it.report) ? String(it.report) : '',
    dur: +it.dur || 0,
    ratio: it.ratio === '16:9' ? '16:9' : '9:16'
  }));
  paintHist();
}
function paintHist() {
  const seen = {},
    items = [];
  HIST.forEach(it => {
    if (!seen[it.id]) {
      seen[it.id] = 1;
      items.push(it);
    }
  });
  JOBS.filter(j => j.status === 'done' && j.res && j.res.video && !seen[j.id]).forEach(j => {
    seen[j.id] = 1;
    const r = j.res;
    items.push({
      id: j.id,
      ts: +j.t1 || t0Of(j),
      title: r.title || j.title || '',
      short: r.title || j.title || '',
      channel: r.channel,
      poster: r.poster,
      video: r.video,
      infographic: r.infographic,
      report: r.report,
      dur: r.dur,
      ratio: r.ratio || j.opts && j.opts.ratio || '9:16',
      local: 1
    });
  });
  items.sort((x, y) => (y.ts || 0) - (x.ts || 0));
  HIST.forEach(it => {
    const lj = JOBS.find(j => j.id === it.id);
    if (lj && lj.status !== 'done') mutate(a => {
      const x = a.find(y => y.id === it.id);
      if (x) {
        x.status = 'done';
        x.t1 = it.ts || Date.now();
        x.error = '';
        x.res = {
          title: it.title,
          channel: it.channel,
          dur: it.dur,
          video: it.video,
          poster: it.poster,
          infographic: it.infographic,
          report: it.report,
          ratio: it.ratio,
          notes: []
        };
      }
    });
  });
  HIST.forEach(it => {
    if (!JOBS.some(j => j.id === it.id)) HJOBS[it.id] = {
      id: it.id,
      status: 'done',
      title: it.title,
      t1: it.ts,
      _hist: 1,
      res: {
        title: it.title,
        channel: it.channel,
        dur: it.dur,
        video: it.video,
        poster: it.poster,
        infographic: it.infographic,
        report: it.report,
        ratio: it.ratio,
        notes: []
      }
    };
  });
  const sig = items.map(it => it.id + (it.poster ? 1 : 0)).join(',');
  $('#histSec').hidden = !items.length;
  $('#histN').textContent = items.length ? items.length + '편 · 전 기기 공유' : '';
  if (sig === _hsig) return;
  _hsig = sig;
  $('#ysHist').innerHTML = __nm.h(items.slice(0, 60).map(it => '<div class="hist-it"><div class="hist-hd">' + esc(it.ts ? histTime(it.ts) : '') + '</div>' + '<div class="hist-thumb hist-go' + (it.ratio === '16:9' ? ' r169' : '') + '" role="button" tabindex="0" data-hid="' + esc(it.id) + '" title="탭 = 이 결과 열기">' + (it.poster ? '<img src="' + esc(it.poster) + '" alt="" loading="lazy">' : '<video src="' + esc(it.video) + '" muted playsinline preload="metadata"></video>') + (it.dur ? '<span class="hist-cap">' + esc(fmtDur(it.dur)) + '</span>' : '') + '</div>' + '<div class="ysh-t">' + esc(it.short || it.title) + '</div></div>').join(''));
}
function openHist(id) {
  if (!jobOf(id)) return;
  FOCUS = id;
  SHOWURL = null;
  _resFor = '';
  renderAll();
  const r = $('#res');
  if (r && !r.hidden) {
    try {
      r.scrollIntoView({
        behavior: RM() ? 'auto' : 'smooth',
        block: 'start'
      });
    } catch (e) {}
  }
}
$('#ysHist').addEventListener('click', e => {
  const t = e.target.closest('[data-hid]');
  if (t) openHist(t.dataset.hid);
});
$('#ysHist').addEventListener('keydown', e => {
  const t = e.target.closest('[data-hid]');
  if (t && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    openHist(t.dataset.hid);
  }
});
function renderAll() {
  JOBS = readJobs();
  pickFocus();
  paintSpec();
  paintMonitor();
  paintCard();
  paintRes();
  paintErrs();
  paintHist();
}
window.nmJobOpen = function (id) {
  const j = jobOf(id) || readJobs().find(x => x.id === id);
  if (!j) return false;
  FOCUS = id;
  SHOWURL = null;
  try {
    if (j.status === 'run' && window.nmJobs && !window.nmJobs.busy(JKEY, id)) poll(id);
  } catch (e) {}
  renderAll();
  scrollToCard();
  const c = $('#tk');
  if (c) {
    c.classList.add('thfocus');
    window.setTimeout(() => c.classList.remove('thfocus'), 2200);
  }
  return true;
};
window.nmJobShow = function (url) {
  const j = JOBS.find(x => x.res && x.res.video === url);
  if (j) {
    FOCUS = j.id;
    SHOWURL = null;
  } else SHOWURL = url;
  renderAll();
};
window.nmRefresh = () => {
  renderAll();
  resumeRuns();
  loadVoices();
  loadHist();
};
let FIRING = false;
window.nmSyncBusy = () => FIRING;
let GO_M = null,
  GO_T = 0;
function goFlash(ok) {
  const g = $('#go');
  if (!GO_M) GO_M = mk($('#goP'), D.dot);
  window.clearTimeout(GO_T);
  GO_M.set(D.dot);
  GO_M.to(ok ? D.check : D.x);
  g.classList.toggle('ok', ok);
  g.classList.toggle('bad', !ok);
  GO_T = window.setTimeout(() => {
    g.classList.remove('ok', 'bad');
    GO_M.set(D.dot);
  }, ok ? 1200 : 1600);
}
function shake() {
  const g = $('#go');
  g.classList.remove('shake');
  void g.offsetWidth;
  g.classList.add('shake');
  window.setTimeout(() => g.classList.remove('shake'), 460);
}
async function fire() {
  const go = $('#go');
  if (FIRING) return;
  const v = ytCheck($('#url').value);
  if (!v.ok) {
    shake();
    goFlash(false);
    setMsg('#urlMsg', v.msg, 'err');
    return;
  }
  const ask = $('#ask').value.trim().slice(0, 300);
  const o = {
    voice: opts.voice,
    stt: opts.stt,
    img: opts.img,
    len: opts.len,
    font: opts.font,
    el_voice: opts.voice === 'eleven' && VID_RE.test(opts.el_voice || '') ? opts.el_voice : '',
    ratio: opts.ratio,
    subbg: opts.subbg,
    subop: Math.max(0, Math.min(100, Math.round(+opts.subop))),
    cap: Math.max(0, Math.min(100, Math.round(+opts.cap))),
    grid: opts.grid
  };
  const body = {
    url: v.url,
    ask: ask,
    opts: o
  };
  FIRING = true;
  go.disabled = true;
  setMsg('#urlMsg', '접수 중…');
  let res = null,
    j = null;
  try {
    try {
      res = await window.fetch('/api/ys', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(body)
      });
    } catch (e) {
      setMsg('#urlMsg', '연결 실패 — 네트워크를 확인하고 다시 눌러줘.', 'err');
      goFlash(false);
      return;
    }
    try {
      j = await res.json();
    } catch (e) {
      j = null;
    }
    if (!res.ok || !j || !j.ok || !j.id) {
      const why = j && j.error || '서버 응답 ' + res.status;
      setMsg('#urlMsg', (res.status >= 400 && res.status < 500 ? '접수 거절 — ' : '서버 오류 — ') + why + (res.status >= 500 ? '\n잠시 뒤 다시 눌러줘.' : ''), 'err');
      goFlash(false);
      return;
    }
    const id = String(j.id);
    const saved = mutate(a => {
      a.unshift({
        id: id,
        out: j.out || 'ys_out/' + id + '/result.json',
        status: 'run',
        t0: Date.now(),
        lbl: '유튜브 · ' + v.id,
        src: v.url,
        vid: v.id,
        opts: Object.assign({}, o)
      });
    });
    FOCUS = id;
    SHOWURL = null;
    goFlash(true);
    if (j.via === 'r2-queue') setMsg('#urlMsg', '깃허브 발사가 지연돼 대기열에 넣었어 — 이 화면이 열려 있으면 1분마다 자동으로 다시 발사해.', 'warn');else setMsg('#urlMsg', saved ? '접수됨 — 진행 상황은 아래 카드에 나와.' : '접수됨 — 다만 이 기기 저장소가 막혀 새로고침하면 진행 추적이 끊겨.', saved ? 'ok' : 'warn');
    renderAll();
    poll(id);
    scrollToCard();
  } finally {
    FIRING = false;
    paintGo();
  }
}
$('#go').addEventListener('click', fire);
paintOpts();
paintMac();
macArm();
loadVoices();
paintUrlState();
loadHist();
renderAll();
morphReady.then(() => {
  if (!GO_M) GO_M = mk($('#goP'), D.dot);
});
try {
  const u0 = (new window.URLSearchParams(window.location.search).get('u') || '').trim();
  if (u0) window.setTimeout(() => typeUrl(u0), 400);
} catch (_) {}
readJobs().filter(j => j && j.status === 'run' && j.id).forEach(j => poll(j.id));
readJobs().filter(j => j && j.status === 'err' && j.errKind === 'timeout' && Date.now() - t0Of(j) < 24 * 3600e3).forEach(async j => {
  const d = await getJSON(j.out || 'ys_out/' + encodeURIComponent(j.id) + '/result.json');
  if (d && typeof d === 'object' && (d.video || d.error)) land(j.id, d);
});
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
  const td = document.querySelector('.dock'),
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
export const PAGE = {
  path: "/ys.html",
  fonts: FONTS,
  css: [SHEETS["tokens.css"],
    SHEETS["nm-shared.css"],
    SHEETS["nm-clip.css"],
    SHEETS["nm-input.css"],
    SHEETS["nm-cards.css"],
    SHEETS["nm-job.css"],
    SHEETS["nm-hist.css"],
    `.nd-root { --well:#0e0f11; --bg:#121212; --pan:#16171a; --line:#2a2c31; --hist-accent:#FFE13D; --hist-rgb:255,225,61; --fg:#eef7f0; --mut:#8fa697; --accent:#00EED2; --accent-rgb:0,238,210;
    --accent-4:#FFE13D; --accent-4-rgb:255,225,61;
    --accent-5:#0FFD02; --accent-5-rgb:15,253,2; --info:var(--accent-5); --info-rgb:var(--accent-5-rgb);
    --danger:#e23b2a; --danger-rgb:226,59,42; --warn:#FFE13D; --warn-rgb:255,225,61; --accent-dim:rgba(var(--accent-rgb),.13); --on-accent:#032322; --line2:rgba(255,255,255,.06);
    --modal-glass-anchor:rgba(17,18,20,.42); --modal-head-bg:rgba(24,25,28,.85); --modal-tabs-bg:rgba(24,25,28,.5); }   
  @media (prefers-reduced-motion:reduce){ .nd-root{ --press-pico:1; --press-xs:1; --press-s:1; --press-m:1; --press-l:1; } }
  * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  [hidden] { display:none !important; }  nd-html .cscroll { display:none !important; }
  nd-html { scrollbar-width:none; -ms-overflow-style:none; scrollbar-color:rgba(255,255,255,.05) transparent; }  * { scrollbar-width:none; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.05); border-radius:var(--r-pill); border:1px solid var(--bg); background-clip:padding-box; }
  nd-body { margin:0; background:radial-gradient(125% 70% at 50% -8%, rgba(var(--accent-rgb),.06), transparent 55%) fixed, var(--bg); color:var(--fg); font:15px/1.6 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; letter-spacing:-.2px ; -webkit-font-smoothing:antialiased; }
  label { display:block; font-size:var(--fs-label); color:var(--fg); margin:14px 0 var(--sp-1); }   
  label.fl { font-weight:var(--fw-x); color:var(--fg); }   
  label.fl::before { content:'• '; color:var(--accent); font-weight:var(--fw-b); }
  nd-html.inmodal, nd-html.inmodal nd-body { background:transparent; }   
  .go { display:grid; place-items:center ; width:100%; margin-top:0; padding:var(--sp-1); background:rgba(255,255,255,.02); color:var(--accent); border:1px solid var(--line); border-radius:var(--r-m); font-weight:800; font-size:var(--fs-label); font-family:inherit; line-height:1; cursor:pointer; position:relative; overflow:hidden; -webkit-tap-highlight-color:transparent; -webkit-user-select:none; user-select:none; transition:transform var(--dur-fast) ease, background var(--dur) ease, border-color var(--dur) ease; }
  .go:disabled { opacity:.5; cursor:default; transform:none; }
  .go.shake { animation:ysshake .42s; }
  @keyframes ysshake { 10%,90%{transform:translateX(-1px)} 30%,70%{transform:translateX(2px)} 50%{transform:translateX(-2px)} }   
  @media (prefers-reduced-motion:reduce) { .go.shake { animation:none; } }
  .go .goic { visibility:hidden ; width:12px; height:12px; fill:none; stroke:currentColor; stroke-width:2.2; stroke-linecap:round; stroke-linejoin:round; }   
  .go.ok .goic { stroke:var(--accent); }
  .go.bad { color:var(--danger); }
  .go > .goic, .go > .gol { grid-area:1 / 1; }
  .go:is(.ok, .bad) .goic { visibility:visible; }
  .go:is(.ok, .bad) .gol { opacity:0; }   
  :where(.dock) .go { border-color:rgba(255,255,255,.2); }   
  .trailwrap > .trail-fire { margin:0; }
  .trailwrap > .trail-fire .go, .trailwrap > .trail-fire.go { margin:0; }
  .dock #go, .dock .go { border-radius:var(--r-s); min-height:30px ; backdrop-filter:blur(var(--blur-s)); -webkit-backdrop-filter:blur(var(--blur-s)); }
  .cref-lbl { font-size:var(--fs-label); font-weight:var(--fw-x); color:var(--fg); }
  .geni-row { display:flex; align-items:baseline; justify-content:space-between; gap:var(--sp-2); padding:8px 0; }   
  .pub-l { font-size:var(--fs-label); font-weight:var(--fw-b); color:var(--fg); white-space:nowrap; }
  .geni-opts { display:flex; flex-wrap:wrap; gap:3px 4px; justify-content:flex-end; min-width:0; }   
  .geni-opt { background:none; border:none; padding:6px 7px; font-family:inherit; font-size:var(--fs-label); font-weight:var(--fw-b); color:var(--mut); cursor:pointer; white-space:nowrap; transition:color var(--dur); -webkit-tap-highlight-color:transparent; }   
  .geni-opt:active { transform:scale(var(--press-m)); }
  .geni-opt.on { color:var(--accent); font-weight:var(--fw-x); }
  .snaprow { align-items:center; }
  .snaprow .pub-l { flex:0 0 60px; }   
  #opts .nm-snap { flex:1 1 0; max-width:calc(var(--n,4) * 150px); margin-right:auto; }   
  @container nd (max-width:520px) { .snaprow[data-wide] { flex-wrap:wrap; row-gap:var(--sp-1); } .snaprow[data-wide] .pub-l { flex-basis:100%; } .snaprow[data-wide] .nm-snap { flex-basis:100%; max-width:none; } }   
  .scard { margin-top:var(--sp-2); border:1px solid rgba(255,255,255,.06); border-radius:var(--r-s); background:rgba(255,255,255,.015); }   
  .scard .hd { display:flex; align-items:center; gap:9px; width:100%; margin:0; padding:8px 13px; background:none; border:0; color:var(--fg); font-family:inherit; text-align:left; cursor:pointer; user-select:none; -webkit-tap-highlight-color:transparent; }   
  .scard .nm { font-weight:var(--fw-b); font-size:var(--fs-label); flex:none; padding-block:6px ; line-height:normal; }
  .scard .sum { color:var(--mut); font-size:var(--fs-xs); margin-left:auto; text-align:right; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; opacity:.4; }   
  .scard .chev { width:14px; height:14px; flex:none; fill:none; stroke:var(--mut); stroke-width:2.2; stroke-linecap:round; stroke-linejoin:round; }   
  .scard .prm { padding:2px 13px 12px; border-top:1px solid rgba(255,255,255,.06); }   
  .scard + .scard { margin-top:var(--sp-1); }
  .scard .acc { display:grid; grid-template-rows:0fr; transition:grid-template-rows .45s cubic-bezier(.16,1,.3,1); }   
  .scard.open > .acc, .vfold.open > .acc { grid-template-rows:1fr; }
  .scard .acc-in { min-height:0; overflow:hidden; visibility:hidden; transition:visibility 0s linear .45s; }   
  .scard.open > .acc > .acc-in, .vfold.open > .acc > .acc-in { visibility:visible; transition-delay:0s; }   
  @media (prefers-reduced-motion:reduce) { .scard .acc, .scard .acc-in { transition:none; } }
  .status { margin-top:var(--sp-1); font-size:var(--fs-xs); color:var(--mut); white-space:pre-wrap; line-height:var(--lh-base); }
  .status:empty { display:none; }
  .status.err { color:var(--danger); }
  .status.warn { color:var(--warn); }
  .ysec:has(#scrCard.open) #optMsg { display:none; }   
  .status.ok { color:var(--fg); }`,
    `nd-html{scrollbar-width:thin}nd-html::-webkit-scrollbar,nd-body::-webkit-scrollbar{width:10px;height:10px;display:block}`,
    `nd-html, nd-body { height:100%; }
  nd-body { overflow:hidden; }
  .ws { position:fixed; inset:0; display:flex; flex-direction:column; }
  .dock { flex:none; position:sticky; top:0; z-index:6; margin-top:0; background:rgba(18,18,18,1) ; border-bottom:1px solid rgba(var(--accent-rgb),.35); --line:rgba(255,255,255,.15) ; padding:var(--sp-2) 16px 0; }
  .dock::after { content:none; }
  .mon { position:relative; width:var(--pvw); margin-inline:auto; height:auto; aspect-ratio:1/1; contain:size; min-height:0; border:1px solid transparent; border-radius:var(--r-s); background:#121212 ; container-type:size; display:grid; place-items:center; overflow:hidden; }
  .monwrap { position:relative; }
  .mon video { width:100%; height:auto; display:block; -webkit-tap-highlight-color:transparent; }
  .mon .monplay { position:absolute; inset:0; margin:auto; width:var(--btn); height:var(--btn); display:grid; place-items:center; padding:0; border-radius:50%;
    border:1px solid rgba(255,255,255,.17); background:rgba(26,28,26,.3); color:var(--fg); box-shadow:inset 0 1px 0 rgba(255,255,255,.2);
    -webkit-backdrop-filter:blur(var(--blur-m)) saturate(1.3); backdrop-filter:blur(var(--blur-m)) saturate(1.3); pointer-events:none; }   
  .mon .monplay svg { width:16px; height:16px; transform:translateX(1px); }
  .mon .monplay[hidden] { display:none; }
  .mon .monseek { position:absolute; left:0; right:0; bottom:0; height:3px; background:rgba(255,255,255,.15); cursor:pointer; touch-action:none; -webkit-tap-highlight-color:transparent; }   
  .mon .monseek::before { content:''; position:absolute; left:0; right:0; top:-9px; bottom:-3px; }
  .mon .monseek i { position:absolute; left:0; top:0; bottom:0; width:0%; background:var(--accent); pointer-events:none; }
  .mon:has(video) { aspect-ratio:auto; contain:layout; container-type:normal; height:auto; }
  .mon .imgdl { z-index:3; }
  .cpv-empty { position:absolute; inset:0; display:grid; place-items:center; background-color:inherit; }
  .cpv-empty .cpv-stage { width:min(100%, calc(100cqh * 16 / 9)); aspect-ratio:16/9; background-color:inherit; display:grid; place-items:center; }
  .cpv-photobtn { display:grid; place-items:center; width:var(--btn); height:var(--btn); padding:0; background:none; border:0; cursor:pointer; color:var(--accent); -webkit-tap-highlight-color:transparent; }   
  .cpv-photobtn svg { width:26px; height:26px; display:block; transition:transform var(--dur-fast) cubic-bezier(.2,.9,.3,1.25); }   
  .cpv-photobtn:active svg { transform:scale(var(--press-xs,.8)); }
  .mon:has(#pvPick) { cursor:pointer; }   
  .ytpv { position:absolute; inset:0; display:grid; place-items:center; background-color:inherit; }
  .ytpv .cpv-stage { width:min(100%, calc(100cqh * 16 / 9)); aspect-ratio:16/9; overflow:hidden; border-radius:var(--r-s); }
  .ytpv img { width:100%; height:100%; object-fit:cover; display:block; }
  .monwrap .trail .cpv-tool { position:static; width:100%; height:22px; display:grid; place-items:center; padding:0; color:var(--accent); background:none; border:0; border-radius:0; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:transform var(--dur-fast); }   
  .monwrap .trail .cpv-tool svg { width:12px; height:12px; display:block; }   
  .monwrap .trail .cpv-tool[hidden] { display:none; }
  .monwrap .trail .cpv-tool:active { transform:scale(var(--press-xs,.82)); }
  .monwrap .trail .cpv-tool:disabled { opacity:.5; cursor:default; }   
  .monwrap .trail .cpv-tool:disabled:active { transform:none; }
  nd-html.nm-menuopen .cpv-empty { opacity:0; }
  .monwrap { --pvw:min(52%, 29cqh, 300px); margin:0 0 var(--sp-2); }
  .dock.dockzoom .monwrap { --pvw:min(100%, 58cqh, 620px); }
  .monwrap .trailwrap { position:absolute; top:0; left:calc(50% + var(--pvw, 52%) / 2); margin-left:8px; z-index:2; display:flex; flex-direction:column; align-items:stretch; width:var(--trailw, 70px); gap:8px; }
  .dock.dockzoom .monwrap .trailwrap { margin-left:0; transform:translateX(-100%); }
  .monwrap .trail-v, .monwrap .trail-v .gospec { align-items:center; }
  .monwrap #cpZoomRail { align-self:stretch; align-items:center; }
  #cpZoom.on .cpz-v { display:none; }
  .monwrap .trail { display:flex; flex-direction:column; flex-wrap:nowrap; gap:var(--sp-1); padding:5px 2px ; border-radius:var(--r-s);
    border:1px solid rgba(255,255,255,.14); background:rgba(8,15,11,.54) ;
    backdrop-filter:blur(var(--blur-s)); -webkit-backdrop-filter:blur(var(--blur-s)); }
  .monwrap .trail-g { display:flex; flex-direction:column; flex-wrap:nowrap; gap:2px ; flex:none; align-self:stretch; }
  .monwrap .trail-div { width:14px; height:1px; margin:1px 0; flex:none; background:rgba(255,255,255,.16); }   
  .monwrap .trail-div { align-self:center; }   
  .monwrap .trail-g:not(:has(button:not([hidden]))) { display:none; }
  .monwrap .trail-g:not(:has(button:not([hidden]))) + .trail-div { display:none; }
  .monwrap .trail:not(:has(button:not([hidden]))):not(:has(.trail-v:not(.none))) { display:none; }
  .monwrap .trail-v { display:flex; flex-direction:column; gap:var(--sp-1); align-self:stretch; margin:0; padding:0; background:transparent; border:1px solid transparent; border-radius:0; font-size:10.5px ; line-height:1; text-align:center; }
  .monwrap .trail-v.none { display:none; }
  .monwrap .trail-v .gs-lbl, .monwrap .trail-v .gs-dot { display:none; }
  .monwrap .trail-v .gs-sep { display:block; width:14px; height:1px; margin:1px auto; flex:none; background:rgba(255,255,255,.16); font-size:0; line-height:0; color:transparent; }   
  .monwrap .trail-v .gospec { display:flex; flex-direction:column; gap:var(--sp-1); margin:0; padding:0; font-size:10.5px; line-height:1; text-align:center; white-space:nowrap; overflow:visible; }   
  .monwrap .trail-v .gs-v { position:relative ; display:grid; place-items:center; min-width:22px; height:22px; padding:0 5px; border:0; background:none; border-radius:var(--r-l); color:var(--mut); font-size:10.5px; font-weight:var(--fw-x); font-family:inherit; letter-spacing:-.2px; line-height:1; white-space:nowrap; -webkit-tap-highlight-color:transparent; transition:color var(--dur) ease; }   
  .monwrap .trail-v .gs-v, .monwrap .trail-v .ropt { place-items:center; text-align:center; }
  .monwrap .trail-v .gs-v.on { color:var(--accent); font-weight:var(--fw-x); }
  .monwrap .trail-i { position:relative; display:grid; place-items:center; width:22px; height:22px; padding:0; border:0; background:none; border-radius:50%; color:var(--mut); font-size:10.5px ; font-weight:var(--fw-x); font-family:inherit; cursor:pointer; -webkit-tap-highlight-color:transparent; }
  .monwrap .trail-i::after { content:''; position:absolute; inset:-6px -4px; }   
  .monwrap #cpZoomRail .trail-i::after { left:calc((22px - var(--trailw, 70px)) / 2 + 1px); right:calc((22px - var(--trailw, 70px)) / 2 + 1px); }   
  .monwrap .trail-i:active { transform:scale(var(--press-m)); }
  .monwrap .trail svg { width:12px; height:12px; display:block; }   
  .monwrap #cpRail:not(:has(.trail-g > button:not([hidden]))):not(:has(.trail-v:not(.none))) { display:none; }
  .monwrap .trail-v .gs-v:active { transform:scale(var(--press-m)); }
  .src { flex:1 1 auto; min-height:0; overflow:auto; padding:16px; }   
  @container nd (max-height:480px) {
    nd-body { overflow:visible; }
    .ws { position:static; display:block; }
    .dock { position:relative; }
    .src { overflow:visible; } }
  .phead { display:flex; align-items:center; gap:6px ; font-size:var(--fs-label); color:var(--fg); font-weight:var(--fw-x); line-height:var(--lh-base); }
  .phead::before { content:'•'; color:var(--accent); font-weight:var(--fw-b); }
  .phead .sp { margin-left:auto; color:var(--mut); font-weight:400; font-size:var(--fs-xs); font-variant-numeric:tabular-nums; }
  .ysec { margin-top:var(--sp-4); }
  .src .iowrap { margin-top:var(--sp-2); }
  .urlwrap { position:relative; margin-top:var(--sp-2); }
  .ycaret { position:absolute; top:50%; left:0; width:2px; height:1.1em; margin-top:-.55em; background:var(--accent); pointer-events:none; animation:ysBlink 1s steps(1) infinite; }   
  @keyframes ysBlink { 50% { opacity:0; } }
  @media (prefers-reduced-motion:reduce) { .ycaret { animation:none; } }
  .go { transition:transform .5s cubic-bezier(.34,1.56,.64,1), background var(--dur) ease, border-color var(--dur) ease; }   
  .go:active { transform:scale(var(--press-m)); transition:transform .08s ease-out; }   
  .vplay, .vpick, .job .jdl, .job .jdel { transition:transform .5s cubic-bezier(.34,1.56,.64,1), color var(--dur), background var(--dur), border-color var(--dur); }   
  .vplay:active, .vpick:active, .job .jdl:active, .job .jdel:active { transform:scale(var(--press-m)); transition:transform .08s ease-out; }   
  .scard .chev, .tk-chev { transition:transform .5s cubic-bezier(.34,1.56,.64,1); }   
  .scard .hd:active .chev, .tk-h:active .tk-chev { transform:scale(var(--press-m)); transition:transform .08s ease-out; }   
  .opts { margin-top:var(--sp-1); }
  .opts .geni-row + .geni-row { border-top:1px solid var(--line2); }
  .macrow { display:flex; justify-content:flex-end; margin:-4px 0 var(--sp-1); }   
  .ysmac { position:relative; display:inline-flex; align-items:center; gap:var(--sp-1); font-size:var(--fs-xs); font-weight:var(--fw-b); color:var(--mut); text-decoration:none; line-height:var(--lh-base); transition:color var(--dur) ease; }
  .ysmac::before { content:''; position:absolute; inset:-8px -4px; }   
  .ysmac-dot { width:8px; height:8px; flex:none; border-radius:50%; background:var(--mut); opacity:.35; box-shadow:0 0 0 0 rgba(var(--accent-rgb),0); transition:opacity var(--dur) ease, box-shadow var(--dur) ease, background-color var(--dur) ease; }   
  .ysmac[data-st="on"] { color:var(--fg); }
  .ysmac[data-st="on"] .ysmac-dot { background:var(--accent); opacity:1; box-shadow:0 0 8px rgba(var(--accent-rgb),.55); }   
  .ysmac[data-st="login"] { color:var(--warn); }
  .ysmac[data-warn] { color:var(--warn); }   
  .ysmac[data-st="login"] .ysmac-dot { background:var(--warn); opacity:1; box-shadow:0 0 6px rgba(var(--warn-rgb),.4); }   
  .vfold .vfh { display:flex; align-items:center; gap:9px; width:100%; margin:0; padding:8px 0; background:none; border:0; color:var(--fg); font-family:inherit; text-align:left; cursor:pointer; user-select:none; -webkit-tap-highlight-color:transparent; }   
  .vfold .vfh .pub-l { flex:0 0 60px; }   
  .vfold .vfh .sum { color:var(--mut); font-size:var(--fs-xs); margin-left:auto; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .vfold .vfh .chev { width:14px; height:14px; flex:none; fill:none; stroke:var(--mut); stroke-width:2.2; stroke-linecap:round; stroke-linejoin:round; }   
  .vfold .vfh:active .chev { transform:scale(var(--press-m)); transition:transform .08s ease-out; }   
  .rbrow { align-items:center; }
  .rbrow .pub-l { flex:0 0 60px; }   
  .rbrow .nm-rbs { margin-right:var(--sp-1); }
  .rbs-val { flex:0 0 44px; text-align:right; font-size:var(--fs-xs); font-weight:var(--fw-x); color:var(--accent); font-variant-numeric:tabular-nums; }   
  .vlist { display:flex; flex-direction:column; gap:var(--sp-1); max-height:calc(var(--btn) * 5); overflow:auto; margin:0 0 var(--sp-1); overscroll-behavior:contain; }
  .vrow { flex:none; display:flex; align-items:stretch; border-radius:var(--r-m); background:rgba(8,15,11,.34); border:1px solid var(--line); transition:border-color var(--dur), background var(--dur); }   
  .vrow.on { border-color:rgba(var(--accent-rgb),.5); background:rgba(var(--accent-rgb),.06); }
  .vpick { flex:1 1 auto; min-width:0; display:flex; align-items:baseline; gap:8px; padding:8px 11px; margin:0; background:none; border:0; color:var(--fg); font-family:inherit; font-size:var(--fs-xs); line-height:var(--lh-base); text-align:left; cursor:pointer; -webkit-tap-highlight-color:transparent; }   
  .vpick b { flex:none; font-size:var(--fs-label); font-weight:var(--fw-b); white-space:nowrap; }
  .vpick i { font-style:normal; min-width:0; color:var(--mut); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .vrow.on .vpick b { color:var(--accent); }
  .vplay { flex:none; width:var(--btn); display:grid; place-items:center; padding:0; margin:0; background:none; border:0; border-left:1px solid var(--line); color:var(--mut); cursor:pointer; -webkit-tap-highlight-color:transparent; }
  .vplay svg { width:12px; height:12px; display:block; fill:none; stroke:currentColor; stroke-width:2.2; stroke-linecap:round; stroke-linejoin:round; }   
  .vplay.on { color:var(--accent); }
  .vpick:active, .vplay:active { transform:scale(var(--press-l,.95)); }
  .ysmac .tk-orbit { width:10px; height:10px; border-width:1.5px; }   
  @media (prefers-reduced-motion:reduce) { .ysmac, .ysmac-dot { transition:none; } }
  .tk { position:relative; margin-top:var(--sp-4); border:1px solid var(--line); border-radius:var(--r-l); overflow:hidden; isolation:isolate;
    background:radial-gradient(120% 150% at 100% 100%, rgba(var(--accent-rgb),.16), rgba(var(--accent-rgb),0) 58%), var(--pan); }   
  .tk-h { display:flex; align-items:center; gap:var(--sp-1); width:100%; padding:var(--sp-2) var(--sp-2) var(--sp-1); margin:0; background:none; border:0; color:var(--fg); font-family:inherit; font-size:var(--fs-label); font-weight:var(--fw-b); line-height:var(--lh-base); text-align:left; cursor:pointer; -webkit-tap-highlight-color:transparent; }
  .tk-chev { width:14px; height:14px; flex:none; fill:none; stroke:var(--mut); stroke-width:2.2; stroke-linecap:round; stroke-linejoin:round; }   
  .tk-t { flex:1 1 auto; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .tk-pill { flex:none; display:inline-flex; align-items:center; padding:0 var(--sp-1); border-radius:var(--r-pill); border:1px solid var(--line); background:rgba(255,255,255,.05); color:var(--fg); font-size:var(--fs-xs); font-weight:var(--fw-b); line-height:var(--lh-base); font-variant-numeric:tabular-nums; white-space:nowrap; }   
  .tk-n { flex:none; color:var(--fg); font-size:var(--fs-label); font-weight:var(--fw-b); font-variant-numeric:tabular-nums; }
  .tk-pill.ok { color:var(--info); border-color:rgba(var(--info-rgb),.35); background:rgba(var(--info-rgb),.12); }   
  .tk-pill.bad { color:var(--danger); border-color:rgba(var(--danger-rgb),.4); background:rgba(var(--danger-rgb),.12); }
  .tk-orbit { display:inline-block; flex:none; width:16px; height:16px; border-radius:50%; border:2px solid var(--line); border-top-color:var(--accent); border-right-color:var(--accent); animation:ysOrbit .8s linear infinite; }   
  .tk-h .tk-orbit { width:18px; height:18px; }
  @keyframes ysOrbit { to { transform:rotate(1turn); } }
  @media (prefers-reduced-motion:reduce) { .tk-orbit { animation:none; } }   
  .tk-body { padding:0 var(--sp-2) var(--sp-2); }
  .tk.fold .tk-body { display:none; }
  .tk-bar { position:relative; height:4px; border-radius:var(--r-pill); background:var(--well); overflow:hidden; }   
  .tk-fill { position:absolute; inset:0; border-radius:inherit; background:linear-gradient(90deg, var(--accent), var(--info)); transform-origin:left center; transform:scaleX(0); transition:transform .9s cubic-bezier(.34,1.56,.64,1); }   
  .tk[data-st="done"] .tk-fill { background:var(--info); }
  .tk[data-st="fail"] .tk-fill { background:var(--danger); }
  @media (prefers-reduced-motion:reduce) { .tk-fill { transition:none; } }
  .tk-gl { display:flex; justify-content:space-between; align-items:baseline; margin-top:var(--sp-1); font-size:var(--fs-xs); color:var(--mut); letter-spacing:.08em; }   
  .tk-pct { color:var(--accent); font-weight:var(--fw-x); font-variant-numeric:tabular-nums; letter-spacing:0; }
  .tk[data-st="done"] .tk-pct { color:var(--info); }
  .tk[data-st="fail"] .tk-pct { color:var(--danger); }
  .tk-rows { list-style:none; margin:var(--sp-2) 0 0; padding:0; display:flex; flex-direction:column; gap:0; }
  .tk-row { display:flex; align-items:center; gap:10px; min-height:28px; font-size:var(--fs-label); color:var(--fg); animation:ysRowIn var(--dur-acc) ease both; transition:opacity var(--dur) ease; }   
  @keyframes ysRowIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:none; } }
  @media (prefers-reduced-motion:reduce) { .tk-row { animation:none; transition:none; } }
  .tk-ic { position:relative; width:20px; height:20px; flex:none; display:grid; place-items:center; }
  .tk-ic > * { grid-area:1 / 1; transition:opacity var(--dur) ease; }
  .tk-dash { width:16px; height:16px; fill:none; stroke:var(--mut); stroke-width:1.6; stroke-dasharray:2 3; opacity:.8; }   
  .tk-mk { width:16px; height:16px; fill:none; stroke:var(--accent); stroke-width:2.6; stroke-linecap:round; stroke-linejoin:round; opacity:0; }   
  .tk-row .tk-orbit { opacity:0; }
  .tk-row[data-st="wait"] .tk-dash, .tk-row[data-st="skip"] .tk-dash { opacity:.8; }
  .tk-row:not([data-st="wait"]):not([data-st="skip"]) .tk-dash { opacity:0; }
  .tk-row[data-st="run"] .tk-orbit { opacity:1; }
  .tk-row[data-st="done"] .tk-mk, .tk-row[data-st="fail"] .tk-mk { opacity:1; }
  .tk-row[data-st="fail"] .tk-mk { stroke:var(--danger); }
  .tk-l { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .tk-row[data-st="wait"] .tk-l { color:var(--mut); }
  .tk-row[data-st="done"] { opacity:.5; }
  .tk-row[data-st="done"] .tk-l { color:var(--mut); text-decoration:line-through; }
  .tk-row[data-st="skip"] { opacity:.5; }
  .tk-row[data-st="skip"] .tk-l { color:var(--mut); }
  .tk-row[data-st="fail"] .tk-l { color:var(--danger); }
  .tk-note { flex:0 1 auto; min-width:0; max-width:40%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding:0 var(--sp-1); border-radius:var(--r-pill); border:1px solid var(--line); background:rgba(255,255,255,.04); color:var(--mut); font-size:var(--fs-xs); line-height:var(--lh-base); }   
  .tk-note:empty { display:none; }
  .tk-tm { flex:none; margin-left:auto; padding-left:var(--sp-1); font-size:var(--fs-xs); color:var(--fg); font-variant-numeric:tabular-nums; white-space:nowrap; }
  .tk-tm i { font-style:normal; color:var(--mut); opacity:.7; }
  .tk-tm.over b, .tk-pill .over { color:var(--warn); }   
  .tk-pill i { font-style:normal; color:var(--mut); font-weight:400; }
  .tk-row[data-st="fail"] .tk-note { color:var(--danger); border-color:rgba(var(--danger-rgb),.4); background:rgba(var(--danger-rgb),.08); }
  .ystitle { margin:var(--sp-1) 0 0; font-size:var(--fs-h2); font-weight:var(--fw-x); color:var(--fg); line-height:1.45; word-break:keep-all; }   
  .job .jopen { flex:none; color:var(--accent); font-weight:var(--fw-b); text-decoration:none; }
  .job .jopen:active { transform:scale(var(--press-l,.95)); }
  .job .jdl { flex:none; position:relative; display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; padding:0; border-radius:8px; border:1px solid transparent; cursor:pointer; text-decoration:none; }   
  .job .jdl svg { width:14px; height:14px; display:block; fill:none; stroke:currentColor; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
  .job .jdl:active { transform:scale(var(--press-s,.85)); }
  .job .jst { margin-left:auto; color:var(--mut); white-space:nowrap; display:inline-flex; align-items:center; gap:5px; }   
  .job.err { border-color:rgba(var(--danger-rgb),.4); } .job.err .jst { color:var(--danger); }
  .job.err .jvar { flex-basis:100%; color:var(--danger); white-space:normal; }
  .job[role="button"] { cursor:pointer; }
  .job[role="button"]:active { transform:scale(var(--press-l,.95)); }
  .job .jdel { flex:none; display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; padding:0; color:rgba(255,255,255,.6); cursor:pointer; background:rgba(255,255,255,.05); border:1px solid var(--line); border-radius:8px; }   
  .job .jdel:active { transform:scale(var(--press-s,.85)); }
  .job .jdel svg { display:block; width:14px; height:14px; }
  .ysimg { margin:var(--sp-2) 0 0; }
  .ysimg img { width:100%; border:1px solid var(--line); border-radius:10px; display:block; }   
  .md { margin-top:var(--sp-2); font-size:var(--fs-label); color:var(--mut); line-height:var(--lh-base); word-break:keep-all; overflow-wrap:anywhere; }
  .md h1 { font-size:var(--fs-h1); color:var(--fg); margin:var(--sp-3) 0 var(--sp-1); line-height:1.4; }
  .md h2 { font-size:var(--fs-h2); color:var(--accent); margin:var(--sp-3) 0 var(--sp-1); }
  .md h3, .md h4 { font-size:var(--fs-h3); color:var(--fg); margin:var(--sp-2) 0 var(--sp-1); }
  .md p { margin:var(--sp-1) 0; }
  .md strong, .md b { color:var(--fg); }
  .md a { color:var(--accent); }
  .md ul, .md ol { margin:var(--sp-1) 0; padding-left:1.3em; }
  .md li { margin:0; }
  .md li::marker { color:var(--accent); }
  .md blockquote { margin:var(--sp-1) 0; padding-left:var(--sp-2); border-left:2px solid var(--line); }
  .md hr { border:0; border-top:1px solid var(--line2); margin:var(--sp-2) 0; }
  .md code { font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace; background:var(--well); border:1px solid var(--line); border-radius:4px; padding:0 4px; color:var(--fg); }   
  .md pre { margin:var(--sp-1) 0; padding:var(--sp-2); background:var(--well); border:1px solid var(--line); border-radius:10px; overflow:auto; white-space:pre-wrap; }   
  .md pre code { border:0; padding:0; background:none; }
  .md .tbl { overflow-x:auto; margin:var(--sp-2) 0; }
  .md table { border-collapse:collapse; width:100%; font-size:var(--fs-sm); }
  .md th, .md td { border:1px solid var(--line); padding:var(--sp-1) 8px; text-align:left; vertical-align:top; color:var(--fg); }   
  .md th { background:rgba(255,255,255,.04); font-weight:var(--fw-b); }
  .md img { max-width:100%; border-radius:var(--r-s); }
  #ysHist .hist-thumb img, #ysHist .hist-thumb video { aspect-ratio:9/16; }   
  #ysHist .hist-thumb.r169 img, #ysHist .hist-thumb.r169 video { aspect-ratio:16/9; }
  .ysh-t { margin:var(--sp-1) 2px 0; font-size:var(--fs-xs); font-weight:var(--fw-b); color:var(--fg); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; word-break:keep-all; }   
  .ysnotes { margin:var(--sp-1) 0 0; padding-left:1.2em; font-size:var(--fs-xs); color:var(--warn); }   
  .ysnotes:empty { display:none; }`,
    SHEETS["nm-scene-tokens.css"],
    SHEETS["nm-scene.css"]],
  scheme: "dark",
  htmlAttrs: {"lang":"ko"},
  bodyAttrs: {},
  html: `<div class="ws">
  <div class="dock">
    <div class="monwrap"><div class="mon" id="mon" data-deleg="paste-link"><div class="cpv-empty"><div class="cpv-stage"><button type="button" class="cpv-photobtn" id="pvPick" aria-label="유튜브 링크 붙여넣기" title="유튜브 링크 붙여넣기 — 복사한 링크가 아래 주소 칸에 입력돼"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button></div></div></div><div class="trailwrap" id="cpRailWrap"><nav class="trail" id="cpZoomRail" aria-label="미리보기 확대"><button type="button" class="trail-i" id="cpZoom" aria-pressed="false" aria-label="미리보기 확대" title="탭=미리보기 확대 · 다시 탭=원상복귀"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/><path d="M8 11h6"/><path class="cpz-v" d="M11 8v6"/></svg></button></nav><nav class="trail trail-opts" id="cpRail" aria-label="미리보기 옵션"><span class="trail-g"><button type="button" class="cpv-tool" id="pvReset" aria-label="전체 초기화" title="전체 초기화 — 링크·옵션·관점을 처음으로"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></button><button type="button" class="cpv-tool" id="pvDel" disabled aria-label="링크 삭제" title="링크 삭제"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button></span><span class="trail-div"></span><div class="gospec trail-v" id="spec" aria-live="polite"></div></nav><button class="go trail-fire" id="go" type="button"><svg class="goic" viewBox="0 0 24 24" aria-hidden="true"><path id="goP" d="M11 12h2"/></svg><span class="gol">생성</span></button></div></div>
  </div>
  <div class="src" id="src">
    <div class="phead">유튜브 주소</div>
    <div class="urlwrap" id="urlBox"><input type="url" id="url" class="nmin" placeholder="https://…" inputmode="url" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" name="nomute-yt-url" enterkeyhint="go" data-1p-ignore data-lpignore="true" data-form-type="other" aria-label="유튜브 주소"><i class="ycaret" id="urlCaret" hidden aria-hidden="true"></i></div>
    <div class="status" id="urlMsg" aria-live="polite"></div>
    <div class="ysec">
      <div class="phead">옵션</div>
      <div class="opts" id="opts"></div>
      <div class="status" id="optMsg" aria-live="polite"></div>
    </div>
    <div class="ysec">
      <div class="phead">관점·초점<span class="sp" id="askN"></span></div>
      <div class="askbox"><textarea id="ask" class="nmin" rows="3" maxlength="300" placeholder="선택 · 이 관점으로 봐줘 한 줄" aria-label="관점·초점 요청"></textarea></div>
    </div>
    <div id="prog" hidden></div>
    <div class="status" id="tkMsg" aria-live="polite"></div>
    <div class="ysec" id="res" hidden>
      <div class="phead">인사이트 리포트<span class="sp" id="resMeta"></span></div>
      <div class="ystitle" id="resT"></div>
      <div class="status" id="resVoice"></div>
      <ul class="ysnotes" id="resNotes"></ul>
      <div class="jobs" id="resRows"></div>
      <div class="ysimg" id="resImg" hidden></div>
      <div class="md" id="rep"></div>
    </div>
    <div class="jobs" id="errs" hidden></div>
    <div class="ysec" id="histSec" hidden>
      <div class="phead">완성작<span class="sp" id="histN"></span></div>
      <div class="hist-grid" id="ysHist" style="margin-top:var(--sp-2)"></div>
    </div>
    <div id="ysRail"></div>
  </div>
</div>
<script type="text/nm-off" data-nm-i="3" src="/nm-svg.js"></script><script type="text/nm-off" data-nm-i="4" src="/nm-ua.js"></script>
<script type="text/nm-off" data-nm-i="5" src="/nm-loader.js"></script>
<script type="text/nm-off" data-nm-i="6" src="/nm-gauge.js"></script>
<script type="text/nm-off" data-nm-i="7" src="/nm-snap.js"></script>
<script type="text/nm-off" data-nm-i="8" src="/nm-clip.js"></script>
<script type="text/nm-off" data-nm-i="9" src="/nm-rail.js" data-scope="cap" data-dlname="short.mp4" data-anchor="#ysRail" data-jobkey="ys_jobs"></script>
<script type="text/nm-off" data-nm-i="10" src="/nm-jobs.js"></script>
<script type="text/nm-off" data-nm-i="11"></script>
<script type="text/nm-off" data-nm-i="12" src="/cscroll.js"></script>
<script type="text/nm-off" data-nm-i="13" src="/nm-sync.js"></script>`,
  headTags: `<script type="text/nm-off" data-nm-i="0"></script><script type="text/nm-off" data-nm-i="1" src="/nm-wave.js"></script><script type="text/nm-off" data-nm-i="2" src="/nm-scene.js"></script>`,
  scripts: [{ run: inline1 },
    { src: "nm-wave.js", defer: true, run: LIB["nm-wave.js"] },
    { src: "nm-scene.js", defer: true, run: LIB["nm-scene.js"] },
    { src: "nm-svg.js", run: LIB["nm-svg.js"] },
    { src: "nm-ua.js", defer: true, run: LIB["nm-ua.js"] },
    { src: "nm-loader.js", run: LIB["nm-loader.js"] },
    { src: "nm-gauge.js", run: LIB["nm-gauge.js"] },
    { src: "nm-snap.js", run: LIB["nm-snap.js"] },
    { src: "nm-clip.js", run: LIB["nm-clip.js"] },
    { src: "nm-rail.js", run: LIB["nm-rail.js"] },
    { src: "nm-jobs.js", run: LIB["nm-jobs.js"] },
    { run: inline2 },
    { src: "cscroll.js", run: LIB["cscroll.js"] },
    { src: "nm-sync.js", run: LIB["nm-sync.js"] }],
};
