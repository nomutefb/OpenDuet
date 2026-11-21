// 서비스 워커가 묶음 밖 그대로 쓰는 것(얼굴 그림 · 글꼴 · three.js)을 담아 둠 + 뿌리 자리 큰 자료는 「안 바뀜」이면 담아 둔 것
//   까닭 = 맥 앱 · 아이폰(사파리 엔진)은 워커가 흘려보낸 요청을 웹 캐시에 안 남겨, 앱을 열 때마다 10.9MB 를 통째로 다시 받았음(11-21 실측 · 형 「첫 메인 화면 빌드 빠르게 하는 방법도 좀」)
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const SRC = readFileSync(new URL("../sw.js", import.meta.url), "utf8");
const ORIGIN = "https://edit.nomute.kr";
const caches0 = async (sw: { stores: Map<string, Map<string, Response>> }) => { if (!sw.stores.has("garden-app-static-v1")) sw.stores.set("garden-app-static-v1", new Map()); const m = sw.stores.get("garden-app-static-v1")!; return { put: async (u: string, r: Response) => { m.set(u, r); } }; };
const res = (body: string, type: string, status = 200, etag = "") => new Response(status === 304 ? null : body, { status, headers: { "content-type": type, ...(etag ? { etag } : {}) } });

function boot(net: (u: string, inm: string) => Response) {
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
  const caches = { open, keys: async () => [...stores.keys()], delete: async (k: string) => stores.delete(k),
    match: async (q: Request | string) => { for (const m of stores.values()) { const r = m.get(keyOf(q)); if (r) return r.clone(); } return undefined; } };
  const on: Record<string, (e: unknown) => void> = {};
  const self = { addEventListener: (t: string, f: (e: unknown) => void) => { on[t] = f; }, skipWaiting() {}, clients: { claim: async () => {}, matchAll: async () => [] }, registration: {} };
  const calls: { u: string; inm: string }[] = [];
  let now = 1_800_000_000_000, down = false;
  const fetch = async (q: Request | string, init?: { headers?: Record<string, string> }) => {
    const u = keyOf(q), inm = (init?.headers || {})["If-None-Match"] || (typeof q !== "string" ? q.headers.get("if-none-match") || "" : "");
    calls.push({ u: u.replace(ORIGIN, ""), inm });
    if (down) throw new Error("끊김");
    return net(u.replace(ORIGIN, ""), inm);
  };
  const D = class extends Date { static now() { return now; } };
  vm.runInNewContext(SRC, { self, caches, fetch, location: new URL(ORIGIN + "/garden-app/sw.js"), URL, Request, Response, Headers, console, setTimeout, clearTimeout, Date: D, Promise });
  const get = async (path: string, init?: RequestInit) => {
    let p: Promise<Response> | undefined;
    const waits: Promise<unknown>[] = [];
    on.fetch({ request: new Request(ORIGIN + path, init), respondWith: (x: Promise<Response>) => { p = x; }, waitUntil: (x: Promise<unknown>) => { waits.push(x); } });
    const r = p ? await p : undefined;
    await Promise.all(waits);
    return r;
  };
  return { get, calls, stores, tick: (ms: number) => { now += ms; }, cut: (v: boolean) => { down = v; }, activate: async () => { let w: Promise<unknown> | undefined; on.activate({ waitUntil: (x: Promise<unknown>) => { w = x; } }); await w; } };
}

test("얼굴 그림 · 글꼴 · three.js = 처음 한 번만 받고 그 뒤는 담아 둔 것(서버 안 감)", async () => {
  const sw = boot((u) => res("BODY:" + u, u.endsWith(".js") ? "text/javascript" : "image/webp", 200, '"e1"'));
  for (const u of ["/office/bom.webp", "/office/dew.gif?v=3", "/assets/fonts/pretendard.woff2", "/vendor/three/three.core.js", "/garden-app/haneul.gif?v=1"]) {
    assert.equal(await (await sw.get(u))!.text(), "BODY:" + u);
    assert.equal(await (await sw.get(u))!.text(), "BODY:" + u);
    assert.equal(await (await sw.get(u))!.text(), "BODY:" + u);
  }
  assert.equal(sw.calls.length, 5);   // 주소마다 한 번
});

test("1시간 지난 것 = 담아 둔 것을 바로 주고 뒤에서 「바뀌었나」만 물음 · 안 바뀜(304) = 그대로 · 바뀜 = 다음부터 새 것", async () => {
  let body = "옛 얼굴", tag = '"a"';
  const sw = boot((_u, inm) => (inm === tag ? res("", "image/webp", 304, tag) : res(body, "image/webp", 200, tag)));
  assert.equal(await (await sw.get("/office/bom.webp"))!.text(), "옛 얼굴");
  sw.tick(30 * 60_000);
  await sw.get("/office/bom.webp");
  assert.equal(sw.calls.length, 1);                       // 1시간 안 = 안 물음
  sw.tick(40 * 60_000);
  assert.equal(await (await sw.get("/office/bom.webp"))!.text(), "옛 얼굴");
  assert.deepEqual(sw.calls[1], { u: "/office/bom.webp", inm: '"a"' });   // 뒤에서 조건부로 물음 → 304
  await sw.get("/office/bom.webp");
  assert.equal(sw.calls.length, 2);                       // 방금 물었으니 또 안 물음
  body = "새 얼굴"; tag = '"b"';
  sw.tick(61 * 60_000);
  assert.equal(await (await sw.get("/office/bom.webp"))!.text(), "옛 얼굴");   // 이번엔 담아 둔 것(화면은 안 기다림)
  assert.equal(await (await sw.get("/office/bom.webp"))!.text(), "새 얼굴");   // 다음부터 새 것
});

test("없는 주소에 온 html(Pages 대체 화면) · 실패 답 = 안 담음 · 끊겼을 때 = 담아 둔 것", async () => {
  let mode = "html";
  const sw = boot(() => (mode === "html" ? res("<!doctype html>", "text/html; charset=utf-8") : mode === "500" ? res("x", "text/plain", 500) : res("IMG", "image/webp", 200, '"z"')));
  assert.match(await (await sw.get("/office/new.webp"))!.text(), /doctype/);
  mode = "500"; assert.equal((await sw.get("/office/new.webp"))!.status, 500);
  mode = "ok"; assert.equal(await (await sw.get("/office/new.webp"))!.text(), "IMG");
  assert.equal(sw.calls.length, 3);                       // 앞 둘은 안 담겨서 다시 받음
  sw.cut(true); sw.tick(2 * 3600_000);
  assert.equal(await (await sw.get("/office/new.webp"))!.text(), "IMG");   // 끊김 = 담아 둔 것 그대로
});

test("뿌리 자리 큰 자료(articles.json) = 늘 서버에 묻고 「안 바뀜」이면 담아 둔 것 · 바뀌면 새 것 · 끊기면 마지막 것", async () => {
  let body = '{"n":1}', tag = '"v1"';
  const sw = boot((_u, inm) => (inm === tag ? res("", "application/json", 304, tag) : res(body, "application/json", 200, tag)));
  assert.equal(await (await sw.get("/articles.json"))!.text(), '{"n":1}');
  assert.equal(await (await sw.get("/articles.json"))!.text(), '{"n":1}');
  assert.deepEqual(sw.calls.map((c) => c.inm), ["", '"v1"']);   // 두 번째 = 조건부 → 304 → 담아 둔 몸통
  body = '{"n":2}'; tag = '"v2"';
  assert.equal(await (await sw.get("/articles.json"))!.text(), '{"n":2}');   // 바뀌면 바로 새 것(늘 서버가 정본)
  sw.cut(true);
  assert.equal(await (await sw.get("/articles.json"))!.text(), '{"n":2}');   // 끊김 = 마지막으로 받은 것
});

test("꼬리가 매번 바뀌는 자료(?ts=시각) = 한 칸에만 담김(쌓이지 않음) · 꼬리가 달라도 「안 바뀜」이면 담아 둔 것 · 판이 바뀔 때 옛 꼬리 칸은 치움", async () => {
  const tag = '"t1"', seenUrls: string[] = [];
  const sw = boot((u, inm) => { seenUrls.push(u); return inm === tag ? res("", "application/json", 304, tag) : res('{"k":1}', "application/json", 200, tag); });
  for (const ts of [1, 2, 3, 4]) assert.equal(await (await sw.get(`/sns_trends.json?t=${ts}`))!.text(), '{"k":1}');
  const keys = () => [...(sw.stores.get("garden-app-static-v1")?.keys() || [])].map((k) => k.replace(ORIGIN, "")).filter((k) => k.includes("sns_trends"));
  assert.deepEqual(keys(), ["/sns_trends.json"]);                                     // 한 칸
  assert.deepEqual(seenUrls, ["/sns_trends.json?t=1", "/sns_trends.json?t=2", "/sns_trends.json?t=3", "/sns_trends.json?t=4"]);   // 서버엔 온 주소 그대로 물음
  assert.deepEqual(sw.calls.map((c) => c.inm), ["", tag, tag, tag]);                 // 둘째부터 조건부 → 304
  await (await caches0(sw)).put(ORIGIN + "/old.json?ts=9", res("{}", "application/json", 200, '"o"'));   // 첫 판이 꼬리째 담아 둔 칸
  await sw.activate();
  assert.ok(![...(sw.stores.get("garden-app-static-v1")?.keys() || [])].some((k) => k.includes("?ts=9")));
});

test("손 안 대는 것 = /api · 영상 · 판 번호 · 남의 사이트 · 구간 요청 · 화면 열기", async () => {
  const sw = boot(() => res("x", "application/json"));
  for (const u of ["/api/office/me", "/api/x.json", "/garden-app/ddk.mp4", "/garden-app/version.json", "/office/sub/x.webp"]) assert.equal(await sw.get(u), undefined, u);
  assert.equal(await sw.get("/office/bom.webp", { headers: { range: "bytes=0-10" } }), undefined);
  assert.equal(sw.calls.length, 0);
});

test("판이 바뀌어도(activate) 담아 둔 통은 남음 · 한 달 넘게 안 쓴 것만 치움", async () => {
  const sw = boot((u) => res("B" + u, "image/webp", 200, '"e"'));
  await sw.get("/office/old.webp?v=1");
  sw.tick(31 * 24 * 3600_000);
  await sw.get("/office/bom.webp");
  await sw.activate();
  const keys = [...(sw.stores.get("garden-app-static-v1")?.keys() || [])].map((k) => k.replace(ORIGIN, ""));
  assert.ok(keys.includes("/office/bom.webp")); assert.ok(!keys.includes("/office/old.webp?v=1"));
});
