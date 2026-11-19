import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import { after, afterEach, test } from "node:test";
import { setTimeout as pause } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { Window } from "happy-dom";

// Bun은 파일 사이 React DOM 모듈을 공유한다. 앞 시험이 window 없이 먼저 불러오면
// 입력 지원 판정이 굳어 input 이벤트가 빠진다. 실제 화면 검사를 새 프로세스에서 전부 실행한다.
// Node --test는 이미 파일마다 격리하므로 그대로 실행한다.
if (process.versions.bun && process.env.NM_ROOM_CREATE_TEST_CHILD !== "1") {
  test("방 생성 실제 화면 회귀 — 독립 DOM에서 다섯 흐름", { timeout: 30_000 }, async (t) => {
    const { stdout, stderr } = await promisify(execFile)(process.execPath, ["test", fileURLToPath(import.meta.url)], {
      env: { ...process.env, NM_ROOM_CREATE_TEST_CHILD: "1" }, timeout: 25_000,
    });
    t.diagnostic(stdout + stderr);
  });
} else {
// 기차의 Bun 설치는 esbuild를 Vite 아래에 둔다. 앱 빌드와 같은 컴파일러를 찾는다.
const require = createRequire(import.meta.url);
const { build }: typeof import("esbuild") = await import(pathToFileURL(createRequire(require.resolve("vite")).resolve("esbuild")).href);
// 실제 판·게이지·초안·캐시를 함께 검사한다. 서버와 화면 이동만 격리한다.
const dom = new Window({ url: "https://office.test/" });
const previous = new Map<string, PropertyDescriptor | undefined>();
for (const [key, value] of Object.entries({ window: dom, document: dom.document,
  navigator: dom.navigator, HTMLElement: dom.HTMLElement, Node: dom.Node, Image: dom.Image,
  localStorage: dom.localStorage, CustomEvent: dom.CustomEvent, IS_REACT_ACT_ENVIRONMENT: true })) {
  previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
  Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
}
const { act, createElement: h } = await import("react");
const { createRoot } = await import("react-dom/client");
const { QueryClient, QueryClientProvider } = await import("@tanstack/react-query");
const compiled = await build({
  stdin: { contents: 'export { RoomMake } from "../ui/room-fab"; export { TempRoomDialog } from "../ui/temp-room";',
    resolveDir: fileURLToPath(new URL(".", import.meta.url)), loader: "tsx" },
  bundle: true, write: false, platform: "node", format: "esm", jsx: "automatic", loader: { ".css": "empty" },
  plugins: [{ name: "test-boundaries", setup(b) {
    b.onResolve({ filter: /^@\/components\/duet\/icons$/ }, () => ({ path: fileURLToPath(new URL("../../src/components/duet/icons.tsx", import.meta.url)) }));
    b.onResolve({ filter: /^(react(?:-dom)?(?:\/.*)?|@tanstack\/react-query)$/ }, (a) => ({ path: import.meta.resolve(a.path), external: true }));
    b.onResolve({ filter: /^@tanstack\/react-router$/ }, () => ({ path: "nav", namespace: "test" }));
    b.onLoad({ filter: /.*/, namespace: "test" }, () => ({ contents: 'export const useNavigate = () => (detail) => { window.dispatchEvent(new CustomEvent("test-navigate", {detail})); };', loader: "js" }));
  } }],
});
const { RoomMake, TempRoomDialog } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString("base64")}`);
const roots: ReturnType<typeof createRoot>[] = [], clients: InstanceType<typeof QueryClient>[] = [];
let post: (body: Record<string, unknown>) => Promise<Response>;
let posts: Record<string, unknown>[] = [], candidates = 0;
const oldFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  const path = String(url);
  if (path.endsWith("/people")) return Response.json({ people: [{ who: "검사봇", kind: "bot", cls: "클로드" }] });
  if (path.endsWith("/temprooms") && init?.method !== "POST") { candidates++; return Response.json({ candidates: ["검사봇"] }); }
  if (init?.method === "POST") { const body = JSON.parse(String(init.body)); posts.push(body); return post(body); }
  throw new Error(`unexpected test request: ${path}`);
};
afterEach(async () => {
  await act(async () => { for (const r of roots.splice(0)) r.unmount(); });
  for (const q of clients.splice(0)) q.clear();
  document.body.replaceChildren(); localStorage.clear(); posts = []; candidates = 0;
});
after(async () => {
  globalThis.fetch = oldFetch;
  await dom.happyDOM.abort();
  for (const [key, desc] of previous) { if (desc) Object.defineProperty(globalThis, key, desc); else Reflect.deleteProperty(globalThis, key); }
});
async function mount(edit?: object) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } }); clients.push(qc);
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host); roots.push(root);
  let closed = 0;
  await act(async () => { root.render(h(QueryClientProvider, { client: qc }, edit ? h(TempRoomDialog, { edit, onClose: () => closed++ }) : h(RoomMake))); });
  await act(async () => { await pause(20); });
  return { qc, host, closed: () => closed };
}
const button = (text: string) => [...document.querySelectorAll<HTMLButtonElement>("button")].find((b) => b.textContent === text || b.getAttribute("aria-label") === text)!;
const go = () => document.querySelector<HTMLButtonElement>(".nm-go")!;
async function click(el: HTMLElement) { assert.ok(!!el); await act(async () => { el.click(); }); }
async function open() { await click(document.querySelector<HTMLButtonElement>('[aria-label="대화방 추가"]')!); }   // 방 만들기 = 탭 「+」(형 11-20 07:36 우하단 「+」 뺌 · RoomMake)
async function fill(selector: string, value: string) {
  const el = document.querySelector<HTMLInputElement>(selector)!;
  const proto = el.tagName === "INPUT" ? dom.HTMLInputElement.prototype : dom.HTMLTextAreaElement.prototype;
  await act(async () => { Object.getOwnPropertyDescriptor(proto, "value")!.set!.call(el, value); el.dispatchEvent(new dom.Event("input", { bubbles: true })); });
}
async function valid() { await fill("input", "새 방"); await fill("textarea", "함께 검사"); await click(button("이 묶음 다")); }
async function elapsed(ms: number) { await act(async () => { await pause(ms); }); }

test("첫 누름 전에 판·명단 준비, 숨은 판은 Esc를 먹지 않고 옛 입력은 복원하지 않는다", async () => {
  localStorage.setItem("nm-draft:room-new", JSON.stringify({ name: "옛 방", purpose: "옛 글", picked: ["검사봇"] }));
  const { host } = await mount();
  assert.equal(candidates, 1);
  assert.equal(host.querySelectorAll('[role="dialog"]').length, 0);
  const field = host.querySelector("input");
  const esc = new dom.KeyboardEvent("keydown", { key: "Escape", cancelable: true });
  dom.dispatchEvent(esc); assert.equal(esc.defaultPrevented, false);
  await open();
  assert.equal(host.querySelector("input") === field, true, "열 때 이미 준비한 DOM을 쓴다");
  assert.equal((field as HTMLInputElement).value, "");
  assert.equal((host.querySelector("textarea") as HTMLTextAreaElement).value, "");
  assert.equal(go().textContent, "방 생성"); assert.equal(go().disabled, true);
  await click(button("닫기"));
  assert.equal(host.querySelectorAll('[role="dialog"],[role="alertdialog"]').length, 0);
});

test("작성 후 버리고 다시 열면 이름·지침·선택·기간이 모두 초기화된다", async () => {
  await mount(); await open(); await valid(); await click(button("영구"));
  await click(button("닫기"));
  await click(document.querySelector<HTMLElement>('[role="alertdialog"] button:last-child')!); await open();
  assert.equal(document.querySelector<HTMLInputElement>("input")!.value, "");
  assert.equal(document.querySelector<HTMLTextAreaElement>("textarea")!.value, "");
  assert.match(document.querySelector("legend")!.textContent!, /0명/);
  assert.equal(document.querySelector('[role="slider"]')!.getAttribute("aria-valuenow"), "1");
  assert.equal(localStorage.getItem("nm-draft:room-new"), null);
});

test("게이지 → 생성 중 → 체크 → 이동; 늦는 목록 재조회가 새 방 입장을 막지 않는다", async () => {
  const { qc } = await mount(); await open(); await valid();
  let resolve!: (r: Response) => void;
  post = () => new Promise((r) => { resolve = r; });
  qc.invalidateQueries = () => new Promise(() => {});
  const navs: unknown[] = [];
  const navigate = (e: Event) => navs.push((e as CustomEvent).detail);
  window.addEventListener("test-navigate", navigate);
  await click(go()); await click(go());
  assert.equal(go().dataset.stage, "fill"); assert.equal(posts.length, 0);
  assert.equal(document.querySelector("fieldset")!.hasAttribute("inert"), true);
  assert.equal(button("닫기").disabled, true);
  await act(async () => { dom.dispatchEvent(new dom.KeyboardEvent("keydown", { key: "Escape", cancelable: true })); });
  assert.equal(document.querySelectorAll('[role="dialog"]').length, 1);
  assert.equal(document.querySelectorAll('[role="alertdialog"]').length, 0);
  await elapsed(950);
  assert.equal(go().dataset.stage, "wait"); assert.match(go().textContent!, /생성 중 …/); assert.equal(posts.length, 1);
  await act(async () => { resolve(Response.json({ room: { id: "temp-new", name: "새 방", kind: "group", temp: true }, members: ["검사봇"] })); });
  assert.equal(go().dataset.stage, "ok"); assert.equal(navs.length, 0);
  assert.equal(qc.getQueryData<any[]>(["nomute", "rooms"])?.[0].id, "temp-new");
  await elapsed(600);
  assert.deepEqual(navs, [{ to: "/channels/$channelId", params: { channelId: "temp-new" } }]);
  assert.equal(document.querySelectorAll('[role="dialog"]').length, 0);
  window.removeEventListener("test-navigate", navigate);
});

test("생성 실패는 입력을 보존하고 다시 누르면 수정한 내용을 한 번만 보낸다", async () => {
  await mount(); await open(); await valid();
  post = async () => Response.json({ ok: false, why: "검사용 거절" }, { status: 500 });
  await click(go()); await elapsed(950);
  assert.equal(go().dataset.stage, "err");
  assert.equal(document.querySelector<HTMLInputElement>("input")!.value, "새 방");
  assert.match(document.querySelector('[role="alert"]')!.textContent!, /검사용 거절/);
  assert.equal(document.querySelector("fieldset")!.disabled, false);
  await fill("textarea", "수정한 지침");
  post = async () => Response.json({ room: { id: "retry-room" } });
  await click(go()); await elapsed(950);
  assert.equal(posts.length, 2); assert.equal(posts[1].purpose, "수정한 지침");
  assert.equal(go().dataset.stage, "ok");
  await elapsed(600);
});

test("기존 방 설정은 그 방의 초안을 복원하고 고치기 동작을 유지한다", async () => {
  localStorage.setItem("nm-draft:room-existing", JSON.stringify({ name: "고치던 이름", purpose: "고치던 지침", picked: ["검사봇"] }));
  const { closed } = await mount({ id: "existing", name: "원래 이름", purpose: "원래 지침", members: ["검사봇"] });
  assert.equal(document.querySelector<HTMLInputElement>("input")!.value, "고치던 이름");
  assert.equal(go().textContent, "고치기");
  post = async () => Response.json({ room: { id: "existing" } });
  await click(go()); assert.equal(posts.length, 1);
  await elapsed(450); assert.equal(go().dataset.stage, "ok");
  await elapsed(350); assert.equal(closed(), 1);
});
}
