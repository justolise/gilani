import React, { useEffect, useRef, useState } from "react";

const THINKING_PHRASES = [
  "Thinking…",
  "Reasoning through this…",
  "Working it out…",
  "On it…",
  "Analysing…",
];

export function ThinkingSweep({ label }: { label?: string }) {
  // Rotating phrase when no specific tool label is active
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const phrasesEnabled = !label;
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!phrasesEnabled) return;
    intervalRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPhraseIdx((i) => (i + 1) % THINKING_PHRASES.length);
        setFade(true);
      }, 300);
    }, 2800);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phrasesEnabled]);

  const displayText = phrasesEnabled ? THINKING_PHRASES[phraseIdx] : (label ?? THINKING_PHRASES[0]);

  return (
    <div
      className="flex items-center gap-3 py-1 select-none"
      role="status"
      aria-label={displayText}
    >
      {/* Animated orb */}
      <div className="relative flex-shrink-0 w-7 h-7">
        {/* Outer pulse ring */}
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary)/0.35) 0%, transparent 70%)",
            animationDuration: "1.6s",
          }}
        />
        {/* Core orb */}
        <span
          className="absolute inset-1 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--primary)/0.4), hsl(var(--primary)))",
            animation: "spin 2s linear infinite",
          }}
        />
        {/* Inner fill to make it look like a ring */}
        <span className="absolute inset-[5px] rounded-full bg-background" />
      </div>

      {/* Text with shimmer wave */}
      <span
        className="text-sm font-medium tracking-wide"
        style={{
          opacity: fade ? 1 : 0,
          transition: "opacity 0.3s ease",
          background:
            "linear-gradient(90deg, hsl(var(--foreground)/0.45) 0%, hsl(var(--foreground)) 40%, hsl(var(--primary)) 60%, hsl(var(--foreground)/0.45) 100%)",
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "shimmer-wave 2.2s ease-in-out infinite",
        }}
      >
        {displayText}
      </span>

      {/* Bouncing dots */}
      <span className="flex items-center gap-[3px] pb-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1 h-1 rounded-full bg-current opacity-50"
            style={{
              color: "hsl(var(--primary))",
              animation: `bounce-dot 1.2s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </span>

      <style>{`
        @keyframes shimmer-wave {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        @keyframes bounce-dot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
          40%            { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
