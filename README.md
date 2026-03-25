# 🎬 Cardiac Strategy Lab — Remotion Video

A 60-second, 1920×1080 marketing video generated with [Remotion](https://remotion.dev), built to showcase the **Cardiac Service Strategy Lab** clinical decision-support tool.

---

## 🗂️ Project Structure

```
cardiac-remotion/
├── src/
│   ├── index.ts               # Remotion entry point
│   ├── Root.tsx               # Composition registration
│   ├── Video.tsx              # Main orchestrator (phases + chrome)
│   ├── constants.ts           # Brand colors, data, timing
│   ├── springs.ts             # Spring / easing helpers
│   └── components/
│       ├── Phase1.tsx         # 0–15s  : The Bed-Choke Problem
│       ├── Phase2.tsx         # 15–35s : Dual-Pathway Risk Model
│       ├── Phase3.tsx         # 35–50s : AI Strategy Solver
│       └── Phase4.tsx         # 50–60s : Ward Digital Twin + End Card
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Launch Remotion Studio (interactive preview)
npm start

# 3. Render the final video
npm run build
```

The rendered file will be saved to `out/cardiac-strategy-lab.mp4`.

---

## 🎬 Video Structure

| Phase | Time    | Content |
|-------|---------|---------|
| **01_PROBLEM** | 0–15s | Animated stacked-area chart showing backlog by category. Red cancellation bars spike due to Bed-Choke (7 beds, 3 slots). |
| **02_LOGIC** | 15–35s | Legacy patient escalates from Cat 5 → Cat 1 at Week 26. Stochastic Poisson deterioration cascade. Live typewriter code display. |
| **03_AI_SOLVER** | 35–50s | Optimization search table fills live. KPI cards flip from RISK → STABLE. AI scenario chart draws, Zero Breach annotation appears. |
| **04_TWIN** | 50–60s | Ward bed grid populates with spring animation. Prescription panel. End card with tagline: "FROM EVENT LOGS TO EXPLANATIONS". |

---

## 🎨 Visual Design

| Token | Value |
|-------|-------|
| Background | `#121214` |
| Surface | `#1A1A1C` |
| Accent (Pulse Lime) | `#bcff00` |
| Cream | `#F2F0E9` |
| Risk Red | `#FF3E3E` |
| Fonts | JetBrains Mono + Space Grotesk |

All animations use **spring physics** (`remotion`'s `spring()`) for a premium, natural motion feel — no linear tweens.

---

## 🔧 Configuration

**Timing** (frames at 30fps) — edit `src/constants.ts`:

```ts
export const TIMING = {
  phase1Start: 0,    // 0s
  phase2Start: 450,  // 15s
  phase3Start: 1050, // 35s
  phase4Start: 1500, // 50s
  end: 1800,         // 60s
};
```

**Data** — The `BASELINE_DATA` and `AI_DATA` arrays in `constants.ts` are synthetic approximations of the engine's output. To use real simulation data, run your Python `engine.py` and export to JSON, then import here.

---

## 📦 Dependencies

```
remotion          ^4.0.176   — Core rendering
@remotion/cli     ^4.0.176   — Studio + render CLI
react             18.3.1
react-dom         18.3.1
typescript        5.4.5
```

> **Note**: No `@remotion/charts` required — all charts are pure SVG path math, matching the visual style of your Plotly charts exactly.

---

## 🛠️ Customisation Tips

- **Change chart data**: Replace `BASELINE_DATA` / `AI_DATA` in `constants.ts` with exports from your actual simulation.
- **Add voiceover**: Use `<Audio>` component from Remotion; place an MP3 in `/public/`.
- **Export GIF**: `remotion render --codec=gif --every-nth-frame=3`
- **Export WebM**: `remotion render --codec=vp8`
