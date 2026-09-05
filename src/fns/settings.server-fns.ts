import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

export const saveUserSettingsFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      displayName: z.string().max(100).optional(),
      avatarUrl: z.string().nullable().optional(),
      curriculum: z.string().max(50).optional(),
      tutorTone: z.string().max(50).optional(),
      tutorStyle: z.string().max(50).optional(),
      tutorDepth: z.string().max(50).optional(),
      disclaimerAccepted: z.boolean().optional(),
      cookieConsent: z.boolean().optional(),
      analyticsConsent: z.boolean().optional(),
      preferences: z.record(z.string(), z.any()).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/server/supabase");
    const { authenticateRequest } = await import("@/server/api-auth.server");
    const { invalidateCachedProfile } = await import("@/server/chat/profile-cache.server");

    const request = getRequest();
    let authResult;
    try {
      authResult = await authenticateRequest(request);
    } catch (err) {
      throw new Error(err instanceof Response ? (await err.json()).error : "Unauthorized", {
        cause: err,
      });
    }

    const userId = authResult.userId;

    // Build the core payload for profiles table
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.displayName !== undefined) {
      updatePayload.display_name = data.displayName.trim();
    }
    if (data.avatarUrl !== undefined) {
      updatePayload.avatar_url = data.avatarUrl;
    }
    if (data.curriculum !== undefined) {
      updatePayload.curriculum = data.curriculum;
    }
    if (data.tutorTone !== undefined) {
      updatePayload.tutor_tone = data.tutorTone;
    }
    if (data.tutorStyle !== undefined) {
      updatePayload.tutor_style = data.tutorStyle;
    }
    if (data.tutorDepth !== undefined) {
      updatePayload.tutor_depth = data.tutorDepth;
    }
    if (data.preferences !== undefined) {
      updatePayload.preferences = data.preferences;
    }

    // Try update with optional consent columns first
    const fullPayload: Record<string, any> = { ...updatePayload };
    if (data.disclaimerAccepted !== undefined) {
      fullPayload.disclaimer_accepted = data.disclaimerAccepted;
    }
    if (data.cookieConsent !== undefined) {
      fullPayload.cookie_consent = data.cookieConsent;
    }
    if (data.analyticsConsent !== undefined) {
      fullPayload.analytics_consent = data.analyticsConsent;
    }

    const { error: fullError } = await (supabaseAdmin.from("profiles") as any)
      .update(fullPayload)
      .eq("id", userId);

    if (fullError) {
      // If error occurred (e.g. consent columns don't exist in DB schema), retry with core payload
      const { error: coreError } = await (supabaseAdmin.from("profiles") as any)
        .update(updatePayload)
        .eq("id", userId);

      if (coreError) {
        console.error("[Settings ServerFn] Failed to update profile:", coreError.message);
        throw new Error(`Failed to update profile settings: ${coreError.message}`);
      }
    }

    // Invalidate profile cache so AI chat immediately picks up new curriculum/tone/style
    invalidateCachedProfile(userId);

    return { success: true };
  });
