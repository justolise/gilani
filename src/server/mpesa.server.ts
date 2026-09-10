import { supabaseAdmin } from "@/server/supabase";
import { getPlanLimits, TOPUP_TOKENS_PER_KES } from "@/shared/plans";

const MPESA_BASE =
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

// ── Token cache: Safaricom tokens are valid 3600s. Cache in module scope
// to avoid a redundant OAuth round-trip on every STK push / status query.
// 60s safety margin prevents using a token about to expire mid-flight.
let _mpesaToken: { token: string; expiresAt: number } | null = null;

async function getMpesaToken(): Promise<string> {
  if (_mpesaToken && Date.now() < _mpesaToken.expiresAt - 60_000) {
    return _mpesaToken.token;
  }

  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`,
  ).toString("base64");

  const res = await fetch(`${MPESA_BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get M-Pesa token");

  // Cache for 3600s (Safaricom default), with 60s safety buffer
  _mpesaToken = { token: data.access_token, expiresAt: Date.now() + 3_600_000 };
  return data.access_token;
}

export async function initiateSTKPush(
  phone: string,
  amount: number,
  userId: string,
  plan: string,
): Promise<{ checkoutRequestId: string }> {
  // ── Pre-flight validation ─────────────────────────────────────────────────
  if (!process.env.MPESA_SHORTCODE || !process.env.MPESA_PASSKEY) {
    throw new Error("[M-Pesa] MPESA_SHORTCODE and MPESA_PASSKEY must be configured.");
  }
  if (!process.env.MPESA_CALLBACK_SECRET) {
    throw new Error("[M-Pesa] MPESA_CALLBACK_SECRET must be set to secure callbacks.");
  }

  // Validate phone: accepts 07XXXXXXXX, 01XXXXXXXX, +2547XXXXXXXX, 2547XXXXXXXX
  const phoneClean = phone.replace(/\s+/g, "");
  const validPhone = /^(0[71]\d{8}|(\+?254)[71]\d{8})$/.test(phoneClean);
  if (!validPhone) {
    throw new Error(
      `[M-Pesa] Invalid phone number format: "${phone}". Expected Kenyan format (07XXXXXXXX / 01XXXXXXXX / +2547...).`,
    );
  }

  // Amount must be a positive integer in KES (Safaricom minimum is 1)
  if (!Number.isInteger(amount) || amount < 1 || amount > 150_000) {
    throw new Error(
      `[M-Pesa] Invalid amount: ${amount}. Must be a whole KES value between 1 and 150,000.`,
    );
  }

  const token = await getMpesaToken();

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T.Z]/g, "")
    .slice(0, 14);

  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`,
  ).toString("base64");

  // Normalize phone: 0712345678 → 254712345678
  const normalized = phoneClean.startsWith("0")
    ? `254${phoneClean.slice(1)}`
    : phoneClean.startsWith("+")
      ? phoneClean.slice(1)
      : phoneClean;

  const body = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: normalized,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: normalized,
    // CS-AUTHZ-001: Embed callback secret in URL so only requests from Safaricom
    // (who received this URL) will carry the correct token.
    // FUTURE: Consider HMAC-SHA256 body-signature verification instead
    // (sign the callback body with the secret, verify in callback handler)
    // to avoid the secret appearing in server access logs.
    CallBackURL: `${process.env.APP_URL}/api/mpesa/callback?token=${encodeURIComponent(process.env.MPESA_CALLBACK_SECRET || "")}`,
    AccountReference: `GILANI_${plan.toUpperCase()}_${userId.slice(0, 8)}`,
    TransactionDesc: `Gilani AI ${plan} Plan`,
  };

  const res = await fetch(`${MPESA_BASE}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (data.ResponseCode !== "0") {
    throw new Error(data.errorMessage || data.ResponseDescription || "STK push failed");
  }

  return { checkoutRequestId: data.CheckoutRequestID };
}

export async function upgradePlan(userId: string, plan: string, receipt: string): Promise<void> {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      plan,
      plan_expiry: expiry.toISOString().split("T")[0],
      updated_at: new Date().toISOString(),
    } as any)
    .eq("id", userId);

  if (error) throw new Error(`Failed to upgrade plan: ${error.message}`);

  console.log(`[M-Pesa] User ${userId} upgraded to ${plan} via receipt ${receipt}`);
}

export async function creditTopupTokens(userId: string, amount: number): Promise<number> {
  const tokensToAdd = amount * TOPUP_TOKENS_PER_KES;

  // Atomically increment topup_tokens
  const { data, error } = await (supabaseAdmin as any)
    .rpc("increment_topup_tokens", {
      p_user_id: userId,
      p_tokens: tokensToAdd,
    })
    .single();

  if (error) throw new Error(`Failed to credit tokens: ${error.message}`);

  console.log(`[M-Pesa] Credited ${tokensToAdd} tokens to user ${userId} (KES ${amount})`);
  return tokensToAdd;
}

export async function verifyTransactionStatus(checkoutRequestId: string): Promise<boolean> {
  try {
    const token = await getMpesaToken();
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);

    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`,
    ).toString("base64");

    const body = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    const res = await fetch(`${MPESA_BASE}/mpesa/stkpushquery/v1/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return data.ResultCode === "0";
  } catch (err) {
    console.error(
      "[M-Pesa] Failed to query transaction status:",
      JSON.stringify({ error: String(err), checkoutRequestId }),
    );
    return false;
  }
}
