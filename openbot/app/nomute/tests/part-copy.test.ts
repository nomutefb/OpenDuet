// 말풍선 일부 복사(폰) = 길게 누름 → 글 메뉴 「복사」 → 누른 자리 낱말부터 끌어 고르기(형 11-21 09:50~09:52 dm-sia · 시아 R0096)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { CHIP, chipText, wordSpan } from "../ui/part-copy";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const word = (t: string, i: number) => { const [s, e] = wordSpan(t, i); return t.slice(s, e); };

test("누른 자리 낱말 = 빈칸 · 기호까지(한글 · 영문 · 숫자 같이) · 낱말 바로 뒤 = 그 낱말 · 빈칸 = 뒤 글자 먼저", () => {
  const t = "내가 누른 지점에서 drag 복사 2026년!";
  assert.equal(word(t, 0), "내가");
  assert.equal(word(t, 4), "누른");        // 낱말 한가운데
  assert.equal(word(t, 5), "누른");        // 낱말 바로 뒤(빈칸 앞 커서)
  assert.equal(word(t, 6), "지점에서");
  assert.equal(word(t, 12), "drag");
  assert.equal(word(t, 21), "2026년");
  assert.equal(word(t, 24), "2026년");     // 「!」 앞 커서 = 앞 낱말
  assert.equal(word("가  나", 2), "나");   // 빈칸 = 뒤 글자
  assert.equal(word("가  ", 3), "가");     // 뒤가 다 빈칸이면 앞 글자
  assert.equal(word("x — y", 2), "—");     // 기호 = 그 한 자
  assert.equal(word("좋아 🎉 끝", 3), "🎉"); // 그림 글자 = 짝 글자째
  assert.equal(word("좋아 🎉 끝", 4), "🎉");
  assert.deepEqual(wordSpan("", 0), [0, 0]);
  assert.deepEqual(wordSpan("   ", 1), [0, 0]);
  assert.equal(word("끝", 99), "끝");       // 넘는 자리 = 끝 글자
});

test("끼운 자리 = 폰 「복사」만 끌어 고르기 · PC 는 전체 그대로 · 고르는 동안 길게 누르기 · 밀기 안 먹음 · 그 말풍선만 글자 고르기 풂", () => {
  const mm = rd("../ui/msg-menu.tsx"), sw = rd("../ui/swipe-reply.ts"), css = rd("../ui/yeta-chat.css"), pc = rd("../ui/part-copy.ts");
  assert.match(mm, /if \(fine \|\| !startPick\(m\.id, pt\)\) void navigator\.clipboard\?\.writeText\(text\);/);   // 폰 = 끌어 고르기 · 못 고르면 · PC = 전체
  assert.match(mm, /rootEl\.current\.style\.visibility = "hidden"/);   // 판을 숨겨야 누른 자리 글자를 집음
  assert.match(mm, /heldPt = \{ \.\.\.at\.current \}/);   // 누른 자리 = 길게 누른 손자리
  assert.match(mm, /onPointerDown: \(e: PointerEvent\) => \{\s*if \(e\.button \|\| picking\(e\)\) return;/);
  assert.match(mm, /onContextMenu: \(e: MouseEvent\) => \{ if \(picking\(e\)\) return;/);   // 폰 글자 고르기 길게 누름은 그대로 둠
  assert.match(sw, /t\.closest\("video,input,textarea,\.nm-msgm,\[data-pick\]"\)/);
  assert.match(css, /\.ychat \.yb\[data-pick\] \{ -webkit-user-select:text; user-select:text; -webkit-touch-callout:default; \}/);
  assert.match(pc, /yb\.setAttribute\("data-pick", ""\)/);
  assert.match(pc, /removeAttribute\("data-pick"\)/);
  assert.match(pc, /selectionchange/);
});

// 코드 칩 한 번 누름 = 칩 통째 복사(형 11-21 21:49 dm-gik 「이거 복사인데 텍스트 선택이 안된다」 · 깃 PM R0107)
test("칩 글 = 앞뒤 빈칸만 뺌 · 가운데 「-」 · 빈칸은 그대로(「B21B-540E」 가 「B21B」 로 안 잘림)", () => {
  assert.equal(chipText("B21B-540E"), "B21B-540E");
  assert.equal(chipText("  B21B-540E\n"), "B21B-540E");
  assert.equal(chipText("npm run a -- --x"), "npm run a -- --x");
  assert.equal(chipText(null), "");
  assert.equal(word("B21B-540E", 2), "B21B");   // 낱말 셈은 그대로(칩 밖 글) — 칩 안은 startPick 이 칩 통째
  assert.equal(CHIP, 'code[data-streamdown="inline-code"]');   // Streamdown 인라인 코드 표지
});

test("끼운 자리 = 말풍선 누름 앞에 칩 복사 · 길게 누른 뒤 뗌은 안 먹음 · 길게 눌러 고르기도 칩 안이면 칩 통째 · 라임 불 + 「복사됨」", () => {
  const oc = rd("../ui/office-chat.tsx"), pc = rd("../ui/part-copy.ts"), css = rd("../ui/yeta-chat.css");
  assert.match(oc, /const toggle = \(e: ReactMouseEvent\) => \{ if \(press\.fired\(\)\) return; chipCopy\(e\); \};/);
  assert.match(oc, /import \{ chipCopy \} from "\.\/part-copy";/);
  assert.match(pc, /if \(chip\) range\.selectNodeContents\(chip\);/);
  assert.match(pc, /if \(!chip \|\| picking\(chip\)\) return false;/);   // 칩 안을 끌어 고르는 중이면 그대로 둠
  assert.match(pc, /return el\?\.closest\("\.yb"\) \? el : null;/);   // 말풍선 속 칩만
  assert.match(css, /\[data-streamdown="inline-code"\]\[data-copied\]/);
  assert.match(css, /\.nm-chipok \{ position:fixed;/);
});
