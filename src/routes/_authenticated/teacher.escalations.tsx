import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase as supabaseClient } from "@/client/supabase";
import { EscalationsPage } from "@/client/components/teacher/EscalationsPage";

export const Route = createFileRoute("/_authenticated/teacher/escalations")({
  head: () => ({
    meta: [
      { title: "Teacher Portal — Escalations — GilaniAI" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window !== "undefined") {
      const { data } = await supabaseClient.auth.getSession();
      if (!data.session)
        throw redirect({
          to: "/login",
          search: { redirect: "/teacher/escalations", signout: undefined },
        });
    }
  },
  loader: () => ({
    escalations: [] as any[],
  }),
  component: EscalationsPage,
});
