import { spring, SpringConfig } from "remotion";

// Premium spring configs
export const SPRING_CONFIGS = {
  gentle: { damping: 20, mass: 0.8, stiffness: 80 } as SpringConfig,
  snappy: { damping: 16, mass: 0.6, stiffness: 200 } as SpringConfig,
  slow: { damping: 30, mass: 1.2, stiffness: 60 } as SpringConfig,
  bouncy: { damping: 10, mass: 0.7, stiffness: 150 } as SpringConfig,
};

export const makeSpring = (
  frame: number,
  fps: number,
  delay: number = 0,
  config: SpringConfig = SPRING_CONFIGS.gentle
): number => {
  return spring({ frame: Math.max(0, frame - delay), fps, config });
};

// Interpolate between 0 and 1 with clamping
export const interpolateProgress = (
  frame: number,
  startFrame: number,
  endFrame: number
): number => {
  if (frame <= startFrame) return 0;
  if (frame >= endFrame) return 1;
  return (frame - startFrame) / (endFrame - startFrame);
};

// Typewriter effect: returns how many characters to show
export const typewriterChars = (
  frame: number,
  startFrame: number,
  text: string,
  charsPerFrame: number = 1.5
): string => {
  const elapsed = Math.max(0, frame - startFrame);
  const chars = Math.floor(elapsed * charsPerFrame);
  return text.slice(0, Math.min(chars, text.length));
};
