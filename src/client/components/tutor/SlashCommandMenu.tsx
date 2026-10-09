import React, { useEffect, useState } from "react";
import { BookOpen, Brain, Calculator, FileText, Sparkles, Lightbulb } from "lucide-react";

export interface SlashCommand {
  key: string;
  label: string;
  description: string;
  promptPrefix: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    key: "explain",
    label: "/explain",
    description: "Break down concept with analogies & step-by-step intuition",
    promptPrefix: "Explain the concept of ",
    icon: BookOpen,
  },
  {
    key: "quiz",
    label: "/quiz",
    description: "Generate practice questions with multiple choice options",
    promptPrefix: "Create a 5-question practice quiz on ",
    icon: Brain,
  },
  {
    key: "solve",
    label: "/solve",
    description: "Work through a problem step-by-step with formulas",
    promptPrefix: "Solve this problem step-by-step: ",
    icon: Calculator,
  },
  {
    key: "summary",
    label: "/summary",
    description: "Summarize into key takeaways, formulas & revision notes",
    promptPrefix: "Provide a comprehensive study summary with key formulas for ",
    icon: FileText,
  },
  {
    key: "flashcards",
    label: "/flashcards",
    description: "Create memory recall flashcards for active study",
    promptPrefix: "Generate 5 high-yield study flashcards for ",
    icon: Sparkles,
  },
  {
    key: "eli5",
    label: "/eli5",
    description: "Explain like I'm 5 with ultra-simple analogies",
    promptPrefix: "Explain like I'm 5 years old: ",
    icon: Lightbulb,
  },
];

interface SlashCommandMenuProps {
  filter: string;
  onSelect: (command: SlashCommand) => void;
  onClose: () => void;
  selectedIndex: number;
  setSelectedIndex: (idx: number) => void;
}

export function SlashCommandMenu({
  filter,
  onSelect,
  onClose,
  selectedIndex,
  setSelectedIndex,
}: SlashCommandMenuProps) {
  const query = filter.replace(/^\//, "").toLowerCase().trim();

  const filtered = SLASH_COMMANDS.filter(
    (cmd) => cmd.key.toLowerCase().includes(query) || cmd.description.toLowerCase().includes(query),
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [filter, setSelectedIndex]);

  if (filtered.length === 0) return null;

  return (
    <div className="absolute bottom-full mb-2 left-0 right-0 max-w-xl mx-auto rounded-2xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="px-3 py-1.5 flex items-center justify-between border-b border-border/40 text-[11px] font-mono text-muted-foreground select-none">
        <span className="font-semibold text-primary">Slash Commands</span>
        <span>↑↓ Navigate · Tab/↵ Select · Esc Close</span>
      </div>

      <div className="max-h-56 overflow-y-auto space-y-0.5 p-1">
        {filtered.map((cmd, idx) => {
          const Icon = cmd.icon;
          const isSelected = idx === selectedIndex;

          return (
            <button
              key={cmd.key}
              type="button"
              onClick={() => onSelect(cmd)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                isSelected ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-mono font-semibold truncate">{cmd.label}</p>
                <p className="text-xs text-muted-foreground truncate">{cmd.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
