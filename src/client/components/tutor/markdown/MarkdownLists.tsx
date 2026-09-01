import React, { useMemo, useContext } from "react";
import { FlashCard } from "@/client/components/cards/FlashCard";
import PracticeQuestionCard, { extractMcq } from "@/client/components/cards/PracticeQuestionCard";
import { splitPracticeChildren } from "./CalloutCards";
import { PracticeCounterCtx, InsidePracticeCardCtx } from "./MarkdownContexts";

export function hastText(node: any): string {
  if (!node) return "";
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(hastText).join("");
}

export function looksLikePractice(text: string) {
  const trimmed = text.trim();
  if (/^(?:practice\s+question|question\s+\d+|[Qq]\d+[\.\:\)])/i.test(trimmed)) {
    return true;
  }
  const mcq = extractMcq(trimmed);
  if (mcq.isMcq && mcq.options.length >= 2) {
    return true;
  }
  return false;
}

export function MarkdownOl({ children, node }: any) {
  const practiceNumbers = useMemo(() => {
    const map = new Map<number, number>();
    let q = 0;
    for (const child of node?.children ?? []) {
      if (child.tagName !== "li") continue;
      if (looksLikePractice(hastText(child))) {
        const key = child.position?.start?.offset ?? -Math.random();
        map.set(key, ++q);
      }
    }
    return map;
  }, [node]);

  return (
    <PracticeCounterCtx.Provider value={practiceNumbers}>
      <ol className="list-decimal pl-6 my-4 space-y-1.5 block w-full marker:text-muted-foreground marker:font-medium [&_ol]:list-[lower-alpha] [&_ol_ol]:list-[lower-roman]">
        {children}
      </ol>
    </PracticeCounterCtx.Provider>
  );
}

export function MarkdownLi({ children, checked, node }: any) {
  const practiceNumbers = useContext(PracticeCounterCtx);
  const insidePractice = useContext(InsidePracticeCardCtx);

  // Task-list checkbox support
  if (checked !== null && checked !== undefined) {
    return (
      <li className="flex items-start gap-3 text-[15px] sm:text-base leading-relaxed sm:leading-7 list-none -ml-2">
        <input
          type="checkbox"
          checked={checked}
          readOnly
          className="mt-1.5 h-4 w-4 rounded border-border accent-primary flex-shrink-0 cursor-default"
        />
        <span>{children}</span>
      </li>
    );
  }

  const text = React.Children.toArray(children)
    .map((c) => (typeof c === "string" ? c : ((c as any)?.props?.children ?? "")))
    .join("");

  // Quick Review Card detection
  const flashMatch = text.match(/^Front:\s*(.+?)\s+Back:\s*(.+)$/s);
  if (flashMatch) {
    return (
      <li className="list-none -mx-1">
        <FlashCard front={flashMatch[1].trim()} back={flashMatch[2].trim()} />
      </li>
    );
  }

  // Practice Question Card
  if (!insidePractice && practiceNumbers && looksLikePractice(text)) {
    const offset = node?.position?.start?.offset ?? -1;
    const num = practiceNumbers.get(offset);
    const { questionNodes, answerNodes } = splitPracticeChildren(children);

    const isMultipleChoice = questionNodes.some(
      (n: any) => n?.props?.node?.tagName === "ol" || n?.props?.node?.tagName === "ul",
    );

    return (
      <InsidePracticeCardCtx.Provider value={{ isMultipleChoice, isQuestion: true }}>
        <li className="list-none -ml-6 my-2">
          <PracticeQuestionCard
            number={num}
            question={<>{questionNodes}</>}
            answer={answerNodes.length > 0 ? <>{answerNodes}</> : undefined}
            isMultipleChoice={isMultipleChoice}
          />
        </li>
      </InsidePracticeCardCtx.Provider>
    );
  }

  return (
    <li
      className="text-[15px] sm:text-base leading-relaxed sm:leading-7"
      style={{ display: "list-item" }}
    >
      {children}
    </li>
  );
}
