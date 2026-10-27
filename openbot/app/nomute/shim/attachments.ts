// 입력칸 첨부 — 원본 입력칸은 고르자마자 /api/channels/:id/attachments 로 올리고 /api/attachments/:id 로 미리보기를 그림.
// 우리 서버는 「파일 + 글」을 한 번에 받는 길(POST /api/office/files)이라, 고른 파일은 보낼 때까지 화면이 들고 있고
// 미리보기 주소(/api/attachments/:id)는 서비스 워커가 이 캐시(office-app-att)에서 꺼내 줌(public/sw.js).
const files = new Map<string, File>();
const CACHE = "office-app-att";

export async function putAttachment(f: File) {
  const id = `att-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  files.set(id, f);
  try { await (await caches.open(CACHE)).put(`/api/attachments/${id}`, new Response(f, { headers: { "content-type": f.type || "application/octet-stream" } })); } catch { /* 미리보기만 빠짐 */ }
  return { id, name: f.name, mimeType: f.type || "application/octet-stream" };
}

/** 보낼 파일(지우지 않음 · 보내기가 실패하면 입력칸 첨부 알약이 그대로 남으니 다시 보낼 수 있게) */
export function peekAttachments(ids: string[]): File[] {
  return ids.map((id) => files.get(id)).filter((f): f is File => !!f);
}

/** 보낸 뒤에만 비움 */
export function dropAttachments(ids: string[]) {
  for (const id of ids) { files.delete(id); void caches.open(CACHE).then((c) => c.delete(`/api/attachments/${id}`)).catch(() => {}); }
}
