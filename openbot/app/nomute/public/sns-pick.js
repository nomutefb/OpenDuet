(function (mode) {
  // 대화로 보내기 — SNS 웹뷰 안에서 「지금 보는 글」을 집음(형 11-20 10:16 · 미토스 5.2 설계 ① · 구름)
  //   껍데기(맥 · 윈도우)가 단추를 누를 때만 이 파일을 받아(/garden-app/sns-pick.js) 웹뷰 격리 월드에서 「return (이 파일)("pick")」 으로 돌림 → rect 만큼 찍음 → 「("flash")」 = 집은 글 테두리 0.3초
  //   SNS 가 화면을 바꾸면 여기 한 곳만 고침(앱 둘 다시 배포 0) · 클래스 이름 말고 주소 꼴에만 기댐
  //   1) 지금 주소가 글 주소 꼴이면 그 주소 · 2) 아니면(피드) 화면 가운데 요소에서 위로 올라가며 「글 주소 꼴 링크가 한 글만 든 가장 큰 덩이」(article 이면 거기서 멈춤) · 3) 못 찾으면 화면 전체 + 지금 주소
  var W = window, D = document;
  if (mode === "flash") {
    var el = W.__nmPicked, r0 = el && el.isConnected ? el.getBoundingClientRect() : { left: 0, top: 0, width: W.innerWidth, height: W.innerHeight };
    var f = D.createElement("div");
    f.style.cssText = "position:fixed;pointer-events:none;z-index:2147483647;box-sizing:border-box;border:3px solid #d4ff3f;border-radius:12px;opacity:1;transition:opacity .18s ease-out;" +
      "left:" + Math.max(0, r0.left) + "px;top:" + Math.max(0, r0.top) + "px;width:" + Math.min(W.innerWidth, r0.width) + "px;height:" + Math.min(W.innerHeight, r0.height) + "px";
    D.documentElement.appendChild(f);
    setTimeout(function () { f.style.opacity = "0"; }, 120);
    setTimeout(function () { f.remove(); }, 320);
    return { ok: true };
  }
  var host = location.hostname.replace(/^(www|m|mobile)\./, "");
  var site = /(^|\.)instagram\.com$/.test(host) ? "instagram" : /(^|\.)threads\.(net|com)$/.test(host) ? "threads" : /(^|\.)(x|twitter)\.com$/.test(host) ? "x" : "";
  var POST = {
    instagram: /^\/(?:[\w.]+\/)?(?:p|reels?|tv)\/([\w-]+)\/?$/,
    threads: /^\/@[\w.]+\/post\/([\w-]+)\/?$/,
    x: /^\/\w+\/status(?:es)?\/(\d+)/
  };
  var STORY = /^\/stories\/([\w.]+)\/(\d+)/;
  var re = POST[site];
  var vw = W.innerWidth, vh = W.innerHeight;
  function idOf(href) {
    try { var u = new URL(href, location.href); if (u.hostname.replace(/^(www|m|mobile)\./, "") !== host) return ""; var m = re && re.exec(u.pathname); return m ? m[1] : ""; } catch (e) { return ""; }
  }
  function postLinks(root) {
    var out = [], as = root.querySelectorAll ? Array.prototype.slice.call(root.querySelectorAll("a[href]")) : [];
    if (root.tagName === "A" && root.getAttribute("href")) as.unshift(root);   // 칸 하나가 통째 링크(인스타 격자 칸)
    for (var i = 0; i < as.length; i++) { var id = idOf(as[i].getAttribute("href")); if (id) out.push({ a: as[i], id: id }); }
    return out;
  }
  function ids(list) { var s = {}, n = 0; for (var i = 0; i < list.length; i++) if (!s[list[i].id]) { s[list[i].id] = 1; n++; } return n; }
  function mainLink(list) {   // 글 시각(time)을 감싼 링크 = 그 글 자신(X 는 인용 글도 링크가 있어서)
    for (var i = 0; i < list.length; i++) if (list[i].a.querySelector("time")) return list[i];
    return list[0];
  }
  var block = null, url = "", story = STORY.exec(location.pathname);
  if (story) {
    url = location.origin + "/stories/" + story[1] + "/" + story[2] + "/";
  } else if (re && re.test(location.pathname)) {   // 글 화면 = 그 글 자신을 가리키는 링크(시각)에서 위로 = 「한 글만 든 가장 큰 덩이」(답글 · 추천 글은 다른 글 주소라 거기서 멈춤)
    url = location.href;
    var self = re.exec(location.pathname)[1], mine = postLinks(D.body).filter(function (l) { return l.id === self; }), lk = mine.length ? mainLink(mine) : null;
    for (var n0 = lk && lk.a; n0 && n0 !== D.body && n0 !== D.documentElement; n0 = n0.parentElement) {
      var k0 = ids(postLinks(n0));
      if (k0 > 1) break;
      block = n0;
      if (n0.tagName === "ARTICLE") break;
    }
    if (!block) block = D.querySelector("article") || null;
  } else if (re) {
    var start = D.elementFromPoint(vw / 2, vh * 0.45), best = null;
    for (var n = start; n && n !== D.body && n !== D.documentElement; n = n.parentElement) {
      var L = postLinks(n), k = ids(L);
      if (k > 1) break;   // 두 글을 품음 = 너무 큼 · 바로 앞 덩이가 답
      if (k === 1) best = { el: n, link: mainLink(L) };
      if (k === 1 && n.tagName === "ARTICLE") break;
    }
    if (best) { block = best.el; url = new URL(best.link.a.getAttribute("href"), location.href).href; }
  }
  var found = !!url;
  if (!url) url = location.href;
  var author = "", text = "";
  var pu = new URL(url, location.href).pathname, m;
  if (site === "threads" && (m = /^\/@([\w.]+)/.exec(pu))) author = m[1];
  else if (site === "x" && (m = /^\/(\w+)\/status/.exec(pu)) && m[1].toLowerCase() !== "i") author = m[1];
  else if (story) author = story[1];
  else if (site === "instagram" && (m = /^\/([\w.]+)\/(?:p|reels?|tv)\//.exec(pu))) author = m[1];
  var root = block || D.body;
  if (site === "instagram" && !author && found) {   // 글 머리 = /<이름>/ 하나짜리 링크
    var NOT = { explore: 1, accounts: 1, direct: 1, stories: 1, reels: 1, reel: 1, p: 1, tv: 1, legal: 1, about: 1 };
    var as = root.querySelectorAll("a[href]");
    for (var j = 0; j < as.length; j++) { var h = (as[j].getAttribute("href") || "").match(/^\/([\w.]+)\/?$/); if (h && !NOT[h[1]]) { author = h[1]; break; } }
  }
  if (!story && found) {   // 못 찾음 = 주소 + 화면만(캡션 · 이름 0 · 설계 「못 찾으면 화면 전체 스냅샷과 현재 주소만」)
    var tt = site === "x" ? root.querySelector('[data-testid="tweetText"]') : site === "instagram" && !block ? D.querySelector("h1") : null;
    if (tt) text = tt.innerText || "";
    else {   // 덩이 글줄 중 가장 긴 줄(이름 · 시각 · 숫자 · 단추 말 = 짧아서 빠짐)
      var lines = String(root.innerText || "").split("\n"), longest = "";
      for (var q = 0; q < lines.length; q++) { var t = lines[q].trim(); if (t.length > longest.length && t !== author && !/^[\d,.]+\s*\S{0,6}$/.test(t)) longest = t; }
      text = longest.length >= 8 ? longest : "";
    }
  }
  var r = block ? block.getBoundingClientRect() : { left: 0, top: 0, right: vw, bottom: vh };
  var x = Math.max(0, r.left), y = Math.max(0, r.top), w = Math.min(vw, r.right) - x, hh = Math.min(vh, r.bottom) - y;
  if (w < 40 || hh < 40) { block = null; x = 0; y = 0; w = vw; hh = vh; }
  W.__nmPicked = block;
  return { ok: true, site: site, url: url, author: author, text: String(text).slice(0, 600), story: !!story, rect: { x: x, y: y, w: w, h: hh }, vw: vw, vh: vh, whole: !block };
})
