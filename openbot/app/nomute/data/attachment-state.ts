import { queryClient } from "@/query-client";
import { dropAttachments, sendable, waveFile } from "../shim/attachments";
import { createAttachmentSender } from "./attachment-send";
import type { OfficeMsg } from "./office";

// office()는 JSON 해석 실패를 {}로 바꾼다. 전송 확인은 상태와 실제 JSON을 모두 보존해야 한다.
async function post(path: string, body: FormData | string) {
  const response = await fetch(`/api/office/${path}`, {
    method: "POST",
    credentials: "same-origin",
    body,
    ...(typeof body === "string"
      ? { headers: { "content-type": "application/json" } }
      : {}),
  });
  return { status: response.status, data: await response.json() };
}

const REPLY_WAIT_MS = 60_000;   // 다섯 자리 사본 + 글 = 보통 4~20초 · 넉넉히 1분

// fetch 는 올리는 진행률을 못 줘서 첨부만 XHR(형 10-31 「이미지 아래에 전송 게이지가 가로로 차면 될듯」)
// 끊기(게이지 누름 · 형 11-10 12:18 「그리고 파일 전송중에 게이지 클릭하면 전공 취소 가능하게」) = 다 올라가기 전만 xhr.abort() · 다 올라간 뒤(서버가 받는 중)엔 무시 = 서버에 반쯤 남는 일 0
const stopped = () => new DOMException("전송 취소", "AbortError");
function upload(form: FormData, onProgress?: (ratio: number) => void, signal?: AbortSignal) {
  return new Promise<{ status: number; data: unknown }>((resolve, reject) => {
    if (signal?.aborted) { reject(stopped()); return; }
    const xhr = new XMLHttpRequest();
    let sent = false;
    const onStop = () => { if (!sent) xhr.abort(); };
    signal?.addEventListener("abort", onStop, { once: true });
    xhr.open("POST", "/api/office/files");
    xhr.withCredentials = true;
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress?.(e.loaded / e.total); };
    let wait = 0;   // 다 올린 뒤 서버 답을 기다리는 한도(형 11-01 09:01 글이 게이지 95% 에서 멈춘 채 안 감 · 서버가 도중에 끊기면 답이 영영 안 옴) → 넘으면 끊고 「전송 확인 필요」로
    xhr.upload.onload = () => { sent = true; wait = window.setTimeout(() => xhr.abort(), REPLY_WAIT_MS); };
    xhr.onabort = () => { window.clearTimeout(wait); reject(sent ? new Error("서버 답이 오지 않았어") : stopped()); };
    xhr.onloadend = () => { window.clearTimeout(wait); signal?.removeEventListener("abort", onStop); };
    xhr.onload = () => {
      try { resolve({ status: xhr.status, data: JSON.parse(xhr.responseText) }); } catch (e) { reject(e); }
    };
    xhr.onerror = () => reject(new Error("첨부 응답을 받지 못했어"));
    xhr.send(form);
  });
}

// 영상 하나 = 조각으로(형 11-02 06:53 「그니까 내가 올리는거는 제약이 없는데 그거를 어짜피 뷴석할거니까 자동 압축이 되고(고화질일 필요 없음)」) · 봄 받는 문 #2101(upload/start → part → done · R2 · 4GB)
//   고리 % = 조각마다 올라간 바이트 합 · 조각이 못 가면 abort 하고 그 답을 그대로 돌려줌(보내는 쪽이 「전송 확인 필요」로) · 영상 한 개만 든 글만 이 길(나머지 = /files 한 번)
function putPart(url: string, body: Blob, onLoaded: (bytes: number) => void, signal?: AbortSignal) {
  return new Promise<{ status: number; data: unknown }>((resolve, reject) => {
    if (signal?.aborted) { reject(stopped()); return; }
    const xhr = new XMLHttpRequest();
    const onStop = () => xhr.abort();
    signal?.addEventListener("abort", onStop, { once: true });
    xhr.onabort = () => reject(stopped());
    xhr.onloadend = () => signal?.removeEventListener("abort", onStop);
    xhr.open("PUT", url);
    xhr.withCredentials = true;
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onLoaded(e.loaded); };
    xhr.onload = () => { try { resolve({ status: xhr.status, data: JSON.parse(xhr.responseText) }); } catch (e) { reject(e); } };
    xhr.onerror = () => reject(new Error("조각 응답을 받지 못했어"));
    xhr.send(body);
  });
}
async function uploadChunked(room: string, file: File, text: string, onProgress?: (ratio: number) => void, original = false, signal?: AbortSignal, dense = false) {
  if (signal?.aborted) throw stopped();
  const st = await post("upload/start", JSON.stringify({ room, name: file.name, size: file.size, type: file.type }));
  const up = (st.data as { upload?: { id: string; key: string; part_size: number } } | null)?.upload;
  if (st.status !== 200 || !up?.id) return st;
  const q = (n: number) => `/api/office/upload/part?id=${encodeURIComponent(up.id)}&key=${encodeURIComponent(up.key)}&n=${n}`;
  const size = Math.max(5 * 1024 * 1024, up.part_size || 20 * 1024 * 1024), parts: { n: number; etag: string }[] = [];
  try {
    for (let n = 1, off = 0; off < file.size; n++, off += size) {
      if (signal?.aborted) throw stopped();
      const r = await putPart(q(n), file.slice(off, Math.min(file.size, off + size)), (b) => onProgress?.(Math.min(1, (off + b) / file.size)), signal);
      const etag = (r.data as { etag?: string } | null)?.etag;
      if (r.status !== 200 || !etag) { void post("upload/abort", JSON.stringify({ id: up.id, key: up.key })).catch(() => {}); return r; }
      parts.push({ n, etag }); onProgress?.(Math.min(1, (off + size) / file.size));   // 진행 신호가 없는 폰에서도 조각마다 고리가 참
    }
    if (signal?.aborted) throw stopped();   // 조각은 다 갔지만 아직 글(upload/done) 전 = 여기서 끊어도 반쪽 0(조각은 abort 가 지움)
  } catch (e) { void post("upload/abort", JSON.stringify({ id: up.id, key: up.key })).catch(() => {}); throw e; }
  onProgress?.(1);
  return post("upload/done", JSON.stringify({ id: up.id, key: up.key, parts, room, name: file.name, ...(text ? { text, together: true } : {}), ...(original ? { original: "1" } : {}), ...(dense ? { dense: "1" } : {}) }));
}

// 사진 = 원본 + 보기용 작은 판을 같이(형 11-02 06:55 「사진도 혹시 마찬가지 원본일 필요는 없음. 소스로 쓰라고 주는거면 너네가 압축 전을 재요청 하면 되는거고. 이미지를 확인하는 거면 시스템이 내가 올리는 즉시 압축 시켜서 내용만 확인할 수 있게 하면 너네가 앞으로 계속 편할거야」 · 06:53 「나한테는 그대로임」)
//   작은 판 = 긴 변 1600 · webp(못 만들면 jpeg) 0.82 · 폼 칸 small_<차례> · 원본이 이미 작으면(긴 변 1600 안 · 400KB 아래) 안 만듦 · GIF·SVG 는 안 만듦 · 못 만들면 원본만(보내기는 안 막음)
//   서버(봄)가 원본 옆에 두고 photo·m/file 이 작은 판을 먼저 줌 · 형 화면 = 원본 그대로
const SMALL_EDGE = 1600, SMALL_SKIP = 400 * 1024, SMALL_TYPES = /^image\/(jpeg|png|webp|heic|heif|avif|bmp)$/i;
//   굽기 = 일꾼(Worker · OffscreenCanvas)에서 · 메인 줄은 안 멈춤(형 11-02 10:05 「올리는 동작과 내 다음채팅과는 렉같은거가 지장을 주면안돼. 지금은 순간 멎어서 다음채팅을 못 씀」 · 4배 느린 CPU 흉내 = 메인 긴 작업 96·118ms)
//   일꾼을 못 쓰는 기기(OffscreenCanvas 없음)만 옛 길(메인 캔버스) · 일꾼이 20초 안에 답 없으면 원본만
const SMALL_WORKER = `let webp = true;   // webp 로 못 굽는 기기(사파리 = png 로 줌)는 한 번 알면 다음부턴 바로 jpeg(png 굽기 한 번 아낌)
self.onmessage = async (e) => {
  const { id, file, edge, skip } = e.data;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const k = Math.min(1, edge / Math.max(bmp.width, bmp.height));
    if (k === 1 && file.size <= skip) { bmp.close(); self.postMessage({ id, blob: null }); return; }
    const w = Math.max(1, Math.round(bmp.width * k)), h = Math.max(1, Math.round(bmp.height * k));
    const c = new OffscreenCanvas(w, h), g = c.getContext("2d");
    if (!g) { bmp.close(); self.postMessage({ id, blob: null }); return; }
    g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.drawImage(bmp, 0, 0, w, h); bmp.close();
    let blob = webp ? await c.convertToBlob({ type: "image/webp", quality: 0.82 }) : null;
    if (!blob || blob.type !== "image/webp") { if (blob) webp = false; blob = await c.convertToBlob({ type: "image/jpeg", quality: 0.82 }); }
    self.postMessage({ id, blob });
  } catch { self.postMessage({ id, blob: null }); }
};`;
let worker: Worker | null | undefined, seq = 0;
const asked = new Map<number, (b: Blob | null) => void>();
function smallWorker(): Worker | null {
  if (worker !== undefined) return worker;
  try {
    if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") return (worker = null);
    const w = new Worker(URL.createObjectURL(new Blob([SMALL_WORKER], { type: "text/javascript" })));
    w.onmessage = (e: MessageEvent<{ id: number; blob: Blob | null }>) => { asked.get(e.data.id)?.(e.data.blob); asked.delete(e.data.id); };
    w.onerror = () => { for (const done of asked.values()) done(null); asked.clear(); };
    return (worker = w);
  } catch { return (worker = null); }
}
function shrinkOff(w: Worker, file: File) {
  return new Promise<Blob | null>((resolve) => {
    const id = ++seq, t = window.setTimeout(() => { asked.delete(id); resolve(null); }, 20_000);
    asked.set(id, (b) => { window.clearTimeout(t); resolve(b); });
    w.postMessage({ id, file, edge: SMALL_EDGE, skip: SMALL_SKIP });
  });
}
let mainWebp = true;
async function shrinkMain(file: File): Promise<Blob | null> {   // 옛 길(일꾼 못 쓰는 기기)
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const k = Math.min(1, SMALL_EDGE / Math.max(bmp.width, bmp.height));
  if (k === 1 && file.size <= SMALL_SKIP) { bmp.close(); return null; }
  const w = Math.max(1, Math.round(bmp.width * k)), h = Math.max(1, Math.round(bmp.height * k));
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); if (!g) { bmp.close(); return null; }
  g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.drawImage(bmp, 0, 0, w, h); bmp.close();
  const to = (type: string) => new Promise<Blob | null>((r) => c.toBlob(r, type, 0.82));
  let blob = mainWebp ? await to("image/webp") : null;
  if (!blob || blob.type !== "image/webp") { if (blob) mainWebp = false; blob = await to("image/jpeg"); }   // 사파리 = webp 로 못 구우면 png 로 줌 → jpeg(다음부턴 바로 jpeg)
  return blob;
}
async function smallImage(file: File): Promise<File | null> {
  if (!SMALL_TYPES.test(file.type)) return null;
  try {
    const w = smallWorker();
    const blob = w ? await shrinkOff(w, file) : await shrinkMain(file);
    if (!blob || blob.size >= file.size) return null;
    const ext = blob.type === "image/webp" ? ".webp" : ".jpg";
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".small" + ext, { type: blob.type, lastModified: file.lastModified });
  } catch { return null; }
}

export const attachmentSender = createAttachmentSender({
  upload: async (attempt, onProgress, signal) => {
    // 보낼 판 = 누른 때 스위치대로(압축판 · 원본) · 굽는 중이면 여기서 기다림(원본이 잘못 나가지 않게)
    const sent = await Promise.all(attempt.originals.map((o) => sendable(o.id, o.file)));
    if (signal?.aborted) throw stopped();   // 굽는 사이 눌렀으면 안 올림
    // 「원본」으로 보냄 = 서버 original=1(러너가 안 줄이고 file_meta 에 원본 표시 · 형 11-05 09:39 「압축됨 원본 둘중 하나로만 뜨게」)
    const original = sent.some((s) => s.original);
    const dense = sent.some((s) => s.dense);   // 「움직임 자세히」(형만 · 평소 꺼짐 · 서버 dense=1)
    // 파형 그림(소리·영상 · 고른 순간 구워 둠 · ../shim/wave.ts) = 같은 글에 「<이름>.파형.png」로 같이(형 11-05 09:41 「그 순간에 … 파형 분석해서 같이 공유」) · 못 구웠으면 없이
    const waves = (await Promise.all(attempt.originals.map((o) => waveFile(o.id)))).filter((w): w is File => !!w);
    const only = sent.length === 1 ? sent[0].file : null;
    if (only && only.type.startsWith("video/")) {
      const r = await uploadChunked(attempt.room, only, attempt.text || "", onProgress, original, signal, dense);
      if (r.status === 200 && waves.length) {   // 조각 길 = 영상 글 바로 뒤 글 하나로 파형(같은 방 · 글 없이 · 부름 0)
        const wf = new FormData();
        waves.forEach((w, i) => { wf.append("file", w); wf.append(`original_${i}`, "1"); });
        wf.set("room", attempt.room);
        void post("files", wf).catch(() => {});
      }
      return r;
    }
    const form = new FormData();
    for (const [i, s] of sent.entries()) {
      form.append("file", s.file);
      const small = await smallImage(s.file);
      if (small) form.append(`small_${i}`, small);
      if (!s.untouched) form.append(`orig_bytes_${i}`, String(s.origBytes));   // 줄였으면 원본 크기도(서버 file_meta.orig_bytes → 말풍선 「4.2 → 0.9MB」 · 형 10:42)
      if (s.untouched) form.append(`original_${i}`, "1");   // 파일마다 = 타일 블릿과 같은 뜻(서버가 file_meta 에 담으면 보낸 글도 같은 「압축됨/원본」)
    }
    waves.forEach((w, j) => { form.append("file", w); form.append(`original_${sent.length + j}`, "1"); });   // 파형 = 화면이 그린 그대로(안 줄임) · 원 파일 차례 뒤에
    form.set("room", attempt.room);
    if (original) form.set("original", "1");
    if (dense) form.set("dense", "1");
    if (attempt.text) form.set("text", attempt.text);
    form.set("together", "1");
    if (signal?.aborted) throw stopped();   // 작은 판 굽는 사이 눌렀으면 안 올림
    return upload(form, onProgress, signal);
  },
  body: (attempt) =>
    post(
      `rooms/${encodeURIComponent(attempt.room)}/messages`,
      JSON.stringify({ text: attempt.text }),
    ),
  release: dropAttachments,
  message: (room, message) => {
    const next = message as OfficeMsg;
    queryClient.setQueryData<{ messages: OfficeMsg[]; more?: boolean }>(
      ["nomute", "msgs", room],
      (old) => {
        const messages = new Map(
          (old?.messages || []).map((item) => [item.id, item]),
        );
        messages.set(next.id, next);
        return {
          ...old,
          messages: [...messages.values()].sort((a, b) => a.ts - b.ts),
        };
      },
    );
  },
  refresh: (room) => {
    for (const queryKey of [
      ["nomute", "rooms"],
      ["nomute", "msgs", room],
    ])
      void queryClient.invalidateQueries({ queryKey });
  },
});
