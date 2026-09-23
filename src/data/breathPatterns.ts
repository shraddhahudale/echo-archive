export type BreathPhase = "inhale" | "hold" | "exhale";

export type BreathingPattern = {
  id: string;
  name: string;
  eyebrowName: string;
  subtitle: string;
  inhale: number;
  hold: number;
  exhale: number;
  rest: number;
  cycles: number;
};

export const breathPatterns: BreathingPattern[] = [
  {
    id: "4-7-8",
    name: "4-7-8 Breathing",
    eyebrowName: "4-7-8 BREATHING",
    subtitle: "For calming anxiety",
    inhale: 4,
    hold: 7,
    exhale: 8,
    rest: 0,
    cycles: 4,
  },
  {
    id: "box",
    name: "Box Breathing",
    eyebrowName: "BOX BREATHING",
    subtitle: "For grounding",
    inhale: 4,
    hold: 4,
    exhale: 4,
    rest: 4,
    cycles: 4,
  },
  {
    id: "belly",
    name: "Belly Breathing",
    eyebrowName: "BELLY BREATHING",
    subtitle: "For connecting with your baby",
    inhale: 4,
    hold: 0,
    exhale: 6,
    rest: 0,
    cycles: 5,
  },
];

export function instructionFor(pattern: BreathingPattern, phase: BreathPhase): string {
  const belly = pattern.id === "belly";
  if (phase === "inhale") return belly ? "Breathe into your belly" : "Breathe in through your nose";
  if (phase === "hold") return "Hold gently";
  return belly ? "Let your belly fall slowly" : "Breathe out through your mouth";
}

export type BreathSegment = {
  phase: BreathPhase;
  duration: number;
  breathFrom: number;
  breathTo: number;
  cycle: number;
};

export function buildBreathTimeline(pattern: BreathingPattern): BreathSegment[] {
  const segments: BreathSegment[] = [];
  for (let cycle = 1; cycle <= pattern.cycles; cycle++) {
    segments.push({ phase: "inhale", duration: pattern.inhale, breathFrom: 0, breathTo: 1, cycle });
    if (pattern.hold > 0) {
      segments.push({ phase: "hold", duration: pattern.hold, breathFrom: 1, breathTo: 1, cycle });
    }
    segments.push({ phase: "exhale", duration: pattern.exhale, breathFrom: 1, breathTo: 0, cycle });
    if (pattern.rest > 0) {
      segments.push({ phase: "hold", duration: pattern.rest, breathFrom: 0, breathTo: 0, cycle });
    }
  }
  return segments;
}

export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpColor(from: string, to: string, t: number): string {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const r = Math.round(lerp(a.r, b.r, t));
  const g = Math.round(lerp(a.g, b.g, t));
  const bl = Math.round(lerp(a.b, b.b, t));
  return `rgb(${r}, ${g}, ${bl})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
