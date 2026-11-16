// 문서 편집 창의 셈(화면 없이 시험되는 것) — ./doc-editor.tsx 가 씀
export type DocKind = "hwpx" | "hwp";
export const STUDIO_URL = "https://edwardkim.github.io/rhwp/";   // rhwp 편집기 화면(edwardkim/rhwp · MIT) — 우리 Pages 는 파일 하나 25MB 한도라 편집기 wasm(26.8MB)을 못 실음 → 제작자 주소를 씀 · 우리 쪽에 올리게 되면 이 한 줄만 바꿈
export const OPEN_ACCEPT = ".hwp,.hwpx,.hml,.pdf";

/** 받을 파일 이름 — 연 파일 이름의 몸통 + 새 꼬리 · 이름이 없으면 「문서-MMDD」 */
export function saveName(name: string, ext: string, now = new Date()): string {
  const base = (name || "").replace(/\.(hwpx?|hml|pdf|md|txt)$/i, "").replace(/[\\/:*?"<>|]+/g, " ").trim();
  const day = `${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `${base || `문서-${day}`}.${ext}`;
}

/** 「개인정보 가리기」 결과 글에서 가린 곳 수 — hwpx-docs `SECURE MASK OK a -> b (3 item(s) hidden)` */
export const maskedCount = (log: string): number | null => { const m = log.match(/\((\d+) item\(s\) hidden\)/); return m ? Number(m[1]) : null; };

/** hwpx-docs 가 문서를 못 읽고 넘어진 글인가 — 0.3.0 은 일부 실물 문서에서 읽기(core/read.py)가 깨짐(11-17 본 것 = 실물 원본 셋 중 둘 + 편집기가 다시 저장한 옛 .hwp 하나 · 원본을 그 도구에 바로 줘도 같음) → 「문제 없음」으로 보이면 안 됨 */
export const hdCrashed = (log: string): boolean => /Traceback \(most recent call last\)/.test(log);
export const CANT_READ = "이 문서는 점검 엔진(hwpx-docs 0.3.0)이 못 읽는 꼴이야 — 열기 · 고치기 · 받기 · 가리기는 그대로 돼";

/** 점검 결과 글 → 줄들(빈 줄 · 파이썬 경고 빼고) + 문제 수 — 가독성(RD01~RD13)은 `READABILITY OK` 또는 `RDnn …` 줄 · 쪽 맞춤은 「점검 결과: 문제 N건」 */
export function checkLines(readLog: string, fitLog: string): { lines: string[]; bad: number } {
  const lines = [...readLog.split("\n"), ...fitLog.split("\n")].map((l) => l.trim()).filter((l) => l && !/^(HWPX WRITTEN|SPEC WRITTEN)/.test(l));
  const rd = lines.filter((l) => /^RD\d\d\b/.test(l)).length, fit = Number(fitLog.match(/문제 (\d+)건/)?.[1] ?? 0);
  return { lines: lines.map((l) => (l === "READABILITY OK" ? "가독성 점검: 문제 없음" : l)), bad: rd + fit };
}

/** 「글로 만들기」 보기 글 — 개조식 보고서 프리셋(report-gongmun)이 읽는 Markdown 꼴 */
export const SAMPLE_MD = `# 보고서 제목
부제나 한 줄 설명

## 추진 배경
- 왜 하는지 한 줄
  - 덧붙일 내용
- 지금 상태 한 줄

## 추진 계획
1. 첫 단계
2. 둘째 단계

| 구분 | 내용 | 기한 |
|---|---|---|
| 1단계 | 준비 | 11월 |
| 2단계 | 시행 | 12월 |

※ 참고할 것 한 줄
`;
