// 뉴스 에디터 위 탭 셋 = 뉴스 · SNS · 채널(순수 · 시험 tests/ned-tabs.test.ts)
//   형 11-15 10:2x 「2의 화면(뉴스 에디터)을 1의 화면(대화방 위 탭)처럼 탭으로 구현해줘」 · 「추가로 나올 내용은 서랍의 sns와 채널 / 그리고 서랍은 그 내용이 사라지면 댐 / 불러오는 개념이 아니라 저기 박혀야 하고 자연스러워야함」
//   = 서랍 「뉴스」 묶음(SNS · 채널)을 걷고 그 둘을 네비 4번 뉴스 에디터 안 탭으로 · 주소는 그대로 살림(#/sns · #/chan · 옛 #/trend · #/chanfull = 홈 팔로워 띠 · 알림 「안전 탭 열기」가 그 탭으로 바로)
export type NedTab = "news" | "sns" | "chan";
export const NED_TABS: { id: NedTab; to: string; name: string; icon: "page" | "globe" | "dashboard" }[] = [
  { id: "news", to: "/newsed", name: "뉴스", icon: "page" },   // 그림 = 아래 네비 4번과 같은 것
  { id: "sns", to: "/sns", name: "SNS", icon: "globe" },   // 그림 둘 = 서랍에 있을 때 그대로(눈에 익은 것)
  { id: "chan", to: "/chan", name: "채널", icon: "dashboard" },
];
/** 길 → 탭(끝 빗금 무시 · 모르는 길 = 뉴스) */
export const nedTabOf = (pathname: string): NedTab => {
  const p = pathname.replace(/\/+$/, "");
  return p === "/sns" || p === "/trend" ? "sns" : p === "/chan" || p === "/chanfull" ? "chan" : "news";
};
