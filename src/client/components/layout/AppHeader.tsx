import React from "react";
import { Menu, HelpCircle, ShieldCheck } from "lucide-react";
import { useLayout } from "@/client/contexts/layout-context";
import { useAuth } from "@/client/hooks/use-auth";
import { NotificationBell } from "@/client/components/notifications";
import { openAppGuide } from "@/client/components/guide/AppGuideModal";

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
  hideNotifications,
}: AppHeaderProps) {
  const { setSidebarOpen } = useLayout();
  const { session } = useAuth();
  const userId = session?.user?.id;

  return (
    <header className="flex h-14 sm:h-16 w-full items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur-md px-3 sm:px-4 sticky top-0 z-30 gap-2 flex-shrink-0 min-w-0 transition-colors">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-full p-2 text-muted-foreground transition-all duration-200 hover:bg-muted/60 hover:text-foreground active:scale-95 flex-shrink-0 lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          title="Open Menu"
          aria-label="Open Menu"
        >
          <Menu className="h-5 w-5" strokeWidth={2.25} />
        </button>
        {leftContent}
      </div>

      <div className="flex-1 flex flex-col justify-center items-center min-w-0 px-2 text-center">
        {centerContent}
        {!centerContent && title && (
          <h2 className="text-base font-semibold text-foreground truncate">{title}</h2>
        )}
        {!centerContent && subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink-0">
        <div className="hidden md:inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Safe Learning</span>
        </div>

        {/* Quick interactive guide tour button */}
        <button
          type="button"
          onClick={openAppGuide}
          className="rounded-full p-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          title="How to use GilaniAI (Guide Tour)"
          aria-label="How to use GilaniAI (Guide Tour)"
        >
          <HelpCircle className="h-5 w-5 text-primary/80 hover:text-primary transition-colors" />
        </button>

        {actions}
        {!hideNotifications && userId && <NotificationBell userId={userId} />}
      </div>
    </header>
  );
}
