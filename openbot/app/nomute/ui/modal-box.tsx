// 창 껍데기 하나 — div 대신 쓰면 ./use-modal 을 그대로 입음(Esc · Tab 가두기 · 포커스 돌려주기 · 맨 위 창만) · 빠르 11-08
//   셸 큰 창(서랍 · 설정 · 이슈 · 웹)처럼 한 함수 안에서 조건으로 뜨는 창은 훅을 그 자리에 못 두어서 껍데기로 감쌈
import type { HTMLAttributes } from "react";
import { useModal } from "./use-modal";

export function ModalBox({ close, ...rest }: { close: () => void } & HTMLAttributes<HTMLDivElement> & { inert?: boolean }) {
  const ref = useModal<HTMLDivElement>(close);
  return <div ref={ref} {...rest} />;
}
