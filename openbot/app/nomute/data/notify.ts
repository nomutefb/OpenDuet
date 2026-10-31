// 방 알림 — 형 11-01 07:3x 「사무실에서 나한테 개인 톡 보내는거 휴대폰으로 훅 알림 오게 하고싶은데」 · 「그리고 가능하면 애들 얼굴 붙여서 각각 오게하고 싶네.
//   단톡은 알림을 키고 끌구있으면 좋을듯 오프가 기본 갠톡은 온이 기본」 · 「단톡은 따로 내가 알림시 뜨는 이미지 설정할수잇고싶어」
//   서버 = 봄(GET·POST /api/office/notify · 그림 = /api/office/notify/img/<방>?v=<ts>) · 알림 판단·얼굴 붙이기도 서버 · 이 파일 = 앱이 읽는 꼴 하나(그림 줄이기는 ui 쪽)
export type NotifyRoom = { on?: boolean | null; image?: string | number | null };
export type NotifyState = { rooms: Record<string, NotifyRoom>; defaults: { dm: boolean; group: boolean } };

export const NOTIFY_DEFAULTS = { dm: true, group: false };   // 서버 defaults 가 안 오면 형 말 그대로(갠톡 켬 · 단톡 끔)

/** 지금 켜졌나 = 방에 정한 값 · 없으면(null 포함) 기본(1:1 = dm · 단톡 = group) */
export function notifyOn(s: NotifyState | undefined, room: string, dm: boolean): boolean {
  const on = s?.rooms?.[room]?.on;
  if (typeof on === "boolean") return on;
  const d = { ...NOTIFY_DEFAULTS, ...(s?.defaults || {}) };
  return dm ? d.dm : d.group;
}

/** 단톡 알림 그림 주소 · 없으면 "" — 서버 image = 주소(/·http) 면 그대로 · 판(숫자·글자) 이면 img/<방>?v=판 */
export function notifyImage(s: NotifyState | undefined, room: string): string {
  const v = s?.rooms?.[room]?.image;
  if (v === undefined || v === null || v === "" || v === false) return "";
  const t = String(v);
  if (t.startsWith("/") || /^https?:/.test(t)) return t;
  return `/api/office/notify/img/${encodeURIComponent(room)}?v=${encodeURIComponent(t)}`;
}

/** 받은 답을 화면 꼴로(빠진 칸 = 빈 값) */
export function notifyState(j: Partial<NotifyState> | undefined): NotifyState {
  return { rooms: (j && j.rooms) || {}, defaults: { ...NOTIFY_DEFAULTS, ...((j && j.defaults) || {}) } };
}
