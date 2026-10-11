import { createFileRoute } from "@tanstack/react-router";
import { LegalHeader, LegalFooter, LegalHero, Section } from "@/client/components/LegalLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — GilaniAI" },
      {
        name: "description",
        content:
          "Read GilaniAI's Terms of Service — covering acceptable use, AI limitations, teacher escalation, and student responsibilities.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      <LegalHeader />
      <LegalHero
        label="Terms & Policy"
        title="Terms of Service"
        subtitle="Last updated: June 2025"
      />
      <main className="grow mx-auto w-full max-w-3xl px-4 sm:px-8 py-10 sm:py-16">
        <div className="space-y-8 rounded-3xl border border-border/60 bg-card/60 p-6 sm:p-10 backdrop-blur-md shadow-sm">
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using GilaniAI (&quot;the Service&quot;), you agree to be bound by
              these Terms of Service. If you do not agree, please do not use the Service. These
              Terms apply to all users, including students, teachers, and administrators.
            </p>
          </Section>
          <Section title="2. Description of Service">
            <p>
              GilaniAI provides an AI-powered academic tutoring and study platform. The Service
              includes:
            </p>
            <ul>
              <li>
                Socratic AI tutoring chat sessions, including notes summarisation and practice
                quizzes generated within the conversation
              </li>
              <li>Exam countdown reminders and streak tracking</li>
              <li>Teacher escalation for human expert review</li>
            </ul>
          </Section>
          <Section title="3. User Accounts">
            <p>
              You must create an account to access most features. You are responsible for
              maintaining the confidentiality of your credentials and for all activities under your
              account. You must be at least 13 years old to register independently.
            </p>
          </Section>
          <Section title="4. Acceptable Use">
            <p>You agree not to:</p>
            <ul>
              <li>
                Use the Service to cheat, plagiarise or submit AI-generated work as your own without
                disclosure
              </li>
              <li>
                Attempt to manipulate the AI system to generate harmful or inappropriate content
              </li>
              <li>Scrape, copy or redistribute content from the Service without permission</li>
              <li>
                Use the Service for any purpose that violates applicable Kenyan or international law
              </li>
              <li>Impersonate another user, teacher or administrator</li>
            </ul>
          </Section>
          <Section title="5. AI Limitations and Disclaimer">
            <p>
              GilaniAI uses artificial intelligence to assist with academic revision. While we
              strive for accuracy, <strong>AI responses may contain errors</strong>. The Service is
              designed to support — not replace — human teaching. Students should verify critical
              information with their teachers or official textbooks, especially for high-stakes
              examinations.
            </p>
          </Section>
          <Section title="6. Teacher Escalation">
            <p>
              When a student escalates a question to a teacher, that specific conversation excerpt
              is shared with the verified teacher. Regular AI conversations remain private and are
              not shared with teachers unless explicitly escalated by the student.
            </p>
          </Section>
          <Section title="7. Intellectual Property">
            <p>
              All AI-generated content (summaries, flashcards, quiz questions, study plans) is
              provided for your personal educational use only. You may not resell or redistribute
              this content commercially. Notes and content you upload remain your intellectual
              property.
            </p>
          </Section>
          <Section title="8. Subscription and Payments">
            <p>
              Free accounts have usage limits. Paid Scholar subscriptions are billed monthly in
              Kenyan Shillings (KES). Subscriptions auto-renew unless cancelled before the renewal
              date. Refunds are provided at our discretion within 7 days of a charge if the Service
              has not been materially used.
            </p>
          </Section>
          <Section title="9. Termination">
            <p>
              We may suspend or terminate your account if you violate these Terms or if your conduct
              compromises the security, integrity or educational purpose of the Service.
            </p>
          </Section>
          <Section title="10. Governing Law">
            <p>
              These Terms are governed by and construed in accordance with the laws of Kenya.
              Disputes arising from these Terms will be subject to the exclusive jurisdiction of the
              courts of Kenya.
            </p>
          </Section>
          <Section title="11. Contact">
            <p>
              Questions about these Terms should be sent to{" "}
              <a href="mailto:support@gilaniai.site">support@gilaniai.site</a>.
            </p>
          </Section>
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}
