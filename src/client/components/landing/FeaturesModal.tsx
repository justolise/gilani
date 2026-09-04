import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/client/components/ui/dialog";
import { Link } from "@tanstack/react-router";
import { Button } from "@/client/components/ui/button";

const FEATURES = [
  {
    icon: "📄",
    title: "Upload Notes",
    desc: "Upload PDFs of your class notes or textbooks and get instant, curriculum-matched explanations.",
    badge: "Notes & PDFs",
    glow: "from-[#C96A3D]/20 to-transparent",
  },
  {
    icon: "🧮",
    title: "Step-by-Step Problem Solving",
    desc: "Full pedagogical reasoning, not just the final answer — so you can reproduce it in your KCSE, TVET, College, or University exams.",
    badge: "Socratic Steps",
    glow: "from-[#E28743]/20 to-transparent",
  },
  {
    icon: "🎤",
    title: "Voice Tutor",
    desc: "Ask questions out loud while studying, without breaking your flow to type every equation.",
    badge: "Hands-free",
    glow: "from-blue-500/20 to-transparent",
  },
  {
    icon: "📷",
    title: "Scan Past Papers & Questions",
    desc: "Photograph problems directly from past papers or revision books and receive immediate concept breakdowns.",
    badge: "Camera & OCR",
    glow: "from-emerald-500/20 to-transparent",
  },
  {
    icon: "📝",
    title: "Academic Writing & Research",
    desc: "Feedback on thesis statements, structure, and citations (APA/IEEE/Harvard) — designed to sharpen your intellect, not ghostwrite.",
    badge: "Writing & Citations",
    glow: "from-purple-500/20 to-transparent",
  },
  {
    icon: "📚",
    title: "Curriculum Quizzes & Plans",
    desc: "Adaptive quizzes tracking weak topics with customized revision schedules built around your exam dates.",
    badge: "Smart Revision",
    glow: "from-pink-500/20 to-transparent",
  },
];

interface FeaturesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeaturesModal({ open, onOpenChange }: FeaturesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85dvh] overflow-y-auto border-white/10 bg-[#141414]/95 backdrop-blur-2xl p-6 sm:p-8 text-white rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.8)]">
        <DialogHeader className="text-left space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C96A3D]/30 bg-[#C96A3D]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#E28743] w-fit">
            Built for Academic Excellence
          </div>
          <DialogTitle className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Everything you need to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C96A3D] to-[#E28743]">
              study smarter
            </span>
          </DialogTitle>
          <DialogDescription className="text-sm text-white/60">
            Tailored for KCSE, CBC, TVET, College diploma, and University students with zero
            hallucination and real teacher escalation.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="group relative rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-xl group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                  {feat.badge}
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-white group-hover:text-[#E28743] transition-colors">
                  {feat.title}
                </h3>
                <p className="mt-1 text-xs text-white/60 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-4">
          <p className="text-xs text-white/50 text-center sm:text-left">
            Free forever to start · No credit card required
          </p>
          <Button
            asChild
            className="w-full sm:w-auto rounded-full bg-[#C96A3D] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#E28743] transition-all shadow-[0_0_20px_rgba(201,106,61,0.3)]"
          >
            <Link
              to="/login"
              search={{ redirect: undefined, signout: undefined }}
              onClick={() => onOpenChange(false)}
            >
              Get Started Now
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
