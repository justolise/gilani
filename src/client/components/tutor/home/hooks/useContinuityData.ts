import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/client/supabase";
import { useThreadsQuery, type Thread } from "@/client/hooks/useThreadsQuery";
import type { StudyPlanItem } from "@/fns/planner.server-fns";

export interface ContinuityTask {
  planId: string;
  examName: string;
  item: StudyPlanItem;
  isToday: boolean;
}

export function useContinuityData(userId: string | null | undefined) {
  const { threads, threadsLoading } = useThreadsQuery(userId);

  const planQuery = useQuery({
    queryKey: ["home_continuity_plan", userId],
    queryFn: async (): Promise<ContinuityTask | null> => {
      if (!userId) return null;
      try {
        const { data, error } = await supabase
          .from("study_plans")
          .select("id, exam_name, items")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error || !data || !Array.isArray(data.items)) return null;

        const items = data.items as StudyPlanItem[];
        const todayStr = new Date().toISOString().slice(0, 10);

        // First look for today's uncompleted task
        const todayTask = items.find((it) => it.date === todayStr && !it.completed);
        if (todayTask) {
          return {
            planId: data.id,
            examName: data.exam_name,
            item: todayTask,
            isToday: true,
          };
        }

        // Otherwise find the first upcoming uncompleted task
        const nextTask = items.find((it) => !it.completed);
        if (nextTask) {
          return {
            planId: data.id,
            examName: data.exam_name,
            item: nextTask,
            isToday: nextTask.date === todayStr,
          };
        }

        return null;
      } catch (err) {
        console.error("Failed to load continuity plan:", err);
        return null;
      }
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });

  const latestThread: Thread | null = threads && threads.length > 0 ? threads[0] : null;

  return {
    latestThread,
    todayPlanTask: planQuery.data ?? null,
    loading: threadsLoading || planQuery.isLoading,
  };
}
