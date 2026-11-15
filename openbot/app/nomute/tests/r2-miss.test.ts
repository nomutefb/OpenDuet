// R2 넘침 앞단 ①(봄 11-15 20:27 · 형 결정 · 설계 = claude-state 공통/문서/2026-11-15/R2-넘침) — 카드 그림 R2 사본 404 → 원본 주소 → 빈 칸
import assert from "node:assert/strict";
import test from "node:test";
import { thumbAltOf, thumbFail } from "../ui/thumb-alt.ts";
test("다음 길 = 원본 주소(url) · 없으면 빈 칸 · 한 번만 갈아 끼움", () => {
  const a = { file: "x.md", cards: { thumb_search: [{ img: "https://pub-x.r2.dev/thumbs/a.jpg", url: "https://site/a.jpg" }] } };
  assert.equal(thumbAltOf(a), "https://site/a.jpg");
  assert.equal(thumbAltOf({ file: "y.md", cards: { thumb_search: [{ img: "https://pub-x.r2.dev/thumbs/b.jpg" }] } }), "");
  const el = { dataset: {} as Record<string, string>, src: "r2", hidden: false };
  const f = thumbFail("https://site/a.jpg");
  f({ currentTarget: el as unknown as HTMLImageElement }); assert.equal(el.src, "https://site/a.jpg"); assert.equal(el.hidden, false);
  f({ currentTarget: el as unknown as HTMLImageElement }); assert.equal(el.hidden, true);
});
