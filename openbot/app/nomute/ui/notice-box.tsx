// 공지 칸 하나 — 「공지」(설정)와 「그록봇 공지」(애들 화면 그록 쪽 애 펼침)가 같이 씀 · 셈 = ./notice-box-logic.ts
//   형 11-17 06:56 dm-bom(봄 옮김) 「… 설정칸 외부에서 판이랑 변경 일자를 카운트 관리할게 이력관리느낌으로 … 지금은 고치기 인데 연 다음, 상단에 바로 수정 버튼 누르면 고침 상태로 전환되고 맨 아래에 닫기랑 저장이 같이 있고. 저장 누르면 부드럽게 닫히고 …」
//   · 06:57 「이건 중요하니까 백단에서 처리말고 게이지 알약 체크 저장됨 까지 가자」
//   꼴: 닫힌 줄 오른쪽(칸 밖) = 「판 N · 날짜」(useNoteMeta · 서버 ver · at) → 줄을 누르면 열림(읽기) → 위 「수정」 → 고침 상태 → 맨 아래 「닫기」 · 「저장」
//       저장 = 게이지 알약(./go-button) → 체크 → 「저장됨」 → 부드럽게 접힘(onClose) · 쓰던 글이 있는데 닫기 = 그 자리 [아니오] [닫기](되묻는 창 0 · ./morph-ask)
//   앞 꼴 = ./settings-extra.tsx NomuteNotice(「고치기」 · 「저장(새 판)」 · 「취소」) · ./grok-note.tsx(메모 · 되묻는 창) — 이 부품 하나로 갈음
import { still as lessStill } from "./less-move";   // 움직임 줄이기 = 기기 설정 또는 앱 스위치(설정 › 화면)
import "./notice-box.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { office } from "../data/office";
import { GoButton } from "./go-button";
import { MorphAsk } from "./morph-ask";
import { t12 } from "./when";
import { SrvNote } from "./srv-note";   // 못 받음 = 서버 안내 한 꼴(형 11-18 22:0x)
import { reading } from "./wait-text";
import { NOTE_MAX, NOTE_NAME, NOTE_PATH, type Note, type NoteKind, canSave, dayKo, failKo, histKo, metaKo, readNote, saveBody } from "./notice-box-logic";

const keyOf = (kind: NoteKind) => ["nomute", "note", kind] as const;
const load = (kind: NoteKind) => office<unknown>(NOTE_PATH[kind]).then((j) => { const n = readNote(j); if (!n) throw new Error("글이 없는 답"); return n; });
const useNote = (kind: NoteKind) => useQuery({ queryKey: keyOf(kind), queryFn: () => load(kind), staleTime: 30_000 });
/** 닫힌 줄 오른쪽 한 마디(칸 밖) — 「판 24 · 11-17」. */
export const useNoteMeta = (kind: NoteKind): string => metaKo(useNote(kind).data);

const LEAVE_MS = 280, SAVED_MS = 760;
export function NoticeBox({ kind, onClose }: { kind: NoteKind; onClose: () => void }) {
  const qc = useQueryClient(), q = useNote(kind), n = q.data;
  const [draft, setDraft] = useState<string | null>(null), [why, setWhy] = useState(""), [saved, setSaved] = useState(false), [leave, setLeave] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => { timers.current.forEach((t) => window.clearTimeout(t)); }, []);
  const close = () => {   // 부드럽게 접힌 뒤 줄을 닫음(움직임 줄이기 = 바로)
    const still = lessStill();
    if (still) { onClose(); return; }
    setLeave(true); timers.current.push(window.setTimeout(onClose, LEAVE_MS));
  };
  if (!n) return q.isError ? <SrvNote what={NOTE_NAME[kind]} detail={q.error instanceof Error ? q.error.message : undefined} className="tight" /> : <p className="nm-nb-wait">{reading()}</p>;
  const edit = draft !== null, dirty = edit && draft !== n.text, hist = histKo(n);
  const save = async (): Promise<Note> => {
    setWhy("");
    try {
      const got = readNote(await office<unknown>(NOTE_PATH[kind], { method: "POST", body: JSON.stringify(saveBody(draft ?? "", n)) }));
      return got || { ...n, text: draft ?? n.text };
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e); setWhy(failKo(m));
      if (/changed|base|conflict|409/i.test(m)) void qc.invalidateQueries({ queryKey: keyOf(kind) });   // 그 사이 바뀜 = 새 판을 읽어 둠(쓰던 글은 그대로 남음)
      throw e;
    }
  };
  const done = (got: Note) => {   // 체크 뒤 = 「저장됨」을 잠깐 보여 주고 접힘
    qc.setQueryData(keyOf(kind), got.ver || got.at ? got : n); void qc.invalidateQueries({ queryKey: keyOf(kind) });
    setSaved(true); timers.current.push(window.setTimeout(close, SAVED_MS));
  };
  return (
    <div className="nm-nb" data-leave={leave || undefined} data-edit={edit || undefined}>
      <div className="nm-nb-in">
        <div className="nm-nb-top">
          <small data-content>{[n.by, n.at ? `${dayKo(n.at)} ${t12(n.at)}` : ""].filter(Boolean).join(" · ")}</small>
          {n.can_edit && !edit ? <button type="button" className="nm-nb-btn" onClick={() => { setDraft(n.text); setWhy(""); }}>수정</button> : null}
        </div>
        {why ? <p className="nm-nb-why" role="alert">{why}</p> : null}
        {edit ? <textarea className="nm-nb-ta" value={draft} maxLength={NOTE_MAX} disabled={saved} onChange={(e) => setDraft(e.target.value)} aria-label={`${NOTE_NAME[kind]} 글`} />
          : <p data-content className="nm-nb-text">{n.text}</p>}
        {edit ? (
          <div className="nm-nb-foot">
            {saved ? <span className="nm-nb-saved" role="status">저장됨</span> : <>
              {dirty ? <MorphAsk className="nm-nb-btn" yesText="닫기" label={`${NOTE_NAME[kind]} 닫기`} onYes={close}>닫기</MorphAsk>
                : <button type="button" className="nm-nb-btn" onClick={close}>닫기</button>}
              <GoButton className="nm-nb-btn nm-nb-go" disabled={!canSave(draft, n)} go={save} done={done} busy="저장 중">저장</GoButton>
            </>}
          </div>
        ) : hist.length ? <p className="nm-nb-hist" data-content>지난 판 {hist.join(" / ")}</p> : null}
      </div>
    </div>
  );
}
