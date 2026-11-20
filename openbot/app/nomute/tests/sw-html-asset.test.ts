// 11-20 19:2x — assets/ 자리에 온 html(배포가 바뀌는 몇 분 사이 Pages 대체 페이지)을 서비스 워커가 「한 번 받으면 그대로」 담아 앱이 빈 화면.
//   이제: html 은 안 담음 · 담아 둔 html 은 만나면 버리고 다시 받음 · 판이 바뀔 때(activate) 한 번 치움.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const SRC = readFileSync(new URL("../sw.js", import.meta.url), "utf8");
const ORIGIN = "https://edit.nomute.kr";
const res = (body: string, type: string, status = 200) => new Response(body, { status, headers: { "content-type": type } });

function boot(net: (u: string) => Response) {
  const stores = new Map<string, Map<string, Response>>();
  const keyOf = (q: Request | string) => (typeof q === "string" ? new URL(q, ORIGIN).href : q.url);
  const open = async (name: string) => {
    if (!stores.has(name)) stores.set(name, new Map());
    const m = stores.get(name)!;
    return {
      match: async (q: Request | string) => m.get(keyOf(q))?.clone(),
      put: async (q: Request | string, r: Response) => { m.set(keyOf(q), r); },
      delete: async (q: Request | string) => m.delete(keyOf(q)),
      keys: async () => [...m.keys()].map((u) => new Request(u)),
      addAll: async () => {},
    };
  };
  const caches = {
    open,
    keys: async () => [...stores.keys()],
    delete: async (k: string) => stores.delete(k),
    match: async (q: Request | string) => { for (const m of stores.values()) { const r = m.get(keyOf(q)); if (r) return r.clone(); } return undefined; },
  };
  const on: Record<string, (e: unknown) => void> = {};
  const self = { addEventListener: (t: string, f: (e: unknown) => void) => { on[t] = f; }, skipWaiting() {}, clients: { claim: async () => {}, matchAll: async () => [] }, registration: {} };
  const calls: string[] = [];
  const fetch = async (q: Request | string) => { const u = keyOf(q); calls.push(u); return net(u); };
  vm.runInNewContext(SRC, { self, caches, fetch, location: new URL(ORIGIN + "/garden-app/sw.js"), URL, Request, Response, Headers, console, setTimeout, clearTimeout });
  const get = async (path: string) => {
    let p: Promise<Response> | undefined;
    on.fetch({ request: new Request(ORIGIN + path), respondWith: (x: Promise<Response>) => { p = x; } });
    return p!;
  };
  const activate = async () => { let w: Promise<unknown> | undefined; on.activate({ waitUntil: (x: Promise<unknown>) => { w = x; } }); await w; };
  return { stores, get, activate, calls, open };
}

const JS = "/garden-app/assets/index-Blf7pwwu.js";

test("assets 자리에 html 이 오면 안 담음 · 다음엔 다시 받음", async () => {
  let live = false;
  const sw = boot(() => (live ? res("const a=1", "application/javascript") : res("<!doctype html>", "text/html; charset=utf-8")));
  const a = await sw.get(JS);
  assert.match(a.headers.get("content-type")!, /html/);                 // 그 순간은 html 그대로 내줌(막지 않음)
  assert.equal(sw.stores.get("garden-app-assets-v1")?.size ?? 0, 0);   // 담지 않음
  live = true;
  const b = await sw.get(JS);
  assert.equal(await b.text(), "const a=1");
  assert.equal(sw.stores.get("garden-app-assets-v1")!.size, 1);       // 진짜 묶음은 담음(한 번 받으면 그대로)
  await sw.get(JS);
  assert.equal(sw.calls.length, 2);                                     // 담은 뒤엔 그물 0
});

test("앞 판이 담아 둔 html 은 만나면 버리고 다시 받음", async () => {
  const sw = boot(() => res("const a=1", "application/javascript"));
  await (await sw.open("garden-app-assets-v1")).put(ORIGIN + JS, res("<!doctype html>", "text/html"));
  const r = await sw.get(JS);
  assert.equal(await r.text(), "const a=1");
  const kept = await (await sw.open("garden-app-assets-v1")).match(ORIGIN + JS);
  assert.match(kept!.headers.get("content-type")!, /javascript/);
});

test("판이 바뀔 때(activate) 담아 둔 html 조각을 치움 · 진짜 조각은 그대로", async () => {
  const sw = boot(() => res("x", "application/javascript"));
  const c = await sw.open("garden-app-assets-v1");
  await c.put(ORIGIN + JS, res("<!doctype html>", "text/html"));
  await c.put(ORIGIN + "/garden-app/assets/v-react-B2zgdyhN.js", res("ok", "application/javascript"));
  await sw.activate();
  const left = (await c.keys()).map((q) => new URL(q.url).pathname);
  assert.deepEqual(left, ["/garden-app/assets/v-react-B2zgdyhN.js"]);
});
