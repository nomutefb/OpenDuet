// :has() 무효화가 「자손 전부」로 번지지 않게 — 빌드된 CSS 의 선택자 꼴만 같은 뜻으로 바꿈(화면 · 무게 그대로)
//   병: 테일윈드가 `group-has-…/이름:유틸` 을 `.유틸:is(:where(.group\/이름):has(조건) *)` 꼴로 냄(원본 UI 꾸러미 item · input-group · field · message · sidebar · questionnaire 가 씀)
//       → 브라우저는 「:has() 가 바뀌면 다시 볼 자손」 표에 「*」(전부)를 올림 · 그 표는 온 문서의 :has() 가 같이 씀
//       → :has() 가 걸린 요소(에디터 창 · 판 · 대화 기둥 …) 밑에서 글자 하나만 바뀌어도 그 밑 요소 전부의 꼴을 다시 따지고, 입력 칸들을 다시 배치함
//         (실측 11-18 · 맥 헤드리스 · cpu ÷4 · 이미지 에디터 안 글자 한 번 바꿈 = 배치 8.5ms → 이 꼴만 걷으면 3.2ms · :has() 가 하나도 없을 때 바닥 0.8ms)
//   약: `:where(.group\/이름):has(조건) .유틸` 로 바꿈 = 같은 요소에 같은 무게(특이도)로 걸림 · 「다시 볼 자손」이 그 유틸 클래스 하나로 좁아짐
//   자리 = 빌드 끝(vite generateBundle) · 원본(openbot/app/src) · 테일윈드 설정 손 0 · 새 group-has 유틸이 늘어도 저절로 같이 바뀜

/** s[i] 가 「(」 일 때 짝 「)」 자리(따옴표 · 역슬래시 건너뜀) · 못 찾으면 -1 */
function close(s: string, i: number): number {
  let d = 0;
  for (let k = i; k < s.length; k++) {
    const c = s[k];
    if (c === "\\") { k++; continue; }
    if (c === '"' || c === "'") { const e = s.indexOf(c, k + 1); if (e < 0) return -1; k = e; continue; }
    if (c === "(") d++;
    else if (c === ")" && --d === 0) return k;
  }
  return -1;
}

const MARK = ":is(:where(.group\\/";
const CLASS = /^\.(?:\\.|[\w-])+$/;   // 클래스 하나(역슬래시로 푼 글자 포함)
const TAIL = /^(?:::?[\w-]+(?:\([^()]*\))?)*$/;   // 뒤에 붙은 :hover · ::before … (띄움 · 이음표 없음)

/** `.u:is(:where(.group\/x):has(A) *)` → `:where(.group\/x):has(A) .u` · 못 알아보는 꼴은 손 안 댐 */
export function leanHas(css: string): { css: string; n: number } {
  let out = "", from = 0, n = 0;
  for (let at = css.indexOf(MARK); at >= 0; at = css.indexOf(MARK, at + 1)) {
    // 앞: 선택자 머리(쉼표 · 중괄호 뒤)부터 여기까지가 클래스 하나여야 함
    let st = at;
    while (st > from) { const c = css[st - 1]; if ((c === "," || c === "{" || c === "}" || c === ";") && css[st - 2] !== "\\") break; st--; }
    const lead = css.slice(st, at), head = lead.trimStart();
    if (!CLASS.test(head)) continue;
    // 안: :where(.group\/x):has(A) *
    const isEnd = close(css, at + 3);
    if (isEnd < 0) continue;
    const inner = css.slice(at + 4, isEnd), wEnd = close(inner, 6);
    if (wEnd < 0 || !inner.startsWith(":has(", wEnd + 1)) continue;
    const hEnd = close(inner, wEnd + 5);
    if (hEnd < 0 || inner.slice(hEnd + 1) !== " *") continue;
    // 뒤: 다음 쉼표 · 중괄호까지 = 가짜 클래스만
    let en = isEnd + 1;
    while (en < css.length && css[en] !== "," && css[en] !== "{") en++;
    const tail = css.slice(isEnd + 1, en), tailT = tail.trimEnd();
    if (!TAIL.test(tailT)) continue;
    out += css.slice(from, st) + lead.slice(0, lead.length - head.length) + inner.slice(0, hEnd + 1) + " " + head + tail;
    from = en; n++;
  }
  return { css: out + css.slice(from), n };
}

/** 빌드 끝에 CSS 꾸러미마다 한 번 */
export function leanHasPlugin() {
  return {
    name: "nomute-lean-has",
    enforce: "post" as const,
    generateBundle: {
      order: "post" as const,
      handler(_o: unknown, bundle: Record<string, { type: string; fileName: string; source?: string | Uint8Array }>) {
        let all = 0;
        for (const f of Object.values(bundle)) {
          if (f.type !== "asset" || !f.fileName.endsWith(".css") || f.source == null) continue;
          const src = typeof f.source === "string" ? f.source : Buffer.from(f.source).toString("utf8");
          if (!src.includes(MARK)) continue;
          const r = leanHas(src);
          if (r.n) { f.source = r.css; all += r.n; }
        }
        if (all) console.log(`\n[nomute-lean-has] group-has 선택자 ${all}개를 가벼운 꼴로 바꿈`);
      },
    },
  };
}
