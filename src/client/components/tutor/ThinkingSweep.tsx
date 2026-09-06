import React, { useEffect, useRef, useState } from "react";

const THINKING_PHRASES = [
  "Thinking",
  "Reasoning through this",
  "Working it out",
  "Formulating explanation",
  "Synthesizing answer",
];

// Shared gradient: dim base with a bright primary highlight stripe that sweeps through
const SHIMMER_GRADIENT =
  "linear-gradient(90deg," +
  "  var(--color-muted-foreground) 0%," +
  "  var(--color-muted-foreground) 25%," +
  "  var(--color-primary) 45%," +
  "  var(--color-foreground) 50%," +
  "  var(--color-primary) 55%," +
  "  var(--color-muted-foreground) 75%," +
  "  var(--color-muted-foreground) 100%" +
  ")";

export function ThinkingSweep({ label }: { label?: string }) {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const phrasesEnabled = !label;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!phrasesEnabled) return;
    intervalRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPhraseIdx((i) => (i + 1) % THINKING_PHRASES.length);
        setFade(true);
      }, 250);
    }, 2800);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phrasesEnabled]);

  const displayText = phrasesEnabled ? THINKING_PHRASES[phraseIdx] : (label ?? THINKING_PHRASES[0]);

  // Applied to every text-bearing child so background-clip:text takes effect
  const shimmerTextStyle: React.CSSProperties = {
    background: SHIMMER_GRADIENT,
    backgroundSize: "250% 100%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    animation: "ts-shimmer 1.8s linear infinite",
    display: "inline",
  };

  return (
    <div
      className="inline-flex items-baseline py-1.5 select-none"
      role="status"
      aria-live="polite"
      aria-label={`${displayText} ${elapsedSeconds}s`}
      style={{ opacity: fade ? 1 : 0, transition: "opacity 0.25s ease" }}
    >
      {/* Label */}
      <span className="text-sm font-medium tracking-tight" style={shimmerTextStyle}>
        {displayText}
      </span>

      {/* Bouncing dots */}
      <span className="inline-flex items-end gap-[3px] mx-[5px] translate-y-[-1px]">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="inline-block rounded-full"
            style={{
              width: "3px",
              height: "3px",
              background: "var(--color-primary)",
              opacity: 0.7,
              animation: `ts-dot 1.4s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </span>

      {/* Timer */}
      <span className="text-sm font-medium tabular-nums" style={shimmerTextStyle}>
        {elapsedSeconds}s
      </span>

      <style>{`
        @keyframes ts-shimmer {
          0%   { background-position: 120% 0; }
          100% { background-position: -120% 0; }
        }
        @keyframes ts-dot {
          0%, 60%, 100% { transform: translateY(0);    opacity: 0.4; }
          30%            { transform: translateY(-4px); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
