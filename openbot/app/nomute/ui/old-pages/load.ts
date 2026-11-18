// 옛 에디터 화면의 정적 모듈 받기 — 앱 묶음 밖(public/old-pages/ · ./tools/gen.mjs 가 만듦)에 있는 것을 고를 때 실행 중에 받음
//   묶음 안에 안 넣는 까닭 = 빌드 메모리(./tools/gen.mjs 머리말) · 이름에 내용 지문이 있어 판이 바뀌어도 캐시가 스스로 맞음(./manifest.gen.ts)
import type { PageDef } from "./frame";
import { FILES } from "./manifest.gen";

export type OldPage = keyof typeof FILES;
const got = new Map<OldPage, Promise<PageDef>>();
/** 화면 한 장(판 · 옷 · 스크립트) — 한 번 받으면 그대로 씀 · 못 받으면 다음에 다시 */
export function loadPage(k: OldPage): Promise<PageDef> {
  let p = got.get(k);
  if (!p) {
    p = (import(/* @vite-ignore */ `${import.meta.env.BASE_URL}old-pages/${FILES[k]}`) as Promise<{ PAGE: PageDef }>).then((m) => m.PAGE);
    p.catch(() => got.delete(k));
    got.set(k, p);
  }
  return p;
}
