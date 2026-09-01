import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/client/supabase";
import { AdminUsersPage } from "@/client/components/admin/AdminUsersPage";
import type {
  Profile,
  Escalation,
  PlatformStats,
  ContactMessage,
  MessageFeedback,
  RateLimitRow,
  Payment,
} from "@/client/components/admin/types";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({
    meta: [
      { title: "Admin — Users & Roles — GilaniAI" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window !== "undefined") {
      const { data } = await supabase.auth.getSession();
      if (!data.session)
        throw redirect({ to: "/login", search: { redirect: "/admin/users", signout: undefined } });
    }
  },
  loader: () => ({
    profiles: [] as Profile[],
    messages: [] as ContactMessage[],
    feedback: [] as MessageFeedback[],
    rateLimits: [] as RateLimitRow[],
    payments: [] as Payment[],
    escalations: [] as Escalation[],
    platformStats: {
      totalConversations: 0,
      totalMessages: 0,
      totalNotes: 0,
      totalEscalations: 0,
      openEscalations: 0,
    } as PlatformStats,
  }),
  component: AdminUsersPage,
});
