// 요약 대기열 한 벌(/api/pending 날것) — Digest 대기열(./news-summary.tsx) · Hot Issue 오른쪽 칸(./news-list.tsx)이 같은 열쇠 · 같은 답(한 번만 받음)
//   형 11-19 16:42~16:49(슈왕 · 깃 · 봄 옮김) 「오케이 김건희 건 폰에서 뉴스 넣었는데, pc인앱에서는 반영이안되네? 확인 좀 부탁해!」
//     「뭐가 문제냐면, 폰에서 요약눌렀는데, pc에서는 요약이 그대로 살아있어서 내가 안눌러서 저런가? 의구심이 드는게 문제야 그대로 전달해~」
//   = 다른 기기에서 누른 요약도 이 기기 Hot Issue 줄에 보이게 — 대기열 줄의 key · src · alt1(서버 functions/api/pending.js · 요약요청 = 보낸 링크) · 다 된 요약 url(articles.json)과 기사 주소로 맞춤
import { queryOptions } from "@tanstack/react-query";
import { getJson } from "../ui/news-data";

export type PendItem = { id?: string; t?: number; title?: string; key?: string; src?: string; alt1?: string; status?: string; tries?: number };
/** 아직 도는 요청(요약중) */
export const PEND_LIVE = new Set(["processing", "retry", "queued", "pending"]);
export const pendingQuery = queryOptions({
  queryKey: ["nomute", "split-pending"], staleTime: 15_000,
  refetchInterval: (q: { state: { data?: PendItem[] } }) => ((q.state.data || []).some((it) => it.status === "processing" || it.status === "retry") ? 15_000 : 45_000),
  queryFn: () => getJson<{ items?: PendItem[] }>(`/api/pending?_=${Date.now()}`).then((d) => d.items || [], () => [] as PendItem[]),
});
/** 기사 주소 맞춤 열쇠 = 앞머리(https · www · m) · 끝 / · # 뗌 · 작은 글자(물음표 뒤는 그대로 = 그 뒤에 기사 번호가 있는 곳이 있음) */
export const urlKey = (u?: string): string => String(u || "").trim().replace(/^https?:\/\//i, "").replace(/^(?:www\.|m\.)/i, "").replace(/#.*$/, "").replace(/\/+(?=\?|$)/, "").toLowerCase();
/** 물음표 뒤를 뗀 열쇠 — 길에 기사 번호(숫자 6자리 넘게)가 있을 때만(네이버 mnews/article/025/0003566473?sid=102 처럼 뒤가 갈래 표지일 때) · 없으면 "" */
export const urlPathKey = (u?: string): string => { const p = urlKey(u).replace(/\?.*$/, ""); return /\d{6,}/.test(p) ? p : ""; };
