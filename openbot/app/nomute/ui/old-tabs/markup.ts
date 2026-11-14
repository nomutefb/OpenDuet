// 만든 파일 — 손으로 고치지 말 것(ui/old-tabs/tools/gen-js.mjs · 옛 에디터 viewer/index.html 의 그 칸 그대로)
//   머리 줄(시각 · 새로고침 · 실검 띠)은 안 가져옴 · 출처 바꿈 단추만 맨 위 오른쪽 · 시각 칸(#vhTimeTxt)은 엔진이 값을 적어서 숨긴 채 둠
export const CHAN_HTML = `<div class="ot-top"><span class="vh-time" id="vhTime"><span id="vhTimeTxt"></span></span><span class="ch-srcsw" id="chanSrcSeg"><button type="button" id="chanSrcTgl" data-cs="ig" class="on" aria-label="채널 소스: 현재 인스타 — 탭하면 페이스북"><span class="cs-rail" aria-hidden="true"><svg class="cs-ic" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5.4"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg><svg class="cs-ic" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg><svg class="cs-ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg><svg class="cs-ic" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></span></button></span></div><section class="chanview" id="chanview"><div id="chanBox"></div></section><dialog id="chdaydlg" aria-label="일별 상세">
  <div class="modal-head"><b>일별 상세</b><span class="chd-n" id="chdN"></span><button class="tool-x dlg-x" type="button" aria-label="닫기" title="닫기"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6 18 18M18 6 6 18"/></svg></button></div>
  <div class="chd-body" id="chdBody"></div>
</dialog><dialog id="chpostdlg" aria-label="게시물 탐색">
  <div class="modal-head"><b>게시물 탐색</b><span class="chd-n" id="chpN"></span><button class="tool-x dlg-x" type="button" aria-label="닫기" title="닫기"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6 18 18M18 6 6 18"/></svg></button></div>
  <div class="chp-fl"><span class="ch-rangeseg" id="chpSort"></span></div>
  <div class="chp-fl" id="chpFmt"></div>
  <div class="chp-fl" id="chpCat"></div>
  <div class="chp-list" id="chpList"></div>
</dialog>`;
export const SNS_HTML = `<span id="vhTime" hidden><span id="vhTimeTxt"></span></span><section class="trendview" id="trendview"><div id="snsTrends"></div><section class="snsview" id="snsview" hidden><div id="snsList"></div></section></section>`;
