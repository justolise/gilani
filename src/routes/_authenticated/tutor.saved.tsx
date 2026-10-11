import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/client/supabase";
import { GilaniLoader } from "@/client/components/GilaniLoader";
import { Star, MessageSquare, ArrowRight, BookOpen, Clock } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/client/components/layout/AppHeader";
import { MarkdownRenderer } from "@/client/components/tutor/MarkdownRenderer";

export const Route = createFileRoute("/_authenticated/tutor/saved")({
  component: SavedRoute,
});

function SavedRoute() {
  const [savedMessages, setSavedMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchSaved = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: feedbackData, error: feedbackError } = await supabase
          .from("message_feedback")
          .select("message_id")
          .eq("user_id", user.id)
          .eq("vote", 1);

        if (feedbackError) throw feedbackError;

        const messageIds = (feedbackData || []).map((f: any) => f.message_id);
        if (messageIds.length === 0) {
          if (mounted) setSavedMessages([]);
          return;
        }

        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("id, content, created_at, conversation_id, conversations(title)")
          .in("id", messageIds)
          .order("created_at", { ascending: false });

        if (messagesError) throw messagesError;
        if (mounted) setSavedMessages(messagesData || []);
      } catch (err: any) {
        toast.error(err.message || "Failed to load saved items");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchSaved();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading)
    return (
      <div className="h-full flex flex-col bg-background">
        <AppHeader title="Saved Explanations" subtitle="Your bookmarked study insights" />
        <div className="flex-1 flex items-center justify-center">
          <GilaniLoader />
        </div>
      </div>
    );

  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      <AppHeader
        title="Saved Explanations"
        subtitle={`${savedMessages.length} bookmarked response${savedMessages.length !== 1 ? "s" : ""}`}
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {savedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed border-border/70 rounded-3xl bg-card/30 max-w-lg mx-auto mt-6 space-y-4">
              <div className="h-16 w-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                <Star className="h-8 w-8 fill-amber-500/30" />
              </div>
              <h3 className="text-xl font-bold text-foreground font-display">
                No saved explanations yet
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When you receive a helpful answer, formula breakdown, or step-by-step solution from
                GilaniAI, click the <span className="text-amber-500 font-semibold">thumbs up</span>{" "}
                button in the chat to pin it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {savedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-3xl border border-border/60 bg-card/70 p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-7 w-7 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                          <Star className="h-3.5 w-3.5 fill-amber-500" />
                        </div>
                        <span className="text-xs font-semibold text-foreground truncate">
                          {(msg.conversations as any)?.title || "Study Session"}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground/80 shrink-0">
                        {new Date(msg.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="text-sm text-foreground/90 overflow-y-auto max-h-72 custom-scrollbar pr-2 leading-relaxed">
                      <MarkdownRenderer content={msg.content || ""} />
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-border/40 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Curriculum Reference</span>
                    </div>
                    <Link
                      to={`/tutor/${msg.conversation_id}` as any}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-xl hover:bg-primary/10 cursor-pointer"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Go to Chat</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
