import { Loader2 } from "lucide-react";

interface GilaniLoaderProps {
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

export function GilaniLoader({
  fullScreen = true,
  text = "Preparing your study session…",
  className = "",
}: GilaniLoaderProps = {}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center bg-background select-none gap-4 p-4 ${
        fullScreen ? "min-h-screen" : "py-12 sm:py-16"
      } ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute h-12 w-12 rounded-full bg-primary/20 blur-md animate-pulse" />
        <Loader2 className="h-9 w-9 animate-spin text-primary relative z-10" />
      </div>
      {text && (
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-foreground/90 tracking-tight">{text}</p>
          <p className="text-xs text-muted-foreground">Curriculum-grounded learning in progress</p>
        </div>
      )}
    </div>
  );
}

export default GilaniLoader;
