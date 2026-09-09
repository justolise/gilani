import React from "react";
import { Check, Loader2 } from "lucide-react";
import { formatToolDisplayName, getToolIcon } from "./tool-metadata";

type ToolStepPillProps = {
  toolName: string;
  isDone: boolean;
  className?: string;
};

export function ToolStepPill({ toolName, isDone, className = "" }: ToolStepPillProps) {
  const displayName = formatToolDisplayName(toolName);
  const ToolIcon = getToolIcon(toolName);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border select-none shadow-xs transition-all duration-300 ${
        isDone
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 animate-in zoom-in-95 duration-200"
          : "border-amber-500/30 text-amber-700 dark:text-amber-300 relative overflow-hidden"
      } ${className}`}
      title={`${displayName}: ${isDone ? "Completed" : "Running…"}`}
      role="status"
    >
      {/* Shimmer overlay for in-progress state */}
      {!isDone && (
        <span
          className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent"
          aria-hidden="true"
        />
      )}
      <ToolIcon className="h-3.5 w-3.5 flex-shrink-0 opacity-85 relative z-10" />
      <span className="relative z-10">{displayName}</span>
      {isDone ? (
        <Check
          className="h-3 w-3 flex-shrink-0 text-emerald-600 dark:text-emerald-400 relative z-10"
          strokeWidth={2.5}
        />
      ) : (
        <Loader2 className="h-3 w-3 flex-shrink-0 animate-spin text-amber-600 dark:text-amber-400 relative z-10" />
      )}
    </div>
  );
}
