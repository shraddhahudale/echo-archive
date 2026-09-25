import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, Pause, Pencil, Play, SkipForward } from "lucide-react";
import { PillButton } from "../components/PillButton";
import { Waveform } from "../components/Waveform";
import { AnythingToAdd } from "./AnythingToAdd";
import { SavedMoment } from "./SavedMoment";
import { useArchiveStore } from "../store/useArchiveStore";

type VoiceNoteSheetProps = {
  titleId: string;
};

type Phase = "ready" | "recording" | "finished" | "edit" | "confirm" | "details" | "saved";

const FEELINGS = ["calm", "hopeful", "relentless", "anxious", "connected", "missing home", "don't know why"];
const MAX_SECONDS = 180;

function nextLevel(previous: number) {
  let next = previous + (Math.random() - 0.5) * 0.16;
  if (next < 0.1) next = 0.2 - next;
  if (next > 0.9) next = 1.8 - next;
  return Math.min(0.9, Math.max(0.1, next));
}

function formatClock(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const remain = total % 60;
  return `${minutes}:${String(remain).padStart(2, "0")}`;
}

export function VoiceNoteSheet({ titleId }: VoiceNoteSheetProps) {
  const reduce = useReducedMotion();
  const week = useArchiveStore((state) => state.user.week);
  const saveVoiceNote = useArchiveStore((state) => state.saveVoiceNote);
  const closeSheet = useArchiveStore((state) => state.closeSheet);
  const [noteNumber] = useState(() => useArchiveStore.getState().nextVoiceNoteNumber);
  const defaultName = `Voice note #${String(noteNumber).padStart(2, "0")}`;
  const [name, setName] = useState(defaultName);
  const [draft, setDraft] = useState(defaultName);
  const [confirmReturn, setConfirmReturn] = useState<"finished" | "edit">("finished");
  const [phase, setPhase] = useState<Phase>("ready");
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [bars, setBars] = useState<number[]>([]);
  const levelRef = useRef(0.4);
  const [feelings, setFeelings] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [playSec, setPlaySec] = useState(0);
  const savedOnce = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const caption = name === defaultName ? `${defaultName} / W ${week}` : name;
  const progress = phase === "finished" || phase === "edit" || phase === "details" ? 1 : elapsed / MAX_SECONDS;

  useEffect(() => {
    if (phase !== "recording" || paused) return;
    const id = window.setInterval(() => {
      setElapsed((value) => Math.min(MAX_SECONDS, Math.round((value + 0.1) * 10) / 10));
    }, 100);
    return () => window.clearInterval(id);
  }, [phase, paused]);

  useEffect(() => {
    if (phase !== "recording" || paused) return;
    const id = window.setInterval(() => {
      const next = nextLevel(levelRef.current);
      levelRef.current = next;
      setBars((current) => [...current, next]);
    }, 1000 / 6);
    return () => window.clearInterval(id);
  }, [phase, paused]);

  useEffect(() => {
    if (phase === "recording" && elapsed >= MAX_SECONDS) setPhase("finished");
  }, [phase, elapsed]);

  useEffect(() => {
    if (phase !== "details" || !previewing) return;
    const id = window.setInterval(() => {
      setPlaySec((value) => {
        const next = Math.round((value + 0.1) * 10) / 10;
        if (next >= elapsed) {
          setPreviewing(false);
          return elapsed;
        }
        return next;
      });
    }, 100);
    return () => window.clearInterval(id);
  }, [phase, previewing, elapsed]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const active = document.activeElement;
    if (active instanceof Node && root.contains(active)) return;
    const back = root.querySelector<HTMLButtonElement>('button[aria-label="Back"]');
    (back ?? root.querySelector<HTMLElement>("button, input, textarea"))?.focus();
  }, [phase]);

  useEffect(() => {
    if (phase !== "saved") return;
    const id = window.setTimeout(closeSheet, 2500);
    return () => window.clearTimeout(id);
  }, [phase, closeSheet]);

  function endRecording() {
    setPaused(false);
    setPhase("finished");
  }

  function start() {
    levelRef.current = 0.28 + Math.random() * 0.24;
    setBars([]);
    setElapsed(0);
    setPaused(false);
    setPhase("recording");
  }

  function reRecord() {
    setElapsed(0);
    setPaused(false);
    setFeelings([]);
    setNote("");
    setName(defaultName);
    setDraft(defaultName);
    setPreviewing(false);
    setPlaySec(0);
    setBars([]);
    setPhase("ready");
  }

  function openEdit() {
    setDraft(name);
    setPhase("edit");
  }

  function saveName() {
    setName(draft.trim() || defaultName);
    setPhase("finished");
  }

  function openDetails() {
    setPlaySec(0);
    setPreviewing(!reduce);
    setPhase("details");
  }

  function commit() {
    if (savedOnce.current) return;
    savedOnce.current = true;
    saveVoiceNote({
      title: name,
      feelings,
      note: note.trim() || undefined,
      durationSec: Math.round(elapsed),
    });
    setPhase("saved");
  }

  function toggleFeeling(feeling: string) {
    setFeelings((current) =>
      current.includes(feeling) ? current.filter((item) => item !== feeling) : [...current, feeling],
    );
  }

  const showBack = phase === "recording" || phase === "finished" || phase === "edit" || phase === "confirm" || phase === "details";
  const title =
    phase === "details"
      ? "Anything to add?"
      : phase === "confirm"
        ? "Re-record?"
        : phase === "saved"
          ? "Saved."
          : "Recording a voice note";

  function goBack() {
    if (phase === "recording") {
      setPaused(false);
      setElapsed(0);
      setPhase("ready");
      return;
    }
    if (phase === "finished") {
      setPaused(true);
      setPhase("recording");
      return;
    }
    if (phase === "edit") setPhase("finished");
    if (phase === "confirm") setPhase(confirmReturn);
    if (phase === "details") setPhase("finished");
  }

  return (
    <div ref={rootRef} className="px-5 pb-8" data-flow="voice">
      {phase === "saved" ? null : (
        <div className="flex items-center gap-1">
          {showBack ? (
            <button
              type="button"
              aria-label="Back"
              onClick={goBack}
              className="-ml-2 grid size-11 shrink-0 place-items-center border-0 bg-transparent p-0 text-[var(--text-900)]"
            >
              <ChevronLeft size={22} strokeWidth={2} />
            </button>
          ) : null}
          <h2 id={titleId} className="text-[17px] leading-[22px] font-semibold text-[var(--text-900)]">
            {title}
          </h2>
        </div>
      )}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={phase}
          data-phase={phase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.15 : 0.22 }}
        >
          {phase === "ready" || phase === "recording" || phase === "finished" ? (
            <RecordBody
              phase={phase}
              label={caption}
              bars={bars}
              progress={progress}
              elapsed={elapsed}
              paused={paused}
              onStart={start}
              onTogglePause={() => setPaused((value) => !value)}
              onEnd={endRecording}
              onEdit={openEdit}
              onSave={openDetails}
            />
          ) : null}
          {phase === "edit" ? (
            <EditBody
              draft={draft}
              bars={bars}
              onDraft={setDraft}
              onDone={saveName}
              onCancel={() => setPhase("finished")}
              onReRecord={() => {
                setConfirmReturn("edit");
                setPhase("confirm");
              }}
            />
          ) : null}
          {phase === "confirm" ? (
            <div className="pt-6">
              <p className="text-[15px] leading-5 text-[var(--text-700)]">This clears the current take.</p>
              <div className="mt-6 flex gap-3">
                <PillButton className="flex-1" onClick={reRecord}>
                  Re-record
                </PillButton>
                <PillButton className="flex-1" onClick={() => setPhase(confirmReturn)}>
                  Cancel
                </PillButton>
              </div>
            </div>
          ) : null}
          {phase === "details" ? (
            <AnythingToAdd
              tone="voice"
              feelings={FEELINGS}
              selected={feelings}
              onToggle={toggleFeeling}
              note={note}
              onNote={setNote}
              onSave={commit}
              card={
                <div className="rounded-[16px] bg-[var(--purple-100)]">
                  <p className="px-4 pt-3 text-[15px] leading-5 font-medium text-[var(--text-900)]">{name}</p>
                  <div className="flex items-center gap-2 pr-1 pb-1 pl-3">
                    <Waveform mode="compact" bars={bars} progress={elapsed > 0 ? playSec / elapsed : 0} />
                    <button
                      type="button"
                      aria-label={previewing ? "Pause" : "Play"}
                      onClick={() => {
                        if (playSec >= elapsed) setPlaySec(0);
                        setPreviewing((value) => !value);
                      }}
                      className="grid size-11 place-items-center border-0 bg-transparent p-0 text-[var(--icon-control)]"
                    >
                      {previewing ? <Pause size={20} strokeWidth={2} /> : <Play size={20} strokeWidth={2} />}
                    </button>
                    <button
                      type="button"
                      aria-label="Skip"
                      onClick={() => {
                        setPlaySec(elapsed);
                        setPreviewing(false);
                      }}
                      className="grid size-11 place-items-center border-0 bg-transparent p-0 text-[var(--icon-control)]"
                    >
                      <SkipForward size={20} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              }
            />
          ) : null}
          {phase === "saved" ? (
            <SavedMoment titleId={titleId} tone="voice" week={week} reduce={reduce}>
              {name}
            </SavedMoment>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function EditBody({
  draft,
  bars,
  onDraft,
  onDone,
  onCancel,
  onReRecord,
}: {
  draft: string;
  bars: number[];
  onDraft: (value: string) => void;
  onDone: () => void;
  onCancel: () => void;
  onReRecord: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <div className="pt-6">
      <label className="relative -my-3 block h-11">
        <input
          ref={inputRef}
          value={draft}
          maxLength={40}
          aria-label="Voice note name"
          onChange={(event) => onDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            onDone();
          }}
          className="absolute inset-x-0 top-1/2 w-full -translate-y-1/2 border-0 bg-transparent text-center text-[15px] leading-5 font-medium text-[var(--text-900)]"
          style={{ borderBottom: "1px solid var(--purple-500)" }}
        />
      </label>
      <div className="mt-4">
        <Waveform mode="finished" bars={bars} progress={1} />
      </div>
      <button
        type="button"
        onClick={onReRecord}
        className="mx-auto -my-1.5 mt-3 flex h-11 items-center justify-center border-0 bg-transparent px-3 text-[13px] leading-4"
        style={{ color: "#8E8E93" }}
      >
        Re-record
      </button>
      <div className="mt-4 flex gap-3">
        <PillButton className="flex-1" onClick={onCancel}>
          Cancel
        </PillButton>
        <PillButton className="flex-1" onClick={onDone}>
          Done
        </PillButton>
      </div>
    </div>
  );
}

function RecordBody({
  phase,
  label,
  bars,
  progress,
  elapsed,
  paused,
  onStart,
  onTogglePause,
  onEnd,
  onEdit,
  onSave,
}: {
  phase: "ready" | "recording" | "finished";
  label: string;
  bars: number[];
  progress: number;
  elapsed: number;
  paused: boolean;
  onStart: () => void;
  onTogglePause: () => void;
  onEnd: () => void;
  onEdit: () => void;
  onSave: () => void;
}) {
  const dot =
    phase === "recording" ? "var(--rec-red)" : phase === "finished" ? "var(--ok-green)" : "var(--text-400)";
  const fill = phase === "ready" ? 0 : phase === "finished" ? 100 : progress * 100;

  return (
    <div className="pt-6">
      {phase === "finished" ? (
        <button
          type="button"
          aria-label={`Edit ${label}`}
          onClick={onEdit}
          className="mx-auto -my-3 flex h-11 items-center justify-center gap-1.5 border-0 bg-transparent p-0"
        >
          <span className="text-[15px] leading-5 font-medium text-[var(--text-700)]">{label}</span>
          <Pencil size={14} strokeWidth={2} aria-hidden="true" style={{ color: "#8E8E93" }} />
        </button>
      ) : (
        <p className="text-center text-[15px] leading-5 font-medium text-[var(--text-700)]">{label}</p>
      )}
      <div className="mt-4">
        <Waveform mode={phase} bars={bars} progress={phase === "finished" ? 1 : progress} />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span
          className={`size-2 shrink-0 rounded-full ${phase === "recording" && !paused ? "motion-safe:animate-pulse" : ""}`}
          style={{ background: dot }}
        />
        <span className="relative h-0.5 flex-1 rounded-full bg-[var(--chip-inactive)]">
          <span className="absolute inset-y-0 left-0 rounded-full bg-[var(--purple-500)]" style={{ width: `${fill}%` }} />
        </span>
        <span className="text-[13px] leading-4 text-[var(--text-700)] tabular-nums">{formatClock(elapsed)}</span>
      </div>
      {phase === "ready" ? (
        <PillButton className="mt-6 w-full" onClick={onStart}>
          Start recording
        </PillButton>
      ) : null}
      {phase === "recording" ? (
        <div className="mt-6 flex gap-3">
          <PillButton className="flex-1" onClick={onTogglePause}>
            {paused ? "Resume" : "Pause"}
          </PillButton>
          <PillButton className="flex-1" onClick={onEnd}>
            End
          </PillButton>
        </div>
      ) : null}
      {phase === "finished" ? (
        <div className="mt-6 flex gap-3">
          <PillButton className="flex-1" onClick={onEdit}>
            Edit
          </PillButton>
          <PillButton className="flex-1" onClick={onSave}>
            Save
          </PillButton>
        </div>
      ) : null}
    </div>
  );
}
