import { createFileRoute } from "@tanstack/react-router";
import { LegalHeader, LegalFooter, LegalHero, Section } from "@/client/components/LegalLayout";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — GilaniAI" },
      {
        name: "description",
        content: "GilaniAI's Cookie Policy — how we use cookies and similar technologies.",
      },
    ],
  }),
  component: CookiesPage,
});

const COOKIE_TABLE = [
  {
    name: "sb-auth-token",
    type: "Essential",
    purpose: "Maintains your authenticated login session via Supabase",
    duration: "Session / up to 1 year",
    canOpt: "No — required for login",
  },
  {
    name: "theme",
    type: "Preference",
    purpose: "Stores your light/dark mode preference",
    duration: "1 year",
    canOpt: "Yes",
  },
  {
    name: "gilani_disclaimer_seen",
    type: "Functional",
    purpose: "Remembers that you have acknowledged the AI disclaimer modal",
    duration: "1 year",
    canOpt: "Yes",
  },
  {
    name: "_analytics",
    type: "Analytics",
    purpose: "Aggregated, anonymous usage statistics to improve the platform",
    duration: "90 days",
    canOpt: "Yes — via cookie settings",
  },
];

const TYPE_COLOR: Record<string, string> = {
  Essential: "bg-red-500/10 text-red-500 border border-red-500/20",
  Preference: "bg-muted text-muted-foreground border border-border/60",
  Functional: "bg-muted text-muted-foreground border border-border/60",
  Analytics: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
};

function CookiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      <LegalHeader />
      <LegalHero
        label="Cookies & Consent"
        title="Cookie Policy"
        subtitle="Last updated: June 2025"
      />
      <main className="grow mx-auto w-full max-w-3xl px-4 sm:px-8 py-10 sm:py-16">
        <div className="space-y-8 rounded-3xl border border-border/60 bg-card/60 p-6 sm:p-10 backdrop-blur-md shadow-sm">
          <Section title="1. What Are Cookies?">
            <p>
              Cookies are small text files stored on your device when you visit a website. They help
              us remember your preferences, keep you signed in securely, and understand how you
              interact with GilaniAI.
            </p>
          </Section>

          <Section title="2. Cookies We Use">
            <p className="mb-4">
              Here is a summary of the cookies and local storage tokens we use:
            </p>
            <div className="overflow-x-auto rounded-2xl border border-border/60">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40 font-mono text-[11px] text-foreground font-semibold">
                    <th className="p-3">Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Opt-out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-sans text-muted-foreground">
                  {COOKIE_TABLE.map((c) => (
                    <tr key={c.name} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-mono font-medium text-foreground whitespace-nowrap">
                        {c.name}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${TYPE_COLOR[c.type] || "bg-muted text-muted-foreground"}`}
                        >
                          {c.type}
                        </span>
                      </td>
                      <td className="p-3 leading-relaxed min-w-50">{c.purpose}</td>
                      <td className="p-3 whitespace-nowrap font-mono text-[11px]">{c.duration}</td>
                      <td className="p-3 whitespace-nowrap text-[11px]">{c.canOpt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="3. Managing Your Cookies">
            <p>
              You can control and manage cookies through your browser settings. Most browsers allow
              you to block or delete cookies. However, disabling essential cookies may prevent you
              from signing in or using core features of GilaniAI.
            </p>
          </Section>

          <Section title="4. Contact Us">
            <p>
              If you have questions about our use of cookies, reach out to{" "}
              <a href="mailto:privacy@gilaniai.site">privacy@gilaniai.site</a>.
            </p>
          </Section>
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}
