// #-060 설정 「그록봇 지침」 메모(형 11-15 11:25 「그거는 반영하는게 아니라, 메모용이야」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const g = readFileSync(new URL("../ui/grok-note.tsx", import.meta.url), "utf8"), s = readFileSync(new URL("../ui/yeta-settings.tsx", import.meta.url), "utf8");
test("설정 봄의 정원 묶음에 한 줄 · 메모용 글 · 쓰기 = can_edit(형)", () => {
  assert.doesNotMatch(s, /<GrokNote \/>/);   // 설정에서 뺌 → 애들 화면 그록 쪽 애 펼침으로(형 11-16 19:36 「그록봇도 … 한쪽에 몰아버리고」)
  assert.match(readFileSync(new URL("../ui/bot-manage.tsx", import.meta.url), "utf8"), /<Row label="그록봇 지침">[\s\S]*<GrokNote \/>/);
  assert.match(g, /메모용 · 그록봇에 반영 안 됨/);
  assert.match(g, /n\.can_edit \?/);
  assert.match(g, /office<Note>\("grok-note", \{ method: "POST"/);
});
test("쓰던 중 취소 = 되묻는 창 하네스(아니오 라임) · 그록으로 보내는 길 0", () => {
  assert.match(g, /<AskYN q="작성 중인 내용이 사라집니다\. 창을 닫으시겠습니까\?"/);
  assert.doesNotMatch(g, /grok\.com|x\.ai|"send"/);
});
