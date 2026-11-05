// 사진 압축 = 고르는 순간(형 11-05 「이제 올리는 순간. 그 올리는 자체에서 변환해서 올리는거로해서 시간을 단축할거야」)
// 기준 1MB(형 「사진은 1mb를 기준으로 해줘」 · 「그게 넘으면 항상 압축되게, 크기보다는 품질이.」) = 품질 먼저 낮추고(0.92→0.80) 그래도 넘으면 긴 변을 10%씩(1280px 아래로는 안 줄임 · 거기서 받아들임)
// 굽기 = 일꾼(Worker · OffscreenCanvas) · 메인 줄 안 멈춤(형 11-02 10:05 「올리는 동작과 내 다음채팅과는 렉같은거가 지장을 주면안돼」) · 일꾼 못 쓰는 기기만 메인 캔버스
// 투명이 있을 수 있는 꼴(PNG·WebP·AVIF) = WebP(투명 유지) · 그 밖 = JPEG · WebP 로 못 굽는 기기(사파리) = JPEG(흰 바탕)
// GIF(움직임)·SVG(글자 그림) = 안 건드림 · 못 구우면 null = 원본 그대로 보냄(보내기는 안 막음)

export const PACK_LIMIT = 1024 * 1024;   // 1 MiB
const OPTS = { limit: PACK_LIMIT, floor: 1280, qs: [0.92, 0.88, 0.84, 0.8], step: 0.1, maxArea: 16_777_216 };   // maxArea = iOS 캔버스 한도(4096²) · 넘는 사진은 먼저 그 안으로
const PACKABLE = /^image\/(jpeg|pjpeg|png|webp|avif|heic|heif|bmp|tiff)$/i;
const ALPHA = /^image\/(png|webp|avif)$/i;

type Canvas = OffscreenCanvas | HTMLCanvasElement;
type Opts = typeof OPTS & { alpha: boolean };

/** 압축할 사진인가(1MB 넘는 사진 · GIF·SVG 빼고) */
export const shouldPack = (f: File) => PACKABLE.test(f.type) && f.size > PACK_LIMIT;

/**
 * 굽는 몸통 — 일꾼에도 글자로 그대로 넣음(toString) · 그래서 바깥 이름을 하나도 쓰지 않음(인자만)
 * 품질 사다리 → 그래도 넘으면 긴 변 10%씩 → 바닥(1280)에서 받아들임 · 돌려줌 = 가장 작은 판
 */
async function packCore(
  file: Blob,
  o: Opts,
  make: (w: number, h: number) => Canvas,
  enc: (c: Canvas, type: string, q: number) => Promise<Blob | null>,
): Promise<Blob | null> {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const W = bmp.width, H = bmp.height, long0 = Math.max(W, H);
    if (!W || !H) return null;
    let scale = Math.min(1, Math.sqrt(o.maxArea / (W * H)));
    let type = o.alpha ? "image/webp" : "image/jpeg";
    let best: Blob | null = null;
    const draw = () => {
      const w = Math.max(1, Math.round(W * scale)), h = Math.max(1, Math.round(H * scale));
      const c = make(w, h);
      const g = c.getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
      if (!g) throw new Error("no 2d");
      if (type === "image/jpeg") { g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); }
      g.imageSmoothingQuality = "high";
      g.drawImage(bmp, 0, 0, w, h);
      return c;
    };
    let c = draw();
    const at = async (q: number) => {
      let b = await enc(c, type, q);
      if (b && b.type !== type && type === "image/webp") { type = "image/jpeg"; c = draw(); b = await enc(c, type, q); }   // WebP 못 구움 = JPEG
      if (b && (!best || b.size < best.size)) best = b;
      return b;
    };
    for (const q of o.qs) { const b = await at(q); if (b && b.size <= o.limit) return b; }
    const q = o.qs[o.qs.length - 1];
    let long = long0 * scale;
    while (long > o.floor) {
      long = Math.max(o.floor, long * (1 - o.step));
      scale = long / long0;
      c = draw();
      const b = await at(q);
      if (b && b.size <= o.limit) return b;
    }
    return best;
  } finally {
    bmp.close();
  }
}

const WORKER = `const packCore = ${packCore.toString()};
const make = (w, h) => new OffscreenCanvas(w, h);
const enc = (c, type, quality) => c.convertToBlob({ type, quality });
self.onmessage = async (e) => {
  const { id, file, o } = e.data;
  try { self.postMessage({ id, blob: await packCore(file, o, make, enc) }); }
  catch { self.postMessage({ id, blob: null }); }
};`;

let worker: Worker | null | undefined, seq = 0;
const asked = new Map<number, (b: Blob | null) => void>();
function packWorker(): Worker | null {
  if (worker !== undefined) return worker;
  try {
    if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") return (worker = null);
    const w = new Worker(URL.createObjectURL(new Blob([WORKER], { type: "text/javascript" })));
    w.onmessage = (e: MessageEvent<{ id: number; blob: Blob | null }>) => { asked.get(e.data.id)?.(e.data.blob); asked.delete(e.data.id); };
    w.onerror = () => { for (const done of asked.values()) done(null); asked.clear(); worker = null; };   // 일꾼이 죽으면 다음은 메인 캔버스
    return (worker = w);
  } catch { return (worker = null); }
}
function packOff(w: Worker, file: File, o: Opts) {
  return new Promise<Blob | null>((resolve) => {
    const id = ++seq, t = setTimeout(() => { asked.delete(id); resolve(null); }, 30_000);   // 30초 안에 답 없으면 원본
    asked.set(id, (b) => { clearTimeout(t); resolve(b); });
    w.postMessage({ id, file, o });
  });
}
function packMain(file: File, o: Opts) {
  const make = (w: number, h: number) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  const enc = (c: Canvas, type: string, q: number) => new Promise<Blob | null>((r) => (c as HTMLCanvasElement).toBlob(r, type, q));
  return packCore(file, o, make, enc);
}

/** 압축판(이름 = 원본 이름 + 새 확장자) · 압축할 게 아니거나 못 굽거나 원본보다 안 작으면 null */
export async function packImage(file: File): Promise<File | null> {
  if (!shouldPack(file)) return null;
  const o: Opts = { ...OPTS, alpha: ALPHA.test(file.type) };
  try {
    const w = packWorker();
    const blob = w ? await packOff(w, file, o) : await packMain(file, o);
    if (!blob || blob.size >= file.size) return null;
    const ext = blob.type === "image/webp" ? ".webp" : ".jpg";
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ext, { type: blob.type, lastModified: file.lastModified });
  } catch { return null; }
}

/** 시험용 = 몸통 그대로(node 시험에서 캔버스를 바꿔 끼워 사다리만 확인) */
export const _packCore = packCore;
