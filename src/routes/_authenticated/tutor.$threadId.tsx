import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import React from "react";

const LazyTutorThread = lazyRouteComponent(
  () => import("@/client/components/tutor/TutorThreadView"),
);

export const Route = createFileRoute("/_authenticated/tutor/$threadId")({
  component: TutorThreadRouteWrapper,
});

function TutorThreadRouteWrapper() {
  const { threadId } = Route.useParams();
  return <LazyTutorThread threadId={threadId} />;
}
