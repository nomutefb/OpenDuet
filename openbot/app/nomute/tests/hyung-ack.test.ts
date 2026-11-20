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

test("PC 도 폰처럼 = 확인 전 형광 · 확인(.rd) · 바깥 글(.app)만 차콜(형 11-20 11:04 「그리고 pc에서도 그 모바일처럼, 읽으면 읽은 창 말풍선 불 off되는거 유지」)", () => {
  const sh = readFileSync(new URL("../ui/shell.css", import.meta.url), "utf8");
  assert.match(sh, /\.nm-split-root \.ychat \.yb\.me:is\(\.rd, \.app\):not\(\.ph\) \{ background:#1e2023 !important;/);
  assert.ok(!/\.nm-split-root \.ychat \.yb\.me:not\(\.ph\) \{ background:#1e2023/.test(sh));   // 앞 판(PC 형 글 늘 차콜) 0
  assert.ok(!/\.nm-split-root \.nac-text \{|, \.nm-split-root \.nac-text/.test(sh));   // 보내는 중 글도 폰처럼 형광
  const up = readFileSync(new URL("../ui/attachment-up.css", import.meta.url), "utf8");
  assert.match(up, /\.ychat \.yb\.me\.ph:is\(\.rd, \.app\) \.ycap \{ background:#1e2023;/);
});

test("PC 우클릭 = 말풍선 밖 그 글 칸(이름표 · 시각 · 확인 표 · 줄 빈 곳)도 같은 글 메뉴(형 11-20 14:01 「pc에서는 우클릭이 안먹히는데 먹히게해주라」)", () => {
  const oc = readFileSync(new URL("../ui/office-chat.tsx", import.meta.url), "utf8");
  assert.match(oc, /const rowMenu = \(e: ReactMouseEvent\) => \{ if \(!e\.defaultPrevented\) press\.bind\.onContextMenu\(e\); \};/);   // 말풍선이 이미 받았으면 두 번 안 엶
  assert.equal(oc.match(/data-id=\{m\.id\} onContextMenu=\{rowMenu\}/g)?.length, 2);   // 형 글 줄 · 애들 글 줄
});
