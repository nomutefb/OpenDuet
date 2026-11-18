// @ts-nocheck
/* 만든 파일 — 손으로 고치지 말 것(ui/old-pages/tools/gen.mjs · 옛 에디터 viewer 의 sb.html 화면)
   원본 = sb.html + tokens.css · nm-shared.css · nm-clip.css · nm-cards.css · nm-hist.css · nm-job.css · nm-scene-tokens.css · nm-scene.css + nm-wave.js · nm-scene.js · nm-svg.js · nm-ua.js · nm-rail.js · nm-models.js · nm-styles.js · nm-jobs.js · nm-sync.js · nm-loader.js · draft.js · cscroll.js */
import { SHEETS, FONTS } from "./css.gen";
import { LIB } from "./lib.gen";
function inline1(window, document, __nm) {
if (window.self !== window.top) document.documentElement.classList.add('inmodal');
}
function inline2(window, document, __nm) {
__nm.ex({"$":[()=>$],"esc":[()=>esc],"sbPhotos":[()=>sbPhotos,(v)=>{sbPhotos=v;}],"SB_PHOTO_MAX":[()=>SB_PHOTO_MAX],"sbPhotoCompress":[()=>sbPhotoCompress,(v)=>{sbPhotoCompress=v;}],"sbPhotoPaint":[()=>sbPhotoPaint,(v)=>{sbPhotoPaint=v;}],"sbPhotoTake":[()=>sbPhotoTake,(v)=>{sbPhotoTake=v;}],"SHOWN":[()=>SHOWN,(v)=>{SHOWN=v;}],"sbFireGate":[()=>sbFireGate,(v)=>{sbFireGate=v;}],"SB_FREE_RE":[()=>SB_FREE_RE],"SB_DIRECTORS":[()=>SB_DIRECTORS],"sbDirDup":[()=>sbDirDup],"SB_SHOOTS":[()=>SB_SHOOTS],"sbIsSd":[()=>sbIsSd],"SB_CAPS":[()=>SB_CAPS],"sbCap":[()=>sbCap],"SB_LEN_STEP":[()=>SB_LEN_STEP],"SB_LEN_MIN":[()=>SB_LEN_MIN],"SB_LEN_MAX":[()=>SB_LEN_MAX],"SB_LEN_PTS":[()=>SB_LEN_PTS],"SB_LENS":[()=>SB_LENS],"SB_VALS":[()=>SB_VALS],"sbCutN":[()=>sbCutN],"SB_CUTS":[()=>SB_CUTS],"SB_DEF":[()=>SB_DEF],"SB_STYLE_DEF":[()=>SB_STYLE_DEF],"sbStyle":[()=>sbStyle,(v)=>{sbStyle=v;}],"sbSub":[()=>sbSub,(v)=>{sbSub=v;}],"sbDirector":[()=>sbDirector,(v)=>{sbDirector=v;}],"sbShoot":[()=>sbShoot,(v)=>{sbShoot=v;}],"sbSet":[()=>sbSet,(v)=>{sbSet=v;}],"sbAd":[()=>sbAd,(v)=>{sbAd=v;}],"sbRef":[()=>sbRef,(v)=>{sbRef=v;}],"sbSnd":[()=>sbSnd,(v)=>{sbSnd=v;}],"sbArW":[()=>sbArW,(v)=>{sbArW=v;}],"sbArH":[()=>sbArH,(v)=>{sbArH=v;}],"sbArVal":[()=>sbArVal,(v)=>{sbArVal=v;}],"sbRatio":[()=>sbRatio,(v)=>{sbRatio=v;}],"sbArFit":[()=>sbArFit,(v)=>{sbArFit=v;}],"sbQFit":[()=>sbQFit,(v)=>{sbQFit=v;}],"subsOfName":[()=>subsOfName,(v)=>{subsOfName=v;}],"sbReadJson":[()=>sbReadJson,(v)=>{sbReadJson=v;}],"sbPayload":[()=>sbPayload,(v)=>{sbPayload=v;}],"renderMd":[()=>renderMd,(v)=>{renderMd=v;}],"CKEY":[()=>CKEY],"ckHash":[()=>ckHash],"ckLoad":[()=>ckLoad],"ckAdd":[()=>ckAdd],"wireCopy":[()=>wireCopy,(v)=>{wireCopy=v;}],"sbLand":[()=>sbLand,(v)=>{sbLand=v;}],"sbRefLabs":[()=>sbRefLabs,(v)=>{sbRefLabs=v;}],"SB_PERSON_RE":[()=>SB_PERSON_RE],"renderOut":[()=>renderOut,(v)=>{renderOut=v;}],"SHOT_KEY":[()=>SHOT_KEY],"shotTry":[()=>shotTry],"shotTryUp":[()=>shotTryUp],"fireShoot":[()=>fireShoot,(v)=>{fireShoot=v;}],"JKEY":[()=>JKEY],"jload":[()=>jload],"jsave":[()=>jsave],"jupd":[()=>jupd,(v)=>{jupd=v;}],"sbBase":[()=>sbBase,(v)=>{sbBase=v;}],"DNM":[()=>DNM],"SNM":[()=>SNM],"JOB_SPIN":[()=>JOB_SPIN],"JOB_X":[()=>JOB_X],"loadJob":[()=>loadJob,(v)=>{loadJob=v;}],"SRV_JOBS":[()=>SRV_JOBS,(v)=>{SRV_JOBS=v;}],"_sjSig":[()=>_sjSig,(v)=>{_sjSig=v;}],"_sjBusy":[()=>_sjBusy,(v)=>{_sjBusy=v;}],"pollSrvJobs":[()=>pollSrvJobs,(v)=>{pollSrvJobs=v;}],"renderJobs":[()=>renderJobs,(v)=>{renderJobs=v;}],"FOCUS_JOB":[()=>FOCUS_JOB,(v)=>{FOCUS_JOB=v;}],"_fired":[()=>_fired,(v)=>{_fired=v;}],"_polling":[()=>_polling],"sbOpenRun":[()=>sbOpenRun,(v)=>{sbOpenRun=v;}],"poll":[()=>poll,(v)=>{poll=v;}],"errStatus":[()=>errStatus,(v)=>{errStatus=v;}],"PVZOOM":[()=>PVZOOM]});
const $ = s => document.querySelector(s);
const esc = s => s.replace(/[&<>]/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
})[c]);
[['#scene', '#sceneClip'], ['#sumTx', '#sumClip']].forEach(function ([taSel, bSel]) {
  const ta = $(taSel),
    b = $(bSel);
  if (!ta || !b) return;
  b.classList.add('scn-pp');
  const cp = document.createElement('button');
  cp.type = 'button';
  cp.className = 'scnclip scn-copy scn-hide';
  cp.setAttribute('aria-label', '복사');
  cp.title = '복사';
  b.parentNode.appendChild(cp);
  const er = document.createElement('button');
  er.type = 'button';
  er.className = 'scnclip scn-erase';
  er.setAttribute('aria-label', '입력 지우기');
  er.title = '입력 지우기';
  b.parentNode.appendChild(er);
  let undoTimer = null,
    undoVal = '',
    prog = false;
  const setIcon = (el, svg, key) => {
    if (el._icon !== key) {
      el.innerHTML = __nm.h(svg);
      el._icon = key;
    }
  };
  const upd = () => {
    const f = (ta.value || '').trim().length > 0;
    if (!b.classList.contains('ok')) {
      setIcon(b, window.PASTE_SVG, 'paste');
      b.setAttribute('aria-label', '붙여넣기');
      b.title = '붙여넣기';
    }
    if (!cp.classList.contains('ok')) {
      setIcon(cp, window.COPY_SVG, 'copy');
      cp.classList.toggle('scn-hide', !f);
    }
    if (!er.classList.contains('scn-undo')) {
      setIcon(er, window.ERASE_SVG, 'erase');
      er.classList.toggle('scn-off', !f);
    }
  };
  const exitUndo = () => {
    if (undoTimer) {
      window.clearTimeout(undoTimer);
      undoTimer = null;
    }
    er.classList.remove('scn-undo');
    er.innerHTML = __nm.h(window.ERASE_SVG);
    er.setAttribute('aria-label', '입력 지우기');
    er.title = '입력 지우기';
    upd();
  };
  er.addEventListener('click', e => {
    e.preventDefault();
    if (er.classList.contains('scn-undo')) {
      prog = true;
      ta.value = undoVal;
      ta.dispatchEvent(new window.Event('input', {
        bubbles: true
      }));
      prog = false;
      try {
        ta.focus();
      } catch {}
      exitUndo();
      return;
    }
    if (!(ta.value || '').length) return;
    undoVal = ta.value;
    prog = true;
    ta.value = '';
    ta.dispatchEvent(new window.Event('input', {
      bubbles: true
    }));
    prog = false;
    try {
      ta.focus();
    } catch {}
    er.classList.remove('scn-off');
    er.classList.add('scn-undo');
    er.innerHTML = __nm.h(window.UNDO_SVG);
    er.setAttribute('aria-label', '되돌리기');
    er.title = '되돌리기 (직전 입력 복원)';
    if (undoTimer) window.clearTimeout(undoTimer);
    undoTimer = window.setTimeout(exitUndo, 10000);
  });
  cp.addEventListener('click', async e => {
    e.preventDefault();
    try {
      await window.navigator.clipboard.writeText(ta.value);
      cp.innerHTML = __nm.h(window.CHECK_SVG);
      cp._icon = 'check';
      cp.classList.add('ok');
      window.setTimeout(() => {
        cp.classList.remove('ok');
        upd();
      }, 1200);
    } catch {}
  });
  b.addEventListener('click', async e => {
    e.preventDefault();
    const selS = ta.selectionStart,
      selE = ta.selectionEnd;
    try {
      const t = await window.navigator.clipboard.readText();
      if (t) {
        if (typeof ta.setRangeText === 'function' && typeof selS === 'number') ta.setRangeText(t, selS, selE, 'end');else ta.value += t;
        ta.dispatchEvent(new window.Event('input', {
          bubbles: true
        }));
      }
    } catch {}
    upd();
  });
  const DKEY = 'sb_scene_draft';
  let saveT = null;
  const save = () => {
    window.clearTimeout(saveT);
    saveT = window.setTimeout(() => {
      window.nmDraftSave(DKEY, ta.value);
    }, 400);
  };
  const flush = () => {
    window.clearTimeout(saveT);
    window.nmDraftSave(DKEY, ta.value);
  };
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  const d = window.nmDraftLoad(DKEY);
  if (d && !ta.value.trim()) ta.value = d;
  const GROW_MAX = 160;
  const grow = () => {
    ta.style.height = 'auto';
    const h = Math.min(ta.scrollHeight, GROW_MAX);
    ta.style.height = Math.max(64, h) + 'px';
    ta.style.overflowY = ta.scrollHeight > GROW_MAX ? 'auto' : 'hidden';
  };
  ta.addEventListener('input', () => {
    if (!prog && undoTimer) exitUndo();
    save();
    upd();
    grow();
    if (SHOWN) SHOWN = '';
    sbFireGate();
  });
  upd();
  grow();
});
let sbPhotos = [];
const SB_PHOTO_MAX = 3;
function sbPhotoCompress(file) {
  return new Promise((res, rej) => {
    const img = new window.Image(),
      url = window.URL.createObjectURL(file);
    img.onload = () => {
      try {
        const sc = Math.min(1, 1280 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * sc));
        c.height = Math.max(1, Math.round(img.height * sc));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', 0.6));
      } catch (e) {
        rej(e);
      } finally {
        window.URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      window.URL.revokeObjectURL(url);
      rej(new Error('이미지 아님'));
    };
    img.src = __nm.u(url);
  });
}
function sbPhotoPaint() {
  const pv = $('#pvImg'),
    pe = $('#pvEmpty'),
    del = $('#pvDel'),
    sw = $('#pvSwap'),
    pick = $('#pvPick');
  const has = sbPhotos.length > 0;
  if (del) del.disabled = !has;
  if (sw) sw.disabled = !has;
  const mine = pv && (pv.getAttribute('src') || '').startsWith('data:');
  if (has) {
    if (pv) {
      pv.src = __nm.u(sbPhotos[0]);
      pv.hidden = false;
    }
    if (pe) pe.classList.add('has');
  } else if (mine) {
    if (pv) {
      pv.removeAttribute('src');
      pv.hidden = true;
    }
    if (pe) pe.classList.remove('has');
  }
  if (pick) pick.title = has ? '참조 사진 ' + sbPhotos.length + '/' + SB_PHOTO_MAX + '장 — 교체는 레일 픽토' : '콘티 참조 사진 첨부(최대 3장) — 감독이 실물을 보고 인물 시트의 얼굴 정본이 된다';
}
async function sbPhotoTake(files) {
  const list = [...(files || [])].slice(0, SB_PHOTO_MAX);
  if (!list.length) return;
  const got = [];
  for (const f of list) {
    try {
      got.push(await sbPhotoCompress(f));
    } catch (e) {
      const st = $('#status');
      if (st) {
        st.textContent = '사진 읽기 실패 — 그 장은 뺐다';
      }
    }
  }
  if (got.length) {
    sbPhotos = got;
    sbPhotoPaint();
  }
}
(function () {
  const fi = $('#pvFile'),
    pick = $('#pvPick'),
    sw = $('#pvSwap'),
    del = $('#pvDel');
  if (!fi || !pick) return;
  const open = () => {
    fi.value = '';
    fi.click();
  };
  pick.addEventListener('click', open);
  if (sw) sw.addEventListener('click', open);
  fi.addEventListener('change', () => sbPhotoTake(fi.files));
  if (del) del.addEventListener('click', () => {
    sbPhotos = [];
    sbPhotoPaint();
  });
  sbPhotoPaint();
})();
let SHOWN = '';
function sbFireGate() {
  const go = document.getElementById('go');
  if (!go) return;
  if (SHOWN) {
    go.disabled = false;
    go.title = '이 콘티로 영상을 만든다(감독은 다시 안 돈다 · 재생성 상한 2회) — 입력을 고치면 다시 콘티부터';
    return;
  }
  const sum = (document.getElementById('sumTx') || {}).value || '';
  const sc = (document.getElementById('scene') || {}).value || '';
  const ok = !!(sum.trim() || sc.trim());
  go.disabled = !ok;
  go.title = ok ? '콘티를 만든다(1차) — 영상은 콘티를 보고 한 번 더' : '요약이나 내용 중 하나는 넣어야 한다 — 뭘 만들지 모른다';
}
const SB_FREE_RE = /^###\s*\[\s*자유요약[^\]]*\]\s*$([\s\S]*?)(?=^###\s|^##\s|\Z)/m;
(function () {
  const btn = document.getElementById('sumPull'),
    ta = document.getElementById('sumTx');
  const pop = document.getElementById('artPop'),
    dim = document.getElementById('artDim');
  const listEl = document.getElementById('artList'),
    pageEl = document.getElementById('artPage');
  if (!btn || !ta || !pop || !listEl) return;
  const PER = 5;
  let items = null,
    page = 0,
    busy = false;
  const esc2 = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  })[c]);
  const GO_SVG = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M9 7h8v8"/></svg>';
  function draw() {
    if (!items) return;
    if (!items.length) {
      listEl.innerHTML = __nm.h('<div class="qempty">뉴스 요약에 오른 기사가 없다</div>');
      pageEl.innerHTML = __nm.h('');
      return;
    }
    const pages = Math.ceil(items.length / PER);
    page = Math.min(Math.max(0, page), pages - 1);
    listEl.innerHTML = __nm.h(items.slice(page * PER, page * PER + PER).map(a => '<div class="qrow artrow" data-f="' + esc2(a.file) + '" title="탭 = 이 기사의 자유요약을 자료 참조로 가져온다">' + '<span class="qt">' + a._no + '</span>' + '<span class="qmain">' + esc2(a.title || a.file) + '</span>' + '<span class="qact"><button type="button" class="qgo" data-go="' + esc2(a.file) + '" aria-label="이 요약본 열기" title="이 요약본 열기">' + GO_SVG + '</button></span>' + '</div>').join(''));
    pageEl.innerHTML = __nm.h(pages > 1 ? '<button type="button" class="geni-opt" data-pg="-1"' + (page ? '' : ' disabled') + '>이전</button>' + '<span class="geni-opt on" data-num="1">' + (page + 1) + ' / ' + pages + '</span>' + '<button type="button" class="geni-opt" data-pg="1"' + (page < pages - 1 ? '' : ' disabled') + '>다음</button>' : '');
  }
  async function load() {
    const r = await window.fetch('articles.json?t=' + Date.now());
    const j = r.ok ? await r.json() : null;
    const all = (j && j.articles || []).filter(a => a && a.file && a.has_body);
    const asc = all.slice().sort((x, y) => String(x.file).localeCompare(String(y.file)));
    asc.forEach((a, i) => {
      a._no = i + 1;
    });
    items = asc.slice().reverse();
  }
  async function freeSum(a) {
    if (a._free != null) return a._free;
    try {
      const r = await window.fetch('detail/' + encodeURIComponent(a.file) + '.json?v=' + encodeURIComponent(a.rev || 0));
      const d = r.ok ? await r.json() : null;
      const m = (d && d.body || '').match(SB_FREE_RE);
      let t = m ? m[1].trim() : '';
      const fence = t.match(/^```[a-z]*\s*\n([\s\S]*?)\n```/i);
      if (fence) t = fence[1].trim();
      a._free = t;
    } catch (e) {
      a._free = '';
    }
    return a._free;
  }
  const open = async () => {
    if (busy) return;
    busy = true;
    try {
      if (!items) {
        listEl.innerHTML = __nm.h('<div class="qempty">불러오는 중…</div>');
      }
      pop.hidden = false;
      if (dim) dim.hidden = false;
      place();
      if (!items) {
        await load();
      }
      draw();
    } catch (e) {
      listEl.innerHTML = __nm.h('<div class="qempty">목록을 못 불러왔다 — ' + esc2(e.message) + '</div>');
    } finally {
      busy = false;
    }
  };
  const close = () => {
    pop.hidden = true;
    if (dim) dim.hidden = true;
  };
  function place() {
    const vw = window.innerWidth,
      vh = window.innerHeight;
    pop.style.transform = '';
    pop.style.maxHeight = Math.round(vh - 32) + 'px';
    const w = pop.offsetWidth || Math.min(vw * 0.94, 440);
    const h = pop.offsetHeight;
    pop.style.left = Math.round(Math.max(8, Math.min(vw / 2 - w / 2, vw - w - 8))) + 'px';
    pop.style.top = Math.round(Math.max(16, Math.min(vh / 2 - h / 2, vh - h - 16))) + 'px';
  }
  ['resize', 'orientationchange'].forEach(ev => window.addEventListener(ev, () => {
    if (!pop.hidden) place();
  }, {
    passive: true
  }));
  btn.addEventListener('click', open);
  const xb = document.getElementById('artX');
  if (xb) xb.addEventListener('click', close);
  if (dim) dim.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !pop.hidden) close();
  });
  pageEl.addEventListener('click', e => {
    const b = e.target.closest('button[data-pg]');
    if (!b || b.disabled) return;
    page += +b.dataset.pg;
    draw();
  });
  listEl.addEventListener('click', async e => {
    const go = e.target.closest('button[data-go]');
    if (go) {
      e.stopPropagation();
      const f = go.dataset.go;
      try {
        window.top.location.href = __nm.u('/?a=' + encodeURIComponent(f));
      } catch (_) {
        window.open('/?a=' + encodeURIComponent(f), '_blank');
      }
      return;
    }
    const row = e.target.closest('.artrow');
    if (!row) return;
    const a = (items || []).find(x => x.file === row.dataset.f);
    if (!a) return;
    const main = row.querySelector('.qmain');
    const back = main ? main.textContent : '';
    if (main) main.textContent = '가져오는 중…';
    const sum = await freeSum(a);
    if (main) main.textContent = back;
    if (!sum) {
      if (main) {
        main.textContent = '이 기사엔 자유요약이 없다';
        window.setTimeout(() => {
          main.textContent = back;
        }, 1600);
      }
      return;
    }
    ta.value = (a.title ? a.title + '\n\n' : '') + sum;
    ta.dispatchEvent(new window.Event('input', {
      bubbles: true
    }));
    close();
  });
})();
const SB_DIRECTORS = [{
  id: 'fable',
  nm: window.NM_MODELS.fable,
  hint: '감성·서사 마감'
}, {
  id: 'opus',
  nm: window.NM_MODELS.opus,
  hint: '잔잔·광고'
}, {
  id: 'gpt',
  nm: window.NM_MODELS.gpt,
  hint: '완급·액션 — API 종량'
}];
const sbDirDup = id => id === 'opus' && window.NM_MODELS.opus === window.NM_MODELS.fable;
const SB_SHOOTS = [{
  id: 'grok',
  nm: window.NM_MODELS.grok,
  hint: '구독 자격 직결 · 10초씩 · 720p'
}, {
  id: 'seedance',
  nm: 'SD 2.5',
  hint: '30초 한 발 · 720p · 이음매 없음(30초 약 195크레딧)'
}, {
  id: 'seedance20',
  nm: '2.0',
  hint: '15초 두 발 · 화질 선택 가능(30초 약 135크레딧)'
}, {
  id: 'motion',
  nm: window.NM_MODELS.motion,
  hint: '플랫 모션 · 사내 렌더 → mp4 즉시 · 0원'
}];
const sbIsSd = s => s === 'seedance' || s === 'seedance20' || s === 'seedance5';
const SB_CAPS = {
  grok: {
    q: ['720p'],
    shot: 10,
    snd: true
  },
  seedance: {
    q: ['720p'],
    shot: 30,
    snd: true
  },
  seedance5: {
    q: ['720p'],
    shot: 5,
    snd: true
  },
  seedance20: {
    q: ['720p', 'FHD', '4K'],
    shot: 15,
    snd: true
  },
  motion: {
    q: ['720p', 'FHD', '2K', '4K'],
    shot: 0,
    snd: false,
    why: '사내 렌더라 해상도 제약이 없다'
  }
};
const sbCap = () => SB_CAPS[sbShoot] || SB_CAPS.grok;
const SB_LEN_STEP = 10;
const SB_LEN_MIN = 10,
  SB_LEN_MAX = 60;
const SB_LEN_PTS = [10, 20, 30, 40, 50, 60];
const SB_LENS = Array.from({
  length: (SB_LEN_MAX - SB_LEN_MIN) / SB_LEN_STEP + 1
}, (_, i) => SB_LEN_MIN + i * SB_LEN_STEP + 's');
const SB_VALS = {
  '비율': ['9:16', '16:9', '1:1'],
  '화질': ['720p', 'FHD', '2K', '4K'],
  '프레임': ['30fps'],
  '길이': SB_LENS
};
const sbCutN = s => Math.max(1, Math.round(s / SB_LEN_STEP));
const SB_CUTS = Object.fromEntries(SB_LENS.map(v => [v, sbCutN(parseInt(v, 10)) + '편']));
const SB_DEF = {
  '비율': '9:16',
  '화질': '2K',
  '프레임': '30fps',
  '길이': '10s'
};
const SB_STYLE_DEF = 'photo';
let sbStyle = SB_STYLE_DEF,
  sbSub = 'auto';
let sbDirector = 'fable',
  sbShoot = 'grok',
  sbSet = Object.assign({}, SB_DEF),
  sbAd = false,
  sbRef = true,
  sbSnd = true;
let sbArW = '1',
  sbArH = '1';
function sbArVal() {
  const w = parseInt(sbArW, 10),
    h = parseInt(sbArH, 10);
  return w >= 1 && w <= 99 && h >= 1 && h <= 99 && w / h >= 0.25 && w / h <= 4 ? w + ':' + h : null;
}
function sbRatio() {
  return sbSet['비율'] === 'custom' ? sbArVal() || SB_DEF['비율'] : sbSet['비율'];
}
function sbArFit(el) {
  if (el) el.style.width = Math.max(1, (el.value || '').length) + 'ch';
}
function sbQFit(shoot, q) {
  const ok = (SB_CAPS[shoot] || SB_CAPS.grok).q;
  if (ok.indexOf(q) >= 0) return q;
  const rank = SB_VALS['화질'],
    cur = rank.indexOf(q);
  const down = ok.filter(v => rank.indexOf(v) >= 0 && rank.indexOf(v) <= cur);
  return down.length ? down[down.length - 1] : ok[0];
}
function subsOfName(st, v) {
  const l = ((window.GENI_SUB || {})[st] || []).find(x => x[0] === v);
  return l ? l[1] : '';
}
async function sbReadJson(r) {
  const t = await r.text();
  try {
    return JSON.parse(t);
  } catch (e) {
    if (/^\s*<(?:!doctype|html)/i.test(t)) {
      try {
        if (window.nmSync && window.nmSync.probeNow) window.nmSync.probeNow();
      } catch (_) {}
      throw new Error('로그인이 풀렸다 — 다시 들어가는 중이다. 잠시 뒤 한 번 더 눌러라');
    }
    throw new Error('서버가 이상한 걸 돌려줬다(' + r.status + ') — ' + t.slice(0, 80));
  }
}
function sbPayload() {
  const set = Object.assign({}, sbSet);
  if (set['비율'] === 'custom') set['비율'] = sbRatio();
  const styKo = ((window.GENI_ALL_STYLES || []).find(x => x[0] === sbStyle) || [])[1];
  const subKo = subsOfName(sbStyle, sbSub);
  if (styKo) set['화풍'] = styKo;
  if (subKo && sbSub !== 'auto') set['세부 화풍'] = subKo;
  return {
    director: sbDirector,
    shoot: sbShoot,
    set,
    ad: sbAd,
    sound: sbShoot === 'grok' ? sbSnd : true,
    ref: sbIsSd(sbShoot) ? true : sbShoot === 'motion' ? false : sbShoot === 'grok' ? true : sbRef
  };
}
(function () {
  const dg = $('#dgrid'),
    sg = $('#sgrid'),
    axR = $('#axRatio'),
    axL = $('#axLen'),
    ad = $('#adTg'),
    spec = $('#gospec');
  const axQ = $('#axQ'),
    axLv = $('#axLenV'),
    rf = $('#refTg'),
    snd = $('#sndTg');
  const axSty = $('#sbStyle'),
    axSub = $('#sbSub');
  if (!dg || !sg || !axR || !axL || !axLv || !ad || !spec || !axQ || !rf) return;
  const KEY = 'sb_form';
  try {
    const s = JSON.parse(window.localStorage.getItem(KEY) || '{}');
    if (SB_DIRECTORS.some(x => x.id === s.d && !x.wip)) sbDirector = s.d;
    if (SB_SHOOTS.some(x => x.id === s.sh)) sbShoot = s.sh;
    if (s.set && typeof s.set === 'object') Object.keys(SB_VALS).forEach(k => {
      const v = s.set[k];
      if (SB_VALS[k].includes(v) || k === '비율' && v === 'custom') sbSet[k] = v;
    });
    if (typeof s.arW === 'string' && /^[1-9][0-9]?$/.test(s.arW)) sbArW = s.arW;
    if (typeof s.arH === 'string' && /^[1-9][0-9]?$/.test(s.arH)) sbArH = s.arH;
    if (typeof s.ad === 'boolean') sbAd = s.ad;
    if (typeof s.snd === 'boolean') sbSnd = s.snd;
    if (typeof s.ref === 'boolean') sbRef = s.ref;
  } catch (e) {}
  const save = () => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({
        d: sbDirector,
        sh: sbShoot,
        set: sbSet,
        ad: sbAd,
        ref: sbRef,
        snd: sbSnd,
        arW: sbArW,
        arH: sbArH,
        sty: sbStyle,
        sub: sbSub,
        sv: 2
      }));
    } catch (e) {}
  };
  let sbFocusKey = null;
  const refocus = () => {
    if (!sbFocusKey) return;
    const el = document.querySelector('[data-fk="' + sbFocusKey + '"]');
    sbFocusKey = null;
    if (el) try {
      el.focus({
        preventScroll: true
      });
    } catch (e) {}
  };
  (function wireSumPull() {
    const tg = $('#sumPull');
    if (tg) tg.innerHTML = __nm.h(window.NEWS_SVG || '');
  })();
  const railUpd = rail => {
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
  };
  const railSetup = rail => {
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
    rail.addEventListener('scroll', () => railUpd(rail), {
      passive: true
    });
    const wrap = rail.closest('.geni-railwrap');
    if (wrap) wrap.querySelectorAll('.geni-nav').forEach(btn => btn.addEventListener('click', () => rail.scrollBy({
      left: +btn.dataset.dir * Math.max(110, rail.clientWidth * 0.7),
      behavior: 'smooth'
    })));
    railUpd(rail);
  };
  const subsOf = st => [['auto', '자동']].concat(((window.GENI_SUB || {})[st] || []).filter(x => x[0] !== 'auto'));
  const railHtml = (items, cur) => items.map(([v, ko], i) => '<span class="geni-subit"' + (i ? ' style="--i:' + i + '"' : '') + '>' + (i ? '<span class="geni-sep" aria-hidden="true">|</span>' : '') + '<button type="button" class="geni-opt' + (v === cur ? ' on' : '') + '" data-v="' + v + '" aria-pressed="' + (v === cur) + '">' + esc(ko) + '</button></span>').join('');
  const optBtn = (txt, on, fn, num) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'geni-opt' + (on ? ' on' : '');
    if (num) b.dataset.num = '1';
    b.textContent = txt;
    b.setAttribute('aria-pressed', String(!!on));
    b.dataset.fk = 'opt|' + txt;
    b.addEventListener('click', () => {
      sbFocusKey = b.dataset.fk;
      fn();
    });
    return b;
  };
  const tapChip = (txt, key, tip, o) => {
    const st = o || {};
    return '<span class="gs-v' + (st.on ? ' on' : '') + (st.ro ? '' : st.lock ? ' gs-locked' : ' gs-tog') + '"' + (st.ro ? '' : st.lock ? ' aria-disabled="true"' : ' data-tap="' + key + '" data-fk="tap|' + key + '" role="button" tabindex="0"') + ' title="' + tip + '">' + txt + '</span>';
  };
  function drawSpec() {
    const d = SB_DIRECTORS.find(x => x.id === sbDirector) || SB_DIRECTORS[0];
    const sh = SB_SHOOTS.find(x => x.id === sbShoot) || SB_SHOOTS[0];
    const gemOn = sbIsSd(sbShoot) || sbShoot === 'grok' ? true : sbShoot === 'motion' ? false : sbRef;
    const gemLock = sbIsSd(sbShoot) || sbShoot === 'motion' || sbShoot === 'grok';
    const gemV = tapChip(window.NM_MODELS.gemini, 'ref', sbIsSd(sbShoot) ? 'Seedance = 레퍼런스 이미지 무조건 생성(끌 수 없음 · sb_out/&lt;id&gt;/ref.json = 1-way 주입 필수 재료) · Gemini 종량제 과금 — 탭 무효' : sbShoot === 'motion' ? '모션그래픽 = 실사 레퍼런스를 쓸 곳이 없다(플랫 도형·숫자·글자만) → 강제 OFF · Gemini 미과금 — 탭 무효' : 'Grok = 콘티 컷 그림이 영상의 첫 장면 재료 = 레퍼런스 무조건 생성(끌 수 없음) · Gemini 종량제 과금 — 탭 무효', {
      on: gemOn,
      lock: gemLock
    });
    const L = t => '<span class="gs-lbl">' + t + '</span>';
    const line1 = [L('감독') + ' : ' + tapChip(esc(d.nm), 'dir', '탭=다음 감독으로 변경(순환) — 감독 = 연출 LLM · 아래 「설계」 감독 행과 같은 상태 1벌', {
      on: true
    }), L('촬영') + ' : ' + tapChip(esc(sh.nm), 'shoot', '탭=다음 촬영 엔진으로 변경(순환) — 촬영 = 생성 엔진', {
      on: true
    }), L('콘티') + ' : ' + gemV].map(r => '<span class="gs-row">' + r + '</span>').join('');
    const rail = $('#railSpec');
    const railItems = [[esc(sbSet['화질']), 'q', '탭=화질 변경(고를 수 있는 값은 촬영 칸마다 다르다)', {}], [esc(sbSet['프레임']), 'fps', '프레임 = 30fps 고정(60fps 미지원) — 읽기 전용 리드백', {
      ro: 1
    }], [esc(sbRatio()), 'ar', '탭=비율 변경(9:16 → 16:9 → 1:1 순환) · 직접 N:M 입력은 아래 「설계」 비율 행', {}], [esc(sbSet['길이']) + ' · ' + esc(SB_CUTS[sbSet['길이']] || ''), 'len', '탭=길이 포인트 순환(5s → 8s → 10s → 12s → 15s) · 1초 단위는 아래 「설계」 길이 자(ruler) · 컷수는 길이 종속(storyboard-v1 하드룰)', {}]].concat(sbAd ? [['광고 막컷', 'ad', '탭=광고 모드 끄기 — 켜짐 = 마지막 컷이 제품·슬로건 키비주얼', {}]] : []);
    if (rail) rail.innerHTML = __nm.h(railItems.map(it => tapChip(it[0], it[1], it[2], it[3])).join('<span class="gs-sep">·</span>'));
    spec.innerHTML = __nm.h('<span class="gs-l1" title="감독 = 연출 LLM · 촬영 = 생성 엔진 · 콘티 = 레퍼런스 이미지 엔진(Gemini)">' + line1 + '</span>');
  }
  const lenSec = () => {
    const n = parseInt(sbSet['길이'], 10);
    return n >= SB_LEN_MIN && n <= SB_LEN_MAX && n % SB_LEN_STEP === 0 ? n : parseInt(SB_DEF['길이'], 10);
  };
  const lenPct = s => (s - SB_LEN_MIN) / (SB_LEN_MAX - SB_LEN_MIN) * 100;
  function drawLen() {
    const cur = lenSec(),
      half = 100 / (SB_LENS.length - 1) / 2;
    const lbls = SB_LEN_PTS.map(s => '<i' + (s === cur ? ' class="on"' : '') + ' style="left:' + lenPct(s) + '%">' + s + '</i>').join('');
    const hits = SB_LENS.map((v, i) => {
      const s = SB_LEN_MIN + i * SB_LEN_STEP,
        p = lenPct(s),
        l = Math.max(0, p - half),
        r = Math.min(100, p + half);
      return '<button type="button" data-s="' + s + '" data-fk="len|' + s + '" aria-pressed="' + (s === cur) + '" style="left:' + l + '%;width:' + (r - l) + '%"' + ' title="' + s + 's · ' + SB_CUTS[v] + '" aria-label="길이 ' + s + '초 · ' + SB_CUTS[v] + '"></button>';
    }).join('');
    const ph = 'calc(' + lenPct(cur) + '% - ' + (lenPct(cur) / 100).toFixed(2) + 'px)';
    axL.innerHTML = __nm.h('<div class="lenrule-lbls" aria-hidden="true">' + lbls + '</div>' + '<div class="lenrule-track"><i class="lenrule-fill" style="width:' + lenPct(cur) + '%"></i><i class="lenrule-ph" style="left:' + ph + '"></i></div>' + '<div class="lenrule-hit">' + hits + '</div>');
    axLv.textContent = cur + 's · ' + SB_CUTS[cur + 's'];
  }
  const setLen = (s, fk) => {
    const n = Math.min(SB_LEN_MAX, Math.max(SB_LEN_MIN, s));
    sbFocusKey = fk || null;
    sbSet['길이'] = n + 's';
    render();
  };
  axL.addEventListener('click', e => {
    const b = e.target.closest('button[data-s]');
    if (!b) return;
    setLen(parseInt(b.dataset.s, 10), b.dataset.fk);
  });
  if (axSty) axSty.addEventListener('click', e => {
    const b = e.target.closest('.geni-opt');
    if (!b || !axSty.contains(b)) return;
    sbStyle = b.dataset.v;
    sbSub = 'auto';
    render();
  });
  if (axSub) axSub.addEventListener('click', e => {
    const b = e.target.closest('.geni-opt');
    if (!b || !axSub.contains(b)) return;
    sbSub = b.dataset.v;
    render();
  });
  axL.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const b = e.target.closest('button[data-s]');
    if (!b) return;
    e.preventDefault();
    const n = parseInt(b.dataset.s, 10) + (e.key === 'ArrowRight' ? 1 : -1);
    setLen(n, 'len|' + Math.min(SB_LEN_MAX, Math.max(SB_LEN_MIN, n)));
  });
  function render() {
    dg.innerHTML = __nm.h('');
    SB_DIRECTORS.forEach(m => {
      if (sbDirDup(m.id)) return;
      const b = optBtn(m.nm, sbDirector === m.id || m.id === 'fable' && sbDirDup(sbDirector), () => {
        sbDirector = m.id;
        render();
      });
      b.title = m.hint;
      if (m.wip) {
        b.disabled = true;
        b.title = m.hint + ' — OpenAI API 키 배선 후 활성(설계확정 §2-1)';
      }
      dg.appendChild(b);
    });
    sg.innerHTML = __nm.h('');
    SB_SHOOTS.forEach(m => {
      const b = optBtn(m.nm, sbShoot === m.id, () => {
        sbShoot = m.id;
        render();
      });
      b.title = m.hint;
      sg.appendChild(b);
    });
    axR.innerHTML = __nm.h('');
    SB_VALS['비율'].forEach(v => axR.appendChild(optBtn(v, sbSet['비율'] === v, () => {
      sbSet['비율'] = v;
      render();
    }, true)));
    const arOn = sbSet['비율'] === 'custom';
    if (!arOn) axR.appendChild(optBtn('직접', false, () => {
      sbSet['비율'] = 'custom';
      render();
      window.setTimeout(() => {
        const w = $('#sbArW');
        if (w) {
          w.focus();
          w.select();
        }
      }, 40);
    }));
    {
      const wrap = $('#sbArWrap');
      if (wrap) {
        wrap.classList.toggle('open', arOn);
        if (arOn) wrap.removeAttribute('inert');else wrap.setAttribute('inert', '');
      }
      const aw = $('#sbArW'),
        ah = $('#sbArH');
      if (aw && aw.value !== sbArW) aw.value = sbArW;
      if (ah && ah.value !== sbArH) ah.value = sbArH;
      sbArFit(aw);
      sbArFit(ah);
    }
    axQ.innerHTML = __nm.h('');
    const qOk = sbCap().q;
    sbSet['화질'] = sbQFit(sbShoot, sbSet['화질']);
    if (qOk.length === 1) {
      const v = document.createElement('span');
      v.className = 'geni-opt on qro';
      v.dataset.num = '1';
      v.textContent = qOk[0];
      axQ.appendChild(v);
    } else {
      SB_VALS['화질'].filter(v => qOk.indexOf(v) >= 0).forEach(v => axQ.appendChild(optBtn(v, sbSet['화질'] === v, () => {
        sbSet['화질'] = v;
        render();
      }, true)));
    }
    if (axSty && axSub) {
      const all = window.GENI_ALL_STYLES || [];
      if (all.length && !all.some(x => x[0] === sbStyle)) sbStyle = all.some(x => x[0] === SB_STYLE_DEF) ? SB_STYLE_DEF : all[0][0];
      axSty.innerHTML = __nm.h(railHtml(all, sbStyle));
      const subs = subsOf(sbStyle);
      if (!subs.some(x => x[0] === sbSub)) sbSub = 'auto';
      axSub.innerHTML = __nm.h(railHtml(subs, sbSub));
      railSetup(axSty);
      railSetup(axSub);
      railUpd(axSty);
      railUpd(axSub);
    }
    drawLen();
    const refOn = sbShoot === 'motion' ? false : true;
    rf.textContent = window.NM_MODELS.gemini;
    rf.classList.toggle('on', refOn);
    rf.setAttribute('aria-pressed', String(refOn));
    rf.disabled = true;
    rf.title = sbIsSd(sbShoot) ? 'Seedance = 레퍼런스 이미지 강제 ON — md만 산출하는 레인이라 이미지가 발사 필수 재료(끌 수 없음)' : sbShoot === 'motion' ? '모션그래픽 = 레퍼런스 이미지 강제 OFF — 플랫 도형·숫자·글자만 그리는 레인이라 실사 참조를 쓸 곳이 없다(켤 수 없음)' : 'Grok = 콘티 컷 그림이 영상의 첫 장면 재료 = 레퍼런스 강제 ON(끌 수 없음 · Gemini 종량제)';
    if (snd) {
      const sOn = sbShoot === 'grok' ? sbSnd : true;
      snd.classList.toggle('on', sOn);
      snd.setAttribute('aria-pressed', String(sOn));
      snd.disabled = sbShoot !== 'grok';
      snd.title = sbShoot === 'grok' ? sbSnd ? '켜짐 = 영상에 소리를 담는다 · 탭=끄기' : '꺼짐 = 산출에서 소리 트랙을 뺀다(프롬프트 무음 지시가 아니라 확정 제거) · 탭=켜기' : '소리 선택은 촬영=Grok 에서만 의미가 있다 — 다른 레인은 이 값을 안 본다(탭 무효)';
    }
    ad.classList.toggle('on', sbAd);
    ad.setAttribute('aria-pressed', String(sbAd));
    drawSpec();
    save();
    refocus();
  }
  [['#sbArW', 'W'], ['#sbArH', 'H']].forEach(([sel, side]) => {
    const el = $(sel);
    if (!el) return;
    el.addEventListener('input', () => {
      const v = el.value.replace(/\D/g, '').slice(0, 2);
      if (el.value !== v) el.value = v;
      if (side === 'W') sbArW = v;else sbArH = v;
      sbArFit(el);
      render();
    });
    el.addEventListener('focus', () => el.select());
    el.addEventListener('mouseup', e => e.preventDefault());
    el.addEventListener('blur', () => {
      if (!el.value) {
        el.value = '1';
        if (side === 'W') sbArW = '1';else sbArH = '1';
        sbArFit(el);
        render();
      }
    });
  });
  document.querySelectorAll('.rowtap[data-rowtap]').forEach(row => {
    row.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      const b = document.getElementById(row.dataset.rowtap);
      if (b && !b.disabled) b.click();
    });
  });
  ad.addEventListener('click', () => {
    sbAd = !sbAd;
    render();
  });
  if (snd) snd.addEventListener('click', () => {
    if (sbShoot !== 'grok') return;
    sbSnd = !sbSnd;
    render();
  });
  rf.addEventListener('click', () => {
    return;
  });
  const SB_TAP = {
    dir: {
      wrap: '#dgrid'
    },
    shoot: {
      wrap: '#sgrid'
    },
    q: {
      wrap: '#axQ'
    },
    ar: {
      wrap: '#axRatio',
      skip: ['직접']
    },
    len: {
      cyc: () => {
        const c = lenSec();
        const nx = SB_LEN_PTS.find(s => s > c);
        setLen(nx === undefined ? SB_LEN_PTS[0] : nx);
      }
    },
    ref: {
      btn: '#refTg'
    },
    ad: {
      btn: '#adTg'
    },
    snd: {
      btn: '#sndTg'
    }
  };
  const sbTap = key => {
    const c = SB_TAP[key];
    if (!c) return;
    if (c.cyc) {
      c.cyc();
      return;
    }
    if (c.btn) {
      const b = $(c.btn);
      if (b && !b.disabled) b.click();
      return;
    }
    const list = [...document.querySelectorAll(c.wrap + ' .geni-opt')].filter(b => !b.disabled && !(c.skip || []).includes(b.textContent));
    if (!list.length) return;
    const cur = list.findIndex(b => b.classList.contains('on'));
    list[(cur + 1) % list.length].click();
  };
  ['#gospec', '#railSpec'].forEach(sel => {
    const host = $(sel);
    if (!host) return;
    host.addEventListener('click', e => {
      const t = e.target.closest('.gs-tog[data-tap]');
      if (!t) return;
      e.stopPropagation();
      sbTap(t.dataset.tap);
    });
    host.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const t = e.target.closest('.gs-tog[data-tap]');
      if (!t) return;
      e.preventDefault();
      e.stopPropagation();
      const k = t.dataset.tap;
      sbTap(k);
      const n = host.querySelector('[data-fk="tap|' + k + '"]');
      if (n) try {
        n.focus({
          preventScroll: true
        });
      } catch (_) {}
    });
  });
  render();
})();
function renderMd(md) {
  const parts = md.split('```');
  const unbal = parts.length % 2 === 0;
  let html = '';
  parts.forEach((part, i) => {
    if (i % 2 === 1 && !(unbal && i === parts.length - 1)) {
      let code = part;
      const nl = code.indexOf('\n');
      const first = nl >= 0 ? code.slice(0, nl).trim() : '';
      if (nl >= 0 && (first === '' || first.length <= 24 && /^[a-zA-Z][a-zA-Z0-9 .:+_-]*$/.test(first))) code = code.slice(nl + 1);
      code = code.replace(/\s+$/, '');
      const enc = encodeURIComponent(code);
      html += `<div class="code"><button data-c="${enc}" aria-label="복사" title="복사">${window.COPY_SVG}</button><pre>${esc(code)}</pre></div>`;
    } else {
      part.split('\n').forEach(line => {
        const t = line.trim();
        if (!t) return;
        if (t.startsWith('### ')) html += `<h3>${esc(t.slice(4))}</h3>`;else if (t.startsWith('## ')) html += `<h2>${esc(t.slice(3))}</h2>`;else if (t.startsWith('# ')) html += `<h1 class="t">${esc(t.slice(2))}</h1>`;else if (t.startsWith('@ 순서')) html += `<p class="legend">${esc(t)}</p>`;else {
          let txt = t;
          if (/^\|.*\|$/.test(txt)) txt = txt.replace(/^\||\|$/g, '').split('|').map(s => s.trim()).filter(Boolean).join(' · ');
          txt = txt.replace(/\*\*([^*]+)\*\*/g, '$1');
          html += `<p>${esc(txt)}</p>`;
        }
      });
    }
  });
  return html;
}
const CKEY = 'sb_copied';
const ckHash = s => {
  let x = 5381;
  for (let i = 0; i < s.length; i++) x = (x * 33 ^ s.charCodeAt(i)) >>> 0;
  return x.toString(36);
};
const ckLoad = () => {
  try {
    return new Set(JSON.parse(window.localStorage.getItem(CKEY) || '[]'));
  } catch (e) {
    return new Set();
  }
};
const ckAdd = k => {
  try {
    const s = ckLoad();
    s.add(k);
    window.localStorage.setItem(CKEY, JSON.stringify([...s]));
  } catch (e) {}
};
function wireCopy() {
  const seen = ckLoad();
  document.querySelectorAll('.code button').forEach(b => {
    const txt = decodeURIComponent(b.dataset.c),
      key = ckHash(txt);
    if (seen.has(key)) b.classList.add('copied');
    b.onclick = () => {
      const ok = () => {
        b.innerHTML = __nm.h(window.CHECK_SVG);
        b.classList.add('done', 'copied');
        ckAdd(key);
        window.setTimeout(() => {
          b.innerHTML = __nm.h(window.COPY_SVG);
          b.classList.remove('done');
        }, 1500);
      };
      window.navigator.clipboard.writeText(txt).then(ok).catch(() => {
        try {
          const t = document.createElement('textarea');
          t.value = txt;
          t.style.cssText = 'position:fixed;left:-9999px;top:0';
          document.body.appendChild(t);
          t.focus();
          t.select();
          const done = document.execCommand('copy');
          t.remove();
          if (done) ok();
        } catch (e) {}
      });
    };
  });
}
async function sbLand(outEl, outPath) {
  if (!window.nmRail) return;
  const abs = u => {
    try {
      return new window.URL(u, window.location.href).href;
    } catch (e) {
      return String(u || '');
    }
  };
  try {
    if (outEl && outEl.querySelector) {
      const el = outEl.querySelector('video[src]') || outEl.querySelector('img[src]');
      if (el && el.src) {
        window.nmRail.add({
          url: abs(el.src),
          cap: '콘티',
          dlname: /\.mp4(\?|#|$)/i.test(el.src) ? 'motion.mp4' : 'storyboard.jpg'
        });
        return;
      }
    }
    if (!outPath) return;
    const base = outPath.replace(/board\.md$/, '');
    try {
      const vr = await window.fetch(base + 'video.json?t=' + Date.now());
      if (vr.ok) {
        const v = await vr.json();
        const got = (v && Array.isArray(v.cuts) ? v.cuts : []).filter(c => c && c.video);
        if (got.length) {
          if (v.full) window.nmRail.add({
            url: abs(v.full),
            cap: '콘티',
            dlname: 'storyboard.mp4'
          });else got.forEach(c => window.nmRail.add({
            url: abs(c.video),
            cap: '콘티',
            dlname: 'shot' + String(c.n || 1).padStart(2, '0') + '.mp4'
          }));
          return;
        }
      }
    } catch (e) {}
    try {
      const mr = await window.fetch(base + 'motion.mp4?t=' + Date.now(), {
        method: 'HEAD'
      });
      if (mr.ok && !(mr.headers.get('content-type') || '').includes('text/html')) {
        window.nmRail.add({
          url: abs(base + 'motion.mp4'),
          cap: '콘티',
          dlname: 'motion.mp4'
        });
        return;
      }
    } catch (e) {}
    const jr = await window.fetch(base + 'ref.json?t=' + Date.now());
    if (!jr.ok) return;
    const j = await jr.json();
    const u = j && Array.isArray(j.urls) && j.urls[0] || j && j.url || '';
    if (u) window.nmRail.add({
      url: abs(u),
      cap: '콘티',
      dlname: 'storyboard.jpg'
    });
  } catch (e) {}
}
function sbRefLabs(md) {
  const m = (md || '').match(/##\s*🖼\s*레퍼런스\s*\n([\s\S]*?)(?=\n##\s|$)/);
  if (!m) return [];
  const sec = m[1],
    out = [],
    re = /```[^\n]*\n[\s\S]*?\n```/g;
  let pos = 0,
    f;
  while (f = re.exec(sec)) {
    const head = sec.slice(pos, f.index);
    const got = [...head.matchAll(/^\s*[①-⑳]\s*([^\n:：]{1,30})\s*[:：]/gm)].map(x => x[1].trim());
    out.push(got.length ? got[got.length - 1] : '');
    pos = re.lastIndex;
  }
  return out.slice(0, 7);
}
const SB_PERSON_RE = /인물|사람|캐릭터|주인공|출연|배우/;
async function renderOut(md, outEl, outPath) {
  let html = renderMd(md);
  let vids = '',
    mo = '',
    legacy = '',
    persons = '',
    sheetCard = '';
  if (outPath) {
    const base = outPath.replace(/board\.md$/, '');
    try {
      const vr = await window.fetch(base + 'video.json?t=' + Date.now());
      if (vr.ok) {
        const v = await vr.json();
        const cs = v && Array.isArray(v.cuts) ? v.cuts : [];
        const ok = cs.filter(c => c && c.video);
        if (ok.length) {
          const fullCell = v.full ? '<video src="' + String(v.full).replace(/"/g, '%22') + '" controls playsinline preload="metadata" data-ix="full"></video>' : '';
          const cells = fullCell + cs.map(c => c && c.video ? '<video src="' + String(c.video).replace(/"/g, '%22') + '" controls playsinline preload="metadata" data-ix="' + (c.n || '') + '"></video>' : '<div class="refmiss">컷 ' + (c && c.n || '?') + ' 실패 — ' + esc(String(c && c.fail || '사유 미기록')) + '</div>').join('');
          const secs = ok.reduce((a, c) => a + (+c.sec || 0), 0);
          const won = n => (Number(n) || 0).toFixed(2);
          const crFmt = n => {
            const x = Number(n) || 0;
            return Math.round(x) === x ? String(x) : won(x);
          };
          let money = v.cost_unit === 'credit' ? 'C ' + crFmt(v.cost_cr) : '';
          try {
            const cr = await window.fetch(base + 'cost.json?t=' + Date.now());
            if (cr.ok) {
              const led = await cr.json();
              const rows = led && Array.isArray(led.items) ? led.items : [];
              if (rows.length) {
                const parts = [];
                const gn = Number(led.gem_n) || rows.filter(r => r.vendor === 'gemini').reduce((a, r) => a + (Number(r.n) || 0), 0);
                if (gn) {
                  const gk = Number(led.gem_krw) || 0;
                  parts.push('G' + (gk ? '(' + gk + '원)' : '') + ' × ' + gn + '회');
                }
                const cRows = rows.filter(r => r.unit === 'credit');
                const cSum = cRows.reduce((a, r) => a + (Number(r.cr) || 0), 0);
                if (cSum) parts.push('C ' + crFmt(cSum));
                if (parts.length) money = parts.join(' + ');
              }
            }
          } catch (e) {}
          const laneNm = window.NM_MODELS && window.NM_MODELS[v.lane] || esc(String(v.lane || ''));
          vids = '<div class="ref multi">' + cells + '<div class="cap">' + esc(laneNm) + ' 영상 ' + ok.length + '/' + cs.length + '편 · 합 ' + secs + '초 · 소리 ' + (v.sound === false ? '끔' : '켬') + (money ? ' · ' + money : '') + '</div></div>';
        }
      }
    } catch (e) {}
    try {
      const mr = await window.fetch(base + 'motion.mp4?t=' + Date.now(), {
        method: 'HEAD'
      });
      if (mr.ok && !(mr.headers.get('content-type') || '').includes('text/html')) {
        mo = '<div class="ref"><video src="' + (base + 'motion.mp4').replace(/"/g, '%22') + '" controls playsinline preload="metadata"></video>' + '<div class="cap">모션그래픽 렌더 — 사내 렌더러(외부 API 0)</div></div>';
      }
    } catch (e) {}
    let srcs = null;
    try {
      const jr = await window.fetch(base + 'ref.json?t=' + Date.now());
      if (jr.ok) {
        const j = await jr.json();
        if (j && Array.isArray(j.urls) && j.urls.length) srcs = j.urls;else if (j && j.url) srcs = [j.url];
      }
    } catch (e) {}
    if (!srcs) {
      try {
        const hr = await window.fetch(base + 'ref.jpg?t=' + Date.now(), {
          method: 'HEAD'
        });
        if (hr.ok && !(hr.headers.get('content-type') || '').includes('text/html')) srcs = [base + 'ref.jpg'];
      } catch (e) {}
    }
    if (srcs && srcs.length) {
      const first = srcs.find(Boolean);
      const pv = document.getElementById('pvImg'),
        pe = document.getElementById('pvEmpty');
      if (pv && first) {
        pv.src = __nm.u(first + (first.includes('?') ? '' : '?t=' + Date.now()));
        pv.hidden = false;
        if (pe) pe.classList.add('has');
      }
      if (pv) pv.addEventListener('error', () => {
        pv.hidden = true;
        if (pe) pe.classList.remove('has');
      }, {
        once: true
      });
      const labs = sbRefLabs(md);
      const pc = [],
        lc = [];
      srcs.forEach((u, ix) => {
        const lab = labs[ix] || '';
        const person = SB_PERSON_RE.test(lab);
        if (!u) {
          if (person) pc.push('<div class="refmiss">인물 시트 ' + (ix + 1) + '번 생성/업로드 실패 — 슬롯 번호 보존(이 장만 빼고 주입)</div>');
          return;
        }
        const bust = u.includes('?') ? '' : '?t=' + Date.now();
        const img = '<img src="' + (u + bust).replace(/"/g, '%22') + '" data-ix="' + (ix + 1) + '">';
        if (person) pc.push('<div class="ref">' + img + '<div class="cap">' + esc(lab) + ' — 360도 시트</div></div>');else lc.push(img);
      });
      persons = pc.join('');
      if (lc.length) legacy = '<div class="ref' + (lc.length > 1 ? ' multi' : '') + '">' + lc.join('') + '<div class="cap">레퍼런스 이미지' + (lc.length > 1 ? ' ×' + lc.length : '') + '</div></div>';
    }
  }
  if (outPath) {
    try {
      const _sb = outPath.replace(/board\.md$/, '');
      const sr = await window.fetch(_sb + 'sheet.json?t=' + Date.now());
      if (sr.ok) {
        const sj = await sr.json();
        const su = sj && sj.url || '';
        if (su) {
          const bust = su.includes('?') ? '' : '?t=' + Date.now();
          sheetCard = '<div class="ref"><img src="' + (su + bust).replace(/"/g, '%22') + '" data-ix="sheet">' + '<div class="cap">스토리보드' + (sj.cuts ? ' — ' + sj.cuts + '컷 한 장' : '') + '</div></div>';
        }
      }
    } catch (e) {}
  }
  const _bullet = t => '<div class="geni-sechead"><span class="cref-lbl">' + t + '</span></div>';
  outEl.innerHTML = __nm.h((sheetCard ? _bullet('스토리보드') + sheetCard : '') + (persons ? _bullet('주요 인물') + persons : '') + legacy + mo + vids + html);
  SHOWN = outPath || '';
  sbFireGate();
  wireCopy();
  outEl.querySelectorAll('.ref img').forEach(im => im.addEventListener('error', () => {
    const d = document.createElement('div');
    d.className = 'refmiss';
    d.textContent = '레퍼런스 ' + (im.dataset.ix || '') + '번 이미지 없음/로드 실패';
    im.replaceWith(d);
  }, {
    once: true
  }));
}
const SHOT_KEY = 'sb_shot_try';
const shotTry = () => {
  try {
    return JSON.parse(window.localStorage.getItem(SHOT_KEY) || '{}');
  } catch (e) {
    return {};
  }
};
const shotTryUp = (k, v) => {
  try {
    const a = shotTry();
    a[k] = v;
    window.localStorage.setItem(SHOT_KEY, JSON.stringify(a));
  } catch (e) {}
};
async function fireShoot(outPath, shoot) {
  const g = document.getElementById('go'),
    status = $('#status');
  g.disabled = true;
  status.classList.remove('err');
  status.textContent = '제작 요청 보내는 중…';
  try {
    const res = await window.fetch('/api/sb', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(Object.assign({
        story: '',
        base: outPath,
        shootOnly: true,
        lbl: '제작 · ' + shoot
      }, sbPayload(), {
        shoot: shoot
      }, {
        set: Object.assign({}, sbPayload().set, {
          '화질': sbQFit(shoot, sbSet['화질'])
        })
      }))
    });
    const j = await sbReadJson(res);
    if (!res.ok || j.error) {
      status.innerHTML = __nm.h(window.WARN_SVG + ' 제작 요청 실패: ' + esc(String(j.error || res.status)));
      status.classList.add('err');
      return;
    }
    shotTryUp(outPath, (shotTry()[outPath] || 0) + 1);
    const a = jload();
    a.unshift({
      id: j.id,
      out: j.out,
      ts: Date.now(),
      d: sbDirector,
      sh: shoot,
      base: true,
      label: '제작 · ' + shoot,
      status: 'run'
    });
    jsave(a);
    renderJobs();
    poll(j.out, j.id);
  } catch (e) {
    status.innerHTML = __nm.h(window.WARN_SVG + ' 제작 요청 실패: ' + esc(e.message));
    status.classList.add('err');
  } finally {
    g.disabled = false;
    sbFireGate();
  }
}
const JKEY = 'sb_jobs';
const jload = () => {
  try {
    const a = JSON.parse(window.localStorage.getItem(JKEY) || '[]');
    return Array.isArray(a) ? a.slice(0, 30) : [];
  } catch (e) {
    return [];
  }
};
const jsave = a => {
  try {
    window.localStorage.setItem(JKEY, JSON.stringify(a.slice(0, 30)));
  } catch (e) {}
  try {
    if (window.nmRail && typeof window.nmRail.refresh === 'function') window.nmRail.refresh();
  } catch (e) {}
};
function jupd(id, patch) {
  const a = jload();
  const j = a.find(x => x.id === id);
  if (j) {
    Object.assign(j, patch);
    jsave(a);
  }
  renderJobs();
}
let sbBase = null;
const DNM = {
    fable: window.NM_MODELS.fable,
    opus: window.NM_MODELS.opus,
    gpt: window.NM_MODELS.gpt
  },
  SNM = {
    kling: window.NM_MODELS.kling,
    seedance: window.NM_MODELS.seedance,
    motion: window.NM_MODELS.motion
  };
const JOB_SPIN = window.nmOrbHTML ? window.nmOrbHTML('prompting', 14) : '…';
const JOB_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6 18 18M18 6 6 18"/></svg>';
async function loadJob(j) {
  try {
    const r = await window.fetch(j.out + '?t=' + Date.now());
    if (!r.ok) return false;
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    const md = await r.text();
    if (!md || !md.trim() || ct.includes('text/html') || /^\s*<!doctype/i.test(md) || /<html[\s>]/i.test(md.slice(0, 300))) return false;
    const d = new Date(j.ts),
      p2 = n => String(n).padStart(2, '0');
    $('#status').innerHTML = __nm.h(window.OK_SVG + ' ' + esc(j.label) + ' · ' + p2(d.getHours()) + ':' + p2(d.getMinutes()));
    $('#status').classList.remove('err');
    await renderOut(md, $('#out'), j.out);
    return true;
  } catch (e) {
    return false;
  }
}
let SRV_JOBS = [],
  _sjSig = '',
  _sjBusy = false;
async function pollSrvJobs() {
  if (document.hidden || _sjBusy) return;
  _sjBusy = true;
  try {
    const r = await window.fetch('sb-hist.json?t=' + Date.now());
    if (!r.ok) return;
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    const tx = await r.text();
    if (!tx || ct.includes('text/html') || /^\s*</.test(tx) || tx === _sjSig) return;
    const j = JSON.parse(tx);
    if (!Array.isArray(j)) return;
    _sjSig = tx;
    SRV_JOBS = j;
    renderJobs();
  } catch (e) {} finally {
    _sjBusy = false;
  }
}
window.nmRefresh = pollSrvJobs;
window.setInterval(pollSrvJobs, 10000);
function renderJobs() {
  const box = $('#jobs'),
    head = $('#jobsHead');
  if (!box || !head) return;
  const loc = jload();
  const has = new Set(loc.map(x => x.id));
  const srv = SRV_JOBS.filter(s => s && s.id && !has.has(s.id) && /^[A-Za-z0-9_-]+$/.test(s.id) && /^sb_out\/[A-Za-z0-9_-]+\/board\.md$/.test(s.out || '')).map(s => ({
    id: s.id,
    out: s.out,
    ts: +s.ts || 0,
    label: (s.t || '콘티').slice(0, 24),
    status: 'done',
    srv: 1
  }));
  const a = loc.concat(srv).sort((x, y) => (y.ts || 0) - (x.ts || 0));
  head.hidden = !a.length;
  box.innerHTML = __nm.h('');
  a.forEach(j => {
    const row = document.createElement('div');
    row.className = 'job' + (j.status === 'done' ? ' done' : j.status === 'err' ? ' err' : '');
    const lab = document.createElement('span');
    lab.className = 'jlab';
    lab.textContent = j.label;
    lab.title = '탭 = 이 콘티 불러오기';
    lab.setAttribute('role', 'button');
    lab.setAttribute('tabindex', '0');
    lab.addEventListener('click', () => {
      if (j.status === 'run') {
        sbOpenRun(j.id);
        return;
      }
      loadJob(j);
      try {
        $('#out').scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      } catch (e) {}
    });
    const v = document.createElement('span');
    v.className = 'jvar';
    v.textContent = j.srv ? '다른 기기' : (DNM[j.d] || j.d) + ' · ' + (SNM[j.sh] || j.sh) + (j.base ? ' · 변형' : '');
    const st = document.createElement('span');
    st.className = 'jst';
    const d = new Date(j.ts),
      p2 = n => String(n).padStart(2, '0');
    st.innerHTML = __nm.h(j.status === 'done' ? window.CHECK_SVG + ' 완료 · ' + p2(d.getHours()) + ':' + p2(d.getMinutes()) : j.status === 'err' ? window.ERR_SVG + ' 실패' : JOB_SPIN + ' 설계 중');
    row.appendChild(lab);
    row.appendChild(v);
    if (j.status === 'done') {
      const m = document.createElement('button');
      m.type = 'button';
      m.className = 'jmore';
      m.textContent = '변형';
      m.title = '이 콘티 기반 변형 — 입력칸에 바꿀 점만 쓰고 생성';
      m.addEventListener('click', () => {
        sbBase = {
          out: j.out,
          label: j.label
        };
        $('#status').classList.remove('err');
        $('#status').innerHTML = __nm.h(window.OK_SVG + ' 변형 모드: ' + esc(j.label) + ' — 입력칸에 바꿀 점만 쓰고 생성 (다시 누르면 해제)');
        try {
          $('#scene').focus();
          $('#scene').scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        } catch (e) {}
      });
      row.appendChild(m);
    }
    if (!j.srv) {
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'jdel';
      del.innerHTML = __nm.h(JOB_X);
      del.setAttribute('aria-label', '내역 삭제');
      del.title = '내역에서 삭제(생성물 파일은 유지)';
      del.addEventListener('click', () => {
        jsave(jload().filter(x => x.id !== j.id));
        if (sbBase && sbBase.out === j.out) sbBase = null;
        renderJobs();
      });
      row.appendChild(del);
    }
    row.appendChild(st);
    box.appendChild(row);
  });
}
let FOCUS_JOB = '';
let _fired = false;
const _polling = () => {
  try {
    return window.nmJobs.count(JKEY) > 0;
  } catch (e) {
    return false;
  }
};
function sbOpenRun(id) {
  const j = jload().find(x => x && x.id === id && x.status === 'run');
  if (!j) return false;
  FOCUS_JOB = id;
  const status = $('#status'),
    out = $('#out');
  status.classList.remove('err');
  status.setAttribute('aria-busy', 'true');
  if (window.nmLoader) status.innerHTML = __nm.h(window.nmLoader('prompting', '제작중…') + '<span class="sbtime nm-shim" style="margin-left:var(--sp-1)"></span>');
  if (out) {
    out.innerHTML = __nm.h('');
    SHOWN = '';
    sbFireGate();
  }
  let busy = false;
  try {
    busy = window.nmJobs.busy(JKEY, id);
  } catch (e) {}
  if (!busy) poll(j.out, j.id, true);
  try {
    status.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth',
      block: 'center'
    });
  } catch (e) {}
  return true;
}
window.nmJobOpen = sbOpenRun;
function poll(outPath, jid, focus) {
  focus = focus !== false;
  const pid = jid || outPath;
  try {
    if (!window.nmJobs.hold(JKEY, pid, () => {})) return;
  } catch (e) {}
  if (focus) FOCUS_JOB = pid;
  const mine = () => FOCUS_JOB === pid;
  const t0 = Date.now(),
    status = $('#status'),
    out = $('#out');
  const budget = 1800;
  const fmtSec = s => {
    s = Math.max(0, Math.round(s));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  };
  const ETA = window.nmEta ? window.nmEta.label('sb') : ' (예상 : 3분 00초)';
  const errPath = outPath.replace(/[^/]+$/, 'error.log');
  let live = true;
  const stop = () => {
    live = false;
    window.clearInterval(disp);
    if (mine()) status.removeAttribute('aria-busy');
    try {
      window.nmJobs.free(JKEY, pid);
    } catch (e) {}
  };
  if (mine()) status.setAttribute('aria-busy', 'true');
  if (mine() && window.nmLoader) status.innerHTML = __nm.h(window.nmLoader('prompting', '제작중…') + '<span class="sbtime nm-shim" style="margin-left:var(--sp-1)"></span>');
  const draw = () => {
    if (!live) return;
    const sec = Math.round((Date.now() - t0) / 1000);
    if (!mine()) {
      if (sec > budget) stop();
      return;
    }
    if (sec > budget) {
      stop();
      status.textContent = '표시 시간 초과 — 생성은 계속 돌고 있을 수 있어. 잠시 뒤 다시 열어봐(바로 재클릭 = 이중 발사)';
      status.classList.add('err');
      return;
    }
    if (window.nmLoader) {
      const bt = status.querySelector('.sbtime');
      if (bt) bt.textContent = fmtSec(sec) + ETA;
    } else status.innerHTML = __nm.h(window.WAIT_SVG + ' 콘티 설계 중… ' + fmtSec(sec) + ETA);
  };
  const disp = window.setInterval(draw, 1000);
  draw();
  const tick = async () => {
    if (!live) return;
    try {
      const er = await window.fetch(errPath + '?t=' + Date.now());
      if (er.ok) {
        const ect = (er.headers.get('content-type') || '').toLowerCase();
        const em = await er.text();
        const eHtml = ect.includes('text/html') || /^\s*<!doctype/i.test(em) || /<html[\s>]/i.test(em.slice(0, 300));
        if (em && em.trim() && !eHtml) {
          const _m = mine();
          stop();
          if (jid) jupd(jid, {
            status: 'err'
          });
          if (!_m) return;
          status.innerHTML = __nm.h(window.ERR_SVG + ' ' + esc(em.trim()));
          status.classList.add('err');
          out.innerHTML = __nm.h('');
          SHOWN = '';
          sbFireGate();
          return;
        }
      }
    } catch (e) {}
    try {
      const r = await window.fetch(outPath + '?t=' + Date.now());
      if (r.ok) {
        const ct = (r.headers.get('content-type') || '').toLowerCase();
        const md = await r.text();
        const isHtml = ct.includes('text/html') || /^\s*<!doctype/i.test(md) || /<html[\s>]/i.test(md.slice(0, 300));
        if (md && md.trim() && !isHtml) {
          const _m = mine();
          stop();
          if (window.nmEta) window.nmEta.done('sb', (Date.now() - t0) / 1000);
          if (!_m) {
            if (jid) jupd(jid, {
              status: 'done'
            });
            sbLand(null, outPath);
            return;
          }
          status.innerHTML = __nm.h(window.OK_SVG + ' 완료 (' + Math.round((Date.now() - t0) / 1000) + 's)');
          try {
            window.localStorage.removeItem(CKEY);
          } catch (e) {}
          await renderOut(md, out, outPath);
          if (jid) jupd(jid, {
            status: 'done'
          });
          sbLand(out, outPath);
          try {
            out.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          } catch (e) {}
          return;
        }
      }
    } catch (e) {}
    if (live) window.setTimeout(tick, 5000);
  };
  tick();
}
function errStatus(m) {
  const s = $('#status');
  if (s) {
    s.textContent = '';
    s.classList.remove('err');
  }
  const g = document.getElementById('go');
  if (!g) return;
  if (!g.dataset.label) g.dataset.label = g.textContent;
  window.clearTimeout(g._errT);
  g.classList.remove('firing');
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
$('#go').onclick = async () => {
  const status = $('#status');
  const g = document.getElementById('go');
  if (_polling() && !g._arm) {
    if (!g.dataset.label) g.dataset.label = g.textContent;
    g.textContent = '진행 중 — 다시 누르면 재발사';
    g._arm = window.setTimeout(() => {
      g._arm = null;
      g.textContent = g.dataset.label;
    }, 4000);
    return;
  }
  if (g._arm) {
    window.clearTimeout(g._arm);
    g._arm = null;
    g.textContent = g.dataset.label || g.textContent;
  }
  if (SHOWN) {
    const used = shotTry()[SHOWN] || 0;
    if (used >= 2) return errStatus('재생성 소진');
    g.classList.remove('firing');
    void g.offsetWidth;
    g.classList.add('firing');
    window.setTimeout(() => g.classList.remove('firing'), 760);
    await fireShoot(SHOWN, sbShoot);
    return;
  }
  status.classList.remove('err');
  $('#out').innerHTML = __nm.h('');
  SHOWN = '';
  const sum = ($('#sumTx') || {}).value.trim(),
    note = $('#scene').value.trim();
  if (!sum && !note) return errStatus('입력 필요');
  const story = [note ? '[지시]\n' + note : '', sum ? '[기사 요약 — 참고 자료]\n' + sum : ''].filter(Boolean).join('\n\n');
  {
    const gb = document.getElementById('go');
    gb.classList.remove('firing');
    void gb.offsetWidth;
    gb.classList.add('firing');
    window.setTimeout(() => gb.classList.remove('firing'), 760);
  }
  $('#go').disabled = true;
  status.textContent = '설계 중…';
  _fired = true;
  try {
    const base = sbBase ? sbBase.out : '';
    const _sbl = (note || sum).replace(/\s+/g, ' ').slice(0, 16) + ((note || sum).length > 16 ? '…' : '');
    const res = await window.fetch('/api/sb', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(Object.assign({
        story,
        base,
        photos: sbPhotos,
        lbl: _sbl
      }, sbPayload()))
    });
    const j = await sbReadJson(res);
    if (!res.ok || j.error) {
      status.innerHTML = __nm.h(window.WARN_SVG + ' ' + esc(String(j.error || res.status)));
      status.classList.add('err');
      return;
    }
    const a = jload();
    a.unshift({
      id: j.id,
      out: j.out,
      ts: Date.now(),
      d: sbDirector,
      sh: sbShoot,
      base: !!base,
      label: _sbl,
      status: 'run'
    });
    jsave(a);
    renderJobs();
    sbBase = null;
    poll(j.out, j.id);
  } catch (e) {
    status.innerHTML = __nm.h(window.WARN_SVG + ' 요청 실패: ' + esc(e.message));
    status.classList.add('err');
  } finally {
    $('#go').disabled = false;
  }
};
(async function bootJobs() {
  sbFireGate();
  renderJobs();
  pollSrvJobs();
  const a = jload();
  if (!a.length) return;
  if (_fired || _polling() || $('#out').innerHTML) return;
  if (a[0].status === 'run') {
    a.filter(j => j && j.status === 'run' && j.out).forEach((j, i) => poll(j.out, j.id, i === 0));
    return;
  }
  const done = a.find(x => x.status === 'done');
  if (done) await loadJob(done);
})();
(function () {
  const rfab = $('#rfab'),
    core = $('#rfabCore'),
    gen = $('#kGenFab'),
    focusFab = $('#kFocusFab'),
    tabFab = $('#kTabFab'),
    rmin = $('#rfabMin');
  if (!rfab || !core) return;
  core.addEventListener('click', e => {
    e.stopPropagation();
    rfab.classList.toggle('open');
  });
  document.addEventListener('click', e => {
    if (!rfab.contains(e.target)) rfab.classList.remove('open');
  });
  if (focusFab) focusFab.addEventListener('click', e => {
    e.stopPropagation();
    rfab.classList.remove('open');
    const s = $('#scene');
    if (s) {
      try {
        s.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      } catch (_) {}
      try {
        s.focus();
      } catch (_) {}
    }
  });
  if (gen) gen.addEventListener('click', e => {
    e.stopPropagation();
    rfab.classList.remove('open');
    const g = $('#go');
    if (g) g.click();
  });
  if (tabFab) {
    if (window.parent === window) {
      tabFab.style.display = 'none';
    } else tabFab.addEventListener('click', e => {
      e.stopPropagation();
      rfab.classList.remove('open');
      try {
        const tabs = [...window.parent.document.querySelectorAll('#toolTabs .tooltab')];
        const i = tabs.findIndex(t => t.classList.contains('on'));
        const next = tabs[(i + 1) % tabs.length];
        if (next) next.click();
      } catch (_) {}
    });
  }
  if (rmin) {
    if (window.parent === window) {
      rmin.style.display = 'none';
    } else rmin.addEventListener('click', e => {
      e.stopPropagation();
      try {
        if (window.parent.minimizeTool) window.parent.minimizeTool();
      } catch (_) {}
    });
  }
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
export const PAGE = {
  path: "/sb.html",
  fonts: FONTS,
  css: [SHEETS["tokens.css"],
    SHEETS["nm-shared.css"],
    SHEETS["nm-clip.css"],
    SHEETS["nm-cards.css"],
    SHEETS["nm-hist.css"],
    SHEETS["nm-job.css"],
    `.nd-root { --well:#0e0f11;    --bg:#121212;    --pan:#16171a; --line:#2a2c31; --hist-accent:#FFE13D; --hist-rgb:255,225,61;    --fg:#eef7f0; --mut:#8fa697; --accent:#00EED2; --accent-rgb:0,238,210;
    --accent-4:#FFE13D; --accent-4-rgb:255,225,61;   
    --danger:#e23b2a; --danger-rgb:226,59,42;    --warn:#FFE13D;    --accent-dim:rgba(var(--accent-rgb),.13); --on-accent:#032322; --line2:rgba(255,255,255,.06); }   
  @media (prefers-reduced-motion:reduce){ .nd-root{ --press-pico:1; --press-xs:1; --press-s:1; --press-m:1; --press-l:1; } }   
  * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }   
  [hidden] { display:none !important; }  nd-html .cscroll { display:none !important; }   
  nd-html { scrollbar-width:none; -ms-overflow-style:none; scrollbar-color:rgba(255,255,255,.05) transparent; }  * { scrollbar-width:none; }   
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.05); border-radius:var(--r-pill);
    border:1px solid var(--bg); background-clip:padding-box; }   
  nd-body { margin:0; background:radial-gradient(125% 70% at 50% -8%, rgba(var(--accent-rgb),.06), transparent 55%) fixed, var(--bg); color:var(--fg); font:15px/1.6 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; letter-spacing:-.2px ; -webkit-font-smoothing:antialiased; }  .wrap { max-width:600px; margin:0 auto; padding:var(--sp-3) 16px 70px; }   
  label { display:block; font-size:var(--fs-label); color:var(--fg); margin:14px 0 var(--sp-1); }   
  label.fl { font-weight:var(--fw-x); color:var(--fg); }
  .fl:has(button) { display:flex; align-items:center; gap:8px; }      
  #sumPull { transform:translateY(-1px) ; }
  #sumPull:active { transform:translateY(-1px) scale(var(--press-s)); }   
  label.fl::before { content:'•'; margin-right:6px ; color:var(--accent); font-weight:var(--fw-b); }   
  label:first-of-type { margin-top:0; }
  textarea { width:100%; min-height:64px ; padding:var(--sp-2); background:var(--well); border:1px solid var(--line); border-radius:var(--r-s); color:var(--fg); font:inherit; font-size:16px; resize:none; }   
  textarea:focus, input:focus { border-color:rgba(var(--accent-rgb),.35); box-shadow:0 0 0 3px rgba(var(--accent-rgb),.08); outline:none; }
  textarea::placeholder, input::placeholder { color:var(--mut); }
  .scnwrap { position:relative; }
  .go { width:100%; margin-top:2px; padding:var(--sp-1); background:rgba(255,255,255,.02); color:var(--accent); border:1px solid var(--line); border-radius:var(--r-m); font-weight:800; font-size:var(--fs-label); font-family:inherit; line-height:1; cursor:pointer; position:relative; overflow:hidden; -webkit-tap-highlight-color:transparent; -webkit-user-select:none; user-select:none; transition:transform var(--dur-fast) ease, background var(--dur) ease, border-color var(--dur) ease; }  .go:disabled { opacity:.5; cursor:default; transform:none; }
  .go.shake { animation:edshake .42s; }
  @media (prefers-reduced-motion:reduce) { .go.shake { animation:none; } }
  .go.err { background:rgba(var(--danger-rgb),.14); color:var(--danger); border-color:var(--danger); }
  @keyframes edshake { 0%,100%{transform:translateX(0)} 18%{transform:translateX(-4px)} 38%{transform:translateX(4px)} 58%{transform:translateX(-3px)} 78%{transform:translateX(2px)} }  @keyframes goFill { from { background-size:0% 100%, 100% 100%; } to { background-size:100% 100%, 100% 100%; } }
  @media (prefers-reduced-motion:reduce) { .go.firing { animation-duration:.2s; } }
  .cref-lbl { font-size:var(--fs-label); font-weight:var(--fw-x); color:var(--fg); }   
  .geni-sechead { display:flex; align-items:center; gap:8px; width:100%; padding:var(--sp-2) 0 var(--sp-1); background:none; border:none; border-bottom:1px solid var(--line2); text-align:left; -webkit-tap-highlight-color:transparent; }   
  .geni-sechead .cref-lbl::before { content:'•'; margin-right:6px ; color:var(--accent); font-weight:var(--fw-b); }   
  .geni-row { display:flex; align-items:baseline; justify-content:space-between; gap:var(--sp-2); padding:8px 0; }   
  .pub-l { font-size:var(--fs-label); font-weight:var(--fw-b); color:var(--fg); white-space:nowrap; }   
  .geni-opts { display:flex; flex-wrap:wrap; gap:3px 4px; justify-content:flex-end; min-width:0; }   
  .geni-opt { background:none; border:none; padding:6px 7px; font-family:inherit; font-size:var(--fs-label); font-weight:var(--fw-b); color:var(--mut); cursor:pointer; white-space:nowrap; transition:color var(--dur); -webkit-tap-highlight-color:transparent; }   
  .geni-opt:active { transform:scale(var(--press-m)); }
  #sbArWrap { display:none; }
  #sbArWrap.open { display:inline-flex; }
  .geni-ar { display:flex; align-items:center; gap:0 ; justify-content:flex-end; flex:0 0 auto; min-width:0; }
  .geni-ar-in { box-sizing:content-box; width:1ch ; background:none; border:none; outline:none; border-radius:0; -webkit-appearance:none; appearance:none;
    padding:6px 7px ; font-family:inherit; font-size:var(--fs-label); font-weight:var(--fw-x); color:var(--accent) ;
    line-height:normal; text-align:center; font-variant-numeric:tabular-nums; -webkit-tap-highlight-color:transparent; }
  .geni-ar-in:focus { border-color:transparent; box-shadow:none; }   
  .geni-ar-in::selection { background:rgba(var(--accent-rgb),.26); color:var(--accent); }
  .geni-ar-c { color:var(--mut); font-weight:var(--fw-x); font-size:var(--fs-label); }
  .geni-opt.on { color:var(--accent); font-weight:var(--fw-x); }
  .geni-opt.qro { cursor:default; }   
  .geni-opt[data-num] { font-variant-numeric:tabular-nums; }  .ogrid .geni-row.rowtap { cursor:pointer; }   
  .geni-opts.lenopts { flex:1 1 auto; flex-wrap:nowrap; align-items:center; gap:7px ; }
  .lenrule { position:relative; flex:1 1 auto; min-width:0; user-select:none; -webkit-user-select:none; }
  .lenrule-lbls { position:relative; height:calc(var(--fs-xs) * var(--lh-base)) ; margin-bottom:3px ; color:var(--mut); font-size:var(--fs-xs); font-variant-numeric:tabular-nums; }
  .lenrule-lbls i { position:absolute; top:0; font-style:normal; transform:translateX(-50%); transition:color var(--dur) ease; }   
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
  .geni-opt:disabled { opacity:.28; pointer-events:none; }   
  .bpop { position:fixed; z-index:var(--z-remote); min-width:140px; max-width:230px;
    background:linear-gradient(165deg, rgba(22,23,25,.34), rgba(12,13,14,.42)) ; backdrop-filter:blur(24px) saturate(1.3) ; -webkit-backdrop-filter:blur(24px) saturate(1.3) ;
    border:1px solid var(--line); border-radius:15px ; padding:11px 15px ; box-shadow:0 18px 46px rgba(0,0,0,.6) ;
    display:flex; flex-direction:column; gap:3px ; animation:popInCx .16s var(--gauge-ease) both; }
  @keyframes popInCx { from { opacity:0; transform:translateY(6px) scale(.985); } to { opacity:1; transform:none; } }
  .qpop { width:min(94cqw,440px); max-width:94cqw; min-width:0; overflow:hidden; padding:11px 11px 11px 16px ; }
  .qpop .qh { display:flex; align-items:center; gap:6px ; margin:-11px -11px 0 -16px; padding:12px 14px 12px 18px ; flex:none; background:var(--modal-head-bg, rgba(24,25,28,.85)) ; backdrop-filter:blur(var(--blur-l)) saturate(1.2); -webkit-backdrop-filter:blur(var(--blur-l)) saturate(1.2); border-bottom:1px solid var(--line2); }
  .qpop .qh b { font-size:var(--fs-h2); font-weight:var(--fw-x); margin-right:2px ; padding:0; }
  .qpop .qh-xcell { margin-left:auto; width:var(--btn-sm); flex:none; display:flex; align-items:center; justify-content:center; }
  .qpop .qh .tool-x svg { stroke:currentColor; }
  .tool-x { width:30px; height:30px ; flex:none; display:grid; place-items:center; background:rgba(255,255,255,.06) ;
    color:var(--fg); border:1px solid var(--line); border-radius:9px ; cursor:pointer; }
  .tool-x:hover { color:var(--accent); border-color:rgba(var(--accent-rgb),.4); }
  .qpop .qlist { margin-top:8px ; display:flex; flex-direction:column; flex:0 1 calc(5 * 47px) ; min-height:0; overflow-y:auto; }
  .qpop { background:var(--modal-glass-anchor, rgba(17,18,20,.42)) ; backdrop-filter:blur(24px) saturate(1.05) ; -webkit-backdrop-filter:blur(24px) saturate(1.05) ; }
  .qpop { line-height:1.5 ; }
  .qrow:first-child { border-top:none; }   
  .qrow { display:flex; align-items:center; gap:10px ; padding:8px 3px ; border-top:1px solid var(--line2); }
  .qrow .qt { flex:none; width:64px ; font-size:var(--fs-xs); font-weight:800 ; color:var(--mut); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .qrow .qmain { flex:1; min-width:0; font-size:12.5px ; color:var(--fg); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .qrow .qact { flex:none; width:var(--btn-sm); display:flex; align-items:center; justify-content:center; }
  .qgo { flex:none; width:30px; height:30px ; display:grid; place-items:center; border-radius:8px ; border:1px solid var(--line);
    background:transparent; cursor:pointer; transition:transform .1s var(--ease); -webkit-tap-highlight-color:transparent; }
  .qgo:active { transform:scale(var(--press-m)); }
  .qgo svg { width:15px; height:15px ; }
  .qpage { flex:none; display:flex; align-items:center; justify-content:center; gap:4px ; margin-top:10px ; flex-wrap:wrap; min-height:30px ; }
  .qempty { padding:16px 6px ; text-align:center; color:var(--mut); font-size:12px ; line-height:1.55 ; }
  .qpop .qlist .qrow { animation:cardIn .32s var(--gauge-ease) both; }
  .qpop .qlist .qrow:nth-child(2){ animation-delay:.05s } .qpop .qlist .qrow:nth-child(3){ animation-delay:.1s }
  .qpop .qlist .qrow:nth-child(4){ animation-delay:.15s } .qpop .qlist .qrow:nth-child(n+5){ animation-delay:.2s }
  @keyframes cardIn { from { opacity:0; transform:translateY(7px); } to { opacity:1; transform:none; } }
  @media (prefers-reduced-motion:reduce){ .bpop, .qpop .qlist .qrow { animation:none; } }
  .qrow.artrow { cursor:pointer; }
  .qrow.artrow .qmain:hover { color:var(--accent); }
  .artdim { position:fixed; inset:0; z-index:var(--z-remote); background:rgba(0,0,0,.35) ; }
  .geni-railrow .pub-l { flex:0 0 max(80px, calc(4em + 12px)); }   
  .geni-railwrap { flex:1 1 0; min-width:0; display:flex; align-items:center ; background:rgba(255,255,255,.03) ; border-radius:var(--r-m); padding:7px 10px ; }
  .geni-railwrap.edge { border-left:1px solid var(--line2); padding-left:var(--sp-1); }   
  #sbStyle.geni-rail, #sbSub.geni-rail { flex:1 1 0; min-width:0; flex-wrap:nowrap; justify-content:flex-start; overflow-x:auto; overflow-y:hidden; -ms-overflow-style:none; scrollbar-width:none; cursor:grab; touch-action:pan-x pan-y; --rail-fade:22px; -webkit-mask-image:linear-gradient(90deg,transparent 0,black var(--rail-fade),black calc(100% - var(--rail-fade)),transparent 100%); mask-image:linear-gradient(90deg,transparent 0,black var(--rail-fade),black calc(100% - var(--rail-fade)),transparent 100%); }   
  #sbStyle.geni-rail::-webkit-scrollbar, #sbSub.geni-rail::-webkit-scrollbar { display:none; }
  #sbStyle.geni-rail.grabbing, #sbSub.geni-rail.grabbing { cursor:grabbing; }
  #sbStyle.geni-rail.atStart, #sbSub.geni-rail.atStart { -webkit-mask-image:linear-gradient(90deg,black 0,black calc(100% - var(--rail-fade)),transparent 100%); mask-image:linear-gradient(90deg,black 0,black calc(100% - var(--rail-fade)),transparent 100%); }   
  #sbStyle.geni-rail.atEnd, #sbSub.geni-rail.atEnd { -webkit-mask-image:linear-gradient(90deg,transparent 0,black var(--rail-fade),black 100%); mask-image:linear-gradient(90deg,transparent 0,black var(--rail-fade),black 100%); }
  #sbStyle.geni-rail.atStart.atEnd, #sbSub.geni-rail.atStart.atEnd { -webkit-mask-image:none; mask-image:none; }   
  .geni-subit { display:inline-flex; align-items:center; gap:4px ; }   
  .geni-sep { font-size:var(--fs-label); font-weight:var(--fw-b); color:var(--mut); opacity:.35; pointer-events:none; }   
  .geni-navs { display:none; flex:0 0 auto; align-items:center; margin-left:2px ; }
  @media (hover:hover) and (pointer:fine) { .geni-navs { display:flex; } }   
  .geni-nav { width:17px ; height:22px ; display:grid; place-items:center; background:none; border:none; color:var(--mut); cursor:pointer; padding:0; border-radius:var(--r-s); transition:color var(--dur), background var(--dur); -webkit-tap-highlight-color:transparent; }
  .geni-nav svg { width:11px ; height:11px ; }
  .geni-nav[disabled] { opacity:.28; pointer-events:none; }
  #sbSub .geni-subit { animation:geniSubIn .22s var(--ease) backwards; animation-delay:calc(var(--i, 0)*.04s); }   
  @keyframes geniSubIn { from { opacity:0; transform:translateY(7px); } to { opacity:1; transform:none; } }
  @media (prefers-reduced-motion:reduce) { #sbSub .geni-subit { animation:none; } }
  :where(.topdock) .go { border-color:rgba(255,255,255,.2); }   
  .topdock { position:sticky; top:0; z-index:6; margin:-18px -16px 0 ; padding:var(--sp-2) 16px 0 ; background:rgba(18,18,18,1) ; border-bottom:1px solid rgba(var(--accent-rgb),.35) ; --line:rgba(255,255,255,.15) ; }      
  .topdock::after { content:none; }   
  .optstrip { margin:16px 0 var(--sp-2) ; padding:8px 13px ; background:#000 ; border:1px solid var(--line); border-radius:var(--r-s); }
  nd-html.modern-ui-frame .optstrip { background:var(--modern-control-glass, var(--well)); border-color:var(--modern-line, var(--line)); box-shadow:var(--modern-panel-inset, none); }   
  .optstrip .gospec { margin:0; padding:0; font-size:11.25px ; line-height:1.9; text-align:left; color:var(--mut);  white-space:nowrap; overflow-x:auto; scrollbar-width:none; -webkit-overflow-scrolling:touch; }
  .optstrip .gospec::-webkit-scrollbar, .optstrip .geni-sum::-webkit-scrollbar { display:none; }   
  .optstrip .gs-l1 { display:block; white-space:nowrap; overflow-x:auto; scrollbar-width:none; }
  .optstrip .gs-l1::-webkit-scrollbar { display:none; }  .gospec .gs-lbl { color:var(--mut); font-weight:var(--fw-b); }
  .gospec .gs-v { color:var(--mut); }
  .gospec .gs-v.on { color:var(--accent); font-weight:var(--fw-b); }   
  .gospec .gs-tog { cursor:pointer; -webkit-tap-highlight-color:transparent; transition:color var(--dur) ease; padding:0 1px ; -webkit-user-select:none; user-select:none; -webkit-touch-callout:none; }
  .gospec .gs-tog:active { transform:scale(var(--press-m)); }   
  .gospec .gs-v.gs-locked { opacity:.5 ; cursor:default; }   
  .gospec .gs-v.gs-locked:active { transform:none; }   
  .gospec .gs-v.on.gs-locked { opacity:1; }  
  .trailwrap > .trail-fire { margin:0; }
  .trailwrap > .trail-fire .go, .trailwrap > .trail-fire.go { margin:0; }
  .cpprev-box > .pvfire, .mon > .pvfire { position:absolute; left:var(--sp-2); right:var(--sp-2); bottom:var(--sp-2); width:auto ; z-index:4; margin:0; }
  .cpprev-box > .pvfire .go, .mon > .pvfire .go, .cpprev-box > .pvfire.go, .mon > .pvfire.go { margin:0; }   
  .firebar .go { margin:0; }   
  .topdock #go, .topdock .go { border-radius:var(--r-s) ; min-height:30px ; backdrop-filter:blur(var(--blur-s)); -webkit-backdrop-filter:blur(var(--blur-s)); }   
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
  .cpv-empty.has .cpv-photobtn { display:none; }   
  .cpv-stage img.cpv-bg { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; display:block; }   
  .cpv-stage img.cpv-bg[hidden] { display:none; }   
  .cpv-empty.has .cpv-wait { display:none; }   
  .optstrip .geni-sum { padding:0; text-align:left; line-height:1.9; white-space:nowrap; overflow-x:auto; scrollbar-width:none; -webkit-overflow-scrolling:touch; }
  .optstrip .geni-sum .gs-row { display:inline; }   
  .optstrip .geni-sum .gs-row + .gs-row::before { content:'|'; color:var(--mut); opacity:.45; font-weight:400; margin:0 5px ; }      
  .geni-sum { color:var(--mut); font-size:var(--fs-label); font-weight:var(--fw-b); line-height:1.5; padding:8px 2px; text-align:right; font-variant-numeric:tabular-nums; }   
  .geni-sum b { color:var(--fg); font-weight:var(--fw-b); }
  .geni-sum .gs-row { display:block; }   
  .jobs { display:flex; flex-direction:column; gap:var(--sp-1); margin:10px 0 0; }   
  .job .jlab { font-weight:800; color:var(--accent); cursor:pointer; }   
  .job .jlab:active { transform:scale(var(--press-l,.95)); }
  .job .jvar { color:var(--fg); font-weight:400; }   
  .job .jst { margin-left:auto; color:var(--mut); white-space:nowrap; display:inline-flex; align-items:center; gap:5px; }   
  .job .jst svg { display:block; width:14px; height:14px; flex:none; }
  .job .jst .jspin { animation:sbspin .9s linear infinite; }
  @keyframes sbspin { to { transform:rotate(360deg); } }
  @media (prefers-reduced-motion:reduce){ .job .jst .jspin { animation:none; } }
  .job.err { border-color:rgba(var(--danger-rgb),.4); } .job.err .jst { color:var(--danger); }
  .job .jmore { flex:none; display:inline-flex; align-items:center; gap:5px; font-weight:800; font-size:10.5px; line-height:1; cursor:pointer; white-space:nowrap; border-radius:var(--r-pill); padding:6px 11px; backdrop-filter:blur(var(--blur-s)); -webkit-backdrop-filter:blur(var(--blur-s)); transition:transform var(--dur-fast), background var(--dur), color var(--dur), border-color var(--dur); color:var(--accent); background:rgba(var(--accent-rgb),.08); border:1px solid rgba(var(--accent-rgb),.34); }   
  .job .jmore:hover { background:rgba(var(--accent-rgb),.18); color:var(--fg); border-color:rgba(var(--accent-rgb),.6); }
  .job .jmore:active { transform:scale(var(--press-l,.95)); }
  .job .jdel { flex:none; display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; color:rgba(255,255,255,.6); cursor:pointer; background:rgba(255,255,255,.05); border:1px solid var(--line); border-radius:8px; transition:transform var(--dur-fast), background var(--dur), color var(--dur), border-color var(--dur); }   
  .job .jdel:hover { background:rgba(var(--danger-rgb),.18); color:var(--danger); border-color:rgba(var(--danger-rgb),.5); }
  .job .jdel:active { transform:scale(var(--press-s,.85)); }
  .job .jdel svg { display:block; width:14px; height:14px; }
  .ref { margin:0 0 16px; }   
  .ref img, .ref video { width:100%; border:1px solid var(--line); border-radius:10px; display:block; }   
  .ref.multi img { margin-bottom:8px ; }   
  .ref .cap { color:var(--mut); font-size:12px; margin-top:5px; }   
  .refmiss { color:var(--warn); font-size:12px; border:1px dashed var(--line); border-radius:var(--r-s); padding:8px 10px; margin:0 0 8px; }   
  .status { margin-top:16px; font-size:13px; color:var(--mut); white-space:pre-wrap; }   
  .status.err { color:var(--danger); }
  .out { margin-top:var(--sp-3); }
  .out h1.t { font-size:20px; color:var(--fg); margin:var(--sp-3) 0 var(--sp-1); }   
  .out h2 { font-size:16px; color:var(--accent); margin:var(--sp-3) 0 var(--sp-1); }   
  .out h3 { font-size:14px; color:var(--fg); margin:16px 0 var(--sp-1); }   
  .out p { margin:var(--sp-1) 0; color:var(--mut); }
  .out p.legend { color:var(--fg); }   
  .code { position:relative; background:var(--well); border:1px solid var(--line); border-radius:10px; margin:8px 0 14px; }   
  .code pre { margin:0; padding:13px; white-space:pre-wrap; word-break:break-word; font:14px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace; color:#eef7f0; }  .code button svg { display:block; }
  .code button:hover { background:rgba(255,255,255,.16); }
  .code button:active { transform:scale(var(--press-s,.85)); }  nd-html.inmodal, nd-html.inmodal nd-body { background:transparent; }   
  #rfab { position:fixed; right:18px; bottom:34%; z-index:70; width:0; height:0; }
  #rfab .rc { position:absolute; right:0; bottom:0; width:54px; height:54px; border-radius:50%; cursor:pointer;
    background:rgba(0,0,0,.34); color:var(--accent); border:1px solid rgba(var(--accent-rgb),.4); display:grid; place-items:center;
    backdrop-filter:blur(14px) saturate(1.3); -webkit-backdrop-filter:blur(14px) saturate(1.3);
    box-shadow:0 10px 26px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.12);
    transition:transform .25s; -webkit-tap-highlight-color:transparent; }
    #rfab.open .rc { transform:rotate(135deg); }
  #rfab .rc:active { transform:scale(var(--press-m)); }
  #rfab.open .rc:active { transform:rotate(135deg) scale(var(--press-m)); }
  #rfab .rc svg { width:26px; height:26px; stroke:currentColor; stroke-width:2.6; fill:none; stroke-linecap:round; }
  #rfab .ro { position:absolute; right:7px; bottom:7px; width:35px; height:35px; border-radius:50%; cursor:pointer; color:var(--accent);
    background:rgba(0,0,0,.34); border:1px solid rgba(var(--accent-rgb),.4); backdrop-filter:blur(14px) saturate(1.3); -webkit-backdrop-filter:blur(14px) saturate(1.3);
    display:grid; place-items:center; box-shadow:0 6px 16px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.1);
    opacity:0; transform:translate(0,0) scale(.3); pointer-events:none;
    transition:transform .32s cubic-bezier(.2,.9,.3,1.25), opacity .22s; -webkit-tap-highlight-color:transparent; }
  #rfab .ro svg { width:18px; height:18px; stroke:currentColor; stroke-width:1.9; fill:none; stroke-linecap:round; stroke-linejoin:round; }
  #rfab .ro[hidden] { display:none; }   
  #rfab #kFocusFab { --rp:translate(-66px,-2.5px); }
  #rfab #kGenFab   { --rp:translate(-47.4px,-47.4px); }
  #rfab #kTabFab   { --rp:translate(-2.5px,-66px); }
  #rfab.open .ro { opacity:1; pointer-events:auto; transform:var(--rp,translate(0,-66px)) scale(1); }
  #rfab.open #kGenFab { transition-delay:.06s; }
  #rfab.open #kTabFab { transition-delay:.12s; }
  #rfab .ro:active { transform:var(--rp,translate(0,-66px)) scale(var(--press-m,.9)); }
  #rfab .rmin { position:absolute; right:13px; bottom:62px; width:28px; height:28px; border-radius:50%; cursor:pointer; color:var(--accent);
    background:rgba(0,0,0,.34); border:0; display:grid; place-items:center;
    backdrop-filter:blur(14px) saturate(1.3); -webkit-backdrop-filter:blur(14px) saturate(1.3);
    transition:transform .32s cubic-bezier(.2,.9,.3,1.25), opacity .22s; -webkit-tap-highlight-color:transparent; }
  #rfab .rmin svg { width:15px; height:15px; stroke:currentColor; stroke-width:2.6; fill:none; stroke-linecap:round; transition:transform var(--dur-fast) cubic-bezier(.2,.9,.3,1.25); }
  #rfab .rmin:active svg { transform:scale(var(--press-pico,.72)); }
  #rfab.open .rmin { opacity:0; transform:translateY(8px) scale(.3); pointer-events:none; }
  @media (prefers-reduced-motion:reduce){ #rfab .rc,#rfab .ro,#rfab .rmin { transition:opacity var(--dur); } #rfab.open .ro{ transform:var(--rp,translate(0,-66px)); } #rfab.open .rmin{ transform:none; } #rfab .rmin:active svg{ transition:transform .09s; } }
  @media (hover:hover) and (pointer:fine) { #rfab { display:none; } }   
  nd-html.inmodal .wrap { max-width:none; }   
  @container nd (min-width:900px) {
    nd-html.inmodal .wrap { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); column-gap:var(--sp-3); align-items:start; }
    nd-html.inmodal .wrap > * { grid-column:1; }
    nd-html.inmodal .wrap > .out-col { grid-column:2; grid-row:1 / span 99; align-self:start;
      position:sticky; top:var(--sp-3); max-height:calc(100cqh - var(--sp-3)); overflow-y:auto; overscroll-behavior:contain; }   
    nd-html.inmodal .topdock { margin-right:0; } }`,
    `nd-html{scrollbar-width:thin}nd-html::-webkit-scrollbar,nd-body::-webkit-scrollbar{width:10px;height:10px;display:block}`,
    SHEETS["nm-scene-tokens.css"],
    SHEETS["nm-scene.css"]],
  scheme: "dark",
  htmlAttrs: {"lang":"ko"},
  bodyAttrs: {},
  html: `<div class="wrap">
  <div class="topdock" id="topDock">
    <div class="pvsec"><div class="cpprev-box"><div class="cpv-empty" id="pvEmpty"><div class="cpv-stage"><img class="cpv-bg" id="pvImg" hidden alt=""><input type="file" id="pvFile" accept="image/jpeg,image/png,image/webp" multiple hidden><button type="button" class="cpv-photobtn" id="pvPick" aria-label="콘티 참조 사진 첨부(최대 3장)" title="콘티 참조 사진 첨부(최대 3장) — 감독이 실물을 보고 인물 시트의 얼굴 정본이 된다"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="8.5" cy="9.5" r="1.5"></circle><path d="M21 16l-5-5L5 20"></path></svg></button></div></div></div><div class="trailwrap" id="cpRailWrap"><nav class="trail" id="cpZoomRail" aria-label="미리보기 확대"><button type="button" class="trail-i" id="cpZoom" aria-pressed="false" aria-label="미리보기 확대" title="탭=미리보기 확대 · 다시 탭=원상복귀"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/><path d="M8 11h6"/><path class="cpz-v" d="M11 8v6"/></svg></button></nav><nav class="trail trail-opts" id="cpRail" aria-label="미리보기 옵션"><span class="trail-g"><button type="button" class="cpv-tool" id="pvSwap" disabled aria-label="참조 사진 교체" title="참조 사진 교체(다시 고르기)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></button><button type="button" class="cpv-tool" id="pvDel" disabled aria-label="참조 사진 삭제" title="참조 사진 삭제(전부)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button></span><span class="trail-div"></span><div class="trail-v" id="railOpts"><div class="gospec" id="railSpec"></div></div></nav><div class="firebar trail-fire"><div class="inner"><button class="go" id="go">생성</button></div></div></div></div>
  </div>
    <div class="optstrip" id="optStrip"><div class="geni-sum gospec" id="gospec"></div></div>
    <label class="fl">자료 참조 <button type="button" class="sbtn cref-dlall" id="sumPull" title="수집한 기사를 끌어온다 — 탭할 때마다 최근 기사부터 다음 건으로" aria-label="기사 불러오기"></button></label>
    <div class="scnwrap"><textarea id="sumTx" maxlength="8000" aria-label="자료 참조" placeholder="기사를 끌어오거나 자료를 붙여넣는다"></textarea><button class="scnclip" id="sumClip" type="button" aria-label="붙여넣기"></button></div>
    <label class="fl">연출 목적</label>
    <div class="scnwrap"><textarea id="scene" maxlength="8000" aria-label="연출 목적" placeholder="무엇을 보여주려고 하는가 — 보는 사람이 무엇을 느끼고 무엇을 알고 가야 하는지"></textarea><button class="scnclip" id="sceneClip" type="button" aria-label="붙여넣기"></button></div>
  <div class="geni-sechead"><span class="cref-lbl">설계</span></div>
  <div class="ogrid">
  <div class="geni-row"><span class="pub-l">감독</span><span class="geni-opts" id="dgrid" role="group" aria-label="감독 — 연출 모델"></span></div>
  <div class="geni-row"><span class="pub-l">촬영</span><span class="geni-opts" id="sgrid" role="group" aria-label="촬영 — 생성 엔진"></span></div>
  <div class="geni-row rowtap" data-rowtap="refTg"><span class="pub-l">콘티</span><span class="geni-opts" role="group" aria-label="콘티 — 레퍼런스 이미지 엔진"><button type="button" class="geni-opt on" id="refTg" aria-pressed="true" title="레퍼런스 이미지 생성(Gemini 종량제) — Seedance는 발사 필수 재료라 강제 · 켜짐=글자 점등">Gemini 3.1 Flash</button></span></div>
  <div class="geni-row geni-railrow"><span class="pub-l">화풍</span><div class="geni-railwrap edge"><span class="geni-opts geni-rail" id="sbStyle" role="group" aria-label="화풍"></span><div class="geni-navs"><button type="button" class="geni-nav" data-dir="-1" aria-label="이전"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button><button type="button" class="geni-nav" data-dir="1" aria-label="다음"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button></div></div></div>
  <div class="geni-row geni-railrow"><span class="pub-l">세부 화풍</span><div class="geni-railwrap edge"><span class="geni-opts geni-rail" id="sbSub" role="group" aria-label="세부 화풍"></span><div class="geni-navs"><button type="button" class="geni-nav" data-dir="-1" aria-label="이전"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button><button type="button" class="geni-nav" data-dir="1" aria-label="다음"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button></div></div></div>
  <div class="geni-row"><span class="pub-l">비율</span><span class="geni-opts" id="axRatio" role="group" aria-label="비율"></span><span class="geni-ar" id="sbArWrap" inert><input id="sbArW" class="geni-ar-in" type="text" inputmode="numeric" maxlength="2" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="비율 가로값"><b class="geni-ar-c" aria-hidden="true">:</b><input id="sbArH" class="geni-ar-in" type="text" inputmode="numeric" maxlength="2" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="비율 세로값"></span></div>
  <div class="geni-row"><span class="pub-l">화질</span><span class="geni-opts" id="axQ" role="group" aria-label="화질"></span></div>
  <div class="geni-row"><span class="pub-l">길이</span><span class="geni-opts lenopts"><div class="lenrule" id="axLen" role="group" aria-label="길이 — 5초부터 15초까지 1초 눈금"></div><span class="lenrule-v" id="axLenV" aria-live="polite"></span></span></div>
  <div class="geni-row rowtap" data-rowtap="sndTg"><span class="pub-l"></span><span class="geni-opts" role="group" aria-label="소리 — 영상 오디오 트랙"><button type="button" class="geni-opt on" id="sndTg" aria-pressed="true" title="켜짐 = 영상에 소리를 담는다 · 꺼짐 = 산출 트랙 자체를 뺀다(프롬프트 무음 지시가 아니라 확정 제거) · 촬영=Grok 전용">소리</button></span></div>
  <div class="geni-row rowtap" data-rowtap="adTg"><span class="pub-l"></span><span class="geni-opts"><button type="button" class="geni-opt" id="adTg" aria-pressed="false" title="켜짐 = 마지막 컷을 제품·슬로건 키비주얼로 (storyboard-v1 하드룰) · 켜짐=글자 점등">광고 모드</button></span></div>
  </div>
  <div class="status" id="status"></div>
  <div class="out" id="out"></div>
  <div class="geni-sechead" id="jobsHead" hidden><span class="cref-lbl">작업 내역</span></div>
  <div class="jobs" id="jobs"></div>
</div>
<div id="rfab" aria-label="빠른 메뉴">
  <button class="ro" id="kFocusFab" type="button" title="입력칸으로 (커서 활성화)"><svg viewBox="0 0 24 24"><path d="M7 10l5-5 5 5M7 14l5 5 5-5"/></svg></button>
  <button class="ro" id="kGenFab" type="button" title="스토리보드 생성"><svg viewBox="0 0 24 24"><path d="M5 3l14 9-14 9z"/></svg></button>
  <button class="ro" id="kTabFab" type="button" title="다음 도구 탭으로 전환"><svg viewBox="0 0 24 24"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg></button>
  <button class="rc" id="rfabCore" type="button" aria-label="빠른 메뉴 열기"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>
  <button class="rmin" id="rfabMin" type="button" aria-label="최소화" title="최소화 (창 접기)"><svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg></button>
</div>
<div class="artdim" id="artDim" hidden></div>
<div class="bpop qpop" id="artPop" hidden role="dialog" aria-modal="true" aria-label="기사 고르기">
  <div class="qh"><b>기사 고르기</b><span class="qh-xcell"><button class="tool-x" id="artX" type="button" aria-label="닫기" title="닫기"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6 18 18M18 6 6 18"/></svg></button></span></div>
  <div class="qlist" id="artList"></div>
  <div class="qpage" id="artPage"></div>
<script type="text/nm-off" data-nm-i="3" src="/nm-svg.js"></script><script type="text/nm-off" data-nm-i="4" src="/nm-ua.js"></script>
<script type="text/nm-off" data-nm-i="5" src="/nm-rail.js" data-scope="cap" data-dlname="storyboard.jpg" data-jobkey="sb_jobs" data-srv="api/caphist?recent=48"></script>
<script type="text/nm-off" data-nm-i="6" src="/nm-models.js"></script>
<script type="text/nm-off" data-nm-i="7" src="/nm-styles.js"></script>
<script type="text/nm-off" data-nm-i="8" src="/nm-jobs.js"></script>
<script type="text/nm-off" data-nm-i="9" src="/nm-sync.js"></script>
<script type="text/nm-off" data-nm-i="10" src="/nm-loader.js"></script>
<script type="text/nm-off" data-nm-i="11" src="/draft.js"></script>
<script type="text/nm-off" data-nm-i="12"></script>
<script type="text/nm-off" data-nm-i="13" src="/cscroll.js"></script>
</div>`,
  headTags: `<script type="text/nm-off" data-nm-i="0"></script><script type="text/nm-off" data-nm-i="1" src="/nm-wave.js"></script><script type="text/nm-off" data-nm-i="2" src="/nm-scene.js"></script>`,
  scripts: [{ run: inline1 },
    { src: "nm-wave.js", defer: true, run: LIB["nm-wave.js"] },
    { src: "nm-scene.js", defer: true, run: LIB["nm-scene.js"] },
    { src: "nm-svg.js", run: LIB["nm-svg.js"] },
    { src: "nm-ua.js", defer: true, run: LIB["nm-ua.js"] },
    { src: "nm-rail.js", run: LIB["nm-rail.js"] },
    { src: "nm-models.js", run: LIB["nm-models.js"] },
    { src: "nm-styles.js", run: LIB["nm-styles.js"] },
    { src: "nm-jobs.js", run: LIB["nm-jobs.js"] },
    { src: "nm-sync.js", run: LIB["nm-sync.js"] },
    { src: "nm-loader.js", run: LIB["nm-loader.js"] },
    { src: "draft.js", run: LIB["draft.js"] },
    { run: inline2 },
    { src: "cscroll.js", run: LIB["cscroll.js"] }],
};
