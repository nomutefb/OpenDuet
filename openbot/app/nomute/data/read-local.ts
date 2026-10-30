// 이 기기 안 「봤음」 표 — 방을 여는 순간 적고(서버 seen 왕복 전), 목록 셈이 서버 unread 보다 먼저 본다.
//   왜(형 10-30 15:4x): 「폰에서 2번 목록에서, 지워지긴하는데 금방 안없어지는 느낌」 — 전엔 글 다 받고 서버 seen 올린 뒤에야 목록 숫자를 고쳐서,
//   목록으로 돌아오면 서버 값(아직 unread>0)이 한 번 더 덮어 늦어 보였다. 여기 표는 기억만(새로 고치면 빔 · 그땐 서버 seen 이 맞음).
export const readLocal = new Map<string, number>();
export const markReadLocal = (room: string, ts?: number) => { readLocal.set(room, Math.max(Date.now(), ts || 0)); };
export const readLocally = (room: string, lastTs?: number) => (readLocal.get(room) || 0) >= (lastTs || 0) && readLocal.has(room);
