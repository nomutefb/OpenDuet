// 새 사무실 서비스 워커(홈 화면 앱 · 범위 /office-app/) — 화면 껍데기만 담고 자료(/api)는 안 담는다(동기화 = 서버가 정본)
// 첫 화면(index.html) = 늘 새로 받고, 끊겼을 때만 담아 둔 판 · 이름에 해시가 붙은 묶음(assets/) = 한 번 받으면 그대로
// 판 번호 = 빌드 때 박음(vite.config.ts) → 판마다 이 파일 글자가 바뀌어 브라우저가 새 서비스 워커로 받는다(화면이 5~10분마다·앞으로 올 때 확인)
const BUILD = "__NM_BUILD__";
const SHELL = "office-app-shell-v1";
const ASSETS = "office-app-assets-v1";
const META = "office-app-meta";   // 한 번 밀기 장부(아래)

/* 새 판이 켜지면 맡은 화면 전부 한 번 새로 읽기(형 10-28 10:15 「반영이 된 이후에 강제로 모든 피시에서 새로고침 한번 시켜줘」)
   · 새 판 코드가 도는 화면(main.tsx) = 「nm-self · 쓰던 글 있음/없음」으로 답함 — 없음 = 그 화면이 바로 스스로 다시 읽음 · 있음 = 글칸이 빌 때 스스로(여기선 손대지 않음 = 쓰던 글 지킴)
   · 그 밖(답이 없거나 「있음/없음」을 모르는 옛 판 · 10-28 11:17 실측 = 9f3efbb 판은 글칸 커서만으로 「쓰는 중」이라 영영 안 읽힘) = 여기서 다시 엶 —
     8초 뒤(새 판 코드가 스스로 읽을 틈) 뒤에 있거나(안 보임) 눌려 있지 않으면 바로 · 앞에서 눌린 채면(쓰는 중일 수 있음) 뒤로 가거나 90초가 지나면 */
const WAIT_MS = 8e3, GRACE_MS = 90e3;
let pend = null;   // { at: 켜진 때, ids: 아직 안 읽힌 화면 id, draft: { id: true } = 쓰던 글이 있다고 답한 화면 }
const PEND_URL = "/office-app/__nm-pend";
async function loadPend() {
  if (pend) return pend;
  try { const r = await (await caches.open(META)).match(PEND_URL); pend = r ? await r.json() : { at: 0, ids: [] }; } catch { pend = { at: 0, ids: [] }; }
  pend.draft = pend.draft || {};
  return pend;
}
async function savePend() { try { await (await caches.open(META)).put(PEND_URL, new Response(JSON.stringify(pend))); } catch { /* 이번만 */ } }
let sweptAt = 0;
async function sweep() {
  const p = await loadPend();
  if (!p.ids.length) return;
  const age = Date.now() - p.at, left = [];
  for (const id of p.ids) {
    const c = await self.clients.get(id);
    if (!c) continue;   // 닫힘·이미 다시 읽음
    if (p.draft[id]) { left.push(id); continue; }   // 쓰던 글 있음 = 그 화면 몫
    if (age > GRACE_MS || (age > WAIT_MS && (c.visibilityState !== "visible" || !c.focused))) { await c.navigate(c.url).catch(() => {}); continue; }
    left.push(id);
  }
  if (left.length !== p.ids.length) { pend = { ...p, ids: left }; await savePend(); }
}
function sweepSoon(e) {   // 화면이 무엇을 받으러 올 때마다(3초에 한 번까지) 남은 옛 화면을 다시 봄
  if (pend && !pend.ids.length) return;
  const now = Date.now();
  if (now - sweptAt < 3000) return;
  sweptAt = now;
  e.waitUntil(sweep());
}

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(["/office-app/", "/office-app/manifest.webmanifest", "/office-app/icon-192.png"]).catch(() => {})));
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== SHELL && k !== ASSETS && k !== META && k !== "office-app-att") await caches.delete(k);
    await self.clients.claim();
    const wins = await self.clients.matchAll({ type: "window" });
    pend = { at: Date.now(), ids: wins.map((c) => c.id), draft: {} };
    await savePend();
    for (const c of wins) c.postMessage({ type: "nm-build", build: BUILD });
    for (const t of [WAIT_MS + 500, GRACE_MS + 500]) setTimeout(() => { sweptAt = Date.now(); void sweep(); }, t);   // 그 사이엔 화면이 무엇을 받으러 올 때마다(sweepSoon)
  })());
});

self.addEventListener("message", (e) => {   // 새 판 코드 화면의 답 = 쓰던 글 있음 → 기다림 · 없음 → 그 화면이 스스로 다시 읽음(장부에서 뺌)
  if (e.data?.type !== "nm-self" || !e.source || typeof e.data.draft !== "boolean") return;   // 「있음/없음」이 없는 답(9f3efbb·a2f1b05 판) = 모르는 화면으로 둠
  const id = e.source.id, draft = e.data.draft;
  e.waitUntil(loadPend().then((p) => {
    if (!p.ids.includes(id)) return;
    pend = draft ? { ...p, draft: { ...p.draft, [id]: true } } : { ...p, ids: p.ids.filter((x) => x !== id) };
    return savePend();
  }));
});

self.addEventListener("fetch", (e) => {
  sweepSoon(e);
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin && url.pathname.startsWith("/api/attachments/")) {   // 입력칸 첨부 미리보기 = 화면이 넣어 둔 캐시(shim/attachments.ts)
    e.respondWith(caches.open("office-app-att").then((c) => c.match(url.pathname)).then((r) => r || new Response("", { status: 404 })));
    return;
  }
  if (url.origin !== location.origin || !url.pathname.startsWith("/office-app/")) return;   // /api·다른 화면 = 손대지 않음
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res.ok) (await caches.open(SHELL)).put("/office-app/", res.clone());
        return res;
      } catch {
        return (await caches.match("/office-app/")) || Response.error();
      }
    })());
    return;
  }
  if (url.pathname.startsWith("/office-app/assets/")) {
    e.respondWith((async () => {
      const hit = await caches.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) (await caches.open(ASSETS)).put(req, res.clone());
      return res;
    })());
  }
});
