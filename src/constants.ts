// ─── BRAND ───────────────────────────────────────────────────────────────────
export const BRAND = {
  bg: "#121214",
  card: "#1A1A1C",
  text: "#F2F0E9",
  accent: "#bcff00",
  grey: "#888888",
  grid: "#252527",
  red: "#FF3E3E",
  cyan: "#00FFC2",
  blue: "#00D1FF",
};

export const COLOR_MAP: Record<string, string> = {
  "Cat 1": "#bcff00",
  "Cat 2": "#00FFC2",
  "Cat 3": "#00D1FF",
  "Cat 4": "#666666",
  "Cat 5": "#333333",
};

// ─── FONT INJECTION ───────────────────────────────────────────────────────────
export const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;700&family=Space+Grotesk:wght@200;300;400&display=swap');
`;

// ─── TIMING (frames at 30fps) ─────────────────────────────────────────────────
export const TIMING = {
  phase1Start: 0,      // 0s  – The Problem
  phase2Start: 450,    // 15s – The Logic
  phase3Start: 1050,   // 35s – AI Solution
  phase4Start: 1500,   // 50s – Tactical Twin
  end: 1800,           // 60s
};

// ─── DATA ─────────────────────────────────────────────────────────────────────

// Baseline scenario: beds=7, slots=3 → many cancellations, risk never clears
export const BASELINE_DATA = Array.from({ length: 52 }, (_, w) => ({
  week: w,
  cat1: Math.max(0, 8 + Math.round(Math.sin(w * 0.3) * 3 + w * 0.05)),
  cat2: Math.max(0, 12 - Math.round(w * 0.08) + Math.round(Math.cos(w * 0.2) * 2)),
  cat3: Math.max(0, 15 - Math.round(w * 0.1)),
  cat4: Math.max(0, 18 - Math.round(w * 0.15)),
  cat5: Math.max(0, 7 - Math.round(w * 0.1)),
  cancellations: Math.max(0, 2 + Math.round(Math.sin(w * 0.5) * 1.5 + (w > 10 ? 3 : 0))),
  over26: Math.max(0, 15 + Math.round(w * 0.3 - Math.sin(w * 0.2) * 2)),
}));

// AI scenario: beds=12, slots=8 → cancellations drop, risk clears
export const AI_DATA = Array.from({ length: 52 }, (_, w) => ({
  week: w,
  cat1: Math.max(0, 8 - Math.round(w * 0.12) + Math.round(Math.sin(w * 0.3))),
  cat2: Math.max(0, 12 - Math.round(w * 0.2)),
  cat3: Math.max(0, 15 - Math.round(w * 0.28)),
  cat4: Math.max(0, 18 - Math.round(w * 0.35)),
  cat5: Math.max(0, 7 - Math.round(w * 0.14)),
  cancellations: Math.max(0, 1 - Math.round(w * 0.08)),
  over26: Math.max(0, 15 - Math.round(w * 0.65)),
}));

export const WARD_BEDS = [
  { id: 1, cat: 1, days: 18 },
  { id: 2, cat: 2, days: 7 },
  { id: 3, cat: 1, days: 22 },
  { id: 4, cat: 3, days: 3 },
  { id: 5, cat: 2, days: 11 },
  { id: 6, cat: 4, days: 1 },
  { id: 7, cat: 1, days: 20 },
  { id: 8, cat: null, days: 0 },
  { id: 9, cat: 2, days: 9 },
  { id: 10, cat: 3, days: 5 },
  { id: 11, cat: null, days: 0 },
  { id: 12, cat: 1, days: 14 },
];
