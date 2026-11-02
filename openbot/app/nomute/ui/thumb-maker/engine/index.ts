// @ts-nocheck
// 썸네일 생성기 엔진 켜기·끄기 — 원본 thumb.html 이 열릴 때 돌던 차례 그대로 한 번 돌린다
//   원본 차례 = nm-svg·nm-sync·nm-loader·nm-seq·nm-jobs(서버 잡 맞추기 시작)·draft → 본 스크립트(p01~p13) → 빠른 메뉴·접기 단추·nmTabReset(p14)
//              → 문서 다 읽힘(로더 구슬 채움) → 모던 겉옷(modern-ui → fold → copy · 부모가 모던 index 일 때 붙던 것 = 앱 「에디터」 칸 그 꼴)
//   끄기 = 타이머·듣기·관찰·window 표식 다 걷고 상태 비움(원본 iframe 이 닫힌 것과 같음) · 진행 중 잡은 원본처럼 localStorage(nm_thumb_pend)에 남아 다시 열면 이어 봄
//   원본이 바뀌면 = 앱 폴더에서 node ui/thumb-maker/tools/codemod.mjs <에디터 저장소> (p01~p14) · node ui/thumb-maker/tools/scope-css.mjs <에디터 저장소> (../thumb-maker.css)
//     그 밖 조각(markup·svg·libs·jobs-sync·modern·scene)은 머리 주석의 원본 줄을 다시 떼어 같은 자리만 바꿈
import "./libs";
import { bindRuntime, document as rtDoc, window as rtWin } from "./rt";
import { resetState } from "./state";
import { startJobsSync } from "./jobs-sync";
import { startModernCopy, startModernFold, startModernUI } from "./modern";
import * as p01 from "./p01-core";
import * as p02 from "./p02-preview";
import * as p03 from "./p03-options";
import * as p04 from "./p04-media";
import * as p05 from "./p05-text";
import * as p06 from "./p06-draft";
import * as p07 from "./p07-jobs";
import * as p08 from "./p08-results";
import * as p09 from "./p09-restore";
import * as p10 from "./p10-cards";
import * as p11 from "./p11-fit";
import * as p12 from "./p12-spell";
import * as p13 from "./p13-fire";
import * as p14 from "./p14-tail";

const PARTS = [["p01", p01], ["p02", p02], ["p03", p03], ["p04", p04], ["p05", p05], ["p06", p06], ["p07", p07], ["p08", p08], ["p09", p09], ["p10", p10], ["p11", p11], ["p12", p12], ["p13", p13], ["p14", p14]];

/** root = .nm-tm(원본 html 자리) · body = .nm-tm-body · frame = 옛 iframe 자리(폭·높이·고정 위치 기준) · scroller = 원본 창 스크롤 자리 · 돌려줌 = 끄기 */
export function startEngine(root, body, frame, scroller) {
  const off = bindRuntime(root, body, frame, scroller);
  resetState();
  const run = (name, f) => { try { f(); } catch (e) { console.error("[썸네일 생성기] " + name + " 시작 실패", e); } };
  for (const [name, p] of PARTS) if (p.hoist) run(name + " hoist", p.hoist);   // 원본 함수 끌어올림 = 갈아 끼우는 함수(selApp·updateGoSpec)를 맨 처음 S 에
  run("jobs-sync", startJobsSync);
  for (const [name, p] of PARTS) run(name, p.start);
  run("loader", () => { if (window.nmLoaderHydrate) window.nmLoaderHydrate(root); });
  run("modern-ui", startModernUI);
  run("modern-fold", startModernFold);
  run("modern-copy", startModernCopy);
  run("resume", () => {   // nm-sync.js resumeNow 의 다시 맞추기 몫만(돌아오면 이력·R2 최근 다시 읽기 · 5초에 한 번) — 새 배포 다시 읽기·로그인 자가치유는 앱 몫이라 뺌
    let last = Date.now();
    const kick = () => { const t = Date.now(); if (t - last < 5e3) return; last = t; try { if (typeof rtWin.nmRefresh === "function") rtWin.nmRefresh(); } catch (_) {} };
    rtDoc.addEventListener("visibilitychange", () => { if (!rtDoc.hidden) kick(); });
    rtWin.addEventListener("focus", kick);
  });
  return () => { off(); resetState(); };
}
