import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import React from "react";

const LazyQuizTake = lazyRouteComponent(
  () => import("@/client/components/tutor/quiz/QuizTakeView"),
);

export const Route = createFileRoute("/_authenticated/tutor/quizzes_/$quizId")({
  component: QuizTakeRouteWrapper,
});

function QuizTakeRouteWrapper() {
  const { quizId } = Route.useParams();
  return <LazyQuizTake quizId={quizId} />;
}
