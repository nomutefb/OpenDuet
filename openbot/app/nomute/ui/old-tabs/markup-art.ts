// 만든 파일 — 손으로 고치지 말 것(ui/old-tabs/tools/gen-js.mjs art · 옛 에디터 viewer/index.html 의 기사 창 판 그대로)
//   기사 창 = 열린 채 칸 안에 박힘(뒤 막 · 닫기 × 없음) · 그 창이 여는 작은 창 넷(카드 변경 · 뉴스 수정 · 카드 수정 · 이미지 수정)은 원본처럼 위에 뜸
export const ART_HTML = `<dialog id="dlg" open aria-label="뉴스 요약">
  <div class="dlg-h"><div class="dlg-top"><a id="src" target="_blank" rel="noopener" title="원문 열기" aria-label="원문 열기"><svg class="src-ico" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path class="src-base" pathLength="1" d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><g class="src-arrow"><path class="src-shaft" pathLength="1" d="M10 14 21 3"/><path class="src-tip" d="M15 3h6v6"/></g></svg></a></div><div class="dlg-prog" id="dlgprog"></div></div>
  
  <div class="dlg-body" id="dlgbody">
  <details class="phase" id="ph-sum" open>
    <summary>1. 기사 요약 · 시사점</summary>
    <div class="md" id="mdbody"></div>
  </details>
  <details class="phase" id="ph-card" open>
    <summary id="cardsum">카드뉴스</summary>
    <div class="md" id="cardsec"></div>
  </details>
  <details class="phase" id="ph-feed" open hidden>
    <summary>3. 카드 뉴스</summary>
    <div class="md" id="feedsec"></div>
  </details>
  </div>
  
  <button class="rev-fab crev-fab" id="crevFab" type="button" aria-label="카드 수정" title="카드 수정">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg>
    <span class="rev-hint">카드 수정 중</span>
  </button>
</dialog><dialog id="editdlg">
  <div class="ed-h"><b class="ed-title">카드 변경</b><div class="askhead-act"><button class="ed-x" type="button" aria-label="닫기" data-oa-x="editdlg"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><path d="M6 6 18 18M18 6 6 18"/></svg></button></div></div>
  <div class="ed-body">
    <div class="ed-imgwrap"><img class="ed-img" alt=""><button class="ed-baf" type="button" hidden aria-label="전/후 비교 (탭하면 전환)" title="전/후 비교">후</button></div>
    <div class="ed-lblrow"><span class="ed-lbl">텍스트</span></div>
    <div class="edcardwrap"><div class="ed-chips" id="edChips" role="group" aria-label="텍스트 어절 — 탭하면 강조, 더블탭 수정"></div></div>
    <div class="ed-lblrow ed-wishrow"><label class="ed-lbl" for="edWish">이미지 수정</label><label class="ed-match"><input type="checkbox" id="edSync"><span class="ed-cbx"><svg class="ackm" viewBox="0 0 24 24" fill="none"><path class="sc-dash" d="M6 12h12"/><path class="sc-chk" d="M5 13l4 4L19 7"/></svg></span><span>텍스트 내용을 그대로 반영</span></label></div>
    <textarea class="ed-wish" id="edWish" placeholder="내용을 입력해주세요"></textarea>
  </div>
  <button class="dlgtop ed-top" id="edtop" type="button" aria-label="맨 위로" title="맨 위로"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V6M6 12l6-6 6 6"/></svg></button>
  <div class="ed-status" id="edStatus" aria-live="polite"></div>
  <div class="ed-foot"><label class="askattach edattach" id="edAttach" title="이미지 첨부 (4:5) — 첨부 후 탭하면 제거" aria-label="이미지 첨부"><svg class="edattach-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="8.5" cy="9.5" r="1.5"></circle><path d="M21 16l-5-5L5 20"></path></svg><img class="edattach-thumb" id="edAttachThumb" alt="" hidden><span class="askattach-badge" id="edAttachBadge" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></span><input id="edFile" type="file" accept="image/*" hidden></label><button class="ed-go" id="edGo" type="button"><span class="ed-ic"></span><span class="ed-tx">변경</span><svg class="gck" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7"/></svg></button><div class="ed-confirm"><span class="ed-cmsg">이 카드만 다시 생성할까요?</span><button class="ed-cno" type="button">취소</button><button class="ed-cyes" type="button">확인</button></div></div>
</dialog><dialog id="crevdlg" class="askdlg revdlg">
  <div class="askwrap">
    <div class="askhead"><b>카드 수정 요청</b><div class="revhead-act"><button class="asksend revsend" id="crevSend" type="button"><span>수정</span></button><button class="askx" id="crevX" type="button" aria-label="닫기"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><path d="M6 6 18 18M18 6 6 18"/></svg></button></div></div>
    <div class="asktawrap">
      <textarea id="crevText" class="askta" rows="2" placeholder="" autocapitalize="off" autocorrect="off" spellcheck="false"></textarea>
    </div>
  </div>
</dialog><dialog id="tredodlg" class="askdlg revdlg tredodlg">
  <div class="askwrap">
    <div class="askhead"><b>이미지 수정 요청</b><div class="revhead-act"><button class="asksend revsend" id="tredoSend" type="button"><span>수정</span></button><button class="askx" id="tredoX" type="button" aria-label="닫기"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><path d="M6 6 18 18M18 6 6 18"/></svg></button></div></div>
    <div class="asktawrap">
      <textarea id="tredoText" class="askta" rows="2" placeholder="" autocapitalize="off" autocorrect="off" spellcheck="false"></textarea>
    </div>
  </div>
</dialog>`;
