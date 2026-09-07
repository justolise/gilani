import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { Button } from "@/client/components/ui/button";

interface HeroProps {
  onOpenDemo?: () => void;
  onOpenFeatures?: () => void;
}

export default function Hero({ onOpenDemo, onOpenFeatures }: HeroProps) {
  return (
    <section className="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-y-auto overflow-x-hidden scrollbar-none px-4 sm:px-8 py-3 xs:py-5 sm:py-6 pl-[max(1rem,var(--safe-left,0px))] pr-[max(1rem,var(--safe-right,0px))]">
      {/* Ambient background glow & grid */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[360px] sm:w-[600px] h-[360px] sm:h-[600px] bg-[#C96A3D]/20 blur-[100px] sm:blur-[160px] rounded-full mix-blend-screen opacity-75 motion-safe:animate-pulse [animation-duration:9s]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[320px] sm:w-[580px] h-[320px] sm:h-[580px] bg-[#E28743]/15 blur-[120px] sm:blur-[170px] rounded-full mix-blend-screen opacity-65"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-60"></div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-8 lg:gap-14 h-full">
        {/* Left Column: Core Value & CTAs */}
        <div className="flex flex-1 flex-col items-center lg:items-start text-center lg:text-left justify-evenly lg:justify-center h-full max-w-2xl mx-auto lg:mx-0 lg:gap-6">
          {/* Live Status Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C96A3D]/35 bg-[#C96A3D]/10 px-3.5 py-1.5 sm:px-4 sm:py-1.5 text-xs font-bold uppercase tracking-wider text-[#E28743] backdrop-blur-md shadow-[0_0_20px_rgba(201,106,61,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C96A3D] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E28743]"></span>
            </span>
            <span>Live · KCSE · TVET · College · University</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.14]">
            Ace your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C96A3D] via-[#E28743] to-[#F59E0B]">
              Exams
            </span>
            ,<br className="hidden sm:inline" /> one question at a time.
          </h1>

          {/* Subheading */}
          <p className="text-xs xs:text-sm sm:text-lg text-white/80 max-w-lg sm:max-w-xl font-normal leading-relaxed">
            GilaniAI doesn't just hand you answers — it teaches you how to solve them step-by-step,{" "}
            <span className="text-white font-semibold">
              with zero hallucination and real teacher escalation.
            </span>
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full">
            <Button
              asChild
              className="rounded-full bg-[#C96A3D] px-6 xs:px-8 sm:px-10 py-3 sm:py-4 h-12 sm:h-14 text-sm xs:text-base sm:text-lg font-bold text-white hover:bg-[#E28743] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-[0_0_30px_rgba(201,106,61,0.35)] hover:shadow-[0_0_40px_rgba(201,106,61,0.5)] group cursor-pointer"
            >
              <Link to="/login" search={{ redirect: undefined, signout: undefined }}>
                <span>Start for Free</span>
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onOpenDemo}
              className="rounded-full border-white/15 bg-white/[0.07] hover:bg-white/[0.12] hover:border-white/25 px-5 xs:px-7 sm:px-9 py-3 sm:py-4 h-12 sm:h-14 text-xs xs:text-sm sm:text-lg font-semibold text-white backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Play className="h-4 w-4 text-[#E28743] fill-[#E28743]" />
              <span>Watch Demo</span>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#E28743]" />
              Free to start
            </span>
            <span className="text-white/30">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#E28743]" />
              Zero hallucination
            </span>
            <span className="text-white/30">·</span>
            <span className="hidden xs:inline">Teacher escalation built-in</span>
          </div>

          {/* Mobile Curriculum Pills */}
          <div className="flex lg:hidden flex-wrap items-center justify-center gap-2 text-xs text-white/80">
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">∑ Math</span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">
              🧪 Sciences
            </span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">
              ⚡ TVET
            </span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">
              🏛️ Humanities
            </span>
          </div>
        </div>

        {/* Right Column: Socratic Tutor Preview Showcase (Desktop & Tablet) */}
        <div className="hidden lg:flex flex-1 items-center justify-center max-w-lg xl:max-w-xl">
          <div className="relative w-full rounded-2xl border border-white/[0.08] bg-[#131722]/85 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(201,106,61,0.25)] p-6 overflow-hidden group hover:border-[#C96A3D]/30 transition-colors duration-300">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/80"></div>
                </div>
                <span className="text-xs font-mono text-white/40 ml-2">gilaniai.site/tutor</span>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E28743] bg-[#C96A3D]/10 border border-[#C96A3D]/20 px-2.5 py-0.5 rounded-full">
                Socratic Mode
              </span>
            </div>

            {/* Conversation Flow */}
            <div className="mt-4 space-y-3.5 text-xs sm:text-sm">
              {/* Student message */}
              <div className="flex justify-end">
                <div className="rounded-2xl rounded-tr-sm bg-[#C96A3D] px-4 py-2.5 text-white font-medium max-w-[85%] shadow-sm">
                  How does Ohm's law apply to TVET electrical circuits in parallel?
                </div>
              </div>

              {/* Socratic AI Tutor Response */}
              <div className="flex gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#C96A3D]/20 border border-[#C96A3D]/30 text-xs font-bold text-[#E28743]">
                  G
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-[#0f1117] border border-white/[0.08] p-3.5 text-white/85 space-y-2 max-w-[90%]">
                  <p>
                    In a parallel circuit, remember the fundamental rule:{" "}
                    <span className="text-white font-semibold">
                      voltage is constant across every branch
                    </span>
                    :
                  </p>
                  <div className="font-mono text-xs text-[#E28743] bg-black/40 p-2.5 rounded-lg border border-white/5">
                    V_total = V₁ = V₂ = V_n
                  </div>
                  <p className="text-white font-medium">
                    If branch 1 has resistor R₁ = 10Ω and branch 2 has R₂ = 20Ω connected to 240V
                    mains, how much current flows through branch 1?
                  </p>
                </div>
              </div>

              {/* Student response */}
              <div className="flex justify-end">
                <div className="rounded-2xl rounded-tr-sm bg-[#C96A3D] px-3.5 py-2 text-white font-medium text-xs shadow-sm">
                  I₁ = V / R₁ = 240 / 10 = 24 Amperes!
                </div>
              </div>

              {/* AI validation */}
              <div className="flex gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#C96A3D]/20 border border-[#C96A3D]/30 text-xs font-bold text-[#E28743]">
                  G
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-200 text-xs font-medium">
                  ✓ Exactly correct. Each parallel path draws current independently based on its
                  branch resistance.
                </div>
              </div>
            </div>

            {/* Bottom action trigger */}
            <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-xs text-white/50">Verified curriculum citations included</span>
              <button
                type="button"
                onClick={onOpenDemo}
                className="text-xs font-bold text-[#E28743] hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <span>Try interactive simulator</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
