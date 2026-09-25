# Echo Archive

A clickable high-fidelity mobile prototype of **Echo Archive**, a pregnancy companion app for capturing songs, voice notes and echoes week by week, then reflecting on them (Timeline, T2 Wrapped, Archive, Breath).

Built with Vite, React, TypeScript, Tailwind CSS, Framer Motion and lucide-react. All data is mock — no backend.

## Run

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build   # typecheck + production build
npm run preview # serve the build
```

## Folder structure

```
src/
  app/App.tsx              # Shell: phone frame, tabs, mini player, sheets
  components/              # Shared UI (Orb, MiniPlayer, MomentRow, TabBar…)
  screens/                 # Home, Timeline, Archive, Wrapped, Breath/
  sheets/                  # Record / voice / song / echo bottom sheets
  data/                    # mock.ts, timeline seed, helpers, playback types
  store/useArchiveStore.ts # Zustand store (entries, playback, navigation)
  styles/tokens.css        # Design tokens
public/img/                # Album art and avatars
```

Design tokens and screen copy live in `design.md`. Phase plans (`plan.md`, `plan-phase2.md` …) describe flows; when they conflict with `design.md`, the phase file wins for that phase.

## Prototype data decisions

These override older Figma placeholders so Home, Timeline, Wrapped and Archive stay consistent:

| Decision | Value |
|---|---|
| Default mini-player track | **Let It Happen** — Tame Impala |
| Wrapped card 3 top song | **Breathe Deeper** — Tame Impala |
| Heavy rotations | **Breathe Deeper 44**, Holocene 41, Breathe (2 AM) 36 |
| Wrapped card 6 hero | **Restless → Grounding** (bold serif italic) |
