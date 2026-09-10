import React, { useCallback, useEffect, useState, useRef, Suspense, lazy } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/client/supabase";
import { GilaniLoader } from "@/client/components/GilaniLoader";
import { useLayout } from "@/client/contexts/layout-context";
import { toast } from "sonner";
import { generateThreadTitleFn } from "@/fns/tutor.server-fns";
import {
  consumePendingMessage,
  hasPendingMessage,
  peekPendingMessage,
} from "@/shared/utils/pending-message";
import { useAuth } from "@/client/hooks/use-auth";
import { useTutorChat } from "@/client/components/tutor/hooks/useTutorChat";
import { useComposer } from "@/client/components/tutor/hooks/useComposer";
import { useProfile } from "@/client/components/layout/hooks/split/useProfile";
import { ThreadHeader } from "@/client/components/tutor/ThreadHeader";
import { ChatInput } from "@/client/components/tutor/ChatInput";
import { PlansModal } from "@/client/components/PlansModal";
import { EscalateModal } from "@/client/components/tutor/EscalateModal";
import { MessageList } from "@/client/components/tutor/MessageList";
import { PomodoroTimer } from "@/client/components/tutor/PomodoroTimer";

const InAppCamera = lazy(() =>
  import("@/client/components/tutor/InAppCamera").then((m) => ({ default: m.InAppCamera })),
);

// Export utils loaded lazily
const exportAsPDF = async (
  ...args: Parameters<typeof import("@/shared/utils/export-utils").exportAsPDF>
) => {
  try {
    const { exportAsPDF: fn } = await import("@/shared/utils/export-utils");
    return fn(...args);
  } catch {
    const { toast } = await import("sonner");
    toast.error("Export failed — try again or use a different browser");
  }
};

export default function TutorThreadView({ threadId }: { threadId: string }) {
  const { session, loading: authLoading } = useAuth();

  const authToken = session?.access_token ?? null;
  const userId = session?.user?.id ?? null;
  const { profileName } = useProfile(userId);
  const userName = profileName || (session?.user?.user_metadata?.full_name ?? null);

  if (authLoading && !session && !hasPendingMessage(threadId)) return <GilaniLoader />;

  return (
    <TutorThreadInner
      key={threadId}
      threadId={threadId}
      authToken={authToken}
      userId={userId}
      userName={userName}
    />
  );
}

function TutorThreadInner({
  threadId,
  authToken,
  userId,
  userName,
}: {
  threadId: string;
  authToken: string | null;
  userId: string | null;
  userName: string | null;
}) {
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen, requestRenameThread, requestDeleteThread } = useLayout();

  const chatState = useTutorChat({ threadId, userId, authToken });
  const composer = useComposer();

  // Capture the pending first-message text synchronously at init time so that
  // Frame 1 can render the optimistic user bubble BEFORE the useEffect fires
  // and calls consumePendingMessage (which clears the global store).
  const [initialUserMessage, setInitialUserMessage] = useState<string | null>(() => {
    if (!threadId) return null;
    const p = peekPendingMessage(threadId);
    return p ? p.finalMessage : null;
  });

  // Clear initialUserMessage as soon as real messages exist in state
  useEffect(() => {
    if (chatState.messages.length > 0 && initialUserMessage) {
      setInitialUserMessage(null);
    }
  }, [chatState.messages.length, initialUserMessage]);

  const [timerOpen, setTimerOpen] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [teacherEmail, setTeacherEmail] = useState("");

  const [timerState, setTimerState] = useState<{
    minutes: number;
    seconds: number;
    running: boolean;
  } | null>(null);
  useEffect(() => {
    const handler = (e: Event) => {
      const { minutes, seconds, running } = (e as CustomEvent).detail as any;
      setTimerState(running ? { minutes, seconds, running } : null);
    };
    window.addEventListener("pomodoro:tick", handler);
    return () => window.removeEventListener("pomodoro:tick", handler);
  }, []);

  useEffect(() => {
    const handleGlobalEscalate = () => {
      if (!chatState.escalationStatus && !chatState.escalating && !chatState.messagesLoading) {
        setEscalateModalOpen(true);
      }
    };
    window.addEventListener("custom:trigger-escalation", handleGlobalEscalate);
    return () => window.removeEventListener("custom:trigger-escalation", handleGlobalEscalate);
  }, [chatState.escalationStatus, chatState.escalating, chatState.messagesLoading]);

  const handleExportPDF = useCallback(() => {
    const title = chatState.threads.find((t) => t.id === threadId)?.title || "study-session";
    exportAsPDF(chatState.messages, title);
  }, [chatState.threads, threadId, chatState.messages]);

  const sendChatMessage = (
    finalMessage: string,
    titleSeedText: string,
    attachmentMeta?: { storageUrl?: string; mimeType?: string; fileName?: string },
  ) => {
    if (chatState.isRateLimited) {
      toast.error("Daily message limit reached. Upgrade your plan to continue learning today.");
      setShowPlans(true);
      return;
    }

    try {
      const currentThread = chatState.threads.find((t) => t.id === threadId);
      // ── Immediate optimistic sidebar update & title generation ───────────
      if (chatState.messages.length === 0 && (!currentThread || !currentThread.title)) {
        const initialTitle =
          titleSeedText
            .replace(/<[^>]+>/g, "")
            .replace(/\[[^\]]+\]/g, "")
            .trim()
            .split(/\s+/)
            .slice(0, 5)
            .join(" ")
            .slice(0, 45) || "Study Session";

        // Optimistically insert/update the thread in sidebar right away
        chatState.setThreads((prev: any[]) => {
          const exists = prev.some((t) => t.id === threadId);
          if (exists) {
            return prev.map((t) =>
              t.id === threadId ? { ...t, title: t.title || initialTitle } : t,
            );
          }
          return [
            { id: threadId, title: initialTitle, updated_at: new Date().toISOString() },
            ...prev,
          ];
        });

        // Trigger asynchronous title generation + DB update
        generateThreadTitleFn({
          data: {
            threadId,
            text: titleSeedText.slice(0, 499),
          },
        })
          .then((finalTitle) => {
            if (finalTitle) {
              chatState.setThreads((prev: any[]) =>
                prev.map((t) => (t.id === threadId ? { ...t, title: finalTitle } : t)),
              );
              chatState.invalidateThreads();
              import("@/client/db/local").then(({ localDb }) => {
                localDb.threads
                  .put({ id: threadId, title: finalTitle, updated_at: new Date().toISOString() })
                  .catch(() => {});
              });
            }
          })
          .catch((err) => console.warn("[Title Gen] Client handler non-fatal:", err));
      }
      // Start streaming immediately (title generation runs in parallel above)
      chatState.sendMessage({ text: finalMessage }, attachmentMeta).catch((error: unknown) => {
        console.error("[TutorThread] sendMessage background error:", error);
        toast.error("Failed to send message. Please try again.");
      });
    } catch (error) {
      console.error("[TutorThread] submit error:", error);
    }
  };

  const submit = async (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();
    if (chatState.isRateLimited) {
      toast.error("Daily message limit reached. Upgrade your plan to continue learning today.");
      setShowPlans(true);
      return;
    }

    const trimmedInput = composer.input.trim();
    if (!composer.hasContent(trimmedInput)) return;
    const finalMessage = composer.buildMessageText(trimmedInput);
    const titleSeedText =
      trimmedInput ||
      (composer.attachedFile
        ? `Uploaded a document: ${composer.attachedFile.name}`
        : "Started a new session");
    const attachmentMeta = composer.attachedFile
      ? {
          storageUrl: composer.attachedFile.storageUrl,
          mimeType: composer.attachedFile.mimeType,
          fileName: composer.attachedFile.name,
        }
      : undefined;
    composer.setInput("");
    composer.onRemoveFile();
    sendChatMessage(finalMessage, titleSeedText, attachmentMeta);
  };

  useEffect(() => {
    if (!threadId) return;
    let cancelled = false;

    async function processPending() {
      // Ensure session is available or refreshed before consuming and firing the pending message
      if (!authToken) {
        try {
          const { data } = await supabase.auth.getSession();
          if (!data.session?.access_token) {
            await supabase.auth.refreshSession();
          }
        } catch {
          /* ignore */
        }
      }
      if (cancelled) return;

      const pending = consumePendingMessage(threadId);
      if (pending) {
        if (chatState.isRateLimited) {
          toast.error("Daily message limit reached. Upgrade your plan to continue learning today.");
          setShowPlans(true);
          return;
        }
        sendChatMessage(pending.finalMessage, pending.titleSeedText);
      }
    }

    processPending();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, chatState.isRateLimited]);

  useEffect(() => {
    const handleGlobalSendMessage = (e: Event) => {
      const { text } = (e as CustomEvent<{ text: string }>).detail || {};
      if (text && text.trim()) {
        sendChatMessage(text.trim(), text.trim());
      }
    };
    window.addEventListener("custom:send-chat-message", handleGlobalSendMessage);
    return () => window.removeEventListener("custom:send-chat-message", handleGlobalSendMessage);
  }, [threadId, chatState]);

  const handleEscalateConfirm = async (email?: string) => {
    const success = await chatState.handleEscalate(email);
    if (success) {
      setEscalateModalOpen(false);
      setTeacherEmail("");
    }
  };

  return (
    <div className="flex h-full bg-background text-foreground overflow-hidden">
      <main
        className="flex flex-col min-w-0 overflow-hidden w-full h-full"
        style={{ flex: 1, minHeight: 0 }}
      >
        <ThreadHeader
          threadId={threadId as string}
          threads={chatState.threads}
          userId={userId}
          timerState={timerState}
          escalationStatus={chatState.escalationStatus}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          createNewThread={() => chatState.createNewThread(navigate)}
          requestRenameThread={requestRenameThread}
          requestDeleteThread={requestDeleteThread}
          setTimerOpen={setTimerOpen}
          handleExportPDF={handleExportPDF}
          setEscalateModalOpen={setEscalateModalOpen}
        />

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <MessageList
            threadId={threadId as string}
            messages={chatState.messages}
            messagesLoading={chatState.messagesLoading}
            messagesLoadError={chatState.messagesLoadError}
            isPending={chatState.isPending}
            isRateLimited={chatState.isRateLimited}
            chatError={chatState.chatError}
            onReload={chatState.handleReload}
            onEditRequest={composer.handleEditRequest}
            onDelete={chatState.handleDeleteMessage}
            onPromptClick={(prompt) => {
              if (chatState.isRateLimited) {
                toast.error(
                  "Daily message limit reached. Upgrade your plan to continue learning today.",
                );
                setShowPlans(true);
                return;
              }
              composer.handlePromptClick(prompt);
            }}
            recentThreads={chatState.threads}
            userId={userId}
            userVotes={chatState.userVotes}
            onVote={chatState.handleVote}
            onExportPDF={handleExportPDF}
            onEscalate={() => setEscalateModalOpen(true)}
            escalationStatus={chatState.escalationStatus}
            escalating={chatState.escalating}
            onUploadClick={() => {
              if (chatState.isRateLimited) {
                toast.error(
                  "Daily message limit reached. Upgrade your plan to continue learning today.",
                );
                setShowPlans(true);
                return;
              }
              const el = document.getElementById("chat-file-input") as HTMLInputElement | null;
              el?.click();
            }}
            onScanClick={() => {
              if (chatState.isRateLimited) {
                toast.error(
                  "Daily message limit reached. Upgrade your plan to continue learning today.",
                );
                setShowPlans(true);
                return;
              }
              composer.handleScanClick();
            }}
            onVoiceClick={() => {
              if (chatState.isRateLimited) {
                toast.error(
                  "Daily message limit reached. Upgrade your plan to continue learning today.",
                );
                setShowPlans(true);
                return;
              }
              composer.toggleVoiceInput();
            }}
            isListening={composer.isListening}
            allThreadsPath="/tutor/chats"
            onRateLimitExpired={() => {
              chatState.setChatError(null);
              chatState.refreshRateLimitStatus();
            }}
            messagesUsed={chatState.messagesUsed}
            messagesMax={chatState.messagesMax}
            onUpgrade={() => setShowPlans(true)}
            userName={userName}
            initialUserMessage={initialUserMessage}
          />
        </div>

        <div className="flex-shrink-0 z-20 lg:relative fixed bottom-0 left-0 right-0">
          <ChatInput
            input={composer.input}
            isPending={chatState.isPending}
            parsingFile={composer.parsingFile}
            uploadPhase={composer.uploadPhase}
            attachedFile={composer.attachedFile}
            chatError={chatState.chatError}
            isRateLimited={chatState.isRateLimited}
            docUploadError={composer.docUploadError}
            onClearDocError={composer.onClearDocError}
            onInputChange={(e) => composer.setInput(e.target.value)}
            onSubmit={submit}
            onStop={chatState.stop}
            onFileChange={composer.handleFileChange}
            inputRef={composer.chatInputRef}
            onRemoveFile={composer.onRemoveFile}
            onUpgrade={() => setShowPlans(true)}
            onRateLimitExpired={() => {
              chatState.setChatError(null);
              chatState.refreshRateLimitStatus();
            }}
            messagesUsed={chatState.messagesUsed}
            messagesMax={chatState.messagesMax}
            onScanClick={composer.handleScanClick}
            onVoiceClick={composer.toggleVoiceInput}
            isListening={composer.isListening}
          />
        </div>
      </main>

      {composer.isCameraOpen && (
        <Suspense fallback={<div className="fixed inset-0 z-[100] bg-black" />}>
          <InAppCamera
            onCapture={(file) => {
              composer.setIsCameraOpen(false);
              composer.handleRawFile(file, "scan");
            }}
            onClose={() => composer.setIsCameraOpen(false)}
          />
        </Suspense>
      )}

      {showPlans && (
        <PlansModal onClose={() => setShowPlans(false)} currentPlan={chatState.currentPlan} />
      )}

      {escalateModalOpen && (
        <EscalateModal
          teacherEmail={teacherEmail}
          onEmailChange={(val) => {
            setTeacherEmail(val);
            chatState.setEscalateEmailError("");
          }}
          onConfirm={() => handleEscalateConfirm(teacherEmail || undefined)}
          onCancel={() => {
            setEscalateModalOpen(false);
            setTeacherEmail("");
            chatState.setEscalateEmailError("");
          }}
          isEscalating={chatState.escalating}
          error={chatState.escalateEmailError}
        />
      )}

      <PomodoroTimer open={timerOpen} onOpenChange={setTimerOpen} showTrigger={false} />
    </div>
  );
}
