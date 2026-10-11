import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalHeader, LegalFooter } from "@/client/components/LegalLayout";
import { useAuth } from "@/client/hooks/use-auth";
import {
  ShieldCheck,
  Users,
  Zap,
  Brain,
  Target,
  GraduationCap,
  Sparkles,
  BookOpen,
  Check,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "How GilaniAI Works — Ethical AI Tutoring" },
      {
        name: "description",
        content:
          "Learn how GilaniAI combines curriculum-grounded AI, Socratic questioning, and human teacher oversight to help students across any curriculum study more effectively and ethically.",
      },
      { property: "og:image", content: "https://gilaniai.site/og-about.png" },
      { name: "twitter:image", content: "https://gilaniai.site/og-about.png" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "How GilaniAI Works — Ethical AI Tutoring" },
      {
        property: "og:description",
        content: "AI tutoring across any curriculum with real teacher escalation built in.",
      },
      { property: "og:url", content: "https://gilaniai.site/about" },
    ],
    links: [{ rel: "canonical", href: "https://gilaniai.site/about" }],
  }),
  component: About,
});

const AGENTS = [
  {
    name: "Scout",
    icon: Target,
    role: "Study Routine & Accountability",
    description:
      "Keeps your revision rhythms steady. Right in the chat, it tracks exam countdowns, builds focused revision schedules, and gently nudges you to stay consistent.",
    iconColor: "text-amber-500",
    badgeBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    glow: "hover:border-amber-500/40",
  },
  {
    name: "Guardian",
    icon: Brain,
    role: "Core Socratic Tutoring Engine",
    description:
      "Handles deep concept explanation, notes summarisation, and targeted quiz practice — all grounded in your uploaded curriculum materials.",
    iconColor: "text-primary",
    badgeBg: "bg-primary/10 text-primary border-primary/20",
    glow: "hover:border-primary/40",
  },
  {
    name: "Hunter",
    icon: ShieldCheck,
    role: "Safety & Teacher Escalation",
    description:
      "The ethics and safety layer. When a response is low-confidence or a student requests expert human assistance, Hunter creates an escalation for a qualified teacher to review.",
    iconColor: "text-emerald-500",
    badgeBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    glow: "hover:border-emerald-500/40",
  },
];

const TEAM_VALUES = [
  {
    icon: GraduationCap,
    title: "Curriculum First",
    description:
      "Every AI response is grounded in official syllabus content — KCSE, CBC, CBE, Cambridge IGCSE, Edexcel IGCSE, Canadian Curriculum, and beyond.",
  },
  {
    icon: Users,
    title: "Human Oversight",
    description:
      "Teachers always stay in the loop. Students can escalate any session to a verified human reviewer at any time.",
  },
  {
    icon: Zap,
    title: "Honest & Transparent",
    description:
      "GilaniAI surfaces uncertainty instead of bluffing. When it needs confirmation, it says so and routes you to a teacher.",
  },
  {
    icon: ShieldCheck,
    title: "Student Safety",
    description:
      "Designed specifically for learners. Content is proactively moderated, sessions are logged, and educational boundaries are enforced.",
  },
];

function About() {
  const { user, roles } = useAuth();
  const dashboardPath = roles?.includes("admin")
    ? "/admin/users"
    : roles?.includes("teacher")
      ? "/teacher/escalations"
      : "/tutor";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      <LegalHeader />

      <main className="grow">
        {/* Hero */}
        <section className="relative overflow-hidden py-16 sm:py-28 border-b border-border/60 bg-card/20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(201,106,61,0.12),transparent_70%)]" />
          </div>
          <div className="relative max-w-3xl mx-auto px-4 sm:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary mb-2 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              About GilaniAI
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-foreground font-display">
              A learning companion,
              <br />
              <span className="text-primary italic font-serif">not a replacement.</span>
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
              GilaniAI is an AI-powered study assistant built for students on any curriculum. We
              combine curriculum-grounded AI, Socratic questioning, and real human teacher oversight
              to help students master concepts — not just copy answers.
            </p>
          </div>
        </section>

        {/* Mission / Commitments */}
        <section className="px-4 sm:px-8 py-16 sm:py-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">
                Our Mission
              </p>
              <h2 className="text-3xl sm:text-5xl font-black text-foreground font-display tracking-tight">
                Built around three commitments
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mt-0.5">
                    <Check className="h-4 w-4" />
                  </div>
                  <p>
                    <strong className="text-foreground font-semibold">Ground every answer</strong>{" "}
                    in in verified curriculum material from KCSE, CBC, CBE, Cambridge IGCSE,
                    Canadian Curriculum — no hallucinated generic internet answers.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mt-0.5">
                    <Check className="h-4 w-4" />
                  </div>
                  <p>
                    <strong className="text-foreground font-semibold">Surface uncertainty</strong>{" "}
                    of guessing. When GilaniAI needs human verification, it alerts the student and
                    routes the session to an educator.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mt-0.5">
                    <Check className="h-4 w-4" />
                  </div>
                  <p>
                    <strong className="text-foreground font-semibold">Route hard moments</strong> to
                    real teachers. Students are never left stuck on complex exam questions without
                    without guidance.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TEAM_VALUES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-3xl border border-border/60 bg-card/60 p-5 space-y-3 hover:border-primary/40 hover:bg-card/80 transition-all shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-base font-bold text-foreground font-display">{title}</p>
                  <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Three Agents */}
        <section className="bg-card/30 border-y border-border/60 px-4 sm:px-8 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">
                Under the Hood
              </p>
              <h2 className="text-3xl sm:text-5xl font-black text-foreground font-display tracking-tight">
                The Three Intelligent Agents
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                GilaniAI coordinates three specialised agents working in tandem to deliver rigorous,
                pedagogically sound tutoring.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {AGENTS.map(({ name, role, icon: Icon, description, iconColor, badgeBg, glow }) => (
                <div
                  key={name}
                  className={`rounded-3xl border border-border/60 bg-card/70 p-6 sm:p-7 space-y-4 hover:shadow-lg transition-all duration-300 ${glow}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted border border-border/60">
                      <Icon className={`h-5 w-5 ${iconColor}`} />
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeBg}`}
                    >
                      {name}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground font-display">{name}</h3>
                    <p className="text-xs font-medium text-primary mt-0.5">{role}</p>
                    <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Everything is auditable. Every AI turn is logged for academic governance and teacher
              review.
            </p>
          </div>
        </section>

        {/* Who it's for */}
        <section className="px-4 sm:px-8 py-16 sm:py-24">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            <div className="space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">
                Curriculum Agnostic
              </p>
              <h2 className="text-3xl sm:text-5xl font-black text-foreground font-display tracking-tight">
                Designed for any curriculum
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
              {[
                {
                  title: "National Curricula",
                  desc: "KCSE Form 1–4 and CBC Grade 7–10 coverage across all major subjects. Exam-focused practice aligned to national syllabus standards.",
                  badge: "KCSE · CBC · CBE",
                },
                {
                  title: "International Curricula",
                  desc: "Cambridge IGCSE and Edexcel IGCSE support for students at international and private schools worldwide.",
                  badge: "Cambridge · Edexcel",
                },
                {
                  title: "Global Curricula",
                  desc: "Canadian curriculum and other globally recognised frameworks — GilaniAI adapts to your syllabus, wherever you study.",
                  badge: "Canada & Global",
                },
              ].map(({ title, desc, badge }) => (
                <div
                  key={title}
                  className="rounded-3xl border border-border/60 bg-card/60 p-6 hover:border-primary/40 hover:bg-card/90 transition-all flex flex-col justify-between h-full shadow-sm"
                >
                  <div className="space-y-3">
                    <span className="rounded-full bg-muted border border-border/60 px-2.5 py-1 font-mono text-[10px] text-muted-foreground font-medium">
                      {badge}
                    </span>
                    <h3 className="text-base font-bold text-foreground font-display mt-2">
                      {title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-8 py-16 sm:py-20 max-w-4xl mx-auto text-center">
          <div className="relative overflow-hidden rounded-3xl p-10 sm:p-14 border border-primary/20 bg-linear-to-br from-primary/15 via-card to-background shadow-xl">
            <div className="relative z-10 space-y-4">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground font-display tracking-tight">
                Ready to study smarter?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
                Join thousands of students across Kenya and globally who use GilaniAI to excel in
                their exams.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                {user ? (
                  <Link
                    to={dashboardPath as any}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md active:scale-95"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      search={{ redirect: undefined, signout: undefined }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md active:scale-95"
                    >
                      Start for free
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to="/login"
                      search={{ redirect: undefined, signout: undefined }}
                      className="inline-flex items-center justify-center rounded-2xl border border-border bg-card px-8 py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition-all active:scale-95"
                    >
                      Sign in
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <LegalFooter />
    </div>
  );
}
