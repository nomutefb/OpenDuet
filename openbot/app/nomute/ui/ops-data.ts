// 살림 장부 받기(./ops-desk.tsx · ./cli-bind.tsx 가 같은 답을 나눠 씀) — /ops.json 하나 · 열 때 한 번 · 10분 안엔 다시 안 받음
import { queryOptions } from "@tanstack/react-query";
import { getJson } from "./news-data";
import type { OpsData } from "./ops-logic";

export const opsOpts = queryOptions({ queryKey: ["nomute", "ops"], staleTime: 10 * 60_000, retry: false, queryFn: () => getJson<OpsData>("/ops.json") });
