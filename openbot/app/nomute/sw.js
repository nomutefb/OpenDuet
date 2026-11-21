// 새 사무실 서비스 워커(홈 화면 앱 · 범위 /garden-app/) — 화면 껍데기만 담고 자료(/api)는 안 담는다(동기화 = 서버가 정본)
// 첫 화면(index.html) = 늘 새로 받고, 끊겼을 때만 담아 둔 판 · 이름에 해시가 붙은 묶음(assets/) = 한 번 받으면 그대로
// 판 번호 = 빌드 때 박음(vite.config.ts) → 판마다 이 파일 글자가 바뀌어 브라우저가 새 서비스 워커로 받는다(화면이 5~10분마다·앞으로 올 때 확인)
const BUILD = "__NM_BUILD__";
const SHELL = "garden-app-shell-v1";
const ASSETS = "garden-app-assets-v1";
const STATIC = "garden-app-static-v1";   // 묶음(assets/) 밖에서 그대로 쓰는 것 = 얼굴 그림 · 글꼴 · three.js · 조약돌 부품 · 뿌리 자리 큰 자료(아래 staticGet · dataGet)
const META = "garden-app-meta";   // 공유 받기 칸(아래 takeShare)

/* 새 판 = 알리기만(형 11-02 07:20 「글고 업데이트 강제로 될때내 메시지 하나씩 휘발되서 다시 써야되는 이슈가 있어. 강제로 화면 쌔로고침 하지말고. 내 ㅁㅔ세지는 정확히 가고. (확인) 새로고침은  내가특정 그 새로운 버전이 잇다는 화면에 버튼 누르면 갱신하게」)
   · 옛 판(형 10-28 10:15 「반영이 된 이후에 강제로 모든 피시에서 새로고침 한번 시켜줘」)은 여기서 8초·90초 뒤 화면을 억지로 다시 열었다 → 뺌
   · 이제 켜지면 맡은 화면에 「nm-build」만 보냄 → 화면(main.tsx)이 위에 「새 버전」 단추를 띄우고 형이 누를 때만 갱신 */

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(["/garden-app/", "/garden-app/manifest.webmanifest", "/garden-app/icon-192.png"]).catch(() => {})));
});

/* assets/ 자리에 온 html = 그 묶음이 아님(배포가 바뀌는 몇 분 사이 · 없는 조각 주소에 Pages 가 첫 화면 html 을 200 으로 줌) → 담지 않음.
   11-20 19:2x 실물 = 담아 둔 index-…js 가 html(1786바이트)이라 앱이 빈 화면 · 「한 번 받으면 그대로」라 서버가 고쳐져도 안 풀림(깃 · 하늘 19:30 [도움] · 빠르). */
const htmlAsset = (r) => /text\/html/i.test(r.headers.get("content-type") || "");

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== SHELL && k !== ASSETS && k !== STATIC && k !== META && k !== "garden-app-att") await caches.delete(k);
    try {   // 한 달 넘게 안 쓴 담아 둔 것(옛 ?v= 그림 등) = 치움
      const c = await caches.open(STATIC), st = await loadStamps(c), now = Date.now();
      for (const q of await c.keys()) { const k = staticKey(new URL(q.url)); if (k !== STAMPS && now - (st[k] || now) > STATIC_OLD) { await c.delete(q); delete st[k]; } }
    } catch { /* 못 치워도 그대로 씀 */ }
    try {   // 앞 판이 담아 둔 html 조각 = 판이 바뀔 때 한 번 치움(빈 화면 기기가 새 판 서비스 워커만 받으면 풀림)
      const c = await caches.open(ASSETS);
      for (const q of await c.keys()) { const r = await c.match(q); if (r && htmlAsset(r)) await c.delete(q); }
    } catch { /* 못 치워도 fetch 가 만날 때 버림 */ }
    try { await (await caches.open(META)).delete("/garden-app/__nm-pend"); } catch { /* 옛 「한 번 밀기 장부」 한 줄 치움 */ }
    await self.clients.claim();
    for (const c of await self.clients.matchAll({ type: "window" })) c.postMessage({ type: "nm-build", build: BUILD });   // 알리기만 · 다시 읽기는 형 단추
  })());
});

/* 형 폰 알림(앱이 꺼져 있어도 · 형 10-28 16:32 「웹앱으로 일단 해」) — 에디터 알림 길 그대로(VAPID 공개 열쇠 = editor viewer-src/28-flagShellUpdate.part VAPID_PUB 같은 값 ·
   보냄 = 사무실 서버 functions/api/office/_phone.js → 배달 입구 bot-send mode phone → push_send.py · 받는 기기 = 이 앱이 구독한 것만(app office))
   앱을 보고 있으면 안 띄움(YETA sw.js 규칙 · 매번 건너뛰면 브라우저가 구독을 거둘 수 있어 「보이는 앱 창이 실제로 있을 때만」) · 누르면 그 방(열린 앱 창이 있으면 그 창으로) */
const VAPID_PUB = "BORNTh3cNd05vsxi2fZ-BykxM0NwKGTvIETz81g757RVFL6cDu29aAv5I7uit0WbGOmiZ4hlyMOEvb8B2HptU-I";
const appWins = async () => (await self.clients.matchAll({ type: "window", includeUncontrolled: true })).filter((c) => new URL(c.url).pathname.startsWith("/garden-app/"));
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
  for (const x of [u, "/garden-app/icon-192.png"]) {
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
  return "/garden-app/icon-192.png";
}
/* 에디터 알림도 이 앱이 받음(형 11-19 08:3x 「응 1합쳐」 = 에디터 알림을 정원 앱 알림으로 · 앞 판 = 옛 에디터 서비스 워커 구독으로만 갔고 옛 에디터가 사라져 새 기기에서 켤 화면이 없었음)
   · 종류(kind) = brk 긴급 · iss 이슈 · make 요약 · 제작 완료 · sys 시스템 · trend 급상승 · kw 등록어(보냄 = editor .github/scripts/push_send.py) · office · office_now · 없음 = 사무실 글
   · 에디터 종류는 앱을 보고 있어도 띄움(옛 에디터와 같음 — 사무실 글만 화면에서 바로 보이니 건너뜀) · 그림 = 종류별 지구본(옛 sw.js NOTIF_ICON 그대로) · 상태바 그림 = 옛 것 그대로
   · 긴급 · 이슈엔 PICK 단추(옛 에디터 운영자 260924 «푸시에서 바로 PICK») — 누르면 요청을 여기 맡아 두고 수집함(#/legacy · ui/scrap.tsx)이 가져가 보냄(주소만으로는 절대 안 보냄 = 밖에서 온 링크가 돈 드는 요약을 못 걸게) */
const ED_KIND = { brk: "brk", iss: "iss", make: "make", sys: "sys", trend: "trend", kw: "kw" };
const kindIcon = (k) => (ED_KIND[k] ? `/assets/brand/icon-notif-${ED_KIND[k]}-sig-512-260727.png` : "");
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil((async () => {
    const ed = !!ED_KIND[d.kind];
    if (!ed && (await appWins()).some((c) => c.focused && c.visibilityState === "visible")) return;
    // 아이콘 = 서버가 준 d.icon(단톡 알림 그림 · 없으면 보낸 이 얼굴 · 형 11-01 「애들 얼굴 붙여서 각각 오게하고 싶네」 · 봄 서버) · 에디터 종류 = 종류별 지구본 · 없으면 앱 아이콘
    const icon = await iconData(d.icon || kindIcon(d.kind));   // 그림 글(data URL) — 주소 그대로면 「A」 로 그려짐(위 iconData)
    const actions = Array.isArray(d.actions) ? d.actions.filter((a) => a && a.action === "pick" && typeof a.title === "string").slice(0, 1) : [];
    return self.registration.showNotification(d.title || "봄의 정원", { body: d.body || "", icon, tag: d.tag || "office",
      ...(ed ? { badge: d.badge || "/assets/brand/badge-260723.png" } : {}), ...(actions.length ? { actions } : {}),
      renotify: !!d.renotify, ...(d.vibrate ? { vibrate: d.vibrate } : {}), data: { url: d.url || "/garden-app/", kind: d.kind || "", pick: d.pick || "" }, lang: "ko" });
  })());
});
/* 알림 PICK 요청 맡아 두기 — 앱이 뜨는 사이 다른 알림 누름 · 새로고침에 사라지지 않게 캐시에 적고, 수집함이 가져가며 지움(두 창이 같이 보내지 않게) · 4시간 지난 것은 버림 */
const PICK_REQ = "/garden-app/__nm-pickreq/", PICK_REQ_TTL = 4 * 3600e3;
async function savePickReq(r) { await (await caches.open(META)).put(PICK_REQ + Date.now() + "-" + Math.random().toString(36).slice(2, 8), new Response(JSON.stringify(r))); }
async function takePickReqs() {
  const c = await caches.open(META), out = [];
  for (const k of await c.keys()) {
    if (!new URL(k.url).pathname.startsWith(PICK_REQ)) continue;
    const res = await c.match(k);
    if (!(await c.delete(k)) || !res) continue;
    try { const r = await res.json(); if (r && r.brk && Date.now() - (r.ts || 0) < PICK_REQ_TTL) out.push(r); } catch { /* 깨진 줄 = 버림 */ }
  }
  return out;
}
self.addEventListener("message", (e) => {
  const d = e.data || {};
  if (d.type === "nm-pickreq-take") e.waitUntil(takePickReqs().then((list) => { try { e.ports[0].postMessage(list); } catch { /* 받는 쪽이 닫힘 */ } }));
});
/* 옛 에디터 딥링크(「요약 완료」 알림 = /?a=<기사파일>&nmv=1 · 러너 ask.sh · analyze.sh → push_send.py) = 정원 기사 한 장(#/newsed?a=<파일>)으로 바꿔 옮김
   (형 11-17 10:18 dm-bom 봄 옮김 「요약 완료를 누르면 이렇게 뜨는 경우가 있어 확인 좀. 원톤으로 통일해야함」 · 앞 판 = 서버 _root_app.js 가 ? 붙은 길을 옛 에디터로 통과 → 파란 선 · 분홍 점수 · 네비 두 겹) · 그 밖 주소 = 그대로 */
/* 그 밖 옛 에디터 길도 정원 화면으로(형 11-19 00:43 「옛 에디터 걷고 지워버려 이제 안쓰지? 지우자.」) — 수집 실패 알림(/?msg=fail-…) · 감시 경보(/?msg=<칸>) = 알림메세지 ·
   등록어 알림(/?tab=trend) = SNS 탭 · 카드 완료(/thumb.html?done=) = 이미지 에디터 · 긴급 · 이슈(/?brk=<키>&bl=<원문>) = 수집함 · 모르는 옛 길(/?…) = 정원 홈. 앞 판 = 이 길들은 옛 에디터 화면이 그대로 열렸다 */
const OLD_TAB = { trend: "/sns", chan: "/chan", feed: "/feed", scrap: "/legacy" };
function gardenOf(u) {
  if (u.origin !== location.origin) return u;
  const q = u.searchParams, at = (hash) => new URL(`/garden-app/#${hash}`, location.origin);
  if (u.pathname === "/thumb.html" || u.pathname === "/thumb") return at("/edtool");
  if (u.pathname !== "/" || !u.search) return u;
  if (q.get("a")) return at(`/newsed?a=${encodeURIComponent(q.get("a"))}`);
  if (q.get("brk")) return at(`/legacy?brk=${encodeURIComponent(q.get("brk"))}${q.get("bl") ? `&bl=${encodeURIComponent(q.get("bl"))}` : ""}`);   // 긴급 · 이슈 알림 = 수집함이 그 건을 찾아 요약됐으면 기사 한 장 · 아니면 원문(ui/scrap.tsx)
  if (q.get("msg") || q.get("pop") === "msgs") return at("/edmsgs");
  if (OLD_TAB[q.get("tab")]) return at(OLD_TAB[q.get("tab")]);
  return new URL("/garden-app/", location.origin);
}
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const d0 = e.notification.data || {};
  if (e.action === "pick") {   // PICK 단추 = 요청을 맡아 두고 수집함으로(보내는 것은 수집함 · 위 savePickReq)
    let pt = null;
    try { pt = new URL(d0.pick || d0.url || "", location.origin); } catch { pt = null; }
    if (pt && pt.origin === location.origin && pt.searchParams.get("brk")) {
      e.waitUntil((async () => {
        await savePickReq({ brk: pt.searchParams.get("brk"), bl: pt.searchParams.get("bl") || "", kind: d0.kind || "", ts: Date.now() });
        const to = new URL("/garden-app/#/legacy", location.origin).href, w = (await appWins())[0];
        if (w) { try { const c = "navigate" in w && !/#\/legacy(?:[?/]|$)/.test(new URL(w.url).hash) ? (await w.navigate(to)) || w : w; c.postMessage({ type: "nm-pickreq" }); return c.focus(); } catch { /* 못 옮기면 새 창 */ } }
        return self.clients.openWindow(to);
      })());
      return;
    }
  }
  const tu = gardenOf(new URL(d0.url || "/garden-app/", location.origin)), target = tu.href;
  e.waitUntil((async () => {
    if (tu.origin !== location.origin) return self.clients.openWindow(target);   // 남의 사이트(급상승 알림 = 구글 검색) = 늘 새 창 — 앱 창을 그 주소로 갈아 끼우면 앱이 사라짐(옛 sw.js 운영자 260819)
    const w = (await appWins())[0];
    if (w && "navigate" in w) { try { const c = (await w.navigate(target)) || w; try { c.postMessage({ type: "nm-push-open", kind: d0.kind || "" }); } catch { /* 창이 다시 읽히는 중 = 처음부터 받음 */ } return c.focus(); } catch { /* 못 옮기면 새 창 */ } }   // 떠 있던 창 = 요약 대기열 · 기사 목록 바로 다시(번개 11-20 03:54 「알림 = 읽힘」 · data/push-open.ts)
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

/* 공유 받기(안드로이드 「공유 → 사무실」 · manifest share_target · POST /garden-app/share) — 받은 글·링크·그림을 이 앱 기록 칸(META)에 적고 고르는 판(public/share.html · GET /garden-app/share)으로.
   방 고르기·보내기는 형이 함(share.html) · 그림은 10장까지 */
const SHARE_KEY = "/garden-app/__nm-share";
async function takeShare(req) {
  try {
    const fd = await req.formData(), c = await caches.open(META);
    for (const k of await c.keys()) if (new URL(k.url).pathname.startsWith(SHARE_KEY)) await c.delete(k);
    const files = fd.getAll("files").filter((f) => f && typeof f === "object" && f.size).slice(0, 10);
    for (const [i, f] of files.entries()) await c.put(`${SHARE_KEY}/${i}`, new Response(f, { headers: { "content-type": f.type || "application/octet-stream", "x-name": encodeURIComponent(f.name || `그림${i + 1}`) } }));
    await c.put(SHARE_KEY, new Response(JSON.stringify({ at: Date.now(), title: String(fd.get("title") || ""), text: String(fd.get("text") || ""), url: String(fd.get("url") || ""), files: files.length })));
  } catch { /* 못 적음 = 고르는 판이 「받은 것 없음」 */ }
  return Response.redirect(new URL("/garden-app/share", location.origin).href, 303);   // GET = public/share.html(Pages 가 .html 을 뗀 주소)
}

/* 얼굴 그림 · 글꼴 · 묶음 밖 부품(three.js · 조약돌) = 한 번 받으면 담아 두고 바로 줌 · 1시간 지난 것만 뒤에서 「바뀌었나」 물음(ETag · 안 바뀌면 300바이트 · 바뀌었으면 다음에 열 때 새 것)
   까닭(11-21 실측 · 맥 앱 = 사파리 엔진 · 아이폰 홈 화면 앱도 같은 엔진): 서비스 워커가 맡은 화면에서 이 워커가 답하지 않고 흘려보낸 요청은 웹 캐시를 안 탐
     → 앱을 열 때마다 얼굴 23장 7MB + 글꼴 0.45MB + three.js 0.42MB + 뉴스 목록 0.53MB … = 10.9MB 를 통째로 다시 받았음(같은 파일을 이 워커 밖 문서에서 받으면 「안 바뀜」 300바이트로 끝남)
     (형 11-21 「첫 메인 화면 빌드 빠르게 하는 방법도 좀」 · 봄) · 크롬 계열 = 웹 캐시가 먹었지만 열 때마다 「바뀌었나」 48번 → 이제 1시간에 한 번
   html 은 안 담음(없는 주소에 Pages 가 첫 화면 html 을 200 으로 줌 · 위 htmlAsset) · 화면이 스스로 고치는 길(ui/fresh.ts)은 이 통도 비움 */
const STATIC_RE = /^\/(?:office\/[^/]+\.(?:webp|gif|png|jpe?g|svg)|garden-app\/[^/]+\.(?:webp|gif|png|jpe?g|svg)|assets\/(?:fonts|brand)\/.+\.(?:woff2?|png|webp|svg)|vendor\/.+\.(?:js|css|wasm))$/;
const DATA_RE = /^\/[^/]+\.json$/;   // 뿌리 자리 큰 자료(articles.json 530KB 등) = 늘 서버에 묻되 「안 바뀜」이면 담아 둔 것 그대로(늘 새 것 · 받는 양만 줄어듦)
const STATIC_STALE = 3600e3, STATIC_OLD = 30 * 24 * 3600e3, STAMPS = "/__nm-static-at";
let stamps = null, saving = null;   // stamps = { 주소: 마지막으로 서버에 물은 때 }
const staticKey = (url) => url.pathname + url.search;
const keepable = (r) => !!r && r.status === 200 && !htmlAsset(r);
async function loadStamps(c) {
  if (!stamps) { try { const r = await c.match(STAMPS); stamps = r ? await r.json() : {}; } catch { stamps = {}; } }
  return stamps;
}
function saveStamps(c) {   // 여러 건이 한꺼번에 와도 한 번만 적음
  return saving || (saving = new Promise((ok) => setTimeout(ok, 400)).then(() => { saving = null; return c.put(STAMPS, new Response(JSON.stringify(stamps), { headers: { "content-type": "application/json" } })); }).catch(() => { saving = null; }));
}
async function staticRefresh(c, key, hit) {
  try {
    const et = hit.headers.get("etag");
    const r = await fetch(key, { cache: "no-store", headers: et ? { "If-None-Match": et } : {} });
    if (r.status === 304) return;
    if (keepable(r)) await c.put(key, r);
    else if (r.status === 404) await c.delete(key);
  } catch { /* 끊김 = 담아 둔 것 그대로 */ }
}
async function staticGet(e, url) {
  const c = await caches.open(STATIC), key = staticKey(url), hit = await c.match(key), st = await loadStamps(c), now = Date.now();
  if (keepable(hit)) {
    if (now - (st[key] || 0) > STATIC_STALE) { st[key] = now; e.waitUntil(staticRefresh(c, key, hit.clone()).then(() => saveStamps(c))); }
    return hit;
  }
  const res = await fetch(e.request);
  if (keepable(res)) { st[key] = now; e.waitUntil(c.put(key, res.clone()).then(() => saveStamps(c)).catch(() => {})); }
  return res;
}
async function dataGet(e, url) {
  const c = await caches.open(STATIC), key = staticKey(url), hit = await c.match(key);
  try {
    const et = keepable(hit) ? hit.headers.get("etag") : "";
    const r = await fetch(key, { cache: "no-store", headers: et ? { "If-None-Match": et } : {} });
    if (r.status === 304 && hit) return hit;
    if (keepable(r) && r.headers.get("etag")) e.waitUntil(c.put(key, r.clone()).catch(() => {}));
    return r;
  } catch (err) {
    if (keepable(hit)) return hit;   // 끊김 = 마지막으로 받은 것
    throw err;
  }
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method === "POST" && new URL(req.url).pathname === "/garden-app/share") { e.respondWith(takeShare(req)); return; }
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.pathname === "/garden-app/share" || url.pathname === "/garden-app/share.html") return;   // 공유 고르는 판(GET · Pages 가 .html 을 뗌) = 껍데기 캐시(「/garden-app/」 자리)에 안 담음
  if (url.origin === location.origin && url.pathname.startsWith("/api/attachments/")) {   // 입력칸 첨부 미리보기 = 화면이 넣어 둔 캐시(shim/attachments.ts)
    e.respondWith(caches.open("garden-app-att").then((c) => c.match(url.pathname)).then((r) => r || new Response("", { status: 404 })));
    return;
  }
  if (url.origin === location.origin && !req.headers.has("range")) {
    if (STATIC_RE.test(url.pathname)) { e.respondWith(staticGet(e, url)); return; }
    if (DATA_RE.test(url.pathname) && req.mode !== "navigate") { e.respondWith(dataGet(e, url)); return; }
  }
  if (url.origin !== location.origin || !url.pathname.startsWith("/garden-app/")) return;   // /api·다른 화면 = 손대지 않음
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const res = await fetch(req, { cache: "no-store" });   // 첫 화면 = 웹 캐시도 안 탐(옛 첫 화면이 지워진 조각을 부르던 것 · 형 11-14 22:10 · 깃 #-0004)
        if (res.ok) (await caches.open(SHELL)).put("/garden-app/", res.clone());
        return res;
      } catch {
        return (await caches.match("/garden-app/")) || Response.error();
      }
    })());
    return;
  }
  if (url.pathname.startsWith("/garden-app/assets/")) {
    e.respondWith((async () => {
      const hit = await caches.match(req);
      if (hit && !htmlAsset(hit)) return hit;
      if (hit) await (await caches.open(ASSETS)).delete(req).catch(() => {});   // 앞 판이 박아 둔 html(아래) = 버리고 다시 받음
      const res = await fetch(req);
      if (res.ok && !htmlAsset(res)) (await caches.open(ASSETS)).put(req, res.clone());
      return res;
    })());
  }
});
