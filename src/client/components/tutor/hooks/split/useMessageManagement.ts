import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/client/supabase";
import { toast } from "sonner";
import type { UIMessage } from "@ai-sdk/react";

export function useMessageManagement({
  threadId,
  messagesLoading,
  messagesRaw,
  setMessages,
  regenerate,
  loadMessages,
}: {
  threadId?: string;
  messagesLoading: boolean;
  messagesRaw: any[];
  setMessages: (msgs: any) => void;
  regenerate: (opt: any) => void;
  loadMessages: () => void;
}) {
  const [userVotes, setUserVotes] = useState<Record<string, 1 | -1>>({});

  const handleVote = useCallback((msgId: string, vote: 1 | -1 | null) => {
    setUserVotes((prev) => {
      if (vote === null) {
        const next = { ...prev };
        delete next[msgId];
        return next;
      }
      return { ...prev, [msgId]: vote };
    });
  }, []);

  const handleEdit = useCallback(
    async (messageId: string, newText: string) => {
      if (!threadId) return;
      const { data: editedMsg } = await supabase
        .from("messages")
        .select("created_at")
        .eq("id", messageId)
        .maybeSingle();
      if (!editedMsg) {
        toast.error("Message not found");
        return;
      }
      setMessages((prev: UIMessage[]) =>
        prev.map((m: UIMessage) =>
          m.id === messageId
            ? { ...m, content: newText, parts: [{ type: "text" as const, text: newText }] }
            : m,
        ),
      );
      const { error: updateError } = await supabase
        .from("messages")
        .update({ content: newText, parts: JSON.stringify([{ type: "text", text: newText }]) })
        .eq("id", messageId);
      if (updateError) {
        toast.error("Failed to save edit");
        return;
      }
      const { error: deleteError } = await supabase
        .from("messages")
        .delete()
        .eq("conversation_id", threadId as string)
        .gt("created_at", editedMsg.created_at);
      if (deleteError) {
        console.error("Failed to clean up subsequent messages:", deleteError);
      }
      const msgs = messagesRaw as any[];
      const editedIdx = msgs.findIndex((m: any) => m.id === messageId);
      if (editedIdx === -1) return;
      const baseMessages = msgs
        .slice(0, editedIdx + 1)
        .map((m: any) =>
          m.id === messageId
            ? { ...m, content: newText, parts: [{ type: "text", text: newText }] }
            : m,
        );
      setMessages(baseMessages);
      regenerate({ body: { isRetry: true } });
    },
    [threadId, messagesRaw, setMessages, regenerate],
  );

  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      setMessages((prev: UIMessage[]) => prev.filter((m: UIMessage) => m.id !== messageId));
      try {
        const { error } = await supabase.from("messages").delete().eq("id", messageId);
        if (error) throw error;
        toast.success("Message deleted");
      } catch {
        loadMessages();
        toast.error("Failed to delete message");
      }
    },
    [setMessages, loadMessages],
  );

  useEffect(() => {
    if (!threadId || messagesLoading) return;
    const channel = supabase
      .channel(`messages-${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${threadId}`,
        },
        (payload) => {
          const msg = payload.new as any;
          if (msg?.role === "assistant" && msg?.content?.includes("Teacher Review:")) {
            const teacherMsg = {
              id: msg.id ?? crypto.randomUUID(),
              role: "assistant" as const,
              content: msg.content || "",
              parts: [{ type: "text" as const, text: msg.content || "" }],
              createdAt: msg.created_at ? new Date(msg.created_at) : new Date(),
            };
            setMessages((prev: UIMessage[]) => {
              const alreadyExists = prev.some((m) => m.id === teacherMsg.id);
              if (alreadyExists) return prev;
              return [...prev, teacherMsg];
            });
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, messagesLoading, setMessages]);

  return {
    userVotes,
    setUserVotes,
    handleVote,
    handleEdit,
    handleDeleteMessage,
  };
}
