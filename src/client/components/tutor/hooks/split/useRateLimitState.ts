import { useCallback, useEffect, useState, useMemo } from "react";
import { supabase } from "@/client/supabase";
import { getRateLimitStatus } from "@/fns/rate-limit.server-fns";
import { checkIsRateLimited } from "@/client/components/tutor/UsageBanner";

export function useRateLimitState(userId: string | null) {
  const [chatError, setChatError] = useState<string | null>(null);
  const [messagesUsed, setMessagesUsed] = useState<number>(0);
  const [messagesMax, setMessagesMax] = useState<number>(10);
  const [serverRateLimited, setServerRateLimited] = useState<boolean>(false);

  const isRateLimited = useMemo(() => {
    return Boolean(
      serverRateLimited ||
      (messagesMax > 0 && messagesUsed >= messagesMax) ||
      checkIsRateLimited(chatError),
    );
  }, [serverRateLimited, messagesMax, messagesUsed, chatError]);

  const refreshRateLimitStatus = useCallback(async () => {
    try {
      const status = await getRateLimitStatus({ data: "chat" });
      const used = (status as any).messagesUsed ?? 0;
      const max = (status as any).messagesMax ?? 10;
      setMessagesUsed(used);
      setMessagesMax(max);
      const isLimited = Boolean(status.isRateLimited || (max > 0 && used >= max));
      setServerRateLimited(isLimited);

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
      } else if (max > 0 && used >= max) {
        setChatError(
          JSON.stringify({
            isDaily: true,
            message: `Daily message limit reached (${used}/${max}). Upgrade your plan to continue learning today.`,
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
