// 서버 안내 글 한 꼴 — 서버에서 못 받아 왔을 때 화면마다 말투 · 색 · 자리가 달랐던 것을 하나로
//   형 11-18 22:0x 봄 손 창: 「서버와 연결이 끊겻어요, 이것도 서버 특유색으로」 · 「대화를 받지 못했습니다. 가운데 정렬로」 · 「이것도 요약 목록을 받지 못했습니다. 가운데 정렬로」 · 「이런것들 다 말투 통일하고 점검해줘」
//   말투 = 「○○을(를) 받지 못했습니다.」 · 색 = 안내 라임(--accent · 문지기 안내 줄과 같은 색) · 가운데 정렬 · 서버가 준 까닭 글(Failed to fetch 등)은 화면에 안 쓰고 title 에만
import "./err-catch.css";

/** 순수 — 받침에 맞는 「을 · 를」(한글로 안 끝나면 「을(를)」) */
export function eulReul(word: string): string {
  const ch = word.trim().slice(-1), code = ch.charCodeAt(0);
  if (!ch || code < 0xac00 || code > 0xd7a3) return "을(를)";
  return (code - 0xac00) % 28 ? "을" : "를";
}
/** 순수 — 「대화」 → 「대화를 받지 못했습니다.」 */
export const notGot = (what: string): string => `${what}${eulReul(what)} 받지 못했습니다.`;

/** 못 받음 안내 한 줄(가운데 · 라임) — what = 무엇을 · detail = 서버가 준 까닭(마우스를 올리면 보임) */
export function SrvNote({ what, detail, className }: { what: string; detail?: string; className?: string }) {
  return <p className={`nm-srvnote${className ? ` ${className}` : ""}`} role="alert" title={detail || undefined}>{notGot(what)}</p>;
}
