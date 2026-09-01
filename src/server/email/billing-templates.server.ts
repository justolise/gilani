import { emailTemplate, escapeHtml, BRAND_ORANGE, APP_URL } from "./base.server";

// ─── M-Pesa Payment Receipt Email ────────────────────────────────────────────

export function mpesaReceiptEmail({
  userName,
  planLabel,
  planDescription,
  amount,
  mpesaReceipt,
  phone,
  expiryDate,
}: {
  userName: string;
  planLabel: string;
  planDescription: string;
  amount: number;
  mpesaReceipt: string;
  phone: string;
  expiryDate: string;
}): string {
  const name = escapeHtml(userName || "there");
  const now = new Date().toLocaleString("en-KE", {
    timeZone: "Africa/Nairobi",
    dateStyle: "long",
    timeStyle: "short",
  });

  return emailTemplate({
    heading: "Payment Confirmed",
    body: `
      <p style="margin:0 0 16px">Hi <strong>${name}</strong>,</p>
      <p style="margin:0 0 20px">
        Your M-Pesa payment was received and your GilaniAI account has been upgraded.
        You now have full access to the <strong>${escapeHtml(planLabel)}</strong>.
      </p>

      <!-- Receipt card -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px">
        <tr>
          <td style="background:#0f1117;border:1px solid #2a2d3a;border-radius:10px;padding:20px 24px">

            <p style="margin:0 0 16px;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;font-weight:600">
              Official Receipt
            </p>

            <!-- Receipt rows -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:12px;color:#6b7280;padding-bottom:10px;width:140px">Receipt No.</td>
                <td style="font-size:13px;color:#f9fafb;font-weight:700;padding-bottom:10px;font-family:monospace,monospace">${escapeHtml(mpesaReceipt)}</td>
              </tr>
              <tr>
                <td style="font-size:12px;color:#6b7280;padding-bottom:10px">Plan</td>
                <td style="font-size:13px;color:#f9fafb;font-weight:600;padding-bottom:10px">${escapeHtml(planLabel)}</td>
              </tr>
              <tr>
                <td style="font-size:12px;color:#6b7280;padding-bottom:10px">Includes</td>
                <td style="font-size:13px;color:#9ca3af;padding-bottom:10px">${escapeHtml(planDescription)}</td>
              </tr>
              <tr>
                <td style="font-size:12px;color:#6b7280;padding-bottom:10px">Phone</td>
                <td style="font-size:13px;color:#9ca3af;padding-bottom:10px">${escapeHtml(phone)}</td>
              </tr>
              <tr>
                <td style="font-size:12px;color:#6b7280;padding-bottom:10px">Date</td>
                <td style="font-size:13px;color:#9ca3af;padding-bottom:10px">${escapeHtml(now)} (EAT)</td>
              </tr>
              <tr>
                <td style="font-size:12px;color:#6b7280;padding-bottom:10px">Valid Until</td>
                <td style="font-size:13px;color:#9ca3af;padding-bottom:10px">${escapeHtml(expiryDate)}</td>
              </tr>

              <!-- Divider -->
              <tr><td colspan="2" style="border-top:1px solid #2a2d3a;padding:8px 0"></td></tr>

              <!-- Amount row -->
              <tr>
                <td style="font-size:13px;color:#f9fafb;font-weight:700;padding-top:4px">Total Paid</td>
                <td style="font-size:20px;color:${BRAND_ORANGE};font-weight:800;font-family:Georgia,serif;padding-top:4px">
                  KES ${amount.toLocaleString("en-KE")}
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>

      <p style="margin:0 0 8px;font-size:13px;color:#6b7280">
        Keep this email as your proof of payment. Your plan renews manually — you will receive
        a reminder before expiry.
      </p>
      <p style="margin:0;font-size:13px;color:#6b7280">
        Questions? Email us at
        <a href="mailto:support@gilaniai.site" style="color:${BRAND_ORANGE}">support@gilaniai.site</a>.
      </p>
    `,
    buttonText: "Return to GilaniAI",
    buttonUrl: `${APP_URL}/tutor`,
    footerNote:
      "You received this receipt because a payment was successfully processed on your GilaniAI account. Please retain it for your records.",
  });
}
