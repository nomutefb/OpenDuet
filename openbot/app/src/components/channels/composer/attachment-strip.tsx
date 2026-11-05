import { IconFile, IconX } from "@tabler/icons-react";
import { motion, useReducedMotion } from "motion/react";
import { useSyncExternalStore } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { EASE_OUT, ENTRANCE_SECONDS } from "@/lib/motion";
import { Collapse } from "./collapse";

/**
 * WHAT IS ON THE COMPOSER, DRAWN AS ITS OWN ROW ACROSS THE TOP.
 *
 * `PromptArea` will draw this strip itself, given `images` and `files`, and it did until this
 * existed. Three things were wrong with that, and all three come from the same fact: the strip is
 * inside the editor's column, and on the compact composer that column is the MIDDLE of a row whose
 * first child is the attach button.
 *
 * So the strip started 42px in from the composer's left edge, hanging off nothing, instead of
 * lining up with the frame the way every reference composer draws it. Its thumbnails are a
 * hardcoded `h-16 w-16` with no prop to say otherwise. And its padding is a hardcoded `pb-2`,
 * which this file previously reached in and overrode by class name.
 *
 * Each of those could be forced from outside with a selector into somebody else's DOM, and for a
 * while one of them was. Three of them stacked is a component we have forked in CSS without saying
 * so, and it breaks silently on the next `prompt-area` release. Fifty lines of our own markup is
 * the cheaper of the two.
 *
 * Both composer branches use this, so there is one strip in the app rather than a compact one and
 * a full-size one that drift.
 */

/**
 * `url` is empty while the upload is in flight — the SDK has no bytes to point at yet — which is
 * why `loading` is not merely cosmetic here: an `<img src="">` re-requests the whole page in some
 * browsers, and React says so in the console.
 */
export type StagedImage = {
  id: string;
  url: string;
  alt?: string;
  size?: number;
  loading: boolean;
};

/** 첨부 타일 머리표 = 「0.4MB · PNG」(형 11-05 09:13 「파일 올리면, 파일 용량이랑 0.4MB · 확장자 이렇게 나오게해주라」) */
const mbOf = (bytes?: number) => (bytes === undefined ? "" : `${Math.max(0.1, Math.round((bytes / 1048576) * 10) / 10)}MB`);
const extOf = (name?: string) => { const m = /\.([A-Za-z0-9]{1,6})$/.exec(name || ""); return m ? m[1].toUpperCase() : ""; };
const tagOf = (name?: string, bytes?: number) => [mbOf(bytes), extOf(name)].filter(Boolean).join(" · ");

/**
 * 「압축 ON / 원본」 다리 = nomute 쪽이 window.nmCompress 로 걸어 둠(nomute/shim/attachments.ts) · 없으면 스위치·블릿 없이 전과 같음
 * 형 11-05 「첨부할때, 디폴트값은 압축인데, 압축이라고 온 켜져있는 걸 토글하면 원본 으로 바뀌뀌고, 원본으로 전달되게해줘」
 */
type CompressBridge = {
  get: () => boolean;
  set: (on: boolean) => void;
  subscribe: (fn: () => void) => () => void;
  snapshot: () => number;
  info: (id: string) => { name: string; size: number; packed: boolean; pending: boolean; media: boolean } | undefined;
};
const bridge = () => (typeof window === "undefined" ? undefined : (window as unknown as { nmCompress?: CompressBridge }).nmCompress);
const noSubscribe = () => () => {};
const zero = () => 0;
function useCompress() {
  const b = bridge();
  useSyncExternalStore(b?.subscribe ?? noSubscribe, b?.snapshot ?? zero, zero);
  return b;
}
/** 사진 타일 주소 = /api/attachments/<nomute 첨부 id>(입력칸 id 와 다름) → 그 id 로 보낼 판을 물음 */
const shimIdOf = (url: string) => /\/api\/attachments\/([^/?#]+)$/.exec(url)?.[1];
const VIDEO_EXT = /\.(mp4|mov|m4v|webm|mkv|avi|3gp)$/i;
const ORIGINAL_TONE = "text-[#CFFF40]";   // 원본 = 시그니처 라임(형 11-05 10:44 「원본이라는 글자 시그니처 라임으로」 · 앞 판 = 주황)

export type StagedFile = {
  id: string;
  name: string;
  size?: number;
  loading: boolean;
  /**
   * The model reads at most MAX_EXTRACTED_CHARACTERS of a text file, while
   * the pick ceiling is MAX_FILE_BYTES. A file over the first may be read
   * truncated — warned on the tile, never refused.
   */
  mayTruncate?: boolean;
};

export function AttachmentStrip({
  files,
  images,
  onRemove,
}: {
  files: readonly StagedFile[];
  images: readonly StagedImage[];
  onRemove: (id: string) => void;
}) {
  const occupied = images.length > 0 || files.length > 0;
  const compress = useCompress();
  const on = compress?.get() ?? true;
  // 스위치 = 사진·영상이 하나라도 있을 때만(형 「이거는 사진, 영상 공통이야. 다른거는 애초에 원본으로 가야하고.」)
  const hasMedia = images.length > 0 || files.some((file) => VIDEO_EXT.test(file.name));

  return (
    /*
     * `items-start` rather than a stretch, so a wrapped second line of thumbnails sits under the
     * first rather than growing to match the tallest thing on its own line.
     *
     * The list stays mounted while empty, which is what gives `Collapse` something to measure: a
     * box with nothing in it cannot report the height it is meant to animate to.
     *
     * `aria-hidden` is the price of that, and it is not optional. Height 0 under `overflow-hidden`
     * is a VISUAL state and nothing more — it does not take an element out of the accessibility
     * tree the way `display: none` does. Left as it was, a composer carrying nothing still offered
     * a screen reader a labelled list to walk into and announce as "Attachments, list, 0 items".
     * Empty and unheard is the state we want; empty is only half of it.
     *
     * Hiding a subtree that contains something focusable is its own defect, and this cannot commit
     * it: `occupied` is false exactly when both lists are empty, so there is nothing inside to
     * reach when the attribute is on.
     */
    <Collapse open={occupied}>
      <ul
        aria-hidden={!occupied}
        aria-label="Attachments"
        className="flex flex-wrap items-start gap-2 pb-3"
      >
        {compress && hasMedia ? (
          <li className="flex shrink-0 items-center self-center">
            <button
              aria-checked={on}
              aria-label="사진·영상 압축해서 보내기"
              className={`rounded-full border px-2.5 py-1 font-semibold text-[11px] leading-4 transition-colors ${on ? "border-primary/40 bg-primary/15 text-primary" : `border-border bg-muted ${ORIGINAL_TONE}`}`}
              onClick={() => compress.set(!on)}
              role="switch"
              type="button"
            >
              {on ? "압축 ON" : "원본"}
            </button>
          </li>
        ) : null}
        {images.map((image) => (
          <Staged key={image.id}>
            {image.loading || image.url === "" ? (
              /*
               * The placeholder stands in for the picture, so it carries the picture's role and
               * the picture's name — otherwise the tile is a shape and nothing else, and the only
               * thing a screen reader finds in it is a button offering to remove something
               * unnamed. The file tile has said "Uploading…" in plain text since it was written.
               *
               * A name, not an announcement. `role="status"` would make each of these a live
               * region, and a paste of eight images would interrupt eight times to say so.
               */
              <Skeleton
                aria-label={`${image.alt ?? "Attachment"}, uploading`}
                className="size-20 rounded-xl"
                role="img"
              />
            ) : (
              <img
                alt={image.alt ?? "Attachment"}
                className="size-20 rounded-xl border border-border object-cover"
                src={image.url}
              />
            )}
            <ImageTag compress={compress} image={image} />
            <RemoveButton
              name={image.alt ?? "attachment"}
              onRemove={() => onRemove(image.id)}
            />
          </Staged>
        ))}
        {files.map((file) => (
          /*
           * The same height as a thumbnail, so a message carrying one of each reads as one row of
           * attachments rather than as two things that happened to land next to each other.
           */
          <Staged
            className="flex h-20 w-40 flex-col justify-between rounded-xl border border-border bg-muted/40 p-2"
            key={file.id}
          >
            {/*
             * `shrink-0` because the tile's height is fixed and the text below it is not. A third
             * line, which is exactly what the truncation warning adds, takes the extra out of the
             * only child that can give: this icon. It renders visibly smaller on precisely the
             * tiles that carry the warning, which is the wrong moment to look broken.
             */}
            <IconFile className="size-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="truncate font-medium text-xs" title={file.name}>
                {file.name}
              </p>
              {file.loading ? (
                <p className="text-muted-foreground text-xs">Uploading…</p>
              ) : file.size === undefined ? null : (
                /*
                 * ON THE SIZE LINE, NOT UNDER IT, AND THAT IS A LAYOUT CONSTRAINT RATHER THAN A
                 * PREFERENCE. The tile's height is fixed so that a file and a thumbnail read as
                 * one row. A third line does not fit: measured in Chromium at this repository's
                 * 15px root, the two in-flow children need 63.75px inside a 58px box. Something
                 * has to give, and the only choices are the icon shrinking to 13px or the text
                 * spilling past the border. Folding the warning onto this line keeps two.
                 *
                 * `truncate` is the guarantee, not the wording: `formatBytes` is unbounded, so a
                 * large enough file would wrap this line and put the third one back. The short
                 * phrasing is what keeps it from ellipsizing at any realistic size; `title`
                 * carries the sentence that actually explains it.
                 */
                <p
                  className="truncate text-muted-foreground text-xs"
                  title={
                    file.mayTruncate === true
                      ? "The Bot reads only the first 120,000 characters of this file."
                      : undefined
                  }
                >
                  {tagOf(file.name, file.size) || formatBytes(file.size)}
                  {/* 사진·영상 아닌 파일 = 늘 원본(형 「다른거는 애초에 원본으로 가야하고」) · 영상 = 스위치를 원본으로 둘 때만 */}
                  {compress && (!VIDEO_EXT.test(file.name) || !on) ? <> · <span className={ORIGINAL_TONE}>원본</span></> : null}
                  {file.mayTruncate === true ? " · may be cut" : null}
                </p>
              )}
            </div>
            <RemoveButton name={file.name} onRemove={() => onRemove(file.id)} />
          </Staged>
        ))}
      </ul>
    </Collapse>
  );
}

/**
 * 사진 타일 왼쪽 위 = 보낼 판의 「0.9MB · JPG · 압축됨」 / 「4.2MB · PNG · 원본」(둘 중 하나 · 원본 = 강조색)
 * 형 11-05 「그 옆에 블릿 달아서 압축됨 원본 둘중 하나로만 뜨게해줄래? 원본이면 강조색으로」 · 「그때 용량하고 아까 말한 확장자 같이 알수있어야」
 * 다리가 없으면(원본 앱) 전처럼 「0.4MB · PNG」만
 */
function ImageTag({ compress, image }: { compress: CompressBridge | undefined; image: StagedImage }) {
  const id = shimIdOf(image.url);
  const info = id ? compress?.info(id) : undefined;
  const head = info ? tagOf(info.name, info.size) : tagOf(image.alt, image.size);
  if (!head) return null;
  // 타일이 좁아(80~88px) 한 줄에 다 안 들어가면 「· 압축됨」만 다음 줄로(블릿 간격 그대로)
  return (
    <span aria-hidden className="pointer-events-none absolute top-1 left-1 max-w-[calc(100%-0.5rem)] rounded-[9px] bg-black/65 px-1.5 py-px font-semibold text-[10px] text-white leading-4 tabular-nums italic">
      <span className="whitespace-nowrap">{head}</span>
      {info && !info.pending ? (
        <>
          {" "}
          <span className="whitespace-nowrap">
            · {info.packed ? "압축됨" : <span className={ORIGINAL_TONE}>원본</span>}
          </span>
        </>
      ) : null}
    </span>
  );
}

/**
 * One tile, arriving.
 *
 * Entrance only. It leaves the instant it is removed, because that is what the person asked for and
 * because an element held on screen by an animation is an element a test cannot prove is gone — see
 * the note on the collapse above.
 *
 * `layout` is what keeps the removal from reading as a glitch anyway: the tiles to the right of the
 * one that went slide into its place over the same 200ms rather than jumping on a single frame. It
 * is also why `scale` is motion's own prop here, where the rest of this app writes full transform
 * strings for hardware acceleration — a layout animation composes its own transform, and a literal
 * `transform` in `animate` would be overwritten by it mid-flight.
 */
function Staged({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.li
      animate={{ opacity: 1, scale: 1 }}
      className={className ? `relative ${className}` : "relative"}
      initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.85 }}
      layout
      transition={{ duration: ENTRANCE_SECONDS, ease: EASE_OUT }}
    >
      {children}
    </motion.li>
  );
}

/**
 * The label names the file, because a composer carrying four attachments otherwise offers a screen
 * reader four buttons all called "Remove".
 *
 * Inside the tile rather than hanging off its corner: the strip animates its own height inside an
 * `overflow-hidden` box, and anything outside the tile is clipped while that runs.
 */
function RemoveButton({
  name,
  onRemove,
}: {
  name: string;
  onRemove: () => void;
}) {
  return (
    <button
      aria-label={`Remove ${name}`}
      className="absolute top-1 right-1 grid size-5 place-items-center rounded-full border border-border bg-background/90 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
      onClick={onRemove}
      type="button"
    >
      <IconX className="size-3" />
    </button>
  );
}

/**
 * Whole kilobytes below a megabyte and one decimal above it. A staged attachment is capped at 8MB
 * (`shared/attachments.ts`), so this never has to reach gigabytes, and "0.1MB" for a 100KB text
 * file tells the reader less than "98KB" does.
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
