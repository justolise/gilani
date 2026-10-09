import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { setPendingMessage } from "@/shared/utils/pending-message";
import { Sparkles } from "lucide-react";
import { Lightbulb } from "lucide-react";
import { QuizOptionButton, type QuizOptionState } from "./QuizOptionButton";
import { MarkdownRenderer } from "@/client/components/tutor/MarkdownRenderer";
import type { QuizQuestion } from "@/fns/quiz.server-fns";

interface QuizQuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  onAnswer: (selectedIndex: number, correct: boolean) => void;
  /** "practice" reveals correctness + explanation immediately (default). "test" hides both until results. */
  mode?: "practice" | "test";
}

export function QuizQuestionCard({
  question,
  questionNumber,
  onAnswer,
  mode = "practice",
}: QuizQuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    onAnswer(index, index === question.correctIndex);
  };

  useEffect(() => {
    if (selected !== null) return;

    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const key = e.key.toLowerCase();
      let chosen: number | null = null;
      if (key === "1" || key === "a") chosen = 0;
      else if (key === "2" || key === "b") chosen = 1;
      else if (key === "3" || key === "c") chosen = 2;
      else if (key === "4" || key === "d") chosen = 3;

      if (chosen !== null && chosen < question.options.length) {
        e.preventDefault();
        handleSelect(chosen);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selected, question.options.length]);

  const getState = (index: number): QuizOptionState => {
    if (mode === "test") {
      if (selected === null) return "default";
      return index === selected ? "selected" : "locked";
    }
    if (selected === null) return "default";
    if (index === selected && index === question.correctIndex) return "selected-correct";
    if (index === selected) return "selected-incorrect";
    if (index === question.correctIndex) return "reveal-correct";
    return "disabled";
  };

  const isCorrect = selected !== null && selected === question.correctIndex;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
        Question {questionNumber}
        <span className="px-2 py-0.5 bg-muted rounded text-muted-foreground normal-case font-medium">
          {question.difficulty}
        </span>
      </div>
      <div className="text-xl font-bold text-foreground leading-snug [&>p]:m-0 [&>p]:text-xl [&>p]:font-bold [&>p]:text-foreground [&>p]:leading-snug">
        <MarkdownRenderer content={question.question} />
      </div>
      <div className="space-y-3">
        {question.options.map((opt, i) => (
          <QuizOptionButton
            key={i}
            label={opt}
            index={i}
            state={getState(i)}
            onClick={() => handleSelect(i)}
          />
        ))}
      </div>
      {selected !== null && mode === "practice" && (
        <div
          className={`p-4 rounded-2xl border ${
            isCorrect
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-amber-500/10 border-amber-500/30"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <Lightbulb className="h-4 w-4" />
              {isCorrect ? "Correct! Here's why:" : "Not quite — here's the explanation:"}
            </div>
            {!isCorrect && (
              <button
                type="button"
                onClick={() => {
                  const prompt = `I am practicing a quiz question: "${question.question}". I answered "${question.options[selected]}" but the correct answer is "${question.options[question.correctIndex]}". Why is my answer incorrect, and how should I think through this concept?`;
                  const id = crypto.randomUUID();
                  setPendingMessage(id, {
                    finalMessage: prompt,
                    titleSeedText: `Quiz: ${question.question.slice(0, 30)}`,
                  });
                  navigate({ to: "/tutor/$threadId", params: { threadId: id } } as any);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ask AI Tutor to Explain</span>
              </button>
            )}
          </div>
          <div className="text-sm text-foreground/90">
            <MarkdownRenderer content={question.explanation} />
          </div>
        </div>
      )}
    </div>
  );
}
