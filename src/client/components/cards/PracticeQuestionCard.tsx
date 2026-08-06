import React, { useState } from "react";
import { CircleHelp, Lightbulb } from "lucide-react";
import { InsidePracticeCardCtx } from "../tutor/MarkdownRenderer";

interface Props {
  question: React.ReactNode;
  answer?: React.ReactNode;
  number?: number;
  isMultipleChoice?: boolean;
}

export default function PracticeQuestionCard({ question, answer, number }: Props) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <InsidePracticeCardCtx.Provider value={{ isQuestion: true, isMultipleChoice: false }}>
      <section className="my-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border/40 bg-muted/20 px-4 py-2.5">
          <CircleHelp className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {number != null ? `Practice Question ${number}` : "Practice Question"}
          </span>
        </div>

        {/* Question body */}
        <div className="p-4 text-sm text-foreground leading-relaxed">{question}</div>

        {/* Answer section */}
        {answer && (
          <>
            {!showAnswer ? (
              <div className="border-t border-border/40 px-4 py-3">
                <button
                  onClick={() => setShowAnswer(true)}
                  className="w-full rounded-lg border border-border bg-muted/30 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/60"
                >
                  Show Answer
                </button>
              </div>
            ) : (
              <div className="border-t border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-primary/10">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Answer
                  </span>
                </div>
                <div className="p-4 text-sm text-foreground leading-relaxed">{answer}</div>
              </div>
            )}
          </>
        )}
      </section>
    </InsidePracticeCardCtx.Provider>
  );
}
