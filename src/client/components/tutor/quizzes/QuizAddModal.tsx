import { Sparkles, X, Loader2 } from "lucide-react";

export function QuizAddModal({
  show,
  onClose,
  topic,
  onTopicChange,
  difficulty,
  onDifficultyChange,
  questionCount,
  onQuestionCountChange,
  generating,
  onGenerate,
  formOptions,
}: {
  show: boolean;
  onClose: () => void;
  topic: string;
  onTopicChange: (val: string) => void;
  difficulty: string;
  onDifficultyChange: (val: string) => void;
  questionCount: number;
  onQuestionCountChange: (val: number) => void;
  generating: boolean;
  onGenerate: () => void;
  formOptions: {
    maxQuestions: number;
    difficulties: string[];
    quizzesUsedToday: number;
    quizzesMaxToday: number;
  } | null;
}) {
  if (!show) return null;

  return (
    <div className="border border-border bg-card rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Generate New Quiz
          </h3>
          {formOptions && formOptions.quizzesMaxToday < 999_999 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {formOptions.quizzesUsedToday}/{formOptions.quizzesMaxToday} quizzes generated today
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Topic or Subject</label>
        <input
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          placeholder="e.g. Photosynthesis, Quadratic Equations, KCSE History Form 3"
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 capitalize"
          >
            {(formOptions?.difficulties ?? ["easy", "medium", "hard", "mixed"]).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Questions: <span className="text-primary font-semibold">{questionCount}</span>
          </label>
          <input
            type="range"
            min={4}
            max={formOptions?.maxQuestions ?? 15}
            step={1}
            value={questionCount}
            onChange={(e) => onQuestionCountChange(parseInt(e.target.value))}
            className="w-full accent-primary mt-2"
          />
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={generating}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
      >
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating your quiz questions…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Quiz
          </>
        )}
      </button>
    </div>
  );
}
