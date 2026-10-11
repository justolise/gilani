/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  ArrowUp,
  Square,
  Trash2,
  Camera,
  Mic,
  Plus,
  Sparkles,
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
      ? "Uploading document…"
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

  // Auto-grow textarea: reset to auto, then set to scrollHeight capped at ~220px
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    if (input) {
      el.style.height = `${Math.min(Math.max(el.scrollHeight, 48), 220)}px`;
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
      if (isDisabled || (!input.trim() && !attachedFile)) return;
      onSubmit(e as any);
    }
  };

  const placeholderText = useMemo(() => {
    if (isPending) return "GilaniAI is thinking…";
    if (isRateLimited) {
      if (isDaily) return `Daily limit reached. Resets in ${formatDailyResetHours(secondsLeft)}`;
      if (secondsLeft > 0) return `Cooling down… ${formatTime(secondsLeft)}`;
      return "Rate limit reached…";
    }
    if (isProcessingFile) return phaseLabel || "Processing file…";
    return "Reply to GilaniAI or ask anything…";
  }, [isPending, isRateLimited, isDaily, secondsLeft, isProcessingFile, phaseLabel]);

  const canSend = !isPending && !isDisabled && (Boolean(input.trim()) || Boolean(attachedFile));

  return (
    <div className="px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-1.5 sm:px-6 sm:pb-5 relative z-10 w-full transition-all">
      <div className="lg:max-w-3xl lg:mx-auto relative">
        {/* Slash Command popup menu */}
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
          className="mb-2"
        />

        {/* ── Claude-Style Unified Input Card ── */}
        <div
          className={`relative flex flex-col rounded-2xl sm:rounded-3xl border bg-card/95 dark:bg-card/90 backdrop-blur-xl shadow-xs transition-all duration-200 ${
            isListening
              ? "border-red-500/70 ring-2 ring-red-500/20 shadow-sm shadow-red-500/10"
              : "border-border/80 hover:border-border dark:border-border/70 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15 focus-within:shadow-md"
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

          {/* Top: Attached file or extraction pill inside card */}
          {isProcessingFile && (
            <div className="mx-3 mt-3 flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2 text-xs animate-in fade-in duration-200">
              <div className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground leading-tight">
                  {attachedFile?.name ?? "Preparing document…"}
                </p>
                <p className="text-[11px] text-primary/80 font-medium mt-0.5 leading-tight flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  {phaseLabel}
                </p>
              </div>
            </div>
          )}

          {attachedFile && !isProcessingFile && (
            <div className="mx-3 mt-3 flex items-center gap-2.5 rounded-xl border border-border/70 bg-muted/60 dark:bg-muted/30 px-3 py-2 text-xs shadow-xs animate-in fade-in duration-200">
              {isImageAttachment && attachedFile.previewUrl ? (
                <div className="shrink-0 h-9 w-9 rounded-lg overflow-hidden border border-border/70 bg-muted">
                  <img
                    src={attachedFile.previewUrl}
                    alt={attachedFile.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {isImageAttachment ? (
                    <ImageIcon className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground leading-tight">
                  {attachedFile.name}
                </p>
                <p className="font-mono text-[11px] text-muted-foreground mt-0.5 leading-tight flex flex-wrap items-center gap-x-1.5">
                  <span>{formatFileSize(attachedFile.size)}</span>
                  {isImageAttachment && (
                    <span className="text-emerald-500 dark:text-emerald-400 font-semibold">
                      · Text extracted
                    </span>
                  )}
                  {!isImageAttachment && attachedFile.text.length > 8000 && (
                    <span className="text-amber-500 font-medium">· Truncated to 8k chars</span>
                  )}
                </p>
              </div>
              <button
                onClick={onRemoveFile}
                className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-all duration-150 hover:bg-destructive/10 hover:text-destructive active:scale-95 flex items-center justify-center cursor-pointer"
                title="Remove attachment"
                type="button"
                aria-label="Remove attachment"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Middle: Claude-style Roomy Textarea */}
          <div className="relative w-full px-3 pt-3 pb-1 sm:px-4 sm:pt-3.5 sm:pb-1.5">
            <textarea
              ref={textareaRef}
              className="w-full resize-none bg-transparent text-[15px] sm:text-base leading-relaxed text-foreground placeholder:text-muted-foreground/45 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 transition-all duration-150"
              rows={1}
              value={input}
              onChange={onInputChange}
              placeholder={placeholderText}
              disabled={isDisabled}
              onKeyDown={handleKeyDown}
              maxLength={4000}
              style={{
                minHeight: 44,
                maxHeight: 220,
                overflowY: input ? "auto" : "hidden",
              }}
            />
          </div>

          {/* Bottom Toolbar: Controls & Send Button (like Claude) */}
          <div className="flex items-center justify-between px-2.5 pb-2 pt-0.5 sm:px-3 sm:pb-2.5">
            {/* Left Tools */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Attachment Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={isDisabled}
                    aria-label="Add attachment or voice"
                    title="Add attachment"
                    className={`flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full transition-all duration-150 cursor-pointer ${
                      isDisabled
                        ? "opacity-40 cursor-not-allowed pointer-events-none text-muted-foreground"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground active:scale-95"
                    }`}
                  >
                    {isProcessingFile ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <Plus className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={6} className="w-52 p-1.5 z-50">
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer gap-2.5 p-2 rounded-xl text-xs"
                  >
                    <label
                      htmlFor={isDisabled ? undefined : "chat-file-input"}
                      className="flex w-full items-center cursor-pointer"
                    >
                      <Paperclip className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="font-medium">Document / Image</span>
                    </label>
                  </DropdownMenuItem>

                  {onScanClick && (
                    <DropdownMenuItem
                      onClick={onScanClick}
                      className="cursor-pointer gap-2.5 p-2 rounded-xl text-xs"
                    >
                      <Camera className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="font-medium">Scan (Camera)</span>
                    </DropdownMenuItem>
                  )}

                  {onVoiceClick && (
                    <DropdownMenuItem
                      onClick={onVoiceClick}
                      className="cursor-pointer gap-2.5 p-2 rounded-xl text-xs"
                    >
                      <Mic
                        className={`h-4 w-4 mr-2 ${isListening ? "text-red-500" : "text-muted-foreground"}`}
                      />
                      <span className="font-medium">
                        {isListening ? "Stop Voice" : "Voice Input"}
                      </span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Direct Voice Button */}
              {onVoiceClick && (
                <button
                  type="button"
                  onClick={onVoiceClick}
                  disabled={isDisabled && !isListening}
                  title={isListening ? "Stop voice listening" : "Voice input"}
                  aria-label={isListening ? "Stop voice listening" : "Voice input"}
                  className={`flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full transition-all duration-150 cursor-pointer ${
                    isListening
                      ? "text-red-500 bg-red-500/15 ring-2 ring-red-500/30 animate-pulse"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground active:scale-95"
                  } ${isDisabled && !isListening ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <Mic className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </button>
              )}

              {/* Direct Camera Scan Button (when onScanClick available) */}
              {onScanClick && (
                <button
                  type="button"
                  onClick={onScanClick}
                  disabled={isDisabled}
                  title="Scan notes with camera"
                  aria-label="Scan notes with camera"
                  className={`hidden sm:flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground active:scale-95 transition-all duration-150 cursor-pointer ${
                    isDisabled ? "opacity-40 cursor-not-allowed" : ""
                  }`}
                >
                  <Camera className="h-4 w-4" />
                </button>
              )}

              {/* Slash Command Helper Trigger */}
              <button
                type="button"
                onClick={() => {
                  if (isDisabled) return;
                  onInputChange({ target: { value: "/" } } as any);
                  setSlashMenuOpen(true);
                  textareaRef.current?.focus();
                }}
                disabled={isDisabled}
                title="Slash commands (type /)"
                aria-label="Slash commands"
                className={`hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-mono text-muted-foreground/75 hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer ${
                  isDisabled ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                <Sparkles className="h-3 w-3 text-primary/70" />
                <span>/commands</span>
              </button>
            </div>

            {/* Right Tools: Char count & Send / Stop Button */}
            <div className="flex items-center gap-2">
              {/* Character limit counter (shown while typing) */}
              {input.length > 0 && (
                <span
                  className={`font-mono text-[11px] font-medium tabular-nums px-1 transition-colors duration-150 ${
                    4000 - input.length < 200
                      ? "text-destructive font-bold animate-pulse"
                      : input.length > 3000
                        ? "text-amber-500"
                        : "text-muted-foreground/60"
                  }`}
                >
                  {4000 - input.length}
                </span>
              )}

              {/* Claude-Style Circular Send / Stop Button */}
              <button
                type="button"
                onClick={(e) => {
                  if (isPending) {
                    onStop?.();
                  } else {
                    onSubmit(e as any);
                  }
                }}
                disabled={!isPending && !canSend}
                title={isPending ? "Stop generating" : "Send message (Enter)"}
                aria-label={isPending ? "Stop generating" : "Send message"}
                className={`shrink-0 flex items-center justify-center rounded-full sm:rounded-xl transition-all duration-200 h-8 w-8 sm:h-9 sm:w-9 ${
                  isPending
                    ? "bg-foreground text-background hover:opacity-90 active:scale-95 shadow-xs cursor-pointer"
                    : canSend
                      ? "bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:shadow-primary/25 hover:bg-primary/95 hover:scale-105 active:scale-95 cursor-pointer"
                      : "bg-muted/60 text-muted-foreground/40 cursor-not-allowed"
                }`}
              >
                {isPending ? (
                  <Square className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <ArrowUp className="h-4 w-4 stroke-[2.5]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Claude-Style Subdued Disclaimer */}
        <div className="mt-1.5 flex justify-center px-1 w-full min-w-0 overflow-hidden">
          <Link
            to="/faq"
            hash="can-the-ai-make-mistakes"
            className="block w-full min-w-0 font-sans text-[11px] text-muted-foreground/60 text-center leading-tight whitespace-nowrap overflow-hidden text-ellipsis hover:text-muted-foreground/90 hover:underline transition-colors"
          >
            GilaniAI can make mistakes. Please verify important information.
          </Link>
        </div>
      </div>
    </div>
  );
}
