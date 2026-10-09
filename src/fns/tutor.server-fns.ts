import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin, requireAuth, requireTeacherOrAdmin } from "@/server/index";
import { generateSessionTitle } from "@/server/chat/title.server";
import {
  sendEscalationNotification,
  sendResolutionNotification,
} from "@/server/chat/escalations.server";

/**
 * Tutor & Study Session Server Functions
 *
 * Exposes RPC endpoints for:
 * 1. Thread & Session Management (delete, rename, AI title generation)
 * 2. Teacher Escalation & Review (lookup, create, notifications)
 */

// ============================================================================
// 1. Thread & Session Management
// ============================================================================

/**
 * Delete a study session thread.
 * Only the student who created the thread can delete it.
 */
export const deleteThreadFn = createServerFn({ method: "POST" })
  .validator(z.object({ threadId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { userId } = await requireAuth();

    const { error } = await supabaseAdmin
      .from("conversations")
      .delete()
      .eq("id", data.threadId)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  });

/**
 * Rename a study session thread.
 * Uses upsert to accommodate the race condition where renaming completes
 * before the first chat message row is committed.
 */
export const renameThreadFn = createServerFn({ method: "POST" })
  .validator(z.object({ threadId: z.string().uuid(), title: z.string().trim().min(1).max(120) }))
  .handler(async ({ data }) => {
    const { userId } = await requireAuth();

    const { data: existing } = await supabaseAdmin
      .from("conversations")
      .select("id, user_id")
      .eq("id", data.threadId)
      .maybeSingle();

    if (existing) {
      if (existing.user_id !== userId) {
        throw new Error("Forbidden: You do not own this conversation");
      }
      const { error } = await supabaseAdmin
        .from("conversations")
        .update({ title: data.title, updated_at: new Date().toISOString() })
        .eq("id", data.threadId)
        .eq("user_id", userId);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin.from("conversations").insert({
        id: data.threadId,
        user_id: userId,
        title: data.title,
      });
      if (error) throw error;
    }

    return { success: true };
  });

/**
 * Generate a short 3-5 word topic title from the student's initial question.
 * Optionally saves the generated title to the conversation record in the database.
 */
export const generateThreadTitleFn = createServerFn({ method: "POST" })
  .validator(
    z.union([
      z.object({
        threadId: z.string().uuid().optional(),
        text: z.string().max(1000),
      }),
      z.string().max(1000),
    ]),
  )
  .handler(async ({ data }) => {
    const threadId = typeof data === "object" ? data.threadId : undefined;
    const firstMessage = typeof data === "object" ? data.text : data;

    let authUserId: string | null = null;
    try {
      const auth = await requireAuth();
      authUserId = auth.userId;
    } catch {
      // Allow title generation without failing unauthenticated preview sessions
    }

    const title = await generateSessionTitle(firstMessage);

    // Save directly to the database if threadId and authenticated user exist
    if (threadId && authUserId) {
      try {
        const { data: existing } = await supabaseAdmin
          .from("conversations")
          .select("id, user_id")
          .eq("id", threadId)
          .maybeSingle();

        if (existing) {
          if (existing.user_id === authUserId) {
            await supabaseAdmin
              .from("conversations")
              .update({ title, updated_at: new Date().toISOString() })
              .eq("id", threadId)
              .eq("user_id", authUserId);
          }
        } else {
          await supabaseAdmin.from("conversations").insert({
            id: threadId,
            user_id: authUserId,
            title,
          });
        }
      } catch (dbErr) {
        console.error("[Title Gen] Failed to persist title:", dbErr);
      }
    }

    return title;
  });

// ============================================================================
// 2. Teacher Escalations & Reviews
// ============================================================================

/**
 * Look up a teacher or admin user by their email address.
 * Used when a student wants to assign an escalation directly to their specific teacher.
 */
export const lookupTeacherByEmail = createServerFn({ method: "POST" })
  .validator(z.string().email())
  .handler(async ({ data: email }) => {
    await requireAuth();

    // 1. Find profile by email
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !profile) {
      throw new Error("No teacher found with that email address.");
    }

    // 2. Verify user has teacher or admin role
    const { data: roleCheck } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", profile.id)
      .in("role", ["teacher", "admin"])
      .maybeSingle();

    if (!roleCheck) {
      throw new Error("No teacher found with that email address.");
    }

    return { id: profile.id };
  });

/**
 * Request teacher review for an existing study session (creates an escalation record).
 * Returns { alreadyOpen: true } if an open escalation already exists for this thread.
 */
export const createEscalationFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      conversationId: z.string().uuid(),
      reason: z.string().default("student_request"),
      detail: z.string().default("Student manually requested teacher review."),
      reviewerId: z.string().uuid().nullable(),
    }),
  )
  .handler(async ({ data }) => {
    const { userId } = await requireAuth();

    // Prevent duplicate open escalations for the same conversation
    const { data: existing } = await supabaseAdmin
      .from("escalations")
      .select("id")
      .eq("conversation_id", data.conversationId)
      .eq("status", "open")
      .maybeSingle();

    if (existing) {
      return { alreadyOpen: true };
    }

    const { error } = await supabaseAdmin.from("escalations").insert({
      conversation_id: data.conversationId,
      user_id: userId,
      reason: data.reason,
      status: "open",
      detail: data.detail,
      reviewer_id: data.reviewerId,
    });

    if (error) throw error;
    return { alreadyOpen: false };
  });

/**
 * Send in-app and email notifications when a new escalation is created.
 */
export const createEscalationNotification = createServerFn({ method: "POST" })
  .validator(
    z.object({
      conversationId: z.string().uuid(),
      reviewerId: z.string().uuid().nullable(),
    }),
  )
  .handler(async ({ data }) => {
    const { userId: studentId } = await requireAuth();
    await sendEscalationNotification({
      studentId,
      conversationId: data.conversationId,
      reviewerId: data.reviewerId,
    });
    return { success: true };
  });

/**
 * Send in-app and email notifications to the student when their escalation has been resolved.
 * Must be called by an authenticated teacher or admin.
 */
export const createResolutionNotification = createServerFn({ method: "POST" })
  .validator(
    z.object({
      studentId: z.string().uuid(),
      conversationId: z.string().uuid(),
    }),
  )
  .handler(async ({ data }) => {
    await requireTeacherOrAdmin();
    await sendResolutionNotification({
      studentId: data.studentId,
      conversationId: data.conversationId,
    });
    return { success: true };
  });
