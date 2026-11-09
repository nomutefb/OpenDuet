// 리눅스 데스크톱 = 앱 저절로 조회 0 · 새로 고침만(형 11-09 10:57 dm-bit 「보는 것도 리눅스면 그건 수동이여야하고」 · 10:56 「대시보드 30초 조회」 · 빚 11:05 부탁 ② · 뜸)
//   까닭 = 우리 VM 브레이브(데비안 · 우분투)는 앞 탭이 늘 「보임」이라 숨은 탭 문(./poll-visible.ts · 47 · 깃)으로도 주기 조회가 돎 → 깃허브 한도 범인 꼴(빚 10:55 계기 147 → 27)
//   꼴 = react-query 주기 조회(refetchInterval)는 「창 안 봄」이면 안 돎(refetchIntervalInBackground false · 47) → 리눅스면 focusManager 를 늘 「안 봄」으로 못 박음
//        손으로 돌린 시계(뉴스 목록 · 홈 카드 덱 · SNS 띠 · 뉴스 기사 대기열 수) = pollOff() 로 같이 멈춤
//   그대로 두는 것 = 처음 열 때 한 번 받기 · 글 쓰기·단추 누름 뒤 다시 받기 · 사무실 새 글 신호(pulse = R2 · 깃허브 0) · 새로 받기 = 새로 고침(F5)
//   뺌 = 안드로이드(형 폰 · UA 에 Linux 섞임) · 크롬북
import { focusManager } from "@tanstack/react-query";

export const linuxDesk = (ua: string = typeof navigator !== "undefined" ? navigator.userAgent || "" : "") => /Linux/i.test(ua) && !/Android|CrOS/i.test(ua);
const MANUAL = linuxDesk();

/** 손으로 돌린 시계가 이번 박자를 쉴까 — 숨은 탭 · 리눅스 데스크톱 */
export const pollOff = () => MANUAL || (typeof document !== "undefined" && document.hidden);

/** 리눅스 데스크톱이면 react-query 주기 조회를 늘 멈춤(창 보임 신호를 안 받음) · 바꿨으면 true */
export function manualOnLinux(fm: Pick<typeof focusManager, "setEventListener" | "setFocused"> = focusManager, ua?: string): boolean {
  if (!(ua === undefined ? MANUAL : linuxDesk(ua))) return false;
  fm.setEventListener(() => () => {});
  fm.setFocused(false);
  return true;
}
