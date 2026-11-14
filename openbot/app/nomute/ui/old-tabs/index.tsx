// 서랍 「채널」 · 「SNS」 = 옛 에디터 「채널 요약」 · 「SNS」 탭을 앱 안에 직접 붙임(형 11-15 「이거를 에디터 자체에 가져오는거임. 지금은 좀 끌고 온 느낌인데 / 아예 여기에 줕이려고. 로딩해서 가져오는게 아니라 / sns도 마찬가지양」)
//   전엔 옛 에디터 화면을 통째로(index.html 약 2.9MB) iframe 으로 품었음(shell FRAME.chan · sns) → 이제 그 탭의 판 · 엔진 · 옷만 떼어 앱 코드로 돌림(이미지 편집 ./thumb-maker 와 같은 길)
//   판 = ./markup.ts · 엔진 = ./engine.ts(원본 줄 그대로) · 옷 = ./old-tabs.gen.css(.ot 안으로 가둠) — 셋 다 ./tools 가 옛 에디터 저장소에서 만듦 · 앱에 맞춘 덧줄 = ./old-tabs.css
//   옛 머리 줄(시각 · 새로고침 · 실검 띠)은 뺌(형 「헤더 영역은 없어도 되고」) · 채널 출처 바꿈(인스타 → 페북 → 스레드 → 결과 함께)은 기능이라 맨 위 오른쪽에 남김
//   자료 = 원본과 같은 주소(/api/chan?f=… → /insta_data.json … · /api/trends → /sns_trends.json · /api/trends?f=xtop · f=brief · /social_candidates.json …)
//   링크 = 새 창(옛 「앱 안 보기 창」은 안 가져옴) · 저절로 넘어가던 것(TOP 10 넘김 · 주식 값 바꿔 끼우기 · 실검 띠)은 끔(형 맥이 뜨거워진 적 있음)
import "./old-tabs.gen.css";
import "./old-tabs.css";
import { memo, useEffect, useRef } from "react";
import { startOldTabs } from "./engine";
import { CHAN_HTML, SNS_HTML } from "./markup";

const HTML = { chan: { __html: CHAN_HTML }, sns: { __html: SNS_HTML } };
const host = { open: (u: string) => { try { window.open(u, "_blank", "noopener"); } catch { /* 못 열면 그대로 */ } } };

export const OldTab = memo(function OldTab({ which }: { which: "chan" | "sns" }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!root.current) return;
    let stop: (() => void) | undefined;
    try { stop = startOldTabs(root.current, which, host); } catch (e) { console.error("[옛 탭] 시작 실패", e); }
    return () => { try { stop?.(); } catch { /* 이미 걷힘 */ } };
  }, [which]);
  return <div ref={root} className={`ot ot-${which}`} dangerouslySetInnerHTML={HTML[which]} />;
});
export const ChanTab = () => <OldTab which="chan" />;
export const SnsTab = () => <OldTab which="sns" />;
