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

export const attachmentSender = createAttachmentSender({
  upload: (attempt) => {
    const form = new FormData();
    for (const original of attempt.originals)
      form.append("file", original.file);
    form.set("room", attempt.room);
    if (attempt.text) form.set("text", attempt.text);
    return post("files", form);
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
