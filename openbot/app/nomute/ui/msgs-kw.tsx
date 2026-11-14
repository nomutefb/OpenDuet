// 알림 한 화면 = 알림메세지 + 키워드 알림(형 11-14 클라우드 세션 창 「키워드 알림 > 알림 메세지랑 통합(기능은 유지하면서)」) — 화면 둘은 그대로 두고 위에 탭만
import { lazy, Suspense, useState } from "react";

const MsgsModal = lazy(() => import("./msgs").then((m) => ({ default: m.MsgsModal })));
const KwModal = lazy(() => import("./kw").then((m) => ({ default: m.KwModal })));

export function MsgsKw() {
  const [tab, setTab] = useState<"msgs" | "kw">("msgs");
  return (
    <>
      <div className="nm-msgs-seg" role="tablist" aria-label="알림">
        <button type="button" role="tab" className="nm-sched-chip" aria-selected={tab === "msgs"} aria-pressed={tab === "msgs"} onClick={() => setTab("msgs")}>알림메세지</button>
        <button type="button" role="tab" className="nm-sched-chip" aria-selected={tab === "kw"} aria-pressed={tab === "kw"} onClick={() => setTab("kw")}>키워드 알림</button>
      </div>
      <Suspense fallback={null}>{tab === "msgs" ? <MsgsModal /> : <KwModal />}</Suspense>
    </>
  );
}
