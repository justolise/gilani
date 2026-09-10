import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/server/supabase";
import { authenticateRequest } from "@/server/api-auth.server";
import { sendTransactionalEmail, emailTemplate } from "@/server/email.server";

export const deleteAccount = createServerFn({ method: "POST" })
  .validator((data: { otp: string }) => data)
  .handler(async ({ data }) => {
    const request = getRequest();
    let authResult;
    try {
      authResult = await authenticateRequest(request);
    } catch (err) {
      throw new Error(err instanceof Response ? (await err.json()).error : "Unauthorized", {
        cause: err,
      });
    }
    const { userId, user } = authResult;
    const cleanOtp = data.otp?.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      throw new Error("A valid verification code is required to delete your account.");
    }
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (roleRow?.role === "admin") {
      throw new Error("Admin accounts cannot be self-deleted. Transfer ownership first.");
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      throw new Error(error.message || "Failed to delete account. Please contact support.");
    }

    const userEmail = user.email;
    if (userEmail) {
      try {
        await sendTransactionalEmail({
          to: userEmail,
          subject: "Your GilaniAI account has been deleted",
          fromEmail: "noreply@gilaniai.site",
          html: emailTemplate({
            heading: "Account Deleted",
            body: "This confirms that your GilaniAI account and all associated data have been permanently deleted, as requested.",
            footerNote: "This is an automated confirmation. No further action is needed.",
          }),
        });
      } catch {
        /* ignore */
      }
    }
  });

export const Route = createFileRoute("/_authenticated/settings")({
  component: lazyRouteComponent(() => import("@/client/components/settings/SettingsPage")),
});
