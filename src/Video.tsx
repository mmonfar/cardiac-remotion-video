import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { BRAND, FONT_STYLE, TIMING } from "./constants";
import { Phase1 } from "./components/Phase1";
import { Phase2 } from "./components/Phase2";
import { Phase3 } from "./components/Phase3";
import { Phase4 } from "./components/Phase4";

// ── BACKGROUND GRID ────────────────────────────────────────────────────────────
const BackgroundGrid: React.FC = () => {
  const W = 1920;
  const H = 1080;
  const STEP = 60;

  const hLines = [];
  const vLines = [];

  for (let y = 0; y <= H; y += STEP) {
    hLines.push(<line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} stroke={BRAND.grid} strokeWidth={0.4} />);
  }
  for (let x = 0; x <= W; x += STEP) {
    vLines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} stroke={BRAND.grid} strokeWidth={0.4} />);
  }

  return (
    <g opacity={0.5}>
      {hLines}
      {vLines}
    </g>
  );
};

// ── PHASE TRANSITION FLASH ─────────────────────────────────────────────────────
const TransitionFlash: React.FC<{ triggerFrame: number }> = ({ triggerFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = frame - triggerFrame;
  if (elapsed < 0 || elapsed > 20) return null;

  const opacity = interpolate(elapsed, [0, 4, 20], [0, 0.6, 0], { extrapolateRight: "clamp" });

  return <rect x={0} y={0} width={1920} height={1080} fill={BRAND.accent} opacity={opacity} />;
};

// ── PROGRESS BAR ───────────────────────────────────────────────────────────────
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;

  const phases = [
    { label: "01_PROBLEM", end: TIMING.phase2Start / durationInFrames },
    { label: "02_LOGIC", end: TIMING.phase3Start / durationInFrames },
    { label: "03_AI_SOLVER", end: TIMING.phase4Start / durationInFrames },
    { label: "04_TWIN", end: 1 },
  ];

  return (
    <g transform="translate(0, 1060)">
      {/* Full bar */}
      <rect x={0} y={0} width={1920} height={4} fill={BRAND.card} />
      {/* Fill */}
      <rect x={0} y={0} width={1920 * progress} height={4} fill={BRAND.accent} opacity={0.7} />
      {/* Phase labels */}
      {phases.map((p, i) => {
        const x = i === 0 ? 20 : phases[i - 1].end * 1920 + 10;
        return (
          <text
            key={p.label}
            x={x}
            y={-8}
            fontFamily="JetBrains Mono"
            fontSize={8}
            fill={progress >= (i === 0 ? 0 : phases[i - 1].end) ? BRAND.accent : BRAND.grey}
            letterSpacing="0.1em"
            opacity={0.8}
          >
            {p.label}
          </text>
        );
      })}
      {/* Phase dividers */}
      {phases.slice(0, -1).map((p) => (
        <rect key={p.label} x={p.end * 1920} y={-2} width={1} height={8} fill={BRAND.grey} opacity={0.3} />
      ))}
    </g>
  );
};

// ── SCANLINE OVERLAY ───────────────────────────────────────────────────────────
const ScanlineOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const y = (frame * 4) % 1100;
  return (
    <rect
      x={0}
      y={y}
      width={1920}
      height={2}
      fill={BRAND.text}
      opacity={0.015}
      style={{ pointerEvents: "none" }}
    />
  );
};

// ── CORNER STAMP ───────────────────────────────────────────────────────────────
const CornerStamp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = (frame / fps).toFixed(1);

  return (
    <g>
      {/* Top-left logo */}
      <text x={40} y={40} fontFamily="JetBrains Mono" fontSize={10} fill={BRAND.accent} letterSpacing="0.2em" opacity={0.8}>
        CARDIAC STRATEGY LAB
      </text>
      <text x={40} y={56} fontFamily="JetBrains Mono" fontSize={8} fill={BRAND.grey} opacity={0.5}>
        v2.0 // SYSTEMS_ONLINE
      </text>

      {/* Top-right timecode */}
      <text x={1880} y={40} textAnchor="end" fontFamily="JetBrains Mono" fontSize={9} fill={BRAND.grey} opacity={0.5}>
        {seconds}s
      </text>

      {/* Corner brackets */}
      {/* TL */}
      <path d="M 28 20 L 28 28 L 36 28" stroke={BRAND.grey} strokeWidth={0.8} fill="none" opacity={0.4} />
      {/* TR */}
      <path d="M 1892 20 L 1892 28 L 1884 28" stroke={BRAND.grey} strokeWidth={0.8} fill="none" opacity={0.4} />
      {/* BL */}
      <path d="M 28 1070 L 28 1052 L 36 1052" stroke={BRAND.grey} strokeWidth={0.8} fill="none" opacity={0.4} />
      {/* BR */}
      <path d="M 1892 1070 L 1892 1052 L 1884 1052" stroke={BRAND.grey} strokeWidth={0.8} fill="none" opacity={0.4} />
    </g>
  );
};

// ── PHASE CROSSFADE ────────────────────────────────────────────────────────────
function usePhaseOpacity(startFrame: number, endFrame: number, fps: number): number {
  const frame = useCurrentFrame();
  const fadeIn = spring({ frame: frame - startFrame, fps, config: { damping: 28, stiffness: 100 } });
  const fadeOut = endFrame > 0
    ? spring({ frame: frame - (endFrame - 20), fps, config: { damping: 20, stiffness: 120 } })
    : 0;
  return Math.max(0, Math.min(1, fadeIn - fadeOut));
}

// ── MAIN COMPOSITION ───────────────────────────────────────────────────────────
export const CardiacVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p1Opacity = usePhaseOpacity(TIMING.phase1Start, TIMING.phase2Start, fps);
  const p2Opacity = usePhaseOpacity(TIMING.phase2Start, TIMING.phase3Start, fps);
  const p3Opacity = usePhaseOpacity(TIMING.phase3Start, TIMING.phase4Start, fps);
  const p4Opacity = usePhaseOpacity(TIMING.phase4Start, -1, fps);

  const p2LocalFrame = frame - TIMING.phase2Start;
  const p3LocalFrame = frame - TIMING.phase3Start;
  const p4LocalFrame = frame - TIMING.phase4Start;

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      {/* Font import */}
      <style>{FONT_STYLE}</style>

      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Background */}
        <rect width={1920} height={1080} fill={BRAND.bg} />
        <BackgroundGrid />

        {/* Phase 1: The Problem */}
        {p1Opacity > 0.01 && (
          <g opacity={p1Opacity}>
            <Phase1 />
          </g>
        )}

        {/* Phase 2: The Logic */}
        {p2Opacity > 0.01 && (
          <g opacity={p2Opacity}>
            <Phase2 localFrame={Math.max(0, p2LocalFrame)} />
          </g>
        )}

        {/* Phase 3: AI Solution */}
        {p3Opacity > 0.01 && (
          <g opacity={p3Opacity}>
            <Phase3 localFrame={Math.max(0, p3LocalFrame)} />
          </g>
        )}

        {/* Phase 4: Tactical Twin */}
        {p4Opacity > 0.01 && (
          <g opacity={p4Opacity}>
            <Phase4 localFrame={Math.max(0, p4LocalFrame)} />
          </g>
        )}

        {/* Transitions */}
        <TransitionFlash triggerFrame={TIMING.phase2Start} />
        <TransitionFlash triggerFrame={TIMING.phase3Start} />
        <TransitionFlash triggerFrame={TIMING.phase4Start} />

        {/* Always-on chrome */}
        <CornerStamp />
        <ProgressBar />
        <ScanlineOverlay />
      </svg>
    </AbsoluteFill>
  );
};
