// 원본 app/src/router.tsx 그대로 + 해시 주소(/office-app/#/tasks — 사이트는 모르는 길을 본판 index.html 로 돌려서 서버 쪽 규칙 없이 가려고)
// 라우트 나무 = 빼는 화면 뺀 우리 판(nomute/gen · 빌드 때 생성)
import { type AnyRoute, createHashHistory, createRoute, createRouter } from "@tanstack/react-router";
import { parseSearchText } from "@/lib/search-text";
import type { RouterContext } from "@/router-context";
import { Route as AppRoute } from "@/routes/_authed/_app";
import { routeTree } from "./gen/routeTree.gen";
import { RunnerScreen } from "./runner/runner-screen";

/* 우리 길(원본 routes 폴더 밖) = 앱 틀(_app) 아래에 더함 · #/runner = 러너 화면(보조 02 nomute/runner · office-runner.md) */
const runnerRoute = createRoute({ getParentRoute: () => AppRoute, path: "/runner", component: RunnerScreen });
AppRoute.addChildren([...((AppRoute.children as AnyRoute[] | undefined) ?? []), runnerRoute]);

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
