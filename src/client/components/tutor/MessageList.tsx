import React, { useRef, useEffect, useCallback, useMemo, useState } from "react";
import * as Sentry from "@sentry/react";
import { MessageBubble } from "./MessageBubble";
import { EmptyState } from "./EmptyState";
import { Loader2, AlertCircle, RefreshCw, ArrowDown } from "lucide-react";
import { hasPendingMessage, peekPendingMessage } from "@/shared/utils/pending-message";
import { formatToolInProgressLabel } from "./tool-metadata";

type Props = {
  threadId?: string;
  messages: any[];
  messagesLoading: boolean;
  messagesLoadError: string | null;
  isPending: boolean;
  isRateLimited?: boolean;
  onReload: () => void;
  onPromptClick: (prompt: string) => void;
  onEditRequest?: (text: string) => void;
  onDelete?: (messageId: string) => void;
  userId?: string | null;
  userVotes?: Record<string, 1 | -1>;
  onVote?: (messageId: string, vote: 1 | -1 | null) => void;
  onExportPDF?: () => void;

  onEscalate?: () => void;
  escalationStatus?: "open" | "in_review" | "resolved" | null;
  escalating?: boolean;
  messagesUsed?: number;
  messagesMax?: number;
  onUpgrade?: () => void;
  onRateLimitExpired?: () => void;
  chatError?: string | null;
  recentThreads?: { id: string; title?: string | null }[];
  onUploadClick?: () => void;
  onScanClick?: () => void;
  onVoiceClick?: () => void;
  isListening?: boolean;
  allThreadsPath?: string;
  userName?: string | null;
  /**
   * The text of the first user message, captured synchronously from the
   * pending-message store BEFORE consumePendingMessage clears it.
   * Passed as a prop so MessageList can show the optimistic bubble on Frame 1
   * without a race against the useEffect that consumes the store.
   */
  initialUserMessage?: string | null;
};

export const MessageList = React.memo(function MessageList({
  threadId,
  messages,
  messagesLoading,
  messagesLoadError,
  isPending,
  isRateLimited,
  onReload,
  onPromptClick,
  onEditRequest,
  onDelete,
  userId,
  userVotes,
  onVote,
  onExportPDF,
  onEscalate,
  escalationStatus,
  escalating,
  messagesUsed,
  messagesMax,
  onUpgrade,
  onRateLimitExpired,
  chatError,
  recentThreads,
  onUploadClick,
  onScanClick,
  onVoiceClick,
  isListening,
  allThreadsPath,
  userName,
  initialUserMessage,
}: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollingRef = useRef(true);
  const lastMessageCountRef = useRef(0);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const isPendingRef = useRef(isPending);
  isPendingRef.current = isPending;
  const activeAssistantKeyRef = useRef<string | null>(null);
  const lastUserMsgCountRef = useRef(0);

  // Show the optimistic user bubble on Frame 1 using the prop captured
  // synchronously before consumePendingMessage cleared the store.
  // Fall back to peekPendingMessage for any legacy call paths.
  const pendingText =
    initialUserMessage ??
    (threadId && hasPendingMessage(threadId) ? peekPendingMessage(threadId)?.finalMessage : null) ??
    null;

  const effectiveMessages = useMemo(() => {
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      // When AI is actively generating but hasn't created the assistant message yet,
      // include the optimistic assistant bubble so layout never shifts or jumps
      if (isPending && last.role === "user") {
        return [
          ...messages,
          {
            id: "optimistic-assistant-" + (threadId || "draft"),
            role: "assistant",
            content: "",
            parts: [],
            createdAt: new Date(),
          },
        ];
      }
      return messages;
    }
    if (pendingText) {
      return [
        {
          id: "optimistic-pending-user-" + (threadId || "draft"),
          role: "user",
          content: pendingText,
          parts: [{ type: "text", text: pendingText }],
          createdAt: new Date(),
        },
        {
          id: "optimistic-pending-assistant-" + (threadId || "draft"),
          role: "assistant",
          content: "",
          parts: [],
          createdAt: new Date(),
        },
      ];
    }
    return messages;
  }, [messages, pendingText, threadId, isPending]);

  // Reset active assistant key whenever a new user turn starts
  const currentUserMsgCount = useMemo(
    () => effectiveMessages.filter((m) => m.role === "user").length,
    [effectiveMessages],
  );
  if (currentUserMsgCount !== lastUserMsgCountRef.current) {
    lastUserMsgCountRef.current = currentUserMsgCount;
    activeAssistantKeyRef.current = null;
  }

  const effectiveLoading = pendingText ? false : messagesLoading;

  // While streaming, surface the actual tool currently in flight across all formats
  const activeToolLabel = useMemo(() => {
    if (!isPending) return null;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return null;

    // 1. Check last.toolInvocations
    if (Array.isArray(last.toolInvocations)) {
      const inFlightInv = last.toolInvocations.find(
        (inv: any) => inv.state !== "result" && !("result" in inv),
      );
      if (inFlightInv?.toolName) {
        return formatToolInProgressLabel(inFlightInv.toolName);
      }
    }

    // 2. Check last.parts
    if (Array.isArray(last.parts)) {
      for (let i = last.parts.length - 1; i >= 0; i--) {
        const p = last.parts[i];
        if (p.type === "tool-invocation" && p.toolInvocation) {
          const inv = p.toolInvocation;
          if (inv.state !== "result" && !("result" in inv)) {
            return formatToolInProgressLabel(inv.toolName);
          }
        }
        if (p.type === "tool-call") {
          const id = p.toolCallId || p.toolName;
          const hasResult = last.parts.some(
            (r: any) =>
              r.type === "tool-result" && (r.toolCallId === id || r.toolName === p.toolName),
          );
          if (!hasResult) {
            return formatToolInProgressLabel(p.toolName);
          }
        }
        if (typeof p.type === "string" && p.type.startsWith("tool-")) {
          const isDone = p.state === "output-available" || "output" in p || "result" in p;
          if (!isDone) {
            const toolName = p.toolName || p.type.replace(/^tool-/, "");
            return formatToolInProgressLabel(toolName);
          }
        }
      }
    }

    return null;
  }, [isPending, messages]);

  // Smart scroll: only auto-scroll if user is near bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Check if user is near the bottom (within 200px)
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const shouldScroll = distanceFromBottom < 200 || isAutoScrollingRef.current;

    if (shouldScroll) {
      container.scrollTo({ top: container.scrollHeight, behavior });
    }
  }, []);

  // Scroll on new messages (not during streaming)
  useEffect(() => {
    if (isPending) return;
    if (messages.length === 0) return;

    const messageCountChanged = messages.length !== lastMessageCountRef.current;
    lastMessageCountRef.current = messages.length;

    if (messageCountChanged) {
      scrollToBottom("smooth");
    }
  }, [messages.length, scrollToBottom, isPending]);

  // Jump to bottom instantly when messages finish loading
  useEffect(() => {
    if (messagesLoading || messages.length === 0) return;

    // Use double rAF to ensure layout is painted
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToBottom("instant");
        isAutoScrollingRef.current = true;
      });
    });
  }, [messages.length, messagesLoading, scrollToBottom]);

  // Auto-scroll during streaming with ResizeObserver
  useEffect(() => {
    const container = scrollContainerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    let lastHeight = inner.scrollHeight;
    let rafId: number;

    const handleResize = () => {
      const newHeight = inner.scrollHeight;

      if (newHeight > lastHeight) {
        // Only auto-scroll while streaming is actively in progress
        // This prevents jumping when post-stream action buttons or badges appear
        if (isPendingRef.current) {
          const distanceFromBottom =
            container.scrollHeight - container.scrollTop - container.clientHeight;

          if (distanceFromBottom < 200 || isAutoScrollingRef.current) {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
              container.scrollTop = container.scrollHeight;
            });
          }
        }

        lastHeight = newHeight;
      } else {
        lastHeight = newHeight;
      }
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(inner);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Detect when user manually scrolls up (disable auto-scroll)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      isAutoScrollingRef.current = distanceFromBottom < 100;
      setShowScrollBottom(distanceFromBottom > 160);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex-1 min-h-0 relative flex flex-col">
      {/* Scroll container */}
      <div
        ref={scrollContainerRef}
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        className={`flex-1 min-h-0 overflow-y-auto px-2 py-4 sm:px-6 sm:py-6 ${
          isRateLimited
            ? "pb-[calc(20rem+env(safe-area-inset-bottom,0px))] lg:pb-8"
            : "pb-[calc(14rem+env(safe-area-inset-bottom,0px))] lg:pb-8"
        }`}
      >
        <div
          ref={innerRef}
          className="space-y-1 sm:space-y-2 flex flex-col pb-4 min-h-full max-w-4xl mx-auto w-full"
        >
          {/* Loading state */}
          {effectiveLoading && (
            <div
              className="flex flex-col items-center justify-center h-full gap-3 py-16"
              role="status"
              aria-label="Loading messages"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-xs">
                <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
              </div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Loading study session…
              </p>
            </div>
          )}

          {/* Error state */}
          {messagesLoadError && (
            <div
              className="mx-auto max-w-xl rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive shadow-xs"
              role="alert"
            >
              <p className="font-medium">{messagesLoadError}</p>
            </div>
          )}

          {/* Empty state */}
          {!effectiveLoading && !messagesLoadError && effectiveMessages.length === 0 && (
            <EmptyState
              onPromptClick={onPromptClick}
              recentThreads={recentThreads ?? []}
              onUploadClick={onUploadClick}
              onScanClick={onScanClick}
              onVoiceClick={onVoiceClick}
              isListening={isListening}
              allThreadsPath={allThreadsPath}
              chatError={chatError}
              isRateLimited={isRateLimited}
              messagesUsed={messagesUsed}
              messagesMax={messagesMax}
              onUpgrade={onUpgrade}
              onRateLimitExpired={onRateLimitExpired}
              userName={userName}
            />
          )}

          {/* Messages */}
          {!effectiveLoading &&
            !messagesLoadError &&
            effectiveMessages.map((m, idx: number) => {
              const isLastAssistant =
                m.role === "assistant" && idx === effectiveMessages.length - 1;

              if (isLastAssistant && !activeAssistantKeyRef.current) {
                activeAssistantKeyRef.current = m.id || `assistant-${threadId || "active"}-${idx}`;
              }

              const itemKey = isLastAssistant
                ? activeAssistantKeyRef.current || m.id || idx
                : (m.id ?? idx);

              return (
                <Sentry.ErrorBoundary
                  key={itemKey}
                  fallback={
                    <div className="mx-auto my-2 w-full max-w-[96%] sm:max-w-full rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-xs text-destructive opacity-80">
                      <p>Sorry, we couldn't render this specific message properly.</p>
                    </div>
                  }
                >
                  <MessageBubble
                    message={m}
                    idx={idx}
                    isLast={idx === effectiveMessages.length - 1}
                    isPending={(isPending || !!pendingText) && idx === effectiveMessages.length - 1}
                    isRateLimited={isRateLimited}
                    onReload={onReload}
                    onEditRequest={onEditRequest}
                    onDelete={onDelete}
                    userId={userId}
                    initialVote={userVotes?.[m.id] ?? null}
                    onVote={onVote}
                    onExportPDF={onExportPDF}
                    onEscalate={onEscalate}
                    escalationStatus={escalationStatus}
                    escalating={escalating}
                    messagesLoading={messagesLoading}
                    pauseLabel={idx === messages.length - 1 ? activeToolLabel : null}
                  />
                </Sentry.ErrorBoundary>
              );
            })}

          {chatError && !isRateLimited && (
            <div className="mx-auto my-4 w-full max-w-xl rounded-2xl border border-destructive/25 bg-destructive/5 dark:bg-destructive/10 dark:border-destructive/30 p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-xs font-semibold text-destructive dark:text-red-300">
                    Temporary Connection Pause
                  </h4>
                  <p className="text-xs text-destructive/85 dark:text-red-400/85 leading-relaxed">
                    Don't worry — your study notes and progress are safe! We had a momentary hiccup
                    connecting to the tutor.
                  </p>
                  <button
                    onClick={onReload}
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl bg-destructive px-3.5 py-2 text-xs font-semibold text-white hover:bg-destructive/90 active:scale-95 transition-all cursor-pointer shadow-xs min-h-9.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} aria-hidden="true" />
        </div>
      </div>

      {/* Floating Scroll to Bottom pill — rendered OUTSIDE innerRef so it anchors
          to the bottom of the scroll viewport, never floating mid-content */}
      {showScrollBottom && (
        <div className="absolute bottom-6 inset-x-0 flex justify-center z-20 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            type="button"
            onClick={() => {
              const container = scrollContainerRef.current;
              if (container) {
                container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
                isAutoScrollingRef.current = true;
                setShowScrollBottom(false);
              }
            }}
            className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/95 dark:bg-card/90 text-foreground shadow-lg hover:shadow-xl hover:border-primary/40 transition-all text-xs font-medium active:scale-95 cursor-pointer border border-border/80 backdrop-blur-md group"
          >
            <ArrowDown className="h-3.5 w-3.5 text-primary group-hover:translate-y-0.5 transition-transform" />
            <span>{isPending ? "New response below" : "Scroll to bottom"}</span>
          </button>
        </div>
      )}
    </div>
  );
});
