// 탭 줄 아래 메뉴 줄(PC 두 칸 · 탭 줄과 같은 곳에서만) — 형 11-16 08:3x 구름 맥 창 · 영상(어두운 윗줄 메뉴 · 6초 · 60프레임)과 함께
//   「그거 끝나면 이거로 탭 아래 메뉴 만들어줘~ 네비게이션 들을 대체할거야」
//   꼴 = 영상 그대로: 글자 메뉴 한 줄(꺽쇠 달린 것 = 누르면 바로 아래로 판) · 판 = 아이콘 + 제목 + 옅은 설명 줄들 · 가름선 · 맨 아래 「… 열기」 한 줄
//   움직임 = 영상 프레임을 재서 맞춤(구름 11-16 · 판이 열리는 1초를 60프레임으로 · 줄 글자 밝기에서 판 바탕 몫을 뺀 값): 판 바탕 = 0.45초 고르게 · 줄 = 누른 뒤 0.09초에 첫 줄 시작 · 줄마다 0.086초씩 늦게 · 하나 0.62초 천천히 → 빠르게 → 천천히(절반 밝기 = 0.42 · 0.50 · 0.59 · 0.69 · 0.77초)
//     첫 판(08:5x)은 줄을 「빨리 뜨고 천천히 멎는」 꼴로 잡아 영상보다 0.25초쯤 일찍 밝아졌음(형 08:59 「탭이 영상 보내준거처럼 그대로 나와?」 → 다시 재서 고침) · 닫힘 0.15초 · 꺽쇠 뒤집힘 = ./chev.tsx 0.26초
//     더 빠르게(형 11-16 11:0x 구름 맥 창 「메뉴 좀 빠르게 켜져야할듯! 그리고 조금 너무 볼록하는낌? 글래스모피즘과는 좀 동떨어진늒미이라」) = 영상 박자(일곱 줄이 다 뜨기까지 1.2초)보다 줄임: 판 0.16초 · 첫 줄 0.02초 뒤 · 줄 사이 0.03초 · 줄 하나 0.26초(빨리 뜨고 천천히 멎음) → 일곱 줄 0.46초 · 넷 줄 0.37초 · 올려서 열기까지 0.07 → 0.04초 · 차례로 뜨는 꼴은 그대로
//   올리면 = 그 줄만 살짝 밝은 판(줄 사이를 미끄러짐) + 제목 · 아이콘 라임 · 맨 아래 줄도 같음
//   줄 내용 = 부른 쪽(./shell.tsx)이 지금 네비 그대로 넘김(뉴스 에디터 위 탭 셋 ./ned-tabs.ts · 서랍 위 탭 여섯 ./drawer-tabs.ts) — 여기선 그리기만(길 · 이름을 따로 안 적음)
//   서랍 표에 「글자 메뉴 + 아래로 열리는 판」은 없어서 새로 짬(꺽쇠 = ./chev.tsx · 아이콘 = DuetIcon · 이징 = --e-out 그대로)
import "./menu-bar.css";
import { type CSSProperties, type KeyboardEvent as RKE, useEffect, useRef, useState } from "react";
import { DuetIcon, type DuetIconName } from "@/components/duet/icons";
import { Chev } from "./chev";

export type MenuItem = { id: string; label: string; desc?: string; icon: DuetIconName; to: string; badge?: string };
export type MenuGroup = { id: string; label: string; to?: string; items?: MenuItem[]; foot?: { label: string; to: string } };

const STAGGER_MS = 30, FIRST_MS = 20, LEAVE_MS = 180, ENTER_MS = 40;   // 줄 사이 · 첫 줄 늦춤(영상: 판이 먼저 뜨고 0.08초 뒤 첫 줄) · 판 밖으로 나가면 닫기까지 · 올려서 열기까지(스쳐 지나가면 안 열림)
const fine = () => typeof matchMedia === "function" && matchMedia("(hover:hover) and (pointer:fine)").matches;

export function MenuBar({ groups, on }: { groups: MenuGroup[]; on?: string | null }) {
  const [open, setOpen] = useState<string | null>(null);
  const root = useRef<HTMLElement>(null), tm = useRef(0);
  const later = (f: () => void, ms: number) => { window.clearTimeout(tm.current); tm.current = window.setTimeout(f, ms); };
  const shut = () => { window.clearTimeout(tm.current); setOpen(null); };
  useEffect(() => {
    if (!open) return;
    const out = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) shut(); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { const b = root.current?.querySelector<HTMLElement>(`[data-mb="${open}"]`); shut(); b?.focus(); } };
    document.addEventListener("pointerdown", out, true); document.addEventListener("keydown", key); window.addEventListener("hashchange", shut);
    return () => { document.removeEventListener("pointerdown", out, true); document.removeEventListener("keydown", key); window.removeEventListener("hashchange", shut); };
  }, [open]);
  useEffect(() => () => window.clearTimeout(tm.current), []);
  // 줄 위 밝은 판 = 하나가 줄 사이를 미끄러짐(줄마다 바탕을 갖지 않음)
  const glide = (panel: HTMLElement | null, row: HTMLElement | null) => {
    const hl = panel?.querySelector<HTMLElement>(".nm-mb-hl"); if (!hl) return;
    if (!row) { hl.style.opacity = "0"; return; }
    const first = hl.style.opacity !== "1";
    if (first) hl.style.transition = "opacity .14s";   // 처음 올릴 땐 그 자리에서 뜸(위에서 날아오지 않게)
    hl.style.transform = `translate3d(0,${row.offsetTop}px,0)`; hl.style.height = `${row.offsetHeight}px`; hl.style.opacity = "1";
    if (first) requestAnimationFrame(() => { hl.style.transition = ""; });
  };
  const keys = (e: RKE<HTMLDivElement>) => {   // 판 안 ↑ ↓ = 줄 사이
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const rows = [...e.currentTarget.querySelectorAll<HTMLElement>("a")], i = rows.indexOf(document.activeElement as HTMLElement);
    e.preventDefault(); rows[(i + (e.key === "ArrowDown" ? 1 : rows.length - 1)) % rows.length]?.focus();
  };
  return (
    <nav ref={root} className="nm-menubar" aria-label="메뉴" onPointerLeave={() => { if (open) later(shut, LEAVE_MS); }} onPointerEnter={() => window.clearTimeout(tm.current)}>
      {groups.map((g) => {
        if (!g.items) return <a key={g.id} className={`nm-mb-top${on === g.id ? " on" : ""}`} href={`#${g.to}`} aria-current={on === g.id ? "page" : undefined} onPointerEnter={() => { if (open && fine()) later(shut, ENTER_MS); }}>{g.label}</a>;
        const isOpen = open === g.id;
        return (
          <div key={g.id} className="nm-mb-group" data-open={isOpen ? 1 : 0}>
            <button type="button" data-mb={g.id} className={`nm-mb-top has${on === g.id ? " on" : ""}`} aria-haspopup="true" aria-expanded={isOpen}
              onClick={() => { window.clearTimeout(tm.current); setOpen(isOpen ? null : g.id); }}
              onPointerEnter={() => { if (fine() && !isOpen) later(() => setOpen(g.id), open ? 0 : ENTER_MS); }}
              onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setOpen(g.id); requestAnimationFrame(() => root.current?.querySelector<HTMLElement>(`[data-mbp="${g.id}"] a`)?.focus()); } }}>
              {g.label}<Chev dir={isOpen ? "up" : "down"} size={13} className="nm-mb-chev" />
            </button>
            <div className="nm-mb-panel" data-mbp={g.id} role="group" aria-label={g.label} inert={isOpen ? undefined : true} onKeyDown={keys}
              onPointerLeave={(e) => glide(e.currentTarget, null)}>
              <i className="nm-mb-hl" aria-hidden />
              {g.items.map((it, i) => (
                <a key={it.id} className="nm-mb-row" href={`#${it.to}`} style={{ ["--d" as string]: `${FIRST_MS + i * STAGGER_MS}ms` } as CSSProperties} onClick={shut}
                  onPointerEnter={(e) => glide(e.currentTarget.parentElement, e.currentTarget)} onFocus={(e) => glide(e.currentTarget.parentElement, e.currentTarget)}>
                  <DuetIcon name={it.icon} className="nm-mb-ico" size={16} />
                  <span className="nm-mb-txt"><b>{it.label}{it.badge ? <em>{it.badge}</em> : null}</b>{it.desc ? <small>{it.desc}</small> : null}</span>
                </a>
              ))}
              {g.foot ? (
                <a className="nm-mb-row foot" href={`#${g.foot.to}`} style={{ ["--d" as string]: `${FIRST_MS + g.items.length * STAGGER_MS}ms` } as CSSProperties} onClick={shut}
                  onPointerEnter={(e) => glide(e.currentTarget.parentElement, e.currentTarget)} onFocus={(e) => glide(e.currentTarget.parentElement, e.currentTarget)}>
                  <span className="nm-mb-txt"><b>{g.foot.label}</b></span>
                </a>
              ) : null}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
