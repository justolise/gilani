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
      className={`flex flex-col items-center justify-center bg-background select-none gap-5 p-4 ${
        fullScreen ? "min-h-screen" : "py-12 sm:py-16"
      } ${className}`}
    >
      {/* Animated logo/spinner */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow ring */}
        <div className="absolute h-16 w-16 rounded-full bg-primary/15 blur-xl animate-pulse" />
        {/* Mid ring */}
        <div className="absolute h-12 w-12 rounded-full border border-primary/20 animate-pulse [animation-delay:0.3s]" />
        {/* Spinner */}
        <div className="relative z-10 h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary/80 animate-spin" />
      </div>

      {text && (
        <div className="text-center space-y-1.5 animate-in-slide [animation-delay:0.1s]">
          <p className="text-sm font-semibold text-foreground/80 tracking-tight">{text}</p>
          <p className="text-xs text-muted-foreground">Curriculum-grounded learning in progress</p>
        </div>
      )}
    </div>
  );
}

export default GilaniLoader;
