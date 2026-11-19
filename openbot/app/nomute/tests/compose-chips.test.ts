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

// 형 11-20 07:17 「입력창 위에는 붙여넣기만 있으면 됨 그리고 입력 된 것도 없는데 지우기가 잇을 필욘 없을듯 입력된게 잇으면 버튼 뜨게 해줘. 그리고 글라스 모피즘 적용해주고」
test("빈 칸 = 붙여넣기 하나 · 글 있으면 복사 · 지우기 · 지운 뒤 되돌리기 · 유리", () => {
  const c = readFileSync(new URL("../ui/compose-chips.tsx", import.meta.url), "utf8"), css = readFileSync(new URL("../ui/compose-chips.css", import.meta.url), "utf8");
  assert.match(c, /\{has \? <button type="button" tabIndex=\{-1\} className=\{`nm-cchip\$\{ok \? " ok" : ""\}`\} aria-label="복사"/);
  assert.match(c, /className=\{`nm-cchip\$\{undo !== null \? " undo" : has \? "" : " gone"\}`\}/);
  assert.match(css, /\.nm-cchip\.gone \{ visibility: hidden; pointer-events: none; \}/);
  assert.doesNotMatch(c, /" off"/);
  assert.match(css, /background: rgba\(26, 27, 26, \.56\); border: 1px solid rgba\(255, 255, 255, \.14\);\n  -webkit-backdrop-filter: blur\(11px\); backdrop-filter: blur\(11px\);/);   // 형이 본 유리 동그라미(옛 우하단 「+」) 값
  assert.match(css, /\.nm-cchips \{ position: absolute; top: 0; right: 20px;/);   // 오른쪽 끝(형 08:26 「좀 더 우측으로」)
});
