import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, X, Loader2, Pencil, Trash2 } from "lucide-react";
import { useI18n } from "@/client/i18n/I18nContext";
import type { GroupedThreads, Thread } from "@/client/components/layout/hooks/useAuthedShell";

export function SidebarThreadList({
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
  handleThreadTouchStart,
  handleThreadTouchEnd,
  longPressTriggeredRef,
  setDeleteConfirmId,
  setSidebarOpen,
  userMenu,
  currentPlan,
  setShowPlans,
}: {
  path: string;
  threads: Thread[];
  threadsLoading: boolean;
  groupedThreads: GroupedThreads;
  createNewThread: () => void;
  renamingId: string | null;
  setRenamingId: (id: string | null) => void;
  renameValue: string;
  setRenameValue: (val: string) => void;
  renameInputRef: React.RefObject<HTMLInputElement | null>;
  startRename: (id: string, title: string) => void;
  commitRename: (id: string) => void;
  handleThreadTouchStart: (id: string) => void;
  handleThreadTouchEnd: () => void;
  longPressTriggeredRef: React.MutableRefObject<boolean>;
  setDeleteConfirmId: (id: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  userMenu: React.ReactNode;
  currentPlan: string;
  setShowPlans: (show: boolean) => void;
}) {
  const [threadSearch, setThreadSearch] = useState("");
  const { t } = useI18n();

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

  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-0 bg-sidebar/50 lg:bg-transparent">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">{t("nav_chats")}</h2>
        <button
          onClick={createNewThread}
          className="flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
          title={t("nav_new_chat")}
        >
          <Plus className="h-3.5 w-3.5" />
          {t("nav_new_chat").split(" ")[0]}
        </button>
      </div>

      {/* Search bar */}
      <div className="px-3 pb-2 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
          <input
            type="text"
            placeholder={t("sidebar_search")}
            value={threadSearch}
            onChange={(e) => setThreadSearch(e.target.value)}
            className="w-full rounded-lg bg-muted/30 border border-border/30 pl-8 pr-7 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-border/60 focus:bg-muted/50 transition-all"
          />
          {threadSearch && (
            <button
              onClick={() => setThreadSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/30 mx-3 flex-shrink-0" />

      {/* Thread list — scrolls independently */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-3">
        {threadsLoading ? (
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground/60 animate-pulse">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Loading chats…</span>
          </div>
        ) : threads.length === 0 ? (
          <p className="px-3 py-2 text-xs text-muted-foreground/40 italic">No recent chats</p>
        ) : (
          (Object.keys(filteredGroupedThreads) as Array<keyof typeof groupedThreads>).map((key) => {
            const groupThreads = filteredGroupedThreads[key];
            if (!groupThreads || groupThreads.length === 0) return null;
            const label = {
              today: t("sidebar_today"),
              yesterday: t("sidebar_yesterday"),
              last7Days: t("sidebar_this_week"),
              older: t("sidebar_older"),
            }[key];
            return (
              <div key={key} className="space-y-1">
                <h4 className="px-2.5 text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-wider border-b border-border/20 pb-1 mb-1.5">
                  {label}
                </h4>
                <div className="space-y-[2px]">
                  {groupThreads.map((t) => {
                    const isCurrent =
                      path === `/tutor/${t.id}` || path.startsWith(`/tutor/${t.id}/`);
                    return (
                      <div
                        key={t.id}
                        data-thread-id={t.id}
                        onTouchStart={() => handleThreadTouchStart(t.id)}
                        onTouchEnd={handleThreadTouchEnd}
                        onTouchMove={handleThreadTouchEnd}
                        onContextMenu={(e) => e.preventDefault()}
                        style={{
                          WebkitTouchCallout: "none",
                          touchAction: "manipulation",
                        }}
                        className={`group flex items-center justify-between rounded-lg px-2.5 py-1.5 lg:py-1 text-xs transition-all relative select-none ${
                          isCurrent
                            ? "bg-muted/40 text-foreground font-semibold"
                            : "text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                        }`}
                      >
                        {renamingId === t.id ? (
                          <input
                            ref={renameInputRef}
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => commitRename(t.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                commitRename(t.id);
                              }
                              if (e.key === "Escape") {
                                e.preventDefault();
                                setRenamingId(null);
                              }
                            }}
                            className="flex-1 min-w-0 bg-transparent border border-border/40 rounded-md px-1.5 py-0.5 text-xs outline-hidden focus:border-border"
                            autoFocus
                          />
                        ) : (
                          <Link
                            to={"/tutor/$threadId"}
                            params={{ threadId: t.id }}
                            onClick={(e) => {
                              if (longPressTriggeredRef.current) {
                                e.preventDefault();
                                return;
                              }
                              setSidebarOpen(false);
                            }}
                            onDoubleClick={(e) => {
                              e.preventDefault();
                              startRename(t.id, t.title || "Untitled Chat");
                            }}
                            onContextMenu={(e) => e.preventDefault()}
                            draggable={false}
                            style={{
                              WebkitTouchCallout: "none",
                              WebkitUserSelect: "none",
                              userSelect: "none",
                              touchAction: "manipulation",
                            }}
                            className="truncate flex-1 py-0.5 text-left outline-hidden"
                          >
                            {t.title || "New Chat"}
                          </Link>
                        )}

                        {renamingId !== t.id && (
                          <div className="hidden lg:flex items-center flex-shrink-0 gap-0.5 opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100 focus-within:opacity-100 focus-within:scale-100">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                startRename(t.id, t.title || "Untitled Chat");
                              }}
                              className="flex items-center rounded-md p-1 hover:bg-muted text-muted-foreground/60 hover:text-foreground cursor-pointer"
                              title="Rename"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDeleteConfirmId(t.id);
                              }}
                              className="flex items-center rounded-md p-1 hover:bg-destructive/10 text-muted-foreground/60 hover:text-destructive cursor-pointer"
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
          })
        )}
      </div>

      {/* Bottom section: User profile & Upgrade */}
      <div className="flex-shrink-0 border-t border-border/30 p-3 bg-sidebar lg:bg-transparent flex flex-row items-center justify-between gap-2">
        <div className="flex-1 min-w-0">{userMenu}</div>

        {currentPlan !== "pro" && (
          <div className="flex-shrink-0">
            <button
              onClick={() => {
                setSidebarOpen(false);
                setShowPlans(true);
              }}
              className="flex items-center justify-center rounded-lg bg-[#d9531e] px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-white hover:bg-[#c44819] transition-colors shadow-sm cursor-pointer"
            >
              Upgrade
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
