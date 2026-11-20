// 서버 일 이름 → 앱 이름(형 11-21 05:44 dm-bom 봄 옮김 「일감 가르기 명칭 배분 서브」) — 머리 칸 · 러너 일 판 머리가 같은 useModelSet 을 읽음
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { sheetKo } from "../ui/model-set-logic.ts";

const pick = (model: string, effort: string) => ({ model, effort });
test("sort = 「배분 서브」 · 나머지 · 열쇠 id 그대로 · 서버 값(캐시)은 안 건드림(select)", () => {
  const raw = { jobs: [{ id: "sort", ko: "일감 가르기", def: pick("a", "low"), now: pick("a", "low") }, { id: "audit", ko: "안 닫힌 오더 판독", def: pick("a", "low"), now: pick("a", "low") }], models: [], efforts: [] };
  const s = sheetKo(raw);
  assert.deepEqual(s.jobs.map((j) => [j.id, j.ko]), [["sort", "배분 서브"], ["audit", "안 닫힌 오더 판독"]]);
  assert.equal(raw.jobs[0].ko, "일감 가르기", "받은 값은 그대로");
  assert.match(readFileSync(new URL("../ui/model-set.tsx", import.meta.url), "utf8"), /export const useModelSet = \(\) => useQuery\(\{ queryKey: KEY, queryFn: \(\) => office<Sheet>\("modelset"\), staleTime: 60_000, retry: false, select: sheetKo \}\);/);
});
