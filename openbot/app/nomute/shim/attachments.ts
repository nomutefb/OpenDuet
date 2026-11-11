// 입력칸 첨부 — 원본 입력칸은 고르자마자 /api/channels/:id/attachments 로 올리고 /api/attachments/:id 로 미리보기를 그림.
// 우리 서버는 「파일 + 글」을 한 번에 받는 길(POST /api/office/files)이라, 고른 파일은 보낼 때까지 화면이 들고 있고
// 미리보기 주소(/api/attachments/:id)는 서비스 워커가 이 캐시(office-app-att)에서 꺼내 줌(public/sw.js).
// 사진 압축 = 고르는 순간 굽고 원본도 같이 들고 있음 · 보낼 때 「압축 ON / 원본」 스위치로 고름(./compress.ts)
//   형 11-05 「첨부할때, 디폴트값은 압축인데, 압축이라고 온 켜져있는 걸 토글하면 원본 으로 바뀌뀌고, 원본으로 전달되게해줘」 · 「이거는 사진, 영상 공통이야. 다른거는 애초에 원본으로 가야하고.」
import { packImage, shouldPack } from "./compress";
import { MEDIA_RE, waveOf } from "./wave";

type Entry = { file: File; packed: File | null; pending: boolean; ready: Promise<void>; mode?: boolean; dense?: boolean; wave?: Promise<File | null> };
const files = new Map<string, Entry>();
const CACHE = "office-app-att";

// ── 「압축 ON / 원본」 스위치 · 기본 = 압축 · 마지막 고른 것 기억(nm-compress)
const KEY = "nm-compress";
let on = (() => { try { return localStorage.getItem(KEY) !== "0"; } catch { return true; } })();
let version = 0;
const listeners = new Set<() => void>();
const emit = () => { version++; for (const l of listeners) l(); };
export const compressOn = () => on;
export function setCompress(next: boolean) {
  if (next === on) return;
  on = next;
  try { localStorage.setItem(KEY, next ? "1" : "0"); } catch { /* 이번 탭만 */ }
  emit();
}
// ── 「움직임 자세히」(영상만 · 형만 · 평소 꺼짐 · 형 11-12 06:4x 「영상쪼개서 보내는건 사용자만 기능이 있으면 돼. 그리고 평소에는 off야」)
//   켜면 서버 러너가 30프레임마다 쪼갠 모음을 같이 붙임 · 기억 안 함 = 한 번 보내면 다시 꺼짐
let dense = false;
export const denseOn = () => dense;
export function setDense(next: boolean) { if (next !== dense) { dense = next; emit(); } }
export function subscribeCompress(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
/** useSyncExternalStore 용 = 스위치·압축 결과가 바뀔 때마다 오름 */
export const compressVersion = () => version;

/** 압축이 먹는 꼴 = 사진·영상(영상 압축은 아직 · 서버 러너가 줄임) · 나머지 = 늘 원본 */
export const isMedia = (f: { type: string }) => /^(image|video)\//i.test(f.type);
const pick = (e: Entry, mode: boolean) => (mode && e.packed ? e.packed : e.file);

/** 타일 머리표가 읽음(attachment-strip.tsx · window.nmCompress.info) = 지금 스위치로 보낼 판의 크기·이름 */
export function compressInfo(id: string) {
  const e = files.get(id);
  if (!e) return undefined;
  const sent = pick(e, on);
  return { name: sent.name, size: sent.size, packed: sent !== e.file, pending: e.pending, media: isMedia(e.file) };
}

export async function putAttachment(f: File) {
  const id = `att-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const entry: Entry = { file: f, packed: null, pending: false, ready: Promise.resolve() };
  files.set(id, entry);
  const preview = (async () => { try { await (await caches.open(CACHE)).put(`/api/attachments/${id}`, new Response(f, { headers: { "content-type": f.type || "application/octet-stream" } })); } catch { /* 미리보기만 빠짐 */ } })();
  // 소리·영상 = 고른 순간 파형 그림도 굽기 시작(./wave.ts · 형 11-05 09:41 「그 순간에 내가 올리는 부분에서 파형 분석해서 같이 공유」) · 보내기는 안 막음(보낼 때 waveFile 이 잠깐 기다림)
  if (MEDIA_RE.test(f.name)) entry.wave = waveOf(f).then((w) => w?.file ?? null, () => null);
  if (shouldPack(f)) {
    // 타일 = 굽는 동안 「올리는 중」(입력칸이 그동안 보내기를 막음) · 미리보기 = 원본(화질 그대로)
    entry.pending = true;
    entry.ready = packImage(f).then((p) => { entry.packed = p; }, () => {}).finally(() => { entry.pending = false; emit(); });
    emit();
  }
  await Promise.all([preview, entry.ready]);
  return { id, name: f.name, mimeType: f.type || "application/octet-stream", size: f.size };
}

/** 보낼 파일(지우지 않음 · 보내기가 실패하면 입력칸 첨부 알약이 그대로 남으니 다시 보낼 수 있게)
 *  누른 순간의 스위치를 그 첨부에 적어 둠 = 줄 서서 늦게 올라가도 누른 때 고른 판으로(sendable) */
export function peekAttachments(ids: string[]): File[] {
  queueMicrotask(() => setDense(false));   // 「움직임 자세히」 = 한 번 보내면 다시 꺼짐(평소 꺼짐)
  return ids.map((id) => {
    const e = files.get(id);
    if (!e) return undefined;
    e.mode = on;
    e.dense = dense && /^video\//i.test(e.file.type || "") || dense && /\.(mp4|mov|m4v|webm)$/i.test(e.file.name);
    return pick(e, on);
  }).filter((f): f is File => !!f);
}

/** 올리기 직전(data/attachment-state.ts) = 굽는 중이면 기다렸다가 누른 때 스위치대로
 *  original = 형이 「원본」으로 골라 보냄(사진·영상만 뜻이 있음) · untouched = 보낸 바이트가 고른 파일 그대로(1MB 아래 사진·문서 포함 = 타일 「원본」과 같음) */
export async function sendable(id: string, fallback: File): Promise<{ file: File; original: boolean; untouched: boolean; origBytes: number; dense: boolean }> {
  const e = files.get(id);
  if (!e) return { file: fallback, original: !on && isMedia(fallback), untouched: true, origBytes: fallback.size, dense: false };
  await e.ready;
  const mode = e.mode ?? on, file = pick(e, mode);
  return { file, original: !mode && isMedia(e.file), untouched: file === e.file, origBytes: e.file.size, dense: !!e.dense };   // origBytes = 고른 원본 크기(형 11-05 10:42 「압축 전 후 를 알수가잇나 혹시?」)
}

/** 그 첨부의 파형 그림(소리·영상만 · 못 풀었거나 아직이면 null) · 늦어도 ms 까지만 기다림 = 보내기가 파형 때문에 오래 멈추지 않게 */
export async function waveFile(id: string, ms = 8000): Promise<File | null> {
  const w = files.get(id)?.wave;
  if (!w) return null;
  let t = 0;
  const late = new Promise<null>((ok) => { t = setTimeout(() => ok(null), ms) as unknown as number; });
  try { return await Promise.race([w, late]); } finally { clearTimeout(t); }
}

/** 보낸 뒤에만 비움 */
export function dropAttachments(ids: string[]) {
  for (const id of ids) { files.delete(id); if (typeof caches !== "undefined") void caches.open(CACHE).then((c) => c.delete(`/api/attachments/${id}`)).catch(() => {}); }
  if (ids.length) emit();
}

// 원본 입력칸(attachment-strip.tsx)이 읽는 다리 — 원본 파일은 우리 모듈을 부르지 않고 이것만 봄(없으면 아무 일 없음)
export type NmCompress = {
  get: () => boolean;
  set: (on: boolean) => void;
  subscribe: (fn: () => void) => () => void;
  snapshot: () => number;
  info: typeof compressInfo;
  dense?: { get: () => boolean; set: (on: boolean) => void };
};
if (typeof window !== "undefined") {
  (window as unknown as { nmCompress?: NmCompress }).nmCompress = { get: compressOn, set: setCompress, subscribe: subscribeCompress, snapshot: compressVersion, info: compressInfo, dense: { get: denseOn, set: setDense } };
}
