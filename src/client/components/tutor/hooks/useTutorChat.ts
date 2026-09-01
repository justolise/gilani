import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/client/supabase";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";
import { getErrorMessage } from "@/shared/utils/async";
import { useThreadsQuery } from "@/client/hooks/useThreadsQuery";
import { useMessagesQuery } from "@/client/hooks/useMessagesQuery";
import { hasPendingMessage } from "@/shared/utils/pending-message";
import { useRateLimitState } from "./split/useRateLimitState";
import { useEscalationChatState } from "./split/useEscalationChatState";
import { useMessageManagement } from "./split/useMessageManagement";

export function useTutorChat({
  threadId,
  userId,
  authToken,
}: {
  threadId?: string;
  userId: string | null;
  authToken: string | null;
}) {
  const { threads, threadsLoading, threadsLoadError, setThreads, invalidateThreads } =
    useThreadsQuery(userId);

  const rateLimitState = useRateLimitState(userId);
  const escalationState = useEscalationChatState(threadId, userId);

  const [currentPlan, setCurrentPlan] = useState("free");
  const isBrandNewThreadRef = useRef(!!threadId && hasPendingMessage(threadId));
  const [isBrandNewThread, setIsBrandNewThread] = useState(isBrandNewThreadRef.current);
  const [messagesLoading, setMessagesLoading] = useState(!isBrandNewThread);
  const [messagesLoadError, setMessagesLoadError] = useState<string | null>(null);

  // Load user plan profile for billing plan checks
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!userId) return;
        const { data, error } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", userId)
          .maybeSingle();
        if (error) throw error;
        if (mounted && (data as any)?.plan) setCurrentPlan((data as any).plan);
      } catch (err) {
        console.error("Failed to load user plan profile:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  useEffect(() => {
    const safety = setTimeout(() => {
      setMessagesLoading((prev) => {
        if (prev) console.warn("[TutorThread] Safety timeout: forcing messagesLoading off");
        return false;
      });
    }, 25000);
    return () => clearTimeout(safety);
  }, []);

  const attachmentMetaRef = useRef<{
    storageUrl?: string;
    mimeType?: string;
    fileName?: string;
  } | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { threadId },
        headers: {
          "x-thread-id": threadId ?? "",
          "x-model-id": "gemini-2.5-flash",
          Authorization: `Bearer ${authToken ?? ""}`,
        },
        fetch: async (input, init) => {
          if (attachmentMetaRef.current && init?.body) {
            try {
              const parsed = JSON.parse(init.body as string);
              parsed.attachmentMeta = attachmentMetaRef.current;
              attachmentMetaRef.current = null;
              init = { ...init, body: JSON.stringify(parsed) };
            } catch {
              /* ignore parse errors */
            }
          }
          const res = await fetch(input, init);
          if (!res.ok) {
            let errText: string;
            try {
              errText = await res.text();
            } catch {
              errText = res.statusText;
            }
            throw new Error(errText);
          }
          return res;
        },
      }),
    [threadId, authToken],
  );

  const chatHelpers: any = useChat({
    id: threadId,
    transport,
    experimental_throttle: 50,
    onError: async (err: any) => {
      const msg = err instanceof Error ? err.message : String(err);
      const isAuthError =
        msg.includes("401") ||
        msg.toLowerCase().includes("expired") ||
        msg.toLowerCase().includes("jwt") ||
        msg.toLowerCase().includes("unauthorized");
      if (isAuthError) {
        await supabase.auth.refreshSession();
        toast.error("Session expired — please send your message again.", { duration: 5000 });
        rateLimitState.setChatError(null);
        return;
      }
      const friendly = getErrorMessage(err, "Something went wrong. Please try again.");
      rateLimitState.setChatError(msg);
      toast.error(friendly, { duration: 4000 });
    },
    onEnd: (message: any) => {
      rateLimitState.setChatError(null);
      let dbMessageId: string | null = null;
      if (Array.isArray(message.annotations)) {
        for (const ann of message.annotations) {
          const arr = Array.isArray(ann) ? ann : [ann];
          for (const a of arr) {
            if (a?.messageId) {
              dbMessageId = a.messageId;
              break;
            }
          }
          if (dbMessageId) break;
        }
      }
      if (dbMessageId) {
        setMessages((prev: any[]) =>
          prev.map((m: any) => (m.id === message.id ? { ...m, id: dbMessageId } : m)),
        );
      }
      rateLimitState.refreshRateLimitStatus();
    },
  } as any);

  const { messages: messagesRaw, setMessages, sendMessage, stop, status, regenerate } = chatHelpers;
  const isPending = status === "submitted" || status === "streaming";
  const messages = messagesRaw as UIMessage[];
  const messagesRef = useRef<UIMessage[]>(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (messagesRaw.length > 0 && messagesLoading) {
      setMessagesLoading(false);
    }
  }, [messagesRaw.length, messagesLoading]);

  const handleReload = useCallback(() => regenerate({ body: { isRetry: true } }), [regenerate]);

  const {
    data: messagesData,
    isLoading: queryMessagesLoading,
    error: queryMessagesError,
    refetch: loadMessages,
  } = useMessagesQuery(isBrandNewThread ? null : threadId, userId);

  const messageMgmt = useMessageManagement({
    threadId,
    messagesLoading,
    messagesRaw,
    setMessages,
    regenerate,
    loadMessages,
  });

  useEffect(() => {
    if (messagesData) {
      if (messagesData.messages.length > 0) {
        if (messagesData.messages.length >= messagesRef.current.length) {
          setMessages(messagesData.messages);
        }
      } else if (messagesRef.current.length === 0) {
        setMessages([]);
      }
      escalationState.setEscalationStatus(messagesData.escalationStatus as any);
      messageMgmt.setUserVotes(messagesData.userVotes);
    }
  }, [messagesData, setMessages]);

  useEffect(() => {
    if (queryMessagesError) {
      setMessagesLoadError("Connection failed. Try refreshing.");
    } else {
      setMessagesLoadError(null);
    }
  }, [queryMessagesError]);

  useEffect(() => {
    if (queryMessagesLoading !== undefined) {
      setMessagesLoading(queryMessagesLoading);
    }
  }, [queryMessagesLoading]);

  const prevPendingRef = useRef(isPending);
  useEffect(() => {
    if (prevPendingRef.current && !isPending) {
      if (isBrandNewThread) {
        setIsBrandNewThread(false);
      }
      const timer = setTimeout(() => {
        loadMessages();
        invalidateThreads();
      }, 500);
      return () => clearTimeout(timer);
    }
    prevPendingRef.current = isPending;
  }, [isPending, loadMessages, isBrandNewThread, invalidateThreads]);

  const createNewThread = async (navigate: any) => {
    navigate({ to: "/tutor", search: { new: "1" } });
  };

  return {
    threads,
    threadsLoading,
    threadsLoadError,
    setThreads,
    invalidateThreads,
    chatError: rateLimitState.chatError,
    setChatError: rateLimitState.setChatError,
    messagesUsed: rateLimitState.messagesUsed,
    messagesMax: rateLimitState.messagesMax,
    isRateLimited: rateLimitState.isRateLimited,
    currentPlan,
    messagesLoading,
    messagesLoadError,
    userVotes: messageMgmt.userVotes,
    escalationStatus: escalationState.escalationStatus,
    setEscalationStatus: escalationState.setEscalationStatus,
    escalating: escalationState.escalating,
    escalateEmailError: escalationState.escalateEmailError,
    setEscalateEmailError: escalationState.setEscalateEmailError,
    messages,
    setMessages,
    sendMessage: (
      msg: any,
      attachmentMeta?: { storageUrl?: string; mimeType?: string; fileName?: string },
    ) => {
      if (attachmentMeta) attachmentMetaRef.current = attachmentMeta;
      return sendMessage(msg);
    },
    stop,
    status,
    isPending,
    regenerate,
    handleReload,
    handleVote: messageMgmt.handleVote,
    handleEdit: messageMgmt.handleEdit,
    handleDeleteMessage: messageMgmt.handleDeleteMessage,
    handleEscalate: escalationState.handleEscalate,
    createNewThread,
    refreshRateLimitStatus: rateLimitState.refreshRateLimitStatus,
  };
}
