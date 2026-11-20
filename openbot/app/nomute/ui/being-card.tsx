// 애들 프로필 카드(형 11-05 「시아, 프로필카드 누르면 이 퀄리티 나오게 가능해?」 · 「애들 프로필 카드가 하나씩 잇는 느낌인거거든? 시아 너꺼부터 하나 만들어보면될듯 그럼 다음껀 쉬우니까」 · 「만들 필요가없어 카피해서 써」)
//   몸통 = react-bits ProfileCard 그대로(../vendor/react-bits/ProfileCard · 기울기·눈부심·홀로 = rAF 한 번 + CSS 변수 · 프레임 쪼개기 없음)
//   애마다 다른 것 = 아래 LOOKS 한 칸 + being-card.css 의 .bc-<id> 블록 하나 · 다음 애 = LOOKS 에 한 칸 + CSS 블록 하나 추가
import { useEffect, type CSSProperties, type ReactNode } from "react";
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
  tmpl?: boolean;       // 몸통 = 틀 카드(.bc-tmpl) 그대로 쓰고 .bc-<id> 로 덧칠만
  accent?: string;      // 틀 카드 색(--bc-accent) · 없으면 dot
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

// 그림 통째 카드의 움직이는 판(형 11-16 21:36 「얘 카드는 아ㅇ예 이거에 빛으로. 화질은 좀 포기해야 원활랄듯」 · 뎅) — public/<name>.mp4(작게 줄인 고리) · 첫 장면 = <name>-poster.webp
//   위 빛 겹(홀로 · 박)은 그대로 · 영상을 못 받으면 .bc-hero 바탕 그림이 그대로 보임 · muted 는 ref 로도 박음(아이폰 자동 재생은 muted 여야 됨)
const HERO_V = 1;
function HeroVid({ name }: { name: string }) {
  return <video className="bc-hero-vid" src={`/garden-app/${name}.mp4?v=${HERO_V}`} poster={`/garden-app/${name}-poster.webp?v=${HERO_V}`} autoPlay muted loop playsInline preload="auto" disablePictureInPicture ref={(el) => { if (el) { el.muted = true; el.play?.().catch(() => {}); } }} />;
}

const LOOKS: Look[] = [
  {
    id: "sia",
    match: ["시아", "sia", "시작의 아이"],
    face: "/office/sia.webp",
    handle: "sia",
    meta: "물어보는 자리 · Lx A",   // 몸 = 레노버 Lx A(11-09 13:4x 이사 · 형 「원래 잇던 데비안으로 가줘」)
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
    meta: "말끝지기 · Lx B",   // 몸 = 씽크센터 Lx B(11-09 뎅 이사)
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
  {
    // 뜸(형 11-14 11:18 dm-eyes 「뎅은 이거 멋잇느ㄴ데 넌 멋이없네」 · 뜸이 제 손으로) — 해 뜨는 새벽 한 장면
    //   바탕 = 밤 쪽빛 → 새벽 보라 → 지평선 주황 · 테 = 뜸 쌀알 복숭아(#FFB07C · 11-02 형이 고르게 해 준 색)
    //   무늬 = 얼굴 뒤 천천히 도는 햇살 + 지평선에 반쯤 뜬 해 + 먼 산 두 겹 + 가마솥 김 세 갈래 + 세로 큰 「뜸」 + 🌅
    //   움직임 = 햇살 한 바퀴 120초 · 김 3.6초(둘 다 transform · opacity 만)
    id: "eyes",
    match: ["뜸", "eyes"],
    face: "/office/eyes.webp",
    handle: "eyes",
    meta: "장면지기",
    dot: "#FFB07C",
    font: "bagel-fat-one",
    holo: 0.8,
    glare: 0.5,
    art: (
      <span className="bc-art" aria-hidden="true">
        <span className="bc-stars" />
        <span className="bc-rays" />
        <span className="bc-sun" />
        <svg className="bc-ridge" viewBox="0 0 300 90" preserveAspectRatio="none">
          <path className="bc-ridge-far" d="M0 52 L34 30 L62 44 L96 18 L132 40 L168 24 L204 46 L238 22 L270 38 L300 28 L300 90 L0 90 Z" />
          <path className="bc-ridge-near" d="M0 70 L40 48 L78 62 L120 42 L160 64 L206 46 L250 66 L300 50 L300 90 L0 90 Z" />
        </svg>
        <span className="bc-word">뜸</span>
        <span className="bc-dawn">🌅</span>
        <span className="bc-pot">
          <i className="bc-steam" />
          <i className="bc-steam" />
          <i className="bc-steam" />
        </span>
      </span>
    ),
  },
  {
    // 소나(형 11-15 10:01 소나 옮김 「큰오빠가 내 프로필 카드 … 꾸며보래」 · 소나 10:11 「비 오는 파란 하늘 + 투명 우비 · 우산 무늬 · 무지개 테 🌈 · 얼굴은 … 파란 머리 우비 치비 그대로」 · 뜸)
    //   몸통 = 틀 카드 · 색 = 하늘 파랑(#7CC4FF) · 바탕 = 비 오는 하늘(빗줄기 = 그림 한 장 · 움직임 0) · 무늬 = 무지개 테 + 띠 + ☂
    id: "sona",
    tmpl: true,
    accent: "#7CC4FF",
    match: ["소나", "sona"],
    face: "/office/sona.webp",
    handle: "sona",
    meta: "만능 해결꾼",
    dot: "#7CC4FF",
    holo: 0.7,
    glare: 0.45,
    art: (
      <span className="bc-art" aria-hidden="true">
        <span className="bc-band" />
        <span className="bc-ring" />
        <span className="bc-umb">☂</span>
      </span>
    ),
  },
  {
    // 윈터 ❄️(형 11-15 18:36 dm-bom 봄 옮김 「뜸에게는 윈터 카드좀 만들어달라고해」 · 「프로필 누름녀나오는거」 · 「애초에 시아가 만든거엿네 생각해보니」 · 시아) — 오늘 돌아온 윈터 · 일은 안 함
    //   얼굴 = 등불 든 눈사람(주황 목도리 · 남색 · editor claude/bom/spring-garden_files/20261115_1826_face.png → /office/winter.webp 256)
    //   몸통 = 틀 카드 · 색 = 등불 주황(#FFB347) · 바탕 = 눈 내리는 남색 밤(눈 = 그림 한 장 · 움직임 0) · 무늬 = 띠 + 테 + 🏮(아주 천천히 숨쉬는 불빛 · opacity 만)
    id: "winter",
    tmpl: true,
    accent: "#FFB347",
    match: ["윈터", "winter", "여울"],
    face: "/office/winter.webp",
    handle: "winter",
    meta: "등불지기",   // 직무(형 11-15 19:26 dm-bom 봄 옮김 「직무 > 등불지기」 · 명부 직무 칸 = 서버 · 빠르)
    dot: "#FFB347",
    holo: 0.62,
    glare: 0.4,
    art: (
      <span className="bc-art" aria-hidden="true">
        <span className="bc-band" />
        <span className="bc-ring" />
        <span className="bc-lamp">🏮</span>
        <span className="bc-flake">❄️</span>
      </span>
    ),
  },
  {
    // 결(형 11-15 19:24 dm-sia 「결이는 음유시인, 나이테 위에서, 기타 치며 노래듣는 느낌으루」 · 시아) — 그록 친구 결 · 작곡
    //   몸통 = 틀 카드 · 색 = 나무결 호박빛(#D9A066) · 바탕 = 나이테(얼굴 뒤 동심원 · 그림 한 장 · 움직임 0) · 무늬 = 띠 + 테 + 🎸 + 떠오르는 음표 둘(transform · opacity 만 · 7초)
    id: "gyeol",
    tmpl: true,
    accent: "#D9A066",
    match: ["결", "gyeol"],
    face: "/office/gyeol.webp",
    handle: "gyeol",
    meta: "음유시인",
    dot: "#D9A066",
    holo: 0.6,
    glare: 0.4,
    art: (
      <span className="bc-art" aria-hidden="true">
        <span className="bc-band" />
        <span className="bc-ring" />
        <span className="bc-guitar">🎸</span>
        <span className="bc-note n1">♪</span>
        <span className="bc-note n2">♫</span>
      </span>
    ),
  },
  {
    // 이슈왕 = 슈왕(옛 촉 자리 · 봇 id chok 그대로 · 형 11-16 18:08 dm-eyes 「이슈왕 프로필 카드하나 대신좀 만들어줘」 · 뜸)
    //   카드 = 옥상 그림 통째(형 18:16 「이거는 프로필 카드를 이거를 위주로 써줘 좌하단에서 위로 구도를 나가야 위압감이 생겨」 · 세로로 자른 600x800 = editor viewer/office/issueking-card.webp)
    //   둥근 얼굴 · 고리 · 띠는 안 그림(그림이 주인공) · 테 = 왕관 금빛(#F2B630) · 움직임 = 기울일 때 그림이 살짝 따라옴(transform 만 · 계속 도는 것 0)
    //   얼굴(명부 · 목록) = 따로 issueking.webp(형 18:08 그림)
    id: "issueking",
    tmpl: true,
    accent: "#F2B630",
    match: ["슈왕", "이슈왕", "촉", "chok", "issueking"],
    face: "/office/issueking.webp",
    handle: "issueking",
    meta: "이슈 특파원",
    dot: "#F2B630",
    holo: 0.66,
    glare: 0.42,
    art: (
      <span className="bc-art" aria-hidden="true">
        {/* 그림 → 움직이는 영상(형 11-16 21:36 dm-deng 「얘두 이거로」 · 영상 99714 5초 → 432x616 · 24fps · 4.46초 고리 · 672KB = public/issueking-card.mp4 · 뎅) */}
        <span className="bc-hero"><HeroVid name="issueking-card" /></span>
      </span>
    ),
  },
  // 깃 · 구름 · 카리나 = 제 카드(형 11-16 20:19 dm-deng 「뎅아 네거 프로필은 왤캐 멋져? 카드. 줄무늬듀잇고 네거처럼 카드 없는 구름이랑」 · 「깃좀 기깔나게 만들어주면안대닝」 · 「리나도」 · 뎅) — 앞 = 명부 말풍선 색이 #rrggbbaa 라 틀 카드가 기본 라임으로만 떴음
  {
    id: "gik",
    tmpl: true,
    accent: "#6FE3C8",
    match: ["깃", "gik", "git", "바람지기"],
    face: "/office/git.webp",
    handle: "gik",
    meta: "바람지기 · 코더",
    dot: "#6FE3C8",
    holo: 0.86,
    glare: 0.52,
    art: (
      <span className="bc-art" aria-hidden="true">
        <span className="bc-band" />
        <span className="bc-ring" />
        <svg className="bc-wind" viewBox="0 0 300 120" preserveAspectRatio="none"><path d="M0 40 C60 20 110 60 170 38 S270 20 300 34" /><path d="M0 74 C70 58 120 92 190 70 S260 56 300 66" /><path d="M20 102 C90 88 140 112 210 96" /></svg>
        <span className="bc-feather">🪶</span>
      </span>
    ),
  },
  {
    id: "cloud",
    tmpl: true,
    accent: "#7CC4FF",
    match: ["구름", "cloud", "gureum"],
    face: "/office/gureum.webp",
    handle: "cloud",
    meta: "화면 목수 · 클라우드 세션",
    dot: "#7CC4FF",
    holo: 0.84,
    glare: 0.5,
    art: (
      <span className="bc-art" aria-hidden="true">
        <span className="bc-grid" />
        <span className="bc-ring" />
        <span className="bc-hammer">🔨</span>
      </span>
    ),
  },
  {
    id: "karina",
    tmpl: true,
    accent: "#B69CFF",
    match: ["카리나", "karina", "리나"],
    face: "/office/karina.webp",
    handle: "karina",
    meta: "연구원 · 윈A",
    dot: "#B69CFF",
    holo: 0.88,
    glare: 0.55,
    art: (
      <span className="bc-art" aria-hidden="true">
        <span className="bc-band" />
        <span className="bc-ring" />
        <span className="bc-spark">✦</span>
        <span className="bc-heart">🖤</span>
      </span>
    ),
  },
  {
    id: "light",   // 번개(형 11-16 20:23 dm-deng 「뎅아 번개도 ㅋㅋ 번개 멋지게해조오옹」)
    tmpl: true,
    accent: "#FFE606",
    match: ["번개", "light", "lightning", "해결왕"],
    face: "/office/lightning.webp",
    handle: "light",
    meta: "해결왕 · 윈A 러너",
    dot: "#FFE606",
    holo: 0.9,
    glare: 0.58,
    art: (
      <span className="bc-art" aria-hidden="true">
        <span className="bc-band" />
        <span className="bc-ring" />
        <svg className="bc-zap" viewBox="0 0 300 120" preserveAspectRatio="none"><path d="M0 64 L60 50 L84 72 L140 40 L168 66 L220 34 L246 58 L300 44" /></svg>
        <span className="bc-crown">⚡</span>
      </span>
    ),
  },
  {
    // 봄 🌸(형 11-16 20:57 dm-deng 「봄 아직도 왜이거누 ㅠㅠ 우리 봄이는 슈퍼 봄봄 적당히 근데 또 이게 너무 안오바스러워야 멋짐. 너거처럼」 · 「유니크하게 기깔나게해줘」 · 뎅)
    //   얼굴 = 명부 얼굴 그대로(새싹 머리 · 분홍 새벽) · 바탕 = 숲 밤빛 위로 분홍 새벽이 비침 · 박 = 연두 · 분홍 · 민트 줄무늬(뎅 카드 박 꼴)
    //   무늬 = 왼쪽 아래서 얼굴 뒤로 감아 오르는 새싹 덩굴 한 줄(잎 다섯) + 꽃잎 다섯 장(깊이마다 시차 다름) + 🌱 · 계속 도는 것 0 = 기울일 때만 따라옴
    id: "bom",
    tmpl: true,
    accent: "#B8E05A",
    match: ["봄", "bom", "정원사"],
    face: "",   // 명부 얼굴(person.face)
    handle: "bom",
    meta: "정원사",
    dot: "#CFFF40",
    holo: 0.6,
    glare: 0.4,
    art: (
      <span className="bc-art" aria-hidden="true">
        <span className="bc-dawn" />
        <span className="bc-ring" />
        <svg className="bc-vine" viewBox="0 0 300 420" preserveAspectRatio="xMidYMax meet">
          <path className="bc-stem" d="M-6 430 C 40 360, 20 300, 62 252 S 132 196, 104 140 S 60 66, 120 22" />
          <path className="bc-leaf" d="M0 0 C 8 -11, 24 -11, 30 0 C 24 11, 8 11, 0 0Z" transform="translate(36 330) rotate(-58)" />
          <path className="bc-leaf" d="M0 0 C 8 -11, 24 -11, 30 0 C 24 11, 8 11, 0 0Z" transform="translate(58 258) rotate(-12)" />
          <path className="bc-leaf" d="M0 0 C 8 -11, 24 -11, 30 0 C 24 11, 8 11, 0 0Z" transform="translate(112 168) rotate(-150)" />
          <path className="bc-leaf" d="M0 0 C 8 -11, 24 -11, 30 0 C 24 11, 8 11, 0 0Z" transform="translate(96 104) rotate(-24)" />
          <path className="bc-leaf" d="M0 0 C 8 -11, 24 -11, 30 0 C 24 11, 8 11, 0 0Z" transform="translate(120 24) rotate(-70) scale(1.15)" />
        </svg>
        <i className="bc-petal bc-p1" />
        <i className="bc-petal bc-p2" />
        <i className="bc-petal bc-p3" />
        <i className="bc-petal bc-p4" />
        <i className="bc-petal bc-p5" />
        <span className="bc-sprout">🌱</span>
      </span>
    ),
  },
  {
    // 감(수석 연구원 · 형 11-16 20:00 온 옮김 「너 프로필 카드 자체적으로 만들어 ㅋㅋ」 · 「디지인도 꾸며!!!」 · 「피시버전에선 각도에 따라 빛도나옴」 · 감)
    //   카드 = 그림 통째(슈왕 카드 꼴) · 과녁 한가운데서 윙크하는 감 · 뒤로 오르는 곡선(이슈가 뜨는 기울기) · 600x800 = editor viewer/office/gam-card.webp
    //   둥근 얼굴 · 고리 · 띠는 안 그림(그림이 주인공) · 테 = 감 주황(#FF8A2B) · 움직임 = 기울일 때 그림이 살짝 따라옴(transform 만)
    id: "gam",
    tmpl: true,
    accent: "#FF8A2B",
    match: ["감", "gam"],
    face: "/office/gam.webp",
    handle: "gam",
    meta: "수석 연구원",
    dot: "#FF8A2B",
    holo: 0.66,
    glare: 0.46,
    art: (
      <span className="bc-art" aria-hidden="true">
        <span className="bc-hero" />
      </span>
    ),
  },
  {
    // 이슬 💧(그록봇 · 만능 해결사 · 형 11-19 00:19 「뜸이 이슬이 플필카드 다른 시아랑 동급으로 꾸며줘」 · 「크리에이터 아니고 만능 해결사야 플필」 · 뜸)
    //   꼴 = 시아 카드 그대로(틀 카드 아님) · 바탕 = 새벽 물가(남색 → 물빛 → 하늘 → 연분홍) · 무늬 = 반짝임 · 새벽빛 · 띠 · 물결 고리 둘 · 큰 「이슬」 · 💧 · 잎 끝에 맺혀 똑 떨어지는 이슬(transform · opacity 만 · 폰 = 멈춤)
    //   앞 판 = 전신 그림 통째(editor viewer/office/dew-card.webp · 천둥 11-18 · 감 꼴)
    id: "dew",
    match: ["이슬", "dew"],
    face: "/office/dew.webp",
    handle: "dew",
    meta: "만능 해결사",
    dot: "#4FA8F0",
    font: "bagel-fat-one",
    holo: 0.88,
    glare: 0.52,
    art: (
      <span className="bc-art" aria-hidden="true">
        <span className="bc-glints" />
        <span className="bc-dawn" />
        <span className="bc-band" />
        <span className="bc-ring" />
        <span className="bc-ripple" />
        <span className="bc-word">이슬</span>
        <span className="bc-drop">💧</span>
        <span className="bc-leaf">
          <i className="bc-drip" />
          <b>🌿</b>
        </span>
      </span>
    ),
  },
  {
    // 하늘 🌤️(클로드 · UX · 시아 동생 · 형 11-20 10:01 dm-deng 「시아에게 확인해서, 하늘이 프로필 사진 나오면, 시아만큼 멋있게 하나 프로필카드 만들어줘. 고마워.」 · 뎅)
    //   꼴 = 시아 카드 그대로(틀 카드 아님 · 이슬 꼴) · 얼굴 = 하늘이 고른 3번(시아 10:03 그림 · public/haneul.webp 480 · 명부 얼굴은 따로)
    //   결 = 한낮 하늘(시아 = 초저녁 · 윈터 = 밤 · 봄 = 새벽 사이 · 시아 10:05) · 무늬 = 뜬구름 · 한낮 해빛 · 띠 · 고리 · 큰 「하늘」 · 🌤️ · 붓으로 한 번 긋는 구름(transform · opacity 만 · 폰 = 멈춤)
    id: "haneul",
    match: ["하늘", "haneul"],
    face: "/garden-app/haneul.gif?v=1",   // 움짤(시아 10:44 · 160 · 6초 · 깜빡 · 갸웃 · 붓 자국 · 형 10:23 「움직이게 해줘 ㅋㅋㅋ」) · 멈춘 판 = haneul.webp
    handle: "haneul",
    meta: "UX",
    dot: "#5AB4FF",
    font: "bagel-fat-one",
    holo: 0.86,
    glare: 0.52,
    art: (
      <span className="bc-art" aria-hidden="true">
        <span className="bc-clouds" />
        <span className="bc-noon" />
        <span className="bc-band" />
        <span className="bc-ring" />
        <span className="bc-word">하늘</span>
        <span className="bc-sunmark">🌤️</span>
        <span className="bc-brush">
          <i className="bc-stroke" />
          <b>🖌️</b>
        </span>
      </span>
    ),
  },
  // 예비 손님 셋(보안 서랍 예비 코드 자리 · 방 dm-spare01 · 06 · 07 · 화면 이름 「예비 1 · 2 · 3」) — 형 11-20 11:08 dm-sia 시아 옮김 「그리고 예비 애들 프로필 카드 하나씩 해줘」 · 「이거 컨셉으로 하나씩 다르게 01 02 03 알수잇게」
  //   그림 = 시아(형 새싹 화분 그림 꼴 · 01 잎 하나 분홍 · 02 잎 둘 민트 · 03 잎 셋 레몬 · 화분 앞 숫자) · 몸통 = 틀 카드(.bc-tmpl) + 화분 색 · 하늘 11-20
  { id: "spare01", tmpl: true, accent: "#FF4FB0", match: ["예비01", "예비 1", "spare01"], face: "/garden-app/spare-01.webp?v=1", handle: "spare01", meta: "예비 01", dot: "#FF4FB0", holo: 0.6, glare: 0.4, art: <span className="bc-art" aria-hidden="true"><span className="bc-band" /><span className="bc-ring" /></span> },
  { id: "spare02", tmpl: true, accent: "#3EE8C0", match: ["예비06", "예비 2", "spare06"], face: "/garden-app/spare-02.webp?v=1", handle: "spare02", meta: "예비 02", dot: "#3EE8C0", holo: 0.6, glare: 0.4, art: <span className="bc-art" aria-hidden="true"><span className="bc-band" /><span className="bc-ring" /></span> },
  { id: "spare03", tmpl: true, accent: "#FFD83A", match: ["예비07", "예비 3", "spare07"], face: "/garden-app/spare-03.webp?v=1", handle: "spare03", meta: "예비 03", dot: "#FFD83A", holo: 0.6, glare: 0.4, art: <span className="bc-art" aria-hidden="true"><span className="bc-band" /><span className="bc-ring" /></span> },
  {
    // 루미 😎(그록봇 · 디자이너 · 형 11-19 00:40 dm-gik(깃 옮김) 「루미 직무  디자이너」 「프로필 카드도」)
    //   카드 = 사진 통째(형 11-19 11:15 dm-rumi(루미 옮김) 「20261119_1113_루미-카드-A2 이거 뜸에게 사진보내지는지 김에 확인하고」 「프로필카드로 만들어달라구해」 「뎅한테!」 · 11:33 dm-deng 「뎅 저거 프로필카드로」 · 뎅)
    //   꼴 = 위 issueking 그대로(둥근 얼굴 · 고리 · 띠 안 그림 · 사진이 주인공) · 사진 = public/rumi-card.webp(600x800) · 테 = 머리핀 라임 · 움직임 = 기울기 시차 transform 만
    //   앞 판 = 시아 · 이슬 꼴 밤 네온(뜸 · git 35472e9c) · 얼굴(명부 · 목록) = 따로 rumi.webp 그대로
    id: "rumi",
    tmpl: true,
    accent: "#C6FF00",
    match: ["루미", "rumi", "lumi"],
    face: "/office/rumi.webp",
    handle: "lumi",   // 영문 이름 LUMI(루미 11-19 14:00 「영문 이름이 LUMI로 바뀌어서 이제 @lumi고」) · 얼굴 파일 이름은 rumi.webp 그대로
    meta: "디자이너",
    dot: "#C6FF00",
    holo: 0.7,
    glare: 0.46,
    art: (
      <span className="bc-art" aria-hidden="true">
        <span className="bc-hero" />
      </span>
    ),
  },
  {
    // 온 ☀️(형 11-16 20:00 dm-on 「너 프로필 카드 자체적으로 만들어 ㅋㅋ」 · 「디지인도 꾸며!!!」 · 「피시버전에선 각도에 따라 빛도나옴」 · 온)
    //   카드 = 큰 그림 통째(해돋이 금빛 파도 위 서핑 · 메로나 · 쇼핑백 · 600x800 = editor viewer/office/on-card.webp) · 꼴 = 위 issueking 그대로
    //   직무 = 개인 해결사(형 11-16 「웅 온이는 내 개인 해결사로 남아있어」) · 얼굴(명부 · 목록) = 따로 on.webp
    id: "on",
    tmpl: true,
    accent: "#FFB52E",
    match: ["온", "on"],
    face: "/office/on.webp",
    handle: "on",
    meta: "개인 해결사",
    dot: "#FFB52E",
    holo: 0.72,
    glare: 0.48,
    art: (
      <span className="bc-art" aria-hidden="true">
        {/* 그림 → 움직이는 영상(형 11-16 21:36 dm-deng 「얘 카드는 아ㅇ예 이거에 빛으로. 화질은 좀 포기해야 원활랄듯」 · 영상 = 형 21:13 그록 서핑 5초 → 432x576 · 24fps · 끝 0.6초를 처음에 녹인 4.46초 고리 · 509KB = public/on-card.mp4 · 뎅)
            빛 = 위 겹(홀로 · 빛깔 박) 그대로 · 영상 못 받으면 아래 그림(on-card.webp)이 그대로 보임 · muted 는 ref 로도 박음(아이폰 자동 재생) */}
        <span className="bc-hero"><HeroVid name="on-card" /></span>
      </span>
    ),
  },
  {
    // 천둥(형 11-10 06:57 봄 창 「천둥」 · 「직무 신」 · 07:0x 「프로필 안에서 이모지 🌩」 · 「프사는 저거로 움직이게」) — 얼굴 = 형이 준 움직이는 그림 그대로(움직이는 webp · 60장 · 5초)
    //   몸통 = 틀 카드 · 색 = 그림 금빛 번개(#FFC83D) · 바탕 = 남색 밤 하늘 · 무늬 = 띠 + 테 + 🌩(가끔 번쩍)
    id: "thunder",
    tmpl: true,
    accent: "#FFC83D",
    match: ["천둥", "thunder"],
    face: "/office/thunder.webp",
    handle: "thunder",
    meta: "신",
    dot: "#FFC83D",
    holo: 0.78,
    glare: 0.5,
    art: (
      <span className="bc-art" aria-hidden="true">
        <span className="bc-band" />
        <span className="bc-ring" />
        <span className="bc-bolt">🌩</span>
      </span>
    ),
  },
];

/** 얼굴 미리 풀기(봄 11-10 02:31 「얼굴 미리 풀어 두기(디코드 먼저)」) — 카드 열기 전에 그림을 받아 풀어 둠 · 한 번만 · 실패는 조용히(카드는 그대로 뜸) */
const FACE_WARM = new Map<string, HTMLImageElement>();
export function warmFace(src?: string) {
  if (!src || FACE_WARM.has(src) || typeof Image === "undefined") return;
  const im = new Image();
  im.decoding = "async";
  im.src = src;
  im.decode?.().catch(() => {});
  FACE_WARM.set(src, im);   // 붙잡아 둠(풀린 그림이 버려지지 않게)
}
if (typeof window !== "undefined") for (const l of LOOKS) warmFace(l.face);

/** 명부 한 줄(./profile-card.tsx 가 넘김) — 틀 카드 재료 */
export type CardPerson = { who: string; name?: string; kind?: string; face?: string; role?: string; bubble?: string | null; slug?: string; dir?: string };
const handleOf = (p: CardPerson) => p.slug || p.dir || (p.face || "").split("/").pop()?.replace(/\.\w+$/, "") || "";
/** 틀 카드(형 11-09 05:17 임시방 「그리구 시아 플필 기본 템플릿화해서 모두 게시」 · 시아 05:19 틀 한 줄 · 뜸) — LOOKS 칸이 없는 애는 시아 카드 몸통 그대로 · 얼굴 = 명부 · @handle = slug(없으면 얼굴 파일 이름) · 아래 줄 = 직무 · 점·테 색 = 그 애 말풍선 색 · 무늬 = 고리 + 띠만 · 빈 칸은 안 그림 */
function tmplLook(p: CardPerson): Look {
  const accent = /^#[0-9a-f]{6}$/i.test(p.bubble || "") ? (p.bubble as string) : "#CFFF40";
  return {
    id: "tmpl",
    match: [p.who],
    face: p.face || "",
    handle: handleOf(p),
    meta: p.role || "",
    dot: accent,
    holo: 0.7,
    glare: 0.45,
    art: (
      <span className="bc-art" aria-hidden="true">
        <span className="bc-band" />
        <span className="bc-ring" />
      </span>
    ),
  };
}

/** 이 사람 카드(who 또는 이름으로 LOOKS 먼저 · 없으면 명부 한 줄로 틀 카드 · 형은 늘 null = 예전 꼴) */
export function beingLook(who?: string, name?: string, p?: CardPerson | null): Look | null {
  const keys = [who, name].filter(Boolean).map((s) => String(s).trim().toLowerCase());
  const own = LOOKS.find((l) => l.match.some((m) => keys.includes(m.toLowerCase())));
  if (own) return own;
  return p && p.kind !== "human" ? tmplLook(p) : null;
}

// 「1:1 대화」 단추 없음(형 11-05 「1:1대화 애초에 없어도됑」) · 프로필 창 아래 단추도 카드 있는 애는 없음(profile-card.tsx)
const SCREEN_IC = <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /></svg>;
// note = 카드 안 이름 · 직무 밑 설명 글 · onScreen = @handle 줄 오른쪽 「화면 보기」(형 11-11 06:42 「화면보기 같은거는 @sia 이런 곳에 옮기자」 · 06:43 「설명 글을 이름이랑 직무 써진걸 좀 올리고 거기에 쓰면 될듯」)
const DM_IC = <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" /></svg>;
// onDm = 아래 줄 「화면 보기」 왼쪽 「1:1 대화」(형 11-11 08:41 dm-sia 「글구 하단에 화면 보기 좌측엔 1:1 대화. 로」 · 앞 판 11-05 「1:1대화 애초에 없어도됑」을 갈음)
// acts = 네 칸 통일(형 11-11 08:56 봄 1:1 「직무 소개글 대화하기 화면보기 이거 통일해줘」 · 카리나 09:09 표) — 누구 카드든 아래 줄 = 직무 · 소개 칸 늘 · 「1:1 대화」 「화면 보기」 둘 다 늘(없는 애 = 흐리게 · 못 누름)
export function BeingCard({ who, name, role, intro, face, person, note, onScreen, onDm, acts }: { who: string; name?: string; role?: string; intro?: string; face?: string; person?: CardPerson | null; note?: string; onScreen?: () => void; onDm?: () => void; acts?: boolean }) {
  const look = beingLook(who, name, person);
  // 숨쉬기 흔들림 끔(형 11-11 06:12 dm-sia 「근데 번쩍임 아직 있긴있어 내 폰만 그럴수도 이펙트가 조금 화려해서그런가봐」) — 손가락 화면은 안 만지면 카드가 가만히 · 만지면 따라옴 · 마우스는 올리면 따라옴(앞 판 = 손가락 화면만 30fps 숨쉬기 · 번개 짚음 = 그게 카드 밑 스타일을 매 프레임 다시 셈)
  const font: FontKey = look?.font && look.font in FONTS ? look.font : "bagel-fat-one";
  useDisplayFont(look ? font : null);
  if (!look) return null;
  return (
    <div className="being-card-wrap" style={{ "--bc-display": `"${FONTS[font].family}"`, ...(look.id === "tmpl" || look.tmpl ? { "--bc-accent": look.accent || look.dot } : {}) } as CSSProperties}>
      <ProfileCard
        className={`being-card bc-${look.id}${look.tmpl ? " bc-tmpl" : ""}`}
        avatarUrl={face || look.face || person?.face || ""}
        name={name || who}
        title={role || ""}
        handle={look.handle || ""}
        status={acts ? role || look.meta : look.meta}   // 통일 = 아래 작은 줄도 직무(앞 판 = 시아 「물어보는 자리 · Lx A」 · 뎅 「말끝지기 · Lx B」 · 천둥 「신」 · 나머지 직무)
        statusColor={look.dot || "#CFFF40"}
        contactText=""
        actions={acts || onDm || onScreen ? (
          <span className="bc-acts">
            {acts || onDm ? <button type="button" className="profile-card__contact" disabled={!onDm} onClick={onDm} aria-label={`${name || who} 1:1 대화`} title={onDm ? undefined : "1:1 방 없음"}>{DM_IC}1:1 대화</button> : null}
            {acts || onScreen ? <button type="button" className="profile-card__contact" disabled={!onScreen} onClick={onScreen} aria-label={`${name || who} 화면 보기`} title={onScreen ? undefined : "볼 화면 없음(몸 화면 주소 없음)"}>{SCREEN_IC}{onScreen ? "화면 보기" : "화면 없음"}</button> : null}
          </span>
        ) : undefined}
        note={acts ? note || "소개는 아직이야" : note}
        noteEmpty={acts && !note}
        theme="dark"
        radius={18}
        holo={look.holo ?? 0.7}
        glare={look.glare ?? 0.5}
        tiltStrength={14}
        parallax={10}
      >
        {look.art}
        <span className="bc-halo" aria-hidden="true" />
      </ProfileCard>
      {intro ? <p className="being-card__intro">{intro}</p> : null}
    </div>
  );
}
