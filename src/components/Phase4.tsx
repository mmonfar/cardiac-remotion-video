import React from "react";
import { useVideoConfig } from "remotion";
import { BRAND, WARD_BEDS, COLOR_MAP } from "../constants";
import { makeSpring, SPRING_CONFIGS, interpolateProgress } from "../springs";

const COLS = 6;

export const Phase4: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const { fps } = useVideoConfig();

  const titleIn = makeSpring(localFrame, fps, 0, SPRING_CONFIGS.gentle);

  // Beds populate one by one with stagger
  const bedsIn = WARD_BEDS.map((_, i) =>
    makeSpring(localFrame, fps, i * 12, SPRING_CONFIGS.snappy)
  );

  // Prescription items
  const rxIn = makeSpring(localFrame, fps, 80, SPRING_CONFIGS.gentle);
  const rx2In = makeSpring(localFrame, fps, 110, SPRING_CONFIGS.gentle);
  const rx3In = makeSpring(localFrame, fps, 140, SPRING_CONFIGS.gentle);

  // End card
  const endIn = interpolateProgress(localFrame, 220, 290);
  const taglineIn = interpolateProgress(localFrame, 270, 350);
  const sublineIn = interpolateProgress(localFrame, 320, 400);
  const logoIn = interpolateProgress(localFrame, 380, 450);

  const pulse = 0.5 + 0.5 * Math.sin(localFrame * 0.12);

  return (
    <g>
      {/* ── WARD OPS HEADER ────────────────────────────── */}
      <text
        x={100}
        y={75}
        fontFamily="JetBrains Mono"
        fontSize={11}
        fill={BRAND.grey}
        letterSpacing="0.25em"
        opacity={titleIn}
      >
        [ 04_LIVE_WARD_DIGITAL_TWIN ]
      </text>
      <text
        x={100}
        y={125}
        fontFamily="Space Grotesk"
        fontWeight={200}
        fontSize={44}
        fill={BRAND.text}
        opacity={titleIn}
      >
        Operations Manager
      </text>
      <text
        x={100}
        y={160}
        fontFamily="JetBrains Mono"
        fontSize={13}
        fill={BRAND.grey}
        opacity={titleIn}
      >
        7-DAY ADMISSION PRESCRIPTION — REAL-TIME WARD STATUS
      </text>

      {/* ── BED GRID ───────────────────────────────────── */}
      <g transform="translate(100, 195)">
        {WARD_BEDS.map((bed, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const bx = col * 172;
          const by = row * 140;
          const sc = bedsIn[i];
          const isOccupied = bed.cat !== null;
          const color = isOccupied ? COLOR_MAP[`Cat ${bed.cat}`] : BRAND.accent;

          return (
            <g
              key={bed.id}
              transform={`translate(${bx + 86}, ${by + 60}) scale(${sc}) translate(-86, -60)`}
            >
              <rect
                width={158}
                height={120}
                rx={2}
                fill={BRAND.card}
                stroke={isOccupied ? color : "#2a2a2c"}
                strokeWidth={isOccupied ? 1.5 : 0.8}
                strokeDasharray={isOccupied ? undefined : "4 3"}
              />
              {/* Bed ID */}
              <text
                x={12}
                y={22}
                fontFamily="JetBrains Mono"
                fontSize={8}
                fill={BRAND.grey}
                letterSpacing="0.1em"
              >
                BED_{String(bed.id).padStart(2, "0")}
              </text>

              {isOccupied ? (
                <>
                  {/* Category badge */}
                  <text
                    x={79}
                    y={70}
                    textAnchor="middle"
                    fontFamily="JetBrains Mono"
                    fontSize={28}
                    fontWeight={700}
                    fill={color}
                  >
                    C{bed.cat}
                  </text>
                  {/* Days remaining */}
                  <text
                    x={79}
                    y={92}
                    textAnchor="middle"
                    fontFamily="JetBrains Mono"
                    fontSize={10}
                    fill={BRAND.grey}
                  >
                    {bed.days}d REMAINING
                  </text>
                  {/* Category label */}
                  <text
                    x={79}
                    y={108}
                    textAnchor="middle"
                    fontFamily="JetBrains Mono"
                    fontSize={8}
                    fill={color}
                    opacity={0.7}
                  >
                    {bed.cat === 1 ? "CRITICAL" : bed.cat === 2 ? "URGENT" : bed.cat === 3 ? "SEMI-URGENT" : "ROUTINE"}
                  </text>
                  {/* Cat1 pulse glow */}
                  {bed.cat === 1 && (
                    <rect
                      x={0}
                      y={0}
                      width={158}
                      height={120}
                      rx={2}
                      fill={`rgba(188,255,0,${pulse * 0.08})`}
                    />
                  )}
                </>
              ) : (
                <>
                  <text
                    x={79}
                    y={68}
                    textAnchor="middle"
                    fontFamily="JetBrains Mono"
                    fontSize={11}
                    fill={BRAND.accent}
                  >
                    OPEN
                  </text>
                  <text
                    x={79}
                    y={90}
                    textAnchor="middle"
                    fontFamily="JetBrains Mono"
                    fontSize={8}
                    fill={BRAND.grey}
                  >
                    AVAILABLE
                  </text>
                </>
              )}
            </g>
          );
        })}
      </g>

      {/* ── PRESCRIPTION PANEL ─────────────────────────── */}
      <g transform="translate(1160, 195)">
        <rect width={660} height={400} rx={2} fill={BRAND.card} stroke={BRAND.grid} />
        <text
          x={24}
          y={36}
          fontFamily="JetBrains Mono"
          fontSize={10}
          fill={BRAND.accent}
          letterSpacing="0.2em"
        >
          [ WEEKLY_PRESCRIPTION ]
        </text>
        <line x1={0} y1={48} x2={660} y2={48} stroke={BRAND.grid} />

        {[
          { cat: "Cat 1", n: 2, color: COLOR_MAP["Cat 1"] },
          { cat: "Cat 2", n: 3, color: COLOR_MAP["Cat 2"] },
          { cat: "Cat 3", n: 3, color: COLOR_MAP["Cat 3"] },
        ].map((rx, i) => (
          <g
            key={rx.cat}
            transform={`translate(24, ${70 + i * 100})`}
            opacity={[rxIn, rx2In, rx3In][i]}
          >
            <rect
              x={-4}
              y={-16}
              width={8}
              height={74}
              rx={1}
              fill={rx.color}
            />
            <text
              x={16}
              fontFamily="JetBrains Mono"
              fontSize={10}
              fill={BRAND.grey}
              letterSpacing="0.15em"
            >
              {rx.cat}
            </text>
            <text
              x={16}
              y={30}
              fontFamily="Space Grotesk"
              fontSize={38}
              fontWeight={200}
              fill={rx.color}
            >
              {rx.n}
            </text>
            <text
              x={16}
              y={52}
              fontFamily="JetBrains Mono"
              fontSize={9}
              fill={BRAND.grey}
            >
              ADMISSIONS THIS WEEK
            </text>
          </g>
        ))}

        {/* Total */}
        <line x1={0} y1={370} x2={660} y2={370} stroke={BRAND.grid} />
        <text
          x={24}
          y={390}
          fontFamily="JetBrains Mono"
          fontSize={10}
          fill={BRAND.text}
          opacity={rx3In}
        >
          TOTAL: 8 ADMISSIONS // STABILITY: 96% // TARGET_WK: 26
        </text>
      </g>

      {/* ── END CARD OVERLAY ─────────────────────────────── */}
      {endIn > 0 && (
        <g>
          {/* Dark overlay */}
          <rect x={0} y={0} width={1920} height={1080} fill={BRAND.bg} opacity={endIn * 0.92} />

          {/* Horizontal scan line (premium feel) */}
          <rect
            x={0}
            y={540 - 1}
            width={1920}
            height={2}
            fill={BRAND.accent}
            opacity={endIn * 0.3}
          />

          {/* CARDIAC accent bar */}
          <rect
            x={0}
            y={0}
            width={6}
            height={1080 * endIn}
            fill={BRAND.accent}
          />

          {/* Main tagline */}
          <text
            x={960}
            y={430 + (1 - taglineIn) * 60}
            textAnchor="middle"
            fontFamily="Space Grotesk"
            fontWeight={200}
            fontSize={64}
            fill={BRAND.text}
            letterSpacing="0.05em"
            opacity={taglineIn}
          >
            CARDIAC STRATEGY LAB
          </text>

          {/* Accent line */}
          <line
            x1={960 - 280 * taglineIn}
            y1={458}
            x2={960 + 280 * taglineIn}
            y2={458}
            stroke={BRAND.accent}
            strokeWidth={1}
          />

          {/* Subline */}
          <text
            x={960}
            y={510 + (1 - sublineIn) * 30}
            textAnchor="middle"
            fontFamily="JetBrains Mono"
            fontSize={18}
            fill={BRAND.grey}
            letterSpacing="0.25em"
            opacity={sublineIn}
          >
            FROM EVENT LOGS TO EXPLANATIONS
          </text>

          {/* Bottom descriptor */}
          <text
            x={960}
            y={600 + (1 - logoIn) * 20}
            textAnchor="middle"
            fontFamily="JetBrains Mono"
            fontSize={11}
            fill={BRAND.grey}
            letterSpacing="0.2em"
            opacity={logoIn * 0.7}
          >
            STOCHASTIC SIMULATION · AI OPTIMIZATION · REAL-TIME WARD PLANNING
          </text>

          {/* Pulsing accent dot */}
          {logoIn > 0.5 && (
            <>
              <circle
                cx={960}
                cy={660}
                r={4 + pulse * 4}
                fill="none"
                stroke={BRAND.accent}
                strokeWidth={1}
                opacity={logoIn * (0.3 + pulse * 0.3)}
              />
              <circle cx={960} cy={660} r={4} fill={BRAND.accent} opacity={logoIn} />
            </>
          )}

          {/* Corner marks */}
          {[[80, 80], [1840, 80], [80, 1000], [1840, 1000]].map(([cx, cy], i) => (
            <g key={i} transform={`translate(${cx}, ${cy})`} opacity={logoIn * 0.4}>
              <line x1={-14} y1={0} x2={14} y2={0} stroke={BRAND.grey} strokeWidth={0.8} />
              <line x1={0} y1={-14} x2={0} y2={14} stroke={BRAND.grey} strokeWidth={0.8} />
            </g>
          ))}
        </g>
      )}
    </g>
  );
};
