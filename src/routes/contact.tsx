import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Mail,
  MessageCircle,
  Clock,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Phone,
  Sparkles,
} from "lucide-react";
import { submitContactFn } from "@/fns/contact.server-fns";
import { LegalHeader, LegalFooter } from "@/client/components/LegalLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — GilaniAI" },
      {
        name: "description",
        content:
          "Get in touch with the GilaniAI team for support, feedback, or partnership enquiries.",
      },
      { property: "og:image", content: "https://gilaniai.site/og-contact.png" },
      { name: "twitter:image", content: "https://gilaniai.site/og-contact.png" },
    ],
  }),
  component: ContactPage,
});

const FAQ_ITEMS = [
  {
    q: "Do I need a password to sign in?",
    a: "No. GilaniAI is completely passwordless. You can sign in instantly with Google or enter your email to receive a secure 6-digit one-time passcode (OTP).",
  },
  {
    q: "Is GilaniAI free to use?",
    a: "Yes — there's a free tier with generous daily limits. The Pro plan (KES 500/mo) unlocks unlimited sessions and priority support.",
  },
  {
    q: "How do I escalate to a human teacher?",
    a: "Inside any tutor chat session, click 'Escalate' in the sidebar. A qualified teacher will review your query.",
  },
  {
    q: "Is my data safe and private?",
    a: "Yes. GilaniAI is built under Kenya's Data Protection Act 2019. Your study data is never sold or shared with third parties.",
  },
];

type FormState = "idle" | "sending" | "success" | "error";
type Category = "general" | "bug" | "billing" | "account" | "partnership" | "press" | "other";

function ContactPage() {
  const [form, setForm] = useState<{
    name: string;
    email: string;
    subject: string;
    category: Category;
    message: string;
  }>({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: "",
  });
  const [status, setStatus] = useState<FormState>("idle");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setStatus("sending");
    try {
      await submitContactFn({ data: form });
      setStatus("success");
      setForm({ name: "", email: "", subject: "", category: "general", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const canSubmit =
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    form.message.trim() !== "" &&
    status !== "sending";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      <LegalHeader />

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
            Contact Us
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Got a question, feedback, or school partnership inquiry? Our team responds promptly.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            Typical reply within 24 hours (Mon–Fri)
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-10 sm:py-16 grid gap-8 lg:grid-cols-3">
        {/* Info sidebar */}
        <div className="space-y-4 lg:col-span-1">
          {[
            {
              icon: Mail,
              title: "Support & Billing",
              body: (
                <a
                  href="mailto:support@gilaniai.site"
                  className="text-xs font-semibold text-primary hover:underline break-all"
                >
                  support@gilaniai.site
                </a>
              ),
              sub: "For account issues, billing questions, and general enquiries.",
            },
            {
              icon: Phone,
              title: "Direct Support Line",
              body: <p className="text-xs font-semibold text-primary">0710 297 603</p>,
              sub: "Call or SMS directly for urgent student or school assistance.",
            },
            {
              icon: MapPin,
              title: "Based in Kenya",
              body: (
                <p className="text-xs text-muted-foreground leading-relaxed">Nairobi, Kenya 🇰🇪</p>
              ),
              sub: "Building local educational technology for students across Africa & globally.",
            },
            {
              icon: MessageCircle,
              title: "Community & Updates",
              body: (
                <div className="flex flex-col gap-2">
                  <a
                    href="https://twitter.com/GilaniAI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    @GilaniAI on X / Twitter{" "}
                    <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground/60" />
                  </a>
                  <a
                    href="https://github.com/gilaniai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    github.com/gilani{" "}
                    <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground/60" />
                  </a>
                </div>
              ),
              sub: "",
            },
          ].map(({ icon: Icon, title, body, sub }) => (
            <div
              key={title}
              className="rounded-3xl border border-border/60 bg-card/60 p-5 hover:border-primary/40 hover:bg-card/90 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-bold text-foreground font-display">{title}</p>
              </div>
              {sub && <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">{sub}</p>}
              {body}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-border/60 bg-card/70 p-6 sm:p-9 space-y-6 backdrop-blur-md shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-foreground font-display mb-1">
                Send a message
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Fill in the form below and we will get back to you as soon as possible.
              </p>
            </div>

            {status === "success" ? (
              <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle className="h-7 w-7 text-emerald-500" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground font-display">
                    Message received!
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We&apos;ll reply to your email within 24 hours.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-2 text-xs text-primary font-semibold hover:underline cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Full name <span className="text-primary">*</span>
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Amina Wanjiku"
                      className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Email address <span className="text-primary">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Category
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="general">General enquiry</option>
                      <option value="bug">Bug report</option>
                      <option value="billing">Billing / subscription</option>
                      <option value="account">Account issue</option>
                      <option value="partnership">School partnership</option>
                      <option value="press">Press / media</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Subject
                    </label>
                    <input
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="Brief summary"
                      className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Message <span className="text-primary">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe your question or issue in as much detail as possible…"
                    className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  />
                  <p className="mt-1.5 text-right text-[10px] font-mono text-muted-foreground">
                    {form.message.length} chars
                  </p>
                </div>

                {status === "error" && (
                  <div className="flex items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    Something went wrong. Please try again or email us directly.
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {status === "sending" ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send message
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAQ Accordions on Contact Page */}
      <section className="border-t border-border/60 bg-card/20 px-4 sm:px-8 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold">
              FAQ
            </p>
            <h2 className="text-2xl font-bold text-foreground font-display">Common questions</h2>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/60 bg-card/60 overflow-hidden shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-foreground hover:bg-muted/30 transition-colors text-left gap-4 cursor-pointer"
                >
                  {item.q}
                  <span className="text-primary text-lg leading-none shrink-0">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 pt-2 text-sm text-muted-foreground leading-relaxed border-t border-border/40 bg-muted/10">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <LegalFooter />
    </div>
  );
}
