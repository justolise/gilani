import React, { useEffect, useMemo, useState } from "react";
import { PedagogicalActions } from "./PedagogicalActions";
import { CurriculumSubjectBar } from "./CurriculumSubjectBar";
import { StudyContinuityCard } from "./StudyContinuityCard";
import { useContinuityData } from "./hooks/useContinuityData";
import { GraduationCap, Sparkles, ShieldCheck, HelpCircle } from "lucide-react";
import { openAppGuide } from "@/client/components/guide/AppGuideModal";

interface TutorHomeCockpitProps {
  onPromptClick: (prompt: string) => void;
  isRateLimited?: boolean;
  onUpgrade?: () => void;
  userName?: string | null;
  curriculum?: string | null;
  userId?: string | null;
  activeInput?: string;
  onInputChange?: (text: string) => void;
}

export function TutorHomeCockpit({
  onPromptClick,
  isRateLimited,
  onUpgrade,
  userName,
  curriculum,
  userId,
  activeInput,
  onInputChange,
}: TutorHomeCockpitProps) {
  const firstName = useMemo(() => {
    if (!userName) return "";
    return userName.trim().split(" ")[0];
  }, [userName]);

  const { latestThread, todayPlanTask } = useContinuityData(userId);

  // Time-of-day academic greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    return firstName ? `${timeGreeting}, ${firstName}` : timeGreeting;
  }, [firstName]);

  // Draft restoration from sessionStorage if activeInput is empty on initial mount
  useEffect(() => {
    try {
      const isNewSession =
        typeof window !== "undefined" && window.location.search.includes("new=1");
      if (isNewSession) {
        sessionStorage.removeItem("gilani_tutor_home_draft");
        return;
      }
      const savedDraft = sessionStorage.getItem("gilani_tutor_home_draft");
      if (savedDraft && (!activeInput || activeInput.trim() === "") && onInputChange) {
        onInputChange(savedDraft);
      }
    } catch {
      // Ignore storage errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save draft whenever input changes
  useEffect(() => {
    try {
      if (activeInput !== undefined) {
        if (activeInput.trim()) {
          sessionStorage.setItem("gilani_tutor_home_draft", activeInput);
        } else {
          sessionStorage.removeItem("gilani_tutor_home_draft");
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [activeInput]);

  return (
    <div className="w-full flex flex-col items-center justify-start px-4 sm:px-6 py-6 sm:py-8 gap-6 sm:gap-8 max-w-4xl mx-auto animate-in fade-in duration-300 pb-[calc(13rem+env(safe-area-inset-bottom,0px))] lg:pb-28">
      {/* Academic Header & Curriculum Indicator */}
      <div className="flex flex-col items-center text-center space-y-2.5 max-w-xl">
        <div className="flex flex-wrap items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-wide shadow-xs">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{curriculum ? `${curriculum} Curriculum` : "Academic AI Tutor"}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold tracking-wide shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safe & Private · No Ads</span>
          </div>

          <button
            type="button"
            onClick={openAppGuide}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card/80 hover:bg-muted text-foreground/80 hover:text-foreground text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-xs min-h-[32px]"
          >
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            <span>App Guide</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-4 duration-400 delay-100">
          {greeting}
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed animate-in fade-in slide-in-from-bottom-3 duration-400 delay-150">
          {firstName
            ? `What are we mastering today, ${firstName}? Pick a learning mode or ask directly below.`
            : "What concept or problem are we mastering today? Select a learning mode or ask directly below."}
        </p>
      </div>

      {/* Continuity Widget (Resume Session or Today's Study Goal) */}
      <StudyContinuityCard
        latestThread={latestThread}
        todayPlanTask={todayPlanTask}
        disabled={isRateLimited}
        onStartPlanTask={(prompt) => {
          if (isRateLimited) {
            onUpgrade?.();
            return;
          }
          onPromptClick(prompt);
        }}
      />

      {/* Pedagogical Action Accelerators */}
      <div className="w-full flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 font-medium self-start sm:self-center">
          <Sparkles className="w-3.5 h-3.5 text-primary/70" />
          <span>How would you like to learn?</span>
        </div>
        <PedagogicalActions
          disabled={isRateLimited}
          onSelectAction={(prompt) => {
            if (isRateLimited) {
              onUpgrade?.();
              return;
            }
            onPromptClick(prompt);
          }}
        />
      </div>

      {/* Curriculum Subject Quick Launchers */}
      <CurriculumSubjectBar
        curriculum={curriculum}
        disabled={isRateLimited}
        onSelectSubjectPrompt={(prompt) => {
          if (isRateLimited) {
            onUpgrade?.();
            return;
          }
          onPromptClick(prompt);
        }}
      />
    </div>
  );
}
