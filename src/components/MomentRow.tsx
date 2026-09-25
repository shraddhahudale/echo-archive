import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MoreHorizontal, Pause, Play, Users } from "lucide-react";
import { Chip } from "./Chip";
import {
  EDIT_FEELINGS,
  contributorInitial,
  contributorLabel,
  formatDuration,
  kindAccent,
  sanitizeFeelings,
} from "../data/archiveHelpers";
import type { Contributor, TimelineEntry } from "../data/types";
import { useArchiveStore } from "../store/useArchiveStore";

function phoneRoot() {
  return document.querySelector(".phone-frame");
}

type MomentRowProps = {
  entry: TimelineEntry;
  contributor?: Contributor;
  playing?: boolean;
  onPlay: () => void;
  titleOverride?: ReactNode;
};

export function MomentRow({ entry, contributor, playing, onPlay, titleOverride }: MomentRowProps) {
  const accent = kindAccent(entry.kind);
  const renameMoment = useArchiveStore((state) => state.renameMoment);
  const editMomentFeelings = useArchiveStore((state) => state.editMomentFeelings);
  const deleteMoment = useArchiveStore((state) => state.deleteMoment);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(entry.title ?? "");
  const [feelingsOpen, setFeelingsOpen] = useState(false);
  const [feelingDraft, setFeelingDraft] = useState(() => sanitizeFeelings(entry.feelings));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (renaming) {
      setDraft(entry.title ?? "");
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [renaming, entry.title]);

  const feelings = sanitizeFeelings(entry.feelings);
  const feeling = feelings[0];
  const personName = contributorLabel(contributor);
  const subtitleParts = [
    entry.durationSec != null ? formatDuration(entry.durationSec) : null,
    feeling,
  ].filter(Boolean);
  const title =
    entry.kind === "echo"
      ? `${personName}: ${entry.title ?? "Voice note"}`
      : (entry.title ?? "Untitled");

  function commitRename() {
    renameMoment(entry.id, draft.trim() || entry.title || "Untitled");
    setRenaming(false);
  }

  return (
    <>
      <article
        className="flex h-[72px] items-center gap-3 rounded-[16px] border border-[var(--line)] px-3 shadow-[var(--shadow-card)]"
        style={{ background: playing ? accent.tint50 : "white" }}
      >
        <button
          type="button"
          onClick={onPlay}
          className="flex min-w-0 flex-1 items-center gap-3 border-0 bg-transparent p-0 text-left"
        >
          <Thumbnail entry={entry} contributor={contributor} playing={playing} />
          <div className="min-w-0 flex-1">
            {renaming ? (
              <input
                ref={inputRef}
                value={draft}
                maxLength={40}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => setDraft(event.target.value)}
                onBlur={commitRename}
                onKeyDown={(event) => {
                  if (event.key === "Enter") commitRename();
                  if (event.key === "Escape") setRenaming(false);
                }}
                className="w-full border-0 border-b border-[var(--purple-500)] bg-transparent pb-0.5 text-[15px] leading-5 font-semibold text-[var(--text-900)] outline-none"
              />
            ) : (
              <p className="truncate text-[15px] leading-5 font-semibold text-[var(--text-900)]">
                {titleOverride ?? title}
              </p>
            )}
            <p className="truncate text-[13px] leading-4 text-[#8E8E93]">
              {entry.kind === "song" && entry.artist
                ? `${entry.artist}${feeling ? ` · ${feeling}` : ""}`
                : subtitleParts.join(" · ")}
            </p>
          </div>
        </button>
        <button
          type="button"
          aria-label={playing ? `Pause ${title}` : `Play ${title}`}
          onClick={onPlay}
          className="grid size-11 shrink-0 place-items-center border-0 bg-transparent p-0 text-[#3F3A4A]"
        >
          {playing ? <Pause size={22} strokeWidth={2} /> : <Play size={22} strokeWidth={2} />}
        </button>
        <button
          type="button"
          aria-label={`More options for ${title}`}
          onClick={() => setMenuOpen(true)}
          className="grid size-11 shrink-0 place-items-center border-0 bg-transparent p-0 text-[#8E8E93]"
        >
          <MoreHorizontal size={22} strokeWidth={2} />
        </button>
      </article>

      <ActionSheet open={menuOpen} onClose={() => setMenuOpen(false)} reduce={reduce}>
        <SheetAction
          label="Rename"
          onClick={() => {
            setMenuOpen(false);
            setRenaming(true);
          }}
        />
        <SheetAction
          label="Edit feelings"
          onClick={() => {
            setMenuOpen(false);
            setFeelingDraft(sanitizeFeelings(entry.feelings));
            setFeelingsOpen(true);
          }}
        />
        <SheetAction
          label="Delete"
          danger
          onClick={() => {
            setMenuOpen(false);
            setConfirmDelete(true);
          }}
        />
      </ActionSheet>

      <ActionSheet open={confirmDelete} onClose={() => setConfirmDelete(false)} reduce={reduce}>
        <p className="px-1 pb-3 text-center text-[15px] leading-5 text-[var(--text-900)]">
          Delete this moment? This can't be undone.
        </p>
        <SheetAction
          label="Delete"
          danger
          onClick={() => {
            deleteMoment(entry.id);
            setConfirmDelete(false);
          }}
        />
        <SheetAction label="Cancel" onClick={() => setConfirmDelete(false)} />
      </ActionSheet>

      <ActionSheet open={feelingsOpen} onClose={() => setFeelingsOpen(false)} reduce={reduce} tall>
        <p className="mb-3 text-[17px] leading-[22px] font-semibold text-[var(--text-900)]">Edit feelings</p>
        <p className="mb-4 text-[15px] leading-5 text-[#8E8E93]">How are you feeling right now?</p>
        <div className="flex flex-wrap gap-2">
          {EDIT_FEELINGS.map((feelingLabel) => (
            <Chip
              key={feelingLabel}
              label={feelingLabel}
              tone={accent.tone}
              selected={feelingDraft.includes(feelingLabel)}
              onClick={() =>
                setFeelingDraft((current) =>
                  current.includes(feelingLabel)
                    ? current.filter((item) => item !== feelingLabel)
                    : [...current, feelingLabel],
                )
              }
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            editMomentFeelings(entry.id, feelingDraft);
            setFeelingsOpen(false);
          }}
          className="mt-6 h-11 w-full rounded-full border border-[var(--line)] bg-white text-[13px] font-medium"
          style={{ color: accent.accent }}
        >
          Save feelings
        </button>
      </ActionSheet>
    </>
  );
}

function Thumbnail({
  entry,
  contributor,
  playing,
}: {
  entry: TimelineEntry;
  contributor?: Contributor;
  playing?: boolean;
}) {
  const accent = kindAccent(entry.kind);

  if (entry.kind === "song") {
    return (
      <span className="relative size-12 shrink-0 overflow-hidden rounded-[10px]">
        {entry.art ? (
          <img src={entry.art} alt="" className="size-full object-cover" />
        ) : (
          <span className="block size-full" style={{ background: "linear-gradient(145deg, var(--pink-200), var(--pink-500))" }} />
        )}
        {playing ? <PlayingBars /> : null}
      </span>
    );
  }

  if (entry.kind === "echo") {
    const initial = contributor ? contributorInitial(contributor) : "?";
    return (
      <span className="relative size-12 shrink-0">
        <span className="grid size-12 place-items-center rounded-[10px] bg-[var(--amber-50)] text-[15px] font-semibold text-[var(--amber-600)]">
          {contributor?.avatar ? (
            <img src={contributor.avatar} alt="" className="size-full rounded-[10px] object-cover" />
          ) : (
            initial
          )}
        </span>
        <span className="absolute -right-0.5 -bottom-0.5 grid size-3.5 place-items-center rounded-full bg-[var(--amber-500)] text-white">
          <Users size={8} strokeWidth={2.5} aria-hidden="true" />
        </span>
        {playing ? <PlayingBars /> : null}
      </span>
    );
  }

  return (
    <span
      className="relative grid size-12 shrink-0 place-items-center rounded-[10px]"
      style={{ background: accent.tint50 }}
    >
      {playing ? (
        <PlayingBars overlay={false} />
      ) : (
        <span className="flex h-6 items-end gap-[3px]" aria-hidden="true">
          {[10, 18, 8, 16, 12].map((height, index) => (
            <span
              key={index}
              className="w-[3px] rounded-full bg-[var(--purple-500)]"
              style={{ height }}
            />
          ))}
        </span>
      )}
    </span>
  );
}

function PlayingBars({ overlay = true }: { overlay?: boolean }) {
  const reduce = useReducedMotion();
  const bars = (
    <span className="flex h-5 items-end gap-[3px]" aria-hidden="true">
      {[0, 1, 2, 3].map((index) => (
        <motion.span
          key={index}
          className="w-[3px] rounded-full bg-white"
          animate={reduce ? { height: 10 } : { height: [6, 18, 8, 16, 6] }}
          transition={reduce ? undefined : { duration: 0.9, repeat: Infinity, delay: index * 0.12, ease: "easeInOut" }}
          style={{ height: 10 }}
        />
      ))}
    </span>
  );
  if (!overlay) return bars;
  return (
    <span className="absolute inset-0 grid place-items-center rounded-[10px] bg-black/35">{bars}</span>
  );
}

function ActionSheet({
  open,
  onClose,
  children,
  reduce,
  tall,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  reduce: boolean | null;
  tall?: boolean;
}) {
  const root = phoneRoot();
  const sheet = (
    <AnimatePresence>
      {open ? (
        <motion.div className="absolute inset-0 z-30" key="sheet">
          <motion.button
            type="button"
            aria-label="Dismiss"
            className="absolute inset-0 border-0 bg-white p-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.12 : 0.2 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={`absolute inset-x-0 bottom-0 rounded-t-[28px] bg-white px-5 pt-3 pb-8 shadow-[var(--shadow-card)] ${tall ? "max-h-[80%] overflow-y-auto" : ""}`}
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={reduce ? { duration: 0.15 } : { type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-[#D9D9D9]" />
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
  if (!root) return sheet;
  return createPortal(sheet, root);
}

function SheetAction({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-full items-center justify-center border-0 border-b border-[var(--line)] bg-transparent text-[16px] last:border-b-0"
      style={{ color: danger ? "var(--rec-red)" : "var(--text-900)" }}
    >
      {label}
    </button>
  );
}

export function TypeDots({ kinds }: { kinds: TimelineEntry["kind"][] }) {
  const color = {
    voice: "var(--purple-500)",
    song: "var(--pink-500)",
    echo: "var(--amber-500)",
  } as const;
  return (
    <span className="flex items-center gap-1" aria-hidden="true">
      {kinds.slice(0, 3).map((kind) => (
        <span key={kind} className="size-1.5 rounded-full" style={{ background: color[kind] }} />
      ))}
    </span>
  );
}

export function TypeFilterChips({
  value,
  onChange,
}: {
  value: "all" | TimelineEntry["kind"];
  onChange: (value: "all" | TimelineEntry["kind"]) => void;
}) {
  const options: { id: "all" | TimelineEntry["kind"]; label: string }[] = [
    { id: "all", label: "All" },
    { id: "voice", label: "Voice notes" },
    { id: "song", label: "Songs" },
    { id: "echo", label: "Echoes" },
  ];
  const selectedStyle = {
    all: { background: "var(--text-900)", color: "white", borderColor: "var(--text-900)" },
    voice: { background: "var(--purple-100)", color: "var(--purple-500)", borderColor: "var(--purple-300)" },
    song: { background: "var(--pink-50)", color: "var(--pink-500)", borderColor: "#D6408A" },
    echo: { background: "var(--amber-50)", color: "var(--amber-600)", borderColor: "var(--amber-500)" },
  } as const;

  return (
    <div className="scroll-row -mx-5 flex gap-2 overflow-x-auto px-5">
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
            className="h-11 shrink-0 rounded-full border px-3.5 text-[12px] leading-4"
            style={
              selected
                ? selectedStyle[option.id]
                : { background: "transparent", borderColor: "var(--line)", color: "var(--text-900)" }
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
