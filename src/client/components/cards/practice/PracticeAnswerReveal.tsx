import React from "react";
import { Lightbulb, RotateCcw, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { sendChatMessageToTutor } from "./PracticeScratchpad";

interface PracticeAnswerRevealProps {
  answer: React.ReactNode;
  showAnswer: boolean;
  userDraft?: string;
  selfAssessment: "correct" | "partial" | "review" | null;
  onShowAnswer: () => void;
  onReset: () => void;
  onSelfAssessment: (type: "correct" | "partial" | "review") => void;
  questionNumber?: number;
  questionText?: string;
}

export function PracticeAnswerReveal({
  answer,
  showAnswer,
  userDraft,
  selfAssessment,
  onShowAnswer,
  onReset,
  onSelfAssessment,
  questionNumber,
  questionText,
}: PracticeAnswerRevealProps) {
  if (!answer) {
    return (
      <div className="border-t border-border/40 px-4 sm:px-5 py-3 bg-muted/10">
        <button
          type="button"
          onClick={() => {
            const qNum =
              questionNumber != null
                ? `Practice Question ${questionNumber}`
                : "this practice question";
            const qSnippet = questionText ? `:\n\n"${questionText.trim()}"` : "";
            const prompt = `Could you please provide the complete, step-by-step worked solution and explanation for ${qNum}${qSnippet}?`;
            sendChatMessageToTutor(prompt);
            toast.success("Solution requested from tutor!");
          }}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20 transition-all active:scale-99 shadow-xs cursor-pointer"
        >
          <Lightbulb className="h-4 w-4" />
          Ask Tutor for Worked Solution
        </button>
      </div>
    );
  }

  if (!showAnswer) {
    return (
      <div className="border-t border-border/40 px-4 sm:px-5 py-3 bg-muted/10">
        <button
          type="button"
          onClick={onShowAnswer}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20 transition-all active:scale-99 shadow-xs cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          Show Worked Solution
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-primary/20 bg-primary/5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-b border-primary/15 bg-primary/10">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Worked Solution & Explanation
          </span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Reset practice card"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      {userDraft && (
        <div className="mx-4 sm:mx-5 mt-3 p-3 rounded-xl border border-border bg-card/60 text-xs">
          <div className="font-semibold text-muted-foreground mb-1">Your Attempt:</div>
          <div className="text-foreground whitespace-pre-wrap">{userDraft}</div>
        </div>
      )}

      <div className="p-4 sm:p-5 text-[15px] sm:text-base text-foreground leading-relaxed">
        {answer}
      </div>

      <div className="px-4 sm:px-5 pb-4 pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-primary/10">
        <span className="text-xs font-medium text-muted-foreground">How did you do?</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSelfAssessment("correct")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              selfAssessment === "correct"
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
                : "bg-background hover:bg-emerald-500/10 border-border text-foreground hover:text-emerald-600"
            }`}
          >
            <Check className="h-3 w-3" />
            Got it right
          </button>
          <button
            type="button"
            onClick={() => onSelfAssessment("partial")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              selfAssessment === "partial"
                ? "bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400 font-bold"
                : "bg-background hover:bg-amber-500/10 border-border text-foreground hover:text-amber-600"
            }`}
          >
            Partially
          </button>
          <button
            type="button"
            onClick={() => onSelfAssessment("review")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              selfAssessment === "review"
                ? "bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400 font-bold"
                : "bg-background hover:bg-rose-500/10 border-border text-foreground hover:text-rose-600"
            }`}
          >
            Need practice
          </button>
        </div>
      </div>
    </div>
  );
}
