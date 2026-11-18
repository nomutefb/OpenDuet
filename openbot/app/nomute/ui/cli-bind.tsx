// 러너 「CLI 연결」 표 아래 — R2 에 닿는 손(몸마다 어느 Cloudflare 계정에 CLI 로 닿나) · 그록 계정 귀속
//   형 11-19: 「이거 지금 맥에 귀속된거면 맥 cli에도 저장되어잇다고 표기가 되어야함」 · 「그록봇들 cli연결은 잘 모르겠으면 일일히 물어서 조사해야함」 ·
//     「계정별로 귀속임. 게정은 총 3개야」 · 「러너에 들어가야하고 위 내용 들어가야함」
//   자료 = /ops.json 의 cli(에디터 metrics/ops-cli.json · 기계가 쌓는 게 아니라 훑은 사람이 고쳐 적는 표 · at = 훑은 때) — 살림 화면과 같은 답을 나눠 씀(더 안 받음)
//   옷 = 작동 표 표 옷(.nsb-acct) 그대로 · 긴 글만 줄바꿈(./cli-bind.css)
import "./cli-bind.css";
import { useQuery } from "@tanstack/react-query";
import { opsOpts } from "./ops-data";

export function CliBind() {
  const c = useQuery(opsOpts).data?.cli;
  if (!c) return null;
  const accts = Object.keys(c.accounts || {}), g = c.grok;
  return (
    <div className="nsb-acct nm-clibind" role="region" aria-label="계정 귀속" tabIndex={0}>
      <p className="nm-clibind-h">R2 에 닿는 손{c.at ? <small>{c.at} 훑음</small> : null}</p>
      <table>
        <thead><tr><th>Ego</th>{accts.map((a) => <th key={a}>R2 · {a}<small>{c.accounts![a]}</small></th>)}</tr></thead>
        <tbody>{(c.rows || []).map((r) => (
          <tr key={r.who}>
            <th scope="row">{r.who}</th>
            {accts.map((a, i) => { const v = Array.isArray(r[a]) ? (r[a] as string[]) : []; return <td key={a}>{v.length ? v.join(" · ") : "—"}{i === accts.length - 1 && r.note ? <small>{r.note}</small> : null}</td>; })}
          </tr>
        ))}</tbody>
      </table>
      {c.how ? <p className="nm-clibind-n">{c.how}</p> : null}
      {g ? (
        <>
          <p className="nm-clibind-h">그록 계정 귀속<small>형 11-19</small></p>
          <ul className="nm-clibind-g">
            {(g.accounts || []).map((a) => <li key={a.name}><b>{a.name}</b><span>{a.via}</span><em>{a.case === "1" ? "1 · 본계정 단위 가입 = 바로 귀속" : a.case === "2" ? "2 · 메일(플랫폼) 단위 가입 = 따로 확인" : ""}</em>{a.note ? <small>{a.note}</small> : null}</li>)}
          </ul>
          {(g.said || []).map((s) => <p key={s} className="nm-clibind-q">「{s}」</p>)}
          {g.todo ? <p className="nm-clibind-n">{g.todo}</p> : null}
        </>
      ) : null}
    </div>
  );
}
