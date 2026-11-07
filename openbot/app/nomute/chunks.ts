// 꾸러미(node_modules) 덩어리 가르기 — 판이 바뀌어도 꾸러미 덩어리 이름(해시)은 그대로 = 브라우저가 다시 안 받음
//   왜: 라이브 fb46373 실측(번개 11-08 06:4x) — Rollup 기본 나눔은 공용 꾸러미 2MB(gz 592KB · katex · copilotkit · 마크다운 파이프라인)를 우리 코드와 한 덩어리로 섞어
//       입구 덩어리를 import 하게 만들고, 그 입구는 판마다 바뀌니 꾸러미 덩어리 이름도 판마다 바뀜(두 빌드 대조: DM3HcEiO → DKAxn8kW) → 하룻밤 판 열 번 = 열 번 다시 받음
//   어떻게: 첫 화면에 어차피 실리는 꾸러미 모듈만(입구 + 로그인 뒤 공통 _authed 에서 정적으로 닿는 것) 꾸러미끼리 덩어리 여덟으로 모음 · 눌러야 오는 꾸러미 모듈은 안 건드림(Rollup 기본)
//       — 꾸러미 이름으로만 모으면 눌러야 오던 부분까지 첫 화면에 딸려 와 첫 화면이 gz +360KB 커짐(07:03 실측) → 「첫 화면 집합」을 먼저 셈
//       층 = react ← tanstack · ui · motion · zod · misc(잎) ← markdown ← copilot (거꾸로 import 0 = 순환 0 · 빌드 뒤 scratch analyze6 로 확인)
//   형 원문 = 11-08 06:26 「오 둘다 맘에 든다 바로 쾅쾅하자」(① 첫 화면 무게) · 11-02 07:20 「강제로 화면 쌔로고침 하지말고」(판 바뀔 때 받는 양이 곧 체감)
import type { GetModuleInfo } from "rollup";

const GROUPS: [string, RegExp][] = [
  ["v-react", /\/node_modules\/(react|react-dom|scheduler|use-sync-external-store|tslib)\//],   // tslib = 잎 도우미(radix 쪽 use-sidecar·react-remove-scroll 이 부름) · 안 모으면 Rollup 이 copilot 덩어리에 끼워 ui↔copilot 순환(07:09 실측)
  ["v-tanstack", /\/node_modules\/@tanstack\//],
  ["v-ui", /\/node_modules\/(@base-ui|@floating-ui|@radix-ui|tailwind-merge|clsx|class-variance-authority|lucide-react|boring-avatars|embla-carousel|embla-carousel-react|react-use-measure|@tabler)\//],
  ["v-motion", /\/node_modules\/(motion|motion-dom|motion-utils|framer-motion)\//],
  ["v-zod", /\/node_modules\/(zod|zod-to-json-schema)\//],
  ["v-misc", /\/node_modules\/(date-fns|dayjs|semver|partial-json|fast-json-patch|uuid)\//],   // 잎 꾸러미(남을 안 부름) = 순환 0
  ["v-markdown", /\/node_modules\/(streamdown|katex|parse5|marked|remend|unified|vfile|vfile-message|bail|trough|is-plain-obj|is-hexadecimal|is-decimal|is-alphanumerical|is-alphabetical|extend|zwitch|devlop|ccount|longest-streak|markdown-table|escape-string-regexp|property-information|space-separated-tokens|comma-separated-tokens|trim-lines|html-url-attributes|style-to-js|style-to-object|inline-style-parser|decode-named-character-reference|parse-entities|character-entities(-[a-z]+)?|character-reference-invalid|entities|micromark(-[a-z0-9-]+)?|mdast-util-[a-z0-9-]+|hast-util-[a-z0-9-]+|hastscript|unist-util-[a-z0-9-]+|remark-[a-z0-9-]+|rehype-[a-z0-9-]+|estree-util-[a-z0-9-]+|web-namespaces|html-void-elements|stringify-entities|github-slugger)\//],
  ["v-copilot", /\/node_modules\/(@copilotkit|@ag-ui|@a2ui|@bufbuild|rxjs|phoenix|prompt-area|use-stick-to-bottom)\//],   // prompt-area · use-stick-to-bottom = CopilotKit 집 꾸러미(copilot 쪽을 부름 → v-ui 에 두면 ui↔copilot 순환)
];

/** 첫 화면 뿌리 = 입구(isEntry) + 로그인 뒤 공통 라우트 _authed(우리 껍데기 ui/shell.tsx 가 여기 붙음 · 라우터가 쪼갠 ?tsr-split 조각 포함) */
const ROOT = /\/routes\/_authed\.tsx(\?|$)/;

/** 첫 화면에 정적으로 닿는 모듈 집합(한 번만 셈) */
let eager: Set<string> | null = null;
function eagerSet(ids: Iterable<string>, getModuleInfo: GetModuleInfo): Set<string> {
  if (eager) return eager;
  const seen = new Set<string>(); const st: string[] = [];
  for (const id of ids) { const m = getModuleInfo(id); if (m && (m.isEntry || ROOT.test(id))) st.push(id); }
  while (st.length) {
    const id = st.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const m = getModuleInfo(id);
    if (m) for (const dep of m.importedIds) if (!seen.has(dep)) st.push(dep);   // 정적 import 만(동적은 눌러야 옴)
  }
  eager = seen;
  return seen;
}

/** Rollup manualChunks — 첫 화면 꾸러미 모듈이 위 표에 맞으면 그 덩어리 · 아니면 undefined(Rollup 기본) */
export function manualChunks(id: string, { getModuleIds, getModuleInfo }: { getModuleIds: () => IterableIterator<string>; getModuleInfo: GetModuleInfo }): string | undefined {
  if (!id.includes("/node_modules/")) return undefined;
  if (!eagerSet(getModuleIds(), getModuleInfo).has(id)) return undefined;
  // 꾸러미 안에 또 깔린 꾸러미(@copilotkit/react-core/node_modules/streamdown 꼴) = 맨 안쪽 이름으로 맞춤
  const inner = "/node_modules/" + id.split("/node_modules/").pop();
  for (const [name, re] of GROUPS) if (re.test(inner)) return name;
  return undefined;
}
