import { CheckCircle2, Circle, Flag, Timer } from "lucide-react";
import { MarkdownRenderer } from "@/client/components/tutor/MarkdownRenderer";
import type { StudyPlanItem } from "@/fns/planner.server-fns";

export const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-500/10 text-red-500",
  medium: "bg-amber-500/10 text-amber-500",
  low: "bg-muted text-muted-foreground",
};

export function PlannerItemRow({
  planId,
  item,
  onToggleItem,
  onStartFocusSession,
}: {
  planId: string;
  item: StudyPlanItem;
  onToggleItem: (planId: string, itemId: string) => void;
  onStartFocusSession: (planId: string, itemId: string, durationMinutes: number) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <button
        onClick={() => onToggleItem(planId, item.id)}
        className="shrink-0 mt-0.5 cursor-pointer"
      >
        {item.completed ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-xs font-semibold text-primary">{item.subject}</span>
          <span className="text-xs text-muted-foreground">· {item.topic}</span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide flex items-center gap-1 ${
              PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.low
            }`}
          >
            <Flag className="h-2.5 w-2.5" />
            {item.priority}
          </span>
          <span className="text-[10px] text-muted-foreground">{item.durationMinutes}m</span>
          {!item.completed && (
            <button
              onClick={() => onStartFocusSession(planId, item.id, item.durationMinutes)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
              title="Start a focus session for this task"
            >
              <Timer className="h-2.5 w-2.5" />
              Focus
            </button>
          )}
        </div>
        <div
          className={`text-sm [&>p]:m-0 ${
            item.completed ? "text-muted-foreground line-through" : "text-foreground"
          }`}
        >
          <MarkdownRenderer content={item.task} />
        </div>
      </div>
    </div>
  );
}
