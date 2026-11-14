// @ts-nocheck
// 서랍 「다운로드」 계산 줄 = 에디터 viewer-src 28-flagShellUpdate.part(249~601) · 29-_dgQCap.part 의 순수 함수를 줄 그대로(봄 11-01)
//   _dg 전역을 읽던 자리만 인자로 바꿈(peek · q · got) · 화면 그리기(innerHTML)·전역 상태는 ./dl.tsx 가 React 로 맡음
//   열쇠(localStorage)는 원본과 같은 이름 = 같은 기기에서 에디터와 앱이 같은 보관함·받음 표시·화질을 봄

export const DG_GOT_KEY = 'dg_got_v1';   // 받음(URL 키 · 최대 500)
export const DG_SECTIONS = [['img', '사진'], ['video', '영상'], ['doc', '문서'], ['audio', '음성'], ['zip', '압축'], ['link', '기타 링크']];
export const DG_VID_KEY = 'dg_vid_job_v1';
export const DG_VDONE_KEY = 'dg_vid_done_v1', DG_VDONE_MAX = 10, DG_VDONE_TTL = 7 * 24 * 3600e3;
export const DG_QUALS = [['2160-60', '4K 60F'], ['2160-30', '4K 30F'], ['1440-60', '2K 60F'],
                  ['1440-30', '2K 30F'], ['1080-60', 'K 60F'], ['1080-30', 'K 30F']];   // 값(2160-60…)은 4면 배선 문자라 불변 · 라벨 = 최단 통칭
export const DG_Q_KEY = 'dg_q_v1';
export const DG_PLATS = ['YT', 'IG', 'X', 'TT', 'FB', 'TH'];

export function gotLoad() { try { return JSON.parse(localStorage.getItem(DG_GOT_KEY) || '{}') || {}; } catch { return {}; } }
export function gotMark(key) {   // 원본 _dgGotMark 의 저장 줄 — 기기 로컬 보존(최대 500 롤링)
  try { const g = gotLoad(); g[key] = Date.now(); const ks = Object.keys(g); if (ks.length > 500) ks.sort((a, b) => g[a] - g[b]).slice(0, ks.length - 500).forEach(k => { delete g[k]; }); localStorage.setItem(DG_GOT_KEY, JSON.stringify(g)); } catch {}
}
export function dgKey(it) { return String(it.dl || it.url || ''); }
export function dgFmt(b) { b = Number(b) || 0; if (!b) return ''; if (b < 1024) return b + 'B'; if (b < 1048576) return (b / 1024).toFixed(b < 10240 ? 1 : 0) + 'KB'; if (b < 1073741824) return (b / 1048576).toFixed(1) + 'MB'; return (b / 1073741824).toFixed(2) + 'GB'; }
export function secTxt(s) { s = Math.max(0, Math.round(Number(s) || 0)); return Math.floor(s / 60) + '분 ' + String(s % 60).padStart(2, '0') + '초'; }   // 원본 _dgSecTxt 폴백 산식(nmEta.fmt 와 같은 「N분 NN초」)
export function agoTxt(t) {   // 원본 _dgAgo
  const s = Math.max(0, Date.now() - t) / 1000;
  if (s < 3600) return Math.max(1, Math.round(s / 60)) + '분 전';
  if (s < 86400) return Math.round(s / 3600) + '시간 전';
  return Math.round(s / 86400) + '일 전';
}
export function platName(p) { return ({ YT: '유튜브', IG: '인스타그램', X: 'X(트위터)', TT: '틱톡', FB: '페이스북', TH: '스레드' })[p] || p; }
export function vidPlat(u) {   // 원본 _dgVidPlat — 영상 게시물 URL만(호스트 + 경로 이중 화이트리스트 · 서버 vidl.js·러너도 같은 목록)
  let h, path;
  try { const x = new URL(u); h = x.hostname.toLowerCase().replace(/^www\./, ''); path = x.pathname.toLowerCase(); } catch { return ''; }
  const host = (d) => h === d || h.endsWith('.' + d);
  if (host('youtu.be')) return path.length > 1 ? 'YT' : '';
  if (host('youtube.com')) return (/^\/(watch|shorts\/|live\/|embed\/)/.test(path) || (path === '/watch')) ? 'YT' : '';
  if (host('instagram.com')) return /^\/(p|reel|reels|tv)\//.test(path) ? 'IG' : '';
  if (host('x.com') || host('twitter.com')) return /\/status\/\d/.test(path) ? 'X' : '';
  if (host('tiktok.com')) return (/\/(video|photo)\/\d/.test(path) || /^\/(t|v)\//.test(path) || h.startsWith('vm.') || h.startsWith('vt.')) ? 'TT' : '';
  if (host('fb.watch')) return path.length > 1 ? 'FB' : '';
  if (host('facebook.com')) return (/\/(videos|reel|watch)\//.test(path) || path === '/watch' || /\/videos\/\d/.test(path)) ? 'FB' : '';
  if (host('threads.net') || host('threads.com')) return /\/(post|t|share)\//.test(path) ? 'TH' : '';
  return '';
}
export function urlNorm(v) { let u = String(v || '').trim(); if (!u) return ''; return /^https?:\/\//i.test(u) ? u : 'https://' + u; }   // 원본 _dgUrlNorm(입력칸 값을 인자로)
export function qLoad() { try { const v = localStorage.getItem(DG_Q_KEY); return (v === 'best' || DG_QUALS.some(x => x[0] === v)) ? v : DG_QUALS[0][0]; } catch { return DG_QUALS[0][0]; } }
export function qName(q) { const h = DG_QUALS.find(x => x[0] === q); return h ? h[1] : DG_QUALS[0][1]; }
export function tierName(s) { return s === 2160 ? '4K' : s === 1440 ? '2K' : s === 1080 ? 'K' : s + 'p'; }
export function qOpts(peek) {   // 원본 _dgQOpts — 그 영상에 실제로 있는 화질만(사다리 못 얻으면 「최고 화질 · 저화질」 2택)
  const fm = (peek && Array.isArray(peek.fmts)) ? peek.fmts : null;
  if (!fm || !fm.length) return [['best', '최고 화질'], ['1080-30', '저화질']];
  const out = [];
  [2160, 1440, 1080].forEach(T => {
    const at = fm.filter(x => +x[0] === T);
    if (!at.length) return;
    const mx = Math.max(...at.map(x => +x[1] || 0));
    if (mx > 30) {
      out.push([T + '-60', tierName(T) + ' ' + mx + 'F']);
      if (at.some(x => (+x[1] || 0) <= 30)) out.push([T + '-30', tierName(T) + ' 30F']);
    } else out.push([T + '-60', tierName(T) + (mx ? ' ' + mx + 'F' : '')]);
  });
  if (out.length) return out;
  const top = fm.reduce((a, b) => (+b[0] > +a[0] ? b : a));
  return [['1080-60', tierName(+top[0]) + ((+top[1]) ? ' ' + Math.round(+top[1]) + 'F' : '')]];
}
export function qCap(v) { const m = /^(\d+)-/.exec(v || ''); return m ? +m[1] : 0; }
export function qEff(peek, q) {   // 원본 _dgQEff — 고른 상한이 이 영상에서 실제로 내주는 행(목록에 없으면 그 아래 최고로)
  const o = qOpts(peek);
  return o.find(x => x[0] === q) || o.find(x => qCap(x[0]) <= qCap(q)) || o[o.length - 1] || DG_QUALS[0];
}
export function actualLbl(f) {   // 원본 _dgActualLbl — 통칭은 정확일치만 · fps → F
  if (!f || !f.w || !f.h) return '';
  const s = Math.min(f.w, f.h);
  const fps = Math.round(Number(f.fps) || 0);
  return tierName(s) + (fps ? ' ' + fps + 'F' : '');
}
const _DG_VAR_RE = /^\d{8}_\d{6}_(?:YT|IG|X|TT|FB|TH)_(?:maxfps|1080p)_/;
export function resActual(res) {   // 원본 _dgResActual — 받은 영상 실측 라벨(캐러셀 = 짧은 변 최대 + 외 N건)
  const vids = ((res && res.files) || []).filter(f => f && f.kind === 'video' && f.w && f.h);
  if (!vids.length) return '';
  const main = vids.filter(f => !_DG_VAR_RE.test(String(f.name || '')));
  const pool = main.length ? main : vids;
  const best = pool.reduce((a, b) => (Math.min(b.w, b.h) > Math.min(a.w, a.h) ? b : a));
  return actualLbl(best) + (pool.length > 1 ? ' 외 ' + (pool.length - 1) + '건' : '');
}
export function fileLabel(f, imgN) {   // 원본 _dgFileLabel — 파일명 대신 짧은 말(영상 · 프레임별 · FHD판 · 자막 …)
  const n = String((f && f.name) || ''), low = n.toLowerCase();
  const ext = (low.match(/\.([a-z0-9]+)$/) || ['', ''])[1];
  const stt = low.indexOf('.stt.') >= 0;
  if (f && f.kind === 'img') return '사진' + (imgN > 0 ? ' ' + imgN : '');
  if (/_본문[_.]/.test(n)) return '본문';
  if (ext === 'srt' || ext === 'vtt') return stt ? '받아쓰기 자막' : '자막';
  if (ext === 'txt') return (stt ? '받아쓰기 자막' : '자막') + ' (txt)';
  if (f && f.kind === 'video') {
    if (n.indexOf('_maxfps_') >= 0) return '영상 · 프레임별';
    if (n.indexOf('_1080p_') >= 0) return '영상 · FHD판';
    return '영상';
  }
  return ext ? ext.toUpperCase() : '파일';
}
export function driveWhy(w) { w = String(w || ''); return w ? w.slice(0, 60) : '원인을 못 찾았어요'; }
export function noVid(p) { return !!(p && Array.isArray(p.items) && p.items.length && !p.items.some(it => it && it.kind === 'video')); }
export function imgSrc(u) {   // 원본 _dgImgSrc — 메타 CDN 사진은 같은 오리진 프록시(핫링크 차단 = 검은 칸)
  try { const h = new URL(u).hostname; return /(cdninstagram\.com|fbcdn\.net)$/.test(h) ? '/api/thembed?img=' + encodeURIComponent(u) : u; } catch { return u; }
}
export function peekItems(peek) { return ((peek && Array.isArray(peek.items)) ? peek.items : []).filter(it => it && it.u).slice(0, 12); }
export function peekItemsLine(p, plat) {   // 원본 _dgPeekHtml 의 항목 구성 줄(같은 종류·치수는 묶음 · 상한 2종)
  if (!p && plat === 'TH') return '미리보기를 못 받았어요 — 비공개·제한 글일 수 있어요(받기는 시도돼요)';
  if (!(p && Array.isArray(p.items) && p.items.length)) return '';
  const its = p.items;
  const knd = it => (it.kind === 'video' ? '영상' : it.kind === 'img' ? '사진' : '항목');
  if (its.some(it => it.w && it.h)) {
    const g = [];
    its.forEach(it => {
      const key = knd(it) + '|' + (it.w && it.h ? it.w + '×' + it.h : '');
      const hit = g.find(x => x.key === key);
      if (hit) hit.n++; else g.push({ key, lab: knd(it) + (it.w && it.h ? ' ' + it.w + '×' + it.h : ''), n: 1 });
    });
    const parts = g.slice(0, 2).map(x => x.lab + (x.n > 1 ? ' ' + x.n + '장' : ''));
    return '항목 ' + its.length + ' — ' + parts.join(' · ') + (g.length > 2 ? ' 외 ' + (g.length - 2) + '종' : '');
  }
  const nv = its.filter(it => it.kind === 'video').length, ni = its.filter(it => it.kind === 'img').length, no = its.length - nv - ni;
  return '항목 ' + its.length + ' — ' + [nv ? '영상 ' + nv : '', ni ? '사진 ' + ni : '', no ? '기타 ' + no : ''].filter(Boolean).join(' · ');
}
export function doneLoad() {   // 원본 _dgDoneLoad — 받은 영상 보관함(최근 10건 · 7일)
  try {
    const a = JSON.parse(localStorage.getItem(DG_VDONE_KEY) || '[]');
    if (!Array.isArray(a)) return [];
    const cut = Date.now() - DG_VDONE_TTL;
    const live = a.filter(x => x && x.t > cut && x.res && x.res.files && x.res.files.length);
    if (live.length !== a.length) localStorage.setItem(DG_VDONE_KEY, JSON.stringify(live));
    return live;
  } catch { return []; }
}
export function doneSave(v) {   // 원본 _dgDoneSave
  if (!v || !v.res || !(v.res.files || []).length) return;
  try {
    const a = doneLoad().filter(x => x.id !== v.id);
    a.unshift({ id: v.id, url: v.url, plat: v.plat, mode: v.mode || (v.res && v.res.mode) || 'both', t: Date.now(), sec: v.sec || 0, res: v.res });
    localStorage.setItem(DG_VDONE_KEY, JSON.stringify(a.slice(0, DG_VDONE_MAX)));
  } catch {}
}
export function doneDel(i) { try { const a = doneLoad(); a.splice(i, 1); localStorage.setItem(DG_VDONE_KEY, JSON.stringify(a)); } catch {} }
export function vidSaveJobs(jobs) {   // 원본 _dgVidSaveJobs — 진행 중 잡 전량(창 닫았다 열어도 복원)
  try {
    const a = jobs.filter(v => v.st === 'run' && v.id).map(v => ({ url: v.url, plat: v.plat, id: v.id, mode: v.mode, q: v.q, t0: v.t0 }));
    if (a.length) localStorage.setItem(DG_VID_KEY, JSON.stringify(a)); else localStorage.removeItem(DG_VID_KEY);
  } catch {}
}
export function vidLoadJobs() {   // 원본 _dgVidLoadJob — 40분 = 폴 상한
  try {
    const raw = JSON.parse(localStorage.getItem(DG_VID_KEY) || 'null');
    const a = (Array.isArray(raw) ? raw : (raw ? [raw] : [])).filter(e => e && e.id && e.t0 > Date.now() - 40 * 60e3);
    if (!a.length) { try { localStorage.removeItem(DG_VID_KEY); } catch {} }
    return a;
  } catch { return []; }
}
export function dlUrl(it) {   // 원본 _dgDlUrl — 스캔 항목 저장 주소(프록시 = 같은 오리진 attachment)
  if (it.via === 'direct') return it.dl;
  const nm = String(it.title || '').replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 120);
  return '/api/linkgrab/file?url=' + encodeURIComponent(it.dl) + (nm ? '&name=' + encodeURIComponent(nm) : '');
}
export function peekGetUrl(peek, k) {   // 원본 _dgPeekGet 의 주소 — 이름 = 제목_번호
  const it = peekItems(peek)[k]; if (!it) return '';
  const base = String((peek && peek.title) || '받은자료').replace(/[\\/:*?"<>|\n]+/g, ' ').trim().slice(0, 60) || '받은자료';
  return '/api/linkgrab/file?url=' + encodeURIComponent(it.u) + '&name=' + encodeURIComponent(base + '_' + (k + 1));
}
export function vidFileUrl(f) { return '/api/dl?u=' + encodeURIComponent(f.url) + '&n=' + encodeURIComponent(f.name); }   // 원본 _dgVidGet 의 주소(같은 오리진 attachment)
export function grab(href, newTab) {   // 원본 a.click 꼴 그대로(보이지 않는 링크 한 번 누름 = 다운로드 폴더로)
  const a = document.createElement('a');
  a.href = href; a.rel = 'noopener'; if (newTab) a.target = '_blank';
  else a.download = '';   // 받기 표시 = 앱 링크 가로채기(./inapp.ts onLink · download 있으면 건너뜀)가 같은 사이트 파일 주소를 「에디터」 웹 창으로 열지 않고 브라우저가 바로 받음(형 11-14 15:11 「다운로드를 누르면 > 대화창을 넘어가면서, 에디터가 뜨고, 창이 화면을 넘어가고, 맥에서 다운로드가 잘안되고」 · 뜸) · 이름 = 서버 content-disposition 그대로
  document.body.appendChild(a); a.click();
  setTimeout(() => { try { a.remove(); } catch {} }, 1500);
}
export function grabSeq(hrefs, onEach, gap = 900) {   // 원본 dlAllSeq 몫(순차 저장 · 한꺼번에 누르면 브라우저가 막음) → 끝나면 resolve
  return new Promise((res) => {
    let k = 0;
    const next = () => { if (k >= hrefs.length) { res(); return; } const h = hrefs[k]; if (h) grab(h); try { onEach && onEach(k); } catch {} k++; setTimeout(next, gap); };
    next();
  });
}
