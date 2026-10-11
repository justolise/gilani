import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/client/components/ui/dialog";
import { Link } from "@tanstack/react-router";
import { Button } from "@/client/components/ui/button";
import { ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: "📄",
    title: "Upload Notes",
    desc: "Upload PDFs of your class notes or textbooks and get instant, curriculum-matched explanations.",
    badge: "Notes & PDFs",
    accentColor: "from-[#d4754a]/15 to-transparent",
    borderColor: "border-[#d4754a]/15",
  },
  {
    icon: "🧮",
    title: "Step-by-Step Problem Solving",
    desc: "Full pedagogical reasoning, not just the final answer — so you can reproduce it in your exams.",
    badge: "Socratic Steps",
    accentColor: "from-amber-500/15 to-transparent",
    borderColor: "border-amber-500/15",
  },
  {
    icon: "🎤",
    title: "Voice Tutor",
    desc: "Ask questions out loud while studying, without breaking your flow to type every equation.",
    badge: "Hands-free",
    accentColor: "from-blue-500/15 to-transparent",
    borderColor: "border-blue-500/15",
  },
  {
    icon: "📷",
    title: "Scan Past Papers & Questions",
    desc: "Photograph problems directly from past papers and receive immediate concept breakdowns.",
    badge: "Camera & OCR",
    accentColor: "from-emerald-500/15 to-transparent",
    borderColor: "border-emerald-500/15",
  },
  {
    icon: "📝",
    title: "Academic Writing & Research",
    desc: "Feedback on thesis statements, structure, and citations (APA/IEEE/Harvard) — designed to sharpen your intellect.",
    badge: "Writing & Citations",
    accentColor: "from-purple-500/15 to-transparent",
    borderColor: "border-purple-500/15",
  },
  {
    icon: "📚",
    title: "Curriculum Quizzes & Plans",
    desc: "Adaptive quizzes tracking weak topics with customized revision schedules built around your exam dates.",
    badge: "Smart Revision",
    accentColor: "from-pink-500/15 to-transparent",
    borderColor: "border-pink-500/15",
  },
];

interface FeaturesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeaturesModal({ open, onOpenChange }: FeaturesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[88dvh] overflow-y-auto border border-white/[0.07] bg-[#10141f]/97 backdrop-blur-2xl p-6 sm:p-8 text-white rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.8)]">
        <DialogHeader className="text-left space-y-3">
          <div className="badge-terracotta w-fit">Built for Academic Excellence</div>
          <DialogTitle className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Everything you need to <span className="text-gradient-brand">study smarter</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-white/45 leading-relaxed">
            Tailored for KCSE, CBC, TVET, College diploma, and University students with zero
            hallucination and real teacher escalation.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              className={`group relative rounded-xl border ${feat.borderColor} bg-gradient-to-br ${feat.accentColor} bg-white/[0.02] p-4 hover:bg-white/[0.05] transition-all duration-200 flex flex-col justify-between card-hover-lift`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.07] text-xl group-hover:scale-110 transition-transform duration-200">
                  {feat.icon}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/35 bg-white/[0.05] px-2 py-0.5 rounded-full mt-0.5">
                  {feat.badge}
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                  {feat.title}
                </h3>
                <p className="mt-1 text-xs text-white/40 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.07] pt-5">
          <p className="text-xs text-white/35 text-center sm:text-left">
            Free forever to start · No credit card required
          </p>
          <Button
            asChild
            className="w-full sm:w-auto rounded-full bg-[#d4754a] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#e8924a] transition-all shadow-[0_4px_20px_rgba(212,117,74,0.35)] hover:scale-[1.02]"
          >
            <Link
              to="/login"
              search={{ redirect: undefined, signout: undefined }}
              onClick={() => onOpenChange(false)}
            >
              Get Started Now
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
