import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { Button } from "@/client/components/ui/button";

interface HeroProps {
  onOpenDemo?: () => void;
  onOpenFeatures?: () => void;
}

export default function Hero({ onOpenDemo, onOpenFeatures }: HeroProps) {
  return (
    <section className="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden px-4 sm:px-6 py-2 sm:py-4">
      {/* Ambient background glow & grid */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] bg-[#C96A3D]/20 blur-[90px] sm:blur-[130px] rounded-full mix-blend-screen opacity-60 motion-safe:animate-pulse [animation-duration:8s]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] sm:w-[550px] h-[300px] sm:h-[550px] bg-[#C96A3D]/10 blur-[100px] sm:blur-[150px] rounded-full mix-blend-screen opacity-50"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] opacity-50"></div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-8 lg:gap-12 h-full">
        {/* Left Column: Core Value & CTAs */}
        <div className="flex flex-1 flex-col items-center lg:items-start text-center lg:text-left justify-center gap-3 sm:gap-4 lg:gap-5 max-w-2xl mx-auto lg:mx-0">
          {/* Live Status Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C96A3D]/30 bg-[#C96A3D]/10 px-3 py-1 sm:px-4 sm:py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#E28743] backdrop-blur-sm shadow-[0_0_15px_rgba(201,106,61,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C96A3D] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C96A3D]"></span>
            </span>
            <span className="truncate">Live · KCSE · TVET · College · University</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12]">
            Ace your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C96A3D] via-[#E28743] to-[#F59E0B]">
              Exams
            </span>
            ,<br className="hidden sm:inline" /> one question at a time.
          </h1>

          {/* Subheading */}
          <p className="text-xs sm:text-base text-white/70 max-w-lg sm:max-w-xl font-light leading-relaxed">
            GilaniAI doesn't just hand you answers — it teaches you how to solve them step-by-step,{" "}
            <span className="text-white font-medium">
              with zero hallucination and real teacher escalation.
            </span>
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-4 mt-1">
            <Button
              asChild
              className="rounded-full bg-[#C96A3D] px-6 sm:px-8 py-2.5 sm:py-3.5 text-sm sm:text-base font-bold text-white hover:bg-[#E28743] hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(201,106,61,0.4)] group"
            >
              <Link to="/login" search={{ redirect: undefined, signout: undefined }}>
                <span>Start for Free</span>
                <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onOpenDemo}
              className="rounded-full border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 px-5 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Play className="h-3.5 w-3.5 text-[#E28743] fill-[#E28743]" />
              <span>Watch Demo</span>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1 sm:pt-2 text-[11px] sm:text-xs text-white/50">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#E28743]" />
              Free to start
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-[#E28743]" />
              Zero hallucination
            </span>
            <span>·</span>
            <span className="hidden xs:inline">Teacher escalation built-in</span>
          </div>

          {/* Mobile Curriculum Pills */}
          <div className="flex lg:hidden flex-wrap items-center justify-center gap-1.5 pt-1 text-[10px] text-white/60">
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">∑ Math</span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">
              🧪 Sciences
            </span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">
              ⚡ TVET
            </span>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">
              🏛️ Humanities
            </span>
          </div>
        </div>

        {/* Right Column: Interactive Tutor Preview Showcase (Desktop & Large Tablet) */}
        <div className="hidden lg:flex flex-1 items-center justify-center max-w-lg xl:max-w-xl">
          <div className="relative w-full rounded-2xl border border-white/15 bg-[#141414]/90 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(201,106,61,0.3)] p-5 overflow-hidden group">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/80"></div>
                </div>
                <span className="text-[11px] font-mono text-white/40 ml-2">
                  gilaniai.site/tutor
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E28743] bg-[#C96A3D]/10 border border-[#C96A3D]/20 px-2 py-0.5 rounded-full">
                Socratic Mode
              </span>
            </div>

            {/* Conversation Flow */}
            <div className="mt-4 space-y-3 text-xs">
              {/* Student message */}
              <div className="flex justify-end">
                <div className="rounded-2xl rounded-tr-sm bg-[#C96A3D] px-3.5 py-2 text-white font-medium max-w-[85%] shadow-sm">
                  How does Ohm's law apply to TVET electrical circuits in parallel?
                </div>
              </div>

              {/* Socratic AI Tutor Response */}
              <div className="flex gap-2.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#C96A3D]/20 border border-[#C96A3D]/30 text-[10px] font-bold text-[#E28743]">
                  G
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 p-3 text-white/80 space-y-1.5 max-w-[90%]">
                  <p>
                    In a parallel circuit, remember the fundamental rule:{" "}
                    <span className="text-white font-medium">
                      voltage is constant across every branch
                    </span>
                    :
                  </p>
                  <div className="font-mono text-[11px] text-[#E28743] bg-black/40 p-2 rounded-lg border border-white/5">
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
                <div className="rounded-2xl rounded-tr-sm bg-[#C96A3D] px-3 py-1.5 text-white font-medium text-xs shadow-sm">
                  I₁ = V / R₁ = 240 / 10 = 24 Amperes!
                </div>
              </div>

              {/* AI validation */}
              <div className="flex gap-2.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#C96A3D]/20 border border-[#C96A3D]/30 text-[10px] font-bold text-[#E28743]">
                  G
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-emerald-200 text-xs">
                  ✓ Exactly correct. Each parallel path draws current independently based on its
                  branch resistance.
                </div>
              </div>
            </div>

            {/* Bottom action trigger */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-white/50">
                Verified curriculum citations included
              </span>
              <button
                type="button"
                onClick={onOpenDemo}
                className="text-[11px] font-semibold text-[#E28743] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Try interactive simulator</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
