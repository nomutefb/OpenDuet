// 손맛 — 효과음 · 진동(설정 「알림 · 구독 › 소리 · 진동」 · 형 11-18 「좋아, 다 반영해주라」 = 예타 원본 설정 「소리 · 진동」 줄을 정원에)
//   효과음 = nomutefb/bencho sounds/sounds.ts(브라우저에서 바로 지어 내는 소리 24 · 파일 0 · ../vendor/bencho/sounds.ts) — 기본 끔 · 켠 때만 그 조각을 받음(안 켜면 0바이트)
//     쓰는 자리: 고르기 레일 · 설정 스위치 = tick / 저장 · 전송 ✓ = landed / 못 함 = buzz (손이 닿은 순간에만 = 브라우저가 소리를 허락하는 때)
//   진동 = 이미 있던 손맛(길게 누름 · 밀어 답장 걸림)을 한 스위치로 — 기본 켬 · 끄면 0
//   이 기기에만 기억(localStorage) · 못 읽으면 기본값
const K_SFX = "nm_sfx", K_HAP = "nm_haptic";
const read = (k: string, def: boolean) => { try { const v = localStorage.getItem(k); return v === null ? def : v === "1"; } catch { return def; } };
let sfxOn = typeof localStorage !== "undefined" ? read(K_SFX, false) : false, hapOn = typeof localStorage !== "undefined" ? read(K_HAP, true) : true;
const subs = new Set<() => void>();
export const feelWatch = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const sfxIsOn = () => sfxOn, hapIsOn = () => hapOn;
const put = (k: string, on: boolean) => { try { localStorage.setItem(k, on ? "1" : "0"); } catch { /* 이번만 */ } subs.forEach((f) => f()); };
export const setSfx = (on: boolean) => { sfxOn = on; put(K_SFX, on); if (on) sfx("tick"); };   // 켜는 순간 한 번 들려줌
export const setHap = (on: boolean) => { hapOn = on; put(K_HAP, on); if (on) buzz(8); };

type Name = "tick" | "landed" | "buzz" | "latch";
let lib: Promise<typeof import("../vendor/bencho/sounds")> | null = null;
/** 효과음 한 번 — 꺼져 있으면 아무 일도 안 함 · 못 받거나 소리를 못 내도 조용히 넘어감(화면 일과 무관) */
export function sfx(name: Name) {
  if (!sfxOn || typeof window === "undefined") return;
  (lib ||= import("../vendor/bencho/sounds")).then((m) => { try { m.play(name, { volume: 0.7 }); } catch { /* 소리 못 냄 = 넘어감 */ } }, () => { lib = null; });
}
/** 짧은 진동 — 꺼져 있거나 기기가 못 하면 아무 일도 안 함 */
export function buzz(ms = 8) { if (!hapOn) return; try { navigator.vibrate?.(ms); } catch { /* 못 함 = 넘어감 */ } }
