import { useCallback, useEffect, useState, useMemo, useRef } from "react";
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
        const hours = Math.max(1, Math.floor(secs / 3600));
        setChatError(
          JSON.stringify({
            retryAfterMs: status.retryAfterMs,
            isDaily: status.isDaily,
            message: status.isDaily
              ? `Daily limit reached. Resets in ${hours} ${hours === 1 ? "Hour" : "Hours"}`
              : `Rate limit exceeded. Try again in ${secs}s.`,
          }),
        );
      } else if (max > 0 && used >= max) {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        const msUntilMidnight = Math.max(0, midnight.getTime() - now.getTime());
        const hours = Math.max(1, Math.floor(msUntilMidnight / 3600000));
        setChatError(
          JSON.stringify({
            isDaily: true,
            retryAfterMs: msUntilMidnight,
            message: `Daily limit reached. Resets in ${hours} ${hours === 1 ? "Hour" : "Hours"}`,
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

  // Initial fetch
  useEffect(() => {
    refreshRateLimitStatus();
  }, [refreshRateLimitStatus]);

  // Keep a stable ref to refreshRateLimitStatus so the realtime handler never
  // captures a stale closure, and the effect doesn't re-run on every render.
  const refreshRef = useRef(refreshRateLimitStatus);
  useEffect(() => {
    refreshRef.current = refreshRateLimitStatus;
  }, [refreshRateLimitStatus]);

  useEffect(() => {
    if (!userId) return;

    const dailyKey = `${userId}:chat:day`;

    // Use a unique channel name per mount so we never accidentally call
    // .on() on an already-subscribed channel that Supabase cached internally.
    const channelName = `rate-limit-${userId}-${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rate_limits", filter: `key=eq.${dailyKey}` },
        // Use the ref so we always call the latest version without re-subscribing
        () => refreshRef.current(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // Only userId is a dependency — the channel is recreated when the user changes.
    // refreshRef is always up-to-date so it is intentionally omitted.
  }, [userId]);

  return {
    chatError,
    setChatError,
    messagesUsed,
    messagesMax,
    isRateLimited,
    refreshRateLimitStatus,
  };
}
