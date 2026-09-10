import { createFileRoute } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/server/supabase";
import { upgradePlan, creditTopupTokens, verifyTransactionStatus } from "@/server/mpesa.server";
import { z } from "zod";
import { sendTransactionalEmail, mpesaReceiptEmail } from "@/server/email.server";
import { sendSMS } from "@/server/sms.server";
import { log } from "@/server/logger";

import crypto from "node:crypto";

export const Route = createFileRoute("/api/mpesa/callback")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const request = getRequest();

          // CS-AUTHZ-001: Verify the shared callback secret using constant-time comparison
          const url = new URL(request.url);
          const providedToken = url.searchParams.get("token") || "";
          const expectedToken = process.env.MPESA_CALLBACK_SECRET || "";

          if (
            !expectedToken ||
            providedToken.length !== expectedToken.length ||
            !crypto.timingSafeEqual(Buffer.from(providedToken), Buffer.from(expectedToken))
          ) {
            log.warn("[mpesa_callback] rejected_invalid_token", {
              ip: request.headers.get("cf-connecting-ip") ?? "",
            });
            return new Response(JSON.stringify({ ResultCode: 0 }), { status: 200 });
          }

          // Verify Safaricom IP only when using real M-Pesa (MPESA_ENV=production).
          // In sandbox mode we allow curl/manual callbacks for testing on the live app.
          const clientIp =
            request.headers.get("cf-connecting-ip") ||
            request.headers.get("x-real-ip") ||
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            "";
          if (process.env.MPESA_ENV === "production" && clientIp) {
            const isMpesaIp = /^196\.201\.(212|213|214)\.\d{1,3}$/.test(clientIp);
            if (!isMpesaIp) {
              log.warn("[mpesa_callback] rejected_unauthorized_ip", { clientIp });
              return new Response(JSON.stringify({ ResultCode: 1 }), { status: 403 });
            }
          }

          const callbackSchema = z.object({
            Body: z
              .object({
                stkCallback: z.object({
                  CheckoutRequestID: z.string(),
                  ResultCode: z.number(),
                  CallbackMetadata: z
                    .object({
                      Item: z.array(
                        z.object({
                          Name: z.string(),
                          Value: z.any().optional(),
                        }),
                      ),
                    })
                    .optional(),
                }),
              })
              .optional(),
          });

          const rawBody = await request.json().catch(() => ({}));
          const parseResult = callbackSchema.safeParse(rawBody);

          if (!parseResult.success || !parseResult.data.Body?.stkCallback) {
            console.error(
              "[M-Pesa Callback] Invalid payload shape",
              JSON.stringify(parseResult.error ?? "No stkCallback"),
            );
            return new Response(JSON.stringify({ ResultCode: 0 }), { status: 200 });
          }

          const callback = parseResult.data.Body.stkCallback;

          const checkoutRequestId = callback.CheckoutRequestID;
          const resultCode = callback.ResultCode;

          // Find pending payment
          const { data: payment } = await supabaseAdmin
            .from("payments")
            .select("*")
            .eq("checkout_request_id", checkoutRequestId)
            .maybeSingle();

          if (!payment) {
            return new Response(JSON.stringify({ ResultCode: 0 }), { status: 200 });
          }

          // ── Idempotency guard ─────────────────────────────────────────────
          // Safaricom retries failed callbacks. If we already processed this
          // payment, return 200 immediately without re-applying the plan upgrade.
          if (payment.status === "completed") {
            log.warn("[mpesa_callback] duplicate_callback", {
              paymentId: payment.id,
              checkoutRequestId,
            });
            return new Response(JSON.stringify({ ResultCode: 0 }), { status: 200 });
          }

          // Payment failed
          if (resultCode !== 0) {
            await supabaseAdmin
              .from("payments")
              .update({ status: "failed" })
              .eq("checkout_request_id", checkoutRequestId);
            return new Response(JSON.stringify({ ResultCode: 0 }), { status: 200 });
          }

          // Active verification: check Safaricom before crediting.
          // Skip in sandbox — the STK query API is unreliable in sandbox and returns
          // failure codes even for simulated successful payments.
          if (process.env.MPESA_ENV === "production") {
            const isVerified = await verifyTransactionStatus(checkoutRequestId);
            if (!isVerified) {
              console.error(
                `[M-Pesa Callback] Transaction verification failed for ${checkoutRequestId}`,
              );
              return new Response(JSON.stringify({ ResultCode: 0 }), { status: 200 });
            }
          } else {
            console.info(
              `[M-Pesa Callback] Sandbox mode — skipping transaction verification for ${checkoutRequestId}`,
            );
          }

          // Get M-Pesa receipt number
          const items: any[] = callback.CallbackMetadata?.Item ?? [];
          const receipt =
            items.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value ?? "UNKNOWN";

          // Mark payment complete
          await supabaseAdmin
            .from("payments")
            .update({ status: "completed", mpesa_receipt: receipt })
            .eq("checkout_request_id", checkoutRequestId);
          if (!payment.user_id) {
            console.error(`[M-Pesa Callback] Missing user_id for payment ${payment.id}`);
            return new Response(JSON.stringify({ ResultCode: 0 }), { status: 200 });
          }

          const TOPUP_TOKENS_PER_KES = 1_000;
          const getPlanLimits = (plan: string) => {
            const PLANS: Record<string, { label: string; description: string }> = {
              pro: {
                label: "Pro Plan",
                description: "Unlimited messages, quizzes, planner, and notes",
              },
            };
            return PLANS[plan] ?? { label: plan, description: "" };
          };
          const isTopup = payment.plan === "topup";

          if (isTopup) {
            await creditTopupTokens(payment.user_id, payment.amount);
          } else {
            await upgradePlan(payment.user_id, payment.plan, receipt);
          }

          // Send receipt email
          try {
            const { data: profile } = await supabaseAdmin
              .from("profiles")
              .select("email, display_name")
              .eq("id", payment.user_id)
              .maybeSingle();

            if (profile?.email) {
              const tokensAdded = isTopup ? payment.amount * TOPUP_TOKENS_PER_KES : null;
              const plan = isTopup ? null : getPlanLimits(payment.plan);
              const expiryDate = isTopup
                ? null
                : (() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 30);
                    return d.toLocaleDateString("en-KE", {
                      timeZone: "Africa/Nairobi",
                      dateStyle: "long",
                    });
                  })();

              const planLabel = isTopup
                ? `Top-Up — ${tokensAdded!.toLocaleString("en-KE")} tokens`
                : plan!.label;
              const planDescription = isTopup
                ? `KES ${payment.amount} × 1,000 tokens/KES = ${tokensAdded!.toLocaleString("en-KE")} tokens added to your wallet`
                : plan!.description;

              await sendTransactionalEmail({
                to: profile.email,
                subject: isTopup
                  ? `Top-up confirmed — ${tokensAdded!.toLocaleString("en-KE")} tokens added`
                  : `Payment confirmed — ${planLabel} receipt`,
                fromEmail: "support@gilaniai.site",
                fromName: "GilaniAI Billing",
                html: mpesaReceiptEmail({
                  userName: profile.display_name ?? profile.email?.split("@")[0],
                  planLabel,
                  planDescription,
                  amount: payment.amount,
                  mpesaReceipt: receipt,
                  phone: payment.phone_number,
                  expiryDate: expiryDate ?? "No expiry — tokens never expire",
                }),
                text: isTopup
                  ? `Hi ${profile.display_name ?? "there"},\n\nYour top-up of KES ${payment.amount} was received.\n\nTokens added: ${tokensAdded!.toLocaleString("en-KE")}\nReceipt: ${receipt}\nTokens never expire.\n\nThank you!\n\nsupport@gilaniai.site`
                  : `Hi ${profile.display_name ?? "there"},\n\nYour payment of KES ${payment.amount} was received.\n\nPlan: ${planLabel}\nReceipt: ${receipt}\nValid Until: ${expiryDate}\n\nThank you for using GilaniAI!\n\nsupport@gilaniai.site`,
              });
              console.log(`[M-Pesa Callback] 📧 Receipt sent to ${profile.email}`);
            }
          } catch (emailErr: any) {
            console.error("[M-Pesa Callback] Failed to send receipt email:", emailErr?.message);
          }

          // Send SMS notification to the phone used for payment
          try {
            const isTopupSMS = payment.plan === "topup";
            const smsMessage = isTopupSMS
              ? `GilaniAI: Your top-up of KES ${payment.amount} was received. ${(payment.amount * 1000).toLocaleString()} tokens added to your wallet. Receipt: ${receipt}. support@gilaniai.site`
              : `GilaniAI: Payment of KES ${payment.amount} confirmed. Your ${payment.plan} plan is now active for 30 days. Receipt: ${receipt}. support@gilaniai.site`;

            await sendSMS(payment.phone_number, smsMessage);
          } catch (smsErr: any) {
            // Non-fatal — payment already confirmed
            console.error("[M-Pesa Callback] Failed to send SMS:", smsErr?.message);
          }

          log.info("[mpesa_callback] payment_completed", {
            userId: payment.user_id,
            plan: payment.plan,
            receipt,
            amount: payment.amount,
          });
          return new Response(JSON.stringify({ ResultCode: 0 }), { status: 200 });
        } catch (err: any) {
          log.error("[mpesa_callback] unhandled_error", {
            message: err?.message,
          });
          // Always return 200 to Safaricom or they will retry
          return new Response(JSON.stringify({ ResultCode: 0 }), { status: 200 });
        }
      },
    },
  },
});
