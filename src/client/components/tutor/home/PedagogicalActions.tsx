import React from "react";
import { HelpCircle, CheckCircle2, Brain, Sparkles, ArrowUpRight } from "lucide-react";

export interface PedagogicalAction {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  prompt: string;
}

export const PEDAGOGICAL_ACTIONS: PedagogicalAction[] = [
  {
    id: "socratic",
    title: "Step-by-Step Guide",
    subtitle: "Hints and guiding questions without spoiling the answer",
    badge: "Socratic Method",
    icon: HelpCircle,
    colorClass:
      "text-amber-500 bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/40",
    prompt:
      "I have this problem: [describe problem]. Please guide me through solving it one step at a time using hints, without giving me the final answer immediately.",
  },
  {
    id: "homework",
    title: "Check My Homework",
    subtitle: "Review your working and spot exactly where an error occurred",
    badge: "Error Analysis",
    icon: CheckCircle2,
    colorClass:
      "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40",
    prompt:
      "Here is my homework question and my attempted working: [paste problem & working]. Please review my steps and explain where my reasoning or calculation needs correction.",
  },
  {
    id: "quiz",
    title: "Quiz My Knowledge",
    subtitle: "3 progressive questions to test mastery on any topic",
    badge: "Active Recall",
    icon: Brain,
    colorClass: "text-sky-500 bg-sky-500/10 border-sky-500/20 group-hover:border-sky-500/40",
    prompt:
      "Test my understanding of [enter topic] with 3 progressively challenging questions. Ask me the first question and wait for my answer.",
  },
  {
    id: "analogy",
    title: "Explain Simply",
    subtitle: "Break down tough concepts with real-world analogies",
    badge: "Intuitive Learning",
    icon: Sparkles,
    colorClass:
      "text-indigo-500 bg-indigo-500/10 border-indigo-500/20 group-hover:border-indigo-500/40",
    prompt:
      "Explain [enter concept] in simple terms using a relatable real-world analogy and clear step-by-step intuition.",
  },
];

interface PedagogicalActionsProps {
  onSelectAction: (prompt: string) => void;
  className?: string;
  disabled?: boolean;
}

export function PedagogicalActions({
  onSelectAction,
  className = "",
  disabled = false,
}: PedagogicalActionsProps) {
  return (
    <div className={`w-full max-w-3xl ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {PEDAGOGICAL_ACTIONS.map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onSelectAction(action.prompt)}
              style={{ animationDelay: `${i * 60}ms` }}
              className={`group relative flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 text-left animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                disabled
                  ? "border-border/40 bg-card/40 opacity-50 cursor-not-allowed shadow-none"
                  : "border-border/60 bg-card/60 hover:bg-card/90 backdrop-blur-sm hover:border-primary/35 hover:-translate-y-1 shadow-xs hover:shadow-lg active:scale-[0.99] cursor-pointer"
              }`}
            >
              <div
                className={`p-2.5 rounded-xl border flex-shrink-0 transition-transform duration-200 ${
                  disabled ? "grayscale opacity-60" : "group-hover:scale-110"
                } ${action.colorClass}`}
              >
                <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className={`text-xs sm:text-sm font-semibold truncate transition-colors ${
                      disabled
                        ? "text-muted-foreground"
                        : "text-foreground group-hover:text-primary"
                    }`}
                  >
                    {action.title}
                  </span>
                </div>
                {/* Badge chip */}
                <span
                  className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md mb-1 ${
                    disabled
                      ? "opacity-40 bg-muted text-muted-foreground"
                      : `${action.colorClass} opacity-80`
                  }`}
                >
                  {action.badge}
                </span>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug line-clamp-2">
                  {action.subtitle}
                </p>
              </div>

              {!disabled && (
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all absolute top-3 right-3" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
