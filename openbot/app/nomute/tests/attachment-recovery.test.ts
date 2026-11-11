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
  landed?: (attempt: unknown) => boolean,
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
          createElement(AttachmentRecovery, { state, room: nextRoom, landed }),
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

// 카드 첫 단추 = × 끄기(.nar-x · 형 11-06 20:31 「끄기버튼만잇으면될듯」 · 「5초는 자동.」) → 「button」 첫 것은 다시 보내기가 아님.
// 다시 보내기는 글자로 집는다. 없음 단언은 개수로(요소를 단언에 넣으면 실패 글이 happy-dom 화면 통째를 펼치다 램을 다 먹고 SIGKILL · 11-07 8G 에서 13초 만에 7.8G).
const retryButtons = (root: ParentNode) =>
  [...root.querySelectorAll("button")].filter((b) => (b.textContent || "").includes("본문만 다시 보내기"));
const count = (root: ParentNode, selector: string) => root.querySelectorAll(selector).length;

test("partial copy outcomes keep original preview/download and explain confirmation without retry", async () => {
  const f = fixture([partial]);
  await f.state.submit(input());
  const view = await mount(f.state);
  assert.match(view.container.textContent || "", /파일을 전송하지 못했습니다\. 다시 시도해 주세요\./);
  assert.doesNotMatch(view.container.textContent || "", /winter · same.png|권한 없음/);   // 받는 곳별 결과 = 화면 0 · 기록에만(형 11-12 07:27 「한문장으로」)
  assert.match(view.container.textContent || "", /원래 본문/);
  assert.equal(view.container.querySelectorAll("img").length, 1);
  assert.match(
    view.container.querySelector("a[download]")?.getAttribute("href") || "",
    /^blob:/,
  );
  assert.equal(retryButtons(view.container).length, 0);
  assert.equal(count(view.container, "button.nar-x[aria-label=닫기]"), 1);   // 끄기(×) 하나 · 5초 뒤 저절로(형 11-06 20:31)
  assert.ok(
    view.container.querySelector(".nac-box.overflow-y-auto"),   // 칸 높이 = 화면 반(.nac-box · 11-02 07:19 256px 잘림 고침)
    "records are bounded above the composer",
  );
  assert.deepEqual(f.released, []);
});

test("actual recovery button retries only frozen body, prevents double clicks, and leaves newer input alone", async () => {
  const pending = deferred();
  const f = fixture([uploadOK()], [bodyRejected, () => pending.promise]);
  await f.state.submit(input());
  const view = await mount(f.state);
  const [button] = retryButtons(view.container);
  assert.ok(button, "retry button is rendered");
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
  assert.equal(count(view.container, '[aria-label="첨부 전송 기록"]'), 0);
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
    const [retry] = retryButtons(view.container);
    assert.ok(retry, "retry button is rendered");
    retry.click();
    await setImmediate();
  });
  assert.match(view.container.textContent || "", /파일을 전송하지 못했습니다\. 다시 시도해 주세요\./);
  assert.doesNotMatch(view.container.textContent || "", /저장 확인 · 복사본/);
  assert.equal(retryButtons(view.container).length, 0);
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
  assert.match(view.container.textContent || "", /파일을 전송하지 못했습니다\. 다시 시도해 주세요\./);
  assert.equal(view.container.querySelectorAll("a[download]").length, 1);
});

test("a sending bubble hides once the real message has landed, while the upload still settles", async () => {   // 형 11-02 09:22 「이미지 업로드 직전에 이렇게 2개로 겹쳣다가 정상되는 이슈」
  const pending = deferred();
  const f = fixture([() => pending.promise]);
  const sending = f.state.submit(input());
  let landed = false;
  const view = await mount(f.state, "a", (attempt) => landed && typeof (attempt as { at?: number }).at === "number");
  assert.equal(view.container.querySelectorAll("[role=progressbar]").length, 1);   // 아직 방에 없음 = 고리 보임
  landed = true;
  await view.render("a");
  assert.equal(view.container.querySelectorAll("[role=progressbar]").length, 0);   // 진짜 글이 떴음 = 보내는 중 말풍선 숨김(겹침 0)
  await act(async () => {
    pending.resolve(uploadOK());
    await sending;
  });
  assert.equal(view.container.querySelectorAll("[role=progressbar]").length, 0);   // 올리기는 끝까지 돌고(숨긴 건 보이는 것뿐) 다시 고리가 안 살아남
});
