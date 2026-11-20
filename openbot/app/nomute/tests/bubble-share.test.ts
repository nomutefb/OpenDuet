// 말풍선 공유 그림 → 보낼 방 바로 · 보낼 방 75% 2열 직무 묶음 · 작업 알림 복사 0(형 11-21 08:21 · 08:22 · 08:24 · 08:26~27)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { MOVE_HEADS, moveGroups } from "../ui/msg-menu-logic";
import { jobOf } from "../ui/job-label";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("보낼 방 묶음 = 머리 없음 → PM·CR·SC → DevOps·R&D → UXD → Fixer·Sec → Teller", () => {
  assert.deepEqual([...MOVE_HEADS], ["PM·CR·SC", "DevOps·R&D", "UXD", "Fixer·Sec", "Teller"]);
  const rooms = [{ id: "all" }, { id: "dm-sia", with: "시아" }, { id: "dm-gam", with: "감" }, { id: "dm-cheon", with: "천둥" }, { id: "dm-haneul", with: "하늘" }, { id: "dm-on", with: "온" }, { id: "dm-gyeol", with: "결" }, { id: "dm-eyes", with: "뜸" }, { id: "dm-shu", with: "슈왕" }, { id: "dm-x", with: "모름" }];
  const g = moveGroups(rooms, (w) => jobOf({ who: w }));
  assert.deepEqual(g.map((x) => [x.head, x.items.map((r) => r.with || r.id)]), [["", ["all", "모름"]], ["PM·CR·SC", ["시아", "뜸", "슈왕"]], ["DevOps·R&D", ["감", "천둥"]], ["UXD", ["하늘"]], ["Fixer·Sec", ["온"]], ["Teller", ["결"]]]);
});

test("공유 그림 = 말풍선 줄 세로 가운데(남 오른쪽 · 내 왼쪽) → 글 메뉴 보낼 방부터 · 작업 알림 복사 0", () => {
  const oc = rd("../ui/office-chat.tsx"), mm = rd("../ui/msg-menu.tsx"), css = rd("../ui/msg-menu.css"), qc = rd("../ui/quick-react.css");
  assert.match(oc, /onShare: \(m\) => \{ setSel\(""\); setMenuMove\(true\); setMenuOf\(m\); \}/);
  assert.match(oc, /startMove=\{menuMove\}/);
  assert.equal((oc.match(/<QuickShare onShare=\{\(\) => c\.onShare\(m\)\} \/>/g) || []).length, 2);
  assert.match(oc, /\{jobOf\(m\) \? null : <QuickCopy /);
  assert.match(mm, /\[moving, setMoving\] = useState\(startMove\)/);
  assert.match(mm, /<MicOrb size=\{21\}/);
  assert.match(css, /\.nm-mm-l\.move \{ display:grid; grid-template-columns:repeat\(2, minmax\(0, auto\)\);/);
  assert.match(css, /\.nm-mm-l\.move > \.nm-mm-i\.face \{ min-height:33px; gap:8px; font-size:12px; border-bottom:1px solid rgba\(255,255,255,\.07\); flex-direction:row-reverse; justify-content:flex-end; \}/);
  assert.match(qc, /\.nm-qs \{ flex:none; align-self:center;[^}]*opacity:\.5;/);
});
