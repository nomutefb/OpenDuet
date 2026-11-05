// 애들 프로필 카드(형 11-05 「시아, 프로필카드 누르면 이 퀄리티 나오게 가능해?」 · 「애들 프로필 카드가 하나씩 잇는 느낌인거거든? 시아 너꺼부터 하나 만들어보면될듯 그럼 다음껀 쉬우니까」 · 「만들 필요가없어 카피해서 써」)
//   몸통 = react-bits ProfileCard 그대로(../vendor/react-bits/ProfileCard · 기울기·눈부심·홀로 = rAF 한 번 + CSS 변수 · 프레임 쪼개기 없음)
//   애마다 다른 것 = 아래 LOOKS 한 칸 + being-card.css 의 .bc-<id> 블록 하나 · 다음 애 = LOOKS 에 한 칸 + CSS 블록 하나 추가
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import ProfileCard from "../vendor/react-bits/ProfileCard/ProfileCard";
import "./being-card.css";

type Look = {
  id: string;           // CSS 꼬리표 → .bc-<id> (being-card.css 에 팔레트·모양)
  match: string[];      // who 또는 이름 중 하나라도 같으면 이 카드
  face: string;         // 카드 그림(앱이 내주는 경로 · 꽉 채움 = 정사각 큰 판 · public/being/<id>.webp → /office-app/being/<id>.webp)
  handle?: string;      // 아래 작은 줄 앞(@handle)
  meta: string;         // 아래 작은 줄 뒤(점 + 글)
  dot?: string;         // 아래 작은 줄 점 색
  holo?: number;        // 홀로 세기 0~1
  glare?: number;       // 눈부심 세기 0~1
  font?: FontKey;       // 카드 글 전부(이름·직무·작은 줄·큰 글자) 글꼴(아래 FONTS · 없으면 black-han-sans)
  badge?: ReactNode;    // 이름 띠 오른쪽 위 동그라미 안
  mark?: ReactNode;     // 작은 줄 오른쪽 작은 표지
  art?: ReactNode;      // 그림 뒤(그림 아래 페이드 자리에 비침)
  over?: ReactNode;     // 그림 위 무늬(밝게 섞기 = 하늘에만 비침 · 큰 글자)
};

// 이름 글꼴 후보(형 11-05 「글자 폰트만 들어가면 지릴거같은디」) — 한글 되는 Google Fonts 셋 · 카드가 처음 뜰 때 그 글꼴 <link> 하나만 붙임
//   swap = 글꼴 오기 전엔 시스템 글꼴로 먼저 보임 · 못 받으면(오프라인) 시스템 글꼴 그대로
const FONTS = {
  "black-han-sans": { family: "Black Han Sans", q: "Black+Han+Sans" },
  "do-hyeon": { family: "Do Hyeon", q: "Do+Hyeon" },
  "bagel-fat-one": { family: "Bagel Fat One", q: "Bagel+Fat+One" },
} as const;
export type FontKey = keyof typeof FONTS;

function useDisplayFont(key: FontKey | null) {
  useEffect(() => {
    if (!key || typeof document === "undefined") return;
    const id = `bc-font-${key}`;
    if (document.getElementById(id)) return;
    if (!document.getElementById("bc-font-pre")) {
      const pre = document.createElement("link");
      pre.id = "bc-font-pre";
      pre.rel = "preconnect";
      pre.href = "https://fonts.gstatic.com";
      pre.crossOrigin = "anonymous";
      document.head.appendChild(pre);
    }
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${FONTS[key].q}&display=swap`;
    document.head.appendChild(link);
  }, [key]);
}

// 꼴(형 11-05 「그 처음에 내가 준 시안 더 따라해버려」 · 「뭔가 얍실하게」) = 형이 준 영상 속 트레이딩 카드 두 장:
//   그림이 카드를 꽉 채움 · 뒤에 굵은 색 도형 · 아래 얇은 짙은 띠(굵은 이름 + 작은 줄) · 맨 아래 작은 줄 + 작은 표지 · 테는 얇은 종이색
const LOOKS: Look[] = [
  {
    id: "sia",
    match: ["시아", "sia", "시작의 아이"],
    face: "/office-app/being/sia.webp",
    handle: "sia",
    meta: "물어보는 자리 · VM sia",
    dot: "#CFFF40",
    font: "bagel-fat-one",   // 형 11-05 「폰트는 베이글로 할게」
    holo: 0.75,
    glare: 0.5,
    badge: <span className="bc-badge-star">⭐</span>,
    mark: (
      <span className="bc-bowl">
        <i className="bc-steam" />
        <i className="bc-steam" />
        <i className="bc-steam" />
        <b>🍚</b>
      </span>
    ),
    art: (
      <span className="bc-art" aria-hidden="true">
        <span className="bc-stars" />
      </span>
    ),
    over: (
      <span className="bc-over" aria-hidden="true">
        <span className="bc-disc bc-disc--coral" />
        <span className="bc-disc bc-disc--gold" />
        <span className="bc-word">시<br />아</span>
      </span>
    ),
  },
];

/** 이 사람 카드가 있나(who 또는 이름으로) — 없으면 null = 예전 카드 그대로 */
export function beingLook(who?: string, name?: string): Look | null {
  const keys = [who, name].filter(Boolean).map((s) => String(s).trim().toLowerCase());
  return LOOKS.find((l) => l.match.some((m) => keys.includes(m.toLowerCase()))) || null;
}

// 「1:1 대화」 단추 없음(형 11-05 「1:1대화 애초에 없어도됑」) · 프로필 창 아래 단추도 카드 있는 애는 없음(profile-card.tsx)
export function BeingCard({ who, name, role, intro, face }: { who: string; name?: string; role?: string; intro?: string; face?: string }) {
  const look = beingLook(who, name);
  // 손가락 화면(마우스 없음)만 숨쉬기 흔들림 · 마우스는 올리면 따라옴
  const [idle] = useState(() => typeof window !== "undefined" && !!window.matchMedia?.("(hover: none)").matches);
  const font: FontKey = look?.font && look.font in FONTS ? look.font : "black-han-sans";
  useDisplayFont(look ? font : null);
  if (!look) return null;
  const nm = name || who;
  return (
    <div className="being-card-wrap" style={{ "--bc-display": `"${FONTS[font].family}"` } as CSSProperties}>
      <ProfileCard
        className={`being-card bc-${look.id}`}
        avatarUrl={face || look.face}
        name=""
        title=""
        showUserInfo={false}
        theme="dark"
        radius={10}
        holo={look.holo ?? 0.7}
        glare={look.glare ?? 0.5}
        tiltStrength={14}
        parallax={10}
        idle={idle}
        overlay={
          <>
            {look.over}
            <span className="bc-scrim" />
            <div className="bc-strip">
              {look.badge ? <span className="bc-badge" aria-hidden="true">{look.badge}</span> : null}
              <div className="bc-plate">
                <h3 className="bc-name">{nm}</h3>
                {role ? <p className="bc-role">{role}</p> : null}
              </div>
              <div className="bc-row">
                <p className="bc-meta" style={{ "--bc-dot": look.dot || "#CFFF40" } as CSSProperties}>
                  {look.handle ? <span className="bc-handle">@{look.handle}</span> : null}
                  <span className="bc-status">{look.meta}</span>
                </p>
                {look.mark ? <span className="bc-mark" aria-hidden="true">{look.mark}</span> : null}
              </div>
            </div>
          </>
        }
      >
        {look.art}
      </ProfileCard>
      {intro ? <p className="being-card__intro">{intro}</p> : null}
    </div>
  );
}
