// 프로필 사진 = 방 사진 자르기 판 한 벌(형 11-16 18:32 dm-bom 「프로필 사진 변경은 되는데 크기 확대 축소랑 크롭이 안되네」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
test("프로필 사진 고름 → RoomPhotoCrop(끌기 · 두 손가락/휠/막대) → 자른 webp", () => {
  const pc = readFileSync(new URL("../ui/profile-card.tsx", import.meta.url), "utf8");
  assert.match(pc, /<RoomPhotoCrop file=\{cropF\} title="프로필 사진" onDone=\{cropDone\}/);
  assert.doesNotMatch(pc, /function squareWebp/, "가운데만 자르던 옛 길 걷음");
  const rp = readFileSync(new URL("../ui/room-photo.tsx", import.meta.url), "utf8");
  assert.match(rp, /title = "방 사진"/);
  assert.match(rp, /onWheel=\{wheel\}/); assert.match(rp, /type="range"/);
});
test("자르기 판 훅 = early return 앞(얼굴 누르면 앱 깨짐 막이)", () => {
  const pc = readFileSync(new URL("../ui/profile-card.tsx", import.meta.url), "utf8");
  assert.ok(pc.indexOf("useState<File | null>(null)") < pc.indexOf("if (!who) return null;"), "훅이 return 뒤에 있음");
});
test("자르기 판 「완료」 = 라임 박음(body 포털이라 --accent 가 회색 토큰)", () => {
  const css = readFileSync(new URL("../ui/room-photo.css", import.meta.url), "utf8");
  assert.match(css, /\.nrp-h button\.ok\[data-stage="idle"\] \{ color:#CFFF40; \}/);
});
