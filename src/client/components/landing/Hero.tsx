import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { Button } from "@/client/components/ui/button";

interface HeroProps {
  onOpenDemo?: () => void;
  onOpenFeatures?: () => void;
}

export default function Hero({ onOpenDemo, onOpenFeatures }: HeroProps) {
  return (
    <section className="relative flex-1 min-h-[calc(100dvh-130px)] sm:min-h-0 w-full flex items-center justify-center overflow-hidden px-4 sm:px-8 py-6 sm:py-8">
      {/* Ambient background glow & grid */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] bg-[#C96A3D]/25 blur-[100px] sm:blur-[140px] rounded-full mix-blend-screen opacity-70 motion-safe:animate-pulse [animation-duration:8s]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[320px] sm:w-[550px] h-[320px] sm:h-[550px] bg-[#E28743]/15 blur-[110px] sm:blur-[150px] rounded-full mix-blend-screen opacity-60"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] opacity-50"></div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-8 lg:gap-14 h-full">
        {/* Left Column: Core Value & CTAs */}
        <div className="flex flex-1 flex-col items-center lg:items-start text-center lg:text-left justify-center gap-4 sm:gap-6 max-w-2xl mx-auto lg:mx-0">
          {/* Live Status Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C96A3D]/40 bg-[#C96A3D]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#E28743] backdrop-blur-md shadow-[0_0_20px_rgba(201,106,61,0.25)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C96A3D] opacity-80"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C96A3D]"></span>
            </span>
            <span>Live · KCSE · TVET · College · University</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.12]">
            Ace your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C96A3D] via-[#E28743] to-[#F59E0B]">
              Exams
            </span>
            ,<br className="hidden sm:inline" /> one question at a time.
          </h1>

          {/* Subheading */}
          <p className="text-sm xs:text-base sm:text-lg text-white/80 max-w-lg sm:max-w-xl font-light leading-relaxed">
            GilaniAI doesn't just hand you answers — it teaches you how to solve them step-by-step,{" "}
            <span className="text-white font-semibold">
              with zero hallucination and real teacher escalation.
            </span>
          </p>

          {/* Action Buttons (Extra Large & Highly Visible) */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-5 w-full pt-1">
            <Button
              asChild
              className="rounded-full bg-[#C96A3D] px-8 sm:px-10 py-4 h-13 sm:h-14 text-base sm:text-lg font-bold text-white hover:bg-[#E28743] hover:scale-105 active:scale-95 transition-all shadow-[0_0_35px_rgba(201,106,61,0.5)] group"
            >
              <Link to="/login" search={{ redirect: undefined, signout: undefined }}>
                <span>Start for Free</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onOpenDemo}
              className="rounded-full border-white/20 bg-white/10 hover:bg-white/15 hover:border-white/30 px-7 sm:px-9 py-4 h-13 sm:h-14 text-base sm:text-lg font-semibold text-white backdrop-blur-md transition-all flex items-center gap-2.5 shadow-lg"
            >
              <Play className="h-4 w-4 text-[#E28743] fill-[#E28743]" />
              <span>Watch Demo</span>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 sm:pt-2 text-xs sm:text-sm text-white/60">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#E28743]" />
              Free to start
            </span>
            <span className="text-white/30">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#E28743]" />
              Zero hallucination
            </span>
            <span className="text-white/30">·</span>
            <span className="hidden xs:inline">Teacher escalation built-in</span>
          </div>

          {/* Mobile Curriculum Pills */}
          <div className="flex lg:hidden flex-wrap items-center justify-center gap-2 pt-1 text-xs text-white/70">
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-medium">
              ∑ Mathematics
            </span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-medium">
              🧪 Sciences
            </span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-medium">
              ⚡ TVET & Engineering
            </span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-medium">
              🏛️ Humanities
            </span>
          </div>
        </div>

        {/* Right Column: Socratic Tutor Preview Showcase (Desktop & Tablet) */}
        <div className="hidden lg:flex flex-1 items-center justify-center max-w-lg xl:max-w-xl">
          <div className="relative w-full rounded-2xl border border-white/15 bg-[#141414]/90 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(201,106,61,0.3)] p-6 overflow-hidden group">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]/80"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]/80"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]/80"></div>
                </div>
                <span className="text-xs font-mono text-white/40 ml-2">gilaniai.site/tutor</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#E28743] bg-[#C96A3D]/10 border border-[#C96A3D]/20 px-2.5 py-1 rounded-full">
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
                <div className="rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 p-3.5 text-white/85 space-y-2 max-w-[90%]">
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
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
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
