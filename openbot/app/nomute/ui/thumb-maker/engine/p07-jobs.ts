// @ts-nocheck
// 썸네일 생성기 엔진 · 대기열(JOBS)·진행 타일·잡 카드·폴링
//   원본 = 에디터 viewer/thumb.html 3768~4243줄(origin/main c430e4c9f) — 줄 그대로 옮김 · 주석만 뺌(까닭·형 말은 원본 주석에 그대로)
//   바꾼 곳 = 화면 전역 let·var·표 const → S.<이름>(./state · 창 열 때마다 새로) · document·window·타이머 = ./rt(이 화면 뿌리 안으로 · 닫으면 다 걷음) · 함수는 그대로 내보내고 서로 가져옴
//   다시 맞출 땐 ../tools/codemod.mjs 로 원본 줄을 통째로 다시 뗌(손으로 고친 줄 0 · 원본 갈아 끼우는 함수 selApp·updateGoSpec = S 에 올림 · hoist())
import { S } from "./state";
import { Image, MutationObserver, clearInterval, clearTimeout, document, fetch, parent, requestAnimationFrame, setTimeout, window } from "./rt";
import { CHECK_SVG, DOWNLOAD_SVG, EDIT_SVG, RETRY_SVG, TRASH_SVG, WARN_SVG } from "./svg";
import { $, upsRefire } from "./p01-core";
import { PLUS_SVG, XCLOSE_SVG, dlAllSeq, dlMark, dlSeen, genJob, genRefire, rszRefire, rszRunning, rszWait } from "./p04-media";
import { canEditSrc, editOpenSrc } from "./p06-draft";
import { JFMT, carAppend, carJump, dlBlob, dlSlug, histTime, jobFace, jobNo, jobNo3, jobShowCar, pad3, srvSrcOf, stripOpa } from "./p08-results";
import { carHSync, saveLastResult } from "./p09-restore";
import { esc } from "./p10-cards";
import { dispatchBatch, dispatchJob, goFire } from "./p11-fit";

export const JOBSEQ_KEY = 'nomute_jobseq';
export function jobSeqIssue() {
  if (window.nmSeq && nmSeq.issue) { S.JOBSEQ = nmSeq.issue(); return S.JOBSEQ; }
  let v = 0; try { v = parseInt(localStorage.getItem(JOBSEQ_KEY), 10) || 0; } catch (e) {}
  if (v < S.JOBSEQ) v = S.JOBSEQ;
  S.JOBSEQ = v + 1;
  try { localStorage.setItem(JOBSEQ_KEY, String(S.JOBSEQ)); } catch (e) {}
  return S.JOBSEQ;
}
export const PEND_KEY = 'nm_thumb_pend';
export function jobIds(job) { const s = []; if (job && job.thid) s.push(job.thid); if (job && Array.isArray(job.thids)) job.thids.forEach(id => { if (id && !s.includes(id)) s.push(id); }); return s; }
export function jobHasId(job, id) { return !!(id && job && (job.thid === id || (Array.isArray(job.thids) && job.thids.includes(id)))); }
export function jobBid(job) { if (!job) return ''; if (typeof job.bid === 'string' && job.bid) return job.bid; const s = job.src; return (s && typeof s === 'object' && typeof s.bid === 'string') ? s.bid : ''; }
export function lblParts(l) {
  l = String(l || '').trim(); let m;
  if ((m = /^(포스트|릴스) (OPA[\d·]+)$/.exec(l))) return { fmt: m[1], pieces: ['자막(' + m[2] + ')'] };
  if (/^(포스트|릴스) 헤더$/.test(l)) return { fmt: '릴스', pieces: ['헤더'] };
  if ((m = /^(저작권·안내문|저작권|안내문) \((포스트|릴스)\)$/.exec(l))) return { fmt: m[2], pieces: m[1].split('·') };
  if ((m = /^(포스트|릴스) (.+)$/.exec(l))) return { fmt: m[1], pieces: m[2].split('·') };
  if (/^(헤더|자막|저작권|안내문)/.test(l) && l.indexOf('·') >= 0) return { fmt: '', pieces: l.split('·') };
  return { fmt: '', pieces: l ? [l] : [], raw: true };
}
export function joinLbl(a, b) {
  const A = lblParts(a), B = lblParts(b);
  if (!A.pieces.length) return String(b || '').trim(); if (!B.pieces.length) return String(a || '').trim();
  if (A.raw || B.raw) { const x = String(a || '').trim(), y = String(b || '').trim(); return (x === y || x.split('·').includes(y)) ? x : x + '·' + y; }
  const pieces = A.pieces.slice(); B.pieces.forEach(p => { if (!pieces.includes(p)) pieces.push(p); });
  const fmt = (A.fmt === B.fmt) ? A.fmt : (A.fmt && B.fmt) ? '' : (A.fmt || B.fmt);
  return (fmt ? fmt + ' ' : '') + pieces.join('·');
}
export const pendSnap = job => ({ id: job.thid || '', n: job.n, label: job.label, t0: job.t0, outs: job.outs || [], endpoint: job.endpoint, payload: job.payload, src: job.src, ...(job.gfree ? { mode: 'gfree' } : {}), ...(Array.isArray(job.thids) && job.thids.length > 1 ? { thids: job.thids.slice() } : {}), ...(jobBid(job) ? { bid: jobBid(job) } : {}) });
export const pendPut = job => { try { if (job && job.thid && job.status === 'run') { nmJobs.add(PEND_KEY, pendSnap(job)); const sib = jobIds(job).filter(id => id !== job.thid); if (sib.length && typeof nmJobs.absorb === 'function') nmJobs.absorb(PEND_KEY, sib); } } catch (e) {} };
export const pendCut = job => { try { jobIds(job).forEach(id => { nmJobs.drop(PEND_KEY, id); nmJobs.free(PEND_KEY, id); }); } catch (e) {} };
export function jobStatKey(job) {
  const ep = job && job.endpoint || '';
  if (ep.indexOf('genimg') >= 0) return 'imggen/gen';
  if (ep.indexOf('upscale') >= 0) return 'upscale/upscale';
  if (ep.indexOf('resize') >= 0) return 'resize/resize';
  const lb = String(job && job.label || '').split(' (')[0].trim();
  return lb ? 'local/' + lb : null;
}
export const JOB_DUR_KEY = 'NM_JOB_DUR';
export const JOB_DUR_CAP = 20;
export function jobDurLoad() { try { return JSON.parse(localStorage.getItem(JOB_DUR_KEY) || '{}') || {}; } catch (e) { return {}; } }
export function jobDurPush(job) {
  const k = jobStatKey(job), sec = Math.round((Date.now() - job.t0) / 1000);
  if (!k || !(sec > 0) || sec > 3600) return;
  try { const m = jobDurLoad(); (m[k] ||= []).push(sec); m[k] = m[k].slice(-JOB_DUR_CAP); localStorage.setItem(JOB_DUR_KEY, JSON.stringify(m)); } catch (e) {}
}
export function jobDurMed(job) {
  const k = jobStatKey(job); if (!k) return 0;
  const a = (jobDurLoad()[k] || []).slice().sort((x, y) => x - y);
  return a.length >= 2 ? a[a.length >> 1] : 0;
}
export function jobStat(job) { const k = jobStatKey(job); const v = k && S.JOB_STATS && S.JOB_STATS[k]; return (v && v.n) ? v : null; }
export function estJobTok(job) { const v = jobStat(job); return v ? (v.tok || 0) : 0; }
export function fmtTok(n) { return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K' : String(n); }
export function estJobEtaSec(job) { const v = jobStat(job); return (v && v.dur) ? v.dur : jobDurMed(job); }
export function fmtMMSS(sec) { const s = Math.max(0, sec | 0); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
export const WIP_TILE_OFF = true;
export function wipSync(job, sec) {
  if (WIP_TILE_OFF) { if (job._wip) { job._wip.remove(); job._wip = null; wipEmptySync(); } return; }
  const box = $('#wips'); if (!box) return;
  if (job.status === 'done' || job.status === 'err') { if (job._wip) { job._wip.remove(); job._wip = null; wipEmptySync(); } return; }
  let el = job._wip;
  if (!el) {
    el = document.createElement('div'); el.className = 'wip'; el.dataset.jn = job.n;
    el.innerHTML = '<div class="wscrim"></div><div class="scanline"></div><div class="wcorner" aria-hidden="true"></div><div class="wtok" aria-hidden="true"></div>'
      + '<div class="wmsg">' + (window.nmLoader ? nmLoader('solving', '제작중…') : S.SPIN_SVG) + '</div>';
    if (job.refThumb) {
      const wrap = document.createElement('div'); wrap.className = 'wmock'; wrap.setAttribute('aria-hidden', 'true');
      const im = document.createElement('img'); im.src = job.refThumb; im.alt = '';
      im.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block';
      wrap.appendChild(im); el.prepend(wrap);
    } else if (Date.now() - job.t0 < 3000) {
      const st = $('#cpPrevStage');
      if (st && !st.classList.contains('none') && st.childElementCount && !st.querySelector('.cpv-photobtn')) {
        try {
          const r = st.getBoundingClientRect();
          if (r.width > 10 && r.height > 10) {
            const cl = st.cloneNode(true); cl.removeAttribute('id'); cl.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
            cl.style.width = r.width + 'px'; cl.style.height = r.height + 'px'; cl.style.flex = 'none';
            const wrap = document.createElement('div'); wrap.className = 'wmock'; wrap.setAttribute('aria-hidden', 'true'); wrap.appendChild(cl);
            el.prepend(wrap); el._mw = r.width; el._mh = r.height;
          }
        } catch (e) {}
      }
    }
    box.prepend(el); job._wip = el;
    if (el._mw) requestAnimationFrame(() => { const m = el.querySelector('.wmock > *'); if (!m) return; const k = Math.min(el.clientWidth / el._mw, el.clientHeight / el._mh); if (isFinite(k) && k > 0) m.style.transform = 'scale(' + Math.min(k, 1) + ')'; });
    wipEmptySync();
  }
  const s = Math.max(0, sec | 0), c = el.querySelector('.wcorner');
  const eta = estJobEtaSec(job);
  if (c) c.textContent = fmtMMSS(s) + ' 진행시간' + (eta ? ' (예상 ' + fmtMMSS(eta) + ')' : '');
  const t = el.querySelector('.wtok'), tk = estJobTok(job);
  if (t) t.textContent = tk > 0 ? fmtTok(tk) + ' 토큰' : '';
}
export function wipEmptySync() { const em = $('#carEmpty'), box = $('#wips'); if (!em || !box) return; if (box.childElementCount) { em.hidden = true; carEmptySync(); return; } if (typeof carHSync === 'function') carHSync(); }
export function carEmptySync() {
  const h = $('#carH'), c = $('#carHCnt'), em = $('#carEmpty'); if (!h) return;
  const run = S.JOBS.filter(j => j && j.status === 'run').length, n = S.CARSLIDES.length;
  const tx = (n || !run ? '(' + n + ')' : '') + (run ? ' · 제작 중 ' + run : '');
  if (c && c.textContent !== tx) c.textContent = tx;
  if (em && !n) { const hide = h.getAttribute('aria-expanded') === 'false' || !!(($('#wips') || {}).childElementCount) || run > 0; if (em.hidden !== hide) em.hidden = hide; }
}
export function jobCancelTap(job, row, btn) {
  if (!job._cxArm) {
    job._cxArm = 1; btn.classList.add('arm'); btn.innerHTML = CHECK_SVG; btn.title = '한 번 더 누르면 취소'; btn.setAttribute('aria-label', '취소 확정');
    clearTimeout(job._cxT); job._cxT = setTimeout(() => { job._cxArm = 0; if (job.status === 'run') renderJob(job); }, 3000);
    return;
  }
  clearTimeout(job._cxT); job._cxArm = 0;
  jobCancel(job);
  btn.classList.remove('arm'); btn.classList.add('ok'); btn.innerHTML = CHECK_SVG; btn.title = '취소됨'; btn.disabled = true;
  const st = row.querySelector('.jst'); if (st) st.innerHTML = CHECK_SVG + '<span>취소됨</span>';
  setTimeout(() => row.remove(), 1200);
}
export function jobCancel(job) {
  job.status = 'cancel';
  if (job._timer) { clearTimeout(job._timer); job._timer = null; }
  if (job._ui) { clearInterval(job._ui); job._ui = 0; }
  if (job._wip) { job._wip.remove(); job._wip = null; wipEmptySync(); }
  const i = S.JOBS.indexOf(job); if (i >= 0) S.JOBS.splice(i, 1);
  if (job.rid && !rszRunning()) rszWait(false);
}
export function jobDur(sec) { return sec < 60 ? sec + 's' : Math.floor(sec / 60) + 'm ' + (sec % 60) + 's'; }
export function jobSecHTML(sec) { return '<b class="jsec">' + jobDur(sec) + '</b>'; }
export function jobMS(sec) { return Math.floor(sec / 60) + '분 ' + String(sec % 60).padStart(2, '0') + '초'; }
export function renderJob(job) {
  if (!job.uid) job.uid = ++S.JOBUID;
  let row = document.getElementById('job-' + job.uid);
  if (!row) { row = document.createElement('div'); row.id = 'job-' + job.uid; row.className = 'job'; if (job._restored) row.dataset.rj = '1'; $('#jobs').prepend(row); }
  if (job.thid) row.dataset.thid = job.thid;
  row.className = 'job' + (job.status === 'done' ? ' done' : '') + (job.status === 'err' ? ' err' : '');
  carEmptySync();

  if (job.status !== 'run') pendCut(job);
  if (job.status === 'done' && !job._restored && !job._durSaved) { job._durSaved = true; jobDurPush(job); }
  if (job.status === 'done' && !job._restored && !job._saved && (job.saves || []).length) { job._saved = true; saveLastResult(job); }
  const sec = Math.round((Date.now() - job.t0) / 1000);
  const tot = job.outs.length || '?';
  const dn = job.done.filter(Boolean).length;
  let ic, tx, shim = '';

  if (job.status === 'err') { ic = WARN_SVG; tx = '실패' + (job.msg ? ' · ' + esc(String(job.msg).slice(0, 60)) : ''); }
  else if (job.status === 'done') { ic = CHECK_SVG; tx = '완료' + (job._restored ? '' : '(' + jobMS(sec) + ')') + ' · ' + histTime(job.t0) + ' · ' + dn + '/' + tot + '장' + (job.partErr ? ' · 일부 실패' : ''); }

  else if (job._queued) { ic = window.nmOrbHTML ? nmOrbHTML('solving', 14) : S.SPIN_SVG; tx = '지연 · ' + jobSecHTML(sec) + ' · ' + dn + '/' + tot + '장'; shim = ' class="nm-shim"'; }
  else { ic = window.nmOrbHTML ? nmOrbHTML('solving', 14) : S.SPIN_SVG; tx = '제작중 · ' + jobSecHTML(sec) + ' · ' + dn + '/' + tot + '장'; shim = ' class="nm-shim"'; }
  wipSync(job, sec);

  const tasks = jobTasks(job);
  const _rskel = job.status === 'run' ? ('run|' + (job._queued ? 1 : 0) + '|' + (job._cxArm ? 1 : 0) + '|' + String(job.label || '') + '|' + jobTasksSig(tasks)) : '';
  if (_rskel && row._rskel === _rskel) {
    const _tn = row.querySelector('.jst > .nm-shim');
    if (_tn) { _tn.innerHTML = tx; jobTasksSync(row, job, tasks); return; }
  }
  row._rskel = _rskel;
  row.innerHTML = '';

  const lab = document.createElement('span'); lab.className = 'jlab';

  const face = jobFace(job);
  let _labDesc = '';
  if (face) {
    const _no = (job.n != null && job.n !== '' && isFinite(+job.n)) ? pad3(job.n) : '';
    const _parts = [];
    if (_no) { const _nn = document.createElement('span'); _nn.className = 'jno'; _nn.textContent = _no; _parts.push(_nn); }
    const _fw = JFMT[face.ratio];
    if (_fw) { const _fm = document.createElement('span'); _fm.className = _fw[1]; _fm.textContent = '#' + _fw[0]; _parts.push(_fm); }
    else if (face.ratio) _parts.push('#' + face.ratio);
    if (face.ai) { const _ai = document.createElement('span'); _ai.className = 'jai'; _ai.textContent = '#AI'; _parts.push(_ai); }
    _parts.forEach((p, i) => { if (i) lab.append(' '); lab.append(p); });
    _labDesc = tasks.length ? face.cmp : face.pieces;
  } else lab.textContent = job.label + (job._restored ? '' : jobNo(job));
  const labs = (job.outs || []).map(o => o && o.label).filter(Boolean);

  const stsp = document.createElement('span'); stsp.className = 'jst'; stsp.innerHTML = ic + '<span' + shim + '>' + tx + '</span>';
  row.append(lab, stsp);
  if (job.partErr && job.status === 'done') row.title = job.partErr;

  row.onclick = (job.status === 'done' && (job.saves || []).some(s => s && s.url)) ? (e => { if (e && e.target && e.target.closest('button, a')) return; jobShowCar(job); }) : null;
  let svRow = null;
  const _saves = (job.saves || []).filter(s => s && s.url);
  if (job.status === 'done' && _saves.length) {
    svRow = document.createElement('div'); svRow.className = 'jsave-row';
    const sv = document.createElement('button'); sv.type = 'button'; sv.className = 'sbtn cref-dlall dlbtn'; sv.title = '전체 다운로드'; sv.setAttribute('aria-label', '전체 다운로드');
    sv.innerHTML = S.DLSEQ_IC + '<span class="cref-dllbl">전체</span>';
    sv.onclick = e => { e.stopPropagation(); dlAllSeq(e.currentTarget, _saves.map(s => s.url), i => _saves[i].dlname).then(() => { job._dled = 1; }); };
    if (job._dled) sv.classList.add('dl-done');
    if (!(job.src && job.src.app)) { const _bs = srvSrcOf((_saves[0] || {}).url); if (_bs) job.src = _bs; }
    if (canEditSrc(job.src)) {

      const je = document.createElement('button'); je.type = 'button'; je.className = 'imgedit'; je.title = '이 설정으로 수정'; je.setAttribute('aria-label', '수정');
      je.innerHTML = EDIT_SVG;
      je.onclick = e => { e.stopPropagation(); editOpenSrc(job.src, (_saves[0] || {}).url); };
      svRow.appendChild(je);
    }
    svRow.appendChild(sv);
  }
  if (job.status === 'done' && job.gfree && job.payload && job.endpoint) {
    const mr = document.createElement('button'); mr.type = 'button'; mr.className = 'jretry jmore'; mr.title = '같은 설정으로 한 장 더 생성';
    mr.innerHTML = PLUS_SVG + '<span>한 장 더</span>';
    mr.onclick = async () => {
      mr.disabled = true;
      const opts = Object.assign({}, job.payload.opts, { count: 1 });
      try {
        goFire();
        const r = await fetch('/api/genimg', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ free: true, opts }) });
        const j = await r.json().catch(() => ({}));
        const fireErr = (!r.ok || j.error) ? (j.error || ('서버 ' + r.status)) : '';
        if (fireErr) mr.innerHTML = WARN_SVG + '<span>실패 · 다시</span>';
        genJob(1, opts, fireErr, { jid: j.id || '' });
        if (fireErr) { mr.disabled = false; return; }
        mr.innerHTML = PLUS_SVG + '<span>한 장 더</span>'; mr.disabled = false;
      } catch (e) { mr.innerHTML = WARN_SVG + '<span>실패 · 다시</span>'; mr.disabled = false; }
    };
    row.append(mr);
  }
  if (job.status === 'err' && ((job.payload && job.endpoint) || (job.batch && job.batch.length))) {
    const rt = document.createElement('button'); rt.type = 'button'; rt.className = 'jretry'; rt.title = '같은 설정으로 다시 제작';
    rt.innerHTML = RETRY_SVG + '<span>재시도</span>';
    rt.onclick = () => { rt.disabled = true; if (job.rid) (job.endpoint === '/api/upscale' ? upsRefire : rszRefire)(job); else if (job.gfree) genRefire(job); else if (job.batch && job.batch.length) dispatchBatch(job.batch, job.label, job.src, job); else dispatchJob(job.endpoint, job.payload, job.label, job.src, job); };
    row.append(rt);
  }
  if (job.status === 'err') {
    row.title = job.msg || '';
    const del = document.createElement('button'); del.type = 'button'; del.className = 'jdel'; del.title = '이 실패 기록 삭제'; del.setAttribute('aria-label', '삭제');
    del.innerHTML = TRASH_SVG;
    del.onclick = () => { const i = S.JOBS.indexOf(job); if (i >= 0) S.JOBS.splice(i, 1); row.remove(); };
    row.append(del);
  }
  if (job.status === 'run') {
    const cx = document.createElement('button'); cx.type = 'button'; cx.className = 'jdel jcancel';
    if (job._cxArm) { cx.classList.add('arm'); cx.innerHTML = CHECK_SVG; cx.title = '한 번 더 누르면 취소'; cx.setAttribute('aria-label', '취소 확정'); }
    else { cx.innerHTML = XCLOSE_SVG; cx.title = '이 제작 취소'; cx.setAttribute('aria-label', '제작 취소'); }
    cx.onclick = () => jobCancelTap(job, row, cx);
    row.append(cx);
  }

  let vs = null;
  if (false) {
    vs = document.createElement('div'); vs.className = 'jvars'; vs.setAttribute('aria-label', '출력 변형');
    (job.outs || []).forEach((o, i) => {
      if (!(o && o.label)) return;
      const d = document.createElement('span'); d.className = 'jvar';
      const tx = document.createElement('span'); tx.className = 'jvar-tx'; tx.textContent = '[' + (i + 1) + '] ' + o.label;
      d.appendChild(tx);
      if (o._slide != null) {
        d.classList.add('on');
        tx.title = '이 변형으로 이동'; tx.onclick = () => carJump(o._slide);
        const dl = document.createElement('a'); dl.className = 'jvar-dl dlbtn'; dl.href = o._url;
        dl.setAttribute('aria-label', '이 변형 다운로드'); dl.title = '이 변형만 다운로드'; dl.innerHTML = DOWNLOAD_SVG;
        if (dlSeen(o._url)) dl.classList.add('dl-done');
        dl.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); dlBlob(o._url, o._dlname); dlMark(o._url, dl); });
        d.appendChild(dl);
      }
      vs.appendChild(d);
    });
  }

  let dsc = null;
  if (_labDesc) { dsc = document.createElement('span'); dsc.className = 'jvar jdesc'; dsc.textContent = _labDesc; }
  if (dsc && svRow) svRow.insertBefore(dsc, svRow.firstChild);
  if (vs && svRow) { const grid = document.createElement('div'); grid.className = 'jgrid'; grid.append(vs, svRow); row.append(grid); }
  else { if (svRow) row.append(svRow); if (vs) row.append(vs); }
  if (dsc && !svRow) { const dl = document.createElement('div'); dl.className = 'jvars'; dl.appendChild(dsc); row.append(dl); }
  if (tasks.length) row.append(jobTasksEl(job, tasks));
}
export const TASK_ROLE = /^(헤더|자막|오버레이|저작권|안내문)(?=\s|$)/;
export function taskLbl(o, i, job) {
  const raw = String((o && o.label) || '').trim();
  const f = String((o && o.path) || '').split('?')[0].split('/').pop();
  const tg = TASK_ROLE.exec(raw);
  let m;
  if (/^(box|nobg)\.(jpe?g|png)$/.test(f)) return '헤더';
  if ((m = /^opa(\d+)\.(jpe?g|png)$/.exec(f))) return stripOpa('오버레이(OPA' + m[1] + ')');
  if (f === 'out.png' && !tg) {
    const L = String((job && job.label) || ''), c = /저작권/.test(L), g = /안내문/.test(L);
    return c && !g ? '저작권' : g && !c ? '안내문' : raw ? '저작권' : '안내문';
  }
  if (tg) return stripOpa(tg[1] === '자막' ? '오버레이' : tg[1]) + (/^(자막|오버레이)\s+(OPA[\d·]+)$/.test(raw) ? '(' + stripOpa(raw.replace(TASK_ROLE, '').trim()) + ')' : '');
  if (!raw) return '이미지 ' + (i + 1);
  return stripOpa(/^OPA[\d·]+$/.test(raw) ? '오버레이(' + raw + ')' : raw);
}
export function jobTasks(job) {
  if (job.status !== 'run') return [];
  if (job._tkT0 !== job.t0) { job._tkT0 = job.t0; job._tkPop = {}; job._tkSig = ''; }
  const outs = job.outs || [], t = [];
  if (outs.length) outs.forEach((o, i) => t.push({ lb: taskLbl(o, i, job), v: String((o && o.label) || '').replace(TASK_ROLE, '').trim(), st: job.done[i] ? 'ok' : 'run', k: i }));
  else if (job.batch && job.batch.length > 1) job.batch.forEach((it, i) => t.push({ lb: taskLbl({ label: it && (it.tag || it.label) }, i, job), st: 'wait' }));
  (job.errTags || []).forEach((tg, i) => t.push({ lb: taskLbl({ label: tg }, i, job), st: 'err' }));
  const cnt = {}; t.forEach(x => { cnt[x.lb] = (cnt[x.lb] || 0) + 1; });
  t.forEach(x => { if (cnt[x.lb] > 1 && x.v && !/^OPA/.test(x.v)) x.lb += '(' + x.v + ')'; });
  return t.length > 1 ? t : [];
}
export const jobTasksSig = tasks => tasks.map(t => t.lb + (t.st === 'err' ? '!' : '')).join('\u0001');
export function jobTaskSet(job, d, t) {
  if (d.dataset.st === t.st) return;
  d.dataset.st = t.st; d.className = 'jvar jtask ' + t.st + (d.classList.contains('tkin') ? ' tkin' : '');
  const kind = t.st === 'ok' ? 'ok' : t.st === 'err' ? 'err' : 'orb';
  if (d.dataset.ic === kind) return;
  d.dataset.ic = kind;
  const pop = kind === 'ok' && t.k != null && !job._tkPop[t.k];
  if (pop) job._tkPop[t.k] = 1;
  const ic = document.createElement('span'); ic.className = 'jtask-ic' + (pop ? ' pop' : '');
  ic.innerHTML = kind === 'ok' ? CHECK_SVG : kind === 'err' ? WARN_SVG : (window.nmOrbHTML ? nmOrbHTML('solving', 12) : S.SPIN_SVG);
  d.replaceChild(ic, d.firstChild);
}
export function jobTasksEl(job, tasks) {
  const box = document.createElement('div'); box.className = 'jvars jtasks'; box.setAttribute('aria-label', '낱개 진행');
  const seen = new Set(String(job._tkSig || '').split('\u0001')); job._tkSig = jobTasksSig(tasks);
  let nw = 0;
  tasks.forEach(t => {
    const d = document.createElement('span'); d.className = 'jvar jtask';
    if (!seen.has(t.lb + (t.st === 'err' ? '!' : ''))) { d.classList.add('tkin'); d.style.setProperty('--i', nw++); }
    d.append(document.createElement('span'), document.createElement('span'));
    d.lastChild.className = 'jtask-tx'; d.lastChild.textContent = t.lb;
    jobTaskSet(job, d, t);
    box.appendChild(d);
  });
  return box;
}
export function jobTasksSync(row, job, tasks) {
  const box = row.querySelector('.jtasks'); if (!box) return;
  tasks.forEach((t, i) => { const d = box.children[i]; if (d) jobTaskSet(job, d, t); });
}
export function jobsMirror() {
  if (window.parent === window) return;
  try {
    parent.postMessage({ nm: 'jobs-mirror', jobs: S.JOBS.map(j => ({
      uid: j.uid, n: j.n, label: j.label || '제작', status: j.status, msg: String(j.msg || '').slice(0, 120),
      t0: j.t0, tot: (j.outs || []).length, dn: (j.done || []).filter(Boolean).length, queued: !!j._queued, arm: !!j._cxArm,
    })) }, location.origin);
  } catch (e) {}
}
export function pollJob(job) {

  try { jobIds(job).forEach(id => nmJobs.hold(PEND_KEY, id, () => { job.status = 'cancel'; if (job._timer) { clearTimeout(job._timer); job._timer = null; } })); } catch (e) {}
  const SOFT_S = 150, HARD_S = 720;
  const tick = () => {
    if (job._timer) { clearTimeout(job._timer); job._timer = null; }
    if (job.status !== 'run') return;
    if (job.done.every(Boolean)) { job.status = 'done'; renderJob(job); return; }
    const _el = Math.round((Date.now() - job.t0) / 1000);
    if (_el > HARD_S) { job.status = 'err'; job.msg = '시간 초과(12분) — 러너 큐 혼잡/렌더 실패 가능, 다시 시도'; renderJob(job); return; }
    job._queued = _el > SOFT_S;
    renderJob(job);
    job.outs.forEach((o, i) => {
      if (job.done[i]) return;
      const url = o.path + '?t=' + Date.now();
      const img = new Image();
      img.onload = () => {
        if (job.status !== 'run') return;
        if (job.done[i]) return; job.done[i] = true;

        (job._ready || (job._ready = {}))[i] = [url, dlStamp(job.t0) + '_' + dlSlug(job.label) + '_' + jobNo3(job) + (o.label ? '_' + o.label : '') + '.' + (o.path.split('.').pop() || 'jpg'), job.label + jobNo(job), job, o.label ? ' · ' + o.label : '', o];
        if (job._next == null) job._next = 0;
        while (job._ready[job._next]) { carAppend(...job._ready[job._next]); delete job._ready[job._next]; job._next++; }
        if (job.done.every(Boolean)) job.status = 'done';
        renderJob(job);
      };
      img.src = url;
    });
    job._timer = setTimeout(tick, job._queued ? 12000 : 5000);
  };
  job._tick = tick;
  tick();
}
export function dlStamp(ts) {
  const n = new Date(ts || Date.now()), p = x => String(x).padStart(2, '0');
  return `${String(n.getFullYear()).slice(2)}${p(n.getMonth() + 1)}${p(n.getDate())}_${p(n.getHours())}${p(n.getMinutes())}`;
}

export function start() {
S.JOBS = [];
S.JOBSEQ = 0;
try { S.JOBSEQ = parseInt(localStorage.getItem(JOBSEQ_KEY), 10) || 0; } catch (e) {}
S.JOBUID = 0;
S.CARSLIDES = [];
S._pendRefThumb = '';
S.JOB_STATS = null;
(async () => { try { const r = await fetch('job_stats.json?t=' + Date.now()); if (r.ok) S.JOB_STATS = (await r.json()).stats || null; } catch (e) {} })();
(function () {
  if (!window.MutationObserver) return;
  const mo = new MutationObserver(() => carEmptySync());
  ['#jobs', '#wips'].forEach(sel => { const el = $(sel); if (el) mo.observe(el, { childList: true }); });
})();
(function jobsMirrorWatch() {
  const host = $('#jobs'); if (!host || typeof MutationObserver !== 'function') return;
  let t = 0;
  new MutationObserver(() => { if (t) return; t = setTimeout(() => { t = 0; jobsMirror(); }, 60); }).observe(host, { childList: true, subtree: true });
})();
window.addEventListener('message', e => {
  if (e.source !== window.parent || e.origin !== location.origin) return;
  if (!e.data || e.data.nm !== 'jobs-act') return;
  const row = document.getElementById('job-' + e.data.uid); if (!row) return;
  const b = row.querySelector(e.data.act === 'retry' ? '.jretry' : '.jdel');
  if (b) b.click();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) return; S.JOBS.forEach(j => { if (j.status === 'run' && j._tick) j._tick(); }); });
window.addEventListener('focus', () => { S.JOBS.forEach(j => { if (j.status === 'run' && j._tick) j._tick(); }); });
}
