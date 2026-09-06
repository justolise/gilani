import React, { useEffect, useRef, useState } from "react";

const THINKING_PHRASES = [
  "Thinking",
  "Reasoning through this",
  "Working it out",
  "Formulating explanation",
  "Synthesizing answer",
];

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

  return (
    <div
      className="inline-flex items-baseline py-1.5 select-none"
      role="status"
      aria-live="polite"
      aria-label={`${displayText} ${elapsedSeconds}s`}
      style={{ opacity: fade ? 1 : 0, transition: "opacity 0.25s ease" }}
    >
      {/*
        Single container — the shimmer gradient animates across the whole row.
        Bright narrow highlight stripe on a dimmer base creates a clearly
        visible sweep.
      */}
      <span
        className="inline-flex items-baseline gap-0 text-sm font-medium tracking-tight"
        style={{
          background:
            "linear-gradient(90deg," +
            "  hsl(var(--muted-foreground)/0.55) 0%," +
            "  hsl(var(--muted-foreground)/0.55) 30%," +
            "  hsl(var(--primary-foreground,255 255 255)/0.0) 42%," +
            "  hsl(var(--primary)) 48%," +
            "  hsl(var(--foreground)) 50%," +
            "  hsl(var(--primary)) 52%," +
            "  hsl(var(--primary-foreground,255 255 255)/0.0) 58%," +
            "  hsl(var(--muted-foreground)/0.55) 70%," +
            "  hsl(var(--muted-foreground)/0.55) 100%" +
            ")",
          backgroundSize: "220% 100%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "ts-shimmer 1.8s linear infinite",
        }}
      >
        {/* Label text */}
        <span>{displayText}</span>

        {/* Dots */}
        <span className="inline-flex items-end gap-[3px] mx-[5px] translate-y-[-1px]">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="inline-block rounded-full"
              style={{
                width: "3px",
                height: "3px",
                background: "currentColor",
                WebkitTextFillColor: "initial",
                backgroundColor: "var(--color-primary, hsl(var(--primary)))",
                opacity: 0.6,
                animation: `ts-dot 1.4s ease-in-out ${i * 0.18}s infinite`,
              }}
            />
          ))}
        </span>

        {/* Timer */}
        <span className="tabular-nums">{elapsedSeconds}s</span>
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
