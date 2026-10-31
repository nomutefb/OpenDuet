import assert from "node:assert/strict";
import { test } from "node:test";
import { createAttachmentSender } from "../data/attachment-send.ts";
import {
  bodyOK,
  bodyRejected,
  deferred,
  fixture,
  input,
  message,
  partial,
  uploadOK,
} from "./attachment-fixture.ts";

test("207 retains originals and copy-level outcomes without posting body or reuploading", async () => {
  const f = fixture([partial]);
  const draft = input();
  await f.state.submit(draft);
  const card = f.state.forRoom("a")[0];
  assert.equal(card.phase, "needs-check");
  assert.equal(card.originals[0].file, draft.originals[0].file);
  assert.equal(
    card.saved[0].name,
    card.failed[0].name,
    "one source name can have both outcomes",
  );
  assert.equal(card.announcement, true);
  assert.equal(
    f.messages.length,
    1,
    "confirmed partial announcement still reaches the chat",
  );
  assert.equal(f.bodyCalls.length, 0);
  assert.deepEqual(f.released, []);
  await assert.rejects(
    f.state.submit({ ...draft, text: "수정한 본문" }),
    /이미 전송/,
  );
  assert.equal(f.uploadCalls.length, 1);
});

test("confirmed upload then explicit body 500 retries only the frozen body and releases only originals", async () => {
  const f = fixture([uploadOK()], [bodyRejected, bodyOK()]);
  const draft = input();
  await f.state.submit(draft);
  const card = f.state.forRoom("a")[0];
  assert.equal(card.phase, "body-retry");
  assert.deepEqual(f.released, []);
  draft.text = "새로 입력한 본문";
  draft.originals[0].id = "new-id";
  await f.state.retryBody(card.id);
  assert.equal(f.uploadCalls.length, 1);
  assert.deepEqual(
    f.bodyCalls.map((call) => call.text),
    ["원래 본문", "원래 본문"],
  );
  assert.deepEqual(f.released, [["original-1"]]);
  assert.deepEqual(f.state.forRoom("a"), []);
});

test("upload 200 with message null preserves stored copies and does not send body", async () => {
  const response = uploadOK();
  (response.data as Record<string, unknown>).message = null;
  const f = fixture([response]);
  await f.state.submit(input());
  const card = f.state.forRoom("a")[0];
  assert.equal(card.phase, "needs-check");
  assert.equal(card.saved.length, 1);
  assert.equal(card.announcement, false);
  await f.state.retryBody(card.id);
  assert.equal(f.bodyCalls.length, 0);
  assert.deepEqual(f.released, []);
});

test("upload network or JSON failure stays unknown and cannot be automatically resent", async () => {
  for (const error of [new TypeError("network"), new SyntaxError("JSON")]) {
    const f = fixture([error]);
    await f.state.submit(input());
    const card = f.state.forRoom("a")[0];
    assert.equal(card.phase, "needs-check");
    assert.equal(card.originals.length, 1);
    await f.state.retryBody(card.id);
    await assert.rejects(f.state.submit(input()), /이미 전송/);
    assert.equal(f.uploadCalls.length, 1);
    assert.equal(f.bodyCalls.length, 0);
    assert.deepEqual(f.released, []);
  }
});

test("generic body 500, malformed acknowledgement, and network ambiguity never enable retry", async () => {
  for (const body of [
    { status: 500, data: {} },
    { status: 200, data: { ok: true, message: null } },
    new TypeError("network"),
    new SyntaxError("JSON"),
  ]) {
    const f = fixture([uploadOK()], [body]);
    await f.state.submit(input());
    const card = f.state.forRoom("a")[0];
    assert.equal(card.phase, "needs-check");
    await f.state.retryBody(card.id);
    assert.equal(f.bodyCalls.length, 1);
    assert.deepEqual(f.released, []);
  }
});

test("complete upload and body clear the retained attempt and exactly its original IDs", async () => {
  const pending = deferred();
  const f = fixture([() => pending.promise], [bodyOK()]);
  const draft = input();
  const sending = f.state.submit(draft);
  const original = draft.originals[0];
  draft.originals = [...draft.originals, input("a", "new-file").originals[0]];
  draft.text = "새 초안";
  assert.equal(f.state.forRoom("a")[0].originals[0].file, original.file);
  pending.resolve(uploadOK());
  await sending;
  assert.deepEqual(f.released, [["original-1"]]);
  assert.equal(draft.text, "새 초안");
  assert.equal(draft.originals.length, 2);
  assert.deepEqual(f.state.forRoom("a"), []);
  await assert.rejects(f.state.submit(input()), /이미 전송/);
});

test("file-only full success makes no body request", async () => {
  const f = fixture([uploadOK()]);
  await f.state.submit({ ...input(), text: "" });
  assert.equal(f.bodyCalls.length, 0);
  assert.deepEqual(f.released, [["original-1"]]);
});

test("shared-room copy with bot null is a valid complete upload", async () => {
  const response = uploadOK();
  (response.data as { files: { bot: string | null }[] }).files[0].bot = null;
  const f = fixture([response], [bodyOK()]);
  await f.state.submit(input());
  assert.deepEqual(f.released, [["original-1"]]);
});

test("duplicate filenames and multiple destinations do not identify or discard original files", async () => {
  const f = fixture([partial]);
  const draft = input();
  draft.originals = [...draft.originals, input("a", "original-2").originals[0]];
  await f.state.submit(draft);
  assert.deepEqual(
    f.state.forRoom("a")[0].originals.map((file) => file.id),
    ["original-1", "original-2"],
  );
  assert.deepEqual(f.released, []);
});

test("a second click while an upload is pending cannot start another request", async () => {
  const pending = deferred();
  const f = fixture([() => pending.promise]);
  const first = f.state.submit(input());
  await assert.rejects(f.state.submit(input()), /진행 중/);
  assert.equal(f.uploadCalls.length, 1);
  pending.resolve(partial);
  await first;
});

test("two body retry clicks use one request and preserve room and captured text", async () => {
  const pending = deferred();
  const f = fixture([uploadOK()], [bodyRejected, () => pending.promise]);
  await f.state.submit(input());
  const id = f.state.forRoom("a")[0].id;
  const first = f.state.retryBody(id);
  const second = f.state.retryBody(id);
  assert.equal(f.bodyCalls.length, 2);
  assert.equal(f.bodyCalls[1].room, "a");
  pending.resolve(bodyOK());
  await Promise.all([first, second]);
  assert.deepEqual(f.released, [["original-1"]]);
});

test("new attempts and room changes do not overwrite unresolved originals", async () => {
  const f = fixture([partial, partial, uploadOK("b")], [bodyOK("b")]);
  await f.state.submit(input());
  await f.state.submit(input("a", "original-2"));
  await f.state.submit(input("b", "original-b"));
  assert.equal(f.state.forRoom("a").length, 2);
  assert.deepEqual(
    f.state
      .forRoom("a")
      .flatMap((card) => card.originals.map((file) => file.id)),
    ["original-1", "original-2"],
  );
  assert.deepEqual(f.state.forRoom("b"), []);
  assert.deepEqual(f.released, [["original-b"]]);
});

test("editing text, adding or removing attachments never unlocks previously attempted IDs", async () => {
  const f = fixture([partial]);
  const draft = input();
  await f.state.submit(draft);
  const newFile = input("a", "new-file").originals[0];
  await assert.rejects(
    f.state.submit({ ...draft, originals: [...draft.originals, newFile] }),
    /이미 전송/,
  );
  await assert.rejects(f.state.submit({ ...draft, text: "" }), /이미 전송/);
  await assert.rejects(f.state.submit({ ...draft, room: "b" }), /이미 전송/);
  assert.equal(f.uploadCalls.length, 1);
});

test("missing originals and duplicate IDs reject before ownership transfer or network calls", async () => {
  const f = fixture();
  const draft = input();
  await assert.rejects(
    f.state.submit({
      ...draft,
      originals: [{ id: "missing", file: undefined as unknown as File }],
    }),
    /원본/,
  );
  await assert.rejects(
    f.state.submit({
      ...draft,
      originals: [draft.originals[0], draft.originals[0]],
    }),
    /원본/,
  );
  await assert.rejects(f.state.submit({ ...draft, originals: [] }), /원본/);
  assert.equal(f.uploadCalls.length, 0);
  assert.deepEqual(f.state.forRoom("a"), []);
});

test("incomplete upload receipts and wrong-room messages remain unconfirmed", async () => {
  for (const data of [
    {},
    { ok: true, files: [], message: message() },
    {
      ok: true,
      files: [{ bot: "winter", name: "same.png", path: "p" }],
      message: message("b"),
    },
    {
      ok: true,
      files: [{ bot: "winter", name: "same.png", path: "p" }],
      failed: "bad",
      message: message(),
    },
  ]) {
    const f = fixture([{ status: 200, data }]);
    await f.state.submit(input());
    assert.equal(f.state.forRoom("a")[0].phase, "needs-check");
    assert.equal(f.bodyCalls.length, 0);
    assert.deepEqual(f.released, []);
  }
});

test("definite upload rejection retains the server's explanation", async () => {
  const f = fixture([
    { status: 413, data: { ok: false, why: "파일이 너무 커" } },
  ]);
  await f.state.submit(input());
  assert.match(f.state.forRoom("a")[0].detail, /파일이 너무 커/);
  assert.deepEqual(f.released, []);
});

test("preview cleanup failure cannot turn confirmed delivery into a retryable send", async () => {
  const state = createAttachmentSender({
    upload: async () => uploadOK(),
    body: async () => bodyOK(),
    refresh: () => {},
    release: () => {
      throw new Error("cache unavailable");
    },
  });
  await state.submit(input());
  assert.deepEqual(state.forRoom("a"), []);
  await assert.rejects(state.submit(input()), /이미 전송/);
});
