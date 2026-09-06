import React, { useEffect, useRef, useState, useMemo, memo } from "react";
import { Copy, RefreshCw, Check, ThumbsUp, ThumbsDown, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/client/supabase";
import { SmoothMarkdownRenderer } from "@/client/components/tutor/SmoothMarkdownRenderer";
import { ThinkingSweep } from "@/client/components/tutor/ThinkingSweep";
import { ToolStepPill } from "@/client/components/tutor/ToolStepPill";
import { BubbleThinkingPanel } from "./bubble/BubbleThinkingPanel";
import { BubbleAttachment } from "./bubble/BubbleAttachment";
import { formatToolInProgressLabel } from "./tool-metadata";

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

    const toolMap = new Map<string, { toolName: string; isDone: boolean }>();

    // 1. Check direct m.toolInvocations
    if (Array.isArray(m.toolInvocations)) {
      for (const inv of m.toolInvocations) {
        const id = inv.toolCallId || inv.toolName;
        const isDone = inv.state === "result" || "result" in inv;
        toolMap.set(id, {
          toolName: inv.toolName,
          isDone: Boolean(toolMap.get(id)?.isDone || isDone),
        });
      }
    }

    // 2. Check m.parts for tool-invocation, tool-call, tool-result, and dynamic tool-*
    if (Array.isArray(m.parts)) {
      for (const p of m.parts as any[]) {
        if (p.type === "tool-invocation" && p.toolInvocation) {
          const inv = p.toolInvocation;
          const id = inv.toolCallId || inv.toolName;
          const isDone = inv.state === "result" || "result" in inv;
          toolMap.set(id, {
            toolName: inv.toolName,
            isDone: Boolean(toolMap.get(id)?.isDone || isDone),
          });
        } else if (p.type === "tool-call") {
          const id = p.toolCallId || p.toolName;
          toolMap.set(id, {
            toolName: p.toolName,
            isDone: Boolean(toolMap.get(id)?.isDone),
          });
        } else if (p.type === "tool-result") {
          const id = p.toolCallId || p.toolName;
          toolMap.set(id, {
            toolName: p.toolName,
            isDone: true,
          });
        } else if (typeof p.type === "string" && p.type.startsWith("tool-")) {
          const toolName = p.toolName || p.type.replace(/^tool-/, "");
          const id = p.toolCallId || toolName;
          const isDone = p.state === "output-available" || "output" in p || "result" in p;
          toolMap.set(id, {
            toolName,
            isDone: Boolean(toolMap.get(id)?.isDone || isDone),
          });
        }
      }
    }

    // 3. Fallback to DB persisted thinking-steps if no live tools detected
    if (toolMap.size === 0 && steps.length > 0) {
      for (const s of steps) {
        if (s.type === "tool-call") {
          const id = s.toolCallId || s.toolName;
          const hasResult = steps.some(
            (r: any) =>
              r.type === "tool-result" && (r.toolCallId === id || r.toolName === s.toolName),
          );
          toolMap.set(id, {
            toolName: s.toolName,
            isDone: hasResult,
          });
        }
      }
    }

    const toolStepsList = Array.from(toolMap.entries()).map(([id, data]) => ({
      id,
      toolName: data.toolName,
      isDone: data.isDone,
    }));

    return {
      reasoningSteps: steps.filter((s: any) => s.type === "reasoning"),
      toolSteps: toolStepsList,
    };
  }, [m.parts, m.toolInvocations]);

  const isStreamActive = isPending && isLast;
  const [typewriterFinished, setTypewriterFinished] = useState(!isStreamActive);

  useEffect(() => {
    if (isStreamActive) {
      setTypewriterFinished(false);
    }
  }, [isStreamActive]);

  const activeToolStep = useMemo(() => {
    return toolSteps.find((s) => !s.isDone);
  }, [toolSteps]);

  const hasActiveTool = Boolean(activeToolStep);

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
      // Fast responsiveness: trigger thinking indicator after 750ms of stream inactivity
      stallTimerRef.current = setTimeout(() => setIsStalled(true), 750);
    }
    return () => {
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
    };
  }, [displayText, isStreamActive]);

  useEffect(() => {
    if (!isStreamActive) return;
    stallTimerRef.current = setTimeout(() => setIsStalled(true), 750);
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
    <div className={`flex w-full group py-2.5 sm:py-3 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex flex-col relative ${
          isUser ? "max-w-[85%] sm:max-w-[75%]" : "w-full px-3 sm:px-8"
        }`}
      >
        <div
          className={`${
            isUser
              ? "px-5 py-3.5 bg-muted/60 text-foreground rounded-3xl rounded-tr-sm"
              : "px-0 py-1 bg-transparent text-foreground"
          } text-[15px] sm:text-base leading-relaxed relative transition-colors duration-200`}
        >
          {!isUser ? (
            <div className="flex flex-col w-full min-h-[38px]">
              {showBubbleCard ? (
                <div className="prose-ai relative animate-in fade-in duration-200">
                  <BubbleThinkingPanel reasoningSteps={reasoningSteps} />

                  <SmoothMarkdownRenderer
                    content={displayText}
                    isStreaming={isStreamActive}
                    onAnimationComplete={() => setTypewriterFinished(true)}
                    className={
                      (isStreamActive || !typewriterFinished) && !pauseLabel && !isStalled
                        ? "transition-opacity duration-200 streaming-cursor"
                        : "transition-opacity duration-200"
                    }
                  />
                  {/* Midstream thinking or active tool call indicator */}
                  {isStreamActive && (pauseLabel || isStalled || hasActiveTool) && (
                    <div className="mt-2 flex flex-col gap-1.5 animate-in fade-in duration-250">
                      {hasActiveTool && activeToolStep && (
                        <div className="flex items-center gap-2">
                          <ToolStepPill
                            key={`midstream-${activeToolStep.id}`}
                            toolName={activeToolStep.toolName}
                            isDone={false}
                          />
                        </div>
                      )}
                      <ThinkingSweep
                        label={
                          pauseLabel ||
                          (hasActiveTool && activeToolStep
                            ? formatToolInProgressLabel(activeToolStep.toolName)
                            : undefined)
                        }
                      />
                    </div>
                  )}

                  {/* Completed tool pills (or all tool pills once stream is finished) */}
                  {toolSteps.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {toolSteps
                        .filter((step) => !isStreamActive || step.isDone)
                        .map((step) => (
                          <ToolStepPill
                            key={step.id}
                            toolName={step.toolName}
                            isDone={step.isDone}
                          />
                        ))}
                    </div>
                  )}
                </div>
              ) : isStreamActive ? (
                /* In-flight initial thinking & tool execution in place inside the bubble */
                <div className="py-1 animate-in fade-in duration-200">
                  {toolSteps.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2 animate-in fade-in duration-250">
                      {toolSteps.map((step) => (
                        <ToolStepPill key={step.id} toolName={step.toolName} isDone={step.isDone} />
                      ))}
                    </div>
                  )}
                  <ThinkingSweep
                    label={
                      pauseLabel ||
                      (hasActiveTool && activeToolStep
                        ? formatToolInProgressLabel(activeToolStep.toolName)
                        : undefined)
                    }
                  />
                </div>
              ) : (
                toolSteps.length === 0 && (
                  <span className="text-xs text-muted-foreground italic mt-1">
                    No response generated. Please resend your question.
                  </span>
                )
              )}

              {/* Footer: action buttons + persistent G badge (only when finished and settled) */}
              {showBubbleCard && !isStreamActive && typewriterFinished && (
                <div className="flex flex-col gap-1.5 mt-2 animate-in fade-in duration-300">
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
              )}
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
