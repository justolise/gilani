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
    <main className="min-h-dvh w-full flex bg-[#0d0f18] selection:bg-[#C96A3D]/60 selection:text-white relative overflow-x-hidden">
      {/* ── Global ambient background gradients ── */}
      <div className="fixed inset-0 bg-[#0d0f18] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_25%,rgba(201,106,61,0.15),transparent)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_80%,rgba(201,106,61,0.08),transparent)] pointer-events-none" />

      {/* Subtle grid overlay */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Floating orbs */}
      <div
        className="fixed top-1/4 left-1/4 w-72 h-72 rounded-full bg-[#C96A3D]/8 blur-3xl animate-pulse pointer-events-none"
        style={{ animationDuration: "7s" }}
      />
      <div
        className="fixed bottom-1/4 right-1/4 w-60 h-60 rounded-full bg-[#C96A3D]/6 blur-3xl animate-pulse pointer-events-none"
        style={{ animationDuration: "10s", animationDelay: "3s" }}
      />

      {/* ── Left panel — branding (Desktop only) ── */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[54%] relative flex-col justify-between p-12 xl:p-16 z-10">
        <div className="flex flex-col h-full justify-between">
          {/* Logo */}
          <Link to="/" className="block w-fit hover:opacity-85 transition-opacity">
            <span className="font-bold italic text-[#E2725B] text-4xl xl:text-5xl tracking-tight">
              GilaniAI
            </span>
          </Link>

          {/* Main copy */}
          <div className="space-y-8 my-auto max-w-md">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#C96A3D]/30 bg-[#C96A3D]/10 text-[#E28743] text-xs font-semibold tracking-wide">
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
            <div className="space-y-4 pt-2">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3.5 group">
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
            <blockquote className="text-white/35 text-xs leading-relaxed italic">
              "The beautiful thing about learning is that no one can take it away from you."
            </blockquote>
            <p className="text-white/20 text-[10px] mt-1 font-medium tracking-wide uppercase">
              — B.B. King
            </p>
          </div>
        </div>

        {/* Right edge fade into form panel */}
        <div className="absolute right-0 inset-y-0 w-24 bg-gradient-to-l from-[#0d0f18] to-transparent pointer-events-none" />
      </div>

      {/* ── Right panel — auth form + mobile showcase ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 py-12 sm:py-16 relative z-10 min-h-dvh">
        {/* Top bar on mobile: Back button + Curriculum pill */}
        <div className="w-full max-w-[420px] flex items-center justify-between mb-4 sm:mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 p-2 -ml-2 text-xs sm:text-sm font-medium text-white/40 hover:text-white/80 active:text-white transition-colors group cursor-pointer"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </Link>

          <span className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#C96A3D]/20 bg-[#C96A3D]/10 text-[#E28743] text-[10px] font-semibold tracking-wide">
            <Sparkles className="h-3 w-3" />
            24/7 AI Tutor
          </span>
        </div>

        {/* Mobile hero header (compact, inspiring, no duplicate brand text) */}
        <div className="lg:hidden text-center max-w-[360px] mx-auto mb-5 space-y-1 px-2 animate-in fade-in duration-300">
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-white tracking-tight">
            Learn smarter,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E2725B] to-[#E8A87C]">
              not harder.
            </span>
          </h1>
          <p className="text-xs text-white/50 leading-relaxed">
            AI-powered study support tailored for your exams.
          </p>
        </div>

        {/* Central Auth Card */}
        <AuthForm />

        {/* Mobile feature showcase cards below form */}
        <div className="lg:hidden w-full max-w-[420px] mt-6 pt-5 border-t border-white/[0.06] space-y-4 animate-in fade-in duration-500">
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex flex-col items-center text-center gap-1">
              <BrainCircuit className="h-4 w-4 text-[#E28743]" />
              <span className="text-[11px] font-semibold text-white/80">AI Tutor</span>
              <span className="text-[9px] text-white/40 leading-tight">Step-by-step</span>
            </div>
            <div className="p-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex flex-col items-center text-center gap-1">
              <MessageCircle className="h-4 w-4 text-[#E28743]" />
              <span className="text-[11px] font-semibold text-white/80">Teachers</span>
              <span className="text-[9px] text-white/40 leading-tight">Instant help</span>
            </div>
            <div className="p-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex flex-col items-center text-center gap-1">
              <BookOpen className="h-4 w-4 text-[#E28743]" />
              <span className="text-[11px] font-semibold text-white/80">Aligned</span>
              <span className="text-[9px] text-white/40 leading-tight">KCSE & CBC</span>
            </div>
          </div>

          <p className="text-center text-[10px] text-white/30 italic px-4">
            "The beautiful thing about learning is that no one can take it away from you."
          </p>
        </div>
      </div>
    </main>
  );
}
