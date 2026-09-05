import {
  Brain,
  Save,
  Loader2,
  Calendar,
  Clock,
  Sparkles,
  Cloud,
  CheckCircle2,
  VolumeX,
  HelpCircle,
  FileText,
} from "lucide-react";
import type { useSettings } from "@/client/components/settings/hooks/useSettings";

type Props = {
  settings: ReturnType<typeof useSettings>;
};

function getDaysUntil(dateStr?: string): { days: number; text: string } | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    return { days: diffDays, text: `Exam passed (${Math.abs(diffDays)}d ago)` };
  }
  if (diffDays === 0) {
    return { days: 0, text: "Exam is today! 🎯" };
  }
  return { days: diffDays, text: `${diffDays} days until exam` };
}

export function TutorPreferencesTab({ settings }: Props) {
  const countdown = getDaysUntil(settings.preferences.targetExamDate);

  return (
    <section className="rounded-2xl border border-border/40 bg-card p-4 sm:p-6 shadow-xs space-y-6 animate-in-slide">
      {/* Header with Cloud Sync Status Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="font-serif text-xl font-bold text-foreground">Tutor Preferences</h3>
        </div>

        {/* Sync Pill */}
        <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full border border-border/60 bg-muted/40 px-3 py-1 font-mono text-[10.5px] text-muted-foreground">
          {settings.isSyncing ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span className="text-primary font-medium">Syncing to cloud...</span>
            </>
          ) : settings.lastSavedAt ? (
            <>
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                Cloud synced (
                {settings.lastSavedAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                )
              </span>
            </>
          ) : (
            <>
              <Cloud className="h-3 w-3 text-muted-foreground" />
              <span>Cloud Sync Active</span>
            </>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed -mt-2">
        Personalize how GilaniAI interacts with you during study sessions. All settings persist
        across your devices and directly modulate the tutor prompts.
      </p>

      {/* Target Exam & Countdown Tracker */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              Target Exam & Countdown
            </h4>
          </div>
          {countdown && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10.5px] font-semibold ${
                countdown.days <= 14
                  ? "bg-destructive/10 text-destructive border border-destructive/30"
                  : "bg-primary/10 text-primary border border-primary/30"
              }`}
            >
              <Clock className="h-3 w-3" />
              {countdown.text}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-foreground">Target Exam / Goal</label>
            <input
              type="text"
              placeholder="e.g. KCSE 2026, IGCSE May 2026, Mid-term"
              value={settings.preferences.targetExam || ""}
              onChange={(e) => settings.updatePreference("targetExam", e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-foreground">Exam Date</label>
            <input
              type="date"
              value={settings.preferences.targetExamDate || ""}
              onChange={(e) => settings.updatePreference("targetExamDate", e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all text-muted-foreground focus:text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Answer Formatting Style */}
      <div className="space-y-2">
        <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block">
          Response Formatting Style
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            {
              id: "socratic",
              label: "Socratic Scaffold",
              desc: "Guides step-by-step with progressive hints to build intuition.",
            },
            {
              id: "bullets",
              label: "Bulleted Takeaways",
              desc: "Concise bulleted summaries optimized for rapid revision.",
            },
            {
              id: "mark_scheme",
              label: "Mark-Scheme Style",
              desc: "Direct answers formatted strictly like exam-board marking schemes.",
            },
          ].map((style) => {
            const isSelected = (settings.preferences.answerStyle || "socratic") === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => settings.updatePreference("answerStyle", style.id)}
                className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/40"
                    : "border-border bg-background hover:bg-accent/40 hover:border-primary/20"
                }`}
              >
                <p className="text-xs font-bold">{style.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{style.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tutor Tone / Personality */}
      <div className="space-y-2">
        <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block">
          Tutor Tone & Disposition
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { id: "encouraging", label: "Encouraging", desc: "Warm, empathetic & supportive" },
            { id: "scholarly", label: "Scholarly", desc: "Academic, rigorous & formal" },
            { id: "friendly", label: "Friendly", desc: "Conversational & approachable" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => settings.setTutorTone(t.id)}
              className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                settings.tutorTone === t.id
                  ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/30"
                  : "border-border bg-background hover:bg-accent hover:border-primary/20"
              }`}
            >
              <p className="text-xs font-bold">{t.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Teaching Methodology */}
      <div className="space-y-2">
        <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block">
          Teaching Methodology
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { id: "socratic", label: "Socratic Method", desc: "Guides with questions & clues" },
            {
              id: "direct",
              label: "Direct Mentor",
              desc: "Explains theory and provides solutions",
            },
            { id: "rigorous", label: "Proofs & Derivations", desc: "Builds from first principles" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => settings.setTutorStyle(t.id)}
              className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                settings.tutorStyle === t.id
                  ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/30"
                  : "border-border bg-background hover:bg-accent hover:border-primary/20"
              }`}
            >
              <p className="text-xs font-bold">{t.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Scaffolding Depth Level */}
      <div className="space-y-2">
        <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block">
          Scaffolding Depth Level
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { id: "guided", label: "Highly Scaffolded", desc: "Small incremental hints" },
            { id: "standard", label: "Standard Paced", desc: "Standard grade level" },
            { id: "rigorous", label: "Deep Challenges", desc: "Minimal hand-holding" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => settings.setTutorDepth(t.id)}
              className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                settings.tutorDepth === t.id
                  ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/30"
                  : "border-border bg-background hover:bg-accent hover:border-primary/20"
              }`}
            >
              <p className="text-xs font-bold">{t.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-border/50" />

      {/* Student Profile Info */}
      <div className="space-y-4">
        <h4 className="font-serif text-lg font-bold text-foreground">Student Profile Details</h4>
        <p className="text-[11px] text-muted-foreground leading-relaxed -mt-2">
          Providing your grade and current subjects helps GilaniAI tailor explanations
          automatically.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Current Grade / Year</label>
            <input
              type="text"
              placeholder="e.g. Form 4, Year 11, Grade 9"
              value={settings.preferences.grade || ""}
              onChange={(e) => settings.updatePreference("grade", e.target.value)}
              className="w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Target Grade (Optional)</label>
            <input
              type="text"
              placeholder="e.g. A, Distinction, 7/7"
              value={settings.preferences.targetGrade || ""}
              onChange={(e) => settings.updatePreference("targetGrade", e.target.value)}
              className="w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Subjects Enrolled (comma separated)
          </label>
          <input
            type="text"
            placeholder="e.g. Maths, Physics, Chemistry, Biology, History"
            value={
              Array.isArray(settings.preferences.subjectsEnrolled)
                ? settings.preferences.subjectsEnrolled.join(", ")
                : ""
            }
            onChange={(e) =>
              settings.updatePreference(
                "subjectsEnrolled",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
            className="w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
          />
        </div>
      </div>

      <hr className="border-border/50" />

      {/* Active Recall & Focus Toggles */}
      <div className="space-y-4">
        <h4 className="font-serif text-lg font-bold text-foreground">
          Study & Recall Enhancements
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Response Language</label>
            <select
              value={settings.preferences.responseLanguage || "english"}
              onChange={(e) => settings.updatePreference("responseLanguage", e.target.value)}
              className="w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all cursor-pointer"
            >
              <option value="english">English Only</option>
              <option value="swahili">Swahili Only</option>
              <option value="mixed">Mixed (English / Swahili bilingual)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Math Notation Rendering</label>
            <select
              value={settings.preferences.mathRendering || "latex"}
              onChange={(e) => settings.updatePreference("mathRendering", e.target.value)}
              className="w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all cursor-pointer"
            >
              <option value="latex">Full LaTeX (Formula typesetting)</option>
              <option value="simplified">Simplified Text Notation</option>
            </select>
          </div>
        </div>

        {/* Feature Checkboxes */}
        <div className="space-y-3 pt-2">
          {/* Active Recall Check Question Toggle */}
          <label className="flex items-start gap-3 cursor-pointer group rounded-xl border border-border/30 bg-background/50 p-3 hover:bg-accent/40 transition-colors">
            <input
              type="checkbox"
              checked={settings.preferences.checkQuestionDefault ?? false}
              onChange={(e) => settings.updatePreference("checkQuestionDefault", e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary/40 cursor-pointer"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-primary" /> Conclude responses with an
                active recall check question
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Tutor will prompt you with a short comprehension question at the end of each
                explanation to test your retention.
              </span>
            </div>
          </label>

          {/* Library / Silent Mode */}
          <label className="flex items-start gap-3 cursor-pointer group rounded-xl border border-border/30 bg-background/50 p-3 hover:bg-accent/40 transition-colors">
            <input
              type="checkbox"
              checked={settings.preferences.silentMode ?? false}
              onChange={(e) => settings.updatePreference("silentMode", e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary/40 cursor-pointer"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                <VolumeX className="w-3.5 h-3.5 text-primary" /> Silent / Library Mode
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Suppresses interface audio notifications and non-essential animations for quiet
                study environments.
              </span>
            </div>
          </label>

          {/* Step-by-step Workings */}
          <label className="flex items-start gap-3 cursor-pointer group rounded-xl border border-border/30 bg-background/50 p-3 hover:bg-accent/40 transition-colors">
            <input
              type="checkbox"
              checked={settings.preferences.stepByStepDefault ?? true}
              onChange={(e) => settings.updatePreference("stepByStepDefault", e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary/40 cursor-pointer"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" /> Always show step-by-step workings
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Breaks down mathematical and scientific derivations into numbered sequential steps.
              </span>
            </div>
          </label>

          {/* Auto-save responses */}
          <label className="flex items-start gap-3 cursor-pointer group rounded-xl border border-border/30 bg-background/50 p-3 hover:bg-accent/40 transition-colors">
            <input
              type="checkbox"
              checked={settings.preferences.autoSaveResponses ?? false}
              onChange={(e) => settings.updatePreference("autoSaveResponses", e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary/40 cursor-pointer"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Auto-save study takeaways
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Automatically bookmark key formula sheets and high-yield conclusions to your Saved
                Tab.
              </span>
            </div>
          </label>
        </div>

        {/* Save Changes Button */}
        <div className="pt-3 flex items-center justify-between border-t border-border/40">
          <p className="text-[11px] text-muted-foreground">
            Changes auto-save automatically as you adjust them.
          </p>
          <button
            type="button"
            disabled={settings.busy}
            onClick={() => settings.handleProfileSave(undefined, false)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {settings.busy ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{settings.busy ? "Saving..." : "Save Now"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
