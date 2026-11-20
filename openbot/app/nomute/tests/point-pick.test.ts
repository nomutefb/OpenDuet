// 가리키기 글 꼴(형 11-12 「내가 마우스로 가리키는 부분도 잇으니까」 · 11-21 「바로 개선점을 적용해줄 수 있어?」) — 셈 = ../ui/point-pick-core.ts · 화면 = ../ui/point-pick.ts
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { colorText, hopText, ownClass, pathText, pickText, styleText } from "../ui/point-pick-core.ts";

test("길 = 우리가 지은 클래스만 · 테일윈드 낱말은 뺌", () => {
  for (const c of ["nm-cchip", "ychat-in", "yset-chip", "nrc", "srow", "cell"]) assert.ok(ownClass(c), c);
  for (const c of ["flex", "items-center", "px-3", "mx-auto", "w-full", "max-w-2xl", "shrink-0", "hover:bg-white/10", "pb-[var(--duet-tab-space,16px)]", "!mt-0", "@container", "text-sm", "rounded-xl", "gap-2"]) assert.ok(!ownClass(c), c);
  assert.equal(hopText({ tag: "button", cls: ["nm-cchip", "flex", "undo"], nth: 2 }), "button.nm-cchip.undo:nth-of-type(2)");
  assert.equal(hopText({ tag: "div", id: "deck", cls: [], shadow: true }), "⟨그림자⟩ div#deck");
});

test("길 = 가리킨 요소에서 위로 이름 있는 칸 셋까지 · 많아야 여섯", () => {
  const path = [{ tag: "main", cls: ["nm-root"] }, { tag: "div", cls: ["ychat", "ychat-in", "mx-auto"] }, { tag: "div", cls: ["flex"] }, { tag: "div", cls: ["nm-cchips"] }, { tag: "button", cls: ["nm-cchip"], nth: 2 }];
  assert.equal(pathText(path), "div.ychat.ychat-in > div > div.nm-cchips > button.nm-cchip:nth-of-type(2)");
  const deep = Array.from({ length: 10 }, () => ({ tag: "div", cls: ["flex"] }));
  assert.equal(pathText(deep).split(" > ").length, 6, "이름 없는 칸만이면 여섯에서 끊음");
});

test("색 = #rrggbb · 반투명은 % · 투명은 뺌 / 옷 = 있는 칸만", () => {
  assert.equal(colorText("rgb(207, 255, 64)"), "#cfff40");
  assert.equal(colorText("rgba(28, 22, 22, 0.92)"), "#1c1616 92%");
  assert.equal(colorText("rgba(0, 0, 0, 0)"), "");
  assert.equal(colorText("rgb(20 20 20 / 50%)"), "#141414 50%");
  assert.equal(styleText({ fontSize: "13px", fontWeight: "600", color: "rgb(207, 255, 64)", backgroundColor: "rgba(0, 0, 0, 0)", borderTopWidth: "0px", borderRadius: "0px", padding: "0px", gap: "normal" }), "13px/600 · 글자 #cfff40");
  assert.equal(styleText({ fontSize: "11px", fontWeight: "700", color: "rgb(139, 143, 138)", borderTopWidth: "1px", borderTopColor: "rgba(0, 0, 0, 0)", borderRadius: "999px" }), "11px/700 · 글자 #8b8f8a · 모서리 999px", "투명 테 = 안 적음");
  assert.equal(styleText({ fontSize: "14px", fontWeight: "400", color: "rgb(255, 255, 255)", backgroundColor: "rgb(20, 20, 20)", borderTopWidth: "1px", borderTopColor: "rgb(42, 45, 36)", borderRadius: "13px", padding: "4px 10px", gap: "6px" }),
    "14px/400 · 글자 #ffffff · 바탕 #141414 · 테 1px #2a2d24 · 모서리 13px · 안 여백 4px 10px · 사이 6px");
});

test("붙는 글 = 코드 칸 한 덩어리(부름 글자가 안 먹게) + 빈 줄 · 글 머리 40자 · 백틱 걷음", () => {
  const t = pickText({ where: "#/channels/tmp-mw8seuv1", sha: "35dd636badf0", view: [1400, 900], rect: [612.4, 830.6, 26, 26], label: "붙여넣기 `x` " + "가".repeat(60),
    path: [{ tag: "div", cls: ["ychat-in"] }, { tag: "div", cls: ["nm-cchips"] }, { tag: "button", cls: ["nm-cchip", "@container"], nth: 2 }],
    style: { fontSize: "13px", fontWeight: "500", color: "rgb(207, 255, 64)" } });
  const lines = t.split("\n");
  assert.equal(lines[0], "```"); assert.equal(lines.at(-2), "```"); assert.equal(lines.at(-1), "", "끝 = 빈 줄(형이 이어 씀)");
  assert.equal(lines[1], "가리킴 · #/channels/tmp-mw8seuv1 · 판 35dd636 · 화면 1400×900");
  assert.match(lines[2]!, /^요소 button\.nm-cchip 「붙여넣기 'x' 가+…」$/);
  assert.equal(lines[3], "길 div.ychat-in > div.nm-cchips > button.nm-cchip:nth-of-type(2)");
  assert.equal(lines[4], "자리 612,831 · 26×26");
  assert.equal(lines[5], "옷 13px/500 · 글자 #cfff40");
  assert.ok(!t.slice(3, -5).includes("`") && !t.includes("@"), "안쪽에 백틱 · 부름 글자 0");
});

test("화면 쪽 = ⌥ 누른 동안만 듣고 · 밑의 단추는 안 눌리고 · 입력칸 + 클립보드 · 얹는 글 0", () => {
  const s = readFileSync(new URL("../ui/point-pick.ts", import.meta.url), "utf8"), main = readFileSync(new URL("../main.tsx", import.meta.url), "utf8"), css = readFileSync(new URL("../ui/point-pick.css", import.meta.url), "utf8");
  assert.match(main, /import "\.\/ui\/point-pick";/);
  assert.match(s, /e\.key === "Alt" && !e\.repeat/); assert.match(s, /window\.addEventListener\("blur", stop\)/);
  assert.match(s, /appendToComposer\(text\)/); assert.match(s, /navigator\.clipboard\.writeText\(text\)/); assert.match(s, /if \(put\) flash\(/, "알림 = 클립보드를 안 기다림");
  assert.match(s, /stopImmediatePropagation/); assert.match(s, /window\.addEventListener\("click", pick, true\)/, "누름 = 늘 들음");
  assert.match(css, /pointer-events:none/); assert.match(css, /var\(--accent, #CFFF40\)/);
  assert.match(css, /\.nm-point-box \{ --accent:#CFFF40; --accent-rgb:207,255,64;/, "body 에 붙는 칸 = 라임 값을 제가 검(안 걸면 원본 앱 회색)");
});

test("폰 = ＋ 판 「가리키기」로 켜고 길게 눌러 잡음 · 뗄 때 글로 · 입력칸 없으면 맡아 뒀다 대화창에서 붙임 · 한 번 잡으면 꺼짐", () => {
  const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
  const s = rd("../ui/point-pick.ts"), sheet = rd("../ui/attach-sheet.tsx"), css = rd("../ui/point-pick.css");
  assert.match(sheet, /import \{ armPointPick \} from "\.\/point-pick";/);
  assert.match(sheet, /onClick=\{\(\) => \{ setInput\(null\); armPointPick\(\); \}\}>.*가리키기<\/button>/);
  assert.match(s, /export function armPointPick\(\)/); assert.match(s, /if \(armed\) \{ disarm\(\); return; \}/, "다시 누르면 꺼짐");
  assert.match(s, /const HOLD_MS = 450, ARM_MS = 90_000/);
  assert.match(s, /window\.addEventListener\("touchend", tEnd, \{ capture: true, passive: false \}\)/, "뗄 때 잡음(클립보드를 쓸 수 있는 때)");
  assert.match(s, /give\(pickText\(facts\(p\.el\)\)\);\n  disarm\(\);/, "한 번 잡으면 꺼짐");
  assert.match(s, /pending = \{ text, at: Date\.now\(\) \}/); assert.match(s, /window\.addEventListener\("hashchange", \(\) => handBack\(\)\)/);
  assert.match(s, /Math\.hypot\(t\.clientX - press\.x, t\.clientY - press\.y\) > 10\) dropPress\(\)/, "밀면(굴리기) 가리킴 아님");
  assert.match(css, /\.nm-point-frame \{ --accent:#CFFF40;/); assert.match(css, /html\.nm-point-armed, html\.nm-point-armed \* \{ -webkit-touch-callout:none/);
  const armOnly = s.slice(s.indexOf("export function armPointPick"), s.indexOf("function disarm"));
  assert.ok(/addEventListener\("touchstart"/.test(armOnly) && !/addEventListener\("touchstart"/.test(s.replace(armOnly, "")), "손가락 듣기 = 켜진 동안만");
});
