import React from "react";
import { useVideoConfig } from "remotion";
import { BRAND, AI_DATA, BASELINE_DATA, COLOR_MAP } from "../constants";
import { makeSpring, SPRING_CONFIGS, interpolateProgress } from "../springs";

const CHART_H = 300;
const CHART_W = 720;

function buildAreas(
  data: typeof AI_DATA,
  width: number,
  height: number,
  progress: number
): { path: string; color: string; key: string }[] {
  const weeks = data.length;
  const maxVal = 70;
  const xStep = width / (weeks - 1);
  const cats = ["cat5", "cat4", "cat3", "cat2", "cat1"] as const;
  const catColors = [
    COLOR_MAP["Cat 5"],
    COLOR_MAP["Cat 4"],
    COLOR_MAP["Cat 3"],
    COLOR_MAP["Cat 2"],
    COLOR_MAP["Cat 1"],
  ];

  const pointsToShow = Math.max(2, Math.floor(weeks * progress));
  const slice = data.slice(0, pointsToShow);

  return cats.map((cat, ci) => {
    const cumKeys = cats.slice(ci);
    const topPoints = slice.map((d, i) => ({
      x: i * xStep,
      y: height - (cumKeys.reduce((s, k) => s + (d[k] as number), 0) / maxVal) * height,
    }));
    const botKeys = cats.slice(ci + 1);
    const botPoints = [...slice].reverse().map((d, i) => {
      const ri = slice.length - 1 - i;
      return {
        x: ri * xStep,
        y: height - (botKeys.reduce((s, k) => s + (d[k] as number), 0) / maxVal) * height,
      };
    });
    const allPoints = [...topPoints, ...botPoints];
    const d =
      allPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
    return { path: d, color: catColors[ci], key: cat };
  });
}

// Animated counter
function Counter({ from, to, progress, suffix = "" }: { from: number; to: number; progress: number; suffix?: string }) {
  const val = Math.round(from + (to - from) * progress);
  return <>{val}{suffix}</>;
}

const SEARCH_CONFIGS = [
  { beds: 7, slots: 3, score: 9840 },
  { beds: 8, slots: 4, score: 7200 },
  { beds: 9, slots: 5, score: 5600 },
  { beds: 10, slots: 6, score: 4100 },
  { beds: 11, slots: 7, score: 2800 },
  { beds: 12, slots: 8, score: 1200 },
  { beds: 12, slots: 8, score: 0 },
];

export const Phase3: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const { fps } = useVideoConfig();

  const titleIn = makeSpring(localFrame, fps, 0, SPRING_CONFIGS.gentle);
  const searchIn = makeSpring(localFrame, fps, 20, SPRING_CONFIGS.gentle);
  const chartIn = makeSpring(localFrame, fps, 200, SPRING_CONFIGS.gentle);
  const stabilizeIn = makeSpring(localFrame, fps, 320, SPRING_CONFIGS.snappy);

  // Optimization "search" animation
  const searchProgress = interpolateProgress(localFrame, 30, 240);
  const rowsShown = Math.min(SEARCH_CONFIGS.length, Math.floor(searchProgress * SEARCH_CONFIGS.length * 1.2));
  const foundSolution = searchProgress > 0.85;

  // Chart draw
  const chartProgress = interpolateProgress(localFrame, 210, 430);

  // KPI transition: RISK → STABLE
  const kpiProgress = interpolateProgress(localFrame, 300, 430);
  const statusIsStable = kpiProgress > 0.5;

  // Before/after comparison
  const compareIn = interpolateProgress(localFrame, 380, 480);

  return (
    <g>
      {/* Header */}
      <text x={100} y={75} fontFamily="JetBrains Mono" fontSize={11} fill={BRAND.grey} letterSpacing="0.25em" opacity={titleIn}>
        [ 03_AI_STRATEGY_SOLVER ]
      </text>
      <text x={100} y={125} fontFamily="Space Grotesk" fontWeight={200} fontSize={46} fill={BRAND.text} opacity={titleIn}>
        Heuristic Optimization Engine
      </text>
      <text x={100} y={160} fontFamily="JetBrains Mono" fontSize={13} fill={BRAND.grey} opacity={titleIn}>
        SEARCHING: min(beds, slots) → Zero 26-Week Breaches by Target Week
      </text>

      {/* ── SEARCH ANIMATION (left panel) ─────────────────── */}
      <g transform="translate(100, 190)" opacity={searchIn}>
        <rect width={720} height={520} rx={2} fill={BRAND.card} stroke={BRAND.grid} />
        <rect width={720} height={34} rx={2} fill="#0d0d0e" />
        <text x={18} y={21} fontFamily="JetBrains Mono" fontSize={10} fill={BRAND.grey} letterSpacing="0.15em">
          AI_OPTIMIZER: find_ai_recommendation()
        </text>

        {/* Table header */}
        <text x={18} y={60} fontFamily="JetBrains Mono" fontSize={9} fill={BRAND.grey}>BEDS</text>
        <text x={120} y={60} fontFamily="JetBrains Mono" fontSize={9} fill={BRAND.grey}>SLOTS</text>
        <text x={240} y={60} fontFamily="JetBrains Mono" fontSize={9} fill={BRAND.grey}>SCORE</text>
        <text x={380} y={60} fontFamily="JetBrains Mono" fontSize={9} fill={BRAND.grey}>STATUS</text>
        <line x1={0} y1={68} x2={720} y2={68} stroke={BRAND.grid} />

        {/* Search rows */}
        {SEARCH_CONFIGS.slice(0, rowsShown).map((cfg, i) => {
          const isBest = i === SEARCH_CONFIGS.length - 1 && foundSolution;
          const rowColor = isBest ? BRAND.accent : cfg.score < 2000 ? BRAND.cyan : BRAND.text;
          return (
            <g key={i} transform={`translate(0, ${75 + i * 58})`}>
              {isBest && (
                <rect x={0} y={-14} width={720} height={50} fill={`rgba(188,255,0,0.06)`} />
              )}
              <text x={18} fontFamily="JetBrains Mono" fontSize={13} fill={rowColor}>
                {cfg.beds}
              </text>
              <text x={120} fontFamily="JetBrains Mono" fontSize={13} fill={rowColor}>
                {cfg.slots}
              </text>
              <text x={240} fontFamily="JetBrains Mono" fontSize={13} fill={rowColor}>
                {cfg.score}
              </text>
              <text x={380} fontFamily="JetBrains Mono" fontSize={11} fill={isBest ? BRAND.accent : BRAND.grey}>
                {isBest ? "✓ OPTIMAL" : cfg.score === 0 ? "TESTING..." : "CONTINUE →"}
              </text>
            </g>
          );
        })}

        {/* Result highlight */}
        {foundSolution && (
          <g>
            <line x1={0} y1={490} x2={720} y2={490} stroke={BRAND.accent} strokeWidth={1} />
            <text x={18} y={515} fontFamily="JetBrains Mono" fontSize={11} fill={BRAND.accent} letterSpacing="0.15em">
              ► RECOMMENDATION: 12 BEDS / 8 SLOTS / STABILITY: 96%
            </text>
          </g>
        )}
      </g>

      {/* ── KPI CARDS ─────────────────────────────────────── */}
      <g transform="translate(880, 190)" opacity={chartIn}>
        {/* Baseline card */}
        <g>
          <rect width={460} height={148} rx={2} fill={BRAND.card} stroke="#2a2a2c" />
          <text x={20} y={30} fontFamily="JetBrains Mono" fontSize={9} fill={BRAND.grey} letterSpacing="0.15em">
            BASELINE
          </text>
          <text x={20} y={66} fontFamily="Space Grotesk" fontSize={34} fontWeight={200} fill={BRAND.red}>
            RISK
          </text>
          <text x={20} y={96} fontFamily="JetBrains Mono" fontSize={10} fill={BRAND.grey}>
            CANCELLATIONS: 124 | RESIDUAL_RISK: 28
          </text>
          <text x={20} y={118} fontFamily="JetBrains Mono" fontSize={10} fill={BRAND.grey}>
            STABILITY_SCORE: 14%
          </text>
          <text x={20} y={140} fontFamily="JetBrains Mono" fontSize={9} fill={BRAND.grey}>
            3 SLOTS / 7 BEDS
          </text>
        </g>

        {/* AI card */}
        <g transform="translate(0, 168)">
          <rect
            width={460}
            height={148}
            rx={2}
            fill={statusIsStable ? `rgba(188,255,0,0.05)` : BRAND.card}
            stroke={statusIsStable ? BRAND.accent : "#2a2a2c"}
          />
          <text x={20} y={30} fontFamily="JetBrains Mono" fontSize={9} fill={BRAND.grey} letterSpacing="0.15em">
            AI_TARGET
          </text>
          <text
            x={20}
            y={66}
            fontFamily="Space Grotesk"
            fontSize={34}
            fontWeight={200}
            fill={statusIsStable ? BRAND.accent : BRAND.red}
          >
            {statusIsStable ? "STABLE" : "RISK"}
          </text>
          <text x={20} y={96} fontFamily="JetBrains Mono" fontSize={10} fill={BRAND.grey}>
            CANCELLATIONS: <Counter from={124} to={4} progress={kpiProgress} /> | RESIDUAL_RISK: <Counter from={28} to={0} progress={kpiProgress} />
          </text>
          <text x={20} y={118} fontFamily="JetBrains Mono" fontSize={10} fill={statusIsStable ? BRAND.accent : BRAND.grey}>
            STABILITY_SCORE: <Counter from={14} to={96} progress={kpiProgress} suffix="%" />
          </text>
          <text x={20} y={140} fontFamily="JetBrains Mono" fontSize={9} fill={BRAND.grey}>
            8 SLOTS / 12 BEDS
          </text>
        </g>
      </g>

      {/* ── AI Chart ──────────────────────────────────────── */}
      <g transform="translate(880, 560)" opacity={chartIn}>
        <text fontFamily="JetBrains Mono" fontSize={9} fill={BRAND.grey} letterSpacing="0.15em">
          AI_SCENARIO: BACKLOG CLEARANCE (52W PROJECTION)
        </text>
        <g transform="translate(0, 20)">
          <defs>
            <clipPath id="aiChartClip">
              <rect width={CHART_W * chartProgress} height={CHART_H + 10} />
            </clipPath>
          </defs>
          {/* Grid */}
          {[0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={0}
              y1={CHART_H * (1 - t)}
              x2={CHART_W}
              y2={CHART_H * (1 - t)}
              stroke={BRAND.grid}
              strokeWidth={1}
            />
          ))}

          <g clipPath="url(#aiChartClip)">
            {buildAreas(AI_DATA, CHART_W, CHART_H, chartProgress).map((p) => (
              <path key={p.key} d={p.path} fill={p.color} opacity={0.75} />
            ))}
          </g>

          {/* Over-26 line (should drop to 0) */}
          <g clipPath="url(#aiChartClip)">
            {(() => {
              const xStep = CHART_W / (AI_DATA.length - 1);
              const ptCount = Math.max(2, Math.floor(AI_DATA.length * chartProgress));
              const pts = AI_DATA.slice(0, ptCount).map((d, i) => ({
                x: i * xStep,
                y: CHART_H - (d.over26 / 30) * CHART_H,
              }));
              return (
                <path
                  d={pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
                  stroke={BRAND.text}
                  strokeWidth={2}
                  fill="none"
                  strokeDasharray="6 4"
                />
              );
            })()}
          </g>

          <line x1={0} y1={CHART_H} x2={CHART_W} y2={CHART_H} stroke={BRAND.grid} />

          {/* "ZERO BREACH" annotation */}
          {AI_DATA.some((d) => d.over26 === 0) && stabilizeIn > 0 && (
            <g transform="translate(340, 10)" opacity={stabilizeIn}>
              <rect x={-8} y={-18} width={200} height={30} rx={2} fill={`rgba(188,255,0,0.1)`} />
              <rect x={-8} y={-18} width={200} height={30} rx={2} fill="none" stroke={BRAND.accent} strokeWidth={1} />
              <text fontFamily="JetBrains Mono" fontSize={11} fill={BRAND.accent} letterSpacing="0.12em">
                ✓ ZERO BREACH
              </text>
            </g>
          )}
        </g>
      </g>
    </g>
  );
};
