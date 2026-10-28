// 새 사무실 「러너」 화면(형 10-28 09:31 「새 사무실을 정본으로 가는게 맞다고 보고, 거기에 하나씩 넣은 다음 완성도가 생기면 대체」) —
//   위젯·웹판(runner.html)은 그대로 두고 같은 자료(/api/runner)를 이 앱 꼴로 · 길(라우트)·메뉴 줄은 이 폴더 밖(claude-state assign/2026-10-28/office-runner.md 「바뀜」).
// 판 위 큰 제목 0(PM 13:04 · 형 「공간」 · 모달 머리 알약이 「러너」를 보여 줌) — 틀 = ui/pane.tsx Pane 꼴 · 폭만 원본 PageShell wide(max-w-5xl · 칸 둘 나란히)
import { RunnerBoard } from "./runner-board";

export function RunnerScreen() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col px-4 pt-4 pb-12">
      <h1 className="sr-only">러너</h1>
      <RunnerBoard />
    </div>
  );
}
