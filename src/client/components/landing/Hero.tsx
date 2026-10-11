import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, Play, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/client/components/ui/button";

interface HeroProps {
  onOpenDemo?: () => void;
  onOpenFeatures?: () => void;
}

export default function Hero({ onOpenDemo, onOpenFeatures }: HeroProps) {
  return (
    <section className="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-y-auto overflow-x-hidden scrollbar-none px-4 sm:px-8 py-4 sm:py-6 pl-[max(1rem,var(--safe-left,0px))] pr-[max(1rem,var(--safe-right,0px))]">
      {/* Ambient background glow & grid */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Primary warm glow */}
        <div className="absolute top-1/4 left-1/4 w-[400px] sm:w-[650px] h-[400px] sm:h-[650px] bg-[#d4754a]/18 blur-[110px] sm:blur-[170px] rounded-full mix-blend-screen opacity-80 motion-safe:animate-pulse [animation-duration:9s]" />
        {/* Secondary warm accent */}
        <div className="absolute bottom-1/4 right-1/4 w-[320px] sm:w-[580px] h-[320px] sm:h-[580px] bg-[#e8924a]/12 blur-[130px] sm:blur-[180px] rounded-full mix-blend-screen opacity-60" />
        {/* Subtle blue-purple accent for depth */}
        <div className="absolute top-2/3 left-2/3 w-[200px] sm:w-[360px] h-[200px] sm:h-[360px] bg-indigo-600/8 blur-[100px] rounded-full mix-blend-screen opacity-40" />
        {/* Dot grid overlay */}
        <div className="absolute inset-0 grid-dots opacity-70" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-8 lg:gap-16 h-full">
        {/* Left Column: Core Value & CTAs */}
        <div className="flex flex-1 flex-col items-center lg:items-start text-center lg:text-left justify-evenly lg:justify-center h-full max-w-2xl mx-auto lg:mx-0 lg:gap-5">
          {/* Live Status Pill */}
          <div className="badge-terracotta shadow-[0_0_24px_rgba(201,106,61,0.2)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4754a] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#e8924a]" />
            </span>
            <span>Live · KCSE · TVET · College · University</span>
          </div>

          {/* Main Headline */}
          <h1 className="heading-display-lg text-3xl xs:text-4xl sm:text-6xl lg:text-7xl text-white">
            Ace your{" "}
            <span className="relative inline-block">
              <span className="text-gradient-brand">Exams</span>
            </span>
            ,<br className="hidden sm:inline" /> one question{" "}
            <span className="text-white/60">at a time.</span>
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-lg text-white/65 max-w-lg sm:max-w-xl font-normal leading-relaxed">
            GilaniAI doesn't just hand you answers — it teaches you how to solve them step-by-step,{" "}
            <span className="text-white/90 font-medium">
              with real teacher escalation and zero hallucination.
            </span>
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full">
            <Button
              asChild
              className="rounded-full bg-[#d4754a] px-7 xs:px-9 sm:px-11 py-3 sm:py-4 h-12 sm:h-14 text-sm xs:text-base sm:text-lg font-bold text-white hover:bg-[#e8924a] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-[0_6px_32px_rgba(212,117,74,0.4)] hover:shadow-[0_8px_42px_rgba(212,117,74,0.55)] group cursor-pointer btn-glow-pulse"
            >
              <Link to="/login" search={{ redirect: undefined, signout: undefined }}>
                <span>Start for Free</span>
                <ArrowRight className="ml-1 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onOpenDemo}
              className="rounded-full border-white/[0.12] bg-white/[0.05] hover:bg-white/[0.1] hover:border-white/[0.2] px-6 xs:px-8 sm:px-10 py-3 sm:py-4 h-12 sm:h-14 text-sm sm:text-lg font-semibold text-white backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2.5 shadow-lg cursor-pointer"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#d4754a]/20 border border-[#d4754a]/30 flex items-center justify-center">
                <Play className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#e8924a] fill-[#e8924a] ml-0.5" />
              </div>
              <span>Watch Demo</span>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-5 text-xs sm:text-sm text-white/50">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
              Free to start
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#e8924a]" />
              Zero hallucination
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20 hidden xs:block" />
            <span className="hidden xs:inline text-white/40">Teacher escalation built-in</span>
          </div>

          {/* Mobile Curriculum Pills */}
          <div className="flex lg:hidden flex-wrap items-center justify-center gap-2 text-xs text-white/70">
            {[
              { emoji: "∑", label: "Maths" },
              { emoji: "🧪", label: "Sciences" },
              { emoji: "⚡", label: "TVET" },
              { emoji: "🏛️", label: "Humanities" },
            ].map(({ emoji, label }) => (
              <span
                key={label}
                className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 font-medium"
              >
                {emoji} {label}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column: Socratic Tutor Preview Showcase (Desktop & Tablet) */}
        <div className="hidden lg:flex flex-1 items-center justify-center max-w-lg xl:max-w-xl">
          <div className="relative w-full rounded-2xl border border-white/[0.07] bg-[#10141f]/90 backdrop-blur-2xl shadow-[0_24px_80px_-16px_rgba(212,117,74,0.22),0_0_0_1px_rgba(255,255,255,0.04)] p-5 xl:p-6 overflow-hidden group hover:border-[#d4754a]/25 transition-all duration-500 card-shine">
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4754a]/50 to-transparent" />

            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/70" />
                </div>
                <span className="text-xs font-mono text-white/30 ml-1">gilaniai.site/tutor</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#e8924a] bg-[#d4754a]/10 border border-[#d4754a]/20 px-2.5 py-0.5 rounded-full">
                Socratic Mode
              </span>
            </div>

            {/* Conversation Flow */}
            <div className="space-y-3.5 text-xs sm:text-sm">
              {/* Student message */}
              <div className="flex justify-end animate-in-slide [animation-delay:0.1s]">
                <div className="rounded-2xl rounded-tr-sm bg-[#d4754a] px-4 py-2.5 text-white font-medium max-w-[85%] shadow-sm leading-relaxed">
                  How does Ohm's law apply to TVET electrical circuits in parallel?
                </div>
              </div>

              {/* Socratic AI Tutor Response */}
              <div className="flex gap-2.5 animate-in-slide [animation-delay:0.2s]">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#d4754a]/20 border border-[#d4754a]/30 text-xs font-bold text-[#e8924a]">
                  G
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-[#0f1117]/90 border border-white/[0.07] p-3.5 text-white/80 space-y-2 max-w-[90%] leading-relaxed">
                  <p>
                    In a parallel circuit, the fundamental rule is:{" "}
                    <span className="text-white font-semibold">
                      voltage is constant across every branch
                    </span>
                    :
                  </p>
                  <div className="font-mono text-xs text-[#e8924a] bg-black/50 p-2.5 rounded-lg border border-white/[0.05]">
                    V_total = V₁ = V₂ = V_n
                  </div>
                  <p className="text-white/90 font-medium text-xs">
                    If R₁ = 10Ω and R₂ = 20Ω connected to 240V mains, what current flows through
                    branch 1?
                  </p>
                </div>
              </div>

              {/* Student response */}
              <div className="flex justify-end animate-in-slide [animation-delay:0.3s]">
                <div className="rounded-2xl rounded-tr-sm bg-[#d4754a] px-3.5 py-2 text-white font-medium text-xs shadow-sm">
                  I₁ = V / R₁ = 240 / 10 = 24 Amperes!
                </div>
              </div>

              {/* AI validation */}
              <div className="flex gap-2.5 animate-in-slide [animation-delay:0.4s]">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#d4754a]/20 border border-[#d4754a]/30 text-xs font-bold text-[#e8924a]">
                  G
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-emerald-500/[0.08] border border-emerald-500/[0.15] p-3 text-emerald-300/90 text-xs font-medium leading-relaxed">
                  ✓ Exactly correct. Each parallel path draws current independently based on its
                  branch resistance.
                </div>
              </div>
            </div>

            {/* Bottom action trigger */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-white/35">Verified curriculum citations included</span>
              <button
                type="button"
                onClick={onOpenDemo}
                className="text-xs font-semibold text-[#e8924a] hover:text-[#d4754a] flex items-center gap-1.5 cursor-pointer group/btn transition-colors"
              >
                <span>Try interactive demo</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
