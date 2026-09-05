import React, { useEffect, useMemo, useState } from "react";
import { UsageBanners } from "../UsageBanner";
import { PedagogicalActions } from "./PedagogicalActions";
import { CurriculumSubjectBar } from "./CurriculumSubjectBar";
import { StudyContinuityCard } from "./StudyContinuityCard";
import { useContinuityData } from "./hooks/useContinuityData";
import { GraduationCap, Sparkles } from "lucide-react";

interface TutorHomeCockpitProps {
  onPromptClick: (prompt: string) => void;
  chatError?: string | null;
  isRateLimited?: boolean;
  messagesUsed?: number;
  messagesMax?: number;
  onUpgrade?: () => void;
  onRateLimitExpired?: () => void;
  userName?: string | null;
  curriculum?: string | null;
  userId?: string | null;
  activeInput?: string;
  onInputChange?: (text: string) => void;
}

export function TutorHomeCockpit({
  onPromptClick,
  chatError,
  isRateLimited,
  messagesUsed = 0,
  messagesMax,
  onUpgrade,
  onRateLimitExpired,
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
    <div className="w-full flex-1 flex flex-col items-center justify-start overflow-y-auto px-4 sm:px-6 py-6 sm:py-8 gap-6 sm:gap-8 max-w-4xl mx-auto animate-in fade-in duration-300 pb-36 lg:pb-28">
      {/* Usage & Rate Limit Banners */}
      <UsageBanners
        chatError={chatError}
        onUpgrade={onUpgrade}
        onRateLimitExpired={onRateLimitExpired}
        messagesUsed={messagesUsed}
        messagesMax={messagesMax}
        isRateLimited={isRateLimited}
        className="w-full max-w-2xl"
      />

      {/* Academic Header & Curriculum Indicator */}
      <div className="flex flex-col items-center text-center space-y-2 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-wide">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>{curriculum ? `${curriculum} Curriculum` : "Academic AI Tutor"}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
          {greeting}
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
          What concept or problem are we mastering today? Select a learning mode or ask directly
          below.
        </p>
      </div>

      {/* Continuity Widget (Resume Session or Today's Study Goal) */}
      <StudyContinuityCard
        latestThread={latestThread}
        todayPlanTask={todayPlanTask}
        onStartPlanTask={onPromptClick}
      />

      {/* Pedagogical Action Accelerators */}
      <div className="w-full flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 font-medium self-start sm:self-center">
          <Sparkles className="w-3.5 h-3.5 text-primary/70" />
          <span>How would you like to learn?</span>
        </div>
        <PedagogicalActions onSelectAction={onPromptClick} />
      </div>

      {/* Curriculum Subject Quick Launchers */}
      <CurriculumSubjectBar curriculum={curriculum} onSelectSubjectPrompt={onPromptClick} />
    </div>
  );
}
