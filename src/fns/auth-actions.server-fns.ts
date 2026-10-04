import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import {
  supabaseAdmin,
  authenticateRequest,
  requireAuth,
  sendTransactionalEmail,
  welcomeEmail,
} from "@/server/index";

export const assignUserRole = createServerFn({ method: "POST" })
  .validator(
    z.object({
      role: z.enum(["student", "teacher", "admin"]),
      displayName: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
      curriculum: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const authResult = await requireAuth();
    const userId = authResult.userId;
    const { role, displayName, curriculum } = data;

    // SECURITY: Prevent privilege escalation -- only existing admins may
    // assign "teacher" or "admin" roles. Self-service onboarding is only permitted
    // to assign the "student" role.
    if (role === "admin" || role === "teacher") {
      const { data: existingRole } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      if (existingRole?.role !== "admin") {
        throw new Error(`Unauthorized: insufficient privileges to assign ${role} role`);
      }
    }

    try {
      // Delete existing role to allow role changes (e.g. student -> teacher)
      await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
      const { error: insertError } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: userId, role });
      if (insertError) throw insertError;

      const cleanDisplayName =
        displayName?.trim() || authResult.user.user_metadata?.full_name?.trim() || "";

      const profilePayload: Record<string, any> = {
        id: userId,
        display_name: cleanDisplayName,
        email: authResult.user.email ?? null,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };

      if (curriculum) {
        profilePayload.curriculum = curriculum;
      }

      await supabaseAdmin.from("profiles").upsert(profilePayload, { onConflict: "id" });

      // Cosmetic only: syncs the name into auth.users' metadata so it shows
      // up in the Supabase Auth dashboard's user list. The app itself always
      // reads display_name from the profiles table above, never from here.
      if (cleanDisplayName) {
        await supabaseAdmin.auth.admin
          .updateUserById(userId, {
            user_metadata: { display_name: cleanDisplayName },
          })
          .catch((err) => console.error("[assignUserRole] Failed to sync auth metadata:", err));
      }

      // Send welcome email
      const userEmail = authResult.user.email;
      const userName = displayName || authResult.user.user_metadata?.full_name || "there";
      const dashboard =
        role === "teacher" ? "/teacher/escalations" : role === "admin" ? "/admin/users" : "/tutor";
      if (userEmail) {
        sendTransactionalEmail({
          to: userEmail,
          subject: `Welcome to GilaniAI 🎉`,
          html: welcomeEmail({
            userName,
            role,
            dashboardUrl: `${process.env.APP_URL || "https://gilaniai.site"}/login?signout=true&redirect=${dashboard}`,
          }),
        }).catch((err) => console.error("[Welcome Email] Failed:", err));
      }

      return { success: true };
    } catch (err: any) {
      throw new Error(err.message || "Failed to assign user role.", { cause: err });
    }
  });

export const checkEmailStatus = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().email(),
    }),
  )
  .handler(async ({ data }) => {
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, onboarding_completed")
      .eq("email", data.email.toLowerCase().trim())
      .maybeSingle();

    if (!existingProfile) {
      // No profile row at all — brand new user
      return { status: "new" as const };
    }
    if (!existingProfile.onboarding_completed) {
      // Profile row exists but registration was never finished — force OTP re-verification
      return { status: "incomplete" as const };
    }
    // Fully registered returning user
    return { status: "registered" as const };
  });

export const consumeVerifyToken = createServerFn({ method: "GET" })
  .validator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email_verify_token", data.token)
      .maybeSingle();

    if (!profile) return { success: false };

    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", profile.id)
      .maybeSingle();

    // Intentionally keep email_verify_token in place — this verification is
    // informational only and never gates access, so it's safe (and necessary)
    // to make the link idempotent.
    await supabaseAdmin.from("profiles").update({ email_verified: true }).eq("id", profile.id);

    return { success: true, role: roleRow?.role ?? "student" };
  });

export const checkSessionAuth = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { authenticated: null as boolean | null };
  }
  try {
    await authenticateRequest(request);
    return { authenticated: true };
  } catch {
    return { authenticated: false };
  }
});
