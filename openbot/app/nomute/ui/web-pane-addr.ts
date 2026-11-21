// 「웹」 칸 주소창에 친 글 → 주소(순수 · ./web-pane.tsx 가 씀 · 시험 tests/native-web.test.ts)
/** 친 글 → 주소(http(s) 그대로 · 점이 있고 빈칸이 없으면 https 붙임 · 그 밖 = 구글 검색) */
export function toAddress(raw: string, real = false): string {   // real = 진짜 웹뷰 칸(끼움용 igu=1 을 안 붙임 = 보통 구글)
  const s = raw.trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (!/\s/.test(s) && /^[^/\s?#]+\.[a-z]{2,}([/:?#]|$)/i.test(s)) return `https://${s}`;
  if (real) return `https://www.google.com/search?q=${encodeURIComponent(s)}`;
  return `https://www.google.com/search?igu=1&cs=1&q=${encodeURIComponent(s)}`;   // 기본 검색 = 구글 · 어두운 판(cs=1 · 형 11-18 22:0x 「그리고 구글 검색을 기본으로 해주셈」 「기본적으로 다크모드로 하게 해주고」 · 실측 = 검색 결과가 어둡게 뜸)
}
