export type RoomRoutineMode = "hours" | "days" | "week";
// 루틴 「지침」 칸 = 걷음(봄 11-12 00:39 「가」 · 형 00:22 「글 하고 지침 따로 잇는데.뭐가 맞는지.봐줘 확실한 것만 남기고」 · 방 지침 = 방 설정 한 칸)
export type RoomRoutineForm = { mode: RoomRoutineMode; every: number; min: number; days: number; times: string[]; wd: number[]; text: string; on: boolean };

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
    : { wd: form.wd, times: form.times };
  try {
    return await mutate({ mode: form.mode, ...cycle, text: form.text.trim(), skip, on: form.on });
  } catch (error) {
    setSaving(false);
    throw error;
  }
}
