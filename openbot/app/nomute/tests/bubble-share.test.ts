// 말풍선 공유 = 오른쪽 밀기 → 보낼 방 바로 · 보낼 방 75% 2열 직무 묶음 · 단톡 맨 아래 · 작업 알림 복사 0(형 11-21 08:21 · 08:22 · 08:24 · 08:26~27 · 08:44 · 08:45)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { GROUP_HEAD, MOVE_HEADS, moveGroups } from "../ui/msg-menu-logic";
import { swipeSide } from "../ui/swipe-reply";
import { jobOf } from "../ui/job-label";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("보낼 방 묶음 = 머리 없음 → PM·CR·SC → DevOps·R&D → UXD → Fixer·Sec → Teller → 단톡(맨 아래 따로 · 형 08:44)", () => {
  assert.deepEqual([...MOVE_HEADS], ["PM·CR·SC", "DevOps·R&D", "UXD", "Fixer·Sec", "Teller"]);
  const rooms = [{ id: "all" }, { id: "guide", name: "밥상" }, { id: "tmp-a", name: "봄꽃" }, { id: "dm-sia", with: "시아" }, { id: "dm-gam", with: "감" }, { id: "dm-cheon", with: "천둥" }, { id: "dm-haneul", with: "하늘" }, { id: "dm-on", with: "온" }, { id: "dm-gyeol", with: "결" }, { id: "dm-eyes", with: "뜸" }, { id: "dm-shu", with: "슈왕" }, { id: "dm-x", with: "모름" }];
  const g = moveGroups(rooms, (w) => jobOf({ who: w }));
  assert.deepEqual(g.map((x) => [x.head, x.items.map((r) => r.with || r.id)]), [["", ["모름"]], ["PM·CR·SC", ["시아", "뜸", "슈왕"]], ["DevOps·R&D", ["감", "천둥"]], ["UXD", ["하늘"]], ["Fixer·Sec", ["온"]], ["Teller", ["결"]], ["단톡", ["all", "guide", "tmp-a"]]]);
  assert.equal(GROUP_HEAD, "단톡");
  assert.deepEqual(moveGroups([{ id: "dm-g", with: "손님", guest: true }, { id: "all" }], () => undefined).map((x) => x.head), ["", "단톡"]);   // 예비(손님) = 1:1 이라 단톡 아님
});

test("공유 = 줄 오른쪽으로 밀기(왼쪽 답장의 거울 · 형 08:45) → 글 메뉴 보낼 방부터 · 말풍선 옆 공유 그림 0 · 작업 알림 복사 0", () => {
  const oc = rd("../ui/office-chat.tsx"), mm = rd("../ui/msg-menu.tsx"), css = rd("../ui/msg-menu.css"), qc = rd("../ui/quick-react.css");
  assert.match(oc, /onShare: \(m\) => \{ setSel\(""\); setMenuMove\(true\); setMenuOf\(m\); \}/);
  assert.match(oc, /startMove=\{menuMove\}/);
  assert.doesNotMatch(oc, /QuickShare/);
  assert.doesNotMatch(qc, /\.nm-qs/);
  assert.match(oc, /useSwipeReply\(boxRef, [^\n]*, \(id\) => \{ const m = all\.find\(\(x\) => x\.id === id\); if \(m && !goneOf\(m\)\) c\.onShare\(m\); \}\);/);
  assert.match(oc, /\{jobOf\(m\) \? null : <QuickCopy /);
  assert.match(mm, /\[moving, setMoving\] = useState\(startMove\)/);
  assert.match(mm, /<MicOrb size=\{21\}/);
  assert.match(css, /\.nm-mm-l\.move \{ display:grid; grid-template-columns:repeat\(2, minmax\(0, auto\)\);/);
  assert.match(css, /\.nm-mm-l\.move > \.nm-mm-i\.face \{ min-height:33px; gap:8px; font-size:12px; border-bottom:1px solid rgba\(255,255,255,\.07\); flex-direction:row-reverse; justify-content:flex-end; \}/);
});

test("보낼 방 펼침 = 줄 .208s · 줄 사이 20.8ms(형 11-21 08:44 「20%만」) · 글 메뉴 줄은 .26s · 26ms 그대로", () => {
  const css = rd("../ui/msg-menu.css");
  assert.match(css, /\.nm-mm-l\.move > \.nm-mm-i, \.nm-mm-l\.move > \.nm-mm-g \{ animation-duration:\.208s; animation-delay:calc\(var\(--i, 0\) \* 20\.8ms\); \}/);
  assert.match(css, /\.nm-mm-i \{[^}]*animation:nmMmRow \.26s cubic-bezier\(\.2,\.7,\.3,1\) both; animation-delay:calc\(var\(--i, 0\) \* 26ms\);/);
});

test("밀기 쪽 = 왼쪽 답장 · 오른쪽 공유 · 세로 먼저면 스크롤 · 공유 손 없으면 오른쪽 0", () => {
  assert.equal(swipeSide(-20, 5, true), -1);
  assert.equal(swipeSide(20, 5, true), 1);
  assert.equal(swipeSide(20, 5, false), 0);
  assert.equal(swipeSide(-20, 5, false), -1);
  assert.equal(swipeSide(10, 10, true), 0);
  assert.equal(swipeSide(-14, 10, true), 0);   // 1.4배 딱 = 세로(옛 판 「-mx > |my|×1.4」 그대로)
  assert.equal(swipeSide(-15, 10, true), -1);
});
