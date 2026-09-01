import { useState } from "react";

export function BubbleThinkingPanel({ reasoningSteps }: { reasoningSteps: any[] }) {
  const [showThinkingPanel, setShowThinkingPanel] = useState(false);

  if (reasoningSteps.length === 0) return null;

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setShowThinkingPanel((v) => !v)}
        className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-muted-foreground/70 hover:text-foreground transition-colors cursor-pointer"
      >
        Thinking{showThinkingPanel ? " ▲" : " ..."}
      </button>
      {showThinkingPanel && (
        <div className="mt-1.5 space-y-1.5 rounded-xl border border-border/50 bg-muted/20 p-2.5 text-xs leading-relaxed text-muted-foreground">
          {reasoningSteps.map((step: any, i: number) => (
            <p key={`reasoning-${i}-${(step.text || "").slice(0, 20)}`} className="italic">
              {step.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
