import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, COLOR_MAP } from "../constants";
import { makeSpring, SPRING_CONFIGS, interpolateProgress, typewriterChars } from "../springs";

// Patient node component
const PatientNode: React.FC<{
  x: number;
  y: number;
  cat: number;
  weeks: number;
  isLegacy?: boolean;
  pulse?: boolean;
  opacity?: number;
  scale?: number;
}> = ({ x, y, cat, weeks, isLegacy = false, pulse = false, opacity = 1, scale = 1 }) => {
  const color = COLOR_MAP[`Cat ${cat}`] || BRAND.grey;
  const glowOpacity = pulse ? 0.5 : 0;
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
      {/* Glow ring */}
      <circle r={34} fill="none" stroke={color} strokeWidth={2} opacity={glowOpacity} />
      {/* Outer ring */}
      <circle r={28} fill="none" stroke={color} strokeWidth={isLegacy ? 2.5 : 1} opacity={0.6} />
      {/* Body */}
      <circle r={22} fill={BRAND.card} stroke={color} strokeWidth={isLegacy ? 2 : 1} />
      {/* Category label */}
      <text
        textAnchor="middle"
        y={-4}
        fontFamily="JetBrains Mono"
        fontSize={12}
        fontWeight={700}
        fill={color}
      >
        C{cat}
      </text>
      <text textAnchor="middle" y={10} fontFamily="JetBrains Mono" fontSize={8} fill={BRAND.grey}>
        WK{weeks}
      </text>
      {isLegacy && (
        <text textAnchor="middle" y={-40} fontFamily="JetBrains Mono" fontSize={8} fill={BRAND.accent}>
          LEGACY
        </text>
      )}
    </g>
  );
};

// Arrow SVG
const Arrow: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  color?: string; dashed?: boolean; opacity?: number;
}> = ({ x1, y1, x2, y2, color = BRAND.grey, dashed = false, opacity = 1 }) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len;
  const uy = dy / len;
  const ex = x2 - ux * 14;
  const ey = y2 - uy * 14;
  return (
    <g opacity={opacity}>
      <line
        x1={x1}
        y1={y1}
        x2={ex}
        y2={ey}
        stroke={color}
        strokeWidth={dashed ? 1.5 : 2}
        strokeDasharray={dashed ? "6 4" : undefined}
      />
      <polygon
        points={`0,-5 9,0 0,5`}
        fill={color}
        transform={`translate(${x2},${y2}) rotate(${(Math.atan2(dy, dx) * 180) / Math.PI})`}
      />
    </g>
  );
};

const MATH_LINES = [
  "// STOCHASTIC DETERIORATION MODEL",
  "λ_system = Σ det_rates[patient.category]",
  "num_det ~ Poisson(λ_system)",
  "",
  "// LEGACY CLOCK RULE",
  "if patient.weeks_waiting >= 26:",
  "    patient.category = 1  # ESCALATE",
  "",
  "// LOS SAMPLING (Gamma Distribution)",
  "days_admitted ~ Gamma(k=cat_mean, θ=scale)",
];

export const Phase2: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const { fps } = useVideoConfig();

  // Sequence orchestration
  const titleIn = makeSpring(localFrame, fps, 0, SPRING_CONFIGS.gentle);
  const pathAIn = makeSpring(localFrame, fps, 20, SPRING_CONFIGS.gentle);
  const pathBIn = makeSpring(localFrame, fps, 60, SPRING_CONFIGS.gentle);

  // Legacy escalation animation — patient goes from Cat5 → Cat1
  const escalateProgress = interpolateProgress(localFrame, 140, 220);
  const escalateCat = escalateProgress < 0.5 ? 5 : escalateProgress < 0.75 ? 3 : 1;
  const flashPulse = localFrame > 200 && (Math.floor(localFrame / 6) % 2 === 0);

  // Standard deterioration
  const det1Progress = interpolateProgress(localFrame, 180, 240);
  const det2Progress = interpolateProgress(localFrame, 260, 320);
  const det3Progress = interpolateProgress(localFrame, 290, 370);

  // Math code panel
  const codeProgress = interpolateProgress(localFrame, 80, 520);
  const codeLinesShown = Math.floor(codeProgress * MATH_LINES.length);

  // λ highlight
  const lambdaGlow = localFrame > 120 ? 0.5 + 0.5 * Math.sin(localFrame * 0.1) : 0;

  return (
    <g>
      {/* Section label */}
      <text
        x={100}
        y={80}
        fontFamily="JetBrains Mono"
        fontSize={11}
        fill={BRAND.grey}
        letterSpacing="0.25em"
        opacity={titleIn}
      >
        [ 02_CLINICAL_ENGINE ]
      </text>
      <text
        x={100}
        y={130}
        fontFamily="Space Grotesk"
        fontWeight={200}
        fontSize={48}
        fill={BRAND.text}
        opacity={titleIn}
      >
        Dual-Pathway Risk Model
      </text>

      {/* ── PATHWAY A: LEGACY CLOCK ──────────────────────────── */}
      <g opacity={pathAIn}>
        <text
          x={100}
          y={210}
          fontFamily="JetBrains Mono"
          fontSize={10}
          fill={BRAND.accent}
          letterSpacing="0.2em"
        >
          PATHWAY_A: LEGACY CLOCK (10%)
        </text>
        <line x1={100} y1={220} x2={760} y2={220} stroke={BRAND.accent} strokeWidth={0.5} opacity={0.4} />

        {/* Timeline row — weeks 0 → 26 → escalation */}
        {[0, 5, 10, 15, 20, 25].map((wk, i) => (
          <PatientNode
            key={wk}
            x={140 + i * 110}
            y={310}
            cat={5}
            weeks={wk}
            isLegacy
            opacity={0.35 + i * 0.1}
          />
        ))}

        {/* Week 26 trigger node */}
        <PatientNode
          x={140 + 6 * 110}
          y={310}
          cat={escalateCat}
          weeks={26}
          isLegacy
          pulse={flashPulse}
          scale={1 + escalateProgress * 0.15}
        />

        {/* Connecting arrows */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Arrow
            key={i}
            x1={163 + i * 110}
            y1={310}
            x2={117 + (i + 1) * 110}
            y2={310}
            color={BRAND.accent}
            opacity={0.4}
          />
        ))}
        <Arrow x1={163 + 5 * 110} y1={310} x2={117 + 6 * 110} y2={310} color={BRAND.red} />

        {/* BREACH label */}
        <text
          x={780}
          y={295}
          fontFamily="JetBrains Mono"
          fontSize={10}
          fill={BRAND.red}
          letterSpacing="0.15em"
          opacity={escalateProgress}
        >
          BREACH
        </text>
        <text
          x={780}
          y={312}
          fontFamily="JetBrains Mono"
          fontSize={10}
          fill={BRAND.red}
          opacity={escalateProgress}
        >
          → CAT 1
        </text>

        {/* 26-week marker line */}
        <line x1={760} y1={250} x2={760} y2={380} stroke={BRAND.red} strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
        <text x={755} y={247} fontFamily="JetBrains Mono" fontSize={9} fill={BRAND.red} textAnchor="end">
          WK26
        </text>
      </g>

      {/* ── PATHWAY B: STOCHASTIC STANDARD ──────────────────── */}
      <g opacity={pathBIn}>
        <text
          x={100}
          y={430}
          fontFamily="JetBrains Mono"
          fontSize={10}
          fill={BRAND.cyan}
          letterSpacing="0.2em"
        >
          PATHWAY_B: STANDARD MATRIX (90%) — POISSON DETERIORATION
        </text>
        <line x1={100} y1={440} x2={900} y2={440} stroke={BRAND.cyan} strokeWidth={0.5} opacity={0.4} />

        {/* Cat 5 → 4 → 3 → 2 deterioration cascade */}
        <PatientNode x={140} y={560} cat={5} weeks={3} />
        <Arrow x1={165} y1={560} x2={215} y2={560} color={BRAND.grey} dashed />
        <PatientNode x={250} y={560} cat={5} weeks={8} />

        {/* Deterioration event 1: 5→4 */}
        <Arrow
          x1={275}
          y1={560}
          x2={380}
          y2={560}
          color={BRAND.cyan}
          opacity={det1Progress}
        />
        <PatientNode x={420} y={560} cat={4} weeks={12} opacity={det1Progress} />
        <text x={305} y={545} fontFamily="JetBrains Mono" fontSize={8} fill={BRAND.cyan} opacity={det1Progress}>
          DET EVENT
        </text>

        {/* Deterioration event 2: 4→3 */}
        <Arrow
          x1={445}
          y1={560}
          x2={540}
          y2={560}
          color={BRAND.blue}
          opacity={det2Progress}
        />
        <PatientNode x={580} y={560} cat={3} weeks={18} opacity={det2Progress} />

        {/* Deterioration event 3: 3→2 */}
        <Arrow
          x1={605}
          y1={560}
          x2={700}
          y2={560}
          color={BRAND.accent}
          opacity={det3Progress}
        />
        <PatientNode x={740} y={560} cat={2} weeks={24} opacity={det3Progress} />

        {/* λ label between nodes */}
        <g opacity={det1Progress}>
          <rect x={290} y={555} width={80} height={20} rx={2} fill={`rgba(0,255,194,${0.1 + lambdaGlow * 0.1})`} />
          <text x={330} y={568} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={9} fill={BRAND.cyan}>
            λ={`0.07`}
          </text>
        </g>
      </g>

      {/* ── CODE PANEL ──────────────────────────────────────── */}
      <g transform="translate(1000, 160)">
        <rect width={820} height={680} rx={2} fill={BRAND.card} stroke={BRAND.grid} />
        <rect width={820} height={34} rx={2} fill="#0d0d0e" />
        <text x={20} y={21} fontFamily="JetBrains Mono" fontSize={10} fill={BRAND.grey} letterSpacing="0.15em">
          engine.py  —  CLINICAL DETERIORATION LOGIC
        </text>
        {/* Dots */}
        {[14, 24, 34].map((cx, i) => (
          <circle key={i} cx={820 - cx} cy={17} r={4} fill={["#FF3E3E", "#FFBD2D", "#28CA41"][i]} />
        ))}

        {/* Code lines */}
        {MATH_LINES.slice(0, codeLinesShown + 1).map((line, i) => {
          const isComment = line.startsWith("//");
          const isKeyword = line.includes("if ") || line.includes("patient.category");
          const isLambda = line.includes("λ") || line.includes("Poisson") || line.includes("Gamma");
          const color = isComment
            ? BRAND.grey
            : isKeyword
            ? BRAND.red
            : isLambda
            ? BRAND.accent
            : BRAND.text;
          const isCurrent = i === codeLinesShown;
          const displayLine = isCurrent
            ? typewriterChars(localFrame, 80 + i * 40, line, 2)
            : line;

          return (
            <g key={i} transform={`translate(20, ${55 + i * 52})`}>
              <text
                fontFamily="JetBrains Mono"
                fontSize={13}
                fill={color}
                opacity={isCurrent ? 0.7 : 0.9}
              >
                <tspan fill={BRAND.grey} opacity={0.3} fontSize={10}>
                  {String(i + 1).padStart(2, " ")}  
                </tspan>
                {displayLine}
                {isCurrent && <tspan fill={BRAND.accent}>█</tspan>}
              </text>
            </g>
          );
        })}

        {/* λ glow highlight */}
        {localFrame > 120 && (
          <rect
            x={10}
            y={45 + 1 * 52}
            width={800}
            height={48}
            rx={2}
            fill={`rgba(188,255,0,${lambdaGlow * 0.06})`}
          />
        )}
      </g>
    </g>
  );
};
