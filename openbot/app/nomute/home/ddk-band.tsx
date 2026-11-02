// 홈 「다 깸」 띠(형 11-02 12:52 「뜸이 만든거 이 칸에 뜨게해줘 영상은 지드라이브 공유 폴더에 올려놧어」 · 14:46 결정 「③ 카드 밖 홈 맨 아래 빈 자리에 한 번만」) —
//   뜸 「다 깸」 고리판(주고받기/20261102_1246_다-깸.mp4 · 11.7초 · 소리 없음 · 끝이 처음으로 이어짐)을 작게 줄인 판 = public/ddk.mp4 · 첫 장면 = public/ddk.jpg ·
//   19:16 형 「2ㅇ 갈색 부분 이름만 나오게해서」 · 「하단 문구는 내가 그냥 한말인데 무슨 예수님이 한말처럼 해서 좀 부담스럽다야」 → 원본 y146~282(해·얼굴·이름 · 끝 글 뺌) + 아래 34줄 = 마지막 갈색 줄을 늘림(네비 뒤로 들어갈 자리) = 640×170 ·
//   카드 밖 맨 아래에 한 번(뉴스 카드마다 아님) · 소리 없이 고리 · public 자리 = 서비스 워커가 안 잡음.
//   이 정적 자리는 Range 를 안 받음(라이브 실측 11-02 「bytes=0-1」 → 200 통째) = 아이폰 사파리가 <video> 를 안 틀 수 있음 → 통째로(204KB) 받아 blob 주소로 틂 · 못 받으면 주소 그대로.
//   뜸이 손본 판을 주고받기에 같은 이름으로 덮으면 → ddk.mp4·ddk.jpg 를 다시 줄여 넣고 V 를 올림.
//   23:17 형 「메인화면 열릴때 영상이 먼저떠서 어색한데 고쳐줘 영상이 좀 더 늦게 떠야해 로딩이 빨라.」 → 자리(640×170)는 처음부터 잡아 두되 안 보임 ·
//   뉴스 카드 첫 판이 품은 화면에 간 뒤(news-feed onShown) 한 박자(LAG) 쉬고 나서야 영상을 받기 시작 · 첫 장면이 그려지면 스르륵(ddk-band.css .is-lit) ·
//   카드가 끝내 안 오면 SLOW 뒤에 혼자 뜸 · 첫 장면 신호가 안 와도(아이폰 등) 받기 시작 뒤 LIT_MAX 면 포스터로 뜸.
import { useEffect, useState } from "react";
import "./ddk-band.css";

const V = 2;
const FILE = `/office-app/ddk.mp4?v=${V}`;
const LAG = 800, SLOW = 6000, LIT_MAX = 1500;
const still = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export function DdkBand({ show }: { show: boolean }) {
  const [go, setGo] = useState(false);
  const [lit, setLit] = useState(false);
  const [src, setSrc] = useState<string>();
  useEffect(() => {
    const t = setTimeout(() => setGo(true), show ? LAG : SLOW);
    return () => clearTimeout(t);
  }, [show]);
  useEffect(() => {
    if (!go) return;
    let url = "", gone = false;
    const t = setTimeout(() => setLit(true), LIT_MAX);
    fetch(FILE)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((b) => { if (gone) return; url = URL.createObjectURL(b); setSrc(url); })
      .catch(() => { if (!gone) setSrc(FILE); });
    return () => { gone = true; clearTimeout(t); if (url) URL.revokeObjectURL(url); };
  }, [go]);
  return (
    <video
      aria-label="뜸 「다 깸」"
      autoPlay={!still()}
      className={lit ? "nm-ddk is-lit" : "nm-ddk"}
      disablePictureInPicture
      loop
      muted
      onLoadedData={() => setLit(true)}
      playsInline
      poster={go ? `/office-app/ddk.jpg?v=${V}` : undefined}
      preload="metadata"
      ref={(v) => {   // React 는 muted 를 속성으로 안 박아서 아이폰이 자동 재생을 막음 → 손으로 박고 틂
        if (!v) return;
        v.muted = true;
        v.defaultMuted = true;
        if (!still()) void v.play().catch(() => {});
      }}
      src={src}
    />
  );
}
