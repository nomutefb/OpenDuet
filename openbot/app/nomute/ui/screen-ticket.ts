// 몸 화면 「표」(빠르 11-11 · 형 12:49 봄 옮김 「vm 보는거 테일스케일 없어도 보는게 맞는거같아」) — 「화면 보기」 = 서버에서 2분 · 한 번 표를 받아 주소 끝에(?t=)
//   몸 쪽 = tailscale funnel 앞 문지기(claude-state tools/몸화면/문지기.py)가 표를 서버에 물어 맞으면 쿠키 · 테일넷 안은 표 없어도 그대로
//   못 받으면(테일넷 아닌 주소 · 서버 거절 · 끊김) = 옛 주소 그대로(테일넷 안이면 지금처럼 열림)
export async function screenTicketUrl(u: string, f: typeof fetch = fetch): Promise<string> {
  try {
    const r = await f("/api/office/m/screen/ticket", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: u }) });
    const d = (await r.json().catch(() => ({}))) as { ok?: boolean; url?: string };
    if (r.ok && d.ok && typeof d.url === "string" && d.url.startsWith("https://")) return d.url;
  } catch { /* 끊김 = 옛 주소 */ }
  return u;
}

/** 누른 순간 빈 창을 먼저 열고(폰은 기다린 뒤 여는 창을 막음) 표 붙은 주소로 보냄 · 창이 막히면 받은 뒤 한 번 더 */
export function openScreenWithTicket(u: string, f: typeof fetch = fetch, w: Window = window): void {
  const win = w.open("", "_blank");
  void screenTicketUrl(u, f).then((to) => {
    if (win && !win.closed) { try { win.opener = null; } catch { /* 다른 출처 */ } win.location.href = to; }
    else w.open(to, "_blank", "noopener");
  });
}
