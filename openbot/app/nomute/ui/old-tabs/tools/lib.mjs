// 옛 에디터 화면(viewer/index.html) 스크립트를 읽어 맨 위 선언과 서로 부르는 줄을 뽑는 공용 조각
import { createRequire } from "node:module";
import fs from "node:fs";
export const APP = new URL("../../../", import.meta.url).pathname;   // openbot/app/nomute
const req = createRequire(APP + "package.json");
const { parse } = req("@babel/parser");

/** index.html 안 인라인 <script>(src·json·module 뺀 것) 차례대로 */
export function scripts(html) {
  const out = []; const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/g; let m;
  while ((m = re.exec(html))) { const a = m[1]; if (/\bsrc=/.test(a) || /type="(?!text\/javascript)[^"]+"/.test(a)) continue; if (m[2].trim()) out.push({ at: m.index, code: m[2] }); }
  return out;
}
const SKIP = new Set(["type", "start", "end", "loc", "extra", "leadingComments", "trailingComments", "innerComments"]);
/** 노드 안에서 쓰인 이름(멤버 뒤 · 객체 열쇠 · 딱지 빼고) */
export function idents(node, acc = new Set()) {
  if (!node || typeof node !== "object") return acc;
  if (Array.isArray(node)) { for (const n of node) idents(n, acc); return acc; }
  if (node.type === "Identifier") { acc.add(node.name); return acc; }
  if (node.type === "MemberExpression" || node.type === "OptionalMemberExpression") { idents(node.object, acc); if (node.computed) idents(node.property, acc); return acc; }
  if (node.type === "ObjectProperty" || node.type === "ObjectMethod" || node.type === "ClassMethod" || node.type === "ClassProperty") { if (node.computed) idents(node.key, acc); idents(node.value, acc); idents(node.params, acc); idents(node.body, acc); return acc; }
  if (node.type === "LabeledStatement") { idents(node.body, acc); return acc; }
  if (node.type === "BreakStatement" || node.type === "ContinueStatement") return acc;
  for (const k in node) if (!SKIP.has(k)) { const v = node[k]; if (v && typeof v === "object") idents(v, acc); }
  return acc;
}
function patNames(p, acc) {
  if (!p) return;
  if (p.type === "Identifier") acc.push(p.name);
  else if (p.type === "ObjectPattern") p.properties.forEach((q) => patNames(q.type === "RestElement" ? q.argument : q.value, acc));
  else if (p.type === "ArrayPattern") p.elements.forEach((q) => patNames(q, acc));
  else if (p.type === "AssignmentPattern") patNames(p.left, acc);
  else if (p.type === "RestElement") patNames(p.argument, acc);
}
/** 맨 위 글월 하나씩: { si, code, names(선언한 이름), uses, decl(선언인가), line } */
export function topLevel(list) {
  const items = [];
  list.forEach((s, si) => {
    let ast;
    try { ast = parse(s.code, { sourceType: "script", errorRecovery: true, allowReturnOutsideFunction: true }); } catch (e) { items.push({ si, code: s.code, names: [], uses: new Set(), decl: false, bad: String(e.message) }); return; }
    for (const n of ast.program.body) {
      const names = [];
      if (n.type === "FunctionDeclaration" || n.type === "ClassDeclaration") names.push(n.id.name);
      else if (n.type === "VariableDeclaration") n.declarations.forEach((d) => patNames(d.id, names));
      items.push({ si, code: s.code.slice(n.start, n.end), names, uses: idents(n), decl: names.length > 0, kind: n.type, line: n.loc.start.line });
    }
  });
  return items;
}
export const read = (p) => fs.readFileSync(p, "utf8");
