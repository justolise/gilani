/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Send,
  Square,
  Trash2,
  Camera,
  Mic,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import { SlashCommandMenu, SLASH_COMMANDS, type SlashCommand } from "./SlashCommandMenu";
import {
  UsageBanners,
  useRateLimitCountdown,
  formatTime,
  formatDailyResetHours,
  formatDailyResetShort,
  checkIsRateLimited,
} from "./UsageBanner";

// Re-export countdown utilities for backwards compatibility
export {
  useRateLimitCountdown,
  formatTime,
  formatDailyResetHours,
  formatDailyResetShort,
  checkIsRateLimited,
};

type AttachedFile = {
  name: string;
  size: number;
  text: string;
  /** Blob URL for image preview thumbnail */
  previewUrl?: string;
  mimeType?: string;
};

type UploadPhase = "idle" | "uploading" | "extracting";

type Props = {
  input: string;
  isPending: boolean;
  parsingFile: boolean;
  /** Fine-grained upload phase — takes precedence over parsingFile when provided */
  uploadPhase?: UploadPhase;
  attachedFile: AttachedFile | null;
  chatError: string | null;
  docUploadError: string | null;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onClearDocError: () => void;
  onUpgrade?: () => void;
  onStop?: () => void;
  /** Called when a rate-limit countdown finishes so the parent can clear the error and refresh status */
  onRateLimitExpired?: () => void;
  messagesUsed?: number;
  messagesMax?: number;
  isRateLimited?: boolean;
  /** Optional ref so parent can programmatically focus the textarea (e.g. after clicking Edit on a bubble) */
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  onScanClick?: () => void;
  onVoiceClick?: () => void;
  isListening?: boolean;
};

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function ChatInput({
  input,
  isPending,
  parsingFile,
  uploadPhase = "idle",
  attachedFile,
  chatError,
  docUploadError,
  onInputChange,
  onSubmit,
  onFileChange,
  onRemoveFile,
  onClearDocError,
  onUpgrade,
  onStop,
  onRateLimitExpired,
  messagesUsed = 0,
  messagesMax = undefined,
  isRateLimited: explicitIsRateLimited = false,
  inputRef: externalInputRef,
  onScanClick,
  onVoiceClick,
  isListening,
}: Props) {
  const internalRef = useRef<HTMLTextAreaElement | null>(null);
  const textareaRef = externalInputRef ?? internalRef;

  const isRateLimited = useMemo(
    () =>
      Boolean(
        explicitIsRateLimited ||
        checkIsRateLimited(chatError) ||
        (messagesMax && messagesMax > 0 && messagesUsed >= messagesMax),
      ),
    [explicitIsRateLimited, chatError, messagesMax, messagesUsed],
  );

  // Use uploadPhase when available; fall back to parsingFile boolean for compat
  const activePhase: UploadPhase =
    uploadPhase !== "idle" ? uploadPhase : parsingFile ? "uploading" : "idle";
  const isProcessingFile = activePhase !== "idle";

  const phaseLabel =
    activePhase === "uploading"
      ? "Uploading…"
      : activePhase === "extracting"
        ? "Extracting text…"
        : null;

  const { secondsLeft, isDaily } = useRateLimitCountdown(
    isRateLimited ? chatError : null,
    onRateLimitExpired,
  );
  const isDisabled = isPending || isProcessingFile || isRateLimited;

  const isImageAttachment = !!(
    attachedFile?.mimeType?.startsWith("image/") || attachedFile?.previewUrl
  );

  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashIndex, setSlashIndex] = useState(0);

  const isTypingSlash = useMemo(() => {
    return input.startsWith("/") && !input.includes(" ") && input.length <= 15;
  }, [input]);

  const activeSlashOpen = isTypingSlash && slashMenuOpen;

  useEffect(() => {
    if (isTypingSlash) {
      setSlashMenuOpen(true);
    } else {
      setSlashMenuOpen(false);
    }
  }, [isTypingSlash]);

  const filteredCommands = useMemo(() => {
    const q = input.replace(/^\//, "").toLowerCase().trim();
    return SLASH_COMMANDS.filter(
      (cmd) => cmd.key.toLowerCase().includes(q) || cmd.description.toLowerCase().includes(q),
    );
  }, [input]);

  const handleSelectSlash = (cmd: SlashCommand) => {
    onInputChange({ target: { value: cmd.promptPrefix } } as any);
    setSlashMenuOpen(false);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = cmd.promptPrefix.length;
        textareaRef.current.selectionEnd = cmd.promptPrefix.length;
      }
    }, 10);
  };

  // Auto-grow textarea: reset to auto, then set to scrollHeight capped at ~5 rows (160px)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    if (input) {
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  }, [input, textareaRef]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (activeSlashOpen && filteredCommands.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashIndex((i) => (i + 1) % filteredCommands.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashIndex((i) => (i - 1 + filteredCommands.length) % filteredCommands.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const chosen = filteredCommands[slashIndex];
        if (chosen) {
          handleSelectSlash(chosen);
          return;
        }
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setSlashMenuOpen(false);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isDisabled) return;
      onSubmit(e as any);
    }
  };

  return (
    <div className="px-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-2 sm:px-6 sm:pb-6 relative z-10 w-full transition-all">
      <div className="lg:max-w-3xl lg:mx-auto relative">
        {activeSlashOpen && (
          <SlashCommandMenu
            filter={input}
            selectedIndex={slashIndex}
            setSelectedIndex={setSlashIndex}
            onSelect={handleSelectSlash}
            onClose={() => setSlashMenuOpen(false)}
          />
        )}
        {/* Shared Usage & Error Banners */}
        <UsageBanners
          chatError={chatError}
          docUploadError={docUploadError}
          onClearDocError={onClearDocError}
          onUpgrade={onUpgrade}
          onRateLimitExpired={onRateLimitExpired}
          messagesUsed={messagesUsed}
          messagesMax={messagesMax}
          isRateLimited={isRateLimited}
          className="mb-2.5"
        />

        {/* Loading pill — shown while uploading / extracting text */}
        {isProcessingFile && (
          <div className="mb-2.5 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-3 shadow-sm animate-in fade-in duration-300">
            <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground leading-tight">
                {attachedFile?.name ?? "Preparing file…"}
              </p>
              <p className="text-xs text-primary/80 font-medium mt-0.5 leading-tight flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {phaseLabel}
              </p>
            </div>
          </div>
        )}

        {/* Attached file pill — shown after processing is complete */}
        {attachedFile && !isProcessingFile && (
          <div className="mb-2.5 flex items-center gap-3 rounded-2xl border border-primary/15 bg-primary/5 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-3 shadow-sm">
            {isImageAttachment && attachedFile.previewUrl ? (
              <div className="shrink-0 h-10 w-10 rounded-xl overflow-hidden border border-primary/20 bg-muted">
                <img
                  src={attachedFile.previewUrl}
                  alt={attachedFile.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                {isImageAttachment ? (
                  <ImageIcon className="h-4 w-4 text-primary" />
                ) : (
                  <FileText className="h-4 w-4 text-primary" />
                )}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground leading-tight">
                {attachedFile.name}
              </p>
              <p className="font-mono text-xs text-muted-foreground mt-0.5 leading-tight flex flex-wrap items-center gap-x-1.5">
                {formatFileSize(attachedFile.size)}
                {isImageAttachment && (
                  <span className="text-emerald-500 dark:text-emerald-400 font-semibold">
                    · Text extracted
                  </span>
                )}
                {!isImageAttachment && attachedFile.text.length > 8000 && (
                  <span className="text-amber-500 font-medium">
                    · will be truncated to 8 000 chars
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onRemoveFile}
              className="shrink-0 rounded-xl p-2 text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive active:scale-90 min-h-10 min-w-10 flex items-center justify-center cursor-pointer"
              title="Remove attachment"
              type="button"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Main input pill: [+ actions] [textarea] [send] ── */}
        <div
          className={`flex items-end gap-2 rounded-3xl border bg-card/85 backdrop-blur-xl shadow-sm dark:shadow-none transition-all duration-200 px-2 py-2 ${
            isListening
              ? "border-red-500/60 ring-2 ring-red-500/20 animate-pulse"
              : "border-border/70 hover:border-border/90 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20"
          }`}
        >
          {/* Hidden file input */}
          <input
            id="chat-file-input"
            type="file"
            className="hidden"
            accept="image/*,.pdf,.docx,.doc,.txt,.md,.csv,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={onFileChange}
            onClick={(e) => {
              (e.target as HTMLInputElement).value = "";
            }}
            disabled={isDisabled}
          />

          {/* Left: attachment / voice dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={isDisabled}
                aria-label="Add attachment or voice"
                className={`shrink-0 flex h-9 w-9 min-h-11 min-w-11 items-center justify-center rounded-2xl transition-all duration-200 cursor-pointer ${
                  isDisabled
                    ? "opacity-40 cursor-not-allowed pointer-events-none text-muted-foreground"
                    : isListening
                      ? "text-red-500 bg-red-50 dark:bg-red-950/30 animate-pulse"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground active:scale-90"
                }`}
              >
                {isProcessingFile ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : isListening ? (
                  <span className="relative flex h-4 w-4 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={8} className="w-52 p-1.5 z-50">
              {/* Upload Document / Image from gallery */}
              <DropdownMenuItem
                asChild
                className="cursor-pointer gap-2.5 p-2.5 rounded-xl min-h-11"
              >
                <label
                  htmlFor={isDisabled ? undefined : "chat-file-input"}
                  className="flex w-full items-center cursor-pointer"
                >
                  <Paperclip className="h-4 w-4 text-muted-foreground mr-2.5" />
                  <span className="text-sm font-medium">Document / Image</span>
                </label>
              </DropdownMenuItem>

              {/* Scan with Camera */}
              {onScanClick && (
                <DropdownMenuItem
                  onClick={onScanClick}
                  className="cursor-pointer gap-2.5 p-2.5 rounded-xl min-h-11"
                >
                  <Camera className="h-4 w-4 text-muted-foreground mr-2.5" />
                  <span className="text-sm font-medium">Scan (Camera)</span>
                </DropdownMenuItem>
              )}

              {/* Voice Input */}
              {onVoiceClick && (
                <DropdownMenuItem
                  onClick={onVoiceClick}
                  className="cursor-pointer gap-2.5 p-2.5 rounded-xl min-h-11"
                >
                  <Mic
                    className={`h-4 w-4 mr-2.5 ${isListening ? "text-red-500" : "text-muted-foreground"}`}
                  />
                  <span className="text-sm font-medium">
                    {isListening ? "Stop Voice" : "Voice"}
                  </span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Center: auto-growing textarea */}
          <textarea
            ref={textareaRef}
            className="flex-1 min-w-0 resize-none bg-transparent py-2.5 text-base leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 transition-all duration-150"
            rows={1}
            value={input}
            onChange={onInputChange}
            placeholder={
              isPending
                ? "Waiting for response…"
                : isRateLimited
                  ? isDaily
                    ? `Daily limit reached. Resets in ${formatDailyResetHours(secondsLeft)}`
                    : secondsLeft > 0
                      ? `Cooling down… ${formatTime(secondsLeft)}`
                      : "Rate limit reached…"
                  : parsingFile
                    ? "Parsing document…"
                    : "Ask GilaniAI anything…"
            }
            disabled={isDisabled}
            onKeyDown={handleKeyDown}
            maxLength={4000}
            style={{ maxHeight: 160, overflowY: input ? "auto" : "hidden" }}
          />

          {/* Right: Send / Stop */}
          <button
            type="button"
            onClick={(e) => {
              if (isPending) {
                onStop?.();
              } else {
                onSubmit(e as any);
              }
            }}
            disabled={!isPending && (isDisabled || (!input.trim() && !attachedFile))}
            title={isPending ? "Stop generating" : "Send (Enter)"}
            aria-label={isPending ? "Stop generating" : "Send message"}
            className={`shrink-0 flex items-center justify-center rounded-full transition-all duration-200 min-h-11 min-w-11 h-9 w-9 ${
              isPending
                ? "bg-transparent border-2 border-primary text-primary hover:bg-primary/10 active:scale-95 cursor-pointer"
                : isDisabled || (!input.trim() && !attachedFile)
                  ? "bg-muted/60 text-muted-foreground opacity-40 cursor-not-allowed"
                  : "bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:shadow-primary/25 hover:bg-primary/90 hover:scale-[1.04] active:scale-[0.96] cursor-pointer"
            }`}
          >
            {isPending ? <Square className="h-4 w-4" /> : <Send className="h-4 w-4 ml-0.5" />}
          </button>
        </div>

        {/* Disclaimer */}
        <div className="mt-1.5 flex justify-center px-1 w-full min-w-0 overflow-hidden">
          <Link
            to="/faq"
            hash="can-the-ai-make-mistakes"
            className="block w-full min-w-0 font-mono text-xs text-muted-foreground/60 text-center leading-tight whitespace-nowrap overflow-hidden text-ellipsis hover:text-muted-foreground/90 hover:underline transition-colors"
          >
            GilaniAI can make mistakes. Please check responses.
          </Link>
        </div>

        {/* Char count — only while typing */}
        {input.length > 0 && (
          <div className="mt-1 flex justify-end px-1 animate-in fade-in duration-200">
            <span
              className={`font-mono text-xs font-medium tabular-nums transition-colors duration-200 ${
                4000 - input.length < 200
                  ? "text-red-500 animate-pulse"
                  : input.length > 3000
                    ? "text-amber-500"
                    : "text-muted-foreground/70"
              }`}
            >
              {(4000 - input.length).toLocaleString()} left
            </span>
          </div>
        )}
      </div>
      {/* end lg:max-w-3xl wrapper */}
    </div>
  );
}
