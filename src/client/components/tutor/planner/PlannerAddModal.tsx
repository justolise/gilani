import { useState } from "react";
import { Sparkles, X, Brain, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/client/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/client/components/ui/popover";
import { format } from "date-fns";

export function PlannerAddModal({
  formOptions,
  generating,
  onClose,
  onGenerate,
}: {
  formOptions: {
    plannersUsedToday: number;
    plannersMaxToday: number;
    weakTopics: string[];
  } | null;
  generating: boolean;
  onClose: () => void;
  onGenerate: (data: {
    examName: string;
    examDate?: string;
    subjects: string;
    hoursPerDay: number;
  }) => Promise<void>;
}) {
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examDateObj, setExamDateObj] = useState<Date | undefined>(undefined);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [subjects, setSubjects] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState(2);

  const handleSubmit = () => {
    onGenerate({
      examName,
      examDate: examDate || undefined,
      subjects,
      hoursPerDay,
    });
  };

  return (
    <div className="border border-border bg-card rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            New Study Plan
          </h3>
          {formOptions && formOptions.plannersMaxToday < 999_999 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {formOptions.plannersUsedToday}/{formOptions.plannersMaxToday} plans generated today
            </p>
          )}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          Exam or goal name
        </label>
        <input
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          placeholder="e.g. KCSE Mathematics Mock, Term 2 Biology CAT"
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          Exam date{" "}
          <span className="text-muted-foreground font-normal">
            (optional — leave blank for a general 14-day plan)
          </span>
        </label>
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-left focus:outline-none focus:ring-2 focus:ring-primary/40 hover:border-primary/40 transition-colors"
            >
              <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className={examDateObj ? "text-foreground" : "text-muted-foreground"}>
                {examDateObj ? format(examDateObj, "PPP") : "Pick a date"}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={examDateObj}
              onSelect={(date) => {
                setExamDateObj(date);
                setExamDate(date ? format(date, "yyyy-MM-dd") : "");
                setDatePickerOpen(false);
              }}
              disabled={{ before: new Date() }}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          Subjects / topics to cover
        </label>
        <textarea
          value={subjects}
          onChange={(e) => setSubjects(e.target.value)}
          placeholder="e.g. Algebra, Trigonometry, Cell Biology, Genetics"
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          Hours available per day:{" "}
          <span className="text-primary font-semibold">{hoursPerDay}h</span>
        </label>
        <input
          type="range"
          min={0.5}
          max={8}
          step={0.5}
          value={hoursPerDay}
          onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      {formOptions && formOptions.weakTopics.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 mb-1.5">
            <Brain className="h-3.5 w-3.5" />
            Based on your recent quizzes, you're struggling with:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {formOptions.weakTopics.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-medium"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Your plan will automatically prioritize extra time on these.
          </p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={generating}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
      >
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating your personalized plan…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Study Plan
          </>
        )}
      </button>
    </div>
  );
}
