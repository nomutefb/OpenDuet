// 대화 목록 미리보기 한 줄(순수 · ./room-list.tsx 가 씀 · 시험 = tests/room-preview.test.ts 등)
/** 미리보기 한 줄 = 글꼴 기호·부름·파일 경로 뺌(형 사진 10-31 09:12 「**[정치]」 · 「파일: … → 윈터 PM (cl…」) · 원문은 대화창에 그대로 */
export function previewLine(text: string) {
  const first = (text || "").split("\n")[0];
  const file = first.match(/^파일: (.+?) → /);
  if (file) return /\.(png|jpe?g|webp|gif|heic)$/i.test(file[1]) ? "사진" : `파일 · ${file[1]}`;
  // 여러 줄 글 = 줄바꿈을 넘어 한 줄로 이어 붙임 · 칸이 모자라면 목록 칸(truncate)이 「…」로 끝냄(형 11-13 02:48 봄 1:1 「말이 뒤에 긴데 대화목록에는 잘려서 나오는 경우가 있어. 이어지다가 ...로 끝나야랄듯」 · 앞 판 = 첫 줄만 → 「응.」 한 마디로 보임)
  const line = (text || "").split("\n").map((x) => x.trim()).filter(Boolean).join(" ");
  return line.replace(/^(?:[!@]\S+\s+)+/, "").replace(/\*\*|__|`/g, "").replace(/\s{2,}/g, " ").trim();
}

/** 마지막 글이 「메시지 보냄」 표시(kind sent · 글 0 · 봇이 다른 방에 보낸 흔적)면 미리보기가 빈 칸 — 그 앞 진짜 대화(형 글 · 그 애 글) 한 줄 · 순수(시험 tests/room-preview.test.ts)
 *  (형 11-20 13:42 dm-sia 시아 옮김 「그리고 최근 대화가 이렇게 끝났을경우, 대화가 첨부2처럼 비어버리는데, 내 대화로 최근 대화가 나와있어야돼. 확인해줭」 · 서버 last · last_talk 둘 다 그 표시라 그 앞을 모름 = 그런 방만 마지막 글 몇 개를 받아 고름) */
export const blankLast = (l?: { kind?: string; text?: string } | null) => !!l && (l.kind === "sent" || !String(l.text || "").trim());
export function talkPreview(ms: { kind?: string; text?: string; files?: unknown[] }[]): string {
  for (let i = ms.length - 1; i >= 0; i--) {
    const m = ms[i];
    if (!m || m.kind === "sent") continue;
    const t = previewLine(String(m.text || ""));
    if (t) return t;
    if (m.files?.length) return m.files.every((f) => /\.(png|jpe?g|webp|gif|heic)$/i.test(String(f))) ? "사진" : "파일";
  }
  return "";
}

