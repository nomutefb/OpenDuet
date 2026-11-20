// 보안 서랍 맨 위 「봄의 정원 MCP server」 칸(구름 11-19 · 형 08:07~08:16 dm-bom 봄 옮김 · 빠르 넘김 · 서버 editor _seatvault.js top 칸)
import { test } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ui = readFileSync(new URL("../ui/settings-extra.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../ui/yeta-settings.css", import.meta.url), "utf8");

test("맨 위 칸 = 그록 꼴(Connection · Name · Transport · URL · Authentication · HTTP headers) · 설명글 · Add header · OAuth 0 → 구분선 → 아래 지금 내용", () => {
  for (const w of [">Connection<", "field(\"Name\"", "field(\"Transport\"", "field(\"URL\"", ">Authentication<", ">HTTP headers<"]) assert.ok(ui.includes(w), w);
  for (const w of [">Add header<", "OAuth client", "mcp.json", "Sent with every request"]) assert.ok(!ui.includes(w), w);
  assert.match(ui, /\(q\.data \|\| \[\]\)\.find\(\(s\) => s\.top\)/);
  assert.match(ui, /<div className="nm-mcp-cut" aria-hidden \/>\s*<\/>\s*\);\s*\}\)\(\)\}[\s\S]{0,400}\? <Card>/);   // 칸 → 구분선 → 아래 줄들(손이 필요한 칸이 있을 때만)
  // 11-20 형 02:55 「겹치는 보안 서랍 내용은 지워줘」 · 「spare02 넣음 이런말은 필요앖음」 · 03:04 「재발행 … 기존 건 파기 복사 시 자동으로 커서 아동 후 메모 한 줄」 = 아래 = 빈 칸 · 안 맞는 칸만 · id · 「넣음 · 시각」 0 · 위 예비 줄에 재발행 · 복사 → 사용처 칸 커서
  assert.match(ui, /\.filter\(\(s\) => s\.top && \(!s\.set \|\| s\.match === false\)\)\.map\(\(s\) => \(/);   // 11-20 07:18 「이거 따로 노니까」 = 예비는 위 줄 한 곳 · 아래 = 봄의 정원 칸만
  assert.ok(ui.includes('yesText="발행" busy="발행 중" label={`${nameOf(s.seat)} 발행`} yesGo={() => remint(s.seat)}>'));   // 11-20 11:02 「새열쇠가 그냥 발행 으로」 · 11:22 게이지 → ✓
  assert.ok(!ui.includes("aria-label=\"지금 쓰는 이름 · 자리 id\""), "자리 id 글자 0");
  assert.ok(!/`넣음\$\{s\.at/.test(ui), "넣음 · 시각 0");
  assert.ok(ui.includes('yesText="재발행" busy="재발행 중" label={`${nameOf(s.seat)} 재발행`} yesGo={() => remint(s.seat)}>'));
  assert.ok(ui.includes("remint={(seat) => mint.mutateAsync(seat)}"));   // 서버 답 ok 에 ✓(형 11:22 「사용이 가능할때까지 … 발행 과정이 보여야해」)
  assert.ok(!/<MorphAsk[^>]*note="/.test(ui), "토글 밑 작은 글 0(형 11-20 11:21 「이거 설명글 필요없음」)");
  assert.match(ui, /id=\{`mcp-use-\$\{s\.seat\}`\}/);
  assert.match(ui, /setFocusUse\(\(f\) => \(\{ seat, n: \(f\?\.n \|\| 0\) \+ 1 \}\)\)/);
});

test("칸은 다 고칠 수 없음 · 열쇠는 가린 점 + 복사만(서버 seatvault/copy) · 이름 · 주소 복사는 화면 글 그대로", () => {
  assert.ok(!/<input[^>]*nm-mcp-f/.test(ui));   // 글칸 0(읽기 칸 = div)
  assert.match(ui, /const DOTS = "••••••••";/);
  assert.match(ui, /\{top\.set \? DOTS : "비어 있음"\}/);
  assert.match(ui, /go=\{\(\) => copySeat\(top\.seat\)\}/);
  assert.match(ui, /go=\{\(\) => copyText\(key, text\)\}/);
});

test("펼치면 Authentication 안에 예비 줄 · 메모 칸 = 복사 왼쪽 늘 보임(50자) → 치기 멈춘 뒤 0.7초 · 칸 떠나면 바로 저장(같은 seatvault/memo) · 저장 단추 0", () => {
  assert.match(ui, /aria-expanded=\{open\}/);
  assert.match(ui, /inert=\{open \? undefined : true\}/);
  // 11-20 11:02 「이 펼침이 예비 3 이 아니라 예비 코드 라고」 · 「누르면 라임색으로」 · 「복사 좌측에 간단한 메모 … 최대 50자」 · 「그냥 글자 버튼으로 해줘 복사도 마찬가지」 · 줄마다 칸 세로 맞춤
  assert.match(ui, /onClick=\{\(\) => setOpen\(\(o\) => !o\)\}>예비 코드<Chev/);
  assert.match(css, /\.nm-mcp-more\[aria-expanded="true"\] \{ color:var\(--accent\);/);
  assert.match(ui, /maxLength=\{50\} placeholder="메모"/);
  assert.match(ui, /<div className="nm-mcp-use">[\s\S]{0,900}<CopyBtn text ok=\{done === s\.seat\}/);   // 메모 → 복사 차례
  assert.match(css, /\.nm-mcp-sp \{ display:grid; grid-template-columns:max-content 7\.5rem minmax\(0,1fr\) max-content max-content;/);
  assert.match(css, /\.nm-mcp-sr \{ display:contents; \}/);
  assert.match(css, /\.nm-mcp-tb \{ border-color:transparent;/);
  assert.match(ui, /onBlur=\{\(\) => flush\(s\.seat\)\}/);
  assert.match(ui, /saveUse\(seat, v\); \}, 700\)/);
  assert.match(css, /\.nm-mcp-fold \{ display:grid; grid-template-rows:0fr;/);
  assert.match(css, /\.nm-mcp-fold\[data-open\] \{ grid-template-rows:1fr;/);
});

test("링크 그림 = 서버 link(그록 플러그인) 새 탭", () => {
  assert.match(ui, /href=\{top\.link\} target="_blank" rel="noopener noreferrer"/);
  assert.match(ui, /dangerouslySetInnerHTML=\{\{ __html: YICO\.link \}\}/);
});

test("열쇠 연결 줄 = 봄의 정원 칸 바로 아래 · 같은 한 번 받기 · X = 그 자리 토글 → 게이지(seatvault/conn) · 끊긴 줄 = 다시 잇기(형 11-20 11:30~11:32)", () => {
  assert.ok(ui.includes("<GardenConns conns={conns.data || []} onBlock={block} />"));
  assert.ok(ui.includes('select: (j: VaultRaw) => j.conns || []'));
  assert.ok(ui.includes('office<{ ok?: boolean; blocked?: boolean }>("seatvault/conn", { method: "POST", body: JSON.stringify({ id, block: on }) })'));
  assert.ok(ui.includes('yesText="끊기" busy="끊는 중"') && ui.includes('yesText="잇기" busy="잇는 중"'));
  assert.match(css, /\.nm-conn-r\.off > span \{ opacity:\.4; \}/);
});
