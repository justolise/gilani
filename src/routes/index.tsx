import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/client/hooks/use-auth";
import { GilaniLoader } from "@/client/components/GilaniLoader";

import { Navbar, Hero, Footer, FeaturesModal, DemoModal } from "@/client/components/landing";

export const Route = createFileRoute("/")({
  validateSearch: () => ({}),
  head: () => ({
    meta: [
      { title: "GilaniAI — AI Study Assistant for Students" },
      {
        name: "description",
        content:
          "GilaniAI is your AI-powered study assistant. Get instant Socratic AI tutoring and real teacher escalation — all in one place. Start free.",
      },
      {
        name: "keywords",
        content:
          "AI tutor, study assistant, KCSE, TVET, University, College, CBC, AI education, online study, GilaniAI",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://gilaniai.site/" },
      { property: "og:title", content: "GilaniAI — AI Study Assistant" },
      {
        property: "og:description",
        content:
          "Your AI-powered study assistant. Socratic tutoring and teacher escalation — free to start.",
      },
      { property: "og:image", content: "https://gilaniai.site/icon-512.png" },
      { property: "og:image:alt", content: "GilaniAI — Ethical AI Study Assistant" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "GilaniAI — AI Study Assistant" },
      {
        name: "twitter:description",
        content:
          "Your AI study assistant. Socratic tutoring and real teacher review — free to start.",
      },
      { name: "twitter:image", content: "https://gilaniai.site/icon-512.png" },
    ],
    links: [{ rel: "canonical", href: "https://gilaniai.site/" }],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (roles.includes("admin")) {
        navigate({ to: "/admin/users" as any });
      } else if (roles.includes("teacher")) {
        navigate({ to: "/teacher/escalations" as any });
      } else {
        navigate({ to: "/tutor" as any });
      }
    }
  }, [user, roles, loading, navigate]);

  if (user && !loading) {
    return <GilaniLoader />;
  }

  return (
    <main className="h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between overflow-hidden bg-[#121212] text-white selection:bg-[#C96A3D] selection:text-white font-sans relative">
      <Navbar onOpenFeatures={() => setFeaturesOpen(true)} onOpenDemo={() => setDemoOpen(true)} />
      <Hero onOpenDemo={() => setDemoOpen(true)} onOpenFeatures={() => setFeaturesOpen(true)} />
      <Footer />

      <FeaturesModal open={featuresOpen} onOpenChange={setFeaturesOpen} />
      <DemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </main>
  );
}
