// 돋보기(.nm-find) 바로 아래 자리 = PM 러너 단추(./pm-runner-mini.tsx) · 대기열 단추(./queue-pill.tsx)가 같이 씀
//   형 11-20 14:19 dm-sia 시아 옮김 「그니까 처음에는 잘못된 자리에 있다가 (이름표 옆) > 우측으로 이동했다가(두번째 잘못된 자리) > 그 아래로 이동함(그나마 내가 의도했던자리)」
//   앞 판 = 아직 모를 때 머리 줄 안(이름표 옆)에 먼저 그림 → 돋보기 첫 자리(css 위쪽) 아래 → 돋보기가 제자리로 내려가면 또 따라감 = 세 번 옮김
//   → 돋보기가 제자리를 박기 전엔 안 그림(undefined) · 박은 그때(nm-find-at 신호) 마지막 자리에 바로 · 돋보기가 끝내 없으면(2.5초) 머리 줄 안(null · 앞 판 꼴)
import { useEffect, useState } from "react";

export type Dock = { top: number; right: number };
export function useFindDock(on: boolean): Dock | null | undefined {
  const [at, setAt] = useState<Dock | null | undefined>(undefined);
  useEffect(() => {
    if (!on) return undefined;
    const t0 = Date.now();
    const fit = () => {
      const f = document.querySelector<HTMLElement>(".nm-find"), r = f?.getBoundingClientRect();
      const placed = !!f && !!r && r.width > 0 && (!document.querySelector(".nm-split-root") || !!f.dataset.pinTop);   // PC 반갈 = 돋보기가 제 자리(top)를 박은 뒤만
      if (placed && r) {
        const top = Math.round(r.bottom + 6), right = Math.round(window.innerWidth - r.right);
        setAt((p) => (p && p.top === top && p.right === right ? p : { top, right }));   // 같은 자리 = 다시 그림 0
      } else setAt((p) => (p ? undefined : p === undefined && Date.now() - t0 > 2500 ? null : p));
      //   돋보기가 사라짐(「애들」 같은 판이 열려 대화 칸이 내려감) = 붙어 있던 단추도 바로 숨김 · 앞 판 = 마지막 자리를 붙든 채 판 위에 떠 있었음
      //   (형 11-20 19:41 dm-gik 깃 옮김 「여기에 이거 보인다. 확인좀 ㅋㅋ 피시임 일단은」 · 「애들」 판 구름 얼굴 위 ☰ · ▦) · 처음부터 돋보기가 없으면 2.5초 뒤 머리 줄 안(null · 앞 꼴)
    };
    fit();
    const t = window.setInterval(fit, 1000);   // 덤(창 크기 · 공지 칸이 늦게 바뀔 때) · 돋보기가 옮기는 그때는 nm-find-at 이 먼저
    window.addEventListener("resize", fit); window.addEventListener("nm-pin-h", fit); window.addEventListener("nm-find-at", fit);
    return () => { window.clearInterval(t); window.removeEventListener("resize", fit); window.removeEventListener("nm-pin-h", fit); window.removeEventListener("nm-find-at", fit); };
  }, [on]);
  return at;
}
