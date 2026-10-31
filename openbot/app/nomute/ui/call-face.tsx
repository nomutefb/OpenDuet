// 입력칸 「@」·「!」 목록 얼굴(형 10-31 「이런 호출하면 얼굴 나오고 얼굴 심지어 움직여야하고 심지어 검정색 배경에 잘 보여야하고」)
//   = 머리·1:1 목록과 같은 움직이는 얼굴 · 원본 부름 목록(prompt-area) 항목의 icon 칸(overrides.ts PATCH triggers.ts) · 묶음(모두)은 얼굴 없음
import { idOf, peopleSync } from "../data/office";
import { MicOrb, ringOf } from "../swap/mic-orb";

export function faceIcon(id: string) {
  const list = peopleSync(), p = list.find((x) => idOf(x.who, list) === id);
  return p ? <MicOrb size={24} id={id} tint={ringOf(p)} /> : undefined;
}
