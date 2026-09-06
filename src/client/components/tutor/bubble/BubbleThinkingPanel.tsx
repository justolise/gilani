import { useState } from "react";
import { Brain, ChevronDown } from "lucide-react";

export function BubbleThinkingPanel({ reasoningSteps }: { reasoningSteps: any[] }) {
  const [open, setOpen] = useState(false);

  if (reasoningSteps.length === 0) return null;

  return (
    <div className="mb-3">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:bg-primary/8 hover:text-primary cursor-pointer"
      >
        <Brain className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
        Thought Process
        <ChevronDown
          className="h-3 w-3 opacity-60 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Collapsible content */}
      {open && (
        <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="relative rounded-xl border border-border/40 bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground space-y-2">
            {/* Left accent bar */}
            <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-primary/30" />
            <div className="pl-3 space-y-2">
              {reasoningSteps.map((step: any, i: number) => (
                <p
                  key={`reasoning-${i}-${(step.text || "").slice(0, 20)}`}
                  className="italic text-muted-foreground/80 leading-relaxed"
                >
                  {step.text}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
