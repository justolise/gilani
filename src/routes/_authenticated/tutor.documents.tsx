import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/client/supabase";
import { deleteNote, retryNote } from "@/fns/notes.server-fns";
import { GilaniLoader } from "@/client/components/GilaniLoader";
import { UploadCloud, Search, Loader2, FileText, Sparkles, Plus } from "lucide-react";
import { toast } from "sonner";
import { friendlyError, getErrorMessage } from "@/shared/utils/async";
import { AppHeader } from "@/client/components/layout/AppHeader";
import { NoteCard, type NoteCardData } from "@/client/components/notes/NoteCard";
import { NoteUploadModal } from "@/client/components/notes/NoteUploadModal";
import { ConfirmDialog } from "@/client/components/shared/ConfirmDialog";
import { DocumentsSkeleton } from "@/client/components/notes/DocumentsSkeleton";

export const Route = createFileRoute("/_authenticated/tutor/documents")({
  component: DocumentsRoute,
});

const PAGE_SIZE = 10;

function DocumentsRoute() {
  const [notes, setNotes] = useState<NoteCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchNotes = async (searchTerm: string, page: number, append: boolean) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("notes")
        .select("id, title, summary, raw_text, key_concepts, status, error_message, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      if (searchTerm.trim()) {
        query = query.ilike("title", `%${searchTerm.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const results = (data as any) || [];
      setNotes((prev) => (append ? [...prev, ...results] : results));
      setHasMore(results.length === PAGE_SIZE);
    } catch (err: any) {
      toast.error(friendlyError(err, "Failed to load your documents."));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNotes("", 0, false);
  }, []);

  const onSearchChange = (value: string) => {
    setSearch(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setLoading(true);
      fetchNotes(value, 0, false);
    }, 350);
  };

  const onLoadMore = () => {
    setLoadingMore(true);
    fetchNotes(search, Math.floor(notes.length / PAGE_SIZE), true);
  };

  const onConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      await deleteNote({ data: { noteId: id } });
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success("Note deleted");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete this note. Please try again."));
    } finally {
      setDeletingId(null);
    }
  };

  const onRetry = async (id: string) => {
    setRetryingId(id);
    try {
      await retryNote({ data: { noteId: id } });
      toast.success("Re-processing note…");
      fetchNotes(search, 0, false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Retry failed."));
    } finally {
      setRetryingId(null);
    }
  };

  if (loading && notes.length === 0)
    return (
      <div className="h-full flex flex-col bg-background">
        <AppHeader
          title="Document Library"
          subtitle="Loading your study notes…"
          actions={
            <button
              disabled
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary/60 text-primary-foreground px-4 py-2 text-sm font-semibold opacity-75 cursor-not-allowed min-h-11"
            >
              <UploadCloud className="h-4 w-4" /> Upload Notes
            </button>
          }
        />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            <DocumentsSkeleton />
          </div>
        </div>
      </div>
    );

  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      <AppHeader
        title="Document Library"
        subtitle={`${notes.length}${hasMore ? "+" : ""} note${notes.length !== 1 ? "s" : ""}`}
        actions={
          <button
            onClick={() => setUploadOpen(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs active:scale-95 cursor-pointer min-h-11"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Notes</span>
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {(notes.length > 0 || search) && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search notes and curriculum summaries…"
                className="w-full rounded-2xl border border-border/70 bg-card/70 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60 transition-all backdrop-blur-md shadow-xs"
              />
            </div>
          )}

          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center border border-dashed border-border/70 rounded-3xl bg-card/30 mt-6 space-y-4">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground font-display">
                  {search ? "No matching documents found" : "Your study library is empty"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 leading-relaxed">
                  {search
                    ? "Try searching for another keyword or clear the search filter."
                    : "Upload PDFs, Word documents, images, or textbook excerpts. GilaniAI analyzes and generates structured revision summaries."}
                </p>
              </div>
              {!search && (
                <button
                  onClick={() => setUploadOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Upload Document
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onDelete={setConfirmDeleteId}
                    onRetry={onRetry}
                    deleting={deletingId === note.id}
                    retrying={retryingId === note.id}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={onLoadMore}
                    disabled={loadingMore}
                    className="px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all disabled:opacity-40 min-h-11 cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-2">
                      {loadingMore && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                      {loadingMore ? "Loading more notes…" : "Load more notes"}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {uploadOpen && (
        <NoteUploadModal
          onClose={() => setUploadOpen(false)}
          onUploaded={() => fetchNotes(search, 0, false)}
        />
      )}

      {confirmDeleteId && (
        <ConfirmDialog
          title="Delete this document?"
          description="This will permanently remove the document and its AI summary from your account. This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={onConfirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
