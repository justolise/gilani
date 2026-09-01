import { Link } from "@tanstack/react-router";
import {
  Home,
  MessageSquare,
  FileText,
  PenTool,
  Calendar,
  Star,
  ShieldAlert,
  Users,
  X,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/client/components/ui/tooltip";
import { Logo } from "@/client/components/ui/logo";
import { useI18n } from "@/client/i18n/I18nContext";

export function isNavActive(path: string, to: string, exact?: boolean) {
  if (exact) return path === to || path === to + "/";
  return path.startsWith(to);
}

export function SidebarRail({
  path,
  isTeacher,
  isAdmin,
  collapsed,
  hasPanel,
  toggleCollapsed,
  setSidebarOpen,
  userMenu,
}: {
  path: string;
  isTeacher: boolean;
  isAdmin: boolean;
  collapsed: boolean;
  hasPanel: boolean;
  toggleCollapsed: () => void;
  setSidebarOpen: (open: boolean) => void;
  userMenu: React.ReactNode;
}) {
  const { t } = useI18n();

  const STUDENT_NAV = [
    { icon: Home, label: t("nav_home"), to: "/tutor", exact: true },
    { icon: MessageSquare, label: t("nav_chats"), to: "/tutor/chats" },
    { icon: FileText, label: t("nav_notes"), to: "/tutor/documents" },
    { icon: PenTool, label: t("nav_quizzes"), to: "/tutor/quizzes" },
    { icon: Calendar, label: t("nav_planner"), to: "/tutor/planner" },
    { icon: Star, label: t("nav_saved"), to: "/tutor/saved" },
  ] as const;

  return (
    <div className="flex flex-col w-full lg:w-14 flex-shrink-0 lg:border-r border-b lg:border-b-0 border-border/30 pt-4 pb-2 lg:py-3">
      {/* Logo & Mobile Close */}
      <div className="mb-4 flex items-center justify-between lg:justify-center px-4 lg:px-0">
        <span className="lg:hidden">
          <Logo to="/tutor" onClick={() => setSidebarOpen(false)} size="sm" />
        </span>
        <span className="hidden lg:flex">
          <Logo to="/tutor" size="sm" iconOnly />
        </span>
        <button
          onClick={() => setSidebarOpen(false)}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-muted/40 transition-all lg:hidden"
          title="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <TooltipProvider delayDuration={150}>
        {/* ── Nav links ── */}
        <nav className="flex flex-col lg:items-center gap-1 flex-1 w-full px-3 lg:px-2">
          {/* Student nav */}
          {!isTeacher && !isAdmin && (
            <>
              {STUDENT_NAV.map((item) => {
                const active = isNavActive(path, item.to, "exact" in item ? item.exact : undefined);
                return (
                  <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.to as any}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          relative flex items-center lg:justify-center
                          px-3 lg:px-0 h-10 w-full lg:w-10 rounded-xl
                          transition-all duration-150
                          ${
                            active
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                          }
                        `}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-primary rounded-r" />
                        )}
                        <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                        <span className="ml-3 font-medium text-sm lg:hidden">{item.label}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="hidden lg:block">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}

              {/* Escalate Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      const isTutorThread =
                        path.startsWith("/tutor/") && path !== "/tutor" && path !== "/tutor/";
                      if (isTutorThread) {
                        window.dispatchEvent(new CustomEvent("custom:trigger-escalation"));
                      }
                    }}
                    className="relative flex items-center lg:justify-center px-3 lg:px-0 h-10 w-full lg:w-10 rounded-xl text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all duration-150 cursor-pointer"
                  >
                    <ShieldAlert className="h-[18px] w-[18px] flex-shrink-0" />
                    <span className="ml-3 font-medium text-sm lg:hidden">Escalate</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="hidden lg:block">
                  Escalate
                </TooltipContent>
              </Tooltip>
            </>
          )}

          {/* Teacher nav */}
          {isTeacher && (
            <>
              <p className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground/50 lg:text-center mt-2 mb-1 px-3 lg:px-0">
                Teacher
              </p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/teacher/escalations"
                    onClick={() => setSidebarOpen(false)}
                    className={`relative flex items-center lg:justify-center px-3 lg:px-0 h-10 w-full lg:w-10 rounded-xl transition-all duration-150 ${
                      path.startsWith("/teacher/escalations")
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    {path.startsWith("/teacher/escalations") && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-primary rounded-r" />
                    )}
                    <ShieldAlert className="h-[18px] w-[18px] flex-shrink-0" />
                    <span className="ml-3 font-medium text-sm lg:hidden">Escalations</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="hidden lg:block">
                  Escalations
                </TooltipContent>
              </Tooltip>
            </>
          )}

          {/* Admin nav */}
          {isAdmin && (
            <>
              <p className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground/50 lg:text-center mt-2 mb-1 px-3 lg:px-0">
                Admin
              </p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/admin/users"
                    onClick={() => setSidebarOpen(false)}
                    className={`relative flex items-center lg:justify-center px-3 lg:px-0 h-10 w-full lg:w-10 rounded-xl transition-all duration-150 ${
                      path.startsWith("/admin")
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    {path.startsWith("/admin") && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-primary rounded-r" />
                    )}
                    <Users className="h-[18px] w-[18px] flex-shrink-0" />
                    <span className="ml-3 font-medium text-sm lg:hidden">Dashboard</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="hidden lg:block">
                  Dashboard
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </nav>

        {/* ── Rail bottom: collapse toggle + desktop user avatar ── */}
        <div className="hidden lg:flex flex-col items-center gap-2 px-2 mt-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleCollapsed}
                className="flex items-center justify-center w-10 h-10 rounded-xl text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all duration-150"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <PanelLeft className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{collapsed ? "Expand" : "Collapse"}</TooltipContent>
          </Tooltip>

          {!hasPanel && <div className="mb-1">{userMenu}</div>}
        </div>
      </TooltipProvider>
    </div>
  );
}
