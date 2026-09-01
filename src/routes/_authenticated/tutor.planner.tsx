import { createFileRoute } from "@tanstack/react-router";
import { PlannerPage } from "@/client/components/tutor/planner/PlannerPage";

export const Route = createFileRoute("/_authenticated/tutor/planner")({
  component: PlannerPage,
});
