import { createFileRoute } from "@tanstack/react-router";
import { QuizzesPage } from "@/client/components/tutor/quizzes/QuizzesPage";

export const Route = createFileRoute("/_authenticated/tutor/quizzes")({
  component: QuizzesPage,
});
