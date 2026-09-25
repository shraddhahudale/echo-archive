# Echo Archive: Phase 1 Build Plan (v2)

Phase 1 = **Home + the "How are you feeling today" orb flow**, with three ways to record a moment:

1. Record a voice note
2. Add a song
3. Add an echo: bring in voice notes from the people around you (partner, family, friends), or invite someone new

Visual tokens and components live in `design.md`. This file covers what to build and how it connects. If the two conflict, this file wins.

**Status:** steps 1 to 4 are done (frame, Home, store + mini player, record choice sheet). **v2 changes start at step 5**: the flows now follow the team's Figma screens, and the echo flow is redesigned to mirror the voice note and song flows.

---

## 1. Scope

### In
- Home, Record choice sheet (done)
- Voice note flow (Figma: "record vn")
- Song flow (Figma: "add a song")
- Echo flow (Figma: "add an echo" first screen, rest specced below)
- "This week" recent entries on Home, updating live after each save

### Out (Phase 2+)
- Timeline, Archive, Breath tabs (placeholders), T2 Wrapped
- Real audio, real contacts, real invites, backend

---

## 2. Information architecture (updated)

```
Home
├── Orb: "How are you feeling today"  →  Record choice sheet
│   ├── Record a voice note
│   │   A1 Ready → A2 Recording → A3 Finished → A4 Anything to add? → A5 Saved
│   ├── Add a song
│   │   B1 Search / pick → B2 Anything to add? → B3 Saved
│   └── Add an echo
│       E1 Add an Echo (search contacts + recent contributors)
│       ├── New person:      E2 Contact results → E3 Send an invite → E4 Sent
│       └── Recent contributor (P1, P2...):
│                            E5 Their voice notes (select, play, edit)
│                            → E6 Anything to add? → E7 Saved
└── Music strip + This week (recent entries)
```

All three flows share one pattern: **pick → anything to add? → saved.** Keep it consistent so the echo flow feels familiar.

---

## 3. Shared sheet rules (all flows)

- Every flow lives in the same bottom sheet over a greyed Home (as in Figma). Moving between states animates the sheet height and cross-fades the content. It's never a new page.
- Sheet header: title 17px / 600 top left, 36x4 grab handle centred.
- Section labels in small caps grey (e.g. "PLAYING NOW", "RECENT CONTRIBUTORS"), 11px, letter-spacing 0.06em, `#8E8E93`.
- "Anything to add?" state is identical across flows: selected item card on top, title "Anything to add?", sub "How are you feeling right now?", multi-select chips, optional note box, full-width outline button "Save to this week".
- Saved state is identical across flows: 56px check tile, "Saved.", item line, "It's part of week 22 now. Echo will remember this one." Auto-closes after 2.5s.
- Colour per flow: purple = voice note, pink = song, **amber = echo** (`--amber-500 #F2A541`, `--amber-600 #D98A1F` for text, `--amber-100 #FDEBD3`, `--amber-50 #FFF6EA`).
- Back: states after the first show a back chevron left of the title. Drag down closes the whole sheet.

---

## 4. Flow A: Record a voice note (match Figma "record vn")

| # | State | UI | Buttons |
|---|---|---|---|
| A1 | Ready | "Recording a voice note", centred label "Voice note #08 / W 22", lavender waveform box with flat grey ticks, grey dot + grey track + `0:00` | [Start recording] full width |
| A2 | Recording | Purple bars fill left to right, vertical playhead with dot on top, red dot, purple progress, live timer | [Pause] [End] half width |
| A3 | Finished | Full purple waveform, green dot, full track, total time (e.g. `2:51`). Pencil beside the label; tapping the label or [Edit] opens A3e | [Edit] [Save] |
| A3e | Edit | The label becomes a centred text input, prefilled "Voice note #09", selected on focus, 15px, 1px bottom border `--purple-500`, max 40 characters. "Re-record" text button under the waveform | [Cancel] [Done] |
| A4 | Anything to add? | Sheet grows taller. Compact waveform card shows the saved name, with pause + skip. Chips: calm, hopeful, relentless, anxious, connected, missing home, don't know why. Note box `--purple-100` | [Save to this week] |
| A5 | Saved | Purple check on `--purple-100`, the saved name | auto close |

- A1 to A3 use the short sheet (Home orb still visible above). A4 is the tall sheet.
- Pause in A2 freezes the bars and timer, and the button becomes [Resume].
- Done in A3e (or Enter) saves the name and returns to A3. Cancel discards the draft. An empty name falls back to "Voice note #09".
- Re-record in A3e confirms: "Re-record? This clears the current take." [Re-record] [Cancel].
- The saved name is the store entry title, the A4 waveform card, the A5 line, and the This week card title. The note number stays a separate field so "#09 / W 22" can show as the card subtitle.
- Fake recording is fine: timer + random bar heights. MediaRecorder optional.
- Voice note number auto-increments.

---

## 5. Flow B: Add a song (match Figma "add a song")

| # | State | UI | Buttons |
|---|---|---|---|
| B1 | Search / pick | "Add a song", grey search pill "Search for a song..." with mic, "PLAYING NOW" card (`--pink-50`, pause, skip, +), "RECENTLY PLAYED" list with dividers and + per row | + on any row |
| B2 | Anything to add? | Selected song card on top (`--pink-50`), chips: calm, hopeful, tearful, anxious, connected, don't know why, note box `--pink-50` | [Save to this week] (pink text) |
| B3 | Saved | Pink check on `--pink-200`, "{Song} by *{Artist}*" (dynamic) | auto close |

- Typing in search filters a mock list of 10 to 12 songs live. No match: "No songs match "{query}". Try a different title or artist."
- Recently played list: Songs About Jane / Maroon 5, Hotel California / Eagles, Bohemian Rhapsody / Queen, She Will Be Loved / Maroon 5 (drop the duplicate row from Figma).
- Mini player + on Home opens B2 directly with the current track.
- Default current track in the mini player: **Let It Happen** by Tame Impala.

---

## 6. Flow C: Add an echo

**What an echo is:** a voice note someone close to Sarah recorded for her or the baby. Contributors send voice notes through an invite link. Sarah picks which ones join her week, like picking a song.

### E1. Add an Echo (match Figma "add an echo")

```
Add an Echo
ADD A CONTRIBUTOR
[ Search from contacts            🎤 ]
RECENT CONTRIBUTORS
(avatar) Jake            5 voice notes    +
(avatar) Aunt Sophie     6 voice notes    +
(avatar) Mom            15 voice notes    +
(avatar) Grandma        12 voice notes    +
```

- Avatars: 44px, radius 8 (same as song art in Figma). Use photos from `public/img/contributors/` if present, otherwise an initial on `--amber-50` with `--amber-600` text.
- A row with new, unseen voice notes shows a small amber dot before the count ("• 2 new").
- Tapping the row or its + opens E5 for that person.
- Tapping the search field goes to E2.

### E2. Contact results (new person)

```
‹ Add an Echo
[ Search from contacts: pri|        🎤 ]
FROM YOUR CONTACTS
(initial) Priya Sharma     0412 345 678     +
(initial) Priyanka D       priyanka@...      +
────────────
[ 🔗 Share an invite link instead ]
```

- Filters a mock contact list live (8 to 10 names).
- People who are already contributors show "Contributor" in grey instead of +.
- Empty result: "No contacts match "{query}"." with the invite link button still shown.
- + on a contact goes to E3.

### E3. Send an invite

- Selected contact card on top (`--amber-50`): initial avatar, name, number.
- "Who are they to you?" single-select chips: partner, mum, dad, sibling, grandparent, aunty / uncle, friend.
- Message box (`--amber-50`), prefilled and editable:
  "Hi Priya, I'm keeping a sound diary for our baby. Would you leave a voice note for week 22?"
- Button: [Send invite] (amber text), disabled until a relationship is picked.

### E4. Sent

- Amber check on `--amber-100`, "Sent."
- Line: "Invite to Priya"
- Body: "When she leaves a voice note, it'll show up in your recent contributors."
- Auto-closes to E1. Priya now appears at the top of Recent contributors with "Invite sent" in place of the count.

### E5. Their voice notes (P1, P2...)

```
‹ Mom                                   ✎
(avatar 56) Mom
            15 voice notes · since week 9
VOICE NOTES
(▶) Good morning, little one     0:42  Week 22   ○
(▶) When you were born           2:15  Week 21   ●
(▶) Your nani's lullaby          1:08  Week 20   ●
(▶) Sunday call                  0:55  Week 19   ○   In archive
[ Add 2 to this week ]
```

- Play button toggles the row into a playing state (`--amber-50` bg, animated bars), one at a time.
- Circle on the right selects the note (amber fill when selected). Notes already archived show "In archive" and no circle.
- Sticky bottom button counts the selection: "Add 1 to this week" / "Add 2 to this week". Disabled at 0 with "Select voice notes to add".
- ✎ Edit mode: each row gets a rename (tap title) and remove (minus icon). ✎ becomes "Done". This is the "editable playlist" from the IA.
- Invite-sent contributor (no notes yet): empty state "Priya hasn't left a voice note yet." + [Send a reminder] → toast "Reminder sent".
- P1 and P2 use this same template with different data.

### E6. Anything to add?

- Top card (`--amber-50`): contributor avatar, "2 voice notes from Mom", play + skip.
- Same "Anything to add?" block. Chips: calm, hopeful, tearful, connected, loved, don't know why. Note box `--amber-50`.
- [Save to this week] (amber text).

### E7. Saved

- Amber check on `--amber-100`, "Saved."
- Line: "2 voice notes from Mom"
- Body: "They're part of week 22 now. Echo will remember these."
- Selected notes now show "In archive" in E5. The contributor's "new" dot clears.

---

## 7. This week (recent entries on Home)

- Section "This week" under Recently played.
- Horizontal row, newest first: voice note (purple mic tile), song (album art), echo (contributor avatar with small amber badge).
- Card: title + "Today, 9:12 pm".
- Empty: "Nothing saved this week yet. Tap the orb to start."
- Record sheet hint switches to "You've saved {n} moments this week." once n > 0.

---

## 8. State and data additions

```ts
type Contact = { id: string; name: string; phone?: string; email?: string };

type Contributor = {
  id: string;
  name: string;               // "Mom", "Aunt Sophie"
  relationship: string;       // chip value
  avatar?: string;
  status: "invited" | "active";
  totalCount: number;         // shown in E1 ("15 voice notes")
  since?: number;             // week number
  notes: ContributorNote[];   // seed 4 to 5 recent ones each
};

type ContributorNote = {
  id: string;
  title: string;
  durationSec: number;
  week: number;
  seen: boolean;
  inArchive: boolean;
};

// Entry gains: kind "echo", contributorId, noteIds[]

actions: saveVoiceNote, saveSong,
         inviteContact, sendReminder,
         addEchoesToWeek(contributorId, noteIds, feelings, note),
         renameNote, removeNote, markSeen
```

Seed: Jake (5), Aunt Sophie (6), Mom (15), Grandma (12), each with 4 to 5 notes in `notes`, 1 to 2 of them unseen. Contacts: 8 to 10 names, including one existing contributor to test the "Contributor" label.

---

## 9. Build steps and checks

| Step | Build | Done when |
|---|---|---|
| 1 to 4 | Done | |
| 5 | Voice note flow A1 to A5 | Full record → save works; number increments; This week updates |
| 6 | Song flow B1 to B3 | Search filters; + on any row goes to B2; Saved shows the right song; mini player + opens B2 |
| 7 | Echo E1 (Figma) + E2 contact search | Recent contributors render with counts and new dots; search filters contacts |
| 8 | E3 Send an invite + E4 Sent | Can't send without a relationship; new person appears as "Invite sent" in E1 |
| 9 | E5 Their voice notes | Play toggles one at a time; selection count updates button; edit mode renames and removes; invited person shows empty state + reminder toast |
| 10 | E6 + E7, wire to store | Saved notes show "In archive"; new dot clears; echo card appears in This week |
| 11 | Polish | Back chevrons work in every flow; reduced motion; 44px targets; no console errors |

---

## 10. Assumptions to confirm with the team

- Echo accent is amber, matching the echo card already on the record sheet
- E2 to E7 are new designs that follow the Figma patterns; the team may want to add them to Figma
- Contributors send voice notes only (no songs) in Phase 1
- Song flow sub copy: Figma says "How does one feel right now?"; this plan uses "How are you feeling right now?" in all three flows for consistency
- Contact names, voice note titles and counts are placeholders
