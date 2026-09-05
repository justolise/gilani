import { useState, useEffect } from "react";
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
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/client/components/ui/tooltip";
import { ThreadActionSheet } from "@/client/components/layout/ThreadActionSheet";
import { EscalateModal } from "@/client/components/tutor/EscalateModal";
import type { useAuthedShell } from "@/client/components/layout/hooks/useAuthedShell";
import { SidebarUserMenu } from "./sidebar/SidebarUserMenu";
import { useI18n } from "@/client/i18n/I18nContext";

type Props = {
  shell: ReturnType<typeof useAuthedShell>;
};

function isNavActive(path: string, to: string, exact?: boolean) {
  if (exact) return path === to || path === to + "/";
  return path.startsWith(to);
}

export function Sidebar({ shell }: Props) {
  const {
    sidebarOpen,
    setSidebarOpen,
    collapsed,
    toggleCollapsed,
    isTeacher,
    isAdmin,
    path,
    threads,
    threadsLoading,
    groupedThreads,
    createNewThread,
    renamingId,
    setRenamingId,
    renameValue,
    setRenameValue,
    renameInputRef,
    startRename,
    commitRename,
    revealedThreadId,
    setRevealedThreadId,
    handleThreadTouchStart,
    handleThreadTouchEnd,
    longPressTriggeredRef,
    deleteConfirmId,
    setDeleteConfirmId,
    handleDeleteThread,
    profileName,
    avatarUrl,
    currentPlan,
    curriculum,
    user,
    signOut,
    escalationStatuses,
    escalateSheetThreadId,
    setEscalateSheetThreadId,
    escalateEmail,
    setEscalateEmail,
    escalating,
    escalateError,
    setEscalateError,
    handleEscalateThread,
    exportingThreadId,
    handleExportThreadPDF,
    setShowPlans,
  } = shell;

  const { t } = useI18n();
  const [threadSearch, setThreadSearch] = useState("");
  const isStudent = !isTeacher && !isAdmin;

  // ── Keyboard shortcuts: ⌘N (New Chat), ⌘B (Toggle Sidebar) ──────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘N or Ctrl+N -> New Chat
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n" && !e.shiftKey) {
        e.preventDefault();
        createNewThread();
        setSidebarOpen(false);
      }
      // ⌘B or Ctrl+B -> Toggle Sidebar
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [createNewThread, setSidebarOpen, toggleCollapsed]);

  // Filtered threads for search
  const filteredGroupedThreads = threadSearch.trim()
    ? (Object.fromEntries(
        (Object.keys(groupedThreads) as Array<keyof typeof groupedThreads>).map((key) => [
          key,
          groupedThreads[key].filter((th) =>
            th.title?.toLowerCase().includes(threadSearch.toLowerCase()),
          ),
        ]),
      ) as unknown as typeof groupedThreads)
    : groupedThreads;

  const STUDENT_NAV = [
    { icon: Home, label: t("nav_home"), to: "/tutor", exact: true },
    { icon: MessageSquare, label: t("nav_chats"), to: "/tutor/chats" },
    { icon: FileText, label: t("nav_notes"), to: "/tutor/documents" },
    { icon: PenTool, label: t("nav_quizzes"), to: "/tutor/quizzes" },
    { icon: Calendar, label: t("nav_planner"), to: "/tutor/planner" },
    { icon: Star, label: t("nav_saved"), to: "/tutor/saved" },
  ] as const;

  const renderUserMenu = (isCompact = false) => (
    <SidebarUserMenu
      isCompact={isCompact}
      avatarUrl={avatarUrl}
      profileName={profileName}
      userEmail={user?.email}
      currentPlan={currentPlan}
      curriculum={curriculum}
      isAdmin={isAdmin}
      isTeacher={isTeacher}
      onCloseSidebar={() => setSidebarOpen(false)}
      onSignOut={signOut}
    />
  );

  return (
    <>
      {/* ── Main Sidebar Shell (Vercel Style) ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col
          border-r border-sidebar-border/80
          bg-sidebar/98 dark:bg-[#0e1017]/98 backdrop-blur-2xl
          shadow-2xl lg:shadow-[2px_0_16px_rgba(0,0,0,0.08)]
          overflow-hidden
          transition-[transform,width] duration-250 ease-out
          lg:translate-x-0 lg:static lg:h-dvh
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${collapsed ? "lg:w-14" : "lg:w-[270px]"}
          w-[84vw] max-w-[315px] sm:max-w-[320px]
        `}
      >
        {/* ── Collapsed Desktop Rail View (w-14) ── */}
        {collapsed ? (
          <TooltipProvider delayDuration={150}>
            <div className="hidden lg:flex flex-col items-center justify-between h-full py-3 w-14 select-none">
              {/* Top: Monogram & Expand Toggle */}
              <div className="flex flex-col items-center gap-3">
                <Link
                  to="/tutor"
                  className="w-8 h-8 rounded-xl bg-[#C96A3D] text-white flex items-center justify-center font-serif font-black text-sm shadow-md hover:opacity-90 transition-opacity"
                  title="GilaniAI"
                >
                  G
                </Link>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleCollapsed}
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors cursor-pointer"
                      aria-label="Expand sidebar"
                    >
                      <PanelLeft className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Expand sidebar (⌘B)</TooltipContent>
                </Tooltip>

                {/* Quick New Chat Icon – students only */}
                {isStudent && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={createNewThread}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                        aria-label="New Chat"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">New Chat (⌘N)</TooltipContent>
                  </Tooltip>
                )}
              </div>

              {/* Middle: Primary Navigation Icons – all roles see their full nav */}
              <nav className="flex flex-col items-center gap-1.5 w-full px-2">
                {STUDENT_NAV.map((item) => {
                  const active = isNavActive(
                    path,
                    item.to,
                    "exact" in item ? item.exact : undefined,
                  );
                  return (
                    <Tooltip key={item.to}>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.to as any}
                          className={`
                            relative flex items-center justify-center w-9 h-9 rounded-xl transition-all
                            ${
                              active
                                ? "bg-primary/15 text-primary font-semibold"
                                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                            }
                          `}
                        >
                          {active && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 bg-primary rounded-r" />
                          )}
                          <item.icon className="h-4 w-4" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  );
                })}

                {(isTeacher || isAdmin) && (
                  <span className="w-5 h-px bg-border/40 mx-auto my-0.5" />
                )}

                {isTeacher && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to="/teacher/escalations"
                        className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                          path.startsWith("/teacher")
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                        }`}
                      >
                        {path.startsWith("/teacher") && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 bg-primary rounded-r" />
                        )}
                        <ShieldAlert className="h-4 w-4" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">Student Escalations</TooltipContent>
                  </Tooltip>
                )}

                {isAdmin && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to="/teacher/escalations"
                          className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                            path.startsWith("/teacher")
                              ? "bg-primary/15 text-primary"
                              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                          }`}
                        >
                          {path.startsWith("/teacher") && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 bg-primary rounded-r" />
                          )}
                          <ShieldAlert className="h-4 w-4" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">Escalations</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to="/admin/users"
                          className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                            path.startsWith("/admin")
                              ? "bg-primary/15 text-primary"
                              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                          }`}
                        >
                          {path.startsWith("/admin") && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 bg-primary rounded-r" />
                          )}
                          <Users className="h-4 w-4" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">User Management</TooltipContent>
                    </Tooltip>
                  </>
                )}
              </nav>

              {/* Bottom: Compact User Menu */}
              <div className="flex flex-col items-center gap-2">{renderUserMenu(true)}</div>
            </div>
          </TooltipProvider>
        ) : (
          /* ── Full Vercel Panel View (Mobile + Desktop Expanded) ── */
          <div className="flex flex-col h-full select-none">
            {/* ── 1. Vercel Scope Switcher & Header ── */}
            <div className="flex items-center justify-between px-3 pt-3.5 pb-2 flex-shrink-0 border-b border-border/20">
              <Link
                to="/tutor"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted/40 transition-colors group cursor-pointer max-w-[220px]"
              >
                {/* Brand icon */}
                <div className="w-6 h-6 rounded-lg bg-[#C96A3D] text-white flex items-center justify-center font-serif font-black text-xs shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                  G
                </div>

                {/* Workspace / Scope details */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-xs text-foreground tracking-tight">GilaniAI</span>
                  <span className="text-muted-foreground/30 text-xs font-mono">/</span>
                  <span className="text-[11px] font-mono font-medium text-muted-foreground truncate">
                    {curriculum || (isTeacher ? "Teacher" : isAdmin ? "Admin" : "KCSE")}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors ml-0.5 flex-shrink-0" />
              </Link>

              {/* Header Right Action: Close on Mobile, Collapse on Desktop */}
              <div className="flex items-center">
                {/* Mobile close button */}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Desktop collapse button */}
                <button
                  onClick={toggleCollapsed}
                  className="hidden lg:flex p-1.5 rounded-lg text-muted-foreground/60 hover:bg-muted/40 hover:text-foreground transition-colors cursor-pointer"
                  title="Collapse sidebar (⌘B)"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── 2. Vercel Action Button: "+ New Chat" – students only ── */}
            {isStudent && (
              <div className="px-3 pt-3 pb-1 flex-shrink-0">
                <button
                  onClick={() => {
                    createNewThread();
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-foreground text-background dark:bg-white dark:text-black hover:opacity-90 active:scale-[0.99] transition-all text-xs font-semibold shadow-xs cursor-pointer group"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-200" />
                    New Chat
                  </span>
                  <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono rounded bg-background/20 dark:bg-black/15 text-background dark:text-black">
                    ⌘N
                  </kbd>
                </button>
              </div>
            )}

            {/* ── 3. Scrollable Navigation & Recents ── */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              {/* Section: Platform Navigation – all roles */}
              <div className="space-y-0.5">
                <p className="px-2.5 py-1 text-[9px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/50">
                  Platform
                </p>

                {/* Student nav tabs – visible to everyone */}
                {STUDENT_NAV.map((item) => {
                  const active = isNavActive(
                    path,
                    item.to,
                    "exact" in item ? item.exact : undefined,
                  );
                  return (
                    <Link
                      key={item.to}
                      to={item.to as any}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer select-none
                        ${
                          active
                            ? "bg-muted/70 text-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                        }
                      `}
                    >
                      <span className="flex items-center gap-2.5 min-w-0 truncate">
                        <item.icon
                          className={`h-4 w-4 flex-shrink-0 transition-colors ${
                            active
                              ? "text-primary"
                              : "text-muted-foreground/70 group-hover:text-foreground"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </Link>
                  );
                })}

                {/* Escalate to teacher – student only */}
                {isStudent && (
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      const isTutorThread =
                        path.startsWith("/tutor/") && path !== "/tutor" && path !== "/tutor/";
                      if (isTutorThread) {
                        window.dispatchEvent(new CustomEvent("custom:trigger-escalation"));
                      }
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <ShieldAlert className="h-4 w-4 flex-shrink-0 text-muted-foreground/70" />
                      <span>Teacher Help</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground/70">
                      Escalate
                    </span>
                  </button>
                )}

                {/* Teacher / Admin portal nav – below a divider */}
                {(isTeacher || isAdmin) && (
                  <div className="pt-2 mt-1 border-t border-border/20 space-y-0.5">
                    <p className="px-2.5 py-1 text-[9px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/50">
                      {isAdmin ? "Admin Tools" : "Teacher Tools"}
                    </p>

                    {(isTeacher || isAdmin) && (
                      <Link
                        to="/teacher/escalations"
                        onClick={() => setSidebarOpen(false)}
                        className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                          path.startsWith("/teacher")
                            ? "bg-muted/70 text-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <ShieldAlert
                            className={`h-4 w-4 flex-shrink-0 ${path.startsWith("/teacher") ? "text-primary" : "text-purple-400"}`}
                          />
                          <span>Student Escalations</span>
                        </span>
                        {path.startsWith("/teacher") && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin/users"
                        onClick={() => setSidebarOpen(false)}
                        className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                          path.startsWith("/admin")
                            ? "bg-muted/70 text-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <Users
                            className={`h-4 w-4 flex-shrink-0 ${path.startsWith("/admin") ? "text-primary" : "text-blue-400"}`}
                          />
                          <span>User Management</span>
                        </span>
                        {path.startsWith("/admin") && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Section: Recent Chats – students only */}
              {isStudent && (
                <div className="space-y-1.5 pt-1 border-t border-border/20">
                  <div className="flex items-center justify-between px-2.5 py-1">
                    <p className="text-[9px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/50">
                      Recent Chats
                    </p>
                    {threads.length > 0 && (
                      <span className="text-[10px] font-mono text-muted-foreground/40">
                        {threads.length}
                      </span>
                    )}
                  </div>

                  {/* Search input */}
                  <div className="px-1 pb-1">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search chats..."
                        value={threadSearch}
                        onChange={(e) => setThreadSearch(e.target.value)}
                        className="w-full rounded-lg bg-white/[0.03] border border-white/[0.06] pl-8 pr-7 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/40 focus:bg-white/[0.06] transition-all"
                      />
                      {threadSearch && (
                        <button
                          onClick={() => setThreadSearch("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Thread Group List */}
                  {threadsLoading ? (
                    <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground/60 animate-pulse">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Loading chats…</span>
                    </div>
                  ) : threads.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-muted-foreground/40 italic">
                      No chats yet. Start one above!
                    </p>
                  ) : (
                    (Object.keys(filteredGroupedThreads) as Array<keyof typeof groupedThreads>).map(
                      (key) => {
                        const groupThreads = filteredGroupedThreads[key];
                        if (!groupThreads || groupThreads.length === 0) return null;
                        const label = {
                          today: t("sidebar_today"),
                          yesterday: t("sidebar_yesterday"),
                          last7Days: t("sidebar_this_week"),
                          older: t("sidebar_older"),
                        }[key];

                        return (
                          <div key={key} className="space-y-0.5">
                            <span className="px-2.5 text-[9px] font-mono text-muted-foreground/40 uppercase tracking-wide">
                              {label}
                            </span>
                            <div className="space-y-[1px]">
                              {groupThreads.map((tItem) => {
                                const isCurrent =
                                  path === `/tutor/${tItem.id}` ||
                                  path.startsWith(`/tutor/${tItem.id}/`);

                                return (
                                  <div
                                    key={tItem.id}
                                    data-thread-id={tItem.id}
                                    onTouchStart={() => handleThreadTouchStart(tItem.id)}
                                    onTouchEnd={handleThreadTouchEnd}
                                    onTouchMove={handleThreadTouchEnd}
                                    onContextMenu={(e) => e.preventDefault()}
                                    className={`group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-all relative select-none ${
                                      isCurrent
                                        ? "bg-muted/70 text-foreground font-semibold shadow-xs"
                                        : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                                    }`}
                                  >
                                    {renamingId === tItem.id ? (
                                      <input
                                        ref={renameInputRef}
                                        value={renameValue}
                                        onChange={(e) => setRenameValue(e.target.value)}
                                        onBlur={() => commitRename(tItem.id)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            e.preventDefault();
                                            commitRename(tItem.id);
                                          }
                                          if (e.key === "Escape") {
                                            e.preventDefault();
                                            setRenamingId(null);
                                          }
                                        }}
                                        className="flex-1 min-w-0 bg-transparent border border-primary/50 rounded-md px-1.5 py-0.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                                        autoFocus
                                      />
                                    ) : (
                                      <Link
                                        to={"/tutor/$threadId"}
                                        params={{ threadId: tItem.id }}
                                        onClick={(e) => {
                                          if (longPressTriggeredRef.current) {
                                            e.preventDefault();
                                            return;
                                          }
                                          setSidebarOpen(false);
                                        }}
                                        onDoubleClick={(e) => {
                                          e.preventDefault();
                                          startRename(tItem.id, tItem.title || "Untitled Chat");
                                        }}
                                        className="truncate flex-1 py-0.5 text-left outline-none cursor-pointer"
                                      >
                                        {tItem.title || "New Chat"}
                                      </Link>
                                    )}

                                    {/* Desktop quick actions on hover */}
                                    {renamingId !== tItem.id && (
                                      <div className="hidden lg:flex items-center flex-shrink-0 gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            startRename(tItem.id, tItem.title || "Untitled Chat");
                                          }}
                                          className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                                          title="Rename"
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setDeleteConfirmId(tItem.id);
                                          }}
                                          className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
                                          title="Delete"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      },
                    )
                  )}
                </div>
              )}
            </div>

            {/* ── 4. Vercel Footer: User Profile Bar & Upgrade Chip ── */}
            <div className="flex-shrink-0 border-t border-border/30 p-2.5 bg-sidebar/95 dark:bg-[#0e1017]/95 flex flex-col gap-2">
              {/* Upgrade Banner for Free tier */}
              {currentPlan.toLowerCase() !== "pro" && (
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    setShowPlans(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl border border-[#C96A3D]/30 bg-[#C96A3D]/10 hover:bg-[#C96A3D]/15 active:scale-[0.99] transition-all text-xs font-semibold text-[#E28743] cursor-pointer group"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#E28743]" />
                    Upgrade to Pro
                  </span>
                  <span className="text-[10px] font-mono group-hover:translate-x-0.5 transition-transform">
                    ↗
                  </span>
                </button>
              )}

              {/* User profile menu */}
              <div className="w-full">{renderUserMenu(false)}</div>
            </div>
          </div>
        )}
      </aside>

      {/* ── Modals ── */}
      {revealedThreadId &&
        (() => {
          const activeThread = threads.find((th) => th.id === revealedThreadId);
          if (!activeThread) return null;
          return (
            <ThreadActionSheet
              thread={activeThread}
              escalationStatus={escalationStatuses[activeThread.id] ?? null}
              isExporting={exportingThreadId === activeThread.id}
              onClose={() => setRevealedThreadId(null)}
              onRename={() => {
                startRename(activeThread.id, activeThread.title || "Untitled Chat");
                setRevealedThreadId(null);
              }}
              onExport={() => {
                handleExportThreadPDF(activeThread.id);
                setRevealedThreadId(null);
              }}
              onEscalate={() => {
                setEscalateSheetThreadId(activeThread.id);
                setRevealedThreadId(null);
              }}
              onDelete={() => {
                setDeleteConfirmId(activeThread.id);
                setRevealedThreadId(null);
              }}
            />
          );
        })()}

      {escalateSheetThreadId && (
        <EscalateModal
          teacherEmail={escalateEmail}
          onEmailChange={(val) => {
            setEscalateEmail(val);
            setEscalateError("");
          }}
          onConfirm={() => handleEscalateThread(escalateSheetThreadId, escalateEmail)}
          onCancel={() => {
            setEscalateSheetThreadId(null);
            setEscalateEmail("");
            setEscalateError("");
          }}
          isEscalating={escalating}
          error={escalateError}
        />
      )}
    </>
  );
}
