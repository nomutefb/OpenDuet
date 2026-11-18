// :has() 무효화가 넓게 번지지 않게(봄 11-18 · 형 「포토 에디터나 비디오 에디터 보고, 렉 유발하거나 … 확인해주고 개선해줘」)
//   실측(맥 헤드리스 · cpu ÷4 · 이미지 에디터 안에서 글자 한 번 바꾸고 배치까지): 12.4ms → 0.8ms · 오버레이 3줄 치기 = 프레임 빠짐 26.7% → 3.3%
//   병 셋 = ① 테일윈드 group-has 꼴(`.u:is(:where(.group\/x):has(A) *)` = 「다시 볼 자손 = 전부」) ② 주인이 :has() 뿐인 줄(온 요소가 :has 닻) ③ 큰 덩어리(앱 무대 · 창 틀 · 판 뿌리 · 판 몸)에 건 :has
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import test from "node:test";
import { leanHas } from "../lean-has.ts";
import { FAST_EVERY_MS, FAST_FROM_S, FAST_TO_S, isBare, pollNow } from "../ui/thumb-maker/lean.ts";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const walk = (dir: URL, out: URL[] = []): URL[] => {
  for (const n of readdirSync(dir)) {
    if (n === "node_modules" || n === "dist" || n === "tests" || n === "vendor") continue;
    const u = new URL(n + (statSync(new URL(n, dir)).isDirectory() ? "/" : ""), dir);
    if (u.pathname.endsWith("/")) walk(u, out); else if (/\.css$/.test(n)) out.push(u);
  }
  return out;
};

test("group-has 꼴 = 같은 뜻 · 같은 무게의 자손 꼴로(빌드 끝 · ../lean-has.ts)", () => {
  const a = String.raw`.group-has-data-\[slot\=item-description\]\/item\:self-start:is(:where(.group\/item):has([data-slot=item-description]) *){align-self:flex-start}`;
  assert.deepEqual(leanHas(a), { css: String.raw`:where(.group\/item):has([data-slot=item-description]) .group-has-data-\[slot\=item-description\]\/item\:self-start{align-self:flex-start}`, n: 1 });
  // 줄 바꿈 · 따옴표 · :has 안 괄호 · 여러 줄 · 뒤 가짜 클래스
  const b = String.raw`a{b:c}
  .group-has-data-horizontal\/field\:text-balance:is(:where(.group\/field):has(:where([data-orientation="horizontal"])) *) {
    text-wrap: balance;
  }
.group-has-\[\>input\]\/input-group\:pt-2:is(:where(.group\/input-group):has(>input) *):hover,.x{d:e}`;
  const r = leanHas(b);
  assert.equal(r.n, 2);
  assert.ok(r.css.includes(String.raw`  :where(.group\/field):has(:where([data-orientation="horizontal"])) .group-has-data-horizontal\/field\:text-balance {`));
  assert.ok(r.css.includes(String.raw`:where(.group\/input-group):has(>input) .group-has-\[\>input\]\/input-group\:pt-2:hover,.x{d:e}`));
  assert.deepEqual(leanHas(r.css), { css: r.css, n: 0 }, "두 번 돌려도 그대로");
});

test("못 알아보는 꼴 = 손 안 댐(앞에 다른 마디 · :has 아님 · 끝이 * 아님)", () => {
  for (const s of [
    String.raw`.a > .u:is(:where(.group\/x):has(.y) *){c:d}`,   // 앞에 이음표 = 주인이 클래스 하나가 아님
    String.raw`.group-hover\/x\:u:is(:where(.group\/x):hover *){c:d}`,   // :has 아님(값 0 인 꼴)
    String.raw`.u:is(:where(.group\/x):has(.y) > *){c:d}`,
    String.raw`.u:is(:where(.group\/x):has(.y) *) .v{c:d}`,   // 뒤에 자손
  ]) assert.deepEqual(leanHas(s), { css: s, n: 0 });
});

test("배선 = 빌드 끝에 한 번 · 원본 UI 꾸러미(openbot/app/src) 손 0", () => {
  const v = rd("../vite.config.ts");
  assert.match(v, /import \{ leanHasPlugin \} from "\.\/lean-has";/);
  assert.match(v, /tailwindcss\(\),\n\s+leanHasPlugin\(\),/);
  assert.match(rd("../lean-has.ts"), /generateBundle: \{\n\s+order: "post" as const,/);
});

/** 괄호 밖(깊이 0)에서만 자름 — sep(글자) 가 참인 자리 */
function cut(s: string, sep: (c: string) => boolean): string[] {
  const out: string[] = []; let d = 0, cur = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "\\") { cur += c + (s[i + 1] ?? ""); i++; continue; }
    if (c === "(") d++; else if (c === ")") d--;
    if (d === 0 && sep(c)) { if (cur.trim()) out.push(cur.trim()); cur = ""; } else cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
/** 괄호 속을 비운 겉 글자(마디에 직접 붙은 클래스 · 가짜 클래스 이름만) */
const skin = (s: string) => { let d = 0, o = ""; for (const c of s) { if (c === "(") { if (d === 0) o += "("; d++; } else if (c === ")") { d--; if (d === 0) o += ")"; } else if (d === 0) o += c; } return o; };

test("우리 CSS: 주인이 :has() 뿐인 줄 0 · 큰 덩어리(앱 무대 · 창 틀 · 판 · 카드 제작 뿌리 · 몸)에 건 :has 0", () => {
  const bad: string[] = [];
  for (const u of walk(new URL("../", import.meta.url))) {
    const css = readFileSync(u, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    for (const m of css.matchAll(/([^{}]*)\{/g)) for (const sel of cut(m[1], (c) => c === ",")) {
      if (!sel.includes(":has(")) continue;
      const where = `${u.pathname.split("/nomute/")[1]} — ${sel.slice(0, 100)}`;
      const parts = cut(sel, (c) => c === " " || c === ">" || c === "+" || c === "~" || c === "\n");   // 마디(이음표로 자름)
      parts.forEach((part, i) => {
        const sk = skin(part);   // 예: `.nm-modal:has()` · `:not()` · `.scard:nth-last-child()`
        if (!/:has\(\)|:not\(\)/.test(sk) || !part.includes(":has(")) return;
        const direct = /:has\(\)/.test(sk) || /:not\(\s*:has\(/.test(part);   // 이 마디에 직접 붙은 :has(= :not(:has()) 포함)
        if (!direct) return;
        const own = sk.replace(/:(has|not)\(\)/g, "").replace(/^\*/, "");
        if (!own) bad.push("주인이 :has 뿐 · " + where);
        if (/\.(duet-face|nm-modal|nm-pane)(?![\w-])/.test(own)) bad.push("앱 무대 · 창 틀 · 판 · " + where);
        if (i === 0 && /^\.nm-tm(?![\w-])/.test(own) && !/^\.nm-tm\.nm-scene-ready$/.test(own)) bad.push("카드 제작 뿌리 · " + where);   // nm-scene-ready = 앱에선 안 붙는 클래스(제 장면 안 돎) → :has 까지 안 감
        if (/^\.panel(?![\w-])/.test(own) && parts[0] === ".nm-tm") bad.push("카드 제작 몸 · " + where);
      });
    }
  }
  assert.deepEqual(bad, [], ":has 를 표시(속성)로 — ui/has-flags.ts · ui/thumb-maker/tools/lean-rules.mjs");
});

test("표시 배선 = 그 상태를 아는 쪽이 닮(무게 같음)", () => {
  const sh = rd("../ui/shell.tsx"), css = rd("../ui/shell.css");
  assert.match(sh, /<div ref=\{stage\} data-pane=\{pane\} className=\{`duet-face /);
  assert.match(sh, /className="nm-modal nm-web" data-webh="" role="dialog" aria-modal="true" aria-label=\{host \|\| "웹"\}>/);
  assert.equal(css.split(".nm-modal[data-mh][data-mh]").length - 1, 4);   // 앞 = :has(> .nm-modal-h[class*="nm-mh-"]) = 클래스 + 속성 무게 → 속성 둘
  assert.match(css, /\.nm-modal\[data-mh="nedit"\] \.nm-ned-host/); assert.match(css, /\.nm-modal\[data-webh\] > \.nm-modal-b/);
  assert.match(css, /\.nm-modal\[data-mh="story"\] \.nm-modal-b\.flush > \.nm-scroll, \.nm-modal\[data-mh="meetlog"\] \.nm-modal-b\.flush > \.nm-scroll/);
  assert.match(rd("../ui/plus-fan.tsx"), /useRootFlag\("fan", open\);/);
  assert.match(rd("../ui/plus-fan.css"), /:root\[data-nm-fan\] \.duet-face > \.tool-restore, :root\[data-nm-fan\] \.duet-face > \.min-pick \{/);
  const dp = rd("../ui/decide-pop.tsx");
  assert.ok(dp.indexOf('useRootFlag("dec", fab && !q.isError && items.length > 0);') > 0 && dp.indexOf('useRootFlag("dec"') < dp.indexOf("if (q.isError || !items.length) return null;"), "훅 = 일찍 돌아가는 줄보다 앞");
  assert.match(sh, /\{teamsOn \|\| meetOn \? null : <><RoomFab \/><DecideFab \/><\/>\}/, "결정 단추 = 대화 목록 판에만(ed-keep.css 가 data-pane=rooms 로 물음)");
  assert.doesNotMatch(rd("../ui/yeta-chat.css").replace(/\/\*[\s\S]*?\*\//g, ""), /:has\(\.bg-popover/, "안 뜨는 옛 호출 목록용 :has 줄 0");
});

test("카드 제작 옷: 표(tools/lean-rules.mjs)가 입혀져 있음 · 다시 뗄 때도 입힘 · 표시 = lean.ts · modern.ts", async () => {
  const { LEAN, applyLean } = await import("../ui/thumb-maker/tools/lean-rules.mjs");
  const css = rd("../ui/thumb-maker/thumb-maker.css");
  for (const [from, to, want] of LEAN) { assert.equal(css.split(from).length - 1, 0, "옛 꼴 남음: " + from.slice(0, 50)); assert.equal(css.split(to).length - 1, want, to); }
  assert.equal(applyLean(css).n, 0);
  assert.throws(() => applyLean(css, true), /원본이 바뀜/, "다시 뗀 원본에 그 줄이 없으면 멈춤");
  assert.match(rd("../ui/thumb-maker/tools/scope-css.mjs"), /all = applyLean\(all, true\)\.css;[^\n]*\nfs\.writeFileSync\(OUT, all\);/);
  assert.match(rd("../ui/thumb-maker/engine/modern.ts"), /dock\.removeAttribute\('data-nm-rail-flow'\); \}\n\s+root\.toggleAttribute\('data-nm-flow', flowing\.size > 0\);/);
  const ix = rd("../ui/thumb-maker/index.tsx");
  assert.match(ix, /const offBare = watchBare\(root\.current\);/); assert.match(ix, /offRail\(\); offBare\(\);/);
});

test("빈 판 셈 = 원본 :has 다섯 조건과 같음", () => {
  const mk = (hit: Record<string, boolean>) => ({ querySelector: (s: string) => (hit[s] ? {} : null) }) as unknown as ParentNode;
  const all = { "#reelsBox.none": true, "#rOptHead.none": true, "#spHead.none": true, "#optCards > .scard:not(.none)": false, "#imgeditBox:not(.none)": false };
  assert.equal(isBare(mk(all)), true);
  for (const k of ["#reelsBox.none", "#rOptHead.none", "#spHead.none"]) assert.equal(isBare(mk({ ...all, [k]: false })), false, k);
  for (const k of ["#optCards > .scard:not(.none)", "#imgeditBox:not(.none)"]) assert.equal(isBare(mk({ ...all, [k]: true })), false, k);
});

test("결과 확인 박자 = 결과가 뜰 즈음(12 ~ 45초)에만 2초마다 · 카드 제작 잡만 · 엔진 손 0", () => {
  const t0 = 1_000_000, tick = () => {};
  const job = (o: object = {}) => ({ status: "run", t0, endpoint: "/api/thumb", outs: [{ path: "https://x/opa60.jpg" }], _tick: tick, ...o });
  assert.equal(pollNow(job(), t0 + (FAST_FROM_S - 1) * 1000), false, "아직 러너가 굽는 중 = 헛물음 안 함");
  assert.equal(pollNow(job(), t0 + FAST_FROM_S * 1000), true);
  assert.equal(pollNow(job({ _nmPolled: t0 + 20_000 }), t0 + 20_000 + FAST_EVERY_MS - 1), false, "2초 안엔 다시 안 두드림");
  assert.equal(pollNow(job({ _nmPolled: t0 + 20_000 }), t0 + 20_000 + FAST_EVERY_MS), true);
  assert.equal(pollNow(job(), t0 + (FAST_TO_S + 1) * 1000), false, "그 뒤 = 엔진 박자(5초 · 12초)");
  assert.equal(pollNow(job({ status: "done" }), t0 + 20_000), false);
  assert.equal(pollNow(job({ outs: [] }), t0 + 20_000), false, "접수 답 전 = 두드릴 주소 없음");
  assert.equal(pollNow(job({ endpoint: "/api/resize" }), t0 + 20_000), false, "서버 문을 묻는 잡은 엔진 박자 그대로");
  assert.equal(pollNow(job({ endpoint: undefined, batch: [{}] }), t0 + 20_000), true, "묶음(헤더 + 자막)도");
  assert.equal(pollNow(job({ _tick: undefined }), t0 + 20_000), false); assert.equal(pollNow(null, t0), false);
  const ix = rd("../ui/thumb-maker/index.tsx");
  assert.match(ix, /const offPoll = fastPoll\(\(\) => S\.JOBS\);/); assert.match(ix, /offBare\(\); offPoll\(\);/);
  assert.match(rd("../ui/thumb-maker/engine/p07-jobs.ts"), /job\._timer = setTimeout\(tick, job\._queued \? 12000 : 5000\);\n  \};\n  job\._tick = tick;/, "엔진 박자 · 손잡이 그대로(바뀌면 이 덧도 다시 봄)");
});
