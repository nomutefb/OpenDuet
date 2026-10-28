// 우리 서버 잇기 — 원본 앱은 모든 요청을 lib/client.ts 의 fetch('/api/…') 한 길로 보낸다.
// 그 길만 가로채 우리 /api/office/* 로 옮기고, 우리 데이터가 없는 길은 서버에 안 보내고 빈 답을 준다. 소켓 = shim/socket.ts
import { route } from "./routes";
import "./socket";

const realFetch = window.fetch.bind(window);

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, location.href);
  if (url.origin !== location.origin || !url.pathname.startsWith("/api/") || url.pathname.startsWith("/api/office/") || url.pathname.startsWith("/api/runner")) return realFetch(input, init);   // /api/runner = 러너 화면 자료(서버 그대로)
  return route(url, init ?? {}, realFetch);
};
