/**
 * Base email layout, design tokens, and Resend delivery logic.
 */

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  fromName?: string;
  /** Override the default from-address (noreply@gilaniai.site) */
  fromEmail?: string;
  /** Set Reply-To header so recipients can reply directly to the original sender */
  replyTo?: string;
}

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
  fromName = "GilaniAI",
  fromEmail = "noreply@gilaniai.site",
  replyTo,
}: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("[Email] RESEND_API_KEY is not set");
    return false;
  }

  const recipients = Array.isArray(to) ? to : [to];

  const body: Record<string, unknown> = {
    from: `${fromName} <${fromEmail}>`,
    to: recipients,
    subject,
    html,
    ...(text ? { text } : {}),
    ...(replyTo ? { reply_to: replyTo } : {}),
  };

  const MAX_ATTEMPTS = 3;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error("[Email] Resend error:", response.status, response.statusText, err);
        return false; // API-level error — retrying won't help
      }

      console.log("[Email] Successfully sent to:", recipients.join(", "));
      return true;
    } catch (err) {
      const isLastAttempt = attempt === MAX_ATTEMPTS;
      console.error(
        `[Email] Send attempt ${attempt}/${MAX_ATTEMPTS} failed:`,
        err instanceof Error ? err.message : err,
      );
      if (isLastAttempt) return false;
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }
  return false;
}

// ─── Helpers & Design Tokens ──────────────────────────────────────────────────

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const BRAND_ORANGE = "#d9531e";
export const BG_PAGE = "#0f1117";
export const BG_CARD = "#1a1d27";
export const BORDER = "#2a2d3a";
export const TEXT_BODY = "#9ca3af";
export const TEXT_HEADING = "#f9fafb";
export const APP_URL = process.env.APP_URL || "https://gilaniai.site";

export function emailHeader(): string {
  return `
  <!-- Logo / Brand -->
  <tr>
    <td align="center" style="padding-bottom:32px">
      <a href="${APP_URL}" style="text-decoration:none;display:inline-block">
        <p style="margin:0;font-size:22px;font-weight:800;color:${BRAND_ORANGE};letter-spacing:-0.5px;font-family:Georgia,serif">
          GilaniAI
        </p>
      </a>
      <p style="margin:4px 0 0;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.15em;font-weight:600">
        Ethical Learning
      </p>
    </td>
  </tr>`;
}

export function emailFooter(footerNote?: string): string {
  return `
  <!-- Footer -->
  <tr>
    <td style="padding-top:28px">
      ${footerNote ? `<p style="margin:0 0 4px;font-size:11px;color:#4b5563;text-align:center">${escapeHtml(footerNote)}</p>` : ""}
      <p style="margin:0;font-size:11px;color:#4b5563;text-align:center">
        &copy; ${new Date().getFullYear()} GilaniAI &middot; Nairobi, Kenya &middot;
        <a href="${APP_URL}/privacy" style="color:#6b7280;text-decoration:none">Privacy</a> &middot;
        <a href="${APP_URL}/contact" style="color:#6b7280;text-decoration:none">Contact</a>
      </p>
    </td>
  </tr>`;
}

export function emailTemplate({
  heading,
  body,
  buttonText,
  buttonUrl,
  footerNote,
  alertBanner,
}: {
  heading?: string;
  body: string;
  buttonText?: string;
  buttonUrl?: string;
  footerNote?: string;
  /** Optional top-of-card coloured alert strip e.g. "⚠️ Security Notice" */
  alertBanner?: { text: string; color?: string };
}): string {
  const safeButtonUrl = buttonUrl ? encodeURI(buttonUrl) : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${heading ? escapeHtml(heading) : "GilaniAI"}</title>
</head>
<body style="margin:0;padding:0;background-color:${BG_PAGE};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BG_PAGE};padding:40px 16px">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px">

          ${emailHeader()}

          <!-- Card -->
          <tr>
            <td style="background:${BG_CARD};border:1px solid ${BORDER};border-radius:16px;padding:36px 32px">

              ${
                alertBanner
                  ? `
              <!-- Alert banner -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px">
                <tr>
                  <td style="background:#1e1a0e;border:1px solid #3d2e00;border-radius:8px;padding:14px 16px;font-size:12px;color:#f59e0b;line-height:1.5">
                    ${escapeHtml(alertBanner.text)}
                  </td>
                </tr>
              </table>`
                  : ""
              }

              ${
                heading
                  ? `
              <!-- Heading -->
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:${TEXT_HEADING};text-align:center;font-family:Georgia,serif">
                ${escapeHtml(heading)}
              </p>`
                  : ""
              }

              <!-- Body content -->
              <div style="margin:0 0 28px;font-size:14px;color:${TEXT_BODY};line-height:1.6">
                ${body}
              </div>

              ${
                buttonText && safeButtonUrl
                  ? `
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px">
                <tr>
                  <td align="center">
                    <a href="${safeButtonUrl}"
                       style="display:inline-block;background:${BRAND_ORANGE};color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:10px;letter-spacing:0.02em">
                      ${escapeHtml(buttonText)}
                    </a>
                  </td>
                </tr>
              </table>
              <!-- Fallback URL -->
              <p style="margin:10px 0 0;font-size:11px;color:#6b7280;text-align:center">
                Button not working? Copy this link:<br>
                <a href="${safeButtonUrl}" style="color:${BRAND_ORANGE};word-break:break-all">${safeButtonUrl}</a>
              </p>`
                  : ""
              }

            </td>
          </tr>

          ${emailFooter(footerNote)}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
