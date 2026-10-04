import { createServerFn } from "@tanstack/react-start";
import {
  supabaseAdmin,
  requireTeacherOrAdmin,
  sendTransactionalEmail,
  emailTemplate,
} from "@/server/index";
import { z } from "zod";

export const listTeacherEscalations = createServerFn({ method: "POST" }).handler(async () => {
  const { userId } = await requireTeacherOrAdmin();

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
    const { userId } = await requireTeacherOrAdmin();
    const { id, expertAnswer } = data;

    const { data: esc, error: escErr } = await supabaseAdmin
      .from("escalations")
      .select("conversation_id, user_id, reviewer_id")
      .eq("id", id)
      .single();
    if (escErr) throw new Error(escErr.message);

    const { error } = await supabaseAdmin
      .from("escalations")
      .update({
        expert_answer: expertAnswer,
        status: "resolved",
        resolved_at: new Date().toISOString(),
      } as any)
      .eq("id", id);
    if (error) throw new Error(error.message);

    const { data: studentUser } = await supabaseAdmin.auth.admin.getUserById(esc.user_id);
    const studentEmail = studentUser?.user?.email;

    if (studentEmail) {
      try {
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
              buttonUrl: `${appUrl}/login?signout=true&redirect=/tutor/${esc.conversation_id}`,
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
        const teacherName = teacherProfile?.display_name || "Teacher";

        await supabaseAdmin.from("messages").insert({
          conversation_id: esc.conversation_id,
          role: "assistant",
          content: `**Teacher Review** (${teacherName}):\n\n${expertAnswer}`,
          parts: JSON.stringify([
            {
              type: "text",
              text: `**Teacher Review** (${teacherName}):\n\n${expertAnswer}`,
            },
          ]),
          user_id: esc.user_id,
        } as any);
      } catch (msgErr) {
        console.error("[Teacher Message Insert] Failed:", msgErr);
      }
    }

    return { success: true };
  });

export const saveEscalationDraft = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), draftAnswer: z.string() }))
  .handler(async ({ data }) => {
    const { userId, role } = await requireTeacherOrAdmin();
    const { id, draftAnswer } = data;

    const { data: esc, error: escErr } = await supabaseAdmin
      .from("escalations")
      .select("reviewer_id")
      .eq("id", id)
      .single();
    if (escErr) throw new Error(escErr.message);

    const isAdmin = role === "admin";
    if (!isAdmin && esc.reviewer_id !== userId) {
      throw new Error("Forbidden: You are not assigned to this escalation");
    }

    const { error } = await supabaseAdmin
      .from("escalations")
      .update({ draft_answer: draftAnswer, draft_updated_at: new Date().toISOString() } as any)
      .eq("id", id);
    if (error) throw new Error(error.message);
  });

export const getConversationMessages = createServerFn({ method: "POST" })
  .validator(z.object({ conversationId: z.string() }))
  .handler(async ({ data }) => {
    const { userId, role } = await requireTeacherOrAdmin();
    const { conversationId } = data;

    const isAdmin = role === "admin";
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
