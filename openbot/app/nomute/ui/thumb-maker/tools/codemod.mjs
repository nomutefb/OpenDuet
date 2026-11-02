// 썸네일 생성기 엔진 옮기기(코드모드) — 원본 viewer/thumb.html 의 <script> 를 줄 그대로 여러 모듈로 나눈다(../engine/p01~p14 를 다시 만듦)
//   함수 선언·화살표 const·글자 상수 = 모듈 꼭대기 export(그대로) · 그 밖 전역 let/var/const = S.<이름>(창 열 때마다 새로)
//   주석은 뺀다(원본 주석은 viewer/thumb.html 에 그대로) · 다른 조각 함수는 import · document·window·타이머 = ./rt
//   쓰는 법(앱 폴더 openbot/app/nomute 에서) = node ui/thumb-maker/tools/codemod.mjs <에디터 저장소> [판=origin/main]
//   원본 줄이 바뀌면 PARTS 의 나눔 줄(원본 줄 번호)도 다시 맞춘다(그 줄에서 시작하는 문장부터 다음 조각)
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const APP = new URL("../../../", import.meta.url).pathname;   // openbot/app/nomute
const req = createRequire(APP + "package.json");
const { parse } = req("@babel/parser");
const traverse = req("@babel/traverse").default;
const MS = req("magic-string");
const MagicString = MS.default || MS;

const [, , EDITOR, REV0] = process.argv;
const REV = REV0 || "origin/main";
const show = (p) => execFileSync("git", ["-C", EDITOR, "show", `${REV}:${p}`], { maxBuffer: 64e6 }).toString("utf8");
const SRC_REV = `${REV} ${execFileSync("git", ["-C", EDITOR, "rev-parse", "--short", REV]).toString().trim()}`;
const OUT_DIR = APP + "ui/thumb-maker/engine";
const html = show("viewer/thumb.html").split("\n");

// 원본 조각(1부터 세는 줄 · 양끝 포함)
const CHUNKS = [
  { from: 1304, to: 6416, what: "본 스크립트" },
  { from: 6471, to: 6519, what: "빠른 메뉴(rfab)" },
  { from: 6525, to: 6538, what: "이전 제작 접기 단추" },
  { from: 6541, to: 6557, what: "nmTabReset" },
];
// 나눔 = 원본 줄 기준(그 줄에서 시작하는 문장부터 다음 조각)
const PARTS = [
  { file: "p01-core", from: 1304, title: "뼈대 — 확인 창·앱 전환(selApp)·해상도·채움·모자이크 토글·줄 수 한도·저작권·합성" },
  { file: "p02-preview", from: 1726, title: "합성 미리보기(renderCpPrev)·사진 자리 잡기(끌기·확대)" },
  { file: "p03-options", from: 2167, title: "카드뉴스 세그·헤더 잠금·안내문·옵션 줄·미리보기 확대·축약어 창·OPA 칩·사진 받기" },
  { file: "p04-media", from: 2796, title: "붙여넣기·복사·다운로드·AI 생성 잡·확장 미리보기(리사이즈)" },
  { file: "p05-text", from: 3301, title: "한 줄 칸·자모 낱자·둥근 따옴표·별표 강조·드래프트 그림 보관" },
  { file: "p06-draft", from: 3525, title: "수정(이전 제작 → 작성기 복원)·드래프트 자동 보관" },
  { file: "p07-jobs", from: 3768, title: "대기열(JOBS)·진행 타일·잡 카드·폴링" },
  { file: "p08-results", from: 4244, title: "라벨·결과 박스·캐러셀·섹션 접기·이전 제작·동기화" },
  { file: "p09-restore", from: 4711, title: "최근 결과 복원·최신 추종" },
  { file: "p10-cards", from: 4912, title: "카드뉴스 칩 편집기" },
  { file: "p11-fit", from: 5328, title: "자간 자동(estTracking·estHeaderTr)·잉크 글자·초과 끊기·축약·발사" },
  { file: "p12-spell", from: 5813, title: "맞춤법 자동 교정·자가 학습·모자이크(편집)" },
  { file: "p13-fire", from: 6097, title: "카드 제작 발사 짐·막힌 자리 표시·재개·부팅" },
  { file: "p14-tail", from: 6471, title: "빠른 메뉴·이전 제작 접기 단추·nmTabReset" },
];

// 프로그램 = 조각을 이어 붙임 · 줄 → 원본 줄 표
const progLines = [], origOf = [];
for (const c of CHUNKS) for (let n = c.from; n <= c.to; n++) { progLines.push(html[n - 1]); origOf.push(n); }
const prog = progLines.join("\n");
const lineStarts = [0]; for (let i = 0; i < prog.length; i++) if (prog[i] === "\n") lineStarts.push(i + 1);
const origLineAt = (off) => { let lo = 0, hi = lineStarts.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (lineStarts[m] <= off) lo = m; else hi = m - 1; } return origOf[lo]; };
const partOf = (off) => { const L = origLineAt(off); let k = 0; for (let i = 0; i < PARTS.length; i++) if (PARTS[i].from <= L) k = i; return k; };

const ast = parse(prog, { sourceType: "script" });
const svgAst = parse(show("viewer/nm-svg.js"), { sourceType: "script" });
const SVG = new Set(); for (const s of svgAst.program.body) if (s.type === "VariableDeclaration") for (const d of s.declarations) SVG.add(d.id.name);
const RT = new Set(["document", "window", "setTimeout", "clearTimeout", "setInterval", "clearInterval", "requestAnimationFrame", "cancelAnimationFrame", "requestIdleCallback", "cancelIdleCallback", "MutationObserver", "ResizeObserver", "IntersectionObserver", "parent", "top", "self", "scrollTo", "scrollBy", "addEventListener", "removeEventListener", "scrollY", "pageYOffset", "innerHeight", "innerWidth", "matchMedia", "fetch", "Image"]);

let P; traverse(ast, { Program(p) { P = p; p.stop(); } });
const scope = P.scope;
const ms = new MagicString(prog);

/* ── 분류 ── */
const PURE_READ = new Set(["length", "includes", "indexOf", "has", "get", "forEach", "map", "filter", "some", "every", "find", "findIndex", "join", "slice", "keys", "values", "entries", "test", "exec", "concat", "reduce", "flatMap", "lastIndexOf", "at", "source", "size", "replace", "match", "split", "toString"]);
const isPure = (n) => {
  if (!n) return false;
  switch (n.type) {
    case "StringLiteral": case "NumericLiteral": case "BooleanLiteral": case "NullLiteral": case "RegExpLiteral": return true;
    case "TemplateLiteral": return n.expressions.length === 0;
    case "UnaryExpression": return ["-", "+", "!"].includes(n.operator) && isPure(n.argument);
    case "BinaryExpression": return isPure(n.left) && isPure(n.right);
    case "ArrayExpression": return n.elements.every((e) => e && isPure(e));
    case "ObjectExpression": return n.properties.every((p) => p.type === "ObjectProperty" && !p.computed && isPure(p.value));
    case "NewExpression": return n.callee.type === "Identifier" && ["Set", "Map"].includes(n.callee.name) && n.arguments.every(isPure);
    default: return false;
  }
};
const isPrim = (n) => !!n && (["StringLiteral", "NumericLiteral", "BooleanLiteral", "NullLiteral", "RegExpLiteral"].includes(n.type) || (n.type === "TemplateLiteral" && !n.expressions.length) || (n.type === "UnaryExpression" && ["-", "+", "!"].includes(n.operator) && isPrim(n.argument)) || (n.type === "BinaryExpression" && isPrim(n.left) && isPrim(n.right)));
const readOnlyUse = (rp) => {
  const par = rp.parentPath;
  if (par.isMemberExpression() && par.node.object === rp.node) {
    const gp = par.parentPath;
    if (gp.isAssignmentExpression() && gp.node.left === par.node) return false;
    if (gp.isUpdateExpression()) return false;
    if (gp.isUnaryExpression({ operator: "delete" })) return false;
    if (!par.node.computed && par.node.property.type === "Identifier") {
      const nm = par.node.property.name;
      if (gp.isCallExpression() && gp.node.callee === par.node) return PURE_READ.has(nm);
      return true;
    }
    return true;   // X[i] 읽기
  }
  if (par.isSpreadElement()) return true;
  if (par.isForOfStatement() && par.node.right === rp.node) return true;
  if (par.isCallExpression() && par.node.callee.type === "MemberExpression") {
    const c = par.node.callee; const o = c.object.type === "Identifier" ? c.object.name : "";
    const m = c.property.name;
    if ((o === "Object" && ["keys", "values", "entries"].includes(m)) || (o === "JSON" && m === "stringify") || (o === "Array" && m === "isArray")) return true;
  }
  if (par.isBinaryExpression() || par.isLogicalExpression() || par.isConditionalExpression() || par.isTemplateLiteral()) return true;
  return false;
};
const CLS = new Map(), DECL_PART = new Map();
for (const [name, b] of Object.entries(scope.bindings)) {
  let cls = "state";
  if (b.kind === "hoisted") cls = b.constantViolations.length ? "hfn" : "fn";   // 원본이 나중에 갈아 끼우는 함수(updateGoSpec = function … 등) = S 에 올려 둠
  else if (b.kind === "const") {
    const init = b.path.node.init;
    if (init && (init.type === "ArrowFunctionExpression" || init.type === "FunctionExpression")) cls = "fn";
    else if (isPrim(init) || (isPure(init) && b.referencePaths.every(readOnlyUse))) cls = "lit";   // 글자·숫자 상수 = 바뀔 수 없음 → 그대로 · 표(배열·객체)는 읽기만 쓰일 때만
  }
  CLS.set(name, cls);
  DECL_PART.set(name, partOf(b.path.node.start));
}

/* ── 고침: 상태 이름 → S.이름 ── */
const done = new Set();
const sw = (node, txt) => { const k = node.start + ":" + node.end; if (done.has(k)) return; done.add(k); ms.overwrite(node.start, node.end, txt); };
const patIds = (pat, name, out) => {
  if (!pat) return;
  if (pat.type === "Identifier") { if (pat.name === name) out.push({ node: pat, short: false }); return; }
  if (pat.type === "ObjectPattern") for (const p of pat.properties) { if (p.type === "RestElement") patIds(p.argument, name, out); else if (p.shorthand && p.value.type === "Identifier" && p.value.name === name) out.push({ node: p.value, short: true }); else patIds(p.value, name, out); }
  else if (pat.type === "ArrayPattern") pat.elements.forEach((e) => patIds(e, name, out));
  else if (pat.type === "AssignmentPattern") patIds(pat.left, name, out);
  else if (pat.type === "RestElement") patIds(pat.argument, name, out);
};
for (const [name, b] of Object.entries(scope.bindings)) {
  if (CLS.get(name) !== "state" && CLS.get(name) !== "hfn") continue;
  for (const rp of b.referencePaths) {
    const par = rp.parent;
    if (par.type === "ObjectProperty" && par.shorthand && par.value === rp.node) sw(rp.node, `${name}: S.${name}`);
    else sw(rp.node, `S.${name}`);
  }
  for (const cv of b.constantViolations) {
    if (cv.isVariableDeclarator()) continue;   // 다시 선언 = 아래 내보내기에서
    if (cv.isAssignmentExpression()) { const out = []; patIds(cv.node.left, name, out); out.forEach((o) => sw(o.node, o.short ? `${name}: S.${name}` : `S.${name}`)); }
    else if (cv.isUpdateExpression()) sw(cv.node.argument, `S.${name}`);
    else if (cv.isForXStatement()) { const out = []; patIds(cv.node.left.type === "VariableDeclaration" ? null : cv.node.left, name, out); out.forEach((o) => sw(o.node, `S.${name}`)); }
    else console.error("모르는 바꿈", name, cv.type, origLineAt(cv.node.start));
  }
}
/* 주석 빼기 */
for (const c of ast.comments) {
  if (c.type === "CommentLine") ms.remove(c.start, c.end);
  else ms.overwrite(c.start, c.end, /\n/.test(c.value) ? "\n" : " ");
}

/* ── 가져오기 셈 ── */
const imports = PARTS.map(() => ({ parts: new Map(), svg: new Set(), rt: new Set() }));
const unknown = new Map();
const KNOWN = new Set(["Object", "Array", "JSON", "Math", "Number", "String", "Boolean", "Date", "RegExp", "Promise", "Map", "Set", "WeakMap", "WeakSet", "Error", "TypeError", "Symbol", "Infinity", "NaN", "undefined", "isFinite", "isNaN", "parseInt", "parseFloat", "encodeURIComponent", "decodeURIComponent", "encodeURI", "decodeURI", "URL", "URLSearchParams", "Blob", "File", "FileReader", "Event", "CustomEvent", "KeyboardEvent", "localStorage", "sessionStorage", "indexedDB", "location", "history", "navigator", "console", "getComputedStyle", "devicePixelRatio", "getSelection", "performance", "structuredClone", "queueMicrotask", "AbortController", "AbortSignal", "atob", "btoa", "TextEncoder", "TextDecoder", "Intl", "screen", "alert", "confirm", "prompt", "CSS", "Node", "HTMLElement", "Element", "DOMParser", "DataTransfer", "ClipboardItem", "Response", "Headers", "Request", "FormData", "HTMLCanvasElement", "OffscreenCanvas", "createImageBitmap", "crypto", "Uint8Array", "Uint8ClampedArray", "ArrayBuffer", "Float32Array", "Int32Array", "Reflect", "Proxy", "globalThis", "arguments", "BigInt", "escape", "unescape", "PointerEvent", "MouseEvent", "TouchEvent", "InputEvent", "FocusEvent", "DOMRect", "Range", "Selection", "HTMLTextAreaElement", "HTMLInputElement", "visualViewport", "getComputedStyle", "eval", "WebSocket", "Worker", "caches", "Notification", "ImageData", "Path2D", "CanvasRenderingContext2D", "FontFace", "outerWidth", "outerHeight", "close", "open", "print", "origin", "isSecureContext", "AggregateError", "SyntaxError", "RangeError"]);
traverse(ast, {
  ReferencedIdentifier(p) {
    const name = p.node.name; if (p.node.type !== "Identifier") return;
    const part = partOf(p.node.start);
    const b = p.scope.getBinding(name);
    if (b) {
      if (b.scope !== scope) return;
      const cls = CLS.get(name); if (cls === "state" || cls === "hfn") return;
      const dp = DECL_PART.get(name); if (dp !== part) imports[part].parts.set(name, dp);
      return;
    }
    if (SVG.has(name)) imports[part].svg.add(name);
    else if (RT.has(name)) imports[part].rt.add(name);
    else if (!KNOWN.has(name)) unknown.set(name, (unknown.get(name) || 0) + 1);
  },
});
/* 꼭대기 문장이 상태 전역을 = 로 바꾸는 꼴(암묵 전역) 찾기 */
for (const g of Object.keys(scope.globals || {})) if (!KNOWN.has(g) && !RT.has(g) && !SVG.has(g)) unknown.set(g, unknown.get(g) || 0);

/* ── 내보내기 ── */
const outs = PARTS.map(() => ({ mod: [], run: [], hoist: [] }));
const clean = (s) => s.split("\n").map((l) => l.replace(/[ \t]+$/, "")).filter((l, i, a) => !(l === "" && (i === 0 || a[i - 1] === ""))).join("\n").replace(/^\n+|\n+$/g, "");
for (const st of ast.program.body) {
  const k = partOf(st.start), o = outs[k];
  if (st.type === "FunctionDeclaration") {
    if (CLS.get(st.id.name) === "hfn") { o.mod.push(clean(ms.slice(st.start, st.end))); o.hoist.push(st.id.name); continue; }
    o.mod.push("export " + clean(ms.slice(st.start, st.end))); continue;
  }
  if (st.type === "VariableDeclaration") {
    for (const d of st.declarations) {
      const name = d.id.name, cls = CLS.get(name), init = d.init ? clean(ms.slice(d.init.start, d.init.end)) : null;
      if (cls === "state") o.run.push(`S.${name} = ${init == null ? "undefined" : init};`);
      else o.mod.push(`export const ${name} = ${init};`);
    }
    continue;
  }
  o.run.push(clean(ms.slice(st.start, st.end)));
}
fs.mkdirSync(OUT_DIR, { recursive: true });
const report = [];
PARTS.forEach((pt, k) => {
  const to = k + 1 < PARTS.length ? PARTS[k + 1].from - 1 : CHUNKS[CHUNKS.length - 1].to;
  const im = imports[k], lines = [];
  lines.push("// @ts-nocheck");
  lines.push(`// 썸네일 생성기 엔진 · ${pt.title}`);
  lines.push(`//   원본 = 에디터 viewer/thumb.html ${pt.from}~${to}줄(${SRC_REV}) — 줄 그대로 옮김 · 주석만 뺌(까닭·형 말은 원본 주석에 그대로)`);
  lines.push("//   바꾼 곳 = 화면 전역 let·var·표 const → S.<이름>(./state · 창 열 때마다 새로) · document·window·타이머 = ./rt(이 화면 뿌리 안으로 · 닫으면 다 걷음) · 함수는 그대로 내보내고 서로 가져옴");
  lines.push("//   다시 맞출 땐 ../tools/codemod.mjs 로 원본 줄을 통째로 다시 뗌(손으로 고친 줄 0 · 원본 갈아 끼우는 함수 selApp·updateGoSpec = S 에 올림 · hoist())");
  if (outs[k].hoist.length || outs[k].run.some((s) => /\bS\./.test(s)) || outs[k].mod.some((s) => /\bS\./.test(s))) lines.push('import { S } from "./state";');
  if (im.rt.size) lines.push(`import { ${[...im.rt].sort().join(", ")} } from "./rt";`);
  if (im.svg.size) lines.push(`import { ${[...im.svg].sort().join(", ")} } from "./svg";`);
  const byPart = new Map(); for (const [n, p] of im.parts) { if (!byPart.has(p)) byPart.set(p, []); byPart.get(p).push(n); }
  [...byPart.keys()].sort((a, b) => a - b).forEach((p) => lines.push(`import { ${byPart.get(p).sort().join(", ")} } from "./${PARTS[p].file}";`));
  lines.push("");
  lines.push(...outs[k].mod.flatMap((s) => [s]));
  lines.push("");
  if (outs[k].hoist.length) { lines.push("/** 원본에서 나중에 갈아 끼우는 함수 = 맨 처음(모든 조각 start 전) S 에 올림 · 원본의 함수 끌어올림과 같은 때 */"); lines.push("export function hoist() {"); outs[k].hoist.forEach((n) => lines.push(`  S.${n} = ${n};`)); lines.push("}"); lines.push(""); }
  lines.push("export function start() {");
  lines.push(...outs[k].run);
  lines.push("}");
  const txt = lines.join("\n") + "\n";
  fs.writeFileSync(path.join(OUT_DIR, pt.file + ".ts"), txt);
  report.push(`${pt.file}: ${txt.split("\n").length}줄 · 함수 ${outs[k].mod.length} · 실행 ${outs[k].run.length}`);
});
const stateNames = [...CLS].filter(([, c]) => c === "state").map(([n]) => n);
console.log(report.join("\n"));
console.log("갈아 끼우는 함수", [...CLS].filter(([, c]) => c === "hfn").map(([n]) => n).join(" "));
console.log("상태", stateNames.length, "· 글자상수", [...CLS].filter(([, c]) => c === "lit").length, "· 함수", [...CLS].filter(([, c]) => c === "fn").length);
console.log("모르는 전역", JSON.stringify([...unknown]));
