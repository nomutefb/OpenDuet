// 입력칸 위 테두리 단추 셋 = 이미지 에디터 글칸 그대로(형 11-20 03:52 dm-gik 「글구 이 메세지 우상단 보내기 전 라인에 그 이미지 에디터에 보면 3버튼 있잖아. 그거 달라붙게 해주러」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("에디터와 같은 값 · 같은 그림 · 초점 안 뺏음 · 입력칸 글 바뀔 때만 다시 그림", () => {
  const c = readFileSync(new URL("../ui/compose-chips.tsx", import.meta.url), "utf8"), oc = readFileSync(new URL("../ui/office-chat.tsx", import.meta.url), "utf8");
  const ed = readFileSync(new URL("../ui/thumb-maker/engine/p04-media.ts", import.meta.url), "utf8");
  assert.match(ed, /ERASE_UNDO_MS = 10000/);
  assert.match(c, /ERASE_UNDO_MS = 10_000, OK_MS = 1200/);   // 에디터 지우기 → 되돌리기 10초 · 복사 ✓ 1.2초
  assert.match(c, /import \{ CHECK_SVG, COPY_SVG, ERASE_SVG, PASTE_SVG, UNDO_SVG \} from "\.\/thumb-maker\/engine\/svg"/);
  assert.match(c, /const keep = \(e: PointerEvent\) => e\.preventDefault\(\);/);
  assert.equal(c.match(/onPointerDown=\{keep\}/g)?.length, 3);
  assert.match(c, /h\.clear\(\); chipText\(""\);/);   // 지울 때 「글 없음」 먼저(되돌리기가 바로 끝나지 않게)
  assert.match(oc, /saveDraft\(room, t\); chipText\(t\);/);
  assert.match(oc, /<div className="nm-cmp-wrap"><ComposeChips key=\{room\} init=\{loadDraft\(room\)\} \/>/);
});
