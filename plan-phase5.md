# Echo Archive: Phase 5 Build Plan (Onboarding walkthrough)

A short first-time walkthrough before Home, **styled like T2 Wrapped**: full-screen gradient story cards, glass card for the words, dots at the bottom, tap or swipe to move on. It explains the app through **the orb**: what it is, that you tap it, and the three ways to keep a moment. It ends by connecting the Companion Stone, then Home opens with **the orb glowing to guide the first tap**.

- Tokens and components: `design.md`. Reuse the **Wrapped shell** (gradient background, glass card, eyebrow, dots, swipe), the **Orb**, Display type, PillButton, chips and the purple / pink / amber colour logic.
- Don't change Home, Timeline, Archive, Breath or Wrapped, except the hooks in section 6.
- If this file and `design.md` conflict, this file wins for Phase 5.

---

## 1. Flow

```
App opens (first time)
└── O0 Splash: "Echo Archive" (auto-advances after 2.4s, or tap)
    └── O1 Welcome
        └── O2 Meet the orb        (tap the orb to continue)
            └── O3 Keep a moment
                └── O4 How are you feeling?
                    └── O5 Look back, week by week
                        └── O6 Meet your Companion Stone
                            └── Home: the orb glows and pulses + "Tap the orb to keep your first moment"
```

---

## 2. Wrapped-style shell (same look as T2 Wrapped)

- **Full screen** over the phone frame. The tab bar and mini player are hidden.
- **Gradient background per screen** (135deg), cross-fading between screens like Wrapped.
- **Eyebrow** at the top: the shared Eyebrow style (Inter 10px, uppercase, letter-spacing 0.2em, white 70%).
- **Glass card** for the text: white 15%, `backdrop-filter: blur(12px)`, 24px radius, 1px white 20% border, 20px padding, centred horizontally, in the lower half of the screen.
- **Titles** in the Display style (serif italic bold, 30px, white). **Body** Inter 15px, white 85%, centred, max 3 lines.
- **Dots at the bottom only** (no footer text, same as Wrapped): 6 dots, 32px from the bottom; the active dot is a 20px white pill, the others 5px white 50%. The active dot slides smoothly.
- **Navigation, same as Wrapped:** tap the right half = next, left half = back, swipe left / right with the same spring, arrow keys.
  - Exception: on **O2** the user moves on by **tapping the orb** (see O2).
- **Top right:** a small **Skip** text button (white 80%, 13px) on O1 to O5. It jumps to O6 (the Stone always shows). There's no ✕ close.
- The same subtle top contrast gradient as Wrapped (rgba(0,0,0,0.10) fading out by 40%, no hard edge).

### Gradients

| Screen | From | To |
|---|---|---|
| O0 Splash | `#3B2470` | `#1E1238` |
| O1 Welcome | `#B79BFA` | `#6D2BDB` |
| O2 Meet the orb | `#A385F7` | `#5A1FC4` |
| O3 Keep a moment | `#E7A6D6` | `#8B2BCB` |
| O4 How are you feeling? | `#9FB8F7` | `#6D2BDB` |
| O5 Look back | `#F6C99A` | `#C0508F` |
| O6 Companion Stone | `#5B4A8C` | `#241B3D` (dusk, so the Stone's glow stands out) |

---

## 3. The orb is the thread

- **One orb stays on screen through O1 to O5.** It moves and resizes between screens (Framer Motion `layoutId="orb"`) instead of cutting.
- On the gradients it uses a **light variant**: rings in white at 35% and 55%, a core of `#FFFFFF` → `#E9DDFF`, 2px white borders, and a soft white glow behind it. That way it reads clearly on purple.
- It keeps its breathing pulse (3s cycle) on every screen.
- It sits in the **upper half**, above the glass card.

| Screen | Orb size |
|---|---|
| O0 | 96px, centred above the name |
| O1 | 180px |
| O2 | 220px |
| O3 | 140px, with 3 icons around it |
| O4 | 110px |
| O5 | 80px |
| O6 | fades out; the Stone takes its place |

---

## 4. Screens and copy

### O0 Splash (app name)
- A deep purple gradient screen with **no** glass card, no dots, no Skip. It's just the name.
- The orb fades in first at 96px (light variant, breathing), centred slightly above the middle.
- 400ms later, the name fades up under it: ***Echo Archive*** (Display, serif italic bold, 40px, white).
- Under the name: **a sound diary for pregnancy** (Inter 14px, white 70%, letter-spacing 0.02em).
- After 2.4s (or on tap anywhere), it moves to O1. The name fades out while the orb grows and moves into its O1 position (same `layoutId`), and the O1 gradient cross-fades in.
- The splash shows every time onboarding runs (first open, Replay walkthrough, `?onboarding=1`). It isn't counted in the dots.
- Reduced motion: the orb and name appear together with a simple fade, then it fades to O1.

### O1 Welcome
- Eyebrow: **WELCOME**
- Title: ***Hi, Sarah***
- Body: **A sound diary for the weeks in between. The songs, voices and feelings that carry you to meeting your baby.**

### O2 Meet the orb
- Eyebrow: **THIS IS YOUR ORB**
- Title: ***It breathes with you***
- Body: **Whenever something feels worth keeping, a song, a thought, a voice, just tap the orb.**
- Under the orb: **Tap the orb** (13px white) with a small finger-tap icon, and a pulsing white ring around the orb (it expands and fades every 1.6s).
- **Interaction:**
  - Tapping the orb: it squeezes (0.94), a ripple ring expands, then it goes to O3.
  - Tapping the right half here doesn't advance. Instead the orb gives a gentle "look at me" pulse (1 → 1.06 → 1).
  - After 4s without a tap, a small "Next" text link appears under the hint (fallback for accessibility and demos). Swiping left still works too.

### O3 Keep a moment
- Eyebrow: **TAP THE ORB TO…**
- Title: ***Keep a moment***
- The three icons **fan out from the orb** (staggered 120ms, spring) and sit around it, each a 48px circle with a white 2px border and a white icon:

| Icon | Label (14px / 600, white) | Line (13px, white 80%) |
|---|---|---|
| Mic on `--purple-500` | Voice note | Say it out loud. Your voice, today. |
| Music on `--pink-500` | Song | The song holding you this week. |
| People on `--amber-500` | Echo | Voices from the people who love you. |

- The three rows sit inside the glass card, under the title.
- Tapping an icon highlights it (scale 1.08, white glow ring). Just for exploring.

### O4 How are you feeling?
- Eyebrow: **EVERY MOMENT HAS A FEELING**
- Title: ***How are you feeling?***
- Body: **Add a feeling when you save something. Over the weeks, Echo gently notices the patterns.**
- Chips in a glass style (white 18% fill, white text; selected = white fill with `--purple-500` text): calm, hopeful, anxious, connected, tearful, don't know why
- Tapping a chip selects it and the orb gives a small pulse in response.

### O5 Look back, week by week
- Eyebrow: **IT ALL ADDS UP**
- Title: ***Look back, week by week***
- Three small glass preview rows inside the card, fading in one after another:
  - A 7-dot strip (pink / purple / amber): **See your weeks fill up with moments.**
  - A tiny purple gradient chip saying *Anxious → Hopeful*: **Get your trimester, wrapped.**
  - A tiny dark chip with a glowing blob: **Need a moment? Breathe along with the glow.**

### O6 Meet your Companion Stone
- The orb fades out and a **Stone** appears in the upper half: a smooth pebble shape (rounded blob, `#EDE7F6` → `#CFC4E6`, subtle inner shadow) with a soft purple glow beneath it that breathes slowly.
- Eyebrow: **ONE LAST THING**
- Title: ***Meet your Companion Stone***
- Body: **Hold it when you want to breathe or record. It glows along with your orb.**
- Button inside the glass card: [Connect] (full pill, white fill, `--purple-500` text).
  - On tap: it becomes "Connecting…" with a small spinner, and the Stone's glow pulses faster for 2s.
  - Then a green check appears on the Stone and the text becomes **Connected. You're all set.**
  - After 1s, it transitions to Home.
- Text link under the button: **I'll do this later** (goes to Home with the Stone not connected; Home then plays its existing 2s connect intro).
- Tapping the halves doesn't navigate on O6. Swiping right goes back.

---

## 5. Arriving on Home: the orb guides the first tap

The transition from O6 to Home: the gradient fades to the Home background (400ms) while the Home UI fades in.

As soon as Home is visible, **the orb glows to invite the first tap**:
- The halo glow brightens (opacity 0.7 → 1) and grows (scale 1 → 1.15), then settles slightly, repeating slowly (2.4s cycle) on top of the normal breathing.
- A soft purple ring ripples out from the orb every 1.6s (1.5px `--purple-300`, expands to 1.4x and fades).
- After 600ms, a small tooltip bubble appears above the orb (white card, 12px radius, subtle shadow, arrow pointing down): **Tap the orb to keep your first moment**
- Both stop as soon as the orb is tapped (the record sheet opens as normal) or when the user taps anywhere else.
- This only happens once, on the first arrival from onboarding.
- Reduced motion: no ripple or scaling; the glow just brightens a little and the tooltip shows.

---

## 6. Hooks into the rest of the app

1. **Every load (prototype / demo mode):** onboarding state lives in memory only — no localStorage. Every page load / refresh shows the walkthrough (O0 → … → O6 → Home). Within a session, once finished or skipped, switching tabs or returning to Home does not show it again.
2. **Stone:** if O6 connected the Stone, Home skips its 2s "not connected" intro for that session.
3. **Replay for demos:** tapping Sarah's avatar on Home opens a small menu with **Replay walkthrough**. The URL `?onboarding=1` is optional (onboarding already shows on every load).
4. The tab bar and mini player are hidden during onboarding.

---

## 7. Motion

- Screen changes use the Wrapped slide and spring (drag follows the finger, rubber-band at the ends, snaps with damping 30, stiffness 280). The gradients cross-fade and the dots animate.
- The orb morphs size and position between screens (`layoutId`, spring damping 26, stiffness 220).
- Text on each screen: eyebrow, then title, then body, staggered 60ms after the slide settles.
- Reduced motion: 150ms fades only, no orb travel, no fan-out, no ripples.

---

## 8. Accessibility

- 44px targets; Skip and the O2 "Next" fallback are keyboard reachable.
- The orb on O2 is a button labelled "Tap the orb to continue".
- Each screen's title is announced (`aria-live="polite"`).
- The O3 icons all have labels; colour isn't the only cue.

---

## 9. Build steps

| Step | Build | Done when |
|---|---|---|
| P5-1 | O0 splash + onboarding shell reusing the Wrapped look: gradients, glass card, eyebrow, dots, tap / swipe, Skip, first-run check | A fresh load shows the Echo Archive splash, then O1 in the Wrapped style; Skip goes to O6; the second load goes straight to Home |
| P5-2 | Shared light-variant orb (`layoutId`) across O1 to O5; tap-to-continue on O2; fan-out on O3; chip pulses on O4; O5 previews | The orb feels like one object; tapping it on O2 moves on |
| P5-3 | O6 Stone with the connect animation and "I'll do this later" | Connect → Connected → Home, with the Stone already connected |
| P5-4 | Home arrival: glowing orb + ripple + tooltip; avatar "Replay walkthrough"; `?onboarding=1`; reduced motion; a11y | The orb glows until the first tap; replay works; no console errors |
