// 대화 속 SNS 글 카드(미토스 5.2 설계 ① · 형 11-20 10:16 · 구름) — 가로 카드 = 왼쪽 9:16 작은 스냅샷(없으면 서비스 아이콘) · 오른쪽 서비스 아이콘 · @이름 · 캡션 2줄
//   누름 = PC 껍데기 앱(옆 칸 다리 있음) → SNS 탭 + 그 곳 웹뷰가 그 글로 · 그 밖(그냥 브라우저 · 폰) = 그 주소 새 창(폰 = 앱이 열리면 앱)
//   자리 = 링크 카드 자리(말풍선 밖 아래) · 한마디 없이 보낸 글 = 말풍선 대신 카드만(./office-chat.tsx snsBare)
import { type MouseEvent, useState } from "react";
import { type SnsPost, SNS_NAME } from "./sns-post";
import { type SnsSite, sideBridge, snsGo } from "./sns-side";
import "./sns-card.css";

const fileSrc = (p: string) => `/api/office/file?${new URLSearchParams({ path: p })}`;   // ./office-chat.tsx fileUrl 와 같은 길

export function SnsIcon({ site, className = "" }: { site: SnsSite; className?: string }) {
  if (site === "x") return <svg className={className} viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M17.8 3h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.9 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z" /></svg>;
  if (site === "threads") return <svg className={className} viewBox="0 0 24 24" aria-hidden><path fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" d="M16.9 11.2c-.3-2.6-1.9-3.9-4.4-3.9-1.7 0-3.1.8-3.8 2.1M12.2 21c-4.9 0-8.2-3.3-8.2-9s3.3-9 8.2-9c4 0 6.8 2 7.8 5.6M16.9 11.2c2.3.7 3.6 2.4 3.3 4.6-.4 3-3.1 5.2-8 5.2M16.9 11.2c-1.2-.4-2.6-.5-4-.4-2.4.2-3.8 1.4-3.6 3 .2 1.5 1.7 2.3 3.5 2.2 2.6-.2 3.9-1.8 4.1-4.8" /></svg>;
  return <svg className={className} viewBox="0 0 24 24" aria-hidden><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.9" /><circle cx="12" cy="12" r="3.9" fill="none" stroke="currentColor" strokeWidth="1.9" /><circle cx="17.2" cy="6.8" r="1.15" fill="currentColor" /></svg>;
}

const shortPath = (u: string) => { try { const x = new URL(u); return x.pathname.replace(/^\/|\/$/g, ""); } catch { return u; } };

export function SnsCard({ p }: { p: SnsPost }) {
  const [bad, setBad] = useState(false);
  const open = (e: MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
    if (!sideBridge()) return;   // 다리 없음 = a 기본(새 창 · 폰은 앱)
    e.preventDefault();
    snsGo(p.site, p.url);
  };
  const who = p.author ? `@${p.author}` : SNS_NAME[p.site];
  return (
    <a className={`ysns ${p.site}`} href={p.url} target="_blank" rel="noopener noreferrer" onClick={open} title={p.url} data-site={p.site}>
      <span className="ysns-shot">{p.shot && !bad ? <img src={fileSrc(p.shot)} alt="" loading="lazy" decoding="async" onError={() => setBad(true)} /> : <SnsIcon site={p.site} className="ysns-big" />}</span>
      <span className="ysns-tx">
        <span className="ysns-who"><SnsIcon site={p.site} className="ysns-ic" /><b>{who}</b></span>
        <span className={`ysns-cap${p.text ? "" : " path"}`}>{p.text || shortPath(p.url)}</span>
      </span>
    </a>
  );
}
