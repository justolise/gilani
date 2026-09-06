import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Camera,
  BookOpen,
  Brain,
  Calendar,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export const GUIDE_COMPLETED_KEY = "gilani_guide_tour_completed";

export function openAppGuide() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-app-guide"));
  }
}

interface GuideStep {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  tip: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgColor: string;
  borderColor: string;
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: "tutor",
    badge: "Step 1 of 6 · Core Feature",
    title: "Your Socratic AI Study Companion",
    subtitle: "Learn step-by-step without getting answers spoiled",
    description:
      "Ask any question across your curriculum (KCSE, CBC, Cambridge IGCSE, TVET, College). GilaniAI guides your reasoning with hints and real-world analogies rather than just handing you the answer.",
    tip: "Tip: Type 'Guide me through this question' or choose a quick prompt to begin.",
    icon: GraduationCap,
    accentColor: "text-amber-500 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
  },
  {
    id: "multimodal",
    badge: "Step 2 of 6 · Multimodal Study",
    title: "Homework Camera, Files & Voice",
    subtitle: "Snap textbook problems or study hands-free",
    description:
      "Take a quick photo of handwritten math equations, upload past paper PDFs, or tap the microphone to dictate your question. Text and equations are automatically extracted with high precision.",
    tip: "Tip: Tap the '+' button next to the chat bar to attach images, documents, or start voice input.",
    icon: Camera,
    accentColor: "text-emerald-500 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
  {
    id: "curriculum",
    badge: "Step 3 of 6 · Curriculum Accurate",
    title: "Subjects Grounded in Your Syllabus",
    subtitle: "Math, Sciences, Languages & Humanities",
    description:
      "Quickly select your current subject from the top bar. All explanations strictly adhere to verified syllabus guidelines and official exam marking schemes so you prepare accurately.",
    tip: "Tip: Tap any subject pill on the home screen to launch a targeted revision session.",
    icon: BookOpen,
    accentColor: "text-primary dark:text-[#E28743]",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
  },
  {
    id: "quizzes",
    badge: "Step 4 of 6 · Active Recall",
    title: "Instant Revision Quizzes",
    subtitle: "Test your mastery before exam day",
    description:
      "Generate custom 5-to-10 question quizzes on any topic. Review full explanations for each question and track where you need more practice.",
    tip: "Tip: Access 'Quizzes' directly from the bottom navigation bar on your phone.",
    icon: Brain,
    accentColor: "text-sky-500 dark:text-sky-400",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/20",
  },
  {
    id: "planner",
    badge: "Step 5 of 6 · Time Management",
    title: "Smart Daily Study Planner",
    subtitle: "Stay consistent and never fall behind",
    description:
      "Create personalized daily study schedules that break down big exam revision targets into manageable 30-minute blocks with built-in revision timers.",
    tip: "Tip: Both students and parents can review daily progress to celebrate study milestones.",
    icon: Calendar,
    accentColor: "text-indigo-500 dark:text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
  },
  {
    id: "safety",
    badge: "Step 6 of 6 · Safety & Trust",
    title: "100% Safe with Real Human Teachers",
    subtitle: "Encrypted, ad-free, and verified learning",
    description:
      "If a concept is still difficult to grasp, escalate directly to verified human teachers for review. GilaniAI is completely ad-free, encrypted, and designed for safe student and parent use.",
    tip: "Tip: Look for 'Escalate to Teacher' in chat whenever you need human feedback.",
    icon: ShieldCheck,
    accentColor: "text-emerald-500 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
];

interface AppGuideModalProps {
  autoOpenIfNew?: boolean;
}

export function AppGuideModal({ autoOpenIfNew = true }: AppGuideModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Check if user has completed tour
    if (autoOpenIfNew && typeof window !== "undefined") {
      const completed = localStorage.getItem(GUIDE_COMPLETED_KEY);
      if (!completed) {
        // Delay slightly for smooth page entry
        const timer = setTimeout(() => setIsOpen(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [autoOpenIfNew]);

  useEffect(() => {
    const handleOpen = () => {
      setCurrentStepIndex(0);
      setIsOpen(true);
    };

    window.addEventListener("open-app-guide", handleOpen);
    return () => window.removeEventListener("open-app-guide", handleOpen);
  }, []);

  const handleClose = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(GUIDE_COMPLETED_KEY, "true");
    }
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStepIndex < GUIDE_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  const currentStep = GUIDE_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === GUIDE_STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-card/95 p-5 sm:p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top bar with badge and close */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/40">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary">
            <Sparkles className="h-3 w-3" />
            <span>{currentStep.badge}</span>
          </div>

          <button
            onClick={handleClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted/80 hover:text-foreground active:scale-90 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close guide"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body with smooth step transition */}
        <div className="py-5 overflow-y-auto flex-1 min-h-0 space-y-4">
          {/* Feature Highlight Banner */}
          <div
            className={`flex items-center gap-4 rounded-2xl border ${currentStep.borderColor} ${currentStep.bgColor} p-4 transition-colors duration-300`}
          >
            <div
              className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-background/80 shadow-sm ${currentStep.accentColor}`}
            >
              <StepIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                id="guide-modal-title"
                className="text-base sm:text-lg font-bold text-foreground leading-snug"
              >
                {currentStep.title}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-0.5 leading-snug">
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed">
            {currentStep.description}
          </p>

          {/* Pro-Tip Box */}
          <div className="rounded-xl border border-primary/15 bg-primary/5 px-3.5 py-2.5 text-xs text-foreground/80 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{currentStep.tip}</span>
          </div>
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-center gap-1.5 py-2">
          {GUIDE_STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStepIndex
                  ? "w-7 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Jump to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/40 mt-1">
          <button
            onClick={handlePrev}
            disabled={isFirstStep}
            className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition-all min-h-[44px] ${
              isFirstStep
                ? "text-muted-foreground/40 cursor-not-allowed opacity-40"
                : "text-foreground hover:bg-muted active:scale-95 cursor-pointer"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all min-h-[44px] cursor-pointer"
            >
              Skip
            </button>

            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all shadow-md min-h-[44px] cursor-pointer"
            >
              <span>{isLastStep ? "Start Learning" : "Next"}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
