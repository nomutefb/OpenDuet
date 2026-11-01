import { queryClient } from "@/query-client";
import { dropAttachments } from "../shim/attachments";
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
function upload(form: FormData, onProgress?: (ratio: number) => void) {
  return new Promise<{ status: number; data: unknown }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/office/files");
    xhr.withCredentials = true;
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress?.(e.loaded / e.total); };
    let wait = 0;   // 다 올린 뒤 서버 답을 기다리는 한도(형 11-01 09:01 글이 게이지 95% 에서 멈춘 채 안 감 · 서버가 도중에 끊기면 답이 영영 안 옴) → 넘으면 끊고 「전송 확인 필요」로
    xhr.upload.onload = () => { wait = window.setTimeout(() => xhr.abort(), REPLY_WAIT_MS); };
    xhr.onabort = () => { window.clearTimeout(wait); reject(new Error("서버 답이 오지 않았어")); };
    xhr.onloadend = () => window.clearTimeout(wait);
    xhr.onload = () => {
      try { resolve({ status: xhr.status, data: JSON.parse(xhr.responseText) }); } catch (e) { reject(e); }
    };
    xhr.onerror = () => reject(new Error("첨부 응답을 받지 못했어"));
    xhr.send(form);
  });
}

// 사진 = 원본 + 보기용 작은 판을 같이(형 11-02 06:55 「사진도 혹시 마찬가지 원본일 필요는 없음. 소스로 쓰라고 주는거면 너네가 압축 전을 재요청 하면 되는거고. 이미지를 확인하는 거면 시스템이 내가 올리는 즉시 압축 시켜서 내용만 확인할 수 있게 하면 너네가 앞으로 계속 편할거야」 · 06:53 「나한테는 그대로임」)
//   작은 판 = 긴 변 1600 · webp(못 만들면 jpeg) 0.82 · 폼 칸 small_<차례> · 원본이 이미 작으면(긴 변 1600 안 · 400KB 아래) 안 만듦 · GIF·SVG 는 안 만듦 · 못 만들면 원본만(보내기는 안 막음)
//   서버(봄)가 원본 옆에 두고 photo·m/file 이 작은 판을 먼저 줌 · 형 화면 = 원본 그대로
const SMALL_EDGE = 1600, SMALL_SKIP = 400 * 1024;
async function smallImage(file: File): Promise<File | null> {
  if (!/^image\/(jpeg|png|webp|heic|heif|avif|bmp)$/i.test(file.type)) return null;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const k = Math.min(1, SMALL_EDGE / Math.max(bmp.width, bmp.height));
    if (k === 1 && file.size <= SMALL_SKIP) { bmp.close(); return null; }
    const w = Math.max(1, Math.round(bmp.width * k)), h = Math.max(1, Math.round(bmp.height * k));
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const g = c.getContext("2d"); if (!g) { bmp.close(); return null; }
    g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.drawImage(bmp, 0, 0, w, h); bmp.close();
    const to = (type: string) => new Promise<Blob | null>((r) => c.toBlob(r, type, 0.82));
    let blob = await to("image/webp");
    if (!blob || blob.type !== "image/webp") blob = await to("image/jpeg");   // 사파리 = webp 로 못 구우면 png 로 줌 → jpeg
    if (!blob || blob.size >= file.size) return null;
    const ext = blob.type === "image/webp" ? ".webp" : ".jpg";
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".small" + ext, { type: blob.type, lastModified: file.lastModified });
  } catch { return null; }
}

export const attachmentSender = createAttachmentSender({
  upload: async (attempt, onProgress) => {
    const form = new FormData();
    for (const [i, original] of attempt.originals.entries()) {
      form.append("file", original.file);
      const small = await smallImage(original.file);
      if (small) form.append(`small_${i}`, small);
    }
    form.set("room", attempt.room);
    if (attempt.text) form.set("text", attempt.text);
    form.set("together", "1");
    return upload(form, onProgress);
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
