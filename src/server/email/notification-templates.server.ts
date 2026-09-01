import {
  emailTemplate,
  escapeHtml,
  BRAND_ORANGE,
  BG_CARD,
  BORDER,
  TEXT_BODY,
  TEXT_HEADING,
  APP_URL,
} from "./base.server";

// ─── Teacher Reply Email ─────────────────────────────────────────────────────

export function teacherReplyEmailTemplate({
  studentName,
  teacherName,
  threadTitle,
  previewText,
  threadUrl,
}: {
  studentName: string;
  teacherName: string;
  threadTitle: string;
  previewText: string;
  threadUrl: string;
}): string {
  return emailTemplate({
    heading: "A teacher replied to your question",
    body: `
      <p style="margin:0 0 16px">Hi <strong>${escapeHtml(studentName)}</strong>,</p>
      <p style="margin:0 0 16px">
        <strong>${escapeHtml(teacherName)}</strong> has replied to your question 
        "<em>${escapeHtml(threadTitle)}</em>":
      </p>
      <blockquote style="margin:0 0 20px;padding:12px 16px;border-left:3px solid ${BRAND_ORANGE};background:${BG_CARD};border-radius:0 8px 8px 0;font-size:13px;color:${TEXT_HEADING};line-height:1.6">
        ${escapeHtml(previewText)}
      </blockquote>
      <p style="margin:0 0 4px;font-size:13px;color:${TEXT_BODY}">
        Log in to continue the conversation and mark it as resolved.
      </p>
    `,
    buttonText: "View Reply →",
    buttonUrl: threadUrl,
    footerNote:
      "You are receiving this because email notifications are enabled. You can turn them off in Settings.",
  });
}

// ─── Study Reminder Email ─────────────────────────────────────────────────────

export function studyReminderEmailTemplate({
  studentName,
  lastStudied,
}: {
  studentName: string;
  lastStudied: string;
}): string {
  return emailTemplate({
    heading: "Your studies are waiting! 📚",
    body: `
      <p style="margin:0 0 16px">Hi <strong>${escapeHtml(studentName)}</strong>,</p>
      <p style="margin:0 0 16px">
        You haven't studied in a while — your last session was <strong>${escapeHtml(lastStudied)}</strong>.
      </p>
      <p style="margin:0 0 20px;font-size:13px;color:${TEXT_BODY}">
        Consistency is the key to exam success. Even 15 minutes today will keep
        the momentum going. Your AI tutor is ready when you are! 🎯
      </p>
    `,
    buttonText: "Continue Studying →",
    buttonUrl: `${APP_URL}/tutor`,
    footerNote:
      "You are receiving this because push reminders are enabled. Turn off in Settings → Notifications.",
  });
}

// ─── Weekly Digest Email ─────────────────────────────────────────────────────

export function weeklyDigestEmailTemplate({
  studentName,
  weekOf,
  stats,
}: {
  studentName: string;
  weekOf: string;
  stats: {
    messagesCount: number;
    topicsCount: number;
    quizzesCount: number;
    notesCount: number;
    streak: number;
  };
}): string {
  const { messagesCount, topicsCount, quizzesCount, notesCount, streak } = stats;

  const statRow = (icon: string, label: string, value: string) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${BORDER}">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font-size:20px;width:32px">${icon}</td>
            <td style="font-size:13px;color:${TEXT_BODY}">${label}</td>
            <td align="right" style="font-size:15px;font-weight:700;color:${TEXT_HEADING}">${value}</td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  const streakBadge =
    streak >= 5
      ? `<p style="margin:16px 0 0;font-size:12px;font-weight:700;color:#f59e0b;text-align:center;letter-spacing:0.05em">
           🔥 ${streak}-day study streak! Keep it up!
         </p>`
      : "";

  return emailTemplate({
    heading: `Your weekly study digest`,
    body: `
      <p style="margin:0 0 4px;font-size:12px;text-align:center;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em">
        Week of ${escapeHtml(weekOf)}
      </p>
      <p style="margin:0 0 20px;text-align:center">Hi <strong>${escapeHtml(studentName)}</strong>, here's how your week went!</p>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px">
        ${statRow("💬", "Questions asked", String(messagesCount))}
        ${statRow("📖", "Topics explored", String(topicsCount))}
        ${statRow("🧪", "Quizzes completed", String(quizzesCount))}
        ${statRow("📝", "Notes saved", String(notesCount))}
      </table>
      ${streakBadge}

      <p style="margin:20px 0 4px;font-size:13px;color:${TEXT_BODY};text-align:center">
        Ready to make this week even better?
      </p>
    `,
    buttonText: "Start Studying →",
    buttonUrl: `${APP_URL}/tutor`,
    footerNote:
      "You are receiving this weekly digest because it is enabled in your notification preferences.",
  });
}
