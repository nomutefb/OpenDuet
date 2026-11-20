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
  assert.match(set, /<NoticeBoard onClose=/); assert.match(set, /useNoteMeta\("notice"\)/);   // 설정 = 공지판(기본판 · 그록봇판 두 칸 · 형 11-20 19:31) · 안에서 같은 NoticeBox
  assert.match(ui, /<NoticeBox key=\{kind\} kind=\{kind\} onClose=\{onClose\} \/>/);
  assert.match(bm, /<Row label="그록봇 공지">/); assert.match(bm, /<NoticeBox kind="grok" onClose=/); assert.doesNotMatch(bm, /그록봇 지침"|메모 열기/);
  assert.ok(ui.indexOf(">수정</button>") < ui.indexOf("<textarea") && ui.indexOf("<textarea") < ui.indexOf(">닫기<") && ui.indexOf(">닫기<") < ui.indexOf(">저장</GoButton>"));
  assert.match(ui, /<GoButton[^>]*go=\{save\}/); assert.match(ui, /저장됨/);   // 알약 게이지 → 체크 → 「저장됨」 → 닫힘(형 06:57)
  assert.doesNotMatch(ui, /AskYN|createPortal|role="alertdialog"/);
  assert.match(rd("../ui/notice-box.css"), /prefers-reduced-motion:\s*reduce/);
});

test("공지판 = 기본판 · 그록봇판 두 칸 · 바이트 지금/한계 · 넘으면 저장 막힘(형 11-20 19:31 「기본판, 그록봇판 두개로 공간 만들어주라 / 공지판 으로 하나 설정 넣어서.」 「거기에 각각 지침에 바이트 수 한계를 넣어주면 될 것 같아」)", async () => {
  const m = await import("../ui/notice-box-logic");
  assert.deepEqual(m.NOTE_KINDS.map((k) => m.NOTE_NAME[k]), ["기본판", "그록봇판"]);
  assert.equal(m.bytesOf("가a"), 4);   // 한글 3 · 영문 1
  assert.equal(m.bytesKo(3812, 8000), "3,812 / 8,000 바이트");
  assert.equal(m.bytesKo(12, 0), "12 바이트");
  assert.equal(m.readNote({ notice: { ver: 3, text: "x" }, limit_bytes: 8000 })?.limit, 8000);
  assert.equal(m.readNote({ text: "y", ver: 1, max_bytes: 4000 })?.limit, 4000);
  assert.equal(m.readNote({ text: "y", ver: 1 })?.limit, 0);
  assert.equal(m.canSave("가가가", { text: "", limit: 8 }), false);   // 9 바이트 > 8
  assert.equal(m.canSave("가가", { text: "", limit: 8 }), true);
  const ys = readFileSync(new URL("../ui/yeta-settings.tsx", import.meta.url), "utf8");
  assert.match(ys, /row\("notice", "speaker", "공지판", <NoticeBoard onClose=/);
});
