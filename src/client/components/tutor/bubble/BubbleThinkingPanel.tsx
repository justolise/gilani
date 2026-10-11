import { useState, useCallback } from "react";
import { Sparkles, ChevronDown, Copy, Check } from "lucide-react";

export function BubbleThinkingPanel({ reasoningSteps }: { reasoningSteps: any[] }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const fullText = reasoningSteps
      .map((step, idx) =>
        reasoningSteps.length > 1 ? `[Step ${idx + 1}]\n${step.text || ""}` : step.text || "",
      )
      .join("\n\n");

    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }, [reasoningSteps]);

  if (!reasoningSteps || reasoningSteps.length === 0) return null;

  return (
    <div className="mb-3">
      {/* Claude-Style Thinking Toggle Button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="bubble-thought-process-panel"
        className={`group inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 cursor-pointer ${
          open
            ? "border-primary/40 bg-primary/10 text-primary shadow-xs"
            : "border-border/60 bg-muted/40 text-muted-foreground hover:border-border hover:bg-muted/70 hover:text-foreground"
        }`}
      >
        <Sparkles
          className={`h-3.5 w-3.5 transition-colors ${
            open ? "text-primary" : "text-muted-foreground/70 group-hover:text-primary"
          }`}
        />
        <span>Thought process</span>
        {reasoningSteps.length > 1 && (
          <span className="rounded-full bg-muted/70 px-1.5 py-0.2 font-mono text-[10px] tabular-nums text-muted-foreground">
            {reasoningSteps.length} steps
          </span>
        )}
        <ChevronDown
          className="h-3 w-3 opacity-60 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Collapsible content */}
      {open && (
        <div
          id="bubble-thought-process-panel"
          className="mt-2.5 animate-in fade-in slide-in-from-top-1.5 duration-200"
        >
          <div className="relative rounded-2xl border border-border/50 bg-muted/20 dark:bg-muted/10 p-3.5 text-xs leading-relaxed text-muted-foreground backdrop-blur-xs">
            {/* Left warm accent line */}
            <div className="absolute left-0 top-3.5 bottom-3.5 w-0.5 rounded-full bg-primary/40" />

            {/* Header with step count and copy action */}
            <div className="pl-3 pb-2.5 mb-2.5 flex items-center justify-between border-b border-border/30">
              <span className="text-[11px] font-medium tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary" />
                Thinking trace ({reasoningSteps.length}{" "}
                {reasoningSteps.length === 1 ? "step" : "steps"})
              </span>

              <button
                type="button"
                onClick={handleCopy}
                title="Copy thought process"
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-2 py-0.5 rounded-md hover:bg-muted/60"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="text-green-500 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Scrollable reasoning steps list */}
            <div className="pl-3 max-h-72 overflow-y-auto space-y-3 select-text pr-1 font-sans">
              {reasoningSteps.map((step: any, i: number) => (
                <div
                  key={`reasoning-${i}-${(step.text || "").slice(0, 20)}`}
                  className={reasoningSteps.length > 1 ? "space-y-1" : ""}
                >
                  {reasoningSteps.length > 1 && (
                    <div className="font-mono text-[10px] font-semibold text-primary/80 uppercase tracking-wider">
                      Step {i + 1}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed text-[12.5px]">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
