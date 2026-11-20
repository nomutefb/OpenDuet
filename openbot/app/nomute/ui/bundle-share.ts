// 묶음 카드 「뜸 공유」 글(형 11-21 05:08 dm-sia 시아 옮김 「이 올림 버튼 / 뜸 공유 로 변경해주고 누르면 게이지차고 체크 후 뜸방으로 창이 이동되게해주라 채팅 전송완료와 함께」
//   · 「당연히 저 채팅 요약본하고 원문은 같이 공유되야함」) — 뜸 1:1 에 형 글로 감 = 요약본(묶음 글 몸 통째) + 공식 자료(누가 · 주소 · 한글 · 원문 접힌 몸까지)
//   첫 줄 = `[뜸 공유] <제목>` — 뜸 방에서 다시 묶음 카드로 안 그려지게(`[묶음 …]` 머리 줄은 뺌 · ./bundle.ts isBundleText)
import type { Bundle } from "./bundle";
import type { Src } from "./bundle-src";

export const DDEUM = "뜸";

export function shareText(b: Bundle, raw: string, srcs?: Src[]): string {
  const body = String(raw || "").replace(/\r/g, "").split("\n").slice(1).join("\n").replace(/^\n+|\n+$/g, "");
  const out = [`[뜸 공유] ${b.title || b.stem}`, "", "요약본", body || [b.title, ...b.sums.map((s) => `- ${s}`), b.url ? `주소: ${b.url}` : ""].filter(Boolean).join("\n")];
  for (const [i, s] of (srcs || []).entries()) {
    out.push("", `원문 · 공식 자료${(srcs || []).length > 1 ? ` ${i + 1}` : ""}`);
    if (s.who) out.push(`누가: ${s.who}`);
    if (s.url) out.push(`주소: ${s.url}`);
    if (s.ko) out.push(`한글: ${s.ko}`);
    if (s.orig) out.push("원문:", s.orig);
  }
  return out.join("\n");
}

/** 카드마다 고정 글 열쇠(24자) — 다시 눌러도 서버가 앞 글 그대로(editor _post humanTwin) = 뜸 방에 두 번 안 감 */
export const shareKey = (msgId: string) => `ds${String(msgId || "").replace(/[^0-9a-z]/gi, "")}0000000000000000000000`.slice(0, 24);
