import React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { MessageSquare, FileText, Brain, Calendar, Menu, GraduationCap } from "lucide-react";
import { useLayout } from "@/client/contexts/layout-context";

interface NavItem {
  id: string;
  label: string;
  to?: string;
  icon: React.ComponentType<{ className?: string }>;
  isAction?: boolean;
}

export function MobileBottomNav() {
  const location = useLocation();
  const { setSidebarOpen, sidebarOpen } = useLayout();
  const currentPath = location.pathname;

  const navItems: NavItem[] = [
    {
      id: "tutor",
      label: "Tutor",
      to: "/tutor",
      icon: GraduationCap,
    },
    {
      id: "notes",
      label: "Notes",
      to: "/tutor/documents",
      icon: FileText,
    },
    {
      id: "quizzes",
      label: "Quizzes",
      to: "/tutor/quizzes",
      icon: Brain,
    },
    {
      id: "planner",
      label: "Planner",
      to: "/tutor/planner",
      icon: Calendar,
    },
    {
      id: "menu",
      label: "Menu",
      icon: Menu,
      isAction: true,
    },
  ];

  const isTutorSubpage =
    currentPath.startsWith("/tutor/") &&
    !currentPath.startsWith("/tutor/documents") &&
    !currentPath.startsWith("/tutor/quizzes") &&
    !currentPath.startsWith("/tutor/planner") &&
    !currentPath.startsWith("/tutor/chats") &&
    !currentPath.startsWith("/tutor/saved");

  // In an active chat conversation, hide the bottom bar so it doesn't block the chat input
  if (isTutorSubpage) {
    return null;
  }

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-border/70 bg-background/92 backdrop-blur-xl pb-[var(--safe-bottom,env(safe-area-inset-bottom,0px))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] transition-all"
    >
      <div className="flex h-14 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 text-center transition-all active:scale-90 min-h-[48px] min-w-[48px] cursor-pointer ${
                  sidebarOpen
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Open Navigation Menu"
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all ${
                    sidebarOpen ? "bg-primary/15 text-primary" : ""
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium leading-none tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          }

          const isActive =
            item.id === "tutor"
              ? currentPath === "/tutor" ||
                (currentPath.startsWith("/tutor/") &&
                  !currentPath.startsWith("/tutor/documents") &&
                  !currentPath.startsWith("/tutor/quizzes") &&
                  !currentPath.startsWith("/tutor/planner") &&
                  !currentPath.startsWith("/tutor/chats"))
              : currentPath.startsWith(item.to || "");

          return (
            <Link
              key={item.id}
              to={item.to as any}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 text-center transition-all active:scale-90 min-h-[48px] min-w-[48px] relative ${
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all ${
                  isActive ? "bg-primary/15 text-primary scale-105" : ""
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium leading-none tracking-tight">
                {item.label}
              </span>
              {isActive && <span className="absolute top-0.5 h-1 w-6 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
