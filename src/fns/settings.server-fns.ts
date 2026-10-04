import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin, requireAuth, sendTransactionalEmail, emailTemplate } from "@/server/index";
import { invalidateCachedProfile } from "@/server/chat/profile-cache.server";

export const saveUserSettingsFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      displayName: z.string().max(100).optional(),
      avatarUrl: z.string().nullable().optional(),
      curriculum: z.string().max(50).optional(),
      tutorTone: z.string().max(50).optional(),
      tutorStyle: z.string().max(50).optional(),
      tutorDepth: z.string().max(50).optional(),
      disclaimerAccepted: z.boolean().optional(),
      cookieConsent: z.boolean().optional(),
      analyticsConsent: z.boolean().optional(),
      preferences: z.record(z.string(), z.any()).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { userId } = await requireAuth();

    // Build the core payload for profiles table
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.displayName !== undefined) {
      updatePayload.display_name = data.displayName.trim();
    }
    if (data.avatarUrl !== undefined) {
      updatePayload.avatar_url = data.avatarUrl;
    }
    if (data.curriculum !== undefined) {
      updatePayload.curriculum = data.curriculum;
    }
    if (data.tutorTone !== undefined) {
      updatePayload.tutor_tone = data.tutorTone;
    }
    if (data.tutorStyle !== undefined) {
      updatePayload.tutor_style = data.tutorStyle;
    }
    if (data.tutorDepth !== undefined) {
      updatePayload.tutor_depth = data.tutorDepth;
    }
    if (data.preferences !== undefined) {
      updatePayload.preferences = data.preferences;
    }

    // Try update with optional consent columns first
    const fullPayload: Record<string, any> = { ...updatePayload };
    if (data.disclaimerAccepted !== undefined) {
      fullPayload.disclaimer_accepted = data.disclaimerAccepted;
    }
    if (data.cookieConsent !== undefined) {
      fullPayload.cookie_consent = data.cookieConsent;
    }
    if (data.analyticsConsent !== undefined) {
      fullPayload.analytics_consent = data.analyticsConsent;
    }

    const { error: fullError } = await (supabaseAdmin.from("profiles") as any)
      .update(fullPayload)
      .eq("id", userId);

    if (fullError) {
      // If error occurred (e.g. consent columns don't exist in DB schema), retry with core payload
      const { error: coreError } = await (supabaseAdmin.from("profiles") as any)
        .update(updatePayload)
        .eq("id", userId);

      if (coreError) {
        console.error("[Settings ServerFn] Failed to update profile:", coreError.message);
        throw new Error(`Failed to update profile settings: ${coreError.message}`);
      }
    }

    // Invalidate profile cache so AI chat immediately picks up new curriculum/tone/style
    invalidateCachedProfile(userId);

    return { success: true };
  });

export const clearAllChatHistoryFn = createServerFn({ method: "POST" }).handler(async () => {
  const { userId } = await requireAuth();

  // Delete all messages belonging to the user
  await supabaseAdmin.from("messages").delete().eq("user_id", userId);

  // Delete all conversations belonging to the user
  const { error } = await supabaseAdmin.from("conversations").delete().eq("user_id", userId);

  if (error) {
    console.error("[clearAllChatHistoryFn] Error deleting conversations:", error.message);
    throw new Error(`Failed to clear chat history: ${error.message}`, { cause: error });
  }

  return { success: true };
});

export const exportUserDataFn = createServerFn({ method: "POST" }).handler(async () => {
  const { userId, user } = await requireAuth();
  const userEmail = user.email;

  // Fetch profile
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  // Fetch conversations
  const { data: conversations } = await supabaseAdmin
    .from("conversations")
    .select("id, title, curriculum, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  // Fetch messages (up to 1000 most recent)
  const { data: messages } = await supabaseAdmin
    .from("messages")
    .select("id, conversation_id, role, content, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1000);

  // Fetch notes
  const { data: notes } = await supabaseAdmin
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  // Fetch study goals
  const { data: studyGoals } = await (supabaseAdmin.from as any)("study_goals")
    .select("*")
    .eq("user_id", userId);

  return {
    exportedAt: new Date().toISOString(),
    user: {
      id: userId,
      email: userEmail,
    },
    profile: profile || {},
    conversations: conversations || [],
    messagesCount: (messages || []).length,
    messages: messages || [],
    notes: notes || [],
    studyGoals: studyGoals || [],
  };
});

export const deleteAccount = createServerFn({ method: "POST" })
  .validator((raw: unknown) => {
    if (typeof raw !== "object" || raw === null || typeof (raw as any).otp !== "string") {
      throw new Error("Invalid payload");
    }
    const otp = (raw as any).otp.trim();
    if (!/^\d{4,8}$/.test(otp)) {
      throw new Error("A valid 6-digit verification code is required.");
    }
    return { otp };
  })
  .handler(async ({ data }) => {
    const { userId, user } = await requireAuth();

    const cleanOtp = data.otp;
    if (!cleanOtp) {
      throw new Error("A valid verification code is required to delete your account.");
    }

    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (roleRow?.role === "admin") {
      throw new Error("Admin accounts cannot be self-deleted. Transfer ownership first.");
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      throw new Error(error.message || "Failed to delete account. Please contact support.");
    }

    const userEmail = user.email;
    if (userEmail) {
      try {
        await sendTransactionalEmail({
          to: userEmail,
          subject: "Your GilaniAI account has been deleted",
          fromEmail: "noreply@gilaniai.site",
          html: emailTemplate({
            heading: "Account Deleted",
            body: "This confirms that your GilaniAI account and all associated data have been permanently deleted, as requested.",
            footerNote: "This is an automated confirmation. No further action is needed.",
          }),
        });
      } catch {
        /* ignore */
      }
    }
  });
