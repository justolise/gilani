import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import katex from "katex";

export interface McqOption {
  letter: string;
  text: string;
}

export interface ParsedMcq {
  isMcq: boolean;
  prompt: string;
  options: McqOption[];
}

export function RenderFormattedText({ text }: { text: string }) {
  if (!text) return null;
  const parts = text.split(/(\$[^$]+\$)/g);

  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          const math = part.slice(1, -1);
          try {
            const html = katex.renderToString(math, {
              throwOnError: false,
              displayMode: false,
              strict: "ignore",
            });
            return (
              <span
                key={i}
                className="inline-block align-middle mx-0.5"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return <span key={i}>{part}</span>;
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export function McqOptionGrid({
  options,
  selectedOption,
  showAnswer,
  correctOption,
  onSelectOption,
}: {
  options: McqOption[];
  selectedOption: string | null;
  showAnswer: boolean;
  correctOption?: string | null;
  onSelectOption: (letter: string) => void;
}) {
  return (
    <div className="mt-3 space-y-2">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Select an option:
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.letter;
          const isCorrect = correctOption === opt.letter;
          const isWrong = isSelected && correctOption && !isCorrect;

          let btnClass =
            "border-border/70 bg-muted/20 hover:border-primary/40 hover:bg-muted/40 text-foreground";
          let badgeClass = "bg-muted text-muted-foreground border-border";

          if (showAnswer && correctOption) {
            if (isCorrect) {
              btnClass =
                "border-emerald-500/50 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 font-semibold ring-1 ring-emerald-500/40";
              badgeClass = "bg-emerald-500 text-white border-emerald-600";
            } else if (isWrong) {
              btnClass =
                "border-red-500/50 bg-red-500/10 text-red-950 dark:text-red-200 ring-1 ring-red-500/40";
              badgeClass = "bg-red-500 text-white border-red-600";
            } else {
              btnClass = "border-border/40 bg-muted/10 text-muted-foreground/60 opacity-60";
            }
          } else if (isSelected) {
            btnClass =
              "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/40";
            badgeClass = "bg-primary text-primary-foreground border-primary";
          }

          return (
            <button
              key={opt.letter}
              type="button"
              onClick={() => onSelectOption(opt.letter)}
              className={`flex items-start gap-3 p-3 rounded-xl border text-left text-sm transition-all cursor-pointer ${btnClass}`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-lg border font-mono text-xs font-bold shrink-0 ${badgeClass}`}
              >
                {opt.letter}
              </span>
              <span className="flex-1 mt-0.5 leading-relaxed">
                <RenderFormattedText text={opt.text} />
              </span>
              {showAnswer && correctOption && isCorrect && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              )}
              {showAnswer && isWrong && (
                <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
