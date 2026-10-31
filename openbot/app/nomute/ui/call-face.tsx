// 입력칸 「@」·「!」 목록 얼굴(형 10-31 「이런 호출하면 얼굴 나오고 얼굴 심지어 움직여야하고 심지어 검정색 배경에 잘 보여야하고」)
//   = 머리·1:1 목록과 같은 움직이는 얼굴 · 원본 부름 목록(prompt-area) 항목의 icon 칸(overrides.ts PATCH triggers.ts) · 묶음(모두)은 얼굴 없음
import { useEffect } from "react";
import { idOf, peopleSync } from "../data/office";
import { MicOrb, ringOf } from "../swap/mic-orb";

/** 목록이 떠 있는데 앱을 나갔다 오거나 키보드가 내려가면 자리가 어긋나 공중에 뜸 → 닫음(형 10-31 「다른 화면 다녀오면 공중에 뜸」) · 원본은 열 때 자리를 한 번만 잡음 · 글자판 바뀜(키패드 높이 조금 바뀜)엔 안 닫음 */
export function useCloseCallMenu() {
  useEffect(() => {
    const close = () => {
      const ed = document.querySelector('.bg-popover[role="listbox"]')?.parentElement?.querySelector<HTMLElement>('[contenteditable="true"]');
      ed?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    };
    const hidden = () => { if (document.hidden) close(); };
    const vv = window.visualViewport;
    let h = vv?.height || 0;
    const resized = () => { const n = vv?.height || 0; if (n - h > 160) close(); h = n; };
    document.addEventListener("visibilitychange", hidden); window.addEventListener("blur", close); vv?.addEventListener("resize", resized);
    return () => { document.removeEventListener("visibilitychange", hidden); window.removeEventListener("blur", close); vv?.removeEventListener("resize", resized); };
  }, []);
}

/** 부름 목록 이름 옆 표지(형 10-31 「너가 수정한거 대화창 안에서도 적용되어야해 이모지 말한거야 ! 호출 포함」) · 원본 칸은 글자꼴이지만 받은 대로 그림 · 칩 글자는 이름만(overrides.ts onSelect) */
export function markLabel(id: string, name: string): string {
  const list = peopleSync(), m = list.find((x) => idOf(x.who, list) === id)?.mark;
  return (m ? <>{name}<span className="ymark" aria-hidden>{m}</span></> : name) as unknown as string;
}

export function faceIcon(id: string) {
  const list = peopleSync(), p = list.find((x) => idOf(x.who, list) === id);
  return p ? <MicOrb size={24} id={id} tint={ringOf(p)} /> : undefined;
}
