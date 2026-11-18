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
