// 원본 components/agents/abstract-avatar.tsx 자리 — 봇 얼굴 = 우리 얼굴 그림(구슬 0)
import type { OrbColour } from "@/components/duet/mic-orb-draw";
import { FaceImg } from "../ui/faces";

export function orbColourFor(_id: string): OrbColour {
  return "ember";
}

export function AbstractAvatar({ id, name, size = 40 }: { id: string; name: string; seed?: string; size?: number }) {
  return (
    <span role="img" aria-label={name} className="inline-flex shrink-0" style={{ height: size, width: size }}>
      <span aria-hidden="true" className="contents">
        <FaceImg id={id} size={size} />
      </span>
    </span>
  );
}
