// 원본 components/channels/avatar.tsx 자리 — 대화 얼굴 = 우리 얼굴 그림(한 명 = 그 얼굴 · 여럿 = 겹친 얼굴 셋) · 「일하는 중」 점 셋은 원본 그대로
import { memo } from "react";
import { FaceImg } from "../ui/faces";

export const ChannelAvatar = memo(function ChannelAvatar({ participantIds, size = 32, typing = false }: { participantIds: string[]; size?: number; typing?: boolean }) {
  const shown = participantIds.slice(0, 3);
  const small = Math.round(size * (shown.length === 2 ? 0.68 : 0.56));
  const at = shown.length === 2 ? [[0, 0], [0.32, 0.32]] : [[0.22, 0], [0, 0.44], [0.44, 0.44]];
  return (
    <div className="relative" style={{ height: size, width: size }}>
      {shown.length <= 1 ? (
        <FaceImg id={shown[0] || "winter"} size={size} />
      ) : (
        shown.map((id, i) => (
          <span key={id} className="absolute rounded-full ring-2 ring-background" style={{ left: at[i][0] * size, top: at[i][1] * size }}>
            <FaceImg id={id} size={small} />
          </span>
        ))
      )}
      {typing ? (
        <div className="absolute -bottom-0.5 -right-0.5 flex items-center gap-0.5 rounded-full bg-sidebar p-0.5 ring-2 ring-sidebar">
          <span className="sr-only">일하는 중…</span>
          {["[animation-delay:-0.3s]", "[animation-delay:-0.15s]", ""].map((c) => (
            <span key={c} className={`size-1 animate-bounce rounded-full bg-muted-foreground ${c}`} />
          ))}
        </div>
      ) : null}
    </div>
  );
});
