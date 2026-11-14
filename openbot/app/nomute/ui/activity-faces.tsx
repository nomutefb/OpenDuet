// 활동 칸 = 얼굴 판(형 11-14 클라우드 세션 창 「솔직히 ui 개별론데」 — 글자 줄 17개 표 대신 얼굴로 한눈에)
//   갈래마다 한 줄: 멈춤(빨간 고리) → 받을 수 있음(라임 고리) → 일 → 쉼 → 모름(작고 흐린 얼굴)
//   얼굴 누름 = 그 줄의 까닭(서버가 준 note 그대로) · 판정은 서버 것만 읽는다(./activity-sum)
import { FaceImg } from "./faces";
import { ACT_KO, ACT_ORDER, type ActKind, actKind } from "./activity-sum";

type Row = { key: string; name: string; value?: string; state?: string; ready?: boolean; note?: string };

/** 얼굴 밑 한 마디 = 멈춤만(까닭) · 나머지는 갈래 이름이 이미 말한다 */
export const actSub = (r: Row, k: ActKind) => (k === "lost" ? String(r.value || "").replace(/^멈춤\s*·?\s*/, "") || "멈춤" : "");

export function ActivityFaces({ rows, pick, setPick }: { rows: Row[]; pick: string; setPick: (k: string) => void }) {
  const groups = ACT_ORDER.map((k) => ({ k, rs: rows.filter((r) => actKind(r) === k) })).filter((g) => g.rs.length);
  const on = rows.find((r) => r.key === pick);
  if (!rows.length) return <p className="nsb-empty nsb-af-empty">보고 아직 안 옴</p>;
  return (
    <div className="nsb-af">
      {groups.map(({ k, rs }) => (
        <section key={k} className="nsb-af-g" data-act={k} aria-label={`${ACT_KO[k]} ${rs.length}`}>
          <h4><b>{rs.length}</b>{ACT_KO[k]}</h4>
          <ul>
            {rs.map((r) => {
              const sub = actSub(r, k);
              return (
                <li key={r.key}>
                  <button type="button" className="nsb-af-f" aria-pressed={pick === r.key} title={[r.value, r.note].filter(Boolean).join(" · ")} onClick={() => setPick(pick === r.key ? "" : r.key)}>
                    <span className="nsb-af-ring"><FaceImg id={r.name} size={k === "unknown" ? 30 : 44} /></span>
                    <b>{r.name}</b>
                    {sub ? <small>{sub}</small> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {on ? <p className="nsb-why nsb-af-why"><b>{on.name}</b> {[on.value, on.note].filter(Boolean).join(" · ")}</p> : null}
    </div>
  );
}
