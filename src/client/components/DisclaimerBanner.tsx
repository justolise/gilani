import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-amber-500/5 backdrop-blur-md p-3.5 sm:p-4 mb-5 shadow-sm transition-all duration-300">
      <div className="flex items-start gap-3 sm:gap-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              AI Study Companion Notice
            </span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500/60" />
          </div>
          <p className="text-xs sm:text-[13px] text-muted-foreground mt-0.5 leading-relaxed">
            GilaniAI provides AI-assisted tutoring grounded in your curriculum. While we strive for
            accuracy, AI responses can occasionally contain errors. Always verify key exam concepts
            with teachers or syllabus textbooks.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors shrink-0 cursor-pointer"
          aria-label="Dismiss AI notice"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
