import React from "react";
import {
  Timer,
  SquarePen,
  MoreVertical,
  Pencil,
  Download,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import { AppHeader } from "@/client/components/layout/AppHeader";

type Thread = {
  id: string;
  title?: string | null;
  updated_at?: string | null;
};

type Props = {
  threadId?: string;
  threads: Thread[];
  userId: string | null; // Kept for prop backwards compatibility
  timerState: { minutes: number; seconds: number; running: boolean } | null;
  escalationStatus: "open" | "in_review" | "resolved" | null;
  sidebarOpen: boolean; // Kept for prop backwards compatibility
  setSidebarOpen: (open: boolean) => void; // Kept for prop backwards compatibility
  createNewThread: () => void;
  requestRenameThread: (id: string, currentTitle: string) => void;
  requestDeleteThread: (id: string) => void;
  setTimerOpen: (open: boolean) => void;
  handleExportPDF: () => void;
  setEscalateModalOpen: (open: boolean) => void;
};

export function ThreadHeader({
  threadId,
  threads,
  timerState,
  escalationStatus,
  createNewThread,
  requestRenameThread,
  requestDeleteThread,
  setTimerOpen,
  handleExportPDF,
  setEscalateModalOpen,
}: Props) {
  const currentTitle = threadId ? threads.find((th) => th.id === threadId)?.title : "";

  const actionsContent = (
    <div className="flex items-center gap-1">
      <button
        onClick={createNewThread}
        className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
        title="New Chat"
        aria-label="New Chat"
      >
        <SquarePen className="h-5 w-5" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="More session options"
            title="More options"
          >
            <MoreVertical className="h-5 w-5" />
            {timerState?.running && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={createNewThread}>
            <SquarePen className="h-4 w-4 mr-2 text-primary" />
            <span>New Chat</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setTimerOpen(true)}>
            <Timer className="h-4 w-4 mr-2" />
            <span className="flex-1">Study Timer</span>
            {timerState && (
              <span className="font-mono text-xs font-semibold text-primary ml-2">
                {String(timerState.minutes).padStart(2, "0")}:
                {String(timerState.seconds).padStart(2, "0")}
              </span>
            )}
          </DropdownMenuItem>

          {threadId && (
            <DropdownMenuItem
              onClick={() => requestRenameThread(threadId, currentTitle || "Untitled Chat")}
            >
              <Pencil className="h-4 w-4 mr-2" />
              <span>Rename</span>
            </DropdownMenuItem>
          )}

          {threadId && (
            <DropdownMenuItem onClick={() => handleExportPDF()}>
              <Download className="h-4 w-4 mr-2" />
              <span>Export PDF</span>
            </DropdownMenuItem>
          )}

          {threadId && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEscalateModalOpen(true)}>
                {escalationStatus === "resolved" ? (
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                ) : escalationStatus === "in_review" || escalationStatus === "open" ? (
                  <Clock className="h-4 w-4 mr-2 text-amber-500 animate-pulse" />
                ) : (
                  <ShieldAlert className="h-4 w-4 mr-2 text-amber-500" />
                )}
                <span>
                  {escalationStatus === "resolved"
                    ? "Teacher Reviewed"
                    : escalationStatus === "in_review" || escalationStatus === "open"
                      ? "Review Pending"
                      : "Escalate to Teacher"}
                </span>
              </DropdownMenuItem>
            </>
          )}

          {threadId && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => requestDeleteThread(threadId)}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <span>Delete Chat</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const titleContent = (
    <div className="w-full flex items-center justify-center px-1">
      <h1
        className="text-base sm:text-lg font-semibold text-foreground truncate max-w-full text-center tracking-tight"
        title={currentTitle || "New Conversation"}
      >
        {currentTitle || "New Conversation"}
      </h1>
    </div>
  );

  return <AppHeader centerContent={titleContent} actions={actionsContent} />;
}
