// 원본 대화 화면 셋 자리 — 우리 방은 1:1 이든 단체든 다 「서버 대화록」이라 한 대화창(OfficeChat)으로
//   components/channels/channel-chat.tsx(ChannelChat · 원본 = CopilotKit 실시간 실행) · components/channels/group-chat.tsx(GroupChat) · components/shell/chat-screen.tsx(ChatScreen = 첫 화면 = 회의실)
import type { ReactNode } from "react";
import { OfficeChat } from "../ui/office-chat";

export function ChannelChat({ channel, lead }: { channel: { id: string }; lead?: ReactNode; [k: string]: unknown }) {
  return <OfficeChat room={channel.id} key={channel.id} lead={lead} />;   // lead = 원본 방 머리(아이콘·이름·한 줄)
}

export function GroupChat({ channelId }: { channelId: string }) {
  return <OfficeChat room={channelId} key={channelId} />;
}

/** 첫 화면 = 회의실(형 · 봇 · 윈터가 같이 쓰는 방) */
export function ChatScreen() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <OfficeChat room="all" />
    </div>
  );
}

/** 원본 chat-screen.tsx 의 ScreenNotice 그대로(channel-screen.tsx 가 씀) */
export function ScreenNotice({ children, alert = false }: { children: ReactNode; alert?: boolean }) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 pt-[100px] text-center">
      <p className={alert ? "type-sub text-duet-red" : "type-sub text-duet-ink-2"} role={alert ? "alert" : undefined}>
        {children}
      </p>
    </div>
  );
}
