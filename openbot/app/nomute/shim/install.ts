// 우리 서버 잇기 — 원본 앱은 모든 요청을 lib/client.ts 의 fetch('/api/…') 한 길로 보낸다.
// 그 길만 가로채 우리 /api/office/* 로 옮기고, 우리 데이터가 없는 길은 서버에 안 보내고 빈 답을 준다. 소켓 = shim/socket.ts
import { route } from "./routes";
import "./socket";

const realFetch = window.fetch.bind(window);

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, location.href);
  if (url.origin !== location.origin || !url.pathname.startsWith("/api/") || url.pathname.startsWith("/api/office/") || /^\/api\/(runner|candidates|trends|submit|pending|chan|askget|linkprobe|rate)(\/|$|\?)/.test(url.pathname)) return realFetch(input, init);   // 서버 그대로 = /api/runner(러너 화면) · /api/candidates·/api/trends(홈 뉴스 피드 · office-home.md) · 에디터 길 = /api/submit·pending·askget·linkprobe(서랍 요약 요청 · 대기열) · /api/chan(채널 요약 · 홈 팔로워) — 빠져 있어 「이 화면엔 이 자료가 없어」 404 로 막혔음(봄 11-01 · 형 「지금 아직 불편해서 저거 쓰고잇어」) · /api/rate(뉴스 썸네일 화풍 투표 · 에디터와 같은 길 · 비용 0 · ui/news-data.ts voteSend)
  return route(url, init ?? {}, realFetch);
};
