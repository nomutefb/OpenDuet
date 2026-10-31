import {
  createAttachmentSender,
  type SendInput,
  type SendReply,
} from "../data/attachment-send.ts";

export const message = (room = "a", id = "message-1") => ({
  id,
  room,
  ts: 100,
  who: "형",
  kind: "human",
  text: "확인한 글",
});
export const uploadOK = (room = "a"): SendReply => ({
  status: 200,
  data: {
    ok: true,
    files: [{ bot: "winter", name: "same.png", path: "winter/same.png" }],
    message: message(room, "attachment-1"),
  },
});
export const bodyOK = (room = "a"): SendReply => ({
  status: 200,
  data: { ok: true, message: message(room, "body-1") },
});
export const bodyRejected: SendReply = {
  status: 500,
  data: { ok: false, error: "store", why: "저장 실패" },
};
export const partial: SendReply = {
  status: 207,
  data: {
    ok: true,
    files: [{ bot: "winter", name: "same.png", path: "winter/same.png" }],
    failed: [{ bot: "bom", name: "same.png", why: "권한 없음" }],
    message: message(),
  },
};
export function input(room = "a", id = "original-1"): SendInput {
  return {
    room,
    text: "원래 본문",
    originals: [
      {
        id,
        file: new File(["original bytes"], "same.png", { type: "image/png" }),
      },
    ],
  };
}
type Reply = SendReply | Error | (() => Promise<SendReply>);
export function deferred() {
  let resolve!: (reply: SendReply) => void;
  const promise = new Promise<SendReply>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
export function fixture(uploads: Reply[] = [], bodies: Reply[] = []) {
  const uploadCalls: SendInput[] = [],
    bodyCalls: SendInput[] = [],
    released: string[][] = [];
  const refreshed: string[] = [],
    messages: { room: string; message: unknown }[] = [];
  const reply = async (replies: Reply[]) => {
    const next = replies.shift();
    if (next instanceof Error) throw next;
    if (!next) throw new Error("unexpected extra request");
    return typeof next === "function" ? next() : next;
  };
  const state = createAttachmentSender({
    upload: (snapshot) => {
      uploadCalls.push(snapshot);
      return reply(uploads);
    },
    body: (snapshot) => {
      bodyCalls.push(snapshot);
      return reply(bodies);
    },
    release: (ids) => {
      released.push(ids);
    },
    refresh: (room) => {
      refreshed.push(room);
    },
    message: (room, confirmed) => {
      messages.push({ room, message: confirmed });
    },
  });
  return { state, uploadCalls, bodyCalls, released, refreshed, messages };
}
