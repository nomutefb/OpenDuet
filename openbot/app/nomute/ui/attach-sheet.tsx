// 입력칸 「+」 — 폰 = 아래서 올라오는 판(사진 · 파일) · PC = 파일 창 바로(형 11-01 「+ 누르면 최근 사진 영상 나와서 업로드 편하게 되어잇고」)
//   웹은 폰 사진첩 목록을 못 읽어서 앱 안에 최근 사진 줄은 못 둠 → 사진 = 폰의 사진 고르기 화면 · 카메라 안 뜨게 capture 없음 · 거름은 screenPickedFiles 그대로(영상은 거기서 거절)
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IconFile, IconMovie, IconPhoto } from "@tabler/icons-react";

const OPEN = "nm-attach-open";
const IMAGES = "image/*", VIDEOS = "video/*", ANY = "*/*";   // 동영상 = 폰 영상 고르기(시아 11-02 형 02:32 「여가에 영상도 올릴 수 있게 해줘」 · 50MB 까지)

/** 원본 「+」 자리(overrides.ts PATCH composer.tsx) */
export function openAttach(input: HTMLInputElement | null) {
  if (!input) return;
  if (!window.matchMedia("(pointer: coarse)").matches) { input.accept = ANY; input.click(); return; }
  window.dispatchEvent(new CustomEvent(OPEN, { detail: input }));
}

export function AttachSheet() {
  const [input, setInput] = useState<HTMLInputElement | null>(null);
  useEffect(() => {
    const on = (e: Event) => setInput((e as CustomEvent<HTMLInputElement>).detail);
    window.addEventListener(OPEN, on);
    return () => window.removeEventListener(OPEN, on);
  }, []);
  if (!input) return null;
  const pick = (accept: string) => { input.accept = accept; setInput(null); input.click(); };
  return createPortal(
    <>
      <div className="nm-atts-back" aria-hidden onClick={() => setInput(null)} />
      <div className="nm-atts" role="menu" aria-label="붙이기">
        <button type="button" role="menuitem" onClick={() => pick(IMAGES)}><IconPhoto size={22} />사진</button>
        <button type="button" role="menuitem" onClick={() => pick(VIDEOS)}><IconMovie size={22} />동영상</button>
        <button type="button" role="menuitem" onClick={() => pick(ANY)}><IconFile size={22} />파일</button>
      </div>
    </>,
    document.body,
  );
}
