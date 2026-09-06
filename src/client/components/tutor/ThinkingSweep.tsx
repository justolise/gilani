import React, { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";

const THINKING_PHRASES = [
  "Thinking…",
  "Reasoning through this…",
  "Working it out…",
  "Formulating explanation…",
  "Synthesizing answer…",
];

export function ThinkingSweep({ label }: { label?: string }) {
  // Rotating phrase when no specific tool label is active
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
      className="flex items-center gap-2.5 py-1.5 select-none"
      role="status"
      aria-live="polite"
      aria-label={`${displayText} (${elapsedSeconds}s)`}
    >
      {/* Animated AI spark orb */}
      <div className="relative flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 dark:bg-primary/20 text-primary">
        {/* Soft glowing pulse ring */}
        <span
          className="absolute inset-0 rounded-full bg-primary/25 dark:bg-primary/35 animate-ping opacity-60 pointer-events-none"
          style={{ animationDuration: "1.8s" }}
        />
        {/* Revolving ring border */}
        <span
          className="absolute inset-0 rounded-full border border-primary/40 dark:border-primary/60 border-t-transparent"
          style={{ animation: "spin 2.2s linear infinite" }}
        />
        {/* Centered Sparkles icon */}
        <Sparkles className="w-3.5 h-3.5 text-primary relative z-10 animate-pulse" />
      </div>

      {/* Text with shimmer wave & live elapsed seconds badge */}
      <div className="flex items-center gap-2">
        <span
          className="text-sm font-medium tracking-tight text-foreground transition-opacity duration-250"
          style={{
            opacity: fade ? 1 : 0,
            background:
              "linear-gradient(90deg, var(--foreground) 0%, var(--primary) 50%, var(--foreground) 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer-wave 2.4s linear infinite",
          }}
        >
          {displayText}
        </span>

        {/* Live elapsed timer */}
        <span className="text-[11px] font-mono font-medium text-muted-foreground/75 bg-muted/60 dark:bg-muted/40 px-1.5 py-0.5 rounded-md border border-border/40">
          {elapsedSeconds}s
        </span>
      </div>

      {/* Bouncing dots */}
      <span className="flex items-center gap-1 pb-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary/80 dark:bg-primary/90"
            style={{
              animation: `bounce-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </span>

      <style>{`
        @keyframes shimmer-wave {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes bounce-dot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
          40%            { transform: translateY(-3.5px); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
