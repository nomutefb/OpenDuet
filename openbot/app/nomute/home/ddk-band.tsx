// 홈 「다 깸」 띠(형 11-02 12:52 「뜸이 만든거 이 칸에 뜨게해줘 영상은 지드라이브 공유 폴더에 올려놧어」 · 14:46 결정 「③ 카드 밖 홈 맨 아래 빈 자리에 한 번만」) —
//   뜸 「다 깸」 고리판(주고받기/20261102_1246_다-깸.mp4 · 11.7초 · 소리 없음 · 끝이 처음으로 이어짐)을 작게 줄인 판 = public/ddk.mp4 · 첫 장면 = public/ddk.jpg ·
//   카드 밖 맨 아래에 한 번(뉴스 카드마다 아님) · 소리 없이 고리 · public 자리 = 서비스 워커가 안 잡음(아이폰 사파리 Range 206 그대로).
//   뜸이 손본 판을 주고받기에 같은 이름으로 덮으면 → ddk.mp4·ddk.jpg 를 다시 줄여 넣고 V 를 올림.
import "./ddk-band.css";

const V = 1;
const still = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export function DdkBand() {
  return (
    <video
      aria-label="뜸 「다 깸」"
      autoPlay={!still()}
      className="nm-ddk"
      disablePictureInPicture
      loop
      muted
      playsInline
      poster={`/office-app/ddk.jpg?v=${V}`}
      preload="metadata"
      ref={(v) => {   // React 는 muted 를 속성으로 안 박아서 아이폰이 자동 재생을 막음 → 손으로 박고 틂
        if (!v) return;
        v.muted = true;
        v.defaultMuted = true;
        if (!still()) void v.play().catch(() => {});
      }}
      src={`/office-app/ddk.mp4?v=${V}`}
    />
  );
}
