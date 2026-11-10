// 결과 함께 순수 칸 = 옛 에디터 gyPostKey · gyHook 와 같은 결과(올림 표시 키가 바뀌면 에디터에서 한 표시가 앱에서 안 보임)
import assert from "node:assert/strict";
import { test } from "node:test";
import { hookOf, postKey } from "../ui/gyeol-data.ts";

test("postKey = song id + video path without query (same as editor gyPostKey)", () => {
  assert.equal(postKey({ url: "https://pub.r2.dev/songs/s05/take2.mp4?v=3", song: "abc" }), "abc|/songs/s05/take2.mp4");
  assert.equal(postKey({ url: "songs/x.mp4?v=1", song: "s" }), "s|songs/x.mp4", "주소가 아니면 ? 앞까지");
  assert.ok(postKey({ url: "https://a.b/" + "p".repeat(400), song: "s" }).length <= 200, "200자 상한");
});

test("hookOf takes the first chorus block (4 lines max) and skips section tags", () => {
  const ly = "[Verse]\n첫 줄\n둘째 줄\n\n[Chorus]\n후렴 하나\n후렴 둘\n후렴 셋\n후렴 넷\n후렴 다섯\n\n[Verse 2]\n뒤";
  assert.deepEqual(hookOf(ly), { t: "후렴 하나\n후렴 둘\n후렴 셋\n후렴 넷", chorus: true });
  assert.deepEqual(hookOf("[Intro]\n\n처음\n다음\n\n뒤 덩이"), { t: "처음\n다음", chorus: false }, "후렴 표지 없으면 첫 덩이");
  assert.deepEqual(hookOf(""), { t: "", chorus: false });
});
