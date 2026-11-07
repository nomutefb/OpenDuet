// 창 부품 하나 — Esc 로 닫기 · Tab 을 창 안에 가둠 · 닫으면 연 자리로 포커스 돌려줌(빠르 11-08 · 형 11-08 01:31 「엔터프라이즈급 앱으로 만든다.(PC용)」)
//   창 쌓임 = 맨 위 창만 Esc 를 받음(이 부품 창 + 「저장하시겠습니까?」 가드 창(./save-ask useCloseGuard)이 같은 줄을 씀)
//   까닭(빠르 01:41 셈) = Esc 로 안 닫히는 창 8 · 나머지 17곳은 Esc 줄을 저마다 따로 들고 있었고, 창 위에 창이 뜨면 아래 창이 먼저 Esc 를 먹었음(프로필 카드 위 색 고르기)
import { useEffect, useRef } from "react";

const stack: symbol[] = [];

/** 창 쌓임에 한 칸 올림 → 내리는 함수 · 늦게 연 창이 맨 위 */
export function modalPush(): { me: symbol; pop: () => void } {
  const me = Symbol("modal");
  stack.push(me);
  return { me, pop: () => { const i = stack.lastIndexOf(me); if (i >= 0) stack.splice(i, 1); } };
}
/** 이 창이 맨 위인가(맨 위 창만 Esc · Tab 을 받음) */
export const modalTop = (me: symbol) => stack[stack.length - 1] === me;

const OPEN = '[role="dialog"],[role="alertdialog"]';
/** 이 창 안이나 뒤(DOM 차례)에 열려 보이는 다른 창이 있나 — 이 부품을 안 쓰는 옛 창(이야기 보기 · LEGACY 안 팝업 · 웹 겹)이 위에 떠 있으면 Esc·Tab 은 그 창 몫 */
export function coveredBy(el: HTMLElement): boolean {
  for (const d of document.querySelectorAll<HTMLElement>(OPEN)) {
    if (d === el || d.contains(el) || !d.getClientRects().length) continue;
    if (el.contains(d) || el.compareDocumentPosition(d) & Node.DOCUMENT_POSITION_FOLLOWING) return true;
  }
  return false;
}

const SEL = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),iframe,[contenteditable="true"],[tabindex]:not([tabindex="-1"])';

/** 순수 — Tab 다음 자리(가두기) · null = 브라우저에 맡김 · inside = 지금 포커스가 창 안 탭 자리 중 하나(창 껍데기 · 탭 자리 아닌 칸이면 false = 처음/끝으로 보냄) */
export function trapNext<T>(list: T[], at: T | null, inside: boolean, back: boolean): T | null {
  if (!list.length) return null;
  const first = list[0], last = list[list.length - 1];
  if (back) return !inside || at === first ? last : null;
  return !inside || at === last ? first : null;
}

/** 창이 열리는 그림에서(그리기 = autoFocus 보다 먼저) 연 자리를 적어 둠 — 효과(useEffect)에서 적으면 autoFocus 입력칸이 먼저 잡혀서 닫을 때 돌아갈 데가 없음(모루 #2870 「autoFocus 뒤에 복귀 대상을 저장」) */
export function useOpenBack(on: boolean) {
  const back = useRef<HTMLElement | null>(null), was = useRef(false);
  if (on && !was.current && typeof document !== "undefined") {
    const a = document.activeElement;
    back.current = a instanceof HTMLElement && a !== document.body ? a : null;
  }
  was.current = on;
  return back;
}

/** ref 를 창 바깥 칸에 달면: Esc = close · Tab 은 창 안에서 돎 · 열 때 창으로 포커스 · 닫히면 연 자리로 돌려줌 · on = 창이 떠 있을 때만 */
export function useModal<T extends HTMLElement>(close: () => void, on = true) {
  const ref = useRef<T>(null);
  const shut = useRef(close);
  shut.current = close;
  const opener = useOpenBack(on);
  useEffect(() => {
    if (!on) return;
    const { me, pop } = modalPush();
    const back = opener.current;
    const el = ref.current;
    if (el && !el.contains(document.activeElement)) {
      if (!el.hasAttribute("tabindex")) el.tabIndex = -1;
      el.focus({ preventScroll: true });
    }
    const key = (e: KeyboardEvent) => {
      if (!modalTop(me) || e.defaultPrevented || (el && coveredBy(el))) return;
      if (e.key === "Escape") {
        if (e.isComposing) return;   // 한글 조합 중 Esc = 조합만 끝냄
        e.preventDefault(); e.stopPropagation();
        shut.current();
        return;
      }
      if (e.key !== "Tab" || !el) return;
      const list = [...el.querySelectorAll<HTMLElement>(SEL)].filter((x) => x.getClientRects().length > 0);
      const at = document.activeElement as HTMLElement | null;
      const go = trapNext(list, at, !!at && list.includes(at), e.shiftKey);   // 열자마자 창 껍데기에 포커스 = 탭 자리 밖 → Shift+Tab 도 끝 칸으로(모루 #2862 「첫 Shift+Tab 이 창 밖으로」)
      if (!list.length) { e.preventDefault(); el.focus({ preventScroll: true }); return; }
      if (go) { e.preventDefault(); go.focus({ preventScroll: true }); }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      pop();
      if (back && back.isConnected) back.focus({ preventScroll: true });
    };
  }, [on]);
  return ref;
}
