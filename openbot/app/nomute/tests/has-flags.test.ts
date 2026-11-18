// 「저 요소가 있으면」 = 뿌리 · 대화 기둥에 :has() 를 걸지 않고 표시(속성)로(구름 11-17 · 봄 배분 09:45)
//   까닭 = 뿌리가 :has 의 닻이면 그 밑 어디에 요소 하나가 꽂히거나 클래스 하나가 바뀌어도 꼴을 통째로 다시 셈(실물 PC 1440 · 요소 1.1만: 55 ~ 61ms → 뺀 뒤 0.1 ~ 1ms)
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import test from "node:test";
import { ROOT_FLAGS, flagAttr, flagStep } from "../ui/has-flags.ts";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const walk = (dir: URL, out: URL[] = []): URL[] => {
  for (const n of readdirSync(dir)) {
    if (n === "node_modules" || n === "dist" || n === "tests" || n === "vendor") continue;
    const u = new URL(n + (statSync(new URL(n, dir)).isDirectory() ? "/" : ""), dir);
    if (u.pathname.endsWith("/")) walk(u, out); else if (/\.css$/.test(n)) out.push(u);
  }
  return out;
};

test("표시 셈 = 여럿이 같은 표시를 달아도 처음 달 때 · 마지막 뗄 때만 속성에 손댐", () => {
  assert.deepEqual(flagStep(0, 1), { n: 1, touch: "on" });
  assert.deepEqual(flagStep(1, 1), { n: 2, touch: null });   // 대화 머리줄 둘째
  assert.deepEqual(flagStep(2, -1), { n: 1, touch: null });
  assert.deepEqual(flagStep(1, -1), { n: 0, touch: "off" });
  assert.deepEqual(flagStep(0, -1), { n: 0, touch: null });   // 밑으로 안 내려감
  assert.deepEqual(ROOT_FLAGS.map(flagAttr), ["data-nm-split", "data-nm-chat-h", "data-nm-menubar", "data-nm-see", "data-nm-pinsheet", "data-nm-teams"]);
});

test("우리 CSS 에 뿌리(html · body · :root) · 대화 기둥(.nm-col)에 건 :has() 0 — 다시 넣으면 요소 하나 꽂을 때마다 화면이 50ms 씩 멎음", () => {
  const bad: string[] = [];
  for (const u of walk(new URL("../", import.meta.url))) {
    const css = readFileSync(u, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    for (const m of css.matchAll(/([^{}]*)\{/g)) for (const sel of m[1].split(",")) {
      const s = sel.trim();
      if (/^(:root|html|body)(?![\w-])[^\s>+~]*:has\(/.test(s) || /(^|[\s>+~])\.nm-col(?![\w-])[^\s>+~]*:has\(/.test(s)) bad.push(`${u.pathname.split("/nomute/")[1]} — ${s.slice(0, 90)}`);
    }
  }
  assert.deepEqual(bad, [], "뿌리 · 기둥에 건 :has() — ui/has-flags.ts 의 표시(useRootFlag · useColFlag)로 바꿔 주세요");
});

test("배선 = 그 요소를 그리는 쪽이 표시를 닮 · CSS 는 속성을 봄(속성 하나 = :has(.클래스) 하나와 같은 무게 → 규칙 차례 그대로)", () => {
  const sh = rd("../ui/shell.tsx"), hf = rd("../ui/has-flags.ts");
  assert.match(sh, /const split = useSplit\(\);[^\n]*\n  useRootFlag\("split", split\);/);
  assert.match(sh, /<div className="nm-col nm-col-chat" data-chat-h=\{split && !isTeams\(room\) \? "" : undefined\}>/);   // 대화 머리줄(ChatHead)을 그리는 조건과 같은 식
  assert.match(sh, /isTeams\(room\) \? null : split \? <ChatHead room=\{room\}/);
  assert.ok(sh.indexOf('useRootFlag("see"') < sh.indexOf('if ("bare" in where) return'));   // 훅 = 일찍 돌아가는 줄보다 앞
  assert.match(rd("../ui/chat-head.tsx"), /useRootFlag\("chat-h"\);/);
  assert.match(rd("../ui/menu-bar.tsx"), /useRootFlag\("menubar"\);/);
  assert.match(rd("../ui/ed-keep.tsx"), /useRootFlag\("see"\);/);
  assert.match(rd("../ui/pins.tsx"), /useRootFlag\("pinsheet"\); useColFlag\(box, "data-pinsheet", true, true\);/);
  assert.match(rd("../ui/top.tsx"), /useColFlag\(mark, "data-room-mark", !!r\);/);
  assert.match(hf, /useInsertionEffect\(\(\) => \{/);   // 뿌리 표시 = 요소가 꽂히는 그 판 안 · 자리 재는 효과들보다 먼저
  assert.match(rd("../ui/menu-bar.css"), /:root\[data-nm-menubar\] \.nm-split-root/); assert.match(rd("../ui/menu-bar.css"), /html\.nm-macapp\[data-nm-menubar\]/);
  assert.match(rd("../ui/chat-head.css"), /:root\[data-nm-split\]\[data-nm-chat-h\] \.nm-find:not\(\.open\)/); assert.match(rd("../ui/chat-head.css"), /\.nm-col\[data-chat-h\] \.ychat > \.overflow-y-auto/);
  assert.match(rd("../ui/yeta-chat.css"), /body:not\(\[data-nm-split\]\) \.ychat \.yb\[data-ink\]/);
  assert.match(rd("../ui/runner-gauges.css"), /:root\[data-nm-see\]\[data-nm-see\] \.nm-rgx/);   // 앞 :has(.nm-modal.see) = 클래스 둘 무게 → 속성 둘
  assert.match(rd("../ui/pins.css"), /\.nm-col\[data-pinsheet\] > \.nm-room-back/); assert.match(rd("../ui/pins.css"), /body\[data-nm-pinsheet\] :is\(\.nm-find, \.nm-story-btn\)/);
  assert.match(rd("../ui/shell.css"), /\.nm-col\[data-room-mark\] \.nm-pin-slot/);
});
