import React, { useEffect, useRef, useState, useMemo, memo } from "react";
import {
  Copy,
  RefreshCw,
  Check,
  ThumbsUp,
  ThumbsDown,
  Pencil,
  Trash2,
  GraduationCap,
  FileDown,
  Sparkles,
} from "lucide-react";
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
  onExportPDF,
  onEscalate,
  escalationStatus,
  escalating,
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

    return {
      reasoningSteps: steps,
      toolSteps: Array.from(toolMap.entries()).map(([id, t]) => ({
        id,
        toolName: t.toolName,
        isDone: t.isDone,
      })),
    };
  }, [m.parts, m.toolInvocations]);

  const isStreamActive = isPending && isLast;
  const hasActiveTool = toolSteps.some((s) => !s.isDone);
  const activeToolStep = toolSteps.find((s) => !s.isDone);

  // Typewriter completion tracking
  const [typewriterFinished, setTypewriterFinished] = useState(!isStreamActive);
  useEffect(() => {
    if (isStreamActive) {
      setTypewriterFinished(false);
    } else {
      setTypewriterFinished(true);
    }
  }, [isStreamActive]);

  // Midstream stall detection: if stream is active but no new text has arrived in 750ms
  const [isStalled, setIsStalled] = useState(false);
  const lastTextRef = useRef(displayText);
  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isStreamActive) {
      setIsStalled(false);
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
      return;
    }

    if (displayText !== lastTextRef.current) {
      lastTextRef.current = displayText;
      setIsStalled(false);
    }

    stallTimerRef.current = setTimeout(() => setIsStalled(true), 750);

    return () => {
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
    };
  }, [displayText, isStreamActive]);

  const showBubbleCard = displayText.length > 0;
  const isUser = m.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(displayText);
    setCopied(true);
    toast.success("Copied to clipboard!");

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
      toast.success(newVote === 1 ? "Thanks for your feedback! 👍" : "Noted — we'll improve! 👎");
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

  const formattedTime = m.createdAt
    ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  /* ──────────────────────────────────────────────────────────
     USER BUBBLE (Claude-Style Clean Floating Card)
  ────────────────────────────────────────────────────────── */
  if (isUser) {
    return (
      <div className="flex w-full group py-2 sm:py-3 justify-end animate-in fade-in duration-200">
        <div className="flex flex-col items-end max-w-[86%] sm:max-w-[75%] gap-1.5">
          <div className="px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl rounded-tr-md bg-muted/70 dark:bg-muted/40 border border-border/70 dark:border-border/50 text-foreground text-[15px] sm:text-base leading-relaxed shadow-xs transition-colors">
            {attachmentName && <BubbleAttachment attachmentName={attachmentName} />}
            <div className="flex flex-col gap-1">
              <span className="whitespace-pre-wrap font-sans text-foreground wrap-break-word select-text">
                {collapsed && displayText.length > COLLAPSE_THRESHOLD
                  ? displayText.slice(0, COLLAPSE_THRESHOLD) + "…"
                  : displayText}
              </span>
              {displayText.length > COLLAPSE_THRESHOLD && (
                <button
                  onClick={() => setCollapsed((p) => !p)}
                  className="self-start text-xs font-semibold text-primary hover:underline underline-offset-2 transition-colors cursor-pointer mt-1"
                  aria-expanded={!collapsed}
                >
                  {collapsed ? "Show more" : "Show less"}
                </button>
              )}
            </div>
          </div>

          {/* User Bubble Subtle Action Row (Claude-Style) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 px-1 text-xs text-muted-foreground">
            {formattedTime && (
              <span className="font-mono text-[10px] text-muted-foreground/60 mr-1.5 select-none">
                {formattedTime}
              </span>
            )}
            <button
              onClick={handleCopy}
              className="inline-flex items-center p-1 rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title="Copy prompt"
              aria-label="Copy prompt"
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
                className={`inline-flex items-center p-1 rounded-md transition-colors ${
                  isRateLimited
                    ? "opacity-40 cursor-not-allowed text-muted-foreground/50"
                    : "hover:bg-muted hover:text-foreground cursor-pointer"
                }`}
                title={isRateLimited ? "Rate limit reached" : "Edit prompt"}
                aria-label="Edit prompt"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(m.id)}
                className="inline-flex items-center p-1 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                title="Delete message"
                aria-label="Delete message"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────
     ASSISTANT BUBBLE (Claude-Style Roomy Editorial Flow)
  ────────────────────────────────────────────────────────── */
  return (
    <div className="flex w-full group py-3 sm:py-5 justify-start animate-in fade-in duration-250">
      <div className="flex flex-col w-full max-w-4xl mx-auto px-1 sm:px-4">
        {/* Assistant Header: Monogram Avatar + Name + Tutor badge */}
        <div className="flex items-center gap-2.5 mb-2.5 select-none">
          <div className="h-7 w-7 rounded-xl bg-primary/10 border border-primary/20 text-primary font-display font-bold flex items-center justify-center text-xs shadow-xs">
            G
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground tracking-tight">GilaniAI</span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 px-1.5 py-0.5 rounded-full bg-muted/60">
              Tutor
            </span>
          </div>
          {formattedTime && (
            <span className="font-mono text-[10px] text-muted-foreground/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              {formattedTime}
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="text-[15px] sm:text-base leading-relaxed text-foreground relative pl-0.5">
          {/* Initial thinking / tool indicator — shown before first chunk of text */}
          {isStreamActive && !showBubbleCard && (
            <div className="py-1">
              {toolSteps.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2 animate-in fade-in duration-200">
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
          )}

          {/* Content area: Thinking Panel + Markdown */}
          {showBubbleCard && (
            <div className="prose-ai relative">
              {/* Claude-Style Thinking Process Drawer */}
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

              {/* Midstream pause / thinking indicator */}
              {isStreamActive && (pauseLabel || isStalled || hasActiveTool) && (
                <div className="mt-3 flex flex-col gap-1.5 animate-in fade-in duration-250">
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

              {/* Completed tool pills */}
              {toolSteps.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {toolSteps
                    .filter((step) => !isStreamActive || step.isDone)
                    .map((step) => (
                      <ToolStepPill key={step.id} toolName={step.toolName} isDone={step.isDone} />
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Empty response fallback */}
          {!isStreamActive && !showBubbleCard && toolSteps.length === 0 && (
            <span className="text-xs text-muted-foreground italic mt-1 block">
              No response generated. Please retry your question.
            </span>
          )}

          {/* Claude-Style Action Toolbar Underneath Response */}
          {showBubbleCard && !isStreamActive && typewriterFinished && (
            <div className="flex items-center gap-1 sm:gap-1.5 mt-3 pt-1 border-t border-border/20 text-muted-foreground flex-wrap animate-in fade-in duration-250">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-muted cursor-pointer"
                title="Copy response"
                aria-label="Copy response"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-500 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {isLast && (
                <button
                  onClick={isRateLimited ? undefined : onReload}
                  disabled={isRateLimited}
                  className={`inline-flex items-center gap-1 text-xs font-medium transition-colors px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg ${
                    isRateLimited
                      ? "opacity-40 cursor-not-allowed text-muted-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                  }`}
                  title={isRateLimited ? "Rate limit reached" : "Retry response"}
                  aria-label="Retry response"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Retry</span>
                </button>
              )}

              <span className="w-px h-3.5 bg-border/60 mx-1 hidden sm:block" />

              <button
                onClick={() => handleVote(1)}
                disabled={voting}
                className={`inline-flex items-center p-1.5 rounded-lg transition-all duration-150 hover:bg-muted cursor-pointer active:scale-110 ${
                  vote === 1
                    ? "text-green-500 bg-green-500/10"
                    : "text-muted-foreground hover:text-green-500"
                }`}
                title="Helpful response"
                aria-label="Mark as helpful"
              >
                <ThumbsUp className={`h-3.5 w-3.5 ${vote === 1 ? "fill-current" : ""}`} />
              </button>

              <button
                onClick={() => handleVote(-1)}
                disabled={voting}
                className={`inline-flex items-center p-1.5 rounded-lg transition-all duration-150 hover:bg-muted cursor-pointer active:scale-110 ${
                  vote === -1
                    ? "text-destructive bg-destructive/10"
                    : "text-muted-foreground hover:text-destructive"
                }`}
                title="Not helpful"
                aria-label="Mark as not helpful"
              >
                <ThumbsDown className={`h-3.5 w-3.5 ${vote === -1 ? "fill-current" : ""}`} />
              </button>

              {onEscalate && (
                <>
                  <span className="w-px h-3.5 bg-border/60 mx-1 hidden sm:block" />
                  <button
                    onClick={onEscalate}
                    disabled={
                      escalating || escalationStatus === "open" || escalationStatus === "in_review"
                    }
                    className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg cursor-pointer ${
                      escalationStatus === "resolved"
                        ? "text-emerald-500 hover:bg-emerald-500/10"
                        : escalationStatus === "in_review" || escalationStatus === "open"
                          ? "text-amber-500 hover:bg-amber-500/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    title={
                      escalationStatus === "resolved"
                        ? "Teacher answered"
                        : escalationStatus === "in_review" || escalationStatus === "open"
                          ? "Under teacher review"
                          : "Ask teacher to review"
                    }
                    aria-label="Ask Teacher"
                  >
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>
                      {escalationStatus === "resolved"
                        ? "Answered"
                        : escalationStatus === "in_review" || escalationStatus === "open"
                          ? "Under Review"
                          : "Ask Teacher"}
                    </span>
                  </button>
                </>
              )}

              {onExportPDF && (
                <button
                  onClick={onExportPDF}
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-muted cursor-pointer ml-auto"
                  title="Export conversation as PDF"
                  aria-label="Export conversation as PDF"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">PDF</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
