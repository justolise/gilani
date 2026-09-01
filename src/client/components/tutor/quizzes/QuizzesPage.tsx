import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/client/supabase";
import { GilaniLoader } from "@/client/components/GilaniLoader";
import { Plus, Brain, Search } from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/shared/utils/async";
import { AppHeader } from "@/client/components/layout/AppHeader";
import { generateQuizFn, getQuizFormOptionsFn, deleteQuizFn } from "@/fns/quiz.server-fns";
import { ConfirmDialog } from "@/client/components/shared/ConfirmDialog";
import { QuizAddModal } from "./QuizAddModal";
import { QuizCard } from "./QuizCard";

const PAGE_SIZE = 10;

export function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("mixed");
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
          setDifficulty(difficulties[difficulties.length - 1] || "medium");
        }
        if (questionCount > maxQuestions) {
          setQuestionCount(maxQuestions);
        }
      } catch (err) {
        console.error("Failed to load quiz options:", err);
      }
    })();
  }, []);

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
      toast.error(friendlyError(err, "Couldn't delete this quiz. Please try again."));
    } finally {
      setDeletingId(null);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic to quiz yourself on");
      return;
    }
    setGenerating(true);
    try {
      const result = await generateQuizFn({
        data: { topic: topic.trim(), difficulty: difficulty as any, questionCount },
      } as any);
      toast.success("Quiz ready!");
      setShowForm(false);
      setTopic("");
      navigate({ to: "/tutor/quizzes/$quizId", params: { quizId: (result as any).quizId } });
    } catch (err: any) {
      toast.error(friendlyError(err, "Couldn't generate your quiz. Please try again."));
    } finally {
      setGenerating(false);
    }
  };

  if (loading && quizzes.length === 0)
    return (
      <div className="h-full flex flex-col">
        <AppHeader
          title="Practice Quizzes"
          subtitle="Test your recall and master difficult topics"
        />
        <div className="flex-1 flex items-center justify-center">
          <GilaniLoader />
        </div>
      </div>
    );

  return (
    <div className="h-full flex flex-col bg-background">
      <AppHeader
        title="Practice Quizzes"
        subtitle={
          quizzes.length > 0
            ? `${quizzes.length} quiz${quizzes.length !== 1 ? "zes" : ""}`
            : "Test your recall"
        }
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Quiz
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <QuizAddModal
            show={showForm}
            onClose={() => setShowForm(false)}
            topic={topic}
            onTopicChange={setTopic}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            questionCount={questionCount}
            onQuestionCountChange={setQuestionCount}
            generating={generating}
            onGenerate={handleGenerate}
            formOptions={formOptions}
          />

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search quizzes by topic..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {quizzes.length === 0 && !showForm ? (
            <div className="text-center py-16 px-4">
              <Brain className="h-12 w-12 text-primary/40 mx-auto mb-3" />
              <h3 className="font-serif text-xl text-foreground font-semibold mb-2">
                No practice quizzes yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                Generate an AI-powered quiz on any topic to test yourself with instant grading and
                explanations.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Generate your first quiz
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                    className="px-5 py-2.5 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {loadingMore ? "Loading more…" : "Load more quizzes"}
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
