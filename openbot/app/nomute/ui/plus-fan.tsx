// 「+」 펼침 한 벌 — 폰 뉴스 에디터 오른쪽 아래(./news-editor.tsx) · 홈 PC Digest 오른쪽 아래(../home/news-summary.tsx · 형 11-13 02:24 봄 1:1 「1) 에디터 요약 + 있잖아 모바일에 잇는거. 그거 인앱 메인 digest 우하단에 + 나오게 해줘」 · 「5) 인앱이라고 설명한거 = 웹앱(pc)」)
import "../vendor/kinetics/orbit-menu.css";
import "./plus-fan.css";
import { useEffect, useRef, useState } from "react";

/** 오른쪽 아래 「+」 펼침(형 11-11 19:23 봄 1:1 「요약버튼 혹시 그 대화방에 펼침 + 로 해줄 수 있어? 펼쳐서 이미지 에디터랑 뉴스 요약 비디오 에디터 3개 나오면 됨. 그리고 최소화 가능하게」)
 *  꼴 = 9시 → 12시로 셋이 각도대로 펼쳐지는 그림 단추(형 11-15 「뉴스 요약에서 누르면 펼쳐지는 그 모양을 9시에서 12시로 3개가 펼쳐지게 할게 각도별로 픽토그램식으로 · Kinetics orbital menu 같은거로 모양만 변형 및 글래스모피즘 투명도 적용」)
 *  몸 = Kinetics 「Orbital Action Menu」 그대로(../vendor/kinetics/orbit-menu.css · 가운데 「+」 = 45° 돌며 .88 · 둘레 단추 = 스프링으로 튀어나옴) · 자리 셋(9시 · 10시 반 · 12시) · 유리 옷 = ./plus-fan.css
 *  넷째 = 문서 에디터(형 11-17 「최대한 넓은 범위에서 진행할게 다해줘」 = 폰에서 들어가는 문 · ../hwp/doc-editor.tsx /eddoc) → 자리 넷(9시 · 10시 · 11시 · 12시 · 30°씩) · 단추 40 이 안 겹치게 반지름 62 → 88
 *  평소 = 작은 「+」 하나 · 누르면 셋(뉴스 요약 = 요약 요청 · 이미지 에디터 = 카드 제작 /edtool · 비디오 에디터 = 영상 편집 /edvid) · 하나 누르면 그 화면 · 「+」 다시 또는 바깥 = 접힘 · 글자 = 읽어 주기 · 길게 올려 두면(title) */
const P = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
export const ICON: Record<string, JSX.Element> = {   // 메뉴 줄 「에디터」 칸도 같은 그림을 씀(./shell.tsx menuOf · 형 11-16 「그 뉴스에 + 누르면 나오는 이미지랑 비디오 에디터」)
  "/ask": <svg {...P}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8M16 13H8M16 17H8" /></svg>,
  "/edtool": <svg {...P}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>,
  "/edvid": <svg {...P}><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" /><rect x="2" y="6" width="14" height="12" rx="2" /></svg>,
  "/eddoc": <svg {...P}><path d="m18 5-2.414-2.414A2 2 0 0 0 14.172 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2" /><path d="M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" /><path d="M8 18h1" /></svg>,   // 종이 + 펜 = 문서 에디터(뉴스 요약의 글줄 종이와 구별)
};
export function PlusFan({ go }: { go: (to: string) => void }) {
  const [open, setOpen] = useState(false), box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return undefined;
    const away = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);
  const items: [string, string][] = [["/ask", "뉴스 요약"], ["/edtool", "이미지 에디터"], ["/edvid", "비디오 에디터"], ["/eddoc", "문서 에디터"]];
  const at = ["action-w", "action-wnw", "action-nnw", "action-n"];   // 9시 · 10시 · 11시 · 12시
  return (
    <div ref={box} className={`nm-ned-plus demo-orbit-menu${open ? " on" : ""}`}>
      {items.map(([to, t], i) => <button key={to} type="button" className={`nm-ned-plus-i demo-orbit-action ${at[i]}`} tabIndex={open ? 0 : -1} aria-hidden={!open} aria-label={t} title={t} onClick={() => { setOpen(false); go(to); }}>{ICON[to]}</button>)}
      <button type="button" className="nm-ned-plus-main demo-orbit-core" aria-expanded={open} aria-label={open ? "접기" : "펼치기 — 뉴스 요약 · 이미지 에디터 · 비디오 에디터 · 문서 에디터"} onClick={() => setOpen((v) => !v)}>
        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      </button>
    </div>
  );
}
