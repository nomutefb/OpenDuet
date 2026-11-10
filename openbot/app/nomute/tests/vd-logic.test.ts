import assert from "node:assert/strict";
import test from "node:test";
import { VD_DEF, artKey, vdBlocked, vdDone, vdPacks, vdSet, vdVids } from "../ui/vd-logic.ts";

// 서랍 「큐영상」(ui/vd.tsx) — 원본 viewer/vd.html 과 같은 값
test("기본 = mp4 · 1080×1920 · 30 · 표준 · 팩 안 함", () => {
  assert.deepEqual(VD_DEF, { format: "mp4", res: "portrait", fps: "30", quality: "standard", pack: "off" });
});

test("4K 세로 = MP4 에서만 · 형식을 바꾸면 4K 가 풀림", () => {
  const k4 = vdSet(VD_DEF, "res", "portrait-4k");
  assert.equal(k4.res, "portrait-4k");
  assert.equal(vdSet(k4, "format", "gif").res, "portrait");
  assert.equal(vdBlocked({ ...VD_DEF, format: "webm" }, "res", "portrait-4k"), true);
  assert.equal(vdBlocked(VD_DEF, "res", "portrait-4k"), false);
});

test("결과 = 영상 · 팩 나눔 · 실패", () => {
  const j = { id: "v1", out: "vd_out/v1/video.json", n: 2, status: "run" as const };
  const d = vdDone(j, { files: ["https://x/a.mp4", "https://x/b.mp4", "https://x/pack.md"] });
  assert.equal(d.status, "done");
  assert.equal(d.n, 2);
  assert.deepEqual(vdVids(d.files), ["https://x/a.mp4", "https://x/b.mp4"]);
  assert.deepEqual(vdPacks(d.files), ["https://x/pack.md"]);
  assert.equal(vdDone(j, { error: "렌더 실패" }).status, "err");
  assert.equal(artKey("2026-11-10-abc.md"), "2026-11-10-abc");
});
