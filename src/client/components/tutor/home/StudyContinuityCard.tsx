import React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { History, CalendarCheck, Clock, ArrowRight, Play, Flame } from "lucide-react";
import type { ContinuityTask } from "./hooks/useContinuityData";
import type { Thread } from "@/client/hooks/useThreadsQuery";

interface StudyContinuityCardProps {
  latestThread: Thread | null;
  todayPlanTask: ContinuityTask | null;
  onStartPlanTask: (taskPrompt: string) => void;
  className?: string;
  disabled?: boolean;
}

export function StudyContinuityCard({
  latestThread,
  todayPlanTask,
  onStartPlanTask,
  className = "",
  disabled = false,
}: StudyContinuityCardProps) {
  const navigate = useNavigate();

  const weekDays = React.useMemo(() => {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const isToday = i === 0;
      const dayName = d.toLocaleDateString("en-US", { weekday: "narrow" });
      const active = isToday || Boolean(latestThread && i <= 2);
      days.push({ dayName, isToday, active, date: d });
    }
    return days;
  }, [latestThread]);

  if (!latestThread && !todayPlanTask) {
    return (
      <div className={`w-full max-w-3xl ${className}`}>
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl glass-card text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Flame className="h-3.5 w-3.5 fill-current" />
            </span>
            <div>
              <p className="font-semibold text-foreground text-xs leading-tight">
                Daily Study Habit
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Ask your first question today to start your streak
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {weekDays.map((d, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-center h-6 w-6 rounded-lg text-[10px] font-mono transition-colors ${
                  d.isToday
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : d.active
                      ? "bg-primary/15 text-primary font-medium"
                      : "bg-muted text-muted-foreground/60"
                }`}
                title={d.isToday ? "Today" : d.date.toLocaleDateString()}
              >
                {d.dayName}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-3xl ${className}`}>
      {/* 7-Day Study Momentum Strip */}
      <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl glass-card text-xs mb-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <Flame className="h-3.5 w-3.5 fill-current" />
          </span>
          <span className="font-semibold text-foreground text-xs">7-Day Study Momentum</span>
        </div>
        <div className="flex items-center gap-1.5">
          {weekDays.map((d, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-center h-6 w-6 rounded-lg text-[10px] font-mono transition-colors ${
                d.isToday
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : d.active
                    ? "bg-primary/15 text-primary font-medium"
                    : "bg-muted text-muted-foreground/60"
              }`}
              title={d.isToday ? "Today" : d.date.toLocaleDateString()}
            >
              {d.dayName}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {/* Latest Active Session */}
        {latestThread && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl glass-card hover:border-primary/35 shadow-xs hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <History className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase font-semibold tracking-wider text-muted-foreground">
                  Resume Study Session
                </p>
                <p className="text-sm font-medium text-foreground truncate">
                  {latestThread.title || "Untitled Session"}
                </p>
              </div>
            </div>

            <Link
              to="/tutor/$threadId"
              params={{ threadId: latestThread.id }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/90 shrink-0 px-3 py-2 min-h-[38px] rounded-lg bg-primary/10 hover:bg-primary/15 transition-all duration-150 active:scale-95"
            >
              <span>Resume</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Next Study Plan Task */}
        {todayPlanTask && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl glass-card hover:border-emerald-500/35 shadow-xs hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs uppercase font-semibold tracking-wider text-emerald-600 dark:text-emerald-400">
                    {todayPlanTask.isToday ? "Today's Study Goal" : "Upcoming Goal"}
                  </p>
                  <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {todayPlanTask.item.durationMinutes}m
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground truncate">
                  {todayPlanTask.item.subject}: {todayPlanTask.item.topic}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                if (disabled) return;
                const prompt = `Let's work on my scheduled study goal for ${todayPlanTask.item.subject}: "${todayPlanTask.item.topic}". The specific task is: "${todayPlanTask.item.task}". Please guide me through it step-by-step.`;
                onStartPlanTask(prompt);
              }}
              className={`inline-flex items-center gap-1.5 text-sm font-semibold shrink-0 px-3 py-2 min-h-[38px] rounded-lg transition-colors ${
                disabled
                  ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground"
                  : "text-emerald-600 dark:text-emerald-400 hover:opacity-80 bg-emerald-500/10 hover:bg-emerald-500/15 cursor-pointer"
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Study</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
