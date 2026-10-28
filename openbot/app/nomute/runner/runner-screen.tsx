// 새 사무실 「러너」 화면(형 10-28 09:31 「새 사무실을 정본으로 가는게 맞다고 보고, 거기에 하나씩 넣은 다음 완성도가 생기면 대체」) —
//   위젯·웹판(runner.html)은 그대로 두고 같은 자료(/api/runner)를 이 앱 꼴로 · 길(라우트)·메뉴 줄은 이 폴더 밖(claude-state assign/2026-10-28/office-runner.md 「바뀜」).
import { PageShell } from "@/components/layout/page-shell";
import { RunnerBoard } from "./runner-board";

export function RunnerScreen() {
  return (
    <PageShell title="러너" description="윈A·윈B·맥 · 위젯이 30초마다 올리는 값 그대로" width="wide">
      <RunnerBoard />
    </PageShell>
  );
}
