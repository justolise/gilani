import { Loader2 } from "lucide-react";

interface GilaniLoaderProps {
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

export function GilaniLoader({
  fullScreen = true,
  text = "Loading...",
  className = "",
}: GilaniLoaderProps = {}) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-background select-none gap-3.5 ${
        fullScreen ? "min-h-screen" : "py-12 sm:py-16"
      } ${className}`}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {text && (
        <p className="text-sm font-medium text-muted-foreground tracking-wide animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

export default GilaniLoader;
