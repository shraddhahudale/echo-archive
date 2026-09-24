# Echo Archive: Phase 4 Build Plan (Archive tab)

Phase 4 = the **Archive tab**: one place to find anything Sarah has kept (voice notes, songs, echoes) by **week, feeling, person or search**.

- Visual tokens and components: `design.md` (Archive is section 4.7). Reuse Phase 1 to 3 components, tokens, the store and the album art in `public/img`.
- Colour logic stays: **purple = voice note, pink = song, amber = echo**.
- If this file and `design.md` conflict, this file wins for Phase 4.
- Don't restyle Home, the flows, Timeline, Wrapped or Breath (except the one Home link in section 7).

---

## 1. Information architecture

```
Archive tab
├── A1 Archive home
│   ├── Search field → A6 Search results
│   ├── Filter chips (type + feelings) → filter the current view
│   ├── Recently saved strip → tap to play
│   ├── Segmented control: Weeks | Feelings | People
│   │   ├── Weeks  → trimester groups → A2 Week detail
│   │   ├── Feelings → feeling cards → A3 Feeling results
│   │   └── People → contributor rows → A4 Person detail
│   └── Playlists row → A5 Playlist detail
└── Row ⋯ menu (anywhere): Rename · Edit feelings · Delete
```

- Detail screens push in from the right with a back chevron, and the tab bar stays visible.
- Leaving the tab and coming back returns to A1, keeping the last segment (Weeks, Feelings or People).

---

## 2. One source of truth (consistency with Phases 1 to 3)

Everything reads from the **same store entries** used by the Timeline calendar (seed Mar to May + anything saved this session). No separate archive data.

### Week numbers
- Today = Sat 30 May 2026 = end of **Week 22**.
- `week = 22 - floor((30 May - date) / 7 days)`. So Week 22 = 24 to 30 May, Week 21 = 17 to 23 May, … Week 14 = 29 Mar to 4 Apr.
- Trimester 2 = weeks 14 to 27, Trimester 1 = weeks 1 to 13. The March seed falls in weeks 9 to 13, so T1 shows only weeks that have moments.
- Show only weeks with at least 1 moment.

### Feelings on seed entries
- The Timeline seed has no feelings yet. Give every seed entry 1 to 2 feelings, deterministically (the same on every refresh), from: calm, hopeful, relentless, anxious, connected, missing home, tearful, loved, don't know why.
- Weight them so the story matches Wrapped: **more anxious / relentless in March and April, more calm / hopeful / connected in late May** ("Restless → Grounding").
- Echoes lean loved / connected. Entries saved in Phase 1 flows keep the chips the user picked.

### Echoes
- Contributor data comes from the Phase 1 store (Jake, Seema Aunty, Mom, Grandma, plus anyone invited this session).
- Counts must match the echo sheet (Mom 15, Grandma 12, Seema Aunty 6, Jake 5).

### Songs
- Only songs already in the catalogue: Let It Happen, Breathe Deeper, Holocene, Breathe (2 AM), Yellow, She Will Be Loved, Hotel California, Songs About Jane, Bohemian Rhapsody, Chandaniya. Real art from `public/img`.

---

## 3. Shared row style (used on every Archive list)

Use the `design.md` ListRow: white card, 16px radius, subtle shadow, 72px tall, 12px gap between rows, 20px screen padding.

| Part | Voice note | Song | Echo |
|---|---|---|---|
| Thumbnail 48x48, radius 10 | `--purple-50` tile with a mini waveform (5 bars, `--purple-500`) | album art | contributor avatar (photo or initial on `--amber-50`) with a 14px amber people badge bottom-right |
| Title 15px / 600 | note name | song title | "{Name}: {note title}" |
| Subtitle 13px `#8E8E93` | "2:51 · relentless" | "Coldplay · hopeful" | "0:42 · loved" |

- Right side: play icon (`#3F3A4A`, 22px), then ⋯ (`#8E8E93`).
- Tapping the row or play: a song becomes the current track (mini player store) and the row shows playing bars; voice notes and echoes get an inline playing state (row tinted in its accent 50, animated bars). One at a time.
- **⋯ menu** (small action sheet): Rename (inline input), Edit feelings (a sheet reusing the "Anything to add?" chips in the entry's accent), Delete (confirm: "Delete this moment? This can't be undone." [Delete] [Cancel]).
- Changes update the store everywhere (Timeline dots, counts, Home This week).

---

## 4. Screens

### A1 Archive home

```
Your archive,
Echo Archive                         (serif, "Archive" italic, as Figma)
Your journey from day one
[ 🔍 Search songs, notes, people, feelings ]
[All] [Voice notes] [Songs] [Echoes] | [calm] [hopeful] [anxious] …   (h-scroll)
RECENTLY SAVED   → 72px tiles, newest first (8)
( Weeks | Feelings | People )
…segment content…
Playlists → 4 cards (h-scroll)
```

- Search field: same grey pill as the song flow. Tapping it goes to A6.
- **Filter chips:** one type chip (single-select, default All) + feeling chips (multi-select). The selected type uses its accent colour and feelings use neutral dark. The filter applies to the Weeks list and the feeling / people counts, so empty weeks disappear. Add a "Clear" link when any filter is on.
- **Recently saved:** 72x72 tiles using the thumbnail rules above, with the title under each (12px, 1 line). Tap = play.
- **Segmented control:** 3 segments, `--surface` grey track, white active pill, 36px tall, with a smooth sliding indicator.

**Weeks segment**
- Trimester headers: "Trimester 2 · weeks 14 to 27" (15px / 600) with a chevron. T2 is expanded by default, T1 collapsed. Expanding and collapsing animates height.
- Week row (ListRow style, no thumbnail): title "Week 22" plus a small "This week" tag (`--purple-50`, `--purple-500` text) on the current week; subtitle "24 to 30 May · 13 moments"; right side shows up to 3 dots (6px) for the types present that week, in purple, pink and amber. Tap → A2.
- The old "Active / Done" pills are removed.

**Feelings segment**
- 2-column grid of cards (white, 16px radius, subtle shadow, 88px tall): feeling name 15px / 600, "{n} moments" 13px `#8E8E93`, plus type dots. Sorted by count. Tap → A3.

**People segment**
- ListRow per contributor: 48px round avatar, name, "15 voice notes · 2 new" (amber dot for new) or "Invite sent". Tap → A4.
- Last row: an outline button "Invite someone" that opens the existing echo invite flow (E2) as a sheet.

**Playlists** (smart, built from the store)

| Playlist | Rule |
|---|---|
| Second Trimester | all songs in weeks 14 to 27 |
| First Trimester | all songs in weeks 1 to 13 |
| 3am Sessions | songs saved between 00:00 and 04:00 |
| Bonding with Baby | songs and echoes tagged connected or loved |

- Cards 160x88: art collage (the first 2 album arts overlapping), name, "{n} songs". Tap → A5.

### A2 Week detail
- Back chevron "Archive". Eyebrow "24 to 30 May" 13px `#8E8E93`; title "Week 22" (serif, as Figma).
- Summary card (`--purple-50` if this week, otherwise white): "13 moments · mostly hopeful" (15px / 600), then "6 voice notes · 5 songs · 2 echoes" (13px `#8E8E93`), and on the right a pill button "Play week".
- **Play week** plays every item in order with a simulated inline playing state that moves down the list. Songs update the mini player track too. Tapping again stops it.
- Type chips: All | Voice notes | Songs | Echoes.
- List: all moments of the week, newest first, grouped by day with small day labels ("Sat 30 May").
- Link at the bottom: "See this week on the Timeline →" switches to the Timeline tab with that week's first day selected.

### A3 Feeling results
- Back chevron, title "Hopeful" (serif italic like Wrapped heroes, but on a light background), subtitle "24 moments".
- Type chips, then a list grouped by week ("Week 22", "Week 21"…).

### A4 Person detail
- Back chevron, 64px avatar, name 22px / 600, "Mom · 15 voice notes · since week 9".
- List of their voice notes. Archived ones show a small "In archive" tag, and the others show an amber outline button "Add". Tapping Add runs the existing E6 → E7 flow as a sheet for that single note.
- An invited person gets the same empty state as E5 ("{Name} hasn't left a voice note yet." + Send a reminder).

### A5 Playlist detail
- Back chevron, the collage art 120px, name (serif), "{n} songs · {total length}", pill "Play all" (sets the mini player queue).
- Song list using ListRow.

### A6 Search results
- The search field is focused at the top, with a Cancel text button.
- Searches: title, artist, contributor name, feeling, note text. Case-insensitive, live as you type (debounced 150ms).
- Results grouped: "Voice notes", "Songs", "Echoes", "People", each showing up to 5 with "See all ({n})". Matched text highlighted with `--purple-50` behind it.
- Before typing: "Try "Mom", "hopeful" or "Holocene"" as three tappable suggestion chips.
- No results: "Nothing matches "{query}". Try a song, a person or a feeling."

---

## 5. Motion
- Push / pop between A1 and the details: slide 24px + fade, 250ms ease-out. The back swipe gesture is optional.
- Segment change: content cross-fades (150ms), and the indicator slides.
- Filter changes: rows fade out and in, and the list height animates (no jumps).
- Reduced motion: fades only.

---

## 6. Accessibility
- 44px targets. Visible focus rings in the relevant accent colour.
- Segmented control uses `role="tablist"`. Chips use `aria-pressed`.
- ⋯ buttons have the aria-label "More options for {title}".
- The search results count is announced with `aria-live="polite"`.

---

## 7. Link from Home
- The Home "Browse by feeling" tiles now open Archive → A3 for: Calm nights → calm, Tender → connected + loved (combined), Bright days → hopeful.
- This is the only Home change in Phase 4.

---

## 8. Build steps and checks

| Step | Build | Done when |
|---|---|---|
| P4-1 | Store: week numbers, feelings on seed entries, selectors (byWeek, byFeeling, byPerson, playlists, search) | Week 22 = 24 to 30 May; counts match Timeline and echo sheet; feelings trend anxious → calm |
| P4-2 | A1 shell: header, search pill, filter chips, Recently saved, segmented control, Weeks view with trimester groups | Weeks show dates, counts, dots and a "This week" tag; filters hide empty weeks |
| P4-3 | Feelings and People views + Playlists row | Counts are correct; Invite someone opens the invite flow |
| P4-4 | A2 Week detail, A3 Feeling results, A4 Person detail, A5 Playlist detail with the shared row + ⋯ menu | Rename, edit feelings and delete update everywhere; Play week steps through the list |
| P4-5 | A6 Search | "Mom", "hopeful" and "Holocene" all return the right grouped results with highlights |
| P4-6 | Home feeling tiles link, motion, a11y, polish | Tiles open the right feeling; no console errors |

---

## 9. Assumptions to confirm with the team
- Old Figma "Active / Done" pills replaced by dates and moment counts
- Week detail now shows songs and echoes too, not only voice notes
- Random flower thumbnails replaced by type-based thumbnails
- Playlists are smart (rule-based), with the same four names as Figma
- Feelings on seed data are generated to match the Wrapped story
