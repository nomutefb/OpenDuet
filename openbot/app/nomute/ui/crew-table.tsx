// 애들 × 연결 한 표(러너 층 · ./status-board.tsx 가 부름) — 띠마다 작은 표 · 이름 줄 되풀이 · 셈 = ./crew-table-logic.ts
//   형 11-19 「cli연결하고 애들 x연결하고 통합시켜줘. 하나로. 보기 좋게 제일 깔끔하게.」 · 「행 인덱싱이 반복되도되니까」 · 「설명글을 추가할필요는없고」
//   칸 = 점(● ▲ ✕ ○) + 꼭 필요한 글만 · 긴 글 = 줄을 누르면 그 줄 밑에 · 움직임 0(가만한 표)
import "./crew-table.css";
import { Fragment, useState } from "react";
import { idOf } from "../data/office";
import { FaceImg, usePeople } from "./faces";
import { HEALTH_KO, StatusDot } from "./sched-bits";
import type { BRow, Band, CCell, Col } from "./crew-table-logic";

const agoEn = (ms: number) => { const m = Math.round((Date.now() - ms) / 60e3); return m < 1 ? "방금" : m < 60 ? `${m}분 전` : m < 1440 ? `${Math.floor(m / 60)}시간 전` : `${Math.floor(m / 1440)}일 전`; };
const tip = (c: Col, x: CCell) => [c.title, HEALTH_KO[x.st], x.note].filter(Boolean).join(" · ");

function cellsOf(b: Band, r: BRow) {
  const out = [];
  for (let i = 0; i < b.cols.length; i++) {
    const c = b.cols[i], x = r.cells[c.id];
    if (r.wide && r.wide.from === c.id) { out.push(<td key={c.id} colSpan={r.wide.n} className="w">{r.wide.text}</td>); i += r.wide.n - 1; continue; }
    if (x === undefined) out.push(<td key={c.id} />);
    else if (x === null) out.push(<td key={c.id} className="no" title={`${c.title} · 기록 없음`}><b>–</b></td>);
    else if (x.kind === "dash") out.push(<td key={c.id} className="dash" title={tip(c, x)}><b>–</b></td>);
    else if (x.kind === "tag") out.push(<td key={c.id} className="tag" title={tip(c, x)}><b>{x.label}</b></td>);
    else out.push(<td key={c.id} data-st={x.st} title={tip(c, x)}><StatusDot st={x.st} />{x.label ? <em>{x.label}</em> : null}</td>);
  }
  return out;
}

/** 줄을 누르면 = 그 줄 칸들의 까닭(글이 있는 칸만 · 한 칸 한 줄) · rclone = 붙은 것 이름(종류 · 계정)만 */
const itemsKo = (x: CCell) => (x.items || []).map((it) => `${it.name || it.account || ""}${it.type ? `(${it.type})` : ""}${it.user ? ` ${it.user}` : ""}`).filter(Boolean).join(" · ");
function Why({ b, r }: { b: Band; r: BRow }) {
  const list = b.cols.map((c) => ({ c, x: r.cells[c.id] })).filter((v): v is { c: Col; x: CCell } => !!v.x && (!!v.x.note || !!v.x.items?.length || v.x.st === "miss" || v.x.st === "late"));
  if (!list.length) return <span className="none">{r.wide?.text || "적힌 것 없음"}</span>;
  return <dl>{list.map(({ c, x }) => <Fragment key={c.id}><dt>{c.title}</dt><dd data-st={x.st}>{x.items?.length ? itemsKo(x) : x.note || HEALTH_KO[x.st]}{x.items?.length && x.at ? ` · ${agoEn(x.at)}` : ""}</dd></Fragment>)}</dl>;
}

function BandTable({ b, pick, setPick }: { b: Band; pick: string; setPick: (k: string) => void }) {
  const people = usePeople();
  const groups: { name: string; n: number }[] = [];
  for (const c of b.cols) { const l = groups[groups.length - 1]; if (l && l.name === c.grp) l.n++; else groups.push({ name: c.grp, n: 1 }); }
  return (
    <section className="nm-ct-band" data-band={b.id} aria-label={b.name}>
      <table>
        <thead>
          <tr className="g"><th scope="col" className="t">{b.name}</th>{groups.map((g, i) => <th key={`${g.name}:${i}`} colSpan={g.n} scope="colgroup"><span>{g.name}</span></th>)}</tr>
          <tr className="c"><th />{b.cols.map((c) => <th key={c.id} scope="col" title={c.title}>{c.name}{c.common ? <small>{c.common}</small> : null}</th>)}</tr>
        </thead>
        <tbody>
          {b.rows.map((r) => {
            const k = `${b.id}:${r.who}`, open = pick === k;
            return (
              <Fragment key={r.who}>
                <tr data-fam={r.fam} className={r.sep ? "sep" : undefined} aria-expanded={open} onClick={() => setPick(open ? "" : k)}>
                  <th scope="row"><span className="who"><FaceImg id={idOf(r.who, people)} size={16} />{r.who}</span></th>
                  {cellsOf(b, r)}
                </tr>
                {open ? <tr className="why"><td colSpan={b.cols.length + 1}><Why b={b} r={r} /></td></tr> : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

export function CrewTable({ bands }: { bands: Band[] }) {
  const [pick, setPick] = useState("");
  return <div className="nm-ct">{bands.map((b) => <BandTable key={b.id} b={b} pick={pick} setPick={setPick} />)}</div>;
}
