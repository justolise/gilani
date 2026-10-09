import { Trophy, RotateCcw, CheckCircle2, XCircle, ArrowLeft, Sparkles, Award } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { setPendingMessage } from "@/shared/utils/pending-message";
import type { QuizQuestion } from "@/fns/quiz.server-fns";
import { MarkdownRenderer } from "@/client/components/tutor/MarkdownRenderer";

interface AnsweredQuestion {
  question: QuizQuestion;
  selectedIndex: number;
  correct: boolean;
}

interface QuizResultSummaryProps {
  answered: AnsweredQuestion[];
  onRetryAll: () => void;
  onRetryMissed: () => void;
  onExit: () => void;
  /** "test" mode shows every question's correctness (full review); "practice" (default) shows only missed ones. */
  mode?: "practice" | "test";
}

export function QuizResultSummary({
  answered,
  onRetryAll,
  onRetryMissed,
  onExit,
  mode = "practice",
}: QuizResultSummaryProps) {
  const total = answered.length;
  const correctCount = answered.filter((a) => a.correct).length;
  const score = Math.round((correctCount / Math.max(1, total)) * 100);
  const missed = answered.filter((a) => !a.correct);
  const reviewList = mode === "test" ? answered : missed;

  const navigate = useNavigate();
  const scoreColor =
    score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-500";

  return (
    <div className="space-y-8 max-w-2xl mx-auto animate-in fade-in duration-300">
      <div className="text-center space-y-3">
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center my-2">
          <svg
            className="w-full h-full -rotate-90 transform"
            viewBox="0 0 110 110"
            aria-hidden="true"
          >
            <circle
              cx="55"
              cy="55"
              r="45"
              className="text-muted/30"
              strokeWidth="7"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="55"
              cy="55"
              r="45"
              className={`score-ring-circle ${scoreColor}`}
              strokeWidth="7"
              strokeDasharray={283}
              strokeDashoffset={283 - (283 * Math.min(100, Math.max(0, score))) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-black ${scoreColor}`}>{score}%</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Score
            </span>
          </div>
          {score >= 80 && (
            <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-md animate-bounce">
              <Sparkles className="h-4 w-4" />
            </span>
          )}
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
          Quiz Complete!
        </h2>
        {score >= 80 ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <Award className="h-3.5 w-3.5" />
            <span>Mastery Achieved! Outstanding recall</span>
          </div>
        ) : null}
        <p className="text-sm text-muted-foreground font-medium">
          {correctCount} out of {total} correct
        </p>
      </div>

      {reviewList.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">
            {mode === "test" ? "Answer Review" : "Review what you missed"}
          </h3>
          {reviewList.map((a, i) => (
            <div key={i} className="p-4 rounded-2xl border border-border bg-card space-y-2">
              <div className="flex items-start gap-2">
                {a.correct ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                )}
                <div className="font-medium text-sm text-foreground [&>p]:m-0">
                  <MarkdownRenderer content={a.question.question} />
                </div>
              </div>
              {!a.correct && (
                <p className="text-xs text-muted-foreground pl-6">
                  Correct answer:{" "}
                  <span className="font-medium text-emerald-500">
                    <span className="[&>p]:inline [&>p]:m-0">
                      <MarkdownRenderer content={a.question.options[a.question.correctIndex]} />
                    </span>
                  </span>
                </p>
              )}
              <div className="text-sm text-foreground/80 pl-6 [&>p]:m-0">
                <MarkdownRenderer content={a.question.explanation} />
              </div>
              {!a.correct && (
                <div className="pt-2 pl-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const optionsList = a.question.options
                        .map((o, idx) => `${idx + 1}. ${o}`)
                        .join("\n");
                      const prompt = `I recently took a quiz on this question: "${a.question.question}". The options were:\n${optionsList}\nThe correct answer is "${a.question.options[a.question.correctIndex]}". Please teach me how to solve questions like this and explain why the key concepts matter.`;
                      const id = crypto.randomUUID();
                      setPendingMessage(id, {
                        finalMessage: prompt,
                        titleSeedText: `Revision: ${a.question.question.slice(0, 30)}`,
                      });
                      navigate({ to: "/tutor/$threadId", params: { threadId: id } } as any);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/25 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Explain with Tutor</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 justify-center text-emerald-500 font-medium">
          <CheckCircle2 className="h-5 w-5" />
          Perfect score! You nailed every question.
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {missed.length > 0 && (
          <button
            onClick={onRetryMissed}
            className="flex-1 flex items-center justify-center gap-2 bg-primary/10 text-primary px-4 py-3 rounded-xl font-medium hover:bg-primary/20 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Retry Missed ({missed.length})
          </button>
        )}
        <button
          onClick={onRetryAll}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <RotateCcw className="h-4 w-4" />
          Retry Full Quiz
        </button>
        <button
          onClick={onExit}
          className="flex-1 flex items-center justify-center gap-2 border border-border px-4 py-3 rounded-xl font-medium hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Quizzes
        </button>
      </div>
    </div>
  );
}
