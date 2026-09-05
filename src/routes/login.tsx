import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/client/supabase";
import { AuthForm } from "@/client/components/auth/AuthForm";
import { ArrowLeft, BookOpen, BrainCircuit, MessageCircle, Sparkles } from "lucide-react";

function safeRedirectPath(url: string | undefined): string {
  if (!url) return "/tutor";
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  return "/tutor";
}

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: (s.redirect as string) || undefined,
    signout: s.signout === "true" || s.signout === true || undefined,
  }),
  beforeLoad: async ({ search }) => {
    if (search.signout) {
      await supabase.auth.signOut();
      throw redirect({ to: "/login" as any });
    }
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: safeRedirectPath(search.redirect) });
  },
  head: () => ({
    meta: [
      { title: "Sign in — GilaniAI" },
      {
        name: "description",
        content: "Sign in to your GilaniAI account to access AI tutoring and teacher escalation.",
      },
    ],
    links: [{ rel: "canonical", href: "https://gilaniai.site/login" }],
  }),
  component: LoginPage,
});

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "AI-Powered Tutoring",
    desc: "Personalised explanations tailored to your curriculum and learning pace.",
  },
  {
    icon: MessageCircle,
    title: "Instant Teacher Escalation",
    desc: "Seamlessly connect with real teachers when you need deeper guidance.",
  },
  {
    icon: BookOpen,
    title: "Curriculum-Aligned",
    desc: "Covering KCSE, CBC, IGCSE, A-Level, IB and more — content that matches your exams.",
  },
];

function LoginPage() {
  return (
    <main className="min-h-dvh w-full flex bg-[#0d0f18] selection:bg-[#C96A3D]/60 selection:text-white">
      {/* ── Left panel — branding (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col justify-between p-12 xl:p-16 overflow-hidden">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 bg-[#0d0f18]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_40%,rgba(201,106,61,0.18),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_80%,rgba(201,106,61,0.08),transparent)]" />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating orbs */}
        <div
          className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-[#C96A3D]/8 blur-3xl animate-pulse"
          style={{ animationDuration: "6s" }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-[#C96A3D]/6 blur-3xl animate-pulse"
          style={{ animationDuration: "9s", animationDelay: "3s" }}
        />

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <Link to="/" className="block w-fit hover:opacity-80 transition-opacity">
            <span className="font-bold italic text-[#E2725B] text-4xl xl:text-5xl tracking-tight">
              GilaniAI
            </span>
          </Link>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-center gap-10 mt-16">
            <div className="space-y-4 max-w-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#C96A3D]/30 bg-[#C96A3D]/10 text-[#E28743] text-xs font-semibold tracking-wide">
                <Sparkles className="h-3.5 w-3.5" />
                AI Tutoring Platform
              </div>
              <h1 className="font-serif text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
                Learn smarter,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E2725B] to-[#E8A87C]">
                  not harder.
                </span>
              </h1>
              <p className="text-white/50 text-base leading-relaxed">
                Your AI study companion that adapts to your curriculum, answers your questions, and
                connects you with expert teachers.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-5">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#C96A3D]/15 border border-[#C96A3D]/20 flex items-center justify-center group-hover:bg-[#C96A3D]/25 transition-colors">
                    <Icon className="h-4 w-4 text-[#E28743]" />
                  </div>
                  <div>
                    <p className="text-white/90 text-sm font-semibold">{title}</p>
                    <p className="text-white/40 text-xs leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom quote */}
          <div className="border-t border-white/[0.06] pt-6">
            <blockquote className="text-white/30 text-xs leading-relaxed italic">
              "The beautiful thing about learning is that no one can take it away from you."
            </blockquote>
            <p className="text-white/20 text-[10px] mt-1 font-medium tracking-wide uppercase">
              — B.B. King
            </p>
          </div>
        </div>

        {/* Right edge fade into form panel */}
        <div className="absolute right-0 inset-y-0 w-24 bg-gradient-to-l from-[#0d0f18] to-transparent" />
      </div>

      {/* ── Right panel — auth form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative">
        {/* Back button with generous mobile touch target */}
        <Link
          to="/"
          className="absolute top-4 left-4 lg:top-6 lg:left-6 inline-flex items-center gap-1.5 p-2.5 -m-2.5 text-sm font-medium text-white/40 hover:text-white/80 active:text-white transition-colors group cursor-pointer"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5 sm:h-4 sm:w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">Back</span>
        </Link>

        <AuthForm />
      </div>
    </main>
  );
}
