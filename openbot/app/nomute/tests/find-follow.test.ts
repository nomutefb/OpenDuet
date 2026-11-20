// 돋보기 아래 단추(PM 러너 · 대기열) = 처음부터 마지막 자리에 바로 · 안 움직임(형 11-20 14:04 dm-sia 시아 옮김 「그리고 그 우측 위에 리스트들이 왓다갓다 해 마우스 포인터가 가리킬때마다, pc는 일단 이러는데 모바일도 이러는지는 몰라, pm창하고 동일해야함. 보이는게」 ·
//   14:19 「그니까 처음에는 잘못된 자리에 있다가 (이름표 옆) > 우측으로 이동했다가(두번째 잘못된 자리) > 그 아래로 이동함(그나마 내가 의도했던자리)」)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
test("돋보기가 자리를 박는 그때 신호 · 첫 1.5초는 프레임마다 잼 · PC 반갈에선 박기 전 안 보임", () => {
  const rs = rd("../ui/room-search.tsx"), css = rd("../ui/chat-head.css");
  assert.match(rs, /if \(el === find\.current\) window\.dispatchEvent\(new Event\("nm-find-at"\)\);/);
  assert.match(rs, /raf = requestAnimationFrame\(quick\);/);
  assert.match(rs, /cancelAnimationFrame\(raf\); window\.clearInterval\(t\);/);
  assert.match(css, /\.nm-find:not\(\.open\):is\(:not\(\[data-pin-top\]\), \[data-pin-top=""\]\) \{ visibility:hidden; \}/);
});

test("두 단추 = 한 갈래(useFindDock) · 자리 모를 땐 안 그림(이름표 옆 먼저 뜨는 것 0) · 돋보기와 같은 때 옮김", () => {
  const dock = rd("../ui/find-dock.ts");
  assert.match(dock, /useState<Dock \| null \| undefined>\(undefined\)/);
  assert.match(dock, /!document\.querySelector\("\.nm-split-root"\) \|\| !!f\.dataset\.pinTop/);
  assert.match(dock, /window\.addEventListener\("nm-find-at", fit\);/);
  assert.match(dock, /window\.removeEventListener\("nm-find-at", fit\);/);
  assert.match(dock, /p && p\.top === top && p\.right === right \? p :/, "같은 자리 = 다시 그림 0");
  const qp = rd("../ui/queue-pill.tsx"), pm = rd("../ui/pm-runner-mini.tsx");
  assert.match(qp, /const at = useFindDock\(!!kind\);/); assert.match(qp, /if \(!kind \|\| at === undefined\) return null;/);
  assert.match(pm, /const at = useFindDock\(here\);/); assert.match(pm, /if \(!pmRoom \|\| room !== pmRoom \|\| at === undefined\) return null;/);
  for (const s of [qp, pm]) assert.doesNotMatch(s, /setInterval/, "제 1초 재기 0(한 갈래로)");
});
