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

// fetch 는 올리는 진행률을 못 줘서 첨부만 XHR(형 10-31 「이미지 아래에 전송 게이지가 가로로 차면 될듯」)
function upload(form: FormData, onProgress?: (ratio: number) => void) {
  return new Promise<{ status: number; data: unknown }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/office/files");
    xhr.withCredentials = true;
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress?.(e.loaded / e.total); };
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
