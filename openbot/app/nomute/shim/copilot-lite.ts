// 첨부 훅 — CopilotKit v2 `useAttachments` 의 우리 판(번개 11-08 · 형 07:23 「ㄱㄱ」 · ① 첫 화면 무게 3판)
//   왜: 원본 입력칸(app/src/components/channels/composer/composer.tsx)이 CopilotKit 에서 쓰는 건 이 훅 하나(+ 타입 둘)인데, 그 import 하나가
//       @copilotkit/react-core · core · ag-ui · a2ui · zod v3 · rxjs 를 첫 화면에 실었다(라이브 8ce2b33 실측 v-copilot gz 218KB + CSS 14KB).
//   뜻은 원본 그대로(react-core 1.77 useAttachments): 고른 파일 → 자리표(status uploading) → config.onUpload 로 올림 → ready(source · metadata 바꿔 끼움)
//       실패 = 자리표 빼고 onUploadFailed({ reason, file, message }) · 올리기는 한 번에 하나(maxConcurrentUploads 기본 1 · 줄 서서) · 돌려주는 함수는 다 useCallback(참조 안정)
//   원본 composer 가 안 쓰는 것(영상 썸네일 · containerRef 붙여넣기 · handleDrop · handleFileUpload)은 꼴만 맞추고 가볍게 둠(composer 는 드롭·붙여넣기·input 을 제 손으로 함)
//   바꿔 끼우는 자리 = overrides.ts PATCH composer.tsx 「} from "@copilotkit/react-core/v2";」 → 이 파일
import { type ChangeEvent, type DragEvent, type RefObject, useCallback, useEffect, useRef, useState } from "react";

export type AttachmentType = "image" | "video" | "audio" | "document";
export type AttachmentStatus = "uploading" | "ready";
export type AttachmentSource = { type: "data"; value: string; mimeType: string } | { type: "url"; value: string; mimeType?: string };
export type Attachment = { id: string; type: AttachmentType; source: AttachmentSource; filename?: string; size?: number; status: AttachmentStatus; thumbnail?: string; metadata?: unknown };
export type AttachmentUploadResult = AttachmentSource & { metadata?: unknown };
export type AttachmentUploadError = { reason: "upload-failed" | "invalid-type" | "file-too-large"; file: File; message: string };
export type AttachmentsConfig = {
  enabled?: boolean;
  /** 받는 꼴 — 별/별(다 받음) 또는 쉼표 목록(".png" 꼴 = 파일 이름 끝 · "image/*" = 앞머리 · 그 밖 = 그대로 같음) */
  accept?: string;
  maxSize?: number;
  maxConcurrentUploads?: number;
  onUpload?: (file: File) => Promise<AttachmentUploadResult>;
  onUploadFailed?: (error: AttachmentUploadError) => void;
};

export const DEFAULT_MAX_SIZE = 20 * 1024 * 1024;

/** 파일 꼴 → 첨부 종류(원본 getModalityFromMimeType 와 같음 · 그림·영상·소리 아니면 문서) */
export function modalityOf(mime: string | undefined): AttachmentType {
  const m = (mime || "").toLowerCase();
  return m.startsWith("image/") ? "image" : m.startsWith("video/") ? "video" : m.startsWith("audio/") ? "audio" : "document";
}
/** accept 거름(원본 matchesAcceptFilter 와 같음) — 빈 값·별/별 = 다 받음 */
export function matchesAcceptFilter(file: { name: string; type: string }, accept: string | undefined): boolean {
  const list = String(accept ?? "*/*").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (list.length === 0 || list.includes("*/*") || list.includes("*")) return true;
  const type = (file.type || "").toLowerCase(), name = (file.name || "").toLowerCase();
  return list.some((f) => (f.startsWith(".") ? name.endsWith(f) : f.endsWith("/*") ? type.startsWith(f.slice(0, -1)) : type === f));
}
export const exceedsMaxSize = (file: { size: number }, maxSize: number) => file.size > maxSize;
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}
/** 한 번에 몇 개 올리나 — 숫자 아니면 1 · 1 아래로는 안 감 · Infinity = 줄 선 만큼 */
export const resolveMaxConcurrentUploads = (configured: unknown) => (typeof configured !== "number" || Number.isNaN(configured) ? 1 : Math.max(1, Math.floor(configured)));
/** 자리표 id — https 가 아니면 crypto.randomUUID 가 없을 수 있어(원본 composer 주석) 그땐 시각+난수 */
const newId = () => (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `att-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);
const readFileAsBase64 = (file: File) => new Promise<string>((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(",")[1] ?? ""); r.onerror = () => no(r.error); r.readAsDataURL(file); });

export type UseAttachmentsReturn = {
  attachments: Attachment[];
  enabled: boolean;
  dragOver: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  processFiles: (files: File[]) => Promise<void>;
  handleFileUpload: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleDragOver: (e: DragEvent) => void;
  handleDragLeave: (e: DragEvent) => void;
  handleDrop: (e: DragEvent) => Promise<void>;
  removeAttachment: (id: string) => void;
  consumeAttachments: () => Attachment[];
};

type Queued = { file: File; placeholder: Attachment; cfg: AttachmentsConfig | undefined; settle: () => void };

export function useAttachments({ config }: { config?: AttachmentsConfig }): UseAttachmentsReturn {
  const enabled = config?.enabled ?? false;
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const configRef = useRef(config); configRef.current = config;
  const attachmentsRef = useRef<Attachment[]>([]); attachmentsRef.current = attachments;
  const queueRef = useRef<Queued[]>([]);
  const workersRef = useRef(0);

  const uploadFile = useCallback(async (file: File, placeholder: Attachment, cfg: AttachmentsConfig | undefined) => {
    try {
      let source: AttachmentSource; let metadata: unknown;
      if (cfg?.onUpload) { const { metadata: meta, ...rest } = await cfg.onUpload(file); source = rest as AttachmentSource; metadata = meta; }
      else source = { type: "data", value: await readFileAsBase64(file), mimeType: file.type };
      setAttachments((prev) => prev.map((a) => (a.id === placeholder.id ? { ...a, source, status: "ready", metadata } : a)));
    } catch (error) {
      setAttachments((prev) => prev.filter((a) => a.id !== placeholder.id));
      console.error(`[첨부] "${file.name}" 못 올림:`, error);
      cfg?.onUploadFailed?.({ reason: "upload-failed", file, message: error instanceof Error ? error.message : `Failed to upload "${file.name}"` });
    }
  }, []);

  const drain = useCallback(async () => {
    workersRef.current++;
    try {
      for (;;) {
        const item = queueRef.current.shift();
        if (!item) return;
        try { await uploadFile(item.file, item.placeholder, item.cfg); }
        catch (error) { console.error("[첨부] 올리기 일꾼 오류:", error); }
        finally { item.settle(); }
      }
    } finally { workersRef.current--; }
  }, [uploadFile]);

  const processFiles = useCallback(async (files: File[]) => {
    const cfg = configRef.current;
    const accept = cfg?.accept ?? "*/*", maxSize = cfg?.maxSize ?? DEFAULT_MAX_SIZE;
    for (const file of files.filter((f) => !matchesAcceptFilter(f, accept))) cfg?.onUploadFailed?.({ reason: "invalid-type", file, message: `File "${file.name}" is not accepted. Supported types: ${accept}` });
    const queued: { file: File; placeholder: Attachment }[] = [];
    for (const file of files.filter((f) => matchesAcceptFilter(f, accept))) {
      if (exceedsMaxSize(file, maxSize)) { cfg?.onUploadFailed?.({ reason: "file-too-large", file, message: `File "${file.name}" exceeds the maximum size of ${formatFileSize(maxSize)}` }); continue; }
      queued.push({ file, placeholder: { id: newId(), type: modalityOf(file.type), source: { type: "data", value: "", mimeType: file.type }, filename: file.name, size: file.size, status: "uploading" } });
    }
    if (queued.length === 0) return;
    setAttachments((prev) => [...prev, ...queued.map((q) => q.placeholder)]);
    const settled = queued.map(({ file, placeholder }) => new Promise<void>((resolve) => { queueRef.current.push({ file, placeholder, cfg, settle: resolve }); }));
    const limit = resolveMaxConcurrentUploads(cfg?.maxConcurrentUploads);
    const spawn = Math.min(queueRef.current.length, Math.max(0, limit - workersRef.current));
    for (let i = 0; i < spawn; i++) void drain();
    await Promise.all(settled);
  }, [drain]);

  const handleFileUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    try { await processFiles(Array.from(e.target.files)); } catch (error) { console.error("[첨부] 올리기 오류:", error); }
  }, [processFiles]);
  const handleDragOver = useCallback((e: DragEvent) => { if (!configRef.current?.enabled) return; e.preventDefault(); e.stopPropagation(); setDragOver(true); }, []);
  const handleDragLeave = useCallback((e: DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }, []);
  const handleDrop = useCallback(async (e: DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(false);
    if (!configRef.current?.enabled) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length) { try { await processFiles(files); } catch (error) { console.error("[첨부] 드롭 오류:", error); } }
  }, [processFiles]);

  // 붙여넣기(원본과 같이 containerRef 안에서만 · composer 는 ref 를 안 넘겨 사실상 쉼)
  useEffect(() => {
    if (!enabled) return;
    const onPaste = async (e: ClipboardEvent) => {
      const target = e.target as Node | null;
      if (!target || !containerRef.current?.contains(target)) return;
      const accept = configRef.current?.accept ?? "*/*";
      const files = Array.from(e.clipboardData?.items || []).filter((it) => it.kind === "file").map((it) => it.getAsFile()).filter((f): f is File => !!f && matchesAcceptFilter(f, accept));
      if (!files.length) return;
      e.preventDefault();
      try { await processFiles(files); } catch (error) { console.error("[첨부] 붙여넣기 오류:", error); }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [enabled, processFiles]);

  const removeAttachment = useCallback((id: string) => { setAttachments((prev) => prev.filter((a) => a.id !== id)); }, []);
  const consumeAttachments = useCallback(() => {
    const ready = attachmentsRef.current.filter((a) => a.status === "ready");
    if (ready.length === 0) return ready;
    setAttachments((prev) => prev.filter((a) => a.status !== "ready"));
    if (fileInputRef.current) fileInputRef.current.value = "";
    return ready;
  }, []);

  return { attachments, enabled, dragOver, fileInputRef, containerRef, processFiles, handleFileUpload, handleDragOver, handleDragLeave, handleDrop, removeAttachment, consumeAttachments };
}
