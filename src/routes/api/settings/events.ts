import { createFileRoute } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/server/supabase";
import { authenticateRequest } from "@/server/api-auth.server";
import { parseCookieHeader } from "@/shared/utils/cookies";

export const Route = createFileRoute("/api/settings/events")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const request = getRequest();
          const cookieHeader = request.headers.get("cookie");
          const cookies = parseCookieHeader(cookieHeader);

          // Honor cookie & analytics consent (Kenyan Data Protection Act / GDPR)
          if (
            cookies["gilani_analytics_consent"] === "false" ||
            cookies["gilani_cookie_consent"] === "false"
          ) {
            return new Response(JSON.stringify({ ok: true, ignored: "consent_revoked" }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          const { userId } = await authenticateRequest(request);

          const body = await request.json().catch(() => ({}));
          const { action, payload } = body as { action: string; payload?: Record<string, any> };

          if (!action || typeof action !== "string") {
            return new Response(JSON.stringify({ error: "action is required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Only allow settings-scoped events
          if (!action.startsWith("settings.")) {
            return new Response(JSON.stringify({ error: "Invalid action namespace" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          await supabaseAdmin.from("audit_logs").insert({
            user_id: userId,
            action,
            payload: payload ?? {},
          });

          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          if (error instanceof Response) return error;
          console.error("[API Settings Events] Error:", error);
          return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
