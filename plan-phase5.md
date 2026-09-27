# Echo Archive: Phase 5 Build Plan (Onboarding walkthrough)

A short first-time walkthrough before Home, **styled like T2 Wrapped**: full-screen gradient story cards, glass card for the words, dots at the bottom, tap or swipe to move on. It explains the app through **the orb**: what it is, that you tap it, and the three ways to keep a moment. It ends by connecting the Companion Stone, then Home opens with **the orb glowing to guide the first tap**.

- Tokens and components: `design.md`. Reuse the **Wrapped shell** / shared StoryShell (gradient background, glass card, eyebrow, dots, swipe), the **Orb**, Display type, PillButton, chips and the purple / pink / amber colour logic.
- Don't change Home, Timeline, Archive, Breath or Wrapped, except the hooks in section 6.
- If this file and `design.md` conflict, this file wins for Phase 5.

---

## 1. Flow

```
App opens
└── O0 Splash: "Echo Archive" + concept note (tap / swipe to begin; no auto-advance)
    └── O1 Meet the orb        (tap the orb to continue; orb fades + scales in)
        └── O2 Keep a moment
            └── O3 Look back, week by week
                └── O4 Your Companion Stone
                    └── Home: the orb glows and pulses + "Tap the orb to keep your first moment"
```

---

## 2. Wrapped-style shell (same look as T2 Wrapped)

- **Full screen** over the phone frame. The tab bar and mini player are hidden.
- **Gradient background per screen** (135deg), cross-fading between screens like Wrapped.
- **Eyebrow** at the top of the screen (same position / style as Wrapped's "ECHO T2 INSIGHTS"): THIS IS YOUR ORB, etc. — not inside the glass card.
- **Glass cards on one line:** every slide's glass card has its **top edge at 58%** of the screen height, the same width (`max-w-[320px]`, `px-6` / 24px padding, `py-8`, 24px radius, white 15% + blur), and the same **min-height** (~280px). Content inside is vertically centred.
- **Neighbour peek:** while swiping, only the **glass card edges** peek. Orb / icons / Stone sit in a fixed layer outside the track and never move with the slides.
- **Visual zone** between the eyebrow and the card (centred, ≥20px above the card): orb (O1–O3), O2 icons, O4 Stone, plus the O1 hint when on O1.
- **Titles:** fit-to-width — start at Display **26px**, step down to a minimum of **22px** to stay on one line inside the card; if still too long, allow a clean centred 2-line wrap. Never clip or overflow the card. **Body** Inter 15px, white 90%, centred.
- **Dots at the bottom only** (no footer text, no circular next button): **4 dots** (O1–O4), centred, 32px from the bottom (`bottom-8`); the active dot is a 20px white pill, the others 5px white 50%. Splash is not counted.
- **Navigation, same as Wrapped** (shared StoryShell pager): tap right half = next, left half = back, swipe, arrow keys. No chevron / circular next.
  - Exception: on **O1** advance by tapping the orb. Right-half / swipe forward locked for 4s (nudge on right-half). After 4s hint becomes **Tap the orb, or swipe to continue** and unlocks.
  - Exception: on **O4** half-taps don't navigate; use **Connect** / **I'll do this later** (swipe right still goes back).
- **Top right:** **Skip** where Wrapped's ✕ sits (white 85%, 13px, 12px padding) on O1–O3. Jumps to O4. No ✕ close.
- The same subtle top contrast gradient as Wrapped.
- **Status bar:** empty safe-area spacer only (no time / signal / wifi / battery), same as the rest of the app.

### Gradients

| Screen | From | To |
|---|---|---|
| O0 Splash | `#A385F7` | `#6D2BDB` |
| O1 Meet the orb | `#A385F7` | `#5A1FC4` |
| O2 Keep a moment | `#E7A6D6` | `#8B2BCB` |
| O3 Look back | `#F6C99A` | `#C0508F` |
| O4 Companion Stone | `#F06AB4` | `#8B2BCB` (Wrapped Restless → Grounding) |

---

## 3. The orb is the thread

- Light-variant orb on O1–O3 (breathing, soft lilac core). O4 uses the Stone.
- Orb sizes (fit between eyebrow and fixed card):

| Screen | Orb / visual |
|---|---|
| O0 | none (name + concept note) |
| O1 | 148px (fades + scales in from splash) |
| O2 | 112px + icon row |
| O3 | 110px |
| O4 | Companion Stone (~100px) |

---

## 4. Screens and copy

### O0 Splash (app name + concept note)
- Purple gradient (135deg, `#A385F7` → `#6D2BDB`); no orb, glass, dots, or Skip.
- Initially centred: ***Echo Archive*** (Display bold italic, 40px, solid white).
- 8px under: **a sound diary for pregnancy** (Inter 14px, white 80%).
- Name fades up (y 12 → 0, 500ms), tagline 200ms later.
- After **1.2s**: name + tagline ease up to about **30%** of the screen height (500ms). A **concept note** slides up from the bottom (y 40 → 0, fade in, 600ms), centred, max-width 300px, Inter 16px, line-height 1.6, white 90%:

  > Pregnancy is a time in between. Echo Archive is a sound diary for those weeks: the songs you play, the thoughts you say out loud, and the voices of the people who love you. Kept week by week, so you can listen back to how you became a mother.

- **1s after the note appears:** **Tap to begin** fades in near the bottom (Inter 12px, white 70%).
- **No auto-advance.** Tap or swipe → O1 Meet the orb.
- Not counted in the dots.

### O1 Meet the orb
- Eyebrow: **THIS IS YOUR ORB**
- Title: ***It breathes with you***
- Body: **Whenever something feels worth keeping, a song, a thought, a voice, just tap the orb.**
- Hint under orb: **Tap the orb** (+ hand icon, pulsing ring). After 4s: **Tap the orb, or swipe to continue**.
- Tap orb → O2. Right-half / swipe locked until 4s (right-half nudges).
- Orb fades and scales in on arrival from splash.

### O2 Keep a moment
- Eyebrow: **TAP THE ORB TO…**
- Title: ***Keep a moment***
- Icon row under the orb + three labelled rows in the glass card (Voice note / Song / Echo). Tap to highlight.

### O3 Look back, week by week
- Eyebrow: **IT ALL ADDS UP**
- Title: ***Look back, week by week*** (one line; fit-to-width 26→22px)
- Body: **See your weeks fill up, get your trimester wrapped, and breathe along with the glow whenever you need a moment.**
- Visual: shared light orb, **110px**, centred (same as other orb screens). No preview rows.

### O4 Your Companion Stone
- Eyebrow: **ONE LAST THING**
- Title: ***Your Companion Stone***
- Body: **Hold it when you want to breathe or record. It glows along with your orb.**
- Stone in the visual zone. [Connect] → Connecting… → Connected. You're all set. → Home. Or **I'll do this later**.

---

## 5. Arriving on Home: the orb guides the first tap

The transition from O4 to Home: the gradient fades to the Home background (400ms) while the Home UI fades in.

As soon as Home is visible, **the orb glows to invite the first tap**:
- The halo glow brightens (opacity 0.7 → 1) and grows (scale 1 → 1.15), then settles slightly, repeating slowly (2.4s cycle) on top of the normal breathing.
- A soft purple ring ripples out from the orb every 1.6s (1.5px `--purple-300`, expands to 1.4x and fades).
- After 600ms, a small tooltip bubble appears above the orb (white card, 12px radius, subtle shadow, arrow pointing down): **Tap the orb to keep your first moment**
- Both stop as soon as the orb is tapped (the record sheet opens as normal) or when the user taps anywhere else.
- This only happens once, on the first arrival from onboarding.
- Reduced motion: no ripple or scaling; the glow just brightens a little and the tooltip shows.

---

## 6. Hooks into the rest of the app

1. **Every load (prototype / demo mode):** onboarding state lives in memory only — no localStorage. Every page load / refresh shows the walkthrough (O0 → … → O4 → Home). Within a session, once finished or skipped, switching tabs or returning to Home does not show it again.
2. **Stone:** if O4 connected the Stone, Home skips its 2s "not connected" intro for that session.
3. **Replay for demos:** tapping the avatar on Home opens a small menu with **Replay walkthrough**. The URL `?onboarding=1` is optional (onboarding already shows on every load).
4. The tab bar and mini player are hidden during onboarding.

---

## 7. Motion

- **Orb / icons / Stone never move with the slides.** They live in a fixed layer outside the pager track — no `layoutId`, no x-transform, no layout animation. Only opacity cross-fades between slides (and the orb’s own breathing / tap pulse). The glass cards alone follow the drag.
- Slide spring (onboarding): damping **34**, stiffness **150**, mass **1** (slower, no bounce). Wrapped keeps its own spring.
- Background gradients cross-fade over **700ms** ease-in-out (settled slide index — not drag-linked).
- Text: gentle fade + **8px** rise, **450ms**, **80ms** stagger (eyebrow → title → body). Plays once when a slide becomes active, not while dragging.
- Orb breathing: **4s**, scale max **1.025**. Tap = soft in-place pulse, then advance.
- Dots: width + opacity transition **400ms**.
- Swipe threshold: **25%** of card width or a flick; otherwise ease back to centre. Drag over **8px** cancels tap.
- Active glass: `backdrop-blur`. Peeking neighbour cards: flat fill at **40%** opacity, **no** blur (avoids the left-edge stripe). Side peek from the second screen onward.
- Reduced motion: cross-fades only (**150ms**), no slide track.

---

## 8. Accessibility

- 44px targets; Skip is keyboard reachable.
- The orb on O1 is a button labelled "Tap the orb to continue".
- Each screen's title is announced (`aria-live="polite"`).
- The O2 icons all have labels; colour isn't the only cue.

---

## 9. Build steps

| Step | Build | Done when |
|---|---|---|
| P5-1 | O0 splash (name → concept note → tap to begin) + onboarding shell; 4 story slides; Skip | Splash never auto-advances; tap/swipe → Meet the orb; Skip → Companion Stone |
| P5-2 | Light-variant orb on O1–O3; tap-to-continue on O1; O2 icons; O3 110px orb + body | The orb / visuals feel clear; tapping the orb on O1 moves on |
| P5-3 | O4 Stone with the connect animation and "I'll do this later" | Connect → Connected → Home, with the Stone already connected |
| P5-4 | Home arrival: glowing orb + ripple + tooltip; avatar "Replay walkthrough"; `?onboarding=1`; reduced motion; a11y | The orb glows until the first tap; replay works; no console errors |
