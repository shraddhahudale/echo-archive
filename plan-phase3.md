# Echo Archive: Phase 3 Build Plan (Breath / Relief Mode)

Phase 3 = the **Breath tab**: a dark, calm "Relief mode" where Sarah picks a breathing pattern, counts in 3-2-1, and breathes along with a glowing blob that **grows and brightens as she inhales, pauses while she holds, and shrinks and dims as she exhales**, in real time.

- Visual tokens and components: `design.md` section 4.8 (Breath). Reuse the Phase 1 and 2 tokens, fonts (serif italic for the big words), PhoneFrame and button styles.
- If this file and `design.md` conflict, this file wins for Phase 3.
- Don't restyle Home, the flows, Timeline or Wrapped.

**Naming:** keep the tab as **"Breath"**. Tabs are nouns (Home, Timeline, Archive, Breath). "Breathe" is the action, so it's used in instructions ("Breathe in through your nose").

---

## 1. Information architecture

```
Breath tab
└── B1 Choose your breathing (RELIEF MODE)
    ├── 4-7-8 Breathing · For calming anxiety
    ├── Box Breathing · For grounding
    ├── Belly Breathing · For connecting with your baby
    │   └── B2 Countdown 3 → 2 → 1   [Cancel → B1]
    │       └── B3 Session loop: inhale → hold → exhale → hold …
    │           ├── Tap the screen → B3p Paused   [Resume / End Session]
    │           ├── End Session → B1 (soft 400ms fade; blob eases to rest)
    │           └── After all cycles → B1 (soft 400ms fade; blob eases to rest)
    └── Back to home → Home tab
```

- Breath is **immersive**: the tab bar is hidden on every Breath screen. "Back to home" and "End Session" are the ways out, as in Figma.
- The status bar turns white on the dark background.

---

## 2. Visual base (all Breath screens)

- Background `#1A1A1A`, with a soft vignette (radial-gradient, darker at the edges).
- **The blob:** a tall vertical capsule of blurred purple light, centred horizontally and vertically in the phone screen (`position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) …`; `transform-origin: center`). Scale changes grow from the centre.
  - Rest size 240 x 440, `border-radius: 999px`, fill `radial-gradient(ellipse at center, #8A62B8 0%, #7B579D 45%, rgba(123,87,157,0) 75%)`, `filter: blur(40px)`.
  - A second inner layer (160 x 320, `#9C77CC`, blur 30px) adds a brighter core that responds more strongly to the breath.
- Eyebrow: 10px, uppercase, letter-spacing 0.2em, white 50%, e.g. "RELIEF MODE · BOX BREATHING".
- Big word: serif italic, 44px, white.
- Instruction: 14px, white 55%.
- Progress bar: 120 x 2px, track white 20%, fill white 90%, rounded.
- Count: "4 COUNTS" 10px uppercase, letter-spacing 0.2em, white 45%.
- Bottom buttons: white text 13px, 1px white 20% border, `rgba(255,255,255,0.06)` fill, **12px** radius, **44px** tall, 48px from the bottom.

---

## 3. Screens

### B1 Choose your breathing
- Eyebrow "RELIEF MODE", title *Choose your breathing* (serif italic 28px).
- Blob at rest behind the options, breathing very slowly on its own (a 10s idle cycle, small range) so the screen feels alive.
- Three stacked option cards (`rgba(255,255,255,0.18)`, **260 × 60**, **16px** radius, 12px gap): name 13px white, sub 11px white 60%.
- Tap: the card brightens to white 28% and scales 0.97, the other cards fade out, and it goes to B2.
- Bottom: [Back to home].

### B2 Countdown
- Eyebrow "RELIEF MODE · STARTING".
- Serif italic numeral 3 → 2 → 1, one per second. Each number fades in with a scale from 1.1 to 1 and fades out.
- The blob swells slightly on each number (a small bump) and settles at the "empty lungs" size by the end of 1, so the first inhale starts from the smallest state.
- Bottom: [Cancel] → B1.

### B3 Session
- Eyebrow "RELIEF MODE · {PATTERN NAME}".
- Big word: *inhale* / *hold* / *exhale*, which cross-fades (250ms) at each phase change.
- Instruction per phase (this fixes the Figma bug where exhale said "Breathe in"):

| Phase | Box / 4-7-8 | Belly |
|---|---|---|
| inhale | Breathe in through your nose | Breathe into your belly |
| hold | Hold gently | (no hold) |
| exhale | Breathe out through your mouth | Let your belly fall slowly |

- Progress bar (matches Figma): **inhale and exhale fill** left to right; **hold drains** right to left.
- Count: "4 COUNTS" → "3 COUNTS" → "2 COUNTS" → "1 COUNT", changing every second.
- Bottom: [End Session] → B1 (soft 400ms fade; blob eases back to rest).
- After all cycles → B1 the same way.

### B3p Paused (tap anywhere on the blob area)
- The blob freezes where it is and dims to 60%.
- The big word becomes *paused*, and the instruction becomes "Tap to resume".
- The progress bar and count freeze.
- Tapping again resumes the exact same phase and progress, with no jump.

---

## 4. Breathing patterns (seconds)

| Pattern | Inhale | Hold | Exhale | Hold | Cycles |
|---|---|---|---|---|---|
| 4-7-8 Breathing | 4 | 7 | 8 | none | 4 |
| Box Breathing | 4 | 4 | 4 | 4 | 4 |
| Belly Breathing | 4 | none | 6 | none | 5 |

---

## 5. The breath engine (the core interaction)

One value drives everything: **`breath`**, from 0 (empty lungs) to 1 (full lungs).

| Phase | `breath` over the phase |
|---|---|
| inhale | 0 → 1, `easeInOutSine` |
| hold (after inhale) | stays 1 |
| exhale | 1 → 0, `easeInOutSine` |
| hold (after exhale) | stays 0 |

- **Real time:** compute from a session clock with `requestAnimationFrame` and `performance.now()`, not CSS keyframes. That keeps the blob, progress bar, counts and word perfectly in sync, and makes pause / resume exact.
- **Hook:** `useBreathingCycle(pattern)` returns `{ phase, phaseProgress (0–1), countLeft, breath (0–1), cycle, elapsed, paused, pause(), resume(), end() }`.

### How `breath` maps to the blob

| Property | breath = 0 (empty) | breath = 1 (full) |
|---|---|---|
| Outer blob scale X | 0.78 | 1.18 |
| Outer blob scale Y | 0.88 | 1.10 |
| Outer blob opacity | 0.45 | 1.0 |
| Outer blob blur | 48px | 36px (edge gets a little crisper when full) |
| Inner core scale | 0.6 | 1.15 |
| Inner core opacity | 0.25 | 0.9 |
| Core colour | `#7B579D` | `#A983DA` (lighter, warmer glow) |
| Vignette | darker | lifts slightly (edges 10% lighter) |

- **Holds feel paused, not dead:** during a hold, add a tiny shimmer only: core opacity ±4% over 2s, with no size change. Everything else is still.
- **Phase changes:** a very subtle ripple, a soft ring that expands from the blob edge and fades over 600ms at the start of each inhale and exhale. It's a cue to switch without reading.
- The big word and instruction also rise 4px on inhale and settle on exhale (optional, subtle).

---

## 6. Small touches

- **Haptics:** `navigator.vibrate(15)` at each phase change, inside a try/catch. It works on Android and does nothing elsewhere.
- **Keep the screen awake:** use the Screen Wake Lock API during B2 and B3 (try/catch), and release it on return to B1 or exit.
- **Keyboard:** Space = pause / resume, Esc = End Session.
- **Accessibility:** the phase word and count are announced with `aria-live="polite"` (phase only, not every second). All buttons have aria-labels.
- **Reduced motion:** no scale changes. The blob only changes opacity (0.5 ↔ 0.9) over each phase, no ripple, and words cross-fade.
- **Tab switching:** leaving the Breath tab mid-session ends the session quietly. Coming back shows B1.

**Optional (only if there's time):** a line under the eyebrow, "Your Companion Stone is breathing with you", fades in once the session starts, to tie the physical Companion Stone to the experience.

---

## 7. Build steps and checks

| Step | Build | Done when |
|---|---|---|
| P3-1 | Breath shell: dark theme, white status bar, hidden tab bar, B1 Choose with idle blob, Back to home | Breath tab opens the dark Choose screen; Back to home returns to Home with the tab bar back |
| P3-2 | B2 Countdown with blob bumps, Cancel | 3-2-1 each 1s; Cancel returns to B1; the blob ends at the smallest size |
| P3-3 | `useBreathingCycle` + B3 session UI (word, instruction, progress fill / drain, counts) for all 3 patterns | Timings match section 4; hold drains, inhale / exhale fill; copy matches the table |
| P3-4 | Blob driven by `breath` in real time + hold shimmer + phase ripple + tap to pause | Blob grows and brightens on inhale, stays still on hold, shrinks and dims on exhale; pause / resume is exact |
| P3-5 | End Session / full cycles → B1 with fade, haptics, wake lock, keyboard, reduced motion, a11y | Ending a session returns to Choose with a soft fade and resting blob; no console errors |

---

## 8. Assumptions to confirm with the team

- Tab name stays "Breath"
- The tab bar is hidden in Breath mode (immersive), matching the Figma frames
- Belly breathing timing (4 in, 6 out, no holds) is suggested
- Sessions end after 4 cycles (5 for Belly), then return to Choose (no Complete screen)
- The exhale instruction is corrected from the Figma
- Option cards and bottom buttons use rounded rectangles (16px / 12px), not full pills
