import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/settings")({
  component: lazyRouteComponent(() => import("@/client/components/settings/SettingsPage")),
});
