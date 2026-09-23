import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, Link2, Mic, Pencil, Plus, Search, SkipForward } from "lucide-react";
import { Chip } from "../components/Chip";
import { contacts } from "../data/mock";
import type { Contact, Contributor, ContributorNote } from "../data/types";
import { AnythingToAdd } from "./AnythingToAdd";
import { ContributorNotes } from "./ContributorNotes";
import { SavedMoment } from "./SavedMoment";
import { useArchiveStore } from "../store/useArchiveStore";

const RELATIONSHIPS = ["partner", "mum", "dad", "sibling", "grandparent", "aunty / uncle", "friend"];
const ECHO_FEELINGS = ["calm", "hopeful", "tearful", "connected", "loved", "don't know why"];

type EchoHubSheetProps = {
  titleId: string;
};

type Phase = "hub" | "contacts" | "notes" | "invite" | "sent" | "add" | "saved";

export function EchoHubSheet({ titleId }: EchoHubSheetProps) {
  const reduce = useReducedMotion();
  const week = useArchiveStore((state) => state.user.week);
  const contributors = useArchiveStore((state) => state.contributors);
  const inviteMember = useArchiveStore((state) => state.inviteMember);
  const markSeen = useArchiveStore((state) => state.markSeen);
  const addEchoesToWeek = useArchiveStore((state) => state.addEchoesToWeek);
  const closeSheet = useArchiveStore((state) => state.closeSheet);
  const [phase, setPhase] = useState<Phase>("hub");
  const [query, setQuery] = useState("");
  const [person, setPerson] = useState<Contributor | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [relationship, setRelationship] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [returnTo, setReturnTo] = useState<"hub" | "contacts">("hub");
  const [editing, setEditing] = useState(false);
  const [unseenIds, setUnseenIds] = useState<string[]>([]);
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [echoFeelings, setEchoFeelings] = useState<string[]>([]);
  const [echoNote, setEchoNote] = useState("");
  const [playingPreview, setPlayingPreview] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [savedName, setSavedName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const sentOnce = useRef(false);
  const echoSaved = useRef(false);
  const playRef = useRef({ index: 0, offset: 0 });
  const queueRef = useRef<ContributorNote[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase === "contacts") inputRef.current?.focus();
  }, [phase]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || phase === "contacts") return;
    const active = document.activeElement;
    if (active instanceof Node && root.contains(active)) return;
    const back = root.querySelector<HTMLButtonElement>('button[aria-label="Back"]');
    (back ?? root.querySelector<HTMLElement>("button, input, textarea"))?.focus();
  }, [phase]);

  useEffect(() => {
    if (phase !== "sent") return;
    const id = window.setTimeout(() => setPhase("hub"), 2500);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "saved") return;
    const id = window.setTimeout(closeSheet, 2500);
    return () => window.clearTimeout(id);
  }, [phase, closeSheet]);

  useEffect(() => {
    if (!playingPreview || phase !== "add") return;
    const id = window.setInterval(() => {
      const queue = queueRef.current;
      const { index, offset } = playRef.current;
      const note = queue[index];
      if (!note) {
        playRef.current = { index: 0, offset: 0 };
        setPlayIndex(0);
        setPlayingPreview(false);
        return;
      }
      if (offset + 1 >= note.durationSec) {
        if (index + 1 >= queue.length) {
          playRef.current = { index: 0, offset: 0 };
          setPlayIndex(0);
          setPlayingPreview(false);
        } else {
          playRef.current = { index: index + 1, offset: 0 };
          setPlayIndex(index + 1);
        }
      } else {
        playRef.current = { index, offset: offset + 1 };
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [playingPreview, phase]);

  const trimmed = query.trim();
  const contributorNames = new Set(contributors.map((item) => item.name.toLowerCase()));
  const results = contacts.filter((contact) => {
    const haystack = `${contact.name} ${contact.phone ?? ""} ${contact.email ?? ""}`.toLowerCase();
    return haystack.includes(trimmed.toLowerCase());
  });

  function openNotes(contributor: Contributor, from: "hub" | "contacts") {
    setPerson(contributor);
    setReturnTo(from);
    setEditing(false);
    setPickedIds([]);
    setUnseenIds(contributor.notes.filter((note) => !note.seen).map((note) => note.id));
    markSeen(contributor.id);
    setPhase("notes");
  }

  function openInvite(next: Contact) {
    const first = next.name.trim().split(/\s+/)[0];
    sentOnce.current = false;
    setContact(next);
    setRelationship(null);
    setMessage(`Hi ${first}, I'm keeping a sound diary for our baby. Would you leave a voice note for week ${week}?`);
    setPhase("invite");
  }

  function sendInvite() {
    if (!contact || !relationship || sentOnce.current) return;
    sentOnce.current = true;
    inviteMember({
      name: contact.name,
      relationship,
      contact: contact.phone ?? contact.email ?? "",
    });
    setPhase("sent");
  }

  const firstName = contact?.name.trim().split(/\s+/)[0] ?? "";
  const active = contributors.find((item) => item.id === person?.id) ?? person;
  const selectedNotes = active
    ? active.notes.filter((note) => pickedIds.includes(note.id) && !note.inArchive)
    : [];
  queueRef.current = selectedNotes;
  const currentNote = selectedNotes[playIndex] ?? selectedNotes[0];
  const totalSec = selectedNotes.reduce((sum, note) => sum + note.durationSec, 0);

  function openAdd() {
    playRef.current = { index: 0, offset: 0 };
    setPlayIndex(0);
    setPlayingPreview(false);
    setEchoFeelings([]);
    setEchoNote("");
    echoSaved.current = false;
    setPhase("add");
  }

  function togglePreview() {
    if (selectedNotes.length === 0) return;
    setPlayingPreview((current) => !current);
  }

  function skipPreview() {
    const queue = queueRef.current;
    const index = playRef.current.index;
    if (index + 1 >= queue.length) {
      playRef.current = { index: 0, offset: 0 };
      setPlayIndex(0);
      setPlayingPreview(false);
      return;
    }
    playRef.current = { index: index + 1, offset: 0 };
    setPlayIndex(index + 1);
  }

  function saveEcho() {
    if (!active || echoSaved.current || selectedNotes.length === 0) return;
    echoSaved.current = true;
    setPlayingPreview(false);
    setSavedCount(selectedNotes.length);
    setSavedName(active.name);
    addEchoesToWeek(
      active.id,
      selectedNotes.map((note) => note.id),
      echoFeelings,
      echoNote.trim() || undefined,
    );
    setPhase("saved");
  }

  const showBack = phase === "contacts" || phase === "notes" || phase === "invite" || phase === "add";
  const title =
    phase === "notes" && active
      ? active.name
      : phase === "add"
        ? "Anything to add?"
        : phase === "invite"
          ? "Send an invite"
          : "Add an Echo";

  return (
    <div ref={rootRef} className="px-5 pb-8" data-flow="echo">
      {phase === "sent" || phase === "saved" ? null : (
      <div className="flex items-center gap-1">
        {showBack ? (
          <button
            type="button"
            aria-label="Back"
            onClick={() => {
              if (phase === "notes") {
                setEditing(false);
                setPhase(returnTo);
              } else if (phase === "add") {
                setPlayingPreview(false);
                setPhase("notes");
              }
              else if (phase === "invite") setPhase("contacts");
              else {
                setQuery("");
                setPhase("hub");
              }
            }}
            className="-ml-2 grid size-11 shrink-0 place-items-center border-0 bg-transparent p-0 text-[var(--text-900)]"
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
        ) : null}
        <h2 id={titleId} className="min-w-0 flex-1 truncate text-[17px] leading-[22px] font-semibold text-[var(--text-900)]">
          {title}
        </h2>
        {phase === "notes" && active && active.notes.length > 0 ? (
          editing ? (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="h-11 shrink-0 border-0 bg-transparent px-2 text-[15px] leading-5 font-semibold text-[#D98A1F]"
            >
              Done
            </button>
          ) : (
            <button
              type="button"
              aria-label="Edit"
              onClick={() => setEditing(true)}
              className="grid size-11 shrink-0 place-items-center border-0 bg-transparent p-0 text-[#3F3A4A]"
            >
              <Pencil size={20} strokeWidth={2} />
            </button>
          )
        ) : null}
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
          {phase === "hub" ? (
            <div className="pt-5">
              <p className="text-[11px] leading-4 font-medium tracking-[0.06em] text-[#8E8E93] uppercase">Add a contributor</p>
              <button
                type="button"
                onClick={() => setPhase("contacts")}
                className="echo-search mt-2 flex h-11 w-full items-center gap-2 rounded-full bg-[var(--chip-inactive)] px-3 text-left"
              >
                <Search size={18} strokeWidth={2} className="shrink-0 text-[var(--text-400)]" aria-hidden="true" />
                <span className="min-w-0 flex-1 text-[15px] leading-5 text-[var(--text-400)]">Search from contacts</span>
                <Mic size={18} strokeWidth={2} className="shrink-0 text-[var(--text-400)]" aria-hidden="true" />
              </button>
              <p className="mt-5 text-[11px] leading-4 font-medium tracking-[0.06em] text-[#8E8E93] uppercase">Recent contributors</p>
              <div className="mt-2">
                {contributors.map((contributor, index) => (
                  <PersonRow
                    key={contributor.id}
                    name={contributor.name}
                    detail={<CountLine contributor={contributor} />}
                    divider={index < contributors.length - 1}
                    onOpen={() => openNotes(contributor, "hub")}
                    trailing={
                      <button
                        type="button"
                        aria-label={`Add ${contributor.name}`}
                        onClick={() => openNotes(contributor, "hub")}
                        className="relative h-11 w-11 shrink-0 border-0 bg-transparent p-0 text-[#8E8E93]"
                      >
                        <Plus size={20} strokeWidth={2} className="absolute top-1/2 right-0 -translate-y-1/2" />
                      </button>
                    }
                  />
                ))}
              </div>
            </div>
          ) : null}
          {phase === "contacts" ? (
            <div className="pt-5">
              <label className="echo-search sheet-search flex h-11 items-center gap-2 rounded-full bg-[var(--chip-inactive)] px-3">
                <Search size={18} strokeWidth={2} className="shrink-0 text-[var(--text-400)]" aria-hidden="true" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Search from contacts"
                  placeholder="Search from contacts"
                  className="h-full min-h-11 min-w-0 flex-1 border-0 bg-transparent text-[15px] leading-5 text-[var(--text-900)] placeholder:text-[var(--text-400)]"
                />
                <Mic size={18} strokeWidth={2} className="shrink-0 text-[var(--text-400)]" aria-hidden="true" />
              </label>
              <p className="mt-4 text-[11px] leading-4 font-medium tracking-[0.06em] text-[#8E8E93] uppercase">From your contacts</p>
              <div className="mt-2">
                {trimmed && results.length === 0 ? (
                  <p className="px-1 text-[15px] leading-5 text-[var(--text-400)]">No contacts match "{trimmed}".</p>
                ) : (
                  (trimmed ? results : contacts).map((contact, index, list) => {
                    const existing = contributors.find((item) => item.name.toLowerCase() === contact.name.toLowerCase());
                    return (
                      <PersonRow
                        key={contact.id}
                        name={contact.name}
                        detail={contact.phone ?? contact.email ?? ""}
                        divider={index < list.length - 1}
                        onOpen={existing ? () => openNotes(existing, "contacts") : undefined}
                        trailing={
                          existing || contributorNames.has(contact.name.toLowerCase()) ? (
                            <span className="shrink-0 text-[14px] leading-[18px] text-[#8E8E93]">Contributor</span>
                          ) : (
                            <button
                              type="button"
                              aria-label={`Add ${contact.name}`}
                              onClick={() => openInvite(contact)}
                              className="relative h-11 w-11 shrink-0 border-0 bg-transparent p-0 text-[#8E8E93]"
                            >
                              <Plus size={20} strokeWidth={2} className="absolute top-1/2 right-0 -translate-y-1/2" />
                            </button>
                          )
                        }
                      />
                    );
                  })
                )}
              </div>
              <button
                type="button"
                className="flex h-[72px] w-full items-center gap-3 border-x-0 border-b-0 border-t border-[#E6E6EA] bg-transparent p-0 text-left"
              >
                <Link2 size={22} strokeWidth={2} className="shrink-0 text-[var(--amber-600)]" aria-hidden="true" />
                <span className="text-[16px] leading-5 font-semibold text-[#111111]">Share an invite link instead</span>
              </button>
            </div>
          ) : null}
          {phase === "notes" && active ? (
            <ContributorNotes
              contributor={active}
              unseenIds={unseenIds}
              editing={editing}
              reduce={reduce}
              selectedIds={pickedIds}
              onSelectedIds={setPickedIds}
              onAdd={openAdd}
            />
          ) : null}
          {phase === "invite" && contact ? (
            <div className="pt-5">
              <div className="flex items-center gap-3 rounded-[16px] bg-[var(--amber-50)] py-2 pr-4 pl-2">
                <InitialAvatar name={contact.name} radius={8} />
                <div className="min-w-0">
                  <p className="truncate text-[17px] leading-[22px] font-semibold text-[#111111]">{contact.name}</p>
                  <p className="truncate text-[14px] leading-[18px] text-[#8E8E93]">{contact.phone ?? contact.email}</p>
                </div>
              </div>
              <p className="mt-5 text-[17px] leading-[22px] font-semibold text-[#111111]">Who are they to you?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {RELATIONSHIPS.map((label) => (
                  <Chip
                    key={label}
                    label={label}
                    tone="echo"
                    selected={relationship === label}
                    onClick={() => setRelationship(label)}
                  />
                ))}
              </div>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="echo-note mt-4 h-[110px] w-full resize-none rounded-[16px] bg-[var(--amber-50)] px-4 py-3 text-[15px] leading-5 text-[var(--text-900)]"
              />
              <button
                type="button"
                disabled={!relationship}
                onClick={sendInvite}
                className="mt-6 h-11 w-full rounded-full border border-[var(--line)] bg-white px-4 text-[13px] leading-4 font-medium text-[#D98A1F] disabled:opacity-40"
              >
                Send invite
              </button>
            </div>
          ) : null}
          {phase === "add" && active ? (
            <AnythingToAdd
              tone="echo"
              feelings={ECHO_FEELINGS}
              selected={echoFeelings}
              onToggle={(feeling) =>
                setEchoFeelings((current) =>
                  current.includes(feeling) ? current.filter((item) => item !== feeling) : [...current, feeling],
                )
              }
              note={echoNote}
              onNote={setEchoNote}
              onSave={saveEcho}
              card={
                <div className="flex items-center gap-3 rounded-[16px] bg-[var(--amber-50)] py-2 pr-4 pl-2">
                  <span className="grid size-14 shrink-0 place-items-center rounded-[8px] bg-white text-[20px] leading-none font-semibold text-[var(--amber-600)]">
                    {active.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[17px] leading-[22px] font-semibold text-[#111111]">
                      {voiceNotesLine(selectedNotes.length, active.name)}
                    </p>
                    <p className="truncate text-[14px] leading-[18px] text-[#8E8E93]">{formatDuration(totalSec)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-6 text-[#3F3A4A]">
                    <button
                      type="button"
                      aria-label={playingPreview ? `Pause ${currentNote?.title ?? ""}`.trim() : `Play ${currentNote?.title ?? ""}`.trim()}
                      onClick={togglePreview}
                      className="relative -mx-[11px] grid h-11 w-11 place-items-center border-0 bg-transparent p-0 text-inherit"
                    >
                      {playingPreview ? <PauseBars /> : <PlayMark />}
                    </button>
                    <button
                      type="button"
                      aria-label="Skip"
                      onClick={skipPreview}
                      className="relative -mx-[11px] grid h-11 w-11 place-items-center border-0 bg-transparent p-0 text-inherit"
                    >
                      <SkipForward size={22} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              }
            />
          ) : null}
          {phase === "saved" ? (
            <SavedMoment
              titleId={titleId}
              tone="echo"
              body={
                savedCount === 1
                  ? `It's part of week ${week} now. Echo will remember this one.`
                  : `They're part of week ${week} now. Echo will remember these.`
              }
              reduce={reduce}
            >
              {voiceNotesLine(savedCount, savedName)}
            </SavedMoment>
          ) : null}
          {phase === "sent" ? (
            <SavedMoment
              titleId={titleId}
              tone="echo"
              heading="Sent."
              body="When they leave a voice note, it'll show up in your recent contributors."
              reduce={reduce}
            >
              Invite to {firstName}
            </SavedMoment>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function voiceNotesLine(count: number, name: string) {
  return `${count} voice note${count === 1 ? "" : "s"} from ${name}`;
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.max(0, seconds % 60);
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

function PauseBars() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <rect x="5" y="3" width="4" height="16" rx="1" fill="currentColor" />
      <rect x="13" y="3" width="4" height="16" rx="1" fill="currentColor" />
    </svg>
  );
}

function PlayMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <path d="M7 4.2v13.6l11.2-6.8L7 4.2Z" fill="currentColor" />
    </svg>
  );
}

function CountLine({ contributor }: { contributor: Contributor }) {
  if (contributor.status === "invited") return "Invite sent";
  const unseen = contributor.notes.filter((note) => !note.seen).length;
  const count = `${contributor.totalCount} voice note${contributor.totalCount === 1 ? "" : "s"}`;
  return (
    <>
      {unseen > 0 ? <span className="text-[var(--amber-600)]">• {unseen} new </span> : null}
      {count}
    </>
  );
}

function PersonRow({
  name,
  detail,
  divider,
  onOpen,
  trailing,
}: {
  name: string;
  detail: ReactNode;
  divider: boolean;
  onOpen?: () => void;
  trailing: ReactNode;
}) {
  const body = (
    <>
      <InitialAvatar name={name} />
      <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
        <span className="truncate text-[16px] leading-5 font-semibold text-[#111111]">{name}</span>
        <span className="truncate text-[14px] leading-[18px] text-[#8E8E93]">{detail}</span>
      </span>
    </>
  );

  return (
    <div className={`flex h-[72px] items-center gap-3 py-3 ${divider ? "border-b border-[#E6E6EA]" : ""}`}>
      {onOpen ? (
        <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 border-0 bg-transparent p-0 text-left">
          {body}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{body}</div>
      )}
      {trailing}
    </div>
  );
}

function InitialAvatar({ name, radius = 6 }: { name: string; radius?: number }) {
  return (
    <span
      className="grid size-14 shrink-0 place-items-center bg-[var(--amber-50)] text-[20px] leading-none font-semibold text-[var(--amber-600)]"
      style={{ borderRadius: radius }}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
