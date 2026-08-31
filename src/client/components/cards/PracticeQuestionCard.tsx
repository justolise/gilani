import React, { useState, useMemo } from "react";
import {
  CircleHelp,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Pencil,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  Check,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { InsidePracticeCardCtx, extractText } from "../tutor/MarkdownRenderer";

interface Props {
  question: React.ReactNode;
  answer?: React.ReactNode;
  number?: number;
  isMultipleChoice?: boolean;
}

const COMMAND_VERBS = [
  "Calculate",
  "Determine",
  "Explain",
  "Describe",
  "Derive",
  "Prove",
  "Show",
  "Evaluate",
  "Solve",
  "Simplify",
  "State",
  "Identify",
  "Compare",
  "Differentiate",
  "Sketch",
  "List",
  "Define",
];

export default function PracticeQuestionCard({
  question,
  answer,
  number,
  isMultipleChoice = false,
}: Props) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  const [userDraft, setUserDraft] = useState("");
  const [selfAssessment, setSelfAssessment] = useState<"correct" | "partial" | "review" | null>(
    null,
  );

  // Extract raw text for intelligent metadata extraction
  const questionText = useMemo(() => extractText(question), [question]);
  const answerText = useMemo(() => (answer ? extractText(answer) : ""), [answer]);

  // Extract marks allocation (e.g. "(3 marks)" or "[4 Marks]")
  const marksMatch = useMemo(() => {
    const m = questionText.match(/(?:\((\d+)\s*marks?\)|\[(\d+)\s*marks?\])/i);
    return m ? m[1] || m[2] : null;
  }, [questionText]);

  // Extract command verb tag
  const commandVerb = useMemo(() => {
    for (const verb of COMMAND_VERBS) {
      if (new RegExp(`\\b${verb}\\b`, "i").test(questionText)) {
        return verb;
      }
    }
    return null;
  }, [questionText]);

  // Detect MCQ options (A, B, C, D)
  const isMCQ = useMemo(() => {
    if (isMultipleChoice) return true;
    return /\b[A-D]\)\s+[^\n]+/i.test(questionText) || /\bOption\s+[A-D]\b/i.test(questionText);
  }, [isMultipleChoice, questionText]);

  // Detect correct option letter in answer text (e.g. "Answer: B" or "**(B)**" or "Option C")
  const correctOption = useMemo(() => {
    if (!isMCQ || !answerText) return null;
    const match = answerText.match(
      /(?:Answer|Option|Correct(?:\s+Answer)?)\s*[:\-]?\s*\(?([A-D])\)?/i,
    );
    if (match) return match[1].toUpperCase();
    const bareMatch = answerText.match(/\b([A-D])\b/);
    return bareMatch ? bareMatch[1].toUpperCase() : null;
  }, [isMCQ, answerText]);

  const handleSelfAssessment = (type: "correct" | "partial" | "review") => {
    setSelfAssessment(type);
    if (type === "correct") {
      toast.success("Awesome job! Marked as understood.");
    } else if (type === "partial") {
      toast.info("Good effort! Review the method steps below.");
    } else {
      toast.info("Saved to review. You can ask your tutor for another practice variation!");
    }
  };

  const handleReset = () => {
    setShowAnswer(false);
    setSelectedOption(null);
    setUserDraft("");
    setSelfAssessment(null);
    setScratchpadOpen(false);
  };

  return (
    <InsidePracticeCardCtx.Provider value={{ isQuestion: true, isMultipleChoice: isMCQ }}>
      <section className="my-4 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 bg-muted/30 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CircleHelp className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
              {number != null ? `Practice Question ${number}` : "Practice Question"}
            </span>
            {isMCQ && (
              <span className="rounded-md bg-secondary/80 px-2 py-0.5 font-mono text-[11px] font-medium text-secondary-foreground">
                MCQ
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {commandVerb && (
              <span className="rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-semibold text-primary">
                {commandVerb}
              </span>
            )}
            {marksMatch && (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Award className="h-3 w-3" />
                {marksMatch} {Number(marksMatch) === 1 ? "Mark" : "Marks"}
              </span>
            )}
          </div>
        </div>

        {/* Question Body */}
        <div className="p-4 sm:p-5 text-[15px] sm:text-base text-foreground leading-relaxed">
          {question}

          {/* Interactive MCQ Choice Pills (if detected) */}
          {isMCQ && (
            <div className="mt-4 pt-3 border-t border-border/40">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Select Your Answer:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["A", "B", "C", "D"].map((opt) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = correctOption === opt;
                  let btnStyle =
                    "border-border/80 bg-muted/20 text-foreground hover:bg-muted/50 hover:border-border";

                  if (showAnswer && correctOption) {
                    if (isCorrect) {
                      btnStyle =
                        "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold ring-2 ring-emerald-500/20";
                    } else if (isSelected && !isCorrect) {
                      btnStyle =
                        "border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-400 line-through opacity-80";
                    } else {
                      btnStyle = "border-border/40 bg-muted/10 text-muted-foreground opacity-60";
                    }
                  } else if (isSelected) {
                    btnStyle =
                      "border-primary bg-primary/10 text-primary font-bold ring-2 ring-primary/20";
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSelectedOption(opt);
                        if (!showAnswer) {
                          // Allow quick answer checking on selection if answer exists
                          if (answer) {
                            setShowAnswer(true);
                          }
                        }
                      }}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all active:scale-98 ${btnStyle}`}
                    >
                      <span className="font-mono font-bold">({opt})</span>
                      {showAnswer && isCorrect && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      )}
                      {showAnswer && isSelected && !isCorrect && (
                        <XCircle className="h-4 w-4 text-rose-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Scratchpad (Open-Ended / Normal Questions) */}
        {!isMCQ && (
          <div className="px-4 sm:px-5 pb-2">
            {!scratchpadOpen ? (
              <button
                type="button"
                onClick={() => setScratchpadOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline underline-offset-4"
              >
                <Pencil className="h-3.5 w-3.5" />
                Try answering before checking solution
              </button>
            ) : (
              <div className="rounded-xl border border-border/80 bg-muted/20 p-3 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Pencil className="h-3.5 w-3.5 text-primary" />
                    Your Scratchpad / Attempt:
                  </span>
                  <button
                    type="button"
                    onClick={() => setScratchpadOpen(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Hide
                  </button>
                </div>
                <textarea
                  value={userDraft}
                  onChange={(e) => setUserDraft(e.target.value)}
                  placeholder="Type your workings or answer here..."
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}
          </div>
        )}

        {/* Action / Answer Section */}
        {answer && (
          <>
            {!showAnswer ? (
              <div className="border-t border-border/40 px-4 sm:px-5 py-3 bg-muted/10">
                <button
                  type="button"
                  onClick={() => setShowAnswer(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20 transition-all active:scale-99 shadow-xs"
                >
                  <Sparkles className="h-4 w-4" />
                  Show Worked Solution
                </button>
              </div>
            ) : (
              <div className="border-t border-primary/20 bg-primary/5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-b border-primary/15 bg-primary/10">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Worked Solution & Explanation
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    title="Reset practice card"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                </div>

                {/* Display Student's Draft side-by-side if they drafted one */}
                {userDraft && (
                  <div className="mx-4 sm:mx-5 mt-3 p-3 rounded-xl border border-border bg-card/60 text-xs">
                    <div className="font-semibold text-muted-foreground mb-1">Your Attempt:</div>
                    <div className="text-foreground whitespace-pre-wrap">{userDraft}</div>
                  </div>
                )}

                {/* Solution Content */}
                <div className="p-4 sm:p-5 text-[15px] sm:text-base text-foreground leading-relaxed">
                  {answer}
                </div>

                {/* Self-Assessment Reflection Chips */}
                <div className="px-4 sm:px-5 pb-4 pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-primary/10">
                  <span className="text-xs font-medium text-muted-foreground">How did you do?</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSelfAssessment("correct")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        selfAssessment === "correct"
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
                          : "bg-background hover:bg-emerald-500/10 border-border text-foreground hover:text-emerald-600"
                      }`}
                    >
                      <Check className="h-3 w-3" />
                      Got it right
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelfAssessment("partial")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        selfAssessment === "partial"
                          ? "bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400 font-bold"
                          : "bg-background hover:bg-amber-500/10 border-border text-foreground hover:text-amber-600"
                      }`}
                    >
                      Partially
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelfAssessment("review")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        selfAssessment === "review"
                          ? "bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400 font-bold"
                          : "bg-background hover:bg-rose-500/10 border-border text-foreground hover:text-rose-600"
                      }`}
                    >
                      Need practice
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </InsidePracticeCardCtx.Provider>
  );
}
