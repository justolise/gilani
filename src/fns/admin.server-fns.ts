import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/server/supabase";
import { authenticateRequest } from "@/server/api-auth.server";
import { z } from "zod";
import type {
  Profile,
  Escalation,
  PlatformStats,
  ContactMessage,
  MessageFeedback,
  NewsletterSubscriber,
  RateLimitRow,
  Payment,
} from "@/client/components/admin/types";

// ─── Server Functions ──────────────────────────────────────────────────────────
async function verifyAdmin(request: Request): Promise<string> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");
  const authResult = await authenticateRequest(request);
  const { data: roleCheck } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", authResult.userId)
    .eq("role", "admin")
    .single();
  if (!roleCheck) throw new Error("Forbidden");
  return authResult.userId;
}

export const listProfiles = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  try {
    await verifyAdmin(request);
  } catch {
    return [];
  }
  const [profilesRes, rolesRes, convoRes] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("id, display_name, email, curriculum, created_at, plan, plan_expiry")
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("user_roles").select("user_id, role"),
    supabaseAdmin.from("conversations").select("user_id"),
  ]);
  if (profilesRes.error) throw new Error(profilesRes.error.message);
  const roleMap: Record<string, string> = {};
  for (const r of rolesRes.data ?? []) roleMap[r.user_id] = r.role;
  const convoCount: Record<string, number> = {};
  for (const c of convoRes.data ?? []) convoCount[c.user_id] = (convoCount[c.user_id] ?? 0) + 1;
  return (profilesRes.data ?? []).map((p) => ({
    ...p,
    role: roleMap[p.id] ?? "student",
    conversation_count: convoCount[p.id] ?? 0,
  })) as Profile[];
});

export const listEscalations = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  try {
    await verifyAdmin(request);
  } catch {
    return [];
  }
  const { data, error } = await supabaseAdmin
    .from("escalations")
    .select("id, conversation_id, user_id, reason, status, detail, reviewer_id, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return [];
  const userIds = [...new Set((data ?? []).map((e: any) => e.user_id).filter(Boolean))];
  let profileMap: Record<string, { display_name: string | null; email: string | null }> = {};
  if (userIds.length > 0) {
    const { data: pd } = await supabaseAdmin
      .from("profiles")
      .select("id, display_name, email")
      .in("id", userIds);
    profileMap = Object.fromEntries(
      (pd ?? []).map((p: any) => [p.id, { display_name: p.display_name, email: p.email }]),
    );
  }
  return (data ?? []).map((e: any) => ({
    ...e,
    profiles: profileMap[e.user_id] ?? null,
  })) as Escalation[];
});

export const listPlatformStats = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  try {
    await verifyAdmin(request);
  } catch {
    return {
      totalConversations: 0,
      totalMessages: 0,
      totalNotes: 0,
      totalEscalations: 0,
      openEscalations: 0,
    };
  }
  const [convos, msgs, notes, escs] = await Promise.all([
    supabaseAdmin.from("conversations").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("messages").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("notes").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("escalations").select("id, status"),
  ]);
  const escalations = escs.data ?? [];
  return {
    totalConversations: convos.count ?? 0,
    totalMessages: msgs.count ?? 0,
    totalNotes: notes.count ?? 0,
    totalEscalations: escalations.length,
    openEscalations: escalations.filter((e: any) => e.status === "open" || e.status === "pending")
      .length,
  } as PlatformStats;
});

export const listContactMessages = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  try {
    await verifyAdmin(request);
  } catch {
    return [];
  }
  const { data, error } = await supabaseAdmin
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ContactMessage[];
});

export const updateMessageStatus = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid(), status: z.enum(["unread", "read", "resolved"]) }))
  .handler(async ({ data }) => {
    const request = getRequest();
    await verifyAdmin(request);
    const { error } = await supabaseAdmin
      .from("contact_messages")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
  });

export const updateRole = createServerFn({ method: "POST" })
  .validator(z.object({ userId: z.string(), role: z.string() }))
  .handler(async ({ data }) => {
    const request = getRequest();
    const adminId = await verifyAdmin(request);
    if (adminId === data.userId && data.role !== "admin")
      throw new Error("Cannot remove your own admin role");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.userId, role: data.role as any });
    if (error) throw new Error(error.message);
  });

export const listFeedback = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return [];
  let authResult;
  try {
    authResult = await authenticateRequest(request);
  } catch {
    return [];
  }
  const { data: roleCheck } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", authResult.userId)
    .eq("role", "admin")
    .single();
  if (!roleCheck) throw new Error("Forbidden");
  const { data, error } = await supabaseAdmin
    .from("message_feedback")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  const userIds = [...new Set((data ?? []).map((f: any) => f.user_id).filter(Boolean))];
  let profileMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profileData } = await supabaseAdmin
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);
    profileMap = Object.fromEntries((profileData ?? []).map((p: any) => [p.id, p.display_name]));
  }
  return (data ?? []).map((f: any) => ({
    ...f,
    profiles: { display_name: profileMap[f.user_id] ?? null },
  })) as unknown as MessageFeedback[];
});

export const listNewsletterSubscribers = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  try {
    await verifyAdmin(request);
  } catch {
    return [];
  }
  const { data, error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .select("id, email, name, status, subscribed_at, unsubscribed_at")
    .order("subscribed_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as NewsletterSubscriber[];
});

export const listRateLimits = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  try {
    await verifyAdmin(request);
  } catch {
    return [];
  }
  const { data, error } = await supabaseAdmin
    .from("rate_limits")
    .select("key, count, reset_at")
    .order("count", { ascending: false })
    .limit(100);
  if (error) return [];
  return (data ?? []) as RateLimitRow[];
});

export const listPayments = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  try {
    await verifyAdmin(request);
  } catch {
    return [];
  }
  const { data, error } = await supabaseAdmin
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return [];
  const userIds = [...new Set((data ?? []).map((p: any) => p.user_id).filter(Boolean))];
  let profileMap: Record<string, { display_name: string | null; email: string | null }> = {};
  if (userIds.length > 0) {
    const { data: profileData } = await supabaseAdmin
      .from("profiles")
      .select("id, display_name, email")
      .in("id", userIds);
    profileMap = Object.fromEntries(
      (profileData ?? []).map((p: any) => [p.id, { display_name: p.display_name, email: p.email }]),
    );
  }
  return (data ?? []).map((p: any) => ({
    ...p,
    profiles: profileMap[p.user_id] ?? null,
  })) as unknown as Payment[];
});

export const updateUserPlan = createServerFn({ method: "POST" })
  .validator(
    z.object({
      userId: z.string(),
      plan: z.enum(["free", "pro"]),
      planExpiry: z.string().nullable().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    await verifyAdmin(request);
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ plan: data.plan, plan_expiry: data.planExpiry ?? null })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
  });

export const resetUserRateLimit = createServerFn({ method: "POST" })
  .validator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    const request = getRequest();
    await verifyAdmin(request);
    const { error } = await supabaseAdmin
      .from("rate_limits")
      .delete()
      .like("key", `${data.userId}:%`);
    if (error) throw new Error(error.message);
  });
