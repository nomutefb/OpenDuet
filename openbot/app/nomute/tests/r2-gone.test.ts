// R2 넘침 앞단 ②(봄 11-15 20:27 · 형 [결정] ② 「보관됨」만) — 옮겨질 수 있는 영상 결과물만 「보관됨」 · 그 밖은 앞 꼴
import assert from "node:assert/strict";
import test from "node:test";
import { GONE_TEXT, archivable } from "../ui/r2-gone.ts";
test("옮김 표 영상 접두만 · 사무실 첨부 · 노래 판 · 빈 값은 아님", () => {
  assert.equal(GONE_TEXT, "보관됨");
  for (const u of ["https://pub-6121e8a6f6194091b5502a72ed28a87b.r2.dev/ys_res/261025171719-1929fb/short.mp4",
    "https://pub-x.r2.dev/gyeol/mv/0f06/a_v.mp4?v=b6f1", "/ly_out/260707051630-e2e001/video.mp4", "vidl_res/abc/out.mp4"]) assert.equal(archivable(u), true, u);
  for (const u of ["https://pub-0f28d6384a6c4b54b828c2c2aca92f4b.r2.dev/songs/s05/take2.mp4", "/api/office/file?k=office/x.mp4",
    "https://site/my_ly_out/x.mp4", "", null, undefined]) assert.equal(archivable(u as string), false, String(u));
});
