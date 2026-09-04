import React, { useMemo, useContext, createContext } from "react";
import { FlashCard } from "@/client/components/cards/FlashCard";
import PracticeQuestionCard, { extractMcq } from "@/client/components/cards/PracticeQuestionCard";
import { splitPracticeChildren, extractText } from "./CalloutCards";
import { PracticeCounterCtx, InsidePracticeCardCtx } from "./MarkdownContexts";

export const ListDepthContext = createContext<number>(0);

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

export function MarkdownOl({ children, node, start, className, ...props }: any) {
  const depth = useContext(ListDepthContext);
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

  const resolvedStart = start ?? node?.properties?.start ?? undefined;

  // Hierarchical list styles:
  // depth 0: decimal (1, 2, 3...)
  // depth 1: lower-alpha (a, b, c...)
  // depth >= 2: lower-roman (i, ii, iii...)
  const depthClass =
    depth === 0
      ? "list-decimal my-3 pl-6 space-y-1.5"
      : depth === 1
        ? "list-[lower-alpha] mt-1.5 mb-1 pl-5 space-y-1"
        : "list-[lower-roman] mt-1 mb-1 pl-5 space-y-1";

  return (
    <PracticeCounterCtx.Provider value={practiceNumbers}>
      <ListDepthContext.Provider value={depth + 1}>
        <ol
          start={resolvedStart}
          className={`${depthClass} block w-full marker:text-muted-foreground marker:font-medium ${className || ""}`}
          {...props}
        >
          {children}
        </ol>
      </ListDepthContext.Provider>
    </PracticeCounterCtx.Provider>
  );
}

export function MarkdownUl({ children, className, ...props }: any) {
  const depth = useContext(ListDepthContext);

  // Hierarchical list styles:
  // depth 0: disc (•)
  // depth 1: circle (○)
  // depth >= 2: square (■)
  const depthClass =
    depth === 0
      ? "list-disc my-3 pl-6 space-y-1.5"
      : depth === 1
        ? "list-[circle] mt-1.5 mb-1 pl-5 space-y-1"
        : "list-[square] mt-1 mb-1 pl-5 space-y-1";

  return (
    <ListDepthContext.Provider value={depth + 1}>
      <ul
        className={`${depthClass} block w-full marker:text-muted-foreground/70 ${className || ""}`}
        {...props}
      >
        {children}
      </ul>
    </ListDepthContext.Provider>
  );
}

export function MarkdownLi({ children, checked, node, ...props }: any) {
  const practiceNumbers = useContext(PracticeCounterCtx);
  const insidePractice = useContext(InsidePracticeCardCtx);

  // Task-list checkbox support
  if (checked !== null && checked !== undefined) {
    return (
      <li className="flex items-start gap-3 text-[15px] sm:text-base leading-relaxed sm:leading-7 list-none -ml-2 my-1">
        <input
          type="checkbox"
          checked={checked}
          readOnly
          className="mt-1.5 h-4 w-4 rounded border-border accent-primary flex-shrink-0 cursor-default"
        />
        <span className="flex-1">{children}</span>
      </li>
    );
  }

  const text = extractText(children);

  // Quick Review Card detection
  const flashMatch = text.match(/^Front:\s*(.+?)\s+Back:\s*(.+)$/s);
  if (flashMatch) {
    return (
      <li className="list-none -mx-1 my-2">
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
      className="text-[15px] sm:text-base leading-relaxed sm:leading-7 my-0.5 [&>p]:mb-1 [&>p:last-child]:mb-0"
      style={{ display: "list-item" }}
      {...props}
    >
      {children}
    </li>
  );
}
