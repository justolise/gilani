import { emailTemplate, escapeHtml, BRAND_ORANGE, APP_URL } from "./base.server";

// ─── Verify Email ────────────────────────────────────────────────────────────

export function verifyEmailTemplate({
  userName,
  verifyUrl,
}: {
  userName: string;
  verifyUrl: string;
}): string {
  const name = escapeHtml(userName || "there");
  return emailTemplate({
    heading: `Verify your email, ${name}`,
    body: `
      <p style="margin:0;text-align:center;color:#9ca3af">
        You're already signed in — this is just to confirm this email address belongs to you, so we can keep your account secure.
      </p>
    `,
    buttonText: "Verify email",
    buttonUrl: verifyUrl,
    footerNote: "If you didn't create a GilaniAI account, you can safely ignore this email.",
  });
}

// ─── Welcome Email ───────────────────────────────────────────────────────────

export function welcomeEmail({
  userName,
  dashboardUrl,
}: {
  userName: string;
  role?: string;
  dashboardUrl: string;
}): string {
  const name = escapeHtml(userName || "there");

  const featureCard = (
    emoji: string,
    title: string,
    description: string,
    linkText: string,
    linkUrl: string,
  ) => `
    <tr>
      <td style="padding-bottom:12px">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background:#0f1117;border:1px solid #2a2d3a;border-radius:10px;padding:16px 18px">
              <p style="margin:0 0 4px;font-size:18px">${emoji}</p>
              <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#f9fafb">${escapeHtml(title)}</p>
              <p style="margin:0 0 10px;font-size:13px;color:#9ca3af;line-height:1.5">${escapeHtml(description)}</p>
              <a href="${encodeURI(linkUrl)}" style="font-size:12px;color:${BRAND_ORANGE};text-decoration:none;font-weight:600">${escapeHtml(linkText)} →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return emailTemplate({
    heading: `Welcome to GilaniAI, ${name} 👋`,
    body: `
      <p style="margin:0 0 20px;text-align:center;color:#9ca3af;font-size:15px;line-height:1.7">
        You just joined something different. Not a search engine.
        Not a chatbot. An AI built to actually <strong style="color:#f9fafb">understand how you learn</strong>
        — and meet you there.
      </p>

      <p style="margin:0 0 24px;text-align:center;font-size:13px;color:#6b7280">
        Here are three things most students discover on day one:
      </p>

      <!-- Feature discovery cards -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px">
        ${featureCard(
          "🧠",
          "It understands your notes",
          "Upload your class notes, textbook pages, or past papers — then ask anything. GilaniAI reads them so you don't have to start from scratch.",
          "Try uploading a document",
          `${APP_URL}/tutor`,
        )}
        ${featureCard(
          "💬",
          "Ask the question you were afraid to ask in class",
          "No judgment. No rushing. Just clear, patient explanations — at 2 AM if that's when you study best.",
          "Start your first conversation",
          `${APP_URL}/tutor`,
        )}
        ${featureCard(
          "📊",
          "Know exactly where you stand",
          "GilaniAI tracks what you've covered, what you've struggled with, and builds a picture of your learning — so your next session is smarter.",
          "See your study dashboard",
          `${APP_URL}/tutor`,
        )}
      </table>

      <p style="margin:20px 0 0;text-align:center;font-size:13px;color:#6b7280;line-height:1.6">
        Thousands of students are already using GilaniAI to prepare for their exams.<br>
        <strong style="color:#f9fafb">Your first session starts the moment you say hello.</strong>
      </p>
    `,
    buttonText: "Say Hello to Your AI Tutor →",
    buttonUrl: dashboardUrl,
    footerNote:
      "You're receiving this because you just joined GilaniAI. Questions? Reply to this email — we actually read them.",
  });
}

// ─── Password Reset Confirmation Email ───────────────────────────────────────

/**
 * Sent AFTER a successful password reset to confirm it was intentional.
 * Includes a "Not you? Secure your account" CTA.
 */
export function passwordResetConfirmationEmail(userName?: string): string {
  const name = userName ? escapeHtml(userName) : "there";
  const resetUrl = `${APP_URL}/forgot-password`;

  return emailTemplate({
    heading: "Password Changed",
    body: `
      <!-- Icon -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px">
        <tr>
          <td align="center">
            <div style="width:48px;height:48px;background:#16a34a1a;border-radius:50%;display:inline-block;text-align:center;line-height:48px;font-size:22px">
              ✅
            </div>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 16px;text-align:center">Hi <strong>${name}</strong>,</p>
      <p style="margin:0 0 28px;text-align:center;line-height:1.6">The password for your GilaniAI account was successfully updated.</p>

      <!-- Summary card -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px">
        <tr>
          <td style="background:#0f1117;border:1px solid #2a2d3a;border-radius:10px;padding:16px 18px">
            <p style="margin:0 0 6px;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;font-weight:600">What changed</p>
            <p style="margin:0 0 4px;font-size:14px;color:#f9fafb;font-weight:600">Account password updated</p>
            <p style="margin:0;font-size:11px;color:#6b7280">If this was you, no further action is needed.</p>
          </td>
        </tr>
      </table>

      <!-- Warning box -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:#1e1a0e;border:1px solid #3d2e00;border-radius:8px;padding:14px 16px">
            <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#f59e0b">
              ⚠️ Didn't make this change?
            </p>
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5">
              Your account may be compromised. Reset your password immediately and contact us at
              <a href="${resetUrl}" style="color:${BRAND_ORANGE};text-decoration:none">Reset Password</a> or reply to this email.
            </p>
          </td>
        </tr>
      </table>
    `,
    buttonText: "Sign In to Your Account",
    buttonUrl: `${APP_URL}/login`,
    footerNote: "You received this because your GilaniAI account password was recently changed.",
  });
}
