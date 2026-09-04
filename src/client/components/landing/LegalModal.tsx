import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/client/components/ui/dialog";
import { ShieldCheck, FileText, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface LegalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: "privacy" | "terms";
}

export function LegalModal({ open, onOpenChange, initialTab = "privacy" }: LegalModalProps) {
  const [tab, setTab] = useState<"privacy" | "terms">(initialTab);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
    }
  }, [open, initialTab]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85dvh] overflow-hidden flex flex-col border-white/10 bg-[#121214]/98 backdrop-blur-2xl p-5 sm:p-7 text-white rounded-2xl shadow-2xl">
        <DialogHeader className="text-left space-y-2 shrink-0 pb-3 border-b border-white/10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTab("privacy")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  tab === "privacy"
                    ? "bg-[#C96A3D] text-white shadow-sm"
                    : "bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setTab("terms")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  tab === "terms"
                    ? "bg-[#C96A3D] text-white shadow-sm"
                    : "bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                <FileText className="h-4 w-4" />
                Terms of Service
              </button>
            </div>

            {/* Open Full Dedicated Page Link */}
            <Link
              to={tab === "privacy" ? "/privacy" : "/terms"}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#E28743] hover:underline font-semibold pr-6"
            >
              <span>View full page</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
          <DialogTitle className="font-serif text-2xl sm:text-3xl font-bold text-white">
            {tab === "privacy" ? "Privacy Policy" : "Terms of Service"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-white/60">
            {tab === "privacy"
              ? "Compliant with the Kenya Data Protection Act 2019 and global student privacy standards."
              : "Clear rules governing academic integrity, acceptable use, and student rights on GilaniAI."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-6 pr-2 text-xs sm:text-sm text-white/80 leading-relaxed">
          {tab === "privacy" ? (
            <>
              <div className="space-y-1.5">
                <h3 className="font-semibold text-white text-sm">1. Introduction</h3>
                <p>
                  GilaniAI ("we", "our", "us") is committed to protecting your privacy and complying
                  with the Kenya Data Protection Act 2019. This Privacy Policy explains what
                  information we collect, how we use it, and your rights regarding your data.
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-semibold text-white text-sm">2. Information We Collect</h3>
                <ul className="list-disc pl-5 space-y-1 text-white/70">
                  <li>
                    <strong>Account information:</strong> Name, email address, school/institution,
                    and securely hashed passwords (never stored in plain text).
                  </li>
                  <li>
                    <strong>Academic content:</strong> Uploaded notes, syllabus materials, homework
                    prompts, chat messages, and study plans.
                  </li>
                  <li>
                    <strong>Performance data:</strong> Practice scores, streaks, and subject mastery
                    tracking.
                  </li>
                  <li>
                    <strong>Usage & logs:</strong> Feature interactions and device types used to
                    improve platform stability.
                  </li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-semibold text-white text-sm">3. How We Use Your Information</h3>
                <p>We use your information exclusively to:</p>
                <ul className="list-disc pl-5 space-y-1 text-white/70">
                  <li>Generate curriculum-grounded Socratic tutoring responses and quizzes.</li>
                  <li>Track personal progress and identify weak topics for focused revision.</li>
                  <li>
                    Facilitate human teacher escalation when you explicitly request human review.
                  </li>
                  <li>Deliver critical service notifications and product updates.</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-semibold text-white text-sm">
                  4. Zero Training on Your Personal Notes
                </h3>
                <p className="bg-[#C96A3D]/10 border border-[#C96A3D]/20 p-3 rounded-xl text-white">
                  <strong>
                    GilaniAI does not sell or use your personal academic content (notes, chats, quiz
                    answers) to train third-party public AI models.
                  </strong>{" "}
                  Your uploaded materials remain strictly within your private account.
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-semibold text-white text-sm">5. Data Sharing & Security</h3>
                <p>
                  We never sell personal data. Information is only shared during explicit teacher
                  escalation (with verified educators) or with trusted infrastructure providers
                  (e.g. Supabase for database hosting) under strict data processing agreements.
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-semibold text-white text-sm">6. Your Rights & Retention</h3>
                <p>
                  Under the Kenya Data Protection Act 2019, you have the right to access, correct,
                  export, and delete your data. When you close your account, your data is completely
                  purged within 30 days. Contact us anytime at{" "}
                  <span className="text-[#E28743]">support@gilaniai.site</span>.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <h3 className="font-semibold text-white text-sm">1. Acceptance of Terms</h3>
                <p>
                  By accessing or using GilaniAI ("the Service"), you agree to be bound by these
                  Terms of Service. These Terms apply to all users, including students, teachers,
                  and school administrators.
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-semibold text-white text-sm">2. Description of Service</h3>
                <p>
                  GilaniAI provides an AI-powered academic tutoring and study assistant platform
                  featuring Socratic AI tutoring chats, syllabus notes summarisation, formula
                  explanations, study planners, and human teacher escalation.
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-semibold text-white text-sm">
                  3. Academic Integrity & Acceptable Use
                </h3>
                <p>You agree not to:</p>
                <ul className="list-disc pl-5 space-y-1 text-white/70">
                  <li>
                    Use the Service to cheat, plagiarise, or present AI outputs as your uncredited
                    original work in exams.
                  </li>
                  <li>
                    Attempt to jailbreak or manipulate the AI into generating harmful or
                    inappropriate content.
                  </li>
                  <li>
                    Scrape, redistribute, or commercially exploit platform features without explicit
                    permission.
                  </li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-semibold text-white text-sm">
                  4. AI Limitations & Educational Purpose
                </h3>
                <p>
                  GilaniAI is designed to support and accelerate your learning — not replace human
                  instruction. While we enforce strict zero-hallucination rules, students are
                  encouraged to verify critical high-stakes examination facts using their syllabus
                  or human teachers.
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-semibold text-white text-sm">5. Intellectual Property</h3>
                <p>
                  Notes and study materials you upload remain your intellectual property. Generated
                  practice quizzes, revision cards, and explanations are provided for your personal
                  academic use.
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-semibold text-white text-sm">6. Contact</h3>
                <p>
                  For questions regarding these Terms or institutional agreements, please contact{" "}
                  <span className="text-[#E28743]">support@gilaniai.site</span> or write to
                  GilaniAI, Nairobi, Kenya.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer with Full Page Link */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
          <span>Official legal documentation</span>
          <Link
            to={tab === "privacy" ? "/privacy" : "/terms"}
            className="text-[#E28743] hover:underline font-semibold inline-flex items-center gap-1"
          >
            <span>Open as full standalone page</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
