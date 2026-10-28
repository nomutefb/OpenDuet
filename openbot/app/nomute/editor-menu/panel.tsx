// 「에디터」 판(네비 넷째 칸 · 형 10-28 12:23 「할일에 에디터 메뉴를 넣어주라.」 → 12:24 자리 = 네비 「에디터」 판) — 에디터 메뉴 전부를 설정과 같은 YETA 꼴 카드·행으로
//   칸 = 에디터 첫 화면 마크업 그대로(read.ts · 아래 네비 칸 + ＋ 제작 도구 칸 · 이름·설명·아이콘·차례 그대로) · 누르면 그 메뉴로 같은 창 이동(iframe 0 = 에디터 중첩 셸 차단 안 걸림)
//   꼴 = ui/yeta-settings.css 의 .yeta-set 규칙 그대로(카드·섹션·행·꺾쇠) · 아래 네비·옮기는 움직임 = 보조 01 껍데기
import "../ui/yeta-settings.css";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/page-shell";
import { YICO } from "../ui/yeta-icons";
import { type EdItem, cachedMenu, linkOf, menuFresh, readMenu } from "./read";

function Row({ x }: { x: EdItem }) {
  return (
    <a className="yset-item" href={linkOf(x)} style={{ textDecoration: "none" }}>
      {x.icon ? <span className="si-ic" aria-hidden dangerouslySetInnerHTML={{ __html: x.icon }} /> : null}
      <span className="si-lbl"><span className="si-t">{x.label}</span>{x.desc ? <span className="si-d">{x.desc}</span> : null}</span>
      <span className="si-v" aria-hidden dangerouslySetInnerHTML={{ __html: YICO.chev }} />
    </a>
  );
}

export function NomuteEditorMenu() {
  const init = cachedMenu();
  const q = useQuery({ queryKey: ["nomute", "editor-menu"], queryFn: readMenu, initialData: init, initialDataUpdatedAt: init?.at, staleTime: menuFresh(init) ? 864e5 : 0, gcTime: Infinity });
  const m = q.data;
  return (
    <PageShell title="에디터">
      <div className="yeta-set mt-2">
        <div className="ycd-card card-left">
          <span className="ycd-nm yset-ttl"><span aria-hidden dangerouslySetInnerHTML={{ __html: YICO.screen }} />에디터</span>
          {m ? (
            <>
              <div className="yset-sec">메뉴</div>
              {m.tabs.map((x) => <Row key={"t:" + x.key} x={x} />)}
              {m.tools.length ? <div className="yset-sec">{m.toolsLabel || "제작 도구"}</div> : null}
              {m.tools.map((x) => <Row key={"a:" + x.key} x={x} />)}
            </>
          ) : (
            <p className="px-1 py-2 text-xs text-muted-foreground">{q.isError ? `에디터 메뉴를 못 읽었어 — ${q.error.message}` : "에디터 메뉴 읽는 중…"}</p>
          )}
          {q.isError && m ? <p className="px-1 text-xs text-muted-foreground" role="alert">새로 못 읽어 이 기기에 적어 둔 메뉴로 보여 줘 — {q.error.message}</p> : null}
        </div>
      </div>
    </PageShell>
  );
}
