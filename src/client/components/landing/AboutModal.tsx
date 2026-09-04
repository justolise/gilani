import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/client/components/ui/dialog";
import { GraduationCap, ShieldCheck, Users, Sparkles, MapPin } from "lucide-react";

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutModal({ open, onOpenChange }: AboutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85dvh] overflow-hidden flex flex-col border-white/10 bg-[#121214]/98 backdrop-blur-2xl p-5 sm:p-7 text-white rounded-2xl shadow-2xl">
        <DialogHeader className="text-left space-y-1.5 shrink-0 pb-3 border-b border-white/10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C96A3D]/30 bg-[#C96A3D]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#E28743] w-fit">
            <GraduationCap className="h-3.5 w-3.5" />
            Our Mission
          </div>
          <DialogTitle className="font-serif text-2xl sm:text-3xl font-bold text-white">
            About GilaniAI
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-white/60">
            Empowering students with genuine understanding, ethical AI, and human mentorship.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1 text-xs sm:text-sm text-white/80 leading-relaxed">
          <p>
            GilaniAI was founded in Nairobi, Kenya with a clear purpose:{" "}
            <strong className="text-white">
              students don't need another generic chatbot that spits out answers
            </strong>
            . They need a patient, intelligent tutor that teaches them how to think.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Sparkles className="h-4 w-4 text-[#E28743]" />
                Socratic First-Principles
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                We break complex mathematical, scientific, and technical problems into intuitive,
                digestible steps.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck className="h-4 w-4 text-[#E28743]" />
                Zero Hallucination
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Grounded in syllabus guidelines and your uploaded notes, backed by real-time
                verified research.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Users className="h-4 w-4 text-[#E28743]" />
                Human Teacher Escalation
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                When you need human intuition, real educators are available on-demand directly in
                your study thread.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <MapPin className="h-4 w-4 text-[#E28743]" />
                Rooted in Nairobi 🇰🇪
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Engineered to deeply understand KCSE, CBC, TVET, College, and University academic
                environments.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
