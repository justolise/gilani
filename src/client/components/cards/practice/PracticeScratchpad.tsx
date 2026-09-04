import React from "react";
import { Pencil, Send, Sparkles, Lightbulb } from "lucide-react";
import { toast } from "sonner";

export function sendChatMessageToTutor(text: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("custom:send-chat-message", {
        detail: { text },
      }),
    );
  }
}

interface PracticeScratchpadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: string;
  onDraftChange: (val: string) => void;
  hasAnswer?: boolean;
  onShowAnswer?: () => void;
  questionNumber?: number;
  questionText?: string;
}

export function PracticeScratchpad({
  open,
  onOpenChange,
  draft,
  onDraftChange,
  hasAnswer = false,
  onShowAnswer,
  questionNumber,
  questionText,
}: PracticeScratchpadProps) {
  const handleSendAttempt = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const qNum =
      questionNumber != null ? `Practice Question ${questionNumber}` : "this practice question";
    const prompt = `Here is my attempt for ${qNum}:\n\n"${trimmed}"\n\nPlease check my work, tell me if it is correct, and explain any corrections or steps needed.`;
    sendChatMessageToTutor(prompt);
    toast.success("Attempt sent to tutor!");
  };

  const handleAskSolution = () => {
    const qNum =
      questionNumber != null ? `Practice Question ${questionNumber}` : "this practice question";
    const qSnippet = questionText ? `:\n\n"${questionText.trim()}"` : "";
    const prompt = `Could you please provide the complete, step-by-step worked solution and explanation for ${qNum}${qSnippet}?`;
    sendChatMessageToTutor(prompt);
    toast.success("Solution requested from tutor!");
  };

  return (
    <div className="px-4 sm:px-5 pb-2">
      {!open ? (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline underline-offset-4 cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5" />
          {hasAnswer
            ? "Try answering before checking solution"
            : "Write your answer / attempt here"}
        </button>
      ) : (
        <div className="rounded-xl border border-border/80 bg-muted/20 p-3 mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Pencil className="h-3.5 w-3.5 text-primary" />
              Your Scratchpad / Attempt:
            </span>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Hide
            </button>
          </div>
          <textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder="Type your workings or answer here..."
            rows={2}
            className="w-full rounded-lg border border-border bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleSendAttempt}
              disabled={!draft.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-xs hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-98"
            >
              <Send className="h-3.5 w-3.5" />
              Send Attempt to Tutor
            </button>

            {hasAnswer ? (
              <button
                type="button"
                onClick={onShowAnswer}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/10 text-primary font-semibold text-xs hover:bg-primary/20 cursor-pointer transition-all active:scale-98"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Check Solution
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAskSolution}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/10 text-primary font-semibold text-xs hover:bg-primary/20 cursor-pointer transition-all active:scale-98"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                Ask Tutor for Solution
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
