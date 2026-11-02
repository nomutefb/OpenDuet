// 썸네일 생성기 엔진 상태 — 원본 thumb.html 의 화면 전역 let·var·표 const 를 한 그릇에(codemod 가 `이름` → `S.이름` 으로 바꿈)
//   창 열 때마다 비우고 원본 차례대로 다시 채움(./index.ts startEngine) = 원본 iframe 을 새로 연 것과 같은 처음
export const S: Record<string, any> = {};   // eslint-disable-line @typescript-eslint/no-explicit-any
export function resetState() { for (const k of Object.keys(S)) delete S[k]; }
