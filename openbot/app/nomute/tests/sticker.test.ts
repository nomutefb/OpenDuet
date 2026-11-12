// 움짤 스티커 한 줄 표지(형 11-12 12:17 · 뜸)
import assert from "node:assert/strict";
import test from "node:test";
import { PACKS, STK_TMP, dropStickerTwins, stickerMark, stickerOf, stickerText, stickerUrl } from "../ui/sticker-logic.ts";

test("「[스티커 이름 상황]」 한 줄 = 움짤 · 그 밖 = 그냥 글", () => {
  const s = stickerOf("[스티커 빠르 좋아]");
  assert.equal(s && stickerUrl(s.pack, s.item), "/office/sticker/fast/joy.gif");
  assert.equal(stickerOf(" [스티커 봄 고마워] ")?.pack.id, "bom");
  assert.equal(stickerOf("[스티커 뜸 해냈다]")?.item.id, "done");
  assert.equal(stickerOf("[스티커 뜸 해뜸]")?.item.id, "rise");
  assert.equal(stickerOf("[스티커 빠르 좋아] 고마워"), null, "다른 글이 붙으면 그냥 글");
  assert.equal(stickerOf("[스티커 없는애 좋아]"), null);
  assert.equal(stickerText(PACKS[0], PACKS[0].items[1]), "[스티커 빠르 고마워]");
});

test("내 움짤 옆 표 — 보내는 중(이 탭 임시 글) = wait · 서버 글 = sent(라임 ✓ · 형 11-12 12:50)", () => {
  assert.equal(stickerMark(STK_TMP + "abc"), "wait");
  assert.equal(stickerMark("1794455394894-46a9df"), "sent");
  assert.equal(stickerMark(undefined), "sent");
});

test("보내는 중 움짤 + 진짜 글이 같이 있으면 하나만(형 11-12 13:46 「2개로 순간적으로 보인다」)", () => {
  const t = "[스티커 뜸 고마워]";
  const tmp = { id: STK_TMP + "x", ts: 1000, kind: "human", text: t };
  const real = { id: "1001-a", ts: 1500, kind: "human", text: t };
  assert.deepEqual(dropStickerTwins([tmp, real]).map((m) => m.id), ["1001-a"]);
  assert.deepEqual(dropStickerTwins([tmp]).map((m) => m.id), [tmp.id], "진짜 오기 전 = 임시 그대로");
  assert.deepEqual(dropStickerTwins([tmp, { ...real, text: "[스티커 뜸 좋아]" }]).length, 2, "다른 움짤 = 둘 다");
  assert.deepEqual(dropStickerTwins([tmp, { ...real, ts: 999_999 }]).length, 2, "1분 넘은 옛 같은 움짤 = 남의 것");
});
