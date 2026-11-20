// 형 말풍선 불 꺼짐 = 담당 「확인」(서버 reads ack) · 글자 늘 밝게 · 「1」 = 서버 unseen 그대로(형 11-20 08:30~08:36 dm-gik 깃 옮김 · 번개 09:04 칸)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("형광 끔 = ack 하나라도 · 「1」 = 서버 unseen 먼저 · 차콜 바탕 + 밝은 글", () => {
  const s = readFileSync(new URL("../ui/office-chat.tsx", import.meta.url), "utf8"), css = readFileSync(new URL("../ui/yeta-chat.css", import.meta.url), "utf8");
  assert.match(s, /return m\.kind === "human" && !!c\.reads\?\.ack\?\.\[m\.id\]\?\.length;/);
  assert.match(s, /read: \(m\) => ackOf\(m, c\),/);
  assert.doesNotMatch(s, /\["👀"\]/, "앱이 👀 로 세는 곳 0(서버 자동 👀 걷음 · 번개 09:04)");
  assert.match(s, /const srv = c\.reads\?\.unseen\?\.\[m\.id\];\n  if \(typeof srv === "number"\) return srv;/);
  assert.match(s, /className=\{`yb me\$\{app \? " app" : c\.read\(m\) \? " rd" : ""\}/);
  assert.match(css, /\.ychat \.yb\.me\.rd \{ background:#1e2023; color:#e6e9e6;/);   // 글자 밝게(검정 글자 0)
  assert.doesNotMatch(css, /\.ychat \.yb\.me \{ transition/);
});
