// 폰 홈 맨 위 넘김 둘째 장 「SNS」 = 큰 아이콘 셋(인스타 · 스레드 · X) · 누르면 그 앱
//   (형 11-20 09:20 dm-bom 「…내 인스타그램이랑 스레드 볼 수 있었으면 좋겠음. x 까지.」 · 미토스 5.2 ② 「…아이콘 3개만 둬. 누르면 평범한 https 주소로 앱이 열려.」 「안 열리는 서비스만 instagram:// 같은 주소를 덧붙여.」)
//   아이폰 = 앱 주소로 바로(형 11-21 05:02 dm-sia 시아 옮김 「이거 바로 열리게 해즈고」 + 사진 = Threads 누르니 맨 위 주소 줄 · 어두운 화면에 멈춤 = 홈 화면 앱의 https 새 창은 앱 안 사파리 시트로 열려 그 앱으로 안 넘어감)
//     앱으로 넘어가면(창 숨음 · 흐려짐) 끝 · 1.6초 안에 아무 일 없으면(앱 없음) 그때만 웹 · 그 밖 기기 = https 그대로(안드로이드는 https 가 앱을 엶)
//   글 0(설명글 0 · 형 11-20 10:05) · 가만히 둔 화면 = 0(그림 셋 · 받아오기 0)
import type { MouseEvent } from "react";
import { type SnsSite, SNS_SITES } from "../ui/sns-side";
import { SnsIcon } from "../ui/sns-card";
import "./sns-apps.css";

/** 아이폰 앱 주소(앱이 등록한 이름 · Threads = barcelona) */
export const SNS_APP_URL: Record<SnsSite, string> = { instagram: "instagram://app", threads: "barcelona://", x: "twitter://timeline" };
/** 아이폰 · 아이패드(아이패드 사파리는 맥 꼴 UA + 손가락) · 순수(시험) */
export const isIos = (ua: string, platform = "", touch = 0): boolean => /iPhone|iPad|iPod/.test(ua) || (platform === "MacIntel" && touch > 1);
const WAIT_MS = 1600;

/** 앱 주소로 열고, 앱으로 안 넘어갔으면(앱 없음) 웹 */
export function openSnsApp(app: string, web: string): void {
  let gone = false;
  const off = () => { gone = true; };
  const vis = () => { if (document.visibilityState === "hidden") gone = true; };
  window.addEventListener("blur", off); window.addEventListener("pagehide", off); document.addEventListener("visibilitychange", vis);
  window.setTimeout(() => {
    window.removeEventListener("blur", off); window.removeEventListener("pagehide", off); document.removeEventListener("visibilitychange", vis);
    if (!gone && document.visibilityState === "visible") window.open(web, "_blank", "noopener");
  }, WAIT_MS);
  window.location.href = app;
}

export function SnsApps() {
  const go = (e: MouseEvent<HTMLAnchorElement>, s: (typeof SNS_SITES)[number]) => {
    if (!isIos(navigator.userAgent, navigator.platform, navigator.maxTouchPoints)) return;   // 그 밖 = https 새 창 그대로
    e.preventDefault();
    openSnsApp(SNS_APP_URL[s.id], s.url);
  };
  return (
    <div className="nm-snsapps" role="group" aria-label="SNS 앱">
      {SNS_SITES.map((s) => (
        <a key={s.id} className={`nm-snsapp ${s.id}`} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name} title={s.name} onClick={(e) => go(e, s)}>
          <SnsIcon site={s.id} />
        </a>
      ))}
    </div>
  );
}
