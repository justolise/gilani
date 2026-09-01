import { useEffect, useState } from "react";
import { supabase } from "@/client/supabase";
import { toast } from "sonner";
import { friendlyError } from "@/shared/utils/async";
import {
  createEscalationNotification,
  lookupTeacherByEmail,
  createEscalationFn,
} from "@/fns/tutor.server-fns";

export function useEscalationChatState(threadId?: string, userId?: string | null) {
  const [escalationStatus, setEscalationStatus] = useState<
    "open" | "in_review" | "resolved" | null
  >(null);
  const [escalating, setEscalating] = useState(false);
  const [escalateEmailError, setEscalateEmailError] = useState("");

  useEffect(() => {
    if (!threadId) return;
    const channel = supabase
      .channel(`escalation-status-${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "escalations",
          filter: `conversation_id=eq.${threadId}`,
        },
        (payload) => {
          const newStatus = (payload.new as any)?.status;
          if (newStatus) {
            setEscalationStatus(newStatus);
            if (newStatus === "resolved")
              toast.success("A teacher has reviewed your conversation and responded!", {
                duration: 6000,
              });
            else if (newStatus === "in_review")
              toast.info("A teacher is now reviewing your conversation.", { duration: 4000 });
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId]);

  const handleEscalate = async (email?: string) => {
    if (!threadId) return;
    if (!email || !email.trim()) {
      setEscalateEmailError("Please enter your teacher's email address.");
      return;
    }
    setEscalating(true);
    try {
      if (!userId) throw new Error("Not logged in");
      let reviewerId: string;
      try {
        reviewerId = await lookupTeacherByEmail({ data: email.trim().toLowerCase() });
      } catch (err: any) {
        setEscalateEmailError(err.message || "No teacher found with that email address.");
        setEscalating(false);
        return;
      }
      const result = await createEscalationFn({
        data: {
          conversationId: threadId,
          reason: "student_request",
          detail: "Student manually requested teacher review.",
          reviewerId: reviewerId ?? null,
        },
      });
      if (result.alreadyOpen) {
        toast.info("This conversation already has an open escalation.");
        setEscalating(false);
        return;
      }
      await createEscalationNotification({
        data: { conversationId: threadId, reviewerId: reviewerId ?? null },
      });
      setEscalationStatus("open");
      setEscalateEmailError("");
      toast.success("Conversation escalated to your teacher! They will be notified by email.");
      return true;
    } catch (err: any) {
      toast.error(friendlyError(err, "Failed to escalate conversation."));
      return false;
    } finally {
      setEscalating(false);
    }
  };

  return {
    escalationStatus,
    setEscalationStatus,
    escalating,
    escalateEmailError,
    setEscalateEmailError,
    handleEscalate,
  };
}
