// 한 박자 격자(11-14 형 맥 뜨거움 · 클라우드 세션) — 계속 도는 장식(조약돌 얼굴 · 불빛 숨쉬기 · 퍼지는 테)이 같은 순간에 화면을 바꾸게 한다.
//   따로 놀면 바꾸는 순간이 합쳐져 창을 다시 그리는 횟수가 는다(얼굴 초당 20 + 불빛 12 = 32번). 같은 격자에 맞추면 20번.
export const BEAT_MS = 50;
/** 순수 — 다음 격자 점까지 잘 시간(ms). 반 박자 안쪽이면 그다음 점(늦게 깬 뒤 연달아 두 번 그리지 않게) */
export const beatWait = (now: number, step = BEAT_MS) => { const r = step - (((now % step) + step) % step); return r < step / 2 ? r + step : r; };
