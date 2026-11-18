// 덧옷(앱 톤 · 홈만의 덧줄)의 뿌리 · 화면 조건을 덱 틀 것으로 — 앱 쪽이 쓰는 꼴만: `:root` · `html,body` · `@media (max|min-width|height:N)` · svh(./index.ts tone · 딸린 것 없는 조각 = 시험이 바로 읽음)
export const scopeTone = (css: string) => css.replace(/html\s*,\s*body/g, ".nd-html,.nd-body").replace(/:root/g, ".nd-html").replace(/@media\s*\((max|min)-(width|height):/g, "@container nd ($1-$2:").replace(/([\d.])svh\b/g, "$1cqh");
