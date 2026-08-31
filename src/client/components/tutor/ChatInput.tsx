import { useEffect, useRef, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  FileText,
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
import { UsageBanners, useRateLimitCountdown, formatTime, checkIsRateLimited } from "./UsageBanner";

// Re-export countdown utilities for backwards compatibility
export { useRateLimitCountdown, formatTime, checkIsRateLimited };

type AttachedFile = {
  name: string;
  size: number;
  text: string;
};

type Props = {
  input: string;
  isPending: boolean;
  parsingFile: boolean;
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
  inputRef: externalInputRef,
  onScanClick,
  onVoiceClick,
  isListening,
}: Props) {
  const internalRef = useRef<HTMLTextAreaElement | null>(null);
  const textareaRef = externalInputRef ?? internalRef;
  const isRateLimited = useMemo(() => checkIsRateLimited(chatError), [chatError]);

  const { secondsLeft } = useRateLimitCountdown(
    isRateLimited ? chatError : null,
    onRateLimitExpired,
  );
  const isDisabled = isPending || parsingFile || isRateLimited;

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
      onSubmit(e as any);
    }
  };

  return (
    <div className="px-3 pb-4 pt-2 sm:px-6 sm:pb-6 relative z-10 w-full transition-all">
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

        {/* Attached file pill */}
        {attachedFile && (
          <div className="mb-2.5 flex items-center gap-3 rounded-2xl border border-primary/15 bg-primary/5 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-3 shadow-sm">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground leading-tight">
                {attachedFile.name}
              </p>
              <p className="font-mono text-xs text-muted-foreground mt-0.5 leading-tight">
                {formatFileSize(attachedFile.size)}
                {attachedFile.text.length > 8000 && (
                  <span className="ml-1.5 text-amber-500 font-medium">
                    · will be truncated to 8 000 chars
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
        <div className="relative flex flex-col rounded-3xl border border-border/80 bg-card shadow-sm dark:shadow-none hover:border-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 dark:focus-within:border-primary/50 dark:focus-within:ring-primary/20 transition-all duration-200 overflow-hidden">
          {/* File input: hidden with onClick reset so the file blob is untouched during onChange */}
          <input
            id="chat-file-input"
            type="file"
            className="hidden"
            accept=".pdf,.docx,.doc,.txt,.md,.csv,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={onFileChange}
            onClick={(e) => {
              (e.target as HTMLInputElement).value = "";
            }}
            disabled={isDisabled}
          />
          {/* Text Area */}
          <div className="px-4 pt-3">
            <textarea
              ref={textareaRef}
              className="min-h-[44px] sm:min-h-[40px] w-full resize-none bg-transparent py-1 text-[15px] sm:text-base leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 transition-opacity duration-200"
              rows={1}
              value={input}
              onChange={onInputChange}
              placeholder={
                isPending
                  ? "Waiting for response…"
                  : isRateLimited
                    ? secondsLeft > 0
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
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between px-3 pb-3 pt-1">
            {/* Action Menu (replaces individual attachment buttons) */}
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={isDisabled}
                    aria-label="Add attachment or voice"
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 border border-transparent ${
                      isDisabled
                        ? "opacity-40 cursor-not-allowed pointer-events-none"
                        : isListening
                          ? "text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/30 animate-pulse"
                          : "cursor-pointer text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:border-border/60 active:scale-90"
                    }`}
                  >
                    {parsingFile ? (
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
                  {/* 1. Upload Document */}
                  <DropdownMenuItem asChild className="cursor-pointer gap-2.5 p-2 rounded-lg">
                    <label
                      htmlFor={isDisabled ? undefined : "chat-file-input"}
                      className="flex w-full items-center"
                    >
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Document</span>
                    </label>
                  </DropdownMenuItem>

                  {/* 2. Scan with Camera */}
                  {onScanClick && (
                    <DropdownMenuItem
                      onClick={onScanClick}
                      className="cursor-pointer gap-2.5 p-2 rounded-lg"
                    >
                      <Camera className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Image</span>
                    </DropdownMenuItem>
                  )}

                  {/* 3. Voice Input */}
                  {onVoiceClick && (
                    <DropdownMenuItem
                      onClick={onVoiceClick}
                      className="cursor-pointer gap-2.5 p-2 rounded-lg"
                    >
                      <Mic
                        className={`h-4 w-4 ${isListening ? "text-red-500" : "text-muted-foreground"}`}
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
                className={`flex flex-shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                  isPending
                    ? "h-10 w-10 bg-transparent border-2 border-primary text-primary hover:bg-primary/10 active:scale-95"
                    : isDisabled || (!input.trim() && !attachedFile)
                      ? "h-10 w-10 bg-muted/60 text-muted-foreground opacity-40 cursor-not-allowed"
                      : "h-10 w-10 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:scale-105 active:scale-95"
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
