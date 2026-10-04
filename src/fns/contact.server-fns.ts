import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import {
  supabaseAdmin,
  sendTransactionalEmail,
  contactAdminNotificationEmail,
  contactAutoReplyEmail,
} from "@/server/index";

export const submitContactFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(1).max(100),
      email: z.string().email().max(200),
      subject: z.string().max(200).optional(),
      category: z.enum([
        "general",
        "bug",
        "billing",
        "account",
        "curriculum",
        "partnership",
        "press",
        "other",
      ]),
      message: z.string().min(1).max(5000),
    }),
  )
  .handler(async ({ data }) => {
    // SECURITY: Rate limit contact form — max 3 submissions per hour per IP
    const request = getRequest();
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown";
    const rlKey = `contact:${ip}`;
    const { data: rlData } = await supabaseAdmin
      .rpc("upsert_rate_limit", {
        p_key: rlKey,
        p_max: 3,
        p_reset_at: new Date(Date.now() + 3600000).toISOString(),
      })
      .single();

    if (!rlData) {
      throw new Error("Rate limit exceeded. Please wait before submitting again.");
    }

    // 1. Save to DB
    const { error } = await supabaseAdmin.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      subject: data.subject ?? null,
      category: data.category,
      message: data.message,
    });

    if (error) {
      console.error("[Contact] DB insert failed:", error.message);
      throw new Error("Failed to save message. Please try again.");
    }

    // 2. Notify admin at support inbox
    const adminEmail = contactAdminNotificationEmail(data);
    await sendTransactionalEmail({
      to: "support@gilaniai.site",
      subject: adminEmail.subject,
      fromEmail: "info@gilaniai.site",
      fromName: "GilaniAI Notifications",
      replyTo: data.email,
      html: adminEmail.html,
      text: adminEmail.text,
    });

    // 3. Auto-reply to sender
    const userEmail = contactAutoReplyEmail(data);
    await sendTransactionalEmail({
      to: data.email,
      subject: userEmail.subject,
      fromEmail: "support@gilaniai.site",
      fromName: "GilaniAI Support",
      html: userEmail.html,
      text: userEmail.text,
    });

    return { ok: true };
  });
