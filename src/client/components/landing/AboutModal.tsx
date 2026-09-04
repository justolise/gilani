import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/client/components/ui/dialog";
import { GraduationCap, ShieldCheck, Users, Zap, Brain, Target, Sparkles } from "lucide-react";

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AGENTS = [
  {
    name: "Guardian",
    role: "Socratic Curriculum Engine",
    icon: Brain,
    description:
      "Grounded in your syllabus and uploaded materials. Guides you through first-principles reasoning step-by-step with zero hallucination.",
    accent: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    name: "Scout",
    role: "Study Momentum & Planning",
    icon: Target,
    description:
      "Tracks exam countdowns, builds adaptive revision timelines, and keeps your study rhythm steady leading up to exam day.",
    accent: "text-[#E28743] bg-[#C96A3D]/10 border-[#C96A3D]/20",
  },
  {
    name: "Hunter",
    role: "Teacher Escalation & Safety",
    icon: ShieldCheck,
    description:
      "Monitors confidence levels. Whenever an answer is complex or requires human judgment, Hunter routes your thread to a vetted educator.",
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
];

const VALUES = [
  {
    icon: GraduationCap,
    title: "Curriculum-First",
    desc: "Works natively with KCSE, CBC, TVET technical diploma, College, University degrees, and International curricula (IGCSE / IB).",
  },
  {
    icon: Users,
    title: "Human Teachers in the Loop",
    desc: "AI is a companion, not a replacement. One tap escalates any query to human educators for verified review.",
  },
  {
    icon: Zap,
    title: "Honest, Rigorous AI",
    desc: "Surfaces uncertainty instead of guessing. Provides verified textbook citations and step-by-step working.",
  },
];

export function AboutModal({ open, onOpenChange }: AboutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85dvh] overflow-hidden flex flex-col border-white/10 bg-[#121214]/98 backdrop-blur-2xl p-5 sm:p-7 text-white rounded-2xl shadow-2xl">
        <DialogHeader className="text-left space-y-1.5 shrink-0 pb-3 border-b border-white/10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C96A3D]/30 bg-[#C96A3D]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#E28743] w-fit">
            <Sparkles className="h-3.5 w-3.5" />
            Our Vision & Architecture
          </div>
          <DialogTitle className="font-serif text-2xl sm:text-3xl font-bold text-white">
            A Learning Companion, <span className="text-[#E28743] italic">Not a Replacement.</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-white/60">
            Founded in Nairobi, Kenya to provide research-backed, ethical AI tutoring across all
            academic levels.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-5 pr-2 text-xs sm:text-sm text-white/80 leading-relaxed">
          <p>
            GilaniAI combines curriculum-grounded artificial intelligence, Socratic questioning, and
            human teacher oversight to help students across any curriculum study more effectively
            and ethically.
          </p>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
              Three-Tier Intelligent System
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {AGENTS.map((agent) => {
                const Icon = agent.icon;
                return (
                  <div
                    key={agent.name}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-white text-sm">{agent.name}</span>
                        <div className={`p-1.5 rounded-lg border ${agent.accent}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-[#E28743] uppercase tracking-wider block mb-1.5">
                        {agent.role}
                      </span>
                      <p className="text-xs text-white/65 leading-relaxed">{agent.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
              Core Principles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {VALUES.map((val) => {
                const Icon = val.icon;
                return (
                  <div
                    key={val.title}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-1"
                  >
                    <div className="flex items-center gap-2 font-semibold text-white text-xs">
                      <Icon className="h-3.5 w-3.5 text-[#E28743]" />
                      <span>{val.title}</span>
                    </div>
                    <p className="text-[11px] text-white/60 leading-relaxed">{val.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
