import assert from "node:assert/strict";
import { test } from "node:test";
import { colorOf, cropUrl, tracksDone, renderBody, rendered, playOf, pickDflt, mmss, PALETTE } from "../ui/track-logic.ts";

// 정원 「트래킹」 판 1(team-4 · 깃 11-10) — 원본 viewer/track.html · functions/api/track.js 와 같은 값인지
const ID = "261110235900-abc123";
const people = [{ pid: 1, crop: "crops/p1.jpg", first: 0, last: 12 }, { pid: 2, crop: "crops/p2.jpg" }, { pid: 13 }];

test("색 = 옛 화면 PALETTE 차례 · 13번은 한 바퀴 돌아 1번 색", () => {
  assert.equal(colorOf(1), PALETTE[0]); assert.equal(colorOf(13), PALETTE[0]); assert.equal(colorOf(12), PALETTE[11]);
});

test("얼굴 그림 = p1.jpg 꼴만 라이브 · 그 밖 정적", () => {
  assert.equal(cropUrl(ID, "crops/p1.jpg"), "/api/track?id=" + ID + "&f=crop&n=p1.jpg");
  assert.equal(cropUrl(ID, "crops/x.png", "v1"), "/track_out/" + ID + "/crops/x.png?v=v1");
  assert.ok(tracksDone({ people: [] })); assert.ok(!tracksDone({})); assert.ok(!tracksDone(null));
  assert.equal(mmss(75.4), "1:15");
});

test("모자이크 = 고른 사람 · 옛 기본(타원 · 9칸 · 115% · 페더 5) · 아무도 안 고르면 막음", () => {
  const p = { ...pickDflt(), sel: [2, 99, 2], scope: { 2: "body" as const, 99: "body" as const } };
  const r = renderBody(ID, people, p).body!.render;
  assert.deepEqual(r.targets, [2]); assert.deepEqual(r.scopes, { 2: "body" }); assert.equal(r.invert, false);
  assert.deepEqual(r.opts, { shape: "ellipse", pxw: 9, pxh: 9, size: 1.15, feather: 5 });
  assert.equal((r.colors as Record<string, string>)[13], PALETTE[0]);
  assert.ok(renderBody(ID, people, pickDflt()).error);
  assert.ok(renderBody(ID, people, { ...pickDflt(), invert: true }).body, "고른 사람 빼고 다 가리기 = 고른 사람 없어도 됨");
  assert.ok(renderBody("bad", people, p).error);
});

test("이름표 = 이름 하나는 · 크로마키 = 강도 % → 비율", () => {
  assert.ok(renderBody(ID, people, { ...pickDflt(), mode: "pinset" }).error);
  const r = renderBody(ID, people, { ...pickDflt(), mode: "pinset", names: { 1: "  세웅 ", 2: "" } }).body!.render;
  assert.deepEqual(r.names, { 1: "세웅" });
  const c = renderBody(ID, [], { ...pickDflt(), mode: "chroma" }).body!.render;
  assert.deepEqual(c, { id: ID, mode: "chroma", opts: { color: "green", similarity: 0.18, choke: 0, feather: 1 } });
});

test("렌더 끝 = 보낸 뒤 판 · 옛 url 아님 · 모드 같음 · 크로마 재생 = preview", () => {
  const t0 = Date.parse("2026-11-10T23:50:00+09:00");
  assert.equal(rendered({ url: "a.mp4", ts: "2026-11-10T23:51:00+09:00", mode: "mosaic" }, t0 - 90e3, "", "mosaic"), "done");
  assert.equal(rendered({ url: "a.mp4", ts: "2026-11-10T23:40:00+09:00" }, t0 - 90e3, "", "mosaic"), "", "옛 판");
  assert.equal(rendered({ url: "a.mp4", ts: "2026-11-10T23:51:00+09:00" }, t0 - 90e3, "a.mp4", "mosaic"), "", "옛 url");
  assert.equal(rendered({ url: "b.mp4", ts: "2026-11-10T23:51:00+09:00", mode: "pinset" }, t0 - 90e3, "", "mosaic"), "", "다른 모드");
  assert.equal(rendered({ error: "x", ts: "2026-11-10T23:51:00+09:00" }, t0 - 90e3, "", "mosaic"), "error");
  assert.equal(playOf({ mode: "chroma", url: "m.mov", preview: "p.webm" }), "p.webm");
  assert.equal(playOf({ mode: "mosaic", url: "m.mp4", preview: "p.webm" }), "m.mp4");
});
