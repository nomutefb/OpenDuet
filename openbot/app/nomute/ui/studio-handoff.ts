// 카드 제작 → 영상 편집 · 유튜브 숏폼 넘김(번개 11-08 · 봄 09:33 나눔 「앱 카드 제작에 영상 편집 · 유튜브 링크 숏폼 길」 · 형 08:50 「ux나 사무실에 붙길 바라는중」)
//   옛 에디터 = 스튜디오 셸 viewer/index.html studioRoute(kind, payload) 가 탭 iframe(edit.html · ys.html)에 파일·링크를 넣어 줌(deliver · lrTiltApply · typeUrl)
//   앱 = 카드 제작 엔진이 앱 안(부모 창 없음)이라 그 두 단추가 숨겨졌음(engine p06-draft studioRouteFn) → 여기 window.__nmStudioRoute 가 그 자리
//   1단계 = 품기: 옛 화면을 #/web 한 겹(FramePage · 같은 출처)으로 열고, 영상은 화면이 뜨면 옛 deliver 와 같은 꼴로 넣음 · 링크는 ys.html?u= 로(에디터 ys.html 이 ?u= 를 typeUrl 로 받음)

let pending: { file: File; at: number } | null = null;
export const EDIT = "/edit.html";   // 옛 스튜디오 셸 THUMB_TABS 와 같은 주소(사이트 바탕 = viewer · 실제로 뜨는 길 = /edit · 앞 판 /viewer/edit.html = 없는 파일이라 옛 첫 화면(index)으로 떨어졌음 · 시아 11-13 라이브 실측)

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

/** 품은 edit.html 이 뜨면 들고 있던 영상을 넣음(옛 index.html deliver 와 같은 차례 = #file 에 DataTransfer · lrTiltApply · change) · 60초 지난 파일은 안 넣음 · 9초 안에 함수가 안 서면 그만 */
export function deliverStudio(el: HTMLIFrameElement | null) {
  if (!el || !pending || Date.now() - pending.at > 60_000) { if (pending && Date.now() - pending.at > 60_000) pending = null; return; }
  const { file } = pending;
  let n = 0;
  const tick = () => {
    let w: (Window & { lrTiltApply?: (f: File) => unknown }) | null = null;
    try { w = el.contentWindow as typeof w; if (!w || !/^\/(viewer\/)?edit(\.html)?$/.test(w.location.pathname)) { if (n++ < 60) setTimeout(tick, 150); return; } } catch { return; }   // 다른 출처 = 손 못 댐 = 그만
    try {
      if (typeof w.lrTiltApply === "function") {
        const inp = w.document.getElementById("file") as HTMLInputElement | null;
        if (inp) { const dt = new w.DataTransfer(); dt.items.add(file); inp.files = dt.files; }
        void w.lrTiltApply(file);
        inp?.dispatchEvent(new w.Event("change", { bubbles: true }));
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
