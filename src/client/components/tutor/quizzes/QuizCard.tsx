import { Link } from "@tanstack/react-router";
import { Brain, Calendar, CheckCircle2, Trash2 } from "lucide-react";

export function QuizCard({
  quiz,
  deletingId,
  onDeleteRequest,
}: {
  quiz: any;
  deletingId: string | null;
  onDeleteRequest: (id: string) => void;
}) {
  const attempts = quiz.quiz_attempts || [];
  const latestAttempt = attempts[attempts.length - 1];
  const questionCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
  const isDeleting = deletingId === quiz.id;

  return (
    <div
      className={`group relative rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between ${
        isDeleting ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                quiz.difficulty === "easy"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : quiz.difficulty === "hard"
                    ? "bg-red-500/10 text-red-500"
                    : "bg-amber-500/10 text-amber-500"
              }`}
            >
              {quiz.difficulty}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {questionCount} question{questionCount !== 1 ? "s" : ""}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDeleteRequest(quiz.id);
            }}
            disabled={isDeleting}
            className="text-muted-foreground/40 hover:text-destructive transition-colors p-1 rounded-lg hover:bg-destructive/10 cursor-pointer"
            title="Delete quiz"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <Link
          to={"/tutor/quizzes/$quizId"}
          params={{ quizId: quiz.id }}
          className="block group-hover:text-primary transition-colors"
        >
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2 leading-snug">
            {quiz.topic}
          </h3>
        </Link>
      </div>

      <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <Calendar className="h-3 w-3" />
          {new Date(quiz.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </div>

        {latestAttempt ? (
          <div className="flex items-center gap-1 font-semibold text-emerald-500">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{Math.round(latestAttempt.score)}%</span>
          </div>
        ) : (
          <span className="text-muted-foreground/60 italic text-[11px]">Not attempted</span>
        )}
      </div>
    </div>
  );
}
