// 움직임 줄이기 — 앱 안 스위치(설정 「화면 · 글꼴 · 입력 › 화면」 · 형 11-18 「좋아, 다 반영해주라」)
//   기기의 「동작 줄이기」를 안 켜도 이 앱만 조용히: html.nm-lessmove 를 달아 CSS 움직임을 끄고(./less-move.css · main.tsx 가 같이 들임), 코드로 도는 움직임(미끄럼 · 3D 얼굴 · 스프링)은 still() 을 물어 건너뜀
//   still() = 기기 설정이 켜졌거나 이 스위치가 켜졌거나 — 화면 코드는 matchMedia 를 직접 묻지 말고 이것 하나만
//   이 기기에만 기억(localStorage nm_lessmove) · 기본 끔(= 기기 설정 따라)
const KEY = "nm_lessmove", CLS = "nm-lessmove";
const subs = new Set<() => void>();
const read = () => { try { return localStorage.getItem(KEY) === "1"; } catch { return false; } };
let on = typeof localStorage !== "undefined" ? read() : false;
const paint = () => { if (typeof document !== "undefined") document.documentElement.classList.toggle(CLS, on); };
paint();   // 앱이 이 파일을 읽을 때 한 번(설정 판을 안 열어도 먹음)
export const lessMoveOn = () => on;
export const lessMoveWatch = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const setLessMove = (v: boolean) => { on = v; try { localStorage.setItem(KEY, v ? "1" : "0"); } catch { /* 이번만 */ } paint(); subs.forEach((f) => f()); };
/** 순수 — 기기 설정 · 앱 스위치 둘 중 하나라도 = 움직임 줄임 */
export const stillOf = (device: boolean, app: boolean) => device || app;
/** 지금 움직임을 줄여야 하나(기기 설정 또는 앱 스위치) */
export const still = () => stillOf(typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches, on);
