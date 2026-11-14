// 옛 에디터 「채널 요약」 · 「SNS」 탭 옷 떼어 오기 — 옛 화면이 실제로 읽던 CSS 를 차례 그대로 모아, 두 탭이 쓰는 규칙만 .ot 안으로 가둠 → ../old-tabs.gen.css
//   고르는 법 = 선택자에 든 클래스 · id 가 전부 「엔진 글줄 + 판(markup)」에 나오는 낱말일 때만 남김(태그만 있는 바탕 규칙은 남김)
//   html · body 몫(뿌리 클래스 · 속성)은 옛 화면을 실제로 띄워 맞는지 물어봄(채널 · SNS × 폰 · PC) → 맞으면 .ot 로 · 한 탭에서만 맞으면 .ot-chan / .ot-sns
//   화면 폭 @media = 그대로(이 판은 좌우를 다 씀) · @keyframes 이름 = ot- 붙임 · 글꼴 파일(@font-face)은 안 가져옴(앱 글꼴)
//   쓰는 법 = 에디터 viewer 폴더를 정적 서버로 낸 뒤(예: python3 -m http.server 8801) 앱 폴더에서 node ui/old-tabs/tools/gen-css.mjs http://127.0.0.1:8801
//             (먼저 gen-js.mjs 를 돌려 ../engine.ts · ../markup.ts 가 있어야 함)
import { createRequire } from "node:module";
import fs from "node:fs";
import { APP, read } from "./lib.mjs";
const req = createRequire(APP + "package.json");
const postcss = req("postcss");
const sp = req("postcss-selector-parser");
const { parse } = req("@babel/parser");
const traverse = req("@babel/traverse").default;
const { chromium } = createRequire(import.meta.url)("playwright");

const BASE = process.argv[2];
if (!BASE) { console.error("쓰는 법: node ui/old-tabs/tools/gen-css.mjs <옛 화면 주소(예 http://127.0.0.1:8801)>"); process.exit(1); }
const ROOT = "ot";
const notes = [];

// ── 낱말 모으기(엔진 글줄 · 판) ──
const K = new Set();
const words = (s) => { for (const m of String(s).matchAll(/[A-Za-z_][\w-]*/g)) K.add(m[0]); };
for (const f of ["engine.ts", "markup.ts"]) {
  const ast = parse(read(APP + "ui/old-tabs/" + f), { sourceType: "module", plugins: ["typescript"] });
  traverse(ast, { StringLiteral(p) { words(p.node.value); }, TemplateElement(p) { words(p.node.value.raw); } });
}
for (const w of ["gy-in", "on", "open", "show", "done", "shake", "firing", "picking", "picked"]) K.add(w);

// ── 옛 화면 띄워 CSS 차례 · 뿌리 상태 받기 ──
const STATES = [["chan", 412], ["chan", 1280], ["trend", 412], ["trend", 1280]];
const b = await chromium.launch();
const pages = [];
for (const [tab, w] of STATES) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: "dark" });
  await p.goto(`${BASE}/?tab=${tab}&inapp=1&only=1`, { waitUntil: "load" });
  await p.waitForTimeout(3500);
  pages.push({ tab, w, p });
}
const sheets = await pages[1].p.evaluate(async () => {
  const out = [];
  for (const s of document.styleSheets) {
    const n = s.ownerNode; if (!n) continue;
    if (n.id === "nm-frame-fit" || n.id === "nm-yeta-tone") continue;
    if (n.tagName === "STYLE") out.push({ name: n.id || "style", css: n.textContent || "", media: n.media || "" });
    else if (n.tagName === "LINK" && s.href) { try { out.push({ name: s.href.replace(/^.*\//, "").replace(/\?.*$/, ""), css: await (await fetch(s.href)).text(), media: n.media || "" }); } catch (e) { out.push({ name: s.href, css: "", err: String(e) }); } }
  }
  return out;
});
console.log("CSS 묶음 " + sheets.length + "개 · " + (sheets.reduce((a, s) => a + s.css.length, 0) / 1024).toFixed(0) + "KB · " + sheets.map((s) => s.name + (s.media ? "[" + s.media + "]" : "")).join(" "));

// ── 뿌리 마디 물어보기 ──
const bare = (c) => c.replace(/::[a-zA-Z-]+(\([^()]*\))?/g, "").replace(/:(hover|active|focus|focus-visible|focus-within|visited|link|target|before|after)\b/g, "");   // 손 올림 · 가짜 요소 뺀 꼴(뿌리 판정용)
const askCache = new Map();
async function ask(list) {
  const need = [...new Set(list)].filter((c) => !askCache.has(c));
  if (!need.length) return;
  const res = await Promise.all(pages.map(({ p }) => p.evaluate((cs) => cs.map((c) => { try { return c ? (document.documentElement.matches(c) ? 1 : document.body.matches(c) ? 2 : 0) : 0; } catch { return 0; } }), need.map(bare))));
  need.forEach((c, i) => askCache.set(c, res.map((r) => r[i])));
}
const compoundsOf = (sel) => { const out = [[]]; sel.each((n) => { if (n.type === "combinator") out.push([]); else out[out.length - 1].push(n); }); return out; };
const namesRoot = (nodes) => nodes.some((n) => (n.type === "tag" && /^(html|body)$/i.test(n.value)) || (n.type === "pseudo" && n.value === ":root"));

// 1차 = 뿌리일 수 있는 앞 마디 다 모아 한 번에 물어봄
const parsed = sheets.map((s) => { try { return postcss.parse(s.css); } catch (e) { notes.push("못 읽은 묶음: " + s.name + " " + e.message); return postcss.parse(""); } });
const cand = [];
for (const root of parsed) root.walkRules((r) => {
  if (r.parent && r.parent.type === "atrule" && /keyframes$/i.test(r.parent.name)) return;
  try { sp((sels) => sels.each((sel) => { for (const c of compoundsOf(sel).slice(0, 3)) { const t = c.map(String).join("").trim(); if (t) cand.push(t); } })).processSync(r.selector.replace(/\/\*[\s\S]*?\*\//g, "")); } catch { /* 2차에서 적음 */ }
});
await ask(cand);
await b.close();

// ── 선택자 하나 바꾸기: 돌려줌 = 새 글줄 · null(버림) ──
const ROOT_KEEP = /^(--|color$|color-scheme$|font|line-height$|letter-spacing$|word-break$|overflow-wrap$|text-rendering$|-webkit-font-smoothing$|-webkit-text-size-adjust$|text-size-adjust$|font-synthesis)/;
function xsel(sel) {
  const comps = compoundsOf(sel);
  const combs = []; sel.each((n) => { if (n.type === "combinator") combs.push(n.toString()); });
  let i = 0, tabs = null, spec = [0, 0, 0];
  for (; i < comps.length; i++) {
    const text = comps[i].map(String).join("").trim();
    if (!text) break;
    const res = askCache.get(text);
    const hit = res ? res.map((v) => v > 0) : [false, false, false, false];
    const named = namesRoot(comps[i]);
    if (!hit.some(Boolean)) { if (named) return null; break; }
    if (comps[i].some((n) => n.type === "pseudo" && (/^::/.test(n.value) || /^:(before|after)$/.test(n.value)))) { if (named) return null; break; }   // html · body 의 가짜 요소(바탕 그림 · 스크롤 막대) = 앱 틀 몫   // html·body 를 대놓고 불렀는데 어느 상태에서도 안 맞음 = 옛 화면에서도 죽은 규칙
    if (!named && !comps[i].some((n) => n.type === "class" || n.type === "attribute" || n.type === "id")) break;   // 태그 · * 만 있는 마디는 뿌리로 안 봄(바탕 규칙 = 틀 안 요소 몫)
    const t = new Set(STATES.filter((_, k) => hit[k]).map((s) => s[0]));
    tabs = tabs ? new Set([...tabs].filter((x) => t.has(x))) : t;
    if (!tabs.size) return null;
    for (const n of comps[i]) { if (n.type === "id") spec[0]++; else if (n.type === "class" || n.type === "attribute" || (n.type === "pseudo" && !/^::/.test(n.value) && !/^:(where)$/.test(n.value))) spec[1]++; else if (n.type === "tag") spec[2]++; }
  }
  const rest = comps.slice(i), restCombs = combs.slice(i);   // restCombs[0] = 뿌리와 나머지 사이
  let bad = false, hasOwn = false, onlyRoot = !rest.length || !rest.some((c) => c.length);
  for (const c of rest) for (const n of c) {
    if (namesRoot([n])) bad = true;
    n.walk && n.walk((m) => { if ((m.type === "tag" && /^(html|body)$/i.test(m.value)) || (m.type === "pseudo" && m.value === ":root")) bad = true; if ((m.type === "class" || m.type === "id") && !K.has(m.value)) bad = true; });
    if (n.type === "class" || n.type === "id") { if (!K.has(n.value)) bad = true; else hasOwn = true; }
  }
  if (bad) return null;
  // 뿌리 몫 = .ot(+ 원래 셈 무게만큼 겹침) · 한 탭에서만 맞던 뿌리 = 그 탭 틀에서만
  let head = (spec[2] ? "div" : "") + "." + ROOT + ("." + ROOT).repeat(spec[1]) + (spec[0] ? ":is(#_,." + ROOT + ")".repeat(1) : "");
  if (tabs && tabs.size === 1) head += "." + ROOT + "-" + ([...tabs][0] === "chan" ? "chan" : "sns");
  if (onlyRoot) return { text: head, rootOnly: true };
  let out = head;
  rest.forEach((c, k) => { const cb = k === 0 ? (i > 0 ? combs[i - 1] : " ") : combs[i + k - 1]; out += (cb && cb.trim() ? " " + cb.trim() + " " : " ") + c.map(String).join("").trim(); });
  return { text: out, rootOnly: false, hasOwn };
}

const WIDTH_RE = /\((?:min|max)-width\s*:[^)]*\)|\(width\s*[<>=][^)]*\)|\([^()]*[<>]=?\s*width[^)]*\)/;   // 폭 조건만(높이 · 가로세로는 창 기준 그대로 = 이 틀은 폭만 잼)
const urls = (v) => v.replace(/url\((['"]?)(?!data:|https?:|\/|#)(?:\.\/)?([^'")]+)\1\)/g, (_, q, p) => `url(${q}/${p}${q})`);
const KF = new Set();
for (const root of parsed) root.walkAtRules(/keyframes$/i, (a) => KF.add(a.params.trim()));
const kfRe = KF.size ? new RegExp(`(^|[\\s,])(${[...KF].map((k) => k.replace(/[-.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?=$|[\\s,;])`, "g") : null;
const usedKF = new Set();
let kept = 0, dropped = 0;

function doRule(r) {
  const outSel = [], rootSel = [];
  let src;
  try { src = sp().astSync(r.selector.replace(/\/\*[\s\S]*?\*\//g, "").trim()); } catch (e) { notes.push("선택자 실패: " + r.selector.slice(0, 80)); r.remove(); return; }
  src.each((sel) => { const x = xsel(sel); if (!x) return; (x.rootOnly ? rootSel : outSel).push(x.text); });
  if (!outSel.length && !rootSel.length) { dropped++; r.remove(); return; }
  if (rootSel.length) {   // 뿌리만 가리키는 규칙 = 변수 · 글자 값만(자리 · 바탕 · 넘침은 앱 틀 몫)
    const c = r.clone({ selector: [...new Set(rootSel)].join(", ") });
    c.walkDecls((d) => { if (!ROOT_KEEP.test(d.prop)) d.remove(); });
    if (c.nodes.length) r.before(c);
  }
  if (outSel.length) { r.selector = [...new Set(outSel)].join(", "); kept++; } else r.remove();
}
function media(a) {
  return;   // 폭 조건 = 창 기준 그대로 둠(이 판은 폰 · PC 모두 좌우를 다 씀 → 창 폭 ≈ 틀 폭 · 틀을 재는 통(container)으로 바꾸면 옆 번호 띠 같은 고정 칸이 스크롤을 못 따라옴)
  if (!WIDTH_RE.test(a.params)) return;
  const qs = a.params.split(/\s*,\s*/);
  const conv = (q) => {
    const ng = q.match(/^not\s+all\s+and\s+(.*)$/i);
    if (ng && WIDTH_RE.test(ng[1]) && !/\sand\s/i.test(ng[1])) return { w: "not " + ng[1].trim(), o: "" };
    const parts = q.split(/\s+and\s+/i);
    return { w: parts.filter((p) => WIDTH_RE.test(p)).join(" and "), o: parts.filter((p) => !WIDTH_RE.test(p) && !/^(screen|all|only\s+screen)$/i.test(p.trim())).join(" and ") };
  };
  const cs = qs.map(conv), others = [...new Set(cs.map((c) => c.o))];
  if (others.length === 1 && cs.every((c) => c.w)) {
    const cont = postcss.atRule({ name: "container", params: ROOT + " " + cs.map((c) => c.w).join(", ") });
    a.each((n) => { cont.append(n.clone()); });
    if (others[0]) { a.params = others[0]; a.removeAll(); a.append(cont); } else a.replaceWith(cont);
  } else notes.push("못 바꾼 @media: " + a.params);
}

let all = "";
sheets.forEach((s, si) => {
  const root = parsed[si];
  root.walkComments((c) => c.remove());
  root.walkAtRules((a) => { a.params = a.params.replace(/\/\*[\s\S]*?\*\//g, "").trim(); });
  root.walkAtRules("font-face", (a) => a.remove());
  root.walkAtRules(/^(import|charset|page|property|counter-style)$/i, (a) => a.remove());
  root.walkRules((r) => { if (r.parent && r.parent.type === "atrule" && /keyframes$/i.test(r.parent.name)) return; doRule(r); });
  root.walkDecls((d) => {
    const bal = (d.value.match(/\(/g) || []).length - (d.value.match(/\)/g) || []).length;
    if (bal) { d.remove(); return; }
    d.value = urls(d.value.replace(/\/\*[\s\S]*?\*\//g, "").trim());
    if (kfRe && /^(-webkit-)?animation(-name)?$/i.test(d.prop) && !(d.parent && d.parent.parent && /keyframes$/i.test(d.parent.parent.name || ""))) d.value = d.value.replace(kfRe, (_, a, n) => { usedKF.add(n); return a + ROOT + "-" + n; });
  });
  root.walkAtRules("media", media);
  if (s.media && s.media !== "all") { const wrap = postcss.atRule({ name: "media", params: s.media }); root.each((n) => wrap.append(n.clone())); root.removeAll(); root.append(wrap); media(wrap); }
  parsed[si] = root;
});
// 키프레임 = 쓰는 것만 · 빈 묶음 치움
for (const root of parsed) {
  root.walkAtRules(/keyframes$/i, (a) => { const n = a.params.trim(); if (usedKF.has(n)) a.params = ROOT + "-" + n; else a.remove(); });
  for (let k = 0; k < 4; k++) { root.walkAtRules((a) => { if (!/keyframes$/i.test(a.name) && (!a.nodes || !a.nodes.length)) a.remove(); }); root.walkRules((r) => { if (!r.nodes.length) r.remove(); }); }
}
sheets.forEach((s, si) => { const t = parsed[si].toString().replace(/\n{2,}/g, "\n").trim(); if (t) all += `\n/* ── ${s.name} ── */\n` + t + "\n"; });
const head = `/* 만든 파일 — 손으로 고치지 말 것(ui/old-tabs/tools/gen-css.mjs · 옛 에디터 「채널 요약」 · 「SNS」 탭이 읽던 CSS 차례 그대로 · 두 탭이 쓰는 규칙만 .ot 안으로)\n   앱에 맞춘 덧줄(색 · 바탕 · 움직임 끔)은 ./old-tabs.css */\n`;
fs.writeFileSync(APP + "ui/old-tabs/old-tabs.gen.css", head + all);
if (process.env.OT_REPORT) fs.writeFileSync(process.env.OT_REPORT + ".css.txt", [...new Set(notes)].join("\n") + "\n\nKF " + [...usedKF].join(" ") + "\n\nROOT\n" + [...askCache].filter(([, v]) => v.some(Boolean)).map(([k, v]) => v.join("") + " " + k).join("\n"));
console.log("남김 " + kept + " · 버림 " + dropped + " · " + (all.length / 1024).toFixed(0) + "KB · 키프레임 " + usedKF.size + " · 적어 둔 것 " + new Set(notes).size);
