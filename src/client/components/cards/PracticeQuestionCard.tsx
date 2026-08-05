import React, { useState } from "react";
import { CircleHelp, Lightbulb, RotateCcw } from "lucide-react";
import { InsidePracticeCardCtx, extractText } from "../tutor/MarkdownRenderer";
import { QuizOptionButton, type QuizOptionState } from "../tutor/quiz/QuizOptionButton";
import { cn } from "@/shared/utils/utils";

interface Props {
  question: React.ReactNode;
  answer?: React.ReactNode;
  number?: number;
  isMultipleChoice?: boolean;
}

export default function PracticeQuestionCard({
  question,
  answer,
  number,
  isMultipleChoice,
}: Props) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [flipped, setFlipped] = useState(false);

  const answerText = answer ? extractText(answer).toLowerCase() : "";

  // Try to parse the correct index from answer (e.g. "answer: a", "answer: 1")
  let correctIndex: number | null = null;
  const matchA = answerText.match(/answer:\s*([a-e])/i);
  if (matchA) {
    correctIndex = matchA[1].charCodeAt(0) - 97; // a -> 0
  } else {
    const match1 = answerText.match(/answer:\s*([1-5])/i);
    if (match1) {
      correctIndex = parseInt(match1[1]) - 1; // 1 -> 0
    }
  }

  const handleSelect = (idx: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(idx);
    setShowAnswer(true);
  };

  const getOptionState = (index: number): QuizOptionState => {
    if (selectedIndex === null) return "default";
    if (index === selectedIndex && index === correctIndex) return "selected-correct";
    if (index === selectedIndex) return "selected-incorrect";
    if (index === correctIndex) return "reveal-correct";
    return "disabled";
  };

  const childrenArray =
    React.isValidElement(question) && (question as any).props.children
      ? React.Children.toArray((question as any).props.children)
      : React.Children.toArray(question);

  const enhancedQuestion = isMultipleChoice
    ? childrenArray.map((child: any, idx) => {
        if (
          React.isValidElement(child) &&
          ((child.props as any)?.node?.tagName === "ol" ||
            (child.props as any)?.node?.tagName === "ul")
        ) {
          const options = React.Children.toArray((child.props as any).children).filter(
            (c: any) => React.isValidElement(c) && (c.props as any).node?.tagName === "li",
          );

          return (
            <div className="space-y-3 my-5" key={idx}>
              {options.map((opt: any, i) => (
                <QuizOptionButton
                  key={i}
                  index={i}
                  state={getOptionState(i)}
                  label={<>{opt.props.children}</>}
                  onClick={() => handleSelect(i)}
                />
              ))}
            </div>
          );
        }
        return child;
      })
    : question;

  const isCorrect = selectedIndex !== null && selectedIndex === correctIndex;

  if (!isMultipleChoice) {
    return (
      <InsidePracticeCardCtx.Provider value={{ isQuestion: true, isMultipleChoice: false }}>
        <div className="group perspective-1000 my-4 h-full w-full min-h-[200px]">
          <div
            className={cn(
              "relative h-full w-full rounded-2xl transition-all duration-500 transform-style-3d shadow-sm",
              flipped ? "rotate-y-180" : "",
            )}
          >
            {/* Front of card */}
            <div className="absolute inset-0 backface-hidden">
              <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <CircleHelp className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {number != null ? `Question ${number}` : "Try Yourself"}
                    </span>
                  </div>
                  {answer && (
                    <button
                      onClick={() => setFlipped(true)}
                      className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary/20"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Flip
                    </button>
                  )}
                </div>
                <div className="flex-1 space-y-4 p-5">
                  <div className="text-[15px] font-medium text-foreground leading-relaxed">
                    {question}
                  </div>
                </div>
              </section>
            </div>

            {/* Back of card */}
            <div className="absolute inset-0 rotate-y-180 backface-hidden">
              <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-primary/20 bg-primary/5">
                <div className="flex items-center justify-between border-b border-primary/10 bg-primary/10 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Answer
                    </span>
                  </div>
                  <button
                    onClick={() => setFlipped(false)}
                    className="flex items-center gap-1.5 rounded-full bg-background/50 px-3 py-1 text-xs font-semibold text-foreground transition hover:bg-background"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Back
                  </button>
                </div>
                <div className="flex-1 p-5 overflow-auto">
                  <div className="text-[15px] text-foreground leading-relaxed">{answer}</div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </InsidePracticeCardCtx.Provider>
    );
  }

  return (
    <InsidePracticeCardCtx.Provider value={{ isQuestion: true, isMultipleChoice: true }}>
      <section className="my-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b border-border/40 bg-muted/20 px-5 py-3">
          <CircleHelp className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            {number != null ? `Question ${number}` : "Practice Question"}
          </span>
        </div>
        <div className="space-y-5 p-5">
          <div className="text-lg font-bold text-foreground leading-snug [&>p]:m-0 [&>p]:text-lg [&>p]:font-bold [&>p]:text-foreground [&>p]:leading-snug">
            {enhancedQuestion}
          </div>

          {showAnswer && answer && (
            <div
              className={cn(
                "p-4 rounded-2xl border mt-4 animate-in slide-in-from-top-2 fade-in duration-300",
                isCorrect
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : selectedIndex !== null
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-muted/30 border-border",
              )}
            >
              <div className="flex items-center gap-2 mb-2 font-semibold text-sm text-foreground">
                <Lightbulb className="h-4 w-4" />
                {isCorrect
                  ? "Correct! Here's why:"
                  : selectedIndex !== null
                    ? "Not quite — here's the explanation:"
                    : "Answer:"}
              </div>
              <div className="text-[15px] text-foreground/90 leading-relaxed">{answer}</div>
            </div>
          )}

          {!showAnswer && answer && (
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowAnswer(true)}
                className="rounded-xl border border-border bg-muted/30 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted/60"
              >
                Reveal Answer
              </button>
            </div>
          )}
        </div>
      </section>
    </InsidePracticeCardCtx.Provider>
  );
}
