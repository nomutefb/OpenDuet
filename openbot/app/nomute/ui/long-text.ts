// 8천 자 넘는 입력 = 막지 않고 .md 파일로 붙여 보냄(형 11-20 03:41 dm-gik 「이거 8천자 넘으면 알아서 md로 되서 들어가거나 하게해줘」 · 깃 [도움])
//   앞 판 = 입력칸에 「8,000자 넘음 — 나눠서 보내 줘」 · 막음
//   글 = 첫 줄 앞 200자(「@이름」 「!형」 같은 부름 표지가 글 맨 앞에 그대로 남아 먹음) + 몇 자인지 한 줄 · 파일 = 쓴 글 통째(첨부 길 그대로 = 서버 「글 + 첨부 한 글 · 한 번 깨움」)
export const LONG_MAX = 8000, HEAD_MAX = 200;
const two = (n: number) => String(n).padStart(2, "0");

export function longText(raw: string, now = new Date()) {
  const name = `긴글-${two(now.getMonth() + 1)}${two(now.getDate())}-${two(now.getHours())}${two(now.getMinutes())}${two(now.getSeconds())}.md`;
  const first = raw.split("\n").find((l) => l.trim()) || "";
  const head = first.length > HEAD_MAX ? `${first.slice(0, HEAD_MAX)}…` : first;
  const body = `${head}\n(긴 글 ${raw.length.toLocaleString("en-US")}자 → 파일 ${name})`;
  const file = new File([raw], name, { type: "text/markdown" });
  return { id: `long-${now.getTime()}`, name, body, file };
}
