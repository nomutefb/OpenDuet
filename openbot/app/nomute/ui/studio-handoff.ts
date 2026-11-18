// 카드 제작 → 영상 편집 · 유튜브 숏폼 넘김(번개 11-08 · 봄 09:33 나눔 「앱 카드 제작에 영상 편집 · 유튜브 링크 숏폼 길」 · 형 08:50 「ux나 사무실에 붙길 바라는중」)
//   옛 에디터 = 스튜디오 셸 viewer/index.html studioRoute(kind, payload) 가 탭 iframe(edit.html · ys.html)에 파일·링크를 넣어 줌(deliver · lrTiltApply · typeUrl)
//   앱 = 카드 제작 엔진이 앱 안(부모 창 없음)이라 그 두 단추가 숨겨졌음(engine p06-draft studioRouteFn) → 여기 window.__nmStudioRoute 가 그 자리
//   영상 = 편집 화면(앱 안에서 도는 옛 edit · ./video-editor.tsx)이 붙으면 옛 deliver 와 같은 꼴로 넣음 · 링크 = 유튜브 화면에 ?u= 로(옛 ys 가 ?u= 를 typeUrl 로 받음)

let pending: { file: File; at: number } | null = null;
export const EDIT = "/edit.html";   // 편집 화면의 원본 문서 길(화면이 「이 화면으로 넘겨 줘」 할 때 쓰는 이름 · 이제 파일을 읽지 않음 = 앱 안 ./old-pages/edit.gen)

/** 엔진이 부르는 손(window.__nmStudioRoute) — kind = video(파일) · link(유튜브 주소 · 비면 화면만) */
export function studioRoute(kind: string, payload?: unknown) {
  if (kind === "video") {
    if (payload instanceof File) pending = { file: payload, at: Date.now() };
    location.hash = "#/edvid";   // 서랍 「영상 편집」 = 옛 비디오 에디터 화면 그대로(./video-editor.tsx · 형 11-13 13:21) · 뜨면 deliverStudio 가 영상 넣음(앞 판 = #/web 한 겹 edit.html)
    return;
  }
  if (kind === "link") {
    const u = String(payload ?? "").trim();
    location.hash = u ? `#/edys?u=${encodeURIComponent(u)}` : "#/edys";   // 영상 편집 안 「유튜브」(형 11-14 · ./video-editor.tsx MODES · 앞 판 = #/web 한 겹 ys.html)
  }
}

/** 편집 화면이 붙으면 들고 있던 영상을 넣음(옛 index.html deliver 와 같은 차례 = #file 에 DataTransfer · lrTiltApply · change) · 60초 지난 파일은 안 넣음 · 9초 안에 함수가 안 서면 그만
 *  f = 앱 안에서 도는 편집 화면의 틀(./old-pages/frame.ts · 앞 판 = 품은 iframe 의 창) */
export function deliverStudio(f: { win: Record<string, unknown>; root: { getElementById: (id: string) => HTMLElement | null }; host: { isConnected: boolean } } | null) {
  if (!f || !pending || Date.now() - pending.at > 60_000) { if (pending && Date.now() - pending.at > 60_000) pending = null; return; }
  const { file } = pending;
  let n = 0;
  const tick = () => {
    if (!f.host.isConnected) return;   // 화면이 걷힘 = 그만
    try {
      const apply = f.win.lrTiltApply as ((x: File) => unknown) | undefined;
      if (typeof apply === "function") {
        const inp = f.root.getElementById("file") as HTMLInputElement | null;
        if (inp) { const dt = new DataTransfer(); dt.items.add(file); inp.files = dt.files; }
        void apply(file);
        inp?.dispatchEvent(new Event("change", { bubbles: true }));
        pending = null;
        return;
      }
    } catch { return; }
    if (n++ < 60) setTimeout(tick, 150);
  };
  tick();
}

/** 시험용 — 들고 있는 영상이 있나 */
export const pendingStudioFile = () => pending?.file ?? null;
