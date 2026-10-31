import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { afterEach, beforeEach, test } from "node:test";
import { setImmediate } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { Window } from "happy-dom";
import { act, createElement, Fragment } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { createAttachmentSender } from "../data/attachment-send.ts";
import {
  bodyOK,
  bodyRejected,
  deferred,
  fixture,
  input,
  partial,
  uploadOK,
} from "./attachment-fixture.ts";

// 실제 TSX 부품을 Node/Bun 모두에서 검사한다. React는 테스트와 같은 인스턴스를 쓴다.
const require = createRequire(import.meta.url);
const compiled = await build({
  entryPoints: [
    fileURLToPath(new URL("../ui/attachment-recovery.tsx", import.meta.url)),
  ],
  bundle: true,
  write: false,
  platform: "node",
  format: "esm",
  jsx: "automatic",
  plugins: [
    {
      name: "same-react",
      setup(builder) {
        builder.onResolve({ filter: /^react(?:\/.*)?$/ }, (args) => ({
          path: pathToFileURL(require.resolve(args.path)).href,
          external: true,
        }));
      },
    },
  ],
});
const { AttachmentRecovery } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString("base64")}`
);

let dom: Window;
const roots: Root[] = [];
const globals = new Map<string, PropertyDescriptor | undefined>();
beforeEach(() => {
  dom = new Window({ url: "https://office.test/" });
  for (const [key, value] of Object.entries({
    window: dom,
    document: dom.document,
    navigator: dom.navigator,
    HTMLElement: dom.HTMLElement,
    Node: dom.Node,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value,
    });
  }
});
afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  await dom.happyDOM.abort();
  for (const [key, previous] of globals) {
    if (previous) Object.defineProperty(globalThis, key, previous);
    else Reflect.deleteProperty(globalThis, key);
  }
  globals.clear();
});

async function mount(
  state: ReturnType<typeof createAttachmentSender>,
  room = "a",
) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  const render = async (nextRoom: string) =>
    act(async () => {
      root.render(
        createElement(
          Fragment,
          null,
          createElement(AttachmentRecovery, { state, room: nextRoom }),
          createElement("textarea", {
            "aria-label": "다음 글",
            defaultValue: "기다리는 동안 쓴 새 글",
          }),
        ),
      );
      await setImmediate();
    });
  await render(room);
  return { container, render };
}

test("partial copy outcomes keep original preview/download and explain confirmation without retry", async () => {
  const f = fixture([partial]);
  await f.state.submit(input());
  const view = await mount(f.state);
  assert.match(view.container.textContent || "", /전송 확인 필요/);
  assert.match(view.container.textContent || "", /winter · same.png/);
  assert.match(view.container.textContent || "", /bom · same.png · 권한 없음/);
  assert.match(view.container.textContent || "", /원래 본문/);
  assert.equal(view.container.querySelectorAll("img").length, 1);
  assert.match(
    view.container.querySelector("a[download]")?.getAttribute("href") || "",
    /^blob:/,
  );
  assert.equal(view.container.querySelector("button"), null);
  assert.ok(
    view.container.querySelector(".max-h-64.overflow-y-auto"),
    "records are bounded above the composer",
  );
  assert.deepEqual(f.released, []);
});

test("actual recovery button retries only frozen body, prevents double clicks, and leaves newer input alone", async () => {
  const pending = deferred();
  const f = fixture([uploadOK()], [bodyRejected, () => pending.promise]);
  await f.state.submit(input());
  const view = await mount(f.state);
  const button = view.container.querySelector("button")!;
  await act(async () => {
    button.click();
    button.click();
    await setImmediate();
  });
  assert.equal(f.uploadCalls.length, 1);
  assert.equal(f.bodyCalls.length, 2);
  assert.equal(f.bodyCalls[1].text, "원래 본문");
  assert.equal(
    view.container.querySelector("textarea")?.value,
    "기다리는 동안 쓴 새 글",
  );
  assert.deepEqual(f.released, []);
  await act(async () => {
    pending.resolve(bodyOK());
    await setImmediate();
  });
  assert.equal(
    view.container.querySelector('[aria-label="첨부 전송 기록"]'),
    null,
  );
  assert.equal(
    view.container.querySelector("textarea")?.value,
    "기다리는 동안 쓴 새 글",
  );
  assert.deepEqual(f.released, [["original-1"]]);
});

test("room change and return preserve all recovery records and rebuild original previews", async () => {
  const f = fixture([partial, partial]);
  await f.state.submit(input());
  await f.state.submit(input("a", "original-2"));
  const view = await mount(f.state);
  assert.equal(
    view.container.querySelectorAll('[aria-label="첨부 전송 기록"]').length,
    2,
  );
  await view.render("b");
  assert.equal(
    view.container.querySelectorAll('[aria-label="첨부 전송 기록"]').length,
    0,
  );
  await view.render("a");
  assert.equal(view.container.querySelectorAll("img").length, 2);
  assert.equal(f.uploadCalls.length, 2);
  assert.deepEqual(f.released, []);
});

test("unknown retry outcome removes retry action while retaining originals and copy evidence", async () => {
  const f = fixture(
    [uploadOK()],
    [bodyRejected, new TypeError("lost response")],
  );
  await f.state.submit(input());
  const view = await mount(f.state);
  await act(async () => {
    view.container.querySelector("button")!.click();
    await setImmediate();
  });
  assert.match(view.container.textContent || "", /전송 확인 필요/);
  assert.match(view.container.textContent || "", /저장 확인 · 복사본 1개/);
  assert.equal(view.container.querySelector("button"), null);
  assert.equal(view.container.querySelectorAll("a[download]").length, 1);
  assert.deepEqual(f.released, []);
});

test("the persistent recovery card owns originals before a delayed upload settles", async () => {
  const pending = deferred();
  const f = fixture([() => pending.promise]);
  const sending = f.state.submit(input());
  const view = await mount(f.state);
  assert.equal(view.container.querySelectorAll("[role=progressbar]").length, 1);   // 보내는 중 = 말풍선 자리 + 게이지(글 0 · 형 10-31)
  assert.doesNotMatch(view.container.textContent || "", /보내는 중/);
  await view.render("b");
  await act(async () => {
    pending.resolve(partial);
    await sending;
  });
  assert.equal(view.container.querySelectorAll("a[download]").length, 0);
  await view.render("a");
  assert.match(view.container.textContent || "", /전송 확인 필요/);
  assert.equal(view.container.querySelectorAll("a[download]").length, 1);
});
