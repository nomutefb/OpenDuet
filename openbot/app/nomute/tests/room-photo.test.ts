import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// 방 표지 사진 다섯(형 11-13 06:54 · 뎅) — tsx 는 node 가 못 돌려 글로 봄 · clamp 는 줄째 꺼내 돌림
const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
const ph = rd("../ui/room-photo.tsx"), list = rd("../ui/room-list.tsx"), look = rd("../ui/room-look.tsx"), tr = rd("../ui/temp-room.tsx");

test("① 목록 방 사진 누름 = 바로 바꾸기(단톡) · 방 링크로 안 번짐", () => {
  assert.match(list, /<RoomPhotoTap r=\{r\}><RoomIcon r=\{r\} size=\{size\} color=\{rc\} \/><\/RoomPhotoTap>/);
  assert.match(list, /e\.preventDefault\(\); e\.stopPropagation\(\); photo\.pick\(\);/);
  assert.match(ph, /onPointerDown=\{\(e\) => e\.stopPropagation\(\)\}/, "자르기 판 누름이 줄로 안 번짐");
});
test("② 설명글 0 · ③ 엑박 0", () => {
  assert.ok(!/표지 사진 = 목록\(폰 · PC\)에 바로/.test(look));
  assert.match(tr, /onError=\{\(\) => setNoPic\(true\)\}/);
});
test("④ 원형 틀 + 3×3 격자 · 완료 · 자리 묶음(긴 쪽은 더 움직임)", () => {
  assert.match(ph, /nrp-mask/); assert.match(ph, /nrp-grid/); assert.match(ph, />\{busy \? "올리는 중" : "완료"\}</);
  const m = /export function clamp\(([^)]*)\): View \{([\s\S]*?)\n\}/.exec(ph);
  assert.ok(m);
  const clamp = new Function("v", "ar", m[2].replace(/: View/g, "")) as (v: { s: number; x: number; y: number }, ar?: number) => { s: number; x: number; y: number };
  assert.deepEqual(clamp({ s: 1, x: 0.4, y: 0.4 }, 1), { s: 1, x: 0, y: 0 });   // 정사각 · 배율 1 = 못 움직임
  assert.deepEqual(clamp({ s: 1, x: 0.4, y: 0.4 }, 2), { s: 1, x: 0.4, y: 0 });   // 가로 2배 = 옆으로 0.5 까지
  assert.equal(clamp({ s: 9, x: 0, y: 0 }, 1).s, 5);
});
test("⑤ 사진 고르면 아이콘 비움 + 목록 다시 받음", () => {
  assert.match(ph, /icon: "", fg: r\.look\?\.fg \|\| ""/);
  assert.match(ph, /invalidateQueries\(\{ queryKey: \["nomute", "rooms"\] \}\)/);
});
