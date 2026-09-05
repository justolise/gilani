import React from "react";
import { getCurriculumConfig, type CurriculumSubject } from "@/shared/constants/curricula";
import { BookOpen, Sparkles } from "lucide-react";

interface CurriculumSubjectBarProps {
  curriculum?: string | null;
  onSelectSubjectPrompt: (prompt: string) => void;
  className?: string;
}

export function CurriculumSubjectBar({
  curriculum,
  onSelectSubjectPrompt,
  className = "",
}: CurriculumSubjectBarProps) {
  const config = getCurriculumConfig(curriculum);

  return (
    <div className={`w-full flex flex-col items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-primary/70" />
        <span>Subjects in {config.label}</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-2xl px-2">
        {config.subjects.map((subj: CurriculumSubject) => (
          <button
            key={subj.id}
            type="button"
            onClick={() => onSelectSubjectPrompt(subj.starterPrompt)}
            className="group inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/80 hover:bg-primary/5 hover:border-primary/40 px-3 py-1.5 text-xs font-medium text-foreground/80 hover:text-foreground transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
            title={`Start a session for ${subj.name}`}
          >
            <BookOpen className="w-3 h-3 text-muted-foreground/60 group-hover:text-primary transition-colors" />
            <span>{subj.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
