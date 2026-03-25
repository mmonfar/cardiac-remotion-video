import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { BRAND, BASELINE_DATA, COLOR_MAP } from "../constants";
import { makeSpring, SPRING_CONFIGS, interpolateProgress } from "../springs";

const W = 1920;
const H = 1080;
const CHART_W = 900;
const CHART_H = 380;
const CHART_X = 120;
const CHART_Y = 300;

function buildStackedAreas(data: typeof BASELINE_DATA, width: number, height: number) {
  const weeks = data.length;
  const maxVal = 70;
  const xStep = width / (weeks - 1);

  const cats = ["cat5", "cat4", "cat3", "cat2", "cat1"] as const;
  const catColors = [COLOR_MAP["Cat 5"], COLOR_MAP["Cat 4"], COLOR_MAP["Cat 3"], COLOR_MAP["Cat 2"], COLOR_MAP["Cat 1"]];

  const paths: { path: string; color: string; key: string }[] = [];

  for (let ci = 0; ci < cats.length; ci++) {
    const cumKeys = cats.slice(ci);
    const topPoints = data.map((d, i) => {
      const cumSum = cumKeys.reduce((s, k) => s + (d[k] as number), 0);
      return { x: i * xStep, y: height - (cumSum / maxVal) * height };
    });
    const botKeys = cats.slice(ci + 1);
    const botPoints = [...data].reverse().map((d, i) => {
      const cumSum = botKeys.reduce((s, k) => s + (d[k] as number), 0);
      const ri = data.length - 1 - i;
      return { x: ri * xStep, y: height - (cumSum / maxVal) * height };
    });

    const allPoints = [...topPoints, ...botPoints];
    const d = allPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
    paths.push({ path: d, color: catColors[ci], key: cats[ci] });
  }
  return paths;
}

function CancellationSpikes({
  data,
  width,
  height,
  progress,
}: {
  data: typeof BASELINE_DATA;
  width: number;
  height: number;
  progress: number;
}) {
  const maxCancel = 6;
  const xStep = width / (data.length - 1);
  const barsToShow = Math.floor(data.length * progress);

  return (
    <g>
      {data.slice(0, barsToShow).map((d, i) => {
        const barH = (d.cancellations / maxCancel) * height * 0.4;
        const x = i * xStep - 4;
        return (
          <rect
            key={i}
            x={x}
            y={height - barH}
            width={8}
            height={barH}
            fill={BRAND.red}
            opacity={0.85}
          />
        );
      })}
    </g>
  );
}

function Over26Line({
  data,
  width,
  height,
  progress,
}: {
  data: typeof BASELINE_DATA;
  width: number;
  height: number;
  progress: number;
}) {
  const maxVal = 35;
  const xStep = width / (data.length - 1);
  const pointsToShow = Math.max(2, Math.floor(data.length * progress));
  const pts = data.slice(0, pointsToShow).map((d, i) => ({
    x: i * xStep,
    y: height - (d.over26 / maxVal) * height,
  }));
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  return <path d={d} stroke={BRAND.text} strokeWidth={2} fill="none" strokeDasharray="6 4" />;
}

export const Phase1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const titleIn = makeSpring(frame, fps, 0, SPRING_CONFIGS.gentle);
  const subtitleIn = makeSpring(frame, fps, 15, SPRING_CONFIGS.gentle);
  const chartIn = makeSpring(frame, fps, 30, SPRING_CONFIGS.slow);

  // Chart draws in over ~200 frames
  const chartProgress = interpolateProgress(frame, 40, 380);

  // Red alert pulse
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.15);

  // Annotation fade
  const annotIn = interpolateProgress(frame, 240, 300);
  const annotIn2 = interpolateProgress(frame, 310, 380);

  const areaPaths = buildStackedAreas(BASELINE_DATA, CHART_W, CHART_H);
  const clipWidth = CHART_W * chartProgress;

  return (
    <g>
      {/* Background grid lines */}
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={CHART_X}
          y1={CHART_Y + CHART_H * (1 - t)}
          x2={CHART_X + CHART_W}
          y2={CHART_Y + CHART_H * (1 - t)}
          stroke={BRAND.grid}
          strokeWidth={1}
        />
      ))}

      {/* Title */}
      <text
        x={CHART_X}
        y={180}
        fontFamily="JetBrains Mono"
        fontSize={13}
        fill={BRAND.grey}
        letterSpacing="0.25em"
        style={{ transform: `translateY(${(1 - titleIn) * 30}px)`, opacity: titleIn }}
      >
        [ 01_THE_PROBLEM ]
      </text>
      <text
        x={CHART_X}
        y={230}
        fontFamily="Space Grotesk"
        fontWeight={200}
        fontSize={52}
        fill={BRAND.text}
        style={{ transform: `translateY(${(1 - titleIn) * 40}px)`, opacity: titleIn }}
      >
        The Bed-Day Choke
      </text>
      <text
        x={CHART_X}
        y={270}
        fontFamily="JetBrains Mono"
        fontSize={14}
        fill={BRAND.grey}
        style={{ opacity: subtitleIn }}
      >
        BASELINE: 3 THEATER SLOTS / 7 BEDS — CANCELLATIONS SPIKE
      </text>

      {/* Chart clipping container */}
      <defs>
        <clipPath id="chartClip1">
          <rect x={CHART_X} y={CHART_Y - 20} width={clipWidth} height={CHART_H + 40} />
        </clipPath>
        <clipPath id="cancelClip1">
          <rect x={CHART_X} y={CHART_Y} width={clipWidth} height={CHART_H} />
        </clipPath>
      </defs>

      {/* Stacked area */}
      <g clipPath="url(#chartClip1)" transform={`translate(${CHART_X}, ${CHART_Y})`} opacity={chartIn}>
        {areaPaths.map((p) => (
          <path key={p.key} d={p.path} fill={p.color} opacity={0.75} />
        ))}
      </g>

      {/* Over-26 line */}
      <g clipPath="url(#chartClip1)" transform={`translate(${CHART_X}, ${CHART_Y})`} opacity={chartIn}>
        <Over26Line data={BASELINE_DATA} width={CHART_W} height={CHART_H} progress={chartProgress} />
      </g>

      {/* Cancellation bars */}
      <g clipPath="url(#cancelClip1)" transform={`translate(${CHART_X}, ${CHART_Y})`}>
        <CancellationSpikes data={BASELINE_DATA} width={CHART_W} height={CHART_H} progress={chartProgress} />
      </g>

      {/* X axis */}
      <line
        x1={CHART_X}
        y1={CHART_Y + CHART_H}
        x2={CHART_X + CHART_W}
        y2={CHART_Y + CHART_H}
        stroke={BRAND.grid}
        strokeWidth={1}
      />

      {/* Axis labels */}
      {[0, 13, 26, 39, 52].map((w) => (
        <text
          key={w}
          x={CHART_X + (w / 52) * CHART_W}
          y={CHART_Y + CHART_H + 22}
          textAnchor="middle"
          fontFamily="JetBrains Mono"
          fontSize={10}
          fill={BRAND.grey}
        >
          WK{w}
        </text>
      ))}

      {/* Legend */}
      {["Cat 1", "Cat 2", "Cat 3", "Cat 4", "Cat 5"].map((cat, i) => (
        <g key={cat} transform={`translate(${CHART_X + i * 120}, ${CHART_Y + CHART_H + 50})`} opacity={chartIn}>
          <rect width={12} height={12} fill={COLOR_MAP[cat]} rx={1} />
          <text x={18} y={10} fontFamily="JetBrains Mono" fontSize={10} fill={BRAND.grey}>
            {cat}
          </text>
        </g>
      ))}
      <g transform={`translate(${CHART_X + 620}, ${CHART_Y + CHART_H + 50})`} opacity={chartIn}>
        <line x1={0} y1={6} x2={14} y2={6} stroke={BRAND.text} strokeDasharray="4 3" strokeWidth={2} />
        <text x={18} y={10} fontFamily="JetBrains Mono" fontSize={10} fill={BRAND.grey}>
          26WK_RISK
        </text>
      </g>
      <g transform={`translate(${CHART_X + 780}, ${CHART_Y + CHART_H + 50})`} opacity={chartIn}>
        <rect width={12} height={12} fill={BRAND.red} rx={1} opacity={0.85} />
        <text x={18} y={10} fontFamily="JetBrains Mono" fontSize={10} fill={BRAND.grey}>
          CANCELLATIONS
        </text>
      </g>

      {/* Right-side stats panel */}
      <g transform={`translate(1120, 280)`} opacity={chartIn}>
        <rect width={660} height={460} fill={BRAND.card} rx={2} stroke="#2a2a2c" />
        <text x={30} y={40} fontFamily="JetBrains Mono" fontSize={11} fill={BRAND.grey} letterSpacing="0.2em">
          SCENARIO_ANALYSIS
        </text>
        <line x1={0} y1={55} x2={660} y2={55} stroke={BRAND.grid} />

        {[
          { label: "THEATER_SLOTS / WK", val: "3", sub: "BASELINE" },
          { label: "WARD_BEDS", val: "7", sub: "BASELINE" },
          { label: "CANCELLATIONS (52W)", val: "124", sub: "CRITICAL", color: BRAND.red },
          { label: "RESIDUAL_RISK (WK52)", val: "28", sub: "PATIENTS", color: BRAND.red },
          { label: "STABILITY_SCORE", val: "14%", sub: "FAILING", color: BRAND.red },
        ].map((item, i) => (
          <g key={i} transform={`translate(30, ${80 + i * 72})`}>
            <text fontFamily="JetBrains Mono" fontSize={9} fill={BRAND.grey} letterSpacing="0.15em">
              {item.label}
            </text>
            <text y={28} fontFamily="Space Grotesk" fontSize={32} fontWeight={200} fill={item.color || BRAND.text}>
              {item.val}
            </text>
            <text y={44} fontFamily="JetBrains Mono" fontSize={9} fill={item.color || BRAND.grey}>
              {item.sub}
            </text>
          </g>
        ))}
      </g>

      {/* Pulsing "BED-CHOKE" annotation */}
      <g opacity={annotIn} transform={`translate(${CHART_X + 480}, ${CHART_Y + 60})`}>
        <rect x={-8} y={-20} width={200} height={36} fill={`rgba(255,62,62,${0.12 + pulse * 0.08})`} rx={2} />
        <rect x={-8} y={-20} width={200} height={36} fill="none" rx={2} stroke={BRAND.red} strokeWidth={1} opacity={0.6 + pulse * 0.4} />
        <text fontFamily="JetBrains Mono" fontSize={12} fill={BRAND.red} letterSpacing="0.15em">
          ⚠ BED-CHOKE
        </text>
      </g>

      {/* Arrow annotation */}
      <g opacity={annotIn2}>
        <line
          x1={CHART_X + 400}
          y1={CHART_Y + 120}
          x2={CHART_X + 470}
          y2={CHART_Y + 80}
          stroke={BRAND.red}
          strokeWidth={1.5}
          markerEnd="url(#arrowRed)"
        />
        <text
          x={CHART_X + 340}
          y={CHART_Y + 140}
          fontFamily="JetBrains Mono"
          fontSize={10}
          fill={BRAND.red}
          letterSpacing="0.1em"
        >
          SLOTS AVAILABLE
        </text>
        <text
          x={CHART_X + 340}
          y={CHART_Y + 155}
          fontFamily="JetBrains Mono"
          fontSize={10}
          fill={BRAND.red}
          letterSpacing="0.1em"
        >
          BUT WARD IS FULL
        </text>
      </g>

      <defs>
        <marker id="arrowRed" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={BRAND.red} />
        </marker>
      </defs>
    </g>
  );
};
