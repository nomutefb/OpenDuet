// 카드 제작 글자 한 단 얇게 — ../thumb-maker.css(원본을 가둔 판 · 손으로 안 고침)를 읽어 굵기 줄만 한 단 낮춘 덧판 ../thin.css 를 만듦
//   형 11-11 06:15 봄 1:1(봄 옮김) 「폰트는 굵기를 얇게」 · 옛 에디터도 같은 굵기(800 · 700 · 9222 실측)라 「한 단 얇게」(봄 06:16)
//   차례: 800 → 700 · 700 → 600 · 900 → 800 · 토큰 --fw-x 800 → 700 · --fw-b 700 → 600 · 600 이하 = 그대로 · 고른 줄 · @container · @media 감싸기 그대로(같은 선택자 · 뒤에 읽혀 이김)
//   쓰는 법(앱 폴더 openbot/app/nomute 에서) = node ui/thumb-maker/tools/thin-css.mjs → ../thin.css · 원본 판을 다시 떼면 이것도 다시 돌림 · 옛 굵기로 = index.tsx 의 thin.css 줄 하나 뺌
import { createRequire } from "node:module";
import fs from "node:fs";
const APP = new URL("../../../", import.meta.url).pathname;
const postcss = createRequire(APP + "package.json")("postcss");
const SRC = APP + "ui/thumb-maker/thumb-maker.css", OUT = APP + "ui/thumb-maker/thin.css";
const STEP = { "900": "800", "800": "700", "700": "600" };
const TOK = { "--fw-x": { "800": "700" }, "--fw-b": { "700": "600" } };
const root = postcss.parse(fs.readFileSync(SRC, "utf8"));
const out = postcss.root();
let n = 0;
root.walkRules((rule) => {
  if (rule.parent?.type === "atrule" && /keyframes$/i.test(rule.parent.name)) return;
  const decls = [];
  rule.each((d) => {
    if (d.type !== "decl") return;
    const v = d.value.trim(), imp = d.important;
    if (d.prop === "font-weight" && STEP[v]) decls.push(postcss.decl({ prop: "font-weight", value: STEP[v], important: imp }));
    else if (TOK[d.prop]?.[v]) decls.push(postcss.decl({ prop: d.prop, value: TOK[d.prop][v], important: imp }));
  });
  if (!decls.length) return;
  n += decls.length;
  let node = postcss.rule({ selector: rule.selector, nodes: decls });
  for (let p = rule.parent; p && p.type === "atrule"; p = p.parent) node = postcss.atRule({ name: p.name, params: p.params, nodes: [node] });
  out.append(node);
});
fs.writeFileSync(OUT, "/* 기계가 만듦(./tools/thin-css.mjs) — 손으로 안 고침 · 카드 제작 글자 한 단 얇게(형 11-11 06:15 「폰트는 굵기를 얇게」) · 원본 판 = ./thumb-maker.css */\n" + out.toString() + "\n");
console.log("굵기 줄", n, "→", OUT);
