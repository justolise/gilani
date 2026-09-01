import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/server/supabase";
import { authenticateRequest } from "@/server/api-auth.server";
import { sendTransactionalEmail, emailTemplate } from "@/server/email.server";
import { z } from "zod";

export const listTeacherEscalations = createServerFn({ method: "POST" }).handler(async () => {
  const request = getRequest();
  let authResult;
  try {
    authResult = await authenticateRequest(request);
  } catch (err) {
    throw new Error(err instanceof Response ? (await err.json()).error : "Unauthorized", {
      cause: err,
    });
  }
  const userId = authResult.userId;

  const { data: roleCheck, error: roleError } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["teacher", "admin"])
    .single();

  if (roleError || !roleCheck) throw new Error("Forbidden: Teacher access required");

  const { data: escalationsData, error } = await supabaseAdmin
    .from("escalations")
    .select("*")
    .eq("reviewer_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const userIds = [...new Set((escalationsData ?? []).map((e: any) => e.user_id).filter(Boolean))];
  let profileMap: Record<string, { display_name: string | null; avatar_url: string | null }> = {};
  if (userIds.length > 0) {
    const { data: pd } = await supabaseAdmin
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", userIds);
    profileMap = Object.fromEntries(
      (pd ?? []).map((p: any) => [
        p.id,
        { display_name: p.display_name, avatar_url: p.avatar_url },
      ]),
    );
  }

  return (escalationsData ?? []).map((e: any) => ({
    ...e,
    student_name: profileMap[e.user_id]?.display_name || "Student",
    student_avatar: profileMap[e.user_id]?.avatar_url || null,
  })) as any[];
});

export const resolveTeacherEscalation = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), expertAnswer: z.string() }))
  .handler(async ({ data }) => {
    const request = getRequest();
    let authResult;
    try {
      authResult = await authenticateRequest(request);
    } catch (err) {
      throw new Error(err instanceof Response ? (await err.json()).error : "Unauthorized", {
        cause: err,
      });
    }
    const userId = authResult.userId;
    const { id, expertAnswer } = data;

    const { data: roleCheck } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["teacher", "admin"])
      .single();

    if (!roleCheck) throw new Error("Forbidden: Teacher access required");

    const { data: esc, error: escErr } = await supabaseAdmin
      .from("escalations")
      .select("conversation_id, user_id, reviewer_id")
      .eq("id", id)
      .single();
    if (escErr) throw new Error(escErr.message);
    const isAdmin = roleCheck.role === "admin";
    if (!isAdmin && esc.reviewer_id !== userId)
      throw new Error("Forbidden: You are not assigned to this escalation");

    const { error } = await supabaseAdmin
      .from("escalations")
      .update({ status: "resolved", detail: expertAnswer } as any)
      .eq("id", id);
    if (error) throw new Error(error.message);

    if (esc?.user_id) {
      try {
        const { data: studentUser } = await supabaseAdmin.auth.admin.getUserById(esc.user_id);
        const studentEmail = studentUser?.user?.email;
        const { data: studentProfile } = await supabaseAdmin
          .from("profiles")
          .select("display_name")
          .eq("id", esc.user_id)
          .single();
        const studentName = studentProfile?.display_name || "Student";
        const appUrl = process.env.APP_URL || "https://gilaniai.site";
        if (studentEmail) {
          await sendTransactionalEmail({
            to: studentEmail,
            subject: "Your teacher has reviewed your study session 📚",
            fromEmail: "noreply@gilaniai.site",
            html: emailTemplate({
              heading: `Hi ${studentName}, your teacher has responded!`,
              body: `Your escalated study session has been reviewed by a teacher. Their response has been added to your conversation. Log in to GilaniAI to continue learning.`,
              buttonText: "View Response",
              buttonUrl: `${appUrl}/login?redirect=/tutor/${esc.conversation_id}`,
              footerNote:
                "You are receiving this because you requested a teacher review on GilaniAI.",
            }),
          }).catch((err: any) => console.error("[Student Email] Failed:", err));
        }
      } catch (err) {
        console.error("[Student Notify] Failed to send student email:", err);
      }
    }

    if (esc?.conversation_id) {
      try {
        const { data: teacherProfile } = await supabaseAdmin
          .from("profiles")
          .select("display_name")
          .eq("id", userId)
          .single();
        const teacherName = teacherProfile?.display_name || "Your Teacher";
        const teacherMessageContent = `**Teacher Review** (${teacherName}):\n\n${expertAnswer}`;
        await supabaseAdmin.from("messages").insert({
          conversation_id: esc.conversation_id,
          role: "assistant",
          content: teacherMessageContent,
          user_id: esc.user_id,
          parts: JSON.stringify([{ type: "text", text: teacherMessageContent }]),
        } as any);
      } catch (err) {
        console.error("[Teacher Message] Failed to inject message into conversation:", err);
      }
    }
  });

export const saveEscalationDraft = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), draftAnswer: z.string() }))
  .handler(async ({ data }) => {
    const request = getRequest();
    let authResult;
    try {
      authResult = await authenticateRequest(request);
    } catch (err) {
      throw new Error(err instanceof Response ? (await err.json()).error : "Unauthorized", {
        cause: err,
      });
    }
    const userId = authResult.userId;
    const { id, draftAnswer } = data;

    const { data: roleCheck } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["teacher", "admin"])
      .single();

    if (!roleCheck) throw new Error("Forbidden: Teacher access required");

    const { data: esc, error: escErr } = await supabaseAdmin
      .from("escalations")
      .select("reviewer_id")
      .eq("id", id)
      .single();
    if (escErr) throw new Error(escErr.message);
    const isAdmin = roleCheck.role === "admin";
    if (!isAdmin && esc.reviewer_id !== userId)
      throw new Error("Forbidden: You are not assigned to this escalation");

    const { error } = await supabaseAdmin
      .from("escalations")
      .update({ draft_answer: draftAnswer, draft_updated_at: new Date().toISOString() } as any)
      .eq("id", id);
    if (error) throw new Error(error.message);
  });

export const getConversationMessages = createServerFn({ method: "POST" })
  .validator(z.object({ conversationId: z.string() }))
  .handler(async ({ data }) => {
    const request = getRequest();
    let authResult;
    try {
      authResult = await authenticateRequest(request);
    } catch (err) {
      throw new Error(err instanceof Response ? (await err.json()).error : "Unauthorized", {
        cause: err,
      });
    }
    const userId = authResult.userId;
    const { conversationId } = data;

    const { data: roleCheck } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["teacher", "admin"])
      .single();

    if (!roleCheck) throw new Error("Forbidden: Teacher access required");

    const isAdmin = roleCheck.role === "admin";
    if (!isAdmin) {
      const { data: escCheck } = await supabaseAdmin
        .from("escalations")
        .select("id")
        .eq("conversation_id", conversationId)
        .eq("reviewer_id", userId)
        .single();
      if (!escCheck) throw new Error("Forbidden: You are not assigned to this conversation");
    }

    const { data: messages, error } = await supabaseAdmin
      .from("messages")
      .select("role, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return messages ?? [];
  });
