// 공지 칸 둘(공지 · 그록봇 공지)의 셈(ui/notice-box-logic.ts) + 끼운 자리 — 형 11-17 06:56 · 06:57
import { test } from "bun:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { canSave, dayKo, failKo, histKo, metaKo, readNote, saveBody } from "../ui/notice-box-logic";
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("서버 답 두 꼴 → 한 꼴(판 · 날짜 · 고칠 수 있나)", () => {
  const a = readNote({ ok: true, notice: { ver: 24, text: "가", ts: 1794866333120, at: "2026-11-17T06:58:53+09:00", by: "천둥" }, history: [{ ver: 24, at: "2026-11-17T06:58:53+09:00", by: "천둥", len: 3 }, { ver: 23, at: "2026-11-16T09:47:13+09:00", by: "형", len: 4 }], can_edit: true })!;
  assert.deepEqual([a.ver, a.text, a.by, a.can_edit, a.history.length], [24, "가", "천둥", true, 2]);
  assert.equal(metaKo(a), "판 24 · 11-17");
  assert.deepEqual(histKo(a), ["23 · 11-16 · 형"]);   // 지금 판은 빼고
  const g = readNote({ ok: true, text: "나", at: 1794866157066, by: "봄", ver: 1, seed: false, can_edit: false })!;
  assert.deepEqual([g.ver, g.text, g.can_edit, g.history.length], [1, "나", false, 0]);
  assert.equal(metaKo(g), "판 1 · 11-17");
  assert.equal(metaKo(readNote({ text: "옛 꼴", at: 1794866157066 })), "11-17");   // 판이 아직 없는 답 = 날짜만
  assert.equal(readNote({ ok: false }), null); assert.equal(metaKo(null), "");
});
test("날짜 = 한국 시각", () => { assert.equal(dayKo(Date.parse("2026-11-16T15:30:00Z")), "11-17"); assert.equal(dayKo(0), ""); });
test("보낼 몸 = 글 + 읽은 판 · 저장 = 바뀌고 비지 않을 때만 · 실패 한마디", () => {
  assert.deepEqual(saveBody("새 글", { ver: 24 }), { text: "새 글", base: 24 });
  assert.deepEqual(saveBody("새 글", { ver: 0 }), { text: "새 글" });
  assert.equal(canSave("가", { text: "가" }), false); assert.equal(canSave("  ", { text: "가" }), false); assert.equal(canSave("나", { text: "가" }), true);
  assert.match(failKo("changed"), /다른 데서 바뀌었어/); assert.equal(failKo("권한 없음"), "권한 없음"); assert.equal(failKo(""), "저장 못 했어");
});
test("끼운 자리 = 두 칸 같은 부품 · 위 「수정」 · 아래 「닫기」 · 「저장」 · 되묻는 창 0", () => {
  const ui = rd("../ui/notice-box.tsx"), set = rd("../ui/yeta-settings.tsx"), bm = rd("../ui/bot-manage.tsx");
  assert.match(set, /<NoticeBox kind="notice" onClose=/); assert.match(set, /useNoteMeta\("notice"\)/);
  assert.match(bm, /<Row label="그록봇 공지">/); assert.match(bm, /<NoticeBox kind="grok" onClose=/); assert.doesNotMatch(bm, /그록봇 지침"|메모 열기/);
  assert.ok(ui.indexOf(">수정</button>") < ui.indexOf("<textarea") && ui.indexOf("<textarea") < ui.indexOf(">닫기<") && ui.indexOf(">닫기<") < ui.indexOf(">저장</GoButton>"));
  assert.match(ui, /<GoButton[^>]*go=\{save\}/); assert.match(ui, /저장됨/);   // 알약 게이지 → 체크 → 「저장됨」 → 닫힘(형 06:57)
  assert.doesNotMatch(ui, /AskYN|createPortal|role="alertdialog"/);
  assert.match(rd("../ui/notice-box.css"), /prefers-reduced-motion:\s*reduce/);
});
