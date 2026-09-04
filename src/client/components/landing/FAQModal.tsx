import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/client/components/ui/dialog";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FAQS = [
  {
    q: "Does GilaniAI match my curriculum?",
    a: "Yes. Whether you are studying for 8-4-4 / KCSE, CBC, Cambridge IGCSE / A-Level, IB, TVET technical qualifications, College diplomas (KMTC, NITA), or University degrees, GilaniAI configures its depth, examples, formulas, and terminology to your exact level.",
  },
  {
    q: "Will GilaniAI just do my homework for me?",
    a: "No. GilaniAI is a pedagogical tutor. It uses Socratic questioning to walk you through the core reasoning step-by-step, ensuring you develop the intuition to solve similar problems on your own in examinations.",
  },
  {
    q: "Can I upload my class notes, past papers, or syllabus?",
    a: "Yes! You can upload PDFs of textbooks, teacher notes, or revision booklets. GilaniAI indexes them and grounds its responses directly in your actual study material with zero hallucination.",
  },
  {
    q: "What if the AI makes a mistake or I need a human teacher?",
    a: "Every conversation includes a built-in Teacher Escalation button. With one tap, your question and work are sent to our network of vetted human teachers for review.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. You can start completely free with no credit card required. Free tier includes daily AI tutoring sessions, practice questions, note uploads, and study planner features.",
  },
  {
    q: "Does it support technical calculations and formulas?",
    a: "Absolutely. GilaniAI has built-in LaTeX rendering for advanced mathematics, physics, chemical reaction balancing, and engineering formulas.",
  },
];

export function FAQModal({ open, onOpenChange }: FAQModalProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85dvh] overflow-hidden flex flex-col border-white/10 bg-[#121214]/98 backdrop-blur-2xl p-5 sm:p-7 text-white rounded-2xl shadow-2xl">
        <DialogHeader className="text-left space-y-1.5 shrink-0 pb-3 border-b border-white/10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C96A3D]/30 bg-[#C96A3D]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#E28743] w-fit">
            <HelpCircle className="h-3.5 w-3.5" />
            Knowledge Base
          </div>
          <DialogTitle className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Frequently Asked Questions
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-white/60">
            Everything you need to know about how GilaniAI works and supports your studies.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-2.5 pr-1">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-4 text-left font-semibold text-sm sm:text-base text-white hover:text-[#E28743] transition-colors"
                >
                  <span className="pr-3">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-white/50 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#E28743]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs sm:text-sm text-white/75 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
