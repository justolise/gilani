import { useEffect, useState } from "react";
import { supabase } from "@/client/supabase";
import { GilaniLoader } from "@/client/components/GilaniLoader";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  LayoutList,
  LayoutGrid,
  Clock,
  Calendar,
  Sparkles,
} from "lucide-react";
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
import { PlannerSkeleton } from "./PlannerSkeleton";

function getPlanItems(plan: any): StudyPlanItem[] {
  if (!plan) return [];
  const raw = plan.items;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
}

function formatPlanDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function groupByDate(items: StudyPlanItem[]): Record<string, StudyPlanItem[]> {
  if (!Array.isArray(items)) return {};
  return items.reduce((acc: Record<string, StudyPlanItem[]>, item) => {
    if (!item || typeof item !== "object") return acc;
    const key = item.date || "General";
    (acc[key] ??= []).push(item);
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

  const handleGenerate = async (data: {
    examName: string;
    examDate?: string;
    subjects: string;
    hoursPerDay: number;
  }) => {
    setGenerating(true);
    try {
      const newPlan = await generateStudyPlanFn({ data });
      setShowForm(false);
      setPlans((prev) => [newPlan, ...prev]);
      setExpanded(newPlan.id);
      toast.success("Study plan generated!");
    } catch (err: any) {
      toast.error(friendlyError(err, "Failed to generate study plan."));
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleItem = async (planId: string, itemId: string) => {
    try {
      const plan = plans.find((p) => p.id === planId);
      if (!plan) return;
      const items = getPlanItems(plan);
      const target = items.find((i) => i.id === itemId);
      if (!target) return;

      const newCompleted = !target.completed;

      // Optimistic update
      setPlans((prev) =>
        prev.map((p) => {
          if (p.id !== planId) return p;
          const currentItems = getPlanItems(p);
          const updated = currentItems.map((item) =>
            item.id === itemId ? { ...item, completed: newCompleted } : item,
          );
          return { ...p, items: updated };
        }),
      );

      await toggleStudyPlanItemFn({
        data: {
          planId,
          itemId,
        },
      });
    } catch (err: any) {
      toast.error(friendlyError(err, "Failed to update task."));
      fetchPlans();
    }
  };

  const onConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      await deleteStudyPlanFn({ data: { planId: id } });
      setPlans((prev) => prev.filter((p) => p.id !== id));
      toast.success("Study plan deleted");
    } catch (err: any) {
      toast.error(friendlyError(err, "Failed to delete plan."));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading)
    return (
      <div className="h-full flex flex-col bg-background">
        <AppHeader
          title="Study Planner"
          subtitle="Loading your revision schedules…"
          actions={
            <button
              disabled
              className="flex items-center justify-center gap-2 bg-primary/60 text-primary-foreground px-4 py-2 rounded-2xl text-sm font-semibold min-h-11 opacity-75 cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              New Plan
            </button>
          }
        />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            <PlannerSkeleton />
          </div>
        </div>
      </div>
    );

  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      <AppHeader
        title="Study Planner"
        subtitle={
          plans.length > 0
            ? `${plans.length} active schedule${plans.length !== 1 ? "s" : ""}`
            : "Organize your revision"
        }
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold shadow-xs hover:bg-primary/90 transition-all active:scale-95 cursor-pointer min-h-11"
          >
            <Plus className="h-4 w-4" />
            <span>New Plan</span>
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {showForm && (
            <PlannerAddModal
              formOptions={formOptions}
              generating={generating}
              onClose={() => setShowForm(false)}
              onGenerate={handleGenerate}
            />
          )}

          {plans.length === 0 && !showForm ? (
            <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center border border-dashed border-border/70 rounded-3xl bg-card/30 mt-6 space-y-4">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Calendar className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground font-display">
                  No study plans yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 leading-relaxed">
                  Enter your syllabus exam date, subjects, and daily study hours. GilaniAI will
                  construct an adaptive, day-by-day revision roadmap.
                </p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:bg-primary/90 transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                Create your first plan
              </button>
            </div>
          ) : (
            plans.map((plan) => {
              const items = getPlanItems(plan);
              const completedCount = items.filter((i) => i.completed).length;
              const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;
              const isExpanded = expanded === plan.id;
              const grouped = groupByDate(items);
              const sortedDates = Object.keys(grouped).sort();
              const planTitle = plan.exam_name || plan.title || "Study Plan";

              return (
                <div
                  key={plan.id}
                  className="rounded-3xl border border-border/70 bg-card/70 shadow-xs overflow-hidden transition-all duration-200"
                >
                  <div
                    onClick={() => setExpanded(isExpanded ? null : plan.id)}
                    className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0 pr-4 space-y-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="text-base sm:text-lg font-bold text-foreground font-display truncate">
                          {planTitle}
                        </h4>
                        {plan.exam_date && (
                          <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                            Exam: {plan.exam_date}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-56 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground font-mono font-medium">
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
                        className="p-2 rounded-xl text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer min-h-11 min-w-11 flex items-center justify-center"
                        title="Delete plan"
                        aria-label="Delete plan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="p-2 rounded-xl text-muted-foreground">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-primary" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 sm:p-6 border-t border-border/50 bg-muted/10 space-y-6 animate-in fade-in duration-200">
                      {/* View mode toggle */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                          Revision Schedule
                        </span>
                        <div className="flex rounded-xl border border-border/70 bg-card p-0.5 text-xs font-medium">
                          <button
                            type="button"
                            onClick={() => setViewMode("list")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                              viewMode === "list"
                                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <LayoutList className="h-3.5 w-3.5" />
                            List
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewMode("week")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                              viewMode === "week"
                                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <LayoutGrid className="h-3.5 w-3.5" />
                            Week
                          </button>
                        </div>
                      </div>

                      {viewMode === "week" ? (
                        <PlannerWeekView
                          items={items}
                          onToggleItem={(itemId) => handleToggleItem(plan.id, itemId)}
                          onStartFocus={(itemId) => {
                            setActiveTask({ planId: plan.id, itemId });
                            setTimerOpen(true);
                          }}
                        />
                      ) : (
                        <div className="space-y-6">
                          {sortedDates.map((dateKey) => (
                            <div key={dateKey} className="space-y-2.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-foreground font-mono">
                                  {formatPlanDate(dateKey)}
                                </span>
                                <div className="h-px flex-1 bg-border/40" />
                              </div>
                              <div className="grid gap-2">
                                {grouped[dateKey].map((item) => (
                                  <PlannerItemRow
                                    key={item.id}
                                    planId={plan.id}
                                    item={item}
                                    onToggleItem={(pId, itId) => handleToggleItem(pId, itId)}
                                    onStartFocusSession={(pId, itId) => {
                                      setActiveTask({ planId: pId, itemId: itId });
                                      setTimerOpen(true);
                                    }}
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

      {confirmDeleteId && (
        <ConfirmDialog
          title="Delete this study plan?"
          description="This will permanently remove the revision schedule and all tracked task completions. This action cannot be undone."
          confirmLabel="Delete Plan"
          onConfirm={onConfirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      <PomodoroTimer open={timerOpen} onOpenChange={setTimerOpen} showTrigger={false} />
    </div>
  );
}
