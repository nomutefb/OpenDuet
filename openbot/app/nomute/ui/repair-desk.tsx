// 수리 접수 방 = 대화방 말고 접수 창구(형 10-28 22:28 「메모 기능만 하고 러너가 참고 해서 가져다 주면 될듯! … 접수창구만 하면 됨」 · 장부 office-meeting-view.md 22:39)
//   맨 위 = 「[수리] 한 줄 + 명세서」 넣는 칸 하나(글 먼저 → 명세서 파일 = 서버가 그 글로 접수 줄을 만듦 · 파일 받는 이 기본 = 윈터 PM · _files.js)
//   아래 = 접수 목록(서버 GET /api/office/repair · 먼저 접수된 게 위) — 줄마다 No · [구분] 항목 · 상태 · 신청자 · 명세서 · 이슈 #N · 줄 누름 = 처리 이력·상태 바꾸기(할 일 화면 RepairRow 그대로)
//   대화 말풍선·얼굴 줄 0 · 종료(완료) = 보관 보기 · 명세서 = 그 신청자가 그 접수 글 뒤(2분 앞까지) 같은 방에 올린 첫 파일
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { type OfficeMsg, office } from "../data/office";
import { RepairRow, type RepairItem } from "./today";

export const REPAIR_ROOM = "repair";
type FileMsg = OfficeMsg & { file_meta?: { path: string; name?: string }[] };
const SPEC_BEFORE = 2 * 60e3;   // 명세서를 접수 글보다 먼저 올린 경우(2분 안)

/** 접수 줄 → 명세서 파일(그 신청자가 그 접수 글 뒤 · 다음 접수 글 전에 올린 첫 파일) */
function specsOf(items: RepairItem[], msgs: FileMsg[]) {
  const out = new Map<number, { path: string; name: string }>();
  const files = msgs.filter((m) => m.files?.length).sort((a, b) => a.ts - b.ts);
  const used = new Set<string>();
  const byWho = new Map<string, RepairItem[]>();
  for (const it of items) if (it.from) byWho.set(it.from, [...(byWho.get(it.from) || []), it]);
  for (const list of byWho.values()) {
    list.sort((a, b) => (a.ts || 0) - (b.ts || 0));
    list.forEach((it, i) => {
      const from = (it.ts || 0) - SPEC_BEFORE, to = list[i + 1]?.ts ?? Infinity;
      const f = files.find((m) => m.who === it.from && m.ts >= from && m.ts < to && !used.has(m.id));
      if (!f) return;
      used.add(f.id);
      const p = String(f.files?.[0] || "");
      out.set(it.no, { path: p, name: f.file_meta?.find((x) => x.path === p)?.name || p.split("/").pop()?.replace(/^\d{8}_\d{4}_/, "") || p });
    });
  }
  return out;
}

export function RepairDesk({ lead, active = true }: { lead?: ReactNode; active?: boolean }) {
  const qc = useQueryClient();
  const repair = useQuery({ queryKey: ["nomute", "repair"], queryFn: () => office<{ items: RepairItem[] }>("repair").then((j) => j.items || []), refetchInterval: 60_000 });
  const msgs = useQuery({ queryKey: ["nomute", "repair-files"], queryFn: () => office<{ messages: FileMsg[] }>(`rooms/${REPAIR_ROOM}/messages?n=200`).then((j) => j.messages || []), staleTime: 15_000, refetchInterval: 60_000 });
  const [arcOn, setArcOn] = useState(false);
  const archive = useQuery({ queryKey: ["nomute", "repair", "archive", "latest"], queryFn: () => office<{ items: RepairItem[]; archive?: string }>("repair?archive=latest"), enabled: arcOn });
  const [text, setText] = useState(""), [file, setFile] = useState<File | null>(null), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const items = repair.data || [];
  const specs = useMemo(() => specsOf(items, msgs.data || []), [items, msgs.data]);
  const last = (msgs.data || []).at(-1)?.ts;
  useEffect(() => {   // 본 데까지(안 읽음 점) — 대화창과 같은 길 · 보이는 때만
    if (last && active) void office("seen", { method: "POST", body: JSON.stringify({ seen: { [REPAIR_ROOM]: { ts: last, at: Date.now() } } }) }).then(() => qc.invalidateQueries({ queryKey: ["nomute", "seen"] })).catch(() => {});
  }, [last, active]);   // eslint-disable-line react-hooks/exhaustive-deps

  const send = async () => {   // 글 먼저(서버가 접수 줄 · No) → 명세서 파일(「파일:」 줄 · 받는 이 = 윈터 PM)
    const raw = text.trim();
    if (!raw) { setErr("「[구분] 항목」 한 줄을 써 줘"); return; }
    setBusy(true); setErr("");
    try {
      const line = raw.startsWith("[수리]") ? raw : `[수리] ${raw}`;
      await office(`rooms/${REPAIR_ROOM}/messages`, { method: "POST", body: JSON.stringify({ text: line }) });
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        fd.set("room", REPAIR_ROOM);
        const res = await fetch("/api/office/files", { method: "POST", body: fd, credentials: "same-origin" });
        const j = (await res.json().catch(() => ({}))) as { ok?: boolean; why?: string };
        if (!res.ok || j.ok === false) throw new Error(`접수는 됐는데 명세서를 못 올림 — ${j.why || res.status}`);
      }
      setText(""); setFile(null); if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      for (const k of [["nomute", "repair"], ["nomute", "repair-files"], ["nomute", "rooms"]]) void qc.invalidateQueries({ queryKey: k });
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-3 pb-8 pt-[100px]">   {/* 위 여백 = 떠 있는 머리(사진+이름 · ui/shell.css .nm-head) */}
        {lead}
        <form className="rounded-3xl border border-border bg-card p-3" onSubmit={(e) => { e.preventDefault(); void send(); }}>
          <p className="text-sm font-semibold">수리 접수</p>
          <p className="text-xs text-muted-foreground">「[구분] 항목」 한 줄 + 명세서(docs/spec-template.md 꼴) · 받으면 러너가 이슈로 올리고 「접수 #N」</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm" placeholder="[화면] 회의실 단추가 안 눌림" aria-label="[구분] 항목 한 줄"
              value={text} onChange={(e) => setText(e.target.value)} disabled={busy} autoComplete="off" />
            <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-border px-3 py-2 text-xs hover:bg-foreground/5">
              <input ref={fileRef} type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} disabled={busy} />
              <span className="max-w-[12rem] truncate">{file ? file.name : "명세서 고르기"}</span>
            </label>
            <button type="submit" className="rounded-xl bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50" disabled={busy || !text.trim()}>{busy ? "보내는 중…" : "접수"}</button>
          </div>
          {err ? <p className="mt-2 text-xs text-destructive" role="alert">{err}</p> : null}
        </form>
        <div className="rounded-3xl border border-border bg-card p-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-semibold">접수 목록 <span className="tabular-nums text-muted-foreground">{items.length}</span></p>
            <span className="text-xs text-muted-foreground">{repair.isError ? `못 받았어 — ${repair.error.message}` : repair.isPending ? "받는 중…" : "먼저 접수된 게 위 · 줄 누르면 이력·상태"}</span>
          </div>
          {items.length ? <ul className="mt-1 flex flex-col divide-y divide-border">{items.map((x) => <RepairRow key={x.no} x={x} desk spec={specs.get(x.no)} />)}</ul>
            : repair.isPending ? null : <p className="mt-2 text-sm text-muted-foreground">지금 걸린 요청 없음 — 종료된 건 「보관 보기」</p>}
          <button type="button" className="mt-3 rounded-full border border-border px-3 py-1 text-xs" aria-pressed={arcOn} onClick={() => setArcOn((v) => !v)}>보관 보기</button>
          {arcOn ? (
            archive.isPending ? <p className="mt-2 text-xs text-muted-foreground">받는 중…</p> : archive.isError ? <p className="mt-2 text-xs text-destructive">{archive.error.message}</p> : (
              <div className="mt-2"><p className="text-xs font-semibold">보관 {archive.data?.archive || ""} · {(archive.data?.items || []).length}건</p>
                <ul className="flex flex-col divide-y divide-border">{(archive.data?.items || []).map((x) => <RepairRow key={x.no} x={x} arc desk spec={specs.get(x.no)} />)}</ul></div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
