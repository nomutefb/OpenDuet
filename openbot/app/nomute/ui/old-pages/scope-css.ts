// 원본 문서 꼴로 쓴 옷 → 틀(./frame.ts) 것으로(딸린 것 없는 순수 함수 · 시험이 바로 부름)
//   실행 때 끼우는 옷(옛 스크립트가 만드는 <style> · 앱이 덧씌우는 톤)에 씀 — 미리 아는 옷은 ./tools/gen.mjs 가 만들 때 같은 규칙으로 바꿈
//   html · :root → nd-html / body → nd-body · 화면 폭 · 높이 조건 → 틀 크기 조건 · 화면 크기 단위 → 틀 크기 단위
const SIZE = /\((?:\s*(?:min-|max-)?(?:width|height|aspect-ratio)\s*:|\s*orientation\s*:|[^)]*\b(?:width|height)\s*[<>]=?)/;
export function scopeCss(css: string): string {
  let out = css
    .replace(/(^|[\s,{}>+~(])html(?=[\s,{.:#\[>+~)]|$)/g, "$1nd-html")
    .replace(/(^|[\s,{}>+~(])body(?=[\s,{.:#\[>+~)]|$)/g, "$1nd-body")
    .replace(/:root\b/g, ".nd-root")
    .replace(/(\d)(?:svh|dvh|lvh|vh)\b/g, "$1cqh").replace(/(\d)(?:svw|dvw|lvw|vw)\b/g, "$1cqw").replace(/(\d)vmax\b/g, "$1cqmax").replace(/(\d)vmin\b/g, "$1cqmin");
  out = out.replace(/@media\s*([^{]+)\{/g, (m, q: string) => (SIZE.test(q) && !/,|\bnot\b|\bprint\b/.test(q) && q.trim().split(/\s+and\s+/).every((p) => SIZE.test(p)) ? `@container nd ${q.trim()}{` : m));
  return out;
}

const REL = /^(?![a-z][a-z0-9+.-]*:|\/|#|\?)/i;
/** 상대 주소 → 뿌리 기준(원본 문서가 사이트 뿌리 / 에 있었다) · 이미 온전한 주소 · # · ? · 빈 글 = 그대로 */
export const rootUrl = (v: unknown): unknown => (typeof v === "string" && v && REL.test(v) ? "/" + v.replace(/^\.\//, "") : v);
/** 글자로 짠 HTML 속 상대 src · href · poster → 뿌리 기준 */
export const rootHtml = (v: unknown): unknown => (typeof v === "string" && v.includes("=") ? v.replace(/(\s(?:src|href|poster))=(["'])(?![a-z][a-z0-9+.-]*:|\/|#|\?|\2)([^"']*)\2/gi, (_m, a: string, q: string, u: string) => `${a}=${q}/${u.replace(/^\.\//, "")}${q}`) : v);
