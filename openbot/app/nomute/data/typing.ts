// 형 「치는 중」 · 「올리는 중」 신호 한 곳(형 11-13 17:57 「끊어서치거든 … 3초뒤에 올라온게 있으면 그거랑 같이」 · 17:59 「치는중 좋네」 · 18:02 「로직에 부하가 없어야해」 ·
//   18:09 굳힘 「채팅을 보내고 10초 뒤까지 추가 전송이 있는지 확인했다가, 그때도 채팅창 입력중인게 없으면 그냥 발송 … 10초 뒤에도 입력하고 있으면 그때조차도 묶고」 ·
//   18:14 「움짤같은거나 모든 미디어도 10초 룰을 다 적용해줘」 → 봄 = 「올리는 중」도 「치는 중」과 같은 신호 · 첫 글 뒤 60초 막)
//   서버(functions hyHeld)가 형 글 깨움을 붙드는 건 형이 보낸 뒤 60초 안뿐 → 그 안에 입력 칸에 칠 때만 2초에 한 번(글자 0) · 올리는 동안은 늘 2초에 한 번 · 평소 타자 = 서버 쓰기 0
import { office } from "./office";

export const TYPE_WINDOW = 60_000, TYPE_EVERY = 2_000;
const sentAt = new Map<string, number>(), typedAt = new Map<string, number>();
export const typingDue = (sent: number, typed: number, now: number, text: string) => !!text.trim() && now - sent < TYPE_WINDOW && now - typed >= TYPE_EVERY;
const ping = (room: string) => { typedAt.set(room, Date.now()); void office(`rooms/${encodeURIComponent(room)}/typing`, { method: "POST", body: "{}" }).catch(() => {}); };   // 못 보냄 = 그냥 10초 뒤 넘김(깨움이 조금 이르게 · 글은 그대로)
/** 형이 그 방에 글 · 파일을 보냄 = 이 뒤 60초가 「치는 중」 보낼 창 */
export const markSent = (room: string) => { sentAt.set(room, Date.now()); };
/** 입력 칸 글자가 바뀔 때 */
export const typingPing = (room: string, text: string) => { if (typingDue(sentAt.get(room) || 0, typedAt.get(room) || 0, Date.now(), text)) ping(room); };
/** 올리는 동안 2초마다(다 올리면 멈춤 함수) */
export function uploadingPing(room: string): () => void {
  if (!room) return () => {};
  markSent(room);
  ping(room);
  const t = window.setInterval(() => ping(room), TYPE_EVERY);
  return () => window.clearInterval(t);
}
