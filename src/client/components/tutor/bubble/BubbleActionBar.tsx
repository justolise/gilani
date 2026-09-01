import { Copy, RefreshCw, Check, ThumbsUp, ThumbsDown, Pencil, Trash2 } from "lucide-react";

export function BubbleActionBar({
  isUser,
  isStreamActive,
  isRateLimited,
  isLast,
  copied,
  onCopy,
  onReload,
  onEditRequest,
  onDelete,
  messageId,
  displayText,
  vote,
  onVote,
  hasValidId,
}: {
  isUser: boolean;
  isStreamActive: boolean;
  isRateLimited?: boolean;
  isLast: boolean;
  copied: boolean;
  onCopy: () => void;
  onReload: () => void;
  onEditRequest?: (text: string) => void;
  onDelete?: (messageId: string) => void;
  messageId?: string;
  displayText: string;
  vote?: 1 | -1 | null;
  onVote: (vote: 1 | -1) => void;
  hasValidId: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 mt-2 transition-all duration-200 ${
        isUser
          ? "justify-end opacity-0 group-hover:opacity-100 focus-within:opacity-100"
          : isStreamActive
            ? "hidden"
            : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"
      }`}
    >
      <button
        onClick={onCopy}
        className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/40 cursor-pointer"
        title="Copy message"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-emerald-500" />
            <span className="text-emerald-500 text-[10px]">Copied</span>
          </>
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>

      {isUser && onEditRequest && (
        <button
          onClick={() => onEditRequest(displayText)}
          className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/40 cursor-pointer"
          title="Edit and resend"
        >
          <Pencil className="h-3 w-3" />
        </button>
      )}

      {isUser && onDelete && messageId && (
        <button
          onClick={() => onDelete(messageId)}
          className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-md hover:bg-destructive/10 cursor-pointer"
          title="Delete message"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}

      {!isUser && isLast && !isRateLimited && (
        <button
          onClick={onReload}
          className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/40 cursor-pointer"
          title="Retry response"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      )}

      {!isUser && hasValidId && (
        <div className="flex items-center gap-0.5 border-l border-border/40 pl-1.5 ml-0.5">
          <button
            onClick={() => onVote(1)}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              vote === 1
                ? "text-emerald-500 bg-emerald-500/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
            title="Helpful"
          >
            <ThumbsUp className="h-3 w-3" />
          </button>
          <button
            onClick={() => onVote(-1)}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              vote === -1
                ? "text-red-500 bg-red-500/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
            title="Not helpful"
          >
            <ThumbsDown className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
