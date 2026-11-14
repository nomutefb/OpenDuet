// 새 사무실 서비스 워커(홈 화면 앱 · 범위 /office-app/) — 화면 껍데기만 담고 자료(/api)는 안 담는다(동기화 = 서버가 정본)
// 첫 화면(index.html) = 늘 새로 받고, 끊겼을 때만 담아 둔 판 · 이름에 해시가 붙은 묶음(assets/) = 한 번 받으면 그대로
// 판 번호 = 빌드 때 박음(vite.config.ts) → 판마다 이 파일 글자가 바뀌어 브라우저가 새 서비스 워커로 받는다(화면이 5~10분마다·앞으로 올 때 확인)
const BUILD = "__NM_BUILD__";
const SHELL = "office-app-shell-v1";
const ASSETS = "office-app-assets-v1";
const META = "office-app-meta";   // 공유 받기 칸(아래 takeShare)

/* 새 판 = 알리기만(형 11-02 07:20 「글고 업데이트 강제로 될때내 메시지 하나씩 휘발되서 다시 써야되는 이슈가 있어. 강제로 화면 쌔로고침 하지말고. 내 ㅁㅔ세지는 정확히 가고. (확인) 새로고침은  내가특정 그 새로운 버전이 잇다는 화면에 버튼 누르면 갱신하게」)
   · 옛 판(형 10-28 10:15 「반영이 된 이후에 강제로 모든 피시에서 새로고침 한번 시켜줘」)은 여기서 8초·90초 뒤 화면을 억지로 다시 열었다 → 뺌
   · 이제 켜지면 맡은 화면에 「nm-build」만 보냄 → 화면(main.tsx)이 위에 「새 버전」 단추를 띄우고 형이 누를 때만 갱신 */

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(["/office-app/", "/office-app/manifest.webmanifest", "/office-app/icon-192.png"]).catch(() => {})));
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== SHELL && k !== ASSETS && k !== META && k !== "office-app-att") await caches.delete(k);
    try { await (await caches.open(META)).delete("/office-app/__nm-pend"); } catch { /* 옛 「한 번 밀기 장부」 한 줄 치움 */ }
    await self.clients.claim();
    for (const c of await self.clients.matchAll({ type: "window" })) c.postMessage({ type: "nm-build", build: BUILD });   // 알리기만 · 다시 읽기는 형 단추
  })());
});

/* 형 폰 알림(앱이 꺼져 있어도 · 형 10-28 16:32 「웹앱으로 일단 해」) — 에디터 알림 길 그대로(VAPID 공개 열쇠 = editor viewer-src/28-flagShellUpdate.part VAPID_PUB 같은 값 ·
   보냄 = 사무실 서버 functions/api/office/_phone.js → 배달 입구 bot-send mode phone → push_send.py · 받는 기기 = 이 앱이 구독한 것만(app office))
   앱을 보고 있으면 안 띄움(YETA sw.js 규칙 · 매번 건너뛰면 브라우저가 구독을 거둘 수 있어 「보이는 앱 창이 실제로 있을 때만」) · 누르면 그 방(열린 앱 창이 있으면 그 창으로) */
const VAPID_PUB = "BORNTh3cNd05vsxi2fZ-BykxM0NwKGTvIETz81g757RVFL6cDu29aAv5I7uit0WbGOmiZ4hlyMOEvb8B2HptU-I";
const appWins = async () => (await self.clients.matchAll({ type: "window", includeUncontrolled: true })).filter((c) => new URL(c.url).pathname.startsWith("/office-app/"));
/* 알림 그림 = 그림 글(data URL)로 넘김 — 주소로 주면 폰이 Access 벽 때문에 못 받아 안드로이드가 사이트 첫 글자 「A」 를 그림
   (에디터 .github/scripts/push_send.py notif_icon 260727 실측 · 봄 11-01) · 서비스 워커는 같은 출처 쿠키로 받을 수 있으니 여기서 받아 바꿈
   차례 = 서버가 준 d.icon(단톡 그림 · 보낸 이 얼굴) → 앱 아이콘(셸 캐시) · 받은 그림은 office-notif-icons 캐시에 둠(쿠키가 끝나도 다음에 그려짐) · 3초 안에 못 받으면 다음 */
const ICONS = "office-notif-icons";
const toDataUrl = async (res) => {
  const b = await res.blob(), buf = new Uint8Array(await b.arrayBuffer());
  let s = "";
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  return `data:${b.type || "image/png"};base64,${btoa(s)}`;
};
const isImg = (res) => !!res && res.ok && (res.headers.get("content-type") || "").startsWith("image/");
async function iconData(u) {
  for (const x of [u, "/office-app/icon-192.png"]) {
    if (!x) continue;
    try {
      let res = await caches.match(x);
      if (!isImg(res)) {
        res = await Promise.race([fetch(x, { credentials: "include" }), new Promise((_, no) => setTimeout(() => no(new Error("느림")), 3000))]);
        if (isImg(res)) await (await caches.open(ICONS)).put(x, res.clone()).catch(() => {});
      }
      if (isImg(res)) return await toDataUrl(res);
    } catch { /* 다음 그림 */ }
  }
  return "/office-app/icon-192.png";
}
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil((async () => {
    if ((await appWins()).some((c) => c.focused && c.visibilityState === "visible")) return;
    // 아이콘 = 서버가 준 d.icon(단톡 알림 그림 · 없으면 보낸 이 얼굴 · 형 11-01 「애들 얼굴 붙여서 각각 오게하고 싶네」 · 봄 서버) · 없으면 앱 아이콘
    const icon = await iconData(d.icon);   // 그림 글(data URL) — 주소 그대로면 「A」 로 그려짐(위 iconData)
    return self.registration.showNotification(d.title || "봄의 정원", { body: d.body || "", icon, tag: d.tag || "office",
      renotify: !!d.renotify, ...(d.vibrate ? { vibrate: d.vibrate } : {}), data: { url: d.url || "/office-app/" }, lang: "ko" });
  })());
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = new URL((e.notification.data && e.notification.data.url) || "/office-app/", location.origin).href;
  e.waitUntil((async () => {
    const w = (await appWins())[0];
    if (w && "navigate" in w) { try { const c = await w.navigate(target); return (c || w).focus(); } catch { /* 못 옮기면 새 창 */ } }
    return self.clients.openWindow(target);
  })());
});
self.addEventListener("pushsubscriptionchange", (e) => {   // 구독이 바뀜(브라우저가 갈아 끼움) = 새로 구독해 서버에 다시 적음(에디터 sw.js 와 같은 길)
  e.waitUntil((async () => {
    const pad = "=".repeat((4 - (VAPID_PUB.length % 4)) % 4), raw = atob((VAPID_PUB + pad).replace(/-/g, "+").replace(/_/g, "/"));
    const sub = await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: Uint8Array.from(raw, (ch) => ch.charCodeAt(0)) });
    await fetch("/api/push", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "subscribe", subscription: sub.toJSON(), app: "office" }) });
  })().catch(() => {}));
});

/* 공유 받기(안드로이드 「공유 → 사무실」 · manifest share_target · POST /office-app/share) — 받은 글·링크·그림을 이 앱 기록 칸(META)에 적고 고르는 판(public/share.html · GET /office-app/share)으로.
   방 고르기·보내기는 형이 함(share.html) · 그림은 10장까지 */
const SHARE_KEY = "/office-app/__nm-share";
async function takeShare(req) {
  try {
    const fd = await req.formData(), c = await caches.open(META);
    for (const k of await c.keys()) if (new URL(k.url).pathname.startsWith(SHARE_KEY)) await c.delete(k);
    const files = fd.getAll("files").filter((f) => f && typeof f === "object" && f.size).slice(0, 10);
    for (const [i, f] of files.entries()) await c.put(`${SHARE_KEY}/${i}`, new Response(f, { headers: { "content-type": f.type || "application/octet-stream", "x-name": encodeURIComponent(f.name || `그림${i + 1}`) } }));
    await c.put(SHARE_KEY, new Response(JSON.stringify({ at: Date.now(), title: String(fd.get("title") || ""), text: String(fd.get("text") || ""), url: String(fd.get("url") || ""), files: files.length })));
  } catch { /* 못 적음 = 고르는 판이 「받은 것 없음」 */ }
  return Response.redirect(new URL("/office-app/share", location.origin).href, 303);   // GET = public/share.html(Pages 가 .html 을 뗀 주소)
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method === "POST" && new URL(req.url).pathname === "/office-app/share") { e.respondWith(takeShare(req)); return; }
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.pathname === "/office-app/share" || url.pathname === "/office-app/share.html") return;   // 공유 고르는 판(GET · Pages 가 .html 을 뗌) = 껍데기 캐시(「/office-app/」 자리)에 안 담음
  if (url.origin === location.origin && url.pathname.startsWith("/api/attachments/")) {   // 입력칸 첨부 미리보기 = 화면이 넣어 둔 캐시(shim/attachments.ts)
    e.respondWith(caches.open("office-app-att").then((c) => c.match(url.pathname)).then((r) => r || new Response("", { status: 404 })));
    return;
  }
  if (url.origin !== location.origin || !url.pathname.startsWith("/office-app/")) return;   // /api·다른 화면 = 손대지 않음
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const res = await fetch(req, { cache: "no-store" });   // 첫 화면 = 웹 캐시도 안 탐(옛 첫 화면이 지워진 조각을 부르던 것 · 형 11-14 22:10 · 깃 #-0004)
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
