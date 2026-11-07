// 임시방 「멤버 설정」 = GET/POST temprooms (roomset 금지) · 지정방 「멤버 넣고 빼기」 = roomset 그대로
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, test } from "node:test";
import { setImmediate } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { Window } from "happy-dom";
import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const external = /^(react|react-dom|@tanstack\/react-query)(\/.*)?$/;
const compiled = await build({
  entryPoints: [fileURLToPath(new URL("../ui/temp-room.tsx", import.meta.url))],
  bundle: true,
  write: false,
  platform: "node",
  format: "esm",
  jsx: "automatic",
  plugins: [
    {
      name: "same-react",
      setup(builder) {
        builder.onResolve({ filter: external }, (args) => ({
          path: import.meta.resolve(args.path),
          external: true,
        }));
        builder.onResolve({ filter: /\.css$/ }, (args) => ({ path: args.path, namespace: "css-stub" }));
        builder.onLoad({ filter: /.*/, namespace: "css-stub" }, () => ({ contents: "", loader: "js" }));
      },
    },
  ],
});
const { RoomMembersDialog } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString("base64")}`
);

type Hit = { url: string; method: string; body: string };
const hits: Hit[] = [];
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

let dom: Window;
const roots: Root[] = [];
const clients: QueryClient[] = [];
const globals = new Map<string, PropertyDescriptor | undefined>();
const pending = new Set<ReturnType<typeof setTimeout>>();
let realSet: typeof setTimeout;
let realClear: typeof clearTimeout;

beforeEach(() => {
  hits.length = 0;
  realSet = globalThis.setTimeout;
  realClear = globalThis.clearTimeout;
  globalThis.setTimeout = ((fn: TimerHandler, ms?: number, ...args: unknown[]) => {
    const id = realSet(fn as never, ms, ...args);
    pending.add(id);
    return id;
  }) as typeof setTimeout;
  globalThis.clearTimeout = ((id: ReturnType<typeof setTimeout>) => {
    pending.delete(id);
    return realClear(id);
  }) as typeof clearTimeout;
  dom = new Window({ url: "https://office.test/" });
  for (const [key, value] of Object.entries({
    window: dom,
    document: dom.document,
    navigator: dom.navigator,
    HTMLElement: dom.HTMLElement,
    Node: dom.Node,
    IS_REACT_ACT_ENVIRONMENT: true,
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method || "GET").toUpperCase();
      const body = typeof init?.body === "string" ? init.body : "";
      hits.push({ url, method, body });
      if (url.endsWith("/api/office/people")) return json({ ok: true, people: [] });
      if (url.endsWith("/api/office/temprooms") && method === "GET") return json({ ok: true, candidates: ["봄", "클로드", "그록"] });
      if (url.includes("/api/office/temprooms/") && method === "POST") return json({ ok: true, room: { id: "tmp 1" } });
      if (url.endsWith("/api/office/roomset") && method === "GET") {
        return json({ ok: true, roomset: { ver: 3, rooms: { ideation: ["봄"] } }, candidates: ["봄", "그록"], can_edit: true });
      }
      if (url.endsWith("/api/office/roomset") && method === "POST") return json({ ok: true });
      return json({ ok: false, why: `unexpected ${method} ${url}` }, 500);
    },
  })) {
    globals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
});

afterEach(async () => {
  await act(async () => { for (const root of roots.splice(0)) root.unmount(); });
  for (const client of clients.splice(0)) client.clear();
  for (const id of pending) realClear(id);
  pending.clear();
  globalThis.setTimeout = realSet;
  globalThis.clearTimeout = realClear;
  await dom.happyDOM.abort();
  for (const [key, previous] of globals) {
    if (previous) Object.defineProperty(globalThis, key, previous);
    else Reflect.deleteProperty(globalThis, key);
  }
  globals.clear();
});

const buttons = (root: ParentNode) => [...root.querySelectorAll("button")];
const labelOf = (b: Element) => (b.textContent || "").replace(/\s+/g, "");

async function shown(root: ParentNode, text: string) {
  for (let i = 0; i < 40; i++) {
    await act(async () => { await setImmediate(); });
    if ((root.textContent || "").includes(text)) return;
  }
  throw new Error(`못 찾음: ${text} · 단추 ${buttons(root).map(labelOf).join("|")}`);
}

async function mount(r: Record<string, unknown>) {
  let closed = false;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0, refetchOnWindowFocus: false } } });
  clients.push(client);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  await act(async () => {
    root.render(createElement(QueryClientProvider, { client }, createElement(RoomMembersDialog, { r, onClose: () => { closed = true; } }) as ReactNode));
  });
  return { container, closed: () => closed };
}

test("방 메뉴 = 임시방은 「방 설정」과 「멤버 설정」이 따로", () => {
  const src = readFileSync(new URL("../ui/room-menu.tsx", import.meta.url), "utf8");
  assert.match(src, /방 설정<small>이름 · 목적 · 기한<\/small>/);
  assert.match(src, /onClick=\{go\(\(\) => setCrew\(true\)\)\}>방 설정/);
  assert.match(src, /onClick=\{go\(\(\) => setMem\(true\)\)\}>멤버 설정/);
  assert.match(src, /r\.temp \? <TempRoomDialog edit=\{r\}/);
  assert.match(src, /mem && r\?\.temp \? <RoomMembersDialog r=\{r\}/);
  assert.match(src, /!r\.temp \? <button type="button" role="menuitem" onClick=\{go\(\(\) => setCrew\(true\)\)\}>멤버 넣고 빼기/);
});

test("임시방 멤버 설정 = temprooms 후보 · 저장은 이름·목적 유지하고 hours 없음 · roomset 안 부름", async () => {
  const view = await mount({ id: "tmp 1", name: "임시방", purpose: "같이 보자", members: ["봄", "클로드"], temp: true, kind: "group" });
  await shown(view.container, "멤버 설정");
  await shown(view.container, "그록");
  assert.equal(hits.some((h) => h.url.includes("roomset")), false);
  assert.ok(hits.some((h) => h.method === "GET" && h.url.endsWith("/api/office/temprooms")));
  const save = buttons(view.container).find((b) => labelOf(b) === "저장");
  assert.equal(save?.hasAttribute("disabled"), true);
  const drop = buttons(view.container).find((b) => labelOf(b).includes("봄"));
  assert.ok(drop, "봄 칩");
  await act(async () => { drop.click(); });
  assert.equal(save?.hasAttribute("disabled"), false);
  await act(async () => { save?.click(); });
  for (let i = 0; i < 30 && !view.closed(); i++) await act(async () => { await setImmediate(); });
  const post = hits.find((h) => h.method === "POST");
  assert.ok(post, "POST");
  assert.match(post.url, /\/api\/office\/temprooms\/tmp%201$/);
  assert.deepEqual(JSON.parse(post.body), { name: "임시방", purpose: "같이 보자", members: ["클로드"] });
  assert.equal("hours" in JSON.parse(post.body), false);
  assert.equal(hits.some((h) => h.url.includes("roomset")), false);
  assert.equal(view.closed(), true);
});

test("지정방 멤버 = roomset 만 · temprooms 안 부름", async () => {
  const view = await mount({ id: "ideation", name: "아이데이션", members: ["봄"], designated: true, kind: "group" });
  await shown(view.container, "아이데이션");
  await shown(view.container, "그록");
  assert.equal(hits.some((h) => h.url.includes("temprooms")), false);
  const add = buttons(view.container).find((b) => labelOf(b).includes("그록"));
  assert.ok(add, "그록 칩");
  await act(async () => { add.click(); });
  const save = buttons(view.container).find((b) => labelOf(b) === "저장");
  await act(async () => { save?.click(); });
  for (let i = 0; i < 20 && !view.closed(); i++) await act(async () => { await setImmediate(); });
  const post = hits.find((h) => h.method === "POST");
  assert.ok(post, "POST");
  assert.match(post.url, /\/api\/office\/roomset$/);
  assert.deepEqual(JSON.parse(post.body), { room: "ideation", members: ["봄", "그록"], base: 3 });
  assert.equal(hits.some((h) => h.url.includes("temprooms")), false);
  assert.equal(view.closed(), true);
});
