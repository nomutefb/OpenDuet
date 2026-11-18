// @ts-nocheck
/* 만든 파일 — 손으로 고치지 말 것(ui/old-pages/tools/gen.mjs · 옛 에디터 viewer 의 edit.html 화면)
   원본 = edit.html + tokens.css · nm-shared.css · nm-cards.css · nm-hist.css · nm-job.css · nm-clip.css · nm-input.css · nm-scene-tokens.css · nm-scene.css + nm-wave.js · nm-scene.js · nm-svg.js · nm-ua.js · nm-rail.js · nm-jobs.js · nm-clip.js · nm-sync.js · nm-loader.js · nm-gauge.js · nm-snap.js · nm-alpha.js · upload.js · cscroll.js */
import { SHEETS, FONTS } from "./css.gen";
import { LIB } from "./lib.gen";
function inline1(window, document, __nm) {
if (window.self !== window.top) document.documentElement.classList.add('inmodal');
}
function inline2(window, document, __nm) {
if (/[?&]mode=bestcut(?:&|$)/.test(window.location.search)) document.documentElement.classList.add('bestcut');
}
function inline3(window, document, __nm) {
__nm.ex({"EDIT_STATS":[()=>EDIT_STATS,(v)=>{EDIT_STATS=v;}],"$":[()=>$],"$$":[()=>$$],"esc":[()=>esc],"X_SVG":[()=>X_SVG],"PEND_KEY":[()=>PEND_KEY],"BC_MODE":[()=>BC_MODE],"_ftRun":[()=>_ftRun,(v)=>{_ftRun=v;}],"goBtn":[()=>goBtn],"upBtn":[()=>upBtn],"API":[()=>API],"BUDGET":[()=>BUDGET],"RESUME_MAX_MS":[()=>RESUME_MAX_MS],"LEN_HARD":[()=>LEN_HARD],"LEN_STT":[()=>LEN_STT],"LEN_WHOLE":[()=>LEN_WHOLE],"FILE_B64":[()=>FILE_B64,(v)=>{FILE_B64=v;}],"FILE_NAME":[()=>FILE_NAME,(v)=>{FILE_NAME=v;}],"FILE_URL":[()=>FILE_URL,(v)=>{FILE_URL=v;}],"_dur":[()=>_dur,(v)=>{_dur=v;}],"USER_ACT":[()=>USER_ACT,(v)=>{USER_ACT=v;}],"_pollLive":[()=>_pollLive,(v)=>{_pollLive=v;}],"_polling":[()=>_polling,(v)=>{_polling=v;}],"EDIT_ID":[()=>EDIT_ID,(v)=>{EDIT_ID=v;}],"RESULT_URL":[()=>RESULT_URL,(v)=>{RESULT_URL=v;}],"FILE_R2":[()=>FILE_R2,(v)=>{FILE_R2=v;}],"_lastFile":[()=>_lastFile,(v)=>{_lastFile=v;}],"_varea":[()=>_varea,(v)=>{_varea=v;}],"_vw":[()=>_vw,(v)=>{_vw=v;}],"_vh":[()=>_vh,(v)=>{_vh=v;}],"pendSet":[()=>pendSet],"pendGet":[()=>pendGet],"pendClear":[()=>pendClear],"LR_TILT_DB":[()=>LR_TILT_DB],"LR_PROBE_MAX":[()=>LR_PROBE_MAX],"LR_TILT":[()=>LR_TILT,(v)=>{LR_TILT=v;}],"LR_TILT_VAL":[()=>LR_TILT_VAL,(v)=>{LR_TILT_VAL=v;}],"lrTiltProbe":[()=>lrTiltProbe,(v)=>{lrTiltProbe=v;}],"lrTiltApply":[()=>lrTiltApply,(v)=>{lrTiltApply=v;}],"ORDER":[()=>ORDER],"CARD":[()=>CARD],"ON":[()=>ON,(v)=>{ON=v;}],"SCAN_ONCE":[()=>SCAN_ONCE,(v)=>{SCAN_ONCE=v;}],"CUT_REF":[()=>CUT_REF,(v)=>{CUT_REF=v;}],"P":[()=>P,(v)=>{P=v;}],"OPEN":[()=>OPEN,(v)=>{OPEN=v;}],"SUBPRE":[()=>SUBPRE],"preOn":[()=>preOn],"OC_DEF":[()=>OC_DEF],"OC_LBL":[()=>OC_LBL],"FONT_PV":[()=>FONT_PV],"_ocRGB":[()=>_ocRGB],"ocRGB":[()=>ocRGB,(v)=>{ocRGB=v;}],"_gfPre":[()=>_gfPre,(v)=>{_gfPre=v;}],"loadPvFont":[()=>loadPvFont,(v)=>{loadPvFont=v;}],"sum":[()=>sum,(v)=>{sum=v;}],"SUBSTY":[()=>SUBSTY],"SUBSTY_L":[()=>SUBSTY_L],"TONE_OPTS":[()=>TONE_OPTS],"SLANG_OPTS":[()=>SLANG_OPTS],"toneFix":[()=>toneFix],"pc":[()=>pc],"segs":[()=>segs,(v)=>{segs=v;}],"srow":[()=>srow],"snapRow":[()=>snapRow],"snapLine":[()=>snapLine],"SWAX_L":[()=>SWAX_L],"SWAX_SEL":[()=>SWAX_SEL,(v)=>{SWAX_SEL=v;}],"SWDEF":[()=>SWDEF],"SWSNAP":[()=>SWSNAP,(v)=>{SWSNAP=v;}],"swIsDef":[()=>swIsDef],"swdefrow":[()=>swdefrow],"swrow":[()=>swrow,(v)=>{swrow=v;}],"srcRatio":[()=>srcRatio],"px1":[()=>px1],"inkBotEqTop":[()=>inkBotEqTop,(v)=>{inkBotEqTop=v;}],"runBottom":[()=>runBottom,(v)=>{runBottom=v;}],"srcLineMirror":[()=>srcLineMirror,(v)=>{srcLineMirror=v;}],"subLineMirror":[()=>subLineMirror,(v)=>{subLineMirror=v;}],"gvTxt":[()=>gvTxt],"gauge":[()=>gauge,(v)=>{gauge=v;}],"prm":[()=>prm,(v)=>{prm=v;}],"etaCalc":[()=>etaCalc,(v)=>{etaCalc=v;}],"etaTxt":[()=>etaTxt,(v)=>{etaTxt=v;}],"setEta":[()=>setEta,(v)=>{setEta=v;}],"IA":[()=>IA],"CYC":[()=>CYC],"CYL":[()=>CYL],"HALF":[()=>HALF],"AXNM":[()=>AXNM],"curCyc":[()=>curCyc,(v)=>{curCyc=v;}],"cyv":[()=>cyv,(v)=>{cyv=v;}],"updateOptStrip":[()=>updateOptStrip,(v)=>{updateOptStrip=v;}],"setAxis":[()=>setAxis,(v)=>{setAxis=v;}],"CARDAX":[()=>CARDAX],"RES_LADDER":[()=>RES_LADDER],"resChips":[()=>resChips,(v)=>{resChips=v;}],"hdChips":[()=>hdChips],"SEG_MAX":[()=>SEG_MAX],"_segHold":[()=>_segHold,(v)=>{_segHold=v;}],"segsReset":[()=>segsReset],"pvSegs":[()=>pvSegs,(v)=>{pvSegs=v;}],"tlSegsHtml":[()=>tlSegsHtml],"tlRuler":[()=>tlRuler,(v)=>{tlRuler=v;}],"trimBody":[()=>trimBody,(v)=>{trimBody=v;}],"CUTLV":[()=>CUTLV],"cutBody":[()=>cutBody,(v)=>{cutBody=v;}],"hlRow":[()=>hlRow,(v)=>{hlRow=v;}],"resNote":[()=>resNote,(v)=>{resNote=v;}],"cardHtml":[()=>cardHtml,(v)=>{cardHtml=v;}],"CHEV_DN":[()=>CHEV_DN],"CHEV_UP":[()=>CHEV_UP],"ACC_OPEN":[()=>ACC_OPEN],"accSum":[()=>accSum,(v)=>{accSum=v;}],"accShell":[()=>accShell,(v)=>{accShell=v;}],"accCard":[()=>accCard,(v)=>{accCard=v;}],"_accMorph":[()=>_accMorph,(v)=>{_accMorph=v;}],"chevTo":[()=>chevTo,(v)=>{chevTo=v;}],"accSet":[()=>accSet,(v)=>{accSet=v;}],"accDodge":[()=>accDodge,(v)=>{accDodge=v;}],"dockClearSync":[()=>dockClearSync,(v)=>{dockClearSync=v;}],"dockGeoSync":[()=>dockGeoSync,(v)=>{dockGeoSync=v;}],"secCards":[()=>secCards,(v)=>{secCards=v;}],"render":[()=>render,(v)=>{render=v;}],"_dockHold":[()=>_dockHold,(v)=>{_dockHold=v;}],"_srcSig":[()=>_srcSig,(v)=>{_srcSig=v;}],"resSig":[()=>resSig,(v)=>{resSig=v;}],"dockSync":[()=>dockSync,(v)=>{dockSync=v;}],"PENDACT":[()=>PENDACT,(v)=>{PENDACT=v;}],"PEND_TTL":[()=>PEND_TTL],"hasSrc":[()=>hasSrc,(v)=>{hasSrc=v;}],"armAfterAttach":[()=>armAfterAttach,(v)=>{armAfterAttach=v;}],"pvSync":[()=>pvSync,(v)=>{pvSync=v;}],"pvBlurBg":[()=>pvBlurBg,(v)=>{pvBlurBg=v;}],"renderSheet":[()=>renderSheet,(v)=>{renderSheet=v;}],"tlDraw":[()=>tlDraw,(v)=>{tlDraw=v;}],"_preN":[()=>_preN,(v)=>{_preN=v;}],"_preSet":[()=>_preSet,(v)=>{_preSet=v;}],"_preManual":[()=>_preManual,(v)=>{_preManual=v;}],"PREC":[()=>PREC],"MYPRE_K":[()=>MYPRE_K],"MYPRE":[()=>MYPRE,(v)=>{MYPRE=v;}],"myPreStore":[()=>myPreStore],"_mpT":[()=>_mpT,(v)=>{_mpT=v;}],"swSet":[()=>swSet,(v)=>{swSet=v;}],"doCyc":[()=>doCyc,(v)=>{doCyc=v;}],"openSheet":[()=>openSheet,(v)=>{openSheet=v;}],"closeSheet":[()=>closeSheet,(v)=>{closeSheet=v;}],"dlWhereHint":[()=>dlWhereHint,(v)=>{dlWhereHint=v;}],"recipe":[()=>recipe,(v)=>{recipe=v;}],"XTR_SCAN":[()=>XTR_SCAN,(v)=>{XTR_SCAN=v;}],"XTR_SCAN_ID":[()=>XTR_SCAN_ID,(v)=>{XTR_SCAN_ID=v;}],"XTR_SCAN_T0":[()=>XTR_SCAN_T0,(v)=>{XTR_SCAN_T0=v;}],"_xscTick":[()=>_xscTick,(v)=>{_xscTick=v;}],"xscTick":[()=>xscTick,(v)=>{xscTick=v;}],"XTR_GRP":[()=>XTR_GRP,(v)=>{XTR_GRP=v;}],"_xcolTok":[()=>_xcolTok],"XCOL_HEX":[()=>XCOL_HEX],"XCOL_CSS":[()=>XCOL_CSS],"XTR_ACT":[()=>XTR_ACT,(v)=>{XTR_ACT=v;}],"XTR_FACES":[()=>XTR_FACES,(v)=>{XTR_FACES=v;}],"XTR_BOX":[()=>XTR_BOX],"XTR_BOX_MAX":[()=>XTR_BOX_MAX],"XTR_JOBSRC":[()=>XTR_JOBSRC],"XTR_SRC":[()=>XTR_SRC,(v)=>{XTR_SRC=v;}],"XTR_RUN":[()=>XTR_RUN],"xtrKey":[()=>xtrKey,(v)=>{xtrKey=v;}],"xtrAll":[()=>xtrAll,(v)=>{xtrAll=v;}],"xtrWrite":[()=>xtrWrite,(v)=>{xtrWrite=v;}],"xtrSave":[()=>xtrSave,(v)=>{xtrSave=v;}],"xtrSync":[()=>xtrSync,(v)=>{xtrSync=v;}],"xtrFaces":[()=>xtrFaces,(v)=>{xtrFaces=v;}],"xtrScanSet":[()=>xtrScanSet,(v)=>{xtrScanSet=v;}],"xtrJobSet":[()=>xtrJobSet,(v)=>{xtrJobSet=v;}],"xtrJobKey":[()=>xtrJobKey,(v)=>{xtrJobKey=v;}],"JOB_CFG":[()=>JOB_CFG],"JOB_CFG_MAX":[()=>JOB_CFG_MAX],"jobCfgSet":[()=>jobCfgSet,(v)=>{jobCfgSet=v;}],"jobCfgGet":[()=>jobCfgGet,(v)=>{jobCfgGet=v;}],"jobCfgApply":[()=>jobCfgApply,(v)=>{jobCfgApply=v;}],"XTR":[()=>XTR],"renderXtr":[()=>renderXtr,(v)=>{renderXtr=v;}],"tkApi":[()=>tkApi,(v)=>{tkApi=v;}],"tkFetch":[()=>tkFetch,(v)=>{tkFetch=v;}],"tkCrop":[()=>tkCrop,(v)=>{tkCrop=v;}],"tkImgFb":[()=>tkImgFb,(v)=>{tkImgFb=v;}],"xtrScan":[()=>xtrScan,(v)=>{xtrScan=v;}],"xgPut":[()=>xgPut,(v)=>{xgPut=v;}],"xgWireDrag":[()=>xgWireDrag,(v)=>{xgWireDrag=v;}],"xtrOpts":[()=>xtrOpts,(v)=>{xtrOpts=v;}],"xoCap":[()=>xoCap],"FILE_ICON":[()=>FILE_ICON],"fileSlotName":[()=>fileSlotName],"upMirror":[()=>upMirror],"fileSlotPct":[()=>fileSlotPct],"fileSlotClear":[()=>fileSlotClear],"B64_MAX":[()=>B64_MAX],"_uploading":[()=>_uploading,(v)=>{_uploading=v;}],"legacyRead":[()=>legacyRead,(v)=>{legacyRead=v;}],"AR_NUM":[()=>AR_NUM],"SIZE_BASE":[()=>SIZE_BASE],"outAr":[()=>outAr,(v)=>{outAr=v;}],"sizeFor":[()=>sizeFor],"POS_BASE":[()=>POS_BASE],"POS_WIDE":[()=>POS_WIDE],"posFor":[()=>posFor],"posAuto":[()=>posAuto,(v)=>{posAuto=v;}],"sizeAuto":[()=>sizeAuto,(v)=>{sizeAuto=v;}],"_fit":[()=>_fit,(v)=>{_fit=v;}],"_posSnap":[()=>_posSnap,(v)=>{_posSnap=v;}],"cropLayout":[()=>cropLayout,(v)=>{cropLayout=v;}],"syncVposUI":[()=>syncVposUI,(v)=>{syncVposUI=v;}],"scrubOpen":[()=>scrubOpen,(v)=>{scrubOpen=v;}],"scrubClose":[()=>scrubClose,(v)=>{scrubClose=v;}],"errStatus":[()=>errStatus,(v)=>{errStatus=v;}],"fmtT":[()=>fmtT],"_goFT2":[()=>_goFT2,(v)=>{_goFT2=v;}],"_goFT3":[()=>_goFT3,(v)=>{_goFT3=v;}],"goFireStart":[()=>goFireStart,(v)=>{goFireStart=v;}],"goFireOk":[()=>goFireOk,(v)=>{goFireOk=v;}],"goBusy":[()=>goBusy,(v)=>{goBusy=v;}],"goUpBusy":[()=>goUpBusy,(v)=>{goUpBusy=v;}],"goUpDone":[()=>goUpDone,(v)=>{goUpDone=v;}],"goFireDone":[()=>goFireDone,(v)=>{goFireDone=v;}],"goFireFail":[()=>goFireFail,(v)=>{goFireFail=v;}],"_firing":[()=>_firing,(v)=>{_firing=v;}],"goHeal":[()=>goHeal,(v)=>{goHeal=v;}],"fireSegs":[()=>fireSegs,(v)=>{fireSegs=v;}],"buildOpts":[()=>buildOpts,(v)=>{buildOpts=v;}],"editLbl":[()=>editLbl,(v)=>{editLbl=v;}],"pollEdit":[()=>pollEdit,(v)=>{pollEdit=v;}],"pollEditBg":[()=>pollEditBg,(v)=>{pollEditBg=v;}],"LY_SEGS":[()=>LY_SEGS,(v)=>{LY_SEGS=v;}],"LY_ORIG":[()=>LY_ORIG,(v)=>{LY_ORIG=v;}],"LY_MD":[()=>LY_MD,(v)=>{LY_MD=v;}],"LY_ID":[()=>LY_ID,(v)=>{LY_ID=v;}],"LY_OUT":[()=>LY_OUT,(v)=>{LY_OUT=v;}],"LY_LANG":[()=>LY_LANG,(v)=>{LY_LANG=v;}],"LY_PENDING_SEGS":[()=>LY_PENDING_SEGS,(v)=>{LY_PENDING_SEGS=v;}],"LY_RENDERING":[()=>LY_RENDERING,(v)=>{LY_RENDERING=v;}],"LY_PEND":[()=>LY_PEND,(v)=>{LY_PEND=v;}],"LY_MEDIA_URL":[()=>LY_MEDIA_URL,(v)=>{LY_MEDIA_URL=v;}],"LY_FINDT":[()=>LY_FINDT,(v)=>{LY_FINDT=v;}],"LY_GEN":[()=>LY_GEN,(v)=>{LY_GEN=v;}],"LY_SEQ":[()=>LY_SEQ,(v)=>{LY_SEQ=v;}],"LY_CUR":[()=>LY_CUR,(v)=>{LY_CUR=v;}],"LY_SAVE_T":[()=>LY_SAVE_T,(v)=>{LY_SAVE_T=v;}],"LY_EARLY":[()=>LY_EARLY,(v)=>{LY_EARLY=v;}],"LY_RESTORE_PEND":[()=>LY_RESTORE_PEND,(v)=>{LY_RESTORE_PEND=v;}],"LY_LAST_KEY":[()=>LY_LAST_KEY],"LY_EDIT_PRE":[()=>LY_EDIT_PRE],"LY_RM":[()=>LY_RM],"LYX_SVG":[()=>LYX_SVG],"SPLIT_SVG":[()=>SPLIT_SVG],"fmtClock":[()=>fmtClock,(v)=>{fmtClock=v;}],"srtTime":[()=>srtTime,(v)=>{srtTime=v;}],"lyJoin":[()=>lyJoin],"lySegText":[()=>lySegText],"lyModel":[()=>lyModel,(v)=>{lyModel=v;}],"lySaveNow":[()=>lySaveNow,(v)=>{lySaveNow=v;}],"lySave":[()=>lySave,(v)=>{lySave=v;}],"lyPrune":[()=>lyPrune,(v)=>{lyPrune=v;}],"LY_UNDO":[()=>LY_UNDO,(v)=>{LY_UNDO=v;}],"LY_UNDO_T":[()=>LY_UNDO_T,(v)=>{LY_UNDO_T=v;}],"lyUndoCap":[()=>lyUndoCap,(v)=>{lyUndoCap=v;}],"lyUndoNow":[()=>lyUndoNow,(v)=>{lyUndoNow=v;}],"lyUndoExpire":[()=>lyUndoExpire,(v)=>{lyUndoExpire=v;}],"lyUndoOffer":[()=>lyUndoOffer,(v)=>{lyUndoOffer=v;}],"lyLand":[()=>lyLand,(v)=>{lyLand=v;}],"LY_FILLERS":[()=>LY_FILLERS],"lyFillerKey":[()=>lyFillerKey,(v)=>{lyFillerKey=v;}],"lyIsFiller":[()=>lyIsFiller,(v)=>{lyIsFiller=v;}],"LY_USRSCROLL":[()=>LY_USRSCROLL,(v)=>{LY_USRSCROLL=v;}],"LY_BASE":[()=>LY_BASE,(v)=>{LY_BASE=v;}],"lyHash":[()=>lyHash],"lyStrip":[()=>lyStrip],"lyKo":[()=>lyKo,(v)=>{lyKo=v;}],"lyEffSegs":[()=>lyEffSegs,(v)=>{lyEffSegs=v;}],"lyEffHash":[()=>lyEffHash],"lyBaseOf":[()=>lyBaseOf,(v)=>{lyBaseOf=v;}],"lyEdited":[()=>lyEdited],"lySubsRaw":[()=>lySubsRaw,(v)=>{lySubsRaw=v;}],"lyGetJson":[()=>lyGetJson,(v)=>{lyGetJson=v;}],"lyFetchSegs":[()=>lyFetchSegs,(v)=>{lyFetchSegs=v;}],"lyOrigRaw":[()=>lyOrigRaw,(v)=>{lyOrigRaw=v;}],"lyRebase":[()=>lyRebase,(v)=>{lyRebase=v;}],"lyResult":[()=>lyResult,(v)=>{lyResult=v;}],"renderResult":[()=>renderResult,(v)=>{renderResult=v;}],"lyTab":[()=>lyTab,(v)=>{lyTab=v;}],"lyHideEditor":[()=>lyHideEditor,(v)=>{lyHideEditor=v;}],"lyToggleChip":[()=>lyToggleChip,(v)=>{lyToggleChip=v;}],"lyEditChip":[()=>lyEditChip,(v)=>{lyEditChip=v;}],"lyChip":[()=>lyChip,(v)=>{lyChip=v;}],"LY_ADJ":[()=>LY_ADJ,(v)=>{LY_ADJ=v;}],"lyAdjFmt":[()=>lyAdjFmt,(v)=>{lyAdjFmt=v;}],"lyOutOfOrder":[()=>lyOutOfOrder,(v)=>{lyOutOfOrder=v;}],"lyResort":[()=>lyResort,(v)=>{lyResort=v;}],"lyAdjToggle":[()=>lyAdjToggle,(v)=>{lyAdjToggle=v;}],"lyAdjRow":[()=>lyAdjRow,(v)=>{lyAdjRow=v;}],"lyBuildCard":[()=>lyBuildCard,(v)=>{lyBuildCard=v;}],"lyFocusPend":[()=>lyFocusPend,(v)=>{lyFocusPend=v;}],"renderLySegs":[()=>renderLySegs,(v)=>{renderLySegs=v;}],"lyRerenderCard":[()=>lyRerenderCard,(v)=>{lyRerenderCard=v;}],"lyRerender":[()=>lyRerender,(v)=>{lyRerender=v;}],"LY_SPELL":[()=>LY_SPELL,(v)=>{LY_SPELL=v;}],"LY_SPELL_LINES":[()=>LY_SPELL_LINES],"lySpellFetch":[()=>lySpellFetch,(v)=>{lySpellFetch=v;}],"lySpellScan":[()=>lySpellScan,(v)=>{lySpellScan=v;}],"lySpellRender":[()=>lySpellRender,(v)=>{lySpellRender=v;}],"lySpellApply":[()=>lySpellApply,(v)=>{lySpellApply=v;}],"lyStats":[()=>lyStats,(v)=>{lyStats=v;}],"lyFindCount":[()=>lyFindCount,(v)=>{lyFindCount=v;}],"lyMarkFind":[()=>lyMarkFind,(v)=>{lyMarkFind=v;}],"lyPickSegs":[()=>lyPickSegs,(v)=>{lyPickSegs=v;}],"lyPvSet":[()=>lyPvSet,(v)=>{lyPvSet=v;}],"lyPvSync":[()=>lyPvSync,(v)=>{lyPvSync=v;}],"lySeek":[()=>lySeek,(v)=>{lySeek=v;}],"lyCapRefresh":[()=>lyCapRefresh,(v)=>{lyCapRefresh=v;}],"lyVidCheck":[()=>lyVidCheck,(v)=>{lyVidCheck=v;}],"lyPollVideo":[()=>lyPollVideo,(v)=>{lyPollVideo=v;}],"renderMd":[()=>renderMd,(v)=>{renderMd=v;}],"wireCopy":[()=>wireCopy,(v)=>{wireCopy=v;}],"LY_WANTVID":[()=>LY_WANTVID,(v)=>{LY_WANTVID=v;}],"LY_VID_T":[()=>LY_VID_T,(v)=>{LY_VID_T=v;}],"LY_VID_GEN":[()=>LY_VID_GEN,(v)=>{LY_VID_GEN=v;}],"lyBurnStop":[()=>lyBurnStop,(v)=>{lyBurnStop=v;}],"lyBurnReset":[()=>lyBurnReset,(v)=>{lyBurnReset=v;}],"_lyBurnT0":[()=>_lyBurnT0,(v)=>{_lyBurnT0=v;}],"lyBurnWait":[()=>lyBurnWait,(v)=>{lyBurnWait=v;}],"lyBurnShow":[()=>lyBurnShow,(v)=>{lyBurnShow=v;}],"lyVidFetch":[()=>lyVidFetch,(v)=>{lyVidFetch=v;}],"RES_AR":[()=>RES_AR,(v)=>{RES_AR=v;}],"lyReSize":[()=>lyReSize],"lyRePos":[()=>lyRePos],"lyOptsNow":[()=>lyOptsNow],"EDIT_SUB":[()=>EDIT_SUB,(v)=>{EDIT_SUB=v;}],"editSubsInit":[()=>editSubsInit,(v)=>{editSubsInit=v;}],"TOK_USD_PER_VMIN":[()=>TOK_USD_PER_VMIN],"USD_KRW":[()=>USD_KRW],"estTokenKRW":[()=>estTokenKRW,(v)=>{estTokenKRW=v;}],"estTokenNote":[()=>estTokenNote,(v)=>{estTokenNote=v;}],"fmtDur":[()=>fmtDur,(v)=>{fmtDur=v;}],"statusSub":[()=>statusSub,(v)=>{statusSub=v;}],"showResult":[()=>showResult,(v)=>{showResult=v;}],"RESNM":[()=>RESNM],"ARSNAP":[()=>ARSNAP],"vMetaStr":[()=>vMetaStr,(v)=>{vMetaStr=v;}],"DL_HOME":[()=>DL_HOME],"dlOver":[()=>dlOver,(v)=>{dlOver=v;}],"dlPark":[()=>dlPark,(v)=>{dlPark=v;}],"mmss":[()=>mmss],"CUTS":[()=>CUTS,(v)=>{CUTS=v;}],"CUTOFF":[()=>CUTOFF,(v)=>{CUTOFF=v;}],"CUTK":[()=>CUTK],"showCuts":[()=>showCuts,(v)=>{showCuts=v;}],"renderCuts":[()=>renderCuts,(v)=>{renderCuts=v;}],"dlVerify":[()=>dlVerify,(v)=>{dlVerify=v;}],"ftIdle":[()=>ftIdle,(v)=>{ftIdle=v;}],"ftRender":[()=>ftRender,(v)=>{ftRender=v;}],"openJob":[()=>openJob,(v)=>{openJob=v;}],"edFocusResult":[()=>edFocusResult,(v)=>{edFocusResult=v;}],"_jlSig":[()=>_jlSig,(v)=>{_jlSig=v;}],"_jlBusy":[()=>_jlBusy,(v)=>{_jlBusy=v;}],"_r2Extra":[()=>_r2Extra],"_jlIds":[()=>_jlIds],"loadJobLib":[()=>loadJobLib,(v)=>{loadJobLib=v;}],"jlRailIds":[()=>jlRailIds,(v)=>{jlRailIds=v;}],"_jlAdT":[()=>_jlAdT,(v)=>{_jlAdT=v;}],"railAdopt":[()=>railAdopt,(v)=>{railAdopt=v;}],"_r2eBusy":[()=>_r2eBusy,(v)=>{_r2eBusy=v;}],"pollR2RecentEdit":[()=>pollR2RecentEdit,(v)=>{pollR2RecentEdit=v;}],"PVZOOM":[()=>PVZOOM]});
__nm.leak({tkImgFb});
let EDIT_STATS = null;
(async () => {
  try {
    const r = await window.fetch('job_stats.json?t=' + Date.now());
    if (r.ok) EDIT_STATS = (await r.json()).stats || null;
  } catch (e) {}
})();
const $ = s => document.querySelector(s),
  $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[c]);
const X_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6 18 18M18 6 6 18"/></svg>';
const PEND_KEY = 'nm_edit_pend';
const BC_MODE = document.documentElement.classList.contains('bestcut');
let _ftRun = false;
const goBtn = () => document.getElementById(BC_MODE ? 'ftGo' : 'editGo');
const upBtn = () => BC_MODE && _ftRun ? null : goBtn();
const API = '/api/edit';
const BUDGET = 2700;
const RESUME_MAX_MS = 120 * 60e3;
const LEN_HARD = 3601,
  LEN_STT = 1201,
  LEN_WHOLE = 601;
let FILE_B64 = '',
  FILE_NAME = '',
  FILE_URL = '',
  _dur = 0,
  USER_ACT = false,
  _pollLive = false,
  _polling = false,
  EDIT_ID = '',
  RESULT_URL = '';
let FILE_R2 = '',
  _lastFile = null,
  _varea = 0,
  _vw = 0,
  _vh = 0;
const pendSet = o => {
  try {
    window.nmJobs.add(PEND_KEY, o);
  } catch (e) {}
};
const pendGet = () => {
  try {
    return window.nmJobs.list(PEND_KEY)[0] || null;
  } catch (e) {
    return null;
  }
};
const pendClear = id => {
  try {
    window.nmJobs.drop(PEND_KEY, id);
  } catch (e) {}
};
const LR_TILT_DB = 6.0,
  LR_PROBE_MAX = 180 * 1024 * 1024;
let LR_TILT = false,
  LR_TILT_VAL = 0;
async function lrTiltProbe(file) {
  try {
    if (!file || file.size > LR_PROBE_MAX) return null;
    const AC = window.AudioContext || window.webkitAudioContext,
      OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!AC && !OAC) return null;
    let ctx = null;
    if (OAC) {
      try {
        ctx = new OAC(2, 1, 16000);
      } catch (e) {
        ctx = null;
      }
    }
    if (!ctx) {
      if (!AC) return null;
      ctx = new AC();
    }
    let aud;
    try {
      aud = await ctx.decodeAudioData(await file.arrayBuffer());
    } finally {
      try {
        ctx.close();
      } catch (e) {}
    }
    if (!aud || aud.numberOfChannels < 2) return null;
    const L = aud.getChannelData(0),
      R = aud.getChannelData(1);
    const step = Math.max(1, Math.floor(L.length / 200000));
    let sl = 0,
      sr = 0,
      n = 0;
    for (let i = 0; i < L.length; i += step) {
      sl += L[i] * L[i];
      sr += R[i] * R[i];
      n++;
    }
    if (!n) return null;
    const db = v => 20 * Math.log10(Math.max(Math.sqrt(v / n), 1e-9));
    const d = Math.abs(db(sl) - db(sr));
    return isFinite(d) ? d : null;
  } catch (e) {
    return null;
  }
}
async function lrTiltApply(file) {
  LR_TILT = false;
  LR_TILT_VAL = 0;
  const d = await lrTiltProbe(file);
  if (d === null) return;
  LR_TILT_VAL = d;
  if (d >= LR_TILT_DB) {
    LR_TILT = true;
    ON.anorm = false;
  }
  render();
}
const ORDER = ['sub', 'trn', 'screen', 'res', 'fps', 'sdr', 'cut', 'trim', 'bgm', 'anorm'];
const CARD = {
  sub: {
    nm: '자막',
    grp: '자막',
    eta: 210
  },
  trn: {
    nm: '번역',
    grp: '자막',
    eta: 0
  },
  bgm: {
    nm: '배경음 제거',
    grp: '소리',
    eta: 300
  },
  cut: {
    nm: '컷 편집',
    grp: '컷·구간',
    eta: 20
  },
  trim: {
    nm: '구간',
    grp: '컷·구간',
    eta: 0
  },
  screen: {
    nm: '비율',
    grp: '화면',
    eta: 0
  },
  res: {
    nm: '해상도',
    grp: '화면',
    eta: 0
  },
  fps: {
    nm: '고프레임',
    grp: '화면',
    eta: 0
  },
  anorm: {
    nm: '음량 통일',
    grp: '소리',
    eta: 15
  },
  sdr: {
    nm: 'SDR 변환',
    grp: '화면',
    eta: 90
  }
};
let ON = {
  sub: true,
  trn: true,
  bgm: false,
  cut: false,
  trim: false,
  screen: false,
  res: false,
  fps: false,
  anorm: true,
  sdr: false
};
let SCAN_ONCE = false;
let CUT_REF = null;
let P = {
  lang: 'ko',
  tone: 'lit',
  slang: 'auto',
  filler: true,
  style: 'clean',
  karaoke: false,
  hi: true,
  pop: false,
  keyword: false,
  pos: 17,
  posman: false,
  size: 94,
  sizeman: false,
  bg: 100,
  shtype: 'box',
  lgap: 18,
  srcsz: -52,
  sh: 100,
  shc: 'black',
  font: 'pretendard',
  fg: 'white',
  kwc: 'green',
  glow: 0,
  cutlv: 'std',
  cutfill: false,
  take: false,
  t0: '',
  t1: '',
  segs: [{
    s: '',
    e: ''
  }],
  xfade: 20,
  ar: '9:16',
  fit: 'blur',
  vpos: 50,
  res: '1080',
  fps: '60i'
};
let OPEN = '';
const SUBPRE = {
  news: {
    nm: '속보체',
    style: 'box',
    karaoke: false,
    hi: false,
    pop: false,
    keyword: true,
    bg: 100,
    shtype: 'box',
    pos: 57,
    size: 38
  },
  fun: {
    nm: '예능체',
    style: 'bold',
    karaoke: false,
    hi: false,
    pop: true,
    keyword: true,
    bg: 0,
    shtype: 'stroke',
    pos: 24,
    size: 46
  },
  min: {
    nm: '담백체',
    style: 'clean',
    karaoke: false,
    hi: false,
    pop: false,
    keyword: false,
    bg: 0,
    shtype: 'stroke',
    pos: 24,
    size: 32
  },
  mood: {
    nm: '감성 네온',
    style: 'bold',
    karaoke: false,
    hi: false,
    pop: false,
    keyword: false,
    bg: 0,
    shtype: 'stroke',
    pos: 55,
    size: 50,
    sh: 140,
    shc: 'pink',
    font: 'serif',
    fg: 'yellow',
    glow: 40
  }
};
const preOn = k => Object.entries(SUBPRE[k]).every(([p, v]) => p === 'nm' || P[p] === v);
const OC_DEF = {
  black: '#000',
  white: '#fff',
  green: 'var(--accent-5)',
  mint: 'var(--accent)',
  sky: 'var(--bias-l1)',
  pink: 'var(--accent-6)',
  yellow: 'var(--warn)'
};
const OC_LBL = {
  black: '검정',
  white: '흰',
  green: '그린',
  mint: '민트',
  sky: '스카이',
  pink: '핑크',
  yellow: '레몬'
};
const FONT_PV = {
  pretendard: {
    lbl: '프리텐다드',
    lh: 1.193,
    dsc: 0.2022,
    bk: 0.0006,
    ff: '"Pretendard Variable","Pretendard",sans-serif'
  },
  gothic: {
    lbl: '본고딕',
    lh: 1.448,
    dsc: 0.1989,
    bk: 0.0425,
    ff: '"Noto Sans KR","Noto Sans CJK KR",sans-serif',
    gf: 'Noto+Sans+KR:wght@700'
  },
  serif: {
    lbl: '명조',
    lh: 1.437,
    dsc: 0.199,
    bk: 0.0421,
    ff: '"Noto Serif KR","Noto Serif CJK KR",serif',
    gf: 'Noto+Serif+KR:wght@700'
  },
  paper: {
    lbl: '페이퍼',
    lh: 1.178,
    dsc: 0.1698,
    bk: 0.0005,
    fam: 'Paperlogy',
    ff: '"Paperlogy","페이퍼로지",sans-serif',
    lf: 'assets/fonts/subs/Paperlogy-5Medium.ttf',
    lw: '500'
  },
  pen: {
    lbl: '손글씨',
    lh: 1.15,
    dsc: 0.2,
    bk: 0.0132,
    ff: '"Nanum Pen Script",cursive',
    gf: 'Nanum+Pen+Script'
  },
  barun: {
    lbl: '바른고딕',
    lh: 1.15,
    dsc: 0.2609,
    bk: -0.0404,
    fam: 'NanumBarunGothic',
    ff: '"NanumBarunGothic",sans-serif',
    lf: 'https://hangeul.pstatic.net/hangeul_static/webfont/NanumBarunGothic/NanumBarunGothicWebBold.woff2',
    lw: '700 900'
  },
  plex: {
    lbl: 'IBM',
    lh: 1.5,
    dsc: 0.2767,
    bk: 0.0157,
    ff: '"IBM Plex Sans KR",sans-serif',
    gf: 'IBM+Plex+Sans+KR:wght@700'
  },
  jua: {
    lbl: '주아',
    lh: 1.113,
    dsc: 0.2147,
    bk: -0.0476,
    ff: '"Jua",sans-serif',
    gf: 'Jua'
  },
  gowun: {
    lbl: '고운돋움',
    lh: 1.448,
    dsc: 0.1989,
    bk: 0.0404,
    ff: '"Gowun Dodum",sans-serif',
    gf: 'Gowun+Dodum'
  }
};
const _ocRGB = {};
function ocRGB(k) {
  if (_ocRGB[k]) return _ocRGB[k];
  try {
    const p = document.createElement('i');
    p.style.color = OC_DEF[k] || OC_DEF.black;
    document.body.appendChild(p);
    const m = (window.getComputedStyle(p).color || '').match(/(\d+),\s*(\d+),\s*(\d+)/);
    p.remove();
    return _ocRGB[k] = m ? m[1] + ',' + m[2] + ',' + m[3] : '0,0,0';
  } catch (e) {
    return '0,0,0';
  }
}
let _gfPre = false;
function loadPvFont(k) {
  const f = FONT_PV[k];
  if (!f || !(f.gf || f.lf) || f._l) return;
  f._l = true;
  if (f.lf) {
    try {
      const face = new window.FontFace(f.fam, 'url(' + f.lf + ')', {
        weight: f.lw || '400',
        display: 'swap'
      });
      face.load().then(x => {
        document.fonts.add(x);
        const v = document.getElementById('pv');
        if (v && !v.hidden) pvSync();
      }).catch(() => {});
    } catch (e) {}
    return;
  }
  if (!_gfPre) {
    _gfPre = true;
    [['https://fonts.googleapis.com', ''], ['https://fonts.gstatic.com', 'anonymous']].forEach(([h, co]) => {
      const p = document.createElement('link');
      p.rel = 'preconnect';
      p.href = __nm.u(h);
      if (co) p.crossOrigin = co;
      document.head.appendChild(p);
    });
  }
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = __nm.u('https://fonts.googleapis.com/css2?family=' + f.gf + '&display=swap');
  document.head.appendChild(l);
}
function sum(k) {
  if (k === 'sub') return {
    bold: '기본',
    clean: '깔끔',
    box: '박스'
  }[P.style] + (P.karaoke ? '·가라오케' : P.hi ? '·강조' : P.pop ? '·툭 튀어나오기' : '') + (P.keyword ? '·강조' : '') + (P.font !== 'pretendard' ? '·' + ((FONT_PV[P.font] || {}).lbl || '') : '') + ' · ' + P.pos + '%';
  if (k === 'cut') return {
    soft: '살짝',
    std: '기본',
    hard: '많이'
  }[P.cutlv] + (P.cutfill ? '·필러' : '') + (P.take ? '·테이크' : '');
  if (k === 'trim') return (P.t0 || 0) + '~' + (P.t1 || '끝') + '초';
  if (k === 'screen') return P.ar + (P.fit === 'pad' ? ' 검정 여백' : P.fit === 'blur' ? ' 블러 여백' : ' 자르기');
  if (k === 'res') {
    const r = RES_LADDER.find(a => a[0] === P.res);
    return P.res === 'src' ? '원본 그대로' : r ? r[2] + '로 맞춤 — 긴 변 ' + r[1] + 'px(작으면 확대·선명화 · AI 아님)' : '';
  }
  if (k === 'fps') return P.fps === '60i' ? '60fps 보간(부드러움)' : P.fps + 'fps';
  if (k === 'anorm') return '음량 강도 · 좌우 밸런스 보정';
  if (k === 'bgm') return '목소리만';
  if (k === 'sdr') return 'HDR 원본 → SDR(BT.709)';
  return '';
}
const SUBSTY = ['karaoke', 'hi', 'pop'];
const SUBSTY_L = {
  karaoke: '가라오케',
  hi: '강조',
  pop: '툭 튀어나오기'
};
const TONE_OPTS = [['lit', '직역'], ['sns', '의역'], ['mz', 'MZ어']];
const SLANG_OPTS = [['auto', '혼합'], ['ko', '국문만'], ['en', '영문만'], ['ja', '일어만']];
const toneFix = () => {
  if (!TONE_OPTS.some(a => a[0] === P.tone)) P.tone = 'lit';
  if (!SLANG_OPTS.some(a => a[0] === P.slang)) P.slang = 'auto';
};
const pc = (k, v, on, dim, txt, xcls) => '<button class="pc' + (on ? ' on' : '') + (dim ? ' dim' : '') + (xcls ? ' ' + xcls : '') + '" type="button" data-p="' + k + ':' + v + '" aria-pressed="' + (on ? 'true' : 'false') + '"' + (dim ? ' disabled' : '') + '>' + txt + '</button>';
function segs(k, arr, cur, dim) {
  return '<div class="prow">' + arr.map(a => pc(k, a[0], String(cur) === a[0], dim, a[1])).join('') + '</div>';
}
const srow = (lbl, chips) => '<div class="srow"><span class="plbl">' + lbl + '</span><span class="sopts">' + chips.join('<span class="ssep" aria-hidden="true">|</span>') + '</span></div>';
const snapRow = (lbl, key, items, hold) => {
  const wide = items.length >= 4 || items.length >= 3 && items.some(a => String(a[4]).length >= 6);
  return '<div class="srow snaprow"' + (wide ? ' data-wide' : '') + '><span class="plbl' + (hold ? ' lblhold" aria-hidden="true' : '') + '">' + lbl + '</span><span data-nmsnap="' + key + '" aria-label="' + lbl + (hold ? ' (계속)' : '') + '">' + items.map(a => pc(a[0], a[1], a[2], a[3], a[4])).join('') + '</span></div>';
};
const snapLine = (key, lbl, chips) => '<div class="snapline" data-nmsnap="' + key + '" aria-label="' + lbl + '">' + chips.join('') + '</div>';
const SWAX_L = {
  shc: '음영',
  fg: '자막',
  kwc: '강조'
};
let SWAX_SEL = 'kwc';
const SWDEF = {
  shc: 'black',
  fg: 'white',
  kwc: 'green'
};
let SWSNAP = null;
const swIsDef = () => P.shc === SWDEF.shc && (P.fg || 'white') === SWDEF.fg && (P.kwc || 'green') === SWDEF.kwc;
const swdefrow = () => srow('', [pc('swdef', '1', swIsDef(), false, '기본')]);
function swrow() {
  const cur = P[SWAX_SEL] || SWDEF[SWAX_SEL];
  return snapRow('색', 'swax', [['kwc', '강조'], ['fg', '자막'], ['shc', '음영']].map(a => ['swax', a[0], SWAX_SEL === a[0], false, a[1]])) + '<div class="swrow" role="radiogroup" aria-label="' + SWAX_L[SWAX_SEL] + ' 색">' + Object.keys(OC_DEF).map(c => '<button class="swc' + (c === cur ? ' on' : '') + '" type="button" role="radio" aria-checked="' + (c === cur ? 'true' : 'false') + '" data-sw="' + c + '"' + ' aria-label="' + OC_LBL[c] + '" title="' + SWAX_L[SWAX_SEL] + ' 색 = ' + OC_LBL[c] + '"><span class="swd" style="--sw:' + OC_DEF[c] + '"></span></button>').join('') + pc('swdef', '1', swIsDef(), false, '기본') + '</div>';
}
const srcRatio = () => Math.max(.25, Math.min(1, (100 + (+P.srcsz || 0)) / 100));
const px1 = v => Math.max(0, Math.round(v * 10) / 10);
function inkBotEqTop(el) {
  const rg = document.createRange();
  rg.selectNodeContents(el);
  const i = __nm.rect(rg),
    b = __nm.rect(el);
  if (!(i.height > 0) || !(b.height > 0)) return;
  const cur = parseFloat(window.getComputedStyle(el).paddingBottom) || 0;
  el.style.paddingBottom = px1(Math.max(0, cur + (i.top - b.top - (b.bottom - i.bottom)))) + 'px';
}
try {
  document.fonts.addEventListener('loadingdone', () => {
    const v = document.getElementById('pv');
    if (v && !v.hidden) pvSync();
  });
} catch (e) {}
function runBottom(bh, fs, ext, dual) {
  const M = Math.min(bh * (0.02 + 0.0082 * P.pos), Math.max(0, bh - fs * (dual ? 4.9 : 3.1))),
    fl = bh * 0.01;
  return Math.max(fl, Math.min(M - ext / 2, Math.max(fl, bh - fs - ext - fl))) + ext;
}
function srcLineMirror(tl, A, gap, tfs, f) {
  const z = document.createElement('i');
  z.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
  tl.appendChild(z);
  const b = __nm.rect(z).top,
    h = __nm.rect(tl).height;
  z.remove();
  if (!(h > 0)) return;
  const want = Math.round(A + gap + (1 - (f && f.dsc || 0)) * tfs);
  tl.style.marginTop = Math.round(((parseFloat(tl.style.marginTop) || 0) + want - b) * 1000) / 1000 + 'px';
}
function subLineMirror(el, fs, f, box) {
  if (!__nm.rects(el).length) return;
  el.style.marginBottom = '0px';
  el.style.paddingTop = '0px';
  el.style.paddingBottom = '0px';
  if (!(el.textContent || '').trim()) return;
  const z = document.createElement('i');
  z.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
  el.appendChild(z);
  const r = __nm.rect(el),
    b = __nm.rect(z).top;
  z.remove();
  if (!(r.height > 0)) return;
  const dsc = f && f.dsc || 0,
    A = r.bottom,
    base = A - dsc * fs,
    Rb = Math.round(base);
  let mb = b - Rb;
  if (box) {
    const hp = fs * box.padc / 2,
      dy = (f && f.bk || 0) * fs,
      sh = Rb - base;
    const top = A - fs - hp + dy + sh,
      bot = A + hp + dy + sh;
    const lT = r.top - mb,
      lB = r.bottom - mb;
    const pT = px1(Math.max(0, lT - Math.floor(top))),
      pB = px1(Math.max(0, Math.ceil(bot) - lB));
    el.style.paddingTop = pT + 'px';
    el.style.paddingBottom = pB + 'px';
    mb -= pB;
    const cT = Math.max(0, top - Math.round(lT - pT)),
      cB = Math.max(0, Math.round(lB + pB) - bot);
    if (cT > .01 || cB > .01) {
      const t = cT.toFixed(2) + 'px',
        u = 'calc(100% - ' + cB.toFixed(2) + 'px)';
      el.style.background = 'linear-gradient(transparent ' + t + ', ' + box.col + ' ' + t + ', ' + box.col + ' ' + u + ', transparent ' + u + ')';
    }
  }
  el.style.marginBottom = Math.round(mb * 1000) / 1000 + 'px';
}
const gvTxt = (k, v, u) => v + u;
function gauge(k, lbl, min, max, val, unit, tip) {
  return '<div class="grow"><span class="k">' + lbl + '</span><input type="range" data-nmg min="' + min + '" max="' + max + '" step="1" value="' + val + '" data-g="' + k + '" aria-label="' + lbl + (tip ? ' — ' + tip : '') + '"' + (tip ? ' title="' + esc(tip) + '"' : '') + '><span class="v">' + gvTxt(k, val, unit) + '</span></div>';
}
function prm(k, head) {
  if (k === 'sub') {
    const C = x => x ? '<div class="scard">' + x + '</div>' : '';
    return '<div class="pvslot" id="pvSlotSub"></div>' + '<div class="optcards">' + (head || '') + C(snapRow('톤', 'tone', TONE_OPTS.map(a => ['tone', a[0], P.tone === a[0], false, a[1]]))) + C(snapRow('음성 언어', 'slang', SLANG_OPTS.map(a => ['slang', a[0], P.slang === a[0], false, a[1]]))) + C(snapRow('글자 형태', 'font1', ['pretendard', 'gothic', 'serif', 'paper'].map(f => ['font', f, P.font === f, false, FONT_PV[f].lbl])) + snapRow('글자 형태', 'font2', ['barun', 'plex', 'jua', 'gowun'].map(f => ['font', f, P.font === f, false, FONT_PV[f].lbl]), true)) + C(srow('자막 스타일', SUBSTY.map(k => pc(k, P[k] ? '0' : '1', P[k], false, SUBSTY_L[k]))) + srow('강조 효과', [pc('keyword', P.keyword ? '0' : '1', P.keyword, false, '강조')]) + srow('군더더기', [pc('filler', P.filler ? '0' : '1', P.filler, false, '의성어·추임새 빼기')])) + C(gauge('bg', '배경', 0, 100, P.bg, '%') + gauge('pos', '위치', 0, 100, P.pos, '%') + gauge('size', '크기', 20, 100, P.size, '‰')) + C(snapRow('음영', 'shtype', [['none', '기본'], ['box', '음영'], ['stroke', '획'], ['shadow', '그림자']].map(a => ['shtype', a[0], P.shtype === a[0], false, a[1]])) + (P.shtype === 'none' ? '' : gauge('sh', P.shtype === 'box' ? '여백' : P.shtype === 'stroke' ? '획 굵기' : '그림자', 0, 300, P.sh, '%', '선택한 음영 종류의 세기 — 100% = 기본'))) + C(ON.trn ? gauge('srcsz', '외국어', -75, 0, P.srcsz, '%', '한국어 줄 대비 크기 — 0% = 같은 크기 · -50% = 절반 · -52% = 기본 · 줄간격 고정 · 자막 덩어리 가운데는 그대로라 외국어가 커지면 한국어는 위로, 외국어는 아래로 반씩(실제 영상과 동일)') + gauge('lgap', '줄간격', 0, 60, P.lgap, '%', '한국어 줄과 외국어 줄 사이 간격 — 한국어 글자 높이 기준 % · 18% = 기본') : '') + C(swrow()) + '</div>';
  }
  if (k === 'cut') return segs('cutlv', [['off', 'OFF'], ['std', '기본'], ['soft', '살짝'], ['hard', '많이']], ON.cut ? P.cutlv : 'off') + (ON.cut ? '<div class="prow">' + pc('cutfill', P.cutfill ? '0' : '1', P.cutfill, false, '필러') + pc('take', P.take ? '0' : '1', P.take, false, '테이크') + '</div><div class="prow"><button class="pc" type="button" id="cutScanBtn">자를 곳 먼저 보기</button></div>' + '<div class="xnote">무음 구간은 STT 전사로 찾음 — 자막은 안 입힘' + (P.cutfill ? ' · 필러 세기도 위 강도를 따라감' : '') + '</div>' : '');
  if (k === 'trim') return '<div class="trimrow"><input type="number" id="t0" min="0" step="0.1" placeholder="0" inputmode="decimal" aria-label="시작 초" value="' + esc(P.t0) + '"><span class="tsep">~</span><input type="number" id="t1" min="0" step="0.1" placeholder="끝(비면 안 자름)" inputmode="decimal" aria-label="끝 초" value="' + esc(P.t1) + '"><span class="tu">초</span></div>';
  if (k === 'screen') return segs('ar', [['off', '원본']].concat([['9:16', '9:16'], ['1:1', '1:1'], ['4:5', '4:5'], ['16:9', '16:9']]), ON.screen ? P.ar : 'off') + (ON.screen ? '<div class="plbl plbl-nm">방식</div>' + snapLine('fit', '방식', [['crop', '자르기'], ['pad', '검정 여백'], ['blur', '블러 여백']].map(a => pc('fit', a[0], P.fit === a[0], false, a[1])).concat(pc('genfill', 'x', false, true, '생성형'))) + (P.fit === 'crop' ? gauge('vpos', '위치', 0, 100, P.vpos, '%') : '') : '');
  if (k === 'res') return segs('res', [['off', '원본 유지']].concat(RES_LADDER.map(a => [a[0], a[2]])), ON.res ? P.res : 'off');
  if (k === 'fps') return segs('fps', [['off', '원본'], ['60i', '60fps 보간'], ['30', '30']], ON.fps ? P.fps : 'off');
  if (k === 'bgm') return segs('bgm', [['off', 'OFF'], ['on', '목소리만 남김']], ON.bgm ? 'on' : 'off');
  if (k === 'anorm') return segs('anorm', [['off', 'OFF'], ['on', '음량 강도 · 좌우 밸런스 보정']], ON.anorm ? 'on' : 'off');
  return '';
}
function etaCalc() {
  let s = 90;
  for (const k of ORDER) {
    if (ON[k]) s += CARD[k].eta;
  }
  if (ON.cut && P.take) s += 90;
  if (ON.sub || ON.cut) s += 150;
  if (ON.cut && !ON.sub) s += 150;
  if ((ON.sub || ON.cut) && _dur) s += Math.min(2400, Math.round(_dur * 1.2));
  if (ON.sub && _dur) s += Math.min(600, Math.round(_dur * 1.0));
  if (ON.fps && P.fps === '60i') s += _dur ? Math.min(900, Math.round(_dur * 18)) : 540;
  if (ON.res && P.res === 'src' && _varea > 2 * 2073600) s += Math.min(720, Math.round((_dur || 60) * 3));
  return s;
}
function etaTxt() {
  const s = etaCalc();
  return s >= 60 ? '예상 ~' + Math.ceil(s / 60) + '분' : '예상 ~' + s + '초';
}
function setEta() {
  const g = $('#editGo');
  if (!g) return;
  const e = g.querySelector('.eta');
  if (e) e.remove();
}
const IA = [['설계', [['sub', '자막 설정', ['sub']], ['cuts', '컷·구간', ['trim', 'cut']]]], ['기본', [['scr', '화면 설정', ['res']]]]];
const CYC = {
  ar: ['off', '9:16', '1:1', '4:5', '16:9'],
  fit: ['crop', 'pad', 'blur'],
  res: ['off', 'src', '720', '1080', '2k', '4k'],
  fps: ['off', '60i'],
  cutlv: ['off', 'soft', 'std', 'hard'],
  bgm: ['off', 'on'],
  anorm: ['off', 'on'],
  sdr: ['off', 'on'],
  trim: ['off', 'on'],
  sub: ['off', 'on'],
  trn: ['off', 'on']
};
const CYL = {
  ar: {
    off: '원본',
    '9:16': '9:16',
    '1:1': '1:1',
    '4:5': '4:5',
    '16:9': '16:9'
  },
  fit: {
    crop: '자르기',
    pad: '검정 여백',
    blur: '블러 여백'
  },
  res: {
    off: '원본',
    src: '원본',
    720: '720p',
    '1080': 'FHD',
    '2k': '2K',
    '4k': '4K'
  },
  fps: {
    off: 'OFF',
    '60i': 'ON',
    '30': '30fps'
  },
  cutlv: {
    off: 'OFF',
    soft: '살짝',
    std: '기본',
    hard: '많이'
  },
  sdr: {
    off: 'OFF',
    on: 'ON'
  },
  bgm: {
    off: 'ON',
    on: 'OFF'
  },
  anorm: {
    off: 'OFF',
    on: 'ON'
  },
  trim: {
    off: 'OFF',
    on: 'ON'
  },
  sub: {
    off: 'OFF',
    on: 'ON'
  },
  trn: {
    off: 'OFF',
    on: 'ON'
  }
};
const HALF = new Set(['bgm', 'anorm']);
const AXNM = {
  ar: '비율',
  fit: '방식',
  res: '해상도',
  fps: '고프레임',
  cutlv: '컷 편집',
  trim: '구간',
  bgm: '배경음',
  anorm: '음량',
  sdr: 'SDR 변환',
  sub: '자막',
  trn: '번역'
};
function curCyc(k) {
  if (k === 'ar') return ON.screen ? P.ar : 'off';
  if (k === 'res') return ON.res ? P.res : 'off';
  if (k === 'fps') return ON.fps ? P.fps : 'off';
  if (k === 'cutlv') return ON.cut ? P.cutlv : 'off';
  if (k === 'bgm') return ON.bgm ? 'on' : 'off';
  if (k === 'anorm') return ON.anorm ? 'on' : 'off';
  if (k === 'sdr') return ON.sdr ? 'on' : 'off';
  if (k === 'trim') return ON.trim ? 'on' : 'off';
  if (k === 'sub') return ON.sub ? 'on' : 'off';
  if (k === 'trn') return ON.trn ? 'on' : 'off';
  if (k === 'fit') return P.fit;
  return P[k];
}
function cyv(k, word) {
  const v = curCyc(k);
  const lab = CYL[k][v] || String(v);
  const bin = lab === 'OFF' || lab === 'ON';
  const on = bin ? lab === 'ON' : v !== 'off';
  return '<span class="cyv' + (on ? '' : ' off') + '" data-cyc="' + k + '" role="button" tabindex="0" aria-label="' + (AXNM[k] || k) + '"' + (bin ? ' aria-pressed="' + on + '"' : '') + '>' + esc(bin ? word || AXNM[k] || k : lab) + '</span>';
}
function updateOptStrip() {
  const el = document.getElementById('editSpec');
  if (!el) return;
  const axes = ['res', 'bgm', 'anorm', 'cutlv'];
  const sig = axes.map(k => k + ':' + curCyc(k)).join('|') + (ON.screen ? '|s' : '');
  if (el._sig === sig) return;
  el._sig = sig;
  el.innerHTML = __nm.h(axes.filter(k => k !== 'fit' || ON.screen).map(k => {
    const v = curCyc(k);
    const lab = CYL[k][v] || String(v);
    const word = AXNM[k] || '구간';
    const act = ' data-cyc="' + k + '" role="button" tabindex="0" aria-label="' + word + '"';
    if (lab === 'OFF' || lab === 'ON') return '<span class="gs-v' + (lab === 'ON' ? ' on' : '') + (k === 'anorm' && LR_TILT ? ' lrtilt' : '') + '"' + act + (k === 'anorm' && LR_TILT ? ' title="좌우 소리가 ' + LR_TILT_VAL.toFixed(1) + 'dB 어긋나 자동으로 껐어 — 직접 맞춘 뒤 켜줘"' : ' title="탭=켜기/끄기"') + '>' + word + '</span>';
    if (lab === '원본') return '<span class="gs-v' + (k === 'fit' || v !== 'off' ? ' on' : '') + '"' + act + ' title="탭=다음 값">' + word + ' ' + esc(lab) + '</span>';
    return '<span class="gs-lbl">' + word + '</span> <span class="gs-v' + (k === 'fit' || v !== 'off' ? ' on' : '') + '"' + act + ' title="탭=다음 값">' + esc(lab) + '</span>';
  }).join(' <span class="gs-sep">/</span> '));
}
function setAxis(k, v) {
  if (k === 'ar') {
    if (v === 'off') ON.screen = false;else {
      ON.screen = true;
      P.ar = v;
    }
    return;
  }
  if (k === 'res' || k === 'fps') {
    if (v === 'off') ON[k] = false;else {
      ON[k] = true;
      P[k] = v;
    }
    return;
  }
  if (k === 'cutlv') {
    if (v === 'off') {
      ON.cut = false;
      if (!LR_TILT) ON.anorm = true;
    } else {
      ON.cut = true;
      P.cutlv = v;
      ON.anorm = false;
    }
    return;
  }
  if (k === 'bgm' || k === 'anorm' || k === 'sub' || k === 'sdr') {
    if (v === 'on') {
      ON[k] = true;
    } else {
      ON[k] = false;
      if (k === 'sub') ON.trn = false;
    }
    return;
  }
  if (k === 'trn') {
    if (v === 'on') {
      ON.trn = true;
      ON.sub = true;
    } else ON.trn = false;
    return;
  }
  if (k === 'trim') {
    if (v === 'on') {
      ON.trim = true;
    } else ON.trim = false;
    return;
  }
  if (k === 'spre') {
    const pr = SUBPRE[v];
    if (pr) {
      for (const kk in pr) {
        if (kk !== 'nm') P[kk] = pr[kk];
      }
      if ('size' in pr) P.sizeman = true;
      if ('pos' in pr) P.posman = true;
      if (!('fg' in pr)) P.fg = 'white';
    }
    return;
  }
  if (k === 'swax') {
    if (SWAX_L[v]) SWAX_SEL = v;
    return;
  }
  if (k === 'swdef') {
    if (swIsDef()) {
      if (SWSNAP) {
        P.shc = SWSNAP.shc;
        P.fg = SWSNAP.fg;
        P.kwc = SWSNAP.kwc;
        SWSNAP = null;
      }
      return;
    }
    SWSNAP = {
      shc: P.shc,
      fg: P.fg,
      kwc: P.kwc
    };
    P.shc = SWDEF.shc;
    P.fg = SWDEF.fg;
    P.kwc = SWDEF.kwc;
    return;
  }
  if (['cutfill', 'take'].includes(k)) {
    P[k] = v === '1';
    return;
  }
  if (['filler', 'karaoke', 'hi', 'pop', 'keyword'].includes(k)) {
    P[k] = v === '1';
    if (P[k] && SUBSTY.includes(k)) SUBSTY.forEach(x => {
      if (x !== k) P[x] = false;
    });
    return;
  }
  P[k] = v;
  if (k === 'fit' && v !== 'crop') scrubClose();
}
const CARDAX = {
  res: 'res',
  fps: 'fps',
  cut: 'cutlv',
  bgm: 'bgm',
  anorm: 'anorm',
  sdr: 'sdr',
  trim: 'trim',
  sub: 'sub',
  trn: 'trn'
};
const RES_LADDER = [['720', 1280, '720p'], ['1080', 1920, 'FHD'], ['2k', 2560, '2K'], ['4k', 3840, '4K']];
function resChips(cur) {
  const L = Math.max(_vw || 0, _vh || 0);
  const src = ['src', L, '원본'];
  if (!L) return hdChips('res', [['off', '원본 유지']].concat(RES_LADDER.map(a => [a[0], a[2]])), cur);
  const rows = RES_LADDER.filter(a => Math.abs(a[1] - L) / L >= 0.03).concat([src]).sort((a, b) => a[1] - b[1]);
  return '<span class="cysep">|</span><span class="sopts">' + rows.map(a => pc('res', a[0], String(cur) === a[0], false, a[2], a[0] === 'src' ? '' : a[1] > L ? 'rsup' : 'rsdn')).join('') + '</span>';
}
const hdChips = (k, arr, cur) => '<span class="cysep">|</span><span class="sopts">' + arr.map(a => pc(k, a[0], String(cur) === a[0], false, a[1])).join('') + '</span>';
const SEG_MAX = 12;
let _segHold = 0;
const segsReset = () => {
  P.segs = [{
    s: '',
    e: ''
  }];
};
function pvSegs() {
  const out = [];
  for (const g of P.segs || []) {
    const a = parseFloat(g.s),
      b = parseFloat(g.e);
    const a0 = Math.max(0, Number.isFinite(a) ? a : 0);
    if (Number.isFinite(b) && b > a0 && (!_dur || a0 < _dur - 0.05)) out.push([a0, Math.min(b, _dur || b)]);
  }
  out.sort((x, y) => x[0] - y[0]);
  return out;
}
const tlSegsHtml = segs => segs.map(([a, b], i) => '<i class="tl-seg" style="left:' + (a / _dur * 100).toFixed(2) + '%;width:' + (Math.min(_dur, b) - a > 0 ? ((Math.min(_dur, b) - a) / _dur * 100).toFixed(2) : 0) + '%;animation-delay:' + (i * 0.28).toFixed(2) + 's"></i>').join('');
function tlRuler() {
  if (!FILE_URL || !_dur) return '';
  return '<div class="tl" id="tlBar" role="button" tabindex="0" aria-label="재생 위치 — 탭하면 그 시각으로 이동" title="탭 = 그 시각으로 미리보기 이동"><div class="tl-lbls" aria-hidden="true"><span>0:00</span><span>' + fmtT(_dur / 2) + '</span><span>' + fmtT(_dur) + '</span></div><div class="tl-track" id="tlTrack">' + tlSegsHtml(pvSegs()) + '<i class="tl-ph" id="tlPh" style="left:0%"></i></div></div>';
}
function trimBody() {
  const MIN_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 12h12"/></svg>';
  const list = P.segs && P.segs.length ? P.segs : P.segs = [{
    s: '',
    e: ''
  }];
  const rows = list.map((g, i) => '<div class="trimrow"><span class="tsn">' + (i + 1) + '구간</span><input type="number" min="0" step="0.1" placeholder="0" inputmode="decimal" aria-label="' + (i + 1) + '구간 시작 초" data-ts="' + i + '" value="' + esc(g.s) + '"><span class="tsep">~</span><input type="number" min="0" step="0.1" placeholder="끝" inputmode="decimal" aria-label="' + (i + 1) + '구간 끝 초" data-te="' + i + '" value="' + esc(g.e) + '"><span class="tu">초</span>' + (list.length > 1 ? '<button class="rm" type="button" data-tsrm="' + i + '" aria-label="' + (i + 1) + '구간 삭제" title="이 구간 빼기">' + MIN_SVG + '</button>' : '') + '</div>').join('');
  return '<div class="prm">' + tlRuler() + rows + '<div class="prow"><button class="pc" type="button" id="segAdd" title="구간 추가 — 적은 구간만 이어 붙임">+ 구간 추가</button></div>' + gauge('xfade', '디졸브', 0, 100, P.xfade, '%') + '</div><div class="cnote">적은 구간만 이어 붙어 — 이음매는 디졸브 강도만큼 부드럽게</div>';
}
const CUTLV = ['off', 'soft', 'std', 'hard'];
function cutBody() {
  const det = ON.cut ? '<div class="prow">' + pc('cutfill', P.cutfill ? '0' : '1', P.cutfill, false, '필러') + pc('take', P.take ? '0' : '1', P.take, false, '테이크') + '</div><div class="prow"><button class="pc" type="button" id="cutScanBtn">자를 곳 먼저 보기</button></div>' : '';
  return (det ? '<div class="prm">' + det + '</div>' : '') + (ON.cut ? '<div class="cnote">무음 구간은 STT 전사로 찾음 — 자막은 안 입힘' + (P.cutfill ? ' · 필러 세기도 위 강도를 따라감' : '') + '</div>' : '');
}
function hlRow() {
  const tg3 = (ax, nm, ttl) => '<div class="scard cyc"><div class="hd st"' + (ttl ? ' title="' + ttl + '"' : '') + '>' + cyv(ax, nm) + '</div></div>';
  return '<div class="cyrow tri">' + tg3('sub', '자막') + tg3('trn', '번역', 'ON = 원문이 50% 작게 위 · 한국어 자막이 아래(원문+한글 동시 표기)') + tg3('fps', '고프레임', 'ON = 60fps 보간(부드러움)') + '</div>' + (ON.sub ? '<div class="scard"><div class="prm">' + prm('sub') + '</div></div>' : '');
}
function resNote() {
  if (!_vw || !_vh) return '';
  const row = RES_LADDER.find(a => a[0] === P.res);
  if (!row) return '';
  const cap = row[1],
    L = Math.max(_vw, _vh),
    crop = ON.screen && P.ar;
  const up = cap > L;
  if (L === cap) return '<div class="xnote">' + _vw + '×' + _vh + ' — 이미 딱 맞아서 그대로</div>';
  const k = cap / L,
    tw = Math.max(2, Math.floor(_vw * k) & ~1),
    th = Math.max(2, Math.floor(_vh * k) & ~1);
  return '<div class="xnote">' + (crop ? '긴 변 ' + L + ' → <b>' + cap + '</b>' + (up ? ' 확대' : ' 축소') + ' (비율 자르기 뒤 기준)' : _vw + '×' + _vh + ' → <b>' + tw + '×' + th + '</b>' + (up ? ' 확대' : ' 축소')) + (k > 1 ? ' · 선명화 동반(AI 아님 — 없던 디테일이 생기진 않아)' : '') + '</div>';
}
function cardHtml(k, half, bare) {
  let vals = '',
    hdNm = true;
  if (k === 'screen') vals = hdChips('ar', [['off', '원본'], ['9:16', '9:16'], ['1:1', '1:1'], ['4:5', '4:5'], ['16:9', '16:9']], ON.screen ? P.ar : 'off');else if (k === 'res') vals = resChips(ON.res ? P.res : 'off');else if (k === 'cut') vals = hdChips('cutlv', [['off', 'OFF'], ['std', '기본'], ['soft', '살짝'], ['hard', '많이']], ON.cut ? P.cutlv : 'off');else if (CARDAX[k]) {
    const ax = CARDAX[k],
      v0 = curCyc(ax),
      lab0 = CYL[ax][v0] || String(v0);
    if (lab0 === 'OFF' || lab0 === 'ON') {
      hdNm = false;
      vals = cyv(ax, CARD[k].nm);
    } else vals = '<span class="cysep">|</span>' + cyv(ax);
  }
  let body = '';
  if (bare) body = '';else if (k === 'sub' && ON.sub) body = '<div class="prm">' + prm('sub') + '</div>';else if (k === 'screen' && ON.screen) body = '<div class="prm"><div class="plbl plbl-nm" style="margin-top:0">방식</div>' + snapLine('fit', '방식', [['crop', '자르기'], ['pad', '검정 여백'], ['blur', '블러 여백']].map(a => pc('fit', a[0], P.fit === a[0], false, a[1])).concat(pc('genfill', 'x', false, true, '생성형'))) + (P.fit === 'crop' ? gauge('vpos', '위치', 0, 100, P.vpos, '%') : '') + '</div>';else if (k === 'res' && ON.res) body = resNote();else if (k === 'cut') body = cutBody();else if (k === 'trim' && ON.trim) body = trimBody();
  return '<div class="scard cyc' + (half ? ' half' : '') + '"><div class="hd st">' + (hdNm ? '<span class="nm">' + CARD[k].nm + '</span>' : '') + vals + '</div>' + body + '</div>';
}
const CHEV_DN = 'm6 9 6 6 6-6',
  CHEV_UP = 'm18 15-6-6-6 6';
const ACC_OPEN = {};
function accSum(id) {
  if (id === 'sub') {
    if (!ON.sub) return '끔';
    const st = SUBSTY.find(k => P[k]);
    return [FONT_PV[P.font] ? FONT_PV[P.font].lbl : '', (TONE_OPTS.find(a => a[0] === P.tone) || [])[1] || '', st ? SUBSTY_L[st] : ''].filter(Boolean).join(' · ');
  }
  if (id === 'cuts') {
    const n = (P.segs || []).filter(g => String(g.s) !== '' || String(g.e) !== '').length;
    return '컷 ' + (ON.cut ? CYL.cutlv[P.cutlv] || P.cutlv : '끔') + ' · 구간 ' + (ON.trim ? n ? n + '개' : '켬' : '끔');
  }
  if (id === 'scr') return (ON.screen ? P.ar + ' · ' + (CYL.fit[P.fit] || P.fit) : '비율 원본') + ' · 해상도 ' + (ON.res ? CYL.res[P.res] || P.res : '원본');
  return '';
}
function accShell(id, name, sum, body) {
  const o = !!ACC_OPEN[id];
  return '<div class="scard' + (o ? ' open' : '') + '" data-acc="' + id + '"><button type="button" class="hd acch" aria-expanded="' + o + '" aria-controls="acc_' + id + '"><span class="nm">' + name + '</span><span class="sum">' + esc(sum) + '</span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (o ? CHEV_UP : CHEV_DN) + '"/></svg></button>' + '<div class="acc" id="acc_' + id + '"' + (o ? '' : ' inert') + '><div class="acc-in"><div class="prm">' + body + '</div></div></div></div>';
}
function accCard(g) {
  const body = g[2][0] === 'sub' ? prm('sub', cardHtml('sub', false, true)) : '<div class="optcards">' + secCards(g[2]) + '</div>';
  return accShell(g[0], g[1], accSum(g[0]), body);
}
let _accMorph = null;
import("../../home/deck/vendor/morphicons/dom.js").then(m => {
  _accMorph = m.createMorph;
}).catch(() => {});
function chevTo(path, d) {
  const from = path.getAttribute('d');
  if (from === d) return;
  if (_accMorph) {
    try {
      (path._mo || (path._mo = _accMorph(path, from, {
        reducedMotion: 'user'
      }))).morphTo(d, 'snappy');
      return;
    } catch (_) {}
  }
  path.setAttribute('d', d);
}
function accSet(id, o) {
  ACC_OPEN[id] = o;
  const c = document.querySelector('[data-acc="' + id + '"]');
  if (!c || c.classList.contains('open') === o) return;
  const h = c.querySelector(':scope > .acch'),
    a = c.querySelector(':scope > .acc');
  c.classList.toggle('open', o);
  if (h) h.setAttribute('aria-expanded', String(o));
  if (a) {
    if (o) a.removeAttribute('inert');else a.setAttribute('inert', '');
  }
  const p = h && h.querySelector('.chev path');
  if (p) chevTo(p, o ? CHEV_UP : CHEV_DN);
}
document.addEventListener('click', e => {
  const h = e.target.closest && e.target.closest('.acch');
  if (!h) return;
  const c = h.closest('[data-acc]');
  if (c) accSet(c.dataset.acc, !c.classList.contains('open'));
});
function accDodge() {
  const dock = document.getElementById('topDock');
  if (!dock) return;
  const db = __nm.rect(dock).bottom,
    sy = window.scrollY || 0,
    sticky = window.getComputedStyle(dock).position === 'sticky';
  const rails = [...document.querySelectorAll('.pvsec .trail')].map(e => __nm.rect(e)).filter(r => r.height && r.bottom > db);
  const hs = [...document.querySelectorAll('[data-acc] > .acch')];
  let pad = 0;
  if (rails.length && (sticky || hs.some(h => {
    const r = __nm.rect(h),
      t = r.top + sy,
      b = r.bottom + sy;
    return rails.some(q => t < q.bottom && b > q.top);
  }))) hs.forEach(h => {
      const r = __nm.rect(h);
      rails.forEach(q => {
        if (r.right > q.left) pad = Math.max(pad, Math.ceil(r.right - q.left + 8));
      });
    });
  const v = pad ? pad + 'px' : '';
  hs.forEach(h => {
    if (h.style.paddingRight !== v) h.style.paddingRight = v;
  });
}
function dockClearSync() {
  const d = document.getElementById('topDock');
  let h = 0;
  if (d) {
    const cs = window.getComputedStyle(d);
    if (cs.position === 'sticky') {
      const dr = __nm.rect(d);
      let b = dr.bottom;
      document.querySelectorAll('.pvsec .trailwrap').forEach(t => {
        const r = __nm.rect(t);
        if (r.height) b = Math.max(b, r.bottom);
      });
      h = Math.ceil(b - dr.top + (parseFloat(cs.top) || 0));
    }
  }
  const v = h + 'px',
    s = document.documentElement.style;
  if (s.getPropertyValue('--dock-clear') !== v) s.setProperty('--dock-clear', v);
}
function dockGeoSync() {
  dockClearSync();
  accDodge();
}
if (window.ResizeObserver) {
  const _accRO = new window.ResizeObserver(() => dockGeoSync());
  const _d = document.getElementById('topDock'),
    _s = document.getElementById('stack');
  if (_d) _accRO.observe(_d, {
    box: 'border-box'
  });
  if (_s) _accRO.observe(_s);
}
if (window.MutationObserver) {
  const _d = document.getElementById('topDock');
  if (_d) new window.MutationObserver(() => dockGeoSync()).observe(_d, {
    attributes: true,
    attributeFilter: ['style', 'class', 'data-nm-rail-flow']
  });
}
window.addEventListener('resize', dockGeoSync);
function secCards(ks) {
  let out = '',
    i = 0;
  while (i < ks.length) {
    const k = ks[i];
    if (k === 'hl3') {
      out += hlRow();
      i++;
      continue;
    }
    if (HALF.has(k) && i + 1 < ks.length && HALF.has(ks[i + 1])) {
      out += '<div class="cyrow">' + cardHtml(k, true) + cardHtml(ks[i + 1], true) + '</div>';
      i += 2;
    } else {
      out += cardHtml(k, false);
      i++;
    }
  }
  return out;
}
function render() {
  ON.trn = ON.sub;
  ON.screen = false;
  ON.fps = false;
  ON.sdr = false;
  sizeAuto();
  const _pv = document.getElementById('pv');
  if (_pv && $('#stack').contains(_pv)) document.body.appendChild(_pv);
  $('#stack').innerHTML = __nm.h(IA.map(sec => '<div class="sech"><span class="nm">' + sec[0] + '</span></div>' + sec[1].map(accCard).join('')).join(''));
  setEta();
  pvSync();
  accDodge();
}
let _dockHold = null,
  _srcSig = '';
function resSig() {
  const lv = document.getElementById('lyBurnVid');
  const vw = document.getElementById('vwrap');
  return (_pollLive ? 'L' : '-') + '|' + (RESULT_URL || '') + '|' + (lv && lv.getAttribute('src') || '') + '|' + (vw && !vw.hidden ? 'V' : '-');
}
function dockSync() {
  const d = document.getElementById('topDock');
  if (!d) return;
  const vw = document.getElementById('vwrap'),
    lb = document.getElementById('lyBurn');
  const lv = document.getElementById('lyBurnVid');
  const res = vw && !vw.hidden && !vw.querySelector('.scanline') || lb && !lb.hidden && lv && !lv.hidden;
  if (res && _dockHold === 'src' && resSig() !== _srcSig) _dockHold = null;
  const fold = false;
  d.classList.toggle('fold', fold);
  const ps = document.querySelector('.pvsec');
  if (ps) {
    try {
      ps.inert = fold;
    } catch (_) {}
  }
  const s = document.getElementById('optStrip');
  if (s) s.setAttribute('aria-expanded', String(!fold));
}
(function () {
  return;
  const s = document.getElementById('optStrip');
  if (!s) return;
  s.title = '탭 = 미리보기 접기/펼치기';
  s.setAttribute('role', 'button');
  s.tabIndex = 0;
  s.setAttribute('aria-controls', 'pvsec');
  s.style.cursor = 'pointer';
  let _mv = false,
    _x0 = 0;
  s.addEventListener('pointerdown', e => {
    _mv = false;
    _x0 = __nm.cx(e);
  });
  s.addEventListener('pointermove', e => {
    if (Math.abs(__nm.cx(e) - _x0) > 4) _mv = true;
  });
  const tog = () => {
    const d = document.getElementById('topDock');
    if (!d) return;
    _dockHold = d.classList.contains('fold') ? 'open' : 'fold';
    dockSync();
    pvSync();
  };
  s.addEventListener('click', () => {
    if (_mv) {
      _mv = false;
      return;
    }
    tog();
  });
  s.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      tog();
    }
  });
})();
let PENDACT = null;
const PEND_TTL = 120000;
function hasSrc() {
  const u = $('#url');
  return !!(u && u.value.trim() || FILE_B64 || FILE_R2 || _lastFile);
}
function armAfterAttach(run) {
  if (hasSrc()) return false;
  errStatus('입력 필요');
  PENDACT = {
    at: Date.now(),
    run: typeof run === 'function' ? run : null
  };
  const i = $('#file');
  if (i) i.click();
  return true;
}
function pvSync() {
  sizeAuto();
  if (PENDACT && hasSrc() && Date.now() - PENDACT.at < PEND_TTL) {
    const run = PENDACT.run;
    PENDACT = null;
    if (run) run();
  }
  updateOptStrip();
  dockSync();
  const pv = $('#pv');
  if (!pv) return;
  const vv = $('#pvVid');
  const slot = document.getElementById('pvSlot');
  const sec = document.getElementById('pvsec');
  const _pe = document.getElementById('pvEmpty'),
    _sw = document.getElementById('pvSwap'),
    _dl = document.getElementById('pvDel');
  if (!FILE_URL || !slot) {
    pv.hidden = true;
    if (sec) {
      sec.hidden = false;
      const _pa0 = document.getElementById('pvAttr');
      if (_pa0) _pa0.innerHTML = __nm.h('');
    }
    if (_pe) _pe.hidden = false;
    if (_sw) {
      _sw.hidden = false;
      _sw.disabled = false;
    }
    if (_dl) {
      _dl.hidden = false;
      _dl.disabled = !($('#url') && $('#url').value.trim());
    }
    const _pu = document.getElementById('pvUrl');
    if (_pu) {
      const _uv = $('#url') && $('#url').value.trim() || '';
      _pu.hidden = false;
      _pu.toggleAttribute('data-src', !!_uv);
      if (_uv) {
        let _h = 'URL 소스';
        try {
          _h = 'URL 소스 · ' + new window.URL(_uv).hostname;
        } catch (_) {}
        _pu.textContent = _h;
      } else _pu.textContent = '주소 붙여넣기';
    }
    const _sr0 = document.querySelector('.srcwrap');
    if (_sr0) _sr0.style.display = '';
    if (!FILE_URL && vv.getAttribute('src')) {
      vv.removeAttribute('src');
      vv.load();
    }
    return;
  }
  if (pv.parentElement !== slot) slot.appendChild(pv);
  pv.hidden = false;
  if (sec) sec.hidden = false;
  if (_pe) _pe.hidden = true;
  if (_sw) {
    _sw.hidden = false;
    _sw.disabled = false;
  }
  if (_dl) {
    _dl.hidden = false;
    _dl.disabled = false;
  }
  const _sr = document.querySelector('.srcwrap');
  if (_sr) _sr.style.display = 'none';
  const _pa = document.getElementById('pvAttr');
  if (_pa) {
    const _t = ORDER.filter(x => ON[x]).map(x => x === 'anorm' ? '음량' : x === 'bgm' ? '배경음 제거' : sum(x));
    _pa.innerHTML = __nm.h(_t.length ? '<b>' + _t.map(esc).join('</b> · <b>') + '</b>' : '');
  }
  if (vv.getAttribute('src') !== FILE_URL) {
    vv.src = __nm.u(FILE_URL);
    if (vv.play) vv.play().catch(() => {});
  } else if (vv.paused && vv.getAttribute('src') && !(document.getElementById('topDock') || {
    classList: {
      contains: () => false
    }
  }).classList.contains('fold')) {
    vv.play().catch(() => {});
  }
  if (document.getElementById('topDock') && document.getElementById('topDock').classList.contains('fold') && !vv.paused) {
    try {
      vv.pause();
    } catch (_) {}
  }
  window.requestAnimationFrame(() => {
    if (pv.hidden) return;
    const srcW = vv.videoWidth || 16,
      srcH = vv.videoHeight || 9,
      srcAr = srcW / srcH;
    const ar = ON.screen ? AR_NUM[P.ar] || srcAr : srcAr;
    const box = $('#pvBox'),
      maxW = pv.clientWidth || 300,
      fitH = Math.floor(__nm.rect(slot).height) - (pv.offsetHeight - pv.clientHeight),
      maxH = Math.min(Math.round(window.innerHeight * .29), 300, fitH > 0 ? fitH : Infinity);
    const bw = Math.max(80, Math.min(maxW, Math.round(maxH * ar))),
      bh = Math.max(80, Math.round(bw / ar));
    box.style.width = bw + 'px';
    box.style.height = bh + 'px';
    const pp = document.getElementById('pvPre');
    if (pp) pp.style.left = Math.max(0, Math.round((pv.clientWidth - bw) / 2)) + 12 + 'px';
    if (ON.screen && P.fit === 'crop') {
      vv.style.objectFit = 'cover';
      vv.style.objectPosition = ar < srcAr ? P.vpos + '% 50%' : '50% ' + P.vpos + '%';
    } else {
      vv.style.objectFit = ON.screen ? 'contain' : 'cover';
      vv.style.objectPosition = '50% 50%';
    }
    pvBlurBg(vv);
    const sub = $('#pvSub');
    if (!ON.sub) {
      sub.hidden = true;
      return;
    }
    const fs = Math.max(3, bh * (P.size / 1000));
    sub.style.bottom = runBottom(bh, fs, 0, false) + 'px';
    sub.style.left = '7.4%';
    sub.style.right = '7.4%';
    const sp = $('#pvSubTx');
    const lhR = FONT_PV[P.font] && FONT_PV[P.font].lh || 1;
    sp.style.fontSize = fs / lhR + 'px';
    sp.style.lineHeight = String(lhR);
    sp.style.fontFamily = FONT_PV[P.font] && FONT_PV[P.font].ff || '';
    loadPvFont(P.font);
    const om = P.sh / 100,
      padc = Math.min(.5, Math.max(0, P.sh / 1000)),
      oc = ocRGB(P.shc);
    sub.style.setProperty('--pvkw', P.keyword || P.karaoke || P.hi || P.pop ? 'rgb(' + ocRGB(P.kwc || 'green') + ')' : P.fg && P.fg !== 'white' ? 'rgb(' + ocRGB(P.fg) + ')' : OC_DEF.white);
    sp.style.color = P.fg && P.fg !== 'white' ? 'rgb(' + ocRGB(P.fg) + ')' : '';
    const gpx = P.glow > 0 ? Math.round(fs * 0.0025 * P.glow * 10) / 10 : 0;
    const fxSh = (t, gl) => {
      if (P.shtype === 'stroke') {
        const o = px1(t * (P.style === 'bold' ? 0.064 : 0.032) * om);
        return '-' + o + 'px 0 0 rgba(' + oc + ',1), ' + o + 'px 0 0 rgba(' + oc + ',1), 0 -' + o + 'px 0 rgba(' + oc + ',1), 0 ' + o + 'px 0 rgba(' + oc + ',1)' + (P.style === 'bold' ? ', ' + o + 'px ' + o + 'px 0 rgba(' + oc + ',1)' : '') + (gl > 0 ? ', 0 0 ' + gl + 'px rgba(' + oc + ',1), 0 0 ' + gl * 2 + 'px rgba(' + oc + ',.55)' : '');
      }
      if (P.shtype === 'shadow') {
        const d = px1(t * 0.05 * om),
          bl = px1(t * 0.07 * om);
        return d + 'px ' + d + 'px ' + bl + 'px rgba(' + oc + ',.85)';
      }
      return 'none';
    };
    sp.style.background = 'transparent';
    sp.style.padding = '0';
    sp.style.textShadow = fxSh(fs, gpx);
    if (P.shtype === 'box') {
      sp.style.background = 'rgba(' + oc + ',' + Math.max(1, P.bg) / 100 + ')';
      sp.style.padding = '0 ' + px1(fs * padc) + 'px';
    }
    let trnGap = 0,
      trnFs = 0;
    const tl = document.getElementById('pvSubTr');
    if (tl) {
      if (ON.trn) {
        tl.hidden = false;
        const tfs = Math.max(3, fs * srcRatio());
        tl.style.fontSize = tfs / lhR + 'px';
        tl.style.lineHeight = String(lhR);
        const gap = fs * (P.lgap || 0) / 100,
          tpad = P.shtype === 'box' ? px1(tfs * 0.04) : 0;
        trnGap = gap;
        trnFs = tfs;
        tl.style.top = '100%';
        tl.style.marginTop = Math.round((gap - tpad) * 10) / 10 + 'px';
        sub.style.bottom = runBottom(bh, fs, gap + tfs, true) + 'px';
        tl.style.fontFamily = sp.style.fontFamily;
        tl.style.background = 'transparent';
        tl.style.padding = '0';
        tl.style.textShadow = fxSh(tfs, 0);
        if (P.shtype === 'box') {
          tl.style.background = 'rgba(' + oc + ',' + Math.max(1, P.bg) / 100 + ')';
          tl.style.padding = tpad + 'px';
        }
      } else {
        tl.hidden = true;
      }
    }
    sub.hidden = false;
    if (tl && ON.trn && !tl.hidden) {
      {
        const rg = document.createRange();
        rg.selectNodeContents(tl);
        const tw = __nm.rect(rg).width,
          aw = sub.clientWidth;
        if (tw > aw && aw > 0) {
          const nf = Math.max(3, trnFs * aw / tw);
          trnFs = nf;
          tl.style.fontSize = nf / lhR + 'px';
          tl.style.textShadow = fxSh(nf, 0);
          if (P.shtype === 'box') tl.style.padding = px1(nf * 0.04) + 'px';
          sub.style.bottom = runBottom(bh, fs, trnGap + nf, true) + 'px';
        }
      }
    }
    subLineMirror(sp, fs, FONT_PV[P.font], P.shtype === 'box' ? {
      padc: padc,
      col: sp.style.background
    } : null);
    if (tl && ON.trn && !tl.hidden) {
      srcLineMirror(tl, __nm.rect(sub).bottom, trnGap, trnFs, FONT_PV[P.font]);
      if (P.shtype === 'box') inkBotEqTop(tl);
    }
  });
}
function pvBlurBg(vv) {
  const bg = document.getElementById('pvBg');
  if (!bg) return;
  if (!(ON.screen && P.fit === 'blur') || !FILE_URL || !vv || !vv.videoWidth) {
    bg.hidden = true;
    return;
  }
  try {
    const sc = Math.min(1, 96 / Math.max(vv.videoWidth, vv.videoHeight));
    const c = document.createElement('canvas');
    c.width = Math.max(2, Math.round(vv.videoWidth * sc));
    c.height = Math.max(2, Math.round(vv.videoHeight * sc));
    c.getContext('2d').drawImage(vv, 0, 0, c.width, c.height);
    bg.style.backgroundImage = 'url(' + c.toDataURL('image/jpeg', .6) + ')';
    bg.hidden = false;
  } catch (e) {
    bg.hidden = true;
  }
}
$('#pvVid').addEventListener('loadedmetadata', () => pvSync());
$('#pvVid').addEventListener('loadeddata', () => pvBlurBg($('#pvVid')));
$('#pvVid').addEventListener('timeupdate', () => {
  const vv = $('#pvVid');
  if (!vv) return;
  const t = vv.currentTime || 0;
  const ph = document.getElementById('tlPh');
  if (ph && _dur) ph.style.left = (Math.max(0, Math.min(1, t / _dur)) * 100).toFixed(2) + '%';
  if (!ON.trim || !FILE_URL || vv.paused) return;
  if (Date.now() - _segHold < 1500) return;
  const segs = pvSegs();
  if (!segs.length) return;
  for (const [a, b] of segs) {
    if (t >= a - 0.05 && t <= b) return;
  }
  let nx = null;
  for (const [a] of segs) {
    if (a > t) {
      nx = a;
      break;
    }
  }
  try {
    vv.currentTime = nx !== null ? nx : segs[0][0];
  } catch (_) {}
});
document.addEventListener('paste', e => {
  if (_pollLive) return;
  if (FILE_URL || FILE_R2 || FILE_B64 || _lastFile) return;
  if (e.target && e.target.closest && e.target.closest('input,textarea,[contenteditable]')) return;
  const t = (e.clipboardData && e.clipboardData.getData('text') || '').trim();
  if (!/^https?:\/\//i.test(t)) return;
  const u = $('#url');
  if (!u) return;
  u.value = t;
  pvSync();
});
window.addEventListener('resize', () => pvSync());
(function () {
  const sec = document.getElementById('pvsec');
  if (!sec) return;
  const s = document.createElement('div');
  s.style.cssText = 'height:1px;margin-top:-1px;';
  sec.parentNode.insertBefore(s, sec);
  let tick = false;
  function judge() {
    tick = false;
    sec.classList.toggle('stuck', __nm.rect(s).top < -1);
  }
  window.addEventListener('scroll', () => {
    if (!tick) {
      tick = true;
      window.requestAnimationFrame(judge);
    }
  }, {
    passive: true
  });
  judge();
})();
(function () {
  var st = document.createElement('style');
  st.textContent = '.escroll{position:fixed;top:0;right:0;width:7px;height:100%;z-index:99999;pointer-events:none;opacity:0;transition:opacity .3s;}' + '.escroll.on{opacity:1;}' + '.escroll::before{content:"";position:absolute;right:3px;top:0;bottom:0;width:0.5px;background:rgba(255,255,255,.04);}' + '.escroll i{position:absolute;right:2px;top:0;width:3px;min-height:18px;border-radius:999px;background:rgba(var(--accent-rgb),.3);will-change:transform;}';
  document.head.appendChild(st);
  var bar = document.createElement('div');
  bar.className = 'escroll';
  var eth = document.createElement('i');
  bar.appendChild(eth);
  document.body.appendChild(bar);
  var root = document.documentElement;
  function upd() {
    var sh = root.scrollHeight,
      ch = window.innerHeight || root.clientHeight,
      sp = window.scrollY || root.scrollTop || 0;
    if (sh <= ch + 2) {
      bar.classList.remove('on');
      return;
    }
    bar.classList.add('on');
    var h = Math.max(18, Math.min(ch * .5, ch * ch / sh));
    eth.style.height = h + 'px';
    eth.style.transform = 'translateY(' + Math.round(sp / (sh - ch) * (ch - h)) + 'px)';
  }
  window.addEventListener('scroll', upd, {
    passive: true
  });
  window.addEventListener('resize', upd);
  if (window.ResizeObserver) new window.ResizeObserver(upd).observe(document.body);
  upd();
})();
function renderSheet() {
  const g = {};
  ORDER.filter(k => !ON[k]).forEach(k => {
    (g[CARD[k].grp] = g[CARD[k].grp] || []).push(k);
  });
  const parts = Object.entries(g).map(([grp, ks]) => '<div class="grp">' + grp + '</div><div class="prow">' + ks.map(k => pc('add', k, false, false, CARD[k].nm)).join('') + '</div>');
  $('#sheetbody').innerHTML = __nm.h(parts.length ? parts.join('') : '<div class="grp">전부 적용됨</div>');
}
$('#stack').addEventListener('click', e => {
  const rm = e.target.closest('[data-rm]');
  if (rm) {
    ON[rm.dataset.rm] = false;
    if (OPEN === rm.dataset.rm) OPEN = '';
    render();
    return;
  }
  if (e.target.closest('#segAdd')) {
    const L = P.segs = P.segs || [];
    if (L.length >= SEG_MAX) return errStatus('구간 초과');
    L.push({
      s: '',
      e: ''
    });
    _preManual();
    render();
    return;
  }
  const srm = e.target.closest('[data-tsrm]');
  if (srm) {
    const i = +srm.dataset.tsrm;
    if (P.segs && P.segs.length > 1) P.segs.splice(i, 1);
    _preManual();
    render();
    return;
  }
  const tt = e.target.closest('#tlBar');
  if (tt) {
    const tr = tt.querySelector('.tl-track');
    if (!tr) return;
    const r = __nm.rect(tr);
    const t = Math.max(0, Math.min(1, (__nm.cx(e) - r.left) / (r.width || 1))) * (_dur || 0);
    const vv = $('#pvVid');
    if (vv && FILE_URL) {
      _segHold = Date.now();
      try {
        vv.currentTime = t;
        if (vv.paused) vv.play().catch(() => {});
      } catch (_) {}
    }
    return;
  }
  const hd = e.target.closest('[data-open]');
  if (hd) {
    OPEN = OPEN === hd.dataset.open ? '' : hd.dataset.open;
    render();
    return;
  }
});
$('#stack').addEventListener('input', e => {
  const g = e.target.closest('[data-g]');
  if (g) {
    P[g.dataset.g] = +g.value;
    if (g.dataset.g === 'size') P.sizeman = true;
    if (g.dataset.g === 'pos') P.posman = true;
    g.closest('.grow').querySelector('.v').textContent = gvTxt(g.dataset.g, g.value, g.dataset.g === 'size' ? '‰' : '%');
    setEta();
    pvSync();
    return;
  }
  const cg = e.target.closest('[data-cutg]');
  if (cg) {
    const i = Math.max(0, Math.min(3, Math.round(+cg.value)));
    _preManual();
    if (i === 0) ON.cut = false;else {
      ON.cut = true;
      P.cutlv = CUTLV[i];
    }
    const v = cg.parentElement.querySelector('.v');
    if (v) v.textContent = CYL.cutlv[CUTLV[i]];
    const lab = cg.closest('.prm');
    if (lab) lab.querySelectorAll('.glab4 i').forEach((el, n) => el.classList.toggle('on', n === i));
    setEta();
    updateOptStrip();
    return;
  }
  const ts = e.target.closest('[data-ts],[data-te]');
  if (ts) {
    const isS = ts.dataset.ts !== undefined,
      i = +(isS ? ts.dataset.ts : ts.dataset.te);
    if (P.segs && P.segs[i]) {
      const _bad = ts.validity && ts.validity.badInput,
        _v = ts.value !== '' || !_bad ? ts.value : isS ? P.segs[i].s : P.segs[i].e;
      if (isS) P.segs[i].s = _v;else P.segs[i].e = _v;
    }
    _preManual();
    tlDraw();
    const v = parseFloat(ts.value);
    const vv = $('#pvVid');
    if (Number.isFinite(v) && vv && FILE_URL) {
      _segHold = Date.now();
      try {
        vv.currentTime = Math.max(0, Math.min(_dur || v, v));
      } catch (_) {}
    }
    const cs = document.querySelector('[data-acc="cuts"] > .acch .sum');
    if (cs) cs.textContent = accSum('cuts');
    updateOptStrip();
    return;
  }
  const t = e.target.closest('#t0,#t1');
  if (t) {
    P[t.id] = t.value;
  }
});
$('#stack').addEventListener('change', e => {
  if (e.target.closest('[data-cutg]')) render();
});
function tlDraw() {
  const tr = document.getElementById('tlTrack');
  if (!tr || !_dur) return;
  const ph = document.getElementById('tlPh');
  const phL = ph ? ph.style.left : '0%';
  tr.innerHTML = __nm.h(tlSegsHtml(pvSegs()) + '<i class="tl-ph" id="tlPh" style="left:' + phL + '"></i>');
}
let _preN = '종합';
function _preSet(n) {
  _preN = n;
  const el = document.getElementById('pvPreV');
  if (el) el.textContent = n;
}
function _preManual() {
  if (_preN !== '종합') _preSet('종합');
}
const PREC = [['종합', null], ['릴스 완성', 'reels'], ['포맷만', 'fmt'], ['화질만', 'hq']];
(function () {
  const b = document.getElementById('pvPreV');
  if (!b) return;
  b.addEventListener('click', () => {
    const i = (PREC.findIndex(p => p[0] === _preN) + 1) % PREC.length;
    const [nm, rec] = PREC[i];
    if (rec) recipe(rec);
    _preSet(nm);
  });
})();
const MYPRE_K = 'nm_edit_mypre';
let MYPRE = [];
try {
  MYPRE = (JSON.parse(window.localStorage.getItem(MYPRE_K) || '[]') || []).filter(m => m && m.nm && m.on && m.p).slice(0, 5);
} catch {
  MYPRE = [];
}
const myPreStore = () => {
  try {
    window.localStorage.setItem(MYPRE_K, JSON.stringify(MYPRE));
  } catch {}
};
document.addEventListener('click', e => {
  const sv = e.target.closest('[data-presave]');
  if (sv) {
    const p = {
      ...P
    };
    delete p.t0;
    delete p.t1;
    delete p.segs;
    const n = MYPRE.reduce((m, x) => {
      const r = /^내 프리셋 (\d+)$/.exec(x.nm);
      return r ? Math.max(m, +r[1]) : m;
    }, 0) + 1;
    const m = {
      nm: '내 프리셋 ' + n,
      on: {
        ...ON
      },
      p
    };
    MYPRE.push(m);
    myPreStore();
    _preSet(m.nm);
    render();
    return;
  }
  const b = e.target.closest('[data-precnm]');
  if (!b) return;
  const nm = b.dataset.precnm,
    rec = b.dataset.prec;
  if (b.dataset.premine) {
    const m = MYPRE.find(x => x.nm === nm);
    if (!m) return;
    ON = {
      ...m.on
    };
    delete ON.clip;
    for (const k in m.p) P[k] = m.p[k];
    if ('size' in m.p && !('sizeman' in m.p)) P.sizeman = true;
    if ('pos' in m.p && !('posman' in m.p)) P.posman = true;
    toneFix();
    OPEN = '';
    _preSet(nm);
    render();
    return;
  }
  if (nm === _preN && !rec) return;
  _preSet(nm);
  if (rec) recipe(rec);else render();
});
let _mpT = 0;
document.addEventListener('pointerdown', e => {
  const b = e.target.closest('[data-premine]');
  if (!b) return;
  _mpT = window.setTimeout(() => {
    MYPRE = MYPRE.filter(x => x.nm !== b.dataset.precnm);
    myPreStore();
    if (_preN === b.dataset.precnm) _preSet('종합');
    render();
  }, 600);
});
['pointerup', 'pointercancel'].forEach(t => document.addEventListener(t, () => window.clearTimeout(_mpT), true));
document.addEventListener('input', e => {
  if (e.target && e.target.closest && e.target.closest('[data-g]')) _preManual();
}, true);
document.addEventListener('click', e => {
  const p = e.target.closest('[data-p]');
  if (!p || p.disabled) return;
  if (typeof _preManual === 'function') _preManual();
  const _i = p.dataset.p.indexOf(':'),
    k = p.dataset.p.slice(0, _i),
    v = p.dataset.p.slice(_i + 1);
  if (k === 'add') {
    ON[v] = true;
    OPEN = v;
    closeSheet();
    render();
    return;
  }
  setAxis(k, v);
  render();
});
function swSet(el, axis) {
  const c = el && el.dataset && el.dataset.sw;
  if (!c || !OC_DEF[c]) return;
  if (typeof _preManual === 'function') _preManual();
  P[axis] = c;
  SWSNAP = null;
  render();
}
document.addEventListener('click', e => {
  const s = e.target.closest && e.target.closest('[data-sw]');
  if (!s) return;
  swSet(s, SWAX_SEL);
});
function doCyc(el) {
  const k = el.dataset.cyc,
    list = CYC[k];
  if (!list) return;
  const cur = curCyc(k);
  const i = (list.indexOf(cur) + 1) % list.length;
  const nv = list[i];
  const apply = () => {
    if (typeof _preManual === 'function') _preManual();
    setAxis(k, nv);
    render();
  };
  if (armAfterAttach(apply)) return;
  apply();
}
document.addEventListener('click', e => {
  const c = e.target.closest('[data-cyc]');
  if (c) {
    doCyc(c);
    return;
  }
  const h = e.target.closest('.hd.st');
  if (!h) return;
  const w = h.querySelector(':scope > .cyv:only-child');
  if (w) doCyc(w);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    const c = e.target.closest && e.target.closest('[data-cyc]');
    if (c) {
      e.preventDefault();
      doCyc(c);
      return;
    }
    const b = e.target.closest && e.target.closest('#tlBar');
    if (b) {
      e.preventDefault();
      const vv = $('#pvVid');
      if (vv && FILE_URL) {
        _segHold = Date.now();
        try {
          if (vv.paused) vv.play().catch(() => {});else vv.pause();
        } catch (_) {}
      }
    }
  }
});
function openSheet() {
  renderSheet();
  $('#sheet').hidden = false;
  $('#sheetdim').hidden = false;
}
function closeSheet() {
  $('#sheet').hidden = true;
  $('#sheetdim').hidden = true;
}
$('#addbtn').addEventListener('click', openSheet);
$('#shx').addEventListener('click', closeSheet);
$('#sheetdim').addEventListener('click', closeSheet);
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('#scrub').hidden) {
    e.stopImmediatePropagation();
    scrubClose();
    return;
  }
  if (!$('#sheet').hidden) {
    e.stopImmediatePropagation();
    closeSheet();
  }
});
function dlWhereHint() {
  const ua = window.navigator.userAgent || '';
  if (/iPhone|iPad|iPod/.test(ua) || /Mac/.test(ua) && window.navigator.maxTouchPoints > 1) return '파일 앱 → 다운로드 폴더(사파리 기본 · 크롬은 나의 iPhone → Chrome)';
  if (/Android/i.test(ua)) return '내 파일(파일 앱) → Download 폴더';
  return '브라우저 다운로드 폴더(보통 내 PC → 다운로드 · 브라우저 설정에서 변경 가능)';
}
document.addEventListener('click', e => {
  const b = e.target.closest('.dlbtn');
  if (!b) return;
  if (!b.matches('.cref-dlall')) b.classList.add('dl-done');
  const o = document.createElement('span');
  o.className = 'dl-ack';
  o.innerHTML = __nm.h('<span class="dl-ring"></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>');
  if (window.getComputedStyle(b).position === 'static') b.style.position = 'relative';
  b.appendChild(o);
  window.setTimeout(() => o.remove(), 700);
  const st = $('#cstatus');
  if (st) {
    st.classList.remove('err');
    st.innerHTML = __nm.h(window.OK_SVG + ' 저장 위치 = ' + dlWhereHint());
  }
}, true);
function recipe(r) {
  ON = {
    sub: false,
    trn: false,
    bgm: false,
    cut: false,
    trim: false,
    screen: false,
    res: false,
    fps: false,
    anorm: false,
    sdr: false
  };
  if (r === 'reels') {
    ON.cut = ON.screen = ON.anorm = true;
    P.ar = '9:16';
    P.fit = 'blur';
  }
  if (r === 'fmt') {
    ON.screen = ON.anorm = true;
    P.ar = '9:16';
    P.fit = 'blur';
  }
  if (r === 'hq') {
    ON.res = ON.anorm = true;
    P.res = 'src';
  }
  OPEN = '';
  render();
}
(function () {
  const t = $('#pvPreT'),
    row = $('#pvPreRow');
  if (!t || !row) return;
  let folding = false;
  const open = () => {
    if (folding) return;
    row.classList.remove('fold');
    row.hidden = false;
  };
  const fold = () => {
    if (row.hidden || folding) return;
    folding = true;
    row.classList.add('fold');
    window.setTimeout(() => {
      row.hidden = true;
      row.classList.remove('fold');
      folding = false;
    }, 320);
  };
  t.addEventListener('click', e => {
    e.stopPropagation();
    row.hidden ? open() : fold();
  });
  row.addEventListener('click', e => {
    const b = e.target.closest('[data-rec]');
    if (!b) return;
    e.stopPropagation();
    t.classList.add('on');
    fold();
    window.setTimeout(() => recipe(b.dataset.rec), 330);
  });
  document.addEventListener('click', e => {
    if (!row.hidden && !e.target.closest('.pvpre')) fold();
  });
})();
let XTR_SCAN = '';
let XTR_SCAN_ID = '';
let XTR_SCAN_T0 = 0,
  _xscTick = null;
function xscTick(on) {
  window.clearInterval(_xscTick);
  _xscTick = null;
  if (!on) return;
  _xscTick = window.setInterval(() => {
    if (XTR_SCAN !== 'run') {
      window.clearInterval(_xscTick);
      _xscTick = null;
      return;
    }
    const t = document.querySelector('#xtrsec .xtime');
    if (t) t.textContent = fmtT((Date.now() - XTR_SCAN_T0) / 1000);else renderXtr();
  }, 1000);
}
let XTR_GRP = [{
  name: '',
  pids: [],
  col: 0
}, {
  name: '',
  pids: [],
  col: 0
}];
const _xcolTok = v => (window.getComputedStyle(document.documentElement).getPropertyValue(v) || '').trim();
const XCOL_HEX = ['#fff', _xcolTok('--accent'), _xcolTok('--accent-4')];
const XCOL_CSS = ['#fff', 'var(--accent)', 'var(--accent-4)'];
let XTR_ACT = 0;
let XTR_FACES = [];
const XTR_BOX = 'nm_xtr_src';
const XTR_BOX_MAX = 8;
const XTR_JOBSRC = 'nm_xtr_jobsrc';
let XTR_SRC = '';
const XTR_RUN = Object.create(null);
try {
  window.localStorage.removeItem('nm_xtr_faces');
} catch (e) {}
function xtrKey() {
  const u = $('#url'),
    uv = u ? u.value.trim() : '';
  if (uv && /^https?:\/\//i.test(uv)) return 'u:' + uv;
  if (_lastFile) return 'f:' + _lastFile.name + ':' + _lastFile.size + ':' + (_lastFile.lastModified || 0);
  if (FILE_R2) return 'r:' + FILE_R2;
  if (FILE_B64) return 'b:' + (FILE_NAME || '') + ':' + FILE_B64.length;
  return '';
}
function xtrAll() {
  try {
    const o = JSON.parse(window.localStorage.getItem(XTR_BOX) || '{}');
    return o && typeof o === 'object' && !Array.isArray(o) ? o : {};
  } catch (e) {
    return {};
  }
}
function xtrWrite(all) {
  try {
    const ks = Object.keys(all);
    if (ks.length > XTR_BOX_MAX) ks.sort((a, b) => ((all[b] && all[b].t) | 0) - ((all[a] && all[a].t) | 0)).slice(XTR_BOX_MAX).forEach(k => {
      delete all[k];
    });
    window.localStorage.setItem(XTR_BOX, JSON.stringify(all));
  } catch (e) {}
}
function xtrSave() {
  if (!XTR_SRC) return;
  const all = xtrAll();
  all[XTR_SRC] = {
    f: XTR_FACES,
    g: XTR_GRP,
    a: XTR_ACT | 0,
    s: XTR_SCAN === 'run' ? '' : XTR_SCAN,
    i: XTR_SCAN_ID,
    t: Date.now()
  };
  xtrWrite(all);
}
function xtrSync() {
  const k = xtrKey();
  if (k === XTR_SRC) return false;
  xtrSave();
  XTR_SRC = k;
  const d = (k ? xtrAll()[k] : null) || {};
  XTR_FACES = Array.isArray(d.f) ? d.f : [];
  XTR_GRP = Array.isArray(d.g) && d.g.length ? d.g : [{
    name: '',
    pids: [],
    col: 0
  }, {
    name: '',
    pids: [],
    col: 0
  }];
  XTR_ACT = d.a | 0;
  XTR_SCAN = d.s === 'run' ? '' : d.s || '';
  XTR_SCAN_ID = d.i || '';
  if (XTR_RUN[k]) {
    XTR_SCAN = 'run';
    XTR_SCAN_T0 = XTR_RUN[k].t0;
    xscTick(true);
  }
  if (k && XTR.pinset && !XTR_FACES.length && !XTR_RUN[k] && hasSrc()) window.setTimeout(xtrScan, 0);
  return true;
}
function xtrFaces(key, faces) {
  if (!key || !Array.isArray(faces)) return;
  if (key === XTR_SRC) {
    XTR_FACES = faces;
    XTR_SCAN = faces.length ? '' : XTR_SCAN;
    xtrSave();
    renderXtr();
    return;
  }
  const all = xtrAll(),
    cur = all[key] || {};
  cur.f = faces;
  cur.t = Date.now();
  all[key] = cur;
  xtrWrite(all);
}
function xtrScanSet(key, v) {
  if (!key) return;
  if (key === XTR_SRC) {
    XTR_SCAN = v;
    renderXtr();
    return;
  }
  const all = xtrAll(),
    cur = all[key] || {};
  cur.s = v === 'run' ? '' : v;
  cur.t = Date.now();
  all[key] = cur;
  xtrWrite(all);
}
function xtrJobSet(id, key) {
  if (!id || !key) return;
  try {
    const m = JSON.parse(window.localStorage.getItem(XTR_JOBSRC) || '{}') || {};
    m[id] = key;
    const ks = Object.keys(m);
    if (ks.length > 32) ks.slice(0, ks.length - 32).forEach(k => {
      delete m[k];
    });
    window.localStorage.setItem(XTR_JOBSRC, JSON.stringify(m));
  } catch (e) {}
}
function xtrJobKey(id) {
  try {
    const m = JSON.parse(window.localStorage.getItem(XTR_JOBSRC) || '{}') || {};
    return m[id] || '';
  } catch (e) {
    return '';
  }
}
const JOB_CFG = 'nm_edit_cfg';
const JOB_CFG_MAX = 9;
function jobCfgSet(id) {
  if (!id) return;
  try {
    const m = JSON.parse(window.localStorage.getItem(JOB_CFG) || '{}') || {};
    m[id] = {
      on: Object.assign({}, ON),
      p: Object.assign({}, P),
      xtr: Object.assign({}, XTR),
      src: XTR_SRC,
      t: Date.now()
    };
    const ks = Object.keys(m);
    if (ks.length > JOB_CFG_MAX) ks.sort((a, b) => ((m[b] && m[b].t) | 0) - ((m[a] && m[a].t) | 0)).slice(JOB_CFG_MAX).forEach(k => {
      delete m[k];
    });
    window.localStorage.setItem(JOB_CFG, JSON.stringify(m));
  } catch (e) {}
}
function jobCfgGet(id) {
  try {
    const m = JSON.parse(window.localStorage.getItem(JOB_CFG) || '{}') || {};
    return m[id] || null;
  } catch (e) {
    return null;
  }
}
function jobCfgApply(id) {
  const c = jobCfgGet(id);
  if (!c) return false;
  try {
    if (c.on && typeof c.on === 'object') Object.keys(ON).forEach(k => {
      if (k in c.on) ON[k] = !!c.on[k];
    });
    if (c.p && typeof c.p === 'object') {
      Object.keys(P).forEach(k => {
        if (k in c.p) P[k] = c.p[k];
      });
      if ('size' in c.p && !('sizeman' in c.p)) P.sizeman = true;
      if ('pos' in c.p && !('posman' in c.p)) P.posman = true;
      toneFix();
    }
    if (c.xtr && typeof c.xtr === 'object') {
      Object.keys(XTR).forEach(k => {
        if (k in c.xtr) XTR[k] = c.xtr[k];
      });
      if (!('bgrm' in c.xtr)) XTR.bgrm = !!(c.xtr.keying || c.xtr.chroma);
      if (!('bgfe' in c.xtr) && typeof c.xtr.kfe === 'number') XTR.bgfe = c.xtr.kfe;
    }
    render();
    renderXtr();
    setEta();
  } catch (e) {
    return false;
  }
  return true;
}
const XTR = {
  mosaic: false,
  pinset: false,
  bgrm: false,
  silh: false,
  trans: false,
  names: '',
  shape: 'ellipse',
  size: 115,
  feather: 5,
  bgfe: 0,
  fill: 'mosaic',
  preset: 'smile',
  sfe: 8
};
function renderXtr() {
  const el = $('#xtrsec');
  if (!el || BC_MODE) return;
  xtrSync();
  XTR.bgrm = false;
  XTR.pinset = false;
  const any = XTR.mosaic || XTR.pinset || XTR.bgrm || XTR.silh;
  const tg = (k, nm, ttl) => '<div class="scard cyc"><div class="hd st"' + (ttl ? ' title="' + ttl + '"' : '') + '><span class="cyv' + (XTR[k] ? '' : ' off') + '" data-xo="' + k + '" role="button" tabindex="0" aria-pressed="' + (XTR[k] ? 'true' : 'false') + '" aria-label="' + nm + '">' + nm + '</span></div></div>';
  const chips = (key, attr, list) => '<div class="prow">' + list.map(([v, l]) => '<button class="pc' + (XTR[key] === v ? ' on' : '') + '" type="button" data-' + attr + '="' + v + '">' + l + '</button>').join('') + '</div>';
  let det = '';
  if (XTR.mosaic) det += '<div class="plbl" style="margin-top:0">가림 모양</div><div class="prow">' + [['rect', '네모'], ['ellipse', '타원']].map(([v, l]) => '<button class="pc' + (XTR.shape === v ? ' on' : '') + '" type="button" data-xs="' + v + '">' + l + '</button>').join('') + '</div>' + '<div class="grow"><span class="k">크기</span><input type="range" data-nmg min="75" max="200" step="1" value="' + XTR.size + '" data-xg="size" aria-label="가림 크기"><span class="v">' + XTR.size + '%</span></div>' + '<div class="grow"><span class="k">페더</span><input type="range" data-nmg min="0" max="40" step="1" value="' + XTR.feather + '" data-xg="feather" aria-label="모자이크 페더"><span class="v">' + XTR.feather + '</span></div>';
  if (XTR.bgrm) det += '<div class="plbl"' + (det ? '' : ' style="margin-top:0"') + '>배경 빼기</div><div class="grow"><span class="k">부드럽게</span><input type="range" data-nmg min="0" max="40" step="1" value="' + XTR.bgfe + '" data-xg="bgfe" aria-label="배경 빼기 부드럽게"><span class="v">' + XTR.bgfe + '</span></div>';
  if (XTR.silh) {
    det += '<div class="plbl"' + (det ? '' : ' style="margin-top:0"') + '>채움</div>' + chips('fill', 'xf', [['mosaic', '모자이크'], ['image', '가면']]);
    if (XTR.fill === 'image') det += chips('preset', 'xp', [['smile', '스마일'], ['black', '가림'], ['heart', '하트']]);
    det += '<div class="grow"><span class="k">페더</span><input type="range" data-nmg min="0" max="40" step="1" value="' + XTR.sfe + '" data-xg="sfe" aria-label="실루엣 페더"><span class="v">' + XTR.sfe + '</span></div>';
  }
  if (XTR.pinset) {
    const used = new Set();
    XTR_GRP.forEach(g => g.pids.forEach(p => used.add(p | 0)));
    if (!XTR_FACES.length) det += '<div class="plbl"' + (det ? '' : ' style="margin-top:0"') + '>등장인물</div>' + '<div class="xnote" style="margin-top:0">' + (XTR_SCAN === 'run' ? (window.nmLoader ? window.nmLoader('solving', '인물을 찾는 중입니다…', {
      size: 15,
      gap: 7,
      fs: 12.5
    }) : '<span class="nm-shim">인물을 찾는 중입니다…</span>') + '<span class="xtime nm-shim">' + fmtT((Date.now() - XTR_SCAN_T0) / 1000) + '</span>' : XTR_SCAN.startsWith('err:') ? esc(XTR_SCAN.slice(4)) : '영상을 넣으면 인물을 찾아 #으로 표시합니다.') + '</div>';
    if (XTR_FACES.length) det += '<div class="plbl"' + (det ? '' : ' style="margin-top:0"') + '>등장인물</div>' + '<div class="xfaces">' + XTR_FACES.map(f => '<span class="xface' + (used.has(f.pid | 0) ? ' used' : '') + '" draggable="true" data-pid="' + (f.pid | 0) + '" title="끌어다 놓거나 탭해서 담습니다">' + (f.url ? '<img loading="lazy" alt="인물 ' + (f.pid | 0) + '" src="' + esc(f.url) + '"' + (f.fb ? ' onerror="tkImgFb(this,\'' + esc(f.fb) + '\')"' : '') + '>' : '') + '<span class="hint">#' + (f.pid | 0) + '</span></span>').join('') + '</div>';
    det += '<div class="plbl"' + (det ? '' : ' style="margin-top:0"') + '>이름</div><div class="xgrp">' + XTR_GRP.map((g, i) => '<div class="xgrow">' + '<input class="nmin" type="text" data-gn="' + i + '" value="' + esc(g.name) + '" placeholder="이름" aria-label="이름 ' + (i + 1) + '" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">' + '<button type="button" class="swc xcol" data-gc="' + i + '" aria-label="이름 ' + (i + 1) + ' 글자색 — 탭할 때마다 기본↔강조" title="글자색 — 탭할 때마다 기본→강조1→강조2"><span class="swd" style="--sw:' + XCOL_CSS[(g.col | 0) % 3] + '"></span></button>' + '<div class="xdrop' + (XTR_ACT === i ? ' act' : '') + '" data-gd="' + i + '" role="group" aria-label="이름 ' + (i + 1) + '에 담긴 번호">' + (g.pids.length ? g.pids.map(p => {
      const fx = XTR_FACES.find(f => (f.pid | 0) === (p | 0));
      return '<span class="xtag" draggable="true" data-gt="' + i + '" data-pid="' + (p | 0) + '" title="탭하면 제외 · 끌어다 놓으면 다른 이름으로 옮깁니다">' + (fx && fx.url ? '<img loading="lazy" alt="" src="' + esc(fx.url) + '">' : '') + '#' + (p | 0) + '</span>';
    }).join('') : '<span class="ph">' + (XTR_ACT === i ? '#을 탭하거나 끌어다 놓으세요' : '여기에 #을 담으세요') + '</span>') + '</div></div>').join('') + '</div><button type="button" class="pc xgadd" id="xgAdd">+ 이름 추가</button>';
  }
  if (XTR.trans) det += '<div class="plbl"' + (det ? '' : ' style="margin-top:0"') + '>번역</div><div class="xnote" style="margin-top:0">외국어 이미지에 한국어 번역을 덮어 씌워 — 켜면 가림(모자이크) 계열은 자동으로 꺼져.</div>';
  const on = [['mosaic', '모자이크'], ['pinset', '트래킹'], ['bgrm', '배경 빼기']].filter(a => XTR[a[0]]).map(a => a[1]);
  el.innerHTML = __nm.h('<div class="sech"><span class="nm">추가 옵션</span></div>' + accShell('xtr', '인물·배경 설정', on.length ? on.join(' · ') : '끔', '<div class="optcards">' + '<div class="cyrow">' + tg('mosaic', '모자이크') + '</div>' + (det ? '<div class="scard"><div class="prm">' + det + '</div></div>' : '') + '</div>' + (any ? '<div class="xnote">켠 옵션은 <strong>생성</strong>에 함께 적용됩니다. 인물을 자동으로 찾아 처리합니다.</div>' : '')) + '<button class="xgo" id="xtrGo" type="button" hidden' + (any ? '' : ' disabled') + '>트래킹</button>');
  void 0;
  el.querySelectorAll('.nmin').forEach(i => {
    if (window.attachCopyPaste) window.attachCopyPaste(i, true);
  });
  xtrSave();
  xgWireDrag(el);
  const nmi = null;
}
function tkApi(id, f, n) {
  return '/api/track?id=' + encodeURIComponent(id) + '&f=' + f + (n ? '&n=' + encodeURIComponent(n) : '');
}
async function tkFetch(id, f, rel) {
  if (id) {
    try {
      const r = await window.fetch(tkApi(id, f) + '&t=' + Date.now());
      if (r.ok) return r;
    } catch (e) {}
  }
  return window.fetch(rel + '?t=' + Date.now());
}
function tkCrop(id, crop, ver) {
  const n = String(crop || '').replace(/^crops\//, '');
  return /^[ps][0-9]{1,3}\.jpg$/.test(n) ? tkApi(id, 'crop', n) : 'track_out/' + id + '/' + crop + '?v=' + encodeURIComponent(ver || '');
}
function tkImgFb(el, rel) {
  if (el.dataset.rt) return;
  el.dataset.rt = '1';
  el.src = __nm.u(rel);
}
async function xtrScan() {
  xtrSync();
  const sk = XTR_SRC;
  if (XTR_RUN[sk]) return;
  const url = $('#url') && $('#url').value.trim() || '';
  if (!hasSrc()) {
    xtrScanSet(sk, 'err:영상이 로딩되지 않았습니다.');
    return;
  }
  XTR_RUN[sk] = {
    t0: Date.now()
  };
  XTR_SCAN = 'run';
  XTR_SCAN_T0 = XTR_RUN[sk].t0;
  renderXtr();
  xscTick(true);
  const done = v => {
    delete XTR_RUN[sk];
    xtrScanSet(sk, v);
  };
  try {
    while (_uploading && Date.now() - XTR_RUN[sk].t0 < 1200e3) {
      await new Promise(r => window.setTimeout(r, 250));
      if (!XTR_RUN[sk]) return;
    }
    if (sk !== xtrKey()) {
      delete XTR_RUN[sk];
      return;
    }
    let payload;
    if (url) payload = {
      url
    };else if (FILE_R2) payload = {
      r2key: FILE_R2,
      name: FILE_NAME || 'video.mp4'
    };else if (FILE_B64) payload = {
      fileB64: FILE_B64,
      name: FILE_NAME || 'video.mp4'
    };else if (_lastFile) {
      const up = await window.nmUpload(_lastFile);
      FILE_R2 = up.key;
      payload = {
        r2key: up.key,
        name: _lastFile.name
      };
    } else {
      done('err:영상 파일을 다시 선택해 주세요.');
      return;
    }
    const res = await window.fetch('/api/track', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const j = await res.json();
    if (!res.ok || j.error || !j.id) {
      done('err:' + String(j.error || '인물 분석을 시작하지 못했습니다. (' + res.status + ')'));
      return;
    }
    if (sk === XTR_SRC) XTR_SCAN_ID = j.id;
    {
      const all = xtrAll(),
        cur = all[sk] || {};
      cur.i = j.id;
      cur.t = Date.now();
      all[sk] = cur;
      xtrWrite(all);
    }
    const t0 = XTR_RUN[sk].t0,
      out = 'track_out/' + j.id + '/tracks.json',
      errp = 'track_out/' + j.id + '/error.log';
    const tick = async () => {
      if (!XTR_RUN[sk]) return;
      if (Date.now() - t0 > 1200e3) {
        done('err:인물 분석이 지연되고 있습니다. 생성할 때 다시 시도합니다.');
        return;
      }
      try {
        const er = await tkFetch(j.id, 'error', errp);
        if (er.ok) {
          const ect = (er.headers.get('content-type') || '').toLowerCase();
          const em = await er.text();
          if (em && em.trim() && !ect.includes('text/html') && !/^\s*<!doctype/i.test(em)) {
            done('err:' + em.trim().slice(0, 80));
            return;
          }
        }
      } catch (e) {}
      try {
        const r = await tkFetch(j.id, 'tracks', out);
        if (r.ok) {
          const ct = (r.headers.get('content-type') || '').toLowerCase();
          const tx = await r.text();
          const isHtml = ct.includes('text/html') || /^\s*<!doctype/i.test(tx) || /<html[\s>]/i.test(tx.slice(0, 300));
          if (tx && tx.trim() && !isHtml) {
            let d = null;
            try {
              d = JSON.parse(tx);
            } catch (e) {}
            if (d && Array.isArray(d.people)) {
              const faces = d.people.filter(p => p && p.crop).slice(0, 32).map(p => ({
                pid: p.pid | 0,
                url: tkCrop(j.id, p.crop, d.meta && d.meta.made || ''),
                fb: 'track_out/' + j.id + '/' + p.crop,
                first: p.first,
                dur: p.dur
              }));
              delete XTR_RUN[sk];
              xtrFaces(sk, faces);
              if (!faces.length) xtrScanSet(sk, 'err:인물을 찾지 못했습니다. 얼굴이 크게 보이는 구간이 필요합니다.');
              return;
            }
          }
        }
      } catch (e) {}
      window.setTimeout(tick, 5000);
    };
    tick();
  } catch (e) {
    done('err:' + String(e && e.message || e).slice(0, 80));
  }
}
function xgPut(pid, gi, move) {
  pid = pid | 0;
  if (!XTR_GRP[gi]) return;
  const had = XTR_GRP[gi].pids.some(p => (p | 0) === pid);
  XTR_GRP.forEach(g => {
    g.pids = g.pids.filter(p => (p | 0) !== pid);
  });
  if (move || !had) XTR_GRP[gi].pids.push(pid);
  renderXtr();
}
function xgWireDrag(el) {
  el.querySelectorAll('.xface[draggable=true], .xtag[draggable=true]').forEach(f => {
    f.addEventListener('dragstart', ev => {
      try {
        ev.dataTransfer.setData('text/plain', f.dataset.pid);
        ev.dataTransfer.effectAllowed = 'move';
      } catch (e) {}
    });
  });
  el.querySelectorAll('[data-gd]').forEach(d => {
    d.addEventListener('dragover', ev => {
      ev.preventDefault();
      try {
        ev.dataTransfer.dropEffect = 'move';
      } catch (e) {}
      d.classList.add('act');
    });
    d.addEventListener('dragleave', () => {
      if (XTR_ACT !== +d.dataset.gd) d.classList.remove('act');
    });
    d.addEventListener('drop', ev => {
      ev.preventDefault();
      let pid = 0;
      try {
        pid = +ev.dataTransfer.getData('text/plain');
      } catch (e) {}
      if (pid) {
        XTR_ACT = +d.dataset.gd;
        xgPut(pid, XTR_ACT, true);
      }
    });
  });
}
function xtrOpts() {
  XTR.bgrm = false;
  if (!(XTR.mosaic || XTR.pinset || XTR.bgrm || XTR.silh)) return null;
  xtrSync();
  const x = {
    mosaic: !!XTR.mosaic,
    pinset: !!XTR.pinset,
    bgrm: !!XTR.bgrm,
    silh: !!XTR.silh
  };
  if (XTR.mosaic || XTR.pinset) {
    x.shape = XTR.shape;
    x.size = XTR.size;
    x.feather = XTR.feather;
  }
  if (XTR.pinset) {
    const nm = {},
      cols = {};
    XTR_GRP.forEach(g => {
      const n = (g.name || '').trim().slice(0, 24);
      if (!n) return;
      const ci = (g.col | 0) % 3;
      g.pids.forEach(p => {
        nm[String(p | 0)] = n;
        if (ci && XCOL_HEX[ci]) cols[String(p | 0)] = XCOL_HEX[ci];
      });
    });
    if (Object.keys(nm).length) x.names = nm;
    if (Object.keys(cols).length) x.colors = cols;
  }
  if (XTR.bgrm) x.bgfe = XTR.bgfe;
  if (XTR.silh) {
    x.fill = XTR.fill;
    x.preset = XTR.preset;
    x.sfe = XTR.sfe;
  }
  return x;
}
const xoCap = el => {
  const h = el.closest && el.closest('.hd.st');
  return h ? h.querySelector(':scope > .cyv[data-xo]:only-child') : null;
};
$('#xtrsec').addEventListener('click', e => {
  const t = e.target.closest('[data-xo]') || xoCap(e.target);
  if (t) {
    const k = t.dataset.xo;
    XTR[k] = !XTR[k];
    if (XTR[k]) {
      if (k === 'trans') {
        XTR.mosaic = XTR.pinset = XTR.bgrm = XTR.silh = false;
      } else {
        XTR.trans = false;
      }
    }
    if (k === 'pinset' && XTR[k] && !XTR_FACES.length && !XTR_RUN[XTR_SRC]) window.setTimeout(xtrScan, 0);
    if (k === 'pinset' && !XTR[k] && XTR_RUN[XTR_SRC]) {
      delete XTR_RUN[XTR_SRC];
      XTR_SCAN = '';
      XTR_SCAN_ID = '';
      xscTick(false);
      xtrSave();
    }
    renderXtr();
    return;
  }
  const sx = e.target.closest('[data-xs]');
  if (sx) {
    XTR.shape = sx.dataset.xs;
    renderXtr();
    return;
  }
  const xf = e.target.closest('[data-xf]');
  if (xf) {
    XTR.fill = xf.dataset.xf === 'image' ? 'image' : 'mosaic';
    renderXtr();
    return;
  }
  const xp = e.target.closest('[data-xp]');
  if (xp) {
    XTR.preset = ['smile', 'black', 'heart'].includes(xp.dataset.xp) ? xp.dataset.xp : 'smile';
    renderXtr();
    return;
  }
  const gc = e.target.closest('[data-gc]');
  if (gc) {
    const g = XTR_GRP[+gc.dataset.gc];
    if (g) {
      g.col = ((g.col | 0) + 1) % 3;
      renderXtr();
    }
    return;
  }
  const gd = e.target.closest('[data-gd]');
  if (gd && !e.target.closest('[data-gt]')) {
    XTR_ACT = +gd.dataset.gd;
    renderXtr();
    return;
  }
  const gt = e.target.closest('[data-gt]');
  if (gt) {
    const i = +gt.dataset.gt,
      pid = +gt.dataset.pid;
    if (XTR_GRP[i]) XTR_GRP[i].pids = XTR_GRP[i].pids.filter(p => (p | 0) !== pid);
    renderXtr();
    return;
  }
  const fc = e.target.closest('.xface');
  if (fc) {
    xgPut(+fc.dataset.pid, XTR_ACT);
    return;
  }
  if (e.target.closest('#xgAdd')) {
    if (XTR_GRP.length < 12) {
      XTR_GRP.push({
        name: '',
        pids: [],
        col: 0
      });
      XTR_ACT = XTR_GRP.length - 1;
      renderXtr();
    }
    return;
  }
  if (e.target.closest('#xtrGo')) {
    const mode = XTR.silh ? 'maskfx' : XTR.bgrm ? 'keying' : XTR.pinset ? 'pinset' : 'mosaic';
    try {
      window.localStorage.setItem('nm_track_preset', JSON.stringify({
        t0: Date.now(),
        mode,
        opts: {
          shape: XTR.shape,
          pxw: 9,
          pxh: 9,
          size: XTR.size,
          feather: XTR.feather
        },
        kfe: XTR.bgfe,
        fill: XTR.fill,
        preset: XTR.preset,
        sfe: XTR.sfe
      }));
    } catch (err) {}
    try {
      window.parent.postMessage({
        nm: 'nmToolTab',
        src: '/track.html'
      }, window.location.origin);
    } catch (err) {}
    return;
  }
});
$('#xtrsec').addEventListener('input', e => {
  if (e.target && e.target.dataset && e.target.dataset.gn !== undefined) {
    const i = +e.target.dataset.gn;
    if (XTR_GRP[i]) XTR_GRP[i].name = e.target.value.slice(0, 24);
    xtrSave();
    return;
  }
  const g = e.target.closest('[data-xg]');
  if (!g) return;
  XTR[g.dataset.xg] = +g.value;
  const v = g.closest('.grow').querySelector('.v');
  if (v) v.textContent = g.value + (g.dataset.xg === 'size' ? '%' : '');
});
renderXtr();
const FILE_ICON = $('#fileTxt').innerHTML;
const fileSlotName = f => {
  $('#fileLab').classList.add('has');
  $('#fileTxt').innerHTML = __nm.h('<span class="ftype">' + esc((f.name.split('.').pop() || 'VID').toUpperCase()) + '</span><span class="fname">' + esc(f.name) + '</span>');
  upMirror(null);
  try {
    if (/^video\//.test(f.type || '')) lyPvSet(f);
  } catch (e) {}
};
const upMirror = p => {
  const el = document.getElementById('pvAttr');
  if (!el) return;
  el.textContent = p == null ? '' : '업로드 ' + p + '%';
  el.style.display = p == null ? '' : 'block';
};
const fileSlotPct = (f, p) => {
  $('#fileLab').classList.add('has');
  $('#fileTxt').innerHTML = __nm.h('<span class="ftype">' + p + '%</span><span class="fname">' + esc(f.name) + '</span>');
  upMirror(p >= 100 ? null : p);
};
const fileSlotClear = () => {
  $('#file').value = '';
  $('#fileLab').classList.remove('has');
  $('#fileTxt').innerHTML = __nm.h(FILE_ICON);
  upMirror(null);
};
const B64_MAX = 30000000;
let _uploading = false;
function legacyRead(f, btn) {
  const rd = new window.FileReader();
  rd.onload = () => {
    if (_lastFile !== f) return;
    FILE_B64 = String(rd.result || '');
    _uploading = false;
    goUpDone(btn);
    fileSlotName(f);
  };
  rd.onerror = () => {
    if (_lastFile !== f) return;
    _lastFile = null;
    _uploading = false;
    goUpDone(btn);
    FILE_NAME = '';
    fileSlotClear();
    errStatus('다시 시도');
  };
  rd.readAsDataURL(f);
}
(function () {
  const sec = document.getElementById('pvsec');
  if (!sec) return;
  sec.addEventListener('dragover', e => {
    const t = e.dataTransfer;
    if (t && Array.from(t.types || []).includes('Files')) {
      e.preventDefault();
      t.dropEffect = 'copy';
      sec.classList.add('dropping');
    }
  });
  sec.addEventListener('dragleave', e => {
    if (!sec.contains(e.relatedTarget)) sec.classList.remove('dropping');
  });
  sec.addEventListener('drop', e => {
    e.preventDefault();
    sec.classList.remove('dropping');
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (!f) return;
    lrTiltApply(f);
    if (!/^video\//.test(f.type || '') && !/\.(mp4|mov|m4v|webm|mkv|avi)$/i.test(f.name || '')) return errStatus('형식 오류');
    const inp = $('#file');
    try {
      const dt = new window.DataTransfer();
      dt.items.add(f);
      inp.files = dt.files;
    } catch (_) {
      return;
    }
    inp.dispatchEvent(new window.Event('change'));
  });
})();
(function () {
  const pick = () => {
    const i = $('#file');
    if (i) i.click();
  };
  const pb = document.getElementById('pvPick');
  if (pb) pb.addEventListener('click', pick);
  const pu = document.getElementById('pvUrl');
  if (pu) {
    pu.title = '탭 = 복사한 영상 주소 붙여넣기';
    pu.setAttribute('role', 'button');
    pu.tabIndex = 0;
    pu.style.cursor = 'pointer';
    const grab = async () => {
      try {
        const t = await window.navigator.clipboard.readText();
        const u = $('#url');
        if (t && /^https?:\/\//i.test(t.trim()) && u) {
          u.value = t.trim();
          pvSync();
        } else errStatus('주소 없음');
      } catch (err) {
        errStatus('권한 막힘');
      }
    };
    pu.addEventListener('click', grab);
    pu.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        grab();
      }
    });
    const pl = document.getElementById('pvLink');
    if (pl) pl.addEventListener('click', grab);
  }
  const sw = document.getElementById('pvSwap');
  if (sw) sw.addEventListener('click', pick);
  const dl = document.getElementById('pvDel');
  if (dl) dl.addEventListener('click', () => {
    $('#file').value = '';
    fileSlotClear();
    if (FILE_R2) window.nmUpDrop(FILE_R2);
    FILE_B64 = '';
    FILE_NAME = '';
    FILE_R2 = '';
    _lastFile = null;
    _varea = 0;
    _vw = 0;
    _vh = 0;
    _dur = 0;
    segsReset();
    CUTS = null;
    CUT_REF = null;
    $('#cutlist').hidden = true;
    $('#cutlist').innerHTML = __nm.h('');
    if (FILE_URL && !_pollLive) {
      try {
        window.URL.revokeObjectURL(FILE_URL);
      } catch (e) {}
    }
    FILE_URL = '';
    const _u = $('#url');
    if (_u) _u.value = '';
    try {
      lyPvSet(null);
    } catch (e) {}
    renderXtr();
    const b = $('#editGo');
    if (b) b.disabled = false;
    setEta();
    render();
  });
})();
$('#file').addEventListener('change', async () => {
  const f = $('#file').files[0];
  if (!f) return;
  if (!/^video\//.test(f.type || '') && !/\.(mp4|mov|m4v|webm|mkv|avi)$/i.test(f.name || '')) {
    $('#file').value = '';
    return errStatus('형식 오류');
  }
  _dockHold = 'src';
  _srcSig = resSig();
  if (FILE_R2) window.nmUpDrop(FILE_R2);
  FILE_B64 = '';
  FILE_NAME = '';
  FILE_R2 = '';
  _lastFile = null;
  _varea = 0;
  _vw = 0;
  _vh = 0;
  _dur = 0;
  {
    const _u0 = $('#url');
    if (_u0) _u0.value = '';
  }
  CUTS = null;
  CUT_REF = null;
  $('#cutlist').hidden = true;
  $('#cutlist').innerHTML = __nm.h('');
  if (FILE_URL && !_pollLive) {
    try {
      window.URL.revokeObjectURL(FILE_URL);
    } catch (e) {}
  }
  FILE_URL = '';
  render();
  if (f.size > 2 * 1024 * 1024 * 1024) {
    fileSlotClear();
    $('#editGo').disabled = false;
    return errStatus('용량 초과');
  }
  const r2on = await window.nmUpArm();
  if ($('#file').files[0] !== f) return;
  if (!r2on && f.size > B64_MAX) {
    fileSlotClear();
    $('#editGo').disabled = false;
    const _w = window.nmUpWhyMsg(1);
    return errStatus(_w === '로그인 만료' ? '재로그인' : _w || '용량 초과');
  }
  segsReset();
  FILE_NAME = f.name;
  FILE_URL = window.URL.createObjectURL(f);
  render();
  lrTiltApply(f);
  const v = document.createElement('video');
  v.preload = 'metadata';
  v.src = __nm.u(FILE_URL);
  v.onloadedmetadata = () => {
    if (_lastFile !== f) return;
    _dur = v.duration || 0;
    _vw = v.videoWidth || 0;
    _vh = v.videoHeight || 0;
    _varea = _vw * _vh;
    setEta();
    pvSync();
    if (ON.res) render();
    if (_dur > LEN_HARD && !BC_MODE) errStatus('길이 초과');
  };
  const btn = upBtn();
  _uploading = true;
  goUpBusy(btn);
  _lastFile = f;
  renderXtr();
  if (!r2on) {
    legacyRead(f, btn);
    return;
  }
  fileSlotPct(f, 0);
  try {
    const up = await window.nmUpload(f, p => {
      if (_lastFile === f) fileSlotPct(f, p);
    });
    if (_lastFile !== f) {
      window.nmUpDrop(up.key);
      return;
    }
    FILE_R2 = up.key;
    _uploading = false;
    goUpDone(btn);
    fileSlotName(f);
  } catch (e) {
    if (_lastFile !== f) return;
    if (f.size <= B64_MAX) {
      legacyRead(f, btn);
      return;
    }
    _uploading = false;
    goUpDone(btn);
    _lastFile = null;
    FILE_NAME = '';
    fileSlotClear();
    errStatus('다시 시도');
  }
});
$('#urlClip').addEventListener('click', async () => {
  try {
    const t = await window.navigator.clipboard.readText();
    if (t) {
      $('#url').value = t.trim();
      pvSync();
    }
  } catch (e) {}
});
$('#url').addEventListener('input', () => pvSync());
const AR_NUM = {
  '9:16': 9 / 16,
  '1:1': 1,
  '4:5': 4 / 5,
  '16:9': 16 / 9
};
const SIZE_BASE = P.size;
function outAr() {
  if (ON.screen && AR_NUM[P.ar]) return AR_NUM[P.ar];
  return _vw && _vh ? _vw / _vh : 0;
}
const sizeFor = a => a ? Math.round(SIZE_BASE * Math.min(1, a)) : SIZE_BASE;
const POS_BASE = P.pos,
  POS_WIDE = 38;
const posFor = a => a >= 1.5 ? POS_WIDE : POS_BASE;
function posAuto() {
  if (P.posman) return false;
  const v = posFor(outAr());
  if (v === P.pos) return false;
  P.pos = v;
  const g = document.querySelector('input[data-g="pos"]');
  if (g) {
    g.value = v;
    const t = g.closest('.grow').querySelector('.v');
    if (t) t.textContent = gvTxt('pos', v, '%');
  }
  return true;
}
function sizeAuto() {
  posAuto();
  if (P.sizeman) return false;
  const v = sizeFor(outAr());
  if (v === P.size) return false;
  P.size = v;
  const g = document.querySelector('input[data-g="size"]');
  if (g) {
    g.value = v;
    const t = g.closest('.grow').querySelector('.v');
    if (t) t.textContent = gvTxt('size', v, '‰');
  }
  return true;
}
let _fit = null,
  _posSnap = 50;
function cropLayout() {
  const v = $('#scrubVid'),
    fr = $('#cropFr');
  const dw = v.clientWidth,
    dh = v.clientHeight;
  if (!dw || !dh) return false;
  const target = AR_NUM[P.ar];
  if (!target) return false;
  const cur = dw / dh;
  let fw = dw,
    fh = dh;
  if (Math.abs(target - cur) >= 1e-3) {
    if (target < cur) fw = dh * target;else fh = dw / target;
  }
  fr.style.width = fw + 'px';
  fr.style.height = fh + 'px';
  const p = P.vpos / 100;
  fr.style.left = (fw < dw ? p * (dw - fw) : 0) + 'px';
  fr.style.top = (fh < dh ? p * (dh - fh) : 0) + 'px';
  const pan = Math.max(dw - fw, dh - fh);
  fr.style.pointerEvents = pan < 2 ? 'none' : 'auto';
  fr.style.cursor = pan < 2 ? 'default' : 'grab';
  _fit = {
    dw,
    dh,
    fw,
    fh,
    horiz: fw < dw
  };
  return true;
}
function syncVposUI() {
  const g = $('#stack input[data-g="vpos"]');
  if (g) {
    g.value = P.vpos;
    const vv = g.closest('.grow').querySelector('.v');
    if (vv) vv.textContent = P.vpos + '%';
  }
}
function scrubOpen() {
  if (!FILE_URL) return;
  _posSnap = P.vpos;
  const v = $('#scrubVid');
  if (v.dataset.src !== FILE_URL) {
    v.src = __nm.u(FILE_URL);
    v.dataset.src = __nm.u(FILE_URL);
  }
  $('#scrub').hidden = false;
  v.onloadedmetadata = () => {
    $('#scrubT').max = String(v.duration || 10);
    cropLayout();
  };
  let _try = 0;
  const kick = () => {
    if ($('#scrub').hidden) return;
    if (!cropLayout() && _try++ < 10) window.requestAnimationFrame(kick);
  };
  window.requestAnimationFrame(kick);
}
function scrubClose() {
  $('#scrub').hidden = true;
  const v = $('#scrubVid');
  try {
    v.pause();
  } catch (e) {}
}
document.addEventListener('click', e => {
  if (e.target.closest('#posPrev')) scrubOpen();
});
$('#scrubT').addEventListener('input', () => {
  const v = $('#scrubVid');
  try {
    v.currentTime = +$('#scrubT').value;
  } catch (e) {}
  $('#scrubTv').textContent = fmtT(+$('#scrubT').value);
});
(function () {
  const fr = $('#cropFr');
  let drag = null;
  fr.addEventListener('pointerdown', e => {
    if (!_fit) return;
    drag = {
      x: __nm.cx(e),
      y: __nm.cy(e),
      l: parseFloat(fr.style.left) || 0,
      t: parseFloat(fr.style.top) || 0
    };
    fr.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  fr.addEventListener('pointermove', e => {
    if (!drag || !_fit) return;
    if (_fit.horiz) {
      const l = Math.max(0, Math.min(_fit.dw - _fit.fw, drag.l + __nm.cx(e) - drag.x));
      fr.style.left = l + 'px';
      P.vpos = Math.round(_fit.dw - _fit.fw ? l / (_fit.dw - _fit.fw) * 100 : 50);
    } else {
      const t = Math.max(0, Math.min(_fit.dh - _fit.fh, drag.t + __nm.cy(e) - drag.y));
      fr.style.top = t + 'px';
      P.vpos = Math.round(_fit.dh - _fit.fh ? t / (_fit.dh - _fit.fh) * 100 : 50);
    }
    syncVposUI();
  });
  fr.addEventListener('pointerup', () => {
    drag = null;
  });
})();
$('#scrubCancel').addEventListener('click', () => {
  P.vpos = _posSnap;
  syncVposUI();
  scrubClose();
});
$('#scrubOk').addEventListener('click', scrubClose);
function errStatus(m) {
  const g = goBtn();
  if (!g) return;
  if (!g.dataset.label) g.dataset.label = '생성';
  window.clearTimeout(g._errT);
  window.clearTimeout(_goFT2);
  window.clearTimeout(_goFT3);
  g.classList.remove('firing', 'okdone', 'checking');
  g.removeAttribute('aria-busy');
  g.textContent = m;
  g.setAttribute('aria-live', 'assertive');
  g.classList.add('err');
  g.classList.remove('shake');
  void g.offsetWidth;
  g.classList.add('shake');
  g._errT = window.setTimeout(() => {
    g.classList.remove('err', 'shake');
    if (BC_MODE && _ftRun) goBusy(g);else g.textContent = g.dataset.label;
    setEta();
  }, 1700);
}
const fmtT = s => {
  s = Math.max(0, Math.round(s));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
};
let _goFT2 = null,
  _goFT3 = null;
function goFireStart(g) {
  if (!g.dataset.label) g.dataset.label = '생성';
  window.clearTimeout(g._errT);
  window.clearTimeout(_goFT2);
  window.clearTimeout(_goFT3);
  g.classList.remove('firing', 'okdone', 'checking', 'err', 'shake');
  void g.offsetWidth;
  g.classList.add('firing');
  g.textContent = '요청 전송';
  g.setAttribute('aria-busy', 'true');
  g._fireT0 = Date.now();
}
function goFireOk(g) {
  const hold = Math.max(0, 900 - (Date.now() - (g._fireT0 || 0)));
  _goFT2 = window.setTimeout(() => {
    g.classList.remove('firing');
    g.classList.add('okdone', 'checking');
    g.innerHTML = __nm.h('<svg class="gck" viewBox="0 0 24 24" role="img" aria-label="전송됨"><path d="M5 13l4 4L19 7"/></svg>');
    g.removeAttribute('aria-busy');
    _goFT3 = window.setTimeout(() => {
      goFireDone(g);
    }, 560);
  }, hold);
}
function goBusy(g) {
  window.clearTimeout(_goFT2);
  window.clearTimeout(_goFT3);
  g.classList.remove('firing', 'okdone', 'checking', 'err', 'shake');
  g.classList.add('busy');
  g.innerHTML = __nm.h(window.nmLoader ? window.nmLoader('solving', '제작중…', {
    size: 15,
    gap: 7,
    fs: 12.5
  }) : '생성 중<span class="gdots"><i>.</i><i>.</i><i>.</i></span>');
  g.setAttribute('aria-busy', 'true');
}
function goUpBusy(g) {
  if (!g) return;
  window.clearTimeout(_goFT2);
  window.clearTimeout(_goFT3);
  g.classList.remove('firing', 'okdone', 'checking', 'err', 'shake');
  g.classList.add('busy');
  g.textContent = '업로드 중…';
  g.setAttribute('aria-busy', 'true');
  g.setAttribute('aria-disabled', 'true');
}
function goUpDone(g) {
  if (!g) return;
  g.removeAttribute('aria-disabled');
  g.disabled = false;
  goFireDone(g);
}
function goFireDone(g) {
  window.clearTimeout(_goFT2);
  window.clearTimeout(_goFT3);
  g.classList.remove('firing', 'okdone', 'checking', 'busy', 'err', 'shake');
  g.removeAttribute('aria-busy');
  g.textContent = g.dataset.label || '생성';
  setEta();
}
function goFireFail(g) {
  window.clearTimeout(_goFT2);
  window.clearTimeout(_goFT3);
  g.classList.remove('firing', 'okdone', 'checking', 'busy');
  g.removeAttribute('aria-busy');
  g.textContent = g.dataset.label || '생성';
  setEta();
}
let _firing = false;
function goHeal() {
  const g = document.getElementById('editGo');
  if (!g) return;
  if (_firing || _uploading) return;
  if (g.classList.contains('firing') || g.classList.contains('busy') || g.disabled) {
    goFireDone(g);
    g.disabled = false;
  }
}
window.addEventListener('pageshow', e => {
  if (e.persisted) goHeal();
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) goHeal();
});
function fireSegs() {
  const raw = [];
  for (const g of P.segs || []) {
    const a = Math.max(0, parseFloat(g.s) || 0);
    const be = String(g.e == null ? '' : g.e).trim();
    let b = parseFloat(be);
    if (be === '') b = _dur > a + 0.2 ? _dur : 3600;
    if (!Number.isFinite(b) || b <= a + 0.2) continue;
    raw.push([Math.round(a * 100) / 100, Math.round(b * 100) / 100]);
  }
  raw.sort((x, y) => x[0] - y[0]);
  const m = [];
  for (const g of raw) {
    const L = m[m.length - 1];
    if (L && g[0] <= L[1] + 0.05) L[1] = Math.max(L[1], g[1]);else m.push(g);
  }
  return m.slice(0, SEG_MAX);
}
function buildOpts(scan) {
  const o = {};
  if (scan) return {
    cutscan: true,
    cut: !!ON.cut,
    cutlv: P.cutlv,
    cutfill: !!P.cutfill,
    take: !!P.take
  };
  if (ON.sub) {
    o.burn = true;
    o.lang = P.lang;
    o.tone = P.tone;
    o.stt_lang = P.slang || 'auto';
    o.filler = P.filler;
    o.style = P.style;
    o.karaoke = P.karaoke;
    o.hi = P.hi;
    o.pop = P.pop;
    o.keyword = P.keyword;
    o.pos = P.pos;
    o.bg = P.bg;
    sizeAuto();
    o.size = Math.round(P.size) / 1000;
    if (!P.sizeman && !outAr()) o.size_auto = true;
    o.outline = Math.round(P.sh * 10) / 1000;
    o.pad = Math.min(.5, Math.max(0, Math.round(P.sh) / 1000));
    o.oc = P.shc;
    o.font = P.font;
    o.fg = P.fg;
    o.kwc = P.kwc || 'green';
    if (P.glow > 0) o.glow = Math.round(P.glow);
    o.shtype = P.shtype;
    if (P.shtype === 'box') o.bg = Math.max(1, P.bg);else o.bg = 0;
  }
  if (ON.sub && ON.trn) o.lang = 'dual';
  if (ON.sub && o.lang === 'dual') o.dual_small = Math.round(srcRatio() * 100) / 100;
  if (ON.sub && o.lang === 'dual') o.dual_gap = Math.round(Math.max(0, Math.min(60, +P.lgap || 0))) / 100;
  if (ON.bgm) o.bgm = true;
  if (ON.cut) {
    o.cut = true;
    o.cutlv = P.cutlv;
    if (P.cutfill) o.cutfill = true;
    if (P.take) o.take = true;
    if (!ON.sub) o.burn = false;
  }
  if (ON.trim) {
    const ss = fireSegs();
    if (ss.length === 1) {
      if (ss[0][0] > 0) o.vid_t0 = ss[0][0];
      o.vid_t1 = ss[0][1];
    } else if (ss.length > 1) {
      o.vid_segs = ss;
      if (P.xfade > 0) o.vid_xfade = Math.round(P.xfade);
    }
  }
  if (ON.screen) {
    o.vid_ar = P.ar;
    o.vid_fit = P.fit;
    if (P.fit === 'crop') o.vid_pos = Math.round(P.vpos) / 100;
  }
  if (ON.res) o.vid_res = P.res;
  if (ON.fps) o.vid_fps = P.fps;
  if (ON.anorm) o.aud_norm = true;
  if (ON.sdr) o.vid_sdr = true;
  {
    const xo = xtrOpts();
    if (xo) o.xtr = xo;
  }
  if (CUT_REF) {
    delete o.cut;
    delete o.cutlv;
    delete o.cutfill;
    delete o.take;
    o.cutref = CUT_REF.id;
    if (CUT_REF.off.length) o.cutoff = CUT_REF.off.join(',');
    if (!ON.sub) o.burn = false;
  }
  return o;
}
$('#editGo').addEventListener('click', async () => {
  if (_uploading) return errStatus('진행중...');
  if (_firing) return;
  const _scan = SCAN_ONCE;
  SCAN_ONCE = false;
  const url = $('#url').value.trim();
  if (!url && !FILE_B64 && !FILE_R2 && !_lastFile) return errStatus('입력 필요');
  if (url && !/^https?:\/\//i.test(url)) return errStatus('주소 오류');
  if (!ORDER.some(k => ON[k]) && !CUT_REF && !xtrOpts()) return errStatus('선택 필요');
  if (!_scan && ON.trim && (P.segs || []).length && !fireSegs().length) {
    accSet('cuts', true);
    return errStatus('구간 오류');
  }
  const o = buildOpts(_scan);
  if (o.vid_t0 !== undefined && o.vid_t1 !== undefined && o.vid_t1 <= o.vid_t0) {
    accSet('cuts', true);
    return errStatus('구간 오류');
  }
  if (_dur) {
    const stt = !!(o.burn || o.cut || o.cutfill || o.take || o.cutscan);
    const segSum = o.vid_segs ? o.vid_segs.reduce((s, g) => s + (g[1] - g[0]), 0) : -1;
    const span = segSum >= 0 ? segSum : o.vid_t1 !== undefined ? o.vid_t1 - (o.vid_t0 || 0) : -1;
    if (stt) {
      if (_dur > LEN_STT) return errStatus('길이 초과');
    } else if (span >= 0 && span <= 600) {
      if (_dur > LEN_HARD) return errStatus('길이 초과');
    } else if (_dur > LEN_WHOLE) return errStatus('길이 초과');
  }
  if (o.vid_res === 'src' && !url && _varea > 2 * 2073600 && !o.cut) {
    const eff = o.vid_segs ? o.vid_segs.reduce((s, g) => s + (g[1] - g[0]), 0) : o.vid_t0 !== undefined || o.vid_t1 !== undefined ? Math.min(_dur || 1e9, o.vid_t1 || _dur || 1e9) - (o.vid_t0 || 0) : _dur;
    if (eff && eff > 181) return errStatus('길이 초과');
  }
  USER_ACT = true;
  _dockHold = null;
  const status = $('#cstatus');
  status.classList.remove('err');
  status.textContent = '';
  const gb = $('#editGo');
  gb.disabled = true;
  if (url && FILE_R2) {
    window.nmUpDrop(FILE_R2);
    FILE_R2 = '';
  }
  if (!url && !FILE_B64 && !FILE_R2 && _lastFile) {
    const f = _lastFile;
    try {
      fileSlotPct(f, 0);
      const up = await window.nmUpload(f, p => {
        if (_lastFile === f) fileSlotPct(f, p);
      });
      FILE_R2 = up.key;
      fileSlotName(f);
    } catch (e) {
      gb.disabled = false;
      return errStatus('다시 시도');
    }
  }
  const t0 = Date.now();
  gb.disabled = false;
  goFireStart(gb);
  _firing = true;
  try {
    const _enm = (url ? '' : String(FILE_NAME || '')).replace(/\.[A-Za-z0-9]+$/, '').replace(/\s+/g, ' ').trim();
    const _elbl = _enm ? _enm.slice(0, 16) + (_enm.length > 16 ? '…' : '') : editLbl(o);
    const payload = url ? {
      url,
      opts: o,
      lbl: _elbl
    } : FILE_R2 ? {
      r2key: FILE_R2,
      name: FILE_NAME,
      opts: o,
      lbl: _elbl
    } : {
      fileB64: FILE_B64,
      name: FILE_NAME,
      opts: o,
      lbl: _elbl
    };
    const _sig = typeof window.AbortSignal !== 'undefined' && window.AbortSignal.timeout ? window.AbortSignal.timeout(payload.fileB64 ? 180000 : 60000) : null;
    const res = await window.fetch(API, Object.assign({
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    }, _sig ? {
      signal: _sig
    } : {}));
    const j = await res.json();
    if (!res.ok || j.error) {
      goFireFail(gb);
      const _msg = String(j.error || '서버 오류 ' + res.status + ' — 재시도');
      status.innerHTML = __nm.h(window.WARN_SVG + ' ' + esc(_msg));
      status.classList.add('err');
      if (FILE_R2 && /업로드 키|업로드 파일이 없어|업로드 미설정/.test(_msg)) {
        window.nmUpDrop(FILE_R2);
        FILE_R2 = '';
      }
      return;
    }
    if (FILE_R2 && window.nmUpUsed) window.nmUpUsed(FILE_R2);
    try {
      EDIT_SUB = false;
      lyHideEditor();
      lyBurnReset();
    } catch (e) {}
    CUT_REF = null;
    pendSet({
      id: j.id,
      t0,
      lbl: _elbl,
      cutscan: o.cutscan ? 1 : 0
    });
    xtrJobSet(j.id, XTR_SRC);
    jobCfgSet(j.id);
    goFireOk(gb);
    pollEdit(j.id, t0, t0 - 90000, editLbl(o), o.cutscan ? 'cutscan' : '');
  } catch (e) {
    goFireFail(gb);
    const _to = e && (e.name === 'TimeoutError' || e.name === 'AbortError');
    status.innerHTML = __nm.h(window.WARN_SVG + (_to ? ' 접수가 응답이 없어 — 회선 확인하고 다시 (버튼은 다시 눌러도 됨)' : ' 요청 실패 — 재시도 (' + esc(e.message) + ')'));
    status.classList.add('err');
  } finally {
    _firing = false;
    $('#editGo').disabled = false;
  }
});
function editLbl(o) {
  return o.cutscan ? '자를 곳 찾는 중' : '편집 중';
}
function pollEdit(id, t0, minTs, wlbl, kind, focus) {
  focus = focus !== false;
  if (window.nmJobs && window.nmJobs.busy(PEND_KEY, id)) return;
  if (!focus) {
    pollEditBg(id, t0, minTs, kind);
    return;
  }
  EDIT_ID = id;
  const status = $('#cstatus');
  status.classList.remove('err');
  if (kind === 'cutscan') {
    $('#cutlist').hidden = true;
    $('#cutlist').innerHTML = __nm.h('');
  }
  const vw = $('#vwrap');
  dlPark();
  vw.hidden = true;
  vw.classList.remove('alpha');
  $('#dlVid').hidden = true;
  $('#dlVid').classList.remove('dl-done');
  const wsrc = FILE_URL || '';
  vw.innerHTML = __nm.h((wsrc ? '<video class="wv" muted loop playsinline preload="metadata" src="' + esc(wsrc) + '"></video>' : '') + '<div class="wscrim"></div><div class="scanline"></div>' + '<div class="wcorner" aria-hidden="true"></div>' + '<div class="wmsg">' + (window.nmLoader ? window.nmLoader('solving', '제작중') : esc(wlbl || '편집 중') + '<span class="gdots"><i>.</i><i>.</i><i>.</i></span>') + '</div>');
  dockSync();
  const wv = vw.querySelector('.wv');
  if (wv) {
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
      wv.removeAttribute('loop');
      wv.addEventListener('loadedmetadata', () => {
        try {
          wv.currentTime = .01;
        } catch (e) {}
      }, {
        once: true
      });
    } else {
      wv.play().catch(() => {});
    }
  }
  status.innerHTML = __nm.h('<span class="sronly">' + esc(wlbl || '편집 중') + '</span>');
  const wclear = () => {
    dlPark();
    vw.innerHTML = __nm.h('');
    vw.hidden = true;
  };
  const outPath = 'ly_out/' + id + '/' + (kind === 'cutscan' ? 'cuts.json' : 'video.json');
  const errPath = 'ly_out/' + id + '/error.log';
  _pollLive = !!wsrc;
  _polling = true;
  const mine = () => EDIT_ID === id;
  const bgLand = d => {
    try {
      if (d && d.url && window.nmRail) window.nmRail.add({
        url: String(d.url),
        poster: String(d.poster || ''),
        cap: '편집',
        dlname: String(d.url).split('/').pop() || 'video.mp4'
      });
    } catch (e) {}
    try {
      loadJobLib();
    } catch (e) {}
  };
  let live = true;
  const stop = () => {
    live = false;
    if (mine()) {
      _pollLive = false;
      _polling = false;
    }
    window.clearInterval(disp);
    try {
      window.nmJobs.free(PEND_KEY, id);
    } catch (e) {}
  };
  try {
    window.nmJobs.hold(PEND_KEY, id, stop);
  } catch (e) {}
  const draw = () => {
    if (!live) return;
    const sec = Math.round((Date.now() - t0) / 1000);
    if (sec > BUDGET * 2) {
      const _m = mine();
      stop();
      pendClear(id);
      if (!_m) return;
      wclear();
      goFireDone($('#editGo'));
      status.innerHTML = __nm.h(window.ERR_SVG + ' 시간 초과 — 완성되면 다음에 열 때 이어받아');
      status.classList.add('err');
      return;
    }
    if (!mine()) return;
    const ws = vw.querySelector('.wcorner');
    if (ws) {
      const km = x => {
        x = Math.max(0, x | 0);
        return Math.floor(x / 60) + '분 ' + String(x % 60).padStart(2, '0') + '초';
      };
      const eta = (EDIT_STATS && EDIT_STATS['edit-make/edit'] && EDIT_STATS['edit-make/edit'].dur) | 0;
      ws.innerHTML = __nm.h('<span class="wc-hi">' + km(sec) + ' 경과</span>' + (eta ? ' (예상 ' + km(eta) + ')' : ''));
    }
  };
  const disp = window.setInterval(draw, 1000);
  draw();
  const tick = async () => {
    if (!live) return;
    try {
      const er = await window.fetch(errPath + '?t=' + Date.now());
      if (!live) return;
      if (er.ok) {
        const ect = (er.headers.get('content-type') || '').toLowerCase();
        const em = await er.text();
        if (!live) return;
        const eHtml = ect.includes('text/html') || /^\s*<!doctype/i.test(em) || /<html[\s>]/i.test(em.slice(0, 300));
        if (em && em.trim() && !eHtml) {
          const _m = mine();
          stop();
          pendClear(id);
          if (!_m) {
            try {
              loadJobLib();
            } catch (e) {}
            return;
          }
          wclear();
          goFireDone($('#editGo'));
          status.innerHTML = __nm.h(window.ERR_SVG + ' ' + esc(em.trim()));
          status.classList.add('err');
          return;
        }
      }
    } catch (e) {}
    try {
      let ct = '',
        tx = '',
        got = false;
      if (kind !== 'cutscan') {
        try {
          const rr = await window.fetch('/api/edit?stat=' + encodeURIComponent(id) + '&t=' + Date.now(), {
            cache: 'no-store'
          });
          if (!live) return;
          if (rr.ok) {
            tx = await rr.text();
            ct = 'application/json';
            got = true;
          }
        } catch (e) {}
      }
      const r = got ? null : await window.fetch(outPath + '?t=' + Date.now());
      if (!live) return;
      if (got || r && r.ok) {
        if (!got) {
          ct = (r.headers.get('content-type') || '').toLowerCase();
          tx = await r.text();
        }
        if (!live) return;
        const isHtml = ct.includes('text/html') || /^\s*<!doctype/i.test(tx) || /<html[\s>]/i.test(tx.slice(0, 300));
        if (tx && tx.trim() && !isHtml) {
          let d = null;
          try {
            d = JSON.parse(tx);
          } catch (e) {}
          if (d && Array.isArray(d.faces)) xtrFaces(xtrJobKey(id) || XTR_SRC, d.faces.slice(0, 32));
          if (d && (kind === 'cutscan' ? Array.isArray(d.rm) : (d.url || d.error || d.skip) && !d.xtr_wait)) {
            const ts = Date.parse(d.ts || '');
            if (!isNaN(ts) && ts >= minTs) {
              const _m = mine();
              stop();
              pendClear(id);
              if (!_m) {
                bgLand(d);
                return;
              }
              goFireDone($('#editGo'));
              if (kind === 'cutscan') {
                wclear();
                showCuts(d, id);
              } else if (d.url) {
                showResult(d, Math.round((Date.now() - t0) / 1000));
                editSubsInit(id);
              } else {
                wclear();
                status.innerHTML = __nm.h(window.ERR_SVG + ' ' + esc(String(d.error || d.skip)) + (d.xtr_note ? ' · ' + esc(d.xtr_note) : ''));
                status.classList.add('err');
              }
              return;
            }
          }
        }
      }
    } catch (e) {}
    if (live) window.setTimeout(tick, 5000);
  };
  tick();
}
function pollEditBg(id, t0, minTs, kind) {
  const outPath = 'ly_out/' + id + '/' + (kind === 'cutscan' ? 'cuts.json' : 'video.json');
  const errPath = 'ly_out/' + id + '/error.log';
  let live = true;
  const stop = () => {
    live = false;
    try {
      window.nmJobs.free(PEND_KEY, id);
    } catch (e) {}
  };
  try {
    if (!window.nmJobs.hold(PEND_KEY, id, stop)) return;
  } catch (e) {}
  const tick = async () => {
    if (!live) return;
    if (Date.now() - t0 > BUDGET * 2000) {
      stop();
      pendClear(id);
      return;
    }
    try {
      const er = await window.fetch(errPath + '?t=' + Date.now());
      if (!live) return;
      if (er.ok) {
        const ect = (er.headers.get('content-type') || '').toLowerCase();
        const em = await er.text();
        if (!live) return;
        const eHtml = ect.includes('text/html') || /^\s*<!doctype/i.test(em) || /<html[\s>]/i.test(em.slice(0, 300));
        if (em && em.trim() && !eHtml) {
          stop();
          pendClear(id);
          try {
            loadJobLib();
          } catch (e) {}
          return;
        }
      }
    } catch (e) {}
    try {
      let ct = '',
        tx = '',
        got = false;
      if (kind !== 'cutscan') {
        try {
          const rr = await window.fetch('/api/edit?stat=' + encodeURIComponent(id) + '&t=' + Date.now(), {
            cache: 'no-store'
          });
          if (!live) return;
          if (rr.ok) {
            tx = await rr.text();
            ct = 'application/json';
            got = true;
          }
        } catch (e) {}
      }
      const r = got ? null : await window.fetch(outPath + '?t=' + Date.now());
      if (!live) return;
      if (got || r && r.ok) {
        if (!got) {
          ct = (r.headers.get('content-type') || '').toLowerCase();
          tx = await r.text();
        }
        if (!live) return;
        const isHtml = ct.includes('text/html') || /^\s*<!doctype/i.test(tx) || /<html[\s>]/i.test(tx.slice(0, 300));
        if (tx && tx.trim() && !isHtml) {
          let d = null;
          try {
            d = JSON.parse(tx);
          } catch (e) {}
          if (d && Array.isArray(d.faces)) xtrFaces(xtrJobKey(id), d.faces.slice(0, 32));
          if (d && (kind === 'cutscan' ? Array.isArray(d.rm) : (d.url || d.error || d.skip) && !d.xtr_wait)) {
            const ts = Date.parse(d.ts || '');
            if (!isNaN(ts) && ts >= minTs) {
              stop();
              pendClear(id);
              try {
                if (d.url && window.nmRail) window.nmRail.add({
                  url: String(d.url),
                  poster: String(d.poster || ''),
                  cap: '편집',
                  dlname: String(d.url).split('/').pop() || 'video.mp4'
                });
              } catch (e) {}
              try {
                loadJobLib();
              } catch (e) {}
              return;
            }
          }
        }
      }
    } catch (e) {}
    if (live) window.setTimeout(tick, 5000);
  };
  tick();
}
if (!BC_MODE) window.nmJobOpen = function (id) {
  if (!id) return;
  let p = null;
  try {
    p = window.nmJobs.get(PEND_KEY, id);
  } catch (e) {}
  if (!p) return;
  if (Date.now() - (p.t0 || 0) > RESUME_MAX_MS) {
    pendClear(id);
    return;
  }
  if (EDIT_ID !== id || !_polling) {
    try {
      window.nmJobs.stopOne(PEND_KEY, id);
    } catch (e) {}
    const t0c = Math.max(p.t0 || 0, Date.now() - BUDGET * 1000);
    pollEdit(id, t0c, (p.t0 || 0) - 90000, p.lbl || '편집 중', p.cutscan ? 'cutscan' : '', true);
  }
  const el = $('#vwrap');
  if (el) {
    el.hidden = false;
    try {
      dockSync();
    } catch (e) {}
    try {
      el.scrollIntoView({
        behavior: LY_RM.matches ? 'auto' : 'smooth',
        block: 'start'
      });
    } catch (e) {}
    el.classList.add('edfocus');
    window.setTimeout(() => el.classList.remove('edfocus'), 2200);
  }
};
let LY_SEGS = null,
  LY_ORIG = null,
  LY_MD = '',
  LY_ID = '',
  LY_OUT = '',
  LY_LANG = '';
let LY_PENDING_SEGS = null,
  LY_RENDERING = false,
  LY_PEND = null,
  LY_MEDIA_URL = '',
  LY_FINDT = null;
let LY_GEN = false,
  LY_SEQ = 0,
  LY_CUR = -1,
  LY_SAVE_T = null;
let LY_EARLY = '';
let LY_RESTORE_PEND = false;
const LY_LAST_KEY = 'nm_editsub_last',
  LY_EDIT_PRE = 'nm_lyedit2_';
const LY_RM = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : {
  matches: false
};
const LYX_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6 18 18M18 6 6 18"/></svg>';
const SPLIT_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5h14"/><path d="M12 10v10"/><path d="m8 16 4 4 4-4"/></svg>';
function fmtClock(s) {
  s = Math.max(0, Math.round(s || 0));
  const h = s / 3600 | 0,
    m = s % 3600 / 60 | 0,
    ss = String(s % 60).padStart(2, '0');
  return h ? h + ':' + String(m).padStart(2, '0') + ':' + ss : m + ':' + ss;
}
function srtTime(s) {
  const ms = Math.max(0, Math.round((s || 0) * 1000));
  const p = (n, l) => String(n).padStart(l, '0');
  return p(ms / 3600000 | 0, 2) + ':' + p(ms % 3600000 / 60000 | 0, 2) + ':' + p(ms % 60000 / 1000 | 0, 2) + ',' + p(ms % 1000, 3);
}
const lyJoin = () => /^(ja|zh|yue|th|lo|my|km)$/.test(LY_LANG) ? '' : ' ';
const lySegText = sg => sg.w.filter(w => w.on).map(w => w.t).join(lyJoin());
function lyModel(rawSegs) {
  return (rawSegs || []).map(sg => {
    const m = {
      s: sg.s != null ? sg.s : null,
      e: sg.e != null ? sg.e : null,
      del: false,
      sel: false,
      w: sg.w && sg.w.length ? sg.w.map(w => ({
        t: w.t,
        s: w.s != null ? w.s : null,
        e: w.e != null ? w.e : null,
        on: true
      })) : String(sg.t || '').split(/\s+/).filter(Boolean).map(t => ({
        t,
        s: null,
        e: null,
        on: true
      }))
    };
    if (sg.k) m.k = sg.k;
    if (sg.f === 'src') m.f = 'src';
    return m;
  }).filter(sg => sg.w.length);
}
function lySaveNow() {
  if (LY_SAVE_T) {
    window.clearTimeout(LY_SAVE_T);
    LY_SAVE_T = null;
  }
  if (!LY_ID || !LY_SEGS) return;
  try {
    window.localStorage.setItem(LY_EDIT_PRE + LY_ID, JSON.stringify({
      ts: Date.now(),
      lang: LY_LANG,
      segs: LY_SEGS,
      base: LY_BASE
    }));
  } catch (e) {}
}
function lySave() {
  window.clearTimeout(LY_SAVE_T);
  LY_SAVE_T = window.setTimeout(lySaveNow, 400);
}
window.addEventListener('pagehide', lySaveNow);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') lySaveNow();
});
function lyPrune() {
  try {
    const ks = [],
      old = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.indexOf(LY_EDIT_PRE) === 0) ks.push(k);else if (k && k.indexOf('nm_lyedit_') === 0) old.push(k);
    }
    old.forEach(k => window.localStorage.removeItem(k));
    if (ks.length > 8) ks.map(k => {
      let ts = 0;
      try {
        ts = JSON.parse(window.localStorage.getItem(k) || '{}').ts || 0;
      } catch (e) {}
      return {
        k,
        ts
      };
    }).sort((a, b) => a.ts - b.ts).slice(0, ks.length - 8).forEach(o => window.localStorage.removeItem(o.k));
  } catch (e) {}
}
let LY_UNDO = null,
  LY_UNDO_T = null;
function lyUndoCap() {
  if (LY_SEGS) LY_UNDO = {
    j: JSON.stringify(LY_SEGS),
    lang: LY_LANG
  };
}
function lyUndoNow() {
  if (!LY_UNDO) return;
  let sv = null;
  try {
    sv = JSON.parse(LY_UNDO.j);
  } catch (e) {}
  if (!sv || !sv.length) return;
  LY_SEGS = sv;
  LY_LANG = LY_UNDO.lang || LY_LANG;
  LY_UNDO = null;
  window.clearTimeout(LY_UNDO_T);
  lyRerender();
  lyMarkFind();
  const st = $('#cstatus');
  st.classList.remove('err');
  st.innerHTML = __nm.h(window.OK_SVG + ' 되돌렸어');
}
function lyUndoExpire() {
  LY_UNDO = null;
  const bb = document.getElementById('lyUndoBtn');
  if (bb) bb.remove();
}
function lyUndoOffer(label) {
  if (!LY_UNDO) return;
  window.clearTimeout(LY_UNDO_T);
  const st = $('#cstatus');
  st.classList.remove('err');
  st.innerHTML = __nm.h(window.OK_SVG + ' ' + esc(label) + '<button type="button" class="lyundo" id="lyUndoBtn">되돌리기</button>');
  const b = document.getElementById('lyUndoBtn');
  if (b) b.onclick = () => lyUndoNow();
  LY_UNDO_T = window.setTimeout(lyUndoExpire, 10000);
}
function lyLand(i) {
  const el = document.querySelector('.lyseg[data-i="' + i + '"]');
  if (!el) return;
  el.classList.remove('land');
  void el.offsetWidth;
  el.classList.add('land');
  window.setTimeout(() => {
    el.classList.remove('land');
  }, 750);
}
const LY_FILLERS = new Set(['음', '어', '아', '에', '으', '흠', '엄', '음음', '어어', '아아', 'um', 'uh', 'uhm', 'umm', 'er', 'erm', 'hmm', 'mm', 'mmm', 'ah', 'eh']);
function lyFillerKey(t) {
  return String(t || '').toLowerCase().replace(/[.,!?…~'"“”‘’()\[\]{}·-]+/g, '').trim();
}
function lyIsFiller(t) {
  return LY_FILLERS.has(lyFillerKey(t));
}
let LY_USRSCROLL = 0;
['wheel', 'touchstart'].forEach(ev => window.addEventListener(ev, () => {
  LY_USRSCROLL = Date.now();
}, {
  passive: true
}));
let LY_BASE = null;
const lyHash = s => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = Math.imul(h, 33) + s.charCodeAt(i) | 0;
  return (h >>> 0).toString(36) + '.' + s.length;
};
const lyStrip = k => String(k || '').replace(/\*([^*\n]{1,24})\*/g, '$1').replace(/\s+/g, ' ').trim();
function lyKo(sg, txt) {
  if (!sg.k) return txt;
  if (txt.replace(/\s+/g, ' ').trim() === lyStrip(sg.k)) return sg.k;
  let out = txt;
  (sg.k.match(/\*([^*\n]{1,24})\*/g) || []).forEach(m => {
    const kw = m.slice(1, -1).trim();
    if (!kw || out.indexOf('*' + kw + '*') >= 0) return;
    out = out.replace(new RegExp('(^|\\s)' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), (a, p) => p + '*' + kw + '*');
  });
  return out;
}
function lyEffSegs(ss) {
  const r2 = x => Math.round(x * 100) / 100,
    fl = t => String(t).replace(/[\r\n\t]+/g, ' ').trim().slice(0, 200);
  const a = (ss || []).filter(sg => !sg.del && sg.s != null && sg.e != null && lySegText(sg)).map(sg => {
    const t = lySegText(sg);
    return sg.f === 'src' ? {
      s: r2(sg.s),
      e: r2(sg.e),
      ko: '',
      src: fl(t)
    } : {
      s: r2(sg.s),
      e: r2(sg.e),
      ko: fl(lyKo(sg, t))
    };
  }).sort((a, b) => a.s - b.s);
  for (let k = 0; k < a.length - 1; k++) if (a[k + 1].s > a[k].s && a[k + 1].s < a[k].e) a[k].e = a[k + 1].s;
  return a;
}
const lyEffHash = ss => lyHash(JSON.stringify(lyEffSegs(ss)));
function lyBaseOf(raw) {
  return raw ? {
    src: raw.src || '',
    sig: raw.sig || '',
    bh: lyEffHash(lyModel(raw.segs))
  } : null;
}
const lyEdited = (segs, base) => !base || lyEffHash(segs) !== base.bh;
function lySubsRaw(j, sig, raw) {
  const anyKo = j.segs.some(s => String(s.ko || '').trim());
  return {
    segs: j.segs.map(s => {
      const ko = String(s.ko || '').trim();
      return {
        s: s.s,
        e: s.e,
        t: lyStrip(ko || s.src),
        w: s.w,
        k: ko,
        f: ko ? 'ko' : 'src'
      };
    }),
    lang: raw && raw.lang || '',
    tlang: anyKo ? 'ko' : raw && raw.lang || '',
    dur: raw && raw.dur || 0,
    src: 'subs',
    sig
  };
}
async function lyGetJson(url) {
  for (let k = 0; k < 2; k++) {
    try {
      const r = await window.fetch(url + '?t=' + Date.now());
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(String(r.status));
      const ct = (r.headers.get('content-type') || '').toLowerCase();
      const tx = await r.text();
      if (ct.includes('text/html') || /^\s*</.test(tx)) return null;
      const j = JSON.parse(tx);
      return j && j.segs && j.segs.length ? {
        j,
        sig: lyHash(tx)
      } : null;
    } catch (e) {
      if (k) return undefined;
      await new Promise(f => window.setTimeout(f, 1200));
    }
  }
}
async function lyFetchSegs(outPath) {
  const at = n => outPath.replace(/[^/]+$/, n);
  const [sj, rw] = await Promise.all([lyGetJson(at('subs.json')), lyGetJson(at('segments.json'))]);
  const raw = rw ? rw.j : null;
  if (sj) return lySubsRaw(sj.j, sj.sig, raw);
  if (sj === undefined) return null;
  if (raw) return {
    segs: raw.segs,
    lang: raw.lang || '',
    tlang: raw.lang || '',
    dur: raw.dur || 0,
    src: 'stt',
    sig: rw.sig
  };
  if (LY_PENDING_SEGS && LY_PENDING_SEGS.length) return {
    segs: LY_PENDING_SEGS,
    lang: '',
    tlang: '',
    dur: 0,
    src: 'pend',
    sig: ''
  };
  return null;
}
async function lyOrigRaw() {
  if (!LY_OUT) return LY_ORIG;
  const o = await lyGetJson(LY_OUT.replace(/[^/]+$/, 'subs.orig.json'));
  return o ? lySubsRaw(o.j, o.sig, LY_ORIG) : LY_ORIG;
}
async function lyRebase(st) {
  if (!LY_OUT || !LY_BASE || LY_BASE.src !== 'subs') return true;
  const fresh = await lyFetchSegs(LY_OUT);
  if ((!fresh || fresh.src !== 'subs') && lyEdited(LY_SEGS, LY_BASE)) {
    st.classList.add('err');
    st.innerHTML = __nm.h(window.WARN_SVG + ' 지금 서버 자막을 못 읽었어 — 다른 곳에서 고친 걸 덮을 수 있어서 멈췄어. 잠시 뒤 다시 눌러줘');
    return false;
  }
  if (!fresh || fresh.src !== 'subs' || fresh.sig === LY_BASE.sig) return true;
  const fh = lyEffHash(lyModel(fresh.segs));
  if (fh === LY_BASE.bh || fh === LY_BASE.sent) {
    if (!LY_RESTORE_PEND) LY_ORIG = fresh;
    LY_BASE = Object.assign(lyBaseOf(fresh), {
      sent: LY_BASE.sent
    });
    return true;
  }
  if (!lyEdited(LY_SEGS, LY_BASE)) {
    LY_ORIG = fresh;
    LY_BASE = lyBaseOf(fresh);
    LY_SEGS = lyModel(fresh.segs);
    LY_LANG = fresh.tlang || LY_LANG;
    lyRerender();
    return true;
  }
  st.classList.add('err');
  st.innerHTML = __nm.h(window.WARN_SVG + ' 그 사이 다른 곳에서 이 자막을 다시 구웠어 — 그대로 구우면 그쪽 수정이 덮여<button type="button" class="lyundo" id="lyTakeFresh">최신본 받기</button><button type="button" class="lyundo" id="lyKeepMine">내 편집으로 덮기</button>');
  const tf = document.getElementById('lyTakeFresh'),
    km = document.getElementById('lyKeepMine');
  if (tf) tf.onclick = () => {
    lyUndoCap();
    LY_ORIG = fresh;
    LY_BASE = lyBaseOf(fresh);
    LY_SEGS = lyModel(fresh.segs);
    LY_LANG = fresh.tlang || LY_LANG;
    LY_ADJ = null;
    lyRerender();
    lyUndoOffer('최신 자막을 받았어');
  };
  if (km) km.onclick = () => {
    LY_ORIG = fresh;
    LY_BASE = lyBaseOf(fresh);
    lySave();
    st.classList.remove('err');
    st.innerHTML = __nm.h(window.OK_SVG + ' 내 편집으로 덮을게 — 다시 입히기를 한 번 더 눌러');
  };
  return false;
}
async function lyResult(outPath, md, fresh, preSegs) {
  const seq = ++LY_SEQ;
  const id = (outPath.match(/ly_out\/([^\/]+)\//) || [])[1] || '';
  if (fresh !== false && md) {
    try {
      window.localStorage.setItem(LY_LAST_KEY, JSON.stringify({
        out: outPath,
        ts: Date.now()
      }));
    } catch (e) {}
  }
  const raw = preSegs || (await lyFetchSegs(outPath));
  if (seq !== LY_SEQ) return;
  if (fresh === false && LY_GEN) return;
  const sameJob = LY_ID === id && LY_SEGS && LY_SEGS.length;
  if (sameJob) {
    const a = document.activeElement;
    if (a && a.isContentEditable && a.classList && a.classList.contains('ed-chip')) a.blur();
    lySaveNow();
  }
  LY_OUT = outPath;
  LY_ID = id;
  let saved = null;
  try {
    saved = JSON.parse(window.localStorage.getItem(LY_EDIT_PRE + LY_ID) || 'null');
  } catch (e) {}
  const okSaved = !!(saved && Array.isArray(saved.segs) && saved.segs.length && saved.segs.every(s => s && Array.isArray(s.w)));
  LY_ORIG = raw;
  const nb = lyBaseOf(raw);
  let segs = null,
    stale = false;
  if (sameJob) {
    const moved = !!(nb && LY_BASE && LY_BASE.sig !== nb.sig);
    if (moved && !lyEdited(LY_SEGS, LY_BASE)) {
      segs = lyModel(raw.segs);
      LY_LANG = raw.tlang || '';
      LY_BASE = nb;
    } else {
      segs = LY_SEGS;
      stale = moved;
      if (!LY_BASE) LY_BASE = nb;
    }
  } else if (okSaved) {
    const sb = saved.base || null,
      moved = !!(nb && (!sb || sb.sig !== nb.sig));
    if (moved && !lyEdited(saved.segs, sb || nb)) {
      segs = lyModel(raw.segs);
      LY_LANG = raw.tlang || '';
      LY_BASE = nb;
    } else {
      segs = saved.segs;
      LY_LANG = saved.lang || raw && raw.tlang || '';
      LY_BASE = sb || nb;
      stale = moved;
    }
  } else if (raw) {
    segs = lyModel(raw.segs);
    LY_LANG = raw.tlang || '';
    LY_BASE = nb;
  }
  renderResult(md, segs);
  if (stale && md) {
    const st = $('#cstatus');
    if (st) {
      st.classList.remove('err');
      st.innerHTML = __nm.h(window.WARN_SVG + (LY_BASE && LY_BASE.src === 'subs' ? ' 이 기기에서 고친 편집본을 이어서 띄웠어 — 그 뒤 자막이 새로 구워졌어(다시 입히기 전에 대조할게)' : ' 받아쓴 원문에서 고친 편집을 지켰어 — 다시 입히기하면 이 편집본으로 구워져(구워진 조각으로 돌아가려면 편집 초기화)'));
    }
  }
  if (md) lyVidCheck(outPath);
  if (fresh !== false) {
    const wasEarly = !!md && LY_EARLY === outPath;
    if (wasEarly) {
      LY_EARLY = '';
      if ($('#lyTabs').classList.contains('show')) lyTab(true);
    } else {
      const tgt = $('#lyTabs').classList.contains('show') ? $('#lyTabs') : $('#out');
      try {
        tgt.scrollIntoView({
          block: 'start',
          behavior: LY_RM.matches ? 'auto' : 'smooth'
        });
      } catch (e) {}
    }
  }
}
function renderResult(md, segs) {
  LY_MD = md || '';
  const out = $('#out');
  out.hidden = false;
  out.innerHTML = __nm.h(md ? renderMd(md) : '');
  if (md) wireCopy();
  const has = !!(segs && segs.length);
  $('#lyTabs').classList.toggle('show', has);
  if (!has) {
    $('#lydet').hidden = true;
    lyPvSync();
    return;
  }
  LY_SEGS = segs;
  LY_CUR = -1;
  out.setAttribute('role', 'tabpanel');
  out.setAttribute('aria-labelledby', 'lyTabOv');
  $('#lyTabOv').hidden = !md;
  $('#lyReset').hidden = !(LY_ORIG && LY_ORIG.segs && LY_ORIG.segs.length);
  $('#lyCap').setAttribute('lang', LY_LANG || 'ko');
  lyTab(!md);
  renderLySegs();
  lyStats();
  lySave();
  lyPrune();
  lyPvSync();
}
function lyTab(det) {
  $('#lyTabDet').classList.toggle('on', det);
  $('#lyTabOv').classList.toggle('on', !det);
  $('#lyTabDet').setAttribute('aria-selected', det ? 'true' : 'false');
  $('#lyTabOv').setAttribute('aria-selected', det ? 'false' : 'true');
  $('#lydet').hidden = !det;
  $('#out').hidden = det;
}
function lyHideEditor() {
  const _oc = $('#out');
  if (_oc) _oc.innerHTML = __nm.h('');
  lySaveNow();
  LY_SEQ++;
  LY_EARLY = '';
  LY_SEGS = null;
  LY_ORIG = null;
  LY_BASE = null;
  LY_MD = '';
  LY_CUR = -1;
  LY_RESTORE_PEND = false;
  $('#lyTabs').classList.remove('show');
  $('#lydet').hidden = true;
  const o = $('#out');
  o.hidden = false;
  o.removeAttribute('role');
  o.removeAttribute('aria-labelledby');
  $('#lyFindN').textContent = '';
  lyPvSync();
}
function lyToggleChip(sg, w, chip) {
  w.on = !w.on;
  chip.classList.toggle('off', !w.on);
  chip.setAttribute('aria-pressed', w.on ? 'false' : 'true');
  chip.setAttribute('aria-label', w.t + (w.on ? '' : ' (뺌)'));
  lyStats();
  lySave();
  lyCapRefresh();
}
function lyEditChip(sg, w, chip) {
  if (sg.del) return;
  window.clearTimeout(chip._tapT);
  try {
    const v = $('#lyVid');
    if (v && !v.paused) v.pause();
  } catch (e) {}
  chip.setAttribute('role', 'textbox');
  chip.setAttribute('aria-label', '단어 고치기: ' + w.t);
  chip.removeAttribute('aria-pressed');
  chip.textContent = w.t;
  chip.contentEditable = 'true';
  chip.spellcheck = false;
  chip.classList.add('editing');
  chip.focus();
  try {
    window.getSelection().selectAllChildren(chip);
  } catch (e) {}
}
function lyChip(sg, i, w, wi, q) {
  const chip = document.createElement('span');
  chip.className = 'ed-chip' + (w.on ? '' : ' off') + (q && w.t.indexOf(q) >= 0 && !sg.del ? ' hit' : '');
  chip.dataset.i = i;
  chip.dataset.wi = wi;
  chip.textContent = w.t;
  if (LY_LANG) chip.lang = LY_LANG;
  chip.tabIndex = 0;
  chip.setAttribute('role', 'button');
  chip.setAttribute('aria-pressed', w.on ? 'false' : 'true');
  chip.setAttribute('aria-label', w.t + (w.on ? '' : ' (뺌)'));
  chip.title = (w.s != null && w.e != null ? w.s.toFixed(1) + '–' + w.e.toFixed(1) + 's · ' : '') + '탭=빼기·되살리기 / 두 번 탭=고치기';
  chip.onclick = () => {
    if (chip.isContentEditable) return;
    window.clearTimeout(chip._tapT);
    chip._tapT = window.setTimeout(() => {
      lyToggleChip(sg, w, chip);
    }, 200);
  };
  chip.ondblclick = () => {
    lyEditChip(sg, w, chip);
  };
  chip.onkeydown = ev => {
    if (!chip.isContentEditable) {
      if (ev.key === ' ' || ev.key === 'Spacebar') {
        ev.preventDefault();
        lyToggleChip(sg, w, chip);
      } else if (ev.key === 'Enter') {
        ev.preventDefault();
        lyEditChip(sg, w, chip);
      }
      return;
    }
    if (ev.key === 'Enter') {
      ev.preventDefault();
      chip.blur();
      return;
    }
    if (ev.key === 'Backspace' && !ev.isComposing && wi > 0 && !chip.textContent.replace(/[\s​﻿⁠]/g, '')) {
      ev.preventDefault();
      sg.w.splice(wi, 1);
      LY_PEND = {
        i,
        wi: wi - 1
      };
      lyRerenderCard(i);
    }
  };
  chip.oninput = ev => {
    const raw = chip.textContent,
      si = raw.search(/\s/);
    if (si >= 0 && !ev.isComposing) {
      const left = raw.slice(0, si).trim(),
        right = raw.slice(si + 1).trim();
      if (left && right) {
        let cut = null;
        if (w.s != null && w.e != null) cut = +(w.s + (w.e - w.s) * (left.length / Math.max(1, left.length + right.length))).toFixed(2);
        sg.w.splice(wi, 1, {
          t: left,
          s: w.s,
          e: cut,
          on: w.on
        }, {
          t: right,
          s: cut,
          e: w.e,
          on: w.on
        });
        LY_PEND = {
          i,
          wi: wi + 1
        };
        lyRerenderCard(i);
        return;
      }
      if (left && !right) {
        chip.textContent = left;
        try {
          const sel = window.getSelection(),
            r = document.createRange();
          r.selectNodeContents(chip);
          r.collapse(false);
          sel.removeAllRanges();
          sel.addRange(r);
        } catch (e) {}
        return;
      }
      chip.textContent = right;
    }
  };
  chip.onblur = () => {
    if (LY_RENDERING || !chip.isConnected) return;
    chip.contentEditable = 'false';
    chip.classList.remove('editing');
    chip.setAttribute('role', 'button');
    chip.setAttribute('aria-pressed', w.on ? 'false' : 'true');
    chip.setAttribute('aria-label', w.t + (w.on ? '' : ' (뺌)'));
    const nt = chip.textContent.replace(/\s+/g, ' ').trim();
    if (nt === w.t) {
      chip.textContent = w.t;
      return;
    }
    const wiped = !nt;
    if (wiped) {
      lyUndoCap();
      sg.w.splice(wi, 1);
      if (!sg.w.length) sg.del = true;
    } else if (/\s/.test(nt)) sg.w.splice(wi, 1, ...nt.split(/\s+/).map(t => ({
      t,
      s: w.s,
      e: w.e,
      on: w.on
    })));else w.t = nt;
    lyRerenderCard(i);
    if (wiped) lyUndoOffer('단어 지움');
  };
  return chip;
}
let LY_ADJ = null;
function lyAdjFmt(s) {
  const cs = Math.max(0, Math.round((s || 0) * 100));
  const m = cs / 6000 | 0,
    ss = String(cs % 6000 / 100 | 0).padStart(2, '0'),
    cc = String(cs % 100).padStart(2, '0');
  return m + ':' + ss + ':' + cc;
}
function lyOutOfOrder() {
  if (!LY_SEGS) return false;
  let p = null;
  for (const sg of LY_SEGS) {
    if (sg.s == null) continue;
    if (p != null && sg.s < p) return true;
    p = sg.s;
  }
  return false;
}
function lyResort() {
  if (!lyOutOfOrder()) return false;
  const adjSg = LY_ADJ != null && LY_SEGS[LY_ADJ] || null,
    curSg = LY_CUR >= 0 && LY_SEGS[LY_CUR] || null,
    pendSg = LY_PEND && LY_SEGS[LY_PEND.i] || null;
  const timed = LY_SEGS.filter(s => s.s != null).sort((a, b) => a.s - b.s);
  let k = 0;
  for (let i = 0; i < LY_SEGS.length; i++) if (LY_SEGS[i].s != null) LY_SEGS[i] = timed[k++];
  if (adjSg) LY_ADJ = LY_SEGS.indexOf(adjSg);
  if (curSg) LY_CUR = LY_SEGS.indexOf(curSg);
  if (pendSg) LY_PEND.i = LY_SEGS.indexOf(pendSg);
  return true;
}
function lyAdjToggle(i) {
  const prev = LY_ADJ;
  LY_ADJ = LY_ADJ === i ? null : i;
  const cur = LY_ADJ != null && LY_SEGS ? LY_SEGS[LY_ADJ] : null;
  if (lyOutOfOrder()) lyRerender();else {
    if (prev != null && prev !== i && LY_SEGS && LY_SEGS[prev]) lyRerenderCard(prev);
    lyRerenderCard(i);
  }
  if (cur && cur.s != null) lySeek(cur.s);
}
function lyAdjRow(sg, i) {
  const row = document.createElement('div');
  row.className = 'lyseg-adj';
  const val = document.createElement('span');
  val.className = 'adj-v';
  const draw = () => {
    val.textContent = lyAdjFmt(sg.s);
  };
  const step = d => {
    let ns = Math.round((sg.s + d) * 10) / 10;
    ns = Math.min(Math.max(0, ns), Math.max(0, Math.round((sg.e - 0.1) * 10) / 10));
    if (ns === sg.s) return;
    sg.s = ns;
    draw();
    const tmEl = row.parentElement && row.parentElement.querySelector('.lyseg-t');
    if (tmEl) tmEl.innerHTML = __nm.h('<b>' + fmtClock(sg.s) + '</b> <span class="lyseg-d">- ' + fmtClock(sg.e) + '</span>');
    lySeek(sg.s);
    lyStats();
    lySave();
  };
  const mk = (lbl, d, aria) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = lbl;
    b.setAttribute('aria-label', aria);
    b.onclick = () => step(d);
    return b;
  };
  row.appendChild(mk('-1초', -1, '시작 1초 앞으로'));
  row.appendChild(mk('-0.1', -0.1, '시작 0.1초 앞으로'));
  row.appendChild(val);
  row.appendChild(mk('+0.1', 0.1, '시작 0.1초 뒤로'));
  row.appendChild(mk('+1초', 1, '시작 1초 뒤로'));
  row.addEventListener('wheel', e => {
    e.preventDefault();
    step(e.deltaY < 0 ? 0.1 : -0.1);
  }, {
    passive: false
  });
  draw();
  return row;
}
function lyBuildCard(sg, i, q) {
  const card = document.createElement('div');
  card.className = 'lyseg' + (sg.del ? ' del' : '') + (i === LY_CUR ? ' cur' : '') + (sg.sel ? ' sel' : '');
  card.dataset.i = i;
  const h = document.createElement('div');
  h.className = 'lyseg-h';
  const ckL = document.createElement('label');
  ckL.className = 'dl-full';
  const ck = document.createElement('input');
  ck.type = 'checkbox';
  ck.checked = !!sg.sel;
  ck.disabled = !!sg.del;
  ck.setAttribute('aria-label', '조각 ' + (i + 1) + ' 선택');
  ck.onchange = () => {
    sg.sel = ck.checked;
    card.classList.toggle('sel', sg.sel);
    lyStats();
    lySave();
  };
  const cbox = document.createElement('span');
  cbox.className = 'dl-cbox';
  cbox.innerHTML = __nm.h('<svg viewBox="0 0 24 24"><path class="dl-dash" d="M6 12h12"/><path class="dl-chk" d="M5 13l4 4L19 7"/></svg>');
  ckL.appendChild(ck);
  ckL.appendChild(cbox);
  h.appendChild(ckL);
  const num = document.createElement('span');
  num.className = 'lyseg-n';
  num.textContent = i + 1;
  h.appendChild(num);
  const tm = document.createElement('button');
  tm.type = 'button';
  tm.className = 'lyseg-t';
  if (sg.s != null && sg.e != null) {
    tm.innerHTML = __nm.h('<b>' + fmtClock(sg.s) + '</b> <span class="lyseg-d">- ' + fmtClock(sg.e) + '</span>');
    if (LY_ADJ === i) tm.classList.add('adj-on');
    tm.title = '탭 = 시작 타이밍 조절' + (!$('#lyPv').hidden ? ' (움직이면 미리보기 싱크)' : '');
    tm.setAttribute('aria-label', fmtClock(sg.s) + ' 시작 — 타이밍 조절');
    tm.onclick = () => lyAdjToggle(i);
  } else {
    tm.textContent = '—';
    tm.disabled = true;
    tm.classList.add('plain');
  }
  h.appendChild(tm);
  const sp = document.createElement('span');
  sp.className = 'lysp';
  h.appendChild(sp);
  if (sg.mg && sg.mg.length) {
    const rb = document.createElement('button');
    rb.type = 'button';
    rb.className = 'lyseg-a';
    rb.innerHTML = __nm.h(SPLIT_SVG);
    rb.setAttribute('aria-label', '합치기 되돌리기 (두 조각으로 분리)');
    rb.title = '합치기 되돌리기 (두 조각으로)';
    rb.onclick = () => {
      lyUndoCap();
      const rec = sg.mg[sg.mg.length - 1];
      LY_SEGS.splice(i, 1, rec.a, rec.b);
      LY_PEND = null;
      LY_ADJ = null;
      lyRerender();
      lyLand(LY_SEGS.indexOf(rec.a));
      lyLand(LY_SEGS.indexOf(rec.b));
      lyUndoOffer('합치기 되돌렸어 (두 조각)');
    };
    h.appendChild(rb);
  }
  if (i > 0) {
    const mg = document.createElement('button');
    mg.type = 'button';
    mg.className = 'lyseg-a';
    mg.innerHTML = __nm.h(window.MERGE_SVG);
    mg.setAttribute('aria-label', '위 조각과 합치기');
    mg.title = '위 조각과 합치기';
    mg.onclick = () => {
      lyUndoCap();
      const prev = LY_SEGS[i - 1];
      const rec = {
        a: JSON.parse(JSON.stringify(prev)),
        b: JSON.parse(JSON.stringify(sg))
      };
      prev.del = false;
      if (sg.e != null && (prev.e == null || sg.e > prev.e)) prev.e = sg.e;
      if (sg.s != null && (prev.s == null || sg.s < prev.s)) prev.s = sg.s;
      if (prev.k || sg.k) prev.k = [prev.k || lySegText(prev), sg.k || lySegText(sg)].join(' ');
      prev.w = prev.w.concat(sg.w);
      (prev.mg = prev.mg || []).push(rec);
      LY_SEGS.splice(i, 1);
      LY_PEND = null;
      LY_ADJ = null;
      lyRerender();
      lyLand(LY_SEGS.indexOf(prev));
      lyUndoOffer('위 조각과 합쳤어');
    };
    h.appendChild(mg);
  }
  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'lyseg-a';
  del.innerHTML = __nm.h(sg.del ? window.UNDO_SVG : LYX_SVG);
  del.setAttribute('aria-label', sg.del ? '조각 복원' : '조각 삭제');
  del.title = sg.del ? '조각 복원' : '조각 삭제 (다시 누르면 복원)';
  del.onclick = () => {
    sg.del = !sg.del;
    if (sg.del) sg.sel = false;
    lyRerender();
  };
  h.appendChild(del);
  card.appendChild(h);
  if (LY_ADJ === i && !sg.del && sg.s != null && sg.e != null) card.appendChild(lyAdjRow(sg, i));
  const chips = document.createElement('div');
  chips.className = 'lyseg-chips';
  sg.w.forEach((w, wi) => chips.appendChild(lyChip(sg, i, w, wi, q)));
  card.appendChild(chips);
  return card;
}
function lyFocusPend(wrap) {
  if (!LY_PEND) return;
  const pi = LY_PEND.i,
    pw = LY_PEND.wi;
  LY_PEND = null;
  const c = wrap.querySelector('.ed-chip[data-i="' + pi + '"][data-wi="' + pw + '"]'),
    pwd = LY_SEGS[pi] && LY_SEGS[pi].w[pw];
  if (c && pwd) {
    c.textContent = pwd.t;
    c.contentEditable = 'true';
    c.spellcheck = false;
    c.classList.add('editing');
    c.focus();
    try {
      const sel = window.getSelection(),
        r = document.createRange();
      r.selectNodeContents(c);
      r.collapse(false);
      sel.removeAllRanges();
      sel.addRange(r);
    } catch (e) {}
  }
}
function renderLySegs() {
  const wrap = $('#lySegs');
  if (!wrap || !LY_SEGS) return;
  lyResort();
  LY_RENDERING = true;
  wrap.innerHTML = __nm.h('');
  const q = ($('#lyFind').hidden ? '' : $('#lyFindQ').value) || '';
  LY_SEGS.forEach((sg, i) => wrap.appendChild(lyBuildCard(sg, i, q)));
  lyFocusPend(wrap);
  LY_RENDERING = false;
}
function lyRerenderCard(i) {
  const wrap = $('#lySegs'),
    old = wrap && wrap.querySelector('.lyseg[data-i="' + i + '"]');
  if (!wrap || !old || !LY_SEGS || !LY_SEGS[i]) {
    lyRerender();
    return;
  }
  LY_RENDERING = true;
  const q = ($('#lyFind').hidden ? '' : $('#lyFindQ').value) || '';
  old.replaceWith(lyBuildCard(LY_SEGS[i], i, q));
  lyFocusPend(wrap);
  LY_RENDERING = false;
  lyStats();
  lySave();
  lyCapRefresh();
  lyFindCount();
}
function lyRerender() {
  renderLySegs();
  lyStats();
  lySave();
  lyCapRefresh();
  lyFindCount();
}
let LY_SPELL = null;
const LY_SPELL_LINES = 8;
async function lySpellFetch(lines) {
  try {
    const ctrl = new window.AbortController();
    const to = window.setTimeout(() => ctrl.abort(), 12000);
    let res;
    try {
      const r = await window.fetch('/api/spellcheck', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          texts: [lines.join('\n')]
        }),
        signal: ctrl.signal
      });
      if (r.ok) res = await r.json();
    } finally {
      window.clearTimeout(to);
    }
    if (res && res.ok && Array.isArray(res.corrected) && typeof res.corrected[0] === 'string') {
      const out = res.corrected[0].split('\n');
      return lines.map((ln, i) => typeof out[i] === 'string' && out[i].trim() ? out[i] : ln);
    }
  } catch (e) {}
  return lines.slice();
}
async function lySpellScan() {
  if (!LY_SEGS) return false;
  const jid = LY_ID;
  const tgt = LY_SEGS.map((sg, si) => ({
    sg,
    si
  })).filter(o => !o.sg.del && lySegText(o.sg));
  if (!tgt.length) return false;
  const lines = tgt.map(o => lySegText(o.sg));
  const fixed = [];
  for (let b = 0; b < lines.length; b += LY_SPELL_LINES) fixed.push(...(await lySpellFetch(lines.slice(b, b + LY_SPELL_LINES))));
  const items = [];
  tgt.forEach((o, k) => {
    const a = lines[k],
      b2 = fixed[k];
    if (!b2 || a === b2) return;
    const aw = a.split(/\s+/).filter(Boolean),
      bw = b2.split(/\s+/).filter(Boolean);
    if (aw.length === bw.length) {
      const on = o.sg.w.map((w, wi) => ({
        w,
        wi
      })).filter(x => x.w.on);
      aw.forEach((t, j) => {
        if (t !== bw[j] && on[j] && on[j].w.t === t) items.push({
          w: on[j].w,
          from: t,
          to: bw[j],
          lit: true
        });
      });
    } else items.push({
      from: a,
      to: b2,
      skip: true,
      lit: false
    });
  });
  if (jid !== LY_ID) return false;
  LY_SPELL = items.length ? {
    id: LY_ID,
    items
  } : null;
  lySpellRender();
  return !!items.length;
}
function lySpellRender() {
  const c = $('#lySpellChips');
  if (!c) return;
  if (!LY_SPELL) {
    c.hidden = true;
    c.innerHTML = __nm.h('');
    return;
  }
  c.innerHTML = __nm.h('');
  LY_SPELL.items.forEach(it => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'spchip' + (it.lit ? ' on' : '') + (it.skip ? ' skip' : '');
    b.textContent = (it.skip ? '띄어쓰기 · ' : '') + it.from + ' → ' + it.to;
    if (it.skip) b.title = '띄어쓰기 교정 — 어절 경계가 바뀌어 자동 적용은 안 해(자막 싱크 보존). 조각을 직접 고쳐줘';else {
      b.title = '탭 = 이 교정만 켜기/끄기';
      b.addEventListener('click', () => {
        it.lit = !it.lit;
        b.classList.toggle('on', it.lit);
      });
    }
    c.appendChild(b);
  });
  c.hidden = false;
}
function lySpellApply() {
  let n = 0;
  const alive = new Set();
  (LY_SEGS || []).forEach(sg => (sg.w || []).forEach(w => alive.add(w)));
  const stale = LY_SPELL && LY_SPELL.id && LY_SPELL.id !== LY_ID;
  if (LY_SPELL && !stale) LY_SPELL.items.forEach(it => {
    if (!it.lit || it.skip || !it.w || !alive.has(it.w)) return;
    if (it.w.t === it.from) {
      it.w.t = it.to;
      n++;
    }
  });
  LY_SPELL = null;
  lySpellRender();
  if (n) lyRerender();
  return n;
}
function lyStats() {
  if (!LY_SEGS) return;
  const alive = LY_SEGS.filter(s => !s.del);
  const totW = LY_SEGS.reduce((a, s) => a + s.w.length, 0);
  const offW = LY_SEGS.reduce((a, s) => a + s.w.filter(w => !w.on).length, 0);
  const delN = LY_SEGS.length - alive.length,
    selN = alive.filter(s => s.sel).length;
  let dur = LY_ORIG && LY_ORIG.dur || 0;
  LY_SEGS.forEach(s => {
    if (s.e != null && s.e > dur) dur = s.e;
  });
  $('#lyStats').innerHTML = __nm.h('조각 <b>' + alive.length + '</b>/' + LY_SEGS.length + ' · 길이 <b>' + fmtClock(dur) + '</b> · 뺀 단어 <b>' + offW + '</b>/' + totW + (delN ? ' · 삭제 <b>' + delN + '</b>' : '') + (selN ? ' · 선택 <b>' + selN + '</b>' : ''));
  const all = $('#lyCkAll');
  if (all) {
    all.checked = alive.length > 0 && selN === alive.length;
    all.indeterminate = selN > 0 && selN < alive.length;
  }
  const tn = $('#lyTabN');
  if (tn) {
    tn.textContent = alive.length;
    tn.hidden = !LY_SEGS.length;
  }
  const flb = $('#lyFiller');
  if (flb) {
    let hit = false,
      on = false;
    LY_SEGS.forEach(s => {
      if (!s.del) s.w.forEach(w => {
        if (lyIsFiller(w.t)) {
          hit = true;
          if (w.on) on = true;
        }
      });
    });
    flb.setAttribute('aria-pressed', hit && !on ? 'true' : 'false');
  }
}
function lyFindCount() {
  const q = $('#lyFind').hidden ? '' : $('#lyFindQ').value;
  let n = 0;
  if (LY_SEGS && q) LY_SEGS.forEach(sg => {
    if (!sg.del) sg.w.forEach(w => {
      if (w.t.indexOf(q) >= 0) n++;
    });
  });
  $('#lyFindN').textContent = q ? n + '건' : '';
}
function lyMarkFind() {
  lyFindCount();
  const q = $('#lyFind').hidden ? '' : $('#lyFindQ').value;
  document.querySelectorAll('#lySegs .ed-chip').forEach(c => {
    const sg = LY_SEGS && LY_SEGS[+c.dataset.i];
    const w = sg && sg.w[+c.dataset.wi];
    c.classList.toggle('hit', !!(q && w && w.t.indexOf(q) >= 0 && !sg.del));
  });
}
function lyPickSegs() {
  if (!LY_SEGS) return [];
  const alive = LY_SEGS.filter(sg => !sg.del && lySegText(sg));
  const sel = alive.filter(sg => sg.sel);
  return sel.length ? sel : alive;
}
(function () {
  const ft = $('#lyFindTg'),
    cp = $('#lyCopy'),
    dl = $('#lySrt'),
    fl = $('#lyFiller');
  if (!ft || !cp || !dl) return;
  ft.innerHTML = __nm.h(window.SWAP_SVG);
  cp.innerHTML = __nm.h(window.COPY_SVG);
  cp._icon = 'copy';
  dl.innerHTML = __nm.h(window.DOWNLOAD_SVG);
  if (fl) fl.innerHTML = __nm.h(window.FUNNEL_SVG);
  if (fl) fl.onclick = () => {
    if (!LY_SEGS) return;
    const st = $('#cstatus');
    const hits = [];
    LY_SEGS.forEach(sg => {
      if (!sg.del) sg.w.forEach(w => {
        if (lyIsFiller(w.t)) hits.push(w);
      });
    });
    if (!hits.length) {
      st.classList.remove('err');
      st.innerHTML = __nm.h(window.OK_SVG + ' 군더더기 없음');
      return;
    }
    const on = hits.filter(w => w.on);
    if (on.length) {
      lyUndoCap();
      on.forEach(w => {
        w.on = false;
      });
      lyRerender();
      lyMarkFind();
      lyUndoOffer('군더더기 ' + on.length + '개 뺌');
    } else {
      hits.forEach(w => {
        w.on = true;
      });
      lyRerender();
      lyMarkFind();
      st.classList.remove('err');
      st.innerHTML = __nm.h(window.OK_SVG + ' 군더더기 ' + hits.length + '개 되살림');
    }
  };
  $('#lyTabDet').onclick = () => lyTab(true);
  $('#lyTabOv').onclick = () => lyTab(false);
  ft.onclick = () => {
    const f = $('#lyFind');
    const show = f.hidden;
    f.hidden = !show;
    ft.setAttribute('aria-pressed', show ? 'true' : 'false');
    if (show) {
      try {
        $('#lyFindQ').focus();
      } catch (e) {}
    }
    lyMarkFind();
  };
  $('#lyFindQ').addEventListener('input', () => {
    window.clearTimeout(LY_FINDT);
    LY_FINDT = window.setTimeout(lyMarkFind, 120);
    fgoDisarm();
  });
  const fgo = $('#lyFindGo');
  const fgoDisarm = () => {
    if (!fgo.dataset.arm) return;
    delete fgo.dataset.arm;
    fgo.classList.remove('arm');
    fgo.textContent = '모두 바꾸기';
    window.clearTimeout(fgo._armT);
  };
  $('#lyFindR').addEventListener('input', fgoDisarm);
  fgo.onclick = () => {
    const q = $('#lyFindQ').value,
      r = $('#lyFindR').value;
    if (!q || !LY_SEGS) return;
    if (!r && !fgo.dataset.arm) {
      fgo.dataset.arm = '1';
      fgo.classList.add('arm');
      fgo.textContent = '한 번 더 = 지우기';
      window.clearTimeout(fgo._armT);
      fgo._armT = window.setTimeout(fgoDisarm, 2500);
      return;
    }
    fgoDisarm();
    lyUndoCap();
    let n = 0;
    LY_SEGS.forEach(sg => {
      for (let wi = sg.w.length - 1; wi >= 0; wi--) {
        const w = sg.w[wi];
        if (w.t.indexOf(q) >= 0) {
          n++;
          const nt = w.t.split(q).join(r).replace(/\s+/g, ' ').trim();
          if (!nt) sg.w.splice(wi, 1);else if (/\s/.test(nt)) sg.w.splice(wi, 1, ...nt.split(/\s+/).map(t => ({
            t,
            s: w.s,
            e: w.e,
            on: w.on
          })));else w.t = nt;
        }
      }
      if (!sg.w.length) sg.del = true;
    });
    lyRerender();
    lyMarkFind();
    if (n) lyUndoOffer(n + '개 단어에서 바꿈');else {
      LY_UNDO = null;
      const st = $('#cstatus');
      st.classList.remove('err');
      st.innerHTML = __nm.h(window.WARN_SVG + ' 바꿀 단어가 없어');
    }
  };
  $('#lyCkAll').onchange = e => {
    if (!LY_SEGS) return;
    const v = e.target.checked;
    LY_SEGS.forEach(sg => {
      if (!sg.del) sg.sel = v;
    });
    renderLySegs();
    lyStats();
    lySave();
  };
  cp.onclick = async () => {
    const list = lyPickSegs();
    if (!list.length) return;
    try {
      await window.navigator.clipboard.writeText(list.map(lySegText).join('\n'));
      cp.innerHTML = __nm.h(window.CHECK_SVG);
      cp._icon = 'check';
      window.setTimeout(() => {
        cp.innerHTML = __nm.h(window.COPY_SVG);
        cp._icon = 'copy';
      }, 1200);
      const st = $('#cstatus');
      st.classList.remove('err');
      st.innerHTML = __nm.h(window.OK_SVG + ' 자막 ' + list.length + '조각 복사됨');
    } catch (e) {}
  };
  dl.onclick = () => {
    const list = lyPickSegs().filter(sg => sg.s != null && sg.e != null).sort((a, b) => a.s - b.s);
    if (!list.length) {
      const st = $('#cstatus');
      st.classList.remove('err');
      st.innerHTML = __nm.h(window.WARN_SVG + ' 내보낼 자막이 없어');
      return;
    }
    const srt = list.map((sg, k) => k + 1 + '\r\n' + srtTime(sg.s) + ' --> ' + srtTime(sg.e) + '\r\n' + lySegText(sg) + '\r\n').join('\r\n');
    const a = document.createElement('a');
    a.href = __nm.u(window.URL.createObjectURL(new window.Blob([srt], {
      type: 'text/plain'
    })));
    a.download = '자막_' + (LY_ID || 'srt') + '.srt';
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => {
      try {
        window.URL.revokeObjectURL(a.href);
      } catch (e) {}
      a.remove();
    }, 1500);
  };
  $('#lyReset').onclick = async () => {
    const rb = $('#lyReset');
    if (!LY_ORIG || !LY_ORIG.segs) return;
    if (!rb.dataset.arm) {
      rb.dataset.arm = '1';
      rb.classList.add('arm');
      rb.textContent = '한 번 더 누르면 처음 자막으로 초기화';
      window.clearTimeout(rb._armT);
      rb._armT = window.setTimeout(() => {
        delete rb.dataset.arm;
        rb.classList.remove('arm');
        rb.textContent = '편집 초기화 (처음 구운 자막으로)';
      }, 2500);
      return;
    }
    delete rb.dataset.arm;
    rb.classList.remove('arm');
    rb.textContent = '편집 초기화 (처음 구운 자막으로)';
    window.clearTimeout(rb._armT);
    const id0 = LY_ID,
      o0 = await lyOrigRaw();
    if (LY_ID !== id0 || !o0 || !o0.segs) return;
    lyUndoCap();
    LY_SEGS = lyModel(o0.segs);
    LY_LANG = o0.tlang || LY_LANG;
    LY_ADJ = null;
    LY_ORIG = o0;
    try {
      window.localStorage.removeItem(LY_EDIT_PRE + LY_ID);
    } catch (e) {}
    lyRerender();
    lyMarkFind();
    lyUndoOffer('처음 자막으로 초기화했어');
    LY_RESTORE_PEND = true;
  };
})();
function lyPvSet(f) {
  const pv = $('#lyPv'),
    v = $('#lyVid');
  if (!pv || !v) return;
  if (LY_MEDIA_URL) {
    try {
      window.URL.revokeObjectURL(LY_MEDIA_URL);
    } catch (e) {}
    LY_MEDIA_URL = '';
  }
  if (!f) {
    try {
      v.pause();
    } catch (e) {}
    v.removeAttribute('src');
    try {
      v.load();
    } catch (e) {}
    pv.hidden = true;
    $('#lyCap').hidden = true;
    $('#lyPvRow').hidden = true;
    return;
  }
  LY_MEDIA_URL = window.URL.createObjectURL(f);
  v.src = __nm.u(LY_MEDIA_URL);
  pv.hidden = false;
  lyPvSync();
}
function lyPvSync() {
  const has = !!(LY_SEGS && LY_SEGS.length && !$('#lyPv').hidden);
  $('#lyCap').hidden = !has;
  $('#lyPvRow').hidden = !has;
  if (!has) {
    $('#lyCap').textContent = '';
    document.querySelectorAll('.lyseg.cur').forEach(x => x.classList.remove('cur'));
  }
}
function lySeek(t) {
  const v = $('#lyVid');
  if (!v || $('#lyPv').hidden || !v.src) return;
  try {
    v.currentTime = Math.max(0, t + 0.02);
  } catch (e) {}
}
function lyCapRefresh() {
  const v = $('#lyVid');
  if (!v || $('#lyPv').hidden || $('#lyCap').hidden || !LY_SEGS) return;
  const t = v.currentTime;
  const sg = LY_SEGS.find(s => s.s != null && t >= s.s && t < s.e);
  $('#lyCap').textContent = sg && !sg.del ? lySegText(sg) : '';
}
(function () {
  const v = $('#lyVid');
  if (!v) return;
  let last = -9;
  v.addEventListener('timeupdate', () => {
    if (!LY_SEGS || $('#lyPv').hidden) return;
    const t = v.currentTime;
    let cur = -1,
      curDel = -1;
    for (let i = 0; i < LY_SEGS.length; i++) {
      const sg = LY_SEGS[i];
      if (sg.s == null) continue;
      if (t >= sg.s && t < sg.e) {
        if (!sg.del) {
          cur = i;
          break;
        }
        if (curDel < 0) curDel = i;
      }
    }
    if (cur < 0 && curDel >= 0 && $('#lySkip').checked && !v.paused) {
      let n = curDel;
      while (n < LY_SEGS.length && (LY_SEGS[n].del || LY_SEGS[n].s == null)) n++;
      if (n < LY_SEGS.length && LY_SEGS[n].s > t + 0.05) lySeek(LY_SEGS[n].s);else if (n >= LY_SEGS.length) v.pause();
      return;
    }
    const useCur = cur >= 0 ? cur : curDel;
    if (useCur !== last) {
      last = useCur;
      LY_CUR = useCur;
      $('#lyCap').textContent = cur >= 0 ? lySegText(LY_SEGS[cur]) : '';
      document.querySelectorAll('.lyseg.cur').forEach(x => x.classList.remove('cur'));
      if (useCur >= 0) {
        const el = document.querySelector('.lyseg[data-i="' + useCur + '"]');
        if (el) {
          el.classList.add('cur');
          if (!v.paused && !$('#lydet').hidden && !(document.activeElement && document.activeElement.isContentEditable) && Date.now() - LY_USRSCROLL > 3000) {
            try {
              el.scrollIntoView({
                block: 'nearest',
                behavior: LY_RM.matches ? 'auto' : 'smooth'
              });
            } catch (e) {}
          }
        }
      }
    }
  });
  $('#lyRate').onclick = () => {
    const r = v.playbackRate >= 2 ? 1 : v.playbackRate >= 1.5 ? 2 : 1.5;
    v.playbackRate = r;
    $('#lyRate').textContent = r === 1 ? '1x' : r === 1.5 ? '1.5x' : '2x';
  };
  const fs = $('#lyFs');
  if (fs) fs.addEventListener('input', () => {
    $('#lyCap').style.fontSize = fs.value + 'px';
    $('#lyFsV').textContent = fs.value + 'px';
  });
})();
async function lyVidCheck(outPath) {
  const gen = LY_VID_GEN;
  const j = await lyVidFetch(outPath);
  if (gen !== LY_VID_GEN) return;
  if (j && j.url) lyBurnShow(j);
}
async function lyPollVideo(outPath, t0, skipUrl) {
  lyBurnStop();
  lyBurnWait();
  const gen = LY_VID_GEN;
  const errPath = outPath.replace(/[^/]+$/, 'error.log');
  let prevErr = null;
  if (skipUrl) {
    try {
      const r0 = await window.fetch(errPath + '?t=' + Date.now());
      if (r0.ok) {
        const t0e = await r0.text();
        if (t0e && !/^\s*</.test(t0e)) prevErr = t0e.trim();
      }
    } catch (e) {}
  }
  if (gen !== LY_VID_GEN) return;
  const tick = async () => {
    if (gen !== LY_VID_GEN) return;
    const j = await lyVidFetch(outPath);
    if (gen !== LY_VID_GEN) return;
    if (j && j.url && j.url !== skipUrl && !j.xtr_wait) {
      lyBurnShow(j);
      return;
    }
    if (j && !j.url && (j.error || j.skip) && !j.xtr_wait) {
      if (j.skip) {
        $('#lyBurnVid').hidden = true;
        $('#lyBurnDl').hidden = true;
        $('#lyBurnNote').textContent = j.skip;
      } else {
        $('#lyBurnVid').hidden = true;
        $('#lyBurnDl').hidden = true;
        $('#lyBurnNote').textContent = j.error;
      }
      return;
    }
    if (skipUrl) {
      try {
        const er = await window.fetch(errPath + '?t=' + Date.now());
        if (er.ok) {
          const ect = (er.headers.get('content-type') || '').toLowerCase();
          const em = await er.text();
          if (gen !== LY_VID_GEN) return;
          if (em && em.trim() && em.trim() !== prevErr && !ect.includes('text/html') && !/^\s*</.test(em)) {
            $('#lyBurnVid').hidden = true;
            $('#lyBurnDl').hidden = true;
            $('#lyBurnNote').textContent = em.trim().slice(0, 160);
            return;
          }
        }
      } catch (e) {}
    }
    if (Date.now() - t0 > 8 * 60e3) {
      $('#lyBurnNote').textContent = '합성이 오래 걸리는 중 — 완성되면 다음에 열 때 보여';
      if (skipUrl) lyVidCheck(outPath);
      return;
    }
    LY_VID_T = window.setTimeout(tick, 10000);
  };
  tick();
}
function renderMd(md) {
  const parts = md.split('```');
  let html = '';
  parts.forEach((part, i) => {
    if (i % 2 === 1) {
      let code = part;
      const nl = code.indexOf('\n');
      const first = nl >= 0 ? code.slice(0, nl).trim() : '';
      if (/^[a-zA-Z]+$/.test(first)) code = code.slice(nl + 1);
      code = code.replace(/\s+$/, '');
      html += `<div class="code"><button data-c="${encodeURIComponent(code)}" aria-label="복사" title="복사">${window.COPY_SVG}</button><pre>${esc(code)}</pre></div>`;
    } else {
      const lines = part.split('\n');
      let tbl = [];
      const flush = () => {
        if (!tbl.length) return;
        const rows = tbl.filter(r => !/^\s*\|?\s*[-:|\s]+\|?\s*$/.test(r));
        html += '<table>' + rows.map(r => {
          const cells = r.replace(/^\s*\||\|\s*$/g, '').split('|').map(c => c.trim());
          return '<tr>' + cells.map(c => `<td>${esc(c)}</td>`).join('') + '</tr>';
        }).join('') + '</table>';
        tbl = [];
      };
      lines.forEach(line => {
        const t = line.trim();
        if (t.startsWith('|')) {
          tbl.push(t);
          return;
        }
        flush();
        if (!t) return;
        if (t.startsWith('### ')) html += `<h3>${esc(t.slice(4))}</h3>`;else if (t.startsWith('## ')) html += `<h2>${esc(t.slice(3))}</h2>`;else if (t.startsWith('# ')) html += `<h1 class="t">${esc(t.slice(2))}</h1>`;else if (t === '---') html += '<hr class="divider">';else html += `<p>${esc(t)}</p>`;
      });
      flush();
    }
  });
  return html;
}
function wireCopy() {
  document.querySelectorAll('.code button').forEach(b => b.onclick = () => {
    window.navigator.clipboard.writeText(decodeURIComponent(b.dataset.c)).then(() => {
      b.innerHTML = __nm.h(window.CHECK_SVG);
      b.classList.add('done');
      window.setTimeout(() => {
        b.innerHTML = __nm.h(window.COPY_SVG);
        b.classList.remove('done');
      }, 1500);
    });
  });
}
let LY_WANTVID = '',
  LY_VID_T = null,
  LY_VID_GEN = 0;
function lyBurnStop() {
  LY_VID_GEN++;
  if (LY_VID_T) {
    window.clearTimeout(LY_VID_T);
    LY_VID_T = null;
  }
}
function lyBurnReset() {
  lyBurnStop();
  LY_SPELL = null;
  lySpellRender();
  const bx = $('#lyBurn');
  if (!bx) return;
  bx.hidden = true;
  const v = $('#lyBurnVid');
  v.hidden = true;
  if (v.parentElement) v.parentElement.classList.remove('alpha');
  v.removeAttribute('src');
  try {
    v.load();
  } catch (e) {}
  $('#lyBurnDl').hidden = true;
  const rb = $('#lyReburn');
  if (rb) rb.hidden = true;
  const cdw = $('#lyCutDelW');
  if (cdw) cdw.hidden = true;
  const cd = $('#lyCutDel');
  if (cd) cd.checked = false;
  $('#lyBurnNote').textContent = '';
}
let _lyBurnT0 = 0;
function lyBurnWait(msg) {
  const bx = $('#lyBurn');
  if (!bx) return;
  _lyBurnT0 = Date.now();
  bx.hidden = false;
  $('#lyBurnVid').hidden = true;
  dockSync();
  $('#lyBurnDl').hidden = true;
  const rb = $('#lyReburn');
  if (rb) rb.hidden = true;
  const cdw = $('#lyCutDelW');
  if (cdw) cdw.hidden = true;
  $('#lyBurnNote').innerHTML = __nm.h(window.nmLoader ? window.nmLoader('solving', '제작중…') + ' <span class="nm-shim">' + (window.nmEta ? window.nmEta.label('edit-burn').trim() : '(예상 : 3분 00초)') + '</span>' : (msg || '영상에 자막 입히는 중') + '<span class="gdots"><i>.</i><i>.</i><i>.</i></span> (1~3분)');
}
function lyBurnShow(j) {
  if (!/^https?:\/\//i.test(j.url || '') && !/^ly_out\//.test(j.url || '')) return;
  const bx = $('#lyBurn');
  if (!bx) return;
  bx.hidden = false;
  const v = $('#lyBurnVid');
  if (v.getAttribute('src') !== j.url) v.src = __nm.u(j.url);
  v.hidden = false;
  if (v.parentElement) v.parentElement.classList.toggle('alpha', !!j.preview);
  if (window.nmAlpha) {
    if (/^ly_out\/\d{12}-[0-9a-f]{6}\/preview_stacked\.mp4(\?v=\d+)?$/.test(String(j.preview_stacked || ''))) window.nmAlpha.mount(v, String(j.preview_stacked), {
      w: j.stacked_w,
      h: j.stacked_h
    });else window.nmAlpha.unmount(v);
  }
  const opv = $('#lyPv');
  if (opv && !opv.hidden) {
    try {
      const ov = $('#lyVid');
      if (ov && !ov.paused) ov.pause();
    } catch (e) {}
    opv.hidden = true;
    lyPvSync();
  }
  if (window.nmEta && _lyBurnT0) {
    window.nmEta.done('edit-burn', (Date.now() - _lyBurnT0) / 1000);
    _lyBurnT0 = 0;
  }
  dockSync();
  const dl = $('#lyBurnDl');
  dl.hidden = false;
  if (!dl._icon) {
    dl.innerHTML = __nm.h(window.DOWNLOAD_SVG);
    dl._icon = 'dl';
  }
  dl.dataset.url = j.url;
  const lyUpExpired = s => {
    const m = /\/up_src\/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})-/.exec(String(s || ''));
    return !!m && Date.now() - Date.UTC(2000 + +m[1], +m[2] - 1, +m[3], +m[4] - 9, +m[5], +m[6]) > 24 * 3600e3;
  };
  const rb = $('#lyReburn');
  if (rb) rb.hidden = !(j.src && /^https?:\/\//i.test(j.src)) || lyUpExpired(j.src);
  const cdw = $('#lyCutDelW');
  if (cdw) cdw.hidden = true;
  $('#lyBurnNote').textContent = (j.note ? j.note + ' · ' : '') + (j.bytes ? (j.bytes / 1048576).toFixed(1) + 'MB' : '') + (j.xtr_note ? ' · ' + j.xtr_note : '');
}
async function lyVidFetch(outPath) {
  try {
    const r = await window.fetch(outPath.replace(/[^/]+$/, 'video.json') + '?t=' + Date.now());
    if (!r.ok) return null;
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    const tx = await r.text();
    if (ct.includes('text/html') || /^\s*</.test(tx)) return null;
    return JSON.parse(tx);
  } catch (e) {
    return null;
  }
}
(function () {
  const rb = $('#lyReburn');
  if (!rb) return;
  rb.addEventListener('click', async () => {
    if (!LY_ID) return;
    const prevUrl = $('#lyBurnDl').dataset.url || '';
    const st = $('#cstatus');
    st.classList.remove('err');
    if (LY_SPELL) {
      const n = lySpellApply();
      if (n) st.innerHTML = __nm.h(window.OK_SVG + ' 맞춤법 ' + n + '곳 교정 반영 — 다시 입히는 중');
    } else if (LY_SEGS && LY_SEGS.length && LY_LANG === 'ko') {
      rb.disabled = true;
      let found = false;
      try {
        st.innerHTML = __nm.h(window.nmLoader ? window.nmLoader('solving', '맞춤법 확인 중…') : '맞춤법 확인 중…');
        found = await lySpellScan();
      } catch (e) {} finally {
        rb.disabled = false;
      }
      if (found) {
        st.innerHTML = __nm.h(window.OK_SVG + ' 맞춤법 ' + LY_SPELL.items.length + '곳 — 고칠 것만 켜고 다시 입히기를 한 번 더 눌러');
        return;
      }
      st.innerHTML = __nm.h('');
    }
    if (rb._busy) return;
    rb._busy = true;
    let based = false;
    try {
      based = await lyRebase(st);
    } finally {
      rb._busy = false;
    }
    if (!based) return;
    let segs = null,
      restore = false,
      skipNote = '';
    if (LY_SEGS && LY_ORIG && LY_ORIG.segs && LY_ORIG.segs.length) {
      const cur = lyEffSegs(LY_SEGS);
      const dirty = JSON.stringify(cur) !== JSON.stringify(lyEffSegs(lyModel(LY_ORIG.segs)));
      if (dirty && !cur.length) skipNote = '조각이 전부 삭제돼 편집 반영 불가 — 현행 자막으로 구움';else if (dirty && LY_LANG !== 'ko' && LY_MD && !(LY_BASE && LY_BASE.src === 'subs')) skipNote = LY_LANG ? '외국어 영상은 편집분(원문 전사)을 번인에 안 실어 — 현행 한글 의역으로 구움' : '원문 언어 미확정 — 편집분 안 실어(현행 자막으로 구움)';else if (dirty) {
        segs = cur;
        LY_RESTORE_PEND = false;
      } else if (LY_RESTORE_PEND) restore = true;
    } else if (LY_SEGS) {
      skipNote = '원본 대조본 미확보 — 편집 반영 생략(새로고침 후 다시 시도)';
    }
    let dels = [];
    const cd = $('#lyCutDel');
    const cutdel = !!(cd && cd.checked);
    const delWanted = cutdel && !!(LY_SEGS && LY_SEGS.some(sg => sg.del && sg.s != null && sg.e != null && sg.e > sg.s));
    if (delWanted) dels = LY_SEGS.filter(sg => sg.del && sg.s != null && sg.e != null && sg.e > sg.s).map(sg => [Math.round(sg.s * 100) / 100, Math.round(sg.e * 100) / 100]);
    if (dels.length && !segs && !restore && !skipNote) {
      const cur = lyEffSegs(LY_SEGS);
      if (cur.length) segs = cur;else dels = [];
    }
    if (!segs) dels = [];
    if (delWanted && !dels.length) skipNote = (skipNote ? skipNote + ' · ' : '') + '삭제 컷 미적용(편집 미동봉 경로)';
    if (skipNote) {
      st.innerHTML = __nm.h(window.WARN_SVG + ' ' + esc(skipNote));
    }
    rb.hidden = true;
    lyBurnWait(segs ? dels.length ? '삭제 구간 잘라 입히는 중' : '편집한 자막으로 입히는 중' : restore ? '원본 의역 복원해 입히는 중' : '');
    try {
      const res = await window.fetch('/api/edit', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          reburn: LY_ID,
          opts: {
            ...lyOptsNow(),
            burn: true,
            cutdel
          },
          ...(segs ? {
            segs
          } : {}),
          ...(dels.length ? {
            del: dels
          } : {}),
          ...(restore ? {
            restore: 1
          } : {})
        })
      });
      const j = await res.json();
      if (!res.ok || j.error) {
        st.innerHTML = __nm.h(window.WARN_SVG + ' ' + esc(String(j.error || res.status)));
        st.classList.add('err');
        lyVidCheck(LY_OUT);
        return;
      }
      if (restore) LY_RESTORE_PEND = false;
      if (LY_BASE && (segs || restore)) {
        LY_BASE.sent = lyHash(JSON.stringify(segs || lyEffSegs(LY_SEGS)));
        lySave();
      }
      lyPollVideo(LY_OUT, Date.now(), prevUrl);
    } catch (e) {
      st.innerHTML = __nm.h(window.WARN_SVG + ' 요청 실패: ' + esc(e.message));
      st.classList.add('err');
      lyVidCheck(LY_OUT);
    }
  });
})();
(function () {
  const dl = $('#lyBurnDl');
  if (!dl) return;
  dl.addEventListener('click', () => {
    const u = dl.dataset.url;
    if (!u) return;
    if (!/^https?:\/\//i.test(u) && !/^ly_out\//.test(u)) return;
    const name = '자막영상_' + (LY_ID || 'nomute') + '.mp4';
    const a = document.createElement('a');
    a.href = __nm.u(/^https?:\/\//i.test(u) ? 'api/dl?u=' + encodeURIComponent(u) + '&n=' + encodeURIComponent(name) : u);
    a.download = name;
    const _href = a.href;
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => {
      try {
        a.remove();
      } catch (e) {}
    }, 1500);
    dlVerify(_href, dl);
  });
})();
let RES_AR = {
  id: '',
  ar: 0
};
const lyReSize = () => {
  if (P.sizeman) return P.size;
  return RES_AR.id && RES_AR.id === LY_ID && RES_AR.ar ? sizeFor(RES_AR.ar) : (sizeAuto(), P.size);
};
const lyRePos = () => {
  if (P.posman) return P.pos;
  return RES_AR.id && RES_AR.id === LY_ID && RES_AR.ar ? posFor(RES_AR.ar) : (posAuto(), P.pos);
};
const lyOptsNow = () => ({
  lang: ON.trn ? 'dual' : P.lang,
  tone: P.tone,
  filler: P.filler,
  style: P.style,
  pos: lyRePos(),
  size: Math.round(lyReSize()) / 1000,
  bg: P.bg,
  karaoke: P.karaoke,
  hi: P.hi,
  pop: P.pop,
  keyword: P.keyword,
  cut: ON.cut,
  cutlv: P.cutlv,
  bgm: ON.bgm,
  outline: Math.round(P.sh * 10) / 1000,
  pad: Math.min(.5, Math.max(0, Math.round(P.sh) / 1000)),
  shtype: P.shtype,
  oc: P.shc,
  font: P.font,
  fg: P.fg,
  kwc: P.kwc || 'green',
  glow: Math.round(P.glow || 0),
  ...(ON.trn ? {
    dual_small: Math.round(srcRatio() * 100) / 100,
    dual_gap: Math.round(Math.max(0, Math.min(60, +P.lgap || 0))) / 100
  } : {})
});
let EDIT_SUB = false;
async function editSubsInit(id) {
  LY_SPELL = null;
  lySpellRender();
  EDIT_SUB = false;
  try {
    const out = 'ly_out/' + id + '/subs.md';
    const r = await window.fetch(out + '?t=' + Date.now());
    if (!r.ok) return;
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    const md = await r.text();
    if (!md.trim() || ct.includes('text/html') || /^\s*<!doctype/i.test(md)) return;
    EDIT_SUB = true;
    dlPark();
    $('#vwrap').hidden = true;
    $('#dlVid').hidden = true;
    if (window.nmAlpha) window.nmAlpha.unmount($('#vwrap video'));
    await lyResult(out, md, false);
    await lyVidCheck(out);
  } catch (e) {}
}
const TOK_USD_PER_VMIN = 0.4,
  USD_KRW = 1380;
function estTokenKRW(d) {
  if (!(d && d.sub)) return 0;
  const vmin = Math.max(.2, (d.dur || 0) / 60);
  const usd = Math.min(4, Math.max(.15, vmin * TOK_USD_PER_VMIN));
  return Math.round(usd * USD_KRW / 50) * 50;
}
function estTokenNote(d) {
  const k = estTokenKRW(d);
  return d && d.sub ? ' · 예상 토큰비 ~₩' + k.toLocaleString('ko-KR') : ' · 토큰 0';
}
function fmtDur(sec) {
  sec = Math.max(0, Math.round(sec || 0));
  const h = sec / 3600 | 0,
    m = sec % 3600 / 60 | 0,
    ss = sec % 60,
    p = n => String(n).padStart(2, '0');
  return (h ? p(h) + '시간 ' : '') + p(m) + '분 ' + p(ss) + '초';
}
function statusSub(d) {
  const el = document.getElementById('cstatusSub');
  if (!el) return;
  if (!d) {
    el.hidden = true;
    el.textContent = '';
    return;
  }
  if (!d.sub) {
    el.textContent = '토큰 0 · 비용 0원 (영상 처리만 — LLM 미사용)';
    el.hidden = false;
    return;
  }
  const krw = estTokenKRW(d);
  el.textContent = '토큰 ~' + krw.toLocaleString('ko-KR') + '원 (자막 의역 · 영상 길이 기준 추정)';
  el.hidden = false;
}
function showResult(d, sec) {
  RESULT_URL = d.url || '';
  const m = String(EDIT_ID || '').match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})-/);
  if (m) {
    const s = Math.round((Date.parse(d.ts || '') - Date.parse('20' + m[1] + '-' + m[2] + '-' + m[3] + 'T' + m[4] + ':' + m[5] + ':' + m[6] + '+09:00')) / 1000);
    if (isFinite(s) && s > 0 && s < 86400) sec = s;
  }
  $('#cstatus').classList.remove('err');
  $('#cstatus').innerHTML = __nm.h(window.OK_SVG + ' 완료' + (sec ? ' · ' + fmtDur(sec) : '') + (d.note ? ' · ' + esc(d.note) : '') + (d.xtr_note ? ' · ' + window.WARN_SVG + ' ' + esc(d.xtr_note) : ''));
  statusSub(d);
  const vw = $('#vwrap');
  vw.hidden = false;
  vw.classList.toggle('alpha', !!d.preview);
  dlPark();
  vw.innerHTML = __nm.h('<video controls playsinline preload="metadata" src="' + esc(d.url) + '"></video>' + '<span class="hist-cap vmeta" id="vMeta" hidden></span>');
  if (window.nmAlpha && /^ly_out\/\d{12}-[0-9a-f]{6}\/preview_stacked\.mp4(\?v=\d+)?$/.test(String(d.preview_stacked || ''))) window.nmAlpha.mount(vw.querySelector('video'), String(d.preview_stacked), {
    w: d.stacked_w,
    h: d.stacked_h
  });
  dockSync();
  $('#dlVid').hidden = false;
  dlOver();
  const _v = vw.querySelector('video');
  try {
    if (d.url && window.nmRail) window.nmRail.add({
      url: String(d.url),
      poster: String(d.poster || ''),
      cap: '편집',
      varStr: vMetaStr(_v, d),
      dlname: String(d.url).split('/').pop() || 'video.mp4',
      src: jobCfgGet(EDIT_ID) ? {
        app: 'edit',
        id: String(EDIT_ID),
        v: String(d.src || '')
      } : null
    });
  } catch (e) {}
  const _rid = EDIT_ID;
  const _paint = () => {
    if (_v && _v.videoWidth && _v.videoHeight) RES_AR = {
      id: _rid,
      ar: _v.videoWidth / _v.videoHeight
    };
    const s = vMetaStr(_v, d);
    if (!s) return;
    const el = document.getElementById('vMeta');
    if (el) {
      el.textContent = s;
      el.hidden = false;
    }
    try {
      if (window.nmRail && window.nmRail.meta) window.nmRail.meta(d.url, s);
    } catch (e) {}
  };
  if (_v) _v.addEventListener('loadedmetadata', _paint, {
    once: true
  });
  window.setTimeout(_paint, 1500);
}
const RESNM = {
  720: '720p',
  1080: 'FHD',
  1440: '2K',
  2160: '4K'
};
const ARSNAP = [[9, 16], [16, 9], [1, 1], [4, 5], [5, 4], [3, 4], [4, 3], [21, 9]];
function vMetaStr(v, d) {
  const w = (v && v.videoWidth) | 0,
    h = (v && v.videoHeight) | 0;
  const dur = v && isFinite(v.duration) && v.duration > 0 ? v.duration : +(d || {}).dur || 0;
  const p = [];
  if (w && h) {
    const r = w / h;
    let hit = null;
    ARSNAP.forEach(a => {
      if (!hit && Math.abs(r - a[0] / a[1]) / (a[0] / a[1]) <= .02) hit = a;
    });
    if (hit) p.push(hit[0] + ':' + hit[1]);else {
      const g = (a, b) => b ? g(b, a % b) : a,
        k = g(w, h) || 1;
      p.push(w / k + ':' + h / k);
    }
    const s = Math.min(w, h);
    p.push(RESNM[s] || s + 'p');
  }
  if (dur) p.push(mmss(dur));
  return p.join(' · ');
}
const DL_HOME = $('#dlVid').parentNode;
function dlOver() {
  const b = document.getElementById('dlVid'),
    vw = document.getElementById('vwrap');
  if (!b || !vw || b.parentNode === vw) return;
  b.classList.remove('ghost');
  b.classList.add('imgdl');
  vw.appendChild(b);
}
function dlPark() {
  const b = document.getElementById('dlVid');
  if (!b || b.parentNode === DL_HOME) return;
  b.classList.remove('imgdl');
  b.classList.add('ghost');
  DL_HOME.appendChild(b);
}
window.nmJobEdit = (src, url) => {
  if (!src || !src.id) return;
  USER_ACT = true;
  const v = String(src.v || '');
  if (/^https?:\/\//i.test(v)) {
    const d = document.getElementById('pvDel');
    if (d && !d.disabled) d.click();
    const u = $('#url');
    if (u) {
      u.value = v;
      pvSync();
    }
  }
  openJob(String(src.id));
};
const mmss = s => {
  s = Math.max(0, Math.round(s));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
};
let CUTS = null,
  CUTOFF = new Set();
const CUTK = {
  sil: '무음',
  fil: '필러',
  take: '테이크'
};
function showCuts(d, id) {
  CUTS = d;
  if (id) CUTS.id = id;
  CUTOFF = new Set();
  const st = $('#cstatus'),
    list = $('#cutlist');
  st.classList.remove('err');
  if (!(d.rm || []).length) {
    st.innerHTML = __nm.h(window.WARN_SVG + ' 자를 곳이 없어' + (d.note ? ' — ' + esc(d.note) : '') + ' · 그대로 편집해도 돼');
    list.hidden = true;
    list.innerHTML = __nm.h('');
    return;
  }
  renderCuts();
}
function renderCuts() {
  const d = CUTS,
    rm = d && d.rm || [],
    list = $('#cutlist');
  const on = rm.filter((c, i) => !CUTOFF.has(i));
  const sec = on.reduce((a, c) => a + (c.e - c.s), 0);
  $('#cstatus').classList.remove('err');
  $('#cstatus').innerHTML = __nm.h(window.OK_SVG + ' 자를 곳 ' + on.length + '/' + rm.length + '군데 · ' + sec.toFixed(1) + '초 줄어듦(' + mmss(d.dur) + ' → ' + mmss(Math.max(0, d.dur - sec)) + ')' + (d.note ? ' · ' + esc(d.note) : ''));
  list.innerHTML = __nm.h(rm.map((c, i) => {
    const off = CUTOFF.has(i);
    return '<button class="cutrow' + (off ? '' : ' on') + '" type="button" role="option" aria-selected="' + (off ? 'false' : 'true') + '" data-ki="' + i + '"><span class="ct">' + mmss(c.s) + '–' + mmss(c.e) + ' · ' + (c.e - c.s).toFixed(1) + '초</span><b>' + esc(CUTK[c.k] || '컷') + (c.t ? ' · ' + esc(String(c.t).slice(0, 40)) : '') + '</b><span class="cw">' + (off ? '안 자름 — 탭하면 다시 자름' : '자름 — 탭하면 뺌') + '</span></button>';
  }).join('') + '<button class="cutrow on" type="button" id="cutGo"><b>이대로 편집하기</b><span class="cw">고른 구간만 잘라서 렌더 — 전사는 다시 안 돌림</span></button>');
  list.hidden = false;
}
$('#cutlist').addEventListener('click', e => {
  const b = e.target.closest('[data-ki]');
  if (b && CUTS) {
    const i = +b.dataset.ki;
    if (CUTOFF.has(i)) CUTOFF.delete(i);else CUTOFF.add(i);
    renderCuts();
    return;
  }
  if (!e.target.closest('#cutGo') || !CUTS) return;
  const rm = CUTS.rm || [];
  if (CUTOFF.size >= rm.length) {
    const st = $('#cstatus');
    st.innerHTML = __nm.h(window.WARN_SVG + ' 전부 뺐어 — 자를 게 없으면 컷 없이 편집해줘');
    st.classList.add('err');
    return;
  }
  if (CUTS.src && !$('#url').value.trim() && !FILE_R2 && !FILE_B64 && !_lastFile) $('#url').value = CUTS.src;
  if (!$('#url').value.trim() && !FILE_R2 && !FILE_B64 && !_lastFile) {
    const st = $('#cstatus');
    st.innerHTML = __nm.h(window.WARN_SVG + ' 원본 유실(보관 실패) — 파일 다시 선택 후 눌러줘');
    st.classList.add('err');
    return;
  }
  CUT_REF = {
    id: CUTS.id || EDIT_ID,
    off: [...CUTOFF].sort((x, y) => x - y)
  };
  ON.cut = true;
  render();
  $('#editGo').click();
});
document.addEventListener('click', e => {
  if (!e.target.closest('#cutScanBtn')) return;
  SCAN_ONCE = true;
  CUT_REF = null;
  $('#editGo').click();
});
$('#dlVid').innerHTML = __nm.h(window.DOWNLOAD_SVG);
$('#dlVid').addEventListener('click', e => {
  const b = e.currentTarget,
    u = RESULT_URL;
  if (!u) return;
  const name = 'edit_' + (EDIT_ID || Date.now()) + '.mp4';
  const a = document.createElement('a');
  if (/^https:\/\//.test(u)) a.href = __nm.u('api/dl?u=' + encodeURIComponent(u) + '&n=' + encodeURIComponent(name));else if (/^ly_out\//.test(u)) a.href = __nm.u(u);else return;
  a.download = name;
  const _href = a.href;
  document.body.appendChild(a);
  a.click();
  a.remove();
  b.classList.add('dl-done');
  dlVerify(_href, b);
});
function dlVerify(href, btn) {
  if (!href) return;
  window.fetch(href, {
    method: 'HEAD',
    cache: 'no-store'
  }).then(r => {
    if (r.ok) return;
    if (btn) btn.classList.remove('dl-done');
    errStatus('저장 실패');
  }).catch(() => {});
}
function ftIdle(b) {
  _ftRun = false;
  goFireDone(b);
}
$('#ftGo').addEventListener('click', async e => {
  const b = e.currentTarget,
    st = $('#cstatus');
  if (_ftRun) return;
  if (_uploading) return errStatus('진행중...');
  const url = $('#url').value.trim();
  if (!url && !FILE_B64 && !FILE_R2 && !_lastFile) return errStatus('입력 필요');
  if (url && !/^https?:\/\//i.test(url)) return errStatus('주소 오류');
  _ftRun = true;
  goBusy(b);
  st.classList.remove('err');
  st.innerHTML = __nm.h('');
  $('#ftRes').innerHTML = __nm.h('');
  const fail = m => {
    st.innerHTML = __nm.h(window.ERR_SVG + ' ' + esc(String(m)));
    st.classList.add('err');
    ftIdle(b);
  };
  if (url && FILE_R2) {
    window.nmUpDrop(FILE_R2);
    FILE_R2 = '';
  }
  if (!url && !FILE_B64 && !FILE_R2 && _lastFile) {
    const f = _lastFile;
    try {
      fileSlotPct(f, 0);
      const up = await window.nmUpload(f, p => {
        if (_lastFile === f) fileSlotPct(f, p);
      });
      FILE_R2 = up.key;
      fileSlotName(f);
    } catch (err) {
      return fail('업로드 실패 — 다시 눌러줘');
    }
  }
  const _q = (($('#ftQ') || {}).value || '').trim().slice(0, 300);
  const FT_O = Object.assign({
    n: 2,
    scale: 2,
    ar: '4:5'
  }, _q ? {
    q: _q
  } : {});
  const payload = url ? {
    url,
    opts: FT_O
  } : FILE_R2 ? {
    r2key: FILE_R2,
    name: FILE_NAME,
    opts: FT_O
  } : {
    fileB64: FILE_B64,
    name: FILE_NAME,
    opts: FT_O
  };
  const _ftSig = typeof window.AbortSignal !== 'undefined' && window.AbortSignal.timeout ? window.AbortSignal.timeout(payload.fileB64 ? 180000 : 60000) : null;
  window.fetch('/api/framethumb', Object.assign({
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  }, _ftSig ? {
    signal: _ftSig
  } : {})).then(async r => ({
    r,
    j: await r.json().catch(() => null)
  })).then(({
    r,
    j
  }) => {
    if (!r.ok || !j || !j.ok) {
      const _m = j && j.error || '발사 실패 ' + r.status;
      if (FILE_R2 && /업로드 키|업로드 파일이 없어|업로드 미설정/.test(_m)) {
        window.nmUpDrop(FILE_R2);
        FILE_R2 = '';
      }
      return fail(_m);
    }
    const t0 = Date.now();
    (function tick() {
      if (Date.now() - t0 > 65 * 60000) return fail('시간 초과 — 잠시 뒤 다시 눌러줘');
      window.fetch('ft_out/' + j.id + '/frames.json?t=' + Date.now()).then(rr => rr.ok ? rr.text() : '').then(tx => {
        let d = null;
        if (tx && !/^\s*</.test(tx)) {
          try {
            d = JSON.parse(tx);
          } catch (_) {}
        }
        if (d && d.state === 'done') {
          ftRender(d);
          ftIdle(b);
          return;
        }
        if (d && d.state === 'failed') return fail(d.error || '추출 실패');
        window.setTimeout(tick, 7000);
      }).catch(() => window.setTimeout(tick, 7000));
    })();
  }).catch(async err => {
    const _to = err && (err.name === 'TimeoutError' || err.name === 'AbortError');
    const _au = !_to && err && err.name === 'TypeError' && /^(failed to fetch|load failed|networkerror when attempting to fetch resource)/i.test(String(err.message || '')) && window.nmSync && window.nmSync.probeNow ? (await window.nmSync.probeNow()) === 'auth' : false;
    fail(_to ? '접수가 응답이 없어 — 회선 확인하고 다시' : _au ? '로그인 만료 — 도구 닫고 다시 로그인' : '네트워크 오류 — 다시 눌러줘');
  });
});
function ftRender(d) {
  const res = $('#ftRes');
  res.innerHTML = __nm.h('');
  (d.frames || []).forEach((f, i) => {
    const it = document.createElement('div');
    it.className = 'ftit';
    const im = document.createElement('img');
    im.alt = '베스트컷 ' + (i + 1);
    im.loading = 'lazy';
    im.src = __nm.u(f.url);
    const tt = Number(f.t);
    const k = document.createElement('span');
    k.className = 'ftk';
    k.textContent = i + 1 + (isFinite(tt) ? ' · ' + Math.floor(tt / 60) + ':' + String(Math.floor(tt % 60)).padStart(2, '0') : '');
    if (f.quote) it.title = f.quote;
    it.appendChild(k);
    const dl = document.createElement('button');
    dl.type = 'button';
    dl.className = 'dlbtn ftdl';
    dl.setAttribute('aria-label', '스틸 저장');
    dl.innerHTML = __nm.h(window.DOWNLOAD_SVG);
    dl.addEventListener('click', () => {
      const name = 'bestcut_' + d.id + '_' + (i + 1) + '.' + ((String(f.url || '').split('?')[0].split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg');
      const a = document.createElement('a');
      if (/^https:\/\//.test(f.url)) a.href = __nm.u('api/dl?u=' + encodeURIComponent(f.url) + '&n=' + encodeURIComponent(name));else a.href = __nm.u(f.url);
      a.download = name;
      const _href = a.href;
      document.body.appendChild(a);
      a.click();
      a.remove();
      dl.classList.add('dl-done');
      dlVerify(_href, dl);
    });
    it.appendChild(im);
    it.appendChild(dl);
    res.appendChild(it);
  });
}
async function openJob(id) {
  EDIT_ID = id;
  jobCfgApply(id);
  const st = $('#cstatus');
  try {
    const r = await window.fetch('ly_out/' + id + '/video.json?t=' + Date.now());
    if (r.ok) {
      const tx = await r.text();
      if (tx && !/^\s*</.test(tx)) {
        let d = null;
        try {
          d = JSON.parse(tx);
        } catch (e) {}
        if (d && d.url) {
          showResult(d, 0);
          await editSubsInit(id);
          return true;
        }
        if (d && (d.error || d.skip)) {
          st.innerHTML = __nm.h(window.ERR_SVG + ' ' + esc(String(d.error || d.skip)));
          st.classList.add('err');
          return false;
        }
      }
    }
    const rk = await window.fetch('ly_out/' + id + '/cuts.json?t=' + Date.now());
    if (rk.ok) {
      const tk = await rk.text();
      if (tk && !/^\s*</.test(tk)) {
        let dk = null;
        try {
          dk = JSON.parse(tk);
        } catch (e) {}
        if (dk && Array.isArray(dk.rm)) {
          showCuts(dk, id);
          return true;
        }
      }
    }
    const er = await window.fetch('ly_out/' + id + '/error.log?t=' + Date.now());
    if (er.ok) {
      const em = await er.text();
      if (em && em.trim() && !/^\s*</.test(em)) {
        st.innerHTML = __nm.h(window.ERR_SVG + ' ' + esc(em.trim().slice(0, 160)));
        st.classList.add('err');
        return false;
      }
    }
    try {
      const rs = await window.fetch('/api/edit?stat=' + encodeURIComponent(id) + '&t=' + Date.now(), {
        cache: 'no-store'
      });
      if (rs.ok) {
        const ts = await rs.text();
        if (ts && !/^\s*</.test(ts)) {
          let ds = null;
          try {
            ds = JSON.parse(ts);
          } catch (e) {}
          if (ds && ds.url) {
            showResult(ds, 0);
            await editSubsInit(id);
            return true;
          }
          if (ds && (ds.error || ds.skip)) {
            st.innerHTML = __nm.h(window.ERR_SVG + ' ' + esc(String(ds.error || ds.skip)));
            st.classList.add('err');
            return false;
          }
        }
      }
    } catch (e) {}
    for (const kk of ['cuts']) {
      try {
        const rq = await window.fetch('/api/edit?stat=' + encodeURIComponent(id) + '&k=' + kk + '&t=' + Date.now(), {
          cache: 'no-store'
        });
        if (rq.ok) {
          const tq = await rq.text();
          if (tq && !/^\s*</.test(tq)) {
            let dq = null;
            try {
              dq = JSON.parse(tq);
            } catch (e) {}
            if (kk === 'cuts' && dq && Array.isArray(dq.rm)) {
              showCuts(dq, id);
              return true;
            }
          }
        }
      } catch (e) {}
    }
    st.textContent = '결과를 못 찾았어 — 진행 중이면 완성 후 다시 열어줘';
  } catch (e) {
    st.textContent = '결과 불러오기 실패 — 새로고침해줘';
  }
  return false;
}
if (!BC_MODE) window.nmJobShow = (url, e) => {
  const id = e && e.src && e.src.id || (/\/ly_out\/([A-Za-z0-9_-]+)\//.exec(String(url || '')) || [])[1] || '';
  if (!/^[A-Za-z0-9_-]+$/.test(id)) return false;
  USER_ACT = true;
  (async () => {
    if (await openJob(id)) edFocusResult(8);
  })();
  return true;
};
function edFocusResult(tries) {
  const el = ['#lyBurn', '#vwrap', '#cutlist', '#lyTabs', '#out'].map(s => $(s)).find(e => e && !e.hidden && e.offsetParent !== null);
  if (el) {
    try {
      el.scrollIntoView({
        behavior: LY_RM.matches ? 'auto' : 'smooth',
        block: 'start'
      });
    } catch (e) {}
    el.classList.add('edfocus');
    window.setTimeout(() => el.classList.remove('edfocus'), 2200);
    return;
  }
  if (tries > 0) window.setTimeout(() => edFocusResult(tries - 1), 200);
}
(function () {
  const q = (window.location.search.match(/[?&]done=([\w-]+)\b/) || [])[1];
  const h = (window.location.hash.match(/^#done=([\w-]+)$/) || [])[1];
  const id = q || h;
  if (!id || BC_MODE) return;
  USER_ACT = true;
  pendClear(id);
  (async () => {
    if (await openJob(id)) edFocusResult(8);
  })();
})();
(function () {
  if (BC_MODE) return;
  let all = [];
  try {
    all = window.nmJobs.list(PEND_KEY);
  } catch (e) {
    all = [];
  }
  all.forEach((p, i) => {
    if (!p || !p.id) return;
    if (Date.now() - (p.t0 || 0) > RESUME_MAX_MS) {
      pendClear(p.id);
      return;
    }
    const t0c = Math.max(p.t0 || 0, Date.now() - BUDGET * 1000);
    pollEdit(p.id, t0c, (p.t0 || 0) - 90000, p.lbl || '편집 중', p.cutscan ? 'cutscan' : '', !USER_ACT && i === 0);
  });
})();
render();
let _jlSig = '',
  _jlBusy = false;
const _r2Extra = new Map(),
  _jlIds = new Set();
async function loadJobLib() {
  if (_jlBusy) return;
  _jlBusy = true;
  try {
    let jobs = null,
      tx = 'x';
    try {
      const r = await window.fetch('ly_out/index.json?t=' + Date.now());
      if (r.ok) {
        const ct = (r.headers.get('content-type') || '').toLowerCase();
        const t = await r.text();
        if (t && !ct.includes('text/html') && !/^\s*</.test(t)) {
          const p = JSON.parse(t);
          if (Array.isArray(p)) {
            jobs = p;
            tx = t;
          }
        }
      }
    } catch (e) {}
    const vids = (jobs || []).filter(j => j && j.st !== 'subs');
    vids.forEach(j => {
      if (j && j.id) _jlIds.add(j.id);
    });
    const XK = {
      video: {
        t: '편집 영상',
        st: 'done'
      },
      cuts: {
        t: '컷 후보',
        st: 'cut'
      }
    };
    const extra = [..._r2Extra].filter(([id]) => !_jlIds.has(id)).map(([id, k]) => ({
      id,
      ts: '20' + id.slice(0, 2) + '-' + id.slice(2, 4) + '-' + id.slice(4, 6) + 'T' + id.slice(6, 8) + ':' + id.slice(8, 10) + ':' + id.slice(10, 12),
      t: (XK[k] || XK.video).t,
      d: 0,
      st: (XK[k] || XK.video).st
    }));
    const railIds = jlRailIds();
    const all = extra.concat(vids).filter(j => !(j && j.id && railIds.has(j.id)));
    if (!all.length) return;
    const sig = tx + '|' + extra.map(e => e.id).join(',') + '|' + [...railIds].sort().join(',');
    if (sig === _jlSig) return;
    _jlSig = sig;
    const list = $('#lyJobList');
    if (!list) return;
    list.textContent = '';
    const ST = {
      done: '완료',
      cut: '컷 후보',
      fail: '실패',
      gen: '진행중'
    };
    all.slice(0, 60).forEach(j => {
      if (!/^[A-Za-z0-9_-]+$/.test(j.id || '')) return;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'lyjob';
      const ts = String(j.ts || ''),
        tsx = ts.length >= 16 ? ts.slice(5, 10) + ' ' + ts.slice(11, 16) : '';
      const tags = Array.isArray(j.tg) ? j.tg.map(x => '#' + String(x).replace(/\s+/g, '')).join(' ') : '';
      const ttl = j.t || '편집 영상';
      b.title = ttl;
      b.setAttribute('aria-label', [tsx, ttl, tags, ST[j.st] || '진행중'].filter(Boolean).join(' · '));
      b.innerHTML = __nm.h('<div class="hist-thumb ljth">' + (j.pt ? '<img class="ljv" alt="" loading="lazy" decoding="async">' : '<div class="ljph" aria-hidden="true">미리보기 없음</div>') + '<span class="hist-cap ljts"></span><span class="hist-cap ljtr"></span><span class="hist-cap ljbl"></span><span class="hist-cap ljbr"></span></div>');
      b.querySelector('.ljts').textContent = tsx;
      const stEl = b.querySelector('.ljtr');
      stEl.textContent = ST[j.st] || '진행중';
      if (ST[j.st]) stEl.classList.add(j.st);
      const tgEl = b.querySelector('.ljbl');
      if (tags) tgEl.textContent = tags;else tgEl.hidden = true;
      const dEl = b.querySelector('.ljbr');
      if (j.d) dEl.textContent = mmss(j.d);else dEl.hidden = true;
      if (j.pt) {
        const iEl = b.querySelector('.ljv');
        iEl.onerror = () => {
          const ph = document.createElement('div');
          ph.className = 'ljph';
          ph.setAttribute('aria-hidden', 'true');
          ph.textContent = '미리보기 없음';
          iEl.replaceWith(ph);
        };
        iEl.src = __nm.u(j.pt);
      }
      b.onclick = async () => {
        if (_polling) return;
        USER_ACT = true;
        if (await openJob(j.id)) {
          const tgt = !$('#vwrap').hidden && $('#vwrap') || null;
          if (tgt) tgt.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth',
            block: 'start'
          });
        }
      };
      list.appendChild(b);
    });
    list.hidden = !list.children.length;
    railAdopt();
  } catch (e) {} finally {
    _jlBusy = false;
  }
}
function jlRailIds() {
  const s = new Set();
  try {
    (window.nmRail && window.nmRail.items ? window.nmRail.items() : []).forEach(e => {
      const m = /\/ly_out\/([A-Za-z0-9_-]+)\//.exec(String(e && e.url || ''));
      if (m) s.add(m[1]);
    });
  } catch (e) {}
  return s;
}
let _jlAdT = null;
function railAdopt(tries) {
  const list = $('#lyJobList');
  if (!list) return;
  let ok = false;
  try {
    ok = !!(window.nmRail && window.nmRail.adopt && window.nmRail.adopt(list));
  } catch (e) {}
  if (ok || (tries | 0) >= 8) return;
  window.clearTimeout(_jlAdT);
  _jlAdT = window.setTimeout(() => railAdopt((tries | 0) + 1), 400);
}
let _r2eBusy = false;
async function pollR2RecentEdit() {
  if (document.hidden || _r2eBusy) return;
  _r2eBusy = true;
  try {
    const r = await window.fetch('/api/edit?recent=24');
    if (!r.ok) return;
    const d = await r.json();
    const items = d && Array.isArray(d.items) ? d.items : [];
    if (!items.length) return;
    let changed = false;
    for (const it of items) {
      const id = it && it.id;
      if (!id || !/^[A-Za-z0-9_-]{1,64}$/.test(id) || _jlIds.has(id) || _r2Extra.has(id)) continue;
      _r2Extra.set(id, {
        video: 1,
        cuts: 1
      }[it.k] ? it.k : 'video');
      changed = true;
    }
    if (changed) {
      _jlSig = '';
      await loadJobLib();
    }
  } catch (e) {} finally {
    _r2eBusy = false;
  }
}
if (!BC_MODE) {
  loadJobLib().then(() => pollR2RecentEdit());
  window.nmRefresh = () => {
    pollR2RecentEdit();
    return loadJobLib();
  };
  window.setInterval(() => {
    if (!document.hidden) {
      loadJobLib();
      pollR2RecentEdit();
    }
  }, 10000);
}
const PVZOOM = {
  K: 'nm.pvzoom',
  get() {
    try {
      return window.localStorage.getItem(this.K) === '1';
    } catch (_) {
      return false;
    }
  },
  set(on) {
    try {
      on ? window.localStorage.setItem(this.K, '1') : window.localStorage.removeItem(this.K);
    } catch (_) {}
  }
};
(function () {
  const td = document.getElementById('topDock'),
    b = document.getElementById('cpZoom');
  if (!td || !b) return;
  const paint = on => {
    td.classList.toggle('dockzoom', on);
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.setAttribute('aria-label', on ? '미리보기 원상복귀' : '미리보기 확대');
    b.title = on ? '탭=원상복귀' : '탭=미리보기 확대 · 다시 탭=원상복귀';
  };
  paint(PVZOOM.get());
  b.addEventListener('click', () => {
    const on = !td.classList.contains('dockzoom');
    paint(on);
    PVZOOM.set(on);
  });
})();
}
function inline4(window, document, __nm) {
['lyFindQ', 'lyFindR', 'ftQ'].forEach(id => {
  const el = document.getElementById(id);
  if (el && window.attachCopyPaste) window.attachCopyPaste(el, true);
});
}
export const PAGE = {
  path: "/edit.html",
  fonts: FONTS,
  css: [SHEETS["tokens.css"],
    SHEETS["nm-shared.css"],
    SHEETS["nm-cards.css"],
    SHEETS["nm-hist.css"],
    SHEETS["nm-job.css"],
    SHEETS["nm-clip.css"],
    SHEETS["nm-input.css"],
    ``,
    `.nd-root{ --well:#0e0f11;   
    --bg:#121212; --pan:#16171a; --line:#2a2c31; --line2:rgba(255,255,255,.06);    --fg:#eef7f0; --mut:#8fa697;
    --hist-accent:#FFE13D; --hist-rgb:255,225,61;   
    --accent:#00EED2; --accent-rgb:0,238,210;
    --accent-4:#FFE13D; --accent-4-rgb:255,225,61;    --accent-dim:rgba(var(--accent-rgb),.13); --on-accent:#032322;
    --accent-2:#FFE13D; --accent-2-rgb:255,225,61;   
    --danger:#e23b2a; --danger-rgb:226,59,42; --warn:#FFE13D; --warn-rgb:255,225,61;   
    --accent-5:#0FFD02; --accent-6:#FF5EC8; --bias-l2:#3a6ddb; --bias-l1:#38C6FF;      
    --press-pico:.72; --press-xs:.82; --press-s:.85; --press-m:.9; --press-l:.95;
  }
  @media (prefers-reduced-motion:reduce){ .nd-root{ --press-pico:1; --press-xs:1; --press-s:1; --press-m:1; --press-l:1; } }
  * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }  nd-body { margin:0; background:var(--bg); color:var(--fg); font:15px/1.6 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; letter-spacing:-.2px ; -webkit-font-smoothing:antialiased; }  nd-html.inmodal, nd-html.inmodal nd-body { background:transparent; }
  nd-html .cscroll, nd-html .escroll { display:none !important; }   
  nd-html { scrollbar-width:none; -ms-overflow-style:none; scrollbar-color:rgba(255,255,255,.05) transparent; }  * { scrollbar-width:none; }   
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.05); border-radius:999px;
    border:1px solid var(--bg); background-clip:padding-box; }  .wrap { max-width:600px; margin:0 auto; padding:18px max(16px, env(safe-area-inset-right)) calc(28px + env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left)); }   
  label.fl { display:block; font-size:var(--fs-label); color:var(--fg); font-weight:var(--fw-x); margin:16px 0 9px; }   
  label.fl::before { content:'• '; color:var(--accent); font-weight:var(--fw-b); }
  .srcwrap { padding-bottom:0; }   
  .srcrow { display:flex; gap:10px; align-items:stretch; padding-top:2px; }
  .file { flex:0 0 84px; display:grid; place-items:center; padding:10px; border:1px dashed transparent; border-radius:var(--r-s); text-align:center; color:var(--accent); cursor:pointer; background:transparent; user-select:none; transition:transform var(--dur-fast) ease, background var(--dur) ease, border-color var(--dur) ease, color var(--dur) ease; }
  .file svg { width:26px; height:26px; display:block; margin:0 auto; transition:transform var(--dur-fast) cubic-bezier(.2,.9,.3,1.25); }
  .file:active svg { transform:scale(var(--press-xs)); }
  .file.has { color:var(--fg); }
  .file .ftype { display:inline-grid; place-items:center; min-width:42px; height:22px; padding:0 7px; border-radius:6px; background:rgba(var(--accent-rgb),.14); color:var(--accent); font-size:11px; font-weight:var(--fw-x); letter-spacing:.4px; font-variant-numeric:tabular-nums; }   
  .file .fname { font-size:11px; max-width:74px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:block; margin-top:3px; }
  .urlwrap { position:relative; flex:1; }
  input[type=url] { width:100%; height:100%; min-height:52px; padding:12px 40px 12px 12px; background:rgba(14,15,17,.55); border:1px solid var(--line); border-radius:var(--r-s); color:var(--fg); font:inherit; font-size:16px; }   
  input:focus { border-color:rgba(var(--accent-rgb),.35); box-shadow:0 0 0 3px rgba(var(--accent-rgb),.08); outline:none; }
  input::placeholder { color:var(--mut); }
  .urlclip { position:absolute; top:50%; right:12px; transform:translateY(-50%); display:grid; place-items:center; width:26px; height:26px; padding:0; z-index:5; opacity:.6;
    border-radius:50%; border:1px solid rgba(255,255,255,.17); background:rgba(26,28,26,.3); color:var(--mut); cursor:pointer; box-shadow:inset 0 1px 0 rgba(255,255,255,.2);
     transition:transform var(--dur-fast), color var(--dur), border-color var(--dur); }
  .urlclip::before { content:""; position:absolute; inset:-8px; }
  .urlclip svg { display:block; width:13px; height:13px; }
  .urlclip:active { transform:translateY(-50%) scale(var(--press-s)); color:var(--accent); border-color:rgba(var(--accent-rgb),.6); }
  .recrow { display:grid; grid-template-columns:repeat(auto-fit, minmax(0,1fr)); gap:6px; margin:var(--sp-1) 0 var(--sp-2); }      
  .rec { height:var(--btn-sm); min-width:0; padding:0 4px; display:flex; align-items:center; justify-content:center; gap:5px; white-space:nowrap; border-radius:var(--r-s); border:1px solid rgba(var(--accent-rgb),.3); background:rgba(var(--accent-rgb),.04); color:var(--fg); font-weight:var(--fw-x); font-size:var(--fs-label); font-family:inherit; cursor:pointer; transition:transform var(--dur-fast); }   
  .rec:active { transform:scale(var(--press-m)); }
  .rec .st { color:var(--accent); }
  .stack { display:flex; flex-direction:column; gap:var(--sp-2); }
  .scard { border:1px solid rgba(255,255,255,.06); border-radius:var(--r-s); background:rgba(255,255,255,.015); }         
  .scard .hd { display:flex; align-items:center; gap:9px; padding:8px 13px; cursor:pointer;    user-select:none; }
  .scard .no { color:var(--accent); font-weight:var(--fw-x); font-size:var(--fs-xs); min-width:13px; font-variant-numeric:tabular-nums; }
  .scard .nm { font-weight:var(--fw-b); font-size:var(--fs-label); flex:none; padding-block:6px ; line-height:normal; }   
  .scard .sum { color:var(--mut); font-size:var(--fs-xs); margin-left:auto; text-align:right; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; opacity:.4; }   
  .scard .rm { position:relative; width:26px; height:26px; flex:none; display:grid; place-items:center; border-radius:var(--r-s); border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.04); color:var(--mut); cursor:pointer; transition:transform var(--dur-fast); }
  .scard .rm::before { content:""; position:absolute; inset:-9px; }   
  .scard .rm:active { transform:scale(var(--press-s)); }
  .scard .rm svg { width:11px; height:11px; }
  .scard .prm { padding:2px 13px 12px; border-top:1px solid rgba(255,255,255,.06); }
  .empty-stack { color:var(--mut); font-size:var(--fs-sm); border:1px dashed var(--line); border-radius:var(--r-l); padding:12px; text-align:center; }   
  .sech { display:flex; align-items:center; gap:6px; margin:16px 0 9px; font-weight:var(--fw-x); font-size:var(--fs-label); color:var(--fg); }      
  .sech::before { content:'•'; color:var(--accent); font-weight:var(--fw-b); }   
  .scard .hd.st { cursor:default; }   
  .scard .hd.st:has(> .cyv:only-child) { cursor:pointer; -webkit-tap-highlight-color:transparent; }
  .scard .hd.st:has(> .cyv:only-child):active .cyv { transform:scale(var(--press-m)); }
  .scard > .hd.acch { width:100%; margin:0; background:none; border:0; color:var(--fg); font-family:inherit; text-align:left; -webkit-tap-highlight-color:transparent; }   
  .scard .chev { width:14px; height:14px; flex:none; fill:none; stroke:var(--mut); stroke-width:2.2; stroke-linecap:round; stroke-linejoin:round; }   
  .scard > .acc { display:grid; grid-template-rows:0fr; transition:grid-template-rows .45s cubic-bezier(.16,1,.3,1); }   
  .scard.open > .acc { grid-template-rows:1fr; }
  .scard > .acc > .acc-in { min-height:0; overflow:hidden; visibility:hidden; transition:visibility 0s linear .45s; }   
  .scard.open > .acc > .acc-in { visibility:visible; transition-delay:0s; }
  @media (prefers-reduced-motion:reduce) { .scard > .acc, .scard > .acc > .acc-in { transition:none; } }
  .addbtn { margin-top:var(--sp-2); width:100%; height:42px; border-radius:var(--r-l); border:1px dashed var(--line); background:transparent; color:var(--accent); font:inherit; font-weight:var(--fw-x); font-size:var(--fs-label); cursor:pointer; transition:transform var(--dur-fast); }
  .addbtn:active { transform:scale(var(--press-l)); }
  .prow { display:flex; gap:5px; flex-wrap:wrap; margin-top:9px; }
  .plbl { flex-basis:100%; color:var(--mut); font-size:var(--fs-xs); font-weight:var(--fw-x); margin-top:9px; }
  .plbl.plbl-nm { color:var(--fg); font-size:var(--fs-label); font-weight:var(--fw-b); }   
  .pc { height:var(--btn); padding:0 11px; display:inline-flex; align-items:center; border-radius:var(--r-s); border:1px solid var(--line); background:rgba(255,255,255,.04); color:var(--mut); font-weight:var(--fw-x); font-size:var(--fs-label); font-family:inherit; cursor:pointer; user-select:none; transition:transform var(--dur-fast), color var(--dur), border-color var(--dur), background var(--dur); }
  .pc:active { transform:scale(var(--press-m)); }
  .pc.on { color:var(--accent); border-color:rgba(var(--accent-rgb),.55); background:rgba(var(--accent-rgb),.04); }   
  .pc.dim { opacity:.32; }   
  .pc .swd { display:inline-block; width:10px; height:10px; border-radius:50%; margin-right:5px; background:var(--sw,rgba(0,0,0,1)); border:1px solid rgba(255,255,255,.25); }   
  .swrow { display:flex; align-items:center; justify-content:space-between; gap:2px; padding:8px 0 ; flex-wrap:nowrap;
    margin-left:71px ; margin-right:51px ; }   
  @container nd (max-width:430px){ .swrow { margin-left:0; margin-right:0; }
}   
  .swc { display:inline-flex; align-items:center; gap:3px ; padding:5px 1px ; background:none; border:none; border-radius:0; font-family:inherit; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:transform var(--dur-fast); }   
  .swc:active { transform:scale(var(--press-s)); }   
  .swc .swd { display:inline-block; width:10px; height:10px; flex:none; border-radius:50%; background:var(--sw,rgba(0,0,0,1)); border:1px solid rgba(255,255,255,.25); }   
  .swc[data-sw="black"] .swd { border-color:rgba(255,255,255,.5); }   
  .swc { position:relative; }   
  .swc .swl { position:absolute; top:50%; left:100%; margin-left:3px ; transform:translateY(-50%); font-size:11px ; font-weight:var(--fw-x); line-height:1; color:var(--fg); white-space:nowrap; text-align:left; pointer-events:auto; }   
  .swc .swl { display:grid; place-items:center; padding:2px 5px ;
    border-radius:var(--r-s); border:1px solid rgba(255,255,255,.14); background:rgba(8,15,11,.34);
    backdrop-filter:var(--blur-s); -webkit-backdrop-filter:var(--blur-s); }   
  @container nd (max-width:430px){ .swc .swl { font-size:10px ; }
}   
  .swl i { position:relative; font-style:normal; cursor:grab; touch-action:none; -webkit-user-select:none; user-select:none; transition:transform .1s, opacity .14s; }
  .swl i::before { content:''; position:absolute; inset:-12px -2px ; }   
  .swl i:active { cursor:grabbing; }
  .swl i.drag { opacity:.55; }   
  .swc.dropok, .swc.on { transform:scale(1.18); }      
  .swc.dropok .swd, .swc.on .swd { border-color:rgba(var(--accent-rgb),.9); box-shadow:0 0 0 2px rgba(var(--accent-rgb),.35); }   
  .srow { display:flex; align-items:baseline; justify-content:space-between; gap:var(--sp-2); padding:8px 0 ; }   
  .srow .plbl { flex:0 0 auto; margin:0; font-size:var(--fs-label); font-weight:var(--fw-b); color:var(--fg); white-space:nowrap; }   
  .sopts { display:flex; flex-wrap:wrap; gap:3px 4px ; justify-content:flex-end; min-width:0; align-items:baseline; }   
  .sopts .pc { height:auto; background:none; border:none; border-radius:0; padding:6px 7px ; font-weight:var(--fw-b); font-size:var(--fs-label); color:var(--mut); }   
  .sopts .pc.on { color:var(--accent); font-weight:var(--fw-x); background:none; border:none; }   
  .srow.snaprow { align-items:center; }
  .srow.snaprow .nm-snap, .snapline { flex:1 1 0; max-width:calc(var(--n,4) * 150px) ; }
  .srow.snaprow .nm-snap { margin-left:auto; }
  .srow .plbl.lblhold { visibility:hidden; }   
  .snapline { margin-top:9px ; }
  @container nd (max-width:520px){ .srow.snaprow[data-wide] { flex-wrap:wrap; row-gap:var(--sp-1); } .srow.snaprow[data-wide] .plbl { flex-basis:100%; } .srow.snaprow[data-wide] .plbl.lblhold { display:none; } .srow.snaprow[data-wide] .nm-snap { flex-basis:100%; max-width:none; }
}   
  .sopts .pc.rsup { color:rgba(var(--accent-rgb),.5); }
  .sopts .pc.rsdn { color:rgba(var(--accent-4-rgb),.5); }
  .sopts .pc.rsup.on { color:var(--accent); }
  .sopts .pc.rsdn.on { color:var(--accent-4); }
  .ssep { font-size:var(--fs-label); font-weight:var(--fw-b); color:var(--mut); opacity:.35; pointer-events:none; }   
  .scard.cyc .hd { gap:6px; flex-wrap:wrap; cursor:default; align-items:baseline; }   
  .cyv { color:var(--accent); font-weight:var(--fw-x); font-size:var(--fs-sm); letter-spacing:.03em; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:color var(--dur-fast), transform var(--dur-fast); }   
  #xtrsec .cyv { min-width:3ch; white-space:nowrap; }   
  #xtrsec .prm .plbl { margin-top:16px; }   
  .cysp { flex:1 1 0; min-width:0; }   
  .cyv.off { color:var(--mut); }   
  .cyv:active { transform:scale(var(--press-m)); }
  .cysep { color:var(--mut); opacity:.45; font-weight:400; }
  .cyrow { display:flex; gap:8px; }   
  .cyrow > .scard { flex:1 1 0; min-width:0; }
  .optcards { display:flex; flex-direction:column; gap:8px ; margin-top:9px ; }
  .optcards > .scard > .srow, .optcards > .scard > .grow, .optcards > .scard > .swrow { margin:0; padding:8px 13px ; }
  .optcards > .scard > .grow { display:grid; }   
  .optcards > .scard > .swrow { justify-content:space-between; }   
  .optcards > .scard > .swrow { margin-left:0; margin-right:0; }   
  @container nd (max-width:379px){ .cyrow.tri > .scard .hd { padding-inline:8px ; gap:4px ; }
}   
  .cnote { padding:2px 13px 10px; font-size:var(--fs-xs); color:var(--mut); line-height:1.5; }   
  .grow { display:grid; grid-template-columns:60px 1fr 44px; align-items:center; gap:9px; margin-top:9px; font-size:var(--fs-xs); }   
  .grow .k { color:var(--mut); font-weight:var(--fw-b); }
  .grow input[type=range] { width:100%; accent-color:var(--accent); }
  .grow .nm-rbs, .lypv-row .nm-rbs { height:20px; }   
  .grow .v { text-align:right; color:var(--accent); font-weight:var(--fw-x); font-variant-numeric:tabular-nums; }
  .trimrow { display:flex; gap:9px; align-items:center; margin-top:9px; }
  .trimrow input[type=number] { flex:1; width:100%; padding:10px 11px; background:rgba(14,15,17,.55); border:1px solid var(--line); border-radius:var(--r-s); color:var(--fg); font:inherit; font-size:16px; font-variant-numeric:tabular-nums; }   
  .trimrow .tsep, .trimrow .tu { color:var(--mut); flex:none; font-size:var(--fs-sm); }
  .trimrow .tsn { flex:none; min-width:34px; color:var(--mut); font-size:var(--fs-xs); font-weight:var(--fw-x); font-variant-numeric:tabular-nums; }   
  .tl { margin-top:9px ; user-select:none; }
  .tl-lbls { display:flex; justify-content:space-between; margin-bottom:3px ; color:var(--mut); font-size:var(--fs-xs); font-variant-numeric:tabular-nums; }
  .tl-track { position:relative; height:26px; overflow:hidden; cursor:pointer; border:1px solid var(--line); border-radius:var(--r-s); background:repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 1px, transparent 1px 10%), rgba(255,255,255,.03); }      
  .tl-seg { position:absolute; top:0; bottom:0; pointer-events:none; border-inline:1px solid rgba(var(--accent-rgb),.55); background:linear-gradient(rgba(var(--accent-rgb),.30),rgba(var(--accent-rgb),.30)) left/0% 100% no-repeat, rgba(var(--accent-rgb),.10); animation:tlpaint 2.2s var(--gauge-ease) infinite; }   
  @keyframes tlpaint { 0% { background-size:0% 100%, 100% 100%; } 62%,100% { background-size:100% 100%, 100% 100%; } }
  @media (prefers-reduced-motion:reduce) { .tl-seg { animation:none; background-size:100% 100%, 100% 100%; } }
  .tl-ph { position:absolute; top:0; bottom:0; width:1px; pointer-events:none; background:var(--accent); box-shadow:0 0 6px rgba(var(--accent-rgb),.8); }   
  .glab4 { display:flex; justify-content:space-between; color:var(--mut); font-size:var(--fs-xs); font-weight:var(--fw-x); }
  .glab4 i { font-style:normal; }
  .glab4 i.on { color:var(--accent); }
  .hd .sopts { flex:1 1 0; }   
  .hd .sopts .pc { margin-block:-1.75px ; }
  .cyrow .cyv { min-width:3ch; white-space:nowrap; }   
  .pvsub { flex-direction:column; align-items:center; }   
  .pvsub span { display:block; }
  .pvsub .kw { color:var(--pvkw, var(--accent-5)); font-weight:inherit; }      
  .pvsub span[hidden] { display:none; }   
  .pvsub .pvsub-tr { opacity:.92; font-size:.5em ;
    position:absolute; top:100%; left:0; right:0;   
    width:fit-content; margin-inline:auto; max-width:100%;   
    color:#fff ;
    white-space:nowrap; text-shadow:none; }   
  .cpv-url { position:absolute; left:0; right:0; bottom:var(--sp-2); margin:0 auto; max-width:86%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:center; color:var(--mut); font-size:var(--fs-xs); cursor:pointer; }   
  .sheetdim { position:fixed; inset:0; z-index:30; background:rgba(8,9,10,.55); }
  .sheetdim[hidden] { display:none; }
  .sheet { position:fixed; left:0; right:0; bottom:0; height:64cqh; max-width:600px; margin-inline:auto; z-index:31; background:rgba(22,23,26,.97); border-top:1px solid rgba(255,255,255,.08); border-radius:var(--r-modal) var(--r-modal) 0 0; padding:14px 16px calc(14px + env(safe-area-inset-bottom)); overflow-y:auto; }   
  .sheet[hidden] { display:none; }
  .sheet .sh { display:flex; align-items:center; margin-bottom:4px; }
  .sheet .sh b { font-size:var(--fs-h3); font-weight:var(--fw-x); }
  .sheet .shx { margin-left:auto; width:var(--btn-sm); height:var(--btn-sm); display:grid; place-items:center; border-radius:var(--r-s); border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.04); color:var(--fg); cursor:pointer; transition:transform var(--dur-fast); }
  .sheet .shx:active { transform:scale(var(--press-s)); }
  .sheet .shx svg { width:13px; height:13px; }
  .sheet .grp { color:var(--mut); font-size:var(--fs-xs); font-weight:var(--fw-x); margin:12px 0 6px; }
  .xtr { margin-top:0; }   
  .scard > .prm:first-child { border-top:none; padding-top:10px ; }   
  .xtr .xgo { margin-top:var(--sp-2); width:100%; padding:var(--sp-1); border-radius:var(--r-m); background:var(--accent-dim); border:1px solid rgba(var(--accent-rgb),.4); color:var(--accent); font:inherit; font-size:var(--fs-label); line-height:1; font-weight:var(--fw-x); cursor:pointer; transition:transform var(--dur-fast); }   
  .xtr .xgo:active { transform:scale(var(--press-l)); }
  .xtr .xgo:disabled { opacity:.32; cursor:default; transform:none; }
  .xnote .nm-shim { font-size:inherit; font-weight:inherit; line-height:inherit; transform:none; }
  .xnote .xtime { margin-left:var(--sp-1); font-size:12.5px ; font-variant-numeric:tabular-nums; }
  .xgrp { margin-top:var(--sp-1); }
  .xgrow { display:flex; gap:var(--sp-1); align-items:flex-start; margin-top:var(--sp-1); }
  .xgrow .nmin { flex:1 1 40%; min-width:0; }
  .xdrop { flex:1 1 60%; min-height:47px; display:flex; flex-wrap:wrap; align-content:center; gap:6px;
    padding:6px; border:1px dashed var(--line); border-radius:var(--r-s); background:rgba(255,255,255,.02);
    transition:border-color var(--dur), background var(--dur); cursor:pointer; }
  .xdrop.act { border-color:rgba(var(--accent-rgb),.55); background:var(--accent-dim); border-style:solid; }
  .xdrop .ph { color:var(--mut); font-size:var(--fs-xs); align-self:center; }
  .xtag { display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:var(--fw-b); color:var(--accent);
    background:var(--accent-dim); border:1px solid rgba(var(--accent-rgb),.4); padding:2px 7px; border-radius:var(--r-pill); cursor:pointer; }
  .xtag img { width:18px; height:18px ; border-radius:50%; object-fit:cover; flex:none; }   
  .xgrow .swc.xcol { flex:none; align-self:center; padding:5px ; }   
  .xgrow .swc.xcol::before { content:''; position:absolute; inset:-8px; }   
  .xface.used { opacity:.35; }
  .xface[draggable=true], .xtag[draggable=true] { cursor:grab; }   
  .xgadd { margin-top:var(--sp-1); }
  .xfaces { display:flex; gap:var(--sp-1); flex-wrap:wrap; margin-top:var(--sp-1); }
  .xface { position:relative; width:56px; aspect-ratio:1/1.05; border-radius:var(--r-m); overflow:hidden; flex:none;
    background:radial-gradient(120% 120% at 50% 22%, rgba(255,255,255,.1), rgba(255,255,255,.02)); }
  .xface img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .xface .hint { position:absolute; bottom:3px; right:3px; font-size:10px; font-weight:var(--fw-b); color:var(--mut);
    background:rgba(0,0,0,.42); border:1px solid rgba(255,255,255,.1); padding:2px 7px; border-radius:var(--r-pill); }
  .xnote { margin-top:var(--sp-1); color:var(--mut); font-size:var(--fs-xs); line-height:1.5; }  .topdock #editGo, .topdock #ftGo, .topdock #go, .topdock .go { border-radius:var(--r-s) ; min-height:30px ; backdrop-filter:blur(var(--blur-s)); -webkit-backdrop-filter:blur(var(--blur-s)); }     
  .trailwrap > .trail-fire { margin:0; }
  .trailwrap > .trail-fire .go, .trailwrap > .trail-fire.go { margin:0; }
  .cpprev-box > .pvfire, .mon > .pvfire { position:absolute; left:var(--sp-2); right:var(--sp-2); bottom:var(--sp-2); width:auto ; z-index:4; margin:0; }
  .cpprev-box > .pvfire .go, .mon > .pvfire .go, .cpprev-box > .pvfire.go, .mon > .pvfire.go { margin:0; }   
  .optstrip { margin:0 0 var(--sp-2); padding:8px 13px ; background:#000 ; border:1px solid var(--line); border-radius:var(--r-s); }
  .optstrip .gospec { margin:0; padding:0; font-size:11.25px ; line-height:1.9;  white-space:nowrap; overflow-x:auto; scrollbar-width:none; -webkit-overflow-scrolling:touch; }
  .optstrip .gospec::-webkit-scrollbar, .optstrip .geni-sum::-webkit-scrollbar { display:none; }   
  .gospec .gs-lbl { color:var(--mut); font-weight:var(--fw-b); }
  .gospec .gs-v { color:var(--mut); }
  .gospec .gs-v.on { color:var(--accent); font-weight:var(--fw-b); }  .go { width:100%; padding:12px; background:rgba(255,255,255,.02); border:1px solid var(--line); border-radius:var(--r-pill);   
    color:var(--accent); font:inherit; font-weight:var(--fw-x); font-size:14px; line-height:1; cursor:pointer; transition:transform var(--dur-fast); position:relative; overflow:hidden; }  .go:disabled { opacity:.47; cursor:default; }
  #editGo, #ftGo { border-radius:var(--r-m); padding:var(--sp-1); font-size:var(--fs-label); overflow:visible; }   
  #editGo.busy, #ftGo.busy { white-space:nowrap; padding-left:0; padding-right:0; }   
  #editGo .gck { margin:-6.5px 0; }      
  #editGo::before, #ftGo::before { content:''; position:absolute; left:0; right:0; top:-9px; bottom:-9px; }   
  .go.err { color:var(--danger); border-color:rgba(var(--danger-rgb),.5); }
  .go.shake { animation:shake .32s; }
  @keyframes shake { 20%{ transform:translateX(-5px);} 45%{ transform:translateX(4px);} 70%{ transform:translateX(-3px);} 90%{ transform:translateX(2px);} }  @keyframes goFill { from { background-size:0% 100%, 100% 100%; } to { background-size:100% 100%, 100% 100%; } }   
  @media (prefers-reduced-motion:reduce) { .go.firing { animation-duration:.2s; } }
  .go.okdone { background:var(--accent); color:var(--on-accent); border-color:var(--accent); transition:none; }     
  #editGo.busy, #ftGo.busy { pointer-events:none; }   
  .go .gck { width:26px; height:26px; margin:-6px 0; animation:gckPop .44s cubic-bezier(.18,1.5,.4,1) forwards; }  @keyframes goTick { to { stroke-dashoffset:0; } }
  @keyframes gckPop { 0%{transform:scale(0)} 60%{transform:scale(var(--gauge-pop,1.15))} 100%{transform:scale(1)} }   
  @media (prefers-reduced-motion:reduce) { .go .gck { animation:none; transform:scale(1); } .go .gck path { animation:none; stroke-dashoffset:0; } }
  .go .eta { margin-left:8px; color:var(--mut); font-weight:var(--fw-b); font-size:var(--fs-sm); font-variant-numeric:tabular-nums; }  .gdots i:nth-child(2) { animation-delay:.22s; } .gdots i:nth-child(3) { animation-delay:.44s; }
  @keyframes gdots { 0% { opacity:0; } 25%,70% { opacity:1; } 95%,100% { opacity:0; } }
  @media (prefers-reduced-motion:reduce){ .gdots i { animation:none; opacity:1; } }
  .pvstage { display:flex; justify-content:center; }
  .pvstage[hidden] { display:none; }
  .pvbox { position:relative; overflow:hidden; background:rgb(0,0,0); border-radius:var(--r-l); }   
  .pvbox video { position:relative; width:100%; height:100%; display:block; }   
  .pvbox .pvbg { position:absolute; inset:0; background-size:cover; background-position:center; filter:blur(var(--blur-s)) saturate(1.05); transform:scale(1.2); }   
  .pvbox .pvbg[hidden] { display:none; }
  .pvsub { position:absolute; display:flex; justify-content:center; pointer-events:none; z-index:2; }
  .pvsub[hidden] { display:none; }
  .pvsub span { color:var(--fg); font-weight:var(--fw-b); white-space:nowrap; text-align:center; }   
  .pvpre { position:absolute; left:var(--sp-2); bottom:var(--sp-2); z-index:3; display:flex; align-items:center; gap:var(--sp-2); }   
  .pvpre-t { background:none; border:0; padding:0; font:inherit; font-weight:var(--fw-x); font-size:var(--fs-label); color:var(--fg); cursor:pointer; text-shadow:0 1px 10px rgba(0,0,0,.5); -webkit-tap-highlight-color:transparent; transition:color var(--dur); }   
  .pvpre-t.on { color:rgba(var(--accent-rgb),.5); }   
  .pvpre-t:active { transform:scale(var(--press-m)); }
  .pvpre-row { display:flex; gap:var(--sp-2); }
  .pvpre-row[hidden] { display:none; }
  .pvpre-i { background:none; border:0; padding:0; font:inherit; font-weight:var(--fw-x); font-size:var(--fs-label); color:var(--fg); cursor:pointer; text-shadow:0 1px 10px rgba(0,0,0,.5); white-space:nowrap; -webkit-tap-highlight-color:transparent; }
  .pvpre-i:active { transform:scale(var(--press-m)); }
  .pvpre-row:not([hidden]):not(.fold) .pvpre-i { animation:pvpre-in .24s both var(--ease); }   
  .pvpre-row:not([hidden]):not(.fold) .pvpre-i:nth-child(1) { animation-delay:.02s; }
  .pvpre-row:not([hidden]):not(.fold) .pvpre-i:nth-child(2) { animation-delay:.05s; }
  .pvpre-row:not([hidden]):not(.fold) .pvpre-i:nth-child(3) { animation-delay:.08s; }
  @keyframes pvpre-in { from { opacity:0; transform:translateX(-4px); } to { opacity:1; transform:none; } }
  .pvpre-row.fold .pvpre-i { animation:pvpre-out .18s both var(--ease); }   
  .pvpre-row.fold .pvpre-i:nth-child(3) { animation-delay:.04s; }
  .pvpre-row.fold .pvpre-i:nth-child(2) { animation-delay:.08s; }
  .pvpre-row.fold .pvpre-i:nth-child(1) { animation-delay:.12s; }
  @keyframes pvpre-out { to { opacity:0; transform:translateX(-4px); } }
  @media (prefers-reduced-motion:reduce) { .pvpre-row .pvpre-i { animation:none !important; } }
  .vstage, .pvstage { position:relative; width:100%; border-radius:var(--r-l); overflow:hidden; border:1px solid var(--line); background:#000; min-height:120px; margin-top:var(--sp-3); }   
  .pvslot .pvstage { margin-top:4px; min-height:0; }   
  .pvslot:empty { display:none; }
  .topdock { position:sticky; top:0; z-index:6; margin:-18px -16px 0 ; padding:var(--sp-2) 16px 0 ; background:rgba(18,18,18,1) ; border-bottom:1px solid rgba(var(--accent-rgb),.35) ; --line:rgba(255,255,255,.15) ; }         
  .topdock::after { content:none; }   
  .pvsec { position:relative ; --pvw:min(52%, 29cqh, 300px) ; margin:0 0 var(--sp-2); max-height:min(58cqh,620px); overflow:visible ; transition:max-height var(--dur-acc) var(--gauge-ease), opacity var(--dur) ease, margin-bottom var(--dur-acc) var(--gauge-ease); }   
  @media (prefers-reduced-motion:reduce){ .pvsec { transition:none; } }      
  .topdock.fold .pvsec { max-height:0; opacity:0; margin-bottom:0; overflow:hidden ; pointer-events:none; }   
  .pvsec::after { content:none; }   
  .pvsec[hidden] { display:none; }
  .pvsec > .fl { display:flex; align-items:center; }   
  .pvsec > .fl[hidden] { display:none; }   
  .pvsec.dropping .pvstage { border-color:rgba(var(--accent-rgb),.35); }   
  .cpprev-box { position:relative; width:var(--pvw); margin-inline:auto ; height:auto; aspect-ratio:1/1 ; contain:size ; min-height:0; background:#121212; border:1px solid transparent ; border-radius:var(--r-s); overflow:hidden; container-type:size ; }   
  .cpprev-box .pvslot { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }   
  .cpprev-box .pvslot .pvstage { margin-top:0; }
  .cpv-empty { position:absolute; inset:0; display:grid; place-items:center; background-color:inherit; }   
  .cpv-empty .cpv-stage { width:min(100%, calc(100cqh * 16 / 9)) ; aspect-ratio:16/9; background-color:inherit; display:grid; place-items:center; }
  .cpprev-box .cpv-photobtn { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); }   
  .cpv-empty[hidden] { display:none; }
  @container (max-height:97px) {   
    .cpv-empty:has(> .cpv-url:not([hidden])) { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:var(--sp-1); }
    .cpv-empty:has(> .cpv-url:not([hidden])) .cpv-stage { width:auto; aspect-ratio:auto; }
    .cpv-empty:has(> .cpv-url:not([hidden])) .cpv-photobtn { position:static; transform:none; }
    .cpv-empty > .cpv-url { position:static; }
  }
  @container (max-height:57px) { .cpv-empty > .cpv-url { display:none; } }   
  nd-html.nm-menuopen .cpv-empty { opacity:0; }   
  .cpv-photobtn { display:grid; place-items:center; width:var(--btn); height:var(--btn); padding:0; background:none; border:0; cursor:pointer; color:var(--accent); -webkit-tap-highlight-color:transparent; }   
  .cpv-linkbtn { display:none; }   
  .cpv-photobtn svg { width:26px; height:26px; display:block; transition:transform var(--dur-fast) cubic-bezier(.2,.9,.3,1.25); }   
  .cpv-photobtn:active svg { transform:scale(var(--press-xs,.8)); }
  .cpprev-box .cpv-tool { position:absolute; top:6px; width:30px; height:30px; display:grid; place-items:center; padding:0; color:var(--accent); background:var(--bg); border:0; border-radius:var(--r-s); cursor:pointer; z-index:2; filter:drop-shadow(0 1px 3px rgba(0,0,0,.6)); -webkit-tap-highlight-color:transparent; transition:transform var(--dur-fast); }   
  .cpprev-box .cpv-tool[hidden] { display:none; }   
  .cpprev-box .cpv-tool:active { transform:scale(var(--press-xs,.82)); }
  .cpprev-box .cpv-tool svg { width:15px; height:15px; display:block; }
  .topdock.dockzoom .pvsec { --pvw:min(100%, 58cqh, 620px); }   
  .pvsec .trailwrap { position:absolute; top:0; left:calc(50% + var(--pvw, 52%) / 2) ; margin-left:8px ; z-index:2 ; display:flex; flex-direction:column; align-items:stretch; width:var(--trailw, 70px ); gap:8px; }
  .topdock.dockzoom .pvsec .trailwrap { margin-left:0; transform:translateX(-100%); }   
  .pvsec .trail-v, .pvsec .trail-v .gospec { align-items:center; }   
  .pvsec #cpZoomRail { align-self:stretch; align-items:center; }   
  #cpZoom.on .cpz-v { display:none; }   
  .cpprev-box .trail, .pvsec .trail { display:flex; flex-direction:column; flex-wrap:nowrap; gap:var(--sp-1); padding:5px 2px; border-radius:var(--r-s);
    border:1px solid rgba(255,255,255,.14); background:rgba(8,15,11,.54) ;
    backdrop-filter:blur(var(--blur-s)); -webkit-backdrop-filter:blur(var(--blur-s)); }
  .cpprev-box .trail-g, .pvsec .trail-g { display:flex; flex-direction:column; flex-wrap:nowrap; gap:2px ; flex:none; align-self:stretch; }
  .cpprev-box .trail-div, .pvsec .trail-div { width:14px; height:1px; margin:1px 0; flex:none; background:rgba(255,255,255,.16); }
  .pvsec .trail-g:not(:has(button:not([hidden]))) { display:none; }
  .pvsec .trail-g:not(:has(button:not([hidden]))) + .trail-div { display:none; }
  .pvsec .trail-div { align-self:center; }   
  .pvsec .trail:not(:has(button:not([hidden]))):not(:has(.trail-v:not(.none))) { display:none; }
  .cpprev-box .trail-v, .pvsec .trail-v { display:flex; flex-direction:column; gap:var(--sp-1); align-self:stretch; margin:0; padding:0; background:transparent; border:1px solid transparent ; border-radius:0; font-size:10.5px ; line-height:1; text-align:center; }
  .cpprev-box .trail-v.none, .pvsec .trail-v.none { display:none; }
  .cpprev-box .trail-v .gs-lbl, .cpprev-box .trail-v .gs-dot, .pvsec .trail-v .gs-lbl, .pvsec .trail-v .gs-dot { display:none; }      
  .pvsec .trail-v .gs-sep { display:block; width:14px; height:1px; margin:1px auto ; flex:none; background:rgba(255,255,255,.16); font-size:0; line-height:0; color:transparent; }   
  .pvsec .trail-v .gospec { display:flex; flex-direction:column; gap:var(--sp-1); margin:0; padding:0; font-size:10.5px; line-height:1; text-align:center; white-space:nowrap; overflow:visible; }
  .cpprev-box .trail-v .gs-v, .pvsec .trail-v .gs-v { position:relative ; display:grid; place-items:center; min-width:22px; height:22px; padding:0 5px; border:0; background:none; border-radius:var(--r-l); color:var(--mut); font-size:10.5px; font-weight:var(--fw-x); font-family:inherit; letter-spacing:-.2px; line-height:1; white-space:nowrap; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:color var(--dur) ease; }
  .cpprev-box .trail-v .gs-v, .pvsec .trail-v .gs-v, .cpprev-box .trail-v .ropt, .pvsec .trail-v .ropt { place-items:center; text-align:center; }   
  .pvsec .trail-v .gs-v.on { color:var(--accent); font-weight:var(--fw-x); }
  .pvsec .trail-v .gs-v.lrtilt, .gospec .gs-v.lrtilt { color:var(--accent-4); font-weight:var(--fw-x); }
  .pvsec .trail-i { position:relative; display:grid; place-items:center; width:22px; height:22px; padding:0; border:0; background:none; border-radius:50%; color:var(--mut); font-size:10.5px ; font-weight:var(--fw-x); font-family:inherit; cursor:pointer; -webkit-tap-highlight-color:transparent; }
  .pvsec .trail-i::after { content:''; position:absolute; inset:-6px -4px; }
  .pvsec .trail-i:active { transform:scale(var(--press-m)); }
  .pvsec .trail svg { width:12px; height:12px; display:block; }   
  .pvsec #cpRail:not(:has(.trail-g > button:not([hidden]))):not(:has(.trail-v:not(.none))) { display:none; }   
  .pvsec .trail-v .gs-v:active { transform:scale(var(--press-m)); }
  .cpprev-box .cpv-tool { position:static; width:100%; height:22px; background:none; border-radius:0; filter:none; }   
  .pvsec .trail .cpv-tool svg { width:12px; height:12px; }   
  .pvsec .trail .cpv-tool { position:static; width:100%; height:22px; display:grid; place-items:center; padding:0; color:var(--accent); border:0 ; background:none; border-radius:0; filter:none; }   
  .pvsec .trail .cpv-tool:disabled { opacity:.5; cursor:default; }   
  .pvsec .trail .cpv-tool:disabled:active { transform:none; }
  .pvsec .trail #pvSwap, .pvsec .trail #pvDel { right:auto; }   
  #pvSwap { right:42px; } #pvDel { right:6px; }   
  .preblk { margin-left:auto; display:inline-flex; align-items:center; }
  .prelbl { color:var(--mut); font-size:9.5px; letter-spacing:.09em; font-weight:var(--fw-b,700); }
  .preval { display:inline-block; width:76px; text-align:left; margin-left:10px; background:none; border:0; padding:3px 0; font-family:inherit; font-size:12px; font-weight:800; line-height:1;    color:var(--accent); cursor:pointer; -webkit-tap-highlight-color:transparent; }   
  .preval:active { transform:scale(var(--press-m,.9)); }
  nd-html:not(.bestcut) #ftGo, nd-html:not(.bestcut) #ftqsec, nd-html.bestcut #editGo, nd-html.bestcut #stack, nd-html.bestcut #xtrsec, nd-html.bestcut .pvsec #optStrip, nd-html.bestcut .pvsec .trail-div { display:none; }
  nd-html.bestcut .pvsec #cpRail { flex-grow:1; }
  nd-html.bestcut #nmrResH { margin-top:0; border-top-color:transparent; }
  nd-html.bestcut .out-col > .out { margin-top:0; }   
  nd-html.bestcut .pvsec #cpRail .trail-g { gap:var(--sp-2); }
  nd-html.bestcut .pvsec #pvDel { position:relative; }
  nd-html.bestcut .pvsec #pvDel::after { content:""; position:absolute; left:50%; top:calc(var(--sp-2) / -2); width:14px; height:1px; translate:-50% -50%; background:rgba(255,255,255,.16) ; pointer-events:none; }
  .ftres { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:8px; margin-top:var(--sp-2); }   
  .ftres:empty { display:none; }   
  .ftit { position:relative; min-width:0; }
  .ftit img { width:100%; height:auto; border-radius:var(--r-m); border:1px solid var(--line); display:block; }
  .ftit .ftk { position:absolute; left:6px; top:6px; padding:2px 6px; border-radius:var(--r-s); background:var(--bg); color:var(--fg); font-size:var(--fs-xs); font-weight:var(--fw-x); font-variant-numeric:tabular-nums; pointer-events:none; }   
  .ftit .ftdl.dlbtn { position:absolute; right:6px; bottom:6px; width:30px; height:30px; display:grid; place-items:center; border-radius:var(--r-s); }   
  .ftit .ftdl.dlbtn svg { width:16px; height:16px; }
  .pvattr { display:none; margin-top:5px ; font-size:var(--fs-xs,11px); color:var(--mut); font-weight:600; }   
  .pvattr b { color:var(--accent); font-weight:var(--fw-b,700); }
  #pvPre { display:none; }   
  .pvsec .fl { margin:2px 0 6px -12px; display:inline-flex; align-items:center; padding:7px 12px; border-radius:var(--r-pill); border:1px solid transparent; background:transparent; transition:background .22s var(--ease), border-color .22s var(--ease), box-shadow .22s var(--ease); }   
  .pvstage { background:var(--bg); }   
  .vstage video { width:100%; display:block; max-height:min(62cqh, max(calc(100cqh - var(--dock-clear, 0px) - var(--sp-3) - var(--sp-2)), 120px)); background:#000; }   
  .vstage .nm-alpha > canvas { max-height:min(62cqh, max(calc(100cqh - var(--dock-clear, 0px) - var(--sp-3) - var(--sp-2)), 120px)); }      
  :is(#vwrap, #lyBurn, #cutlist, #lyTabs, #out) { scroll-margin-top:calc(var(--dock-clear, 0px) + var(--sp-2)); }
  @container nd (min-width:900px){ nd-html.inmodal .out-col #out { scroll-margin-top:0; }
}
  .vstage.alpha { background:repeating-conic-gradient(var(--line) 0% 25%, var(--pan) 0% 50%) 0 0/22px 22px; }   
  .vstage.alpha video { background:transparent; }   
  .vstage[hidden] { display:none; }
  .vstage .wscrim { position:absolute; inset:0; background:rgba(8,15,11,.26); -webkit-backdrop-filter:blur(5px); backdrop-filter:blur(5px); }   
  .scanline { position:absolute; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--accent),transparent); box-shadow:0 0 14px var(--accent); animation:scan 1.4s var(--gauge-ease) infinite; }
  @keyframes scan { 0%{ top:6%;} 50%{ top:94%;} 100%{ top:6%;} }
  @media (prefers-reduced-motion:reduce){ .scanline { animation:none; top:50%; } }
  .vstage .wmsg { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); z-index:2; font-size:var(--fs-body); font-weight:var(--fw-x); color:var(--accent); white-space:nowrap; text-shadow:0 1px 10px rgba(0,0,0,.5); }   
  .vstage .wmsg .wsec { color:var(--mut); font-weight:var(--fw-b); font-variant-numeric:tabular-nums; }   
  .vstage .wcorner { position:absolute; top:8px; left:10px; z-index:2; font-size:var(--fs-xs); font-weight:400; font-variant-numeric:tabular-nums; color:var(--fg); text-shadow:0 1px 10px rgba(0,0,0,.5); }   
  .vstage .wcorner .wc-hi { color:var(--accent); }   
  .status { margin-top:var(--sp-2); font-size:13px; color:var(--mut); white-space:pre-wrap; text-align:center; }
  .status.err { color:var(--danger); }
  .status-sub { margin-top:var(--sp-1); font-size:var(--fs-xs); color:var(--mut); text-align:left; opacity:.55; font-variant-numeric:tabular-nums; }
  .status-sub[hidden] { display:none; }
  .cutlist { display:flex; flex-direction:column; gap:var(--sp-2); margin-top:var(--sp-2); }
  .cutlist[hidden] { display:none; }
  .cutrow { text-align:left; border:1px solid var(--line); border-radius:var(--r-l); background:rgba(255,255,255,.03); color:var(--fg); font:inherit; padding:11px 13px; cursor:pointer; display:flex; flex-direction:column; gap:3px; transition:transform var(--dur-fast), border-color var(--dur), background var(--dur); }
  .cutrow:active { transform:scale(var(--press-l)); }
  .cutrow.on { border-color:rgba(var(--accent-rgb),.55); background:rgba(var(--accent-rgb),.08); }
  .cutrow .ct { color:var(--accent); font-size:var(--fs-xs); font-weight:var(--fw-x); font-variant-numeric:tabular-nums; }
  .cutrow b { font-size:var(--fs-label); font-weight:var(--fw-x); }
  .cutrow .cw { color:var(--mut); font-size:var(--fs-xs); }
  .status svg { vertical-align:-2px; }
  .sronly { position:absolute; width:1px; height:1px; margin:-1px; padding:0; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; border:0; }
  .footer { display:flex; align-items:center; gap:12px; margin-top:12px; }
  .ghost { background:rgba(255,255,255,.04); border:1px solid var(--line); color:var(--fg); font-weight:var(--fw-b); font-size:13px; font-family:inherit; padding:9px 15px; border-radius:var(--r-s); cursor:pointer; display:inline-flex; align-items:center; gap:7px; transition:transform var(--dur-fast); }
  .ghost:active { transform:scale(var(--press-l)); } .ghost svg { width:14px; height:14px; }
  .ghost.dlbtn { margin-left:auto; width:38px; height:38px; padding:0; justify-content:center; }
  #dlVid[hidden], .sheet[hidden], .sheetdim[hidden] { display:none; }
  .cta { background:var(--accent); color:var(--on-accent); font-weight:var(--fw-x); font-size:14px; font-family:inherit; border:none; border-radius:var(--r-pill); padding:11px 22px; cursor:pointer; transition:transform var(--dur-fast); }
  .cta:active { transform:scale(var(--press-l)); }
  .scrub { position:fixed; inset:0; z-index:var(--z-float); background:rgba(8,9,10,.88); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; padding:18px; }
  .scrub[hidden] { display:none; }
  .scrub-stage { position:relative; max-width:100%; border-radius:var(--r-l); overflow:hidden; border:1px solid var(--line); touch-action:pan-y; }   
  .scrub-stage video { display:block; max-width:100%; max-height:56cqh; }   
  .cropfr { position:absolute; top:0; left:0; border:2px solid var(--accent); box-shadow:0 0 0 200cqmax rgba(0,0,0,.55); cursor:grab; touch-action:none; }   
  .cropfr:active { cursor:grabbing; }
  .scrub-bar { width:100%; max-width:520px; display:flex; align-items:center; gap:10px; }
  .scrub-bar input[type=range] { flex:1; min-width:60px; accent-color:var(--accent); }
  .scrub-t { flex:none; font:11px ui-monospace,SFMono-Regular,Menlo,monospace; min-width:44px; text-align:right; color:var(--fg); }
  .scrub-acts { display:flex; gap:10px; }
  .out { margin-top:18px; }
  .out h1.t { font-size:20px; color:var(--fg); margin:18px 0 6px; }
  .out h2 { font-size:16px; color:var(--accent); margin:18px 0 6px; }
  .out h3 { font-size:14px; color:var(--fg); margin:16px 0 6px; }
  .out p { margin:5px 0; color:var(--mut); word-break:break-word; }
  .out table { width:100%; border-collapse:collapse; margin:8px 0; font-size:13px; }
  .out td, .out th { border:1px solid var(--line); padding:6px 8px; text-align:left; color:var(--mut); }
  .code { position:relative; background:var(--well); border:1px solid var(--line); border-radius:10px; margin:8px 0 12px; }
  .code pre { margin:0; padding:13px ; white-space:pre-wrap; word-break:break-word; font:14px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace; color:var(--fg); }  .code button svg { display:block; }
  .code button::before { content:""; position:absolute; inset:-7px; }   
  @media (hover:hover){ .code button:hover { background:rgba(255,255,255,.16); } }   
  .code button:active { transform:scale(var(--press-s,.85)); }  
  .lyfind[hidden], .lypv-row[hidden], .lypv-cap[hidden] { display:none; }   
  .lyseg-a, .lyseg-t, .lybtn, .lyrate, .lyfbtn, .lytab, .lyreset { touch-action:manipulation; }   
  .lytabs { display:none; grid-template-columns:1fr 1fr; gap:6px; padding:0 2px; border-bottom:1px solid var(--line); margin:16px 0 12px; }
  .lytabs.show { display:grid; }
  .lytab { padding:9px 4px; text-align:center; color:var(--mut); cursor:pointer; font-weight:600; font-size:13px; background:none; border:none; border-radius:0; font-family:inherit; transition:color var(--dur), transform var(--dur-fast); -webkit-tap-highlight-color:transparent; }   
  .lytab:active { transform:scale(var(--press-l,.95)); }
  @media (hover:hover){ .lytab:hover { color:var(--fg); } }   
  .lytab.on { color:var(--accent); font-weight:800; text-shadow:0 0 11px rgba(var(--accent-rgb),.55); }
  .lytab-n { display:inline-flex; align-items:center; justify-content:center; min-width:16px; height:16px; padding:0 4px; box-sizing:border-box; margin-left:6px; vertical-align:1px; background:var(--accent); color:var(--on-accent); font-size:10px; font-weight:800; line-height:1; border-radius:9px; box-shadow:0 0 8px rgba(var(--accent-rgb),.5); }   
  .lytab-n[hidden] { display:none; }   
  .lypv { margin:14px 0 0; }
  .lypv video { display:block; width:100%; max-height:min(320px, 40cqh); background:var(--bg); border:1px solid var(--line); border-radius:var(--r-m); }   
  .lypv-cap { min-height:34px; display:flex; align-items:center; justify-content:center; text-align:center; padding:7px 10px; margin-top:6px; background:var(--pan); border:1px solid var(--line); border-radius:var(--r-m); color:var(--fg); font-weight:700; font-size:18px; line-height:1.45; white-space:pre-wrap; word-break:keep-all; }
  .lypv-row { display:flex; align-items:center; gap:10px; margin-top:8px; color:var(--mut); font-size:var(--fs-sm); }
  .lypv-row .dl-full { flex:none; height:24px; }
  .lypv-row .lbl { user-select:none; -webkit-user-select:none; }
  .lyrate { flex:none; min-width:36px; height:24px; padding:0 8px; border-radius:var(--r-pill); border:1px solid var(--line); background:rgba(255,255,255,.05); color:var(--mut); font:700 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:transform var(--dur-fast), color var(--dur); }
  .lyrate:active { transform:scale(var(--press-m,.9)); color:var(--accent); }
  .lypv-row input[type=range] { flex:1; min-width:0; accent-color:var(--accent); }
  .lypv-fs { flex:none; font:11px ui-monospace,SFMono-Regular,Menlo,monospace; min-width:36px; text-align:right; }
  .lyburn { margin:16px 0 0; }
  .lyburn[hidden] { display:none; }
  .lyburn .nm-alpha { border-radius:var(--r-m); overflow:hidden; }   
  .lyburn video, .lyburn .nm-alpha > canvas { display:block; width:100%; max-height:min(320px, 40cqh); background:var(--bg); border:1px solid var(--line); border-radius:var(--r-m); }   
  .lyburn video[hidden] { display:none; }
  .lyburn-row { display:flex; align-items:center; gap:10px; margin-top:8px; }
  .lyburn-stage { position:relative; }
  .lyburn-stage .imgdl { position:absolute; top:10px; right:10px; width:34px; height:34px; display:grid; place-items:center; border:0; border-radius:10px; z-index:2; transition:transform var(--dur-fast), background var(--dur), color var(--dur); }   
  .lyburn-stage .imgdl:active { transform:scale(var(--press-xs,.82)); }
  .lyburn-stage .imgdl[hidden] { display:none; }
  .lyburn-stage .imgdl svg { display:block; width:14px; height:14px; }
  .spellchips { display:flex; flex-wrap:wrap; gap:var(--sp-1); margin-top:var(--sp-2); }
  .spellchips[hidden] { display:none; }
  .spchip { font:inherit; font-size:var(--fs-sm); padding:var(--sp-1) var(--sp-2); border-radius:var(--r-s); cursor:pointer; user-select:none;   
    border:1px solid var(--line); background:rgba(255,255,255,.04); color:var(--mut); transition:var(--dur); display:inline-flex; align-items:center; gap:var(--sp-1); }
  .spchip::before { content:''; width:7px ; height:7px ; border-radius:50%; background:var(--mut); transition:var(--dur); flex:none; }
  .spchip.on { border-color:rgba(var(--warn-rgb),.55); background:rgba(var(--warn-rgb),.12); color:var(--warn); font-weight:var(--fw-b); }
  .spchip.on::before { background:var(--warn); box-shadow:0 0 7px rgba(var(--warn-rgb),.8); }
  .spchip.skip { cursor:default; opacity:.55; }   
  .srcrow, .lyburn-row, #lyJobList { margin-left:var(--sp-2); }
  #lyBurn .lyburn-stage > video, #lyBurn .nm-alpha { width:calc(100% - var(--sp-2)); margin-left:var(--sp-2); }   
  .lyburn-stage.alpha video, .lyburn-stage.alpha .nm-alpha > canvas { background:repeating-conic-gradient(var(--line) 0% 25%, var(--pan) 0% 50%) 0 0/22px 22px; }   
  .lyburn-note { color:var(--mut); font-size:var(--fs-sm); min-width:0; }
  .lytool { display:flex; align-items:center; gap:7px; margin:0 0 10px; }
  .lytool .dl-full { height:28px; color:var(--mut); font-size:var(--fs-sm); }
  .lysp { flex:1; }
  .lybtn { flex:none; width:var(--btn-sm); height:var(--btn-sm); display:grid; place-items:center; padding:0; border-radius:var(--r-s); border:1px solid var(--line); background:rgba(255,255,255,.05); color:var(--fg); cursor:pointer; -webkit-tap-highlight-color:transparent; transition:transform var(--dur-fast), background var(--dur), color var(--dur), border-color var(--dur); position:relative; }
  .lybtn svg { display:block; width:15px; height:15px; }
  .lybtn[hidden], .dl-full[hidden] { display:none; }   
  .lybtn:active { transform:scale(var(--press-s,.85)); }
  .lybtn[aria-pressed="true"] { color:var(--accent); border-color:rgba(var(--accent-rgb),.4); background:rgba(var(--accent-rgb),.08); }
  .lystats { color:var(--mut); font-size:var(--fs-sm); margin:0 0 10px; line-height:1.7; }
  .lystats b { color:var(--accent); font-weight:800; }
  .lyfind { display:flex; gap:7px; align-items:center; margin:0 0 10px; }
  .lyfind input { flex:1; min-width:0; padding:9px 11px; font-size:13px; }
  .lyfbtn { flex:none; height:36px; padding:0 13px; border-radius:var(--r-pill); border:1px solid var(--line); background:rgba(255,255,255,.05); color:var(--accent); font-family:inherit; font-size:12px; font-weight:700; cursor:pointer; -webkit-tap-highlight-color:transparent; white-space:nowrap; transition:transform var(--dur-fast), background var(--dur); }
  .lyfbtn:active { transform:scale(var(--press-l,.95)); background:rgba(var(--accent-rgb),.08); }
  .lyfn { flex:none; color:var(--mut); font-size:var(--fs-xs); min-width:26px; text-align:right; }
  .lyseg { background:var(--pan); border:1px solid var(--line); border-radius:var(--r-m); padding:9px 10px 10px; margin-bottom:8px; transition:border-color var(--dur), opacity var(--dur); }
  .lyseg.cur { border-color:rgba(var(--accent-rgb),.5); background:rgba(var(--accent-rgb),.06); }   
  .lyseg.sel { box-shadow:inset 3px 0 0 rgba(var(--accent-rgb),.55); }   
  .lyseg.land { animation:lyland .7s ease; }   
  @keyframes lyland { 0% { border-color:rgba(var(--accent-rgb),.75); box-shadow:0 0 0 5px rgba(var(--accent-rgb),.14); } 100% { border-color:var(--line); box-shadow:0 0 0 0 rgba(var(--accent-rgb),0); } }
  .lyseg.del { opacity:.38; }
  .lyseg.del .lyseg-chips { pointer-events:none; }
  .lyseg.del .lyseg-t { text-decoration:line-through; }
  .lyseg-h { display:flex; align-items:center; gap:8px; margin-bottom:7px; }
  .lyseg-h .dl-full { height:22px; }
  .lyseg-h .dl-cbox { margin-right:0; }
  .lyseg-n { flex:none; min-width:18px; font-size:12px; font-weight:800; color:var(--mut); }
  .lyseg-t { flex:none; font:11.5px ui-monospace,SFMono-Regular,Menlo,monospace; color:var(--mut); cursor:pointer; padding:3px 8px; margin:-3px 0; border-radius:var(--r-pill); background:rgba(255,255,255,.05); border:1px solid var(--line); -webkit-tap-highlight-color:transparent; }   
  .lyseg-t b { color:var(--fg); font-weight:600; }
  .lyseg-t:active { color:var(--accent); }
  .lyseg-t.plain, .lyseg-t:disabled { background:none; border-color:transparent; cursor:default; }   
  .lyseg-t.plain:active { color:var(--mut); }
  .lyseg-t.adj-on { color:var(--accent); border-color:rgba(var(--accent-rgb),.5); }   
  .lyseg-adj { display:flex; align-items:center; justify-content:center; gap:7px; margin:2px 0 9px; }
  .lyseg-adj button { flex:none; position:relative; min-width:44px; height:26px; padding:0 10px; background:rgba(255,255,255,.06); border:1px solid var(--line); border-radius:var(--r-pill); color:var(--fg); font-family:inherit; font-size:12px; font-weight:700; line-height:1; cursor:pointer; -webkit-tap-highlight-color:transparent; }   
  .lyseg-adj button::before { content:""; position:absolute; inset:-6px; }   
  .lyseg-adj button:active { transform:scale(var(--press-s,.85)); color:var(--accent); }
  .lyseg-adj .adj-v { flex:none; min-width:76px; text-align:center; font:700 13px ui-monospace,SFMono-Regular,Menlo,monospace; font-variant-numeric:tabular-nums; color:var(--accent); }
  @media (prefers-reduced-motion:reduce){ .lyseg-adj button { transition:none; } }
  .lyseg-d { font-size:var(--fs-xs); }   
  .lyseg-a { flex:none; width:var(--btn-xs); height:var(--btn-xs); display:grid; place-items:center; padding:0; background:transparent; border:none; border-radius:var(--r-s); color:var(--mut); cursor:pointer; position:relative; -webkit-tap-highlight-color:transparent; transition:color var(--dur), transform var(--dur-fast); }
  .lyjob { display:block; width:100%; padding:0; background:none; border:none; color:var(--fg); font-family:inherit; font-size:var(--fs-label); cursor:pointer; text-align:left; -webkit-tap-highlight-color:transparent; touch-action:manipulation; transition:transform var(--dur-fast); }   
  .lyjob:active { transform:scale(var(--press-l)); }   
  .ljth { position:relative; }
  .ljth .ljv, .ljth .ljph { width:100%; aspect-ratio:16/9; object-fit:cover; border:1px solid var(--line); border-radius:var(--r-s); display:block; background:var(--pan); }   
  .ljth .ljph { display:grid; place-items:center; color:var(--mut); font-size:var(--fs-xs); font-weight:var(--fw-b); }   
  .ljth .hist-cap { max-width:calc(100% - 52px); }   
  .ljth .ljtr, .ljth .ljbr { max-width:calc(50% - 8px); }   
  .ljth .ljtr { left:auto; right:6px; color:var(--mut); }   
  .ljth .ljtr.done { color:var(--fg); }   
  .ljth .ljtr.fail { color:var(--danger); }
  .ljth .ljbl { top:auto; bottom:6px; font-weight:600; }   
  .ljth .ljbr { top:auto; bottom:6px; left:auto; right:6px; font-variant-numeric:tabular-nums; }   
  @container nd (max-width:480px){ #lyJobList { grid-template-columns:repeat(3,1fr); }
}   
  .edfocus { animation:edfocus 2.2s ease both; border-radius:var(--r-m); }   
  @keyframes edfocus { 0%,100%{ box-shadow:0 0 0 0 rgba(var(--accent-rgb),0); } 18%,46%{ box-shadow:0 0 0 3px rgba(var(--accent-rgb),.55); } }
  @media (prefers-reduced-motion:reduce){ .edfocus { animation:none; } }
  #lyJobList:not([hidden]) > .lyjob { animation:histIn .32s var(--gauge-ease) both; }   
  #lyJobList:not([hidden]) > .lyjob:nth-child(2){ animation-delay:.04s } #lyJobList:not([hidden]) > .lyjob:nth-child(3){ animation-delay:.08s }
  #lyJobList:not([hidden]) > .lyjob:nth-child(4){ animation-delay:.12s } #lyJobList:not([hidden]) > .lyjob:nth-child(5){ animation-delay:.16s }
  #lyJobList:not([hidden]) > .lyjob:nth-child(n+6){ animation-delay:.2s }
  #lyJobList.closing { animation:histOut .26s cubic-bezier(.4,0,.7,.3) both; }
  @keyframes histIn { from { opacity:0; transform:translateY(10px) scale(.985); } to { opacity:1; transform:none; } }
  @keyframes histOut { from { opacity:1; transform:none; } to { opacity:0; transform:translateY(8px) scale(.99); } }
  @media (prefers-reduced-motion:reduce){ #lyJobList:not([hidden]) > .lyjob, #lyJobList.closing { animation:none; } }
  .lyseg-a::before { content:""; position:absolute; inset:-4px; }   
  .lyseg-h .dl-full::before { content:""; position:absolute; inset:-6px; }   
  .lyseg-a svg { display:block; width:13px; height:13px; }
  .lyseg-a:active { transform:scale(var(--press-s,.85)); color:var(--accent); }
  .lyseg-chips { display:flex; flex-wrap:wrap; gap:7px; }   
  .ed-chip { flex:none; max-width:100%; font-size:16px; line-height:1.4; padding:2px 8px; border-radius:7px; background:rgba(255,255,255,.05); border:1px solid var(--line); color:var(--fg); cursor:pointer; overflow-wrap:anywhere; -webkit-user-select:none; user-select:none; touch-action:manipulation; transition:background var(--dur), border-color var(--dur), color var(--dur), opacity var(--dur); }
  @media (hover:hover){ .ed-chip:hover { border-color:rgba(var(--accent-rgb),.4); } }
  .ed-chip.off { opacity:.42; text-decoration:line-through; border-style:dashed; }
  .ed-chip.hit { border-color:rgba(var(--accent-rgb),.6); background:rgba(var(--accent-rgb),.08); }
  .ed-chip.editing { outline:2px solid var(--accent); outline-offset:1px; background:rgba(var(--accent-rgb),.08); cursor:text; -webkit-user-select:text; user-select:text; white-space:normal; word-break:break-word; text-decoration:none; opacity:1; }
  .lyreset { display:block; margin:6px auto 0; padding:8px 14px; background:none; border:none; color:var(--mut); font-family:inherit; font-size:12px; font-weight:600; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:color var(--dur), transform var(--dur-fast); }
  .lyreset:active { color:var(--danger); transform:scale(var(--press-l,.95)); }
  .lyreset.arm { color:var(--danger); }   
  .dl-full { position:relative; display:inline-flex; align-items:center; cursor:pointer; touch-action:manipulation; -webkit-tap-highlight-color:transparent; }
  .dl-full input { position:absolute; left:0; top:50%; transform:translateY(-50%); width:16px; height:16px; margin:0; opacity:0; cursor:pointer; }
  .dl-cbox { width:12px; height:12px; flex:none; border-radius:4px; margin-right:6px; position:relative; top:-1px; border:1.5px solid rgba(255,255,255,.28); background:rgba(255,255,255,.04); display:inline-flex; align-items:center; justify-content:center; transition:background var(--dur), border-color var(--dur), box-shadow var(--dur); }   
  .dl-cbox svg { position:absolute; width:8px; height:8px; display:block; transition:opacity var(--dur), stroke-dashoffset .42s .08s cubic-bezier(.6,0,.2,1); }
  .dl-cbox path { fill:none; stroke-width:2.6; stroke-linecap:round; stroke-linejoin:round; }
  .dl-cbox .dl-dash { stroke:var(--mut); opacity:1; }
  .dl-cbox .dl-chk { stroke:var(--accent); opacity:0; stroke-dasharray:24; stroke-dashoffset:24; }
  .dl-full input:checked + .dl-cbox { background:rgba(var(--accent-rgb),.16); border-color:rgba(var(--accent-rgb),.5); }
  .dl-full input:checked + .dl-cbox .dl-dash { opacity:0; }
  .dl-full input:checked + .dl-cbox .dl-chk { opacity:1; stroke-dashoffset:0; }
  .dl-full input:focus-visible + .dl-cbox { box-shadow:0 0 0 2px rgba(var(--accent-rgb),.45); }
  @keyframes ic-spin { to { transform:rotate(360deg); } }
  @keyframes ic-bounce { 0% { transform:translateY(0); } 45% { transform:translateY(2.5px); } 100% { transform:translateY(0); } }
  @keyframes ic-check { 0% { transform:scale(1); } 40% { transform:scale(1.25); } 100% { transform:scale(1); } }
  .ic-spin { animation:ic-spin .5s var(--ease); }
  .ic-bounce { animation:ic-bounce .42s ease; }
  .ic-check { animation:ic-check .4s var(--ease); }
  .lyundo { display:inline-block; margin-left:8px; padding:3px 10px; border-radius:var(--r-pill); border:1px solid rgba(var(--accent-rgb),.4); background:rgba(var(--accent-rgb),.08); color:var(--accent); font-family:inherit; font-size:11px; font-weight:700; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:transform var(--dur-fast), background var(--dur); }
  .lyundo:active { transform:scale(var(--press-l,.95)); background:rgba(var(--accent-rgb),.15); }
  @media (prefers-reduced-motion:reduce){ .dlbtn .dl-ack > svg, .dlbtn .dl-ack .dl-ring { animation:none; } .dlbtn .dl-ack { opacity:0; } .dlbtn:has(.dl-ack) > svg { opacity:1; } .ic-spin,.ic-bounce,.ic-check { animation:none; } .lyseg.land { animation:none; } .gdots i { animation:none; opacity:1; } .lyseg,.ed-chip,.lytab,.lybtn,.lyrate,.lyfbtn,.lyreset,.lyseg-a,.dl-cbox,.dl-cbox svg,.lyundo,.lyseg-t { transition:none; } }   
  .go.dim { opacity:.55; }   
  :where(.topdock) .go { border-color:rgba(255,255,255,.2); }   
  nd-html.inmodal .wrap { max-width:none; }   
  @container nd (min-width:900px){
    nd-html.inmodal .wrap { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); column-gap:var(--sp-3); align-items:start; }
    nd-html.inmodal .wrap > * { grid-column:1; }
    nd-html.inmodal .wrap > .out-col { grid-column:2; grid-row:1 / span 99; align-self:start;
      position:sticky; top:var(--sp-3); max-height:calc(100cqh - var(--sp-3)); overflow-y:auto; overscroll-behavior:contain; }   
    nd-html.inmodal .topdock { margin-right:0; }
}`,
    `nd-html{scrollbar-width:thin}nd-html::-webkit-scrollbar,nd-body::-webkit-scrollbar{width:10px;height:10px;display:block}`,
    SHEETS["nm-scene-tokens.css"],
    SHEETS["nm-scene.css"]],
  scheme: "dark",
  htmlAttrs: {"lang":"ko"},
  bodyAttrs: {},
  html: `<div class="wrap">
  <div class="topdock" id="topDock">
  <div class="pvsec" id="pvsec" hidden><label class="fl" hidden>PREVIEW<span class="preblk"><span class="prelbl">PRESET</span><button type="button" class="preval" id="pvPreV" title="탭=종합→릴스 완성→포맷만→화질만 순환 · 수동 조정 = 종합 복귀">종합</button></span></label><div class="cpprev-box"><div class="pvslot" id="pvSlot"></div><div class="cpv-empty" id="pvEmpty"><div class="cpv-stage"><button type="button" class="cpv-photobtn" id="pvPick" aria-label="영상 첨부 — 탭=파일 선택 · URL은 붙여넣기" title="영상 첨부 — 탭=파일 선택 · URL은 붙여넣기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="8.5" cy="9.5" r="1.5"></circle><path d="M21 16l-5-5L5 20"></path></svg></button><button type="button" class="cpv-linkbtn" id="pvLink" aria-label="영상 주소 붙여넣기" title="영상 주소 붙여넣기 — 복사한 링크가 들어가"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button></div><div class="cpv-url" id="pvUrl" hidden></div></div></div><div class="trailwrap" id="cpRailWrap"><nav class="trail" id="cpZoomRail" aria-label="미리보기 확대"><button type="button" class="trail-i" id="cpZoom" aria-pressed="false" aria-label="미리보기 확대" title="탭=미리보기 확대 · 다시 탭=원상복귀"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/><path d="M8 11h6"/><path class="cpz-v" d="M11 8v6"/></svg></button></nav><nav class="trail trail-opts" id="cpRail" aria-label="미리보기 옵션"><span class="trail-g"><button type="button" class="cpv-tool" id="pvSwap" aria-label="영상 첨부·교체 — 탭=파일 선택" title="영상 첨부·교체"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></button><button type="button" class="cpv-tool" id="pvDel" disabled aria-label="영상 삭제" title="영상 삭제"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button></span><span class="trail-div"></span><div class="optstrip trail-v" id="optStrip"><div class="gospec" id="editSpec"></div></div></nav><div class="firebar trail-fire"><div class="inner"><button class="go" id="editGo" type="button">생성</button><button class="go" id="ftGo" type="button" data-label="생성" title="베스트컷 — 찾을 장면을 쓰면 대사가 가까운 구간부터 최대 12장을 바둑판으로 · 비우면 화질·미감·얼굴·4:5 구도로 가장 좋은 컷 2장을 업스케일 + 4:5 확장 (완료 시 미리보기 아래)">생성</button></div></div></div><div class="pvattr" id="pvAttr"></div></div><div class="ftres" id="ftRes"></div>
  </div>
  <div class="srcwrap" hidden><label class="fl">내용</label>
    <div class="srcrow">
      <label class="file" id="fileLab" aria-label="영상 파일 선택" title="영상 파일 선택"><span id="fileTxt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-5"/><path d="m9.5 15 2.5-2.5 2.5 2.5"/></svg></span>
        <input type="file" accept="video/*" id="file" style="display:none">
      </label>
      <div class="urlwrap">
        <input type="url" id="url" placeholder="https://… 또는 파일(≤2GB)" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go">
        <button class="urlclip" id="urlClip" type="button" aria-label="붙여넣기" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg></button>
      </div>
    </div>
  </div>
  <div class="pvstage" id="pv" hidden><div class="pvbox" id="pvBox"><div class="pvbg" id="pvBg" hidden></div><video id="pvVid" playsinline muted loop preload="metadata" aria-label="첨부 영상 미리보기"></video><div class="pvsub" id="pvSub" hidden><span id="pvSubTx">자막 위치 <b class="kw">미리보기</b></span><span class="pvsub-tr" id="pvSubTr" hidden>Subtitles pop right here</span></div></div><div class="pvpre" id="pvPre"><button type="button" class="pvpre-t" id="pvPreT" title="원탭 프리셋 펼치기">Preset</button><span class="pvpre-row" id="pvPreRow" hidden><button type="button" class="pvpre-i" data-rec="reels">릴스 완성</button><button type="button" class="pvpre-i" data-rec="fmt">포맷만</button><button type="button" class="pvpre-i" data-rec="hq">화질만</button></span></div></div>
  <div class="ftqsec" id="ftqsec"><div class="sech"><span class="nm">찾을 장면</span></div><div class="askbox"><textarea id="ftQ" class="nmin" rows="3" maxlength="300" placeholder="선택 · 찾고 싶은 장면의 대사나 내용 한 줄 — 비우면 베스트 2장" aria-label="찾을 장면"></textarea></div></div>
  <div class="stack" id="stack"></div>
  <button class="addbtn" id="addbtn" type="button" hidden>+ 처리 추가</button>
  <div class="xtr" id="xtrsec"></div>
  <div class="status" id="cstatus" role="status"></div>
  <div class="status-sub" id="cstatusSub" hidden></div>
  <div class="vstage" id="vwrap" hidden></div>
  <div class="cutlist" id="cutlist" hidden role="listbox" aria-label="컷 미리보기 — 탭하면 그 구간은 안 자름"></div>
  <div class="footer">
    <button class="ghost dlbtn" id="dlVid" hidden aria-label="저장" title="저장"></button>
  </div>
  <div class="lyburn" id="lyBurn" hidden>
    <label class="fl">완성 영상</label>
    <div class="lyburn-stage"><video id="lyBurnVid" controls playsinline preload="metadata" hidden></video><button class="imgdl dlbtn" id="lyBurnDl" type="button" aria-label="영상 다운로드" title="자막 입힌 영상 다운로드" hidden></button></div>
    <div class="lyburn-row"><span class="lyburn-note" id="lyBurnNote"></span><span class="lysp"></span><label class="dl-full" id="lyCutDelW" title="삭제한 조각 구간을 영상에서도 잘라냄 (다시 입히기와 함께)" hidden><input type="checkbox" id="lyCutDel"><span class="dl-cbox"><svg viewBox="0 0 24 24"><path class="dl-dash" d="M6 12h12"/><path class="dl-chk" d="M5 13l4 4L19 7"/></svg></span><span class="lbl">삭제 컷</span></label><button class="lybtn" id="lyReburn" type="button" aria-label="다시 입히기" title="지금 설정으로 자막 다시 입히기 (편집 있으면 상세 자막 전체로 구움 · 스타일 축 = 자막 탭에서 · 없으면 현행 자막 재사용 = 빠름)" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg></button></div>
    <div class="spellchips" id="lySpellChips" hidden></div>
  </div>
  <div class="lypv" id="lyPv" hidden>
    <video id="lyVid" controls playsinline preload="metadata"></video>
    <div class="lypv-cap" id="lyCap" hidden></div>
    <div class="lypv-row" id="lyPvRow" hidden>
      <label class="dl-full" title="삭제한 조각은 재생에서 건너뜀"><input type="checkbox" id="lySkip" checked><span class="dl-cbox"><svg viewBox="0 0 24 24"><path class="dl-dash" d="M6 12h12"/><path class="dl-chk" d="M5 13l4 4L19 7"/></svg></span><span class="lbl">컷 스킵</span></label>
      <button class="lyrate" id="lyRate" type="button" aria-label="재생 속도" title="재생 속도">1x</button>
      <input type="range" id="lyFs" data-nmg min="13" max="30" step="1" value="18" aria-label="자막 크기">
      <span class="lypv-fs" id="lyFsV">18px</span>
    </div>
  </div>
  <div class="lytabs" id="lyTabs" role="tablist" aria-label="자막 결과 보기"><button class="lytab" id="lyTabDet" type="button" role="tab" aria-selected="false" aria-controls="lydet">상세<span class="lytab-n" id="lyTabN" hidden></span></button><button class="lytab on" id="lyTabOv" type="button" role="tab" aria-selected="true" aria-controls="out">개요</button></div>
  <div id="lydet" role="tabpanel" aria-labelledby="lyTabDet" hidden>
    <div class="lytool">
      <label class="dl-full"><input type="checkbox" id="lyCkAll" aria-label="전체 선택"><span class="dl-cbox"><svg viewBox="0 0 24 24"><path class="dl-dash" d="M6 12h12"/><path class="dl-chk" d="M5 13l4 4L19 7"/></svg></span><span class="lbl">전체 선택</span></label>
      <span class="lysp"></span>
      <button class="lybtn" id="lyFiller" type="button" aria-pressed="false" aria-label="군더더기 빼기" title="군더더기(음·어 등) 한 번에 빼기 / 다시 누르면 되살리기"></button>
      <button class="lybtn" id="lyFindTg" type="button" aria-pressed="false" aria-label="찾아 바꾸기" title="찾아 바꾸기"></button>
      <button class="lybtn" id="lyCopy" type="button" aria-label="자막 복사" title="자막 복사 (선택 있으면 선택만)"></button>
      <button class="lybtn dlbtn" id="lySrt" type="button" aria-label="SRT 다운로드" title="SRT 파일 다운로드 (선택 있으면 선택만)"></button>
    </div>
    <div class="lyfind" id="lyFind" hidden>
      <input type="text" id="lyFindQ" placeholder="찾기" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" name="nomute-find" data-1p-ignore data-lpignore="true" data-form-type="other">
      <input type="text" id="lyFindR" placeholder="바꾸기" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" name="nomute-repl" data-1p-ignore data-lpignore="true" data-form-type="other">
      <button class="lyfbtn" id="lyFindGo" type="button">모두 바꾸기</button>
      <span class="lyfn" id="lyFindN" aria-live="polite"></span>
    </div>
    <div class="lystats" id="lyStats"></div>
    <div id="lySegs" role="group" aria-label="자막 조각 — 단어 탭=제외, 더블탭=수정"></div>
    <button class="lyreset" id="lyReset" type="button" hidden>편집 초기화 (처음 구운 자막으로)</button>
  </div>
  <div class="out" id="out"></div>
  <div class="hist-grid" id="lyJobList" hidden></div>
</div>
<div class="sheetdim" id="sheetdim" hidden></div>
<div class="sheet" id="sheet" hidden role="dialog" aria-label="처리 추가">
  <div class="sh"><b>처리 추가</b><button class="shx" id="shx" type="button" aria-label="닫기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6 18 18M18 6 6 18"/></svg></button></div>
  <div id="sheetbody"></div>
</div>
<div class="scrub" id="scrub" hidden>
  <div class="scrub-stage" id="scrubStage"><video id="scrubVid" playsinline muted preload="metadata"></video><div class="cropfr" id="cropFr"></div></div>
  <div class="scrub-bar"><input type="range" id="scrubT" min="0" max="10" step="0.05" value="0" aria-label="장면 위치"><span class="scrub-t" id="scrubTv">0:00</span></div>
  <div class="scrub-acts">
    <button class="ghost" id="scrubCancel" type="button">취소</button>
    <button class="cta" id="scrubOk" type="button">이 위치로</button>
  </div>
</div>
<script type="text/nm-off" data-nm-i="4" src="/nm-svg.js"></script><script type="text/nm-off" data-nm-i="5" src="/nm-ua.js"></script>
<script type="text/nm-off" data-nm-i="6" src="/nm-rail.js" data-scope="cap" data-dlname="video.mp4" data-jobkey="nm_edit_pend" data-srv="api/edit?recent=48" data-srvstat="api/edit?stat="></script>
<script type="text/nm-off" data-nm-i="7" src="/nm-jobs.js"></script>
<script type="text/nm-off" data-nm-i="8" src="/nm-clip.js"></script>
<script type="text/nm-off" data-nm-i="9" src="/nm-sync.js"></script>
<script type="text/nm-off" data-nm-i="10" src="/nm-loader.js"></script>
<script type="text/nm-off" data-nm-i="11" src="/nm-gauge.js"></script>
<script type="text/nm-off" data-nm-i="12" src="/nm-snap.js"></script>
<script type="text/nm-off" data-nm-i="13" src="/nm-alpha.js"></script>
<script type="text/nm-off" data-nm-i="14" src="/upload.js"></script>
<script type="text/nm-off" data-nm-i="15"></script>
<script type="text/nm-off" data-nm-i="16" src="/cscroll.js"></script>
<script type="text/nm-off" data-nm-i="17"></script>`,
  headTags: `<script type="text/nm-off" data-nm-i="0"></script><script type="text/nm-off" data-nm-i="1"></script><script type="text/nm-off" data-nm-i="2" src="/nm-wave.js"></script><script type="text/nm-off" data-nm-i="3" src="/nm-scene.js"></script>`,
  scripts: [{ run: inline1 },
    { run: inline2 },
    { src: "nm-wave.js", defer: true, run: LIB["nm-wave.js"] },
    { src: "nm-scene.js", defer: true, run: LIB["nm-scene.js"] },
    { src: "nm-svg.js", run: LIB["nm-svg.js"] },
    { src: "nm-ua.js", defer: true, run: LIB["nm-ua.js"] },
    { src: "nm-rail.js", run: LIB["nm-rail.js"] },
    { src: "nm-jobs.js", run: LIB["nm-jobs.js"] },
    { src: "nm-clip.js", run: LIB["nm-clip.js"] },
    { src: "nm-sync.js", run: LIB["nm-sync.js"] },
    { src: "nm-loader.js", run: LIB["nm-loader.js"] },
    { src: "nm-gauge.js", run: LIB["nm-gauge.js"] },
    { src: "nm-snap.js", run: LIB["nm-snap.js"] },
    { src: "nm-alpha.js", run: LIB["nm-alpha.js"] },
    { src: "upload.js", run: LIB["upload.js"] },
    { run: inline3 },
    { src: "cscroll.js", run: LIB["cscroll.js"] },
    { run: inline4 }],
};
