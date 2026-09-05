import React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { History, CalendarCheck, Clock, ArrowRight, Play } from "lucide-react";
import type { ContinuityTask } from "./hooks/useContinuityData";
import type { Thread } from "@/client/hooks/useThreadsQuery";

interface StudyContinuityCardProps {
  latestThread: Thread | null;
  todayPlanTask: ContinuityTask | null;
  onStartPlanTask: (taskPrompt: string) => void;
  className?: string;
}

export function StudyContinuityCard({
  latestThread,
  todayPlanTask,
  onStartPlanTask,
  className = "",
}: StudyContinuityCardProps) {
  const navigate = useNavigate();

  if (!latestThread && !todayPlanTask) {
    return null;
  }

  return (
    <div className={`w-full max-w-3xl ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {/* Latest Active Session */}
        {latestThread && (
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card/40 hover:bg-card/70 transition-all duration-150">
            <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                <History className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                  Resume Study Session
                </p>
                <p className="text-xs font-medium text-foreground truncate">
                  {latestThread.title || "Untitled Session"}
                </p>
              </div>
            </div>

            <Link
              to="/tutor/$threadId"
              params={{ threadId: latestThread.id }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 hover:underline flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <span>Resume</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Next Study Plan Task */}
        {todayPlanTask && (
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card/40 hover:bg-card/70 transition-all duration-150">
            <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 flex-shrink-0">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] uppercase font-semibold tracking-wider text-emerald-600 dark:text-emerald-400">
                    {todayPlanTask.isToday ? "Today's Study Goal" : "Upcoming Goal"}
                  </p>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {todayPlanTask.item.durationMinutes}m
                  </span>
                </div>
                <p className="text-xs font-medium text-foreground truncate">
                  {todayPlanTask.item.subject}: {todayPlanTask.item.topic}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const prompt = `Let's work on my scheduled study goal for ${todayPlanTask.item.subject}: "${todayPlanTask.item.topic}". The specific task is: "${todayPlanTask.item.task}". Please guide me through it step-by-step.`;
                onStartPlanTask(prompt);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:opacity-80 flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/15 transition-colors cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Study</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
