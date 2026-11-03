// 대화창 링크 미리보기 카드(형 11-02 07:13 「그리구 내가 유튜브 링크 업로드 하면 이 사진 하단 부 처럼 챗창에는 나오게 해야하고」 ·
//   「링크는 보통 사진 암호화 걸린건 링크만 나오고 그게 아닌간 대표 사진하고 같이 나오게 되어있으니 참고해봐」 · 「채팅에는 일반적인 채팅 앱처럼 보이면 됨」)
//   자리 = 말풍선 밖 바로 아래(시각 위 · 내 글 오른쪽 · 상대 글 왼쪽) · 글 속 첫 주소 하나만(카톡·아이메시지 꼴)
//   자료 = 서버 GET /api/office/linkcard?url=(봄 #2107 · 답 = { ok, cached, card } · 서버 7일 저장) → kind youtube = 영상 그림 16:9 + 재생 표 · page = 대표 그림 1.91:1 + 제목·설명·사이트 · blocked(로그인 벽 · 비공개 인스타) = 작은 링크 칩
//   못 받음(서버 아직 · 404 · Pages 가 돌려준 HTML · 끊김) = 아무것도 안 그림(글 속 링크는 그대로) · 다시 조르지 않음(retry 0)
//   누름 = 글 속 링크·뉴스 원문과 같은 길(./inapp.ts → 앱 안 #/web 한 겹 · 유튜브 = 퍼가기 주소 · 품기 막는 사이트(인스타 등) = 원래대로 새 창)
import { useQuery } from "@tanstack/react-query";
import { type MouseEvent, useState } from "react";
import { inAppClick, useGo } from "./news-data";
import "./link-card.css";

const pc = () => { try { return matchMedia("(hover: hover) and (pointer: fine)").matches; } catch { return false; } };   // 마우스 = PC·확장(enter-key.tsx 와 같은 셈)

type Card = { ok?: boolean; url?: string; site?: string; title?: string; desc?: string; image?: string; kind?: "youtube" | "page" | "blocked"; yt?: { id?: string; thumb?: string } };

const URL_RE = /(https?:\/\/[^\s<>"'「」()]+[^\s<>"'「」().,;:!?])/g;   // ./office-chat.tsx URL_RE 와 같은 꼴(글 속 주소)
const IMG_RE = /\.(png|jpe?g|gif|webp|avif)$/i;
const QUOTE_LINE = /^↩ [^\n]*(?:\n|$)/;   // 답장 인용 첫 줄(남의 글 주소) = 안 봄

/** 카드 걸 주소 = 글 속 첫 주소 · 우리 사무실 파일(/api/office/…)·말풍선 위 사진으로 이미 뜨는 같은 출처 그림(office-chat textPhotos)은 건너뜀 */
function cardUrl(text: string): string {
  for (const u of text.replace(QUOTE_LINE, "").match(URL_RE) || []) {
    let x: URL;
    try { x = new URL(u); } catch { continue; }
    const own = x.origin === location.origin || x.hostname === "edit.nomute.kr";
    if (own && (x.pathname.startsWith("/api/office/") || IMG_RE.test(x.pathname))) continue;
    return u;
  }
  return "";
}

async function getCard(url: string): Promise<Card> {
  const r = await fetch(`/api/office/linkcard?url=${encodeURIComponent(url)}`, { credentials: "same-origin" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = (await r.json()) as Card & { card?: Card };   // HTML(없는 길 = index.html) = 여기서 터짐 = 안 그림
  const c = j?.card ?? j;   // 봄 #2107 = { ok, cached, card: {…} }(07:26 꼴) · 맨 꼴도 받음
  if (!j || j.ok === false || !c?.kind) throw new Error("카드 없음");
  return c;
}

const hostPath = (u: string) => { try { const x = new URL(u); return (x.hostname.replace(/^www\./, "") + x.pathname).replace(/\/$/, ""); } catch { return u; } };

function LinkIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" /><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" /></svg>;
}

/** 말풍선 아래 카드 한 장(글 = 첨부 있으면 caption · 없으면 text) */
export function LinkCard({ m }: { m: { text?: string; caption?: string; files?: unknown[] } }) {
  const url = cardUrl(String((m.files?.length ? m.caption : m.text) || ""));
  const q = useQuery({ queryKey: ["nomute", "linkcard", url], queryFn: () => getCard(url), enabled: !!url, staleTime: 864e5, gcTime: 864e5, retry: false, retryOnMount: false, refetchOnWindowFocus: false });
  const go = useGo();
  const [noImg, setNoImg] = useState(false);   // 그림 못 불러옴(핫링크 막힘 등) = 그림 칸만 숨김
  const c = q.data;
  if (!url || !c) return null;
  const open = (e: MouseEvent<HTMLAnchorElement>) => { e.stopPropagation(); if (!pc()) inAppClick(go)(e); };   // 폰 = 앱 안 한 겹(못 들이면 a 기본 새 창) · PC = 늘 a 기본 새 창(형 11-03 16:05 「링크줄때 내가 누르면 새창에서 항상 올리게 가능하니? 모바일은 아마 앱을 고르라고 ㄸ르텐데, pc에서」 · 뜸 전함)
  const site = c.site || hostPath(url).split("/")[0];
  const yt = c.kind === "youtube";
  const img = yt ? c.yt?.thumb || c.image || (c.yt?.id ? `https://i.ytimg.com/vi/${c.yt.id}/hqdefault.jpg` : "") : c.image || "";
  const bare = !yt && !img && !c.desc && !!c.title && c.title.trim().toLowerCase() === String(c.site || "").replace(/^www\./, "").split(".")[0].toLowerCase();   // 그림·설명 없이 제목 = 사이트 이름뿐(인스타 로그인 벽 등 · 봄 서버 실측 「Instagram」) = 칩
  if (c.kind === "blocked" || bare || (!yt && !c.title && !img)) {
    const hp = hostPath(url);
    return (
      <a className="ylink-chip" href={url} target="_blank" rel="noopener noreferrer" onClick={open} title={url}>
        <LinkIcon />
        <span>{site && !hp.startsWith(site) ? <><b>{site}</b> · </> : null}{hp}</span>
      </a>
    );
  }
  return (
    <a className={`ylink${yt ? " yt" : ""}`} href={url} target="_blank" rel="noopener noreferrer" onClick={open} title={url}>
      {img && !noImg ? (
        <span className="ylink-img">
          <img src={img} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setNoImg(true)} />
          {yt ? <span className="ylink-play" aria-hidden><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.52.85l10.4-6.5a1 1 0 0 0 0-1.7L9.52 4.65A1 1 0 0 0 8 5.5Z" /></svg></span> : null}
        </span>
      ) : null}
      <span className="ylink-tx">
        {c.title ? <b className="ylink-t">{c.title}</b> : null}
        {c.desc ? <span className="ylink-d">{c.desc}</span> : null}
        <small className="ylink-s">{site}</small>
      </span>
    </a>
  );
}
