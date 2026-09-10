import { createFileRoute } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";
import { authenticateRequest } from "@/server/api-auth.server";

/**
 * GET /api/mpesa/sandbox-curl?checkoutRequestId=<id>
 *
 * Returns the curl command to simulate a Safaricom STK callback for sandbox testing.
 * The callback secret is read from server env and never exposed to the client bundle.
 * Requires a valid user session — prevents abuse.
 */
export const Route = createFileRoute("/api/mpesa/sandbox-curl" as any)({
  server: {
    handlers: {
      GET: async () => {
        try {
          const request = getRequest();

          // Only available in sandbox mode
          if (process.env.MPESA_ENV === "production") {
            return new Response(JSON.stringify({ error: "Not available in production" }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Require authentication — this endpoint exposes the callback URL structure
          try {
            await authenticateRequest(request);
          } catch {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }

          const url = new URL(request.url);
          const checkoutRequestId = url.searchParams.get("checkoutRequestId") || "";

          if (!checkoutRequestId) {
            return new Response(JSON.stringify({ error: "checkoutRequestId is required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const appUrl = process.env.APP_URL || "http://localhost:3000";
          const secret = process.env.MPESA_CALLBACK_SECRET || "";

          const callbackUrl = `${appUrl}/api/mpesa/callback?token=${encodeURIComponent(secret)}`;

          const payload = JSON.stringify({
            Body: {
              stkCallback: {
                MerchantRequestID: "sandbox-test",
                CheckoutRequestID: checkoutRequestId,
                ResultCode: 0,
                ResultDesc: "The service request is processed successfully.",
                CallbackMetadata: {
                  Item: [
                    { Name: "Amount", Value: 500 },
                    { Name: "MpesaReceiptNumber", Value: "SANDBOX" + Date.now() },
                    { Name: "TransactionDate", Value: 20240101120000 },
                    { Name: "PhoneNumber", Value: 254700000000 },
                  ],
                },
              },
            },
          });

          const curlCommand =
            `curl -s -X POST '${callbackUrl}' \\\n` +
            `  -H 'Content-Type: application/json' \\\n` +
            `  -d '${payload.replace(/'/g, "'\\''")}'`;

          return new Response(JSON.stringify({ curlCommand, callbackUrl }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          console.error("[Sandbox Curl] Error:", err?.message);
          return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
