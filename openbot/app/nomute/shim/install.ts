// 우리 서버 잇기 — 원본 앱은 모든 요청을 lib/client.ts 의 fetch('/api/…') 한 길로 보낸다.
// 그 길만 가로채 우리 /api/office/* 로 옮기고, 우리 데이터가 없는 길은 서버에 안 보내고 빈 답을 준다. 소켓 = shim/socket.ts
import { route } from "./routes";
import "./socket";

const realFetch = window.fetch.bind(window);

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, location.href);
  if (url.origin !== location.origin || !url.pathname.startsWith("/api/") || url.pathname.startsWith("/api/office/") || /^\/api\/(runner|candidates|trends|submit|pending|chan|askget|revise|linkprobe|rate|feedlive|pick|mapsync|seen|settings|sensors|push|account|snsacc|snsretry|linkgrab|vidl|vidlout|vidpeek|dl|thembed|labels|thumb|thumb-clear|compose|resize|upscale|genimg|imgedit|spellcheck|jobs|orig|rszhist)(\/|$|\?)/.test(url.pathname)) return realFetch(input, init);   // 서버 그대로 = /api/runner(러너 화면) · /api/candidates·/api/trends(홈 뉴스 피드 · office-home.md) · 에디터 길 = /api/submit·pending·askget·linkprobe(서랍 요약 요청 · 대기열) · /api/chan(채널 요약 · 홈 팔로워) — 빠져 있어 「이 화면엔 이 자료가 없어」 404 로 막혔음(봄 11-01 · 형 「지금 아직 불편해서 저거 쓰고잇어」) · /api/rate(뉴스 썸네일 화풍 투표 · 에디터와 같은 길 · 비용 0 · ui/news-data.ts voteSend) · /api/feedlive(서랍 「뉴스 전체」 빌드 전 새 요약 · ui/feed.tsx) · /api/pick·mapsync·seen(서랍 「LEGACY」 수집함 PICK·묶기·실패 확인 · 에디터와 같은 길 · ui/scrap.tsx) · /api/labels(서랍 「피드백」 카드 읽기·저장 · 에디터와 같은 길 · ui/feedback.tsx) · /api/thumb·thumb-clear·compose·resize·upscale·genimg·imgedit·spellcheck·jobs·orig·rszhist(서랍 「에디터」 썸네일 생성기 = 에디터 카드 제작과 같은 길·같은 몸 · ui/thumb-maker · 형 11-02 09:28 「이거 아예 이 디자인하고 배경 살려서 인앱 안으로 넣어줘」)
  return route(url, init ?? {}, realFetch);
};
