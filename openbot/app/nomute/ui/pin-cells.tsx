// PIN 칸 — 칸 넷이 한 입력칸(붙여 넣기 · 지우기 · 읽어 주기가 그대로 됨)
//   꼴 · 생각 = nomutefb/bencho blocks/one-time-code/Otp.tsx(「칸 여럿 · 입력은 하나」 · 숫자가 올라와 앉음 · 틀리면 줄이 떨고 비워짐) — 붙는 연출(칸이 합쳐지는 것 · 되풀이 틀)은 안 가져옴(잠금 설정 한 줄에 넘침)
//   숫자는 화면에 안 보임(점) · 다 차면 onFull 을 부르고 답을 기다림: true = 통과(부른 쪽이 다음 단계로) · false = 말없이 흔들림 · 글 = 흔들림 + 그 글(「PIN 번호가 틀립니다 (2/5)」)
import { useEffect, useRef, useState } from "react";
import "./pin-cells.css";
import "./notice-box.css";   // 작은 알약 단추(.nm-nb-btn) — 이 판이 서랍 창으로 따로 뜰 때도 꼴이 있게
import { buzz, sfx } from "./feel";
import { pinClean } from "./lock-pin";


export function PinCells({ title, len = 4, onFull, onCancel }: { title: string; len?: number; onFull: (pin: string) => Promise<true | false | string>; onCancel: () => void }) {
  const [code, setCode] = useState(""), [focus, setFocus] = useState(false), [shake, setShake] = useState(0), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false);
  const inp = useRef<HTMLInputElement | null>(null), live = useRef(true);
  useEffect(() => { live.current = true; inp.current?.focus({ preventScroll: true }); return () => { live.current = false; }; }, []);
  useEffect(() => { setCode(""); setMsg(""); inp.current?.focus({ preventScroll: true }); }, [title]);   // 단계가 바뀌면(확인 → 새 PIN → 다시) 비우고 다시 받음
  const change = (raw: string) => {
    if (busy) return;
    const next = pinClean(raw, len); setCode(next); if (next.length > code.length) sfx("tick");
    if (next.length < len) return;
    setBusy(true);
    onFull(next).then((r) => {
      if (!live.current) return;
      setBusy(false);
      if (r === true) return;
      setMsg(typeof r === "string" ? r : ""); setShake((n) => n + 1); setCode(""); sfx("buzz"); buzz(12);
      inp.current?.focus({ preventScroll: true });
    }, () => { if (live.current) { setBusy(false); setCode(""); setMsg("확인하지 못했습니다."); } });
  };
  return (
    <div className="nm-pinc" role="group" aria-label={title}>
      <p className="nm-pinc-t">{title}</p>
      <div key={shake} className="nm-pinc-row" data-focus={focus ? "" : undefined} data-shake={shake ? "" : undefined} style={{ width: len * 36 + (len - 1) * 7 }}>
        {Array.from({ length: len }, (_, i) => (
          <span key={i} className="nm-pinc-cell" data-at={i === Math.min(code.length, len - 1) ? "" : undefined} aria-hidden>{i < code.length ? <b /> : focus && i === code.length ? <i /> : null}</span>
        ))}
        {/* PIN 칸은 로그인이 아님 = 비밀번호 도우미 배지가 안 붙게(data-1p-ignore 등 · 원본 그대로) */}
        <input ref={inp} className="nm-pinc-in" value={code} inputMode="numeric" pattern="[0-9]*" autoComplete="off" maxLength={len} spellCheck={false} aria-label={`${title} — 숫자 ${len}자리`}
          data-1p-ignore data-lpignore="true" data-bwignore data-form-type="other"
          onChange={(e) => change(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onCancel(); } }} />
      </div>
      <p className="nm-pinc-msg" role="status">{msg}</p>
      <div className="nm-pinc-foot"><button type="button" className="nm-nb-btn" onClick={onCancel}>취소</button></div>
    </div>
  );
}
