# Echo Archive: Phase 1 Build Plan

Phase 1 = **Home + the "How are you feeling today" orb flow**, with three ways to record a moment:

1. Record a voice note
2. Add a song
3. **Add an echo** (new): invite loved ones to contribute, and pull their voice notes into your archive

Visual tokens, components and existing screen specs live in `design.md`. This file only covers what to build now and how it connects. If the two conflict, this file wins for Phase 1.

---

## 1. Scope

### In
- Home screen (greeting, orb card, Stone pill, Browse by feeling, music strip, recently played, tab bar)
- Record choice sheet with **3 options** (voice note, song, echo)
- Voice note flow: record → waveform → emotion chips → saved
- Song flow: search → note → saved
- Echo flow: add member → send invite → sent, and recent contributors → contributor playlist → add to archive
- Music strip (mini player) and recent entries, updating live after each save

### Out (Phase 2+)
- Timeline, Archive, Breath tabs: render a placeholder screen ("Coming soon") so the tab bar works
- T2 Wrapped
- Real audio playback, real invites, backend

---

## 2. Information architecture (from the IA board)

```
Home
├── Orb screen: "How are you feeling today"  (Record choice sheet)
│   ├── Record a VN
│   │   └── Recording, waveform → Anything to add (emotion chips) → Saved
│   ├── Add a song
│   │   └── Search for a song → Anything to add (note) → Saved
│   └── Add an echo
│       ├── Add a member → Send an invite → Sent
│       └── Recent contributors
│           ├── P1 → P1 playlist (editable, selected VNs can be added to the archive)
│           └── P2
└── Music strip and recent entries
```

---

## 3. Record choice sheet (updated)

Opens when the orb is tapped (also from "Tap to record a moment").

- Title: "How would you like to record this moment?"
- **Layout:** voice note and song cards stay side by side as in Figma. Add a **full-width Echo card below them**, shorter (≈88px), icon left, text right. This keeps the two existing cards untouched and shows echo as a different kind of action (other people, not you).
- Echo card content:
  - Icon: amber circle with `Users` icon (lucide), soft rings like the other two
  - Title: "Add an echo"
  - Sub: "Invite someone or add what they've shared"
  - Trailing chevron
- Hint banner stays at the bottom (fix comma: "A song, a feeling, a moment, anything worth keeping.")
- Sheet height grows to fit; still drag to dismiss

### New colour for echo (suggested)

Keeps the existing logic: purple = your voice, pink = music, **amber = echoes from others**. Amber already appears in the Browse by feeling sun tile.

| Token | Hex | Use |
|---|---|---|
| `--amber-500` | `#F2A541` | Echo icon circle, buttons text, selected states |
| `--amber-100` | `#FDEBD3` | Saved / Sent check tile, selected chip |
| `--amber-50` | `#FFF6EA` | Echo surfaces: input fields, selected rows |

---

## 4. Flow A: Record a voice note

Per `design.md` 4.3. States in one bottom sheet:

| # | State | Key UI | Exit |
|---|---|---|---|
| A1 | Ready | "Voice note #08 / W 22", flat waveform, `0:00` | Start recording |
| A2 | Recording | Live bars + playhead, red dot, timer | Pause / End |
| A3 | Finished | Full waveform, green dot, total time | Edit / Save |
| A4 | Anything to add? | Compact waveform, emotion chips (multi-select), optional note | Save to this week |
| A5 | Saved | Purple check, "Voice note #08", "It's part of week 22 now. Echo will remember this one." | Auto close after 2.5s |

- Voice note number auto-increments per save
- Fake recording (timer + random bars) is fine. MediaRecorder optional.

---

## 5. Flow B: Add a song

Per `design.md` 4.4.

| # | State | Key UI | Exit |
|---|---|---|---|
| B1 | Search for a song | Search field (filters mock list live), Playing now card, Recently played list with + | Tap + on any song |
| B2 | Anything to add? | Selected song card, chips, note field (pink) | Save to this week |
| B3 | Saved | Pink check, "{Song} by *{Artist}*" (dynamic), same body copy | Auto close |

- Mini player **+** on Home jumps straight to B2 with the current track
- Empty search result: "No songs match "{query}". Try a different title or artist."

---

## 6. Flow C: Add an echo (new, no Figma yet)

**What an echo is:** a voice note or song someone close to the mother (partner, mum, sibling, friend) records for her or the baby. She invites them, they contribute to a shared playlist, and she chooses which of their voice notes join her own archive. Contributors can add, only she can archive.

Match the existing sheet style: white sheet, 28px top radius, same type scale, amber accent.

### C0. Echo hub (first sheet after tapping "Add an echo")

```
Add an echo
Let the people close to you leave something for this week.

[ + Add a member ]                      (full width amber-outline pill)

Recent contributors
┌──────────────────────────────────────┐
│ (avatar) Mum                  3 new ›│
│          Last echo: yesterday        │
├──────────────────────────────────────┤
│ (avatar) Daniel                     ›│
│          Partner · No echoes yet     │
└──────────────────────────────────────┘
```

- Avatars: 44px circles (initials on amber-100 if no photo)
- "3 new" = small amber pill for unseen echoes
- Empty state (no contributors): "No one's been invited yet. Add someone and their echoes will show up here." + Add a member button

### C1. Add a member

- Back arrow + title "Add a member"
- Fields:
  - Name (text)
  - Relationship chips, single select: Partner, Mum, Dad, Sibling, Friend, Other
  - Phone or email (text)
- Button: [Continue] disabled until name + contact are filled
- Inline validation: "Enter a phone number or email so we can send the invite."

### C2. Send an invite

- Title "Send an invite"
- Invite preview card (`--amber-50`, 20px radius), editable text area prefilled:
  > "Hi {Name}, I'm keeping a sound diary for our baby. Would you add a voice note or a song for week 22?"
- Toggle row: "Let {Name} see my saved songs" (default off)
- Button: [Send invite]

### C3. Sent

- Same pattern as Saved: amber check tile, "Sent."
- Line: "Invite to {Name}"
- Body: "When {Name} adds an echo, you'll see it here first."
- Auto close after 2.5s, return to Echo hub with the new member listed as "Invite pending"

### C4. Contributor playlist (P1: Mum, has echoes)

```
‹  Mum's echoes                       Edit
   6 echoes · since week 18

Voice notes
[ ] (thumb) For when you can't sleep   0:42  ▶
[✓] (thumb) Your great-grandma's song  1:15  ▶
[✓] (thumb) Week 21 hello              0:30  ▶
Songs
    (art)   Lag Ja Gale / Lata Mangeshkar  ▶
    (art)   Here Comes the Sun / The Beatles ▶

[ Add 2 to my archive ]               (sticky bottom, amber)
```

- Voice note rows have a checkbox on the left. Songs are listen-only in Phase 1.
- Button label counts selection; disabled at 0 ("Select voice notes to add")
- Play toggles row to playing state (amber-50 bg + equaliser bars), one at a time
- **Edit mode** (tap Edit): rows show a remove icon and rename on tap; Edit becomes Done
- Voice notes already in the archive show a small "In archive" tag and no checkbox
- On add: confirmation sheet, amber check, "Added." / "2 echoes from Mum" / "They're part of week 22 now."

### C5. Contributor detail (P2: Daniel, no echoes yet)

- Same header, "No echoes yet"
- Empty state: "Daniel hasn't added anything yet." + [Send a reminder] (shows a toast "Reminder sent")

---

## 7. Music strip and recent entries (Home)

- **Music strip** = mini player above tab bar (per `design.md`). Pause/play toggles icon. Skip cycles through the mock queue. + opens B2.
- **Recent entries** (suggested addition under Recently played):
  - Section title "This week"
  - Horizontal row of small cards, newest first, one per saved item: voice note (purple mic tile), song (album art), echo (amber tile with contributor initial)
  - Each card: title + "Today, 9:12 pm"
  - Empty: "Nothing saved this week yet. Tap the orb to start."
- The hint banner on the record sheet switches from "You haven't recorded this week yet." to "You've saved {n} moments this week." once n > 0

---

## 8. State and data

One store (Zustand or React context) so saves show everywhere.

```ts
type Kind = "voice" | "song" | "echo";

type Entry = {
  id: string;
  kind: Kind;
  title: string;
  artist?: string;
  art?: string;
  feelings: string[];
  note?: string;
  durationSec?: number;
  contributorId?: string;   // for echoes
  createdAt: string;
  week: number;
};

type Contributor = {
  id: string;
  name: string;
  relationship: "Partner" | "Mum" | "Dad" | "Sibling" | "Friend" | "Other";
  contact: string;
  status: "pending" | "active";
  avatar?: string;
  echoes: EchoItem[];
};

type EchoItem = {
  id: string;
  kind: "voice" | "song";
  title: string;
  artist?: string;
  durationSec?: number;
  addedToArchive: boolean;
  seen: boolean;
};

actions: saveVoiceNote, saveSong, inviteMember, addEchoesToArchive,
         renameEcho, removeEcho, markSeen, togglePlay, skipTrack
```

Seed data in `src/data/mock.ts`: user Sarah (week 22), current track Chandaniya, 4 recently played, song search list (8 to 10 songs), contributors Mum (active, 5 to 6 echoes) and Daniel (active, 0 echoes).

---

## 9. Build steps and checks

| Step | Build | Done when |
|---|---|---|
| 1 | Tokens (incl. amber), fonts, PhoneFrame, StatusBar, TabBar, placeholder tabs | All 4 tabs switch; frame renders at 390 x 844 |
| 2 | Home layout, Orb pulse, Stone pill, Browse by feeling, Recently played | Matches Figma Home side by side |
| 3 | Store + mock data, MiniPlayer (play/pause/skip) | Skip changes track on the strip |
| 4 | BottomSheet + Record choice sheet with 3 options | Orb opens sheet; all 3 options route; drag dismiss works |
| 5 | Voice note flow A1 to A5 | Save adds entry, number increments, This week row updates |
| 6 | Song flow B1 to B3 | Search filters; Saved shows chosen song; + on strip jumps to B2 |
| 7 | Echo hub + Add member + Send invite + Sent | New member appears as pending; validation works |
| 8 | Contributor playlist (P1) + empty P2 + Edit mode | Selecting 2 and adding marks them "In archive" and adds to This week |
| 9 | Polish: reduced motion, focus rings, 44px targets, copy check | No console errors; keyboard can complete each flow |

---

## 10. Assumptions to confirm with the team

- Echo card sits full width under the other two (not a third column)
- Amber is the echo colour
- Contributors can add voice notes and songs; only voice notes can be added to the archive (per IA)
- "Recent entries" is a new "This week" row on Home
- Contributor names (Mum, Daniel) and their echo titles are placeholders
