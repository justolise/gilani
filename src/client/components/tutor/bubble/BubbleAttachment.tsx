import { FileText } from "lucide-react";

export function BubbleAttachment({ attachmentName }: { attachmentName?: string | null }) {
  if (!attachmentName) return null;

  return (
    <div className="mb-2 flex items-center gap-2.5 rounded-xl border border-border/70 bg-background/80 dark:bg-card/70 px-3 py-2 text-xs font-medium text-foreground w-fit max-w-full shadow-xs select-none backdrop-blur-xs">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <FileText className="h-4 w-4" />
      </div>
      <div className="min-w-0 pr-1">
        <span className="truncate max-w-60 block font-semibold text-[12px] leading-tight">
          {attachmentName}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono leading-none">
          Document Attached
        </span>
      </div>
    </div>
  );
}
