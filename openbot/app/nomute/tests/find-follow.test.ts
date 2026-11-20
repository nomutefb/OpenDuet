// 돋보기 아래 단추(PM 러너 · 대기열) = 돋보기가 옮긴 그때 같이 옮김(형 11-20 14:04 dm-sia 시아 옮김 「그리고 그 우측 위에 리스트들이 왓다갓다 해 마우스 포인터가 가리킬때마다, pc는 일단 이러는데 모바일도 이러는지는 몰라, pm창하고 동일해야함. 보이는게」)
//   앞 판 = 돋보기 · 단추가 따로 1초마다 다시 재서, 위 칸이 바뀌면 돋보기가 먼저 · 단추가 1초 늦게 따라오며 왔다 갔다(실물 = 머리 줄 아래 160 → 361)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rd = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");
test("돋보기가 옮기면 그 자리에서 신호 · 두 단추가 그 신호로 같이 옮김", () => {
  assert.match(rd("../ui/room-search.tsx"), /if \(el === find\.current\) window\.dispatchEvent\(new Event\("nm-find-at"\)\);/);
  for (const f of ["../ui/queue-pill.tsx", "../ui/pm-runner-mini.tsx"]) {
    const s = rd(f);
    assert.match(s, /window\.addEventListener\("nm-find-at", fit\);/, f);
    assert.match(s, /window\.removeEventListener\("nm-find-at", fit\);/, f);
  }
});
