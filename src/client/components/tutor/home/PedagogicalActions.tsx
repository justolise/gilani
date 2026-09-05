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
}

export function PedagogicalActions({ onSelectAction, className = "" }: PedagogicalActionsProps) {
  return (
    <div className={`w-full max-w-3xl ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {PEDAGOGICAL_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onSelectAction(action.prompt)}
              className="group relative flex items-start gap-3 p-3 sm:p-3.5 rounded-xl border border-border/50 bg-card/60 hover:bg-card hover:border-primary/30 transition-all duration-200 text-left shadow-xs hover:shadow-md active:scale-[0.99] cursor-pointer"
            >
              <div
                className={`p-2 rounded-lg border flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${action.colorClass}`}
              >
                <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {action.title}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug line-clamp-2">
                  {action.subtitle}
                </p>
              </div>

              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all absolute top-3 right-3" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
