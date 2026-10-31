// 원본 app/src/router.tsx 그대로 + 해시 주소(/office-app/#/tasks — 사이트는 모르는 길을 본판 index.html 로 돌려서 서버 쪽 규칙 없이 가려고)
// 라우트 나무 = 빼는 화면 뺀 우리 판(nomute/gen · 빌드 때 생성)
import { type AnyRoute, createHashHistory, createRoute, createRouter } from "@tanstack/react-router";
import { parseSearchText } from "@/lib/search-text";
import type { RouterContext } from "@/router-context";
import { Route as AppRoute } from "@/routes/_authed/_app";
import { routeTree } from "./gen/routeTree.gen";

/* 우리 길(원본 routes 폴더 밖) = 앱 틀(_app) 아래에 더함 · #/runner = 러너 화면(보조 02 nomute/runner · office-runner.md) */
/*   #/rooms = 목록 화면(형 11:26 「대화랑 그냥 분리하자」) · 둘 다 화면은 껍데기 판(ui/shell.tsx)이 그림 = 길은 자리만 */
const runnerRoute = createRoute({ getParentRoute: () => AppRoute, path: "/runner", component: () => null });
const roomsRoute = createRoute({ getParentRoute: () => AppRoute, path: "/rooms", component: () => null });
const homeRoute = createRoute({ getParentRoute: () => AppRoute, path: "/home", component: () => null });   // #/home = 홈 판(보조 02 nomute/home)
/* 네비 다섯 칸·서랍(형 12:24~12:26) = #/editor(에디터 판) · #/gyeol·#/tokens·#/feedback(서랍 모달 · 에디터 원본 화면) · #/web?u=(앱 밖 주소 = 앱 안 한 겹 · ui/inapp.ts) */
const more = ["/editor", "/sched", "/legacy", "/ask", "/news", "/chan", "/sns", "/edtool", "/gyeol", "/play", "/drawer", "/tokens", "/feedback", "/web"].map((path) => createRoute({ getParentRoute: () => AppRoute, path, component: () => null }));
const issueRoute = createRoute({ getParentRoute: () => AppRoute, path: "/issue/$no", component: () => null });   // #/issue/<번호> = 우리 저장소 이슈 한 장(껍데기 ui/issue.tsx)
AppRoute.addChildren([...((AppRoute.children as AnyRoute[] | undefined) ?? []), runnerRoute, roomsRoute, homeRoute, ...more, issueRoute]);

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
