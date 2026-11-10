// 글 캡처(길게 누르기 메뉴 「캡처」 · 뎅 11-11) — 형 08:50 봄 1:1(봄 옮김) 「누르면 나오는 메뉴 중 책갈피 빼고는 가져오면 됨」(카톡 메뉴 = 답장 · 공유 · 캡처 · 삭제) · 봄 08:56 「② 캡처 = 둘째 판에 넣어(앱 손 · 서버 0)」
//   그 글 한 줄(프사 · 이름 · 말풍선 · 시각 = [data-id] 칸)을 PNG 로 구움 → 되는 기기는 폰 공유(그림째) · 안 되면 받기
//   굽는 손 = html-to-image(MIT · 1.11.13 · 누를 때만 실음) · 그림은 같은 출처(/api/office/file)라 그대로 들어감 · 글 위 동작 줄 · 반응 단추는 뺌
const SKIP = ["nm-msgm", "yb-un"];   // 메뉴 판 · 「가져감」 표(글 위 동작 줄 = aria-label 「글 동작」으로 뺌)

export const capName = (ts: number) => { const d = new Date(ts), z = (n: number) => String(n).padStart(2, "0"); return `캡처-${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}-${z(d.getHours())}${z(d.getMinutes())}.png`; };

export async function captureMsg(id: string, ts: number): Promise<"shared" | "saved" | "cancel" | "none"> {
  const node = document.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`);
  if (!node) return "none";
  const { toBlob } = await import("html-to-image");
  const bg = getComputedStyle(node.closest(".ychat") || document.body).backgroundColor || "#161716";
  const blob = await toBlob(node, {
    pixelRatio: Math.min(3, window.devicePixelRatio || 2), backgroundColor: bg && bg !== "rgba(0, 0, 0, 0)" ? bg : "#161716",
    style: { padding: "12px", margin: "0" },
    filter: (el) => !(el instanceof HTMLElement && (SKIP.some((c) => el.classList.contains(c)) || el.getAttribute("aria-label") === "글 동작")),
  });
  if (!blob) return "none";
  const file = new File([blob], capName(ts), { type: "image/png" });
  try {
    if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file] }); return "shared"; }
  } catch (e) { if ((e as Error)?.name === "AbortError") return "cancel"; }   // 공유 창을 그냥 닫음 = 아무 일 없음 · 그 밖(손 시간 넘김 등) = 받기로
  const a = document.createElement("a"), u = URL.createObjectURL(blob);
  a.href = u; a.download = file.name; document.body.append(a); a.click(); a.remove();
  window.setTimeout(() => URL.revokeObjectURL(u), 4000);
  return "saved";
}
