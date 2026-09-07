import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  destructive = true,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!busy ? onCancel : undefined}
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl p-5 sm:p-6 space-y-4 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${destructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-base">{title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-40 min-h-[44px] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors disabled:opacity-40 min-h-[44px] cursor-pointer ${
              destructive
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? "Please wait…" : confirmLabel}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
