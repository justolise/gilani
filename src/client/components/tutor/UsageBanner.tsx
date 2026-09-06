import React, { useState, useEffect, useRef, useMemo } from "react";
import { AlertCircle, Clock, CreditCard, X } from "lucide-react";

export function formatTime(seconds: number): string {
  if (seconds <= 0) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0 || h > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);

  return parts.join(" ");
}

export function formatDailyResetHours(seconds: number): string {
  const effectiveSecs =
    seconds > 0
      ? seconds
      : (() => {
          const now = new Date();
          const midnight = new Date(now);
          midnight.setHours(24, 0, 0, 0);
          return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
        })();
  const hours = Math.max(1, Math.floor(effectiveSecs / 3600));
  return `${hours} ${hours === 1 ? "Hour" : "Hours"}`;
}

export function formatDailyResetShort(seconds: number): string {
  const effectiveSecs =
    seconds > 0
      ? seconds
      : (() => {
          const now = new Date();
          const midnight = new Date(now);
          midnight.setHours(24, 0, 0, 0);
          return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
        })();
  const hours = Math.max(1, Math.floor(effectiveSecs / 3600));
  return `${hours}h`;
}

export function checkIsRateLimited(chatError: string | null | undefined): boolean {
  if (!chatError) return false;
  try {
    const parsed = JSON.parse(chatError);
    if (
      parsed.retryAfterMs ||
      parsed.isDaily ||
      (parsed.error &&
        (parsed.error.toLowerCase().includes("limit") ||
          parsed.error.toLowerCase().includes("daily") ||
          parsed.error.toLowerCase().includes("quota") ||
          parsed.error.toLowerCase().includes("slow down")))
    ) {
      return true;
    }
  } catch {
    // ignore
  }
  const errLower = chatError.toLowerCase();
  return (
    errLower.includes("rate limit") ||
    errLower.includes("daily") ||
    errLower.includes("quota") ||
    errLower.includes("slow down") ||
    errLower.includes("too many requests") ||
    errLower.includes("exceeded")
  );
}

export function useRateLimitCountdown(
  chatError: string | null | undefined,
  onExpired?: () => void,
) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isDaily, setIsDaily] = useState(false);
  const [maxSeconds, setMaxSeconds] = useState(60);
  const [customMessage, setCustomMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  useEffect(() => {
    if (!chatError) {
      setSecondsLeft(0);
      setCustomMessage(null);
      return;
    }

    let secs = 0;
    let daily = chatError.toLowerCase().includes("daily");
    let msg: string | null = null;

    // Try to parse JSON from Supabase/API response
    try {
      const parsed = JSON.parse(chatError);
      if (parsed.retryAfterMs) {
        secs = Math.ceil(parsed.retryAfterMs / 1000);
      }
      if (parsed.isDaily !== undefined) {
        daily = !!parsed.isDaily;
      }
      msg = parsed.error || parsed.message || null;
    } catch {
      // Fallback: Parse "Try again in Xs" or "Resets in Xs" or "resets in X Hours"
      const match = chatError.match(/(?:Try again|Resets) in (\d+)s/i);
      if (match) {
        secs = parseInt(match[1], 10);
      } else {
        const hourMatch = chatError.match(/resets in\s+(\d+)\s+Hours?/i);
        if (hourMatch) {
          secs = parseInt(hourMatch[1], 10) * 3600;
        }
      }
    }

    // If daily limit and secs <= 0, calculate seconds remaining until midnight
    if (daily && secs <= 0) {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      secs = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
    }

    setIsDaily(daily);
    setCustomMessage(msg);

    if (secs > 0) {
      setSecondsLeft(secs);
      setMaxSeconds(secs);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(timerRef.current!);
            onExpiredRef.current?.();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [chatError]);

  return { secondsLeft, isDaily, maxSeconds, customMessage };
}

export type UsageBannersProps = {
  chatError?: string | null;
  docUploadError?: string | null;
  onClearDocError?: () => void;
  onUpgrade?: () => void;
  onRateLimitExpired?: () => void;
  messagesUsed?: number;
  messagesMax?: number;
  isRateLimited?: boolean;
  className?: string;
};

export function UsageBanners({
  chatError,
  docUploadError,
  onClearDocError,
  onUpgrade,
  onRateLimitExpired,
  messagesUsed = 0,
  messagesMax,
  isRateLimited: explicitIsRateLimited,
  className = "",
}: UsageBannersProps) {
  const [dismissedBanners, setDismissedBanners] = useState<string[]>([]);

  const rateLimited = useMemo(() => {
    if (typeof explicitIsRateLimited === "boolean") return explicitIsRateLimited;
    return checkIsRateLimited(chatError);
  }, [explicitIsRateLimited, chatError]);

  const { secondsLeft, isDaily } = useRateLimitCountdown(
    rateLimited ? (chatError ?? null) : null,
    onRateLimitExpired,
  );

  const usagePct = (messagesMax ?? 0) > 0 ? messagesUsed / (messagesMax ?? 1) : 0;
  const isApproachingLimit =
    (messagesMax ?? 999_999) < 999_999 &&
    usagePct >= 0.8 &&
    messagesUsed < (messagesMax ?? 999_999) &&
    !rateLimited;
  const remaining = Math.max(0, (messagesMax ?? 0) - messagesUsed);

  const hasAnyBanner =
    (isApproachingLimit && !dismissedBanners.includes("approaching")) ||
    (rateLimited && !dismissedBanners.includes("ratelimit")) ||
    (Boolean(chatError) && !rateLimited && !dismissedBanners.includes("error")) ||
    Boolean(docUploadError);

  if (!hasAnyBanner) return null;

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {/* Approaching-limit soft warning banner */}
      {isApproachingLimit && !dismissedBanners.includes("approaching") && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50/70 dark:bg-orange-950/25 dark:border-orange-900/40 backdrop-blur-sm overflow-hidden shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500 dark:text-orange-400 flex-shrink-0" />
              <p className="text-[11px] sm:text-xs font-semibold text-orange-800 dark:text-orange-300 leading-tight truncate whitespace-nowrap">
                {remaining <= 1 ? (
                  <>
                    <span className="hidden sm:inline">
                      You've used all {messagesMax} messages today
                    </span>
                    <span className="sm:hidden">All {messagesMax} messages used today</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">
                      You've hit {Math.round(usagePct * 100)}% of your daily limit
                    </span>
                    <span className="sm:hidden">
                      {Math.round(usagePct * 100)}% daily limit reached
                    </span>
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {onUpgrade && (
                <button
                  onClick={onUpgrade}
                  type="button"
                  className="flex-shrink-0 inline-flex items-center gap-1 sm:gap-1.5 rounded-lg bg-orange-500 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-bold text-white hover:bg-orange-600 active:scale-95 transition-all duration-200 shadow-sm whitespace-nowrap"
                >
                  <CreditCard className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>Upgrade</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setDismissedBanners((p) => [...p, "approaching"])}
                className="rounded-lg p-0.5 sm:p-1 text-orange-600 hover:bg-orange-200 dark:text-orange-400 dark:hover:bg-orange-900/50 transition-colors flex-shrink-0"
                aria-label="Dismiss limit warning"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-0.5 bg-orange-100 dark:bg-orange-900/40">
            <div
              className="h-full bg-orange-400 dark:bg-orange-500 transition-all duration-500"
              style={{ width: `${Math.min(100, usagePct * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Rate limit countdown banner */}
      {rateLimited && !dismissedBanners.includes("ratelimit") && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 dark:bg-destructive/10 dark:border-destructive/30 backdrop-blur-sm overflow-hidden shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-destructive dark:text-red-400" />
              <p className="text-[11px] sm:text-xs font-semibold text-destructive dark:text-red-300 leading-tight truncate whitespace-nowrap">
                {isDaily ? (
                  <>
                    <span className="hidden sm:inline">
                      Daily limit reached. Resets in {formatDailyResetHours(secondsLeft)}
                    </span>
                    <span className="sm:hidden">
                      Daily limit · Resets in {formatDailyResetShort(secondsLeft)}
                    </span>
                  </>
                ) : secondsLeft > 0 ? (
                  <>
                    <span className="hidden sm:inline">
                      Too many messages — try again in {formatTime(secondsLeft)}
                    </span>
                    <span className="sm:hidden">
                      Rate limit · Try again in {formatTime(secondsLeft)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">
                      Too many messages — please wait a moment
                    </span>
                    <span className="sm:hidden">Rate limit · Please wait</span>
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {onUpgrade && (
                <button
                  onClick={onUpgrade}
                  type="button"
                  className="flex-shrink-0 inline-flex items-center gap-1 sm:gap-1.5 rounded-lg bg-destructive px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-bold text-white hover:bg-destructive/90 active:scale-95 transition-all shadow-sm whitespace-nowrap"
                >
                  <CreditCard className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>Upgrade</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setDismissedBanners((p) => [...p, "ratelimit"])}
                className="rounded-lg p-0.5 sm:p-1 text-destructive/80 hover:bg-destructive/20 hover:text-destructive transition-colors flex-shrink-0"
                aria-label="Dismiss rate limit banner"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* General AI/Server Error Banner */}
      {chatError && !rateLimited && !dismissedBanners.includes("error") && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 dark:bg-destructive/10 dark:border-destructive/30 backdrop-blur-sm shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5 px-3.5 py-3">
            <div className="flex-shrink-0 mt-0.5">
              <AlertCircle className="h-4 w-4 text-destructive dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-destructive dark:text-red-300">
                Chat Session Issue
              </p>
              <p className="text-xs text-destructive/80 dark:text-red-400/85 mt-0.5 font-medium leading-relaxed">
                {(() => {
                  try {
                    const parsed = JSON.parse(chatError);
                    return parsed.error || parsed.message || chatError;
                  } catch {
                    return chatError;
                  }
                })()}
              </p>
            </div>
            <button
              onClick={() => setDismissedBanners((p) => [...p, "error"])}
              className="flex-shrink-0 rounded-lg p-1 text-destructive/60 hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Dismiss error"
              type="button"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Document Upload Error Banner */}
      {docUploadError && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 dark:bg-destructive/10 dark:border-destructive/30 backdrop-blur-sm shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5 px-3.5 py-3">
            <div className="flex-shrink-0 mt-0.5">
              <AlertCircle className="h-4 w-4 text-destructive dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-destructive dark:text-red-300">
                Document Upload Issue
              </p>
              <p className="text-xs text-destructive/80 dark:text-red-400/85 mt-0.5 font-medium leading-relaxed">
                {docUploadError}
              </p>
            </div>
            {onClearDocError && (
              <button
                onClick={onClearDocError}
                className="flex-shrink-0 rounded-lg p-1 text-destructive/60 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                title="Dismiss error"
                type="button"
                aria-label="Dismiss upload error"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
