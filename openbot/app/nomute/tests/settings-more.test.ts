// 설정 더 채움(봄 11-18 · 형 「좋아, 다 반영해주라」) — 고르기 레일 · 잠금 PIN · 캐시 비우기 · 움직임 줄이기 · 아이콘 누름 재생 · 효과음/진동
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { wipeCache } from "../ui/cache-wipe.ts";
import { stillOf } from "../ui/less-move.ts";
import { LK_LEN, LK_MAX, LK_OUT_MS, lkCheck, lkFail, lkHash, lkOutLeft, pinClean } from "../ui/lock-pin.ts";
import { railStep } from "../ui/snap-rail-core.ts";
import { UA_MAP, uaGuardMs } from "../ui/ua-map.ts";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const mem = () => { const m = new Map<string, string>(); return { m, getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), get length() { return m.size; }, key: (i: number) => [...m.keys()][i] ?? null }; };

test("레일 방향키 = 다음 칸 · 끝에서 돌아감 · 못 고르는 칸은 건너뜀 · 갈 데 없으면 -1", () => {
  assert.equal(railStep(0, 1, [false, false, false]), 1);
  assert.equal(railStep(2, 1, [false, false, false]), 0);
  assert.equal(railStep(0, -1, [false, false, false]), 2);
  assert.equal(railStep(0, 1, [false, true, false]), 2);
  assert.equal(railStep(0, 1, [false, true, true]), -1);
});
test("설정의 「누를 때마다 다음 값」 줄 = 레일 · 켜고 끄기 = 스위치", () => {
  const set = rd("../ui/yeta-settings.tsx");
  assert.match(set, /<PickRow id="theme" ic="contrast" t="테마"/); assert.match(set, /<PickRow id="skin" ic="screen" t="꾸밈"/);
  assert.doesNotMatch(set, /THEME\[\(THEME\.indexOf\(theme\) \+ 1\) % THEME\.length\]/, "돌려 넘기기 0");
  for (const f of ["enter-key.tsx", "live-shine.tsx", "chat-font.tsx"]) assert.match(rd(`../ui/${f}`), /<PickRow /, f);
  assert.match(rd("../ui/idle-blind.tsx"), /<SwRow ic="screen" t="쉴 때 화면 가림"/);
  const css = rd("../ui/snap-rail.css");
  assert.match(css, /transform:translateX\(calc\(var\(--i, 0\) \* \(100% \+ 10px\)\)\); transition:transform \.45s cubic-bezier\(\.34,1\.56,\.64,1\)/, "원본 .nm-snap 수치 그대로");
});
test("PIN 해시 = 에디터 lkHash 와 같은 값(SHA-256 · 꼬리 :nmlock) · 4자리", async () => {
  assert.equal(LK_LEN, 4);
  const h = await lkHash("0000");
  assert.match(h, /^[a-f0-9]{64}$/);
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("0000:nmlock"));
  assert.equal(h, [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join(""));
  assert.equal(pinClean("12 3a4567", 4), "1234");
});
test("기존 PIN 확인: 맞으면 틀린 횟수 지움 · 틀리면 (n/5) · 다섯 번째 = 10분 잠김 · 잠긴 동안엔 맞아도 안 됨", async () => {
  const s = mem(), now = 1_800_000_000_000, hash = await lkHash("1234");
  assert.equal(await lkCheck(s, "9999", hash, now), "PIN 번호가 틀립니다 (1/5)");
  assert.equal(await lkCheck(s, "1234", hash, now), true);
  assert.equal(s.m.size, 0, "맞으면 횟수 지움");
  for (let i = 1; i <= LK_MAX; i++) assert.equal(lkFail(s, now), `PIN 번호가 틀립니다 (${i}/5)`);
  assert.equal(lkOutLeft(s, now), LK_OUT_MS);
  assert.equal(await lkCheck(s, "1234", hash, now + 60_000), "5회 초과 — 9분 후 다시");
  assert.equal(await lkCheck(s, "1234", hash, now + LK_OUT_MS + 1), true, "10분 뒤엔 다시 됨");
});
test("잠금 칸 = 막다른 안내 0 · 스위치 + PIN 단추 · 다시 친 PIN 이 다르면 글 없이 흔들림(false)", () => {
  const t = rd("../ui/lock.tsx");
  assert.doesNotMatch(t, /\? "PIN 을 먼저 정해야/, "화면에 띄우는 막다른 안내 0");
  assert.match(t, /role="switch" aria-checked=\{active\}/); assert.match(t, /\{pin \? "PIN 바꾸기" : "PIN 정하기"\}/);
  assert.match(t, /if \(p !== step\.p1\) return false;/);
  assert.match(t, /\{ lockPinHash: h, lockLen: LK_LEN, lockOn: true \}/);
});
test("캐시 비우기 = nm-cache:* 와 받아 둔 조각만 · 설정 · 쓰던 글은 그대로", async () => {
  const s = mem(); s.setItem("nm-cache:last:rooms", "x"); s.setItem("nm-cache:people", "y"); s.setItem("nm_font_all", "pretendard"); s.setItem("nm-draft:1", "쓰던 글");
  const gone: string[] = [];
  const n = await wipeCache(s, async () => ["app-v1", "img"], async (k) => { gone.push(k); });
  assert.equal(n, 4); assert.deepEqual(gone, ["app-v1", "img"]);
  assert.deepEqual([...s.m.keys()].sort(), ["nm-draft:1", "nm_font_all"]);
  assert.equal(await wipeCache(mem(), async () => { throw new Error("x"); }, async () => undefined), 0, "캐시 저장소를 못 열어도 안 터짐");
  assert.doesNotMatch(rd("../ui/yeta-settings.tsx"), /\.unregister\(\)/, "서비스 워커 등록은 안 건드림 = 알림 안 끊김");
});
test("움직임 줄이기 = 기기 설정 또는 앱 스위치 · 코드로 도는 움직임은 한 곳(still)만 물음", () => {
  assert.equal(stillOf(false, false), false); assert.equal(stillOf(true, false), true); assert.equal(stillOf(false, true), true);
  assert.match(rd("../ui/less-move.css"), /html\.nm-lessmove \*, html\.nm-lessmove \*::before, html\.nm-lessmove \*::after \{/);
  assert.match(rd("../main.tsx"), /import "\.\/ui\/less-move\.css";\nimport "\.\/ui\/less-move";/);
  for (const f of ["ui/flip.ts", "ui/fold-ink.ts", "ui/bloub.tsx", "ui/pm-orb.tsx", "ui/activity-board.tsx", "home/top-swap.tsx", "home/ddk-band.tsx"]) assert.doesNotMatch(rd(`../${f}`), /matchMedia\("\(prefers-reduced-motion/, f);
});
test("아이콘 누름 재생: 짝 이름이 받아 둔 자료에 다 있음 · 안전판 = 제 길이의 2배 · 엔진은 뒤늦게 받음", () => {
  const icons = rd("../vendor/useanimations/icons.js");
  for (const n of new Set(Object.values(UA_MAP))) assert.ok(icons.includes(`"${n}":{`), String(n));
  assert.equal(uaGuardMs({ ip: 0, op: 30, fr: 30 }), 2000);
  assert.match(rd("../vendor/useanimations/player.js"), /MIT License/);
  assert.match(rd("../ui/ua-play.ts"), /import\("\.\.\/vendor\/useanimations\/player\.js"\)/);
});
test("효과음 = 기본 끔 · 켠 때만 조각을 받음 · 진동 세 자리 = 스위치 하나로", () => {
  const f = rd("../ui/feel.ts");
  assert.match(f, /read\(K_SFX, false\)/); assert.match(f, /read\(K_HAP, true\)/); assert.match(f, /if \(!sfxOn \|\| typeof window === "undefined"\) return;/);
  for (const x of ["ui/office-chat.tsx", "ui/swipe-reply.ts", "ui/room-list.tsx"]) { assert.doesNotMatch(rd(`../${x}`), /navigator\.vibrate/, x); assert.match(rd(`../${x}`), /buzz\(8\)/, x); }
});
