import { useEffect, useState } from "react";
import { supabase } from "@/client/supabase";
import { GilaniLoader } from "@/client/components/GilaniLoader";
import { Plus, ChevronDown, ChevronUp, Trash2, LayoutList, LayoutGrid, Clock } from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/shared/utils/async";
import { AppHeader } from "@/client/components/layout/AppHeader";
import { MarkdownRenderer } from "@/client/components/tutor/MarkdownRenderer";
import {
  generateStudyPlanFn,
  toggleStudyPlanItemFn,
  deleteStudyPlanFn,
  getPlannerFormOptionsFn,
  type StudyPlanItem,
} from "@/fns/planner.server-fns";
import { PomodoroTimer } from "@/client/components/tutor/PomodoroTimer";
import { ConfirmDialog } from "@/client/components/shared/ConfirmDialog";
import { PlannerWeekView } from "@/client/components/tutor/planner/PlannerWeekView";
import { PlannerItemRow } from "@/client/components/tutor/planner/PlannerItemRow";
import { PlannerAddModal } from "@/client/components/tutor/planner/PlannerAddModal";

function groupByDate(items: StudyPlanItem[]): Record<string, StudyPlanItem[]> {
  return items.reduce((acc: Record<string, StudyPlanItem[]>, item) => {
    (acc[item.date] ??= []).push(item);
    return acc;
  }, {});
}

export function PlannerPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formOptions, setFormOptions] = useState<{
    plannersUsedToday: number;
    plannersMaxToday: number;
    weakTopics: string[];
  } | null>(null);
  const [activeTask, setActiveTask] = useState<{ planId: string; itemId: string } | null>(null);
  const [timerOpen, setTimerOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "week">("list");

  const fetchPlans = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("study_plans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPlans(data || []);
    } catch (err: any) {
      toast.error(friendlyError(err, "Failed to load your study plans."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    (async () => {
      try {
        const opts = await getPlannerFormOptionsFn();
        setFormOptions(opts as any);
      } catch (err) {
        console.error("Failed to load planner options:", err);
      }
    })();
  }, []);

  const handleGenerate = async ({
    examName,
    examDate,
    subjects,
    hoursPerDay,
  }: {
    examName: string;
    examDate?: string;
    subjects: string;
    hoursPerDay: number;
  }): Promise<void> => {
    if (!examName.trim()) {
      toast.error("Please enter an exam or goal name.");
      return;
    }
    if (!subjects.trim()) {
      toast.error("Please list the subjects/topics to cover.");
      return;
    }
    setGenerating(true);
    try {
      await generateStudyPlanFn({
        data: {
          examName: examName.trim(),
          examDate: examDate || undefined,
          subjects: subjects.trim(),
          hoursPerDay,
        },
      } as any);
      toast.success("Study plan ready!");
      setShowForm(false);
      await fetchPlans();
    } catch (err: any) {
      toast.error(friendlyError(err, "Couldn't generate your study plan. Please try again."));
    } finally {
      setGenerating(false);
    }
  };

  const startFocusSession = (planId: string, itemId: string, durationMinutes: number) => {
    setActiveTask({ planId, itemId });
    setTimerOpen(true);
  };

  const handleStudyComplete = async () => {
    if (!activeTask) return;
    const { planId, itemId } = activeTask;
    const plan = plans.find((p) => p.id === planId);
    const item = plan?.items?.find((it: StudyPlanItem) => it.id === itemId);
    if (item && !item.completed) {
      await handleToggleItem(planId, itemId);
      toast.success("Focus session complete — task marked done!", {
        action: { label: "Undo", onClick: () => handleToggleItem(planId, itemId) },
      });
    }
  };

  const handleToggleItem = async (planId: string, itemId: string) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? {
              ...p,
              items: (p.items as StudyPlanItem[]).map((it) =>
                it.id === itemId ? { ...it, completed: !it.completed } : it,
              ),
            }
          : p,
      ),
    );
    try {
      await toggleStudyPlanItemFn({ data: { planId, itemId } } as any);
    } catch {
      toast.error("Failed to update task — reverting.");
      fetchPlans();
    }
  };

  const handleDeletePlan = async (planId: string) => {
    setDeletingId(planId);
    setConfirmDeleteId(null);
    try {
      await deleteStudyPlanFn({ data: { planId } } as any);
      setPlans((prev) => prev.filter((p) => p.id !== planId));
      toast.success("Plan deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete plan");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading)
    return (
      <div className="h-full flex flex-col">
        <AppHeader title="Study Planner" subtitle="Organize your sessions and track goals" />
        <div className="flex-1 flex items-center justify-center">
          <GilaniLoader />
        </div>
      </div>
    );

  return (
    <div className="h-full flex flex-col bg-background">
      <AppHeader
        title="Study Planner"
        subtitle={
          plans.length > 0
            ? `${plans.length} plan${plans.length !== 1 ? "s" : ""}`
            : "Organize your goals"
        }
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Plan
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {showForm && (
            <PlannerAddModal
              formOptions={formOptions}
              generating={generating}
              onClose={() => setShowForm(false)}
              onGenerate={handleGenerate}
            />
          )}

          {plans.length === 0 && !showForm ? (
            <div className="text-center py-16 px-4">
              <h3 className="font-serif text-xl text-foreground font-semibold mb-2">
                No study plans yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                Tell us your exam date and subjects, and we'll generate a personalized, day-by-day
                study plan.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Create your first plan
              </button>
            </div>
          ) : (
            plans.map((plan) => {
              const items: StudyPlanItem[] = plan.items || [];
              const completedCount = items.filter((i) => i.completed).length;
              const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;
              const isExpanded = expanded === plan.id;
              const grouped = groupByDate(items);
              const sortedDates = Object.keys(grouped).sort();

              return (
                <div
                  key={plan.id}
                  className="border border-border bg-card rounded-2xl shadow-xs overflow-hidden transition-all"
                >
                  <div
                    onClick={() => setExpanded(isExpanded ? null : plan.id)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground truncate">{plan.title}</h4>
                        {plan.exam_date && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                            Exam: {plan.exam_date}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 max-w-48 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          {completedCount}/{items.length} tasks ({Math.round(progress)}%)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(plan.id);
                        }}
                        disabled={deletingId === plan.id}
                        className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        title="Delete plan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border p-4 sm:p-5 space-y-4 bg-muted/10">
                      {plan.overview && (
                        <div className="text-xs text-muted-foreground prose prose-sm dark:prose-invert max-w-none bg-background/50 p-3 rounded-xl border border-border/50">
                          <MarkdownRenderer content={plan.overview} />
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setViewMode("list")}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            viewMode === "list"
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <LayoutList className="h-3.5 w-3.5" />
                          List
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode("week")}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            viewMode === "week"
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <LayoutGrid className="h-3.5 w-3.5" />
                          Week
                        </button>
                      </div>

                      {viewMode === "week" ? (
                        <PlannerWeekView
                          items={items}
                          onToggleItem={(itemId) => handleToggleItem(plan.id, itemId)}
                          onStartFocus={(itemId, duration) =>
                            startFocusSession(plan.id, itemId, duration)
                          }
                        />
                      ) : (
                        <div className="space-y-4">
                          {sortedDates.map((date) => (
                            <div key={date} className="space-y-2.5">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                {new Date(date + "T00:00:00").toLocaleDateString(undefined, {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </h4>
                              <div className="space-y-2">
                                {grouped[date].map((item) => (
                                  <PlannerItemRow
                                    key={item.id}
                                    planId={plan.id}
                                    item={item}
                                    onToggleItem={handleToggleItem}
                                    onStartFocusSession={startFocusSession}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <PomodoroTimer
        open={timerOpen}
        onOpenChange={setTimerOpen}
        showTrigger={false}
        initialMinutes={
          activeTask
            ? plans
                .find((p) => p.id === activeTask.planId)
                ?.items?.find((it: StudyPlanItem) => it.id === activeTask.itemId)?.durationMinutes
            : undefined
        }
        onStudyComplete={handleStudyComplete}
      />

      {confirmDeleteId && (
        <ConfirmDialog
          title="Delete this study plan?"
          description="This will permanently remove the plan and all its tasks, including completion history. This can't be undone."
          confirmLabel="Delete"
          busy={deletingId === confirmDeleteId}
          onConfirm={() => handleDeletePlan(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
