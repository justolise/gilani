import { Loader2 } from "lucide-react";

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
};

export function DeleteModal({ onConfirm, onCancel, isDeleting }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl space-y-3 mb-safe">
        <h3 className="font-serif text-lg font-bold text-foreground">Delete Study Session?</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Are you sure you want to permanently delete this study session? This will erase all
          message history and cannot be undone.
        </p>
        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={onCancel}
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-accent hover:text-foreground transition-colors min-h-[44px] cursor-pointer flex items-center justify-center"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-destructive px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-destructive-foreground hover:bg-destructive/90 disabled:opacity-60 transition-colors min-h-[44px] cursor-pointer"
          >
            {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
