// 몸 화면(VM) = PC 에선 탭으로(형 11-16 14:3x 구름 맥 창 「애들 vm키면, pc에서는 새 탭으로 열리게 가능해?」 · 16:2x 「ㅇㅇ 해줘」 · 「가능함녀 구글 데스크톱도 링크화 하던지 해서 동일하게」)
//   순수(시험 tests/screen-tab.test.ts) — 어디로 열지 · 탭 목록에 붙이기 · 구글 원격 데스크톱 주소 가림
//   길 = 맥 독 앱(웹 탭 줄 없음 · 형 14:04) → 앱 제 탭 줄 새 탭 / 윈도우 웹앱 · 보통 웹(PC 두 칸 · 웹 탭 줄 보임) → 위 탭 줄 「○○ 화면」 탭 / 폰 · 좁은 창 → 앞 꼴(화면 전체 판)
import { type TabState, tabsAdd } from "./tab-list";

export const SCREEN_TAB_EVENT = "nm-screen-tab";   // 프로필 카드 「몸 화면 열기」 → 위 탭 줄(./tab-bar.tsx 가 들음)
export type ScreenTabAsk = { who: string; url: string };   // url = 표 안 붙은 화면 주소(테일넷 안 · ./pc-url.ts) 또는 구글 원격 데스크톱 주소 — 표(2분 · 한 번)는 탭을 켤 때 새로 받음

/** 맥 몸(봄 · 챙) = 구글 원격 데스크톱(./profile-card.tsx crd 와 같은 꼴) — 구글이 끼워 넣기를 막아(X-Frame-Options) 탭 안엔 여는 링크만 */
export const isCrd = (u: string) => /^https:\/\/remotedesktop\.google\.com\/access\/session\/[0-9a-f-]{36}$/.test(u);

/** 어디로 — "app" = 맥 독 앱 제 탭 · "web" = 위 웹 탭 줄 · "" = 탭 없음(부른 쪽이 앞 꼴 그대로) */
export function screenTabWay(e: { pc: boolean; macApp: boolean; webTabs: boolean }): "app" | "web" | "" {
  if (!e.pc) return "";
  if (e.macApp) return "app";
  return e.webTabs ? "web" : "";
}

/** 탭 목록에 붙이고 고름 — 그 아이 탭이 이미 있으면 주소만 새것으로(명부 주소가 바뀐 뒤) · 한 아이 = 탭 하나 */
export function screenTabAdd(s: TabState, who: string, url: string): TabState {
  if (!who || !/^https?:\/\//.test(url)) return s;
  const stale = s.tabs.some((t) => t.k === "screen" && t.who === who && t.url !== url);
  return tabsAdd(stale ? { ...s, tabs: s.tabs.map((t) => (t.k === "screen" && t.who === who ? { ...t, url } : t)) } : s, { k: "screen", who, url });
}
