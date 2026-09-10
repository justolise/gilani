import { createFileRoute } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/server/supabase";
import { log } from "@/server/logger";

/**
 * GET /api/mpesa/stuck-payments-check
 *
 * Called by Vercel cron every 12 hours.
 * Queries for payments stuck in 'pending' state for > 30 minutes and logs them
 * as structured errors so they appear in Vercel log alerts / monitoring.
 *
 * TODO: Wire up to a Slack webhook or email alert for production notification.
 */
export const Route = createFileRoute("/api/mpesa/stuck-payments-check" as any)({
  server: {
    handlers: {
      GET: async () => {
        const request = getRequest();

        // Only allow calls from Vercel cron (or manual via CRON_SECRET header)
        const authHeader = request.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

          const { data: stuckPayments, error } = await supabaseAdmin
            .from("payments")
            .select("id, user_id, plan, amount, checkout_request_id, created_at")
            .eq("status", "pending")
            .lt("created_at", thirtyMinsAgo)
            .order("created_at", { ascending: true });

          if (error) {
            log.error("[stuck_payments_check] db_error", { error: error.message });
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          if (!stuckPayments || stuckPayments.length === 0) {
            log.info("[stuck_payments_check] no_stuck_payments");
            return new Response(JSON.stringify({ ok: true, stuckCount: 0 }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Log each stuck payment as a structured error so it triggers
          // any log-based alerting configured in Vercel / your monitoring tool.
          log.error("[stuck_payments_check] stuck_payments_found", {
            count: stuckPayments.length,
            payments: stuckPayments.map((p) => ({
              id: p.id,
              userId: p.user_id,
              plan: p.plan,
              amount: p.amount,
              checkoutRequestId: p.checkout_request_id,
              createdAt: p.created_at,
            })),
          });

          // TODO: Send to Slack webhook or email:
          // const SLACK_WEBHOOK = process.env.SLACK_PAYMENTS_WEBHOOK;
          // if (SLACK_WEBHOOK) { await fetch(SLACK_WEBHOOK, { method: "POST", body: JSON.stringify({...}) }) }

          return new Response(JSON.stringify({ ok: true, stuckCount: stuckPayments.length }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          log.error("[stuck_payments_check] unhandled_error", { error: err?.message });
          return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
