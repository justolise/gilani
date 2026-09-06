import { useState, useCallback } from "react";
import { Brain, ChevronDown, Copy, Check } from "lucide-react";

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
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="bubble-thought-process-panel"
        className={`group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-200 cursor-pointer ${
          open
            ? "border-primary/40 bg-primary/10 text-primary shadow-xs"
            : "border-border/50 bg-muted/40 text-muted-foreground hover:border-primary/35 hover:bg-primary/10 hover:text-primary"
        }`}
      >
        <Brain
          className={`h-3 w-3 transition-opacity ${open ? "opacity-100 text-primary" : "opacity-70 group-hover:opacity-100"}`}
        />
        <span>Thought Process</span>
        {reasoningSteps.length > 1 && (
          <span className="rounded-full bg-muted/60 px-1.5 py-0.2 text-[10px] font-normal tabular-nums text-muted-foreground">
            {reasoningSteps.length}
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
          className="mt-2 animate-in fade-in slide-in-from-top-1.5 duration-200"
        >
          <div className="relative rounded-xl border border-border/40 bg-muted/25 p-3 text-xs leading-relaxed text-muted-foreground backdrop-blur-xs">
            {/* Left primary accent bar */}
            <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-primary/30" />

            {/* Header with step count and copy action */}
            <div className="pl-3 pb-2 mb-2 flex items-center justify-between border-b border-border/30">
              <span className="text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
                <Brain className="h-3 w-3 text-primary/70" />
                Reasoning Trace ({reasoningSteps.length}{" "}
                {reasoningSteps.length === 1 ? "step" : "steps"})
              </span>

              <button
                type="button"
                onClick={handleCopy}
                title="Copy thought process"
                className="inline-flex items-center gap-1 text-[10.5px] text-muted-foreground/75 hover:text-foreground transition-colors cursor-pointer px-1.5 py-0.5 rounded-md hover:bg-muted/50"
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
            <div className="pl-3 max-h-72 overflow-y-auto space-y-3 select-text pr-1">
              {reasoningSteps.map((step: any, i: number) => (
                <div
                  key={`reasoning-${i}-${(step.text || "").slice(0, 20)}`}
                  className={reasoningSteps.length > 1 ? "space-y-1" : ""}
                >
                  {reasoningSteps.length > 1 && (
                    <div className="text-[10px] font-semibold text-primary/80 uppercase tracking-wider">
                      Step {i + 1}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-muted-foreground/85 leading-relaxed font-sans text-xs">
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
