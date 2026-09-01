import React, { useEffect, useRef, useState, useMemo, memo } from "react";
import { Copy, RefreshCw, Check, ThumbsUp, ThumbsDown, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/client/supabase";
import { SmoothMarkdownRenderer } from "@/client/components/tutor/SmoothMarkdownRenderer";
import { ThinkingSweep } from "@/client/components/tutor/ThinkingSweep";
import { ToolStepPill } from "@/client/components/tutor/ToolStepPill";
import { BubbleThinkingPanel } from "./bubble/BubbleThinkingPanel";
import { BubbleAttachment } from "./bubble/BubbleAttachment";

type Props = {
  message: any;
  idx: number;
  isLast: boolean;
  isPending: boolean;
  isRateLimited?: boolean;
  onReload: () => void;
  onEditRequest?: (text: string) => void;
  userId?: string | null;
  initialVote?: 1 | -1 | null;
  onVote?: (messageId: string, vote: 1 | -1 | null) => void;
  onDelete?: (messageId: string) => void;
  onExportPDF?: () => void;
  onEscalate?: () => void;
  escalationStatus?: "open" | "in_review" | "resolved" | null;
  escalating?: boolean;
  messagesLoading?: boolean;
  pauseLabel?: string | null;
};

export const MessageBubble = memo(function MessageBubble({
  message: m,
  isLast,
  isPending,
  isRateLimited,
  onReload,
  onEditRequest,
  userId,
  initialVote,
  onVote,
  pauseLabel,
  onDelete,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState<1 | -1 | null>(initialVote ?? null);
  const [voting, setVoting] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const prevInitialVoteRef = useRef(initialVote);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (prevInitialVoteRef.current !== initialVote) {
      prevInitialVoteRef.current = initialVote;
      setVote(initialVote ?? null);
    }
  }, [initialVote]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const COLLAPSE_THRESHOLD = 300;

  const attachmentName = useMemo(() => {
    if (m.role !== "user") return null;
    const partsText =
      m.parts
        ?.filter((p: any) => p.type === "text")
        .map((p: any) => p.text || "")
        .join("") || "";
    const rawText = partsText || m.content || "";
    const match = rawText.match(/\[Document Attached:\s*([^\]\n]+)\]/);
    return match ? match[1].trim() : null;
  }, [m.parts, m.content, m.role]);

  const displayText = useMemo(() => {
    const partsText =
      m.parts
        ?.filter((p: any) => p.type === "text")
        .map((p: any) => p.text || "")
        .join("") || "";
    const rawText = partsText || m.content || "";
    return m.role === "user"
      ? rawText
          .replace(/<DocumentContent[^>]*>[\s\S]*?<\/DocumentContent>\n*/g, "")
          .replace(/\[Document Attached:[^\]]+\]\n*/g, "")
          .replace(/^Student Query:\s*(\(See attached document\))?\s*/m, "")
          .trim()
      : rawText
          .replace(
            /^(?:tool_code\s+[\s\S]*?(?=\n\n|\n[A-Z0-9#*-])|thought\s+[\s\S]*?(?=\n\n|\n[A-Z0-9#*-]))+/g,
            "",
          )
          .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
          .trim();
  }, [m.parts, m.content, m.role]);

  const { reasoningSteps, toolSteps } = useMemo(() => {
    const part = m.parts?.find((p: any) => p.type === "thinking-steps");
    const steps = Array.isArray(part?.steps) ? part.steps : [];

    const dbToolSteps = steps.filter(
      (s: any) => s.type === "tool-call" || s.type === "tool-result",
    );

    const liveToolSteps: any[] = [];
    const seenCalls = new Set<string>();
    const seenResults = new Set<string>();
    if (m.toolInvocations && m.toolInvocations.length > 0) {
      for (const inv of m.toolInvocations) {
        const invId = inv.toolCallId || inv.toolName;
        if (!seenCalls.has(invId)) {
          seenCalls.add(invId);
          liveToolSteps.push({
            type: "tool-call",
            toolName: inv.toolName,
            input: inv.args,
          });
        }
        if ("result" in inv && !seenResults.has(invId)) {
          seenResults.add(invId);
          liveToolSteps.push({
            type: "tool-result",
            toolName: inv.toolName,
            output: inv.result,
          });
        }
      }
    }

    const finalToolSteps = liveToolSteps.length > 0 ? liveToolSteps : dbToolSteps;

    return {
      reasoningSteps: steps.filter((s: any) => s.type === "reasoning"),
      toolSteps: finalToolSteps,
    };
  }, [m.parts, m.toolInvocations]);

  const isStreamActive = isPending && isLast;

  const [isStalled, setIsStalled] = useState(false);
  const lastTextRef = useRef<string>("");
  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!isStreamActive) {
      setIsStalled(false);
      return;
    }
    if (displayText !== lastTextRef.current) {
      lastTextRef.current = displayText;
      setIsStalled(false);
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
      stallTimerRef.current = setTimeout(() => setIsStalled(true), 1500);
    }
    return () => {
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
    };
  }, [displayText, isStreamActive]);

  useEffect(() => {
    if (!isStreamActive) return;
    stallTimerRef.current = setTimeout(() => setIsStalled(true), 1500);
    return () => {
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
    };
  }, [isStreamActive]);

  const showBubbleCard = displayText.length > 0;
  const isUser = m.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(displayText);
    setCopied(true);
    toast.success("Copied!");

    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 1800);
  };

  const handleVote = async (v: 1 | -1) => {
    const isValidId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      m.id || "",
    );
    if (!userId || !m.id || !isValidId || voting) return;

    const newVote = vote === v ? null : v;
    const previousVote = vote;

    setVote(newVote);
    onVote?.(m.id, newVote);

    if (newVote !== null) {
      toast.success(newVote === 1 ? "Thanks for the feedback! 👍" : "Noted — we'll improve. 👎");
    }

    setVoting(true);
    try {
      if (newVote === null) {
        await supabase
          .from("message_feedback")
          .delete()
          .eq("message_id", m.id)
          .eq("user_id", userId);
      } else {
        await supabase
          .from("message_feedback")
          .upsert(
            { message_id: m.id, user_id: userId, vote: newVote },
            { onConflict: "message_id,user_id" },
          );
      }
    } catch {
      setVote(previousVote);
      onVote?.(m.id, previousVote);
      toast.error("Failed to save feedback");
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className={`flex w-full group py-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex flex-col relative ${
          isUser ? "max-w-[85%] sm:max-w-[75%]" : "w-full px-3 sm:px-8"
        }`}
      >
        {/* Live tool call indicator */}
        {!isUser && isStreamActive && toolSteps.length > 0 && !showBubbleCard && (
          <div className="mb-2 flex flex-wrap gap-2 animate-in fade-in duration-300 w-full max-w-[96%]">
            {toolSteps.map((step: any, i: number) => {
              if (step.type !== "tool-call") return null;
              const isDone = toolSteps.some(
                (s: any) => s.type === "tool-result" && s.toolName === step.toolName,
              );
              return (
                <ToolStepPill
                  key={`${step.toolName}-${i}`}
                  toolName={step.toolName}
                  isDone={isDone}
                />
              );
            })}
          </div>
        )}

        <div
          className={`${
            isUser
              ? "px-5 py-3.5 bg-muted/60 text-foreground rounded-3xl rounded-tr-sm"
              : isStreamActive && !showBubbleCard
                ? "opacity-0 pointer-events-none"
                : "px-0 py-1 bg-transparent text-foreground"
          } text-[15px] sm:text-base leading-relaxed relative transition-all duration-200`}
        >
          {!isUser ? (
            <div className="flex flex-col w-full">
              {showBubbleCard ? (
                <div className="prose-ai relative">
                  <BubbleThinkingPanel reasoningSteps={reasoningSteps} />

                  <SmoothMarkdownRenderer
                    content={displayText}
                    isStreaming={isStreamActive}
                    className={
                      isStreamActive && !pauseLabel && !isStalled
                        ? "transition-opacity duration-200 streaming-cursor"
                        : "transition-opacity duration-200"
                    }
                  />
                  {isStreamActive && (pauseLabel || isStalled) && (
                    <div className="mt-1 animate-in fade-in duration-300">
                      <ThinkingSweep label={pauseLabel || "Thinking..."} />
                    </div>
                  )}

                  {toolSteps.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {toolSteps.map((step: any, i: number) => {
                        if (step.type !== "tool-call") return null;
                        const isDone = toolSteps.some(
                          (s: any) => s.type === "tool-result" && s.toolName === step.toolName,
                        );
                        return (
                          <ToolStepPill
                            key={`${step.toolName}-${i}`}
                            toolName={step.toolName}
                            isDone={isDone}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                !isStreamActive && (
                  <span className="text-xs text-muted-foreground italic mt-1">
                    No response generated. Please resend your question.
                  </span>
                )
              )}

              {/* Footer: action buttons + persistent G badge */}
              <div className="flex flex-col gap-1.5 mt-2">
                {showBubbleCard && !isStreamActive && (
                  <div className="flex items-center gap-1 transition-opacity duration-200">
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted cursor-pointer"
                      title="Copy message"
                      aria-label="Copy message"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {isLast && (
                      <button
                        onClick={isRateLimited ? undefined : onReload}
                        disabled={isRateLimited}
                        className={`inline-flex items-center gap-1 text-xs font-medium transition-colors px-2 py-1 rounded-md ${
                          isRateLimited
                            ? "opacity-40 cursor-not-allowed text-muted-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                        }`}
                        title={isRateLimited ? "Rate limit reached" : "Retry response"}
                        aria-label="Retry response"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <span className="w-px h-3 bg-border/60 mx-0.5" />

                    <button
                      onClick={() => handleVote(1)}
                      disabled={voting}
                      className={`inline-flex items-center gap-1 text-xs font-medium transition-colors px-2 py-1 rounded-md hover:bg-muted cursor-pointer ${
                        vote === 1 ? "text-green-500" : "text-muted-foreground hover:text-green-500"
                      }`}
                      title="Good response"
                      aria-label="Vote up"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => handleVote(-1)}
                      disabled={voting}
                      className={`inline-flex items-center gap-1 text-xs font-medium transition-colors px-2 py-1 rounded-md hover:bg-muted cursor-pointer ${
                        vote === -1
                          ? "text-destructive"
                          : "text-muted-foreground hover:text-destructive"
                      }`}
                      title="Bad response"
                      aria-label="Vote down"
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {isLast && (
                  <div className="flex items-center pt-1">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 border border-primary/25 text-xs font-bold text-primary select-none leading-none shadow-xs"
                      aria-hidden="true"
                      title="GilaniAI"
                    >
                      G
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* User message */
            <div className="flex flex-col gap-1.5">
              <BubbleAttachment attachmentName={attachmentName} />
              <div className="flex flex-col gap-1">
                <span className="whitespace-pre-wrap text-foreground font-medium">
                  {collapsed && displayText.length > COLLAPSE_THRESHOLD
                    ? displayText.slice(0, COLLAPSE_THRESHOLD) + "…"
                    : displayText}
                </span>
                {displayText.length > COLLAPSE_THRESHOLD && (
                  <button
                    onClick={() => setCollapsed((p) => !p)}
                    className="self-start text-xs font-semibold text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors cursor-pointer"
                    aria-expanded={!collapsed}
                  >
                    {collapsed ? "Show more" : "Show less"}
                  </button>
                )}
              </div>

              {!isStreamActive && (
                <div className="flex items-center gap-1 mt-1.5 transition-opacity duration-200 justify-end">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted cursor-pointer"
                    title="Copy message"
                    aria-label="Copy message"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  {onEditRequest && (
                    <button
                      onClick={isRateLimited ? undefined : () => onEditRequest(displayText)}
                      disabled={isRateLimited}
                      className={`inline-flex items-center text-xs font-medium transition-colors px-2 py-1 rounded-md ${
                        isRateLimited
                          ? "opacity-40 cursor-not-allowed text-muted-foreground/50"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                      }`}
                      title={isRateLimited ? "Rate limit reached" : "Edit message"}
                      aria-label="Edit message"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(m.id)}
                      className="inline-flex items-center text-xs font-medium transition-colors px-2 py-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted cursor-pointer"
                      title="Delete message"
                      aria-label="Delete message"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hover timestamp */}
        <div
          className={`absolute -bottom-2 ${
            isUser ? "right-2" : "left-3 sm:left-8"
          } opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-mono text-xs text-muted-foreground bg-background/90 backdrop-blur-xs border border-border/60 px-1.5 py-0.5 rounded shadow-xs pointer-events-none z-10`}
        >
          {m.createdAt
            ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Just now"}
        </div>
      </div>
    </div>
  );
});
