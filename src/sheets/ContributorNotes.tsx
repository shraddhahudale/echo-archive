import { useEffect, useRef, useState } from "react";
import { Check, Minus, Play } from "lucide-react";
import { PlayingBars } from "../components/MiniPlayer";
import { fromContributorNote } from "../data/playback";
import type { Contributor, ContributorNote } from "../data/types";
import { useArchiveStore } from "../store/useArchiveStore";

type ContributorNotesProps = {
  contributor: Contributor;
  unseenIds: string[];
  editing: boolean;
  reduce?: boolean | null;
  selectedIds: string[];
  onSelectedIds: (ids: string[]) => void;
  onAdd: () => void;
};

export function ContributorNotes({
  contributor,
  unseenIds,
  editing,
  selectedIds,
  onSelectedIds,
  onAdd,
}: ContributorNotesProps) {
  const renameEcho = useArchiveStore((state) => state.renameEcho);
  const removeEcho = useArchiveStore((state) => state.removeEcho);
  const playNow = useArchiveStore((state) => state.playNow);
  const nowPlaying = useArchiveStore((state) => state.nowPlaying);
  const playing = useArchiveStore((state) => state.playing);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [toast, setToast] = useState(false);
  const toastTimer = useRef<number | null>(null);
  const countLabel =
    contributor.totalCount === 1 ? "1 voice note" : `${contributor.totalCount} voice notes`;
  const selectedCount = selectedIds.length;

  useEffect(() => {
    if (!editing) {
      setRenamingId(null);
      setPendingId(null);
    }
  }, [editing]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  function togglePlay(note: ContributorNote) {
    const item = fromContributorNote(contributor, note);
    const queue = contributor.notes.map((n) => fromContributorNote(contributor, n));
    playNow(item, queue);
  }

  function toggleSelected(id: string) {
    onSelectedIds(selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]);
  }

  function saveTitle(note: ContributorNote) {
    const next = draft.trim() || note.title;
    if (next !== note.title) renameEcho(contributor.id, note.id, next);
    setRenamingId(null);
  }

  function remind() {
    setToast(true);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(false), 2000);
  }

  if (contributor.notes.length === 0) {
    return (
      <div className="pt-8">
        <p className="px-4 text-center text-[15px] leading-5 text-[#8E8E93]">
          {contributor.name} hasn't left a voice note yet.
        </p>
        <button
          type="button"
          onClick={remind}
          className="mx-auto mt-6 flex h-11 items-center rounded-full border border-[var(--line)] bg-white px-4 text-[13px] leading-4 font-medium text-[var(--amber-600)]"
        >
          Send a reminder
        </button>
        {toast ? (
          <p role="status" className="mx-auto mt-4 w-fit rounded-full bg-[#1A1A1A] px-4 py-2 text-[13px] leading-4 text-white">
            Reminder sent
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="pt-4">
      <div className="flex items-center gap-3 rounded-[16px] bg-[var(--amber-50)] py-2 pr-4 pl-2">
        <span className="grid size-14 shrink-0 place-items-center rounded-[6px] bg-white text-[20px] leading-none font-semibold text-[var(--amber-600)]">
          {contributor.name.trim().charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[17px] leading-[22px] font-semibold text-[#111111]">{contributor.name}</p>
          <p className="truncate text-[14px] leading-[18px] text-[#8E8E93]">
            {countLabel}
            {contributor.since ? ` · since week ${contributor.since}` : ""}
          </p>
        </div>
      </div>
      <p className="mt-5 text-[11px] leading-4 font-medium tracking-[0.06em] text-[#8E8E93] uppercase">Voice notes</p>
      <div className="mt-2 max-h-[420px] overflow-y-auto">
        {contributor.notes.map((note, index) => {
          const isActive = playing && nowPlaying.id === note.id;
          return (
            <div
              key={note.id}
              className={`flex h-[72px] items-center gap-3 py-3 ${index < contributor.notes.length - 1 ? "border-b border-[var(--line)]" : ""} ${isActive ? "bg-[var(--amber-50)]" : ""}`}
            >
              <button
                type="button"
                aria-label={isActive ? `Pause ${note.title}` : `Play ${note.title}`}
                onClick={() => togglePlay(note)}
                className="grid size-11 shrink-0 place-items-center border-0 bg-transparent p-0"
              >
                <span className="grid size-10 place-items-center rounded-full bg-[var(--amber-50)] text-[var(--amber-600)]">
                  {isActive ? <PlayingBars color="var(--amber-600)" count={3} /> : <Play size={16} strokeWidth={2} fill="currentColor" />}
                </span>
              </button>
              <div className="min-w-0 flex-1">
                {editing && renamingId === note.id ? (
                  <label className="relative -my-3 block h-11 w-full">
                    <input
                      value={draft}
                      autoFocus
                      aria-label={`Rename ${note.title}`}
                      onChange={(event) => setDraft(event.target.value)}
                      onBlur={() => saveTitle(note)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") event.currentTarget.blur();
                      }}
                      className="absolute inset-x-0 top-1/2 w-full -translate-y-1/2 border-0 border-b border-[var(--amber-600)] bg-transparent text-[16px] leading-5 font-semibold text-[var(--text-900)]"
                    />
                  </label>
                ) : editing ? (
                  <button
                    type="button"
                    aria-label={`Rename ${note.title}`}
                    onClick={() => {
                      setDraft(note.title);
                      setRenamingId(note.id);
                    }}
                    className="flex h-11 max-w-full -my-3 items-center gap-1.5 border-0 bg-transparent p-0 text-left"
                  >
                    {unseenIds.includes(note.id) ? (
                      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-[#F2A541]" />
                    ) : null}
                    <span className="truncate text-[16px] leading-5 font-semibold text-[#111111]">{note.title}</span>
                  </button>
                ) : (
                  <p className="flex max-w-full items-center gap-1.5">
                    {unseenIds.includes(note.id) ? (
                      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-[#F2A541]" />
                    ) : null}
                    <span className="truncate text-[16px] leading-5 font-semibold text-[#111111]">{note.title}</span>
                  </p>
                )}
                <p className="truncate text-[14px] leading-[18px] text-[#8E8E93]">
                  {formatDuration(note.durationSec)} · Week {note.week}
                </p>
              </div>
              {editing ? (
                <button
                  type="button"
                  aria-label={`Remove ${note.title}`}
                  onClick={() => setPendingId(note.id)}
                  className="grid size-11 shrink-0 place-items-center border-0 bg-transparent p-0 text-[#E5484D]"
                >
                  <Minus size={20} strokeWidth={2} />
                </button>
              ) : note.inArchive ? (
                <span className="shrink-0 rounded-full bg-[var(--amber-50)] px-2 py-1 text-[12px] leading-4 text-[#8E8E93]">
                  In archive
                </span>
              ) : (
                <button
                  type="button"
                  aria-pressed={selectedIds.includes(note.id)}
                  aria-label={`Select ${note.title}`}
                  onClick={() => toggleSelected(note.id)}
                  className="grid size-11 shrink-0 place-items-center border-0 bg-transparent p-0"
                >
                  <span
                    className="grid size-[22px] place-items-center rounded-full"
                    style={{
                      border: `1.5px solid ${selectedIds.includes(note.id) ? "#F2A541" : "#C7C7CC"}`,
                      background: selectedIds.includes(note.id) ? "#F2A541" : "transparent",
                      color: "#fff",
                    }}
                  >
                    {selectedIds.includes(note.id) ? <Check size={12} strokeWidth={3} /> : null}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
      {pendingId ? (
        <div className="mt-4">
          <p className="text-[15px] leading-5 text-[var(--text-700)]">
            Remove this voice note? It won't be deleted for {contributor.name}.
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => {
                removeEcho(contributor.id, pendingId);
                onSelectedIds(selectedIds.filter((id) => id !== pendingId));
                setPendingId(null);
              }}
              className="h-11 flex-1 rounded-full border border-[var(--line)] bg-white text-[13px] leading-4 font-medium text-[var(--rec-red)]"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={() => setPendingId(null)}
              className="h-11 flex-1 rounded-full border border-[var(--line)] bg-white text-[13px] leading-4 font-medium text-[var(--text-900)]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="sticky bottom-0 bg-[var(--bg)] pt-4">
          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={onAdd}
            className="h-11 w-full rounded-full border border-[var(--line)] bg-white text-[13px] leading-4 font-medium text-[var(--amber-600)] disabled:opacity-40"
          >
            {selectedCount === 0 ? "Select voice notes to add" : `Add ${selectedCount} to this week`}
          </button>
        </div>
      )}
    </div>
  );
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remain = seconds % 60;
  return `${minutes}:${String(remain).padStart(2, "0")}`;
}
