// 잠금 PIN 셈 — 원본 = nomutefb/editor viewer-src/31-lkMinRaw.part(lkHash · LK_MAX · LK_OUT_MS · LK_LEN) · 32-lkProdBusy.part(lkVerifyOldPin · lkAskNewPin · lkChangePin) 그대로
//   해시 = SHA-256(PIN + ":nmlock") · 틀림 5번 = 10분 잠김 · 틀린 횟수 · 잠긴 때 = 이 기기(localStorage nm_lock_fails · nm_lock_until — 에디터 잠금 화면과 같은 칸 = 같이 셈)
//   성격 = 사생활 가림막(원본 주석 그대로 · 접근 보안은 CF Access) · 원본의 복구 번호(6자리)는 4자리 칸에선 칠 길이 없어 여기 안 옮김
export const LK_LEN = 4, LK_MAX = 5, LK_OUT_MS = 600_000;
const K_FAILS = "nm_lock_fails", K_UNTIL = "nm_lock_until";

export async function lkHash(pin: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pin + ":nmlock"));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const num = (s: Store, k: string) => { try { return parseInt(s.getItem(k) || "0", 10) || 0; } catch { return 0; } };
/** 잠김이 풀릴 때까지 남은 ms(0 = 안 잠김) */
export const lkOutLeft = (s: Store, now: number) => Math.max(0, num(s, K_UNTIL) - now);
export const lkClear = (s: Store) => { try { s.removeItem(K_FAILS); s.removeItem(K_UNTIL); } catch { /* 이번만 */ } };
/** 틀림 한 번을 적고 화면에 띄울 글을 돌려줌(5번째 = 10분 잠김 시작) */
export function lkFail(s: Store, now: number): string {
  const n = num(s, K_FAILS) + 1;
  try { s.setItem(K_FAILS, String(n)); if (n >= LK_MAX) s.setItem(K_UNTIL, String(now + LK_OUT_MS)); } catch { /* 이번만 */ }
  return `PIN 번호가 틀립니다 (${Math.min(n, LK_MAX)}/${LK_MAX})`;
}
export const lkOutMsg = (left: number) => `${LK_MAX}회 초과 — ${Math.ceil(left / 60000)}분 후 다시`;
/** 기존 PIN 확인 한 번 — true = 맞음(틀린 횟수 지움) · 글 = 틀림 · 잠김 안내 */
export async function lkCheck(s: Store, pin: string, hash: string, now: number): Promise<true | string> {
  const left = lkOutLeft(s, now);
  if (left) return lkOutMsg(left);
  let h = ""; try { h = await lkHash(pin); } catch { /* 해시 못 함 = 틀림과 같이 */ }
  if (h && h === hash) { lkClear(s); return true; }
  return lkFail(s, now);
}
/** 친 글에서 숫자만 · 자리수까지(붙여 넣기 「12 34」 → 「1234」) */
export const pinClean = (raw: string, len: number) => raw.replace(/\D/g, "").slice(0, len);
