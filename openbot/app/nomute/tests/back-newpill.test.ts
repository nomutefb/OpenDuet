import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// 형 11-14 19:41(깃 옮김) ① 「대화에서 항상 뒤로가기하면 대화목록이 나오게」 ② 「대화에 지금 온 내용있으면 그 수 만큼 풍선 … 누르면 사라지고」
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const shell = rd("../ui/shell.tsx"), chat = rd("../ui/office-chat.tsx"), css = rd("../ui/yeta-chat.css");

test("① 방에 들어올 때 앞 칸이 목록이 아니면 목록을 깔고 방을 얹음", () => {
  assert.match(shell, /prev === "\/rooms"/);
  assert.match(shell, /nav\(\{ to: "\/rooms", replace: true \}\)\.then\(\(\) => nav\(to as never\)\)/);
});
test("② 새 글 풍선 = newBelow 셈 · 누르면 첫 새 글로 · 사라짐", () => {
  assert.match(chat, /className="ynewpill"/);
  assert.match(chat, /seenEnd\.current = all\.length; bump/);
  assert.match(css, /\.ychat \.ynewpill \{/);
});
