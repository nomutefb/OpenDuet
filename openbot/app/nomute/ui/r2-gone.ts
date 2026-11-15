// R2 넘침 앞단 ② — 3일 지난 영상 결과물이 윈A 로 옮겨져 R2 에 없으면 「보관됨」 한 줄(되살리기 단추 0)
//   (봄 11-15 20:27 형 결정 「시아가 1번 그리구 그다음 배분 주특기한테 주면 됨」 · 설계 = claude-state 공통/문서/2026-11-15/R2-넘침/설계.md
//    형 [결정] ② 20:22 「보관됨」만 · 옮기는 손 = 번개 nomute-r2-diet)
//   잣대 = 옮김 표에 든 영상 접두(ly_out · vidl_res · ys_res · gyeol)만 · 그 밖(사무실 첨부 office/ 등)은 못 받아도 앞 꼴 그대로
//   먹는 것 = 0(재생이 깨질 때만 · 미리 묻지 않음 · 옛 탭 새 창만 누를 때 metadata 한 번)
export const GONE_TEXT = "보관됨";
const GONE_RE = /(?:^|\/)(?:ly_out|vidl_res|ys_res|gyeol)\//;

/** 이 주소가 윈A 로 옮겨질 수 있는 영상 결과물인가(그때만 못 받음 = 「보관됨」) */
export const archivable = (u: string | null | undefined): boolean => {
  const s = String(u || "");
  if (!s) return false;
  try { return GONE_RE.test(new URL(s, "https://x.invalid/").pathname); } catch { return GONE_RE.test(s); }
};

const VID_RE = /\.(?:mp4|m4v|mov|webm)(?:[?#]|$)/i;

/** 옛 탭 「새 창」 열기(./old-tabs/index.tsx host.open) — 옮겨질 수 있는 영상이면 빈 창을 먼저 열고(누른 순간이라 막힘 0)
 *  metadata 만 받아 보고 → 되면 그 주소로 · 안 되면 그 창에 「보관됨」 한 줄. 그 밖 주소 = 앞 꼴(noopener 새 창) 그대로. */
export function openMaybeGone(u: string): void {
  if (!archivable(u) || !VID_RE.test(u) || typeof document === "undefined") {
    try { window.open(u, "_blank", "noopener"); } catch { /* 못 열면 그대로 */ }
    return;
  }
  let w: Window | null = null;
  try { w = window.open("", "_blank"); } catch { w = null; }
  if (!w) { try { window.open(u, "_blank", "noopener"); } catch { /* 그대로 */ } return; }
  try { w.opener = null; } catch { /* 그대로 */ }
  const v = document.createElement("video");
  let done = false;
  const end = (ok: boolean) => {
    if (done) return;
    done = true;
    clearTimeout(t);
    v.removeAttribute("src"); try { v.load(); } catch { /* 그대로 */ }
    if (!w || w.closed) return;
    if (ok) { w.location.replace(u); return; }
    try {
      w.document.title = GONE_TEXT;
      w.document.body.innerHTML = "";
      const p = w.document.createElement("p");
      p.textContent = GONE_TEXT;
      p.setAttribute("style", "font:600 15px/1.5 system-ui,sans-serif;color:#9aa0a6;text-align:center;margin:40vh 16px 0");
      w.document.body.setAttribute("style", "margin:0;background:#111");
      w.document.body.appendChild(p);
    } catch { /* 그대로 */ }
  };
  const t = setTimeout(() => end(true), 8000);   // 8초 안 답 = 느린 망 → 그 주소로 그냥 감(앞 꼴)
  v.preload = "metadata"; v.muted = true;
  v.addEventListener("loadedmetadata", () => end(true), { once: true });
  v.addEventListener("error", () => end(false), { once: true });
  v.src = u;
}
