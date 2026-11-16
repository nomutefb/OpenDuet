// 몸 화면 탭(형 11-16 16:2x 구름 맥 창 「ㅇㅇ 해줘」 ← 「애들 vm키면, pc에서는 새 탭으로 열리게 가능해?」 · 「가능함녀 구글 데스크톱도 링크화 하던지 해서 동일하게」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isCrd, screenTabAdd, screenTabWay } from "../ui/screen-tab-logic.ts";
import { tabsLoad, tabsSave } from "../ui/tab-list.ts";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const U = "https://sia.tail46034f.ts.net/vnc.html?autoconnect=1&resize=scale&reconnect=1";

test("어디로 = 맥 독 앱 → 앱 제 탭 · PC 웹 탭 줄 보임 → 위 탭 줄 · 폰 · 탭 줄 없음 → 앞 꼴", () => {
  assert.equal(screenTabWay({ pc: true, macApp: true, webTabs: false }), "app");
  assert.equal(screenTabWay({ pc: true, macApp: false, webTabs: true }), "web");
  assert.equal(screenTabWay({ pc: false, macApp: false, webTabs: false }), "");
  assert.equal(screenTabWay({ pc: false, macApp: true, webTabs: false }), "");   // 맥 앱이라도 좁은 창(폰 꼴) = 앞 꼴
  assert.equal(screenTabWay({ pc: true, macApp: false, webTabs: false }), "");
});

test("탭 붙이기 = 한 아이 탭 하나 · 고름 · 주소가 바뀌면 새것으로 · 다시 읽어도 남음(표는 주소에 안 들어감)", () => {
  let s = tabsLoad(null);
  s = screenTabAdd(s, "시아", U);
  assert.deepEqual(s.tabs.map((t) => t.k), ["dash", "screen"]);
  assert.equal(s.active, "s:시아");
  s = screenTabAdd({ ...s, active: "dash" }, "시아", U);
  assert.equal(s.tabs.length, 2); assert.equal(s.active, "s:시아");   // 다시 누름 = 그 탭 고르기만
  s = screenTabAdd(s, "시아", U + "&x=1");
  assert.equal(s.tabs.length, 2); assert.equal((s.tabs[1] as { url: string }).url, U + "&x=1");
  const back = tabsLoad(tabsSave(s));
  assert.equal(back.active, "s:시아"); assert.equal((back.tabs[1] as { url: string }).url, U + "&x=1");
  assert.equal(screenTabAdd(s, "", U), s); assert.equal(screenTabAdd(s, "뎅", "javascript:alert(1)"), s);   // 빈 이름 · 이상한 주소 = 안 붙임
});

test("구글 원격 데스크톱 주소만 「링크 탭」 · 나머지는 틀에 끼움", () => {
  assert.equal(isCrd("https://remotedesktop.google.com/access/session/0a1b2c3d-0000-4000-8000-0123456789ab"), true);
  assert.equal(isCrd("https://remotedesktop.google.com/access"), false);
  assert.equal(isCrd("https://evil.example.com/access/session/0a1b2c3d-0000-4000-8000-0123456789ab"), false);
  assert.equal(isCrd(U), false);
});

test("배선 = 프로필 카드가 탭 길을 먼저 묻고(못 열면 앞 꼴) · 탭 줄이 듣고 · 화면 탭은 표를 새로 받는 판으로 그림", () => {
  const card = rd("../ui/profile-card.tsx"), bar = rd("../ui/tab-bar.tsx"), pane = rd("../ui/screen-tab.tsx");
  assert.match(card, /if \(openScreenTab\(\{ who, url: screen \}\)\) \{ onClose\(\); return; \}/);
  assert.match(card, /if \(openScreenTab\(\{ who, url: crd \}\)\) \{ onClose\(\); return; \}/);
  assert.match(bar, /addEventListener\(SCREEN_TAB_EVENT, on\)/);
  assert.match(bar, /<ScreenTabPane key=\{`\$\{tabKey\(t\)\}\|\$\{t\.url\}`\} url=\{t\.url\} name=\{nameOf\(t\)\} on=\{s\.active === tabKey\(t\)\} \/>/);
  assert.doesNotMatch(bar, /<iframe key=\{tabKey\(t\)\}/);   // 저장된 주소를 그대로 틀에 넣던 앞 줄 = 없음
  assert.match(pane, /office<\{ url\?: string \}>\("screen\/ticket"/);   // 켤 때 표를 새로
  assert.match(pane, /if \(crd \|\| !on \|\| asked\.current\) return undefined;\n    const t = window\.setTimeout\(\(\) => \{ asked\.current = true; ask\(\); \}, 80\);\n    return \(\) => window\.clearTimeout\(t\);/);   // 안 본 탭은 표를 안 씀 · 한 번만 · 바로 다시 그려지면 앞 것은 거둠
});
