import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/client/supabase";
import { GilaniLoader } from "@/client/components/GilaniLoader";
import { Plus, Brain, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/shared/utils/async";
import { AppHeader } from "@/client/components/layout/AppHeader";
import { generateQuizFn, getQuizFormOptionsFn, deleteQuizFn } from "@/fns/quiz.server-fns";
import { ConfirmDialog } from "@/client/components/shared/ConfirmDialog";
import { QuizAddModal } from "./QuizAddModal";
import { QuizCard } from "./QuizCard";
import { QuizzesSkeleton } from "./QuizzesSkeleton";

const PAGE_SIZE = 10;

export function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("mixed");
  const [questionCount, setQuestionCount] = useState(8);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [formOptions, setFormOptions] = useState<{
    maxQuestions: number;
    difficulties: string[];
    quizzesUsedToday: number;
    quizzesMaxToday: number;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const opts = await getQuizFormOptionsFn();
        const difficulties = (opts as any).difficulties as string[];
        const maxQuestions = (opts as any).maxQuestions as number;
        const quizzesUsedToday = (opts as any).quizzesUsedToday as number;
        const quizzesMaxToday = (opts as any).quizzesMaxToday as number;
        setFormOptions({ maxQuestions, difficulties, quizzesUsedToday, quizzesMaxToday });
        if (!difficulties.includes(difficulty)) {
          setDifficulty((difficulties[difficulties.length - 1] as any) || "medium");
        }
        if (questionCount > maxQuestions) {
          setQuestionCount(maxQuestions);
        }
      } catch (err) {
        console.error("Failed to load quiz options:", err);
      }
    })();
  }, [difficulty, questionCount]);

  const fetchQuizzes = async (searchTerm: string, page: number, append: boolean) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      let query = supabase
        .from("quizzes")
        .select("id, topic, difficulty, questions, created_at, quiz_attempts(score)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      if (searchTerm.trim()) {
        query = query.ilike("topic", `%${searchTerm.trim()}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      const results = data || [];
      setQuizzes((prev) => (append ? [...prev, ...results] : results));
      setHasMore(results.length === PAGE_SIZE);
    } catch (err: any) {
      toast.error(friendlyError(err, "Failed to load your quizzes."));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchQuizzes("", 0, false);
  }, []);

  const onSearchChange = (value: string) => {
    setSearch(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setLoading(true);
      fetchQuizzes(value, 0, false);
    }, 350);
  };

  const onLoadMore = () => {
    setLoadingMore(true);
    fetchQuizzes(search, Math.floor(quizzes.length / PAGE_SIZE), true);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    setGenerating(true);
    try {
      const quiz = await generateQuizFn({
        data: {
          topic: topic.trim(),
          difficulty,
          questionCount,
        },
      });
      setShowForm(false);
      setTopic("");
      toast.success("Quiz generated! Good luck!");
      navigate({ to: `/tutor/quizzes/${quiz.id}` as any });
    } catch (err: any) {
      toast.error(friendlyError(err, "Failed to generate quiz."));
    } finally {
      setGenerating(false);
    }
  };

  const onConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      await deleteQuizFn({ data: { quizId: id } });
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
      toast.success("Quiz deleted");
    } catch (err: any) {
      toast.error(friendlyError(err, "Failed to delete quiz."));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && quizzes.length === 0)
    return (
      <div className="h-full flex flex-col bg-background">
        <AppHeader
          title="Practice Quizzes"
          subtitle="Loading practice quizzes…"
          actions={
            <button
              disabled
              className="flex items-center justify-center gap-2 bg-primary/60 text-primary-foreground px-4 py-2 rounded-2xl text-sm font-semibold min-h-11 opacity-75 cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              New Quiz
            </button>
          }
        />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            <QuizzesSkeleton />
          </div>
        </div>
      </div>
    );

  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      <AppHeader
        title="Practice Quizzes"
        subtitle={
          quizzes.length > 0
            ? `${quizzes.length} quiz${quizzes.length !== 1 ? "zes" : ""}`
            : "Active recall practice"
        }
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold shadow-xs hover:bg-primary/90 transition-all active:scale-95 cursor-pointer min-h-11"
          >
            <Plus className="h-4 w-4" />
            <span>New Quiz</span>
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <QuizAddModal
            show={showForm}
            onClose={() => setShowForm(false)}
            topic={topic}
            onTopicChange={setTopic}
            difficulty={difficulty}
            onDifficultyChange={(val) => setDifficulty(val as any)}
            questionCount={questionCount}
            onQuestionCountChange={setQuestionCount}
            generating={generating}
            onGenerate={handleGenerate}
            formOptions={formOptions}
          />

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search quizzes by syllabus subject or topic..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border/70 bg-card/70 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60 transition-all backdrop-blur-md shadow-xs"
            />
          </div>

          {quizzes.length === 0 && !showForm ? (
            <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center border border-dashed border-border/70 rounded-3xl bg-card/30 mt-6 space-y-4">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Brain className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground font-display">
                  No practice quizzes yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 leading-relaxed">
                  Generate adaptive, syllabus-aligned questions on any subject. Practice with
                  immediate feedback and detailed step-by-step explanations.
                </p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:bg-primary/90 transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                Generate your first quiz
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5">
                {quizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    deletingId={deletingId}
                    onDeleteRequest={setConfirmDeleteId}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="text-center pt-4">
                  <button
                    onClick={onLoadMore}
                    disabled={loadingMore}
                    className="px-6 py-2.5 rounded-2xl border border-border/70 bg-card text-xs sm:text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all disabled:opacity-50 cursor-pointer min-h-11"
                  >
                    {loadingMore ? "Loading more quizzes…" : "Load more quizzes"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {confirmDeleteId && (
        <ConfirmDialog
          title="Delete this quiz?"
          description="This will permanently delete the quiz and any recorded score attempts. This action cannot be undone."
          confirmLabel="Delete Quiz"
          onConfirm={onConfirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
