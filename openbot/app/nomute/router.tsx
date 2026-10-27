// 원본 app/src/router.tsx 그대로 + 해시 주소(/office-app/#/tasks — 사이트는 모르는 길을 본판 index.html 로 돌려서 서버 쪽 규칙 없이 가려고)
// 라우트 나무 = 빼는 화면 뺀 우리 판(nomute/gen · 빌드 때 생성)
import { createHashHistory, createRouter } from "@tanstack/react-router";
import { parseSearchText } from "@/lib/search-text";
import type { RouterContext } from "@/router-context";
import { routeTree } from "./gen/routeTree.gen";

export const router = createRouter({
  routeTree,
  history: createHashHistory(),
  context: {} as RouterContext,
  parseSearch: parseSearchText,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
