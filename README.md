# Echo Archive

**A sound diary for pregnancy.** Echo Archive helps expecting mothers keep the songs, voice notes and messages from loved ones that shape each week of pregnancy, tagged by how they felt, and revisit them later as a timeline, a trimester "Wrapped" story and a searchable archive. It pairs with a physical **Companion Stone** that connects to the app.

**Team MUMs Buns:** Shraddha Hudale · Emelina Chow · An Ny Lam · Khushi Arya
**OzCHI 2026 Student Design Challenge**

**Live prototype:** [echo-archive-jet.vercel.app](https://echo-archive-jet.vercel.app/)

---

## What's in the prototype

A clickable, high-fidelity mobile prototype with mock data (no backend). The story follows **Sarah, week 22, second trimester**.

### Home
- Greeting, current week and trimester
- **Companion Stone** connection pill (connects a couple of seconds after the app opens)
- The **orb** ("How are you feeling today?") breathes gently; tap it to record a moment:
  - **Add a voice note**: record, rename, tag feelings, save to the week
  - **Archive a song**: search or pick a recent song, tag feelings, save
  - **Add an echo**: invite a loved one, or add voice notes they've sent (Mom, Grandma, Aunt Sophie, Jake)
- **Browse by feeling**: Calm nights, Tender and Bright days open mood playlists with song suggestions
- **Recently played** and a **This week** row of saved moments

### Timeline
- Calendar of the trimester with dots for each moment: **pink = song, purple = voice note, amber = echo**
- Tap a day to see and play what was saved
- **Heavy rotations**: most-played songs
- **T2 Wrapped**: a swipeable six-card story of the trimester (mood, most active hour, top song, songs saved, echoes from loved ones, emotional shift)

### Archive
- Search across songs, voice notes, people and feelings
- Filter by type and feeling
- Browse by **Weeks**, **Feelings** or **People**
- Week, feeling, person and playlist detail screens, with rename, edit feelings and delete on any moment
- Smart playlists: Second Trimester, First Trimester, 3am Sessions, Bonding with Baby

### Breath (Relief mode)
- Choose 4-7-8, Box or Belly breathing
- A 3-2-1 countdown, then a glowing blob that **grows and brightens as you inhale, rests on hold and softens as you exhale**, in real time
- Tap to pause or resume

### Everywhere
- A persistent **mini player** (hidden in Breath and Wrapped) plays songs, voice notes and echoes, with a live progress line

---

## Try it: a 2-minute demo path

1. Open the app and watch the Companion Stone connect.
2. Tap the orb, then **Add a voice note**. Record, rename, pick a feeling and save.
3. Tap the orb, then **Add an echo**, then **Mom**. Select two notes and save.
4. Tap **Calm nights** and play a song.
5. Go to **Timeline**, tap today (30 May), then open **See your T2 Wrapped**.
6. Go to **Archive** and search "Mom" or "hopeful".
7. Go to **Breath**, choose **Box Breathing** and follow the blob.

---

## Design system

| | |
|---|---|
| **Colour logic** | Purple = voice note, pink = song, amber = echo |
| **Type** | Inter for UI; a serif italic display face for names, page titles, Breath words and Wrapped heroes (bold everywhere, regular in Breath) |
| **Shapes** | Cards and tiles are rounded rectangles (16 to 20px); action buttons are full pills; chips are pills |
| **Spacing** | 20px screen padding, 72px list rows |
| **Motion** | Soft spring bottom sheets, breathing orb, real-time breath blob; everything respects reduced-motion settings |

Full tokens, components and screen specs are in [`design.md`](design.md).

---

## Tech stack

Vite · React · TypeScript · Tailwind CSS · Framer Motion · Zustand · lucide-react

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build    # typecheck + production build
npm run preview  # serve the build
```

## Folder structure

```
src/
  app/App.tsx               # Shell: phone frame, tabs, mini player, sheets
  components/               # Shared UI (Orb, MiniPlayer, MomentRow, PageHeader, Display, TabBar…)
  screens/                  # Home, Timeline, Archive, Wrapped, MoodPlaylist, Breath/
  sheets/                   # Record choice, voice note, song and echo bottom sheets
  data/                     # Mock catalogue, timeline seed, mood playlists, helpers
  store/useArchiveStore.ts  # Zustand store (entries, playback, navigation)
  styles/tokens.css         # Design tokens
public/img/                 # Album art and avatars
```

## Project docs

| File | What it covers |
|---|---|
| [`design.md`](design.md) | Design tokens, components and screen specs |
| [`plan.md`](plan.md) | Phase 1: Home and the record flows (voice note, song, echo) |
| [`plan-phase2.md`](plan-phase2.md) | Phase 2: Timeline and T2 Wrapped |
| [`plan-phase3.md`](plan-phase3.md) | Phase 3: Breath / Relief mode |
| [`plan-phase4.md`](plan-phase4.md) | Phase 4: Archive |

When a phase plan and `design.md` disagree, the phase plan wins for that phase.

## Prototype data decisions

These override older Figma placeholders so Home, Timeline, Wrapped and Archive stay consistent:

| Decision | Value |
|---|---|
| Today in the prototype | Saturday 30 May 2026, week 22 |
| Default mini player track | **Let It Happen**, Tame Impala |
| Wrapped card 3 top song | **Breathe Deeper**, Tame Impala |
| Heavy rotations | **Breathe Deeper 44**, Holocene 41, Breathe (2 AM) 36 |
| Wrapped card 6 hero | **Restless → Grounding** |
| Echo contributors | Mom 15, Grandma 12, Aunt Sophie 6, Jake 5 (38 echoes) |

---

## Notes

- All people, voice notes and echoes are fictional sample data.
- Album artwork is used for prototype and presentation purposes only; all rights belong to the respective artists and labels.
