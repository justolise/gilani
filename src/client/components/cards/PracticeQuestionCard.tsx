import React, { useState, useMemo } from "react";
import { CircleHelp, Award } from "lucide-react";
import { toast } from "sonner";
import { InsidePracticeCardCtx, extractText } from "../tutor/MarkdownRenderer";
import {
  McqOptionGrid,
  RenderFormattedText,
  type McqOption,
  type ParsedMcq,
} from "./practice/McqOptionGrid";
import { PracticeScratchpad } from "./practice/PracticeScratchpad";
import { PracticeAnswerReveal } from "./practice/PracticeAnswerReveal";

export type { McqOption, ParsedMcq };

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

export function extractMcq(text: string): ParsedMcq {
  if (!text) return { isMcq: false, prompt: "", options: [] };

  const optionRegex =
    /(?:^|\s+|\n)(?:[\-\*]\s+)?(?:\(?\*?\*?([A-D])\*?\*?\)|\b\*?\*?([A-D])\*?\*?[\.\:\)]|\[\*?\*?([A-D])\*?\*?\]|Option\s+([A-D])[\:\.\)]?)\s*[\)\.\:]?\s*([^\n]+?)(?=(?:\s+(?:[\-\*]\s+)?(?:\(?\*?\*?[A-D]\*?\*?\)|\b\*?\*?[A-D]\*?\*?[\.\:\)]|\[\*?\*?[A-D]\*?\*?\]|Option\s+[A-D])[\)\.\:]?\s*)|$)/gi;

  const matches = [...text.matchAll(optionRegex)];
  const letters = matches.map((m) => (m[1] || m[2] || m[3] || m[4]).toUpperCase());
  const isSequential = letters.includes("A") && letters.includes("B");

  if (!isSequential || matches.length < 2) {
    return { isMcq: false, prompt: text, options: [] };
  }

  const firstIdx = matches[0].index ?? 0;
  const prompt = text.substring(0, firstIdx).trim();
  const options = matches.map((m) => ({
    letter: (m[1] || m[2] || m[3] || m[4]).toUpperCase(),
    text: m[5]
      .replace(/^\*\*\s*/, "")
      .replace(/\s*\*\*$/, "")
      .trim(),
  }));

  return { isMcq: true, prompt, options };
}

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

  const questionText = useMemo(() => extractText(question), [question]);
  const answerText = useMemo(() => (answer ? extractText(answer) : ""), [answer]);

  const marksMatch = useMemo(() => {
    const m = questionText.match(/(?:\((\d+)\s*marks?\)|\[(\d+)\s*marks?\])/i);
    return m ? m[1] || m[2] : null;
  }, [questionText]);

  const commandVerb = useMemo(() => {
    for (const verb of COMMAND_VERBS) {
      if (new RegExp(`\\b${verb}\\b`, "i").test(questionText)) {
        return verb;
      }
    }
    return null;
  }, [questionText]);

  const parsedMcq = useMemo(() => extractMcq(questionText), [questionText]);
  const isMCQ = isMultipleChoice || parsedMcq.isMcq;

  const correctOption = useMemo(() => {
    if (!isMCQ || !answerText) return null;
    const match = answerText.match(
      /(?:Answer|Option|Correct(?:\s+Answer)?)\s*[:\-]?\s*\(?([A-D])\)?/i,
    );
    if (match) return match[1].toUpperCase();
    const bareMatch = answerText.match(/\b([A-D])\b/);
    return bareMatch ? bareMatch[1].toUpperCase() : null;
  }, [isMCQ, answerText]);

  const handleSelectOption = (opt: string) => {
    setSelectedOption(opt);
    if (answer) {
      setShowAnswer(true);
      if (correctOption) {
        if (opt === correctOption) {
          toast.success(`Correct! (${opt}) is the right answer.`, { duration: 3500 });
        } else {
          toast.error(`Not quite! (${opt}) is incorrect. Correct answer is (${correctOption}).`, {
            duration: 4000,
          });
        }
      }
    }
  };

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
                Multiple Choice
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
          {parsedMcq.isMcq && parsedMcq.prompt ? (
            <div className="font-medium text-foreground mb-3">
              <RenderFormattedText text={parsedMcq.prompt} />
            </div>
          ) : (
            <div className="mb-3">{question}</div>
          )}

          {parsedMcq.isMcq && parsedMcq.options.length > 0 && (
            <McqOptionGrid
              options={parsedMcq.options}
              selectedOption={selectedOption}
              showAnswer={showAnswer}
              correctOption={correctOption}
              onSelectOption={handleSelectOption}
            />
          )}
        </div>

        {/* Scratchpad (Open-Ended / Normal Questions) */}
        {!isMCQ && (
          <PracticeScratchpad
            open={scratchpadOpen}
            onOpenChange={setScratchpadOpen}
            draft={userDraft}
            onDraftChange={setUserDraft}
            hasAnswer={Boolean(answer)}
            onShowAnswer={() => setShowAnswer(true)}
            questionNumber={number}
            questionText={questionText}
          />
        )}

        {/* Action / Answer Section */}
        <PracticeAnswerReveal
          answer={answer}
          showAnswer={showAnswer}
          userDraft={userDraft}
          selfAssessment={selfAssessment}
          onShowAnswer={() => setShowAnswer(true)}
          onReset={handleReset}
          onSelfAssessment={handleSelfAssessment}
          questionNumber={number}
          questionText={questionText}
        />
      </section>
    </InsidePracticeCardCtx.Provider>
  );
}
