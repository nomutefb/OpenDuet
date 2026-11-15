// 방 없애기 · 임시방 지우기 = 「예」를 누르자마자 목록에서 빼고 서버 일은 뒤에서
//   형 11-16 03:0x 「창이 멎게 안하고 바로 부드럽게 닫히고 백단에서 처리하게」 — 앞 판 = 되묻는 창이 서버 답(1~수 초)을 기다리며 서 있었음
//   서버 길은 그대로(단체방 DELETE rooms/<id> = 목록 · 설정 · 부름에서 빠짐 · 글은 서버에 남음 / 임시방 DELETE temprooms/<id> = 파기)
//   못 했으면 = 화면 아래 알림 한 줄 + 방 목록 다시 읽기(뺀 방이 되돌아옴)
import type { QueryClient } from "@tanstack/react-query";
import { type OfficeRoom, office } from "../data/office";
import { flash } from "./flash";
import { dropSearchCache } from "./room-search";

const ROOMS = ["nomute", "rooms"];

export function dropRoomAway(qc: QueryClient, r: { id: string; name: string; temp?: boolean }) {
  const temp = !!r.temp || r.id.startsWith("tmp-");
  void qc.cancelQueries({ queryKey: ROOMS });   // 지금 받는 중인 옛 목록이 뺀 방을 되살리지 않게
  qc.setQueryData<OfficeRoom[]>(ROOMS, (old) => (Array.isArray(old) ? old.filter((x) => x.id !== r.id) : old));
  office(`${temp ? "temprooms" : "rooms"}/${encodeURIComponent(r.id)}`, { method: "DELETE" })
    .then(async () => {
      await dropSearchCache(r.id).catch(() => {});
      void qc.invalidateQueries({ queryKey: ROOMS });
      if (!temp) void qc.invalidateQueries({ queryKey: ["nomute", "roomset"] });
    })
    .catch((e: unknown) => {
      const why = e instanceof Error && e.message ? ` (${e.message})` : "";
      flash(`「${r.name}」 방을 못 ${temp ? "지웠어" : "없앴어"} — 다시 해 줘${why}`);
      void qc.invalidateQueries({ queryKey: ROOMS });
    });
}
