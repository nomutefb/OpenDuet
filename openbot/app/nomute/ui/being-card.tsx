// 애들 프로필 카드(형 11-05 「시아, 프로필카드 누르면 이 퀄리티 나오게 가능해?」 · 「애들 프로필 카드가 하나씩 잇는 느낌인거거든? 시아 너꺼부터 하나 만들어보면될듯 그럼 다음껀 쉬우니까」 · 「만들 필요가없어 카피해서 써」)
//   몸통 = react-bits ProfileCard 그대로(../vendor/react-bits/ProfileCard · 기울기·눈부심·홀로 = rAF 한 번 + CSS 변수 · 프레임 쪼개기 없음)
//   애마다 다른 것 = 아래 LOOKS 한 칸 + being-card.css 의 .bc-<id> 블록 하나 · 다음 애 = LOOKS 에 한 칸 + CSS 블록 하나 추가
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import ProfileCard from "../vendor/react-bits/ProfileCard/ProfileCard";
import "./being-card.css";

type Look = {
  id: string;           // CSS 꼬리표 → .bc-<id> (being-card.css 에 팔레트·모양)
  match: string[];      // who 또는 이름 중 하나라도 같으면 이 카드
  face: string;         // 얼굴 그림(앱이 내주는 경로)
  handle?: string;      // 아래 줄 굵은 글(@handle)
  meta: string;         // 아래 줄 작은 글(점 + 글)
  dot?: string;         // 아래 줄 점 색
  holo?: number;        // 홀로 세기 0~1
  glare?: number;       // 눈부심 세기 0~1
  font?: FontKey;       // 카드 글 전부(이름·직무·@handle·자리·큰 글자) 글꼴(아래 FONTS · 없으면 bagel-fat-one)
  art: ReactNode;       // 얼굴 뒤 무늬(그림 파일 없이 CSS·이모지)
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

// 뎅 카드 소용돌이(🌀) — 바깥에서 안으로 감기는 한 줄(형 10-30 「뎅 뎅~ 은 뱅글 이어지는 느낌이거든」 · 11-05 「소용돌이는 무한대를 상징하기도하지」) · 그림 파일 없이 SVG 한 줄
const DENG_SPIRAL = (() => {
  const n = 180, turns = 3.25, out: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * turns * 2 * Math.PI, r = 3 + 90 * (i / n);
    out.push(`${(100 + r * Math.cos(t)).toFixed(1)} ${(100 + r * Math.sin(t)).toFixed(1)}`);
  }
  return `M${out.join(" L")}`;
})();

const LOOKS: Look[] = [
  {
    id: "sia",
    match: ["시아", "sia", "시작의 아이"],
    face: "/office/sia.webp",
    handle: "sia",
    meta: "물어보는 자리 · VM sia",
    dot: "#CFFF40",
    font: "bagel-fat-one",   // 형 11-05 「폰트는 베이글로 할게」
    holo: 0.9,
    glare: 0.55,
    art: (
      <span className="bc-art" aria-hidden="true">
        <span className="bc-stars" />
        <span className="bc-sun" />
        <span className="bc-band" />
        <span className="bc-ring" />
        <span className="bc-word">시아</span>
        <span className="bc-star">⭐</span>
        <span className="bc-bowl">
          <i className="bc-steam" />
          <i className="bc-steam" />
          <i className="bc-steam" />
          <b>🍚</b>
        </span>
      </span>
    ),
  },
  {
    id: "deng",
    match: ["뎅", "deng"],
    face: "/office/deng.webp",
    handle: "from_deng",
    meta: "말끝지기 · VM deng",
    dot: "#FFB300",
    font: "bagel-fat-one",
    holo: 0.82,
    glare: 0.5,
    art: (
      <span className="bc-art" aria-hidden="true">
        <span className="bc-rain" />
        <span className="bc-glow" />
        <svg className="bc-swirl" viewBox="0 0 200 200">
          <path d={DENG_SPIRAL} />
        </svg>
        <svg className="bc-trail" viewBox="0 0 300 80" preserveAspectRatio="none">
          <path d="M-10 62 C 50 70, 90 30, 150 44 S 250 70, 286 38" />
          <circle cx="286" cy="38" r="3.2" />
        </svg>
        <span className="bc-word">뎅</span>
        <span className="bc-tilde">~</span>
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
  const font: FontKey = look?.font && look.font in FONTS ? look.font : "bagel-fat-one";
  useDisplayFont(look ? font : null);
  if (!look) return null;
  return (
    <div className="being-card-wrap" style={{ "--bc-display": `"${FONTS[font].family}"` } as CSSProperties}>
      <ProfileCard
        className={`being-card bc-${look.id}`}
        avatarUrl={face || look.face}
        name={name || who}
        title={role || ""}
        handle={look.handle || ""}
        status={look.meta}
        statusColor={look.dot || "#CFFF40"}
        contactText=""
        theme="dark"
        radius={18}
        holo={look.holo ?? 0.7}
        glare={look.glare ?? 0.5}
        tiltStrength={14}
        parallax={10}
        idle={idle}
      >
        {look.art}
      </ProfileCard>
      {intro ? <p className="being-card__intro">{intro}</p> : null}
    </div>
  );
}
