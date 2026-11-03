// 링크 = 아이콘 느낌(형 11-04 08:07 「cloudflare, suno,나 github 링크 경우에는 … 아이콘 느낌으로 나오게가 가능한가?」 · 그림 = 그록 앱 「(Suno 아이콘) 1번」 꼴)
//   그 사이트면 = 글 속 링크 앞에 작은 사이트 아이콘(그 사이트 자기 파비콘) · 말풍선 밑 큰 미리보기 카드(./link-card.tsx)는 안 그림 · 아이콘 못 받으면 아이콘만 숨김
import { useState } from "react";

const SITES: [RegExp, string][] = [
  [/(^|\.)github\.com$/i, "https://github.com/favicon.ico"],
  [/(^|\.)cloudflare\.com$/i, "https://www.cloudflare.com/favicon.ico"],
  [/(^|\.)suno\.(com|ai)$/i, "https://suno.com/favicon.ico"],
];

/** 주소 → 그 사이트 아이콘 주소(아니면 "") */
export function siteIcon(href?: string): string {
  if (!href) return "";
  let host = "";
  try { host = new URL(href).hostname; } catch { return ""; }
  return SITES.find(([re]) => re.test(host))?.[1] || "";
}

export function SiteIcon({ href }: { href?: string }) {
  const src = siteIcon(href), [bad, setBad] = useState(false);
  return src && !bad ? <img className="ysite-ico" src={src} alt="" width={16} height={16} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setBad(true)} /> : null;
}
