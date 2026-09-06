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
  const [isFocused, setIsFocused] = useState(false);

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

  // Compact mode: single-row on mobile when idle and empty
  const isCompact = !input.trim() && !attachedFile && !isPending && !isListening && !isFocused;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      if (input !== "") {
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
      }
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isDisabled) return;
      onSubmit(e as any);
    }
  };

  return (
    <div className="px-3 pb-[calc(1rem+var(--safe-bottom,0px))] pt-2 sm:px-6 sm:pb-6 relative z-10 w-full transition-all">
      <div className="lg:max-w-3xl lg:mx-auto">
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
            {/* Spinner */}
            <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
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
            {/* Thumbnail for images, document icon for everything else */}
            {isImageAttachment && attachedFile.previewUrl ? (
              <div className="flex-shrink-0 h-10 w-10 rounded-xl overflow-hidden border border-primary/20 bg-muted">
                <img
                  src={attachedFile.previewUrl}
                  alt={attachedFile.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                {isImageAttachment ? (
                  <ImageIcon className="h-4 w-4 text-primary" />
                ) : (
                  <FileText className="h-4 w-4 text-primary" />
                )}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground leading-tight">
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
              className="flex-shrink-0 rounded-xl p-1.5 text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive active:scale-90"
              title="Remove attachment"
              type="button"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Main input container with theme-aware borders & elevation */}
        <div className="relative flex flex-col rounded-3xl border border-border/70 bg-card/85 backdrop-blur-xl shadow-sm dark:shadow-none hover:border-border/90 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200 overflow-hidden">
          {/* File input: hidden — accepts documents AND images from gallery */}
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
          {/* Text Area */}
          <div className={`px-4 ${isCompact ? "pt-2 pb-1 flex items-center gap-2" : "pt-3"}`}>
            <textarea
              ref={textareaRef}
              className={`w-full resize-none bg-transparent text-[15px] sm:text-base leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 transition-all duration-200 ${isCompact ? "min-h-[36px] py-1.5 flex-1" : "min-h-[44px] sm:min-h-[40px] py-1"}`}
              rows={1}
              value={input}
              onChange={onInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
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
              style={{ maxHeight: 160, overflowY: "hidden" }}
            />

            {/* Compact inline action buttons (mobile idle state) */}
            {isCompact && (
              <div className="flex items-center gap-1 flex-shrink-0 sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      disabled={isDisabled}
                      aria-label="Add attachment or voice"
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all active:scale-90 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={8} className="w-48 p-1.5 z-50">
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer gap-2.5 p-2 rounded-lg min-h-[44px]"
                    >
                      <label
                        htmlFor={isDisabled ? undefined : "chat-file-input"}
                        className="flex w-full items-center cursor-pointer"
                      >
                        <Paperclip className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm font-medium">Document / Image</span>
                      </label>
                    </DropdownMenuItem>
                    {onScanClick && (
                      <DropdownMenuItem
                        onClick={onScanClick}
                        className="cursor-pointer gap-2.5 p-2 rounded-lg min-h-[44px]"
                      >
                        <Camera className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm font-medium">Scan (Camera)</span>
                      </DropdownMenuItem>
                    )}
                    {onVoiceClick && (
                      <DropdownMenuItem
                        onClick={onVoiceClick}
                        className="cursor-pointer gap-2.5 p-2 rounded-lg min-h-[44px]"
                      >
                        <Mic className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm font-medium">Voice</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Action Row — hidden on mobile when compact */}
          <div
            className={`flex items-center justify-between px-3 pb-3 pt-1 ${isCompact ? "hidden sm:flex" : "flex"}`}
          >
            {/* Action Menu (replaces individual attachment buttons) */}
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={isDisabled}
                    aria-label="Add attachment or voice"
                    className={`flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-all duration-200 border border-transparent cursor-pointer ${
                      isDisabled
                        ? "opacity-40 cursor-not-allowed pointer-events-none"
                        : isListening
                          ? "text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/30 animate-pulse"
                          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:border-border/60 active:scale-90"
                    }`}
                  >
                    {isProcessingFile ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : isListening ? (
                      <span className="relative flex h-4 w-4 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                      </span>
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={8} className="w-48 p-1.5 z-50">
                  {/* 1. Upload Document or pick Image from gallery */}
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer gap-2.5 p-2 rounded-lg min-h-[44px]"
                  >
                    <label
                      htmlFor={isDisabled ? undefined : "chat-file-input"}
                      className="flex w-full items-center cursor-pointer"
                    >
                      <Paperclip className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-sm font-medium">Document / Image</span>
                    </label>
                  </DropdownMenuItem>

                  {/* 2. Scan with Camera */}
                  {onScanClick && (
                    <DropdownMenuItem
                      onClick={onScanClick}
                      className="cursor-pointer gap-2.5 p-2 rounded-lg min-h-[44px]"
                    >
                      <Camera className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-sm font-medium">Scan (Camera)</span>
                    </DropdownMenuItem>
                  )}

                  {/* 3. Voice Input */}
                  {onVoiceClick && (
                    <DropdownMenuItem
                      onClick={onVoiceClick}
                      className="cursor-pointer gap-2.5 p-2 rounded-lg min-h-[44px]"
                    >
                      <Mic
                        className={`h-4 w-4 mr-2 ${isListening ? "text-red-500" : "text-muted-foreground"}`}
                      />
                      <span className="text-sm font-medium">
                        {isListening ? "Stop Voice" : "Voice"}
                      </span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-1">
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
                className={`flex flex-shrink-0 items-center justify-center rounded-full transition-all duration-200 min-h-[44px] min-w-[44px] ${
                  isPending
                    ? "h-11 w-11 bg-transparent border-2 border-primary text-primary hover:bg-primary/10 active:scale-95 cursor-pointer"
                    : isDisabled || (!input.trim() && !attachedFile)
                      ? "h-11 w-11 bg-muted/60 text-muted-foreground opacity-40 cursor-not-allowed"
                      : "h-11 w-11 bg-primary text-primary-foreground shadow-xs hover:shadow-md hover:shadow-primary/25 hover:bg-primary/90 hover:scale-[1.04] active:scale-[0.96] cursor-pointer"
                }`}
              >
                {isPending ? <Square className="h-4 w-4" /> : <Send className="h-4 w-4 ml-0.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer hint / char count — desktop */}
        <div className="mt-1.5 hidden md:flex items-center justify-end px-1 min-h-[14px]">
          {input.length > 0 && (
            <span
              className={`font-mono text-xs font-medium tabular-nums transition-colors ${input.length > 3000 ? "text-amber-500" : "text-muted-foreground/70"}`}
            >
              {input.length.toLocaleString()} chars
            </span>
          )}
        </div>

        {/* Disclaimer — readable micro-typography, always visible */}
        <div className="mt-1.5 flex justify-center px-1 w-full min-w-0 overflow-hidden">
          <Link
            to="/faq"
            hash="can-the-ai-make-mistakes"
            className="block w-full min-w-0 font-mono text-[11px] sm:text-xs text-muted-foreground/60 text-center leading-tight whitespace-nowrap overflow-hidden text-ellipsis hover:text-muted-foreground/90 hover:underline transition-colors"
          >
            GilaniAI can make mistakes. Please check responses.
          </Link>
        </div>

        {/* Mobile: only show char count when typing */}
        {input.length > 0 && (
          <div className="mt-1 flex justify-end px-1 sm:hidden animate-in fade-in duration-200">
            <span
              className={`font-mono text-xs font-medium tabular-nums ${input.length > 3000 ? "text-amber-500" : "text-muted-foreground/70"}`}
            >
              {input.length.toLocaleString()} chars
            </span>
          </div>
        )}
      </div>
      {/* end lg:max-w-3xl wrapper */}
    </div>
  );
}
