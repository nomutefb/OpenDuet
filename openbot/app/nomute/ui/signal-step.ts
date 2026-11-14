// 그록봇 신호 자국의 셈(순수 · ./signal-trace.tsx 가 그림) — 부름 → 받음 → 들어옴 중 어디서 멈췄나
//   서버(editor functions/api/office/_activity.js hookOf)가 준 step 만 읽는다 — 여기서 새로 판정하지 않는다
export type SigStep = { call: number; got: boolean; in: boolean };
/** 멈춘 구슬 자리(1 = 받음에서 · 2 = 들어옴에서 · -1 = 끝까지 감) */
export const traceStop = (s: SigStep) => (!s.got ? 1 : !s.in ? 2 : -1);
/** 구슬 셋이 켜졌나(부름은 늘 켜짐 — step 이 있다는 게 부른 적이 있다는 뜻) */
export const traceOn = (s: SigStep) => [true, s.got, s.got && s.in];
export const traceKo = (s: SigStep, lost: boolean) => (!s.got ? "불렀는데 그록이 안 받음" : s.in ? "부르고 · 받고 · 들어옴" : lost ? "받았는데 사무실에 안 들어옴" : "받음 · 들어오는 중");
