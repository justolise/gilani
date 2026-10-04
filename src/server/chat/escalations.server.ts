import { supabaseAdmin, sendTransactionalEmail, emailTemplate } from "@/server/index";

/**
 * Teacher Escalation & Resolution Notifications
 *
 * Dispatches in-app notifications and transactional emails when:
 * 1. A student escalates a session to a teacher (assigned or unassigned broadcast).
 * 2. A teacher answers and resolves an escalation.
 */

export interface EscalationNotificationParams {
  studentId: string;
  conversationId: string;
  reviewerId: string | null;
}

export interface ResolutionNotificationParams {
  studentId: string;
  conversationId: string;
}

/**
 * Notifies either a specific assigned teacher or all available teachers/admins
 * when a student requests review on a study session.
 */
export async function sendEscalationNotification(
  params: EscalationNotificationParams,
): Promise<void> {
  const { studentId, conversationId, reviewerId } = params;

  // 1. Fetch student display name for notification context
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("display_name")
    .eq("id", studentId)
    .maybeSingle();

  const studentName = profile?.display_name || "A student";
  const appUrl = process.env.APP_URL || "https://gilaniai.site";

  if (reviewerId) {
    // ── Targeted Notification (Specific Teacher Assigned) ──
    await (supabaseAdmin as any).from("notifications").insert({
      user_id: reviewerId,
      title: "New Escalation Assigned",
      message: "A student has requested your review on a study session.",
      type: "escalation",
      link: "/teacher/escalations",
    } as any);

    const { data: reviewerUser } = await supabaseAdmin.auth.admin.getUserById(reviewerId);
    if (reviewerUser?.user?.email) {
      await sendTransactionalEmail({
        to: reviewerUser.user.email,
        subject: "[GilaniAI] Escalation Assigned: Review Requested",
        fromEmail: "info@gilaniai.site",
        fromName: "GilaniAI",
        html: emailTemplate({
          heading: "New Escalation Assigned",
          body: `<strong>${studentName}</strong> has requested your review on their study session. Please check your escalations dashboard to respond.`,
          buttonText: "Open Escalations Dashboard",
          buttonUrl: `${appUrl}/login?signout=true&redirect=/teacher/escalations`,
          footerNote: "You are receiving this because you are registered as a teacher on GilaniAI.",
        }),
        text: `Hello Teacher,\n\n${studentName} has requested your review on their study session. You can view and reply to this escalation by visiting your dashboard:\n\n${appUrl}/teacher/escalations\n\nBest regards,\nThe GilaniAI Team`,
      });
    }
  } else {
    // ── Broadcast Notification (All Teachers / Admins) ──
    const { data: teachers } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .in("role", ["teacher", "admin"]);

    if (teachers && teachers.length > 0) {
      await (supabaseAdmin as any).from("notifications").insert(
        teachers.map((t) => ({
          user_id: t.user_id,
          title: "New Escalation Request",
          message: "A student has requested a teacher review on a study session.",
          type: "escalation",
          link: "/teacher/escalations",
        })),
      );

      const emails = await Promise.all(
        teachers.map(async (t) => {
          const { data: u } = await supabaseAdmin.auth.admin.getUserById(t.user_id);
          return u?.user?.email;
        }),
      );

      const validEmails = emails.filter((email): email is string => !!email);
      if (validEmails.length > 0) {
        await sendTransactionalEmail({
          to: validEmails,
          subject: "[GilaniAI] New Escalation Request Available",
          fromEmail: "info@gilaniai.site",
          fromName: "GilaniAI",
          html: emailTemplate({
            heading: "New Escalation Request Available",
            body: `<strong>${studentName}</strong> has requested a teacher review on their study session. Since this request is unassigned, any teacher can claim and review it.`,
            buttonText: "View Escalations",
            buttonUrl: `${appUrl}/login?signout=true&redirect=/teacher/escalations`,
            footerNote:
              "You are receiving this because you are registered as a teacher or admin on GilaniAI.",
          }),
          text: `Hello Teacher/Admin,\n\n${studentName} has requested a teacher review on their study session. Since this request is unassigned, any teacher can claim and review it:\n\n${appUrl}/teacher/escalations\n\nBest regards,\nThe GilaniAI Team`,
        });
      }
    }
  }
}

/**
 * Notifies a student via in-app notification and email when a teacher has answered
 * their escalated study session.
 */
export async function sendResolutionNotification(
  params: ResolutionNotificationParams,
): Promise<void> {
  const { studentId, conversationId } = params;
  const appUrl = process.env.APP_URL || "https://gilaniai.site";

  // 1. In-app notification
  await (supabaseAdmin as any).from("notifications").insert({
    user_id: studentId,
    title: "Teacher Responded!",
    message: "Your teacher has reviewed your study session and left a response.",
    type: "success",
    link: `/tutor/${conversationId}`,
  } as any);

  // 2. Transactional email notification
  const { data: studentUser } = await supabaseAdmin.auth.admin.getUserById(studentId);
  if (studentUser?.user?.email) {
    await sendTransactionalEmail({
      to: studentUser.user.email,
      subject: "[GilaniAI] Teacher Responded to your Study Session!",
      fromEmail: "info@gilaniai.site",
      fromName: "GilaniAI",
      html: emailTemplate({
        heading: "Your teacher has responded! 🎉",
        body: "Great news — your teacher has reviewed your study session and left a response. Click below to view their feedback and continue learning.",
        buttonText: "View Teacher's Response",
        buttonUrl: `${appUrl}/login?signout=true&redirect=/tutor/${conversationId}`,
        footerNote:
          "You are receiving this because you submitted an escalation request on GilaniAI.",
      }),
      text: `Hello student,\n\nYour teacher has reviewed your study session and left a response! Click the link below to view their response and continue learning:\n\n${appUrl}/tutor/${conversationId}\n\nBest regards,\nThe GilaniAI Team`,
    });
  }
}
