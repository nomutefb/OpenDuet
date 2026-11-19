// 서버 안내 글 한 꼴(형 11-18 22:0x 「대화를 받지 못했습니다. 가운데 정렬로」 · 「이것도 요약 목록을 받지 못했습니다. 가운데 정렬로」 · 「서버와 연결이 끊겻어요, 이것도 서버 특유색으로」 · 「이런것들 다 말투 통일하고 점검해줘」)
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import test from "node:test";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
// srv-note.tsx 는 화면 부품(JSX)이라 글 만드는 두 함수만 떼어 같은 식으로 견줌(파일의 식 그대로인지도 아래에서 봄)
const eulReul = (word: string) => { const ch = word.trim().slice(-1), code = ch.charCodeAt(0); if (!ch || code < 0xac00 || code > 0xd7a3) return "을(를)"; return (code - 0xac00) % 28 ? "을" : "를"; };
const notGot = (what: string) => `${what}${eulReul(what)} 받지 못했습니다.`;

test("말투 = 「○○을(를) 받지 못했습니다.」 · 받침에 맞는 을 · 를", () => {
  assert.equal(notGot("대화"), "대화를 받지 못했습니다.");   // 형 글자 그대로
  assert.equal(notGot("요약 목록"), "요약 목록을 받지 못했습니다.");   // 형 글자 그대로
  assert.equal(notGot("방 목록"), "방 목록을 받지 못했습니다.");
  assert.equal(notGot("기사 순위"), "기사 순위를 받지 못했습니다.");
  assert.equal(notGot("러너 소식"), "러너 소식을 받지 못했습니다.");
  assert.equal(notGot("RSS"), "RSS을(를) 받지 못했습니다.");
  const src = rd("../ui/srv-note.tsx");
  assert.match(src, /return \(code - 0xac00\) % 28 \? "을" : "를";/);
  assert.match(src, /export const notGot = \(what: string\): string => `\$\{what\}\$\{eulReul\(what\)\} 받지 못했습니다\.`;/);
  assert.match(src, /<p className=\{`nm-srvnote\$\{className \? ` \$\{className\}` : ""\}`\} role="alert" title=\{detail \|\| undefined\}>\{notGot\(what\)\}<\/p>/);   // 서버 까닭 글은 title 에만
});

test("꼴 = 가운데 · 안내 라임(새 색 아님) · 끊김 알약도 라임", () => {
  const css = rd("../ui/err-catch.css");
  assert.match(css, /\.nm-srvnote \{[^}]*text-align:center;[^}]*color:var\(--accent, #CFFF40\); \}/);
  assert.match(css, /\.nm-netbar \{[^}]*color:var\(--accent, var\(--accent, #CFFF40\)\); \}/);
  assert.doesNotMatch(css, /\.nm-netbar \{[^}]*#ffe08a/);   // 앞 = 은은한 노랑
  assert.match(css, /\.nm-netbar, \.nm-srvnote, \.nm-emptybox\.srv, \.nm-kwb-none\.srv \{ --accent:#CFFF40; --accent-rgb:207,255,64; \}/);   // 대화창 밖에선 --accent 가 원본 앱 회색 = 직접 박음(형 「이거 안보임」)
});

test("점검 = 화면 글에 옛 말투 「못 받았어」가 안 남음(옛 에디터에서 옮겨 온 판 · 받기 도구 글은 그 판 말투 그대로)", () => {
  const root = new URL("../", import.meta.url), keep = ["ui/msgs-draw.ts", "ui/dl-logic.ts", "ui/old-tabs/"], hit: string[] = [];
  const walk = (dir: URL, rel: string) => { for (const n of readdirSync(dir)) { if (n === "node_modules" || n === "dist" || n === "tests" || n === "tools" || n === "vendor") continue; const u = new URL(n + (statSync(new URL(n, dir)).isDirectory() ? "/" : ""), dir), r = rel + n; if (u.pathname.endsWith("/")) walk(u, r + "/"); else if (/\.(ts|tsx)$/.test(n) && !keep.some((k) => r.startsWith(k))) { readFileSync(u, "utf8").split("\n").forEach((l, i) => { const code = l.replace(/\/\/.*$/, "").replace(/\{\/\*.*?\*\/\}/g, ""); if (/못 받았어/.test(code)) hit.push(`${r}:${i + 1}`); }); } } };
  walk(root, "");
  assert.deepEqual(hit, []);
  for (const [f, re] of [["../ui/office-chat.tsx", /<SrvNote what="대화" detail=\{msgs\.error\.message\} className="mid" \/>/], ["../home/news-summary.tsx", /<b>\{notGot\("요약 목록"\)\}<\/b>/], ["../ui/room-list.tsx", /<SrvNote what="방 목록" className="tight" \/>/], ["../ui/summary-desk.tsx", /<SrvNote what="요약"/], ["../ui/teams.tsx", /<SrvNote what="글"/]] as const) assert.match(rd(f), re);
});

test("웹 칸 = 주소창은 커서만 라임(테 그대로) · 검색 = 구글 어두운 판 · 창 전체 판 옆 얼굴 줄 = 같은 어두운 색 · 위 신호등에 「서버」 글", () => {
  // 형 11-18 22:0x: 「이거 커서만 라임색 들어오게하고, 테두리가 들어오게는 하지말아줘」 · 「기본적으로 다크모드로 하게 해주고」 · 「옆에랑 딱 맞게 어울리게 다크로」 · 「구글 검색을 기본으로」 · 「서버 들어가게 해줘, 그리고 수평맞춰주셈」
  const wcss = rd("../ui/web-pane.css"), web = rd("../ui/web-pane.tsx"), tcss = rd("../ui/tab-bar.css"), tab = rd("../ui/tab-bar.tsx"), sl = rd("../ui/status-line.tsx"), slcss = rd("../ui/status-line.css");
  assert.match(wcss, /\.nm-web-addr \{[^}]*caret-color: rgb\(var\(--accent-rgb, 207,255,64\)\); \}/);
  assert.doesNotMatch(wcss, /\.nm-web-addr:focus/);   // 들어가도 테 · 번짐 안 바뀜
  assert.match(wcss, /\.nm-web-frame \{[^}]*color-scheme: dark; \}/);
  assert.match(web, /https:\/\/www\.google\.com\/search\?igu=1&cs=1&q=\$\{encodeURIComponent\(s\)\}/);
  assert.match(tcss, /html\[data-nm-fullpane\] \.nm-strip \{ background:var\(--nm-tab-on, #121314\);[^}]*backdrop-filter:none;/);
  assert.match(tab, /if \(full\) r\.dataset\.nmFullpane = "1"; else delete r\.dataset\.nmFullpane;/);
  assert.match(sl, /<span className="nm-sl-srv" title="서버 연결 칸의 가장 나쁜 불"><Dot t=\{toneOf\(l\.server\)\} \/><b>서버<\/b><\/span>/);   // 점 → 흰 「서버」(형 11-19 16:18 「서버가 우측으로 글자를 가자. 글구 서버는 흰색글자」)
  assert.match(slcss, /\.nm-sl-srv b \{ color: #FFFFFF; font-weight: inherit; \}/);
  assert.match(slcss, /\.nm-sl-srv \{ display: inline-flex; align-items: center; gap: 5px; \}/);
});

test("막는 사이트 = 형이 주소창으로 간 주소만 바로 맥 72 판으로 · 되살아난 주소는 단추 그대로(형 11-18 「응 만약에 막히면 그렇게 하고」)", () => {
  const web = rd("../ui/web-pane.tsx");
  assert.match(web, /if \(check\.state !== "blocked" \|\| !onBridge \|\| !cur \|\| wantBridge\.current !== cur\) return;\s*wantBridge\.current = "";\s*onBridge\(cur\);/);
  assert.match(web, /const a = toAddress\(raw\);\s*if \(!a\) return;\s*wantBridge\.current = a;/);   // 주소창 이동 때만 표시
  assert.match(web, /\{onBridge \? <button type="button" className="nm-web-out" onClick=\{\(\) => onBridge\(cur\)\}>맥 72로 열기<\/button> : null\}/);   // 단추는 남음(다리에서 돌아온 자리)
});
