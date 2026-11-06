// 컴퓨터 · 조치 필요 카드의 화면 주소(순수 · 시험 tests/pc-url.test.ts) — 서버 _pcreq.js tailnetUrl 과 같은 규칙을 화면에서도 한 번 더 봄
//   = 테일넷 안 주소만 단추가 됨: https://<몸>.<테일넷>.ts.net/… 또는 http(s)://100.64.0.0/10:<포트>/…
export function tailnetUrl(u: unknown): string {
  let x: URL;
  try { x = new URL(String(u || "")); } catch { return ""; }
  if (x.username || x.password) return "";
  const h = x.hostname.toLowerCase();
  if (x.protocol === "https:" && /^[a-z0-9-]+\.[a-z0-9-]+\.ts\.net$/.test(h)) return x.href;
  const m = /^100\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (m && +m[1] >= 64 && +m[1] <= 127 && +m[2] <= 255 && +m[3] <= 255 && (x.protocol === "http:" || x.protocol === "https:")) return x.href;
  return "";
}
