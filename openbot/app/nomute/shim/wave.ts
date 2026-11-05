// 올리는 순간 파형(형 11-05 09:41 「혹시 빠르, 내가 영상을 올릴때, 동시에 파형같은거 너가 개발한것도 내가 올리고 좀 채팅창에서 그 영상이 머물러도 되니까 그 순간에 내가 올리는 부분(지금 다시 개발하는 단계)에서 파형 분석해서 같이 공유가 될 수 있나?」 · 빠르)
// 소리·영상을 고른 순간 브라우저 안에서 소리를 풀어(Web Audio · 서버 0) 파형 PNG 한 장 + 숫자 → 보낼 때 같은 글에 「<이름>.파형.png」로 같이 실음(./attachments.ts · ../data/attachment-state.ts)
// 그림 = claude-state tools/소리분석.py 파형.png 결(1024 폭 · #2F6BFF) + 머리줄(길이 · 최고 dBFS · 평균 dB · 조용함 % · 터지는 자리 셋) + 아래 시각 눈금 — 봇이 그림만 봐도 「언제 크고 언제 조용한지」
// 자막·스펙트로그램·빠르기·조성 = 무거워서 상주(소리분석.py)가 뒤에 붙임 · 이 판 = 「그 순간」 몫 · 같은 셈 = editor viewer/office-wave.js(사무실 웹 화면)

export type WaveStats = { dur: number; peak_db: number; rms_db: number; quiet_pct: number; loud: string[] };
export type Wave = (WaveStats & { file: File; no_audio?: undefined }) | { no_audio: true; file?: undefined };

export const MEDIA_RE = /\.(mp4|mov|webm|m4v|mp3|m4a|wav|ogg|flac|aac)$/i, MAX_BYTES = 200 * 1024 * 1024, SR = 22050;
const W = 1024, WAVE_H = 240, HEAD_H = 28, FOOT_H = 22, COLOR = '#2F6BFF';
export const mmss = (s: number): string => { s = Math.max(0, Math.floor(s)); return s >= 3600 ? `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const db = (v: number): number => (v > 0 ? Math.round(20 * Math.log10(v) * 10) / 10 : -Infinity);

/** 순수 — 여러 채널을 하나로(평균). */
export function mono(chs: Float32Array[]): Float32Array {
  if (chs.length === 1) return chs[0];
  const n = chs[0].length, out = new Float32Array(n);
  for (const c of chs) for (let i = 0; i < n; i++) out[i] += c[i] / chs.length;
  return out;
}

/** 순수 — 칸(cols)마다 [최소, 최대]. */
export function peaks(x: Float32Array, cols: number): [number, number][] {
  const out: [number, number][] = [], step = x.length / cols;
  for (let c = 0; c < cols; c++) {
    let lo = 0, hi = 0;
    for (let i = Math.floor(c * step), e = Math.min(x.length, Math.floor((c + 1) * step)); i < e; i++) { const v = x[i]; if (v < lo) lo = v; if (v > hi) hi = v; }
    out.push([lo, hi]);
  }
  return out;
}

/** 순수 — 숫자: 길이·최고·평균(RMS)·조용한 몫(1초 RMS 가 -45 dB 아래)·터지는 자리(1초 RMS 큰 셋 · 서로 3초 넘게 떨어짐 · 시각 순). */
export function stats(x: Float32Array, sr: number): WaveStats {
  const dur = x.length / sr;
  let pk = 0, sq = 0;
  for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); if (a > pk) pk = a; sq += x[i] * x[i]; }
  const win: { t: number; r: number }[] = [], n = Math.max(1, Math.round(sr));
  for (let s = 0; s < x.length; s += n) {
    let q = 0; const e = Math.min(x.length, s + n);
    for (let i = s; i < e; i++) q += x[i] * x[i];
    win.push({ t: s / sr, r: Math.sqrt(q / Math.max(1, e - s)) });
  }
  const quiet = win.filter((w) => db(w.r) < -45).length;
  const loud: { t: number; r: number }[] = [];
  for (const w of [...win].sort((a, b) => b.r - a.r)) {
    if (loud.length >= 3 || db(w.r) < -40) break;
    if (loud.every((l) => Math.abs(l.t - w.t) > 3)) loud.push(w);
  }
  return { dur: Math.round(dur * 10) / 10, peak_db: db(pk), rms_db: db(Math.sqrt(sq / Math.max(1, x.length))), quiet_pct: win.length ? Math.round(quiet / win.length * 100) : 0, loud: loud.sort((a, b) => a.t - b.t).map((l) => mmss(l.t)) };
}

/** 순수 — 머리줄 글. */
export function headLine(st: WaveStats): string {
  const f = (v: number) => (Number.isFinite(v) ? v.toFixed(1) : '-∞');
  return `길이 ${mmss(st.dur)} · 최고 ${f(st.peak_db)} dBFS · 평균 ${f(st.rms_db)} dB · 조용함 ${st.quiet_pct}%` + (st.loud.length ? ` · 터지는 자리 ${st.loud.join(' · ')}` : '');
}

/** 순수 — 눈금 간격(초): 열 칸 안팎. */
export function tickStep(dur: number): number {
  for (const s of [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600]) if (dur / s <= 10) return s;
  return 3600;
}

function draw(pk: [number, number][], st: WaveStats, doc: Document): Promise<Blob | null> {
  const cv = doc.createElement('canvas'); cv.width = W; cv.height = HEAD_H + WAVE_H + FOOT_H;
  const g = cv.getContext('2d');
  if (!g) return Promise.resolve(null);
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = '#111111'; g.font = '15px system-ui, sans-serif'; g.textBaseline = 'middle';
  g.fillText(headLine(st), 8, HEAD_H / 2);
  const mid = HEAD_H + WAVE_H / 2, amp = WAVE_H / 2 - 2;
  g.strokeStyle = '#dddddd'; g.beginPath(); g.moveTo(0, mid + 0.5); g.lineTo(W, mid + 0.5); g.stroke();
  g.fillStyle = COLOR;
  pk.forEach(([lo, hi], c) => { const y1 = mid - hi * amp, y2 = mid - lo * amp; g.fillRect(c, y1, 1, Math.max(1, y2 - y1)); });
  const step = tickStep(st.dur || 1);
  g.fillStyle = '#555555'; g.strokeStyle = '#bbbbbb'; g.font = '12px system-ui, sans-serif';
  for (let t = 0; t <= st.dur; t += step) {
    const x = Math.round(t / (st.dur || 1) * (W - 1)) + 0.5;
    g.beginPath(); g.moveTo(x, HEAD_H); g.lineTo(x, HEAD_H + WAVE_H); g.stroke();
    const label = mmss(t), w = g.measureText(label).width;
    g.fillText(label, Math.min(W - w - 2, Math.max(2, x - w / 2)), HEAD_H + WAVE_H + FOOT_H / 2);
  }
  return new Promise((ok) => cv.toBlob(ok, 'image/png'));
}

async function decode(buf: ArrayBuffer): Promise<AudioBuffer> {
  const w = globalThis as unknown as { OfflineAudioContext?: typeof OfflineAudioContext; webkitOfflineAudioContext?: typeof OfflineAudioContext };
  const Off = w.OfflineAudioContext || w.webkitOfflineAudioContext;
  if (!Off) throw new Error('no audio');
  const ac = new Off(1, 1, SR);
  return await new Promise<AudioBuffer>((ok, no) => { const p = ac.decodeAudioData(buf, ok, no); if (p && p.then) p.then(ok, no); });   // 옛 사파리 = 콜백만
}

/** 파일 하나 → 파형 PNG + 숫자. 소리·영상 아님·너무 큼 = null · 소리 길 없음 = {no_audio: true}. */
export async function waveOf(file: File): Promise<Wave | null> {
  if (!file || !MEDIA_RE.test(String(file.name || '')) || file.size > MAX_BYTES) return null;
  let ab: AudioBuffer;
  try { ab = await decode(await file.arrayBuffer()); } catch { return { no_audio: true }; }
  const chs: Float32Array[] = []; for (let i = 0; i < ab.numberOfChannels; i++) chs.push(ab.getChannelData(i));
  const x = mono(chs), st = stats(x, ab.sampleRate);
  const blob = await draw(peaks(x, W), st, document);
  if (!blob) return null;
  const base = String(file.name).replace(/\.[^.]+$/, '');
  return { file: new File([blob], base + '.파형.png', { type: 'image/png' }), ...st };
}

