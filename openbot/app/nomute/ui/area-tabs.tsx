// PC 맨 위 메인 탭 줄에 「지금 네비 칸의 탭」을 띄움 — 형 11-15 11:4x 「탭은 그러니까 아래 네비가 a b c d 이면 탭이 1 2 3 4면 탭 1234 는 a에 귀속임」 · 「그래서 지금 화상회의 팀즈 이런거는 1에 귀속된거야」 · 「뉴스 이런것도 그러니까 탭이 메인탭 라인으로 가는거지. css는 동일하게」 · 「설정만 탭이 지금 상황에서는 없는거구.」
//   = 대화 칸의 탭(봄의 정원 · Browser · 화상 회의 · Teams · 방 탭 · ./tab-bar.tsx)은 대화 칸일 때만 · 뉴스 에디터 = 뉴스 · SNS · 채널 · 서랍 = 러너 … 여섯 · 설정 = 탭 없음
//   옷 = 메인 탭 줄 그대로(./tab-bar.css .nm-tabs · .nm-tab · 고른 자리 잉크 .nm-tabs-ink) · 폰은 화면 안 폴더 탭 그대로(메인 탭 줄이 없음)
import "./tab-bar.css";
import { useEffect, useLayoutEffect, useRef } from "react";
import { DuetIcon, type DuetIconName } from "@/components/duet/icons";

export type AreaTab = { id: string; name: string; icon: DuetIconName };

export function AreaTabs({ label, items, cur, pick }: { label: string; items: AreaTab[]; cur: string; pick: (id: string) => void }) {
  const bar = useRef<HTMLDivElement>(null), ink = useRef<HTMLElement>(null), at = useRef<number | null>(null);
  const place = () => {   // 고른 탭 밑에 잉크 한 면(메인 탭 줄과 같은 셈 · 옮겨 갈 때 가는 쪽 끝이 먼저)
    const el = bar.current, k = ink.current; if (!el || !k) return;
    const on = el.querySelector<HTMLElement>(".nm-tab.on");
    if (!on) { k.style.opacity = "0"; at.current = null; return; }
    const l = on.offsetLeft, r = el.clientWidth - (l + on.offsetWidth), was = at.current;
    k.dataset.dir = was === null ? "none" : l > was ? "r" : l < was ? "l" : k.dataset.dir || "none";
    k.style.left = `${l}px`; k.style.right = `${r}px`; k.style.opacity = "1";
    at.current = l;
  };
  useLayoutEffect(place);
  useEffect(() => {   // 창 폭이 바뀌면 다시(이름이 접히는 폭도 여기서 따라옴)
    const el = bar.current; if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => { at.current = null; place(); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div ref={bar} className="nm-tabs nm-area" role="tablist" aria-label={label} data-n={items.length}>
      <i ref={ink} className="nm-tabs-ink" data-dir="none" aria-hidden />
      {items.map((t) => (
        <div key={t.id} role="tab" aria-selected={cur === t.id} tabIndex={0} title={t.name} className={`nm-tab${cur === t.id ? " on" : ""}`}
          onClick={() => pick(t.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(t.id); } }}>
          <span className="nm-tab-ic" aria-hidden><DuetIcon name={t.icon} size={14} /></span>
          <span className="nm-tab-nm">{t.name}</span>
        </div>
      ))}
    </div>
  );
}
