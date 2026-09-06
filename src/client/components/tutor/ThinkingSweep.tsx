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
      className="inline-flex items-center py-1.5 select-none"
      role="status"
      aria-live="polite"
      aria-label={`${displayText} ${elapsedSeconds}s`}
    >
      {/*
        Single outer span — the shimmer gradient + animation live here.
        All children inherit the clip so the sweep runs across
        the full width (text + dots + timer) as one motion.
      */}
      <span
        className="inline-flex items-center gap-0 text-sm font-medium tracking-tight"
        style={{
          opacity: fade ? 1 : 0,
          transition: "opacity 0.25s ease",
          // Shimmer lives on this single element; clips to all descendant text
          backgroundImage:
            "linear-gradient(90deg, " +
            "var(--muted-foreground) 0%, " +
            "var(--muted-foreground) 20%, " +
            "var(--primary) 38%, " +
            "var(--foreground) 50%, " +
            "var(--primary) 62%, " +
            "var(--muted-foreground) 80%, " +
            "var(--muted-foreground) 100%)",
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "ts-shimmer 2s linear infinite",
        }}
      >
        {/* Phrase text */}
        <span>{displayText}</span>

        {/* Dots — use currentColor so they inherit the gradient clip */}
        <span
          className="inline-flex items-center gap-[3.5px] mx-[6px]"
          style={{ WebkitTextFillColor: "initial" }}
        >
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                width: "3px",
                height: "3px",
                borderRadius: "9999px",
                backgroundColor: "var(--primary)",
                opacity: 0.65,
                animation: `ts-dot 1.4s ease-in-out ${i * 0.18}s infinite`,
              }}
            />
          ))}
        </span>

        {/* Elapsed time */}
        <span className="tabular-nums">{elapsedSeconds}s</span>
      </span>

      <style>{`
        @keyframes ts-shimmer {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        @keyframes ts-dot {
          0%, 60%, 100% { transform: translateY(0);    opacity: 0.4; }
          30%            { transform: translateY(-4px); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
