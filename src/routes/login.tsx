import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/client/supabase";
import { AuthForm } from "@/client/components/auth/AuthForm";
import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  MessageCircle,
  Sparkles,
  Shield,
  Users,
} from "lucide-react";

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
    title: "AI-Powered Socratic Tutoring",
    desc: "Personalised step-by-step explanations tailored to your curriculum and learning pace.",
    color: "from-[#d4754a]/20 to-[#d4754a]/5",
    iconColor: "text-[#e8924a]",
    border: "border-[#d4754a]/20",
  },
  {
    icon: Users,
    title: "Real Teacher Escalation",
    desc: "Seamlessly connect with expert teachers when you need deeper, human guidance.",
    color: "from-emerald-500/15 to-emerald-500/5",
    iconColor: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  {
    icon: BookOpen,
    title: "Curriculum-Aligned Content",
    desc: "KCSE, CBC, IGCSE, A-Level, IB and more — answers that match your actual exams.",
    color: "from-blue-500/15 to-blue-500/5",
    iconColor: "text-blue-400",
    border: "border-blue-500/20",
  },
];

const STATS = [
  { value: "24/7", label: "AI Tutor" },
  { value: "10+", label: "Curricula" },
  { value: "0", label: "Hallucination" },
];

function LoginPage() {
  return (
    <main className="min-h-dvh w-full flex bg-[#0f1117] selection:bg-[#d4754a]/60 selection:text-white relative overflow-x-hidden">
      {/* Global ambient background */}
      <div className="fixed inset-0 bg-[#0f1117] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_75%_55%_at_15%_20%,rgba(212,117,74,0.14),transparent)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_55%_35%_at_88%_85%,rgba(212,117,74,0.07),transparent)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_40%_30%_at_70%_20%,rgba(99,102,241,0.05),transparent)] pointer-events-none" />

      {/* Dot grid */}
      <div className="fixed inset-0 grid-dots opacity-60 pointer-events-none" />

      {/* Floating ambient orbs */}
      <div
        className="fixed top-1/4 left-1/5 w-80 h-80 rounded-full bg-[#d4754a]/7 blur-3xl animate-pulse pointer-events-none"
        style={{ animationDuration: "8s" }}
      />
      <div
        className="fixed bottom-1/4 right-1/5 w-64 h-64 rounded-full bg-[#d4754a]/5 blur-3xl animate-pulse pointer-events-none"
        style={{ animationDuration: "11s", animationDelay: "3s" }}
      />

      {/* ── Left panel — branding (Desktop only) ── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative flex-col justify-between p-10 xl:p-14 z-10">
        <div className="flex flex-col h-full justify-between">
          {/* Logo */}
          <Link to="/" className="block w-fit hover:opacity-80 transition-opacity">
            <span
              className="font-bold italic text-4xl xl:text-5xl tracking-tight"
              style={{
                background: "linear-gradient(135deg, #d4754a 0%, #e8924a 55%, #f3a05a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 16px rgba(212,117,74,0.4))",
              }}
            >
              GilaniAI
            </span>
          </Link>

          {/* Main copy */}
          <div className="space-y-8 my-auto max-w-md">
            <div className="space-y-5">
              <div className="badge-terracotta w-fit">
                <Sparkles className="h-3 w-3" />
                AI Tutoring Platform
              </div>
              <h1 className="heading-display-lg text-4xl xl:text-5xl text-white">
                Learn smarter,
                <br />
                <span className="text-gradient-brand">not harder.</span>
              </h1>
              <p className="text-white/45 text-base leading-relaxed">
                Your AI study companion that adapts to your curriculum, answers your questions, and
                connects you with expert teachers.
              </p>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6">
              {STATS.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-bold text-[#e8924a] font-mono">{value}</div>
                  <div className="text-xs text-white/35 font-medium mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Feature list */}
            <div className="space-y-3">
              {FEATURES.map(({ icon: Icon, title, desc, color, iconColor, border }) => (
                <div
                  key={title}
                  className={`flex items-start gap-3.5 p-3.5 rounded-xl bg-linear-to-r ${color} border ${border} group hover:brightness-110 transition-all duration-200`}
                >
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-white/6 border border-white/8 flex items-center justify-center">
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <div>
                    <p className="text-white/90 text-sm font-semibold leading-tight">{title}</p>
                    <p className="text-white/40 text-xs leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom quote */}
          <div className="border-t border-white/5 pt-5">
            <blockquote className="text-white/30 text-xs leading-relaxed italic">
              "The beautiful thing about learning is that no one can take it away from you."
            </blockquote>
            <p className="text-white/15 text-[10px] mt-1.5 font-semibold tracking-widest uppercase">
              — B.B. King
            </p>
          </div>
        </div>

        {/* Right edge fade */}
        <div className="absolute right-0 inset-y-0 w-20 bg-linear-to-l from-[#0f1117] to-transparent pointer-events-none" />
      </div>

      {/* ── Right panel — auth form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 pt-[calc(1.5rem+var(--safe-top,0px))] pb-[calc(1.5rem+var(--safe-bottom,0px))] sm:pt-[calc(3rem+var(--safe-top,0px))] sm:pb-[calc(3rem+var(--safe-bottom,0px))] pl-[max(1rem,var(--safe-left,0px))] pr-[max(1rem,var(--safe-right,0px))] relative z-10 min-h-dvh">
        {/* Top bar on mobile: Back button + Curriculum pill */}
        <div className="w-full max-w-105 flex items-center justify-between mb-5 sm:mb-7">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 p-2 -ml-2 text-xs sm:text-sm font-medium text-white/35 hover:text-white/75 active:text-white transition-colors group cursor-pointer"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </Link>

          <span className="lg:hidden badge-terracotta">
            <Sparkles className="h-3 w-3" />
            24/7 AI Tutor
          </span>
        </div>

        {/* Mobile hero header */}
        <div className="lg:hidden text-center max-w-90 mx-auto mb-6 space-y-2 px-2 animate-in-slide">
          <h1 className="heading-display text-2xl sm:text-3xl text-white">
            Learn smarter, <span className="text-gradient-brand">not harder.</span>
          </h1>
          <p className="text-xs text-white/40 leading-relaxed">
            AI-powered study support tailored for your exams.
          </p>
        </div>

        {/* Central Auth Card */}
        <AuthForm />

        {/* Mobile feature showcase cards below form */}
        <div className="lg:hidden w-full max-w-105 mt-6 pt-5 border-t border-white/6 space-y-4 animate-in-slide [animation-delay:0.15s]">
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                icon: BrainCircuit,
                title: "AI Tutor",
                sub: "Step-by-step",
                color: "text-[#e8924a]",
              },
              { icon: Users, title: "Teachers", sub: "Instant help", color: "text-emerald-400" },
              { icon: BookOpen, title: "Aligned", sub: "KCSE & CBC", color: "text-blue-400" },
            ].map(({ icon: Icon, title, sub, color }) => (
              <div
                key={title}
                className="p-3 rounded-2xl border border-white/6 bg-white/2 flex flex-col items-center text-center gap-1.5"
              >
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-[11px] font-semibold text-white/75">{title}</span>
                <span className="text-[9px] text-white/35 leading-tight">{sub}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-[10px] text-white/25 italic px-4">
            "The beautiful thing about learning is that no one can take it away from you."
          </p>
        </div>
      </div>
    </main>
  );
}
