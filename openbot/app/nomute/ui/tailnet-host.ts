// 테일넷 안 주소인가(링크 카드 거름 · 빠르 11-09 · 뎅 11-08 23:05 [찾음] ⑦ 「테일넷 주소면 /api/office/linkcard 400 → 콘솔 빨강」 · 봄 배분 10)
//   = 호스트가 *.ts.net 이거나 100.64.0.0/10 · 스킴·포트 무관(서버는 테일넷 밖이라 어차피 못 읽음) · 단추 거르개(pc-url.ts tailnetUrl · 뜸)와 따로 = 그쪽은 열 수 있는 주소만 고름
export function isTailnetHost(u: unknown): boolean {
  let x: URL;
  try { x = new URL(String(u || "")); } catch { return false; }
  const h = x.hostname.toLowerCase();
  if (h === "ts.net" || h.endsWith(".ts.net")) return true;
  const m = /^100\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  return !!m && +m[1] >= 64 && +m[1] <= 127 && +m[2] <= 255 && +m[3] <= 255;
}
