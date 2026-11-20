export type RoomRoutineMode = "hours" | "days" | "week" | "follow";   // follow = 수집 따라감(서버 _roomtimer.js · 형 11-20 13:40 「하드코딩하지말고, 수집 시각에 항상 맞춰줘」 · 시각 = 윈A 시계가 셈)
// 루틴 「지침」 칸 = 걷음(봄 11-12 00:39 「가」 · 형 00:22 「글 하고 지침 따로 잇는데.뭐가 맞는지.봐줘 확실한 것만 남기고」 · 방 지침 = 방 설정 한 칸)
export type RoomRoutineForm = { mode: RoomRoutineMode; every: number; min: number; days: number; times: string[]; wd: number[]; text: string; on: boolean; follow?: string; only?: string[] };

/** 성공 때는 GoButton의 체크가 끝나 창을 닫을 때까지 잠금 유지. 실패만 잠금을 푼다. */
export async function saveRoomRoutine<T>(
  form: RoomRoutineForm,
  skip: string[],
  mutate: (body: Record<string, unknown>) => Promise<T>,
  setSaving: (saving: boolean) => void,
): Promise<T> {
  setSaving(true);
  const cycle = form.mode === "hours" ? { every: form.every, min: form.min }
    : form.mode === "days" ? { days: form.days, times: form.times }
    : form.mode === "follow" ? { follow: form.follow, every: form.every, times: form.times }   // 따라감 꼴 그대로(서버 = follow · every 30~720분 · times = 시계가 셈한 회차 · 시아 11-21 05:53 「루틴 창이 follow 꼴을 몰라서 형이 밥상 루틴 열어 저장하면 400」)
    : { wd: form.wd, times: form.times };
  try {
    return await mutate({ mode: form.mode, ...cycle, text: form.text.trim(), skip, ...(form.only?.length ? { only: form.only } : {}), on: form.on });   // only(받을 이만) = 있던 그대로 실어 보냄(안 실으면 서버가 지움)
  } catch (error) {
    setSaving(false);
    throw error;
  }
}
