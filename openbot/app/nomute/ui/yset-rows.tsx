// 설정 줄 두 꼴(예타 줄 .yset-item 그대로 + 하네스 부품) — 형 11-18 「좋아, 다 반영해주라」
//   PickRow = 하나 고르기(레일이 줄 오른쪽 · 좁으면 아랫줄로) · SwRow = 켜고 끄기(스위치 .si-sw) — 누를 때마다 다음 값으로 넘기던 줄(값이 안 보임)을 대신함
import type { ReactNode } from "react";
import { sfx } from "./feel";
import { type RailOpt, SnapRail } from "./snap-rail";
import { YICO, type YIcon } from "./yeta-icons";

const Ic = ({ ic }: { ic: YIcon }) => <span className="si-ic" data-ic={ic} aria-hidden dangerouslySetInnerHTML={{ __html: YICO[ic] }} />;   // data-ic = 누름 재생 짝(./ua-play.ts)

/** 하나 고르기 줄 — [픽토][이름] ……… [레일] */
export function PickRow<T extends string>({ id, ic, t, options, value, onPick }: { id: string; ic: YIcon; t: string; options: RailOpt<T>[]; value: T; onPick: (v: T) => void }) {
  return (
    <div className="yset-item yset-pick" data-pick={id}>
      <Ic ic={ic} />
      <span className="si-lbl"><span className="si-t">{t}</span></span>
      <SnapRail id={`set-${id}`} label={t} options={options} value={value} onPick={onPick} />
    </div>
  );
}

/** 켜고 끄기 줄 — 줄 어디를 눌러도 바뀜 · v = 켜진 값 덧글(예 「10분」) */
export function SwRow({ ic, t, on, onFlip, v, busy }: { ic: YIcon; t: string; on: boolean; onFlip: (next: boolean) => void; v?: ReactNode; busy?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-busy={busy || undefined} className={`yset-item${on ? " on" : ""}`} onClick={() => { sfx("tick"); onFlip(!on); }}>
      <Ic ic={ic} />
      <span className="si-lbl"><span className="si-t">{t}</span></span>
      {v ? <span className="si-v"><i className="si-vv">{v}</i></span> : null}
      <span className="si-sw" aria-hidden />
    </button>
  );
}
