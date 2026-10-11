import React, { useEffect, useState, useCallback } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/client/supabase";
import {
  Plus,
  MessageSquare,
  Loader2,
  Search,
  Trash2,
  ChevronRight,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useLayout } from "@/client/contexts/layout-context";
import { AppHeader } from "@/client/components/layout/AppHeader";

export const Route = createFileRoute("/_authenticated/tutor/chats")({
  component: ChatsPage,
});

type Thread = {
  id: string;
  title?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

function groupByDate(threads: Thread[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const last7 = new Date(today);
  last7.setDate(last7.getDate() - 7);

  const groups: { today: Thread[]; yesterday: Thread[]; last7Days: Thread[]; older: Thread[] } = {
    today: [],
    yesterday: [],
    last7Days: [],
    older: [],
  };

  for (const t of threads) {
    const d = t.updated_at ? new Date(t.updated_at) : new Date(0);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (day >= today) groups.today.push(t);
    else if (day >= yesterday) groups.yesterday.push(t);
    else if (day >= last7) groups.last7Days.push(t);
    else groups.older.push(t);
  }
  return groups;
}

function ChatsPage() {
  const navigate = useNavigate();
  const { setSidebarOpen } = useLayout();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data?.session?.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }
      supabase
        .from("conversations")
        .select("id,title,updated_at,created_at")
        .eq("user_id", uid)
        .order("updated_at", { ascending: false })
        .then(({ data: rows, error }) => {
          if (!error && rows) setThreads(rows as Thread[]);
          setLoading(false);
        });
    });
  }, []);

  const createNewThread = useCallback(() => {
    navigate({ to: "/tutor", search: { new: "1" } } as any);
  }, [navigate]);

  const deleteThread = useCallback(async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
    try {
      const { error } = await supabase.from("conversations").delete().eq("id", id);
      if (error) throw error;
      setThreads((prev) => prev.filter((t) => t.id !== id));
      toast.success("Chat deleted");
    } catch {
      toast.error("Failed to delete chat");
    } finally {
      setDeletingId(null);
    }
  }, []);

  const filtered = search.trim()
    ? threads.filter((t) => (t.title || "").toLowerCase().includes(search.toLowerCase()))
    : threads;

  const groups = groupByDate(filtered);
  const GROUP_LABELS = {
    today: "Today",
    yesterday: "Yesterday",
    last7Days: "Last 7 Days",
    older: "Earlier Sessions",
  } as const;

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Top Bar */}
      <AppHeader
        title="Chat History"
        subtitle={`${threads.length} conversation${threads.length === 1 ? "" : "s"}`}
        actions={
          <button
            onClick={createNewThread}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground rounded-2xl text-xs sm:text-sm font-bold shadow-xs hover:bg-primary/90 transition-all active:scale-95 cursor-pointer shrink-0"
            title="Start New Chat"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        }
      />

      {/* Search Header */}
      <div className="px-4 sm:px-8 pt-5 pb-3 max-w-4xl w-full mx-auto">
        <div className="relative flex items-center bg-card/70 border border-border/70 rounded-2xl px-4 py-2.5 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-xs backdrop-blur-md">
          <Search className="h-4 w-4 text-muted-foreground shrink-0 mr-2.5" />
          <input
            type="text"
            placeholder="Search conversations by title or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-0.5 rounded-lg bg-muted cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-12 max-w-4xl w-full mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-56 gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-xs font-mono tracking-wider text-muted-foreground uppercase">
              Loading chat sessions…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-dashed border-border/70 bg-card/30 mt-4 space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <MessageSquare className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground font-display">
                {search ? "No matching chats found" : "No chats yet"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 leading-relaxed">
                {search
                  ? "Try searching for a different keyword or question topic."
                  : "Start an interactive study conversation with your AI tutor to learn step by step."}
              </p>
            </div>
            <button
              onClick={createNewThread}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs sm:text-sm font-bold shadow-md hover:bg-primary/90 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              Start Your First Chat
            </button>
          </div>
        ) : (
          <div className="space-y-7 pt-2">
            {(Object.keys(groups) as Array<keyof typeof groups>).map((key) => {
              const group = groups[key];
              if (group.length === 0) return null;
              return (
                <div key={key} className="space-y-2.5">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-widest font-mono">
                      {GROUP_LABELS[key]}
                    </span>
                    <span className="text-xs text-muted-foreground/60 font-mono">
                      ({group.length})
                    </span>
                    <div className="h-px flex-1 bg-border/40 ml-2" />
                  </div>
                  <div className="grid gap-2">
                    {group.map((t) => (
                      <Link
                        key={t.id}
                        to="/tutor/$threadId"
                        params={{ threadId: t.id } as any}
                        className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-border/60 bg-card/60 hover:bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-200"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 pr-2">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm sm:text-[15px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {t.title || "Untitled Session"}
                            </p>
                            {t.updated_at && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 font-mono">
                                <Clock className="h-3 w-3 shrink-0" />
                                <span>
                                  {new Date(t.updated_at).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => deleteThread(t.id, e)}
                            disabled={deletingId === t.id}
                            className="p-2 rounded-xl text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                            title="Delete chat"
                            aria-label="Delete chat"
                          >
                            {deletingId === t.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
