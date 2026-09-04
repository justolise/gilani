import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/client/components/ui/dialog";
import { ShieldCheck, FileText } from "lucide-react";

interface LegalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: "privacy" | "terms";
}

export function LegalModal({ open, onOpenChange, initialTab = "privacy" }: LegalModalProps) {
  const [tab, setTab] = useState<"privacy" | "terms">(initialTab);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85dvh] overflow-hidden flex flex-col border-white/10 bg-[#121214]/98 backdrop-blur-2xl p-5 sm:p-7 text-white rounded-2xl shadow-2xl">
        <DialogHeader className="text-left space-y-1.5 shrink-0 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab("privacy")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                tab === "privacy"
                  ? "bg-[#C96A3D] text-white shadow-sm"
                  : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setTab("terms")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                tab === "terms"
                  ? "bg-[#C96A3D] text-white shadow-sm"
                  : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Terms of Service
            </button>
          </div>
          <DialogTitle className="font-serif text-2xl font-bold text-white">
            {tab === "privacy"
              ? "Data Protection & Privacy Policy"
              : "Terms & Conditions of Service"}
          </DialogTitle>
          <DialogDescription className="text-xs text-white/60">
            Compliant with Kenya Data Protection Act 2019 and global student privacy standards.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1 text-xs sm:text-sm text-white/80 leading-relaxed">
          {tab === "privacy" ? (
            <>
              <div className="space-y-2">
                <h3 className="font-semibold text-white text-sm">
                  1. Commitment to Student Privacy
                </h3>
                <p>
                  GilaniAI is dedicated to protecting student data. We never sell student
                  information or study inputs to third parties or advertising networks.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-white text-sm">2. Information Handled</h3>
                <ul className="list-disc pl-5 space-y-1 text-white/70">
                  <li>
                    <strong>Account Data:</strong> Name, email address, school/institution, and
                    curriculum preferences.
                  </li>
                  <li>
                    <strong>Academic Inputs:</strong> Notes and PDFs uploaded for explanation,
                    homework queries, and quiz responses.
                  </li>
                  <li>
                    <strong>Progress Analytics:</strong> Topics mastered, strengths, and study
                    planner deadlines.
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-white text-sm">3. Security & Retention</h3>
                <p>
                  All credentials and content transfers are encrypted end-to-end via TLS 1.3 and
                  stored in SOC2-compliant infrastructure with strict row-level database security.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <h3 className="font-semibold text-white text-sm">
                  1. Academic Integrity & Acceptable Use
                </h3>
                <p>
                  GilaniAI is designed as an educational assistant and study tutor. You agree to use
                  the platform to understand concepts and improve problem-solving skills rather than
                  for academic dishonesty or direct examination cheating.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-white text-sm">2. Account Usage</h3>
                <p>
                  Each student account is for individual personal use. You are responsible for
                  safeguarding your login credentials.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-white text-sm">3. Availability & Mentorship</h3>
                <p>
                  We aim for continuous service availability. Human teacher escalation queues
                  operate in accordance with educator schedules and platform demand.
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
