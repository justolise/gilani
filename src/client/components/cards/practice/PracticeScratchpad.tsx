import React from "react";
import { Pencil } from "lucide-react";

export function PracticeScratchpad({
  open,
  onOpenChange,
  draft,
  onDraftChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: string;
  onDraftChange: (val: string) => void;
}) {
  return (
    <div className="px-4 sm:px-5 pb-2">
      {!open ? (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline underline-offset-4 cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5" />
          Try answering before checking solution
        </button>
      ) : (
        <div className="rounded-xl border border-border/80 bg-muted/20 p-3 mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Pencil className="h-3.5 w-3.5 text-primary" />
              Your Scratchpad / Attempt:
            </span>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Hide
            </button>
          </div>
          <textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder="Type your workings or answer here..."
            rows={2}
            className="w-full rounded-lg border border-border bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}
    </div>
  );
}
