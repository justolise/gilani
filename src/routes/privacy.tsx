import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalHeader, LegalFooter, LegalHero, Section } from "@/client/components/LegalLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — GilaniAI" },
      {
        name: "description",
        content:
          "Read GilaniAI's Privacy Policy — how we collect, store and protect your personal data.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      <LegalHeader />
      <LegalHero
        label="Privacy & Security"
        title="Privacy Policy"
        subtitle="Last updated: June 2025"
      />
      <main className="grow mx-auto w-full max-w-3xl px-4 sm:px-8 py-10 sm:py-16">
        <div className="space-y-8 rounded-3xl border border-border/60 bg-card/60 p-6 sm:p-10 backdrop-blur-md shadow-sm">
          <Section title="1. Introduction">
            <p>
              GilaniAI (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting
              your privacy and complying with the Kenya Data Protection Act 2019. This Privacy
              Policy explains what information we collect, how we use it, and your rights regarding
              your data.
            </p>
          </Section>
          <Section title="2. Information We Collect">
            <p>We collect the following categories of information:</p>
            <ul>
              <li>
                <strong>Account information:</strong> Name, email address, and role profile
                (authenticated securely via passwordless one-time verification codes or Google
                OAuth).
              </li>
              <li>
                <strong>Academic content:</strong> Notes you upload, quiz answers, chat messages
                sent to the AI tutor, and study plans generated for your account.
              </li>
              <li>
                <strong>Performance data:</strong> Quiz scores, streak records, and planner task
                completion — used to personalise your study experience.
              </li>
              <li>
                <strong>Usage data:</strong> Page views, feature interactions, and device/browser
                type — collected to improve the platform.
              </li>
              <li>
                <strong>Communication data:</strong> Messages you send to our support team.
              </li>
            </ul>
          </Section>
          <Section title="3. How We Use Your Information">
            <p>We use your information to:</p>
            <ul>
              <li>Provide, personalise and improve the GilaniAI platform</li>
              <li>Deliver curriculum-specific responses and feedback</li>
              <li>Enable human teacher oversight and session escalation when requested</li>
              <li>Process payments and manage your subscription via M-Pesa</li>
              <li>Communicate service updates and essential notifications</li>
            </ul>
          </Section>
          <Section title="4. Data Protection & Student Safety">
            <p>
              We take student data safety extremely seriously. We do not sell your personal data or
              use your study content to train public AI models. All data is transmitted over
              encrypted encrypted encrypted channels (HTTPS/TLS) and stored in secure,
              access-controlled databases.
            </p>
          </Section>
          <Section title="5. Your Rights">
            <p>Under the Kenya Data Protection Act 2019, you have the right to:</p>
            <ul>
              <li>Request access to the personal data we hold about you</li>
              <li>Request correction of inaccurate personal data</li>
              <li>Request deletion of your account and associated study data</li>
              <li>Object to processing or request data portability</li>
            </ul>
            <p>
              To exercise any of these rights, contact our Data Protection team at{" "}
              <a href="mailto:privacy@gilaniai.site">privacy@gilaniai.site</a>.
            </p>
          </Section>
          <Section title="6. Contact Us">
            <p>
              If you have questions about this Privacy Policy, reach out to{" "}
              <a href="mailto:privacy@gilaniai.site">privacy@gilaniai.site</a> or visit our{" "}
              <Link to="/contact">Contact page</Link>.
            </p>
          </Section>
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}
