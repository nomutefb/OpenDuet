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

export const attachmentSender = createAttachmentSender({
  upload: (attempt, onProgress) => {
    const form = new FormData();
    for (const original of attempt.originals)
      form.append("file", original.file);
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
