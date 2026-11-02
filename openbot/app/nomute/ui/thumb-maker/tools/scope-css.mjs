// 썸네일 생성기 CSS 가두기 — 원본(thumb.html 이 읽는 차례 그대로)을 .nm-tm 안으로
//   :root·html → .nm-tm(문서 뿌리 대신) · body → .nm-tm-body · 나머지 = .nm-tm 아래 · 화면 폭 @media → @container tm(원본은 iframe 폭 기준)
//   vh·svh·dvh·lvh → cqh · vw → cqw(원본 iframe 높이·폭 = 이 화면 틀) · @keyframes 이름 = tm- 붙임(앱 이름과 안 겹치게) · url(assets/…) → /assets/…(에디터 같은 출처)
//   쓰는 법(앱 폴더 openbot/app/nomute 에서) = node ui/thumb-maker/tools/scope-css.mjs <에디터 저장소> [판=origin/main] → ../thumb-maker.css
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
const APP = new URL("../../../", import.meta.url).pathname;   // openbot/app/nomute
const req = createRequire(APP + "package.json");
const postcss = req("postcss");
const sp = req("postcss-selector-parser");

const [, , EDITOR, REV0] = process.argv;
const REV = REV0 || "origin/main";
const show = (p) => execFileSync("git", ["-C", EDITOR, "show", `${REV}:${p}`], { maxBuffer: 64e6 }).toString("utf8");
const OUT = APP + "ui/thumb-maker/thumb-maker.css";
const TH = show("viewer/thumb.html").split("\n");
const block = (re) => { const i = TH.findIndex((l) => re.test(l)); const j = TH.findIndex((l, k) => k > i && /^<\/style>/.test(l)); return TH.slice(i + 1, j).join("\n"); };
const fontFace = (TH.find((l) => /^<style>@font-face/.test(l)) || "").replace(/^<style>/, "").replace(/<\/style>.*$/, "");
// thumb.html 이 읽는 차례(머리 link·본 <style> → nm-scene → modern-ui 가 붙이는 넷 → 몸 끝 빠른 메뉴 <style>)
const INS = [["fonts", fontFace], ["tokens", "viewer/tokens.css"], ["nm-shared", "viewer/nm-shared.css"], ["nm-clip", "viewer/nm-clip.css"], ["nm-cards", "viewer/nm-cards.css"], ["nm-job", "viewer/nm-job.css"], ["nm-hist", "viewer/nm-hist.css"],
  ["thumb", block(/^<style>\s*$/)], ["nm-scene-tokens", "viewer/nm-scene-tokens.css"], ["nm-scene", "viewer/nm-scene.css"], ["modern-tokens", "viewer/modern-tokens.css"], ["modern-workspace", "viewer/modern-workspace.css"], ["modern-fold", "viewer/modern-fold.css"], ["modern-copy", "viewer/modern-copy.css"],
  ["rfab", (() => { const i = TH.findIndex((l, k) => k > 6000 && /^<style>\s*$/.test(l)); const j = TH.findIndex((l, k) => k > i && /^<\/style>/.test(l)); return TH.slice(i + 1, j).join("\n"); })()]];
const ROOT_CLS = new Set(["inmodal", "modern-workspace", "modern-ui-frame", "nm-scene-ready", "nm-inapp", "scr-locked", "nm-ios", "ios", "touch"]);
const ROOT_ATTR = new Set(["data-nm-skin", "data-nm-scene", "data-spatial-ready", "data-modern-view", "data-theme"]);
const WIDTH_RE = /\((?:min|max)-(?:width|height)\s*:[^)]*\)|\((?:width|height)\s*[<>=][^)]*\)|\(orientation\s*:[^)]*\)|\(aspect-ratio[^)]*\)/;
const notes = [];

function rootish(first) {   // 첫 마디가 뿌리(html) 몫 클래스·속성으로만 됐나
  const ns = first.filter((n) => n.type !== "combinator");
  if (!ns.length) return false;
  const own = (n) => (n.type === "class" && ROOT_CLS.has(n.value)) || (n.type === "attribute" && ROOT_ATTR.has(n.attribute));
  return ns.some(own) && ns.every((n) => own(n) || (n.type === "pseudo" && /^:(not|is|where|has)$/.test(n.value)));   // 뿌리 클래스·속성이 하나는 있어야(:is(.a, .b) 만 있으면 보통 요소)
}
const xform = sp((selectors) => {
  selectors.each((sel) => {
    const nodes = sel.nodes;
    const ci = nodes.findIndex((n) => n.type === "combinator");
    const first = ci < 0 ? nodes : nodes.slice(0, ci);
    let rooted = false;
    for (const n of first) {
      if (n.type === "tag" && n.value.toLowerCase() === "html") { n.replaceWith(sp.className({ value: "nm-tm" })); rooted = true; }
      else if (n.type === "pseudo" && n.value === ":root") { n.replaceWith(sp.className({ value: "nm-tm" })); rooted = true; }
    }
    // body 는 어디 있든 .nm-tm-body
    sel.walkTags((t) => { if (t.value.toLowerCase() === "body") { t.replaceWith(sp.className({ value: "nm-tm-body" })); } });
    // :where(html.x …)·:is(html …) 안의 html = 뿌리 → .nm-tm(첫 마디 안이면 앞에 .nm-tm 를 또 붙이지 않음)
    sel.walkTags((t) => { if (t.value.toLowerCase() === "html") { const inFirst = first.some((n) => n.type === "pseudo" && n.toString().includes(t.toString())); t.replaceWith(sp.className({ value: "nm-tm" })); if (inFirst) rooted = true; else notes.push("안쪽 html(첫 마디 밖): " + sel.toString()); } });
    sel.walkPseudos((p) => { if (p.value === ":root") notes.push("안쪽 :root: " + sel.toString()); });
    if (rooted) return;
    const f2 = (ci < 0 ? sel.nodes : sel.nodes.slice(0, sel.nodes.findIndex((n) => n.type === "combinator") < 0 ? sel.nodes.length : sel.nodes.findIndex((n) => n.type === "combinator")));
    if (f2.length && f2[0].type === "class" && f2[0].value === "nm-tm-body") { sel.prepend(sp.combinator({ value: " " })); sel.prepend(sp.className({ value: "nm-tm" })); return; }
    if (rootish(first)) { sel.prepend(sp.className({ value: "nm-tm" })); return; }
    sel.prepend(sp.combinator({ value: " " }));
    sel.prepend(sp.className({ value: "nm-tm" }));
  });
});

const units = (v) => v.replace(/(-?\d*\.?\d+)(s|d|l)?vh\b/g, "$1cqh").replace(/(-?\d*\.?\d+)(s|d|l)?vw\b/g, "$1cqw").replace(/(-?\d*\.?\d+)vmin\b/g, "$1cqmin").replace(/(-?\d*\.?\d+)vmax\b/g, "$1cqmax");
const urls = (v) => v.replace(/url\((['"]?)(?!data:|https?:|\/|#)(?:\.\/)?([^'")]+)\1\)/g, (_, q, p) => `url(${q}/${p}${q})`);

let all = "/* 썸네일 생성기 옷 — 원본 = 에디터 viewer/(" + REV + " " + execFileSync("git", ["-C", EDITOR, "rev-parse", "--short", REV]).toString().trim() + ") thumb.html 이 읽던 CSS 차례 그대로(tokens·nm-shared·nm-clip·nm-cards·nm-job·nm-hist·thumb 본 스타일·nm-scene·모던 겉옷 넷·빠른 메뉴)\n   만든 길 = ./tools/scope-css.mjs(postcss) — :root·html → .nm-tm · body → .nm-tm-body · 그 밖 = .nm-tm 아래 · 폭 @media → @container tm · vh·vw → cqh·cqw · @keyframes = tm- · url(assets/…) → /assets/… · 주석 뺌\n   다시 맞출 땐 같은 도구로 다시 뗌(손으로 고친 줄 0 · 앞머리 되돌림 = ./tools/reset.css · 이 화면만의 덧줄 = ./frame.css) */\n" + fs.readFileSync(new URL("./reset.css", import.meta.url), "utf8");
const KF = new Set();
const sheets = INS.map(([name, src]) => ({ name, css: /^viewer\//.test(src) ? show(src) : src }));
// 1차 = 키프레임 이름 모으기
for (const s of sheets) postcss.parse(s.css).walkAtRules(/keyframes$/i, (a) => KF.add(a.params.trim()));
const kfRe = KF.size ? new RegExp(`(^|[\\s,])(${[...KF].map((k) => k.replace(/[-]/g, "\\-")).join("|")})(?=$|[\\s,;])`, "g") : null;
for (const s of sheets) {
  const root = postcss.parse(s.css);
  root.walkComments((c) => c.remove());
  root.walkAtRules((a) => { a.params = a.params.replace(/\/\*[\s\S]*?\*\//g, "").trim(); });
  root.walkRules((r) => { r.selector = r.selector.replace(/\/\*[\s\S]*?\*\//g, "").trim(); });
  root.walkAtRules((a) => {
    if (/keyframes$/i.test(a.name)) { a.params = "tm-" + a.params.trim(); return; }
    if (a.name === "font-face") return;
    if (a.name === "media" && WIDTH_RE.test(a.params)) {
      // 폭·높이 조건 = 틀(iframe 대신) 기준 → @container tm · 나머지 조건(hover·pointer·motion)은 @media 로 남김
      const qs = a.params.split(/\s*,\s*/);
      if (qs.length > 1 && qs.some((q) => !WIDTH_RE.test(q))) notes.push("섞인 @media 목록: " + a.params);
      const conv = (q) => {
        const ng = q.match(/^not\s+all\s+and\s+(.*)$/i);   // 「not all and (폭)」 = 폭이 아닐 때 → @container not (폭)
        if (ng && WIDTH_RE.test(ng[1]) && !/\sand\s/i.test(ng[1])) return { w: "not " + ng[1].trim(), o: "" };
        const parts = q.split(/\s+and\s+/i);
        const w = parts.filter((p) => WIDTH_RE.test(p)), o = parts.filter((p) => !WIDTH_RE.test(p) && !/^(screen|all|only\s+screen)$/i.test(p.trim()));
        return { w: w.join(" and "), o: o.join(" and ") };
      };
      const cs = qs.map(conv);
      const others = [...new Set(cs.map((c) => c.o))];
      if (others.length === 1 && cs.every((c) => c.w)) {
        const cont = postcss.atRule({ name: "container", params: "tm " + cs.map((c) => c.w).join(", ") });
        a.each((n) => { cont.append(n.clone()); });
        if (others[0]) { a.params = others[0]; a.removeAll(); a.append(cont); }
        else a.replaceWith(cont);
      } else notes.push("못 바꾼 @media: " + a.params);
    }
  });
  root.walkRules((r) => {
    if (r.parent && r.parent.type === "atrule" && /keyframes$/i.test(r.parent.name)) return;
    try { r.selector = xform.processSync(r.selector); } catch (e) { notes.push("선택자 실패: " + r.selector + " " + e.message); }
  });
  root.walkDecls((d) => {
    const bal = (d.value.match(/\(/g) || []).length - (d.value.match(/\)/g) || []).length;
    if (bal) { notes.push("괄호 안 맞는 선언 뺌(브라우저도 버림): " + d.prop + ":" + d.value); d.remove(); return; }
    d.value = urls(units(d.value.replace(/\/\*[\s\S]*?\*\//g, "").trim()));
    if (kfRe && /^(-webkit-)?animation(-name)?$/i.test(d.prop)) d.value = d.value.replace(kfRe, (_, a, n) => a + "tm-" + n);
  });
  all += `\n/* ── ${s.name} ── */\n` + root.toString().replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
fs.writeFileSync(OUT, all);
console.log("키프레임", [...KF].join(" "));
console.log(notes.slice(0, 60).join("\n"));
console.log("크기", all.length);
