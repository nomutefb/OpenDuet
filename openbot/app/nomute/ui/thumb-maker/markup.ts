// 썸네일 생성기 판 — 원본 = 에디터 viewer/thumb.html <body> 1010~1295줄 + 6461~6469줄(origin/main ee27c47b) · 줄 그대로 · 주석만 뺌
//   React 가 손대지 않는 판(엔진 ./engine 이 원본처럼 직접 고침 · 클래스·id·aria 그대로 = 원본 CSS·엔진이 그대로 맞물림)
export const THUMB_HTML = `
<div class="wrap">
  <div class="tabs" id="tabs">
    <div class="tab" data-app="2">카드 제작</div>
    <div class="tab" data-app="7">편집</div>
    <div class="tab" data-app="6">AI 생성</div>
    <div class="tab" data-app="sp">특수</div>
  </div>
  <div class="panel">
    <div class="topdock" id="topDock">
    <div class="dockgrid" id="dockGrid">
    <div class="cpprev none" id="cpPrev">
      <div class="cpprev-box">
        <div class="cpprev-stage post" id="cpPrevStage"></div>
        <div class="cpprev-wait" id="cpPrevWait" hidden><span class="nm-load" data-orb="solving" data-label="제작중…"></span><span class="cpw-sec nm-shim" id="cpPrevSec"></span></div>
        <div id="iePrev" class="none"><div class="rsz-stage" id="rszStage"></div><div class="rsz-metric" id="rszMetric"></div></div>
      </div>
        <div class="trailwrap" id="cpRailWrap">
          <nav class="trail" id="cpZoomRail" aria-label="미리보기 확대">
            <button type="button" class="trail-i" id="cpZoom" aria-pressed="false" aria-label="미리보기 확대" title="탭=미리보기 확대 · 다시 탭=원상복귀"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/><path d="M8 11h6"/><path class="cpz-v" d="M11 8v6"/></svg></button>
          </nav>
          <nav class="trail trail-opts" id="cpRail" aria-label="미리보기 옵션">
          <span class="trail-g">
            <button type="button" class="cpv-tool" id="cpImgSwap" hidden aria-label="사진 첨부 — 탭=파일 선택" title="사진 첨부"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="8.5" cy="9.5" r="1.5"></circle><path d="M21 16l-5-5L5 20"></path></svg></button>
            <button type="button" class="cpv-tool" id="cpImgDel" hidden aria-label="사진 삭제" title="사진 삭제"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button>
            <button type="button" class="cpv-tool" id="cpVidGo" hidden aria-label="영상 — 영상 편집으로" title="영상 — 영상 편집으로 넘어가(영상 파일은 여기 끌어다 놓거나 사진 첨부로 골라도 그리 간다)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg></button><button type="button" class="cpv-tool" id="cpLinkGo" hidden aria-label="링크 — 유튜브로" title="링크 — 복사한 유튜브 링크로 숏폼 만들기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>
          </span>
          <span class="trail-div"></span>
          <div class="optstrip trail-v none" id="optStrip">
            <div class="gospec none" id="goSpec"><span class="gs-v gs-tog" id="gsBg" role="button" tabindex="0" aria-pressed="false" title="탭=켜기/끄기 — 켜짐=배경(흰칸 없는 버전) 추가">배경</span> <span class="gs-sep">|</span> <span class="gs-v on gs-tog" id="gsAbbr" role="button" tabindex="0" aria-pressed="true" title="탭=켜기/끄기 · 길게=축약 등록">축약</span> <span class="gs-sep">|</span> <span class="gs-v gs-tog" id="gsOvOnly" role="button" tabindex="0" aria-pressed="false" title="탭=켜기/끄기 — 켜짐=사진 위에 오버레이 레이어 합성 · 꺼짐=사진이 있어도 오버레이 레이어만">배경 합성</span><span id="gsPanWrap" hidden> <span class="gs-sep">|</span> <span class="gs-og" id="gsPanOg"><span class="gs-lbl">SIZE:</span> <span class="opa-slot"><span class="gs-v gs-tog gsop-step" id="gsPanDn" role="button" tabindex="0" data-d="-1" title="탭=축소(여백이 생기면 AI 채움 가능)">−</span><span class="gs-v on gs-tog" id="gsPanV" role="button" tabindex="0" title="사진 배치 = 드래그로 이동 · 휠(PC)·두 손가락(모바일)로 확대축소 · 더블탭=원상복귀 · 탭=원상복귀">100</span><span class="gs-v gs-tog gsop-step" id="gsPanUp" role="button" tabindex="0" data-d="1" title="탭=확대">+</span></span></span> <span class="gs-sep">|</span> <span class="gs-v gs-tog" id="gsPanFit" role="button" tabindex="0" title="탭=사진 전체가 틀 안에 들어오는 크기로(잘려나가는 부분 0) — 이때 생기는 여백은 아래 「AI 채움」으로">맞춤</span></span><span id="gsFillWrap" hidden> <span class="gs-sep">|</span> <span class="gs-v gs-tog" id="gsPanFill" role="button" tabindex="0" aria-pressed="false" title="탭=ON/OFF — ON이면 「생성」이 축소로 생긴 빈 여백을 이어 채운다(맞닿은 변이 단색이면 즉시·무과금으로 잇고, 복잡한 배경일 때만 AI(Gemini 3.1 Flash)가 이어 그린다 · 원본 픽셀은 어느 쪽이든 보존)">AI 채움</span></span><span id="gsMergeWrap" hidden> <span class="gs-sep">|</span> <span class="gs-v gs-tog" id="gsMerge" role="button" tabindex="0" aria-pressed="false" title="탭=켜기/끄기 — 켜짐=저작권(·안내문)을 산출물에 합쳐 렌더 · 꺼짐=따로 한 장">삽입구 합성</span></span> <span class="gs-sep">|</span> <span class="gs-og" id="gsOpaOg"><span class="gs-lbl">OPA:</span> <span id="gsOpas"></span></span> <span class="gs-sep">|</span> <span class="gs-v gs-tog" id="gsMos" role="button" tabindex="0" title="탭=모자이크 — 이 사진에서 피사체를 찾아 가린다">모자이크</span><span id="gsTrWrap" hidden> <span class="gs-sep">|</span> <span class="gs-v gs-tog" id="gsTr" role="button" tabindex="0" title="탭=번역 — 이 사진을 번역 판으로 넘긴다">번역</span></span></div>
          </div>
          <div class="dockopt trail-v none" id="editCol">
            <p class="dopt-h">기본</p>
            <div class="optcards" id="editSpec" role="group" aria-label="기본·옵션 — 비율·해상도·원본 보존·모자이크">
              <div class="scard"><div class="csec"><span class="nm">비율</span><span class="rsz-opts"><span class="ropt on gs-tog" id="esRsz" role="button" tabindex="0" title="탭=다음 비율(원본→4:5→9:16→16:9→1:1)"><span class="vv">원본</span></span></span><span class="opt-navs" aria-hidden="true"><button type="button" class="opt-nav" data-nav="esRsz" data-dir="-1" aria-label="이전 비율"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button><button type="button" class="opt-nav" data-nav="esRsz" data-dir="1" aria-label="다음 비율"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button></span></div></div>
              <div class="scard"><div class="csec"><span class="nm">해상도</span><span class="rsz-opts"><span class="ropt on gs-tog" id="esUps" role="button" tabindex="0" title="탭=다음 해상도(720p→FHD→2K→4K)"><span class="vv">FHD</span></span></span><span class="opt-navs" aria-hidden="true"><button type="button" class="opt-nav" data-nav="esUps" data-dir="-1" aria-label="이전 해상도"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button><button type="button" class="opt-nav" data-nav="esUps" data-dir="1" aria-label="다음 해상도"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button></span></div></div>
              <div class="scard none" id="esFillCard"><div class="csec"><span class="nm">채움</span><span class="rsz-opts"><span class="ropt on gs-tog" id="esFill" role="button" tabindex="0" title="탭=다음 채움(자동→단색→블러→AI) — 비율 확장 여백 채움 방식"><span class="vv">자동</span></span></span><span class="opt-navs" aria-hidden="true"><button type="button" class="opt-nav" data-nav="esFill" data-dir="-1" aria-label="이전 채움"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button><button type="button" class="opt-nav" data-nav="esFill" data-dir="1" aria-label="다음 채움"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button></span></div></div>
              <div class="scard"><div class="csec"><span class="rsz-opts"><span class="ropt tog on gs-tog none" id="esLock" role="button" tabindex="0" aria-pressed="true" title="탭=원본 픽셀 보존 켜기/끄기 — 끄면 원본 자리까지 모델 출력 그대로(더 자연스러워지지 않고 안전장치만 꺼진다)">보존</span></span></div></div>
              <p class="dopt-h">옵션</p>
              <div class="scard"><div class="csec"><span class="rsz-opts"><span class="ropt tog gs-tog" id="esIe" role="button" tabindex="0" aria-pressed="false" title="탭=켜기/끄기 — 켜짐=모자이크">모자이크</span></span></div>
            </div>
          </div>
        </nav>
        <div class="gowrap trail-fire">
          <button class="go" id="go">생성</button>
          <label class="chk go-abbr" id="abbrBox" title="이 → 李 · 윤 → 尹 · 미 → 美 · 줄 앞 중/북 → 中/北 · ... → ⋯"><input type="checkbox" id="abbr" checked><span class="cbox" aria-hidden="true"><svg class="ackm" viewBox="0 0 24 24" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path class="sc-dash" d="M6 12h12"/><path class="sc-chk" d="M5 13l4 4L19 7"/></svg></span> 축약</label>
        </div>
        </div>
    </div>
    </div>
    <div class="makerow" id="makeRow">
      <div id="imgBox" class="none">
        <label class="file" id="fileLab" aria-label="이미지 선택" title="탭해서 이미지 선택"><span class="filepic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 16l-5-5L5 20"/></svg></span>
          <input type="file" accept="image/*" id="file" style="display:none">
        </label>
      </div>
    </div>
    <div class="spellchips" id="spellChips" hidden></div>
    </div>
    <div id="opaBox" class="none">
      <label class="fl">투명도 (OPA)</label>
      <div class="seg" id="opaSeg">
        <button data-opa="58" class="on">58</button>
        <button data-opa="30">30</button>
        <button data-opa="custom" id="opaCustom"><span class="lab">직접입력</span><input type="text" id="opaNum" class="opa-in" inputmode="numeric" pattern="[0-9]*" maxlength="2" placeholder="OPA" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"></button>
      </div>
    </div>
    <div id="linesBox" class="none">
      <label class="fl">텍스트</label>
      <div class="covrow">
        <textarea id="lines" class="covta" placeholder=""></textarea>
        <div class="covimg" id="pImgSlot" role="button" tabindex="0" aria-label="배경 이미지 첨부"></div>
        <input type="file" accept="image/*" id="pFile" hidden>
      </div>
      <div class="gospec" id="postSpec"><span class="gs-bul">•</span> <span class="gs-v on gs-tog" id="psAbbr" role="button" tabindex="0" aria-pressed="true" title="탭=켜기/끄기 · 길게=축약 등록">축약</span> <span id="linesTrk" class="trk"></span></div>
    </div>
    <div id="reelsBox" class="none">
      <div id="rCombo">
        <input type="checkbox" id="cBg" hidden>
        <input type="file" accept="image/*" id="cFile" hidden>
        <div class="csec">헤더 <span id="cTplTog" class="tplnm" hidden>노뮤트</span><button type="button" class="cfold-chev" aria-expanded="true" aria-controls="cHdrSub" aria-label="헤더 접기·펼치기"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button></div>
        <div class="cfoldsub" id="cHdrSub"><div class="cfoldsub-in">
        <textarea id="cSub" class="cf cf-sub ta1l" rows="1" placeholder="부제" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"></textarea>
        <textarea id="cTitle" class="cf cf-title ta1l" rows="1" placeholder="제목" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"></textarea>
        <span id="cHdrTrk" class="trk cmtrk"></span>
        </div></div>
        <div class="csec">오버레이 <span class="ovsep">|</span> <span id="ovFmtTog" class="ovfmt post" role="button" tabindex="0" title="탭=포스트(4:5)↔릴스(9:16) · 자간 한도 다름(−45/−30) · 헤더 입력 중엔 릴스 고정">포스트</span><span class="fmt-why" id="ovFmtWhy" hidden>헤더가 있으면 릴스 고정</span> <span class="ovsep none" id="cnSep">|</span> <span class="onoff none" id="cnTog" role="button" tabindex="0" aria-pressed="false" title="탭=카드뉴스 입력(칩 조합·4:5) 켜기/끄기 — ON=글자 점등">카드뉴스</span><button type="button" class="cfold-chev" aria-expanded="true" aria-controls="cOvSub" aria-label="오버레이 접기·펼치기"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button></div>
        <div class="cfoldsub" id="cOvSub"><div class="cfoldsub-in">
        <div class="covrow">
          <div id="a2ChipsSlot"></div>
          <textarea id="cLines" class="covta" placeholder="강조는 별표로, 최대 3줄 가능"></textarea>
          <div class="covimg" id="cImgSlot" role="button" tabindex="0" aria-label="자막 이미지 첨부"></div>
        </div>
        <span id="cLinesTrk" class="trk cmtrk"></span>
        </div></div>
      </div>
    </div>
    <div id="copyBox" class="none">
      <div class="csec">포맷 <span id="cpFmtTog" class="ovfmt reels" role="button" tabindex="0" aria-label="포맷 — 탭=포스트↔릴스" title="탭=포스트(4:5)↔릴스(9:16)">릴스</span></div>
      <div class="csec"><span class="onoff on" id="copyTog" role="button" tabindex="0" aria-pressed="true" title="탭=저작권 켜기/끄기 — 켜짐=글자 점등">저작권</span></div>
      <div id="cpBlock">
      <div class="cphline" id="cphLine">
        <span class="cph-st">ⓒ&nbsp;</span><span class="cph-ed cph-yr" id="cphYear" contenteditable="true" inputmode="numeric" enterkeyhint="done" spellcheck="false" role="textbox" aria-label="연도" data-ph="2026" title="탭=연도 수정">2026</span><span class="cph-st">.&nbsp;</span><span class="cph-ed cph-nm" id="cphName" contenteditable="true" enterkeyhint="done" spellcheck="false" role="textbox" aria-label="계정명" data-ph="Anonymous" title="탭=이름 수정"></span><span class="cph-st">(</span><span id="cphPlat" class="cph-plat" data-plat="threads" role="button" tabindex="0" title="탭=플랫폼 순환(스레드·유튜브·X·인스타·플랫폼 없음·직접)">threads</span><span class="cph-st">).</span><span class="cph-br"></span><span class="cph-st">all rights reserved.</span>
      </div>
      <input type="text" id="cplat" class="none" placeholder="플랫폼 직접입력 (예: tiktok)" style="margin-top:8px" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">
      </div>
    </div>
    <span id="cardHome" hidden></span>
    <div id="cardBox" class="none">
      <div class="csec">텍스트 및 이미지</div>
      <div class="edwrap"><div class="ed-chips" id="edChips" aria-label="단어 — 탭하면 강조"></div></div>
    </div>
    <div class="csec none" id="rOptHead">옵션<button type="button" class="cfold-chev" aria-expanded="true" aria-controls="cOptSub" aria-label="옵션 접기·펼치기"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button></div>
    <div class="cfoldsub" id="cOptSub"><div class="cfoldsub-in">
    <div class="optcards" id="optCards">
    <div class="scard none" id="upsRow"><div class="csec"><span class="nm">해상도</span><span class="cysep">|</span><span class="rsz-opts optchips" id="upsOpts" role="group" aria-label="해상도 — 720p·FHD·2K·4K · AI 생성과 동일"><button type="button" class="ropt" data-v="720p">720p</button><button type="button" class="ropt on" data-v="FHD">FHD</button><button type="button" class="ropt" data-v="2K">2K</button><button type="button" class="ropt" data-v="4K">4K</button></span></div></div>
    <div class="scard none" id="fillRow"><div class="csec"><span class="nm">채움</span><span class="cysep">|</span><span class="rsz-opts optchips" id="fillOpts" role="group" aria-label="채움 — 자동·단색·블러·AI · 비율 확장 여백을 무엇으로 채울지"><button type="button" class="ropt on" data-v="auto">자동</button><button type="button" class="ropt" data-v="solid">단색</button><button type="button" class="ropt" data-v="blur">블러</button><button type="button" class="ropt" data-v="ai">AI</button></span></div></div>
    <div class="scard none" id="opaRow"><div class="csec"><span class="nm">OPA</span><span class="cysep">|</span><span class="rsz-opts optchips" id="opaChips" role="group" aria-label="오버레이 투명도 — 70부터 0까지 · 기본 60 · 2개까지 다중선택"><button type="button" class="ropt" data-v="70">70</button><span class="rsep" aria-hidden="true">|</span><button type="button" class="ropt on" data-v="60">60</button><span class="rsep" aria-hidden="true">|</span><button type="button" class="ropt" data-v="50">50</button><span class="rsep" aria-hidden="true">|</span><button type="button" class="ropt" data-v="40">40</button><span class="rsep" aria-hidden="true">|</span><button type="button" class="ropt" data-v="30">30</button><span class="rsep" aria-hidden="true">|</span><button type="button" class="ropt" data-v="20">20</button><span class="rsep" aria-hidden="true">|</span><button type="button" class="ropt" data-v="10">10</button><span class="rsep" aria-hidden="true">|</span><button type="button" class="ropt" data-v="0">0</button></span><span class="opa-navs" aria-hidden="true"><button type="button" class="opa-nav" data-dir="-1" aria-label="이전"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button><button type="button" class="opa-nav" data-dir="1" aria-label="다음"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button></span></div></div>
    <div class="scard none" id="ieTogRow"><div class="csec"><span class="onoff" id="ieTog" role="button" tabindex="0" aria-pressed="false" title="탭=피사체 모자이크 켜기/끄기 — 켜짐=발사가 피사체 찾기→모자이크(비율은 원본 유지) · 사진 첨부 후 활성 · 켜짐=글자 점등">모자이크</span></div></div>
    <div id="rszBox" class="scard none">
      <div class="csec"><span class="nm">비율</span><span class="cysep">|</span><span class="rsz-opts optchips" id="rszOpts" role="group" aria-label="비율 — 원본·4:5·9:16·16:9·1:1·직접 · 사진 첨부 후 활성"><button type="button" class="ropt on" data-v="orig">원본</button><button type="button" class="ropt" data-v="4:5">4:5</button><button type="button" class="ropt" data-v="9:16">9:16</button><button type="button" class="ropt" data-v="16:9">16:9</button><button type="button" class="ropt" data-v="1:1">1:1</button><button type="button" class="ropt" data-v="custom">직접</button><span class="rsz-ar none" id="rszArWrap"><input id="rszArW" class="rsz-ar-in" type="text" inputmode="numeric" maxlength="2" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="비율 가로값"><b class="rsz-ar-c" aria-hidden="true">:</b><input id="rszArH" class="rsz-ar-in" type="text" inputmode="numeric" maxlength="2" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="비율 세로값"><span class="rsz-ar-out" id="rszArOut"></span></span></span> <span class="ovsep none" id="rszSep">|</span> <span class="none" id="rszLockLbl"></span> <span class="onoff on none" id="rszLock" role="button" tabindex="0" aria-pressed="true" title="탭=원본 픽셀 보존 켜기/끄기 — 끄면 원본 자리까지 모델 출력 그대로(더 자연스러워지지 않고 안전장치만 꺼진다) · 켜짐=글자 점등">보존</span></div>
    </div>
    <div id="imgeditBox" class="none">
      <div class="ie-stage none" id="ieStage" aria-label="검출된 피사체 — 탭해서 지정"></div>
      <div class="gospec none" id="ieOpts">
        <span class="gs-lbl">굵기</span>: <span class="gs-v gs-tog ie-px" role="button" tabindex="0" data-px="6">굵게</span> <span class="gs-v gs-tog on ie-px" role="button" tabindex="0" data-px="9">보통</span> <span class="gs-v gs-tog ie-px" role="button" tabindex="0" data-px="14">곱게</span>
        <span style="color:var(--mut)"> | </span> <span class="gs-lbl">모양</span>: <span class="gs-v gs-tog on" id="ieShape" role="button" tabindex="0" title="탭=타원↔네모">타원</span>
      </div>
      <div class="ie-result none" id="ieResult"></div>
    </div>
    <div class="scard cpthumb-row none" id="cpThumbRow"><div class="csec"><span class="nm">저작권</span><span class="cysep">|</span><span id="cpThumbTog" class="ovfmt cpoff" role="button" tabindex="0" aria-label="저작권 — 탭=OFF↔릴스↔포스트" title="탭=OFF→릴스(9:16)→포스트(4:5)">OFF</span></div></div>
    <div id="cpThumbSlot"></div>
    <div class="none" id="gdArea">
      <div class="scard gsec" id="guideSec"><div class="csec"><span class="nm">안내문</span><span class="cysep">|</span><span class="onoff" id="guideTog" role="button" tabindex="0" aria-pressed="false" title="탭=OFF→경고→AI→자유문구 순환">OFF</span></div></div>
      <textarea id="warnLines" class="none" placeholder="안내문 텍스트"></textarea>
    </div>
    </div>
    </div></div>
    <div class="csec none" id="spHead">프리셋<button type="button" class="cfold-chev" aria-expanded="true" aria-controls="spSub" aria-label="프리셋 접기·펼치기"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button></div>
    <div class="cfoldsub none" id="spSub"><div class="cfoldsub-in"><div class="optcards">
      <div class="scard sp-slot"><div class="csec"><span class="onoff" role="button" tabindex="0" aria-pressed="false" title="탭=켜기/끄기 — 사진을 포스트(4:5) 판형으로(원본 보존 · 여백 자동 채움)">프리셋 1</span><span class="sp-note">포스트 4:5</span></div></div>
      <div class="scard sp-slot"><div class="csec"><span class="onoff" role="button" tabindex="0" aria-pressed="false" title="탭=켜기/끄기 — 사진을 릴스(9:16) 판형으로(원본 보존 · 여백 자동 채움)">프리셋 2</span><span class="sp-note">릴스 9:16</span></div></div>
    </div></div></div>
  </div>
  <div class="out">
    <div class="status" id="status"></div>
    <button class="hist-h car-h" id="carH" type="button" aria-expanded="true">
      <span class="hist-ttl"><span class="car-bul" aria-hidden="true">•</span>결과 <span class="hist-cnt" id="carHCnt">(0)</span></span>
      <svg class="hist-ar" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
    </button>
    <div class="jobs" id="jobs"></div>
    <div class="wips" id="wips"></div>
    <div class="carbar" id="carbar" hidden><span class="carcount" id="carcount"></span></div>
    <div class="carwrap" id="carwrap" hidden>
      <div class="cartrackwrap">
        <div class="cartrack" id="cartrack"></div>
        <button class="carnav prev" id="carPrev" type="button" aria-label="이전"></button>
        <button class="carnav next" id="carNext" type="button" aria-label="다음"></button>
      </div>
    </div>
    <div class="hist-empty" id="carEmpty">아직 제작한 게 없습니다</div>
    <div class="hist" id="hist">
      <button class="hist-h" id="histH" type="button" aria-expanded="false">
        <span class="hist-ttl"><span class="hist-bul" aria-hidden="true">•</span>이전 제작 <span class="hist-cnt" id="histCnt">(0)</span></span>
        <span class="hist-note">전 기기 제작 내역</span>
        <svg class="hist-ar" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="hist-body" id="histBody" hidden>
        <div class="hist-empty" id="histEmpty" hidden>아직 제작한 게 없습니다</div>
        <div class="hist-tools" id="histTools"><button class="hist-clr" id="histClr" type="button">기록 지우기</button></div>
        <div class="hist-grid" id="histGrid"></div>
      </div>
    </div>
  </div>
</div>
<dialog id="cfmdlg" class="cfm">
  <div class="cfm-in">
    <div class="cfm-msg" id="cfmMsg"></div>
    <div class="cfm-bot">
      <button class="cfm-btn" id="cfmNo" type="button">취소</button>
      <button class="cfm-btn go2" id="cfmYes" type="button">진행</button>
    </div>
  </div>
</dialog>
<dialog id="abbrDlg" class="abdlg">
  <div class="abdlg-in">
    <button class="dlg-x" id="abbrX" type="button" aria-label="닫기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6 18 18M18 6 6 18"/></svg></button>
    <div class="abdlg-h">축약어 등록</div>
    <div class="abdlg-note"><b>기본</b> 표시 5종은 항상 적용(수정·삭제 불가). 그 아래 <b>+ 추가</b>로 직접 등록 — <b>축약 전</b>에 <u>앞뒤 글자까지</u> 넣어 범위를 정함(예: <code>군 </code>→<code>軍 </code>, 또는 <code>군,</code>→<code>軍,</code>).</div>
    <div class="abdlg-tbl" id="abbrTbl">
      <div class="abrow abhd"><span class="abno">no</span><span>축약 전</span><span>축약 후</span><span class="abdelh">삭제</span></div>
    </div>
    <button class="abadd" id="abbrAdd" type="button">+ 추가</button>
  </div>
</dialog>
<button id="histRemote" type="button" aria-label="이전 제작 접기">접기</button>
<div id="rfab" aria-label="빠른 메뉴">
  <button class="ro" id="rfab2" type="button" title="전환/이동"><svg viewBox="0 0 24 24"><path d="M7 10l5-5 5 5M7 14l5 5 5-5"/></svg></button>
  <button class="ro" id="rfab3" type="button" title="이미지 선택"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 16l-5-5L5 20"/></svg></button>
  <button class="ro" id="rfabGen" type="button" title="생성" hidden><svg viewBox="0 0 24 24"><path d="M5 3l14 9-14 9z"/></svg></button>
  <button class="ro" id="rfab4" type="button" title="도구 전환"><svg viewBox="0 0 24 24"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg></button>
  <button class="rc" id="rfabCore" type="button" aria-label="빠른 메뉴 열기"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>
  <button class="rmin" id="rfabMin" type="button" aria-label="최소화" title="최소화 (창 접기)"><svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg></button>
</div>
`;
