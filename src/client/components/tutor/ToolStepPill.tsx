import { Check, Loader2 } from "lucide-react";

type ToolStepPillProps = {
  toolName: string;
  isDone: boolean;
  className?: string;
};

export function ToolStepPill({ toolName, isDone, className = "" }: ToolStepPillProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-xs border transition-all duration-300 select-none ${
        isDone
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50"
          : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50"
      } ${className}`}
    >
      {isDone ? (
        <Check className="h-3 w-3 flex-shrink-0" strokeWidth={2.5} />
      ) : (
        <Loader2 className="h-3 w-3 flex-shrink-0 animate-spin" />
      )}
      <span className="font-semibold">{toolName}</span>
    </div>
  );
}
