import { FileText } from "lucide-react";

export function BubbleAttachment({ attachmentName }: { attachmentName?: string | null }) {
  if (!attachmentName) return null;

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/80 px-2.5 py-1.5 text-xs font-semibold text-foreground w-fit max-w-full select-none">
      <FileText className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
      <span className="truncate max-w-[200px]">{attachmentName}</span>
    </div>
  );
}
