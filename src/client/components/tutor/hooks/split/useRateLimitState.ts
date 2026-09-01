import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/client/supabase";
import { getRateLimitStatus } from "@/fns/rate-limit.server-fns";

export function useRateLimitState(userId: string | null) {
  const [chatError, setChatError] = useState<string | null>(null);
  const [messagesUsed, setMessagesUsed] = useState<number>(0);
  const [messagesMax, setMessagesMax] = useState<number>(10);

  const isRateLimited = !!(
    chatError?.includes("Rate limit") ||
    chatError?.includes("rate limit") ||
    chatError?.includes("Daily") ||
    chatError?.includes("daily") ||
    chatError?.includes("quota")
  );

  const refreshRateLimitStatus = useCallback(async () => {
    try {
      const status = await getRateLimitStatus({ data: "chat" });
      setMessagesUsed((status as any).messagesUsed ?? 0);
      setMessagesMax((status as any).messagesMax ?? 10);
      if (status.isRateLimited) {
        const secs = Math.ceil(status.retryAfterMs / 1000);
        setChatError(
          JSON.stringify({
            retryAfterMs: status.retryAfterMs,
            isDaily: status.isDaily,
            message: status.isDaily
              ? `Daily message limit reached. Resets in ${secs}s.`
              : `Rate limit exceeded. Try again in ${secs}s.`,
          }),
        );
      } else {
        setChatError((prev) => {
          if (!prev) return prev;
          try {
            const p = JSON.parse(prev);
            if (p.retryAfterMs !== undefined || p.isDaily !== undefined) return null;
          } catch {}
          const lower = prev.toLowerCase();
          if (
            lower.includes("rate limit") ||
            lower.includes("daily") ||
            lower.includes("quota") ||
            lower.includes("exceeded")
          )
            return null;
          return prev;
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refreshRateLimitStatus();
  }, [refreshRateLimitStatus]);

  useEffect(() => {
    if (!userId) return;
    const dailyKey = `${userId}:chat:day`;
    const channel = supabase
      .channel(`rate-limit-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rate_limits", filter: `key=eq.${dailyKey}` },
        () => refreshRateLimitStatus(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refreshRateLimitStatus]);

  return {
    chatError,
    setChatError,
    messagesUsed,
    messagesMax,
    isRateLimited,
    refreshRateLimitStatus,
  };
}
