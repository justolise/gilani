import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  MessageSquare,
  Plus,
  FileText,
  Brain,
  Calendar,
  Timer,
  HelpCircle,
  Settings,
  Sparkles,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/client/components/ui/dialog";
import { useThreadsQuery } from "@/client/hooks/useThreadsQuery";
import { openAppGuide } from "@/client/components/guide/AppGuideModal";

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  section: "actions" | "chats";
  onSelect: () => void;
  badge?: string;
}

export function openCommandPalette() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("custom:open-command-palette"));
  }
}

export function CommandPalette({ userId }: { userId?: string | null }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const { threads } = useThreadsQuery(userId);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    const handleCustomOpen = () => {
      setOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("custom:open-command-palette", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("custom:open-command-palette", handleCustomOpen);
    };
  }, []);

  // Reset search & selected index when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const defaultActions: CommandItem[] = useMemo(
    () => [
      {
        id: "action-new-chat",
        title: "Start New Chat",
        subtitle: "Launch a fresh academic study session",
        icon: Plus,
        section: "actions",
        badge: "⌘N",
        onSelect: () => {
          setOpen(false);
          navigate({ to: "/tutor", search: { new: "1" } as any });
        },
      },
      {
        id: "action-documents",
        title: "My Documents & Notes",
        subtitle: "View summaries and uploaded PDFs",
        icon: FileText,
        section: "actions",
        onSelect: () => {
          setOpen(false);
          navigate({ to: "/tutor/documents" });
        },
      },
      {
        id: "action-quizzes",
        title: "Practice Quizzes",
        subtitle: "Test yourself with active recall quizzes",
        icon: Brain,
        section: "actions",
        onSelect: () => {
          setOpen(false);
          navigate({ to: "/tutor/quizzes" });
        },
      },
      {
        id: "action-planner",
        title: "Study Planner",
        subtitle: "Organize revision goals & countdowns",
        icon: Calendar,
        section: "actions",
        onSelect: () => {
          setOpen(false);
          navigate({ to: "/tutor/planner" });
        },
      },
      {
        id: "action-timer",
        title: "Pomodoro Focus Timer",
        subtitle: "Start a 25-minute focused study interval",
        icon: Timer,
        section: "actions",
        onSelect: () => {
          setOpen(false);
          window.dispatchEvent(new CustomEvent("custom:open-pomodoro"));
        },
      },
      {
        id: "action-guide",
        title: "App User Guide",
        subtitle: "Learn how to get the most out of GilaniAI",
        icon: HelpCircle,
        section: "actions",
        onSelect: () => {
          setOpen(false);
          openAppGuide();
        },
      },
      {
        id: "action-settings",
        title: "Settings & Curriculum",
        subtitle: "Update account, grade, and preferences",
        icon: Settings,
        section: "actions",
        onSelect: () => {
          setOpen(false);
          navigate({ to: "/settings" });
        },
      },
    ],
    [navigate],
  );

  const filteredItems: CommandItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();

    // Filter actions
    const matchedActions = defaultActions.filter(
      (a) =>
        !q ||
        a.title.toLowerCase().includes(q) ||
        (a.subtitle && a.subtitle.toLowerCase().includes(q)),
    );

    // Filter recent chat threads
    const matchedThreads: CommandItem[] = (threads || [])
      .filter((t) => !q || (t.title && t.title.toLowerCase().includes(q)))
      .slice(0, 5)
      .map((t) => ({
        id: `thread-${t.id}`,
        title: t.title || "Untitled Session",
        subtitle: "Chat Thread",
        icon: MessageSquare,
        section: "chats" as const,
        onSelect: () => {
          setOpen(false);
          navigate({ to: "/tutor/$threadId", params: { threadId: t.id } });
        },
      }));

    return [...matchedActions, ...matchedThreads];
  }, [query, defaultActions, threads, navigate]);

  // Keep selectedIndex in bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filteredItems[selectedIndex];
      if (item) {
        item.onSelect();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl rounded-2xl gap-0 top-[35%] sm:top-[40%]">
        <DialogTitle className="sr-only">Quick Command Menu</DialogTitle>

        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-border/60 bg-card/40">
          <Search className="h-4 w-4 text-muted-foreground shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search recent chats…"
            className="w-full h-13 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md border border-border/60 bg-muted/60 text-muted-foreground shrink-0">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No results found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onSelect}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer group ${
                    isSelected ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/40">
                        {item.badge}
                      </span>
                    )}
                    <ArrowRight
                      className={`h-3.5 w-3.5 transition-transform ${
                        isSelected
                          ? "opacity-100 translate-x-0.5 text-primary"
                          : "opacity-0 text-muted-foreground"
                      }`}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-border/40 bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>GilaniAI Command Bar</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
