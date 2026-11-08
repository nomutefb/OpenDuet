// 영상 자동 재생 결정(순수 함수 · office-chat.tsx AutoVideo 가 씀 · 시험 = tests/auto-video.test.ts) —
//   보이면(50% 넘게) 돎 · 화면 밖 · 탭 숨김 · 「움직임 줄이기」면 우리가 멈춤 · 사용자가 멈춘 건 사용자가 다시 누를 때까지 안 돌림
//   (모루 11-09 05:33 · 앞 판은 멈춤을 기억 안 하고 threshold 에 1 도 있어 멈춘 영상이 100%→90% 로만 스크롤돼도 다시 돌았음)
export const AV_MIN = 0.5;   // 보임 문턱 · IntersectionObserver threshold 도 이 하나만(1 이 있으면 100→90% 에도 알림이 옴)
export type AvState = { visible: boolean; hidden: boolean; reduce: boolean; userPaused: boolean; playing: boolean };
export type AvEvent =
  | { t: "ratio"; r: number }        // 가시성 알림(0~1)
  | { t: "pause"; byUs: boolean }    // <video> pause 사건 · byUs = 우리가 건 pause(화면 밖 · 탭 숨김 · 움직임 줄이기)
  | { t: "play" }                    // <video> play 사건(사용자 controls 또는 우리 play())
  | { t: "hidden"; v: boolean }      // 탭 숨김(document.visibilityState)
  | { t: "reduce"; v: boolean };     // 움직임 줄이기 설정(도중 바뀜 포함)
export type AvAct = "play" | "pause" | null;
export const avInit = (reduce = false, hidden = false): AvState => ({ visible: false, hidden, reduce, userPaused: false, playing: false });

/** 한 사건 → 새 상태 + 할 일 하나(play · pause · 없음).
 *  사용자 손(play · pause 사건)엔 할 일을 내지 않음 — 사용자가 화면 밖에서 눌러 돌린 걸 그 자리에서 되돌리지 않으려고 · 보임 여부는 다음 가시성 알림이 판단 */
export function avStep(s: AvState, e: AvEvent): { s: AvState; act: AvAct } {
  switch (e.t) {
    case "pause": return { s: { ...s, playing: false, userPaused: e.byUs ? s.userPaused : true }, act: null };
    case "play": return { s: { ...s, playing: true, userPaused: false }, act: null };
    case "ratio": return decide({ ...s, visible: e.r >= AV_MIN });
    case "hidden": return decide({ ...s, hidden: e.v });
    case "reduce": return decide({ ...s, reduce: e.v });
  }
}
function decide(s: AvState): { s: AvState; act: AvAct } {
  const want = s.visible && !s.hidden && !s.reduce && !s.userPaused;
  return { s, act: want && !s.playing ? "play" : !want && s.playing ? "pause" : null };
}
