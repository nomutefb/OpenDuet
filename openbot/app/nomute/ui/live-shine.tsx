// 활동 빛 = libraries.dev/orbs 데모 그대로(형 11-01 12:28 「빛 지나가는거 잘 모르는거 같아서 https://libraries.dev/orbs 여기에 나온 걸 프레임을 그대로 살리면돼 빛깔하고 최대한」)
//   LiveShine = 빛 지나가는 글자(데모 .t-shimmer) · 쓰는 곳 = 방 목록 활발한 방 이름(room-list.tsx) · 대화 칸 「생각중…」(office-chat.tsx)
//   ThinkOrb = 생각 중 구슬(npm thinking-orbs · 데모 「Agent thinking…」 칩 = breathing · 20) · 쓰는 곳 = 대화 칸 생각중 말풍선(점 셋 자리)
import { ThinkingOrb } from "thinking-orbs";
import { useTheme } from "@/components/theme-provider";
import "./live-shine.css";

export function LiveShine({ text, trunc }: { text: string; trunc?: boolean }) {
  return <span className={trunc ? "t-shimmer trunc" : "t-shimmer"} data-text={text}>{text}</span>;
}

export function ThinkOrb() {
  const { resolved } = useTheme();   // 앱이 고른 판 그대로(원본 auto 는 기기 설정을 따라가서 앱 판과 어긋날 수 있음)
  return <ThinkingOrb state="breathing" size={20} theme={resolved} />;
}
