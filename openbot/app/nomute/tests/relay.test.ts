// 러너가 그록 친구 대신 쓴 글 = 그 친구 말풍선(형 11-13 08:05 「글구 이 맨 아래 이렇게 오는 건 머야? 헷갈리네」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { relayAs, relayWho } from "../ui/pick-msg.ts";

test("「**[촉] …」 러너 글 = 촉 · 그 밖 러너 글 · 모르는 이름 = 그대로", () => {
  const m = { kind: "system", who: "러너", text: "**[촉] 속보 · 엔비디아 젠슨 황 해임 준비 보도**\n\n• **링크** : https://x" };
  assert.equal(relayWho(m), "촉");
  assert.deepEqual(relayAs(m), { ...m, who: "촉", kind: "bot", relay: true });
  assert.equal(relayWho({ kind: "system", who: "러너", text: "**[촉보] 엔비디아 칩 밀반입**\n\n• **링크** : https://x" }), "촉", "촉보 머리말 = 촉(형 11-13 09:32)");
  assert.equal(relayWho({ kind: "system", who: "러너", text: "[틈] 픽" }), "틈");
  assert.equal(relayWho({ kind: "system", who: "러너", text: "깸: 시아" }), "");
  assert.equal(relayWho({ kind: "system", who: "러너", text: "[묶음 261113-x]" }), "", "묶음 글은 카드 그대로");
  assert.equal(relayWho({ kind: "bot", who: "촉", text: "[촉] 나" }), "");
});
test("대화창 = 목록을 relayAs 로 바꿔 그림", () => {
  const oc = readFileSync(new URL("../ui/office-chat.tsx", import.meta.url), "utf8");
  assert.match(oc, /const shownAll = useMemo\(\(\) => all\.filter\([^\n]*\)\.map\(relayAs\), \[all, bundled, hide\]\);/);   // 「[자료]」 이어 글 거른 뒤 relayAs(깃 11-13 12:49) · hide = 화상회의 목적 말풍선(뜸 11-13 15:15)
});
