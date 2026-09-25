# Echo Archive: Prototype Design Spec

Build spec for a clickable, high-fidelity mobile prototype of **Echo Archive**, a pregnancy companion app that lets a mother capture songs, voice notes and feelings week by week, then reflect on them. It pairs with a physical "Stone" object (shown as "Stone connected" on Home).

Context: the product supports mothers through the in-between of becoming a parent. Tone is soft, calm, unhurried. Nothing should feel clinical or gamified.

This file is the single source of truth. Follow the screens, copy and tokens below exactly unless a line says "suggested".

---

## 1. Tech setup

- **Stack:** Vite + React + TypeScript + Tailwind CSS + Framer Motion + lucide-react icons
- **Routing:** react-router (or simple state-based screen switching)
- **Viewport:** render the app inside a centred iPhone frame, 390 x 844, 44px corner radius, on a neutral `#D9D9D9` page background. On real mobile widths, drop the frame and go full screen.
- **Data:** all mock data in `/src/data/mock.ts`. No backend.
- **Audio (optional):** voice recording via `MediaRecorder`; if permission is denied, fall back to a fake timer and animated waveform.
- **Images:** album art and user photo go in `/public/img/`. Use placeholder gradient squares if images are missing. Do not hotlink.

### Suggested folder structure

```
src/
  app/App.tsx
  components/
    PhoneFrame.tsx
    StatusBar.tsx
    TabBar.tsx
    MiniPlayer.tsx
    BottomSheet.tsx
    Orb.tsx
    Waveform.tsx
    Chip.tsx
    ListRow.tsx
    PillButton.tsx
    AlbumTile.tsx
  screens/
    Home.tsx
    Timeline.tsx
    Archive.tsx
    WeekDetail.tsx
    Breath/ (Choose, Countdown, Session)
    Wrapped.tsx
  sheets/
    RecordChoiceSheet.tsx
    VoiceNoteSheet.tsx
    AddSongSheet.tsx
    SavedSheet.tsx
  data/mock.ts
  styles/tokens.css
```

---

## 2. Design tokens

### Colours (sampled from the Figma)

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#FFFFFF` | Light screen base |
| `--bg-tint` | `#FBF8FF` | Faint lavender radial glow behind light screens |
| `--purple-500` | `#8F59E2` | Primary: orb core, mic button, voice note dots, arrows, active states |
| `--purple-300` | `#B28DEC` | Orb rings |
| `--purple-100` | `#F0E9FB` | Voice note surfaces: waveform box, note input, selected chip |
| `--purple-50` | `#F4EDFD` | Insight card bg, hint banner |
| `--pink-500` | `#F472B6` | Song actions: music button, today marker, music dots, song flow accents |
| `--pink-200` | `#FCCEE8` | Song "Saved" check tile |
| `--pink-50` | `#FBF1FA` | Song surfaces: now playing card, note input, selected chip |
| `--green-100` | `#D9EEB3` | "Stone connected" pill bg |
| `--green-600` | `#5E9A2C` | Stone pill dot + text (suggested, adjust to match) |
| `--text-900` | `#111111` | Headings |
| `--text-700` | `#3A3A3C` | Body, list titles |
| `--text-400` | `#A1A5B0` | Secondary: greeting, "Week 22", subtitles |
| `--line` | `#E6E6EA` | Card borders, chip outlines, dividers |
| `--chip-inactive` | `#E5E5E5` | "Done" / "Active" status pills |
| `--dark-bg` | `#1A1A1A` | Breathing mode background |
| `--dark-glow` | `#7B579D` | Breathing glow |
| `--dark-pill` | `rgba(255,255,255,0.18)` | Breathing option pills |
| `--rec-red` | `#E5484D` | Recording dot |
| `--ok-green` | `#30A46C` | Recording finished dot |

**Colour logic:** purple = voice / self, pink = music. Keep this mapping everywhere (dots, sheets, saved states).

### Wrapped gradients (top-left to bottom-right)

| Slide | From | To |
|---|---|---|
| 1 Anxious | `#A385F7` | `#6D2BDB` |
| 2 3am | `#5DA4F4` | `#157898` |
| 3 Breathe Deeper | `#F7C9E6` | `#C32969` |
| 4 68 times | `#F6D2A8` | `#83431D` |
| 5 Restless to Grounding | `#F06AB4` | `#8B2BCB` |

### Typography

- **Sans (UI):** Inter (weights 400, 500, 600, 700). Fallback: `-apple-system, system-ui`.
- **Serif (display):** Georgia-style serif. Suggested webfont: `"Source Serif 4"` or plain `Georgia`. Used for:
  - Bold: "Echo Archive" (with *Archive* in italic regular), "Week 22"
  - Italic regular: breathing screen text ("Choose your breathing", "inhale", "3"), Wrapped hero words

| Style | Font | Size / line | Weight |
|---|---|---|---|
| Greeting | Inter | 15 / 20 | 400, `--text-400` |
| Name (Sarah) | Inter | 34 / 40 | 700 |
| Week line | Inter | 16 / 22 | 500, `--text-400` |
| Page title serif | Serif | 36 / 40 | 700 |
| Section label | Inter | 15 / 20 | 400, `--text-400` |
| Card title | Inter | 15 / 20 | 600 |
| Sheet title | Inter | 17 / 22 | 600 |
| List title | Inter | 15 / 20 | 600 |
| List subtitle | Inter | 12 / 16 | 400, `--text-400` |
| Chip | Inter | 12 / 16 | 400 |
| Tab label | Inter | 11 / 14 | 500 |
| Breathing word | Serif italic | 40 / 44 | 400, white |
| Breathing eyebrow | Inter | 10, letter-spacing 0.2em, uppercase | 500, white 50% |
| Wrapped hero | Serif italic | 44 / 48 | 700, white |

### Spacing, radius, elevation

- Screen side padding: **20px**
- Vertical rhythm: 8px grid (8 / 12 / 16 / 24 / 32)
- Radius: cards **20px**, list rows **16px**, album tiles **12px**, chips & pill buttons **999px**, bottom sheets **28px** top corners, record choice cards **28px**
- Shadow (cards, sheets): `0 8px 24px rgba(143, 89, 226, 0.08)`, plus 1px `--line` border on cards
- Bottom sheet overlay: dims background to ~60% white wash (the screen behind goes grey, not black)

---

## 3. Global components

### StatusBar
- 9:41 left, signal / wifi / battery right. Black on light screens, hidden or white on dark breathing screens.

### TabBar (4 tabs)
- Home (house), Timeline (clock), Archive (archive box), Breath (heart)
- Active: black icon + label. Inactive: `--text-400`
- 1px top border `--line`, white bg, home indicator bar below
- Timeline tab opens the calendar screen, Breath tab opens breathing mode

### MiniPlayer
- Floating card above the tab bar (Home, Timeline, Archive; hidden on Breath and Wrapped)
- Default current track: **"Let It Happen"** by Tame Impala
- Adapts by type: song (album art + artist + pause/skip/+), voice note (purple waveform tile, no +), echo (avatar + amber badge, no +)
- Thin 2px progress line in the item's accent colour
- Controls: pause, skip, **+** on songs only (opens Add a Song sheet with that track preselected)

### Orb (signature element)
- 3 concentric circles in purple: outer ring `--purple-300` at 60%, middle ring, solid core `--purple-500`
- Soft outer blur halo (radial gradient, ~200px)
- Idle animation: slow breathing scale 1.0 to 1.04 over 4s, ease-in-out, infinite
- Respect `prefers-reduced-motion` (no pulse)
- Tap: opens Record Choice sheet

### BottomSheet
- White, 28px top radius, grab handle 36x4 `#D9D9D9` centred at top
- Slides up with spring (Framer Motion `type: "spring", damping: 30, stiffness: 300`)
- Drag down or tap overlay to dismiss

### Chip
- Outline pill, 1px `--line`, 12px text, padding 6 x 14
- Selected: fill `--purple-100` (voice) or `--pink-50` (song), border same tone darker
- Multi-select allowed

### PillButton
- Full width or half width, white fill, 1px `--line`, 999px radius, 44px tall
- Text 13px, `--purple-500` (voice flow) or `--pink-500` (song flow)

### ListRow
- White card, 16px radius, subtle shadow, 64px tall
- 44px thumbnail (radius 8), title + subtitle, trailing actions (pencil + play, or status pill, or plus)
- Playing state: row bg `--purple-100`, thumbnail shows animated white equaliser bars, play icon becomes pause

---

## 4. Screens

### 4.1 Home

```
Good evening,                     (avatar 64px circle)
Sarah
Week 22 · Second Trimester

┌──────────────────────────────┐
│   How are you feeling today ?│
│            ( Orb )           │
│       [● Stone connected]    │
│     Tap to record a moment   │
└──────────────────────────────┘
Browse by feeling
[ moon / lavender ][ heart / pink ][ sun / peach ] → horizontal scroll
Recently played
[Breathe][Yellow][Holocene][Breathe] → horizontal scroll
(MiniPlayer)
(TabBar)
```

- Background: white with a very faint lavender radial glow top right
- Feeling card: white, 20px radius, 1px `--line`, centred content
- "Stone connected" pill: `--green-100` bg, green dot + text
- Browse by feeling tiles: 136 x 96, 20px radius, gradient fills (lavender `#C9B8FF`, pink `#F7A8D0`, peach `#FFD39A`), outline icon top left (moon, heart, sun), label bottom left (suggested labels: "Calm nights", "Tender", "Bright days")
- Recently played: 88px square album tiles, title (600) + artist below
- Page scrolls under the MiniPlayer and TabBar

### 4.2 Record Choice sheet (opens from Orb tap)

- Title: "How would you like to record this moment?"
- Two cards side by side:
  - Purple mic button with 2 soft rings: "Tap to record voice note" → Voice Note flow
  - Pink music button with 2 soft rings: "Tap to archive a song" → Add Song flow
- Hint banner (`--purple-50`, centred, 13px, `--text-400`):
  "A song, a feeling, a moment, anything worth keeping. You haven't recorded this week yet."

### 4.3 Voice Note flow (bottom sheet, 5 states)

Header on all: "Recording a voice note". Label: "Voice note #08 / W 22".

| State | Waveform box | Progress row | Buttons |
|---|---|---|---|
| 1. Ready | Flat grey tick marks | Grey dot, grey line, `0:00` | [Start recording] full width |
| 2. Recording | Purple bars grow left to right, playhead line with dot | Red dot, purple progress, live timer (e.g. `0:54`) | [Pause] [End] |
| 3. Finished | Full purple waveform | Green dot, full purple line, total (e.g. `2:51`) | [Edit] [Save] |
| 4. Anything to add? | Compact waveform card with pause + skip | none | [Save to this week] |
| 5. Saved | see 4.5 | | |

State 4 details:
- Title "Anything to add?", sub "How are you feeling right now?"
- Chips: calm, hopeful, relentless, anxious, connected, missing home, don't know why
- Text area `--purple-100`, placeholder "Add a note... (optional)", 110px tall
- Sheet grows taller for this state (animate height)

### 4.4 Add Song flow (bottom sheet, 3 states)

State 1: search
- Title "Add a song"
- Search field: grey pill, search icon, placeholder "Search for a song...", mic icon right
- "PLAYING NOW" label, then current track card (`--pink-50` bg) with pause, skip, **+**
- "RECENTLY PLAYED" label, list with thumbnails and **+** per row, 1px dividers
  - Songs About Jane / Maroon 5
  - Hotel California / Eagles
  - Bohemian Rhapsody / Queen
  - She Will Be Loved / Maroon 5
- Tapping + on any row goes to state 2 with that track

State 2: Anything to add?
- Selected track card at top (`--pink-50`)
- "Anything to add?", sub "How are you feeling right now?"
- Chips: calm, hopeful, tearful, anxious, connected, don't know why (selected fill `--pink-50`)
- Note area `--pink-50`, "Add a note... (optional)"
- [Save to this week] in pink text

State 3: Saved (pink variant, see 4.5)

### 4.5 Saved sheet (shared)

- Centred check tile 56px, radius 12: `--purple-100` + purple check (voice) or `--pink-200` + pink check (song)
- "Saved." 22px 600
- Item name: "Voice note #08" or "{Song} by *{Artist}*" (artist italic)
- Body (`--text-400`, 15px, centred): "It's part of week 22 now. Echo will remember this one."
- Animate check with a stroke draw (300ms), then auto-dismiss after 2.5s back to Home

### 4.6 Timeline (calendar)

```
Good evening,
Sarah
Your pregnancy journey
      Trimester 02 / W22
┌ T2 INSIGHTS ────────────────┐
│ See your T2 Wrapped         │
│ Your second trimester in    │
│ music and feeling           │
│ ● ● ● ● ●                   │
│ 12 insights ready      (→)  │
└─────────────────────────────┘
┌ ‹   May 2026   › ───────────┐
│ SUN MON TUE WED THU FRI SAT │
│ dates with 1-2 dots under   │
│ ● Music  ● Voice note       │
│ ┌ 10 May 2026 ────────────┐ │
│ │ ♪ Morning acoustic 9:12am│ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
Heavy rotations
[Holocene][Breathe (2 AM)][Yellow]  each with play-count pill
```

- Heavy rotations (canonical): **Breathe Deeper 44**, Holocene 41, Breathe (2 AM) 36

- "Trimester 02" bold, "/ W22" `--text-400`
- Insight card: `--purple-50` bg, 20px radius; five small dots in purple, blue, pink, brown, pink (preview of Wrapped palettes); round purple arrow button → Wrapped
- Month nav: chevrons in 28px `--purple-50` rounded squares
- Each date can show dots: pink = music, purple = voice note
- Today (10) = solid pink circle, white text
- Selected date = `--pink-50` rounded square behind it
- Tapping a date updates the day panel below with that day's entries:
  - 10 May: Morning acoustic (music, 9:12 am)
  - 15 May: Throwback hits (2:00 pm), Lo-fi sunset (6:30 pm)
  - 17 May: Reflections (voice, 7:15 am)
  - 20 May: Party playlist (music, 6:00 pm), Voice note #20 (voice, 10:00 pm)
- Entry rows: grey pill, small icon tile (music note pink / mic purple), name, time right aligned
- Heavy rotations: 3 album tiles, title, artist, plays pill `--pink-50`

### 4.7 Archive

**Archive home**
- Eyebrow "Your archive,"
- Title: **Echo** *Archive* (serif, bold + italic)
- Sub: "Your journey from day one"
- "Playlists" section, rows with status pill right:
  - Second Trimester, 68 songs - Week 14-27, **Active**
  - First Trimester, 34 songs - Week 01-13, Done
  - 3am Sessions, 22 songs - Late nights, Done
  - Bonding with Baby, 18 songs - Most played together, Done
- "Voice notes" section:
  - Week 22, 13 Voice notes, **Active**
  - Week 21, Done
  - Week 20, 16 Voice notes, Done
  - Week 19, Done
- Status pill: `--chip-inactive` bg, 12px text. Suggested: tint "Active" in `--purple-100` so it reads differently from Done
- Tap a week row → Week Detail

**Week Detail**
- Eyebrow "Your sonic memories", title **Week 22** (serif bold)
- "Voice notes" list, each row: thumbnail, title, feeling chips as subtitle, pencil + play
  - Missing Home / Relentless, Missing Home
  - Her name / Hopeful
  - Late night / Happy, Hopeful
  - Lullabies / Connected
  - Lullaby / Happy, Hopeful
- Play: row turns `--purple-100`, thumbnail overlays animated equaliser bars, icon becomes pause. Only one row plays at a time.
- Pencil: opens the "Anything to add?" sheet prefilled (suggested)

### 4.8 Breath (Relief Mode, dark)

All breathing screens: `--dark-bg`, a tall vertical capsule of blurred `--dark-glow` in the centre (roughly 240 x 440, blur 60px), eyebrow at top, pill button at bottom (white text, 1px white 20% border, `rgba(255,255,255,0.06)` fill).

**Choose**
- Eyebrow "RELIEF MODE"
- Title *Choose your breathing* (serif italic, white)
- Three stacked pills (`--dark-pill`, 999px radius, 240 x 56):
  - 4-7-8 Breathing / For calming anxiety
  - Box Breathing / For grounding
  - Belly Breathing / For connecting with your baby
- Bottom: [Back to home]

**Countdown**
- Eyebrow "RELIEF MODE · STARTING"
- Large serif italic numeral 3 → 2 → 1, one per second, crossfade
- Bottom: [Cancel]

**Session**
- Eyebrow "RELIEF MODE · {PATTERN NAME}"
- Phase word: *inhale* / *hold* / *exhale* (serif italic 40px)
- Instruction line (white 50%)
- Thin progress bar 120px, white fill on white 25% track, fills across the phase
- Counter "4 COUNTS" counting down each second
- Glow capsule scales up on inhale, holds, scales down on exhale (this is the key motion; tie scale to phase progress)
- Bottom: [End Session] → back to Home

Phase timing (seconds):

| Pattern | Inhale | Hold | Exhale | Hold |
|---|---|---|---|---|
| Box | 4 | 4 | 4 | 4 |
| 4-7-8 | 4 | 7 | 8 | none |
| Belly (suggested) | 4 | none | 6 | none |

Instruction copy per phase:
- inhale: "Breathe in through your nose"
- hold: "Hold gently"
- exhale: "Breathe out through your mouth"

### 4.9 T2 Wrapped (story format)

- Full-screen story, 5 slides, gradient per slide (see tokens)
- Top right: close X in a 28px white 25% circle → back to Timeline
- Eyebrow "Echo T2 Insights" (11px white 80%)
- Centre card: white 15% fill, 20px radius, backdrop blur
- Footer line under card (13px white 80%)
- Progress: "N OF 5, TAP OR SWIPE" + dots, active dot is a wider white pill
- Tap right half = next, left half = back, swipe supported. Auto-advance optional (6s)

| # | Card top | Hero | Card bottom | Footer |
|---|---|---|---|---|
| 1 | Through your second trimester | *Anxious* | Mixed with happiness and excitement | You're not alone in feeling this way |
| 2 | In the quiet hours of night | *3am* | is your most active hour | T2 unfolds when the world sleeps |
| 3 | When one song said it all | *Breathe Deeper* + album art + *Tame Impala* | | No voice note. Just this song capturing the moments it held |
| 4 | You've turned to music | **68** *times* | seeking comfort and release | Every song held space for you |
| 5 | The voices around you | **38** *echoes* | from four people who love you | Mom left the most: 15 voice notes |
| 6 | Your emotional journey | **Restless → Grounding** (bold serif italic) | the shift Echo noticed | Look how far you've come |

---

## 5. Navigation map

```
Home
 ├─ Orb tap → Record Choice sheet
 │    ├─ Voice note → Ready → Recording → Finished → Anything to add? → Saved → Home
 │    └─ Song → Add a song → Anything to add? → Saved → Home
 ├─ MiniPlayer + → Add a song (state 2, current track)
 └─ Tabs
Timeline
 ├─ Date tap → day panel updates
 └─ T2 Wrapped card → Wrapped (5 slides) → X → Timeline
Archive
 └─ Week row → Week Detail (play / pause rows)
Breath
 └─ Choose → Countdown 3-2-1 → Session loop → End Session → Home
```

Saved items should appear in state (Week 22 list and today's calendar dots update) so the demo feels real.

---

## 6. Mock data shape

```ts
type Feeling = "calm" | "hopeful" | "relentless" | "anxious" | "connected"
  | "missing home" | "tearful" | "happy" | "don't know why";

type Entry = {
  id: string;
  kind: "voice" | "song";
  title: string;          // "Voice note #08" or song title
  artist?: string;
  art: string;            // /img/...
  feelings: Feeling[];
  note?: string;
  durationSec?: number;
  date: string;           // ISO
  week: number;
};

type Playlist = { id: string; name: string; count: number; meta: string; status: "Active" | "Done"; art: string };

const user = { name: "Sarah", week: 22, trimester: 2, stoneConnected: true };
```

---

## 7. Motion summary

- Orb idle pulse (4s loop)
- Bottom sheets: spring up, drag to dismiss
- Waveform bars: grow in live while recording (random heights 8 to 48px, 3px wide, 4px gap, rounded)
- Saved check: stroke draw
- Equaliser bars on playing rows: 3 to 4 bars, staggered height loop
- Breathing capsule: scale 0.85 to 1.1 synced to phase
- Wrapped: crossfade + slight scale between slides
- All motion off under `prefers-reduced-motion`

---

## 8. Accessibility

- Min tap target 44 x 44
- Text on gradients stays white, check contrast on slide 3 top (light pink) and slide 4 top (light peach); add a subtle dark overlay if needed
- Buttons have visible focus rings (2px `--purple-500`)
- Breathing phases announced via `aria-live="polite"`

---

## 9. Copy fixes to consider (spotted in the Figma)

- Exhale screens say "Breathe in through your nose". Should be an exhale instruction.
- Wrapped slide 3 counter reads "2 OF 5". Should be "3 OF 5".
- Song flow subtitle reads "How does one feel right now?" vs "How are you feeling right now?" in the voice flow. Pick one.
- Song Saved screen shows "Parachutes by Coldplay" while the flow selected "Chandaniya". Make it dynamic.
- Home hint banner is missing a comma: "a moment, anything worth keeping".
- Heavy rotations all show "41 plays". Use different counts for realism.

---

## 10. Build order for Cursor

1. Tokens (`tokens.css` + Tailwind theme extension), fonts, PhoneFrame, StatusBar, TabBar
2. Home static layout + Orb animation + MiniPlayer
3. BottomSheet component, Record Choice sheet
4. Voice Note flow (fake timer first, MediaRecorder second)
5. Add Song flow + shared Saved sheet
6. Archive + Week Detail with play state
7. Timeline calendar with dots and day panel
8. Breath flow with phase engine (`useBreathingCycle(pattern)` hook)
9. Wrapped stories
10. Wire global state so saves show up across Archive and Timeline
