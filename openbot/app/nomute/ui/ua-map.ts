// 아이콘 누름 재생 짝 · 셈(./ua-play.ts) — 화면 없이 시험되게 따로
import type { YIcon } from "./yeta-icons";
export type Anim = { w?: number; fr?: number; ip: number; op: number };
/** 예타 픽토 → useAnimations 이름(짝 없는 것 = 재생 0: contrast · latin · hangul · data · gauge · radio …) */
export const UA_MAP: Partial<Record<YIcon, string>> = { bell: "notification", screen: "monitor", info: "info", type: "type", enter: "cornerDownLeft", layers: "layers", users: "users", speaker: "volume", lock: "lock", chat: "messageCircle", think: "messageCircle", gear: "settings", keys: "command" };

/** 재생 안전판(ms) = 제 길이의 2배(그리기 실패로 끝 신호가 안 와도 걷힘) */
export const uaGuardMs = (a: Anim) => ((a.op - a.ip) / (a.fr || 30)) * 1000 * 2;

