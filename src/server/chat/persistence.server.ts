import { supabaseAdmin } from "@/server/supabase";
import { sanitizeUntrustedInput } from "@/shared/utils/tutor-prompt";
import { extractText } from "./prompt-builder.server";

export async function persistUserMessage({
  userId,
  threadId,
  lastMessage,
  isRetry,
  attachmentMeta,
}: {
  userId: string;
  threadId: string;
  lastMessage: any;
  isRetry?: boolean;
  attachmentMeta?: { storageUrl?: string; mimeType?: string; fileName?: string };
}) {
  if (lastMessage?.role === "user" && !isRetry) {
    const rawText = extractText(lastMessage);
    const userText = sanitizeUntrustedInput(rawText.slice(0, 10_000));
    await supabaseAdmin.from("messages").insert({
      conversation_id: threadId,
      role: "user",
      content: (userText || null) as any,
      parts: JSON.stringify([{ type: "text", text: userText }]),
      user_id: userId,
      ...(attachmentMeta?.storageUrl
        ? {
            file_url: attachmentMeta.storageUrl,
            file_type: attachmentMeta.mimeType ?? null,
            file_name: attachmentMeta.fileName ?? null,
          }
        : {}),
    } as any);
  } else if (isRetry) {
    const { data: lastMsg } = await supabaseAdmin
      .from("messages")
      .select("id, role")
      .eq("conversation_id", threadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (lastMsg?.role === "assistant") {
      await supabaseAdmin.from("messages").delete().eq("id", lastMsg.id);
    }
  }
}

export function buildThinkingSteps(steps?: any[]): Array<Record<string, unknown>> {
  const thinkingSteps: Array<Record<string, unknown>> = [];
  try {
    for (const step of steps ?? []) {
      if (step.reasoningText?.trim()) {
        thinkingSteps.push({
          type: "reasoning",
          text: step.reasoningText.trim().slice(0, 2000),
        });
      }
      for (const part of step.content ?? []) {
        if (part.type === "tool-call") {
          thinkingSteps.push({
            type: "tool-call",
            toolName: (part as any).toolName,
            input: (part as any).input,
          });
        } else if (part.type === "tool-result") {
          thinkingSteps.push({
            type: "tool-result",
            toolName: (part as any).toolName,
            output: (part as any).output,
          });
        }
      }
    }
  } catch (stepErr) {
    console.error("[API Chat] Failed to build thinking steps:", stepErr);
  }
  return thinkingSteps;
}

export async function persistAssistantResponse({
  threadId,
  userId,
  safeText,
  thinkingSteps,
  providerMetadata,
  result,
}: {
  threadId: string;
  userId: string;
  safeText: string;
  thinkingSteps: Array<Record<string, unknown>>;
  providerMetadata: any;
  result: any;
}) {
  try {
    const assistantParts: Array<Record<string, unknown>> = [
      { type: "text" as const, text: safeText },
    ];
    if (thinkingSteps.length) {
      assistantParts.push({ type: "thinking-steps", steps: thinkingSteps });
    }
    const thoughtSignature = providerMetadata?.google?.thoughtSignature || null;
    const { data: insertedMsg } = await supabaseAdmin
      .from("messages")
      .insert({
        conversation_id: threadId,
        role: "assistant",
        content: safeText,
        parts: JSON.stringify(assistantParts) as any,
        confidence: 0.9,
        user_id: userId,
        thought_signature: thoughtSignature,
      } as any)
      .select("id")
      .single();
    if (insertedMsg?.id) {
      result?.experimental_sendMessageAnnotations?.([{ messageId: insertedMsg.id }]);
    }
    await supabaseAdmin.from("audit_logs").insert({
      action: "tutor.message",
      payload: { threadId, confidence: 0.9, provider: "google" },
    });
    const safety = providerMetadata?.google?.safetyRatings;
    if (
      Array.isArray(safety) &&
      safety.some((s: any) => s.probability === "HIGH" || s.probability === "MEDIUM")
    ) {
      const { data: escData, error: escErr } = await supabaseAdmin
        .from("escalations")
        .insert({
          conversation_id: threadId,
          reason: "Safety probability threshold exceeded",
          status: "pending",
          user_id: userId,
        })
        .select("id")
        .single();
      if (!escErr && escData) {
        import("@/server/zapier.server")
          .then(({ triggerZapierEscalation }) => {
            triggerZapierEscalation({
              escalationId: escData.id,
              userId,
              threadId,
              reason: "Safety probability threshold exceeded",
              detail: "Automatically escalated due to model safety ratings threshold breach.",
            });
          })
          .catch((err) => console.error("[Zapier] Failed to load safety trigger:", err));
      }
    }
  } catch (persistError) {
    console.error("Failed to persist assistant message:", persistError);
  }
}
