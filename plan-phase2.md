# Echo Archive: Phase 2 Build Plan (Timeline + T2 Wrapped)

Phase 2 = the **Timeline tab**: a calendar of every moment saved in the second trimester, a T2 Insights card, Heavy rotations, and the **T2 Wrapped** story.

- Visual tokens and components: `design.md` (Timeline is section 4.6, Wrapped is 4.9). Reuse everything already built in Phase 1: tokens, fonts, PhoneFrame, TabBar, album tiles with the tinted shadow, section labels, the amber echo tokens, the store.
- If this file and `design.md` conflict, this file wins for Phase 2.
- Phase 1 stays as it is. Don't restyle Home or the flows.

---

## 1. Information architecture

```
Timeline tab
├── Header: "Good evening, Sarah" · "Your pregnancy journey" · "Trimester 02 / W22"
├── T2 Insights card ("See your T2 Wrapped", 12 insights ready, →)
│   └── T2 Wrapped (full-screen story, 6 cards)
│       1 Anxious → 2 3am → 3 Breathe Deeper → 4 68 times → 5 Echoes (new) → 6 Restless → Grounding
│       └── ✕ or finish → back to Timeline
├── Calendar (month nav, dots per day, legend)
│   └── Tap a date → Day panel (that day's songs, voice notes, echoes)
│       └── Tap a row → play (song → mini player track, voice / echo → inline play)
└── Heavy rotations (top 3 songs of T2 with play counts)
```

---

## 2. Data rules (keep everything consistent with Phase 1)

### "Today"
- The prototype's today is **Saturday 30 May 2026, Week 22**. Anything saved in the Phase 1 flows lands on 30 May with the real time.
- The pink "today" circle sits on 30 May. The Figma has it on 10 May, but data after today would be impossible, so it moves.
- The calendar opens on May 2026 with today selected.
- T2 = weeks 14 to 27. Seed data covers **March, April and May 2026**. The next chevron is disabled after May.

### Only use content that already exists in the app

| Type | Allowed items |
|---|---|
| Songs | Chandaniya (Sajid Wajid), Breathe (2 AM) (Anna Nalick), Yellow (Coldplay), Holocene (Bon Iver), She Will Be Loved (Maroon 5), Hotel California (Eagles), Songs About Jane (Maroon 5), Bohemian Rhapsody (Queen) |
| Voice notes | Missing Home, Her name, Late night, Lullabies, Lullaby (from the Archive Figma), plus anything saved in Phase 1 |
| Echoes | Voice notes from Jake, Aunt Sophie, Mom and Grandma, using the titles already seeded in Phase 1 (e.g. Mom's "Good morning, little one") |

- Figma playlist names in the day panel ("Morning acoustic", "Throwback hits", "Lo-fi sunset", "Party playlist", "Reflections", "Voice note #20") are **replaced with real songs and voice notes** from the list above.
- Use the same album art in `public/img` everywhere.

### May 2026 seed (matches the Figma dots, plus sparse echoes)

| Date | Entries |
|---|---|
| 1 | song |
| 2 | voice |
| 4 | song, voice |
| 5 | song |
| **6** | **echo: Grandma** |
| 7 | voice |
| 8 | song |
| 9 | song, voice |
| 10 | song: Holocene 9:12 am |
| 11 | voice |
| **12** | **echo: Aunt Sophie** |
| 13 | song |
| 15 | song: Yellow 2:00 pm, song: Breathe (2 AM) 6:30 pm |
| 17 | voice: Missing Home 7:15 am |
| 18 | song |
| **19** | **echo: Jake**, song |
| 20 | song: She Will Be Loved 6:00 pm, voice: Late night 10:00 pm |
| 22 | song |
| 24 | voice, song |
| 26 | song |
| **27** | **echo: Mom** |
| 28 | song, voice |
| 30 (today) | song: Chandaniya, plus anything saved in this session |

- Unnamed entries get a title from the allowed lists, with a plausible time (morning, evening or late night; weight late nights since "3am" is the most active hour).
- **Echoes are sparse**: about one a week, never more than one per day.
- Seed March and April the same way (lighter in March), so month navigation feels real.

### Totals that Wrapped and Heavy rotations read from
- Heavy rotations: **Breathe Deeper 44**, Holocene 41, Breathe (2 AM) 36.
- Wrapped card 3 top song: **Breathe Deeper** by Tame Impala (not Holocene).
- Wrapped card 6 hero: **Restless → Grounding** in bold serif italic.
- Song moments in T2: 68 (Wrapped card 4).
- Echoes in T2: 38 voice notes from 4 people (Mom 15, Grandma 12, Aunt Sophie 6, Jake 5). These match the counts in the Phase 1 echo sheet.

---

## 3. Timeline page (match Figma "timeline")

### Header
- "Good evening," 15px `#A1A5B0`; "Sarah" 34px/700; "Your pregnancy journey" 15px `#A1A5B0`.
- Centred "**Trimester 02** / W22": bold part `#111111`, "/ W22" `#A1A5B0`, 17px.
- No avatar on this page (as in Figma).

### T2 Insights card
- `--purple-50` background, 24px radius, 1px `#EDE4FB` border, 20px padding.
- "T2 INSIGHTS" small caps 12px `#6E6E73`. "See your T2 Wrapped" 24px/700. "Your second trimester in music and feeling" 15px `#6E6E73`.
- **Six** dots, 10px, 6px gap, one per Wrapped card colour in order: `#A385F7`, `#5DA4F4`, `#E064A0`, `#B98352`, `#F2A541` (echo, new), `#D14FC4`.
- "12 insights ready" 15px `#6E6E73`, with a 32px `--purple-500` round arrow button on the right.
- The whole card is tappable. Press: scale 0.98. Opens Wrapped.

### Calendar card
- White, 24px radius, 1px `#E6E6EA` border, 16px padding.
- Month row: 32px `--purple-50` rounded-square chevrons (`--purple-500` icon), "May 2026" 20px/500 centred. Next is disabled (30% opacity) on the last seeded month.
- Weekday row: SUN to SAT, 12px, `#8E8E93`, letter-spacing 0.04em.
- Day cell: 44px wide, 52px tall. Number 16px `#111111`, with dots 6px below.
- Dots: 5px circles, 3px gap, max 3 per day, in entry order. Colours: music `--pink-500`, voice `--purple-500`, **echo `--amber-500`**.
- Today: 36px `--pink-500` circle, white number.
- Selected (when not today): `--pink-50` rounded square 44x52, radius 12.
- Future days (after 30 May) show numbers only in `#C7C7CC` and aren't tappable.
- Days with no entries are tappable and show the empty day panel.
- Month change: slide the grid 24px and cross-fade (200ms). Reduced motion: fade only.

### Legend
- Centred row under the grid: ● Music, ● Voice note, ● Echo. Dots 8px, labels 14px `#6E6E73`, 20px between items.

### Day panel (inside the calendar card)
- Nested card: `#FAFAFC` background, 16px radius, 1px `#EFEFF4` border, 12px padding.
- Date label "15 May 2026" 14px `#8E8E93`.
- Entry rows: pill, 48px tall, white, 1px `#ECECF1` border, 999px radius.
  - Left: 28px tile with icon. Music note on `--pink-50` / `--pink-500`; mic on `--purple-50` / `--purple-500`; people icon on `--amber-50` / `--amber-600`.
  - Title 15px `#111111`. For echoes: "{Name}: {note title}", e.g. "Mom: Good morning, little one".
  - Time right-aligned, 14px `#8E8E93`.
- Tap a song row: it becomes the current track in the mini player store and the row shows playing bars.
- Tap a voice or echo row: inline play state (tinted row + animated bars), one at a time.
- Empty day: "Nothing saved on this day." 14px `#8E8E93`, centred.
- When the selected day changes, the panel height animates and the rows fade in with a 30ms stagger.

### Heavy rotations
- Section label "Heavy rotations" 17px `#A1A5B0`, 20px above the tiles.
- 3 tiles in a row: same album tile component and tinted shadow as Home "Recently played", 96x96, radius 12.
- Title 15px/600, artist 13px `#8E8E93`, plays pill: `--pink-50` fill, `--pink-500` text 12px, "41 plays".
- Tap: sets the current track.

### Page
- The mini player isn't shown on Timeline (as in Figma).
- The page scrolls vertically with hidden scrollbars. There's bottom padding for the tab bar.
- New entries saved from Phase 1 flows appear on 30 May right away (reads from the store).

---

## 4. T2 Wrapped (match Figma "T2 wrapped" + one new echo card)

### Shell
- Full-screen over the phone frame (covers the status bar area and tab bar), with a gradient background per card.
- Top right ✕: 28px circle, white 25%, closes back to Timeline with the insight card in place.
- Eyebrow "Echo T2 Insights" 11px white 80%, letter-spacing 0.04em.
- Glass card: white 15%, `backdrop-filter: blur(12px)`, 24px radius, 1px white 20% border, centred.
- Footer line 14px white 85%.
- Progress: "N OF 6 · TAP OR SWIPE" 10px white 70% + dots (active dot is a 20px white pill, others 5px white 50%).
- Navigation: tap right half = next, left half = back, swipe left and right, arrow keys, Esc closes. After card 6, next closes.
- Transition: cross-fade + scale 0.98 → 1 (350ms), and the gradient cross-fades too. Reduced motion: 150ms fade.
- Hero text: serif italic (same serif as `design.md`), white.

### Cards

| # | Gradient (135deg) | Card top | Hero | Card bottom | Footer |
|---|---|---|---|---|---|
| 1 | `#A385F7` → `#6D2BDB` | Through your second trimester | *Anxious* | Mixed with happiness and excitement | You're not alone in feeling this way |
| 2 | `#5DA4F4` → `#157898` | In the quiet hours of night | *3am* | is your most active hour | T2 unfolds when the world sleeps |
| 3 | `#F7C9E6` → `#C32969` | When one song said it all | *Breathe Deeper* + 56px album art + *Tame Impala* | | No voice note. Just this song capturing the moments it held |
| 4 | `#F6D2A8` → `#83431D` | You've turned to music | **68** *times* | seeking comfort and release | Every song held space for you |
| **5** | **`#FFD98A` → `#E07A2E`** | **The voices around you** | **38** *echoes* + a row of 4 overlapping 36px avatars (Mom, Grandma, Aunt Sophie, Jake) | **from four people who love you** | **Mom left the most: 15 voice notes** |
| 6 | `#F06AB4` → `#8B2BCB` | Your emotional journey | **Restless → Grounding** (bold serif italic) | the shift Echo noticed | Look how far you've come |

- Fix from Figma: card 3's counter read "2 OF 5"; counters are now 1 to 6 "OF 6".
- Card 5 avatars use the same initials / photos as the Phase 1 echo sheet, with a 2px white ring and -10px overlap.
- Check contrast on light gradient tops (cards 3, 4 and 5). If white text is weak, add a subtle dark overlay at the top: rgba(0,0,0,0.08).
- Numbers and names read from the store totals (section 2), not hard-coded, so the story stays consistent with the calendar.

---

## 5. Store additions

```ts
type TimelineEntry = {
  id: string;
  date: string;             // "2026-05-15"
  time: string;             // "14:00"
  kind: "song" | "voice" | "echo";
  title: string;            // song title / note title
  artist?: string;          // songs
  art?: string;             // songs
  contributorId?: string;   // echoes
};

selectors:
  entriesByDate(date)       // seed + Phase 1 session saves (on 30 May)
  monthDots(year, month)    // up to 3 kinds per day, in order
  heavyRotations()          // top 3 songs by plays
  wrappedStats()            // mood, activeHour, topSong, songMoments, echoes {total, people, top}
state:
  selectedDate, visibleMonth, wrappedOpen, wrappedIndex
```

- Phase 1 saves (`saveVoiceNote`, `saveSong`, `addEchoesToWeek`) also push a TimelineEntry for 30 May.

---

## 6. Build steps and checks

| Step | Build | Done when |
|---|---|---|
| P2-1 | Timeline tab page shell, header, T2 Insights card (6 dots) | Tab opens the page; matches Figma header and card |
| P2-2 | Seed data (Mar to May) + calendar grid, month nav, dots incl. amber, legend | May dots match the seed table; echoes sparse; today = 30 May; next disabled after May |
| P2-3 | Day selection + day panel + inline play | Tapping 15 May shows Yellow and Breathe (2 AM); empty days show empty copy; panel animates |
| P2-4 | Heavy rotations | 3 tiles with tinted shadow and **44 / 41 / 36** plays (Breathe Deeper, Holocene, Breathe (2 AM)); tap sets the track |
| P2-5 | Live link to Phase 1 | Save a voice note, song or echo on Home → it appears on 30 May with the right dot |
| P2-6 | Wrapped shell: open / close, navigation, progress, transitions | Card opens Wrapped; tap / swipe / arrows / Esc all work |
| P2-7 | Wrapped cards 1 to 6 incl. new echo card | Content matches the table; numbers come from the store |
| P2-8 | Polish | Focus rings, aria-labels, reduced motion, no console errors, 44px targets |

---

## 7. Assumptions to confirm with the team

- Today moves from 10 May to 30 May so the dots don't show future days
- Figma playlist names in the day panel are replaced with the app's real songs and voice notes
- Wrapped grows from 5 to 6 cards, with the new echo card at position 5
- Heavy rotations play counts are varied (**44 / 41 / 36**: Breathe Deeper, Holocene, Breathe (2 AM))
- Wrapped card 3 uses **Breathe Deeper** (Tame Impala), not Holocene
- Wrapped card 6 hero is **Restless → Grounding** in bold serif italic
- Default mini-player track is **Let It Happen** by Tame Impala
- The mini player stays on Home, Timeline and Archive (hidden on Breath and Wrapped)
