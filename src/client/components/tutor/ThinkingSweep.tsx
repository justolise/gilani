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

  // Live elapsed seconds timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Phrase rotation
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
      className="inline-flex items-baseline gap-0 py-1.5 select-none"
      role="status"
      aria-live="polite"
      aria-label={`${displayText} ${elapsedSeconds}s`}
    >
      {/* Text + dots + timer all on one inline shimmer span */}
      <span
        className="text-sm font-medium tracking-tight transition-opacity duration-250"
        style={{
          opacity: fade ? 1 : 0,
          background:
            "linear-gradient(110deg, var(--muted-foreground) 10%, var(--primary) 45%, var(--foreground) 55%, var(--muted-foreground) 90%)",
          backgroundSize: "300% 100%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "ts-shimmer 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      >
        {displayText}
      </span>

      {/* Animated dots — inline with text, same shimmer colour via currentColor */}
      <span className="inline-flex items-end gap-[3px] mx-1.5 mb-[1px]">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="inline-block w-[3px] h-[3px] rounded-full bg-primary/70"
            style={{
              animation: `ts-dot 1.4s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </span>

      {/* Live timer — plain text, no badge box */}
      <span
        className="text-sm font-medium tabular-nums transition-opacity duration-250"
        style={{
          opacity: fade ? 1 : 0,
          background:
            "linear-gradient(110deg, var(--muted-foreground) 10%, var(--primary) 45%, var(--foreground) 55%, var(--muted-foreground) 90%)",
          backgroundSize: "300% 100%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "ts-shimmer 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      >
        {elapsedSeconds}s
      </span>

      <style>{`
        @keyframes ts-shimmer {
          0%   { background-position: 150% 0; }
          100% { background-position: -150% 0; }
        }
        @keyframes ts-dot {
          0%, 60%, 100% { transform: translateY(0);    opacity: 0.35; }
          30%            { transform: translateY(-4px); opacity: 1;    }
        }
      `}</style>
    </div>
  );
}
