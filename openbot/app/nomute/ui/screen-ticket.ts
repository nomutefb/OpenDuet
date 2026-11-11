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
