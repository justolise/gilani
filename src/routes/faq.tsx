import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Sparkles, MessageCircle, HelpCircle } from "lucide-react";
import { LegalHeader, LegalFooter } from "@/client/components/LegalLayout";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — GilaniAI" },
      {
        name: "description",
        content: "Frequently asked questions about GilaniAI — your AI study assistant.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:image", content: "https://gilaniai.site/og-faq.png" },
      { name: "twitter:image", content: "https://gilaniai.site/og-faq.png" },
    ],
    links: [{ rel: "canonical", href: "https://gilaniai.site/faq" }],
  }),
  component: FAQPage,
});

const FAQS = [
  {
    category: "Getting Started",
    items: [
      {
        q: "What is GilaniAI?",
        a: "GilaniAI is an AI-powered study assistant built for students. It provides Socratic AI tutoring through chat — including quiz practice and note-based help directly in the conversation — plus real teacher escalation when you need a human to step in.",
      },
      {
        q: "Does GilaniAI have quizzes, notes, and a study planner?",
        a: "Yes. Beyond the AI tutor chat, GilaniAI includes a dedicated Quiz Generator for practice questions on any topic, a Notes tool that produces exhaustive AI summaries from uploaded PDFs, Word docs, images, or pasted text, and a Study Planner that builds a day-by-day schedule around your exam dates and subjects.",
      },
      {
        q: "Is GilaniAI free to use?",
        a: "Yes — GilaniAI is free to start. Create an account and get immediate access to the AI tutor chat and teacher escalation. Premium plans unlock higher daily message limits and priority escalation.",
      },
      {
        q: "How do I create an account and sign in?",
        a: "Click 'Get started' or 'Sign in'. You can sign in with one click using 'Continue with Google', or enter your email address to receive a secure, 6-digit one-time verification code (OTP). GilaniAI is completely passwordless — no passwords to create or remember!",
      },
      {
        q: "Do I need a password?",
        a: "No! GilaniAI uses passwordless authentication for maximum speed and security. You never have to create, remember, or reset a password. Just sign in with Google or your email OTP code.",
      },
      {
        q: "Can I view public pages (Terms, Privacy, FAQ, About) without getting logged out?",
        a: "Yes. When you are signed in, public informational pages automatically display a 'Back' button to return to your previous session or settings, and a 'Dashboard' button to return directly to your app. You remain securely logged in at all times.",
      },
      {
        q: "Where can I learn more about how GilaniAI works?",
        a: "You can visit our About page anytime from the website footer or directly from your user menu inside the app. It explains our pedagogical agents, curriculum grounding, and safety architecture.",
      },
      {
        q: "Can I use GilaniAI on my phone?",
        a: "Yes. GilaniAI is a Progressive Web App (PWA) — it works smoothly on any modern browser on Android or iPhone. You can also install it to your home screen for an app-like experience.",
      },
    ],
  },
  {
    category: "AI Tutor",
    items: [
      {
        q: "How does the AI tutor work?",
        a: "GilaniAI uses a Socratic tutoring approach — instead of just giving you answers, it asks guiding questions to help you think through problems step by step.",
      },
      {
        q: "Can the AI make mistakes?",
        a: "Yes. Like all AI systems, GilaniAI can occasionally produce inaccurate information. Always verify important answers with your teacher or official textbooks.",
      },
      {
        q: "What is the 'escalate to teacher' feature?",
        a: "If you're stuck or need human confirmation, you can escalate any study session to a real teacher. The teacher will review your conversation and leave a written response directly in GilaniAI.",
      },
      {
        q: "Does GilaniAI do my homework for me?",
        a: "GilaniAI is designed to guide your learning, not do your work for you. Using it to copy answers violates our Terms of Service and your school's academic integrity policy.",
      },
    ],
  },
  {
    category: "Privacy & Safety",
    items: [
      {
        q: "Is GilaniAI safe for students?",
        a: "Yes. Content is moderated, sessions are logged for teacher review, and the AI is specifically prompted to maintain age-appropriate, educational conversations at all times.",
      },
      {
        q: "What data does GilaniAI collect?",
        a: "We only collect information necessary to deliver tutoring — your account email/name, uploaded study notes, quiz responses, and chat transcripts. We never sell your data.",
      },
    ],
  },
  {
    category: "Subjects & Curricula",
    items: [
      {
        q: "Which curricula does GilaniAI support?",
        a: "GilaniAI is curriculum-agnostic and supports KCSE, CBC, Cambridge IGCSE, Edexcel IGCSE, Canadian curriculum, and more. Simply specify your syllabus and grade in the tutor.",
      },
      {
        q: "Which subjects does GilaniAI cover?",
        a: "GilaniAI covers all major academic subjects — Mathematics, Physics, Chemistry, Biology, English, History, Geography, Business Studies, Computer Science, and more.",
      },
      {
        q: "Can GilaniAI help me with exam revision?",
        a: "Absolutely. GilaniAI generates targeted practice questions, quizzes on past paper formats, summarises long chapters into revision flashcards, and builds calendar study schedules.",
      },
    ],
  },
  {
    category: "Billing & Plans",
    items: [
      {
        q: "What is included in the free plan?",
        a: "The free plan gives you access to the AI tutor chat, teacher escalation, and core study tools with a generous daily message quota.",
      },
      {
        q: "What extra do I get on the Pro plan?",
        a: "The Pro plan unlocks higher daily quotas, priority teacher escalation, and full access to advanced document tools.",
      },
      {
        q: "How much does the Pro plan cost?",
        a: "Pro is priced at KES 500 per month. Flexible top-up packages starting from KES 10 are also available directly via M-Pesa.",
      },
      {
        q: "What payment methods are accepted?",
        a: "We support Safaricom M-Pesa with instant automated activation.",
      },
    ],
  },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const location = useLocation();
  const itemRef = useRef<HTMLDivElement>(null);
  const slug = slugify(q);
  const targetHash = location.hash?.replace(/^#/, "");
  const isTargeted = Boolean(targetHash) && targetHash === slug;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isTargeted) {
      setOpen(true);
      const t = setTimeout(() => {
        itemRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
      return () => clearTimeout(t);
    }
  }, [isTargeted]);

  return (
    <div
      ref={itemRef}
      id={slug}
      className={`border rounded-2xl overflow-hidden transition-all duration-200 scroll-mt-24 ${
        open
          ? "border-primary/40 bg-card shadow-sm"
          : "border-border/60 bg-card/60 hover:border-border hover:bg-card"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors gap-4 cursor-pointer"
        aria-expanded={open}
      >
        <span className="font-semibold text-sm sm:text-[15px] text-foreground leading-snug">
          {q}
        </span>
        <div
          className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            open ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}
        >
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-2 text-sm text-muted-foreground leading-relaxed border-t border-border/40 bg-muted/10">
          {a}
        </div>
      )}
    </div>
  );
}

const FAQ_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.flatMap((category) =>
    category.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  ),
});

function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const filtered = activeCategory ? FAQS.filter((f) => f.category === activeCategory) : FAQS;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: FAQ_JSON_LD }} />
      <LegalHeader backTo={"/" as any} backLabel="Back to home" />

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border/60 py-14 sm:py-20 text-center bg-card/20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(201,106,61,0.12),transparent_70%)]" />
        </div>
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-1 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Support Center
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-foreground font-display tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Everything you need to know about GilaniAI. Can&apos;t find your question?{" "}
            <Link to={"/contact" as any} className="text-primary font-semibold hover:underline">
              Contact our team.
            </Link>
          </p>
        </div>
      </div>

      <main className="grow max-w-4xl mx-auto w-full px-4 sm:px-8 py-10 sm:py-16 space-y-10">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              !activeCategory
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            All Questions
          </button>
          {FAQS.map(({ category }) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category === activeCategory ? null : category)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeCategory === category
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="space-y-10">
          {filtered.map(({ category, items }) => (
            <div key={category} className="space-y-4">
              <h2 className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                {category}
              </h2>
              <div className="space-y-3">
                {items.map(({ q, a }) => (
                  <FAQItem key={q} q={q} a={a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-border/60 bg-card/60 p-8 text-center space-y-4 shadow-sm backdrop-blur-md">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground font-display">Still have questions?</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Our support and academic mentoring teams are always here to help you get the most out of
            your revision.
          </p>
          <div className="pt-2">
            <Link
              to={"/contact" as any}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md active:scale-95"
            >
              <MessageCircle className="h-4 w-4" />
              Contact Support
            </Link>
          </div>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
