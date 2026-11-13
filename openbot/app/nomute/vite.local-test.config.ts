// 뜸 몸 시험 빌드만(커밋 안 함) — 윗 폴더 node_modules 와 React 가 두 벌 되는 걸 한 벌로
import base from "./vite.config";
const c: any = base;
export default { ...c, resolve: { ...(c.resolve || {}), dedupe: ["react", "react-dom", "@tanstack/react-query", "@tanstack/react-router"] } };
