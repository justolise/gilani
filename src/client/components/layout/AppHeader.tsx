import React from "react";
import { Menu } from "lucide-react";
import { useLayout } from "@/client/contexts/layout-context";

interface AppHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  actions?: React.ReactNode;
  hideNotifications?: boolean;
}

export function AppHeader({
  title,
  subtitle,
  leftContent,
  centerContent,
  actions,
}: AppHeaderProps) {
  const { setSidebarOpen, sidebarOpen } = useLayout();

  return (
    <header className="flex h-14 sm:h-16 w-full items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur-md px-3 sm:px-4 sticky top-0 z-30 gap-2 flex-shrink-0 min-w-0 transition-colors">
      <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-expanded={sidebarOpen}
          aria-label="Open navigation menu"
          title="Open navigation menu"
          className="rounded-full p-2 text-muted-foreground transition-all duration-200 hover:bg-muted/60 hover:text-foreground active:scale-95 flex-shrink-0 lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
        >
          <Menu className="h-5 w-5" strokeWidth={2.25} />
        </button>
        {leftContent}
      </div>

      {/* Main header title area occupying maximum space */}
      <div className="flex-1 flex flex-col justify-center items-center min-w-0 px-2 text-center">
        {centerContent}
        {!centerContent && title && (
          <h1 className="text-base sm:text-lg font-semibold text-foreground truncate w-full text-center">
            {title}
          </h1>
        )}
        {!centerContent && subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground truncate w-full text-center">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right actions (e.g. 3 dots menu) */}
      <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-shrink-0 justify-end">
        {actions}
      </div>
    </header>
  );
}
