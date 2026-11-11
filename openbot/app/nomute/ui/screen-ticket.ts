// 몸 화면 「화면 보기」(빠르 11-11 · 형 12:49 봄 옮김 「vm 보는거 테일스케일 없어도 보는게 맞는거같아」)
//   = 서버 「바로 보내기」(GET /api/office/screen/go?url= · 사람 문)를 새 창으로 바로 엶 → 형이면 서버가 2분 · 한 번 표를 붙여 몸 주소로 302
//   몸 쪽 = tailscale funnel 앞 문지기(claude-state tools/몸화면/문지기.py)가 표를 물어 맞으면 쿠키 · 테일넷 안은 표 없어도 그대로
//   앞 판(fetch 로 표 받고 빈 창을 바꾸기)은 형 폰 17:47 실물 「표 없음」 → 받기가 말없이 실패해도 옛 주소로 열려서 바꿈(창 하나 · 기다림 0 · 폰 창 막기 0)
export const SCREEN_GO = "/api/office/screen/go?url=";   // 사람 문(Access · 형) — m/ = 봇 문(Bearer)이라 형 브라우저는 「열쇠 없음」(형 11-11 18:45 폰 실물 · 앞 판 m/ = 빠르 착각)

export function screenGoUrl(u: string): string {
  return SCREEN_GO + encodeURIComponent(u);
}

export function openScreenGo(u: string, w: Pick<Window, "open"> = window): void {
  w.open(screenGoUrl(u), "_blank", "noopener");
}

/** 앱 안 화면(형 11-11 19:08 「브라우저로 따로 안들어가고 여기서 원활하게 제어할수잇는 방법익나?」) — 사람 문(office · Access)으로 표 붙은 주소를 받음 · 못 받으면 ""
 *  몸 문지기가 표를 받으면 주소 세션(?s= · 웹소켓 path)으로 넘겨 쿠키 없는 앱 안 틀(iframe)에서도 이어짐 */
export async function screenTicket(u: string, call: (body: { url: string }) => Promise<{ url?: string }>): Promise<string> {
  try {
    const d = await call({ url: u });
    return typeof d?.url === "string" && d.url.startsWith("https://") ? d.url : "";
  } catch { return ""; }
}

/** 앱 안 화면 아래 단추(클립보드 · 키보드)가 postMessage 를 보낼 곳 = 그 화면 주소의 origin(https 만 · 그 몸 mom-app.js 가 edit.nomute.kr 글만 받음) · 아니면 "" = 단추 흐리게(빠르 11-11) */
export function momOrigin(url: string): string {
  try { const u = new URL(url); return u.protocol === "https:" ? u.origin : ""; } catch { return ""; }
}
